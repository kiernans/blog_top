import { prisma } from '@lib/prisma';
import { NextFunction, Request, Response } from 'express';
import { body, validationResult, matchedData } from 'express-validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { VerifiedCallback } from 'passport-jwt';
import passport from 'passport';

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
        { id: user.id, name: user.name },
        // Tell typescript it will definitely be non null
        process.env.JWT_SECRET!,
        { expiresIn: '1200s' },
        (err, token) => {
          if (err) throw err;

          return res.status(201).json({
            success: true,
            message: 'Login successful',
            token: 'Bearer ' + token,
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

// JWT Payload contains user info provided when JWT was created
async function verifyFunction(jwt_payload: any, done: VerifiedCallback) {
  const id = jwt_payload.id;
  try {
    const user = await prisma.user.findUnique({
      where: {
        id,
      },
      // Select what properties to include in req.user
      // WARNING: Don't include sensitive info
      select: {
        id: true,
        role: true,
        name: true,
        email: true,
      },
    });

    // User not found, authentication failed
    if (!user) return done(null, false);

    // User found, authentication succeeded
    return done(null, user);
  } catch (err) {
    console.log(err);
    done(err, false);
  }
}

export default { login, verifyFunction };
