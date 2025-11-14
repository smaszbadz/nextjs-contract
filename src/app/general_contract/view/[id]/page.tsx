import { getServerSession } from "next-auth";
import { authOptions } from '@/app/authOptions';
import General_Contract_View_Page from "./General_Contract_View_Page";
import { General } from "@/types/general";
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
            return <AccessDenied type="General" />
        } else {
            if (pic.general != "View All" && pic.general != "View Assigned" && pic.general != "Full Access") {
                return <AccessDenied type="General" />
            }
        }
    }

    const res = await fetch(`${process.env.CONTRACT_API_URL}/generals/${id}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.accessToken}`,
        },
    });

    if (!res.ok) {
        throw new Error('Failed to fetch general');
    }

    const general: General = await res.json();

    if (userRole == "View Assigned") {
        if (general.pic_ID1 !== session.user.userID && general.pic_ID2 !== session.user.userID) {
            return <AccessDenied type="General" />;
        }
    }


    const res_base = await fetch(`${process.env.CONTRACT_API_URL}/generals/search?baseNo=${general.baseNo}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.accessToken}`,
        },
    });


    const relatedData = await res_base.json();

    // ตรวจสอบว่าเป็น array จริง ๆ หรือไม่
    const relatedGenerals = Array.isArray(relatedData)
        ? relatedData
        : relatedData.data ?? []; // ถ้ามี key เป็น data

    const userID = session?.user?.userID || null

    return <General_Contract_View_Page general={general} relatedGenerals={relatedGenerals} userID={userID} userRole={userRole} />
}