'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import BrandLogo from '@/components/BrandLogo';
import {
  BadgeCheck,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  ArrowRight,
  ShieldCheck,
  UserCheck,
  Sparkles,
  CheckCircle2,
  Building,
  User,
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login, findEmployeeByIdOrEmail } = useApp();

  const [employeeId, setEmployeeId] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<{ employeeId?: string; password?: string }>({});
  const [authError, setAuthError] = useState<string | null>(null);

  // Live lookup: if user inputs a correct ID, look up and preview profile immediately
  const matchedEmployee = useMemo(() => {
    if (!employeeId || employeeId.trim().length === 0) return null;
    return findEmployeeByIdOrEmail(employeeId);
  }, [employeeId, findEmployeeByIdOrEmail]);

  // Validate form
  const validate = (): boolean => {
    const errors: { employeeId?: string; password?: string } = {};

    if (!employeeId.trim()) {
      errors.employeeId = 'Employee ID is required (e.g. AX001, AX002, or AX000)';
    }

    if (!password.trim()) {
      errors.password = 'Password is required (enter any password for testing)';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    if (!validate()) {
      return;
    }

    setIsLoading(true);
    try {
      const res = await login(employeeId, password);
      if (res.success) {
        router.push('/');
      } else {
        setAuthError(res.error || 'Failed to authenticate. Please check your credentials.');
      }
    } catch (err: any) {
      setAuthError(err?.message || 'A network error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Demo auto-fill helper
  const handleQuickFill = (idVal: string) => {
    setEmployeeId(idVal);
    setPassword('123456');
    setFormErrors({});
    setAuthError(null);
  };

  return (
    <div className="auth-card">
      {/* Brand Header */}
      <div className="auth-header">
        <div style={{ marginBottom: '1.25rem' }}>
          <BrandLogo size="lg" />
        </div>
        <h1 className="auth-title">Welcome back</h1>
        <p className="auth-subtitle">
          Enter your unique Employee ID to access your AyiPM workspace and team sprint dashboard.
        </p>
      </div>

      {/* Global Server/Auth Error Banner */}
      {authError && (
        <div className="auth-banner-error" role="alert" id="login-auth-error">
          <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>{authError}</div>
        </div>
      )}

      {/* Main Login Form */}
      <form onSubmit={handleSubmit} className="auth-form" noValidate>
        {/* Employee ID Field */}
        <div className="auth-field">
          <label htmlFor="login-employee-id" className="auth-label">
            <span>Employee Unique ID</span>
          </label>
          <div className="auth-input-wrap">
            <BadgeCheck size={16} className="auth-input-icon" />
            <input
              id="login-employee-id"
              type="text"
              autoComplete="username"
              autoCapitalize="characters"
              value={employeeId}
              disabled={isLoading}
              onChange={(e) => {
                setEmployeeId(e.target.value.toUpperCase());
                if (formErrors.employeeId) {
                  setFormErrors((prev) => ({ ...prev, employeeId: undefined }));
                }
              }}
              placeholder="AX000"
              className={`auth-input ${formErrors.employeeId ? 'auth-input-error' : ''} ${
                matchedEmployee ? 'auth-input-success' : ''
              }`}
              style={{ fontFamily: 'var(--font-mono)', letterSpacing: '0.05em' }}
              aria-invalid={!!formErrors.employeeId}
              aria-describedby={formErrors.employeeId ? 'login-employee-id-error' : undefined}
            />
          </div>

          {/* Inline Validation Error */}
          {formErrors.employeeId && (
            <div className="auth-error-msg" id="login-employee-id-error" role="alert">
              <AlertCircle size={13} />
              <span>{formErrors.employeeId}</span>
            </div>
          )}

          {/* LIVE DETECTED PROFILE PREVIEW UNDER ID INPUT BAR */}
          {matchedEmployee && (
            <div
              className="employee-id-profile-preview"
              id="employee-profile-preview"
              role="region"
              aria-label="Detected Employee Profile"
            >
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <img
                  src={matchedEmployee.avatar}
                  alt={matchedEmployee.name}
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '2px solid var(--primary)',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.12)',
                    display: 'block',
                  }}
                />
                <span
                  title="Active Verified Account"
                  style={{
                    position: 'absolute',
                    bottom: '-1px',
                    right: '-1px',
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    background: '#10b981',
                    border: '2px solid var(--bg-card)',
                  }}
                />
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-primary)' }}>
                    {matchedEmployee.name}
                  </span>
                  <span
                    className="badge badge-success"
                    style={{
                      fontSize: '0.65rem',
                      padding: '0.1rem 0.45rem',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.2rem',
                    }}
                  >
                    <CheckCircle2 size={11} />
                    Verified ID
                  </span>
                </div>

                <div
                  style={{
                    fontSize: '0.78rem',
                    color: 'var(--text-secondary)',
                    marginTop: '2px',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {matchedEmployee.designation} · {matchedEmployee.department}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.35rem' }}>
                  <span
                    style={{
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      fontFamily: 'var(--font-mono)',
                      background: 'var(--primary-glow)',
                      color: 'var(--primary)',
                      padding: '0.1rem 0.45rem',
                      borderRadius: 'var(--radius-sm)',
                    }}
                  >
                    {matchedEmployee.employeeId || matchedEmployee.id}
                  </span>
                  <span
                    style={{
                      fontSize: '0.7rem',
                      color: 'var(--text-muted)',
                      textTransform: 'capitalize',
                      fontWeight: 500,
                    }}
                  >
                    {matchedEmployee.role.replace('_', ' ')}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Hint when not matched yet */}
          {!matchedEmployee && employeeId.trim().length >= 3 && (
            <div
              style={{
                fontSize: '0.75rem',
                color: 'var(--text-muted)',
                marginTop: '0.35rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
              }}
            >
              <span>Tip: Available IDs include <strong>AX001</strong>, <strong>AX002</strong>, <strong>AX003</strong>, or <strong>AX000</strong></span>
            </div>
          )}
        </div>

        {/* Password Field */}
        <div className="auth-field">
          <div className="auth-label">
            <span>Password</span>
          </div>
          <div className="auth-input-wrap">
            <Lock size={16} className="auth-input-icon" />
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              value={password}
              disabled={isLoading}
              onChange={(e) => {
                setPassword(e.target.value);
                if (formErrors.password) {
                  setFormErrors((prev) => ({ ...prev, password: undefined }));
                }
              }}
              placeholder="Enter password"
              className={`auth-input ${formErrors.password ? 'auth-input-error' : ''}`}
              style={{ paddingRight: '2.5rem' }}
              aria-invalid={!!formErrors.password}
              aria-describedby={formErrors.password ? 'login-password-error' : undefined}
            />
            <button
              type="button"
              className="auth-eye-btn"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              title={showPassword ? 'Hide password' : 'Show password'}
              tabIndex={0}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {formErrors.password && (
            <div className="auth-error-msg" id="login-password-error" role="alert">
              <AlertCircle size={13} />
              <span>{formErrors.password}</span>
            </div>
          )}
        </div>

        {/* Remember Me Checkbox & Forgot Password Link */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <label className="auth-checkbox-wrap">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="auth-checkbox"
              id="remember-me"
            />
            <span className="auth-checkbox-label">Keep me signed in</span>
          </label>
          <Link href="/forgot-password" className="auth-link" tabIndex={0}>
            Forgot password?
          </Link>
        </div>

        {/* Submit Button with Loading State */}
        <button
          type="submit"
          id="login-submit-btn"
          disabled={isLoading}
          className="auth-btn-primary"
        >
          {isLoading ? (
            <>
              <Loader2 size={18} className="auth-spinner" />
              <span>Verifying Employee Session...</span>
            </>
          ) : (
            <>
              <span>Sign In as {matchedEmployee ? matchedEmployee.name.split(' ')[0] : 'Employee'}</span>
              <ArrowRight size={16} />
            </>
          )}
        </button>
      </form>

      {/* Footer Navigation */}
      <div className="auth-footer">
        Don&apos;t have an account?{' '}
        <Link href="/register" id="link-to-register">
          Register with Employee ID
        </Link>
      </div>
    </div>
  );
}
