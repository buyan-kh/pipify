import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Nav */}
      <header className="border-b border-[var(--color-border)] bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[var(--color-primary)] flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <span className="text-lg font-bold tracking-tight">Ariljaa</span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm font-medium text-[var(--color-muted)] hover:text-[var(--color-foreground)]"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="bg-[var(--color-primary)] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[var(--color-primary-hover)] shadow-sm shadow-blue-500/20"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-24 pb-20 text-center relative">
        {/* Subtle gradient orb behind hero */}
        <div className="absolute top-8 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-b from-blue-100/40 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="relative">
          <div className="inline-flex items-center gap-2 bg-white border border-[var(--color-border)] rounded-full px-4 py-1.5 text-xs font-semibold text-[var(--color-muted)] mb-8 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-success)] animate-pulse" />
            Auto-trading platform
          </div>

          <h1 className="text-5xl md:text-6xl font-bold tracking-tight leading-[1.1] max-w-3xl mx-auto">
            TradingView alerts to MT5 trades,{" "}
            <span className="text-[var(--color-primary)]">automatically</span>
          </h1>
          <p className="text-lg text-[var(--color-muted)] mt-6 max-w-2xl mx-auto leading-relaxed">
            Connect your MetaTrader 5 account, set up a webhook in TradingView,
            and let Ariljaa execute your trades in milliseconds.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Link
              href="/signup"
              className="bg-[var(--color-primary)] text-white px-8 py-3 rounded-xl text-base font-semibold hover:bg-[var(--color-primary-hover)] shadow-lg shadow-blue-500/20"
            >
              Start Trading
            </Link>
            <Link
              href="/login"
              className="px-8 py-3 rounded-xl text-base font-semibold border border-[var(--color-border)] bg-white hover:bg-slate-50 shadow-sm"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-primary)] text-center mb-3">
          How it works
        </p>
        <h2 className="text-3xl font-bold text-center mb-12 tracking-tight">
          Two steps to automated trading
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          <div className="bg-white rounded-2xl border border-[var(--color-border)] p-8 text-center shadow-sm hover:shadow-md hover:-translate-y-0.5">
            <div className="w-14 h-14 bg-[var(--color-primary-subtle)] rounded-2xl flex items-center justify-center mx-auto mb-5">
              <svg className="w-6 h-6 text-[var(--color-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </div>
            <h3 className="font-bold text-lg mb-2">1. Connect MT5</h3>
            <p className="text-sm text-[var(--color-muted)] leading-relaxed">
              Add your MetaTrader 5 account credentials. Your password is
              encrypted and stored securely.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-[var(--color-border)] p-8 text-center shadow-sm hover:shadow-md hover:-translate-y-0.5">
            <div className="w-14 h-14 bg-[var(--color-success-subtle)] rounded-2xl flex items-center justify-center mx-auto mb-5">
              <svg className="w-6 h-6 text-[var(--color-success)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <h3 className="font-bold text-lg mb-2">2. Auto-Trade</h3>
            <p className="text-sm text-[var(--color-muted)] leading-relaxed">
              When TradingView fires an alert, Ariljaa instantly executes the
              trade on your MT5 account.
            </p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-primary)] text-center mb-3">
          Features
        </p>
        <h2 className="text-3xl font-bold text-center mb-12 tracking-tight">
          Built for serious traders
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
          {[
            {
              title: "Instant Execution",
              desc: "Signals are processed in seconds with atomic claim prevention against double-processing.",
              color: "var(--color-primary)",
            },
            {
              title: "Multiple MT5 Accounts",
              desc: "Connect and manage multiple broker accounts. Route signals to specific accounts.",
              color: "var(--color-success)",
            },
            {
              title: "Encrypted Credentials",
              desc: "MT5 passwords are encrypted with Fernet before storage. Never stored in plaintext.",
              color: "var(--color-warning)",
            },
            {
              title: "Full Trade History",
              desc: "Track every signal, execution, and trade result. See real-time P&L in your dashboard.",
              color: "var(--color-danger)",
            },
            {
              title: "Flexible Alert Format",
              desc: "Supports JSON and simple text formats. Works with any TradingView strategy or indicator.",
              color: "#8b5cf6",
            },
            {
              title: "Close Commands",
              desc: "Buy, sell, close buy, close sell, or close all positions for a symbol with a single alert.",
              color: "var(--color-primary)",
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="flex gap-4 bg-white rounded-xl border border-[var(--color-border)] p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5"
            >
              <div
                className="w-1.5 rounded-full flex-shrink-0 mt-0.5"
                style={{ backgroundColor: feature.color }}
              />
              <div>
                <h3 className="font-bold mb-1">{feature.title}</h3>
                <p className="text-sm text-[var(--color-muted)] leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="bg-[var(--color-sidebar)] rounded-2xl p-12 md:p-16 text-center relative overflow-hidden">
          {/* Background glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-60 h-60 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="relative">
            <h2 className="text-3xl font-bold text-white mb-4 tracking-tight">
              Ready to automate your trading?
            </h2>
            <p className="text-slate-400 mb-10 max-w-lg mx-auto leading-relaxed">
              Create your account, connect MT5, and start receiving trades from
              TradingView in minutes.
            </p>
            <Link
              href="/signup"
              className="inline-block bg-[var(--color-primary)] text-white px-8 py-3 rounded-xl text-base font-semibold hover:bg-[var(--color-primary-hover)] shadow-lg shadow-blue-500/30"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--color-border)]">
        <div className="max-w-6xl mx-auto px-6 py-8 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-[var(--color-primary)] flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <span className="text-sm font-bold text-[var(--color-muted)]">Ariljaa</span>
          </div>
          <p className="text-xs text-[var(--color-muted)]">
            TradingView to MetaTrader 5 Auto-Trading
          </p>
        </div>
      </footer>
    </div>
  );
}
