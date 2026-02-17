export default function Empty({title="موردی یافت نشد",hint}:{title?:string;hint?:string}) {
  return (
    <div className="border rounded-2xl bg-white p-8 text-center text-gray-600">
      <div className="text-lg font-semibold mb-1">{title}</div>
      {hint && <div className="text-sm">{hint}</div>}
    </div>
  );
}
