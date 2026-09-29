import { BooleanRequest, EmptyRequest } from "@shared/proto/cline/common"
import { ToggleMcpServerRequest } from "@shared/proto/cline/mcp"
import { convertProtoMcpServersToMcpServers } from "@shared/proto-conversions/mcp/mcp-server-conversion"
import { VSCodeButton, VSCodeCheckbox, VSCodeLink } from "@vscode/webview-ui-toolkit/react"
import {
	AlertCircle,
	CheckCircle2,
	Code2,
	Cpu,
	Database,
	ExternalLink,
	Eye,
	EyeOff,
	Key,
	Layers,
	Server,
	ShieldCheck,
	Sparkles,
} from "lucide-react"
import React, { memo, useEffect, useMemo, useState } from "react"
import { useExtensionState } from "@/context/ExtensionStateContext"
import { AccountServiceClient, McpServiceClient, StateServiceClient } from "@/services/grpc-client"
import { useApiConfigurationHandlers } from "../settings/utils/useApiConfigurationHandlers"

const SAP_MCP_METADATA = [
	{
		id: "sap-cap-cds",
		name: "SAP CAP (CDS)",
		package: "@cap-js/mcp-server",
		icon: Database,
		description: "Inspect CDS models, query OData services, entity definitions, and CAP logic hooks.",
		recommended: true,
	},
	{
		id: "sap-fiori",
		name: "SAP Fiori Elements",
		package: "@sap-ux/fiori-mcp-server",
		icon: Layers,
		description: "Generate Fiori pages, edit manifests, and manage UI annotations (XML/CDS).",
		recommended: true,
	},
	{
		id: "sap-ui5",
		name: "SAPUI5 Tools & Linter",
		package: "@ui5/mcp-server",
		icon: Code2,
		description: "UI5 API references, SAP Horizon guidelines, syntax validation, and UI5 linter.",
		recommended: true,
	},
	{
		id: "sap-abap-adt",
		name: "SAP ABAP ADT Bridge",
		package: "@sap/abap-mcp-server",
		icon: Server,
		description: "ADT bridge to interact with the ABAP Data Dictionary, classes, and CDS views (On-Premise / BTP).",
		recommended: false,
	},
]

const SAP_FOUNDATION_MODELS = [
	{
		id: "anthropic--claude-3.5-sonnet",
		name: "Claude 3.5 Sonnet (SAP AI Core)",
		description: "Recommended for complex CAP architecture, deep reasoning, and ABAP code.",
		tag: "Recommended",
	},
	{
		id: "gpt-4o",
		name: "GPT-4o (SAP AI Core)",
		description: "Great for multi-file generation, Fiori Elements, and UI5 components.",
		tag: "Versatile",
	},
	{
		id: "gemini-1.5-pro",
		name: "Gemini 1.5 Pro (SAP AI Core)",
		description: "Ideal for large context analysis and enterprise documentation.",
		tag: "Large Context",
	},
]

