import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

const LABELS: Record<string, string> = {
  NORMAL: 'En stock', BAJO: 'Stock bajo', CRITICO: 'Stock crítico',
  VENCIDO: 'Vencido', PROXIMO: 'Por vencer',
};
const BADGE: Record<string, string> = {
  NORMAL: 'bg-green-100 text-green-800', BAJO: 'bg-amber-100 text-amber-800',
  CRITICO: 'bg-red-100 text-red-800', VENCIDO: 'bg-gray-100 text-gray-600',
  PROXIMO: 'bg-orange-100 text-orange-800',
};
const DOT: Record<string, string> = {
  NORMAL: 'bg-green-500', BAJO: 'bg-amber-500', CRITICO: 'bg-red-500',
  VENCIDO: 'bg-gray-400', PROXIMO: 'bg-orange-500 animate-pulse',
};

@Component({
  selector: 'app-stock-badge',
  standalone: true,
  template: `
    <span [class]="badgeClass()" class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap">
      <span class="w-1.5 h-1.5 rounded-full" [class]="dotClass()"></span>
      {{ label() }}
    </span>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StockBadgeComponent {
  readonly status = input.required<string>();
  readonly label = computed(() => LABELS[this.status()] ?? this.status());
  readonly badgeClass = computed(() => BADGE[this.status()] ?? 'bg-gray-100 text-gray-600');
  readonly dotClass = computed(() => DOT[this.status()] ?? 'bg-gray-400');
}
