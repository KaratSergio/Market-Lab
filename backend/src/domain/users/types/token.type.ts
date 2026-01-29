export interface Token {
  id: string;
  userId: string;
  type: 'email_verification' | 'password_reset';
  token: string;
  used: boolean;
  expiresAt: Date;
  createdAt: Date;
}

export interface TokenRepository {
  create(token: Omit<Token, 'id' | 'createdAt'>): Promise<Token>;
  findByToken(token: string): Promise<Token | null>;
  markAsUsed(tokenId: string): Promise<void>;
  deleteExpired(): Promise<void>;
  deleteByUserId(userId: string, type?: string): Promise<void>;
}