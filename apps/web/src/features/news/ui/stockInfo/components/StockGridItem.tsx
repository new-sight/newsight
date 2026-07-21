export default function StockGridItem({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="border border-gray-500/10 rounded-lg flex flex-col overflow-hidden w-full text-center">
      <div className="bg-gray-600/20 py-2 px-3 text-sm text-gray-300 font-bold">
        {title}
      </div>
      <div className="py-3 px-3 text-sm text-white">{value}</div>
    </div>
  );
}
