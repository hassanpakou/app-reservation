import { db } from './firebase.js';
import { collection, addDoc, getDocs, setDoc, doc, getDoc } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';

export async function initFirestore(adminUid) {
  try {
    // Initialiser categories
    const categoriesSnapshot = await getDocs(collection(db, 'categories'));
    if (categoriesSnapshot.empty) {
      const categories = ['Concert', 'Théâtre', 'Projection'];
      for (const category of categories) {
        await addDoc(collection(db, 'categories'), { name: category });
      }
      console.log('Categories initialized');
    } else {
      console.log('Categories already exist');
    }

    // Initialiser events
    const eventsSnapshot = await getDocs(collection(db, 'events'));
    let eventId = null;
    if (eventsSnapshot.empty) {
      const events = [
        {
          name: 'Concert de Rock',
          date: '2025-06-01T20:00:00Z', // Futur
          location: 'Paris, France',
          seats: 100,
          price: 50,
          vipPrice: 20,
          category: 'Concert',
          createdAt: new Date().toISOString()
        },
        {
          name: 'Pièce de Théâtre',
          date: '2025-05-01T19:00:00Z', // Passé (pour tester l'expiration)
          location: 'Lyon, France',
          seats: 50,
          price: 30,
          vipPrice: 0,
          category: 'Théâtre',
          createdAt: new Date().toISOString()
        }
      ];
      for (const event of events) {
        const eventRef = await addDoc(collection(db, 'events'), event);
        if (!eventId) eventId = eventRef.id; // Sauvegarder le premier ID d'événement
      }
      console.log('Events initialized');
    } else {
      console.log('Events already exist');
      const firstEvent = eventsSnapshot.docs[0];
      eventId = firstEvent.id; // Utiliser un ID existant
    }

    // Initialiser reservations
    const reservationsSnapshot = await getDocs(collection(db, 'reservations'));
    if (reservationsSnapshot.empty && eventId) {
      const reservations = [
        {
          userId: adminUid,
          eventId: eventId,
          isVIP: false,
          price: 50,
          status: 'confirmée',
          paymentType: 'complet',
          createdAt: new Date().toISOString()
        }
      ];
      for (const reservation of reservations) {
        await addDoc(collection(db, 'reservations'), reservation);
      }
      console.log('Reservations initialized');
    } else {
      console.log('Reservations already exist');
    }

    // Vérifier et mettre à jour users (s'assurer que l'admin existe)
    const userDoc = await getDoc(doc(db, 'users', adminUid));
    if (!userDoc.exists()) {
      await setDoc(doc(db, 'users', adminUid), {
        email: 'admin@example.com',
        role: 'admin',
        createdAt: new Date().toISOString()
      });
      console.log('Admin user initialized');
    } else if (userDoc.data().role !== 'admin') {
      await setDoc(doc(db, 'users', adminUid), { role: 'admin' }, { merge: true });
      console.log('User role updated to admin');
    } else {
      console.log('Admin user already exists');
    }

    console.log('Firestore initialization completed');
  } catch (error) {
    console.error('Error initializing Firestore:', error);
    throw error;
  }
}
