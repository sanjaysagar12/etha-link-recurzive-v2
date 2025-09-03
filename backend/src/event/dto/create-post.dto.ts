import { IsString, IsOptional } from 'class-validator';

export class CreatePostDto {
    @IsString()
    content: string;

    @IsOptional()
    @IsString()
    image?: string;
}