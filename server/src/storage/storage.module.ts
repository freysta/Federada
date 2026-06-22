import { Module } from '@nestjs/common';
import { FileStorageService } from './storage.service';

@Module({
  providers: [FileStorageService],
  exports: [FileStorageService],
})
export class StorageModule {}
