-- Supabase SQL Editor'da çalıştır

-- Eski seat verilerini sil
DELETE FROM seats WHERE event_id = 'event-1';

-- 15 koltuklu yeni verileri ekle
INSERT INTO seats (event_id, row_letter, seat_number, status)
SELECT 
    'event-1',
    chr(65 + (row_num - 1)),
    seat_num,
    CASE 
        WHEN random() < 0.3 THEN 'sold'
        ELSE 'available'
    END
FROM generate_series(1, 8) AS row_num,
     generate_series(1, 15) AS seat_num;
