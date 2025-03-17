import { Delivery } from '@/contexts/DeliveryContext';
import QRCode from 'qrcode';

export function checkDeliveryStatus(delivery: Delivery): Delivery['status'] {
  if (!delivery.tracking) return delivery.status;

  const now = new Date();
  const responseTimeout = delivery.tracking.responseTimeout 
    ? new Date(delivery.tracking.responseTimeout)
    : null;

  if (
    delivery.status === 'pending' &&
    responseTimeout &&
    now > responseTimeout
  ) {
    return 'failed';
  }

  return delivery.status;
}

export function getDeliveryStatusColor(status: Delivery['status']): string {
  const colors = {
    unassigned: 'bg-gray-100 text-gray-800',
    pending: 'bg-yellow-100 text-yellow-800',
    in_progress: 'bg-blue-100 text-blue-800',
    delivered: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800'
  };

  return colors[status] || colors.pending;
}

export async function generateQRCode(packageId: string): Promise<string> {
  try {
    return await QRCode.toDataURL(packageId);
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw error;
  }
} 