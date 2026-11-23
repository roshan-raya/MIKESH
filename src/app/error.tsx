'use client';
export default function ErrorBoundary({reset}:{reset:()=>void}){return <main className="shell"><section className="panel stack"><h1>Could not load this page</h1><p>Try again to reconnect to your study workspace.</p><button onClick={reset}>Try again</button><a href="/dashboard">Return to dashboard</a></section></main>}
