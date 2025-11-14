import { getServerSession } from "next-auth";
import { authOptions } from '@/app/authOptions';
import { Transportation } from "@/types/transportation";
import Transportation_Contract_Create_Page from "../../../create/Transportation_Contract_Create_Page";
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
        type: string;
    }>;
}
export default async function Page({ params }: Props) {

    const { id, type } = await params;

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
            return <AccessDenied type="Transport" />
        } else {
            if (pic.transport != "Full Access") {
                return <AccessDenied type="Transport" />
            }
        }
    }

    if (type != 'copy' && type != 'renew') {
        return <AccessDenied type={type} />
    }

    const [
        core_Renewal_Masters,
        core_Notify_Masters,
        core_Status_Masters,
        core_PIC_Masters,
        transportation
    ] = await Promise.all([
        fetchWithAuth<Master[]>(`${process.env.CONTRACT_API_URL}/core_renewal_masters`, session.accessToken),
        fetchWithAuth<Master[]>(`${process.env.CONTRACT_API_URL}/core_notify_masters`, session.accessToken),
        fetchWithAuth<Master[]>(`${process.env.CONTRACT_API_URL}/core_status_masters`, session.accessToken),
        fetchWithAuth<User[]>(`${process.env.CONTRACT_API_URL}/core_pic_masters`, session.accessToken),
        fetchWithAuth<Transportation>(`${process.env.CONTRACT_API_URL}/transportation/${id}`, session.accessToken)
    ]);


    // ตรวจสอบว่า transportation มีค่าหรือไม่ก่อนที่จะเซ็ต attachmentType

    let text = ''
    if (transportation) {
        if (type === 'copy') {
            transportation.attachmentType = 'New Contract';
            transportation.contractNo = '';
            text = 'เป็นลูกค้าใหม่บริษัทไม่เคยทำมาด้วยก่อน / กรณีที่เคยเป็นลูกค้าแต่สัญญาวันไม่ได้ต่อเนื่องกัน'
        } else if (type === 'renew') {

            transportation.attachmentType = 'Renewed';
            if (transportation.id) {
                transportation.oldId = transportation.id
            }
            text = 'เป็นลูกค้าบริษัท หมดสัญญาและต่อสัญญาต่อเนื่่องจากสัญญาฉบับก่อนหน้า'
        }
    }


    const transportationEdit: Transportation = {
        ...transportation,
        // Clear identification and tracking fields
        id: undefined,

        // Clear audit trail fields
        createdID: '',
        createdBy: '',
        createdAt: null,
        updatedID: '',
        updatedBy: '',
        updatedAt: null,
        uploadedID: '',
        uploadedBy: '',
        uploadedAt: null,
        fileName: '',


        // Clear file-related fields
        file: undefined,

        // Reset dates for New Contract
        startDate: null,
        endDate: null,

        // Reset status and other tracking fields
        status: '',

    };


    return (
        <Transportation_Contract_Create_Page
            transportationEdit={transportationEdit}
            type={type}
            core_Renewal_Masters={core_Renewal_Masters}
            core_Notify_Masters={core_Notify_Masters}
            core_Status_Masters={core_Status_Masters}
            core_PIC_Masters={core_PIC_Masters}
            text={text}
        />
    );

}