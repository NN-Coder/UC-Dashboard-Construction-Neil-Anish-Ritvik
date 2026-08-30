import Dashboard from './Dashboard';

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        <Dashboard />
      </div>
    </main>
  );
}
