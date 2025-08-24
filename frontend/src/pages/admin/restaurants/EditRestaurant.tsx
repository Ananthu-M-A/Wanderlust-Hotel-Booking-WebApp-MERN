import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import * as apiClient from "../../../api-client";
import { useAppContext } from "../../../contexts/AppContext";
import ManageRestaurantForm from "../../../forms/ManageRestaurantForm/ManageRestaurantForm";

const EditRestaurant = () => {
    const { restaurantId } = useParams();
    const { showToast } = useAppContext();
    const navigate = useNavigate();
    const { data: restaurant } = useQuery("loadRestaurantById",
        () => apiClient.loadRestaurantById(restaurantId || ''), {
        enabled: !!restaurantId,
    }
    );

    const { mutate, isLoading } = useMutation(apiClient.updateRestaurantById, {
        onSuccess: () => {
            showToast({ message: "Restaurant Updated!", type: "SUCCESS" });
            navigate('/admin/restaurants');
        },
        onError: () => {
            showToast({ message: "Error updating restaurant", type: "ERROR" });
            navigate('/admin/restaurants');
        }
    });

    const handleSave = (restaurantFormData: FormData) => {
        mutate(restaurantFormData);
    }

    return <ManageRestaurantForm restaurant={restaurant} onSave={handleSave} isLoading={isLoading} />
}

export default EditRestaurant;
