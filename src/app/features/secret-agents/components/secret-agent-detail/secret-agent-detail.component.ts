import { Component, input, OnInit } from '@angular/core';
import { SecretAgent } from '../../stores/secret-agent.interface';
import { MapComponent } from "../../../map/map.component";
import { SecretAgentStatusToFaPipe } from '../../../../shared/pipes/agent-status-to-fa.pipe';

@Component({
  selector: 'app-secret-agent-detail',
  templateUrl: './secret-agent-detail.component.html',
  styleUrls: ['./secret-agent-detail.component.scss'],
  imports: [MapComponent]
})
export class SecretAgentDetailComponent implements OnInit {
  public agent = input.required<SecretAgent | null>();
  protected iconConverter = new SecretAgentStatusToFaPipe();
  ngOnInit() {

  }

}
