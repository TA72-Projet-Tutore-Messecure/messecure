"use client";

export default function Chat() {
			return (
									<section className="h-full relative flex flex-col items-center justify-center gap-4 py-8 md:py-10 text-black dark:text-white">
												<style jsx>{`
                section {
                    background-image: url("/chat-background.svg"), linear-gradient(to bottom left, rgba(217, 249, 157, 0.8), rgba(52, 211, 153, 0.8), rgba(22, 163, 74, 0.8)) !important;
                }
                @media (prefers-color-scheme: dark) {
                    section {
                        background-image: url("/chat-background.svg"), linear-gradient(#F0F0F0, #F0F0F0) !important;
                        filter: invert(1);
                    }
                }
												`}</style>
												TOTO
									</section>
			);
}
