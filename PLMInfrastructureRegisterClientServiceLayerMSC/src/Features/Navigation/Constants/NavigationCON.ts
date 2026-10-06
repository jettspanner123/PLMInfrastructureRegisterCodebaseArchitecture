import type { LucideIcon } from 'lucide-react';
import { Server, Globe } from 'lucide-react';

export interface NavItemDef {
  id: string;
  label: string;
  icon: LucideIcon;
  disabled?: boolean;
}

export default class NavigationCON {
  public static readonly BRAND_TITLE: string = 'InfraGrid';
  public static readonly BRAND_SUBTITLE: string = 'Azure Infrastructure Register';

  // Top-nav capsule, ported 1:1 (visual + shared-layout-pill mechanics) from
  // Monitoring Dashboard's own navbar. Unlike Monitoring Dashboard's version
  // (whose options are separate sibling applications), these options are
  // real in-app sections.
  public static readonly PRIMARY_NAV_ITEMS: NavItemDef[] = [
    { id: 'infrastructure-register', label: 'Infrastructure Register', icon: Server },
    { id: 'environment-overview', label: 'Environment Overview', icon: Globe },
  ];

  // This register has no authentication system yet, so the profile dropdown's
  // identity block is always this static, generic content.
  public static readonly PROFILE_INITIALS: string = 'EU';
  public static readonly PROFILE_DISPLAY_NAME: string = 'Enterprise User';
  public static readonly PROFILE_DISPLAY_EMAIL: string = 'user@theweplm.com';
  public static readonly PROFILE_DISPLAY_ROLE: string = 'USER';

  public static readonly SIGN_OUT_TITLE: string = 'Sign Out of InfraGrid';
  public static readonly SIGN_OUT_SUBTITLE: string = 'Enterprise Session Termination';
  public static readonly SIGN_OUT_DESCRIPTION: string =
    'Are you sure you want to sign out of your enterprise session? You will need to log back in to access your register.';
}
