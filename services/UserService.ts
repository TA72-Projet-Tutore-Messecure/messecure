// src/services/UserService.ts

import { faker } from "@faker-js/faker";

import { IUser } from "@/entities/IUser";

import MatrixService from "./MatrixService";


// Function to create a single random IUser
export function createRandomUser(): IUser {
  return {
    id: faker.string.uuid(),
    username: faker.internet.userName(),
    email: faker.internet.email(),
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    avatarUrl: faker.image.avatar(),
  };
}

// Function to create multiple IUser instances
export function createRandomUsers(count: number): IUser[] {
  return faker.helpers.multiple(createRandomUser, { count });
}

class UserService {
  readonly userId: string | null = null;
  readonly matrixUser: any = null;

  private constructor() {
    this.userId = MatrixService.getClient().getUserId();
    if (this.userId) {
      this.matrixUser = MatrixService.getClient().getUser(this.userId);
    }
  }

  async setDisplayName(displayName: string): Promise<void> {
    if (this.matrixUser) {
      this.matrixUser.setDisplayName(displayName);
    }
  }

  async setAvatarUrl(avatarUrl: string): Promise<void> {
    if (this.matrixUser) {
      this.matrixUser.setAvatarUrl(avatarUrl);
    }
  }
}
