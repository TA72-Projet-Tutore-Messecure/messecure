// components/c/content/header/DotDropdown.tsx

"use client";
import React from "react";
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownSection,
  DropdownTrigger,
} from "@nextui-org/react";
import { Button } from "@nextui-org/button";
import { FaTrash } from "react-icons/fa";
import { toast } from "react-hot-toast";

import { VerticalDotsIcon } from "@/components/icons";
import MatrixService from "@/services/MatrixService";
import { useMatrix } from "@/context/MatrixContext";

export const DotDropdown = () => {
  const { selectedRoom } = useMatrix();

  const deleteRoom = async () => {
    if (!selectedRoom) {
      toast.error("No room selected");

      return;
    }

    try {
      await MatrixService.deleteRoom(selectedRoom.roomId);

      window.location.reload();
    } catch (error) {
      toast.error("Failed to delete room");
    }
  };

  return (
    <Dropdown>
      <DropdownTrigger>
        <Button isIconOnly radius="full" variant="light">
          <VerticalDotsIcon className="w-6 h-6 cursor-pointer" />
        </Button>
      </DropdownTrigger>
      <DropdownMenu aria-label="Room actions menu" variant="faded">
        <DropdownSection title="Room actions">
          <DropdownItem
            key="delete"
            className="text-[#F31260]"
            color="danger"
            startContent={<FaTrash className="w-[1.5em] h-[1.5em]" />}
            variant="faded"
            onClick={deleteRoom}
          >
            Delete Room
          </DropdownItem>
        </DropdownSection>
      </DropdownMenu>
    </Dropdown>
  );
};
