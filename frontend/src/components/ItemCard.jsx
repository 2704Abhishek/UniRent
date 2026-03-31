export default function ItemCard({ item }) {
  return (
    <div className="border rounded p-4 shadow hover:shadow-lg">
      <img src={item.image_urls[0]} alt={item.title} className="h-40 w-full object-cover rounded" />
      <h3 className="text-lg font-semibold mt-2">{item.title}</h3>
      <p className="text-gray-600">{item.category}</p>
      <p className="text-blue-600">₹{item.price_per_day}/day</p>
    </div>
  );
}
