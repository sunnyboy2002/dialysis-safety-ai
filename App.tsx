
import React, { useState, useEffect } from 'react';
import { EvaluationResult, IncidentReport, HistoryEntry } from './types';
import { evaluateIncident } from './services/geminiService';
import EvaluationForm from './components/EvaluationForm';
import EvaluationResultView from './components/EvaluationResult';
import Header from './components/Header';

// Use type assertion to access the pre-configured aistudio object on window.
// This avoids conflicts with existing global declarations of 'aistudio'.
const aistudio = (window as any).aistudio;

const App: React.FC = () => {
  const [report, setReport] = useState<IncidentReport>({ incident: '', treatment: '', progress: '' });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<EvaluationResult | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [hasApiKey, setHasApiKey] = useState<boolean>(true);

  useEffect(() => {
    // 起動時にAPIキーが選択されているか確認（AI Studio環境のみ）
    const checkApiKey = async () => {
      if (aistudio) {
        const selected = await aistudio.hasSelectedApiKey();
        setHasApiKey(selected);
      } else {
        // AI Studio以外の環境（Netlify等）では、環境変数が設定されているかチェック
        const apiKey = process.env.GEMINI_API_KEY;
        setHasApiKey(!!apiKey);
      }
    };
    checkApiKey();

    const saved = localStorage.getItem('dialysis_eval_history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse history', e);
      }
    }
  }, []);

  const handleOpenKeySelector = async () => {
    if (aistudio) {
      await aistudio.openSelectKey();
      setHasApiKey(true);
    } else {
      // AI Studio以外ではドキュメントへ誘導
      window.open('https://aistudio.google.com/app/apikey', '_blank');
    }
  };

  const handleEvaluate = async () => {
    if (!report.incident || !report.treatment) {
      alert('「事例」と「処理」は必須入力項目です。');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const evaluation = await evaluateIncident(report);
      setResult(evaluation);
      
      const newEntry: HistoryEntry = {
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        report: { ...report },
        result: evaluation,
      };
      
      const updatedHistory = [newEntry, ...history].slice(0, 50);
      setHistory(updatedHistory);
      localStorage.setItem('dialysis_eval_history', JSON.stringify(updatedHistory));
    } catch (err: any) {
      const errorMessage = err.message || '';
      if (errorMessage.includes("Requested entity was not found") || errorMessage.includes("API key") || errorMessage.includes("invalid api key")) {
        if (aistudio) {
          setError("APIキーの有効期限が切れているか、正しく設定されていません。再設定してください。");
          setHasApiKey(false);
        } else {
          setError("APIキーが設定されていないか、無効です。Netlifyの環境変数にGEMINI_API_KEYを設定してください。");
        }
      } else {
        setError(errorMessage || '評価中にエラーが発生しました。');
      }
    } finally {
      setLoading(false);
    }
  };

  const clearAll = () => {
    if (confirm('入力内容と結果をクリアしますか？')) {
      setReport({ incident: '', treatment: '', progress: '' });
      setResult(null);
      setError(null);
    }
  };

  const deleteHistoryItem = (id: string) => {
    const updated = history.filter(h => h.id !== id);
    setHistory(updated);
    localStorage.setItem('dialysis_eval_history', JSON.stringify(updated));
  };

  const loadFromHistory = (entry: HistoryEntry) => {
    setReport(entry.report);
    setResult(entry.result);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen pb-20">
      <Header />
      
      {!hasApiKey && (
        <div className="bg-amber-50 border-b border-amber-200 p-4 sticky top-0 z-50">
          <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center text-amber-800 text-sm font-medium">
              <svg className="w-5 h-5 mr-2 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              {aistudio ? 
                "AI評価を利用するにはAPIキーの設定（Google Cloudプロジェクトの選択）が必要です。" : 
                "APIキーが設定されていません。Netlify等の環境変数に GEMINI_API_KEY を設定してください。"
              }
            </div>
            <div className="flex items-center gap-4">
              <a 
                href="https://ai.google.dev/gemini-api/docs/billing" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs text-amber-600 underline hover:text-amber-700"
              >
                課金ドキュメント
              </a>
              <button 
                onClick={handleOpenKeySelector}
                className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors shadow-sm"
              >
                {aistudio ? "APIキーを選択" : "APIキーを取得"}
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6">
          <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              アクシデント報告書の入力
            </h2>
            <EvaluationForm 
              report={report} 
              setReport={setReport} 
              onEvaluate={handleEvaluate} 
              onClear={clearAll}
              loading={loading}
            />
          </section>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded shadow-sm">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <p className="text-red-700 font-medium">{error}</p>
              </div>
            </div>
          )}

          {result && (
            <section className="transition-all duration-500 animate-in fade-in slide-in-from-bottom-4">
              <EvaluationResultView result={result} />
            </section>
          )}
        </div>

        {/* Sidebar / History Area */}
        <div className="lg:col-span-1">
          <aside className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden sticky top-8">
            <div className="bg-slate-50 border-b border-slate-200 px-4 py-3">
              <h3 className="text-sm font-bold text-slate-700 flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                評価履歴
              </h3>
            </div>
            <div className="divide-y divide-slate-100 max-h-[calc(100vh-200px)] overflow-y-auto">
              {history.length === 0 ? (
                <div className="p-8 text-center text-slate-400 italic text-sm">
                  履歴はありません
                </div>
              ) : (
                history.map((entry) => (
                  <div key={entry.id} className="p-4 hover:bg-slate-50 group">
                    <div className="flex justify-between items-start mb-1">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        entry.result.rank >= 4 ? 'bg-green-100 text-green-700' :
                        entry.result.rank === 3 ? 'bg-blue-100 text-blue-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        ランク {entry.result.rank}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(entry.timestamp).toLocaleString('ja-JP', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p 
                      className="text-sm text-slate-800 font-medium line-clamp-2 cursor-pointer mb-2"
                      onClick={() => loadFromHistory(entry)}
                    >
                      {entry.report.incident}
                    </p>
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => deleteHistoryItem(entry.id)}
                        className="text-xs text-slate-400 hover:text-red-500 transition-colors"
                      >
                        削除
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
};

export default App;
