/* Bandi Driving Academy - site behaviour */
(function(){
/* ---- Academy details: everything comes from data/academy.json ---- */
var WA_NUMBER='',NAME='Bandi Driving Academy';
function pick(o,p){return p.split('.').reduce(function(a,k){return a==null?a:a[k]},o)}
/* fill "{a.b}" tokens; returns null if any token is missing/empty so the HTML fallback text stays */
function fill(t,d){var ok=true,s=t.replace(/\{([\w.]+)\}/g,function(m,p){var v=pick(d,p);if(v==null||String(v).trim()===''){ok=false;return m}return String(v)});return ok?s:null}
function applyDetails(d){
  NAME=d.name||NAME;WA_NUMBER=String(pick(d,'contact.whatsapp')||'').replace(/\D/g,'');
  document.querySelectorAll('[data-tpl]').forEach(function(el){var s=fill(el.getAttribute('data-tpl'),d);if(s!==null)el.textContent=s});
  document.querySelectorAll('[data-aria]').forEach(function(el){var s=fill(el.getAttribute('data-aria'),d);if(s!==null)el.setAttribute('aria-label',s)});
  document.querySelectorAll('[data-href]').forEach(function(el){var s=fill(el.getAttribute('data-href'),d);
    if(s!==null&&/^(https:|mailto:|tel:)/i.test(s)){el.setAttribute('href',s.replace(/\s/g,''));
      if(el.hasAttribute('data-external')){el.setAttribute('target','_blank');el.setAttribute('rel','noopener noreferrer')}}});
  var ul=document.querySelector('[data-areas]'),areas=[].concat(d.city||[],d.serviceAreas||[]).filter(Boolean);
  if(ul&&areas.length){ul.textContent='';areas.forEach(function(a){var li=document.createElement('li');li.textContent=a;ul.appendChild(li)})}
  if(d.name){document.title=d.name+' | Professional Driving School'}
}
fetch('data/academy.json',{cache:'no-cache'}).then(function(r){if(!r.ok)throw new Error(r.status);return r.json()}).then(applyDetails)
  .catch(function(e){console.warn('Could not load data/academy.json. Serve the folder over http (not file://).',e)});
var root=document.documentElement,dlg=document.getElementById('dlg'),f=document.getElementById('form'),d=document.getElementById('done'),th=document.getElementById('theme');
function $(i){return document.getElementById(i)}
/* sanitize: normalise, drop control characters and angle brackets, collapse spaces */
function clean(s){return String(s).normalize('NFKC').replace(/[\u0000-\u001F\u007F<>]/g,'').replace(/\s+/g,' ').trim()}
/* theme */
function setTheme(t,save){root.setAttribute('data-theme',t);th.setAttribute('aria-label','Switch to '+(t==='dark'?'light':'dark')+' mode');if(save){try{localStorage.setItem('bandi-theme',t)}catch(e){}}}
var saved=null;try{saved=localStorage.getItem('bandi-theme')}catch(e){}
var mq=window.matchMedia('(prefers-color-scheme: dark)');
setTheme(saved||(mq.matches?'dark':'light'),false);
mq.addEventListener&&mq.addEventListener('change',function(e){var s=null;try{s=localStorage.getItem('bandi-theme')}catch(x){}if(!s)setTheme(e.matches?'dark':'light',false)});
th.addEventListener('click',function(){setTheme(root.getAttribute('data-theme')==='dark'?'light':'dark',true);th.classList.remove('spin');void th.offsetWidth;th.classList.add('spin')});
/* ripple */
document.addEventListener('click',function(e){var b=e.target.closest('.btn');if(!b)return;var r=b.getBoundingClientRect(),s=Math.max(r.width,r.height)*2.2,o=document.createElement('span');o.className='rip';o.style.cssText='width:'+s+'px;height:'+s+'px;left:'+(e.clientX-r.left-s/2)+'px;top:'+(e.clientY-r.top-s/2)+'px';b.appendChild(o);setTimeout(function(){o.remove()},650)});
/* active menu link while scrolling */
var links=[].slice.call(document.querySelectorAll('nav a')),secs=['home','courses','why','reviews','contact'],tick=false;
function spy(){tick=false;var y=window.scrollY+110,cur='home';
secs.forEach(function(id){var el=$(id);if(el&&el.getBoundingClientRect().top+window.scrollY<=y)cur=id});
if(window.innerHeight+window.scrollY>=document.documentElement.scrollHeight-4)cur='contact';
links.forEach(function(a){var on=a.getAttribute('href')==='#'+cur;a.classList.toggle('on',on);if(on)a.setAttribute('aria-current','true');else a.removeAttribute('aria-current')})}
function onScroll(){if(!tick){tick=true;requestAnimationFrame(spy)}}
window.addEventListener('scroll',onScroll,{passive:true});window.addEventListener('resize',onScroll);spy();
/* time slots: 6:00 AM to 8:00 PM in 30-minute classes */
function fmt(m){var h=Math.floor(m/60),mi=m%60,ap=h>=12?'PM':'AM',h12=h%12||12;return h12+':'+(mi<10?'0':'')+mi+' '+ap}
var sl=$('s'),o0=document.createElement('option');o0.value='';o0.textContent='Select a time slot';sl.appendChild(o0);
for(var m=360;m<1200;m+=30){var o=document.createElement('option');o.textContent=fmt(m)+' - '+fmt(m+30);sl.appendChild(o)}
/* validation */
var rules={
n:function(v){if(!v)return'Enter your name.';if(!/^\p{L}[\p{L} .'\-]{1,59}$/u.test(v))return'Use letters only, at least 2 characters.';return''},
p:function(v){if(!v)return'Enter your phone number.';var dg=v.replace(/\D/g,'');if(!/^\+?[\d\s\-()]+$/.test(v)||dg.length<10||dg.length>15)return'Enter a valid phone number with 10 to 15 digits.';return''},
e:function(v){if(v&&!/^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(v))return'Enter a valid email like you@example.com, or leave it blank.';return''},
l:function(v){if(!v)return'Enter where we should pick you up.';if(v.length<3)return'Add a little more detail, such as an area or landmark.';if(!/^[\p{L}\p{N} ,.\-\/#()'&]+$/u.test(v))return'Use only letters, numbers and , . - / # ( ) in the address.';return''},
s:function(v){return v?'':'Choose a time slot for your 30-minute class.'}
};
function check(id,quiet){var el=$(id),msg=rules[id](clean(el.value));$('f-'+id).textContent=msg;if(msg)el.setAttribute('aria-invalid','true');else el.removeAttribute('aria-invalid');return msg}
Object.keys(rules).forEach(function(id){var el=$(id);el.addEventListener('blur',function(){if(el.value||el.dataset.t)check(id)});el.addEventListener('input',function(){el.dataset.t='1';if(el.getAttribute('aria-invalid'))check(id);$('err').textContent=''});el.addEventListener('change',function(){el.dataset.t='1';check(id)})});
/* dialog */
var sent=false;
function show(box){f.hidden=box!=='form';d.hidden=box!=='done'}
function reset(){['n','p','e','l'].forEach(function(i){$(i).value=''});sl.selectedIndex=0;$('t').selectedIndex=0;$('w').selectedIndex=0;Object.keys(rules).forEach(function(i){$(i).removeAttribute('aria-invalid');$('f-'+i).textContent='';delete $(i).dataset.t})}
function openDlg(e){e.preventDefault();if(sent){reset();sent=false}
var card=e.currentTarget.closest('.card');if(card){var k=card.querySelector('h3').textContent.split(' ')[0].toLowerCase(),sel=$('c');for(var i=0;i<sel.options.length;i++){if(sel.options[i].text.toLowerCase().indexOf(k)===0)sel.selectedIndex=i}}
show('form');$('err').textContent='';dlg.showModal();$('n').focus()}
document.querySelectorAll('.book').forEach(function(b){b.addEventListener('click',openDlg)});
function closeDlg(){dlg.close()}
$('x').onclick=$('close').onclick=closeDlg;
dlg.addEventListener('click',function(e){if(e.target===dlg)closeDlg()});
[$('n'),$('p'),$('e'),$('l')].forEach(function(el){el.addEventListener('keydown',function(e){if(e.key==='Enter'){e.preventDefault();$('send').click()}})});
$('send').onclick=function(){
$('err').textContent='';var first=null;
Object.keys(rules).forEach(function(id){if(check(id)&&!first)first=id});
if(first){$(first).focus();return}
if(!/^\d{8,15}$/.test(WA_NUMBER)){$('err').textContent='Bookings are not connected to WhatsApp yet. Add the number in data/academy.json.';return}
var v=function(i){return clean($(i).value)};
var lines=['New lesson enquiry from the '+NAME+' website','','Name: '+v('n'),'Phone: '+v('p')];
if(v('e'))lines.push('Email: '+v('e'));
lines.push('Pickup location: '+v('l'),'Course: '+v('c'),'Transmission: '+v('t'),'Preferred days: '+v('w'),'Time slot: '+v('s'));
var url='https://wa.me/'+WA_NUMBER+'?text='+encodeURIComponent(lines.join('\n'));
$('wa').href=url;
$('msg').textContent='Thanks, '+v('n')+'. Your enquiry for '+v('s')+' is ready. Tap Send in WhatsApp to deliver it to us.';
sent=true;show('done');
window.open(url,'_blank','noopener,noreferrer');
};
})();
