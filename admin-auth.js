import { initializeApp } from 'https://www.gstatic.com/firebasejs/13.3.0/firebase-app.js';
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'https://www.gstatic.com/firebasejs/13.3.0/firebase-auth.js';
import { firebaseConfig } from './firebase-config.js';
export const configured=!!(firebaseConfig.apiKey&&firebaseConfig.authDomain&&firebaseConfig.projectId&&firebaseConfig.appId);
export const auth=configured?getAuth(initializeApp(firebaseConfig)):null;
export { onAuthStateChanged,signInWithEmailAndPassword,signOut };
export async function adminAPI(path,{method='GET',data}={}){
  if(!auth?.currentUser)throw Error('You are not signed in.');
  const token=await auth.currentUser.getIdToken();
  const r=await fetch('/api/admin'+path,{method,headers:{Authorization:`Bearer ${token}`,...(data?{'Content-Type':'application/json'}:{})},...(data?{body:JSON.stringify(data)}:{})});
  let result={};try{result=await r.json()}catch{}
  if(!r.ok)throw Error(result.error||`Request failed (${r.status}).`);
  return result;
}
