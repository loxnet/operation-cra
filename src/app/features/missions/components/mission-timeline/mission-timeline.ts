import { Component, computed, inject, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SecretMission, MissionStatus } from '../../stores/mission.interface';
import { SecretAgent } from '../../../secret-agents/stores/secret-agent.interface';
import { AgentRestService } from '../../../../core/services/agent-rest.service';

interface TimelinePosition {
  mission: SecretMission;
  left: number;
  width: number;
  agent: SecretAgent | null;
}

@Component({
  selector: 'app-mission-timeline',
  imports: [CommonModule],
  templateUrl: './mission-timeline.html',
  styleUrl: './mission-timeline.scss',
})
export class MissionTimeline {
  // Inputs
  missions = input.required<SecretMission[]>();
  agents = input.required<SecretAgent[]>();
  filter = input<MissionStatus | null>(null);

  // Outputs
  assignmentRequest = output<{ mission: SecretMission; agentNickname: string; dropDate: Date }>();

  // Services
  private restService = inject(AgentRestService);

  // State
  hoveredPosition = signal<{ x: number; mission: SecretMission; date: Date } | null>(null);
  dragOverMission = signal<string | null>(null);

  /**
   * Missions filtrées
   */
  filteredMissions = computed(() => {
    const allMissions = this.missions();
    const filterValue = this.filter();

    if (!filterValue) {
      return allMissions;
    }

    return allMissions.filter(m => m.status === filterValue);
  });

  /**
   * Calcule les dates min et max pour l'échelle globale
   */
  timelineRange = computed(() => {
    const missions = this.filteredMissions();

    if (missions.length === 0) {
      const now = new Date();
      return {
        start: now,
        end: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000) // +30 jours
      };
    }

    const dates = missions.flatMap(m => [
      new Date(m.startDate),
      new Date(m.endDate)
    ]);

    const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
    const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));

    // Ajouter une marge de 5%
    const range = maxDate.getTime() - minDate.getTime();
    const margin = range * 0.05;

    return {
      start: new Date(minDate.getTime() - margin),
      end: new Date(maxDate.getTime() + margin)
    };
  });

  /**
   * Calcule les positions des missions sur la timeline
   */
  timelinePositions = computed(() => {
    const missions = this.filteredMissions();
    const range = this.timelineRange();
    const allAgents = this.agents();
    const totalDuration = range.end.getTime() - range.start.getTime();

    return missions.map(mission => {
      const startDate = new Date(mission.startDate);
      const endDate = new Date(mission.endDate);

      const left = ((startDate.getTime() - range.start.getTime()) / totalDuration) * 100;
      const width = ((endDate.getTime() - startDate.getTime()) / totalDuration) * 100;

      const agent = mission.assignedAgentNickname
        ? allAgents.find(a => a.nickname === mission.assignedAgentNickname) || null
        : null;

      return {
        mission,
        left: Math.max(0, Math.min(100, left)),
        width: Math.max(0, Math.min(100 - left, width)),
        agent
      } as TimelinePosition;
    });
  });

  /**
   * Calcule la position du curseur de date actuelle
   */
  currentDatePosition = computed(() => {
    const range = this.timelineRange();
    const now = new Date();
    const totalDuration = range.end.getTime() - range.start.getTime();

    // Vérifier si la date actuelle est dans la plage de la timeline
    if (now < range.start || now > range.end) {
      return null;
    }

    const position = ((now.getTime() - range.start.getTime()) / totalDuration) * 100;
    return Math.max(0, Math.min(100, position));
  });

  /**
   * Gère le survol de la timeline
   */
  onTimelineMouseMove(event: MouseEvent, mission: SecretMission): void {
    const target = event.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    const x = event.clientX - rect.left;

    // Calculer la date correspondant à la position de la souris
    const range = this.timelineRange();
    const totalDuration = range.end.getTime() - range.start.getTime();
    const percentage = x / rect.width;
    const missionStart = new Date(mission.startDate).getTime();
    const missionEnd = new Date(mission.endDate).getTime();
    const missionDuration = missionEnd - missionStart;

    const date = new Date(missionStart + (percentage * missionDuration));

    this.hoveredPosition.set({
      x: event.clientX,
      mission,
      date
    });
  }

  onTimelineMouseLeave(): void {
    this.hoveredPosition.set(null);
  }

  /**
   * Gère le drop d'un agent sur la timeline
   */
  onDrop(event: DragEvent, mission: SecretMission): void {
    event.preventDefault();
    this.dragOverMission.set(null);

    const agentNickname = event.dataTransfer?.getData('text/plain');
    if (!agentNickname) return;

    // Calculer la date de drop
    const target = event.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const percentage = x / rect.width;

    const missionStart = new Date(mission.startDate).getTime();
    const missionEnd = new Date(mission.endDate).getTime();
    const missionDuration = missionEnd - missionStart;

    const dropDate = new Date(missionStart + (percentage * missionDuration));

    this.assignmentRequest.emit({
      mission,
      agentNickname,
      dropDate
    });
  }

  onDragOver(event: DragEvent, missionId: string): void {
    event.preventDefault();
    this.dragOverMission.set(missionId);
  }

  onDragLeave(): void {
    this.dragOverMission.set(null);
  }

  /**
   * Obtient la classe CSS selon le statut de la mission
   */
  getStatusClass(status: MissionStatus): string {
    return `status-${status.toLowerCase()}`;
  }

  /**
   * Formate une date
   */
  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }

  /**
   * Formate les coordonnées géographiques
   */
  formatLocation(location: GeolocationCoordinates): string {
    return `${location.latitude.toFixed(4)}°N, ${location.longitude.toFixed(4)}°E`;
  }

  /**
   * Obtient le statut de l'agent
   */
  getAgentStatus(agent: SecretAgent | null): string {
    if (!agent) return 'Non assigné';
    return agent.lastKnownStatus;
  }

  /**
   * Trouve un agent par son nickname
   */
  getAgentByNickname(nickname: string): SecretAgent | null {
    return this.agents().find(agent => agent.nickname === nickname) ?? null;
  }
}
