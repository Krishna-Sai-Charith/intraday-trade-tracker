import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import '../index.css';

const registerSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

export default function Register() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(registerSchema)
  });

  const onSubmit = async (data) => {
    try {
      const res = await fetch('http://localhost:5000/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: data.email,
          password: data.password
        })
      });

      const result = await res.json();

      if (res.ok) {
        login(result.token);
        navigate('/dashboard');
      } else {
        setError(result.message || 'Registration failed');
      }
    } catch (err) {
      setError('Network error');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Register</h2>
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

          <div className="form-group">
            <label>Confirm Password</label>
            <input
              {...register('confirmPassword')}
              type="password"
              placeholder="Confirm Password"
            />
            {errors.confirmPassword && (
              <p className="text-red-500 text-sm" style={{ marginTop: '6px' }}>
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <button type="submit" className="btn">
            Register
          </button>
        </form>

        <p className="link-text">
          Already have an account?{' '}
          <span onClick={() => navigate('/login')} className="link">
            Login
          </span>
        </p>
      </div>
    </div>
  );
}