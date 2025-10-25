import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import clientPromise from '~/lib/mongodb';
import type { Order } from '~/lib/order-types';
import { ObjectId } from 'mongodb';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const client = await clientPromise;
    const db = client.db('stitch_orders');
    const ordersCollection = db.collection<Order>('orders');

    const { id } = await params;
    const order = await ordersCollection.findOne({ _id: new ObjectId(id) });

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      order: order
    });

  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json(
      { error: 'Failed to fetch order' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json() as { status?: 'pending' | 'processing' | 'ready_for_pickup' | 'shipped' | 'delivered' | 'cancelled'; notes?: string };
    const { status, notes } = body;

    const client = await clientPromise;
    const db = client.db('stitch_orders');
    const ordersCollection = db.collection<Order>('orders');

    const updateData: { updatedAt: Date; status?: 'pending' | 'processing' | 'ready_for_pickup' | 'shipped' | 'delivered' | 'cancelled'; notes?: string } = {
      updatedAt: new Date()
    };

    if (status) updateData.status = status;
    if (notes !== undefined) updateData.notes = notes;

    const { id } = await params;
    const result = await ordersCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Order updated successfully'
    });

  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json() as { 
      status?: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'paid' | 'payment_failed'; 
      paymentIntentId?: string;
      notes?: string;
    };
    const { status, paymentIntentId, notes } = body;

    const client = await clientPromise;
    const db = client.db('stitch_orders');
    const ordersCollection = db.collection<Order>('orders');

    const updateData: { 
      updatedAt: Date; 
      status?: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'paid' | 'payment_failed';
      paymentIntentId?: string;
      notes?: string;
    } = {
      updatedAt: new Date()
    };

    if (status) updateData.status = status;
    if (paymentIntentId) updateData.paymentIntentId = paymentIntentId;
    if (notes !== undefined) updateData.notes = notes;

    const { id } = await params;
    const result = await ordersCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Order updated successfully'
    });

  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    );
  }
}
