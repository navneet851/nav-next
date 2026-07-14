-- Add new columns to existing tables for organization + admin plugins

-- User table: add role, banned, banReason, banExpires
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "role" text;
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "banned" boolean;
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "banReason" text;
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "banExpires" timestamptz;

-- Session table: add activeOrganizationId, impersonatedBy
ALTER TABLE "session" ADD COLUMN IF NOT EXISTS "activeOrganizationId" text;
ALTER TABLE "session" ADD COLUMN IF NOT EXISTS "impersonatedBy" text;

-- Create new organization table
CREATE TABLE IF NOT EXISTS "organization" (
  "id" text NOT NULL PRIMARY KEY,
  "name" text NOT NULL,
  "slug" text NOT NULL UNIQUE,
  "logo" text,
  "createdAt" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "metadata" text
);

-- Create new member table
CREATE TABLE IF NOT EXISTS "member" (
  "id" text NOT NULL PRIMARY KEY,
  "organizationId" text NOT NULL REFERENCES "organization" ("id") ON DELETE CASCADE,
  "userId" text NOT NULL REFERENCES "user" ("id") ON DELETE CASCADE,
  "role" text NOT NULL,
  "createdAt" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create new invitation table
CREATE TABLE IF NOT EXISTS "invitation" (
  "id" text NOT NULL PRIMARY KEY,
  "organizationId" text NOT NULL REFERENCES "organization" ("id") ON DELETE CASCADE,
  "email" text NOT NULL,
  "role" text,
  "status" text NOT NULL,
  "expiresAt" timestamptz NOT NULL,
  "createdAt" timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "inviterId" text NOT NULL REFERENCES "user" ("id") ON DELETE CASCADE
);

-- Create indexes for new tables
CREATE UNIQUE INDEX IF NOT EXISTS "organization_slug_uidx" ON "organization" ("slug");
CREATE INDEX IF NOT EXISTS "member_organizationId_idx" ON "member" ("organizationId");
CREATE INDEX IF NOT EXISTS "member_userId_idx" ON "member" ("userId");
CREATE INDEX IF NOT EXISTS "invitation_organizationId_idx" ON "invitation" ("organizationId");
CREATE INDEX IF NOT EXISTS "invitation_email_idx" ON "invitation" ("email");
