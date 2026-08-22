import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService, Attraction } from '../api';

const ADMIN_PASSWORD = 'ga2025';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin.html',
  styleUrl: './admin.css'
})
export class Admin {
  // Auth
  authenticated = signal(false);
  passwordInput = signal('');
  loginError = signal(false);

  // Data
  attractions = signal<Attraction[]>([]);
  showForm = signal(false);
  editingId = signal<number | null>(null);
  formData = signal<Attraction>({
    name: '', start_time: '', end_time: '', location: '', block: '', status: 'scheduled'
  });

  showAlertForm = signal(false);
  alertData = signal({ title: '', description: '' });

  constructor(private api: ApiService) {}

  attemptLogin() {
    if (this.passwordInput() === ADMIN_PASSWORD) {
      this.authenticated.set(true);
      this.loginError.set(false);
      this.loadData();
    } else {
      this.loginError.set(true);
    }
  }

  async loadData() {
    this.attractions.set(await this.api.getAttractions());
  }

  openForm() {
    this.editingId.set(null);
    this.formData.set({
      name: '', start_time: '', end_time: '', location: '', block: '', status: 'scheduled'
    });
    this.showForm.set(true);
  }

  editAttraction(attr: Attraction) {
    this.editingId.set(attr.id || null);
    const fmtTime = (iso: string) => {
      if (!iso) return '';
      try {
        const d = new Date(iso);
        return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', hour12: false });
      } catch { return ''; }
    };
    this.formData.set({
      ...attr,
      start_time: fmtTime(attr.start_time),
      end_time: fmtTime(attr.end_time)
    });
    this.showForm.set(true);
  }

  cancelForm() {
    this.showForm.set(false);
  }

  updateForm(field: keyof Attraction, event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.formData.set({ ...this.formData(), [field]: value });
  }

  async saveAttraction() {
    const data = this.formData();
    if (!data.name || !data.start_time || !data.end_time) {
      alert("Atenção: Os campos Nome, Início e Fim são obrigatórios.");
      return;
    }

    // A atração acontece no dia 23/08/2026.
    // O input type="time" retorna o formato "HH:mm".
    // Concatenamos com a data fixa e o fuso horário GMT-3 para o backend.
    const st = `2026-08-23T${data.start_time}:00-03:00`;
    const et = `2026-08-23T${data.end_time}:00-03:00`;

    const payload: Attraction = {
      ...data,
      start_time: st,
      end_time: et,
    };
    if (this.editingId()) {
      payload.id = this.editingId()!;
    }

    try {
      await this.api.saveAttraction(payload);
      this.showForm.set(false);
      this.loadData();
    } catch (e) {
      // O erro já é mostrado no alert do api.ts, então só evitamos fechar o modal.
    }
  }

  openAlertForm() {
    this.showAlertForm.set(!this.showAlertForm());
  }

  updateAlert(field: 'title' | 'description', event: Event) {
    const value = (event.target as HTMLInputElement | HTMLTextAreaElement).value;
    this.alertData.set({ ...this.alertData(), [field]: value });
  }

  async sendAlert() {
    const data = this.alertData();
    if (!data.title || !data.description) return;
    await this.api.sendAlert(data.title, data.description);
    this.showAlertForm.set(false);
    this.alertData.set({ title: '', description: '' });
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'started': return 'badge badge-live';
      case 'scheduled': return 'badge badge-next';
      case 'delayed': return 'badge badge-delayed';
      case 'finished': return 'badge badge-finished';
      default: return 'badge badge-next';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'started': return 'Em Andamento';
      case 'scheduled': return 'Agendado';
      case 'delayed': return 'Atrasado';
      case 'finished': return 'Encerrado';
      default: return status;
    }
  }
}
