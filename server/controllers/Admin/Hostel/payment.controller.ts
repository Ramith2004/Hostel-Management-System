import type { Request, Response } from 'express';
import { PrismaClient, PaymentMode } from '@prisma/client';
// ✅ FIXED: Import Decimal from Prisma runtime
import { Decimal } from '@prisma/client/runtime/library';
import { 
  createRazorpayOrder, 
  verifyRazorpayPayment,
  verifyRazorpayPaymentComprehensive,
  fetchRazorpayPayment 
} from '../../../services/razorpay.service.js';

const prisma = new PrismaClient();



// EXISTING: Record payment (manual payment recording)
export const recordPayment = async (req: Request, res: Response) => {
  try {
    const { studentId, amount, paymentMode, monthYear, remarks } = req.body;
    const tenantId = req.headers['x-tenant-id'] as string;

    if (!studentId || !amount || !paymentMode || !monthYear) {
      return res.status(400).json({
        success: false,
        message: 'studentId, amount, paymentMode, and monthYear are required',
      });
    }

    // ✅ FIXED: Use new Decimal() instead of parseFloat
    const payment = await prisma.payment.create({
      data: {
        tenantId,
        studentId,
        amount: new Decimal(amount),
        paymentMode,
        monthYear,
        status: 'PAID',
        remarks: remarks || '',
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Payment recorded successfully',
      data: payment,
    });
  } catch (error: any) {
    console.error('Error recording payment:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to record payment',
    });
  }
};

// EXISTING: Get payment history
export const getPaymentHistory = async (req: Request, res: Response) => {
  try {
    const { studentId } = req.query;
    const tenantId = req.headers['x-tenant-id'] as string;

    const where: any = { tenantId };
    if (studentId) {
      where.studentId = studentId;
    }

    const paymentHistory = await prisma.payment.findMany({
      where,
      orderBy: { paymentDate: 'desc' },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Payment history fetched successfully',
      data: paymentHistory,
    });
  } catch (error: any) {
    console.error('Error fetching payment history:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch payment history',
    });
  }
};

// EXISTING: Generate payment dues for students
export const generatePaymentDues = async (req: Request, res: Response) => {
  try {
    const { studentIds, amount, monthYear, dueDate } = req.body;
    const tenantId = req.headers['x-tenant-id'] as string;

    if (!studentIds || !Array.isArray(studentIds) || !amount || !monthYear || !dueDate) {
      return res.status(400).json({
        success: false,
        message: 'studentIds (array), amount, monthYear, and dueDate are required',
      });
    }

    // ✅ FIXED: Use new Decimal() for dueAmount
    const dues = await Promise.all(
      studentIds.map(studentId =>
        prisma.paymentDue.create({
          data: {
            tenantId,
            studentId,
            dueAmount: new Decimal(amount),
            monthYear,
            dueDate: new Date(dueDate),
            status: 'PENDING',
          },
        })
      )
    );

    return res.status(201).json({
      success: true,
      message: `Payment dues generated for ${dues.length} students`,
      data: dues,
    });
  } catch (error: any) {
    console.error('Error generating payment dues:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate payment dues',
    });
  }
};

// NEW: Initiate Razorpay Order for Hostel Payment
export const initiateRazorpayHostelPayment = async (req: Request, res: Response) => {
  try {
    const { amount, buildingName, buildingCode, monthYear, remarks, studentId } = req.body;
    const tenantId = req.headers['x-tenant-id'] as string;
    const userId = (req as any).userId;

    // Validation
    if (!amount || !buildingName || !buildingCode) {
      return res.status(400).json({
        success: false,
        message: 'Amount, buildingName, and buildingCode are required',
      });
    }

    if (amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Amount must be greater than 0',
      });
    }

    if (!tenantId) {
      return res.status(400).json({
        success: false,
        message: 'Tenant ID is missing',
      });
    }

    // ✅ Validate studentId if provided
    let validatedStudentId: string | null = null;
    
    if (studentId && studentId !== 'admin-setup') {
      // Check if student exists
      const student = await prisma.user.findUnique({
        where: { id: studentId },
      });

      if (!student) {
        return res.status(400).json({
          success: false,
          message: 'Student not found',
        });
      }

      validatedStudentId = studentId;
    }
    // If studentId is 'admin-setup' or null, leave it as null

    // Create Razorpay order
    const receipt = `HOSTEL-${buildingCode}-${Date.now()}`;
    const order = await createRazorpayOrder(amount, receipt, {
      buildingName,
      buildingCode,
      tenantId,
      type: 'HOSTEL_SETUP',
    });

    // ✅ Store order in database with optional studentId
    const payment = await prisma.payment.create({
      data: {
        tenantId,
        studentId: validatedStudentId, // ✅ Can be null for admin setup
        amount: new Decimal(amount),
        paymentMode: PaymentMode.ONLINE,
        monthYear: monthYear || new Date().toISOString().substring(0, 7),
        status: 'PENDING',
        razorpayOrderId: order.id,
        remarks: remarks || `Hostel setup fee for ${buildingName}`,
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Razorpay order created successfully',
      data: {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        paymentId: payment.id,
      },
    });
  } catch (error: any) {
    console.error('Error initiating Razorpay payment:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to initiate payment',
    });
  }
};

