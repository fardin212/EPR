export default function NotFound() {
  return (
    <main className="min-h-[60vh] grid place-items-center px-4">
      <div className="text-center space-y-2">
        <div className="text-7xl font-black text-gray-200">404</div>
        <div className="text-lg font-bold">صفحه یافت نشد</div>
        <a href="/" className="inline-block mt-3 px-4 py-2 rounded-xl border hover:bg-gray-50">بازگشت به خانه</a>
      </div>
    </main>
  );
}
