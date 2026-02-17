export function Card({ children, hover=true, className="" }:{children:React.ReactNode;hover?:boolean;className?:string}) {
  return (
    <div className={`rounded-2xl border bg-white ${hover?'transition hover:shadow-lg hover:-translate-y-0.5':''} ${className}`} >
      {children}
    </div>
  );
}
export function CardMedia({ src, alt }:{src:string;alt?:string}) {
  return <div className="aspect-[16/10] overflow-hidden rounded-2xl md:rounded-2xl md:rounded-b-none">
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img src={src} alt={alt||""} className="w-full h-full object-cover transition group-hover:scale-[1.03]" />
  </div>;
}
export function CardBody({children}:{children:React.ReactNode}) {
  return <div className="p-4">{children}</div>;
}
export function Pill({children, className=""}:{children:React.ReactNode;className?:string}) {
  return <span className={`inline-block px-2 py-0.5 rounded-full text-xs ${className}`}>{children}</span>;
}
