import React from 'react';

export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="specter-card flex flex-col items-center justify-center px-6 py-20 text-center">
      {Icon && (
        <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full border border-specter bg-specter-elevated">
          <Icon className="h-5 w-5 text-specter-muted" strokeWidth={1.75} />
        </div>
      )}
      <h3 className="text-base font-semibold text-specter-text">{title}</h3>
      {description && (
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-specter-muted">{description}</p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}