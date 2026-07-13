CREATE TABLE fichiers(
    id SERIAL PRIMARY KEY,
    nom TEXT NOT NULL,
    content TEXT NOT NULL,
    date_ajout TIMESTAMP DEFAULT now() 
) 
