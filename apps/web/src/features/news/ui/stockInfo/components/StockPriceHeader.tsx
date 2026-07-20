//part1
export default function StockPriceHeader() {
  return (
    <>
      <div className="border border-gray-600 rounded-lg p-1">
        {/* (주식코드) · (주식장) */}
        000660 · KOSPI
      </div>
      <div className="text-xl font-bold border border-slate-800 rounded-lg p-1">
        SK 하이닉스
      </div>
      <div className="flex gap-2 border border-slate-800 rounded-lg p-1">
        {/* regularMarketPrice */}
        1842000원 ·<div className="">전일대비:</div>
        <div>
          {/* regularMarketChange*/}
          <span>-240000</span>
          {/* regularMarketChangePercent */}
          <span>(-11.53%)</span>
        </div>
      </div>
    </>
  );
}
