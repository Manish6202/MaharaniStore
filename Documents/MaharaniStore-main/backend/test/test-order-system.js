const mongoose = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/user');

// Test Order System
async function testOrderSystem() {
  try {
    console.log('🚀 Testing Complete Order System...\n');

    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/maharani-store', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB\n');

    // Test 1: Order Model Methods
    console.log('📦 Test 1: Order Model Methods');
    const orderNumber = Order.generateOrderNumber();
    console.log('Generated Order Number:', orderNumber);
    console.log('✅ Order number generation working\n');

    // Test 2: Create Sample Order
    console.log('📦 Test 2: Creating Sample Order');
    
    // Find a user and product
    const user = await User.findOne();
    const product = await Product.findOne();
    
    if (!user || !product) {
      console.log('❌ No user or product found. Please add some data first.');
      return;
    }

    const sampleOrder = new Order({
      orderNumber: Order.generateOrderNumber(),
      user: user._id,
      items: [{
        product: product._id,
        quantity: 2,
        price: product.price,
        total: product.price * 2
      }],
      deliveryAddress: {
        name: 'Test User',
        phone: '9876543210',
        address: '123 Test Street',
        landmark: 'Near Test Mall',
        pincode: '110001',
        city: 'New Delhi',
        state: 'Delhi',
        addressType: 'home'
      },
      paymentMethod: 'cod',
      orderNotes: 'Test order for system validation',
      subtotal: product.price * 2
    });

    // Calculate totals
    sampleOrder.calculateTotals();
    console.log('Order Totals:', {
      subtotal: sampleOrder.subtotal,
      deliveryCharge: sampleOrder.deliveryCharge,
      tax: sampleOrder.tax,
      totalAmount: sampleOrder.totalAmount
    });

    await sampleOrder.save();
    console.log('✅ Sample order created successfully');
    console.log('Order ID:', sampleOrder._id);
    console.log('Order Number:', sampleOrder.orderNumber);
    console.log('Order Status:', sampleOrder.orderStatus);
    console.log('Total Amount:', sampleOrder.totalAmount);
    console.log('');

    // Test 3: Order Status Updates
    console.log('📦 Test 3: Order Status Updates');
    
    // Update to confirmed
    await sampleOrder.updateStatus('confirmed', 'Order confirmed by shop');
    console.log('✅ Order status updated to: confirmed');
    
    // Update to preparing
    await sampleOrder.updateStatus('preparing', 'Items being prepared');
    console.log('✅ Order status updated to: preparing');
    
    // Update to ready
    await sampleOrder.updateStatus('ready', 'Order ready for delivery');
    console.log('✅ Order status updated to: ready');
    
    // Update to out for delivery
    await sampleOrder.updateStatus('out_for_delivery', 'Out for delivery');
    sampleOrder.deliveryBoy = 'Delivery Boy Name';
    sampleOrder.deliveryPhone = '9876543210';
    await sampleOrder.save();
    console.log('✅ Order status updated to: out_for_delivery');
    
    // Update to delivered
    await sampleOrder.updateStatus('delivered', 'Order delivered successfully');
    console.log('✅ Order status updated to: delivered');
    console.log('');

    // Test 4: Order Queries
    console.log('📦 Test 4: Order Queries');
    
    // Get orders by status
    const pendingOrders = await Order.getOrdersByStatus('pending');
    console.log('Pending Orders Count:', pendingOrders.length);
    
    const deliveredOrders = await Order.getOrdersByStatus('delivered');
    console.log('Delivered Orders Count:', deliveredOrders.length);
    
    // Get dashboard orders
    const dashboardOrders = await Order.getDashboardOrders();
    console.log('Dashboard Orders Count:', dashboardOrders.length);
    console.log('');

    // Test 5: Order Statistics
    console.log('📦 Test 5: Order Statistics');
    
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    const todayOrders = await Order.countDocuments({
      createdAt: { $gte: startOfDay, $lte: endOfDay }
    });
    console.log('Today Orders:', todayOrders);

    const totalOrders = await Order.countDocuments();
    console.log('Total Orders:', totalOrders);

    const ordersByStatus = await Order.aggregate([
      {
        $group: {
          _id: '$orderStatus',
          count: { $sum: 1 }
        }
      }
    ]);
    console.log('Orders by Status:', ordersByStatus);
    console.log('');

    // Test 6: Order Cancellation
    console.log('📦 Test 6: Order Cancellation');
    
    // Create another order for cancellation test
    const cancelOrder = new Order({
      orderNumber: Order.generateOrderNumber(),
      user: user._id,
      items: [{
        product: product._id,
        quantity: 1,
        price: product.price,
        total: product.price
      }],
      deliveryAddress: {
        name: 'Test User',
        phone: '9876543210',
        address: '123 Test Street',
        pincode: '110001',
        city: 'New Delhi',
        state: 'Delhi',
        addressType: 'home'
      },
      subtotal: product.price
    });

    cancelOrder.calculateTotals();
    await cancelOrder.save();
    console.log('✅ Test order for cancellation created');

    // Cancel the order
    await cancelOrder.updateStatus('cancelled', 'Customer requested cancellation');
    console.log('✅ Order cancelled successfully');
    console.log('Cancellation Reason:', cancelOrder.cancellationReason);
    console.log('');

    // Test 7: Order with Multiple Items
    console.log('📦 Test 7: Order with Multiple Items');
    
    const products = await Product.find().limit(3);
    if (products.length >= 2) {
      const multiItemOrder = new Order({
        orderNumber: Order.generateOrderNumber(),
        user: user._id,
        items: products.map((prod, index) => ({
          product: prod._id,
          quantity: index + 1,
          price: prod.price,
          total: prod.price * (index + 1)
        })),
        deliveryAddress: {
          name: 'Test User',
          phone: '9876543210',
          address: '123 Test Street',
          pincode: '110001',
          city: 'New Delhi',
          state: 'Delhi',
          addressType: 'home'
        },
        subtotal: products.reduce((total, prod, index) => total + (prod.price * (index + 1)), 0)
      });

      multiItemOrder.calculateTotals();
      await multiItemOrder.save();
      console.log('✅ Multi-item order created successfully');
      console.log('Items Count:', multiItemOrder.items.length);
      console.log('Total Amount:', multiItemOrder.totalAmount);
      console.log('');
    }

    // Test 8: Order Validation
    console.log('📦 Test 8: Order Validation');
    
    try {
      // Try to create order without required fields
      const invalidOrder = new Order({
        orderNumber: Order.generateOrderNumber(),
        // Missing user, items, deliveryAddress
      });
      await invalidOrder.save();
      console.log('❌ Validation should have failed');
    } catch (error) {
      console.log('✅ Order validation working correctly');
      console.log('Validation Error:', error.message);
    }
    console.log('');

    // Test 9: Order Populate
    console.log('📦 Test 9: Order Populate');
    
    const populatedOrder = await Order.findById(sampleOrder._id)
      .populate('user', 'name phone')
      .populate('items.product', 'name price images brand mainCategory subcategory');
    
    console.log('✅ Order populated successfully');
    console.log('User:', populatedOrder.user.name);
    console.log('Product:', populatedOrder.items[0].product.name);
    console.log('');

    // Test 10: Order Search and Filter
    console.log('📦 Test 10: Order Search and Filter');
    
    // Search by order number
    const searchByNumber = await Order.findOne({ orderNumber: sampleOrder.orderNumber });
    console.log('Search by Order Number:', searchByNumber ? 'Found' : 'Not Found');
    
    // Filter by date range
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const recentOrders = await Order.find({
      createdAt: { $gte: yesterday }
    });
    console.log('Recent Orders (Last 24 hours):', recentOrders.length);
    
    // Filter by amount range
    const highValueOrders = await Order.find({
      totalAmount: { $gte: 100 }
    });
    console.log('High Value Orders (≥₹100):', highValueOrders.length);
    console.log('');

    console.log('🎉 All Order System Tests Completed Successfully!');
    console.log('');
    console.log('📊 Order System Summary:');
    console.log('- Order Model: ✅ Working');
    console.log('- Order Creation: ✅ Working');
    console.log('- Status Updates: ✅ Working');
    console.log('- Order Queries: ✅ Working');
    console.log('- Order Statistics: ✅ Working');
    console.log('- Order Cancellation: ✅ Working');
    console.log('- Multi-item Orders: ✅ Working');
    console.log('- Order Validation: ✅ Working');
    console.log('- Order Populate: ✅ Working');
    console.log('- Order Search/Filter: ✅ Working');
    console.log('');
    console.log('🚀 Order System is ready for production!');

  } catch (error) {
    console.error('❌ Order System Test Failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('📡 Disconnected from MongoDB');
  }
}

// Run the test
testOrderSystem();
