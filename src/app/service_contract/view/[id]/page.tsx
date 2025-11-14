import { getServerSession } from "next-auth";
import { authOptions } from '@/app/authOptions';
import Service_Contract_View_Page from "./Service_Contract_View_Page";
import { Service } from "@/types/service";
import { PIC } from "@/types/pic";
import { redirect } from "next/navigation";
import { getPICByUserID } from "@/lib/api";
import AccessDenied from "@/components/AccessDenied";

export const dynamic = 'force-dynamic';

type Props = {
    params: Promise<{
        id: string;
    }>;
}
export default async function Page({ params }: Props) {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    let userRole;
    let pic: PIC | null;
    // Redirect if no session
    if (!session || !session.accessToken) {
        redirect('/login'); // Adjust login path as needed
    } else {
        userRole = session?.user?.roles?.[0] || null;
        pic = await getPICByUserID(session.user.userID)
    }
    if (userRole != "ADMIN") {
        if (!pic) {
            return <AccessDenied type="Service" />
        } else {
            if (pic.service != "View All" && pic.service != "View Assigned" && pic.service != "Full Access") {
                return <AccessDenied type="Service" />
            }
        }
    }

    const res = await fetch(`${process.env.CONTRACT_API_URL}/services/${id}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.accessToken}`,
        },
    });

    if (!res.ok) {
        throw new Error('Failed to fetch service');
    }

    const service: Service = await res.json();

    if (userRole == "View Assigned") {
        if (service.pic_ID1 !== session.user.userID && service.pic_ID2 !== session.user.userID) {
            return <AccessDenied type="Service" />;
        }
    }


    const res_base = await fetch(`${process.env.CONTRACT_API_URL}/services/search?baseNo=${service.baseNo}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.accessToken}`,
        },
    });


    const relatedData = await res_base.json();

    // ตรวจสอบว่าเป็น array จริง ๆ หรือไม่
    const relatedServices = Array.isArray(relatedData)
        ? relatedData
        : relatedData.data ?? []; // ถ้ามี key เป็น data

    const userID = session?.user?.userID || null


    return <Service_Contract_View_Page service={service} relatedServices={relatedServices} userID={userID} userRole={userRole} />
}