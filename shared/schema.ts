import { pgTable, text, serial, jsonb, timestamp, integer, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const flowAnalyses = pgTable("flow_analyses", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  originalJson: jsonb("original_json").notNull(),
  parsedData: jsonb("parsed_data").notNull(),
  kpis: jsonb("kpis").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertFlowAnalysisSchema = createInsertSchema(flowAnalyses).omit({
  id: true,
  createdAt: true,
});

export type InsertFlowAnalysis = z.infer<typeof insertFlowAnalysisSchema>;
export type FlowAnalysis = typeof flowAnalyses.$inferSelect;

// Flow structure types
export const FlowActionSchema = z.object({
  $id: z.string().optional(),
  $title: z.string().optional(),
  type: z.string(),
  settings: z.record(z.any()).optional(),
  inputVariables: z.array(z.string()).optional(),
  outputVariable: z.string().optional(),
});

export const FlowConditionSchema = z.object({
  source: z.string(),
  variable: z.string(),
  comparison: z.string(),
  values: z.array(z.any()),
});

export const FlowOutputSchema = z.object({
  stateId: z.string(),
  conditions: z.array(FlowConditionSchema).optional(),
});

export const FlowStateSchema = z.object({
  $id: z.string(),
  $title: z.string().optional(),
  $position: z.object({
    x: z.number(),
    y: z.number(),
  }).optional(),
  $tags: z.array(z.string()).optional(),
  is_root: z.boolean().optional(),
  enteringCustomActions: z.array(FlowActionSchema).optional(),
  actions: z.array(FlowActionSchema).optional(),
  leavingCustomActions: z.array(FlowActionSchema).optional(),
  outputs: z.array(FlowOutputSchema).optional(),
  defaultOutput: FlowOutputSchema.optional(),
});

export const FlowDataSchema = z.object({
  states: z.array(FlowStateSchema),
});

export type FlowAction = z.infer<typeof FlowActionSchema>;
export type FlowCondition = z.infer<typeof FlowConditionSchema>;
export type FlowOutput = z.infer<typeof FlowOutputSchema>;
export type FlowState = z.infer<typeof FlowStateSchema>;
export type FlowData = z.infer<typeof FlowDataSchema>;

// KPI types
export const KPIMetricsSchema = z.object({
  // Global KPIs
  healthScore: z.number(),
  complexityIndex: z.number(),
  externalDependencyIndex: z.number(),
  maintainabilityScore: z.number(),
  branchingFactor: z.number(),
  flowCohesion: z.number(),
  dynamicContentRate: z.number(),
  deadCodePotential: z.number(),
  
  // Structure metrics
  totalStates: z.number(),
  orphanStates: z.number(),
  clusters: z.number(),
  
  // Action-specific metrics
  httpActions: z.object({
    count: z.number(),
    integrationHealth: z.number(),
    diversityOfEndpoints: z.number(),
    securityRate: z.number(),
    reutilizationRate: z.number(),
    performanceRisk: z.number(),
  }),
  
  scriptActions: z.object({
    count: z.number(),
    averageRiskScore: z.number(),
    deadCodeRate: z.number(),
    couplingRate: z.number(),
    duplicatedCodeRate: z.number(),
    namingConsistency: z.number(),
  }),
  
  interactionActions: z.object({
    count: z.number(),
    richnessScore: z.number(),
    inputRobustness: z.number(),
    navigationClarity: z.number(),
    deadEndsRate: z.number(),
    consistencyScore: z.number(),
  }),
  
  variableActions: z.object({
    count: z.number(),
    orphanRate: z.number(),
    averageLifecycle: z.number(),
    conditionComplexity: z.number(),
    sourceDistribution: z.object({
      input: z.number(),
      context: z.number(),
    }),
    magicVariablesRate: z.number(),
  }),
});

export type KPIMetrics = z.infer<typeof KPIMetricsSchema>;
