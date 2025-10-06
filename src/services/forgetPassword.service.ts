import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { emailService } from './mail.service';

export class PasswordService {
  private readonly resetTokenSecret: string;
  private readonly resetTokenExpiresIn: string;

  constructor() {
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET environment variable is required');
    }
    this.resetTokenSecret = process.env.JWT_SECRET;
    this.resetTokenExpiresIn = process.env.JWT_RESET_EXPIRES || '1h';
  }

  async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return await bcrypt.hash(password, saltRounds);
  }

  async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword);
  }

  generateResetToken(email: string): string {
    return jwt.sign(
      { email }, 
      this.resetTokenSecret, 
      { 
        expiresIn: this.resetTokenExpiresIn,
        algorithm: 'HS256'
      } as jwt.SignOptions
    );
  }

  verifyResetToken(token: string): { email: string } {
    try {
      const decoded = jwt.verify(token, this.resetTokenSecret) as { email: string };
      return decoded;
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('Invalid reset token');
      } else if (error instanceof jwt.TokenExpiredError) {
        throw new Error('Reset token has expired');
      } else {
        throw new Error('Invalid or expired reset token');
      }
    }
  }

  async sendPasswordResetEmail(email: string): Promise<void> {
    const resetToken = this.generateResetToken(email);
    await emailService.sendPasswordResetEmail(email, resetToken);
  }

  async sendPasswordChangeConfirmation(email: string): Promise<void> {
    await emailService.sendPasswordChangedConfirmation(email);
  }
}

export const passwordService = new PasswordService();