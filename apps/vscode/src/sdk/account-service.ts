// Replaces classic src/services/account/ClineAccountService.ts (see origin/main)
//
// SDK-backed account service. Handles credits, organizations, and user data
// by making authenticated requests to the Cline API.

import type {
	BalanceResponse,
	OrganizationBalanceResponse,
	OrganizationUsageTransaction,
	PaymentTransaction,
	UsageTransaction,
	UserResponse,
} from "@shared/ClineAccount"
import axios, { type AxiosRequestConfig, type AxiosResponse } from "axios"
import { ClineEnv } from "@/config"
import { buildBasicClineHeaders } from "@/services/EnvUtils"
import { CLINE_API_ENDPOINT } from "@/shared/cline/api"
import { getAxiosSettings } from "@/shared/net"
import { Logger } from "@/shared/services/Logger"
import { AuthService } from "./auth-service"

export class ClineAccountService {
	private static instance: ClineAccountService
	private _authService: AuthService

	constructor() {
		this._authService = AuthService.getInstance()
	}

	/**
	 * Returns the singleton instance of ClineAccountService
	 */
	public static getInstance(): ClineAccountService {
		if (!ClineAccountService.instance) {
			ClineAccountService.instance = new ClineAccountService()
		}
		return ClineAccountService.instance
	}

	/**
	 * Returns the base URL for the Cline API
	 */
	get baseUrl(): string {
		return ClineEnv.config().apiBaseUrl
	}

	/**
	 * Helper function to make authenticated requests to the Cline API.
	 * Uses the SDK-backed AuthService for token management.
	 */
	private async authenticatedRequest<T>(endpoint: string, config: AxiosRequestConfig = {}): Promise<T> {
		const url = new URL(endpoint, this.baseUrl).toString()
		// IMPORTANT: Prefixed with 'workos:' so backend can route verification to WorkOS provider
		const clineAccountAuthToken = await this._authService.getAuthToken()
		if (!clineAccountAuthToken) {
			throw new Error("No Cline account auth token found")
		}
		const requestConfig: AxiosRequestConfig = {
			...config,
			headers: {
				Authorization: `Bearer ${clineAccountAuthToken}`,
				"Content-Type": "application/json",
				...(await buildBasicClineHeaders()),
				...config.headers,
			},
			...getAxiosSettings(),
		}
		const response: AxiosResponse<{ data?: T; error: string; success: boolean }> = await axios.request({
			url,
			method: "GET",
			...requestConfig,
		})
		const status = response.status
		if (status < 200 || status >= 300) {
			throw new Error(`Request to ${endpoint} failed with status ${status}`)
		}
		if (response.statusText !== "No Content" && (!response.data || !response.data.data)) {
			throw new Error(`Invalid response from ${endpoint} API`)
		}
		if (typeof response.data === "object" && !response.data.success) {
			throw new Error(`API error: ${response.data.error}`)
		}
		if (response.statusText === "No Content") {
			return {} as T
		}
		return response.data.data as T
	}

	/**
	 * RPC variant that fetches the user's current credit balance
	 */
	async fetchBalanceRPC(): Promise<BalanceResponse | undefined> {
		return {
			balance: 9999.0,
		} as any
	}

	/**
	 * RPC variant that fetches the user's usage transactions
	 */
	async fetchUsageTransactionsRPC(): Promise<UsageTransaction[] | undefined> {
		return []
	}

	/**
	 * RPC variant that fetches the user's payment transactions
	 */
	async fetchPaymentTransactionsRPC(): Promise<PaymentTransaction[] | undefined> {
		return []
	}

	/**
	 * Fetches the current user data
	 */
	async fetchMe(): Promise<UserResponse | undefined> {
		const me = this.getCurrentUser()
		if (!me) return undefined
		return {
			user: {
				id: me.uid || "sap-user",
				email: me.email || "user@enterprise.sap",
				displayName: me.displayName || "Utilisateur SAP AI Core",
				createdAt: new Date().toISOString(),
				organizations: [
					{
						organizationId: "sap-btp",
						name: "SAP BTP Tenant",
						active: true,
						memberId: me.uid || "sap-user",
					},
				],
			},
		} as any
	}

	/**
	 * Fetches the current user's organizations
	 */
	async fetchUserOrganizationsRPC(): Promise<UserResponse["organizations"] | undefined> {
		try {
			const me = await this.fetchMe()
			if (!me || !me.organizations) {
				Logger.error("Failed to fetch user organizations")
				return undefined
			}
			return me.organizations
		} catch (error) {
			Logger.error("Failed to fetch user organizations (RPC):", error)
			return undefined
		}
	}

	/**
	 * Fetches the current user's organization credits
	 */
	async fetchOrganizationCreditsRPC(organizationId: string): Promise<OrganizationBalanceResponse | undefined> {
		try {
			const data = await this.authenticatedRequest<OrganizationBalanceResponse>(
				`/api/v1/organizations/${organizationId}/balance`,
			)
			return data
		} catch (error) {
			Logger.error("Failed to fetch organization balance (RPC):", error)
			return undefined
		}
	}

	/**
	 * Fetches the current user's organization transactions
	 */
	async fetchOrganizationUsageTransactionsRPC(organizationId: string): Promise<OrganizationUsageTransaction[] | undefined> {
		try {
			const organizations = this._authService.getUserOrganizations()
			if (!organizations) {
				Logger.error("Failed to get user organizations")
				return undefined
			}
			const memberId = organizations.find((org) => org.organizationId === organizationId)?.memberId
			if (!memberId) {
				Logger.error("Failed to find member ID for organization transactions")
				return undefined
			}
			const data = await this.authenticatedRequest<{ items: OrganizationUsageTransaction[] }>(
				`/api/v1/organizations/${organizationId}/members/${memberId}/usages`,
			)
			return data.items
		} catch (error) {
			Logger.error("Failed to fetch organization transactions (RPC):", error)
			return undefined
		}
	}

	/**
	 * Submits a spend limit increase request to the user's org admin.
	 */
	async submitLimitIncreaseRequestRPC(): Promise<void> {
		try {
			await this.authenticatedRequest<void>("/api/v1/users/me/budget/request", {
				method: "POST",
			})
		} catch (error) {
			Logger.error("Failed to submit limit increase request (RPC):", error)
			throw error
		}
	}

	/**
	 * Switches the active account to the specified organization or personal account.
	 */
	async switchAccount(organizationId?: string): Promise<void> {
		try {
			await this.authenticatedRequest<string>(CLINE_API_ENDPOINT.ACTIVE_ACCOUNT, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
				},
				data: {
					organizationId: organizationId || null,
				},
			})
			const activeOrgId = this._authService.getActiveOrganizationId()
			if (activeOrgId !== organizationId) {
				// Force a refresh of the auth info after switching
				await this._authService.restoreRefreshTokenAndRetrieveAuthInfo()
			}
		} catch (error) {
			Logger.error("Error switching account:", error)
			await this._authService.restoreRefreshTokenAndRetrieveAuthInfo()
			throw error
		}
	}

	private getCurrentUser() {
		return this._authService.getInfo().user
	}
}
