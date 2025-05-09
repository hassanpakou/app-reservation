# TicketMaster

TicketMaster est une application web de gestion d'événements permettant aux utilisateurs de réserver des billets pour des événements, aux organisateurs de créer et valider des événements, et aux administrateurs de gérer les utilisateurs et les catégories. L'application utilise **Firebase** pour l'authentification et la gestion des données, **Bootstrap 5** pour un design moderne et responsive, et intègre des fonctionnalités comme le scan de QR codes pour la validation des réservations.

## Table des matières
- [Fonctionnalités](#fonctionnalités)
- [Technologies utilisées](#technologies-utilisées)
- [Structure du projet](#structure-du-projet)
- [Installation](#installation)
- [Utilisation](#utilisation)
- [Test](#test)
- [Dépannage](#dépannage)
- [Contributeurs](#contributeurs)
- [Licence](#licence)

## Fonctionnalités

### Utilisateur
- **Connexion/Inscription** : Création de compte et connexion via email/mot de passe.
- **Réservation d'événements** : Filtrage et réservation d'événements avec choix du type de billet (standard/VIP) et du mode de paiement (complet/acompte).
- **Gestion des réservations** : Affichage des réservations et possibilité de compléter un paiement partiel.
- **QR Code** : Génération d'un QR code téléchargeable après paiement complet pour valider l'entrée.

### Organisateur
- **Création d'événements** : Ajout d'événements avec nom, date, lieu, nombre de places, prix, et catégorie.
- **Validation des réservations** : Scan de QR codes pour valider les entrées aux événements.
- **Gestion des réservations** : Affichage des réservations à valider.

### Administrateur
- **Gestion des utilisateurs** : Création, modification, et suppression des utilisateurs avec rôles (utilisateur, organisateur, admin).
- **Gestion des événements** : Création d'événements similaires à ceux des organisateurs.
- **Initialisation** : Initialisation des catégories d'événements et de la base de données Firestore.

## Technologies utilisées
- **Frontend** :
  - **HTML5**, **CSS3**, **JavaScript (ES6)** pour la structure et l'interactivité.
  - **Bootstrap 5.3.0** pour un design responsive et moderne.
  - **Poppins (Google Fonts)** pour une typographie professionnelle.
  - **QRCode.js** et **jsQR** pour la génération et le scan de QR codes.
- **Backend** :
  - **Firebase 10.12.2** :
    - **Authentication** pour la gestion des utilisateurs.
    - **Firestore** pour le stockage des données (événements, réservations, utilisateurs, catégories).
- **Autres** :
  - **Node.js** pour le serveur local de développement.
  - **NPM** pour la gestion des dépendances.

## Structure du projet

```
TicketMaster/
├── assets/
│   └── tp.png              # Logo de l'application
├── css/
│   └── style.css           # Styles personnalisés pour surcharger Bootstrap
├── js/
│   ├── auth.js             # Gestion des utilisateurs (création, mise à jour, suppression)
│   ├── events.js           # Gestion des événements (chargement, filtrage, réservation)
│   ├── firebase.js         # Configuration de Firebase
│   ├── initCategories.js   # Initialisation des catégories
│   ├── initFirestore.js    # Initialisation de Firestore
│   └── reservations.js     # Gestion des réservations et scan de QR codes
├── index.html              # Page principale (tableau de bord)
├── login.html              # Page de connexion/inscription
├── firestore.rules         # Règles de sécurité Firestore
├── package.json            # Configuration du projet Node.js
└── README.md               # Documentation du projet
```

### Description des fichiers
- **`index.html`** : Tableau de bord principal avec trois sections (utilisateur, organisateur, admin) basées sur le rôle de l'utilisateur. Inclut des modales pour la réservation, le paiement, et la gestion des utilisateurs.
- **`login.html`** : Page de connexion et d'inscription avec formulaires pour email/mot de passe.
- **`css/style.css`** : Styles personnalisés pour améliorer le design Bootstrap (palette de couleurs, transitions, typographie).
- **`assets/tp.png`** : Logo affiché dans la barre de navigation, le favicon, et la page de connexion.
- **`js/auth.js`** : Logique pour la création, la mise à jour, et la suppression des utilisateurs.
- **`js/events.js`** : Fonctions pour charger, filtrer, et réserver des événements.
- **`js/firebase.js`** : Configuration de Firebase (initialisation de l'app, auth, et Firestore).
- **`js/initCategories.js`** : Initialisation des catégories d'événements (ex. : concert, théâtre).
- **`js/initFirestore.js`** : Initialisation des collections Firestore.
- **`js/reservations.js`** : Gestion des réservations, validation via QR code, et complément de paiement.
- **`firestore.rules`** : Règles de sécurité pour Firestore, définissant les permissions d'accès.

## Installation

### Prérequis
- **Node.js** (v16 ou supérieur) : [Télécharger](https://nodejs.org/)
- **Navigateur moderne** (Chrome, Firefox, Edge)
- Compte **Firebase** avec un projet configuré :
  - Activer **Authentication** (méthode email/mot de passe).
  - Activer **Firestore** et configurer les règles via `firestore.rules`.

### Étapes
1. **Cloner le dépôt** :
   ```bash
   git clone https://github.com/examenL2/App-reservation-de-billet.git
   cd TicketMaster
   ```

2. **Installer les dépendances** :
   ```bash
   npm install
   ```

3. **Configurer Firebase** :
   - Créer un projet Firebase sur [Firebase Console](https://console.firebase.google.com/).
   - Copier les informations de configuration (API key, project ID, etc.) dans `js/firebase.js`.
   - Exemple de `firebase.js` :
     ```javascript
     import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
     import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';

     const firebaseConfig = {
       apiKey: "votre-api-key",
       authDomain: "votre-auth-domain",
       projectId: "votre-project-id",
       storageBucket: "votre-storage-bucket",
       messagingSenderId: "votre-sender-id",
       appId: "votre-app-id"
     };

     const app = initializeApp(firebaseConfig);
     export const db = getFirestore(app);
     ```
   - Déployer les règles Firestore :
     ```bash
     firebase deploy --only firestore:rules
     ```

4. **Démarrer le serveur local** :
   ```bash
   npm start
   ```
   L'application sera accessible à `http://localhost:3000`.

5. **Vérifier les ressources** :
   - S'assurer que `assets/tp.png` est dans le dossier `assets/`.
   - Vérifier que les CDN (Bootstrap, Firebase, QRCode, jsQR) sont accessibles.

## Utilisation

1. **Accéder à l'application** :
   - Ouvrir `http://localhost:3000/login.html` dans un navigateur.
   - S'inscrire avec un email et un mot de passe, ou se connecter si un compte existe.

2. **Rôles et fonctionnalités** :
   - **Utilisateur** :
     - Filtrer et réserver des événements (standard/VIP, paiement complet/acompte).
     - Afficher les réservations et compléter les paiements.
     - Télécharger un QR code après paiement complet.
   - **Organisateur** :
     - Créer des événements (nom, date, lieu, prix, etc.).
     - Scanner des QR codes pour valider les réservations.
     - Afficher les réservations en attente de validation.
   - **Administrateur** :
     - Créer/modifier/supprimer des utilisateurs.
     - Créer des événements.
     - Initialiser les catégories et Firestore.

3. **Navigation** :
   - La barre de navigation affiche le logo et un bouton "Déconnexion".
   - Les sections sont affichées dynamiquement selon le rôle de l'utilisateur.

## Test

### Étapes de test
1. **Page de connexion (`login.html`)** :
   - Vérifier que le logo s'affiche en haut avec "TicketMaster".
   - Tester l'inscription et la connexion avec des identifiants valides/invalides.
   - Confirmer la redirection vers `index.html` après connexion.

2. **Tableau de bord (`index.html`)** :
   - **Utilisateur** :
     - Filtrer les événements par catégorie, date, ou lieu.
     - Réserver un événement (ex. : 3 places, VIP, acompte).
     - Vérifier que le prix total est correct dans la modale.
     - Compléter un paiement et télécharger le QR code.
   - **Organisateur** :
     - Créer un événement et vérifier son affichage dans la liste.
     - Scanner un QR code généré pour valider une réservation.
   - **Administrateur** :
     - Créer un utilisateur avec le rôle "organisateur".
     - Initialiser les catégories et vérifier leur affichage dans les formulaires.
     - Modifier un utilisateur et supprimer un compte.

3. **Design** :
   - Vérifier le favicon (`assets/tp.png`) dans l'onglet du navigateur.
   - Confirmer que la palette de couleurs (bleu foncé, bleu clair, gris clair) est cohérente.
   - Tester la responsivité sur mobile (réduire la fenêtre ou utiliser l'émulateur).

4. **Console** :
   - Ouvrir les outils de développement (F12) > Console.
   - Vérifier l'absence d'erreurs (ex. : `Failed to load resource`).
   - Confirmer les journaux comme `QRCode loaded`, `User role: user`.

### Exemple de test utilisateur
```bash
# Se connecter
Ouvrir http://localhost:3000/login.html
S'inscrire : email=test@exemple.com, mot de passe=123456
Se connecter avec les mêmes identifiants

# Réserver un événement
Filtrer les événements avec "concert"
Cliquer sur "Réserver" pour un événement
Dans la modale :
  - Nombre de places : 3
  - Type de billet : VIP
  - Paiement : Acompte (100$)
Valider et vérifier que la réservation apparaît dans "Mes Réservations"
Compléter le paiement restant et télécharger le QR code
```

## Dépannage

### Problèmes courants
1. **Le logo ne s'affiche pas** :
   - Vérifier que `assets/tp.png` est dans `assets/`.
   - Tester l'URL : `http://localhost:3000/assets/tp.png`.
   - Vérifier la console pour les erreurs 404.

2. **Firebase ne fonctionne pas** :
   - Confirmer que `js/firebase.js` contient les bonnes clés.
   - Vérifier les règles Firestore dans `firestore.rules`.
   - Tester la connexion réseau dans la console Firebase.

3. **Le design n'est pas appliqué** :
   - Vérifier que `css/style.css` est chargé (onglet Network).
   - Confirmer que Google Fonts (Poppins) est accessible.
   - Vider le cache du navigateur (`Ctrl + Shift + R`).

4. **Les boutons/formulaires ne répondent pas** :
   - Vérifier la console pour les erreurs JavaScript.
   - Confirmer que les identifiants (`id`) n'ont pas été modifiés.
   - Tester manuellement, ex. :
     ```javascript
     document.getElementById('filter-btn').click();
     ```

5. **Problèmes de QR code** :
   - Vérifier que `QRCode.js` et `jsQR` sont chargés (console : `QRCode loaded`).
   - Tester avec un autre navigateur si le scan échoue.
   - Vérifier les permissions de la caméra pour le scan.

### Signaler un problème
Fournir :
- Messages d'erreur de la console.
- Détails de l'onglet Network (ressources manquantes).
- Captures d'écran de l'interface.
- Étapes pour reproduire le problème.

## Contributeurs
- **Développeur principal** : PHAKU PHAKU Netsor Hassan dalmo
- **Contributions** : Design, développement, documentation.

Pour contribuer :
1. Forker le dépôt.
2. Créer une branche (`git checkout -b feature/nom-de-fonctionnalité`).
3. Commiter les changements (`git commit -m "Ajouter fonctionnalité X"`).
4. Pusher (`git push origin feature/nom-de-fonctionnalité`).
5. Créer une Pull Request.

## Licence
Ce projet est sous licence **MIT**. Voir le fichier `LICENSE` pour plus de détails.

---
*Dernière mise à jour : 9 mai 2025*

