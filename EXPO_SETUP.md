# Expo Account Setup for XpressCart

Expo is **free** and used to build, preview, and deploy the CustomerApp and RiderApp.

---

## Step 1: Create Your Account

1. Go to **[expo.dev/signup](https://expo.dev/signup)**
2. Sign up with your email or GitHub
3. Choose a **username** (this becomes `@your-username/xpresscart`)
4. Verify your email if prompted

---

## Step 2: Install Expo CLI

Open PowerShell/Terminal and run:

```bash
npm install -g expo-cli
```

Then login:

```bash
expo login
```

Enter the username/password you just created.

---

## Step 3: Create EAS Projects (for builds)

You need two EAS projects — one per app:

```bash
cd "C:\Users\parth\Desktop\Final_XpressCart_APP\CustomerApp"
eas init
```

Follow the prompts, then do the same for RiderApp:

```bash
cd "C:\Users\parth\Desktop\Final_XpressCart_APP\RiderApp"
eas init
```

This gives you two `projectId` values. Note them down.

---

## Step 4: Update app.json Files

After creating both EAS projects, update these files with your Expo username and new project IDs:

### CustomerApp/app.json — 3 changes:
```json
"owner": "YOUR_EXPO_USERNAME",
"currentFullName": "@YOUR_EXPO_USERNAME/xpresscart",
"originalFullName": "@YOUR_EXPO_USERNAME/xpresscart",
"extra": {
  "eas": {
    "projectId": "YOUR_CUSTOMER_PROJECT_ID"
  }
}
```

### RiderApp/app.json — 3 changes:
```json
"owner": "YOUR_EXPO_USERNAME",
"currentFullName": "@YOUR_EXPO_USERNAME/food-delivery-rider-singlevendor",
"originalFullName": "@YOUR_EXPO_USERNAME/food-delivery-rider-singlevendor",
"extra": {
  "eas": {
    "projectId": "YOUR_RIDER_PROJECT_ID"
  }
}
```

---

## Step 5: Test the Apps Locally

### CustomerApp:
```bash
cd "C:\Users\parth\Desktop\Final_XpressCart_APP\CustomerApp"
npm install
npx expo start
```

### RiderApp:
```bash
cd "C:\Users\parth\Desktop\Final_XpressCart_APP\RiderApp"
npm install
npx expo start
```

This opens Expo Dev Tools in your browser. Scan the QR code with the **Expo Go** app on your phone (download from Play Store / App Store) to preview instantly.

---

## Step 6: Build for Production (when ready)

For Android:
```bash
cd CustomerApp
eas build --platform android --profile production
```

For iOS:
```bash
cd CustomerApp
eas build --platform ios --profile production
```

Same commands for RiderApp.

---

## Quick Reference

| What | Cost |
|------|------|
| Expo account | Free |
| Expo Go app (preview) | Free |
| EAS Build (development) | Free (first builds) |
| EAS Build (production) | Free tier includes 30 builds/month |
| EAS Submit (App Store/Play Store) | Free tier available |
