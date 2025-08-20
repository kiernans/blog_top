import { Router } from 'express';
import postsController from 'controllers/postsController';

const router = Router();

router.get('/', postsController.getPosts);
router.get('/:postId', postsController.getPost);

router.post('/', postsController.createPost);

router.put('/:postId', postsController.updatePost);

router.delete('/:postId', postsController.deletePost);

export default router;
