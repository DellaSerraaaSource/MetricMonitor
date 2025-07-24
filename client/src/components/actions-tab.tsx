import { Globe, Code, MessageSquare, Database } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { FlowAnalysis } from "@shared/schema";

interface ActionsTabProps {
  analysis: FlowAnalysis | null;
}

export function ActionsTab({ analysis }: ActionsTabProps) {
  if (!analysis) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-gray-500">
            Carregue um fluxo para analisar as ações
          </div>
        </CardContent>
      </Card>
    );
  }

  const kpis = analysis.kpis as any;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      {/* ProcessHttp Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Globe className="h-5 w-5 text-blue-500 mr-2" />
            Ações ProcessHttp
            <Badge variant="outline" className="ml-auto">
              {kpis.httpActions.count} ações
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {Math.round(kpis.httpActions.integrationHealth)}%
              </div>
              <div className="text-sm text-blue-700">Saúde da Integração</div>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {Math.round(kpis.httpActions.securityRate)}%
              </div>
              <div className="text-sm text-green-700">Taxa de Segurança</div>
            </div>
            <div className="p-4 bg-amber-50 rounded-lg">
              <div className="text-2xl font-bold text-amber-600">
                {kpis.httpActions.diversityOfEndpoints}
              </div>
              <div className="text-sm text-amber-700">Endpoints Únicos</div>
            </div>
            <div className="p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {kpis.httpActions.performanceRisk}
              </div>
              <div className="text-sm text-red-700">Riscos de Performance</div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold text-gray-900">Métricas Detalhadas</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Taxa de Reutilização</span>
                <span className="text-sm font-semibold text-gray-900">
                  {kpis.httpActions.reutilizationRate.toFixed(1)}x
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Integrações Seguras</span>
                <div className="flex items-center space-x-2">
                  <Progress value={kpis.httpActions.securityRate} className="w-20" />
                  <span className="text-sm font-semibold text-gray-900">
                    {Math.round(kpis.httpActions.securityRate)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ExecuteScript Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Code className="h-5 w-5 text-purple-500 mr-2" />
            Scripts Customizados
            <Badge variant="outline" className="ml-auto">
              {kpis.scriptActions.count} scripts
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div className="p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {kpis.scriptActions.averageRiskScore.toFixed(1)}
              </div>
              <div className="text-sm text-red-700">Score de Risco Médio</div>
            </div>
            <div className="p-4 bg-amber-50 rounded-lg">
              <div className="text-2xl font-bold text-amber-600">
                {Math.round(kpis.scriptActions.deadCodeRate)}%
              </div>
              <div className="text-sm text-amber-700">Taxa de Código Morto</div>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {Math.round(kpis.scriptActions.couplingRate)}%
              </div>
              <div className="text-sm text-blue-700">Taxa de Acoplamento</div>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {Math.round(kpis.scriptActions.namingConsistency)}%
              </div>
              <div className="text-sm text-green-700">Consistência de Nomenclatura</div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold text-gray-900">Análise de Qualidade</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Código Duplicado</span>
                <div className="flex items-center space-x-2">
                  <Progress value={kpis.scriptActions.duplicatedCodeRate} className="w-20" />
                  <span className="text-sm font-semibold text-gray-900">
                    {Math.round(kpis.scriptActions.duplicatedCodeRate)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* SendMessage & Input Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MessageSquare className="h-5 w-5 text-green-500 mr-2" />
            Interações do Usuário
            <Badge variant="outline" className="ml-auto">
              {kpis.interactionActions.count} interações
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div className="p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {kpis.interactionActions.richnessScore.toFixed(1)}
              </div>
              <div className="text-sm text-purple-700">Score de Riqueza</div>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {Math.round(kpis.interactionActions.inputRobustness)}%
              </div>
              <div className="text-sm text-blue-700">Robustez de Input</div>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {kpis.interactionActions.navigationClarity.toFixed(1)}
              </div>
              <div className="text-sm text-green-700">Clareza de Navegação</div>
            </div>
            <div className="p-4 bg-amber-50 rounded-lg">
              <div className="text-2xl font-bold text-amber-600">
                {Math.round(kpis.interactionActions.deadEndsRate)}%
              </div>
              <div className="text-sm text-amber-700">Becos sem Saída</div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold text-gray-900">Experiência do Usuário</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Consistência</span>
                <div className="flex items-center space-x-2">
                  <Progress value={kpis.interactionActions.consistencyScore} className="w-20" />
                  <span className="text-sm font-semibold text-gray-900">
                    {Math.round(kpis.interactionActions.consistencyScore)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* SetVariable Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Database className="h-5 w-5 text-indigo-500 mr-2" />
            Gerenciamento de Estado
            <Badge variant="outline" className="ml-auto">
              {kpis.variableActions.count} variáveis
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div className="p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {Math.round(kpis.variableActions.orphanRate)}%
              </div>
              <div className="text-sm text-red-700">Taxa de Variáveis Órfãs</div>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {kpis.variableActions.averageLifecycle.toFixed(1)}
              </div>
              <div className="text-sm text-blue-700">Ciclo de Vida Médio</div>
            </div>
            <div className="p-4 bg-amber-50 rounded-lg">
              <div className="text-2xl font-bold text-amber-600">
                {kpis.variableActions.conditionComplexity.toFixed(1)}
              </div>
              <div className="text-sm text-amber-700">Complexidade de Condições</div>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {Math.round(kpis.variableActions.magicVariablesRate)}%
              </div>
              <div className="text-sm text-purple-700">Variáveis "Mágicas"</div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold text-gray-900">Distribuição de Fonte</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Input do Usuário</span>
                <div className="flex items-center space-x-2">
                  <Progress value={kpis.variableActions.sourceDistribution.input} className="w-20" />
                  <span className="text-sm font-semibold text-gray-900">
                    {Math.round(kpis.variableActions.sourceDistribution.input)}%
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Contexto Interno</span>
                <div className="flex items-center space-x-2">
                  <Progress value={kpis.variableActions.sourceDistribution.context} className="w-20" />
                  <span className="text-sm font-semibold text-gray-900">
                    {Math.round(kpis.variableActions.sourceDistribution.context)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
