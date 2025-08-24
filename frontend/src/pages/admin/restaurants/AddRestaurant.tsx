import { useMutation } from '@tanstack/react-query';
import { useAppContext } from '../../../contexts/AppContext';
import * as apiClient from '../../../api-client';
import { useNavigate } from 'react-router-dom';
import ManageRestaurantForm from '../../../forms/ManageRestaurantForm/ManageRestaurantForm';

const AddRestaurant = () => {
    const { showToast } = useAppContext();
    const navigate = useNavigate();

    const { mutate, isLoading } = useMutation(apiClient.addRestaurant, {
        onSuccess: () => {
            
            showToast({ message: "Restaurant Added!", type: "SUCCESS" });
            navigate('/admin/restaurants');
        },
        onError: () => {
            showToast({ message: "Error adding restaurant", type: "ERROR" });
            navigate('/admin/restaurants');
        }
    });

    const handleSave = (restaurantFormData: FormData) => {
        mutate(restaurantFormData);
    }

    return (<ManageRestaurantForm onSave={handleSave} isLoading={isLoading} />)
}

export default AddRestaurant;
