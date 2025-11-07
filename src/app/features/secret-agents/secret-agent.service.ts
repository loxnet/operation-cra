import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { SecretAgent } from './stores/secret-agent.interface';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SecretAgentService {
  private http = inject(HttpClient);

  getSecretAgents(): Observable<SecretAgent[]> {
    return this.http.get<SecretAgent[]>(`${environment.backendUrl}/${environment.secretAgentPath}`)
  }
}
