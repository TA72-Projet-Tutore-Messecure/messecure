"use client";

import { Avatar } from "@nextui-org/react";
import Ripples from 'react-ripples';
import { FC } from "react";
import {IUser} from "@/entities/IUser";

// Define the prop types for CAsideConversation
interface CAsideConversationProps {
			user: IUser;
			active: boolean;
			onClick: () => void;
}

export const CAsideConversation: FC<CAsideConversationProps> = ({ user, active, onClick }) => {
			return (
									// @ts-ignore
									<Ripples
															during={1400}
															color={"rgba(0, 0, 0, 0.1)"}
															onClick={onClick}
															className={`w-full max-w-sm py-2 px-3 flex flex-row gap-3 items-center rounded-xl cursor-pointer flex-shrink-0
               ${active ? 'bg-[#3390ec] dark:bg-[#8472dc]' : 'hover:bg-[#f4f4f5] dark:hover:bg-[#2c2c2c]'}`}>
												<Avatar src={user.avatarUrl} className="w-14 h-14 min-w-14 min-h-14 text-small" />
												<div className="flex flex-col justify-between items-start w-full max-w-[17vw]">
															<div className="w-full flex flex-row items-center justify-between">
																		<span className={`text-sm font-bold truncate ${active ? "text-white" : "dark:text-white"}`}>Madoc Lefèvre</span>
																		<span className={`text-xs ${active ? "text-white" : "dark:text-white/30"}`}>12:00</span>
															</div>
															<span className={`truncate w-full overflow-hidden text-ellipsis ${active ? "text-white" : "text-default-500 dark:text-default-500"}`}>
						          lorem ipsum nadla zoris kalem protis harum tantalum gravitum
						        </span>
												</div>
									</Ripples>
			);
};
