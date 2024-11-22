// services/MatrixService.ts

"use client";

import * as sdk from "matrix-js-sdk/lib/browser-index";
import { MatrixErrorParser } from "@/lib/matrixErrorParser";

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
        baseUrl: process.env.NEXT_PUBLIC_MATRIX_SERVER || "http://localhost:8008",
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
        baseUrl: process.env.NEXT_PUBLIC_MATRIX_SERVER || "http://localhost:8008",
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
   * Join a room by ID or alias.
   * @param roomIdOrAlias - The room ID or alias.
   * @returns The room ID of the joined room.
   */
  async joinRoom(roomIdOrAlias: string): Promise<string> {
    try {
      const room = await this.getClient().joinRoom(roomIdOrAlias);

      return room.roomId;
    } catch (error) {
      if (error instanceof Error) {
        const parsedError = MatrixErrorParser.parse(error.toString());

        throw new Error(`Joining room failed: ${parsedError?.message}`, {
          cause: parsedError,
        });
      } else {
        throw new Error("Joining room failed: Unknown error");
      }
    }
  }

  /**
   * Leave a room.
   * @param roomId - The ID of the room to leave.
   */
  async leaveRoom(roomId: string): Promise<void> {
    try {
      await this.getClient().leave(roomId);
    } catch (error) {
      if (error instanceof Error) {
        const parsedError = MatrixErrorParser.parse(error.toString());

        throw new Error(`Leaving room failed: ${parsedError?.message}`, {
          cause: parsedError,
        });
      } else {
        throw new Error("Leaving room failed: Unknown error");
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
   * Start a direct message with a user.
   * @param userId - The user ID to message.
   * @returns The room ID of the direct message.
   */
  async startDirectMessage(userId: string): Promise<string> {
    try {
      const existingRoom = this.getDirectRoomWithUser(userId);
      if (existingRoom) {
        // Ensure the user is joined to the room
        if (existingRoom.getMyMembership() !== "join") {
          await this.getClient().joinRoom(existingRoom.roomId);
        }
        return existingRoom.roomId;
      }

      const response = await this.getClient().createRoom({
        is_direct: true,
        invite: [userId],
      });

      // Wait until the room appears in the client's room list
      await new Promise((resolve) => {
        // @ts-ignore
        this.getClient().once("Room", (room) => {
          if (room.roomId === response.room_id) {
            resolve(true);
          }
        });
      });

      return response.room_id;
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
   * Get an existing direct room with a user, if it exists.
   * @param userId - The user ID to check.
   * @returns The room object if exists; otherwise, null.
   */
  public getDirectRoomWithUser(userId: string): sdk.Room | null {
    const client = this.getClient();
    const directEvent = client.getAccountData("m.direct");

    if (directEvent) {
      const directRoomsMap = directEvent.getContent();

      if (directRoomsMap[userId]) {
        for (const roomId of directRoomsMap[userId]) {
          const room = client.getRoom(roomId);
          if (room && room.getMyMembership() === "join") {
            return room;
          }
        }
      }
    }
    return null;
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
   * Retrieve messages from a room.
   * @param roomId - The ID of the room.
   * @returns An array of message contents.
   */
  getMessages(roomId: string): string[] {
    try {
      const room = this.getClient().getRoom(roomId);

      if (!room) {
        throw new Error("Room not found.");
      }

      return room.timeline
        .filter((event) => event.getType() === "m.room.message")
        .map((event) => `${event.getSender()}: ${event.getContent().body}`);
    } catch (error) {
      if (error instanceof Error) {
        const parsedError = MatrixErrorParser.parse(error.toString());

        throw new Error(`Retrieving messages failed: ${parsedError?.message}`, {
          cause: parsedError,
        });
      } else {
        throw new Error("Retrieving messages failed: Unknown error");
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
   * Automatically accept invitations to rooms.
   */
  public enableAutoJoin() {
    // @ts-ignore
    this.getClient().on("RoomMember.membership", (event, member) => {
      if (member.membership === "invite" && member.userId === this.userId) {
        this.getClient()
          .joinRoom(member.roomId)
          .catch((err) => {
            console.error(`Auto-join failed for room ${member.roomId}:`, err);
          });
      }
    });
  }
}

export default MatrixService.getInstance();
