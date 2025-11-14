import AccessDenied from "@/components/AccessDenied";
import { Service } from "@/types/service";
import { fetchWithAuth } from "@/utils/fetchHelper";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "../authOptions";
import Dashboard_Page from "./Dashboard_Page";

// Export this config to tell Next.js this is a dynamic page
export const dynamic = 'force-dynamic';

export default async function Page() {

  const session = await getServerSession(authOptions);
  if (!session) {
    return <AccessDenied type="Dashboard" />
  }
  try {
    const session = await getServerSession(authOptions);
    // const userRole = session?.user?.roles?.[0] || null; // Assuming roles is an array and checking the first role

    // Redirect if no session
    if (!session || !session.accessToken) {
      redirect('/login'); // Adjust login path as needed
    }
    // Concurrent data fetching
    const [
      service_expired,
      service_expiring,
      general_expired,
      general_expiring,
      lease_expired,
      lease_expiring,
      insurance_expired,
      insurance_expiring,
      transportation_expired,
      transportation_expiring,
    ] = await Promise.all([
      fetchWithAuth<Service[]>(`${process.env.CONTRACT_API_URL}/services/expired`, session.accessToken),
      fetchWithAuth<Service[]>(`${process.env.CONTRACT_API_URL}/services/expiring?days=7`, session.accessToken),
      fetchWithAuth<Service[]>(`${process.env.CONTRACT_API_URL}/generals/expired`, session.accessToken),
      fetchWithAuth<Service[]>(`${process.env.CONTRACT_API_URL}/generals/expiring?days=7`, session.accessToken),
      fetchWithAuth<Service[]>(`${process.env.CONTRACT_API_URL}/leases/expired`, session.accessToken),
      fetchWithAuth<Service[]>(`${process.env.CONTRACT_API_URL}/leases/expiring?days=7`, session.accessToken),
      fetchWithAuth<Service[]>(`${process.env.CONTRACT_API_URL}/insurances/expired`, session.accessToken),
      fetchWithAuth<Service[]>(`${process.env.CONTRACT_API_URL}/insurances/expiring?days=7`, session.accessToken),
      fetchWithAuth<Service[]>(`${process.env.CONTRACT_API_URL}/transportation/expired`, session.accessToken),
      fetchWithAuth<Service[]>(`${process.env.CONTRACT_API_URL}/transportation/expiring?days=7`, session.accessToken),
    ]);

    return <Dashboard_Page name={session?.user.username} service_expired={service_expired} service_expiring={service_expiring} general_expired={general_expired} general_expiring={general_expiring} lease_expired={lease_expired} lease_expiring={lease_expiring} insurance_expired={insurance_expired} insurance_expiring={insurance_expiring} transportation_expired={transportation_expired} transportation_expiring={transportation_expiring} />

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