import { SecretMission } from '../../missions/stores/mission.interface';

export enum SecretAgentStatus {
  OPERATIONAL = "OPERATIONAL",
  DECEASED = "DECEASED",
  HOSTAGE = "HOSTAGE",
  CONTAMINATED = "CONTAMINATED",
  UNKNOWN = "UNKNOWN",
  REST = "REST"
}

export interface SecretAgent {
  nickname: string;
  picture?: Blob;
  lastKnownStatus: SecretAgentStatus;
  currentLocation?: GeolocationCoordinates;
  bananaBread: Boolean;
}

export interface SecretAgentState {
  agents: SecretAgent[];
  filter: SecretAgentStatus ;
  isLoading: boolean;
  error: string | null ;
}
