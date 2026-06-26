import { IsString, IsNumber, Min, IsEnum, IsOptional } from 'class-validator';

export enum ModalityType {
  INDIVIDUAL = 'INDIVIDUAL',
  COLETIVO = 'COLETIVO',
}

export enum ModalityGender {
  MASCULINO = 'MASCULINO',
  FEMININO = 'FEMININO',
  MISTO = 'MISTO',
}

export class CreateModalityDto {
  @IsString()
  name: string;

  @IsEnum(ModalityType)
  type: ModalityType;

  @IsNumber()
  @Min(0)
  price: number;

  @IsNumber()
  @Min(0)
  minAthletes: number;

  @IsNumber()
  @Min(0)
  maxAthletes: number;

  @IsNumber()
  @Min(0)
  minAge: number;

  @IsNumber()
  @Min(0)
  maxAge: number;

  @IsOptional()
  @IsEnum(ModalityGender)
  gender?: ModalityGender;
}
