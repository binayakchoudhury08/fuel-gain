import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Search, X, Calendar, Fuel, ArrowRight } from 'lucide-react';
import type { RootState } from '../storage/reduxStore';
import type { ProductDailyEntry } from '../types';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectEntry?: (entry: ProductDailyEntry) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectEntry,
}) => {
  const [query, setQuery] = useState('');
  const entriesMap = useSelector((state: RootState) => state.entries.entries);
  const profile = useSelector((state: RootState) => state.user.profile);

  if (!isOpen) return null;

  const allEntries: ProductDailyEntry[] = Object.values(entriesMap);

  const searchResults = allEntries.filter((entry) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    const matchProduct = entry.productName.toLowerCase().includes(q);
    const matchDate = entry.date.includes(q);
    const matchStatus = entry.status.toLowerCase().includes(q);
    const matchPump = (profile?.pumpName || '').toLowerCase().includes(q);
    const matchDiff = entry.difference.toString().includes(q);
    return matchProduct || matchDate || matchStatus || matchPump || matchDiff;
  });

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(6px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: '60px 16px 16px 16px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '720px',
          maxHeight: '80vh',
          backgroundColor: 'var(--color-surface)',
          borderRadius: '20px',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-lg)',
          border: '1.5px solid var(--color-card-border)',
        }}
      >
        {/* Search Input Bar Header */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid var(--color-card-border)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <Search size={22} color="var(--color-primary)" />
          <input
            type="text"
            placeholder="Global Search by Date, Product, Gain, Shortage, or Pump..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            style={{
              border: 'none',
              outline: 'none',
              background: 'transparent',
              width: '100%',
              fontSize: '1.05rem',
              fontWeight: 600,
              color: 'var(--color-text-primary)',
            }}
          />
          <button
            onClick={onClose}
            style={{
              background: 'var(--color-surface-variant)',
              border: 'none',
              padding: '8px',
              borderRadius: '10px',
              cursor: 'pointer',
              color: 'var(--color-text-primary)',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Results List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>
            Found {searchResults.length} matching entries
          </span>

          {searchResults.length > 0 ? (
            searchResults.map((entry) => {
              const isGain = entry.difference > 0;
              return (
                <div
                  key={entry.id}
                  onClick={() => {
                    if (onSelectEntry) onSelectEntry(entry);
                    onClose();
                  }}
                  style={{
                    padding: '14px 16px',
                    borderRadius: '14px',
                    backgroundColor: 'var(--color-surface-variant)',
                    border: '1px solid var(--color-card-border)',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ padding: '8px', borderRadius: '10px', backgroundColor: 'var(--color-primary-container)', color: 'var(--color-primary)' }}>
                      <Fuel size={18} />
                    </div>
                    <div>
                      <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>
                        {entry.productName}
                      </h4>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                        <span><Calendar size={12} style={{ display: 'inline', marginRight: '3px' }} />{entry.date}</span>
                        •
                        <span>Meter: {entry.totalMeterSale.toFixed(1)} L</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span
                      style={{
                        fontSize: '0.82rem',
                        fontWeight: 800,
                        color: isGain ? 'var(--color-success)' : 'var(--color-error)',
                      }}
                    >
                      {isGain ? `+${entry.difference.toFixed(1)}` : entry.difference.toFixed(1)} L ({entry.status})
                    </span>
                    <ArrowRight size={18} color="var(--color-text-muted)" />
                  </div>
                </div>
              );
            })
          ) : (
            <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '32px', fontSize: '0.9rem' }}>
              No records match your search criteria.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
