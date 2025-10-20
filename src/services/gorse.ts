import axios, { AxiosInstance } from 'axios';

interface GorseUser {
  UserId: string;
  Labels: string[];
  Comment?: string;
}

interface GorseItem {
  ItemId: string;
  Categories: string[];
  Timestamp: string;
  Labels: string[];
  Comment?: string;
}

interface GorseFeedback {
  FeedbackType: string;
  UserId: string;
  ItemId: string;
  Timestamp: string;
  Comment?: string;
}

interface GorseRecommendation {
  ItemId: string;
  Score: number;
}

class GorseService {
  private client: AxiosInstance;
  
  constructor() {
    this.client = axios.create({
      baseURL: process.env.GORSE_API_URL || 'http://localhost:8088',
      headers: {
        'X-API-Key': process.env.GORSE_API_KEY || 'gprms_api_key_2024',
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
  }

  // User Management
  async createOrUpdateUser(user: GorseUser): Promise<void> {
    try {
      await this.client.patch(`/api/user/${user.UserId}`, user);
      console.log(`User ${user.UserId} created/updated in Gorse`);
    } catch (error) {
      console.error('Error creating/updating user in Gorse:', error);
      throw error;
    }
  }

  async deleteUser(userId: string): Promise<void> {
    try {
      await this.client.delete(`/api/user/${userId}`);
      console.log(`User ${userId} deleted from Gorse`);
    } catch (error) {
      console.error('Error deleting user from Gorse:', error);
      throw error;
    }
  }

  // Item Management (Dishes)
  async createOrUpdateItem(item: GorseItem): Promise<void> {
    try {
      await this.client.patch(`/api/item/${item.ItemId}`, item);
      console.log(`Item ${item.ItemId} created/updated in Gorse`);
    } catch (error) {
      console.error('Error creating/updating item in Gorse:', error);
      throw error;
    }
  }

  async deleteItem(itemId: string): Promise<void> {
    try {
      await this.client.delete(`/api/item/${itemId}`);
      console.log(`Item ${itemId} deleted from Gorse`);
    } catch (error) {
      console.error('Error deleting item from Gorse:', error);
      throw error;
    }
  }

  // Feedback Management
  async insertFeedback(feedback: GorseFeedback[]): Promise<void> {
    try {
      await this.client.post('/api/feedback', feedback);
      console.log(`${feedback.length} feedback entries inserted into Gorse`);
    } catch (error) {
      console.error('Error inserting feedback into Gorse:', error);
      throw error;
    }
  }

  async insertSingleFeedback(feedback: GorseFeedback): Promise<void> {
    await this.insertFeedback([feedback]);
  }

  // Recommendations
  async getRecommendationsForUser(
    userId: string, 
    n: number = 10,
    categories?: string[]
  ): Promise<GorseRecommendation[]> {
    try {
      const params = new URLSearchParams();
      params.append('n', n.toString());
      if (categories && categories.length > 0) {
        categories.forEach(cat => params.append('category', cat));
      }

      const response = await this.client.get(
        `/api/recommend/${userId}?${params.toString()}`
      );
      
      return response.data.map((rec: any) => ({
        ItemId: rec.Id || rec.ItemId,
        Score: rec.Score || 1.0
      }));
    } catch (error) {
      console.error(`Error getting recommendations for user ${userId}:`, error);
      throw error;
    }
  }

  async getPopularItems(
    n: number = 10,
    category?: string
  ): Promise<GorseRecommendation[]> {
    try {
      const params = new URLSearchParams();
      params.append('n', n.toString());
      if (category) {
        params.append('category', category);
      }

      const response = await this.client.get(`/api/popular?${params.toString()}`);
      
      return response.data.map((rec: any) => ({
        ItemId: rec.Id || rec.ItemId,
        Score: rec.Score || 1.0
      }));
    } catch (error) {
      console.error('Error getting popular items:', error);
      throw error;
    }
  }

  async getLatestItems(
    n: number = 10,
    category?: string
  ): Promise<GorseRecommendation[]> {
    try {
      const params = new URLSearchParams();
      params.append('n', n.toString());
      if (category) {
        params.append('category', category);
      }

      const response = await this.client.get(`/api/latest?${params.toString()}`);
      
      return response.data.map((rec: any) => ({
        ItemId: rec.Id || rec.ItemId,
        Score: rec.Score || 1.0
      }));
    } catch (error) {
      console.error('Error getting latest items:', error);
      throw error;
    }
  }

  // Health Check
  async healthCheck(): Promise<boolean> {
    try {
      await this.client.get('/api/health');
      return true;
    } catch (error) {
      console.error('Gorse health check failed:', error);
      return false;
    }
  }
}

export const gorseService = new GorseService();
export { GorseUser, GorseItem, GorseFeedback, GorseRecommendation };