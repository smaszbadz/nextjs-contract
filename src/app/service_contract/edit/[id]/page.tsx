import { getServerSession } from "next-auth";
import { authOptions } from '@/app/authOptions';
import { Service } from "@/types/service";
import Service_Contract_Create_Page from "../../create/Service_Contract_Create_Page";
import { Master } from "@/types/master";
import { User } from '@/types/user';
import { redirect } from "next/navigation";
import { fetchWithAuth } from "@/utils/fetchHelper";
import AccessDenied from "@/components/AccessDenied";
import { PIC } from "@/types/pic";
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

    const [
        core_Renewal_Masters,
        core_Notify_Masters,
        core_Status_Masters,
        core_PIC_Masters,
        service_Type_Masters,
        service
    ] = await Promise.all([
        fetchWithAuth<Master[]>(`${process.env.CONTRACT_API_URL}/core_renewal_masters`, session.accessToken),
        fetchWithAuth<Master[]>(`${process.env.CONTRACT_API_URL}/core_notify_masters`, session.accessToken),
        fetchWithAuth<Master[]>(`${process.env.CONTRACT_API_URL}/core_status_masters`, session.accessToken),
        fetchWithAuth<User[]>(`${process.env.CONTRACT_API_URL}/core_pic_masters`, session.accessToken),
        fetchWithAuth<Master[]>(`${process.env.CONTRACT_API_URL}/service_type_masters`, session.accessToken),
        fetchWithAuth<Service>(`${process.env.CONTRACT_API_URL}/services/${id}`, session.accessToken)
    ]);

    const userID = session?.user?.userID || null

    if (userRole != 'ADMIN' && service.createdID != userID) {
        return <AccessDenied type={"[Edit Function]"} />
    }

    let text = ""
    if (service.attachmentType == 'New Contract') {
        text = 'เป็นลูกค้าใหม่บริษัทไม่เคยทำมาด้วยก่อน / กรณีที่เคยเป็นลูกค้าแต่สัญญาวันไม่ได้ต่อเนื่องกัน'
    } else if (service.attachmentType == 'Renewed') {
        text = 'เป็นลูกค้าบริษัท หมดสัญญาและต่อสัญญาต่อเนื่่องจากสัญญาฉบับก่อนหน้า'
    }

    return (
        <Service_Contract_Create_Page
            serviceEdit={service}
            type={'edit'}
            core_Renewal_Masters={core_Renewal_Masters}
            core_Notify_Masters={core_Notify_Masters}
            core_Status_Masters={core_Status_Masters}
            core_PIC_Masters={core_PIC_Masters}
            service_Type_Masters={service_Type_Masters}
            text={text}
        />
    );

}