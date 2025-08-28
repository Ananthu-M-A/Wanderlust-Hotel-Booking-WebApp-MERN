import { BookingType, HotelType, RestaurantType, UserType } from "../types/types";
import { Request, Response } from "express";
import "dotenv/config";

export const createBookingMail = (newBooking: BookingType, user: UserType, hotel?: HotelType, restaurant?: RestaurantType) => {
    try {
        const { firstName, lastName } = user;
        const { name: hotelName, city: hotelCity, country: hotelCountry } = hotel || {};
        const { name: restaurantName, city: restaurantCity, country: restaurantCountry } = restaurant || {};

        const emailContent = `
    Dear ${firstName ?? ''} ${lastName ?? ''},

    We are thrilled to confirm your reservation at ${hotelName || restaurantName}! Your comfort and satisfaction are our top priorities, and we are excited to host you during your upcoming visit.

    Here are the details of your booking:

    ${hotel ?
                `Reservation ID: ${newBooking._id}
    Guest Name: ${firstName ?? ''} ${lastName ?? ''}
    ${newBooking.checkIn ? `Check-in Date: ${new Date(newBooking.checkIn).toLocaleDateString()} 02:00:00 PM` : ''}
    ${newBooking.checkOut ? `Check-out Date: ${new Date(newBooking.checkOut).toLocaleDateString()} 12:00:00 PM` : ''}
    ${newBooking.roomDetails.roomType && newBooking.roomDetails.roomPrice && newBooking.roomDetails.roomCount ?
                    `Room Detail: ${newBooking.roomDetails.roomType} Bed Room, ₹${newBooking.roomDetails.roomPrice}, ${newBooking.roomDetails.roomCount} Nos` : ''
                }
    ${newBooking.adultCount && newBooking.childCount ?
                    `Number of Guests: ${newBooking.adultCount + newBooking.childCount}` : ''
                }
    `:
                `Reservation ID: ${newBooking._id}
                Guest Name: ${firstName ?? ''} ${lastName ?? ''}
                ${newBooking.dateOfBooking ? `Booked Date: ${new Date(newBooking.dateOfBooking).toLocaleDateString()} 02:00:00 PM` : ''}
                ${newBooking.foodDetails.foodItem && newBooking.foodDetails.foodPrice && newBooking.guestCount ?
                    `Food Detail: ${newBooking.foodDetails.foodItem}, ₹${newBooking.foodDetails.foodPrice}, ${newBooking.guestCount} plate` : ''
                }
                ${newBooking.guestCount ? `Number of Guests: ${newBooking.guestCount}` : ''} `
            }
    Please review the information above to ensure everything is accurate.If there are any discrepancies or if you have any additional requests, please don't hesitate to contact us at ${process.env.FRONTEND_URL || ''}.

    As part of our commitment to providing exceptional service, we offer a range of amenities and facilities to enhance your visit.Take advantage of our concierge services; we're here to make your experience memorable.

    Upon arrival, our friendly staff will be ready to assist you with the entry process and answer any questions you may have.We want to ensure your visit is seamless and enjoyable from start to finish.

    Thank you for choosing ${hotelName || restaurantName}.We look forward to welcoming you and making your stay with us unforgettable.

    Warm regards,

    Administrator,
    ${hotelName || restaurantName}
    ${hotelCity || restaurantCity}, ${hotelCountry || restaurantCountry} `;

        return emailContent;

    } catch (error) {
        console.log("Error creating booking email", error);
    }
}
