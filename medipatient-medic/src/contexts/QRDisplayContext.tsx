import React, { createContext, useContext, useState, useEffect } from 'react';

interface QRDisplaySettings {
  showPatientClaimQR: boolean;
  showAppStoreQR: boolean;
}

interface QRDisplayContextType {
  settings: QRDisplaySettings;
  updateSettings: (newSettings: Partial<QRDisplaySettings>) => void;
  resetToDefaults: () => void;
}

const defaultSettings: QRDisplaySettings = {
  showPatientClaimQR: true,
  showAppStoreQR: true,
};

const QRDisplayContext = createContext<QRDisplayContextType | undefined>(undefined);

export const useQRDisplay = () => {
  const context = useContext(QRDisplayContext);
  if (!context) {
    throw new Error('useQRDisplay must be used within a QRDisplayProvider');
  }
  return context;
};

export const QRDisplayProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<QRDisplaySettings>(() => {
    const saved = localStorage.getItem('qr-display-settings');
    if (saved) {
      try {
        return { ...defaultSettings, ...JSON.parse(saved) };
      } catch {
        return defaultSettings;
      }
    }
    return defaultSettings;
  });

  useEffect(() => {
    localStorage.setItem('qr-display-settings', JSON.stringify(settings));
  }, [settings]);

  const updateSettings = (newSettings: Partial<QRDisplaySettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const resetToDefaults = () => {
    setSettings(defaultSettings);
  };

  return (
    <QRDisplayContext.Provider value={{ settings, updateSettings, resetToDefaults }}>
      {children}
    </QRDisplayContext.Provider>
  );
};