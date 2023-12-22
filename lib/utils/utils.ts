import {AttributeType} from '@aws-sdk/client-cognito-identity-provider';
import {UserUpdateInput} from 'ntlango-api-client';

export const convertUpdateUserToUserAttributes = (updateUserInput: UserUpdateInput): AttributeType[] | undefined => {
    return Object.entries(updateUserInput).map(([key, value]) => {
        return {
            Name: key,
            Value: value,
        };
    });
};
