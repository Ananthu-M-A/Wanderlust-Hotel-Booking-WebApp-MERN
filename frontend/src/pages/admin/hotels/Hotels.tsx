import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import * as apiClient from '../../../api-client';
import { useEffect, useState, useCallback } from "react";
import Pagination from "../../../components/search/filters/Pagination";
import ConfirmModal from "../../../components/ConfirmModal";

const Hotels = () => {
    const [searchData, setSearchData] = useState("");
    const [page, setPage] = useState<number>(1);
    const queryClient = useQueryClient();
    const [showModal, setShowModal] = useState(false);
    const [hotelId, setHotelId] = useState("");
    const [blockStatus, setBlockStatus] = useState(false);

    const searchParams = {
        destination: searchData,
        page: page.toString(),
    };

    const { data: hotelData, refetch } = useQuery({
        queryKey: ["loadHotels", searchParams],
        queryFn: () => apiClient.loadHotels(searchParams),
        refetchOnWindowFocus: false,
        refetchInterval: 5000,
        enabled: !!searchData,
    });

    const blockHotel = useMutation({
        mutationFn: apiClient.blockHotel,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["loadHotels"] });
        },
    });

    const unblockHotel = useMutation({
        mutationFn: apiClient.unblockHotel,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["loadHotels"] });
        },
    });

    const handleBlock = useCallback((hotelId: string) => {
        setHotelId(hotelId);
        setBlockStatus(false);
        setShowModal(true);
    }, []);

    const handleUnblock = useCallback((hotelId: string) => {
        setHotelId(hotelId);
        setBlockStatus(true);
        setShowModal(true);
    }, []);

    const handleClear = () => {
        setSearchData("");
    };

    useEffect(() => {
        refetch();
    }, [handleBlock, handleUnblock, refetch]);

    return (
        <div className="bg-gray-300 p-5 border border-slate-300 rounded space-y-5">
            <span className="flex justify-between">
                <h1 className="text-3xl font-bold">Hotels</h1>
                <Link
                    to="/admin/add-hotel"
                    className="mx-auto rounded-md bg-blue-400 text-md font-semibold text-white flex items-center p-2 mr-0 hover:bg-blue-500"
                >
                    Add Hotel
                </Link>
            </span>
            <ConfirmModal
                isOpen={showModal}
                message={`Do you really wish to ${blockStatus ? "Unblock" : "Block"} ${hotelId}`}
                onClose={() => setShowModal(false)}
                onConfirm={async () => {
                    setShowModal(false);
                    if (blockStatus) {
                        await unblockHotel.mutateAsync(hotelId);
                    } else {
                        await blockHotel.mutateAsync(hotelId);
                    }
                }}
            />
            <div className="overflow-x-auto">
                <div className="flex flex-row items-center flex-1 bg-white p-2 border rounded mb-2">
                    <input
                        placeholder="Search hotels by name or place..."
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
                <table className="table-auto w-full border-collapse border border-gray-800">
                    <thead>
                        <tr className="bg-gray-200">
                            <th className="border border-gray-800 px-4 py-2">Hotel Name</th>
                            <th className="border border-gray-800 px-4 py-2">Place</th>
                            <th className="border border-gray-800 px-4 py-2">Hotel ID</th>
                            <th className="border border-gray-800 px-4 py-2">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {hotelData && hotelData.data.length > 0 ? (
                            hotelData.data.map((hotel) => (
                                <tr key={hotel._id} className="bg-white">
                                    <td className="border border-gray-800 px-4 py-2">{hotel.name}</td>
                                    <td className="border border-gray-800 px-4 py-2">
                                        {`${hotel.city}, ${hotel.country}`}
                                    </td>
                                    <td className="border border-gray-800 px-4 py-2">{hotel._id}</td>
                                    <td className="border border-gray-800 px-4 py-2">
                                        <div className="flex justify-center">
                                            <span className="mr-4">
                                                <Link
                                                    to={`/admin/edit-hotel/${hotel._id}`}
                                                    className="flex text-black text-lg font-semibold p-2 hover:shadow-lg px-2 py-1"
                                                >
                                                    View
                                                </Link>
                                            </span>
                                            <span>
                                                {hotel.isBlocked ? (
                                                    <button
                                                        onClick={() => handleUnblock(hotel._id)}
                                                        className="w-100 text-blue-600 h-full p-2 font-semibold text-lg hover:text-red-600 hover:shadow-lg px-2 py-1"
                                                    >
                                                        Unblock
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => handleBlock(hotel._id)}
                                                        className="w-100 text-red-600 h-full p-2 font-semibold text-lg hover:text-blue-600 hover:shadow-lg px-2 py-1"
                                                    >
                                                        Block
                                                    </button>
                                                )}
                                            </span>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={4} className="text-center py-4">
                                    List empty
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
                <Pagination
                    page={hotelData?.pagination.page || 1}
                    pages={hotelData?.pagination.pages || 1}
                    onPageChange={(page) => setPage(page)}
                />
            </div>
        </div>
    );
};

export default Hotels;
