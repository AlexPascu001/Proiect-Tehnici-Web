DROP TYPE IF EXISTS categ_brand;
DROP TYPE IF EXISTS tipuri_adidasi;

CREATE TYPE categ_brand AS ENUM( 'nike', 'adidas', 'puma', 'converse','comun');
CREATE TYPE tipuri_adidasi AS ENUM('running', 'street', 'casual', 'basketball');


CREATE TABLE IF NOT EXISTS adidasi (
   id serial PRIMARY KEY,
   nume VARCHAR(50) UNIQUE NOT NULL,
   descriere TEXT,
   pret NUMERIC(8,2) NOT NULL,
   marime INT NOT NULL CHECK (marime>=0),
   culoare_principala VARCHAR(10) NOT NULL,
   tip_produs tipuri_adidasi DEFAULT 'running',
   categorie categ_brand DEFAULT 'comun',
   materiale VARCHAR [], --pot sa nu fie specificare deci nu punem NOT NULL
   resigilat BOOLEAN NOT NULL DEFAULT FALSE,
   imagine VARCHAR(300),
   data_adaugare TIMESTAMP DEFAULT current_timestamp
);

-- /resurse/imagini/galerie/sneaker1.jpg'

INSERT into adidasi (nume,descriere,pret, marime, culoare_principala, tip_produs, categorie, materiale, resigilat, imagine) VALUES
('Nike x Off-White Air Force 1 Blue', 'Sneakers High Top dintr-o colaborare superba intre Nike si Off-White', 1299, 42, 'albastru', 'casual', 'nike', '{"piele", "sintetice", "cauciuc"}', FALSE, 'sneaker1.jpg'),

('Nike x Off-White Air Force 1 Red', 'Sneakers High Top dintr-o colaborare superba intre Nike si Off-White', 1299, 43, 'rosu', 'casual', 'nike', '{"piele", "sintetice", "cauciuc"}', False, 'sneaker2.jpg'),

('Nike X Off-White Air Jordan 4', 'Sneakers High Top dintr-o colaborare superba intre Nike si Off-White', 1499, 45, 'sail', 'casual', 'nike', '{"panza", "sintetice", "cauciuc", "silicon"}', True, 'sneaker4.jpg'),

('Nike Superrep', 'Adidasi de alergat comozi pentru o performanta crescuta', 499, 44, 'verde', 'running', 'nike', '{"panza", "sintetice", "cauciuc", "spuma"}', False, 'sneaker10.jpg'),

('Nike Air White/Orange', 'Sneakers intr-o combinatie superba dintre alb si portocaliu', 399, 35, 'portocaliu', 'casual', 'nike', '{"panza", "sintetice", "cauciuc"}', FALSE, 'sneaker5.jpg'),

('Nike Air Force 1 Low White', 'Sneakers Low Top clasici albi', 499, 48, 'alb', 'casual', 'nike', '{"piele", "sintetice", "cauciuc"}', False, 'sneaker8.jpg'),

('Nike Air Force 1 High Red', 'Sneakers High Top rosii', 699, 39, 'rosu', 'casual', 'nike', '{"piele", "sintetice", "cauciuc"}', False, 'sneaker3.jpg'),

('Nike Air Force 1 High Blue', 'Sneakers High Top albastri', 699, 45, 'albastru', 'casual', 'nike', '{"piele", "sintetice", "cauciuc"}', False, 'sneaker6.jpg'),

('Nike Air Force 1 High Orange', 'Sneakers High Top portocalii', 699, 37, 'portocaliu', 'casual', 'nike', '{"piele", "sintetice", "cauciuc"}', False, 'sneaker7.jpg'),

('Nike Air Pink/Purple', 'Sneakers intr-o combinatie superba dintre roz si mov', 899, 35, 'roz', 'casual', 'nike', '{"piele", "sintetice", "cauciuc"}', FALSE, 'sneaker9.jpg'),

('Nike Basketball Air', 'Adidasi pentru baschet pentru a te propulsa catre cos', 1099, 46, 'negru', 'basketball', 'nike', '{"panza", "sintetice", "cauciuc", "spuma"}', False, 'sneaker11.jpg');
