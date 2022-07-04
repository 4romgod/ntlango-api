import {Router} from 'express';
import userController from '../controller/user';

const router = Router();

router.post('/signup', userController.signUp);
router.post('/signup/confirm', userController.confirmSignUp);
router.post('/signin', userController.signIn);

export default router;
