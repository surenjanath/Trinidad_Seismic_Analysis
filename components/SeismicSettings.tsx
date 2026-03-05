import React, { useState } from 'react';
import { 
  Bell, 
  Globe, 
  Shield, 
  Database, 
  Moon, 
  Volume2, 
  Wifi, 
  Smartphone,
  Check,
  AlertTriangle
} from 'lucide-react';

const SeismicSettings: React.FC = () => {
  const [notifications, setNotifications] = useState(true);
  const [sound, setSound] = useState(false);
  const [minMagAlert, setMinMagAlert] = useState(5.0);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshRate, setRefreshRate] = useState(300); // seconds
  const [units, setUnits] = useState<'metric' | 'imperial'>('metric');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [dataRetention, setDataRetention] = useState('30d');

  const Toggle = ({ checked, onChange }: { checked: boolean, onChange: (v: boolean) => void }) => (
    <button 
      onClick={() => onChange(!checked)}
      className={`w-11 h-6 rounded-full relative transition-colors duration-200 ease-in-out ${checked ? 'bg-orange-600' : 'bg-slate-700'}`}
    >
      <span 
        className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full shadow transition-transform duration-200 ease-in-out ${checked ? 'translate-x-5' : 'translate-x-0'}`}
      />
    </button>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-display font-bold text-slate-200">System Settings</h2>
        <p className="text-slate-500">Configure monitoring parameters and application preferences</p>
      </div>

      {/* Notifications & Alerts */}
      <section className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
        <div className="p-4 border-b border-slate-800 bg-slate-900/50 flex items-center gap-3">
          <Bell className="text-orange-500" size={20} />
          <h3 className="font-medium text-slate-200">Notifications & Alerts</h3>
        </div>
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-slate-200 font-medium">Push Notifications</div>
              <div className="text-slate-500 text-sm">Receive alerts for significant seismic events</div>
            </div>
            <Toggle checked={notifications} onChange={setNotifications} />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <div className="text-slate-200 font-medium">Alert Sound</div>
              <div className="text-slate-500 text-sm">Play a sound when a new event is detected</div>
            </div>
            <Toggle checked={sound} onChange={setSound} />
          </div>

          <div className="pt-4 border-t border-slate-800">
            <label className="block text-slate-200 font-medium mb-2">Minimum Magnitude Threshold</label>
            <div className="flex items-center gap-4">
              <input 
                type="range" 
                min="0" 
                max="9" 
                step="0.1" 
                value={minMagAlert} 
                onChange={(e) => setMinMagAlert(parseFloat(e.target.value))}
                className="flex-1 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
              />
              <span className="font-mono font-bold text-orange-500 text-lg w-12 text-right">M{minMagAlert.toFixed(1)}</span>
            </div>
            <p className="text-slate-500 text-xs mt-2">Only alert for earthquakes stronger than M{minMagAlert}</p>
          </div>
        </div>
      </section>

      {/* Data & Network */}
      <section className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
        <div className="p-4 border-b border-slate-800 bg-slate-900/50 flex items-center gap-3">
          <Wifi className="text-blue-500" size={20} />
          <h3 className="font-medium text-slate-200">Data & Network</h3>
        </div>
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-slate-200 font-medium">Auto-Refresh Data</div>
              <div className="text-slate-500 text-sm">Automatically fetch new seismic data</div>
            </div>
            <Toggle checked={autoRefresh} onChange={setAutoRefresh} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-slate-400 text-sm mb-2">Refresh Interval</label>
              <select 
                value={refreshRate}
                onChange={(e) => setRefreshRate(parseInt(e.target.value))}
                disabled={!autoRefresh}
                className="w-full bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-3 py-2 outline-none focus:border-blue-500 disabled:opacity-50"
              >
                <option value="60">Every 1 minute</option>
                <option value="300">Every 5 minutes</option>
                <option value="900">Every 15 minutes</option>
                <option value="3600">Every hour</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-400 text-sm mb-2">Local Data Retention</label>
              <select 
                value={dataRetention}
                onChange={(e) => setDataRetention(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-3 py-2 outline-none focus:border-blue-500"
              >
                <option value="7d">7 Days</option>
                <option value="30d">30 Days</option>
                <option value="90d">90 Days</option>
                <option value="forever">Forever</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Display Preferences */}
      <section className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
        <div className="p-4 border-b border-slate-800 bg-slate-900/50 flex items-center gap-3">
          <Globe className="text-emerald-500" size={20} />
          <h3 className="font-medium text-slate-200">Display Preferences</h3>
        </div>
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-slate-200 font-medium">Measurement Units</div>
              <div className="text-slate-500 text-sm">Choose your preferred unit system</div>
            </div>
            <div className="flex bg-slate-800 rounded-lg p-1 border border-slate-700">
              <button 
                onClick={() => setUnits('metric')}
                className={`px-3 py-1.5 rounded text-xs font-medium transition-all ${units === 'metric' ? 'bg-slate-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
              >
                Metric (km)
              </button>
              <button 
                onClick={() => setUnits('imperial')}
                className={`px-3 py-1.5 rounded text-xs font-medium transition-all ${units === 'imperial' ? 'bg-slate-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
              >
                Imperial (mi)
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* About */}
      <section className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
        <div className="p-4 border-b border-slate-800 bg-slate-900/50 flex items-center gap-3">
            <Shield className="text-slate-400" size={20} />
            <h3 className="font-medium text-slate-200">System Info</h3>
        </div>
        <div className="p-6">
            <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-slate-800 rounded-lg flex items-center justify-center">
                    <Database size={24} className="text-slate-500" />
                </div>
                <div>
                    <div className="text-slate-200 font-medium">Seismic Monitor v2.1.0</div>
                    <div className="text-slate-500 text-sm">Build 2024.10.24-RC2</div>
                </div>
            </div>
            <div className="text-xs text-slate-500 font-mono bg-slate-950 p-3 rounded border border-slate-800">
                Connection Status: CONNECTED<br/>
                Server Latency: 45ms<br/>
                Data Source: USGS / EMSC / Regional Networks
            </div>
        </div>
      </section>

    </div>
  );
};

export default SeismicSettings;
