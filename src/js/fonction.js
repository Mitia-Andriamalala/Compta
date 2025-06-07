export async function getIDempiereModelsWhereSelect(token, nomTable, colonneFiltre, valeurFiltre, champSelectionne) {
  if (!token) {
    throw new Error("Token expiré ou manquant. Veuillez vous reconnecter.");
  }

  const filterParam = `${colonneFiltre} eq ${valeurFiltre}`;
  const selectParam = champSelectionne ? `&$select=${champSelectionne}` : "";

  const url = `/api/v1/models/${nomTable}?$filter=${filterParam}${selectParam}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    }
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || "Erreur lors de la récupération des modèles");
  }

  return await response.json();
}

export async function getIDempiereModelsWhereid(token,Nomtable,colonne,valeur) {

  // const colonneajuste=colonne.includes("_id") ? ${colonne}/id : colonne;
  const response = await fetch(`/api/v1/models/${Nomtable}?$filter=${colonne} eq ${valeur}`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    }
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || "Erreur lors de la récupération des modèles");
  }

  return await response.json();
}

export async function getIDempiereModelJoin(token, nomTable, nomTable2, colonneFiltre, valeurFiltre) {
  if (!token) {
    throw new Error("Token expiré ou manquant. Veuillez vous reconnecter.");
  }

  const filterParam = `${colonneFiltre} eq ${valeurFiltre}`;
  const expandParam = nomTable2 ? `$expand=${nomTable2}` : "";

  const url = `/api/v1/models/${nomTable}?${expandParam}($filter=${filterParam})`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    }
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || "Erreur lors de la récupération des modèles");
  }

  return await response.json();
}
export async function getIDempiereModelJoinSimple(token, nomTable, nomTable2) {
  if (!token) {
    throw new Error("Token expiré ou manquant. Veuillez vous reconnecter.");
  }

  const expandParam = nomTable2 ? `$expand=${nomTable2}` : "";

  const url = `/api/v1/models/${nomTable}?${expandParam}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    }
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || "Erreur lors de la récupération des modèles");
  }

  return await response.json();
}

export async function getIDempiereModelsWhere(token, nomTable, colonneFiltre, valeurFiltre) {
  if (!token) {
    throw new Error("Token expiré ou manquant. Veuillez vous reconnecter.");
  }

  const filterParam = `${colonneFiltre} eq ${valeurFiltre}`;

  const url = `/api/v1/models/${nomTable}?$filter=${filterParam}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    }
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || "Erreur lors de la récupération des modèles");
  }

  return await response.json();
}



export async function getIDempiereModels(token, nomTable) {
  if (!token) {
    throw new Error("Token expiré ou manquant. Veuillez vous reconnecter.");
  }

  const url = `/api/v1/models/${nomTable}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    }
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || "Erreur lors de la récupération des modèles");
  }

  return await response.json();
}


export async function creationtable(token,tablename, Jsonutil) {

  if (!token) {
    throw new Error("Token expiré ou manquant. Veuillez vous reconnecter.");
  }


  const response = await fetch(`/api/v1/models/${tablename}`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(Jsonutil)
  });
    if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || "Erreur lors de la création de l'enregistrement");
  }

  const createdRecord = await response.json();
  return createdRecord;

}

export function convertirDate(dateFR) {
  const [jour, mois, annee] = dateFR.split('/');
  return `${annee}-${mois}-${jour}`;
}

export function getDebutMois(dateString) {
  const date = new Date(dateString + "T00:00:00Z"); // Force UTC
  const debutMois = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
  return debutMois.toISOString().split("T")[0];
}
export async function getBalancefromidcompte(token,id) {
  const listedesjournal = await getIDempiereModelsWhereid(token,"gl_journalline", "Account_ID", id);

  let totalDebit = 0;
  let totalCredit = 0;

  for (const line of listedesjournal.records) {
    const debit = parseFloat(line.AmtSourceDr || 0);
    const credit = parseFloat(line.AmtSourceCr || 0);

    totalDebit += debit;
    totalCredit += credit;
  }

  const balance = totalDebit - totalCredit;

  return {
    balance,
    totalDebit,
    totalCredit
  };
}
export async function deleteRecord(token, tablename, id) {
  if (!token) {
    throw new Error("Token expiré ou manquant. Veuillez vous reconnecter.");
  }

  const response = await fetch(`/api/v1/models/${tablename}/${id}`, {
    method: "DELETE",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    }
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || "Erreur lors de la suppression de l'enregistrement");
  }

  return { success: true, message: "Enregistrement supprimé avec succès" };
}