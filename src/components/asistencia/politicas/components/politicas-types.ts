export interface PoliticaFormState {
  editingPolitica: any;
  nombre: string;
  nivelId: string;
  turno: string;
  horaEntrada: string;
  horaSalida: string;
  tolerancia: number;
  activo: boolean;
}

export type PoliticaFormAction =
  | { type: "PATCH"; patch: Partial<PoliticaFormState> }
  | { type: "OPEN_NEW" }
  | { type: "OPEN_EDIT"; politica: any };

export const politicaFormInitialState: PoliticaFormState = {
  editingPolitica: null,
  nombre: "",
  nivelId: "all",
  turno: "all",
  horaEntrada: "08:00",
  horaSalida: "13:00",
  tolerancia: 0,
  activo: true,
};

export function politicaFormReducer(
  state: PoliticaFormState,
  action: PoliticaFormAction,
): PoliticaFormState {
  switch (action.type) {
    case "PATCH":
      return { ...state, ...action.patch };
    case "OPEN_NEW":
      return { ...politicaFormInitialState };
    case "OPEN_EDIT":
      return {
        editingPolitica: action.politica,
        nombre: action.politica.nombre,
        nivelId: action.politica.nivelId || "all",
        turno: action.politica.turno || "all",
        horaEntrada: action.politica.horaEntrada,
        horaSalida: action.politica.horaSalida,
        tolerancia: action.politica.tolerancia,
        activo: action.politica.activo,
      };
    default:
      return state;
  }
}
