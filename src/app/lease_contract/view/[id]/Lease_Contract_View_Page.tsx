'use client'

import { Result } from "@/types/result";
import { Lease } from "@/types/lease";
import { formatDate } from "@/utils/date";
import { handleDownloadFile, handleDownloadFile_Amendment, handleDownloadFile_Related } from "@/utils/downloadHelper";
import { ArrowLeft, FilePenLine, Trash2, FileDown, Paperclip, Eye, History } from 'lucide-react';
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Lease_Delete_Action } from "../../create/action";

type Props = {
    lease: Lease,
    relatedLeases: Lease[],
    userID: string | null,
    userRole: string | null
};

function Lease_Contract_View_Page({ lease, relatedLeases, userID, userRole }: Props) {

    const router = useRouter();

    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const handleDelete = async () => {
        try {
            if (!lease.id) {
                console.error("Lease ID is undefined!");
                return; // หากไม่มี ID จะหยุดการทำงาน
            }

            const result: Result = await Lease_Delete_Action(lease.id);

            if (result.success) {
                // รอ 500ms ก่อนการเปลี่ยนหน้า
                setTimeout(() => {
                    // เปลี่ยนหน้าไปที่ /lease_contract
                    window.location.replace("/lease_contract");
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
                    <button onClick={() => router.replace("/lease_contract")} className="flex items-center text-sea-500 cursor-pointer">
                        <ArrowLeft className="inline-flex me-2" />
                    </button>
                    <span className="text-3xl text-pinky-500 font-montserrat font-bold">{lease.contractNo}</span>
                    <div className="space-x-2 ml-auto">
                        {/* <a href={`/lease_contract/action/${lease.id}/copy`} className="btn btn-mint inline-flex items-center font-montserrat">
                            <FilePenLine className="w-5 h-5 mr-2" />
                            Copy
                        </a> */}
                        {/* <a href={`/lease_contract/action/${lease.id}/renew`} className="btn btn-mint inline-flex items-center font-montserrat">
                            <FilePenLine className="w-5 h-5 mr-2" />
                            Renew
                        </a>
                        <a href={`/lease_contract/action/${lease.id}/amendment`} className="btn btn-mint inline-flex items-center font-montserrat">
                            <FilePenLine className="w-5 h-5 mr-2" />
                            Amendment
                        </a> */}
                        {
                            (userRole == 'ADMIN' || userID == lease.createdID)
                            &&
                            <>
                                <a href={`/lease_contract/edit/${lease.id}`} className="btn btn-pinky inline-flex items-center font-montserrat">
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
                                        <td colSpan={5}>
                                            {Number(lease.price).toLocaleString('en-US', {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2
                                            })}
                                        </td>
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
                            <td colSpan={5} >
                                {Number(lease.rentalFee).toLocaleString('en-US', {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2
                                })}
                            </td>
                        </tr>

                        {lease.formulaType == 'AREA' &&
                            <tr>
                                <td className="text-right w-2/12"><label className="text-title">Address</label></td>
                                <td colSpan={5} >{lease.address}</td>
                            </tr>
                        }
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
                {lease.uploadedBy != '' && <>
                    <div className="flex items-center gap-2 mb-2">
                        <Paperclip className="text-pinky-500 w-5 h-5" />
                        <span className="text-xl text-gray-700 font-montserrat font-bold">Attachment</span>
                    </div>
                    <table className="table-striped w-full mb-8">
                        <thead>
                            <tr>
                                <th className="bg-pinky-50 text-left">File</th>
                                <th className="bg-pinky-50 w-48 text-left">Uploaded by</th>
                                <th className="bg-pinky-50 w-36 text-left">Last Updated</th>
                                <th className="bg-pinky-50 w-10"></th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>{lease.fileName}</td>
                                <td>{lease.uploadedBy}</td>
                                <td>{formatDate(lease.uploadedAt, true)}</td>
                                <td className="h-12">
                                    <div className="flex items-center justify-center">
                                        <FileDown
                                            className="text-pinky-500 hover:text-pinky-600 cursor-pointer"
                                            onClick={() => handleDownloadFile('Lease Contract', lease.id, lease.fileName)}
                                        />
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </>
                }


                {lease?.amendments && lease.amendments.length > 0 && (
                    <>
                        <div className="flex items-center gap-2 mb-2">
                            <Paperclip className="text-pinky-500 w-5 h-5" />
                            <span className="text-xl text-gray-700 font-montserrat font-bold">Amendments</span>
                        </div>
                        <table className="table-striped w-full mb-8">
                            <thead>
                                <tr>
                                    <th className="bg-pinky-50 w-10">No</th>
                                    <th className="bg-pinky-50 text-left">File</th>
                                    <th className="bg-pinky-50 w-68 text-left">Amendment No</th>
                                    <th className="bg-pinky-50 text-left">Content</th>
                                    <th className="bg-pinky-50 w-48 text-left">Uploaded By</th>
                                    <th className="bg-pinky-50 w-36 text-left">Uploaded Date</th>
                                    <th className="bg-pinky-50 w-10"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {lease?.amendments?.map((item, index) => (
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
                                                    className="text-pinky-500 hover:text-pinky-600 cursor-pointer"
                                                    onClick={() => handleDownloadFile_Amendment('Lease Contract', lease.contractNo, item.id, item.fileName)}
                                                />
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </>
                )}


                {lease?.related_Contracts && lease.related_Contracts.length > 0 && (
                    <>
                        <div className="flex items-center gap-2 mb-2">
                            <Paperclip className="text-pinky-500 w-5 h-5" />
                            <span className="text-xl text-gray-700 font-montserrat font-bold">Related Contracts</span>
                        </div>
                        <table className="table-striped w-full mb-8">
                            <thead>
                                <tr>
                                    <th className="bg-pinky-50 w-10">No</th>
                                    <th className="bg-pinky-50 text-left">File</th>
                                    <th className="bg-pinky-50 w-68 text-left">Amendment No</th>
                                    <th className="bg-pinky-50 text-left">Content</th>
                                    <th className="bg-pinky-50 w-48 text-left">Uploaded By</th>
                                    <th className="bg-pinky-50 w-36 text-left">Uploaded Date</th>
                                    <th className="bg-pinky-50 w-10"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {lease?.related_Contracts?.map((item, index) => (
                                    <tr key={item.id}>
                                        <td className="text-center">{index + 1}</td>
                                        <td>{item.fileName}</td>
                                        <td>{item.relatedNo}</td>
                                        <td>{item.content}</td>
                                        <td>{item.uploadedBy}</td>
                                        <td>{formatDate(item.uploadedAt, true)}</td>
                                        <td className="h-12">
                                            <div className="flex items-center justify-center">
                                                <FileDown
                                                    className="text-pinky-500 hover:text-pinky-600 cursor-pointer"
                                                    onClick={() => handleDownloadFile_Related('Lease Contract', lease.contractNo, item.id, item.fileName)}
                                                />
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </>
                )}

                {Array.isArray(relatedLeases) && relatedLeases.length > 1 && (
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
                                {relatedLeases?.map((item) => (
                                    <tr key={item.id} className={lease.contractNo === item.contractNo ? "bg-zinc-200 font-bold" : ""}>
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
                                            {lease.contractNo != item.contractNo &&
                                                < div className="flex items-center justify-center">
                                                    <a onClick={(e) => {
                                                        e.preventDefault();
                                                        window.open(
                                                            `/lease_contract/view/${item.id}`,
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
                                        <span className="block font-semibold my-2">{lease.contractNo}? <span className="font-normal">This action cannot be undone.</span></span>

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

export default Lease_Contract_View_Page;
