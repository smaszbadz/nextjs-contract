'use client'

import '@ant-design/v5-patch-for-react-19';
import { Master } from '@/types/master';
import { Insurance } from '@/types/insurance';
import { User } from '@/types/user';
import { ArrowLeft, CheckCircle, FileDown, Info, Mail, Paperclip, Save, Trash2 } from 'lucide-react';
import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Insurance_Create_Action, Insurance_Update_Action } from './action';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';
import 'antd/dist/reset.css';
import { QuestionCircleOutlined, UploadOutlined } from '@ant-design/icons';
import type { TooltipProps, UploadProps, UploadFile } from 'antd';
import { DatePicker, Popconfirm, Button, Tooltip, Upload, message } from 'antd';
import LoadingAnimation from '@/components/LoadingAnimation';
import { Result } from '@/types/result';
import { handleDownloadFile, handleDownloadFile_Detail } from '@/utils/downloadHelper';
import { Delete_File_Action, Delete_File_Detail_Action } from '@/lib/api';
import { Insurance_Detail } from '@/types/insurance_detail';
import { formatDate } from '@/utils/date';

type Props = {
    insuranceEdit: Insurance | null,
    type: string | null,
    core_Status_Masters: Master[],
    core_PIC_Masters: User[],
    core_Branch_Masters: Master[],
    insurance_Code_Masters: Master[],
    text: string
};

