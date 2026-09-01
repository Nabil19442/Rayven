import React from 'react';
import { X, Ruler, AlertCircle } from 'lucide-react';

interface SizeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SizeGuideModal: React.FC<SizeGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto p-4 sm:p-6 lg:p-8 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-[#1F2024]/60 backdrop-blur-xs transition-opacity cursor-pointer"
      />

      <div className="relative w-full max-w-2xl bg-white border border-[#E5E5E3] rounded-3xl shadow-2xl overflow-hidden z-10 p-6 sm:p-8 text-[#1F2024]">
        <div className="flex items-center justify-between pb-4 border-b border-[#E5E5E3]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#F3EEFC] text-[#6D35C8]">
              <Ruler className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display text-2xl font-black uppercase tracking-wider text-[#1F2024]">
                RAYVEN Size & Fit Guide
              </h2>
              <p className="text-xs text-zinc-500 font-medium">Standard Bangladeshi football jersey sizing specs</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Comparison Notice */}
        <div className="mt-4 p-4 rounded-2xl bg-[#F3EEFC] border border-[#8B5AD9]/20 text-xs text-[#1F2024] space-y-1.5">
          <p className="font-bold flex items-center gap-1.5 text-[#6D35C8]">
            <AlertCircle className="w-4 h-4 shrink-0" />
            Important Fit Recommendation:
          </p>
          <p className="text-zinc-700 leading-relaxed">
            <strong>Player Edition (Pro):</strong> Tapered slim athletic cut. If you prefer a relaxed standard fit, we recommend ordering <strong>one size larger</strong>.
          </p>
          <p className="text-zinc-700 leading-relaxed">
            <strong>Fan Edition & Retro Vault:</strong> Standard regular fit. True to regular Bangladeshi streetwear and t-shirt sizing.
          </p>
        </div>

        {/* Sizing Table */}
        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E5E5E3] text-zinc-500 font-bold uppercase tracking-wider bg-[#F7F7F5]">
                <th className="py-3 px-3.5 rounded-l-xl">Size</th>
                <th className="py-3 px-3.5">Chest (Inches)</th>
                <th className="py-3 px-3.5">Chest (CM)</th>
                <th className="py-3 px-3.5">Length (Inches)</th>
                <th className="py-3 px-3.5 rounded-r-xl">Suggested Weight</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 text-zinc-700">
              <tr className="hover:bg-[#F7F7F5] font-mono">
                <td className="py-3 px-3.5 font-bold text-[#6D35C8]">S (Small)</td>
                <td className="py-3 px-3.5">36 - 38"</td>
                <td className="py-3 px-3.5">91 - 96 cm</td>
                <td className="py-3 px-3.5">27" (69 cm)</td>
                <td className="py-3 px-3.5">50 - 62 kg</td>
              </tr>
              <tr className="hover:bg-[#F7F7F5] font-mono">
                <td className="py-3 px-3.5 font-bold text-[#6D35C8]">M (Medium)</td>
                <td className="py-3 px-3.5">38 - 40"</td>
                <td className="py-3 px-3.5">96 - 101 cm</td>
                <td className="py-3 px-3.5">28" (71 cm)</td>
                <td className="py-3 px-3.5">63 - 73 kg</td>
              </tr>
              <tr className="hover:bg-[#F7F7F5] font-mono">
                <td className="py-3 px-3.5 font-bold text-[#6D35C8]">L (Large)</td>
                <td className="py-3 px-3.5">40 - 42"</td>
                <td className="py-3 px-3.5">101 - 106 cm</td>
                <td className="py-3 px-3.5">29" (74 cm)</td>
                <td className="py-3 px-3.5">74 - 84 kg</td>
              </tr>
              <tr className="hover:bg-[#F7F7F5] font-mono">
                <td className="py-3 px-3.5 font-bold text-[#6D35C8]">XL (Extra Large)</td>
                <td className="py-3 px-3.5">42 - 44"</td>
                <td className="py-3 px-3.5">106 - 111 cm</td>
                <td className="py-3 px-3.5">30" (76 cm)</td>
                <td className="py-3 px-3.5">85 - 95 kg</td>
              </tr>
              <tr className="hover:bg-[#F7F7F5] font-mono">
                <td className="py-3 px-3.5 font-bold text-[#6D35C8]">XXL (2X Large)</td>
                <td className="py-3 px-3.5">44 - 46"</td>
                <td className="py-3 px-3.5">111 - 117 cm</td>
                <td className="py-3 px-3.5">31" (79 cm)</td>
                <td className="py-3 px-3.5">95 - 110 kg</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Measuring Tip */}
        <div className="mt-6 pt-4 border-t border-zinc-200 text-xs text-zinc-600 space-y-2">
          <p className="font-bold text-[#1F2024] uppercase tracking-wider">How to Measure:</p>
          <ul className="list-disc pl-4 space-y-1">
            <li><strong>Chest:</strong> Measure around the fullest part of your chest, keeping the measuring tape horizontal.</li>
            <li><strong>Length:</strong> Measure from the top edge of your collar/shoulder down to the bottom hem.</li>
          </ul>
        </div>

        <button
          onClick={onClose}
          className="mt-6 w-full py-3 bg-[#1F2024] hover:bg-[#2B2D31] text-white font-bold rounded-xl text-xs uppercase tracking-wider transition cursor-pointer"
        >
          Got It, Close Guide
        </button>
      </div>
    </div>
  );
};
