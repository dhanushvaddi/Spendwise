# SpendWise — SMS Expense Tracker APK

A full-featured Android expense tracker that auto-reads your bank SMS messages.

## Features
- 📩 Auto-parse SMS from HDFC, ICICI, SBI, Axis, Kotak, GPay, PhonePe, Paytm, Credit Cards
- ✏️ Manual expense entry with categories
- 📊 Analytics: daily, monthly, merchant-wise breakdowns
- 💰 Budget limits with alerts at 80%+ usage
- 🌙 Dark theme, works offline

---

## How to Build the APK

### Prerequisites
- Node.js 18+ installed
- An Expo account (free): https://expo.dev/signup

---

### Step 1 — Install dependencies

```bash
cd ExpenseTracker
npm install
```

---

### Step 2 — Install EAS CLI

```bash
npm install -g eas-cli
eas login
```

---

### Step 3 — Initialize EAS project

```bash
eas init
```

This will:
- Create a project on expo.dev
- Update `app.json` with your project ID automatically

---

### Step 4 — Build the APK (Free Cloud Build)

```bash
eas build -p android --profile preview
```

This builds an `.apk` file (not AAB) that you can install directly on your phone.

- Build takes ~10–15 minutes on Expo's free servers
- You'll get a download link when complete
- No Android Studio needed!

---

### Step 5 — Install on your Android phone

1. Download the APK from the link provided
2. On your Android phone: **Settings → Security → Install unknown apps** → Allow
3. Open the downloaded APK file and install
4. Open SpendWise
5. Grant **SMS permission** when prompted
6. Tap **🔄 Sync SMS** on the home screen

---

## Local Development (Optional)

To run during development with mock data:

```bash
# Install Expo Go on your phone from Play Store
npx expo start
# Scan the QR code with Expo Go
```

Note: SMS reading only works in the built APK, not Expo Go.
Mock data with 12 sample transactions is loaded in development.

---

## SMS Permissions

The app requires `READ_SMS` permission on Android. This is:
- Declared in `app.json` under `android.permissions`
- Requested at runtime on first sync
- Used only to read bank/UPI messages
- Never sent anywhere — all data stays on your device

---

## Supported Banks & Apps

| Bank | Sender Code |
|------|-------------|
| HDFC Bank | HDFCBK |
| ICICI Bank | ICICIT |
| SBI | SBIINB |
| Axis Bank | AXISBK |
| Kotak Bank | KOTAKB |
| Yes Bank | YESBNK |
| PNB | PNBSMS |
| Google Pay | GPAY |
| PhonePe | PHONEPE |
| Paytm | PAYTMB |
| Credit Cards | Detected via keywords |

---

## Project Structure

```
ExpenseTracker/
├── App.js                          # Navigation & root
├── app.json                        # Expo + Android config
├── eas.json                        # Build profiles
├── src/
│   ├── context/AppContext.js       # Global state
│   ├── hooks/useSMSSync.js        # SMS reading logic
│   ├── utils/
│   │   ├── smsParser.js           # SMS parsing engine
│   │   └── storage.js             # AsyncStorage helpers
│   ├── components/UIComponents.js  # Reusable UI
│   └── screens/
│       ├── HomeScreen.js          # Dashboard
│       ├── TransactionsScreen.js  # Transaction list
│       ├── AnalyticsScreen.js     # Charts
│       ├── BudgetScreen.js        # Budget manager
│       ├── AddTransactionScreen.js # Manual add
│       └── TransactionDetailScreen.js
```

---

## Customizing SMS Patterns

Edit `src/utils/smsParser.js`:

- Add new bank sender codes to `BANK_SENDERS` array
- Add new regex patterns to `PATTERNS.debited` / `PATTERNS.credited`
- Add merchant keywords to `CATEGORY_KEYWORDS`

---

## Troubleshooting

**SMS not being read?**
- Make sure you granted SMS permission
- Check that your bank SMS has "Rs." or "₹" in the message
- The sender must be a known bank code or contain financial keywords

**Build failing?**
- Run `eas whoami` to confirm you're logged in
- Run `eas build:configure` to re-link the project
- Check expo.dev for build logs

**Transactions showing wrong category?**
- Edit the merchant or category on the transaction detail screen
- Add the merchant name to `CATEGORY_KEYWORDS` in smsParser.js

---

## Privacy
- All data stored locally on device using AsyncStorage
- No internet required after installation
- No analytics, no tracking, no data sent to any server
