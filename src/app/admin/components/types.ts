export interface AdminSettings {
  taxRate: number;
  shippingEnabled: boolean;
  pickupOnly: boolean;
  freeShippingThreshold: number;
  shippingCost: number;
  pickupInstructions: string;
  burndownUrgentThreshold: number; // Hours threshold for urgent status
  burndownCriticalThreshold: number; // Hours threshold for critical status
}

