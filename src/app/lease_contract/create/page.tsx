import { getServerSession } from "next-auth";
import { authOptions } from '@/app/authOptions';
import { Master } from "@/types/master";
import { User } from "@/types/user";
import { redirect } from 'next/navigation';
import { fetchWithAuth } from "@/utils/fetchHelper";
import Lease_Contract_Create_Page from "./Lease_Contract_Create_Page";
import { Lease_Category_Master } from "@/types/lease_category_master";
import { PIC } from "@/types/pic";
import { getPICByUserID } from "@/lib/api";
import AccessDenied from "@/components/AccessDenied";

// Export this config to tell Next.js this is a dynamic page
export const dynamic = 'force-dynamic';

export default async function Page() {
    try {
        // Get server session
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

        // Concurrent data fetching
        const [
            core_Renewal_Masters,
            core_Notify_Masters,
            core_Status_Masters,
            core_PIC_Masters,
            core_Branch_Masters,
            lease_Usage_Masters,
            lease_Category_Masters,
            lease_Unit_Masters
        ] = await Promise.all([
            fetchWithAuth<Master[]>(`${process.env.CONTRACT_API_URL}/core_renewal_masters`, session.accessToken),
            fetchWithAuth<Master[]>(`${process.env.CONTRACT_API_URL}/core_notify_masters`, session.accessToken),
            fetchWithAuth<Master[]>(`${process.env.CONTRACT_API_URL}/core_status_masters`, session.accessToken),
            fetchWithAuth<User[]>(`${process.env.CONTRACT_API_URL}/core_pic_masters`, session.accessToken),
            fetchWithAuth<Master[]>(`${process.env.CONTRACT_API_URL}/core_branch_masters`, session.accessToken),
            fetchWithAuth<Master[]>(`${process.env.CONTRACT_API_URL}/lease_usage_masters`, session.accessToken),
            fetchWithAuth<Lease_Category_Master[]>(`${process.env.CONTRACT_API_URL}/lease_category_masters`, session.accessToken),
            fetchWithAuth<Master[]>(`${process.env.CONTRACT_API_URL}/lease_unit_masters`, session.accessToken)
        ]);

        // Render the page with fetched data
        return (
            <Lease_Contract_Create_Page
                leaseEdit={null}
                type={null}
                core_Renewal_Masters={core_Renewal_Masters}
                core_Notify_Masters={core_Notify_Masters}
                core_Status_Masters={core_Status_Masters}
                core_PIC_Masters={core_PIC_Masters}
                core_Branch_Masters={core_Branch_Masters}
                lease_Usage_Masters={lease_Usage_Masters}
                lease_Category_Masters={lease_Category_Masters}
                lease_Unit_Masters={lease_Unit_Masters}
                text={'เป็นลูกค้าใหม่บริษัทไม่เคยทำมาด้วยก่อน / กรณีที่เคยเป็นลูกค้าแต่สัญญาวันไม่ได้ต่อเนื่องกัน'}
            />
        );
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