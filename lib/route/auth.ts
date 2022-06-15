import { Router } from 'express';
import { signup } from '../controller/auth';

const router = Router();

router.post('/signup', signup);
router.get('/signout', () => {console.log('signing out...')});

export default router;
