import { getServerSession } from "next-auth";
import { authOptions } from '@/app/authOptions';
import Service_Contract_Page from "./Service_Contract_Page";
import { Service } from "@/types/service";
import { Master } from "@/types/master";
import { User } from "@/types/user";
import { redirect } from "next/navigation";
import { fetchWithAuth } from "@/utils/fetchHelper";
import { getPICByUserID } from "@/lib/api";
import { PIC } from "@/types/pic";
import AccessDenied from "@/components/AccessDenied";

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
                return <AccessDenied type="Service" />
            } else {
                permission = pic.service
                if (pic.service != "View All" && pic.service != "View Assigned" && pic.service != "Full Access") {
                    return <AccessDenied type="Service" />
                }
            }
        }


        // Concurrent data fetching
        const [
            rawServices,
            core_Renewal_Masters,
            core_Notify_Masters,
            core_Status_Masters,
            core_PIC_Masters,
            service_Type_Masters
        ] = await Promise.all([
            fetchWithAuth<Service[]>(`${process.env.CONTRACT_API_URL}/services`, session.accessToken),
            fetchWithAuth<Master[]>(`${process.env.CONTRACT_API_URL}/core_renewal_masters`, session.accessToken),
            fetchWithAuth<Master[]>(`${process.env.CONTRACT_API_URL}/core_notify_masters`, session.accessToken),
            fetchWithAuth<Master[]>(`${process.env.CONTRACT_API_URL}/core_status_masters`, session.accessToken),
            fetchWithAuth<User[]>(`${process.env.CONTRACT_API_URL}/core_pic_masters`, session.accessToken),
            fetchWithAuth<Master[]>(`${process.env.CONTRACT_API_URL}/service_type_masters`, session.accessToken)
        ]);

        // Filter services for "View All" users
        let services = rawServices;
        if (permission === "View Assigned") {
            services = rawServices.filter(service =>
                service.pic_ID1 === session.user.userID ||
                service.pic_ID2 === session.user.userID
            );
        }

        return <Service_Contract_Page userRole={userRole} permission={permission} services={services} core_Renewal_Masters={core_Renewal_Masters}
            core_Notify_Masters={core_Notify_Masters} core_Status_Masters={core_Status_Masters} core_PIC_Masters={core_PIC_Masters} service_Type_Masters={service_Type_Masters} />

    } catch (error) {
        // Error handling
        console.error('Failed to load service contract page:', error);

        // Optional: You can create a custom error page or component
        return (
            <div className="error-container">
                <h1>Error Loading Page</h1>
                <p>Unable to fetch required data. Please try again later.</p>
            </div>
        );
    }





}