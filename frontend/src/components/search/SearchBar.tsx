import { FormEvent, useEffect, useRef, useState } from "react";
import { useSearchContext } from "../../contexts/SearchContext";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useLocation, useNavigate } from "react-router-dom";
import GoogleMap from "./google-search/GoogleMap";
import { RoomTypes } from "../../../../types/Enums";

const SearchBar = () => {
  const search = useSearchContext();
  const navigate = useNavigate();
  const [data, setData] = useState<string[]>([]);
  const [place, setPlace] = useState<string>();
  const { pathname } = useLocation();
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    console.log("hotel names", data);
    console.log("place", place);
    if (pathname === "/") {
      navigate("/search");
    }
  }, [data, place, navigate]);

  const [searchInput, setSearchInput] = useState("");
  const [destination, setDestination] = useState<string>(search.destination);
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
  const [adultCount, setAdultCount] = useState<number>(search.adultCount);
  const [childCount, setChildCount] = useState<number>(search.childCount);
  const [roomType, setRoomType] = useState<string>(search.roomType);
  const [roomCount, setRoomCount] = useState<number>(search.roomCount);
  const [roomPrice] = useState<number>(search.roomPrice);
  const [totalCost] = useState<number>(search.totalCost);

  const handleSearchInputChange = (value: string) => {
    setSearchInput(value);
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    search.saveSearchValues(
      destination,
      checkIn,
      checkOut,
      adultCount,
      childCount,
      roomType,
      roomCount,
      roomPrice,
      totalCost
    );
    navigate("/search");
    scrollToSection(searchRef);
  };

  const checkInMinDate = new Date();
  checkInMinDate.setDate(checkInMinDate.getDate() + 1);
  const checkOutMinDate = new Date(checkIn);
  checkOutMinDate.setDate(checkOutMinDate.getDate() + 1);
  const maxDate = new Date();
  maxDate.setFullYear(maxDate.getFullYear() + 1);

  const handleData = (data: string[], place: string) => {
    setData(data);
    setPlace(place);
    const destination = place.split(", ");
    search.saveSearchValues(
      destination[0],
      checkIn,
      checkOut,
      adultCount,
      childCount,
      roomType,
      roomCount,
      roomPrice,
      totalCost
    );
  };

  const scrollToSection = (ref: React.RefObject<HTMLDivElement>) => {
    if (ref.current) {
      ref.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full md:w-1/2 mx-auto my-10 py-5 px-4 md:px-10 bg-gray-100 rounded shadow-md grid grid-cols-1 gap-4"
    >
      <h1 className="text-black text-xl font-bold text-center">Hotels</h1>
      <div className="flex flex-col md:flex-row w-full gap-3">
        <label className="flex-1">
          Check-In Time:
          <DatePicker
            selected={checkIn}
            selectsStart
            minDate={checkInMinDate}
            maxDate={maxDate}
            placeholderText="Check-in Date"
            className="w-full p-2 border-2"
            onChange={(date: Date) => {
              setCheckIn(date);
              const newDate = new Date(date.getTime());
              newDate.setDate(newDate.getDate() + 1);
              setCheckOut(newDate);
            }}
          />
        </label>
        <label className="flex-1">
          Check-Out Time:
          <DatePicker
            selected={checkOut}
            startDate={checkIn}
            endDate={checkOut}
            minDate={checkOutMinDate}
            maxDate={maxDate}
            placeholderText="Check-out Date"
            onChange={(date) => setCheckOut(date as Date)}
            className="w-full p-2 border-2"
          />
        </label>
      </div>
      <div className="flex flex-col md:flex-row w-full gap-4">
        <label className="flex-1">
          Adults:
          <input
            type="number"
            min={1}
            max={20}
            value={adultCount}
            className="w-full p-2 border-2"
            onChange={(event) => setAdultCount(parseInt(event.target.value))}
          />
        </label>
        <label className="flex-1">
          Children:
          <input
            type="number"
            min={0}
            max={20}
            value={childCount}
            className="w-full p-2 border-2"
            onChange={(event) => setChildCount(parseInt(event.target.value))}
          />
        </label>
      </div>
      <div className="flex flex-col md:flex-row w-full gap-4">
        <label className="flex-1">
          Room:
          <select
            value={roomType}
            className="w-full p-2 border-2"
            onChange={(event) => setRoomType(event.target.value)}
          >
            <option value="">Select Type</option>
            {Object.values(RoomTypes).map((roomType, index) => (
              <option key={index} value={roomType}>
                {roomType}
              </option>
            ))}
          </select>
        </label>
        <label className="flex-1">
          Count:
          <input
            type="number"
            min={1}
            max={20}
            value={roomCount}
            className="w-full p-2 border-2"
            onChange={(event) => setRoomCount(parseInt(event.target.value))}
          />
        </label>
      </div>
      <div className="flex items-center w-full gap-2 p-2 border-2">
        <input
          placeholder="Enter destination..."
          value={destination}
          className="flex-1 p-2 border-2"
          onChange={(event) => {
            setDestination(event.target.value);
          }}
        />
      </div>
      <button
        type="submit"
        className="mx-auto px-10 rounded-md bg-blue-400 text-xl font-semibold text-white flex items-center p-2 hover:bg-blue-500"
      >
        SEARCH
      </button>
      <GoogleMap
        searchInput={searchInput}
        onInputChange={handleSearchInputChange}
        sendDataToParent={handleData}
      />
    </form>
  );
};

export default SearchBar;
