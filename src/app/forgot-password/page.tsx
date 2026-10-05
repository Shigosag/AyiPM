'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import BrandLogo from '@/components/BrandLogo';
import {
  BadgeCheck,
  KeyRound,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ArrowLeft,
  ArrowRight,
  ExternalLink,
  RotateCcw,
} from 'lucide-react';

export default function ForgotPasswordPage() {
  const { requestPasswordReset, findEmployeeByIdOrEmail } = useApp();

  const [identifier, setIdentifier] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [inputError, setInputError] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const matchedEmployee = useMemo(() => {
    if (!identifier || identifier.trim().length === 0) return null;
    return findEmployeeByIdOrEmail(identifier);
  }, [identifier, findEmployeeByIdOrEmail]);

  const validate = (): boolean => {
    if (!identifier.trim()) {
      setInputError('Please enter your Employee ID (e.g. AX001) or work email');
      return false;
    }
    setInputError(null);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    if (!validate()) {
      return;
    }

    setIsLoading(true);
    try {
      const res = await requestPasswordReset(identifier);
      if (res.success) {
        setIsSubmitted(true);
        setResendCooldown(30);
      } else {
        setServerError(res.error || 'Unable to locate an account associated with this Employee ID.');
      }
    } catch (err: any) {
      setServerError(err?.message || 'A network error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || isLoading) return;
    setIsLoading(true);
    try {
      await requestPasswordReset(identifier);
      setResendCooldown(30);
    } finally {
      setIsLoading(false);
    }
  };

  // Cooldown effect
  React.useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  return (
    <div className="auth-card">
      {/* Brand Header */}
      <div className="auth-header">
        <div style={{ marginBottom: '1.25rem' }}>
          <BrandLogo size="lg" />
        </div>
        <div className="auth-header-icon">
          <KeyRound size={22} />
        </div>
        <h1 className="auth-title">Reset your password</h1>
        <p className="auth-subtitle">
          Enter your Employee ID or work email and we&apos;ll send instructions to safely recover your credentials.
        </p>
      </div>

      {/* Success View */}
      {isSubmitted ? (
        <div className="auth-success-card">
          <div className="auth-success-icon-wrap">
            <CheckCircle2 size={32} />
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
            Instructions Dispatched
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', textAlign: 'center', lineHeight: 1.5, marginBottom: '1.5rem' }}>
            We have dispatched password recovery instructions for{' '}
            <strong style={{ color: 'var(--text-primary)' }}>
              {matchedEmployee ? `${matchedEmployee.name} [${matchedEmployee.employeeId || matchedEmployee.id}]` : identifier}
            </strong>.
          </p>

          {/* Direct simulation link for instant testing */}
          <div
            style={{
              width: '100%',
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '1rem',
              marginBottom: '1.25rem',
              textAlign: 'left',
            }}
          >
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Testing Shortcut
            </div>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
              In this environment, you can jump directly to the password reset form with your ID preloaded:
            </p>
            <Link
              href={`/reset-password?id=${encodeURIComponent(matchedEmployee?.employeeId || identifier)}`}
              className="auth-btn-primary"
              style={{ height: '38px', fontSize: '0.85rem', textDecoration: 'none' }}
              id="simulate-reset-link"
            >
              <span>Open Reset Password Form</span>
              <ExternalLink size={14} />
            </Link>
          </div>

          {/* Resend actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%' }}>
            <button
              type="button"
              onClick={handleResend}
              disabled={resendCooldown > 0 || isLoading}
              className="btn btn-secondary"
              style={{ width: '100%', height: '42px', justifyContent: 'center' }}
            >
              {isLoading ? (
                <>
                  <Loader2 size={16} className="auth-spinner" />
                  <span>Resending...</span>
                </>
              ) : resendCooldown > 0 ? (
                <span>Resend in {resendCooldown}s</span>
              ) : (
                <>
                  <RotateCcw size={15} />
                  <span>Resend Recovery Instructions</span>
                </>
              )}
            </button>

            <Link
              href="/login"
              className="btn btn-ghost"
              style={{ width: '100%', height: '42px', justifyContent: 'center', textDecoration: 'none' }}
            >
              <ArrowLeft size={16} />
              <span>Back to Sign In</span>
            </Link>
          </div>
        </div>
      ) : (
        /* Input Form View */
        <>
          {serverError && (
            <div className="auth-banner-error" role="alert" id="forgot-password-error">
              <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>{serverError}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form" noValidate>
            <div className="auth-field">
              <label htmlFor="forgot-identifier" className="auth-label">
                <span>Employee ID or Work Email</span>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Try AX001 or AX000</span>
              </label>
              <div className="auth-input-wrap">
                <BadgeCheck size={16} className="auth-input-icon" />
                <input
                  id="forgot-identifier"
                  type="text"
                  autoComplete="username"
                  value={identifier}
                  disabled={isLoading}
                  onChange={(e) => {
                    setIdentifier(e.target.value);
                    if (inputError) setInputError(null);
                  }}
                  placeholder="e.g. AX001, AX000, or sarah.chen@ayipm.io"
                  className={`auth-input ${inputError ? 'auth-input-error' : ''} ${
                    matchedEmployee ? 'auth-input-success' : ''
                  }`}
                  aria-invalid={!!inputError}
                  aria-describedby={inputError ? 'forgot-identifier-error' : undefined}
                />
              </div>
              {inputError && (
                <div className="auth-error-msg" id="forgot-identifier-error" role="alert">
                  <AlertCircle size={13} />
                  <span>{inputError}</span>
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

            <button
              type="submit"
              id="forgot-submit-btn"
              disabled={isLoading}
              className="auth-btn-primary"
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="auth-spinner" />
                  <span>Sending Instructions...</span>
                </>
              ) : (
                <>
                  <span>Send Reset Instructions</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <div className="auth-footer">
            Remember your credentials?{' '}
            <Link href="/login" id="link-back-login">
              Back to Sign In
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
