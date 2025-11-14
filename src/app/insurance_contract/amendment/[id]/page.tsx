import { getServerSession } from "next-auth";
import { authOptions } from '@/app/authOptions';
import { Insurance } from "@/types/insurance";
import Insurance_Contract_Amendment_Page from "./Insurance_Contract_Amendment_Page";
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
            return <AccessDenied type="Insurance" />
        } else {
            if (pic.insurance != "Full Access") {
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
        throw new Error('Failed to fetch pick list');
    }

    const insurance: Insurance = await res.json();

    const userID = session?.user?.userID || null


    if (userRole != 'ADMIN' && insurance.createdID != userID) {
        return <AccessDenied type={"[Amendment Function]"} />
    }


    return <Insurance_Contract_Amendment_Page insurance={insurance} />
}