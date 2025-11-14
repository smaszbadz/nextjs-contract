import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "./authOptions";
import LoginPage from "./login/LoginPage";

export default async function Index() {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect("/dashboard");
  } else {
    return (
      <LoginPage />
    );
  }
}