import React, { useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Moon,
  Sun,
  Bell,
  Database,
  ArrowLeft,
  CheckCircle2,
  DownloadCloud,
  UploadCloud,
  Fuel,
  Building2,
  User,
  MapPin,
  FileText,
  LogOut,
  Sliders,
  AlertCircle,
  Save,
} from 'lucide-react';
import { MD3Card } from '../components/MD3Card';
import { MD3Button } from '../components/MD3Button';
import { MD3Input } from '../components/MD3Input';
import type { RootState } from '../storage/reduxStore';
import {
  toggleTheme,
  toggleNotifications,
} from '../storage/slices/themeSlice';
import {
  updatePersonalDetails,
  updatePumpDetails,
  updateNozzleCounts,
  logout,
} from '../storage/slices/userSlice';
import { importAllEntries } from '../storage/slices/entrySlice';
import { COMPANY_PRODUCTS_MAP } from '../constants/companyProducts';
import { generateBackupJson, downloadBackupFile, parseAndValidateBackup } from '../helpers/backupRestore';
import { supabaseSyncService } from '../services/supabaseSyncService';
import type { PetrolCompanyCode, FuelProduct } from '../types';

interface SettingsScreenProps {
  onBack: () => void;
  onLogout?: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ onBack }) => {
  const dispatch = useDispatch();
  const settings = useSelector((state: RootState) => state.theme);
  const profile = useSelector((state: RootState) => state.user.profile);
  const entries = useSelector((state: RootState) => state.entries.entries);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Nozzle Configuration local state
  const selectedProductIds = profile?.selectedProductIds || [];
  const currentNozzleCounts = profile?.nozzleCounts || {};
  const [localNozzleCounts, setLocalNozzleCounts] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    selectedProductIds.forEach((id: string) => {
      initial[id] = currentNozzleCounts[id] || 4; // Default 4 if unconfigured
    });
    return initial;
  });
  const [nozzleSaveSuccess, setNozzleSaveSuccess] = useState(false);

  // Profile local state
  const [fullName, setFullName] = useState(profile?.fullName || '');
  const [pumpName, setPumpName] = useState(profile?.pumpName || '');
  const pumpCompany: PetrolCompanyCode = profile?.pumpCompany || 'HPCL';
  const [pumpAddress, setPumpAddress] = useState(profile?.pumpAddress || '');
  const [profileSaveSuccess, setProfileSaveSuccess] = useState(false);

  // Backup & Restore state
  const [noticeMsg, setNoticeMsg] = useState<{ text: string; isError?: boolean } | null>(null);

  // Available products for current OMC
  const companyProducts = (profile?.pumpCompany && COMPANY_PRODUCTS_MAP[profile.pumpCompany as PetrolCompanyCode]) || COMPANY_PRODUCTS_MAP.HPCL;
  const activeProducts = companyProducts.filter((p: FuelProduct) => selectedProductIds.includes(p.id));

  // Handle Nozzle Count Changes
  const handleNozzleChange = (productId: string, val: number) => {
    const count = Math.max(1, Math.min(24, val || 1));
    setLocalNozzleCounts((prev) => ({
      ...prev,
      [productId]: count,
    }));
  };

  const handleSaveNozzleConfig = () => {
    dispatch(updateNozzleCounts(localNozzleCounts));
    setNozzleSaveSuccess(true);
    setTimeout(() => setNozzleSaveSuccess(false), 2500);
  };

  // Handle Profile Details Save
  const handleSaveProfileDetails = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(updatePersonalDetails({ fullName }));
    dispatch(updatePumpDetails({ pumpName, pumpCompany, pumpAddress }));
    setProfileSaveSuccess(true);
    setTimeout(() => setProfileSaveSuccess(false), 2500);
  };

  // Data Backup JSON Export
  const handleExportBackup = () => {
    try {
      const json = generateBackupJson(profile, settings, entries);
      downloadBackupFile(json);
      setNoticeMsg({ text: 'Backup downloaded successfully as JSON file!' });
      setTimeout(() => setNoticeMsg(null), 3000);
    } catch (err: any) {
      setNoticeMsg({ text: err.message || 'Backup failed', isError: true });
      setTimeout(() => setNoticeMsg(null), 3500);
    }
  };

  // Sync all data to Supabase Database
  const handleSyncToSupabase = async () => {
    setNoticeMsg({ text: 'Syncing all records to Supabase Cloud Database...' });
    try {
      if (profile) {
        await supabaseSyncService.syncProfileToSupabase(profile);
      }
      const count = await supabaseSyncService.syncAllEntriesToSupabase(entries);
      setNoticeMsg({ text: `Successfully synced ${count} daily entries & profile to Supabase database!` });
      setTimeout(() => setNoticeMsg(null), 4000);
    } catch (err: any) {
      setNoticeMsg({ text: `Supabase sync failed: ${err.message || err}`, isError: true });
      setTimeout(() => setNoticeMsg(null), 4000);
    }
  };

  // Restore Data JSON Import
  const handleRestoreFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const payload = parseAndValidateBackup(content);

        if (payload.entries) {
          dispatch(importAllEntries(payload.entries));
        }
        if (payload.profile?.nozzleCounts) {
          dispatch(updateNozzleCounts(payload.profile.nozzleCounts));
        }

        setNoticeMsg({ text: 'Data & daily entries restored successfully!' });
        setTimeout(() => setNoticeMsg(null), 3500);
      } catch (err: any) {
        setNoticeMsg({ text: `Restore failed: ${err.message}`, isError: true });
        setTimeout(() => setNoticeMsg(null), 4000);
      }
    };
    reader.readAsText(file);
  };

  const handleLogout = () => {
    if (confirm('Are you sure you want to log out of Fuel Gain?')) {
      dispatch(logout());
      onBack();
    }
  };

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '16px 16px 90px 16px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Settings Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button
          onClick={onBack}
          style={{
            background: 'var(--color-surface-variant)',
            border: 'none',
            padding: '10px',
            borderRadius: '12px',
            cursor: 'pointer',
            color: 'var(--color-text-primary)',
          }}
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>
            Application Settings
          </h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)' }}>
            Configure nozzles, products, profile, notifications & backups
          </p>
        </div>
      </div>

      {noticeMsg && (
        <div
          className="animate-fade-in"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 16px',
            borderRadius: '12px',
            backgroundColor: noticeMsg.isError ? 'var(--color-errorContainer)' : 'rgba(16, 185, 129, 0.15)',
            color: noticeMsg.isError ? 'var(--color-error)' : 'var(--color-success)',
            fontWeight: 600,
            fontSize: '0.85rem',
          }}
        >
          {noticeMsg.isError ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
          {noticeMsg.text}
        </div>
      )}

      {/* SECTION 1: NOZZLE CONFIGURATION */}
      <MD3Card variant="elevated" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--color-text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sliders size={20} color="var(--color-primary)" /> Nozzle Configuration
            </h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
              Specify the number of active dispensing nozzles per product selected during profile setup.
            </p>
          </div>
        </div>

        {nozzleSaveSuccess && (
          <div style={{ padding: '8px 12px', borderRadius: '8px', backgroundColor: 'rgba(16, 185, 129, 0.15)', color: 'var(--color-success)', fontSize: '0.82rem', fontWeight: 600, marginBottom: '12px' }}>
            <CheckCircle2 size={14} style={{ display: 'inline', marginRight: '4px' }} /> Nozzle counts updated & synced to Entry screen!
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
          {activeProducts.length > 0 ? (
            activeProducts.map((product: FuelProduct) => {
              const currentVal = localNozzleCounts[product.id] ?? 4;
              return (
                <div
                  key={product.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 14px',
                    borderRadius: '12px',
                    backgroundColor: 'var(--color-surface-variant)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ padding: '8px', borderRadius: '8px', backgroundColor: 'var(--color-primary-container)', color: 'var(--color-primary)' }}>
                      <Fuel size={18} />
                    </div>
                    <div>
                      <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                        {product.name}
                      </h4>
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                        Code: {product.code}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                      Nozzles:
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={24}
                      value={currentVal}
                      onChange={(e) => handleNozzleChange(product.id, parseInt(e.target.value))}
                      style={{
                        width: '64px',
                        padding: '8px',
                        borderRadius: '8px',
                        border: '1.5px solid var(--color-card-border)',
                        textAlign: 'center',
                        fontSize: '0.95rem',
                        fontWeight: 700,
                        backgroundColor: 'var(--color-surface)',
                        color: 'var(--color-text-primary)',
                      }}
                    />
                  </div>
                </div>
              );
            })
          ) : (
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
              No products selected. Please configure products in profile setup.
            </p>
          )}
        </div>

        <MD3Button variant="primary" size="md" onClick={handleSaveNozzleConfig} leftIcon={<Save size={16} />}>
          Save Nozzle Configuration
        </MD3Button>
      </MD3Card>

      {/* SECTION 2: PRODUCT MANAGEMENT (VIEW ONLY) */}
      <MD3Card variant="elevated" style={{ padding: '20px' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '4px', color: 'var(--color-text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Fuel size={20} color="var(--color-primary)" /> Product Management (View Only)
        </h3>
        <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginBottom: '14px' }}>
          Configured products and dip chart PDF status for {profile?.pumpCompany || 'OMC'}.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {activeProducts.map((prod: FuelProduct) => {
            const dipChart = profile?.dipChartsUploaded?.[prod.id];
            return (
              <div
                key={prod.id}
                style={{
                  padding: '12px 14px',
                  borderRadius: '12px',
                  border: '1.5px solid var(--color-card-border)',
                  backgroundColor: 'var(--color-surface)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                    {prod.name}
                  </h4>
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                    {prod.description || 'Standard Fuel Spec'}
                  </p>
                </div>

                <div>
                  {dipChart ? (
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        padding: '4px 10px',
                        borderRadius: '20px',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        color: 'var(--color-success)',
                      }}
                    >
                      <FileText size={12} /> {dipChart.fileName}
                    </span>
                  ) : (
                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        padding: '4px 10px',
                        borderRadius: '20px',
                        backgroundColor: 'var(--color-surface-variant)',
                        color: 'var(--color-text-muted)',
                      }}
                    >
                      No Dip Chart Uploaded
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </MD3Card>

      {/* SECTION 3: PROFILE SETTINGS */}
      <MD3Card variant="elevated" style={{ padding: '20px' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '14px', color: 'var(--color-text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <User size={20} color="var(--color-primary)" /> Profile Details
        </h3>

        {profileSaveSuccess && (
          <div style={{ padding: '8px 12px', borderRadius: '8px', backgroundColor: 'rgba(16, 185, 129, 0.15)', color: 'var(--color-success)', fontSize: '0.82rem', fontWeight: 600, marginBottom: '12px' }}>
            <CheckCircle2 size={14} style={{ display: 'inline', marginRight: '4px' }} /> Profile details saved!
          </div>
        )}

        <form onSubmit={handleSaveProfileDetails}>
          <MD3Input
            label="Owner / Manager Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            leftIcon={<User size={18} />}
          />
          <MD3Input
            label="Pump Station Name"
            value={pumpName}
            onChange={(e) => setPumpName(e.target.value)}
            leftIcon={<Building2 size={18} />}
          />
          <MD3Input
            label="Station Address"
            value={pumpAddress}
            onChange={(e) => setPumpAddress(e.target.value)}
            leftIcon={<MapPin size={18} />}
          />

          <MD3Button type="submit" variant="primary" size="md" leftIcon={<Save size={16} />}>
            Save Profile Details
          </MD3Button>
        </form>
      </MD3Card>

      {/* SECTION 4: NOTIFICATION SETTINGS */}
      <MD3Card variant="elevated" style={{ padding: '20px' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '14px', color: 'var(--color-text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Bell size={20} color="var(--color-primary)" /> Notification Settings
        </h3>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0' }}>
          <div>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
              Daily Entry Reminders
            </h4>
            <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
              Receive automated reminders to submit dip & nozzle closing readings
            </p>
          </div>
          <input
            type="checkbox"
            checked={settings.notificationsEnabled}
            onChange={() => dispatch(toggleNotifications())}
            style={{ width: '20px', height: '20px', cursor: 'pointer' }}
          />
        </div>
      </MD3Card>

      {/* SECTION 5 & 6: DATA BACKUP & RESTORE DATA */}
      <MD3Card variant="elevated" style={{ padding: '20px' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '4px', color: 'var(--color-text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Database size={20} color="var(--color-primary)" /> Data Backup & Restore
        </h3>
        <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginBottom: '16px' }}>
          Export your complete station configuration and daily entries to a JSON backup file, or restore from a previously saved JSON file.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
          <MD3Button
            variant="outline"
            onClick={handleExportBackup}
            leftIcon={<DownloadCloud size={18} />}
          >
            Export Backup (JSON)
          </MD3Button>

          <MD3Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            leftIcon={<UploadCloud size={18} />}
          >
            Restore Data (JSON)
          </MD3Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            style={{ display: 'none' }}
            onChange={handleRestoreFileChange}
          />
        </div>

        <MD3Button
          variant="primary"
          fullWidth
          onClick={handleSyncToSupabase}
          leftIcon={<Database size={18} />}
        >
          Sync All Records to Supabase Database
        </MD3Button>
      </MD3Card>

      {/* SECTION 7: DARK MODE */}
      <MD3Card variant="elevated" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {settings.theme === 'dark' ? <Moon size={20} color="var(--color-primary)" /> : <Sun size={20} color="var(--color-primary)" />}
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                Dark Mode
              </h4>
              <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                Current theme: {settings.theme === 'dark' ? 'Dark Theme' : 'Light Theme'}
              </span>
            </div>
          </div>
          <MD3Button variant="outline" size="sm" onClick={() => dispatch(toggleTheme())}>
            Switch to {settings.theme === 'dark' ? 'Light' : 'Dark'} Mode
          </MD3Button>
        </div>
      </MD3Card>

      {/* SECTION 8: LOGOUT */}
      <MD3Card variant="elevated" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
              Sign Out
            </h4>
            <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
              Signed in as {profile?.email || 'user@pumpgain.com'}
            </span>
          </div>
          <MD3Button variant="danger" size="sm" onClick={handleLogout} leftIcon={<LogOut size={16} />}>
            Logout
          </MD3Button>
        </div>
      </MD3Card>
    </div>
  );
};
