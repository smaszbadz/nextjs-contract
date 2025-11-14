import { getServerSession } from "next-auth";
import { authOptions } from '@/app/authOptions';
import { General } from "@/types/general";
import General_Contract_Amendment_Page from "./General_Contract_Amendment_Page";
import AccessDenied from "@/components/AccessDenied";
import { PIC } from "@/types/pic";
import { getPICByUserID } from "@/lib/api";
import { redirect } from "next/navigation";

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
            if (pic.general != "Full Access") {
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
        throw new Error('Failed to fetch pick list');
    }

    const general: General = await res.json();

    const userID = session?.user?.userID || null

    if (userRole != 'ADMIN' && general.createdID != userID) {
        return <AccessDenied type={"[Amendment Function]"} />
    }

    return <General_Contract_Amendment_Page general={general} />
}