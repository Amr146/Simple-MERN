import Blacklist from './model';

// Service to add a token to the blacklist
export const addTokenToBlacklist = async (token: string, expiresAt: Date) => {
	try {
		const blacklistedToken = new Blacklist({ token, expiresAt });
		await blacklistedToken.save();
	} catch (error) {
		if (error instanceof Error) {
			throw new Error(`Error blacklisting token: ${error.message}`);
		}
		throw new Error('Error blacklisting token: Unknown error');
	}
};

// Service to check if a token is blacklisted
export const isTokenBlacklisted = async (token: string) => {
	try {
		const blacklistedToken = await Blacklist.findOne({ token });
		return !!blacklistedToken;
	} catch (error) {
		if (error instanceof Error) {
			throw new Error(`Error checking token blacklist: ${error.message}`);
		}
		throw new Error('Error checking token blacklist: Unknown error');
	}
};
