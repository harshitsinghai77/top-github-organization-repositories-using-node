export default {
  app: {
    token: "914df6677d9c4883826a7048d8d95545", // <- enter your token here
    muted: false, // <- mute microphone by default
    googleIt: true, // <- ask users to google their request, in case of input.unknown action
  },
  locale: {
    strings: {
      welcomeTitle: "Hello, I'm Dr. Covid-19 Stats. I'm here to assist you. ",
      welcomeDescription:
        "Coronaviruses (CoV) are a large family of viruses transmitting between animals and people that cause illness ranging from the common cold to more severe diseases such as Middle East respiratory syndrome (MERS-CoV) and severe acute respiratory syndrome (SARS-CoV).",
      offlineTitle: "Oh, no!",
      offlineDescription:
        "It looks like you are not connected to the internet, this webpage requires internet connection, to process your requests",
      queryTitle: "Ask me anything...",
      voiceTitle: "Go ahead, im listening...",
    },
    settings: {
      speechLang: "en-US", // <- output language
      recognitionLang: "en-US", // <- input(recognition) language
    },
  },
};
