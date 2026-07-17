import StockCard, { type StockItem } from "./StockCard";

type PredictionSectionProps = {
  title: string;
  stocks: StockItem[];
  tone: "up" | "down";
};

export default function PredictionSection({
  title,
  stocks,
  tone,
}: PredictionSectionProps) {
  const isUp = tone === "up";

  const textColor = isUp ? "text-red-400" : "text-sky-400";
  const dotColor = isUp ? "bg-red-500" : "bg-sky-500";

  return (
    <div className="rounded-lg bg-[#111111] p-4">
      <header className="mb-4 flex items-center gap-2">
        <span className={`h-2.5 w-2.5 rounded-full ${dotColor}`} />

        <h2 className={`text-xl font-bold ${textColor}`}>
          {title}
        </h2>

        <span className="text-sm text-zinc-400">
          {stocks.length}종목
        </span>
      </header>

      <div className="space-y-4">
        {stocks.map((item, index) => (
          <StockCard
            key={item.stock}
            item={item}
            rank={index + 1}
            tone={tone}
          />
        ))}
      </div>
    </div>
  );
}