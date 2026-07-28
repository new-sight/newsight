import { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";

export interface SupabaseStockItem {
  stock_code: string;
  stock_name: string;
  kor_name?: string;
  market_type?: string;
}

interface SearchBarProps {
  onAddStock: (symbol: string, korName?: string) => void;
  placeholder?: string;
}

export default function SearchBar({
  onAddStock,
  placeholder = "티커/회사명/한글명 입력",
}: SearchBarProps) {
  const [newTicker, setNewTicker] = useState("");
  const [suggestions, setSuggestions] = useState<SupabaseStockItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Supabase stock 테이블 실시간 검색 (주식코드 / 회사명 / 한글명 부분 검색 5개 제한)
  const fetchSuggestions = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    setIsSearching(true);
    const supabaseUrl =
      import.meta.env.VITE_SUPABASE_URL ||
      "https://rjtoalnqvrgsqmqcgrde.supabase.co";
    const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";
    const trimmed = query.trim();
    const encoded = encodeURIComponent(trimmed);

    const url = `${supabaseUrl}/rest/v1/stock?select=stock_code,stock_name,kor_name,market_type&or=(stock_code.ilike.*${encoded}*,stock_name.ilike.*${encoded}*,kor_name.ilike.*${encoded}*)&limit=5`;

    try {
      const response = await axios.get<SupabaseStockItem[]>(url, {
        headers: {
          apikey: anonKey,
          Authorization: `Bearer ${anonKey}`,
        },
      });
      setSuggestions(response.data);
      setShowDropdown(true);
    } catch (err) {
      console.error("[SearchBar] Supabase stock search error:", err);
      setSuggestions([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // 입력값 변경 시 디바운스 검색 적용 (200ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchSuggestions(newTicker);
    }, 200);

    return () => clearTimeout(timer);
  }, [newTicker, fetchSuggestions]);

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAdd = (selectedItem?: SupabaseStockItem) => {
    let targetCode = "";
    let targetKorName: string | undefined = undefined;

    if (selectedItem) {
      targetCode = selectedItem.stock_code.toUpperCase();
      targetKorName = selectedItem.kor_name || selectedItem.stock_name;
    } else {
      targetCode = newTicker.trim().toUpperCase();
      if (!targetCode) return;
      const matched = suggestions.find(
        (s) => s.stock_code.toUpperCase() === targetCode,
      );
      if (matched) {
        targetKorName = matched.kor_name || matched.stock_name;
      }
    }

    if (!targetCode) return;

    onAddStock(targetCode, targetKorName);
    setNewTicker("");
    setSuggestions([]);
    setShowDropdown(false);
  };

  return (
    <div ref={searchContainerRef} className="relative flex items-center gap-2">
      <div className="relative">
        <input
          type="text"
          placeholder={placeholder}
          value={newTicker}
          onChange={(e) => setNewTicker(e.target.value)}
          onFocus={() => {
            if (suggestions.length > 0) setShowDropdown(true);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              if (suggestions.length > 0 && showDropdown) {
                handleAdd(suggestions[0]);
              } else {
                handleAdd();
              }
            }
          }}
          className="w-64 rounded-xl border border-gray-700 bg-white/5 px-4 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-accent transition-colors"
        />

        {/* 검색 미리보기 5개 드롭다운 */}
        {showDropdown && (
          <div className="absolute right-0 top-full mt-2 w-72 rounded-xl border border-white/10 bg-white/5 p-1.5 shadow-2xl backdrop-blur-xl z-50 overflow-hidden space-y-0.5">
            {isSearching ? (
              <div className="px-4 py-3 text-xs text-white/50 text-center flex items-center justify-center gap-2">
                <span className="animate-spin text-sm">⏳</span> 검색 중...
              </div>
            ) : suggestions.length === 0 ? (
              <div className="px-4 py-3 text-xs text-white/40 text-center">
                일치하는 종목이 없습니다.
              </div>
            ) : (
              suggestions.map((item) => {
                const displayName = item.kor_name || item.stock_name;
                return (
                  <button
                    key={item.stock_code}
                    type="button"
                    onClick={() => handleAdd(item)}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-left text-xs transition-colors hover:bg-white/10 cursor-pointer group"
                  >
                    <div className="flex flex-col min-w-0 pr-2">
                      <span className="font-semibold text-white truncate group-hover:text-accent">
                        {displayName}
                      </span>
                      {item.kor_name && item.stock_name !== item.kor_name && (
                        <span className="text-[10px] text-white/40 truncate">
                          {item.stock_name}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="rounded bg-accent/20 px-1.5 py-0.5 font-mono text-[10px] font-bold text-accent border border-accent/30">
                        {item.stock_code}
                      </span>
                      {item.market_type && (
                        <span className="rounded bg-white/10 px-1 py-0.5 font-mono text-[9px] text-white/60">
                          {item.market_type}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={() => {
          if (suggestions.length > 0 && showDropdown) {
            handleAdd(suggestions[0]);
          } else {
            handleAdd();
          }
        }}
        className="flex items-center gap-1 rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 cursor-pointer active:scale-95 shrink-0"
      >
        <span className="material-symbols-outlined text-base">add</span>
        추가
      </button>
    </div>
  );
}
