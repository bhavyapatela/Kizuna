import {
  Shield,
  Briefcase,
  User,
  CreditCard,
  Globe,
  Server,
  Heart,
  Star,
  KeyRound,
  StickyNote,
  IdCard,
  type LucideIcon,
} from "lucide-react";
import type { VaultIcon, VaultItemType } from "@/types";

export const VAULT_ICONS: Record<VaultIcon, LucideIcon> = {
  shield: Shield,
  briefcase: Briefcase,
  user: User,
  "credit-card": CreditCard,
  globe: Globe,
  server: Server,
  heart: Heart,
  star: Star,
};

export const VAULT_ICON_OPTIONS = Object.keys(VAULT_ICONS) as VaultIcon[];

export const ITEM_TYPE_META: Record<
  VaultItemType,
  { label: string; icon: LucideIcon }
> = {
  login: { label: "Login", icon: KeyRound },
  card: { label: "Card", icon: CreditCard },
  note: { label: "Secure Note", icon: StickyNote },
  identity: { label: "Identity", icon: IdCard },
};

export const ITEM_TYPES = Object.keys(ITEM_TYPE_META) as VaultItemType[];
