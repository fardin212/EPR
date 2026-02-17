export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="text-sm text-gray-300 mb-1">{label}</div>
      {children}
    </label>
  );
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={"w-full bg-graybg-light rounded-xl2 px-3 py-2 ring-1 ring-white/10 " + (props.className||"")} />;
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={"w-full bg-graybg-light rounded-xl2 px-3 py-2 ring-1 ring-white/10 min-h-[120px] " + (props.className||"")} />;
}
