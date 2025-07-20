export const getTranscript = async (videoId) => {
  try {
    // const response = await fetch(
    //   `http://localhost:5001/api/transcript?video_id=${videoId}`
    // );
    // const data = await response.json();
    const data = { success: true, timestamps: [] };
    return data;
  } catch (error) {
    console.error("Error fetching transcript:", error);
    throw error;
  }
};

export const queryTranscript = async (query) => {
  try {
    // const response = await fetch("http://localhost:5001/api/query", {
    //   method: "POST",
    //   headers: {
    //     "Content-Type": "application/json",
    //   },
    //   body: JSON.stringify({ query }),
    // });
    // const data = await response.json();

    const data = {
      response:
        "Of course. Here is a summary of the building blocks of protein powder mentioned in the video.\n\n### Building Blocks of Protein Powder\n\nAccording to the video, protein powder consists of five main building blocks:\n\n*   **Protein Source:** The primary ingredient, for which the video uses a whey concentrate from Europe. [00:04]\n*   **Taste:** The video uses real cocoa from Ivory Coast and Ghana instead of artificial or natural flavors. [00:10]\n*   **Sweetening System:** To add sweetness, the video uses Stevia, a natural sweetener. [00:27]\n*   **Mixing Agent:** To ensure the powder mixes well with water, a natural sunflower lecithin is used. [00:45]\n*   **Color:** The video notes that color is an optional block and they have chosen not to add any. [00:51]",
      success: true,
      timestamps: [
        {
          text: "If you drink protein powder, then let's know What happens inside him? Any These five building blocks...",
          time: "00:00",
        },
      ],
    };
    

    return data;
  } catch (error) {
    console.error("Error querying transcript:", error);
    throw error;
  }
};
