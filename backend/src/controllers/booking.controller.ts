import { Request, Response } from "express";
import "dotenv/config";
import Booking from "../models/booking.model";
import Hotel from "../models/hotel.model";
import User from "../models/user.model";
import { sendBookingMail } from '../utils/NodeMailer';
import { BookingType } from "../types/types";
import { createPDF } from "../utils/PDF Creator";
import { createBookingMail } from "../utils/BookingMailCreator";
import { Attachment } from "nodemailer/lib/mailer";
import { retrievePaymentId, sessionPayment } from "../utils/StripePayment";
import Restaurant from "../models/restaurant.model";
import '../interfaces/session.interface';
import fs from 'fs'

interface CustomRequest extends Request {
    userId: string;
}

export const checkout = async (req: Request, res: Response) => {
    try {
        const { hotelId, restaurantId } = req.body;
        if (hotelId) {
            const paymentData = req.body;
            const existingBookings = await Booking.find({
                hotelId: paymentData.hotelId,
                bookingStatus: { $ne: `cancelled` },
                $or: [
                    { $and: [{ checkIn: { $lt: paymentData.checkOut } }, { checkOut: { $gt: paymentData.checkIn } }] },
                    { $and: [{ checkIn: { $gte: paymentData.checkIn } }, { checkOut: { $lte: paymentData.checkOut } }] }
                ]
            });

            let totalBookedRooms = 0;
            existingBookings.forEach(booking => {
                if (booking.roomDetails.roomType === paymentData.roomType) {
                    totalBookedRooms += booking.roomDetails.roomCount;
                }
            });
            const hotelData = await Hotel.findOne({ _id: paymentData.hotelId });

            if (hotelData) {
                const roomData = hotelData.roomTypes.find(room => room.type === paymentData.roomType);
                if (roomData) {
                    const remainingRooms = roomData.quantity - totalBookedRooms;
                    if (remainingRooms < paymentData.roomCount) {
                        return res.status(500).json({ error: "Requirement unavailable" });
                    }
                }
            }

            req.session.paymentData = paymentData;
            const hotel = await Hotel.findById(paymentData.hotelId);
            if (hotel)  {
                const name = `${hotel.name}, ${hotel.city}, ${hotel.country}`;
                const description = `
            Rooms: ${paymentData.roomType} Bed, ₹${paymentData.roomPrice}, ${paymentData.roomCount}Nos, 
            Guests: ${paymentData.adultCount} Adults, ${paymentData.childCount} Children, 
            Check-In: ${paymentData.checkIn.toLocaleString()},
            Check-Out: ${paymentData.checkOut.toLocaleString()}`;
                const unit_amount = paymentData.roomPrice * paymentData.nightsPerStay * 100;
                const quantity = paymentData.roomCount;
                const success_url = `${process.env.BACKEND_URL}/api/user/booking/payment-result?session_id={CHECKOUT_SESSION_ID}`;
                const cancel_url = `${process.env.FRONTEND_URL}`;
                sessionPayment(req, res, name, description, unit_amount, quantity, success_url, cancel_url);
            }
        } else if (restaurantId) {
            const paymentData = req.body;
            const date = new Date(paymentData.dateOfBooking);
            date.setHours(0, 0, 0, 0);
            
            const result = await Booking.aggregate([
                {
                    $match: {
                        "foodDetails.foodItem": paymentData.foodItem,
                        // "dateOfBooking": { $eq: date }
                    }
                },
                {
                    $group: {
                        _id: "$foodDetails.foodItem",
                        totalGuests: { $sum: "$guestCount" }
                    }
                }
            ]);
            if (result.length > 0) {
                if (result[0].totalGuests >= paymentData.foodCount)
                    console.log(result[0].totalGuests);
                return res.status(500).json({ error: "Requirement unavailable" });
            }

            req.session.paymentData = paymentData;
            const restaurant = await Restaurant.findById(paymentData.restaurantId);
            if (restaurant) {
                const name = `${restaurant.name}, ${restaurant.city}, ${restaurant.country}`;
                const description = `
            Food Item: ${paymentData.foodItem} of ₹${paymentData.foodPrice} for ${paymentData.guestCount} guests, 
            Date of Booking: ${paymentData.dateOfBooking.toLocaleString()}`;
                const unit_amount = paymentData.foodPrice * 100;
                const quantity = paymentData.guestCount;
                const success_url = `${process.env.BACKEND_URL}/api/user/booking/payment-result?session_id={CHECKOUT_SESSION_ID}`;
                const cancel_url = `${process.env.FRONTEND_URL}`;
                sessionPayment(req, res, name, description, unit_amount, quantity, success_url, cancel_url);
            }
        }

    } catch (error) {
        console.log("Error in booking", error);
        return res.status(500).send({ message: "Something went wrong!" });
    }
};

