import {Router} from 'express';
import {userController} from '../controller';
import {userValidator} from '../utils/validators';

const router = Router();

router.post('/users/signup', userValidator.signUp, userValidator.isInputValid, userController.signUp);
router.post('/users/signup/confirm', userValidator.confirmSignUp, userValidator.isInputValid, userController.confirmSignUp);
router.post('/users/signin', userController.signIn);
router.put('/users/updateAttributes', userValidator.updateUserAttributes, userValidator.isInputValid, userController.updateUserAttributes);

export default router;
