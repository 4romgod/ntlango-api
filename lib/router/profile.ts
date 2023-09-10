import {Router} from 'express';
import {CognitoClient} from '../clients';
import {ProfileController} from '../controller';
import {profileValidator, isInputValid} from '../utils/validators';
import {AWS_REGION, NUMBER_OF_RETRIES} from '../../lib/utils/constants';
import {CognitoIdentityProviderClient} from '@aws-sdk/client-cognito-identity-provider';

const cognitoIsp = new CognitoIdentityProviderClient({
    region: AWS_REGION,
    maxAttempts: NUMBER_OF_RETRIES,
});
const cognitoClient = new CognitoClient(cognitoIsp);
const profileController = new ProfileController(cognitoClient);

const router = Router();

router.put('/profile', profileValidator.updateProfile, isInputValid, profileController.updateProfile);
router.put('/profile/forgotPassword', profileValidator.forgotPassword, isInputValid, profileController.forgotPassword);
router.put('/profile/forgotPassword/confirm', profileValidator.confirmForgotPassword, isInputValid, profileController.confirmForgotPassword);
router.delete('/profile/remove', profileValidator.removeProfile, isInputValid, profileController.removeProfile);
router.delete('/profile/remove/:username', profileValidator.adminRemoveProfile, isInputValid, profileController.adminRemoveProfile);

export default router;
