// components/c/aside/burger.tsx

"use client";

import React, { useState } from "react";
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownSection,
  DropdownTrigger,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@nextui-org/react";
import { Button } from "@nextui-org/button";
import { LogOutIcon, SettingsIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { useIsSSR } from "@react-aria/ssr";
import { useRouter } from "next/navigation";
import { Input } from "@nextui-org/input";
import { FaPeopleGroup } from "react-icons/fa6";

import { BurgerIcon, MoonFilledIcon, SunFilledIcon } from "@/components/icons";
import MatrixService from "@/services/MatrixService";
import { useMatrix } from "@/context/MatrixContext";

export const CAsideBurger = () => {
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const isSSR = useIsSSR();

  const { refreshRooms, selectRoom } = useMatrix();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [roomName, setRoomName] = useState("");

  const handleCreateRoom = async () => {
    if (roomName.trim() !== "") {
      try {
        const roomId = await MatrixService.createRoom(roomName.trim());

        setIsModalOpen(false);
        setRoomName("");
        await refreshRooms();
        selectRoom(roomId); // Automatically select the new room
      } catch (error) {
        alert("Failed to create room");
      }
    }
  };

  const onChange = () => {
    theme === "light" ? setTheme("dark") : setTheme("light");
  };

  const logout = () => {
    MatrixService.logout();
    router.push("/");
  };

  return (
    <>
      <Dropdown
        classNames={{
          base: "before:bg-default-200", // change arrow background
          content: "py-1 px-1 backdrop-blur-md bg-opacity-80", // change dropdown content
        }}
      >
        <DropdownTrigger>
          <Button isIconOnly radius="full" variant="light">
            <BurgerIcon className="w-[1.7em] h-[1.7em] dark:stroke-[#aaaaaa] dark:text-[#aaaaaa] stroke-[#707579] text-[#707579]" />
          </Button>
        </DropdownTrigger>
        <DropdownMenu
          aria-label="Dropdown menu with description"
          disabledKeys={["version"]}
          variant="faded"
        >
          <DropdownSection showDivider title="Room">
            <DropdownItem
              key="create-room"
              startContent={<FaPeopleGroup className="w-[1.5em] h-[1.5em]" />}
              onClick={() => setIsModalOpen(true)}
            >
              Create Room
            </DropdownItem>
          </DropdownSection>
          <DropdownSection showDivider title="Account">
            <DropdownItem
              key="settings"
              startContent={<SettingsIcon className="w-[1.5em] h-[1.5em]" />}
              onClick={() => router.push("/settings")}
            >
              Settings
            </DropdownItem>
            <DropdownItem
              key="theme-toggle"
              startContent={
                theme === "light" || isSSR ? (
                  <MoonFilledIcon className="w-[1.5em] h-[1.5em]" />
                ) : (
                  <SunFilledIcon className="w-[1.5em] h-[1.5em]" />
                )
              }
              onClick={onChange}
            >
              {theme === "light" || isSSR ? "Dark mode" : "Light mode"}
            </DropdownItem>
            <DropdownItem
              key="logout"
              startContent={<LogOutIcon className="w-[1.5em] h-[1.5em]" />}
              onClick={logout}
            >
              Logout
            </DropdownItem>
          </DropdownSection>
          <DropdownSection className="m-0">
            <DropdownItem
              key="version"
              isReadOnly
              className="text-center text-xs text-default-900 p-0"
            >
              Messecure v1.0.0
            </DropdownItem>
          </DropdownSection>
        </DropdownMenu>
      </Dropdown>

      {/* Create Room Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <ModalContent>
          <ModalHeader>Create New Room</ModalHeader>
          <ModalBody>
            <Input
              fullWidth
              label="Room Name"
              placeholder="Enter room name"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
            />
          </ModalBody>
          <ModalFooter>
            <Button
              color="default"
              variant="light"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button color="primary" onClick={handleCreateRoom}>
              Create
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};
