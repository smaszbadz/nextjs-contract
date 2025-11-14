import { getServerSession } from "next-auth";
import { authOptions } from '@/app/authOptions';
import Lease_Contract_View_Page from "./Lease_Contract_View_Page";
import { Lease } from "@/types/lease";
import AccessDenied from "@/components/AccessDenied";
import { getPICByUserID } from "@/lib/api";
import { redirect } from "next/navigation";
import { PIC } from "@/types/pic";

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
            return <AccessDenied type="Lease" />
        } else {
            if (pic.lease != "View All" && pic.lease != "View Assigned" && pic.lease != "Full Access") {
                return <AccessDenied type="Lease" />
            }
        }
    }

    const res = await fetch(`${process.env.CONTRACT_API_URL}/leases/${id}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.accessToken}`,
        },
    });

    if (!res.ok) {
        throw new Error('Failed to fetch lease');
    }

    const lease: Lease = await res.json();

    if (userRole == "View Assigned") {
        if (lease.pic_ID1 !== session.user.userID && lease.pic_ID2 !== session.user.userID) {
            return <AccessDenied type="Lease" />;
        }
    }


    const res_base = await fetch(`${process.env.CONTRACT_API_URL}/leases/search?baseNo=${lease.baseNo}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.accessToken}`,
        },
    });


    const relatedData = await res_base.json();

    // ตรวจสอบว่าเป็น array จริง ๆ หรือไม่
    const relatedLeases = Array.isArray(relatedData)
        ? relatedData
        : relatedData.data ?? []; // ถ้ามี key เป็น data

    const userID = session?.user?.userID || null

    return <Lease_Contract_View_Page lease={lease} relatedLeases={relatedLeases} userID={userID} userRole={userRole} />
}