import { Injectable, OnModuleInit } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
    async onModuleInit() {
        await this.$connect()
        this.$use(async (params, next) => {
            const result = await next(params);
      
            const cleanSensitiveFields = (data: any): any => {
              if (!data || typeof data !== 'object') return data;
      
              if (Array.isArray(data)) {
                return data.map(cleanSensitiveFields);
              }
      
              delete data.password;
              delete data.createdAt;
              delete data.updatedAt;
      
              for (const key in data) {
                if (data.hasOwnProperty(key)) {
                  data[key] = cleanSensitiveFields(data[key]);
                }
              }
      
              return data;
            };
      
            return cleanSensitiveFields(result);
        });
    }
}