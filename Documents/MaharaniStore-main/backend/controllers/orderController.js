const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/user');

// Create new order
const createOrder = async (req, res) => {
  try {
    const { items, deliveryAddress, orderNotes, paymentMethod } = req.body;
    const userId = req.user.id;

    // Validate items
    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Order must contain at least one item'
      });
    }

    // Validate delivery address
    if (!deliveryAddress || !deliveryAddress.name || !deliveryAddress.phone || !deliveryAddress.address) {
      return res.status(400).json({
        success: false,
        message: 'Complete delivery address is required'
      });
    }

    // Check product availability and calculate totals
    const orderItems = [];
    let subtotal = 0;

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product with ID ${item.productId} not found`
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}. Available: ${product.stock}`
        });
      }

      const itemTotal = product.price * item.quantity;
      subtotal += itemTotal;

      orderItems.push({
        product: product._id,
        quantity: item.quantity,
        price: product.price,
        total: itemTotal
      });
    }

    // Create order
    const order = new Order({
      orderNumber: Order.generateOrderNumber(),
      user: userId,
      items: orderItems,
      deliveryAddress,
      paymentMethod: paymentMethod || 'cod',
      orderNotes,
      subtotal
    });

    // Calculate totals
    order.calculateTotals();
    await order.save();

    // Update product stock
    for (const item of orderItems) {
      await Product.findByIdAndUpdate(
        item.product,
        { $inc: { stock: -item.quantity } }
      );
    }

    // Populate order details
    await order.populate('user', 'name phone');
    await order.populate('items.product', 'name price images brand mainCategory subcategory');

    console.log(`📦 New order created: ${order.orderNumber} for user: ${order.user.name}`);

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: order
    });

  } catch (error) {
    console.error('❌ Create order error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get all orders (Admin)
const getAllOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    
    let query = {};
    if (status) {
      query.orderStatus = status;
    }

    const orders = await Order.find(query)
      .populate('user', 'name phone')
      .populate('items.product', 'name price images brand mainCategory subcategory')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Order.countDocuments(query);

    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });

  } catch (error) {
    console.error('❌ Get all orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
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
    
    const order = await Order.findById(id)
      .populate('user', 'name phone email')
      .populate('items.product', 'name price images brand mainCategory subcategory description');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      data: order
    });

  } catch (error) {
    console.error('❌ Get order by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Update order status
const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes, deliveryBoy, deliveryPhone } = req.body;

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Update order status
    await order.updateStatus(status, notes);

    // Update delivery details if provided
    if (deliveryBoy) order.deliveryBoy = deliveryBoy;
    if (deliveryPhone) order.deliveryPhone = deliveryPhone;
    
    if (status === 'out_for_delivery') {
      order.estimatedDelivery = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes from now
    }

    await order.save();

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
    const userId = req.user.id;
    const { status } = req.query;

    let query = { user: userId };
    if (status) {
      query.orderStatus = status;
    }

    const orders = await Order.find(query)
      .populate('items.product', 'name price images brand mainCategory subcategory')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: orders
    });

  } catch (error) {
    console.error('❌ Get user orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
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
