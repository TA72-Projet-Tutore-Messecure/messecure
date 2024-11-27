// components/c/aside/header.tsx

"use client";

import React, { useState } from "react";
import { Button } from "@nextui-org/button";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@nextui-org/react";
import { Input } from "@nextui-org/input";

import { CAsideBurger } from "@/components/c/aside/burger";
import { CAsideSearch } from "@/components/c/aside/search";
import MatrixService from "@/services/MatrixService";
import { useMatrix } from "@/context/MatrixContext";

interface CAsideHeaderProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  setSearchResults: (results: any[]) => void;
}

export const CAsideHeader: React.FC<CAsideHeaderProps> = ({
  searchTerm,
  setSearchTerm,
  setSearchResults,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [roomName, setRoomName] = useState("");
  const { refreshRooms, selectRoom } = useMatrix();

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

  return (
    <>
      <div className="w-full flex flex-row justify-between items-center gap-2 py-2 px-2">
        <CAsideBurger />
        <CAsideSearch
          searchTerm={searchTerm}
          setSearchResults={setSearchResults}
          setSearchTerm={setSearchTerm}
        />
        <Button
          className="bg-green-500 text-white"
          onClick={() => setIsModalOpen(true)}
        >
          Create Room
        </Button>
      </div>

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
