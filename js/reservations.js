import { db } from './firebase.js';
import { collection, getDocs, query, where, doc, updateDoc, getDoc } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';

// Fonction pour attendre que QRCode soit chargé
async function waitForQRCode() {
  if (typeof QRCode === 'function') return QRCode;
  return new Promise((resolve, reject) => {
    const interval = setInterval(() => {
      if (typeof QRCode === 'function') {
        clearInterval(interval);
        resolve(QRCode);
      }
    }, 100);
    setTimeout(() => {
      clearInterval(interval);
      reject(new Error('Bibliothèque QRCode non chargée après le délai d\'attente'));
    }, 5000);
  });
}

export async function loadReservations(userId) {
  const reservationList = document.getElementById('reservation-list');
  const pendingPayments = document.getElementById('pending-payments');
  reservationList.innerHTML = '';
  pendingPayments.innerHTML = '';
  const q = query(collection(db, 'reservations'), where('userId', '==', userId));
  const reservationsSnapshot = await getDocs(q);
  reservationsSnapshot.forEach(async (doc) => {
    const reservation = doc.data();
    const isFullyPaid = reservation.paymentType === 'complet' || (reservation.paidAmount && reservation.paidAmount >= reservation.price);
    const paymentStatus = reservation.paymentType === 'acompte' ? `Acompte: ${reservation.paidAmount || 0}€ / ${reservation.price}€` : 'Paiement complet';
    reservationList.innerHTML += `
      <div class="card mb-2">
        <div class="card-body">
          <p>Événement: ${reservation.eventId}</p>
          <p>Places réservées: ${reservation.numberOfSeats || 1}</p>
          <p>Prix: ${reservation.price}€ (${reservation.isVIP ? 'VIP' : 'Standard'})</p>
          <p>Statut: ${reservation.status}</p>
          <p>Paiement: ${paymentStatus}</p>
          ${isFullyPaid ? `
            <div id="qrcode-${doc.id}" class="mb-2"></div>
            <button class="btn btn-secondary download-qr-btn" data-reservation-id="${doc.id}">Télécharger QR Code</button>
          ` : ''}
        </div>
      </div>
    `;
    if (!isFullyPaid) {
      pendingPayments.innerHTML += `
        <div class="card mb-2">
          <div class="card-body">
            <p>Événement: ${reservation.eventId}</p>
            <p>Places réservées: ${reservation.numberOfSeats || 1}</p>
            <p>Montant restant: ${(reservation.price - (reservation.paidAmount || 0)).toFixed(2)}€</p>
            <button class="btn btn-primary complete-payment-btn" data-reservation-id="${doc.id}" data-remaining="${reservation.price - (reservation.paidAmount || 0)}">Compléter le Paiement</button>
          </div>
        </div>
      `;
    }
    // Générer le QR code si paiement complet
    if (isFullyPaid) {
      try {
        const QRCodeLib = await waitForQRCode();
        new QRCodeLib(document.getElementById(`qrcode-${doc.id}`), {
          text: doc.id,
          width: 128,
          height: 128
        });
      } catch (error) {
        console.error('Erreur lors de la génération du QR code:', error);
        document.getElementById(`qrcode-${doc.id}`).textContent = 'Erreur: Impossible de générer le code QR.';
      }
    }
  });

  // Ajouter les écouteurs d'événements pour les boutons de téléchargement
  reservationList.addEventListener('click', (e) => {
    if (e.target.classList.contains('download-qr-btn')) {
      const reservationId = e.target.dataset.reservationId;
      const qrCanvas = document.querySelector(`#qrcode-${reservationId} canvas`);
      if (qrCanvas) {
        const link = document.createElement('a');
        link.href = qrCanvas.toDataURL('image/png');
        link.download = `qrcode-reservation-${reservationId}.png`;
        link.click();
      } else {
        document.getElementById('error-message').textContent = 'Erreur: Code QR non généré.';
        document.getElementById('error-message').style.display = 'block';
        setTimeout(() => document.getElementById('error-message').style.display = 'none', 5000);
      }
    }
  });

  // Ajouter les écouteurs d'événements pour les boutons de complément de paiement
  pendingPayments.addEventListener('click', (e) => {
    if (e.target.classList.contains('complete-payment-btn')) {
      const reservationId = e.target.dataset.reservationId;
      const remaining = parseFloat(e.target.dataset.remaining);
      document.getElementById('complete-payment-reservation-id').value = reservationId;
      document.getElementById('remaining-amount').value = remaining.toFixed(2);
      document.getElementById('payment-amount').value = '';
      document.getElementById('qrcode-complete-container').style.display = 'none';
      const modal = new bootstrap.Modal(document.getElementById('completePaymentModal'));
      modal.show();
    }
  });
}