export const loadCheckoutResult = async (req: Request, res: Response) => {
    try {
        const { hotelId, restaurantId } = req.session.paymentData;
        if (hotelId) {
            const paymentData = req.session.paymentData;
            const sessionId = req.query.session_id;
            const paymentIntentId = await retrievePaymentId(sessionId as string);
            const roomDetails = {
                roomType: paymentData.roomType,
                roomPrice: paymentData.roomPrice,
                roomCount: paymentData.roomCount
            }

            const newBooking = new Booking({
                userId: req.userId,
                hotelId: paymentData.hotelId,
                adultCount: paymentData.adultCount,
                childCount: paymentData.childCount,
                checkIn: new Date(paymentData.checkIn).toDateString(),
                checkOut: new Date(paymentData.checkOut).toDateString(),
                roomDetails,
                totalCost: paymentData.roomPrice * paymentData.nightsPerStay * paymentData.roomCount,
                paymentId: paymentIntentId,
                bookingDate: new Date(),
                bookingStatus: "active",
            });
            await newBooking.save();

            const user = await User.findOne({ _id: req.userId });
            const hotel = await Hotel.findOne({ _id: paymentData.hotelId });
            if (hotel && user && newBooking) {
                const pdfBuffer = await createPDF(newBooking, user, hotel);
                const recipientEmail = user.email;
                const subject = `Confirmation of Your Hotel Booking - [${newBooking._id}]`;
                const attachments: Attachment[] = [{
                    filename: `wanderlust_booking_id_${newBooking._id}.pdf`,
                    content: pdfBuffer
                }];
                const emailContent = createBookingMail(newBooking, user, hotel);
                if (emailContent) {
                    sendBookingMail(res, recipientEmail, subject, emailContent, attachments);
                    res.redirect(`${process.env.FRONTEND_URL}/home/${newBooking._id}/order-result-page`)
                }
            }
        } else if (restaurantId) {
            const paymentData = req.session.paymentData;
            const sessionId = req.query.session_id;
            const paymentIntentId = await retrievePaymentId(sessionId as string);
            const foodDetails = {
                foodItem: paymentData.foodItem,
                foodPrice: paymentData.foodPrice,
                foodCount: paymentData.foodCount
            }

            const newBooking = new Booking({
                userId: req.userId,
                restaurantId: paymentData.restaurantId,
                guestCount: paymentData.guestCount,
                dateOfBooking: new Date(paymentData.dateOfBooking).toDateString(),
                foodDetails,
                totalCost: paymentData.foodPrice * paymentData.guestCount,
                paymentId: paymentIntentId,
                bookingDate: new Date().toDateString(),
                bookingStatus: "active",
            });
            await newBooking.save();

            const user = await User.findOne({ _id: req.userId });
            const restaurant = await Restaurant.findOne({ _id: paymentData.restaurantId });
            if (restaurant && user && newBooking) {
                const pdfBuffer = await createPDF(newBooking, user, undefined, restaurant);
                const recipientEmail = user.email;
                const subject = `Confirmation of Your Restaurant Booking - [${newBooking._id}]`;
                const attachments: Attachment[] = [{
                    filename: `wanderlust_booking_id_${newBooking._id}.pdf`,
                    content: pdfBuffer
                }];
                const emailContent = createBookingMail(newBooking, user, undefined, restaurant);
                if (emailContent) {
                    sendBookingMail(res, recipientEmail, subject, emailContent, attachments);
                    res.redirect(`${process.env.FRONTEND_URL}/home/${newBooking._id}/order-result-page`);
                }
            }
        }

    } catch (error) {
        console.log("Error in saving booking data", error);
        return res.status(500).send({ message: "Something went wrong!" });
    }
};

export const bookings = async (req: Request, res: Response) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const bookingsToUpdate = await Booking.find({
            $or: [
                { checkIn: { $lte: today } },
                { dateOfBooking: { $lte: today } }
            ],
            bookingStatus: { $ne: "Booking Confirmed" }
        });

        await Promise.all(bookingsToUpdate.map(async (booking) => {
            booking.bookingStatus = "Booking Confirmed";
            await booking.save();
        }));

        const { bookingId } = req.query;
        let allBookings: BookingType[] = [];

        if (bookingId && (bookingId?.length === 24)) {
            const bookings = await Booking.find({ _id: bookingId, userId: req.userId }).populate("hotelId").populate("restaurantId");
            allBookings = bookings;

        } else {
            const bookings = await Booking.find({userId: req.userId}).populate("hotelId").populate("restaurantId");
            allBookings = bookings;
        }

        const sortedBookings = allBookings
            .sort((a, b) => new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime())
            .slice(0, 4);
        res.json(sortedBookings);
    } catch (error) {
        console.log("Error in loading user bookings", error);
        return res.status(500).send({ message: "Something went wrong!" });
    }
};

export const cancelBooking = async (req: Request, res: Response) => {
    try {
        const { bookingId } = req.params;
        const date = new Date().toDateString();
        const updateBooking = await Booking.findOneAndUpdate({ _id: bookingId }, { bookingStatus: 'cancelled', cancellationDate: date }, { new: true });
        res.json(updateBooking);

    } catch (error) {
        console.log("Error in cancelling user booking", error);
        return res.status(500).send({ message: "Something went wrong!" });
    }
};

export const downloadDoc = async (req: Request, res: Response) => {
    try {
        const { bookingId } = req.params;
        const booking = await Booking.findOne({ _id: bookingId });
        if (!booking) {
            res.status(404).send({ message: "Booking not found" });
            return;
        }
        const hotel = await Hotel.findOne({ _id: booking.hotelId });
        const restaurant = await Restaurant.findOne({ _id: booking.restaurantId });
        const user = await User.findOne({ _id: req.userId });

        if (user && hotel && booking) {
            const pdfBuffer = await createPDF(booking, user, hotel);
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=wanderlust_booking_id_${bookingId}.pdf`);
            res.send(pdfBuffer);
        }
        if (user && booking && restaurant) {
            const pdfBuffer = createPDF(booking, user, undefined, restaurant);
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=wanderlust_booking_id_${bookingId}.pdf`);
            res.send(pdfBuffer);
        }
    } catch (error) {
        console.log("Error in downloading payment receipt", error);
        res.status(500).send({ message: "Something went wrong!" });
    }
};