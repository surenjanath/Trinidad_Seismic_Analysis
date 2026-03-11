
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useEffect, useMemo } from 'react';
import { fetchSeismicData, SeismicEvent } from './src/services/SeismicService';
import SeismicMap from './components/SeismicMap';
import SeismicList from './components/SeismicList';
import SeismicStats from './components/SeismicStats';
import SeismicTrendChart from './components/SeismicTrendChart';
import SeismicDepthChart from './components/SeismicDepthChart';
import SeismicMagnitudeDist from './components/SeismicMagnitudeDist';
import SeismicEnergyChart from './components/SeismicEnergyChart';
import SeismicGutenbergRichter from './components/SeismicGutenbergRichter';
import SeismicHourlyDistribution from './components/SeismicHourlyDistribution';
import SeismicDepthDistribution from './components/SeismicDepthDistribution';
import Seismic3DViewer from './components/Seismic3DViewer';
import SeismicSettings from './components/SeismicSettings';
import SeismicComparison from './components/SeismicComparison';
import { 
  Activity, 
  Map as MapIcon, 
  BarChart2, 
  LayoutDashboard, 
  Settings, 
  Bell, 
  Search,
  Menu,
  X,
  RefreshCw,
  Filter,
  Zap,
  Calendar,
  Box,
  Download
} from 'lucide-react';
import { format, subDays, parseISO, formatDistanceToNow } from 'date-fns';

