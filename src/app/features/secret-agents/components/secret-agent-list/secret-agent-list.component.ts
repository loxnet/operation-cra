import { Component, inject, model, OnInit, output, signal } from '@angular/core';
import { SecretAgentStore } from '../../stores/secret-agent.store';
import { SecretAgent, SecretAgentStatus } from '../../stores/secret-agent.interface';
import { SecretAgentStatusToFaPipe } from '../../../../shared/pipes/agent-status-to-fa.pipe';

@Component({
  selector: 'app-secret-agent-list',
  templateUrl: './secret-agent-list.component.html',
  providers: [SecretAgentStore],
  styleUrls: ['./secret-agent-list.component.scss']
})
export class SecretAgentListComponent implements OnInit {

  currentAgent = signal<SecretAgent | null>(null);
  selectedAgent =  model<SecretAgent | null>();
  agentStore = inject(SecretAgentStore);
  iconConverter = new SecretAgentStatusToFaPipe();

  showWarning(agent: SecretAgent): Boolean {
    return agent.bananaBread && agent.lastKnownStatus !== SecretAgentStatus.DECEASED;
  }

  selectAgent(agent: SecretAgent) {
    this.currentAgent.set(agent);
    this.selectedAgent.update(() => agent);
  }

  trackByIndex(index: number): number {
    return index;
  }

  ngOnInit() {
    this.agentStore.loadAgents();
  }

}
