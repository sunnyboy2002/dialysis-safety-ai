import React, { useState } from 'react';
import { IncidentReport } from './types';
import { Send, ClipboardCheck } from 'lucide-react';

interface Props {
  onSubmit: (report: IncidentReport) => void;
  isLoading: boolean;
}

const EvaluationForm: React.FC<Props> = ({ onSubmit, isLoading }) => {
  const [incident, setIncident] = useState('');
  const [treatment, setTreatment] = useState('');
  const [progress, setProgress] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ incident, treatment, progress });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
          事例内容（何が起きたか）
        </label>
        <textarea
          required
          className="w-full h-24 px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
          placeholder="例：透析終了時の抜針後、止血ベルトを外した際に再出血を確認した。"
          value={incident}
          onChange={(e) => setIncident(e.target.value)}
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
          処理（その場で行ったこと）
        </label>
        <textarea
          required
          className="w-full h-24 px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
          placeholder="例：直ちに手袋を着用し、清潔なガーゼで圧迫止血を再開した。"
          value={treatment}
          onChange={(e) => setTreatment(e.target.value)}
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
          対応経過（その後の経過・報告など）
        </label>
        <textarea
          required
          className="w-full h-24 px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
          placeholder="例：5分間の圧迫で止血を確認。バイタルに異常なし。医師に報告し、経過観察とした。"
          value={progress}
          onChange={(e) => setProgress(e.target.value)}
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2 group"
      >
        {isLoading ? (
          '解析中...'
        ) : (
          <>
            AI評価を実行する
            <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </>
        )}
      </button>
    </form>
  );
};

export default EvaluationForm;
