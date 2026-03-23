import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/sonner";
import { ClerkProvider } from "@clerk/nextjs";
import { generateOgMetadata } from "@/lib/metadata";
import { PostHogProvider, PostHogIdentify } from "@/lib/posthog";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  ...generateOgMetadata({
    title: "CastDeck — Practice Your Pitch Against AI Investors",
    description:
      "Upload your pitch deck. Hear it narrated in your voice. Get grilled by 8 distinct AI investor personas. Walk into the real meeting prepared.",
    path: "/",
  }),
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  ),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" className="dark">
        <body
          className={cn(
            "min-h-screen bg-background font-sans antialiased",
            inter.variable
          )}
        >
          {/* <PostHogProvider> */}
          <PostHogIdentify />
          {children}
          <Toaster />
          {/* </PostHogProvider> */}
        </body>
      </html>
    </ClerkProvider>
  );
}
