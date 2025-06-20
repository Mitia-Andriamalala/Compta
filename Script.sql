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

-- 1. D'abord supprimer toutes les lignes du journal REF01
DELETE FROM GL_JournalLine 
WHERE GL_Journal_ID IN (
    SELECT GL_Journal_ID 
    FROM GL_Journal 
    WHERE DocumentNo = 'REF01'
);

-- 2. Ensuite supprimer le journal REF01 lui-même
DELETE FROM GL_Journal 
WHERE DocumentNo = 'REF01';

-- 3. Vérifier que c'est bien supprimé
SELECT DocumentNo, DocStatus, Posted
FROM GL_Journal
WHERE DocumentNo IN ('REF01', 'REF02', 'REF03', 'REF04');

-- Voir toutes vos factures et leur statut
SELECT C_Invoice_ID, DocumentNo, DocStatus, IsPaid, GrandTotal
FROM C_Invoice 
ORDER BY DateInvoiced DESC;

-- Script simple et direct
DELETE FROM C_InvoiceLine WHERE C_Invoice_ID = 1000006;
DELETE FROM C_Invoice WHERE C_Invoice_ID = 1000006;

DELETE FROM GL_Journal
WHERE DocumentNo IN ('REF01', 'REF02', 'REF03', 'REF04');
