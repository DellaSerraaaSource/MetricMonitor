import type { FlowData, FlowState, FlowAction, FlowOutput } from "@shared/schema";

// Compatibility interface for normalized state structure
export interface NormalizedFlowState {
  $id: string;
  $title?: string;
  $position?: { x: number; y: number };
  $tags?: string[];
  is_root?: boolean;
  enteringCustomActions?: FlowAction[];
  actions?: FlowAction[];
  leavingCustomActions?: FlowAction[];
  outputs?: FlowOutput[];
  defaultOutput?: FlowOutput;
}

export interface FlowMetrics {
  totalStates: number;
  rootStates: NormalizedFlowState[];
  orphanStates: NormalizedFlowState[];
  actionsByType: Map<string, FlowAction[]>;
  stateConnections: Map<string, string[]>;
  variableUsage: Map<string, { defined: string[], used: string[] }>;
  endpoints: Set<string>;
  riskFactors: RiskFactor[];
}

export interface RiskFactor {
  type: "high_risk_script" | "performance_risk" | "dead_code" | "security_risk";
  severity: "low" | "medium" | "high";
  location: string;
  description: string;
  recommendation: string;
}

export class FlowAnalyzer {
  private flowData: FlowData;
  private normalizedStates: NormalizedFlowState[];
  
  constructor(flowData: FlowData) {
    this.flowData = flowData;
    this.normalizedStates = this.normalizeFlowData(flowData);
  }

  /**
   * Normalizes flow data to work with both old and new formats
   */
  private normalizeFlowData(flowData: FlowData): NormalizedFlowState[] {
    // Check if it's the new format with flow object
    if ((flowData as any).flow) {
      const flowStates = (flowData as any).flow;
      const stateIds = Object.keys(flowStates);
      
      return stateIds.map(stateId => ({
        $id: stateId,
        $title: flowStates[stateId].$title,
        $position: flowStates[stateId].$position,
        $tags: flowStates[stateId].$tags,
        is_root: stateId === 'onboarding' || stateId.includes('inicio') || stateId.includes('start'),
        enteringCustomActions: flowStates[stateId].$enteringCustomActions || [],
        actions: flowStates[stateId].$contentActions || [],
        leavingCustomActions: flowStates[stateId].$leavingCustomActions || [],
        outputs: flowStates[stateId].$conditionOutputs || [],
        defaultOutput: flowStates[stateId].$defaultOutput,
      }));
    }
    
    // Fallback for old format (if states array exists)
    return (flowData as any).states || [];
  }

  /**
   * Performs comprehensive analysis of the flow
   */
  public analyze(): FlowMetrics {
    return {
      totalStates: this.normalizedStates.length,
      rootStates: this.findRootStates(),
      orphanStates: this.findOrphanStates(),
      actionsByType: this.categorizeActions(),
      stateConnections: this.buildConnectionMap(),
      variableUsage: this.analyzeVariableUsage(),
      endpoints: this.extractEndpoints(),
      riskFactors: this.identifyRiskFactors(),
    };
  }

  /**
   * Finds states marked as root or entry points
   */
  private findRootStates(): NormalizedFlowState[] {
    return this.normalizedStates.filter(state => state.is_root === true);
  }

  /**
   * Identifies unreachable states (orphan states)
   */
  private findOrphanStates(): NormalizedFlowState[] {
    const reachableStates = new Set<string>();
    const rootStates = this.findRootStates();
    
    // BFS to find all reachable states
    const queue = [...rootStates.map(state => state.$id)];
    
    while (queue.length > 0) {
      const currentStateId = queue.shift()!;
      if (reachableStates.has(currentStateId)) continue;
      
      reachableStates.add(currentStateId);
      
      const currentState = this.normalizedStates.find(state => state.$id === currentStateId);
      if (currentState) {
        // Add outputs
        const outputs = currentState.outputs || [];
        outputs.forEach(output => {
          if (output.stateId && !reachableStates.has(output.stateId)) {
            queue.push(output.stateId);
          }
        });
        
        // Add default output
        if (currentState.defaultOutput?.stateId && !reachableStates.has(currentState.defaultOutput.stateId)) {
          queue.push(currentState.defaultOutput.stateId);
        }
      }
    }
    
    return this.normalizedStates.filter(state => !reachableStates.has(state.$id));
  }

  /**
   * Categorizes all actions by type
   */
  private categorizeActions(): Map<string, FlowAction[]> {
    const actionsByType = new Map<string, FlowAction[]>();
    
    this.normalizedStates.forEach(state => {
      const allActions = [
        ...(state.enteringCustomActions || []),
        ...(state.actions || []),
        ...(state.leavingCustomActions || [])
      ];
      
      allActions.forEach(action => {
        const type = action.type;
        if (!actionsByType.has(type)) {
          actionsByType.set(type, []);
        }
        actionsByType.get(type)!.push({
          ...action,
          stateId: state.$id // Add context
        } as any);
      });
    });
    
    return actionsByType;
  }

