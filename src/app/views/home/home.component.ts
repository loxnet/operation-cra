import { SecretAgentDetailComponent } from './../../features/secret-agents/components/secret-agent-detail/secret-agent-detail.component';
import { SecretAgentListComponent } from '../../features/secret-agents/components/secret-agent-list/secret-agent-list.component';
import { Component, OnInit, signal } from '@angular/core';
import { SecretAgent } from '../../features/secret-agents/stores/secret-agent.interface';
import { MissionStore } from '../../features/missions/stores/mission.store';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  imports: [SecretAgentListComponent, SecretAgentDetailComponent],
  providers: [MissionStore]
})
export class HomeComponent implements OnInit {
  selectedAgent = signal<SecretAgent | null>(null);

  ngOnInit() {}

}
