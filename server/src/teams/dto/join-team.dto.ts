import {
  IsString,
  IsNotEmpty,
  MaxLength,
  IsOptional,
  IsDateString,
  IsIn,
} from 'class-validator';

export class JoinTeamDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  inviteCode: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  cpf: string;

  @IsNotEmpty()
  @IsDateString()
  birthDate: Date;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  course?: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  period?: string;

  @IsString()
  @IsOptional()
  @IsIn(['MASCULINO', 'FEMININO', 'MISTO'])
  gender?: string;
}
