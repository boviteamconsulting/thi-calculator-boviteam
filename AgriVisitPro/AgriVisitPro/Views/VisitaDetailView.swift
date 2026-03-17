import SwiftUI

// MARK: - Visita Detail View
// Mostra i dettagli completi di una visita e permette di modificarli.
// Integra anche il pulsante per annullare/ripristinare la visita.

struct VisitaDetailView: View {

    @Environment(\.managedObjectContext) private var viewContext
    @Environment(\.dismiss) private var dismiss

    // La visita da visualizzare/modificare (oggetto Core Data)
    @ObservedObject var visita: Visita

    // Stato locale per la modalità modifica
    @State private var inModifica = false

    // Copie locali dei campi per la modifica (evita di modificare Core Data
    // finché l'utente non conferma con "Fine")
    @State private var nomeAllevamento = ""
    @State private var dataVisita = Date()
    @State private var tipo = "Programmata"
    @State private var argomento = "Genetica"
    @State private var note = ""

    // Mostra un alert di conferma prima di annullare la visita
    @State private var mostraConfermaAnnullamento = false

    let tipi = ["Programmata", "Spot", "Cortesia"]
    let argomenti = ["Genetica", "Consulenza", "Alimentazione", "Grossista"]

    var body: some View {
        Form {
            // --- Sezione: Dati principali ---
            Section("Dati Allevamento") {
                if inModifica {
                    TextField("Nome allevamento", text: $nomeAllevamento)
                        .autocorrectionDisabled()
                } else {
                    LabeledContent("Nome", value: visita.nomeAllevamento ?? "-")
                }
            }

            // --- Sezione: Dettagli visita ---
            Section("Dettagli Visita") {
                if inModifica {
                    DatePicker("Data visita", selection: $dataVisita, displayedComponents: .date)

                    Picker("Tipo", selection: $tipo) {
                        ForEach(tipi, id: \.self) { t in
                            Text(t).tag(t)
                        }
                    }

                    Picker("Argomento", selection: $argomento) {
                        ForEach(argomenti, id: \.self) { a in
                            Text(a).tag(a)
                        }
                    }
                } else {
                    LabeledContent("Data") {
                        Text(visita.dataVisita?.formatted(date: .long, time: .omitted) ?? "-")
                    }
                    LabeledContent("Tipo") {
                        Text(visita.tipo ?? "-")
                            .foregroundStyle(colorePerTipo(visita.tipo ?? ""))
                            .fontWeight(.medium)
                    }
                    LabeledContent("Argomento", value: visita.argomento ?? "-")
                }
            }

            // --- Sezione: Note ---
            Section("Note") {
                if inModifica {
                    TextField("Note...", text: $note, axis: .vertical)
                        .lineLimit(4...8)
                } else {
                    if let note = visita.note, !note.isEmpty {
                        Text(note)
                            .foregroundStyle(.primary)
                    } else {
                        Text("Nessuna nota")
                            .foregroundStyle(.secondary)
                            .italic()
                    }
                }
            }

            // --- Sezione: Stato visita ---
            Section("Stato") {
                HStack {
                    Image(systemName: visita.annullata ? "xmark.circle.fill" : "checkmark.circle.fill")
                        .foregroundStyle(visita.annullata ? .red : .green)
                    Text(visita.annullata ? "Visita annullata" : "Visita attiva")
                        .foregroundStyle(visita.annullata ? .red : .primary)
                        .fontWeight(visita.annullata ? .semibold : .regular)
                }

                // Pulsante per annullare o ripristinare la visita
                Button {
                    if visita.annullata {
                        // Ripristino immediato: nessun alert necessario
                        ripristinaVisita()
                    } else {
                        // Annullamento: chiede conferma prima di procedere
                        mostraConfermaAnnullamento = true
                    }
                } label: {
                    HStack {
                        Image(systemName: visita.annullata ? "arrow.uturn.left.circle" : "xmark.circle")
                        Text(visita.annullata ? "Ripristina visita" : "Annulla visita")
                    }
                    .foregroundStyle(visita.annullata ? .blue : .red)
                }
            }
        }
        .navigationTitle(visita.nomeAllevamento ?? "Dettaglio Visita")
        #if os(iOS)
        .navigationBarTitleDisplayMode(.large)
        #endif
        .toolbar {
            ToolbarItem(placement: .primaryAction) {
                if inModifica {
                    // Pulsante "Fine": salva le modifiche
                    Button("Fine") {
                        salvaModifiche()
                        inModifica = false
                    }
                    .fontWeight(.semibold)
                    .disabled(nomeAllevamento.trimmingCharacters(in: .whitespaces).isEmpty)
                } else {
                    // Pulsante "Modifica": entra in modalità modifica
                    Button("Modifica") {
                        caricaDatiPerModifica()
                        inModifica = true
                    }
                }
            }

            // Pulsante Annulla modifica (visibile solo durante la modifica)
            if inModifica {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Annulla") {
                        inModifica = false
                    }
                }
            }
        }
        .alert("Annulla visita", isPresented: $mostraConfermaAnnullamento) {
            Button("Annulla visita", role: .destructive) {
                annullaVisita()
            }
            Button("Indietro", role: .cancel) {}
        } message: {
            Text("Sei sicuro di voler annullare questa visita? Potrai ripristinarla in seguito.")
        }
        // Disabilita la modifica se la visita è annullata
        .disabled(inModifica && visita.annullata)
    }

    // MARK: - Helper Methods

    // Copia i valori attuali della visita nei campi di modifica locali
    private func caricaDatiPerModifica() {
        nomeAllevamento = visita.nomeAllevamento ?? ""
        dataVisita = visita.dataVisita ?? Date()
        tipo = visita.tipo ?? "Programmata"
        argomento = visita.argomento ?? "Genetica"
        note = visita.note ?? ""
    }

    // Salva le modifiche nell'oggetto Core Data
    private func salvaModifiche() {
        visita.nomeAllevamento = nomeAllevamento.trimmingCharacters(in: .whitespaces)
        visita.dataVisita = dataVisita
        visita.tipo = tipo
        visita.argomento = argomento
        visita.note = note.trimmingCharacters(in: .whitespaces)
        salvaContesto()
    }

    // Imposta annullata = true
    private func annullaVisita() {
        visita.annullata = true
        salvaContesto()
    }

    // Imposta annullata = false
    private func ripristinaVisita() {
        visita.annullata = false
        salvaContesto()
    }

    private func salvaContesto() {
        do {
            try viewContext.save()
        } catch {
            print("Errore nel salvataggio: \(error)")
        }
    }

    private func colorePerTipo(_ tipo: String) -> Color {
        switch tipo {
        case "Programmata": return .blue
        case "Spot":        return .orange
        case "Cortesia":    return .green
        default:            return .gray
        }
    }
}

#Preview {
    // Crea una visita di esempio per la preview
    let context = PersistenceController.preview.container.viewContext
    let visita = Visita(context: context)
    visita.id = UUID()
    visita.nomeAllevamento = "Allevamento Rossi"
    visita.dataVisita = Date()
    visita.tipo = "Programmata"
    visita.argomento = "Genetica"
    visita.note = "Prima visita di controllo annuale."
    visita.annullata = false

    return NavigationStack {
        VisitaDetailView(visita: visita)
    }
    .environment(\.managedObjectContext, context)
}
