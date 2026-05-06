import { MemorySystem } from "@pylon/memory-system";

export interface AgentSession {
  id: string;
  projectId: string;
  turnCount: number;
  compressionCount: number;
}

export interface ExecutionLoop {
  run(sessionId: string): Promise<void>;
}

export class ExecutionLoopImpl implements ExecutionLoop {
  private COMPRESSION_THRESHOLD = 50;

  constructor(
    private db: any,
    private aiGateway: any,
    private memorySystem: MemorySystem,
    private queue: any
  ) {}

  async run(sessionId: string): Promise<void> {
    const session = await this.db.getSession(sessionId);
    const project = await this.db.getProject(session.projectId);

    let messages: any[] = await this.loadContext(project.id);

    while (session.turnCount < 500) {
      // 1. Call AI Gateway
      const response = await this.aiGateway.complete({
        sessionId: session.id,
        messages,
      });

      // 2. Track Turn
      session.turnCount++;
      await this.db.recordTurn(session.id, {
        role: "assistant",
        content: response.content,
        turnNumber: session.turnCount,
      });

      // 3. Check for Compression
      if (session.turnCount % this.COMPRESSION_THRESHOLD === 0) {
        await this.handleCompression(session, messages);
        // Reload context after compression
        messages = await this.loadContext(project.id);
      } else {
        messages.push({ role: "assistant", content: response.content });
      }

      // 4. Update session
      await this.db.updateSession(session.id, {
        turnCount: session.turnCount,
      });

      // Break if finished (stub logic)
      if (response.finishReason === "stop") break;
    }
  }

  private async loadContext(projectId: string): Promise<any[]> {
    const memory = await this.memorySystem.getMemory(projectId);
    const systemPrompt = "You are Pylon Agent. Build the app.";
    
    const context = [{ role: "system", content: systemPrompt }];
    if (memory) {
      context.push({ role: "system", content: `Existing Memory:\n${memory}` });
    }
    return context;
  }

  private async handleCompression(session: any, messages: any[]): Promise<void> {
    console.log(`Triggering compression for session ${session.id} at turn ${session.turnCount}`);

    // Atomic update in a transaction (stub)
    await this.db.transaction(async (tx: any) => {
      // 1. Summarize and persist to R2
      const snapshot = await this.memorySystem.compress(session.id, session.projectId, messages);

      // 2. Record snapshot in DB
      await tx.recordSnapshot(session.projectId, {
        snapshotType: "memory",
        content: snapshot.memoryMd,
        turnRangeStart: session.turnCount - this.COMPRESSION_THRESHOLD + 1,
        turnRangeEnd: session.turnCount,
      });

      // 3. Update session status
      await tx.updateSession(session.id, {
        compressionCount: session.compressionCount + 1,
        status: "running",
      });
    });
  }
}
