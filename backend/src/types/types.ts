export type RoomType = {
    type: string;
    price: number;
    quantity: number;
};

export type FoodItem = {
    item: string;
    price: number;
    quantity: number;
};

export type OpeningHour = {
    day: string;
    startTime: string;
    endTime: string;
}

export type roomDetail = {
    roomType: string;
    roomPrice: number;
    roomCount: number;
}

export type UserType = {
    _id: string,
    email: string,
    mobile: string,
    password: string,
    firstName: string,
    lastName: string,
    isBlocked: boolean,
    imageFile: FileList | null,
    imageUrl: string,
    role: string[],
};

export type HotelType = {
    _id: string,
    name: string,
    city: string,
    country: string,
    description: string,
    roomTypes: RoomType[],
    type: string,
    adultCount: number,
    childCount: number,
    facilities: string[],
    starRating: number,
    imageUrls: string[],
    lastUpdated: Date,
    isBlocked: boolean,
};

export type RestaurantType = {
    _id: string,
    name: string,
    city: string,
    country: string,
    description: string,
    foodItems: FoodItem[],
    type: string,
    openingHours: OpeningHour[],
    facilities: string[],
    starRating: number,
    imageUrls: string[],
    lastUpdated: Date,
    bookings: BookingType[],
    isBlocked: boolean,
};

export type BookingType = {
    _id: string;
    userId: Object;
    hotelId?: HotelType;
    restaurantId?: RestaurantType;
    adultCount: number;
    childCount: number;
    guestCount: number;
    checkIn: Date;
    checkOut: Date;
    dateOfBooking: Date;
    roomDetails: {
        roomType: string;
        roomPrice: number;
        roomCount: number;
    };
    roomType: string;
    roomPrice: number;
    roomCount: number;
    nightsPerStay: number;
    foodDetails: {
        foodItem: string;
        foodPrice: number;
        foodCount: number;
    };
    foodItem: string;
    foodPrice: number;
    foodCount: number;
    totalCost: number;
    paymentId: string;
    bookingDate: Date;
    bookingStatus: string;
    cancellationDate: Date;
    page: string;
};

export type SearchHotelResponse = {
    data: HotelType[];
    pagination: {
        total: number;
        page: number;
        pages: number;
    }
}

export type SearchRestaurantResponse = {
    data: RestaurantType[];
    pagination: {
        total: number;
        page: number;
        pages: number;
    }
}

export type SearchBookingResponse = {
    data: BookingType[];
    pagination: {
        total: number;
        page: number;
        pages: number;
    }
}

export type SearchUserResponse = {
    data: UserType[];
    pagination: {
        total: number;
        page: number;
        pages: number;
    }
}

export type SearchParams = {
    destination?: string;
    checkIn?: string;
    checkOut?: string;
    adultCount?: string;
    childCount?: string;
    page?: string;
    facilities?: string[];
    types?: string[];
    stars?: string[];
    maxPrice?: string;
    sortOption?: string;
}

export type SearchRestaurantParams = {
    destination?: string;
    checkIn?: string;
    checkOut?: string;
    adultCount?: string;
    childCount?: string;
    page?: string;
    facilities?: string[];
    types?: string[];
    stars?: string[];
    maxPrice?: string;
    sortOption?: string;
}

export type BookingData = {
    bookingId: string;
    page: string;
}

export type LoginFormData = {
    email: string;
    password: string;
}

export type ResetPasswordFormData = {
    email: string;
    password: string;
    confirmPassword: string;
}

export type RegisterFormData = {
    firstName: string;
    lastName: string;
    email: string;
    mobile: string;
    imageFile: FileList;
    imageUrl: string;
    password: string;
    confirmPassword: string;
}

export type RestaurantFormData = {
    get(arg0: string): unknown;
    name: string;
    city: string;
    country: string;
    description: string;
    starRating: number;
    openingHours: OpeningHour[],
    type: string;
    foodItems: FoodItem[],
    facilities: string[];
    imageUrls: string[];
    imageFiles: FileList;
    lastUpdated: Date;
};

export type HotelFormData = {
    get(arg0: string): unknown;
    name: string;
    city: string;
    country: string;
    description: string;
    type: string;
    starRating: number;
    facilities: string[];
    imageFiles: FileList;
    imageUrls: string[];
    adultCount: number;
    childCount: number;
    roomTypes: RoomType[];
};

export type GuestInfoFormData = {
    checkIn: Date;
    checkOut: Date;
    adultCount: number;
    childCount: number;
    roomType: string;
    roomCount: number;
    roomPrice: number;
}

export type ToastMessage = {
    message: string,
    type: "SUCCESS" | "ERROR";
}

export type SearchContext = {
    destination: string;
    checkIn: Date;
    checkOut: Date;
    adultCount: number;
    childCount: number;
    roomType: string;
    roomCount: number;
    roomPrice: number;
    totalCost: number;
    hotelId: string;
    saveSearchValues: (
        destination: string,
        checkIn: Date,
        checkOut: Date,
        adultCount: number,
        childCount: number,
        roomType: string,
        roomCount: number,
        roomPrice: number,
        totalCost: number,
        hotelId?: string
    ) => void;
    clearSearchValues: () => void;
};

export type PaymentData = {
    checkIn?: Date,
    checkOut?: Date,
    adultCount?: number,
    childCount?: number,
    roomType?: string,
    roomCount?: number,
    roomPrice?: number,
    hotelId?: string,
    nightsPerStay?:number,
    dateOfBooking?: Date,
    guestCount?: number,
    foodItem?: string,
    foodPrice?: number,
    foodCount?: number,
    restaurantId?: string
}

export type HotelSearchParams = {
    destination?: string;
    adultCount?: string;
    childCount?: string;
    facilities?: string[] | string;
    types?: string[] | string;
    stars?: number[] | number;
    maxPrice?: string;
}

export type BookingBotSearchParams = {
    destination?: string;
}

export type UserSearchParams = {
    destination?: string;
}