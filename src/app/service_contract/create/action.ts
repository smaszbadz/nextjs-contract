"use server"

import { getServerSession } from "next-auth";
import { authOptions } from '@/app/authOptions';
import { Service } from "@/types/service";
import { Result } from "@/types/result";
import { renewGenerateContractNo, updateIsRenewed, uploadFiles } from "@/lib/api";


export const Service_Create_Action = async (service: Service, type: string | null, currentId: string | null | undefined): Promise<Result> => {
    const session = await getServerSession(authOptions);

    try {
        if (session) {
            service.createdID = session.user.userID;
            service.createdBy = session.user.name;
            service.createdEmail = session.user.email;


            if (service.pic_ID1 != '') {
                const response = await fetch(`${process.env.LOGIN_API_URL}/api/user?userID=${service.pic_ID1}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${session?.accessToken}`,
                    }
                });
                const data = await response.json();
                service.pic_Email1 = data.email
            }

            if (service.pic_ID2 != '') {
                const response = await fetch(`${process.env.LOGIN_API_URL}/api/user?userID=${service.pic_ID2}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${session?.accessToken}`,
                    }
                });
                const data = await response.json();
                service.pic_Email2 = data.email
            }



            if (service.file) {
                service.uploadedID = session.user.userID;
                service.uploadedBy = session.user.username;
                service.uploadedEmail = session.user.email;
                service.uploadedAt = new Date()
            }
        } else {
            throw new Error("User session not found");
        }

        if (service.baseNo == null) {
            service.baseNo = service.contractNo
        }


        if (type != null && currentId != null && currentId != undefined && type == 'renew') {
            const renewData = await renewGenerateContractNo('Service Contract', currentId);

            service.contractNo = renewData.newContractNo;


            console.log(renewData.newContractNo)

            service.id = undefined;
        }

        const response_save = await fetch(`${process.env.CONTRACT_API_URL}/services`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session?.accessToken}`,
            },
            body: JSON.stringify(service)
        });

        if (!response_save.ok) {
            const errorData = await response_save.json();
            console.error('Error response from server:', errorData);
            throw new Error(errorData.error || 'An error occurred while processing the request.');
        }

        // อ่านข้อมูลจาก response เพื่อดึง id ที่ได้จาก API
        const responseData = await response_save.json();

        const serviceContractNo = responseData.contractNo;

        // 🔁 PATCH isRenewed ถ้าเป็นการ renew
        if (type === 'renew' && currentId) {
            await updateIsRenewed('Service Contract', currentId);
        }

        if (service.file) {
            await uploadFiles('Service Contract', service.file, serviceContractNo);
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

export const Service_Update_Action = async (service: Service, checkNewFile: boolean): Promise<Result> => {
    const session = await getServerSession(authOptions);
    if (session) {
        service.updatedBy = session.user.name;
        service.updatedID = session.user.userID;
        service.updatedEmail = session.user.email;

        if (service.pic_ID1 != '') {
            const response = await fetch(`${process.env.LOGIN_API_URL}/api/user?userID=${service.pic_ID1}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session?.accessToken}`,
                }
            });
            const data = await response.json();
            service.pic_Email1 = data.email
        } else {
            service.pic_Email1 = ""
        }

        if (service.pic_ID2 != '') {
            const response = await fetch(`${process.env.LOGIN_API_URL}/api/user?userID=${service.pic_ID2}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session?.accessToken}`,
                }
            });
            const data = await response.json();
            service.pic_Email2 = data.email
        } else {
            service.pic_Email2 = ""
        }

        if (checkNewFile) {
            if (service.file) {
                service.uploadedID = session.user.userID;
                service.uploadedBy = session.user.username;
                service.uploadedEmail = session.user.email;
                service.uploadedAt = new Date()
            }
        }


    } else {
        throw new Error("User session not found");
    }
    // ตรวจสอบว่ามี id หรือไม่
    if (!service.id) {
        return {
            success: false,
            message: 'Service ID is required for update operation.'
        };
    }

    try {
        // เรียก API สำหรับ update โดยระบุ ID ในส่วนของ URL
        const response_update = await fetch(`${process.env.CONTRACT_API_URL}/services/${service.id}`, {
            method: 'PUT', // หรือใช้ 'PATCH' ตามการออกแบบ API ของคุณ
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session?.accessToken}`,
            },
            body: JSON.stringify(service)
        });

        if (!response_update.ok) {
            const errorData = await response_update.json();
            console.error('Error response from server:', errorData);
            throw new Error(errorData.error || 'An error occurred while updating the service.');
        }

        // อ่านข้อมูลจาก response
        const responseData = await response_update.json();

        if (checkNewFile) {
            const serviceContractNo = responseData.contractNo;

            // Upload files if exist

            if (service.file) {
                await uploadFiles('Service Contract', service.file, serviceContractNo);
            }
        }

        return {
            success: responseData.success,
            message: responseData.message || 'Service updated successfully',
            id: service.id // ส่งคืน id ที่ใช้ในการ update
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

export const Service_Delete_Action = async (id: string): Promise<Result> => {
    const session = await getServerSession(authOptions);

    try {
        if (!id) {
            return { success: false, message: "Service ID is required." };
        }

        const response = await fetch(`${process.env.CONTRACT_API_URL}/services/${id}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${session?.accessToken}`,
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("Error response from server:", errorData);
            throw new Error(errorData.error || "An error occurred while deleting the service.");
        }

        // อ่านข้อมูลจาก response
        const responseData = await response.json();

        // รีเฟรชข้อมูลหลังจากลบ
        // revalidatePath("/");

        return {
            success: responseData.success,
            message: responseData.message || "Service deleted successfully",
        };

    } catch (err) {
        console.error("Error during Delete_Action:", err);
        return {
            success: false,
            message: err instanceof Error ? err.message : "An unexpected error occurred during delete.",
        };
    }
};



