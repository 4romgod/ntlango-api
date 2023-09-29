import {AttributeType} from '@aws-sdk/client-cognito-identity-provider';
import {UpdateUserInput} from '@ntlango/api-client';

export const convertUpdateUserToUserAttributes = (updateUserInput: UpdateUserInput): AttributeType[] | undefined => {
    return Object.entries(updateUserInput).map(([key, value]) => {
        return {
            Name: key,
            Value: value,
        };
    });
};
