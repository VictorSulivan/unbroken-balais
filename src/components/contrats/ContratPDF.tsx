"use client";

import { useRef } from "react";

type Props = {
  employe: {
    nom: string;
    prenom: string;
    role: string;
    salaire: number | null;
    dateEmbauche: string | null;
  };
  contrat: {
    typeContrat: string;
    dateDebut: string;
    dateFin: string | null;
    salaire: number | null;
    pourcentagePrime: number | null;
    commentaire: string | null;
  };
  entreprise: string;
};

export default function ContratPDF({ employe, contrat, entreprise }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  async function handleDownload() {
    const html2pdf = (await import("html2pdf.js")).default;
    html2pdf()
      .set({
        margin: 15,
        filename: `contrat_${employe.nom}_${employe.prenom}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      })
      .from(ref.current!)
      .save();
  }

  const fmt = (d: string) =>
    new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });

  return (
    <div>
      {/* Bouton téléchargement */}
      <button
        onClick={handleDownload}
        className="flex items-center gap-2 bg-[#2a2250] hover:bg-[#342b6e] border border-[#3d3580] text-[#c4bbff] text-sm font-medium px-4 py-2.5 rounded-lg transition-colors mb-6"
      >
        ↓ Télécharger le contrat PDF
      </button>

      {/* Aperçu du contrat */}
      <div className="bg-white rounded-xl overflow-hidden shadow-2xl">
        <div ref={ref} style={{ fontFamily: "Georgia, serif", color: "#1a1a1a", padding: "40px", background: "white" }}>

          {/* En-tête */}
          <div style={{ textAlign: "center", marginBottom: "40px", borderBottom: "2px solid #1a1a2e", paddingBottom: "20px" }}>
            <div style={{ fontSize: "22px", fontWeight: "bold", color: "#1a1a2e", letterSpacing: "2px", textTransform: "uppercase" }}>
              {entreprise}
            </div>
            <div style={{ fontSize: "13px", color: "#666", marginTop: "4px" }}>
              Pré au lard, Highlands
            </div>
            <div style={{ fontSize: "18px", fontWeight: "bold", marginTop: "20px", color: "#2a2250", textTransform: "uppercase", letterSpacing: "1px" }}>
              Contrat de travail — {contrat.typeContrat}
            </div>
          </div>

          {/* Parties */}
          <div style={{ marginBottom: "28px" }}>
            <div style={{ fontSize: "11px", textTransform: "uppercase", color: "#888", letterSpacing: "1px", marginBottom: "12px" }}>Entre les parties</div>
            <div style={{ display: "flex", gap: "40px" }}>
              <div style={{ flex: 1, background: "#f8f8fc", padding: "16px", borderRadius: "8px", borderLeft: "3px solid #2a2250" }}>
                <div style={{ fontSize: "11px", color: "#888", marginBottom: "4px" }}>EMPLOYEUR</div>
                <div style={{ fontWeight: "bold", fontSize: "14px" }}>{entreprise}</div>
                <div style={{ fontSize: "12px", color: "#555", marginTop: "4px" }}>Pré au lard, Highlands</div>
              </div>
              <div style={{ flex: 1, background: "#f8f8fc", padding: "16px", borderRadius: "8px", borderLeft: "3px solid #a89af9" }}>
                <div style={{ fontSize: "11px", color: "#888", marginBottom: "4px" }}>EMPLOYÉ</div>
                <div style={{ fontWeight: "bold", fontSize: "14px" }}>{employe.prenom} {employe.nom}</div>
                <div style={{ fontSize: "12px", color: "#555", marginTop: "4px", textTransform: "capitalize" }}>Poste : {employe.role.replace("_", " ")}</div>
              </div>
            </div>
          </div>

          {/* Article 1 — Objet */}
          <div style={{ marginBottom: "20px" }}>
            <div style={{ fontSize: "13px", fontWeight: "bold", color: "#2a2250", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Article 1 — Objet du contrat
            </div>
            <div style={{ fontSize: "12px", lineHeight: "1.8", color: "#333" }}>
              La société <strong>{entreprise}</strong> engage <strong>{employe.prenom} {employe.nom}</strong> en qualité de <strong>{employe.role.replace("_", " ")}</strong>, dans le cadre d&apos;un contrat de type <strong>{contrat.typeContrat}</strong>, conformément aux dispositions du présent document.
            </div>
          </div>

          {/* Article 2 — Durée */}
          <div style={{ marginBottom: "20px" }}>
            <div style={{ fontSize: "13px", fontWeight: "bold", color: "#2a2250", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Article 2 — Durée
            </div>
            <div style={{ fontSize: "12px", lineHeight: "1.8", color: "#333" }}>
              Le présent contrat prend effet le <strong>{fmt(contrat.dateDebut)}</strong>.
              {contrat.dateFin
                ? <> Il prend fin le <strong>{fmt(contrat.dateFin)}</strong>.</>
                : <> Il est conclu pour une durée <strong>indéterminée</strong>.</>
              }
            </div>
          </div>

          {/* Article 3 — Rémunération */}
          <div style={{ marginBottom: "20px" }}>
            <div style={{ fontSize: "13px", fontWeight: "bold", color: "#2a2250", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Article 3 — Rémunération
            </div>
            <div style={{ fontSize: "12px", lineHeight: "1.8", color: "#333" }}>
              {contrat.salaire
                ? <>L&apos;employé percevra un salaire de <strong>{contrat.salaire.toLocaleString()} Mornilles</strong> la demi heure.</>
                : <>La rémunération sera définie par accord entre les parties.</>
              }
              <br/>
              {contrat.pourcentagePrime && (
                <> Une prime de performance sera appliquée selon les résultats à chaque semestre.</>
              )}
            </div>
          </div>

          {/* Article 4 — Commentaires */}
          {contrat.commentaire && (
            <div style={{ marginBottom: "20px" }}>
              <div style={{ fontSize: "13px", fontWeight: "bold", color: "#2a2250", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Article 4 — Dispositions particulières
              </div>
              <div style={{ fontSize: "12px", lineHeight: "1.8", color: "#333" }}>
                {contrat.commentaire}
              </div>
            </div>
          )}

          {/* Signatures */}
          <div style={{ marginTop: "48px", paddingTop: "24px", borderTop: "1px solid #eee" }}>
            <div style={{ fontSize: "11px", color: "#888", textAlign: "center", marginBottom: "32px" }}>
              Fait à Pré au lard, le {new Date().toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", gap: "40px" }}>
              <div style={{ flex: 1, textAlign: "center" }}>
                <div style={{ fontSize: "11px", color: "#888", marginBottom: "48px" }}>Signature de l&apos;employeur</div>
                <div style={{ borderTop: "1px solid #333", paddingTop: "8px", fontSize: "12px", fontWeight: "bold" }}>{entreprise}</div>
              </div>
              <div style={{ flex: 1, textAlign: "center" }}>
                <div style={{ fontSize: "11px", color: "#888", marginBottom: "48px" }}>Signature de l&apos;employé</div>
                <div style={{ borderTop: "1px solid #333", paddingTop: "8px", fontSize: "12px", fontWeight: "bold" }}>{employe.prenom} {employe.nom}</div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