const App: React.FC = () => {
  const [events, setEvents] = useState<SeismicEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<SeismicEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'map' | 'analysis' | '3d' | 'settings'>('dashboard');
  
  // Filter State
  const [minMagnitude, setMinMagnitude] = useState(0);
  const [dateRange, setDateRange] = useState('all'); // all, 7d, 30d, 90d, 1y

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchSeismicData();
      setEvents(data);
      if (data.length > 0 && !selectedEvent) {
        setSelectedEvent(data[0]);
      }
    } catch (error) {
      console.error("Failed to load seismic data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // Auto-refresh every 5 minutes
    const interval = setInterval(loadData, 300000);
    return () => clearInterval(interval);
  }, []);

  // Filter Logic
  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      // Magnitude Filter
      if ((event.magnitude || 0) < minMagnitude) return false;

      // Date Filter
      if (dateRange !== 'all' && event.date) {
        const eventDate = new Date(event.date);
        const now = new Date();
        let cutoffDate = new Date();
        
        switch (dateRange) {
            case '7d': cutoffDate = subDays(now, 7); break;
            case '30d': cutoffDate = subDays(now, 30); break;
            case '90d': cutoffDate = subDays(now, 90); break;
            case '1y': cutoffDate = subDays(now, 365); break;
        }
        
        if (eventDate < cutoffDate) return false;
      }

      return true;
    });
  }, [events, minMagnitude, dateRange]);

  const SidebarItem = ({ icon: Icon, label, id, active }: { icon: any, label: string, id: string, active: boolean }) => (
    <button 
      onClick={() => {
        setActiveTab(id as any);
        setSidebarOpen(false);
      }}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
        active 
          ? 'bg-orange-500/10 text-orange-500 border-r-2 border-orange-500' 
          : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
      }`}
    >
      <Icon size={20} />
      <span className="font-medium tracking-wide text-sm">{label}</span>
    </button>
  );

  const handleExport = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
        + "ID,Location,Magnitude,Depth,Date,Type\n"
        + filteredEvents.map(e => `${e.id},"${e.location}",${e.magnitude},${e.depth},${e.date},${e.type}`).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `seismic_data_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-200 overflow-hidden font-sans">
      
      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 border-r border-slate-800 transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0
      `}>
        <div className="h-full flex flex-col">
          <div className="p-6 border-b border-slate-800 flex items-center gap-3">
            <div className="w-8 h-8 bg-orange-600 rounded flex items-center justify-center text-white font-bold shadow-lg shadow-orange-900/20">
              <Activity size={18} />
            </div>
            <div>
              <h1 className="font-display font-bold text-lg tracking-tight text-white leading-none">SEISMIC</h1>
              <p className="text-[10px] text-slate-500 font-mono uppercase tracking-widest mt-1">Monitor v2.1</p>
            </div>
          </div>

          <nav className="flex-1 p-4 space-y-2">
            <div className="text-xs font-mono text-slate-500 uppercase tracking-wider px-4 mb-2 mt-4">Main</div>
            <SidebarItem icon={LayoutDashboard} label="Dashboard" id="dashboard" active={activeTab === 'dashboard'} />
            <SidebarItem icon={MapIcon} label="Live Map" id="map" active={activeTab === 'map'} />
            <SidebarItem icon={BarChart2} label="Analytics" id="analysis" active={activeTab === 'analysis'} />
            <SidebarItem icon={Box} label="3D View" id="3d" active={activeTab === '3d'} />
            
            <div className="text-xs font-mono text-slate-500 uppercase tracking-wider px-4 mb-2 mt-8">System</div>
            <SidebarItem icon={Settings} label="Settings" id="settings" active={activeTab === 'settings'} />
          </nav>

          <div className="p-4 border-t border-slate-800">
            <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-xs font-mono text-emerald-400">SYSTEM ONLINE</span>
              </div>
              <p className="text-[10px] text-slate-500">Last update: {new Date().toLocaleTimeString()}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-950">
        
        {/* Header */}
        <header className="h-16 border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm flex items-center justify-between px-6 sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <button className="md:hidden text-slate-400 hover:text-white" onClick={() => setSidebarOpen(!sidebarOpen)}>
              <Menu size={24} />
            </button>
            <h2 className="text-lg font-display font-medium text-slate-200 hidden md:block">
              {activeTab === 'dashboard' && 'Overview'}
              {activeTab === 'map' && 'Geospatial View'}
              {activeTab === 'analysis' && 'Data Analysis'}
              {activeTab === '3d' && '3D Hypocenter Visualization'}
              {activeTab === 'settings' && 'System Configuration'}
            </h2>
            
            {/* Live Ticker */}
            <div className="hidden lg:flex items-center gap-2 px-4 py-1 bg-slate-900/80 rounded-full border border-slate-800 ml-4">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></div>
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">LATEST:</span>
                <span className="text-xs text-slate-300 truncate max-w-[200px]">
                    {events[0] ? `${events[0].location} (M${events[0].magnitude?.toFixed(1)})` : 'Waiting for data...'}
                </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button 
                onClick={handleExport}
                className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded border border-slate-700 transition-colors"
                title="Export Data to CSV"
            >
                <Download size={14} />
                Export CSV
            </button>

            <div className="hidden md:flex items-center bg-slate-800 rounded-full px-3 py-1.5 border border-slate-700">
              <Search size={14} className="text-slate-500 mr-2" />
              <input 
                type="text" 
                placeholder="Search events..." 
                className="bg-transparent border-none outline-none text-sm text-slate-200 placeholder-slate-500 w-48"
              />
            </div>
            <button 
              onClick={loadData} 
              className="p-2 text-slate-400 hover:text-orange-400 transition-colors relative group"
              title="Refresh Data"
            >
              <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
            </button>
            <button className="p-2 text-slate-400 hover:text-white transition-colors relative">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-orange-500 rounded-full border-2 border-slate-900"></span>
            </button>
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-orange-500 to-red-600 border border-slate-700 shadow-lg shadow-orange-900/20"></div>
          </div>
        </header>

        {/* Filter Bar */}
        <div className="bg-slate-900 border-b border-slate-800 p-3 flex flex-wrap items-center gap-4 md:gap-6 sticky top-16 z-30 backdrop-blur-md bg-slate-900/90">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-medium uppercase tracking-wider">
                <Filter size={14} />
                <span className="hidden md:inline">Filters</span>
            </div>
            
            <div className="h-4 w-px bg-slate-800 hidden md:block"></div>

            <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-slate-500 text-[10px] uppercase tracking-wide">
                    <Zap size={12} />
                    <span className="hidden sm:inline">Min Mag</span>
                </div>
                <div className="flex bg-slate-800 rounded-lg p-0.5 border border-slate-700">
                    {[0, 3, 4, 5, 6].map((mag) => (
                        <button
                            key={mag}
                            onClick={() => setMinMagnitude(mag)}
                            className={`px-2.5 py-1 rounded text-[10px] font-mono transition-all ${
                                minMagnitude === mag 
                                    ? 'bg-orange-600 text-white shadow-lg shadow-orange-900/20 font-bold' 
                                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700'
                            }`}
                        >
                            {mag === 0 ? 'ALL' : `>${mag}`}
                        </button>
                    ))}
                </div>
            </div>

            <div className="h-4 w-px bg-slate-800 hidden md:block"></div>

            <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-slate-500 text-[10px] uppercase tracking-wide">
                    <Calendar size={12} />
                    <span className="hidden sm:inline">Range</span>
                </div>
                <select 
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value)}
                    className="bg-slate-800 border border-slate-700 text-slate-300 text-xs rounded px-2 py-1 outline-none focus:border-orange-500 transition-colors"
                >
                    <option value="all">All Time</option>
                    <option value="7d">Last 7 Days</option>
                    <option value="30d">Last 30 Days</option>
                    <option value="90d">Last 3 Months</option>
                    <option value="1y">Last Year</option>
                </select>
            </div>
            
            <div className="ml-auto text-xs font-mono text-slate-500">
                {filteredEvents.length} events found
            </div>
        </div>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 scroll-smooth">
          
          {activeTab === 'dashboard' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <SeismicStats events={filteredEvents} />
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
                <div className="lg:col-span-2 bg-slate-900 rounded-xl border border-slate-800 overflow-hidden relative group">
                  <div className="absolute top-4 left-4 z-10 bg-slate-900/80 backdrop-blur px-3 py-1 rounded border border-slate-700 text-xs font-mono text-slate-300 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                    LIVE FEED
                  </div>
                  {loading ? (
                    <div className="w-full h-full flex items-center justify-center text-slate-500 font-mono text-sm animate-pulse">
                      INITIALIZING MAP SYSTEM...
                    </div>
                  ) : (
                    <SeismicMap events={filteredEvents} onEventSelect={setSelectedEvent} />
                  )}
                </div>
                
                <div className="lg:col-span-1 bg-slate-900 rounded-xl border border-slate-800 overflow-hidden flex flex-col">
                  <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
                    <h3 className="font-medium text-slate-300 text-sm uppercase tracking-wider">Recent Activity</h3>
                    <div className="flex gap-1">
                        <div className="w-1 h-1 rounded-full bg-slate-600"></div>
                        <div className="w-1 h-1 rounded-full bg-slate-600"></div>
                        <div className="w-1 h-1 rounded-full bg-slate-600"></div>
                    </div>
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <SeismicList events={filteredEvents} onEventSelect={setSelectedEvent} />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="h-80">
                  <SeismicTrendChart events={filteredEvents} />
                </div>
                <div className="h-80">
                  <SeismicDepthChart events={filteredEvents} selectedEvent={selectedEvent} />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'map' && (
            <div className="h-[calc(100vh-12rem)] bg-slate-900 rounded-xl border border-slate-800 overflow-hidden relative animate-in fade-in zoom-in-95 duration-300">
              {loading ? (
                <div className="w-full h-full flex items-center justify-center text-slate-500 font-mono animate-pulse">
                  LOADING GEOSPATIAL DATA...
                </div>
              ) : (
                <SeismicMap events={filteredEvents} onEventSelect={setSelectedEvent} />
              )}
            </div>
          )}
          
          {/* Floating Overlay for Selected Event - Visible across relevant tabs */}
          {selectedEvent && (activeTab === 'dashboard' || activeTab === 'map' || activeTab === 'analysis') && (
            <div className="fixed bottom-6 right-6 w-80 bg-slate-900/95 backdrop-blur-md border border-slate-700 rounded-xl shadow-2xl p-4 animate-in slide-in-from-right-10 z-50">
              <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="font-display font-bold text-white text-lg leading-tight">{selectedEvent.location}</h3>
                    <div className="text-xs text-orange-400 font-mono mt-1">
                        {selectedEvent.date ? formatDistanceToNow(new Date(selectedEvent.date), { addSuffix: true }) : ''}
                    </div>
                </div>
                <button onClick={() => setSelectedEvent(null)} className="text-slate-500 hover:text-white bg-slate-800 p-1 rounded-full">
                  <X size={16} />
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-slate-800/50 p-3 rounded border border-slate-700">
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Magnitude</div>
                  <div className="text-2xl font-mono font-bold text-orange-500">M{selectedEvent.magnitude?.toFixed(1)}</div>
                </div>
                <div className="bg-slate-800/50 p-3 rounded border border-slate-700">
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Depth</div>
                  <div className="text-2xl font-mono font-bold text-blue-400">{selectedEvent.depth} <span className="text-sm text-slate-500">km</span></div>
                </div>
              </div>
              
              <div className="space-y-2 text-sm text-slate-400 border-t border-slate-800 pt-3">
                <div className="flex justify-between">
                  <span>Date:</span>
                  <span className="text-slate-200 font-mono">
                    {selectedEvent.date ? format(new Date(selectedEvent.date), 'PP p') : '-'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Type:</span>
                  <span className="text-slate-200 capitalize">{selectedEvent.type === 'eq' ? 'Earthquake' : 'Volcanic'}</span>
                </div>
                <div className="flex justify-between">
                  <span>ID:</span>
                  <span className="text-slate-200 font-mono text-xs">{selectedEvent.id}</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'analysis' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="h-auto min-h-96">
                <SeismicComparison events={filteredEvents} />
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="h-96">
                  <SeismicTrendChart events={filteredEvents} />
                </div>
                <div className="h-96">
                  <SeismicDepthChart events={filteredEvents} selectedEvent={selectedEvent} />
                </div>
                <div className="h-96 lg:col-span-2">
                  <SeismicEnergyChart events={filteredEvents} />
                </div>
                <div className="h-96 lg:col-span-2">
                  <SeismicMagnitudeDist events={filteredEvents} />
                </div>
                <div className="h-96">
                  <SeismicGutenbergRichter events={filteredEvents} />
                </div>
                <div className="h-96">
                  <SeismicHourlyDistribution events={filteredEvents} />
                </div>
                <div className="h-96 lg:col-span-2">
                  <SeismicDepthDistribution events={filteredEvents} />
                </div>
              </div>
            </div>
          )}

          {activeTab === '3d' && (
            <div className="h-[calc(100vh-12rem)] animate-in fade-in zoom-in-95 duration-500">
              <Seismic3DViewer events={filteredEvents} />
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="h-full overflow-y-auto pb-20">
              <SeismicSettings />
            </div>
          )}

        </main>
      </div>
    </div>
  );
};

export default App;
