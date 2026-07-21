// src/lib/seo.ts
export interface SEOProps {
  title: string;
  description: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: "website" | "product" | "article";
}

export const SEOUtils = {
  // =========================
  // HOME PAGE
  // =========================

  getHomeTitle: () =>
    "Aazhi | Premium Cotton Baby Clothes & Kids Wear Online",

  getHomeDescription: () =>
    "Shop premium baby clothes and kids wear online at Aazhi. 100% soft cotton clothing for newborns, infants, boys, girls and women. Made with love.",

  getHomeKeywords: () => [
    "baby clothes",
    "kids wear",
    "newborn clothes",
    "cotton baby clothes",
    "baby dress",
    "Aazhi",
  ],

  // =========================
  // CATEGORY
  // =========================

  getCategoryTitle: (category: string) => {
    const titles: Record<string, string> = {
      newborn: "Newborn Baby Clothes | Buy Tiruppur Cotton Kids Wear | Aazhi",
      girls: "Girls Clothing | Buy Tiruppur Cotton Kids Wear | Aazhi",
      boys: "Boys Clothing | Buy Tiruppur Cotton Kids Wear | Aazhi",
      unisex: "Unisex Baby Clothes | Buy Tiruppur Cotton Kids Wear | Aazhi",
      women: "Women's Cotton Wear | Buy Tiruppur Cotton Kids Wear | Aazhi",
      bathing: "Baby Bath Towels | Buy Tiruppur Cotton Kids Wear | Aazhi",
      bedding: "Baby Bedding Collection | Buy Tiruppur Cotton Kids Wear | Aazhi",
      accessories: "Baby Accessories | Buy Tiruppur Cotton Kids Wear | Aazhi",
    };

    return titles[category.toLowerCase()] || `${category} | Buy Tiruppur Cotton Kids Wear | Aazhi`;
  },

  getCategoryDescription: (category: string) =>
    `Shop premium ${category} collection at Aazhi. Soft cotton clothing for babies and kids with premium quality and affordable prices.`,

  getCategoryKeywords: (category: string) => [
    category,
    "Tiruppur cotton kids wear",
    "baby clothes",
    "kids wear",
    "cotton baby clothes",
    "Aazhi",
  ],

  // =========================
  // PRODUCT PAGE - YOUR EXACT TEMPLATE
  // =========================

  getProductTitle: (productName: string) => {
    // Clean the product name (remove any existing suffix)
    const cleanName = productName.split("|")[0].trim();
    
    // ✅ EXACT TEMPLATE YOU REQUESTED
    return `${cleanName} | Buy Tiruppur Cotton Kids Wear | Aazhi`;
  },

  getProductDescription: (productName: string, category?: string) => {
    const cleanName = productName.split("|")[0].trim();
    return `Buy ${cleanName} online at Aazhi. Premium Tiruppur cotton kids wear made from soft breathable cotton. Comfortable, skin-friendly and perfect for everyday wear. Shop now!`;
  },

  getProductKeywords: (productName: string, category: string) => {
    const cleanName = productName.split("|")[0].trim();
    return [
      cleanName,
      "Tiruppur cotton kids wear",
      category,
      "baby clothes",
      "kids wear",
      "cotton baby clothes",
      "newborn clothes",
      "Aazhi",
    ].filter(Boolean);
  },

  // =========================
  // STATIC PAGES
  // =========================

  getPageTitle: (page: string) => {
    const titles: Record<string, string> = {
      about: "About Us | Buy Tiruppur Cotton Kids Wear | Aazhi",
      contact: "Contact Us | Buy Tiruppur Cotton Kids Wear | Aazhi",
      blog: "Baby Care Blog | Buy Tiruppur Cotton Kids Wear | Aazhi",
      shipping: "Shipping Policy | Buy Tiruppur Cotton Kids Wear | Aazhi",
      returns: "Return Policy | Buy Tiruppur Cotton Kids Wear | Aazhi",
      cart: "Shopping Cart | Buy Tiruppur Cotton Kids Wear | Aazhi",
      checkout: "Secure Checkout | Buy Tiruppur Cotton Kids Wear | Aazhi",
      orders: "My Orders | Buy Tiruppur Cotton Kids Wear | Aazhi",
      profile: "My Account | Buy Tiruppur Cotton Kids Wear | Aazhi",
      wishlist: "Wishlist | Buy Tiruppur Cotton Kids Wear | Aazhi",
      search: "Search Products | Buy Tiruppur Cotton Kids Wear | Aazhi",
    };

    return titles[page] || `${page} | Buy Tiruppur Cotton Kids Wear | Aazhi`;
  },

  getPageDescription: (page: string) =>
    `Visit the ${page} page of Aazhi Premium for premium Tiruppur cotton kids wear, secure shopping and customer support.`,

  getPageKeywords: (page: string) => [
    page,
    "Tiruppur cotton kids wear",
    "Aazhi",
    "baby clothes",
    "kids wear",
  ],

  // =========================
  // TITLE VALIDATION
  // =========================

  truncateTitle: (title: string) => {
    // Google's 60-character limit
    if (title.length > 60) {
      // Keep the product name and suffix, truncate middle if needed
      const suffix = " | Buy Tiruppur Cotton Kids Wear | Aazhi";
      const maxNameLength = 60 - suffix.length;
      const productName = title.split("|")[0].trim();
      
      if (productName.length > maxNameLength) {
        return `${productName.slice(0, maxNameLength - 3)}...${suffix}`;
      }
      return title;
    }
    return title;
  },

  // Helper to check title length
  validateTitle: (title: string) => {
    const length = title.length;
    return {
      length,
      isValid: length <= 60,
      isTooLong: length > 60,
      remaining: Math.max(0, 60 - length),
      suggestion: length > 60 ? `Title is ${length - 60} characters too long` : "Title length is good"
    };
  }
};