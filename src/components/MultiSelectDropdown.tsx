import React, { useState } from 'react';
import { Check, ChevronDown, Sparkles } from 'lucide-react';
import type { FuelProduct } from '../types';

interface MultiSelectDropdownProps {
  label: string;
  options: FuelProduct[];
  selectedIds: string[];
  onChange: (selectedIds: string[]) => void;
  error?: string;
  companyName?: string;
}

export const MultiSelectDropdown: React.FC<MultiSelectDropdownProps> = ({
  label,
  options,
  selectedIds,
  onChange,
  error,
  companyName,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleOption = (id: string) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((item) => item !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%', marginBottom: '14px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
          {label}
        </label>
        {companyName && (
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: '6px',
              backgroundColor: 'var(--color-surface-variant)',
              color: 'var(--color-primary)',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <Sparkles size={12} /> {companyName}
          </span>
        )}
      </div>

      <div style={{ position: 'relative' }}>
        <div
          onClick={() => setIsOpen(!isOpen)}
          style={{
            padding: '12px 14px',
            fontSize: '0.95rem',
            borderRadius: '12px',
            border: error ? '1.5px solid var(--color-error)' : '1.5px solid var(--color-card-border)',
            backgroundColor: 'var(--color-surface)',
            color: 'var(--color-text-primary)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <span style={{ color: selectedIds.length === 0 ? 'var(--color-text-muted)' : 'var(--color-text-primary)' }}>
            {selectedIds.length === 0
              ? 'Select Products...'
              : `${selectedIds.length} Product${selectedIds.length > 1 ? 's' : ''} Selected`}
          </span>
          <ChevronDown
            size={18}
            style={{
              transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s ease',
              color: 'var(--color-text-muted)',
            }}
          />
        </div>

        {isOpen && (
          <div
            style={{
              position: 'absolute',
              top: 'calc(100% + 6px)',
              left: 0,
              right: 0,
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-card-border)',
              borderRadius: '14px',
              boxShadow: 'var(--shadow-lg)',
              zIndex: 50,
              maxHeight: '260px',
              overflowY: 'auto',
              padding: '6px',
            }}
          >
            {options.length === 0 ? (
              <div style={{ padding: '12px', textAlign: 'center', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                No products available for this company. Please select a company first.
              </div>
            ) : (
              options.map((product) => {
                const isSelected = selectedIds.includes(product.id);
                return (
                  <div
                    key={product.id}
                    onClick={() => toggleOption(product.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 12px',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      backgroundColor: isSelected ? 'var(--color-surface-variant)' : 'transparent',
                      transition: 'background 0.15s ease',
                      marginBottom: '2px',
                    }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                        {product.name}
                      </span>
                      {product.description && (
                        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                          {product.description}
                        </span>
                      )}
                    </div>

                    <div
                      style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '6px',
                        border: isSelected ? 'none' : '2px solid var(--color-card-border)',
                        backgroundColor: isSelected ? 'var(--color-primary)' : 'transparent',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#FFFFFF',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {isSelected && <Check size={14} strokeWidth={3} />}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {error && <span style={{ fontSize: '0.78rem', color: 'var(--color-error)' }}>{error}</span>}
    </div>
  );
};
