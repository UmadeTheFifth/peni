(async()=>{
  const host=document.getElementById('cartItems'),empty=document.getElementById('emptyCart'),panel=document.getElementById('checkoutPanel'),form=document.getElementById('checkoutForm');if(!host||!form)return;
  const products=await PeniStore.getProducts();const byId=new Map(products.map(p=>[p.id,p]));
  function items(){return PeniStore.getCart().map(x=>({...x,product:byId.get(x.id)})).filter(x=>x.product&&x.product.active!==false)}
  function totals(){const lines=items(),subtotal=lines.reduce((sum,x)=>sum+x.product.price*x.quantity,0),delivery=form.elements.delivery.value==='express'?15000:0;document.getElementById('subtotal').textContent=PeniStore.money(subtotal);document.getElementById('deliveryFee').textContent=delivery?PeniStore.money(delivery):'FREE';document.getElementById('total').textContent=PeniStore.money(subtotal+delivery)}
  function render(){const lines=items(),quantity=lines.reduce((s,x)=>s+x.quantity,0);document.getElementById('bagItemCount').textContent=`${quantity} ${quantity===1?'ITEM':'ITEMS'}`;empty.hidden=quantity>0;panel.hidden=quantity===0;host.innerHTML=lines.map(({id,quantity,product:p})=>`<article class="bag-item"><div class="bag-item-visual"><strong>P.</strong></div><div class="bag-item-detail"><span class="product-category">${PeniStore.esc(p.category)}</span><h3>${PeniStore.esc(p.name)}</h3><div class="product-price">${PeniStore.money(p.price*quantity)}</div><div class="bag-item-bottom"><div class="qty-picker"><button type="button" data-quantity="-1" data-id="${PeniStore.esc(id)}" aria-label="Decrease quantity">−</button><span>${quantity}</span><button type="button" data-quantity="1" data-id="${PeniStore.esc(id)}" aria-label="Increase quantity">+</button></div><button type="button" class="remove-link" data-remove="${PeniStore.esc(id)}">REMOVE</button></div></div></article>`).join('');totals()}
  host.addEventListener('click',e=>{const qty=e.target.closest('[data-quantity]');const remove=e.target.closest('[data-remove]');if(qty){PeniStore.change(qty.dataset.id,Number(qty.dataset.quantity));render()}if(remove){PeniStore.remove(remove.dataset.remove);render()}});
  form.querySelectorAll('input[name="delivery"]').forEach(input=>input.addEventListener('change',totals));
  const errorEl=document.getElementById('checkoutError'),submit=document.getElementById('payButton');
  form.addEventListener('submit',async e=>{
    e.preventDefault();errorEl.hidden=true;const lines=items();if(!lines.length){errorEl.textContent='Your bag is empty.';errorEl.hidden=false;return;}
    const data=new FormData(form), customer={name:String(data.get('fullName')||'').trim(),email:String(data.get('email')||'').trim(),phone:String(data.get('phone')||'').trim(),address:String(data.get('address')||'').trim(),city:String(data.get('city')||'').trim(),state:String(data.get('state')||'').trim()};
    submit.disabled=true;submit.textContent='CONNECTING SECURELY...';
    try {const result=await PeniStore.postJSON('/api/checkout',{customer,items:lines.map(x=>({id:x.id,quantity:x.quantity})),delivery:data.get('delivery')});if(!result.authorizationUrl||!result.authorizationUrl.startsWith('https://checkout.paystack.com/'))throw Error('Payment provider returned an unexpected link.');location.assign(result.authorizationUrl);}
    catch(err){errorEl.textContent=err.message;errorEl.hidden=false;submit.disabled=false;submit.textContent='PAY SECURELY ↗'}
  });
  render();
})();
