/** Safe SocialAccount columns — never include encrypted tokens in UI queries. */
export const socialAccountPublicSelect = {
  id: true,
  workspaceId: true,
  platform: true,
  accountName: true,
  externalAccountId: true,
  connectionStatus: true,
  lastError: true,
  tokenExpiry: true,
  createdAt: true,
  updatedAt: true,
} as const;

export const integrationPublicSelect = {
  id: true,
  workspaceId: true,
  provider: true,
  status: true,
  lastError: true,
  metadata: true,
  tokenExpiry: true,
  createdAt: true,
  updatedAt: true,
} as const;
