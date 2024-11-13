// services/MatrixService.ts

import * as sdk from 'matrix-js-sdk';

class MatrixService {
  private static instance: MatrixService;
  private matrixClient: sdk.MatrixClient | null = null;
  private accessToken: string | null = null;
  private userId: string | null = null;

  private constructor() {
    // Initialize from localStorage if available
    if (typeof window !== 'undefined') {
      this.accessToken = localStorage.getItem('matrixAccessToken');
      this.userId = localStorage.getItem('matrixUserId');
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

  private initializeClient() {
    this.matrixClient = sdk.createClient({
      baseUrl: process.env.NEXT_PUBLIC_MATRIX_SERVER || 'http://localhost:8008',
      accessToken: this.accessToken!,
      userId: this.userId!,
    });
    this.matrixClient.startClient();
  }

  /**
   * Register a new user on the Matrix server.
   * @param username - The desired username.
   * @param password - The desired password.
   */
  async register(username: string, password: string): Promise<void> {
    try {
      this.matrixClient = sdk.createClient({
        baseUrl: process.env.NEXT_PUBLIC_MATRIX_SERVER || 'http://localhost:8008',
      });
      await this.matrixClient.registerRequest({
        username,
        password,
        auth: { type: 'm.login.dummy' },
      });
    } catch (error) {
      throw new Error(`Registration failed: ${error}`);
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
        baseUrl: process.env.NEXT_PUBLIC_MATRIX_SERVER || 'http://localhost:8008',
      });
      const response = await this.matrixClient.login('m.login.password', {
        user: username,
        password: password,
      });
      this.accessToken = response.access_token;
      this.userId = response.user_id;

      // Save credentials to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('matrixAccessToken', this.accessToken);
        localStorage.setItem('matrixUserId', this.userId);
      }

      this.initializeClient();
    } catch (error) {
      throw new Error(`Login failed: ${error}`);
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
      console.error('Error during logout:', error);
    } finally {
      this.accessToken = null;
      this.userId = null;
      if (typeof window !== 'undefined') {
        localStorage.removeItem('matrixAccessToken');
        localStorage.removeItem('matrixUserId');
      }
    }
  }

  /**
   * Check if a user is currently logged in.
   * @returns True if a user is logged in; otherwise, false.
   */
  isLoggedIn(): boolean {
    return this.accessToken !== null && this.userId !== null;
  }

  /**
   * Get the Matrix client instance.
   * @returns The Matrix client instance.
   */
  getClient(): sdk.MatrixClient {
    if (!this.matrixClient) {
      throw new Error('Matrix client is not initialized.');
    }
    return this.matrixClient;
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
        visibility: 'private',
        name: roomName,
      });
      return response.room_id;
    } catch (error) {
      throw new Error(`Room creation failed: ${error}`);
    }
  }

  /**
   * List all rooms the user is in.
   * @returns An array of rooms.
   */
  listRooms(): sdk.Room[] {
    return this.getClient().getRooms();
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
      throw new Error(`Joining room failed: ${error}`);
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
      throw new Error(`Leaving room failed: ${error}`);
    }
  }

  /**
   * Search for users.
   * @param keyword - The search keyword.
   * @returns An array of user IDs.
   */
  async searchUsers(keyword: string): Promise<string[]> {
    try {
      const response = await this.getClient().searchUserDirectory({ term: keyword });
      return response.results.map((user) => user.user_id);
    } catch (error) {
      throw new Error(`User search failed: ${error}`);
    }
  }

  /**
   * Start a direct message with a user.
   * @param userId - The user ID to message.
   * @returns The room ID of the direct message.
   */
  async startDirectMessage(userId: string): Promise<string> {
    try {
      const response = await this.getClient().createRoom({
        is_direct: true,
        invite: [userId],
      });
      return response.room_id;
    } catch (error) {
      throw new Error(`Starting direct message failed: ${error}`);
    }
  }

  /**
   * Send a message to a room.
   * @param roomId - The ID of the room.
   * @param message - The message content.
   */
  async sendMessage(roomId: string, message: string): Promise<void> {
    try {
      const txnId = `m${new Date().getTime()}`;
      // @ts-ignore
      await this.getClient().sendEvent(roomId, 'm.room.message', {
        body: message,
        msgtype: 'm.text',
      }, txnId);
    } catch (error) {
      throw new Error(`Sending message failed: ${error}`);
    }
  }

  /**
   * Retrieve messages from a room.
   * @param roomId - The ID of the room.
   * @returns An array of message contents.
   */
  getMessages(roomId: string): string[] {
    const room = this.getClient().getRoom(roomId);
    if (!room) {
      throw new Error('Room not found.');
    }
    return room.timeline
      .filter((event) => event.getType() === 'm.room.message')
      .map((event) => `${event.getSender()}: ${event.getContent().body}`);
  }

  /**
   * Get a list of pending invitations.
   * @returns An array of room IDs.
   */
  getInvitations(): string[] {
    return this.getClient()
      .getRooms()
      .filter((room) => room.getMyMembership() === 'invite')
      .map((room) => room.roomId);
  }

  /**
   * Accept an invitation to a room.
   * @param roomId - The ID of the room.
   */
  async acceptInvitation(roomId: string): Promise<void> {
    try {
      await this.getClient().joinRoom(roomId);
    } catch (error) {
      throw new Error(`Accepting invitation failed: ${error}`);
    }
  }

  /**
   * Decline an invitation to a room.
   * @param roomId - The ID of the room.
   */
  async declineInvitation(roomId: string): Promise<void> {
    try {
      await this.getClient().leave(roomId);
    } catch (error) {
      throw new Error(`Declining invitation failed: ${error}`);
    }
  }
}

export default MatrixService.getInstance();
