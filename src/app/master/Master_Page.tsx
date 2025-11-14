'use client'

import { Circle, Eye } from "lucide-react";
import Link from "next/link";
import React from 'react';

function Master_Page() {

    return (
        <main>
            <div className="mx-auto px-5 pb-5">
                <div className="flex items-center gap-2">
                    <span className="text-3xl text-latte-500 font-montserrat font-bold">Master</span>

                    {/* <div className="space-x-2 ml-auto">
                        <a href="#" className="btn btn-latte inline-flex items-center font-montserrat">
                            <UserRoundCog className="w-5 h-5 mr-2" />
                            Something
                        </a>
                        <a href="#" className="btn btn-outlineLatte inline-flex items-center font-montserrat">
                            <Settings className="w-5 h-5 mr-2" />
                            Setting
                        </a>
                    </div> */}
                </div>


                <div className="w-full xl:w-6/12 2xl:w-5/12 my-4 mx-auto">
                    {/* <div className="flex justify-center items-center gap-4 mt-10">
                        <div className="text-left xl:text-right">
                            <label className="text-title">Type</label>
                        </div>
                        <div className="w-3/12">
                            <select className="input-formcontrol"
                                value={selectedType}
                                onChange={(e) => setSelectedType(e.target.value)}
                            >
                                <option value="">All Contract</option>
                                <option value="Service">Service</option>
                                <option value="General">General</option>
                                <option value="Lease">Lease</option>
                                <option value="Insurance">Insurance</option>
                                <option value="Transportation">Transportation</option>
                            </select>
                        </div>
                    </div> */}
                    <table className="table-bordered w-full mt-4">
                        <thead>
                            <tr>
                                <th className="text-left">Type</th>
                                <th className="text-left">Master Name</th>

                                {/* <th className="text-left w-28">Add</th> */}
                                <th className="w-20 text-center">View</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className="font-bold"><Circle className="text-latte-500 fill-latte-500 mr-2 inline-flex" size={16} /> All Contract</td>
                                <td className="font-bold align-middle">Branch</td>
                                <td className="flex justify-center w-full">
                                    <Link href="/master/all_branch" className="inline-flex items-center justify-center w-5 h-5 text-latte-500 hover:text-latte-600">
                                        <Eye size={20} />
                                    </Link>
                                </td>
                            </tr>
                            <tr>
                                <td className="font-bold"><Circle className="text-latte-500 fill-latte-500 mr-2 inline-flex" size={16} /> All Contract</td>
                                <td className="font-bold">Notice - Contract Renewal</td>
                                <td className="flex justify-center w-full">
                                    <Link href="/master/all_renewal" className="inline-flex items-center justify-center w-5 h-5 text-latte-500 hover:text-latte-600">
                                        <Eye size={20} />
                                    </Link>
                                </td>
                            </tr>
                            <tr>
                                <td className="font-bold "><Circle className="text-latte-500 fill-latte-500 mr-2 inline-flex" size={16} /> All Contract</td>
                                <td className="font-bold">Notice - Notify Before Expire</td>
                                <td className="flex justify-center w-full">
                                    <Link href="/master/all_notify" className="inline-flex items-center justify-center w-5 h-5 text-latte-500 hover:text-latte-600">
                                        <Eye size={20} />
                                    </Link>
                                </td>
                            </tr>
                            <tr>
                                <td className="font-bold"><Circle className="text-latte-500 fill-latte-500 mr-2 inline-flex" size={16} /> All Contract</td>
                                <td className="font-bold">Person In Charge</td>
                                <td className="flex justify-center w-full">
                                    <Link href="/master/all_pic" className="inline-flex items-center justify-center w-5 h-5 text-latte-500 hover:text-latte-600">
                                        <Eye size={20} />
                                    </Link>
                                </td>
                            </tr>
                            <tr>
                                <td className="font-bold"><Circle className="text-latte-500 fill-latte-500 mr-2 inline-flex" size={16} /> All Contract</td>
                                <td className="font-bold align-middle">Status</td>
                                <td className="flex justify-center w-full">
                                    <Link href="/master/all_status" className="inline-flex items-center justify-center w-5 h-5 text-latte-500 hover:text-latte-600">
                                        <Eye size={20} />
                                    </Link>
                                </td>
                            </tr>
                            <tr>
                                <td className="font-bold"><Circle className="text-mint-500 fill-mint-500 mr-2 inline-flex" size={16} /> Service</td>
                                <td className="font-bold">Type</td>
                                <td className="flex justify-center w-full">
                                    <Link href="/master/service_type" className="inline-flex items-center justify-center w-5 h-5 text-latte-500 hover:text-latte-600">
                                        <Eye size={20} />
                                    </Link>
                                </td>
                            </tr>
                            <tr>
                                <td className="font-bold"><Circle className="text-biscuit-500 fill-biscuit-500 mr-2 inline-flex" size={16} /> General</td>
                                <td className="font-bold">Category</td>
                                <td className="flex justify-center w-full">
                                    <Link href="/master/general_category" className="inline-flex items-center justify-center w-5 h-5 text-latte-500 hover:text-latte-600">
                                        <Eye size={20} />
                                    </Link>
                                </td>
                            </tr>
                            <tr>
                                <td className="font-bold"><Circle className="text-biscuit-500 fill-biscuit-500 mr-2 inline-flex" size={16} /> General</td>
                                <td className="font-bold">Usage</td>
                                <td className="flex justify-center w-full">
                                    <Link href="/master/general_usage" className="inline-flex items-center justify-center w-5 h-5 text-latte-500 hover:text-latte-600">
                                        <Eye size={20} />
                                    </Link>
                                </td>
                            </tr>
                            <tr>
                                <td className="font-bold"><Circle className="text-pinky-500 fill-pinky-500 mr-2 inline-flex" size={16} /> Lease</td>
                                <td className="font-bold">Category</td>
                                <td className="flex justify-center w-full">
                                    <Link href="/master/lease_category" className="inline-flex items-center justify-center w-5 h-5 text-latte-500 hover:text-latte-600">
                                        <Eye size={20} />
                                    </Link>
                                </td>
                            </tr>
                            <tr>
                                <td className="font-bold"><Circle className="text-pinky-500 fill-pinky-500 mr-2 inline-flex" size={16} /> Lease</td>
                                <td className="font-bold">Usage</td>
                                <td className="flex justify-center w-full">
                                    <Link href="/master/lease_usage" className="inline-flex items-center justify-center w-5 h-5 text-latte-500 hover:text-latte-600">
                                        <Eye size={20} />
                                    </Link>
                                </td>
                            </tr>
                            <tr>
                                <td className="font-bold"><Circle className="text-pinky-500 fill-pinky-500 mr-2 inline-flex" size={16} /> Lease</td>
                                <td className="font-bold">Unit</td>
                                <td className="flex justify-center w-full">
                                    <Link href="/master/lease_unit" className="inline-flex items-center justify-center w-5 h-5 text-latte-500 hover:text-latte-600">
                                        <Eye size={20} />
                                    </Link>
                                </td>
                            </tr>

                            <tr>
                                <td className="font-bold"><Circle className="text-lightPurple-500 fill-lightPurple-500 mr-2 inline-flex" size={16} /> Insurance</td>
                                <td className="font-bold">Code</td>
                                <td className="flex justify-center w-full">
                                    <Link href="/master/insurance_code" className="inline-flex items-center justify-center w-5 h-5 text-latte-500 hover:text-latte-600">
                                        <Eye size={20} />
                                    </Link>
                                </td>
                            </tr>


                        </tbody>
                    </table>
                </div>
            </div>

        </main>
    );
}

export default Master_Page;