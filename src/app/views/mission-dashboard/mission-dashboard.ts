import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MissionStore } from '../../features/missions/stores/mission.store';
import { SecretAgentStore } from '../../features/secret-agents/stores/secret-agent.store';
import { MissionTimeline } from '../../features/missions/components/mission-timeline/mission-timeline';
import { OperationalAgentList } from '../../features/missions/components/operational-agent-list/operational-agent-list';
import { AgentReplacementDialog, ReplacementDialogData } from '../../features/missions/components/agent-replacement-dialog/agent-replacement-dialog';
import { SecretMission, MissionStatus } from '../../features/missions/stores/mission.interface';
import { SecretAgentStatus } from '../../features/secret-agents/stores/secret-agent.interface';

@Component({
  selector: 'app-mission-dashboard',
  imports: [
    CommonModule,
    MissionTimeline,
    OperationalAgentList,
    AgentReplacementDialog
  ],
  providers: [MissionStore, SecretAgentStore],
  templateUrl: './mission-dashboard.html',
  styleUrl: './mission-dashboard.scss',
})
export class MissionDashboard implements OnInit {

  readonly missionStore = inject(MissionStore);
  readonly agentStore = inject(SecretAgentStore);

  currentFilter = signal<MissionStatus | null>(MissionStatus.IN_PROGRESS);
  replacementDialogData = signal<ReplacementDialogData | null>(null);

  readonly MissionStatus = MissionStatus;

  ngOnInit() {
    this.missionStore.loadMissions();
    this.agentStore.loadAgents();
  }

  onAssignmentRequest(data: { mission: SecretMission; agentNickname: string; dropDate: Date }) {
    const agent = this.agentStore.agents().find(a => a.nickname === data.agentNickname);
    if (!agent) return;

    // Vérifier si la mission a déjà un agent
    if (data.mission.assignedAgentNickname) {
      const currentAgent = this.agentStore.agents().find(
        a => a.nickname === data.mission.assignedAgentNickname
      );

      if (currentAgent) {
        // Afficher la popup de confirmation
        this.replacementDialogData.set({
          mission: data.mission,
          currentAgent,
          newAgent: agent,
          dropDate: data.dropDate
        });
        return;
      }
    }

    // Assigner directement si pas d'agent
    this.assignAgent(data.mission.id, agent.nickname);
  }

  onConfirmReplacement() {
    const dialogData = this.replacementDialogData();
    if (!dialogData) return;

    // 1. Mettre l'ancien agent au repos
    this.agentStore.updateAgentStatus({
      nickname: dialogData.currentAgent.nickname,
      status: SecretAgentStatus.REST
    });

    // 2. Désassigner l'ancien agent
    this.missionStore.unassignAgent(dialogData.mission.id);

    // 3. Assigner le nouvel agent
    this.assignAgent(dialogData.mission.id, dialogData.newAgent.nickname);

    // 4. Fermer la popup
    this.replacementDialogData.set(null);
  }

  onCancelReplacement() {
    this.replacementDialogData.set(null);
  }

  private assignAgent(missionId: string, agentNickname: string) {
    const agent = this.agentStore.agents().find(a => a.nickname === agentNickname);
    if (!agent) return;

    this.missionStore.assignAgent({
      missionId,
      agentNickname,
      agentStatus: agent.lastKnownStatus
    });
  }

  setFilter(status: MissionStatus | null) {
    this.currentFilter.set(status);
  }

  resetAllData() {
    if (confirm('Êtes-vous sûr de vouloir réinitialiser toutes les données ? Cette action rechargera les données depuis les fichiers JSON initiaux.')) {
      this.missionStore.resetMissions();
      this.agentStore.resetAgents();
    }
  }
}
