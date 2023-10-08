import {Router} from 'express';
import {ProfileController} from '../controller';
import {ProfileValidators, isInputValid} from '../middleware/validators';

const router = Router();

ProfileController.initialize();
router.put('/profile', ProfileValidators.updateProfile, isInputValid, ProfileController.updateProfile);
router.put('/profile/forgotPassword', ProfileValidators.forgotPassword, isInputValid, ProfileController.forgotPassword);
router.put('/profile/forgotPassword/confirm', ProfileValidators.confirmForgotPassword, isInputValid, ProfileController.confirmForgotPassword);
router.delete('/profile/remove', ProfileValidators.removeProfile, isInputValid, ProfileController.removeProfile);
router.delete('/profile/remove/:userId', ProfileValidators.adminRemoveProfile, isInputValid, ProfileController.adminRemoveProfile);

export default router;
