export class Storage {
  private files: Map<string, string> = new Map();

  async putFile(projectId: string, path: string, content: string): Promise<void> {
    this.files.set(`${projectId}/${path}`, content);
  }

  async getFile(projectId: string, path: string): Promise<string | null> {
    return this.files.get(`${projectId}/${path}`) || null;
  }
}
