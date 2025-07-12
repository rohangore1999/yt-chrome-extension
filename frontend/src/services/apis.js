export const getTranscript = async (videoId) => {
  const response = await fetch(
    `http://localhost:5001/api/transcript?video_id=${videoId}&languages=hi`
  );
  const data = await response.json();

  return data;
};
