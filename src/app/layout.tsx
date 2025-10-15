
import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { FirebaseClientProvider } from "@/firebase/client-provider";
import { OdysseyLayout } from "@/components/layout/odyssey-layout";
import { OdysseyHeader } from "@/components/layout/odyssey-header";
import { Chatbot } from "@/components/chatbot/chatbot";

export const metadata: Metadata = {
  title: "TribeXeSports",
  description: "The future of eSports is here.",
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
    <html lang="en" className="dark">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased bg-[#0a0a0a] min-h-screen flex flex-col">
        <FirebaseClientProvider>
          <OdysseyLayout>
            <OdysseyHeader />
            {children}
            <Chatbot />
          </OdysseyLayout>
          <Toaster />
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
