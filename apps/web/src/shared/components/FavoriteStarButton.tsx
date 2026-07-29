import { useEffect, useState } from "react";
import { addFavoriteStock, fetchFavoriteStocks, removeFavoriteStock } from "../../features/favoriteStock/api/FavoriteStock";

export interface FavoriteStarButtonProps {
  symbol?: string;
  initialStarred?: boolean;
  onToggleFavorite?: (symbol?: string, isStarred?: boolean) => void;
  onRemove?: () => void;
  size?: number | string;
  className?: string;
}

export default function FavoriteStarButton({ symbol, initialStarred = false, onToggleFavorite, onRemove, size = 22, className = "absolute top-3 right-3 z-10" }: FavoriteStarButtonProps) {
  const [isStarred, setIsStarred] = useState(initialStarred);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => setIsStarred(initialStarred), [initialStarred]);
  useEffect(() => {
    if (!symbol || !localStorage.getItem("accessToken")) return;
    let active = true;
    fetchFavoriteStocks().then((stocks) => {
      if (active) setIsStarred(stocks.some((stock) => stock.stockCode.toUpperCase() === symbol.toUpperCase()));
    }).catch(() => undefined);
    return () => { active = false; };
  }, [symbol]);

  const handleClick = async (event: React.MouseEvent) => {
    event.stopPropagation();
    if (!symbol || isLoading) return;
    if (!localStorage.getItem("accessToken")) {
      alert("관심 종목을 등록하려면 로그인이 필요합니다.");
      return;
    }
    const nextState = !isStarred;
    setIsStarred(nextState);
    setIsLoading(true);
    try {
      if (nextState) await addFavoriteStock(symbol);
      else await removeFavoriteStock(symbol);
      onToggleFavorite?.(symbol, nextState);
      if (!nextState) onRemove?.();
    } catch (error) {
      setIsStarred(!nextState);
      alert(error instanceof Error ? error.message : "관심 종목 처리에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const fontSize = typeof size === "number" ? `${size}px` : size === "sm" ? "16px" : size === "md" ? "22px" : size === "lg" ? "26px" : size;
  const numericSize = typeof size === "number" ? size : parseFloat(fontSize) || 22;
  return <button type="button" onClick={handleClick} disabled={isLoading} className={`${numericSize <= 18 ? "p-1 rounded-lg" : "p-1.5 rounded-xl"} hover:bg-white/10 text-gray-400 hover:text-yellow-400 transition-colors cursor-pointer flex items-center justify-center ${className}`} title={isStarred ? "관심 종목 해제" : "관심 종목 추가"}>
    <span className={`material-symbols-rounded select-none ${isStarred ? "text-yellow-400" : ""}`} style={{ fontSize, fontVariationSettings: isStarred ? "'FILL' 1" : "'FILL' 0" }}>star</span>
  </button>;
}

export function SmallFavoriteStarButton(props: Omit<FavoriteStarButtonProps, "size">) {
  return <FavoriteStarButton {...props} size={16} />;
}
