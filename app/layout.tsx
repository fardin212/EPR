import "./globals.css";

export const metadata = {
  title: "ERP نیکان",
  description: "نسخه جدید سیستم مدیریت سازمانی نیکان",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fa" dir="rtl">
      <body className="bg-slate-100 min-h-screen">
        {children}
      </body>
    </html>
  );
}
