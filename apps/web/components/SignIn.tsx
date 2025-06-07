"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import {
  LuMail,
  LuUser,
  LuLock,
  LuEye,
  LuEyeOff,
  LuMessageCircle,
  LuArrowRight,
} from "react-icons/lu";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

const signInFormSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

type FormFields = z.infer<typeof signInFormSchema>;

export function SignIn() {
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormFields>({
    resolver: zodResolver(signInFormSchema),
  });

  const router = useRouter();

  const onSubmit: SubmitHandler<FormFields> = async (data) => {
    try {
      const result = await signIn("credentials", {
        ...data,
        redirect: false,
      });

      if (!result?.ok) {
        throw new Error(result?.error || "Sign in failed");
      }

      router.push("/chat");
    } catch (err: any) {
      setError("root", {
        message: err.message,
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-full mb-4 shadow-lg">
            <LuMessageCircle className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Welcome Back
          </h1>
          <p className="text-gray-600">Sign in to continue chatting</p>
        </div>

        {/* Form */}
        <div className="bg-white backdrop-blur-sm bg-opacity-90 rounded-2xl shadow-xl p-8 space-y-6 border border-white/20">
          {/* Root Error */}
          {errors.root && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
              <div className="flex">
                <div className="ml-3">
                  <p className="text-sm text-red-700">{errors.root.message}</p>
                </div>
              </div>
            </div>
          )}

          {/* Email Field */}
          <div className="space-y-2">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <LuMail
                  className={`h-5 w-5 ${errors.email ? "text-red-400" : "text-gray-400"}`}
                />
              </div>
              <input
                {...register("email")}
                type="email"
                name="email"
                placeholder="Enter your email"
                className={`block w-full pl-10 pr-3 py-3 border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 ${
                  errors.email
                    ? "border-red-300 bg-red-50"
                    : "border-gray-300 hover:border-gray-400 focus:border-indigo-500"
                }`}
              />
            </div>
            {errors.email && (
              <p className="text-sm text-red-600 flex items-center mt-1">
                <span className="mr-1">⚠</span>
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <button
                type="button"
                className="text-sm text-indigo-600 hover:text-indigo-500 transition-colors duration-200"
                onClick={() =>
                  alert("Forgot password functionality would go here")
                }
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <LuLock
                  className={`h-5 w-5 ${errors.password ? "text-red-400" : "text-gray-400"}`}
                />
              </div>
              <input
                {...register("password")}
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Enter your password"
                className={`block w-full pl-10 pr-12 py-3 border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 ${
                  errors.password
                    ? "border-red-300 bg-red-50"
                    : "border-gray-300 hover:border-gray-400 focus:border-indigo-500"
                }`}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <LuEyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                ) : (
                  <LuEye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-sm text-red-600 flex items-center mt-1">
                <span className="mr-1">⚠</span>
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Remember Me */}
          <div className="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label
              htmlFor="remember-me"
              className="ml-2 block text-sm text-gray-700"
            >
              Remember me
            </label>
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              disabled={isSubmitting}
              onClick={handleSubmit(onSubmit)}
              className="w-full flex justify-center items-center px-4 py-3 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {isSubmitting ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Signing In...
                </>
              ) : (
                <>
                  Sign In
                  <LuArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </button>
          </div>

          {/* Footer */}
          <div className="text-center pt-4">
            <p className="text-sm text-gray-600">
              Don't have an account?{" "}
              <a
                href="/signup"
                className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors duration-200"
              >
                Create one here
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
