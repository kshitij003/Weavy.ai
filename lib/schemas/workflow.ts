import { z } from "zod";

export const WorkflowStepStatusSchema = z.enum(["PENDING", "RUNNING", "COMPLETED", "FAILED"]);

export const WorkflowStepSchema = z.object({
    nodeId: z.string(),
    nodeType: z.string(),
    nodeLabel: z.string().optional(),
    status: WorkflowStepStatusSchema,
    inputs: z.record(z.any()).optional().nullable(),
    outputs: z.any().optional().nullable(),
    error: z.string().optional().nullable(),
    startedAt: z.coerce.date(), // Use coerce to handle string dates from JSON
    endedAt: z.coerce.date().optional().nullable(),
    duration: z.number().int().optional().nullable(), // milliseconds
});

export const WorkflowRunStatusSchema = z.enum(["RUNNING", "COMPLETED", "FAILED"]);

export const WorkflowRunSchema = z.object({
    userId: z.string(),
    triggerType: z.enum(["FULL", "PARTIAL", "SINGLE"]).default("FULL"),
    status: WorkflowRunStatusSchema,
    startedAt: z.coerce.date(),
    endedAt: z.coerce.date().optional().nullable(),
    duration: z.number().int().optional().nullable(),
    steps: z.array(WorkflowStepSchema),
});

export type WorkflowStep = z.infer<typeof WorkflowStepSchema>;
export type WorkflowRun = z.infer<typeof WorkflowRunSchema>;
