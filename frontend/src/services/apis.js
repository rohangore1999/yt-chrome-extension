// Global variables to track current requests
let currentTranscriptController = null;

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

    const apiKey = localStorage.getItem("gemini_api_key");

    if (!apiKey) {
      throw new Error("API key not found. Please set your Gemini API key.");
    }

    // Create new AbortController for this request
    const controller = new AbortController();
    controller.videoId = videoId; // Store videoId for logging
    currentTranscriptController = controller;

    console.log("Starting new transcript request for video:", videoId);

    const response = await fetch(
      `http://localhost:5001/api/transcript?video_id=${videoId}`,
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
      console.log("Transcript request cancelled for video:", videoId);
      throw new Error("Request cancelled");
    }

    console.error("Error fetching transcript:", error);
    throw error;
  }
};

// Global variable to track the current query request
let currentQueryController = null;

export const queryTranscript = async (query) => {
  try {
    // Cancel any existing query request
    if (currentQueryController) {
      console.log(
        "Canceling previous query request for:",
        currentQueryController.query
      );
      currentQueryController.abort();
    }

    const apiKey = localStorage.getItem("gemini_api_key");

    if (!apiKey) {
      throw new Error("API key not found. Please set your Gemini API key.");
    }

    // Create new AbortController for this request
    const controller = new AbortController();
    controller.query = query; // Store query for logging
    currentQueryController = controller;

    console.log("Starting new query request:", query);

    const response = await fetch("http://localhost:5001/api/query", {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": apiKey,
      },
      body: JSON.stringify({ query }),
    });

    // Check if request was aborted
    if (controller.signal.aborted) {
      throw new Error("Request was cancelled");
    }

    const data = await response.json();

    // Clear the controller if this request completed successfully
    if (currentQueryController === controller) {
      currentQueryController = null;
      console.log("Query request completed successfully for:", query);
    }

    return data;
  } catch (error) {
    // Clear controller if this was the current one
    if (currentQueryController && currentQueryController.query === query) {
      currentQueryController = null;
    }

    // Don't log error if request was intentionally cancelled
    if (
      error.name === "AbortError" ||
      error.message === "Request was cancelled"
    ) {
      console.log("Query request cancelled for:", query);
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
    console.log("Cancelling pending transcript request");
    currentTranscriptController.abort();
    currentTranscriptController = null;
    cancelledCount++;
  }

  if (currentQueryController) {
    console.log("Cancelling pending query request");
    currentQueryController.abort();
    currentQueryController = null;
    cancelledCount++;
  }

  if (cancelledCount > 0) {
    console.log(`Cancelled ${cancelledCount} pending request(s)`);
  } else {
    console.log("No pending requests to cancel");
  }

  return cancelledCount;
};

/**
 * Get status of current pending requests
 * Useful for debugging and UI state management
 */
export const getRequestStatus = () => {
  return {
    hasTranscriptRequest: !!currentTranscriptController,
    hasQueryRequest: !!currentQueryController,
    transcriptVideoId: currentTranscriptController?.videoId || null,
    currentQuery: currentQueryController?.query || null,
  };
};

/**
 * Check if any requests are currently pending
 */
export const hasPendingRequests = () => {
  return !!(currentTranscriptController || currentQueryController);
};
