CREATE TABLE MortgageCompanies (ID INTEGER PRIMARY KEY, NAME CHAR(30));
INSERT INTO MortgageCompanies
VALUES
  (1, 'Quicken Loans');
INSERT INTO
  MortgageCompanies
VALUES
  (2, 'Wells Fargo Bank');
INSERT INTO
  MortgageCompanies
VALUES
  (3, 'JPMorgan Chase Bank');
SELECT
  *
FROM
  MortgageCompanies;