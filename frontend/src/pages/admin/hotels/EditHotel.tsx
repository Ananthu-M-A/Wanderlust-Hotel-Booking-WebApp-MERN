import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import * as apiClient from "../../../api-client";
import ManageHotelForm from "../../../forms/ManageHotelForm/ManageHotelForm";
import { useAppContext } from "../../../contexts/AppContext";

const EditHotel = () => {
    const { hotelId } = useParams();
    const { showToast } = useAppContext();
    const navigate = useNavigate();
    const { data: hotel } = useQuery("loadHotelById",
        () => apiClient.loadHotelById(hotelId || ''), {
        enabled: !!hotelId,
    }
    );

    const { mutate, isLoading } = useMutation(apiClient.updateHotelById, {
        onSuccess: () => {
            showToast({ message: "Hotel Updated!", type: "SUCCESS" });
            navigate('/admin/hotels');
        },
        onError: () => {
            showToast({ message: "Error updating hotel", type: "ERROR" });
            navigate('/admin/hotels');
        }
    });

    const handleSave = (hotelFormData: FormData) => {
        mutate(hotelFormData);
    }

    return <ManageHotelForm hotel={hotel} onSave={handleSave} isLoading={isLoading} />
}

export default EditHotel;
