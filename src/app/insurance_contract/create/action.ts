"use server"

import { getServerSession } from "next-auth";
import { authOptions } from '@/app/authOptions';
import { Insurance } from "@/types/insurance";
import { Result } from "@/types/result";
import { renewGenerateContractNo, updateIsRenewed, uploadFiles, uploadOtherFiles } from "@/lib/api";


export const Insurance_Create_Action = async (insurance: Insurance, type: string | null, currentId: string | null | undefined): Promise<Result> => {
    const session = await getServerSession(authOptions);
    if (session) {
        try {
            const sessionUser = session.user;
            const now = new Date();


            insurance.createdID = sessionUser.userID;
            insurance.createdBy = sessionUser.name;
            insurance.createdEmail = sessionUser.email;


            if (insurance.pic_ID1 != '') {
                const response = await fetch(`${process.env.LOGIN_API_URL}/api/user?userID=${insurance.pic_ID1}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${session?.accessToken}`,
                    }
                });
                const data = await response.json();
                insurance.pic_Email1 = data.email
            }

            if (insurance.pic_ID2 != '') {
                const response = await fetch(`${process.env.LOGIN_API_URL}/api/user?userID=${insurance.pic_ID2}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${session?.accessToken}`,
                    }
                });
                const data = await response.json();
                insurance.pic_Email2 = data.email
            }




            if (insurance.file) {
                insurance.uploadedID = sessionUser.userID;
                insurance.uploadedBy = sessionUser.username;
                insurance.uploadedEmail = sessionUser.email;
                insurance.uploadedAt = now
            }

            if (insurance.fileDetails && insurance.fileDetails.length > 0) {
                for (const detail of insurance.fileDetails) {
                    if (detail.file) {
                        detail.uploadedID = sessionUser.userID;
                        detail.uploadedBy = sessionUser.username;
                        detail.uploadedEmail = sessionUser.email;
                        detail.uploadedAt = now;
                    }
                }
            }
            if (insurance.baseNo == null) {
                insurance.baseNo = insurance.contractNo
            }

            if (type != null && currentId != null && currentId != undefined && type == 'renew') {
                const renewData = await renewGenerateContractNo('Insurance Contract', currentId);

                insurance.contractNo = renewData.newContractNo;
                insurance.id = undefined;
            }

            const response_save = await fetch(`${process.env.CONTRACT_API_URL}/insurances`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session?.accessToken}`,
                },
                body: JSON.stringify(insurance)
            });

            if (!response_save.ok) {
                const errorData = await response_save.json();
                console.error('Error response from server:', errorData);
                throw new Error(errorData.error || 'An error occurred while processing the request.');
            }

            // อ่านข้อมูลจาก response เพื่อดึง id ที่ได้จาก API
            const responseData = await response_save.json();

            const insuranceContractNo = responseData.contractNo;

            // 🔁 PATCH isRenewed ถ้าเป็นการ renew
            if (type === 'renew' && currentId) {
                await updateIsRenewed('Insurance Contract', currentId);
            }

            // Upload files if exist

            if (insurance.file) {
                await uploadFiles('Insurance Contract', insurance.file, insuranceContractNo);
            }

            // Upload other fileDetails if any
            if (insurance.fileDetails && insurance.fileDetails.length > 0) {


                const otherFiles = insurance.fileDetails
                    .filter(detail => detail.file)
                    .map(detail => detail.file as File);

                if (otherFiles.length > 0) {
                    await uploadOtherFiles('Insurance Contract', otherFiles, insuranceContractNo);
                }
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

    } else {
        throw new Error("User session not found");
    }


};

export const Insurance_Update_Action = async (insurance: Insurance, checkNewFile: boolean): Promise<Result> => {
    const session = await getServerSession(authOptions);
    if (session) {

        const sessionUser = session.user;
        const now = new Date();

        try {
            insurance.updatedBy = sessionUser.name;
            insurance.updatedID = sessionUser.userID;
            insurance.updatedEmail = sessionUser.email;

            if (insurance.pic_ID1 != '') {
                const response = await fetch(`${process.env.LOGIN_API_URL}/api/user?userID=${insurance.pic_ID1}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${session?.accessToken}`,
                    }
                });
                const data = await response.json();
                insurance.pic_Email1 = data.email
            } else {
                insurance.pic_Email1 = ""
            }

            if (insurance.pic_ID2 != '') {
                const response = await fetch(`${process.env.LOGIN_API_URL}/api/user?userID=${insurance.pic_ID2}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${session?.accessToken}`,
                    }
                });
                const data = await response.json();
                insurance.pic_Email2 = data.email
            } else {
                insurance.pic_Email2 = ""
            }

            if (checkNewFile) {
                if (insurance.file) {
                    insurance.uploadedID = sessionUser.userID;
                    insurance.uploadedBy = sessionUser.username;
                    insurance.uploadedEmail = sessionUser.email;
                    insurance.uploadedAt = now
                }
            }


            // ตรวจสอบว่ามี id หรือไม่
            if (!insurance.id) {
                return {
                    success: false,
                    message: 'Insurance ID is required for update operation.'
                };
            }

            if (insurance.fileDetails && insurance.fileDetails.length > 0) {
                for (const detail of insurance.fileDetails) {
                    if (detail.file) {
                        detail.uploadedID = sessionUser.userID;
                        detail.uploadedBy = sessionUser.username;
                        detail.uploadedEmail = sessionUser.email;
                        detail.uploadedAt = now;
                    }
                }
            }

            // เรียก API สำหรับ update โดยระบุ ID ในส่วนของ URL
            const response_update = await fetch(`${process.env.CONTRACT_API_URL}/insurances/${insurance.id}`, {
                method: 'PUT', // หรือใช้ 'PATCH' ตามการออกแบบ API ของคุณ
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session?.accessToken}`,
                },
                body: JSON.stringify(insurance)
            });

            if (!response_update.ok) {
                const errorData = await response_update.json();
                console.error('Error response from server:', errorData);
                throw new Error(errorData.error || 'An error occurred while updating the insurance.');
            }

            // อ่านข้อมูลจาก response
            const responseData = await response_update.json();
            const insuranceContractNo = responseData.contractNo;
            if (checkNewFile) {


                // Upload files if exist

                if (insurance.file) {
                    await uploadFiles('Insurance Contract', insurance.file, insuranceContractNo);
                }
            }

            if (insurance.fileDetails && insurance.fileDetails.length > 0) {


                const otherFiles = insurance.fileDetails
                    .filter(detail => detail.file)
                    .map(detail => detail.file as File);

                if (otherFiles.length > 0) {
                    await uploadOtherFiles('Insurance Contract', otherFiles, insuranceContractNo);
                }
            }


            return {
                success: responseData.success,
                message: responseData.message || 'Insurance updated successfully',
                id: insurance.id // ส่งคืน id ที่ใช้ในการ update
            };



        } catch (err) {
            console.error('Error during Update_Action:', err);
            // Return error message
            return {
                success: false,
                message: err instanceof Error ? err.message : 'An unexpected error occurred during update.'
            };
        }
    } else {
        throw new Error("User session not found");
    }
};

export const Insurance_Delete_Action = async (id: string): Promise<Result> => {
    const session = await getServerSession(authOptions);
    if (session) {
        try {
            if (!id) {
                return { success: false, message: "Insurance ID is required." };
            }

            const response = await fetch(`${process.env.CONTRACT_API_URL}/insurances/${id}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${session?.accessToken}`,
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error("Error response from server:", errorData);
                throw new Error(errorData.error || "An error occurred while deleting the insurance.");
            }

            // อ่านข้อมูลจาก response
            const responseData = await response.json();

            // รีเฟรชข้อมูลหลังจากลบ
            // revalidatePath("/");

            return {
                success: responseData.success,
                message: responseData.message || "Insurance deleted successfully",
            };

        } catch (err) {
            console.error("Error during Delete_Action:", err);
            return {
                success: false,
                message: err instanceof Error ? err.message : "An unexpected error occurred during delete.",
            };
        }
    } else {
        throw new Error("User session not found");
    }
};
