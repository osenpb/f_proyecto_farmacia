export interface VentaItemRequest {
  idMedicamento: number;
  cantidad: number;
  precioUnitario: number;
}

export interface VentaRequest {
  items: VentaItemRequest[];
}

export interface DetalleVentaResponse {
  idDetalle: number;
  nombreMedicamento: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export interface VentaResponse {
  idVenta: number;
  fecha: string;
  total: number;
  nombreSede: string;
  nombreUsuario: string;
  detalles: DetalleVentaResponse[];
}

export interface CartItem {
  idMedicamento: number;
  nombre: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
  stockMax: number;
}
