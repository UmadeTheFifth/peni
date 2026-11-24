# PENI — Outfits Worth Every Penny

A modern, monochrome clothing storefront and Firebase-backed management system. Rebuilt as a modern HTML/CSS/JavaScript clothing storefront. No product images are required: the collection uses editorial CSS graphics until photography is available.

## What changed

- Complete **PENI** rebrand, including all page titles, headings, wordmarks, alt text, and copy. Tagline: **Outfits worth every penny.**
- New responsive black-and-white design for all **12** HTML pages, including a new payment-status page.
- Reworked collection with 12 initial clothing products under **Senator**, **Agbada** and **Traditional** categories. Product filtering and cart now agree on category names.
- Shopping bag with quantities, delivery choices, and a Paystack hosted checkout that **does not claim payment success until the server verifies it**.
- Real management architecture: Firebase Authentication plus an **administrator custom claim**, Cloud Functions API, Cloud Firestore collections for orders, products, customers (derived from orders), contact messages and moderated reviews.
- Product create/edit/unpublish, order fulfillment updates, review approval, customer list and message handling.
- No insecure default username/password and no payment secret in browser code.

## Files

```
PENI_Website/
├── public/                  # Website files deployed to Firebase Hosting
│   ├── index.html           # Home
│   ├── catalog.html         # Collection
│   ├── cart.html            # Bag / secure checkout
│   ├── payment-result.html  # Server-verified payment status
│   ├── services.html        # The PENI Edit
│   ├── about.html           # Story
│   ├── contact.html         # Contact
│   ├── reviews.html         # Reviews
│   ├── privacy.html         # Privacy
│   ├── terms.html           # Terms
│   ├── admin-login.html     # Staff sign-in
│   ├── admin-dashboard.html # Admin
│   ├── css/styles.css
│   └── js/                   # Front-end application
├── functions/
│   ├── index.js             # Payment/API/auth logic
│   ├── seed-products.json   # Default catalog used by server
│   ├── scripts/grant-admin.js
│   ├── package.json
│   └── .env.example
├── firestore.rules          # Browser access denied; server uses Admin SDK
└── firebase.json            # Hosting/Functions/Firestore configuration
```

## Required setup before accepting real money

**This package is code-ready, not yet deployed or merchant-activated. No live payment can succeed until you complete the steps below with your own accounts.** Do not send your secret API keys in chat or commit them to Git.

1. **Create/select a Firebase project** with billing enabled (the **Blaze** plan is needed for Cloud Functions and outbound payment requests). Enable **Firestore Database**, **Firebase Authentication (Email/Password)** and **Firebase Hosting**.
2. **Create a Firebase Web App** in Firebase Console → Project settings → Your apps. Paste its public `apiKey`, `authDomain`, `projectId` and `appId` in `public/js/firebase-config.js`. These are public web configuration values, **not** merchant secret keys.
3. **Install command-line tools** on your computer and select your Firebase project:

   ```bash
   npm install -g firebase-tools
   firebase login
   firebase use --add
   cd functions
   npm install
   cd ..
   ```

4. **Set the public website URL**. Create `functions/.env.YOUR_PROJECT_ID` with this line (substitute the real deployed hostname):

   ```env
   SITE_URL=https://YOUR_PROJECT_ID.web.app
   ```

   If you use a custom domain later, update `SITE_URL` to match the exact storefront origin. This controls safe payment return URLs and same-origin checks.

5. **Configure Paystack on the server**. Create/activate a Paystack merchant account and retrieve your **test secret** first. In the project directory run:

   ```bash
   firebase functions:secrets:set PAYSTACK_SECRET_KEY
   ```

   Enter the Paystack **test** `sk_test_...` secret at the terminal prompt. For launch, repeat with the **live** `sk_live_...` key after merchant activation. **Never put the secret in `public/js` or an HTML file.** The server communicates with Paystack through `/transaction/initialize` and `/transaction/verify/:reference`. Amounts are calculated on the server from product prices and converted from NGN to kobo.

6. **Deploy**:

   ```bash
   firebase deploy --only firestore,functions,hosting
   ```

7. **Configure the Paystack webhook** in the Paystack dashboard to deliver successful transaction events to:

   ```text
   https://YOUR_PROJECT_ID.web.app/api/paystack/webhook
   ```

   The server validates `x-paystack-signature` with HMAC-SHA512 and independently calls Paystack's verification API before marking orders paid. If you use a custom domain, use that domain's webhook URL.

