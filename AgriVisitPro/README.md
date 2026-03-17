# AgriVisit Pro — CRM per la gestione delle visite agli allevamenti

App SwiftUI + Core Data (con sincronizzazione iCloud) per iPhone e Mac.

---

## Struttura dei file

```
AgriVisitPro/
├── AgriVisitProApp.swift                        # Punto di ingresso dell'app
├── Persistence.swift                            # Stack Core Data + NSPersistentCloudKitContainer
├── Models/
│   └── AgriVisitPro.xcdatamodeld/              # Modello Core Data (entità Visita)
│       ├── .xccurrentversion
│       └── AgriVisitPro.xcdatamodel/
│           └── contents                         # XML con la definizione dell'entità
├── Views/
│   ├── ContentView.swift                        # View principale (navigazione)
│   ├── VisitaListView.swift                     # Lista visite con VisitaRowView
│   ├── NuovaVisitaView.swift                    # Form per aggiungere una visita
│   └── VisitaDetailView.swift                   # Dettaglio e modifica visita
└── Extensions/
    └── Visita+Extensions.swift                  # Proprietà/metodi di utilità sull'entità
```

---

## Configurazione del progetto in Xcode (passo per passo)

### 1. Crea un nuovo progetto Xcode

1. Apri Xcode → **File › New › Project**
2. Scegli la categoria **Multiplatform** → **App**
3. Configura:
   - **Product Name**: `AgriVisitPro`
   - **Team**: il tuo Apple Developer account
   - **Organization Identifier**: `com.tuazienda` (es. `com.mariorossi`)
   - **Bundle Identifier**: verrà generato automaticamente (es. `com.tuazienda.AgriVisitPro`)
   - **Interface**: SwiftUI
   - **Language**: Swift
   - **Storage**: None (aggiungeremo Core Data manualmente)
4. Clicca **Next** e scegli dove salvare il progetto

### 2. Aggiungi i file Swift del progetto

1. Elimina i file di default creati da Xcode (`ContentView.swift`, ecc.)
2. Trascina nella sidebar di Xcode tutti i file `.swift` di questa repository:
   - `AgriVisitProApp.swift`
   - `Persistence.swift`
   - `Views/ContentView.swift`
   - `Views/VisitaListView.swift`
   - `Views/NuovaVisitaView.swift`
   - `Views/VisitaDetailView.swift`
   - `Extensions/Visita+Extensions.swift`
3. Trascina anche la cartella `Models/AgriVisitPro.xcdatamodeld` nel progetto
4. Assicurati che tutti i file abbiano il target sia **iOS** che **macOS** selezionato

### 3. Abilita il modello Core Data

1. Seleziona il file `AgriVisitPro.xcdatamodeld` nella sidebar
2. Verifica che l'entità **Visita** e tutti i suoi attributi siano presenti:
   - `id` (UUID)
   - `nomeAllevamento` (String)
   - `dataVisita` (Date)
   - `tipo` (String)
   - `argomento` (String)
   - `note` (String, opzionale)
   - `annullata` (Boolean)
3. Verifica che **Codegen** sia impostato su `Class Definition` per l'entità Visita

### 4. Configura le Capabilities per iCloud

> **Prerequisito**: devi avere un account Apple Developer attivo (gratuito non supporta iCloud).

#### 4a. Seleziona il target principale
1. Clicca sul nome del progetto nella sidebar (icona blu)
2. Seleziona il target **AgriVisitPro** (non i target iOS/macOS separati)

#### 4b. Aggiungi iCloud
1. Vai alla tab **Signing & Capabilities**
2. Clicca **+ Capability** (pulsante in alto a sinistra)
3. Cerca e aggiungi **iCloud**
4. Nella sezione iCloud che appare, seleziona:
   - ✅ **CloudKit**
5. Clicca **+** sotto "Containers" e crea un container:
   - Nome suggerito: `iCloud.com.tuazienda.AgriVisitPro`
   - Questo nome deve essere **unico a livello globale**

#### 4c. Aggiungi Background Modes (solo iOS)
1. Sempre in **Signing & Capabilities**, clicca **+ Capability**
2. Aggiungi **Background Modes**
3. Seleziona:
   - ✅ **Remote notifications** (necessario per ricevere aggiornamenti iCloud in background)

### 5. Configura il container iCloud in Persistence.swift

Apri `Persistence.swift` e, se necessario, specifica l'identificatore del container CloudKit:

```swift
// Nel init di PersistenceController, dopo aver creato il container:
if let description = container.persistentStoreDescriptions.first {
    description.cloudKitContainerOptions = NSPersistentCloudKitContainerOptions(
        containerIdentifier: "iCloud.com.tuazienda.AgriVisitPro"
    )
}
```

> **Nota**: Se il container è quello di default (uguale al Bundle ID), questa riga non è necessaria.

### 6. Configura l'entitlements file

Xcode dovrebbe generarlo automaticamente, ma verifica che esista il file `AgriVisitPro.entitlements` con:

```xml
<key>com.apple.developer.icloud-container-identifiers</key>
<array>
    <string>iCloud.com.tuazienda.AgriVisitPro</string>
</array>
<key>com.apple.developer.icloud-services</key>
<array>
    <string>CloudKit</string>
</array>
```

### 7. Build & Run

1. Seleziona un simulatore iPhone o Mac come destinazione
2. Premi **⌘ + R** per avviare l'app
3. Per testare la sincronizzazione:
   - Accedi con lo stesso Apple ID sul simulatore iPhone e su un simulatore iPad (o Mac)
   - Aggiungi una visita su un dispositivo: dovrebbe apparire sull'altro entro pochi secondi

---

## Note importanti

### Sincronizzazione iCloud
- La sincronizzazione non è istantanea: possono volerci alcuni secondi
- Il simulatore iOS supporta iCloud solo se hai effettuato il login con un Apple ID valido
- Su dispositivi reali la sincronizzazione è più affidabile

### Annullamento vs Eliminazione
- **Annullare** una visita imposta `annullata = true` ma mantiene il record nel database
- **Eliminare** (swipe-to-delete nella lista) rimuove definitivamente il record
- Le visite annullate sono visibili in lista con testo barrato e badge rosso "ANNULLATA"

### Modifica visita
- Dalla schermata di dettaglio, premi **Modifica** per abilitare la modifica dei campi
- Premi **Fine** per salvare o **Annulla** per scartare le modifiche

---

## Requisiti di sistema

- **Xcode**: 15.0 o superiore
- **iOS**: 17.0 o superiore
- **macOS**: 14.0 (Sonoma) o superiore
- **Swift**: 5.9 o superiore
- **Apple Developer Account**: necessario per iCloud/CloudKit
