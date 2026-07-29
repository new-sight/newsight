export default function InputBox({
  id,
  label,
  type,
  placeholder,
  value,
  onChange,
  onKeyDown,
}: {
  id: string;
  label: string;
  type: string;
  placeholder: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}) {
  return (
    <div className="flex w-full flex-col">
      <label className="text-base text-white/70" htmlFor={id}>
        {label}
      </label>
      <input
        className="h-12 w-full rounded-xl border border-white/20 bg-transparent px-4 text-base text-white/90 focus:outline-none focus:border-accent"
        type={type}
        id={id}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
      />
    </div>
  );
}
