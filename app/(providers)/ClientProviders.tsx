// app/ClientProviders.tsx

"use client";

import React from "react";
import { Providers } from "@/app/(providers)/providers"; // If this is a client component
import { MatrixProvider } from "@/context/MatrixContext";

// @ts-ignore
export function ClientProviders({ children }) {
  return (
    <Providers themeProps={{ attribute: "class", defaultTheme: "dark" }}>
      <MatrixProvider>
        {children}
      </MatrixProvider>
    </Providers>
  );
}
