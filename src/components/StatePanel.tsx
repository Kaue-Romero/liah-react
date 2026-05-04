import { ModalShell } from './ModalShell';

const STATES = [
  'AC',
  'AL',
  'AP',
  'AM',
  'BA',
  'CE',
  'DF',
  'ES',
  'GO',
  'MA',
  'MT',
  'MS',
  'MG',
  'PA',
  'PB',
  'PR',
  'PE',
  'PI',
  'RJ',
  'RN',
  'RS',
  'RO',
  'RR',
  'SC',
  'SP',
  'SE',
  'TO'
];

interface StatePanelProps {
  selectedState: string | null;
  onClose: () => void;
  onSelect: (state: string) => void;
}

export function StatePanel({ selectedState, onClose, onSelect }: StatePanelProps) {
  return (
    <ModalShell title="Sua localização" onClose={onClose}>
      <div className="liah-react-state-grid">
        {STATES.map((state) => (
          <button
            key={state}
            type="button"
            className={selectedState === state ? 'is-active' : ''}
            onClick={() => onSelect(state)}
          >
            {state}
          </button>
        ))}
        <button type="button" className={selectedState === 'outro' ? 'is-active' : ''} onClick={() => onSelect('outro')}>
          Outro
        </button>
      </div>
    </ModalShell>
  );
}
