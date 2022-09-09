import {Router} from 'express';
import {accountController} from '../controller';
import {userValidator} from '../utils/validators';

const router = Router();

router.post('/account/register', userValidator.register, userValidator.isInputValid, accountController.register);
router.post('/account/register/confirm', userValidator.verifyEmail, userValidator.isInputValid, accountController.verifyEmail);
router.post('/account/login', accountController.login);
router.put('/account/update', userValidator.update, userValidator.isInputValid, accountController.update);
router.put('/account/forgotPassword', userValidator.forgotPassword, userValidator.isInputValid, accountController.forgotPassword);
router.put(
    '/account/forgotPassword/confirm',
    userValidator.confirmForgotPassword,
    userValidator.isInputValid,
    accountController.confirmForgotPassword,
);
router.delete('/account/remove', userValidator.removeAccount, userValidator.isInputValid, accountController.removeAccount);

export default router;
