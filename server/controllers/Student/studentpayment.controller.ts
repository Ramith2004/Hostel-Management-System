import type { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import {
  verifyRazorpayPaymentComprehensive,
  fetchRazorpayPayment,
} from '../../services/razorpay.service.js';

const prisma = new PrismaClient();

// ✅ FIXED: Get student dues - Fetch from FeeStructure
export const getStudentDues = async (req: Request, res: Response) => {
  try {
    // ✅ Get from req.user (set by authenticateToken middleware)
    const studentId = req.user?.userId;
    const tenantId = req.user?.tenantId;

    console.log('📊 getStudentDues called:', { studentId, tenantId });

    if (!studentId || !tenantId) {
      return res.status(400).json({
        success: false,
        message: 'Student ID and Tenant ID are required',
      });
    }

    // ✅ FIXED: Get student's current room allocation
    const studentAllocation = await prisma.roomAllocation.findFirst({
      where: {
        studentId: studentId,
        tenantId: tenantId,
        status: 'ACTIVE',
      },
      include: {
        room: true,
      },
    });

    if (!studentAllocation) {
      return res.status(400).json({
        success: false,
        message: 'Student does not have an active room allocation',
      });
    }

    // ✅ FIXED: Get the fee structure for the student's room
    const feeStructure = await prisma.feeStructure.findFirst({
      where: {
        tenantId: tenantId,
        roomId: studentAllocation.room.id,
        effectiveTo: null, // Only active fee structures
      },
      orderBy: {
        effectiveFrom: 'desc',
      },
    });

    if (!feeStructure) {
      return res.status(400).json({
        success: false,
        message: 'No active fee structure found for the student\'s room',
      });
    }

    // ✅ Calculate the monthly fee from fee structure
    const monthlyFeeAmount = Number(feeStructure.totalMonthlyFee);
    console.log('💰 Monthly fee amount:', monthlyFeeAmount);

    // Get all payment dues for this student
    let dues = await prisma.paymentDue.findMany({
      where: {
        studentId: studentId,
        tenantId: tenantId,
      },
      orderBy: { monthYear: 'desc' },
    });

    // ✅ If no dues exist, generate them for current and next 3 months
    if (dues.length === 0) {
      console.log('📅 No dues found, generating new ones...');

      const currentDate = new Date();
      const monthsToGenerate = [];

      for (let i = 0; i < 4; i++) {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth() + i, 1);
        const monthYear = date.toISOString().slice(0, 7); // Format: YYYY-MM

        monthsToGenerate.push({
          tenantId,
          studentId,
          monthYear,
          dueAmount: new Decimal(monthlyFeeAmount), // ✅ Use actual fee from FeeStructure
          dueDate: new Date(date.getFullYear(), date.getMonth() + 1, 10),
          status: 'PENDING' as const,
        });
      }

      await prisma.paymentDue.createMany({
        data: monthsToGenerate,
      });

      console.log('✅ Created 4 months of dues with amount:', monthlyFeeAmount);

      dues = await prisma.paymentDue.findMany({
        where: { studentId, tenantId },
        orderBy: { monthYear: 'desc' },
      });
    } else {
      // ✅ Update existing dues if fee structure changed
      const allDues = await prisma.paymentDue.findMany({
        where: { studentId, tenantId },
      });

      const duesNeedingUpdate = allDues.filter(
        due => Number(due.dueAmount) !== monthlyFeeAmount && due.status !== 'PAID'
      );

      if (duesNeedingUpdate.length > 0) {
        console.log('📝 Updating dues with new fee amount:', monthlyFeeAmount);
        
        await prisma.paymentDue.updateMany({
          where: {
            id: {
              in: duesNeedingUpdate.map(d => d.id),
            },
          },
          data: {
            dueAmount: new Decimal(monthlyFeeAmount),
          }
        });

        dues = await prisma.paymentDue.findMany({
          where: { studentId, tenantId },
          orderBy: { monthYear: 'desc' },
        });
      }
    }

    console.log('📋 Returning dues:', dues.length);

    return res.status(200).json({
      success: true,
      message: 'Dues fetched successfully',
      data: dues.map(due => ({
        id: due.id,
        monthYear: due.monthYear,
        dueAmount: Number(due.dueAmount),
        dueDate: due.dueDate,
        status: due.status,
      })),
    });
  } catch (error: any) {
    console.error('❌ Error fetching dues:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch dues',
    });
  }
};

