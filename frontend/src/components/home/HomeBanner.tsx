'use client'

import { useEffect, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';

export const HomeBanner = () => {
  const [typedText, setTypedText] = useState('');
  const [currentFeature, setCurrentFeature] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [stats, setStats] = useState({ farmers: 0, products: 0, orders: 0 });

  const t = useTranslations('Home');
  const locale = useLocale();

  const fullText = t('title');

  const features = [
    {
      icon: t('features.0.icon'),
      title: t('features.0.title'),
      desc: t('features.0.desc')
    },
    {
      icon: t('features.1.icon'),
      title: t('features.1.title'),
      desc: t('features.1.desc')
    },
    {
      icon: t('features.2.icon'),
      title: t('features.2.title'),
      desc: t('features.2.desc')
    },
    {
      icon: t('features.3.icon'),
      title: t('features.3.title'),
      desc: t('features.3.desc')
    },
    {
      icon: t('features.4.icon'),
      title: t('features.4.title'),
      desc: t('features.4.desc')
    },
    {
      icon: t('features.5.icon'),
      title: t('features.5.title'),
      desc: t('features.5.desc')
    },
  ];

  useEffect(() => {
    setIsVisible(true);

    // Animation of typing text
    let currentIndex = 0;
    const typingInterval = setInterval(() => {
      if (currentIndex <= fullText.length) {
        setTypedText(fullText.slice(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(typingInterval);
      }
    }, 50);

    // Statistics animation
    const statsTimer = setTimeout(() => {
      const animateStats = setInterval(() => {
        setStats(prev => ({
          farmers: prev.farmers < 150 ? prev.farmers + 5 : 150,
          products: prev.products < 500 ? prev.products + 10 : 500,
          orders: prev.orders < 1000 ? prev.orders + 20 : 1000
        }));
      }, 30);

      setTimeout(() => clearInterval(animateStats), 1500);
    }, 800);

    // Feature cycle
    const featureInterval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length);
    }, 3000);

    return () => {
      clearInterval(typingInterval);
      clearTimeout(statsTimer);
      clearInterval(featureInterval);
    };
  }, [fullText]);

  return (
    <div className="min-h-screen bg-linear-to-br from-green-50 via-amber-50 to-white flex items-center justify-center p-4 md:p-8">
      <div className={`max-w-6xl w-full transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>

        {/* Main content */}
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-green-100">
          <div className="p-8 md:p-12 lg:p-16 relative">

            {/* Background farm elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-linear-to-bl from-green-200 to-amber-100 rounded-full -translate-y-32 translate-x-32 opacity-20"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-linear-to-tr from-amber-100 to-green-100 rounded-full translate-y-48 -translate-x-48 opacity-20"></div>

            {/* Top with logo */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-12 relative z-10">
              <div className="flex items-center space-x-4 mb-6 md:mb-0">
                <div className="relative">
                  <div className="w-16 h-16 bg-linear-to-r from-green-600 to-amber-500 rounded-2xl flex items-center justify-center text-3xl shadow-lg">
                    🌽
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-md">
                    beta
                  </div>
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-linear-to-r from-green-700 to-amber-600 bg-clip-text text-transparent">
                    Greenly
                  </h1>
                  <p className="text-gray-600 font-medium">{t('tagline')}</p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="hidden md:flex items-center space-x-2 text-sm text-green-700 font-medium">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span>{t('delivery')}</span>
                </div>
                <div className="px-4 py-2 bg-linear-to-r from-green-100 to-amber-100 rounded-full text-green-800 font-medium border border-green-200">
                  {t('supportFarmers')}
                </div>
              </div>
            </div>

            {/* Printable text */}
            <div className="mb-12 relative z-10">
              <div className="text-3xl md:text-5xl lg:text-6xl font-bold text-gray-800 mb-4 min-h-16 md:min-h-20">
                {typedText}
                <span className="inline-block w-1 h-12 bg-white ml-1 animate-pulse"></span>
              </div>
              <p className="text-xl text-gray-600 max-w-3xl">
                {t('subtitle')}
              </p>
            </div>

            {/* Cyclic features (products) */}
            <div className="mb-12 relative z-10">
              <div className="relative h-48 md:h-40 bg-linear-to-r from-green-50 to-amber-50 rounded-2xl p-6 border border-green-200 overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-green-500 via-amber-500 to-green-500 animate-gradient-x"></div>

                <div key={currentFeature} className="animate-fadeIn">
                  <div className="flex items-start space-x-4">
                    <div className="text-4xl bg-white p-3 rounded-xl shadow-sm">{features[currentFeature].icon}</div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-800 mb-2">
                        {features[currentFeature].title}
                      </h3>
                      <p className="text-gray-600 text-lg">
                        {features[currentFeature].desc}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Indicators */}
                <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2">
                  {features.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentFeature(index)}
                      className={`w-3 h-3 rounded-full transition-all duration-300 ${index === currentFeature
                        ? 'bg-green-500 scale-125'
                        : 'bg-amber-300 hover:bg-amber-400'
                        }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-12 relative z-10">
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-green-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="text-3xl font-bold text-green-600 mb-2">{stats.farmers}+</div>
                <div className="text-gray-600">{t('stats.farmers')}</div>
                <div className="text-sm text-green-500 mt-2">{t('stats.fromRegions')}</div>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-amber-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="text-3xl font-bold text-amber-600 mb-2">{stats.products}+</div>
                <div className="text-gray-600">{t('stats.products')}</div>
                <div className="text-sm text-amber-500 mt-2">{t('stats.allCategories')}</div>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-green-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 col-span-2 md:col-span-1">
                <div className="text-3xl font-bold text-green-600 mb-2">{stats.orders}+</div>
                <div className="text-gray-600">{t('stats.orders')}</div>
                <div className="text-sm text-green-500 mt-2">{t('stats.growing')}</div>
              </div>
            </div>

            {/* Three roles */}
            <div className="mb-12 relative z-10">
              <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">{t('roles.title')}</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-linear-to-b from-green-50 to-white rounded-2xl p-6 border border-green-200 hover:shadow-xl transition-all duration-300">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-2xl mb-4">
                    👨‍🌾
                  </div>
                  <h4 className="text-xl font-bold text-gray-800 mb-2">{t('roles.farmer.title')}</h4>
                  <ul className="text-gray-600 space-y-2">
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                      {t('roles.farmer.features.0')}
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                      {t('roles.farmer.features.1')}
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                      {t('roles.farmer.features.2')}
                    </li>
                  </ul>
                </div>

                <div className="bg-linear-to-b from-amber-50 to-white rounded-2xl p-6 border border-amber-200 hover:shadow-xl transition-all duration-300">
                  <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center text-2xl mb-4">
                    🛒
                  </div>
                  <h4 className="text-xl font-bold text-gray-800 mb-2">{t('roles.buyer.title')}</h4>
                  <ul className="text-gray-600 space-y-2">
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-amber-500 rounded-full mr-2"></span>
                      {t('roles.buyer.features.0')}
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-amber-500 rounded-full mr-2"></span>
                      {t('roles.buyer.features.1')}
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-amber-500 rounded-full mr-2"></span>
                      {t('roles.buyer.features.2')}
                    </li>
                  </ul>
                </div>

                <div className="bg-linear-to-b from-blue-50 to-white rounded-2xl p-6 border border-blue-200 hover:shadow-xl transition-all duration-300">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-2xl mb-4">
                    ⚙️
                  </div>
                  <h4 className="text-xl font-bold text-gray-800 mb-2">{t('roles.admin.title')}</h4>
                  <ul className="text-gray-600 space-y-2">
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                      {t('roles.admin.features.0')}
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                      {t('roles.admin.features.1')}
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                      {t('roles.admin.features.2')}
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Development Notice */}
            <div className="relative bg-linear-to-r from-green-50 to-amber-50 rounded-2xl p-8 border border-green-200 overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-green-200 rounded-full -translate-y-16 translate-x-16 opacity-20"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-amber-200 rounded-full translate-y-16 -translate-x-16 opacity-20"></div>

              <div className="relative z-10">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-12 h-12 bg-linear-to-r from-green-500 to-amber-500 rounded-xl flex items-center justify-center text-2xl text-white shadow-lg">
                    🚀
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800">{t('development.title')}</h3>
                    <p className="text-gray-600">{t('development.description')}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>{t('development.progress')}</span>
                      <span className="font-bold text-green-600">28%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-linear-to-r from-green-500 to-amber-500 h-3 rounded-full transition-all duration-1000 ease-out"
                        style={{ width: '28%' }}
                      ></div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center space-x-2 p-3 bg-white rounded-lg">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span>{t('development.features.0')}</span>
                    </div>
                    <div className="flex items-center space-x-2 p-3 bg-white rounded-lg">
                      <div className="w-3 h-3 bg-amber-400 rounded-full animate-pulse"></div>
                      <span>{t('development.features.1')}</span>
                    </div>
                    <div className="flex items-center space-x-2 p-3 bg-white rounded-lg">
                      <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                      <span>{t('development.features.2')}</span>
                    </div>
                    <div className="flex items-center space-x-2 p-3 bg-white rounded-lg">
                      <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                      <span>{t('development.features.3')}</span>
                    </div>
                    <div className="flex items-center space-x-2 p-3 bg-white rounded-lg">
                      <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                      <span>{t('development.features.4')}</span>
                    </div>
                    <div className="flex items-center space-x-2 p-3 bg-white rounded-lg">
                      <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                      <span>{t('development.features.5')}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Floating elements */}
        <div className="hidden lg:block">
          <div className="absolute top-1/4 left-8 animate-float">
            <div className="w-8 h-8 bg-green-300 rounded-full opacity-40"></div>
          </div>
          <div className="absolute top-1/3 right-12 animate-float-delayed">
            <div className="w-12 h-12 bg-amber-200 rounded-full opacity-30"></div>
          </div>
          <div className="absolute bottom-1/4 left-20 animate-float-slow">
            <div className="w-6 h-6 bg-green-400 rounded-full opacity-50"></div>
          </div>
        </div>
      </div>

      {/* Global styles for animations */}
      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          50% { transform: translateY(-15px) translateX(10px); }
        }
        
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        @keyframes gradient-x {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        
        .animate-float-delayed {
          animation: float-delayed 4s ease-in-out infinite;
          animation-delay: 1s;
        }
        
        .animate-float-slow {
          animation: float-slow 5s ease-in-out infinite;
        }
        
        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 3s ease infinite;
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
      `}</style>
    </div>
  );
};