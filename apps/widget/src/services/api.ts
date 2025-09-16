import axios from 'axios';
import type {
   TenantConfig,
   Room,
   Booking,
   AvailabilityRequest,
   BookingRequest,
} from '../types';

class ApiService {
   private baseURL: string;

   constructor() {
      // Usar la API real del backend
      // En desarrollo local, siempre usar localhost:3000
      this.baseURL = 'http://localhost:3000/api/v1';
   }

   async getConfig(tenant: string): Promise<TenantConfig> {
      try {
         const response = await axios.get(
            `${this.baseURL}/tenants/${tenant}/config`
         );

         // La API del backend devuelve directamente el objeto, no wrapped en ApiResponse
         return {
            id: response.data.slug,
            name: response.data.name,
            logo: response.data.brand_logo,
            primaryColor: response.data.brand_primary || '#0ea5e9',
            currency: response.data.currency,
            timezone: response.data.timezone,
            languages: ['es'], // Por ahora solo español
         };
      } catch (error) {
         console.error('API Error - getConfig:', error);
         if (axios.isAxiosError(error) && error.response?.status === 404) {
            throw new Error('Hotel no encontrado');
         }
         throw new Error('No se pudo cargar la configuración del hotel');
      }
   }

   async getAvailability(params: AvailabilityRequest): Promise<Room[]> {
      try {
         const response = await axios.get(`${this.baseURL}/availability`, {
            params: {
               tenant: params.tenant,
               checkin: params.checkin,
               checkout: params.checkout,
               guests: params.guests,
            },
         });

         // Transformar la respuesta del backend al formato esperado por el widget
         const rooms: Room[] = response.data.room_types
            .map((roomType: any) => {
               // Tomar la tarifa más barata
               const cheapestRate = roomType.rate_plans.reduce(
                  (min: any, rate: any) =>
                     rate.price_cents < min.price_cents ? rate : min
               );

               const nights = Math.ceil(
                  (new Date(params.checkout).getTime() -
                     new Date(params.checkin).getTime()) /
                     (1000 * 60 * 60 * 24)
               );

               return {
                  id: roomType.id,
                  name: roomType.name,
                  description: roomType.description || '',
                  capacity: roomType.max_guests,
                  pricePerNight: Math.round(cheapestRate.price_cents / 100),
                  totalPrice: Math.round(cheapestRate.price_cents / 100),
                  images: [], // El backend no maneja imágenes aún
                  amenities: [], // El backend no maneja amenidades aún
                  available: cheapestRate.available > 0,
                  ratePlanId: cheapestRate.id, // Guardamos para la reserva
                  nights: nights,
               };
            })
            .filter((room: Room) => room.available);

         return rooms;
      } catch (error) {
         console.error('API Error - getAvailability:', error);
         if (axios.isAxiosError(error)) {
            if (error.response?.status === 404) {
               throw new Error(
                  'No hay habitaciones disponibles para las fechas seleccionadas'
               );
            }
            if (error.response && error.response.status >= 500) {
               throw new Error(
                  'Error del servidor. Intente nuevamente más tarde'
               );
            }
         }
         throw new Error('Error al buscar disponibilidad');
      }
   }

   async confirmBooking(params: BookingRequest): Promise<Booking> {
      try {
         const response = await axios.post(`${this.baseURL}/bookings/confirm`, {
            tenant: params.tenant,
            room_type_id: params.roomId,
            rate_plan_id: params.ratePlanId,
            checkin: params.checkin,
            checkout: params.checkout,
            guests: params.guests,
            customer: {
               name: `${params.guestData.firstName} ${params.guestData.lastName}`,
               email: params.guestData.email,
               phone: params.guestData.phone || null,
            },
         });

         // Transformar la respuesta del backend al formato esperado por el widget
         return {
            id: response.data.booking_id,
            locator: response.data.locator,
            status: response.data.status as 'confirmed',
            room: {
               id: params.roomId,
               name: '', // No disponible en la respuesta
               description: '',
               capacity: params.guests,
               pricePerNight: 0,
               totalPrice: Math.round(response.data.total_cents / 100),
               images: [],
               amenities: [],
               available: true,
            },
            checkin: params.checkin,
            checkout: params.checkout,
            guests: params.guests,
            guestData: params.guestData,
            totalPrice: Math.round(response.data.total_cents / 100),
            createdAt: new Date().toISOString(),
         };
      } catch (error) {
         console.error('API Error - confirmBooking:', error);
         if (axios.isAxiosError(error)) {
            if (error.response?.status === 400) {
               throw new Error('Datos de reserva inválidos');
            }
            if (error.response?.status === 409) {
               throw new Error('La habitación ya no está disponible');
            }
            if (error.response && error.response.status >= 500) {
               throw new Error(
                  'Error del servidor. Intente nuevamente más tarde'
               );
            }
         }
         throw new Error('Error al confirmar la reserva');
      }
   }
}

export const apiService = new ApiService();
