"use client"
import { create } from "zustand";
import { StreamResponse, isInitialResultsResponse, isMitigationStartedResponse, isMitigationCompleteResponse, isProcessCompleteResponse, isErrorResponse, isDebugResponse, isRelationshipsResponse, isAnalyzingRelationshipResponse, isThreatIdentifiedResponse, isStatusResponse } from "@/types/stream";
import { config } from "@/config";

export interface Keys {
  openai: string;
  google_cse: string;
  google_cse_id: string;
}

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
  category: string;
  mitigation?: {
    content: string;
    sources: string[];
  };
  summary: string;
  severity: string;
  likelihood: string;
  researchStatus: 'pending' | 'researching' | 'complete';
}


interface AppState {
  /** Output */
  selectedThreat: Threat | null;
  threats: Threat[];
  system_overview: string;
  progressMessages: string[];
  /** Input */
  selectedModel: "stride" | "dread";
  diagram: string;
  description: string;
  assumptions: string;
  /** Status */
  isProcessing: boolean;
  progressMessage: string;
  /** Keys */
  apiKeys: Keys;
  abortController: AbortController | null;
}

interface AppActions {
  setSelectedModel: (model: "stride" | "dread") => void;
  requestModeling: () => Promise<void>;
  stopModeling: () => void;
  updateUserInput: (input: string, target: "description" | "diagram" | "assumptions") => void;
  updateThreatMitigation: (threatId: string, mitigation: string, sources: string[]) => void;
  updateThreatResearchStatus: (threatId: string, status: 'pending' | 'researching' | 'complete') => void;
  updateApiKeys: (keys: Keys) => void;
}

type AppStore = AppState & AppActions;

export const useAppStore = create<AppStore>((set, get) => ({
  selectedThreat: null,
  threats: [],
  system_overview: "",
  description: "",
  diagram: "",
  assumptions: "",
  selectedModel: "stride",
  isProcessing: false,
  progressMessage: "",
  progressMessages: [],
  apiKeys: {
    openai: "",
    google_cse: "",
    google_cse_id: "",
  },
  abortController: null as AbortController | null,
  setSelectedModel: (model: "stride" | "dread") => {
    set({ selectedModel: model });
  },

  requestModeling: async () => {
    // Reset state for new modeling session
    set({ 
      threats: [], 
      system_overview: "", 
      isProcessing: true,
      progressMessage: "Starting threat modeling...",
      abortController: new AbortController()
    });

    try {
      // Create POST request with fetch
      const response = await fetch(`${config.apiBaseUrl}/api/stream/${get().selectedModel}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_input: get().description,
        }),
        signal: get().abortController?.signal
      });

      // Check if response is ok
      if (!response.ok) {
        console.error("Server error:", response.statusText);
        set({ 
          isProcessing: false,
          progressMessage: "Error during processing. Please try again."
        });
        return;
      }

      // Setup SSE reader
      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let allThreats: Threat[] = [];

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
              else if (isStatusResponse(data)) {
                set({ progressMessage: data.message });
              }
              else if (isRelationshipsResponse(data)) {
                // Handle extracted relationships
                console.log("Relationships:", data.data);
                set({ 
                  progressMessage: `Found ${data.data.length} relationships to analyze...`
                });
              }
              else if (isAnalyzingRelationshipResponse(data)) {
                // Update progress when analyzing a relationship
                set({ 
                  progressMessage: `Analyzing relationship ${data.index + 1}: ${data.relationship.source} ${data.relationship.direction} ${data.relationship.target}`
                });
              }
              else if (isThreatIdentifiedResponse(data)) {
                // Add the new threat to our collection
                const threat = {
                  ...data.threat,
                  researchStatus: 'pending' as const  // Change from 'complete' to 'pending'
                };
                allThreats.push(threat);
                set({ threats: [...allThreats] });
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
              else if (isMitigationStartedResponse(data)) {
                set({ progressMessage: data.message });
                get().updateThreatResearchStatus(data.threat_id, 'researching');
              }
              else if (isMitigationCompleteResponse(data)) {
                console.log("Mitigation complete:", data);
                get().updateThreatMitigation(data.threat_id, data.mitigation.content, data.mitigation.sources);
                get().updateThreatResearchStatus(data.threat_id, 'complete');
              }
              else if (isProcessCompleteResponse(data)) {
                set({ 
                  isProcessing: false,
                  progressMessage: data.message + " - " + data.total_threats
                });
              }
              else if (isErrorResponse(data)) {
                console.error("Server error:", data.message);
                set({ 
                  progressMessage: `Error: ${data.message}`,
                  isProcessing: false
                });
              }
            } catch (e) {
              console.error("Error parsing SSE message:", e, message);
              set({ isProcessing: false });
            }
          }
        }
      }
    } catch (error) {
      console.error('Error during streaming:', error);
      
      if (error instanceof DOMException && error.name === 'AbortError') {
        set({ 
          isProcessing: false,
          progressMessage: "Modeling process stopped by user."
        });
      } else {
        set({ 
          isProcessing: false,
          progressMessage: "Error during processing. Please try again."
        });
      }
    }
  },

  stopModeling: () => {
    const controller = get().abortController;
    if (controller) {
      controller.abort();
      set({ 
        abortController: null,
        isProcessing: false,
        progressMessage: "Modeling process stopped."
      });
    }
  },

  updateUserInput: (input: string, target: "description" | "diagram" | "assumptions") => {
    set({ [target]: input });
  },

  updateThreatMitigation: (threatId: string, content: string, sources: string[]) => {
    set(state => ({
      threats: state.threats.map(threat => 
        threat.id === threatId 
          ? { ...threat, mitigation: { content, sources } } 
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
  },

  updateApiKeys: (keys: Keys) => {
    set({ apiKeys: keys });
  }
}));
