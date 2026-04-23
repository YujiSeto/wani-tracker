interface ErrorCardProps {
  title: string;
  message: string;
  hint?: string;
}

export function ErrorCard({ title, message, hint }: ErrorCardProps) {
  return (
    <div
      role="alert"
      className="rounded-2xl border border-red-200/60 dark:border-red-800/40 bg-red-50 dark:bg-red-950/30 p-6 flex gap-4 items-start shadow-sm"
    >
      {/* Icon */}
      <div
        className="w-12 h-12 rounded-xl bg-red-100 dark:bg-red-900/40 flex items-center justify-center flex-shrink-0 text-xl"
        aria-hidden="true"
      >
        ⚠️
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-bold text-red-700 dark:text-red-400 mb-1">
          {title}
        </h3>
        <p className="text-sm text-red-600 dark:text-red-300 leading-relaxed">
          {message}
        </p>
        {hint && (
          <p className="mt-3 text-xs font-mono text-red-500 dark:text-red-400 bg-red-100 dark:bg-red-900/40 px-3 py-2 rounded-lg">
            {hint}
          </p>
        )}
      </div>
    </div>
  );
}
