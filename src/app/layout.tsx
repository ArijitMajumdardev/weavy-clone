import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";
import { TRPCProvider } from "@/lib/trpc/Provider";
import {
  ClerkProvider,
} from '@clerk/nextjs'

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});



export const metadata: Metadata = {
  title: "Weavy.ai Clone - LLM Workflow Builder",
  description: "Build and execute LLM workflows with visual node editor",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body
          className={`${dmSans.className} antialiased`}
        >
          <TRPCProvider>{children}</TRPCProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
