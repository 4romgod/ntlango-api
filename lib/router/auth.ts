import {Router} from 'express';
import {AuthController} from '../controller';
import {AuthValidators, isInputValid} from '../middleware/validators';

const router = Router();

AuthController.initialize();
router.post('/auth/register', AuthValidators.register, isInputValid, AuthController.register);
router.post('/auth/login', AuthValidators.login, isInputValid, AuthController.login);
router.post('/auth/logout', AuthController.logout);

export default router;
