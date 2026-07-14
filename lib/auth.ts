import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { organization, admin } from "better-auth/plugins";
import { createAccessControl } from "better-auth/plugins/access";
import { dbPool } from "./db";

// Define complete statement combining default organization resources + custom deliveryJob resource
const statement = {
  organization: ["update", "delete"],
  member: ["create", "update", "delete"],
  invitation: ["create", "cancel"],
  team: ["create", "update", "delete"],
  ac: ["create", "read", "update", "delete"],
  deliveryJob: ["create", "read", "update", "delete"],
  userAccount: ["create", "read", "update", "delete"],
} as const;

export const ac = createAccessControl(statement);

// Map permissions for standard and custom organization roles
export const roles = {
  owner: ac.newRole({
    organization: ["update", "delete"],
    member: ["create", "update", "delete"],
    invitation: ["create", "cancel"],
    team: ["create", "update", "delete"],
    ac: ["create", "read", "update", "delete"],
    deliveryJob: ["create", "read", "update", "delete"],
    userAccount: ["create", "read", "update", "delete"],
  }),
  admin: ac.newRole({
    organization: ["update"],
    member: ["create", "update", "delete"],
    invitation: ["create", "cancel"],
    team: ["create", "update", "delete"],
    ac: ["create", "read", "update", "delete"],
    deliveryJob: ["create", "read", "update", "delete"],
    userAccount: ["create", "read", "update", "delete"],
  }),
  member: ac.newRole({
    organization: [],
    member: [],
    invitation: [],
    team: [],
    ac: ["read"],
    deliveryJob: ["create", "read", "update"], // member can create, read, update deliveryJob
    userAccount: ["read"],
  }),
  user: ac.newRole({
    organization: [],
    member: [],
    invitation: [],
    team: [],
    ac: ["read"],
    deliveryJob: [],
    // user role has access to CRUD their userAccount (enforced/filtered to own account at application level)
    userAccount: ["create", "read", "update", "delete"],
  }),
};

export const auth = betterAuth({
  database: dbPool,
  emailAndPassword: {
    enabled: true,
  },
  plugins: [
    organization({
      allowUserToCreateOrganization: true,
      ac: ac,
      roles: roles,
      dynamicAccessControl: {
        enabled: true,
      },
    }),
    admin(),
    nextCookies(),
  ],
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          user.role = "admin";
          return {
            data: user,
          };
        },
      },
    },
  },
});
