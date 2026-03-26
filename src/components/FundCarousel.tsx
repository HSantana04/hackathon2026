import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '../utils/formatCurrency';

interface Position {
  id: string;
  asset_name: string;
  institution: string;
  asset_type: string;
  amount: number;
  quantity: number;
  date: string;
}

interface FundCarouselProps {
  positions: Position[];
}

export const FundCarousel = ({ positions }: FundCarouselProps) => {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Top 3 positions by amount
  const topPositions = [...positions]
    .sort((a, b) => Number(b.amount) - Number(a.amount))
    .slice(0, 3);

  const count = topPositions.length;

  const resetTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (count > 1) {
      timerRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % count);
      }, 4000);
    }
  };

  useEffect(() => {
    resetTimer();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count]);

  if (count === 0) return null;

  const safeIndex = currentIndex % count;
  const item = topPositions[safeIndex];

  const goNext = () => {
    setCurrentIndex((prev) => (prev + 1) % count);
    resetTimer();
  };

  const goPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + count) % count);
    resetTimer();
  };

  const handleClick = () => {
    navigate('/b3-assets', {
      state: {
        fundDetail: {
          asset_name: item.asset_name,
          institution: item.institution,
          asset_type: item.asset_type,
          amount: item.amount,
          quantity: item.quantity,
          date: item.date,
        },
      },
    });
  };

  return (
    <div className="bg-slate-900 rounded-xl p-5 w-[280px] shrink-0 flex flex-col justify-between shadow-lg">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-xs font-semibold text-white/80 uppercase tracking-wide">
          Fique por dentro
        </h4>
        <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
      </div>

      <div
        onClick={handleClick}
        className="cursor-pointer hover:bg-white/5 rounded-lg p-2 -mx-2 transition-colors flex-1 flex flex-col justify-center"
      >
        <p className="text-white font-semibold text-sm truncate">{item.asset_name}</p>
        <p className="text-white/60 text-xs mt-0.5 truncate">{item.institution}</p>
        <div className="flex items-center justify-between mt-2">
          <span className="text-emerald-400 font-bold text-lg">
            {formatCurrency(Number(item.amount))}
          </span>
          <span className="text-white/50 text-xs">
            Qtd: {item.quantity}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between mt-3 pt-2 border-t border-white/10">
        <div className="flex gap-1">
          {topPositions.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full transition-all ${
                i === safeIndex ? 'w-4 bg-blue-400' : 'w-1.5 bg-white/30'
              }`}
            />
          ))}
        </div>
        {count > 1 && (
          <div className="flex gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                goPrev();
              }}
              className="p-1 rounded-md hover:bg-white/10 text-white/60 hover:text-white transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                goNext();
              }}
              className="p-1 rounded-md hover:bg-white/10 text-white/60 hover:text-white transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
