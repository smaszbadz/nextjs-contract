'use server'

import { authOptions } from "@/app/authOptions";
import { Amendment } from "@/types/amendment";
import { PIC } from "@/types/pic";
import { Related } from "@/types/related";
import { Result } from "@/types/result";
import { getServerSession } from "next-auth";

export async function Amendment_Create_Action(contractType: string, prefix: string, id?: string, contractNo?: string, amendment?: Amendment): Promise<Result> {
    const session = await getServerSession(authOptions);

    try {
        if (session) {
            if (!id || !amendment || !contractNo || !contractType) {
                throw new Error("Fields not found");
            }
            amendment.uploadedID = session.user.userID;
            amendment.uploadedBy = session.user.name;

            const response = await fetch(`${process.env.LOGIN_API_URL}/api/user?userID=${session.user.userID}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session?.accessToken}`,
                }
            });
            const data = await response.json();
            amendment.uploadedEmail = data.email

        } else {
            throw new Error("User session not found");
        }

        const response_save = await fetch(`${process.env.CONTRACT_API_URL}/${prefix}/${id}/amendments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.accessToken}`,
            },
            body: JSON.stringify(amendment) // ส่ง amendmentData แทน amendment โดยตรง
        });

        if (!response_save.ok) {
            const errorData = await response_save.json();
            console.error('Error response from server:', errorData);
            throw new Error(errorData.error || 'An error occurred while processing the request.');
        }

        // อ่านข้อมูลจาก response เพื่อดึง id ที่ได้จาก API
        const responseData = await response_save.json();

        const detailId = responseData.id;

        if (amendment.file) {
            await uploadFiles_Amendment(contractType, amendment.file, contractNo, detailId);
        }

        return {
            success: responseData.success,
            message: responseData.message,
            id: id
        };

    } catch (err) {
        console.error('Error during Create_Amendment:', err);
        return { success: false, message: err instanceof Error ? err.message : 'An unexpected error occurred.' };
    }
};

export async function Related_Create_Action(contractType: string, prefix: string, id?: string, contractNo?: string, related?: Related): Promise<Result> {
    const session = await getServerSession(authOptions);

    try {
        if (session) {
            if (!id || !related || !contractNo || !contractType) {
                throw new Error("Fields not found");
            }
            related.uploadedID = session.user.userID;
            related.uploadedBy = session.user.name;

            const response = await fetch(`${process.env.LOGIN_API_URL}/api/user?userID=${session.user.userID}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session?.accessToken}`,
                }
            });
            const data = await response.json();
            related.uploadedEmail = data.email

        } else {
            throw new Error("User session not found");
        }

        const response_save = await fetch(`${process.env.CONTRACT_API_URL}/${prefix}/${id}/related_contracts`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.accessToken}`,
            },
            body: JSON.stringify(related) // ส่ง amendmentData แทน amendment โดยตรง
        });

        if (!response_save.ok) {
            const errorData = await response_save.json();
            console.error('Error response from server:', errorData);
            throw new Error(errorData.error || 'An error occurred while processing the request.');
        }

        // อ่านข้อมูลจาก response เพื่อดึง id ที่ได้จาก API
        const responseData = await response_save.json();

        const detailId = responseData.id;

        if (related.file) {
            await uploadFiles_Related(contractType, related.file, contractNo, detailId);
        }

        return {
            success: responseData.success,
            message: responseData.message,
            id: id
        };

    } catch (err) {
        console.error('Error during Create_Related:', err);
        return { success: false, message: err instanceof Error ? err.message : 'An unexpected error occurred.' };
    }
};

export async function getPICByUserID(
    userID: string
): Promise<PIC | null> {
    const session = await getServerSession(authOptions);
    if (!session) {
        return null;
    }
    const response = await fetch(`${process.env.CONTRACT_API_URL}/core_pic_masters/user/${userID}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${session.accessToken}`,
        },
    });

    if (!response.ok) {
        // const errorData = await response.json();
        // throw new Error(errorData.error || 'Fetch PIC failed');
        return null
    }

    const data: PIC = await response.json();
    return data;

};

export async function uploadFiles(
    contractType: string,
    file: File,
    contractNo: string
) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return null;
    }
    if (!file) return [];

    const formData = new FormData();
    formData.append('contractType', contractType);
    formData.append('file', file);
    formData.append('contractNo', contractNo);

    console.log(`${process.env.CONTRACT_API_URL}/file/upload`)
    console.log(file);
    const response = await fetch(`${process.env.CONTRACT_API_URL}/file/upload`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${session.accessToken}`,
        },
        body: formData
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'File upload failed');
    }

    await response.json();

};


