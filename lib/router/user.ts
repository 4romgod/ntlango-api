import {Router} from 'express';
import userController from '../controller/user';

const router = Router();

router.post('/users/signup', userController.signUp);
router.post('/users/signup/confirm', userController.confirmSignUp);
router.post('/users/signin', userController.signIn);

export default router;
