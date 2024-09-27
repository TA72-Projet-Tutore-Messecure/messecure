// src/services/UserService.ts

import { faker } from '@faker-js/faker';
import { IUser } from '@/entities/IUser';

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
