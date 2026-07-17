// ============================================================
// SettingsContext.jsx — Branding global de la liga
// ============================================================
// POR QUÉ: el nombre y el logo de la liga estaban hardcodeados en el
// navbar. Ahora viven en la DB (tabla settings) y se editan desde el
// admin. Centralizamos su carga acá para que cualquier componente
// (navbar, hero) los consuma, y que al editarlos en el admin se
// refresquen en vivo vía reloadSettings().
// ============================================================

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../../services/api';

const SettingsContext = createContext(null);

const DEFAULTS = { league_name: 'Liga TPO', league_logo_url: null };

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(DEFAULTS);

  const reloadSettings = useCallback(async () => {
    try {
      const res = await api.get('/settings');
      if (res.ok) {
        const data = await res.json();
        setSettings({ ...DEFAULTS, ...data });
      }
    } catch (err) {
      console.error('Error cargando settings de la liga:', err);
    }
  }, []);

  useEffect(() => {
    reloadSettings();
  }, [reloadSettings]);

  return (
    <SettingsContext.Provider value={{ settings, reloadSettings, setSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings debe usarse dentro de <SettingsProvider>');
  return ctx;
};
