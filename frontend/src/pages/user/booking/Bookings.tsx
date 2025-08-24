import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import * as apiClient from "../../../api-client";
import ConfirmModal from "../../../components/ConfirmModal";
import { BookingType } from "../../../../../types/types";

const Bookings = () => {
    const { bookingId } = useParams<{ bookingId?: string }>();
    const [showModal, setShowModal] = useState<boolean>(false);
    const [cancelId, setCancelId] = useState<string>(bookingId || "");
    const [searchData, setSearchData] = useState<string>(bookingId || "");
    const queryClient = useQueryClient();

    const { data: bookings, refetch } = useQuery("loadBookings", () => apiClient.loadBookings(searchData), {
        refetchOnWindowFocus: false,
        refetchInterval: 5000,
        enabled: !!searchData,
    });


    const handleClear = () => {
        setSearchData("");
    }

    const handleCancel = async (bookingId: string) => {
        setShowModal(true);
        setCancelId(bookingId);
    }
    
    const handleDownloadDoc = async (bookingId: string) => {
        try {
            const url = await apiClient.downloadDoc(bookingId);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `wanderlust_booking_id_${bookingId}.pdf`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error('Error downloading document:', error);
        }
    }

    const cancelBooking = useMutation<void, Error, string>(apiClient.cancelBooking, {
        onSuccess: () => {
            queryClient.invalidateQueries("loadBookings");
            refetch();
        }
    });

    useEffect(() => {
        refetch();
    }, [searchData]);

    const sortedFilteredBookings = searchData.trim() ? bookings?.filter(booking => (booking._id === searchData || booking._id === searchData)) : bookings;

    return (
        <div className="container mx-auto bg-gray-300 p-5 border border-slate-300 rounded">
            <ConfirmModal isOpen={showModal} message={`Do you really wish to cancel this booking?`}
                onClose={function (): void { setShowModal(false); }}
                onConfirm={async function (): Promise<void> {
                    await cancelBooking.mutateAsync(cancelId);
                    setShowModal(false);
                }} />
            <h1 className="text-2xl font-bold mb-4">Bookings</h1>
            <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 gap-4 border">
                <div className="flex flex-row items-center flex-1 bg-white p-2 border rounded">
                    <input
                        placeholder="Search bookings by booking ID..."
                        value={searchData}
                        className="text-md w-full focus:outline-none"
                        onChange={(event) => { setSearchData(event.target.value) }}
                    />
                    <button className="w-100 font-semibold text-lg hover:shadow px-2" onClick={handleClear}>
                        Clear
                    </button>
                </div>
                <div className="max-h-[500px] overflow-y-auto">
                    {(searchData === "") &&
                        <h6 className="ml-2">Showing latest bookings...</h6>}
                    {sortedFilteredBookings?.length ? sortedFilteredBookings.map((booking: BookingType) => (
                        <div key={booking._id} className="bg-white rounded shadow p-4 mt-5 hover:shadow-lg scroll">
                            <div className="flex justify-between">
                                {booking.hotelId && (<>
                                    <span className="text-lg font-semibold mb-2">{booking.hotelId.name}
                                        <h6 className="text-sm font-semibold text-gray-600">Hotel</h6>
                                    </span>
                                </>)}
                                {booking.restaurantId && (<>
                                    <span className="text-lg font-semibold mb-2">{booking.restaurantId.name}
                                        <h6 className="text-sm font-semibold text-gray-600">Restaurant</h6>
                                    </span>
                                </>)}
                                {(booking.bookingStatus === "active") ?
                                    (<button className="text-lg font-semibold px-2 text-black hover:shadow"
                                        onClick={() => { handleCancel(booking._id) }}>
                                        Cancel
                                    </button>) :
                                    (booking.bookingStatus === "cancelled") ?
                                        <> {`${booking.bookingStatus} on ${new Date(booking.cancellationDate).toLocaleDateString()}`} </> :
                                        (booking.bookingStatus === "Booking Confirmed") ?
                                            <div className="flex">{`${booking.bookingStatus}`}
                                                <div className="cursor-pointer" onClick={() => { handleDownloadDoc(booking._id) }}>
                                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                                                        <path fillRule="evenodd" d="M12 2.25a.75.75 0 0 1 .75.75v11.69l3.22-3.22a.75.75 0 1 1 1.06 1.06l-4.5 4.5a.75.75 0 0 1-1.06 0l-4.5-4.5a.75.75 0 1 1 1.06-1.06l3.22 3.22V3a.75.75 0 0 1 .75-.75Zm-9 13.5a.75.75 0 0 1 .75.75v2.25a1.5 1.5 0 0 0 1.5 1.5h13.5a1.5 1.5 0 0 0 1.5-1.5V16.5a.75.75 0 0 1 1.5 0v2.25a3 3 0 0 1-3 3H5.25a3 3 0 0 1-3-3V16.5a.75.75 0 0 1 .75-.75Z" clipRule="evenodd" />
                                                    </svg>
                                                </div>
                                            </div> :
                                            <></>}
                            </div>
                            <p>Booking ID: {booking._id}</p>
                            {booking.roomDetails && <>
                                <p>Check-in: {`${new Date(booking.checkIn).toLocaleDateString()} 02:00:00 PM`}</p>
                                <p>Check-out: {`${new Date(booking.checkOut).toLocaleDateString()} 12:00:00 PM`}</p>
                                <p>Rooms Details: {`${booking.roomDetails.roomType} Bed Rooms, ₹${booking.roomDetails.roomPrice}, ${booking.roomDetails.roomCount} Nos`}</p>
                            </>}
                            {booking.foodDetails && <>
                                <p>Booked Date: {new Date(booking.dateOfBooking).toLocaleDateString()}</p>
                                <p>Food Details: {`${booking.foodDetails.foodItem} of price ₹${booking.foodDetails.foodPrice} for ${booking.guestCount} guests`}</p>
                            </>}
                            <p>Date of Booking: {new Date(booking.bookingDate).toLocaleDateString()}</p>
                            <p>Total Cost: ₹{booking.totalCost}</p>
                            <div className="w-full h-[300px] mt-2">
                                {booking.hotelId && <img src={booking.hotelId.imageUrls[0]} className="w-full h-full object-cover object-center" alt="Hotel" />}
                                {booking.restaurantId && <img src={booking.restaurantId.imageUrls[0]} className="w-full h-full object-cover object-center" alt="Restaurant" />}
                            </div>

                        </div>
                    )) : (
                        <div>
                            <h6 className="ml-2">{searchData.trim() ? 'Click on search button' : 'List is empty. Book hotels '}
                                <Link to="/search"> now</Link>.
                            </h6>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Bookings;