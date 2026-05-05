import type { ReactNode } from 'react';

interface EmptyStateProps {
  image?: string;
  title: string;
  children?: ReactNode;
}

export function EmptyState({ image, title, children }: EmptyStateProps) {
  return (
    <div className="liah-react-empty">
      {image ? <img src={image} alt="" /> : null}
      <strong>{title}</strong>
      {children ? <p>{children}</p> : null}
    </div>
  );
}
