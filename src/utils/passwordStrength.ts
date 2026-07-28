export interface PasswordStrengthResult {
  score: number; // 0 to 4
  label: 'Very Weak' | 'Weak' | 'Medium' | 'Strong' | 'Very Strong';
  color: string;
  percentage: number;
}

export function evaluatePasswordStrength(password: string): PasswordStrengthResult {
  if (!password) {
    return { score: 0, label: 'Very Weak', color: '#EF4444', percentage: 0 };
  }

  let score = 0;
  if (password.length >= 6) score++;
  if (password.length >= 10) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  switch (score) {
    case 0:
    case 1:
      return { score: 1, label: 'Weak', color: '#EF4444', percentage: 25 };
    case 2:
      return { score: 2, label: 'Medium', color: '#F59E0B', percentage: 50 };
    case 3:
    case 4:
      return { score: 3, label: 'Strong', color: '#10B981', percentage: 75 };
    case 5:
    default:
      return { score: 4, label: 'Very Strong', color: '#059669', percentage: 100 };
  }
}
