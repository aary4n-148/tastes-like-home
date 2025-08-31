'use client'

interface ScrollToChefsProps {
  targetId: string
}

export default function ScrollToChefs({ targetId }: ScrollToChefsProps) {
  const handleScroll = () => {
    const element = document.getElementById(targetId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <button 
      onClick={handleScroll}
      className="group cursor-pointer"
    >
      <p className="text-gray-500 mb-3 font-medium group-hover:text-gray-700 transition-colors text-sm sm:text-base">
        Browse our amazing chefs
      </p>
      <div className="w-10 h-10 mx-auto bg-primary/15 rounded-full flex items-center justify-center group-hover:bg-primary/25 transition-all duration-300">
        <svg className="w-5 h-5 text-primary animate-bounce group-hover:animate-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
        </svg>
      </div>
    </button>
  )
}
