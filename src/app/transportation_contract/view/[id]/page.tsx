import { getServerSession } from "next-auth";
import { authOptions } from '@/app/authOptions';
import Transportation_Contract_View_Page from "./Transportation_Contract_View_Page";
import { Transportation } from "@/types/transportation";
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
            return <AccessDenied type="Transport" />
        } else {
            if (pic.transport != "View All" && pic.transport != "View Assigned" && pic.transport != "Full Access") {
                return <AccessDenied type="Transport" />
            }
        }
    }

    const res = await fetch(`${process.env.CONTRACT_API_URL}/transportation/${id}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.accessToken}`,
        },
    });

    if (!res.ok) {
        throw new Error('Failed to fetch transportation');
    }

    const transportation: Transportation = await res.json();

    if (userRole == "View Assigned") {
        if (transportation.pic_ID1 !== session.user.userID && transportation.pic_ID2 !== session.user.userID) {
            return <AccessDenied type="Transportation" />;
        }
    }



    const res_base = await fetch(`${process.env.CONTRACT_API_URL}/transportation/search?baseNo=${transportation.baseNo}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.accessToken}`,
        },
    });


    const relatedData = await res_base.json();

    // ตรวจสอบว่าเป็น array จริง ๆ หรือไม่
    const relatedTransportation = Array.isArray(relatedData)
        ? relatedData
        : relatedData.data ?? []; // ถ้ามี key เป็น data

    const userID = session?.user?.userID || null

    return <Transportation_Contract_View_Page transportation={transportation} relatedTransportation={relatedTransportation} userID={userID} userRole={userRole} />
}