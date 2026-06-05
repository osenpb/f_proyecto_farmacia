export interface StockMedicamentoResponse {
  idMedicamento: number;
  nombreMedicamento: string;
  descripcion: string;
  stockTotal: number;
  idSede: number;
  nombreSede: string;
  cantidadLotes: number;
  lotesProximosCaducar: number;
  estadoStock: 'NORMAL' | 'BAJO' | 'CRITICO';
  claseCSS: string;
}

export interface StockEstadisticas {
  totalMedicamentos: number;
  stockTotal: number;
  normales: number;
  bajo: number;
  critico: number;
  lotesProximosCaducar: number;
}
