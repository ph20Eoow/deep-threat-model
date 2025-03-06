import { Threat } from "@/stores/app";

// Base interface for all stream response types
export interface BaseStreamResponse {
  type: string;
}

// Debug message
export interface DebugStreamResponse extends BaseStreamResponse {
  type: "debug";
  message: string;
}

// Error message
export interface ErrorStreamResponse extends BaseStreamResponse {
  type: "error";
  message: string;
}

// Initial results with the threat model
export interface InitialResultsStreamResponse extends BaseStreamResponse {
  type: "initial_results";
  data: {
    system_overview: string;
    threat_scenarios: Threat[];
  };
}

// Research started notification
export interface ResearchStartedStreamResponse extends BaseStreamResponse {
  type: "research_started";
  threat_id: string;
  message: string;
}

// Research error notification
export interface ResearchErrorStreamResponse extends BaseStreamResponse {
  type: "research_error";
  threat_id: string;
  error: string;
}

// Research complete with mitigation
export interface ResearchCompleteStreamResponse extends BaseStreamResponse {
  type: "research_complete";
  threat_id: string;
  mitigation: string;
}

// Process complete notification
export interface ProcessCompleteStreamResponse extends BaseStreamResponse {
  type: "process_complete";
  message: string;
}

// Union type of all possible stream responses
export type StreamResponse = 
  | DebugStreamResponse
  | ErrorStreamResponse
  | InitialResultsStreamResponse
  | ResearchStartedStreamResponse
  | ResearchErrorStreamResponse
  | ResearchCompleteStreamResponse
  | ProcessCompleteStreamResponse;

// Type guard functions to help with type narrowing
export const isDebugResponse = (response: StreamResponse): response is DebugStreamResponse => 
  response.type === "debug";

export const isErrorResponse = (response: StreamResponse): response is ErrorStreamResponse => 
  response.type === "error";

export const isInitialResultsResponse = (response: StreamResponse): response is InitialResultsStreamResponse => 
  response.type === "initial_results";

export const isResearchStartedResponse = (response: StreamResponse): response is ResearchStartedStreamResponse => 
  response.type === "research_started";

export const isResearchErrorResponse = (response: StreamResponse): response is ResearchErrorStreamResponse => 
  response.type === "research_error";

export const isResearchCompleteResponse = (response: StreamResponse): response is ResearchCompleteStreamResponse => 
  response.type === "research_complete";

export const isProcessCompleteResponse = (response: StreamResponse): response is ProcessCompleteStreamResponse => 
  response.type === "process_complete"; 