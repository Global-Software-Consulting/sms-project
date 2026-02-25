"use client";

import React, { useState, useEffect } from "react";
import {
  CheckCircle,
  AlertTriangle,
  XCircle,
  Clock,
  Activity,
  Server,
  Globe,
  CreditCard,
  MessageSquare,
  RefreshCw,
  ChevronDown,
  Zap,
} from "lucide-react";

// Status types
type StatusType = "operational" | "degraded" | "partial" | "major" | "maintenance";

interface ServiceStatus {
  name: string;
  status: StatusType;
  uptime: number;
  responseTime: number;
  icon: React.ElementType;
  description: string;
}

interface Incident {
  id: string;
  title: string;
  status: "investigating" | "identified" | "monitoring" | "resolved";
  severity: "minor" | "major" | "critical";
  createdAt: string;
  updatedAt: string;
  updates: {
    time: string;
    message: string;
    status: string;
  }[];
}

// Mock data - In production, this would come from an API
const services: ServiceStatus[] = [
  {
    name: "SMS Activation API",
    status: "operational",
    uptime: 99.99,
    responseTime: 45,
    icon: MessageSquare,
    description: "Core SMS verification service",
  },
  {
    name: "Number Rental Service",
    status: "operational",
    uptime: 99.95,
    responseTime: 52,
    icon: Clock,
    description: "Long-term number rental",
  },
  {
    name: "Payment Processing",
    status: "operational",
    uptime: 99.98,
    responseTime: 120,
    icon: CreditCard,
    description: "All payment gateways",
  },
  {
    name: "User Dashboard",
    status: "operational",
    uptime: 99.99,
    responseTime: 35,
    icon: Activity,
    description: "Web application",
  },
  {
    name: "Provider: 5sim (V1)",
    status: "operational",
    uptime: 99.90,
    responseTime: 85,
    icon: Server,
    description: "Standard Activation",
  },
  {
    name: "Provider: SMS-Man (V2)",
    status: "operational",
    uptime: 99.85,
    responseTime: 92,
    icon: Server,
    description: "Premium Activation",
  },
  {
    name: "Provider: Hero-SMS (V3)",
    status: "degraded",
    uptime: 98.50,
    responseTime: 150,
    icon: Server,
    description: "Backup Provider",
  },
  {
    name: "Global CDN",
    status: "operational",
    uptime: 99.99,
    responseTime: 15,
    icon: Globe,
    description: "Content delivery",
  },
];

// Mock incidents
const recentIncidents: Incident[] = [
  {
    id: "inc-001",
    title: "Elevated response times on Hero-SMS provider",
    status: "monitoring",
    severity: "minor",
    createdAt: "2026-02-23T10:30:00Z",
    updatedAt: "2026-02-23T11:45:00Z",
    updates: [
      {
        time: "2026-02-23T11:45:00Z",
        message: "Response times are improving. Continuing to monitor.",
        status: "monitoring",
      },
      {
        time: "2026-02-23T11:00:00Z",
        message: "Issue identified with upstream provider. Working on mitigation.",
        status: "identified",
      },
      {
        time: "2026-02-23T10:30:00Z",
        message: "We are investigating elevated response times on the Hero-SMS provider.",
        status: "investigating",
      },
    ],
  },
];

// Past incidents (resolved)
const pastIncidents: Incident[] = [
  {
    id: "inc-000",
    title: "Scheduled maintenance completed",
    status: "resolved",
    severity: "minor",
    createdAt: "2026-02-20T02:00:00Z",
    updatedAt: "2026-02-20T04:00:00Z",
    updates: [
      {
        time: "2026-02-20T04:00:00Z",
        message: "Maintenance completed successfully. All systems operational.",
        status: "resolved",
      },
      {
        time: "2026-02-20T02:00:00Z",
        message: "Starting scheduled maintenance. Some services may be briefly unavailable.",
        status: "investigating",
      },
    ],
  },
];

