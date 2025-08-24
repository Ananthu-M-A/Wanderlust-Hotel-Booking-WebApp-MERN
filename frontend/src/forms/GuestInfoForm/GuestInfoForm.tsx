import { useForm } from "react-hook-form";
import DatePicker from "react-datepicker";
import { useSearchContext } from "../../contexts/SearchContext";
import { useAppContext } from "../../contexts/AppContext";
import { useLocation, useNavigate } from "react-router-dom";
import { GuestInfoFormData, RoomType } from "../../../../types/types";
import { useEffect, useState } from "react";
import * as apiClient from "../../api-client";
import { useMutation } from "@tanstack/react-query";

type Props = {
    hotelId: string;
    roomTypes: RoomType[];
}

const GuestInfoForm = ({ hotelId, roomTypes }: Props) => {
    const search = useSearchContext();
    const { showToast, isLoggedIn } = useAppContext();
    const [totalCost, setTotalCost] = useState<number>(0);
    const [roomAvailability, setRoomAvailability] = useState<number>(0);
    const navigate = useNavigate();
    const location = useLocation();

    const { watch, register, handleSubmit, setValue, formState: { errors } } = useForm<GuestInfoFormData>({
        defaultValues: {
            checkIn: search.checkIn,
            checkOut: search.checkOut,
            adultCount: search.adultCount,
            childCount: search.childCount,
            roomType: search.roomType,
            roomCount: search.roomCount,
            roomPrice: search.roomPrice
        }
    });

    const checkIn = watch("checkIn");
    const checkOut = watch("checkOut");
    const roomType = watch("roomType");
    const roomCount = watch("roomCount");
    const roomPrice = watch("roomPrice");
    const adultCount = watch("adultCount");
    const childCount = watch("childCount");

    const nightsPerStay = checkIn && checkOut
        ? Math.floor((checkOut.getTime() - checkIn.getTime()) / (24 * 60 * 60 * 1000))
        : 0;

    useEffect(() => {
        const selectedRoom = roomTypes.find(r => r.type === roomType);
        if (selectedRoom) {
            setValue("roomPrice", selectedRoom.price);
            setRoomAvailability(selectedRoom.quantity);
        }

        if (checkIn && checkOut && roomCount && roomPrice && nightsPerStay) {
            const newTotalCost = roomCount * nightsPerStay * roomPrice;
            setTotalCost(newTotalCost);
        }

        search.saveSearchValues("", checkIn, checkOut, adultCount, childCount, roomType, roomCount, roomPrice, totalCost);
    }, [checkIn, checkOut, roomType, roomCount, roomPrice, nightsPerStay, totalCost, setValue]);

    const checkInMinDate = new Date();
    checkInMinDate.setDate(checkInMinDate.getDate() + 1);
    const checkOutMinDate = checkIn ? new Date(checkIn.getTime() + 24 * 60 * 60 * 1000) : new Date();
    const maxDate = new Date();
    maxDate.setFullYear(maxDate.getFullYear() + 1);

    const onLoginClick = (data: GuestInfoFormData) => {
        search.saveSearchValues("", data.checkIn, data.checkOut, data.adultCount, data.childCount, data.roomType, data.roomCount, roomPrice, totalCost);
        navigate("/login", { state: { from: location } });
    }

    const { mutateAsync } = useMutation({
        mutationFn: apiClient.createCheckoutSession,
        onSuccess: () => showToast({ message: "Booking Saved!", type: "SUCCESS" }),
        onError: (error) => {
            if (error instanceof Error) console.error(error.message, error);
            showToast({ message: "Current Requirement unavailable", type: "ERROR" });
        }
    });

    const onSubmit = async () => {
        const paymentData = { checkIn, checkOut, adultCount, childCount, roomType, roomCount, roomPrice, hotelId, nightsPerStay };
        await mutateAsync(paymentData);
    }

    return (
        <div className="flex flex-col p-4 bg-gray-200 border border-slate-300 rounded gap-4">
            <h3 className="text-md font-bold">₹{(nightsPerStay < 1) ? (roomPrice * roomCount) : totalCost}</h3>
            <form onSubmit={isLoggedIn ? handleSubmit(onSubmit) : handleSubmit(onLoginClick)}>
                <div className="grid grid-cols-1 gap-4 items-center">
                    <div>
                        <DatePicker
                            selected={checkIn} selectsStart minDate={checkInMinDate} maxDate={maxDate}
                            placeholderText="Check-in Date" wrapperClassName="min-w-full" className="min-w-full bg-white p-2 focus:outline-none"
                            required onChange={(date: Date) => {
                                setValue("checkIn", date);
                                const newDate = new Date(date.getTime());
                                newDate.setDate(newDate.getDate() + 1);
                                setValue("checkOut", newDate);
                            }}
                        />
                    </div>
                    <div>
                        <DatePicker
                            selected={checkOut} startDate={checkIn} endDate={checkOut}
                            minDate={checkOutMinDate} maxDate={maxDate} placeholderText="Check-out Date"
                            onChange={(date) => setValue("checkOut", date as Date)}
                            wrapperClassName="min-w-full" className="min-w-full bg-white p-2 focus:outline-none" required
                        />
                    </div>
                    <div className="flex bg-white px-2 py-1 gap-2">
                        <label className="items-center flex">
                            Adults:
                            <input type="number" min={1} max={20} {...register("adultCount", {
                                required: "This field is required", min: { value: 1, message: "At least one adult" }, valueAsNumber: true
                            })}
                                className="w-full p-1 focus:outline-none font-bold" />
                        </label>
                        <label className="items-center flex">
                            Children:
                            <input type="number" min={0} max={20} {...register("childCount", { valueAsNumber: true })}
                                className="w-full p-1 focus:outline-none font-bold" />
                        </label>
                        {errors.adultCount && (
                            <span className="text-red-500 font-semibold text-sm">{errors.adultCount.message}</span>
                        )}
                    </div>
                    <div className="flex bg-white px-2 py-1 gap-2">
                        <label className="items-center flex">
                            Room:
                            <select className="p-2 focus:outline-none font-bold" {...register("roomType")} onChange={(e) => {
                                const selectedRoom = roomTypes.find(rt => rt.type === e.target.value);
                                if (selectedRoom) {
                                    setValue("roomType", selectedRoom.type);
                                    setValue("roomPrice", selectedRoom.price || 0);
                                    setValue("roomCount", 1);
                                }
                            }}>
                                <option value="">Select Type</option>
                                {roomTypes.map((rt, idx) => (rt.price !== 0 && <option key={idx} value={rt.type}>{rt.type}</option>))}
                            </select>
                        </label>
                        <label className="items-center flex">
                            Count:
                            <input type="number" min={1} max={roomAvailability} {...register("roomCount", { valueAsNumber: true })}
                                className="w-full p-1 focus:outline-none font-bold" />
                        </label>
                    </div>
                    <button className="mx-auto px-10 rounded-md bg-blue-400 text-xl font-semibold text-white flex items-center p-2 hover:bg-blue-500">
                        {isLoggedIn ? 'Book Now' : 'Log in to Book'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default GuestInfoForm;
