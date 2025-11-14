import React from 'react'
import Image from "next/image";

function AccessDenied({ type }: { type: string }) {
    return (


        <div className="flex flex-col items-center">
            <div>
                <Image className="h-auto max-w-full my-8" width={600} height={480} style={{ width: 600, height: 480 }} src="/access-denied.svg" alt="image description" />
            </div>
            <div><p className="text-5xl text-scarlet font-bold my-4">We are sorry...</p></div>
            <div className="mt-2 mb-4">
                <p className="text-lg text-center text-gray-600">You don't have permission to access this {type}.</p>
                <p className="text-lg text-center text-gray-600">Ask your administrator for help or to request access.</p>
            </div>
            <a href="/dashboard" className="btn btn-red my-4">Go Back Dashboard</a>
        </div>
    )
}

export default AccessDenied