import { Component, input, OnInit, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SecretAgent, SecretAgentStatus } from '../../stores/secret-agent.interface';
import { MapComponent } from "../../../map/map.component";
import { SecretAgentStatusToFaPipe } from '../../../../shared/pipes/agent-status-to-fa.pipe';
import { MissionStore } from '../../../missions/stores/mission.store';
import { MissionStatus } from '../../../missions/stores/mission.interface';

@Component({
  selector: 'app-secret-agent-detail',
  templateUrl: './secret-agent-detail.component.html',
  styleUrls: ['./secret-agent-detail.component.scss'],
  imports: [CommonModule, MapComponent]
})
export class SecretAgentDetailComponent implements OnInit {
  public agent = input.required<SecretAgent | null>();
  protected iconConverter = new SecretAgentStatusToFaPipe();

  private missionStore = inject(MissionStore);

  // Computed pour récupérer la mission assignée à l'agent
  assignedMission = computed(() => {
    const currentAgent = this.agent();
    if (!currentAgent) return null;

    return this.missionStore.missions().find(
      mission => mission.assignedAgentNickname === currentAgent.nickname &&
                 mission.status === MissionStatus.IN_PROGRESS
    ) || null;
  });

  // Computed pour vérifier si l'agent est en repos
  isAgentInRest = computed(() => {
    const currentAgent = this.agent();
    return currentAgent?.lastKnownStatus === SecretAgentStatus.REST;
  });

  // Computed pour récupérer les jours de repos restants
  restDaysRemaining = computed(() => {
    const currentAgent = this.agent();
    return currentAgent?.restDaysRemaining || 0;
  });

  ngOnInit() {
    // Charger les missions si pas déjà fait
    if (this.missionStore.missions().length === 0) {
      this.missionStore.loadMissions();
    }
  }

  formatDate(dateString: string): string {
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).format(new Date(dateString));
  }
}
