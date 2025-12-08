# Plan: Integrate Razorpay Payment Gateway for Admin & Student

**TL;DR:** Add Razorpay integration to handle two payment flows: (1) Admin hostel setup fee via existing modal, and (2) Student monthly rent payment via new UI. Store all payment data in database with order tracking and webhook verification.

## Steps

### 1. Setup Backend Razorpay Integration
- Install Razorpay SDK, add env variables to `.env`, create payment service with `createOrder()` and `verifyPayment()` functions in `server/services/`.

### 2. Add Payment Order Tracking
- Update Prisma schema to add `razorpayOrderId` field to `Payment` table for tracking Razorpay orders.

### 3. Create Admin Hostel Payment API
- Build endpoint `POST /api/admin/hostel/payments/initiate-razorpay` to create Razorpay order, returning `orderId` and `amount` to frontend.

### 4. Update Admin Hostel Modal
- Modify `RoomAssignmentModal.tsx` payment step to call Razorpay checkout instead of mock delay, verify payment before building creation.

### 5. Build Student Payment Page
- Create new student dashboard component with (a) outstanding dues table, (b) payment submission form triggering Razorpay, (c) payment history view.

### 6. Create Student Payment APIs
- Build three endpoints: `GET /api/student/payments/dues`, `POST /api/student/payments/initiate`, `POST /api/student/payments/verify`.

### 7. Implement Webhook Handler
- Create `POST /api/webhooks/razorpay` to verify payments via Razorpay signatures and update payment status in database.

### 8. Add Payment Verification Logic
- Secure verification using Razorpay signature validation in payment service.

## Further Considerations

### 1. Environment Setup
- Need to add `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, and `VITE_RAZORPAY_KEY` to `.env` and client environment variables.

### 2. Client-side Library Choice
- Use Razorpay's official React component (`@razorpay/checkout-js`) or custom checkout form? 
- **Recommendation:** Official component for simplicity.

### 3. Error Scenarios
- How to handle failed payments? Retry mechanism, refund requests, or manual admin override? 
- **Recommendation:** Store as FAILED status, allow retry, manual refund option for admins.

### 4. Invoice/Receipts
- Generate PDF invoices after successful payment or email receipts? 
- **Recommendation:** Email auto-receipt initially, add PDF generation later.

### 5. Recurring Payments
- For monthly rent, implement Razorpay subscriptions for auto-debit or handle manual monthly submissions? 
- **Recommendation:** Manual submission first, subscriptions as future enhancement.

## Technical Context

### Current State Summary
- ✅ Database schema ready (Payment, PaymentDue, FeeStructure tables)
- ✅ Admin payment recording UI (modal-based)
- ✅ Razorpay test keys available (`rzp_test_RcwnKxaFyVx6wS`)
- ❌ Razorpay SDK not integrated
- ❌ Student payment UI doesn't exist
- ❌ Webhook handler not implemented

### Key Files to Modify
- **Backend:**
  - `server/prisma/schema.prisma` - Add razorpayOrderId field
  - `server/services/payment.service.ts` - Add Razorpay order/verification logic
  - `server/controllers/Admin/payment.controller.ts` - Add initiate-razorpay endpoint
  - `server/routes/Admin/payment.route.ts` - Register new endpoint
  - Create `server/routes/webhooks.route.ts` - Webhook handler

- **Frontend:**
  - `client/src/Components/AddStudent/RoomAssignmentModal.tsx` - Integrate Razorpay checkout
  - Create `client/src/pages/student/StudentPayments.tsx` - New payment page
  - `client/src/lib/payment.api.ts` - New payment API module
  - Create `client/src/Components/StudentPayments/` - Reusable payment components

### Architecture Pattern
- Uses multi-tenant SaaS model (tenantId on all records)
- Middleware-based auth (authenticateToken, requireRole, verifyTenant)
- Service layer pattern (services separate from controllers)
- Prisma ORM for database operations
- React + Vite for frontend, Express.js for backend
- Tailwind CSS + Framer Motion for UI

### Environment Variables Needed
```
# Server .env (add)
RAZORPAY_KEY_ID=rzp_test_RcwnKxaFyVx6wS
RAZORPAY_KEY_SECRET=ErhPowWTGkPqObvWlqm4HfHC

# Client .env (add/create)
VITE_RAZORPAY_KEY=rzp_test_RcwnKxaFyVx6wS
VITE_API_BASE_URL=http://localhost:5000
```

### Dependencies to Install
```bash
# Server
npm install razorpay

# Client
npm install @razorpay/checkout-js
```

### Payment Flows

#### Admin Hostel Setup Payment
```
1. Admin opens hostel creation modal
2. Fills building details (Step 1)
3. Proceeds to payment (Step 2)
4. Frontend calls POST /api/admin/hostel/payments/initiate-razorpay
5. Backend creates Razorpay order, returns orderId
6. Frontend opens Razorpay checkout with orderId
7. After payment, Razorpay callback with payment_id
8. Frontend calls verification endpoint
9. Backend verifies signature, updates Payment record, creates building
10. Modal shows success (Step 3)
```

#### Student Monthly Rent Payment
```
1. Student views dashboard showing outstanding dues
2. Clicks "Pay Now" on a due
3. Opens payment modal/page
4. Frontend calls POST /api/student/payments/initiate with amount, monthYear
5. Backend creates Razorpay order, returns orderId
6. Frontend opens Razorpay checkout
7. After payment, frontend calls POST /api/student/payments/verify
8. Backend verifies, updates PaymentDue and Payment records
9. Success notification and receipt
10. Payment reflected in history and dashboard
```

### Database Schema Changes Needed
```prisma
// In Payment model, add this field:
razorpayOrderId    String?
razorpayPaymentId  String?
razorpaySignature  String?

// Add unique constraint for transaction tracking:
@@unique([tenantId, razorpayOrderId])
```

### Success Criteria
- [ ] Razorpay SDK installed and configured
- [ ] Admin can create hostel with Razorpay payment
- [ ] Payment records stored in database with order IDs
- [ ] Student payment page created and accessible
- [ ] Student can submit payment for outstanding dues
- [ ] Payment verification via webhook working
- [ ] Payment data visible in admin payment report
- [ ] Email receipts sent after payment
- [ ] Error handling for failed/cancelled payments
- [ ] All transactions logged and traceable

### Testing Checklist
- Test admin hostel creation with Razorpay (use test mode)
- Test student payment submission
- Test payment failure scenario
- Test webhook signature verification
- Verify payment records in database
- Verify payment history displays correctly
- Test refund workflow (admin manual refund)
- Test edge cases (network errors, cancelled payments)
