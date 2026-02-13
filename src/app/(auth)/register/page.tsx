"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, User, ArrowRight, Check } from "lucide-react";
import { Button, Input, Checkbox, Divider, Alert } from "@/components/ui";
import { SocialButtons } from "@/components/auth/SocialButtons";

/**
 * Register Page - Following Design Guidelines
 * 
 * Spacing:
 * - Header margin-bottom: 32px
 * - Form gap: 20px between groups
 * - Section dividers: 24px margin
 * - Footer margin-top: 32px
 */
export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
    subscribeNewsletter: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    setError(null);
  };

  const validatePassword = (password: string) => {
    const requirements = [
      { met: password.length >= 8, text: "At least 8 characters" },
      { met: /[A-Z]/.test(password), text: "One uppercase letter" },
      { met: /[a-z]/.test(password), text: "One lowercase letter" },
      { met: /[0-9]/.test(password), text: "One number" },
      { met: /[^A-Za-z0-9]/.test(password), text: "One special character" },
    ];
    return requirements;
  };

  const passwordRequirements = validatePassword(formData.password);
  const isPasswordValid = passwordRequirements.every((req) => req.met);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!formData.agreeToTerms) {
      setError("You must agree to the Terms of Service and Privacy Policy");
      setIsLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    if (!isPasswordValid) {
      setError("Password does not meet the requirements");
      setIsLoading(false);
      return;
    }

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      router.push("/verify-email?email=" + encodeURIComponent(formData.email));
    } catch {
      setError("Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (provider: "google" | "github") => {
    setIsLoading(true);
    try {
      console.log(`Register with ${provider}`);
    } catch {
      setError(`Failed to register with ${provider}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="animate-slide-up">
      {/* Header - 32px margin bottom */}
      <div className="text-center lg:text-left mb-8">
        <h1 className="text-3xl font-bold text-text-primary mb-3">
          Create your account
        </h1>
        <p className="text-text-secondary text-base">
          Start your journey with premium SMS services
        </p>
      </div>

      {/* Error Alert - 24px margin bottom */}
      {error && (
        <Alert variant="error" className="mb-6" dismissible onDismiss={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Social Login */}
      <SocialButtons
        onGoogleClick={() => handleSocialLogin("google")}
        onGithubClick={() => handleSocialLogin("github")}
        isLoading={isLoading}
      />

      {/* Divider - 24px margin */}
      <Divider>or register with email</Divider>

      {/* Registration Form - 20px gap between form groups */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <Input
          label="Full name"
          type="text"
          name="name"
          placeholder="Enter your full name"
          value={formData.name}
          onChange={handleChange}
          leftIcon={<User className="w-5 h-5" />}
          required
          autoComplete="name"
        />

        <Input
          label="Email address"
          type="email"
          name="email"
          placeholder="Enter your email"
          value={formData.email}
          onChange={handleChange}
          leftIcon={<Mail className="w-5 h-5" />}
          required
          autoComplete="email"
        />

        {/* Password with requirements */}
        <div className="space-y-3">
          <Input
            label="Password"
            type="password"
            name="password"
            placeholder="Create a strong password"
            value={formData.password}
            onChange={handleChange}
            leftIcon={<Lock className="w-5 h-5" />}
            required
            autoComplete="new-password"
          />
          
          {/* Password Requirements - 12px margin top */}
          {formData.password && (
            <div className="grid grid-cols-2 gap-2 p-4 bg-bg-secondary rounded-xl border border-border-default">
              {passwordRequirements.map((req, index) => (
                <div
                  key={index}
                  className={`flex items-center gap-2 text-xs ${
                    req.met ? "text-success" : "text-text-muted"
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${
                      req.met ? "bg-success/20" : "bg-border-default"
                    }`}
                  >
                    {req.met && <Check className="w-2.5 h-2.5" />}
                  </div>
                  <span>{req.text}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <Input
          label="Confirm password"
          type="password"
          name="confirmPassword"
          placeholder="Confirm your password"
          value={formData.confirmPassword}
          onChange={handleChange}
          leftIcon={<Lock className="w-5 h-5" />}
          required
          autoComplete="new-password"
          error={
            formData.confirmPassword &&
            formData.password !== formData.confirmPassword
              ? "Passwords do not match"
              : undefined
          }
          success={
            formData.confirmPassword &&
            formData.password === formData.confirmPassword
              ? "Passwords match"
              : undefined
          }
        />

        {/* Checkboxes - 16px margin top */}
        <div className="space-y-4 mt-1">
          <Checkbox
            name="agreeToTerms"
            checked={formData.agreeToTerms}
            onChange={handleChange}
            label={
              <span>
                I agree to the{" "}
                <Link href="/terms" className="text-accent-gold hover:text-accent-gold-bright transition-colors">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="text-accent-gold hover:text-accent-gold-bright transition-colors">
                  Privacy Policy
                </Link>
              </span>
            }
          />

          <Checkbox
            name="subscribeNewsletter"
            checked={formData.subscribeNewsletter}
            onChange={handleChange}
            label="Send me product updates and promotions"
          />
        </div>

        {/* Submit button - 8px extra margin top */}
        <div className="mt-2">
          <Button
            type="submit"
            fullWidth
            size="lg"
            isLoading={isLoading}
            rightIcon={<ArrowRight className="w-5 h-5" />}
          >
            Create account
          </Button>
        </div>
      </form>

      {/* Footer - 32px margin top */}
      <p className="mt-8 text-center text-sm text-text-secondary">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-semibold text-accent-gold hover:text-accent-gold-bright transition-colors duration-150"
        >
          Sign in
        </Link>
      </p>

      {/* Benefits - 32px margin top, 24px padding top */}
      <div className="mt-8 pt-6 border-t border-border-default">
        <div className="grid grid-cols-3 gap-6 text-center">
          <div>
            <div className="text-xl font-bold text-gold-gradient">$5</div>
            <div className="text-xs text-text-muted mt-1">Free credits</div>
          </div>
          <div>
            <div className="text-xl font-bold text-gold-gradient">24/7</div>
            <div className="text-xs text-text-muted mt-1">Support</div>
          </div>
          <div>
            <div className="text-xl font-bold text-gold-gradient">0%</div>
            <div className="text-xs text-text-muted mt-1">Hidden fees</div>
          </div>
        </div>
      </div>
    </div>
  );
}
