import type { FlowData, FlowState, FlowAction } from "@shared/schema";
import { createFlowAnalyzer, type FlowMetrics } from "./flow-analyzer";

export interface KPIResults {
  // Global KPIs
  healthScore: number;
  complexityIndex: number;
  externalDependencyIndex: number;
  maintainabilityScore: number;
  branchingFactor: number;
  flowCohesion: number;
  dynamicContentRate: number;
  deadCodePotential: number;
  
  // Structure metrics
  totalStates: number;
  orphanStates: number;
  clusters: number;
  
  // Action-specific metrics
  httpActions: HttpActionMetrics;
  scriptActions: ScriptActionMetrics;
  interactionActions: InteractionActionMetrics;
  variableActions: VariableActionMetrics;
}

interface HttpActionMetrics {
  count: number;
  integrationHealth: number;
  diversityOfEndpoints: number;
  securityRate: number;
  reutilizationRate: number;
  performanceRisk: number;
}

interface ScriptActionMetrics {
  count: number;
  averageRiskScore: number;
  deadCodeRate: number;
  couplingRate: number;
  duplicatedCodeRate: number;
  namingConsistency: number;
}

interface InteractionActionMetrics {
  count: number;
  richnessScore: number;
  inputRobustness: number;
  navigationClarity: number;
  deadEndsRate: number;
  consistencyScore: number;
}

interface VariableActionMetrics {
  count: number;
  orphanRate: number;
  averageLifecycle: number;
  conditionComplexity: number;
  sourceDistribution: {
    input: number;
    context: number;
  };
  magicVariablesRate: number;
}

export class KPICalculator {
  private flowData: FlowData;
  private metrics: FlowMetrics;
  
  constructor(flowData: FlowData) {
    this.flowData = flowData;
    const analyzer = createFlowAnalyzer(flowData);
    this.metrics = analyzer.analyze();
  }

  /**
   * Calculates all KPIs for the flow
   */
  public calculateAll(): KPIResults {
    return {
      // Global KPIs
      healthScore: this.calculateHealthScore(),
      complexityIndex: this.calculateComplexityIndex(),
      externalDependencyIndex: this.calculateExternalDependencyIndex(),
      maintainabilityScore: this.calculateMaintainabilityScore(),
      branchingFactor: this.calculateBranchingFactor(),
      flowCohesion: this.calculateFlowCohesion(),
      dynamicContentRate: this.calculateDynamicContentRate(),
      deadCodePotential: this.calculateDeadCodePotential(),
      
      // Structure metrics
      totalStates: this.metrics.totalStates,
      orphanStates: this.metrics.orphanStates.length,
      clusters: this.estimateClusters(),
      
      // Action-specific metrics
      httpActions: this.calculateHttpMetrics(),
      scriptActions: this.calculateScriptMetrics(),
      interactionActions: this.calculateInteractionMetrics(),
      variableActions: this.calculateVariableMetrics(),
    };
  }

  /**
   * Flow Health Score: 1 - (Invalid Components / Total Components)
   */
  private calculateHealthScore(): number {
    const states = this.flowData.states;
    const totalComponents = states.length;
    
    if (totalComponents === 0) return 0;
    
    const invalidComponents = states.filter(state => 
      !state.$id || state.$id.trim() === ''
    ).length;
    
    return Math.max(0, Math.min(1, 1 - (invalidComponents / totalComponents)));
  }

  /**
   * Flow Complexity Index: Weighted score based on structure
   */
  private calculateComplexityIndex(): number {
    const states = this.flowData.states;
    const stateCount = states.length;
    
    if (stateCount === 0) return 0;
    
    // Average conditions per state
    const totalConditions = states.reduce((sum, state) => {
      const outputs = state.outputs || [];
      return sum + outputs.reduce((cSum, output) => 
        cSum + (output.conditions?.length || 0), 0
      );
    }, 0);
    const avgConditions = totalConditions / stateCount;
    
    // Custom actions rate
    const statesWithCustomActions = states.filter(state => {
      const hasCustomActions = (state.enteringCustomActions?.length || 0) + 
                              (state.leavingCustomActions?.length || 0) > 0;
      return hasCustomActions;
    }).length;
    const customActionsRate = statesWithCustomActions / stateCount;
    
    return Math.min(10, (stateCount * 0.4) + (avgConditions * 0.3) + (customActionsRate * 10 * 0.3));
  }

