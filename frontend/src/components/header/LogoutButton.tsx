import { useMutation, useQueryClient } from "@tanstack/react-query"; // updated import
import * as apiClient from '../../api-client';
import { useAppContext } from "../../contexts/AppContext";
import { useNavigate } from "react-router-dom";

type Props = {
    isAdmin: boolean;
}

const LogoutButton = ({ isAdmin }: Props) => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { showToast } = useAppContext();

    const mutationAdmin = useMutation({
        mutationFn: apiClient.adminLogout,
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ["validateAdminToken"] });
            showToast({ message: "Logged out Successfully!", type: "SUCCESS" });
            navigate("/adminLogin");
        },
        onError: (error: unknown) => {
            if (error instanceof Error)
                showToast({ message: error.message, type: "ERROR" });
        },
    });

    const mutationUser = useMutation({
        mutationFn: apiClient.logout,
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ["validateToken"] });
            showToast({ message: "Logged out Successfully!", type: "SUCCESS" });
            navigate("/search");
        },
        onError: (error: unknown) => {
            if (error instanceof Error)
                showToast({ message: error.message, type: "ERROR" });
        },
    });

    const handleClick = () => {
        if (isAdmin) mutationAdmin.mutate();
        else mutationUser.mutate();
    };

    return (
        <button
            onClick={handleClick}
            className="px-4 py-2 cursor-pointer text-black font-semibold hover:bg-gray-100"
        >
            Logout
        </button>
    );
}

export default LogoutButton;
