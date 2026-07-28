import React, { useRef, useState } from 'react';
import { FileText, Upload, CheckCircle2, AlertCircle, Trash2, Cpu, Eye } from 'lucide-react';
import type { FuelProduct, DipChartFile } from '../types';
import { validatePdfFile } from '../helpers/pdfValidator';
import { dipChartParser } from '../services/dipChartParser';
import { DipChartPreviewModal } from './DipChartPreviewModal';

interface DipChartUploadCardProps {
  product: FuelProduct;
  uploadedFile?: DipChartFile;
  onFileUpload: (file: DipChartFile) => void;
  onFileRemove: () => void;
}

export const DipChartUploadCard: React.FC<DipChartUploadCardProps> = ({
  product,
  uploadedFile,
  onFileUpload,
  onFileRemove,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg(null);
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const validation = validatePdfFile(file);

    if (!validation.isValid) {
      setErrorMsg(validation.errorMessage || 'Invalid file');
      return;
    }

    setIsConverting(true);
    try {
      // 1. Convert uploaded Dip Chart PDF file directly into JS calibration lookup table & metadata
      const { metadata, calibrationTable } = await dipChartParser.convertPdfToJsChart(file, product.id, 20000);

      // 2. Create DipChartFile object with attached JS calibrationTable
      const dipChart: DipChartFile = {
        productId: product.id,
        productName: product.name,
        fileName: file.name,
        fileSize: file.size,
        uploadedAt: new Date().toLocaleDateString(),
        fileUrl: URL.createObjectURL(file),
        metadata,
        calibrationTable,
      };

      onFileUpload(dipChart);
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to process PDF dip chart calibration table.');
    } finally {
      setIsConverting(false);
    }
  };

  return (
    <>
      <div
        style={{
          border: errorMsg
            ? '1.5px solid var(--color-error)'
            : uploadedFile
            ? '1.5px solid var(--color-accent)'
            : isHovered
            ? '1.5px solid var(--color-primary)'
            : '1.5px dashed var(--color-card-border)',
          borderRadius: 'var(--radius-md)',
          padding: '16px',
          backgroundColor: 'var(--color-surface)',
          transition: 'all 0.2s ease',
          marginBottom: '12px',
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                padding: '6px',
                borderRadius: '8px',
                backgroundColor: 'var(--color-primary-container)',
                color: 'var(--color-primary)',
              }}
            >
              <FileText size={18} />
            </div>
            <div>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                {product.name}
              </h4>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                Tank Dip Chart Reference (PDF Only)
              </span>
            </div>
          </div>

          {uploadedFile && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '0.75rem',
                fontWeight: 700,
                padding: '4px 10px',
                borderRadius: '20px',
                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                color: 'var(--color-success)',
              }}
            >
              <CheckCircle2 size={14} /> JS Calibrated
            </span>
          )}
        </div>

        {uploadedFile ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              padding: '12px',
              backgroundColor: 'var(--color-surface-variant)',
              borderRadius: '10px',
              marginTop: '8px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
                <FileText size={20} color="var(--color-primary)" />
                <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  <p style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                    {uploadedFile.fileName}
                  </p>
                  <span style={{ fontSize: '0.72rem', color: 'var(--color-success)', fontWeight: 600 }}>
                    {(uploadedFile.fileSize / 1024).toFixed(1)} KB • {uploadedFile.calibrationTable?.length || 0} Calibrated Dip Points Parsed
                  </span>
                </div>
              </div>

              <button
                onClick={onFileRemove}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-error)',
                  cursor: 'pointer',
                  padding: '6px',
                  borderRadius: '6px',
                }}
                title="Remove File"
              >
                <Trash2 size={16} />
              </button>
            </div>

            {/* Inspect / Test Button */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setIsPreviewOpen(true)}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid var(--color-primary)',
                  backgroundColor: 'var(--color-primary-container)',
                  color: 'var(--color-primary)',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                <Eye size={14} /> View Extracted Calibration Chart & Calculator
              </button>
            </div>
          </div>
        ) : (
          <div
            onClick={() => fileInputRef.current?.click()}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '16px',
              cursor: 'pointer',
              borderRadius: '10px',
              backgroundColor: 'var(--color-surface-variant)',
              gap: '6px',
              marginTop: '6px',
            }}
          >
            {isConverting ? (
              <>
                <Cpu size={24} color="var(--color-primary)" style={{ animation: 'spin 1s linear infinite' }} />
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--color-primary)' }}>
                  Extracting Multi-Column Dip Tables from PDF...
                </span>
              </>
            ) : (
              <>
                <Upload size={22} color="var(--color-primary)" />
                <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-primary)' }}>
                  Click to upload Dip Chart PDF (HPCL / IOCL / BPCL / Calibration Chart)
                </span>
                <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
                  Max File Size: 10 MB (.pdf) — Auto-extracts Dip (CM/MM) to Litres Table
                </span>
              </>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
          </div>
        )}

        {errorMsg && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px', color: 'var(--color-error)' }}>
            <AlertCircle size={14} />
            <span style={{ fontSize: '0.78rem', fontWeight: 500 }}>{errorMsg}</span>
          </div>
        )}
      </div>

      {uploadedFile && (
        <DipChartPreviewModal
          isOpen={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
          dipChart={uploadedFile}
        />
      )}
    </>
  );
};
