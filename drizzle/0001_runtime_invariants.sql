-- Keep stale local schemas safe after the sentinel based compare-and-swap code was introduced.
CREATE TRIGGER IF NOT EXISTS inventory_timestamp_guard
BEFORE UPDATE ON inventory
WHEN NEW.updated_at < 0
BEGIN
  SELECT RAISE(ABORT, 'inventory compare-and-swap failed');
END;

CREATE TRIGGER IF NOT EXISTS inventory_asset_state_guard_insert
BEFORE INSERT ON inventory_assets
WHEN NEW.state NOT IN ('AVAILABLE','ALLOCATED','BORROWED','DAMAGED','MAINTENANCE','LOST')
BEGIN
  SELECT RAISE(ABORT, 'invalid inventory asset state');
END;

CREATE TRIGGER IF NOT EXISTS inventory_asset_state_guard_update
BEFORE UPDATE ON inventory_assets
WHEN NEW.state NOT IN ('AVAILABLE','ALLOCATED','BORROWED','DAMAGED','MAINTENANCE','LOST')
BEGIN
  SELECT RAISE(ABORT, 'invalid inventory asset state');
END;

CREATE TRIGGER IF NOT EXISTS request_status_guard_update
BEFORE UPDATE ON requests
WHEN NEW.status = 'INVALID'
BEGIN
  SELECT RAISE(ABORT, 'request compare-and-swap failed');
END;

CREATE TRIGGER IF NOT EXISTS record_timestamp_guard_insert
BEFORE INSERT ON record_store
WHEN NEW.updated_at < 0
BEGIN
  SELECT RAISE(ABORT, 'record compare-and-swap failed');
END;

CREATE TRIGGER IF NOT EXISTS record_timestamp_guard_update
BEFORE UPDATE ON record_store
WHEN NEW.updated_at < 0
BEGIN
  SELECT RAISE(ABORT, 'record compare-and-swap failed');
END;
