export interface SearchParams {
   checkin: string;
   checkout: string;
   guests: number;
}

export interface Room {
   id: string;
   name: string;
   description: string;
   capacity: number;
   pricePerNight: number;
   totalPrice: number;
   images: string[];
   amenities: string[];
   available: boolean;
   ratePlanId?: string; // Para la reserva
   nights?: number; // Número de noches
}

export interface GuestData {
   firstName: string;
   lastName: string;
   email: string;
   phone: string;
   specialRequests?: string;
}

export interface Booking {
   id: string;
   locator: string;
   status: 'confirmed' | 'pending' | 'cancelled';
   room: Room;
   checkin: string;
   checkout: string;
   guests: number;
   guestData: GuestData;
   totalPrice: number;
   createdAt: string;
}

export interface TenantConfig {
   id: string;
   name: string;
   logo?: string;
   primaryColor: string;
   currency: string;
   timezone: string;
   languages: string[];
}

export interface ApiResponse<T> {
   success: boolean;
   data: T;
   message?: string;
}

export interface AvailabilityRequest {
   tenant: string;
   checkin: string;
   checkout: string;
   guests: number;
}

export interface BookingRequest {
   tenant: string;
   roomId: string;
   ratePlanId: string; // Necesario para el backend
   checkin: string;
   checkout: string;
   guests: number;
   guestData: GuestData;
}
