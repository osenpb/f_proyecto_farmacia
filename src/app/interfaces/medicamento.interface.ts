export interface MedicamentoRequest {
  nombre: string;
  descripcion?: string;
}

export interface MedicamentoResponse {
  idMedicamento: number;
  nombre: string;
  descripcion: string;
  stockTotal: number;
  idSede: number;
  nombreSede: string;
  direccionSede: string;
  cantidadLotes: number;
  bajoStock: boolean;
}
