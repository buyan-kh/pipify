import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Nav */}
      <header className="border-b border-[var(--color-border)] bg-white">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <span className="text-xl font-bold tracking-tight">Pipify</span>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm font-medium text-[var(--color-muted)] hover:text-[var(--color-foreground)] transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="bg-[var(--color-primary)] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[var(--color-primary-hover)] transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-24 pb-16 text-center">
        <h1 className="text-5xl font-bold tracking-tight leading-tight max-w-3xl mx-auto">
          TradingView alerts to MT5 trades,{" "}
          <span className="text-[var(--color-primary)]">automatically</span>
        </h1>
        <p className="text-lg text-[var(--color-muted)] mt-6 max-w-2xl mx-auto leading-relaxed">
          Connect your MetaTrader 5 account, set up a webhook in TradingView,
          and let Pipify execute your trades in milliseconds. No manual
          intervention needed.
        </p>
        <div className="mt-10 flex items-center justify-center gap-4">
          <Link
            href="/signup"
            className="bg-[var(--color-primary)] text-white px-8 py-3 rounded-lg text-base font-medium hover:bg-[var(--color-primary-hover)] transition-colors"
          >
            Start Trading
          </Link>
          <Link
            href="/login"
            className="px-8 py-3 rounded-lg text-base font-medium border border-[var(--color-border)] hover:bg-gray-50 transition-colors"
          >
            Sign In
          </Link>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-bold text-center mb-12">How it works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-xl border border-[var(--color-border)] p-6 text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-[var(--color-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </div>
            <h3 className="font-semibold text-lg mb-2">1. Connect MT5</h3>
            <p className="text-sm text-[var(--color-muted)] leading-relaxed">
              Add your MetaTrader 5 account credentials. Your password is
              encrypted and stored securely.
            </p>
          </div>

          <div className="bg-white rounded-xl border border-[var(--color-border)] p-6 text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-[var(--color-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <h3 className="font-semibold text-lg mb-2">2. Set Up Webhook</h3>
            <p className="text-sm text-[var(--color-muted)] leading-relaxed">
              Copy your unique webhook URL and paste it into your TradingView
              alert. Configure the alert message format.
            </p>
          </div>

          <div className="bg-white rounded-xl border border-[var(--color-border)] p-6 text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-[var(--color-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <h3 className="font-semibold text-lg mb-2">3. Auto-Trade</h3>
            <p className="text-sm text-[var(--color-muted)] leading-relaxed">
              When TradingView fires an alert, Pipify instantly executes the
              trade on your MT5 account. Monitor everything from your dashboard.
            </p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-bold text-center mb-12">Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {[
            {
              title: "Instant Execution",
              desc: "Signals are processed in seconds with atomic claim prevention against double-processing.",
            },
            {
              title: "Multiple MT5 Accounts",
              desc: "Connect and manage multiple broker accounts. Route signals to specific accounts.",
            },
            {
              title: "Encrypted Credentials",
              desc: "MT5 passwords are encrypted with Fernet before storage. Never stored in plaintext.",
            },
            {
              title: "Full Trade History",
              desc: "Track every signal, execution, and trade result. See real-time P&L in your dashboard.",
            },
            {
              title: "Flexible Alert Format",
              desc: "Supports JSON and simple text formats. Works with any TradingView strategy or indicator.",
            },
            {
              title: "Close Commands",
              desc: "Buy, sell, close buy, close sell, or close all positions for a symbol with a single alert.",
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="flex gap-4 bg-white rounded-xl border border-[var(--color-border)] p-5"
            >
              <div className="w-2 h-2 bg-[var(--color-primary)] rounded-full mt-2 flex-shrink-0" />
              <div>
                <h3 className="font-semibold mb-1">{feature.title}</h3>
                <p className="text-sm text-[var(--color-muted)] leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-6 py-16 text-center">
        <div className="bg-[var(--color-sidebar)] rounded-2xl p-12">
          <h2 className="text-2xl font-bold text-white mb-4">
            Ready to automate your trading?
          </h2>
          <p className="text-gray-400 mb-8 max-w-lg mx-auto">
            Create your account, connect MT5, and start receiving trades from
            TradingView in minutes.
          </p>
          <Link
            href="/signup"
            className="inline-block bg-[var(--color-primary)] text-white px-8 py-3 rounded-lg text-base font-medium hover:bg-[var(--color-primary-hover)] transition-colors"
          >
            Get Started Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--color-border)] bg-white">
        <div className="max-w-6xl mx-auto px-6 py-6 text-center text-sm text-[var(--color-muted)]">
          Pipify &mdash; TradingView to MetaTrader 5 Auto-Trading
        </div>
      </footer>
    </div>
  );
}
