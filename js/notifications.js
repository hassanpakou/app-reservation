import { getFirestore, collection, getDocs, doc, deleteDoc } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';

const db = getFirestore();

export function startNotifications() {
  setInterval(async () => {
    const now = new Date();
    const reservationsSnapshot = await getDocs(collection(db, 'reservations'));
    reservationsSnapshot.forEach(async doc => {
      const reservation = doc.data();
      if (reservation.paymentType === 'acompte' && reservation.status === 'en attente') {
        const dueDate = new Date(reservation.createdAt);
        dueDate.setDate(dueDate.getDate() + 7);
        const timeDiff = dueDate - now;
        if (timeDiff <= 24 * 60 * 60 * 1000 && timeDiff > 0) {
          alert('Rappel: Paiement du solde requis pour la réservation ' + doc.id);
        } else if (timeDiff <= 0) {
          await deleteDoc(doc(db, 'reservations', doc.id));
          alert('Réservation ' + doc.id + ' annulée (acompte non payé)');
        }
      }
    });

    const eventsSnapshot = await getDocs(collection(db, 'events'));
    eventsSnapshot.forEach(doc => {
      const event = doc.data();
      const eventDate = new Date(event.date);
      const timeDiff = eventDate - now;
      if (timeDiff <= 24 * 60 * 60 * 1000 && timeDiff > 0) {
        alert('Rappel: Événement ' + event.name + ' dans 24h');
      }
    });
  }, 60000);
}