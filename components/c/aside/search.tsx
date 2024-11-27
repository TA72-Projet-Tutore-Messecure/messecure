// components/c/aside/search.tsx

"use client";

import React, { useEffect } from "react";
import { Input } from "@nextui-org/input";
import { toast } from "react-hot-toast";

import { SearchIcon } from "@/components/icons";
import MatrixService from "@/services/MatrixService";

interface CAsideSearchProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  setSearchResults: (results: any[]) => void;
}

export const CAsideSearch: React.FC<CAsideSearchProps> = ({
  searchTerm,
  setSearchTerm,
  setSearchResults,
}) => {
  useEffect(() => {
    const handleSearch = async () => {
      if (searchTerm.trim() !== "") {
        try {
          const users = await MatrixService.searchUsers(searchTerm.trim());

          setSearchResults(users);
        } catch (error: any) {
          toast.error(error.message);
        }
      } else {
        setSearchResults([]);
      }
    };

    handleSearch();
  }, [searchTerm, setSearchResults]);

  return (
    <div className="relative">
      <Input
        isClearable
        classNames={{
          label: "text-black/50 dark:text-white/90",
          input: [
            "bg-transparent",
            "text-black/90 dark:text-white/90",
            "placeholder:text-default-700/50 dark:placeholder:text-white/30",
          ],
          innerWrapper: "bg-transparent",
          inputWrapper: [
            "bg-[#f4f4f5] dark:bg-[#2c2c2c]",
            "group-focus-within:ring-1",
            "group-focus-within:ring-[#3390ec] dark:group-focus-within:ring-[#8472dc]",
            "group-focus-within:border-[#3390ec] dark:group-focus-within:border-[#8472dc]",
            "border border-transparent",
            "transition-all",
          ],
        }}
        placeholder="Search"
        radius="full"
        size="lg"
        startContent={
          <SearchIcon className="!w-[1.3em] !h-[1.3em] mb-0.5 mr-2.5 text-default-700/50 dark:text-white/30 text-slate-400 pointer-events-none flex-shrink-0 group-focus-within:text-[#3390ec] dark:group-focus-within:text-[#8472dc]" />
        }
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onClear={() => {
          setSearchTerm("");
          setSearchResults([]);
        }}
      />
    </div>
  );
};
