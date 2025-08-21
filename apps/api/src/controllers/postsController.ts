import { prisma } from '@lib/prisma';
import type { User } from '../../generated/prisma/client';
import { fail } from 'assert';
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
      success: fail,
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
    const { postId } = req.params;
    const id = Number(postId);

    const post = await prisma.post.findUnique({
      where: { id, userId },
    });

    return res.status(201).json({
      success: true,
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
    const { postId } = req.params;
    const id = Number(postId);
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
    const { postId } = req.params;
    const id = Number(postId);

    const post = await prisma.post.delete({
      where: {
        id,
        userId,
      },
    });

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
