const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/user');

// Create new order
const createOrder = async (req, res) => {
  try {
    console.log('📦 Creating order - Request body:', JSON.stringify(req.body, null, 2));
    console.log('📦 User ID:', req.user?.id);
    
    const { items, deliveryAddress, orderNotes, paymentMethod } = req.body;
    const userId = req.user?.id || req.user?.userId;

    if (!userId) {
      console.error('❌ No user ID found in request');
      return res.status(401).json({
        success: false,
        message: 'User authentication required'
      });
    }

    // Validate items
    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Order must contain at least one item'
      });
    }

    // Validate delivery address
    if (!deliveryAddress) {
      return res.status(400).json({
        success: false,
        message: 'Delivery address is required'
      });
    }

    // Ensure required address fields
    if (!deliveryAddress.name || !deliveryAddress.phone || !deliveryAddress.address) {
      return res.status(400).json({
        success: false,
        message: 'Complete delivery address is required (name, phone, address)'
      });
    }

    // Set default values for optional address fields
    // Normalize addressType to match enum (home, office, other)
    const addressTypeMap = {
      'Home': 'home',
      'Work': 'office',
      'Office': 'office',
      'Other': 'other',
      'home': 'home',
      'work': 'office',
      'office': 'office',
      'other': 'other'
    };
    
    const completeAddress = {
      name: deliveryAddress.name,
      phone: (deliveryAddress.phone || '').replace(/[^0-9+]/g, ''), // Clean phone number
      address: deliveryAddress.address,
      pincode: deliveryAddress.pincode || deliveryAddress.pinCode || '000000',
      city: deliveryAddress.city || 'Unknown',
      state: deliveryAddress.state || 'Unknown',
      landmark: deliveryAddress.landmark || '',
      addressType: addressTypeMap[deliveryAddress.addressType || deliveryAddress.type] || 'home'
    };

    console.log('📍 Complete address:', completeAddress);

    // Check product availability and calculate totals
    const orderItems = [];
    let subtotal = 0;

    console.log('📦 Processing items:', items.length);

    for (const item of items) {
      if (!item.productId) {
        console.error('❌ Missing productId in item:', item);
        return res.status(400).json({
          success: false,
          message: 'Product ID is required for all items'
        });
      }

      console.log(`🔍 Looking for product with ID: ${item.productId} (type: ${typeof item.productId})`);

      // Try to find product by ID
      let product = null;
      
      // Check if productId is a valid MongoDB ObjectId (24 char hex string)
      const mongoose = require('mongoose');
      const isValidObjectId = mongoose.Types.ObjectId.isValid(item.productId);
      
      if (isValidObjectId) {
        // Try to find by ObjectId
        product = await Product.findById(item.productId);
      }
      
      // If not found and productId is a simple number/string, handle demo products
      if (!product) {
        console.warn(`⚠️ Product not found by ObjectId: ${item.productId}, checking if demo product`);
        
        // Check if this is a demo/sample product with simple ID
        if (typeof item.productId === 'string' && item.productId.length < 24) {
          // This is a demo product - use the product data from the cart item
          // The cart item should have all product details
          console.warn(`⚠️ Demo product detected with ID: ${item.productId}`);
          console.log('📦 Cart item data:', item);
          
          // Use product data from cart item if available
          if (item.name && item.price !== undefined) {
            // Create a temporary product object using cart item data
            product = {
              _id: new mongoose.Types.ObjectId(), // Generate new ObjectId for order
              name: item.name,
              price: parseFloat(item.price) || 0,
              stock: parseInt(item.stock) || 999, // High stock for demo products
              images: item.images || item.image ? [item.image] : [],
              brand: item.brand || 'Demo Brand',
              mainCategory: item.mainCategory || item.category || 'Grocery',
              subcategory: item.subcategory || ''
            };
            
            console.log(`✅ Using demo product from cart: ${product.name} at ₹${product.price}`);
          } else {
            // Try to find by name in database
            if (item.productName) {
              product = await Product.findOne({ 
                name: { $regex: item.productName, $options: 'i' }
              });
            }
          }
        } else {
          // Try to find by any field that might match
          product = await Product.findOne({ 
            $or: [
              { name: { $regex: item.productId, $options: 'i' } },
              { _id: item.productId }
            ]
          });
        }
      }

      if (!product) {
        console.error('❌ Product not found:', item.productId);
        console.error('❌ Item data:', item);
        return res.status(404).json({
          success: false,
          message: `Product with ID ${item.productId} not found. Please ensure the product exists in the database or use products from the product list.`
        });
      }

      const quantity = parseInt(item.quantity) || 1;
      if (quantity <= 0) {
        return res.status(400).json({
          success: false,
          message: `Invalid quantity for ${product.name}`
        });
      }

      // Check stock (allow if stock is 0 or undefined for demo purposes, but log warning)
      if (product.stock !== undefined && product.stock < quantity) {
        console.warn(`⚠️ Low stock for ${product.name}: Available ${product.stock}, Requested ${quantity}`);
        // For now, allow the order but log the warning
        // You can uncomment below to enforce stock check:
        // return res.status(400).json({
        //   success: false,
        //   message: `Insufficient stock for ${product.name}. Available: ${product.stock}`
        // });
      }

      const itemPrice = parseFloat(product.price) || 0;
      const itemTotal = itemPrice * quantity;
      subtotal += itemTotal;

      orderItems.push({
        product: product._id,
        quantity: quantity,
        price: itemPrice,
        total: itemTotal
      });

      console.log(`✅ Added item: ${product.name} x${quantity} = ₹${itemTotal}`);
    }

    console.log(`📦 Subtotal: ₹${subtotal}`);

    // Map payment method to backend enum values
    const paymentMethodMap = {
      'UPI': 'online',
      'Card': 'online',
      'Wallet': 'wallet',
      'NetBanking': 'online',
      'COD': 'cod',
      'cod': 'cod',
      'online': 'online',
      'wallet': 'wallet'
    };
    
    const mappedPaymentMethod = paymentMethodMap[paymentMethod] || 'cod';

    console.log(`📦 Payment method: ${paymentMethod} -> ${mappedPaymentMethod}`);

    // Create order
    const order = new Order({
      orderNumber: Order.generateOrderNumber(),
      user: userId,
      items: orderItems,
      deliveryAddress: completeAddress,
      paymentMethod: mappedPaymentMethod,
      orderNotes: orderNotes || `Payment via ${paymentMethod || 'COD'}`,
      subtotal: subtotal
    });

    // Calculate totals
    order.calculateTotals();
    
    console.log(`📦 Order totals: Subtotal ₹${order.subtotal}, Delivery ₹${order.deliveryCharge}, Tax ₹${order.tax}, Total ₹${order.totalAmount}`);

    try {
      await order.save();
      console.log(`✅ Order saved: ${order.orderNumber}`);
    } catch (saveError) {
      console.error('❌ Error saving order:', saveError);
      // If order number conflict, try again
      if (saveError.code === 11000) {
        order.orderNumber = Order.generateOrderNumber();
        await order.save();
        console.log(`✅ Order saved with new number: ${order.orderNumber}`);
      } else {
        throw saveError;
      }
    }

    // Update product stock
    for (const item of orderItems) {
      await Product.findByIdAndUpdate(
        item.product,
        { $inc: { stock: -item.quantity } }
      );
    }

    // Populate order details
    try {
      await order.populate('user', 'name phone');
      await order.populate('items.product', 'name price images brand mainCategory subcategory');
      
      const userName = order.user?.name || 'User';
      console.log(`📦 New order created: ${order.orderNumber} for user: ${userName}`);
    } catch (populateError) {
      console.warn('⚠️ Error populating order details:', populateError);
      // Continue even if populate fails
    }

    // Emit WebSocket event for real-time updates
    if (global.io) {
      const userName = order.user?.name || 'User';
      const orderStatus = order.orderStatus || 'pending';
      
      // Notify user about their order
      global.io.to(`user-${userId}`).emit('order-created', {
        orderId: order._id,
        orderNumber: order.orderNumber,
        status: orderStatus,
        totalAmount: order.totalAmount
      });

      // Notify admin about new order
      global.io.to('admin-room').emit('new-order', {
        orderId: order._id,
        orderNumber: order.orderNumber,
        userId: userId,
        userName: userName,
        totalAmount: order.totalAmount,
        status: orderStatus,
        createdAt: order.createdAt
      });
      
      console.log('📡 WebSocket events emitted');
    }

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: order
    });

  } catch (error) {
    console.error('❌ Create order error:', error);
    console.error('❌ Error stack:', error.stack);
    console.error('❌ Error details:', {
      name: error.name,
      message: error.message,
      code: error.code
    });
    
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Failed to create order. Please try again.'
    });
  }
};

