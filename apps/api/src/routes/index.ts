import { Router } from 'express';
import dashboard from './dashboard';
import create from './create';
import users from './users';
import login from './login';

const router = Router();

router.use('/', dashboard);
router.use('/create', create);
router.use('/users', users);
router.use('/login', login);

export default router;
