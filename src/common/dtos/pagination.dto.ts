import { Type } from "class-transformer";
import { ApiProperty } from '@nestjs/swagger';

import { IsNumber, IsOptional, IsPositive, Min } from "class-validator";

export class PaginationDto {

    @ApiProperty({
        default: 10,
        description: 'How many rows do you want?'
    })
    @IsOptional()
    @IsNumber()
    @IsPositive()
    @Min(1)
    @Type( () => Number )
    limit?: number;

    @ApiProperty({
        default: 0,
        description: 'rows to skip'
    })
    @IsOptional()
    @IsNumber()
    @Min(0)
    @Type( () => Number )
    offset?: number;
}
