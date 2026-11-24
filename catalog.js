(async()=>{
  const host=document.getElementById('productsGrid'),count=document.getElementById('resultsCount'); if(!host)return;
  const products=(await PeniStore.getProducts()).filter(p=>p.active!==false);
  function render(category){const matches=category==='all'?products:products.filter(p=>p.category===category);host.innerHTML=matches.length?matches.map((p,i)=>PeniStore.productCard(p,i)).join(''):'<div class="empty-review">No items in this category at the moment.</div>';count.textContent=`${matches.length} ${matches.length===1?'PIECE':'PIECES'}`;}
  document.querySelectorAll('[data-filter]').forEach(btn=>btn.addEventListener('click',()=>{document.querySelectorAll('[data-filter]').forEach(b=>b.classList.toggle('active',b===btn));render(btn.dataset.filter)}));
  render('all');
})();
