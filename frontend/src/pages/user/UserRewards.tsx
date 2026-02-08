import { useState } from "react";
import { useAuth } from "../../auth/useAuth";
import SpotlightCard from "../components/UIComponents/SpotlightCard";
import toast from "react-hot-toast";

type Prize = {
  id: string;
  name: string;
  description: string;
  points: number;
  category: "accessories" | "lifestyle" | "tech" | "eco";
  stock: number;
  featured?: boolean;
  imageUrl: string;
};

const PRIZES: Prize[] = [
  {
    id: "1",
    name: "Eco-Friendly T-Shirt",
    description: "Premium 100% organic cotton tee with sustainability awareness design",
    points: 500,
    category: "lifestyle",
    stock: 25,
    featured: true,
    imageUrl: "https://imgs.search.brave.com/FKZVAOYzYs7UVj9i-P2BdAECsThKsYPoGII9vyEu55M/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9pbWFn/ZXMudGVlcHVibGlj/LmNvbS9kZXJpdmVk/L3Byb2R1Y3Rpb24v/ZGVzaWducy84Mjkx/MTAxNF8wLzE3NjIz/NTEzMDIvaV9tOmJp/X3Byb2R1Y3Rpb25f/YmxhbmtzX210bDUz/b2ZvaHdxNWdvcWpv/OWtlXzE0NjI4Mjkw/MTUsY18wXzBfNDcw/eCxzXzMxMyxxXzkw/LmpwZw"
  },
  {
    id: "2",
    name: "Personal Diary",
    description: "Handcrafted recycled paper journal with leather-bound cover",
    points: 300,
    category: "lifestyle",
    stock: 40,
    imageUrl: "https://imgs.search.brave.com/2b4UfN4G3ff2PTiWUTRW3Wg-klgWWmekuqPGGnda-js/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly93d3cu/dGhld2FsbGV0c3Rv/cmUuaW4vY2RuL3No/b3AvcHJvZHVjdHMv/NjJhZGNiYjNjZTIx/Ny5qcGc_dj0xNjU3/Nzg0ODYzJndpZHRo/PTEyODA"
  },
  {
    id: "3",
    name: "Custom Phone Cover",
    description: "Biodegradable phone case with personalized e-waste artwork",
    points: 400,
    category: "tech",
    stock: 30,
    imageUrl: "https://imgs.search.brave.com/pBCYe7Sf6-R_YJThohuPOKOGaOgnFjsco4SDYzB6yPo/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9hZ3Jl/ZW5jby5pbi9jZG4v/c2hvcC9maWxlcy9O/b21hZF8xNl9CbGFj/ay5qcGc_dj0xNzQ5/MzY1MTczJndpZHRo/PTUzMw"
  },
  {
    id: "4",
    name: "Stanley Cup Tumbler",
    description: "40oz insulated stainless steel tumbler with lifetime warranty",
    points: 1200,
    category: "lifestyle",
    stock: 15,
    featured: true,
    imageUrl: "https://imgs.search.brave.com/Y_D0_Eh1pgE1cDuxJzPZFaxA2LuN529LiZ0QAyZP6g0/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9raWRz/cGFyay5jby5pbi9j/ZG4vc2hvcC9maWxl/cy8zQTRDNkEyOC1F/QzRELTQyMTctQjgw/Ny0wRDBDMEE3RDRF/OTAud2VicD92PTE3/MzE0OTQyMDMmd2lk/dGg9MTQ0NQ"
  },
  {
    id: "5",
    name: "Eco Sipper Bottle",
    description: "Double-wall insulated water bottle with sustainability messaging",
    points: 600,
    category: "eco",
    stock: 35,
    imageUrl: "https://imgs.search.brave.com/-gdEeSG8tIEtNutwcNYGWRtCqp9DP6bW5fqaS4xaR5Q/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly93d3cu/eW91cnByaW50Lmlu/L25ldy1hZG1pbi1h/amF4LnBocD9hY3Rp/b249cmVzaXplX291/dGVyX2ltYWdlJmNm/Y2FjaGU9YWxsJnVy/bD1odHRwczovL3lw/LW1lZGlhLnMzLmFt/YXpvbmF3cy5jb20v/RGVzaWduc19Jbm5l/cnNfYW5kX091dGVy/cy9Db3Jwb3JhdGVf/SXRlbXMvY29ycF9w/b3dlcl9wbHVzX2gy/NDdfby5qcGcmcmVz/aXplVG89NDUwJmZv/cm1hdD13ZWJw"
  },
  {
    id: "6",
    name: "Wireless Earbuds",
    description: "Certified refurbished premium wireless earbuds with ANC",
    points: 1500,
    category: "tech",
    stock: 10,
    featured: true,
    imageUrl: "https://imgs.search.brave.com/vMxJKGAcA92vWTwM0PFmQ2xEc1MB9G-eGrxXhoDPfbo/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9jZG4u/dGhld2lyZWN1dHRl/ci5jb20vd3AtY29u/dGVudC9tZWRpYS8y/MDIyLzExL3dpcmVs/ZXNzZWFyYnVkcy0y/MDQ4cHgtODgzMS5q/cGc"
  },
  {
    id: "7",
    name: "Bamboo Cutlery Set",
    description: "Premium portable eco-friendly cutlery with canvas carrying case",
    points: 350,
    category: "eco",
    stock: 50,
    imageUrl: "https://imgs.search.brave.com/nZCr6BlSOvWfH_Ed99wWqhqlTfyNO1-BYuMWGdlaxNA/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9pLmV0/c3lzdGF0aWMuY29t/LzIwMjQwMTQ3L3Iv/aWwvMGY1ZTBiLzU4/NjE4MDUyNTUvaWxf/MzAweDMwMC41ODYx/ODA1MjU1XzN0cmou/anBn"
  },
  {
    id: "8",
    name: "Canvas Tote Bag",
    description: "Heavy-duty reusable shopping bag with artistic earth print",
    points: 250,
    category: "accessories",
    stock: 60,
    imageUrl: "https://imgs.search.brave.com/kMGXwiiqLDEDolTPWBDCowLW69CWcqyAtXM6jDFdF6Q/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly93d3cu/bm9wbGFzdGljc2hv/cC5pbi93cC1jb250/ZW50L3VwbG9hZHMv/MjAyMC8xMS9DYW52/YXMtVG90ZS1CYWct/MTAyNHgxMDI0Lmpw/Zw"
  },
  {
    id: "9",
    name: "Smart Watch Band",
    description: "Recycled ocean plastic watch strap - universal compatibility",
    points: 450,
    category: "accessories",
    stock: 20,
    imageUrl: "https://imgs.search.brave.com/lNYsvSiM9d03bec8xLrxH6GQoRKHGTiKtWKTiqX5Yv0/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9oeWVy/Z29vZHMuY29tL2Nk/bi9zaG9wL2ZpbGVz/L0FwcGxlV2F0Y2hC/YW5kX2JsYWNrbGl6/YXJkX3NpbHZlcl8x/ZWM2ZmVjYi1jNjg5/LTQ2OWYtYjllZi0z/MTZmNDk0OTYyMjAu/anBnP3Y9MTc1NjIw/OTkzMiZ3aWR0aD03/MjA"
  },
  {
    id: "10",
    name: "Laptop Sleeve",
    description: "Eco-leather laptop case with recycled materials - fits 13-15 inch",
    points: 700,
    category: "tech",
    stock: 18,
    imageUrl: "https://imgs.search.brave.com/Wrcrh_aa170XhxHxhveNBIfDI6a-PRP5QzsjKLRXt38/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9ydWtt/aW5pbTIuZmxpeGNh/cnQuY29tL2ltYWdl/LzYxMi82MTIveGlm/MHEvYmFnL3QvbS9k/LzI1LTQtcHJlbWl1/bS1sYXB0b3Atc2xl/ZXZlLWNhc2UtcHJv/dGVjdGl2ZS1sYXB0/b3AtY292ZXItd2l0/aC1vcmlnaW5hbC1p/bWFoamsyNXB4dnFw/NzdxLmpwZWc_cT03/MA"
  },
  {
    id: "11",
    name: "Plant Starter Kit",
    description: "Indoor gardening kit with biodegradable pots and organic seeds",
    points: 400,
    category: "eco",
    stock: 45,
    imageUrl: "https://imgs.search.brave.com/4x-g9Lj2ttX8lGkUDSROUwugiIpjcq2liGNnOgb9H7U/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9tLm1l/ZGlhLWFtYXpvbi5j/b20vaW1hZ2VzL0kv/ODEwVTdSbjMtckwu/anBn"
  },
  {
    id: "12",
    name: "Recycled Notebook Set",
    description: "Pack of 3 premium notebooks made from 100% recycled paper",
    points: 280,
    category: "lifestyle",
    stock: 55,
    imageUrl: "https://imgs.search.brave.com/TTAPC_7t6egv-uOEX4JrORYMz2QKSFBuOIcrquUQt2M/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9tLm1l/ZGlhLWFtYXpvbi5j/b20vaW1hZ2VzL0kv/NDFhaCt1NnBvMkwu/anBn"
  },
];