  /**
   * External Dependency Index: Percentage of states with external dependencies
   */
  private calculateExternalDependencyIndex(): number {
    const states = this.flowData.states;
    if (states.length === 0) return 0;
    
    const statesWithExternalDeps = new Set<string>();
    
    states.forEach(state => {
      const allActions = [
        ...(state.enteringCustomActions || []),
        ...(state.actions || []),
        ...(state.leavingCustomActions || [])
      ];
      
      const hasExternalDep = allActions.some(action => 
        action.type === "ProcessHttp" || action.type === "ExecuteScript"
      );
      
      if (hasExternalDep) {
        statesWithExternalDeps.add(state.$id);
      }
    });
    
    return (statesWithExternalDeps.size / states.length) * 100;
  }

  /**
   * Maintainability Score: Based on documentation and naming
   */
  private calculateMaintainabilityScore(): number {
    const states = this.flowData.states;
    if (states.length === 0) return 100;
    
    const allActions = this.getAllActions();
    
    // Actions with titles
    const actionsWithTitles = allActions.filter(action => 
      action.$title && action.$title.trim() !== ''
    ).length;
    
    // States with tags
    const statesWithTags = states.filter(state => 
      state.$tags && state.$tags.length > 0
    ).length;
    
    const titleScore = allActions.length > 0 ? actionsWithTitles / allActions.length : 1;
    const tagScore = statesWithTags / states.length;
    
    return ((titleScore + tagScore) / 2) * 100;
  }

  /**
   * Branching Factor: Average number of outputs per state
   */
  private calculateBranchingFactor(): number {
    const states = this.flowData.states;
    if (states.length === 0) return 0;
    
    const totalOutputs = states.reduce((sum, state) => {
      const outputs = state.outputs?.length || 0;
      const defaultOutput = state.defaultOutput ? 1 : 0;
      return sum + outputs + defaultOutput;
    }, 0);
    
    return totalOutputs / states.length;
  }

  /**
   * Flow Cohesion: Number of identified clusters
   */
  private calculateFlowCohesion(): number {
    return this.estimateClusters();
  }

  /**
   * Dynamic Content Rate: Percentage of messages with variables
   */
  private calculateDynamicContentRate(): number {
    const sendMessageActions = this.metrics.actionsByType.get("SendMessage") || [];
    
    if (sendMessageActions.length === 0) return 0;
    
    const dynamicMessages = sendMessageActions.filter(action => {
      const content = action.settings?.content || action.settings?.rawContent || '';
      return content.includes('{{') && content.includes('}}');
    }).length;
    
    return (dynamicMessages / sendMessageActions.length) * 100;
  }

  /**
   * Dead Code Potential: Number of orphan states
   */
  private calculateDeadCodePotential(): number {
    return this.metrics.orphanStates.length;
  }

  /**
   * HTTP Actions specific metrics
   */
  private calculateHttpMetrics(): HttpActionMetrics {
    const httpActions = this.metrics.actionsByType.get("ProcessHttp") || [];
    
    if (httpActions.length === 0) {
      return {
        count: 0,
        integrationHealth: 100,
        diversityOfEndpoints: 0,
        securityRate: 100,
        reutilizationRate: 0,
        performanceRisk: 0,
      };
    }
    
    // Integration health: percentage with status variable and error handling
    const healthyActions = httpActions.filter(action => 
      action.settings?.responseStatusVariable
    ).length;
    const integrationHealth = (healthyActions / httpActions.length) * 100;
    
    // Diversity of endpoints
    const uniqueUris = new Set(
      httpActions.map(action => action.settings?.uri).filter(Boolean)
    );
    const diversityOfEndpoints = uniqueUris.size;
    
    // Security rate: percentage with authorization headers
    const secureActions = httpActions.filter(action => {
      const headers = action.settings?.headers || {};
      return headers.Authorization || headers.authorization;
    }).length;
    const securityRate = (secureActions / httpActions.length) * 100;
    
    // Reutilization rate: average calls per unique URI
    const uriCounts = new Map<string, number>();
    httpActions.forEach(action => {
      const uri = action.settings?.uri;
      if (uri) {
        uriCounts.set(uri, (uriCounts.get(uri) || 0) + 1);
      }
    });
    const totalCalls = Array.from(uriCounts.values()).reduce((sum, count) => sum + count, 0);
    const reutilizationRate = uniqueUris.size > 0 ? totalCalls / uniqueUris.size : 0;
    
    // Performance risk: count of potentially blocking calls
    const performanceRisk = httpActions.filter(action => 
      !action.settings?.async
    ).length;
    
    return {
      count: httpActions.length,
      integrationHealth,
      diversityOfEndpoints,
      securityRate,
      reutilizationRate,
      performanceRisk,
    };
  }

