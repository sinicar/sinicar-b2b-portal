export type RefreshResult = {
  accessToken: string;
  expiresAt?: string; // ISO
};

export type RefreshError = {
  code: "REFRESH_FAILED" | "NO_REFRESH_TOKEN" | "UNKNOWN";
  message: string;
};
