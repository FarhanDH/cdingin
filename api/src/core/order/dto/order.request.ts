import { PartialType } from '@nestjs/mapped-types';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsDate,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  Max,
  MinDate,
  ValidateNested,
} from 'class-validator';
import { ACBrandEnum } from '~/common/enums/ac-brand.enum';
import { ACCapacityEnum } from '~/common/enums/ac-capacity.enum';

class AcUnitDto {
  @IsString()
  @IsNotEmpty()
  acTypeId: string;

  @IsEnum(ACCapacityEnum)
  @IsNotEmpty()
  acCapacity: ACCapacityEnum;

  @IsEnum(ACBrandEnum)
  @IsNotEmpty()
  brand: ACBrandEnum;

  @IsInt()
  @IsPositive()
  @Max(10)
  quantity: number;
}

export class CreateOrderRequestDto {
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  acProblems: string[];

  @IsString()
  @IsNotEmpty()
  serviceLocation: string;

  @IsString()
  @IsNotEmpty()
  propertyType: string;

  @IsInt()
  @IsPositive()
  @Max(10)
  floor: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AcUnitDto)
  acUnits: AcUnitDto[];

  @IsDate()
  @Type(() => Date)
  @MinDate(new Date())
  serviceDate: string;

  @IsString()
  @IsOptional()
  note?: string;
}

export class UpdateOrderRequestDto extends PartialType(CreateOrderRequestDto) {}
