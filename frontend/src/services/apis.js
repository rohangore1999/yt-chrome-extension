export const getTranscript = async (videoId) => {
  try {
    const response = await fetch(
      `http://localhost:5001/api/transcript?video_id=${videoId}`
    );
    const data = await response.json();

    return data;
  } catch (error) {
    console.error("Error fetching transcript:", error);
    throw error;
  }
};

export const queryTranscript = async (query) => {
  try {
    const response = await fetch("http://localhost:5001/api/query", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query }),
    });
    const data = await response.json();

    return data;
  } catch (error) {
    console.error("Error querying transcript:", error);
    throw error;
  }
};
