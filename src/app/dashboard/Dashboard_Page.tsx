'use client'

import { Service } from '@/types/service';
import React from 'react';


type Props = {
    name: string,
    service_expired: Service[],
    service_expiring: Service[],
    general_expired: Service[],
    general_expiring: Service[],
    lease_expired: Service[],
    lease_expiring: Service[],
    insurance_expired: Service[],
    insurance_expiring: Service[],
    transportation_expired: Service[],
    transportation_expiring: Service[],
}
function Dashboard_Page({ name, service_expired, service_expiring, general_expired, general_expiring, lease_expired, lease_expiring, insurance_expired, insurance_expiring, transportation_expired, transportation_expiring }: Props) {

    const keysToRemove_Service = [
        'contractorEN',
        'contractorTH',
        'status',
        'contractName',
        'attachmentType',
        'startDate',
        'endDate',
        'pic',
        'stamped',
        'expiry',
        'renewal',
        'notify'
    ];

    const handleClick_Service = (exp: string | null) => {
        try {
            setStorage(keysToRemove_Service, exp)
            window.location.href = '/service_contract';
        } catch (error) {
            console.error('localStorage error:', error);
        }
    };

    const keysToRemove_General = [
        'companyEN',
        'companyTH',
        'status',
        'contractName',
        'attachmentType',
        'startDate',
        'endDate',
        'pic',
        'usage',
        'category',
        'expiry',
        'renewal',
        'notify'
    ];

    const handleClick_General = (exp: string | null) => {
        try {
            setStorage(keysToRemove_General, exp)
            window.location.href = '/general_contract';
        } catch (error) {
            console.error('localStorage error:', error);
        }
    };

    const keysToRemove_Lease = [
        'lessorEN',
        'lessorTH',
        'status',
        'contractName',
        'attachmentType',
        'startDate',
        'endDate',
        'pic',
        'usage',
        'branch',
        'category',
        'pricingPeriod',
        'expiry',
        'renewal',
        'notify'
    ];

    const handleClick_Lease = (exp: string | null) => {
        try {
            setStorage(keysToRemove_Lease, exp)
            window.location.href = '/lease_contract';
        } catch (error) {
            console.error('localStorage error:', error);
        }
    };


    const keysToRemove_Insurance = [
        'companyEN',
        'companyTH',
        'status',
        'contractName',
        'attachmentType',
        'startDate',
        'endDate',
        'pic',
        'code',
        'branch',
        'expiry',
        'insuredName',
        'premise',
    ];

    const handleClick_Insurance = (exp: string | null) => {
        try {
            setStorage(keysToRemove_Insurance, exp)
            window.location.href = '/insurance_contract';
        } catch (error) {
            console.error('localStorage error:', error);
        }
    };

    const keysToRemove_Transportation = [
        'logisticsEN',
        'logisticsTH',
        'status',
        'contractName',
        'attachmentType',
        'startDate',
        'endDate',
        'pic',
        'usage',
        'branch',
        'category',
        'pricingPeriod',
        'expiry',
        'renewal',
        'notify'
    ];

    const handleClick_Transportation = (exp: string | null) => {
        try {
            setStorage(keysToRemove_Transportation, exp)
            window.location.href = '/transportation_contract';
        } catch (error) {
            console.error('localStorage error:', error);
        }
    };

    function setStorage(keysToRemove: string[], exp: string | null) {
        keysToRemove.forEach(key => {
            try {
                localStorage.removeItem(key);
            } catch (error) {
                console.error(`Error removing ${key} from localStorage`, error);
            }
        });
        if (exp != null) {
            localStorage.setItem('expiry', exp);
        }

    }
    return (
        <main>
            <div className="mx-auto px-5 pb-5 font-montserrat">
                <div className="flex items-center gap-2">
                    <span className="text-3xl text-gray-700 font-bold">Hello, {name}</span>
                </div>
                {/* <div className="grid grid-cols-1 xl:grid-cols-12 2xl:grid-cols-10 items-center gap-4 mt-10">
                    <div className="col-span-1 xl:col-span-4 2xl:col-span-2">
                        <div className="bg-white border-b-12 border-b-mint-500 rounded-t-lg shadow p-4 flex flex-col gap-1 w-full">
                            <div className="flex justify-between items-center gap-2 mb-4">
                                <span className="text-2xl text-mint-500 font-bold">Service</span>
                                <button className="btn-xs btn-outlineMint">View</button>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-5xl text-red-500 font-bold text-center">2</span>
                                <div className="flex flex-col">
                                    <span className="text-base text-gray-800 font-bold">Expired Contracts
                                        <div className="animate-bounce inline-flex"><span className="uppercase badge-red text-[10px] tracking-wider ms-2">Expired</span></div>
                                    </span>
                                    <a href="#" className="text-[10px] text-gray-400 font-medium hover:text-mint-600 underline">View Details</a>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                                <span className="text-lg text-gray-800 font-bold text-center">10</span>
                                <div className="flex flex-col ms-2">
                                    <span className="text-xs text-gray-800 font-semibold">Expiring in 7 Days</span>
                                    <a href="#" className="text-[10px] text-gray-400 font-medium hover:text-mint-600 underline">View Details</a>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-span-1 xl:col-span-4 2xl:col-span-2">
                        <div className="bg-white border-b-12 border-b-biscuit-500 rounded-t-lg shadow p-4 flex flex-col gap-1 w-full">
                            <div className="flex justify-between items-center gap-2 mb-4">
                                <span className="text-2xl text-biscuit-500 font-bold">General</span>
                                <button className="btn-xs btn-outlineBiscuit">View</button>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-5xl text-gray-200 font-bold text-center">0</span>
                                <div className="flex flex-col">
                                    <span className="text-base text-gray-800 font-bold">Expired Contracts</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                                <span className="text-lg text-gray-800 font-bold text-center">3</span>
                                <div className="flex flex-col ms-2">
                                    <span className="text-xs text-gray-800 font-semibold">Expiring in 7 Days</span>
                                    <a href="#" className="text-[10px] text-gray-400 font-medium hover:text-mint-600 underline">View Details</a>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-span-1 xl:col-span-4 2xl:col-span-2">
                        <div className="bg-white border-b-12 border-b-pinky-500 rounded-t-lg shadow p-4 flex flex-col gap-1 w-full">
                            <div className="flex justify-between items-center gap-2 mb-4">
                                <span className="text-2xl text-pinky-500 font-bold">Lease</span>
                                <button className="btn-xs btn-outlinePinky">View</button>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-5xl text-gray-200 font-bold text-center">0</span>
                                <div className="flex flex-col">
                                    <span className="text-base text-gray-800 font-bold">Expired Contracts</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                                <span className="text-lg text-gray-200 font-bold text-center">0</span>
                                <div className="flex flex-col ms-2">
                                    <span className="text-xs text-gray-800 font-semibold">Expiring in 7 Days</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-span-1 xl:col-span-4 2xl:col-span-2">
                        <div className="bg-white border-b-12 border-b-lightPurple-500 rounded-t-lg shadow p-4 flex flex-col gap-1 w-full">
                            <div className="flex justify-between items-center gap-2 mb-4">
                                <span className="text-2xl text-lightPurple-500 font-bold">Insurance</span>
                                <button className="btn-xs btn-outlineLightpurple">View</button>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-5xl text-red-500 font-bold text-center">1</span>
                                <div className="flex flex-col">
                                    <span className="text-base text-gray-800 font-bold">Expired Contracts
                                        <div className="animate-bounce inline-flex"><span className="uppercase badge-red text-[10px] tracking-wider ms-2">Expired</span></div>
                                    </span>
                                    <a href="#" className="text-[10px] text-gray-400 font-medium hover:text-mint-600 underline">View Details</a>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                                <span className="text-lg text-gray-200 font-bold text-center">0</span>
                                <div className="flex flex-col ms-2">
                                    <span className="text-xs text-gray-800 font-semibold">Expiring in 7 Days</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-span-1 xl:col-span-4 2xl:col-span-2">
                        <div className="bg-white border-b-12 border-b-sea-500 rounded-t-lg shadow p-4 flex flex-col gap-1 w-full">
                            <div className="flex justify-between items-center gap-2 mb-4">
                                <span className="text-2xl text-sea-500 font-bold">Transportation</span>
                                <button className="btn-xs btn-outlineSea">View</button>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-5xl text-red-500 font-bold text-center">28</span>
                                <div className="flex flex-col">
                                    <span className="text-base text-gray-800 font-bold">Expired Contracts
                                        <div className="animate-bounce inline-flex"><span className="uppercase badge-red text-[10px] tracking-wider ms-2">Expired</span></div>
                                    </span>
                                    <a href="#" className="text-[10px] text-gray-400 font-medium hover:text-mint-600 underline">View Details</a>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                                <span className="text-lg text-gray-200 font-bold text-center">0</span>
                                <div className="flex flex-col ms-2">
                                    <span className="text-xs text-gray-800 font-semibold">Expiring in 7 Days</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div> */}

                <div className="grid grid-cols-1 xl:grid-cols-12 2xl:grid-cols-10 items-center gap-4 mt-10">
                    <div className="col-span-1 xl:col-span-4 2xl:col-span-2">
                        <div className="bg-white border-b-12 border-b-mint-500 rounded-t-lg shadow p-4 flex flex-col gap-1 w-full">
                            <div className="flex items-center gap-2 mb-4">
                                <span className="text-2xl text-mint-500 font-bold">Service</span>
                                {service_expired &&
                                    <div className="animate-bounce inline-flex text-base">
                                        <span className="badge-red text-[10px] tracking-wider ms-2">EXPIRED</span>
                                    </div>
                                }
                            </div>
                            <div className="flex items-center gap-2">
                                <span className={`text-5xl ${service_expired ? `text-red-500` : `text-gray-200`} font-bold text-center`}>{service_expired ? service_expired.length : 0}</span>
                                <div className="flex flex-col">
                                    <span className="text-base text-gray-800 font-bold">Expired Contracts</span>
                                    <span onClick={() => handleClick_Service('Expired')} className="text-[10px] text-gray-400 font-medium hover:text-mint-600 underline cursor-pointer" >
                                        View Details
                                    </span>

                                </div>
                            </div>
                            <div className="flex justify-between items-center gap-2 mt-2">
                                <div className="flex">
                                    <span className={`text-lg ${service_expiring ? `text-gray-800` : `text-gray-200`} font-bold text-center min-w-[1.5rem]`}>{service_expiring ? service_expiring.length : 0}</span>
                                    <div className="flex flex-col justify-center ms-2">
                                        <span className="text-xs text-gray-800 font-semibold">Expiring in 7 Days</span>
                                        <span onClick={() => handleClick_Service('Expires in 7 Days')} className="text-[10px] text-gray-400 font-medium hover:text-mint-600 underline cursor-pointer" >
                                            View Details
                                        </span>
                                    </div>
                                </div>
                                <button onClick={() => handleClick_Service(null)} className="btn-xs btn-outlineMint">View All</button>
                            </div>
                        </div>
                    </div>
                    <div className="col-span-1 xl:col-span-4 2xl:col-span-2">
                        <div className="bg-white border-b-12 border-b-biscuit-500 rounded-t-lg shadow p-4 flex flex-col gap-1 w-full">
                            <div className="flex items-center gap-2 mb-4">
                                <span className="text-2xl text-biscuit-500 font-bold">General</span>
                                {general_expired &&
                                    <div className="animate-bounce inline-flex text-base">
                                        <span className="badge-red text-[10px] tracking-wider ms-2">EXPIRED</span>
                                    </div>
                                }
                            </div>
                            <div className="flex items-center gap-2">
                                <span className={`text-5xl ${general_expired ? `text-red-500` : `text-gray-200`} font-bold text-center`}>{general_expired ? general_expired.length : 0}</span>
                                <div className="flex flex-col">
                                    <span className="text-base text-gray-800 font-bold">Expired Contracts</span>
                                    <span onClick={() => handleClick_General('Expired')} className="text-[10px] text-gray-400 font-medium hover:text-mint-600 underline cursor-pointer" >
                                        View Details
                                    </span>

                                </div>
                            </div>
                            <div className="flex justify-between items-center gap-2 mt-2">
                                <div className="flex">
                                    <span className={`text-lg ${general_expiring ? `text-gray-800` : `text-gray-200`} font-bold text-center min-w-[1.5rem]`}>{general_expiring ? general_expiring.length : 0}</span>
                                    <div className="flex flex-col justify-center ms-2">
                                        <span className="text-xs text-gray-800 font-semibold">Expiring in 7 Days</span>
                                        <span onClick={() => handleClick_General('Expires in 7 Days')} className="text-[10px] text-gray-400 font-medium hover:text-mint-600 underline cursor-pointer" >
                                            View Details
                                        </span>
                                    </div>
                                </div>
                                <button onClick={() => handleClick_General(null)} className="btn-xs btn-outlineBiscuit">View All</button>
                            </div>
                        </div>
                    </div>
                    <div className="col-span-1 xl:col-span-4 2xl:col-span-2">
                        <div className="bg-white border-b-12 border-b-pinky-500 rounded-t-lg shadow p-4 flex flex-col gap-1 w-full">
                            <div className="flex items-center gap-2 mb-4">
                                <span className="text-2xl text-pinky-500 font-bold">Lease</span>
                                {lease_expired &&
                                    <div className="animate-bounce inline-flex text-base">
                                        <span className="badge-red text-[10px] tracking-wider ms-2">EXPIRED</span>
                                    </div>
                                }
                            </div>
                            <div className="flex items-center gap-2">
                                <span className={`text-5xl ${lease_expired ? `text-red-500` : `text-gray-200`} font-bold text-center`}>{lease_expired ? lease_expired.length : 0}</span>
                                <div className="flex flex-col">
                                    <span className="text-base text-gray-800 font-bold">Expired Contracts</span>
                                    <span onClick={() => handleClick_Lease('Expired')} className="text-[10px] text-gray-400 font-medium hover:text-mint-600 underline cursor-pointer" >
                                        View Details
                                    </span>

                                </div>
                            </div>
                            <div className="flex justify-between items-center gap-2 mt-2">
                                <div className="flex">
                                    <span className={`text-lg ${lease_expiring ? `text-gray-800` : `text-gray-200`} font-bold text-center min-w-[1.5rem]`}>{lease_expiring ? lease_expiring.length : 0}</span>
                                    <div className="flex flex-col justify-center ms-2">
                                        <span className="text-xs text-gray-800 font-semibold">Expiring in 7 Days</span>
                                        <span onClick={() => handleClick_Lease('Expires in 7 Days')} className="text-[10px] text-gray-400 font-medium hover:text-mint-600 underline cursor-pointer" >
                                            View Details
                                        </span>
                                    </div>
                                </div>
                                <button onClick={() => handleClick_Lease(null)} className="btn-xs btn-outlinePinky">View All</button>
                            </div>
                        </div>
                    </div>
                    <div className="col-span-1 xl:col-span-4 2xl:col-span-2">
                        <div className="bg-white border-b-12 border-b-lightPurple-500 rounded-t-lg shadow p-4 flex flex-col gap-1 w-full">
                            <div className="flex items-center gap-2 mb-4">
                                <span className="text-2xl text-lightPurple-500 font-bold">Insurance</span>
                                {insurance_expired &&
                                    <div className="animate-bounce inline-flex text-base">
                                        <span className="badge-red text-[10px] tracking-wider ms-2">EXPIRED</span>
                                    </div>
                                }
                            </div>
                            <div className="flex items-center gap-2">
                                <span className={`text-5xl ${insurance_expired ? `text-red-500` : `text-gray-200`} font-bold text-center`}>{insurance_expired ? insurance_expired.length : 0}</span>
                                <div className="flex flex-col">
                                    <span className="text-base text-gray-800 font-bold">Expired Contracts</span>
                                    <span onClick={() => handleClick_Insurance('Expired')} className="text-[10px] text-gray-400 font-medium hover:text-mint-600 underline cursor-pointer" >
                                        View Details
                                    </span>

                                </div>
                            </div>
                            <div className="flex justify-between items-center gap-2 mt-2">
                                <div className="flex">
                                    <span className={`text-lg ${insurance_expiring ? `text-gray-800` : `text-gray-200`} font-bold text-center min-w-[1.5rem]`}>{insurance_expiring ? insurance_expiring.length : 0}</span>
                                    <div className="flex flex-col justify-center ms-2">
                                        <span className="text-xs text-gray-800 font-semibold">Expiring in 7 Days</span>
                                        <span onClick={() => handleClick_Insurance('Expires in 7 Days')} className="text-[10px] text-gray-400 font-medium hover:text-mint-600 underline cursor-pointer" >
                                            View Details
                                        </span>
                                    </div>
                                </div>
                                <button onClick={() => handleClick_Insurance(null)} className="btn-xs btn-outlineLightpurple">View All</button>
                            </div>
                        </div>
                    </div>
                    <div className="col-span-1 xl:col-span-4 2xl:col-span-2">
                        <div className="bg-white border-b-12 border-b-sea-500 rounded-t-lg shadow p-4 flex flex-col gap-1 w-full">
                            <div className="flex items-center gap-2 mb-4">
                                <span className="text-2xl text-sea-500 font-bold">Transportation</span>
                                {transportation_expired &&
                                    <div className="animate-bounce inline-flex text-base">
                                        <span className="badge-red text-[10px] tracking-wider ms-2">EXPIRED</span>
                                    </div>
                                }
                            </div>
                            <div className="flex items-center gap-2">
                                <span className={`text-5xl ${transportation_expired ? `text-red-500` : `text-gray-200`} font-bold text-center`}>{transportation_expired ? transportation_expired.length : 0}</span>
                                <div className="flex flex-col">
                                    <span className="text-base text-gray-800 font-bold">Expired Contracts</span>
                                    <span onClick={() => handleClick_Transportation('Expired')} className="text-[10px] text-gray-400 font-medium hover:text-mint-600 underline cursor-pointer" >
                                        View Details
                                    </span>

                                </div>
                            </div>
                            <div className="flex justify-between items-center gap-2 mt-2">
                                <div className="flex">
                                    <span className={`text-lg ${transportation_expiring ? `text-gray-800` : `text-gray-200`} font-bold text-center min-w-[1.5rem]`}>{transportation_expiring ? transportation_expiring.length : 0}</span>
                                    <div className="flex flex-col justify-center ms-2">
                                        <span className="text-xs text-gray-800 font-semibold">Expiring in 7 Days</span>
                                        <span onClick={() => handleClick_Transportation('Expires in 7 Days')} className="text-[10px] text-gray-400 font-medium hover:text-mint-600 underline cursor-pointer" >
                                            View Details
                                        </span>
                                    </div>
                                </div>
                                <button onClick={() => handleClick_Transportation(null)} className="btn-xs btn-outlineSea">View All</button>
                            </div>
                        </div>
                    </div>
                </div>
                {/* 
                <div className="grid grid-cols-12 gap-10 mt-4">
                    <div className="col-span-4 2xl:col-span-3">
                        <div className="bg-white border-l-12 border-l-mint-500 rounded-r-lg shadow p-4 flex flex-col gap-1 w-full">
                            <div className="flex justify-between">
                                <div><span className="text-2xl text-gray-800 font-bold">Service</span>
                                    {service_expired &&
                                        <div className="animate-bounce inline-flex text-base">
                                            <span className="badge-red text-[10px] tracking-wider ms-2">EXPIRED</span>
                                        </div>
                                    }</div>
                                <button onClick={() => handleClick_Service(null)} className="btn-xs btn-outlineMint">View All</button>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className={`text-4xl ${lease_expired ? `text-gray-800` : `text-gray-200`} font-bold text-center min-w-[2rem]`}>{lease_expired ? lease_expired.length : 0}</span>
                                <div className="flex flex-col gap-0">
                                    <span className="text-base text-gray-800 font-bold">Expired Contracts</span>
                                    <span onClick={() => handleClick_Lease('Expired')} className="text-[9px] text-gray-400 font-medium hover:text-mint-600 underline underline-offset-2 cursor-pointer" >
                                        View Details
                                    </span>

                                </div>
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                                <span className={`text-lg ${service_expiring ? `text-gray-800` : `text-gray-200`} font-bold text-center min-w-[1.5rem]`}>{service_expiring ? service_expiring.length : 0}</span>
                                <div className="flex flex-col justify-center ms-2">
                                    <span className="text-xs text-gray-800 font-semibold">Expiring in 7 Days</span>
                                    <span onClick={() => handleClick_Service('Expires in 7 Days')} className="text-[9px] text-gray-400 font-medium hover:text-mint-600 underline underline-offset-2 cursor-pointer" >
                                        View Details
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-span-7 2xl:col-span-9">
                        <div className="bg-white rounded-lg shadow p-4 flex flex-col gap-1 w-full h-full">

                        </div>
                    </div>
                </div> */}






                {/* ลบ โดนต่อย */}
                {/* <div className="flex mt-14">
                    <div className="p-4 bg-mint-50">50</div>
                    <div className="p-4 bg-mint-100">100</div>
                    <div className="p-4 bg-mint-200">200</div>
                    <div className="p-4 bg-mint-300">300</div>
                    <div className="p-4 bg-mint-400">400</div>
                    <div className="p-4 bg-mint-500">500</div>
                    <div className="p-4 bg-mint-600">600</div>
                    <div className="p-4 bg-mint-700">700</div>
                    <div className="p-4 bg-mint-800">800</div>
                    <div className="p-4 bg-mint-900">900</div>

                    <div className="p-4 bg-biscuit-50">50</div>
                    <div className="p-4 bg-biscuit-100">100</div>
                    <div className="p-4 bg-biscuit-200">200</div>
                    <div className="p-4 bg-biscuit-300">300</div>
                    <div className="p-4 bg-biscuit-400">400</div>
                    <div className="p-4 bg-biscuit-500">500</div>
                    <div className="p-4 bg-biscuit-600">600</div>
                    <div className="p-4 bg-biscuit-700">700</div>
                    <div className="p-4 bg-biscuit-800">800</div>
                    <div className="p-4 bg-biscuit-900">900</div>
                </div>
                <div className="flex">
                    <div className="p-4 bg-pinky-50">50</div>
                    <div className="p-4 bg-pinky-100">100</div>
                    <div className="p-4 bg-pinky-200">200</div>
                    <div className="p-4 bg-pinky-300">300</div>
                    <div className="p-4 bg-pinky-400">400</div>
                    <div className="p-4 bg-pinky-500">500</div>
                    <div className="p-4 bg-pinky-600">600</div>
                    <div className="p-4 bg-pinky-700">700</div>
                    <div className="p-4 bg-pinky-800">800</div>
                    <div className="p-4 bg-pinky-900">900</div>

                    <div className="p-4 bg-sea-50">50</div>
                    <div className="p-4 bg-sea-100">100</div>
                    <div className="p-4 bg-sea-200">200</div>
                    <div className="p-4 bg-sea-300">300</div>
                    <div className="p-4 bg-sea-400">400</div>
                    <div className="p-4 bg-sea-500">500</div>
                    <div className="p-4 bg-sea-600">600</div>
                    <div className="p-4 bg-sea-700">700</div>
                    <div className="p-4 bg-sea-800">800</div>
                    <div className="p-4 bg-sea-900">900</div>
                </div>
                <div className="flex">
                    <div className="p-4 bg-lightPurple-50">50</div>
                    <div className="p-4 bg-lightPurple-100">100</div>
                    <div className="p-4 bg-lightPurple-200">200</div>
                    <div className="p-4 bg-lightPurple-300">300</div>
                    <div className="p-4 bg-lightPurple-400">400</div>
                    <div className="p-4 bg-lightPurple-500">500</div>
                    <div className="p-4 bg-lightPurple-600">600</div>
                    <div className="p-4 bg-lightPurple-700">700</div>
                    <div className="p-4 bg-lightPurple-800">800</div>
                    <div className="p-4 bg-lightPurple-900">900</div>
                </div> */}

            </div>
        </main >
    );
}

export default Dashboard_Page;
