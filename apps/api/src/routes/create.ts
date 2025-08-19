import { Router } from 'express';
import signupController from '../controllers/signupController';

const router = Router();

router.post('/', signupController.createUser);

export default router;
