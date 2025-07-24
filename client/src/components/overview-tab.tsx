import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import type { FlowAnalysis } from "@shared/schema";

interface OverviewTabProps {
  analysis: FlowAnalysis | null;
  onUploadClick: () => void;
}

export function OverviewTab({ analysis, onUploadClick }: OverviewTabProps) {
  if (!analysis) {
    return (
      <div className="metric-card text-center">
        <div className="w-20 h-20 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <Plus className="text-3xl text-gray-400 h-8 w-8" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Carregue um arquivo de fluxo JSON
        </h3>
        <p className="text-gray-500 mb-6">
          Arraste e solte ou clique para selecionar um arquivo de fluxo para análise
        </p>
        <Button onClick={onUploadClick} className="bg-primary hover:bg-primary/90">
          <Plus className="mr-2 h-4 w-4" />
          Selecionar Arquivo
        </Button>
      </div>
    );
  }

  const kpis = analysis.kpis as any;

  const formatPercentage = (value: number) => `${Math.round(value)}%`;
  const formatScore = (value: number, max = 10) => `${value.toFixed(1)}/${max}`;

  const getRiskLevel = (value: number, thresholds = { high: 70, medium: 40 }) => {
    if (value >= thresholds.high) return "high";
    if (value >= thresholds.medium) return "medium";
    return "low";
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case "high": return "text-red-600";
      case "medium": return "text-amber-600";
      default: return "text-green-600";
    }
  };

  return (
    <div className="space-y-8">
      {/* Global KPIs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-700">
                Índice de Saúde do Fluxo
              </h3>
              <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
            </div>
            <div className="flex items-center">
              <span className="text-3xl font-bold text-emerald-600">
                {formatScore(kpis.healthScore, 1)}
              </span>
            </div>
            <Progress value={kpis.healthScore * 100} className="mt-3" />
            <p className="text-xs text-gray-500 mt-2">
              {kpis.healthScore > 0.8 ? "Excelente saúde" : 
               kpis.healthScore > 0.6 ? "Boa saúde" : "Necessita atenção"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-700">
                Índice de Complexidade
              </h3>
              <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
            </div>
            <div className="flex items-center">
              <span className="text-3xl font-bold text-amber-600">
                {formatScore(kpis.complexityIndex)}
              </span>
            </div>
            <Progress value={(kpis.complexityIndex / 10) * 100} className="mt-3" />
            <p className="text-xs text-gray-500 mt-2">
              {kpis.complexityIndex < 5 ? "Baixa complexidade" :
               kpis.complexityIndex < 7 ? "Complexidade moderada" : "Alta complexidade"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-700">
                Dependências Externas
              </h3>
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            </div>
            <div className="flex items-center">
              <span className="text-3xl font-bold text-blue-600">
                {formatPercentage(kpis.externalDependencyIndex)}
              </span>
            </div>
            <Progress value={kpis.externalDependencyIndex} className="mt-3" />
            <p className="text-xs text-gray-500 mt-2">
              {kpis.externalDependencyIndex < 30 ? "Baixo acoplamento" :
               kpis.externalDependencyIndex < 60 ? "Acoplamento moderado" : "Alto acoplamento"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-700">
                Manutenibilidade
              </h3>
              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
            </div>
            <div className="flex items-center">
              <span className="text-3xl font-bold text-purple-600">
                {formatPercentage(kpis.maintainabilityScore)}
              </span>
            </div>
            <Progress value={kpis.maintainabilityScore} className="mt-3" />
            <p className="text-xs text-gray-500 mt-2">
              {kpis.maintainabilityScore > 80 ? "Alta manutenibilidade" :
               kpis.maintainabilityScore > 60 ? "Boa manutenibilidade" : "Baixa manutenibilidade"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Métricas de Estrutura</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total de Estados</span>
                <span className="font-semibold text-gray-900">{kpis.totalStates}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Fator de Ramificação</span>
                <span className="font-semibold text-gray-900">{kpis.branchingFactor.toFixed(1)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Clusters Identificados</span>
                <span className="font-semibold text-gray-900">{kpis.clusters}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Estados Órfãos</span>
                <span className={`font-semibold ${kpis.orphanStates > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {kpis.orphanStates}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Qualidade de Conteúdo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Conteúdo Dinâmico</span>
                <span className="font-semibold text-emerald-600">
                  {formatPercentage(kpis.dynamicContentRate)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Validação de Input</span>
                <span className="font-semibold text-blue-600">
                  {formatPercentage(kpis.interactionActions.inputRobustness)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Riqueza de Interação</span>
                <span className="font-semibold text-purple-600">
                  {kpis.interactionActions.richnessScore.toFixed(1)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Becos sem Saída</span>
                <span className="font-semibold text-amber-600">
                  {formatPercentage(kpis.interactionActions.deadEndsRate)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Riscos Identificados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                  <span className="text-sm text-red-800">Scripts de Alto Risco</span>
                </div>
                <Badge variant="destructive">
                  {Math.round(kpis.scriptActions.averageRiskScore)}
                </Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-amber-500 rounded-full mr-2"></div>
                  <span className="text-sm text-amber-800">Problemas de Performance</span>
                </div>
                <Badge variant="secondary">
                  {kpis.httpActions.performanceRisk}
                </Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                  <span className="text-sm text-blue-800">Dependências Críticas</span>
                </div>
                <Badge variant="outline">
                  {formatPercentage(kpis.externalDependencyIndex)}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
