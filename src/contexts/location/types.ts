export interface LocationContextValue {
  selectedState: string | null;
  selectState: (state: string) => void;
}
