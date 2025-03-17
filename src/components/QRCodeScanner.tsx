import { useRef, useEffect, useCallback } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

interface QRCodeScannerProps {
  onScan: (result: string) => void;
  onError?: (error: Error) => void;
  isScanning: boolean;
  patientName?: string;
}

export function QRCodeScanner({ onScan, onError, isScanning, patientName }: QRCodeScannerProps) {
  const videoRef = useRef<HTMLDivElement>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);

  const stopScanner = useCallback(async () => {
    try {
      if (scannerRef.current?.isScanning) {
        await scannerRef.current.stop();
        scannerRef.current = null;
      }
      
      // Force stop all video tracks
      const tracks = await navigator.mediaDevices.getUserMedia({ video: true });
      tracks.getTracks().forEach(track => track.stop());
      
      // Clear any remaining video elements
      const videos = document.querySelectorAll('video');
      videos.forEach(video => {
        if (video.srcObject) {
          const stream = video.srcObject as MediaStream;
          stream.getTracks().forEach(track => track.stop());
          video.srcObject = null;
        }
      });
    } catch (err) {
      console.error('Error stopping scanner:', err);
    }
  }, []);

  useEffect(() => {
    if (!isScanning) {
      stopScanner();
      return;
    }

    const startScanner = async () => {
      try {
        await stopScanner(); // Ensure clean state
        if (!scannerRef.current) {
          scannerRef.current = new Html5Qrcode('qr-reader');
        }
        
        await scannerRef.current.start(
          { facingMode: 'environment' },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0,
            disableFlip: false,
          },
          onScan,
          (error) => {
            if (!error.includes('NotFoundException')) {
              console.error(error);
              onError?.(new Error(error));
            }
          }
        );
      } catch (err) {
        console.error('Failed to start scanner:', err);
        onError?.(err as Error);
      }
    };

    startScanner();

    return () => {
      stopScanner();
    };
  }, [isScanning, onScan, onError, stopScanner]);

  // Additional cleanup on unmount
  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, [stopScanner]);

  return (
    <div className="w-full max-w-sm mx-auto">
      <div 
        id="qr-reader" 
        ref={videoRef}
        className="w-full aspect-square bg-gray-100 rounded-lg overflow-hidden"
      />
      <p className="mt-4 text-sm text-gray-500 text-center">
        {isScanning
          ? `Position QR code in the center of the camera view`
          : 'Scanner is paused'}
      </p>
    </div>
  );
}