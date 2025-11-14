"use server"

import { getServerSession } from "next-auth";
import { authOptions } from '@/app/authOptions';
import { Transportation } from "@/types/transportation";
import { Result } from "@/types/result";
import { renewGenerateContractNo, updateIsRenewed, uploadFiles } from "@/lib/api";


export const Transportation_Create_Action = async (transportation: Transportation, type: string | null, currentId: string | null | undefined): Promise<Result> => {
    const session = await getServerSession(authOptions);

    try {
        if (session) {
            transportation.createdID = session.user.userID;
            transportation.createdBy = session.user.name;
            transportation.createdEmail = session.user.email;


            if (transportation.pic_ID1 != '') {
                const response = await fetch(`${process.env.LOGIN_API_URL}/api/user?userID=${transportation.pic_ID1}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${session?.accessToken}`,
                    }
                });
                const data = await response.json();
                transportation.pic_Email1 = data.email
            }

            if (transportation.pic_ID2 != '') {
                const response = await fetch(`${process.env.LOGIN_API_URL}/api/user?userID=${transportation.pic_ID2}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${session?.accessToken}`,
                    }
                });
                const data = await response.json();
                transportation.pic_Email2 = data.email
            }



            if (transportation.file) {
                transportation.uploadedID = session.user.userID;
                transportation.uploadedBy = session.user.username;
                transportation.uploadedEmail = session.user.email;
                transportation.uploadedAt = new Date()
            }
        } else {
            throw new Error("User session not found");
        }

        if (transportation.baseNo == null) {
            transportation.baseNo = transportation.contractNo
        }

        if (type != null && currentId != null && currentId != undefined && type == 'renew') {
            const renewData = await renewGenerateContractNo('Transportation Contract', currentId);

            transportation.contractNo = renewData.newContractNo;
            transportation.id = undefined;
        }

        const response_save = await fetch(`${process.env.CONTRACT_API_URL}/transportation`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session?.accessToken}`,
            },
            body: JSON.stringify(transportation)
        });

        if (!response_save.ok) {
            const errorData = await response_save.json();
            console.error('Error response from server:', errorData);
            throw new Error(errorData.error || 'An error occurred while processing the request.');
        }

        // อ่านข้อมูลจาก response เพื่อดึง id ที่ได้จาก API
        const responseData = await response_save.json();

        const transportationContractNo = responseData.contractNo;

        // 🔁 PATCH isRenewed ถ้าเป็นการ renew
        if (type === 'renew' && currentId) {
            await updateIsRenewed('Transportation Contract', currentId);
        }

        // Upload files if exist
        if (transportation.file) {
            await uploadFiles('Transportation Contract', transportation.file, transportationContractNo);
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

export const Transportation_Update_Action = async (transportation: Transportation, checkNewFile: boolean): Promise<Result> => {
    const session = await getServerSession(authOptions);
    if (session) {
        transportation.updatedBy = session.user.name;
        transportation.updatedID = session.user.userID;
        transportation.updatedEmail = session.user.email;

        if (transportation.pic_ID1 != '') {
            const response = await fetch(`${process.env.LOGIN_API_URL}/api/user?userID=${transportation.pic_ID1}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session?.accessToken}`,
                }
            });
            const data = await response.json();
            transportation.pic_Email1 = data.email
        } else {
            transportation.pic_Email1 = ""
        }

        if (transportation.pic_ID2 != '') {
            const response = await fetch(`${process.env.LOGIN_API_URL}/api/user?userID=${transportation.pic_ID2}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session?.accessToken}`,
                }
            });
            const data = await response.json();
            transportation.pic_Email2 = data.email
        } else {
            transportation.pic_Email2 = ""
        }

        if (checkNewFile) {
            if (transportation.file) {
                transportation.uploadedID = session.user.userID;
                transportation.uploadedBy = session.user.username;
                transportation.uploadedEmail = session.user.email;
                transportation.uploadedAt = new Date()
            }
        }


    } else {
        throw new Error("User session not found");
    }
    // ตรวจสอบว่ามี id หรือไม่
    if (!transportation.id) {
        return {
            success: false,
            message: 'Transportation ID is required for update operation.'
        };
    }

    try {
        // เรียก API สำหรับ update โดยระบุ ID ในส่วนของ URL
        const response_update = await fetch(`${process.env.CONTRACT_API_URL}/transportation/${transportation.id}`, {
            method: 'PUT', // หรือใช้ 'PATCH' ตามการออกแบบ API ของคุณ
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session?.accessToken}`,
            },
            body: JSON.stringify(transportation)
        });

        if (!response_update.ok) {
            const errorData = await response_update.json();
            console.error('Error response from server:', errorData);
            throw new Error(errorData.error || 'An error occurred while updating the Transportation.');
        }

        // อ่านข้อมูลจาก response
        const responseData = await response_update.json();

        if (checkNewFile) {
            const transportationContractNo = responseData.contractNo;

            // Upload files if exist

            if (transportation.file) {
                await uploadFiles('Transportation Contract', transportation.file, transportationContractNo);
            }
        }

        return {
            success: responseData.success,
            message: responseData.message || 'Transportation updated successfully',
            id: transportation.id // ส่งคืน id ที่ใช้ในการ update
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

export const Transportation_Delete_Action = async (id: string): Promise<Result> => {
    const session = await getServerSession(authOptions);

    try {
        if (!id) {
            return { success: false, message: "Transportation ID is required." };
        }

        const response = await fetch(`${process.env.CONTRACT_API_URL}/transportation/${id}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${session?.accessToken}`,
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("Error response from server:", errorData);
            throw new Error(errorData.error || "An error occurred while deleting the Transportation.");
        }

        // อ่านข้อมูลจาก response
        const responseData = await response.json();

        // รีเฟรชข้อมูลหลังจากลบ
        // revalidatePath("/");

        return {
            success: responseData.success,
            message: responseData.message || "Transportation deleted successfully",
        };

    } catch (err) {
        console.error("Error during Delete_Action:", err);
        return {
            success: false,
            message: err instanceof Error ? err.message : "An unexpected error occurred during delete.",
        };
    }
};
