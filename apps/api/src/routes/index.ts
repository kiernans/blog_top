import { Router } from 'express';
import passport from 'passport';
import dashboard from './dashboard';
import create from './create';
import users from './users';
import login from './login';
import posts from './posts';

const router = Router();

router.use('/', dashboard);
router.use('/create', create);
router.use('/users', users);
router.use('/login', login);
router.use('/posts', passport.authenticate('jwt', { session: false }), posts);

export default router;
