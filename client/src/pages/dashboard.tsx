import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Sidebar } from "@/components/sidebar";
import { FileUploadModal } from "@/components/file-upload-modal";
import { OverviewTab } from "@/components/overview-tab";
import { ExplorerTab } from "@/components/explorer-tab";
import { ActionsTab } from "@/components/actions-tab";
import { DependenciesTab } from "@/components/dependencies-tab";
import { ReportsTab } from "@/components/reports-tab";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Download, Upload, Search } from "lucide-react";
import type { FlowAnalysis } from "@shared/schema";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [currentAnalysis, setCurrentAnalysis] = useState<FlowAnalysis | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const { data: analyses = [] } = useQuery<FlowAnalysis[]>({
    queryKey: ["/api/flow-analyses"],
  });

  const handleAnalysisUploaded = (analysis: FlowAnalysis) => {
    setCurrentAnalysis(analysis);
    setIsUploadModalOpen(false);
  };

  const getTabTitle = () => {
    switch (activeTab) {
      case "overview":
        return "Visão Geral do Fluxo";
      case "explorer":
        return "Explorador de Estados";
      case "actions":
        return "Análise de Ações";
      case "dependencies":
        return "Mapa de Dependências";
      case "reports":
        return "Relatórios e Exportação";
      default:
        return "FlowAnalyzer";
    }
  };

  const handleExport = () => {
    if (currentAnalysis) {
      // Generate and download report
      const dataStr = JSON.stringify(currentAnalysis, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `flow-analysis-${currentAnalysis.id}-${new Date().toISOString().split('T')[0]}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-gray-50">
      {/* Mobile/Tablet sidebar - hidden on desktop */}
      <div className="lg:hidden">
        <Sidebar 
          activeTab={activeTab} 
          onTabChange={setActiveTab}
          analyses={analyses}
          currentAnalysis={currentAnalysis}
          onAnalysisSelect={setCurrentAnalysis}
        />
      </div>

      {/* Desktop sidebar - hidden on mobile/tablet */}
      <div className="hidden lg:block">
        <Sidebar 
          activeTab={activeTab} 
          onTabChange={setActiveTab}
          analyses={analyses}
          currentAnalysis={currentAnalysis}
          onAnalysisSelect={setCurrentAnalysis}
        />
      </div>
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-4 lg:px-6 py-3 lg:py-4">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="min-w-0 flex-1">
              <h2 className="text-xl lg:text-2xl font-bold text-gray-900 truncate">{getTabTitle()}</h2>
              <p className="text-sm text-gray-500 mt-1 truncate">
                {currentAnalysis ? currentAnalysis.name : "Nenhum fluxo carregado"}
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
              <div className="relative order-last sm:order-first">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Buscar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full sm:w-48 lg:w-64"
                />
              </div>
              
              <div className="flex gap-2">
                <Button 
                  onClick={() => setIsUploadModalOpen(true)}
                  className="bg-primary hover:bg-primary/90 flex-1 sm:flex-none"
                  size="sm"
                >
                  <Upload className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Carregar Fluxo</span>
                  <span className="sm:hidden">Upload</span>
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleExport}
                  disabled={!currentAnalysis}
                  className="flex-1 sm:flex-none"
                  size="sm"
                >
                  <Download className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Exportar</span>
                  <span className="sm:hidden">Export</span>
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-auto p-4 lg:p-6">
          {activeTab === "overview" && (
            <OverviewTab 
              analysis={currentAnalysis} 
              onUploadClick={() => setIsUploadModalOpen(true)}
            />
          )}
          {activeTab === "explorer" && (
            <ExplorerTab 
              analysis={currentAnalysis}
              searchTerm={searchTerm}
            />
          )}
          {activeTab === "actions" && (
            <ActionsTab analysis={currentAnalysis} />
          )}
          {activeTab === "dependencies" && (
            <DependenciesTab analysis={currentAnalysis} />
          )}
          {activeTab === "reports" && (
            <ReportsTab analysis={currentAnalysis} />
          )}
        </main>
      </div>

      <FileUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onAnalysisUploaded={handleAnalysisUploaded}
      />
    </div>
  );
}
