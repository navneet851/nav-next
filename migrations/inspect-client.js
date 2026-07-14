const { createAuthClient } = require("better-auth/client");
const { organizationClient } = require("better-auth/client/plugins");

const authClient = createAuthClient({
  plugins: [organizationClient()]
});

console.log("createOrgRole type:", typeof authClient.organization.createOrgRole);
console.log("createRole type:", typeof authClient.organization.createRole);
console.log("listOrgRoles type:", typeof authClient.organization.listOrgRoles);
console.log("listRoles type:", typeof authClient.organization.listRoles);
