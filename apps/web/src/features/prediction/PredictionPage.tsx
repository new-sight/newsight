import { useEffect, useState } from "react";
import PredictionSection from "./ui/PredictionSection";
import { getPrediction, type PredictionResponse } from "./api/Prediction";

export default function PredictionPage() {
  const [prediction, setPrediction] = useState<PredictionResponse | null>(null);

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
    return (
      <div className="flex flex-col items-center justify-center gap-5 py-24">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-accent" />
        <p className="text-[14px] text-text-muted">
          AI가 주식 등락을 예측하고 있어요
        </p>
      </div>
    );
  }

  if (!prediction) {
    return (
      <div className="p-3.5 text-[12.5px] text-text-muted">
        데이터를 불러오지 못했습니다.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="font-heading text-xl font-semibold">주식 예측</h1>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="divide-y divide-border rounded-md border border-border bg-bg-panel">
          <PredictionSection
            title="급등중"
            stocks={prediction.track1}
            tone="up"
          />
          <PredictionSection
            title="급등 예정"
            stocks={prediction.track2}
            tone="up"
          />
        </div>

        <div className="divide-y divide-border rounded-md border border-border bg-bg-panel">
          <PredictionSection
            title="급락중"
            stocks={prediction.track3}
            tone="down"
          />
          <PredictionSection
            title="급락 예정"
            stocks={prediction.track4}
            tone="down"
          />
        </div>
      </div>
    </div>
  );
}
