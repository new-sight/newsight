import { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";

interface ChartData {
  symbol: string;
  timestamps: number[];
  prices: (number | null)[];
}

export default function StockChart({ symbol }: { symbol: string }) {
  const [data, setData] = useState<ChartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Hover state
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const fetchChartData = useCallback(async () => {
    if (!symbol) return;
    setLoading(true);
    setError(null);
    try {
      const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:8080";
      const res = await axios.get<ChartData>(
        `${baseUrl}/api/stock/info/chart/${symbol}?range=1mo&interval=1d`,
      );
      setData(res.data);
    } catch (err: unknown) {
      let errMsg = "차트 데이터를 가져오는데 실패했습니다.";
      if (axios.isAxiosError(err)) {
        errMsg = err.response?.data?.message || err.message;
      } else if (err instanceof Error) {
        errMsg = err.message;
      }
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  }, [symbol]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchChartData();
  }, [fetchChartData]);

  if (loading) {
    return (
      <div className="w-full h-[13rem] border border-border/80 bg-bg-panel/20 rounded-xl flex items-center justify-center text-text-muted text-xs animate-pulse">
        차트 데이터를 불러오는 중...
      </div>
    );
  }

  if (error || !data || !data.prices || data.prices.length === 0) {
    return (
      <div className="w-full h-[13rem] border border-border/80 bg-bg-panel/20 rounded-xl flex items-center justify-center text-text-muted text-xs p-4 text-center">
        {error ? `차트 오류: ${error}` : "차트 데이터를 표시할 수 없습니다."}
      </div>
    );
  }

  // Filter valid prices and align them
  const validData = data.timestamps
    .map((timestamp, i) => ({
      timestamp,
      price: data.prices[i],
    }))
    .filter(
      (item): item is { timestamp: number; price: number } =>
        item.price !== null,
    );

  if (validData.length === 0) {
    return (
      <div className="w-full h-[13rem] border border-border/80 bg-bg-panel/20 rounded-xl flex items-center justify-center text-text-muted text-xs">
        유효한 가격 데이터가 없습니다.
      </div>
    );
  }

  const prices = validData.map((d) => d.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const priceRange = maxPrice - minPrice || 1;

  // Add small margin to min/max so chart doesn't touch edges
  const yMin = minPrice - priceRange * 0.05;
  const yMax = maxPrice + priceRange * 0.05;
  const yRange = yMax - yMin;

  // Responsive SVG Dimensions
  const svgWidth = 500;
  const svgHeight = 200;
  const paddingX = 16;
  const paddingY = 24;

  const getX = (index: number) => {
    return (
      paddingX + (index / (validData.length - 1)) * (svgWidth - 2 * paddingX)
    );
  };

  const getY = (price: number) => {
    return (
      svgHeight -
      paddingY -
      ((price - yMin) / yRange) * (svgHeight - 2 * paddingY)
    );
  };

  // Generate SVG Path
  const points = validData.map((d, i) => ({ x: getX(i), y: getY(d.price) }));
  const linePath = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
    .join(" ");

  // Filled Area Path
  const areaPath =
    points.length > 0
      ? `${linePath} L ${points[points.length - 1].x} ${svgHeight - paddingY} L ${points[0].x} ${svgHeight - paddingY} Z`
      : "";

  // Handle Mouse Hover
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
    if (!containerRef.current || points.length === 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const mouseX = ((e.clientX - rect.left) / rect.width) * svgWidth;

    // Find the closest point index based on X coordinate
    let closestIdx = 0;
    let minDiff = Infinity;
    points.forEach((p, i) => {
      const diff = Math.abs(p.x - mouseX);
      if (diff < minDiff) {
        minDiff = diff;
        closestIdx = i;
      }
    });

    setHoverIndex(closestIdx);

    // Position tooltip relative to container div
    const clientX = (points[closestIdx].x / svgWidth) * rect.width;
    const clientY = (points[closestIdx].y / svgHeight) * rect.height;

    // Clamp the tooltip x coordinate within the container boundary to avoid overflow
    const tooltipWidth = 90; // estimated width
    const clampedX = Math.min(
      Math.max(clientX - 45, 4),
      rect.width - tooltipWidth,
    );

    setTooltipPos({ x: clampedX, y: clientY });
  };

  const handleMouseLeave = () => {
    setHoverIndex(null);
  };

  // Determine line color based on overall price change
  const priceStart = prices[0];
  const priceEnd = prices[prices.length - 1];
  const isOverallUp = priceEnd >= priceStart;
  const strokeColor = isOverallUp
    ? "var(--color-up, #e8556c)"
    : "var(--color-down, #4fa7e0)";
  const gradientId = `areaGrad-${symbol}`;

  return (
    <div
      ref={containerRef}
      className="w-full relative bg-bg-panel/20 border border-border/80 rounded-xl p-3 shadow-inner flex flex-col gap-2"
    >
      <div className="flex items-center justify-between text-[11px] text-text-muted px-1">
        <span>최근 1개월 추이</span>
        <span
          className={`font-semibold ${isOverallUp ? "text-up" : "text-down"}`}
        >
          {isOverallUp ? "▲" : "▼"}{" "}
          {(((priceEnd - priceStart) / priceStart) * 100).toFixed(2)}%
        </span>
      </div>

      <div className="w-full h-[10rem] relative">
        <svg
          className="w-full h-full cursor-crosshair overflow-visible"
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          preserveAspectRatio="none"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={strokeColor} stopOpacity="0.2" />
              <stop offset="100%" stopColor={strokeColor} stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line
            x1={paddingX}
            y1={getY(maxPrice)}
            x2={svgWidth - paddingX}
            y2={getY(maxPrice)}
            stroke="var(--color-border)"
            strokeDasharray="2 2"
          />
          <line
            x1={paddingX}
            y1={getY(minPrice)}
            x2={svgWidth - paddingX}
            y2={getY(minPrice)}
            stroke="var(--color-border)"
            strokeDasharray="2 2"
          />

          {/* Filled Area */}
          {areaPath && <path d={areaPath} fill={`url(#${gradientId})`} />}

          {/* Sparkline Path */}
          {linePath && (
            <path
              d={linePath}
              fill="none"
              stroke={strokeColor}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Hover effects */}
          {hoverIndex !== null && points[hoverIndex] && (
            <>
              {/* Vertical dotted line */}
              <line
                x1={points[hoverIndex].x}
                y1={paddingY}
                x2={points[hoverIndex].x}
                y2={svgHeight - paddingY}
                stroke="var(--color-text-muted)"
                strokeOpacity="0.3"
                strokeDasharray="3 3"
              />
              {/* Hover dot */}
              <circle
                cx={points[hoverIndex].x}
                cy={points[hoverIndex].y}
                r="4"
                fill={strokeColor}
                stroke="var(--color-bg-panel, #1e1d25)"
                strokeWidth="2"
              />
            </>
          )}
        </svg>

        {/* Hover Tooltip Card */}
        {hoverIndex !== null && validData[hoverIndex] && (
          <div
            className="absolute z-20 pointer-events-none bg-bg-panel border border-border/85 px-2 py-1 rounded-lg shadow-xl flex flex-col gap-0.5 text-[9px] font-sans transition-all duration-75"
            style={{
              left: `${tooltipPos.x}px`,
              top: `${Math.max(tooltipPos.y - 45, 0)}px`,
            }}
          >
            <span className="text-text-muted font-medium">
              {new Date(
                validData[hoverIndex].timestamp * 1000,
              ).toLocaleDateString("ko-KR", {
                month: "short",
                day: "numeric",
              })}
            </span>
            <span className="text-white font-bold font-mono text-xs">
              {validData[hoverIndex].price.toLocaleString()}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
