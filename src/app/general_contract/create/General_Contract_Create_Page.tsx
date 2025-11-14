'use client'

import '@ant-design/v5-patch-for-react-19';
import { Master } from '@/types/master';
import { User } from '@/types/user';
import { ArrowLeft, CheckCircle, FileDown, Info, Mail, Paperclip, Save, Trash2 } from 'lucide-react';
import React, { useEffect, useRef, useState, useMemo } from 'react';
import { General_Create_Action, General_Update_Action } from './action';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';
import 'antd/dist/reset.css';
import { QuestionCircleOutlined, UploadOutlined } from '@ant-design/icons';
import type { TooltipProps, UploadProps, UploadFile } from 'antd';
import { DatePicker, Popconfirm, Button, Tooltip, Upload, message } from 'antd';
import LoadingAnimation from '@/components/LoadingAnimation';
import { Result } from '@/types/result';
import { handleDownloadFile } from '@/utils/downloadHelper';
import { General } from '@/types/general';
import { Delete_File_Action } from '@/lib/api';
import { formatDate } from '@/utils/date';

type Props = {
    generalEdit: General | null,
    type: string | null,
    core_Renewal_Masters: Master[],
    core_Notify_Masters: Master[],
    core_Status_Masters: Master[],
    core_PIC_Masters: User[],
    general_Usage_Masters: Master[],
    general_Category_Masters: Master[],
    text: string
};

