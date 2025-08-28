import mongoose, { Types } from "mongoose";
import { BookingType } from "../types/types";

const bookingSchema = new mongoose.Schema<BookingType>({
    userId: { type: Types.ObjectId, ref: "User", required: true },
    hotelId: { type: Types.ObjectId, ref: "Hotel" },
    restaurantId: { type: Types.ObjectId, ref: "Restaurant" },
    adultCount: { type: Number },
    childCount: { type: Number },
    guestCount: { type: Number },
    checkIn: { type: Date },
    checkOut: { type: Date },
    dateOfBooking: { type: Date },
    roomDetails: {
        roomType: { type: String },
        roomPrice: { type: Number },
        roomCount: { type: Number },
    },
    foodDetails: {
        foodItem: { type: String },
        foodPrice: { type: Number },
        foodCount: { type: Number },
    },
    totalCost: { type: Number, required: true },
    paymentId: { type: String, required: false },
    bookingDate: { type: Date, required: true },
    bookingStatus: { type: String },
    cancellationDate: { type: Date }
})

const Booking = mongoose.model<BookingType>("Booking", bookingSchema);

export default Booking;