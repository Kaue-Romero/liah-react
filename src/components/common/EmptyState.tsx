import type { ReactNode } from 'react';

interface EmptyStateProps {
  title: string;
  image?: string;
  children?: ReactNode;
}

export function EmptyState({ title, image, children }: EmptyStateProps) {
  return (
    <div className="liah-react-empty">
      {image ? <img src={image} alt="" /> : null}
      <strong>{title}</strong>
      {children ? <p>{children}</p> : null}
    </div>
  );
}
