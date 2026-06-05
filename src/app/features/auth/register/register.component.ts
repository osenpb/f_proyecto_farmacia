import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { SedeService } from '../../../services/sede.service';
import { SedeResponse } from '../../../interfaces/sede.interface';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly sedeService = inject(SedeService);

  readonly isLoading = signal(false);
  readonly errorMsg = signal('');
  readonly registered = signal(false);
  readonly sedes = signal<SedeResponse[]>([]);
  readonly sedesLoading = signal(true);

  readonly form = this.fb.nonNullable.group({
    nombre:   ['', [Validators.required]],
    apellido: ['', [Validators.required]],
    email:    ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    sedeId:   [null as number | null, [Validators.required]],
    telefono: ['', [Validators.pattern(/^9\d{8}$/)]],
    dni:      ['', [Validators.pattern(/^\d{8}$/)]],
  });

  constructor() {
    this.sedeService.listar().subscribe({
      next: (data) => { this.sedes.set(data); this.sedesLoading.set(false); },
      error: () => this.sedesLoading.set(false),
    });
  }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.isLoading.set(true);
    this.errorMsg.set('');

    const { nombre, apellido, email, password, sedeId, telefono, dni } = this.form.getRawValue();

    this.authService.register({
      nombre, apellido, email, password,
      sedeId:   sedeId ?? undefined,
      telefono: telefono || undefined,
      dni:      dni || undefined,
    }).subscribe({
      next: () => { this.registered.set(true); this.isLoading.set(false); },
      error: (err) => {
        this.errorMsg.set(err?.error?.mensaje ?? 'Error al registrar. Intenta nuevamente.');
        this.isLoading.set(false);
      },
    });
  }
}
