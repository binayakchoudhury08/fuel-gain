import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Building2,
  Fuel,
  Edit,
  KeyRound,
  LogOut,
  Download,
  CheckCircle2,
  Trash2,
} from 'lucide-react';
import { MD3Card } from '../components/MD3Card';
import { MD3Button } from '../components/MD3Button';
import { AdminRoleBadge } from '../components/AdminRoleBadge';
import type { RootState } from '../storage/reduxStore';
import { logout } from '../storage/slices/userSlice';
import type { FuelProduct, PetrolCompanyCode } from '../types';
import { COMPANY_PRODUCTS_MAP } from '../constants/companyProducts';

interface ProfileScreenProps {
  onLogout: () => void;
  onEditWizard: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ onLogout, onEditWizard }) => {
  const dispatch = useDispatch();
  const profile = useSelector((state: RootState) => state.user.profile);
  const [notice, setNotice] = useState<string | null>(null);

  const handleLogoutClick = () => {
    dispatch(logout());
    onLogout();
  };

  const handleChangePassword = () => {
    setNotice('Password reset email sent to ' + (profile?.email || 'your registered email') + '!');
    setTimeout(() => setNotice(null), 3000);
  };

  const handleDeleteAccount = () => {
    if (confirm('WARNING: Are you sure you want to delete your account? All local and cloud data for this account will be erased.')) {
      if (profile?.email) {
        try {
          const accountsStr = localStorage.getItem('fuel_gain_accounts_v2');
          if (accountsStr) {
            const accounts = JSON.parse(accountsStr);
            delete accounts[profile.email.trim().toLowerCase()];
            localStorage.setItem('fuel_gain_accounts_v2', JSON.stringify(accounts));
          }
        } catch {
          // Ignore
        }
      }
      localStorage.removeItem('fuel_gain_remember_me');
      dispatch(logout());
      onLogout();
    }
  };

  const handleDownloadPdf = (fileName: string) => {
    setNotice(`Downloading ${fileName}...`);
    setTimeout(() => setNotice(null), 2500);
  };

  // Get active products
  const companyProducts = (profile?.pumpCompany && COMPANY_PRODUCTS_MAP[profile.pumpCompany as PetrolCompanyCode]) || COMPANY_PRODUCTS_MAP.HPCL;
  const selectedProducts = companyProducts.filter((p: FuelProduct) => profile?.selectedProductIds?.includes(p.id));

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '16px 16px 90px 16px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Profile Header Card */}
      <MD3Card
        variant="elevated"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          padding: '24px',
          background: 'var(--color-surface)',
          position: 'relative',
        }}
      >
        <div style={{ position: 'relative', marginBottom: '14px' }}>
          <img
            src={profile?.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200'}
            alt="User Avatar"
            style={{
              width: '84px',
              height: '84px',
              borderRadius: '50%',
              objectFit: 'cover',
              border: '3px solid var(--color-primary)',
              boxShadow: '0 4px 14px rgba(30, 64, 175, 0.25)',
            }}
          />
        </div>

        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: '4px' }}>
          {profile?.fullName || 'Rajesh Sharma'}
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginBottom: '10px' }}>
          {profile?.email || 'demo@pumpgain.com'}
        </p>

        <div style={{ marginBottom: '16px' }}>
          <AdminRoleBadge role="Owner" />
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <MD3Button variant="primary" size="sm" onClick={onEditWizard} leftIcon={<Edit size={16} />}>
            Re-run Setup Wizard
          </MD3Button>
          <MD3Button variant="outline" size="sm" onClick={handleChangePassword} leftIcon={<KeyRound size={16} />}>
            Change Password
          </MD3Button>
        </div>
      </MD3Card>

      {notice && (
        <div
          className="animate-fade-in"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 16px',
            borderRadius: '12px',
            backgroundColor: 'rgba(16, 185, 129, 0.15)',
            color: 'var(--color-success)',
            fontWeight: 700,
            fontSize: '0.88rem',
          }}
        >
          <CheckCircle2 size={18} /> {notice}
        </div>
      )}

      {/* Station Details Card */}
      <MD3Card variant="elevated" style={{ padding: '20px' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Building2 size={20} color="var(--color-primary)" /> Fuel Station Profile
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.9rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', backgroundColor: 'var(--color-surface-variant)', borderRadius: '10px' }}>
            <span style={{ color: 'var(--color-text-muted)' }}>Station Name:</span>
            <strong style={{ color: 'var(--color-text-primary)' }}>{profile?.pumpName || 'Shree Ganesh Filling Station'}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', backgroundColor: 'var(--color-surface-variant)', borderRadius: '10px' }}>
            <span style={{ color: 'var(--color-text-muted)' }}>OMC Company:</span>
            <strong style={{ color: 'var(--color-text-primary)' }}>{profile?.pumpCompany || 'HPCL'}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', backgroundColor: 'var(--color-surface-variant)', borderRadius: '10px' }}>
            <span style={{ color: 'var(--color-text-muted)' }}>Station Address:</span>
            <strong style={{ color: 'var(--color-text-primary)', textAlign: 'right', maxWidth: '60%' }}>{profile?.pumpAddress || 'NH-48, Sector 14, Gurugram'}</strong>
          </div>
        </div>
      </MD3Card>

      {/* Active Products & Dip Charts Card */}
      <MD3Card variant="elevated" style={{ padding: '20px' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Fuel size={20} color="var(--color-primary)" /> Active Fuel Products & Dip Charts
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {selectedProducts.map((prod: FuelProduct) => {
            const dipChart = profile?.dipChartsUploaded?.[prod.id];
            const nozzles = profile?.nozzleCounts?.[prod.id] || 4;
            return (
              <div
                key={prod.id}
                style={{
                  padding: '12px 14px',
                  borderRadius: '12px',
                  backgroundColor: 'var(--color-surface-variant)',
                  border: '1px solid var(--color-card-border)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <h4 style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>
                    {prod.name}
                  </h4>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                    {nozzles} Configured Dispensing Nozzles
                  </span>
                </div>

                {dipChart ? (
                  <button
                    onClick={() => handleDownloadPdf(dipChart.fileName)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      padding: '6px 12px',
                      borderRadius: '10px',
                      border: 'none',
                      backgroundColor: 'rgba(16, 185, 129, 0.15)',
                      color: 'var(--color-success)',
                      cursor: 'pointer',
                    }}
                  >
                    <Download size={14} /> PDF
                  </button>
                ) : (
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                    No Dip PDF
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </MD3Card>

      {/* Account Actions Card */}
      <MD3Card variant="elevated" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>
              Device & Account Actions
            </h4>
            <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
              Manage session and account deletion
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <MD3Button variant="outline" size="sm" onClick={handleLogoutClick} leftIcon={<LogOut size={16} />}>
            Sign Out
          </MD3Button>
          <MD3Button variant="danger" size="sm" onClick={handleDeleteAccount} leftIcon={<Trash2 size={16} />}>
            Delete Account
          </MD3Button>
        </div>
      </MD3Card>
    </div>
  );
};
