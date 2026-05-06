export interface MemorySnapshot {
  memoryMd: string;
  projectLogMd: string;
  turnRangeEnd: number;
}

export interface MemorySystem {
  compress(sessionId: string, projectId: string, turns: any[]): Promise<MemorySnapshot>;
  getMemory(projectId: string): Promise<string | null>;
  getProjectLog(projectId: string): Promise<string | null>;
}

export class MemorySystemImpl implements MemorySystem {
  constructor(
    private aiGateway: any, // Stub for now
    private storage: any    // Stub for now
  ) {}

  async compress(sessionId: string, projectId: string, turns: any[]): Promise<MemorySnapshot> {
    const turnsAsText = turns
      .map((t) => `${t.role.toUpperCase()}: ${t.content}`)
      .join("\n\n");

    const prompt = `Summarize the following agent turns into a structured memory.md format.
Include sections: current_state, decisions_made, files_created, errors_encountered, next_planned_actions.

Turns:
${turnsAsText}`;

    const summary = await this.aiGateway.complete({
      messages: [{ role: "system", content: "You are a memory compressor." }, { role: "user", content: prompt }],
    });

    const memoryMd = summary.content;
    const projectLogMd = `## Turn Range Summary: ${turns[0].turn_number} - ${turns[turns.length - 1].turn_number}\n\n${memoryMd}\n\n---\n`;

    // Persist to R2
    await this.storage.putFile(projectId, "memory.md", memoryMd);
    
    // In a real impl, we'd read and append to project_log.md
    const existingLog = (await this.storage.getFile(projectId, "project_log.md")) || "";
    await this.storage.putFile(projectId, "project_log.md", existingLog + projectLogMd);

    return {
      memoryMd,
      projectLogMd,
      turnRangeEnd: turns[turns.length - 1].turn_number,
    };
  }

  async getMemory(projectId: string): Promise<string | null> {
    return this.storage.getFile(projectId, "memory.md");
  }

  async getProjectLog(projectId: string): Promise<string | null> {
    return this.storage.getFile(projectId, "project_log.md");
  }
}
