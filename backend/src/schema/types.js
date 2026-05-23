const gql = String.raw;

const typeDefs = gql`
  type User {
    _id: ID!
    name: String
    email: String!
    phone: String
    addresses: [Address]
    createdAt: String
  }

  type Address {
    _id: ID
    latitude: Float
    longitude: Float
    delivery_address: String
    details: String
    label: String
  }

  type Category {
    _id: ID!
    title: String
    description: String
    img_menu: String
  }

  type Option {
    _id: ID
    title: String
    description: String
    price: Float
  }

  type Addon {
    _id: ID
    title: String
    description: String
    options: [Option]
    quantity_minimum: Int
    quantity_maximum: Int
    is_active: Boolean
  }

  type Variation {
    _id: ID
    title: String
    price: Float
    discounted: Float
    addons: [Addon]
  }

  type Food {
    _id: ID!
    title: String
    description: String
    img_url: String
    stock: Int
    tag: String
    variations: [Variation]
    category: Category
  }

  type Review {
    _id: ID
    rating: Float
    description: String
    is_active: Boolean
    createdAt: String
  }

  type Rider {
    _id: ID
    name: String
    username: String
    phone: String
    available: Boolean
    location: RiderLocation
  }

  type RiderLocation {
    latitude: Float
    longitude: Float
  }

  type OrderItem {
    _id: ID
    food: Food
    variation: Variation
    addons: [Addon]
    quantity: Int
  }

  type OrderUser {
    _id: ID
    name: String
    email: String
    phone: String
  }

  type Order {
    _id: ID!
    order_id: String
    user: OrderUser
    items: [OrderItem]
    delivery_address: Address
    delivery_charges: Float
    order_amount: Float
    paid_amount: Float
    payment_method: String
    order_status: String
    payment_status: String
    status: Boolean
    reason: String
    rider: Rider
    review: Review
    createdAt: String
  }

  type Coupon {
    _id: ID
    code: String
    discount: Float
    enabled: Boolean
  }

  type Configuration {
    _id: ID
    order_id_prefix: String
    email: String
    password: String
    enable_email: Boolean
    client_id: String
    client_secret: String
    sandbox: Boolean
    publishable_key: String
    secret_key: String
    delivery_charges: Float
    currency: String
    currency_symbol: String
  }

  type AdminAuthPayload {
    userId: ID
    token: String
    name: String
    email: String
  }

  type UserAuthPayload {
    userId: ID
    token: String
    name: String
    email: String
  }

  type RiderAuthPayload {
    userId: ID
    token: String
    name: String
    username: String
  }

  type DashboardTotal {
    total_orders: Int
    total_users: Int
    total_sales: Float
    total_ratings: Int
    avg_ratings: Float
  }

  type SalesData {
    day: String
    amount: Float
  }

  type OrdersData {
    day: String
    count: Int
  }

  type DashboardSales {
    orders: [SalesData]
  }

  type DashboardOrders {
    orders: [OrdersData]
  }

  type DashboardFullData {
    day: String
    count: Int
    amount: Float
  }

  type DashboardFull {
    total_orders: Int
    total_users: Int
    total_sales: Float
    orders: [DashboardFullData]
  }

  type ResetPasswordResult {
    result: String
  }

  type DeleteResult {
    _id: ID
  }

  type NotificationResult {
    success: Boolean
  }

  type OrderSubscription {
    order: Order
    origin: String
  }

  type RiderSubscription {
    userId: ID
    origin: String
    order: Order
  }

  # --- Inputs ---

  input AddressInput {
    _id: ID
    latitude: Float
    longitude: Float
    delivery_address: String
    details: String
    label: String
  }

  input VariationInput {
    _id: ID
    title: String!
    price: Float!
    discounted: Float
    addons: [ID]
  }

  input FoodInput {
    _id: ID
    title: String!
    description: String
    img_url: String
    stock: Int
    tag: String
    variations: [VariationInput]
    category: ID
  }

  input OptionInput {
    _id: ID
    title: String
    description: String
    price: Float
  }

  input AddonInput {
    _id: ID
    title: String
    description: String
    options: [ID]
    quantity_minimum: Int
    quantity_maximum: Int
  }

  input RiderInput {
    _id: ID
    name: String
    username: String
    password: String
    phone: String
  }

  input CouponInput {
    _id: ID
    code: String!
    discount: Float!
    enabled: Boolean
  }

  input OrderConfigurationInput {
    order_id_prefix: String
  }

  input EmailConfigurationInput {
    email: String
    password: String
    enable_email: Boolean
  }

  input PaypalConfigurationInput {
    client_id: String
    client_secret: String
    sandbox: Boolean
  }

  input StripeConfigurationInput {
    publishable_key: String
    secret_key: String
  }

  input DeliveryConfigurationInput {
    delivery_charges: Float
  }

  input CurrencyConfigurationInput {
    currency: String
    currency_symbol: String
  }

  input OrderItemInput {
    food: ID!
    variation: ID!
    addons: [ID]
    quantity: Int!
  }

  input OrderInput {
    items: [OrderItemInput]!
    delivery_address: AddressInput!
    delivery_charges: Float
    order_amount: Float!
    paid_amount: Float
    payment_method: String!
    coupon_code: String
  }

  # --- Queries ---
  type Query {
    # Categories
    categories: [Category]
    allCategories(page: Int): [Category]

    # Foods
    foods(page: Int): [Food]
    foodsByCategory(category: ID!): [Food]
    foodByIds(ids: [ID]!): [Food]

    # Options
    options: [Option]
    allOptions(page: Int): [Option]

    # Addons
    addons: [Addon]
    allAddons(page: Int): [Addon]

    # Coupons
    coupons: [Coupon]

    # Orders
    allOrders(page: Int, rows: Int, search: String): [Order]
    orderCount: Int
    ordersByUser(userId: ID!): [Order]

    # Riders
    riders: [Rider]
    availableRiders: [Rider]
    rider(id: ID!): Rider
    riderLocation(riderId: ID!): RiderLocation

    # Users
    users(page: Int): [User]
    profile: User

    # Reviews
    allReviews(offset: Int): [Order]

    # Dashboard
    getDashboardTotal(starting_date: String, ending_date: String): DashboardTotal
    getDashboardSales(starting_date: String, ending_date: String): DashboardSales
    getDashboardOrders(starting_date: String, ending_date: String): DashboardOrders
    getDashboardData(starting_date: String, ending_date: String): DashboardFull

    # Configuration
    configuration: Configuration
    getConfiguration: Configuration

    # Statuses
    getOrderStatuses: [String]
    getPaymentStatuses: [String]
  }

  # --- Mutations ---
  type Mutation {
    # Admin Auth
    adminLogin(email: String!, password: String!): AdminAuthPayload

    # User Auth
    userLogin(email: String!, password: String!): UserAuthPayload
    createUser(userInput: UserInput!): UserAuthPayload
    forgotPassword(email: String!): ResetPasswordResult
    resetPassword(password: String!, token: String!): ResetPasswordResult
    changePassword(oldPassword: String!, newPassword: String!): ResetPasswordResult
    updateUser(userInput: UserUpdateInput!): User

    # Rider Auth
    riderLogin(username: String!, password: String!): RiderAuthPayload

    # Foods
    createFood(foodInput: FoodInput!): Food
    editFood(foodInput: FoodInput!): Food
    deleteFood(id: String!): DeleteResult

    # Categories
    createCategory(title: String!, description: String!, img_menu: String): Category
    editCategory(_id: String, title: String!, description: String!, img_menu: String): Category
    deleteCategory(id: String!): DeleteResult

    # Options
    createOptions(optionInput: [OptionInput]): [Option]
    editOption(optionInput: OptionInput): Option
    deleteOption(id: String!): String

    # Addons
    createAddons(addonInput: [AddonInput]): [Addon]
    editAddon(addonInput: AddonInput): Addon
    deleteAddon(id: String!): String

    # Orders
    placeOrder(orderInput: OrderInput!): Order
    updateOrderStatus(id: String!, status: String!, reason: String): Order
    updatePaymentStatus(id: String!, status: String!): Order
    updateStatus(id: String!, status: Boolean!, reason: String): Order

    # Riders
    createRider(riderInput: RiderInput!): Rider
    editRider(riderInput: RiderInput!): Rider
    deleteRider(id: String!): DeleteResult
    toggleAvailablity(id: String): DeleteResult
    assignRider(id: String!, riderId: String!): Order
    updateRiderLocation(latitude: Float!, longitude: Float!): Rider

    # Coupons
    createCoupon(couponInput: CouponInput!): Coupon
    editCoupon(couponInput: CouponInput!): Coupon
    deleteCoupon(id: String!): String

    # Reviews
    submitReview(orderId: ID!, rating: Float!, description: String!): Order

    # Addresses
    createAddress(addressInput: AddressInput!): User
    editAddress(addressInput: AddressInput!): User
    deleteAddress(id: String!): User

    # Configuration
    saveOrderConfiguration(configurationInput: OrderConfigurationInput!): Configuration
    saveEmailConfiguration(configurationInput: EmailConfigurationInput!): Configuration
    savePaypalConfiguration(configurationInput: PaypalConfigurationInput!): Configuration
    saveStripeConfiguration(configurationInput: StripeConfigurationInput!): Configuration
    saveDeliveryConfiguration(configurationInput: DeliveryConfigurationInput!): Configuration
    saveCurrencyConfiguration(configurationInput: CurrencyConfigurationInput!): Configuration

    # Push Notifications
    uploadToken(pushToken: String!): User
    updateNotificationToken(token: String!): User
    sendNotificationUser(notificationTitle: String, notificationBody: String!): NotificationResult
  }

  # --- Subscriptions ---
  type Subscription {
    subscribePlaceOrder: OrderSubscription
    subscriptionOrder(userId: ID!): RiderSubscription
    subscriptionUnassignedOrder: Order
    subscriptionAssignedOrder(riderId: ID!): RiderSubscription
  }

  # Additional input types
  input UserInput {
    name: String!
    email: String!
    phone: String
    password: String!
  }

  input UserUpdateInput {
    name: String
    phone: String
  }
`;

module.exports = typeDefs;
