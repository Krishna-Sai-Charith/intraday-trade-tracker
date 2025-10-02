// src/components/TradeForm.jsx
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../context/AuthContext';
import '../index.css';

const tradeSchema = z.object({
  stock: z.string().min(1, 'Stock symbol is required'),
  entryPrice: z.number({ invalid_type_error: 'Entry price must be a number' }).positive('Must be > 0'),
  exitPrice: z.number({ invalid_type_error: 'Exit price must be a number' }).positive('Must be > 0'),
  quantity: z.number({ invalid_type_error: 'Quantity must be a number' }).int().positive('Must be a whole number > 0'),
  tradeType: z.enum(['BUY', 'SELL'], { errorMap: () => ({ message: 'Must be BUY or SELL' }) }),
  notes: z.string().optional()
});

export default function TradeForm() {
  const { currentUser } = useAuth();
  const [profitLoss, setProfitLoss] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(tradeSchema),
    defaultValues: {
      stock: '',
      entryPrice: '',
      exitPrice: '',
      quantity: '',
      tradeType: '',
      notes: ''
    }
  });

  const entry = watch('entryPrice');
  const exit = watch('exitPrice');
  const qty = watch('quantity');
  const tradeType = watch('tradeType');

  // Recalculate P/L when any relevant field changes
  useEffect(() => {
    let calcPL = 0;

    if (tradeType === 'BUY') {
      calcPL = (exit - entry) * qty;
    } else if (tradeType === 'SELL') {
      calcPL = (entry - exit) * qty;
    }

    setProfitLoss(isNaN(calcPL) ? 0 : calcPL);
  }, [entry, exit, qty, tradeType]);

  const onSubmit = async (data) => {
    setSubmitting(true);
    setMessage('');

    try {
      const res = await fetch('http://localhost:5000/trades', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser.token}`
        },
        body: JSON.stringify(data)
      });

      const result = await res.json();

      if (res.ok) {
        setMessage('✅ Trade saved successfully!');

        // Reset form and P/L
        reset({
          stock: '',
          entryPrice: '',
          exitPrice: '',
          quantity: '',
          tradeType: '',
          notes: ''
        });
        setProfitLoss(0);
      } else {
        setMessage(`❌ ${result.message || 'Failed to save trade'}`);
      }
    } catch (err) {
      setMessage('❌ Network error. Is backend running?');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="card">
      <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '16px' }}>Add New Trade</h2>

      {message && (
        <div className={`alert ${message.includes('✅') ? 'alert-success' : 'alert-error'}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="form-group">
          <label>Stock Symbol</label>
          <input
            {...register('stock')}
            placeholder="e.g., RELIANCE"
            className="form-control"
          />
          {errors.stock && <p style={{ color: '#ef4444', fontSize: '14px', marginTop: '4px' }}>{errors.stock.message}</p>}
        </div>

        <div className="form-group">
          <label>Entry Price</label>
          <input
            {...register('entryPrice', { valueAsNumber: true })}
            type="number"
            step="0.01"
            placeholder="0.00"
            className="form-control"
          />
          {errors.entryPrice && <p style={{ color: '#ef4444', fontSize: '14px', marginTop: '4px' }}>{errors.entryPrice.message}</p>}
        </div>

        <div className="form-group">
          <label>Exit Price</label>
          <input
            {...register('exitPrice', { valueAsNumber: true })}
            type="number"
            step="0.01"
            placeholder="0.00"
            className="form-control"
          />
          {errors.exitPrice && <p style={{ color: '#ef4444', fontSize: '14px', marginTop: '4px' }}>{errors.exitPrice.message}</p>}
        </div>

        <div className="form-group">
          <label>Quantity</label>
          <input
            {...register('quantity', { valueAsNumber: true })}
            type="number"
            placeholder="0"
            className="form-control"
          />
          {errors.quantity && <p style={{ color: '#ef4444', fontSize: '14px', marginTop: '4px' }}>{errors.quantity.message}</p>}
        </div>

        <div className="form-group">
          <label>Trade Type</label>
          <select {...register('tradeType')} className="form-control">
            <option value="">Select</option>
            <option value="BUY">BUY</option>
            <option value="SELL">SELL</option>
          </select>
          {errors.tradeType && <p style={{ color: '#ef4444', fontSize: '14px', marginTop: '4px' }}>{errors.tradeType.message}</p>}
        </div>

        <div className="form-group">
          <label>Notes (optional)</label>
          <textarea
            {...register('notes')}
            rows="2"
            className="form-control"
            placeholder="Add comments..."
          />
        </div>

        <div className="pl-value" style={{ marginTop: '16px' }}>
          <span className={profitLoss >= 0 ? 'pl-profit' : 'pl-loss'}>
            P/L: ₹{profitLoss >= 0 ? '+' : ''}{profitLoss.toFixed(2)}
          </span>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="btn"
        >
          {submitting ? 'Saving...' : 'Save Trade'}
        </button>
      </form>
    </div>
  );
}