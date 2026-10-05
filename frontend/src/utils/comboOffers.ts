// src/utils/comboOffers.ts

export interface CartItemLike {
  productId: number | string;
  name: string;
  price: number;
  quantity: number;
  size?: string;
  image?: string;
  subcategory?: string;
  category?: string;
}

export interface ComboResult {
  isEligible: boolean;
  totalEligibleQty: number;
  bundleCount: number;
  remainderQty: number;
  neededForNext: number;
  progress: number;
  comboDiscount: number;
  regularEligiblePrice: number;
  finalEligiblePrice: number;
}

// Check if a product is a Sleeveless Shorts Set
export const isSleevelessShortsSet = (item: { name?: string; subcategory?: string; category?: string }): boolean => {
  const name = (item.name || '').toLowerCase();
  const sub = (item.subcategory || '').toLowerCase();
  
  return (
    name.includes('sleevless') ||
    name.includes('sleeveless') ||
    sub.includes('sleeveless')
  );
};

// Calculate 5 for ₹999 Combo Offer
export const calculateSleevelessCombo = (cartItems: CartItemLike[]): ComboResult => {
  const eligibleItems = cartItems.filter(isSleevelessShortsSet);
  const totalEligibleQty = eligibleItems.reduce((sum, item) => sum + item.quantity, 0);

  if (totalEligibleQty === 0) {
    return {
      isEligible: false,
      totalEligibleQty: 0,
      bundleCount: 0,
      remainderQty: 0,
      neededForNext: 5,
      progress: 0,
      comboDiscount: 0,
      regularEligiblePrice: 0,
      finalEligiblePrice: 0
    };
  }

  const bundleCount = Math.floor(totalEligibleQty / 5);
  const remainderQty = totalEligibleQty % 5;
  const neededForNext = remainderQty === 0 ? (bundleCount > 0 ? 0 : 5) : 5 - remainderQty;
  const progress = remainderQty === 0 && bundleCount > 0 ? 100 : (remainderQty / 5) * 100;

  // Calculate regular price of all eligible items in cart
  const regularEligiblePrice = eligibleItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const averageItemPrice = regularEligiblePrice / totalEligibleQty;

  // Final price = (bundles * ₹999) + (remaining single items * average item price)
  const finalEligiblePrice = (bundleCount * 999) + (remainderQty * averageItemPrice);
  const comboDiscount = Math.max(0, Math.round(regularEligiblePrice - finalEligiblePrice));

  return {
    isEligible: true,
    totalEligibleQty,
    bundleCount,
    remainderQty,
    neededForNext,
    progress,
    comboDiscount,
    regularEligiblePrice: Math.round(regularEligiblePrice),
    finalEligiblePrice: Math.round(finalEligiblePrice)
  };
};