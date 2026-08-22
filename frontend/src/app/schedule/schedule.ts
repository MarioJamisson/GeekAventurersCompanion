import { Component, effect, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService, Attraction } from '../api';

@Component({
  selector: 'app-schedule',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './schedule.html',
  styleUrl: './schedule.css'
})
export class Schedule {
  attractions = signal<Attraction[]>([]);
  toastMessage = signal<string | null>(null);

  constructor(private api: ApiService) {
    this.loadData();

    effect(() => {
      const msg = this.api.wsMessages();
      if (msg) {
        if (msg.type === 'ATTRACTION_UPDATED' || msg.type === 'NEW_ALERT') {
          const text = msg.type === 'NEW_ALERT'
            ? `⚠️ ${msg.title}: ${msg.description}`
            : `🔄 ${msg.message}`;
          this.showToast(text);
          if (msg.type === 'ATTRACTION_UPDATED') {
            this.loadData();
          }
        }
      }
    });
  }

  async loadData() {
    this.attractions.set(await this.api.getAttractions());
  }

  showToast(msg: string) {
    this.toastMessage.set(msg);
    setTimeout(() => this.toastMessage.set(null), 7000);
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
