import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { SecretMission, MissionStatus } from './stores/mission.interface';
import { environment } from '../../../environments/environment';
import { LocalStorageService } from '../../core/services/local-storage.service';

const MISSIONS_STORAGE_KEY = 'secret-missions';

@Injectable({
  providedIn: 'root'
})
export class MissionService {
  private http = inject(HttpClient);
  private localStorage = inject(LocalStorageService);

  /**
   * Récupère toutes les missions
   * Charge depuis le localStorage si disponible, sinon depuis le mock JSON
   */
  getMissions(): Observable<SecretMission[]> {
    // Vérifier si les missions existent en localStorage
    const cachedMissions = this.localStorage.getItem<SecretMission[]>(MISSIONS_STORAGE_KEY);

    if (cachedMissions && cachedMissions.length > 0) {
      console.log('Missions chargées depuis le localStorage');
      return of(cachedMissions);
    }

    // Sinon, charger depuis le JSON mock
    console.log('Chargement initial des missions depuis le mock');
    return this.http.get<SecretMission[]>(environment.missionPath).pipe(
      tap(missions => {
        // Sauvegarder en localStorage pour les prochaines fois
        this.localStorage.setItem(MISSIONS_STORAGE_KEY, missions);
      }),
      catchError(error => {
        console.error('Erreur lors du chargement des missions:', error);
        return throwError(() => new Error('Impossible de charger les missions'));
      })
    );
  }

  /**
   * Récupère une mission par son ID
   */
  getMissionById(id: string): Observable<SecretMission | null> {
    return this.getMissions().pipe(
      map(missions => missions.find(m => m.id === id) || null)
    );
  }

  /**
   * Assigne un agent à une mission
   * Règles métier:
   * - Un seul agent par mission
   * - L'agent doit être opérationnel (vérifié dans le store)
   * - Calcule automatiquement la date de fin basée sur la durée en semaines
   */
  assignAgentToMission(missionId: string, agentNickname: string): Observable<SecretMission> {
    const missions = this.localStorage.getItem<SecretMission[]>(MISSIONS_STORAGE_KEY) || [];

    const missionIndex = missions.findIndex(m => m.id === missionId);
    if (missionIndex === -1) {
      return throwError(() => new Error('Mission introuvable'));
    }

    const mission = missions[missionIndex];

    // Vérifier si la mission a déjà un agent assigné
    if (mission.assignedAgentNickname) {
      return throwError(() => new Error('Cette mission a déjà un agent assigné'));
    }

    // Assigner l'agent et mettre à jour les dates
    const now = new Date();
    const endDate = new Date(now);
    endDate.setDate(endDate.getDate() + (mission.durationWeeks * 7));

    const updatedMission: SecretMission = {
      ...mission,
      assignedAgentNickname: agentNickname,
      startDate: now.toISOString(),
      endDate: endDate.toISOString(),
      status: MissionStatus.IN_PROGRESS
    };

    missions[missionIndex] = updatedMission;
    this.localStorage.setItem(MISSIONS_STORAGE_KEY, missions);

    return of(updatedMission);
  }

  /**
   * Désassigne un agent d'une mission
   */
  unassignAgentFromMission(missionId: string): Observable<SecretMission> {
    const missions = this.localStorage.getItem<SecretMission[]>(MISSIONS_STORAGE_KEY) || [];

    const missionIndex = missions.findIndex(m => m.id === missionId);
    if (missionIndex === -1) {
      return throwError(() => new Error('Mission introuvable'));
    }

    const mission = missions[missionIndex];

    const updatedMission: SecretMission = {
      ...mission,
      assignedAgentNickname: null,
      status: MissionStatus.PLANNED
    };

    missions[missionIndex] = updatedMission;
    this.localStorage.setItem(MISSIONS_STORAGE_KEY, missions);

    return of(updatedMission);
  }

  /**
   * Met à jour le statut d'une mission
   */
  updateMissionStatus(missionId: string, status: SecretMission['status']): Observable<SecretMission> {
    const missions = this.localStorage.getItem<SecretMission[]>(MISSIONS_STORAGE_KEY) || [];

    const missionIndex = missions.findIndex(m => m.id === missionId);
    if (missionIndex === -1) {
      return throwError(() => new Error('Mission introuvable'));
    }

    const updatedMission: SecretMission = {
      ...missions[missionIndex],
      status
    };

    missions[missionIndex] = updatedMission;
    this.localStorage.setItem(MISSIONS_STORAGE_KEY, missions);

    return of(updatedMission);
  }

  /**
   * Réinitialise les missions depuis le mock JSON
   * Utile pour le développement
   */
  resetMissions(): Observable<SecretMission[]> {
    this.localStorage.removeItem(MISSIONS_STORAGE_KEY);
    return this.getMissions();
  }

  /**
   * Sauvegarde les missions dans le localStorage
   */
  saveMissions(missions: SecretMission[]): void {
    this.localStorage.setItem(MISSIONS_STORAGE_KEY, missions);
  }
}
