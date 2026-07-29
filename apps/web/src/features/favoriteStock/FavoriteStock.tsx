import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toggleLike, toggleScrap } from "../dashboard/api/news";

import useGetStockInfo from "../news/hooks/GetStockInfo";
import NewsItem from "../news/ui/stockInfo/components/NewsItem";
import FavoriteStockBox from "./ui/FavoriteStockBox";
import SearchBar, { type SupabaseStockItem } from "./ui/SearchBar";

import { useFavoriteStocksNews } from "./hooks/useFavoriteStocksNews";

import {
  fetchFavoriteStocks,
  addFavoriteStock,
  removeFavoriteStock,
  type FavoriteStock as FavoriteStockResponse,
} from "./api/FavoriteStock";


interface FavoriteStockItemProps {
  symbol: string;
  korName?: string;
  onRemove: (symbol: string) => void;
}


function FavoriteStockItem({
  symbol,
  korName: initialKorName,
  onRemove,
}: FavoriteStockItemProps) {

  const navigate = useNavigate();

  const { data, loading } = useGetStockInfo(symbol);

  const [fetchedKorName, setFetchedKorName] =
    useState<string | undefined>();


  useEffect(() => {

    if (initialKorName) return;

    let isMounted = true;


    const fetchKorName = async () => {

      try {

        const supabaseUrl =
          import.meta.env.VITE_SUPABASE_URL ||
          "https://rjtoalnqvrgsqmqcgrde.supabase.co";


        const anonKey =
          import.meta.env.VITE_SUPABASE_ANON_KEY || "";


        const response = await axios.get<SupabaseStockItem[]>(
          `${supabaseUrl}/rest/v1/stock?select=kor_name,stock_name&stock_code=eq.${encodeURIComponent(
            symbol
          )}&limit=1`,
          {
            headers:{
              apikey: anonKey,
              Authorization:`Bearer ${anonKey}`,
            },
          }
        );


        if(
          isMounted &&
          response.data.length > 0
        ){

          const stock = response.data[0];

          setFetchedKorName(
            stock.kor_name || stock.stock_name
          );

        }


      } catch(err){

        console.error(
          "종목명 조회 실패:",
          err
        );

      }

    };


    fetchKorName();


    return()=>{
      isMounted=false;
    };


  },[
    symbol,
    initialKorName
  ]);



  const displayName =
    initialKorName ||
    fetchedKorName ||
    data?.shortName ||
    data?.companyName ||
    symbol;



  return (

    <FavoriteStockBox

      ticker={symbol}

      companyName={displayName}

      stockPrice={
        data?.regularMarketPrice || 0
      }

      changePercent={
        data?.regularMarketChangePercent || 0
      }

      currency={data?.currency}

      loading={loading}

      onRemove={() =>
        onRemove(symbol)
      }

      onClick={() =>
        navigate(`/news/${symbol}`)
      }

    />

  );

}





export default function FavoriteStock(){


  const [stocks,setStocks] =
    useState<
      {
        symbol:string;
        korName?:string;
      }[]
    >([]);



  useEffect(()=>{


    const loadStocks = async()=>{

      try{

        const data =
          await fetchFavoriteStocks();


        setStocks(data.map((item: FavoriteStockResponse) => ({
          symbol: item.stockCode,
          korName: item.korName || item.companyName,
        })));


      }catch(err){

        console.error(
          "관심종목 조회 실패:",
          err
        );

      }

    };


    loadStocks();


  },[]);





  const handleAddStock = async(
    symbol:string,
    korName?:string
  )=>{


    const targetSymbol =
      symbol.toUpperCase();



    if(
      stocks.some(
        stock =>
          stock.symbol === targetSymbol
      )
    ){

      alert(
        "이미 등록된 관심 종목입니다."
      );

      return;

    }



    try{


      await addFavoriteStock(
        targetSymbol
      );


      setStocks(prev=>[
        ...prev,
        {
          symbol:targetSymbol,
          korName,
        }
      ]);



    }catch(err){

      console.error(err);

    }


  };






  const handleRemoveStock =
    async(symbol:string)=>{


    try{


      await removeFavoriteStock(
        symbol
      );


      setStocks(prev =>
        prev.filter(
          stock =>
            stock.symbol !== symbol
        )
      );


    }catch(err){

      console.error(err);

    }


  };






  const {
    newsList,
    loading:newsLoading,
    error:newsError,
    applyLikeResult,
    applyScrapResult,
    adjustCommentCount,

  } = useFavoriteStocksNews(stocks);

  const handleLikeClick = async (newsId: string) => {
    try {
      const result = await toggleLike(newsId);
      applyLikeResult(newsId, result.liked);
    } catch (error) {
      alert(error instanceof Error ? error.message : "좋아요 처리에 실패했습니다.");
    }
  };

  const handleScrapClick = async (newsId: string) => {
    try {
      const result = await toggleScrap(newsId);
      applyScrapResult(newsId, result.scrapped);
    } catch (error) {
      alert(error instanceof Error ? error.message : "스크랩 처리에 실패했습니다.");
    }
  };





  return (

    <div className="space-y-4 sm:-mt-4 -mx-4 lg:-mx-14">


      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">


        <div>

          <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">

            <span className="material-symbols-outlined text-emerald-400">
              show_chart
            </span>

            관심 종목

          </h1>


          <p className="text-sm text-text-muted mt-1">

            관심 등록한 주식 종목의 실시간 시세 및 관련 뉴스를 한눈에 확인하세요.

          </p>

        </div>


        <SearchBar
          onAddStock={handleAddStock}
        />


      </div>





      {
        stocks.length===0 ? (

          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 p-16 text-center">

            <p className="text-base font-semibold text-white/60">
              등록된 관심 종목이 없습니다.
            </p>

          </div>


        ):(


          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">


            {
              stocks.map(stock=>(

                <FavoriteStockItem

                  key={stock.symbol}

                  symbol={stock.symbol}

                  korName={stock.korName}

                  onRemove={handleRemoveStock}

                />

              ))
            }


          </div>


        )
      }







      {
        stocks.length>0 && (

          <div className="space-y-4 mt-8">


            <h2 className="text-lg font-bold text-white flex items-center gap-2">

              관심 종목 뉴스 모아보기

            </h2>





            {
              newsLoading ? (

                <div>
                  로딩중...
                </div>


              ) : newsError ? (

                <div className="text-red-400">
                  {newsError}
                </div>


              ) : newsList.length===0 ? (

                <div>
                  관심 종목 관련 뉴스가 없습니다.
                </div>


              ):(


                <div className="flex flex-col gap-4">


                  {
                    newsList.map(news=>(

                        <NewsItem

                          key={news.id}

                          news={news}


                          onLikeClick={handleLikeClick}
                          onScrapClick={handleScrapClick}
                          onCommentCountChange={adjustCommentCount}


                        />

                      ))
                  }


                </div>


              )

            }


          </div>

        )

      }


    </div>

  );

}
