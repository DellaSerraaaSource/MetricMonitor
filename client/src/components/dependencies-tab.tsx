import { AlertTriangle, Clock, Link, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { FlowAnalysis } from "@shared/schema";

interface DependenciesTabProps {
  analysis: FlowAnalysis | null;
}

export function DependenciesTab({ analysis }: DependenciesTabProps) {
  if (!analysis) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-gray-500">
            Carregue um fluxo para analisar as dependências
          </div>
        </CardContent>
      </Card>
    );
  }

  const kpis = analysis.kpis as any;

  return (
    <div className="space-y-6">
      {/* Dependency Graph Visualization */}
      <Card>
        <CardHeader>
          <CardTitle>Mapa de Dependências</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-96 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
            <div className="text-center">
              <Activity className="mx-auto h-16 w-16 text-gray-400 mb-4" />
              <p className="text-gray-600 mb-2">Visualização do grafo de dependências</p>
              <p className="text-sm text-gray-500">
                Esta funcionalidade seria implementada com D3.js ou biblioteca similar
              </p>
              <div className="mt-4 text-sm text-gray-600">
                <p><strong>Estados:</strong> {kpis.totalStates}</p>
                <p><strong>Clusters:</strong> {kpis.clusters}</p>
                <p><strong>Dependências Externas:</strong> {Math.round(kpis.externalDependencyIndex)}%</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dependency Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Análise de Dependências</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
                <div>
                  <div className="font-semibold text-blue-900">APIs Externas</div>
                  <div className="text-sm text-blue-700">
                    {kpis.httpActions.diversityOfEndpoints} endpoints únicos
                  </div>
                </div>
                <div className="text-xl font-bold text-blue-600">
                  {Math.round(kpis.externalDependencyIndex)}%
                </div>
              </div>
              
              <div className="flex justify-between items-center p-4 bg-purple-50 rounded-lg">
                <div>
                  <div className="font-semibold text-purple-900">Scripts Externos</div>
                  <div className="text-sm text-purple-700">
                    {kpis.scriptActions.count} scripts customizados
                  </div>
                </div>
                <div className="text-xl font-bold text-purple-600">
                  {Math.round((kpis.scriptActions.count / kpis.totalStates) * 100)}%
                </div>
              </div>
              
              <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
                <div>
                  <div className="font-semibold text-green-900">Estados Internos</div>
                  <div className="text-sm text-green-700">
                    {kpis.totalStates} estados do fluxo
                  </div>
                </div>
                <div className="text-xl font-bold text-green-600">
                  {Math.round(100 - kpis.externalDependencyIndex)}%
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pontos Críticos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="p-4 border-l-4 border-red-500 bg-red-50">
                <div className="flex items-center">
                  <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
                  <div className="font-semibold text-red-900">Dependências de Alto Risco</div>
                </div>
                <div className="text-sm text-red-700 mt-1">
                  {Math.round(kpis.scriptActions.averageRiskScore)} scripts com alto risco identificados
                </div>
              </div>
              
              <div className="p-4 border-l-4 border-amber-500 bg-amber-50">
                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-amber-500 mr-2" />
                  <div className="font-semibold text-amber-900">Gargalos de Performance</div>
                </div>
                <div className="text-sm text-amber-700 mt-1">
                  {kpis.httpActions.performanceRisk} chamadas síncronas sem fallback
                </div>
              </div>
              
              <div className="p-4 border-l-4 border-blue-500 bg-blue-50">
                <div className="flex items-center">
                  <Link className="h-5 w-5 text-blue-500 mr-2" />
                  <div className="font-semibold text-blue-900">Dependências Circulares</div>
                </div>
                <div className="text-sm text-blue-700 mt-1">
                  Análise de ciclos requer processamento de grafo
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {kpis.branchingFactor.toFixed(1)}
              </div>
              <div className="text-sm text-gray-600">Fator de Ramificação Médio</div>
              <div className="text-xs text-gray-500 mt-1">
                Complexidade de decisões
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {kpis.clusters}
              </div>
              <div className="text-sm text-gray-600">Clusters Identificados</div>
              <div className="text-xs text-gray-500 mt-1">
                Possíveis módulos separáveis
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600 mb-2">
                {kpis.orphanStates}
              </div>
              <div className="text-sm text-gray-600">Estados Órfãos</div>
              <div className="text-xs text-gray-500 mt-1">
                Código potencialmente morto
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
