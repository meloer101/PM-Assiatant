import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { InputForm } from "@/components/InputForm";
import { Home } from "lucide-react";

interface WelcomeScreenProps {
  handleSubmit: (query: string) => void;
  isLoading: boolean;
  onCancel: () => void;
}

export function WelcomeScreen({
  handleSubmit,
  isLoading,
  onCancel,
}: WelcomeScreenProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 overflow-hidden relative">
      {/* Home: 返回主页 */}
      <Link
        to="/"
        className="fixed top-4 left-4 z-20 flex items-center justify-center w-10 h-10 rounded-full bg-white/80 backdrop-blur-md border border-[#E5E0D8] text-[#666666] hover:text-[#D9653B] hover:border-[#D9653B]/30 transition-colors shadow-sm"
        title="返回主页"
      >
        <Home className="w-5 h-5" />
      </Link>

      {/* Liquid Glass Background Blobs for Welcome Screen */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[10%] left-[10%] w-[30%] h-[30%] bg-[#D9653B]/10 rounded-full mix-blend-multiply filter blur-[80px] animate-blob"></div>
        <div className="absolute bottom-[20%] right-[10%] w-[40%] h-[40%] bg-[#F4A261]/10 rounded-full mix-blend-multiply filter blur-[100px] animate-blob animation-delay-2000"></div>
      </div>

      {/* The "Card" Container */}
      <div className="w-full max-w-2xl z-10
                      bg-white/80 backdrop-blur-xl 
                      p-8 rounded-3xl border border-[#E5E0D8] 
                      shadow-[0_8px_30px_rgb(0,0,0,0.04)] 
                      transition-all duration-300 hover:border-[#D9653B]/30 hover:shadow-[0_8px_30px_rgb(217,101,59,0.08)]">
        
        {/* Header section of the card */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-serif font-bold text-[#1A1A1A] flex items-center justify-center gap-3">
            Research Terminal
          </h1>
          <p className="text-lg text-[#666666] max-w-md mx-auto">
            从行业研究到 PRD，一站式产品研究工作台
          </p>
        </div>

        {/* Input form section of the card */}
        <div className="mt-8">
          <InputForm onSubmit={handleSubmit} isLoading={isLoading} context="homepage" />
          {isLoading && (
            <div className="mt-4 flex justify-center">
              <Button
                variant="outline"
                onClick={onCancel}
                className="text-red-500 hover:text-red-600 hover:bg-red-50 border-red-200 rounded-full px-6"
              >
                取消
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}