export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      {/* You can add a sidebar or header here if needed */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
