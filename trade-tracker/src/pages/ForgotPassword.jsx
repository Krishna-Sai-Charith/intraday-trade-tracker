import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [resetUrl, setResetUrl] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        setResetUrl(data.resetUrl); // For demo purposes
        setEmail('');
      } else {
        setError(data.message || 'Failed to send reset link');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Forgot password error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>🔐 Reset Password</h2>
        <p style={{ color: 'var(--text-secondary)', textAlign: 'center', marginBottom: '24px' }}>
          Enter your email and we'll send you a reset link
        </p>

        {error && (
          <div className="alert-error">
            {error}
          </div>
        )}

        {success ? (
          <div style={{
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid var(--success)',
            borderLeft: '4px solid var(--success)',
            padding: '16px',
            borderRadius: 'var(--radius-md)',
            marginBottom: '24px'
          }}>
            <div style={{ fontSize: '16px', fontWeight: '600', color: '#bbf7d0', marginBottom: '12px' }}>
              ✅ Reset Link Generated!
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
              For demo purposes, here's your reset link:
            </p>
            <div style={{
              background: 'var(--bg-input)',
              padding: '12px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '12px',
              color: 'var(--accent-green)',
              wordBreak: 'break-all',
              fontFamily: 'monospace',
              border: '1px solid var(--border)'
            }}>
              {resetUrl}
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '12px' }}>
              💡 Copy the link above and paste it in your browser
            </p>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>
              ⏰ Link expires in 15 minutes
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <button 
              type="submit" 
              className="btn"
              disabled={loading}
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>
        )}

        <div className="link-text" style={{ marginTop: '24px' }}>
          Remember your password?{' '}
          <Link to="/login" className="link">
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}