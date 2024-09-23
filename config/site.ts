export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: "Messecure",
  description: "Secure end-to-end encrypted communication.",
  navItems: [
    {
      label: "Home",
      href: "/",
    },
    {
      label: "Docs",
      href: "/docs",
    }
  ],
  navMenuItems: [
    {
      label: "Profile",
      href: "/profile",
    },
    {
      label: "Dashboard",
      href: "/dashboard",
    },
    {
      label: "Projects",
      href: "/projects",
    },
    {
      label: "Team",
      href: "/team",
    },
    {
      label: "Calendar",
      href: "/calendar",
    },
    {
      label: "Settings",
      href: "/settings",
    },
    {
      label: "Help & Feedback",
      href: "/help-feedback",
    },
    {
      label: "Logout",
      href: "/logout",
    },
  ],
  authentication: {
    login: {
      label: "Login",
      href: "/login",
    },
    logout: {
      label: "Logout",
      href: "/logout",
    },
  },
  links: {
    github: "https://github.com/TA72-Projet-Tutore-Messecure",
  },
};
