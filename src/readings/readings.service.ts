import { HttpException, Injectable } from "@nestjs/common";
import { randomUUID } from "crypto";
import { PrismaService } from "src/prisma.service";
import { UploadReadingDTO } from "./dtos/uploadReading.dto";
import { ConfirmReadingDTO } from "./dtos/confirmReading.dto";
import {writeFile, mkdir, writeFileSync, mkdirSync} from 'fs'
import {Measurement} from '@prisma/client'
import { GoogleAIFileManager } from "@google/generative-ai/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { dirname, join } from "path";

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
    async saveImage(base64Image:string, measureDatetime: number, client_id: string):Promise<string> {

        const binaryData: Buffer = Buffer.from(base64Image.split(',')[1], 'base64');

        const fileExtension: string = base64Image.match(/(?<=\/)([^+;]+)(?=[+;])/g)[0]
        const clientDirectory: string = `/images/measurements/${client_id}`
        const fileLocation:string = `${clientDirectory}/${measureDatetime}.${fileExtension}`

        mkdirSync(clientDirectory, { recursive: true });
        writeFileSync(`./${fileLocation}`, binaryData);

        return fileLocation
    }

    // calls geminiService sending images location, returns read value. 
    async readImage(imageLocation: string): Promise<number> {
        // instance of the fileManager to send the image.
        const fileManager: GoogleAIFileManager = new GoogleAIFileManager(process.env.GEMINI_API_KEY);

        // Upload the file and specify a display name.
        const uploadResponse = await fileManager.uploadFile(join( dirname(require.main.filename), '..', imageLocation), {
          mimeType: `image/${imageLocation.split('.').pop()}`,
          displayName: "water/gas register photo",
        });

        // instance the handler of the AI.
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

        const model = genAI.getGenerativeModel({
          // Choose a Gemini model.
          model: "gemini-1.5-pro",
          // model: "gemini-1.5-flash",
        });

        // Generate content using text and the URI reference for the uploaded file.
        const result = await model.generateContent([
            {
              fileData: {
                mimeType: uploadResponse.file.mimeType,
                fileUri: uploadResponse.file.uri
              }
            },
            { text: "This is a water register. How many cubic meters you read on it, ignoring the red numbers? Give me the number only, inside square brackets, please" },
          ]);

        // Output the generated text to the console
        console.log(`google says: `,result.response.text())

        const finalResult: number = Number(result.response.text().match(/(?<=\/)([^+\[]+)(?=[\]])/g)[0])

        return finalResult
    }
    
    async upload(uploadData: UploadReadingDTO): Promise<Measurement> {
        try {
            const imgLocation: string = await this.saveImage(uploadData.image, new Date(uploadData.measure_datetime).getTime(), uploadData.customer_code)

            const value: number = await this.readImage(imgLocation)

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