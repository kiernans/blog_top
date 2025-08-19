import bcrypt from 'bcryptjs';
import { Request, Response } from 'express';
import { body, validationResult, Meta, matchedData } from 'express-validator';
import { prisma } from '../lib/prisma';

// The Custom validator uses value and Meta objects as inputs
// Used in validateUser
function passwordMatches(value: string, { req }: Meta) {
  return value === req.body.password;
}

// Fixes issue of typescript not knowing if error has code property
function isPgError(error: unknown): error is { code: string } {
  return typeof error === 'object' && error !== null && 'code' in error;
}

const validateUser = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 1, max: 30 })
    .withMessage('Name length must be between 1 and 30 characters'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .normalizeEmail()
    .isEmail()
    .withMessage('Must be in email format')
    .isLength({ min: 1, max: 30 })
    .withMessage('Email length must be between 1 and 30 characters'),
  body('password')
    .trim()
    .notEmpty()
    .withMessage('Password is required')
    .isStrongPassword(),
  body('confirmPassword')
    .trim()
    .notEmpty()
    .withMessage('Must confirm password')
    .isStrongPassword({
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    })
    .custom(passwordMatches)
    .withMessage('Passwords do not match'),
];

const createUser = [
  ...validateUser,
  async (req: Request, res: Response) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.json(errors);
    }

    try {
      const { email, password, name } = matchedData(req);
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = {
        name,
        email,
        password: hashedPassword,
      };
      const data = await prisma.user.create({
        data: newUser,
      });

      return res.status(201).json({
        success: true,
        message: 'Successfully created new user',
        data,
      });
    } catch (err) {
      //TODO Send error that tells user why user wasn't created
      console.error(err);
      return res.status(401).json({
        success: false,
        message: 'Failed to create new user',
        error: err,
      });
    }
  },
];

export default {
  createUser,
};
