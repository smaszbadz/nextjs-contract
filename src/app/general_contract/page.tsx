import { getServerSession } from "next-auth";
import { authOptions } from '@/app/authOptions';
import General_Contract_Page from "./General_Contract_Page";
import { General } from "@/types/general";
import { Master } from "@/types/master";
import { User } from "@/types/user";
import { redirect } from "next/navigation";
import { fetchWithAuth } from "@/utils/fetchHelper";
import { getPICByUserID } from "@/lib/api";
import AccessDenied from "@/components/AccessDenied";
import { PIC } from "@/types/pic";

// Export this config to tell Next.js this is a dynamic page
export const dynamic = 'force-dynamic';


export default async function Page() {


    try {
        const session = await getServerSession(authOptions);
        // const userRole = session?.user?.roles?.[0] || null; // Assuming roles is an array and checking the first role
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
                return <AccessDenied type="General" />
            } else {
                permission = pic.general
                if (pic.general != "View All" && pic.general != "View Assigned" && pic.general != "Full Access") {
                    return <AccessDenied type="General" />
                }
            }
        }
        // Concurrent data fetching
        const [
            rawGenerals,
            core_Renewal_Masters,
            core_Notify_Masters,
            core_Status_Masters,
            core_PIC_Masters,
            general_Usage_Masters,
            general_Category_Masters
        ] = await Promise.all([
            fetchWithAuth<General[]>(`${process.env.CONTRACT_API_URL}/generals`, session.accessToken),
            fetchWithAuth<Master[]>(`${process.env.CONTRACT_API_URL}/core_renewal_masters`, session.accessToken),
            fetchWithAuth<Master[]>(`${process.env.CONTRACT_API_URL}/core_notify_masters`, session.accessToken),
            fetchWithAuth<Master[]>(`${process.env.CONTRACT_API_URL}/core_status_masters`, session.accessToken),
            fetchWithAuth<User[]>(`${process.env.CONTRACT_API_URL}/core_pic_masters`, session.accessToken),
            fetchWithAuth<Master[]>(`${process.env.CONTRACT_API_URL}/general_usage_masters`, session.accessToken),
            fetchWithAuth<Master[]>(`${process.env.CONTRACT_API_URL}/general_category_masters`, session.accessToken),

        ]);

        let generals = rawGenerals;
        if (permission === "View Assigned") {
            generals = rawGenerals.filter(generals =>
                generals.pic_ID1 === session.user.userID ||
                generals.pic_ID2 === session.user.userID
            );
        }

        return <General_Contract_Page userRole={userRole} permission={permission} generals={generals} core_Renewal_Masters={core_Renewal_Masters}
            core_Notify_Masters={core_Notify_Masters} core_Status_Masters={core_Status_Masters} core_PIC_Masters={core_PIC_Masters} general_Usage_Masters={general_Usage_Masters} general_Category_Masters={general_Category_Masters} />

    } catch (error) {
        // Error handling
        console.error('Failed to load general contract page:', error);

        // Optional: You can create a custom error page or component
        return (
            <div className="error-container">
                <h1>Error Loading Page</h1>
                <p>Unable to fetch required data. Pgeneral try again later.</p>
            </div>
        );
    }





}