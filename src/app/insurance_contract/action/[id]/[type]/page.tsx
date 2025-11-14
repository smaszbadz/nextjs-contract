import { getServerSession } from "next-auth";
import { authOptions } from '@/app/authOptions';
import { Insurance } from "@/types/insurance";
import Insurance_Contract_Create_Page from "../../../create/Insurance_Contract_Create_Page";
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
            return <AccessDenied type="Insurance" />
        } else {
            if (pic.insurance != "Full Access") {
                return <AccessDenied type="Insurance" />
            }
        }
    }

    if (type != 'copy' && type != 'renew') {
        return <AccessDenied type={type} />
    }

    const [
        core_Status_Masters,
        core_PIC_Masters,
        core_Branch_Masters,
        insurance_Code_Masters,
        insurance
    ] = await Promise.all([
        fetchWithAuth<Master[]>(`${process.env.CONTRACT_API_URL}/core_status_masters`, session.accessToken),
        fetchWithAuth<User[]>(`${process.env.CONTRACT_API_URL}/core_pic_masters`, session.accessToken),
        fetchWithAuth<Master[]>(`${process.env.CONTRACT_API_URL}/core_branch_masters`, session.accessToken),
        fetchWithAuth<Master[]>(`${process.env.CONTRACT_API_URL}/insurance_code_masters`, session.accessToken),
        fetchWithAuth<Insurance>(`${process.env.CONTRACT_API_URL}/insurances/${id}`, session.accessToken)
    ]);


    // ตรวจสอบว่า insurance มีค่าหรือไม่ก่อนที่จะเซ็ต attachmentType

    let text = ''
    if (insurance) {
        if (type === 'copy') {
            insurance.attachmentType = 'New Contract';
            insurance.contractNo = '';
            text = 'เป็นลูกค้าใหม่บริษัทไม่เคยทำมาด้วยก่อน / กรณีที่เคยเป็นลูกค้าแต่สัญญาวันไม่ได้ต่อเนื่องกัน'
        } else if (type === 'renew') {
            // const userID = session?.user?.userID || null
            // const userRole = session?.user?.roles?.[0] || null;

            // if (userRole != 'ADMIN' && insurance.createdID != userID) {
            //     return <AccessDenied type={"[Renew Function]"} />
            // }
            insurance.attachmentType = 'Renewed';
            if (insurance.id) {
                insurance.oldId = insurance.id
            }

            text = 'เป็นลูกค้าบริษัท หมดสัญญาและต่อสัญญาต่อเนื่่องจากสัญญาฉบับก่อนหน้า'
        }
    }


    const insuranceEdit: Insurance = {
        ...insurance,
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

        premise: '',
        amount: null,
        premiumRate: null,
        net: null,
        stampDuty: null,
        vat: null,
        total: null,

        // Clear file-related fields
        file: undefined,

        // Reset dates for New Contract
        startDate: null,
        endDate: null,

        // Reset status and other tracking fields
        status: '',

        amendments: [],

    };


    return (
        <Insurance_Contract_Create_Page
            insuranceEdit={insuranceEdit}
            type={type}
            core_Status_Masters={core_Status_Masters}
            core_PIC_Masters={core_PIC_Masters}
            core_Branch_Masters={core_Branch_Masters}
            insurance_Code_Masters={insurance_Code_Masters}
            text={text}
        />
    );

}