export default function NewsTag({ tag }: { tag: string }) {
  //#6582f2
  return (
    <div className="border border-[#6582f2] rounded-lg px-3 py-1 text-[#6582f2] text-xs inline-block shrink-0">
      <span>{tag}</span>
    </div>
  );
}