export async function Delete_File_Action(
    prefix?: string,
    id?: string,
    contractType?: string,
    contractNo?: string,
    fileName?: string
) {
    const session = await getServerSession(authOptions);

    try {
        // ตรวจสอบค่าที่จำเป็น
        if (!session || !prefix || !id || !contractType || !contractNo || !fileName) {
            return { success: false, message: "All required fields must be provided." };
        }

        // ขั้นตอนที่ 1: ลบ fields ใน service
        const unsetResponse = await fetch(`${process.env.CONTRACT_API_URL}/${prefix}/unset/${id}`, {
            method: "PATCH",
            headers: {
                "Authorization": `Bearer ${session.accessToken}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                fields: ["fileName", "uploadedAt", "uploadedBy", "uploadedEmail", "uploadedID"],
            }),
        });

        if (!unsetResponse.ok) {
            const errorData = await unsetResponse.json();
            console.error("Unset error:", errorData);
            throw new Error(errorData.error || "Failed to unset service fields.");
        }

        await unsetResponse.json();

        // ขั้นตอนที่ 2: ลบไฟล์จริง
        const deleteFileResponse = await fetch(`${process.env.CONTRACT_API_URL}/file/delete`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${session.accessToken}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                id: id,
                contractType: contractType,
                contractNo: contractNo,
                filename: fileName,
            }),
        });

        if (!deleteFileResponse.ok) {
            const errorData = await deleteFileResponse.json();
            console.error("File delete error:", errorData);
            throw new Error(errorData.error || "Failed to delete file.");
        }

        const deleteFileData = await deleteFileResponse.json();

        return {
            success: deleteFileData.success,
            message: deleteFileData.message || "File and fields deleted successfully.",
        };

    } catch (err) {
        console.error("Error during Delete_File_Action:", err);
        return {
            success: false,
            message: err instanceof Error ? err.message : "Unexpected error occurred.",
        };
    }
};


export async function Delete_File_Detail_Action(
    prefix?: string,
    id?: string,
    detailId?: string,
    contractType?: string,
    contractNo?: string,
    fileName?: string
) {
    const session = await getServerSession(authOptions);

    try {
        // ตรวจสอบค่าที่จำเป็น
        if (!session || !prefix || !id || !contractType || !contractNo || !fileName) {
            return { success: false, message: "All required fields must be provided." };
        }

        // ขั้นตอนที่ 1: ลบ fields ใน service
        const deleteResponse = await fetch(`${process.env.CONTRACT_API_URL}/${prefix}/${id}/fileDetails/${detailId}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${session.accessToken}`,
                "Content-Type": "application/json",
            },
        });

        if (!deleteResponse.ok) {
            const errorData = await deleteResponse.json();
            throw new Error(errorData.error || "Failed to delete a detail.");
        }

        await deleteResponse.json();

        // ขั้นตอนที่ 2: ลบไฟล์จริง
        const deleteFileResponse = await fetch(`${process.env.CONTRACT_API_URL}/file/delete_detail`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${session.accessToken}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                contractType: contractType,
                contractNo: contractNo,
                filename: fileName,
            }),
        });

        if (!deleteFileResponse.ok) {
            const errorData = await deleteFileResponse.json();
            console.error("File delete error:", errorData);
            throw new Error(errorData.error || "Failed to delete file.");
        }

        const deleteFileData = await deleteFileResponse.json();

        return {
            success: deleteFileData.success,
            message: deleteFileData.message || "File and fields deleted successfully.",
        };

    } catch (err) {
        console.error("Error during Delete_File_Action:", err);
        return {
            success: false,
            message: err instanceof Error ? err.message : "Unexpected error occurred.",
        };
    }
};



export async function uploadFiles_Amendment(
    contractType: string,
    file: File,
    contractNo: string,
    detailId: string
) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return null;
    }
    if (!file) return [];

    const formData = new FormData();
    formData.append('contractType', contractType);
    formData.append('contractNo', contractNo);
    formData.append('detailId', detailId);
    formData.append('file', file);

    const response = await fetch(`${process.env.CONTRACT_API_URL}/file/amendments/upload`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${session.accessToken}`,
        },
        body: formData
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'File upload failed');
    }

    await response.json();

};

export async function uploadFiles_Related(
    contractType: string,
    file: File,
    contractNo: string,
    detailId: string
) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return null;
    }
    if (!file) return [];

    const formData = new FormData();
    formData.append('contractType', contractType);
    formData.append('contractNo', contractNo);
    formData.append('detailId', detailId);
    formData.append('file', file);

    const response = await fetch(`${process.env.CONTRACT_API_URL}/file/related_contracts/upload`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${session.accessToken}`,
        },
        body: formData
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'File upload failed');
    }

    await response.json();

};

export async function fetchProfileImage() {
    const session = await getServerSession(authOptions);

    if (!session) {
        return null;
    }
    try {
        const response = await fetch(`${process.env.LOGIN_API_URL}/api/user/photo/${session.user.userID}`, {
            headers: {
                'Authorization': `Bearer ${session.accessToken}`
            },
            cache: 'no-store'
        });

        if (!response.ok) {
            return null;
        }

        // สำหรับ server-side
        if (typeof window === 'undefined') {
            const buffer = await response.arrayBuffer();
            return `data:${response.headers.get('content-type')};base64,${Buffer.from(buffer).toString('base64')}`;
        }

        // สำหรับ client-side
        const imageBlob = await response.blob();
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                resolve(reader.result as string);
            };
            reader.onerror = reject;
            reader.readAsDataURL(imageBlob);
        });
    } catch (error) {
        console.error('Error fetching profile image:', error);
        return null;
    }
}

export async function downloadFile(contractType: string, id?: string, filename?: string) {
    const session = await getServerSession(authOptions);

    if (!contractType || !id || !filename || !session) {
        throw new Error('Contract number, filename, and access token are required');
    }

    try {
        const response = await fetch(`${process.env.CONTRACT_API_URL}/file/download?id=${id}&contractType=${contractType}`, {
            headers: {
                'Authorization': `Bearer ${session.accessToken}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to download file');
        }

        // ส่งเป็น base64 แทน
        const arrayBuffer = await response.arrayBuffer();
        const base64 = Buffer.from(arrayBuffer).toString('base64');

        return {
            base64,
            contentType: response.headers.get('content-type') || 'application/octet-stream',
            filename: filename
        };
    } catch (error) {
        console.error('Download error:', error);
        throw error;
    }
}

