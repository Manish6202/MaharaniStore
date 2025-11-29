# Maharani Store - Complete Setup Instructions

## 🚀 Project Overview
This is a complete e-commerce solution with:
- **Backend**: Node.js + Express + MongoDB + WebSocket
- **Mobile App**: React Native
- **Admin Panel**: React Web App

## 📦 Installation Steps

### 1. Backend Setup
```bash
cd backend
npm install
```

**Install WebSocket dependency:**
```bash
npm install socket.io
```

**Start Backend:**
```bash
npm run dev
# or
npm start
```

Backend will run on `http://localhost:5001`

### 2. Mobile App Setup
```bash
cd App
npm install
```

**Install WebSocket dependency:**
```bash
npm install socket.io-client
```

**For iOS:**
```bash
cd ios && pod install && cd ..
npm run ios
```

**For Android:**
```bash
npm run android
```

### 3. Admin Panel Setup
```bash
cd admin
npm install
```

**Install WebSocket dependency:**
```bash
npm install socket.io-client
```

**Start Admin Panel:**
```bash
npm start
```

Admin panel will run on `http://localhost:3000`

## 🔌 WebSocket Configuration

### Backend WebSocket
- WebSocket server runs on the same port as HTTP server (5001)
- Events emitted:
  - `order-created`: When a new order is created
  - `order-status-updated`: When order status changes
  - `new-order`: For admin panel (new orders)
  - `order-status-changed`: For admin panel (status updates)

### Mobile App WebSocket
- Connects to: `http://localhost:5001` (iOS) or `http://10.0.2.2:5001` (Android)
- Auto-connects when user is authenticated
- Listens for real-time order updates

### Admin Panel WebSocket
- Connects to: `http://localhost:5001`
- Auto-connects on page load
- Receives real-time order notifications

## 📱 Features Implemented

### Mobile App Features:
✅ Complete onboarding flow (3 screens)
✅ Login with OTP verification
✅ Home screen with categories and products
✅ Product detail pages
✅ Shopping cart with quantity management
✅ Wishlist functionality
✅ Complete checkout flow:
   - Select Address
   - Payment Options
   - Review Order
   - Payment Success
✅ Order tracking with real-time updates
✅ Profile management
✅ Address management
✅ Grocery categories (Vegetables, Fruits, Dairy, Snacks, etc.)

### Backend Features:
✅ User authentication (OTP-based)
✅ Product management
✅ Order processing with stock management
✅ WebSocket for real-time updates
✅ Address management
✅ Wishlist management

### Admin Panel Features:
✅ Dashboard with statistics
✅ Product management
✅ Order management with real-time updates
✅ User management
✅ Media management
✅ Offers management
✅ Trending banner management

## 🔄 Order Processing Flow

1. **User adds items to cart** → CartContext updates
2. **User proceeds to checkout** → SelectAddressScreen
3. **User selects address** → PaymentOptionsScreen
4. **User selects payment method** → ReviewOrderScreen
5. **User confirms order** → Order created via API
6. **Backend processes order**:
   - Validates items and stock
   - Creates order in database
   - Updates product stock
   - Emits WebSocket events
7. **Real-time updates**:
   - User receives order confirmation
   - Admin receives new order notification
8. **Admin updates order status** → WebSocket emits update
9. **User receives real-time status update**

## 🌐 API Endpoints

### Base URLs:
- **Backend**: `http://localhost:5001/api`
- **Mobile App**: 
  - iOS: `http://localhost:5001/api`
  - Android: `http://10.0.2.2:5001/api`
- **Admin Panel**: Uses proxy to `http://localhost:5001`

### Key Endpoints:
- `POST /api/users/send-otp` - Send OTP
- `POST /api/users/verify-otp` - Verify OTP
- `GET /api/products` - Get all products
- `GET /api/products/category/:category` - Get products by category
- `POST /api/orders` - Create order
- `GET /api/orders/user` - Get user orders
- `PUT /api/orders/:id/status` - Update order status

## 🛒 Grocery Categories

The app supports the following grocery categories:
- All
- Vegetables
- Fruits
- Dairy & Breads
- Snacks & Beverages
- Pantry Staples
- Frozen
- Household

Products are filtered by `mainCategory` and `subcategory` fields.

## 🔔 Real-time Updates

### Order Status Updates:
When admin updates an order status:
1. Backend updates order in database
2. WebSocket emits `order-status-updated` to user
3. WebSocket emits `order-status-changed` to admin panel
4. Both user and admin see updates in real-time

### New Order Notifications:
When user places an order:
1. Backend creates order
2. WebSocket emits `order-created` to user
3. WebSocket emits `new-order` to admin panel
4. Admin sees new order immediately

## 🐛 Troubleshooting

### WebSocket Connection Issues:
1. Ensure backend is running on port 5001
2. Check firewall settings
3. For Android emulator, use `10.0.2.2` instead of `localhost`
4. Check network connectivity

### Order Not Processing:
1. Check backend logs for errors
2. Verify MongoDB connection
3. Check product stock availability
4. Verify user authentication token

### Admin Panel Not Receiving Updates:
1. Check WebSocket connection in browser console
2. Verify admin is logged in
3. Check backend WebSocket server is running

## 📝 Environment Variables

Create `.env` file in backend directory:
```
PORT=5001
MONGODB_URI=mongodb://localhost:27017/maharani-store
JWT_SECRET=your-secret-key
```

## 🎯 Next Steps

1. Install all dependencies in all three projects
2. Start MongoDB database
3. Start backend server
4. Start mobile app
5. Start admin panel
6. Test order flow end-to-end
7. Verify WebSocket real-time updates

## ✅ Testing Checklist

- [ ] User can login with OTP
- [ ] Products load from backend
- [ ] Add to cart works
- [ ] Checkout flow completes
- [ ] Order is created in backend
- [ ] WebSocket updates user in real-time
- [ ] Admin receives new order notification
- [ ] Admin can update order status
- [ ] User receives status update in real-time
- [ ] Grocery categories filter correctly

---

**Note**: Make sure MongoDB is running before starting the backend server.

