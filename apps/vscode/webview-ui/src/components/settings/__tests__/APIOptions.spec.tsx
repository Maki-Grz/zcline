import { render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { ExtensionStateContextProvider } from "@/context/ExtensionStateContext"
import ApiOptions from "../ApiOptions"

vi.mock("../providers/SapAiCoreProvider", () => ({
	SapAiCoreProvider: vi.fn(() => <div data-testid="sap-ai-core-provider">SapAiCoreProviderMock</div>),
}))

const mockHandleFieldsChange = vi.fn()

vi.mock("../utils/useApiConfigurationHandlers", () => ({
	useApiConfigurationHandlers: () => ({
		handleFieldsChange: mockHandleFieldsChange,
	}),
}))

vi.mock("@/context/ExtensionStateContext", async (importOriginal) => {
	const actual = await importOriginal()
	return {
		...(actual || {}),
		useExtensionState: vi.fn(() => ({
			apiConfiguration: {
				planModeApiProvider: "sapaicore",
				actModeApiProvider: "sapaicore",
			},
		})),
	}
})

describe("ApiOptions Component", () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	it("renders SAP AI Core provider and header", () => {
		render(
			<ExtensionStateContextProvider>
				<ApiOptions currentMode="plan" showModelOptions={true} />
			</ExtensionStateContextProvider>,
		)

		expect(screen.getByText(/SAP AI Core/i)).toBeInTheDocument()
		expect(screen.getByTestId("sap-ai-core-provider")).toBeInTheDocument()
	})

	it("displays error messages if provided", () => {
		render(
			<ExtensionStateContextProvider>
				<ApiOptions
					apiErrorMessage="URL requise"
					currentMode="plan"
					modelIdErrorMessage="Modèle non sélectionné"
					showModelOptions={true}
				/>
			</ExtensionStateContextProvider>,
		)

		expect(screen.getByText("URL requise")).toBeInTheDocument()
		expect(screen.getByText("Modèle non sélectionné")).toBeInTheDocument()
	})
})
