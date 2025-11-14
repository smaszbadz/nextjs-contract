import { getServerSession } from "next-auth";
import { authOptions } from '@/app/authOptions';
import Lease_Contract_Page from "./Lease_Contract_Page";
import { Lease } from "@/types/lease";
import { Master } from "@/types/master";
import { User } from "@/types/user";
import { redirect } from "next/navigation";
import { fetchWithAuth } from "@/utils/fetchHelper";
import AccessDenied from "@/components/AccessDenied";
import { PIC } from "@/types/pic";
import { getPICByUserID } from "@/lib/api";

// Export this config to tell Next.js this is a dynamic page
export const dynamic = 'force-dynamic';


export default async function Page() {


    try {
        const session = await getServerSession(authOptions);
        let userRole;
        let pic: PIC | null;
        let permission = null;
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
                permission = pic.lease
                if (pic.lease != "View All" && pic.lease != "View Assigned" && pic.lease != "Full Access") {
                    return <AccessDenied type="Lease" />
                }
            }
        }
        // Redirect if no session
        if (!session || !session.accessToken) {
            redirect('/login'); // Adjust login path as needed
        }
        // Concurrent data fetching
        const [
            rawLease,
            core_Renewal_Masters,
            core_Notify_Masters,
            core_Status_Masters,
            core_PIC_Masters,
            core_Branch_Masters,
            lease_Usage_Masters,
            lease_Category_Masters
        ] = await Promise.all([
            fetchWithAuth<Lease[]>(`${process.env.CONTRACT_API_URL}/leases`, session.accessToken),
            fetchWithAuth<Master[]>(`${process.env.CONTRACT_API_URL}/core_renewal_masters`, session.accessToken),
            fetchWithAuth<Master[]>(`${process.env.CONTRACT_API_URL}/core_notify_masters`, session.accessToken),
            fetchWithAuth<Master[]>(`${process.env.CONTRACT_API_URL}/core_status_masters`, session.accessToken),
            fetchWithAuth<User[]>(`${process.env.CONTRACT_API_URL}/core_pic_masters`, session.accessToken),
            fetchWithAuth<Master[]>(`${process.env.CONTRACT_API_URL}/core_branch_masters`, session.accessToken),
            fetchWithAuth<Master[]>(`${process.env.CONTRACT_API_URL}/lease_usage_masters`, session.accessToken),
            fetchWithAuth<Master[]>(`${process.env.CONTRACT_API_URL}/lease_category_masters`, session.accessToken),

        ]);

        let leases = rawLease;
        if (permission === "View Assigned") {
            leases = rawLease.filter(leases =>
                leases.pic_ID1 === session.user.userID ||
                leases.pic_ID2 === session.user.userID
            );
        }

        return <Lease_Contract_Page userRole={userRole} permission={permission} leases={leases} core_Renewal_Masters={core_Renewal_Masters}
            core_Notify_Masters={core_Notify_Masters} core_Status_Masters={core_Status_Masters} core_PIC_Masters={core_PIC_Masters} core_Branch_Masters={core_Branch_Masters} lease_Usage_Masters={lease_Usage_Masters} lease_Category_Masters={lease_Category_Masters} />

    } catch (error) {
        // Error handling
        console.error('Failed to load lease contract page:', error);

        // Optional: You can create a custom error page or component
        return (
            <div className="error-container">
                <h1>Error Loading Page</h1>
                <p>Unable to fetch required data. Please try again later.</p>
            </div>
        );
    }





}