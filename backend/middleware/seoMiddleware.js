// middleware/seoMiddleware.js

export const seoMiddleware = (req, res, next) => {
  const baseUrl = process.env.BASE_URL || "http://localhost:5000";

  res.locals.getSEOData = (type, data = {}) => {
    const baseSEO = {
      siteName: "Aazhi Premium",
      twitterHandle: "@aazhi",
    };

    switch (type) {
      case "product":
        return {
          title:
            data.seoTitle ||
            `${data.name} | Buy Tiruppur Cotton Kids Wear | Aazhi Premium`,

          description:
            data.seoDescription ||
            `Buy ${data.name} online at Aazhi. Premium Tiruppur cotton kids wear made from 100% soft cotton.`,

          keywords:
            data.seoKeywords || [
              data.name,
              data.category || "Baby Clothes",
              "Cotton Baby Clothes",
              "Kids Wear",
              "Newborn Clothes",
              "Aazhi Premium",
            ],

          image:
            data.image ||
            `${baseUrl}/images/default-product.jpg`,

          url: `${baseUrl}/product/${data._id}`,

          type: "product",

          canonicalUrl:
            data.canonicalUrl ||
            `${baseUrl}/product/${data._id}`,

          metaRobots:
            data.metaRobots || "index, follow",

          structuredData:
            typeof data.getStructuredData === "function"
              ? data.getStructuredData(baseUrl)
              : null,

          ...baseSEO,
        };

      case "category":
        return {
          title: `${data.name} | Aazhi Premium Kids Wear`,

          description: `Shop premium ${data.name} collection at Aazhi. 100% cotton baby clothing and kids wear.`,

          keywords: [
            data.name,
            "Baby Clothes",
            "Kids Wear",
            "Cotton Clothing",
            "Aazhi Premium",
          ],

          image: `${baseUrl}/images/category-default.jpg`,

          url: `${baseUrl}/category/${data.slug}`,

          type: "website",

          canonicalUrl: `${baseUrl}/category/${data.slug}`,

          metaRobots: "index, follow",

          structuredData: null,

          ...baseSEO,
        };

      default:
        return {
          title:
            "Aazhi | Premium Cotton Baby Clothes & Kids Wear",

          description:
            "Shop premium baby clothes, newborn clothing, cotton dresses, rompers, jablas and kids wear online at Aazhi.",

          keywords: [
            "Baby Clothes",
            "Kids Wear",
            "Cotton Baby Clothes",
            "Newborn Clothes",
            "Aazhi Premium",
          ],

          image: `${baseUrl}/images/default-og-image.jpg`,

          url: baseUrl,

          type: "website",

          canonicalUrl: baseUrl,

          metaRobots: "index, follow",

          structuredData: null,

          ...baseSEO,
        };
    }
  };

  next();
};