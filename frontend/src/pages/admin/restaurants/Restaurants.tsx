import { useMutation, useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import * as apiClient from '../../../api-client';
import { useEffect, useState, useCallback } from "react";
import Pagination from "../../../components/search/filters/Pagination";
import ConfirmModal from "../../../components/ConfirmModal";

const Restaurants = () => {
    const [searchData, setSearchData] = useState("");
    const [page, setPage] = useState<number>(1);
    const [showModal, setShowModal] = useState(false);
    const [restaurantId, setRestaurantId] = useState("");
    const [blockStatus, setBlockStatus] = useState(false);

    const searchParams = {
        destination: searchData,
        page: page.toString(),
    };

    const { data: restaurantData, refetch } = useQuery({
        queryKey: ["loadRestaurants", searchParams],
        queryFn: () => apiClient.loadRestaurants(searchParams),
        refetchOnWindowFocus: false,
        refetchInterval: 5000,
        enabled: !!searchData,
    });

    const blockRestaurant = useMutation({
        mutationFn: apiClient.blockRestaurant,
        onSuccess: () => {
            refetch();
        },
    });

    const unblockRestaurant = useMutation({
        mutationFn: apiClient.unblockRestaurant,
        onSuccess: () => {
            refetch();
        },
    });

    const handleBlock = useCallback((restaurantId: string) => {
        setRestaurantId(restaurantId);
        setBlockStatus(false);
        setShowModal(true);
    }, []);

    const handleUnblock = useCallback((restaurantId: string) => {
        setRestaurantId(restaurantId);
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
                <h1 className="text-3xl font-bold">Restaurants</h1>
                <Link
                    to="/admin/add-restaurant"
                    className="mx-auto rounded-md bg-blue-400 text-md font-semibold text-white flex items-center p-2 mr-0 hover:bg-blue-500"
                >
                    Add Restaurant
                </Link>
            </span>
            <ConfirmModal
                isOpen={showModal}
                message={`Do you really wish to ${blockStatus ? "Unblock" : "Block"} ${restaurantId}`}
                onClose={() => setShowModal(false)}
                onConfirm={async () => {
                    setShowModal(false);
                    if (blockStatus) {
                        await unblockRestaurant.mutateAsync(restaurantId);
                    } else {
                        await blockRestaurant.mutateAsync(restaurantId);
                    }
                }}
            />
            <div className="overflow-x-auto">
                <div className="flex flex-row items-center flex-1 bg-white p-2 border rounded mb-2">
                    <input
                        placeholder="Search restaurants by name or place..."
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
                            <th className="border border-gray-800 px-4 py-2">Restaurant Name</th>
                            <th className="border border-gray-800 px-4 py-2">Place</th>
                            <th className="border border-gray-800 px-4 py-2">Restaurant ID</th>
                            <th className="border border-gray-800 px-4 py-2">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {restaurantData && restaurantData.data.length > 0 ? (
                            restaurantData.data.map((restaurant) => (
                                <tr key={restaurant._id} className="bg-white">
                                    <td className="border border-gray-800 px-4 py-2">{restaurant.name}</td>
                                    <td className="border border-gray-800 px-4 py-2">
                                        {`${restaurant.city}, ${restaurant.country}`}
                                    </td>
                                    <td className="border border-gray-800 px-4 py-2">{restaurant._id}</td>
                                    <td className="border border-gray-800 px-4 py-2">
                                        <div className="flex justify-center">
                                            <span className="mr-4">
                                                <Link
                                                    to={`/admin/edit-restaurant/${restaurant._id}`}
                                                    className="flex text-black text-lg font-semibold p-2 hover:shadow-lg px-2 py-1"
                                                >
                                                    View
                                                </Link>
                                            </span>
                                            <span>
                                                {restaurant.isBlocked ? (
                                                    <button
                                                        onClick={() => handleUnblock(restaurant._id)}
                                                        className="w-100 text-blue-600 h-full p-2 font-semibold text-lg hover:text-red-600 hover:shadow-lg px-2 py-1"
                                                    >
                                                        Unblock
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => handleBlock(restaurant._id)}
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
                    page={restaurantData?.pagination.page || 1}
                    pages={restaurantData?.pagination.pages || 1}
                    onPageChange={(page) => setPage(page)}
                />
            </div>
        </div>
    );
};

export default Restaurants;
