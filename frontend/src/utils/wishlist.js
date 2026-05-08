export function getWishlistKey(userId) {
  return `unirent:wishlist:${userId || "guest"}`;
}

export function getWishlistIds(userId) {
  try {
    const saved = JSON.parse(localStorage.getItem(getWishlistKey(userId)) || "[]");
    return Array.isArray(saved) ? saved.map(String) : [];
  } catch {
    return [];
  }
}

export function saveWishlistIds(userId, ids) {
  localStorage.setItem(getWishlistKey(userId), JSON.stringify([...new Set(ids.map(String))]));
  window.dispatchEvent(new Event("wishlist-updated"));
}

export function toggleWishlistItem(userId, itemId) {
  const ids = getWishlistIds(userId);
  const id = String(itemId);
  const nextIds = ids.includes(id) ? ids.filter((savedId) => savedId !== id) : [...ids, id];
  saveWishlistIds(userId, nextIds);
  return nextIds;
}

export function removeWishlistItem(userId, itemId) {
  const nextIds = getWishlistIds(userId).filter((savedId) => savedId !== String(itemId));
  saveWishlistIds(userId, nextIds);
  return nextIds;
}
