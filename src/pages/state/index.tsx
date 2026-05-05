import { useLocation } from '../../contexts/location/useLocation';
import { useUi } from '../../contexts/ui/useUi';
import { ModalShell } from '../../components/layout/ModalShell';

const STATES = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

export function StatePage() {
  const { closeModal } = useUi();
  const { selectState, selectedState } = useLocation();

  return (
    <ModalShell title="Sua localização" onClose={closeModal}>
      <div className="liah-react-state-grid">
        {STATES.map((state) => (
          <button
            key={state}
            type="button"
            className={selectedState === state ? 'is-active' : ''}
            onClick={() => selectState(state)}
          >
            {state}
          </button>
        ))}
        <button type="button" className={selectedState === 'outro' ? 'is-active' : ''} onClick={() => selectState('outro')}>
          Outro
        </button>
      </div>
    </ModalShell>
  );
}
