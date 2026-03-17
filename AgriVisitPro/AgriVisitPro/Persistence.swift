import CoreData

// MARK: - Persistence Controller
// Gestisce il Core Data stack con supporto iCloud tramite NSPersistentCloudKitContainer.
// I dati vengono sincronizzati automaticamente su tutti i dispositivi Apple collegati
// allo stesso account iCloud.

struct PersistenceController {

    // Singleton condiviso per l'intera app
    static let shared = PersistenceController()

    // Istanza di preview per SwiftUI Previews (dati di esempio, non salvati)
    static var preview: PersistenceController = {
        let controller = PersistenceController(inMemory: true)
        let context = controller.container.viewContext

        // Crea alcune visite di esempio per le preview
        let tipi = ["Programmata", "Spot", "Cortesia"]
        let argomenti = ["Genetica", "Consulenza", "Alimentazione", "Grossista"]
        let allevamenti = ["Allevamento Rossi", "Fattoria Bianchi", "Agri Verde SRL", "Podere Ferrara"]

        for i in 0..<6 {
            let visita = Visita(context: context)
            visita.id = UUID()
            visita.nomeAllevamento = allevamenti[i % allevamenti.count]
            visita.dataVisita = Calendar.current.date(byAdding: .day, value: -i * 3, to: Date())
            visita.tipo = tipi[i % tipi.count]
            visita.argomento = argomenti[i % argomenti.count]
            visita.note = i % 2 == 0 ? "Note di esempio per la visita numero \(i + 1)." : ""
            visita.annullata = i == 2 // La terza visita è annullata come esempio
        }

        do {
            try context.save()
        } catch {
            print("Errore nel salvataggio delle preview: \(error)")
        }

        return controller
    }()

    // Il container Core Data con iCloud
    let container: NSPersistentCloudKitContainer

    init(inMemory: Bool = false) {
        // Il nome deve corrispondere al file .xcdatamodeld
        container = NSPersistentCloudKitContainer(name: "AgriVisitPro")

        if inMemory {
            // Usato solo per le preview e i test: dati in memoria, non persistiti
            container.persistentStoreDescriptions.first?.url = URL(fileURLWithPath: "/dev/null")
        }

        // Configurazione per la sincronizzazione iCloud
        if let description = container.persistentStoreDescriptions.first {
            // Abilita la cronologia delle transazioni (necessaria per CloudKit)
            description.setOption(true as NSNumber,
                                  forKey: NSPersistentHistoryTrackingKey)
            // Notifica l'app quando i dati remoti cambiano
            description.setOption(true as NSNumber,
                                  forKey: NSPersistentStoreRemoteChangeNotificationPostOptionKey)
        }

        container.loadPersistentStores { storeDescription, error in
            if let error = error as NSError? {
                // In produzione, gestire questo errore in modo appropriato
                // (es. mostrare un alert all'utente)
                fatalError("Errore nel caricamento dello store Core Data: \(error), \(error.userInfo)")
            }
        }

        // Unisce automaticamente i cambiamenti del contesto padre
        container.viewContext.automaticallyMergesChangesFromParent = true

        // Politica di merge: i dati più recenti vincono sui conflitti
        container.viewContext.mergePolicy = NSMergeByPropertyObjectTrumpMergePolicy
    }
}
