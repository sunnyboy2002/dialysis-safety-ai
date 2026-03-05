import React from 'react';
import { ShieldCheck, Activity } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="bg-white border-bottom border-slate-200 sticky top-0 z-10">
      <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="bg-indigo-600 p-2 rounded-lg">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 leading-tight">透析医療 安全管理AI</h1>
            <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Incident Evaluation System</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-slate-400">
          <Activity className="w-4 h-4" />
          <span className="text-xs font-medium">System Active</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
