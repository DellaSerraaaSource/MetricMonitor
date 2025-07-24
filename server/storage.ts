import { FlowAnalysis, type InsertFlowAnalysis } from "@shared/schema";

export interface IStorage {
  getFlowAnalysis(id: number): Promise<FlowAnalysis | undefined>;
  getAllFlowAnalyses(): Promise<FlowAnalysis[]>;
  createFlowAnalysis(analysis: InsertFlowAnalysis): Promise<FlowAnalysis>;
  deleteFlowAnalysis(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private analyses: Map<number, FlowAnalysis>;
  private currentId: number;

  constructor() {
    this.analyses = new Map();
    this.currentId = 1;
  }

  async getFlowAnalysis(id: number): Promise<FlowAnalysis | undefined> {
    return this.analyses.get(id);
  }

  async getAllFlowAnalyses(): Promise<FlowAnalysis[]> {
    return Array.from(this.analyses.values()).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async createFlowAnalysis(insertAnalysis: InsertFlowAnalysis): Promise<FlowAnalysis> {
    const id = this.currentId++;
    const analysis: FlowAnalysis = {
      ...insertAnalysis,
      id,
      createdAt: new Date(),
    };
    this.analyses.set(id, analysis);
    return analysis;
  }

  async deleteFlowAnalysis(id: number): Promise<boolean> {
    return this.analyses.delete(id);
  }
}

export const storage = new MemStorage();
