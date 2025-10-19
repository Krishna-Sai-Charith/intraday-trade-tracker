import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import '../index.css';

const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(loginSchema)
  });

  const onSubmit = async (data) => {
    try {
      const res = await fetch('http://localhost:5000/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      const result = await res.json();

      if (res.ok) {
        login(result.token);
        navigate('/dashboard');
      } else {
        setError(result.message || 'Login failed');
      }
    } catch (err) {
      setError('Network error');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Login</h2>
        {error && <div className="alert alert-error">{error}</div>}
        
        <form onSubmit={handleSubmit(onSubmit)} className="form">
          <div className="form-group">
            <label>Email</label>
            <input
              {...register('email')}
              type="email"
              placeholder="Email"
            />
            {errors.email && (
              <p className="text-red-500 text-sm" style={{ marginTop: '6px' }}>
                {errors.email.message}
              </p>
            )}
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              {...register('password')}
              type="password"
              placeholder="Password"
            />
            {errors.password && (
              <p className="text-red-500 text-sm" style={{ marginTop: '6px' }}>
                {errors.password.message}
              </p>
            )}
          </div>

          <button type="submit" className="btn">
            Login
          </button>
        </form>

        <p className="link-text">
          Don't have an account?{' '}
          <span onClick={() => navigate('/register')} className="link">
            Register
          </span>
        </p>
      </div>
    </div>
  );
}