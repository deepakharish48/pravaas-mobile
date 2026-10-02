import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { FileInterceptor } from "@nestjs/platform-express";
import { memoryStorage } from "multer";
import { IdentityService } from "./identity.service";

@Controller("identity")
@UseGuards(AuthGuard("jwt"))
export class IdentityController {
  constructor(private readonly identityService: IdentityService) {}

  @Get()
  getDocuments(@Req() req: any) {
    return this.identityService.getUserDocuments(req.user.id);
  }

  @Post("upload")
  @UseInterceptors(
    FileInterceptor("file", {
      storage: memoryStorage(),
      limits: { fileSize: 10 * 1024 * 1024 },
    }),
  )
  upload(
    @Req() req: any,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: { documentType?: string; displayName?: string },
  ) {
    const allowed = ["AADHAAR", "PASSPORT", "DRIVING_LICENSE", "VISA", "OTHER"];
    const documentType = (body.documentType || "").toUpperCase();
    if (!allowed.includes(documentType)) {
      throw new BadRequestException("Choose a valid document type.");
    }
    return this.identityService.uploadDocument(
      req.user.id,
      file,
      documentType as any,
      body.displayName,
    );
  }
}