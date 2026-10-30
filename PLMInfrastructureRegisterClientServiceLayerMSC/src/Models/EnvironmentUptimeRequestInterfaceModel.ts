import type { EnvironmentUptimeRequestStatusEnumModel } from './EnvironmentUptimeRequestStatusEnumModel';

// Mirrors the backend's EnvironmentUptimeRequestDTO field-for-field
// (camelCase, per System.Text.Json's default naming policy).
export default interface EnvironmentUptimeRequestInterfaceModel {
  id: string;
  ticketNumber: number;
  ticketId: string;
  environment: string;
  requesterName: string;
  fromAt: string;
  toAt: string;
  message: string | null;
  status: EnvironmentUptimeRequestStatusEnumModel;
  adminMessage: string | null;
  createdAt: string;
}
