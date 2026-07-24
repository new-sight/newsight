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

  const accentText = isUp ? "text-up" : "text-down";
  const accentBorder = isUp ? "border-l-up" : "border-l-down";

  return (
    <article
      className={`rounded-[3px] border border-white/[0.06] border-l-[3px] bg-bg px-3.5 py-2.5 ${accentBorder}`}
    >
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span className={`min-w-5 font-mono text-sm font-bold ${accentText}`}>
          {rank}
        </span>

        <h3 className="text-[15px] font-semibold leading-snug text-text">
          {name}
        </h3>

        {ticker && (
          <span className="font-mono text-[12.5px] text-text-muted">
            {ticker}
          </span>
        )}
      </div>

      <p className="mt-1.5 text-[13px] leading-snug text-text-muted">
        {item.reason}
      </p>
    </article>
  );
}
