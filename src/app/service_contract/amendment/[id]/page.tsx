import { getServerSession } from "next-auth";
import { authOptions } from '@/app/authOptions';
import { Service } from "@/types/service";
import Service_Contract_Amendment_Page from "./Service_Contract_Amendment_Page";
import AccessDenied from "@/components/AccessDenied";
import { PIC } from "@/types/pic";
import { redirect } from "next/navigation";
import { getPICByUserID } from "@/lib/api";

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
            if (pic.service != "Full Access") {
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
        throw new Error('Failed to fetch pick list');
    }

    const service: Service = await res.json();

    const userID = session?.user?.userID || null

    if (userRole != 'ADMIN' && service.createdID != userID) {
        return <AccessDenied type={"[Amendment Function]"} />
    }

    return <Service_Contract_Amendment_Page service={service} />
}