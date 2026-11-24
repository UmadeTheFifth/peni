(async()=>{
  const host=document.getElementById('featuredGrid'); if(!host)return;
  const catalog=(await PeniStore.getProducts()).filter(p=>p.active!==false);
  const featured=catalog.filter(p=>p.featured).slice(0,4);
  const items=featured.length?featured:catalog.slice(0,4);
  host.innerHTML=items.length?items.map((p,i)=>PeniStore.productCard(p,i)).join(''):'<p>No pieces are available right now.</p>';
})();
