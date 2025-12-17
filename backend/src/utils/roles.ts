export const Roles = {
  STUDENT: "student",
  ORGANIZER: "organizer",
  ADMIN: "admin",
} as const;

export type RoleType = (typeof Roles)[keyof typeof Roles];

export function isOrganizer(role: string): boolean {
  return role === Roles.ORGANIZER || role === Roles.ADMIN;
}

export function isAdmin(role: string): boolean {
  return role === Roles.ADMIN;
}

export function hasRole(userRole: string, requiredRoles: string[]): boolean {
  return requiredRoles.includes(userRole);
}
