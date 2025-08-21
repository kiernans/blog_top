import { prisma } from '@lib/prisma';
import type { User } from '@genPrisma/client';
import { Request, Response } from 'express';

async function getComments(req: Request, res: Response) {
  try {
    const { postId } = req.params;
    const comments = await prisma.comment.findMany({
      where: {
        postId,
      },
    });

    return res.status(201).json({
      success: true,
      data: comments,
    });
  } catch (err) {
    console.error(err);

    return res.status(501).json({
      success: false,
      message: 'Unable to retrieve comments',
    });
  }
}

async function createComment(req: Request, res: Response) {
  try {
    if (!req.user) throw new Error('Unauthorized');
    const user = req.user as User;
    const userId = user.id;
    // WARNING: mergeParams in comments.ts is needed to allow commentsController.createComment
    // access req.params and get postId
    const { postId } = req.params;
    const { content } = req.body;

    const comment = await prisma.comment.create({
      data: {
        content,
        postId,
        userId,
      },
    });
    console.log(comment);
    return res.status(201).json({
      success: true,
      message: 'Comment created successfully',
    });
  } catch (err) {
    console.error(err);

    return res.status(501).json({
      success: false,
      error: err,
    });
  }
}

async function getComment(req: Request, res: Response) {
  try {
    const { commentId: id } = req.params;

    const comment = await prisma.comment.findUnique({
      where: { id },
    });

    if (!comment) throw new Error('Comment not found');

    return res.status(201).json({
      success: true,
      data: comment,
    });
  } catch (err) {
    console.error(err);

    return res.status(501).json({
      success: false,
      error: err,
    });
  }
}

async function updateComment(req: Request, res: Response) {
  try {
    if (!req.user) throw new Error('Unauthorized');
    const user = req.user as User;
    const userId = user.id;
    const { postId, commentId: id } = req.params;

    const { content } = req.body;

    const comment = await prisma.comment.update({
      where: { id, postId, userId },
      data: {
        content,
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Comment updated successfully',
      data: comment,
    });
  } catch (err) {
    console.error(err);

    return res.status(501).json({
      success: false,
      error: err,
    });
  }
}

async function deleteComment(req: Request, res: Response) {
  try {
    if (!req.user) throw new Error('Unauthorized');
    const user = req.user as User;
    const userId = user.id;
    const { postId, commentId: id } = req.params;

    const comment = await prisma.comment.delete({
      where: {
        id,
        postId,
        userId,
      },
    });

    if (!comment) throw new Error('Comment not found');

    return res.status(201).json({
      success: true,
      message: 'Comment deleted successfully',
      data: comment,
    });
  } catch (err) {
    console.error(err);

    return res.status(501).json({
      success: false,
      error: err,
    });
  }
}

export default {
  getComments,
  createComment,
  getComment,
  updateComment,
  deleteComment,
};
