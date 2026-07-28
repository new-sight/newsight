import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export interface SupabaseStockItem {
  stock_code: string;
  stock_name: string;
  kor_name?: string;
  market_type?: string;
}

export default function NewsSearchBar() {
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState("");
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
      console.error("[NewsSearchBar] Supabase stock search error:", err);
      setSuggestions([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // 입력값 변경 시 디바운스 검색 적용 (200ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchSuggestions(searchInput);
    }, 200);

    return () => clearTimeout(timer);
  }, [searchInput, fetchSuggestions]);

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

  const handleNavigate = (selectedCode?: string) => {
    let targetCode = selectedCode;
    if (!targetCode) {
      const trimmed = searchInput.trim();
      if (!trimmed) return;
      // 검색된 제안 중 정확히 매칭되거나 첫번째 제안 코드 활용 가능
      const matched = suggestions.find(
        (s) =>
          s.stock_code.toLowerCase() === trimmed.toLowerCase() ||
          s.stock_name.toLowerCase() === trimmed.toLowerCase() ||
          (s.kor_name && s.kor_name.toLowerCase() === trimmed.toLowerCase()),
      );
      targetCode = matched ? matched.stock_code : trimmed;
    }

    if (targetCode) {
      setShowDropdown(false);
      navigate(`/news/${targetCode}`);
    }
  };

  return (
    <div ref={searchContainerRef} className="relative group w-full">
      <div className="absolute -inset-0.5 bg-linear-to-r from-accent to-up rounded-2xl blur-md opacity-25 transition duration-300"></div>
      <div className="relative flex items-center bg-bg-panel border border-border rounded-xl px-4 py-3 shadow-2xl transition-all duration-300">
        <span className="material-symbols-outlined text-text-muted text-[24px] mr-3 select-none">
          search
        </span>
        <input
          type="text"
          placeholder="티커 / 회사명 / 한글명 입력 (예: AAPL, 삼성전자)"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onFocus={() => {
            if (suggestions.length > 0) setShowDropdown(true);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              if (suggestions.length > 0 && showDropdown) {
                handleNavigate(suggestions[0].stock_code);
              } else {
                handleNavigate();
              }
            }
          }}
          className="w-full bg-transparent placeholder-text-muted border-none outline-none text-base sm:text-lg font-sans text-white"
          autoFocus
        />
        <button
          type="button"
          onClick={() => {
            if (suggestions.length > 0 && showDropdown) {
              handleNavigate(suggestions[0].stock_code);
            } else {
              handleNavigate();
            }
          }}
          className="ml-3 px-5 py-2 bg-accent hover:bg-accent/90 text-white font-medium rounded-lg transition-colors cursor-pointer text-sm sm:text-base whitespace-nowrap shadow-md hover:shadow-accent/20"
        >
          검색
        </button>
      </div>

      {/* 5개 미리보기 자동완성 드롭다운 */}
      {showDropdown && (
        <div className="absolute left-0 right-0 top-full mt-2 rounded-xl border border-gray-700 bg-white/5 p-2 shadow-2xl backdrop-blur-xl z-50 overflow-hidden space-y-1">
          {isSearching ? (
            <div className="px-4 py-3 text-sm text-white/50 text-center flex items-center justify-center gap-2">
              <span className="animate-spin text-base">⏳</span> 검색 중...
            </div>
          ) : suggestions.length === 0 ? (
            <div className="px-4 py-3 text-sm text-white/40 text-center">
              일치하는 종목이 없습니다.
            </div>
          ) : (
            suggestions.map((item) => {
              const displayName = item.kor_name || item.stock_name;
              return (
                <button
                  key={item.stock_code}
                  type="button"
                  onClick={() => handleNavigate(item.stock_code)}
                  className="w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-left text-sm transition-colors hover:bg-white/10 cursor-pointer group/item"
                >
                  <div className="flex flex-col min-w-0 pr-2">
                    <span className="font-semibold text-white group-hover/item:text-accent transition-colors truncate">
                      {displayName}
                    </span>
                    {item.kor_name && item.stock_name !== item.kor_name && (
                      <span className="text-xs text-white/40 group-hover/item:text-accent transition-colors truncate">
                        {item.stock_name}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="rounded bg-accent/20 px-2 py-0.5 font-mono text-xs text-accent border border-accent/30 group-hover/item:bg-accent group-hover/item:text-white transition-colors">
                      {item.stock_code}
                    </span>
                    {item.market_type && (
                      <span className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-xs text-white/60 group-hover/item:text-accent transition-colors">
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
  );
}