  /**
   * Builds a map of state connections
   */
  private buildConnectionMap(): Map<string, string[]> {
    const connections = new Map<string, string[]>();
    
    this.normalizedStates.forEach(state => {
      const stateConnections: string[] = [];
      
      // Add outputs
      const outputs = state.outputs || [];
      outputs.forEach(output => {
        if (output.stateId) {
          stateConnections.push(output.stateId);
        }
      });
      
      // Add default output
      if (state.defaultOutput?.stateId) {
        stateConnections.push(state.defaultOutput.stateId);
      }
      
      connections.set(state.$id, stateConnections);
    });
    
    return connections;
  }

  /**
   * Analyzes variable definition and usage patterns
   */
  private analyzeVariableUsage(): Map<string, { defined: string[], used: string[] }> {
    const variableUsage = new Map<string, { defined: string[], used: string[] }>();
    
    const getVariableEntry = (varName: string) => {
      if (!variableUsage.has(varName)) {
        variableUsage.set(varName, { defined: [], used: [] });
      }
      return variableUsage.get(varName)!;
    };
    
    this.normalizedStates.forEach(state => {
      const allActions = [
        ...(state.enteringCustomActions || []),
        ...(state.actions || []),
        ...(state.leavingCustomActions || [])
      ];
      
      allActions.forEach(action => {
        // Track variable definitions
        if (action.outputVariable) {
          getVariableEntry(action.outputVariable).defined.push(state.$id);
        }
        
        if (action.type === "SetVariable" && action.settings?.variable) {
          getVariableEntry(action.settings.variable).defined.push(state.$id);
        }
        
        // Track variable usage
        if (action.inputVariables) {
          action.inputVariables.forEach(varName => {
            getVariableEntry(varName).used.push(state.$id);
          });
        }
        
        // Check settings for variable references
        const settingsStr = JSON.stringify(action.settings || {});
        const variableRefs = settingsStr.match(/\{\{([^}]+)\}\}/g) || [];
        variableRefs.forEach(ref => {
          const varName = ref.replace(/\{\{|\}\}/g, '').trim();
          getVariableEntry(varName).used.push(state.$id);
        });
      });
      
      // Track variable usage in conditions
      const outputs = state.outputs || [];
      outputs.forEach(output => {
        const conditions = output.conditions || [];
        conditions.forEach(condition => {
          const varName = `${condition.source}.${condition.variable}`;
          getVariableEntry(varName).used.push(state.$id);
        });
      });
    });
    