// Status helpers
const getStatusColor = (status: StatusType) => {
  switch (status) {
    case "operational":
      return "text-success";
    case "degraded":
      return "text-warning";
    case "partial":
      return "text-orange-500";
    case "major":
      return "text-danger";
    case "maintenance":
      return "text-info";
    default:
      return "text-text-muted";
  }
};

const getStatusBgColor = (status: StatusType) => {
  switch (status) {
    case "operational":
      return "bg-success/10";
    case "degraded":
      return "bg-warning/10";
    case "partial":
      return "bg-orange-500/10";
    case "major":
      return "bg-danger/10";
    case "maintenance":
      return "bg-info/10";
    default:
      return "bg-bg-secondary";
  }
};

const getStatusIcon = (status: StatusType) => {
  switch (status) {
    case "operational":
      return CheckCircle;
    case "degraded":
    case "partial":
      return AlertTriangle;
    case "major":
      return XCircle;
    case "maintenance":
      return Clock;
    default:
      return Activity;
  }
};

const getStatusLabel = (status: StatusType) => {
  switch (status) {
    case "operational":
      return "Operational";
    case "degraded":
      return "Degraded Performance";
    case "partial":
      return "Partial Outage";
    case "major":
      return "Major Outage";
    case "maintenance":
      return "Under Maintenance";
    default:
      return "Unknown";
  }
};

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case "minor":
      return "text-warning bg-warning/10";
    case "major":
      return "text-orange-500 bg-orange-500/10";
    case "critical":
      return "text-danger bg-danger/10";
    default:
      return "text-text-muted bg-bg-secondary";
  }
};

const getIncidentStatusColor = (status: string) => {
  switch (status) {
    case "investigating":
      return "text-warning";
    case "identified":
      return "text-orange-500";
    case "monitoring":
      return "text-info";
    case "resolved":
      return "text-success";
    default:
      return "text-text-muted";
  }
};

