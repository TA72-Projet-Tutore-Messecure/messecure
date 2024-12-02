// components/c/content/header/DotDropdown.tsx

"use client";

import React, { useState, useEffect } from "react";
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
  Chip,
  Tooltip,
} from "@nextui-org/react";
import { Button } from "@nextui-org/button";
import {
  FaTrash,
  FaPaperPlane,
  FaTimes,
  FaUserPlus,
  FaUsers,
} from "react-icons/fa";
import { Input } from "@nextui-org/input";
import { toast } from "react-hot-toast";

import { VerticalDotsIcon } from "@/components/icons";
import MatrixService from "@/services/MatrixService";
import { useMatrix } from "@/context/MatrixContext";

export const DotDropdown = () => {
  const { selectedRoom, refreshRooms } = useMatrix();

  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [isMembersModalOpen, setIsMembersModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<
    { user_id: string; display_name: string }[]
  >([]);
  const [roomMembers, setRoomMembers] = useState<
    {
      userId: string;
      displayName: string;
      membership: string;
      isOwner: boolean;
    }[]
  >([]);

  const client = MatrixService.getClient();
  const myUserId = client.getUserId();
  const [isCurrentUserOwner, setIsCurrentUserOwner] = useState(false);

  if (!selectedRoom) {
    return null;
  }

  // Determine if it's a group room
  const totalMembers = selectedRoom
    .getMembers()
    // @ts-ignore
    .filter((member) => ["join", "invite"].includes(member.membership)).length;
  const isGroupRoom = totalMembers > 2;

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

  // Effect hook for searching users
  useEffect(() => {
    const searchUsers = async () => {
      if (searchTerm.trim() === "") {
        setSearchResults([]);
        return;
      }
      try {
        const results = await MatrixService.searchUsers(searchTerm);
        // Exclude users already in the room or invited
        const roomMembersIds =
          selectedRoom?.getMembers()
            // @ts-ignore
            .filter((member) => ["join", "invite"].includes(member.membership))
            .map((member) => member.userId) || [];

        const filteredResults = results.filter(
          (user) => !roomMembersIds.includes(user.user_id)
        );

        setSearchResults(filteredResults);
      } catch (error) {
        console.error("Error searching users:", error);
      }
    };

    // Only search if a room is selected
    if (selectedRoom) {
      searchUsers();
    }
  }, [searchTerm, selectedRoom]);

  // Function to invite user
  const handleAddUser = async (userId: string) => {
    try {
      await MatrixService.inviteUserToRoom(selectedRoom!.roomId, userId);
      toast.success(`User ${userId} invited to the room`);
      setSearchTerm(""); // Clear search term after inviting
      setSearchResults((prevResults) =>
        prevResults.filter((user) => user.user_id !== userId)
      );
      await refreshRooms(); // Refresh rooms to update members

      // Update the roomMembers state immediately
      setRoomMembers((prevMembers) => [
        ...prevMembers,
        {
          userId: userId,
          displayName: userId, // You may fetch the actual display name if needed
          membership: "invite",
          isOwner: false,
        },
      ]);
    } catch (error) {
      console.error("Error inviting user:", error);
      toast.error("Failed to invite user");
    }
  };

  // Function to cancel invitation
  const handleCancelInvitation = async (userId: string) => {
    try {
      await MatrixService.kickUserFromRoom(
        selectedRoom!.roomId,
        userId,
        "Invitation cancelled by owner"
      );
      toast.success(`Invitation to ${userId} cancelled`);

      // Update the roomMembers state immediately
      setRoomMembers((prevMembers) =>
        prevMembers.filter((member) => member.userId !== userId)
      );
    } catch (error) {
      console.error("Error cancelling invitation:", error);
      toast.error("Failed to cancel invitation");
    }
  };

  // Function to get room members and their statuses
  const fetchRoomMembers = () => {
    if (!selectedRoom) {
      setRoomMembers([]);
      return;
    }

    const members = selectedRoom.getMembers();

    // Get room creator
    const createEvent = selectedRoom.currentState.getStateEvents(
      "m.room.create",
      ""
    );
    const roomCreator = createEvent?.getContent()?.creator;

    setIsCurrentUserOwner(myUserId === roomCreator);

    // Map members to include status and owner info
    const membersData = members
      .map((member) => {
        const isOwner = member.userId === roomCreator;
        return {
          userId: member.userId,
          displayName: member.name || member.userId,
          membership: member.membership, // 'join', 'invite', etc.
          isOwner: isOwner,
        };
      })
      // Optionally filter out users with 'leave' membership
      .filter((member) => member.membership !== "leave");

    // Sort members: owner first, then alphabetically
    membersData.sort((a, b) => {
      if (a.isOwner && !b.isOwner) return -1;
      if (!a.isOwner && b.isOwner) return 1;
      return a.displayName.localeCompare(b.displayName);
    });
    // @ts-ignore
    setRoomMembers(membersData);
  };

  // Fetch room members when the modal is opened
  useEffect(() => {
    if (isMembersModalOpen && selectedRoom) {
      fetchRoomMembers();
    }
  }, [isMembersModalOpen, selectedRoom]);

  return (
    <>
      <Dropdown>
        <DropdownTrigger>
          <Button isIconOnly radius="full" variant="light">
            <VerticalDotsIcon className="w-6 h-6 cursor-pointer" />
          </Button>
        </DropdownTrigger>
        <DropdownMenu aria-label="Room actions menu" variant="faded">
          <DropdownSection title="Room actions">
            <DropdownItem
              key="addUser"
              startContent={<FaUserPlus className="w-4 h-4" />}
              onClick={() => setIsAddUserModalOpen(true)}
            >
              Add Members
            </DropdownItem>
            <DropdownItem
              key="viewMembers"
              startContent={<FaUsers className="w-4 h-4" />}
              onClick={() => setIsMembersModalOpen(true)}
            >
              Members
            </DropdownItem>
            <DropdownItem
              key="delete"
              className="text-[#F31260]"
              color="danger"
              startContent={<FaTrash className="w-4 h-4" />}
              onClick={deleteRoom}
            >
              Delete
            </DropdownItem>
          </DropdownSection>
        </DropdownMenu>
      </Dropdown>

      {/* Add User Modal */}
      <Modal
        isOpen={isAddUserModalOpen}
        onClose={() => setIsAddUserModalOpen(false)}
        scrollBehavior="inside"
      >
        <ModalContent>
          <ModalHeader>Add User to Room</ModalHeader>
          <ModalBody>
            <Input
              fullWidth
              placeholder="Search users"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchResults.length > 0 ? (
              searchResults.map((user) => (
                <div
                  key={user.user_id}
                  className="flex items-center justify-between mt-2"
                >
                  <span>{user.display_name}</span>
                  <Button
                    size="sm"
                    variant="flat"
                    startContent={<FaPaperPlane />}
                    onClick={() => handleAddUser(user.user_id)}
                  >
                    Invite
                  </Button>
                </div>
              ))
            ) : (
              <div className="mt-2 text-gray-500">No users found.</div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button
              color="default"
              variant="flat"
              onClick={() => setIsAddUserModalOpen(false)}
            >
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Members Modal */}
      <Modal
        isOpen={isMembersModalOpen}
        onClose={() => setIsMembersModalOpen(false)}
        scrollBehavior="inside"
      >
        <ModalContent>
          <ModalHeader>Room Members</ModalHeader>
          <ModalBody>
            {roomMembers.length > 0 ? (
              roomMembers.map((member) => (
                <div
                  key={member.userId}
                  className="flex items-center justify-between mt-2"
                >
                  <span>
                    {member.displayName}
                    {member.isOwner && (
                      <span className="text-sm font-semibold"> (Owner)</span>
                    )}
                  </span>
                  <div className="flex items-center gap-2">
                    <Chip
                      color={
                        member.membership === "join"
                          ? "success"
                          : member.membership === "invite"
                            ? "warning"
                            : "default"
                      }
                      className="flex items-center"
                    >
                      <span>
                        {member.membership === "join" && "Joined"}
                        {member.membership === "invite" && "Invited"}
                        {member.membership === "leave" && "Left"}
                        {/* Add other statuses if needed */}
                      </span>
                      {isCurrentUserOwner &&
                        member.membership === "invite" && (
                          <Tooltip content="Remove invitation">
                            <span
                              className="ml-2 cursor-pointer"
                              onClick={() =>
                                handleCancelInvitation(member.userId)
                              }
                            >
                              X
                            </span>
                          </Tooltip>
                        )}
                    </Chip>
                  </div>
                </div>
              ))
            ) : (
              <div className="mt-2 text-gray-500">No members found.</div>
            )}
          </ModalBody>
          <ModalFooter>
          <Button
              color="default"
              variant="flat"
              onClick={() => setIsMembersModalOpen(false)}
            >
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};
