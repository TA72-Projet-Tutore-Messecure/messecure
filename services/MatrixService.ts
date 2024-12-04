// services/MatrixService.ts

"use client";

import * as sdk from "matrix-js-sdk/lib/browser-index";

import { MatrixErrorParser } from "@/lib/matrixErrorParser";
import { Room } from "matrix-js-sdk";

class MatrixService {
  private static instance: MatrixService;
  private matrixClient: sdk.MatrixClient | null = null;
  private accessToken: string | null = null;
  private userId: string | null = null;

  private constructor() {
    if (typeof window !== "undefined") {
      this.accessToken = localStorage.getItem("matrixAccessToken");
      this.userId = localStorage.getItem("matrixUserId");
      if (this.accessToken && this.userId) {
        this.initializeClient();
      }
    }
  }

  public static getInstance(): MatrixService {
    if (!MatrixService.instance) {
      MatrixService.instance = new MatrixService();
    }

    return MatrixService.instance;
  }

  private async initializeClient() {
    this.matrixClient = sdk.createClient({
      baseUrl: process.env.NEXT_PUBLIC_MATRIX_SERVER || "http://localhost:8008",
      accessToken: this.accessToken!,
      userId: this.userId!,
    });

    this.matrixClient.startClient();

    await new Promise((resolve) => {
      // @ts-ignore
      this.matrixClient!.once("sync", (state) => {
        if (state === "PREPARED") {
          resolve(true);
        }
      });
    });
  }

  public getCurrentUserId(): string {
    if (!this.userId) {
      throw new Error("User ID is not available.");
    }

    return this.userId;
  }

  public isLoggedIn(): boolean {
    return this.accessToken !== null && this.userId !== null;
  }

  public getClient(): sdk.MatrixClient {
    if (!this.matrixClient) {
      throw new Error("Matrix client is not initialized.");
    }

    return this.matrixClient;
  }

  /**
   * Register a new user on the Matrix server.
   * @param username - The desired username.
   * @param password - The desired password.
   */
  async register(username: string, password: string): Promise<void> {
    try {
      this.matrixClient = sdk.createClient({
        baseUrl:
          process.env.NEXT_PUBLIC_MATRIX_SERVER || "http://localhost:8008",
      });
      await this.matrixClient.registerRequest({
        username,
        password,
        auth: { type: "m.login.dummy" },
      });
    } catch (error) {
      if (error instanceof Error) {
        const parsedError = MatrixErrorParser.parse(error.toString());

        throw new Error(`Registration failed: ${parsedError?.message}`, {
          cause: parsedError,
        });
      } else {
        throw new Error("Registration failed: Unknown error");
      }
    }
  }

