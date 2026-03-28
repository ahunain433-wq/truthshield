import React, { useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import HistoryTable from '../components/dashboard/HistoryTable';
import ScanCard from '../components/dashboard/ScanCard';

const Dashboard = () => {
  const { currentUser, userData } = useAuth();
  const historySectionRef = useRef(null);

  const handleViewAllHistory = () => {
    historySectionRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-slate-700/20 [mask-image:linear-gradient(0deg,rgba(255,255,255,0.1),rgba(255,255,255,0.05))] -z-10"></div>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
              <span className="text-white text-xl">🛡️</span>
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white">TruthShield Dashboard</h1>
              <p className="text-lg text-slate-300 mt-1">Document Verification & Security Analysis</p>
            </div>
          </div>

          {/* Breadcrumb/Status Bar */}
          <div className="flex items-center justify-between mt-6 p-4 bg-slate-800/50 backdrop-blur-sm rounded-xl shadow-lg border border-slate-700/50 hover:bg-slate-800/60 transition-all duration-300">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse shadow-emerald-400/50"></div>
                <span className="text-sm font-medium text-slate-200">System Status: Online</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-slate-400">Last Updated:</span>
                <span className="text-sm font-medium text-white">
                  {new Date().toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true
                  })}
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-slate-400">Version:</span>
              <span className="text-sm font-medium text-blue-400 bg-blue-900/30 px-2 py-1 rounded-md border border-blue-700/30">2.1.0</span>
            </div>
          </div>
        </div>
      
      <div className="mb-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white mb-2 animate-fade-in">Welcome back, {userData?.fullName || currentUser?.email}</h2>
          <p className="text-slate-300 animate-fade-in animation-delay-200">Here's an overview of your document verification activity</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ScanCard
            title="Total Verifications"
            value={userData?.submissionsCount || 0}
            icon="🔍"
            gradient="gradient-trust"
            trend={12}
          />
          <ScanCard
            title="Authenticity Rate"
            value="94.2%"
            icon="✅"
            gradient="gradient-verified"
            trend={5}
          />
          <ScanCard
            title="Risk Alerts"
            value="3"
            icon="⚠️"
            gradient="gradient-suspicious"
            trend={-8}
          />
        </div>
      </div>

      {/* Security Overview Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-slate-200 mb-4">Security Overview</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Trust Score Card */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl shadow-lg border border-slate-700/50 overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Trust Score</h3>
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse shadow-emerald-500/50"></div>
                  <span className="text-sm text-slate-300">Active</span>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-slate-400">Overall Trust Level</span>
                    <span className="text-sm font-semibold text-emerald-400">94.2%</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-3 overflow-hidden">
                    <div className="bg-gradient-to-r from-emerald-400 to-emerald-600 h-3 rounded-full shadow-emerald-500/30 transition-all duration-1000 ease-out animate-pulse" style={{ width: '94.2%' }}></div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-700/50">
                  <div className="text-center p-3 bg-emerald-900/20 rounded-lg border border-emerald-700/30 hover:bg-emerald-900/30 transition-colors duration-200">
                    <div className="text-2xl font-bold text-emerald-400 mb-1">98%</div>
                    <div className="text-xs text-emerald-300/80 font-medium">Authentic</div>
                  </div>
                  <div className="text-center p-3 bg-orange-900/20 rounded-lg border border-orange-700/30 hover:bg-orange-900/30 transition-colors duration-200">
                    <div className="text-2xl font-bold text-orange-400 mb-1">2%</div>
                    <div className="text-xs text-orange-300/80 font-medium">Suspicious</div>
                  </div>
                  <div className="text-center p-3 bg-slate-800/50 rounded-lg border border-slate-600/30 hover:bg-slate-700/50 transition-colors duration-200">
                    <div className="text-2xl font-bold text-slate-400 mb-1">0%</div>
                    <div className="text-xs text-slate-300/80 font-medium">Manipulated</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Verification Status */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl shadow-lg border border-slate-700/50 overflow-hidden">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Verification Status</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-emerald-900/30 rounded-lg border border-emerald-700/30 backdrop-blur-sm hover:bg-emerald-900/40 transition-all duration-200 hover:shadow-lg hover:shadow-emerald-500/10">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-emerald-900/50 rounded-full flex items-center justify-center border border-emerald-600/30">
                      <span className="text-emerald-400 text-sm">✓</span>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-emerald-300">AI Detection</div>
                      <div className="text-xs text-emerald-400/80">Active & Updated</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-emerald-400">99.9%</div>
                    <div className="text-xs text-emerald-500/80">Accuracy</div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-blue-900/30 rounded-lg border border-blue-700/30 backdrop-blur-sm hover:bg-blue-900/40 transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/10">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-900/50 rounded-full flex items-center justify-center border border-blue-600/30">
                      <span className="text-blue-400 text-sm">🔒</span>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-blue-300">Data Security</div>
                      <div className="text-xs text-blue-400/80">End-to-End Encrypted</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-blue-400">100%</div>
                    <div className="text-xs text-blue-500/80">Protected</div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-yellow-900/30 rounded-lg border border-yellow-700/30 backdrop-blur-sm hover:bg-yellow-900/40 transition-all duration-200 hover:shadow-lg hover:shadow-yellow-500/10">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-yellow-900/50 rounded-full flex items-center justify-center border border-yellow-600/30">
                      <span className="text-yellow-400 text-sm">⚡</span>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-yellow-300">Processing Speed</div>
                      <div className="text-xs text-yellow-400/80">Average Response</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-yellow-400">1.8s</div>
                    <div className="text-xs text-yellow-500/80">Fast</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Scans Section */}
      <div ref={historySectionRef}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-slate-200">Recent Verifications</h2>
          <button
            onClick={handleViewAllHistory}
            className="text-sm font-medium text-blue-400 hover:text-blue-300 transition-all duration-150 hover:scale-105"
          >
            View All History →
          </button>
        </div>
        <HistoryTable />
      </div>
      </div>
    </div>
  );
};

export default Dashboard;