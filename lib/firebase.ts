import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs, onSnapshot, query, orderBy } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

export { db };

/**
 * Saves a report to the "reports" collection.
 * @param report The report object to save
 * @returns The ID of the saved document
 */
export async function saveReport(report: any) {
  try {
    const docRef = await addDoc(collection(db, "reports"), {
      ...report,
      createdAt: new Date(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Error saving report: ", error);
    throw new Error("Failed to save report");
  }
}

/**
 * Fetches all reports from the "reports" collection.
 * @returns An array of report objects
 */
export async function getReports() {
  try {
    const querySnapshot = await getDocs(collection(db, "reports"));
    const reports: any[] = [];
    querySnapshot.forEach((doc) => {
      reports.push({ id: doc.id, ...doc.data() });
    });
    return reports;
  } catch (error) {
    console.error("Error fetching reports: ", error);
    throw new Error("Failed to fetch reports");
  }
}

/**
 * Subscribes to real-time updates from the "reports" collection.
 * @param callback Function to call with the updated array of reports
 * @returns Unsubscribe function
 */
export function subscribeToReports(callback: (reports: any[]) => void) {
  const q = query(collection(db, "reports"), orderBy("createdAt", "desc"));
  return onSnapshot(q, (querySnapshot) => {
    const reports: any[] = [];
    querySnapshot.forEach((doc) => {
      reports.push({ id: doc.id, ...doc.data() });
    });
    callback(reports);
  }, (error) => {
    console.error("Error subscribing to reports: ", error);
  });
}
