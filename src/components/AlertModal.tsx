import { Circle } from 'lucide-react';
import React from 'react'

function AlertModal({ isOpen, message }: { isOpen: boolean, message: string }) {

    if (!isOpen) return null;

    return (
        <div>
            <div className="justify-center items-center fixed flex inset-0 z-50 outline-none focus:outline-none">
                <div className="bg-white px-2 py-12 rounded shadow-lg w-1/3">
                    <div className="flex flex-col gap-4 text-center py-4">
                        <Circle className="w-20 h-20 mx-auto text-green-600" />

                        <h2 className="text-2xl font-bold text-zinc-500">{message}</h2>
                    </div>
                </div>
            </div>
            <div className="opacity-25 fixed inset-0 z-30 bg-black"></div>
        </div>
    )
}

export default AlertModal