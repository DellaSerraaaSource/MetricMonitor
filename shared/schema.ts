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

// Flow structure types - Updated to match exact Blip JSON format
export const FlowActionSchema = z.object({
  $id: z.string().optional(),
  $title: z.string().optional(),
  $typeOfContent: z.string().optional(),
  type: z.string().optional(),
  settings: z.record(z.any()).optional(),
  inputVariables: z.array(z.string()).optional(),
  outputVariable: z.string().optional(),
  conditions: z.array(z.any()).optional(),
  $invalid: z.boolean().optional(),
  // Handle nested input structure from actual JSON
  input: z.object({
    bypass: z.boolean().optional(),
    $cardContent: z.object({
      document: z.object({
        id: z.string().optional(),
        type: z.string().optional(),
        content: z.string().optional(),
      }).optional(),
      editable: z.boolean().optional(),
      deletable: z.boolean().optional(),
      position: z.string().optional(),
      editing: z.boolean().optional(),
    }).optional(),
    $invalid: z.boolean().optional(),
  }).optional(),
  // Handle various action types
  method: z.string().optional(),
  uri: z.string().optional(),
  headers: z.record(z.string()).optional(),
  body: z.string().optional(),
  responseStatusVariable: z.string().optional(),
  responseBodyVariable: z.string().optional(),
  source: z.string().optional(),
  script: z.string().optional(),
  text: z.string().optional(),
  variable: z.string().optional(),
  value: z.string().optional(),
  validation: z.object({
    rule: z.string(),
    type: z.string(),
  }).optional(),
}).passthrough(); // Allow additional fields

export const FlowConditionSchema = z.object({
  source: z.string(),
  variable: z.string().optional(),
  comparison: z.string(),
  values: z.array(z.any()),
});

export const FlowOutputSchema = z.object({
  stateId: z.string(),
  typeOfStateId: z.string().optional(),
  $connId: z.string().optional(),
  $id: z.string().optional(),
  conditions: z.array(FlowConditionSchema).optional(),
  $isBuilderDefaultOutput: z.boolean().optional(),
  $invalid: z.boolean().optional(),
});

export const FlowStateSchema = z.object({
  $contentActions: z.array(FlowActionSchema).optional(),
  $conditionOutputs: z.array(FlowOutputSchema).optional(),
  $enteringCustomActions: z.array(FlowActionSchema).optional(),
  $leavingCustomActions: z.array(FlowActionSchema).optional(),
  $defaultOutput: FlowOutputSchema.optional(),
  $tags: z.array(z.string()).optional(),
  $position: z.record(z.any()).optional(),
  $invalid: z.boolean().optional(),
});

// Make the schema much more permissive to handle actual Blip JSON format
export const FlowDataSchema = z.object({
  flow: z.record(z.any()), // Accept any structure for now
}).passthrough(); // Allow additional fields at root level

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
