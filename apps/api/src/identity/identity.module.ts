import { Module } from "@nestjs/common";
import { IdentityController } from "./identity.controller";
import { IdentityService } from "./identity.service";
import { PrismaModule } from "../prisma/prisma.module";
import { OpenaiModule } from "../openai/openai.module";

@Module({
  imports: [PrismaModule, OpenaiModule],
  controllers: [IdentityController],
  providers: [IdentityService],
})
export class IdentityModule {}