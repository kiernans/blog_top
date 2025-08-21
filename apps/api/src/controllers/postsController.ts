import { prisma } from '@lib/prisma';
import type { User } from '@genPrisma/client';
import { NextFunction, Request, Response } from 'express';
import { body, validationResult, matchedData } from 'express-validator';

async function getPosts(req: Request, res: Response, next: NextFunction) {
  try {
    const posts = await prisma.post.findMany();

    return res.status(201).json({
      success: true,
      data: posts,
    });
  } catch (err) {
    next(err);
  }
}

// Validate input -> use parameterized queries -> Escape output if needed
const validatePost = [
  body('title')
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage('Title must be between 5 and 100 characters long.')
    .matches(/^[a-zA-Z0-9\s.,!?'"-]+$/)
    .withMessage('Title contains invalid characters.'),

  body('content')
    .trim()
    .isLength({ min: 10 })
    .withMessage('Content must be at least 10 characters long.'),
];

// WARNING Storing post as is after validation, may need to escape output
const createPost = [
  ...validatePost,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);

      //Validation failed
      if (!errors.isEmpty()) {
        return res.status(401).json(errors);
      }

      if (!req.user) throw new Error('Unauthorized');
      const user = req.user as User;
      const userId = user.id;
      const { title, content } = matchedData(req);

      await prisma.post.create({
        data: {
          title,
          content,
          userId,
        },
      });

      return res.status(201).json({
        success: true,
        message: 'Post created successfully',
      });
    } catch (err) {
      next(err);
    }
  },
];

async function getPost(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new Error('Unauthorized');
    const user = req.user as User;
    const userId = user.id;
    const { postId: id } = req.params;

    const post = await prisma.post.findUnique({
      where: { id, userId },
    });

    if (!post) throw new Error('Post not found');

    return res.status(201).json({
      success: true,
      data: post,
    });
  } catch (err) {
    next(err);
  }
}

// Needed this to create an empty object to store form data only if entered
interface PostData {
  title?: string;
  content?: string;
}

// WARNING Storing post as is after validation, may need to escape output
const updatePost = [
  ...validatePost,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);

      //Validation failed
      if (!errors.isEmpty()) {
        return res.status(401).json(errors);
      }

      if (!req.user) throw new Error('Unauthorized');
      const user = req.user as User;
      const userId = user.id;
      const { postId: id } = req.params;
      const { title, content } = req.body;

      const updatedData: PostData = {};
      // Only update filled out sections
      if (title !== undefined) updatedData.title = title;

      if (content !== undefined) updatedData.content = content;

      const post = await prisma.post.update({
        where: {
          id,
          userId,
        },
        data: updatedData,
      });

      if (!post) throw new Error('Post not found');

      return res.status(201).json({
        success: true,
        message: 'Post updated successfully',
        data: post,
      });
    } catch (err) {
      next(err);
    }
  },
];

async function deletePost(req: Request, res: Response, next: NextFunction) {
  try {
    const user = req.user as User;
    const userId = user.id;
    const { postId: id } = req.params;

    const post = await prisma.post.delete({
      where: {
        id,
        userId,
      },
    });

    if (!post) throw new Error('Post not found');

    return res.status(201).json({
      success: true,
      message: 'Post deleted successfully',
      data: post,
    });
  } catch (err) {
    next(err);
  }
}

export default { getPosts, createPost, getPost, updatePost, deletePost };