// ✅ FIXED: Get payment history
export const getPaymentHistory = async (req: Request, res: Response) => {
  try {
    const studentId = req.user?.userId;
    const tenantId = req.user?.tenantId;

    console.log('📊 getPaymentHistory called:', { studentId, tenantId });

    if (!studentId || !tenantId) {
      return res.status(400).json({
        success: false,
        message: 'Student ID and Tenant ID are required',
      });
    }

    // Get all paid payments for this student
    const payments = await prisma.payment.findMany({
      where: {
        studentId: studentId,
        tenantId: tenantId,
        status: 'PAID',
      },
      orderBy: { paymentDate: 'desc' },
      select: {
        id: true,
        amount: true,
        paymentDate: true,
        monthYear: true,
        transactionId: true,
        status: true,
      },
    });

    console.log('📋 Payment history:', payments.length);

    return res.status(200).json({
      success: true,
      message: 'Payment history fetched successfully',
      data: payments.map(payment => ({
        id: payment.id,
        amount: Number(payment.amount),
        paymentDate: payment.paymentDate,
        monthYear: payment.monthYear,
        transactionId: payment.transactionId,
        status: payment.status,
      })),
    });
  } catch (error: any) {
    console.error('❌ Error fetching payment history:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch payment history',
    });
  }
};

// ✅ FIXED: Initiate payment
export const initiateStudentPayment = async (req: Request, res: Response) => {
  try {
    const studentId = req.user?.userId;
    const tenantId = req.user?.tenantId;
    const { monthYear, amount } = req.body;

    console.log('💳 initiateStudentPayment called:', { studentId, tenantId, monthYear, amount });

    if (!studentId || !tenantId) {
      return res.status(400).json({
        success: false,
        message: 'Student ID and Tenant ID are required',
      });
    }

    if (!monthYear || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Month/Year and amount are required',
      });
    }

    // ✅ FIXED: Get student's room allocation and verify amount
    const studentAllocation = await prisma.roomAllocation.findFirst({
      where: {
        studentId: studentId,
        tenantId: tenantId,
        status: 'ACTIVE',
      },
      include: {
        room: true,
      },
    });

    if (!studentAllocation) {
      return res.status(400).json({
        success: false,
        message: 'Student does not have an active room allocation',
      });
    }

    // ✅ Get the fee structure for the student's room
    const feeStructure = await prisma.feeStructure.findFirst({
      where: {
        tenantId: tenantId,
        roomId: studentAllocation.room.id,
        effectiveTo: null,
      },
      orderBy: {
        effectiveFrom: 'desc',
      },
    });

    if (!feeStructure) {
      return res.status(400).json({
        success: false,
        message: 'No active fee structure found',
      });
    }

    const expectedAmount = Number(feeStructure.totalMonthlyFee);
    
    // ✅ Verify the amount matches the fee structure
    if (Math.abs(amount - expectedAmount) > 0.01) {
      console.warn(`⚠️ Amount mismatch. Expected: ${expectedAmount}, Got: ${amount}`);
      return res.status(400).json({
        success: false,
        message: `Invalid amount. Expected: ₹${expectedAmount}`,
      });
    }

    // Check if payment already PAID for this month
    const existingPayment = await prisma.payment.findFirst({
      where: {
        studentId,
        tenantId,
        monthYear,
        status: 'PAID',
      },
    });

    if (existingPayment) {
      return res.status(400).json({
        success: false,
        message: 'Payment already made for this month',
      });
    }

    // Check if PENDING payment exists (prevent duplicate)
    const recentPending = await prisma.payment.findFirst({
      where: {
        studentId,
        tenantId,
        monthYear,
        status: 'PENDING',
        createdAt: {
          gte: new Date(Date.now() - 5 * 60 * 1000), // Last 5 minutes
        },
      },
    });

    if (recentPending) {
      return res.status(400).json({
        success: false,
        message: 'Payment already initiated for this month',
      });
    }

    // Create Razorpay order
    const { createRazorpayOrder } = await import('../../services/razorpay.service.js');
    const receipt = `STU-${monthYear}-${studentId.substring(0, 8)}`;

    const order = await createRazorpayOrder(amount, receipt, {
      studentId,
      monthYear,
      type: 'STUDENT_PAYMENT',
      roomId: studentAllocation.room.id,
    });

    // Create pending payment record
    const payment = await prisma.payment.create({
      data: {
        tenantId,
        studentId,
        amount: new Decimal(amount),
        monthYear,
        paymentMode: 'ONLINE',
        status: 'PENDING',
        razorpayOrderId: order.id,
        remarks: `Payment for month ${monthYear} - Room ${studentAllocation.room.roomNumber}`,
      },
    });

    console.log('✅ Order created:', order.id);

    return res.status(201).json({
      success: true,
      message: 'Payment order created',
      data: {
        orderId: order.id,
        amount: amount,
        currency: 'INR',
        paymentId: payment.id,
      },
    });
  } catch (error: any) {
    console.error('❌ Error initiating payment:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to initiate payment',
    });
  }
};

