/**
 * Subscription and access control utilities
 */

export type SubscriptionStatus = 'active' | 'cancelled' | 'expired' | 'pending';
export type BillingPeriod = 'monthly' | 'yearly';

export interface SubscriptionPlan {
  id: string;
  name: string;
  slug: string;
  description?: string;
  priceMonthly: number;
  priceYearly: number;
  features: string[];
  isActive: boolean;
}

export interface UserSubscription {
  id: string;
  userId: string;
  planId: string;
  status: SubscriptionStatus;
  billingPeriod: BillingPeriod;
  startDate: Date;
  endDate: Date;
  autoRenew: boolean;
  paymentMethod?: string;
  transactionId?: string;
}

/**
 * Check if a user has an active subscription
 */
export function hasActiveSubscription(subscription: UserSubscription | null): boolean {
  if (!subscription) return false;

  const now = new Date();
  const endDate = new Date(subscription.endDate);

  return subscription.status === 'active' && endDate > now;
}

/**
 * Check if a channel requires a subscription to access
 */
export function requiresSubscription(channelGroup: string): boolean {
  const channelGroupLower = channelGroup.toLowerCase();

  // Channels that require subscription
  const premiumKeywords = [
    'fr',
    'france',
    'french',
    'sport',
    'foot',
    'ligue',
    'bein',
    'eurosport',
    'canal',
    'ocs',
  ];

  return premiumKeywords.some(keyword => channelGroupLower.includes(keyword));
}

/**
 * Get days remaining in subscription
 */
export function getDaysRemaining(subscription: UserSubscription | null): number {
  if (!subscription) return 0;

  const now = new Date();
  const endDate = new Date(subscription.endDate);

  const diff = endDate.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

/**
 * Calculate subscription end date
 */
export function calculateEndDate(startDate: Date, billingPeriod: BillingPeriod): Date {
  const endDate = new Date(startDate);

  if (billingPeriod === 'monthly') {
    endDate.setMonth(endDate.getMonth() + 1);
  } else {
    endDate.setFullYear(endDate.getFullYear() + 1);
  }

  return endDate;
}

/**
 * Format price in XOF
 */
export function formatPrice(amount: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'decimal',
    minimumFractionDigits: 0,
  }).format(amount) + ' XOF';
}

/**
 * Get subscription plan details
 */
export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'premium',
    name: 'Premium',
    slug: 'premium',
    description: 'Accès complet à toutes les chaînes françaises et sports',
    priceMonthly: 2000,
    priceYearly: 20000,
    features: [
      'Toutes les chaînes françaises',
      'Tous les sports (Ligue 1, Champions League, etc.)',
      'Qualité 4K, HD et SD',
      'Accès illimité 24/7',
      '5 profils maximum',
      'Support prioritaire',
    ],
    isActive: true,
  },
];
