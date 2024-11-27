// components/c/aside/index.tsx

"use client";

import React, { useState } from "react";

import { CAsideHeader } from "@/components/c/aside/header";
import { CAsideContent } from "@/components/c/aside/content";

export const CAside = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  return (
    <aside className="w-[33vw] z-50 max-w-[33vw] h-full bg-[#ffffff] dark:bg-[#212121] shadow flex flex-col items-center border-r-2 border-[#d5dad8] dark:border-[#2b2b2b]">
      <CAsideHeader
        searchTerm={searchTerm}
        // @ts-ignore
        setSearchResults={setSearchResults}
        setSearchTerm={setSearchTerm}
      />
      <CAsideContent
        searchResults={searchResults}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
      />
    </aside>
  );
};
