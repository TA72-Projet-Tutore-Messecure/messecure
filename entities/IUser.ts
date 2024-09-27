// src/types/User.ts

export interface IUser {
			id: string;             // Unique identifier for the user
			username: string;       // Username chosen by the user
			email: string;          // User's email address
			firstName?: string;     // Optional first name
			lastName?: string;      // Optional last name
			avatarUrl?: string;     // URL to the user's avatar image
}
