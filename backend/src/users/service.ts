import User from './model';

// Service to create a new user
export const createUser = async (userData: any) => {
	try {
		const user = new User(userData);
		return await user.save();
	} catch (error) {
		throw new Error(`Error creating user: ${(error as Error).message}`);
	}
};

// Service to get a user by ID
export const getUserById = async (id: string) => {
	try {
		return await User.findById(id);
	} catch (error) {
		throw new Error(`Error fetching user by ID: ${(error as Error).message}`);
	}
};

// Service to update a user by ID
export const updateUserById = async (id: string, updateData: any) => {
	try {
		return await User.findByIdAndUpdate(id, updateData, { new: true });
	} catch (error) {
		throw new Error(`Error updating user: ${(error as Error).message}`);
	}
};

// Service to delete a user by ID
export const deleteUserById = async (id: string) => {
	try {
		return await User.findByIdAndDelete(id);
	} catch (error) {
		throw new Error(`Error deleting user: ${(error as Error).message}`);
	}
};

// Service to get all users
export const getAllUsers = async () => {
	try {
		return await User.find();
	} catch (error) {
		throw new Error(`Error fetching users: ${(error as Error).message}`);
	}
};

// Service to find a user by email
export const findUserByEmail = async (email: string) => {
	try {
		return await User.findOne({ email }).select('+password');
	} catch (error) {
		throw new Error(`Error finding user by email: ${(error as Error).message}`);
	}
};