const UserRewards = () => {
  const { profile } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedPrize, setSelectedPrize] = useState<Prize | null>(null);
  const [showRedeemModal, setShowRedeemModal] = useState(false);

  const userPoints = profile?.points ?? 0;

  const categories = [
    { id: "all", name: "All Prizes", icon: "🎁" },
    { id: "lifestyle", name: "Lifestyle", icon: "🎽" },
    { id: "tech", name: "Tech", icon: "📱" },
    { id: "eco", name: "Eco-Friendly", icon: "🌱" },
    { id: "accessories", name: "Accessories", icon: "👜" },
  ];

  const filteredPrizes = selectedCategory === "all" 
    ? PRIZES 
    : PRIZES.filter(p => p.category === selectedCategory);

  const featuredPrizes = PRIZES.filter(p => p.featured);
  const affordablePrizes = PRIZES.filter(p => p.points <= userPoints).length;

  const handleRedeem = (prize: Prize) => {
    if (userPoints < prize.points) {
      toast.error(`You need ${prize.points - userPoints} more points to redeem this prize.`);
      return;
    }
    setSelectedPrize(prize);
    setShowRedeemModal(true);
  };

  const confirmRedeem = async () => {
    if (!selectedPrize) return;
    
    console.log("Redeeming:", selectedPrize);
    toast.success(`Successfully redeemed ${selectedPrize.name}! Check your email for delivery details.`);
    setShowRedeemModal(false);
    setSelectedPrize(null);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "lifestyle":
        return "bg-purple-500/20 border-purple-500/30 text-purple-400";
      case "tech":
        return "bg-blue-500/20 border-blue-500/30 text-blue-400";
      case "eco":
        return "bg-green-500/20 border-green-500/30 text-green-400";
      case "accessories":
        return "bg-orange-500/20 border-orange-500/30 text-orange-400";
      default:
        return "bg-white/10 border-white/20 text-white";
    }
  };

  return (
    <div className="min-h-screen pb-0">
      <div className="max-w-350 mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        {/* Header Section */}
        <div className="mb-6 sm:mb-8">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl shadow-black/20 overflow-hidden">
            <div className="px-6 sm:px-8 py-6 sm:py-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2">
                    Rewards Store 🎁
                  </h1>
                  <p className="text-base text-white/60">Redeem your points for exclusive eco-friendly prizes and goodies</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="px-6 py-4 bg-linear-to-br from-green-500/20 to-green-600/10 border border-green-500/30 rounded-xl backdrop-blur-sm">
                    <p className="text-xs text-green-300/80 uppercase tracking-wider font-semibold mb-1">Available Points</p>
                    <p className="text-3xl font-bold text-green-400">{userPoints}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <SpotlightCard className="bg-linear-to-br from-green-500/10 to-green-600/5 backdrop-blur-xl border border-green-500/20 rounded-xl p-6 hover:shadow-xl hover:shadow-green-500/10 transition-all duration-300 group">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-500/20 rounded-lg group-hover:scale-110 transition-transform duration-300">
                <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <span className="text-xs font-semibold text-green-400 bg-green-500/20 px-3 py-1 rounded-full">Active</span>
            </div>
            <p className="text-sm text-white/50 mb-1 font-medium">Your Balance</p>
            <p className="text-3xl font-bold text-white">{userPoints} pts</p>
          </SpotlightCard>

          <SpotlightCard className="bg-linear-to-br from-blue-500/10 to-blue-600/5 backdrop-blur-xl border border-blue-500/20 rounded-xl p-6 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 group">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-500/20 rounded-lg group-hover:scale-110 transition-transform duration-300">
                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
            </div>
            <p className="text-sm text-white/50 mb-1 font-medium">Total Prizes</p>
            <p className="text-3xl font-bold text-white">{PRIZES.length}</p>
          </SpotlightCard>

          <SpotlightCard className="bg-linear-to-br from-purple-500/10 to-purple-600/5 backdrop-blur-xl border border-purple-500/20 rounded-xl p-6 hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300 group">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-500/20 rounded-lg group-hover:scale-110 transition-transform duration-300">
                <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p className="text-sm text-white/50 mb-1 font-medium">You Can Redeem</p>
            <p className="text-3xl font-bold text-white">{affordablePrizes}</p>
          </SpotlightCard>

          <SpotlightCard className="bg-linear-to-br from-orange-500/10 to-orange-600/5 backdrop-blur-xl border border-orange-500/20 rounded-xl p-6 hover:shadow-xl hover:shadow-orange-500/10 transition-all duration-300 group">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-orange-500/20 rounded-lg group-hover:scale-110 transition-transform duration-300">
                <svg className="w-6 h-6 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
            </div>
            <p className="text-sm text-white/50 mb-1 font-medium">Featured Items</p>
            <p className="text-3xl font-bold text-white">{featuredPrizes.length}</p>
          </SpotlightCard>
        </div>

        {/* Category Filter */}
        <SpotlightCard className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 mb-6 sm:mb-8">
          <div className="flex items-center gap-2 mb-4">
            <svg className="w-5 h-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            <h3 className="text-lg font-semibold text-white">Filter by Category</h3>
          </div>
          
          <div className="flex flex-wrap gap-3">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-5 py-3 rounded-lg font-semibold transition-all duration-300 border ${
                  selectedCategory === category.id
                    ? "bg-white/20 border-white/30 text-white shadow-lg scale-105"
                    : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:border-white/20"
                }`}
              >
                <span className="mr-2">{category.icon}</span>
                {category.name}
              </button>
            ))}
          </div>
        </SpotlightCard>

        {/* Featured Prizes */}
        {selectedCategory === "all" && featuredPrizes.length > 0 && (
          <div className="mb-6 sm:mb-8">
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-6 h-6 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              <h2 className="text-2xl font-bold text-white">Featured Prizes</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 sm:mb-8">
              {featuredPrizes.map((prize) => (
                <SpotlightCard
                  key={prize.id}
                  className="bg-linear-to-br from-yellow-500/10 to-yellow-600/5 backdrop-blur-xl border border-yellow-500/30 rounded-xl overflow-hidden hover:shadow-2xl hover:shadow-yellow-500/20 transition-all duration-300 group"
                >
                  
                  <div className="relative h-56 bg-linear-to-br from-white/10 to-white/5 flex items-center justify-center overflow-hidden">
                    <div className="absolute inset-0 bg-linear-to-br from-yellow-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <img
                    src={prize.imageUrl}
                    alt={prize.name}
                    className="group-hover:scale-110 transition-transform duration-300 absolute inset-0 w-full h-full object-cover"
                    loading="lazy"
                  />
                    <div className="absolute top-3 right-3 px-3 py-1 bg-yellow-500/30 border border-yellow-400/50 rounded-full backdrop-blur-sm">
                      <span className="text-xs font-bold text-yellow-300">⭐ Featured</span>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-lg font-bold text-white group-hover:text-yellow-300 transition-colors">
                        {prize.name}
                      </h3>
                      <div className={`px-2 py-1 rounded text-xs font-semibold border ${getCategoryColor(prize.category)}`}>
                        {prize.category}
                      </div>
                    </div>

                    <p className="text-sm text-white/60 mb-4 line-clamp-2">
                      {prize.description}
                    </p>

                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                        <span className="text-sm text-white/50">{prize.stock} in stock</span>
                      </div>
                      <div className="px-4 py-2 bg-green-500/20 border border-green-500/30 rounded-lg">
                        <span className="text-sm font-bold text-green-400">{prize.points} pts</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleRedeem(prize)}
                      disabled={userPoints < prize.points}
                      className={`w-full py-3 px-4 rounded-lg font-semibold transition-all duration-200 ${
                        userPoints >= prize.points
                          ? "bg-linear-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0"
                          : "bg-white/5 border border-white/10 text-white/30 cursor-not-allowed"
                      }`}
                    >
                      {userPoints >= prize.points ? "Redeem Now" : `Need ${prize.points - userPoints} more pts`}
                    </button>
                  </div>
                </SpotlightCard>
              ))}
            </div>
          </div>
        )}

        {/* All Prizes Grid */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-white">
              {selectedCategory === "all" ? "All Prizes" : categories.find(c => c.id === selectedCategory)?.name}
            </h2>
            <span className="text-white/60 text-sm">{filteredPrizes.length} items</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {filteredPrizes.map((prize) => (
              <SpotlightCard
                key={prize.id}
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden hover:shadow-2xl hover:shadow-white/10 transition-all duration-300 group"
              >
                {/* Image Placeholder */}
                <div className="relative h-48 bg-linear-to-br from-white/10 to-white/5 flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 bg-linear-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <img
                    src={prize.imageUrl}
                    alt={prize.name}
                    className="group-hover:scale-110 transition-transform duration-300 absolute inset-0 w-full h-full object-cover"
                    loading="lazy"
                  />
                  {prize.featured && (
                    <div className="absolute top-3 right-3 px-3 py-1 bg-yellow-500/30 border border-yellow-400/50 rounded-full backdrop-blur-sm">
                      <span className="text-xs font-bold text-yellow-300">⭐</span>
                    </div>
                  )}
                </div>

                <div className="p-5">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-base font-bold text-white line-clamp-1 flex-1">
                      {prize.name}
                    </h3>
                    <div className={`px-2 py-0.5 rounded text-xs font-semibold border ${getCategoryColor(prize.category)} ml-2 shrink-0`}>
                      {prize.category}
                    </div>
                  </div>

                  <p className="text-sm text-white/60 mb-4 line-clamp-2 min-h-10">
                    {prize.description}
                  </p>

                  <div className="flex items-center justify-between mb-4 text-xs">
                    <div className="flex items-center gap-1.5 text-white/50">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                      <span>{prize.stock} left</span>
                    </div>
                    <div className="px-3 py-1.5 bg-green-500/20 border border-green-500/30 rounded">
                      <span className="text-sm font-bold text-green-400">{prize.points} pts</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleRedeem(prize)}
                    disabled={userPoints < prize.points}
                    className={`w-full py-2.5 px-4 rounded-lg font-semibold text-sm transition-all duration-200 ${
                      userPoints >= prize.points
                        ? "bg-linear-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0"
                        : "bg-white/5 border border-white/10 text-white/30 cursor-not-allowed"
                    }`}
                  >
                    {userPoints >= prize.points ? "Redeem" : `Need ${prize.points - userPoints} pts`}
                  </button>
                </div>
              </SpotlightCard>
            ))}
          </div>
        </div>

        {/* Redemption Modal */}
        {showRedeemModal && selectedPrize && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <SpotlightCard className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-2xl p-6 sm:p-8 max-w-md w-full mx-4 shadow-2xl">
              <div className="text-center mb-6">
                <div className="text-6xl mb-4">🎁</div>
                <h3 className="text-2xl font-bold text-white mb-2">Confirm Redemption</h3>
                <p className="text-white/60">Are you sure you want to redeem this prize?</p>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-6">
                <h4 className="font-bold text-white text-lg mb-2">{selectedPrize.name}</h4>
                <p className="text-sm text-white/60 mb-4">{selectedPrize.description}</p>
                
                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                  <span className="text-white/60">Points Required:</span>
                  <span className="text-xl font-bold text-green-400">{selectedPrize.points} pts</span>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <span className="text-white/60">Your Balance After:</span>
                  <span className="text-xl font-bold text-white">{userPoints - selectedPrize.points} pts</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowRedeemModal(false);
                    setSelectedPrize(null);
                  }}
                  className="flex-1 py-2.5 sm:py-3 px-3 sm:px-4 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg font-semibold text-white transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmRedeem}
                  className="flex-1 py-2.5 sm:py-3 px-3 sm:px-4 bg-linear-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 rounded-lg font-semibold text-white shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  Confirm
                </button>
              </div>
            </SpotlightCard>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserRewards;