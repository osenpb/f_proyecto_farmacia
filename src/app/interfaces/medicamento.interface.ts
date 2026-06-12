export interface MedicamentoRequest {
  nombre: string;
  descripcion?: string;
  precioVenta?: number;
}

export interface MedicamentoResponse {
  idMedicamento: number;
  nombre: string;
  descripcion: string;
  precioVenta: number;
  stockTotal: number;
  idSede: number;
  nombreSede: string;
  direccionSede: string;
  cantidadLotes: number;
  bajoStock: boolean;
}