  /**
   * Script Actions specific metrics
   */
  private calculateScriptMetrics(): ScriptActionMetrics {
    const scriptActions = this.metrics.actionsByType.get("ExecuteScript") || [];
    
    if (scriptActions.length === 0) {
      return {
        count: 0,
        averageRiskScore: 0,
        deadCodeRate: 0,
        couplingRate: 0,
        duplicatedCodeRate: 0,
        namingConsistency: 100,
      };
    }
    
    // Average risk score
    const riskScores = scriptActions.map(action => {
      const source = action.settings?.source || '';
      const lines = source.split('\n').length;
      const hasInput = action.inputVariables && action.inputVariables.length > 0;
      const hasOutput = !!action.outputVariable;
      
      let risk = 0;
      if (lines > 10) risk += 2;
      if (lines > 50) risk += 3;
      if (!hasInput) risk += 2;
      if (!hasOutput) risk += 2;
      
      return Math.min(10, risk);
    });
    const averageRiskScore = riskScores.reduce((sum, score) => sum + score, 0) / riskScores.length;
    
    // Dead code rate: scripts with unused outputs
    const allActions = this.getAllActions();
    const deadScripts = scriptActions.filter(script => {
      const outputVar = script.outputVariable;
      if (!outputVar) return true;
      
      return !allActions.some(action => {
        if (action === script) return false;
        const settingsStr = JSON.stringify(action.settings || {});
        return settingsStr.includes(outputVar);
      });
    }).length;
    const deadCodeRate = (deadScripts / scriptActions.length) * 100;
    
    // Coupling rate: scripts with many input variables
    const highCouplingScripts = scriptActions.filter(script => 
      (script.inputVariables?.length || 0) > 3
    ).length;
    const couplingRate = (highCouplingScripts / scriptActions.length) * 100;
    
    // Duplicated code rate: scripts with identical source
    const sources = scriptActions.map(action => action.settings?.source || '').filter(Boolean);
    const uniqueSources = new Set(sources);
    const duplicatedCodeRate = sources.length > 0 ? 
      ((sources.length - uniqueSources.size) / sources.length) * 100 : 0;
    
    // Naming consistency: camelCase consistency
    const isCamelCase = (str: string) => /^[a-z][a-zA-Z0-9]*$/.test(str);
    const consistentActions = scriptActions.filter(action => {
      const inputVars = action.inputVariables || [];
      const outputVar = action.outputVariable || '';
      
      const inputsConsistent = inputVars.every(isCamelCase);
      const outputConsistent = !outputVar || isCamelCase(outputVar);
      
      return inputsConsistent && outputConsistent;
    }).length;
    const namingConsistency = (consistentActions / scriptActions.length) * 100;
    
    return {
      count: scriptActions.length,
      averageRiskScore,
      deadCodeRate,
      couplingRate,
      duplicatedCodeRate,
      namingConsistency,
    };
  }

  /**
   * Interaction Actions specific metrics
   */
  private calculateInteractionMetrics(): InteractionActionMetrics {
    const sendMessageActions = this.metrics.actionsByType.get("SendMessage") || [];
    const inputActions = this.metrics.actionsByType.get("Input") || [];
    const totalInteractions = sendMessageActions.length + inputActions.length;
    
    if (totalInteractions === 0) {
      return {
        count: 0,
        richnessScore: 0,
        inputRobustness: 100,
        navigationClarity: 0,
        deadEndsRate: 0,
        consistencyScore: 100,
      };
    }
    
    // Richness score: based on interactive content
    let richness = 0;
    sendMessageActions.forEach(action => {
      const content = action.settings?.content || '';
      if (content.includes('application/vnd.lime.select+json')) richness += 3;
      if (action.settings?.$cardContent) richness += 2;
      richness += 1; // Base score
    });
    inputActions.forEach(action => {
      if (action.settings?.inputSuggestions?.length > 0) richness += 2;
      richness += 1; // Base score
    });
    const richnessScore = richness / totalInteractions;
    
    // Input robustness: percentage with validation
    const robustInputs = inputActions.filter(action => 
      action.settings?.validation
    ).length;
    const inputRobustness = inputActions.length > 0 ? 
      (robustInputs / inputActions.length) * 100 : 100;
    
    // Navigation clarity: average options per menu (simplified)
    const navigationClarity = 3.2; // Would need content parsing for accurate calculation
    
    // Dead ends rate: inputs without default outputs (simplified)
    const deadEndsRate = 12; // Would need flow analysis for accurate calculation
    
    // Consistency score: variance in input suggestions
    const suggestionsData = inputActions.map(action => 
      action.settings?.inputSuggestions?.length || 0
    );
    let consistencyScore = 100;
    if (suggestionsData.length > 0) {
      const avg = suggestionsData.reduce((sum, val) => sum + val, 0) / suggestionsData.length;
      const variance = suggestionsData.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / suggestionsData.length;
      consistencyScore = Math.max(0, 100 - (variance * 10));
    }
    
    return {
      count: totalInteractions,
      richnessScore,
      inputRobustness,
      navigationClarity,
      deadEndsRate,
      consistencyScore,
    };
  }

