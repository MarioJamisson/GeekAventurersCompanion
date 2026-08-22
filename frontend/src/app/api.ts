import { Injectable, signal } from '@angular/core';

export interface Attraction {
  id?: number;
  name: string;
  start_time: string;
  end_time: string;
  location: string;
  block: string;
  status: string;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = 'http://localhost:8000/api';
  private wsUrl = 'ws://localhost:8000/ws/events/';
  
  wsMessages = signal<any>(null);

  constructor() {
    this.connectWebSocket();
  }

  private connectWebSocket() {
    try {
      const ws = new WebSocket(this.wsUrl);
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        this.wsMessages.set(data);
      };
      ws.onclose = () => {
        setTimeout(() => this.connectWebSocket(), 5000);
      };
    } catch(e) {}
  }

  async getAttractions(): Promise<Attraction[]> {
    try {
      const res = await fetch(`${this.baseUrl}/attractions/`);
      if (!res.ok) return [];
      return await res.json();
    } catch {
      return []; // Fallback case
    }
  }

  async saveAttraction(attr: Attraction): Promise<void> {
    const isEdit = !!attr.id;
    const url = isEdit ? `${this.baseUrl}/attractions/${attr.id}/` : `${this.baseUrl}/attractions/`;
    const method = isEdit ? 'PUT' : 'POST';
    
    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(attr)
      });
      if (!res.ok) {
        const errorText = await res.text();
        console.error("Erro na API:", errorText);
        alert(`Erro ao salvar no backend: ${errorText}`);
        throw new Error("API Error");
      }
    } catch(e) {
      console.error(e);
      alert("Erro ao comunicar com o servidor. O backend (Django) está rodando na porta 8000?");
      throw e;
    }
  }

  async sendAlert(title: string, description: string): Promise<void> {
    try {
      await fetch(`${this.baseUrl}/alerts/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description })
      });
    } catch(e) {}
  }
}
