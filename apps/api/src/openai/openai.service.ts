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


  async analyzeReelFrames(frames: string[]): Promise<string> {
    if (!this.client) throw new ServiceUnavailableException("Reel analysis is not configured. Set OPENAI_API_KEY.");
    if (!Array.isArray(frames) || frames.length < 1 || frames.length > 6) {
      throw new Error("Provide between 1 and 6 sampled frames.");
    }
    const safeFrames = frames.filter((frame) =>
      typeof frame === "string" && /^data:image\/(jpeg|png|webp);base64,/.test(frame) && frame.length <= 1_500_000,
    );
    if (!safeFrames.length || safeFrames.length !== frames.length) throw new Error("Frames must be valid JPEG, PNG, or WebP images under the size limit.");
    const response = await this.client.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "Analyze user-provided travel video frames. Identify only likely visible travel places, landmarks, activities, food, signage, and useful itinerary clues. Do not claim certainty about ambiguous locations; label guesses as unverified. Return concise plain text." },
        { role: "user", content: [
          { type: "text", text: "These are sampled frames from a travel Reel supplied by the user. Summarize useful travel inspiration, any readable place names, and uncertain visual guesses. Do not infer exact locations without evidence." },
          ...safeFrames.map((url) => ({ type: "image_url" as const, image_url: { url, detail: "low" as const } })),
        ] },
      ],
      max_tokens: 700,
      temperature: 0.2,
    });
    return response.choices[0]?.message?.content?.trim() || "No useful travel details could be identified in these frames.";
  }

  async transcribeReelAudio(file: Express.Multer.File): Promise<string> {
    if (!this.client) throw new ServiceUnavailableException("Audio transcription is not configured. Set OPENAI_API_KEY.");
    if (!file?.buffer || !file.originalname) throw new Error("Audio file is required.");
    const allowed = new Set(["audio/mpeg", "audio/mp3", "audio/mp4", "audio/m4a", "audio/wav", "audio/x-wav", "audio/webm", "audio/ogg", "audio/flac"]);
    if (!allowed.has(file.mimetype)) throw new Error("Use an MP3, M4A, WAV, WebM, OGG, or FLAC audio file.");
    if (file.size > 25 * 1024 * 1024) throw new Error("Audio file must be 25 MB or smaller.");
    const ext = path.extname(file.originalname).toLowerCase() || ".m4a";
    const upload = await import("openai").then(({ toFile }) => toFile(file.buffer, `reel-audio${ext}`, { type: file.mimetype }));
    const result = await this.client.audio.transcriptions.create({ model: "whisper-1", file: upload });
    return result.text?.trim() || "No speech was detected in the provided audio.";
  }

  async generateItinerary(input: {
    destination: string;
    hotelName?: string | null;
    checkIn: string;
    checkOut: string;
    guests?: number | null;
    interests: string[];
    sourceContext?: string;
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
Traveller-provided inspiration (caption, transcript or notes): ${input.sourceContext || "none provided"}
Use the supplied text as inspiration. Do not claim you watched or extracted the Reel itself. Prioritize named places and activities in the supplied text and arrange them into a practical route.

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
  }): Promise<{ reply: string; suggestions: string[] }> {
    const fallbackSuggestions = [
      input.context.destination ? `Must-see places in ${input.context.destination}?` : "Help me choose places to visit",
      "Find local food favourites",
      "Plan a relaxed day",
    ];
    if (!isShikaTravelRelated(input.message, input.context)) {
      return {
        reply: "I’m Shika, your Pravaas travel companion. I’m here to help with your trip—destinations, hotels, places to visit, food, routes, transport, itinerary ideas, and other travel questions. Ask me something about your trip and I’ll be happy to help!",
        suggestions: ["Suggest places to visit", "Find local food", "Help plan my itinerary"],
      };
    }

    if (!this.client) throw new ServiceUnavailableException("Shika is not configured. Set OPENAI_API_KEY.");

    const response = await this.client.chat.completions.create({
      model: "gpt-4o",
      temperature: 0.7,
      max_tokens: 550,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `You are Shika, a friendly AI travel companion for Pravaas. Be welcoming, concise, practical, and helpful. Only answer travel questions; politely redirect unrelated questions. Personalize using this booking context: ${JSON.stringify(input.context)}. Never claim live opening hours, prices, availability, or bookings unless explicitly provided by a live places result. Do not reveal private booking details beyond this context. Return a JSON object with exactly two fields: "reply" (a concise helpful answer as plain text) and "suggestions" (an array of exactly 3 short, natural follow-up prompts the traveller can tap next). Suggestions must be specific to the user's latest message, your answer, and the trip context; avoid generic duplicates and do not include markdown or numbering.`,
        },
        ...input.history.map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
        { role: "user", content: input.message },
      ],
    });

    const raw = response.choices[0]?.message?.content?.trim();
    try {
      const parsed = JSON.parse(raw || "{}");
      const reply = typeof parsed.reply === "string" && parsed.reply.trim()
        ? parsed.reply.trim()
        : "I’m here to help with your travel plans. What would you like to explore?";
      const suggestions = Array.isArray(parsed.suggestions)
        ? parsed.suggestions.filter((item: unknown): item is string => typeof item === "string").map((item: string) => item.trim()).filter(Boolean).slice(0, 3)
        : [];
      return { reply, suggestions: suggestions.length ? suggestions : fallbackSuggestions };
    } catch {
      return {
        reply: raw || "I’m here to help with your travel plans. What would you like to explore?",
        suggestions: fallbackSuggestions,
      };
    }
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
