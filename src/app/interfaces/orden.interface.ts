export type EstadoOrden = 'PENDIENTE' | 'APROBADA' | 'RECHAZADA' | 'COMPLETADA';
export type EstadoDetalle = 'PENDIENTE' | 'EN_PREPARACION' | 'EN_RUTA' | 'ENTREGADO';
export type TipoOrden = 'COMPRA' | 'TRANSFERENCIA' | 'DEVOLUCION';

export interface OrdenItemRequest {
  idMedicamento: number;
  cantidad: number;
}

export interface OrdenRequest {
  idSede: number;
  idSedeDestino?: number;
  tipo: TipoOrden;
  items: OrdenItemRequest[];
}

export interface OrdenResponse {
  idOrden: number;
  idUsuario: number;
  nombreUsuario: string;
  idSede: number;
  nombreSede: string;
  tipo: TipoOrden;
  estado: EstadoOrden;
  idSedeDestino?: number;
  nombreSedeDestino?: string;
  fecha: string;
}

export interface DetalleItemDTO {
  nombreMedicamento: string;
  cantidad: number;
  estado: EstadoDetalle;
}

export interface OrdenDetalleResponse {
  idOrden: number;
  nombreUsuario: string;
  tipo: TipoOrden;
  estado: EstadoOrden;
  fecha: string;
  nombreSede: string;
  items: DetalleItemDTO[];
}
