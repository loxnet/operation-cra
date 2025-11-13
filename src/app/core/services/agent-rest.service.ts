import { Injectable } from '@angular/core';
import { SecretAgent, SecretAgentStatus } from '../../features/secret-agents/stores/secret-agent.interface';
import { SecretMission, MissionStatus } from '../../features/missions/stores/mission.interface';

export interface AgentRestInfo {
  isInRest: boolean;
  daysRemaining: number;
  restEndDate: Date | null;
  isInMission: boolean;
  currentMission: SecretMission | null;
  canBeAssigned: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AgentRestService {
  /**
   * Calcule les informations de repos d'un agent
   */
  getAgentRestInfo(agent: SecretAgent, missions: SecretMission[]): AgentRestInfo {
    // Trouver la mission en cours de l'agent
    const currentMission = missions.find(
      m => m.assignedAgentNickname === agent.nickname && m.status === MissionStatus.IN_PROGRESS
    );

    // Si l'agent est en mission
    if (currentMission) {
      return {
        isInRest: false,
        daysRemaining: agent.restDaysRemaining!,
        restEndDate: null,
        isInMission: true,
        currentMission,
        canBeAssigned: false
      };
    }

    // Si l'agent est au repos
    if (agent.lastKnownStatus === SecretAgentStatus.REST) {
      // Trouver la dernière mission terminée de l'agent
      const lastMission = this.getLastCompletedMission(agent.nickname, missions);

      if (lastMission) {
        const missionEndDate = new Date(lastMission.endDate);
        const now = new Date();
        const daysSinceEnd = this.getDaysBetween(missionEndDate, now);
        const daysRemaining = Math.max(0, agent.restDaysRemaining! - Math.floor(daysSinceEnd));

        const restEndDate = new Date(missionEndDate);
        restEndDate.setDate(restEndDate.getDate() + agent.restDaysRemaining!);

        return {
          isInRest: true,
          daysRemaining,
          restEndDate,
          isInMission: false,
          currentMission: null,
          canBeAssigned: daysRemaining === 0
        };
      }

      // Cas où l'agent est au repos mais pas de mission trouvée
      return {
        isInRest: true,
        daysRemaining: agent.restDaysRemaining!,
        restEndDate: null,
        isInMission: false,
        currentMission: null,
        canBeAssigned: false
      };
    }

    // Agent opérationnel ou autre statut
    const isOperational = agent.lastKnownStatus === SecretAgentStatus.OPERATIONAL;

    return {
      isInRest: false,
      daysRemaining: 0,
      restEndDate: null,
      isInMission: false,
      currentMission: null,
      canBeAssigned: isOperational
    };
  }

  /**
   * Récupère la dernière mission terminée d'un agent
   */
  private getLastCompletedMission(agentNickname: string, missions: SecretMission[]): SecretMission | null {
    const completedMissions = missions
      .filter(m => m.assignedAgentNickname === agentNickname && m.status === MissionStatus.OVER)
      .sort((a, b) => new Date(b.endDate).getTime() - new Date(a.endDate).getTime());

    return completedMissions.length > 0 ? completedMissions[0] : null;
  }

  /**
   * Calcule le nombre de jours entre deux dates
   */
  private getDaysBetween(date1: Date, date2: Date): number {
    const diffTime = Math.abs(date2.getTime() - date1.getTime());
    return diffTime / (1000 * 60 * 60 * 24);
  }

  /**
   * Détermine si un agent est en mission (tout statut sauf OPERATIONAL, DECEASED, REST)
   */
  isAgentInMission(agent: SecretAgent): boolean {
    return ![
      SecretAgentStatus.OPERATIONAL,
      SecretAgentStatus.DECEASED,
      SecretAgentStatus.REST
    ].includes(agent.lastKnownStatus);
  }

  /**
   * Calcule le statut à appliquer à un agent en mission
   * (par défaut UNKNOWN si pas d'autre information)
   */
  getMissionStatusForAgent(): SecretAgentStatus {
    return SecretAgentStatus.UNKNOWN;
  }

  /**
   * Vérifie si un agent peut être assigné à une mission
   */
  canAgentBeAssigned(agent: SecretAgent, missions: SecretMission[]): boolean {
    const restInfo = this.getAgentRestInfo(agent, missions);
    return restInfo.canBeAssigned;
  }
}
