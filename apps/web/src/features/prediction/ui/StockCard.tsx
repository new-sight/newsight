export type StockItem = {
  stock: string;
  reason: string;
};

type StockCardProps = {
  item: StockItem;
  rank: number;
  tone: "up" | "down";
};

function splitStock(stock: string) {
  const matched = stock.match(/^(.*)\s\((.*)\)$/);

  return matched
    ? { name: matched[1], ticker: matched[2] }
    : { name: stock, ticker: "" };
}

export default function StockCard({ item, rank, tone }: StockCardProps) {
  const { name, ticker } = splitStock(item.stock);
  const isUp = tone === "up";

  const accentText = isUp ? "text-red-400" : "text-sky-400";
  const accentBorder = isUp ? "border-l-red-500" : "border-l-sky-500";

  return (
    <article
      className={`min-h-[132px] rounded-lg border-l-[5px] bg-black px-7 py-6 ${accentBorder}`}
    >
      <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
        <span className={`min-w-5 font-mono text-xl font-bold ${accentText}`}>
          {rank}
        </span>

        <h3 className="text-[22px] font-bold leading-tight tracking-[-0.04em] text-white">
          {name}
        </h3>

        {ticker && (
          <span className="font-mono text-lg font-medium text-zinc-500">
            {ticker}
          </span>
        )}
      </div>

      <p className="mt-4 text-[17px] leading-8 text-zinc-300">
        {item.reason}
      </p>
    </article>
  );
}