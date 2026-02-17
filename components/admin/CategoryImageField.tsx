"use client";

import { useRef } from "react";
import ImageUploader from "./ImageUploader";

export default function CategoryImageField({
  defaultValue,
  label = "تصویر دسته",
}: {
  defaultValue?: string | null;
  label?: string;
}) {
  const hiddenRef = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-2">
      {/* hidden input که مقدار نهایی در فرم ارسال شود */}
      <input
        ref={hiddenRef}
        type="hidden"
        name="imageUrl"
        defaultValue={defaultValue ?? ""}
      />

      <label className="block text-sm mb-1">{label}</label>
      <ImageUploader
        value={defaultValue ?? ""}
        onChange={(url: string) => {
          if (hiddenRef.current) hiddenRef.current.value = url;
        }}
      />
    </div>
  );
}
