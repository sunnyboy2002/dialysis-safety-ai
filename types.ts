
export interface EvaluationResult {
  rank: number;
  reasonGood: string;
  reasonBad: string;
  advice: string;
  rawResponse: string;
}

export interface IncidentReport {
  incident: string;
  treatment: string;
  progress: string;
}

export interface HistoryEntry {
  id: string;
  timestamp: number;
  report: IncidentReport;
  result: EvaluationResult;
}
