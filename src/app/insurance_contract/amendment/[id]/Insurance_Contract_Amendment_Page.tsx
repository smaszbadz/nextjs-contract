'use client'

import '@ant-design/v5-patch-for-react-19';
import { Insurance } from "@/types/insurance";
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
    insurance: Insurance
};

function Insurance_Contract_Amendment_Page({ insurance }: Props) {

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

            // แปลงเป็น File object สำหรับเก็บใน insurance state
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

            const result = await Amendment_Create_Action('Insurance Contract', 'insurances', insurance.id, insurance.contractNo, amendment);

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
                    <button onClick={() => router.replace("/insurance_contract")} className="flex items-center text-biscuit-500 cursor-pointer">
                        <ArrowLeft className="inline-flex me-2" />
                    </button>
                    <span className="text-3xl text-mint-500 font-montserrat font-bold">Add Amendment  - {insurance.contractNo}</span>

                </div>
                <table className="table-striped w-full my-8">
                    <tbody>
                        <tr>
                            <td className="text-right"><label className="text-title">Contract Name</label></td>
                            <td >{insurance.contractName}</td>
                            <td className="text-right"><label className="text-title">Status</label></td>
                            <td colSpan={3}>{insurance.status}</td>

                        </tr>
                        <tr>
                            <td className="text-right"><label className="text-title">Company (ENG)</label></td>
                            <td >{insurance.companyEN}</td>
                            <td className="text-right w-1/12"><label className="text-title">Code</label></td>
                            <td className="w-2/12">{insurance.code}</td>
                            <td className="text-right w-1/12"><label className="text-title">Branch</label></td>
                            <td className="w-2/12">{insurance.branch}</td>
                        </tr>
                        <tr>
                            <td className="text-right"><label className="text-title">Company (TH)</label></td>
                            <td className="w-3/12">{insurance.companyTH}</td>
                            <td className="text-right w-1/12"><label className="text-title">Attachment</label></td>
                            <td colSpan={3}>{insurance.attachmentType}</td>
                        </tr>

                        <tr>
                            <td className="text-right w-2/12"><label className="text-title">Contract Reference Number</label></td>
                            <td colSpan={5}>{insurance.refNo}</td>
                        </tr>

                        <tr>
                            <td className="text-right w-2/12"><label className="text-title">Start Date</label></td>
                            <td colSpan={5} >{insurance.startDate ?
                                formatDate(insurance.startDate)
                                : ''}
                            </td>
                        </tr>
                        <tr>
                            <td className="text-right w-2/12"><label className="text-title">End Date</label></td>
                            <td colSpan={5}>{insurance.endDate ?
                                formatDate(insurance.endDate)
                                : ''}
                            </td>
                        </tr>
                        <tr>
                            <td className="text-right w-2/12"><label className="text-title">Duration</label></td>
                            <td colSpan={5} >
                                <span >{insurance.durationYear}</span> Year(s)
                                <span className="ms-2">{insurance.durationMonth}</span> Month(s)
                                <span className="ms-2">{insurance.durationDay}</span> Day(s)
                            </td>
                        </tr>
                        <tr>
                            <td className="text-right w-2/12"><label className="text-title">Insured Premise</label></td>
                            <td colSpan={5} >{insurance.premise}</td>
                        </tr>
                        <tr>
                            <td className="text-right 1-2/12"><label className="text-title"> Amount Insured</label></td>
                            <td colSpan={5}>{insurance.amount}</td>
                        </tr>
                        <tr>
                            <td className="text-right w-2/12"><label className="text-title">Premium Rate (%)</label></td>
                            <td colSpan={5} >{insurance.premiumRate}</td>
                        </tr>

                        <tr>
                            <td className="text-right w-2/12"><label className="text-title">Insurance Price   Net Premium</label></td>
                            <td colSpan={5} >{insurance.net}</td>
                        </tr>

                        <tr>
                            <td className="text-right w-2/12"><label className="text-title">Stamp Duty</label></td>
                            <td colSpan={5} >{insurance.stampDuty}</td>
                        </tr>

                        <tr>
                            <td className="text-right w-2/12"><label className="text-title">Vat</label></td>
                            <td colSpan={5} >{insurance.vat}</td>
                        </tr>

                        <tr>
                            <td className="text-right w-2/12"><label className="text-title">Total</label></td>
                            <td colSpan={5} >{insurance.total}</td>
                        </tr>


                        <tr>
                            <td className="text-right w-2/12"><label className="text-title">Note</label></td>
                            <td colSpan={5} >{insurance.note}</td>
                        </tr>
                        <tr>
                            <td className="text-right w-2/12"><label className="text-title">Person In Charge</label></td>
                            <td colSpan={5} >{insurance.pic_Name1}{insurance.pic_Name2 && `, ${insurance.pic_Name2}`}</td>
                        </tr>
                        <tr>
                            <td className="text-right w-2/12"><label className="text-title">Created By</label></td>
                            <td colSpan={5}>{insurance.createdBy}
                                <span className="text-gray-500 mx-4">
                                    {insurance.createdAt ?
                                        formatDate(insurance.createdAt, true)
                                        : ''}
                                </span>
                            </td>
                        </tr>
                        <tr>
                            <td className="text-right w-2/12"><label className="text-title">Updated By</label></td>
                            <td colSpan={5}>{insurance.updatedBy}
                                <span className="text-gray-500 mx-4">
                                    {insurance.updatedAt ?
                                        formatDate(insurance.updatedAt, true)
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

                {insurance.uploadedBy != '' && <>
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
                                <td>{insurance.fileName}</td>
                                <td>{insurance.uploadedBy}</td>
                                <td>{formatDate(insurance.uploadedAt, true)}</td>
                                <td className="text-mint-500 hover:text-mint-600 text-center ">
                                    <FileDown className="cursor-pointer" onClick={() => handleDownloadFile('Insurance Contract', insurance.id, insurance.fileName)} />
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

export default Insurance_Contract_Amendment_Page;
