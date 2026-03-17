import SwiftUI

// MARK: - Content View
// View principale: punto di partenza della navigazione dell'app.
// Mostra la lista delle visite e il pulsante per aggiungerne una nuova.

struct ContentView: View {
    var body: some View {
        VisitaListView()
    }
}

#Preview {
    ContentView()
        .environment(\.managedObjectContext, PersistenceController.preview.container.viewContext)
}
