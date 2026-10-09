import { Cloud, Palette } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import ApplicationRouteCON from '../../../Constants/ApplicationRouteCON';

export interface SettingsSidebarItemDef {
  key: string;
  label: string;
  icon: LucideIcon;
  path: string;
}

export default class SettingsCON {
  // In table order inside the sidebar - just these 2 for now, per the PRD.
  public static readonly SIDEBAR_ITEMS: SettingsSidebarItemDef[] = [
    { key: 'subscriptions', label: 'Subscriptions', icon: Cloud, path: ApplicationRouteCON.SETTINGS_SUBSCRIPTIONS },
    { key: 'editing', label: 'Editing', icon: Palette, path: ApplicationRouteCON.SETTINGS_EDITING },
  ];
}
