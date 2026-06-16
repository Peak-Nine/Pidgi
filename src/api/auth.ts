/**
 * OAuth2 Authentication for Teamleader Focus API
 *
 * Handles token refresh and management.
 * Token endpoint: https://focus.teamleader.eu/oauth2/access_token
 * Refresh token is persisted to TOKEN_FILE to survive MCP restarts.
 */

import { readFileSync, writeFileSync, unlinkSync } from "fs";
import { homedir } from "os";
import { join } from "path";
import type { TeamleaderAuthConfig, TokenResponse } from "../types/index.js";

const TOKEN_URL = "https://focus.teamleader.eu/oauth2/access_token";
const TOKEN_BUFFER_MS = 60_000; // Refresh 60s before expiry
const TOKEN_FILE = join(homedir(), ".teamleader-tokens.json");

export function loadRefreshToken(fallback: string): string {
  try {
    const data = JSON.parse(readFileSync(TOKEN_FILE, "utf-8"));
    if (data.refresh_token) return data.refresh_token;
  } catch (e) {
    console.warn("Token file not found, using env var fallback:", e);
  }
  return fallback;
}

export class TeamleaderAuth {
  private config: TeamleaderAuthConfig;

  constructor(config: TeamleaderAuthConfig) {
    this.config = { ...config };
  }

  /**
   * Get a valid access token, refreshing if necessary.
   */
  async getAccessToken(): Promise<string> {
    if (this.isTokenValid()) {
      return this.config.accessToken!;
    }
    await this.refreshAccessToken();
    return this.config.accessToken!;
  }

  /**
   * Get the current refresh token (may have been rotated).
   */
  getRefreshToken(): string {
    return this.config.refreshToken;
  }

  private isTokenValid(): boolean {
    if (!this.config.accessToken || !this.config.tokenExpiresAt) {
      return false;
    }
    return Date.now() < this.config.tokenExpiresAt - TOKEN_BUFFER_MS;
  }

  private async refreshAccessToken(): Promise<void> {
    const body = new URLSearchParams({
      client_id: this.config.clientId,
      client_secret: this.config.clientSecret,
      refresh_token: this.config.refreshToken,
      grant_type: "refresh_token",
    });

    const response = await fetch(TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      const isRevoked = response.status === 400 && errorText.includes("invalid_grant");
      if (isRevoked) {
        // Try reloading from file — a newer rotated token may have been written by another instance
        const fileToken = loadRefreshToken("");
        if (fileToken && fileToken !== this.config.refreshToken) {
          this.config.refreshToken = fileToken;
          return this.refreshAccessToken();
        }
        // File token is same or missing — truly revoked, clean up and surface clear error
        try { unlinkSync(TOKEN_FILE); } catch (_) {}
        throw new Error(
          "Teamleader refresh token revoked. Re-authenticate via /mcp reconnect or run teamleader_login."
        );
      }
      throw new Error(
        `Failed to refresh Teamleader token: ${response.status} ${response.statusText} - ${errorText}`
      );
    }

    const data = (await response.json()) as TokenResponse;

    this.config.accessToken = data.access_token;
    this.config.tokenExpiresAt = Date.now() + data.expires_in * 1000;

    // Teamleader rotates refresh tokens — persist to file
    if (data.refresh_token) {
      this.config.refreshToken = data.refresh_token;
      try {
        writeFileSync(TOKEN_FILE, JSON.stringify({ refresh_token: data.refresh_token }, null, 2));
      } catch (e) {
        console.warn("Warning: could not persist refresh token to", TOKEN_FILE, e);
      }
    }
  }
}
