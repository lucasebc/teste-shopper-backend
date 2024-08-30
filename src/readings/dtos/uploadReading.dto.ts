import {
  IsBase64,
  IsDateString,
  IsNotEmpty,
  IsString,
  IsUUID,
} from 'class-validator'

export class UploadReadingDTO {
  //@IsBase64()
  @IsNotEmpty()
  image: string // base64
  @IsUUID()
  @IsNotEmpty()
  customer_code: string
  @IsDateString()
  @IsNotEmpty()
  measure_datetime: Date
  @IsString()
  @IsNotEmpty()
  measure_type: 'WATER' | 'GAS'
}
