'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { UserRole } from '@/types';
import BrandLogo from '@/components/BrandLogo';
import {
  User,
  Mail,
  Lock,
  Building,
  Briefcase,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ArrowRight,
  ShieldCheck,
  Check,
  BadgeCheck,
  Sparkles,
} from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { registerUser, employees } = useApp();

  const nextSuggestedId = useMemo(() => {
    return `AX00${employees.length + 1}`;
  }, [employees.length]);

  const [formData, setFormData] = useState({
    name: '',
    employeeId: '',
    email: '',
    department: 'Engineering',
    role: 'employee' as UserRole,
    password: '',
    confirmPassword: '',
    agreeTerms: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);

  // Dynamic Password Strength Assessment
  const passwordStrength = useMemo(() => {
    const pwd = formData.password;
    if (!pwd) return { score: 0, label: 'None', className: '' };

    let score = 0;
    if (pwd.length >= 6) score += 1;
    if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score += 1;
    if (/\d/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;

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
  }, [formData.password]);

  const passwordRequirements = useMemo(() => {
    const pwd = formData.password;
    return [
      { label: 'At least 6 characters', met: pwd.length >= 6 },
      { label: 'Uppercase & lowercase letters', met: /[A-Z]/.test(pwd) && /[a-z]/.test(pwd) },
      { label: 'At least 1 number (0-9)', met: /\d/.test(pwd) },
      { label: 'At least 1 special character', met: /[^A-Za-z0-9]/.test(pwd) },
    ];
  }, [formData.password]);

  const validate = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) {
      errors.name = 'Full name is required';
    } else if (formData.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }

    if (!formData.employeeId.trim()) {
      errors.employeeId = 'Employee ID is required (e.g. AX000)';
    } else {
      const formatted = formData.employeeId.trim().toUpperCase();
      const isTaken = employees.some(
        (e) => (e.employeeId || '').toUpperCase() === formatted || e.id.toUpperCase() === formatted
      );
      if (isTaken) {
        errors.employeeId = `Employee ID "${formatted}" is already assigned to another team member.`;
      }
    }

    if (!formData.email.trim()) {
      errors.email = 'Work email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errors.email = 'Please enter a valid work email address';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 4) {
      errors.password = 'Password must be at least 4 characters';
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Confirm your password';
    } else if (formData.confirmPassword !== formData.password) {
      errors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.agreeTerms) {
      errors.agreeTerms = 'You must agree to the Terms of Service to proceed';
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
      const res = await registerUser({
        name: formData.name,
        email: formData.email,
        employeeId: formData.employeeId.trim().toUpperCase(),
        department: formData.department,
        role: formData.role,
        password: formData.password,
      });

      if (res.success) {
        router.push('/');
      } else {
        setServerError(res.error || 'Registration failed. Please check your information.');
      }
    } catch (err: any) {
      setServerError(err?.message || 'A network error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const applySuggestedId = () => {
    setFormData((prev) => ({ ...prev, employeeId: nextSuggestedId }));
    if (formErrors.employeeId) {
      setFormErrors((prev) => ({ ...prev, employeeId: '' }));
    }
  };

  return (
    <div className="auth-card auth-card-wide">
      {/* Brand Header */}
      <div className="auth-header">
        <div style={{ marginBottom: '1.25rem' }}>
          <BrandLogo size="lg" />
        </div>
        <h1 className="auth-title">Create your account</h1>
        <p className="auth-subtitle">
          Join your organization&apos;s workspace on AyiPM to collaborate on projects and manage team deliverables.
        </p>
      </div>

      {/* Server Error Alert Banner */}
      {serverError && (
        <div className="auth-banner-error" role="alert" id="register-server-error">
          <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>{serverError}</div>
        </div>
      )}

      {/* Registration Form */}
      <form onSubmit={handleSubmit} className="auth-form" noValidate>
        {/* Row 1: Full Name & Employee ID */}
        <div className="auth-grid-2col">
          {/* Full Name */}
          <div className="auth-field">
            <label htmlFor="register-name" className="auth-label">
              <span>Full Name</span>
            </label>
            <div className="auth-input-wrap">
              <User size={16} className="auth-input-icon" />
              <input
                id="register-name"
                type="text"
                autoComplete="name"
                value={formData.name}
                disabled={isLoading}
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, name: e.target.value }));
                  if (formErrors.name) setFormErrors((prev) => ({ ...prev, name: '' }));
                }}
                placeholder="e.g. Jason Blake"
                className={`auth-input ${formErrors.name ? 'auth-input-error' : ''}`}
                aria-invalid={!!formErrors.name}
                aria-describedby={formErrors.name ? 'register-name-error' : undefined}
              />
            </div>
            {formErrors.name && (
              <div className="auth-error-msg" id="register-name-error" role="alert">
                <AlertCircle size={13} />
                <span>{formErrors.name}</span>
              </div>
            )}
          </div>

          {/* Employee ID */}
          <div className="auth-field">
            <div className="auth-label">
              <span>Employee Unique ID</span>
            </div>
            <div className="auth-input-wrap">
              <BadgeCheck size={16} className="auth-input-icon" />
              <input
                id="register-employee-id"
                type="text"
                autoCapitalize="characters"
                value={formData.employeeId}
                disabled={isLoading}
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, employeeId: e.target.value.toUpperCase() }));
                  if (formErrors.employeeId) setFormErrors((prev) => ({ ...prev, employeeId: '' }));
                }}
                placeholder={`e.g. ${nextSuggestedId}`}
                className={`auth-input ${formErrors.employeeId ? 'auth-input-error' : ''}`}
                style={{ fontFamily: 'var(--font-mono)', letterSpacing: '0.05em' }}
                aria-invalid={!!formErrors.employeeId}
                aria-describedby={formErrors.employeeId ? 'register-employee-id-error' : undefined}
              />
            </div>
            {formErrors.employeeId && (
              <div className="auth-error-msg" id="register-employee-id-error" role="alert">
                <AlertCircle size={13} />
                <span>{formErrors.employeeId}</span>
              </div>
            )}
          </div>
        </div>

        {/* Row 2: Work Email & Department */}
        <div className="auth-grid-2col">
          {/* Work Email */}
          <div className="auth-field">
            <label htmlFor="register-email" className="auth-label">
              <span>Work Email</span>
            </label>
            <div className="auth-input-wrap">
              <Mail size={16} className="auth-input-icon" />
              <input
                id="register-email"
                type="email"
                autoComplete="email"
                value={formData.email}
                disabled={isLoading}
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, email: e.target.value }));
                  if (formErrors.email) setFormErrors((prev) => ({ ...prev, email: '' }));
                }}
                placeholder="jason.blake@ayipm.io"
                className={`auth-input ${formErrors.email ? 'auth-input-error' : ''}`}
                aria-invalid={!!formErrors.email}
                aria-describedby={formErrors.email ? 'register-email-error' : undefined}
              />
            </div>
            {formErrors.email && (
              <div className="auth-error-msg" id="register-email-error" role="alert">
                <AlertCircle size={13} />
                <span>{formErrors.email}</span>
              </div>
            )}
          </div>

          {/* Department */}
          <div className="auth-field">
            <label htmlFor="register-dept" className="auth-label">
              <span>Department</span>
            </label>
            <div className="auth-input-wrap">
              <Building size={16} className="auth-input-icon" />
              <select
                id="register-dept"
                value={formData.department}
                disabled={isLoading}
                onChange={(e) => setFormData((prev) => ({ ...prev, department: e.target.value }))}
                className="auth-input"
                style={{ cursor: 'pointer' }}
              >
                <option value="Engineering">Engineering</option>
                <option value="Product">Product Management</option>
                <option value="Design">UI/UX Design</option>
                <option value="Marketing">Marketing & Growth</option>
                <option value="Human Resources">Human Resources</option>
                <option value="Finance">Finance & Operations</option>
              </select>
            </div>
          </div>
        </div>

        {/* Row 3: Role Selector */}
        <div className="auth-field">
          <label htmlFor="register-role" className="auth-label">
            <span>Workspace Account Role</span>
          </label>
          <div className="auth-input-wrap">
            <Briefcase size={16} className="auth-input-icon" />
            <select
              id="register-role"
              value={formData.role}
              disabled={isLoading}
              onChange={(e) => setFormData((prev) => ({ ...prev, role: e.target.value as UserRole }))}
              className="auth-input"
              style={{ cursor: 'pointer' }}
            >
              <option value="employee">Employee / Contributor</option>
              <option value="project_manager">Project Manager</option>
              <option value="admin">System Administrator</option>
            </select>
          </div>
        </div>

        {/* Row 4: Password & Confirm Password */}
        <div className="auth-grid-2col">
          {/* Password */}
          <div className="auth-field">
            <div className="auth-label">
              <span>Password</span>
            </div>
            <div className="auth-input-wrap">
              <Lock size={16} className="auth-input-icon" />
              <input
                id="register-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                value={formData.password}
                disabled={isLoading}
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, password: e.target.value }));
                  if (formErrors.password) setFormErrors((prev) => ({ ...prev, password: '' }));
                }}
                placeholder="e.g. 123456"
                className={`auth-input ${formErrors.password ? 'auth-input-error' : ''}`}
                style={{ paddingRight: '2.5rem' }}
                aria-invalid={!!formErrors.password}
                aria-describedby={formErrors.password ? 'register-password-error' : undefined}
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
              <div className="auth-error-msg" id="register-password-error" role="alert">
                <AlertCircle size={13} />
                <span>{formErrors.password}</span>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div className="auth-field">
            <label htmlFor="register-confirm-password" className="auth-label">
              <span>Confirm Password</span>
            </label>
            <div className="auth-input-wrap">
              <Lock size={16} className="auth-input-icon" />
              <input
                id="register-confirm-password"
                type={showConfirmPassword ? 'text' : 'password'}
                autoComplete="new-password"
                value={formData.confirmPassword}
                disabled={isLoading}
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, confirmPassword: e.target.value }));
                  if (formErrors.confirmPassword) {
                    setFormErrors((prev) => ({ ...prev, confirmPassword: '' }));
                  }
                }}
                placeholder="Repeat password"
                className={`auth-input ${
                  formErrors.confirmPassword ? 'auth-input-error' : ''
                } ${
                  formData.confirmPassword && formData.confirmPassword === formData.password
                    ? 'auth-input-success'
                    : ''
                }`}
                style={{ paddingRight: '2.5rem' }}
                aria-invalid={!!formErrors.confirmPassword}
                aria-describedby={formErrors.confirmPassword ? 'register-confirm-password-error' : undefined}
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
              <div className="auth-error-msg" id="register-confirm-password-error" role="alert">
                <AlertCircle size={13} />
                <span>{formErrors.confirmPassword}</span>
              </div>
            )}
          </div>
        </div>

        {/* Live Password Strength Meter */}
        {formData.password && (
          <div className="strength-meter-wrap">
            <div className="strength-meter-info">
              <span style={{ color: 'var(--text-secondary)' }}>Security Strength:</span>
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

            {/* Checklist */}
            <div className="password-rules-list">
              {passwordRequirements.map((req, idx) => (
                <div
                  key={idx}
                  className={`password-rule-item ${req.met ? 'valid' : ''}`}
                >
                  {req.met ? (
                    <Check size={12} style={{ color: 'var(--success)', flexShrink: 0 }} />
                  ) : (
                    <div
                      style={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        border: '1px solid var(--border-medium)',
                        flexShrink: 0,
                      }}
                    />
                  )}
                  <span>{req.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Terms and Conditions Checkbox */}
        <div className="auth-field" style={{ marginTop: '0.25rem' }}>
          <label className="auth-checkbox-wrap" style={{ alignItems: 'flex-start' }}>
            <input
              type="checkbox"
              id="agree-terms"
              checked={formData.agreeTerms}
              onChange={(e) => {
                setFormData((prev) => ({ ...prev, agreeTerms: e.target.checked }));
                if (formErrors.agreeTerms) {
                  setFormErrors((prev) => ({ ...prev, agreeTerms: '' }));
                }
              }}
              className="auth-checkbox"
              style={{ marginTop: '2px' }}
            />
            <span className="auth-checkbox-label">
              I agree to the AyiPM{' '}
              <span style={{ color: 'var(--primary)', fontWeight: 600 }}>Terms of Service</span> and{' '}
              <span style={{ color: 'var(--primary)', fontWeight: 600 }}>Privacy Policy</span>.
            </span>
          </label>
          {formErrors.agreeTerms && (
            <div className="auth-error-msg" id="register-terms-error" role="alert">
              <AlertCircle size={13} />
              <span>{formErrors.agreeTerms}</span>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          id="register-submit-btn"
          disabled={isLoading}
          className="auth-btn-primary"
        >
          {isLoading ? (
            <>
              <Loader2 size={18} className="auth-spinner" />
              <span>Provisioning {formData.employeeId || 'Badge'} Account...</span>
            </>
          ) : (
            <>
              <span>Create Account & Sign In</span>
              <ArrowRight size={16} />
            </>
          )}
        </button>
      </form>

      {/* Footer Navigation */}
      <div className="auth-footer">
        Already have an account?{' '}
        <Link href="/login" id="link-to-login">
          Sign in with Employee ID
        </Link>
      </div>
    </div>
  );
}
