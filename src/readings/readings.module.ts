import { MiddlewareConsumer, Module } from '@nestjs/common'
import { ReadingsController } from './readings.controller'
import { ReadingsService } from './readings.service'
import { PrismaService } from 'src/prisma.service'
import { InvalidDataValidation } from './middlewares/invalidConfirmationData.middleware'
import { MeasurementNotFound } from './middlewares/measureNotFound.middleware'
import { DuplicateConfirmationValidation } from './middlewares/confirmationDupliacte.middleware'

@Module({
  controllers: [ReadingsController],
  providers: [PrismaService, ReadingsService],
})
export class ReadingsModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(
        InvalidDataValidation,
        MeasurementNotFound,
        DuplicateConfirmationValidation,
      )
      .forRoutes('confirm')
  }
}
