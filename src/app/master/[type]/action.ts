"use server"

import { getServerSession } from "next-auth";
import { authOptions } from '@/app/authOptions';
import { Result } from "@/types/result";
import { PIC } from "@/types/pic";
import { Lease_Category_Master } from "@/types/lease_category_master";

export const Create_Master_Action = async (type: string, description: string): Promise<Result> => {
    const session = await getServerSession(authOptions);

    try {
        if (!session) {
            throw new Error("User session not found");
        }
        let response: Response;
        if (type == 'all_branch') {
            response = await fetch(`${process.env.CONTRACT_API_URL}/core_branch_masters`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session?.accessToken}`,
                },
                body: JSON.stringify({ 'description': description })
            });
        }
        else if (type == 'all_status') {
            response = await fetch(`${process.env.CONTRACT_API_URL}/core_status_masters`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session?.accessToken}`,
                },
                body: JSON.stringify({ 'description': description })
            });
        } else if (type == 'all_renewal') {
            response = await fetch(`${process.env.CONTRACT_API_URL}/core_renewal_masters`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session?.accessToken}`,
                },
                body: JSON.stringify({ 'description': description })
            });
        } else if (type == 'all_notify') {
            response = await fetch(`${process.env.CONTRACT_API_URL}/core_notify_masters`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session?.accessToken}`,
                },
                body: JSON.stringify({ 'description': description })
            });
        } else if (type == 'service_type') {
            response = await fetch(`${process.env.CONTRACT_API_URL}/service_type_masters`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session?.accessToken}`,
                },
                body: JSON.stringify({ 'description': description })
            });
        } else if (type == 'general_category') {
            response = await fetch(`${process.env.CONTRACT_API_URL}/general_category_masters`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session?.accessToken}`,
                },
                body: JSON.stringify({ 'description': description })
            });
        } else if (type == 'general_usage') {
            response = await fetch(`${process.env.CONTRACT_API_URL}/general_usage_masters`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session?.accessToken}`,
                },
                body: JSON.stringify({ 'description': description })
            });
        } else if (type == 'lease_unit') {
            response = await fetch(`${process.env.CONTRACT_API_URL}/lease_unit_masters`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session?.accessToken}`,
                },
                body: JSON.stringify({ 'description': description })
            });
        } else if (type == 'lease_usage') {
            response = await fetch(`${process.env.CONTRACT_API_URL}/lease_usage_masters`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session?.accessToken}`,
                },
                body: JSON.stringify({ 'description': description })
            });
        } else if (type == 'insurance_code') {
            response = await fetch(`${process.env.CONTRACT_API_URL}/insurance_code_masters`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session?.accessToken}`,
                },
                body: JSON.stringify({ 'description': description })
            });
        } else {
            throw new Error('Invalid master type');
        }

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Error response from server:', errorData);
            throw new Error(errorData.error || 'An error occurred while processing the request.');
        }

        // อ่านข้อมูลจาก response เพื่อดึง id ที่ได้จาก API
        const data = await response.json();

        return {
            success: data.success,
            message: data.message,
            id: data.id // เพิ่ม id ที่ได้จาก response
        };


    } catch (err) {
        console.error('Error during All_Create_Status_Master:', err);
        // Return error message
        return { success: false, message: err instanceof Error ? err.message : 'An unexpected error occurred.' };
    }
};


