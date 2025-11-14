'use client'

import { Result } from "@/types/result";
import { Transportation } from "@/types/transportation";
import { formatDate } from "@/utils/date";
import { handleDownloadFile } from "@/utils/downloadHelper";
import { ArrowLeft, FilePenLine, Trash2, FileDown, Paperclip, Eye, History } from 'lucide-react';
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Transportation_Delete_Action } from "../../create/action";

type Props = {
    transportation: Transportation,
    relatedTransportation: Transportation[],
    userID: string | null,
    userRole: string | null
};

function Transportation_Contract_View_Page({ transportation, relatedTransportation, userID, userRole }: Props) {

    const router = useRouter();

    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const handleDelete = async () => {
        try {
            if (!transportation.id) {
                console.error("Transportation ID is undefined!");
                return; // หากไม่มี ID จะหยุดการทำงาน
            }

            const result: Result = await Transportation_Delete_Action(transportation.id);

            if (result.success) {
                // รอ 500ms ก่อนการเปลี่ยนหน้า
                setTimeout(() => {
                    // เปลี่ยนหน้าไปที่ /transportation_contract
                    window.location.replace("/transportation_contract");
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
                    <button onClick={() => router.replace("/transportation_contract")} className="flex items-center text-lightPurple-500 cursor-pointer">
                        <ArrowLeft className="inline-flex me-2" />
                    </button>
                    <span className="text-3xl text-sea-500 font-montserrat font-bold">{transportation.contractNo}</span>
                    <div className="space-x-2 ml-auto">
                        {/* <a href={`/transportation_contract/action/${transportation.id}/copy`} className="btn btn-mint inline-flex items-center font-montserrat">
                            <FilePenLine className="w-5 h-5 mr-2" />
                            Copy
                        </a> */}
                        {/* <a href={`/transportation_contract/action/${transportation.id}/renew`} className="btn btn-mint inline-flex items-center font-montserrat">
                            <FilePenLine className="w-5 h-5 mr-2" />
                            Renew
                        </a>
                        <a href={`/transportation_contract/action/${transportation.id}/amendment`} className="btn btn-mint inline-flex items-center font-montserrat">
                            <FilePenLine className="w-5 h-5 mr-2" />
                            Amendment
                        </a> */}
                        {
                            (userRole == 'ADMIN' || userID == transportation.createdID)
                            &&
                            <>
                                <a href={`/transportation_contract/edit/${transportation.id}`} className="btn btn-sea inline-flex items-center font-montserrat">
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
                            <td className="w-5/12">{transportation.contractName}</td>
                            <td className="text-right"><label className="text-title">Status</label></td>
                            <td>{transportation.status}</td>

                        </tr>
                        <tr>
                            <td className="text-right"><label className="text-title">Logistics Provider (ENG)</label></td>
                            <td className="w-5/12">{transportation.logisticsEN}</td>
                            <td className="text-right w-max"><label className="text-title">Attachment</label></td>
                            <td>{transportation.attachmentType}</td>
                        </tr>
                        <tr>
                            <td className="text-right"><label className="text-title">Logistics Provider (TH)</label></td>
                            <td colSpan={3}>{transportation.logisticsTH}</td>
                        </tr>
                        <tr>
                            <td className="text-right w-2/12"><label className="text-title">Start Date</label></td>
                            <td colSpan={3}>{transportation.startDate ?
                                formatDate(transportation.startDate)
                                : ''}
                            </td>
                        </tr>
                        <tr>
                            <td className="text-right w-2/12"><label className="text-title">End Date</label></td>
                            <td colSpan={3}>{transportation.endDate ?
                                formatDate(transportation.endDate)
                                : ''}
                            </td>
                        </tr>
                        <tr>
                            <td className="text-right"><label className="text-title">Duration</label></td>
                            <td colSpan={3}>
                                <span >{transportation.durationYear}</span> Year(s)
                                <span className="ms-2">{transportation.durationMonth}</span> Month(s)
                                <span className="ms-2">{transportation.durationDay}</span> Day(s)
                            </td>
                        </tr>
                        <tr>
                            <td className="text-right"><label className="text-title">Enclosure</label></td>
                            <td colSpan={5}>
                                {
                                    [
                                        transportation.hasOHSAS && "OHSAS",
                                        transportation.hasTrademark && "Trademark",
                                        transportation.hasNonDisclose && "Non-Disclosure"
                                    ]
                                        .filter(Boolean) // เอาเฉพาะค่าที่ไม่ใช่ false/null/undefined
                                        .join(", ")
                                }
                            </td>
                        </tr>

                        <tr>
                            <td className="text-right w-2/12" rowSpan={2}><label className="text-title">Notice</label></td>
                            <td colSpan={5} ><span className="text-title">Contract Renewal : </span>{transportation.renewal}</td>
                        </tr>
                        <tr>
                            <td colSpan={5} ><span className="text-title">Notify Before Expire : </span>{transportation.notify}</td>
                        </tr>

                        <tr>
                            <td className="text-right w-2/12"><label className="text-title">Note</label></td>
                            <td colSpan={5} >{transportation.note}</td>
                        </tr>
                        <tr>
                            <td className="text-right w-2/12"><label className="text-title">Person In Charge</label></td>
                            <td colSpan={5} >{transportation.pic_Name1}{transportation.pic_Name2 && `, ${transportation.pic_Name2}`}</td>
                        </tr>
                        <tr>
                            <td className="text-right w-2/12"><label className="text-title">Created By</label></td>
                            <td colSpan={5}>{transportation.createdBy}
                                <span className="text-gray-500 mx-4">
                                    {transportation.createdAt ?
                                        formatDate(transportation.createdAt, true)
                                        : ''}
                                </span>
                            </td>
                        </tr>
                        <tr>
                            <td className="text-right w-2/12"><label className="text-title">Updated By</label></td>
                            <td colSpan={5}>{transportation.updatedBy}
                                <span className="text-gray-500 mx-4">
                                    {transportation.updatedAt ?
                                        formatDate(transportation.updatedAt, true)
                                        : ''}
                                </span>
                            </td>
                        </tr>
                    </tbody>
                </table>
                {transportation.uploadedBy != '' && <>
                    <div className="flex items-center gap-2 mb-2">
                        <Paperclip className="text-sea-500 w-5 h-5" />
                        <span className="text-xl text-gray-700 font-montserrat font-bold">Attachment</span>
                    </div>
                    <table className="table-striped w-full mb-8">
                        <thead>
                            <tr>
                                <th className="bg-sea-50 text-left">File</th>
                                <th className="bg-sea-50 w-48 text-left">Uploaded by</th>
                                <th className="bg-sea-50 w-36 text-left">Last Updated</th>
                                <th className="bg-sea-50 w-10"></th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>{transportation.fileName}</td>
                                <td>{transportation.uploadedBy}</td>
                                <td>{formatDate(transportation.uploadedAt, true)}</td>
                                <td className="h-12">
                                    <div className="flex items-center justify-center">
                                        <FileDown
                                            className="text-sea-500 hover:text-sea-600 cursor-pointer"
                                            onClick={() => handleDownloadFile('Transportation Contract', transportation.id, transportation.fileName)}
                                        />
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </>
                }

                {Array.isArray(relatedTransportation) && relatedTransportation.length > 1 && (
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
                                {relatedTransportation?.map((item) => (
                                    <tr key={item.id} className={transportation.contractNo === item.contractNo ? "bg-zinc-200 font-bold" : ""}>
                                        <td className="text-center">{item.contractNo}</td>
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
                                            {transportation.contractNo != item.contractNo &&
                                                < div className="flex items-center justify-center">
                                                    <a onClick={(e) => {
                                                        e.preventDefault();
                                                        window.open(
                                                            `/transportation_contract/view/${item.id}`,
                                                            '_blank',
                                                            'width=1400,height=900,noopener,noreferrer'
                                                        );
                                                    }}
                                                        href="#"
                                                        className="text-mint-500 hover:text-mint-600"
                                                        title="View">
                                                        <Eye size={18} className="text-sea-500 hover:text-lightPurple-600 cursor-pointer" />
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
                                        <span className="block font-semibold my-2">{transportation.contractNo}? <span className="font-normal">This action cannot be undone.</span></span>

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

export default Transportation_Contract_View_Page;
