import { Controller, Get, Param, Query } from "@nestjs/common";
import { ClientsService } from "./clients.service";
import { Client, Measurement  } from "@prisma/client";

@Controller()
export class ClientsController {
    constructor(private clientsService: ClientsService){}

    @Get('/:id/list')
    async list(@Param('id') clientId: string, @Query('measure_type') measureType?: string): Promise<any> { 
        const list: Client = await this.clientsService.getMeasurements({clientId, measureType})

        // normalize data as specified
        const measures: {
            measure_uuid: string;
            measure_datetime: Date;
            measure_type: string;
            has_confirmed:boolean;
            image_url: string
        }[] = (list as {id:string; measurements: Measurement[]}).measurements.map((m: Measurement) => {
            return {
                measure_uuid: m.id,
                measure_datetime: new Date(m.datetime),
                measure_type: m.type,
                has_confirmed:m.has_confirmed,
                image_url: `http://localhost:3000${m.image_url}`
            }
        })

        return {customer_code: list.id, measures }
    }
}
