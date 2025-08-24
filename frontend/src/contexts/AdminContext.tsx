import React, { useContext, useState } from "react";
import Toast from "../components/Toast";
import { useQuery } from "@tanstack/react-query";
import * as apiClient from '../api-client';
import { ToastMessage } from "../../../types/types";


type AdminContextType = {
    showToast: (toastMessage: ToastMessage) => void;
    isAdminLoggedIn: boolean;
}

const AdminContext = React.createContext<AdminContextType | undefined>(undefined);


export const AdminContextProvider = ({
    children,
}: {
    children: React.ReactNode;
}) => {
    const [toast, setToast] = useState<ToastMessage | undefined>(undefined);

    const { isError } = useQuery({
        queryKey: ["validateAdminToken"],
        queryFn: apiClient.validateAdminToken,
        retry: false
    });

    return (
        <AdminContext.Provider value={{
            showToast: (toastMessage) => {
                setToast(toastMessage);
            },
            isAdminLoggedIn: !isError,
        }}>
            {toast && (<Toast message={toast.message} type={toast.type} onClose={() => { setToast(undefined) }} />)}
            {children}
        </AdminContext.Provider>
    )
};

export const useAdminContext = () => {
    const context = useContext(AdminContext);
    if (!context) {
        throw new Error("useAdminContext must be used within an AdminContextProvider");
    }
    return context;
}
