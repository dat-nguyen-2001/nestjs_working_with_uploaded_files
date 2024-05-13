import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  async mergeTwoFiles(fileOne, fileTwo, mergedField: string): Promise<string> {
    return 'Hello World!';
  }
}
