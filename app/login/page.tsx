import { Suspense } from 'react';
import { ShieldCheck } from 'lucide-react';
import { LoginForm } from './LoginForm';

export const dynamic = 'force-dynamic';

export default function LoginPage() {
  return (
    <main className="flex flex-1 items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-purple-100 flex items-center justify-center mb-3">
            <ShieldCheck className="w-7 h-7 text-purple-600" strokeWidth={1.5} />
          </div>
          <h1 className="text-2xl font-semibold text-zinc-900">Aura Admin</h1>
          <p className="text-sm text-zinc-500 mt-1">Super admin dashboard</p>
        </div>

        <Suspense
          fallback={
            <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 p-6 h-72 animate-pulse" />
          }
        >
          <LoginForm />
        </Suspense>
      </div>
    </main>
  );
}
