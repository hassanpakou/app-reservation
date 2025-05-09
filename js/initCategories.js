import { db } from './firebase.js';
import { collection, addDoc, getDocs } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';

export async function initCategories() {
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
}

export async function loadCategories(selector = '#event-category') {
  const categorySelect = document.querySelector(selector);
  categorySelect.innerHTML = '<option value="">Sélectionner</option>';
  const categoriesSnapshot = await getDocs(collection(db, 'categories'));
  categoriesSnapshot.forEach(doc => {
    const category = doc.data();
    categorySelect.innerHTML += `<option value="${category.name}">${category.name}</option>`;
  });
}
