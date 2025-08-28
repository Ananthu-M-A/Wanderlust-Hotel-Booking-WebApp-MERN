import { Request, Response } from 'express';
import Hotel from '../models/hotel.model';
import { HotelType, RoomType, SearchHotelResponse } from '../types/types';
import { uploadImages } from '../utils/CloudinaryUploader';
import { constructSearchHotelQuery } from '../utils/SearchQuery';

export const loadHotels = async (req: Request, res: Response) => {
    try {
        const query = constructSearchHotelQuery(req.query);

        const pageSize = 10;
        const pageNumber = parseInt(req.query.page ? req.query.page.toString() : "1");
        const skip = (pageNumber - 1) * pageSize;
        const hotels = await Hotel.find(query).skip(skip).limit(pageSize);
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
        console.log("Error in loading hotels table", error);
        return res.status(500).send({ message: "Something went wrong!" });
    }
};

export const createHotel = async (req: Request, res: Response) => {
    try {
        const imageFiles = req.files as Express.Multer.File[];
        const newHotel = req.body;

        const imageUrls = await uploadImages(imageFiles);

        const roomTypes: RoomType[] = [];
        for (let i = 0; i < 5; i++) {
            if (newHotel[`room[${i}].type`] && newHotel[`room[${i}].price`] && newHotel[`room[${i}].quantity`]) {
                const roomType: RoomType = {
                    type: newHotel[`room[${i}].type`],
                    price: parseInt(newHotel[`room[${i}].price`]),
                    quantity: parseInt(newHotel[`room[${i}].quantity`]),
                };
                roomTypes.push(roomType);
            }
        }

        const newHotelData: HotelType = {
            _id: newHotel._id,
            name: newHotel.name,
            city: newHotel.city,
            country: newHotel.country,
            description: newHotel.description,
            roomTypes,
            type: newHotel.type,
            adultCount: parseInt(newHotel.adultCount),
            childCount: parseInt(newHotel.childCount),
            facilities: newHotel.facilities,
            starRating: parseInt(newHotel.starRating),
            imageUrls,
            lastUpdated: new Date(),
            isBlocked: false
        };

        const saveHotel = async (hotelData: HotelType) => {
            const hotel = new Hotel(hotelData);
            await hotel.save();
            return hotel;
        };

        const savedHotel = await saveHotel(newHotelData);
        res.status(201).json(savedHotel);
    } catch (error) {
        console.log("Error in creating hotel", error);
        return res.status(500).send({ message: "Something went wrong!" });
    }
};

export const loadHotel = async (req: Request, res: Response) => {
    try {
        const hotelId = req.params.hotelId.toString();
        const hotel = await Hotel.findOne({
            _id: hotelId,
        });
        res.json(hotel);
    } catch (error) {
        console.log("Error in loading hotel details", error);
        return res.status(500).send({ message: "Something went wrong!" });
    }
};

export const updateHotel = async (req: Request, res: Response) => {
    try {
        const updatedHotel: HotelType = req.body;
        updatedHotel.lastUpdated = new Date();

        const hotel = await Hotel.findOneAndUpdate({
            _id: req.body.hotelId,
        }, updatedHotel, { new: true });
        if (!hotel) {
            return res.status(404).json({ message: "Hotel not found" });
        }

        const files = req.files as Express.Multer.File[];
        const updatedImageUrls = await uploadImages(files);
        hotel.imageUrls = [...updatedImageUrls, ...(updatedHotel.imageUrls || [])];

        await hotel.save();

        res.status(201).json(hotel);
    } catch (error) {
        console.log("Error in updating hotels", error);
        return res.status(500).send({ message: "Something went wrong!" });
    }
};

export const blockHotel = async (req: Request, res: Response) => {
    try {
        const hotelId = req.params.hotelId;
        const hotel = (await Hotel.findOneAndUpdate({ _id: hotelId }, { isBlocked: true }, { new: true }))
        res.json(hotel);
    } catch (error) {
        console.log("Error in blocking hotel", error);
        return res.status(500).send({ message: "Something went wrong!" });
    }
};

export const unblockHotel = async (req: Request, res: Response) => {
    try {
        const hotelId = req.params.hotelId;
        const hotel = (await Hotel.findOneAndUpdate({ _id: hotelId }, { isBlocked: false }, { new: true }))
        res.json(hotel);
    } catch (error) {
        console.log("Error in unblocking hotel", error);
        return res.status(500).send({ message: "Something went wrong!" });
    }
};

