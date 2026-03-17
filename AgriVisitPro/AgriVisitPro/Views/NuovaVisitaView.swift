import SwiftUI

// MARK: - Nuova Visita View
// Foglio modale per aggiungere una nuova visita.
// L'utente compila tutti i campi e preme "Salva".

struct NuovaVisitaView: View {

    @Environment(\.managedObjectContext) private var viewContext
    @Environment(\.dismiss) private var dismiss

    // Campi del form collegati allo stato locale
    @State private var nomeAllevamento = ""
    @State private var dataVisita = Date()
    @State private var tipo = "Programmata"
    @State private var argomento = "Genetica"
    @State private var note = ""

    // Opzioni disponibili per i Picker
    let tipi = ["Programmata", "Spot", "Cortesia"]
    let argomenti = ["Genetica", "Consulenza", "Alimentazione", "Grossista"]

    // Il pulsante Salva è attivo solo se il nome non è vuoto
    private var formValido: Bool {
        !nomeAllevamento.trimmingCharacters(in: .whitespaces).isEmpty
    }

    var body: some View {
        NavigationStack {
            Form {
                // --- Sezione: Dati principali ---
                Section("Dati Allevamento") {
                    TextField("Nome allevamento *", text: $nomeAllevamento)
                        .autocorrectionDisabled()
                }

                // --- Sezione: Dettagli visita ---
                Section("Dettagli Visita") {
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
                }

                // --- Sezione: Note opzionali ---
                Section("Note (opzionale)") {
                    TextField("Inserisci eventuali note...", text: $note, axis: .vertical)
                        .lineLimit(4...8)
                }
            }
            .navigationTitle("Nuova Visita")
            #if os(iOS)
            .navigationBarTitleDisplayMode(.inline)
            #endif
            .toolbar {
                // Pulsante Annulla: chiude il foglio senza salvare
                ToolbarItem(placement: .cancellationAction) {
                    Button("Annulla") {
                        dismiss()
                    }
                }

                // Pulsante Salva: crea la visita e chiude il foglio
                ToolbarItem(placement: .confirmationAction) {
                    Button("Salva") {
                        salvaVisita()
                        dismiss()
                    }
                    .disabled(!formValido)
                    .fontWeight(.semibold)
                }
            }
        }
    }

    // Crea una nuova entità Visita nel contesto Core Data e la salva
    private func salvaVisita() {
        let nuovaVisita = Visita(context: viewContext)
        nuovaVisita.id = UUID()
        nuovaVisita.nomeAllevamento = nomeAllevamento.trimmingCharacters(in: .whitespaces)
        nuovaVisita.dataVisita = dataVisita
        nuovaVisita.tipo = tipo
        nuovaVisita.argomento = argomento
        nuovaVisita.note = note.trimmingCharacters(in: .whitespaces)
        nuovaVisita.annullata = false

        do {
            try viewContext.save()
        } catch {
            print("Errore nel salvataggio della visita: \(error)")
        }
    }
}

#Preview {
    NuovaVisitaView()
        .environment(\.managedObjectContext, PersistenceController.preview.container.viewContext)
}
