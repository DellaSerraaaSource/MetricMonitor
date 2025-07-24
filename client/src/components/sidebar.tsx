import { ChartLine, Search, Code, Table, FileText, Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FlowAnalysis } from "@shared/schema";

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  analyses: FlowAnalysis[];
  currentAnalysis: FlowAnalysis | null;
  onAnalysisSelect: (analysis: FlowAnalysis) => void;
}

export function Sidebar({
  activeTab,
  onTabChange,
  analyses,
  currentAnalysis,
  onAnalysisSelect,
}: SidebarProps) {
  const tabs = [
    { id: "overview", label: "Visão Geral", icon: ChartLine },
    { id: "explorer", label: "Explorador de Estados", icon: Search },
    { id: "actions", label: "Análise de Ações", icon: Code },
    { id: "dependencies", label: "Dependências", icon: Table },
    { id: "reports", label: "Relatórios", icon: FileText },
  ];

  return (
    <div className="w-full lg:w-64 bg-white shadow-lg border-r border-gray-200 flex flex-col lg:h-screen">
      {/* Header - Compact on mobile */}
      <div className="p-3 lg:p-6 border-b border-gray-200">
        <div className="flex items-center space-x-2 lg:space-x-3">
          <div className="w-8 h-8 lg:w-10 lg:h-10 flow-analyzer-brand rounded-lg flex items-center justify-center">
            <Activity className="text-white text-sm lg:text-lg h-4 w-4 lg:h-5 lg:w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-lg lg:text-xl font-bold text-gray-900 truncate">FlowAnalyzer</h1>
            <p className="text-xs lg:text-sm text-gray-500 hidden sm:block lg:block">Dashboard de Análise</p>
          </div>
        </div>
      </div>
      
      {/* Navigation - Horizontal on mobile, vertical on desktop */}
      <nav className="flex-1 p-2 lg:p-4">
        <ul className="flex lg:flex-col space-x-1 lg:space-x-0 lg:space-y-2 overflow-x-auto lg:overflow-x-visible">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <li key={tab.id} className="flex-shrink-0 lg:flex-shrink">
                <button
                  onClick={() => onTabChange(tab.id)}
                  className={cn(
                    "flex items-center px-3 lg:px-4 py-2 lg:py-3 rounded-lg font-medium transition-colors text-left whitespace-nowrap lg:w-full",
                    activeTab === tab.id 
                      ? "text-primary bg-blue-50" 
                      : "text-gray-700 hover:bg-gray-100"
                  )}
                >
                  <Icon className="h-4 w-4 lg:h-5 lg:w-5 lg:mr-3" />
                  <span className="hidden lg:inline ml-2 lg:ml-0">{tab.label}</span>
                  <span className="lg:hidden text-xs ml-1">{tab.label.split(' ')[0]}</span>
                </button>
              </li>
            );
          })}
        </ul>

        {analyses.length > 0 && (
          <div className="mt-8">
            <h3 className="text-sm font-medium text-gray-700 mb-3 px-4">Análises Recentes</h3>
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {analyses.slice(0, 5).map((analysis) => (
                <button
                  key={analysis.id}
                  onClick={() => onAnalysisSelect(analysis)}
                  className={cn(
                    "w-full text-left px-4 py-2 rounded-lg text-sm transition-colors",
                    currentAnalysis?.id === analysis.id
                      ? "bg-blue-50 text-primary"
                      : "text-gray-600 hover:bg-gray-50"
                  )}
                >
                  <div className="truncate">{analysis.name}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {new Date(analysis.createdAt).toLocaleDateString('pt-BR')}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </nav>
      
      <div className="p-4 border-t border-gray-200">
        <div className="bg-gray-100 rounded-lg p-3">
          <div className="text-sm font-medium text-gray-700">Status do Sistema</div>
          <div className="flex items-center mt-1">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
            <span className="text-xs text-gray-600">Operacional</span>
          </div>
        </div>
      </div>
    </div>
  );
}
