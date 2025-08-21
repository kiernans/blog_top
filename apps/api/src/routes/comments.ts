import commentsController from 'controllers/commentsController';
import { Router } from 'express';

// WARNING: mergeParams is needed to allow commentsController.createComment
// access req.params and get postId
const router = Router({ mergeParams: true });

router.get('/', commentsController.getComments);
router.get('/:commentId', commentsController.getComment);

router.post('/', commentsController.createComment);

router.put('/:commentId', commentsController.updateComment);

router.delete('/:commentId', commentsController.deleteComment);

export default router;
