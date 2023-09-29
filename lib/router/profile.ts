import {Router} from 'express';
import {ProfileController} from '../controller';
import {profileValidator, isInputValid} from '../utils';

const router = Router();

ProfileController.initialize();
router.put('/profile', profileValidator.updateProfile, isInputValid, ProfileController.updateProfile);
router.put('/profile/forgotPassword', profileValidator.forgotPassword, isInputValid, ProfileController.forgotPassword);
router.put('/profile/forgotPassword/confirm', profileValidator.confirmForgotPassword, isInputValid, ProfileController.confirmForgotPassword);
router.delete('/profile/remove', profileValidator.removeProfile, isInputValid, ProfileController.removeProfile);
router.delete('/profile/remove/:userId', profileValidator.adminRemoveProfile, isInputValid, ProfileController.adminRemoveProfile);

export default router;
