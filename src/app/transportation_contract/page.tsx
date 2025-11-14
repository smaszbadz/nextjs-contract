import { getServerSession } from "next-auth";
import { authOptions } from '@/app/authOptions';
import Transportation_Contract_Page from "./Transportation_Contract_Page";
import { Transportation } from "@/types/transportation";
import { Master } from "@/types/master";
import { User } from "@/types/user";
import { redirect } from "next/navigation";
import { fetchWithAuth } from "@/utils/fetchHelper";
import AccessDenied from "@/components/AccessDenied";
import { getPICByUserID } from "@/lib/api";
import { PIC } from "@/types/pic";

// Export this config to tell Next.js this is a dynamic page
export const dynamic = 'force-dynamic';

export default async function Page() {


    try {
        const session = await getServerSession(authOptions);
        let userRole;
        let pic: PIC | null;
        let permission = null;
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
                permission = pic.transport
                if (pic.transport != "View All" && pic.transport != "View Assigned" && pic.transport != "Full Access") {
                    return <AccessDenied type="Transport" />
                }
            }
        }

        // Concurrent data fetching
        const [
            rawTransportation,
            core_Renewal_Masters,
            core_Notify_Masters,
            core_Status_Masters,
            core_PIC_Masters,
        ] = await Promise.all([
            fetchWithAuth<Transportation[]>(`${process.env.CONTRACT_API_URL}/transportation`, session.accessToken),
            fetchWithAuth<Master[]>(`${process.env.CONTRACT_API_URL}/core_renewal_masters`, session.accessToken),
            fetchWithAuth<Master[]>(`${process.env.CONTRACT_API_URL}/core_notify_masters`, session.accessToken),
            fetchWithAuth<Master[]>(`${process.env.CONTRACT_API_URL}/core_status_masters`, session.accessToken),
            fetchWithAuth<User[]>(`${process.env.CONTRACT_API_URL}/core_pic_masters`, session.accessToken),

        ]);

        let transportation = rawTransportation;
        if (permission === "View Assigned") {
            transportation = rawTransportation.filter(transportation =>
                transportation.pic_ID1 === session.user.userID ||
                transportation.pic_ID2 === session.user.userID
            );
        }

        return <Transportation_Contract_Page userRole={userRole} permission={permission} transportation={transportation} core_Renewal_Masters={core_Renewal_Masters}
            core_Notify_Masters={core_Notify_Masters} core_Status_Masters={core_Status_Masters} core_PIC_Masters={core_PIC_Masters} />

    } catch (error) {
        // Error handling
        console.error('Failed to load transportation contract page:', error);

        // Optional: You can create a custom error page or component
        return (
            <div className="error-container">
                <h1>Error Loading Page</h1>
                <p>Unable to fetch required data. Ptransportation try again later.</p>
            </div>
        );
    }





}