import { SecretAgent } from '../../secret-agents/stores/secret-agent.interface';

export enum Status {
  PLANNED,
  IN_PROGRESS,
  ABORTED,
  OVER
}

export interface SecretMission {
  geolocation: GeolocationCoordinates;
  summary: string;
  status: Status;
  startDate: Date;
  endDate: Date;
  assignedAgents: SecretAgent[];
}
