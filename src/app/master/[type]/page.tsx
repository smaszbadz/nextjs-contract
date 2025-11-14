import { getServerSession } from "next-auth";
import { authOptions } from '@/app/authOptions';
import All_Master_Page from "./All_Master_Page";
import Lease_Category_Master_Page from "./Lease_Category_Master_Page";
import All_PIC_Master_Page from "./All_PIC_Master_Page";
import AccessDenied from "@/components/AccessDenied";


type Props = {
    params: Promise<{
        type: string;
    }>;
}
export default async function Page({ params }: Props) {
    const { type } = await params;

    const session = await getServerSession(authOptions);

    const userRole = session?.user?.roles?.[0] || null;

    if (userRole != 'ADMIN') {
        return <AccessDenied type={"[Master Function]"} />
    }


    let typeName = '';
    let res: Response
    let groupType = '';
    if (type == 'all_branch') {
        groupType = 'All Contract'
        typeName = 'Branch Master'
        res = await fetch(`${process.env.CONTRACT_API_URL}/core_branch_masters`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session?.accessToken}`,
            },
        });

        if (!res.ok) {
            throw new Error('Failed to fetch core status masters');
        }
    } else if (type == 'all_status') {
        groupType = 'All Contract'
        typeName = 'Status Master'
        res = await fetch(`${process.env.CONTRACT_API_URL}/core_status_masters`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session?.accessToken}`,
            },
        });

        if (!res.ok) {
            throw new Error('Failed to fetch core status masters');
        }
    } else if (type == 'all_renewal') {
        groupType = 'All Contract'
        typeName = 'Notice - Contract Renewal Master'
        res = await fetch(`${process.env.CONTRACT_API_URL}/core_renewal_masters`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session?.accessToken}`,
            },
        });

        if (!res.ok) {
            throw new Error('Failed to fetch core renewal masters');
        }
    } else if (type == 'all_notify') {
        groupType = 'All Contract'
        typeName = 'Notice - Contract Notify Master'
        res = await fetch(`${process.env.CONTRACT_API_URL}/core_notify_masters`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session?.accessToken}`,
            },
        });

        if (!res.ok) {
            throw new Error('Failed to fetch core notify masters');
        }
    } else if (type == 'all_pic') {
        groupType = 'All Contract'
        typeName = 'Person In Charge Master'
        res = await fetch(`${process.env.CONTRACT_API_URL}/core_pic_masters`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session?.accessToken}`,
            },
        });

        if (!res.ok) {
            throw new Error('Failed to fetch core pic masters');
        }




    } else if (type == 'service_type') {
        groupType = 'Service'
        typeName = 'Service - Type Master'
        res = await fetch(`${process.env.CONTRACT_API_URL}/service_type_masters`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session?.accessToken}`,
            },
        });

        if (!res.ok) {
            throw new Error('Failed to fetch service type masters');
        }
    } else if (type == 'general_category') {
        groupType = 'General'
        typeName = 'General - Category Master'
        res = await fetch(`${process.env.CONTRACT_API_URL}/general_category_masters`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session?.accessToken}`,
            },
        });

        if (!res.ok) {
            throw new Error('Failed to fetch service type masters');
        }
    } else if (type == 'general_usage') {
        groupType = 'General'
        typeName = 'General - Usage Master'
        res = await fetch(`${process.env.CONTRACT_API_URL}/general_usage_masters`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session?.accessToken}`,
            },
        });

        if (!res.ok) {
            throw new Error('Failed to fetch service type masters');
        }
    } else if (type == 'lease_category') {
        groupType = 'Lease'
        typeName = 'Lease - Category Master'
        res = await fetch(`${process.env.CONTRACT_API_URL}/lease_category_masters`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session?.accessToken}`,
            },
        });

        if (!res.ok) {
            throw new Error('Failed to fetch service type masters');
        }


    } else if (type == 'lease_usage') {
        groupType = 'Lease'
        typeName = 'Lease - Usage Master'
        res = await fetch(`${process.env.CONTRACT_API_URL}/lease_usage_masters`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session?.accessToken}`,
            },
        });

        if (!res.ok) {
            throw new Error('Failed to fetch service type masters');
        }

    } else if (type == 'lease_unit') {
        groupType = 'Lease'
        typeName = 'Lease - Unit Master'
        res = await fetch(`${process.env.CONTRACT_API_URL}/lease_unit_masters`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session?.accessToken}`,
            },
        });

        if (!res.ok) {
            throw new Error('Failed to fetch service type masters');
        }

    } else if (type == 'insurance_code') {
        groupType = 'Insurance'
        typeName = 'Insurance - Code Master'
        res = await fetch(`${process.env.CONTRACT_API_URL}/insurance_code_masters`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session?.accessToken}`,
            },
        });

        if (!res.ok) {
            throw new Error('Failed to fetch service type masters');
        }

    } else {
        throw new Error('Invalid master type');
    }

    const data = await res.json();


    if (type == 'all_pic') {

        res = await fetch(`${process.env.HR_API_URL}/employees?state=Active`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session?.accessToken}`,
            },
        });

        if (!res.ok) {
            throw new Error('Failed to fetch employees');
        }

        const employees = await res.json();

        return <All_PIC_Master_Page data={data} employees={employees} />
    } else if (type == 'lease_category') {
        return <Lease_Category_Master_Page data={data} />
    } else {
        return <All_Master_Page type={type} typeName={typeName} data={data} groupType={groupType} />
    }


}