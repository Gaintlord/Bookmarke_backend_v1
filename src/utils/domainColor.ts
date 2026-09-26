// Color -> bare domain names that share it. Names are the first label of the
// registrable domain (e.g. "youtube.com" -> "youtube") and are matched against
// bokmarkeTable.hostName after stripping www, port and the TLD.
export const DOMAIN_COLORS: Record<string, string[]> = {
  red: [
    "youtube",
    "netflix",
    "doordash",
    "zomato",
    "airbnb",
    "pinterest",
    "adobe",
    "quora",
    "gitlab",
    "oracle",
    "coca-cola",
    "cnn",
    "espn",
    "target",
    "hulu",
  ],

  orange: [
    "reddit",
    "pornhub",
    "stackoverflow",
    "soundcloud",
    "ycombinator",
    "etsy",
    "firefox",
    "hubspot",
    "codecademy",
  ],

  amber: ["amazon", "paypal", "tripadvisor", "ebay"],

  yellow: ["snapchat", "imgur", "imdb", "bestbuy", "mcdonalds"],

  lime: ["kickstarter", "lime"],

  green: [
    "spotify",
    "whatsapp",
    "evernote",
    "shopify",
    "starbucks",
    "android",
    "robinhood",
    "xbox",
    "greenhouse",
  ],

  emerald: ["mint", "trello", "asana"],

  teal: ["tumblr", "vimeo", "mailchimp", "atlassian"],

  cyan: ["skype", "messenger", "mastodon", "line", "weebly"],

  sky: [
    "twitter",
    "telegram",
    "facebook",
    "linkedin",
    "google",
    "microsoft",
    "behance",
    "dropbox",
    "zoom",
    "ibm",
    "intel",
    "hp",
    "mozilla",
    "flipkart",
  ],

  blue: [
    "salesforce",
    "visa",
    "mastercard",
    "americanexpress",
    "coinbase",
    "venmo",
    "yelp",
    "indeed",
    "coursera",
    "udemy",
    "wordpress",
  ],

  indigo: ["discord", "samsung", "sap"],

  violet: ["figma", "twitch", "stripe", "linear", "pipedrive"],

  purple: ["canva", "yahoo", "verizon"],

  fuchsia: ["instagram", "tinder", "dribbble"],

  pink: ["lyft"],

  rose: [],

  gray: [
    "x",
    "apple",
    "github",
    "notion",
    "uber",
    "threads",
    "tiktok",
    "medium",
    "steam",
    "steamcommunity",
  ],
};

// Inverted once at module load for O(1) lookups. First color listed wins if a
// name is accidentally present under more than one color.
const COLOR_BY_DOMAIN: Record<string, string> = {};
for (const [color, domains] of Object.entries(DOMAIN_COLORS)) {
  for (const domain of domains) {
    if (!(domain in COLOR_BY_DOMAIN)) COLOR_BY_DOMAIN[domain] = color;
  }
}

const PALETTE = Object.keys(DOMAIN_COLORS);

// FNV-1a style hash so unlisted domains always receive the same color.
const hash = (value: string): number => {
  let h = 2166136261;
  for (let i = 0; i < value.length; i++) {
    h ^= value.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h;
};

export const getDomainColor = (hostName: string): string => {
  const label = hostName
    .toLowerCase()
    .replace(/^www\./, "")
    .split(":")[0]
    .split(".")[0];
  return COLOR_BY_DOMAIN[label] ?? PALETTE[hash(label) % PALETTE.length];
};
