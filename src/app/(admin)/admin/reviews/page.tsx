'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  Star, 
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Calendar,
  RefreshCw,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Flag
} from 'lucide-react';
import { Button, Alert } from '@/components/ui';

interface Review {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  rating: number;
  title: string;
  content: string;
  status: 'pending' | 'approved' | 'rejected';
  featured: boolean;
  helpful: number;
  notHelpful: number;
  createdAt: string;
  moderatedAt: string | null;
  moderatedBy: string | null;
}

const sampleReviews: Review[] = [
  {
    id: '1',
    userId: 'user1',
    userEmail: 'john@example.com',
    userName: 'John D.',
    rating: 5,
    title: 'Excellent service, fast and reliable!',
    content: 'I have been using SMS Sort for 3 months now and it has been amazing. The numbers work perfectly for all services I need. Customer support is also very responsive.',
    status: 'approved',
    featured: true,
    helpful: 45,
    notHelpful: 2,
    createdAt: '2024-01-15T10:00:00Z',
    moderatedAt: '2024-01-15T12:00:00Z',
    moderatedBy: 'admin@smssort.com',
  },
  {
    id: '2',
    userId: 'user2',
    userEmail: 'sarah@example.com',
    userName: 'Sarah M.',
    rating: 4,
    title: 'Good service, could be cheaper',
    content: 'The service works well and I have had no issues with verification. However, I think the prices could be a bit more competitive.',
    status: 'approved',
    featured: false,
    helpful: 23,
    notHelpful: 5,
    createdAt: '2024-01-14T08:00:00Z',
    moderatedAt: '2024-01-14T10:00:00Z',
    moderatedBy: 'admin@smssort.com',
  },
  {
    id: '3',
    userId: 'user3',
    userEmail: 'mike@example.com',
    userName: 'Mike R.',
    rating: 5,
    title: 'Best SMS verification service!',
    content: 'Tried many services before and this is by far the best. Quick delivery, great prices, and excellent support.',
    status: 'pending',
    featured: false,
    helpful: 0,
    notHelpful: 0,
    createdAt: '2024-01-18T14:00:00Z',
    moderatedAt: null,
    moderatedBy: null,
  },
  {
    id: '4',
    userId: 'user4',
    userEmail: 'spam@test.com',
    userName: 'Test User',
    rating: 1,
    title: 'This is spam',
    content: 'Buy cheap products at www.spam-link.com',
    status: 'rejected',
    featured: false,
    helpful: 0,
    notHelpful: 10,
    createdAt: '2024-01-17T09:00:00Z',
    moderatedAt: '2024-01-17T09:30:00Z',
    moderatedBy: 'admin@smssort.com',
  },
];

/**
 * Admin Reviews Page
 * 
 * Features:
 * - List all reviews
 * - Approve/Reject reviews
 * - Feature reviews
 * - Filter by status
 * - View review details
 */
