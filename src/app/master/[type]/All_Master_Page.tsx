'use client'

import { Create_Master_Action, Delete_Master_Action, Edit_Master_Action } from "@/app/master/[type]/action";
import { Master } from "@/types/master";
import { Result } from "@/types/result";
import { ArrowLeft, Circle, Edit, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";
import { useState } from "react";


type Props = {
    type: string,
    typeName: string,
    data: Master[],
    groupType: string
};

function All_Master_Page({ type, typeName, data, groupType }: Props) {

    const router = useRouter();

    // State for modal visibility and form data
    const [isModalOpen_Create, setIsModalOpen_Create] = useState(false);
    const [description_Create, setDescription_Create] = useState('');

    const [isModalOpen_Edit, setIsModalOpen_Edit] = useState(false);
    const [id_Edit, setId_Edit] = useState('');
    const [description_Edit, setDescription_Edit] = useState('');


    const [isModalOpen_Delete, setIsModalOpen_Delete] = useState(false);
    const [id_Delete, setId_Delete] = useState('');
    const [description_Delete, setDescription_Delete] = useState('');

    const inputRef = React.useRef<HTMLInputElement>(null);



    // Open modal with the specific master type
    const openModal = () => {
        setDescription_Create('');
        setIsModalOpen_Create(true);


        setTimeout(() => {
            inputRef.current?.focus();
        }, 0); // หรือใส่ 100 ถ้ามีปัญหา timing
    };


    // Handle form submission
    const handleSubmit_Create = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            await Create_Master_Action(type, description_Create)
            window.location.reload();
        } catch (error) {
            console.error('Error during create:', error);
        }
        // You might want to refresh your data or add the new item to your local state
    };

    const handleSubmit_Edit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {

            if (!id_Edit) {
                console.error("ID is undefined!");
                return; // หากไม่มี ID จะหยุดการทำงาน
            }

            const result: Result = await Edit_Master_Action(type, id_Edit, description_Edit);

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
            if (!id_Delete) {
                console.error("ID is undefined!");
                return; // หากไม่มี ID จะหยุดการทำงาน
            }

            const result: Result = await Delete_Master_Action(type, id_Delete);

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



    const handleOpenEditModal = (id?: string, description?: string) => {
        if (id && description) {
            setId_Edit(id)
            setDescription_Edit(description);
            setIsModalOpen_Edit(true)
        }
    }


    const handleOpenDeleteModal = (id?: string, description?: string) => {
        if (id && description) {
            setId_Delete(id)
            setDescription_Delete(description);
            setIsModalOpen_Delete(true)
        }
    }


    return (
        <main>
            <div className="mx-auto px-5 pb-5">
                <div className="flex items-center gap-2">
                    <ArrowLeft onClick={() => router.replace("/master")} className="inline-flex text-latte-500 me-2 cursor-pointer" />
                    <span className="text-3xl text-latte-700 font-montserrat font-bold">{typeName}</span>
                    <div className="ml-auto flex items-center space-x-2">
                        <div className="flex items-center text-gray-900 font-montserrat font-bold pe-4">
                            {
                                (groupType == 'All Contract') ? (<Circle className="text-latte-500 fill-latte-500 mr-2 inline-flex" size={18} />)
                                    : (groupType == 'Service') ? (<Circle className="text-mint-500 fill-mint-500 mr-2 inline-flex" size={18} />)
                                        : (groupType == 'General') ? (<Circle className="text-pinky-500 fill-biscuit-500 mr-2 inline-flex" size={18} />)
                                            : (groupType == 'Lease') ? (<Circle className="text-pinky-500 fill-pinky-500 mr-2 inline-flex" size={18} />)
                                                : (groupType == 'Insurance') ? (<Circle className="text-lightPurple-500 fill-lightPurple-500 mr-2 inline-flex" size={18} />)
                                                    : (<></>)
                            }
                            {groupType}
                        </div>
                        <button onClick={() => openModal()} className="btn btn-latte inline-flex items-center font-montserrat text-white">
                            <Plus className="mr-1.5" size={18} /> Add
                        </button>
                    </div>
                </div>

                {/* <button onClick={() => openModal()} className="px-2 py-1 rounded-[8px] btn-outlineLatte flex items-center justify-center cursor-pointer">
                            <Plus className="mr-1.5" size={14} /> Add
                        </button> */}
                <div className="w-full my-4 mx-auto mt-10">
                    <table className="table-bordered w-full">
                        <thead>
                            <tr>
                                <th className="w-16 text-center">No</th>
                                <th className="text-left">Description</th>
                                <th className="w-16 text-center">Edit</th>
                                <th className="w-16 text-center">Delete</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data?.map((item, index) => (
                                <tr key={item.id}>
                                    <td className="font-medium text-center">
                                        {index + 1}
                                    </td>
                                    <td className="font-medium">{item.description}</td>
                                    <td className="text-center">
                                        <button onClick={() => handleOpenEditModal(item.id, item.description)} className="cursor-pointer">
                                            <Edit className="text-latte-600 hover:text-latte-700" size={16} />
                                        </button>
                                    </td>
                                    <td className="text-center">
                                        <button onClick={() => handleOpenDeleteModal(item.id, item.description)} className="cursor-pointer">
                                            <Trash2 className="text-red-500 hover:text-red-600" size={16} />
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
                            <h3 className="text-xl font-bold text-latte-500 font-montserrat">Add to {typeName}</h3>
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
                                        value={description_Create}
                                        onChange={(e) => setDescription_Create(e.target.value)}
                                        className="input-formcontrol w-full"
                                        required
                                    />
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
                    <div className="bg-white rounded-lg p-6 w-2/5 max-w-full">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-latte-500 font-montserrat">Edit to {typeName}</h3>
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
                                        value={description_Edit}
                                        onChange={(e) => setDescription_Edit(e.target.value)}
                                        className="input-formcontrol w-full"
                                        required
                                    />
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
                                <span className="block font-semibold my-2">"{description_Delete}"</span>
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


        </main>
    );
}

export default All_Master_Page;
