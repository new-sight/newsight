type Status = "급등중" | "급등예정" | "급락중" | "급락예정";

type TickerItem = {
  name: string;
  ticker: string;
  status: Status;
};

const STATUS_COLOR: Record<Status, string> = {
  급등중: "text-up",
  급등예정: "text-up",
  급락중: "text-down",
  급락예정: "text-down",
};

// ponytail: mock list until a real quote/news feed is wired up
const STOCKS: TickerItem[] = [
  { name: "NVIDIA", ticker: "NVDA", status: "급등중" },
  { name: "삼성전자", ticker: "005930", status: "급등예정" },
  { name: "SK하이닉스", ticker: "000660", status: "급등중" },
  { name: "TSMC", ticker: "TSM", status: "급락예정" },
  { name: "Broadcom", ticker: "AVGO", status: "급락중" },
  { name: "카카오", ticker: "035720", status: "급락예정" },
];

const ITEMS = [...STOCKS, ...STOCKS];

export default function TickerTape() {
  return (
    <div className="overflow-hidden whitespace-nowrap border-b border-border bg-bg-sunken py-2">
      <div className="inline-flex animate-[marquee_20s_linear_infinite] pl-6">
        {ITEMS.map((item, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-2 whitespace-nowrap border-r border-border px-5 font-mono text-[13px]"
          >
            <b className="font-semibold text-text">{item.name}</b>
            <span className="text-text-muted">{item.ticker}</span>
            <span className={"font-semibold " + STATUS_COLOR[item.status]}>
              {item.status}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
