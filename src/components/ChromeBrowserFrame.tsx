import React from 'react';
import {
  ShieldCheck,
  RotateCw,
  ArrowLeft,
  ArrowRight,
  Maximize2,
  Minimize2,
  Globe,
  Star,
  ExternalLink,
  Laptop,
  CheckCircle2
} from 'lucide-react';
import { usePos } from '../context/PosContext';
import { PWAInstallButton } from './PWAInstallButton';

interface ChromeBrowserFrameProps {
  isFullScreenWindow: boolean;
  setIsFullScreenWindow: React.Dispatch<React.SetStateAction<boolean>>;
}

export const ChromeBrowserFrame: React.FC<ChromeBrowserFrameProps> = ({
  isFullScreenWindow,
  setIsFullScreenWindow,
}) => {
  const { browserUrl, currentView, setCurrentView, user, logout } = usePos();

  const getTabTitle = () => {
    switch (currentView) {
      case 'login':
        return 'Login - Regal POS';
      case 'dashboard':
        return 'Home - Regal POS Dashboard';
      case 'invoice':
        return 'Invoice - POS Terminal Cashier';
      case 'products':
        return 'Products - Regal POS';
      case 'duplicatebill':
        return 'Duplicate Bill - Regal POS';
      case 'salesview':
        return 'Sales View - Regal POS';
      default:
        return 'Regal POS - Reliable Technologies';
    }
  };

  return (
    <div className="bg-slate-900 border-b border-slate-800 text-slate-200 select-none sticky top-0 z-50 shadow-md">
      {/* Chrome Tab Bar */}
      <div className="flex items-center justify-between px-3 pt-2">
        <div className="flex items-center space-x-2">
          {/* Mac / Window control dots */}
          <div className="flex items-center space-x-1.5 mr-2">
            <span className="w-3 h-3 rounded-full bg-rose-500/90 inline-block shadow-sm" />
            <span className="w-3 h-3 rounded-full bg-amber-500/90 inline-block shadow-sm" />
            <span className="w-3 h-3 rounded-full bg-emerald-500/90 inline-block shadow-sm" />
          </div>

          {/* Active Tab */}
          <div className="flex items-center space-x-2 px-3 py-1.5 bg-slate-950 text-slate-100 text-xs rounded-t-lg border-t border-x border-slate-800 shadow-sm max-w-xs">
            <Globe className="w-3.5 h-3.5 text-purple-400 shrink-0" />
            <span className="truncate font-medium">{getTabTitle()}</span>
            <span className="text-[10px] text-emerald-400 ml-1 font-semibold">● 200 OK</span>
          </div>

          {/* New Tab indicator */}
          <div className="text-xs text-slate-500 hover:text-slate-300 cursor-pointer px-1">
            +
          </div>
        </div>

        {/* Right side controls */}
        <div className="flex items-center space-x-2 text-xs">
          <div className="hidden sm:flex items-center gap-1.5 bg-emerald-950/60 text-emerald-400 border border-emerald-800/40 px-2.5 py-0.5 rounded-full text-[11px]">
            <CheckCircle2 className="w-3 h-3" />
            <span>Target: demo.regalpos.pk</span>
          </div>

          <PWAInstallButton />

          <button
            onClick={() => setIsFullScreenWindow(!isFullScreenWindow)}
            className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded transition"
            title={isFullScreenWindow ? 'Exit Full Screen' : 'Toggle Full Screen Browser'}
          >
            {isFullScreenWindow ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Chrome Navigation & Omnibox Address Bar */}
      <div className="flex items-center space-x-2 px-3 py-1.5 bg-slate-950 border-t border-slate-800/80">
        <div className="flex items-center space-x-1 text-slate-400">
          <button
            onClick={() => setCurrentView('dashboard')}
            className="p-1 rounded hover:bg-slate-800 hover:text-slate-200 transition"
            title="Back to Dashboard"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setCurrentView('invoice')}
            className="p-1 rounded hover:bg-slate-800 hover:text-slate-200 transition"
            title="Forward to POS Register"
          >
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => window.location.reload()}
            className="p-1 rounded hover:bg-slate-800 hover:text-slate-200 transition"
            title="Reload Page"
          >
            <RotateCw className="w-3 h-3" />
          </button>
        </div>

        {/* Address Bar */}
        <div className="flex-1 flex items-center bg-slate-900 border border-slate-800 hover:border-slate-700 focus-within:border-purple-500 rounded-full px-3 py-1 text-xs transition">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 mr-2 shrink-0" />
          <span className="text-slate-500 select-none mr-0.5">https://</span>
          <span className="text-purple-300 font-medium">demo.regalpos.pk</span>
          <span className="text-slate-300 truncate">
            {browserUrl.replace('https://demo.regalpos.pk', '') || '/'}
          </span>
          <div className="ml-auto pl-2 flex items-center gap-1.5">
            <Star className="w-3 h-3 text-slate-500 hover:text-amber-400 cursor-pointer" />
          </div>
        </div>

        {/* Quick Route Buttons */}
        <div className="hidden lg:flex items-center space-x-1.5 text-[11px]">
          <button
            onClick={() => setCurrentView('login')}
            className={`px-2 py-0.5 rounded transition ${
              currentView === 'login'
                ? 'bg-purple-600 text-white font-medium'
                : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            Login Page
          </button>
          <button
            onClick={() => setCurrentView('dashboard')}
            className={`px-2 py-0.5 rounded transition ${
              currentView === 'dashboard'
                ? 'bg-purple-600 text-white font-medium'
                : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setCurrentView('invoice')}
            className={`px-2.5 py-0.5 rounded font-semibold transition ${
              currentView === 'invoice'
                ? 'bg-emerald-600 text-white'
                : 'bg-purple-950/60 text-purple-300 border border-purple-800/40 hover:bg-purple-900/60'
            }`}
          >
            POS Terminal (F2)
          </button>
        </div>
      </div>
    </div>
  );
};
