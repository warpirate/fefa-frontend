'use client';

import '@/styles/components/auth/PasswordStrength.css';

interface PasswordStrengthProps {
  password: string;
}

export default function PasswordStrength({ password }: PasswordStrengthProps) {
  const getPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const passwordStrength = getPasswordStrength(password);

  if (!password) return null;

  return (
    <div className="password-strength">
      <div className="strength-bars">
        {[1, 2, 3, 4, 5].map((level) => (
          <div
            key={level}
            className={`strength-bar ${
              level <= passwordStrength
                ? passwordStrength <= 2
                  ? 'weak'
                  : passwordStrength <= 3
                  ? 'medium'
                  : 'strong'
                : ''
            }`}
          />
        ))}
      </div>
      <span 
        className={`strength-text ${
          passwordStrength <= 2
            ? 'weak'
            : passwordStrength <= 3
            ? 'medium'
            : 'strong'
        }`}
      >
        {passwordStrength <= 2
          ? 'Weak'
          : passwordStrength <= 3
          ? 'Medium'
          : 'Strong'}
      </span>
    </div>
  );
}
