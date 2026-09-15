export function ErrorBanner({ message, onDismiss }: { message: string; onDismiss?: () => void }) {
  return (
    <div className="flex items-start justify-between gap-4 border-l-2 border-rust bg-rust-light px-4 py-3 text-sm text-rust" role="alert">
      <p>{message}</p>
      {onDismiss && (
        <button type="button" onClick={onDismiss} className="shrink-0 font-medium underline underline-offset-2">
          Dismiss
        </button>
      )}
    </div>
  );
}
