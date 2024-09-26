import "@/styles/globals.css";
import { Metadata, Viewport } from "next";
import clsx from "clsx";
import { siteConfig } from "@/config/site";
import { fontSans } from "@/config/fonts";
import React from "react";
import {Providers} from "@/app/providers";
import {CAside} from "@/components/c/aside/aside";

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
         <head />
         <body
               className={clsx(
                     "min-h-screen bg-background font-sans antialiased",
                     fontSans.variable,
               )}
         >
         <Providers themeProps={{ attribute: "class", defaultTheme: "dark" }}>
            <div className="relative flex flex-row h-screen">
               <CAside/>
               <main className="container w-full">
                  {children}
               </main>
            </div>
         </Providers>
         </body>
         </html>
   );
}