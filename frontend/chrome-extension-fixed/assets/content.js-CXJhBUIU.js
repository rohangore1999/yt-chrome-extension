(function(){const i=()=>{const o=new URLSearchParams(window.location.search).get("v");o&&chrome.storage.sync.set({videoId:o,lastVideoId:o},()=>{console.log("Video ID saved to chrome storage:",o)})},d=e=>{try{const o=document.querySelector("video");return o?(o.currentTime=e,!0):!1}catch(o){return console.error("Error seeking to timestamp:",o),!1}};let t=null;const l=()=>{if(t)return t;const e=document.createElement("div");e.id="youtube-chatbot-overlay",e.style.cssText=`
    position: fixed;
    top: 20px;
    right: 20px;
    width: 420px;
    height: auto;
    max-height: 600px;
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
    z-index: 10000;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    display: none;
  `;const o=document.createElement("iframe");return o.style.cssText=`
    width: 100%;
    height: 640px;
    border: none;
    border-radius: 12px;
  `,o.src=chrome.runtime.getURL("index.html"),e.appendChild(o),document.body.appendChild(e),e.addEventListener("click",s=>{s.stopPropagation()}),e},u=async()=>{if(t||(t=l()),t.style.display==="none"||!t.style.display){const o=new URLSearchParams(window.location.search).get("v");o&&chrome.storage.sync.get(["lastVideoId"],r=>{const c=r.lastVideoId;o!==c?chrome.storage.sync.set({videoId:o,lastVideoId:o},()=>{console.log("New video ID saved to chrome storage:",o)}):chrome.storage.sync.set({videoId:o},()=>{console.log("Video ID confirmed in chrome storage:",o)})}),t.style.display="block";const s=t.querySelector("iframe");s&&s.focus()}else t.style.display="none"},n=()=>{t&&(t.style.display="none",chrome.runtime.sendMessage({action:"popupClosed"}))};chrome.runtime.onMessage.addListener((e,o,s)=>{if(e.action==="togglePopup")u(),s({success:!0});else if(e.action==="closePopup")n(),s({success:!0});else if(e.action==="seekToTimestamp"){const r=d(e.seconds);s({success:r})}});document.addEventListener("click",e=>{t&&t.style.display==="block"&&t.contains(e.target)});document.addEventListener("keydown",e=>{e.key==="Escape"&&t&&t.style.display==="block"&&n()});window.addEventListener("message",e=>{e.data&&e.data.action==="closePopup"&&n()});document.addEventListener("DOMContentLoaded",i);let a=location.href;new MutationObserver(()=>{const e=location.href;e!==a&&(a=e,i())}).observe(document,{subtree:!0,childList:!0});
})()
