import { IsNumber, IsOptional, IsString, IsDateString } from 'class-validator';

export class UpdateMatchDto {
  @IsOptional()
  @IsNumber()
  scoreA?: number;

  @IsOptional()
  @IsNumber()
  scoreB?: number;

  @IsOptional()
  @IsString()
  status?: string; // SCHEDULED, ONGOING, FINISHED

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @IsString()
  summaryFileUrl?: string;
}
