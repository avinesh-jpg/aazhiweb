import express from 'express';
import { randomUUID } from 'crypto';
import jwt from 'jsonwebtoken';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'tiinyberry_secret_key_2024';

const getCartQuery = (req) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      return { userId: decoded.userId };
    } catch(e) {}
  }
  
  let sessionId = req.headers['x-session-id'];
  if (!sessionId) {
    sessionId = randomUUID();
  }
  return { sessionId };
};

// Get cart
router.get('/', async (req, res) => {
  try {
    const query = getCartQuery(req);
    let cart = await Cart.findOne(query);
    
    if (!cart) {
      cart = new Cart({ ...query, items: [] });
      await cart.save();
    }
    
    res.json({ items: cart.items || [] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get cart count
router.get('/count', async (req, res) => {
  try {
    const query = getCartQuery(req);
    const cart = await Cart.findOne(query);
    const count = cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
    res.json({ count });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add item to cart with size and color - UPDATED WITH STOCK CHECK
router.post('/add', async (req, res) => {
  try {
    const { productId, quantity = 1, size = '', color = '', colorImage = '' } = req.body;
    
    console.log('Add to cart request:', { productId, quantity, size, color, colorImage });
    
    if (!productId) {
      return res.status(400).json({ error: 'Product ID required' });
    }
    
    const product = await Product.findOne({ productId: parseInt(productId) });
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    // Check if product has sizes array (new structure with objects)
    const hasNewSizeStructure = product.sizes && product.sizes.length > 0 && typeof product.sizes[0] === 'object';
    const hasOldSizeStructure = product.sizes && product.sizes.length > 0 && typeof product.sizes[0] === 'string';
    const hasSizes = product.sizes && product.sizes.length > 0;
    
    // Handle size validation and stock check
    if (hasSizes) {
      // Check if One Size (no size selection needed)
      const isOneSize = hasNewSizeStructure 
        ? product.sizes[0].name === 'One Size'
        : (hasOldSizeStructure && product.sizes[0] === 'One Size');
      
      if (!isOneSize && !size) {
        return res.status(400).json({ error: 'Please select a size' });
      }
      
      // Find the size object and check stock
      let selectedSizeObj = null;
      
      if (hasNewSizeStructure) {
        // New structure: sizes are objects with name and stock
        selectedSizeObj = product.sizes.find(s => s.name === size);
        
        if (!isOneSize && !selectedSizeObj) {
          return res.status(400).json({ error: 'Invalid size selected' });
        }
        
        // For One Size products, get the first size object
        if (isOneSize) {
          selectedSizeObj = product.sizes[0];
        }
        
        // Check stock availability
        if (selectedSizeObj && selectedSizeObj.stock < quantity) {
          return res.status(400).json({ 
            error: `Only ${selectedSizeObj.stock} items left in ${selectedSizeObj.name} size` 
          });
        }
        
        if (selectedSizeObj && selectedSizeObj.stock === 0) {
          return res.status(400).json({ 
            error: `${selectedSizeObj.name} size is out of stock` 
          });
        }
      } else if (hasOldSizeStructure) {
        // Old structure: sizes are strings (no stock tracking)
        if (!isOneSize && !product.sizes.includes(size)) {
          return res.status(400).json({ error: 'Invalid size selected' });
        }
      }
    }
    
    const query = getCartQuery(req);
    let cart = await Cart.findOne(query);
    
    if (!cart) {
      cart = new Cart({ ...query, items: [] });
    }
    
    // Check if same product, same size, same color exists
    const existingIndex = cart.items.findIndex(
      item => String(item.productId) === String(productId) && 
              item.size === size && 
              item.color === color
    );
    
    // Use the color image if provided, otherwise use product image
    const imageToUse = colorImage || product.image;
    
    if (existingIndex > -1) {
      // Check stock for updated quantity
      let newQuantity = cart.items[existingIndex].quantity + quantity;
      
      if (hasNewSizeStructure) {
        let selectedSizeObj = null;
        const isOneSize = product.sizes[0].name === 'One Size';
        
        if (isOneSize) {
          selectedSizeObj = product.sizes[0];
        } else {
          selectedSizeObj = product.sizes.find(s => s.name === size);
        }
        
        if (selectedSizeObj && selectedSizeObj.stock < newQuantity) {
          return res.status(400).json({ 
            error: `Cannot add ${quantity} more. Only ${selectedSizeObj.stock} items available in ${selectedSizeObj.name} size` 
          });
        }
      }
      
      cart.items[existingIndex].quantity = newQuantity;
      console.log('Updated existing item, new quantity:', cart.items[existingIndex].quantity);
    } else {
      cart.items.push({
        productId: String(productId),
        name: product.name,
        price: product.price,
        image: imageToUse,
        size: size,
        color: color,
        colorImage: colorImage,
        quantity
      });
      console.log('Added new item:', product.name, 'Color:', color, 'Size:', size, 'Image:', imageToUse);
    }
    
    await cart.save();
    
    const totalCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    res.json({ success: true, items: cart.items, count: totalCount });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update item quantity - UPDATED WITH STOCK CHECK
router.put('/update/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity, size, color } = req.body;
    
    const query = getCartQuery(req);
    const cart = await Cart.findOne(query);
    
    if (!cart) {
      return res.status(404).json({ error: 'Cart not found' });
    }
    
    // Find the item with matching productId, size, and color
    const itemIndex = cart.items.findIndex(item => 
      String(item.productId) === String(productId) && 
      item.size === (size || '') && 
      item.color === (color || '')
    );
    
    if (itemIndex === -1) {
      return res.status(404).json({ error: 'Item not found' });
    }
    
    // Check stock availability before updating
    const product = await Product.findOne({ productId: parseInt(productId) });
    if (product && product.sizes && product.sizes.length > 0 && typeof product.sizes[0] === 'object') {
      const itemSize = cart.items[itemIndex].size;
      const isOneSize = product.sizes[0].name === 'One Size';
      
      let selectedSizeObj = null;
      if (isOneSize) {
        selectedSizeObj = product.sizes[0];
      } else if (itemSize) {
        selectedSizeObj = product.sizes.find(s => s.name === itemSize);
      }
      
      if (selectedSizeObj && selectedSizeObj.stock < quantity) {
        return res.status(400).json({ 
          error: `Only ${selectedSizeObj.stock} items available in ${selectedSizeObj.name} size` 
        });
      }
      
      if (selectedSizeObj && selectedSizeObj.stock === 0) {
        return res.status(400).json({ 
          error: `${selectedSizeObj.name} size is out of stock` 
        });
      }
    }
    
    cart.items[itemIndex].quantity = quantity;
    await cart.save();
    
    res.json({ success: true, items: cart.items });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Remove item from cart
router.delete('/remove/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const { size, color } = req.query;
    
    const query = getCartQuery(req);
    const cart = await Cart.findOne(query);
    
    if (!cart) {
      return res.status(404).json({ error: 'Cart not found' });
    }
    
    // Remove item with matching productId, size, and color
    cart.items = cart.items.filter(item => 
      !(String(item.productId) === String(productId) && 
        item.size === (size || '') && 
        item.color === (color || ''))
    );
    await cart.save();
    
    res.json({ success: true, items: cart.items });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Clear cart
router.delete('/clear', async (req, res) => {
  try {
    const query = getCartQuery(req);
    const cart = await Cart.findOne(query);
    
    if (cart) {
      cart.items = [];
      await cart.save();
    }
    
    res.json({ success: true, items: [] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Merge guest cart
router.post('/merge', async (req, res) => {
  try {
    const { sessionId } = req.body;
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token || !sessionId) {
      return res.status(400).json({ error: 'Missing data' });
    }
    
    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.userId;
    
    const guestCart = await Cart.findOne({ sessionId });
    let userCart = await Cart.findOne({ userId });
    
    if (!userCart) {
      userCart = new Cart({ userId, items: [] });
    }
    
    if (guestCart && guestCart.items.length > 0) {
      for (const guestItem of guestCart.items) {
        // Check stock for each guest item before merging
        const product = await Product.findOne({ productId: parseInt(guestItem.productId) });
        if (product && product.sizes && product.sizes.length > 0 && typeof product.sizes[0] === 'object') {
          const isOneSize = product.sizes[0].name === 'One Size';
          let selectedSizeObj = null;
          
          if (isOneSize) {
            selectedSizeObj = product.sizes[0];
          } else if (guestItem.size) {
            selectedSizeObj = product.sizes.find(s => s.name === guestItem.size);
          }
          
          if (selectedSizeObj && selectedSizeObj.stock < guestItem.quantity) {
            // If not enough stock, adjust quantity to available stock
            if (selectedSizeObj.stock > 0) {
              guestItem.quantity = selectedSizeObj.stock;
            } else {
              // Skip this item if out of stock
              continue;
            }
          }
        }
        
        const existingIndex = userCart.items.findIndex(
          item => String(item.productId) === String(guestItem.productId) && 
                  item.size === guestItem.size && 
                  item.color === guestItem.color
        );
        
        if (existingIndex > -1) {
          userCart.items[existingIndex].quantity += guestItem.quantity;
        } else {
          userCart.items.push(guestItem);
        }
      }
      
      await userCart.save();
      await Cart.deleteOne({ sessionId });
    } else {
      await userCart.save();
    }
    
    res.json({ success: true, items: userCart.items });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;