import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "QuickCal - The Calendar With Attitude",
    template: "%s | QuickCal",
  },
  description: "A brutalist AI-powered calendar app that's painfully honest about your schedule.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={spaceGrotesk.variable}>
      <body>
        {children}
        <Toaster position="top-right" toastOptions={{
          style: {
            border: "2px solid black",
            boxShadow: "4px 4px 0px 0px rgba(0,0,0,1)",
            borderRadius: "0px",
            background: "white",
            color: "black",
            fontWeight: "bold",
          }
        }} />
      </body>
    </html>
  );
}