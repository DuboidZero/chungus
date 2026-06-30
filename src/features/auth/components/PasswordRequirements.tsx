
import { Check, X } from 'lucide-react';
import { validateLength, containsNumber } from '../lib/passwordValidation';

interface PasswordRequirementsProps {
  password: string;
}

export function PasswordRequirements({ password }: PasswordRequirementsProps) {
  const isLengthValid = validateLength(password);
  const hasNumber = containsNumber(password);

  return (
    <div className="space-y-2 mt-2 text-xs">
      <p className="text-slate-400 font-medium">Password requirements:</p>
      <ul className="space-y-1">
        <li className={`flex items-center gap-1.5 ${isLengthValid ? 'text-emerald-400' : 'text-slate-500'}`}>
          {isLengthValid ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
          <span>Minimum 8 characters</span>
        </li>
        <li className={`flex items-center gap-1.5 ${hasNumber ? 'text-emerald-400' : 'text-slate-500'}`}>
          {hasNumber ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
          <span>At least one number</span>
        </li>
      </ul>
    </div>
  );
}