function General_Contract_Create_Page({ generalEdit, type, core_Renewal_Masters, core_Notify_Masters, core_Status_Masters, core_PIC_Masters, general_Usage_Masters, general_Category_Masters, text }: Props) {

    // Use a state to track if the component is mounted
    const [fileList, setFileList] = useState<UploadFile[]>([]);
    let actionText = '';

    const formRef = useRef<HTMLFormElement>(null);
    const [error, setError] = useState<string>('');
    const isEditing = Boolean(generalEdit?.id);

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


    const initialGeneralState: General = {
        contractNo: "",
        baseNo: "",
        contractName: "",
        status: "",
        companyEN: "",
        companyTH: "",
        refNo: "",
        attachmentType: "New Contract",
        usage: "",
        startDate: null,
        endDate: null,
        durationYear: "",
        durationMonth: "",
        durationDay: "",
        category: "",
        detail: "",
        price: "",
        renewal: "",
        notify: "",
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
        oldId: "",
        isRenewed: false
    };

    // Hydration-safe state initialization
    const [general, setGeneral] = useState<General>(() => {
        // Use a function to ensure consistent initial state
        return generalEdit
            ? { ...initialGeneralState, ...generalEdit }
            : initialGeneralState;
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
            setGeneral(prev => ({ ...prev, [name]: value }))
        }
    };

    // ฟังก์ชันตรวจสอบให้พิมพ์ได้แค่ภาษาไทยกับตัวเลข
    const handleThaiChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // const value = e.target.value;
        // if (/^[\u0E00-\u0E7F0-9\s.,()\-&_]*$/.test(value)) {
        //     setGeneral(prev => ({ ...prev, companyTH: e.target.value }))
        // }
        setGeneral(prev => ({ ...prev, companyTH: e.target.value }))
    }


    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (fileList.length === 0 && (type == null || type == 'renew' || type == 'copy')) {
            message.error('กรุณาเลือกไฟล์ก่อนบันทึก');
            return;
        }
        try {

            let result: Result;

            // Check if files are too large
            if (general.file) {
                const maxFileSize = 50 * 1024 * 1024; // 50MB

                if (general.file.size > maxFileSize) {
                    setError("File size exceeds 50MB");
                    return;
                }
            }


            if (isEditing) {
                // กรณี edit
                result = await General_Update_Action(general, checkNewFile);
            } else {
                // กรณี create
                result = await General_Create_Action(general, type, generalEdit?.oldId);
            }

            if (result.success) {

                setShowSuccessModal(true);
                // resetForm();

                setTimeout(() => {
                    // บันทึก URL ของหน้าที่ต้องการกลับไปเมื่อกด back
                    const targetUrl = `/general_contract/view/${result.id}`;
                    const fallbackUrl = '/general_contract/';

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
            setGeneral((prev) => ({ ...prev, durationYear: '0', durationMonth: '1', durationDay: '0' }));
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

        setGeneral((prev) => ({
            ...prev,
            durationYear: years.toString(),
            durationMonth: months.toString(),
            durationDay: days.toString()
        }));
    };



    // ฟังก์ชันสำหรับ update startDate และเคลียร์ค่า endDate
    const handleStartDateChange = (date: Dayjs | null) => {
        if (!isClient) return;
        setGeneral(prev => ({
            ...prev,
            startDate: date ? date.toDate() : null,
            endDate: null, // เคลียร์ค่า endDate เมื่อ startDate เปลี่ยน
            duration: "" // เคลียร์ค่า duration เมื่อ startDate เปลี่ยน
        }));
    };

    // อัปเดต endDate และคำนวณระยะเวลา
    const handleEndDateChange = (date: Dayjs | null) => {
        if (!isClient || !general.startDate) return;

        const startDate = general.startDate;
        const endDate = date ? date.toDate() : null;
        if (endDate) {
            calculateDuration(startDate, endDate);
        }

        setGeneral(prev => ({
            ...prev,
            endDate: endDate
        }));
    };

    const disabledEndDate = (current: Dayjs) => {

        if (!isClient || !general.startDate) return false;

        return current.isBefore(dayjs(general.startDate), 'day');
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
                        <p className="text-center text-gray-600">The General contract has been saved successfully.</p>
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

    // const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    //     const file = e.target.files?.[0];
    //     if (file) {
    //         setGeneral((prev) => ({
    //             ...prev,
    //             file: file,
    //             fileName: file.name,
    //         }));
    //         setCheckNewFile(true)
    //     }
    // };


    // // Handle file selection
    const handleFileChange: UploadProps['onChange'] = (info) => {
        // let newFileList = [...info.fileList];
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

        // Convert to File objects
        const file: File | undefined = newFileList.length > 0
            ? new File([newFileList[0].originFileObj as Blob], newFileList[0].name)
            : undefined;


        // Get filenames as a comma-separated string
        // const fileNames = newFileList.map(file => file.name).join(', ');

        const fileName = newFileList.length > 0 ? newFileList[0].name : '';

        setFileList(newFileList);
        setGeneral(prev => ({ ...prev, file: file, fileName: fileName, uploadedBy: '', uploadedEmail: '', uploadedAt: null })); // Store actual File objects in General state
        setCheckNewFile(true)
    };

    const confirmDeleteFile = async () => {
        // setIsDeleting(true); // เพิ่ม state เพื่อติดตามสถานะการลบ (ถ้าต้องการ)
        try {
            const result = await Delete_File_Action(
                "generals",
                generalEdit?.id,
                "General Contract",
                general.contractNo,
                general.fileName
            );

            if (result.success) {
                setGeneral(prev => ({ ...prev, fileName: '', uploadedBy: '', uploadedEmail: '', updatedAt: null }));
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

    const handleBack = () => {
        if (type === "edit") {
            window.history.back(); // กลับหน้าก่อนหน้า
        } else {
            window.location.href = "/general_contract"; // ไป path แบบปกติ
        }
    };

    return (
        <main>
            <div className="mx-auto px-5 pb-5">
                <div className="flex items-center gap-2">
                    <ArrowLeft onClick={handleBack} className="inline-flex text-mint-500 me-2 cursor-pointer" />
                    <label className="text-3xl text-biscuit-500 font-montserrat font-bold">{actionText}   {(type === 'edit' || type === 'amendment') && generalEdit?.contractNo ? ` - ${generalEdit.contractNo}` : ''}</label>
                </div>
                <form ref={formRef} onSubmit={handleSubmit}>
                    <div className="card mt-8 space-y-4 px-4">
                        <div className="flex justify-center gap-4">
                            <span className="text-base text-red-500">{error}</span>
                        </div>


                        {/* Contract name */}
                        <div className="grid grid-cols-2 xl:grid-cols-12 items-center gap-2">
                            <div className="col-span-2 xl:col-span-2 text-left xl:text-right">
                                <label className="text-title">Contract Name </label>
                            </div>
                            <div className="col-span-2 xl:col-span-5">
                                <input
                                    type="text"
                                    className="input-formcontrol"
                                    name="contractName"
                                    value={general.contractName}
                                    onChange={(e) => setGeneral(prev => ({ ...prev, contractName: e.target.value }))}
                                    required
                                />
                            </div>
                            <div className="col-span-2 xl:col-span-1 text-left xl:text-right">
                                <label className="text-title">Status</label>
                            </div>
                            <div className="col-span-2 xl:col-span-4 2xl:col-span-4">
                                <select
                                    className="input-formcontrol"
                                    value={general.status}
                                    onChange={(e) => setGeneral(prev => ({ ...prev, status: e.target.value }))}
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

                        {/* Lessor Fields */}
                        {/* แถวแรก: Lessor (ENG) */}
                        <div className="grid grid-cols-2 xl:grid-cols-12 items-center gap-2">
                            <div className="col-span-2 xl:col-span-2 2xl:col-span-2 text-left xl:text-right">
                                <label className="text-title">Contracting Company<span className=" font-normal text-sm text-gray-500 ms-2">(ENG)</span></label>
                            </div>
                            <div className="col-span-2 xl:col-span-5 2xl:col-span-5">
                                <input
                                    type="text"
                                    className="input-formcontrol"
                                    name="companyEN"
                                    value={general.companyEN}
                                    onChange={handleEnglishChange}
                                    required
                                />
                            </div>
                            <div className="col-span-2 xl:col-span-1 text-left xl:text-right">
                                <label className="text-title">User </label>
                            </div>
                            <div className="col-span-1 xl:col-span-2 2xl:col-span-1">
                                <select className="input-formcontrol"
                                    value={general.usage}
                                    onChange={(e) => setGeneral(prev => ({ ...prev, usage: e.target.value }))}
                                    required
                                >
                                    <option value="" >
                                        - Select -
                                    </option>
                                    {general_Usage_Masters?.map((item) => (
                                        <option key={item.id} value={item.description}>
                                            {item.description}
                                        </option>
                                    ))}
                                </select>
                            </div>

                        </div>
                        {/* แถวสอง: Lessor (TH) */}
                        <div className="grid grid-cols-2 xl:grid-cols-12 items-center gap-2">
                            <div className="col-span-2 xl:col-span-2 text-left xl:text-right">
                                <label className="text-title">Contracting Company<span className=" font-normal text-sm text-gray-500 ms-2">(TH)</span></label>
                            </div>
                            <div className="col-span-2 xl:col-span-5 2xl:col-span-5">
                                <input
                                    type="text"
                                    className="input-formcontrol"
                                    value={general.companyTH}
                                    onChange={handleThaiChange}
                                />
                            </div>
                            {/* แถวสำหรับ Attachment Type */}
                            <div className="col-span-2 xl:col-span-1 text-left xl:text-right">
                                <label className="text-title">Attachment</label>
                            </div>
                            <div className="col-span-2 xl:col-span-4">
                                <div className="flex justify-start items-center xl:items-center gap-2">
                                    <span className="text-sm text-gray-600 me-4">{general.attachmentType}</span>
                                    <Tooltip placement="bottom" title={text} arrow={mergedArrow} color={'#108ee9'} >
                                        <Info />
                                    </Tooltip>

                                </div>
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
                                    value={general.refNo}
                                    onChange={(e) => setGeneral(prev => ({ ...prev, refNo: e.target.value }))}
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
                                            value={general.startDate ? dayjs(general.startDate) : null}
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
                                            value={general.endDate ? dayjs(general.endDate) : null}
                                            onChange={handleEndDateChange}
                                            format="DD MMM YYYY"
                                            // placeholder="End Date"
                                            disabledDate={disabledEndDate}
                                            disabled={!general.startDate} // ปิดการใช้งานถ้ายังไม่ได้เลือก startDate
                                            className="input-formcontrol"
                                            required
                                        />
                                    </div>

                                    <span className="text-sm text-gray-600">Duration:
                                        {general.endDate ? (
                                            <span className="text-sm text-gray-600">
                                                <span className="text-blue-500 font-bold ms-2">{general.durationYear}</span> Year(s)
                                                <span className="text-blue-500 font-bold ms-2">{general.durationMonth}</span> Month(s)
                                                <span className="text-blue-500 font-bold ms-2">{general.durationDay}</span> Day(s)
                                            </span>
                                        ) : <span className="text-blue-500 font-bold ms-2">-</span>}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 xl:grid-cols-12 items-center gap-2">
                            <div className="col-span-2 xl:col-span-2 text-left xl:text-right">
                                <label className="text-title">Category</label>
                            </div>

                            <div className="col-span-2 xl:col-span-3 2xl:col-span-2">
                                <select className="input-formcontrol"
                                    value={general.category}
                                    onChange={(e) => setGeneral(prev => ({ ...prev, category: e.target.value }))}
                                    required
                                >
                                    <option value="" >
                                        - Select -
                                    </option>
                                    {general_Category_Masters?.map((item) => (
                                        <option key={item.id} value={item.description}>
                                            {item.description}
                                        </option>
                                    ))}
                                </select>
                            </div>


                        </div>

                        <div className="grid grid-cols-2 xl:grid-cols-12 items-center gap-2">
                            <div className="col-span-2 xl:col-span-2 text-left xl:text-right">
                                <label className="text-title">Detail</label>
                            </div>
                            <div className="col-span-2 xl:col-span-10">
                                <input
                                    type="text"
                                    className="input-formcontrol"
                                    value={general.detail}
                                    onChange={(e) => setGeneral(prev => ({ ...prev, detail: e.target.value }))}
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 xl:grid-cols-12 items-center gap-2">
                            <div className="col-span-2 xl:col-span-2 text-left xl:text-right">
                                <label className="text-title">Price</label>
                            </div>
                            <div className="col-span-2 xl:col-span-10">
                                <input
                                    type="text"
                                    className="input-formcontrol"
                                    value={general.price}
                                    onChange={(e) => setGeneral(prev => ({ ...prev, price: e.target.value }))}
                                    required
                                />
                            </div>
                        </div>








                        <div className="grid grid-cols-2 xl:grid-cols-12 items-center gap-2">
                            <div className="col-span-2 xl:col-span-2 text-left xl:text-right">
                                <label className="text-title">Notice</label>
                            </div>
                            <div className="col-span-2 xl:col-span-10">
                                <div className="flex items-center gap-x-4">
                                    <span className="text-sm text-gray-600 text-nowrap min-w-32">Contract Renewal</span>
                                    <div className="w-full xl:w-5/12 2xl:w-4/12">
                                        <select className="input-formcontrol"
                                            value={general.renewal}
                                            onChange={(e) => setGeneral(prev => ({ ...prev, renewal: e.target.value }))}
                                            required
                                        >
                                            <option value="" >
                                                - Select -
                                            </option>
                                            {core_Renewal_Masters?.map((item) => (
                                                <option key={item.id} value={item.description}>
                                                    {item.description}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 xl:grid-cols-12 items-center gap-2">
                            <div className="col-span-2 xl:col-span-10 col-start-1 xl:col-start-3">
                                <div className="flex items-center gap-x-4">
                                    <span className="text-sm text-gray-600 text-nowrap mt-1.5 min-w-32">Notify Before Expire</span>
                                    <div className="w-full xl:w-5/12 2xl:w-4/12">
                                        <select className="input-formcontrol"
                                            value={general.notify}
                                            onChange={(e) => setGeneral(prev => ({ ...prev, notify: e.target.value }))}
                                            required
                                        >
                                            <option value="" >
                                                - Select -
                                            </option>
                                            {core_Notify_Masters?.map((item) => (
                                                <option key={item.id} value={item.description}>
                                                    {item.description}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
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
                                    value={general.note}
                                    onChange={(e) => setGeneral(prev => ({ ...prev, note: e.target.value }))}
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
                                <div className="flex flex-col xl:flex-row justify-start items-start xl:items-center gap-2">
                                    <select className="input-formcontrol"
                                        value={general.pic_ID1}
                                        onChange={(e) => {
                                            const selectedPic = core_PIC_Masters.find(item => item.userID === e.target.value);
                                            setGeneral(prev => ({
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
                                        value={general.pic_ID2}
                                        onChange={(e) => {
                                            const selectedPic = core_PIC_Masters.find(item => item.userID === e.target.value);
                                            setGeneral(prev => ({
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
                            <div className="col-span-2 xl:col-span-2 text-[13px]">
                                <div className="space-x-1">
                                    <Mail className="text-blue-500 inline-flex" size={15} />
                                    <label className="text-gray-700 text-left">Notify to</label>
                                    <span className="text-gray-500">ASM - DMG</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-start xl:justify-end">
                            {type === 'edit' &&
                                <div className="text-[13px]">
                                    <div className="flex items-center gap-2">
                                        <label className="text-gray-700 w-20 font-bold text-left">Created By </label>
                                        <span className="text-gray-500">{general.createdBy}</span>
                                        <span className="text-gray-500 ms-1 text-[11px]">{general.createdAt ?
                                            formatDate(general.createdAt, true)
                                            : ''}</span>
                                    </div>


                                    <div className="flex items-center gap-2 mt-2 xl:mt-1">
                                        <label className="text-gray-700 w-20 font-bold text-left">Updated By </label>
                                        {general.updatedBy && <>
                                            <span className="text-gray-500">{general.updatedBy}</span>
                                            <span className="text-gray-500 ms-1 text-[11px]"> {general.updatedAt ?
                                                formatDate(general.updatedAt, true)
                                                : ''}</span>
                                        </> || '-'
                                        }
                                    </div>
                                </div>
                            }
                        </div>
                        {general.uploadedBy == '' &&

                            <div className="grid grid-cols-2 xl:grid-cols-12 items-center gap-2">
                                <div className="col-span-2 xl:col-span-2 text-left xl:text-right">
                                    <label className="text-title">Attach File</label>
                                </div>
                                <div className="col-span-2 xl:col-span-5">
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

                        {type == 'edit' && general.uploadedBy != '' &&
                            <>
                                <div className="flex items-center gap-2 mb-2 mt-10">
                                    <Paperclip className="text-biscuit-500 w-5 h-5" />
                                    <span className="text-xl text-gray-700 font-montserrat font-bold">Attachment</span>
                                </div>
                                <table className="table-striped w-full">
                                    <thead>
                                        <tr>
                                            <th className="bg-biscuit-100 w-8/12 xl:w-7/12 2xl:w-8/12 text-left">File</th>
                                            <th className="bg-biscuit-100 text-left">Uploaded by</th>
                                            <th className="bg-biscuit-100 text-left">Last Updated</th>
                                            <th className="bg-biscuit-100 w-10"></th>
                                            <th className="bg-biscuit-100 w-10"></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td>{general.fileName}</td>
                                            <td>{general.uploadedBy}</td>
                                            <td>{formatDate(general.uploadedAt, true)}</td>
                                            <td className="h-12">
                                                <div className="flex items-center justify-center">
                                                    <FileDown
                                                        className="text-biscuit-500 hover:text-biscuit-600 cursor-pointer"
                                                        onClick={() => handleDownloadFile('General Contract', general.id, general.fileName)}
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

export default General_Contract_Create_Page;