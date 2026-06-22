import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class FileStorageService {
  private readonly uploadDir = path.join(process.cwd(), 'uploads');

  constructor() {
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async uploadFile(file: Express.Multer.File, folder: string = ''): Promise<string> {
    const filename = `${Date.now()}-${Math.round(Math.random() * 1E9)}-${file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const targetDir = path.join(this.uploadDir, folder);
    
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    const filepath = path.join(targetDir, filename);
    fs.writeFileSync(filepath, file.buffer);

    // Return the relative URL path for the frontend
    return `/uploads/${folder ? folder + '/' : ''}${filename}`;
  }
}
