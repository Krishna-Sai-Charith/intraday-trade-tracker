import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../context/AuthContext';

const capitalSchema = z.object({
  amount: z.number().positive('Amount must be > 0'),
  action: z.enum(['ADD', 'REMOVE'], { errorMap: () => ({ message: 'Must be ADD or REMOVE' }) })
});

export default function CapitalModal({ onClose, onSaved, currentCapital }) {
  const { currentUser } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(capitalSchema),
    defaultValues: {
      amount: '',
      action: 'ADD'
    }
  });

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      // In real app, this would call /user/profile PATCH
      // For now, simulate update
      const newCapital = data.action === 'ADD' 
        ? currentCapital + data.amount 
        : currentCapital - data.amount;

      onSaved(newCapital);
      reset({
        amount: '',
        action: 'ADD'
      });
    } catch (err) {
      onSaved(null, false, 'Network error. Is backend running?');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        {/* Close button top-right */}
        <button 
          onClick={onClose}
          className="close-btn top-right"
        >
          ✕
        </button>
        <h2>Manage Capital</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="form-group">
            <label>Current Capital: ₹{currentCapital?.toFixed(2)}</label>
          </div>

          <div className="form-group">
            <label>Amount</label>
            <input
              {...register('amount', { valueAsNumber: true })}
              type="number"
              step="0.01"
              placeholder="0.00"
              className="form-control"
            />
            {errors.amount && <p className="text-red-500 text-sm mt-1">{errors.amount.message}</p>}
          </div>

          <div className="form-group">
            <label>Action</label>
            <select {...register('action')} className="form-control">
              <option value="ADD">Add Capital</option>
              <option value="REMOVE">Remove Capital</option>
            </select>
            {errors.action && <p className="text-red-500 text-sm mt-1">{errors.action.message}</p>}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn"
          >
            {submitting ? 'Saving...' : 'Update Capital'}
          </button>
        </form>
      </div>
    </div>
  );
}