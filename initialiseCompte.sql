-- Étape 1 : désactiver les contraintes de réplication pour autoriser les suppressions en cascade manuelle
SET session_replication_role = replica;

-- Étape 2 : supprimer les lignes liées dans les journaux, budgets, etc.
DELETE FROM GL_JournalLine WHERE C_ElementValue_ID IS NOT NULL;
DELETE FROM C_BudgetLine WHERE C_ElementValue_ID IS NOT NULL;
DELETE FROM C_ElementValue_Trl;
DELETE FROM Fact_Acct WHERE Account_ID IS NOT NULL;

-- Ajoutez ici d'autres suppressions si vous avez personnalisé votre instance avec d'autres tables contenant Account_ID ou C_ElementValue_ID

-- Étape 3 : suppression dans la table principale
DELETE FROM C_ElementValue;

-- Étape 4 : réactiver la réplication
SET session_replication_role = origin;