require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./src/utils/db');
const Category = require('./src/models/Category');
const Food = require('./src/models/Food');
const Option = require('./src/models/Option');
const Addon = require('./src/models/Addon');
const Coupon = require('./src/models/Coupon');
const Configuration = require('./src/models/Configuration');

const seed = async () => {
  await connectDB();
  console.log('Seeding database...');

  await Configuration.deleteMany({});
  await Configuration.create({
    order_id_prefix: 'XC',
    delivery_charges: 50,
    currency: 'USD',
    currency_symbol: '$',
    enable_email: false
  });
  console.log('Configuration created');

  const options = await Option.insertMany([
    { title: 'Extra Cheese', description: 'Additional cheese', price: 20 },
    { title: 'Large Size', description: 'Upgrade to large', price: 50 },
    { title: 'Extra Sauce', description: 'Additional sauce', price: 10 },
    { title: 'No Onions', description: 'Remove onions', price: 0 }
  ]);
  console.log('Options created');

  await Addon.deleteMany({});
  await Addon.insertMany([
    { title: 'Cheese Add-ons', description: 'Extra cheese options', options: [options[0]._id], quantity_minimum: 0, quantity_maximum: 2 },
    { title: 'Size Options', description: 'Choose your size', options: [options[1]._id], quantity_minimum: 1, quantity_maximum: 1 },
    { title: 'Sauce Choices', description: 'Pick your sauce', options: [options[2]._id], quantity_minimum: 0, quantity_maximum: 3 }
  ]);
  console.log('Addons created');

  await Category.deleteMany({});
  const categories = await Category.insertMany([
    { title: 'Pizza', description: 'Fresh baked pizzas with premium toppings', img_menu: '' },
    { title: 'Burgers', description: 'Juicy burgers made with Angus beef', img_menu: '' },
    { title: 'Pasta', description: 'Authentic Italian pasta dishes', img_menu: '' },
    { title: 'Drinks', description: 'Refreshing beverages', img_menu: '' }
  ]);
  console.log('Categories created');

  await Food.deleteMany({});
  await Food.insertMany([
    {
      title: 'Margherita Pizza',
      description: 'Classic cheese pizza with tomato sauce and fresh basil',
      img_url: '',
      stock: 50,
      category: categories[0]._id,
      variations: [
        { title: 'Small', price: 199, discounted: 149 },
        { title: 'Medium', price: 299, discounted: 249 },
        { title: 'Large', price: 399, discounted: 349 }
      ]
    },
    {
      title: 'Pepperoni Pizza',
      description: 'Loaded with pepperoni and mozzarella cheese',
      img_url: '',
      stock: 40,
      category: categories[0]._id,
      variations: [
        { title: 'Small', price: 249, discounted: 199 },
        { title: 'Medium', price: 349, discounted: 299 },
        { title: 'Large', price: 449, discounted: 399 }
      ]
    },
    {
      title: 'Classic Burger',
      description: 'Angus beef patty with lettuce, tomato, and special sauce',
      img_url: '',
      stock: 30,
      category: categories[1]._id,
      variations: [
        { title: 'Single', price: 149, discounted: 129 },
        { title: 'Double', price: 249, discounted: 219 }
      ]
    },
    {
      title: 'Chicken Burger',
      description: 'Crispy chicken fillet with coleslaw and mayo',
      img_url: '',
      stock: 35,
      category: categories[1]._id,
      variations: [
        { title: 'Regular', price: 169, discounted: 149 },
        { title: 'Large', price: 269, discounted: 239 }
      ]
    },
    {
      title: 'Penne Alfredo',
      description: 'Creamy white sauce pasta with mushrooms and broccoli',
      img_url: '',
      stock: 25,
      category: categories[2]._id,
      variations: [
        { title: 'Regular', price: 229, discounted: 199 },
        { title: 'Large', price: 329, discounted: 289 }
      ]
    },
    {
      title: 'Coca Cola',
      description: 'Classic cola drink 500ml',
      img_url: '',
      stock: 100,
      category: categories[3]._id,
      variations: [
        { title: '500ml', price: 50, discounted: 40 }
      ]
    }
  ]);
  console.log('Foods created');

  await Coupon.deleteMany({});
  await Coupon.insertMany([
    { code: 'WELCOME10', discount: 10, enabled: true },
    { code: 'SAVE50', discount: 50, enabled: true },
    { code: 'FREEDEL', discount: 0, enabled: true }
  ]);
  console.log('Coupons created');

  console.log('Seed complete!');
  process.exit(0);
};

seed().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
