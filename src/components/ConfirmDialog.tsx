"use client";

import { t, type Locale } from "@/i18n/translations";

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  locale?: Locale;
}

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmText,
  locale = "ar",
}: ConfirmDialogProps) {
  if (!open) return null;

  const isRtl = locale === "ar";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/40"
        onClick={onClose}
      />

      {/* Dialog */}
      <div
        dir={isRtl ? "rtl" : "ltr"}
        className="relative z-10 w-full max-w-md mx-4 bg-white rounded-xl shadow-xl p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-sm text-gray-600 mb-6">{message}</p>

        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            {t(locale, "cancel")}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
          >
            {confirmText || t(locale, "confirm")}
          </button>
        </div>
      </div>
    </div>
  );
}
