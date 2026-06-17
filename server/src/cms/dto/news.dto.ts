import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class NewsDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsString()
  @IsOptional()
  imageUrl?: string;

  @IsString()
  @IsOptional()
  dateLabel?: string;
}
