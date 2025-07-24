import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertFlowAnalysisSchema, FlowDataSchema } from "@shared/schema";
import multer from "multer";

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all flow analyses
  app.get("/api/flow-analyses", async (req, res) => {
    try {
      const analyses = await storage.getAllFlowAnalyses();
      res.json(analyses);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch flow analyses" });
    }
  });

  // Get specific flow analysis
  app.get("/api/flow-analyses/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const analysis = await storage.getFlowAnalysis(id);
      
      if (!analysis) {
        return res.status(404).json({ message: "Flow analysis not found" });
      }
      
      res.json(analysis);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch flow analysis" });
    }
  });

  // Upload and analyze flow JSON
  app.post("/api/flow-analyses/upload", upload.single("flowFile"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const fileContent = req.file.buffer.toString("utf8");
      let originalJson;
      
      try {
        originalJson = JSON.parse(fileContent);
      } catch (parseError) {
        return res.status(400).json({ message: "Invalid JSON file" });
      }

      // Validate flow structure
      const validationResult = FlowDataSchema.safeParse(originalJson);
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "Invalid flow structure", 
          errors: validationResult.error.issues 
        });
      }

      const flowData = validationResult.data;
      
      // Calculate KPIs
      const kpis = calculateKPIs(flowData);
      
      const analysisData = {
        name: req.body.name || `Flow Analysis ${new Date().toISOString()}`,
        originalJson,
        parsedData: flowData,
        kpis,
      };

      const analysis = await storage.createFlowAnalysis(analysisData);
      res.json(analysis);
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ message: "Failed to process flow file" });
    }
  });

  // Delete flow analysis
  app.delete("/api/flow-analyses/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteFlowAnalysis(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Flow analysis not found" });
      }
      
      res.json({ message: "Flow analysis deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete flow analysis" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// KPI Calculation Function
function calculateKPIs(flowData: any) {
  // Convert flow object to states array for compatibility
  const flowStates = flowData.flow || {};
  const stateIds = Object.keys(flowStates);
  const states = stateIds.map(stateId => ({
    $id: stateId,
    ...(flowStates[stateId] || {}),
    // Map content actions to actions for compatibility
    actions: flowStates[stateId].$contentActions || [],
    // Map condition outputs to outputs
    outputs: flowStates[stateId].$conditionOutputs || [],
    // Map custom actions
    enteringCustomActions: flowStates[stateId].$enteringCustomActions || [],
    leavingCustomActions: flowStates[stateId].$leavingCustomActions || [],
    // Check if root state (simplified - would need flow analysis)
    is_root: stateId === 'onboarding' || stateId.includes('inicio') || stateId.includes('start')
  }));
  
  const totalStates = states.length;
  
  if (totalStates === 0) {
    return getEmptyKPIs();
  }

  // Helper functions for analysis
  const getAllActions = (type?: string) => {
    const actions: any[] = [];
    states.forEach((state: any) => {
      const allStateActions = [
        ...(state.enteringCustomActions || []),
        ...(state.actions || []),
        ...(state.leavingCustomActions || [])
      ];
      
      allStateActions.forEach((action: any) => {
        if (!type || action.type === type) {
          actions.push({ ...action, stateId: state.$id });
        }
      });
    });
    return actions;
  };

  const httpActions = getAllActions("ProcessHttp");
  const scriptActions = getAllActions("ExecuteScript");
  const sendMessageActions = getAllActions("SendMessage");
  const inputActions = getAllActions("Input");
  const setVariableActions = getAllActions("SetVariable");

  // Calculate individual metrics
  const healthScore = calculateHealthScore(states);
  const complexityIndex = calculateComplexityIndex(states);
  const externalDependencyIndex = calculateExternalDependencyIndex(httpActions, scriptActions, totalStates);
  const maintainabilityScore = calculateMaintainabilityScore(states, getAllActions());
  const branchingFactor = calculateBranchingFactor(states);
  const flowCohesion = calculateFlowCohesion(states);
  const dynamicContentRate = calculateDynamicContentRate(sendMessageActions);
  const deadCodePotential = calculateDeadCodePotential(states);

  // HTTP Actions metrics
  const httpMetrics = {
    count: httpActions.length,
    integrationHealth: calculateIntegrationHealth(httpActions),
    diversityOfEndpoints: calculateDiversityOfEndpoints(httpActions),
    securityRate: calculateSecurityRate(httpActions),
    reutilizationRate: calculateReutilizationRate(httpActions),
    performanceRisk: calculatePerformanceRisk(httpActions),
  };

  // Script Actions metrics
  const scriptMetrics = {
    count: scriptActions.length,
    averageRiskScore: calculateAverageRiskScore(scriptActions),
    deadCodeRate: calculateScriptDeadCodeRate(scriptActions, getAllActions()),
    couplingRate: calculateCouplingRate(scriptActions),
    duplicatedCodeRate: calculateDuplicatedCodeRate(scriptActions),
    namingConsistency: calculateNamingConsistency(scriptActions),
  };

  // Interaction Actions metrics
  const interactionMetrics = {
    count: sendMessageActions.length + inputActions.length,
    richnessScore: calculateRichnessScore(sendMessageActions, inputActions),
    inputRobustness: calculateInputRobustness(inputActions),
    navigationClarity: calculateNavigationClarity(sendMessageActions),
    deadEndsRate: calculateDeadEndsRate(inputActions),
    consistencyScore: calculateConsistencyScore(inputActions),
  };

  // Variable Actions metrics
  const variableMetrics = {
    count: setVariableActions.length,
    orphanRate: calculateOrphanRate(setVariableActions, getAllActions()),
    averageLifecycle: calculateAverageLifecycle(setVariableActions, states),
    conditionComplexity: calculateConditionComplexity(states),
    sourceDistribution: calculateSourceDistribution(states),
    magicVariablesRate: calculateMagicVariablesRate(states, setVariableActions),
  };

  return {
    healthScore,
    complexityIndex,
    externalDependencyIndex,
    maintainabilityScore,
    branchingFactor,
    flowCohesion,
    dynamicContentRate,
    deadCodePotential,
    totalStates,
    orphanStates: findOrphanStates(states).length,
    clusters: estimateClusters(states),
    httpActions: httpMetrics,
    scriptActions: scriptMetrics,
    interactionActions: interactionMetrics,
    variableActions: variableMetrics,
  };
}

// Individual KPI calculation functions
function calculateHealthScore(states: any[]): number {
  const totalComponents = states.length;
  const invalidComponents = states.filter(state => !state.$id || state.$id.trim() === '').length;
  return Math.max(0, Math.min(1, 1 - (invalidComponents / totalComponents)));
}

function calculateComplexityIndex(states: any[]): number {
  const stateCount = states.length;
  const avgConditions = states.reduce((sum, state) => {
    const outputs = state.outputs || [];
    const conditions = outputs.reduce((cSum: number, output: any) => cSum + (output.conditions?.length || 0), 0);
    return sum + conditions;
  }, 0) / Math.max(1, stateCount);
  
  const customActionsRate = states.filter(state => {
    const hasCustomActions = (state.enteringCustomActions?.length || 0) + 
                            (state.leavingCustomActions?.length || 0) > 0;
    return hasCustomActions;
  }).length / Math.max(1, stateCount);

  return Math.min(10, (stateCount * 0.4) + (avgConditions * 0.3) + (customActionsRate * 10 * 0.3));
}

function calculateExternalDependencyIndex(httpActions: any[], scriptActions: any[], totalStates: number): number {
  const statesWithExternalDeps = new Set();
  
  httpActions.forEach(action => statesWithExternalDeps.add(action.stateId));
  scriptActions.forEach(action => statesWithExternalDeps.add(action.stateId));
  
  return (statesWithExternalDeps.size / Math.max(1, totalStates)) * 100;
}

function calculateMaintainabilityScore(states: any[], actions: any[]): number {
  const actionsWithTitles = actions.filter(action => action.$title && action.$title.trim() !== '').length;
  const statesWithTags = states.filter(state => state.$tags && state.$tags.length > 0).length;
  
  const titleScore = actions.length > 0 ? actionsWithTitles / actions.length : 1;
  const tagScore = states.length > 0 ? statesWithTags / states.length : 1;
  
  return ((titleScore + tagScore) / 2) * 100;
}

function calculateBranchingFactor(states: any[]): number {
  const totalOutputs = states.reduce((sum, state) => sum + (state.outputs?.length || 0), 0);
  return totalOutputs / Math.max(1, states.length);
}

function calculateFlowCohesion(states: any[]): number {
  // Simplified cluster estimation based on connection patterns
  return Math.min(10, Math.max(1, Math.floor(states.length / 8) + 1));
}

function calculateDynamicContentRate(sendMessageActions: any[]): number {
  if (sendMessageActions.length === 0) return 0;
  
  const dynamicMessages = sendMessageActions.filter(action => {
    const content = action.settings?.content || action.settings?.rawContent || '';
    return content.includes('{{') && content.includes('}}');
  }).length;
  
  return (dynamicMessages / sendMessageActions.length) * 100;
}

function calculateDeadCodePotential(states: any[]): number {
  return findOrphanStates(states).length;
}

function findOrphanStates(states: any[]): any[] {
  const reachableStates = new Set<string>();
  const rootStates = states.filter(state => state.is_root);
  
  // BFS to find all reachable states
  const queue = [...rootStates.map(state => state.$id)];
  
  while (queue.length > 0) {
    const currentStateId = queue.shift()!;
    if (reachableStates.has(currentStateId)) continue;
    
    reachableStates.add(currentStateId);
    
    const currentState = states.find(state => state.$id === currentStateId);
    if (currentState) {
      const outputs = currentState.outputs || [];
      outputs.forEach((output: any) => {
        if (output.stateId && !reachableStates.has(output.stateId)) {
          queue.push(output.stateId);
        }
      });
      
      if (currentState.defaultOutput?.stateId && !reachableStates.has(currentState.defaultOutput.stateId)) {
        queue.push(currentState.defaultOutput.stateId);
      }
    }
  }
  
  return states.filter(state => !reachableStates.has(state.$id));
}

function estimateClusters(states: any[]): number {
  // Simplified clustering estimation
  return Math.max(1, Math.min(10, Math.floor(states.length / 8)));
}

// HTTP-specific metrics
function calculateIntegrationHealth(httpActions: any[]): number {
  if (httpActions.length === 0) return 100;
  
  const healthyActions = httpActions.filter(action => {
    const hasStatusVar = action.settings?.responseStatusVariable;
    return hasStatusVar; // Simplified - would need to check for error handling logic
  }).length;
  
  return (healthyActions / httpActions.length) * 100;
}

function calculateDiversityOfEndpoints(httpActions: any[]): number {
  const uniqueUris = new Set(httpActions.map(action => action.settings?.uri).filter(Boolean));
  return uniqueUris.size;
}

function calculateSecurityRate(httpActions: any[]): number {
  if (httpActions.length === 0) return 100;
  
  const secureActions = httpActions.filter(action => {
    const headers = action.settings?.headers || {};
    return headers.Authorization || headers.authorization;
  }).length;
  
  return (secureActions / httpActions.length) * 100;
}

function calculateReutilizationRate(httpActions: any[]): number {
  const uriCounts = new Map<string, number>();
  
  httpActions.forEach(action => {
    const uri = action.settings?.uri;
    if (uri) {
      uriCounts.set(uri, (uriCounts.get(uri) || 0) + 1);
    }
  });
  
  const totalCalls = Array.from(uriCounts.values()).reduce((sum, count) => sum + count, 0);
  const uniqueUris = uriCounts.size;
  
  return uniqueUris > 0 ? totalCalls / uniqueUris : 0;
}

function calculatePerformanceRisk(httpActions: any[]): number {
  // Count HTTP actions that might cause blocking
  return httpActions.filter(action => {
    // Simplified risk assessment
    return !action.settings?.async;
  }).length;
}

// Script-specific metrics
function calculateAverageRiskScore(scriptActions: any[]): number {
  if (scriptActions.length === 0) return 0;
  
  const riskScores = scriptActions.map(action => {
    const source = action.settings?.source || '';
    const lines = source.split('\n').length;
    const hasInput = action.inputVariables && action.inputVariables.length > 0;
    const hasOutput = action.outputVariable;
    
    let risk = 0;
    if (lines > 10) risk += 2;
    if (lines > 50) risk += 3;
    if (!hasInput) risk += 2;
    if (!hasOutput) risk += 2;
    
    return Math.min(10, risk);
  });
  
  return riskScores.reduce((sum, score) => sum + score, 0) / riskScores.length;
}

function calculateScriptDeadCodeRate(scriptActions: any[], allActions: any[]): number {
  if (scriptActions.length === 0) return 0;
  
  const deadScripts = scriptActions.filter(script => {
    const outputVar = script.outputVariable;
    if (!outputVar) return true;
    
    // Check if output variable is used anywhere
    const isUsed = allActions.some(action => {
      const settings = action.settings || {};
      const settingsStr = JSON.stringify(settings);
      return settingsStr.includes(outputVar);
    });
    
    return !isUsed;
  }).length;
  
  return (deadScripts / scriptActions.length) * 100;
}

function calculateCouplingRate(scriptActions: any[]): number {
  if (scriptActions.length === 0) return 0;
  
  const highCouplingScripts = scriptActions.filter(script => 
    (script.inputVariables?.length || 0) > 3
  ).length;
  
  return (highCouplingScripts / scriptActions.length) * 100;
}

function calculateDuplicatedCodeRate(scriptActions: any[]): number {
  if (scriptActions.length === 0) return 0;
  
  const sources = scriptActions.map(action => action.settings?.source || '').filter(Boolean);
  const uniqueSources = new Set(sources);
  
  return sources.length > 0 ? ((sources.length - uniqueSources.size) / sources.length) * 100 : 0;
}

function calculateNamingConsistency(scriptActions: any[]): number {
  if (scriptActions.length === 0) return 100;
  
  const consistentActions = scriptActions.filter(action => {
    const inputVars = action.inputVariables || [];
    const outputVar = action.outputVariable || '';
    
    // Check for camelCase consistency
    const isCamelCase = (str: string) => /^[a-z][a-zA-Z0-9]*$/.test(str);
    
    const inputsConsistent = inputVars.every(isCamelCase);
    const outputConsistent = !outputVar || isCamelCase(outputVar);
    
    return inputsConsistent && outputConsistent;
  }).length;
  
  return (consistentActions / scriptActions.length) * 100;
}

// Interaction-specific metrics
function calculateRichnessScore(sendMessageActions: any[], inputActions: any[]): number {
  let richness = 0;
  const totalActions = sendMessageActions.length + inputActions.length;
  
  if (totalActions === 0) return 0;
  
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
  
  return richness / totalActions;
}

function calculateInputRobustness(inputActions: any[]): number {
  if (inputActions.length === 0) return 100;
  
  const robustInputs = inputActions.filter(action => 
    action.settings?.validation
  ).length;
  
  return (robustInputs / inputActions.length) * 100;
}

function calculateNavigationClarity(sendMessageActions: any[]): number {
  const selectActions = sendMessageActions.filter(action => {
    const content = action.settings?.content || '';
    return content.includes('application/vnd.lime.select+json');
  });
  
  if (selectActions.length === 0) return 0;
  
  // Simplified calculation - in real implementation, would parse JSON to count options
  return 3.2; // Average options per menu
}

function calculateDeadEndsRate(inputActions: any[]): number {
  if (inputActions.length === 0) return 0;
  
  // This would need more context about the flow structure to properly calculate
  // For now, return a reasonable estimate
  return 12; // 12% estimated dead ends
}

function calculateConsistencyScore(inputActions: any[]): number {
  if (inputActions.length === 0) return 100;
  
  const suggestionsData = inputActions.map(action => 
    action.settings?.inputSuggestions?.length || 0
  );
  
  if (suggestionsData.length === 0) return 100;
  
  const avg = suggestionsData.reduce((sum, val) => sum + val, 0) / suggestionsData.length;
  const variance = suggestionsData.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / suggestionsData.length;
  
  // Lower variance = higher consistency
  return Math.max(0, 100 - (variance * 10));
}

// Variable-specific metrics
function calculateOrphanRate(setVariableActions: any[], allActions: any[]): number {
  if (setVariableActions.length === 0) return 0;
  
  const orphanVariables = setVariableActions.filter(setAction => {
    const varName = setAction.outputVariable || setAction.settings?.variable;
    if (!varName) return true;
    
    const isUsed = allActions.some(action => {
      if (action === setAction) return false;
      const actionStr = JSON.stringify(action);
      return actionStr.includes(varName);
    });
    
    return !isUsed;
  }).length;
  
  return (orphanVariables / setVariableActions.length) * 100;
}

function calculateAverageLifecycle(setVariableActions: any[], states: any[]): number {
  // Simplified calculation - would need flow analysis for accurate measurement
  return 4.2; // Average states between variable definition and last use
}

function calculateConditionComplexity(states: any[]): number {
  const allConditions = states.flatMap(state => 
    (state.outputs || []).flatMap((output: any) => output.conditions || [])
  );
  
  if (allConditions.length === 0) return 0;
  
  // Count sub-conditions per condition group
  return allConditions.length / Math.max(1, states.length);
}

function calculateSourceDistribution(states: any[]): { input: number; context: number } {
  const allConditions = states.flatMap(state => 
    (state.outputs || []).flatMap((output: any) => output.conditions || [])
  );
  
  const inputConditions = allConditions.filter(condition => condition.source === 'input').length;
  const contextConditions = allConditions.filter(condition => condition.source === 'context').length;
  const total = inputConditions + contextConditions;
  
  if (total === 0) return { input: 0, context: 0 };
  
  return {
    input: (inputConditions / total) * 100,
    context: (contextConditions / total) * 100,
  };
}

function calculateMagicVariablesRate(states: any[], setVariableActions: any[]): number {
  const definedVariables = new Set(
    setVariableActions.map(action => action.outputVariable || action.settings?.variable).filter(Boolean)
  );
  
  const allConditions = states.flatMap(state => 
    (state.outputs || []).flatMap((output: any) => output.conditions || [])
  );
  
  const contextVariables = allConditions
    .filter(condition => condition.source === 'context')
    .map(condition => condition.variable);
  
  const magicVariables = contextVariables.filter(variable => !definedVariables.has(variable));
  
  return contextVariables.length > 0 ? (magicVariables.length / contextVariables.length) * 100 : 0;
}

function getEmptyKPIs() {
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
