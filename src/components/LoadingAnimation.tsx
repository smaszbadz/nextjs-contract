// LoadingModal.tsx
import React from 'react';

const LoadingAnimation = () => {
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-80 z-50">
            <div className="flex flex-col items-center">
                <div className="relative">
                    <div className="w-20 h-20 border-4 border-blue-200 rounded-full"></div>
                    <div className="absolute top-0 w-20 h-20 border-4 border-t-blue-500 rounded-full animate-spin"></div>
                </div>
                <p className="mt-4 text-lg font-medium text-gray-600">Loading...</p>
            </div>
        </div>
    );
};

export default LoadingAnimation;
