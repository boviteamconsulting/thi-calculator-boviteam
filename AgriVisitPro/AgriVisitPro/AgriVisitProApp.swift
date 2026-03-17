import SwiftUI

// MARK: - App Entry Point
// Punto di ingresso dell'applicazione.
// Inietta il managed object context nell'ambiente SwiftUI
// così tutte le view figlie possono accedere a Core Data.

@main
struct AgriVisitProApp: App {

    // Usa il singleton condiviso del PersistenceController
    let persistenceController = PersistenceController.shared

    var body: some Scene {
        WindowGroup {
            ContentView()
                // Rende disponibile il context Core Data a tutte le view
                .environment(\.managedObjectContext, persistenceController.container.viewContext)
        }
    }
}
