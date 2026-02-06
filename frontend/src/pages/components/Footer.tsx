const Footer = () => {
  return (
    <footer className="w-screen relative left-[50%] right-[50%] -ml-[50vw] -mr-[50vw] mt-16 bg-black/20 backdrop-blur-xl border-t border-white/10">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">

          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-xl font-bold">♻️</span>
              </div>
              <h3 className="text-xl font-bold text-white">
                Smart E-Waste Bin
              </h3>
            </div>

            <p className="text-white/60 text-sm leading-relaxed mb-4">
              An AI-powered recycling platform that helps you find nearby
              e-waste bins, identify items instantly, and earn rewards while
              making a real environmental impact.
            </p>

            <p className="text-white/40 text-xs">
              Built for smarter cities. Designed for everyday people.
            </p>
          </div>

          {/* User Actions */}
          <div>
            <h4 className="text-white font-semibold mb-4">
              Get Started
            </h4>
            <ul className="space-y-3">
              <li>
                <a href="/user/dashboard" className="text-white/60 hover:text-white text-sm transition-colors">
                  User Dashboard
                </a>
              </li>
              <li>
                <a href="/user/recycle" className="text-white/60 hover:text-white text-sm transition-colors">
                  Recycle an Item
                </a>
              </li>
              <li>
                <a href="/user/find-bin" className="text-white/60 hover:text-white text-sm transition-colors">
                  Find Nearby Bins
                </a>
              </li>
              <li>
                <a href="/user/rewards" className="text-white/60 hover:text-white text-sm transition-colors">
                  Rewards & Points
                </a>
              </li>
            </ul>
          </div>

          {/* Learn & Trust */}
          <div>
            <h4 className="text-white font-semibold mb-4">
              Learn More
            </h4>
            <ul className="space-y-3">
              <li>
                <a href="/learn/e-waste" className="text-white/60 hover:text-white text-sm transition-colors">
                  What Is E-Waste?
                </a>
              </li>
              <li>
                <a href="/learn/how-it-works" className="text-white/60 hover:text-white text-sm transition-colors">
                  How the Smart Bin Works
                </a>
              </li>
              <li>
                <a href="/learn/ai-detection" className="text-white/60 hover:text-white text-sm transition-colors">
                  AI Detection & Accuracy
                </a>
              </li>
              <li>
                <a href="/learn/impact" className="text-white/60 hover:text-white text-sm transition-colors">
                  Environmental Impact
                </a>
              </li>
            </ul>
          </div>

          {/* Legal & Transparency */}
          <div>
            <h4 className="text-white font-semibold mb-4">
              Transparency
            </h4>
            <ul className="space-y-3">
              <li>
                <a href="/legal/privacy" className="text-white/60 hover:text-white text-sm transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="/legal/terms" className="text-white/60 hover:text-white text-sm transition-colors">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="/legal/ai-policy" className="text-white/60 hover:text-white text-sm transition-colors">
                  AI Transparency Policy
                </a>
              </li>
              <li>
                <a href="/legal/data-usage" className="text-white/60 hover:text-white text-sm transition-colors">
                  Data Usage & Security
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-white/40 text-sm">
              © 2024 Smart E-Waste Bin System · Built for Haxplore
            </p>

            <div className="flex items-center gap-6">
              <span className="text-white/40 text-sm">
                CO₂ Saved · Resources Recovered · Waste Reduced
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
