import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as apiClient from '../../../api-client';
import { useAppContext } from "../../../contexts/AppContext";
import { useEffect } from "react";
import { RegisterFormData } from "../../../../../types/types";


const Profile = () => {
    const queryClient = useQueryClient();
    const { showToast } = useAppContext();
    const { register, handleSubmit, formState: { errors }, setValue } = useForm<RegisterFormData>();

    const { data: user } = useQuery("loadAccount", apiClient.loadAccount,
        {
            onSuccess: () => { },
            onError: () => { }
        }
    );

    useEffect(() => {
        if (user) {
            setValue('firstName', user.firstName);
            setValue('lastName', user.lastName);
            setValue('email', user.email);
            setValue('mobile', user.mobile);
            setValue('imageUrl', user.imageUrl);
            setValue('imageFile', user.imageFile);
        }
    }, [user, setValue]);

    const { mutate, isLoading } = useMutation(apiClient.updateProfile, {
        onSuccess: async () => {
            await queryClient.invalidateQueries("validateToken");
            showToast({ message: "Profile updated!", type: "SUCCESS" });
            window.location.reload();
        },
        onError: (error: Error) => { showToast({ message: error.message, type: "ERROR" }) },
    });

    const onSubmit = handleSubmit(async (data) => {
        const formData = new FormData();
        formData.append("firstName", data.firstName);
        formData.append("lastName", data.lastName);
        formData.append("email", data.email);
        formData.append("mobile", data.mobile);
        formData.append("password", data.password);
        formData.append("imageUrl", data.imageUrl)
        if (data.imageFile) {
            formData.append("imageFile", data.imageFile[0]);
        }

        mutate(formData);
    });


    return (
        <>
            <form className="flex flex-col gap-5 bg-gray-200 border border-slate-300 rounded p-5" onSubmit={onSubmit} encType="multipart/form-data">
                <h2 className="text-3xl font-bold">Profile</h2>
                <div className="flex items-center justify-center">
                    <div className="h-20 w-20 overflow-hidden bg-gray-300 rounded-full border-4 flex-shrink-0">
                        {user && <img className="h-full w-full object-cover"
                            src={user.imageUrl ? user.imageUrl : `https://imgs.search.brave.com/2KQdMpY4bONwTDqYNqr58Dzd9X_s001WHDag-YFcRXE/rs:fit:860:0:0/g:ce/aHR0cHM6Ly9hc3Nl/dHMuc3RpY2twbmcu/Y29tL3RodW1icy81/ODVlNGJmM2NiMTFi/MjI3NDkxYzMzOWEu/cG5n`} alt="Profile Picture" />}
                    </div>
                </div>
                <div className="flex flex-col md:flex-row gap-5">
                    <label className="text-gray-700 text-sm font-bold flex-1">
                        First Name
                        <input className="border rounded w-full py-1 px-2 font-normal"
                            {...register("firstName", {
                                required: "This feild is required",
                                pattern: {
                                    value: /^[A-Za-z]+(?: [A-Za-z]+)*$/, message: 'Only alphabets are allowed, Eg:- Ananthu'
                                }
                            })}></input>
                        {errors.firstName && (<span className="text-red-500">{errors.firstName.message}</span>)}
                    </label>
                    <label className="text-gray-700 text-sm font-bold flex-1">
                        Last Name
                        <input className="border rounded w-full py-1 px-2 font-normal"
                            {...register("lastName", {
                                required: "This feild is required",
                                pattern: {
                                    value: /^[A-Za-z]+(?: [A-Za-z]+)*$/, message: 'Only alphabets are allowed, Eg:- M A'
                                }
                            })}></input>
                        {errors.lastName && (<span className="text-red-500">{errors.lastName.message}</span>)}
                    </label>
                </div>
                <div className="flex flex-col md:flex-row gap-5">
                    <label className="text-gray-700 text-sm font-bold flex-1">
                        Email
                        <input type="email" disabled
                            className="border rounded w-full py-1 px-2 font-normal bg-gray-100"
                            {...register('email', {
                                required: "This feild is required",
                                pattern: { value: /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/, message: "Enter a valid Email, Eg:- user@example.com" },
                            })}></input>
                        {errors.email && (<span className="text-red-500">{errors.email.message}</span>)}
                    </label>
                    <label className="text-gray-700 text-sm font-bold flex-1">
                        Mobile
                        <input type="tel"
                            className="border rounded w-full py-1 px-2 font-normal"
                            {...register("mobile", {
                                required: "This feild is required",
                                pattern: { value: /^[0-9]{10}$/, message: "Enter a valid 10 digit mobile number" },
                            })}></input>
                        {errors.mobile && (<span className="text-red-500">{errors.mobile.message}</span>)}
                    </label>
                    <label className="text-gray-700 text-sm font-bold flex-1">
                        Profile Picture
                        <input type="file" accept="image/*"
                            className="w-full text-gray-700 font-normal border bg-gray-100"
                            {...register("imageFile")} />
                        {errors.imageFile && (<span className="text-red-500">{errors.imageFile.message}</span>)}
                    </label>
                </div>
                <div className="flex flex-col md:flex-row gap-5">
                    <label className="text-gray-700 text-sm font-bold flex-1">
                        Password
                        <input type="password"
                            className="border rounded w-full py-1 px-2 font-normal"
                            {...register("password", {
                                required: "This feild is required",
                                pattern: {
                                    value: /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@#$%^&+=!])[A-Za-z\d@#$%^&+=!]{6,}$/,
                                    message: "Enter a valid password with uppercase, lowercase, digits & special characters(Minimum length of 6), Eg:- A5dfg$"
                                },
                            })}>
                        </input>
                        {errors.password && (<span className="text-red-500">{errors.password.message}</span>)}
                    </label>
                </div>
                <span>
                    <button className="mx-auto px-10 rounded-md bg-blue-400 text-xl font-semibold text-white flex items-center p-2 hover:bg-blue-500">
                        {isLoading ? <span>Updating...</span> : <span>Update Profile</span>}
                    </button>
                </span>
            </form>
        </>
    );
};

export default Profile;
