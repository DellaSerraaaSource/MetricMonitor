import { useState } from "react";
import { ChevronDown, ChevronRight, Code, ArrowRight, LogIn, LogOut, MessageSquare, GitBranch } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import type { FlowAnalysis, FlowState } from "@shared/schema";

interface ExplorerTabProps {
  analysis: FlowAnalysis | null;
  searchTerm: string;
}

export function ExplorerTab({ analysis, searchTerm }: ExplorerTabProps) {
  const [filterType, setFilterType] = useState("all");
  const [expandedStates, setExpandedStates] = useState<Set<string>>(new Set());

  if (!analysis) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-gray-500">
            Carregue um fluxo para explorar os estados
          </div>
        </CardContent>
      </Card>
    );
  }

  const flowData = analysis.parsedData as any;
  const states = flowData.states || [];

  const filteredStates = states.filter((state: FlowState) => {
    // Apply search filter
    const matchesSearch = !searchTerm || 
      state.$id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (state.$title && state.$title.toLowerCase().includes(searchTerm.toLowerCase()));

    // Apply type filter
    const matchesType = (() => {
      switch (filterType) {
        case "root":
          return state.is_root;
        case "scripts":
          return (state.enteringCustomActions?.some(a => a.type === "ExecuteScript") ||
                  state.leavingCustomActions?.some(a => a.type === "ExecuteScript"));
        case "apis":
          return (state.enteringCustomActions?.some(a => a.type === "ProcessHttp") ||
                  state.actions?.some(a => a.type === "ProcessHttp") ||
                  state.leavingCustomActions?.some(a => a.type === "ProcessHttp"));
        default:
          return true;
      }
    })();

    return matchesSearch && matchesType;
  });

  const toggleStateExpansion = (stateId: string) => {
    const newExpanded = new Set(expandedStates);
    if (newExpanded.has(stateId)) {
      newExpanded.delete(stateId);
    } else {
      newExpanded.add(stateId);
    }
    setExpandedStates(newExpanded);
  };

  const getActionTypeBadge = (actionType: string) => {
    const type = actionType.toLowerCase();
    const baseClasses = "action-type-badge";
    
    if (type.includes("http")) return `${baseClasses} action-type-processhttp`;
    if (type.includes("script")) return `${baseClasses} action-type-executescript`;
    if (type.includes("message")) return `${baseClasses} action-type-sendmessage`;
    if (type.includes("input")) return `${baseClasses} action-type-input`;
    if (type.includes("variable")) return `${baseClasses} action-type-setvariable`;
    
    return `${baseClasses} bg-gray-100 text-gray-800`;
  };

  const renderAction = (action: any, index: number) => (
    <div key={index} className="p-3 bg-blue-50 rounded-lg">
      <div className="flex items-center justify-between">
        <span className="font-medium text-blue-900">
          {action.$title || `${action.type} Action`}
        </span>
        <div className="flex items-center space-x-2">
          <Badge className={getActionTypeBadge(action.type)}>
            {action.type}
          </Badge>
          <Button variant="ghost" size="sm">
            <Code className="h-4 w-4" />
          </Button>
        </div>
      </div>
      {action.settings && Object.keys(action.settings).length > 0 && (
        <div className="text-sm text-blue-700 mt-1">
          {action.outputVariable && `Output: ${action.outputVariable}`}
          {action.inputVariables && action.inputVariables.length > 0 && 
            ` | Inputs: ${action.inputVariables.join(", ")}`}
        </div>
      )}
    </div>
  );

  const renderCondition = (output: any, index: number) => (
    <div key={index} className="p-3 bg-purple-50 rounded-lg">
      <div className="flex items-center justify-between">
        <span className="font-medium text-purple-900">
          {output.conditions && output.conditions.length > 0 ? (
            `SE ${output.conditions[0].source}.${output.conditions[0].variable} ${output.conditions[0].comparison} [${output.conditions[0].values?.join(", ") || "..."}]`
          ) : (
            "Condição sem detalhes"
          )}
        </span>
        <div className="flex items-center text-sm text-purple-600">
          <ArrowRight className="h-4 w-4 mr-1" />
          {output.stateId}
        </div>
      </div>
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">Explorador de Estados</CardTitle>
          <div className="flex items-center space-x-4">
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Estados</SelectItem>
                <SelectItem value="root">Estados Raiz</SelectItem>
                <SelectItem value="scripts">Estados com Scripts</SelectItem>
                <SelectItem value="apis">Estados com APIs</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {filteredStates.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              Nenhum estado encontrado com os filtros aplicados
            </div>
          ) : (
            filteredStates.map((state: FlowState) => {
              const isExpanded = expandedStates.has(state.$id);
              const enteringActions = state.enteringCustomActions || [];
              const contentActions = state.actions || [];
              const leavingActions = state.leavingCustomActions || [];
              const outputs = state.outputs || [];
              const actionCount = enteringActions.length + contentActions.length + leavingActions.length;

              return (
                <Collapsible key={state.$id} open={isExpanded} onOpenChange={() => toggleStateExpansion(state.$id)}>
                  <CollapsibleTrigger asChild>
                    <div className="expandable-section">
                      <div className="expandable-header">
                        <div className="flex items-center space-x-4">
                          <div className={cn(
                            "w-3 h-3 rounded-full",
                            state.is_root ? "bg-emerald-500" : "bg-gray-400"
                          )} />
                          <div>
                            <h3 className="font-semibold text-gray-900">{state.$id}</h3>
                            {state.$title && (
                              <p className="text-sm text-gray-500">{state.$title}</p>
                            )}
                          </div>
                          <div className="flex space-x-2">
                            {state.is_root && (
                              <Badge variant="secondary">Root</Badge>
                            )}
                            {contentActions.some(a => a.type === "SendMessage") && (
                              <Badge className="bg-green-100 text-green-800">Send Message</Badge>
                            )}
                            {contentActions.some(a => a.type === "Input") && (
                              <Badge className="bg-orange-100 text-orange-800">Input</Badge>
                            )}
                            {enteringActions.some(a => a.type === "ExecuteScript") && (
                              <Badge className="bg-purple-100 text-purple-800">Script</Badge>
                            )}
                            {enteringActions.some(a => a.type === "ProcessHttp") && (
                              <Badge className="bg-blue-100 text-blue-800">HTTP</Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className="text-sm text-gray-500">{actionCount} ações</span>
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4 text-gray-400" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-gray-400" />
                          )}
                        </div>
                      </div>

                      <CollapsibleContent>
                        <div className="expandable-content">
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Entering Actions */}
                            <div>
                              <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                                <LogIn className="h-4 w-4 text-blue-500 mr-2" />
                                Ações de Entrada
                              </h4>
                              <div className="space-y-2">
                                {enteringActions.length > 0 ? (
                                  enteringActions.map(renderAction)
                                ) : (
                                  <div className="p-3 bg-gray-100 rounded-lg">
                                    <p className="text-sm text-gray-600">
                                      Nenhuma ação de entrada definida
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Content Actions */}
                            <div>
                              <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                                <MessageSquare className="h-4 w-4 text-green-500 mr-2" />
                                Ações de Conteúdo
                              </h4>
                              <div className="space-y-2">
                                {contentActions.length > 0 ? (
                                  contentActions.map(renderAction)
                                ) : (
                                  <div className="p-3 bg-gray-100 rounded-lg">
                                    <p className="text-sm text-gray-600">
                                      Nenhuma ação de conteúdo definida
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Leaving Actions */}
                            <div>
                              <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                                <LogOut className="h-4 w-4 text-orange-500 mr-2" />
                                Ações de Saída
                              </h4>
                              <div className="space-y-2">
                                {leavingActions.length > 0 ? (
                                  leavingActions.map(renderAction)
                                ) : (
                                  <div className="p-3 bg-gray-100 rounded-lg">
                                    <p className="text-sm text-gray-600">
                                      Nenhuma ação de saída definida
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Outputs/Conditions */}
                            <div>
                              <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                                <GitBranch className="h-4 w-4 text-purple-500 mr-2" />
                                Condições de Saída
                              </h4>
                              <div className="space-y-2">
                                {outputs.map(renderCondition)}
                                {state.defaultOutput && (
                                  <div className="p-3 bg-gray-100 rounded-lg">
                                    <div className="flex items-center justify-between">
                                      <span className="font-medium text-gray-700">Saída Padrão</span>
                                      <div className="flex items-center text-sm text-gray-600">
                                        <ArrowRight className="h-4 w-4 mr-1" />
                                        {state.defaultOutput.stateId}
                                      </div>
                                    </div>
                                  </div>
                                )}
                                {outputs.length === 0 && !state.defaultOutput && (
                                  <div className="p-3 bg-gray-100 rounded-lg">
                                    <p className="text-sm text-gray-600">
                                      Nenhuma condição de saída definida
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </CollapsibleContent>
                    </div>
                  </CollapsibleTrigger>
                </Collapsible>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}
