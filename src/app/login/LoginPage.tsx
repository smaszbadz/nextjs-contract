'use client'

import React, { useState } from 'react'
import { signIn } from 'next-auth/react'
import Image from "next/image";
import { TriangleAlert } from "lucide-react";

function LoginPage() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");


    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault();

        try {
            const res = await signIn("credentials", {
                username,
                password,
                redirect: false, // Keep redirect as false to handle errors first
            });

            if (res?.error) {
                setPassword(''); // Clear password field if authentication fails
                setError("Invalid credentials. Please try again."); // Display error message
            } else {
                setError(""); // Clear error if the sign-in is successful
                window.location.replace('dashboard')


            }
        } catch (error) {
            console.error("An unexpected error occurred:", error);
            setError("An unexpected error occurred. Please try again later.");
        }
    };

    return (
        <div className="h-screen w-screen flex overflow-hidden transition-all duration-200 ease-in-out">

            <div className="hidden sm:flex w-1/2 h-full items-top justify-center relative  bg-center transition-all duration-100 ease-in-out" >
                <Image className="absolute inset-0 z-0 w-full" style={{
                    objectFit: "cover",
                    objectPosition: "top center", // ✅ มาไว้ใน style แทน
                }} src="/bg-login.jpg" width={1200} height={800} alt="img" priority />

                {/* <div className="relative z-10 flex flex-col w-full max-w-md gap-4 my-14">
                    <label className="text-xl font-montserrat font-medium text-white">Welcome to</label>
                    <label className="text-6xl font-montserrat font-bold text-neutral-600">Contract Management System</label>
                </div> */}
            </div>


            <div className="w-full sm:w-1/2 flex items-center justify-center p-10">
                <div className="w-full max-w-md">
                    <div className="flex flex-col">
                        <label className="text-3xl font-montserrat font-bold text-neutral-600"><span className="text-6xl">Contract</span> Management System</label>
                        <label className="text-xl font-montserrat font-bold text-neutral-600 mt-20">Log in</label>
                    </div>
                    <form onSubmit={handleSubmit}>
                        <div className="flex flex-col justify-center gap-4 space-y-2">
                            {error && (
                                <div className="bg-red-500 text-sm text-white p-2 rounded mt-2">
                                    <TriangleAlert className="inline-flex me-2" size={16} />{error}
                                </div>
                            )}
                            <div className="mt-2">
                                <label className="block mb-1 text-sm font-medium text-gray-600">Username</label>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    placeholder="Username"
                                    className="input-formcontrol"
                                    autoFocus
                                />
                            </div>
                            <div>
                                <label className="block mb-1 text-sm font-medium text-gray-600">Password</label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Password"
                                    className="input-formcontrol"
                                />
                            </div>
                            <button type="submit" className="btn btn-login">
                                Log in
                            </button>
                            {/* <div className="flex justify-center mt-16">
                                <label className="block mb-1 text-xs text-gray-400">Create you account </label>
                                <a href="/register" className="ms-2 text-xs text-indigo-500 hover:text-indigo-300 font-medium">Sign Up</a>
                            </div> */}
                        </div>
                    </form>
                </div>
            </div>

        </div>

    );
}

export default LoginPage;