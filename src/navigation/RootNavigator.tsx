import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../storage/reduxStore';
import { SplashScreen } from '../screens/SplashScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { SignupScreen } from '../screens/SignupScreen';
import { ProfileSetupWizard } from '../screens/ProfileSetupWizard';
import { DashboardScreen } from '../screens/DashboardScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { EntryScreen } from '../screens/EntryScreen';
import { ReportsScreen } from '../screens/ReportsScreen';
import { TopAppBar } from '../components/TopAppBar';
import { BottomNavigation, type NavTab } from '../components/BottomNavigation';

type ScreenRoute = 'splash' | 'login' | 'signup' | 'wizard' | 'main' | 'settings';

export const RootNavigator: React.FC = () => {
  const user = useSelector((state: RootState) => state.user);
  const [currentRoute, setCurrentRoute] = useState<ScreenRoute>('splash');
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');

  // Handle Splash Screen Completion
  const handleSplashComplete = () => {
    if (user.isAuthenticated && (user.isOnboarded || !!user.profile?.pumpName)) {
      setCurrentRoute('main');
    } else if (user.isAuthenticated && !user.isOnboarded && !user.profile?.pumpName) {
      setCurrentRoute('wizard');
    } else {
      setCurrentRoute('login');
    }
  };

  // Render main tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardScreen onNavigateTab={setActiveTab} />;
      case 'entry':
        return <EntryScreen />;
      case 'reports':
        return <ReportsScreen />;
      case 'profile':
        return (
          <ProfileScreen
            onLogout={() => setCurrentRoute('login')}
            onEditWizard={() => setCurrentRoute('wizard')}
          />
        );
    }
  };

  return (
    <div style={{ width: '100%', minHeight: '100vh', backgroundColor: 'var(--color-bg)' }}>
      {currentRoute === 'splash' && <SplashScreen onComplete={handleSplashComplete} />}

      {currentRoute === 'login' && (
        <LoginScreen
          onLoginSuccess={() => {
            const hasStation = user.profile?.pumpName || user.isOnboarded;
            setCurrentRoute(hasStation ? 'main' : 'wizard');
          }}
          onNavigateSignup={() => setCurrentRoute('signup')}
          onNavigateForgotPassword={() => alert('Password reset email sent!')}
        />
      )}

      {currentRoute === 'signup' && (
        <SignupScreen
          onSignupSuccess={() => {
            const hasStation = user.profile?.pumpName || user.isOnboarded;
            setCurrentRoute(hasStation ? 'main' : 'wizard');
          }}
          onNavigateLogin={() => setCurrentRoute('login')}
        />
      )}

      {currentRoute === 'wizard' && (
        <ProfileSetupWizard onWizardComplete={() => setCurrentRoute('main')} />
      )}

      {currentRoute === 'settings' && (
        <SettingsScreen onBack={() => setCurrentRoute('main')} />
      )}

      {currentRoute === 'main' && (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <TopAppBar
            onNavigateSettings={() => setCurrentRoute('settings')}
            onNavigateProfile={() => setActiveTab('profile')}
          />
          <main style={{ flex: 1, overflowY: 'auto' }}>{renderTabContent()}</main>
          <BottomNavigation activeTab={activeTab} onSelectTab={setActiveTab} />
        </div>
      )}
    </div>
  );
};
