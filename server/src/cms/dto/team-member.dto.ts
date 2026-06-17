import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class TeamMemberDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  role: string;

  @IsString()
  @IsOptional()
  imageUrl?: string;

  @IsString()
  @IsOptional()
  instagramUrl?: string;
}
