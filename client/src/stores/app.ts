import { config } from "@/config";
import { create } from "zustand";

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
  mitigation: string;
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
}

interface AppActions {
  requestModeling: () => Promise<void>;
  updateUserInput: (input: string, target: "description" | "diagram" | "assumptions") => void;
}

type AppStore = AppState & AppActions;

export const useAppStore = create<AppStore>((set, get) => ({
  selectedThreat: null,
  threats: [],
  system_overview: "",
  description: "",
  diagram: "",
  assumptions: "",
  requestModeling: async () => {
    const response = await fetch(`${config.apiBaseUrl}/api/tm`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        description: get().description,
        diagram: get().diagram,
        assumptions: get().assumptions,
      }),
    });
    const data = await response.json() as TMResponse;
    set({ 
        system_overview: data.system_overview,
        threats: data.threat_scenarios 
    });
  },
  updateUserInput: (input: string, target: "description" | "diagram" | "assumptions") => {
    set({ [target]: input });
  },
}));
