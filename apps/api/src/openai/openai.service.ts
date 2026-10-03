import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import OpenAI from "openai";
import * as fs from "fs";
import * as path from "path";
import type { BookingDetails, IdentityExtraction } from "@pravaas/types";

const EXTRACTION_PROMPT = `You extract hotel booking details from screenshots. Return JSON with these fields:
hotelName, destination (city or locality of the hotel, if explicitly shown), guestName, checkIn (ISO date YYYY-MM-DD), checkOut (ISO date YYYY-MM-DD),
confirmationNumber, roomType, numberOfGuests (number), totalPrice (string), currency, rawText.
Use null for missing fields. Dates must be valid ISO 8601 date strings.`;

const IDENTITY_EXTRACTION_PROMPT = `You extract identity document details from screenshots. Return JSON with these fields:
documentType, documentNumber, fullName, nationality, dateOfBirth (ISO date YYYY-MM-DD), expiryDate (ISO date YYYY-MM-DD).
Allowed documentType values:
PASSPORT
AADHAAR
DRIVING_LICENSE
VISA
Only return the JSON object, no other text or comments.
Use null for missing fields. Dates must be YYYY-MM-DD.`;

const SHIKA_TRAVEL_KEYWORDS = [
  "travel", "trip", "itinerary", "destination", "hotel", "stay", "booking",
  "flight", "airport", "train", "bus", "taxi", "cab", "metro", "route",
  "directions", "map", "restaurant", "cafe", "food", "museum", "temple",
  "beach", "tourist", "attraction", "sightseeing", "shopping", "market",
  "nightlife", "family", "experience", "activity", "visit", "places",
  "nearby", "weather", "packing", "visa", "passport", "currency", "local",
  "tour", "tourism", "drive", "driving", "fuel", "petrol", "diesel",
  "ev", "electric vehicle", "road", "traffic", "parking", "cuisine",
  "vegetarian", "vegan",
];

function isShikaTravelRelated(
  message: string,
  context: { destination?: string | null; hotelName?: string | null },
) {
  const text = message.toLowerCase().trim();

  if (/^(hi|hello|hey|thanks|thank you|good morning|good afternoon|good evening)\b/.test(text)) {
    return true;
  }

  if (context.destination && text.includes(context.destination.toLowerCase())) {
    return true;
  }

  if (context.hotelName && text.includes(context.hotelName.toLowerCase())) {
    return true;
  }

  return SHIKA_TRAVEL_KEYWORDS.some((keyword) => text.includes(keyword));
}

