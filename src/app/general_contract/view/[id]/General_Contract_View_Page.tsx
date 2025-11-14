'use client'

import { Result } from "@/types/result";
import { General } from "@/types/general";
import { formatDate } from "@/utils/date";
import { handleDownloadFile, handleDownloadFile_Amendment } from "@/utils/downloadHelper";
import { ArrowLeft, FilePenLine, Trash2, FileDown, Paperclip, Eye, History } from 'lucide-react';
import { useRouter } from "next/navigation";
import { useState } from "react";
import { General_Delete_Action } from "../../create/action";

type Props = {
    general: General,
    relatedGenerals: General[],
    userID: string | null,
    userRole: string | null
};

function General_Contract_View_Page({ general, relatedGenerals, userID, userRole }: Props) {

    const router = useRouter();

    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const handleDelete = async () => {
        try {
            if (!general.id) {
                console.error("General ID is undefined!");
                return; // หากไม่มี ID จะหยุดการทำงาน
            }

            const result: Result = await General_Delete_Action(general.id);

            if (result.success) {
                // รอ 500ms ก่อนการเปลี่ยนหน้า
                setTimeout(() => {
                    // เปลี่ยนหน้าไปที่ /general_contract
                    window.location.replace("/general_contract");
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
                    <button onClick={() => router.replace("/general_contract")} className="flex items-center text-mint-500 cursor-pointer">
                        <ArrowLeft className="inline-flex me-2" />
                    </button>
                    <span className="text-3xl text-biscuit-500 font-montserrat font-bold">{general.contractNo}</span>
                    <div className="space-x-2 ml-auto">
                        {/* <a href={`/general_contract/action/${general.id}/copy`} className="btn btn-biscuit inline-flex items-center font-montserrat">
                            <FilePenLine className="w-5 h-5 mr-2" />
                            Copy
                        </a> */}
                        {/* <a href={`/general_contract/action/${general.id}/renew`} className="btn btn-biscuit inline-flex items-center font-montserrat">
                            <FilePenLine className="w-5 h-5 mr-2" />
                            Renew
                        </a>
                        <a href={`/general_contract/action/${general.id}/amendment`} className="btn btn-biscuit inline-flex items-center font-montserrat">
                            <FilePenLine className="w-5 h-5 mr-2" />
                            Amendment
                        </a> */}

                        {
                            (userRole == 'ADMIN' || userID == general.createdID)
                            &&
                            <>
                                <a href={`/general_contract/edit/${general.id}`} className="btn btn-biscuit inline-flex items-center font-montserrat">
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
                            <td className="w-4/12">{general.contractName}</td>
                            <td className="text-right"><label className="text-title">Status</label></td>
                            <td className="w-5/12">{general.status}</td>
                        </tr>
                        <tr>
                            <td className="text-right"><label className="text-title">Company (ENG)</label></td>
                            <td className="w-4/12">{general.companyEN}</td>
                            <td className="text-right"><label className="text-title">Usage</label></td>
                            <td className="w-5/12">{general.usage}</td>
                        </tr>
                        <tr>
                            <td className="text-right"><label className="text-title">Company (TH)</label></td>
                            <td className="w-4/12">{general.companyTH}</td>
                            <td className="text-right w-2/12"><label className="text-title">Attachment</label></td>
                            <td className="w-5/12">{general.attachmentType}</td>
                        </tr>
                        <tr>
                            <td className="text-right w-2/12"><label className="text-title">Contract Reference Number</label></td>
                            <td colSpan={3} className="w-8/12">{general.refNo}</td>
                        </tr>

                        <tr>
                            <td className="text-right w-2/12"><label className="text-title">Start Date</label></td>
                            <td colSpan={3} className="w-8/12">{general.startDate ?
                                formatDate(general.startDate)
                                : ''}
                            </td>
                        </tr>
                        <tr>
                            <td className="text-right w-2/12"><label className="text-title">End Date</label></td>
                            <td colSpan={3} className="w-8/12">{general.endDate ?
                                formatDate(general.endDate)
                                : ''}
                            </td>
                        </tr>
                        <tr>
                            <td className="text-right w-2/12"><label className="text-title">Duration</label></td>
                            <td colSpan={3} className="w-8/12">
                                <span >{general.durationYear}</span> Year(s)
                                <span className="ms-2">{general.durationMonth}</span> Month(s)
                                <span className="ms-2">{general.durationDay}</span> Day(s)
                            </td>
                        </tr>
                        <tr>
                            <td className="text-right w-2/12"><label className="text-title">Detail</label></td>
                            <td colSpan={3} className="w-8/12">{general.detail}</td>
                        </tr>
                        <tr>
                            <td className="text-right w-2/12"><label className="text-title">Price</label></td>
                            <td colSpan={3} className="w-8/12">{general.price}</td>
                        </tr>
                        <tr>
                            <td className="text-right w-2/12" rowSpan={2}><label className="text-title">Notice</label></td>
                            <td colSpan={3} className="w-8/12"><span className="font-bold">Contract Renewal : </span>{general.renewal}</td>
                        </tr>
                        <tr>
                            <td colSpan={3} className="w-8/12"><span className="font-bold">Notify Before Expire : </span>{general.notify}</td>
                        </tr>
                        <tr>
                            <td className="text-right w-2/12"><label className="text-title">Note</label></td>
                            <td colSpan={3} className="w-8/12">{general.note}</td>
                        </tr>
                        <tr>
                            <td className="text-right w-2/12"><label className="text-title">Person In Charge</label></td>
                            <td colSpan={3} className="w-8/12">{general.pic_Name1}{general.pic_Name2 && `, ${general.pic_Name2}`}</td>
                        </tr>
                        <tr>
                            <td className="text-right w-2/12"><label className="text-title">Created By</label></td>
                            <td colSpan={3} className="w-8/12">{general.createdBy}
                                <span className="text-gray-500 mx-4">
                                    {general.createdAt ?
                                        formatDate(general.createdAt, true)
                                        : ''}
                                </span>
                            </td>
                        </tr>
                        <tr>
                            <td className="text-right w-2/12"><label className="text-title">Updated By</label></td>
                            <td colSpan={3} className="w-8/12">{general.updatedBy}
                                <span className="text-gray-500 mx-4">
                                    {general.updatedAt ?
                                        formatDate(general.updatedAt, true)
                                        : ''}
                                </span>
                            </td>
                        </tr>
                    </tbody>
                </table>
                {general.uploadedBy != '' && <>
                    <div className="flex items-center gap-2 mb-2">
                        <Paperclip className="text-biscuit-500 w-5 h-5" />
                        <span className="text-xl text-gray-700 font-montserrat font-bold">Attachment</span>
                    </div>
                    <table className="table-striped w-full mb-8">
                        <thead>
                            <tr>
                                <th className="bg-biscuit-100 text-left">File</th>
                                <th className="bg-biscuit-100 w-48 text-left">Uploaded by</th>
                                <th className="bg-biscuit-100 w-36 text-left">Last Updated</th>
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

                            </tr>
                        </tbody>
                    </table>
                </>
                }


                {general?.amendments && general.amendments.length > 0 && (
                    <>
                        <div className="flex items-center gap-2 mb-2">
                            <Paperclip className="text-biscuit-500 w-5 h-5" />
                            <span className="text-xl text-gray-700 font-montserrat font-bold">Amendments</span>
                        </div>
                        <table className="table-striped w-full mb-8">
                            <thead>
                                <tr>
                                    <th className="bg-biscuit-100 w-10">No</th>
                                    <th className="bg-biscuit-100 text-left">File</th>
                                    <th className="bg-biscuit-100 w-68 text-left">Amendment No</th>
                                    <th className="bg-biscuit-100 text-left">Content</th>
                                    <th className="bg-biscuit-100 w-48 text-left">Uploaded By</th>
                                    <th className="bg-biscuit-100 w-36 text-left">Uploaded Date</th>
                                    <th className="bg-biscuit-100 w-10"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {general?.amendments?.map((item, index) => (
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
                                                    className="text-biscuit-500 hover:text-biscuit-600 cursor-pointer"
                                                    onClick={() => handleDownloadFile_Amendment('General Contract', general.contractNo, item.id, item.fileName)}
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

                {Array.isArray(relatedGenerals) && relatedGenerals.length > 1 && (
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
                                {relatedGenerals?.map((item) => (
                                    <tr key={item.id} className={general.contractNo === item.contractNo ? "bg-white-200 font-bold" : ""}>
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
                                            {general.contractNo != item.contractNo &&
                                                < div className="flex items-center justify-center">
                                                    <a onClick={(e) => {
                                                        e.preventDefault();
                                                        window.open(
                                                            `/general_contract/view/${item.id}`,
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
                                        <span className="block font-semibold my-2">{general.contractNo}? <span className="font-normal">This action cannot be undone.</span></span>

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

export default General_Contract_View_Page;
