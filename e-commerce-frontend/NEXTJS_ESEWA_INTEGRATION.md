# Next.js eSewa Payment Integration - Complete Guide

This document outlines the complete Next.js implementation for eSewa payment integration, following the secure API route pattern.

## 🚀 **Architecture Overview**

### **Security Model:**
- ✅ **Server-side payment logic** - Sensitive operations stay on server
- ✅ **API Routes** - Handle payment initiation securely
- ✅ **Cookie-based authentication** - User verification on each request
- ✅ **Backend integration** - Calls your Go backend for payment processing

## 📁 **File Structure**

```
src/
├── app/
│   ├── api/
│   │   ├── initiate-esewa-payment/
│   │   │   └── route.ts          # Payment initiation API
│   │   └── check-payment-status/
│   │       └── route.ts          # Status check API
│   └── (site)/products/checkout/
│       └── payment/
│           ├── success/
│           │   └── page.tsx      # Success page
│           └── failed/
│               └── page.tsx      # Failure page
├── lib/
│   └── actions/payment/post/
│       └── initiate-payment.ts   # Frontend payment actions
└── components/elements/products/
    ├── CartCheckOutPage.tsx      # Checkout component
    └── PaymentStatus.tsx         # Status display component
```

## 🔧 **Key Components**

### **1. Payment Initiation API Route (`/api/initiate-esewa-payment`)**
```typescript
// Secure server-side payment initiation
export async function POST(request: NextRequest) {
  // 1. Verify user authentication
  // 2. Validate request data
  // 3. Call backend payment service
  // 4. Return payment URL for redirect
}
```

**Features:**
- ✅ User authentication verification
- ✅ Request validation
- ✅ Secure backend communication
- ✅ Error handling

### **2. Payment Status Check API Route (`/api/check-payment-status`)**
```typescript
// Check payment status securely
export async function GET(request: NextRequest) {
  // 1. Verify user authentication
  // 2. Get query parameters
  // 3. Call backend status service
  // 4. Return status data
}
```

**Features:**
- ✅ Secure status checking
- ✅ Parameter validation
- ✅ Backend integration
- ✅ Error handling

### **3. Frontend Payment Actions**
```typescript
// Client-side payment handling
export const intiatePaymentAction = async (productIds: string[]) => {
  // Call Next.js API route instead of backend directly
  const response = await fetch('/api/initiate-esewa-payment', {
    method: 'POST',
    body: JSON.stringify({ productIds })
  });
}
```

**Features:**
- ✅ Clean API abstraction
- ✅ Error handling
- ✅ Type safety
- ✅ User feedback

## 🔄 **Payment Flow**

### **1. User Initiates Payment**
```
User clicks "Buy Now" 
    ↓
Frontend calls intiatePaymentAction()
    ↓
Calls /api/initiate-esewa-payment
    ↓
API route verifies user and calls backend
    ↓
Backend generates eSewa signature and returns URL
    ↓
Frontend receives payment URL and redirects
```

### **2. eSewa Payment Processing**
```
User redirected to eSewa
    ↓
User completes payment
    ↓
eSewa redirects to success/failure page
    ↓
Frontend shows payment result
    ↓
Optional: Check payment status
```

## 🛡️ **Security Features**

### **Authentication:**
- ✅ Cookie-based user tokens
- ✅ Server-side user verification
- ✅ Protected API routes

### **Data Protection:**
- ✅ Sensitive operations on server
- ✅ No secret keys exposed to client
- ✅ Input validation and sanitization

### **Error Handling:**
- ✅ Comprehensive error messages
- ✅ User-friendly error display
- ✅ Secure error logging

## 📋 **Environment Variables**

### **Frontend (.env.local):**
```bash
# Backend URL
NEXT_PUBLIC_BACKEND_URL=http://localhost:8080

# eSewa Configuration (Backend)
ESEWA_MERCHANT_CODE=EPAYTEST
ESEWA_SECRET_KEY=8gBm/:&EnhH.1/q(
ESEWA_PAYMENT_URL=https://rc-epay.esewa.com.np/api/epay/main/v2/form
ESEWA_PAYMENT_STATUS_CHECK_URL=https://rc.esewa.com.np/api/epay/transaction/status/
```

## 🧪 **Testing**

### **Test Credentials:**
- **eSewa ID:** `9806800001/2/3/4/5`
- **Password:** `Nepal@123`
- **MPIN:** `1122`
- **Token:** `123456`

### **Test Flow:**
1. Add products to cart
2. Proceed to checkout
3. Click "Buy Now"
4. Complete eSewa payment
5. Verify redirect to success page
6. Check payment status

## 🔍 **Debugging**

### **Backend Logs:**
The Go backend now includes comprehensive debugging:
- Payment data logging
- Signature generation details
- Form data verification
- Response handling

### **Frontend Logs:**
- API call responses
- Error details
- Payment flow tracking

## 🚨 **Common Issues & Solutions**

### **1. "Invalid payload signature" Error:**
- ✅ **Fixed**: Updated signature generation format
- ✅ **Fixed**: Added eSewa-compliant transaction UUIDs
- ✅ **Fixed**: Proper parameter ordering

### **2. Authentication Issues:**
- ✅ **Fixed**: Proper cookie handling
- ✅ **Fixed**: User verification on each request
- ✅ **Fixed**: Secure token validation

### **3. Redirect Issues:**
- ✅ **Fixed**: Proper success/failure URL handling
- ✅ **Fixed**: eSewa response processing
- ✅ **Fixed**: Fallback URL generation

## 📚 **Key Benefits of This Approach**

### **Security:**
- ✅ Sensitive operations on server
- ✅ No client-side secret keys
- ✅ Protected API endpoints

### **Maintainability:**
- ✅ Clean separation of concerns
- ✅ Reusable components
- ✅ Type-safe implementation

### **User Experience:**
- ✅ Smooth payment flow
- ✅ Clear error messages
- ✅ Loading states and feedback

### **Scalability:**
- ✅ API route architecture
- ✅ Backend service integration
- ✅ Easy to extend

## 🔗 **Integration Points**

### **Backend (Go):**
- Payment initiation service
- Signature generation
- Payment status checking
- Database operations

### **Frontend (Next.js):**
- User interface
- Payment flow management
- API route handling
- Error display

## 📖 **Additional Resources**

- [eSewa API Documentation](https://developer.esewa.com.np/)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)
- [Next.js App Router](https://nextjs.org/docs/app)

---

**Last Updated:** $(date)
**Version:** 2.0.0
**Status:** ✅ Complete & Secure
**Architecture:** Next.js API Routes + Go Backend
