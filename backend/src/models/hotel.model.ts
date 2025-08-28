import mongoose, { Types } from "mongoose";
import { HotelType } from "../types/types";

const hotelSchema = new mongoose.Schema<HotelType>({
    name: { type: String, required: true },
    city: { type: String, required: true },
    country: { type: String, required: true },
    description: { type: String, required: true },
    roomTypes: [{
        type: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true },
    }],
    adultCount: { type: Number, required: true },
    childCount: { type: Number, required: true },
    type: { type: String, required: true },
    facilities: [{ type: String, required: true }],
    starRating: { type: Number, required: true, min: 1, max: 5 },
    imageUrls: [{ type: String, required: true }],
    lastUpdated: { type: Date, required: true },
    isBlocked: { type: Boolean, required: true },
});

const Hotel = mongoose.model<HotelType>("Hotel", hotelSchema);

export default Hotel;
