'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import BrandLogo from '@/components/BrandLogo';
import {
  Lock,
  BadgeCheck,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const idOrEmailParam = searchParams.get('id') || searchParams.get('email') || '';

  const { resetPasswordConfirm, findEmployeeByIdOrEmail } = useApp();

  const [identifier, setIdentifier] = useState(idOrEmailParam);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [redirectCountdown, setRedirectCountdown] = useState(5);

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);

  useEffect(() => {
    if (idOrEmailParam && !identifier) {
      setIdentifier(idOrEmailParam);
    }
  }, [idOrEmailParam, identifier]);

  const matchedEmployee = useMemo(() => {
    if (!identifier || identifier.trim().length === 0) return null;
    return findEmployeeByIdOrEmail(identifier);
  }, [identifier, findEmployeeByIdOrEmail]);

  // Password strength calculation
  const passwordStrength = useMemo(() => {
    if (!password) return { score: 0, label: 'None', className: '' };
    let score = 0;
    if (password.length >= 6) score += 1;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
    if (/\d/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    switch (score) {
      case 1:
        return { score: 1, label: 'Weak', className: 'weak' };
      case 2:
        return { score: 2, label: 'Fair', className: 'fair' };
      case 3:
        return { score: 3, label: 'Good', className: 'good' };
      case 4:
        return { score: 4, label: 'Strong', className: 'strong' };
      default:
        return { score: 1, label: 'Weak', className: 'weak' };
    }
  }, [password]);

  // Auto redirect countdown on success
  useEffect(() => {
    if (!isSuccess) return;
    const timer = setInterval(() => {
      setRedirectCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push('/login');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isSuccess, router]);

  const validate = (): boolean => {
    const errors: Record<string, string> = {};

    if (!identifier.trim()) {
      errors.identifier = 'Employee ID or email is required';
    }

    if (!password) {
      errors.password = 'New password is required';
    } else if (password.length < 4) {
      errors.password = 'Password must be at least 4 characters long';
    }

    if (!confirmPassword) {
      errors.confirmPassword = 'Confirm your new password';
    } else if (confirmPassword !== password) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    if (!validate()) {
      return;
    }

    setIsLoading(true);
    try {
      const res = await resetPasswordConfirm(identifier, password);
      if (res.success) {
        setIsSuccess(true);
      } else {
        setServerError(res.error || 'Failed to update credentials. Please try again.');
      }
    } catch (err: any) {
      setServerError(err?.message || 'A network error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-card">
      {/* Brand Header */}
      <div className="auth-header">
        <div style={{ marginBottom: '1.25rem' }}>
          <BrandLogo size="lg" />
        </div>
        <div className="auth-header-icon">
          <ShieldCheck size={22} />
        </div>
        <h1 className="auth-title">Create new password</h1>
        <p className="auth-subtitle">
          Update the credentials for your verified Employee account.
        </p>
      </div>

      {isSuccess ? (
        <div className="auth-success-card">
          <div className="auth-success-icon-wrap">
            <CheckCircle2 size={32} />
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
            Password Reset Complete
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', textAlign: 'center', lineHeight: 1.5, marginBottom: '1.5rem' }}>
            Your account credentials have been successfully updated. You can now sign in with your Employee ID.
          </p>
          <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
            Redirecting to sign-in in{' '}
            <strong style={{ color: 'var(--primary)' }}>{redirectCountdown} seconds</strong>...
          </div>
          <button
            type="button"
            onClick={() => router.push('/login')}
            className="auth-btn-primary"
            id="proceed-to-login-btn"
          >
            <span>Proceed to Sign In Now</span>
            <ArrowRight size={16} />
          </button>
        </div>
      ) : (
        <>
          {serverError && (
            <div className="auth-banner-error" role="alert" id="reset-password-error">
              <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>{serverError}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form" noValidate>
            {/* Account Identifier Field */}
            <div className="auth-field">
              <label htmlFor="reset-identifier" className="auth-label">
                <span>Employee ID or Email</span>
              </label>
              <div className="auth-input-wrap">
                <BadgeCheck size={16} className="auth-input-icon" />
                <input
                  id="reset-identifier"
                  type="text"
                  autoComplete="username"
                  value={identifier}
                  disabled={isLoading}
                  onChange={(e) => {
                    setIdentifier(e.target.value);
                    if (formErrors.identifier) setFormErrors((prev) => ({ ...prev, identifier: '' }));
                  }}
                  placeholder="e.g. AX001 or AX000"
                  className={`auth-input ${formErrors.identifier ? 'auth-input-error' : ''} ${
                    matchedEmployee ? 'auth-input-success' : ''
                  }`}
                  aria-invalid={!!formErrors.identifier}
                  aria-describedby={formErrors.identifier ? 'reset-identifier-error' : undefined}
                />
              </div>
              {formErrors.identifier && (
                <div className="auth-error-msg" id="reset-identifier-error" role="alert">
                  <AlertCircle size={13} />
                  <span>{formErrors.identifier}</span>
                </div>
              )}

              {/* Matched Profile Preview */}
              {matchedEmployee && (
                <div className="employee-id-profile-preview" role="region" aria-label="Target Employee Profile">
                  <img
                    src={matchedEmployee.avatar}
                    alt={matchedEmployee.name}
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: '2px solid var(--primary)',
                    }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                      {matchedEmployee.name}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      {matchedEmployee.designation} · {matchedEmployee.employeeId || matchedEmployee.id}
                    </div>
                  </div>
                  <CheckCircle2 size={16} style={{ color: 'var(--success)', flexShrink: 0 }} />
                </div>
              )}
            </div>

            {/* New Password Field */}
            <div className="auth-field">
              <label htmlFor="new-password" className="auth-label">
                <span>New Password</span>
              </label>
              <div className="auth-input-wrap">
                <Lock size={16} className="auth-input-icon" />
                <input
                  id="new-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={password}
                  disabled={isLoading}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (formErrors.password) setFormErrors((prev) => ({ ...prev, password: '' }));
                  }}
                  placeholder="Enter new password (e.g. 123456)"
                  className={`auth-input ${formErrors.password ? 'auth-input-error' : ''}`}
                  style={{ paddingRight: '2.5rem' }}
                  aria-invalid={!!formErrors.password}
                  aria-describedby={formErrors.password ? 'new-password-error' : undefined}
                />
                <button
                  type="button"
                  className="auth-eye-btn"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {formErrors.password && (
                <div className="auth-error-msg" id="new-password-error" role="alert">
                  <AlertCircle size={13} />
                  <span>{formErrors.password}</span>
                </div>
              )}
            </div>

            {/* Dynamic Strength Indicator */}
            {password && (
              <div className="strength-meter-wrap">
                <div className="strength-meter-info">
                  <span style={{ color: 'var(--text-secondary)' }}>Security Level:</span>
                  <span className={`strength-label ${passwordStrength.className}`}>
                    {passwordStrength.label}
                  </span>
                </div>
                <div className="strength-meter-bars">
                  <div
                    className={`strength-meter-segment ${
                      passwordStrength.score >= 1 ? passwordStrength.className : ''
                    }`}
                  />
                  <div
                    className={`strength-meter-segment ${
                      passwordStrength.score >= 2 ? passwordStrength.className : ''
                    }`}
                  />
                  <div
                    className={`strength-meter-segment ${
                      passwordStrength.score >= 3 ? passwordStrength.className : ''
                    }`}
                  />
                  <div
                    className={`strength-meter-segment ${
                      passwordStrength.score >= 4 ? passwordStrength.className : ''
                    }`}
                  />
                </div>
              </div>
            )}

            {/* Confirm New Password Field */}
            <div className="auth-field">
              <label htmlFor="confirm-new-password" className="auth-label">
                <span>Confirm New Password</span>
              </label>
              <div className="auth-input-wrap">
                <Lock size={16} className="auth-input-icon" />
                <input
                  id="confirm-new-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={confirmPassword}
                  disabled={isLoading}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (formErrors.confirmPassword) {
                      setFormErrors((prev) => ({ ...prev, confirmPassword: '' }));
                    }
                  }}
                  placeholder="Repeat your new password"
                  className={`auth-input ${
                    formErrors.confirmPassword ? 'auth-input-error' : ''
                  } ${
                    confirmPassword && confirmPassword === password ? 'auth-input-success' : ''
                  }`}
                  style={{ paddingRight: '2.5rem' }}
                  aria-invalid={!!formErrors.confirmPassword}
                  aria-describedby={formErrors.confirmPassword ? 'confirm-password-error' : undefined}
                />
                <button
                  type="button"
                  className="auth-eye-btn"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {formErrors.confirmPassword && (
                <div className="auth-error-msg" id="confirm-password-error" role="alert">
                  <AlertCircle size={13} />
                  <span>{formErrors.confirmPassword}</span>
                </div>
              )}
            </div>

            {/* Submit Action */}
            <button
              type="submit"
              id="reset-submit-btn"
              disabled={isLoading}
              className="auth-btn-primary"
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="auth-spinner" />
                  <span>Updating Credentials...</span>
                </>
              ) : (
                <>
                  <span>Save New Password & Continue</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <div className="auth-footer">
            Remembered your credentials?{' '}
            <Link href="/login" id="link-back-login">
              Back to Sign In
            </Link>
          </div>
        </>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="auth-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '300px' }}>
          <Loader2 size={24} className="auth-spinner" style={{ color: 'var(--primary)' }} />
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
