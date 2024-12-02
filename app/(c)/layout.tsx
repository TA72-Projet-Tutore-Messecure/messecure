import "@/styles/globals.css";
import { Metadata, Viewport } from "next";
import clsx from "clsx";
import React from "react";

import { siteConfig } from "@/config/site";
import { fontSans } from "@/config/fonts";
import { CAside } from "@/components/c/aside/aside";
import { ClientProviders } from "@/app/(providers)/ClientProviders";
import AuthGuard from "@/guard/AuthGuard";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s - ${siteConfig.name}`,
  },
  description: siteConfig.description,
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning lang="en">
      <head>
        {/* Other head elements */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if (typeof global === 'undefined') {
                var global = window;
              }
            `,
          }}
        />
      </head>
      <body
        className={clsx(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable,
        )}
      >
      <div>
        <Toaster position="bottom-right" reverseOrder={false} />
      </div>
      <AuthGuard>
        <ClientProviders>
          <div className="relative flex flex-row h-screen">
            <CAside />
            <main className="container w-full">{children}</main>
          </div>
        </ClientProviders>
      </AuthGuard>
      </body>
    </html>
  );
}
