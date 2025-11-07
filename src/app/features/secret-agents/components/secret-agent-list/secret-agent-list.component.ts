import { Component, inject, OnInit } from '@angular/core';
import { SecretAgentStore } from '../../stores/secret-agent.store';
import { PictoFromAgentStatusPipe } from '../../../../shared/pipes/picto-from-agent-status-pipe';
import { SecretAgent, SecretAgentStatus } from '../../stores/secret-agent.interface';

@Component({
  selector: 'app-secret-agent-list',
  templateUrl: './secret-agent-list.component.html',
  imports:[PictoFromAgentStatusPipe],
  providers: [SecretAgentStore],
  styleUrls: ['./secret-agent-list.component.scss']
})
export class SecretAgentListComponent implements OnInit {
  agentStore = inject(SecretAgentStore);

  showWarning(agent: SecretAgent): Boolean {
    return agent.bananaBread && agent.lastKnownStatus !== SecretAgentStatus.DECEASED;
  }

  trackByIndex(index: number): number {
    return index;
  }

  ngOnInit() {
    this.agentStore.loadAgents();
  }

}
