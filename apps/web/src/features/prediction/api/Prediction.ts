export interface Stock {
  stock: string;
  reason: string;
}

export interface PredictionResponse {
  track1: Stock[];
  track2: Stock[];
  track3: Stock[];
  track4: Stock[];
  created_at: string;
}

export async function getPrediction(): Promise<PredictionResponse> {
  const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:8080";
  const response = await fetch(`${baseUrl}/api/news/briefing`);

  if (!response.ok) {
    throw new Error("주식 예측 데이터를 불러오지 못했습니다.");
  }

  return response.json();
}
