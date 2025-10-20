import { Request, Response } from 'express';
import { prisma } from '@/prisma';
import { gorseService } from '@/services/gorse';
import { StatusCodes } from 'http-status-codes';

export class RecommendationController {
  
  // Get personalized dish recommendations for a customer
  static async getPersonalizedRecommendations(req: Request, res: Response) {
    try {
      const { customerId } = req.params;
      const { limit = 10, mealType, categoryId } = req.query;

      // Validate customer exists
      const customer = await prisma.customer.findUnique({
        where: { id: parseInt(customerId) },
        include: { preferences: true }
      });

      if (!customer) {
        return res.status(StatusCodes.NOT_FOUND).json({
          error: 'Customer not found'
        });
      }

      // Get categories filter if specified
      let categories: string[] = [];
      if (categoryId) {
        categories = [categoryId.toString()];
      } else if (customer.preferences?.preferredCategories) {
        categories = JSON.parse(customer.preferences.preferredCategories);
      }

      // Get recommendations from Gorse
      const recommendations = await gorseService.getRecommendationsForUser(
        customerId,
        parseInt(limit.toString()),
        categories.length > 0 ? categories : undefined
      );

      // Get dish details from database
      const dishIds = recommendations.map(rec => parseInt(rec.ItemId));
      const dishes = await prisma.dish.findMany({
        where: {
          id: { in: dishIds },
          // Filter by meal type if specified
          ...(mealType && {
            menuItems: {
              some: {
                menuSection: {
                  menu: {
                    meal: mealType as any
                  }
                }
              }
            }
          })
        },
        include: {
          category: true,
          analytics: true,
          menuItems: {
            include: {
              menuSection: {
                include: {
                  menu: true
                }
              }
            }
          }
        }
      });

      // Combine recommendations with dish data and preserve order
      const recommendedDishes = recommendations
        .map(rec => {
          const dish = dishes.find(d => d.id.toString() === rec.ItemId);
          return dish ? {
            ...dish,
            recommendationScore: rec.Score,
            reason: RecommendationController.getRecommendationReason(
              customer, dish, rec.Score
            )
          } : null;
        })
        .filter(Boolean);

      // If we don't have enough personalized recommendations, 
      // supplement with popular dishes
      if (recommendedDishes.length < parseInt(limit.toString())) {
        const needed = parseInt(limit.toString()) - recommendedDishes.length;
        const popularRecommendations = await gorseService.getPopularItems(
          needed,
          categories.length > 0 ? categories[0] : undefined
        );

        const existingIds = recommendedDishes.map(d => d!.id.toString());
        const popularDishIds = popularRecommendations
          .map(rec => parseInt(rec.ItemId))
          .filter(id => !existingIds.includes(id.toString()));

        if (popularDishIds.length > 0) {
          const popularDishes = await prisma.dish.findMany({
            where: { id: { in: popularDishIds } },
            include: {
              category: true,
              analytics: true,
              menuItems: {
                include: {
                  menuSection: {
                    include: {
                      menu: true
                    }
                  }
                }
              }
            }
          });

          const popularWithScore = popularDishes.map(dish => ({
            ...dish,
            recommendationScore: 0.5, // Lower score for popular items
            reason: 'Popular choice among other customers'
          }));

          recommendedDishes.push(...popularWithScore);
        }
      }

      res.json({
        customerId: parseInt(customerId),
        recommendations: recommendedDishes.slice(0, parseInt(limit.toString())),
        metadata: {
          totalRecommendations: recommendedDishes.length,
          isPersonalized: recommendations.length > 0,
          mealType,
          categories
        }
      });

    } catch (error) {
      console.error('Error getting personalized recommendations:', error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: 'Failed to get recommendations'
      });
    }
  }

  // Get popular dishes (fallback for new customers)
  static async getPopularDishes(req: Request, res: Response) {
    try {
      const { limit = 10, mealType, categoryId } = req.query;

      let categories: string[] = [];
      if (categoryId) {
        categories = [categoryId.toString()];
      }

      const popularRecommendations = await gorseService.getPopularItems(
        parseInt(limit.toString()),
        categories.length > 0 ? categories[0] : undefined
      );

      const dishIds = popularRecommendations.map(rec => parseInt(rec.ItemId));
      const dishes = await prisma.dish.findMany({
        where: {
          id: { in: dishIds },
          ...(mealType && {
            menuItems: {
              some: {
                menuSection: {
                  menu: {
                    meal: mealType as any
                  }
                }
              }
            }
          })
        },
        include: {
          category: true,
          analytics: true
        }
      });

      const popularDishes = popularRecommendations
        .map(rec => {
          const dish = dishes.find(d => d.id.toString() === rec.ItemId);
          return dish ? {
            ...dish,
            recommendationScore: rec.Score,
            reason: 'Popular among all customers'
          } : null;
        })
        .filter(Boolean);

      res.json({
        recommendations: popularDishes,
        metadata: {
          totalRecommendations: popularDishes.length,
          type: 'popular',
          mealType,
          categories
        }
      });

    } catch (error) {
      console.error('Error getting popular dishes:', error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: 'Failed to get popular dishes'
      });
    }
  }

  // Record customer feedback (order, rating, like/dislike)
  static async recordFeedback(req: Request, res: Response) {
    try {
      const { customerId, dishId, feedbackType, rating, orderId } = req.body;

      // Validate input
      if (!customerId || !dishId || !feedbackType) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          error: 'customerId, dishId, and feedbackType are required'
        });
      }

      // Store feedback in local database
      const feedback = await prisma.customerDishFeedback.create({
        data: {
          customerId: parseInt(customerId),
          dishId: parseInt(dishId),
          feedbackType,
          rating: rating ? parseFloat(rating) : null,
          orderId: orderId ? parseInt(orderId) : null
        }
      });

      // Send feedback to Gorse
      await gorseService.insertSingleFeedback({
        FeedbackType: feedbackType,
        UserId: customerId.toString(),
        ItemId: dishId.toString(),
        Timestamp: new Date().toISOString()
      });

      // Update dish analytics
      await RecommendationController.updateDishAnalytics(parseInt(dishId));

      res.status(StatusCodes.CREATED).json({
        message: 'Feedback recorded successfully',
        feedback
      });

    } catch (error) {
      console.error('Error recording feedback:', error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: 'Failed to record feedback'
      });
    }
  }

  // Sync customer data to Gorse
  static async syncCustomerToGorse(customerId: number) {
    try {
      const customer = await prisma.customer.findUnique({
        where: { id: customerId },
        include: {
          preferences: true,
          order: {
            include: {
              orderItems: {
                include: {
                  dish: {
                    include: {
                      category: true
                    }
                  }
                }
              }
            }
          }
        }
      });

      if (!customer) return;

      // Create user labels based on preferences and order history
      const labels: string[] = [];
      
      if (customer.preferences) {
        if (customer.preferences.isVegetarian) labels.push('vegetarian');
        if (customer.preferences.isVegan) labels.push('vegan');
        if (customer.preferences.isGlutenFree) labels.push('gluten-free');
        labels.push(`spice-level-${customer.preferences.spiceLevel}`);
        
        if (customer.preferences.preferredCategories) {
          const preferred = JSON.parse(customer.preferences.preferredCategories);
          preferred.forEach((catId: string) => labels.push(`prefers-category-${catId}`));
        }
      }

      // Add behavioral labels
      if (customer.order.length > 10) labels.push('frequent-customer');
      if (customer.loyaltyPoints > 1000) labels.push('high-value-customer');

      await gorseService.createOrUpdateUser({
        UserId: customerId.toString(),
        Labels: labels,
        Comment: `Customer: ${customer.name}`
      });

    } catch (error) {
      console.error(`Error syncing customer ${customerId} to Gorse:`, error);
    }
  }

  // Sync dish data to Gorse
  static async syncDishToGorse(dishId: number) {
    try {
      const dish = await prisma.dish.findUnique({
        where: { id: dishId },
        include: {
          category: true,
          analytics: true,
          menuItems: {
            include: {
              menuSection: {
                include: {
                  menu: true
                }
              }
            }
          }
        }
      });

      if (!dish) return;

      const categories: string[] = [];
      const labels: string[] = [];

      // Add category information
      if (dish.category) {
        categories.push(dish.category.id.toString());
        categories.push(dish.category.name.toLowerCase().replace(/\s+/g, '-'));
      }

      // Add meal type information
      dish.menuItems.forEach(menuItem => {
        if (menuItem.menuSection.menu.meal) {
          categories.push(menuItem.menuSection.menu.meal.toLowerCase());
        }
      });

      // Add labels based on dish properties
      if (dish.price < 10) labels.push('budget-friendly');
      else if (dish.price > 25) labels.push('premium');
      else labels.push('mid-range');

      if (dish.analytics) {
        if (dish.analytics.averageRating > 4.0) labels.push('highly-rated');
        if (dish.analytics.popularityScore > 0.8) labels.push('popular');
      }

      // Add ingredient-based labels (you can enhance this based on ingredients)
      const dishName = dish.name.toLowerCase();
      if (dishName.includes('chicken')) labels.push('chicken');
      if (dishName.includes('beef')) labels.push('beef');
      if (dishName.includes('fish')) labels.push('fish');
      if (dishName.includes('vegetarian') || dishName.includes('veggie')) labels.push('vegetarian');
      if (dishName.includes('spicy')) labels.push('spicy');

      await gorseService.createOrUpdateItem({
        ItemId: dishId.toString(),
        Categories: categories,
        Timestamp: dish.createdAt?.toISOString() || new Date().toISOString(),
        Labels: labels,
        Comment: dish.name
      });

    } catch (error) {
      console.error(`Error syncing dish ${dishId} to Gorse:`, error);
    }
  }

  // Helper method to generate recommendation reasons
  private static getRecommendationReason(customer: any, dish: any, score: number): string {
    if (score > 0.8) {
      return `Highly recommended based on your preferences`;
    } else if (score > 0.6) {
      return `Good match for your taste`;
    } else if (score > 0.4) {
      return `Similar to dishes you've enjoyed`;
    } else {
      return `Popular choice among similar customers`;
    }
  }

  // Helper method to update dish analytics
  private static async updateDishAnalytics(dishId: number) {
    try {
      // Get feedback statistics
      const feedbackStats = await prisma.customerDishFeedback.groupBy({
        by: ['dishId'],
        where: { dishId },
        _avg: { rating: true },
        _count: { rating: true }
      });

      const orderCount = await prisma.orderItem.count({
        where: { dishId }
      });

      const avgRating = feedbackStats[0]?._avg.rating || 0;
      const ratingCount = feedbackStats[0]?._count.rating || 0;

      // Calculate popularity score (you can enhance this algorithm)
      const popularityScore = Math.min(
        (orderCount * 0.7 + ratingCount * 0.3) / 100,
        1.0
      );

      await prisma.dishAnalytics.upsert({
        where: { dishId },
        update: {
          totalOrders: orderCount,
          totalRatings: ratingCount,
          averageRating: avgRating,
          popularityScore
        },
        create: {
          dishId,
          totalOrders: orderCount,
          totalRatings: ratingCount,
          averageRating: avgRating,
          popularityScore
        }
      });

    } catch (error) {
      console.error(`Error updating analytics for dish ${dishId}:`, error);
    }
  }
}