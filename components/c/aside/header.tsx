// components/c/aside/header.tsx

"use client";

import React from "react";

import { CAsideBurger } from "@/components/c/aside/burger";
import { CAsideSearch } from "@/components/c/aside/search";

interface CAsideHeaderProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  setSearchResults: (results: any[]) => void;
}

export const CAsideHeader: React.FC<CAsideHeaderProps> = ({
  searchTerm,
  setSearchTerm,
  setSearchResults,
}) => {
  return (
    <div className="w-full flex flex-row justify-between items-center gap-2 py-2 px-2">
      <CAsideBurger />
      <CAsideSearch
        searchTerm={searchTerm}
        setSearchResults={setSearchResults}
        setSearchTerm={setSearchTerm}
      />
    </div>
  );
};
