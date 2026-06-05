export interface LoteRequest {
  idMedicamento: number;
  idSede: number;
  codigoLote: string;
  fechaCaducidad: string;
  stockLote: number;
}

export interface LoteResponse {
  idLote: number;
  codigoLote: string;
  fechaCaducidad: string;
  stockLote: number;
  idMedicamento: number;
  nombreMedicamento: string;
  descripcionMedicamento: string;
  idSede: number;
  nombreSede: string;
  proximoCaducar: boolean;
  diasParaCaducar: number;
}

export interface LoteStockResponse {
  idLote: number;
  codigoLote: string;
  fechaCaducidad: string;
  stockLote: number;
  estadoCaducidad: string;
  diasRestantes: number;
  nombreMedicamento: string;
  idMedicamento: number;
}
