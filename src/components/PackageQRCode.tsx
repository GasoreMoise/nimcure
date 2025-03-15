'use client';

import { QRCodeSVG } from 'qrcode.react';

interface PackageQRCodeProps {
  packageId: string;
  size?: number;
}

export function PackageQRCode({ packageId, size = 250 }: PackageQRCodeProps) {
  return (
    <div className="qr-code-container">
      <div className="relative p-4 bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Medical cross watermark */}
        <div className="absolute inset-0 flex items-center justify-center opacity-5">
          <svg className="w-24 h-24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10h-4v4h-2v-4H7v-2h4V7h2v4h4v2z" />
          </svg>
        </div>

        {/* QR Code */}
        <div className="relative">
          <QRCodeSVG
            value={packageId}
            size={size}
            level="H"
            includeMargin
            className="rounded"
          />
          
          {/* Corner markers */}
          <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-blue-500"></div>
          <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-blue-500"></div>
          <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-blue-500"></div>
          <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-blue-500"></div>
        </div>

        {/* Package ID */}
        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
          <div className="px-2 py-1 bg-blue-50 border border-blue-200 rounded text-center">
            <p className="text-xs font-medium text-blue-700">{packageId}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
