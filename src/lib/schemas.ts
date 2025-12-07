import { type, ArkErrors } from 'arktype';

// Schema for setup form - requires password and confirmation
export const setupSchema = type({
	password: 'string>7', // At least 8 characters
	confirmPassword: 'string'
});

// Schema for login form - only requires password
export const loginSchema = type({
	password: 'string>0' // Non-empty string
});

// Custom validation for setup form to check password confirmation
export const validateSetupForm = (data: { password: string; confirmPassword: string }) => {
	const baseValidation = setupSchema(data);

	if (!(baseValidation instanceof ArkErrors)) {
		if (data.password !== data.confirmPassword) {
			return {
				problems: [
					{
						path: ['confirmPassword'],
						message: 'Passwords do not match'
					}
				],
				data: undefined
			};
		}
	}

	return baseValidation;
};