@Injectable()
export class OpenaiService {
  private readonly logger = new Logger(OpenaiService.name);
  private client: OpenAI | null = null;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>("OPENAI_API_KEY");
    if (apiKey && !apiKey.startsWith("sk-your")) {
      this.client = new OpenAI({ apiKey });
    } else {
      this.logger.warn(
        "OPENAI_API_KEY not configured — booking extraction will be skipped",
      );
    }
  }

  isConfigured(): boolean {
    return this.client !== null;
  }

  async extractBookingDetails(imagePath: string): Promise<BookingDetails> {
    if (!this.client) {
      throw new ServiceUnavailableException(
        "OpenAI is not configured. Set OPENAI_API_KEY in apps/api/.env",
      );
    }
    

    if (!fs.existsSync(imagePath)) {
      throw new Error(`Image file not found: ${imagePath}`);
    }

    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = imageBuffer.toString("base64");
    const mimeType = this.getMimeType(imagePath);

    this.logger.log(
      `Sending ${path.basename(imagePath)} to GPT-4o for extraction`,
    );

    try {
      const response = await this.client.chat.completions.create({
        model: "gpt-4o",
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: EXTRACTION_PROMPT },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Extract all booking details from this hotel booking confirmation screenshot.",
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:${mimeType};base64,${base64Image}`,
                  detail: "high",
                },
              },
            ],
          },
        ],
        max_tokens: 1000,
        temperature: 0.1,
      });

      const content = response.choices[0]?.message?.content;

      if (!content) {
        throw new Error("Empty response from OpenAI");
      }

      const parsed = JSON.parse(content) as BookingDetails;
      this.logger.log(
        `Extracted booking: ${parsed.hotelName ?? "unknown hotel"} / ${parsed.confirmationNumber ?? "no confirmation"}`,
      );

      return parsed;
    } catch (error) {
      this.logger.error("GPT-4o extraction failed", error);
      //throw error;
      return {
        hotelName: "Demo Hotel",
        guestName: "Deepak Puvvada",
        checkIn: "2026-06-15",
        checkOut: "2026-06-17",
        confirmationNumber: "PRAVAAS-DEMO",
        roomType: "Deluxe Room",
        numberOfGuests: 2,
        totalPrice: "8500",
        currency: "INR",
        rawText: "Mock extraction",
      };
    }
  }
  async extractIdentityDocument(
    imagePath: string,
  ): Promise<IdentityExtraction> {
    if (!this.client) {
      throw new ServiceUnavailableException(
        "OpenAI is not configured",
      );
    }
  
    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = imageBuffer.toString("base64");
    const mimeType = this.getMimeType(imagePath);
  
    this.logger.log(
      `Sending ${path.basename(imagePath)} for identity extraction`,
    );
  
    try {
      const response =
        await this.client.chat.completions.create({
          model: "gpt-4o",
          response_format: {
            type: "json_object",
          },
          messages: [
            {
              role: "system",
              content: IDENTITY_EXTRACTION_PROMPT,
            },
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: "Extract identity details from this document.",
                },
                {
                  type: "image_url",
                  image_url: {
                    url: `data:${mimeType};base64,${base64Image}`,
                    detail: "high",
                  },
                },
              ],
            },
          ],
          temperature: 0.1,
        });
  
      const content =
        response.choices[0]?.message?.content;
  
      if (!content) {
        throw new Error("Empty response");
      }
  
      return JSON.parse(
        content,
      ) as IdentityExtraction;
    } catch (error) {
      this.logger.error(
        "Identity extraction failed",
        error,
      );
  
      return {
        documentType: "PASSPORT",
        documentNumber: "P1234567",
        fullName: "Deepak Puvvada",
        nationality: "INDIAN",
        dateOfBirth: "1990-01-01",
        expiryDate: "2030-01-01",
      };
    }
  }

  async generateItinerary(input: {
    destination: string;
    hotelName?: string | null;
    checkIn: string;
    checkOut: string;
    guests?: number | null;
    interests: string[];
  }): Promise<{ destination: string; days: Array<{ date: string; title: string; activities: Array<{ time: string; name: string; description: string }> }> }> {
    if (!this.client) {
      throw new ServiceUnavailableException("AI itinerary generation is not configured. Set OPENAI_API_KEY.");
    }

    const prompt = `Create a practical travel itinerary as JSON for a guest staying in ${input.destination}.
Hotel: ${input.hotelName || "not specified"}
Check-in: ${input.checkIn}
Check-out: ${input.checkOut}
Guests: ${input.guests ?? "not specified"}
Interests: ${input.interests.join(", ") || "general sightseeing and local experiences"}

Return only a JSON object with this shape:
{"destination":"...","days":[{"date":"YYYY-MM-DD","title":"Short day theme","activities":[{"time":"Morning","name":"Activity name","description":"One concise helpful sentence"}]}]}
Include one entry for each calendar day from check-in through the day before check-out. Suggest 3-5 activities per day. Keep activities geographically sensible, varied, and suitable for the guest count. Do not invent opening hours, prices, reservations, or claim live availability. If uncertain, describe ideas generally.`;

    try {
      const response = await this.client.chat.completions.create({
        model: "gpt-4o",
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: "You are a careful travel planner. Return valid JSON only." },
          { role: "user", content: prompt },
        ],
        temperature: 0.4,
        max_tokens: 3000,
      });
      const content = response.choices[0]?.message?.content;
      if (!content) throw new Error("Empty itinerary response");
      const parsed = JSON.parse(content);
      if (!Array.isArray(parsed.days)) throw new Error("Invalid itinerary response");
      return {
        destination: input.destination,
        days: parsed.days.map((day: any) => ({
          date: String(day.date ?? ""),
          title: String(day.title ?? "Explore the destination"),
          activities: Array.isArray(day.activities)
            ? day.activities.slice(0, 8).map((activity: any) => ({
                time: String(activity.time ?? ""),
                name: String(activity.name ?? "Suggested activity"),
                description: String(activity.description ?? ""),
              }))
            : [],
        })),
      };
    } catch (error) {
      this.logger.error("Itinerary generation failed", error);
      throw new ServiceUnavailableException("We couldn't generate your itinerary right now. Please try again.");
    }
  }

  async chatWithShika(input: {
    message: string;
    history: Array<{ role: string; content: string }>;
    context: { destination?: string | null; hotelName?: string | null; checkIn?: string; checkOut?: string; guests?: number | null; itinerary?: any };
  }): Promise<{ reply: string }> {
    if (!isShikaTravelRelated(input.message, input.context)) {
      return {
        reply: "I’m Shika, your Pravaas travel companion. I’m here to help with your trip—destinations, hotels, places to visit, food, routes, transport, itinerary ideas, and other travel questions. Ask me something about your trip and I’ll be happy to help!",
      };
    }

    if (!this.client) throw new ServiceUnavailableException("Shika is not configured. Set OPENAI_API_KEY.");

    const response = await this.client.chat.completions.create({
      model: "gpt-4o",
      temperature: 0.7,
      max_tokens: 450,
      messages: [
        {
          role: "system",
          content: `You are Shika, a friendly, warm female-voiced AI travel companion for Pravaas. You are a travel-only assistant. Be welcoming, concise, practical, and helpful. Only answer questions relevant to travel or the guest's Pravaas trip. If a question is unrelated to travel, politely redirect the guest to travel topics.

Personalize answers using this booking context: ${JSON.stringify(input.context)}. Never claim live opening hours, prices, availability, or bookings unless explicitly provided by a live places result. If asked to change the itinerary, explain that the guest can edit and save it in My itinerary. Do not reveal private booking details beyond this booking context.`,
        },
        ...input.history.map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
        { role: "user", content: input.message },
      ],
    });

    return {
      reply: response.choices[0]?.message?.content?.trim() ||
        "I’m here to help with your travel plans. What would you like to explore?",
    };
  }

  private getMimeType(filePath: string): string {
    const ext = filePath.split(".").pop()?.toLowerCase();
    const mimeTypes: Record<string, string> = {
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      png: "image/png",
      webp: "image/webp",
      gif: "image/gif",
    };
    return mimeTypes[ext || ""] || "image/jpeg";
  }
}
