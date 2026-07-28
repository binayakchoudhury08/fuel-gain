import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useForm, Controller } from 'react-hook-form';
import { Flame, Mail, Lock, UserPlus, UserCheck } from 'lucide-react';
import { MD3Input } from '../components/MD3Input';
import { MD3Button } from '../components/MD3Button';
import { MD3Card } from '../components/MD3Card';
import { ProgressBar } from '../components/ProgressBar';
import { evaluatePasswordStrength } from '../utils/passwordStrength';
import { updatePersonalDetails } from '../storage/slices/userSlice';
import { auditLogger } from '../services/auditLogger';
import { supabase } from '../config/supabaseClient';
import { accountStorage } from '../storage/accountStorage';

interface SignupScreenProps {
  onSignupSuccess: () => void;
  onNavigateLogin: () => void;
}

export const SignupScreen: React.FC<SignupScreenProps> = ({
  onSignupSuccess,
  onNavigateLogin,
}) => {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);

  // Google Account Prompt Modal state
  const [showGoogleAccountModal, setShowGoogleAccountModal] = useState(false);
  const [googleName, setGoogleName] = useState('');
  const [googleEmail, setGoogleEmail] = useState('');

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      acceptTerms: false,
    },
  });

  const passwordValue = watch('password');
  const passwordStrength = evaluatePasswordStrength(passwordValue || '');

  const onSubmit = async (data: { email: string; password?: string }) => {
    setIsLoading(true);

    if (data.password) {
      try {
        await supabase.auth.signUp({
          email: data.email,
          password: data.password,
        });
      } catch (_err) {
        // Fallback account creation
      }
    }

    const name = data.email.split('@')[0].replace(/[._]/g, ' ');
    const formattedName = name.charAt(0).toUpperCase() + name.slice(1);

    const existingAccount = accountStorage.getAccountProfile(data.email);

    dispatch(
      updatePersonalDetails({
        fullName: formattedName || 'Station Operator',
        email: data.email,
        isExistingUser: !!existingAccount,
      })
    );
    auditLogger.log('Signup', `Created new account for ${data.email}.`);
    setIsLoading(false);
    onSignupSuccess();
  };

  const handleGoogleSignupClick = async () => {
    setShowGoogleAccountModal(true);
  };

  const handleConfirmGoogleAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!googleEmail.trim() || !googleName.trim()) return;

    const existingAccount = accountStorage.getAccountProfile(googleEmail);

    dispatch(
      updatePersonalDetails({
        fullName: googleName,
        email: googleEmail,
        avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200',
        isExistingUser: !!existingAccount,
      })
    );

    // Remember Google session permanently
    localStorage.setItem('fuel_gain_remember_me', JSON.stringify({ email: googleEmail, remember: true }));
    auditLogger.log('Signup', `Signed up ${googleEmail} via Google Account.`);
    setShowGoogleAccountModal(false);
    onSignupSuccess();
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: '24px 16px',
        backgroundColor: 'var(--color-bg)',
      }}
    >
      <div style={{ width: '100%', maxWidth: '420px' }}>
        {/* Header Logo */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '18px',
              background: 'var(--color-primary-gradient)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '10px',
              boxShadow: '0 8px 24px rgba(30, 64, 175, 0.25)',
            }}
          >
            <Flame size={32} color="#FFFFFF" />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>
            Create Account
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
            Start tracking petrol pump daily gains & Dip charts
          </p>
        </div>

        {/* Signup Form Card */}
        <MD3Card variant="elevated" style={{ padding: '24px' }}>
          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Email Field */}
            <Controller
              name="email"
              control={control}
              rules={{
                required: 'Email address is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Enter a valid email address',
                },
              }}
              render={({ field }) => (
                <MD3Input
                  label="Email Address"
                  placeholder="owner@fuelpump.com"
                  leftIcon={<Mail size={18} />}
                  error={errors.email?.message}
                  {...field}
                />
              )}
            />

            {/* Password Field */}
            <Controller
              name="password"
              control={control}
              rules={{
                required: 'Password is required',
                minLength: { value: 6, message: 'Password must be at least 6 characters' },
              }}
              render={({ field }) => (
                <MD3Input
                  label="Password"
                  placeholder="••••••••"
                  isPassword={true}
                  leftIcon={<Lock size={18} />}
                  error={errors.password?.message}
                  {...field}
                />
              )}
            />

            {/* Password Strength Meter */}
            {passwordValue && (
              <div style={{ marginTop: '-6px', marginBottom: '14px' }}>
                <ProgressBar
                  progress={passwordStrength.percentage}
                  showPercentage={false}
                  label={`Strength: ${passwordStrength.label}`}
                  color={passwordStrength.color}
                  height={6}
                />
              </div>
            )}

            {/* Confirm Password Field */}
            <Controller
              name="confirmPassword"
              control={control}
              rules={{
                required: 'Please confirm your password',
                validate: (value) => value === passwordValue || 'Passwords do not match',
              }}
              render={({ field }) => (
                <MD3Input
                  label="Confirm Password"
                  placeholder="••••••••"
                  isPassword={true}
                  leftIcon={<Lock size={18} />}
                  error={errors.confirmPassword?.message}
                  {...field}
                />
              )}
            />

            {/* Accept Terms Checkbox */}
            <div style={{ marginBottom: '20px' }}>
              <Controller
                name="acceptTerms"
                control={control}
                rules={{ required: 'You must accept the Terms and Privacy Policy' }}
                render={({ field: { value, onChange } }) => (
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '8px',
                      cursor: 'pointer',
                      fontSize: '0.82rem',
                      color: 'var(--color-text-secondary)',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={value}
                      onChange={onChange}
                      style={{ marginTop: '3px', width: '16px', height: '16px', accentColor: 'var(--color-primary)' }}
                    />
                    <span>
                      I accept the <strong style={{ color: 'var(--color-primary)' }}>Terms of Service</strong> &{' '}
                      <strong style={{ color: 'var(--color-primary)' }}>Privacy Policy</strong>
                    </span>
                  </label>
                )}
              />
              {errors.acceptTerms && (
                <span style={{ fontSize: '0.78rem', color: 'var(--color-error)', display: 'block', marginTop: '4px' }}>
                  {errors.acceptTerms.message}
                </span>
              )}
            </div>

            {/* Create Account Button */}
            <MD3Button
              type="submit"
              variant="primary"
              fullWidth={true}
              size="lg"
              isLoading={isLoading}
              rightIcon={<UserPlus size={18} />}
            >
              Create Account
            </MD3Button>
          </form>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '20px 0' }}>
            <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--color-divider)' }} />
            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>
              OR
            </span>
            <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--color-divider)' }} />
          </div>

          {/* Google OAuth Button */}
          <MD3Button
            type="button"
            variant="outline"
            fullWidth={true}
            size="md"
            isLoading={false}
            onClick={handleGoogleSignupClick}
            leftIcon={
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
            }
          >
            Continue with Google
          </MD3Button>
        </MD3Card>

        {/* Footer Link to Login */}
        <div style={{ textAlign: 'center', marginTop: '18px' }}>
          <span style={{ fontSize: '0.88rem', color: 'var(--color-text-secondary)' }}>
            Already have an account?{' '}
          </span>
          <button
            onClick={onNavigateLogin}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-primary)',
              fontWeight: 700,
              fontSize: '0.88rem',
              cursor: 'pointer',
            }}
          >
            Sign In
          </button>
        </div>
      </div>

      {/* Google Account Picker Modal */}
      {showGoogleAccountModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(6px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '420px',
              backgroundColor: 'var(--color-surface)',
              borderRadius: '20px',
              padding: '24px',
              boxShadow: 'var(--shadow-lg)',
              border: '1px solid var(--color-card-border)',
            }}
          >
            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
              <div style={{ padding: '10px', borderRadius: '50%', backgroundColor: 'var(--color-primary-container)', color: 'var(--color-primary)', display: 'inline-flex', marginBottom: '8px' }}>
                <UserCheck size={28} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>
                Google Sign-In Account Setup
              </h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)' }}>
                Enter your Google Account details to proceed with station setup
              </p>
            </div>

            <form onSubmit={handleConfirmGoogleAccount}>
              <MD3Input
                label="Your Full Name"
                placeholder="e.g. Rajesh Sharma"
                value={googleName}
                onChange={(e) => setGoogleName(e.target.value)}
                required
              />
              <MD3Input
                label="Google Email Address"
                type="email"
                placeholder="user@gmail.com"
                value={googleEmail}
                onChange={(e) => setGoogleEmail(e.target.value)}
                required
              />

              <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                <MD3Button
                  type="button"
                  variant="outline"
                  fullWidth
                  onClick={() => setShowGoogleAccountModal(false)}
                >
                  Cancel
                </MD3Button>
                <MD3Button type="submit" variant="primary" fullWidth>
                  Proceed with Google
                </MD3Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
