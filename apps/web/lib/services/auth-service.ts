/**
 * Auth service (A43) — register, login, validateSession
 * Layer rule: calls userRepo only. No HTTP imports.
 */
import { createHash, randomBytes } from 'crypto'
import { userRepo } from '@/lib/repositories/user-repo'
import { signToken } from '@/lib/auth/jwt'
import { logger } from '@/lib/logger'
import { ok, err } from '@/lib/types'
import type { User, UserRole, AuthProvider, ApiResponse } from '@/lib/types'

// ─── Password hashing (PBKDF2-style with salt) ────────────────────────────────
// Production: use bcrypt. This is Edge-runtime compatible.
function hashPassword(password: string, salt: string): string {
  return createHash('sha256').update(`${salt}:${password}:wmt`).digest('hex')
}
function generateSalt(): string { return randomBytes(16).toString('hex') }

function verifyPassword(password: string, storedHash: string): boolean {
  const sep = storedHash.indexOf(':')
  if (sep === -1) return false
  const salt = storedHash.slice(0, sep)
  const hash = storedHash.slice(sep + 1)
  return hashPassword(password, salt) === hash
}

// ─── Types ────────────────────────────────────────────────────────────────────
export interface RegisterInput {
  email:    string
  password: string
  name:     string
  role:     UserRole
  country:  string
  phone?:   string
  provider?: AuthProvider
}

export interface LoginInput {
  email:    string
  password: string
}

export interface AuthResult {
  token: string
  user:  Omit<User, 'passwordHash'>
}

// ─── Register ─────────────────────────────────────────────────────────────────
export async function register(input: RegisterInput): Promise<ApiResponse<AuthResult>> {
  if (!input.email?.includes('@')) return err('VALIDATION', 'Invalid email address.')
  if ((input.password ?? '').length < 6) return err('VALIDATION', 'Password must be at least 6 characters.')

  const existing = userRepo.findByEmail(input.email)
  if (existing) return err('EMAIL_EXISTS', 'An account with this email already exists.')

  const salt         = generateSalt()
  const passwordHash = `${salt}:${hashPassword(input.password, salt)}`

  const user = userRepo.create({
    email:        input.email.toLowerCase().trim(),
    passwordHash,
    name:         input.name.trim(),
    role:         input.role,
    country:      input.country.toUpperCase(),
    phone:        input.phone,
    provider:     input.provider ?? 'email',
    isVerified:   false,
    avatarUrl:    undefined,
  })

  const token = await signToken({ sub: user.id, email: user.email, role: user.role })

  logger.info('user.registered', { userId: user.id, role: user.role })

  const { passwordHash: _, ...safeUser } = user
  return ok({ token, user: safeUser })
}

// ─── Login ────────────────────────────────────────────────────────────────────
export async function login(input: LoginInput): Promise<ApiResponse<AuthResult>> {
  const user = userRepo.findByEmail(input.email)
  if (!user || !verifyPassword(input.password, user.passwordHash)) {
    logger.warn('auth.login_failed', { email: input.email })
    return err('INVALID_CREDENTIALS', 'Invalid email or password.')
  }

  const token = await signToken({ sub: user.id, email: user.email, role: user.role })
  logger.info('auth.login', { userId: user.id, role: user.role })

  const { passwordHash: _, ...safeUser } = user
  return ok({ token, user: safeUser })
}

// ─── Validate session ─────────────────────────────────────────────────────────
export function validateSession(userId: string): User | undefined {
  return userRepo.findById(userId)
}
