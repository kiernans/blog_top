import { Router } from 'express';
import { prisma } from '@lib/prisma';

const router = Router();

router.get('/', async (req, res) => {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
    },
  });

  return res.json(users);
});

export default router;
