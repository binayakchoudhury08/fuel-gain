import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Building2,
  User,
  MapPin,
  Fuel,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  FileCheck,
  Zap,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { MD3Card } from '../components/MD3Card';
import { MD3Button } from '../components/MD3Button';
import { MD3Input } from '../components/MD3Input';
import { ProgressBar } from '../components/ProgressBar';
import { DipChartUploadCard } from '../components/DipChartUploadCard';
import { PETROL_COMPANIES, COMPANY_PRODUCTS_MAP } from '../constants/companyProducts';
import type { PetrolCompanyCode, DipChartFile } from '../types';
import type { RootState } from '../storage/reduxStore';
import { supabaseSyncService } from '../services/supabaseSyncService';
import {
  updatePersonalDetails,
  updatePumpDetails,
  updateSelectedProducts,
  addDipChart,
  completeOnboarding,
} from '../storage/slices/userSlice';

interface ProfileSetupWizardProps {
  onWizardComplete: () => void;
}

export const ProfileSetupWizard: React.FC<ProfileSetupWizardProps> = ({ onWizardComplete }) => {
  const dispatch = useDispatch();
  const profile = useSelector((state: RootState) => state.user.profile);

  const [step, setStep] = useState<number>(1);
  const totalSteps = 4;

  // Form states
  const [fullName, setFullName] = useState<string>(profile?.fullName || '');
  const [pumpName, setPumpName] = useState<string>(profile?.pumpName || '');
  const [pumpCompany, setPumpCompany] = useState<PetrolCompanyCode>(
    profile?.pumpCompany || 'HPCL'
  );
  const [pumpAddress, setPumpAddress] = useState<string>(profile?.pumpAddress || '');

  // Step 2: Selected products
  const defaultProductIds =
    profile?.selectedProductIds ||
    COMPANY_PRODUCTS_MAP[pumpCompany]?.map((p) => p.id) ||
    [];
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>(defaultProductIds);

  // Step 3: Dip charts
  const [dipCharts, setDipCharts] = useState<Record<string, DipChartFile>>(
    profile?.dipChartsUploaded || {}
  );

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Products available for selected company
  const availableProducts = COMPANY_PRODUCTS_MAP[pumpCompany] || [];

  // Navigation handlers
  const handleNextStep = () => {
    if (step === 1) {
      const newErrors: Record<string, string> = {};
      if (!fullName.trim()) newErrors.fullName = 'Owner name is required';
      if (!pumpName.trim()) newErrors.pumpName = 'Pump / Station name is required';

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }
      setErrors({});

      // Save step 1 data
      dispatch(updatePersonalDetails({ fullName }));
      dispatch(updatePumpDetails({ pumpName, pumpCompany, pumpAddress }));

      // Auto-select products if none selected yet for this company
      const companyProds = COMPANY_PRODUCTS_MAP[pumpCompany] || [];
      if (selectedProductIds.length === 0 && companyProds.length > 0) {
        setSelectedProductIds(companyProds.map((p) => p.id));
      }
    } else if (step === 2) {
      if (selectedProductIds.length === 0) {
        setErrors({ products: 'Please select at least one fuel product' });
        return;
      }
      setErrors({});
      dispatch(updateSelectedProducts(selectedProductIds));
    } else if (step === 3) {
      // Trigger celebratory confetti on reaching step 4
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {
        // Fallback gracefully if confetti unavailable
      }
    }

    setStep((prev) => Math.min(prev + 1, totalSteps));
  };

  const handlePrevStep = () => {
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const toggleProductSelect = (productId: string) => {
    if (selectedProductIds.includes(productId)) {
      if (selectedProductIds.length === 1) return; // keep at least 1
      setSelectedProductIds(selectedProductIds.filter((id) => id !== productId));
    } else {
      setSelectedProductIds([...selectedProductIds, productId]);
    }
  };

  const handleFileUpload = (dipChart: DipChartFile) => {
    setDipCharts((prev) => ({
      ...prev,
      [dipChart.productId]: dipChart,
    }));
    dispatch(addDipChart(dipChart));
  };

  const handleFileRemove = (productId: string) => {
    setDipCharts((prev) => {
      const next = { ...prev };
      delete next[productId];
      return next;
    });
  };

  const handleFinishSetup = () => {
    dispatch(updatePersonalDetails({ fullName }));
    dispatch(updatePumpDetails({ pumpName, pumpCompany, pumpAddress }));
    dispatch(updateSelectedProducts(selectedProductIds));
    dispatch(completeOnboarding());

    const updatedProfile = {
      id: profile?.id || 'usr-default',
      email: profile?.email || 'user@fuelpump.com',
      fullName,
      pumpName,
      pumpCompany,
      pumpAddress,
      selectedProductIds,
      nozzleCounts: profile?.nozzleCounts || {},
      dipChartsUploaded: profile?.dipChartsUploaded || {},
      isOnboarded: true,
    };
    supabaseSyncService.syncProfileToSupabase(updatedProfile);

    onWizardComplete();
  };

  const selectedProductsList = availableProducts.filter((p) =>
    selectedProductIds.includes(p.id)
  );

  return (
    <div
      style={{
        maxWidth: '640px',
        margin: '0 auto',
        padding: '24px 16px 80px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
      }}
    >
      {/* Header Banner */}
      <div style={{ textAlign: 'center', marginBottom: '8px' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 16px',
            borderRadius: '20px',
            backgroundColor: 'var(--color-primary-container)',
            color: 'var(--color-primary)',
            fontSize: '0.85rem',
            fontWeight: 700,
            marginBottom: '12px',
          }}
        >
          <Sparkles size={16} /> Fuel Gain Onboarding Wizard
        </div>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>
          {step === 1 && 'Station & Owner Setup'}
          {step === 2 && 'Select Fuel Products'}
          {step === 3 && 'Upload Dip Charts'}
          {step === 4 && 'All Set & Ready!'}
        </h1>
        <p style={{ fontSize: '0.88rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
          Step {step} of {totalSteps} — Configure your fuel station parameters for accurate gain/loss analysis
        </p>
      </div>

      {/* Progress Bar */}
      <ProgressBar progress={(step / totalSteps) * 100} showPercentage={false} height={8} />

      {/* Step Content */}
      {step === 1 && (
        <MD3Card variant="elevated" style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px', color: 'var(--color-text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Building2 size={20} color="var(--color-primary)" /> Fuel Station Profile
          </h2>

          <MD3Input
            label="Owner / Manager Full Name"
            placeholder="e.g. Rajesh Sharma"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            error={errors.fullName}
            leftIcon={<User size={18} />}
          />

          <MD3Input
            label="Pump / Filling Station Name"
            placeholder="e.g. Shree Ganesh HPCL Filling Station"
            value={pumpName}
            onChange={(e) => setPumpName(e.target.value)}
            error={errors.pumpName}
            leftIcon={<Building2 size={18} />}
          />

          {/* Company Select */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
              Oil Marketing Company (OMC)
            </label>
            <select
              value={pumpCompany}
              onChange={(e) => {
                const code = e.target.value as PetrolCompanyCode;
                setPumpCompany(code);
                // Reset selected products when company changes
                const newProds = COMPANY_PRODUCTS_MAP[code]?.map((p) => p.id) || [];
                setSelectedProductIds(newProds);
              }}
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: '12px',
                border: '1.5px solid var(--color-card-border)',
                backgroundColor: 'var(--color-surface-variant)',
                color: 'var(--color-text-primary)',
                fontSize: '0.95rem',
                fontWeight: 600,
                outline: 'none',
              }}
            >
              {PETROL_COMPANIES.map((company) => (
                <option key={company.id} value={company.code}>
                  {company.name}
                </option>
              ))}
            </select>
          </div>

          <MD3Input
            label="Station Address (Optional)"
            placeholder="e.g. NH-48, Sector 14, Gurugram, Haryana"
            value={pumpAddress}
            onChange={(e) => setPumpAddress(e.target.value)}
            leftIcon={<MapPin size={18} />}
          />
        </MD3Card>
      )}

      {step === 2 && (
        <MD3Card variant="elevated" style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '6px', color: 'var(--color-text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Fuel size={20} color="var(--color-primary)" /> Select Active Products ({pumpCompany})
          </h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', marginBottom: '16px' }}>
            Select all fuel products available at your station to calculate exact daily gain & losses.
          </p>

          {errors.products && (
            <div style={{ color: 'var(--color-error)', fontSize: '0.85rem', marginBottom: '12px', fontWeight: 600 }}>
              {errors.products}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {availableProducts.map((prod) => {
              const isSelected = selectedProductIds.includes(prod.id);
              return (
                <div
                  key={prod.id}
                  onClick={() => toggleProductSelect(prod.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '14px 16px',
                    borderRadius: '14px',
                    border: isSelected
                      ? '2px solid var(--color-primary)'
                      : '1.5px solid var(--color-card-border)',
                    backgroundColor: isSelected
                      ? 'var(--color-primary-container)'
                      : 'var(--color-surface)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div
                      style={{
                        padding: '10px',
                        borderRadius: '10px',
                        backgroundColor: isSelected
                          ? 'var(--color-primary)'
                          : 'var(--color-surface-variant)',
                        color: isSelected ? '#FFFFFF' : 'var(--color-text-muted)',
                      }}
                    >
                      <Fuel size={20} />
                    </div>
                    <div>
                      <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                        {prod.name}
                      </h4>
                      {prod.description && (
                        <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                          {prod.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      border: isSelected ? 'none' : '2px solid var(--color-card-border)',
                      backgroundColor: isSelected ? 'var(--color-primary)' : 'transparent',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#FFFFFF',
                    }}
                  >
                    {isSelected && <CheckCircle2 size={16} />}
                  </div>
                </div>
              );
            })}
          </div>
        </MD3Card>
      )}

      {step === 3 && (
        <MD3Card variant="elevated" style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '6px', color: 'var(--color-text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileCheck size={20} color="var(--color-primary)" /> Upload Tank Calibration Dip Charts
          </h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', marginBottom: '16px' }}>
            Upload PDF dip chart reference files for selected products to enable automated dip to volume conversion.
          </p>

          <div>
            {selectedProductsList.map((prod) => (
              <DipChartUploadCard
                key={prod.id}
                product={prod}
                uploadedFile={dipCharts[prod.id]}
                onFileUpload={handleFileUpload}
                onFileRemove={() => handleFileRemove(prod.id)}
              />
            ))}
          </div>
        </MD3Card>
      )}

      {step === 4 && (
        <MD3Card variant="elevated" style={{ padding: '28px', textAlign: 'center' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: 'rgba(16, 185, 129, 0.15)',
              color: 'var(--color-success)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto',
            }}
          >
            <ShieldCheck size={36} />
          </div>

          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: '8px' }}>
            Setup Completed!
          </h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', marginBottom: '24px' }}>
            Your station <strong>{pumpName}</strong> ({pumpCompany}) has been configured with{' '}
            <strong>{selectedProductIds.length} active products</strong>.
          </p>

          <div
            style={{
              textAlign: 'left',
              backgroundColor: 'var(--color-surface-variant)',
              padding: '16px',
              borderRadius: '14px',
              marginBottom: '24px',
              fontSize: '0.85rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--color-text-muted)' }}>Station Manager:</span>
              <strong style={{ color: 'var(--color-text-primary)' }}>{fullName}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--color-text-muted)' }}>OMC Company:</span>
              <strong style={{ color: 'var(--color-text-primary)' }}>{pumpCompany}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--color-text-muted)' }}>Configured Products:</span>
              <strong style={{ color: 'var(--color-primary)' }}>
                {selectedProductsList.map((p) => p.name).join(', ')}
              </strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--color-text-muted)' }}>Dip Charts Uploaded:</span>
              <strong style={{ color: 'var(--color-success)' }}>
                {Object.keys(dipCharts).length} / {selectedProductsList.length} files
              </strong>
            </div>
          </div>

          <MD3Button
            variant="accent"
            size="lg"
            fullWidth
            onClick={handleFinishSetup}
            leftIcon={<Zap size={20} />}
          >
            Launch Dashboard
          </MD3Button>
        </MD3Card>
      )}

      {/* Navigation Footer */}
      {step < 4 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', marginTop: '8px' }}>
          {step > 1 ? (
            <MD3Button variant="outline" onClick={handlePrevStep} leftIcon={<ArrowLeft size={18} />}>
              Back
            </MD3Button>
          ) : (
            <div />
          )}

          <MD3Button variant="primary" onClick={handleNextStep} rightIcon={<ArrowRight size={18} />}>
            {step === 3 ? 'Review & Complete' : 'Continue'}
          </MD3Button>
        </div>
      )}
    </div>
  );
};