import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'app-modal',
  standalone: true,
  template: `
    @if (show()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-[fadeIn_0.15s_ease]"
           (click)="closed.emit()">
        <div class="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
             (click)="$event.stopPropagation()">
          <div class="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h3 class="text-base font-semibold text-gray-900">{{ title() }}</h3>
            <button (click)="closed.emit()"
                    class="p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div class="p-5">
            <ng-content />
          </div>
        </div>
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModalComponent {
  readonly title = input.required<string>();
  readonly show = input.required<boolean>();
  readonly closed = output<void>();
}
