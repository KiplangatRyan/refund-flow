import React, { useState } from 'react';
import { 
  ShieldCheck, 
  RotateCcw, 
  LayoutDashboard, 
  Sliders, 
  Radio, 
  FileText, 
  Github, 
  Plus, 
  Sparkles,
  LogIn,
  LogOut,
  User,
  Database,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface NavbarProps {
  currentView: 'merchant' | 'customer' | 'rules' | 'gateway' | 'audit';
  onSelectView: (view: 'merchant' | 'customer' | 'rules' | 'gateway' | 'audit') => void;
  pendingCount: number;
  onOpenShipModal: () => void;
  onNewRequest: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onSelectView,
  pendingCount,
  onOpenShipModal,
  onNewRequest
}) => {
  const { user, profile, isAdmin, signInWithGoogle, signOut, loading } = useAuth();
  const [isSigningIn, setIsSigningIn] = useState(false);

  const handleSignIn = async () => {
    try {
      setIsSigningIn(true);
      await signInWithGoogle();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSigningIn(false);
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-8">
            <div 
              onClick={() => onSelectView('merchant')} 
              className="flex items-center gap-2.5 cursor-pointer group"
            >
              <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-sm group-hover:bg-indigo-700 transition-colors">
                <RotateCcw className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 tracking-tight text-lg">RefundFlow</span>
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                    <Database className="w-3 h-3 text-emerald-600" />
                    <span>Firestore</span>
                  </span>
                </div>
                <p className="text-xs text-slate-500">Autonomous Refund & Dispute Engine</p>
              </div>
            </div>

            {/* Navigation Tabs */}
            <nav className="hidden md:flex items-center gap-1">
              <button
                onClick={() => onSelectView('merchant')}
                className={`flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-lg transition-colors ${
                  currentView === 'merchant'
                    ? 'bg-slate-100 text-slate-900 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Operations</span>
                {pendingCount > 0 && (
                  <span className="inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-semibold rounded-full bg-amber-100 text-amber-800">
                    {pendingCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => onSelectView('customer')}
                className={`flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-lg transition-colors ${
                  currentView === 'customer'
                    ? 'bg-slate-100 text-slate-900 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <RotateCcw className="w-4 h-4" />
                <span>Customer Portal</span>
              </button>

              <button
                onClick={() => onSelectView('rules')}
                className={`flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-lg transition-colors ${
                  currentView === 'rules'
                    ? 'bg-slate-100 text-slate-900 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Sliders className="w-4 h-4" />
                <span>Policy Rules</span>
              </button>

              <button
                onClick={() => onSelectView('gateway')}
                className={`flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-lg transition-colors ${
                  currentView === 'gateway'
                    ? 'bg-slate-100 text-slate-900 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Radio className="w-4 h-4" />
                <span>Webhooks</span>
              </button>

              <button
                onClick={() => onSelectView('audit')}
                className={`flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-lg transition-colors ${
                  currentView === 'audit'
                    ? 'bg-slate-100 text-slate-900 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>Audit Trail</span>
              </button>
            </nav>
          </div>

          {/* Right Action & Authentication Controls */}
          <div className="flex items-center gap-3">
            
            <button
              onClick={onNewRequest}
              className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Intake Refund</span>
            </button>

            {/* Dedicated "Ship to GitHub" button */}
            <button
              onClick={onOpenShipModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg transition-colors"
            >
              <Github className="w-3.5 h-3.5" />
              <span>Ship to GitHub</span>
            </button>

            {/* Google Authentication Section */}
            {loading ? (
              <div className="w-8 h-8 rounded-full bg-slate-100 animate-pulse" />
            ) : user ? (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    className="w-8 h-8 rounded-full border border-slate-300 object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs">
                    {(user.displayName || user.email || 'U')[0].toUpperCase()}
                  </div>
                )}
                <div className="hidden sm:block text-left">
                  <div className="text-xs font-semibold text-slate-900 leading-tight truncate max-w-[120px]">
                    {user.displayName || user.email?.split('@')[0]}
                  </div>
                  <div className="flex items-center gap-1">
                    <span className={`text-[10px] font-semibold px-1.5 py-0.2 rounded ${
                      isAdmin ? 'bg-purple-100 text-purple-800' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {isAdmin ? 'Admin' : 'Customer'}
                    </span>
                  </div>
                </div>
                <button
                  onClick={signOut}
                  title="Sign Out"
                  className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors ml-1"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={handleSignIn}
                disabled={isSigningIn}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold text-slate-900 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg shadow-2xs transition-colors"
              >
                {/* Google "G" icon */}
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>{isSigningIn ? 'Signing in...' : 'Sign in with Google'}</span>
              </button>
            )}

          </div>

        </div>

        {/* Mobile Navigation bar */}
        <div className="md:hidden flex items-center justify-between border-t border-slate-100 py-2 overflow-x-auto gap-2">
          <button
            onClick={() => onSelectView('merchant')}
            className={`px-3 py-1 text-xs font-medium rounded whitespace-nowrap ${currentView === 'merchant' ? 'bg-slate-900 text-white' : 'text-slate-600'}`}
          >
            Operations ({pendingCount})
          </button>
          <button
            onClick={() => onSelectView('customer')}
            className={`px-3 py-1 text-xs font-medium rounded whitespace-nowrap ${currentView === 'customer' ? 'bg-slate-900 text-white' : 'text-slate-600'}`}
          >
            Customer Return
          </button>
          <button
            onClick={() => onSelectView('rules')}
            className={`px-3 py-1 text-xs font-medium rounded whitespace-nowrap ${currentView === 'rules' ? 'bg-slate-900 text-white' : 'text-slate-600'}`}
          >
            Policy Rules
          </button>
          <button
            onClick={() => onSelectView('gateway')}
            className={`px-3 py-1 text-xs font-medium rounded whitespace-nowrap ${currentView === 'gateway' ? 'bg-slate-900 text-white' : 'text-slate-600'}`}
          >
            Webhooks
          </button>
          <button
            onClick={() => onSelectView('audit')}
            className={`px-3 py-1 text-xs font-medium rounded whitespace-nowrap ${currentView === 'audit' ? 'bg-slate-900 text-white' : 'text-slate-600'}`}
          >
            Audit Log
          </button>
        </div>
      </div>
    </header>
  );
};
