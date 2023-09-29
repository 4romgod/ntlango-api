import {Router} from 'express';
import {AuthController} from '../controller';
import {authValidator, isInputValid} from '../utils';

const router = Router();

AuthController.initialize();
router.post('/auth/register', authValidator.register, isInputValid, AuthController.register);
router.post('/auth/login', authValidator.login, isInputValid, AuthController.login);
router.post('/auth/logout', AuthController.logout);

export default router;
