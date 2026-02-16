'use client'

import { useEffect, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import { useActiveSuppliers } from '@/core/hooks';

export function Sellers() {
  const [isVisible, setIsVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState('all');

  const t = useTranslations('Sellers');
  const locale = useLocale();

  const { data: suppliers, isLoading, error } = useActiveSuppliers();

  console.log('====================================');
  console.log('sellers list', suppliers);
  console.log('====================================');

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const cities = suppliers
    ? ['all', ...new Set(suppliers.map(s => s.primaryAddress?.city).filter(Boolean))]
    : ['all'];

  const filteredSuppliers = suppliers?.filter(supplier => {
    const matchesSearch = supplier.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.primaryAddress?.city?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCity = selectedCity === 'all' || supplier.primaryAddress?.city === selectedCity;
    return matchesSearch && matchesCity;
  });

  if (error) {
    return (
      <div className="min-h-screen bg-linear-to-br from-green-50 via-amber-50 to-white flex items-center justify-center p-4">
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-12 text-center border border-red-100">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">{t('error.title')}</h2>
          <p className="text-gray-600">{t('error.description')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-green-50 via-amber-50 to-white">
      {/* Hero */}
      <div className="relative overflow-hidden bg-linear-to-br from-green-600 to-amber-500 text-white">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-black/5 rounded-full translate-y-48 -translate-x-48"></div>

        <div className="max-w-7xl mx-auto px-4 py-16 md:py-24 relative z-10">
          <div className={`${isVisible ? 'animate-float' : 'opacity-0'}`}>
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center text-3xl">
                🧑‍🌾
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold mb-2">{t('title')}</h1>
                <p className="text-xl text-white/90">{t('subtitle')}</p>
              </div>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
              <div className="bg-white/10 backdrop-blur rounded-xl p-4">
                <div className="text-2xl font-bold">{suppliers?.length || 0}+</div>
                <div className="text-sm text-white/80">{t('stats.active')}</div>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-xl p-4">
                <div className="text-2xl font-bold">{cities.length - 1}+</div>
                <div className="text-sm text-white/80">{t('stats.cities')}</div>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-xl p-4">
                <div className="text-2xl font-bold">100%</div>
                <div className="text-sm text-white/80">{t('stats.organic')}</div>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-xl p-4">
                <div className="text-2xl font-bold">24/7</div>
                <div className="text-sm text-white/80">{t('stats.support')}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-lg p-6 border border-green-100 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder={t('search.placeholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 pl-12 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all outline-none"
              />
              <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                🔍
              </span>
            </div>

            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all outline-none appearance-none bg-white"
            >
              <option value="all">{t('filters.allCities')}</option>
              {cities.filter(c => c !== 'all').map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>

            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>{t('filters.live')}</span>
            </div>
          </div>
        </div>

        {/* Sellers list */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-lg p-6 animate-pulse">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-16 h-16 bg-gray-200 rounded-xl"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSuppliers?.map((supplier, index) => (
              <Link
                key={supplier.id}
                href={`/${locale}/sellers/${supplier.id}`}
                className="group"
              >
                <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-lg border border-green-100 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <div className="h-2 bg-linear-to-r from-green-500 via-amber-500 to-green-500"></div>

                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-linear-to-br from-green-100 to-amber-100 rounded-xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                          {supplier.companyName.charAt(0)}
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-800 group-hover:text-green-600 transition-colors">
                            {supplier.companyName}
                          </h3>
                          <div className="flex items-center space-x-2 text-sm text-gray-500">
                            <span>⭐</span>
                            <span>4.8</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* contact info */}
                    <div className="space-y-2 mb-4 text-sm">
                      <div className="flex items-center space-x-2 text-gray-600">
                        <span>📞</span>
                        <span>{supplier.phone}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* no search result fallback */}
        {filteredSuppliers?.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">{t('noResults.title')}</h3>
            <p className="text-gray-600">{t('noResults.description')}</p>
          </div>
        )}
      </div>
    </div>
  );
}