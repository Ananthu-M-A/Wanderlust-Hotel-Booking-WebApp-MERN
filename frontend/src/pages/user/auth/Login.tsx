import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as apiClient from "../../../api-client";
import { useAppContext } from "../../../contexts/AppContext";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { LoginFormData } from "../../../../../types/types";

const Login = () => {
  const queryClient = useQueryClient();
  const { showToast, isLoggedIn } = useAppContext();
  const navigate = useNavigate();
  const location = useLocation();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>();
  const mutation = useMutation({
    mutationFn: apiClient.login,
    onSuccess: async () => {
      showToast({ message: "Login Successful!", type: "SUCCESS" });
      await queryClient.invalidateQueries({ queryKey: ["validateToken"] });
      navigate(location.state?.from?.pathname || "/search");
    },
    onError: (error: Error) => {
      showToast({ message: error.message, type: "ERROR" });
    },
  });

  const onSubmit = handleSubmit((data) => {
    mutation.mutate(data);
  });

  useEffect(() => {
    if (isLoggedIn) {
      navigate("/search");
    }
  }, [isLoggedIn, navigate]);

  return (
    <form
      className="flex flex-col gap-5 bg-gray-200 p-5 rounded"
      onSubmit={onSubmit}
    >
      <h2 className="text-3xl font-bold">Login</h2>
      <label className="text-gray-700 text-sm font-bold flex-1">
        Email
        <input
          type="email"
          className="border rounded w-full py-1 px-2 font-normal"
          {...register("email", {
            required: "This feild is required",
            pattern: {
              value: /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/,
              message: "Enter a valid Email, Eg:- user@example.com",
            },
          })}
        ></input>
        {errors.email && (
          <span className="text-red-500">{errors.email.message}</span>
        )}
      </label>
      <label className="text-gray-700 text-sm font-bold flex-1">
        Password
        <input
          type="password"
          className="border rounded w-full py-1 px-2 font-normal"
          {...register("password", {
            required: "This feild is required",
            pattern: {
              value:
                /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@#$%^&+=!])[A-Za-z\d@#$%^&+=!]{6,}$/,
              message:
                "Enter a valid password with uppercase, lowercase, digits & special characters(Minimum length of 6), Eg:- A5dfg$",
            },
          })}
        ></input>
        {errors.password && (
          <span className="text-red-500">{errors.password.message}</span>
        )}
      </label>
      <span className="flex items-center justify-between">
        <span className="text-md">
          <span className="block">
            Not Registered?{" "}
            <Link className="underline" to="/register">
              Create an account now
            </Link>
          </span>
          <span className="block">
            Forgot Password?{" "}
            <Link className="underline" to="/reset-password">
              Forgot Password?
            </Link>
          </span>
        </span>

        <button
          type="submit"
          className="mx-auto px-10 rounded-md bg-blue-400 text-xl font-semibold text-white flex items-center p-2 mr-0 hover:bg-blue-500"
        >
          Login
        </button>
      </span>
    </form>
  );
};

export default Login;
