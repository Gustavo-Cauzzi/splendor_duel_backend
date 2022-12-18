// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
// https://firebase.google.com/docs/web/setup#available-libraries

const firebaseConfig = {
  apiKey: 'AIzaSyBEVberZXuTca8cdVBDcHYT3WyKlNQ3TUQ',
  authDomain: 'splendor-duel.firebaseapp.com',
  databaseURL: 'https://splendor-duel-default-rtdb.firebaseio.com',
  projectId: 'splendor-duel',
  storageBucket: 'splendor-duel.appspot.com',
  messagingSenderId: '640884749160',
  appId: '1:640884749160:web:121074c1a04d66a1289cdd',
};

const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);
