"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function Chat() {
			const { theme } = useTheme();
			const [mounted, setMounted] = useState(false);

			useEffect(() => {
						setMounted(true);
			}, []);

			if (!mounted) return null; // Ensures proper client-side rendering

			const isDarkTheme = theme === "dark";

			return (
									<section
															className="h-full relative flex flex-col items-center justify-center gap-4 py-8 md:py-10 text-black dark:text-white"
															style={{
																		backgroundImage: isDarkTheme
																								? 'url("/chat-background.svg")'
																								: 'url("/chat-background.svg"), linear-gradient(to bottom left, rgba(217, 249, 157, 0.8), rgba(52, 211, 153, 0.8), rgba(22, 163, 74, 0.8))',
																		filter: isDarkTheme ? "invert(1)" : "none",
															}}
									>
												TOTO
									</section>
			);
}
