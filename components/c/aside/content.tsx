"use client";

import { useState } from "react";
import { CAsideConversation } from "@/components/c/aside/conversation";
import { createRandomUsers } from "@/services/UserService";

export const CAsideContent: React.FC = () => {
			// The activeIndex state will either be a number or null (for no active conversation)
			const [activeIndex, setActiveIndex] = useState<number | null>(null);

			// Generate users only once using useState
			const [users] = useState(() => createRandomUsers(200));

			// TypeScript will infer that index is a number here
			const handleClick = (index: number) => {
						setActiveIndex(index); // Set the clicked conversation as active
			};

			return (
									<div className="w-full max-w-full flex flex-col items-center py-2 px-2 overflow-y-auto">
												{users.map((user, index: number) => (
																		<CAsideConversation
																								user={user}
																								key={index}
																								active={activeIndex === index} // Check if this conversation is active
																								onClick={() => handleClick(index)} // Set this conversation as active on click
																		/>
												))}
									</div>
			);
};
