import { ChangeDetectionStrategy, Component, inject, input, OnChanges, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MedicamentoRequest, MedicamentoResponse } from '../../../../interfaces/medicamento.interface';
import { MedicamentoService } from '../../../../services/medicamento.service';

@Component({
  selector: 'app-medicamento-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './medicamento-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MedicamentoFormComponent implements OnChanges {
  private readonly fb = inject(FormBuilder);
  private readonly svc = inject(MedicamentoService);

  readonly editando = input<MedicamentoResponse | null>(null);
  readonly saved = output<MedicamentoResponse>();
  readonly cancelled = output<void>();

  readonly loading = signal(false);
  readonly error = signal('');

  readonly form = this.fb.nonNullable.group({
    nombre:      ['', [Validators.required, Validators.minLength(2), Validators.maxLength(150)]],
    descripcion: ['', [Validators.maxLength(255)]],
  });

  ngOnChanges(): void {
    const med = this.editando();
    if (med) {
      this.form.patchValue({ nombre: med.nombre, descripcion: med.descripcion ?? '' });
    } else {
      this.form.reset();
    }
    this.error.set('');
  }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading.set(true);
    this.error.set('');

    const dto: MedicamentoRequest = {
      nombre:      this.form.getRawValue().nombre,
      descripcion: this.form.getRawValue().descripcion || undefined,
    };

    const op$ = this.editando()
      ? this.svc.actualizar(this.editando()!.idMedicamento, dto)
      : this.svc.crear(dto);

    op$.subscribe({
      next: (res) => { this.loading.set(false); this.saved.emit(res); },
      error: (err) => {
        this.error.set(err?.error?.mensaje ?? 'Error al guardar. Intenta nuevamente.');
        this.loading.set(false);
      },
    });
  }
}