8. **Create and authorize an admin account**. In Firebase Console → Authentication → Users, create the staff user (email/password). From a **trusted local computer** with Firebase Admin application credentials, run:

   ```bash
   cd functions
   # Make credentials available to Firebase Admin SDK without copying them into the project
   export GOOGLE_APPLICATION_CREDENTIALS=/secure/path/firebase-admin-service-account.json
   npm run grant-admin -- admin@your-business-domain.example
   cd ..
   ```

   On Windows PowerShell, use `$env:GOOGLE_APPLICATION_CREDENTIALS="C:\\secure\\service-account.json"` instead of `export`. Replace the example email with the actual created user. The script sets a server-verifiable `admin: true` custom claim. Sign in at `/admin-login.html`. **An unprivileged Firebase user cannot access the admin API.** Treat administrator service-account credentials as highly sensitive and never upload them with the website.

9. **Test the complete flow with Paystack test mode**: create a customer order, follow the hosted checkout, return to `payment-result.html`, verify payment status and check that the order is marked paid on the dashboard. Use the new **CHECK PAYMENT AGAIN** button to verify delayed transactions; failed transactions should leave the bag untouched. Test a failed/unpaid transaction and confirm it **does not** appear as revenue and preserves the shopping bag. Only then switch to live credentials and perform a controlled live transaction.

## APIs

| Endpoint | Use |
|---|---|
| `GET /api/products` | Published catalog |
| `POST /api/checkout` | Recalculate items + delivery server-side; initialize Paystack |
| `GET /api/order-status?reference=…` | Verify Paystack transaction (no private customer fields returned) |
| `POST /api/paystack/webhook` | Signature-checked Paystack payment event |
| `GET/POST /api/reviews` | Approved reviews / moderation queue |
| `POST /api/contact` | Store customer enquiry |
| `GET /api/admin/me` | Verify logged-in privileged staff |
| `GET /api/admin/dashboard` | Orders, customers, catalog, messages, reviews |
| `POST/DELETE /api/admin/products…` | Edit, create and remove catalog items |
| `PATCH /api/admin/orders/…` | Update fulfillment only (not payment status) |
| `PATCH /api/admin/messages/…` | Resolve enquiry |
| `PATCH /api/admin/reviews/…` | Approve/reject feedback |

Admin API requests require a Firebase ID token with the **custom `admin` claim**. All customer-sensitive data is accessible via server APIs only; direct Firestore browser reads/writes are denied.

## Working without Firebase yet

You can inspect the static design locally:

```bash
python -m http.server 8088 --directory public
```

Open `http://localhost:8088`. The homepage/catalog/cart interface uses its bundled product list when the API is unavailable. **Payment submission, live products, reviews, messages and admin features require a deployed Firebase API and will intentionally refuse to pretend they succeeded.**

## Launch checklist

- [ ] Firebase app config, billing, Firestore, Auth and Cloud Functions configured and deployed.
- [ ] `SITE_URL` matches the production domain; payment webhook configured.
- [ ] Paystack merchant fully activated, test payment verified, and production secret installed via Secret Manager.
- [ ] Admin email/password created and `admin: true` claim assigned.
- [ ] Product descriptions, actual stock, sizes, colors and prices verified by owner.
- [ ] Shipping coverage, timelines, returns/refunds, privacy, contact method and real business/legal details finalized.
- [ ] Add abuse controls (rate limiting/App Check and/or CAPTCHA) for public contact and review forms if traffic increases; monitor logs.
- [ ] Configure transactional email notifications separately if needed; this version does **not** claim emails were sent.
- [ ] Verify payment methods available on the hosted Paystack checkout for your merchant account and market.
- [ ] Test mobile browsers, keyboard accessibility, slow connections, refunds and unexpected payment delays before taking live orders.

### Notes

Default catalog entries live in both `functions/seed-products.json` (server-authoritative prices) and `public/js/products.js` (offline visual fallback). Admin changes are stored in Firestore and override initial server entries; deleted products are hidden via a stored tombstone. The client-side cart stores **IDs and quantities only**; the server always calculates the price. The existing CSS artwork is intentionally not a product photograph.

**No live merchant keys, real admin credentials, personal customer data or Firebase project identifiers are included in this deliverable.**

## Static pre-deployment checks

The included Node.js smoke-check requires no npm packages. From the PENI_Website directory run:

```bash
node scripts/smoke-check.js
node scripts/test-payment-result.js
```

These validate essential page assets, the PENI rebrand, catalog category consistency, the presence of payment and admin security checks, and that the browser only clears the bag after a verified paid status. It **does not** validate live Paystack transactions, Firebase deployment, or account permissions.
