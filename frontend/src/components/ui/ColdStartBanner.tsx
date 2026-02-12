'use client';

import { useState, useEffect } from 'react';

export function ColdStartBanner({ isVisible, countdown }: { isVisible: boolean, countdown: number }) {
  const [language, setLanguage] = useState<'uk' | 'en'>('uk');
  const [sloganIndex, setSloganIndex] = useState(0);

  const translations = {
    uk: {
      title: 'Сервер прокидається',
      description: 'На безкоштовному Render.com хостингу серверу потрібно ~60-120 секунд для запуску після періоду бездіяльності.',
      waitingTime: 'Приблизний час:',
      tip: '⚡ Миттєва робота після запуску',
      seconds: 'сек',
      slogans: [
        '🥬 Свіжа зелень прямо з грядки',
        '🐔 Вільні кури несуть щасливі яйця',
        '🍅 Смакує літом цілий рік',
        '🧀 Сир від щасливих корів',
        '🍯 Натуральний мед з власної пасіки',
        '🌽 Без ГМО — з душею',
        '🥕 Вирощено з любовʼю',
        '🍎 Сезонне — значить смачне',
        '🌿 Органіка без маркетингу',
        '🥛 Свіжість в кожній краплі'
      ]
    },
    en: {
      title: 'Server is waking up',
      description: 'On free Render.com hosting, the server needs ~60-120 seconds to start after a period of inactivity.',
      waitingTime: 'Estimated time:',
      tip: '⚡ Instant operation after startup',
      seconds: 'sec',
      slogans: [
        '🥬 Fresh greens straight from the garden',
        '🐔 Free-range happy eggs',
        '🍅 Tastes like summer all year round',
        '🧀 Cheese from happy cows',
        '🍯 Natural honey from our apiary',
        '🌽 GMO-free — made with soul',
        '🥕 Grown with love',
        '🍎 Seasonal means delicious',
        '🌿 Organic without the marketing',
        '🥛 Freshness in every drop'
      ]
    }
  };

  useEffect(() => {
    const ukSlogansLength = translations.uk.slogans.length;
    setSloganIndex(Math.floor(Math.random() * ukSlogansLength));

    const interval = setInterval(() => {
      setSloganIndex((prev) => (prev + 1) % translations.uk.slogans.length);
    }, 6600);

    return () => clearInterval(interval);
  }, []);

  if (!isVisible) return null;

  const t = translations[language];
  const switchLabel = language === 'uk' ? 'EN' : 'UA';
  const currentSlogan = t.slogans[sloganIndex];

  return (
    <div className="mb-6 p-5 bg-linear-to-br from-emerald-50 to-green-50 border-2 border-emerald-200 rounded-xl animate-in slide-in-from-top duration-300 shadow-lg">
      <div className="flex items-start gap-4">
        <div className="relative shrink-0">
          <div className="w-12 h-12 rounded-full bg-linear-to-br from-emerald-400 to-green-500 flex items-center justify-center shadow-md relative overflow-hidden">
            <div className="absolute inset-0 bg-white/20 animate-shimmer"></div>
            <div className="text-xl relative z-10 animate-pulse">
              🚜
            </div>
          </div>
          <div className="absolute -inset-2 rounded-full border-2 border-emerald-300/30 animate-ping"></div>
        </div>

        <div className="flex-1">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-bold text-emerald-800 text-lg">
              {t.title}
            </h3>
            <button
              onClick={() => setLanguage(language === 'uk' ? 'en' : 'uk')}
              className="text-xs px-3 py-1.5 bg-white/80 backdrop-blur-sm border border-emerald-300 rounded-lg text-emerald-600 hover:bg-white transition-all hover:shadow-md active:scale-95"
            >
              {switchLabel}
            </button>
          </div>

          <p className="text-emerald-700 text-sm mb-4">
            {t.description}
          </p>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm text-emerald-600 font-medium">
                  {t.waitingTime}
                </span>
              </div>
              <div className="font-mono font-bold text-emerald-700 bg-white px-3 py-1.5 rounded-lg border border-emerald-300 min-w-[70px] text-center shadow-sm">
                {countdown} {t.seconds}
              </div>
            </div>

            {/* Messages */}
            <div className="bg-white/80 backdrop-blur-sm p-4 rounded-lg border border-emerald-200 shadow-inner min-h-20 flex items-center justify-center">
              <div className="text-center animate-fade-in">
                <p className="text-emerald-800 text-4xl font-medium">
                  {currentSlogan}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-emerald-200">
            <p className="text-xs text-emerald-600 flex items-center gap-2">
              <span className="text-emerald-500 animate-pulse">●</span>
              {t.tip}
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(400%); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
        @keyframes fadeIn {
          0% { opacity: 0; transform: translateY(5px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}