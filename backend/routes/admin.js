import express from 'express';
import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';
import User from '../models/User.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import StockLog from '../models/StockLog.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'tiinyberry_secret_key_2024';

// Admin authentication middleware
const authAdmin = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }
    
    const decoded = jwt.verify(token, JWT_SECRET);
    const admin = await Admin.findById(decoded.adminId);
    
    if (!admin) {
      return res.status(401).json({ success: false, message: 'Admin not found' });
    }
    
    req.admin = admin;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

// Admin Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Login attempt - Email:', email);
    
    const admin = await Admin.findOne({ email });
    console.log('Admin found:', admin ? 'Yes' : 'No');
    
    if (!admin) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    
    const isValid = await admin.comparePassword(password);
    console.log('Password valid:', isValid);
    
    if (!isValid) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    
    const token = jwt.sign(
      { adminId: admin._id, email: admin.email },
      process.env.JWT_SECRET || 'tiinyberry_secret_key_2024',
      { expiresIn: '7d' }
    );
    
    res.json({
      success: true,
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get Dashboard Stats
router.get('/stats', authAdmin, async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const totalUsers = await User.countDocuments();
    const totalProducts = await Product.countDocuments();
    const totalRevenue = await Order.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: "$total" } } }
    ]);
    
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('userId', 'name email');
    
    const ordersByStatus = await Order.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);
    
    const monthlySales = await Order.aggregate([
      { $match: { paymentStatus: 'paid' } },
      {
        $group: {
          _id: { month: { $month: "$createdAt" }, year: { $year: "$createdAt" } },
          total: { $sum: "$total" },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": -1, "_id.month": -1 } },
      { $limit: 6 }
    ]);
    
    res.json({
      success: true,
      stats: {
        totalOrders,
        totalUsers,
        totalProducts,
        totalRevenue: totalRevenue[0]?.total || 0,
        recentOrders,
        ordersByStatus,
        monthlySales
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get All Orders
router.get('/orders', authAdmin, async (req, res) => {
  try {
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .populate('userId', 'name email mobileNumber');
    
    res.json({ success: true, orders });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update Order Status
router.put('/orders/:orderId/status', authAdmin, async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const previousStatus = order.status;
    order.status = status;
    await order.save();

    // If order is cancelled and was previously paid/confirmed, restore stock to inventory
    if (status === 'cancelled' && previousStatus !== 'cancelled' && order.paymentStatus === 'paid') {
      if (order.items && order.items.length > 0) {
        for (const item of order.items) {
          try {
            const productIdNum = !isNaN(Number(item.productId)) ? Number(item.productId) : null;
            const query = [];
            if (productIdNum) query.push({ productId: productIdNum });
            if (item.productId && item.productId.length === 24) query.push({ _id: item.productId });

            const product = query.length > 0 ? await Product.findOne({ $or: query }) : null;
            if (product) {
              let stockRestored = false;
              if (product.sizes && product.sizes.length > 0) {
                const itemSizeClean = (item.size || '').trim().toLowerCase();
                const sizeIndex = product.sizes.findIndex(s => (s.name || '').trim().toLowerCase() === itemSizeClean);
                if (sizeIndex !== -1) {
                  product.sizes[sizeIndex].stock = (product.sizes[sizeIndex].stock || 0) + (item.quantity || 1);
                  product.inStock = true;
                  stockRestored = true;
                } else if (product.sizes.length === 1 && product.sizes[0].name === 'One Size') {
                  product.sizes[0].stock = (product.sizes[0].stock || 0) + (item.quantity || 1);
                  product.inStock = true;
                  stockRestored = true;
                }
              } else if (typeof product.stockQuantity === 'number') {
                product.stockQuantity = product.stockQuantity + (item.quantity || 1);
                product.inStock = true;
                stockRestored = true;
              }

              if (stockRestored) {
                await product.save();
                console.log(`📈 Restored stock for ${product.name} (Size: ${item.size || 'N/A'}, Qty: ${item.quantity}) due to order cancellation`);
                try {
                  await StockLog.create({
                    productId: String(product.productId || product._id),
                    productName: product.name,
                    size: item.size || 'N/A',
                    change: +(item.quantity || 1),
                    previousStock: Math.max(0, (product.sizes?.[sizeIndex]?.stock || 0) - (item.quantity || 1)),
                    newStock: product.sizes?.[sizeIndex]?.stock || 0,
                    reason: 'order_cancelled',
                    orderNumber: order.orderNumber,
                    note: `Stock restored due to order cancellation`
                  });
                } catch (logErr) {
                  console.error('Error logging stock restore:', logErr);
                }
              }
            }
          } catch (err) {
            console.error(`Error restoring stock for item ${item.name}:`, err);
          }
        }
        order.stockDeducted = false;
        await order.save();
      }
    }
    
    res.json({ success: true, order });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get All Products
router.get('/products', authAdmin, async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json({ success: true, products });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create Product
router.post('/products', authAdmin, async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.json({ success: true, product });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update Product
router.put('/products/:productId', authAdmin, async (req, res) => {
  try {
    const { productId } = req.params;
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    
    // Update fields
    Object.assign(product, req.body);
    
    // Explicitly update inStock status based on sizes
    if (product.sizes && product.sizes.length > 0) {
      product.inStock = product.sizes.some(size => size.stock > 0);
    }
    
    await product.save();
    res.json({ success: true, product });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete Product (Soft delete / Move to Trash, or Permanent delete if already deleted)
router.delete('/products/:productId', authAdmin, async (req, res) => {
  try {
    const { productId } = req.params;
    
    // We must find it first, enabling showDeleted option in case it's already soft-deleted
    const product = await Product.findById(productId).setOptions({ showDeleted: true });
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    
    if (product.isDeleted) {
      // If it is already soft-deleted, this action acts as a permanent delete!
      await Product.deleteOne({ _id: productId });
      return res.json({ success: true, message: 'Product permanently deleted' });
    }
    
    // Perform soft delete
    product.isDeleted = true;
    product.deletedAt = new Date();
    await product.save();
    
    res.json({ success: true, message: 'Product moved to trash bin' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get Trash Bin Products
router.get('/products/trash', authAdmin, async (req, res) => {
  try {
    // Retrieve only soft-deleted products
    const products = await Product.find({ isDeleted: true }).setOptions({ showDeleted: true }).sort({ deletedAt: -1 });
    res.json({ success: true, products });
  } catch (error) {
    console.error('Get trash bin products error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Restore Product from Trash
router.put('/products/:productId/restore', authAdmin, async (req, res) => {
  try {
    const { productId } = req.params;
    const product = await Product.findById(productId).setOptions({ showDeleted: true });
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    
    product.isDeleted = false;
    product.deletedAt = null;
    await product.save();
    
    res.json({ success: true, product, message: 'Product restored successfully' });
  } catch (error) {
    console.error('Restore product error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get All Users
router.get('/users', authAdmin, async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 }).select('-password');
    res.json({ success: true, users });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Quick stock adjustment / restock endpoint for a specific product size
router.put('/products/:productId/stock', authAdmin, async (req, res) => {
  try {
    const { productId } = req.params;
    const { sizeName, newStock, addedQuantity, isRestock, note } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    if (!product.sizes || product.sizes.length === 0) {
      return res.status(400).json({ success: false, message: 'Product has no sizes' });
    }

    const sizeClean = (sizeName || '').trim().toLowerCase();
    const sizeIndex = product.sizes.findIndex(s => (s.name || '').trim().toLowerCase() === sizeClean);

    if (sizeIndex === -1) {
      return res.status(404).json({ success: false, message: `Size "${sizeName}" not found` });
    }

    const prevStock = product.sizes[sizeIndex].stock || 0;
    let finalStock = prevStock;
    let change = 0;
    let actionReason = 'manual_adjustment';

    if (isRestock) {
      const qtyToAdd = Math.max(0, parseInt(addedQuantity) || 0);
      finalStock = prevStock + qtyToAdd;
      change = qtyToAdd;
      actionReason = 'restock';
      const prevInitial = product.sizes[sizeIndex].initialStock ?? prevStock;
      product.sizes[sizeIndex].initialStock = prevInitial + qtyToAdd;
    } else {
      finalStock = Math.max(0, parseInt(newStock) || 0);
      change = finalStock - prevStock;
    }

    product.sizes[sizeIndex].stock = finalStock;
    product.inStock = product.sizes.some(s => (s.stock || 0) > 0);
    product.markModified('sizes');
    await product.save();

    // Log the change
    try {
      await StockLog.create({
        productId: String(product.productId || product._id),
        productName: product.name,
        size: product.sizes[sizeIndex].name,
        change,
        previousStock: prevStock,
        newStock: finalStock,
        reason: actionReason,
        note: note || (isRestock ? `Restocked +${change} units` : `Manual adjustment from ${prevStock} to ${finalStock}`)
      });
    } catch (logErr) {
      console.error('Error recording stock log:', logErr);
    }

    res.json({
      success: true,
      product,
      message: `Stock updated for ${product.sizes[sizeIndex].name}: ${finalStock} units`
    });
  } catch (error) {
    console.error('Quick stock update error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get Stock History Logs for a product & size
router.get('/products/:productId/stock-logs', authAdmin, async (req, res) => {
  try {
    const { productId } = req.params;
    const { size } = req.query;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const prodIds = [String(product._id)];
    if (product.productId) prodIds.push(String(product.productId));

    // 1. Fetch from StockLog
    const logQuery = { productId: { $in: prodIds } };
    if (size) {
      logQuery.size = new RegExp(`^${size.trim()}$`, 'i');
    }
    const explicitLogs = await StockLog.find(logQuery).sort({ createdAt: -1 }).lean();

    // 2. Fetch from Orders to provide seamless historical order context
    const orderItemsQuery = {
      $or: [{ status: 'confirmed' }, { paymentStatus: 'paid' }],
      'items.productId': { $in: prodIds }
    };
    const pastOrders = await Order.find(orderItemsQuery).sort({ createdAt: -1 }).limit(30).lean();

    const orderLogs = [];
    const loggedOrderNumbers = new Set(explicitLogs.map(l => l.orderNumber).filter(Boolean));

    for (const order of pastOrders) {
      if (loggedOrderNumbers.has(order.orderNumber)) continue;
      for (const item of order.items) {
        if (prodIds.includes(String(item.productId))) {
          if (!size || (item.size || '').trim().toLowerCase() === size.trim().toLowerCase()) {
            orderLogs.push({
              _id: `ord_${order._id}_${item._id || item.productId}`,
              productId: String(product._id),
              productName: product.name,
              size: item.size,
              change: -(item.quantity || 1),
              previousStock: null,
              newStock: null,
              reason: 'order',
              orderNumber: order.orderNumber,
              note: `Purchased by ${order.shippingAddress?.fullName || 'Customer'} (${order.shippingAddress?.email || ''})`,
              createdAt: order.createdAt
            });
          }
        }
      }
    }

    const allLogs = [...explicitLogs, ...orderLogs].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({ success: true, logs: allLogs });
  } catch (error) {
    console.error('Get stock logs error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get Inventory & Sales Analytics
router.get('/inventory/analytics', authAdmin, async (req, res) => {
  try {
    const { timeRange } = req.query; // 'all', '30d', '7d'

    let orderDateFilter = {};
    if (timeRange === '7d') {
      const d = new Date();
      d.setDate(d.getDate() - 7);
      orderDateFilter = { createdAt: { $gte: d } };
    } else if (timeRange === '30d') {
      const d = new Date();
      d.setDate(d.getDate() - 30);
      orderDateFilter = { createdAt: { $gte: d } };
    }

    const orders = await Order.find({
      $or: [{ status: 'confirmed' }, { paymentStatus: 'paid' }],
      ...orderDateFilter
    }).select('items createdAt').lean();

    const productSalesMap = new Map();

    for (const order of orders) {
      for (const item of (order.items || [])) {
        const prodIdKey = String(item.productId);
        const qty = item.quantity || 1;
        const price = item.price || 0;
        const sizeName = (item.size || 'One Size').trim();

        if (!productSalesMap.has(prodIdKey)) {
          productSalesMap.set(prodIdKey, {
            totalSold: 0,
            revenue: 0,
            sizeSales: {}
          });
        }

        const data = productSalesMap.get(prodIdKey);
        data.totalSold += qty;
        data.revenue += (price * qty);
        data.sizeSales[sizeName] = (data.sizeSales[sizeName] || 0) + qty;
      }
    }

    const products = await Product.find({ isDeleted: { $ne: true } })
      .select('productId name category subcategory price image sizes inStock stockQuantity createdAt')
      .lean();

    let totalUnitsInStock = 0;
    let totalInventoryValue = 0;
    let outOfStockCount = 0;
    let lowStockCount = 0;

    const enrichedProducts = products.map(prod => {
      const prodIdStr = String(prod._id);
      const customIdStr = prod.productId ? String(prod.productId) : null;

      const salesData = productSalesMap.get(prodIdStr) || (customIdStr ? productSalesMap.get(customIdStr) : null) || {
        totalSold: 0,
        revenue: 0,
        sizeSales: {}
      };

      let stockSum = 0;
      let hasLowStock = false;
      const sizesWithSales = (prod.sizes || []).map(sz => {
        const currentStock = sz.stock || 0;
        stockSum += currentStock;
        if (currentStock <= 2) hasLowStock = true;

        const sizeSold = salesData.sizeSales[sz.name] || 0;
        return {
          name: sz.name,
          stock: currentStock,
          initialStock: sz.initialStock ?? currentStock,
          sold: sizeSold
        };
      });

      if ((!prod.sizes || prod.sizes.length === 0) && typeof prod.stockQuantity === 'number') {
        stockSum = prod.stockQuantity;
        if (stockSum <= 2) hasLowStock = true;
      }

      totalUnitsInStock += stockSum;
      totalInventoryValue += (stockSum * (prod.price || 0));

      if (stockSum === 0) {
        outOfStockCount++;
      } else if (hasLowStock) {
        lowStockCount++;
      }

      let topSize = null;
      let maxSold = 0;
      for (const [szName, count] of Object.entries(salesData.sizeSales)) {
        if (count > maxSold) {
          maxSold = count;
          topSize = `${szName} (${count} sold)`;
        }
      }

      return {
        _id: prod._id,
        productId: prod.productId,
        name: prod.name,
        category: prod.category,
        subcategory: prod.subcategory,
        price: prod.price,
        image: prod.image,
        totalStock: stockSum,
        totalSold: salesData.totalSold,
        revenue: salesData.revenue,
        topSize: topSize || (salesData.totalSold > 0 ? 'Various' : 'None yet'),
        sizes: sizesWithSales,
        createdAt: prod.createdAt
      };
    });

    enrichedProducts.sort((a, b) => b.totalSold - a.totalSold);

    const topSellingProduct = enrichedProducts.length > 0 && enrichedProducts[0].totalSold > 0 
      ? { name: enrichedProducts[0].name, totalSold: enrichedProducts[0].totalSold, image: enrichedProducts[0].image }
      : null;

    res.json({
      success: true,
      summary: {
        totalUnitsInStock,
        totalInventoryValue,
        totalProductsCount: products.length,
        outOfStockCount,
        lowStockCount,
        topSellingProduct
      },
      products: enrichedProducts
    });
  } catch (error) {
    console.error('Inventory analytics error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;