  /**
   * Log in an existing user.
   * @param username - The user's username.
   * @param password - The user's password.
   */
  async login(username: string, password: string): Promise<void> {
    try {
      this.matrixClient = sdk.createClient({
        baseUrl:
          process.env.NEXT_PUBLIC_MATRIX_SERVER || "http://localhost:8008",
      });
      const response = await this.matrixClient.login("m.login.password", {
        user: username,
        password: password,
      });

      this.accessToken = response.access_token;
      this.userId = response.user_id;

      // Save credentials to localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem("matrixAccessToken", this.accessToken);
        localStorage.setItem("matrixUserId", this.userId);
      }

      await this.initializeClient();
    } catch (error) {
      if (error instanceof Error) {
        const parsedError = MatrixErrorParser.parse(error.toString());

        throw new Error(`Login failed: ${parsedError?.message}`, {
          cause: parsedError,
        });
      } else {
        throw new Error("Login failed: Unknown error");
      }
    }
  }

  /**
   * Logout the current user.
   */
  async logout(): Promise<void> {
    try {
      if (this.matrixClient) {
        await this.matrixClient.logout();
        this.matrixClient.stopClient();
        this.matrixClient = null;
      }
    } catch (error) {
      if (error instanceof Error) {
        const parsedError = MatrixErrorParser.parse(error.toString());

        throw new Error(`Logout failed: ${parsedError?.message}`, {
          cause: parsedError,
        });
      } else {
        throw new Error("Logout failed: Unknown error");
      }
    } finally {
      this.accessToken = null;
      this.userId = null;
      if (typeof window !== "undefined") {
        localStorage.removeItem("matrixAccessToken");
        localStorage.removeItem("matrixUserId");
      }
    }
  }

  /**
   * Create a new room.
   * @param roomName - The desired room name.
   * @returns The ID of the created room.
   */
  async createRoom(roomName: string): Promise<string> {
    try {
      const response = await this.getClient().createRoom({
        // @ts-ignore
        visibility: "private",
        name: roomName,
      });

      return response.room_id;
    } catch (error) {
      if (error instanceof Error) {
        const parsedError = MatrixErrorParser.parse(error.toString());

        throw new Error(`Room creation failed: ${parsedError?.message}`, {
          cause: parsedError,
        });
      } else {
        throw new Error("Room creation failed: Unknown error");
      }
    }
  }

  /**
   * List all rooms the user is in.
   * @returns An array of rooms.
   */
  getRooms(): sdk.Room[] {
    try {
      return this.getClient().getRooms();
    } catch (error) {
      if (error instanceof Error) {
        const parsedError = MatrixErrorParser.parse(error.toString());

        throw new Error(`Listing rooms failed: ${parsedError?.message}`, {
          cause: parsedError,
        });
      } else {
        throw new Error("Listing rooms failed: Unknown error");
      }
    }
  }

  /**
   * Search for users.
   * @param keyword - The search keyword.
   * @returns An array of user objects with user IDs and display names.
   */
  async searchUsers(
    keyword: string,
  ): Promise<{ user_id: string; display_name: string }[]> {
    try {
      const response = await this.getClient().searchUserDirectory({
        term: keyword,
      });

      if (response.results && response.results.length > 0) {
        const currentUserId = this.getCurrentUserId();

        return response.results
          .filter((user) => user.user_id !== currentUserId) // Exclude current user
          .map((user) => ({
            user_id: user.user_id,
            display_name: user.display_name || user.user_id,
          }));
      } else {
        return [];
      }
    } catch (error) {
      if (error instanceof Error) {
        const parsedError = MatrixErrorParser.parse(error.toString());

        throw new Error(`User search failed: ${parsedError?.message}`, {
          cause: parsedError,
        });
      } else {
        throw new Error("User search failed: Unknown error");
      }
    }
  }

  /**
   * Get an existing direct room with a user, considering both inviter and invitee scenarios.
   * @param userId - The user ID to check.
   * @returns The room object if exists; otherwise, null.
   */
  public getDirectRoomWithUser(userId: string): sdk.Room | null {
    const client = this.getClient();
    const mDirectEvent = client.getAccountData("m.direct");

    if (!mDirectEvent) {
      return null;
    }

    const directRoomsMap: { [userId: string]: string[] } = mDirectEvent.getContent();
    const roomIds = directRoomsMap[userId] || [];

    for (const roomId of roomIds) {
      const room = client.getRoom(roomId);
      if (room) {
        // Additionally check if the room is a DM room
        const isDirect = this.isDirectRoom(roomId);
        const isDM = this.isDMRoomInvitedMember(room);
        if (isDirect || isDM) {
          return room;
        }
      }
    }

    return null;
  }

  /**
   * Determine if a room is a direct message (DM) room.
   * @param room - The Matrix room to check.
   * @returns True if it's a DM room; otherwise, false.
   */
  public isDMRoomInvitedMember(room: Room): boolean {
    const me = room.getMember(this.userId!);
    return !!me?.getDMInviter();
  }

  /**
   * Start a direct message with a user.
   * @param userId - The user ID to message.
   * @returns The room ID of the direct message.
   */
  async startDirectMessage(userId: string): Promise<string> {
    try {
      const existingRoom = this.getDirectRoomWithUser(userId);

      if (existingRoom) {
        return existingRoom.roomId;
      }

      const response = await this.getClient().createRoom({
        is_direct: true,
        invite: [userId],
      });

      const roomId = response.room_id;

      // Update m.direct account data
      const client = this.getClient();
      const mDirectEvent = client.getAccountData("m.direct");
      let directRoomsMap: { [userId: string]: string[] } = {};

      if (mDirectEvent) {
        directRoomsMap = mDirectEvent.getContent();
      }

      if (!directRoomsMap[userId]) {
        directRoomsMap[userId] = [];
      }

      if (!directRoomsMap[userId].includes(roomId)) {
        directRoomsMap[userId].push(roomId);

        await client.setAccountData("m.direct", directRoomsMap);
      }

      return roomId;
    } catch (error) {
      if (error instanceof Error) {
        const parsedError = MatrixErrorParser.parse(error.toString());

        throw new Error(
          `Starting direct message failed: ${parsedError?.message}`,
          { cause: parsedError },
        );
      } else {
        throw new Error("Starting direct message failed: Unknown error");
      }
    }
  }

  /**
   * Accept an invitation to a room.
   * @param roomId - The ID of the room.
   */
  public async acceptInvitation(roomId: string): Promise<void> {
    try {
      await this.getClient().joinRoom(roomId);
    } catch (error) {
      if (error instanceof Error) {
        const parsedError = MatrixErrorParser.parse(error.toString());

        throw new Error(
          `Accepting invitation failed: ${parsedError?.message}`,
          { cause: parsedError },
        );
      } else {
        throw new Error("Accepting invitation failed: Unknown error");
      }
    }
  }

  /**
   * Decline an invitation to a room.
   * @param roomId - The ID of the room.
   */
  public async declineInvitation(roomId: string): Promise<void> {
    try {
      await this.getClient().leave(roomId);
    } catch (error) {
      if (error instanceof Error) {
        const parsedError = MatrixErrorParser.parse(error.toString());

        throw new Error(
          `Declining invitation failed: ${parsedError?.message}`,
          { cause: parsedError },
        );
      } else {
        throw new Error("Declining invitation failed: Unknown error");
      }
    }
  }

  /**
   * Send a message to a room.
   * @param roomId - The ID of the room.
   * @param message - The message content.
   */
  async sendMessage(roomId: string, message: string): Promise<void> {
    try {
      const room = this.getClient().getRoom(roomId);

      if (!room || room.getMyMembership() !== "join") {
        await this.getClient().joinRoom(roomId);
      }

      const txnId = `m${new Date().getTime()}`;

      // @ts-ignore
      await this.getClient().sendEvent(
        roomId,
        "m.room.message",
        {
          body: message,
          msgtype: "m.text",
        },
        txnId,
      );
    } catch (error) {
      if (error instanceof Error) {
        const parsedError = MatrixErrorParser.parse(error.toString());

        throw new Error(`Sending message failed: ${parsedError?.message}`, {
          cause: parsedError,
        });
      } else {
        throw new Error("Sending message failed: Unknown error");
      }
    }
  }

  /**
   * Delete a room for both users.
   * @param roomId - The ID of the room to delete.
   */
  public async deleteRoom(roomId: string): Promise<void> {
    try {
      const client = this.getClient();
      const room = client.getRoom(roomId);

      if (!room) {
        throw new Error("Room not found");
      }

      const myUserId = this.getCurrentUserId();

      // Get all members in the room
      const members = room.getJoinedMembers();

      // Leave the room
      await client.leave(roomId);

      // Kick all other users from the room
      for (const member of members) {
        if (member.userId !== myUserId) {
          try {
            await client.kick(roomId, member.userId, "Room deleted");
          } catch (error) {
            // Ignore errors if user already left
            console.warn(`Failed to kick user ${member.userId}:`, error);
          }
        }
      }

      // Forget the room to remove it from the room list
      await client.forget(roomId);

      // Remove roomId from m.direct account data
      const mDirectEvent = client.getAccountData("m.direct");
      if (mDirectEvent) {
        const directRoomsMap: { [userId: string]: string[] } = mDirectEvent.getContent();

        let updated = false;

        for (const userId in directRoomsMap) {
          const roomIds = directRoomsMap[userId];
          const index = roomIds.indexOf(roomId);
          if (index !== -1) {
            roomIds.splice(index, 1);
            updated = true;
          }

          // If no room IDs left for a user, delete the key
          if (roomIds.length === 0) {
            delete directRoomsMap[userId];
            updated = true;
          }
        }

        if (updated) {
          await client.setAccountData("m.direct", directRoomsMap);
        }
      }

      // Emit an event to update the room list in the application
      // @ts-ignore
      client.emit("deleteRoom", roomId);
    } catch (error) {
      if (error instanceof Error) {
        const parsedError = MatrixErrorParser.parse(error.toString());

        throw new Error(`Deleting room failed: ${parsedError?.message}`, {
          cause: parsedError,
        });
      } else {
        throw new Error("Deleting room failed: Unknown error");
      }
    }
  }

  /**
   * Invite a user to a room.
   * @param roomId - The ID of the room.
   * @param userId - The ID of the user to invite.
   */
  public async inviteUserToRoom(roomId: string, userId: string): Promise<void> {
    try {
      await this.getClient().invite(roomId, userId);
    } catch (error) {
      if (error instanceof Error) {
        const parsedError = MatrixErrorParser.parse(error.toString());

        throw new Error(`Inviting user failed: ${parsedError?.message}`, {
          cause: parsedError,
        });
      } else {
        throw new Error("Inviting user failed: Unknown error");
      }
    }
  }

  /**
   * Kick a user from a room.
   * @param roomId - The ID of the room.
   * @param userId - The ID of the user to kick.
   * @param reason - The reason for kicking the user.
   */
  public async kickUserFromRoom(
    roomId: string,
    userId: string,
    reason: string,
  ): Promise<void> {
    try {
      await this.getClient().kick(roomId, userId, reason);
    } catch (error) {
      if (error instanceof Error) {
        const parsedError = MatrixErrorParser.parse(error.toString());

        throw new Error(`Kicking user failed: ${parsedError?.message}`, {
          cause: parsedError,
        });
      } else {
        throw new Error("Kicking user failed: Unknown error");
      }
    }
  }

  /**
   * Deletes a message (redacts an event) in a room.
   * @param roomId - The ID of the room.
   * @param eventId - The ID of the event (message) to delete.
   */
  public async deleteMessage(roomId: string, eventId: string): Promise<void> {
    try {
      await this.getClient().redactEvent(roomId, eventId);
    } catch (error) {
      if (error instanceof Error) {
        const parsedError = MatrixErrorParser.parse(error.toString());
        throw new Error(`Deleting message failed: ${parsedError?.message}`, {
          cause: parsedError,
        });
      } else {
        throw new Error("Deleting message failed: Unknown error");
      }
    }
  }

  /**
   * Check if a room is marked as a direct message room.
   * @param roomId - The ID of the room.
   * @returns True if the room is a direct message room; otherwise, false.
   */
  public isDirectRoom(roomId: string): boolean {
    const client = this.getClient();
    const mDirectEvent = client.getAccountData("m.direct");

    if (!mDirectEvent) {
      return false;
    }

    const directRoomsMap = mDirectEvent.getContent();

    for (const userId in directRoomsMap) {
      const roomIds = directRoomsMap[userId];

      if (roomIds.includes(roomId)) {
        return true;
      }
    }

    return false;
  }

    /**
   * Change the password of the current user.
   * @param oldPassword - The old password.
   * @param newPassword - The new password.
   */
  async changePassword(oldPassword: string, newPassword: string): Promise<void> {
    const authDict = {
      type: "m.login.password",
      user: this.userId,
      password: oldPassword
    }

    try {
      if (this.matrixClient) {
        await this.matrixClient.setPassword(authDict, newPassword, true);
      }
    }catch (error) {
        if (error instanceof Error) {
          const parsedError = MatrixErrorParser.parse(error.toString());
          throw new Error(`Updating password failed: ${parsedError?.message}`, {
            cause: parsedError,
          });
        } else {
          throw new Error("Updating password failed: Unknown error");
        }
      }
    }
}

export default MatrixService.getInstance();
