import type { Access, FieldAccess, PayloadRequest } from "payload";

/**
 * CMS roles (users.roles): Administrator and Developer manage users and run imports; Editors
 * edit content; "User" accounts (e.g. imported team profiles) can't change anything.
 *
 * Safeguard against lock-out: until at least one account has the Administrator or Developer
 * role, every logged-in user is treated as an administrator.
 */
const ADMIN_ROLES = ["administrator", "developer"];
const EDITOR_ROLES = [...ADMIN_ROLES, "editor"];

type RoleUser = { roles?: string[] | null } | null | undefined;
const has = (user: RoleUser, roles: string[]) => (user?.roles ?? []).some((r) => roles.includes(r));

async function noAdminsYet(req: PayloadRequest) {
  const { totalDocs } = await req.payload.count({
    collection: "users",
    where: { roles: { in: ADMIN_ROLES } },
    overrideAccess: true,
    req,
  });
  return totalDocs === 0;
}

export async function isAdmin(req: PayloadRequest): Promise<boolean> {
  if (!req.user) return false;
  return has(req.user as RoleUser, ADMIN_ROLES) || noAdminsYet(req);
}

export async function isEditor(req: PayloadRequest): Promise<boolean> {
  if (!req.user) return false;
  return has(req.user as RoleUser, EDITOR_ROLES) || noAdminsYet(req);
}

export const adminOnly: Access = ({ req }) => isAdmin(req);
export const editorsOnly: Access = ({ req }) => isEditor(req);
export const adminOnlyField: FieldAccess = ({ req }) => isAdmin(req);
/** Admins, or the user editing their own account. */
export const adminOrSelf: Access = async ({ req, id }) =>
  Boolean(req.user && (String(req.user.id) === String(id) || (await isAdmin(req))));
