const CACHE='xcar-20260929-user-v8-navbtn-blacklist-ui';
const CORE=['./','./index.html','./manifest.json','./icon-192.png','./icon-512.png','./icon-maskable-512.png'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{ if(e.request.method!=='GET') return; e.respondWith(fetch(e.request).catch(()=>caches.match(e.request).then(r=>r||caches.match('./index.html')))); });

// ---------- Web Push: показываем системное уведомление даже когда приложение свёрнуто
// или закрыто, и дублируем сигнал в уже открытые вкладки (там браузер обычно не
// показывает системное уведомление поверх активной страницы — страница сама проигрывает
// звук/вибро и добавляет запись в колокольчик уведомлений через это сообщение) ----------
self.addEventListener('push',e=>{
 let data={};
 try{ data=e.data?e.data.json():{}; }
 catch(err){ try{ data={body:e.data?e.data.text():''}; }catch(err2){} }
 const title=data.title||'XCAR';
 const body=data.body||'';
 const options={
  body,
  icon:'./icon-192.png',
  badge:'./icon-192.png',
  vibrate:[200,90,200,90,200],
  tag:'xcar-push-'+Date.now(),
  data:{url:'./index.html'}
 };
 e.waitUntil((async()=>{
  await self.registration.showNotification(title,options);
  const allClients=await self.clients.matchAll({includeUncontrolled:true,type:'window'});
  for(const client of allClients){
   client.postMessage({type:'xcar-push',title,body});
  }
 })());
});
self.addEventListener('notificationclick',e=>{
 e.notification.close();
 e.waitUntil((async()=>{
  const allClients=await self.clients.matchAll({includeUncontrolled:true,type:'window'});
  for(const client of allClients){
   if('focus' in client) return client.focus();
  }
  if(self.clients.openWindow) return self.clients.openWindow('./index.html');
 })());
});
