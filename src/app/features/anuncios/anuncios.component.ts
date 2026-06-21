import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnuncioService, Anuncio } from '../../services/anuncio.service';

@Component({
  selector: 'app-anuncios',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="p-6">
      <h1 class="text-2xl font-bold text-gray-800 mb-6">Anuncios</h1>

      @if (loading()) {
        <div class="flex justify-center items-center h-40">
          <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        </div>
      }

      @if (error()) {
        <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          {{ error() }}
        </div>
      }

      @if (!loading() && anuncios().length === 0 && !error()) {
        <p class="text-gray-500 text-center py-10">No hay anuncios disponibles.</p>
      }

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        @for (anuncio of anuncios(); track anuncio.id) {
          <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            @if (anuncio.imagenUrl) {
              <img [src]="anuncio.imagenUrl" [alt]="anuncio.titulo"
                   class="w-full h-48 object-cover"
                   (error)="onImgError($event)">
            }
            <div class="p-4">
              <h2 class="text-lg font-semibold text-gray-800 mb-2">{{ anuncio.titulo }}</h2>
              <p class="text-gray-600 text-sm">{{ anuncio.descripcion }}</p>
            </div>
          </div>
        }
      </div>
    </div>
  `,
})
export class AnunciosComponent implements OnInit {
  private readonly anuncioService = inject(AnuncioService);

  readonly anuncios = signal<Anuncio[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  ngOnInit(): void {
    this.anuncioService.obtenerAnuncios().subscribe({
      next: data => {
        this.anuncios.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No se pudo conectar con el servicio de anuncios.');
        this.loading.set(false);
      },
    });
  }

  onImgError(event: Event): void {
    (event.target as HTMLImageElement).style.display = 'none';
  }
}
