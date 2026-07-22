import { useState, useEffect, useCallback } from "react";
import axios from "axios";

export interface StockInfoData {
  symbol?: string;
  companyName?: string;
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
      const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:8080";
      const response = await axios.get<StockInfoData>(
        `${baseUrl}/api/stock/info/${stockCode}`,
      );
      const result = response.data;
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
      let errMsg = "주식 정보를 가져오는데 실패했습니다.";
      if (axios.isAxiosError(err)) {
        errMsg = err.response?.data?.message || err.message;
      } else if (err instanceof Error) {
        errMsg = err.message;
      }
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
