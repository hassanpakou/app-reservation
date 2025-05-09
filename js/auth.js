import { db } from './firebase.js';
import { collection, getDocs, doc, updateDoc, addDoc, setDoc, deleteDoc } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';
import { getAuth, createUserWithEmailAndPassword, updateEmail, deleteUser as deleteFirebaseUser } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';

export async function loadUsers() {
  const userList = document.getElementById('user-list');
  userList.innerHTML = '';
  const usersSnapshot = await getDocs(collection(db, 'users'));
  usersSnapshot.forEach(doc => {
    const user = doc.data();
    userList.innerHTML += `
      <div class="card mb-2">
        <div class="card-body">
          <p>Email: ${user.email}</p>
          <p>Rôle: ${user.role}</p>
          <select onchange="updateUserRole('${doc.id}', this.value)">
            <option value="user" ${user.role === 'user' ? 'selected' : ''}>Utilisateur</option>
            <option value="organizer" ${user.role === 'organizer' ? 'selected' : ''}>Organisateur</option>
            <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>Admin</option>
          </select>
          <button class="btn btn-warning btn-sm ms-2 edit-user-btn" data-user-id="${doc.id}" data-email="${user.email}" data-role="${user.role}">Modifier</button>
          <button class="btn btn-danger btn-sm ms-2 delete-user-btn" data-user-id="${doc.id}">Supprimer</button>
        </div>
      </div>
    `;
  });

  // Ajouter les écouteurs d'événements pour les boutons Modifier et Supprimer
  document.querySelectorAll('.edit-user-btn').forEach(button => {
    button.addEventListener('click', () => {
      const userId = button.dataset.userId;
      const email = button.dataset.email;
      const role = button.dataset.role;
      document.getElementById('edit-user-id').value = userId;
      document.getElementById('edit-user-email').value = email;
      document.getElementById('edit-user-role').value = role;
      const modal = new bootstrap.Modal(document.getElementById('editUserModal'));
      modal.show();
    });
  });

  document.querySelectorAll('.delete-user-btn').forEach(button => {
    button.addEventListener('click', async () => {
      const userId = button.dataset.userId;
      if (confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
        try {
          await deleteUser(userId);
          alert('Utilisateur supprimé avec succès');
          loadUsers();
        } catch (error) {
          alert('Erreur lors de la suppression de l\'utilisateur: ' + error.message);
        }
      }
    });
  });
}

export async function updateUserRole(userId, role) {
  await updateDoc(doc(db, 'users', userId), { role });
  alert('Rôle mis à jour');
}

export async function updateUser(userId, email, role) {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (!userDoc.exists()) throw new Error('Utilisateur introuvable');

    // Mettre à jour les informations dans Firestore
    await updateDoc(doc(db, 'users', userId), { email, role });

    // Mettre à jour l'e-mail dans Firebase Authentication (nécessite que l'utilisateur soit connecté)
    const auth = getAuth();
    const currentUser = auth.currentUser;
    if (currentUser && currentUser.uid === userId) {
      await updateEmail(currentUser, email);
    } else {
      console.warn('L\'e-mail ne peut être mis à jour que pour l\'utilisateur connecté. Mise à jour Firestore uniquement.');
    }
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
}

export async function deleteUser(userId) {
  try {
    // Supprimer le document utilisateur de Firestore
    await deleteDoc(doc(db, 'users', userId));

    // Supprimer l'utilisateur de Firebase Authentication (nécessite que l'utilisateur soit connecté ou via l'API Admin)
    const auth = getAuth();
    const currentUser = auth.currentUser;
    if (currentUser && currentUser.uid === userId) {
      await deleteFirebaseUser(currentUser);
    } else {
      console.warn('L\'utilisateur ne peut être supprimé de l\'authentification que s\'il est connecté. Suppression Firestore uniquement.');
    }
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
}

export async function createEvent(e) {
  e.preventDefault();
  const eventData = {
    name: document.getElementById('event-name').value,
    date: new Date(document.getElementById('event-date').value).toISOString(),
    location: document.getElementById('event-location').value,
    seats: parseInt(document.getElementById('event-seats').value),
    price: parseFloat(document.getElementById('event-price').value),
    vipPrice: parseFloat(document.getElementById('event-vip-price').value),
    category: document.getElementById('event-category').value,
    createdAt: new Date().toISOString()
  };
  await addDoc(collection(db, 'events'), eventData);
  alert('Événement créé');
  e.target.reset();
}

export async function createOrganizerEvent(e) {
  e.preventDefault();
  const eventData = {
    name: document.getElementById('org-event-name').value,
    date: new Date(document.getElementById('org-event-date').value).toISOString(),
    location: document.getElementById('org-event-location').value,
    seats: parseInt(document.getElementById('org-event-seats').value),
    price: parseFloat(document.getElementById('org-event-price').value),
    vipPrice: parseFloat(document.getElementById('org-event-vip-price').value),
    category: document.getElementById('org-event-category').value,
    createdAt: new Date().toISOString()
  };
  await addDoc(collection(db, 'events'), eventData);
  alert('Événement créé');
  e.target.reset();
}

export async function createUser(e) {
  e.preventDefault();
  const email = document.getElementById('user-email').value;
  const password = document.getElementById('user-password').value;
  const role = document.getElementById('user-role').value;
  try {
    if (password.length < 6) {
      throw new Error('Le mot de passe doit contenir au moins 6 caractères.');
    }
    const auth = getAuth();
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await setDoc(doc(db, 'users', userCredential.user.uid), {
      email,
      role,
      createdAt: new Date().toISOString()
    });
    alert('Utilisateur créé avec succès');
    e.target.reset();
    loadUsers();
  } catch (error) {
    let errorMessage = 'Erreur lors de la création de l\'utilisateur: ';
    if (error.code === 'auth/email-already-in-use') {
      errorMessage += 'Cet e-mail est déjà utilisé.';
    } else if (error.code === 'auth/invalid-email') {
      errorMessage += 'L\'e-mail est invalide.';
    } else if (error.code === 'auth/weak-password') {
      errorMessage += 'Le mot de passe est trop faible.';
    } else {
      errorMessage += error.message;
    }
    alert(errorMessage);
  }
}
