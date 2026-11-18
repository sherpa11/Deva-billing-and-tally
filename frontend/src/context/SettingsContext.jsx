import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/api';

const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(() => {
    try {
      const cached = localStorage.getItem('deva_settings');
      if (cached) return JSON.parse(cached);
    } catch (e) {
      console.warn('Failed to parse cached settings', e);
    }
    return {
      storeName: 'தேவா & கோ',
      tagline: 'தக்காளி & காய்கனி கமிஷன் மண்டி',
      proprietor: 'R. தேவதாஸ்',
      address: '54 A, அண்ணல் காந்தி மார்க்கெட், திண்டுக்கல் – 624 001',
      phones: ['94433 18359', '95853 56765'],
      footerNote: 'தாங்கள் வருகை நல்வரவு !',
      defaultCommissionRate: 10,
      buyerBillFormat: 'square',
      supplierBillFormat: 'pad'
    };
  });
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      const res = await api.get('/settings');
      if (res.data.success && res.data.settings) {
        setSettings(res.data.settings);
        try {
          localStorage.setItem('deva_settings', JSON.stringify(res.data.settings));
        } catch {}
      }
    } catch (err) {
      console.error('Failed to load settings', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const updateSettings = async (newSettings) => {
    const res = await api.put('/settings', newSettings);
    if (res.data.success && res.data.settings) {
      setSettings(res.data.settings);
      try {
        localStorage.setItem('deva_settings', JSON.stringify(res.data.settings));
      } catch {}
      return res.data;
    }
    throw new Error(res.data.message || 'Failed to update settings');
  };

  return (
    <SettingsContext.Provider value={{ settings, loading, fetchSettings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);
