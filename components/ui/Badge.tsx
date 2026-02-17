export default function Badge({children, tone="indigo"}:{children:React.ReactNode;tone?: "indigo"|"sky"|"emerald"|"amber"|"gray"}) {
  const map:any={
    indigo:"bg-indigo-50 text-indigo-700",
    sky:"bg-sky-50 text-sky-700",
    emerald:"bg-emerald-50 text-emerald-700",
    amber:"bg-amber-50 text-amber-700",
    gray:"bg-gray-100 text-gray-700",
  };
  return <span className={`px-2 py-0.5 rounded-lg text-xs ${map[tone]}`}>{children}</span>;
}
