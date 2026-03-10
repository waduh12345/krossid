import { useMemo } from "react";
import type { User } from "@/types/user";

export interface PackageAccess {
  /** Whether the user has an active (non-expired) package */
  isActive: boolean;
  /** Package type: "Learning Only" | "Learning + Affiliate" | null */
  typePackage: "Learning Only" | "Learning + Affiliate" | null;
  /** Days remaining until package expires (negative if expired) */
  daysRemaining: number | null;
  /** Package is expiring within 3 days */
  isExpiringSoon: boolean;
  /** Package has expired */
  isExpired: boolean;
  /** Active until date string */
  activeUntil: string | null;
  /** Can share to WhatsApp (Learning + Affiliate only, and active) */
  canShareWhatsApp: boolean;
  /** Can register program (Learning + Affiliate only, and active) */
  canRegisterProgram: boolean;
  /** Can do quiz (any active package) */
  canDoQuiz: boolean;
}

export function usePackageAccess(userData: User | undefined | null): PackageAccess {
  return useMemo(() => {
    const noAccess: PackageAccess = {
      isActive: false,
      typePackage: null,
      daysRemaining: null,
      isExpiringSoon: false,
      isExpired: false,
      activeUntil: null,
      canShareWhatsApp: false,
      canRegisterProgram: false,
      canDoQuiz: false,
    };

    if (!userData) return noAccess;

    // Determine package info from either owner or sales perspective
    let typePackage: "Learning Only" | "Learning + Affiliate" | null = null;
    let activeUntil: string | null = null;
    let hasPackage = false;

    if (userData.active_package_registration) {
      // Owner role
      const reg = userData.active_package_registration;
      typePackage = reg.package.type_package;
      activeUntil = reg.active_until;
      hasPackage = true;
    } else if (userData.owner_package) {
      // Sales role
      const pkg = userData.owner_package;
      typePackage = pkg.type_package;
      activeUntil = pkg.active_until;
      hasPackage = pkg.status === true;
    }

    if (!hasPackage || !activeUntil) return noAccess;

    // Calculate days remaining
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const until = new Date(activeUntil);
    until.setHours(0, 0, 0, 0);
    const diffMs = until.getTime() - now.getTime();
    const daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    const isExpired = daysRemaining < 0;
    const isExpiringSoon = !isExpired && daysRemaining <= 3;
    const isActive = !isExpired;

    const isAffiliate = typePackage === "Learning + Affiliate";

    return {
      isActive,
      typePackage,
      daysRemaining,
      isExpiringSoon,
      isExpired,
      activeUntil,
      canShareWhatsApp: isActive && isAffiliate,
      canRegisterProgram: isActive && isAffiliate,
      canDoQuiz: isActive,
    };
  }, [userData]);
}
