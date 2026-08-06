import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDateString,
  IsEnum,
  ValidateNested,
  IsBoolean,
  IsArray,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ChampionshipStatus, AudienceFocus } from '../entities/championship.entity';

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
  @IsNotEmpty()
  @MaxLength(150)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
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
  @IsString()
  bannerUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  organizer?: string;

  @IsOptional()
  @IsEnum(AudienceFocus)
  audienceFocus?: AudienceFocus;

  @IsOptional()
  @ValidateNested()
  @Type(() => ChampionshipSettingsDto)
  settings?: ChampionshipSettingsDto;
}
