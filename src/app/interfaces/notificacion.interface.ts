export interface NotificacionResponse {
  idNotificacion: number;
  mensaje: string;
  tipo: string;
  estado: string;
  fecha: string;
  fechaFormateada: string;
  idMedicamento: number | null;
  nombreMedicamento: string;
  stockMedicamento: number | null;
  idSede: number | null;
  nombreSede: string;
}
