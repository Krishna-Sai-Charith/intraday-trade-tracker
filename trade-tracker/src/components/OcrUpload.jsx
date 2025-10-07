import React, { useState } from 'react';
import axios from 'axios';

function OcrUpload({ onTradeExtracted }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await axios.post('/api/ocr/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.data.success) {
        onTradeExtracted(response.data.trade);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'OCR failed. Try a clearer image.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <input
        type="file"
        accept="image/*"
        onChange={handleUpload}
        disabled={loading}
      />
      {loading && <p>Processing...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}

export default OcrUpload;