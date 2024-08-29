import { Body, Controller, HttpException, HttpStatus, Patch, Post, ValidationPipe } from "@nestjs/common";
import { UploadReadingDTO } from "./dtos/uploadReading.dto";
import { ConfirmReadingDTO } from "./dtos/confirmReading.dto";
import { ReadingsService } from "./readings.service";
import { Measurement } from "@prisma/client";

@Controller()
export class ReadingsController {
    constructor(private readingsService: ReadingsService){}

    @Post('/upload')
    async upload(@Body() data: UploadReadingDTO): Promise<any> {
        const duplicate: boolean = await this.readingsService.hasMeasurementThisMonth(data.customer_code, data.measure_type)

            if(duplicate) throw new HttpException({error_code: "DOUBLE_REPORT",
 error_description: "Leitura do mês já realizada"}, HttpStatus.CONFLICT)

        try{
            const result: Measurement = await this.readingsService.upload(data)

            return {
                image_url: `http://localhost:3000${result.image_url}`,
                measure_value: result.value,
                measure_uuid: result.id
            }
        }catch(e){
            throw new HttpException(e, HttpStatus.BAD_REQUEST)
        }
        
    }

    @Patch('/confirm')
    async confirm(@Body() data: ConfirmReadingDTO):Promise<any>{
        const result = await this.readingsService.confirm(data)

        return {success: true}
    }
}