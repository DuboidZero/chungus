
import { Link } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import { AuthCard } from '../components/AuthCard';

export function UnauthorizedPage() {
  return (
    <AuthCard
      title="Access Denied"
      subtitle="You do not have permission to view this page."
    >
      <div className="flex flex-col items-center justify-center space-y-6 py-4">
        <div className="w-16 h-16 rounded-full bg-error-container flex items-center justify-center text-error">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <p className="text-on-surface-variant text-center text-sm">
          The page you are trying to access requires a different role or higher privileges.
        </p>
        <Link
          to="/"
          className="bg-primary-container hover:bg-primary text-on-primary font-medium px-6 py-2.5 rounded-md transition-colors shadow-sm"
        >
          Return to Dashboard
        </Link>
      </div>
    </AuthCard>
  );
}
