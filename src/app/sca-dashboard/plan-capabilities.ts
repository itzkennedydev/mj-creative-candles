/**
 * Plan capabilities utility
 * Provides feature flags based on plan type
 */

export type Plan = "free" | "pro" | "advanced" | "enterprise" | undefined | string;

export const getPlanCapabilities = (plan: Plan) => {
  return {
    canAddFolder: !!plan && !["free"].includes(plan),
    canManageFolderPermissions: !!plan && !["free", "pro"].includes(plan),
    canManageCustomers: !!plan && !["free", "pro"].includes(plan),
    canCreateWebhooks: !!plan && !["free", "pro"].includes(plan),
    canManageProgram: !!plan && !["free", "pro"].includes(plan),
    canTrackConversions: !!plan && !["free", "pro"].includes(plan),
    canExportAuditLogs: !!plan && ["enterprise"].includes(plan),
    canUseAdvancedRewardLogic:
      !!plan && ["enterprise", "advanced"].includes(plan),
    canMessagePartners: !!plan && ["enterprise", "advanced"].includes(plan),
    canSendEmailCampaigns: !!plan && ["enterprise", "advanced"].includes(plan),
    canDiscoverPartners: !!plan && ["enterprise", "advanced"].includes(plan),
  };
};

