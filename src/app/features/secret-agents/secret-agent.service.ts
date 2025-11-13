import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { SecretAgent, SecretAgentStatus } from './stores/secret-agent.interface';
import { environment } from '../../../environments/environment';
import { LocalStorageService } from '../../core/services/local-storage.service';

const AGENTS_STORAGE_KEY = 'secret-agents';

@Injectable({
  providedIn: 'root'
})
export class SecretAgentService {
  private http = inject(HttpClient);
  private localStorage = inject(LocalStorageService);

  /**
   * Récupère tous les agents
   * Charge depuis le localStorage si disponible, sinon depuis le mock JSON
   */
  getSecretAgents(): Observable<SecretAgent[]> {
    // Vérifier si les agents existent en localStorage
    const cachedAgents = this.localStorage.getItem<SecretAgent[]>(AGENTS_STORAGE_KEY);

    if (cachedAgents && cachedAgents.length > 0) {
      console.log('Agents chargés depuis le localStorage');
      return of(cachedAgents);
    }

    // Sinon, charger depuis le JSON mock
    console.log('Chargement initial des agents depuis le mock');
    return this.http.get<SecretAgent[]>(`${environment.secretAgentPath}`).pipe(
      tap(agents => {
        // Sauvegarder en localStorage pour les prochaines fois
        this.localStorage.setItem(AGENTS_STORAGE_KEY, agents);
      }),
      catchError(error => {
        console.error('Erreur lors du chargement des agents:', error);
        return throwError(() => new Error('Impossible de charger les agents'));
      })
    );
  }

  /**
   * Met à jour le statut d'un agent
   */
  updateAgentStatus(nickname: string, status: SecretAgentStatus): Observable<SecretAgent> {
    const agents = this.localStorage.getItem<SecretAgent[]>(AGENTS_STORAGE_KEY) || [];

    const agentIndex = agents.findIndex(a => a.nickname === nickname);
    if (agentIndex === -1) {
      return throwError(() => new Error('Agent introuvable'));
    }

    const updatedAgent: SecretAgent = {
      ...agents[agentIndex],
      lastKnownStatus: status
    };

    agents[agentIndex] = updatedAgent;
    this.localStorage.setItem(AGENTS_STORAGE_KEY, agents);

    return of(updatedAgent);
  }

  /**
   * Met à jour la localisation d'un agent
   */
  updateAgentLocation(nickname: string, location: GeolocationCoordinates): Observable<SecretAgent> {
    const agents = this.localStorage.getItem<SecretAgent[]>(AGENTS_STORAGE_KEY) || [];

    const agentIndex = agents.findIndex(a => a.nickname === nickname);
    if (agentIndex === -1) {
      return throwError(() => new Error('Agent introuvable'));
    }

    const updatedAgent: SecretAgent = {
      ...agents[agentIndex],
      currentLocation: location
    };

    agents[agentIndex] = updatedAgent;
    this.localStorage.setItem(AGENTS_STORAGE_KEY, agents);

    return of(updatedAgent);
  }

  /**
   * Sauvegarde les agents dans le localStorage
   */
  saveAgents(agents: SecretAgent[]): void {
    this.localStorage.setItem(AGENTS_STORAGE_KEY, agents);
  }

  /**
   * Réinitialise les agents depuis le mock JSON
   */
  resetAgents(): Observable<SecretAgent[]> {
    this.localStorage.removeItem(AGENTS_STORAGE_KEY);
    return this.getSecretAgents();
  }
}