// ✅ FIXED: Verify payment
export const verifyStudentPayment = async (req: Request, res: Response) => {
  try {
    const studentId = req.user?.userId;
    const tenantId = req.user?.tenantId;
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, amount } = req.body;

    console.log('✅ verifyStudentPayment called:', { studentId, tenantId });

    if (!studentId || !tenantId) {
      return res.status(400).json({
        success: false,
        message: 'Student ID and Tenant ID are required',
      });
    }

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return res.status(400).json({
        success: false,
        message: 'Payment verification details are required',
      });
    }

    // Find payment record
    const existingPayment = await prisma.payment.findUnique({
      where: {
        tenantId_razorpayOrderId: {
          tenantId,
          razorpayOrderId,
        },
      },
    });

    if (!existingPayment) {
      return res.status(404).json({
        success: false,
        message: 'Payment record not found',
      });
    }

    // Verify payment
    const verificationResult = await verifyRazorpayPaymentComprehensive({
      razorpay_order_id: razorpayOrderId,
      razorpay_payment_id: razorpayPaymentId,
      razorpay_signature: razorpaySignature,
      amount: amount || existingPayment.amount.toNumber?.() || Number(existingPayment.amount),
    });

    if (!verificationResult.valid) {
      console.error('❌ Verification failed:', verificationResult.error);

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

    // Update payment to PAID
    const updatedPayment = await prisma.payment.update({
      where: { id: existingPayment.id },
      data: {
        status: 'PAID',
        razorpayPaymentId: razorpayPaymentId,
        razorpaySignature: razorpaySignature,
        transactionId: razorpayPaymentId,
        paymentDate: new Date(),
      },
    });

    // Update due to PAID
    await prisma.paymentDue.updateMany({
      where: {
        studentId,
        tenantId,
        monthYear: existingPayment.monthYear,
      },
      data: {
        status: 'PAID',
        paidAmount: new Decimal(amount || Number(existingPayment.amount)),
      }
    });

    console.log('✅ Payment verified successfully');

    return res.status(200).json({
      success: true,
      message: 'Payment verified successfully',
      data: {
        paymentId: updatedPayment.id,
        status: updatedPayment.status,
      },
    });
  } catch (error: any) {
    console.error('❌ Error verifying payment:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to verify payment',
    });
  }
};

// ✅ FIXED: Check payment status
export const checkStudentPaymentStatus = async (req: Request, res: Response) => {
  try {
    const studentId = req.user?.userId;
    const tenantId = req.user?.tenantId;
    const { paymentId } = req.params;

    if (!studentId || !tenantId) {
      return res.status(400).json({
        success: false,
        message: 'Student ID and Tenant ID are required',
      });
    }

    if (!paymentId) {
      return res.status(400).json({
        success: false,
        message: 'Payment ID is required',
      });
    }

    // Find payment
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
    });

    if (!payment || payment.tenantId !== tenantId || payment.studentId !== studentId) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found',
      });
    }

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

    // If pending and has razorpay ID, fetch from Razorpay
    if (payment.status === 'PENDING' && payment.razorpayPaymentId) {
      try {
        const razorpayPayment = await fetchRazorpayPayment(payment.razorpayPaymentId);

        if (razorpayPayment.status === 'captured') {
          await prisma.payment.update({
            where: { id: paymentId },
            data: { status: 'PAID' },
          });

          await prisma.paymentDue.updateMany(
            {
              where: { studentId, tenantId, monthYear: payment.monthYear },
              data: {
                status: 'PAID',
                paidAmount: new Decimal(Number(payment.amount)),
              }
            }
          );

          return res.status(200).json({
            success: true,
            data: {
              paymentId: payment.id,
              status: 'PAID',
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
      },
    });
  } catch (error: any) {
    console.error('❌ Error checking payment status:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to check payment status',
    });
  }
};