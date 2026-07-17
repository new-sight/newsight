import PredictionSection from "./ui/PredictionSection";

const track1 = [
  {
    stock: "NVIDIA (NVDA)",
    reason: "AI 칩 수요 증가와 글로벌 AI 투자 확대로 단기 상승 모멘텀이 기대됩니다.",
  },
  {
    stock: "TSMC (TSM)",
    reason: "첨단 반도체 생산 확대와 AI 반도체 수요 증가의 수혜가 예상됩니다.",
  },
  {
    stock: "삼성전자 (005930)",
    reason: "HBM 메모리 수요 증가와 반도체 업황 개선 기대감이 반영되고 있습니다.",
  },
  {
    stock: "SK하이닉스 (000660)",
    reason: "AI 서버용 고대역폭 메모리 공급 확대에 따른 성장성이 기대됩니다.",
  },
  {
    stock: "Broadcom (AVGO)",
    reason: "AI 네트워크 반도체 수요 증가로 단기 성장 가능성이 높게 평가됩니다.",
  },
];

const track2 = [
  {
    stock: "AMD (AMD)",
    reason: "AI GPU 시장 확대와 데이터센터 수요 증가로 중장기 성장이 예상됩니다.",
  },
  {
    stock: "ARM Holdings (ARM)",
    reason: "AI 반도체 설계 시장 성장에 따른 간접 수혜가 기대됩니다.",
  },
  {
    stock: "Micron Technology (MU)",
    reason: "메모리 반도체 업황 회복과 AI 수요 증가로 실적 개선 가능성이 있습니다.",
  },
  {
    stock: "ASML (ASML)",
    reason: "EUV 노광 장비 수요 증가로 반도체 투자 확대 수혜가 예상됩니다.",
  },
  {
    stock: "Applied Materials (AMAT)",
    reason: "반도체 제조 장비 투자 확대에 따른 성장성이 기대됩니다.",
  },
];

const track3 = [
  {
    stock: "한화오션 (042660)",
    reason: "잠수함 사업 관련 수주 실패 이슈로 단기 투자 주의가 필요합니다.",
  },
  {
    stock: "Intel (INTC)",
    reason: "실적 부진과 파운드리 사업 불확실성으로 하락 압력이 발생했습니다.",
  },
  {
    stock: "Tesla (TSLA)",
    reason: "전기차 판매 둔화와 가격 경쟁 심화로 단기 악재가 발생했습니다.",
  },
  {
    stock: "Boeing (BA)",
    reason: "항공기 품질 문제와 생산 차질 이슈가 투자 심리에 영향을 주고 있습니다.",
  },
  {
    stock: "카카오 (035720)",
    reason: "플랫폼 규제와 성장성 둔화 우려로 단기 투자 심리가 약화되었습니다.",
  },
];

const track4 = [
  {
    stock: "Qualcomm (QCOM)",
    reason: "스마트폰 시장 둔화와 반도체 업황 불확실성으로 장기 리스크가 존재합니다.",
  },
  {
    stock: "ON Semiconductor (ON)",
    reason: "전기차 시장 성장 둔화로 장기적인 수요 감소 가능성이 있습니다.",
  },
  {
    stock: "Marvell Technology (MRVL)",
    reason: "데이터센터 투자 감소 시 성장 전망에 부정적인 영향을 받을 수 있습니다.",
  },
  {
    stock: "NXP Semiconductors (NXPI)",
    reason: "자동차 반도체 수요 둔화와 글로벌 경기 불확실성이 우려됩니다.",
  },
  {
    stock: "Texas Instruments (TXN)",
    reason: "산업용 반도체 수요 감소로 장기적인 성장 둔화 가능성이 있습니다.",
  },
];

export default function PredictionPage() {
  return (
    <div className="mx-auto max-w-[1600px] px-4 py-8 sm:px-8">
      <div className="mb-7 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.16em] text-zinc-500">
            Market Intelligence
          </p>

          <h1 className="mt-1 text-3xl font-bold tracking-[-0.05em] text-white">
            주식 예측
          </h1>
        </div>

        <p className="text-sm text-zinc-500">
          뉴스 분석 기반의 실시간 시장 신호
        </p>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <div className="rounded-xl border border-red-500/30 bg-[#111111] p-5">
          <PredictionSection
            title="급등중"
            stocks={track1}
            tone="up"
          />
        </div>

        <div className="rounded-xl border border-sky-500/30 bg-[#111111] p-5">
          <PredictionSection
            title="급락중"
            stocks={track3}
            tone="down"
          />
        </div>

        <div className="rounded-xl border border-red-500/30 bg-[#111111] p-5">
          <PredictionSection
            title="급등 예정"
            stocks={track2}
            tone="up"
          />
        </div>

        <div className="rounded-xl border border-sky-500/30 bg-[#111111] p-5">
          <PredictionSection
            title="급락 예정"
            stocks={track4}
            tone="down"
          />
        </div>
      </div>
    </div>
  );
}