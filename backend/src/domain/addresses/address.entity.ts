import { AddressModel } from './types/address.type';

export class Address implements AddressModel {
  constructor(
    public readonly id: string,
    public readonly entityId: string,
    public readonly entityType: 'supplier' | 'customer',
    public country: string,
    public city: string,
    public street: string,
    public building: string,
    public readonly createdAt: Date = new Date(),
    public updatedAt: Date = new Date(),
    public postalCode?: string,
    public state?: string,
    public lat?: number,
    public lng?: number,
    public isPrimary: boolean = false
  ) {
    this.validate();
  }

  // ========== FACTORY METHODS ==========

  static create(data: {
    entityId: string;
    entityType: 'supplier' | 'customer';
    country: string;
    city: string;
    street: string;
    building: string;
    postalCode?: string;
    state?: string;
    lat?: number;
    lng?: number;
    isPrimary?: boolean;
  }): Address {
    return new Address(
      crypto.randomUUID(),
      data.entityId,
      data.entityType,
      data.country,
      data.city,
      data.street,
      data.building,
      new Date(), // createdAt
      new Date(), // updatedAt
      data.postalCode,
      data.state,
      data.lat,
      data.lng,
      data.isPrimary ?? false
    );
  }

  static restore(data: AddressModel): Address {
    return new Address(
      data.id,
      data.entityId,
      data.entityType,
      data.country,
      data.city,
      data.street,
      data.building,
      data.createdAt,
      data.updatedAt,
      data.postalCode,
      data.state,
      data.lat,
      data.lng,
      data.isPrimary
    );
  }

  // ========== BUSINESS METHODS ==========

  setAsPrimary(): void {
    this.isPrimary = true;
    this.updateTimestamp();
  }

  setAsSecondary(): void {
    this.isPrimary = false;
    this.updateTimestamp();
  }

  setCoordinates(lat: number, lng: number): void {
    this.validateCoordinates(lat, lng);
    this.lat = lat;
    this.lng = lng;
    this.updateTimestamp();
  }

  updateDetails(details: {
    postalCode?: string;
    state?: string;
    lat?: number;
    lng?: number;
    isPrimary?: boolean;
  }): void {
    if (details.postalCode !== undefined) {
      this.postalCode = details.postalCode;
    }
    if (details.state !== undefined) {
      this.state = details.state;
    }
    if (details.lat !== undefined && details.lng !== undefined) {
      this.setCoordinates(details.lat, details.lng);
    }
    if (details.isPrimary !== undefined) {
      details.isPrimary ? this.setAsPrimary() : this.setAsSecondary();
    }
  }

  // ========== VALIDATION ==========

  private validate(): void {
    const errors: string[] = [];

    if (!this.id?.trim()) errors.push('ID is required');
    if (!this.entityId?.trim()) errors.push('Entity ID is required');
    if (!this.entityType) errors.push('Entity type is required');
    if (!this.country?.trim()) errors.push('Country is required');
    if (!this.city?.trim()) errors.push('City is required');
    if (!this.street?.trim()) errors.push('Street is required');
    if (!this.building?.trim()) errors.push('Building is required');
    if (this.postalCode && !this.isValidPostalCode(this.postalCode)) {
      errors.push('Invalid postal code');
    }
    if (this.lat !== undefined && this.lng !== undefined) {
      if (!this.isValidCoordinates(this.lat, this.lng)) {
        errors.push('Invalid coordinates');
      }
    }

    if (errors.length > 0) {
      throw new Error(`Address validation failed: ${errors.join(', ')}`);
    }
  }

  private validateCoordinates(lat: number, lng: number): void {
    if (!this.isValidCoordinates(lat, lng)) {
      throw new Error(`Invalid coordinates: lat=${lat}, lng=${lng}`);
    }
  }

  private isValidPostalCode(code: string): boolean {
    if (!code?.trim()) return false;

    const trimmedCode = code.trim();

    // Basic checks for different countries
    switch (this.country.toLowerCase()) {
      case 'russia':
        return /^\d{6}$/.test(trimmedCode);
      case 'ukraine':
        return /^\d{5}$/.test(trimmedCode);
      case 'usa':
        return /^\d{5}(-\d{4})?$/.test(trimmedCode);
      default:
        return trimmedCode.length >= 3 && trimmedCode.length <= 10;
    }
  }

  private isValidCoordinates(lat: number, lng: number): boolean {
    return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
  }

  // ========== AUXILIARY METHODS ==========

  private updateTimestamp(): void {
    this.updatedAt = new Date();
  }

  get fullAddress(): string {
    const parts = [
      this.country,
      this.state,
      this.city,
      this.street,
      this.building,
      this.postalCode
    ].filter(Boolean);

    return parts.join(', ');
  }

  get coordinates(): { lat: number; lng: number } | undefined {
    return this.lat !== undefined && this.lng !== undefined
      ? { lat: this.lat, lng: this.lng }
      : undefined;
  }

  hasCoordinates(): boolean {
    return this.lat !== undefined && this.lng !== undefined;
  }

  isSameLocation(other: Address): boolean {
    return (
      this.country === other.country &&
      this.city === other.city &&
      this.street === other.street &&
      this.building === other.building
    );
  }

  cloneWithNewId(newId: string): Address {
    return new Address(
      newId,
      this.entityId,
      this.entityType,
      this.country,
      this.city,
      this.street,
      this.building,
      new Date(), // createdAt
      new Date(), // updatedAt
      this.postalCode,
      this.state,
      this.lat,
      this.lng,
      this.isPrimary
    );
  }

  // For ease of debugging
  toString(): string {
    return `Address ${this.id}: ${this.fullAddress} (${this.entityType}: ${this.entityId})`;
  }

  // For comparison in collections
  equals(other: Address): boolean {
    return this.id === other.id;
  }
}
