import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F7F5EF] p-4 text-center">
      <h1 className="text-4xl font-bold text-[#2D3728] mb-2 font-mono">404</h1>
      <h2 className="text-xl font-semibold text-[#2D3728] mb-4">Page Not Found</h2>
      <p className="text-sm text-[#2D3728]/70 mb-6 max-w-md">
        The requested page or resource could not be found. Return to the PsyNova homepage.
      </p>
      <Link
        href="/"
        className="px-6 py-2.5 rounded-full bg-[#768c6e] text-white font-semibold text-sm hover:bg-[#2D3728] transition-colors"
      >
        Return to Home
      </Link>
    </div>
  );
}
