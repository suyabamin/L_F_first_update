export function normalizeCategory(category) {
  const key = String(category || '').trim().toLowerCase();
  const aliases = {
    document: 'paper',
    documents: 'paper',
    paper: 'paper',
    papers: 'paper',
    key: 'key',
    keys: 'key',
    bag: 'bag',
    bags: 'bag',
    wallet: 'bag',
    wallets: 'bag',
    luggage: 'bag',
    pet: 'pets',
    pets: 'pets',
    electronics: 'electronics',
    electronic: 'electronics',
    jewellery: 'jewelry',
    jewelry: 'jewelry',
    other: 'others',
    others: 'others'
  };
  return aliases[key] || key || 'others';
}

export function postDto(post, extra = {}) {
  const doc = post?.toObject ? post.toObject() : post;
  if (!doc) return null;
  const owner = doc.user || {};
  const primary = doc.images?.find((img) => img.isPrimary) || doc.images?.[0];
  return {
    id: String(doc._id),
    _id: String(doc._id),
    user_id: owner._id ? String(owner._id) : String(doc.user || ''),
    title: doc.title,
    description: doc.description,
    item_type: doc.itemType,
    type: doc.itemType,
    status: doc.status,
    category: doc.category,
    location_name: doc.locationName,
    location: doc.locationName,
    latitude: doc.coordinates?.lat,
    longitude: doc.coordinates?.lng,
    date_occurred: doc.dateOccurred,
    public_contact: doc.publicContact,
    reward_amount: doc.rewardAmount,
    priority_level: doc.priorityLevel,
    view_count: doc.viewCount,
    image_path: primary?.path || '',
    images: (doc.images || []).map((img) => img.path),
    full_name: owner.fullName,
    postedBy: owner.fullName,
    username: owner.username,
    created_at: doc.createdAt,
    updated_at: doc.updatedAt,
    ...extra
  };
}

export function conversationKey(ids) {
  return ids.map(String).sort();
}
