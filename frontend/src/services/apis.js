// Global variables to track current requests
let currentTranscriptController = null;

// Global variable to track the current query request
let currentQueryController = null;

// Import storage utilities
import {
  getStorageValue,
  STORAGE_KEYS,
  DEFAULT_MODEL,
} from "../lib/storage.js";

// Helper function to get API key from Chrome storage
const getApiKey = () => {
  return getStorageValue(STORAGE_KEYS.API_KEY);
};

export const getTranscript = async (videoId) => {
  try {
    // Cancel any existing transcript request
    if (currentTranscriptController) {
      console.log(
        "Canceling previous transcript request for:",
        currentTranscriptController.videoId
      );
      currentTranscriptController.abort();
    }

    const apiKey = await getApiKey();

    if (!apiKey) {
      throw new Error("API key not found. Please set your Gemini API key.");
    }

    // Create new AbortController for this request
    const controller = new AbortController();
    controller.videoId = videoId; // Store videoId for logging
    currentTranscriptController = controller;

    console.log("Starting new transcript request for video:", videoId);

    const response = await fetch(
      `http://localhost:8080/api/transcript?video_id=${videoId}`,
      {
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": apiKey,
        },
      }
    );

    // Check if request was aborted
    if (controller.signal.aborted) {
      throw new Error("Request was cancelled");
    }

    const data = await response.json();

    // Clear the controller if this request completed successfully
    if (currentTranscriptController === controller) {
      currentTranscriptController = null;
      console.log(
        "Transcript request completed successfully for video:",
        videoId
      );
    }

    return data;
  } catch (error) {
    // Clear controller if this was the current one
    if (
      currentTranscriptController &&
      currentTranscriptController.videoId === videoId
    ) {
      currentTranscriptController = null;
    }

    // Don't log error if request was intentionally cancelled
    if (
      error.name === "AbortError" ||
      error.message === "Request was cancelled"
    ) {
      throw new Error("Request cancelled");
    }

    console.error("Error fetching transcript:", error);
    throw error;
  }
};

export const queryTranscript = async (query, videoId, model = null) => {
  try {
    // Cancel any existing query request
    if (currentQueryController) {
      console.log(
        "Canceling previous query request for:",
        currentQueryController.query
      );
      currentQueryController.abort();
    }

    const apiKey = await getApiKey();

    // Get the model from storage or use the provided one or default
    const selectedModel =
      model || (await getStorageValue(STORAGE_KEYS.MODEL)) || DEFAULT_MODEL;

    if (!apiKey) {
      throw new Error("API key not found. Please set your Gemini API key.");
    }

    // Create new AbortController for this request
    const controller = new AbortController();
    controller.query = query; // Store query for logging
    controller.videoId = videoId; // Store videoId for logging
    currentQueryController = controller;

    console.log("Starting new query request:", query, "for video:", videoId);

    const response = await fetch("http://localhost:8080/api/query", {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": apiKey,
      },
      body: JSON.stringify({ query, video_id: videoId, model: selectedModel }),
    });

    // Check if request was aborted
    if (controller.signal.aborted) {
      throw new Error("Request was cancelled");
    }

    const data = await response.json();

    // Clear the controller if this request completed successfully
    if (currentQueryController === controller) {
      currentQueryController = null;
      console.log(
        "Query request completed successfully for:",
        query,
        "video:",
        videoId
      );
    }

    return data;
  } catch (error) {
    // Clear controller if this was the current one
    if (
      currentQueryController &&
      currentQueryController.query === query &&
      currentQueryController.videoId === videoId
    ) {
      currentQueryController = null;
    }

    // Don't log error if request was intentionally cancelled
    if (
      error.name === "AbortError" ||
      error.message === "Request was cancelled"
    ) {
      throw new Error("Request cancelled");
    }

    console.error("Error querying transcript:", error);
    throw error;
  }
};

// Utility functions for request management

/**
 * Cancel all pending API requests (transcript and query)
 * Useful for cleanup when user navigates away or wants to reset
 */
export const cancelAllRequests = () => {
  let cancelledCount = 0;

  if (currentTranscriptController) {
    currentTranscriptController.abort();
    currentTranscriptController = null;
    cancelledCount++;
  }

  if (currentQueryController) {
    currentQueryController.abort();
    currentQueryController = null;
    cancelledCount++;
  }

  return cancelledCount;
};
