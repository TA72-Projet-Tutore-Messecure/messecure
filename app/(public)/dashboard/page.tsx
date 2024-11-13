// app/dashboard/page.tsx

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MatrixService from "@/services/MatrixService";

const DashboardPage: React.FC = () => {
  const router = useRouter();
  const [roomName, setRoomName] = useState('');
  const [roomIdOrAlias, setRoomIdOrAlias] = useState('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<string[]>([]);
  // @ts-ignore
  const [rooms, setRooms] = useState<sdk.Room[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const [invitations, setInvitations] = useState<string[]>([]);

  const isLoggedIn = MatrixService.isLoggedIn();

  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/login');
    } else {
      fetchRooms();
      fetchInvitations();
    }
  }, [isLoggedIn]);

  const fetchRooms = () => {
    const roomsList = MatrixService.listRooms();
    setRooms(roomsList);
  };

  const fetchInvitations = () => {
    const invites = MatrixService.getInvitations();
    setInvitations(invites);
  };

  const handleCreateRoom = async () => {
    try {
      const createdRoomId = await MatrixService.createRoom(roomName);
      setSelectedRoomId(createdRoomId);
      alert(`Room created with ID: ${createdRoomId}`);
      fetchRooms();
    } catch (error) {
      console.error(error);
      // @ts-ignore
      alert(error.message);
    }
  };

  const handleJoinRoom = async () => {
    try {
      const joinedRoomId = await MatrixService.joinRoom(roomIdOrAlias);
      setSelectedRoomId(joinedRoomId);
      alert(`Joined room: ${joinedRoomId}`);
      fetchRooms();
    } catch (error) {
      console.error(error);
      // @ts-ignore
      alert(error.message);
    }
  };

  const handleLeaveRoom = async (roomId: string) => {
    try {
      await MatrixService.leaveRoom(roomId);
      alert(`Left room: ${roomId}`);
      if (roomId === selectedRoomId) {
        setSelectedRoomId('');
        setMessages([]);
      }
      fetchRooms();
    } catch (error) {
      console.error(error);
      // @ts-ignore
      alert(error.message);
    }
  };

  const handleSendMessage = async () => {
    try {
      await MatrixService.sendMessage(selectedRoomId, message);
      setMessage('');
      fetchMessages();
    } catch (error) {
      console.error(error);
      // @ts-ignore
      alert(error.message);
    }
  };

  const fetchMessages = () => {
    try {
      const fetchedMessages = MatrixService.getMessages(selectedRoomId);
      setMessages(fetchedMessages);
    } catch (error) {
      console.error(error);
      // @ts-ignore
      alert(error.message);
    }
  };

  const handleSearchUsers = async () => {
    try {
      const users = await MatrixService.searchUsers(searchTerm);
      setSearchResults(users);
    } catch (error) {
      console.error(error);
      // @ts-ignore
      alert(error.message);
    }
  };

  const handleStartDirectMessage = async (userId: string) => {
    try {
      const dmRoomId = await MatrixService.startDirectMessage(userId);
      setSelectedRoomId(dmRoomId);
      alert(`Started direct message with ${userId}`);
      fetchRooms();
    } catch (error) {
      console.error(error);
      // @ts-ignore
      alert(error.message);
    }
  };

  const handleAcceptInvitation = async (roomId: string) => {
    try {
      await MatrixService.acceptInvitation(roomId);
      alert(`Accepted invitation to room: ${roomId}`);
      fetchRooms();
      fetchInvitations();
    } catch (error) {
      console.error(error);
      // @ts-ignore
      alert(error.message);
    }
  };

  const handleDeclineInvitation = async (roomId: string) => {
    try {
      await MatrixService.declineInvitation(roomId);
      alert(`Declined invitation to room: ${roomId}`);
      fetchInvitations();
    } catch (error) {
      console.error(error);
      // @ts-ignore
      alert(error.message);
    }
  };

  const handleLogout = async () => {
    await MatrixService.logout();
    router.push('/login');
  };

  useEffect(() => {
    if (selectedRoomId) {
      fetchMessages();
    }
  }, [selectedRoomId]);

  return (
    <div className="container mx-auto p-4">
      {isLoggedIn && (
        <>
          <div className="flex justify-end mb-4">
            <button
              className="bg-red-500 text-white p-2"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>

          {/* Invitations */}
          {invitations.length > 0 && (
            <div className="mb-4">
              <h2 className="text-2xl font-bold mb-2">Invitations</h2>
              <ul>
                {invitations.map((roomId) => (
                  <li key={roomId} className="flex items-center space-x-2">
                    <span>{roomId}</span>
                    <button
                      className="bg-green-500 text-white p-1"
                      onClick={() => handleAcceptInvitation(roomId)}
                    >
                      Accept
                    </button>
                    <button
                      className="bg-red-500 text-white p-1"
                      onClick={() => handleDeclineInvitation(roomId)}
                    >
                      Decline
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Rooms List */}
          <div className="mb-4">
            <h2 className="text-2xl font-bold mb-2">Your Rooms</h2>
            <ul>
              {rooms.map((room) => (
                <li key={room.roomId} className="flex items-center space-x-2">
                  <button
                    className="text-left flex-1"
                    onClick={() => {
                      setSelectedRoomId(room.roomId);
                      fetchMessages();
                    }}
                  >
                    {room.name || room.roomId}
                  </button>
                  <button
                    className="bg-red-500 text-white p-1"
                    onClick={() => handleLeaveRoom(room.roomId)}
                  >
                    Leave
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Join Room */}
          <div className="mb-4">
            <h2 className="text-2xl font-bold mb-2">Join Room</h2>
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="Room ID or Alias"
                className="border p-2 flex-1"
                value={roomIdOrAlias}
                onChange={(e) => setRoomIdOrAlias(e.target.value)}
              />
              <button
                className="bg-green-500 text-white p-2"
                onClick={handleJoinRoom}
              >
                Join Room
              </button>
            </div>
          </div>

          {/* Create Room */}
          <div className="mb-4">
            <h2 className="text-2xl font-bold mb-2">Create Room</h2>
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="Room Name"
                className="border p-2 flex-1"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
              />
              <button
                className="bg-green-500 text-white p-2"
                onClick={handleCreateRoom}
              >
                Create Room
              </button>
            </div>
          </div>

          {/* Search Users */}
          <div className="mb-4">
            <h2 className="text-2xl font-bold mb-2">Search Users</h2>
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="Search Term"
                className="border p-2 flex-1"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button
                className="bg-blue-500 text-white p-2"
                onClick={handleSearchUsers}
              >
                Search
              </button>
            </div>
            {searchResults.length > 0 && (
              <ul className="mt-2">
                {searchResults.map((userId) => (
                  <li key={userId} className="flex items-center space-x-2">
                    <span>{userId}</span>
                    <button
                      className="bg-green-500 text-white p-1"
                      onClick={() => handleStartDirectMessage(userId)}
                    >
                      Message
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Messaging */}
          {selectedRoomId && (
            <>
              <div className="mb-4">
                <h2 className="text-2xl font-bold mb-2">Send Message</h2>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="Message"
                    className="border p-2 flex-1"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                  <button
                    className="bg-blue-500 text-white p-2"
                    onClick={handleSendMessage}
                  >
                    Send
                  </button>
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-2">Messages</h2>
                <div className="border p-4 h-64 overflow-y-auto">
                  {messages.map((msg, index) => (
                    <div key={index} className="mb-2">
                      {msg}
                    </div>
                  ))}
                </div>
                <button
                  className="mt-2 bg-gray-500 text-white p-2"
                  onClick={fetchMessages}
                >
                  Refresh Messages
                </button>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default DashboardPage;
