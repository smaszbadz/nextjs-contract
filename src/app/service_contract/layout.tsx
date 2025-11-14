import { authOptions } from '@/app/authOptions';
import { getServerSession } from "next-auth";
import { fetchProfileImage } from '@/lib/api';
import LayoutWrapper from '@/components/LayoutWrapper';

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);
  const profileImage = await fetchProfileImage() as string | null | undefined;

  return (
    <LayoutWrapper
      profileImage={profileImage}
      username={session?.user.username}
    >
      {children}
    </LayoutWrapper>
  );
}