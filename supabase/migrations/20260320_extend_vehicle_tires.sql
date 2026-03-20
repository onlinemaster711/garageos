-- Migration: Extend vehicle_tires table with brand information
-- Date: 2026-03-20
-- Description: Add brand, brand_custom, and model columns to track tire manufacturer details

ALTER TABLE vehicle_tires
ADD COLUMN brand TEXT DEFAULT 'michelin',
ADD COLUMN brand_custom TEXT,
ADD COLUMN model TEXT;

CREATE INDEX idx_vehicle_tires_brand ON vehicle_tires(brand);
CREATE INDEX idx_vehicle_tires_vehicle_brand ON vehicle_tires(vehicle_id, brand);

ALTER TABLE vehicle_tires
ADD CONSTRAINT check_custom_brand
CHECK (brand = 'custom' OR brand_custom IS NULL);

COMMENT ON COLUMN vehicle_tires.brand IS 'Tire brand (michelin, pirelli, continental, bridgestone, goodyear, dunlop, falken, toyo, yokohama, hankook, custom)';
COMMENT ON COLUMN vehicle_tires.brand_custom IS 'Custom brand name if brand = custom';
COMMENT ON COLUMN vehicle_tires.model IS 'Tire model (e.g., Defender, Pilot Sport)';
