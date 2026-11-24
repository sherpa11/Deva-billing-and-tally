import{j as t,b as D}from"./index-C6P9k13S.js";import{z as F,a as p,h as z,m as A,n as M,o as R,I as $,X as W}from"./vendor-icons-C7i4cu_3.js";import{r as E,d as q}from"./billImageDownload-DA22CFgL.js";const P=F.forwardRef(({bill:e,buyer:a,settings:o={}},f)=>{const[h,x]=p.useState(!1);if(p.useEffect(()=>{const n=new Image;n.src="/buyer-bill-template.jpg",n.complete?x(!0):(n.onload=()=>x(!0),n.onerror=()=>x(!0))},[]),!e)return null;const g=n=>{if(!n)return"";const i=new Date(n);return`${i.getDate().toString().padStart(2,"0")}-${(i.getMonth()+1).toString().padStart(2,"0")}-${i.getFullYear()}`},u=n=>{const i=Number(n)||0,l=Math.abs(i).toFixed(2).split(".");return{rupees:Number(l[0]).toLocaleString("en-IN"),paise:l[1]==="00"?"00":l[1],isNegative:i<0}},s=(n,i=!0)=>{const l=Number(n)||0;return!i&&l===0?"—":`₹${l.toLocaleString("en-IN",{minimumFractionDigits:2,maximumFractionDigits:2})}`},d=e.buyerId&&typeof e.buyerId=="object"?e.buyerId:a&&typeof a=="object"?a:e.buyer&&typeof e.buyer=="object"?e.buyer:null,y=e.buyerName||(d==null?void 0:d.name)||(typeof e.buyerId=="string"&&(a!=null&&a.name)?a.name:"")||"",b=e.buyerPhone||(d==null?void 0:d.phone)||(typeof e.buyerId=="string"&&(a!=null&&a.phone)?a.phone:"")||"";e.billNumber||e.transactionNumber;const N=g(e.transactionDate||e.date||e.createdAt);let c=Array.isArray(e.items)&&e.items.length>0?e.items:[];c.length===0&&(e.bigBoxes>0&&e.smallBoxes>0?c=[{rate:e.ratePerBigBox||0,description:"தக்காளி பெரிய பெட்டி",quantity:e.bigBoxes,amount:e.bigBoxes*(e.ratePerBigBox||0)},{rate:Math.round((e.ratePerBigBox||0)*.5),description:"தக்காளி சிறிய பெட்டி",quantity:e.smallBoxes,amount:e.smallBoxes*Math.round((e.ratePerBigBox||0)*.5)}]:c=[{rate:e.ratePerBigBox||0,description:e.smallBoxes>0?"தக்காளி சிறிய பெட்டி":"தக்காளி பெரிய பெட்டி",quantity:e.bigEquivalent||e.bigBoxes||e.smallBoxes||e.quantity||1,amount:e.billAmount||e.totalAmount||(e.bigEquivalent||e.bigBoxes||1)*(e.ratePerBigBox||0)||0}]);const I=Number(e.billAmount)||Number(e.totalAmount)||c.reduce((n,i)=>n+(Number(i.amount)||0),0),w=Number(e.oldBalance)||Number(e.previousBalance)||0,j=Math.round((I+w)*100)/100,v=Number(e.amountPaid)||0,B=e.newBalance!==void 0&&e.newBalance!==null?Number(e.newBalance):Math.round((j-v)*100)/100,r=38,m=8;return t.jsxs("div",{ref:f,id:"buyer-printable-bill",className:"buyer-bill-canvas",style:{position:"relative",width:"138mm",height:"195.4mm",maxWidth:"138mm",maxHeight:"195.4mm",margin:"0 auto",padding:0,boxSizing:"border-box",overflow:"hidden",backgroundColor:"#ffffff",fontFamily:'"Noto Sans Tamil", "Mukta Malar", sans-serif',userSelect:"none",WebkitPrintColorAdjust:"exact",printColorAdjust:"exact"},children:[!h&&t.jsxs("div",{className:"no-print",style:{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",backgroundColor:"#ffffff",zIndex:20},children:[t.jsx("div",{style:{width:"28px",height:"28px",border:"3px solid #166534",borderTopColor:"transparent",borderRadius:"50%",animation:"spin 0.8s linear infinite"}}),t.jsx("span",{style:{marginTop:"8px",fontSize:"11px",fontWeight:700,color:"#166534",fontFamily:"sans-serif"},children:"Loading Bill Pad..."})]}),t.jsx("img",{src:"/buyer-bill-template.jpg",alt:"DEVA & CO Buyer Bill Pad",loading:"eager",fetchpriority:"high",decoding:"sync",onLoad:()=>x(!0),style:{position:"absolute",top:0,left:0,width:"100%",height:"100%",objectFit:"fill",pointerEvents:"none",userSelect:"none",display:"block",zIndex:1}}),t.jsx("div",{style:{position:"absolute",zIndex:10,top:"18.7%",left:"12.5%",width:"51.0%",height:"3.6%",display:"flex",alignItems:"center",paddingLeft:"6px",boxSizing:"border-box",overflow:"hidden"},children:t.jsxs("span",{style:{fontFamily:'"Noto Sans Tamil", "Mukta Malar", sans-serif',fontSize:"15px",fontWeight:700,color:"#0f172a",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",letterSpacing:"-0.2px"},children:[y," ",b?`(${b})`:""]})}),t.jsx("div",{style:{position:"absolute",zIndex:10,top:"18.7%",left:"73.5%",width:"22.5%",height:"3.6%",display:"flex",alignItems:"center",justifyContent:"center",boxSizing:"border-box"},children:t.jsx("span",{style:{fontFamily:"Inter, system-ui, sans-serif",fontSize:"14.5px",fontWeight:700,color:"#0f172a",letterSpacing:"-0.3px"},children:N})}),t.jsx("div",{style:{position:"absolute",zIndex:10,top:"31.2%",left:"3.32%",width:"93.64%",height:"42.0%",boxSizing:"border-box",overflow:"hidden"},children:c.map((n,i)=>{const l=u(n.amount),S=n.rate||n.ratePerBigBox||0,k=n.quantity||n.bigEquivalent||n.bigBoxes||n.smallBoxes||"—",C=i*(r+m);return t.jsxs("div",{style:{position:"absolute",top:`${C}px`,left:0,width:"100%",height:`${r}px`,display:"flex",alignItems:"center",boxSizing:"border-box"},children:[t.jsx("div",{style:{width:"14.22%",height:"100%",display:"flex",alignItems:"center",justifyContent:"center",boxSizing:"border-box"},children:t.jsx("span",{style:{fontFamily:"Inter, system-ui, sans-serif",fontSize:"15px",fontWeight:700,color:"#0f172a",letterSpacing:"-0.2px"},children:S>0?`₹${S}`:"—"})}),t.jsx("div",{style:{width:"48.88%",height:"100%",display:"flex",alignItems:"center",justifyContent:"flex-start",paddingLeft:"14px",paddingRight:"10px",boxSizing:"border-box",overflow:"hidden"},children:t.jsx("span",{style:{fontFamily:'"Noto Sans Tamil", "Mukta Malar", sans-serif',fontSize:"14.5px",fontWeight:700,color:"#0f172a",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",lineHeight:"1.3"},children:n.description||"தக்காளி பெட்டி"})}),t.jsx("div",{style:{width:"13.18%",height:"100%",display:"flex",alignItems:"center",justifyContent:"center",boxSizing:"border-box"},children:t.jsx("span",{style:{fontFamily:"Inter, system-ui, sans-serif",fontSize:"15.5px",fontWeight:700,color:"#0f172a"},children:k})}),t.jsxs("div",{style:{width:"23.70%",height:"100%",display:"flex",alignItems:"center",boxSizing:"border-box"},children:[t.jsx("div",{style:{width:"68%",textAlign:"right",paddingRight:"12px",boxSizing:"border-box"},children:t.jsx("span",{style:{fontFamily:"Inter, system-ui, sans-serif",fontSize:"15.5px",fontWeight:700,color:"#0f172a",letterSpacing:"-0.3px"},children:l.rupees})}),t.jsx("div",{style:{width:"32%",textAlign:"center",boxSizing:"border-box"},children:t.jsx("span",{style:{fontFamily:"Inter, system-ui, sans-serif",fontSize:"13px",fontWeight:700,color:"#334155"},children:l.paise})})]})]},i)})}),t.jsx("div",{style:{position:"absolute",zIndex:10,top:"74.41%",left:"64.59%",width:"32.09%",height:"4.10%",display:"flex",alignItems:"center",justifyContent:"flex-end",paddingRight:"16px",boxSizing:"border-box"},children:t.jsx("span",{style:{fontFamily:"Inter, system-ui, sans-serif",fontSize:"16.5px",fontWeight:700,color:"#0f172a",letterSpacing:"-0.3px"},children:s(I)})}),t.jsx("div",{style:{position:"absolute",zIndex:10,top:"78.51%",left:"64.59%",width:"32.09%",height:"3.32%",display:"flex",alignItems:"center",justifyContent:"flex-end",paddingRight:"16px",boxSizing:"border-box"},children:t.jsx("span",{style:{fontFamily:"Inter, system-ui, sans-serif",fontSize:"15.5px",fontWeight:700,color:"#0f172a",letterSpacing:"-0.3px"},children:w>0?s(w):"—"})}),t.jsx("div",{style:{position:"absolute",zIndex:10,top:"81.83%",left:"64.59%",width:"32.09%",height:"3.52%",display:"flex",alignItems:"center",justifyContent:"flex-end",paddingRight:"16px",boxSizing:"border-box"},children:t.jsx("span",{style:{fontFamily:"Inter, system-ui, sans-serif",fontSize:"18px",fontWeight:800,color:"#0f172a",letterSpacing:"-0.3px"},children:s(j)})}),t.jsx("div",{style:{position:"absolute",zIndex:10,top:"85.35%",left:"64.59%",width:"32.09%",height:"3.52%",display:"flex",alignItems:"center",justifyContent:"flex-end",paddingRight:"16px",boxSizing:"border-box"},children:t.jsx("span",{style:{fontFamily:"Inter, system-ui, sans-serif",fontSize:"16px",fontWeight:700,color:"#15803d",letterSpacing:"-0.3px"},children:v>0?s(v):"₹0"})}),t.jsx("div",{style:{position:"absolute",zIndex:10,top:"88.87%",left:"64.59%",width:"32.09%",height:"4.29%",display:"flex",alignItems:"center",justifyContent:"flex-end",paddingRight:"16px",boxSizing:"border-box"},children:t.jsx("span",{style:{fontFamily:"Inter, system-ui, sans-serif",fontSize:"18px",fontWeight:800,color:"#dc2626",letterSpacing:"-0.3px"},children:s(B)})})]})});P.displayName="BuyerBillPad";const _=({isOpen:e,onClose:a,bill:o,buyer:f})=>{const{settings:h,fetchSettings:x}=D(),g=p.useRef(),u=p.useRef(),[s,d]=p.useState(!1),[y,b]=p.useState(!1),[N,c]=p.useState("");if(p.useEffect(()=>{e&&(!h||Object.keys(h).length===0)&&typeof x=="function"&&x()},[e,h]),p.useEffect(()=>{const r=m=>{u.current&&!u.current.contains(m.target)&&d(!1)};return s&&document.addEventListener("mousedown",r),()=>{document.removeEventListener("mousedown",r)}},[s]),!e||!o)return null;const w=(r=>{if(!r)return"";const m=new Date(r);return`${m.getDate().toString().padStart(2,"0")}-${(m.getMonth()+1).toString().padStart(2,"0")}-${m.getFullYear()}`})(o.transactionDate||o.date||o.createdAt),j=()=>{d(!1),window.print()},v=async()=>{if(d(!1),!g.current)return;b(!0);const r=o.buyerId&&typeof o.buyerId=="object"?o.buyerId:f&&typeof f=="object"?f:null,m=(o.buyerName||(r==null?void 0:r.name)||"Buyer").trim().replace(/[\/\s]+/g,"_").replace(/[^a-zA-Z0-9_\-\u0B80-\u0BFF]/g,""),n=o.billNumber||o.transactionNumber||"",i=w.replace(/[\/\s]/g,"-"),l=`Deva_Buyer_Bill_${m}${n?`_${n}`:""}_${i}.png`;await q(g.current,{filename:l,targetWidthPx:723,targetHeightPx:1024,shareTitle:`Buyer Bill - ${m}`,onStatusChange:S=>{c(S),S&&setTimeout(()=>c(""),4e3)}}),b(!1)},B=t.jsxs("div",{className:"buyer-modal-portal fixed inset-0 z-50 overflow-y-auto",children:[t.jsxs("div",{className:"buyer-modal-wrap flex min-h-screen items-center justify-center p-2 sm:p-4",children:[t.jsx("div",{className:"fixed inset-0 bg-slate-900/60 backdrop-blur-xs no-print",onClick:a}),t.jsxs("div",{className:"buyer-modal-card relative bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden my-4",children:[t.jsxs("div",{className:"no-print flex items-center justify-between px-5 py-3.5 bg-slate-50 border-b border-slate-200",children:[t.jsxs("div",{className:"flex items-center gap-2",children:[t.jsx(z,{className:"w-5 h-5 text-forest-700"}),t.jsx("span",{className:"font-bold text-slate-800 text-sm font-tamil",children:"வாடிக்கையாளர் பில் அச்சிடு (Buyer Bill A5 Print)"})]}),t.jsxs("div",{className:"flex items-center gap-2",children:[N&&t.jsx("span",{className:"text-[11px] font-bold text-forest-700 bg-forest-50 border border-forest-200/80 px-2.5 py-1 rounded-lg",children:N}),t.jsxs("div",{className:"relative inline-flex items-stretch shadow-xs rounded-xl",ref:u,children:[t.jsxs("button",{type:"button",onClick:j,className:"flex items-center gap-1.5 px-3 sm:px-4 py-2 bg-forest-600 hover:bg-forest-700 text-white rounded-l-xl text-xs font-bold shadow-md shadow-forest-600/25 transition-all cursor-pointer active:scale-95",title:"Browser Print Preview (A5 - Exactly 1 Sheet)",children:[t.jsx(z,{className:"w-4 h-4"}),t.jsx("span",{children:"அச்சிடு (Print A5)"})]}),t.jsx("button",{type:"button",onClick:()=>d(!s),className:"px-2 py-2 bg-forest-700 hover:bg-forest-800 text-white rounded-r-xl border-l border-forest-500/50 shadow-md shadow-forest-600/25 transition-all cursor-pointer",title:"Print & Download Options",children:t.jsx(A,{className:`w-3.5 h-3.5 transition-transform duration-200 ${s?"rotate-180":""}`})}),s&&t.jsxs("div",{className:"absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95",onClick:r=>r.stopPropagation(),children:[t.jsxs("button",{type:"button",onClick:j,className:"w-full text-left px-3.5 py-2.5 text-xs font-bold text-slate-800 hover:bg-slate-50 flex items-center gap-2.5 cursor-pointer transition-colors",children:[t.jsx(M,{className:"w-4 h-4 text-slate-600"}),t.jsxs("div",{children:[t.jsx("div",{className:"font-bold",children:"Browser Print Preview"}),t.jsx("div",{className:"text-[10px] text-slate-500 font-normal",children:"A5 portrait (strictly 1 single sheet)"})]})]}),t.jsxs("button",{type:"button",onClick:v,disabled:y,className:"w-full text-left px-3.5 py-2.5 text-xs font-bold text-slate-800 hover:bg-slate-50 flex items-center gap-2.5 cursor-pointer transition-colors disabled:opacity-50",children:[y?t.jsx(R,{className:"w-4 h-4 text-forest-600 animate-spin"}):t.jsx($,{className:"w-4 h-4 text-forest-600"}),t.jsxs("div",{children:[t.jsx("div",{className:"font-bold text-forest-700",children:"Download Bill Image"}),t.jsx("div",{className:"text-[10px] text-slate-500 font-normal",children:y?"Generating PNG...":"High-resolution A5 PNG (1-click)"})]})]})]})]}),t.jsx("button",{type:"button",onClick:a,className:"p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer",title:"Close",children:t.jsx(W,{className:"w-5 h-5"})})]})]}),t.jsx("div",{className:"buyer-modal-body p-4 sm:p-6 overflow-x-auto flex justify-center bg-slate-100/60",children:t.jsx(P,{ref:g,bill:o,buyer:f||(o==null?void 0:o.buyerId),settings:h})})]})]}),t.jsx("style",{children:`
        @media print {
          @page {
            size: A5 portrait !important;
            margin: 0 !important;
          }
          *, *:before, *:after {
            box-sizing: border-box !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          html, body {
            width: 148mm !important;
            height: 210mm !important;
            max-width: 148mm !important;
            max-height: 210mm !important;
            min-height: 210mm !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow: hidden !important;
            background: #ffffff !important;
          }
          /* Completely hide entire main application tree */
          #root {
            display: none !important;
          }
          .no-print {
            display: none !important;
          }
          .buyer-modal-portal {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 148mm !important;
            height: 210mm !important;
            max-height: 210mm !important;
            overflow: hidden !important;
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
          }
          .buyer-modal-wrap {
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            min-height: 0 !important;
            padding: 0 !important;
            margin: 0 auto !important;
            width: 148mm !important;
            height: 210mm !important;
            max-height: 210mm !important;
            overflow: hidden !important;
          }
          .buyer-modal-card {
            position: static !important;
            width: 148mm !important;
            height: 210mm !important;
            max-height: 210mm !important;
            margin: 0 !important;
            padding: 0 !important;
            border: none !important;
            border-radius: 0 !important;
            box-shadow: none !important;
            background: #ffffff !important;
            overflow: hidden !important;
          }
          .buyer-modal-body {
            position: static !important;
            padding: 0 !important;
            margin: 0 !important;
            background: #ffffff !important;
            overflow: hidden !important;
            width: 148mm !important;
            height: 210mm !important;
            max-height: 210mm !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
          }
          #buyer-printable-bill {
            position: static !important;
            margin: auto !important;
            width: 138mm !important;
            height: 195.4mm !important;
            max-width: 138mm !important;
            max-height: 195.4mm !important;
            padding: 0 !important;
            border: none !important;
            border-radius: 0 !important;
            box-shadow: none !important;
            box-sizing: border-box !important;
            page-break-before: avoid !important;
            page-break-after: avoid !important;
            page-break-inside: avoid !important;
            break-before: avoid !important;
            break-after: avoid !important;
            break-inside: avoid !important;
            overflow: hidden !important;
          }
        }
      `})]});return E.createPortal(B,document.body)};export{_ as B};