export const Edit_Master_Action = async (type: string, id: string, description: string): Promise<Result> => {
    const session = await getServerSession(authOptions);

    try {

        if (!session) {
            throw new Error("User session not found");
        }
        if (!id) {
            return { success: false, message: "ID is required." };
        }

        let response: Response;
        if (type == 'all_branch') {
            response = await fetch(`${process.env.CONTRACT_API_URL}/core_branch_masters/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${session?.accessToken}`,
                },
                body: JSON.stringify({ 'description': description })
            });
        }
        else if (type == 'all_status') {
            response = await fetch(`${process.env.CONTRACT_API_URL}/core_status_masters/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${session?.accessToken}`,
                },
                body: JSON.stringify({ 'description': description })
            });
        } else if (type == 'all_renewal') {
            response = await fetch(`${process.env.CONTRACT_API_URL}/core_renewal_masters/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${session?.accessToken}`,
                },
                body: JSON.stringify({ 'description': description })
            });
        } else if (type == 'all_notify') {
            response = await fetch(`${process.env.CONTRACT_API_URL}/core_notify_masters/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${session?.accessToken}`,
                },
                body: JSON.stringify({ 'description': description })
            });
        } else if (type == 'service_type') {
            response = await fetch(`${process.env.CONTRACT_API_URL}/service_type_masters/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${session?.accessToken}`,
                },
                body: JSON.stringify({ 'description': description })
            });
        } else if (type == 'general_category') {
            response = await fetch(`${process.env.CONTRACT_API_URL}/general_category_masters/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${session?.accessToken}`,
                },
                body: JSON.stringify({ 'description': description })
            });
        } else if (type == 'general_usage') {
            response = await fetch(`${process.env.CONTRACT_API_URL}/general_usage_masters/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${session?.accessToken}`,
                },
                body: JSON.stringify({ 'description': description })
            });
        } else if (type == 'lease_unit') {
            response = await fetch(`${process.env.CONTRACT_API_URL}/lease_unit_masters/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${session?.accessToken}`,
                },
                body: JSON.stringify({ 'description': description })
            });
        }
        else if (type == 'lease_usage') {
            response = await fetch(`${process.env.CONTRACT_API_URL}/lease_usage_masters/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${session?.accessToken}`,
                },
                body: JSON.stringify({ 'description': description })
            });
        }
        else if (type == 'insurance_code') {
            response = await fetch(`${process.env.CONTRACT_API_URL}/insurance_code_masters/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${session?.accessToken}`,
                },
                body: JSON.stringify({ 'description': description })
            });
        } else {
            throw new Error('Invalid master type');
        }
        if (!response.ok) {
            const errorData = await response.json();
            console.error("Error response from server:", errorData);
            throw new Error(errorData.error || "An error occurred while editing the service.");
        }

        // อ่านข้อมูลจาก response
        const responseData = await response.json();

        // รีเฟรชข้อมูลหลังจากลบ
        // revalidatePath("/");

        return {
            success: responseData.success,
            message: responseData.message || type + "edited successfully",
        };

    } catch (err) {
        console.error("Error during Edit_Master_Action:", err);
        return {
            success: false,
            message: err instanceof Error ? err.message : "An unexpected error occurred during edit.",
        };
    }
};

export const Delete_Master_Action = async (type: string, id: string): Promise<Result> => {
    const session = await getServerSession(authOptions);

    try {

        if (!session) {
            throw new Error("User session not found");
        }
        if (!id) {
            return { success: false, message: "ID is required." };
        }
        let response: Response;
        if (type == 'all_branch') {
            response = await fetch(`${process.env.CONTRACT_API_URL}/core_branch_masters/${id}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${session?.accessToken}`,
                },
            });
        }
        else if (type == 'all_status') {
            response = await fetch(`${process.env.CONTRACT_API_URL}/core_status_masters/${id}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${session?.accessToken}`,
                },
            });
        } else if (type == 'all_renewal') {
            response = await fetch(`${process.env.CONTRACT_API_URL}/core_renewal_masters/${id}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${session?.accessToken}`,
                },
            });
        } else if (type == 'all_notify') {
            response = await fetch(`${process.env.CONTRACT_API_URL}/core_notify_masters/${id}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${session?.accessToken}`,
                },
            });
        } else if (type == 'general_category') {
            response = await fetch(`${process.env.CONTRACT_API_URL}/general_category_masters/${id}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${session?.accessToken}`,
                },
            });
        } else if (type == 'general_usage') {
            response = await fetch(`${process.env.CONTRACT_API_URL}/general_usage_masters/${id}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${session?.accessToken}`,
                },
            });
        } else if (type == 'service_type') {
            response = await fetch(`${process.env.CONTRACT_API_URL}/service_type_masters/${id}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${session?.accessToken}`,
                },
            });
        } else if (type == 'lease_unit') {
            response = await fetch(`${process.env.CONTRACT_API_URL}/lease_unit_masters/${id}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${session?.accessToken}`,
                },
            });
        } else if (type == 'lease_usage') {
            response = await fetch(`${process.env.CONTRACT_API_URL}/lease_usage_masters/${id}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${session?.accessToken}`,
                },
            });
        } else if (type == 'insurance_code') {
            response = await fetch(`${process.env.CONTRACT_API_URL}/insurance_code_masters/${id}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${session?.accessToken}`,
                },
            });
        } else {
            throw new Error('Invalid master type');
        }
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
            message: responseData.message || type + "deleted successfully",
        };

    } catch (err) {
        console.error("Error during Delete_Master_Action:", err);
        return {
            success: false,
            message: err instanceof Error ? err.message : "An unexpected error occurred during delete.",
        };
    }
};


////////////////////////////// Person in Chart //////////////////////////////////////

