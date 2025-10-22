import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Get token from URL query parameter
    const tokenFromUrl = searchParams.get('token');
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
    } else {
      setError('Invalid reset link. Token is missing.');
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!token) {
      setError('Invalid reset token');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        setError(data.message || 'Failed to reset password');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Reset password error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>✅</div>
            <h2 style={{ color: 'var(--success)', marginBottom: '16px' }}>
              Password Reset Successful!
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
              You can now login with your new password
            </p>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              Redirecting to login page in 3 seconds...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>🔑 Create New Password</h2>
        <p style={{ color: 'var(--text-secondary)', textAlign: 'center', marginBottom: '24px' }}>
          Enter your new password below
        </p>

        {error && (
          <div className="alert-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Show token field only if token is missing from URL */}
          {!token && (
            <div className="form-group">
              <label>Reset Token</label>
              <input
                type="text"
                placeholder="Paste your reset token here"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                required
                disabled={loading}
              />
              <small style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '4px' }}>
                Copy the token from the reset link you received
              </small>
            </div>
          )}

          <div className="form-group">
            <label>New Password</label>
            <input
              type="password"
              placeholder="At least 6 characters"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              disabled={loading}
              minLength={6}
            />
          </div>

          <div className="form-group">
            <label>Confirm New Password</label>
            <input
              type="password"
              placeholder="Re-enter your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={loading}
              minLength={6}
            />
          </div>

          <button 
            type="submit" 
            className="btn"
            disabled={loading}
          >
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>

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