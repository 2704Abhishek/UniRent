import { useParams } from "react-router-dom";

export default function ItemDetail() {
  const { id } = useParams();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Item Detail</h1>
      <p className="mt-2">Showing details for item ID: {id}</p>
    </div>
  );
}
