import DashboardShell from "@/components/dashboard/DashboardShell";

export default function Page() {
  return (
    <main className="p-6 max-w-screen-2xl mx-auto">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-white tracking-tight">Aybee Admin</h1>
        <p className="text-slate-400 text-sm mt-0.5">Credit Dashboard</p>
      </header>
      <DashboardShell />
    </main>
  );
}
