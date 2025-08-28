import { Request, Response } from 'express';
import { FoodItem, OpeningHour, RestaurantType, SearchRestaurantResponse } from '../types/types';
import Restaurant from '../models/restaurant.model';
import { uploadImages } from '../utils/CloudinaryUploader';
import { bookingBotSearchQuery } from '../utils/SearchQuery';

export const loadRestaurants = async (req: Request, res: Response) => {
    try {
        const query = bookingBotSearchQuery(req.query);

        const pageSize = 10;
        const pageNumber = parseInt(req.query.page ? req.query.page.toString() : "1");
        const skip = (pageNumber - 1) * pageSize;
        const hotels = await Restaurant.find(query).skip(skip).limit(pageSize);
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
        console.log("Error in loading restaurants table", error);
        res.status(500).json({ message: "Something went wrong!" });
    }
};

export const createRestaurant = async (req: Request, res: Response) => {
    try {
        const imageFiles = req.files as Express.Multer.File[];
        const newRestaurant = req.body;

        const imageUrls = await uploadImages(imageFiles);

        const openingHours: OpeningHour[] = [];
        for (let i = 0; i < 7; i++) {
            if (newRestaurant[`opening[${i}].day`] && newRestaurant[`opening[${i}].startTime`] && newRestaurant[`opening[${i}].endTime`]) {
                const openingHour: OpeningHour = {
                    day: newRestaurant[`opening[${i}].day`],
                    startTime: newRestaurant[`opening[${i}].startTime`],
                    endTime: newRestaurant[`opening[${i}].endTime`]
                };
                openingHours.push(openingHour);
            }
        }

        const foodItems: FoodItem[] = [];
        for (let i = 0; i < 10; i++) {
            if (newRestaurant[`food[${i}].item`] && newRestaurant[`food[${i}].price`] && newRestaurant[`food[${i}].quantity`]) {
                const foodItem: FoodItem = {
                    item: newRestaurant[`food[${i}].item`],
                    price: newRestaurant[`food[${i}].price`],
                    quantity: newRestaurant[`food[${i}].quantity`]
                };
                foodItems.push(foodItem);
            }
        }

        const newRestaurantData: RestaurantType = {
            _id: newRestaurant._id,
            name: newRestaurant.name,
            city: newRestaurant.city,
            country: newRestaurant.country,
            description: newRestaurant.description,
            openingHours,
            type: newRestaurant.type,
            facilities: newRestaurant.facilities,
            starRating: parseInt(newRestaurant.starRating),
            imageUrls,
            lastUpdated: new Date(),
            bookings: [],
            isBlocked: false,
            foodItems,
        };

        const saveRestaurant = async (restaurantData: RestaurantType) => {
            const restaurant = new Restaurant(restaurantData);
            await restaurant.save();
            return restaurant;
        };

        const savedRestaurant = await saveRestaurant(newRestaurantData);
        res.status(201).json(savedRestaurant);
    } catch (error) {
        console.log("Error in creating restaurant", error);
        res.status(500).json({ message: "Something went wrong!" });
    }
};

export const loadRestaurant = async (req: Request, res: Response) => {
    try {
        const id = req.params.restaurantId.toString();
        const restaurant = await Restaurant.findOne({
            _id: id,
        });
        res.json(restaurant);
    } catch (error) {
        console.log("Error in loading restaurant details", error);
        res.status(500).json({ message: "Something went wrong!" });
    }
};

export const updateRestaurant = async (req: Request, res: Response) => {
    try {
        const updatedRestaurant: RestaurantType = req.body;
        updatedRestaurant.lastUpdated = new Date();

        const restaurant = await Restaurant.findOneAndUpdate({
            _id: req.body.restaurantId,
        }, updatedRestaurant, { new: true });
        if (!restaurant) {
            return res.status(404).json({ message: "Restaurant not found" });
        }

        const files = req.files as Express.Multer.File[];
        const updatedImageUrls = await uploadImages(files);
        restaurant.imageUrls = [...updatedImageUrls, ...(updatedRestaurant.imageUrls || [])];

        await restaurant.save();

        res.status(201).json(restaurant);
    } catch (error) {
        console.log("Error in updating restaurant", error);
        res.status(500).json({ message: "Something went wrong!" });
    }
};

export const blockRestaurant = async (req: Request, res: Response) => {
    try {
        const restaurantId = req.params.restaurantId;
        const restaurant = (await Restaurant.findOneAndUpdate({ _id: restaurantId }, { isBlocked: true }, { new: true }))
        res.json(restaurant);
    } catch (error) {
        console.log("Error in blocking restaurant", error);
        res.status(500).json({ message: "Something went wrong!" });
    }
};

export const unblockRestaurant = async (req: Request, res: Response) => {
    try {
        const restaurantId = req.params.restaurantId;
        const restaurant = (await Restaurant.findOneAndUpdate({ _id: restaurantId }, { isBlocked: false }, { new: true }))
        res.json(restaurant);
    } catch (error) {
        console.log("Error in unblocking restaurant", error);
        res.status(500).json({ message: "Something went wrong!" });
    }
};
