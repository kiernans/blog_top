import { Router } from 'express';
import { prisma } from '@lib/prisma';
import passport from 'passport';

const router = Router();

router.get(
  '/',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
      },
    });

    console.log(req.user);

    return res.json(users);
  },
);

export default router;
