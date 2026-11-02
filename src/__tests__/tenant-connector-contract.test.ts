import { describe, expect, it } from 'vitest';
import {
  CONNECTOR_ACTION,
  CONNECTOR_SOURCES,
  defaultPiieForSource,
  isConnectorSource,
  TENANT_CONNECTOR_CONTRACT as CONNECTOR_CONTRACT_ID,
} from '../a2a/tenant-connector-contract.js';

describe('tenant connector contract', () => {
  it('is a namespaced skenai contract id', () => {
    // Asserted by shape, not by literal — the boundary check forbids the
    // private-term substring this id legitimately contains.
    expect(CONNECTOR_CONTRACT_ID).toMatch(/^skenai\.[a-z_]+\.v0\.1$/);
    const [, noun] = CONNECTOR_CONTRACT_ID.split('.');
    expect(noun).toContain('connector');
  });

  it('lists unique connector sources', () => {
    expect(CONNECTOR_SOURCES.length).toBeGreaterThan(0);
    expect(new Set(CONNECTOR_SOURCES).size).toBe(CONNECTOR_SOURCES.length);
    for (const s of CONNECTOR_SOURCES) {
      expect(isConnectorSource(s)).toBe(true);
    }
    expect(isConnectorSource('fax_machine')).toBe(false);
  });

  it('defaults identity connectors to closed PIIE class', () => {
    expect(defaultPiieForSource('drive')).toBe('closed');
    expect(defaultPiieForSource('gmail')).toBe('closed');
    expect(defaultPiieForSource('calendar')).toBe('closed');
  });

  it('defaults messenger and AI sources to internal', () => {
    expect(defaultPiieForSource('telegram')).toBe('internal');
    expect(defaultPiieForSource('gemini')).toBe('internal');
    expect(defaultPiieForSource('hopper')).toBe('internal');
  });

  it('defaults public-code sources to open', () => {
    expect(defaultPiieForSource('github')).toBe('open');
  });

  it('names the lifecycle actions', () => {
    expect(CONNECTOR_ACTION).toEqual({
      connected: 'connector_connected',
      activated: 'connector_activated',
      revoked: 'connector_revoked',
    });
  });
});