export default function StatusPage() {
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [expandedIncident, setExpandedIncident] = useState<string | null>(null);

  // Calculate overall status
  const overallStatus: StatusType = services.some((s) => s.status === "major")
    ? "major"
    : services.some((s) => s.status === "partial")
    ? "partial"
    : services.some((s) => s.status === "degraded")
    ? "degraded"
    : "operational";

  const OverallStatusIcon = getStatusIcon(overallStatus);

  // Auto-refresh every 60 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdated(new Date());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="relative overflow-hidden">
      {/* ============================================
          HERO SECTION
          ============================================ */}
      <section className="relative hero-bg-overlay" style={{ paddingTop: '160px', paddingBottom: '60px' }}>
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-grid-pattern opacity-50" />
        
        {/* Geometric Shapes */}
        <div className="absolute top-32 left-10 w-32 h-32 border-2 border-accent-gold/20 rotate-45 animate-float" />
        <div className="absolute top-60 right-20 w-24 h-24 border-2 border-accent-gold/10 rotate-12" />
        
        {/* Glow Effects */}
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-accent-gold/10 rounded-full blur-[150px]" />

        <div className="container mx-auto px-6 lg:px-12 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            {/* Badge */}
            <div className="badge-premium mb-8 animate-fade-in">
              <Activity className="w-4 h-4" />
              <span>System Status</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-text-primary leading-[1.1] mb-6 heading-uppercase animate-slide-up">
              Real-Time
              <br />
              <span className="text-gold-gradient glow-gold-text">Service Status</span>
            </h1>

            {/* Tagline */}
            <p className="tagline-italic text-lg lg:text-xl max-w-2xl mx-auto mb-10 animate-slide-up" style={{ animationDelay: '100ms' }}>
              Monitor the health and performance of all BestSMSHQ services and providers
            </p>

            {/* Overall Status Banner */}
            <div className={`glass-card p-6 ${getStatusBgColor(overallStatus)} animate-slide-up`} style={{ animationDelay: '200ms' }}>
              <div className="flex items-center justify-center gap-4">
                <OverallStatusIcon className={`w-10 h-10 ${getStatusColor(overallStatus)}`} />
                <div className="text-left">
                  <h2 className={`text-2xl font-bold ${getStatusColor(overallStatus)}`}>
                    {overallStatus === "operational"
                      ? "All Systems Operational"
                      : getStatusLabel(overallStatus)}
                  </h2>
                  <p className="text-text-secondary text-sm">
                    Last updated: {lastUpdated.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================
          SERVICES STATUS
          ============================================ */}
      <section className="py-16 bg-bg-secondary relative">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="badge-premium mb-4">
                <Server className="w-4 h-4" />
                <span>Services</span>
              </div>
              <h2 className="text-2xl font-bold text-text-primary heading-uppercase">
                Service <span className="text-gold-gradient">Health</span>
              </h2>
            </div>
            <button
              onClick={() => setLastUpdated(new Date())}
              className="flex items-center gap-2 text-text-secondary hover:text-accent-gold transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {services.map((service) => {
              const StatusIcon = getStatusIcon(service.status);
              return (
                <div key={service.name} className="glass-card glass-card-hover p-5">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl ${getStatusBgColor(service.status)} flex items-center justify-center`}>
                      <service.icon className={`w-6 h-6 ${getStatusColor(service.status)}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-text-primary">{service.name}</h3>
                        <div className="flex items-center gap-2">
                          <StatusIcon className={`w-4 h-4 ${getStatusColor(service.status)}`} />
                          <span className={`text-sm font-medium ${getStatusColor(service.status)}`}>
                            {getStatusLabel(service.status)}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 mt-1">
                        <span className="text-xs text-text-muted">{service.description}</span>
                        <span className="text-xs text-text-muted">
                          Uptime: <span className="text-text-secondary">{service.uptime}%</span>
                        </span>
                        <span className="text-xs text-text-muted">
                          Response: <span className="text-text-secondary">{service.responseTime}ms</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============================================
          ACTIVE INCIDENTS
          ============================================ */}
      {recentIncidents.length > 0 && (
        <section className="py-16 relative">
          <div className="container mx-auto px-6 lg:px-12">
            <div className="badge-premium mb-4">
              <AlertTriangle className="w-4 h-4" />
              <span>Active Incidents</span>
            </div>
            <h2 className="text-2xl font-bold text-text-primary mb-8 heading-uppercase">
              Current <span className="text-gold-gradient">Issues</span>
            </h2>

            <div className="space-y-4">
              {recentIncidents.map((incident) => (
                <div key={incident.id} className="glass-card overflow-hidden">
                  <button
                    onClick={() =>
                      setExpandedIncident(
                        expandedIncident === incident.id ? null : incident.id
                      )
                    }
                    className="w-full p-6 text-left"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <AlertTriangle className="w-6 h-6 text-warning flex-shrink-0 mt-0.5" />
                        <div>
                          <h3 className="font-semibold text-text-primary">{incident.title}</h3>
                          <div className="flex items-center gap-3 mt-2">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getSeverityColor(incident.severity)}`}>
                              {incident.severity}
                            </span>
                            <span className={`text-sm ${getIncidentStatusColor(incident.status)}`}>
                              {incident.status.charAt(0).toUpperCase() + incident.status.slice(1)}
                            </span>
                            <span className="text-xs text-text-muted">
                              Updated {formatDate(incident.updatedAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <ChevronDown
                        className={`w-5 h-5 text-text-muted transition-transform duration-200 ${
                          expandedIncident === incident.id ? "rotate-180" : ""
                        }`}
                      />
                    </div>
                  </button>

                  {expandedIncident === incident.id && (
                    <div className="px-6 pb-6 border-t border-border-default">
                      <div className="pt-4 space-y-4">
                        {incident.updates.map((update, index) => (
                          <div key={index} className="flex gap-4">
                            <div className="flex flex-col items-center">
                              <div className={`w-3 h-3 rounded-full ${getStatusBgColor(update.status === "resolved" ? "operational" : "degraded")}`} />
                              {index !== incident.updates.length - 1 && (
                                <div className="w-0.5 h-full bg-border-default mt-1" />
                              )}
                            </div>
                            <div className="flex-1 pb-4">
                              <div className="flex items-center gap-2 mb-1">
                                <span className={`text-sm font-medium ${getIncidentStatusColor(update.status)}`}>
                                  {update.status.charAt(0).toUpperCase() + update.status.slice(1)}
                                </span>
                                <span className="text-xs text-text-muted">
                                  {formatDate(update.time)}
                                </span>
                              </div>
                              <p className="text-sm text-text-secondary">{update.message}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ============================================
          PAST INCIDENTS
          ============================================ */}
      <section className="py-16 bg-bg-secondary relative">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="badge-premium mb-4">
            <Clock className="w-4 h-4" />
            <span>History</span>
          </div>
          <h2 className="text-2xl font-bold text-text-primary mb-8 heading-uppercase">
            Past <span className="text-gold-gradient">Incidents</span>
          </h2>

          {pastIncidents.length > 0 ? (
            <div className="space-y-4">
              {pastIncidents.map((incident) => (
                <div key={incident.id} className="glass-card p-5">
                  <div className="flex items-start gap-4">
                    <CheckCircle className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-text-primary">{incident.title}</h3>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-sm text-success">Resolved</span>
                        <span className="text-xs text-text-muted">
                          {formatDate(incident.updatedAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="glass-card p-12 text-center">
              <CheckCircle className="w-12 h-12 text-success mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-text-primary mb-2">
                No Recent Incidents
              </h3>
              <p className="text-text-secondary">
                All systems have been running smoothly.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ============================================
          UPTIME STATS
          ============================================ */}
      <section className="py-16 relative">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="text-center mb-12">
            <div className="badge-premium mb-4">
              <Zap className="w-4 h-4" />
              <span>Performance</span>
            </div>
            <h2 className="text-3xl font-bold text-text-primary heading-uppercase">
              90-Day <span className="text-gold-gradient">Uptime</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            <div className="glass-card p-8 text-center card-lift">
              <div className="text-4xl font-bold text-success mb-2">99.95%</div>
              <div className="text-text-secondary">Overall Uptime</div>
            </div>
            <div className="glass-card p-8 text-center card-lift">
              <div className="text-4xl font-bold text-accent-gold mb-2">45ms</div>
              <div className="text-text-secondary">Avg Response Time</div>
            </div>
            <div className="glass-card p-8 text-center card-lift">
              <div className="text-4xl font-bold text-text-primary mb-2">2</div>
              <div className="text-text-secondary">Incidents (90 days)</div>
            </div>
            <div className="glass-card p-8 text-center card-lift">
              <div className="text-4xl font-bold text-text-primary mb-2">15min</div>
              <div className="text-text-secondary">Avg Resolution Time</div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================
          SUBSCRIBE CTA
          ============================================ */}
      <section className="py-20 bg-bg-secondary relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-accent-gold/10 via-bg-secondary to-bg-secondary" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-accent-gold/15 rounded-full blur-[120px]" />
        
        <div className="container mx-auto px-6 lg:px-12 relative z-10">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-text-primary mb-4 heading-uppercase">
              Get Status Updates
            </h2>
            <p className="text-text-secondary mb-8">
              Subscribe to receive notifications about service disruptions and maintenance.
            </p>
            <div className="glass-card p-2 flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 h-14 px-6 bg-bg-secondary/50 border border-border-default rounded-full text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-gold transition-colors"
              />
              <button className="btn-pill btn-pill-primary h-14">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
