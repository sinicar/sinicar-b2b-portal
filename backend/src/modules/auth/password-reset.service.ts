import bcrypt from 'bcryptjs';
import prisma from '../../lib/prisma';

export function generateResetCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function getResetCodeExpiry(minutes: number = 15): Date {
  return new Date(Date.now() + minutes * 60 * 1000);
}

export async function storeResetCode(userId: string, resetCode: string, expiresAt: Date): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: {
      passwordResetToken: resetCode,
      passwordResetExpiry: expiresAt
    }
  });
}

export async function findUserByWhatsappOrEmail(identifier: string): Promise<{ id: string; name: string } | null> {
  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { whatsapp: identifier },
        { email: identifier },
        { phone: identifier }
      ]
    },
    select: { id: true, name: true }
  });
  return user;
}

export async function validateResetCode(
  identifier: string,
  resetCode: string
): Promise<{ valid: boolean; userId?: string; error?: string }> {
  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { whatsapp: identifier },
        { email: identifier },
        { phone: identifier }
      ]
    },
    select: {
      id: true,
      passwordResetToken: true,
      passwordResetExpiry: true
    }
  });

  if (!user) {
    return { valid: false, error: 'المستخدم غير موجود' };
  }

  if (!user.passwordResetToken || user.passwordResetToken !== resetCode) {
    return { valid: false, error: 'رمز إعادة التعيين غير صحيح' };
  }

  if (!user.passwordResetExpiry || new Date() > user.passwordResetExpiry) {
    return { valid: false, error: 'انتهت صلاحية رمز إعادة التعيين' };
  }

  return { valid: true, userId: user.id };
}

export async function updatePassword(userId: string, newPassword: string): Promise<void> {
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  
  await prisma.user.update({
    where: { id: userId },
    data: {
      password: hashedPassword,
      passwordResetToken: null,
      passwordResetExpiry: null,
      failedLoginAttempts: 0
    }
  });
}

export async function clearResetCode(userId: string): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: {
      passwordResetToken: null,
      passwordResetExpiry: null
    }
  });
}
