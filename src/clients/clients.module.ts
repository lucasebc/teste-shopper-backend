import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { ClientsController } from "./clients.controller";
import { ClientsService } from "./clients.service";
import { listMeasurementsValidation } from "./listMeasurements.middleware";
import { PrismaService } from "src/prisma.service";
import { NoMeasurementsFound } from "./noMeasurementsFound.middleware";

@Module({
    controllers: [ClientsController],
    providers: [PrismaService ,ClientsService]
})
export class ClientsModule implements NestModule{
     configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(listMeasurementsValidation, NoMeasurementsFound)
      .forRoutes(ClientsController);
  }
}