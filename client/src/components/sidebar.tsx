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
    <div className="w-64 bg-white shadow-lg border-r border-gray-200 flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 flow-analyzer-brand rounded-lg flex items-center justify-center">
            <Activity className="text-white text-lg" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">FlowAnalyzer</h1>
            <p className="text-sm text-gray-500">Dashboard de Análise</p>
          </div>
        </div>
      </div>
      
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <li key={tab.id}>
                <button
                  onClick={() => onTabChange(tab.id)}
                  className={cn(
                    "w-full flex items-center px-4 py-3 rounded-lg font-medium transition-colors text-left",
                    activeTab === tab.id 
                      ? "text-primary bg-blue-50" 
                      : "text-gray-700 hover:bg-gray-100"
                  )}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {tab.label}
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
