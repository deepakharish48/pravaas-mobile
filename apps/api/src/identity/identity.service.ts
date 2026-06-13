/*import { Injectable, BadRequestException, Logger } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { OpenaiService } from "../openai/openai.service";
import * as fs from "fs";
import * as path from "path";
import { v4 as uuidv4 } from "uuid";

@Injectable()
export class IdentityService {
  private readonly logger = new Logger(IdentityService.name);
  constructor(
    private prisma: PrismaService,
    private openaiService: OpenaiService,
  ) {}

  async getUserDocuments(userId: string) {
    return this.prisma.identityDocument.findMany({
      where: { userId },
      orderBy: {
        createdAt: "desc",
      },
    });
  }
  async uploadDocument(
    userId: string,
    file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException(
        "No file uploaded",
      );
    }
  
    const uploadDir = path.resolve("./uploads");
  
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, {
        recursive: true,
      });
    }
  
    const ext =
      path.extname(file.originalname) || ".jpg";
  
    const fileName =
      `${uuidv4()}${ext}`;
  
    const filePath =
      path.join(uploadDir, fileName);
  
    fs.writeFileSync(
      filePath,
      file.buffer,
    );
  
    this.logger.log(
      `Stored identity document at ${filePath}`,
    );
  
    const extracted =
      await this.openaiService.extractIdentityDocument(
        filePath,
      );
  
    const document =
      await this.prisma.identityDocument.create({
        data: {
          userId,
  
          documentType:
            extracted.documentType,
  
          documentNumber:
            extracted.documentNumber ?? null,
  
          fullName:
            extracted.fullName ?? null,
  
          nationality:
            extracted.nationality ?? null,
  
          dateOfBirth:
            extracted.dateOfBirth
              ? new Date(
                  extracted.dateOfBirth,
                )
              : null,
  
          expiryDate:
            extracted.expiryDate
              ? new Date(
                  extracted.expiryDate,
                )
              : null,
  
          imagePath: filePath,
  
          rawExtractedData:
            JSON.stringify(extracted),
  
          verificationStatus:
            "PENDING",
        },
      });
  
    return document;
  }
}*/

import {
    Injectable,
    BadRequestException,
    Logger,
  } from "@nestjs/common";
  
  import { PrismaService } from "../prisma/prisma.service";
  import { OpenaiService } from "../openai/openai.service";
  
  import * as fs from "fs";
  import * as path from "path";
  import { v4 as uuidv4 } from "uuid";
  
  @Injectable()
  export class IdentityService {
    private readonly logger =
      new Logger(IdentityService.name);
  
    private readonly uploadDir =
      path.resolve("./uploads");
  
    constructor(
      private prisma: PrismaService,
      private openaiService: OpenaiService,
    ) {
      if (!fs.existsSync(this.uploadDir)) {
        fs.mkdirSync(this.uploadDir, {
          recursive: true,
        });
      }
    }
  
    async getUserDocuments(userId: string) {
      return this.prisma.identityDocument.findMany({
        where: { userId },
        orderBy: {
          createdAt: "desc",
        },
      });
    }
  
    async uploadDocument(
      userId: string,
      file: Express.Multer.File,
    ) {
      if (!file) {
        throw new BadRequestException(
          "No file uploaded",
        );
      }
  
      const ext =
        path.extname(file.originalname) || ".jpg";
  
      const fileName =
        `${uuidv4()}${ext}`;
  
      const filePath =
        path.join(this.uploadDir, fileName);
  
      fs.writeFileSync(
        filePath,
        file.buffer,
      );
  
      this.logger.log(
        `Stored identity document at ${filePath}`,
      );
  
      const extracted =
        await this.openaiService.extractIdentityDocument(
          filePath,
        );
  
      return this.prisma.identityDocument.create({
        data: {
          userId,
          imagePath: filePath,
  
          documentType:
            extracted.documentType,
  
          documentNumber:
            extracted.documentNumber,
  
          fullName:
            extracted.fullName,
  
          nationality:
            extracted.nationality,
  
          dateOfBirth:
            extracted.dateOfBirth
              ? new Date(
                  extracted.dateOfBirth,
                )
              : null,
  
          expiryDate:
            extracted.expiryDate
              ? new Date(
                  extracted.expiryDate,
                )
              : null,
  
          verificationStatus:
            "PENDING",
        },
      });
    }
  }