export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>(sampleReviews);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedRating, setSelectedRating] = useState<string>('');

  // Filter reviews
  const filteredReviews = reviews.filter(review => {
    const matchesSearch = review.title.toLowerCase().includes(searchInput.toLowerCase()) ||
                         review.content.toLowerCase().includes(searchInput.toLowerCase()) ||
                         review.userEmail.toLowerCase().includes(searchInput.toLowerCase());
    const matchesStatus = !selectedStatus || review.status === selectedStatus;
    const matchesRating = !selectedRating || review.rating === parseInt(selectedRating);
    return matchesSearch && matchesStatus && matchesRating;
  });

  // Stats
  const stats = {
    total: reviews.length,
    pending: reviews.filter(r => r.status === 'pending').length,
    approved: reviews.filter(r => r.status === 'approved').length,
    rejected: reviews.filter(r => r.status === 'rejected').length,
    avgRating: (reviews.filter(r => r.status === 'approved').reduce((acc, r) => acc + r.rating, 0) / reviews.filter(r => r.status === 'approved').length || 0).toFixed(1),
  };

  // Approve review
  const handleApprove = async (reviewId: string) => {
    try {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 500));
      setReviews(prev => prev.map(r => 
        r.id === reviewId 
          ? { ...r, status: 'approved', moderatedAt: new Date().toISOString(), moderatedBy: 'admin@smssort.com' }
          : r
      ));
      setSuccess('Review approved successfully');
    } catch (err) {
      setError('Failed to approve review');
    } finally {
      setLoading(false);
    }
  };

  // Reject review
  const handleReject = async (reviewId: string) => {
    try {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 500));
      setReviews(prev => prev.map(r => 
        r.id === reviewId 
          ? { ...r, status: 'rejected', moderatedAt: new Date().toISOString(), moderatedBy: 'admin@smssort.com' }
          : r
      ));
      setSuccess('Review rejected');
    } catch (err) {
      setError('Failed to reject review');
    } finally {
      setLoading(false);
    }
  };

  // Toggle featured
  const handleToggleFeatured = async (reviewId: string) => {
    try {
      setReviews(prev => prev.map(r => 
        r.id === reviewId ? { ...r, featured: !r.featured } : r
      ));
      setSuccess('Featured status updated');
    } catch (err) {
      setError('Failed to update featured status');
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-primary)' }}>
      {/* Header */}
      <div style={{ 
        backgroundColor: 'var(--bg-card)', 
        borderBottom: '1px solid var(--border-default)',
        padding: '24px'
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <Link href="/admin" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '14px' }}>
                  Admin
                </Link>
                <span style={{ color: 'var(--text-muted)' }}>/</span>
                <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>Reviews</span>
              </div>
              <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-primary)' }}>
                Review Moderation
              </h1>
            </div>
            <Button variant="outline" onClick={() => window.location.reload()}>
              <RefreshCw style={{ width: '16px', height: '16px', marginRight: '8px' }} />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px' }}>
        {/* Alerts */}
        {error && (
          <div style={{ marginBottom: '24px' }}>
            <Alert variant="error" dismissible onDismiss={() => setError(null)}>
              {error}
            </Alert>
          </div>
        )}

        {success && (
          <div style={{ marginBottom: '24px' }}>
            <Alert variant="success" dismissible onDismiss={() => setSuccess(null)}>
              {success}
            </Alert>
          </div>
        )}

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '24px' }} className="lg:!grid-cols-5">
          <StatCard label="Total Reviews" value={stats.total} icon={MessageSquare} />
          <StatCard label="Pending" value={stats.pending} icon={Clock} color="yellow" />
          <StatCard label="Approved" value={stats.approved} icon={CheckCircle} color="green" />
          <StatCard label="Rejected" value={stats.rejected} icon={XCircle} color="red" />
          <StatCard label="Avg Rating" value={stats.avgRating} icon={Star} color="gold" isString />
        </div>

        {/* Filters */}
        <div style={{ 
          backgroundColor: 'var(--bg-card)', 
          border: '1px solid var(--border-default)', 
          borderRadius: '16px',
          padding: '20px',
          marginBottom: '24px'
        }}>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '200px' }}>
              <div style={{ position: 'relative' }}>
                <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="Search reviews..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  style={{
                    width: '100%',
                    height: '44px',
                    paddingLeft: '40px',
                    paddingRight: '16px',
                    backgroundColor: 'var(--bg-secondary)',
                    border: '1px solid var(--border-default)',
                    borderRadius: '12px',
                    fontSize: '14px',
                    color: 'var(--text-primary)',
                    outline: 'none'
                  }}
                />
              </div>
            </div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              style={{
                height: '44px',
                padding: '0 12px',
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-default)',
                borderRadius: '12px',
                fontSize: '14px',
                color: 'var(--text-primary)',
                minWidth: '150px'
              }}
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
            <select
              value={selectedRating}
              onChange={(e) => setSelectedRating(e.target.value)}
              style={{
                height: '44px',
                padding: '0 12px',
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-default)',
                borderRadius: '12px',
                fontSize: '14px',
                color: 'var(--text-primary)',
                minWidth: '150px'
              }}
            >
              <option value="">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
          </div>
        </div>

        {/* Reviews List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filteredReviews.map((review) => (
            <ReviewCard 
              key={review.id} 
              review={review}
              onApprove={() => handleApprove(review.id)}
              onReject={() => handleReject(review.id)}
              onToggleFeatured={() => handleToggleFeatured(review.id)}
              loading={loading}
            />
          ))}
        </div>

        {filteredReviews.length === 0 && (
          <div style={{ 
            backgroundColor: 'var(--bg-card)', 
            border: '1px solid var(--border-default)', 
            borderRadius: '16px',
            padding: '64px',
            textAlign: 'center'
          }}>
            <MessageSquare style={{ width: '48px', height: '48px', color: 'var(--text-muted)', margin: '0 auto 16px' }} />
            <p style={{ color: 'var(--text-muted)' }}>No reviews found</p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ==================== COMPONENTS ==================== */

interface StatCardProps {
  label: string;
  value: number | string;
  icon: React.ComponentType<{ style?: React.CSSProperties }>;
  color?: 'gold' | 'green' | 'red' | 'yellow' | 'blue';
  isString?: boolean;
}

function StatCard({ label, value, icon: Icon, color, isString }: StatCardProps) {
  const colors = {
    gold: { bg: 'rgba(198, 167, 94, 0.1)', text: 'var(--accent-gold)' },
    green: { bg: 'rgba(34, 197, 94, 0.1)', text: 'var(--success)' },
    red: { bg: 'rgba(239, 68, 68, 0.1)', text: 'var(--danger)' },
    yellow: { bg: 'rgba(245, 158, 11, 0.1)', text: 'var(--warning)' },
    blue: { bg: 'rgba(59, 130, 246, 0.1)', text: 'var(--info)' },
  };
  const c = color ? colors[color] : { bg: 'rgba(107, 114, 128, 0.1)', text: 'var(--text-secondary)' };

  return (
    <div style={{ 
      backgroundColor: 'var(--bg-card)', 
      border: '1px solid var(--border-default)', 
      borderRadius: '16px', 
      padding: '20px' 
    }}>
      <div style={{ 
        width: '40px', 
        height: '40px', 
        borderRadius: '10px', 
        backgroundColor: c.bg, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        marginBottom: '12px'
      }}>
        <Icon style={{ width: '20px', height: '20px', color: c.text }} />
      </div>
      <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>{label}</p>
      <p style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)' }}>
        {isString ? value : (value as number).toLocaleString()}
      </p>
    </div>
  );
}

