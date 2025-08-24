import { useQuery } from '@tanstack/react-query';
import * as apiClient from "../../api-client";
import DashboardChart from '../../components/charts/DashboardChart';
import { SearchBookingResponse } from '../../../../types/types';

const BookingData = {
    bookingId: "",
    page: "1",
};

const Dashboard = () => {
    const { data: bookings, isLoading, error } = useQuery<SearchBookingResponse>({
        queryKey: ["loadBookingsTable", BookingData],
        queryFn: () => apiClient.loadBookingsTable(BookingData),
    });

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (error || !bookings) {
        return <div>Error loading bookings data.</div>;
    }

    const totalBookings = bookings.data.length;
    const totalCost = bookings.data.reduce((total, booking) => total + booking.totalCost, 0);

    return (
        <div className="container mx-auto px-4 py-8 bg-gray-300 border border-slate-300 rounded space-y-5">
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <div className="bg-gray-100 p-4 rounded-lg shadow-md">
                <DashboardChart bookings={bookings} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-100 p-4 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-2">Total Bookings</h2>
                    <p className="text-3xl font-bold">{totalBookings}</p>
                </div>
                <div className="bg-gray-100 p-4 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-2">Total Revenue</h2>
                    <p className="text-3xl font-bold">₹{totalCost?.toFixed(2)}</p>
                </div>
            </div>

            {bookings.data.length > 0 && (
                <>
                    <h2 className="text-2xl font-semibold mt-8 mb-4">Recent Bookings</h2>
                    <div className="overflow-x-auto">
                        <table className="table-auto w-full border-collapse border border-gray-800">
                            <thead>
                                <tr className="bg-gray-200">
                                    <th className="border border-gray-800 px-4 py-2">Booking ID</th>
                                    <th className="border border-gray-800 px-4 py-2">Hotel/Restaurant</th>
                                    <th className="border border-gray-800 px-4 py-2">Date of Booking</th>
                                    <th className="border border-gray-800 px-4 py-2">Total Cost</th>
                                </tr>
                            </thead>
                            <tbody>
                                {bookings.data.slice(0, 5).map(booking => (
                                    <tr key={booking._id} className="bg-white">
                                        <td className="border border-gray-800 px-4 py-2">{booking._id}</td>
                                        <td className="border border-gray-800 px-4 py-2">
                                            {booking.hotelId?.name || booking.restaurantId?.name}
                                        </td>
                                        <td className="border border-gray-800 px-4 py-2">{new Date(booking.bookingDate).toDateString()}</td>
                                        <td className="border border-gray-800 px-4 py-2">₹{booking.totalCost}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </div>
    );
};

export default Dashboard;
