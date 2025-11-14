// Create a new file: @/components/LayoutWrapper.tsx
'use client'

import { ReactNode } from 'react';
import Sidebar from "@/components/Sidebar";

type Props = {
    children: ReactNode;
    profileImage?: string | null;
    username?: string | null;
};

export default function LayoutWrapper({ children, profileImage, username }: Props) {
    return (
        <div className="flex">
            <Sidebar profileImage={profileImage} username={username} />
            <main className="flex-1 p-8 overflow-auto">
                {children}
            </main>
        </div>
    );
}