# Frontend

# Struktur & Wo kommt was hin:

>## app/ = nur Routing / Pfade / Page-Wrapper (möglichst wenig Logik)
    - Locale aus Params holen
    - Feature-Page importieren
    - <FeaturePage locale={locale} /> rendern


>## src/features/ = Feature-Logik + UI pro Produktbereich (Checker, FAQ, …)
    Was gehört hier rein?
    - Page-Komponenten für das Feature (z. B. ComplianceCheckerPage.tsx)
    - Steps/Flows (Formular-Schritte)
    - Feature-spezifische Helper, Types, Hooks
    - Feature-spezifische API-Clients (für Backend!)


>## src/components/ = wiederverwendbare UI/Layouts/Navigation-Komponenten 
    Regel: Alles, was mehrere Features brauchen (oder “Design System”) gehört hier hin.

    - /ui/* (Buttons, Input, Card, ...)
    - /layout/* (Container, Section, ...)
    - /navigation/* (MobileSidebar, Header)
    - /cookie/ cookie consent komponente


>## src/messages/ = Übersetzungen & Content pro Sprache (next-intl)
    Wichtig: Das ist der Kern eurer “statischen” Inhalte: alles was Text/Content ist, soll hier landen, nicht hardcoded in TSX.

>## src/i18n/ = next-intl Setup --> Mehrsprachigkeit
    - src/i18n/locales.ts = welche Sprachen es gibt, Default-Locale 
    - src/i18n/bundles.ts = welche “Namespaces” pro Page/Feature geladen werden 
    - src/i18n/request.ts = next-intl request config (Message Loading)

>## src/navigation/ = zentrale Routen/Link-Builder
    - src/navigation/nav.ts (Navigation-Items / Menüs) 
    - src/navigation/routes.ts (Route-Definitionen) 
    - src/navigation/route-alias.ts (Aliases / Hrefs)

> ## src/seo/ + src/messages/**/seo/routes.json = SEO-Metadaten pro Route

>## Sytling: gloabl vs component level
    Global: Tokens, Resets, Layout-Grundregeln → src/styles/*
    Komponenten-spezifisch: *.module.css direkt neben der Komponente



# Wie neue Seite hinzufügen?
    z.b neue Feature-Seite: /tools/foo

    ## 1. Feature anlegen
        1.1 src/features/foo/ erstellen
        1.2 FooPage.tsx (oder ähnlich) dort rein --> css wenn nur spezifisch für die Seite dann FooPage.module.css anlegen 
        1.3 Page Texte unter src/messages/pages/foo.json erstellen & dann unter src/i18n/bundles hinzufügen (siehe unten für details)

    ## 2. Route in app erstellen
        unter app/[locale]/foo/page.tsx
        --> Inhalt: nur import + rendern, keine Logik!

    ## 3. Navigation/Links erweitern
        3.1 In src/navigation/nav.ts neuen Link ins passende Menü
        3.2 Labels in src/messages/*/common/items.json ergänzen (z. B. "foo": "Foo")

    ## 4. SEO-Routen erweitern:
        SEO-Routen-Metadaten liegen in:
            src/messages/<locale>/seo/routes.json

        --> Neue Seite → neuen Key in seo/routes.json pro Sprache anlegen.

# Multi-Languages
    ### Wo liegen Übersetzungen?
    Unter src/messages/<locale>/... in klaren Bereichen (common/pages/sections/legal/components/seo). 

    #### Beispiele “common”:
    common/navigation.json (ARIA, Menütexte) 
    navigation
    common/actions.json (Buttons: Weiter/Zurück/…) 
    actions
    common/labels.json (Ja/Nein/Status etc.) 
    labels

    ## Wie werden Bundles geladen?
    Über src/i18n/bundles.ts (dort wird festgelegt, welche JSONs eine Seite/Feature braucht). 
    Regel:
    Globales Zeug (Navigation, Buttons, Labels) → immer/fast immer laden
    Feature-spezifisches Zeug (Checker-Form, Result-Labels) → nur im Feature-Bundle laden

    ## Neue Sprache hinzufügen
    src/messages/<neue-locale>/ kopieren (z. B. von de/) und übersetzen 
    src/i18n/locales.ts erweitern (Locale hinzufügen) 
    Sicherstellen, dass eure Bundles (bundles.ts) die neuen Locale-Dateien auch auflösen können

# Wo Texte für komponente ablegen? Content vs UI:
    Beispiel Checker:
    UI/Komponenten: src/features/complianceChecker/*
    Form-Fragen/Optionen/Copy: src/messages/<locale>/sections/complianceChecker.form.json 

    Ergebnis-Texte/Disclaimer/Klassifikationen: src/messages/<locale>/sections/complianceResult.*.json z. B. Disclaimer