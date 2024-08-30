import { Injectable } from '@nestjs/common'
import { Client } from '@prisma/client'
import { PrismaService } from 'src/prisma.service'

@Injectable()
export class ClientsService {
  constructor(private prisma: PrismaService) {}

  async getMeasurements({
    clientId,
    measureType,
  }: {
    clientId: string
    measureType: string
  }): Promise<Client> {
    return await this.prisma.client.findUnique({
      where: { id: clientId },
      include: {
        measurements: {
          where: {
            ...(measureType && {
              type: measureType.toUpperCase(),
            }),
          },
        },
      },
    })
  }
}
