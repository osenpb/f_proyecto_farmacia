import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';

export interface Anuncio {
  id: number;
  titulo: string;
  descripcion: string;
  imagenUrl: string;
}

@Injectable({ providedIn: 'root' })
export class AnuncioService {
  private readonly http = inject(HttpClient);
  private readonly url = 'http://localhost:8085/ws';

  obtenerAnuncios(): Observable<Anuncio[]> {
    const body = `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
                  xmlns:anun="http://example.com/anuncio">
  <soapenv:Header/>
  <soapenv:Body>
    <anun:ObtenerAnunciosRequest/>
  </soapenv:Body>
</soapenv:Envelope>`;

    const headers = new HttpHeaders({
      'Content-Type': 'text/xml;charset=UTF-8',
      'SOAPAction': '',
    });

    return this.http.post(this.url, body, { headers, responseType: 'text' }).pipe(
      map(xml => this.parseAnuncios(xml))
    );
  }

  private parseAnuncios(xml: string): Anuncio[] {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xml, 'text/xml');
    const ns = 'http://example.com/anuncio';
    // try both element names (anuncio / lista) in case of naming difference
    let items = Array.from(doc.getElementsByTagNameNS(ns, 'anuncio'));
    if (items.length === 0) items = Array.from(doc.getElementsByTagNameNS(ns, 'lista'));
    return items.map(node => ({
      id: Number(node.getElementsByTagNameNS(ns, 'id')[0]?.textContent ?? 0),
      titulo: node.getElementsByTagNameNS(ns, 'titulo')[0]?.textContent ?? '',
      descripcion: node.getElementsByTagNameNS(ns, 'descripcion')[0]?.textContent ?? '',
      imagenUrl: node.getElementsByTagNameNS(ns, 'imagenUrl')[0]?.textContent ?? '',
    }));
  }
}
