'use client'

import { Result } from "@/types/result";
import { Insurance } from "@/types/insurance";
import { formatDate } from "@/utils/date";
import { handleDownloadFile, handleDownloadFile_Amendment, handleDownloadFile_Detail } from "@/utils/downloadHelper";
import { ArrowLeft, FilePenLine, Trash2, FileDown, Paperclip, Eye, History } from 'lucide-react';
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Insurance_Delete_Action } from "../../create/action";

type Props = {
    insurance: Insurance,
    relatedInsurances: Insurance[],
    userID: string | null,
    userRole: string | null
};

function Insurance_Contract_View_Page({ insurance, relatedInsurances, userID, userRole }: Props) {

    const router = useRouter();

    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const handleDelete = async () => {
        try {
            if (!insurance.id) {
                console.error("Insurance ID is undefined!");
                return; // หากไม่มี ID จะหยุดการทำงาน
            }

            const result: Result = await Insurance_Delete_Action(insurance.id);

            if (result.success) {
                // รอ 500ms ก่อนการเปลี่ยนหน้า
                setTimeout(() => {
                    // เปลี่ยนหน้าไปที่ /insurance_contract
                    window.location.replace("/insurance_contract");
                }, 500);
            } else {
                console.error("Delete failed");
            }
        } catch (error) {
            console.error('Error during delete:', error);
        }
    };



    return (
        <main>
            <div className="mx-auto px-5 pb-5">
                <div className="flex items-center gap-2">
                    <button onClick={() => router.replace("/insurance_contract")} className="flex items-center text-pinky-500 cursor-pointer">
                        <ArrowLeft className="inline-flex me-2" />
                    </button>
                    <span className="text-3xl text-lightPurple-500 font-montserrat font-bold">{insurance.contractNo}</span>
                    <div className="space-x-2 ml-auto">
                        {/* <a href={`/insurance_contract/action/${insurance.id}/copy`} className="btn btn-mint inline-flex items-center font-montserrat">
                            <FilePenLine className="w-5 h-5 mr-2" />
                            Copy
                        </a> */}
                        {/* <a href={`/insurance_contract/action/${insurance.id}/renew`} className="btn btn-mint inline-flex items-center font-montserrat">
                            <FilePenLine className="w-5 h-5 mr-2" />
                            Renew
                        </a>
                        <a href={`/insurance_contract/action/${insurance.id}/amendment`} className="btn btn-mint inline-flex items-center font-montserrat">
                            <FilePenLine className="w-5 h-5 mr-2" />
                            Amendment
                        </a> */}

                        {
                            (userRole == 'ADMIN' || userID == insurance.createdID)
                            &&
                            <>
                                <a href={`/insurance_contract/edit/${insurance.id}`} className="btn btn-lightPurple inline-flex items-center font-montserrat">
                                    <FilePenLine className="w-5 h-5 mr-2" />
                                    Edit
                                </a>
                                <button
                                    onClick={() => setShowDeleteModal(true)}
                                    className="btn btn-outlineRed inline-flex items-center font-montserrat"
                                >
                                    <Trash2 className="w-5 h-5 mr-2" />
                                    Delete
                                </button>
                            </>
                        }
                    </div>
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
                            <td colSpan={5}>
                                {Number(insurance.amount).toLocaleString('en-US', {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2
                                })}
                            </td>
                        </tr>
                        <tr>
                            <td className="text-right w-2/12"><label className="text-title">Premium Rate (%)</label></td>
                            <td colSpan={5} >
                                {Number(insurance.premiumRate).toLocaleString('en-US', {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2
                                })}
                            </td>
                        </tr>

                        <tr>
                            <td rowSpan={4} className="text-right w-2/12 align-top"><label className="text-title">Insurance Price </label></td>
                            <td colSpan={5} >
                                <div className="grid grid-cols-12 gap-2">
                                    <div className="col-span-1">
                                        <span className="text-title">Net Premium:</span>
                                    </div>
                                    <div className="col-span-1 text-right">
                                        {Number(insurance.net).toLocaleString('en-US', {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2
                                        })}
                                    </div>
                                </div>

                            </td>
                        </tr>

                        <tr>
                            <td colSpan={5} >
                                <div className="grid grid-cols-12 gap-2">
                                    <div className="col-span-1">
                                        <span className="text-title">Stamp Duty:</span>
                                    </div>
                                    <div className="col-span-1 text-right">
                                        {Number(insurance.stampDuty).toLocaleString('en-US', {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2
                                        })}
                                    </div>
                                </div>
                            </td>
                        </tr>

                        <tr>

                            <td colSpan={5} >
                                <div className="grid grid-cols-12 gap-2">
                                    <div className="col-span-1">
                                        <span className="text-title">Vat:</span>
                                    </div>
                                    <div className="col-span-1 text-right">
                                        {Number(insurance.vat).toLocaleString('en-US', {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2
                                        })}
                                    </div>
                                </div>
                            </td>
                        </tr>

                        <tr>
                            <td colSpan={5} >
                                <div className="grid grid-cols-12 gap-2">
                                    <div className="col-span-1">
                                        <span className="text-title">Total:</span>
                                    </div>
                                    <div className="col-span-1 text-right underline decoration-double underline-offset-2">
                                        {Number(insurance.total).toLocaleString('en-US', {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2
                                        })}
                                    </div>
                                </div>
                            </td>
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
                {insurance.uploadedBy != '' && <>
                    <div className="flex items-center gap-2 mb-2">
                        <Paperclip className="text-lightPurple-500 w-5 h-5" />
                        <span className="text-xl text-gray-700 font-montserrat font-bold">Attachment</span>
                    </div>
                    <table className="table-striped w-full mb-8">
                        <thead>
                            <tr>
                                <th className="bg-lightPurple-50 text-left">File</th>
                                <th className="bg-lightPurple-50 w-48 text-left">Uploaded by</th>
                                <th className="bg-lightPurple-50 w-36 text-left">Last Updated</th>
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
                            </tr>
                        </tbody>
                    </table>
                </>
                }


                {insurance.fileDetails?.length > 0 && (
                    <>
                        <div className="flex items-center gap-2 mb-2">
                            <Paperclip className="text-lightPurple-500 w-5 h-5" />
                            <span className="text-xl text-gray-700 font-montserrat font-bold">Other</span>
                        </div>
                        <table className="table-striped w-full mb-8">
                            <thead>
                                <tr>
                                    <th className="bg-lightPurple-50 w-10">No</th>
                                    <th className="bg-lightPurple-50 text-left">File</th>
                                    <th className="bg-lightPurple-50 w-48 text-left">Uploaded by</th>
                                    <th className="bg-lightPurple-50 w-36 text-left">Last Updated</th>
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


                                    </tr>
                                ))}


                            </tbody>
                        </table>
                    </>
                )}


                {insurance?.amendments && insurance.amendments.length > 0 && (
                    <>
                        <div className="flex items-center gap-2 mb-2">
                            <Paperclip className="text-lightPurple-500 w-5 h-5" />
                            <span className="text-xl text-gray-700 font-montserrat font-bold">Amendments</span>
                        </div>
                        <table className="table-striped w-full mb-8">
                            <thead>
                                <tr>
                                    <th className="bg-lightPurple-50 w-10">No</th>
                                    <th className="bg-lightPurple-50 w-42 text-left">File</th>
                                    <th className="bg-lightPurple-50 w-36 text-left">Amendment No</th>
                                    <th className="bg-lightPurple-50 text-left">Content</th>
                                    <th className="bg-lightPurple-50 w-48 text-left">Uploaded By</th>
                                    <th className="bg-lightPurple-50 w-36 text-left">Uploaded Date</th>
                                    <th className="bg-lightPurple-50 w-10"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {insurance?.amendments?.map((item, index) => (
                                    <tr key={item.id}>
                                        <td className="text-center">{index + 1}</td>
                                        <td>{item.fileName}</td>
                                        <td>{item.amendmentNo}</td>
                                        <td>{item.content}</td>
                                        <td>{item.uploadedBy}</td>
                                        <td>{formatDate(item.uploadedAt, true)}</td>

                                        <td className="h-12">
                                            <div className="flex items-center justify-center">
                                                <FileDown
                                                    className="text-lightPurple-500 hover:text-lightPurple-600 cursor-pointer"
                                                    onClick={() => handleDownloadFile_Amendment('Insurance Contract', insurance.contractNo, item.id, item.fileName)}
                                                />
                                            </div>
                                        </td>


                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </>
                )
                }


                {Array.isArray(relatedInsurances) && relatedInsurances.length > 1 && (
                    <>
                        <div className="flex items-center gap-2 mb-2">
                            <History className="text-zinc-400 w-5 h-5" />
                            <span className="text-xl text-gray-700 font-montserrat font-bold">Renewal Contracts</span>
                        </div>
                        <table className="table table-bordered w-full mb-8">
                            <thead>
                                <tr>
                                    <th className="bg-zinc-400 w-36 text-left">Contract No</th>
                                    <th className="bg-zinc-400 text-left">Contract Name</th>
                                    <th className="bg-zinc-400 text-left">Start Date</th>
                                    <th className="bg-zinc-400 text-left">End Date</th>
                                    <th className="bg-zinc-400 text-left">Duration</th>
                                    <th className="bg-zinc-400 w-52 text-left">Created By</th>
                                    <th className="bg-zinc-400 w-10"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {relatedInsurances?.map((item) => (
                                    <tr key={item.id} className={insurance.contractNo === item.contractNo ? "bg-zinc-200 font-bold" : ""}>
                                        <td>{item.contractNo}</td>
                                        <td>{item.contractName}</td>
                                        <td>
                                            {item.startDate ? formatDate(item.startDate) : ''}
                                        </td>
                                        <td>
                                            {item.endDate ? formatDate(item.endDate) : ''}
                                        </td>
                                        <td>
                                            <span >{item.durationYear}</span> Year(s)
                                            <span className="ms-2">{item.durationMonth}</span> Month(s)
                                            <span className="ms-2">{item.durationDay}</span> Day(s)
                                        </td>
                                        <td>{item.createdBy}</td>

                                        <td className="h-12">
                                            {insurance.contractNo != item.contractNo &&
                                                < div className="flex items-center justify-center">
                                                    <a onClick={(e) => {
                                                        e.preventDefault();
                                                        window.open(
                                                            `/insurance_contract/view/${item.id}`,
                                                            '_blank',
                                                            'width=1400,height=900,noopener,noreferrer'
                                                        );
                                                    }}
                                                        href="#"
                                                        className="text-mint-500 hover:text-mint-600"
                                                        title="View">
                                                        <Eye size={18} className="text-pinky-500 hover:text-pinky-600 cursor-pointer" />
                                                    </a>
                                                </div>
                                            }
                                        </td>


                                    </tr>
                                ))}

                            </tbody>
                        </table>
                    </>
                )}

                {
                    showDeleteModal && (
                        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                            <div className="bg-white rounded-lg p-6 w-2/5 max-w-full">
                                <h3 className="text-2xl font-bold text-gray-900 mb-4 font-montserrat ">Confirm Delete</h3>
                                <div className="flex text-base">
                                    <Trash2 className="text-red-500 hover:text-red-600 my-4 mr-5" size={70} />
                                    <div>
                                        <p className="text-gray-700 mt-4">Are you sure you want to delete contract{" "}</p>
                                        <span className="block font-semibold my-2">{insurance.contractNo}? <span className="font-normal">This action cannot be undone.</span></span>

                                    </div>
                                </div>

                                <div className="flex justify-end space-x-3">
                                    <button onClick={handleDelete} className="px-4 py-2 rounded btn-red transition-colors cursor-pointer" >
                                        Delete
                                    </button>
                                    <button onClick={() => setShowDeleteModal(false)} className="px-4 py-2 rounded btn-gray transition-colors cursor-pointer">
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    )
                }

            </div >
        </main >
    );
}

export default Insurance_Contract_View_Page;
