import cron from 'node-cron';
import { prisma } from '@/prisma';
import { gorseService } from './gorse';
import { RecommendationController } from '@/controllers/recommendations';

class GorseSyncService {
  
  // Initialize data synchronization
  async initializeSync() {
    console.log('Starting Gorse data synchronization...');
    
    try {
      // Check if Gorse is healthy
      const isHealthy = await gorseService.healthCheck();
      if (!isHealthy) {
        console.error('Gorse is not healthy. Skipping sync.');
        return;
      }

      // Sync all customers
      await this.syncAllCustomers();
      
      // Sync all dishes
      await this.syncAllDishes();
      
      // Sync historical feedback
      await this.syncHistoricalFeedback();
      
      console.log('Initial Gorse synchronization completed');
      
      // Start periodic sync jobs
      this.startPeriodicSync();
      
    } catch (error) {
      console.error('Error during Gorse initialization:', error);
    }
  }

  // Sync all customers to Gorse
  private async syncAllCustomers() {
    try {
      const customers = await prisma.customer.findMany();
      
      console.log(`Syncing ${customers.length} customers to Gorse...`);
      
      for (const customer of customers) {
        await RecommendationController.syncCustomerToGorse(customer.id);
        
        // Small delay to avoid overwhelming Gorse
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      console.log('All customers synced to Gorse');
    } catch (error) {
      console.error('Error syncing customers to Gorse:', error);
    }
  }

  // Sync all dishes to Gorse
  private async syncAllDishes() {
    try {
      const dishes = await prisma.dish.findMany();
      
      console.log(`Syncing ${dishes.length} dishes to Gorse...`);
      
      for (const dish of dishes) {
        await RecommendationController.syncDishToGorse(dish.id);
        
        // Small delay to avoid overwhelming Gorse
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      console.log('All dishes synced to Gorse');
    } catch (error) {
      console.error('Error syncing dishes to Gorse:', error);
    }
  }

  // Sync historical order data as feedback
  private async syncHistoricalFeedback() {
    try {
      // Get all order items as implicit positive feedback
      const orderItems = await prisma.orderItem.findMany({
        include: {
          order: true
        },
        take: 10000 // Limit to avoid memory issues
      });

      console.log(`Syncing ${orderItems.length} historical orders as feedback...`);

      const feedbackBatch = orderItems.map(item => ({
        FeedbackType: 'order',
        UserId: item.order.customerId?.toString() || '',
        ItemId: item.dishId.toString(),
        Timestamp: item.order.createdAt.toISOString()
      })).filter(feedback => feedback.UserId !== '');

      // Send in batches of 1000
      const batchSize = 1000;
      for (let i = 0; i < feedbackBatch.length; i += batchSize) {
        const batch = feedbackBatch.slice(i, i + batchSize);
        await gorseService.insertFeedback(batch);
        
        console.log(`Synced batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(feedbackBatch.length / batchSize)}`);
        
        // Small delay between batches
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // Sync explicit feedback
      const explicitFeedback = await prisma.customerDishFeedback.findMany();
      
      if (explicitFeedback.length > 0) {
        const explicitFeedbackBatch = explicitFeedback.map(feedback => ({
          FeedbackType: feedback.feedbackType,
          UserId: feedback.customerId.toString(),
          ItemId: feedback.dishId.toString(),
          Timestamp: feedback.timestamp.toISOString()
        }));

        await gorseService.insertFeedback(explicitFeedbackBatch);
        console.log(`Synced ${explicitFeedback.length} explicit feedback entries`);
      }

      console.log('Historical feedback sync completed');
    } catch (error) {
      console.error('Error syncing historical feedback:', error);
    }
  }

  // Start periodic synchronization jobs
  private startPeriodicSync() {
    // Sync new orders every 5 minutes
    cron.schedule('*/5 * * * *', async () => {
      await this.syncRecentOrders();
    });

    // Update dish analytics every hour
    cron.schedule('0 * * * *', async () => {
      await this.updateAllDishAnalytics();
    });

    // Full sync daily at 2 AM
    cron.schedule('0 2 * * *', async () => {
      await this.fullDailySync();
    });

    console.log('Periodic sync jobs started');
  }

  // Sync orders from the last 10 minutes
  private async syncRecentOrders() {
    try {
      const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
      
      const recentOrders = await prisma.orderItem.findMany({
        where: {
          order: {
            createdAt: {
              gte: tenMinutesAgo
            }
          }
        },
        include: {
          order: true
        }
      });

      if (recentOrders.length === 0) return;

      const feedbackBatch = recentOrders
        .filter(item => item.order.customerId)
        .map(item => ({
          FeedbackType: 'order',
          UserId: item.order.customerId!.toString(),
          ItemId: item.dishId.toString(),
          Timestamp: item.order.createdAt.toISOString()
        }));

      if (feedbackBatch.length > 0) {
        await gorseService.insertFeedback(feedbackBatch);
        console.log(`Synced ${feedbackBatch.length} recent orders to Gorse`);
      }

    } catch (error) {
      console.error('Error syncing recent orders:', error);
    }
  }

  // Update analytics for all dishes
  private async updateAllDishAnalytics() {
    try {
      const dishes = await prisma.dish.findMany({
        select: { id: true }
      });

      for (const dish of dishes) {
        await RecommendationController['updateDishAnalytics'](dish.id);
      }

      console.log('Updated analytics for all dishes');
    } catch (error) {
      console.error('Error updating dish analytics:', error);
    }
  }

  // Full daily synchronization
  private async fullDailySync() {
    try {
      console.log('Starting daily full sync...');
      
      await this.syncAllCustomers();
      await this.syncAllDishes();
      
      console.log('Daily full sync completed');
    } catch (error) {
      console.error('Error during daily full sync:', error);
    }
  }
}

export const gorseSyncService = new GorseSyncService();