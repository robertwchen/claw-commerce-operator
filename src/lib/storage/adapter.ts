import { promises as fs } from "fs";
import path from "path";

export type StorageObject = {
  key: string;
  contentType: string;
  body: string | Buffer;
};

export interface StorageAdapter {
  putObject(object: StorageObject): Promise<{ url: string; path: string }>;
  getObject(key: string): Promise<Buffer>;
}

export class LocalStorageAdapter implements StorageAdapter {
  constructor(private rootDir = path.join(process.cwd(), "storage")) {}

  private resolveKey(key: string) {
    const root = path.resolve(this.rootDir);
    const filePath = path.resolve(root, key);
    if (!filePath.startsWith(`${root}${path.sep}`) && filePath !== root) {
      throw new Error(`Storage key escapes root directory: ${key}`);
    }
    return filePath;
  }

  async putObject(object: StorageObject) {
    const filePath = this.resolveKey(object.key);
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, object.body);

    return {
      url: `/api/storage/${object.key.replace(/\\/g, "/")}`,
      path: filePath,
    };
  }

  async getObject(key: string) {
    return fs.readFile(this.resolveKey(key));
  }
}

export class R2ReadyStorageAdapter extends LocalStorageAdapter {
  readonly mode = "local-r2-ready";
}