interface ReviewCardProps {
  review: Review;
  onApprove: () => void;
  onReject: () => void;
  onToggleFeatured: () => void;
  loading: boolean;
}

function ReviewCard({ review, onApprove, onReject, onToggleFeatured, loading }: ReviewCardProps) {
  const statusColors: Record<string, { bg: string; text: string }> = {
    pending: { bg: 'rgba(245, 158, 11, 0.1)', text: 'var(--warning)' },
    approved: { bg: 'rgba(34, 197, 94, 0.1)', text: 'var(--success)' },
    rejected: { bg: 'rgba(239, 68, 68, 0.1)', text: 'var(--danger)' },
  };

  return (
    <div style={{ 
      backgroundColor: 'var(--bg-card)', 
      border: '1px solid var(--border-default)', 
      borderRadius: '16px',
      padding: '24px'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ 
            width: '48px', 
            height: '48px', 
            borderRadius: '50%', 
            backgroundColor: 'rgba(198, 167, 94, 0.2)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            color: 'var(--accent-gold)',
            fontWeight: 600,
            fontSize: '18px'
          }}>
            {review.userName[0]}
          </div>
          <div>
            <p style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{review.userName}</p>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{review.userEmail}</p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {review.featured && (
            <span style={{ 
              padding: '4px 10px', 
              borderRadius: '6px', 
              fontSize: '11px', 
              fontWeight: 600,
              backgroundColor: 'rgba(198, 167, 94, 0.1)',
              color: 'var(--accent-gold)'
            }}>
              Featured
            </span>
          )}
          <span style={{ 
            padding: '4px 10px', 
            borderRadius: '6px', 
            fontSize: '11px', 
            fontWeight: 600,
            backgroundColor: statusColors[review.status].bg,
            color: statusColors[review.status].text,
            textTransform: 'capitalize'
          }}>
            {review.status}
          </span>
        </div>
      </div>

      {/* Rating */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '12px' }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Star 
            key={star}
            style={{ 
              width: '18px', 
              height: '18px', 
              color: star <= review.rating ? 'var(--accent-gold)' : 'var(--border-default)',
              fill: star <= review.rating ? 'var(--accent-gold)' : 'transparent'
            }} 
          />
        ))}
        <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginLeft: '8px' }}>
          {review.rating}/5
        </span>
      </div>

      {/* Content */}
      <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
        {review.title}
      </h3>
      <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '16px' }}>
        {review.content}
      </p>

      {/* Meta */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Calendar style={{ width: '12px', height: '12px' }} />
          {new Date(review.createdAt).toLocaleDateString()}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <ThumbsUp style={{ width: '12px', height: '12px' }} />
          {review.helpful} helpful
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <ThumbsDown style={{ width: '12px', height: '12px' }} />
          {review.notHelpful} not helpful
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '12px', paddingTop: '16px', borderTop: '1px solid var(--border-default)' }}>
        {review.status === 'pending' && (
          <>
            <Button variant="primary" size="sm" onClick={onApprove} isLoading={loading}>
              <CheckCircle style={{ width: '14px', height: '14px', marginRight: '6px' }} />
              Approve
            </Button>
            <Button variant="danger" size="sm" onClick={onReject} isLoading={loading}>
              <XCircle style={{ width: '14px', height: '14px', marginRight: '6px' }} />
              Reject
            </Button>
          </>
        )}
        {review.status === 'approved' && (
          <Button 
            variant={review.featured ? 'outline' : 'secondary'} 
            size="sm" 
            onClick={onToggleFeatured}
          >
            <Star style={{ width: '14px', height: '14px', marginRight: '6px' }} />
            {review.featured ? 'Remove Featured' : 'Make Featured'}
          </Button>
        )}
        {review.status === 'rejected' && (
          <Button variant="outline" size="sm" onClick={onApprove}>
            <CheckCircle style={{ width: '14px', height: '14px', marginRight: '6px' }} />
            Approve
          </Button>
        )}
      </div>
    </div>
  );
}

