import type { Metadata } from "next";
import { Montserrat, Sarabun } from "next/font/google";
import "./globals.css";
import { NextAuthProvider } from "./providers";
import { AntdRegistry } from '@ant-design/nextjs-registry'


// โหลดฟอนต์ Sarabun
const sarabun = Sarabun({
  variable: "--font-sarabun",
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500", "600", "700", "800"], // กำหนดน้ำหนักตัวหนังสือ
});


// โหลดฟอนต์ Montserrat
const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"], // กำหนดน้ำหนักตัวหนังสือตามที่ต้องการ
});

export const metadata: Metadata = {
  title: "Contract System",
  description: "Samart Panwan",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {


  return (
    <html lang="en">
      <body
        className={`${sarabun.variable}  ${montserrat.variable} antialiased`}
      >
        <NextAuthProvider>
          <AntdRegistry>{children}</AntdRegistry>
        </NextAuthProvider>
      </body>
    </html>
  );
}
