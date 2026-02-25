"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { 
  Menu, 
  X, 
  MessageSquare, 
  ChevronDown,
  Zap,
  Shield,
  Globe,
  CreditCard,
  BookOpen,
  HelpCircle,
  Phone,
  Users,
  Star,
  FileText,
  PenTool,
  Activity,
  Info
} from "lucide-react";

const navigation = [
  { name: "Home", href: "/" },
  { 
    name: "Services", 
    href: "#",
    children: [
      { name: "SMS Activation", href: "/activate", icon: MessageSquare, description: "Get instant verification codes" },
      { name: "Rent Numbers", href: "/rent", icon: Phone, description: "Long-term number rental" },
      { name: "API Access", href: "/api-docs", icon: Zap, description: "Developer API integration" },
    ]
  },
  { name: "Pricing", href: "/pricing-public" },
  { name: "Features", href: "/features" },
  { 
    name: "Resources", 
    href: "#",
    children: [
      { name: "Blog", href: "/blog", icon: PenTool, description: "Latest news & tutorials" },
      { name: "FAQ", href: "/faq", icon: HelpCircle, description: "Common questions" },
      { name: "Documentation", href: "/api-docs", icon: BookOpen, description: "API guides & examples" },
      { name: "Status", href: "/status", icon: Activity, description: "System uptime" },
    ]
  },
  { 
    name: "Company", 
    href: "#",
    children: [
      { name: "About Us", href: "/about", icon: Users, description: "Our story & mission" },
      { name: "Contact", href: "/contact", icon: Phone, description: "Get in touch" },
      { name: "Reviews", href: "/reviews", icon: Star, description: "Customer testimonials" },
    ]
  },
];

export const PublicHeader: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isActive = (href: string) => pathname === href;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-bg-primary/95 backdrop-blur-xl border-b border-border-default shadow-lg"
          : "bg-transparent"
      }`}
    >
      <nav className="container mx-auto px-6 lg:px-12">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-10 h-10 rounded-xl bg-gold-gradient flex items-center justify-center shadow-gold group-hover:shadow-gold-lg transition-shadow duration-300">
              <MessageSquare className="w-5 h-5 text-bg-primary" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-success rounded-full border-2 border-bg-primary animate-pulse" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold text-text-primary tracking-tight">
                Best<span className="text-gold-gradient">SMS</span>HQ
              </span>
              <span className="text-[10px] text-text-muted -mt-1 tracking-wider uppercase">
                Premium Verification
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {navigation.map((item) => (
              <div
                key={item.name}
                className="relative"
                onMouseEnter={() => item.children && setOpenDropdown(item.name)}
                onMouseLeave={() => setOpenDropdown(null)}
              >
                {item.children ? (
                  <button
                    className={`flex items-center gap-1 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                      openDropdown === item.name
                        ? "text-accent-gold bg-bg-hover"
                        : "text-text-secondary hover:text-text-primary hover:bg-bg-hover"
                    }`}
                  >
                    {item.name}
                    <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${
                      openDropdown === item.name ? "rotate-180" : ""
                    }`} />
                  </button>
                ) : (
                  <Link
                    href={item.href}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                      isActive(item.href)
                        ? "text-accent-gold bg-bg-hover"
                        : "text-text-secondary hover:text-text-primary hover:bg-bg-hover"
                    }`}
                  >
                    {item.name}
                  </Link>
                )}

                {/* Dropdown Menu */}
                {item.children && openDropdown === item.name && (
                  <div className="absolute top-full left-0 pt-2 animate-fade-in">
                    <div className="bg-bg-elevated border border-border-default rounded-2xl shadow-xl p-2 min-w-[280px]">
                      {item.children.map((child) => (
                        <Link
                          key={child.name}
                          href={child.href}
                          className="flex items-start gap-3 p-3 rounded-xl hover:bg-bg-hover transition-colors duration-200 group"
                        >
                          <div className="w-10 h-10 rounded-lg bg-bg-secondary flex items-center justify-center group-hover:bg-accent-gold/10 transition-colors duration-200">
                            <child.icon className="w-5 h-5 text-accent-gold" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-text-primary group-hover:text-accent-gold transition-colors duration-200">
                              {child.name}
                            </div>
                            <div className="text-xs text-text-muted mt-0.5">
                              {child.description}
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="hidden lg:flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Sign In
              </Button>
            </Link>
            <Link href="/register">
              <Button variant="primary" size="sm">
                Get Started
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg hover:bg-bg-hover transition-colors duration-200"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6 text-text-primary" />
            ) : (
              <Menu className="w-6 h-6 text-text-primary" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-border-default animate-fade-in">
            <div className="flex flex-col gap-2">
              {navigation.map((item) => (
                <div key={item.name}>
                  {item.children ? (
                    <div className="space-y-1">
                      <div className="px-4 py-2 text-sm font-medium text-text-muted">
                        {item.name}
                      </div>
                      {item.children.map((child) => (
                        <Link
                          key={child.name}
                          href={child.href}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-bg-hover transition-colors duration-200"
                        >
                          <child.icon className="w-5 h-5 text-accent-gold" />
                          <span className="text-sm text-text-primary">{child.name}</span>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <Link
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`block px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${
                        isActive(item.href)
                          ? "text-accent-gold bg-bg-hover"
                          : "text-text-primary hover:bg-bg-hover"
                      }`}
                    >
                      {item.name}
                    </Link>
                  )}
                </div>
              ))}
              <div className="flex flex-col gap-2 pt-4 mt-2 border-t border-border-default">
                <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="secondary" fullWidth>
                    Sign In
                  </Button>
                </Link>
                <Link href="/register" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="primary" fullWidth>
                    Get Started
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

