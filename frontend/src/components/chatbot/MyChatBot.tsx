import { useState, useEffect } from "react";
import ChatBot from "react-chatbotify";
import "react-chatbotify/dist/react-chatbotify.css";
import * as apiClient from "../../api-client";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FoodItem, HotelType, OpeningHour, PaymentData, RestaurantType, RoomType } from "../../../../types/types";
import { useMutation } from "@tanstack/react-query";
import { useAppContext } from "../../contexts/AppContext";
import { FoodItems } from "../../../../types/Enums";

const MyChatBot = () => {
  const botName = "WanderLustBookingAssistant1.0";
  const [hotel, setHotel] = useState<HotelType[]>([]);
  const [restaurant, setRestaurant] = useState<RestaurantType[]>([]);
  const [userName, setUserName] = useState<string>("");
  const [destination, setDestination] = useState<string>("");
  const [checkIn, setCheckIn] = useState<Date>(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow;
  });
  const [checkOut, setCheckOut] = useState<Date>(() => {
    const nextDay = new Date(checkIn);
    nextDay.setDate(nextDay.getDate() + 1);
    return nextDay;
  });
  const [dateOfBooking, setDateOfBooking] = useState<Date>(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow;
  });
  const [adultCount, setAdultCount] = useState<number>(1);
  const [childCount, setChildCount] = useState<number>(1);
  const [guestCount, setGuestCount] = useState<number>(1);
  const [roomType, setRoomType] = useState<string>("");
  const [foodItem, setFoodItem] = useState<string>("");
  const [roomCount, setRoomCount] = useState<number>(0);
  const [hotelId, setHotelId] = useState<string>("");
  const [restaurantId, setRestaurantId] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [error, setError] = useState<string>("");
  const { showToast } = useAppContext();
  let roomPrice = 0,
    foodPrice = 0,
    foodCount = 0,
    total = 0;

  useEffect(() => {
    return () => { };
  }, []);

  const checkInMinDate = new Date();
  checkInMinDate.setDate(checkInMinDate.getDate() + 1);
  const checkOutMinDate = new Date(checkIn);
  checkOutMinDate.setDate(checkOutMinDate.getDate() + 1);
  const maxDate = new Date();
  maxDate.setFullYear(maxDate.getFullYear() + 1);

  const { mutate } = useMutation(apiClient.createCheckoutSession, {
    onMutate: (newPaymentData) => {
      return newPaymentData;
    },
    onSuccess: () => {
      showToast({ message: "Booking Saved!", type: "SUCCESS" });
    },
    onError: () => {
      setError("Requirement unavailable");
      showToast({ message: "Error saving booking!", type: "ERROR" });
    },
  });

  const handlePayment = async (paymentData: PaymentData) => {
    try {
      const response = mutate(paymentData);
      console.log("Response:", response);
    } catch (error) {
      console.error("Mutation Error:", error);
    }
  };

  const options = {
    header: {
      title: <div className="font-bold text-xl">WanderLustBookingAssistant</div>,
      showAvatar: true,
      avatar: "/chatbot.avif",
    },
    theme: {
      embedded: false,
      primaryColor: "#3B82F6",
      secondaryColor: "#000000",
      showFooter: false,
    },
    chatHistory: { disabled: true },
    notification: { disabled: true },
    emoji: { disabled: true },
    userBubble: { showAvatar: true },
    tooltip: { mode: "START", text: "Booking Assistant😀" },
  };

  const handleSearchHotels = async (destination: string, page: number) => {
    try {
      const searchParams = { destination: destination, page: page.toString() };
      const response = await apiClient.searchHotels(searchParams);
      if (response.data) {
        setHotel(response.data);
      }
    } catch (error) {
      console.log("Error fetching hotels:", error);
    }
  };

  const handleSearchRestaurants = async (destination: string, page: number) => {
    try {
      const searchParams = { destination: destination, page: page.toString() };
      const response = await apiClient.searchRestaurants(searchParams);
      if (response.data) {
        setRestaurant(response.data);
      }
    } catch (error) {
      console.log("Error fetching restaurants:", error);
    }
  };

  const flow = {
    start: {
      message: `Hi there!, I'm ${botName}, Please enter your sweet name 😊`,
      path: ({ userInput }: { userInput: string }) => {
        setUserName(userInput);
        return "selectBooking";
      },
    },

    selectBooking: {
      message: `Hello ${userName}. You can start booking now, Select one...`,
      options: ["Hotel", "Restaurant", "Transit"],
      path: ({ userInput }: { userInput: string }) => {
        if (userInput === "Hotel") {
          return "searchHotel";
        }
        if (userInput === "Restaurant") {
          return "searchRestaurant";
        }
        if (userInput === "Transit") {
          return "searchTransit";
        }
        if (userInput === "Cancel Booking") {
          return "end";
        }
      },
      chatDisabled: true,
    },

    searchHotel: {
      message: `Enter hotel name or place...`,
      path: async ({ userInput }: { userInput: string }) => {
        await handleSearchHotels(userInput, page);
        return "listHotels";
      },
    },

    searchRestaurant: {
      message: `Enter restaurant name or place...`,
      path: async ({ userInput }: { userInput: string }) => {
        await handleSearchRestaurants(userInput, page);
        return "listRestaurants";
      },
    },

    searchTransit: {
      message: `Sorry for the trouble. Transit booking under construction`,
      options: ['start'],
      path: ({ userInput }: { userInput: string }) => {
        if (userInput === 'start')
          return "start";
      },
      chatDisabled: true,
    },

    listHotels: {
      message: "Find your hotel from the list",
      options: [...hotel.map((hotel) => hotel.name), "More", "Cancel Booking"],
      path: async ({ userInput }: { userInput: string }) => {
        setDestination(userInput);
        if (userInput === "Cancel Booking") {

          return "end";
        }
        if (userInput === "More") {
          setPage(page => page + 1);
          await handleSearchHotels(destination, page);
          return "listHotels";
        }
        return "hotelDetails";
      },
      chatDisabled: true,
    },

    listRestaurants: {
      message: "Find your restaurant from the list",
      options: [...restaurant.map((restaurant) => restaurant.name), "More", "Cancel Booking"],
      path: async ({ userInput }: { userInput: string }) => {
        setDestination(userInput);
        if (userInput === "Cancel Booking") {

          return "end";
        }
        if (userInput === "More") {
          setPage(page => page + 1);
          await handleSearchRestaurants(destination, page);
          return "listRestaurants";
        }
        return "restaurantDetails";
      },
      chatDisabled: true,
    },

    hotelDetails: {
      render: () => {
        return (<div className="bg-black text-white rounded p-4 mt-2 ml-4 mr-4">
          <h6 className="mb-1">{`Now check details`}</h6>
          <h6 className="text-xl font-bold">{`Hotel Name: ${hotel[0].name}`}</h6>
          <h6 className="text-lg">{`Place: ${hotel[0].city}, ${hotel[0].country}`}</h6>
          <h6 className="text-lg">{`Facilities: ${hotel[0].facilities}`}</h6>
          <h6 className="text-lg">{`Rating: ${hotel[0].starRating}`}</h6>
          <h6 className="text-lg">{`Type: ${hotel[0].type}`}</h6>
          <h6 className="text-sm">{`Description: ${hotel[0].description}`}</h6>
          <div>
            {hotel[0].imageUrls.map((image: string, index: number) => (
              <div className="mt-2 p-2" key={index}>
                <img src={image}
                  className="rounded-md w-full h-full object-cover object-center" />
              </div>
            ))}
          </div>
        </div>);
      },
      options: ["Confirm Destination", "Cancel Booking"],
      path: ({ userInput }: { userInput: string }) => {
        if (userInput === "Confirm Destination") {
          setHotelId(hotel[0]._id);
          return "confirmDestinationH";
        }
        if (userInput === "Cancel Booking") {

          return "end";
        }
      },
      chatDisabled: true,
    },

    restaurantDetails: {
      render: () => {
        return (<div className="bg-black text-white rounded p-4 mt-2 ml-4 mr-4">
          <h6 className="mb-1">{`Now check details`}</h6>
          <h6 className="text-xl font-bold">{`Restaurant Name: ${restaurant[0].name}`}</h6>
          <h6 className="text-lg">{`Place: ${restaurant[0].city}, ${restaurant[0].country}`}</h6>
          <h6 className="text-lg">{`Food Items:`}</h6>
          <table className="font-semibold border p-2 m-3">
            {restaurant[0].foodItems.map((food: FoodItem, index: number) => (
              <tr className="border p-2" key={index}>
                <td className="border p-2">{food.item}</td>
                <td className="border p-2">{food.price}</td>
                <td className="border p-2">{food.quantity}</td>
              </tr>
            ))}
          </table>
          <h6 className="text-lg">{`Facilities: ${restaurant[0].facilities}`}</h6>
          <h6 className="text-lg">{`Rating: ${restaurant[0].starRating}`}</h6>
          <h6 className="text-lg">{`Type: ${restaurant[0].type}`}</h6>
          <h6 className="text-lg">{`Opening Hours:`}</h6>
          <table className="font-semibold border p-2 m-3">
            {restaurant[0].openingHours.map((restaurant: OpeningHour, index: number) => (
              <tr className="border p-2" key={index}>
                <td className="border p-2">{restaurant.day}</td>
                <td className="border p-2">{restaurant.startTime}</td>
                <td className="border p-2">{restaurant.startTime}</td>
              </tr>
            ))}
          </table>
          <h6 className="text-sm">{`Description: ${restaurant[0].description}`}</h6>
          <div>
            {restaurant[0].imageUrls.map((image: string, index: number) => (
              <div className="mt-2 p-2" key={index}>
                <img src={image}
                  className="rounded-md w-full h-full object-cover object-center" />
              </div>
            ))}
          </div>
        </div>);
      },
      options: ["Confirm Destination", "Cancel Booking"],
      path: ({ userInput }: { userInput: string }) => {
        if (userInput === "Confirm Destination") {
          setRestaurantId(restaurant[0]._id);
          return "confirmDestinationR";
        }
        if (userInput === "Cancel Booking") {

          return "end";
        }
      },
      chatDisabled: true,
    },

    confirmDestinationH: {
      message: `You've selected ${destination}.`,
      options: ["Continue", "Cancel Booking"],
      path: ({ userInput }: { userInput: string }) => {
        if (userInput === "Continue") {
          return "adultCount";
        }
        if (userInput === "Cancel Booking") {

          return "end";
        }
      },
      chatDisabled: true,
    },

    confirmDestinationR: {
      message: `You've selected ${destination}.`,
      options: ["Continue", "Cancel Booking"],
      path: ({ userInput }: { userInput: string }) => {
        if (userInput === "Continue") {
          return "guestCount";
        }
        if (userInput === "Cancel Booking") {

          return "end";
        }
      },
      chatDisabled: true,
    },

    adultCount: {
      message: `Enter number of adults(15+)`,
      path: ({ userInput }: { userInput: string }) => {
        const temp = parseInt(userInput);
        if (userInput === "Cancel Booking" || isNaN(temp)) {

          return "end";
        }
        setAdultCount(temp);
        return "childCount";
      },
    },

    childCount: {
      message: `Enter number of children`,
      path: ({ userInput }: { userInput: string }) => {
        const temp = parseInt(userInput);
        if (userInput === "Cancel Booking" || isNaN(temp)) {

          return "end";
        }
        setChildCount(temp);
        return "confirmGuests";
      },
    },

    guestCount: {
      message: `Enter number of guests`,
      path: ({ userInput }: { userInput: string }) => {
        const temp = parseInt(userInput);
        if (userInput === "Cancel Booking" || isNaN(temp)) {

          return "end";
        }
        setGuestCount(temp);
        return "confirmGuestCount";
      },
    },

    confirmGuests: {
      message: `${adultCount} adults & ${childCount} children`,
      options: ["Continue", "Cancel Booking"],
      path: ({ userInput }: { userInput: string }) => {
        if (userInput === "Continue") {
          return "roomDetails";
        }
        if (userInput === "Cancel Booking") {

          return "end";
        }
      },
      chatDisabled: true,
    },

    confirmGuestCount: {
      message: `${guestCount} Guests`,
      options: ["Continue", "Cancel Booking"],
      path: ({ userInput }: { userInput: string }) => {
        if (userInput === "Continue") {
          return "foodDetails";
        }
        if (userInput === "Cancel Booking") {

          return "end";
        }
      },
      chatDisabled: true,
    },

    roomDetails: {
      message: `Next, Select Room`,
      options: ["Single", "Double", "Triple", "King", "Queen", "Cancel Booking"],
      path: ({ userInput }: { userInput: string }) => {
        if (userInput === "Cancel Booking") {

          return "end";
        }
        setRoomType(userInput)
        return "confirmRoomType";
      },
      chatDisabled: true,
    },

    foodDetails: {
      message: `Next, Select Food`,
      options: [...Object.values(FoodItems)],
      path: ({ userInput }: { userInput: string }) => {
        if (userInput === "Cancel Booking") {

          return "end";
        }
        setFoodItem(userInput)
        return "confirmFoodItem";
      },
      chatDisabled: true,
    },

    confirmRoomType: {
      message: `You've selected ${roomType}-bed room.`,
      options: ["Continue", "Cancel Booking"],
      path: ({ userInput }: { userInput: string }) => {
        if (userInput === "Continue") {
          return "totalRooms";
        }
        if (userInput === "Cancel Booking") {

          return "end";
        }
      },
      chatDisabled: true,
    },

    confirmFoodItem: {
      message: `You've selected ${foodItem} for ${guestCount}`,
      options: ["Continue", "Cancel Booking"],
      path: ({ userInput }: { userInput: string }) => {
        if (userInput === "Continue") {
          return "dateOfBooking";
        }
        if (userInput === "Cancel Booking") {

          return "end";
        }
      },
      chatDisabled: true,
    },

    totalRooms: {
      message: `Enter number of rooms`,
      path: ({ userInput }: { userInput: string }) => {
        const temp = parseInt(userInput);
        if (userInput === "Cancel Booking" || isNaN(temp)) {

          return "end";
        }
        setRoomCount(temp);
        return "confirmTotalRooms";
      },
    },

    confirmTotalRooms: {
      message: `You've selected ${roomCount} ${roomType}-bed rooms.`,
      options: ["Continue", "Cancel Booking"],
      path: ({ userInput }: { userInput: string }) => {
        if (userInput === "Continue") {
          return "checkIn";
        }
        if (userInput === "Cancel Booking") {

          return "end";
        }
      },
      chatDisabled: true,
    },

    checkIn: {
      message: "Please select the check-in date",
      render: () => (
        <DatePicker
          selected={checkIn} selectsStart minDate={checkInMinDate} maxDate={maxDate}
          placeholderText="Check-in Date" wrapperClassName="min-w-full"
          className="bg-blue-900 hover:bg-blue-700 text-white items-center ml-4 mt-3 rounded p-2 focus:outline-none cursor-pointer text-center"
          onChange={(date: Date) => {
            setCheckIn(date);
            const newDate = new Date(date.getTime());
            newDate.setDate(newDate.getDate() + 1);
            setCheckOut(newDate);
          }}
        />
      ),
      options: ["Confirm Check-in Date", "Cancel Booking"],
      path: ({ userInput }: { userInput: string }) => {
        if (userInput === "Confirm Check-in Date") {
          return "confirmCheckInDate";
        }
        if (userInput === "Cancel Booking") {

          return "end";
        }
      },
      chatDisabled: true,
    },

    confirmCheckInDate: {
      message: `You've selected ${checkIn.toLocaleDateString()}.`,
      options: ["Continue", "Cancel Booking"],
      path: ({ userInput }: { userInput: string }) => {
        if (userInput === "Continue") {
          return "checkOut";
        }
        if (userInput === "Cancel Booking") {

          return "end";
        }
      },
      chatDisabled: true,
    },

    checkOut: {
      message: "Now, Select check-out date",
      render: () => (
        <DatePicker
          selected={checkOut} startDate={checkIn} endDate={checkOut}
          minDate={checkOutMinDate} maxDate={maxDate} placeholderText="Check-out Date"
          onChange={(date) => setCheckOut(date as Date)}
          wrapperClassName="min-w-full"
          className="bg-blue-900 hover:bg-blue-700 text-white items-center ml-4 mt-3 rounded p-2 focus:outline-none cursor-pointer text-center"
        />
      ),
      options: ["Confirm Check-out Date", "Cancel Booking"],
      path: ({ userInput }: { userInput: string }) => {
        if (userInput === "Confirm Check-out Date") {
          return "confirmCheckOutDate";
        }
        if (userInput === "Cancel Booking") {

          return "end";
        }
      },
      chatDisabled: true,
    },

    confirmCheckOutDate: {
      message: `You've selected ${checkOut.toLocaleDateString()}.`,
      options: ["Continue", "Cancel Booking"],
      path: ({ userInput }: { userInput: string }) => {
        if (userInput === "Continue") {
          return "verifyBookingDetailsH";
        }
        if (userInput === "Cancel Booking") {
          return "end";
        }
      },
      chatDisabled: true,
    },

    dateOfBooking: {
      message: "Please select the booking date",
      render: () => (
        <DatePicker
          selected={dateOfBooking} selectsStart
          startDate={dateOfBooking} minDate={checkInMinDate} maxDate={maxDate}
          placeholderText="Date of Booking"
          onChange={(date) => {
            setDateOfBooking(date as Date);
          }}
          wrapperClassName="min-w-full"
          className="bg-blue-900 hover:bg-blue-700 text-white items-center ml-4 mt-3 rounded p-2 focus:outline-none cursor-pointer text-center"
        />
      ),
      options: ["Confirm booking Date", "Cancel Booking"],
      path: ({ userInput }: { userInput: string }) => {
        if (userInput === "Confirm booking Date") {
          return "confirmBookingDate";
        }
        if (userInput === "Cancel Booking") {
          return "end";
        }
      },
      chatDisabled: true,
    },

    confirmBookingDate: {
      message: `You've selected ${dateOfBooking.toLocaleDateString()}.`,
      options: ["Continue", "Cancel Booking"],
      path: ({ userInput }: { userInput: string }) => {
        if (userInput === "Continue") {
          return "verifyBookingDetailsR";
        }
        if (userInput === "Cancel Booking") {
          return "end";
        }
      },
      chatDisabled: true,
    },

    verifyBookingDetailsH: {
      render: () => {
        roomPrice = hotel[0].roomTypes.find((room: RoomType) => room.type === roomType)?.price || 0;
        total = Math.floor((checkOut.getTime() - checkIn.getTime()) / (24 * 60 * 60 * 1000)) * roomCount * roomPrice;
        return (
          <div className="bg-black text-white rounded p-4 mt-2 ml-4 mr-4">
            <h6 className="mb-1">Now verify details</h6>
            <h6 className="text-lg font-bold">{`User Name: ${userName}`}</h6>
            <h6 className="text-lg font-bold">{`Hotel: ${hotel[0].name}`}</h6>
            <h6 className="text-lg font-bold">{`Place: ${hotel[0].city}, ${hotel[0].country}`}</h6>
            <h6 className="text-lg font-bold">{`Rooms: ${roomType} Bed, ₹${roomPrice}, ${roomCount} Nos`}</h6>
            <h6 className="text-lg font-bold">{`Guests: ${adultCount} Adults & ${childCount} Children`}</h6>
            <h6 className="text-lg font-bold">{`Check-in: ${checkIn.toLocaleDateString()} 02:00:00 PM`}</h6>
            <h6 className="text-lg font-bold">{`Check-out: ${checkOut.toLocaleDateString()} 12:00:00 PM`}</h6>
            <h6 className="text-lg font-bold">{`Total Cost: ₹${total}/-`}</h6>
            <h6 className="mb-1">{`After clicking on "Confirm Booking", The bot will redirect you to the payment gateway page. Happy booking...`}</h6>
          </div>
        );
      },
      options: ["Verify and Check Availability", "Cancel Booking"],
      path: ({ userInput }: { userInput: string }) => {
        const nightsPerStay = Math.floor((checkOut.getTime() - checkIn.getTime()) / (24 * 60 * 60 * 1000));
        if (userInput === "Verify and Check Availability") {
          const paymentData = {
            checkIn, checkOut, adultCount, childCount, roomType, roomCount, roomPrice,
            hotelId, nightsPerStay
          }
          handlePayment(paymentData);

          if (error === "Requirement unavailable") {
            return "unavailable";
          }
        }
        if (userInput === "Cancel Booking") {
          return "end";
        }
      },
      chatDisabled: true,
    },

    verifyBookingDetailsR: {
      render: () => {
        foodPrice = restaurant[0].foodItems.find((food: FoodItem) => food.item === foodItem)?.price || 0;
        foodCount = restaurant[0].foodItems.find((food: FoodItem) => food.item === foodItem)?.quantity || 0;
        total = Math.floor(foodPrice * guestCount);
        return (
          <div className="bg-black text-white rounded p-4 mt-2 ml-4 mr-4">
            <h6 className="mb-1">Now verify details</h6>
            <h6 className="text-lg font-bold">{`User Name: ${userName}`}</h6>
            <h6 className="text-lg font-bold">{`Hotel: ${restaurant[0].name}`}</h6>
            <h6 className="text-lg font-bold">{`Place: ${restaurant[0].city}, ${restaurant[0].country}`}</h6>
            <h6 className="text-lg font-bold">{`Food: ${foodItem}`}</h6>
            <h6 className="text-lg font-bold">{`Guests: ${guestCount} Guests`}</h6>
            <h6 className="text-lg font-bold">{`Date of Booking: ${dateOfBooking.toLocaleDateString()} 12:00:00 PM`}</h6>
            <h6 className="text-lg font-bold">{`Total Cost: ₹${total}/-`}</h6>
            <h6 className="mb-1">{`After clicking on "Confirm Booking", The bot will redirect you to the payment gateway page. Happy booking...`}</h6>
          </div>
        );
      },
      options: ["Confirm Booking", "Cancel Booking"],
      path: ({ userInput }: { userInput: string }) => {
        if (userInput === "Confirm Booking") {
          const paymentData = { dateOfBooking, guestCount, foodItem, foodPrice, foodCount, restaurantId }
          mutate(paymentData);
          return "end"
        }
        if (userInput === "Cancel Booking") {
          return "end";
        }
      },
      chatDisabled: true,
    },

    unavailable: {
      message: `Requirement unavailable`,
      path: "end"
    },

    end: {
      message: `Thank you ${userName}! Visit Again`,
      options: ["Quit", "Continue"],
      path: ({ userInput }: { userInput: string }) => {
        setPage(1);
        if (userInput === "Continue") {
          return "start";
        }
      },
      chatDisabled: true,
    },
  };

  return <ChatBot options={options} flow={flow} />;
};

export default MyChatBot;
