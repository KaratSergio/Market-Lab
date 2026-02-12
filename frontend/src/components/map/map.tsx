import { useTranslations } from 'next-intl';

export default function Map() {
  const t = useTranslations('Maps');

  return (
    <div className="min-h-screen bg-linear-to-br from-green-50 via-amber-50 to-white">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-xl border-b border-green-100 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-linear-to-r from-green-600 to-amber-500 rounded-xl flex items-center justify-center text-xl shadow-md">
                🗺️
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-linear-to-r from-green-700 to-amber-600 bg-clip-text text-transparent">
                  {t('title')}
                </h1>
                <p className="text-sm text-gray-600">
                  {t('subtitle')}
                </p>
              </div>
            </div>

            {/* Dev status */}
            <div className="px-4 py-2 bg-amber-100 rounded-full text-amber-800 text-sm font-medium border border-amber-200">
              🚧 {t('status')}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-12">
        {/* Map(fake)*/}
        <div className="relative bg-white rounded-3xl shadow-2xl overflow-hidden border border-green-100 mb-8">
          <div className="absolute top-0 right-0 w-64 h-64 bg-linear-to-bl from-green-200 to-amber-100 rounded-full -translate-y-32 translate-x-32 opacity-20"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-linear-to-tr from-amber-100 to-green-100 rounded-full translate-y-48 -translate-x-48 opacity-20"></div>

          <div className="relative z-10 p-8 md:p-12">
            {/* Icon and title */}
            <div className="flex flex-col items-center text-center mb-8">
              <div className="w-24 h-24 bg-linear-to-br from-green-100 to-amber-100 rounded-3xl flex items-center justify-center text-5xl mb-6 border-2 border-green-200 shadow-xl">
                🗺️
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
                {t('hero.title')}
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl">
                {t('hero.description')}
              </p>
            </div>

            <div className="relative bg-linear-to-br from-gray-50 to-white rounded-2xl border-2 border-dashed border-green-300 p-8 mb-8">
              <div className="aspect-video flex flex-col items-center justify-center">
                <div className="relative">
                  <div className="w-32 h-32 bg-green-50 rounded-full flex items-center justify-center text-6xl mb-6 animate-pulse">
                    🚜
                  </div>
                  <div className="absolute -top-2 -right-2 w-12 h-12 border-4 rounded-full bg-amber-100 flex items-center justify-center text-white text-xl animate-bounce">
                    🔧
                  </div>
                </div>

                <p className="text-2xl font-bold text-gray-700 mb-2">
                  {t('map.placeholder')}
                </p>
                <p className="text-gray-500">
                  {t('map.eta')}
                </p>

                <div className="absolute inset-0 opacity-5">
                  <div className="grid grid-cols-12 h-full">
                    {[...Array(12)].map((_, i) => (
                      <div key={i} className="border-r border-gray-400 h-full"></div>
                    ))}
                  </div>
                  <div className="grid grid-rows-8 absolute top-0 left-0 w-full h-full">
                    {[...Array(8)].map((_, i) => (
                      <div key={i} className="border-b border-gray-400 w-full"></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Future functionality */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-green-50 rounded-xl p-6 border border-green-200">
                <div className="text-3xl mb-3">📍</div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">
                  {t('features.0.title')}
                </h3>
                <p className="text-gray-600 text-sm">
                  {t('features.0.desc')}
                </p>
              </div>

              <div className="bg-amber-50 rounded-xl p-6 border border-amber-200">
                <div className="text-3xl mb-3">🌾</div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">
                  {t('features.1.title')}
                </h3>
                <p className="text-gray-600 text-sm">
                  {t('features.1.desc')}
                </p>
              </div>

              <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                <div className="text-3xl mb-3">🚚</div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">
                  {t('features.2.title')}
                </h3>
                <p className="text-gray-600 text-sm">
                  {t('features.2.desc')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="relative bg-linear-to-r from-green-600 to-amber-600 rounded-3xl p-8 md:p-12 shadow-2xl overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full translate-y-32 -translate-x-32"></div>

          <div className="relative z-10 text-center text-white">
            <h3 className="text-2xl md:text-3xl font-bold mb-4">
              {t('cta.title')}
            </h3>
            <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
              {t('cta.description')}
            </p>
            <button className="px-8 py-4 bg-white text-green-700 rounded-xl font-bold text-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95">
              {t('cta.button')} 🚀
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}