import {Router} from 'express';
import {accountController} from '../controller';
import {accountValidator, isInputValid} from '../utils/validators';

const router = Router();

router.post('/account/register', accountValidator.register, isInputValid, accountController.register);
router.post('/account/login', accountController.login);
router.put('/account/update', accountValidator.update, isInputValid, accountController.update);
router.put('/account/forgotPassword', accountValidator.forgotPassword, isInputValid, accountController.forgotPassword);
router.put('/account/forgotPassword/confirm', accountValidator.confirmForgotPassword, isInputValid, accountController.confirmForgotPassword);
router.delete('/account/remove', accountValidator.removeAccount, isInputValid, accountController.removeAccount);
router.delete('/account/remove/:username', accountValidator.adminRemoveAccount, isInputValid, accountController.adminRemoveAccount);

export default router;
