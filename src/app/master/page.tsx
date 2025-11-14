import AccessDenied from "@/components/AccessDenied";
import { getServerSession } from "next-auth";
import { authOptions } from "../authOptions";
import Master_Page from "./Master_Page";

export default async function Page() {

    const session = await getServerSession(authOptions);
    const userRole = session?.user?.roles?.[0] || null;

    if (userRole != 'ADMIN') {
        return <AccessDenied type={"[Master Function]"} />
    }

    return <Master_Page />
}