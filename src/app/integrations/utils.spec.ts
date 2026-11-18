import { buildConnectorItemTiles, CONNECTOR_ITEM_KEY_PREFIX, INTEGRATIONS_CATEGORIES } from './utils';

describe('buildConnectorItemTiles', () => {
  const baseTile = {
    name: 'Add connector',
    category: INTEGRATIONS_CATEGORIES.CONNECTOR,
    key: 'connectors',
    src_icon: 'assets/img/int/mcp-icon.png',
    src_logo: 'assets/img/int/mcp-logo.png',
    pro: true,
    plan: 'Pro'
  };

  it('returns an empty array when there are no items', () => {
    expect(buildConnectorItemTiles([], baseTile)).toEqual([]);
  });

  it('builds one tile per item, using the item name and a prefixed key', () => {
    const items = [
      { name: 'Google Services', baseUrl: 'http://localhost:4000' },
      { name: 'Salesforce', baseUrl: 'https://salesforce.example.com' }
    ];

    const tiles = buildConnectorItemTiles(items, baseTile);

    expect(tiles.length).toBe(2);
    expect(tiles[0].name).toBe('Google Services');
    expect(tiles[0].key).toBe(CONNECTOR_ITEM_KEY_PREFIX + 'http://localhost:4000');
    expect(tiles[1].name).toBe('Salesforce');
    expect(tiles[1].key).toBe(CONNECTOR_ITEM_KEY_PREFIX + 'https://salesforce.example.com');
  });

  it('copies category, icon, plan and pro flag from the base tile when the item has no icon', () => {
    const tiles = buildConnectorItemTiles(
      [{ name: 'Google Services', baseUrl: 'http://localhost:4000' }],
      baseTile
    );

    expect(tiles[0].category).toBe(INTEGRATIONS_CATEGORIES.CONNECTOR);
    expect(tiles[0].src_icon).toBe(baseTile.src_icon);
    expect(tiles[0].src_logo).toBe(baseTile.src_logo);
    expect(tiles[0].pro).toBe(baseTile.pro);
    expect(tiles[0].plan).toBe(baseTile.plan);
  });

  it('uses the connector-reported icon instead of the base tile icon when present', () => {
    const tiles = buildConnectorItemTiles(
      [{ name: 'Google Services', baseUrl: 'http://localhost:4000', icon: 'http://localhost:4000/assets/connector-icon.svg' }],
      baseTile
    );

    expect(tiles[0].src_icon).toBe('http://localhost:4000/assets/connector-icon.svg');
    expect(tiles[0].src_logo).toBe('http://localhost:4000/assets/connector-icon.svg');
  });
});
