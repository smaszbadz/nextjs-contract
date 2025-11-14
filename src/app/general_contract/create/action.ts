"use server"

import { getServerSession } from "next-auth";
import { authOptions } from '@/app/authOptions';
import { General } from "@/types/general";
import { Result } from "@/types/result";
import { renewGenerateContractNo, updateIsRenewed, uploadFiles } from "@/lib/api";


export const General_Create_Action = async (general: General, type: string | null, currentId: string | null | undefined): Promise<Result> => {
    const session = await getServerSession(authOptions);

    try {
        if (session) {
            general.createdID = session.user.userID;
            general.createdBy = session.user.name;
            general.createdEmail = session.user.email;


            if (general.pic_ID1 != '') {
                const response = await fetch(`${process.env.LOGIN_API_URL}/api/user?userID=${general.pic_ID1}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${session?.accessToken}`,
                    }
                });
                const data = await response.json();
                general.pic_Email1 = data.email
            }

            if (general.pic_ID2 != '') {
                const response = await fetch(`${process.env.LOGIN_API_URL}/api/user?userID=${general.pic_ID2}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${session?.accessToken}`,
                    }
                });
                const data = await response.json();
                general.pic_Email2 = data.email
            }



            if (general.file) {
                general.uploadedID = session.user.userID;
                general.uploadedBy = session.user.username;
                general.uploadedEmail = session.user.email;
                general.uploadedAt = new Date()
            }
        } else {
            throw new Error("User session not found");
        }

        if (general.baseNo == null) {
            general.baseNo = general.contractNo
        }


        if (type != null && currentId != null && currentId != undefined && type == 'renew') {
            const renewData = await renewGenerateContractNo('General Contract', currentId);

            general.contractNo = renewData.newContractNo;
            general.id = undefined;
        }

        const response_save = await fetch(`${process.env.CONTRACT_API_URL}/generals`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session?.accessToken}`,
            },
            body: JSON.stringify(general)
        });

        if (!response_save.ok) {
            const errorData = await response_save.json();
            console.error('Error response from server:', errorData);
            throw new Error(errorData.error || 'An error occurred while processing the request.');
        }

        // อ่านข้อมูลจาก response เพื่อดึง id ที่ได้จาก API
        const responseData = await response_save.json();

        const generalContractNo = responseData.contractNo;

        // 🔁 PATCH isRenewed ถ้าเป็นการ renew
        if (type === 'renew' && currentId) {
            await updateIsRenewed('General Contract', currentId);
        }

        if (general.file) {
            await uploadFiles('General Contract', general.file, generalContractNo);
        }

        // revalidatePath("/");

        // Return success message และ id ที่ได้จาก API
        return {
            success: responseData.success,
            message: responseData.message,
            id: responseData.id // เพิ่ม id ที่ได้จาก response
        };

    } catch (err) {
        console.error('Error during Create_Action:', err);
        // Return error message
        return { success: false, message: err instanceof Error ? err.message : 'An unexpected error occurred.' };
    }
};

export const General_Update_Action = async (general: General, checkNewFile: boolean): Promise<Result> => {
    const session = await getServerSession(authOptions);
    if (session) {
        general.updatedBy = session.user.name;
        general.updatedID = session.user.userID;
        general.updatedEmail = session.user.email;

        if (general.pic_ID1 != '') {
            const response = await fetch(`${process.env.LOGIN_API_URL}/api/user?userID=${general.pic_ID1}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session?.accessToken}`,
                }
            });
            const data = await response.json();
            general.pic_Email1 = data.email
        } else {
            general.pic_Email1 = ""
        }

        if (general.pic_ID2 != '') {
            const response = await fetch(`${process.env.LOGIN_API_URL}/api/user?userID=${general.pic_ID2}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session?.accessToken}`,
                }
            });
            const data = await response.json();
            general.pic_Email2 = data.email
        } else {
            general.pic_Email2 = ""
        }

        if (checkNewFile) {
            if (general.file) {
                general.uploadedID = session.user.userID;
                general.uploadedBy = session.user.username;
                general.uploadedEmail = session.user.email;
                general.uploadedAt = new Date()
            }
        }


    } else {
        throw new Error("User session not found");
    }
    // ตรวจสอบว่ามี id หรือไม่
    if (!general.id) {
        return {
            success: false,
            message: 'General ID is required for update operation.'
        };
    }

    try {
        // เรียก API สำหรับ update โดยระบุ ID ในส่วนของ URL
        const response_update = await fetch(`${process.env.CONTRACT_API_URL}/generals/${general.id}`, {
            method: 'PUT', // หรือใช้ 'PATCH' ตามการออกแบบ API ของคุณ
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session?.accessToken}`,
            },
            body: JSON.stringify(general)
        });

        if (!response_update.ok) {
            const errorData = await response_update.json();
            console.error('Error response from server:', errorData);
            throw new Error(errorData.error || 'An error occurred while updating the General.');
        }

        // อ่านข้อมูลจาก response
        const responseData = await response_update.json();

        if (checkNewFile) {
            const generalContractNo = responseData.contractNo;

            // Upload files if exist

            if (general.file) {
                await uploadFiles('General Contract', general.file, generalContractNo);
            }
        }

        return {
            success: responseData.success,
            message: responseData.message || 'General updated successfully',
            id: general.id // ส่งคืน id ที่ใช้ในการ update
        };

    } catch (err) {
        console.error('Error during Update_Action:', err);
        // Return error message
        return {
            success: false,
            message: err instanceof Error ? err.message : 'An unexpected error occurred during update.'
        };
    }
};

export const General_Delete_Action = async (id: string): Promise<Result> => {
    const session = await getServerSession(authOptions);

    try {
        if (!id) {
            return { success: false, message: "General ID is required." };
        }

        const response = await fetch(`${process.env.CONTRACT_API_URL}/generals/${id}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${session?.accessToken}`,
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("Error response from server:", errorData);
            throw new Error(errorData.error || "An error occurred while deleting the General.");
        }

        // อ่านข้อมูลจาก response
        const responseData = await response.json();

        // รีเฟรชข้อมูลหลังจากลบ
        // revalidatePath("/");

        return {
            success: responseData.success,
            message: responseData.message || "General deleted successfully",
        };

    } catch (err) {
        console.error("Error during Delete_Action:", err);
        return {
            success: false,
            message: err instanceof Error ? err.message : "An unexpected error occurred during delete.",
        };
    }
};
