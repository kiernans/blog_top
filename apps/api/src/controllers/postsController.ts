import { prisma } from '@lib/prisma';
import type { User } from '../../generated/prisma/client';
import { Request, Response } from 'express';

async function getPosts(req: Request, res: Response) {
  try {
    const posts = await prisma.post.findMany();

    return res.status(201).json({
      success: true,
      data: posts,
    });
  } catch (err) {
    console.error(err);

    return res.status(401).json({
      success: false,
      message: 'Unable to retrieve posts',
    });
  }
}

async function createPost(req: Request, res: Response) {
  try {
    if (!req.user) throw new Error('Unauthorized');
    const user = req.user as User;
    const userId = user.id;
    const { title, content } = req.body;

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
    console.error(err);
    return res.status(401).json({
      success: false,
      error: err,
    });
  }
}

async function getPost(req: Request, res: Response) {
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
    console.error(err);
    if (err instanceof Error) {
      return res.status(501).json({
        success: false,
        message: err.message,
      });
    }

    return res.status(401).json({
      success: false,
      error: err,
    });
  }
}

// Needed this to create an empty object to store form data only if entered
interface PostData {
  title?: string;
  content?: string;
}

async function updatePost(req: Request, res: Response) {
  try {
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
    console.error(err);
    return res.status(401).json({
      success: false,
      error: err,
    });
  }
}

async function deletePost(req: Request, res: Response) {
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
    console.error(err);

    return res.status(401).json({
      success: false,
      error: err,
    });
  }
}

export default { getPosts, createPost, getPost, updatePost, deletePost };
