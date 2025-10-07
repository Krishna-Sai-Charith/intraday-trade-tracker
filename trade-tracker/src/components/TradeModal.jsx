// TradeModal.jsx

import { useState, useEffect, useRef } from 'react'; // 👈 Added useRef
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const tradeSchema = z.object({
  stock: z.string().min(1, 'Stock symbol is required'),
  entryPrice: z.number().positive('Must be > 0'),
  exitPrice: z.number().positive('Must be > 0'),
  quantity: z.number().int().positive('Must be a whole number > 0'),
  tradeType: z.enum(['BUY', 'SELL'], {
    errorMap: () => ({ message: 'Must be BUY or SELL' }),
  }),
  notes: z.string().optional(),
});

export default function TradeModal({ onClose, onSaved }) {
  const { currentUser } = useAuth();
  const [profitLoss, setProfitLoss] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrError, setOcrError] = useState('');

  // ✅ Add useRef for file input
  const fileInputRef = useRef(null);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(tradeSchema),
    defaultValues: {
      stock: '',
      entryPrice: '',
      exitPrice: '',
      quantity: '',
      tradeType: 'BUY',
      notes: '',
    },
  });

  const entry = watch('entryPrice');
  const exit = watch('exitPrice');
  const qty = watch('quantity');
  const tradeType = watch('tradeType');

  // ✅ P/L based on TRADE TYPE, not quantity sign
  useEffect(() => {
    const entryVal = parseFloat(entry) || 0;
    const exitVal = parseFloat(exit) || 0;
    const qtyVal = parseInt(qty) || 0;

    if (!entryVal || !exitVal || !qtyVal) {
      setProfitLoss(0);
      return;
    }

    let calcPL = 0;

    if (tradeType === 'BUY') {
      calcPL = (exitVal - entryVal) * qtyVal;
    } else if (tradeType === 'SELL') {
      calcPL = (entryVal - exitVal) * qtyVal;
    }

    setProfitLoss(isFinite(calcPL) ? calcPL : 0);
  }, [entry, exit, qty, tradeType]);

  // ✅ Handle OCR upload
  const handleOcrUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setOcrLoading(true);
    setOcrError('');
    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await axios.post('http://localhost:5000/api/ocr/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.success && res.data.trade) {
        const t = res.data.trade;
        console.log('OCR Extracted Trade:', t);

        setValue('stock', t.symbol || '');
        setValue('entryPrice', t.entry || '');
        setValue('exitPrice', t.exit || '');
        setValue('quantity', Math.abs(t.qty) || '');
        setValue('tradeType', t.side || 'BUY');
      } else {
        setOcrError('Could not extract trade. Try a clearer image.');
      }
    } catch (err) {
      console.error('OCR Error:', err);
      setOcrError('Failed to process image. Check backend.');
    } finally {
      setOcrLoading(false);
      event.target.value = '';
    }
  };

  const onSubmit = async (data) => {
    console.log('Submitting Trade Data:', data);
    setSubmitting(true);
    try {
      const res = await fetch('http://localhost:5000/trades', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${currentUser.token}`,
        },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (res.ok) {
        onSaved(result.trade);
        reset({
          stock: '',
          entryPrice: '',
          exitPrice: '',
          quantity: '',
          tradeType: 'BUY',
          notes: '',
        });
        setProfitLoss(0);
      } else {
        onSaved(null, false, result.message || 'Failed to save trade');
      }
    } catch (err) {
      onSaved(null, false, 'Network error. Is backend running?');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="close-btn top-right">
          ✕
        </button>
        <h2>Add New Trade</h2>

        {/* OCR Upload */}
        <div className="form-group mb-4">
          <label className="text-sm font-medium text-gray-700">Upload Trade Screenshot (Optional)</label>
          
          <div className="ocr-upload-area">
            <div className="ocr-upload-icon">📤</div>
            <div className="ocr-upload-text">Drag & drop or click to upload</div>
            <div className="ocr-upload-subtext">Supports JPG, PNG • Clear screenshots work best</div>
            
            <button
              type="button"
              className="ocr-upload-btn"
              onClick={() => fileInputRef.current?.click()}
              disabled={ocrLoading}
            >
              📷 Choose File
            </button>
            
            <input
              ref={fileInputRef} // 👈 Ref attached here
              type="file"
              accept="image/*"
              onChange={handleOcrUpload}
              disabled={ocrLoading}
              className="ocr-file-input"
            />
          </div>

          {/* Status Messages */}
          {ocrLoading && (
            <div className="ocr-status loading">
              🧠 Processing image... Please wait
            </div>
          )}
          {ocrError && (
            <div className="ocr-status error">
              ❌ {ocrError}
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="form-group">
            <label>Stock Symbol</label>
            <input
              {...register('stock')}
              placeholder="e.g., RELIANCE"
              className="form-control"
            />
            {errors.stock && (
              <p className="text-red-500 text-sm mt-1">{errors.stock.message}</p>
            )}
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
            {errors.entryPrice && (
              <p className="text-red-500 text-sm mt-1">{errors.entryPrice.message}</p>
            )}
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
            {errors.exitPrice && (
              <p className="text-red-500 text-sm mt-1">{errors.exitPrice.message}</p>
            )}
          </div>

          <div className="form-group">
            <label>Quantity</label>
            <input
              {...register('quantity', { valueAsNumber: true })}
              type="number"
              placeholder="0"
              className="form-control"
            />
            {errors.quantity && (
              <p className="text-red-500 text-sm mt-1">{errors.quantity.message}</p>
            )}
          </div>

          {/* ✅ FIXED: Using Controller for Trade Type */}
          <div className="form-group">
            <label>Trade Type</label>
            <Controller
              name="tradeType"
              control={control}
              render={({ field }) => (
                <select {...field} className="form-control">
                  <option value="BUY">BUY (Long)</option>
                  <option value="SELL">SELL (Short)</option>
                </select>
              )}
            />
            {errors.tradeType && (
              <p className="text-red-500 text-sm mt-1">{errors.tradeType.message}</p>
            )}
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
            <span className={`pl ${profitLoss >= 0 ? 'positive' : 'negative'}`}>
              P/L: ₹{profitLoss >= 0 ? '+' : ''}{profitLoss.toFixed(2)}
            </span>
          </div>

          <button type="submit" disabled={submitting} className="btn">
            {submitting ? 'Saving...' : 'Save Trade'}
          </button>
        </form>
      </div>
    </div>
  );
}