interface BaseAddress {
  country: string;
  city: string;
  street: string;
  building: string;
  state: string;
  postalCode: string;

  lat: number;
  lng: number;

  isPrimary: boolean;
  fullAddress: string;
}

export type Address = Partial<BaseAddress>;