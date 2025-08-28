import { Request, Response } from "express";
import Hotel from "../models/hotel.model";
import { SearchHotelResponse, SearchRestaurantResponse } from "../types/types";
import Restaurant from "../models/restaurant.model";
import { validationResult } from "express-validator";
import { bookingBotSearchQuery, constructSearchHotelQuery } from "../utils/SearchQuery";

export const searchHotels = async (req: Request, res: Response) => {
    try {
        const query = constructSearchHotelQuery(req.query);
        let sortOption = {};
        switch (req.query.sortOption) {
            case "starRating":
                sortOption = { starRating: -1 }; break;
            case "pricePerNightAsc":
                sortOption = { ['roomTypes.price']: 1 }; break;
            case "pricePerNightDesc":
                sortOption = { ['roomTypes.price']: -1 }; break;
        }

        const pageSize = 5;
        const pageNumber = parseInt(req.query.page ? req.query.page.toString() : "1");
        const skip = (pageNumber - 1) * pageSize;
        const hotels = await Hotel.find({ ...query, isBlocked: false }).sort(sortOption).skip(skip).limit(pageSize);
        const total = await Hotel.countDocuments({ ...query, isBlocked: false });
        const response: SearchHotelResponse = {
            data: hotels,
            pagination: {
                total,
                page: pageNumber,
                pages: Math.ceil(total / pageSize),
            }
        };
        res.json(response);
    } catch (error) {
        console.log("Error in searching hotels", error);
        return res.status(500).send({ message: "Something went wrong!" });
    }
};

export const loadHotelDetails = async (req: Request, res: Response) => {
    try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }
    const id = req.params.hotelId.toString();
        const hotel = await Hotel.findById(id);
        res.json(hotel);
    } catch (error) {
        console.log("Error in loading hotel details", error);
        return res.status(500).send({ message: "Something went wrong!" });
    }
};

export const searchRestaurants = async (req: Request, res: Response) => {
    try {
        const query = bookingBotSearchQuery(req.query);
        let sortOption = {};
        switch (req.query.sortOption) {
            case "starRating":
                sortOption = { starRating: -1 }; break;
            case "pricePerNightAsc":
                sortOption = { ['foodItems.price']: 1 }; break;
            case "pricePerNightDesc":
                sortOption = { ['foodItems.price']: -1 }; break;
        }

        const pageSize = 5;
        const pageNumber = parseInt(req.query.page ? req.query.page.toString() : "1");
        const skip = (pageNumber - 1) * pageSize;
        const hotels = await Restaurant.find({ ...query, isBlocked: false }).sort(sortOption).skip(skip).limit(pageSize);
        const total = await Restaurant.countDocuments({ ...query, isBlocked: false });
        const response: SearchRestaurantResponse = {
            data: hotels,
            pagination: {
                total,
                page: pageNumber,
                pages: Math.ceil(total / pageSize),
            }
        };
        res.json(response);
    } catch (error) {
        console.log("Error in searching restaurants", error);
        return res.status(500).send({ message: "Something went wrong!" });
    }
};