export const WelcomeView = memo(() => {
	const { apiConfiguration, mcpServers, setMcpServers } = useExtensionState()
	const { handleFieldsChange } = useApiConfigurationHandlers()

	const [authTab, setAuthTab] = useState<"sso" | "service_key">("service_key")
	const [rawServiceKeyJson, setRawServiceKeyJson] = useState("")
	const [jsonParseError, setJsonParseError] = useState<string | null>(null)
	const [jsonParseSuccess, setJsonParseSuccess] = useState<string | null>(null)
	const [showManualFields, setShowManualFields] = useState(false)
	const [showSecret, setShowSecret] = useState(false)
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [isLoggingIn, setIsLoggingIn] = useState(false)

	// Local credentials state initialized from existing configuration
	const [clientId, setClientId] = useState(apiConfiguration?.sapAiCoreClientId || "")
	const [clientSecret, setClientSecret] = useState(apiConfiguration?.sapAiCoreClientSecret || "")
	const [baseUrl, setBaseUrl] = useState(apiConfiguration?.sapAiCoreBaseUrl || "")
	const [tokenUrl, setTokenUrl] = useState(apiConfiguration?.sapAiCoreTokenUrl || "")
	const [resourceGroup, setResourceGroup] = useState(apiConfiguration?.sapAiResourceGroup || "default")
	const [selectedModel, setSelectedModel] = useState(
		apiConfiguration?.actModeApiModelId || "anthropic--claude-3.5-sonnet",
	)

	// Automatic parsing when user pastes JSON in the service key area
	const handleJsonPaste = (text: string) => {
		setRawServiceKeyJson(text)
		setJsonParseError(null)
		setJsonParseSuccess(null)

		const trimmed = text.trim()
		if (!trimmed) {
			return
		}

		try {
			const parsed = JSON.parse(trimmed)
			const extractedClientId = parsed.clientid || parsed.clientId || parsed.client_id
			const extractedClientSecret = parsed.clientsecret || parsed.clientSecret || parsed.client_secret
			const rawUrl = parsed.url || parsed.tokenurl || parsed.tokenUrl || parsed.authUrl
			const extractedBaseUrl =
				parsed.serviceurls?.AI_API_URL ||
				parsed.serviceUrls?.AI_API_URL ||
				parsed.baseUrl ||
				parsed.base_url ||
				parsed.url

			if (!extractedClientId || !extractedClientSecret) {
				setJsonParseError("JSON does not contain a valid 'clientid' or 'clientsecret'.")
				return
			}

			let extractedTokenUrl = rawUrl
			if (extractedTokenUrl && !extractedTokenUrl.endsWith("/oauth/token")) {
				extractedTokenUrl = extractedTokenUrl.replace(/\/+$/, "") + "/oauth/token"
			}

			if (extractedClientId) setClientId(extractedClientId)
			if (extractedClientSecret) setClientSecret(extractedClientSecret)
			if (extractedBaseUrl) setBaseUrl(extractedBaseUrl.replace(/\/+$/, ""))
			if (extractedTokenUrl) setTokenUrl(extractedTokenUrl)
			if (parsed.resourceGroup || parsed.resource_group) {
				setResourceGroup(parsed.resourceGroup || parsed.resource_group)
			}

			setJsonParseSuccess("SAP AI Core service key parsed successfully!")
		} catch (_err) {
			setJsonParseError("Invalid JSON format. Please make sure to paste the raw service key.")
		}
	}

	const handleToggleMcp = async (serverName: string, currentDisabled: boolean) => {
		try {
			const response = await McpServiceClient.toggleMcpServer(
				ToggleMcpServerRequest.create({
					serverName,
					disabled: !currentDisabled,
				}),
			)
			if (response?.mcpServers) {
				setMcpServers(convertProtoMcpServersToMcpServers(response.mcpServers))
			}
		} catch (error) {
			console.error(`Error toggling MCP server ${serverName}:`, error)
		}
	}

	const handleSsoLogin = async () => {
		setIsLoggingIn(true)
		try {
			await AccountServiceClient.accountLoginClicked(EmptyRequest.create())
		} catch (error) {
			console.error("SSO login failed:", error)
		} finally {
			setIsLoggingIn(false)
		}
	}

	const handleCompleteOnboarding = async (skipValidation = false) => {
		setIsSubmitting(true)
		try {
			if (!skipValidation) {
				await handleFieldsChange({
					planModeApiProvider: "sapaicore",
					actModeApiProvider: "sapaicore",
					planModeApiModelId: selectedModel,
					actModeApiModelId: selectedModel,
					sapAiCoreClientId: clientId.trim(),
					sapAiCoreClientSecret: clientSecret.trim(),
					sapAiCoreBaseUrl: baseUrl.trim(),
					sapAiCoreTokenUrl: tokenUrl.trim(),
					sapAiResourceGroup: resourceGroup.trim(),
					sapAiCoreUseOrchestrationMode: true,
				})
			}
			await StateServiceClient.setWelcomeViewCompleted(BooleanRequest.create({ value: true }))
		} catch (error) {
			console.error("Failed to complete onboarding:", error)
		} finally {
			setIsSubmitting(false)
		}
	}

	return (
		<div className="fixed inset-0 overflow-y-auto bg-background text-foreground flex justify-center p-4 sm:p-6">
			<div className="w-full max-w-2xl flex flex-col gap-6 pb-12">
				{/* SAP Brand Header */}
				<div className="flex flex-col items-center text-center pt-4">
					<div className="relative mb-3 flex items-center justify-center">
						<div className="size-16 rounded-2xl bg-gradient-to-tr from-[#0070f2] to-[#00b0d9] flex items-center justify-center shadow-lg shadow-[#0070f2]/20">
							<ShieldCheck className="size-9 text-white" />
						</div>
						<div className="absolute -bottom-1 -right-1 bg-background rounded-full p-1 border border-border">
							<Sparkles className="size-4 text-[#e78c07]" />
						</div>
					</div>

					<div className="flex items-center gap-2">
						<h1 className="text-2xl font-bold tracking-tight text-foreground">Zcline</h1>
						<span className="px-2 py-0.5 text-[11px] font-semibold rounded-full bg-[#0070f2]/10 text-[#0070f2] border border-[#0070f2]/30">
							SAP AI Core Exclusive
						</span>
					</div>

					<p className="mt-1.5 text-sm text-(--vscode-descriptionForeground) max-w-md">
						Autonomous AI coding assistant tailored for <strong>SAP BTP</strong>,{" "}
						<strong>SAP CAP (CDS)</strong>, <strong>SAP Fiori Elements</strong>, <strong>SAPUI5</strong>, and{" "}
						<strong>ABAP</strong>.
					</p>
				</div>

				{/* Step 1: Authentication & Access */}
				<div className="rounded-xl border border-border bg-sidebar-background/60 p-4 sm:p-5 flex flex-col gap-4 shadow-sm">
					<div className="flex items-center justify-between border-b border-border pb-3">
						<div className="flex items-center gap-2">
							<Key className="size-4 text-[#0070f2]" />
							<h2 className="text-sm font-semibold uppercase tracking-wider text-foreground">
								1. SAP Access & Authentication
							</h2>
						</div>
						<span className="text-[11px] text-(--vscode-descriptionForeground)">Step 1 of 3</span>
					</div>

					{/* Mode Tabs */}
					<div className="grid grid-cols-2 gap-2 bg-input-background p-1 rounded-lg border border-border">
						<button
							className={`py-2 px-3 text-xs font-medium rounded-md transition-all flex items-center justify-center gap-1.5 ${
								authTab === "service_key"
									? "bg-[#0070f2] text-white shadow-sm"
									: "text-(--vscode-descriptionForeground) hover:text-foreground"
							}`}
							onClick={() => setAuthTab("service_key")}
							type="button">
							<Key className="size-3.5" />
							Service Key (No Account / BYOK)
						</button>
						<button
							className={`py-2 px-3 text-xs font-medium rounded-md transition-all flex items-center justify-center gap-1.5 ${
								authTab === "sso"
									? "bg-[#0070f2] text-white shadow-sm"
									: "text-(--vscode-descriptionForeground) hover:text-foreground"
							}`}
							onClick={() => setAuthTab("sso")}
							type="button">
							<ShieldCheck className="size-3.5" />
							Enterprise SSO (Microsoft / SAP)
						</button>
					</div>

					{/* Tab Content: SSO */}
					{authTab === "sso" && (
						<div className="flex flex-col gap-3 py-2">
							<p className="text-xs text-(--vscode-descriptionForeground) leading-relaxed">
								Sign in through your corporate directory (Microsoft Entra ID or SAP Cloud Identity Services).
								Enables centralized governance, department quotas, and internal token chargeback.
							</p>

							<VSCodeButton
								appearance="primary"
								className="w-full mt-1 bg-[#0070f2] hover:bg-[#0056b3]"
								disabled={isLoggingIn}
								onClick={handleSsoLogin}>
								<span className="codicon codicon-shield mr-1.5" />
								Enterprise SSO Sign In
								{isLoggingIn && <span className="ml-2 animate-spin codicon codicon-refresh" />}
							</VSCodeButton>

							<div className="flex items-center gap-2 mt-1 text-[11px] text-(--vscode-descriptionForeground)">
								<CheckCircle2 className="size-3.5 text-emerald-500" />
								<span>Compatible with enterprise telemetry and cost tracking.</span>
							</div>
						</div>
					)}

					{/* Tab Content: Service Key JSON */}
					{authTab === "service_key" && (
						<div className="flex flex-col gap-3">
							<div className="flex items-center justify-between">
								<label className="text-xs font-medium text-foreground">
									Paste your SAP AI Core Service Key JSON:
								</label>
								<VSCodeLink
									className="text-[11px] inline-flex items-center gap-1"
									href="https://help.sap.com/docs/sap-ai-core/sap-ai-core-service-guide/create-service-key">
									Create key in BTP
									<ExternalLink className="size-3" />
								</VSCodeLink>
							</div>

							<div className="relative">
								<textarea
									className="w-full h-24 p-2.5 text-xs font-mono bg-input-background border border-input-border rounded-md resize-none focus:outline-none focus:border-[#0070f2] text-foreground"
									onChange={(e) => handleJsonPaste(e.target.value)}
									placeholder='{ "clientid": "sb-...", "clientsecret": "...", "url": "https://...", "serviceurls": { "AI_API_URL": "..." } }'
									value={rawServiceKeyJson}
								/>
							</div>

							{jsonParseSuccess && (
								<div className="flex items-center gap-1.5 p-2 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs">
									<CheckCircle2 className="size-4 shrink-0" />
									<span>{jsonParseSuccess}</span>
								</div>
							)}

							{jsonParseError && (
								<div className="flex items-center gap-1.5 p-2 rounded bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
									<AlertCircle className="size-4 shrink-0" />
									<span>{jsonParseError}</span>
								</div>
							)}

							{/* Collapsible Manual Fields */}
							<div className="mt-1">
								<button
									className="text-xs text-[#0070f2] hover:underline flex items-center gap-1 cursor-pointer bg-transparent border-none p-0"
									onClick={() => setShowManualFields(!showManualFields)}
									type="button">
									{showManualFields ? "Hide detailed parameters" : "View or edit manual parameters"}
								</button>

								{showManualFields && (
									<div className="mt-3 flex flex-col gap-2.5 pt-3 border-t border-border">
										<div className="flex flex-col gap-1">
											<span className="text-[11px] font-medium text-(--vscode-descriptionForeground)">
												AI Core Client ID
											</span>
											<input
												className="p-1.5 text-xs bg-input-background border border-input-border rounded text-foreground font-mono"
												onChange={(e) => setClientId(e.target.value)}
												placeholder="sb-..."
												type="text"
												value={clientId}
											/>
										</div>

										<div className="flex flex-col gap-1">
											<div className="flex items-center justify-between">
												<span className="text-[11px] font-medium text-(--vscode-descriptionForeground)">
													AI Core Client Secret
												</span>
												<button
													className="text-[11px] text-(--vscode-descriptionForeground) hover:text-foreground flex items-center gap-1 bg-transparent border-none cursor-pointer"
													onClick={() => setShowSecret(!showSecret)}
													type="button">
													{showSecret ? <EyeOff className="size-3" /> : <Eye className="size-3" />}
													{showSecret ? "Hide" : "Show"}
												</button>
											</div>
											<input
												className="p-1.5 text-xs bg-input-background border border-input-border rounded text-foreground font-mono"
												onChange={(e) => setClientSecret(e.target.value)}
												placeholder="••••••••••••••••"
												type={showSecret ? "text" : "password"}
												value={clientSecret}
											/>
										</div>

										<div className="flex flex-col gap-1">
											<span className="text-[11px] font-medium text-(--vscode-descriptionForeground)">
												AI Core Base URL (AI_API_URL)
											</span>
											<input
												className="p-1.5 text-xs bg-input-background border border-input-border rounded text-foreground font-mono"
												onChange={(e) => setBaseUrl(e.target.value)}
												placeholder="https://api.ai.prod.eu-central-1.aws.ml.hana.ondemand.com"
												type="text"
												value={baseUrl}
											/>
										</div>

										<div className="flex flex-col gap-1">
											<span className="text-[11px] font-medium text-(--vscode-descriptionForeground)">
												OAuth Token URL
											</span>
											<input
												className="p-1.5 text-xs bg-input-background border border-input-border rounded text-foreground font-mono"
												onChange={(e) => setTokenUrl(e.target.value)}
												placeholder="https://subdomain.authentication.eu10.hana.ondemand.com/oauth/token"
												type="text"
												value={tokenUrl}
											/>
										</div>

										<div className="flex flex-col gap-1">
											<span className="text-[11px] font-medium text-(--vscode-descriptionForeground)">
												Resource Group (Optional)
											</span>
											<input
												className="p-1.5 text-xs bg-input-background border border-input-border rounded text-foreground font-mono"
												onChange={(e) => setResourceGroup(e.target.value)}
												placeholder="default"
												type="text"
												value={resourceGroup}
											/>
										</div>
									</div>
								)}
							</div>

							<div className="flex items-center gap-2 mt-1 text-[11px] text-(--vscode-descriptionForeground)">
								<ShieldCheck className="size-3.5 text-emerald-500" />
								<span>Your credentials are encrypted and stored locally in VS Code SecretStorage.</span>
							</div>
						</div>
					)}
				</div>

				{/* Step 2: Pre-installed SAP MCP Servers */}
				<div className="rounded-xl border border-border bg-sidebar-background/60 p-4 sm:p-5 flex flex-col gap-4 shadow-sm">
					<div className="flex items-center justify-between border-b border-border pb-3">
						<div className="flex items-center gap-2">
							<Cpu className="size-4 text-[#0070f2]" />
							<h2 className="text-sm font-semibold uppercase tracking-wider text-foreground">
								2. Pre-installed Official SAP MCP Servers
							</h2>
						</div>
						<span className="text-[11px] text-(--vscode-descriptionForeground)">Step 2 of 3</span>
					</div>

					<p className="text-xs text-(--vscode-descriptionForeground) leading-relaxed">
						Zcline comes pre-configured with official Model Context Protocol (MCP) servers for the SAP ecosystem.
						The AI agent can directly inspect CDS models, UI5 standards, and Fiori apps:
					</p>

					<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
						{SAP_MCP_METADATA.map((mcp) => {
							const existingServer = mcpServers?.find((s) => s.name === mcp.id)
							const isDisabled = existingServer ? !!existingServer.disabled : !mcp.recommended
							const IconComponent = mcp.icon

							return (
								<div
									className={`p-3 rounded-lg border transition-all flex flex-col justify-between gap-2.5 ${
										!isDisabled
											? "border-[#0070f2]/50 bg-[#0070f2]/5"
											: "border-border bg-input-background/40 opacity-70"
									}`}
									key={mcp.id}>
									<div className="flex flex-col gap-1.5">
										<div className="flex items-start justify-between gap-2">
											<div className="flex items-center gap-2">
												<div className="p-1.5 rounded-md bg-[#0070f2]/10 text-[#0070f2]">
													<IconComponent className="size-4" />
												</div>
												<span className="text-xs font-semibold text-foreground">{mcp.name}</span>
											</div>
											<VSCodeCheckbox
												checked={!isDisabled}
												onChange={() => handleToggleMcp(mcp.id, isDisabled)}
											/>
										</div>

										<p className="text-[11px] text-(--vscode-descriptionForeground) leading-normal line-clamp-2">
											{mcp.description}
										</p>
									</div>

									<div className="flex items-center justify-between pt-1 border-t border-border/50 text-[10px]">
										<code className="text-(--vscode-descriptionForeground)">{mcp.package}</code>
										<span
											className={`px-1.5 py-0.5 rounded font-medium ${
												!isDisabled
													? "bg-emerald-500/10 text-emerald-400"
													: "bg-slate-500/10 text-(--vscode-descriptionForeground)"
											}`}>
											{!isDisabled ? "Active" : "Disabled"}
										</span>
									</div>
								</div>
							)
						})}
					</div>
				</div>

				{/* Step 3: Foundation Model Selection */}
				<div className="rounded-xl border border-border bg-sidebar-background/60 p-4 sm:p-5 flex flex-col gap-4 shadow-sm">
					<div className="flex items-center justify-between border-b border-border pb-3">
						<div className="flex items-center gap-2">
							<Sparkles className="size-4 text-[#0070f2]" />
							<h2 className="text-sm font-semibold uppercase tracking-wider text-foreground">
								3. SAP AI Core Foundation Model
							</h2>
						</div>
						<span className="text-[11px] text-(--vscode-descriptionForeground)">Step 3 of 3</span>
					</div>

					<div className="grid grid-cols-1 gap-2.5">
						{SAP_FOUNDATION_MODELS.map((model) => {
							const isSelected = selectedModel === model.id
							return (
								<div
									className={`p-3 rounded-lg border cursor-pointer transition-all flex items-center justify-between gap-3 ${
										isSelected
											? "border-[#0070f2] bg-[#0070f2]/10 shadow-sm"
											: "border-border bg-input-background/30 hover:border-border/80"
									}`}
									key={model.id}
									onClick={() => setSelectedModel(model.id)}>
									<div className="flex flex-col gap-0.5">
										<div className="flex items-center gap-2">
											<span className="text-xs font-semibold text-foreground">{model.name}</span>
											<span className="text-[10px] px-1.5 py-0.2 rounded bg-[#0070f2]/15 text-[#0070f2] font-medium">
												{model.tag}
											</span>
										</div>
										<p className="text-[11px] text-(--vscode-descriptionForeground)">{model.description}</p>
									</div>

									<div
										className={`size-4 rounded-full border flex items-center justify-center shrink-0 ${
											isSelected ? "border-[#0070f2] bg-[#0070f2]" : "border-border"
										}`}>
										{isSelected && <div className="size-1.5 rounded-full bg-white" />}
									</div>
								</div>
							)
						})}
					</div>
				</div>

				{/* Final Submission Buttons */}
				<div className="flex flex-col gap-2.5 pt-2">
					<VSCodeButton
						appearance="primary"
						className="w-full py-2.5 text-sm font-semibold bg-[#0070f2] hover:bg-[#0056b3]"
						disabled={isSubmitting}
						onClick={() => handleCompleteOnboarding(false)}>
						<span className="codicon codicon-rocket mr-2" />
						Get Started with Zcline
						{isSubmitting && <span className="ml-2 animate-spin codicon codicon-refresh" />}
					</VSCodeButton>

					<div className="flex items-center justify-center">
						<button
							className="text-xs text-(--vscode-descriptionForeground) hover:text-foreground hover:underline bg-transparent border-none cursor-pointer py-1"
							onClick={() => handleCompleteOnboarding(true)}
							type="button">
							Explore workspace without configuring now &rarr;
						</button>
					</div>
				</div>
			</div>
		</div>
	)
})

export default WelcomeView

