import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const capitalSchema = z.object({
  amount: z.number().positive('Amount must be > 0'),
  action: z.enum(['ADD', 'REMOVE'])
});

export default function CapitalModal({ 
  onClose, 
  onSaved, 
  currentCapital,
  defaultAction = 'ADD' // 👈 accept prop
}) {
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
      action: defaultAction
    }
  });

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      const newCapital = data.action === 'ADD' 
        ? currentCapital + data.amount 
        : currentCapital - data.amount;

      onSaved(newCapital);
      reset({
        amount: '',
        action: defaultAction
      });
    } catch (err) {
      onSaved(null);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button 
          onClick={onClose}
          className="close-btn top-right"
        >
          ✕
        </button>
        <h2>{defaultAction === 'ADD' ? 'Deposit Capital' : 'Withdraw Capital'}</h2>
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

          {/* Hidden input — no dropdown */}
          <input type="hidden" {...register('action')} value={defaultAction} />

          <button
            type="submit"
            disabled={submitting}
            className="btn"
          >
            {submitting ? 'Saving...' : (defaultAction === 'ADD' ? 'Deposit' : 'Withdraw')}
          </button>
        </form>
      </div>
    </div>
  );
}