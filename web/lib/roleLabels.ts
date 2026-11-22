// Display label for a user role. The API stores "brand" as the role
// value; the site calls that role "Business" everywhere a person sees it.
export function roleLabel(role: string): string {
  switch (role) {
    case "brand":
      return "Business";
    case "creator":
      return "Creator";
    case "professional":
      return "Professional";
    case "admin":
      return "Admin";
    default:
      return role ? role.charAt(0).toUpperCase() + role.slice(1) : role;
  }
}
