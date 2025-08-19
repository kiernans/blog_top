import { prisma } from '@lib/prisma';
import { NextFunction, Request, Response } from 'express';
import { body, validationResult, matchedData } from 'express-validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const validateUser = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .normalizeEmail()
    .isEmail()
    .withMessage('Must be in email format')
    .isLength({ min: 1, max: 30 })
    .withMessage('Email length must be between 1 and 30 characters'),
  body('password').trim().notEmpty().withMessage('Password is required'),
];

const login = [
  ...validateUser,
  async (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);

    //Validation failed
    if (!errors.isEmpty()) {
      return res.status(401).json(errors);
    }

    try {
      const { email, password } = matchedData(req);
      const user = await prisma.user.findUnique({
        where: {
          email,
        },
        select: {
          id: true,
          email: true,
          name: true,
          password: true,
        },
      });

      if (!user) throw new Error('Login failed');

      const passwordMatches = await bcrypt.compare(password, user.password);

      if (!passwordMatches) throw new Error('Login failed');

      // Create JWT and send back to client
      jwt.sign(
        // Used to create token, don't include sensitive info
        { name: user.name, email: user.email },
        'secret key',
        { expiresIn: '1200s' },
        (err, token) => {
          return res.status(201).json({
            success: true,
            message: 'Login successful',
            data: user,
            token,
          });
        },
      );
    } catch (err) {
      console.error(err);
      if (err instanceof Error) {
        return res.status(401).json({
          success: false,
          message: err.message,
        });
      } else next(err);
    }
  },
];

export default { login };
