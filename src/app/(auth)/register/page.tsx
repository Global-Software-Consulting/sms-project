"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Mail, Lock, User, ArrowRight, Check, Globe, AtSign } from "lucide-react";
import { Button, Input, Checkbox, Divider, Alert } from "@/components/ui";
import { SocialButtons } from "@/components/auth/SocialButtons";
import { useAuth } from "@/hooks";

/**
 * Register Page - Premium SMS Activation Platform
 * 
 * SPACING (Design Guidelines 6.3.1):
 * - Header margin-bottom: 32px
 * - Social buttons margin-bottom: 24px
 * - Divider margin: 24px vertical
 * - Form fields gap: 20px
 * - Submit margin-top: 24px
 * - Footer margin-top: 32px
 */
export default function RegisterPage() {
  const {
    register,
    loginWithGoogle,
    loginWithGithub,
    isLoading,
    error: authError,
    clearError,
  } = useAuth();

  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    country: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
    subscribeNewsletter: false,
  });

  useEffect(() => {
    if (authError) {
      setError(authError);
    }
  }, [authError]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    setError(null);
    clearError();
  };

  const validatePassword = (password: string) => {
    return [
      { met: password.length >= 10, text: "At least 10 characters" },
      { met: /[A-Z]/.test(password), text: "One uppercase letter" },
      { met: /[a-z]/.test(password), text: "One lowercase letter" },
      { met: /[0-9]/.test(password), text: "One number" },
    ];
  };

  const passwordRequirements = validatePassword(formData.password);
  const isPasswordValid = passwordRequirements.every((req) => req.met);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.agreeToTerms) {
      setError("You must agree to the Terms of Service and Privacy Policy");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (!isPasswordValid) {
      setError("Password does not meet the requirements");
      return;
    }

    const result = await register({
      firstName: formData.firstName,
      lastName: formData.lastName,
      username: formData.username.trim() || undefined,
      email: formData.email,
      country: formData.country,
      password: formData.password,
    });

    if (!result.success) {
      setError(result.error || "Registration failed. Please try again.");
    }
  };

  const handleDismissError = () => {
    setError(null);
    clearError();
  };

  return (
    <div className="animate-slide-up">
      {/* Header - mb: 32px */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ 
          fontSize: '28px', 
          fontWeight: 700, 
          color: 'var(--text-primary)', 
          lineHeight: 1.2, 
          marginBottom: '12px' 
        }} className="sm:!text-[32px]">
          Create your account
        </h1>
        <p style={{ fontSize: '16px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
          Start your journey with premium SMS services
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <div style={{ marginBottom: '24px' }}>
          <Alert variant="error" dismissible onDismiss={handleDismissError}>
            {error}
          </Alert>
        </div>
      )}

      {/* Social Buttons - mb: 24px */}
      <div style={{ marginBottom: '24px' }}>
        <SocialButtons
          onGoogleClick={loginWithGoogle}
          onGithubClick={loginWithGithub}
          isLoading={isLoading}
        />
      </div>

      {/* Divider - my: 24px */}
      <div style={{ margin: '24px 0' }}>
        <Divider>or register with email</Divider>
      </div>

      {/* Form - gap: 20px */}
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Name Row - 2 columns on sm+ */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Input
              label="First name"
              type="text"
              name="firstName"
              placeholder="John"
              value={formData.firstName}
              onChange={handleChange}
              leftIcon={<User style={{ width: '20px', height: '20px' }} />}
              required
              autoComplete="given-name"
              disabled={isLoading}
            />
            <Input
              label="Last name"
              type="text"
              name="lastName"
              placeholder="Doe"
              value={formData.lastName}
              onChange={handleChange}
              required
              autoComplete="family-name"
              disabled={isLoading}
            />
          </div>

          {/* Username (Optional) */}
          <Input
            label="Username (optional)"
            type="text"
            name="username"
            placeholder="johndoe123"
            value={formData.username}
            onChange={handleChange}
            leftIcon={<AtSign style={{ width: '20px', height: '20px' }} />}
            autoComplete="username"
            disabled={isLoading}
            hint="3-24 chars, letters, numbers, dots, and underscores only"
          />

          {/* Email */}
          <Input
            label="Email address"
            type="email"
            name="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleChange}
            leftIcon={<Mail style={{ width: '20px', height: '20px' }} />}
            required
            autoComplete="email"
            disabled={isLoading}
          />

          {/* Country */}
          <Input
            label="Country"
            type="text"
            name="country"
            placeholder="United States"
            value={formData.country}
            onChange={handleChange}
            leftIcon={<Globe style={{ width: '20px', height: '20px' }} />}
            required
            autoComplete="country-name"
            disabled={isLoading}
          />

          {/* Password */}
          <div>
            <Input
              label="Password"
              type="password"
              name="password"
              placeholder="Create a strong password"
              value={formData.password}
              onChange={handleChange}
              leftIcon={<Lock style={{ width: '20px', height: '20px' }} />}
              required
              autoComplete="new-password"
              disabled={isLoading}
            />
            
            {/* Password Requirements */}
            {formData.password && (
              <div style={{ 
                marginTop: '12px', 
                display: 'grid', 
                gridTemplateColumns: '1fr 1fr', 
                gap: '8px', 
                padding: '16px', 
                backgroundColor: 'var(--bg-secondary)', 
                borderRadius: '12px', 
                border: '1px solid var(--border-default)' 
              }}>
                {passwordRequirements.map((req, index) => (
                  <div
                    key={index}
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '8px', 
                      fontSize: '12px', 
                      color: req.met ? 'var(--success)' : 'var(--text-muted)' 
                    }}
                  >
                    <div
                      style={{ 
                        width: '16px', 
                        height: '16px', 
                        borderRadius: '50%', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        flexShrink: 0,
                        backgroundColor: req.met ? 'rgba(34, 197, 94, 0.2)' : 'var(--border-default)' 
                      }}
                    >
                      {req.met && <Check style={{ width: '10px', height: '10px' }} />}
                    </div>
                    <span>{req.text}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <Input
            label="Confirm password"
            type="password"
            name="confirmPassword"
            placeholder="Confirm your password"
            value={formData.confirmPassword}
            onChange={handleChange}
            leftIcon={<Lock style={{ width: '20px', height: '20px' }} />}
            required
            autoComplete="new-password"
            disabled={isLoading}
            error={
              formData.confirmPassword && formData.password !== formData.confirmPassword
                ? "Passwords do not match"
                : undefined
            }
            success={
              formData.confirmPassword && formData.password === formData.confirmPassword
                ? "Passwords match"
                : undefined
            }
          />

          {/* Checkboxes */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <Checkbox
              name="agreeToTerms"
              checked={formData.agreeToTerms}
              onChange={handleChange}
              disabled={isLoading}
              label={
                <span>
                  I agree to the{" "}
                  <Link href="/terms" style={{ color: 'var(--accent-gold)' }}>
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link href="/privacy" style={{ color: 'var(--accent-gold)' }}>
                    Privacy Policy
                  </Link>
                </span>
              }
            />
            <Checkbox
              name="subscribeNewsletter"
              checked={formData.subscribeNewsletter}
              onChange={handleChange}
              disabled={isLoading}
              label="Send me product updates and promotions"
            />
          </div>

          {/* Submit - mt: 24px (extra 4px from gap) */}
          <div style={{ marginTop: '4px' }}>
            <Button
              type="submit"
              fullWidth
              size="lg"
              isLoading={isLoading}
              rightIcon={<ArrowRight style={{ width: '20px', height: '20px' }} />}
            >
              Create account
            </Button>
          </div>
        </div>
      </form>

      {/* Footer - mt: 32px */}
      <p style={{ marginTop: '32px', textAlign: 'center', fontSize: '14px', color: 'var(--text-secondary)' }}>
        Already have an account?{" "}
        <Link
          href="/login"
          style={{ fontWeight: 600, color: 'var(--accent-gold)', textDecoration: 'none' }}
        >
          Sign in
        </Link>
      </p>

      {/* Benefits - mt: 32px, pt: 24px */}
      <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid var(--border-default)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', textAlign: 'center' }}>
          <div>
            <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--accent-gold)' }}>$5</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>Free credits</div>
          </div>
          <div>
            <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--accent-gold)' }}>24/7</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>Support</div>
          </div>
          <div>
            <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--accent-gold)' }}>0%</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>Hidden fees</div>
          </div>
        </div>
      </div>
    </div>
  );
}
