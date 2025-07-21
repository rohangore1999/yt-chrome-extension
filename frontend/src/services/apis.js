// Global variables to track current requests
let currentTranscriptController = null;

export const getTranscript = async (videoId) => {
  try {
    // // Cancel any existing transcript request
    // if (currentTranscriptController) {
    //   console.log(
    //     "Canceling previous transcript request for:",
    //     currentTranscriptController.videoId
    //   );
    //   currentTranscriptController.abort();
    // }

    // const apiKey = localStorage.getItem("gemini_api_key");

    // if (!apiKey) {
    //   throw new Error("API key not found. Please set your Gemini API key.");
    // }

    // // Create new AbortController for this request
    // const controller = new AbortController();
    // controller.videoId = videoId; // Store videoId for logging
    // currentTranscriptController = controller;

    // console.log("Starting new transcript request for video:", videoId);

    // const response = await fetch(
    //   `http://localhost:5001/api/transcript?video_id=${videoId}`,
    //   {
    //     signal: controller.signal,
    //     headers: {
    //       "Content-Type": "application/json",
    //       "X-API-Key": apiKey,
    //     },
    //   }
    // );

    // // Check if request was aborted
    // if (controller.signal.aborted) {
    //   throw new Error("Request was cancelled");
    // }

    // const data = await response.json();

    // // Clear the controller if this request completed successfully
    // if (currentTranscriptController === controller) {
    //   currentTranscriptController = null;
    //   console.log(
    //     "Transcript request completed successfully for video:",
    //     videoId
    //   );
    // }

    // return data;

    // MOCK DATA
    await new Promise((resolve) => setTimeout(resolve, 5000));

    return {
      chunks_processed: 3,
      data: [
        {
          detected_language: "en",
          duration: 4.6,
          original_text: "retired chief petty officer Dave Goggins",
          start_time: 0.199,
          text: "retired chief petty officer Dave Goggins",
        },
        {
          detected_language: "en",
          duration: 4.41,
          original_text: "is well known for his physical and",
          start_time: 3.03,
          text: "is well known for his physical and",
        },
        {
          detected_language: "en",
          duration: 6.031,
          original_text: "mental toughness and for his practically",
          start_time: 4.799,
          text: "mental toughness and for his practically",
        },
        {
          detected_language: "en",
          duration: 6.09,
          original_text: "inhuman level of determination from",
          start_time: 7.44,
          text: "inhuman level of determination from",
        },
        {
          detected_language: "en",
          duration: 5.099,
          original_text: "barely passing his Navy SEAL physical",
          start_time: 10.83,
          text: "barely passing his Navy SEAL physical",
        },
        {
          detected_language: "en",
          duration: 5.19,
          original_text: "screening tests to becoming one of the",
          start_time: 13.53,
          text: "screening tests to becoming one of the",
        },
        {
          detected_language: "en",
          duration: 5.401,
          original_text: "world's best ultra endurance athletes",
          start_time: 15.929,
          text: "world's best ultra endurance athletes",
        },
        {
          detected_language: "en",
          duration: 5.969,
          original_text: "and the only person to complete Navy",
          start_time: 18.72,
          text: "and the only person to complete Navy",
        },
        {
          detected_language: "en",
          duration: 5.73,
          original_text: "SEAL training Army Ranger school and Air",
          start_time: 21.33,
          text: "SEAL training Army Ranger school and Air",
        },
        {
          detected_language: "en",
          duration: 5.461,
          original_text: "Force tactical air controller training",
          start_time: 24.689,
          text: "Force tactical air controller training",
        },
        {
          detected_language: "en",
          duration: 11.73,
          original_text: "David routinely pushes his body to the",
          start_time: 27.06,
          text: "David routinely pushes his body to the",
        },
        {
          detected_language: "en",
          duration: 10.729,
          original_text: "limits in 2005 a chopper carrying eight",
          start_time: 30.15,
          text: "limits in 2005 a chopper carrying eight",
        },
        {
          detected_language: "en",
          duration: 5.49,
          original_text: "seals and eight Army Special Operations",
          start_time: 38.79,
          text: "seals and eight Army Special Operations",
        },
        {
          detected_language: "en",
          duration: 5.25,
          original_text: "aviators were shot down many Navy men",
          start_time: 40.879,
          text: "aviators were shot down many Navy men",
        },
        {
          detected_language: "en",
          duration: 3.869,
          original_text: "who David had personally trained with",
          start_time: 44.28,
          text: "who David had personally trained with",
        },
        {
          detected_language: "en",
          duration: 4.301,
          original_text: "touched by their loss",
          start_time: 46.129,
          text: "touched by their loss",
        },
        {
          detected_language: "en",
          duration: 5.461,
          original_text: "David was determined to find a way to",
          start_time: 48.149,
          text: "David was determined to find a way to",
        },
        {
          detected_language: "en",
          duration: 6.33,
          original_text: "help running a hundred and thirty-five",
          start_time: 50.43,
          text: "help running a hundred and thirty-five",
        },
        {
          detected_language: "en",
          duration: 8.67,
          original_text: "miles of just under 26 hours taking",
          start_time: 53.61,
          text: "miles of just under 26 hours taking",
        },
        {
          detected_language: "en",
          duration: 8.67,
          original_text: "first place in the infra trust 88k in",
          start_time: 56.76,
          text: "first place in the infra trust 88k in",
        },
        {
          detected_language: "en",
          duration: 7.17,
          original_text: "only 12 hours and holding the Guinness",
          start_time: 62.28,
          text: "only 12 hours and holding the Guinness",
        },
        {
          detected_language: "en",
          duration: 7.41,
          original_text: "World Book World Record for over 4,000",
          start_time: 65.43,
          text: "World Book World Record for over 4,000",
        },
        {
          detected_language: "en",
          duration: 5.31,
          original_text: "pull-ups in 24 hours all to raise",
          start_time: 69.45,
          text: "pull-ups in 24 hours all to raise",
        },
        {
          detected_language: "en",
          duration: 4.31,
          original_text: "awareness and support for severely",
          start_time: 72.84,
          text: "awareness and support for severely",
        },
        {
          detected_language: "en",
          duration: 4.83,
          original_text: "wounded warriors and their families",
          start_time: 74.76,
          text: "wounded warriors and their families",
        },
        {
          detected_language: "en",
          duration: 4.87,
          original_text: "ladies and gentlemen brings a great deal",
          start_time: 77.15,
          text: "ladies and gentlemen brings a great deal",
        },
        {
          detected_language: "en",
          duration: 6.06,
          original_text: "of pleasure to present to you the",
          start_time: 79.59,
          text: "of pleasure to present to you the",
        },
        {
          detected_language: "en",
          duration: 6.84,
          original_text: "recipients of the VFW's Americanism",
          start_time: 82.02,
          text: "recipients of the VFW's Americanism",
        },
        {
          detected_language: "en",
          duration: 5.58,
          original_text: "warden retired chief petty officer david",
          start_time: 85.65,
          text: "warden retired chief petty officer david",
        },
        {
          detected_language: "en",
          duration: 8.13,
          original_text: "Goggins",
          start_time: 88.86,
          text: "Goggins",
        },
        {
          detected_language: "en",
          duration: 8.93,
          original_text: "[Applause]",
          start_time: 91.23,
          text: "[Applause]",
        },
        {
          detected_language: "en",
          duration: 3.17,
          original_text: "[Music]",
          start_time: 96.99,
          text: "[Music]",
        },
        {
          detected_language: "en",
          duration: 6.28,
          original_text: "[Applause]",
          start_time: 105.14,
          text: "[Applause]",
        },
        {
          detected_language: "en",
          duration: 6.31,
          original_text: "Americanism award and citation awarded",
          start_time: 108.17,
          text: "Americanism award and citation awarded",
        },
        {
          detected_language: "en",
          duration: 6.51,
          original_text: "to chief petty officer David Goggins the",
          start_time: 111.42,
          text: "to chief petty officer David Goggins the",
        },
        {
          detected_language: "en",
          duration: 7.41,
          original_text: "United States Navy retired in heartfelt",
          start_time: 114.48,
          text: "United States Navy retired in heartfelt",
        },
        {
          detected_language: "en",
          duration: 6.57,
          original_text: "recognition and sincere appreciation of",
          start_time: 117.93,
          text: "recognition and sincere appreciation of",
        },
        {
          detected_language: "en",
          duration: 5.34,
          original_text: "his fervent love of country and his",
          start_time: 121.89,
          text: "his fervent love of country and his",
        },
        {
          detected_language: "en",
          duration: 5.31,
          original_text: "tireless dedication a commitment to",
          start_time: 124.5,
          text: "tireless dedication a commitment to",
        },
        {
          detected_language: "en",
          duration: 5.58,
          original_text: "supporting America's veterans and their",
          start_time: 127.23,
          text: "supporting America's veterans and their",
        },
        {
          detected_language: "en",
          duration: 5.82,
          original_text: "families his determination to bring",
          start_time: 129.81,
          text: "families his determination to bring",
        },
        {
          detected_language: "en",
          duration: 6.15,
          original_text: "encouragement and hope to the families",
          start_time: 132.81,
          text: "encouragement and hope to the families",
        },
        {
          detected_language: "en",
          duration: 7.2,
          original_text: "of America's fallen servicemembers by",
          start_time: 135.63,
          text: "of America's fallen servicemembers by",
        },
        {
          detected_language: "en",
          duration: 6.44,
          original_text: "pushing his body mind and spirit to its",
          start_time: 138.96,
          text: "pushing his body mind and spirit to its",
        },
        {
          detected_language: "en",
          duration: 6.36,
          original_text: "limits as a reflection of his resolve",
          start_time: 142.83,
          text: "limits as a reflection of his resolve",
        },
        {
          detected_language: "en",
          duration: 6.34,
          original_text: "patriotism and true character and justly",
          start_time: 145.4,
          text: "patriotism and true character and justly",
        },
        {
          detected_language: "en",
          duration: 4.44,
          original_text: "earned him the utmost respect and",
          start_time: 149.19,
          text: "earned him the utmost respect and",
        },
        {
          detected_language: "en",
          duration: 5.01,
          original_text: "admiration of the Veterans of Foreign",
          start_time: 151.74,
          text: "admiration of the Veterans of Foreign",
        },
        {
          detected_language: "en",
          duration: 5.46,
          original_text: "Wars of the United States in witness",
          start_time: 153.63,
          text: "Wars of the United States in witness",
        },
        {
          detected_language: "en",
          duration: 4.53,
          original_text: "whereof we have here on to set our hands",
          start_time: 156.75,
          text: "whereof we have here on to set our hands",
        },
        {
          detected_language: "en",
          duration: 4.89,
          original_text: "and the official seal the Veterans of",
          start_time: 159.09,
          text: "and the official seal the Veterans of",
        },
        {
          detected_language: "en",
          duration: 6.63,
          original_text: "Foreign Wars of the United States this",
          start_time: 161.28,
          text: "Foreign Wars of the United States this",
        },
        {
          detected_language: "en",
          duration: 5.64,
          original_text: "23rd day of July 2018 approved by the",
          start_time: 163.98,
          text: "23rd day of July 2018 approved by the",
        },
        {
          detected_language: "en",
          duration: 3.72,
          original_text: "National Council of administration",
          start_time: 167.91,
          text: "National Council of administration",
        },
        {
          detected_language: "en",
          duration: 4.23,
          original_text: "signed by Keith E Harman",
          start_time: 169.62,
          text: "signed by Keith E Harman",
        },
        {
          detected_language: "en",
          duration: 4.91,
          original_text: "commander-in-chief tested brian duffy",
          start_time: 171.63,
          text: "commander-in-chief tested brian duffy",
        },
        {
          detected_language: "en",
          duration: 2.69,
          original_text: "adjutant general",
          start_time: 173.85,
          text: "adjutant general",
        },
        {
          detected_language: "en",
          duration: 9.28,
          original_text: "[Applause]",
          start_time: 177.7,
          text: "[Applause]",
        },
        {
          detected_language: "en",
          duration: 5.32,
          original_text: "first off um I'm very humbled to be up",
          start_time: 184.09,
          text: "first off um I'm very humbled to be up",
        },
        {
          detected_language: "en",
          duration: 4.5,
          original_text: "here talking to you all today for a",
          start_time: 186.98,
          text: "here talking to you all today for a",
        },
        {
          detected_language: "en",
          duration: 5.01,
          original_text: "living I'm a motivational speaker and I",
          start_time: 189.41,
          text: "living I'm a motivational speaker and I",
        },
        {
          detected_language: "en",
          duration: 4.83,
          original_text: "speak to thousands of professional",
          start_time: 191.48,
          text: "speak to thousands of professional",
        },
        {
          detected_language: "en",
          duration: 4.95,
          original_text: "athletes from the biggest names to the",
          start_time: 194.42,
          text: "athletes from the biggest names to the",
        },
        {
          detected_language: "en",
          duration: 5.25,
          original_text: "smallest names even I saw a doc walk in",
          start_time: 196.31,
          text: "smallest names even I saw a doc walk in",
        },
        {
          detected_language: "en",
          duration: 4.68,
          original_text: "here with the Congressional Medal of",
          start_time: 199.37,
          text: "here with the Congressional Medal of",
        },
        {
          detected_language: "en",
          duration: 3.95,
          original_text: "Honor this the first time my life I got",
          start_time: 201.56,
          text: "Honor this the first time my life I got",
        },
        {
          detected_language: "en",
          duration: 4.11,
          original_text: "nervous to speak in front of a crowd",
          start_time: 204.05,
          text: "nervous to speak in front of a crowd",
        },
        {
          detected_language: "en",
          duration: 5.14,
          original_text: "that's unless I respect this man up here",
          start_time: 205.51,
          text: "that's unless I respect this man up here",
        },
        {
          detected_language: "en",
          duration: 6.18,
          original_text: "I was reading about this man back in the",
          start_time: 208.16,
          text: "I was reading about this man back in the",
        },
        {
          detected_language: "en",
          duration: 6.51,
          original_text: "day so I like to thank the VFW very much",
          start_time: 210.65,
          text: "day so I like to thank the VFW very much",
        },
        {
          detected_language: "en",
          duration: 4.08,
          original_text: "for giving me this this award it means",
          start_time: 214.34,
          text: "for giving me this this award it means",
        },
        {
          detected_language: "en",
          duration: 3.51,
          original_text: "more than meeting anything I've ever",
          start_time: 217.16,
          text: "more than meeting anything I've ever",
        },
        {
          detected_language: "en",
          duration: 3.75,
          original_text: "received in my entire life I like to",
          start_time: 218.42,
          text: "received in my entire life I like to",
        },
        {
          detected_language: "en",
          duration: 3.87,
          original_text: "thank my grandfather starring Jack",
          start_time: 220.67,
          text: "thank my grandfather starring Jack",
        },
        {
          detected_language: "en",
          duration: 4.849,
          original_text: "Gardner who is now deceased this would",
          start_time: 222.17,
          text: "Gardner who is now deceased this would",
        },
        {
          detected_language: "en",
          duration: 7.49,
          original_text: "be the happiest day of his entire life",
          start_time: 224.54,
          text: "be the happiest day of his entire life",
        },
        {
          detected_language: "en",
          duration: 5.011,
          original_text: "like I think my mom up here who",
          start_time: 227.019,
          text: "like I think my mom up here who",
        },
        {
          detected_language: "en",
          duration: 13.829,
          original_text: "[Applause]",
          start_time: 238.4,
          text: "[Applause]",
        },
        {
          detected_language: "en",
          duration: 3.469,
          original_text: "[Music]",
          start_time: 271.41,
          text: "[Music]",
        },
        {
          detected_language: "en",
          duration: 6.66,
          original_text: "we never picked me up who never picked",
          start_time: 276.77,
          text: "we never picked me up who never picked",
        },
        {
          detected_language: "en",
          duration: 6.39,
          original_text: "me up when I fell she taught me how to",
          start_time: 280.37,
          text: "me up when I fell she taught me how to",
        },
        {
          detected_language: "en",
          duration: 5.48,
          original_text: "get up and I was knocked down I think my",
          start_time: 283.43,
          text: "get up and I was knocked down I think my",
        },
        {
          detected_language: "en",
          duration: 5.82,
          original_text: "uncle for always being there for me",
          start_time: 286.76,
          text: "uncle for always being there for me",
        },
        {
          detected_language: "en",
          duration: 5.74,
          original_text: "but I think all you are here who fought",
          start_time: 288.91,
          text: "but I think all you are here who fought",
        },
        {
          detected_language: "en",
          duration: 5.67,
          original_text: "in these wars you have no idea how big",
          start_time: 292.58,
          text: "in these wars you have no idea how big",
        },
        {
          detected_language: "en",
          duration: 8.31,
          original_text: "of a deal assist to me I was not always",
          start_time: 294.65,
          text: "of a deal assist to me I was not always",
        },
        {
          detected_language: "en",
          duration: 6.27,
          original_text: "this strong guy you see I went through a",
          start_time: 298.25,
          text: "this strong guy you see I went through a",
        },
        {
          detected_language: "en",
          duration: 5.52,
          original_text: "lot of hard times in my life to get here",
          start_time: 302.96,
          text: "lot of hard times in my life to get here",
        },
        {
          detected_language: "en",
          duration: 6.6,
          original_text: "today and a story I'll tell you with",
          start_time: 304.52,
          text: "today and a story I'll tell you with",
        },
        {
          detected_language: "en",
          duration: 4.4,
          original_text: "real quick I tried once to get in the",
          start_time: 308.48,
          text: "real quick I tried once to get in the",
        },
        {
          detected_language: "en",
          duration: 5.63,
          original_text: "Air Force to be Air Force pararescueman",
          start_time: 311.12,
          text: "Air Force to be Air Force pararescueman",
        },
        {
          detected_language: "en",
          duration: 6.61,
          original_text: "and I quit for the fear of the water I",
          start_time: 312.88,
          text: "and I quit for the fear of the water I",
        },
        {
          detected_language: "en",
          duration: 6.28,
          original_text: "was 175 pounds",
          start_time: 316.75,
          text: "was 175 pounds",
        },
        {
          detected_language: "en",
          duration: 4.86,
          original_text: "I left the Air Force four years later at",
          start_time: 319.49,
          text: "I left the Air Force four years later at",
        },
        {
          detected_language: "en",
          duration: 5.43,
          original_text: "300 pounds",
          start_time: 323.03,
          text: "300 pounds",
        },
        {
          detected_language: "en",
          duration: 6.9,
          original_text: "I went from 175 to 300 pounds there's a",
          start_time: 324.35,
          text: "I went from 175 to 300 pounds there's a",
        },
        {
          detected_language: "en",
          duration: 7.56,
          original_text: "long story in there on how that came to",
          start_time: 328.46,
          text: "long story in there on how that came to",
        },
        {
          detected_language: "en",
          duration: 8.28,
          original_text: "be by sat around and read a book on the",
          start_time: 331.25,
          text: "be by sat around and read a book on the",
        },
        {
          detected_language: "en",
          duration: 7.47,
          original_text: "Medal of Honor in those guys all I",
          start_time: 336.02,
          text: "Medal of Honor in those guys all I",
        },
        {
          detected_language: "en",
          duration: 6.66,
          original_text: "wanted to be was an uncommon man in my",
          start_time: 339.53,
          text: "wanted to be was an uncommon man in my",
        },
        {
          detected_language: "en",
          duration: 5.04,
          original_text: "whole life I was not that much worse",
          start_time: 343.49,
          text: "whole life I was not that much worse",
        },
        {
          detected_language: "en",
          duration: 5.31,
          original_text: "than that I read stories about men like",
          start_time: 346.19,
          text: "than that I read stories about men like",
        },
        {
          detected_language: "en",
          duration: 5.49,
          original_text: "you doc who had the courage to jump on",
          start_time: 348.53,
          text: "you doc who had the courage to jump on",
        },
        {
          detected_language: "en",
          duration: 4.44,
          original_text: "grenades and stuff like that so I came",
          start_time: 351.5,
          text: "grenades and stuff like that so I came",
        },
        {
          detected_language: "en",
          duration: 3.63,
          original_text: "home one day from working at a job",
          start_time: 354.02,
          text: "home one day from working at a job",
        },
        {
          detected_language: "en",
          duration: 5.01,
          original_text: "called Ecolab where I spray for",
          start_time: 355.94,
          text: "called Ecolab where I spray for",
        },
        {
          detected_language: "en",
          duration: 8.52,
          original_text: "cockroaches made $1,000 a month",
          start_time: 357.65,
          text: "cockroaches made $1,000 a month",
        },
        {
          detected_language: "en",
          duration: 7.53,
          original_text: "Wayne thriller pounds and I got home and",
          start_time: 360.95,
          text: "Wayne thriller pounds and I got home and",
        },
        {
          detected_language: "en",
          duration: 6.36,
          original_text: "I watched a show on Discovery Channel of",
          start_time: 366.17,
          text: "I watched a show on Discovery Channel of",
        },
        {
          detected_language: "en",
          duration: 7.14,
          original_text: "guys carrying boats and logs maybe still",
          start_time: 368.48,
          text: "guys carrying boats and logs maybe still",
        },
        {
          detected_language: "en",
          duration: 5.13,
          original_text: "training and inside to make a change in",
          start_time: 372.53,
          text: "training and inside to make a change in",
        },
        {
          detected_language: "en",
          duration: 5.82,
          original_text: "my life and I called the recruiter up",
          start_time: 375.62,
          text: "my life and I called the recruiter up",
        },
        {
          detected_language: "en",
          duration: 6.18,
          original_text: "and he asked me these questions he had",
          start_time: 377.66,
          text: "and he asked me these questions he had",
        },
        {
          detected_language: "en",
          duration: 5.19,
          original_text: "to Rehana meet a certain a like a",
          start_time: 381.44,
          text: "to Rehana meet a certain a like a",
        },
        {
          detected_language: "en",
          duration: 6.8,
          original_text: "certain height in weight limit I was six",
          start_time: 383.84,
          text: "certain height in weight limit I was six",
        },
        {
          detected_language: "en",
          duration: 6.54,
          original_text: "foot one and 300 pounds he laughed at me",
          start_time: 386.63,
          text: "foot one and 300 pounds he laughed at me",
        },
        {
          detected_language: "en",
          duration: 5.8,
          original_text: "seven other recruiters laughed at me",
          start_time: 390.64,
          text: "seven other recruiters laughed at me",
        },
        {
          detected_language: "en",
          duration: 5.06,
          original_text: "one recruiter finally said come on in",
          start_time: 393.17,
          text: "one recruiter finally said come on in",
        },
        {
          detected_language: "en",
          duration: 4.76,
          original_text: "I'm too busy to talk to you on the phone",
          start_time: 396.44,
          text: "I'm too busy to talk to you on the phone",
        },
        {
          detected_language: "en",
          duration: 5.26,
          original_text: "he didn't know how much I weighed I",
          start_time: 398.23,
          text: "he didn't know how much I weighed I",
        },
        {
          detected_language: "en",
          duration: 4.0,
          original_text: "walked in the recruiters office and he",
          start_time: 401.2,
          text: "walked in the recruiters office and he",
        },
        {
          detected_language: "en",
          duration: 4.2,
          original_text: "looked at me and he said you're fat and",
          start_time: 403.49,
          text: "looked at me and he said you're fat and",
        },
        {
          detected_language: "en",
          duration: 5.28,
          original_text: "you're black got someone to be a Navy",
          start_time: 405.2,
          text: "you're black got someone to be a Navy",
        },
        {
          detected_language: "en",
          duration: 4.74,
          original_text: "SEAL I didn't know they'd only been 35",
          start_time: 407.69,
          text: "SEAL I didn't know they'd only been 35",
        },
        {
          detected_language: "en",
          duration: 7.71,
          original_text: "african-american Navy SEALs at that time",
          start_time: 410.48,
          text: "african-american Navy SEALs at that time",
        },
        {
          detected_language: "en",
          duration: 8.46,
          original_text: "in over 70 years he said I basically had",
          start_time: 412.43,
          text: "in over 70 years he said I basically had",
        },
        {
          detected_language: "en",
          duration: 5.25,
          original_text: "to lose 160 pounds in less than three",
          start_time: 418.19,
          text: "to lose 160 pounds in less than three",
        },
        {
          detected_language: "en",
          duration: 6.11,
          original_text: "months because of my age I was getting",
          start_time: 420.89,
          text: "months because of my age I was getting",
        },
        {
          detected_language: "en",
          duration: 10.79,
          original_text: "too old I came back three months later",
          start_time: 423.44,
          text: "too old I came back three months later",
        },
        {
          detected_language: "en",
          duration: 7.23,
          original_text: "160 pounds lighter I thank you",
          start_time: 427.0,
          text: "160 pounds lighter I thank you",
        },
        {
          detected_language: "en",
          duration: 7.59,
          original_text: "[Music]",
          start_time: 434.78,
          text: "[Music]",
        },
        {
          detected_language: "en",
          duration: 6.58,
          original_text: "and literally I spent 18 months going",
          start_time: 437.41,
          text: "and literally I spent 18 months going",
        },
        {
          detected_language: "en",
          duration: 4.01,
          original_text: "through buds which is a six-month",
          start_time: 442.37,
          text: "through buds which is a six-month",
        },
        {
          detected_language: "en",
          duration: 4.56,
          original_text: "program went through three whole weeks",
          start_time: 443.99,
          text: "program went through three whole weeks",
        },
        {
          detected_language: "en",
          duration: 5.47,
          original_text: "that is where I went marcus luttrell",
          start_time: 446.38,
          text: "that is where I went marcus luttrell",
        },
        {
          detected_language: "en",
          duration: 5.01,
          original_text: "Danny Dietz Michael Murphy another Medal",
          start_time: 448.55,
          text: "Danny Dietz Michael Murphy another Medal",
        },
        {
          detected_language: "en",
          duration: 3.81,
          original_text: "of Honor winner I went through hell week",
          start_time: 451.85,
          text: "of Honor winner I went through hell week",
        },
        {
          detected_language: "en",
          duration: 4.73,
          original_text: "with all these guys real heroes I am NOT",
          start_time: 453.56,
          text: "with all these guys real heroes I am NOT",
        },
        {
          detected_language: "en",
          duration: 5.88,
          original_text: "a hero I served with real heroes and",
          start_time: 455.66,
          text: "a hero I served with real heroes and",
        },
        {
          detected_language: "en",
          duration: 4.96,
          original_text: "from there I went on to raise over two",
          start_time: 458.29,
          text: "from there I went on to raise over two",
        },
        {
          detected_language: "en",
          duration: 8.88,
          original_text: "million dollars for Special Operations",
          start_time: 461.54,
          text: "million dollars for Special Operations",
        },
        {
          detected_language: "en",
          duration: 9.75,
          original_text: "Warrior Foundation but I'm gonna end you",
          start_time: 463.25,
          text: "Warrior Foundation but I'm gonna end you",
        },
        {
          detected_language: "en",
          duration: 5.55,
          original_text: "with this right here I had the most",
          start_time: 470.42,
          text: "with this right here I had the most",
        },
        {
          detected_language: "en",
          duration: 5.58,
          original_text: "respect I can possibly muster up for all",
          start_time: 473.0,
          text: "respect I can possibly muster up for all",
        },
        {
          detected_language: "en",
          duration: 5.25,
          original_text: "of you in this room I know what it takes",
          start_time: 475.97,
          text: "of you in this room I know what it takes",
        },
        {
          detected_language: "en",
          duration: 5.19,
          original_text: "to be a combat soldier and I used to",
          start_time: 478.58,
          text: "to be a combat soldier and I used to",
        },
        {
          detected_language: "en",
          duration: 6.63,
          original_text: "look for courage I thought courage was a",
          start_time: 481.22,
          text: "look for courage I thought courage was a",
        },
        {
          detected_language: "en",
          duration: 5.64,
          original_text: "man who won the medal of honor it is but",
          start_time: 483.77,
          text: "man who won the medal of honor it is but",
        },
        {
          detected_language: "en",
          duration: 3.33,
          original_text: "courage is a man who's willing to put",
          start_time: 487.85,
          text: "courage is a man who's willing to put",
        },
        {
          detected_language: "en",
          duration: 4.41,
          original_text: "those boots on every single day of his",
          start_time: 489.41,
          text: "those boots on every single day of his",
        },
        {
          detected_language: "en",
          duration: 4.86,
          original_text: "life to go out there and fight for this",
          start_time: 491.18,
          text: "life to go out there and fight for this",
        },
        {
          detected_language: "en",
          duration: 3.33,
          original_text: "country where nobody even knows what the",
          start_time: 493.82,
          text: "country where nobody even knows what the",
        },
        {
          detected_language: "en",
          duration: 3.03,
          original_text: "hell they're doing or what the hell",
          start_time: 496.04,
          text: "hell they're doing or what the hell",
        },
        {
          detected_language: "en",
          duration: 4.79,
          original_text: "they're at do you do for the man beside",
          start_time: 497.15,
          text: "they're at do you do for the man beside",
        },
        {
          detected_language: "en",
          duration: 18.74,
          original_text: "you thank you",
          start_time: 499.07,
          text: "you thank you",
        },
        {
          detected_language: "en",
          duration: 17.93,
          original_text: "[Applause]",
          start_time: 501.94,
          text: "[Applause]",
        },
        {
          detected_language: "en",
          duration: 2.06,
          original_text: "you",
          start_time: 517.81,
          text: "you",
        },
      ],
      "quick-questions": [
        "What 2005 military tragedy inspired David Goggins to start competing in extreme endurance events for charity?",
        "After weighing 300 pounds and being turned away by multiple recruiters, what incredible physical feat did Goggins accomplish in less than three months to qualify for the Navy SEALs?",
        "While he honors Medal of Honor recipients, how does Goggins ultimately define the 'courage' of an everyday soldier fighting for the person beside them?",
      ],
      success: true,
    };
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
    // // Cancel any existing query request
    // if (currentQueryController) {
    //   console.log(
    //     "Canceling previous query request for:",
    //     currentQueryController.query
    //   );
    //   currentQueryController.abort();
    // }

    // const apiKey = localStorage.getItem("gemini_api_key");

    // if (!apiKey) {
    //   throw new Error("API key not found. Please set your Gemini API key.");
    // }

    // // Create new AbortController for this request
    // const controller = new AbortController();
    // controller.query = query; // Store query for logging
    // currentQueryController = controller;

    // console.log("Starting new query request:", query);

    // const response = await fetch("http://localhost:5001/api/query", {
    //   method: "POST",
    //   signal: controller.signal,
    //   headers: {
    //     "Content-Type": "application/json",
    //     "X-API-Key": apiKey,
    //   },
    //   body: JSON.stringify({ query }),
    // });

    // // Check if request was aborted
    // if (controller.signal.aborted) {
    //   throw new Error("Request was cancelled");
    // }

    // const data = await response.json();

    // // Clear the controller if this request completed successfully
    // if (currentQueryController === controller) {
    //   currentQueryController = null;
    //   console.log("Query request completed successfully for:", query);
    // }

    // return data;

    // Mock Data

    await new Promise((resolve) => setTimeout(resolve, 5000));
    return {
      response:
        "### Physical Transformation Challenge\n\n*   While working a job spraying for cockroaches and weighing 300 pounds, David Goggins was inspired by a TV show about Navy SEALs to change his life. [05:32]\n*   After being laughed at by seven other recruiters, one finally told him to come into the office. [06:05]\n*   The recruiter told him, \"You're fat and you're black,\" and stated that he had to lose 106 pounds. (The video incorrectly states 160 pounds at [06:36] but the required weight for his height meant a 106-pound loss).\n*   Goggins was given a strict deadline to lose the weight: less than three months, because he was approaching the age limit for enlistment. [06:42]\n*   He successfully met the challenge, returning three months later having lost the required weight. [06:48]",
      success: true,
      timestamps: [
        {
          text: "retired chief petty officer Dave Goggins is well known for his physical and mental toughness and for...",
          time: "00:00",
        },
        {
          text: "day so I like to thank the VFW very much for giving me this this award it means more than meeting an...",
          time: "03:30",
        },
        {
          text: "of Honor winner I went through hell week with all these guys real heroes I am NOT a hero I served wi...",
          time: "07:31",
        },
      ],
    };
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
