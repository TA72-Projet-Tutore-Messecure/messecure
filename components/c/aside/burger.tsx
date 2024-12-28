// components/c/aside/burger.tsx

"use client";

import React, { useState } from "react";
import { toast } from "react-hot-toast";
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
import { FaPeopleGroup, FaEye, FaEyeSlash } from "react-icons/fa6";

import { BurgerIcon, MoonFilledIcon, SunFilledIcon } from "@/components/icons";
import MatrixService from "@/services/MatrixService";
import { useMatrix } from "@/context/MatrixContext";

import AvatarSettings from "../content/AvatarSettings";

interface SettingsInfo {
  oldPassword: string;
  newPassword: string;
  avatar: File | null;
  displayName: string;
}

export const CAsideBurger = () => {
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const isSSR = useIsSSR();

  const { refreshRooms, selectRoom } = useMatrix();

  const [isCreateRoomModalOpen, setIsCreateRoomModalOpen] = useState(false);
  const [isChgPwdModalOpen, setIsChgPwdModalOpen] = useState(false);
  const [isChgAvatarAndNameModalOpen, setIsChgAvatarAndNameModalOpen] = useState(false);

  const [isOldPwdVisible, setIsOldPwdVisible] = useState(false);
  const [isNewPwdVisible, setIsNewPwdVisible] = useState(false);
  const [settingsInfo, setSettingsInfo] = useState<SettingsInfo>({
    oldPassword: "",
    newPassword: "",
    avatar: null,
    displayName: "",
  });

  const toggleOldPwdVisibility = () => setIsOldPwdVisible(!isOldPwdVisible);
  const toggleNewPwdVisibility = () => setIsNewPwdVisible(!isNewPwdVisible);

  const [roomName, setRoomName] = useState("");

  const handleCreateRoom = async () => {
    if (roomName.trim() !== "") {
      try {
        const roomId = await MatrixService.createRoom(roomName.trim());

        setIsCreateRoomModalOpen(false);
        setRoomName("");
        await refreshRooms();
        selectRoom(roomId); // Automatically select the new room
      } catch (error) {
        alert("Failed to create room");
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSettingsInfo({
      ...settingsInfo,
      [e.target.name]: e.target.value,
    });
  };

  const handleImageUpload = (file: File | null) => {
    setSettingsInfo({
      ...settingsInfo,
      avatar: file,
    });
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await MatrixService.changePassword(
        settingsInfo.oldPassword,
        settingsInfo.newPassword,
      );
      toast.success("Password change successful!");
      MatrixService.logout();
      router.push("/login"); // Redirect to login page after changing password
    } catch (error: any) {
      toast.error(error.message || "Password change failed. Please try again.");
    }
  };

  const handleChangeAvatar = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (settingsInfo.avatar) {
        await MatrixService.changeAvatar(settingsInfo.avatar);
        toast.success("Avatar change successful!");
      } else {
        toast.error("Please select an avatar to upload.");
      }
    } catch (error: any) {
      toast.error(error.message || "Avatar change failed. Please try again.");
    }
  };

  const handleChgDisplayName = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await MatrixService.changeDisplayName(settingsInfo.displayName);
      toast.success("Display name change successful!");
    } catch (error: any) {
      toast.error(
        error.message || "Display name change failed. Please try again.",
      );
    }
  };

  const isValidPassword = (password: string) => {
    return password.trim().length > 0;
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
              onClick={() => setIsCreateRoomModalOpen(true)}
            >
              Create Room
            </DropdownItem>
          </DropdownSection>
          <DropdownSection showDivider title="User Settings">
            <DropdownItem
              key="change-password"
              startContent={<SettingsIcon className="w-[1.5em] h-[1.5em]" />}
              onClick={() => setIsChgPwdModalOpen(true)}
            >
              Change Password
            </DropdownItem>
            <DropdownItem
              key="change-avatar"
              startContent={<SettingsIcon className="w-[1.5em] h-[1.5em]" />}
              onClick={() => setIsChgAvatarAndNameModalOpen(true)}
            >
              Change Avatar & Display Name
            </DropdownItem>
          </DropdownSection>
          <DropdownSection showDivider title="Account">
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
      <Modal isOpen={isCreateRoomModalOpen} onClose={() => setIsCreateRoomModalOpen(false)}>
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
              onClick={() => setIsCreateRoomModalOpen(false)}
            >
              Cancel
            </Button>
            <Button color="primary" onClick={handleCreateRoom}>
              Create
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Change Password Modal */}
      <Modal isOpen={isChgPwdModalOpen} onClose={() => setIsChgPwdModalOpen(false)}>
        <ModalContent>
          <ModalHeader>Change Password</ModalHeader>
          <ModalBody>
            <Input
              isRequired
              endContent={
                <button
                  aria-label="toggle password visibility"
                  className="focus:outline-none"
                  type="button"
                  onClick={toggleOldPwdVisibility}
                >
                  {isOldPwdVisible ? (
                    <FaEyeSlash className="text-2xl text-default-400 pointer-events-none" />
                  ) : (
                    <FaEye className="text-2xl text-default-400 pointer-events-none" />
                  )}
                </button>
              }
              label="Password"
              name="oldPassword"
              placeholder="Enter your password"
              size="sm"
              type={isOldPwdVisible ? "text" : "password"}
              value={settingsInfo.oldPassword}
              onChange={handleChange}
            />
            <Input
              isRequired
              endContent={
                <button
                  aria-label="toggle password visibility"
                  className="focus:outline-none"
                  type="button"
                  onClick={toggleNewPwdVisibility}
                >
                  {isNewPwdVisible ? (
                    <FaEyeSlash className="text-2xl text-default-400 pointer-events-none" />
                  ) : (
                    <FaEye className="text-2xl text-default-400 pointer-events-none" />
                  )}
                </button>
              }
              label="New Password"
              name="newPassword"
              placeholder="Enter your new password"
              size="sm"
              type={isNewPwdVisible ? "text" : "password"}
              value={settingsInfo.newPassword}
              onChange={handleChange}
            />
          </ModalBody>
          <ModalFooter>
            <Button
              color="default"
              variant="light"
              onClick={() => setIsChgPwdModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              color="primary"
              onClick={handleChangePassword}
              isDisabled={
                !isValidPassword(settingsInfo.oldPassword) ||
                !isValidPassword(settingsInfo.newPassword) ||
                settingsInfo.oldPassword == settingsInfo.newPassword
              }
            >
              Change Password
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Change Avatar and Display Name Modal */}
      <Modal isOpen={isChgAvatarAndNameModalOpen} onClose={() => setIsChgAvatarAndNameModalOpen(false)}>
        <ModalContent>
          <ModalHeader>Change Avatar & Display Name</ModalHeader>
          <ModalBody>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ flexShrink: 0 }}>
                <AvatarSettings onImageUpload={handleImageUpload} />
              </div>
              <Input
                isRequired
                label="Display Name"
                name="displayName"
                placeholder="Enter your new display name"
                size="sm"
                value={settingsInfo.displayName}
                onChange={handleChange}
              />
            </div>
          </ModalBody>
          <ModalFooter>
            <Button
              color="default"
              variant="light"
              onClick={() => setIsChgAvatarAndNameModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              color="primary"
              onClick={handleChangeAvatar}
              isDisabled={!settingsInfo.avatar}
            >
              Change Avatar
            </Button>
            <Button
              color="primary"
              onClick={handleChgDisplayName}
              isDisabled={!settingsInfo.displayName.trim()}
            >
              Change Display Name
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};
