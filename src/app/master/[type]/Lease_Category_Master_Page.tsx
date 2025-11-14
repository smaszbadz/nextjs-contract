'use client'

import { Lease_Category_Master } from "@/types/lease_category_master";
import { Result } from "@/types/result";
import { ArrowLeft, Circle, Edit, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";
import { useState } from "react";
import { Create_Lease_Category_Master_Action, Delete_Lease_Category_Master_Action, Edit_Lease_Category_Master_Action } from "./action";


type Props = {
    data: Lease_Category_Master[],
};

function Lease_Category_Master_Page({ data }: Props) {

    const router = useRouter();

    // State for modal visibility and form data
    const [isModalOpen_Create, setIsModalOpen_Create] = useState(false);

    const [isModalOpen_Edit, setIsModalOpen_Edit] = useState(false);

    const [isModalOpen_Delete, setIsModalOpen_Delete] = useState(false);

    const inputRef = React.useRef<HTMLInputElement>(null);

    const [category_Create, setCategory_Create] = useState<Lease_Category_Master>({
        id: '',
        description: '',
        type: '',
    });

    const [category_Edit, setCategory_Edit] = useState<Lease_Category_Master>({
        id: '',
        description: '',
        type: '',
    });

    const [category_Delete, setCategory_Delete] = useState<Lease_Category_Master>({
        id: '',
        description: '',
        type: '',
    });

    // Open modal with the specific master type
    const openModal = () => {

        setCategory_Create({
            id: '',
            description: '',
            type: ''
        })

        setIsModalOpen_Create(true);


        setTimeout(() => {
            inputRef.current?.focus();
        }, 0); // หรือใส่ 100 ถ้ามีปัญหา timing
    };


    // Handle form submission
    const handleSubmit_Create = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            await Create_Lease_Category_Master_Action(category_Create)
            window.location.reload();
        } catch (error) {
            console.error('Error during create:', error);
        }
        // You might want to refresh your data or add the new item to your local state
    };

    const handleSubmit_Edit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {


            const result: Result = await Edit_Lease_Category_Master_Action(category_Edit);

            if (result.success) {
                // รอ 500ms ก่อนการเปลี่ยนหน้า
                window.location.reload();
            } else {
                console.error("Edit failed");
            }
        } catch (error) {
            console.error('Error during edit:', error);
        }
    };

    const handleSubmit_Delete = async (e: React.FormEvent) => {
        e.preventDefault();
        try {

            if (!category_Delete.id) {
                return
            }

            const result: Result = await Delete_Lease_Category_Master_Action(category_Delete.id);

            if (result.success) {
                // รอ 500ms ก่อนการเปลี่ยนหน้า
                window.location.reload();
            } else {
                console.error("Delete failed");
            }
        } catch (error) {
            console.error('Error during delete:', error);
        }
    };



    const handleOpenEditModal = (id?: string, description?: string, type?: string) => {
        if (id && description && type) {
            setCategory_Edit({
                id: id,
                description: description,
                type: type
            })
            setIsModalOpen_Edit(true)
        }
    }


    const handleOpenDeleteModal = (id?: string, description?: string, type?: string) => {
        if (id && description && type) {
            setCategory_Delete({
                id: id,
                description: description,
                type: type
            })
            setIsModalOpen_Delete(true)
        }
    }

    const handleRadioChange_Create = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setCategory_Create((prev) => ({ ...prev, [name]: value }));
    };

    const handleRadioChange_Edit = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setCategory_Edit((prev) => ({ ...prev, [name]: value }));
    };

    return (
        <main>
            <div className="mx-auto px-5 pb-5">
                <div className="flex items-center gap-2">
                    <ArrowLeft onClick={() => router.replace("/master")} className="inline-flex text-latte-500 me-2 cursor-pointer" />
                    <span className="text-3xl text-latte-700 font-montserrat font-bold">Lease - Category Master</span>
                    <div className="ml-auto flex items-center space-x-2">
                        <div className="text-gray-900 font-montserrat font-bold pe-4">
                            <Circle className="text-pinky-500 fill-pinky-500 mr-2 inline-flex" size={18} />Lease
                        </div>
                        <button onClick={() => openModal()} className="btn btn-latte inline-flex items-center font-montserrat text-white">
                            <Plus className="mr-1.5" size={18} /> Add
                        </button>
                    </div>
                </div>

                <div className="w-full my-4 mx-auto mt-10">
                    <table className="table-bordered table-hover w-full">
                        <thead>
                            <tr>
                                <th className="w-20">No</th>
                                <th className="text-left">Description</th>
                                <th className="text-left">Type</th>
                                <th className="w-20 text-center">Edit</th>
                                <th className="w-20 text-center">Delete</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data?.map((item, index) => (
                                <tr key={item.id}>
                                    <td className="text-center font-medium">
                                        {index + 1}
                                    </td>
                                    <td className="font-medium">{item.description}</td>
                                    <td className="font-medium">{item.type}</td>
                                    <td className="text-center">
                                        <button onClick={() => handleOpenEditModal(item.id, item.description, item.type)} className="cursor-pointer">
                                            <Edit className="text-latte-600 hover:text-latte-700" size={18} />
                                        </button>
                                    </td>
                                    <td className="text-center">
                                        <button onClick={() => handleOpenDeleteModal(item.id, item.description, item.type)} className="cursor-pointer">
                                            <Trash2 className="text-red-500 hover:text-red-600" size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                </div>
            </div>

            {/* Modal for adding new items */}
            {isModalOpen_Create && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-2/5 max-w-full">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-latte-500 font-montserrat">Add to Category Master</h3>
                            {/* <button
                                onClick={closeModal_Create}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <X size={20} />
                            </button> */}
                        </div>

                        <form onSubmit={handleSubmit_Create}>
                            <div className="grid grid-cols-2 xl:grid-cols-12 items-center gap-2 mt-2">
                                <div className="col-span-2 xl:col-span-2 text-left xl:text-right">
                                    <label className="text-title" htmlFor="description">Description</label>
                                </div>
                                <div className="col-span-2 xl:col-span-10">
                                    <input
                                        type="text"
                                        id="description"
                                        ref={inputRef}
                                        value={category_Create.description}
                                        onChange={(e) => setCategory_Create(prev => ({ ...prev, description: e.target.value }))}
                                        className="input-formcontrol w-full"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 xl:grid-cols-12 items-center gap-2 mt-2">
                                <div className="col-span-2 xl:col-span-2 text-left xl:text-right">
                                    <label className="text-title">Type</label>
                                </div>
                                <div className="col-span-2 xl:col-span-5">
                                    <div className="flex flex-col xl:flex-row justify-start items-start xl:items-center gap-2">
                                        <div className="flex items-center">
                                            <input
                                                type="radio"
                                                name="type"
                                                value="AREA"
                                                id="AREA"
                                                checked={category_Create.type === "AREA"}
                                                onChange={handleRadioChange_Create}
                                                className="mr-2"
                                                required
                                            />
                                            <label htmlFor="PendingStamp" className="text-sm text-gray-600 ml-1">AREA</label>
                                        </div>
                                        <div className="flex items-center ml-0 xl:ml-4">
                                            <input
                                                type="radio"
                                                name="type"
                                                value="QUANTITY"
                                                id="QUANTITY"
                                                checked={category_Create.type === "QUANTITY"}
                                                onChange={handleRadioChange_Create}
                                                className="mr-2"
                                                required
                                            />
                                            <label htmlFor="StampDuty" className="text-sm text-gray-600 ml-1">QUANTITY</label>
                                        </div>

                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-x-2 mt-5">
                                <button type="submit" className="px-4 py-2 rounded btn-latte cursor-pointer">
                                    Save
                                </button>
                                <button type="button" onClick={() => setIsModalOpen_Create(false)} className="px-4 py-2 rounded btn-outlineLatte cursor-pointer">
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}


            {isModalOpen_Edit && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-3/5 2xl:w-2/5 max-w-full">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-latte-500 font-montserrat">Edit to Category Master</h3>
                            {/* <button
                                onClick={closeModal_Create}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <X size={20} />
                            </button> */}
                        </div>

                        <form onSubmit={handleSubmit_Edit}>
                            <div className="grid grid-cols-2 xl:grid-cols-12 items-center gap-2 mt-2">
                                <div className="col-span-2 xl:col-span-2 text-left xl:text-right">
                                    <label className="text-title" htmlFor="description_Edit">Description</label>
                                </div>
                                <div className="col-span-2 xl:col-span-10">
                                    <input
                                        type="text"
                                        id="description_Edit"
                                        ref={inputRef}
                                        value={category_Edit.description}
                                        onChange={(e) => setCategory_Edit(prev => ({ ...prev, description: e.target.value }))}
                                        className="input-formcontrol w-full"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 xl:grid-cols-12 items-center gap-2 mt-2">
                                <div className="col-span-2 xl:col-span-2 text-left xl:text-right">
                                    <label className="text-title">Type</label>
                                </div>
                                <div className="col-span-2 xl:col-span-5">
                                    <div className="flex flex-col xl:flex-row justify-start items-start xl:items-center gap-2 mt-1">
                                        <div className="flex items-center">
                                            <input
                                                type="radio"
                                                name="type"
                                                value="AREA"
                                                id="AREA"
                                                checked={category_Edit.type === "AREA"}
                                                onChange={handleRadioChange_Edit}
                                                className="mr-2"
                                                required
                                            />
                                            <label htmlFor="PendingStamp" className="text-sm text-gray-600 ml-1">AREA</label>
                                        </div>
                                        <div className="flex items-center ml-0 xl:ml-4">
                                            <input
                                                type="radio"
                                                name="type"
                                                value="QUANTITY"
                                                id="QUANTITY"
                                                checked={category_Edit.type === "QUANTITY"}
                                                onChange={handleRadioChange_Edit}
                                                className="mr-2"
                                                required
                                            />
                                            <label htmlFor="StampDuty" className="text-sm text-gray-600 ml-1">QUANTITY</label>
                                        </div>

                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-x-2 mt-5">
                                <button type="submit" className="px-4 py-2 rounded btn-latte cursor-pointer" >
                                    Update
                                </button>
                                <button type="button" onClick={() => setIsModalOpen_Edit(false)} className="px-4 py-2 rounded btn-outlineLatte cursor-pointer" >
                                    Cancel
                                </button>

                            </div>
                        </form>
                    </div>
                </div>
            )}


            {isModalOpen_Delete && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-10 w-2/5 max-w-full">
                        <h3 className="text-2xl font-bold text-gray-900 mb-4 font-montserrat ">Confirm Delete</h3>
                        <div className="flex text-base">
                            <Trash2 className="text-red-500 hover:text-red-600 my-4 mr-5" size={70} />
                            <div>
                                <p className="text-gray-700 mt-4">Are you sure you want to delete ?</p>
                                <span className="block font-semibold my-2">"{category_Delete.description}"</span>
                            </div>
                        </div>
                        <div className="flex justify-end gap-x-2">
                            <button
                                onClick={handleSubmit_Delete}
                                className="px-4 py-2 rounded btn-red transition-colors cursor-pointer"
                            >
                                Delete
                            </button>

                            <button
                                onClick={() => setIsModalOpen_Delete(false)}
                                className="px-4 py-2 rounded btn-gray transition-colors cursor-pointer"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}



        </main >
    );
}

export default Lease_Category_Master_Page;