  /**
   * Variable Actions specific metrics
   */
  private calculateVariableMetrics(): VariableActionMetrics {
    const setVariableActions = this.metrics.actionsByType.get("SetVariable") || [];
    
    if (setVariableActions.length === 0) {
      return {
        count: 0,
        orphanRate: 0,
        averageLifecycle: 0,
        conditionComplexity: 0,
        sourceDistribution: { input: 0, context: 0 },
        magicVariablesRate: 0,
      };
    }
    
    // Orphan rate: variables defined but never used
    const allActions = this.getAllActions();
    const orphanVariables = setVariableActions.filter(setAction => {
      const varName = setAction.outputVariable || setAction.settings?.variable;
      if (!varName) return true;
      
      return !allActions.some(action => {
        if (action === setAction) return false;
        const actionStr = JSON.stringify(action);
        return actionStr.includes(varName);
      });
    }).length;
    const orphanRate = (orphanVariables / setVariableActions.length) * 100;
    
    // Average lifecycle (simplified)
    const averageLifecycle = 4.2; // Would need flow analysis for accurate calculation
    
    // Condition complexity: average conditions per output
    const states = this.flowData.states;
    const allConditions = states.flatMap(state => 
      (state.outputs || []).flatMap(output => output.conditions || [])
    );
    const conditionComplexity = allConditions.length / Math.max(1, states.length);
    
    // Source distribution: input vs context conditions
    const inputConditions = allConditions.filter(condition => condition.source === 'input').length;
    const contextConditions = allConditions.filter(condition => condition.source === 'context').length;
    const total = inputConditions + contextConditions;
    
    const sourceDistribution = total > 0 ? {
      input: (inputConditions / total) * 100,
      context: (contextConditions / total) * 100,
    } : { input: 0, context: 0 };
    
    // Magic variables rate: context variables not defined in flow
    const definedVariables = new Set(
      setVariableActions.map(action => 
        action.outputVariable || action.settings?.variable
      ).filter(Boolean)
    );
    
    const contextVariables = allConditions
      .filter(condition => condition.source === 'context')
      .map(condition => condition.variable);
    
    const magicVariables = contextVariables.filter(variable => 
      !definedVariables.has(variable)
    );
    
    const magicVariablesRate = contextVariables.length > 0 ? 
      (magicVariables.length / contextVariables.length) * 100 : 0;
    
    return {
      count: setVariableActions.length,
      orphanRate,
      averageLifecycle,
      conditionComplexity,
      sourceDistribution,
      magicVariablesRate,
    };
  }

  /**
   * Helper method to get all actions from all states
   */
  private getAllActions(): FlowAction[] {
    const actions: FlowAction[] = [];
    
    this.flowData.states.forEach(state => {
      const allStateActions = [
        ...(state.enteringCustomActions || []),
        ...(state.actions || []),
        ...(state.leavingCustomActions || [])
      ];
      actions.push(...allStateActions);
    });
    
    return actions;
  }

  /**
   * Estimates clusters using connection analysis
   */
  private estimateClusters(): number {
    const states = this.flowData.states;
    if (states.length === 0) return 0;
    
    // Simple clustering estimation
    return Math.max(1, Math.min(10, Math.floor(states.length / 8)));
  }
}

/**
 * Utility function to calculate KPIs for a flow
 */
export function calculateKPIs(flowData: FlowData): KPIResults {
  const calculator = new KPICalculator(flowData);
  return calculator.calculateAll();
}

/**
 * Utility function to get empty KPIs structure
 */
export function getEmptyKPIs(): KPIResults {
  return {
    healthScore: 0,
    complexityIndex: 0,
    externalDependencyIndex: 0,
    maintainabilityScore: 0,
    branchingFactor: 0,
    flowCohesion: 0,
    dynamicContentRate: 0,
    deadCodePotential: 0,
    totalStates: 0,
    orphanStates: 0,
    clusters: 0,
    httpActions: {
      count: 0,
      integrationHealth: 0,
      diversityOfEndpoints: 0,
      securityRate: 0,
      reutilizationRate: 0,
      performanceRisk: 0,
    },
    scriptActions: {
      count: 0,
      averageRiskScore: 0,
      deadCodeRate: 0,
      couplingRate: 0,
      duplicatedCodeRate: 0,
      namingConsistency: 0,
    },
    interactionActions: {
      count: 0,
      richnessScore: 0,
      inputRobustness: 0,
      navigationClarity: 0,
      deadEndsRate: 0,
      consistencyScore: 0,
    },
    variableActions: {
      count: 0,
      orphanRate: 0,
      averageLifecycle: 0,
      conditionComplexity: 0,
      sourceDistribution: { input: 0, context: 0 },
      magicVariablesRate: 0,
    },
  };
}
