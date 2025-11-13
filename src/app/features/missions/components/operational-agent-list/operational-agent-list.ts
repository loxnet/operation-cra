import { Component, computed, inject, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SecretAgent, SecretAgentStatus } from '../../../secret-agents/stores/secret-agent.interface';
import { SecretMission } from '../../stores/mission.interface';
import { AgentRestService } from '../../../../core/services/agent-rest.service';
import { SecretAgentStatusToFaPipe } from '../../../../shared/pipes/agent-status-to-fa.pipe';

@Component({
  selector: 'app-operational-agent-list',
  standalone: true,
  imports: [CommonModule, SecretAgentStatusToFaPipe],
  templateUrl: './operational-agent-list.html',
  styleUrl: './operational-agent-list.scss',
})
export class OperationalAgentList {

  // Inputs
  agents = input.required<SecretAgent[]>();
  missions = input.required<SecretMission[]>();

  // Services
  private restService = inject(AgentRestService);

  /**
   * Liste des agents avec leurs informations de repos
   */
  agentsWithRestInfo = computed(() => {
    const allAgents = this.agents();
    const allMissions = this.missions();

    return allAgents.map(agent => ({
      agent,
      restInfo: this.restService.getAgentRestInfo(agent, allMissions)
    }));
  });

  /**
   * Agents opérationnels (disponibles pour assignation)
   */
  operationalAgents = computed(() => {
    return this.agentsWithRestInfo().filter(item =>
      item.agent.lastKnownStatus === SecretAgentStatus.OPERATIONAL &&
      !item.restInfo.isInMission
    );
  });

  /**
   * Agents au repos
   */
  restingAgents = computed(() => {
    return this.agentsWithRestInfo().filter(item =>
      item.agent.lastKnownStatus === SecretAgentStatus.REST
    );
  });

  /**
   * Agents en mission
   */
  busyAgents = computed(() => {
    return this.agentsWithRestInfo().filter(item =>
      item.restInfo.isInMission
    );
  });

  /**
   * Gère le début du drag
   */
  onDragStart(event: DragEvent, agent: SecretAgent): void {
    if (!event.dataTransfer) return;

    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', agent.nickname);

    // Ajouter une classe visuelle sur l'élément draggé
    const target = event.target as HTMLElement;
    setTimeout(() => {
      target.classList.add('dragging');
    }, 0);
  }

  onDragEnd(event: DragEvent): void {
    const target = event.target as HTMLElement;
    target.classList.remove('dragging');
  }

  /**
   * Formate le nombre de jours de repos restants
   */
  formatRestDays(days: number): string {
    if (days === 0) return 'Prêt';
    if (days === 1) return '1 jour restant';
    return `${days} jours restants`;
  }

  /**
   * Obtient la classe CSS selon le nombre de jours restants
   */
  getRestDaysClass(days: number): string {
    if (days === 0) return 'rest-ready';
    if (days <= 2) return 'rest-soon';
    return 'rest-waiting';
  }
}
