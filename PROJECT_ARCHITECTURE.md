# DEVA & CO – PROJECT ARCHITECTURE & DEVELOPMENT GUIDE

**Project Name:** DEVA & CO – Tomato Wholesale Billing & Tally Management System  
**Business Domain:** Dindigul Tomato & Vegetable Commission Mandi (தேவா & கோ – தக்காளி & காய்கறி கமிஷன் மண்டி)  
**Deployment Platform:** Vercel (Production) & Local Node.js / MongoDB  
**Single Source of Truth:** Settings & Administration (`Settings` Model in MongoDB)  
**Standard Print Format:** A5 Portrait (`148 mm × 210 mm`)

---

## 1. HIGH-LEVEL ARCHITECTURE OVERVIEW

```
┌────────────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React 19 + Vite)                      │
│                                                                        │
│  Contexts:                                                             │
│   ├── AuthContext (User, Token, Admin role)                            │
│   └── SettingsContext (Store Name, Phones, Address, Commission, Footer)│
│                                                                        │
│  Key Pages:                                                            │
│   ├── Dashboard (Daily Intake, Sales, Collections, Pending Due)        │
│   ├── Buyers & BuyerDetail (Ledgers, Sales, Receipts, Tally Balances)  │
│   ├── Suppliers & SupplierDetail (Farmer Purchases, Accounts, Lots)    │
│   ├── Outlay (Expenses & Mandi Overheads)                              │
│   ├── History (Complete Transaction & Purchase Log)                    │
│   └── Settings (Business Profile, Security, User Accounts)             │
│                                                                        │
│  Printing & Export:                                                    │
│   ├── SupplierBillPad (Pure A5 Traditional Bill Template)             │
│   ├── SupplierPrintModal (Preview, Browser Print, 1-Click PNG Download)│
│   ├── BuyerPrintModal (Buyer Bill Preview & 1-Click PNG Download)      │
│   └── billImageDownload.js (html-to-image 3x Scaling Engine)           │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTP / REST (/api)
┌───────────────────────────────────▼────────────────────────────────────┐
│                        BACKEND (Express + Mongoose)                    │
│                                                                        │
│  Middleware:                                                           │
│   ├── auth.js (JWT protect & ADMIN / STAFF authorization)              │
│   ├── error.js (Standardized error response handler)                   │
│   └── db.js (Serverless MongoDB connection caching pool)               │
│                                                                        │
│  Controllers & Routes:                                                 │
│   ├── /api/auth          → authController                              │
│   ├── /api/dashboard     → dashboardController                         │
│   ├── /api/buyers        → buyerController                             │
│   ├── /api/suppliers     → supplierController                          │
│   ├── /api/transactions  → transactionController (BUYER Sales & Pays)  │
│   ├── /api/supplier-bills→ supplierBillController (SUPPLIER Purchases) │
│   ├── /api/expenses      → expenseController                           │
│   ├── /api/reports       → reportController                            │
│   └── /api/settings      → settingsController                          │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
┌───────────────────────────────────▼────────────────────────────────────┐
│                            DATABASE (MongoDB)                          │
│                                                                        │
│  Collections:                                                          │
│   ├── buyers         (Buyer accounts, current balance, code B001...)   │
│   ├── suppliers      (Farmer accounts, current balance, code S001...)  │
│   ├── transactions   (Buyer Sales & Payments ONLY - Type: SALE/PAYMENT)│
│   ├── supplierbills  (Farmer Purchase Lots ONLY - Items & Deductions)  │
│   ├── expenses       (Operational Mandi Outlay)                        │
│   ├── settings       (Business profile & bill defaults)                │
│   ├── users          (Admin & Accountant accounts)                     │
│   └── counters       (Atomic sequence generators for bills & codes)    │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. STRICT SEPARATION OF CONCERNS: BUYER VS. SUPPLIER

A common cause of confusion in this codebase is mixing Buyer logic with Supplier logic. They are strictly separate workflows and collections:

| Feature / Domain | Buyer Workflow (வாடிக்கையாளர்) | Supplier / Farmer Workflow (விவசாயி) |
| :--- | :--- | :--- |
| **Primary Model** | `models/Buyer.js` | `models/Supplier.js` |
| **Transaction Model** | `models/Transaction.js` (`type: SALE / PAYMENT`) | `models/SupplierBill.js` (Purchase Lots) |
| **Account Code** | `B001`, `B002`... (`buyerCode`) | `S001`, `S002`... (`supplierCode`) |
| **Billing Modal** | `components/BuyerBillingModal.jsx` | `components/SupplierBillingModal.jsx` |
| **Print Modal** | `components/BuyerPrintModal.jsx` | `components/SupplierPrintModal.jsx` |
| **Paper Standard** | A5 Portrait (`148 mm × 210 mm`) | A5 Portrait (`148 mm × 210 mm`) |
| **Key Calculations** | Big Equivalent, Rate, Old Bal, Due, Paid, New Bal | Gross Total, Commission, Gate, Coolie, Rent, Prev Bal, Total, Paid, Rem Bal |
| **Backend Route** | `/api/transactions` | `/api/supplier-bills` |

> **Critical Rule:** Never query `Transaction` to find farmer purchase bills, and never query `SupplierBill` to find buyer sales. They are stored in separate collections.

---

## 3. CORE PRINTING & EXPORT ARCHITECTURE

Both Buyer and Supplier bills strictly adhere to **A5 Portrait (`148 mm × 210 mm`)**:

### A. Supplier Bill Pad Design
- Defined in `SupplierPrintModal.jsx` (and modularized into `SupplierBillPad.jsx`).
- Features:
  1. Outer rounded green border (`border-[2.5px] border-[#0a4d2e] rounded-2xl`).
  2. Prominent open header (no inner card box) with top-left DEVA logo in rounded box.
  3. Dark green title `தேவா & கோ` with pipe separator and telephone numbers.
  4. Red business serial number (`எண் : ...`).
  5. Full-width red address (`54 A, அண்ணல் காந்தி மார்க்கெட், திண்டுக்கல் - 624 001`).
  6. Flowing green wave ribbon SVG (`#bbf7d0`) spanning the bill.
  7. Centered proprietor pill (`Prop:` in black, `R.தேவதாஸ்` in bold red).
  8. `திரு : ` and `தேதி : ` with printed solid underlines.
  9. 4-column purchase items table (`விலை` 14%, `விவரம்` 48%, `எண்ணம்` 14%, `மொத்தம்` 24% split into `ரூ.` and `பை.`).
  10. Open vertical bill-pad writing area (~85 mm) with continuous column lines.
  11. Seamlessly attached financial summary:
      - Row 1: `மொத்தத் தொகை (Gross Total) : ` (soft lime-green `#daf0e3`).
      - Row 2: `கமிஷன் : ` (left) | `கேட் :       :` (right).
      - Row 3: `கூலி : ` (left) | `வாடகை : ` (right).
      - Row 4: `பற்று (முன் பாக்கி) : ` (full width).
      - Row 5: `மொத்தம் : ` (centered, bold, `#daf0e3`).
      - Row 6: Exact 50/50 split (`கொடுத்தது : ` | `மீதி பாக்கி : ` in bold red).
  12. Centered footer: `_________ நன்றி மீண்டும் வருக _________`.

### B. One-Click High-Res PNG Download
- Powered by `frontend/src/utils/billImageDownload.js`.
- Uses `html-to-image` at `pixelRatio: 3` (300 DPI equivalent).
- Isolates the bill in an off-screen container matching exact dimensions (`559.37px × 793.70px`).
- Triggers instant browser download without preview popups or print dialogs.

---

## 4. DATABASE & QUERY EFFICIENCY RULES

1. **Connection Pooling**: `backend/src/config/db.js` caches the Mongoose connection globally for serverless reuse on Vercel.
2. **Lean Queries**: Always append `.lean()` to Mongoose read queries that do not require document save methods.
3. **Compound Indexes**:
   - `SupplierBill`: `{ supplierId: 1, isVoid: 1, transactionDate: -1 }`, `{ transactionDate: 1, isVoid: 1 }`
   - `Transaction`: `{ buyerId: 1, isVoid: 1, transactionDate: -1 }`, `{ transactionDate: 1, isVoid: 1 }`, `{ type: 1, transactionDate: 1, isVoid: 1 }`
4. **Concurrent Queries (`Promise.all`)**: Never await independent database queries sequentially in controllers. Execute in parallel.

---

## 5. DEVELOPMENT SPEED & PROTOCOL RULES

When handling tasks on DEVA & CO:

1. **Understand the Target Module**: Identify if the request touches Buyers, Suppliers, Expenses, Reports, Settings, or Printing.
2. **Inspect Relevant Files Only**:
   - Supplier Bill changes → `frontend/src/components/SupplierPrintModal.jsx` and `models/SupplierBill.js`.
   - Buyer Bill changes → `frontend/src/components/BuyerPrintModal.jsx` and `models/Transaction.js`.
   - Business Profile → `models/Settings.js` and `SettingsContext.jsx`.
   - Do NOT scan `node_modules` or recursively grep the entire project.
3. **Identify Root Cause**: Check if the issue is data, styling, caching, or an API response.
4. **Make Small, Focused Changes**: Change only the specific lines or component needed.
5. **Targeted Verification**:
   - For backend changes: run targeted node scripts against specific controller endpoints.
   - For frontend changes: verify build (`npm --prefix frontend run build`).
6. **Purge Cache Before Reviewing**: When Vite bundles are updated, purge old assets in `backend/public/assets` and verify the script tag in `index.html`.
7. **Report Changes & Results**: Clearly state modified files, verification steps, and visual proofs.