export const Create_PIC_Master_Action = async (pic: PIC): Promise<Result> => {
    const session = await getServerSession(authOptions);

    try {
        if (!session) {
            throw new Error("User session not found");
        }

        const response = await fetch(`${process.env.CONTRACT_API_URL}/core_pic_masters`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session?.accessToken}`,
            },
            body: JSON.stringify(pic)
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Error response from server:', errorData);
            throw new Error(errorData.error || 'An error occurred while processing the request.');
        }

        // อ่านข้อมูลจาก response เพื่อดึง id ที่ได้จาก API
        const data = await response.json();

        return {
            success: data.success,
            message: data.message,
            id: data.id // เพิ่ม id ที่ได้จาก response
        };


    } catch (err) {
        console.error('Error during Create_PIC_Master:', err);
        // Return error message
        return { success: false, message: err instanceof Error ? err.message : 'An unexpected error occurred.' };
    }
};

export const Edit_PIC_Master_Action = async (pic: PIC): Promise<Result> => {
    const session = await getServerSession(authOptions);

    try {

        if (!session) {
            throw new Error("User session not found");
        }
        const response = await fetch(`${process.env.CONTRACT_API_URL}/core_pic_masters/${pic.id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${session?.accessToken}`,
            },
            body: JSON.stringify(pic)
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("Error response from server:", errorData);
            throw new Error(errorData.error || "An error occurred while editing the service.");
        }

        // อ่านข้อมูลจาก response
        const responseData = await response.json();

        // รีเฟรชข้อมูลหลังจากลบ
        // revalidatePath("/");

        return {
            success: responseData.success,
            message: responseData.message + "edited successfully",
        };

    } catch (err) {
        console.error("Error during Edit_PIC_Master_Action:", err);
        return {
            success: false,
            message: err instanceof Error ? err.message : "An unexpected error occurred during edit.",
        };
    }
};

export const Delete_PIC_Master_Action = async (id: string): Promise<Result> => {
    const session = await getServerSession(authOptions);

    try {

        if (!session) {
            throw new Error("User session not found");
        }
        if (!id) {
            return { success: false, message: "ID is required." };
        }

        const response = await fetch(`${process.env.CONTRACT_API_URL}/core_pic_masters/${id}`, {
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
            message: responseData.message + "deleted successfully",
        };

    } catch (err) {
        console.error("Error during Delete_PIC_Master_Action:", err);
        return {
            success: false,
            message: err instanceof Error ? err.message : "An unexpected error occurred during delete.",
        };
    }
};


////////////////////////////// Lease Category //////////////////////////////////////

export const Create_Lease_Category_Master_Action = async (lease_category_master: Lease_Category_Master): Promise<Result> => {
    const session = await getServerSession(authOptions);

    try {
        if (!session) {
            throw new Error("User session not found");
        }

        const response = await fetch(`${process.env.CONTRACT_API_URL}/lease_category_masters`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session?.accessToken}`,
            },
            body: JSON.stringify(lease_category_master)
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Error response from server:', errorData);
            throw new Error(errorData.error || 'An error occurred while processing the request.');
        }

        // อ่านข้อมูลจาก response เพื่อดึง id ที่ได้จาก API
        const data = await response.json();

        return {
            success: data.success,
            message: data.message,
            id: data.id // เพิ่ม id ที่ได้จาก response
        };


    } catch (err) {
        console.error('Error during Create_Lease_Category_Master:', err);
        // Return error message
        return { success: false, message: err instanceof Error ? err.message : 'An unexpected error occurred.' };
    }
};

export const Edit_Lease_Category_Master_Action = async (lease_category_master: Lease_Category_Master): Promise<Result> => {
    const session = await getServerSession(authOptions);

    try {

        if (!session) {
            throw new Error("User session not found");
        }

        const response = await fetch(`${process.env.CONTRACT_API_URL}/lease_category_masters/${lease_category_master.id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${session?.accessToken}`,
            },
            body: JSON.stringify(lease_category_master)
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("Error response from server:", errorData);
            throw new Error(errorData.error || "An error occurred while editing the service.");
        }

        // อ่านข้อมูลจาก response
        const responseData = await response.json();

        // รีเฟรชข้อมูลหลังจากลบ
        // revalidatePath("/");

        return {
            success: responseData.success,
            message: responseData.message + "edited successfully",
        };

    } catch (err) {
        console.error("Error during Edit_Lease_Category_Master_Action:", err);
        return {
            success: false,
            message: err instanceof Error ? err.message : "An unexpected error occurred during edit.",
        };
    }
};

export const Delete_Lease_Category_Master_Action = async (id: string): Promise<Result> => {
    const session = await getServerSession(authOptions);

    try {

        if (!session) {
            throw new Error("User session not found");
        }
        if (!id) {
            return { success: false, message: "ID is required." };
        }

        const response = await fetch(`${process.env.CONTRACT_API_URL}/lease_category_masters/${id}`, {
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
            message: responseData.message + "deleted successfully",
        };

    } catch (err) {
        console.error("Error during Delete_Lease_Category_Master_Action:", err);
        return {
            success: false,
            message: err instanceof Error ? err.message : "An unexpected error occurred during delete.",
        };
    }
};