import { useQuery } from "@tanstack/react-query";
import * as apiClient from "../../../api-client";
import { useEffect, useState } from "react";
import Pagination from "../../../components/search/filters/Pagination";
import { Link } from "react-router-dom";

const BookingsTable = () => {
  const [searchData, setSearchData] = useState<string>("");
  const [page, setPage] = useState<number>(1);

  const bookingQueryParams = {
    bookingId: searchData,
    page: page.toString(),
  };

  const {
    data: bookings,
    refetch,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["loadBookingsTable", bookingQueryParams],
    queryFn: () => apiClient.loadBookingsTable(bookingQueryParams),
    refetchOnWindowFocus: false,
    refetchInterval: 5000,
    enabled: !!searchData, // only fetch if search has value
  });

  const handleClear = () => {
    setSearchData("");
  };

  useEffect(() => {
    refetch();
  }, [refetch]);

  return (
    <div className="bg-gray-300 p-5 border border-slate-300 rounded space-y-5">
      <span className="flex justify-between">
        <h1 className="text-3xl font-bold">Bookings</h1>
      </span>
      <div className="overflow-x-auto">
        {/* Search Bar */}
        <div className="flex flex-row items-center flex-1 bg-white p-2 border rounded mb-2">
          <input
            placeholder="Search bookings by booking ID..."
            value={searchData}
            className="text-md w-full focus:outline-none"
            onChange={(event) => setSearchData(event.target.value)}
          />
          <button
            className="w-100 font-semibold text-lg hover:shadow px-2"
            onClick={handleClear}
          >
            Clear
          </button>
        </div>

        {/* Loading & Error States */}
        {isLoading && <p className="text-blue-500">Loading bookings...</p>}
        {error && <p className="text-red-500">Error loading bookings</p>}

        {/* Table */}
        <table className="table-auto w-full border-collapse border border-gray-800">
          <thead>
            <tr className="bg-gray-200">
              <th className="border border-gray-800 px-4 py-2">Booking ID</th>
              <th className="border border-gray-800 px-4 py-2">Hotel Name</th>
              <th className="border border-gray-800 px-4 py-2">DoB</th>
              <th className="border border-gray-800 px-4 py-2">Total Cost</th>
              <th className="border border-gray-800 px-4 py-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {bookings && bookings.data.length > 0 ? (
              bookings.data.map((booking) => (
                <tr key={booking._id} className="bg-white">
                  <td className="border border-gray-800 px-4 py-2">
                    {booking._id}
                  </td>
                  {booking.hotelId ? (
                    <td className="border border-gray-800 px-4 py-2">
                      {booking.hotelId.name}
                    </td>
                  ) : booking.restaurantId ? (
                    <td className="border border-gray-800 px-4 py-2">
                      {booking.restaurantId.name}
                    </td>
                  ) : (
                    <td className="border border-gray-800 px-4 py-2">-</td>
                  )}
                  <td className="border border-gray-800 px-4 py-2">
                    {new Date(booking.bookingDate).toDateString()}
                  </td>
                  <td className="border border-gray-800 px-4 py-2">
                    ₹{booking.totalCost}
                  </td>
                  <td className="border border-gray-800 px-4 py-2">
                    <div className="flex justify-center">
                      <span className="mr-4">
                        <Link
                          to={`/admin/booking-details/${booking._id}`}
                          className="flex text-black text-lg font-semibold p-2 hover:shadow-lg px-2 py-1"
                        >
                          View
                        </Link>
                      </span>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={5}
                  className="border border-gray-800 px-4 py-2 text-center"
                >
                  List empty
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination */}
        <Pagination
          page={bookings?.pagination.page || 1}
          pages={bookings?.pagination.pages || 1}
          onPageChange={(page) => setPage(page)}
        />
      </div>
    </div>
  );
};

export default BookingsTable;