// NEW: Verify Razorpay Payment for Hostel with comprehensive checks
export const verifyRazorpayHostelPayment = async (req: Request, res: Response) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, amount } = req.body;
    const tenantId = req.headers['x-tenant-id'] as string;

    // Validation
    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return res.status(400).json({
        success: false,
        message: 'Payment verification details are required',
      });
    }

    // Step 1: Find existing payment record
    const existingPayment = await prisma.payment.findUnique({
      where: { 
        tenantId_razorpayOrderId: { 
          tenantId, 
          razorpayOrderId 
        } 
      },
    });

    if (!existingPayment) {
      return res.status(404).json({
        success: false,
        message: 'Payment record not found',
      });
    }

    // Step 2: Comprehensive verification (Signature + API fetch)
    const verificationResult = await verifyRazorpayPaymentComprehensive({
      razorpay_order_id: razorpayOrderId,
      razorpay_payment_id: razorpayPaymentId,
      razorpay_signature: razorpaySignature,
      amount: amount || existingPayment.amount.toNumber?.() || Number(existingPayment.amount),
    });

    if (!verificationResult.valid) {
      // Payment verification failed, update status to FAILED
      await prisma.payment.update({
        where: { id: existingPayment.id },
        data: {
          status: 'FAILED',
          remarks: `Verification failed: ${verificationResult.error}`,
        },
      });

      return res.status(400).json({
        success: false,
        message: verificationResult.error || 'Payment verification failed',
      });
    }

    // Step 3: Update payment record with success
    const payment = await prisma.payment.update({
      where: { id: existingPayment.id },
      data: {
        status: 'PAID',
        razorpayPaymentId: razorpayPaymentId,
        razorpaySignature: razorpaySignature,
        transactionId: razorpayPaymentId,
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Payment verified successfully',
      data: {
        paymentId: payment.id,
        status: payment.status,
        razorpayPaymentId: payment.razorpayPaymentId,
        verificationDetails: {
          signatureValid: true,
          paymentStatus: verificationResult.paymentDetails?.status,
          amount: verificationResult.paymentDetails?.amount !== undefined 
            ? Number(verificationResult.paymentDetails.amount) / 100 
            : undefined,
        },
      },
    });
  } catch (error: any) {
    console.error('Error verifying payment:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to verify payment',
    });
  }
};

// NEW: Check payment status (for polling or manual checks)
export const checkPaymentStatus = async (req: Request, res: Response) => {
  try {
    const { paymentId } = req.params;
    const tenantId = req.headers['x-tenant-id'] as string;

    if (!paymentId) {
      return res.status(400).json({
        success: false,
        message: 'Payment ID is required',
      });
    }

    // Find payment in database
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
    });

    if (!payment || payment.tenantId !== tenantId) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found',
      });
    }

    // If payment is already verified, return status
    if (payment.status === 'PAID') {
      return res.status(200).json({
        success: true,
        data: {
          paymentId: payment.id,
          status: payment.status,
          amount: payment.amount.toNumber?.() || Number(payment.amount),
        },
      });
    }

    // If payment is pending and has Razorpay payment ID, fetch latest status from Razorpay
    if (payment.status === 'PENDING' && payment.razorpayPaymentId) {
      try {
        const razorpayPayment = await fetchRazorpayPayment(payment.razorpayPaymentId);
        
        // If Razorpay shows payment is captured, update our database
        if (razorpayPayment.status === 'captured') {
          await prisma.payment.update({
            where: { id: paymentId },
            data: { status: 'PAID' },
          });

          return res.status(200).json({
            success: true,
            data: {
              paymentId: payment.id,
              status: 'PAID',
              amount: payment.amount.toNumber?.() || Number(payment.amount),
            },
          });
        }
      } catch (err) {
        console.error('Error fetching from Razorpay:', err);
      }
    }

    return res.status(200).json({
      success: true,
      data: {
        paymentId: payment.id,
        status: payment.status,
        amount: payment.amount.toNumber?.() || Number(payment.amount),
      },
    });
  } catch (error: any) {
    console.error('Error checking payment status:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to check payment status',
    });
  }
};