import { db } from './firebase.js';
import { collection, getDocs, query, where, addDoc, getDoc, doc, setDoc } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';

export async function loadEvents() {
  const eventList = document.getElementById('event-list');
  eventList.innerHTML = '';
  const eventsSnapshot = await getDocs(collection(db, 'events'));
  eventsSnapshot.forEach(doc => {
    const event = doc.data();
    const eventDate = new Date(event.date);
    const isExpired = eventDate < new Date();
    const isDisabled = event.seats <= 0 || isExpired;
    const buttonText = isExpired ? 'Événement expiré' : (event.seats <= 0 ? 'Aucune place disponible' : 'Réserver');
    eventList.innerHTML += `
      <div class="col-md-6">
        <div class="card mb-3">
          <div class="card-body">
            <h5 class="card-title">${event.name}</h5>
            <p class="card-text">Date: ${eventDate.toLocaleString()}</p>
            <p class="card-text">Lieu: ${event.location}</p>
            <p class="card-text">Prix: ${event.price}€ ${event.vipPrice > 0 ? `(VIP: +${event.vipPrice}€)` : ''}</p>
            <p class="card-text">Places: ${event.seats}</p>
            <button class="btn btn-primary reserve-btn" data-event-id="${doc.id}" data-price="${event.price}" data-vip-price="${event.vipPrice}" ${isDisabled ? 'disabled' : ''}>${buttonText}</button>
          </div>
        </div>
      </div>
    `;
  });

  // Ajouter les écouteurs d'événements pour les boutons de réservation
  document.querySelectorAll('.reserve-btn').forEach(button => {
    button.addEventListener('click', () => {
      if (!button.disabled) {
        const eventId = button.dataset.eventId;
        const standardPrice = parseFloat(button.dataset.price);
        const vipPrice = parseFloat(button.dataset.vipPrice);
        setReservationEventId(eventId, standardPrice, vipPrice);
      }
    });
  });
}

export async function filterEvents() {
  const filter = document.getElementById('event-filter').value.toLowerCase();
  const eventList = document.getElementById('event-list');
  eventList.innerHTML = '';
  const q = query(collection(db, 'events'), where('name', '>=', filter), where('name', '<=', filter + '\uf8ff'));
  const eventsSnapshot = await getDocs(q);
  eventsSnapshot.forEach(doc => {
    const event = doc.data();
    const eventDate = new Date(event.date);
    const isExpired = eventDate < new Date();
    const isDisabled = event.seats <= 0 || isExpired;
    const buttonText = isExpired ? 'Événement expiré' : (event.seats <= 0 ? 'Aucune place disponible' : 'Réserver');
    eventList.innerHTML += `
      <div class="col-md-6">
        <div class="card mb-3">
          <div class="card-body">
            <h5 class="card-title">${event.name}</h5>
            <p class="card-text">Date: ${eventDate.toLocaleString()}</p>
            <p class="card-text">Lieu: ${event.location}</p>
            <p class="card-text">Prix: ${event.price}€ ${event.vipPrice > 0 ? `(VIP: +${event.vipPrice}€)` : ''}</p>
            <p class="card-text">Places: ${event.seats}</p>
            <button class="btn btn-primary reserve-btn" data-event-id="${doc.id}" data-price="${event.price}" data-vip-price="${event.vipPrice}" ${isDisabled ? 'disabled' : ''}>${buttonText}</button>
          </div>
        </div>
      </div>
    `;
  });

  // Ajouter les écouteurs d'événements pour les boutons de réservation
  document.querySelectorAll('.reserve-btn').forEach(button => {
    button.addEventListener('click', () => {
      if (!button.disabled) {
        const eventId = button.dataset.eventId;
        const standardPrice = parseFloat(button.dataset.price);
        const vipPrice = parseFloat(button.dataset.vipPrice);
        setReservationEventId(eventId, standardPrice, vipPrice);
      }
    });
  });
}

export async function reserveEvent(userId, eventId, ticketType, price, paymentType, acompteAmount, numberOfSeats) {
  try {
    const eventDoc = await getDoc(doc(db, 'events', eventId));
    if (!eventDoc.exists()) throw new Error('Événement introuvable');
    const event = eventDoc.data();
    const eventDate = new Date(event.date);
    if (eventDate < new Date()) throw new Error('Réservation expirée');
    const isVIP = ticketType === 'vip';
    if (isVIP && (!event.vipPrice || event.vipPrice <= 0)) {
      throw new Error('Option VIP non disponible pour cet événement');
    }
    if (numberOfSeats <= 0) throw new Error('Le nombre de places doit être supérieur à 0');
    if (numberOfSeats > event.seats) throw new Error('Nombre de places demandé supérieur aux places disponibles');
    const pricePerTicket = isVIP ? event.price + event.vipPrice : event.price;
    const finalPrice = pricePerTicket * numberOfSeats;
    if (finalPrice !== price) throw new Error('Erreur de calcul du prix total');
    if (paymentType === 'acompte' && (!acompteAmount || acompteAmount <= 0 || acompteAmount > finalPrice)) {
      throw new Error('Montant de l\'acompte invalide');
    }

    const reservationData = {
      userId,
      eventId,
      isVIP,
      price: finalPrice,
      numberOfSeats,
      status: 'confirmée',
      paymentType,
      paidAmount: paymentType === 'acompte' ? acompteAmount : finalPrice,
      createdAt: new Date().toISOString()
    };

    const reservationRef = await addDoc(collection(db, 'reservations'), reservationData);
    await setDoc(doc(db, 'events', eventId), { seats: event.seats - numberOfSeats }, { merge: true });
    return reservationRef.id;
  } catch (error) {
    console.error('Error in reserveEvent:', error);
    throw error;
  }
}

export function setReservationEventId(eventId, standardPrice, vipPrice) {
  document.getElementById('reservation-event-id').value = eventId;
  document.getElementById('number-of-seats').value = 1;
  document.getElementById('ticket-type').value = 'standard';
  document.getElementById('ticket-price').value = standardPrice;
  document.getElementById('payment-type').value = 'complet';
  document.getElementById('acompte-input-group').style.display = 'none';
  document.getElementById('qrcode-container').style.display = 'none';
  // Afficher/masquer l'option VIP selon vipPrice
  const vipOption = document.querySelector('#ticket-type option[value="vip"]');
  if (vipPrice > 0) {
    vipOption.style.display = 'block';
  } else {
    vipOption.style.display = 'none';
  }
  const modal = new bootstrap.Modal(document.getElementById('reservationModal'));
  modal.show();
}
