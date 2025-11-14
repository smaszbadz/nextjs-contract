'use client'

import React, { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { useState } from "react";
import Link from 'next/link';
import { Blocks, CarFront, Contact, Forklift, LogOut, Settings, ShieldCheck, Warehouse } from "lucide-react";
import Image from "next/image";

type Props = {
    profileImage?: string | null;
    username?: string | null
};

const Sidebar = ({ profileImage, username }: Props) => {
    const [isOpen, setIsOpen] = useState<boolean>(true); // Default to true for SSR
    const [isMounted, setIsMounted] = useState(false);
    const pathname = usePathname();
    const router = useRouter();

    // Only run on client after mounting
    useEffect(() => {
        setIsMounted(true);

        // Only access localStorage after component is mounted on client
        if (typeof window !== 'undefined') {
            const savedState = localStorage.getItem('sidebarOpen');
            if (savedState !== null) {
                setIsOpen(JSON.parse(savedState));
            }
        }
    }, []);

    // Save to localStorage when isOpen changes (only on client)
    useEffect(() => {
        if (isMounted && typeof window !== 'undefined') {
            localStorage.setItem('sidebarOpen', JSON.stringify(isOpen));
        }
    }, [isOpen, isMounted]);

    const menuItems = [
        { title: "Dashboard", href: "/dashboard", icon: <Blocks /> },
        { title: "Service", href: "/service_contract", icon: <Warehouse /> },
        { title: "General", href: "/general_contract", icon: <Contact /> },
        { title: "Lease", href: "/lease_contract", icon: <Forklift /> },
        { title: "Insurance", href: "/insurance_contract", icon: <ShieldCheck /> },
        { title: "Transportation", href: "/transportation_contract", icon: <CarFront /> },
        { title: "Master", href: "/master", icon: <Settings /> },
    ];

    const handleLogout = async () => {
        await signOut({ redirect: false });
        router.push('/');
    };

    const getBackgroundColor = (itemHref: string): string => {
        if (pathname.startsWith(itemHref)) {
            switch (itemHref) {
                case '/dashboard':
                    return 'bg-gray-600';
                case '/service_contract':
                    return 'bg-mint-500';
                case '/general_contract':
                    return 'bg-biscuit';
                case '/lease_contract':
                    return 'bg-pinky';
                case '/insurance_contract':
                    return 'bg-lightPurple';
                case '/transportation_contract':
                    return 'bg-sea';
                case '/master':
                    return 'bg-latte-500';
                default:
                    return '';
            }
        }
        return '';
    };

    // Use consistent sizing
    const sidebarWidth = isOpen ? 'w-60' : 'w-16';

    return (
        <div className={`min-h-screen font-montserrat bg-gray-800 text-white transition-all duration-300 ${sidebarWidth} flex flex-col justify-between`}>
            <nav className={`fixed top-0 left-0 transition-all duration-300 ${sidebarWidth}`}>
                <ul>
                    <li className="flex justify-between items-center py-8 px-4">
                        {/* Show logo when sidebar is open */}
                        {isOpen && (
                            <div className="flex justify-start items-center">
                                <Image width={40} height={40} src="/ccc.png" alt="C" />
                                <span className="text-xl font-bold uppercase tracking-wider mr-auto">Contract</span>
                            </div>
                        )}
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="p-2 rounded-md hover:bg-gray-700 text-xl"
                            disabled={!isMounted} // Disable until mounted
                        >
                            ☰
                        </button>
                    </li>
                    {menuItems.map((item) => (
                        <li key={item.href}>
                            <Link
                                href={item.href}
                                className={`flex items-center font-semibold uppercase tracking-wide p-4 hover:bg-gray-700 ${getBackgroundColor(item.href)}`}
                            >
                                <span className="text-xl">{item.icon}</span>
                                {/* Show menu title when sidebar is open */}
                                {isOpen && <span className="ml-4">{item.title}</span>}
                            </Link>
                        </li>
                    ))}
                </ul>
            </nav>

            <div className={`fixed bottom-0 left-0 transition-all duration-300 ${sidebarWidth}`}>
                <div className="p-4 pb-2 flex items-center">
                    <span className="text-xl">
                        {/* Show profile image if available */}
                        {profileImage && (
                            <Image
                                src={profileImage}
                                alt="Profile"
                                width={32}
                                height={32}
                                className={`rounded-full object-cover aspect-square transition-all duration-300 ${isOpen ? 'w-14' : 'w-8'}`}
                            />
                        )}
                    </span>
                    {/* Show username when sidebar is open */}
                    {isOpen && <span className="ml-4 font-semibold">{username}</span>}
                </div>

                <button
                    onClick={handleLogout}
                    className="flex items-center p-4 w-full hover:bg-gray-700 text-left cursor-pointer"
                    disabled={!isMounted} // Disable until mounted
                >
                    <span className="text-xl"><LogOut /></span>
                    {/* Show logout text when sidebar is open */}
                    {isOpen && <span className="ml-4 text-[#80BFB4] uppercase font-bold">Logout</span>}
                </button>
            </div>
        </div>
    );
}

export default Sidebar;