// Get all orders (Admin)
const getAllOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    
    console.log('📦 Fetching orders with params:', { status, page, limit });
    
    let query = {};
    if (status && status !== '') {
      query.orderStatus = status;
    }

    // Convert page and limit to numbers
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 20;
    const skip = (pageNum - 1) * limitNum;

    console.log('📦 Query:', query);
    console.log('📦 Pagination:', { pageNum, limitNum, skip });

    // Find orders with population
    // Handle cases where user or product might be deleted
    let orders;
    try {
      orders = await Order.find(query)
        .populate('user', 'name phone email')
        .populate('items.product', 'name price images brand mainCategory subcategory')
        .sort({ createdAt: -1 })
        .limit(limitNum)
        .skip(skip)
        .lean(); // Use lean() for better performance
    } catch (populateError) {
      console.error('❌ Populate error:', populateError);
      // If populate fails, try without populate
      orders = await Order.find(query)
        .sort({ createdAt: -1 })
        .limit(limitNum)
        .skip(skip)
        .lean();
    }
    
    // Clean up any null populated fields
    const cleanedOrders = orders.map(order => {
      const cleanedOrder = {
        ...order,
        user: order.user || { name: 'Unknown User', phone: 'N/A', email: 'N/A' },
        items: (order.items || []).map(item => ({
          ...item,
          product: item.product || { 
            name: 'Product Deleted', 
            price: item.price || 0,
            images: [],
            brand: 'N/A'
          }
        }))
      };
      return cleanedOrder;
    });

    // Count total documents
    const total = await Order.countDocuments(query);

    console.log(`✅ Found ${orders.length} orders out of ${total} total`);

    res.json({
      success: true,
      data: {
        orders: cleanedOrders,
        pagination: {
          current: pageNum,
          pages: Math.ceil(total / limitNum),
          total
        }
      }
    });

  } catch (error) {
    console.error('❌ Get all orders error:', error);
    console.error('❌ Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get dashboard orders
const getDashboardOrders = async (req, res) => {
  try {
    const orders = await Order.getDashboardOrders();

    // Group orders by status
    const ordersByStatus = {
      pending: orders.filter(order => order.orderStatus === 'pending'),
      confirmed: orders.filter(order => order.orderStatus === 'confirmed'),
      preparing: orders.filter(order => order.orderStatus === 'preparing'),
      ready: orders.filter(order => order.orderStatus === 'ready'),
      out_for_delivery: orders.filter(order => order.orderStatus === 'out_for_delivery'),
      delivered: orders.filter(order => order.orderStatus === 'delivered'),
      cancelled: orders.filter(order => order.orderStatus === 'cancelled')
    };

    // Calculate statistics
    const stats = {
      totalOrders: orders.length,
      pendingOrders: ordersByStatus.pending.length,
      todayOrders: orders.filter(order => 
        new Date(order.createdAt).toDateString() === new Date().toDateString()
      ).length,
      totalRevenue: orders
        .filter(order => order.orderStatus === 'delivered')
        .reduce((total, order) => total + order.totalAmount, 0)
    };

    res.json({
      success: true,
      data: {
        orders,
        ordersByStatus,
        stats
      }
    });

  } catch (error) {
    console.error('❌ Get dashboard orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get single order
const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id || req.user?.userId;
    
    console.log('📦 Fetching order:', id, 'for user:', userId);
    console.log('📦 User object:', JSON.stringify(req.user, null, 2));
    
    const order = await Order.findById(id)
      .populate('user', 'name phone email')
      .populate('items.product', 'name price images brand mainCategory subcategory description')
      .lean();

    if (!order) {
      console.error('❌ Order not found with ID:', id);
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    console.log('📦 Order found:', {
      orderId: order._id,
      orderUser: order.user?._id || order.user,
      requestUserId: userId,
      orderUserType: typeof order.user,
      orderUserString: order.user?.toString(),
      userIdString: userId?.toString()
    });

    // Check if user has access to this order (for user routes)
    if (req.user && !req.admin) {
      // Handle both populated user object and ObjectId
      const orderUserId = order.user?._id ? order.user._id.toString() : order.user?.toString();
      const requestUserIdStr = userId?.toString();
      
      console.log('🔍 Comparing user IDs:', {
        orderUserId,
        requestUserIdStr,
        match: orderUserId === requestUserIdStr
      });
      
      if (orderUserId !== requestUserIdStr) {
        console.error('❌ Access denied - User ID mismatch:', {
          orderUserId,
          requestUserIdStr
        });
        return res.status(403).json({
          success: false,
          message: 'Access denied. This order does not belong to you.'
        });
      }
    }

    // Clean up any null populated fields
    const cleanedOrder = {
      ...order,
      user: order.user || { name: 'Unknown User', phone: 'N/A', email: 'N/A' },
      items: (order.items || []).map(item => ({
        ...item,
        product: item.product || { 
          name: 'Product Deleted', 
          price: item.price || 0,
          images: [],
          brand: 'N/A',
          description: 'Product no longer available'
        }
      }))
    };

    console.log('✅ Order details prepared successfully');
    console.log('📦 Order summary:', {
      orderNumber: cleanedOrder.orderNumber,
      status: cleanedOrder.orderStatus,
      itemsCount: cleanedOrder.items?.length || 0,
      totalAmount: cleanedOrder.totalAmount
    });

    res.json({
      success: true,
      data: cleanedOrder
    });

  } catch (error) {
    console.error('❌ Get order by ID error:', error);
    console.error('❌ Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Update order status
const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes, deliveryBoy, deliveryPhone } = req.body;

    console.log('📦 Updating order status:', { id, status, notes });

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }

    // Validate status
    const validStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Update order status
    await order.updateStatus(status, notes || '');

    // Update delivery details if provided
    if (deliveryBoy) order.deliveryBoy = deliveryBoy;
    if (deliveryPhone) order.deliveryPhone = deliveryPhone;
    
    if (status === 'out_for_delivery') {
      order.estimatedDelivery = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes from now
    }

    await order.save();

    // Populate order for WebSocket
    await order.populate('user', 'name phone');
    await order.populate('items.product', 'name price images brand');

    // Emit WebSocket event for real-time updates
    if (global.io) {
      // Notify user about order status update
      global.io.to(`user-${order.user._id}`).emit('order-status-updated', {
        orderId: order._id,
        orderNumber: order.orderNumber,
        status: order.orderStatus,
        message: `Your order ${order.orderNumber} status has been updated to ${status}`
      });

      // Notify admin about order status update
      global.io.to('admin-room').emit('order-status-changed', {
        orderId: order._id,
        orderNumber: order.orderNumber,
        status: order.orderStatus,
        userId: order.user._id
      });
    }

    console.log(`📦 Order ${order.orderNumber} status updated to: ${status}`);

    res.json({
      success: true,
      message: 'Order status updated successfully',
      data: order
    });

  } catch (error) {
    console.error('❌ Update order status error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get user orders
const getUserOrders = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?.userId;
    
    if (!userId) {
      console.error('❌ No user ID found in request');
      return res.status(401).json({
        success: false,
        message: 'User authentication required'
      });
    }

    console.log('📦 Fetching orders for user:', userId);
    console.log('📦 User object:', JSON.stringify(req.user, null, 2));
    
    const { status } = req.query;

    // Use mongoose.Types.ObjectId to ensure proper query
    const mongoose = require('mongoose');
    let query = { user: mongoose.Types.ObjectId.isValid(userId) ? new mongoose.Types.ObjectId(userId) : userId };
    
    if (status && status !== '' && status !== 'all') {
      query.orderStatus = status;
    }

    console.log('📦 Query:', JSON.stringify(query, null, 2));

    const orders = await Order.find(query)
      .populate('items.product', 'name price images brand mainCategory subcategory')
      .sort({ createdAt: -1 })
      .lean();
    
    console.log(`📦 Found ${orders.length} orders in database`);

    // Clean up any null populated fields
    const cleanedOrders = orders.map(order => ({
      ...order,
      items: (order.items || []).map(item => ({
        ...item,
        product: item.product || { 
          name: 'Product Deleted', 
          price: item.price || 0,
          images: [],
          brand: 'N/A'
        }
      }))
    }));

    console.log(`✅ Found ${cleanedOrders.length} orders for user`);

    res.json({
      success: true,
      data: cleanedOrders
    });

  } catch (error) {
    console.error('❌ Get user orders error:', error);
    console.error('❌ Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Cancel order
const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (order.orderStatus === 'delivered' || order.orderStatus === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel this order'
      });
    }

    // Update order status
    await order.updateStatus('cancelled', reason);

    // Restore product stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(
        item.product,
        { $inc: { stock: item.quantity } }
      );
    }

    console.log(`📦 Order ${order.orderNumber} cancelled by user`);

    res.json({
      success: true,
      message: 'Order cancelled successfully',
      data: order
    });

  } catch (error) {
    console.error('❌ Cancel order error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get order statistics
const getOrderStats = async (req, res) => {
  try {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    const stats = {
      today: {
        orders: await Order.countDocuments({
          createdAt: { $gte: startOfDay, $lte: endOfDay }
        }),
        revenue: await Order.aggregate([
          {
            $match: {
              createdAt: { $gte: startOfDay, $lte: endOfDay },
              orderStatus: 'delivered'
            }
          },
          {
            $group: {
              _id: null,
              total: { $sum: '$totalAmount' }
            }
          }
        ])
      },
      total: {
        orders: await Order.countDocuments(),
        revenue: await Order.aggregate([
          {
            $match: { orderStatus: 'delivered' }
          },
          {
            $group: {
              _id: null,
              total: { $sum: '$totalAmount' }
            }
          }
        ])
      },
      byStatus: await Order.aggregate([
        {
          $group: {
            _id: '$orderStatus',
            count: { $sum: 1 }
          }
        }
      ])
    };

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('❌ Get order stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = {
  createOrder,
  getAllOrders,
  getDashboardOrders,
  getOrderById,
  updateOrderStatus,
  getUserOrders,
  cancelOrder,
  getOrderStats
};
