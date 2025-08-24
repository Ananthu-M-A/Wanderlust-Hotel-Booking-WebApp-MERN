import { Link, useParams } from 'react-router-dom';
import { useSearchContext } from '../../../contexts/SearchContext';
import { useEffect } from 'react';

const BookingResultPage = () => {
  const { bookingId } = useParams();
  const search = useSearchContext();
  useEffect(()=>{
    search.clearSearchValues();
  },[ search ]);
  return (
    <div className="flex items-center justify-center">
      <div className="max-w-md p-8 bg-gray-200 border border-slate-300 shadow-lg rounded-lg">
        <h2 className="text-2xl font-semibold mb-4">Booking Successful!</h2>
        <p className="text-gray-700 mb-4">Thank you for booking another hotel.</p>
        <p className="text-gray-700 mb-4">Your hotel booking has been successfully placed.</p>
        <p className="text-gray-700 mb-4">Booking ID: {bookingId}</p>
        <p className="text-gray-700 mb-4"></p>
        <div className='flex items-center justify-center gap-5'>
          <Link to="/search" className="mx-auto px-10 mr-0 rounded-md bg-blue-400 text-xl font-semibold text-white flex items-center p-2 hover:bg-blue-500">
            <span>Go Home</span>
          </Link>
          <Link to={`/home/bookings/${bookingId}`} className="mx-auto px-10 mr-0 rounded-md bg-blue-400 text-xl font-semibold text-white flex items-center p-2 hover:bg-blue-500">
            <span>Orders</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BookingResultPage;
