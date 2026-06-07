import Link from 'next/link';

export default function LandingPage() {
  return (
    <main className="min-h-screen flex flex-col bg-white">
      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-20 text-center">
        <div className="text-6xl mb-4">☕</div>
        <h1 className="text-5xl font-bold tracking-tight text-gray-900 mb-4">
          Home Cafe POS
        </h1>
        <p className="text-lg text-gray-500 max-w-md mb-10 leading-relaxed">
          A point-of-sale for home cafes. Set up your menu, take orders, and
          accept Venmo tips — in minutes.
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/signup"
            className="px-8 py-3 rounded-xl bg-blue-600 text-white font-semibold text-base hover:bg-blue-700 transition-colors"
          >
            Create your cafe
          </Link>
          <Link
            href="/login"
            className="px-8 py-3 rounded-xl border border-gray-300 text-gray-700 font-semibold text-base hover:bg-gray-50 transition-colors"
          >
            Sign in
          </Link>
        </div>

        {/* Feature grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-16 max-w-3xl w-full">
          {[
            { emoji: '☕', title: 'Easy menu', body: 'Add items with photos, prices, and options in seconds.' },
            { emoji: '📱', title: 'Venmo tips', body: 'QR code on the order screen — customers tip instantly.' },
            { emoji: '💬', title: 'SMS alerts', body: 'Customers get a text when their order is ready.' },
            { emoji: '📋', title: 'Live orders', body: 'See incoming orders in real time. Mark complete with one tap.' },
          ].map((f) => (
            <div key={f.title} className="p-5 bg-gray-50 rounded-2xl text-center">
              <div className="text-3xl mb-2">{f.emoji}</div>
              <div className="font-semibold text-gray-900 mb-1">{f.title}</div>
              <div className="text-sm text-gray-500">{f.body}</div>
            </div>
          ))}
        </div>
      </div>

      <footer className="py-4 text-center text-xs text-gray-400">
        homecafepos.xyz
      </footer>
    </main>
  );
}
