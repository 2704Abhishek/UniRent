const Item = require("../models/Item");
const Rental = require("../models/Rental");

const quickPrompts = [
  "How do I rent an item?",
  "Suggest available items",
  "My payment is pending",
  "How do I return an item?"
];

const stopWords = new Set([
  "a",
  "an",
  "and",
  "are",
  "available",
  "can",
  "for",
  "give",
  "help",
  "how",
  "i",
  "in",
  "is",
  "item",
  "items",
  "me",
  "need",
  "of",
  "on",
  "please",
  "rent",
  "rental",
  "show",
  "suggest",
  "the",
  "to",
  "want",
  "with"
]);

const topics = [
  {
    id: "rent",
    keywords: ["rent", "borrow", "book", "request", "date"],
    answer:
      "To rent an item, open Browse Items, choose Rent an item, select an available listing, then submit the rental dates. After the request is created, check My Rentals to pay and track the status.",
    suggestions: ["Suggest available items", "What happens after I request?", "Why is an item not available?"],
    actions: [{ label: "Browse items", path: "/home" }]
  },
  {
    id: "payment",
    keywords: ["pay", "payment", "pending", "transaction", "deposit", "amount"],
    answer:
      "For a pending payment, open My Rentals, choose Items I Rented, and use Pay & Start Rental on that request. The total normally includes rent for the selected days plus the deposit.",
    suggestions: ["How much do I pay?", "Deposit or refund confusion", "How do I delete a pending request?"],
    actions: [{ label: "Open My Rentals", path: "/dashboard" }]
  },
  {
    id: "return",
    keywords: ["return", "otp", "refund", "back", "complete"],
    answer:
      "To return an item, open My Rentals, choose Items I Rented, and generate the return OTP. The owner uses that OTP to confirm the return, then the deposit can be refunded or settled.",
    suggestions: ["Return OTP is not working", "Deposit or refund confusion", "Where do I see refund status?"],
    actions: [{ label: "Open My Rentals", path: "/dashboard" }]
  },
  {
    id: "wishlist",
    keywords: ["wishlist", "save", "saved", "favorite", "favourite"],
    answer:
      "Use the wishlist to save items you may rent later. Open an item and press Add to wishlist, then manage saved items from the Wishlist page.",
    suggestions: ["Suggest available items", "Remove an item from wishlist", "Find saved items"],
    actions: [{ label: "Open Wishlist", path: "/wishlist" }]
  },
  {
    id: "listing",
    keywords: ["list", "owner", "upload", "photo", "price", "address"],
    answer:
      "To list your item, open Browse Items, choose List your item, then add a clear title, category, photo, daily rent, deposit, phone number, and pickup address.",
    suggestions: ["What price should I set?", "Why is my item on rent?", "How do I manage listings?"],
    actions: [
      { label: "List an item", path: "/home" },
      { label: "My Listings", path: "/my-listings" }
    ]
  },
  {
    id: "search",
    keywords: ["find", "search", "category", "laptop", "charger", "calculator", "shirt", "book"],
    answer:
      "Use the search bar and category chips on Browse Items. Try specific words like laptop, charger, calculator, shirt, book, or the pickup location you prefer.",
    suggestions: ["Suggest available items", "Show newest items", "How do I rent an item?"],
    actions: [{ label: "Search items", path: "/home" }]
  },
  {
    id: "support",
    keywords: ["stuck", "problem", "issue", "error", "contact", "support", "admin"],
    answer:
      "If you are stuck, first note the item name, rental status, payment status, and the action that failed. The Help page has the fastest fixes for common UniRent issues.",
    suggestions: ["My payment is pending", "How do I return an item?", "Why can I not rent this item?"],
    actions: [{ label: "Open Help", path: "/help" }]
  }
];

function cleanMessage(message = "") {
  return String(message).toLowerCase().trim();
}

function tokenize(message) {
  return cleanMessage(message)
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 2 && !stopWords.has(word));
}

