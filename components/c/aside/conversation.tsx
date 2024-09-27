"use client";

import { Avatar } from "@nextui-org/react";
import Ripples from 'react-ripples';
import { FC } from "react";

// Define the prop types for CAsideConversation
interface CAsideConversationProps {
			active: boolean;
			onClick: () => void;
}

export const CAsideConversation: FC<CAsideConversationProps> = ({ active, onClick }) => {
			return (
									<Ripples
															during={1400}
															color={"rgba(0, 0, 0, 0.1)"}
															onClick={onClick}
															className={`w-full max-w-sm py-2 px-3 flex flex-row gap-2 items-center rounded-xl cursor-pointer flex-shrink-0
               ${active ? 'bg-[#8472dc]' : 'hover:bg-[#2c2c2c]'}`} placeholder={undefined} onPointerEnterCapture={undefined}
															onPointerLeaveCapture={undefined}									>
												<Avatar src="https://i.pravatar.cc/150?u=a042581f4e29026024d" className="w-14 h-14 min-w-14 min-h-14 text-small" />
												<div className="flex flex-col justify-between items-start w-full max-w-[18vw]">
															<div className="w-full flex flex-row items-center justify-between">
																		<span className="text-sm font-bold truncate">Madoc Lefèvre</span>
																		<span className="text-xs text-white/60">12:00</span>
															</div>
															<span className="truncate w-full overflow-hidden text-ellipsis">
						          lorem ipsum nadla zoris kalem protis harum tantalum gravitum
						        </span>
												</div>
									</Ripples>
			);
};
