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
} from "@nextui-org/react";
import { Button } from "@nextui-org/button";
import {
  FaTrash,
  FaPaperPlane,
  FaUserPlus,
  FaUsers,
  FaTimes,
  FaPen,
} from "react-icons/fa";
import { Input } from "@nextui-org/input";
import { toast } from "react-hot-toast";

import { VerticalDotsIcon } from "@/components/icons";
import MatrixService from "@/services/MatrixService";
import { useMatrix } from "@/context/MatrixContext";

// DotDropdownProps type (just pass isGroupRoom as a prop)
interface DotDropdownProps {
  isGroupRoom: boolean;
}

export const DotDropdown: React.FC<DotDropdownProps> = ({ isGroupRoom }) => {
  const {
    selectedRoom,
    refreshRooms,
    deleteDMRoom,
    leaveGroupRoom,
    deleteGroupRoom,
    kickUserFromGroupRoom,
  } = useMatrix();

  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [isMembersModalOpen, setIsMembersModalOpen] = useState(false);
  const [isRenameRoomModalOpen, setIsRenameRoomModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [newRoomName, setNewRoomName] = useState("");
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
  const [isCurrentUserOwner, setIsCurrentUserOwner] = useState(false);
  const [isKicking, setIsKicking] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    const searchUsers = async () => {
      if (!selectedRoom) {
        return;
      }
      if (searchTerm.trim() === "") {
        setSearchResults([]);

        return;
      }
      try {
        const results = await MatrixService.searchUsers(searchTerm);
        const roomMembersIds =
          selectedRoom
            ?.getMembers()
            // @ts-ignore
            .filter((member) =>
              // @ts-ignore
              ["join", "invite"].includes(member.membership),
            )
            .map((member) => member.userId) || [];

        const filteredResults = results.filter(
          (user) => !roomMembersIds.includes(user.user_id),
        );

        setSearchResults(filteredResults);
      } catch (error) {
        toast.error("Failed to search users");
      }
    };

    if (selectedRoom) {
      searchUsers();
    }
  }, [searchTerm, selectedRoom]);

  // Fetch room members when the component mounts or when selectedRoom changes
  useEffect(() => {
    if (selectedRoom) {
      fetchRoomMembers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRoom]);

  // Optionally, you can still fetch room members when opening the Members Modal
  // if there are additional side effects or data needed.
  // Otherwise, this useEffect can be removed.
  /*
  useEffect(() => {
    if (isMembersModalOpen && selectedRoom) {
      fetchRoomMembers();
    }
  }, [isMembersModalOpen, selectedRoom]);
  */

  if (!selectedRoom) {
    return null;
  }

  /**
   * Function to handle deleting a room based on its type and ownership.
   * - For DM rooms: Permanently delete the DM room.
   * - For Group rooms:
   *   - If owner/admin: Fully delete the group room.
   *   - If not owner/admin: Leave the group room.
   */
  const handleDeleteOrLeaveRoom = async () => {
    if (!selectedRoom) {
      toast.error("No room selected.");

      return;
    }

    if (isGroupRoom) {
      if (isCurrentUserOwner) {
        // Confirm deletion
        const confirmed = window.confirm(
          "Are you sure you want to delete this group room? This action will remove all members.",
        );

        if (!confirmed) return;

        try {
          await deleteGroupRoom(selectedRoom.roomId);
          toast.success("Group room deleted successfully.");
          // Optionally, perform additional actions like navigating away or resetting state
        } catch (error: any) {
          //console.error(error);
          toast.error(error.message || "Failed to delete group room.");
        }
      } else {
        // Confirm leaving
        const confirmed = window.confirm(
          "Are you sure you want to leave this group room?",
        );

        if (!confirmed) return;

        try {
          await leaveGroupRoom(selectedRoom.roomId);
          toast.success("Left the group room successfully.");
          // Optionally, perform additional actions like navigating away or resetting state
        } catch (error: any) {
          //console.error(error);
          toast.error(error.message || "Failed to leave group room.");
        }
      }
    } else {
      // DM Room
      const confirmed = window.confirm(
        "Are you sure you want to delete this DM room? This action cannot be undone.",
      );

      if (!confirmed) return;

      try {
        await deleteDMRoom(selectedRoom.roomId);
        toast.success("DM room deleted successfully.");
        // Optionally, perform additional actions like navigating away or resetting state
      } catch (error: any) {
        //console.error(error);
        toast.error(error.message || "Failed to delete DM room.");
      }
    }
  };

  // Function to invite user
  const handleAddUser = async (userId: string) => {
    try {
      if (!selectedRoom) {
        toast.error("No room selected.");

        return;
      }

      await MatrixService.inviteUserToRoom(selectedRoom.roomId, userId);
      toast.success(`User ${userId} invited to the room`);
      setSearchTerm(""); // Clear search term after inviting
      setSearchResults((prevResults) =>
        prevResults.filter((user) => user.user_id !== userId),
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
      //console.error(error);
      toast.error("Failed to invite user");
    }
  };

  // Function to cancel invitation
  const handleCancelInvitation = async (userId: string) => {
    try {
      if (!selectedRoom) {
        toast.error("No room selected.");

        return;
      }

      await MatrixService.kickUserFromRoom(
        selectedRoom.roomId,
        userId,
        "Invitation cancelled by owner",
      );
      toast.success(`Invitation to ${userId} cancelled`);

      // Update the roomMembers state immediately
      setRoomMembers((prevMembers) =>
        prevMembers.filter((member) => member.userId !== userId),
      );
    } catch (error) {
      //console.error(error);
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
      "",
    );
    const roomCreator = createEvent?.getContent()?.creator;
    const myUserId = MatrixService.getCurrentUserId();

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

  // Function to handle kicking a user and updating the state
  const handleKickUser = async (userId: string, displayName: string) => {
    setIsKicking((prev) => ({ ...prev, [userId]: true }));
    try {
      await kickUserFromGroupRoom(selectedRoom!.roomId, userId);
      toast.success(`${displayName} has been kicked from the room.`);

      // Update the roomMembers state by removing the kicked user
      setRoomMembers((prevMembers) =>
        prevMembers.filter((member) => member.userId !== userId),
      );
    } catch (error: any) {
      //console.error(error);
      toast.error(error.message || `Failed to kick ${displayName}.`);
    } finally {
      setIsKicking((prev) => ({ ...prev, [userId]: false }));
    }
  };

  const handleNewRoomNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewRoomName(e.target.value);
  }

  const handleRenameRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoom) {
      toast.error("No room selected.");
      return;
    }

    try {
      await MatrixService.changeRoomName(selectedRoom.roomId, newRoomName);
      toast.success("Room renamed successfully.");
    } catch (error: any) {
      toast.error(error.message || "Failed to rename room.");
    }
  }

  // Collect menu items
  const menuItems = [];

  if (isGroupRoom) {
    menuItems.push(
      <DropdownItem
        key="addUser"
        startContent={<FaUserPlus className="w-4 h-4" />}
        onClick={() => setIsAddUserModalOpen(true)}
      >
        Add Members
      </DropdownItem>,
    );
  }

  menuItems.push(
    <DropdownItem
      key="viewMembers"
      startContent={<FaUsers className="w-4 h-4" />}
      onClick={() => setIsMembersModalOpen(true)}
    >
      Members
    </DropdownItem>,
  );

  menuItems.push(
    <DropdownItem
      key="renameRoom"
      startContent={<FaPen className="w-4 h-4" />}
      onClick={() => setIsRenameRoomModalOpen(true)}
    >
      Rename Room
    </DropdownItem>,
  );

  menuItems.push(
    <DropdownItem
      key="deleteOrLeave"
      className={`${isGroupRoom ? "text-[#F31260]" : "text-[#F31260]"}`}
      color="danger"
      startContent={<FaTrash className="w-4 h-4" />}
      onClick={handleDeleteOrLeaveRoom}
    >
      {isGroupRoom
        ? isCurrentUserOwner
          ? "Delete Group Room"
          : "Leave Group Room"
        : "Delete DM Room"}
    </DropdownItem>,
  );

  return (
    <>
      <Dropdown>
        <DropdownTrigger>
          <Button isIconOnly radius="full" variant="light">
            <VerticalDotsIcon className="w-6 h-6 cursor-pointer" />
          </Button>
        </DropdownTrigger>
        <DropdownMenu aria-label="Room actions menu" variant="faded">
          <DropdownSection title="Room actions">{menuItems}</DropdownSection>
        </DropdownMenu>
      </Dropdown>

      {/* Add User Modal */}
      {isGroupRoom && (
        <Modal
          isOpen={isAddUserModalOpen}
          scrollBehavior="inside"
          onClose={() => setIsAddUserModalOpen(false)}
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
                      startContent={<FaPaperPlane />}
                      variant="flat"
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
      )}

      {/* Members Modal */}
      <Modal
        isOpen={isMembersModalOpen}
        scrollBehavior="inside"
        onClose={() => setIsMembersModalOpen(false)}
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
                  <Chip
                    className="flex flex-row items-center"
                    color={
                      member.membership === "join"
                        ? "success"
                        : member.membership === "invite"
                          ? "warning"
                          : "default"
                    }
                  >
                    <span className="flex flex-row items-center">
                      {member.membership === "join" && "Joined"}
                      {member.membership === "invite" && "Invited"}
                      {member.membership === "leave" && "Left"}
                      {isCurrentUserOwner && member.membership === "invite" && (
                        <button
                          aria-label={`Cancel invitation for ${member.displayName}`}
                          className="cursor-pointer ml-2"
                          type="button"
                          onClick={() => handleCancelInvitation(member.userId)}
                        >
                          <FaTimes className="w-3 h-3" />
                        </button>
                      )}
                      {isCurrentUserOwner &&
                        member.userId !== MatrixService.getCurrentUserId() &&
                        !member.isOwner &&
                        member.membership === "join" && (
                          <button
                            aria-label={`Kick ${member.displayName}`}
                            className={`text-red-500 hover:text-red-700 ml-2 ${
                              isKicking[member.userId]
                                ? "opacity-50 cursor-not-allowed"
                                : ""
                            }`}
                            disabled={isKicking[member.userId]}
                            onClick={() =>
                              !isKicking[member.userId] &&
                              handleKickUser(member.userId, member.displayName)
                            }
                          >
                            {isKicking[member.userId] ? (
                              "Kicking..."
                            ) : (
                              <FaTimes className="w-4 h-4" />
                            )}
                          </button>
                        )}
                    </span>
                  </Chip>
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
      
      {/* Rename Room Modal */}
      <Modal
        isOpen={isRenameRoomModalOpen}
        scrollBehavior="inside"
        onClose={() => setIsRenameRoomModalOpen(false)}
      >
        <ModalContent>
          <ModalHeader>Rename Room</ModalHeader>
          <ModalBody>
            <Input
              fullWidth
              placeholder="Enter new room name"
              onChange={handleNewRoomNameChange}
            />
          </ModalBody>
          <ModalFooter>
            <Button
              color="default"
              variant="flat"
              onClick={() => setIsRenameRoomModalOpen(false)}
            >
              Close
            </Button>
            <Button
              color="primary"
              onClick={handleRenameRoom}
            >
              Change Room Name
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};
