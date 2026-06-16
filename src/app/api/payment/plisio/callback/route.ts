import { NextResponse } from 'next/server';
import { db } from '@/db';
import { transactions, users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { getPlisioApiKey, mapPlisioStatusToDb, verifyPlisioCallback } from '@/lib/plisio';

export async function POST(req: Request) {
  try {
    let callbackData: Record<string, unknown>;

    const contentType = req.headers.get('content-type') || '';
    const raw = await req.text();
    
    try {
      if (contentType.includes('application/json')) {
        callbackData = JSON.parse(raw);
      } else {
        const params = new URLSearchParams(raw);
        callbackData = Object.fromEntries(params) as Record<string, unknown>;
      }
    } catch {
      callbackData = {};
    }

    if (!callbackData || !callbackData.order_number) {
      console.error('Plisio callback: missing body or order_number');
      return NextResponse.json({ status: 'error', message: 'Invalid callback data' }, { status: 422 });
    }

    const apiKey = getPlisioApiKey();
    if (!verifyPlisioCallback(callbackData, apiKey)) {
      console.error('Plisio callback: verification failed');
      return NextResponse.json({ status: 'error', message: 'Data verification failed' }, { status: 422 });
    }

    const orderNumber = String(callbackData.order_number);
    const status = String(callbackData.status ?? 'pending');
    const dbStatus = mapPlisioStatusToDb(status);

    const [transaction] = await db
      .select()
      .from(transactions)
      .where(eq(transactions.plisioOrderId, orderNumber))
      .limit(1);

    if (!transaction) {
      console.error('Plisio callback: transaction not found', orderNumber);
      return NextResponse.json({ status: 'error', message: 'Transaction not found' }, { status: 404 });
    }

    const updateData: { status: string; updatedAt: Date; plisioTxnId?: string } = {
      status: dbStatus,
      updatedAt: new Date(),
    };
    if (callbackData.txn_id && !transaction.plisioTxnId) {
      updateData.plisioTxnId = String(callbackData.txn_id);
    }

    await db
      .update(transactions)
      .set(updateData)
      .where(eq(transactions.id, transaction.id));

    // If payment is successful, grant the role
    if (dbStatus === 'success') {
      await db
        .update(users)
        .set({ role: transaction.role })
        .where(eq(users.id, transaction.userId));
      console.log(`[Plisio Callback] User ${transaction.userId} upgraded to ${transaction.role}`);
    }

    return NextResponse.json({ status: 'success', message: 'Callback processed' }, { status: 200 });
  } catch (error: any) {
    console.error('Plisio callback error:', error);
    return NextResponse.json({ status: 'error', message: 'Internal server error' }, { status: 500 });
  }
}
