import type { DetectionResult } from "../../types";

type ConfirmationProps = {
  result: DetectionResult;
  binId: string;
  binName?: string;
  onAccept: () => void | Promise<void>;
  onReject: () => void;
  loading?: boolean;
};

const Confirmation = ({
  result,
  binId,
  binName,
  onAccept,
  onReject,
  loading = false,
}: ConfirmationProps) => {
  const pointsToEarn = result.points_to_earn ?? result.estimated_value ?? 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full mb-4 shadow-lg shadow-green-500/30">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Confirm Transaction</h2>
        <p className="text-white/60">Review your recycling details before proceeding</p>
      </div>

      {/* Transaction Details Card */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 space-y-4">
        {/* Waste Type */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500/10 border border-blue-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <div>
              <p className="text-xs text-white/50 uppercase tracking-wide font-medium">Waste Type</p>
              <p className="text-lg font-semibold text-white">{result.waste_type}</p>
            </div>
          </div>
        </div>

        {/* Points Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
            <p className="text-xs text-purple-300/70 uppercase tracking-wide font-medium mb-1">Base Points</p>
            <p className="text-2xl font-bold text-white">{result.base_points ?? result.estimated_value ?? 0}</p>
          </div>
          
          <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
            <p className="text-xs text-green-300/70 uppercase tracking-wide font-medium mb-1">You'll Earn</p>
            <p className="text-2xl font-bold text-green-400">+{pointsToEarn}</p>
          </div>
        </div>

        {/* Confidence */}
        <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-white/50 uppercase tracking-wide font-medium">Detection Confidence</p>
            <span className="text-sm font-bold text-white">{(result.confidence * 100).toFixed(1)}%</span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500"
              style={{ width: `${result.confidence * 100}%` }}
            />
          </div>
        </div>

        {/* Bin Info */}
        <div className="flex items-center gap-3 p-4 bg-white/5 border border-white/10 rounded-lg">
          <div className="w-10 h-10 bg-amber-500/10 border border-amber-500/20 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-xs text-white/50 uppercase tracking-wide font-medium">Recycling Bin</p>
            <p className="text-base font-semibold text-white">{binName || `Bin #${binId}`}</p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <button 
          onClick={onReject}
          disabled={loading}
          className="flex-1 px-6 py-4 bg-white/5 hover:bg-white/10 border border-white/20 text-white font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
        >
          <svg className="w-5 h-5 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          Cancel
        </button>
        
        <button 
          onClick={onAccept}
          disabled={loading}
          className="flex-1 px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-green-500/30 hover:shadow-green-500/50 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
              Confirm & Earn Points
            </>
          )}
        </button>
      </div>

      {/* Info Banner */}
      <div className="flex items-start gap-3 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
        <svg className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-sm text-blue-200/80">
          By confirming, you agree that the waste has been properly disposed in the designated bin. Points will be credited to your account instantly.
        </p>
      </div>
    </div>
  );
};

export default Confirmation;