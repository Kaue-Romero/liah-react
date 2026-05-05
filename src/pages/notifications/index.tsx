import { useUi } from '../../contexts/ui/useUi';
import { useUser } from '../../contexts/user/useUser';
import type { NotificationItem } from '../../types';
import { formatDateLabel } from '../../utils/format';
import { EmptyState } from '../../components/common/EmptyState';
import { ModalShell } from '../../components/layout/ModalShell';

export function NotificationsPage() {
  const { closeModal } = useUi();
  const { notifications } = useUser();
  const avisos = notifications.filter((item) => item.tipo !== 'marketing');
  const marketing = notifications.filter((item) => item.tipo === 'marketing');

  return (
    <ModalShell title="Notificações" onClose={closeModal}>
      <div className="liah-react-notification-groups">
        <NotificationGroup title="Avisos" items={avisos} />
        <NotificationGroup title="Em alta" items={marketing} />
      </div>
    </ModalShell>
  );
}

function NotificationGroup({ title, items }: { title: string; items: NotificationItem[] }) {
  return (
    <section>
      <h3>{title}</h3>
      {!items.length ? (
        <EmptyState title="Nenhuma notificação" />
      ) : (
        <div className="liah-react-notification-list">
          {items.map((item, index) => (
            <article className={item.status === 'nao_lida' ? 'is-unread' : ''} key={`${item.id || item.titulo}-${index}`}>
              {item.image ? <img src={item.image} alt="" /> : null}
              <div>
                <strong>{item.titulo}</strong>
                {item.subtitulo ? <span>{item.subtitulo}</span> : null}
                {item.descricao ? <p>{item.descricao}</p> : null}
                {item.createdAt ? <small>{formatDateLabel(item.createdAt)}</small> : null}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
