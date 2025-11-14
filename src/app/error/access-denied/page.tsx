import React from 'react';
import AccessDenied from '@/components/AccessDenied'; // ปรับ path ให้ตรงกับ structure ของคุณ

export const metadata = {
    title: 'Access Denied',
    description: 'You do not have permission to access this page',
};

export default function AccessDeniedPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <AccessDenied type="page" />
        </div>
    );
}