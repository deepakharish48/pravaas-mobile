export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  email: string;
  password: string;
  name: string;
}

export interface BookingDetails {
  hotelName?: string;
  guestName?: string;
  checkIn?: string;
  checkOut?: string;
  confirmationNumber?: string;
  roomType?: string;
  numberOfGuests?: number;
  totalPrice?: string;
  currency?: string;
  rawText?: string;
}

export type BookingStatus = "PENDING" | "CONFIRMED" | "CHECKED_IN" | "CANCELLED";

export interface Booking {
  id: string;
  userId: string;
  imagePath: string;
  hotelName: string | null;
  guestName: string | null;
  checkIn: string | null;
  checkOut: string | null;
  confirmationNumber: string | null;
  roomType: string | null;
  numberOfGuests: number | null;
  totalPrice: string | null;
  currency: string | null;
  rawExtractedData: string | null;
  status: BookingStatus;
  qrCode: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface QrCodeResponse {
  bookingId: string;
  qrCodeDataUrl: string;
  payload: string;
}
export type DocumentType =
  | "PASSPORT"
  | "AADHAAR"
  | "DRIVING_LICENSE"
  | "VISA";

export type VerificationStatus =
  | "PENDING"
  | "VERIFIED"
  | "REJECTED";

export interface IdentityDocument {
  id: string;
  userId: string;

  documentType: DocumentType;

  documentNumber: string | null;
  fullName: string | null;
  nationality: string | null;

  dateOfBirth: string | null;
  expiryDate: string | null;

  imagePath: string;

  verificationStatus: VerificationStatus;

  createdAt: string;
  updatedAt: string;
}

export interface ApiError {
  message: string;
  statusCode: number;
}

export interface IdentityExtraction {
  documentType: DocumentType;
  documentNumber: string | null;
  fullName: string | null;
  nationality: string | null;
  dateOfBirth: string | null;
  expiryDate: string | null;
}
