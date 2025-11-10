import { Component, inject, OnInit, output, signal } from '@angular/core';
import { SecretAgentStore } from '../../stores/secret-agent.store';
import { PictoFromAgentStatusPipe } from '../../../../shared/pipes/picto-from-agent-status-pipe';
import { SecretAgent, SecretAgentStatus } from '../../stores/secret-agent.interface';
import { SecretAgentStatusToFaPipe } from '../../../../shared/pipes/agent-status-to-fa.pipe';

@Component({
  selector: 'app-secret-agent-list',
  templateUrl: './secret-agent-list.component.html',
  imports:[PictoFromAgentStatusPipe],
  providers: [SecretAgentStore],
  styleUrls: ['./secret-agent-list.component.scss']
})
export class SecretAgentListComponent implements OnInit {

  currentAgent = signal<SecretAgent | undefined>(undefined);
  selected =  output<SecretAgent | undefined>();
  agentStore = inject(SecretAgentStore);
  iconConverter = new SecretAgentStatusToFaPipe();

  showWarning(agent: SecretAgent): Boolean {
    return agent.bananaBread && agent.lastKnownStatus !== SecretAgentStatus.DECEASED;
  }

  selectAgent(agent: SecretAgent) {
    this.currentAgent.set(agent) ;
    this.selected.emit(this.currentAgent());
  }

  trackByIndex(index: number): number {
    return index;
  }

  ngOnInit() {
    this.agentStore.loadAgents();
  }

}
