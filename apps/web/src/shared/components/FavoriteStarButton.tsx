import { useEffect, useState } from "react";

import {
  addFavoriteStock,
  fetchFavoriteStocks,
  removeFavoriteStock,
} from "../../features/favoriteStock/api/FavoriteStock";

export interface FavoriteStarButtonProps {
  symbol?: string;
  initialStarred?: boolean;
  onToggleFavorite?: (symbol?: string, isStarred?: boolean) => void;
  onRemove?: () => void;
  size?: number | string;
  className?: string;
}

export default function FavoriteStarButton({
  symbol,
  initialStarred = false,
  onToggleFavorite,
  onRemove,
  size = 22,
  className = "absolute top-3 right-3 z-10",
}: FavoriteStarButtonProps) {
  const [isStarred, setIsStarred] = useState(initialStarred);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
  setIsStarred(initialStarred);
}, [initialStarred]);

  useEffect(() => {
    if (!symbol) return;

    let active = true;
    fetchFavoriteStocks()
      .then((stocks) => {
        if (active) {
          setIsStarred(
            stocks.some((stock) => stock.stockCode.toUpperCase() === symbol.toUpperCase()),
          );
        }
      })
      .catch(() => {
        // 비로그인 상태에서는 기본 별표 상태를 유지합니다.
      });

    return () => {
      active = false;
    };
  }, [symbol]);

  const handleClick = async (e: React.MouseEvent) => {
  e.stopPropagation();

  if (!symbol || isLoading) return;

  const nextState = !isStarred;

  setIsStarred(nextState);
  setIsLoading(true);

  try {
    if (nextState) {
      await addFavoriteStock(symbol);
    } else {
      await removeFavoriteStock(symbol);
    }

    onToggleFavorite?.(symbol, nextState);

    if (!nextState) {
      onRemove?.();
    }
  } catch (err) {
    console.error("관심 종목 처리 중 오류 발생:", err);


    setIsStarred(!nextState);
  } finally {
    setIsLoading(false);
  }
};


  const getFontSize = (): string => {
    if (typeof size === "number") return `${size}px`;
    if (size === "sm") return "16px";
    if (size === "md") return "22px";
    if (size === "lg") return "26px";
    return size;
  };

  const fontSize = getFontSize();
  const numSize = typeof size === "number" ? size : parseFloat(fontSize) || 22;
  const paddingClass = numSize <= 18 ? "p-1 rounded-lg" : "p-1.5 rounded-xl";

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isLoading}
      className={`${paddingClass} hover:bg-white/10 text-gray-400 hover:text-yellow-400 transition-colors cursor-pointer flex items-center justify-center ${className}`}
      title={isStarred ? "관심 종목 해제" : "관심 종목 추가"}
    >
      <span
        className={`material-symbols-rounded select-none ${
          isStarred ? "text-yellow-400" : ""
        }`}
        style={{
          fontSize,
          fontVariationSettings: isStarred ? "'FILL' 1" : "'FILL' 0",
        }}
      >
        star
      </span>
    </button>
  );
}

export function SmallFavoriteStarButton(
  props: Omit<FavoriteStarButtonProps, "size">,
) {
  return <FavoriteStarButton {...props} size={16} />;
}
