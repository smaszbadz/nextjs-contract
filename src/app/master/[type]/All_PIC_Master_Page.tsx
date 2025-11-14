'use client'

import '@ant-design/v5-patch-for-react-19';
import { Create_PIC_Master_Action, Delete_PIC_Master_Action, Edit_PIC_Master_Action } from "@/app/master/[type]/action";
import { PIC } from "@/types/pic";
import { Result } from "@/types/result";
import { ArrowLeft, Circle, Edit, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";
import { useState } from "react";
import { Select, SelectProps, Radio } from 'antd';
import { Employee } from "@/types/employee";
import type { RadioChangeEvent } from 'antd';
import 'antd/dist/reset.css';


type Props = {
    data: PIC[],
    employees: Employee[]
};

// Define types
type AccessLevel = 'Full Access' | 'View All' | 'View Assigned' | 'No Access' | '';


function All_PIC_Master_Page({ data, employees }: Props) {

    const router = useRouter();

    // State for modal visibility and form data
    const [isModalOpen_Create, setIsModalOpen_Create] = useState(false);
    // const [description_Create, setDescription_Create] = useState('');

    const [isModalOpen_Edit, setIsModalOpen_Edit] = useState(false);


    const [isModalOpen_Delete, setIsModalOpen_Delete] = useState(false);
    const [id_Delete, setId_Delete] = useState('');
    const [description_Delete, setDescription_Delete] = useState('');

    const inputRef = React.useRef<HTMLInputElement>(null);


    // สร้าง state PIC เพื่อเก็บข้อมูลตามโครงสร้างที่ต้องการ
    const [pic_Create, setPIC_Create] = useState<PIC>({
        id: '',
        userID: undefined,
        username: '',
        name: undefined,
        service: '',
        general: '',
        lease: '',
        insurance: '',
        transport: ''
    });

    const [pic_Edit, setPIC_Edit] = useState<PIC>({
        id: '',
        userID: '',
        username: '',
        name: '',
        service: '',
        general: '',
        lease: '',
        insurance: '',
        transport: ''
    });

    // Open modal with the specific master type
    const openModal = () => {
        // setDescription_Create('');
        setIsModalOpen_Create(true);


        setTimeout(() => {
            inputRef.current?.focus();
        }, 0); // หรือใส่ 100 ถ้ามีปัญหา timing
    };


    // Handle form submission
    const handleSubmit_Create = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            await Create_PIC_Master_Action(pic_Create)
            window.location.reload();

        } catch (error) {
            console.error('Error during create:', error);
        }
        // You might want to refresh your data or add the new item to your local state
    };

    const handleSubmit_Edit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {

            const result: Result = await Edit_PIC_Master_Action(pic_Edit);

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

            const result: Result = await Delete_PIC_Master_Action(id_Delete);

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

    const handleOpenEditModal = (id?: string, userID?: string, name?: string, username?: string, service?: string, general?: string, lease?: string, insurance?: string, transport?: string) => {
        if (id && userID && name && username) {

            setPIC_Edit((prev) => ({
                ...prev,
                id: id,
                userID: userID,
                name: name,
                username: username,
                service: service || '',
                general: general || '',
                lease: lease || '',
                insurance: insurance || '',
                transport: transport || ''
            }))

            setIsModalOpen_Edit(true)
        }
    }

    const handleOpenDeleteModal = (id?: string, userID?: string, name?: string) => {
        if (id && userID && name) {
            setId_Delete(id)
            setDescription_Delete(userID + ' ' + name);
            setIsModalOpen_Delete(true)
        }
    }

    // สร้าง options สำหรับ Select ตัวแรก (แสดง userID)
    const optionsID: SelectProps['options'] = employees.map((employee) => ({
        value: employee.userID,
        label: employee.userID,
    }));

    // สร้าง options สำหรับ Select ตัวที่สอง (แสดงชื่อ-นามสกุล)
    const optionsName: SelectProps['options'] = employees.map((employee) => ({
        value: employee.userID, // ใช้ userID เป็น value เพื่อให้อ้างอิงพนักงานคนเดียวกันได้
        label: `${employee.firstnameEN} ${employee.lastnameEN}`,
    }));

    const generateUsername = (userID: string | undefined): string => {
        if (!userID) return '';

        const employee = employees.find(emp => emp.userID === userID);
        if (!employee) return '';

        const lastNameInitial = employee.lastnameEN.charAt(0);
        return `${lastNameInitial}.${employee.firstnameEN}`;
    };

    const generateName = (userID: string): string => {
        if (!userID) return '';

        const employee = employees.find(emp => emp.userID === userID);
        if (!employee) return '';

        return `${employee.firstnameEN} ${employee.lastnameEN}`
    };

    const handleDropDownChange_Create = (value: string) => {

        const username = generateUsername(value)
        const name = generateName(value)
        setPIC_Create((prev) => ({
            ...prev,
            userID: value,
            name: name,
            username: username
        }))
    };

    const handleDropDownChange_Edit = (value: string) => {

        const username = generateUsername(value)
        const name = generateName(value)
        setPIC_Edit((prev) => ({
            ...prev,
            userID: value,
            name: name,
            username: username
        }))
    };



    // Function สำหรับ handle radio change
    const handleRadioChange_Create = (name: string, value: AccessLevel) => {
        setPIC_Create(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Function สำหรับ handle radio change ในส่วน Edit
    const handleRadioChange_Edit = (name: string, value: AccessLevel) => {
        setPIC_Edit(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Radio options
    const radioOptions = [
        { label: 'Full Access', value: 'Full Access' as AccessLevel },
        { label: 'View All', value: 'View All' as AccessLevel },
        { label: 'View Assigned', value: 'View Assigned' as AccessLevel },
        { label: 'No Access', value: 'No Access' as AccessLevel }
    ];

    return (
        <main>
            <div className="mx-auto px-5 pb-5">
                <div className="flex items-center gap-2">
                    <ArrowLeft onClick={() => router.replace("/master")} className="inline-flex text-latte-500 me-2 cursor-pointer" />
                    <span className="text-3xl text-latte-700 font-montserrat font-bold">Person In Charge Master</span>
                    <div className="ml-auto flex items-center space-x-2">
                        <div className="flex items-center text-gray-900 font-montserrat font-bold pe-4">
                            <Circle className="text-latte-500 fill-latte-500 mr-2 inline-flex" size={18} />All Contract
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
                                <th className="w-44 text-left">UserID</th>
                                <th className="text-left">Username</th>
                                <th className="text-left">Name</th>
                                <th className="bg-mint-500"><span className=" text-white">Service</span></th>
                                <th className="bg-biscuit-500"><span className=" text-white">General</span></th>
                                <th className="bg-pinky-500"><span className=" text-white">Lease</span></th>
                                <th className="bg-lightPurple-500"><span className=" text-white">Insurance</span></th>
                                <th className="bg-sea-500"><span className=" text-white">Transport</span></th>
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
                                    <td className="font-medium">{item.userID}</td>
                                    <td className="font-medium">{item.username}</td>
                                    <td className="font-medium">{item.name}</td>
                                    <td className={`${item.service == "No Access" ? "text-gray-300" : ""}`}>{item.service}</td>
                                    <td className={`${item.general == "No Access" ? "text-gray-300" : ""}`}>{item.general}</td>
                                    <td className={`${item.lease == "No Access" ? "text-gray-300" : ""}`}>{item.lease}</td>
                                    <td className={`${item.insurance == "No Access" ? "text-gray-300" : ""}`}>{item.insurance}</td>
                                    <td className={`${item.transport == "No Access" ? "text-gray-300" : ""}`}>{item.transport}</td>
                                    <td className="text-center">
                                        <button onClick={() => handleOpenEditModal(item.id, item.userID, item.name, item.username, item.service, item.general, item.lease, item.insurance, item.transport)} className="cursor-pointer">
                                            <Edit className="text-latte-600 hover:text-latte-700" size={18} />
                                        </button>
                                    </td>
                                    <td className="text-center">
                                        <button onClick={() => handleOpenDeleteModal(item.id, item.userID, item.name)} className="cursor-pointer">
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
            {
                isModalOpen_Create && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 w-3/5 max-w-full">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-bold text-latte-500 font-montserrat">Add to Person In Charge Master</h3>
                                {/* <button
                                onClick={closeModal_Create}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <X size={20} />
                            </button> */}
                            </div>

                            <form onSubmit={handleSubmit_Create}>
                                <div className="grid grid-cols-2 xl:grid-cols-12 items-center gap-2">
                                    <div className="col-span-1 text-left xl:text-right">
                                        <label className="text-title">User ID</label>
                                    </div>
                                    <div className="col-span-4 xl:col-span-3 2xl:col-span-2">
                                        <Select
                                            showSearch
                                            style={{ width: '100%' }}
                                            placeholder="เลือกรหัสพนักงาน"
                                            options={optionsID}
                                            value={pic_Create.userID}
                                            onChange={handleDropDownChange_Create}
                                            filterOption={(input, option) =>
                                                (option?.label ?? '').toString().toLowerCase().includes(input.toLowerCase())
                                            }
                                        />
                                    </div>
                                    <div className="col-span-2 xl:col-span-1 text-left xl:text-right">
                                        <label className="text-title">Name</label>
                                    </div>
                                    <div className="col-span-4 xl:col-span-4 2xl:col-span-3">
                                        <Select
                                            showSearch
                                            style={{ width: '100%' }}
                                            placeholder="เลือกชื่อพนักงาน"
                                            options={optionsName}
                                            value={pic_Create.name}
                                            onChange={handleDropDownChange_Create}
                                            filterOption={(input, option) =>
                                                (option?.label ?? '').toString().toLowerCase().includes(input.toLowerCase())
                                            }
                                        />
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 mt-4">
                                    <label className="text-base font-bold text-latte-800 font-montserrat">Permission</label>
                                </div>
                                <table className="table-bordered w-full">
                                    <thead>
                                        <tr>
                                            <th className="bg-mint-500">
                                                <span className="text-white">Service</span>
                                            </th>
                                            <th className="bg-biscuit-500">
                                                <span className="text-white">General</span>
                                            </th>
                                            <th className="bg-pinky-500">
                                                <span className="text-white">Lease</span>
                                            </th>
                                            <th className="bg-lightPurple-500">
                                                <span className="text-white">Insurance</span>
                                            </th>
                                            <th className="bg-sea-500">
                                                <span className="text-white">Transport</span>
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td className="p-2">
                                                <Radio.Group
                                                    value={pic_Create.service}
                                                    onChange={(e: RadioChangeEvent) =>
                                                        handleRadioChange_Create('service', e.target.value)
                                                    }
                                                >
                                                    <div className="flex flex-col space-y-2">
                                                        {radioOptions.map((option) => (
                                                            <Radio key={option.value} value={option.value}>
                                                                {option.label}
                                                            </Radio>
                                                        ))}
                                                    </div>
                                                </Radio.Group>
                                            </td>
                                            <td className="p-2">
                                                <Radio.Group
                                                    value={pic_Create.general}
                                                    onChange={(e: RadioChangeEvent) =>
                                                        handleRadioChange_Create('general', e.target.value)
                                                    }
                                                >
                                                    <div className="flex flex-col space-y-2">
                                                        {radioOptions.map((option) => (
                                                            <Radio key={option.value} value={option.value}>
                                                                {option.label}
                                                            </Radio>
                                                        ))}
                                                    </div>
                                                </Radio.Group>
                                            </td>
                                            <td className="p-2">
                                                <Radio.Group
                                                    value={pic_Create.lease}
                                                    onChange={(e: RadioChangeEvent) =>
                                                        handleRadioChange_Create('lease', e.target.value)
                                                    }
                                                >
                                                    <div className="flex flex-col space-y-2">
                                                        {radioOptions.map((option) => (
                                                            <Radio key={option.value} value={option.value}>
                                                                {option.label}
                                                            </Radio>
                                                        ))}
                                                    </div>
                                                </Radio.Group>
                                            </td>
                                            <td className="p-2">
                                                <Radio.Group
                                                    value={pic_Create.insurance}
                                                    onChange={(e: RadioChangeEvent) =>
                                                        handleRadioChange_Create('insurance', e.target.value)
                                                    }
                                                >
                                                    <div className="flex flex-col space-y-2">
                                                        {radioOptions.map((option) => (
                                                            <Radio key={option.value} value={option.value}>
                                                                {option.label}
                                                            </Radio>
                                                        ))}
                                                    </div>
                                                </Radio.Group>
                                            </td>
                                            <td className="p-2">
                                                <Radio.Group
                                                    value={pic_Create.transport}
                                                    onChange={(e: RadioChangeEvent) =>
                                                        handleRadioChange_Create('transport', e.target.value)
                                                    }
                                                >
                                                    <div className="flex flex-col space-y-2">
                                                        {radioOptions.map((option) => (
                                                            <Radio key={option.value} value={option.value}>
                                                                {option.label}
                                                            </Radio>
                                                        ))}
                                                    </div>
                                                </Radio.Group>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>

                                <div className="flex justify-end gap-x-2 mt-5">
                                    <button
                                        type="submit"
                                        className="px-4 py-2 rounded btn-latte cursor-pointer"
                                    >
                                        Save
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen_Create(false)}
                                        className="px-4 py-2 rounded btn-outlineLatte cursor-pointer"
                                    >
                                        Cancel
                                    </button>

                                </div>
                            </form>
                        </div>
                    </div>
                )
            }


            {
                isModalOpen_Edit && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 w-3/5 max-w-full">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-bold text-latte-500 font-montserrat">Edit to Person In Charge Master</h3>
                                {/* <button
                                onClick={closeModal_Create}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <X size={20} />
                            </button> */}
                            </div>

                            <form onSubmit={handleSubmit_Edit}>

                                <div className="grid grid-cols-2 xl:grid-cols-12 items-center gap-2">
                                    <div className="col-span-1 text-left xl:text-right">
                                        <label className="text-title">User ID</label>
                                    </div>
                                    <div className="col-span-4 xl:col-span-3 2xl:col-span-2">
                                        <Select
                                            showSearch
                                            style={{ width: '100%' }}
                                            placeholder="เลือกรหัสพนักงาน"
                                            options={optionsID}
                                            value={pic_Edit.userID}
                                            onChange={handleDropDownChange_Edit}
                                            filterOption={(input, option) =>
                                                (option?.label ?? '').toString().toLowerCase().includes(input.toLowerCase())
                                            }
                                        />
                                    </div>
                                    <div className="col-span-2 xl:col-span-1 text-left xl:text-right">
                                        <label className="text-title">Name</label>
                                    </div>
                                    <div className="col-span-4 xl:col-span-4 2xl:col-span-3">
                                        <Select
                                            showSearch
                                            style={{ width: '100%' }}
                                            placeholder="เลือกชื่อพนักงาน"
                                            options={optionsName}
                                            value={pic_Edit.name}
                                            onChange={handleDropDownChange_Edit}
                                            filterOption={(input, option) =>
                                                (option?.label ?? '').toString().toLowerCase().includes(input.toLowerCase())
                                            }
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 mt-4">
                                    <label className="text-base font-bold text-latte-800 font-montserrat">Permission</label>
                                </div>

                                <table className="table-bordered w-full">
                                    <thead>
                                        <tr>
                                            <th className="bg-mint-500">
                                                <span className="text-white">Service</span>
                                            </th>
                                            <th className="bg-biscuit-500">
                                                <span className="text-white">General</span>
                                            </th>
                                            <th className="bg-pinky-500">
                                                <span className="text-white">Lease</span>
                                            </th>
                                            <th className="bg-lightPurple-500">
                                                <span className="text-white">Insurance</span>
                                            </th>
                                            <th className="bg-sea-500">
                                                <span className="text-white">Transport</span>
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td className="p-2">
                                                <Radio.Group
                                                    value={pic_Edit.service}
                                                    onChange={(e: RadioChangeEvent) =>
                                                        handleRadioChange_Edit('service', e.target.value)
                                                    }
                                                >
                                                    <div className="flex flex-col space-y-2">
                                                        {radioOptions.map((option) => (
                                                            <Radio key={option.value} value={option.value}>
                                                                {option.label}
                                                            </Radio>
                                                        ))}
                                                    </div>
                                                </Radio.Group>
                                            </td>
                                            <td className="p-2">
                                                <Radio.Group
                                                    value={pic_Edit.general}
                                                    onChange={(e: RadioChangeEvent) =>
                                                        handleRadioChange_Edit('general', e.target.value)
                                                    }
                                                >
                                                    <div className="flex flex-col space-y-2">
                                                        {radioOptions.map((option) => (
                                                            <Radio key={option.value} value={option.value}>
                                                                {option.label}
                                                            </Radio>
                                                        ))}
                                                    </div>
                                                </Radio.Group>
                                            </td>
                                            <td className="p-2">
                                                <Radio.Group
                                                    value={pic_Edit.lease}
                                                    onChange={(e: RadioChangeEvent) =>
                                                        handleRadioChange_Edit('lease', e.target.value)
                                                    }
                                                >
                                                    <div className="flex flex-col space-y-2">
                                                        {radioOptions.map((option) => (
                                                            <Radio key={option.value} value={option.value}>
                                                                {option.label}
                                                            </Radio>
                                                        ))}
                                                    </div>
                                                </Radio.Group>
                                            </td>
                                            <td className="p-2">
                                                <Radio.Group
                                                    value={pic_Edit.insurance}
                                                    onChange={(e: RadioChangeEvent) =>
                                                        handleRadioChange_Edit('insurance', e.target.value)
                                                    }
                                                >
                                                    <div className="flex flex-col space-y-2">
                                                        {radioOptions.map((option) => (
                                                            <Radio key={option.value} value={option.value}>
                                                                {option.label}
                                                            </Radio>
                                                        ))}
                                                    </div>
                                                </Radio.Group>
                                            </td>
                                            <td className="p-2">
                                                <Radio.Group
                                                    value={pic_Edit.transport}
                                                    onChange={(e: RadioChangeEvent) =>
                                                        handleRadioChange_Edit('transport', e.target.value)
                                                    }
                                                >
                                                    <div className="flex flex-col space-y-2">
                                                        {radioOptions.map((option) => (
                                                            <Radio key={option.value} value={option.value}>
                                                                {option.label}
                                                            </Radio>
                                                        ))}
                                                    </div>
                                                </Radio.Group>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>

                                <div className="flex justify-end gap-x-2 mt-5">
                                    <button type="submit" className="px-4 py-2 rounded btn-latte cursor-pointer">
                                        Update
                                    </button>
                                    <button type="button" onClick={() => setIsModalOpen_Edit(false)} className="px-4 py-2 rounded btn-outlineLatte cursor-pointer">
                                        Cancel
                                    </button>

                                </div>
                            </form>
                        </div>
                    </div>
                )
            }


            {
                isModalOpen_Delete && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 w-2/5 max-w-full">
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
                )
            }


        </main >
    );
}

export default All_PIC_Master_Page;