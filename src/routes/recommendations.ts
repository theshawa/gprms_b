import { Router } from 'express';
import { RecommendationController } from '@/controllers/recommendations';

const router = Router();

// Get personalized recommendations for a customer
router.get('/customer/:customerId', RecommendationController.getPersonalizedRecommendations);

// Get popular dishes (fallback for new customers)
router.get('/popular', RecommendationController.getPopularDishes);

// Record customer feedback
router.post('/feedback', RecommendationController.recordFeedback);

export { router as recommendationRouter };