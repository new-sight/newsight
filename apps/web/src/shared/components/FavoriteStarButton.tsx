import { useState, useEffect } from "react";
import {
  addFavoriteStock,
  deleteFavoriteStock,
  checkFavoriteStock,
} from "../../features/favoriteStock/api/favoriteStock";

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

  useEffect(() => {
    setIsStarred(initialStarred);
  }, [initialStarred]);

  useEffect(() => {
    let isMounted = true;
    if (symbol && localStorage.getItem("accessToken")) {
      checkFavoriteStock(symbol)
        .then((starred) => {
          if (isMounted) setIsStarred(starred);
        })
        .catch((err) => {
          console.error(
            "[FavoriteStarButton] Failed to check favorite state:",
            err,
          );
        });
    }
    return () => {
      isMounted = false;
    };
  }, [symbol]);

  const handleClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextState = !isStarred;
    setIsStarred(nextState);

    if (onToggleFavorite) {
      onToggleFavorite(symbol, nextState);
    }
    if (!nextState && onRemove) {
      onRemove();
    }

    if (symbol && localStorage.getItem("accessToken")) {
      try {
        if (nextState) {
          await addFavoriteStock(symbol);
        } else {
          await deleteFavoriteStock(symbol);
        }
      } catch (err) {
        console.error("관심 종목 처리 중 오류 발생:", err);
        // 실패 시 UI 원상 복구
        setIsStarred(!nextState);
      }
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