export async function downloadFile_Amendment(contractType: string, contractNo?: string, detailId?: string, filename?: string) {
    const session = await getServerSession(authOptions);

    if (!contractType || !contractNo || !filename || !session) {
        throw new Error('Contract number, filename, and access token are required');
    }

    try {
        const response = await fetch(`${process.env.CONTRACT_API_URL}/file/amendments/download?contractNo=${contractNo}&contractType=${contractType}&detailId=${detailId}`, {
            headers: {
                'Authorization': `Bearer ${session.accessToken}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to download file');
        }

        // ส่งเป็น base64 แทน
        const arrayBuffer = await response.arrayBuffer();
        const base64 = Buffer.from(arrayBuffer).toString('base64');

        return {
            base64,
            contentType: response.headers.get('content-type') || 'application/octet-stream',
            filename: filename
        };
    } catch (error) {
        console.error('Download error:', error);
        throw error;
    }
}


export async function downloadFile_Related(contractType: string, contractNo?: string, detailId?: string, filename?: string) {
    const session = await getServerSession(authOptions);

    if (!contractType || !contractNo || !filename || !session) {
        throw new Error('Contract number, filename, and access token are required');
    }

    try {
        const response = await fetch(`${process.env.CONTRACT_API_URL}/file/related_contracts/download?contractNo=${contractNo}&contractType=${contractType}&detailId=${detailId}`, {
            headers: {
                'Authorization': `Bearer ${session.accessToken}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to download file');
        }

        // ส่งเป็น base64 แทน
        const arrayBuffer = await response.arrayBuffer();
        const base64 = Buffer.from(arrayBuffer).toString('base64');

        return {
            base64,
            contentType: response.headers.get('content-type') || 'application/octet-stream',
            filename: filename
        };
    } catch (error) {
        console.error('Download error:', error);
        throw error;
    }
}

export async function downloadFile_Detail(contractNo?: string, fileName?: string) {
    const session = await getServerSession(authOptions);

    if (!contractNo || !fileName || !session) {
        throw new Error('Contract number, filename, and access token are required');
    }

    try {
        const response = await fetch(`${process.env.CONTRACT_API_URL}/file/download_detail?contractNo=${contractNo}&fileName=${fileName}`, {
            headers: {
                'Authorization': `Bearer ${session.accessToken}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to download file');
        }

        // ส่งเป็น base64 แทน
        const arrayBuffer = await response.arrayBuffer();
        const base64 = Buffer.from(arrayBuffer).toString('base64');

        return {
            base64,
            contentType: response.headers.get('content-type') || 'application/octet-stream',
            filename: fileName
        };
    } catch (error) {
        console.error('Download error:', error);
        throw error;
    }
}



export async function uploadOtherFiles(
    contractType: string,
    files: File[],
    contractNo: string,
) {
    const session = await getServerSession(authOptions);
    if (!session) return null;
    if (!files || files.length === 0) return [];

    const formData = new FormData();
    formData.append('contractType', contractType);
    formData.append('contractNo', contractNo);

    for (const file of files) {
        formData.append('files', file); // multiple files under the same key
    }

    const response = await fetch(`${process.env.CONTRACT_API_URL}/file/upload_multiple`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${session.accessToken}`,
        },
        body: formData
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Other File upload failed');
    }

    return await response.json(); // optional: return filenames or response
}


export async function renewGenerateContractNo(
    contractType: string,
    currentId: string,
) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return null;
    }


    const response = await fetch(`${process.env.CONTRACT_API_URL}/renew/${currentId}?contractType=${contractType}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.accessToken}`,
        }
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to renew contract');
    }


    return await response.json();

};


export async function updateIsRenewed(
    contractType: string,
    currentId: string,
) {

    const session = await getServerSession(authOptions);
    if (!session) {
        return null;
    }

    console.log('###############################: ', `${process.env.CONTRACT_API_URL}/renew/${currentId}?contractType=${contractType}`)

    await fetch(`${process.env.CONTRACT_API_URL}/renew/${currentId}?contractType=${contractType}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.accessToken}`,
        },
    });

}