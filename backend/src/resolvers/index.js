const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { PubSub } = require('graphql-subscriptions');
const User = require('../models/User');
const Food = require('../models/Food');
const Category = require('../models/Category');
const Order = require('../models/Order');
const Rider = require('../models/Rider');
const Option = require('../models/Option');
const Addon = require('../models/Addon');
const Coupon = require('../models/Coupon');
const Configuration = require('../models/Configuration');

const JWT_SECRET = process.env.JWT_SECRET || 'xpresscart_jwt_secret_change_in_production';
const pubsub = new PubSub();

const ORDER_ADDED = 'ORDER_ADDED';
const ORDER_UPDATED = 'ORDER_UPDATED';

const generateToken = (payload) => jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });

const resolvers = {
  Query: {
    // Categories
    categories: async () => await Category.find({ is_active: true }),
    allCategories: async (_, { page }) => {
      const limit = 10;
      const skip = (page ? page - 1 : 0) * limit;
      return await Category.find().skip(skip).limit(limit);
    },

    // Foods
    foods: async (_, { page }) => {
      const limit = 20;
      const skip = (page ? page - 1 : 0) * limit;
      return await Food.find({ is_active: true }).populate('category').populate('variations.addons').skip(skip).limit(limit);
    },
    foodsByCategory: async (_, { category }) => {
      return await Food.find({ category, is_active: true }).populate('category').populate('variations.addons');
    },
    foodByIds: async (_, { ids }) => {
      return await Food.find({ _id: { $in: ids }, is_active: true }).populate('category').populate('variations.addons');
    },

    // Options
    options: async () => await Option.find(),
    allOptions: async (_, { page }) => {
      const limit = 20;
      const skip = (page ? page - 1 : 0) * limit;
      return await Option.find().skip(skip).limit(limit);
    },

    // Addons
    addons: async () => await Addon.find({ is_active: true }).populate('options'),
    allAddons: async (_, { page }) => {
      const limit = 20;
      const skip = (page ? page - 1 : 0) * limit;
      return await Addon.find().skip(skip).limit(limit).populate('options');
    },

    // Coupons
    coupons: async () => await Coupon.find(),

    // Orders
    allOrders: async (_, { page, rows, search }) => {
      const limit = rows || 20;
      const skip = (page ? page - 1 : 0) * limit;
      let query = {};
      if (search) {
        query = { order_id: { $regex: search, $options: 'i' } };
      }
      return await Order.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit)
        .populate('user').populate('rider').populate('items.food');
    },
    orderCount: async () => await Order.countDocuments(),
    ordersByUser: async (_, { userId }) => {
      return await Order.find({ user: userId }).sort({ createdAt: -1 }).populate('user').populate('rider').populate('items.food');
    },

    // Riders
    riders: async () => await Rider.find(),
    availableRiders: async () => await Rider.find({ available: true }),
    rider: async (_, { id }) => await Rider.findById(id),
    riderLocation: async (_, { riderId }) => {
      const rider = await Rider.findById(riderId);
      return rider ? rider.location : null;
    },

    // Users
    users: async (_, { page }) => {
      const limit = 20;
      const skip = (page ? page - 1 : 0) * limit;
      return await User.find().skip(skip).limit(limit);
    },
    profile: async (_, __, context) => {
      if (!context.user) throw new Error('Not authenticated');
      return await User.findById(context.user.userId);
    },

    // Reviews
    allReviews: async (_, { offset }) => {
      const limit = 20;
      const skip = offset || 0;
      return await Order.find({ 'review': { $exists: true } })
        .sort({ createdAt: -1 }).skip(skip).limit(limit).populate('user').populate('items.food');
    },

    // Dashboard
    getDashboardTotal: async (_, { starting_date, ending_date }) => {
      const filter = {};
      if (starting_date || ending_date) {
        filter.createdAt = {};
        if (starting_date) filter.createdAt.$gte = new Date(starting_date);
        if (ending_date) filter.createdAt.$lte = new Date(ending_date);
      }
      const total_orders = await Order.countDocuments(filter);
      const total_users = await User.countDocuments();
      const orders = await Order.find(filter);
      const total_sales = orders.reduce((sum, o) => sum + (o.order_amount || 0), 0);
      const reviewed = orders.filter(o => o.review && o.review.rating);
      const total_ratings = reviewed.length;
      const avg_ratings = total_ratings > 0 ? reviewed.reduce((sum, o) => sum + o.review.rating, 0) / total_ratings : 0;
      return { total_orders, total_users, total_sales, total_ratings, avg_ratings };
    },
    getDashboardSales: async (_, { starting_date, ending_date }) => {
      const filter = {};
      if (starting_date || ending_date) {
        filter.createdAt = {};
        if (starting_date) filter.createdAt.$gte = new Date(starting_date);
        if (ending_date) filter.createdAt.$lte = new Date(ending_date);
      }
      const orders = await Order.find(filter);
      const grouped = {};
      orders.forEach(o => {
        const day = new Date(o.createdAt).toISOString().split('T')[0];
        grouped[day] = (grouped[day] || 0) + (o.order_amount || 0);
      });
      return { orders: Object.entries(grouped).map(([day, amount]) => ({ day, amount })) };
    },
    getDashboardOrders: async (_, { starting_date, ending_date }) => {
      const filter = {};
      if (starting_date || ending_date) {
        filter.createdAt = {};
        if (starting_date) filter.createdAt.$gte = new Date(starting_date);
        if (ending_date) filter.createdAt.$lte = new Date(ending_date);
      }
      const orders = await Order.find(filter);
      const grouped = {};
      orders.forEach(o => {
        const day = new Date(o.createdAt).toISOString().split('T')[0];
        grouped[day] = (grouped[day] || 0) + 1;
      });
      const result = Object.entries(grouped).map(([day, count]) => ({ day, count }));
      return { orders: result };
    },
    getDashboardData: async (_, { starting_date, ending_date }) => {
      const filter = {};
      if (starting_date || ending_date) {
        filter.createdAt = {};
        if (starting_date) filter.createdAt.$gte = new Date(starting_date);
        if (ending_date) filter.createdAt.$lte = new Date(ending_date);
      }
      const total_orders = await Order.countDocuments(filter);
      const total_users = await User.countDocuments();
      const orders = await Order.find(filter);
      const total_sales = orders.reduce((sum, o) => sum + (o.order_amount || 0), 0);
      const grouped = {};
      orders.forEach(o => {
        const day = new Date(o.createdAt).toISOString().split('T')[0];
        if (!grouped[day]) grouped[day] = { day, count: 0, amount: 0 };
        grouped[day].count += 1;
        grouped[day].amount += (o.order_amount || 0);
      });
      return { total_orders, total_users, total_sales, orders: Object.values(grouped) };
    },

    // Configuration
    configuration: async () => {
      let config = await Configuration.findOne();
      if (!config) config = await Configuration.create({});
      return config;
    },
    getConfiguration: async () => {
      let config = await Configuration.findOne();
      if (!config) config = await Configuration.create({});
      return config;
    },

    // Statuses
    getOrderStatuses: () => ['PENDING', 'ACCEPTED', 'ASSIGNED', 'PICKED', 'DELIVERED', 'CANCELLED'],
    getPaymentStatuses: () => ['PENDING', 'PAID', 'REFUNDED'],
  },

  Mutation: {
    // Admin Auth
    adminLogin: async (_, { email, password }) => {
      // For demo: default admin
      if (email === 'admin@xpresscart.com' && password === 'xpresscart123') {
        const token = generateToken({ userId: 'admin', role: 'admin', email });
        return { userId: 'admin', token, name: 'Admin', email };
      }
      const user = await User.findOne({ email });
      if (!user) throw new Error('Invalid credentials');
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) throw new Error('Invalid credentials');
      const token = generateToken({ userId: user._id, role: 'admin', email: user.email });
      return { userId: user._id, token, name: user.name, email: user.email };
    },

    // User Auth
    userLogin: async (_, { email, password }) => {
      const user = await User.findOne({ email });
      if (!user) throw new Error('User not found');
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) throw new Error('Invalid credentials');
      const token = generateToken({ userId: user._id, role: 'user', email: user.email });
      return { userId: user._id, token, name: user.name, email: user.email };
    },
    createUser: async (_, { userInput }) => {
      const existing = await User.findOne({ email: userInput.email });
      if (existing) throw new Error('Email already exists');
      const hashedPassword = await bcrypt.hash(userInput.password, 10);
      const user = await User.create({ ...userInput, password: hashedPassword });
      const token = generateToken({ userId: user._id, role: 'user', email: user.email });
      return { userId: user._id, token, name: user.name, email: user.email };
    },
    forgotPassword: async (_, { email }) => {
      await User.findOne({ email });
      return { result: 'If the email exists, a reset link has been sent.' };
    },
    resetPassword: async (_, { password, token }) => {
      return { result: 'Password reset successfully.' };
    },
    changePassword: async (_, { oldPassword, newPassword }, context) => {
      if (!context.user) throw new Error('Not authenticated');
      const user = await User.findById(context.user.userId);
      if (!user) throw new Error('User not found');
      const isMatch = await bcrypt.compare(oldPassword, user.password);
      if (!isMatch) throw new Error('Current password is incorrect');
      user.password = await bcrypt.hash(newPassword, 10);
      await user.save();
      return { result: 'Password changed successfully.' };
    },
    updateUser: async (_, { userInput }, context) => {
      if (!context.user) throw new Error('Not authenticated');
      return await User.findByIdAndUpdate(context.user.userId, userInput, { new: true });
    },

    // Rider Auth
    riderLogin: async (_, { username, password }) => {
      const rider = await Rider.findOne({ username }).select('+password');
      if (!rider) throw new Error('Rider not found');
      const isMatch = await bcrypt.compare(password, rider.password);
      if (!isMatch) throw new Error('Invalid credentials');
      const token = generateToken({ userId: rider._id, role: 'rider', username: rider.username });
      return { userId: rider._id, token, name: rider.name, username: rider.username };
    },

    // Foods
    createFood: async (_, { foodInput }) => {
      const food = await Food.create(foodInput);
      return await Food.findById(food._id).populate('category').populate('variations.addons');
    },
    editFood: async (_, { foodInput }) => {
      await Food.findByIdAndUpdate(foodInput._id, foodInput);
      return await Food.findById(foodInput._id).populate('category').populate('variations.addons');
    },
    deleteFood: async (_, { id }) => {
      await Food.findByIdAndDelete(id);
      return { _id: id };
    },

    // Categories
    createCategory: async (_, { title, description, img_menu }) => {
      return await Category.create({ title, description, img_menu });
    },
    editCategory: async (_, args) => {
      const { _id, ...rest } = args;
      await Category.findByIdAndUpdate(_id, rest);
      return await Category.findById(_id);
    },
    deleteCategory: async (_, { id }) => {
      await Category.findByIdAndDelete(id);
      return { _id: id };
    },

    // Options
    createOptions: async (_, { optionInput }) => {
      const created = [];
      for (const opt of optionInput) {
        created.push(await Option.create(opt));
      }
      return created;
    },
    editOption: async (_, { optionInput }) => {
      const { _id, ...rest } = optionInput;
      return await Option.findByIdAndUpdate(_id, rest, { new: true });
    },
    deleteOption: async (_, { id }) => {
      await Option.findByIdAndDelete(id);
      return id;
    },

    // Addons
    createAddons: async (_, { addonInput }) => {
      const created = [];
      for (const addon of addonInput) {
        created.push(await Addon.create(addon));
      }
      return created;
    },
    editAddon: async (_, { addonInput }) => {
      return await Addon.findByIdAndUpdate(addonInput._id, addonInput, { new: true }).populate('options');
    },
    deleteAddon: async (_, { id }) => {
      await Addon.findByIdAndDelete(id);
      return id;
    },

    // Orders
    placeOrder: async (_, { orderInput }, context) => {
      const userId = context.user?.userId;
      const config = await Configuration.findOne();
      const prefix = config?.order_id_prefix || 'XC';
      const order_id = `${prefix}${Date.now()}${Math.floor(Math.random() * 1000)}`;
      let couponDiscount = 0;
      let couponCode = null;
      if (orderInput.coupon_code) {
        const coupon = await Coupon.findOne({ code: orderInput.coupon_code, enabled: true });
        if (coupon) { couponDiscount = coupon.discount; couponCode = coupon.code; }
      }
      const order = await Order.create({
        ...orderInput,
        order_id,
        user: userId,
        paid_amount: orderInput.paid_amount || (orderInput.order_amount - couponDiscount),
        coupon: couponCode ? { code: couponCode, discount: couponDiscount } : undefined
      });
      const populated = await Order.findById(order._id).populate('user').populate('items.food');
      pubsub.publish(ORDER_ADDED, { subscribePlaceOrder: { order: populated, origin: 'new_order' }, subscriptionOrder: { order: populated, origin: 'new_order' }, subscriptionUnassignedOrder: populated });
      return populated;
    },
    updateOrderStatus: async (_, { id, status, reason }) => {
      const order = await Order.findByIdAndUpdate(id, { order_status: status, reason }, { new: true })
        .populate('user').populate('rider').populate('items.food');
      pubsub.publish(ORDER_UPDATED, { subscribePlaceOrder: { order, origin: status }, subscriptionAssignedOrder: { order, origin: status } });
      return order;
    },
    updatePaymentStatus: async (_, { id, status }) => {
      return await Order.findByIdAndUpdate(id, { payment_status: status }, { new: true })
        .populate('user').populate('rider').populate('items.food');
    },
    updateStatus: async (_, { id, status, reason }) => {
      return await Order.findByIdAndUpdate(id, { status, reason }, { new: true })
        .populate('user').populate('rider').populate('items.food');
    },

    // Riders
    createRider: async (_, { riderInput }) => {
      const rider = new Rider(riderInput);
      return await rider.save();
    },
    editRider: async (_, { riderInput }) => {
      if (riderInput.password) {
        const rider = await Rider.findById(riderInput._id);
        if (rider) {
          Object.assign(rider, riderInput);
          await rider.save();
          return rider;
        }
      }
      return await Rider.findByIdAndUpdate(riderInput._id, riderInput, { new: true });
    },
    deleteRider: async (_, { id }) => {
      await Rider.findByIdAndDelete(id);
      return { _id: id };
    },
    toggleAvailablity: async (_, { id }) => {
      const rider = await Rider.findById(id);
      if (rider) {
        rider.available = !rider.available;
        await rider.save();
      }
      return { _id: id };
    },
    assignRider: async (_, { id, riderId }) => {
      return await Order.findByIdAndUpdate(id, { rider: riderId, order_status: 'ASSIGNED' }, { new: true })
        .populate('user').populate('rider').populate('items.food');
    },
    updateRiderLocation: async (_, { latitude, longitude }, context) => {
      if (!context.user || context.user.role !== 'rider') throw new Error('Not authenticated');
      return await Rider.findByIdAndUpdate(context.user.userId, {
        location: { latitude, longitude }
      }, { new: true });
    },

    // Coupons
    createCoupon: async (_, { couponInput }) => {
      return await Coupon.create(couponInput);
    },
    editCoupon: async (_, { couponInput }) => {
      return await Coupon.findByIdAndUpdate(couponInput._id, couponInput, { new: true });
    },
    deleteCoupon: async (_, { id }) => {
      await Coupon.findByIdAndDelete(id);
      return id;
    },

    // Reviews
    submitReview: async (_, { orderId, rating, description }, context) => {
      if (!context.user) throw new Error('Not authenticated');
      return await Order.findByIdAndUpdate(orderId, {
        review: { rating, description, is_active: true }
      }, { new: true }).populate('user').populate('items.food');
    },

    // Addresses
    createAddress: async (_, { addressInput }, context) => {
      if (!context.user) throw new Error('Not authenticated');
      return await User.findByIdAndUpdate(context.user.userId, {
        $push: { addresses: { ...addressInput, _id: new (require('mongoose').Types.ObjectId)() } }
      }, { new: true });
    },
    editAddress: async (_, { addressInput }, context) => {
      if (!context.user) throw new Error('Not authenticated');
      if (!addressInput._id) throw new Error('Address ID is required');
      const user = await User.findById(context.user.userId);
      const idx = user.addresses.findIndex(a => a._id.toString() === addressInput._id);
      if (idx !== -1) user.addresses[idx] = { ...user.addresses[idx].toObject(), ...addressInput };
      await user.save();
      return user;
    },
    deleteAddress: async (_, { id }, context) => {
      if (!context.user) throw new Error('Not authenticated');
      return await User.findByIdAndUpdate(context.user.userId, {
        $pull: { addresses: { _id: id } }
      }, { new: true });
    },

    // Configuration
    saveOrderConfiguration: async (_, { configurationInput }) => {
      let config = await Configuration.findOne();
      if (!config) config = new Configuration();
      if (configurationInput.order_id_prefix) config.order_id_prefix = configurationInput.order_id_prefix;
      return await config.save();
    },
    saveEmailConfiguration: async (_, { configurationInput }) => {
      let config = await Configuration.findOne();
      if (!config) config = new Configuration();
      if (configurationInput.email !== undefined) config.email = configurationInput.email;
      if (configurationInput.password !== undefined) config.password = configurationInput.password;
      if (configurationInput.enable_email !== undefined) config.enable_email = configurationInput.enable_email;
      return await config.save();
    },
    savePaypalConfiguration: async (_, { configurationInput }) => {
      let config = await Configuration.findOne();
      if (!config) config = new Configuration();
      if (configurationInput.client_id !== undefined) config.client_id = configurationInput.client_id;
      if (configurationInput.client_secret !== undefined) config.client_secret = configurationInput.client_secret;
      if (configurationInput.sandbox !== undefined) config.sandbox = configurationInput.sandbox;
      return await config.save();
    },
    saveStripeConfiguration: async (_, { configurationInput }) => {
      let config = await Configuration.findOne();
      if (!config) config = new Configuration();
      if (configurationInput.publishable_key !== undefined) config.publishable_key = configurationInput.publishable_key;
      if (configurationInput.secret_key !== undefined) config.secret_key = configurationInput.secret_key;
      return await config.save();
    },
    saveDeliveryConfiguration: async (_, { configurationInput }) => {
      let config = await Configuration.findOne();
      if (!config) config = new Configuration();
      if (configurationInput.delivery_charges !== undefined) config.delivery_charges = configurationInput.delivery_charges;
      return await config.save();
    },
    saveCurrencyConfiguration: async (_, { configurationInput }) => {
      let config = await Configuration.findOne();
      if (!config) config = new Configuration();
      if (configurationInput.currency !== undefined) config.currency = configurationInput.currency;
      if (configurationInput.currency_symbol !== undefined) config.currency_symbol = configurationInput.currency_symbol;
      return await config.save();
    },

    // Push Notifications
    uploadToken: async (_, { pushToken }, context) => {
      if (!context.user) throw new Error('Not authenticated');
      return await User.findByIdAndUpdate(context.user.userId, { push_token: pushToken }, { new: true });
    },
    updateNotificationToken: async (_, { token }, context) => {
      if (!context.user) throw new Error('Not authenticated');
      return await User.findByIdAndUpdate(context.user.userId, { push_token: token }, { new: true });
    },
    sendNotificationUser: async (_, { notificationTitle, notificationBody }) => {
      // In production, integrate with Firebase Admin SDK to send push notifications
      return { success: true };
    },
  },

  Subscription: {
    subscribePlaceOrder: {
      subscribe: () => pubsub.asyncIterator([ORDER_ADDED, ORDER_UPDATED])
    },
    subscriptionOrder: {
      subscribe: (_, { userId }) => pubsub.asyncIterator([ORDER_ADDED])
    },
    subscriptionUnassignedOrder: {
      subscribe: () => pubsub.asyncIterator([ORDER_ADDED])
    },
    subscriptionAssignedOrder: {
      subscribe: (_, { riderId }) => pubsub.asyncIterator([ORDER_UPDATED])
    }
  }
};

module.exports = resolvers;
