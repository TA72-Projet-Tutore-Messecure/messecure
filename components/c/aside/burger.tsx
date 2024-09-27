"use client";
import { Dropdown, DropdownItem, DropdownMenu, DropdownSection, DropdownTrigger } from "@nextui-org/react";
import { Button } from "@nextui-org/button";
import {
			BurgerIcon,
			MoonFilledIcon,
			SunFilledIcon,
} from "@/components/icons";
import { SettingsIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { useIsSSR } from "@react-aria/ssr";

export const CAsideBurger = () => {
			const { theme, setTheme } = useTheme();
			const isSSR = useIsSSR();

			const onChange = () => {
						theme === "light" ? setTheme("dark") : setTheme("light");
			};

			return (
									<Dropdown
															classNames={{
																		base: "before:bg-default-200", // change arrow background
																		content: "py-1 px-1 backdrop-blur-md bg-opacity-80", // change dropdown content
															}}
									>
												<DropdownTrigger>
															<Button variant="light" isIconOnly radius="full">
																		<BurgerIcon className="w-[1.7em] h-[1.7em] dark:stroke-[#aaaaaa] dark:text-[#aaaaaa] stroke-[#707579] text-[#707579]" />
															</Button>
												</DropdownTrigger>
												<DropdownMenu disabledKeys={["version"]} variant="faded" aria-label="Dropdown menu with description">
															<DropdownSection>
																		<DropdownItem
																								key="settings"
																								startContent={<SettingsIcon className="w-[1.5em] h-[1.5em]" />}
																		>
																					Settings
																		</DropdownItem>
																		<DropdownItem
																								key="theme-toggle"
																								startContent={theme === "light" || isSSR ? <MoonFilledIcon className="w-[1.5em] h-[1.5em]" /> : <SunFilledIcon className="w-[1.5em] h-[1.5em]" />}
																								onClick={onChange}
																		>
																					{theme === "light" || isSSR ? "Change to dark mode" : "Change to light mode"}
																		</DropdownItem>
															</DropdownSection>
															<DropdownSection className="m-0">
																		<DropdownItem key="version" isReadOnly className="text-center text-xs text-default-900 p-0">
																					Test
																		</DropdownItem>
															</DropdownSection>
												</DropdownMenu>
									</Dropdown>
			);
};
