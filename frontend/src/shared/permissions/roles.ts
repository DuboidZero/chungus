/**
 * Core role definitions and user types.
 * Re-exported from the canonical API entity.
 *
 * MOCK_USERS has been removed.
 * Authentication is now handled via the API contract.
 * See: src/api/entities/user.ts
 * See: src/api/contracts/auth.ts
 */

export type { User, Role } from '../../api/entities/user';
