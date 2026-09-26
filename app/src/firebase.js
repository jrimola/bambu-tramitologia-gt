import { initializeApp } from 'firebase/app'
import { GoogleAuthProvider, getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  projectId: 'bambu-tramitologia-gt',
  appId: '1:26249085984:web:963d1b4bab28cf84666845',
  storageBucket: 'bambu-tramitologia-gt.firebasestorage.app',
  apiKey: 'AIzaSyCfx-xMG4au2VaG5_KOdK12yz0hMCDaHS0',
  authDomain: 'bambu-tramitologia-gt.firebaseapp.com',
  messagingSenderId: '26249085984',
}

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const db = getFirestore(app)

export const googleProvider = new GoogleAuthProvider()
googleProvider.setCustomParameters({ hd: 'bambudev.com' })
