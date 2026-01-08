

export function BannerLogo() {
  return (
    <div className="inline-flex items-center space-x-4 group cursor-pointer">
      <div className="relative">
        <div className="w-20 h-20 bg-linear-to-br from-emerald-500 to-lime-400 rounded-3xl flex items-center justify-center shadow-2xl group-hover:shadow-3xl group-hover:scale-110 transition-all duration-500">
          <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/30">
            <span className="text-3xl">🌿</span>
          </div>
        </div>

        <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <div className="absolute inset-0 bg-linear-to-br from-emerald-400/40 to-lime-300/40 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 -z-10"></div>
      </div>

      <div>
        <h1 className="text-4xl md:text-5xl font-bold">
          <span className="bg-linear-to-r from-emerald-800 via-emerald-600 to-green-500 bg-clip-text text-transparent">
            Green
          </span>
          <span className="bg-linear-to-r from-lime-600 via-lime-500 to-yellow-400 bg-clip-text text-transparent">
            ly
          </span>
        </h1>

        <div className="flex flex-wrap items-center gap-2 mt-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <p className="text-lg text-gray-700 font-medium">
            Свіжі продукти прямо з ферми
          </p>
          <div className="px-3 py-1 bg-linear-to-r from-emerald-100 to-lime-100 text-emerald-800 rounded-full font-bold text-sm border border-emerald-200">
            🥇 ЯКІСТЬ
          </div>
          <div className="px-3 py-1 bg-linear-to-r from-lime-100 to-yellow-100 text-lime-800 rounded-full font-bold text-sm border border-lime-200">
            🌱 ЕКО
          </div>
        </div>
      </div>
    </div>
  )
}