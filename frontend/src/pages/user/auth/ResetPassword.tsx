import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import * as apiClient from '../../../api-client';
import { useAppContext } from "../../../contexts/AppContext";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { ResetPasswordFormData } from "../../../../../types/types";

const ResetPassword = () => {
    const navigate = useNavigate();
    const { showToast } = useAppContext();
    const { register, watch, handleSubmit, formState: { errors } } = useForm<ResetPasswordFormData>();
    const [showComponent, setShowComponent] = useState<boolean>(false);
    const [timeLeft, setTimeLeft] = useState<number>(30);
    const [otp, setOtp] = useState<string>('');
    const [timerRunning, setTimerRunning] = useState<boolean>(false);

    const mutation = useMutation(apiClient.resetPassword, {
        onSuccess: async () => {
            showToast({ message: "OTP sent, Check your email!", type: "SUCCESS" });
            setShowComponent(true);
            setTimerRunning(true);
        },
        onError: (error: Error) => { showToast({ message: error.message, type: "ERROR" }) },
    });

    const mutationOtp = useMutation(apiClient.verifyResetPassword, {
        onSuccess: async () => {
            showToast({ message: "Password Reset!", type: "SUCCESS" });
            navigate('/login');
        },
        onError: (error: Error) => { showToast({ message: error.message, type: "ERROR" }) },
    });

    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (timerRunning) {
            interval = setInterval(() => {
                setTimeLeft((prevTime) => {
                    if (prevTime === 0) {
                        setTimerRunning(false);
                        clearInterval(interval);
                        setShowComponent(false);
                    }
                    return prevTime - 1;
                });
            }, 1000);
        }

        return () => clearInterval(interval);
    }, [timerRunning]);

    const onSubmit = handleSubmit((data) => {
        setTimeLeft(30);
        mutation.mutate(data);
        setTimerRunning(true);
    });

    const handleOtpVerification = () => {
        mutationOtp.mutate(otp);
    }

    return (
        <div className="bg-gray-200 border border-slate-300 rounded">
            <form className="flex flex-col gap-5 bg-gray-200 p-5 rounded" onSubmit={onSubmit}>
                <h2 className="text-3xl font-bold">Reset Password</h2>
                <label className="text-gray-700 text-sm font-bold flex-1">
                    Email
                    <input type="email"
                        className="border rounded w-full py-1 px-2 font-normal"
                        {...register('email', {
                            required: "This feild is required",
                            pattern: { value: /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/, message: "Enter a valid Email, Eg:- user@example.com" },
                        })}></input>
                    {errors.email && (<span className="text-red-500">{errors.email.message}</span>)}
                </label>
                <div className="flex flex-col md:flex-row gap-5">
                    <label className="text-gray-700 text-sm font-bold flex-1">
                        Enter New Password
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
                    <label className="text-gray-700 text-sm font-bold flex-1">
                        Confirm New Password
                        <input type="password"
                            className="border rounded w-full py-1 px-2 font-normal"
                            {...register("confirmPassword", {
                                validate: (val) => {
                                    if (!val) {
                                        return "This feild is required";
                                    } else if (watch("password") !== val) {
                                        return "Your passwords does not match";
                                    }
                                }
                            })}></input>
                        {errors.confirmPassword && (<span className="text-red-500">{errors.confirmPassword.message}</span>)}
                    </label>
                </div>
                <span>
                    <button type="submit" className="mx-auto px-10 rounded-md bg-blue-400 text-xl font-semibold text-white flex items-center p-2 hover:bg-blue-500">
                        Send OTP
                    </button>
                </span>
            </form>
            <div className="flex flex-col gap-5 bg-gray-200 pb-5 rounded">
                {showComponent && timeLeft > 0 && (
                    <span className="font-semibold text-center">Timer: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</span>
                )}

                {!showComponent && timeLeft < 0 && (
                    <span className="font-bold text-red-600 text-center">OTP Timeout! Send Again.</span>
                )}

                {showComponent && timeLeft > 0 && (
                    <>
                        <label className="text-gray-700 text-sm font-bold flex-1 p-5">
                            Enter OTP
                            <input
                                type="text"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                className="border rounded w-full py-1 px-2 font-normal"
                            />
                        </label>
                        <button
                            onClick={handleOtpVerification}
                            className="mx-auto rounded-md bg-blue-400 text-xl font-semibold text-white flex items-center p-2 hover:bg-blue-500"
                        >
                            Reset Password
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default ResetPassword;
