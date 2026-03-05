import React from 'react';
import { EvaluationResult as EvalResultType } from './types';
import { Star, AlertTriangle, CheckCircle2, Lightbulb, ArrowLeft } from 'lucide-react';

interface Props {
  result: EvalResultType;
  onReset: () => void;
}

const EvaluationResult: React.FC<Props> = ({ result, onReset }) => {
  const getRankColor = (rank: number) => {
    if (rank >= 4) return 'text-emerald-600 bg-emerald-50 border-emerald-100';
    if (rank === 3) return 'text-amber-600 bg-amber-50 border-amber-100';
    return 'text-red-600 bg-red-50 border-red-100';
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className={`p-8 rounded-3xl border-2 text-center ${getRankColor(result.rank)}`}>
        <p className="text-sm font-bold uppercase tracking-widest mb-2">AI Safety Assessment</p>
        <h2 className="text-5xl font-black mb-4">判定ランク：{result.rank}</h2>
        <div className="flex justify-center gap-1">
          {[1, 2, 3, 4, 5].map((s) => (
            <Star
              key={s}
              className={`w-8 h-8 ${s <= result.rank ? 'fill-current' : 'opacity-20'}`}
            />
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="flex items-center gap-2 text-emerald-700 font-bold mb-3">
            <CheckCircle2 className="w-5 h-5" />
            良かった点 (Good)
          </h3>
          <p className="text-slate-600 leading-relaxed">{result.reasonGood}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="flex items-center gap-2 text-amber-700 font-bold mb-3">
            <AlertTriangle className="w-5 h-5" />
            懸念点 (Bad)
          </h3>
          <p className="text-slate-600 leading-relaxed">{result.reasonBad}</p>
        </div>
      </div>

      <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100">
        <h3 className="flex items-center gap-2 text-indigo-800 font-bold mb-3">
          <Lightbulb className="w-5 h-5" />
          改善アドバイス
        </h3>
        <p className="text-indigo-900 leading-relaxed whitespace-pre-wrap">{result.advice}</p>
      </div>

      <button
        onClick={onReset}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-medium transition-colors py-4"
      >
        <ArrowLeft className="w-4 h-4" />
        別の事例を評価する
      </button>
    </div>
  );
};

export default EvaluationResult;
