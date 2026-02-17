export default function GlobalFx() {
  return (
    <style jsx global>{`
      /* همین CSS بالا؛ حواست باشد content:"" با دابل‌کوتیشن بماند */
      .shine-sweep::before{ content:""; /* ... ادامه همان */ }
      /* ... بقیه‌ی قواعد دقیقا مثل بالا ... */
    `}</style>
  );
}
