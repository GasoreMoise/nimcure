import QRCode from 'qrcode';

export const generateQRCode = async (packageId: string): Promise<string> => {
  try {
    // Generate QR code as data URL
    const qrDataUrl = await QRCode.toDataURL(packageId);
    return qrDataUrl;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw error;
  }
}; 