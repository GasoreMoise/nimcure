import { useEffect, useRef, useState } from 'react';
import { BrowserQRCodeReader, IScannerControls } from '@zxing/browser';
import { Result } from '@zxing/library';
import { LoadingSpinner } from './LoadingSpinner';

interface QRCodeScannerProps {
  onScan: (result: string) => void;
  onError?: (error: Error) => void;
  isScanning: boolean;
  patientName?: string;
}

export function QRCodeScanner({ onScan, onError, isScanning, patientName }: QRCodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const controlsRef = useRef<IScannerControls | null>(null);

  useEffect(() => {
    let mounted = true;
    const codeReader = new BrowserQRCodeReader();

    const startScanning = async () => {
      try {
        if (!videoRef.current) return;

        const controls = await codeReader.decodeFromVideoDevice(
          undefined,
          videoRef.current,
          (result: Result | undefined, err?: Error) => {
            if (!mounted) return;

            if (err) {
              setError(err.message);
              onError?.(err);
              return;
            }

            if (result) {
              const text = result.getText();
              onScan(text);
            }
          }
        );

        controlsRef.current = controls;
        setIsInitializing(false);
      } catch (err) {
        if (!mounted) return;
        const error = err instanceof Error ? err : new Error('Failed to start scanner');
        setError(error.message);
        onError?.(error);
        setIsInitializing(false);
      }
    };

    if (isScanning) {
      startScanning();
    } else if (controlsRef.current) {
      controlsRef.current.stop();
      controlsRef.current = null;
    }

    return () => {
      mounted = false;
      if (controlsRef.current) {
        controlsRef.current.stop();
        controlsRef.current = null;
      }
    };
  }, [isScanning, onScan, onError]);

  if (isInitializing) {
    return (
      <div className="relative w-full max-w-lg mx-auto">
        <div className="relative aspect-square w-full max-w-lg border-2 border-gray-200 rounded-lg overflow-hidden bg-gray-50">
          <LoadingSpinner size="lg" showText={false} />
        </div>
        <p className="mt-4 text-sm text-gray-500 text-center">
          Initializing camera...
        </p>
      </div>
    );
  }

  return (
    <div className="relative w-full max-w-lg mx-auto">
      <div className="relative aspect-square w-full max-w-lg border-2 border-gray-200 rounded-lg overflow-hidden">
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover"
        />

        {isScanning && (
          <div className="absolute inset-0">
            {/* Corner Markers */}
            <div className="absolute top-0 left-0 w-16 h-16 border-t-4 border-l-4 border-blue-500" />
            <div className="absolute top-0 right-0 w-16 h-16 border-t-4 border-r-4 border-blue-500" />
            <div className="absolute bottom-0 left-0 w-16 h-16 border-b-4 border-l-4 border-blue-500" />
            <div className="absolute bottom-0 right-0 w-16 h-16 border-b-4 border-r-4 border-blue-500" />

            {/* Scanning Line */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="h-1 w-full bg-blue-500/50 animate-scan" />
            </div>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <div className="bg-white p-4 rounded-lg shadow-lg max-w-xs mx-4 text-center">
              <p className="text-red-600 text-sm">{error}</p>
              <button
                onClick={() => setError(null)}
                className="mt-2 text-sm text-blue-600 hover:text-blue-500"
              >
                Try Again
              </button>
            </div>
          </div>
        )}
      </div>

      <p className="mt-4 text-sm text-gray-500 text-center">
        {isScanning
          ? `Scan a package to assign it to ${patientName || 'patient'}`
          : 'Scanner is paused'}
      </p>
    </div>
  );
}