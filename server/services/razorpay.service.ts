import Razorpay from 'razorpay';
import crypto from 'crypto';

// ✅ FIXED: Don't throw error at startup, check when needed
const key_id = process.env.RAZORPAY_KEY_ID;
const key_secret = process.env.RAZORPAY_KEY_SECRET;

let razorpayInstance: Razorpay | null = null;

// ✅ FIXED: Initialize only when needed
const getRazorpayInstance = () => {
  if (!razorpayInstance) {
    if (!key_id || !key_secret) {
      throw new Error('Razorpay key_id and key_secret must be defined in environment variables');
    }
    
    razorpayInstance = new Razorpay({
      key_id,
      key_secret,
    });
  }
  return razorpayInstance;
};

// ✅ FIXED: Create Razorpay order with better error handling
export const createRazorpayOrder = async (
  amount: number,
  receipt: string,
  notes: Record<string, any> = {}
) => {
  try {
    // Validate inputs
    if (!amount || amount <= 0) {
      throw new Error('Amount must be greater than 0');
    }

    if (!receipt) {
      throw new Error('Receipt is required');
    }

    console.log('📦 Creating Razorpay order:', {
      amount: Math.round(amount * 100),
      currency: 'INR',
      receipt,
      notes,
    });

    const razorpay = getRazorpayInstance();

    // Create order
    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100), // Amount in paise
      currency: 'INR',
      receipt: receipt,
      notes: notes,
    });

    console.log('✅ Razorpay order created successfully:', order.id);
    return order;
  } catch (error: any) {
    console.error('❌ Razorpay Error Details:', {
      message: error.message,
      code: error.code,
      statusCode: error.statusCode,
      response: error.response?.body,
      fullError: error,
    });
    
    throw new Error(
      `Failed to create Razorpay order: ${error.message || 'Unknown error'}`
    );
  }
};

// Verify payment signature
export const verifyRazorpayPayment = (paymentData: {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}) => {
  try {
    const body =
      paymentData.razorpay_order_id + '|' + paymentData.razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac('sha256', key_secret as string)
      .update(body)
      .digest('hex');

    return expectedSignature === paymentData.razorpay_signature;
  } catch (error: any) {
    console.error('❌ Error verifying payment signature:', error);
    throw error;
  }
};

// Fetch payment from Razorpay
export const fetchRazorpayPayment = async (paymentId: string) => {
  try {
    if (!paymentId) {
      throw new Error('Payment ID is required');
    }

    const razorpay = getRazorpayInstance();
    const payment = await razorpay.payments.fetch(paymentId);
    
    console.log('✅ Payment fetched from Razorpay:', {
      id: payment.id,
      status: payment.status,
      amount: payment.amount,
    });
    
    return payment;
  } catch (error: any) {
    console.error('❌ Error fetching payment from Razorpay:', {
      message: error.message,
      code: error.code,
      statusCode: error.statusCode,
    });
    throw error;
  }
};

// Comprehensive verification
export const verifyRazorpayPaymentComprehensive = async (paymentData: {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  amount: number;
}) => {
  try {
    // Step 1: Verify signature
    console.log('🔍 Step 1: Verifying payment signature...');
    const isSignatureValid = verifyRazorpayPayment({
      razorpay_order_id: paymentData.razorpay_order_id,
      razorpay_payment_id: paymentData.razorpay_payment_id,
      razorpay_signature: paymentData.razorpay_signature,
    });

    if (!isSignatureValid) {
      console.error('❌ Signature verification failed');
      return {
        valid: false,
        error: 'Invalid payment signature',
        paymentDetails: null,
      };
    }

    console.log('✅ Signature verified');

    // Step 2: Fetch payment details from Razorpay
    console.log('🔍 Step 2: Fetching payment details from Razorpay...');
    const paymentDetails = await fetchRazorpayPayment(
      paymentData.razorpay_payment_id
    );

    console.log('✅ Payment details fetched');

    // Step 3: Additional validations
    console.log('🔍 Step 3: Validating payment status and amount...');
    
    if (paymentDetails.status !== 'captured') {
      console.error(`❌ Payment not captured. Status: ${paymentDetails.status}`);
      return {
        valid: false,
        error: `Payment not captured. Status: ${paymentDetails.status}`,
        paymentDetails,
      };
    }

    if (
      paymentData.amount &&
      paymentDetails.amount !== Math.round(paymentData.amount * 100)
    ) {
      console.error('❌ Amount mismatch');
      return {
        valid: false,
        error: 'Amount mismatch',
        paymentDetails,
      };
    }

    console.log('✅ All verifications passed');

    return {
      valid: true,
      error: null,
      paymentDetails,
    };
  } catch (error: any) {
    console.error('❌ Comprehensive verification error:', error);
    return {
      valid: false,
      error: error.message || 'Verification failed',
      paymentDetails: null,
    };
  }
};