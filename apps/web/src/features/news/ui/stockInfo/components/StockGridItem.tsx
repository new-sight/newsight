export default function StockGridItem({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="border border-slate-800 rounded-lg p-3 flex flex-col gap-1 justify-center items-center">
      <div className="text-sm text-gray-300">{title}</div>
      <div className="text-base">{value}</div>
    </div>
  );
}
