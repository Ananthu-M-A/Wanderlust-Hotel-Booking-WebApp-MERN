import { useMutation } from '@tanstack/react-query';
import ManageHotelForm from '../../../forms/ManageHotelForm/ManageHotelForm';
import { useAppContext } from '../../../contexts/AppContext';
import * as apiClient from '../../../api-client';
import { useNavigate } from 'react-router-dom';

const AddHotel = () => {
    const { showToast } = useAppContext();
    const navigate = useNavigate();

    const { mutate, isLoading } = useMutation(apiClient.addHotel, {
        onSuccess: () => {
            showToast({ message: "Hotel Added!", type: "SUCCESS" });
            navigate('/admin/hotels');
        },
        onError: () => {
            showToast({ message: "Error adding hotel", type: "ERROR" });
            navigate('/admin/hotels');
        }
    });

    const handleSave = (hotelFormData: FormData) => {
        mutate(hotelFormData);
    }

    return (<ManageHotelForm onSave={handleSave} isLoading={isLoading} />)
}

export default AddHotel;
