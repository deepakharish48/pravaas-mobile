import {
    Controller,
    Get,
    Req,
    UseGuards,
    UseInterceptors,
    Post,
    UploadedFile,
  } from "@nestjs/common";
  
  import { AuthGuard } from "@nestjs/passport";
  import { FileInterceptor } from "@nestjs/platform-express";
  import { memoryStorage } from "multer";
  import { IdentityService } from "./identity.service";
  
  @Controller("identity")
  @UseGuards(AuthGuard("jwt"))
  export class IdentityController {
    constructor(
      private readonly identityService: IdentityService,
    ) {}
  
    @Get()
    async getDocuments(@Req() req: any) {
      return this.identityService.getUserDocuments(
        req.user.id,
      );
    }
    @Post("upload")
    @UseInterceptors(
    FileInterceptor("file", {
    storage: memoryStorage(),
    limits: {
      fileSize: 10 * 1024 * 1024,
    },
  }),
)
upload(
  @Req() req: any,
  @UploadedFile() file: Express.Multer.File,
) {
  return this.identityService.uploadDocument(
    req.user.id,
    file,
  );
}
}