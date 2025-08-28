import { BookingBotSearchParams, HotelSearchParams, UserSearchParams } from "../types/types";

export const constructSearchHotelQuery = (queryParams: HotelSearchParams) => {
    const searchQuery: any = {};
    const regex = new RegExp(queryParams.destination as string, "i");

    if (queryParams.destination) {
        searchQuery.$or = [
            { city: regex },
            { country: regex },
            { name: regex },
        ];
    }

    if (queryParams.adultCount) {
        searchQuery.adultCount = { $gte: parseInt(queryParams.adultCount) };
    }

    if (queryParams.childCount) {
        searchQuery.childCount = { $gte: parseInt(queryParams.childCount) };
    }

    if (queryParams.facilities) {
        searchQuery.facilities = { $all: Array.isArray(queryParams.facilities) ? queryParams.facilities : [queryParams.facilities] };
    }

    if (queryParams.types) {
        searchQuery.type = { $in: Array.isArray(queryParams.types) ? queryParams.types : [queryParams.types] };
    }

    if (queryParams.stars) {
        searchQuery.starRating = { $in: Array.isArray(queryParams.stars) ? queryParams.stars : [queryParams.stars] };
    }

    if (queryParams.maxPrice) {
        searchQuery['roomTypes.price'] = { $lte: parseInt(queryParams.maxPrice) };
    }

    return searchQuery;
};

const constructOrQuery = (fields: string[], value: string) => {
    const regex = new RegExp(value, "i");
    return { $or: fields.map(field => ({ [field]: regex })) };
};

export const bookingBotSearchQuery = (queryParams: BookingBotSearchParams) => {
    if (queryParams.destination) {
        return constructOrQuery(['name', 'city', 'country'], queryParams.destination);
    }
    return {};
};

export const constructSearchQuery = (queryParams: UserSearchParams) => {
    if (queryParams.destination) {
        return constructOrQuery(['name', 'email', 'mobile'], queryParams.destination);
    }
    return {};
};
