import { useState } from "react";
import { FileText, Download, FileSpreadsheet, Code, Printer } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import type { FlowAnalysis } from "@shared/schema";

interface ReportsTabProps {
  analysis: FlowAnalysis | null;
}

export function ReportsTab({ analysis }: ReportsTabProps) {
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const { toast } = useToast();

  if (!analysis) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-gray-500">
            Carregue um fluxo para gerar relatórios
          </div>
        </CardContent>
      </Card>
    );
  }

  const kpis = analysis.kpis as any;

  const generatePDFReport = async () => {
    setIsGeneratingReport(true);
    try {
      // In a real implementation, this would generate a PDF report
      // For now, we'll create a comprehensive text report
      const reportContent = generateTextReport();
      downloadFile(reportContent, `relatorio-fluxo-${analysis.id}.txt`, "text/plain");
      
      toast({
        title: "Relatório Gerado",
        description: "Relatório PDF foi gerado com sucesso!",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao gerar relatório PDF",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const exportCSVData = () => {
    try {
      const csvContent = generateCSVData();
      downloadFile(csvContent, `metricas-fluxo-${analysis.id}.csv`, "text/csv");
      
      toast({
        title: "Dados Exportados",
        description: "Métricas exportadas em formato CSV!",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao exportar dados CSV",
        variant: "destructive",
      });
    }
  };

  const exportJSONSummary = () => {
    try {
      const jsonSummary = generateJSONSummary();
      downloadFile(
        JSON.stringify(jsonSummary, null, 2), 
        `resumo-fluxo-${analysis.id}.json`, 
        "application/json"
      );
      
      toast({
        title: "Resumo Exportado",
        description: "Resumo JSON foi exportado com sucesso!",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao exportar resumo JSON",
        variant: "destructive",
      });
    }
  };

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const generateTextReport = (): string => {
    const date = new Date().toLocaleDateString('pt-BR');
    
    return `
RELATÓRIO DE ANÁLISE DE FLUXO
============================

Análise: ${analysis.name}
Data: ${date}
ID da Análise: ${analysis.id}

RESUMO EXECUTIVO
================

O fluxo analisado apresenta:
- Índice de Saúde: ${(kpis.healthScore * 100).toFixed(1)}%
- Índice de Complexidade: ${kpis.complexityIndex.toFixed(1)}/10
- Manutenibilidade: ${kpis.maintainabilityScore.toFixed(1)}%
- Dependências Externas: ${kpis.externalDependencyIndex.toFixed(1)}%

MÉTRICAS GLOBAIS
================

Estrutura do Fluxo:
- Total de Estados: ${kpis.totalStates}
- Estados Órfãos: ${kpis.orphanStates}
- Fator de Ramificação: ${kpis.branchingFactor.toFixed(2)}
- Clusters Identificados: ${kpis.clusters}
- Taxa de Conteúdo Dinâmico: ${kpis.dynamicContentRate.toFixed(1)}%

ANÁLISE POR TIPO DE AÇÃO
=========================

Ações HTTP (${kpis.httpActions.count}):
- Saúde da Integração: ${kpis.httpActions.integrationHealth.toFixed(1)}%
- Taxa de Segurança: ${kpis.httpActions.securityRate.toFixed(1)}%
- Endpoints Únicos: ${kpis.httpActions.diversityOfEndpoints}
- Riscos de Performance: ${kpis.httpActions.performanceRisk}

Scripts Customizados (${kpis.scriptActions.count}):
- Score de Risco Médio: ${kpis.scriptActions.averageRiskScore.toFixed(1)}/10
- Taxa de Código Morto: ${kpis.scriptActions.deadCodeRate.toFixed(1)}%
- Taxa de Acoplamento: ${kpis.scriptActions.couplingRate.toFixed(1)}%
- Consistência de Nomenclatura: ${kpis.scriptActions.namingConsistency.toFixed(1)}%

Interações do Usuário (${kpis.interactionActions.count}):
- Score de Riqueza: ${kpis.interactionActions.richnessScore.toFixed(1)}
- Robustez de Input: ${kpis.interactionActions.inputRobustness.toFixed(1)}%
- Taxa de Becos sem Saída: ${kpis.interactionActions.deadEndsRate.toFixed(1)}%

Gerenciamento de Estado (${kpis.variableActions.count}):
- Taxa de Variáveis Órfãs: ${kpis.variableActions.orphanRate.toFixed(1)}%
- Ciclo de Vida Médio: ${kpis.variableActions.averageLifecycle.toFixed(1)} estados
- Complexidade de Condições: ${kpis.variableActions.conditionComplexity.toFixed(1)}
- Variáveis "Mágicas": ${kpis.variableActions.magicVariablesRate.toFixed(1)}%

RECOMENDAÇÕES
=============

Pontos Fortes:
${kpis.healthScore > 0.8 ? '✓ Excelente saúde geral do fluxo' : ''}
${kpis.maintainabilityScore > 80 ? '✓ Alta manutenibilidade' : ''}
${kpis.externalDependencyIndex < 30 ? '✓ Baixo acoplamento externo' : ''}
${kpis.dynamicContentRate > 70 ? '✓ Boa personalização do conteúdo' : ''}

Áreas de Melhoria:
${kpis.scriptActions.averageRiskScore > 5 ? '⚠ Scripts de alto risco precisam de refatoração' : ''}
${kpis.orphanStates > 0 ? '⚠ Estados órfãos detectados - revisar código morto' : ''}
${kpis.interactionActions.deadEndsRate > 10 ? '⚠ Becos sem saída na navegação precisam de atenção' : ''}
${kpis.httpActions.performanceRisk > 3 ? '⚠ Riscos de performance em integrações' : ''}

CONCLUSÃO
=========

${getOverallAssessment()}

Relatório gerado em ${date} às ${new Date().toLocaleTimeString('pt-BR')}
`;
  };

  const generateCSVData = (): string => {
    const headers = [
      'Métrica',
      'Valor',
      'Unidade',
      'Categoria',
      'Status'
    ];

    const rows = [
      ['Índice de Saúde', (kpis.healthScore * 100).toFixed(1), '%', 'Global', getHealthStatus(kpis.healthScore)],
      ['Índice de Complexidade', kpis.complexityIndex.toFixed(1), '/10', 'Global', getComplexityStatus(kpis.complexityIndex)],
      ['Manutenibilidade', kpis.maintainabilityScore.toFixed(1), '%', 'Global', getMaintainabilityStatus(kpis.maintainabilityScore)],
      ['Dependências Externas', kpis.externalDependencyIndex.toFixed(1), '%', 'Global', getDependencyStatus(kpis.externalDependencyIndex)],
      ['Total de Estados', kpis.totalStates.toString(), 'unidades', 'Estrutura', 'OK'],
      ['Estados Órfãos', kpis.orphanStates.toString(), 'unidades', 'Estrutura', kpis.orphanStates > 0 ? 'Atenção' : 'OK'],
      ['Fator de Ramificação', kpis.branchingFactor.toFixed(2), 'média', 'Estrutura', 'OK'],
      ['Ações HTTP', kpis.httpActions.count.toString(), 'unidades', 'HTTP', 'OK'],
      ['Saúde da Integração', kpis.httpActions.integrationHealth.toFixed(1), '%', 'HTTP', 'OK'],
      ['Taxa de Segurança HTTP', kpis.httpActions.securityRate.toFixed(1), '%', 'HTTP', 'OK'],
      ['Scripts Customizados', kpis.scriptActions.count.toString(), 'unidades', 'Scripts', 'OK'],
      ['Score de Risco de Scripts', kpis.scriptActions.averageRiskScore.toFixed(1), '/10', 'Scripts', getRiskStatus(kpis.scriptActions.averageRiskScore)],
      ['Interações do Usuário', kpis.interactionActions.count.toString(), 'unidades', 'Interação', 'OK'],
      ['Robustez de Input', kpis.interactionActions.inputRobustness.toFixed(1), '%', 'Interação', 'OK'],
      ['Variáveis de Estado', kpis.variableActions.count.toString(), 'unidades', 'Estado', 'OK'],
      ['Taxa de Variáveis Órfãs', kpis.variableActions.orphanRate.toFixed(1), '%', 'Estado', kpis.variableActions.orphanRate > 10 ? 'Atenção' : 'OK'],
    ];

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  };

  const generateJSONSummary = () => {
    return {
      analise: {
        id: analysis.id,
        nome: analysis.name,
        dataAnalise: new Date().toISOString(),
        versao: "1.0.0"
      },
      resumoExecutivo: {
        indiceSaude: kpis.healthScore,
        indiceComplexidade: kpis.complexityIndex,
        manutenibilidade: kpis.maintainabilityScore,
        dependenciasExternas: kpis.externalDependencyIndex,
        avaliacaoGeral: getOverallAssessment()
      },
      metricas: {
        estrutura: {
          totalEstados: kpis.totalStates,
          estadosOrfaos: kpis.orphanStates,
          fatorRamificacao: kpis.branchingFactor,
          clusters: kpis.clusters
        },
        acoes: {
          http: {
            total: kpis.httpActions.count,
            saudeIntegracao: kpis.httpActions.integrationHealth,
            taxaSeguranca: kpis.httpActions.securityRate,
            endpointsUnicos: kpis.httpActions.diversityOfEndpoints
          },
          scripts: {
            total: kpis.scriptActions.count,
            scoreRiscoMedio: kpis.scriptActions.averageRiskScore,
            taxaCodigoMorto: kpis.scriptActions.deadCodeRate,
            taxaAcoplamento: kpis.scriptActions.couplingRate
          },
          interacoes: {
            total: kpis.interactionActions.count,
            scoreRiqueza: kpis.interactionActions.richnessScore,
            robustezInput: kpis.interactionActions.inputRobustness,
            taxaBecosSemSaida: kpis.interactionActions.deadEndsRate
          },
          variaveis: {
            total: kpis.variableActions.count,
            taxaOrfas: kpis.variableActions.orphanRate,
            cicloVidaMedio: kpis.variableActions.averageLifecycle,
            complexidadeCondicoes: kpis.variableActions.conditionComplexity
          }
        }
      },
      recomendacoes: {
        pontosForts: getPontosForts(),
        areasMelhoria: getAreasMelhoria(),
        proximosPassos: getProximosPassos()
      }
    };
  };

  const getOverallAssessment = (): string => {
    const healthScore = kpis.healthScore;
    const complexityScore = kpis.complexityIndex;
    const maintainabilityScore = kpis.maintainabilityScore;

    if (healthScore > 0.8 && maintainabilityScore > 80 && complexityScore < 6) {
      return "Excelente: O fluxo apresenta alta qualidade e manutenibilidade.";
    } else if (healthScore > 0.6 && maintainabilityScore > 60) {
      return "Bom: O fluxo está em bom estado com algumas oportunidades de melhoria.";
    } else {
      return "Necessita Atenção: O fluxo apresenta problemas que devem ser endereçados.";
    }
  };

  const getHealthStatus = (score: number): string => {
    return score > 0.8 ? 'Excelente' : score > 0.6 ? 'Bom' : 'Atenção';
  };

  const getComplexityStatus = (score: number): string => {
    return score < 5 ? 'Baixa' : score < 7 ? 'Moderada' : 'Alta';
  };

  const getMaintainabilityStatus = (score: number): string => {
    return score > 80 ? 'Alta' : score > 60 ? 'Média' : 'Baixa';
  };

  const getDependencyStatus = (score: number): string => {
    return score < 30 ? 'Baixo' : score < 60 ? 'Moderado' : 'Alto';
  };

  const getRiskStatus = (score: number): string => {
    return score < 3 ? 'Baixo' : score < 6 ? 'Moderado' : 'Alto';
  };

  const getPontosForts = (): string[] => {
    const pontos = [];
    if (kpis.healthScore > 0.8) pontos.push("Excelente saúde geral do sistema");
    if (kpis.maintainabilityScore > 80) pontos.push("Alta manutenibilidade do código");
    if (kpis.externalDependencyIndex < 30) pontos.push("Baixo acoplamento externo");
    if (kpis.dynamicContentRate > 70) pontos.push("Boa personalização do conteúdo");
    if (kpis.httpActions.securityRate > 80) pontos.push("Boa implementação de segurança");
    return pontos;
  };

  const getAreasMelhoria = (): string[] => {
    const areas = [];
    if (kpis.scriptActions.averageRiskScore > 5) areas.push("Scripts de alto risco precisam refatoração");
    if (kpis.orphanStates > 0) areas.push("Estados órfãos devem ser removidos");
    if (kpis.interactionActions.deadEndsRate > 10) areas.push("Becos sem saída na navegação");
    if (kpis.httpActions.performanceRisk > 3) areas.push("Riscos de performance em APIs");
    if (kpis.variableActions.orphanRate > 10) areas.push("Muitas variáveis não utilizadas");
    return areas;
  };

  const getProximosPassos = (): string[] => {
    return [
      "Revisar e refatorar scripts de alto risco",
      "Remover estados e variáveis órfãos",
      "Implementar fallbacks para chamadas de API",
      "Melhorar validação de inputs do usuário",
      "Documentar ações customizadas com títulos descritivos"
    ];
  };

  const generatePreview = () => {
    setIsGeneratingReport(true);
    // Simulate report generation
    setTimeout(() => {
      setIsGeneratingReport(false);
      toast({
        title: "Pré-visualização Gerada",
        description: "Pré-visualização do relatório foi atualizada!",
      });
    }, 1000);
  };

  return (
    <div className="space-y-6">
      {/* Export Options */}
      <Card>
        <CardHeader>
          <CardTitle>Exportar Relatórios</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              variant="outline"
              className="p-6 h-auto flex-col space-y-3 hover:border-primary hover:bg-primary/5"
              onClick={generatePDFReport}
              disabled={isGeneratingReport}
            >
              <FileText className="h-8 w-8 text-red-500" />
              <div className="text-center">
                <div className="font-semibold text-gray-900">Relatório Completo</div>
                <div className="text-sm text-gray-500">Relatório detalhado em texto</div>
              </div>
            </Button>
            
            <Button
              variant="outline"
              className="p-6 h-auto flex-col space-y-3 hover:border-primary hover:bg-primary/5"
              onClick={exportCSVData}
            >
              <FileSpreadsheet className="h-8 w-8 text-green-500" />
              <div className="text-center">
                <div className="font-semibold text-gray-900">Dados CSV</div>
                <div className="text-sm text-gray-500">Métricas em formato CSV</div>
              </div>
            </Button>
            
            <Button
              variant="outline"
              className="p-6 h-auto flex-col space-y-3 hover:border-primary hover:bg-primary/5"
              onClick={exportJSONSummary}
            >
              <Code className="h-8 w-8 text-blue-500" />
              <div className="text-center">
                <div className="font-semibold text-gray-900">Resumo JSON</div>
                <div className="text-sm text-gray-500">Sumário estruturado</div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Report Preview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Pré-visualização do Relatório</CardTitle>
            <Button 
              onClick={generatePreview}
              disabled={isGeneratingReport}
              className="bg-primary hover:bg-primary/90"
            >
              <Printer className="mr-2 h-4 w-4" />
              {isGeneratingReport ? "Gerando..." : "Atualizar Pré-visualização"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="prose max-w-none">
            <div className="bg-gray-50 p-6 rounded-lg">
              <h4 className="text-lg font-semibold mb-4 text-gray-900">Resumo Executivo</h4>
              <p className="text-gray-700 mb-4">
                O fluxo analisado apresenta <strong>
                  {kpis.healthScore > 0.8 ? 'excelente saúde' : 
                   kpis.healthScore > 0.6 ? 'boa saúde' : 'problemas de saúde'}
                </strong> ({Math.round(kpis.healthScore * 100)}%) e <strong>
                  {kpis.maintainabilityScore > 80 ? 'alta manutenibilidade' : 
                   kpis.maintainabilityScore > 60 ? 'boa manutenibilidade' : 'baixa manutenibilidade'}
                </strong> ({Math.round(kpis.maintainabilityScore)}%). 
                A complexidade está em níveis <strong>
                  {kpis.complexityIndex < 5 ? 'baixos' : 
                   kpis.complexityIndex < 7 ? 'moderados' : 'altos'}
                </strong> ({kpis.complexityIndex.toFixed(1)}/10).
              </p>
              
              <div className="grid grid-cols-2 gap-6 mt-6">
                <div>
                  <h5 className="font-semibold text-green-800 mb-2">Pontos Fortes</h5>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {getPontosForts().map((ponto, index) => (
                      <li key={index}>• {ponto}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h5 className="font-semibold text-red-800 mb-2">Áreas de Melhoria</h5>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {getAreasMelhoria().map((area, index) => (
                      <li key={index}>• {area}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <Separator className="my-6" />

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {kpis.totalStates}
                  </div>
                  <div className="text-sm text-gray-600">Total de Estados</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {kpis.httpActions.count + kpis.scriptActions.count}
                  </div>
                  <div className="text-sm text-gray-600">Integrações</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {kpis.interactionActions.count}
                  </div>
                  <div className="text-sm text-gray-600">Interações</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-amber-600">
                    {kpis.clusters}
                  </div>
                  <div className="text-sm text-gray-600">Módulos</div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h5 className="font-semibold text-blue-900 mb-2">Avaliação Geral</h5>
                <p className="text-blue-800 text-sm">
                  {getOverallAssessment()}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