    return variableUsage;
  }

  /**
   * Extracts unique API endpoints
   */
  private extractEndpoints(): Set<string> {
    const endpoints = new Set<string>();
    
    this.normalizedStates.forEach(state => {
      const allActions = [
        ...(state.enteringCustomActions || []),
        ...(state.actions || []),
        ...(state.leavingCustomActions || [])
      ];
      
      allActions.forEach(action => {
        if (action.type === "ProcessHttp" && action.settings?.uri) {
          endpoints.add(action.settings.uri);
        }
      });
    });
    
    return endpoints;
  }

  /**
   * Identifies potential risk factors in the flow
   */
  private identifyRiskFactors(): RiskFactor[] {
    const risks: RiskFactor[] = [];
    
    this.normalizedStates.forEach(state => {
      const allActions = [
        ...(state.enteringCustomActions || []),
        ...(state.actions || []),
        ...(state.leavingCustomActions || [])
      ];
      
      allActions.forEach(action => {
        // High-risk scripts
        if (action.type === "ExecuteScript") {
          const source = action.settings?.source || "";
          const lines = source.split('\n').length;
          const hasInput = action.inputVariables && action.inputVariables.length > 0;
          const hasOutput = !!action.outputVariable;
          
          let severity: "low" | "medium" | "high" = "low";
          let description = "Script customizado detectado";
          
          if (lines > 50 || !hasInput || !hasOutput) {
            severity = "high";
            description = `Script complexo (${lines} linhas)${!hasInput ? ', sem inputs' : ''}${!hasOutput ? ', sem output' : ''}`;
          } else if (lines > 20) {
            severity = "medium";
            description = `Script médio (${lines} linhas)`;
          }
          
          risks.push({
            type: "high_risk_script",
            severity,
            location: `${state.$id} - ${action.$title || 'Script sem título'}`,
            description,
            recommendation: "Revisar complexidade e adicionar documentação apropriada"
          });
        }
        
        // Performance risks
        if (action.type === "ProcessHttp" && !action.settings?.async) {
          risks.push({
            type: "performance_risk",
            severity: "medium",
            location: `${state.$id} - ${action.$title || 'Chamada HTTP'}`,
            description: "Chamada HTTP síncrona pode causar bloqueio",
            recommendation: "Considerar implementar modo assíncrono ou timeout"
          });
        }
        
        // Security risks
        if (action.type === "ProcessHttp") {
          const headers = action.settings?.headers || {};
          const hasAuth = headers.Authorization || headers.authorization;
          
          if (!hasAuth) {
            risks.push({
              type: "security_risk",
              severity: "medium",
              location: `${state.$id} - ${action.$title || 'Chamada HTTP'}`,
              description: "Chamada HTTP sem autenticação detectada",
              recommendation: "Verificar se autenticação é necessária para este endpoint"
            });
          }
        }
      });
    });
    
    // Dead code detection
    const orphans = this.findOrphanStates();
    orphans.forEach(state => {
      risks.push({
        type: "dead_code",
        severity: "low",
        location: state.$id,
        description: "Estado não alcançável detectado",
        recommendation: "Remover estado órfão ou adicionar conexão apropriada"
      });
    });
    
    return risks;
  }

  /**
   * Calculates flow complexity based on structure
   */
  public calculateComplexity(): number {
    const stateCount = this.normalizedStates.length;
    
    // Calculate average conditions per state
    const totalConditions = this.normalizedStates.reduce((sum, state) => {
      const outputs = state.outputs || [];
      return sum + outputs.reduce((cSum, output) => {
        return cSum + (output.conditions?.length || 0);
      }, 0);
    }, 0);
    
    const avgConditions = totalConditions / Math.max(1, stateCount);
    
    // Calculate custom actions rate
    const statesWithCustomActions = this.normalizedStates.filter(state => {
      const hasCustomActions = (state.enteringCustomActions?.length || 0) + 
                              (state.leavingCustomActions?.length || 0) > 0;
      return hasCustomActions;
    }).length;
    
    const customActionsRate = statesWithCustomActions / Math.max(1, stateCount);
    
    // Weighted complexity score
    return Math.min(10, (stateCount * 0.4) + (avgConditions * 0.3) + (customActionsRate * 10 * 0.3));
  }

  /**
   * Estimates the number of logical clusters in the flow
   */
  public estimateClusters(): number {
    const states = this.normalizedStates;
    const connections = this.buildConnectionMap();
    
    // Simple clustering based on connection density
    // In a real implementation, this would use graph clustering algorithms
    const clusters = new Set<string>();
    const visited = new Set<string>();
    
    const dfs = (stateId: string, clusterId: string) => {
      if (visited.has(stateId)) return;
      visited.add(stateId);
      
      const stateConnections = connections.get(stateId) || [];
      if (stateConnections.length > 0) {
        clusters.add(clusterId);
        stateConnections.forEach(connectedState => {
          if (!visited.has(connectedState)) {
            dfs(connectedState, clusterId);
          }
        });
      }
    };
    
    states.forEach((state: any) => {
      if (!visited.has(state.$id)) {
        dfs(state.$id, state.$id);
      }
    });
    
    return Math.max(1, Math.min(clusters.size, Math.floor(states.length / 5)));
  }

  /**
   * Analyzes branching factor (average number of outputs per state)
   */
  public calculateBranchingFactor(): number {
    const states = this.normalizedStates;
    const totalOutputs = states.reduce((sum: any, state: any) => {
      return sum + (state.outputs?.length || 0) + (state.defaultOutput ? 1 : 0);
    }, 0);
    
    return totalOutputs / Math.max(1, states.length);
  }

  /**
   * Calculates dynamic content rate
   */
  public calculateDynamicContentRate(): number {
    const actionsByType = this.categorizeActions();
    const sendMessageActions = actionsByType.get("SendMessage") || [];
    
    if (sendMessageActions.length === 0) return 0;
    
    const dynamicMessages = sendMessageActions.filter(action => {
      const content = action.settings?.content || action.settings?.rawContent || '';
      return content.includes('{{') && content.includes('}}');
    }).length;
    
    return (dynamicMessages / sendMessageActions.length) * 100;
  }
}

/**
 * Utility function to create a FlowAnalyzer instance
 */
export function createFlowAnalyzer(flowData: FlowData): FlowAnalyzer {
  return new FlowAnalyzer(flowData);
}

/**
 * Quick analysis function for basic metrics
 */
export function quickAnalyze(flowData: FlowData) {
  const analyzer = new FlowAnalyzer(flowData);
  const metrics = analyzer.analyze();
  
  return {
    ...metrics,
    complexity: analyzer.calculateComplexity(),
    clusters: analyzer.estimateClusters(),
    branchingFactor: analyzer.calculateBranchingFactor(),
    dynamicContentRate: analyzer.calculateDynamicContentRate(),
  };
}
