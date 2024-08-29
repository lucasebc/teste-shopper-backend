import { HttpException, Injectable } from "@nestjs/common";
import { randomUUID } from "crypto";
import { PrismaService } from "src/prisma.service";
import { UploadReadingDTO } from "./dtos/uploadReading.dto";
import { ConfirmReadingDTO } from "./dtos/confirmReading.dto";
import {writeFile, mkdir} from 'fs'
import {Measurement} from '@prisma/client'

@Injectable()
export class ReadingsService {
    constructor(private prisma: PrismaService){}

    async hasMeasurementThisMonth(client_id: string, type?: string): Promise<boolean> {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  const measurement: Measurement = await this.prisma.measurement.findFirst({
    where: {
      client_id: client_id,
      ...(type && { type: type.toUpperCase() }),
      AND: [
        {
          datetime: {
            gte: new Date(currentYear, currentMonth - 1, 1),
          },
        },
        {
          datetime: {
            lt: new Date(currentYear, currentMonth, 1),
          },
        },
      ],
    },
  });

  return measurement !== null;
}

    // takes the base64 image data, creates the image file in the appropriate location(root/images/measurements/:client_id/datetime_image).
    // returns image's location.
    saveImage(base64Image:string, measureDatetime: number, client_id):string {

        // Decode the Base64 string
        const binaryData: Buffer = Buffer.from(base64Image.split(',')[1], 'base64');

        const fileExtension: string = base64Image.match(/(?<=\/)([^+;]+)(?=[+;])/g)[0]
        const clientDirectory: string = `/images/measurements/${client_id}`
        const fileLocation:string = `${clientDirectory}/${measureDatetime}.${fileExtension}`

        mkdir(clientDirectory, { recursive: true }, (err) => {
            if (err) {
                throw new Error('Erro ao criar diretório.');
            }

            // Save the binary data to a file
            writeFile(`./${fileLocation}`, binaryData, (error) => {
            if (error) throw new Error('Erro ao salvar imagem.')

            console.log('arquivo salvo')
            });
        });

        return fileLocation
    }

    // calls geminiService sending images location, returns read value. 
    readImage(): number {
        return 42
    }
    
    async upload(uploadData: UploadReadingDTO): Promise<Measurement> {
        try {
            console.log(uploadData.measure_datetime, new Date(uploadData.measure_datetime))
            const imgLocation: string = this.saveImage(uploadData.image, new Date(uploadData.measure_datetime).getTime(), uploadData.customer_code)

            const value: number = this.readImage()

            return await this.prisma.measurement.create({data:{
                client_id: uploadData.customer_code,
                image_url: imgLocation,
                datetime: uploadData.measure_datetime,
                has_confirmed: false,
                type: uploadData.measure_type,
                value,
                id: randomUUID()
        }})}catch(error)
            {console.log(error) 
                throw new Error()
            }
    }

    async confirm(data: ConfirmReadingDTO): Promise<any>{
        return this.prisma.measurement.update({where: {id: data.measure_uuid}, data:{has_confirmed: true,  value: Number(data.confirmed_value)}})
    }

}