/// <reference types="vite/client" />

// Extender la interfaz Window para incluir BookingWidget
declare global {
   interface Window {
      BookingWidget?: {
         mountWidget: (selector: string, options?: any) => void;
      };
   }
}

export {};
