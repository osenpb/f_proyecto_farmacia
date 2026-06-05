import { ChangeDetectionStrategy, Component, inject, input, OnChanges, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RegisterRequest, UsuarioResponse } from '../../../../interfaces/auth.interface';
import { SedeResponse } from '../../../../interfaces/sede.interface';
import { UsuarioService } from '../../../../services/usuario.service';

export const ROLES = [
  { id: 1, label: 'Administrador' },
  { id: 2, label: 'Gestor' },
  { id: 3, label: 'Farmacéutico' },
  { id: 4, label: 'Transportista' },
];

@Component({
  selector: 'app-usuario-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './usuario-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UsuarioFormComponent implements OnChanges {
  private readonly fb = inject(FormBuilder);
  private readonly svc = inject(UsuarioService);

  readonly editando = input<UsuarioResponse | null>(null);
  readonly sedes = input.required<SedeResponse[]>();
  readonly saved = output<UsuarioResponse>();
  readonly cancelled = output<void>();

  readonly loading = signal(false);
  readonly error = signal('');
  readonly roles = ROLES;

  readonly form = this.fb.group({
    nombre:   ['', [Validators.required]],
    apellido: ['', [Validators.required]],
    email:    ['', [Validators.required, Validators.email]],
    password: ['', [Validators.minLength(8)]],
    rolId:    [null as number | null, [Validators.required]],
    sedeId:   [null as number | null, [Validators.required]],
    telefono: [''],
    dni:      [''],
  });

  ngOnChanges(): void {
    const u = this.editando();
    if (u) {
      const rolMatch = ROLES.find(r => u.rol?.includes(r.label.toUpperCase()) || u.rol?.includes(r.label));
      this.form.patchValue({
        nombre:   u.nombre,
        apellido: u.apellido,
        email:    u.email,
        rolId:    rolMatch?.id ?? null,
        sedeId:   u.idSede ?? null,
        telefono: u.telefono ?? '',
        dni:      u.dni ?? '',
        password: '',
      });
      this.form.get('email')?.disable();
      this.form.get('password')?.clearValidators();
      this.form.get('password')?.updateValueAndValidity();
    } else {
      this.form.reset();
      this.form.get('email')?.enable();
      this.form.get('password')?.setValidators([Validators.required, Validators.minLength(8)]);
      this.form.get('password')?.updateValueAndValidity();
    }
    this.error.set('');
  }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading.set(true);
    this.error.set('');

    const v = this.form.getRawValue();
    const dto: RegisterRequest = {
      nombre:   v.nombre!,
      apellido: v.apellido!,
      email:    v.email!,
      password: v.password || 'placeholder_no_change',
      rolId:    v.rolId ?? undefined,
      sedeId:   v.sedeId ?? undefined,
      telefono: v.telefono || undefined,
      dni:      v.dni || undefined,
    };

    const op$ = this.editando()
      ? this.svc.actualizar(this.editando()!.email, dto)
      : this.svc.crear(dto);

    op$.subscribe({
      next: (res) => { this.loading.set(false); this.saved.emit(res); },
      error: (err) => {
        this.error.set(err?.error?.mensaje ?? 'Error al guardar.');
        this.loading.set(false);
      },
    });
  }
}
