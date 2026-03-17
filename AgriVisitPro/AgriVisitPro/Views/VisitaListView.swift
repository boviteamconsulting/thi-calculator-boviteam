import SwiftUI
import CoreData

// MARK: - Visita List View
// Mostra l'elenco di tutte le visite in ordine cronologico decrescente
// (le più recenti in cima). Le visite annullate sono visivamente distinte.

struct VisitaListView: View {

    // Recupera le visite dal Core Data, ordinate per data decrescente
    @FetchRequest(
        sortDescriptors: [NSSortDescriptor(keyPath: \Visita.dataVisita, ascending: false)],
        animation: .default
    )
    private var visite: FetchedResults<Visita>

    // Usato per salvare il contesto Core Data
    @Environment(\.managedObjectContext) private var viewContext

    // Controlla la visibilità del foglio per aggiungere una nuova visita
    @State private var mostraNuovaVisita = false

    var body: some View {
        NavigationStack {
            Group {
                if visite.isEmpty {
                    // Stato vuoto: nessuna visita ancora registrata
                    VStack(spacing: 16) {
                        Image(systemName: "calendar.badge.plus")
                            .font(.system(size: 60))
                            .foregroundStyle(.secondary)
                        Text("Nessuna visita registrata")
                            .font(.title2)
                            .fontWeight(.semibold)
                        Text("Premi il pulsante + per aggiungere\nla tua prima visita.")
                            .multilineTextAlignment(.center)
                            .foregroundStyle(.secondary)
                    }
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
                } else {
                    List {
                        ForEach(visite) { visita in
                            NavigationLink(destination: VisitaDetailView(visita: visita)) {
                                VisitaRowView(visita: visita)
                            }
                        }
                        .onDelete(perform: eliminaVisite)
                    }
                }
            }
            .navigationTitle("AgriVisit Pro")
            .toolbar {
                ToolbarItem(placement: .primaryAction) {
                    Button {
                        mostraNuovaVisita = true
                    } label: {
                        Label("Nuova Visita", systemImage: "plus")
                    }
                }
                // Mostra il pulsante Edit solo su iOS quando ci sono visite
                #if os(iOS)
                if !visite.isEmpty {
                    ToolbarItem(placement: .navigationBarLeading) {
                        EditButton()
                    }
                }
                #endif
            }
            .sheet(isPresented: $mostraNuovaVisita) {
                NuovaVisitaView()
            }
        }
    }

    // Elimina le visite selezionate dalla lista (swipe-to-delete)
    private func eliminaVisite(at offsets: IndexSet) {
        offsets.map { visite[$0] }.forEach(viewContext.delete)
        salvaContesto()
    }

    private func salvaContesto() {
        do {
            try viewContext.save()
        } catch {
            print("Errore nel salvataggio: \(error)")
        }
    }
}

// MARK: - Visita Row View
// Riga singola della lista: mostra le info principali di una visita.

struct VisitaRowView: View {
    let visita: Visita

    var body: some View {
        HStack(spacing: 12) {
            // Indicatore colorato per il tipo di visita
            RoundedRectangle(cornerRadius: 4)
                .fill(colorePerTipo(visita.tipo ?? ""))
                .frame(width: 6)
                .frame(maxHeight: .infinity)

            VStack(alignment: .leading, spacing: 4) {
                HStack {
                    Text(visita.nomeAllevamento ?? "Allevamento sconosciuto")
                        .font(.headline)
                        .strikethrough(visita.annullata) // Testo barrato se annullata
                    Spacer()
                    if visita.annullata {
                        Text("ANNULLATA")
                            .font(.caption2)
                            .fontWeight(.bold)
                            .foregroundStyle(.white)
                            .padding(.horizontal, 6)
                            .padding(.vertical, 2)
                            .background(.red, in: Capsule())
                    }
                }

                HStack(spacing: 8) {
                    // Data della visita
                    Label(
                        visita.dataVisita?.formatted(date: .abbreviated, time: .omitted) ?? "-",
                        systemImage: "calendar"
                    )
                    .font(.subheadline)
                    .foregroundStyle(.secondary)

                    Divider()
                        .frame(height: 12)

                    // Argomento
                    Text(visita.argomento ?? "-")
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                }

                // Tipo visita come badge
                Text(visita.tipo ?? "-")
                    .font(.caption)
                    .padding(.horizontal, 8)
                    .padding(.vertical, 2)
                    .background(colorePerTipo(visita.tipo ?? "").opacity(0.15))
                    .foregroundStyle(colorePerTipo(visita.tipo ?? ""))
                    .clipShape(Capsule())
            }
        }
        .padding(.vertical, 4)
        .opacity(visita.annullata ? 0.6 : 1.0) // Opacità ridotta per le annullate
    }

    // Restituisce un colore diverso per ogni tipo di visita
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
    VisitaListView()
        .environment(\.managedObjectContext, PersistenceController.preview.container.viewContext)
}
