// src/pages/Login.jsx
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
    <div className="auth-form">
      <h2>Login</h2>
      {error && <div className="alert alert-error">{error}</div>}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="form-group">
          <label>Email</label>
          <input
            {...register('email')}
            type="email"
            placeholder="Email"
            className="form-control"
          />
          {errors.email && <p style={{ color: '#ef4444', fontSize: '14px', marginTop: '4px' }}>{errors.email.message}</p>}
        </div>
        <div className="form-group">
          <label>Password</label>
          <input
            {...register('password')}
            type="password"
            placeholder="Password"
            className="form-control"
          />
          {errors.password && <p style={{ color: '#ef4444', fontSize: '14px', marginTop: '4px' }}>{errors.password.message}</p>}
        </div>
        <button type="submit" className="btn">Login</button>
      </form>
      <p className="mt-4">
        Don't have an account?{' '}
        <a href="/register">Register</a>
      </p>
    </div>
  );
}