export const TENANT_CONNECTOR_CONTRACT = 'skenai.tenant_connector.v0.1' as const;

export const CONNECTOR_SOURCES = [
  'drive',
  'gmail',
  'calendar',
  'github',
  'telegram',
  'gemini',
  'suno',
  'victron',
  'instagram',
  'youtube',
  '8090',
  'hopper',
  'huggingface',
] as const;

export type ConnectorSource = (typeof CONNECTOR_SOURCES)[number];

export type ConnectorStatus = 'pending' | 'active' | 'revoked' | 'failed';
export type ConnectorPiieClass = 'open' | 'internal' | 'closed';

export const CONNECTOR_ACTION = {
  connected: 'connector_connected',
  activated: 'connector_activated',
  revoked: 'connector_revoked',
} as const;

export function isConnectorSource(value: string): value is ConnectorSource {
  return (CONNECTOR_SOURCES as readonly string[]).includes(value);
}

export function defaultPiieForSource(source: ConnectorSource): ConnectorPiieClass {
  if (source === 'drive' || source === 'gmail' || source === 'calendar') return 'closed';
  if (source === 'telegram' || source === 'gemini') return 'internal';
  if (source === 'hopper' || source === '8090' || source === 'huggingface') return 'internal';
  return 'open';
}
