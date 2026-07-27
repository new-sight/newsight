export default function MyPageBox({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex w-full flex-row items-center justify-between">
      <div className="text-base text-white/60">{label}</div>
      <div className="text-base text-white">{value}</div>
    </div>
  );
}
