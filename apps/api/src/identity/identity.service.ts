import { BadRequestException, Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { OpenaiService } from "../openai/openai.service";
import * as fs from "fs";
import * as path from "path";
import { v4 as uuidv4 } from "uuid";

const DOCUMENT_TYPES = ["AADHAAR", "PASSPORT", "DRIVING_LICENSE", "VISA", "OTHER"] as const;
type WalletDocumentType = (typeof DOCUMENT_TYPES)[number];

@Injectable()
export class IdentityService {
  private readonly logger = new Logger(IdentityService.name);
  private readonly uploadDir = path.resolve("./uploads");

  constructor(
    private readonly prisma: PrismaService,
    private readonly openaiService: OpenaiService,
  ) {
    if (!fs.existsSync(this.uploadDir)) fs.mkdirSync(this.uploadDir, { recursive: true });
  }

  async getUserDocuments(userId: string) {
    return this.prisma.identityDocument.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  }

  async uploadDocument(
    userId: string,
    file: Express.Multer.File,
    documentType: WalletDocumentType,
    displayName?: string,
  ) {
    if (!file) throw new BadRequestException("No file uploaded.");
    if (!DOCUMENT_TYPES.includes(documentType)) throw new BadRequestException("Invalid document type.");
    if (!file.mimetype || !(file.mimetype.startsWith("image/") || file.mimetype === "application/pdf")) {
      throw new BadRequestException("Upload a PDF or image file.");
    }
    if (documentType === "OTHER" && !displayName?.trim()) {
      throw new BadRequestException("Please give this document a name.");
    }

    const ext = path.extname(file.originalname).slice(0, 12) || (file.mimetype === "application/pdf" ? ".pdf" : ".jpg");
    const fileName = `${uuidv4()}${ext}`;
    const filePath = path.join(this.uploadDir, fileName);
    fs.writeFileSync(filePath, file.buffer);
    this.logger.log(`Stored traveller document ${fileName} for user ${userId}`);

    // Extract identity details only for the established identity document types.
    // Visa and custom wallet uploads are stored as files without guessing their contents.
    const extracted = ["AADHAAR", "PASSPORT", "DRIVING_LICENSE"].includes(documentType)
      ? await this.openaiService.extractIdentityDocument(filePath)
      : null;

    try {
      return await this.prisma.identityDocument.create({
        data: {
          userId,
          documentType,
          displayName: documentType === "OTHER" ? displayName!.trim().slice(0, 80) : documentType === "VISA" ? "Visa" : null,
          imagePath: filePath,
          documentNumber: extracted?.documentNumber ?? null,
          fullName: extracted?.fullName ?? null,
          nationality: extracted?.nationality ?? null,
          dateOfBirth: extracted?.dateOfBirth ? new Date(extracted.dateOfBirth) : null,
          expiryDate: extracted?.expiryDate ? new Date(extracted.expiryDate) : null,
          rawExtractedData: extracted ? JSON.stringify(extracted) : null,
          verificationStatus: "PENDING",
        },
      });
    } catch (error) {
      // Avoid leaving an orphaned local file if the database write fails.
      try { fs.unlinkSync(filePath); } catch {}
      throw error;
    }
  }
}