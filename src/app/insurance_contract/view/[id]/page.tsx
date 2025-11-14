import { getServerSession } from "next-auth";
import { authOptions } from '@/app/authOptions';
import Insurance_Contract_View_Page from "./Insurance_Contract_View_Page";
import { Insurance } from "@/types/insurance";
import { getPICByUserID } from "@/lib/api";
import AccessDenied from "@/components/AccessDenied";
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
            return <AccessDenied type="Insurance" />
        } else {
            if (pic.insurance != "View All" && pic.insurance != "View Assigned" && pic.insurance != "Full Access") {
                return <AccessDenied type="Insurance" />
            }
        }
    }

    const res = await fetch(`${process.env.CONTRACT_API_URL}/insurances/${id}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.accessToken}`,
        },
    });

    if (!res.ok) {
        throw new Error('Failed to fetch insurance');
    }

    const insurance: Insurance = await res.json();

    if (userRole == "View Assigned") {
        if (insurance.pic_ID1 !== session.user.userID && insurance.pic_ID2 !== session.user.userID) {
            return <AccessDenied type="Insurance" />;
        }
    }


    const res_base = await fetch(`${process.env.CONTRACT_API_URL}/insurances/search?baseNo=${insurance.baseNo}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.accessToken}`,
        },
    });


    const relatedData = await res_base.json();

    // ตรวจสอบว่าเป็น array จริง ๆ หรือไม่
    const relatedInsurances = Array.isArray(relatedData)
        ? relatedData
        : relatedData.data ?? []; // ถ้ามี key เป็น data

    const userID = session?.user?.userID || null
    return <Insurance_Contract_View_Page insurance={insurance} relatedInsurances={relatedInsurances} userID={userID} userRole={userRole} />
}