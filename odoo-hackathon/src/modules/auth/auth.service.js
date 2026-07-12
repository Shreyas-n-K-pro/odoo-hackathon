// ─────────────────────────────────────────────────────────────────────────────
// TransitOps — Auth Service (Business Logic)
// Handles: signup, login with lockout, token generation.
// Controllers stay thin — all logic lives here.
// ─────────────────────────────────────────────────────────────────────────────

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dayjs = require('dayjs');
const prisma = require('../../config/database');
const { AUTH_CONFIG } = require('../../config/constants');

/**
 * Register a new user.
 * @throws {Error} if email already exists (Prisma P2002 — caught by global handler)
 */
const signup = async ({ name, email, password, role }) => {
  const passwordHash = await bcrypt.hash(password, AUTH_CONFIG.SALT_ROUNDS);

  const user = await prisma.user.create({
    data: { name, email, passwordHash, role },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });

  const token = generateToken(user);
  return { token, user };
};

/**
 * Login with lockout enforcement.
 *  - Checks if the account is currently locked
 *  - Validates role matches what's stored in DB
 *  - On wrong password: increments failedAttempts, locks after 5th failure
 *  - On success: resets failedAttempts
 */
const login = async ({ email, password, role }) => {
  // 1. Find user
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    throw createAuthError('Invalid email or password.', 'INVALID_CREDENTIALS', 401);
  }

  // 2. Check role matches
  if (user.role !== role) {
    throw createAuthError(
      'The selected role does not match this account. Please choose the correct role.',
      'ROLE_MISMATCH',
      401
    );
  }

  // 3. Check if account is locked
  if (user.lockedUntil && dayjs().isBefore(dayjs(user.lockedUntil))) {
    const unlocksAt = dayjs(user.lockedUntil).format('HH:mm:ss');
    throw createAuthError(
      `Account locked due to too many failed attempts. Try again after ${unlocksAt}.`,
      'ACCOUNT_LOCKED',
      423
    );
  }

  // 4. Verify password
  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

  if (!isPasswordValid) {
    const newFailedAttempts = user.failedAttempts + 1;
    const shouldLock = newFailedAttempts >= AUTH_CONFIG.MAX_FAILED_ATTEMPTS;

    await prisma.user.update({
      where: { id: user.id },
      data: {
        failedAttempts: newFailedAttempts,
        lockedUntil: shouldLock
          ? dayjs().add(AUTH_CONFIG.LOCKOUT_MINUTES, 'minute').toDate()
          : null,
      },
    });

    if (shouldLock) {
      throw createAuthError(
        `Invalid credentials. Account locked for ${AUTH_CONFIG.LOCKOUT_MINUTES} minutes after ${AUTH_CONFIG.MAX_FAILED_ATTEMPTS} failed attempts.`,
        'ACCOUNT_LOCKED',
        423
      );
    }

    const attemptsLeft = AUTH_CONFIG.MAX_FAILED_ATTEMPTS - newFailedAttempts;
    throw createAuthError(
      `Invalid credentials. ${attemptsLeft} attempt(s) remaining before lockout.`,
      'INVALID_CREDENTIALS',
      401
    );
  }

  // 5. Success — reset lockout counters
  await prisma.user.update({
    where: { id: user.id },
    data: { failedAttempts: 0, lockedUntil: null },
  });

  const safeUser = { id: user.id, name: user.name, email: user.email, role: user.role };
  const token = generateToken(safeUser);

  return { token, user: safeUser };
};

/**
 * Get user by ID (for /api/auth/me)
 */
const getMe = async (userId) => {
  return prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });
};

// ── Private helpers ───────────────────────────────────────────────────────────

const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
  );
};

const createAuthError = (message, code, statusCode) => {
  const err = new Error(message);
  err.code = code;
  err.statusCode = statusCode;
  return err;
};

module.exports = { signup, login, getMe };