function chooseTopic(message) {
  const normalized = cleanMessage(message);
  let bestTopic = topics[0];
  let bestScore = 0;

  topics.forEach((topic) => {
    const score = topic.keywords.reduce(
      (total, keyword) => total + (normalized.includes(keyword) ? 1 : 0),
      0
    );

    if (score > bestScore) {
      bestTopic = topic;
      bestScore = score;
    }
  });

  return bestTopic;
}

function rankItem(item, terms) {
  if (!terms.length) return 1;

  const searchable = [
    item.title,
    item.description,
    item.category,
    item.address,
    item.owner?.name
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return terms.reduce((score, term) => {
    if (String(item.category || "").toLowerCase() === term) return score + 4;
    if (String(item.title || "").toLowerCase().includes(term)) return score + 3;
    return searchable.includes(term) ? score + 1 : score;
  }, 0);
}

async function getRecommendedItems(userId, message) {
  const terms = tokenize(message);
  const items = await Item.find({
    available: { $ne: false },
    owner: { $ne: userId }
  })
    .populate("owner", "name email")
    .sort({ createdAt: -1 })
    .limit(24);

  return items
    .map((item) => ({ item, score: rankItem(item, terms) }))
    .filter(({ score }, index) => score > 0 || terms.length === 0 || index < 6)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(({ item }) => ({
      id: item._id,
      title: item.title,
      category: item.category || "General",
      pricePerDay: item.pricePerDay,
      depositAmount: item.depositAmount || 0,
      path: `/items/${item._id}`
    }));
}

async function getRentalSummary(userId) {
  const rentals = await Rental.find({
    $or: [{ renter_id: userId }, { owner_id: userId }]
  }).limit(50);

  return {
    pendingPayments: rentals.filter(
      (rental) => String(rental.renter_id) === String(userId) && rental.payment_status === "pending"
    ).length,
    activeReturns: rentals.filter(
      (rental) =>
        String(rental.renter_id) === String(userId) &&
        ["approved", "active"].includes(rental.rental_status)
    ).length,
    ownerReturns: rentals.filter(
      (rental) =>
        String(rental.owner_id) === String(userId) &&
        rental.rental_status === "returned" &&
        rental.refund_status === "pending"
    ).length
  };
}

function buildFollowUp(summary) {
  if (summary.pendingPayments > 0) {
    return ` I also noticed ${summary.pendingPayments} rental payment${summary.pendingPayments > 1 ? "s" : ""} waiting in My Rentals.`;
  }

  if (summary.activeReturns > 0) {
    return ` You have ${summary.activeReturns} active rental${summary.activeReturns > 1 ? "s" : ""}; generate a return OTP when you are ready to return.`;
  }

  if (summary.ownerReturns > 0) {
    return ` You also have ${summary.ownerReturns} returned item${summary.ownerReturns > 1 ? "s" : ""} waiting for deposit settlement.`;
  }

  return "";
}

exports.handleAssistantMessage = async (req, res) => {
  try {
    const { message = "" } = req.body;
    const trimmedMessage = String(message).trim();

    if (!trimmedMessage) {
      return res.status(400).json({ error: "Message is required" });
    }

    const userId = req.user.id;
    const topic = chooseTopic(trimmedMessage);
    const shouldRecommend = /suggest|recommend|find|search|available|laptop|charger|calculator|shirt|book|phone/i.test(trimmedMessage);
    const [recommendedItems, summary] = await Promise.all([
      shouldRecommend ? getRecommendedItems(userId, trimmedMessage) : Promise.resolve([]),
      getRentalSummary(userId)
    ]);

    const recommendationText = recommendedItems.length
      ? ` I found ${recommendedItems.length} available item${recommendedItems.length > 1 ? "s" : ""} that may help.`
      : shouldRecommend
        ? " I could not find a strong item match right now, so try a broader search from Browse Items."
        : "";

    res.json({
      reply: `${topic.answer}${recommendationText}${buildFollowUp(summary)}`,
      suggestions: topic.suggestions,
      actions: topic.actions,
      recommendedItems,
      quickPrompts
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
