import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import * as apiClient from "../../../api-client";


const BookingDetails = () => {
    const { bookingId } = useParams();
    const { data: bookingDetails } = useQuery("loadBookingDetails",
        () => apiClient.loadBookingDetails(bookingId as string));
    return (
        <div className="container mx-auto bg-gray-300 p-5 border border-slate-300 rounded space-y-5">
            <h1 className="text-2xl font-bold mb-4">Booking Details</h1>
            {bookingDetails && (
                <div key={bookingDetails._id} className="bg-white rounded shadow p-4 hover:shadow-lg scroll">
                    <div className="flex justify-between">
                        {bookingDetails.hotelId && (<>
                            <span className="text-lg font-semibold mb-2">{bookingDetails.hotelId.name}
                                <h6 className="text-sm font-semibold text-gray-600">Hotel</h6>
                            </span>
                        </>)}
                        {bookingDetails.restaurantId && (<>
                            <span className="text-lg font-semibold mb-2">{bookingDetails.restaurantId.name}
                                <h6 className="text-sm font-semibold text-gray-600">Restaurant</h6>
                            </span>
                        </>)}
                        {(bookingDetails.bookingStatus === "active") ?
                            (<p className="flex">
                                Cancel option available
                            </p>) :
                            (bookingDetails.bookingStatus === "cancelled") ?
                                <> {`${bookingDetails.bookingStatus} on ${bookingDetails.cancellationDate}`} </> :
                                (bookingDetails.bookingStatus === "Booking Confirmed") ?
                                    <div className="flex">{`${bookingDetails.bookingStatus}`}
                                    </div> :
                                    <></>}
                    </div>
                    <p>Booking ID: {bookingDetails._id}</p>
                    {bookingDetails.roomDetails && <>
                        <p>Check-in: {new Date(bookingDetails.checkIn).toLocaleDateString()}</p>
                        <p>Check-out: {new Date(bookingDetails.checkOut).toLocaleDateString()}</p>
                        <p>Rooms Details: {`${bookingDetails.roomDetails.roomType} Bed Rooms, ₹${bookingDetails.roomDetails.roomPrice}, ${bookingDetails.roomDetails.roomCount} Nos`}</p>
                    </>}
                    {bookingDetails.foodDetails && <>
                        <p>Booked Date: {bookingDetails.dateOfBooking}</p>
                        <p>Food Details: {`${bookingDetails.foodDetails.foodItem} of price ₹${bookingDetails.foodDetails.foodPrice} for ${bookingDetails.guestCount} guests`}</p>
                    </>}
                    <p>Date of Booking: {new Date(bookingDetails.bookingDate).toLocaleDateString()}</p>
                    <p>Total Cost: ₹{bookingDetails.totalCost}</p>
                    <div className="w-full h-[300px] mt-2">
                        {bookingDetails.hotelId && <img src={bookingDetails.hotelId.imageUrls[0]} className="w-full h-full object-cover object-center" alt="Hotel" />}
                        {bookingDetails.restaurantId && <img src={bookingDetails.restaurantId.imageUrls[0]} className="w-full h-full object-cover object-center" alt="Restaurant" />}
                    </div>

                </div>
            )}
        </div>
    );
};

export default BookingDetails;
