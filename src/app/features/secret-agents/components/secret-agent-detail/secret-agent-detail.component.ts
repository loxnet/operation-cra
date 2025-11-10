import { Component, input, OnInit } from '@angular/core';
import { SecretAgent } from '../../stores/secret-agent.interface';

@Component({
  selector: 'app-secret-agent-detail',
  templateUrl: './secret-agent-detail.component.html',
  styleUrls: ['./secret-agent-detail.component.scss']
})
export class SecretAgentDetailComponent implements OnInit {
  public agent = input<SecretAgent | undefined>();

  ngOnInit() {

  }

}
