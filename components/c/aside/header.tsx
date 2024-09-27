import {CAsideSearch} from "@/components/c/aside/search";
import {CAsideBurger} from "@/components/c/aside/burger";

export const CAsideHeader = () => {
			return (
									<div className="w-full flex flex-row justify-between items-center gap-2 py-2 px-2">
												<CAsideBurger/>
												<CAsideSearch/>
									</div>
			);
};
