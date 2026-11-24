import { auth,configured,onAuthStateChanged,signInWithEmailAndPassword,adminAPI,signOut } from './admin-auth.js';
const form=document.getElementById('loginForm'), error=document.getElementById('loginError');
const show=msg=>{error.textContent=msg;error.hidden=false};
if(!configured){show('Firebase Authentication is not configured yet. Add your Firebase web config to /js/firebase-config.js and deploy the backend.')}
else onAuthStateChanged(auth,async user=>{if(!user)return;try{await adminAPI('/me');location.replace('/admin-dashboard.html')}catch{await signOut(auth)}});
form?.addEventListener('submit',async e=>{e.preventDefault();error.hidden=true;if(!configured)return show('Firebase configuration is required first.');const btn=form.querySelector('button[type=submit]');btn.disabled=true;try{const data=new FormData(form);await signInWithEmailAndPassword(auth,String(data.get('email')),String(data.get('password')));await adminAPI('/me');location.assign('/admin-dashboard.html')}catch(err){show(err.code==='auth/invalid-credential'?'Incorrect email or password.':err.message);try{await signOut(auth)}catch{}}finally{btn.disabled=false}});
