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

// Status update message
export interface StatusStreamResponse extends BaseStreamResponse {
  type: "status";
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

// Relationships extracted from input
export interface RelationshipsStreamResponse extends BaseStreamResponse {
  type: "relationships";
  data: Array<{
    source: string;
    target: string;
    direction: string;
    description: string;
  }>;
}

// Current relationship being analyzed
export interface AnalyzingRelationshipStreamResponse extends BaseStreamResponse {
  type: "analyzing_relationship";
  index: number;
  relationship: {
    source: string;
    target: string;
    direction: string;
    description: string;
  };
}

// New threat identified
export interface ThreatIdentifiedStreamResponse extends BaseStreamResponse {
  type: "threat_identified";
  threat: Threat;
}

// Research started notification
export interface MitigationStartedStreamResponse extends BaseStreamResponse {
  type: "mitigation_started";
  threat_id: string;
  message: string;
}

// Research error notification
export interface MitigationErrorStreamResponse extends BaseStreamResponse {
  type: "mitigation_error";
  threat_id: string;
  error: string;
}

// Research complete with mitigation and sources
export interface MitigationCompleteStreamResponse extends BaseStreamResponse {
  type: "mitigation_complete";
  threat_id: string;
  mitigation: {
    content: string;
    sources: string[];
  };
}

// Process complete notification
export interface ProcessCompleteStreamResponse extends BaseStreamResponse {
  type: "process_complete";
  message: string;
  total_threats?: number; // Optional for compatibility with both endpoints
}

// Union type of all possible stream responses
export type StreamResponse = 
  | DebugStreamResponse
  | StatusStreamResponse
  | ErrorStreamResponse
  | InitialResultsStreamResponse
  | RelationshipsStreamResponse
  | AnalyzingRelationshipStreamResponse
  | ThreatIdentifiedStreamResponse
  | MitigationStartedStreamResponse
  | MitigationErrorStreamResponse
  | MitigationCompleteStreamResponse
  | ProcessCompleteStreamResponse;

// Type guard functions to help with type narrowing
export const isDebugResponse = (response: StreamResponse): response is DebugStreamResponse => 
  response.type === "debug";

export const isStatusResponse = (response: StreamResponse): response is StatusStreamResponse => 
  response.type === "status";

export const isErrorResponse = (response: StreamResponse): response is ErrorStreamResponse => 
  response.type === "error";

export const isInitialResultsResponse = (response: StreamResponse): response is InitialResultsStreamResponse => 
  response.type === "initial_results";

export const isRelationshipsResponse = (response: StreamResponse): response is RelationshipsStreamResponse => 
  response.type === "relationships";

export const isAnalyzingRelationshipResponse = (response: StreamResponse): response is AnalyzingRelationshipStreamResponse => 
  response.type === "analyzing_relationship";

export const isThreatIdentifiedResponse = (response: StreamResponse): response is ThreatIdentifiedStreamResponse => 
  response.type === "threat_identified";

export const isMitigationStartedResponse = (response: StreamResponse): response is MitigationStartedStreamResponse => 
  response.type === "mitigation_started";

export const isMitigationErrorResponse = (response: StreamResponse): response is MitigationErrorStreamResponse => 
  response.type === "mitigation_error";

export const isMitigationCompleteResponse = (response: StreamResponse): response is MitigationCompleteStreamResponse => 
  response.type === "mitigation_complete";

export const isProcessCompleteResponse = (response: StreamResponse): response is ProcessCompleteStreamResponse => 
  response.type === "process_complete"; 

