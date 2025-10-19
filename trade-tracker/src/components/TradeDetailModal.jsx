// src/components/TradeDetailModal.jsx
import React from 'react';

export default function TradeDetailModal({ trade, capital, onClose }) {
  // Calculate % of capital
  const pctOfCapital = capital > 0 ? ((trade.profitLoss || 0) / capital) * 100 : 0;

  // Placeholder badges (we'll enhance later)
  const badges = [];
  if (trade.profitLoss > 0 && trade.profitLoss >= 500) badges.push('🔥 Big Win');
  if (trade.profitLoss < 0 && trade.profitLoss <= -500) badges.push('⚠️ Big Loss');

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="trade-detail-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>✕</button>
        <h3>Trade Details</h3>
        <div className="modal-row">
          <span>Stock:</span>
          <strong>{trade.stock || '—'}</strong>
        </div>
        <div className="modal-row">
          <span>Type:</span>
          <strong>{trade.type || '—'}</strong>
        </div>
        <div className="modal-row">
          <span>Entry:</span>
          <strong>₹{trade.entryPrice?.toFixed(2) || '—'}</strong>
        </div>
        <div className="modal-row">
          <span>Exit:</span>
          <strong>₹{trade.exitPrice?.toFixed(2) || '—'}</strong>
        </div>
        <div className="modal-row">
          <span>Qty:</span>
          <strong>{trade.quantity || '—'}</strong>
        </div>
        <div className="modal-row">
          <span>P&L:</span>
          <strong className={trade.profitLoss >= 0 ? 'positive' : 'negative'}>
            ₹{trade.profitLoss?.toFixed(2) || '0.00'}
          </strong>
        </div>
        <div className="modal-row">
          <span>% of Capital:</span>
          <strong className={pctOfCapital >= 0 ? 'positive' : 'negative'}>
            {pctOfCapital.toFixed(2)}%
          </strong>
        </div>
        <div className="modal-row">
          <span>Date:</span>
          <strong>{new Date(trade.createdAt).toLocaleString('en-IN')}</strong>
        </div>

        {badges.length > 0 && (
          <div className="modal-badges">
            <span>Badges:</span>
            <div>
              {badges.map((badge, i) => (
                <span key={i} className="badge">{badge}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}