// components/c/aside/index.tsx

"use client";

import React, { useState, useEffect } from "react";
import { CAsideHeader } from "@/components/c/aside/header";
import { CAsideContent } from "@/components/c/aside/content";
import MatrixService from "@/services/MatrixService";

export const CAside = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  // useEffect(() => {
  //   // Enable auto-join if desired
  //   // MatrixService.enableAutoJoin();
  // }, []);

  return (
    <aside className="w-[33vw] z-50 max-w-[33vw] h-full bg-[#ffffff] dark:bg-[#212121] shadow flex flex-col items-center border-r-2 border-[#d5dad8] dark:border-[#2b2b2b]">
      <CAsideHeader
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        // @ts-ignore
        setSearchResults={setSearchResults}
      />
      <CAsideContent
        searchTerm={searchTerm}
        searchResults={searchResults}
        setSearchTerm={setSearchTerm}
      />
    </aside>
  );
};
