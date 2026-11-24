(() => {
  const KEY = 'peni:cart:v1';
  const fallbackProducts = Array.isArray(window.PENI_PRODUCTS) ? window.PENI_PRODUCTS : [];
  let catalogPromise;
  const esc = (value) => String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const money = (n) => new Intl.NumberFormat('en-NG', {style:'currency', currency:'NGN', maximumFractionDigits:0}).format(Number(n) || 0);
  const safeCart = () => {
    try {
      const value = JSON.parse(localStorage.getItem(KEY) || '[]');
      return Array.isArray(value) ? value.filter(x=>x && typeof x.id==='string' && Number.isInteger(x.quantity) && x.quantity>0).slice(0,40) : [];
    } catch { return []; }
  };
  let cart = safeCart();
  const saveCart = () => {localStorage.setItem(KEY, JSON.stringify(cart)); document.querySelectorAll('[data-cart-count]').forEach(x=>x.textContent=String(cart.reduce((a,b)=>a+b.quantity,0)));};
  const toast = (msg) => {const el=document.getElementById('toast');if(!el)return;el.textContent=msg;el.classList.add('show');clearTimeout(toast.timer);toast.timer=setTimeout(()=>el.classList.remove('show'),3500);};
  async function getProducts(force=false){
    if (force) catalogPromise = null;
    if (!catalogPromise) catalogPromise=(async()=>{
      const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),7000);
      try {const response=await fetch('/api/products',{signal:controller.signal});if(!response.ok)throw Error('Not available');const json=await response.json();if(!Array.isArray(json.products))throw Error('Invalid catalog');return json.products;}
      catch {return fallbackProducts.filter(p=>p.active!==false)} finally {clearTimeout(timeout)}
    })();
    return catalogPromise;
  }
  function productCard(product,index){
    const name=esc(product.name), id=esc(product.id), category=esc(product.category);
    const tag=product.featured?'<span class="product-tag">THE EDIT</span>':'';
    return `<article class="product-card"><div class="product-visual visual-${index%4}"><span class="product-index">P / ${String(index+1).padStart(2,'0')}</span>${tag}<strong>P.</strong><span class="visual-caption">PENI / ${category.toUpperCase()}</span></div><div class="product-copy"><span class="product-category">${category}</span><h3 class="product-title">${name}</h3><p class="product-description">${esc(product.description)}</p><div class="product-footer"><span class="product-price">${money(product.price)}</span><button type="button" class="add-to-bag" data-add-id="${id}">ADD TO BAG +</button></div></div></article>`;
  }
  async function add(id){const products=await getProducts();const product=products.find(p=>p.id===id&&p.active!==false);if(!product){toast('This piece is currently unavailable.');return;}const found=cart.find(c=>c.id===id);if(found)found.quantity=Math.min(found.quantity+1,10);else cart.push({id,quantity:1});saveCart();toast('Added to your bag.');}
  function change(id,delta){const found=cart.find(x=>x.id===id);if(!found)return;found.quantity=Math.max(0,Math.min(10,found.quantity+delta));cart=cart.filter(x=>x.quantity>0);saveCart();}
  function remove(id){cart=cart.filter(x=>x.id!==id);saveCart();}
  async function postJSON(url,payload){
    const response=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
    let data={};try{data=await response.json()}catch{}
    if(!response.ok)throw new Error(data.error || 'This action could not be completed. Please try again.');
    return data;
  }
  window.PeniStore={getProducts,productCard,money,esc,toast,postJSON,add,change,remove,getCart:()=>cart.map(x=>({...x})),clearCart:()=>{cart=[];saveCart()}};
  document.addEventListener('click',e=>{const btn=e.target.closest('[data-add-id]');if(btn)add(btn.getAttribute('data-add-id'));});
  const toggle=document.getElementById('menuToggle'),mobile=document.getElementById('mobileNav');
  if(toggle&&mobile){toggle.addEventListener('click',()=>{const open=mobile.classList.toggle('open');toggle.setAttribute('aria-expanded',String(open));toggle.setAttribute('aria-label',open?'Close menu':'Open menu');});mobile.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{mobile.classList.remove('open');toggle.setAttribute('aria-expanded','false')}));}
  document.querySelectorAll('[data-year]').forEach(x=>x.textContent=String(new Date().getFullYear()));saveCart();
})();
