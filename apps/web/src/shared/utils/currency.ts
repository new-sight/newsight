export const getCurrencySymbol = (currency: string | undefined): string => {
  if (!currency) return "";
  switch (currency.toUpperCase()) {
    case "KRW":
      return "₩";
    case "USD":
      return "$";
    case "JPY":
    case "CNY":
      return "¥";
    case "EUR":
      return "€";
    case "GBP":
      return "£";
    default:
      return currency + " ";
  }
};

export const formatCurrencyPrice = (
  num: number | undefined,
  currency: string | undefined,
): string => {
  if (num === undefined || num === null) return "None";
  const symbol = getCurrencySymbol(currency);
  const isDecimal =
    currency && !["KRW", "JPY"].includes(currency.toUpperCase());
  const formattedVal = isDecimal
    ? num.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    : Math.round(num).toLocaleString();
  return `${symbol}${formattedVal}`;
};

export const formatRange = (
  rangeStr: string | undefined,
  currency: string | undefined,
): string => {
  if (!rangeStr) return "None";
  const parts = rangeStr.split("-").map((p) => p.trim());
  if (parts.length === 2) {
    const min = parseFloat(parts[0]);
    const max = parseFloat(parts[1]);
    if (!isNaN(min) && !isNaN(max)) {
      return `${formatCurrencyPrice(min, currency)} - ${formatCurrencyPrice(max, currency)}`;
    }
  }
  return rangeStr;
};

export const formatMarketCap = (
  num: number | undefined,
  currency: string | undefined,
): string => {
  if (num === undefined || num === null) return "None";
  const symbol = getCurrencySymbol(currency);
  if (currency?.toUpperCase() === "KRW") {
    if (num >= 1e12) {
      return `${symbol}${(num / 1e12).toFixed(2)}조`;
    }
    if (num >= 1e8) {
      return `${symbol}${(num / 1e8).toFixed(2)}억`;
    }
    return `${symbol}${num.toLocaleString()}`;
  } else {
    if (num >= 1e12) {
      return `${symbol}${(num / 1e12).toFixed(2)}T`;
    }
    if (num >= 1e9) {
      return `${symbol}${(num / 1e9).toFixed(2)}B`;
    }
    if (num >= 1e6) {
      return `${symbol}${(num / 1e6).toFixed(2)}M`;
    }
    return `${symbol}${num.toLocaleString()}`;
  }
};
