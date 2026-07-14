-- Create organizationRole table for dynamic access control
CREATE TABLE IF NOT EXISTS "organizationRole" (
  "id" text NOT NULL PRIMARY KEY,
  "organizationId" text NOT NULL REFERENCES "organization" ("id") ON DELETE CASCADE,
  "role" text NOT NULL,
  "permission" text NOT NULL,
  "createdAt" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" timestamptz
);
