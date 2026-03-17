import Foundation
import CoreData

// MARK: - Visita Extensions
// Estensioni sull'entità Core Data "Visita" per aggiungere proprietà
// e metodi di utilità usati nelle View.

extension Visita {

    // Tutti i tipi di visita disponibili
    static let tipiDisponibili: [String] = ["Programmata", "Spot", "Cortesia"]

    // Tutti gli argomenti disponibili
    static let argomentiDisponibili: [String] = ["Genetica", "Consulenza", "Alimentazione", "Grossista"]

    // Descrizione testuale dello stato della visita
    var statoDescrizione: String {
        annullata ? "Annullata" : "Attiva"
    }

    // Data formattata in italiano (es. "15 marzo 2025")
    var dataFormattata: String {
        dataVisita?.formatted(date: .long, time: .omitted) ?? "Data non disponibile"
    }

    // Data breve (es. "15 mar 2025")
    var dataBreve: String {
        dataVisita?.formatted(date: .abbreviated, time: .omitted) ?? "-"
    }

    // Crea un fetch request di default ordinato per data decrescente
    static func fetchRequestOrdinato() -> NSFetchRequest<Visita> {
        let request = NSFetchRequest<Visita>(entityName: "Visita")
        request.sortDescriptors = [NSSortDescriptor(keyPath: \Visita.dataVisita, ascending: false)]
        return request
    }
}
