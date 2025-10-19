import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import OcrUpload from './OcrUpload';

export default function FastTradeModal({ onClose, onSaved }) {
  const { currentUser } = useAuth();
  
  // Trade Data
  const [stock, setStock] = useState('');
  const [entryPrice, setEntryPrice] = useState('');
  const [exitPrice, setExitPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [tradeType, setTradeType] = useState('BUY');
  
  // Journal Data
  const [emotion, setEmotion] = useState('');
  const [quickNote, setQuickNote] = useState('');
  
  // Calculated Data
  const [pnl, setPnl] = useState(0);
  const [riskReward, setRiskReward] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);

  // Auto-calculate P/L and Risk:Reward
  useEffect(() => {
    if (entryPrice && exitPrice && quantity) {
      const entry = parseFloat(entryPrice);
      const exit = parseFloat(exitPrice);
      const qty = parseInt(quantity);
      
      let calculatedPnl = 0;
      if (tradeType === 'BUY') {
        calculatedPnl = (exit - entry) * qty;
      } else {
        calculatedPnl = (entry - exit) * qty;
      }
      
      setPnl(calculatedPnl);
      
      // Calculate Risk:Reward ratio
      const risk = Math.abs(entry - exit);
      const reward = Math.abs(calculatedPnl / qty);
      const ratio = (reward / risk).toFixed(2);
      setRiskReward(ratio);
    }
  }, [entryPrice, exitPrice, quantity, tradeType]);

  // Handle OCR data
  const handleOcrData = (data) => {
    if (data.stock) setStock(data.stock);
    if (data.entryPrice) setEntryPrice(data.entryPrice);
    if (data.exitPrice) setExitPrice(data.exitPrice);
    if (data.quantity) setQuantity(data.quantity);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const trade = {
      stock: stock.toUpperCase(),
      entryPrice: parseFloat(entryPrice),
      exitPrice: parseFloat(exitPrice),
      quantity: parseInt(quantity),
      tradeType,
      profitLoss: pnl,
      emotion,
      notes: quickNote,
      timestamp: new Date()
    };

    try {
      const res = await fetch('http://localhost:5000/api/trades', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser.token}`
        },
        body: JSON.stringify(trade)
      });

      if (res.ok) {
        const savedTrade = await res.json();
        setShowSuccess(true);
        
        setTimeout(() => {
          onSaved(savedTrade);
        }, 2000);
      }
    } catch (err) {
      console.error('Save error:', err);
    }
  };

  const emotionOptions = [
    { emoji: '😌', label: 'Calm', value: 'calm' },
    { emoji: '😰', label: 'Anxious', value: 'anxious' },
    { emoji: '🤑', label: 'Greedy', value: 'greedy' },
    { emoji: '😤', label: 'FOMO', value: 'fomo' },
    { emoji: '🎯', label: 'Focused', value: 'focused' }
  ];

  if (showSuccess) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal success-modal">
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            {pnl >= 0 ? (
              <>
                <div style={{ fontSize: '64px', marginBottom: '16px' }}>🎉</div>
                <h2 style={{ color: '#10b981', marginBottom: '12px' }}>
                  Winner! +₹{pnl.toFixed(2)}
                </h2>
                <p style={{ color: '#9ca3af', fontSize: '15px' }}>
                  Risk:Reward was 1:{riskReward}
                </p>
                <p style={{ color: '#10b981', fontSize: '13px', marginTop: '8px' }}>
                  ✨ Keep the momentum going!
                </p>
              </>
            ) : (
              <>
                <div style={{ fontSize: '64px', marginBottom: '16px' }}>💪</div>
                <h2 style={{ color: '#ef4444', marginBottom: '12px' }}>
                  Loss: ₹{Math.abs(pnl).toFixed(2)}
                </h2>
                <p style={{ color: '#9ca3af', fontSize: '15px' }}>
                  Risk:Reward was 1:{riskReward}
                </p>
                <p style={{ color: '#9ca3af', fontSize: '13px', marginTop: '8px' }}>
                  📊 Review your strategy. Every loss is a lesson!
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal fast-trade-modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>×</button>
        
        <h2 style={{ fontSize: '22px', marginBottom: '24px' }}>⚡ Quick Log Trade</h2>

        <form onSubmit={handleSubmit} className="form">
          {/* OCR Upload Component */}
          <OcrUpload onDataExtracted={handleOcrData} />

          {/* Stock Symbol */}
          <div className="form-group">
            <label style={{ fontSize: '14px', fontWeight: '600' }}>Stock</label>
            <input
              type="text"
              placeholder="e.g., RELIANCE"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              style={{ 
                fontSize: '18px', 
                fontWeight: '600',
                textTransform: 'uppercase',
                padding: '16px 18px'
              }}
              autoFocus
              required
            />
          </div>

          {/* Trade Type Toggle */}
          <div className="form-group">
            <label style={{ fontSize: '14px', fontWeight: '600' }}>Type</label>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                type="button"
                onClick={() => setTradeType('BUY')}
                style={{
                  flex: 1,
                  padding: '16px',
                  borderRadius: '12px',
                  border: '2px solid',
                  borderColor: tradeType === 'BUY' ? '#10b981' : '#2a2a2a',
                  background: tradeType === 'BUY' ? 'rgba(16, 185, 129, 0.1)' : '#252525',
                  color: tradeType === 'BUY' ? '#10b981' : '#9ca3af',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                📈 LONG
              </button>
              <button
                type="button"
                onClick={() => setTradeType('SELL')}
                style={{
                  flex: 1,
                  padding: '16px',
                  borderRadius: '12px',
                  border: '2px solid',
                  borderColor: tradeType === 'SELL' ? '#ef4444' : '#2a2a2a',
                  background: tradeType === 'SELL' ? 'rgba(239, 68, 68, 0.1)' : '#252525',
                  color: tradeType === 'SELL' ? '#ef4444' : '#9ca3af',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                📉 SHORT
              </button>
            </div>
          </div>

          {/* Price Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label style={{ fontSize: '13px', fontWeight: '600' }}>Entry ₹</label>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={entryPrice}
                onChange={(e) => setEntryPrice(e.target.value)}
                style={{ fontSize: '16px', padding: '14px 12px' }}
                required
              />
            </div>
            <div className="form-group">
              <label style={{ fontSize: '13px', fontWeight: '600' }}>Exit ₹</label>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={exitPrice}
                onChange={(e) => setExitPrice(e.target.value)}
                style={{ fontSize: '16px', padding: '14px 12px' }}
                required
              />
            </div>
          </div>

          {/* Quantity */}
          <div className="form-group">
            <label style={{ fontSize: '13px', fontWeight: '600' }}>Quantity</label>
            <input
              type="number"
              placeholder="0"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              style={{ fontSize: '16px', padding: '14px 18px' }}
              required
            />
          </div>

          {/* Live P/L Preview */}
          {pnl !== 0 && (
            <div style={{
              padding: '16px',
              borderRadius: '12px',
              background: pnl >= 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              border: `2px solid ${pnl >= 0 ? '#10b981' : '#ef4444'}`,
              textAlign: 'center',
              marginBottom: '8px'
            }}>
              <div style={{ fontSize: '13px', color: '#9ca3af', marginBottom: '4px' }}>
                Profit/Loss
              </div>
              <div style={{ 
                fontSize: '28px', 
                fontWeight: '700', 
                color: pnl >= 0 ? '#10b981' : '#ef4444',
                letterSpacing: '-0.02em'
              }}>
                {pnl >= 0 ? '+' : ''}₹{pnl.toFixed(2)}
              </div>
              {riskReward && (
                <div style={{ fontSize: '13px', color: '#9ca3af', marginTop: '4px' }}>
                  Risk:Reward → 1:{riskReward}
                </div>
              )}
            </div>
          )}

          {/* Emotion Tags */}
          <div className="form-group">
            <label style={{ fontSize: '13px', fontWeight: '600', marginBottom: '8px' }}>
              How did you feel?
            </label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {emotionOptions.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setEmotion(opt.value)}
                  style={{
                    padding: '10px 16px',
                    borderRadius: '20px',
                    border: '2px solid',
                    borderColor: emotion === opt.value ? '#10b981' : '#2a2a2a',
                    background: emotion === opt.value ? 'rgba(16, 185, 129, 0.1)' : '#252525',
                    color: emotion === opt.value ? '#10b981' : '#9ca3af',
                    fontSize: '14px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.2s'
                  }}
                >
                  <span style={{ fontSize: '16px' }}>{opt.emoji}</span>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Note */}
          <div className="form-group">
            <label style={{ fontSize: '13px', fontWeight: '600' }}>
              Quick Note (Optional)
            </label>
            <textarea
              placeholder="Why did you take this trade? Any lesson?"
              value={quickNote}
              onChange={(e) => setQuickNote(e.target.value)}
              rows="3"
              style={{ fontSize: '14px', padding: '12px 16px', resize: 'none' }}
            />
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            className="btn"
            style={{ 
              padding: '18px', 
              fontSize: '17px', 
              fontWeight: '700',
              marginTop: '12px'
            }}
          >
            💾 Save Trade
          </button>
        </form>
      </div>
    </div>
  );
}