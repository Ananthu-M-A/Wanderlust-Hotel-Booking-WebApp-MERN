import PDFKit from 'pdfkit';
import { BookingType, HotelType, RestaurantType, UserType } from '../types/types';

export const createPDF = (newBooking: BookingType, user: UserType, hotel?: HotelType, restaurant?: RestaurantType): Promise<Buffer> => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFKit();
            const buffers: Buffer[] = [];
            
            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => {
                const pdfData = Buffer.concat(buffers);
                resolve(pdfData);
            });

            doc.fontSize(12).text('Booking Receipt', { align: 'center' }).moveDown();
            doc.fontSize(10).text(`Guest Name: ${user?.firstName} ${user?.lastName}`).moveDown();
            hotel && doc.text(`Hotel Name: ${hotel?.name}`).moveDown();
            restaurant && doc.text(`Restaurant Name: ${restaurant?.name}`).moveDown();
            hotel && doc.text(`Adult Count: ${newBooking.adultCount}`).moveDown();
            hotel && doc.text(`Child Count: ${newBooking.childCount}`).moveDown();
            hotel && doc.text(`Check-In: ${new Date(newBooking.checkIn).toLocaleDateString()} 02:00:00 PM`).moveDown();
            hotel && doc.text(`Check-Out: ${new Date(newBooking.checkOut).toLocaleDateString()} 12:00:00 PM`).moveDown();
            restaurant && doc.text(`Booked Date: ${new Date(newBooking.dateOfBooking).toLocaleDateString()} 02:00:00 PM`).moveDown();
            hotel && doc.text(`Room Details: ${newBooking.roomDetails.roomType} Bed Room, ₹${newBooking.roomDetails.roomPrice}, ${newBooking.roomDetails.roomCount} Nos`).moveDown();
            restaurant && doc.text(`Food Details: ${newBooking.foodDetails.foodItem} of price ₹${newBooking.foodDetails.foodPrice} for ${newBooking.guestCount} guests`).moveDown();
            doc.text(`Total Cost: ₹ ${newBooking.totalCost}`).moveDown();
            doc.text(`Payment Status: Successful`).moveDown();
            doc.text(`Booking Date: ${new Date(newBooking.bookingDate).toLocaleDateString()}`).moveDown();

            doc.end();

        } catch (error) {
            console.log("Error creating PDF", error);
            reject(error);
        }
    });
};
