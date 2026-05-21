ALTER TYPE request_status ADD VALUE IF NOT EXISTS 'confirmed';
ALTER TYPE request_status ADD VALUE IF NOT EXISTS 'in_production';
ALTER TYPE request_status ADD VALUE IF NOT EXISTS 'ready';
ALTER TYPE request_status ADD VALUE IF NOT EXISTS 'shipped';
ALTER TYPE request_status ADD VALUE IF NOT EXISTS 'delivered';
ALTER TYPE request_status ADD VALUE IF NOT EXISTS 'cancelled';