import { type } from 'arktype';

export const newAppSchema = type({
	name: type('string.trim').to('string > 0')
});

export const appPermissionsSchema = type({
	allowMoneyMovement: 'boolean',
	allowCardAccess: 'boolean',
	allowFundraising: 'boolean',
	allowBookkeeping: 'boolean',
	allowOrgAdmin: 'boolean',
	allowViewFinancials: 'boolean'
});

export const deleteAppSchema = type({
	confirm: type("'DELETE'")
});

export const regenerateApiKeySchema = type({
	confirm: type("'REGENERATE'")
});
