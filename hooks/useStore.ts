import { create } from "zustand";

interface Ordinance {
  folder_id: string;
  pdf_id: string;
  folder_name: string;
  pdf_name: string;
}

const initialOrdinance: Ordinance = {
  folder_id: "",
  pdf_id: "",
  folder_name: "",
  pdf_name: "",
};

interface Store {
  ordinance: Ordinance;
  setOrdinance: (ordinance?: Partial<Ordinance>) => void;
}

export const useStore = create<Store>((set) => ({
  ordinance: initialOrdinance,
  setOrdinance: (ordinance = {}) =>
    set({
      ordinance: {
        ...initialOrdinance,
        ...ordinance,
      },
    }),
}));
