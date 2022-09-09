DROP DATABASE IF EXISTS "nest_transactions";
CREATE DATABASE "nest_transactions";
CREATE USER nest_transactions WITH ENCRYPTED PASSWORD 'admin1234';
GRANT ALL PRIVILEGES ON DATABASE nest_transactions TO nest_transactions;