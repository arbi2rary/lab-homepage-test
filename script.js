/* 모바일 메뉴 */
const toggle=document.querySelector('.nav-toggle'),menu=document.getElementById('menu');
toggle.addEventListener('click',()=>{const o=menu.classList.toggle('open');toggle.setAttribute('aria-expanded',o)});
menu.addEventListener('click',e=>{if(e.target.tagName==='A'){menu.classList.remove('open');toggle.setAttribute('aria-expanded',false)}});
 
/* 현재 섹션 메뉴 강조 */
const links=[...menu.querySelectorAll('a')];
const io=new IntersectionObserver(es=>{
  es.forEach(en=>{if(en.isIntersecting){links.forEach(a=>a.removeAttribute('aria-current'));const a=links.find(a=>a.getAttribute('href')==='#'+en.target.id);a&&a.setAttribute('aria-current','true')}})
},{rootMargin:'-40% 0px -55% 0px'});
document.querySelectorAll('section[id]').forEach(s=>io.observe(s));
 
/* 플로어플랜 블록 ↔ 연구 분야 카드 연결 */
document.querySelectorAll('.die .blkg').forEach(b=>{
  const card=document.getElementById(b.dataset.area);
  b.addEventListener('mouseenter',()=>card&&card.classList.add('on'));
  b.addEventListener('mouseleave',()=>card&&card.classList.remove('on'));
  b.addEventListener('click',()=>card&&card.scrollIntoView({behavior:'smooth',block:'center'}));
});
 
/* 구성원 탭 */
document.querySelectorAll('.tab').forEach(t=>t.addEventListener('click',()=>{
  document.querySelectorAll('.tab').forEach(x=>x.setAttribute('aria-selected',false));
  document.querySelectorAll('.panel').forEach(p=>p.classList.remove('on'));
  t.setAttribute('aria-selected',true);
  document.getElementById(t.getAttribute('aria-controls')).classList.add('on');
}));
 
/* 소식 필터 */
document.querySelectorAll('.filters button').forEach(f=>f.addEventListener('click',()=>{
  document.querySelectorAll('.filters button').forEach(x=>x.setAttribute('aria-pressed',false));
  f.setAttribute('aria-pressed',true);
  const k=f.dataset.filter;
  document.querySelectorAll('.news li').forEach(li=>{li.hidden=!(k==='all'||li.dataset.cat===k)});
}));