function Insurance_Contract_Page({ insuranceEdit, type, core_Status_Masters, core_PIC_Masters, core_Branch_Masters, insurance_Code_Masters, text }: Props) {

    // Use a state to track if the component is mounted
    const [fileList, setFileList] = useState<UploadFile[]>([]);
    const [otherFileList, setOtherFileList] = useState<UploadFile[]>([]);


    let actionText = '';

    const formRef = useRef<HTMLFormElement>(null);
    const [error, setError] = useState<string>('');
    const isEditing = Boolean(insuranceEdit?.id);

    const [arrow] = useState<'Show' | 'Hide' | 'Center'>('Show');


    const [checkNewFile, setCheckNewFile] = useState<boolean>(false);

    const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);

    const mergedArrow = useMemo<TooltipProps['arrow']>(() => {
        if (arrow === 'Hide') {
            return false;
        }

        if (arrow === 'Show') {
            return true;
        }

        return {
            pointAtCenter: true,
        };
    }, [arrow]);


    const initialInsuranceState: Insurance = {
        contractNo: "",
        baseNo: "",
        contractName: "",
        status: "",
        companyEN: "",
        companyTH: "",
        insuredName: "",
        refNo: "",
        attachmentType: "New Contract",
        code: "",
        branch: "",
        startDate: null,
        endDate: null,
        durationYear: "",
        durationMonth: "",
        durationDay: "",
        premise: "",
        amount: null,
        premiumRate: null,
        net: null,
        stampDuty: null,
        vat: null,
        total: null,
        note: "",
        pic_ID1: "",
        pic_Name1: "",
        pic_Email1: "",
        pic_ID2: "",
        pic_Name2: "",
        pic_Email2: "",
        createdID: "",
        createdBy: "",
        createdEmail: "",
        createdAt: null,
        updatedID: "",
        updatedBy: "",
        updatedEmail: "",
        updatedAt: null,
        uploadedID: "",
        uploadedBy: "",
        uploadedEmail: "",
        uploadedAt: null,
        fileName: "",
        file: undefined,
        amendments: [],
        fileDetails: [],
        oldId: "",
        isRenewed: false
    };

    // Hydration-safe state initialization
    const [insurance, setInsurance] = useState<Insurance>(() => {
        // Use a function to ensure consistent initial state
        return insuranceEdit
            ? { ...initialInsuranceState, ...insuranceEdit }
            : initialInsuranceState;
    });

    if (type === 'copy') {
        actionText = 'Copy';
    } else if (type === 'renew') {
        actionText = 'Renew';
    } else if (type === 'amendment') {
        actionText = 'Amendment';
    } else if (type === null || type === undefined) {
        actionText = 'Create';
    } else if (type === 'edit') {
        actionText = 'Edit';
    }

    // Use client-side only state for tracking mounted status
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        // Mark as client-side only after first render
        setIsClient(true);
    }, []);


    // ฟังก์ชันตรวจสอบให้พิมพ์ได้แค่ภาษาอังกฤษกับตัวเลข
    const handleEnglishChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        if (/^[A-Za-z0-9/\s.,()\-&_]*$/.test(value)) {
            setInsurance(prev => ({ ...prev, [name]: value }))
        }
    };

    // ฟังก์ชันตรวจสอบให้พิมพ์ได้แค่ภาษาไทยกับตัวเลข
    const handleThaiChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // const value = e.target.value;
        // if (/^[\u0E00-\u0E7F0-9\s.,()\-&_]*$/.test(value)) {
        //     setInsurance(prev => ({ ...prev, companyTH: e.target.value }))
        // }
        setInsurance(prev => ({ ...prev, companyTH: e.target.value }))
    }


    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (fileList.length === 0 && (type == null || type == 'renew' || type == 'copy')) {
            message.error('กรุณาเลือกไฟล์ก่อนบันทึก');
            return;
        }
        try {


            // Set insurance data at submit time
            const updatedInsurance = { ...insurance };

            // Handle main file
            if (fileList.length > 0) {
                const file = new File([fileList[0].originFileObj as Blob], fileList[0].name);
                updatedInsurance.file = file;
                updatedInsurance.fileName = fileList[0].name;
                updatedInsurance.uploadedBy = '';
                updatedInsurance.uploadedEmail = '';
                updatedInsurance.uploadedAt = null;
            }

            // Handle other files
            if (otherFileList.length > 0) {
                const newFileDetails: Insurance_Detail[] = otherFileList.map(file => ({
                    file: file.originFileObj as File,
                    fileName: file.name,
                    uploadedID: '', // แก้ตรงนี้ให้เป็นข้อมูลจริงถ้ามี
                    uploadedBy: '',
                    uploadedEmail: '',
                    uploadedAt: null
                }));

                // รวมไฟล์เดิมกับไฟล์ใหม่
                const existingFileDetails = insurance.fileDetails || [];
                updatedInsurance.fileDetails = [...existingFileDetails, ...newFileDetails];
            } else {
                // ถ้าไม่มีไฟล์ใหม่ ให้เก็บไฟล์เดิมไว้
                updatedInsurance.fileDetails = insurance.fileDetails || [];
            }

            let result: Result;

            // Check if files are too large
            if (updatedInsurance.file) {
                const maxFileSize = 50 * 1024 * 1024; // 50MB

                if (updatedInsurance.file.size > maxFileSize) {
                    setError("File size exceeds 50MB");
                    return;
                }
            }
            if (isEditing) {
                // กรณี edit
                result = await Insurance_Update_Action(updatedInsurance, checkNewFile);
            } else {
                // กรณี create
                result = await Insurance_Create_Action(updatedInsurance, type, insuranceEdit?.oldId)
            }

            if (result.success) {

                setShowSuccessModal(true);
                // resetForm();

                setTimeout(() => {
                    // บันทึก URL ของหน้าที่ต้องการกลับไปเมื่อกด back
                    const targetUrl = `/insurance_contract/view/${result.id}`;
                    const fallbackUrl = '/insurance_contract/';

                    // ลบประวัติหน้า edit
                    history.replaceState(null, '', fallbackUrl);

                    // นำทางไปยังหน้า view
                    window.location.href = targetUrl;
                }, 1000);

            } else {
                setError(result.message);
            }
        } catch (error) {
            console.error('Error during save:', error);
        }
    };


    const calculateDuration = (startDate: Date, endDate: Date): void => {
        const start = dayjs(startDate);
        const end = dayjs(endDate);

        // กรณีพิเศษ: วันที่ 1 ถึงวันสุดท้ายของเดือนเดียวกัน
        if (start.date() === 1 &&
            end.date() === end.daysInMonth() &&
            start.month() === end.month() &&
            start.year() === end.year()) {
            setInsurance((prev) => ({ ...prev, durationYear: '0', durationMonth: '1', durationDay: '0' }));
            return;
        }

        // กรณีทั่วไป
        let years = 0;
        let months = 0;
        let days = 0;

        // คำนวณจำนวนเดือนเต็ม
        let fullMonths = 0;
        let anniversaryDate = start.clone();

        while (true) {
            // หาวันครบรอบในเดือนถัดไป
            let nextAnniversary = anniversaryDate.add(1, 'month');

            // ถ้าวันที่ในเดือนถัดไปไม่มี ใช้วันสุดท้ายของเดือนนั้น
            if (nextAnniversary.date() !== start.date()) {
                const lastDayOfMonth = nextAnniversary.endOf('month').date();
                if (start.date() > lastDayOfMonth) {
                    nextAnniversary = nextAnniversary.date(lastDayOfMonth);
                } else {
                    nextAnniversary = nextAnniversary.date(start.date());
                }
            }

            // ถ้าวันครบรอบถัดไปมากกว่าวันสิ้นสุด ให้หยุด
            if (nextAnniversary.isAfter(end)) {
                break;
            }

            fullMonths += 1;
            anniversaryDate = nextAnniversary;
        }

        // คำนวณปีและเดือน
        years = Math.floor(fullMonths / 12);
        months = fullMonths % 12;

        // คำนวณวันที่เหลือ
        // กรณีพิเศษ: วันก่อนครบรอบ 1 วัน (เช่น 15 Mar ถึง 14 Apr)
        const oneDayBeforeNextAnniversary = anniversaryDate.add(1, 'month').subtract(1, 'day');

        if (end.isSame(oneDayBeforeNextAnniversary, 'day')) {
            days = 0;
            months += 1;
            if (months === 12) {
                years += 1;
                months = 0;
            }
        }
        // กรณีวันเดียวกัน (เช่น 15 Mar ถึง 15 Apr)
        else if (end.date() === start.date()) {
            days = 1;
        }
        // กรณีอื่นๆ
        else {
            days = end.diff(anniversaryDate, 'day');
            // ถ้าวันสิ้นสุดมากกว่าวันที่เริ่มต้น ต้องบวก 1 เพื่อให้นับวันแรก
            if (end.date() > start.date()) {
                days += 1;
            }
        }

        setInsurance((prev) => ({
            ...prev,
            durationYear: years.toString(),
            durationMonth: months.toString(),
            durationDay: days.toString()
        }));
    };



    // ฟังก์ชันสำหรับ update startDate และเคลียร์ค่า endDate
    const handleStartDateChange = (date: Dayjs | null) => {
        if (!isClient) return;
        setInsurance(prev => ({
            ...prev,
            startDate: date ? date.toDate() : null,
            endDate: null, // เคลียร์ค่า endDate เมื่อ startDate เปลี่ยน
            duration: "" // เคลียร์ค่า duration เมื่อ startDate เปลี่ยน
        }));
    };

    // อัปเดต endDate และคำนวณระยะเวลา
    const handleEndDateChange = (date: Dayjs | null) => {
        if (!isClient || !insurance.startDate) return;

        const startDate = insurance.startDate;
        const endDate = date ? date.toDate() : null;
        if (endDate) {
            calculateDuration(startDate, endDate);
        }

        setInsurance(prev => ({
            ...prev,
            endDate: endDate
        }));
    };

    const disabledEndDate = (current: Dayjs) => {

        if (!isClient || !insurance.startDate) return false;

        return current.isBefore(dayjs(insurance.startDate), 'day');
    };

    // Prevent server-side rendering of dynamic content
    if (!isClient) {
        return <LoadingAnimation />;
    }
    // Success Modal Component
    const SuccessModal = () => {
        if (!showSuccessModal) return null;

        return (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 shadow-lg max-w-md w-full">
                    <div className="flex flex-col items-center justify-center my-4 ">
                        <CheckCircle size={100} className="text-mint-500" />

                        <span className="text-4xl font-bold font-montserrat text-center my-4 text-gray-600">Success!</span>
                        <p className="text-center text-gray-600">The insurance contract has been saved successfully.</p>
                    </div>
                    {/* <button
                            onClick={() => setShowSuccessModal(false)}
                            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                        >
                            Close
                        </button> */}
                </div>
            </div>
        );
    };



    // // Handle file selection
    const handleFileChange: UploadProps['onChange'] = (info) => {
        // Take only the last file (most recent selection)
        let newFileList = info.fileList.slice(-1);

        // Limit file size (e.g., 10MB per file)
        newFileList = newFileList.filter(file => {
            const fileSize = file.size || 0;
            const isLt10M = fileSize / 1024 / 1024 < 10;
            if (!isLt10M) {
                message.error(`${file.name} file exceeds 10MB limit`);
            }
            return isLt10M;
        });

        setFileList(newFileList);
        setCheckNewFile(true)
    };

    const handlFileOtherChange: UploadProps['onChange'] = (info) => {
        let newFileList = [...info.fileList];

        // Limit file size (e.g., 10MB per file)
        newFileList = newFileList.filter(file => {
            const fileSize = file.size || 0;
            const isLt10M = fileSize / 1024 / 1024 < 10;
            if (!isLt10M) {
                message.error(`${file.name} file exceeds 10MB limit`);
            }
            return isLt10M;
        });

        setOtherFileList(newFileList);
    };



    const confirmDeleteFile = async () => {
        // setIsDeleting(true); // เพิ่ม state เพื่อติดตามสถานะการลบ (ถ้าต้องการ)
        try {
            const result = await Delete_File_Action(
                "insurances",
                insuranceEdit?.id,
                "Insurance Contract",
                insurance.contractNo,
                insurance.fileName
            );

            if (result.success) {
                setInsurance(prev => ({ ...prev, fileName: '', uploadedBy: '', uploadedEmail: '', updatedAt: null }));
                // อาจจะแสดงข้อความสำเร็จในรูปแบบอื่น เช่น setSuccessMessage หรือแสดงผ่าน UI element อื่น
            } else {
                setError(result.message);
            }

        } catch (error) {
            console.error('Error during delete:', error);
            setError(error instanceof Error ? error.message : "An unexpected error occurred");
        } finally {
            // setIsDeleting(false);
        }
    };

    const confirmDeleteFile_Detail = async (detailId?: string, fileName?: string) => {
        // setIsDeleting(true); // เพิ่ม state เพื่อติดตามสถานะการลบ (ถ้าต้องการ)
        try {
            if (!detailId) {
                return
            }
            const result = await Delete_File_Detail_Action(
                "insurances",
                insuranceEdit?.id,
                detailId,
                "Insurance Contract",
                insurance.contractNo,
                fileName
            );

            if (result.success) {
                setInsurance(prev => ({
                    ...prev,
                    fileDetails: prev.fileDetails?.filter(detail => detail.id !== detailId) || []
                }));
            } else {
                setError(result.message);
            }

        } catch (error) {
            console.error('Error during delete:', error);
            setError(error instanceof Error ? error.message : "An unexpected error occurred");
        } finally {
            // setIsDeleting(false);
        }
    };

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        const newValue = value === '' ? null : Number(value);
        // Create a new lease object with updated quantity
        const newLease = { ...insurance, amount: newValue };
        setInsurance(newLease);
    };


    const handlePremiumRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        const newValue = value === '' ? null : Number(value);
        // Create a new lease object with updated quantity
        const newLease = { ...insurance, premiumRate: newValue };
        setInsurance(newLease);
    };

    const handleNetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        const newValue = value === '' ? null : Number(value);
        // Create a new lease object with updated quantity
        const newLease = { ...insurance, net: newValue };
        setInsurance(newLease);
    };

    const handleStampDutyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        const newValue = value === '' ? null : Number(value);
        // Create a new lease object with updated quantity
        const newLease = { ...insurance, stampDuty: newValue };
        setInsurance(newLease);
    };

    const handleVatChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        const newValue = value === '' ? null : Number(value);
        // Create a new lease object with updated quantity
        const newLease = { ...insurance, vat: newValue };
        setInsurance(newLease);
    };

    const handleTotalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        const newValue = value === '' ? null : Number(value);
        // Create a new lease object with updated quantity
        const newLease = { ...insurance, total: newValue };
        setInsurance(newLease);
    };

    const handleBack = () => {
        if (type === "edit") {
            window.history.back(); // กลับหน้าก่อนหน้า
        } else {
            window.location.href = "/insurance_contract"; // ไป path แบบปกติ
        }
    };

    return (
        <main>
            <div className="mx-auto px-5 pb-5">
                <div className="flex items-center gap-2">
                    <ArrowLeft
                        onClick={handleBack}
                        className="inline-flex text-pinky-500 me-2 cursor-pointer"
                    />
                    <label className="text-3xl text-lightPurple-500 font-montserrat font-bold">{actionText}   {(type === 'edit' || type === 'amendment' || type === 'renew') && insuranceEdit?.contractNo ? ` - ${insuranceEdit.contractNo}` : ''}</label>
                </div>
                <form ref={formRef} onSubmit={handleSubmit}>
                    <div className="card mt-8 space-y-4 px-4">
                        <div className="flex justify-center gap-4">
                            <span className="text-base text-red-500">{error}</span>
                        </div>


                        {/* Contract name */}
                        <div className="grid grid-cols-2 xl:grid-cols-12 items-center gap-2">
                            <div className="col-span-2 xl:col-span-2 text-left xl:text-right">
                                <label className="text-title">
                                    Contract Name
                                </label>
                            </div>
                            <div className="col-span-2 xl:col-span-5">
                                <input
                                    type="text"
                                    className="input-formcontrol"
                                    name="contractName"
                                    value={insurance.contractName}
                                    onChange={(e) => setInsurance(prev => ({ ...prev, contractName: e.target.value }))}
                                    required
                                />
                            </div>
                            <div className="col-span-2 xl:col-span-1 text-left xl:text-right">
                                <label className="text-title">Status</label>
                            </div>
                            <div className="col-span-2 xl:col-span-4">
                                <select
                                    className="input-formcontrol"
                                    value={insurance.status}
                                    onChange={(e) => setInsurance(prev => ({ ...prev, status: e.target.value }))}
                                    required
                                >
                                    <option value="">- Select -</option>
                                    {core_Status_Masters?.map((item) => (
                                        <option key={item.id} value={item.description}>
                                            {item.description}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Company Fields */}
                        {/* แถวแรก: Company (ENG) */}
                        <div className="grid grid-cols-2 xl:grid-cols-12 items-center gap-2">
                            <div className="col-span-2 xl:col-span-2 text-left xl:text-right">
                                <label className="text-title">Company<span className=" font-normal text-sm text-gray-500 ms-2">(ENG)</span></label>
                            </div>
                            <div className="col-span-2 xl:col-span-5">
                                <input
                                    type="text"
                                    className="input-formcontrol"
                                    value={insurance.companyEN}
                                    name="companyEN"
                                    onChange={handleEnglishChange}
                                    required
                                />
                            </div>
                            <div className="col-span-2 xl:col-span-1 text-left xl:text-right">
                                <label className="text-title">
                                    Code
                                </label>
                            </div>
                            <div className="col-span-1 xl:col-span-2">
                                <select className="input-formcontrol"
                                    value={insurance.code}
                                    onChange={(e) => setInsurance(prev => ({ ...prev, code: e.target.value }))}
                                    required
                                >
                                    <option value="" >
                                        - Select -
                                    </option>
                                    {insurance_Code_Masters?.map((item) => (
                                        <option key={item.id} value={item.description}>
                                            {item.description}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="col-span-1 xl:col-span-2 text-left xl:text-right">
                                <div className="flex items-center">
                                    <label className="text-title pe-2">
                                        Branch
                                    </label>
                                    <select className="input-formcontrol"
                                        value={insurance.branch}
                                        onChange={(e) => setInsurance(prev => ({ ...prev, branch: e.target.value }))}
                                        required
                                    >
                                        <option value="" >
                                            - Select -
                                        </option>
                                        {core_Branch_Masters?.map((item) => (
                                            <option key={item.id} value={item.description}>
                                                {item.description}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                        {/* แถวสอง: Company (TH) */}
                        <div className="grid grid-cols-2 xl:grid-cols-12 items-center gap-2">
                            <div className="col-span-2 xl:col-span-2 text-left xl:text-right">
                                <label className="text-title">Company<span className=" font-normal text-sm text-gray-500 ms-2">(TH)</span></label>
                            </div>
                            <div className="col-span-2 xl:col-span-5">
                                <input
                                    type="text"
                                    className="input-formcontrol"
                                    value={insurance.companyTH}
                                    onChange={handleThaiChange}
                                />
                            </div>
                            {/* แถวสำหรับ Attachment Type */}
                            <div className="col-span-2 xl:col-span-1 text-left xl:text-right">
                                <label className="text-title">Attachment</label>
                            </div>
                            <div className="col-span-2 xl:col-span-4">
                                <div className="flex justify-start items-center xl:items-center gap-2">
                                    <span className="text-sm text-gray-600 me-4">{insurance.attachmentType}</span>

                                    <Tooltip placement="bottom" title={text} arrow={mergedArrow} color={'#0284c7'} className="cursor-pointer">
                                        <Info size={18} />
                                    </Tooltip>

                                </div>
                                {/* <div className="flex flex-col xl:flex-row justify-start items-start xl:items-center gap-2">
                                        <div>
                                            <input
                                                type="radio"
                                                name="attachmentType"
                                                value="New Contract"
                                                checked={insurance.attachmentType === "New Contract"}
                                                onChange={handleRadioChange}
                                                required
                                            />
                                            <span className="text-gray-600 ms-2">New Contract</span>
                                        </div>
                                        <div className="mx-0 xl:mx-4">
                                            <input
                                                type="radio"
                                                name="attachmentType"
                                                value="Renewed"
                                                checked={insurance.attachmentType === "Renewed"}
                                                onChange={handleRadioChange}
                                            />
                                            <span className="text-gray-600 ms-2">Renew</span>
                                        </div>
                                        <div>
                                            <input
                                                type="radio"
                                                name="attachmentType"
                                                value="Amendment"
                                                checked={insurance.attachmentType === "Amendment"}
                                                onChange={handleRadioChange}
                                            />
                                            <span className="text-gray-600 mx-2 text-nowrap">Amendment No.</span>
                                        </div>
                                        <div className="flex-1 w-96">
                                            <input
                                                type="text"
                                                className="input-formcontrol"
                                                value={insurance.amendmentNo}
                                                onChange={(e) => setInsurance(prev => ({ ...prev, amendmentNo: e.target.value }))}
                                            />
                                        </div>
                                    </div> */}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 xl:grid-cols-12 items-center gap-2">
                            <div className="col-span-2 xl:col-span-2 text-left xl:text-right">
                                <label className="text-title">
                                    The Insured
                                </label>
                            </div>
                            <div className="col-span-2 xl:col-span-5">
                                <input
                                    type="text"
                                    className="input-formcontrol"
                                    name="insuredName"
                                    value={insurance.insuredName}
                                    onChange={handleEnglishChange}
                                    required
                                />
                            </div>
                        </div>


                        {/* Contract reference number */}
                        <div className="grid grid-cols-2 xl:grid-cols-12 items-center gap-2">
                            <div className="col-span-2 xl:col-span-2 text-left xl:text-right">
                                <label className="text-title">
                                    Contract Reference Number
                                </label>
                            </div>
                            <div className="col-span-2 xl:col-span-5">
                                <input
                                    type="text"
                                    className="input-formcontrol"
                                    value={insurance.refNo}
                                    onChange={(e) => setInsurance(prev => ({ ...prev, refNo: e.target.value }))}
                                />
                            </div>
                            <span className="text-gray-400">(Optional)</span>
                        </div>


                        <div className="grid grid-cols-2 xl:grid-cols-12 items-center gap-2">
                            <div className="col-span-2 xl:col-span-2 text-left xl:text-right">
                                <label className="text-title">Contract Period</label>
                            </div>
                            <div className="col-span-2 xl:col-span-10">
                                <div className="flex flex-col xl:flex-row justify-start items-start xl:items-center gap-1">
                                    <span className="text-sm text-gray-600 text-nowrap text-left xl:text-right">Start</span>
                                    <div className="ms-0 xl:ms-2 me-4 w-full xl:w-40">
                                        <DatePicker
                                            value={insurance.startDate ? dayjs(insurance.startDate) : null}
                                            onChange={handleStartDateChange}
                                            format="DD MMM YYYY"
                                            // placeholder="Start Date"
                                            className="input-formcontrol rounded"
                                            required
                                        />
                                    </div>

                                    <span className="text-sm text-gray-600 text-nowrap text-left xl:text-right">End</span>
                                    <div className="ms-0 xl:ms-2 me-4 w-full xl:w-40">
                                        <DatePicker
                                            value={insurance.endDate ? dayjs(insurance.endDate) : null}
                                            onChange={handleEndDateChange}
                                            format="DD MMM YYYY"
                                            // placeholder="End Date"
                                            disabledDate={disabledEndDate}
                                            disabled={!insurance.startDate} // ปิดการใช้งานถ้ายังไม่ได้เลือก startDate
                                            className="input-formcontrol"
                                            required
                                        />
                                    </div>

                                    <span className="text-sm text-gray-600">Duration:
                                        {insurance.endDate ? (
                                            <span className="text-sm text-gray-600">
                                                <span className="text-blue-500 font-bold ms-2">{insurance.durationYear}</span> Year(s)
                                                <span className="text-blue-500 font-bold ms-2">{insurance.durationMonth}</span> Month(s)
                                                <span className="text-blue-500 font-bold ms-2">{insurance.durationDay}</span> Day(s)
                                            </span>
                                        ) : <span className="text-blue-500 font-bold ms-2">-</span>}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 xl:grid-cols-12 items-center gap-2">
                            <div className="col-span-2 xl:col-span-2 text-left xl:text-right">
                                <label className="text-title">Insured Premise</label>
                            </div>
                            <div className="col-span-2 xl:col-span-10">
                                <input
                                    type="text"
                                    className="input-formcontrol"
                                    value={insurance.premise}
                                    onChange={(e) => setInsurance(prev => ({ ...prev, premise: e.target.value }))}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 xl:grid-cols-12 items-center gap-2">
                            <div className="col-span-2 xl:col-span-2 text-left xl:text-right">
                                <label className="text-title">Amount Insured</label>
                            </div>
                            <div className="col-span-2 xl:col-span-2">
                                <input
                                    type="number"
                                    className="input-formcontrol"
                                    value={insurance.amount ?? ''}
                                    onChange={handleAmountChange}
                                />
                            </div>
                            <div className="col-span-2 xl:col-span-1 text-left xl:text-right">
                                <label className="text-title">Premium Rate %</label>
                            </div>
                            <div className="col-span-2 xl:col-span-1">
                                <input
                                    type="number"
                                    className="input-formcontrol"
                                    value={insurance.premiumRate ?? ''}
                                    onChange={handlePremiumRateChange}
                                />
                            </div>
                            <span className="text-gray-400">(Optional)</span>
                        </div>
                        <div className="grid grid-cols-2 xl:grid-cols-12 items-center gap-2">
                            <div className="col-span-2 xl:col-span-2 text-left xl:text-right">
                                <label className="text-title">Insurance Price</label>
                            </div>
                            <div className="col-span-2 xl:col-span-1 text-left xl:text-right">
                                <label className="text-title">Net Premium</label>
                            </div>
                            <div className="col-span-2 xl:col-span-1">
                                <input
                                    type="number"
                                    className="input-formcontrol"
                                    value={insurance.net ?? ''}
                                    onChange={handleNetChange}
                                />
                            </div>
                            <div className="col-span-2 xl:col-span-1 text-left xl:text-right">
                                <label className="text-title">Stamp Duty</label>
                            </div>
                            <div className="col-span-2 xl:col-span-1">
                                <input
                                    type="number"
                                    className="input-formcontrol"
                                    value={insurance.stampDuty ?? ''}
                                    onChange={handleStampDutyChange}
                                />
                            </div>

                        </div>

                        <div className="grid grid-cols-2 xl:grid-cols-12 items-center gap-2">
                            <div className="col-span-2 xl:col-span-1 col-start-1 xl:col-start-3 text-left xl:text-right">
                                <label className="text-title">Vat</label>
                            </div>
                            <div className="col-span-2 xl:col-span-1">
                                <input
                                    type="number"
                                    className="input-formcontrol"
                                    value={insurance.vat ?? ''}
                                    onChange={handleVatChange}
                                />
                            </div>
                            <div className="col-span-2 xl:col-span-1 text-left xl:text-right">
                                <label className="text-title">Total</label>
                            </div>
                            <div className="col-span-2 xl:col-span-1">
                                <input
                                    type="number"
                                    className="input-formcontrol"
                                    value={insurance.total ?? ''}
                                    onChange={handleTotalChange}
                                />
                            </div>
                        </div>



                        <div className="grid grid-cols-2 xl:grid-cols-12 items-center gap-2">
                            <div className="col-span-2 xl:col-span-2 text-left xl:text-right">
                                <label className="text-title">Note</label>
                            </div>
                            <div className="col-span-2 xl:col-span-5">
                                <input
                                    type="text"
                                    className="input-formcontrol"
                                    value={insurance.note}
                                    onChange={(e) => setInsurance(prev => ({ ...prev, note: e.target.value }))}
                                />
                            </div>
                            <span className="text-gray-400">(Optional)</span>
                        </div>

                        <div className="grid grid-cols-4 xl:grid-cols-12 items-center gap-2">
                            <div className="col-span-2 xl:col-span-2 text-left xl:text-right">
                                <label className="text-title">Person In Charge
                                </label>
                            </div>
                            <div className="col-span-3 xl:col-span-5">
                                <div className="flex justify-start items-start xl:items-center gap-2">
                                    <select className="input-formcontrol"
                                        value={insurance.pic_ID1}
                                        onChange={(e) => {
                                            const selectedPic = core_PIC_Masters.find(item => item.userID === e.target.value);
                                            setInsurance(prev => ({
                                                ...prev,
                                                pic_ID1: e.target.value,
                                                pic_Name1: selectedPic ? selectedPic.name : "",
                                            }));
                                        }}
                                        required
                                    >
                                        <option value="" >
                                            - Select -
                                        </option>
                                        {core_PIC_Masters?.map((item) => (
                                            <option key={item.id} value={item.userID}>
                                                {item.name}
                                            </option>
                                        ))}
                                    </select>
                                    <select className="input-formcontrol"
                                        value={insurance.pic_ID2}
                                        onChange={(e) => {
                                            const selectedPic = core_PIC_Masters.find(item => item.userID === e.target.value);
                                            setInsurance(prev => ({
                                                ...prev,
                                                pic_ID2: e.target.value,
                                                pic_Name2: selectedPic ? selectedPic.name : ""
                                            }));
                                        }}
                                    >
                                        <option value="" >
                                            - Select -
                                        </option>
                                        {core_PIC_Masters?.map((item) => (
                                            <option key={item.id} value={item.userID}>
                                                {item.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="col-span-1 xl:col-span-2 text-[13px]">
                                <div className="space-x-1 mt-2 xl:mt-0">
                                    <Mail className="text-blue-500 inline-flex mb-1" size={15} />
                                    <label className="text-gray-700 text-left">Notify to</label>
                                    <span className="text-gray-500">ASM - DMG</span>
                                </div>
                            </div>
                        </div>
                        {insurance.uploadedBy == '' &&
                            <div className="grid grid-cols-2 xl:grid-cols-12 items-center gap-2">
                                <div className="col-span-2 xl:col-span-2 text-left xl:text-right">
                                    <div className="flex flex-row xl:flex-col justify-start xl:justify-end">
                                        <label className="text-title">Insurance Contract</label>
                                        <span className="text-xs text-gray-400 me-0 xl:me-2 ms-3 xl:ms-0">Only one file can be uploaded.</span>
                                    </div>
                                </div>
                                <div className="col-span-2 xl:col-span-10">
                                    <div className="flex items-center gap-2">
                                        <Upload
                                            multiple={false}
                                            maxCount={1}
                                            beforeUpload={() => false}
                                            onChange={handleFileChange}
                                            fileList={fileList}
                                            showUploadList={false} // ซ่อน preview ด้านล่าง
                                        >
                                            <Button icon={<UploadOutlined />}>Select a File</Button>
                                        </Upload>
                                        {fileList.length > 0 && (
                                            <span className="truncate max-w-[200px] text-sm text-gray-700">
                                                {fileList[0].name}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        }

                        <div className="grid grid-cols-2 xl:grid-cols-12 items-top gap-2">
                            <div className="col-span-2 xl:col-span-2 text-left xl:text-right">
                                <div className="flex flex-row xl:flex-col justify-start xl:justify-end">
                                    <label className="text-title">Other Documents</label>
                                    <span className="text-xs text-gray-400 me-0 xl:me-2 ms-3 xl:ms-0">Multiple files can be uploaded.</span>
                                </div>
                            </div>
                            <div className="col-span-2 xl:col-span-5">
                                <div className="flex items-center gap-2">
                                    <Upload
                                        multiple={true}
                                        beforeUpload={() => false}
                                        onChange={handlFileOtherChange}
                                        fileList={otherFileList}
                                    >
                                        <Button icon={<UploadOutlined />}>Select a File</Button>
                                    </Upload>

                                </div>
                            </div>
                        </div>
                        <div className="flex justify-start xl:justify-end">
                            {type === 'edit' &&
                                <div className="text-[13px]">
                                    <div className="flex items-center gap-2 mt-2 xl:mt-0">
                                        <label className="text-gray-700 w-16 font-bold text-left text-nowrap">Created By </label>
                                        <span className="text-gray-500 text-nowrap">{insurance.createdBy}</span>
                                        <span className="text-gray-500 ms-1 text-[11px]">{insurance.createdAt ?
                                            formatDate(insurance.createdAt, true)
                                            : ''}</span>
                                    </div>


                                    <div className="flex items-center gap-2 mt-2 xl:mt-1">
                                        <label className="text-gray-700 w-16 font-bold text-left text-nowrap">Updated By </label>
                                        {insurance.updatedBy && <>
                                            <span className="text-gray-500 text-nowrap">{insurance.updatedBy}</span>
                                            <span className="text-gray-500 ms-1 text-[11px]">{insurance.updatedAt ?
                                                formatDate(insurance.updatedAt, true)
                                                : ''}</span>
                                        </> || '-'
                                        }
                                    </div>
                                </div>
                            }
                        </div>
                        {type == 'edit' && insurance.uploadedBy != '' &&
                            <>
                                <div className="flex items-center gap-2 mb-2 mt-10">
                                    <Paperclip className="text-lightPurple-500 w-5 h-5" />
                                    <span className="text-xl text-gray-700 font-montserrat font-bold">Attachment</span>
                                </div>
                                <table className="table-striped w-full">
                                    <thead>
                                        <tr>
                                            <th className="bg-lightPurple-50 w-8/12 text-left">File</th>
                                            <th className="bg-lightPurple-50 text-left">Uploaded by</th>
                                            <th className="bg-lightPurple-50 text-left">Last Updated</th>
                                            <th className="bg-lightPurple-50 w-10"></th>
                                            <th className="bg-lightPurple-50 w-10"></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td>{insurance.fileName}</td>
                                            <td>{insurance.uploadedBy}</td>
                                            <td>{formatDate(insurance.uploadedAt, true)}</td>
                                            <td className="h-12">
                                                <div className="flex items-center justify-center">
                                                    <FileDown
                                                        className="text-lightPurple-500 hover:text-lightPurple-600 cursor-pointer"
                                                        onClick={() => handleDownloadFile('Insurance Contract', insurance.id, insurance.fileName)}
                                                    />
                                                </div>
                                            </td>
                                            <td className="text-red-500 hover:text-red-600 text-center ">
                                                <Popconfirm
                                                    title="Delete the file"
                                                    description="Are you sure you want to delete this file?"
                                                    placement='topRight'
                                                    onConfirm={() => confirmDeleteFile()}
                                                    // onCancel={cancel}
                                                    okText="Yes"
                                                    okType="danger"
                                                    cancelText="No"
                                                    icon={<QuestionCircleOutlined style={{ color: 'red' }} />}
                                                >
                                                    <Trash2 className="text-red-500 hover:text-red-600 cursor-pointer" />
                                                </Popconfirm>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </>
                        }

                        {type == 'edit' && insurance.fileDetails?.length > 0 &&
                            <>
                                <div className="flex items-center gap-2 mb-2 mt-10">
                                    <Paperclip className="text-lightPurple-500 w-5 h-5" />
                                    <span className="text-xl text-gray-700 font-montserrat font-bold">Other</span>
                                </div>
                                <table className="table-striped w-full">
                                    <thead>
                                        <tr>
                                            <th className="bg-lightPurple-50 w-10">No</th>
                                            <th className="bg-lightPurple-50 w-8/12 text-left">File</th>
                                            <th className="bg-lightPurple-50 text-left">Uploaded by</th>
                                            <th className="bg-lightPurple-50 text-left">Last Updated</th>
                                            <th className="bg-lightPurple-50 w-10"></th>
                                            <th className="bg-lightPurple-50 w-10"></th>
                                        </tr>
                                    </thead>
                                    <tbody>

                                        {insurance.fileDetails?.map((item, index) => (
                                            <tr key={item.id}>
                                                <td className="text-center">{index + 1}</td>
                                                <td>{item.fileName}</td>
                                                <td>{item.uploadedBy}</td>
                                                <td>{formatDate(item.uploadedAt, true)}</td>

                                                <td className="h-12">
                                                    <div className="flex items-center justify-center">
                                                        <FileDown
                                                            className="text-lightPurple-500 hover:text-lightPurple-600 cursor-pointer"
                                                            onClick={() => handleDownloadFile_Detail(insurance.contractNo, item.fileName)}
                                                        />
                                                    </div>
                                                </td>
                                                <td className="text-red-500 hover:text-red-600 text-center ">
                                                    <Popconfirm
                                                        title="Delete the file"
                                                        description="Are you sure you want to delete this file?"
                                                        placement='topRight'
                                                        onConfirm={() => confirmDeleteFile_Detail(item.id, item.fileName)}
                                                        // onCancel={cancel}
                                                        okText="Yes"
                                                        okType="danger"
                                                        cancelText="No"
                                                        icon={<QuestionCircleOutlined style={{ color: 'red' }} />}
                                                    >
                                                        <Trash2 className="text-red-500 hover:text-red-600 cursor-pointer" />
                                                    </Popconfirm>
                                                </td>

                                            </tr>
                                        ))}



                                    </tbody>
                                </table>
                            </>
                        }

                        <div className="flex justify-center items-center mt-12">
                            <button type="submit" className="btn btn-mint flex items-center gap-2">
                                <Save className="inline-flex" size={16} /> {type == 'edit' ? "Update" : "Save"}
                            </button>
                        </div>
                    </div>
                </form >


                {SuccessModal()}


            </div >
        </main >
    );
}

export default Insurance_Contract_Page;