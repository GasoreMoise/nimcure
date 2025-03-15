import Image from 'next/image';

interface AuthLayoutProps {
  children: React.ReactNode;
}

const AuthLayout = ({ children }: AuthLayoutProps) => {
  return (
    <div className="min-h-screen flex">
      {/* Left side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          {children}
        </div>
      </div>

      {/* Right side - Illustration */}
      <div className="hidden lg:block lg:w-1/2 relative auth-illustration">
        <div className="absolute inset-0 flex flex-col items-start justify-center p-12">
          <div className="max-w-lg space-y-4">
            <h2 className="text-4xl font-bold text-white">
              Serving Patients During a Pandemic
            </h2>
            <p className="text-lg text-blue-50">
              Delivering essential medication to NIMR patients with adherence
              to quality of service, care and confidentiality.
            </p>
          </div>
          <div className="absolute bottom-0 right-0 w-2/3">
            <Image
              src="/delivery-illustration.svg"
              alt="Delivery Illustration"
              width={500}
              height={400}
              className="object-contain"
              priority
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
