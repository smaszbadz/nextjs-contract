"use server"

import { getServerSession } from "next-auth";
import { authOptions } from '@/app/authOptions';
import { Lease } from "@/types/lease";
import { Result } from "@/types/result";
import { renewGenerateContractNo, updateIsRenewed, uploadFiles } from "@/lib/api";


export const Lease_Create_Action = async (lease: Lease, type: string | null, currentId: string | null | undefined): Promise<Result> => {
    const session = await getServerSession(authOptions);

    try {
        if (session) {
            lease.createdID = session.user.userID;
            lease.createdBy = session.user.name;
            lease.createdEmail = session.user.email;


            if (lease.pic_ID1 != '') {
                const response = await fetch(`${process.env.LOGIN_API_URL}/api/user?userID=${lease.pic_ID1}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${session?.accessToken}`,
                    }
                });
                const data = await response.json();
                lease.pic_Email1 = data.email
            }

            if (lease.pic_ID2 != '') {
                const response = await fetch(`${process.env.LOGIN_API_URL}/api/user?userID=${lease.pic_ID2}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${session?.accessToken}`,
                    }
                });
                const data = await response.json();
                lease.pic_Email2 = data.email
            }



            if (lease.file) {
                lease.uploadedID = session.user.userID;
                lease.uploadedBy = session.user.username;
                lease.uploadedEmail = session.user.email;
                lease.uploadedAt = new Date()
            }
        } else {
            throw new Error("User session not found");
        }

        if (lease.baseNo == null) {
            lease.baseNo = lease.contractNo
        }

        if (type != null && currentId != null && currentId != undefined && type == 'renew') {
            const renewData = await renewGenerateContractNo('Lease Contract', currentId);

            lease.contractNo = renewData.newContractNo;
            lease.id = undefined;
        }

        const response_save = await fetch(`${process.env.CONTRACT_API_URL}/leases`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session?.accessToken}`,
            },
            body: JSON.stringify(lease)
        });

        if (!response_save.ok) {
            const errorData = await response_save.json();
            console.error('Error response from server:', errorData);
            throw new Error(errorData.error || 'An error occurred while processing the request.');
        }

        // อ่านข้อมูลจาก response เพื่อดึง id ที่ได้จาก API
        const responseData = await response_save.json();

        const leaseContractNo = responseData.contractNo;

        // 🔁 PATCH isRenewed ถ้าเป็นการ renew
        if (type === 'renew' && currentId) {
            await updateIsRenewed('Lease Contract', currentId);
        }

        if (lease.file) {
            await uploadFiles('Lease Contract', lease.file, leaseContractNo);
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

export const Lease_Update_Action = async (lease: Lease, checkNewFile: boolean): Promise<Result> => {
    const session = await getServerSession(authOptions);
    if (session) {
        lease.updatedBy = session.user.name;
        lease.updatedID = session.user.userID;
        lease.updatedEmail = session.user.email;

        if (lease.pic_ID1 != '') {
            const response = await fetch(`${process.env.LOGIN_API_URL}/api/user?userID=${lease.pic_ID1}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session?.accessToken}`,
                }
            });
            const data = await response.json();
            lease.pic_Email1 = data.email
        } else {
            lease.pic_Email1 = ""
        }

        if (lease.pic_ID2 != '') {
            const response = await fetch(`${process.env.LOGIN_API_URL}/api/user?userID=${lease.pic_ID2}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session?.accessToken}`,
                }
            });
            const data = await response.json();
            lease.pic_Email2 = data.email
        } else {
            lease.pic_Email2 = ""
        }


        if (checkNewFile) {
            if (lease.file) {
                lease.uploadedID = session.user.userID;
                lease.uploadedBy = session.user.username;
                lease.uploadedEmail = session.user.email;
                lease.uploadedAt = new Date()
            }
        }


    } else {
        throw new Error("User session not found");
    }
    // ตรวจสอบว่ามี id หรือไม่
    if (!lease.id) {
        return {
            success: false,
            message: 'Lease ID is required for update operation.'
        };
    }

    try {
        // เรียก API สำหรับ update โดยระบุ ID ในส่วนของ URL
        const response_update = await fetch(`${process.env.CONTRACT_API_URL}/leases/${lease.id}`, {
            method: 'PUT', // หรือใช้ 'PATCH' ตามการออกแบบ API ของคุณ
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session?.accessToken}`,
            },
            body: JSON.stringify(lease)
        });

        if (!response_update.ok) {
            const errorData = await response_update.json();
            console.error('Error response from server:', errorData);
            throw new Error(errorData.error || 'An error occurred while updating the Lease.');
        }

        // อ่านข้อมูลจาก response
        const responseData = await response_update.json();

        if (checkNewFile) {
            const leaseContractNo = responseData.contractNo;

            // Upload files if exist

            if (lease.file) {
                await uploadFiles('Lease Contract', lease.file, leaseContractNo);
            }
        }

        return {
            success: responseData.success,
            message: responseData.message || 'Lease updated successfully',
            id: lease.id // ส่งคืน id ที่ใช้ในการ update
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

export const Lease_Delete_Action = async (id: string): Promise<Result> => {
    const session = await getServerSession(authOptions);

    try {
        if (!id) {
            return { success: false, message: "Lease ID is required." };
        }

        const response = await fetch(`${process.env.CONTRACT_API_URL}/leases/${id}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${session?.accessToken}`,
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("Error response from server:", errorData);
            throw new Error(errorData.error || "An error occurred while deleting the Lease.");
        }

        // อ่านข้อมูลจาก response
        const responseData = await response.json();

        // รีเฟรชข้อมูลหลังจากลบ
        // revalidatePath("/");

        return {
            success: responseData.success,
            message: responseData.message || "Lease deleted successfully",
        };

    } catch (err) {
        console.error("Error during Delete_Action:", err);
        return {
            success: false,
            message: err instanceof Error ? err.message : "An unexpected error occurred during delete.",
        };
    }
};
