import React, { useState } from 'react';
import Header from './Header';
import EvaluationForm from './EvaluationForm';
import EvaluationResult from './EvaluationResult';
import { evaluateIncident } from './geminiService';
import { IncidentReport, EvaluationResult as EvalResultType } from './types';
import { AlertCircle, Loader2 } from 'lucide-react';

const App: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<EvalResultType | null>(null);

  const handleEvaluate = async (report: IncidentReport) => {
    setLoading(true);
    setError(null);
    try {
      const evalResult = await evaluateIncident(report);
      setResult(evalResult);
    } catch (err) {
      setError('評価中にエラーが発生しました。APIキーの設定を確認してください。');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 py-8">
        {!result ? (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
              <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-indigo-600" />
                新規インシデント評価
              </h2>
              <EvaluationForm onSubmit={handleEvaluate} isLoading={loading} />
            </div>
            
            {loading && (
              <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                <Loader2 className="w-10 h-10 animate-spin mb-4 text-indigo-600" />
                <p className="text-lg font-medium">AIが安全管理基準に照らして評価中...</p>
                <p className="text-sm">これには数秒かかる場合があります</p>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-3">
                <AlertCircle className="w-5 h-5" />
                <p>{error}</p>
              </div>
            )}
          </div>
        ) : (
          <EvaluationResult result={result} onReset={handleReset} />
        )}
      </main>

      <footer className="py-8 text-center text-slate-400 text-sm">
        &copy; 2024 透析医療 安全管理AI評価システム
      </footer>
    </div>
  );
};

export default App;
