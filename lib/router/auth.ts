import {Router} from 'express';
import {AuthController} from '../controller';
import {authValidator, isInputValid} from '../utils/validators';
import {CognitoClient} from '../clients';
import {AWS_REGION, NUMBER_OF_RETRIES} from '../utils/constants';
import {CognitoIdentityProviderClient} from '@aws-sdk/client-cognito-identity-provider';

const cognitoIsp = new CognitoIdentityProviderClient({
    region: AWS_REGION,
    maxAttempts: NUMBER_OF_RETRIES,
});
const cognitoClient = new CognitoClient(cognitoIsp);
const authController = new AuthController(cognitoClient);

const router = Router();

router.post('/auth/register', authValidator.register, isInputValid, authController.register);
router.post('/auth/login', authValidator.login, isInputValid, authController.login);
router.post('/auth/logout', authController.logout);

export default router;
