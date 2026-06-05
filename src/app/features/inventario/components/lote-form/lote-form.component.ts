import { ChangeDetectionStrategy, Component, inject, input, OnChanges, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { LoteRequest, LoteResponse } from '../../../../interfaces/lote.interface';
import { MedicamentoResponse } from '../../../../interfaces/medicamento.interface';
import { LoteService } from '../../../../services/lote.service';

@Component({
  selector: 'app-lote-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './lote-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoteFormComponent implements OnChanges {
  private readonly fb = inject(FormBuilder);
  private readonly svc = inject(LoteService);

  readonly medicamento = input.required<MedicamentoResponse>();
  readonly idSede = input.required<number>();
  readonly saved = output<LoteResponse>();
  readonly cancelled = output<void>();

  readonly loading = signal(false);
  readonly error = signal('');

  readonly form = this.fb.nonNullable.group({
    codigoLote:     ['', [Validators.required, Validators.maxLength(50)]],
    fechaCaducidad: ['', [Validators.required]],
    stockLote:      [1,  [Validators.required, Validators.min(1)]],
  });

  ngOnChanges(): void { this.form.reset({ stockLote: 1 }); this.error.set(''); }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading.set(true);
    this.error.set('');

    const { codigoLote, fechaCaducidad, stockLote } = this.form.getRawValue();
    const dto: LoteRequest = {
      idMedicamento:  this.medicamento().idMedicamento,
      idSede:         this.idSede(),
      codigoLote,
      fechaCaducidad,
      stockLote,
    };

    this.svc.crear(dto).subscribe({
      next: (res) => { this.loading.set(false); this.saved.emit(res); },
      error: (err) => {
        this.error.set(err?.error?.mensaje ?? 'Error al crear el lote.');
        this.loading.set(false);
      },
    });
  }
}
