import { useState, useEffect, useCallback } from "react";

export interface StockInfoData {
  symbol?: string;
  fullExchangeName?: string;
  shortName?: string;
  longName?: string;
  regularMarketPrice?: number;
  regularMarketChange?: number;
  regularMarketChangePercent?: number;
  regularMarketVolume?: number;
  averageDailyVolume3Month?: number;
  regularMarketDayRange?: string;
  marketCap?: number;
  epsTrailingTwelveMonths?: number;
  trailingPE?: number;
  forwardPE?: number;
  priceToBook?: number;
  fiftyTwoWeekRange?: string;
  twoHundredDayAverage?: number;
  dividendYield?: number;
  earningsTimestamp?: number;
  currency?: string;
  financialCurrency?: string;
  exchangeTimezoneName?: string;
  marketState?: string;
  error?: string;
  [key: string]: unknown;
}

export function useGetStockInfo(stockCode: string | null | undefined) {
  const [data, setData] = useState<StockInfoData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStockInfo = useCallback(async () => {
    if (!stockCode) {
      console.log("[useGetStockInfo] stockCode is empty, skipping fetch");
      setData(null);
      setError(null);
      return;
    }

    console.log(`[useGetStockInfo] Fetching stock data for: ${stockCode}`);
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `http://localhost:8080/api/stock/info/${stockCode}`,
      );
      console.log(`[useGetStockInfo] HTTP Response Status: ${response.status}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result: StockInfoData = await response.json();
      console.log("[useGetStockInfo] Received result:", result);
      if (result.error) {
        console.warn(`[useGetStockInfo] API error returned: ${result.error}`);
        setError(result.error);
        setData(null);
      } else {
        setData(result);
      }
    } catch (err: unknown) {
      console.error("[useGetStockInfo] Fetch exception:", err);
      const errMsg =
        err instanceof Error
          ? err.message
          : "주식 정보를 가져오는데 실패했습니다.";
      setError(errMsg);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [stockCode]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchStockInfo();
  }, [fetchStockInfo]);

  return { data, loading, error, refetch: fetchStockInfo };
}

export default useGetStockInfo;
