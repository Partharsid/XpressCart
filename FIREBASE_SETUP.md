# Firebase Setup Tutorial for XpressCart

## Overview
XpressCart uses Firebase for:
- **Push Notifications** (Admin Dashboard + Customer/Rider Apps)
- **Authentication** (Google & Facebook sign-in in CustomerApp)

---

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **Add project**
3. Name: `xpresscart-app` (or your preferred name)
4. Enable Google Analytics (optional)
5. Click **Create project**

## Step 2: Register Your Apps

### For Admin Dashboard (Web App)
1. In Firebase Console → **Project Overview** → **Add app** → **Web** (`</>`)
2. Nickname: `XpressCart Admin Dashboard`
3. Register app
4. Copy the `firebaseConfig` object — you'll need it for `Admin Dashboard/src/index.js`

### For CustomerApp (Android)
1. **Add app** → **Android**
2. Android package name: `com.xpresscart.customer`
3. Nickname: `XpressCart Customer`
4. Register app
5. Download `google-services.json` → place it in `CustomerApp/` (replace existing)

### For CustomerApp (iOS)
1. **Add app** → **iOS**
2. iOS bundle ID: `com.xpresscart.customer`
3. Nickname: `XpressCart Customer iOS`
4. Register app
5. Download `GoogleService-Info.plist`

### For RiderApp (Android)
1. **Add app** → **Android**
2. Android package name: `com.xpresscart.rider`
3. Nickname: `XpressCart Rider`
4. Download `google-services.json` → place it in `RiderApp/` (replace existing)

### For RiderApp (iOS)
1. **Add app** → **iOS**
2. iOS bundle ID: `com.xpresscart.rider`
3. Download `GoogleService-Info.plist`

## Step 3: Enable Authentication Providers

1. **Build** → **Authentication** → **Get started**
2. Under **Sign-in method** tab, enable:
   - **Email/Password** (for admin & customer login)
   - **Google** (for customer social login)
   - **Facebook** (optional, for customer social login)
3. For Google: Configure the OAuth client IDs from your Google Cloud project
4. For Facebook: Add your Facebook App ID and App Secret

## Step 4: Enable Cloud Messaging (Push Notifications)

1. **Build** → **Cloud Messaging**
2. Firebase Cloud Messaging is auto-enabled when you register apps
3. For the Admin Dashboard service worker:
   - The Web Push certificate is auto-generated
   - Copy your **messagingSenderId** from Project Settings → Cloud Messaging
   - Update `messagingSenderId` in:
     - `Admin Dashboard/public/firebase-messaging-sw.js` (line 10)
     - `Admin Dashboard/src/index.js` (line 33)

## Step 5: Update Firebase Config in the Code

### Admin Dashboard (`Admin Dashboard/src/index.js`)
Replace the `firebaseConfig` object (line 28-35) with your new config:
```js
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  databaseURL: "https://YOUR_PROJECT.firebaseio.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
}
```

### CustomerApp & RiderApp
- Replace `google-services.json` files with your downloaded ones
- These files contain Firebase configuration for Android
- For iOS, add `GoogleService-Info.plist` to the project

## Step 6: Enable Firestore / Realtime Database (if needed)

If your app uses Firebase database for orders:
1. **Build** → **Firestore Database** or **Realtime Database**
2. Click **Create database**
3. Set security rules appropriately (start in test mode for development)
4. Update the `databaseURL` in your config

## Step 7: Test the Setup

1. Start the Admin Dashboard: `cd "Admin Dashboard" && npm start`
2. Allow notification permissions when prompted
3. The browser should receive a push notification token

---

## Important Files to Update

| File | What to Update |
|------|---------------|
| `Admin Dashboard/src/index.js` | `firebaseConfig` object, VAPID key |
| `Admin Dashboard/public/firebase-messaging-sw.js` | `messagingSenderId` |
| `CustomerApp/google-services.json` | Replace with your Firebase config |
| `CustomerApp/google-services-prod.json` | Replace with production Firebase config |
| `RiderApp/google-services.json` | Replace with your Firebase config |

---

## Note on the Existing Enatega Backend

The apps are currently configured to use the Enatega backend API at:
- `https://enatega-singlevendor.up.railway.app/graphql`

The Enatega backend handles authentication, orders, and business logic. Firebase is used
primarily for push notifications and social authentication. The admin dashboard uses
Firebase Cloud Messaging for real-time order notifications.
