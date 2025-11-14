'use client'

import '@ant-design/v5-patch-for-react-19';
import { Lease } from "@/types/lease";
import { formatDate } from "@/utils/date";
import { handleDownloadFile } from "@/utils/downloadHelper";
import { ArrowLeft, FileDown, Paperclip, Save, CheckCircle } from 'lucide-react';
import { useRouter } from "next/navigation";
import { useState } from "react";
import 'antd/dist/reset.css';
import type { UploadProps, UploadFile } from 'antd';
import { Button, Upload, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { Amendment_Create_Action } from '@/lib/api';
import { Amendment } from '@/types/amendment';



type Props = {
    lease: Lease
};

function Lease_Contract_Amendment_Page({ lease }: Props) {

    const router = useRouter();

    const [fileItem, setFileItem] = useState<UploadFile | null>(null);

    const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);

    const [amendment, setAmendment] = useState<Amendment>({
        id: '',
        amendmentNo: '',
        content: '',
        uploadedID: '',
        uploadedBy: '',
        uploadedEmail: '',
        uploadedAt: null,
        fileName: ''
    });


    // Handle file selection
    const handleFileChange: UploadProps['onChange'] = (info) => {
        // ถ้ามีการเลือกไฟล์ล่าสุด
        if (info.fileList.length > 0) {
            // ตรวจสอบขนาดไฟล์
            const file = info.fileList[info.fileList.length - 1];
            const fileSize = file.size || 0;
            const isLt10M = fileSize / 1024 / 1024 < 10;

            if (!isLt10M) {
                message.error(`${file.name} file exceeds 10MB limit`);
                setFileItem(null);
                setAmendment(prev => ({ ...prev, file: undefined, fileName: '', uploadedBy: '', uploadedAt: null }));
                return;
            }

            // แปลงเป็น File object สำหรับเก็บใน lease state
            const fileObj: File | undefined = file.originFileObj
                ? new File([file.originFileObj as Blob], file.name)
                : undefined;

            // เก็บเฉพาะไฟล์เดียวล่าสุด
            setFileItem(file);
            setAmendment(prev => ({
                ...prev,
                file: fileObj,
                fileName: file.name,
                uploadedBy: '',
                uploadedAt: null
            }));
        } else {
            // กรณีไม่มีไฟล์ (อาจจะลบออกไป)
            setFileItem(null);
            setAmendment(prev => ({ ...prev, file: undefined, fileName: '', uploadedBy: '', uploadedAt: null }));
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {



            // Check if files are too large
            if (amendment.file) {
                const maxFileSize = 50 * 1024 * 1024; // 50MB

                if (amendment.file.size > maxFileSize) {
                    // setError("File size exceeds 50MB");
                    return;
                }
            }

            const result = await Amendment_Create_Action('Lease Contract', 'leases', lease.id, lease.contractNo, amendment);

            if (result.success) {

                setShowSuccessModal(true);
                // resetForm();

                setTimeout(() => {
                    // บันทึก URL ของหน้าที่ต้องการกลับไปเมื่อกด back
                    const targetUrl = `/lease_contract/view/${result.id}`;
                    const fallbackUrl = '/lease_contract/';

                    // ลบประวัติหน้า edit
                    history.replaceState(null, '', fallbackUrl);

                    // นำทางไปยังหน้า view
                    window.location.href = targetUrl;
                }, 1000);

            } else {
                // setError(result.message);
            }
        } catch (error) {
            console.error('Error during save:', error);
        }
    };


    // Success Modal Component
    const SuccessModal = () => {
        if (!showSuccessModal) return null;

        return (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 shadow-lg max-w-md w-full">
                    <div className="flex flex-col items-center justify-center my-4">
                        <CheckCircle size={100} className="text-mint-500" />

                        <span className="text-4xl font-bold font-montserrat text-center my-4 text-gray-600">Amendment Added!</span>
                        <p className="text-center text-gray-600">The contract amendment has been added successfully.</p>
                    </div>
                </div>
            </div>
        );
    };


    return (
        <main>
            <div className="mx-auto px-5 pb-5">
                <div className="flex items-center gap-2">
                    <button onClick={() => router.replace("/lease_contract")} className="flex items-center text-biscuit-500 cursor-pointer">
                        <ArrowLeft className="inline-flex me-2" />
                    </button>
                    <span className="text-3xl text-mint-500 font-montserrat font-bold">Add Amendment  - {lease.contractNo}</span>

                </div>
                <table className="table-striped w-full my-8">
                    <tbody>
                        <tr>
                            <td className="text-right"><label className="text-title">Contract Name</label></td>
                            <td >{lease.contractName}</td>
                            <td className="text-right"><label className="text-title">Status</label></td>
                            <td colSpan={3}>{lease.status}</td>

                        </tr>
                        <tr>
                            <td className="text-right"><label className="text-title">Lessor (ENG)</label></td>
                            <td >{lease.lessorEN}</td>
                            <td className="text-right w-1/12"><label className="text-title">Usage</label></td>
                            <td className="w-2/12">{lease.usage}</td>
                            <td className="text-right w-1/12"><label className="text-title">Branch</label></td>
                            <td className="w-2/12">{lease.branch}</td>
                        </tr>
                        <tr>
                            <td className="text-right"><label className="text-title">Lessor (TH)</label></td>
                            <td className="w-3/12">{lease.lessorTH}</td>
                            <td className="text-right w-1/12"><label className="text-title">Attachment</label></td>
                            <td colSpan={3}>{lease.attachmentType}</td>
                        </tr>

                        <tr>
                            <td className="text-right w-2/12"><label className="text-title">Contract Reference Number</label></td>
                            <td colSpan={5}>{lease.refNo}</td>
                        </tr>

                        <tr>
                            <td className="text-right w-2/12"><label className="text-title">Start Date</label></td>
                            <td colSpan={5} >{lease.startDate ?
                                formatDate(lease.startDate)
                                : ''}
                            </td>
                        </tr>
                        <tr>
                            <td className="text-right w-2/12"><label className="text-title">End Date</label></td>
                            <td colSpan={5}>{lease.endDate ?
                                formatDate(lease.endDate)
                                : ''}
                            </td>
                        </tr>
                        <tr>
                            <td className="text-right w-2/12"><label className="text-title">Duration</label></td>
                            <td colSpan={5} >
                                <span >{lease.durationYear}</span> Year(s)
                                <span className="ms-2">{lease.durationMonth}</span> Month(s)
                                <span className="ms-2">{lease.durationDay}</span> Day(s)
                            </td>
                        </tr>
                        <tr>
                            <td className="text-right w-2/12"><label className="text-title">Category of Leased Asset</label></td>
                            <td colSpan={5} >{lease.category}</td>
                        </tr>

                        {
                            (lease.formulaType == 'QUANTITY') ? (
                                <>
                                    <tr>
                                        <td className="text-right w-2/12"><label className="text-title">Quantity</label></td>
                                        <td colSpan={5}>{lease.quantity}</td>
                                    </tr>
                                    <tr>
                                        <td className="text-right w-2/12 self-start"><label className="text-title">Item Details</label></td>
                                        <td colSpan={5}>
                                            <div>
                                                <table className="w-max border-2 border-pinky-100">
                                                    <thead>
                                                        <tr>
                                                            <th className="w-16 text-center font-bold bg-pinky-100">No.</th>
                                                            <th className="text-left font-bold bg-pinky-100 min-w-28">Serial No.</th>
                                                            <th className="text-left font-bold bg-pinky-100 min-w-28">Description</th>
                                                            <th className="text-center font-bold bg-pinky-100 min-w-20">Price</th>
                                                            <th className="text-center font-bold bg-pinky-100 min-w-24">Branch</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {lease.details?.map((detail, index) => (
                                                            <tr key={index}>
                                                                <td className="text-center">{index + 1}</td>
                                                                <td>{detail.serialNo}</td>
                                                                <td>{detail.description}</td>
                                                                <td className="text-right">{detail.price}</td>
                                                                <td className="text-center">{detail.branch}</td>
                                                            </tr>
                                                        ))}


                                                    </tbody>
                                                </table>
                                            </div>
                                        </td>
                                    </tr>
                                </>
                            ) : (lease.formulaType == 'AREA') ? (
                                <>
                                    <tr>
                                        <td className="text-right w-2/12"><label className="text-title">Area Size</label></td>
                                        <td colSpan={5}>{lease.area_Size}  {lease.area_Unit}</td>
                                    </tr>
                                    <tr>
                                        <td className="text-right w-2/12"><label className="text-title">{lease.priceType}</label></td>
                                        <td colSpan={5}>{lease.price}</td>
                                    </tr>
                                </>
                            ) : (<></>)
                        }



                        <tr>
                            <td className="text-right 1-2/12"><label className="text-title"> Pricing Period</label></td>
                            <td colSpan={5}>{lease.pricingPeriod}</td>
                        </tr>
                        <tr>
                            <td className="text-right w-2/12"><label className="text-title">Rental Fee</label></td>
                            <td colSpan={5} >{lease.rentalFee}</td>
                        </tr>

                        <tr>
                            <td className="text-right w-2/12"><label className="text-title">Address</label></td>
                            <td colSpan={5} >{lease.address}</td>
                        </tr>

                        <tr>
                            <td className="text-right w-2/12" rowSpan={2}><label className="text-title">Notice</label></td>
                            <td colSpan={5} ><span className="text-title">Contract Renewal : </span>{lease.renewal}</td>
                        </tr>
                        <tr>
                            <td colSpan={5} ><span className="text-title">Notify Before Expire : </span>{lease.notify}</td>
                        </tr>

                        <tr>
                            <td className="text-right w-2/12"><label className="text-title">Note</label></td>
                            <td colSpan={5} >{lease.note}</td>
                        </tr>
                        <tr>
                            <td className="text-right w-2/12"><label className="text-title">Person In Charge</label></td>
                            <td colSpan={5} >{lease.pic_Name1}{lease.pic_Name2 && `, ${lease.pic_Name2}`}</td>
                        </tr>
                        <tr>
                            <td className="text-right w-2/12"><label className="text-title">Created By</label></td>
                            <td colSpan={5}>{lease.createdBy}
                                <span className="text-gray-500 mx-4">
                                    {lease.createdAt ?
                                        formatDate(lease.createdAt, true)
                                        : ''}
                                </span>
                            </td>
                        </tr>
                        <tr>
                            <td className="text-right w-2/12"><label className="text-title">Updated By</label></td>
                            <td colSpan={5}>{lease.updatedBy}
                                <span className="text-gray-500 mx-4">
                                    {lease.updatedAt ?
                                        formatDate(lease.updatedAt, true)
                                        : ''}
                                </span>
                            </td>
                        </tr>
                    </tbody>
                </table>

                <div className="grid grid-cols-2 xl:grid-cols-12 items-center gap-2">
                    <div className="col-span-2 xl:col-span-2 text-left xl:text-right">
                        <label className="text-title">Attach File
                        </label>
                    </div>
                    <div className="col-span-2 xl:col-span-5">
                        <div className="flex items-center gap-2">
                            <Upload
                                multiple={false}
                                maxCount={1}
                                beforeUpload={() => false} // Prevent auto upload
                                onChange={handleFileChange}
                                fileList={fileItem ? [fileItem] : []}
                            >
                                <Button icon={<UploadOutlined />}>Select a File</Button>
                            </Upload>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-2 xl:grid-cols-12 items-center gap-2 mt-2">
                        <div className="col-span-2 xl:col-span-2 text-left xl:text-right">
                            <label className="text-title">
                                Amendment No
                            </label>
                        </div>
                        <div className="col-span-10 xl:col-span-4 2xl:col-span-2">
                            <input
                                type="text"
                                className="input-formcontrol"
                                value={amendment.amendmentNo}
                                onChange={(e) => setAmendment(prev => ({ ...prev, amendmentNo: e.target.value }))}
                                required
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 xl:grid-cols-12 items-center gap-2 mt-2">
                        <div className="col-span-2 xl:col-span-2 text-left xl:text-right">
                            <label className="text-title">
                                Content
                            </label>
                        </div>
                        <div className="col-span-2 xl:col-span-5">
                            <input
                                type="text"
                                className="input-formcontrol"
                                value={amendment.content}
                                onChange={(e) => setAmendment(prev => ({ ...prev, content: e.target.value }))}
                                required
                            />
                        </div>
                    </div>
                    <div className="flex justify-center items-center mt-12">
                        <button type="submit" className="btn btn-mint flex items-center gap-2">
                            <Save className="inline-flex" size={16} /> Save
                        </button>
                    </div>
                </form>

                {lease.uploadedBy != '' && <>
                    <div className="flex items-center gap-2 mb-2">
                        <Paperclip className="text-mint-500 w-5 h-5" />
                        <span className="text-xl text-gray-700 font-montserrat font-bold">Attachment</span>
                    </div>
                    <table className="table-striped w-full">
                        <thead>
                            <tr>
                                <th className="bg-mint-100 w-9/12 text-left">File</th>
                                <th className="bg-mint-100 text-left">Uploaded by</th>
                                <th className="bg-mint-100 text-left">Last Updated</th>
                                <th className="bg-white w-10"></th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>{lease.fileName}</td>
                                <td>{lease.uploadedBy}</td>
                                <td>{formatDate(lease.uploadedAt, true)}</td>
                                <td className="text-mint-500 hover:text-mint-600 text-center ">
                                    <FileDown className="cursor-pointer" onClick={() => handleDownloadFile('Lease Contract', lease.id, lease.fileName)} />
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </>
                }



                {SuccessModal()}
            </div>
        </main >
    );
}

export default Lease_Contract_Amendment_Page;
