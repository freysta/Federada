import { IsString, IsOptional, IsDateString, IsEnum, ValidateNested, IsBoolean, IsArray } from 'class-validator';
import { Type } from 'class-transformer';
import { ChampionshipStatus } from '../entities/championship.entity';

class ChampionshipSettingsDto {
  @IsOptional()
  @IsBoolean()
  requireRg?: boolean;

  @IsOptional()
  @IsBoolean()
  requireEnrollment?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  customDocuments?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  locations?: string[];
}

export class CreateChampionshipDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsDateString()
  enrollmentDeadline?: string;

  @IsOptional()
  @IsDateString()
  documentsDeadline?: string;

  @IsOptional()
  @IsEnum(ChampionshipStatus)
  status?: ChampionshipStatus;

  @IsOptional()
  @IsString()
  bannerUrl?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => ChampionshipSettingsDto)
  settings?: ChampionshipSettingsDto;
}
