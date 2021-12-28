function setupLazyObserver(){var e
if("IntersectionObserver"in window){e=document.querySelectorAll(".lazy")
var i=new IntersectionObserver((function(e,n){e.forEach((function(e){if(e.isIntersecting){var n=e.target
n.classList.remove("lazy"),i.unobserve(n)}}))}))
e.forEach((function(e){i.observe(e)}))}else{var n
function t(){console.log("doing IE-style check"),n&&clearTimeout(n),n=setTimeout((function(){var i=window.pageYOffset
e.forEach((function(e){e.offsetTop<window.innerHeight+i&&(e.src=e.dataset.src,e.classList.remove("lazy"))})),0==e.length&&(console.log("no images found, disabling compat lazy loader"),document.removeEventListener("scroll",t),window.removeEventListener("resize",t),window.removeEventListener("orientationChange",t))}),20)}e=document.querySelectorAll(".lazy"),document.addEventListener("scroll",t),window.addEventListener("resize",t),window.addEventListener("orientationChange",t)}}function formatText(e){var i={"<i>Fliiiight</i>":/\bfliiiight\b/gi,"<i>Podiiiium</i>":/\bpodiiiium\b/gi,"<i>Viiiiva</i>":/\bviiiiva\b/gi,"<i>4iiii</i>":/\b4iiii\b/gi}
for(var n in i){const t=i[n]
e=e.replace(t,n)}return e}function setupExplainers(e,i){var n=new XMLHttpRequest
n.addEventListener("load",(function(e){e.forEach((function(e,n){var t=document.createElement("div")
t.className="explain-content "+(1&n?"right":"left")
var a='<div class="explain-content-title">'+e.title+'</div><div class="explain-content-text">'+formatText(e.text)+"</div>",o="./explainers-images/REPLACEME.JPG".replace("REPLACEME.JPG",e.image),r=e.imageStyle||"cover"
if(t.innerHTML=['<div class="explain-content-text-cell">','<div class="vgap" ></div>','<div class="explain-content-text-cell-content">',a,'<div class="vgap" ></div>','<div class="explain-content-text-cell-ctas"></div>',"</div>",'<div class="vgap" ></div>',"</div>",'<span role="img" aria-label="'+e.imageAlt+'" class="explain-content-image-cell lazy" style="background-image: url(\''+o+"'); background-size: "+r+';"></span>'].join("\n"),e.ctas){var l=t.querySelector(".explain-content-text-cell-ctas")
e.ctas.forEach((function(e){var i="/"===e.url[0],n=document.createElement("a")
n.href=e.url,n.innerHTML=formatText(e.text),n.target="/"===e.url[0]?"_self":"_blank",n.onclick=i?function(){engagePlexi()}:function(){},n.className="explain-content-cta-link",l.appendChild(n)}))}i.appendChild(t),setupLazyObserver()}))})),n.open("GET",e),n.send()}document.addEventListener("DOMContentLoaded",(function(){setupLazyObserver()}))
