import { CAsideHeader } from "@/components/c/aside/header";
import { CAsideContent } from "@/components/c/aside/content";

export const CAside = () => {
  return (
    <aside className="w-[33vw] max-w-[33vw] h-full bg-[#ffffff] dark:bg-[#212121] shadow flex flex-col items-center border-r-2 border-[#d5dad8] dark:border-[#2b2b2b]">
      <CAsideHeader />
      <CAsideContent />
    </aside>
  );
};
