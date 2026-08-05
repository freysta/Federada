import {
  IsEnum,
  IsNotEmpty,
  IsString,
  IsOptional,
  IsNumber,
} from 'class-validator';

export enum BracketFormat {
  SINGLE_ELIMINATION = 'SINGLE_ELIMINATION',
  DOUBLE_ELIMINATION = 'DOUBLE_ELIMINATION',
  GROUP_STAGE = 'GROUP_STAGE',
  ROUND_ROBIN = 'ROUND_ROBIN',
}

export class GenerateBracketDto {
  @IsEnum(BracketFormat)
  @IsNotEmpty()
  format: BracketFormat;

  @IsNumber()
  @IsOptional()
  groupsCount?: number; // Para fase de grupos, quantos grupos
}
