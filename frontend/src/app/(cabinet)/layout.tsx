import { RouteGuard } from '@/components/features/auth/route-guard';

export default function CabinetLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RouteGuard>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          {children}
        </div>
      </div>
    </RouteGuard>
  );
}