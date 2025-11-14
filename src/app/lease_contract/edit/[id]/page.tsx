import { getServerSession } from "next-auth";
import { authOptions } from '@/app/authOptions';
import { Lease } from "@/types/lease";
import Lease_Contract_Create_Page from "../../create/Lease_Contract_Create_Page";
import { Master } from "@/types/master";
import { User } from '@/types/user';
import { redirect } from "next/navigation";
import { fetchWithAuth } from "@/utils/fetchHelper";
import { Lease_Category_Master } from "@/types/lease_category_master";
import AccessDenied from "@/components/AccessDenied";
import { getPICByUserID } from "@/lib/api";
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
            if (pic.lease != "Full Access") {
                return <AccessDenied type="Lease" />
            }
        }
    }

    const [
        core_Renewal_Masters,
        core_Notify_Masters,
        core_Status_Masters,
        core_PIC_Masters,
        core_Branch_Masters,
        lease_Usage_Masters,
        lease_Category_Masters,
        lease_Unit_Masters,
        lease
    ] = await Promise.all([
        fetchWithAuth<Master[]>(`${process.env.CONTRACT_API_URL}/core_renewal_masters`, session.accessToken),
        fetchWithAuth<Master[]>(`${process.env.CONTRACT_API_URL}/core_notify_masters`, session.accessToken),
        fetchWithAuth<Master[]>(`${process.env.CONTRACT_API_URL}/core_status_masters`, session.accessToken),
        fetchWithAuth<User[]>(`${process.env.CONTRACT_API_URL}/core_pic_masters`, session.accessToken),
        fetchWithAuth<Master[]>(`${process.env.CONTRACT_API_URL}/core_branch_masters`, session.accessToken),
        fetchWithAuth<Master[]>(`${process.env.CONTRACT_API_URL}/lease_usage_masters`, session.accessToken),
        fetchWithAuth<Lease_Category_Master[]>(`${process.env.CONTRACT_API_URL}/lease_category_masters`, session.accessToken),
        fetchWithAuth<Master[]>(`${process.env.CONTRACT_API_URL}/lease_unit_masters`, session.accessToken),
        fetchWithAuth<Lease>(`${process.env.CONTRACT_API_URL}/leases/${id}`, session.accessToken)
    ]);

    const userID = session?.user?.userID || null

    if (userRole != 'ADMIN' && lease.createdID != userID) {
        return <AccessDenied type={"[Edit Function]"} />
    }

    let text = ""
    if (lease.attachmentType == 'New Contract') {
        text = 'เป็นลูกค้าใหม่บริษัทไม่เคยทำมาด้วยก่อน / กรณีที่เคยเป็นลูกค้าแต่สัญญาวันไม่ได้ต่อเนื่องกัน'
    } else if (lease.attachmentType == 'Renewed') {
        text = 'เป็นลูกค้าบริษัท หมดสัญญาและต่อสัญญาต่อเนื่่องจากสัญญาฉบับก่อนหน้า'
    }

    return (
        <Lease_Contract_Create_Page
            leaseEdit={lease}
            type={'edit'}
            core_Renewal_Masters={core_Renewal_Masters}
            core_Notify_Masters={core_Notify_Masters}
            core_Status_Masters={core_Status_Masters}
            core_PIC_Masters={core_PIC_Masters}
            core_Branch_Masters={core_Branch_Masters}
            lease_Usage_Masters={lease_Usage_Masters}
            lease_Category_Masters={lease_Category_Masters}
            lease_Unit_Masters={lease_Unit_Masters}
            text={text}
        />
    );

}