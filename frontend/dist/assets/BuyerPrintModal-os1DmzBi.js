import{j as t,b as k}from"./index-Chn3E6-c.js";import{z as C,a as m,h as z,m as D,n as F,o as A,I as M,X as $}from"./vendor-icons-C7i4cu_3.js";import{r as W,d as R}from"./billImageDownload-DA22CFgL.js";const I=C.forwardRef(({bill:e,settings:S={}},a)=>{var j,i;if(!e)return null;const p=n=>{if(!n)return"";const o=new Date(n);return`${o.getDate().toString().padStart(2,"0")}-${(o.getMonth()+1).toString().padStart(2,"0")}-${o.getFullYear()}`},y=n=>{const o=Number(n)||0,r=Math.abs(o).toFixed(2).split(".");return{rupees:Number(r[0]).toLocaleString("en-IN"),paise:r[1]==="00"?"00":r[1],isNegative:o<0}},s=(n,o=!0)=>{const r=Number(n)||0;return!o&&r===0?"—":`₹${r.toLocaleString("en-IN",{minimumFractionDigits:2,maximumFractionDigits:2})}`},f=((j=e.buyerId)==null?void 0:j.name)||e.buyerName||"வாடிக்கையாளர்",d=((i=e.buyerId)==null?void 0:i.phone)||e.buyerPhone||"";e.billNumber||e.transactionNumber;const c=p(e.transactionDate||e.date||e.createdAt);let l=Array.isArray(e.items)&&e.items.length>0?e.items:[];l.length===0&&(e.bigBoxes>0&&e.smallBoxes>0?l=[{rate:e.ratePerBigBox||0,description:"தக்காளி பெரிய பெட்டி",quantity:e.bigBoxes,amount:e.bigBoxes*(e.ratePerBigBox||0)},{rate:Math.round((e.ratePerBigBox||0)*.5),description:"தக்காளி சிறிய பெட்டி",quantity:e.smallBoxes,amount:e.smallBoxes*Math.round((e.ratePerBigBox||0)*.5)}]:l=[{rate:e.ratePerBigBox||0,description:e.smallBoxes>0?"தக்காளி சிறிய பெட்டி":"தக்காளி பெரிய பெட்டி",quantity:e.bigEquivalent||e.bigBoxes||e.smallBoxes||e.quantity||1,amount:e.billAmount||e.totalAmount||(e.bigEquivalent||e.bigBoxes||1)*(e.ratePerBigBox||0)||0}]);const h=Number(e.billAmount)||Number(e.totalAmount)||l.reduce((n,o)=>n+(Number(o.amount)||0),0),x=Number(e.oldBalance)||Number(e.previousBalance)||0,g=Math.round((h+x)*100)/100,w=Number(e.amountPaid)||0,N=e.newBalance!==void 0&&e.newBalance!==null?Number(e.newBalance):Math.round((g-w)*100)/100,u=38,B=8;return t.jsxs("div",{ref:a,id:"buyer-printable-bill",className:"buyer-bill-canvas",style:{position:"relative",width:"138mm",height:"195.4mm",maxWidth:"138mm",maxHeight:"195.4mm",margin:"0 auto",padding:0,boxSizing:"border-box",overflow:"hidden",backgroundColor:"#ffffff",fontFamily:'"Noto Sans Tamil", "Mukta Malar", sans-serif',userSelect:"none",WebkitPrintColorAdjust:"exact",printColorAdjust:"exact"},children:[t.jsx("img",{src:"/buyer-bill-template.jpg",alt:"DEVA & CO Buyer Bill Pad",style:{position:"absolute",top:0,left:0,width:"100%",height:"100%",objectFit:"fill",pointerEvents:"none",userSelect:"none",display:"block",zIndex:1}}),t.jsx("div",{style:{position:"absolute",zIndex:10,top:"18.7%",left:"12.5%",width:"51.0%",height:"3.6%",display:"flex",alignItems:"center",paddingLeft:"6px",boxSizing:"border-box",overflow:"hidden"},children:t.jsxs("span",{style:{fontFamily:'"Noto Sans Tamil", "Mukta Malar", sans-serif',fontSize:"15px",fontWeight:700,color:"#0f172a",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",letterSpacing:"-0.2px"},children:[f," ",d?`(${d})`:""]})}),t.jsx("div",{style:{position:"absolute",zIndex:10,top:"18.7%",left:"73.5%",width:"22.5%",height:"3.6%",display:"flex",alignItems:"center",justifyContent:"center",boxSizing:"border-box"},children:t.jsx("span",{style:{fontFamily:"Inter, system-ui, sans-serif",fontSize:"14.5px",fontWeight:700,color:"#0f172a",letterSpacing:"-0.3px"},children:c})}),t.jsx("div",{style:{position:"absolute",zIndex:10,top:"31.2%",left:"3.32%",width:"93.64%",height:"42.0%",boxSizing:"border-box",overflow:"hidden"},children:l.map((n,o)=>{const r=y(n.amount),b=n.rate||n.ratePerBigBox||0,v=n.quantity||n.bigEquivalent||n.bigBoxes||n.smallBoxes||"—",P=o*(u+B);return t.jsxs("div",{style:{position:"absolute",top:`${P}px`,left:0,width:"100%",height:`${u}px`,display:"flex",alignItems:"center",boxSizing:"border-box"},children:[t.jsx("div",{style:{width:"14.22%",height:"100%",display:"flex",alignItems:"center",justifyContent:"center",boxSizing:"border-box"},children:t.jsx("span",{style:{fontFamily:"Inter, system-ui, sans-serif",fontSize:"15px",fontWeight:700,color:"#0f172a",letterSpacing:"-0.2px"},children:b>0?`₹${b}`:"—"})}),t.jsx("div",{style:{width:"48.88%",height:"100%",display:"flex",alignItems:"center",justifyContent:"flex-start",paddingLeft:"14px",paddingRight:"10px",boxSizing:"border-box",overflow:"hidden"},children:t.jsx("span",{style:{fontFamily:'"Noto Sans Tamil", "Mukta Malar", sans-serif',fontSize:"14.5px",fontWeight:700,color:"#0f172a",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",lineHeight:"1.3"},children:n.description||"தக்காளி பெட்டி"})}),t.jsx("div",{style:{width:"13.18%",height:"100%",display:"flex",alignItems:"center",justifyContent:"center",boxSizing:"border-box"},children:t.jsx("span",{style:{fontFamily:"Inter, system-ui, sans-serif",fontSize:"15.5px",fontWeight:700,color:"#0f172a"},children:v})}),t.jsxs("div",{style:{width:"23.70%",height:"100%",display:"flex",alignItems:"center",boxSizing:"border-box"},children:[t.jsx("div",{style:{width:"68%",textAlign:"right",paddingRight:"12px",boxSizing:"border-box"},children:t.jsx("span",{style:{fontFamily:"Inter, system-ui, sans-serif",fontSize:"15.5px",fontWeight:700,color:"#0f172a",letterSpacing:"-0.3px"},children:r.rupees})}),t.jsx("div",{style:{width:"32%",textAlign:"center",boxSizing:"border-box"},children:t.jsx("span",{style:{fontFamily:"Inter, system-ui, sans-serif",fontSize:"13px",fontWeight:700,color:"#334155"},children:r.paise})})]})]},o)})}),t.jsx("div",{style:{position:"absolute",zIndex:10,top:"74.41%",left:"64.59%",width:"32.09%",height:"4.10%",display:"flex",alignItems:"center",justifyContent:"flex-end",paddingRight:"16px",boxSizing:"border-box"},children:t.jsx("span",{style:{fontFamily:"Inter, system-ui, sans-serif",fontSize:"16.5px",fontWeight:700,color:"#0f172a",letterSpacing:"-0.3px"},children:s(h)})}),t.jsx("div",{style:{position:"absolute",zIndex:10,top:"78.51%",left:"64.59%",width:"32.09%",height:"3.32%",display:"flex",alignItems:"center",justifyContent:"flex-end",paddingRight:"16px",boxSizing:"border-box"},children:t.jsx("span",{style:{fontFamily:"Inter, system-ui, sans-serif",fontSize:"15.5px",fontWeight:700,color:"#0f172a",letterSpacing:"-0.3px"},children:x>0?s(x):"—"})}),t.jsx("div",{style:{position:"absolute",zIndex:10,top:"81.83%",left:"64.59%",width:"32.09%",height:"3.52%",display:"flex",alignItems:"center",justifyContent:"flex-end",paddingRight:"16px",boxSizing:"border-box"},children:t.jsx("span",{style:{fontFamily:"Inter, system-ui, sans-serif",fontSize:"18px",fontWeight:800,color:"#0f172a",letterSpacing:"-0.3px"},children:s(g)})}),t.jsx("div",{style:{position:"absolute",zIndex:10,top:"85.35%",left:"64.59%",width:"32.09%",height:"3.52%",display:"flex",alignItems:"center",justifyContent:"flex-end",paddingRight:"16px",boxSizing:"border-box"},children:t.jsx("span",{style:{fontFamily:"Inter, system-ui, sans-serif",fontSize:"16px",fontWeight:700,color:"#15803d",letterSpacing:"-0.3px"},children:w>0?s(w):"₹0"})}),t.jsx("div",{style:{position:"absolute",zIndex:10,top:"88.87%",left:"64.59%",width:"32.09%",height:"4.29%",display:"flex",alignItems:"center",justifyContent:"flex-end",paddingRight:"16px",boxSizing:"border-box"},children:t.jsx("span",{style:{fontFamily:"Inter, system-ui, sans-serif",fontSize:"18px",fontWeight:800,color:"#dc2626",letterSpacing:"-0.3px"},children:s(N)})})]})});I.displayName="BuyerBillPad";const O=({isOpen:e,onClose:S,bill:a})=>{const{settings:p,fetchSettings:y}=k(),s=m.useRef(),f=m.useRef(),[d,c]=m.useState(!1),[l,h]=m.useState(!1),[x,g]=m.useState("");if(m.useEffect(()=>{e&&(!p||Object.keys(p).length===0)&&typeof y=="function"&&y()},[e,p]),m.useEffect(()=>{const i=n=>{f.current&&!f.current.contains(n.target)&&c(!1)};return d&&document.addEventListener("mousedown",i),()=>{document.removeEventListener("mousedown",i)}},[d]),!e||!a)return null;const N=(i=>{if(!i)return"";const n=new Date(i);return`${n.getDate().toString().padStart(2,"0")}-${(n.getMonth()+1).toString().padStart(2,"0")}-${n.getFullYear()}`})(a.transactionDate||a.date||a.createdAt),u=()=>{c(!1),window.print()},B=async()=>{var b;if(c(!1),!s.current)return;h(!0);const i=(((b=a.buyerId)==null?void 0:b.name)||a.buyerName||"Buyer").trim().replace(/[\/\s]+/g,"_").replace(/[^a-zA-Z0-9_\-\u0B80-\u0BFF]/g,""),n=a.billNumber||a.transactionNumber||"",o=N.replace(/[\/\s]/g,"-"),r=`Deva_Buyer_Bill_${i}${n?`_${n}`:""}_${o}.png`;await R(s.current,{filename:r,targetWidthPx:723,targetHeightPx:1024,shareTitle:`Buyer Bill - ${i}`,onStatusChange:v=>{g(v),v&&setTimeout(()=>g(""),4e3)}}),h(!1)},j=t.jsxs("div",{className:"buyer-modal-portal fixed inset-0 z-50 overflow-y-auto",children:[t.jsxs("div",{className:"buyer-modal-wrap flex min-h-screen items-center justify-center p-2 sm:p-4",children:[t.jsx("div",{className:"fixed inset-0 bg-slate-900/60 backdrop-blur-xs no-print",onClick:S}),t.jsxs("div",{className:"buyer-modal-card relative bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden my-4",children:[t.jsxs("div",{className:"no-print flex items-center justify-between px-5 py-3.5 bg-slate-50 border-b border-slate-200",children:[t.jsxs("div",{className:"flex items-center gap-2",children:[t.jsx(z,{className:"w-5 h-5 text-forest-700"}),t.jsx("span",{className:"font-bold text-slate-800 text-sm font-tamil",children:"வாடிக்கையாளர் பில் அச்சிடு (Buyer Bill A5 Print)"})]}),t.jsxs("div",{className:"flex items-center gap-2",children:[x&&t.jsx("span",{className:"text-[11px] font-bold text-forest-700 bg-forest-50 border border-forest-200/80 px-2.5 py-1 rounded-lg",children:x}),t.jsxs("div",{className:"relative inline-flex items-stretch shadow-xs rounded-xl",ref:f,children:[t.jsxs("button",{type:"button",onClick:u,className:"flex items-center gap-1.5 px-3 sm:px-4 py-2 bg-forest-600 hover:bg-forest-700 text-white rounded-l-xl text-xs font-bold shadow-md shadow-forest-600/25 transition-all cursor-pointer active:scale-95",title:"Browser Print Preview (A5 - Exactly 1 Sheet)",children:[t.jsx(z,{className:"w-4 h-4"}),t.jsx("span",{children:"அச்சிடு (Print A5)"})]}),t.jsx("button",{type:"button",onClick:()=>c(!d),className:"px-2 py-2 bg-forest-700 hover:bg-forest-800 text-white rounded-r-xl border-l border-forest-500/50 shadow-md shadow-forest-600/25 transition-all cursor-pointer",title:"Print & Download Options",children:t.jsx(D,{className:`w-3.5 h-3.5 transition-transform duration-200 ${d?"rotate-180":""}`})}),d&&t.jsxs("div",{className:"absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95",onClick:i=>i.stopPropagation(),children:[t.jsxs("button",{type:"button",onClick:u,className:"w-full text-left px-3.5 py-2.5 text-xs font-bold text-slate-800 hover:bg-slate-50 flex items-center gap-2.5 cursor-pointer transition-colors",children:[t.jsx(F,{className:"w-4 h-4 text-slate-600"}),t.jsxs("div",{children:[t.jsx("div",{className:"font-bold",children:"Browser Print Preview"}),t.jsx("div",{className:"text-[10px] text-slate-500 font-normal",children:"A5 portrait (strictly 1 single sheet)"})]})]}),t.jsxs("button",{type:"button",onClick:B,disabled:l,className:"w-full text-left px-3.5 py-2.5 text-xs font-bold text-slate-800 hover:bg-slate-50 flex items-center gap-2.5 cursor-pointer transition-colors disabled:opacity-50",children:[l?t.jsx(A,{className:"w-4 h-4 text-forest-600 animate-spin"}):t.jsx(M,{className:"w-4 h-4 text-forest-600"}),t.jsxs("div",{children:[t.jsx("div",{className:"font-bold text-forest-700",children:"Download Bill Image"}),t.jsx("div",{className:"text-[10px] text-slate-500 font-normal",children:l?"Generating PNG...":"High-resolution A5 PNG (1-click)"})]})]})]})]}),t.jsx("button",{type:"button",onClick:S,className:"p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer",title:"Close",children:t.jsx($,{className:"w-5 h-5"})})]})]}),t.jsx("div",{className:"buyer-modal-body p-4 sm:p-6 overflow-x-auto flex justify-center bg-slate-100/60",children:t.jsx(I,{ref:s,bill:a,settings:p})})]})]}),t.jsx("style",{children:`
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
      `})]});return W.createPortal(j,document.body)};export{O as B};