export async function loadOrganizerReservations() {
  const organizerReservations = document.getElementById('organizer-reservations');
  organizerReservations.innerHTML = '';
  const reservationsSnapshot = await getDocs(collection(db, 'reservations'));
  reservationsSnapshot.forEach(doc => {
    const reservation = doc.data();
    const isValidated = reservation.status === 'validée';
    const buttonText = isValidated ? 'Déjà validé' : 'Valider';
    const buttonClass = isValidated ? 'btn-secondary disabled' : 'btn-success';
    const paymentStatus = reservation.paymentType === 'acompte' ? `Acompte: ${reservation.paidAmount || 0}€ / ${reservation.price}€` : 'Paiement complet';
    organizerReservations.innerHTML += `
      <div class="card mb-2">
        <div class="card-body">
          <p>Utilisateur: ${reservation.userId}</p>
          <p>Événement: ${reservation.eventId}</p>
          <p>Places réservées: ${reservation.numberOfSeats || 1}</p>
          <p>Statut: ${reservation.status}</p>
          <p>Paiement: ${paymentStatus}</p>
          <button class="btn ${buttonClass} validate-reservation-btn" data-reservation-id="${doc.id}" ${isValidated ? 'disabled' : ''}>${buttonText}</button>
        </div>
      </div>
    `;
  });

  // Ajouter les écouteurs d'événements pour les boutons de validation
  organizerReservations.addEventListener('click', (e) => {
    if (e.target.classList.contains('validate-reservation-btn') && !e.target.disabled) {
      const reservationId = e.target.dataset.reservationId;
      validateReservation(reservationId);
    }
  });
}

export async function validateReservation(reservationId) {
  try {
    const reservationDoc = await getDoc(doc(db, 'reservations', reservationId));
    if (!reservationDoc.exists()) throw new Error('Réservation introuvable');
    const reservation = reservationDoc.data();
    if (reservation.status === 'validée') throw new Error('Réservation déjà validée');
    if (reservation.paymentType === 'acompte' && (reservation.paidAmount || 0) < reservation.price) {
      throw new Error('Le paiement doit être complété avant validation.');
    }
    await updateDoc(doc(db, 'reservations', reservationId), { status: 'validée' });
    const infoDiv = document.getElementById('info-message');
    infoDiv.textContent = 'Réservation validée avec succès';
    infoDiv.style.display = 'block';
    setTimeout(() => infoDiv.style.display = 'none', 5000);
    await loadOrganizerReservations(); // Recharger pour mettre à jour l'affichage
  } catch (error) {
    const errorDiv = document.getElementById('error-message');
    errorDiv.textContent = 'Erreur lors de la validation de la réservation: ' + error.message;
    errorDiv.style.display = 'block';
    setTimeout(() => errorDiv.style.display = 'none', 5000);
  }
}

export async function completePayment(reservationId, paymentAmount) {
  try {
    const reservationDoc = await getDoc(doc(db, 'reservations', reservationId));
    if (!reservationDoc.exists()) throw new Error('Réservation introuvable');
    const reservation = reservationDoc.data();
    const newPaidAmount = (reservation.paidAmount || 0) + paymentAmount;
    if (newPaidAmount > reservation.price) throw new Error('Le montant payé dépasse le prix total.');
    const isComplete = newPaidAmount >= reservation.price;
    await updateDoc(doc(db, 'reservations', reservationId), {
      paidAmount: newPaidAmount,
      paymentType: isComplete ? 'complet' : 'acompte'
    });
    return { reservationId, isComplete };
  } catch (error) {
    throw error;
  }
}

export function scanQRCode() {
  const video = document.getElementById('qr-video');
  const canvasElement = document.getElementById('qr-canvas');
  const canvas = canvasElement.getContext('2d');
  const resultContainer = document.getElementById('qr-result');

  navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
    .then(stream => {
      video.srcObject = stream;
      video.play();
      const scan = () => {
        canvasElement.width = video.videoWidth;
        canvasElement.height = video.videoHeight;
        canvas.drawImage(video, 0, 0, canvasElement.width, canvasElement.height);
        const imageData = canvas.getImageData(0, 0, canvasElement.width, canvasElement.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);
        if (code) {
          resultContainer.textContent = `Code QR scanné : ${code.data}`;
          validateReservation(code.data)
            .then(() => {
              resultContainer.textContent += ' - Réservation validée';
              video.srcObject.getTracks().forEach(track => track.stop());
            })
            .catch(error => {
              resultContainer.textContent += ` - Erreur: ${error.message}`;
            });
        } else {
          requestAnimationFrame(scan);
        }
      };
      requestAnimationFrame(scan);
    })
    .catch(error => {
      resultContainer.textContent = `Erreur d'accès à la caméra: ${error.message}`;
    });
}
