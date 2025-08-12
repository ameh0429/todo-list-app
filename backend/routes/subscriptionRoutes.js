import express from 'express';
import { saveSubscription, subscribeTask } from '../controllers/subscriptionController.js';

const router = express.Router();

router.post('/save-subscription', saveSubscription);
router.post('/subscribe-task', subscribeTask);

export default router;
