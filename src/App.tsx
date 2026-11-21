import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { NavigationShell } from './components/layout/NavigationShell';
import { WelcomePage } from './pages/WelcomePage';
import { ChooseHousePage } from './pages/ChooseHousePage';
import { DashboardPage } from './pages/DashboardPage';
import { ChatPage } from './pages/ChatPage';
import { ConstructionPage } from './pages/ConstructionPage';
import { MyCityPage } from './pages/MyCityPage';
import { MoodHistoryPage } from './pages/MoodHistoryPage';
import { ProfilePage } from './pages/ProfilePage';

const AppContent: React.FC = () => {
  const { currentRoute } = useApp();

  const renderCurrentPage = () => {
    switch (currentRoute) {
      case 'welcome':
        return <WelcomePage />;
      case 'choose-house':
        return <ChooseHousePage />;
      case 'dashboard':
        return <DashboardPage />;
      case 'chat':
        return <ChatPage />;
      case 'construction':
        return <ConstructionPage />;
      case 'my-city':
        return <MyCityPage />;
      case 'mood-history':
        return <MoodHistoryPage />;
      case 'profile-settings':
        return <ProfilePage />;
      default:
        return <DashboardPage />;
    }
  };

  return <NavigationShell>{renderCurrentPage()}</NavigationShell>;
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
