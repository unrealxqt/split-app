-- Migration: add haptic_enabled to device_ids
ALTER TABLE device_ids
ADD COLUMN haptic_enabled BOOLEAN DEFAULT true;

-- Optional: let users update it via RPC
CREATE OR REPLACE FUNCTION set_haptic_feedback(
  p_device_uuid UUID,
  p_enabled BOOLEAN
)
RETURNS VOID AS $$
BEGIN
  UPDATE device_ids
  SET haptic_enabled = p_enabled
  WHERE device_uuid = p_device_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
