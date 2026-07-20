import { useEffect, useState } from "react";
import PredictionSection from "./ui/PredictionSection";
import { getPrediction, type PredictionResponse } from "./api/Prediction";

export default function PredictionPage() {
  const [prediction, setPrediction] =
    useState<PredictionResponse | null>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPrediction = async () => {
      try {
        const data = await getPrediction();
        setPrediction(data);
      } catch (error) {
        console.error("예측 데이터 불러오기 실패:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPrediction();
  }, []);

  if (loading) {
    return <div className="p-8">불러오는 중...</div>;
  }

  if (!prediction) {
    return <div className="p-8">데이터를 불러오지 못했습니다.</div>;
  }

 return (
  <div className="space-y-8 p-8">
    <h1 className="text-4xl font-bold text-white">
      📈 주식 예측
    </h1>

    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
      <PredictionSection
        title="🚀 급등중"
        stocks={prediction.track1}
        tone="up"
      />

      <PredictionSection
        title="📉 급락중"
        stocks={prediction.track3}
        tone="down"
      />

      <PredictionSection
        title="📈 급등 예정"
        stocks={prediction.track2}
        tone="up"
      />

      <PredictionSection
        title="⚠️ 급락 예정"
        stocks={prediction.track4}
        tone="down"
      />
    </div>
  </div>
  );
}