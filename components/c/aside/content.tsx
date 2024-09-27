"use client";

import { useState } from "react";
import { CAsideConversation } from "@/components/c/aside/conversation";

export const CAsideContent: React.FC = () => {
			// The activeIndex state will either be a number or null (for no active conversation)
			const [activeIndex, setActiveIndex] = useState<number | null>(null);

			// TypeScript will infer that index is a number here
			const handleClick = (index: number) => {
						setActiveIndex(index); // Set the clicked conversation as active
			};

			return (
									<div className="w-full max-w-full flex flex-col items-center py-2 px-2 overflow-y-auto">
												{[...Array(15)].map((_, index: number) => (
																		<CAsideConversation
																								key={index}
																								active={activeIndex === index} // Check if this conversation is active
																								onClick={() => handleClick(index)} // Set this conversation as active on click
																		/>
												))}
									</div>
			);
};
