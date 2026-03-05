import { GoogleGenAI } from "@google/genai";
import { EvaluationResult, IncidentReport } from "./types";

const SYSTEM_INSTRUCTION = `
あなたは透析医療の安全管理責任者（医療安全管理者）です。
提供された「アクシデント報告書」の内容（特に「処理」「発生後の対応経過」）を読み、その事後対応の適切さを1〜5の5段階で評価してください。

【評価基準】
• 評価 5：非常に適切 (Excellent)
    - 患者の安全確保（止血、バイタル測定、全身観察）が最優先で即座に行われている。
    - 医師、上長への報告が迅速。家族への連絡・謝罪が適切。必要な検査の判断が早い。
• 評価 4：適切 (Good)
    - 基本的な医学的処置（除水停止、補液など）が行われている。医師への報告、患者への説明と謝罪がある。
• 評価 3：許容範囲/普通 (Acceptable)
    - 患者に実害が出ない範囲で処置完了。対応はしているが、医師報告タイミングや記録が曖昧な場合。
• 評価 2：不十分 (Insufficient)
    - 発見が遅れた。バイタル測定等の観察が欠けている。医師への報告漏れ、自分たちだけで判断した形跡。
• 評価 1：不適切/危険 (Critical)
    - 隠蔽の意図、誤った処置で悪化、スタッフのパニック、応援要請の欠如。

【出力形式厳守】
以下の形式で回答してください。
--------------------------------------------------------------------------------
【判定ランク】：(1〜5の数字)
【評価理由】
• 良かった点（Good）： (具体的な内容)
• 懸念点（Bad）： (具体的な内容)
【改善アドバイス】
• (今後のアクション)
--------------------------------------------------------------------------------
`;

export const evaluateIncident = async (report: IncidentReport): Promise<EvaluationResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
以下の事例の対応を評価してください。
事例： ${report.incident}
処理： ${report.treatment}
対応経過： ${report.progress}
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.1,
      },
    });

    const text = response.text || "";
    
    const rankMatch = text.match(/【判定ランク】：(\d)/);
    const goodMatch = text.match(/• 良かった点（Good）： (.*)/);
    const badMatch = text.match(/• 懸念点（Bad）： (.*)/);
    const adviceMatch = text.match(/【改善アドバイス】\s*• ([\s\S]*)/);

    return {
      rank: rankMatch ? parseInt(rankMatch[1], 10) : 0,
      reasonGood: goodMatch ? goodMatch[1].trim() : "解析できませんでした。",
      reasonBad: badMatch ? badMatch[1].trim() : "解析できませんでした。",
      advice: adviceMatch ? adviceMatch[1].trim() : "解析できませんでした。",
      rawResponse: text,
    };
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
