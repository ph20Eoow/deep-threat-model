import { config } from "@/config";
import { create } from "zustand";
import { StreamResponse, isInitialResultsResponse, isResearchStartedResponse, isResearchCompleteResponse, isProcessCompleteResponse, isErrorResponse, isDebugResponse } from "@/types/stream";

interface ThreatScope {
  source: string;
  target: string;
  direction: string;
  description: string;
}

export interface Threat {
  id: string;
  name: string;
  scope: ThreatScope;
  impacts: string;
  techniques: string;
  mitigation?: string;
  summary: string;
  severity: string;
  likelihood: string;
}

interface TMResponse {
  system_overview: string;
  threat_scenarios: Threat[];
}

interface AppState {
  /** Output */
  selectedThreat: Threat | null;
  threats: Threat[];
  system_overview: string;
  /** Input */
  diagram: string;
  description: string;
  assumptions: string;
  /** Status */
  isProcessing: boolean;
  progressMessage: string;
}

interface AppActions {
  requestModeling: () => Promise<void>;
  updateUserInput: (input: string, target: "description" | "diagram" | "assumptions") => void;
  updateThreatMitigation: (threatId: string, mitigation: string) => void;
  updateThreatResearchStatus: (threatId: string, status: 'pending' | 'researching' | 'complete') => void;
}

type AppStore = AppState & AppActions;

export const useAppStore = create<AppStore>((set, get) => ({
  selectedThreat: null,
  threats: [],
  system_overview: "",
  description: "",
  diagram: "",
  assumptions: "",
  isProcessing: false,
  progressMessage: "",

  requestModeling: async () => {
    // Reset state for new modeling session
    set({ 
      threats: [], 
      system_overview: "", 
      isProcessing: true,
      progressMessage: "Starting threat modeling..."
    });

    try {
      // Create POST request with fetch
      const response = await fetch(`${config.apiBaseUrl}/api/tm/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          description: get().description,
          diagram: get().diagram,
          assumptions: get().assumptions
        })
      });

      // Check if response is ok
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Setup SSE reader
      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      // Read and process the stream
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        // Decode the received chunk and add it to the buffer
        buffer += decoder.decode(value, { stream: true });
        
        // Process complete SSE messages in the buffer
        const messages = buffer.split('\n\n');
        buffer = messages.pop() || ''; // Keep the last item which might be incomplete
        
        // Process each complete message
        for (const message of messages) {
          if (message.startsWith('data: ')) {
            try {
              const data = JSON.parse(message.substring(6)) as StreamResponse; // Remove 'data: ' prefix
              console.log("SSE Message:", data);
              
              // Process the data based on its type using type guards
              if (isDebugResponse(data)) {
                console.log("Debug:", data.message);
              }
              else if (isInitialResultsResponse(data)) {
                set({ 
                  system_overview: data.data.system_overview,
                  threats: data.data.threat_scenarios.map((threat) => ({
                    ...threat,
                    researchStatus: 'pending'
                  })),
                  progressMessage: "Initial threat modeling complete. Starting detailed research..."
                });
              }
              else if (isResearchStartedResponse(data)) {
                set({ 
                  progressMessage: data.message,
                });
                get().updateThreatResearchStatus(data.threat_id, 'researching');
              }
              else if (isResearchCompleteResponse(data)) {
                get().updateThreatMitigation(data.threat_id, data.mitigation);
                get().updateThreatResearchStatus(data.threat_id, 'complete');
              }
              else if (isProcessCompleteResponse(data)) {
                set({ 
                  isProcessing: false,
                  progressMessage: data.message
                });
              }
              else if (isErrorResponse(data)) {
                console.error("Server error:", data.message);
                set({ 
                  progressMessage: `Error: ${data.message}`,
                });
              }
            } catch (e) {
              console.error("Error parsing SSE message:", e, message);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error during streaming:', error);
      set({ 
        isProcessing: false,
        progressMessage: "Error during processing. Please try again."
      });
    }
  },

  updateUserInput: (input: string, target: "description" | "diagram" | "assumptions") => {
    set({ [target]: input });
  },

  updateThreatMitigation: (threatId: string, mitigation: string) => {
    set(state => ({
      threats: state.threats.map(threat => 
        threat.id === threatId 
          ? { ...threat, mitigation } 
          : threat
      )
    }));
  },

  updateThreatResearchStatus: (threatId: string, status: 'pending' | 'researching' | 'complete') => {
    set(state => ({
      threats: state.threats.map(threat => 
        threat.id === threatId 
          ? { ...threat, researchStatus: status } 
          : threat
      )
    }));
  }
}));
