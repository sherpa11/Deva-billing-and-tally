import{j as t,b as C}from"./index-DhLRxpjr.js";import{z as D,a as c,h as z,m as F,n as A,o as M,I as $,X as W}from"./vendor-icons-C7i4cu_3.js";import{r as R,d as E}from"./billImageDownload-iBWH9sCq.js";const I=D.forwardRef(({bill:e,settings:S={}},r)=>{var i,s;if(!e)return null;const x=n=>{if(!n)return"";const o=new Date(n);return`${o.getDate().toString().padStart(2,"0")}-${(o.getMonth()+1).toString().padStart(2,"0")}-${o.getFullYear()}`},w=n=>{const o=Number(n)||0,a=Math.abs(o).toFixed(2).split(".");return{rupees:Number(a[0]).toLocaleString("en-IN"),paise:a[1]==="00"?"00":a[1],isNegative:o<0}},l=(n,o=!0)=>{const a=Number(n)||0;return!o&&a===0?"—":`₹${a.toLocaleString("en-IN",{minimumFractionDigits:2,maximumFractionDigits:2})}`},h=((i=e.buyerId)==null?void 0:i.name)||e.buyerName||"வாடிக்கையாளர்",d=((s=e.buyerId)==null?void 0:s.phone)||e.buyerPhone||"",p=e.billNumber||e.transactionNumber||"",g=x(e.transactionDate||e.date||e.createdAt);let m=Array.isArray(e.items)&&e.items.length>0?e.items:[];m.length===0&&(e.bigBoxes>0&&e.smallBoxes>0?m=[{rate:e.ratePerBigBox||0,description:"தக்காளி பெரிய பெட்டி",quantity:e.bigBoxes,amount:e.bigBoxes*(e.ratePerBigBox||0)},{rate:Math.round((e.ratePerBigBox||0)*.5),description:"தக்காளி சிறிய பெட்டி",quantity:e.smallBoxes,amount:e.smallBoxes*Math.round((e.ratePerBigBox||0)*.5)}]:m=[{rate:e.ratePerBigBox||0,description:e.smallBoxes>0?"தக்காளி சிறிய பெட்டி":"தக்காளி பெரிய பெட்டி",quantity:e.bigEquivalent||e.bigBoxes||e.smallBoxes||e.quantity||1,amount:e.billAmount||e.totalAmount||(e.bigEquivalent||e.bigBoxes||1)*(e.ratePerBigBox||0)||0}]);const u=Number(e.billAmount)||Number(e.totalAmount)||m.reduce((n,o)=>n+(Number(o.amount)||0),0),f=Number(e.oldBalance)||Number(e.previousBalance)||0,N=Math.round((u+f)*100)/100,b=Number(e.amountPaid)||0,j=e.newBalance!==void 0&&e.newBalance!==null?Number(e.newBalance):Math.round((N-b)*100)/100,v=38,B=8;return t.jsxs("div",{ref:r,id:"buyer-printable-bill",className:"buyer-bill-canvas",style:{position:"relative",width:"138mm",height:"195.4mm",maxWidth:"138mm",maxHeight:"195.4mm",margin:"0 auto",padding:0,boxSizing:"border-box",overflow:"hidden",backgroundColor:"#ffffff",fontFamily:'"Noto Sans Tamil", "Mukta Malar", sans-serif',userSelect:"none",WebkitPrintColorAdjust:"exact",printColorAdjust:"exact"},children:[t.jsx("img",{src:"/buyer-bill-template.jpg",alt:"DEVA & CO Buyer Bill Pad",style:{position:"absolute",top:0,left:0,width:"100%",height:"100%",objectFit:"fill",pointerEvents:"none",userSelect:"none",display:"block",zIndex:1}}),t.jsx("div",{style:{position:"absolute",zIndex:10,top:"17.8%",left:"12.5%",width:"51.0%",height:"3.8%",display:"flex",alignItems:"center",paddingLeft:"6px",boxSizing:"border-box",overflow:"hidden"},children:t.jsxs("span",{style:{fontFamily:'"Noto Sans Tamil", "Mukta Malar", sans-serif',fontSize:"15px",fontWeight:700,color:"#0f172a",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",letterSpacing:"-0.2px"},children:[h," ",d?`(${d})`:""," ",p?`(பில்: #${p})`:""]})}),t.jsx("div",{style:{position:"absolute",zIndex:10,top:"17.8%",left:"73.5%",width:"22.5%",height:"3.8%",display:"flex",alignItems:"center",justifyContent:"center",boxSizing:"border-box"},children:t.jsx("span",{style:{fontFamily:"Inter, system-ui, sans-serif",fontSize:"14.5px",fontWeight:700,color:"#0f172a",letterSpacing:"-0.3px"},children:g})}),t.jsx("div",{style:{position:"absolute",zIndex:10,top:"31.2%",left:"3.32%",width:"93.64%",height:"42.0%",boxSizing:"border-box",overflow:"hidden"},children:m.map((n,o)=>{const a=w(n.amount),y=n.rate||n.ratePerBigBox||0,P=n.quantity||n.bigEquivalent||n.bigBoxes||n.smallBoxes||"—",k=o*(v+B);return t.jsxs("div",{style:{position:"absolute",top:`${k}px`,left:0,width:"100%",height:`${v}px`,display:"flex",alignItems:"center",boxSizing:"border-box"},children:[t.jsx("div",{style:{width:"14.22%",height:"100%",display:"flex",alignItems:"center",justifyContent:"center",boxSizing:"border-box"},children:t.jsx("span",{style:{fontFamily:"Inter, system-ui, sans-serif",fontSize:"15px",fontWeight:700,color:"#0f172a",letterSpacing:"-0.2px"},children:y>0?`₹${y}`:"—"})}),t.jsx("div",{style:{width:"48.88%",height:"100%",display:"flex",alignItems:"center",justifyContent:"flex-start",paddingLeft:"14px",paddingRight:"10px",boxSizing:"border-box",overflow:"hidden"},children:t.jsx("span",{style:{fontFamily:'"Noto Sans Tamil", "Mukta Malar", sans-serif',fontSize:"14.5px",fontWeight:700,color:"#0f172a",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",lineHeight:"1.3"},children:n.description||"தக்காளி பெட்டி"})}),t.jsx("div",{style:{width:"13.18%",height:"100%",display:"flex",alignItems:"center",justifyContent:"center",boxSizing:"border-box"},children:t.jsx("span",{style:{fontFamily:"Inter, system-ui, sans-serif",fontSize:"15.5px",fontWeight:700,color:"#0f172a"},children:P})}),t.jsxs("div",{style:{width:"23.70%",height:"100%",display:"flex",alignItems:"center",boxSizing:"border-box"},children:[t.jsx("div",{style:{width:"68%",textAlign:"right",paddingRight:"12px",boxSizing:"border-box"},children:t.jsx("span",{style:{fontFamily:"Inter, system-ui, sans-serif",fontSize:"15.5px",fontWeight:700,color:"#0f172a",letterSpacing:"-0.3px"},children:a.rupees})}),t.jsx("div",{style:{width:"32%",textAlign:"center",boxSizing:"border-box"},children:t.jsx("span",{style:{fontFamily:"Inter, system-ui, sans-serif",fontSize:"13px",fontWeight:700,color:"#334155"},children:a.paise})})]})]},o)})}),t.jsx("div",{style:{position:"absolute",zIndex:10,top:"74.41%",left:"64.59%",width:"32.09%",height:"4.10%",display:"flex",alignItems:"center",justifyContent:"flex-end",paddingRight:"16px",boxSizing:"border-box"},children:t.jsx("span",{style:{fontFamily:"Inter, system-ui, sans-serif",fontSize:"16.5px",fontWeight:700,color:"#0f172a",letterSpacing:"-0.3px"},children:l(u)})}),t.jsx("div",{style:{position:"absolute",zIndex:10,top:"78.51%",left:"64.59%",width:"32.09%",height:"3.32%",display:"flex",alignItems:"center",justifyContent:"flex-end",paddingRight:"16px",boxSizing:"border-box"},children:t.jsx("span",{style:{fontFamily:"Inter, system-ui, sans-serif",fontSize:"15.5px",fontWeight:700,color:"#0f172a",letterSpacing:"-0.3px"},children:f>0?l(f):"—"})}),t.jsx("div",{style:{position:"absolute",zIndex:10,top:"81.83%",left:"64.59%",width:"32.09%",height:"3.52%",display:"flex",alignItems:"center",justifyContent:"flex-end",paddingRight:"16px",boxSizing:"border-box"},children:t.jsx("span",{style:{fontFamily:"Inter, system-ui, sans-serif",fontSize:"18px",fontWeight:800,color:"#0f172a",letterSpacing:"-0.3px"},children:l(N)})}),t.jsx("div",{style:{position:"absolute",zIndex:10,top:"85.35%",left:"64.59%",width:"32.09%",height:"3.52%",display:"flex",alignItems:"center",justifyContent:"flex-end",paddingRight:"16px",boxSizing:"border-box"},children:t.jsx("span",{style:{fontFamily:"Inter, system-ui, sans-serif",fontSize:"16px",fontWeight:700,color:"#15803d",letterSpacing:"-0.3px"},children:b>0?l(b):"₹0"})}),t.jsx("div",{style:{position:"absolute",zIndex:10,top:"88.87%",left:"64.59%",width:"32.09%",height:"4.29%",display:"flex",alignItems:"center",justifyContent:"flex-end",paddingRight:"16px",boxSizing:"border-box"},children:t.jsx("span",{style:{fontFamily:"Inter, system-ui, sans-serif",fontSize:"18px",fontWeight:800,color:"#dc2626",letterSpacing:"-0.3px"},children:l(j)})})]})});I.displayName="BuyerBillPad";const T=({isOpen:e,onClose:S,bill:r})=>{const{settings:x,fetchSettings:w}=C(),l=c.useRef(),h=c.useRef(),[d,p]=c.useState(!1),[g,m]=c.useState(!1),[u,f]=c.useState("");if(c.useEffect(()=>{e&&(!x||Object.keys(x).length===0)&&typeof w=="function"&&w()},[e,x]),c.useEffect(()=>{const i=s=>{h.current&&!h.current.contains(s.target)&&p(!1)};return d&&document.addEventListener("mousedown",i),()=>{document.removeEventListener("mousedown",i)}},[d]),!e||!r)return null;const b=(i=>{if(!i)return"";const s=new Date(i);return`${s.getDate().toString().padStart(2,"0")}-${(s.getMonth()+1).toString().padStart(2,"0")}-${s.getFullYear()}`})(r.transactionDate||r.date||r.createdAt),j=()=>{p(!1),window.print()},v=async()=>{var a;if(p(!1),!l.current)return;m(!0);const i=(((a=r.buyerId)==null?void 0:a.name)||r.buyerName||"Buyer").trim().replace(/[\/\s]+/g,"_").replace(/[^a-zA-Z0-9_\-\u0B80-\u0BFF]/g,""),s=r.billNumber||r.transactionNumber||"",n=b.replace(/[\/\s]/g,"-"),o=`Deva_Buyer_Bill_${i}${s?`_${s}`:""}_${n}.png`;await E(l.current,{filename:o,targetWidthPx:723,targetHeightPx:1024,shareTitle:`Buyer Bill - ${i}`,onStatusChange:y=>{f(y),y&&setTimeout(()=>f(""),4e3)}}),m(!1)},B=t.jsxs("div",{className:"buyer-modal-portal fixed inset-0 z-50 overflow-y-auto",children:[t.jsxs("div",{className:"buyer-modal-wrap flex min-h-screen items-center justify-center p-2 sm:p-4",children:[t.jsx("div",{className:"fixed inset-0 bg-slate-900/60 backdrop-blur-xs no-print",onClick:S}),t.jsxs("div",{className:"buyer-modal-card relative bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden my-4",children:[t.jsxs("div",{className:"no-print flex items-center justify-between px-5 py-3.5 bg-slate-50 border-b border-slate-200",children:[t.jsxs("div",{className:"flex items-center gap-2",children:[t.jsx(z,{className:"w-5 h-5 text-forest-700"}),t.jsx("span",{className:"font-bold text-slate-800 text-sm font-tamil",children:"வாடிக்கையாளர் பில் அச்சிடு (Buyer Bill A5 Print)"})]}),t.jsxs("div",{className:"flex items-center gap-2",children:[u&&t.jsx("span",{className:"text-[11px] font-bold text-forest-700 bg-forest-50 border border-forest-200/80 px-2.5 py-1 rounded-lg",children:u}),t.jsxs("div",{className:"relative inline-flex items-stretch shadow-xs rounded-xl",ref:h,children:[t.jsxs("button",{type:"button",onClick:j,className:"flex items-center gap-1.5 px-3 sm:px-4 py-2 bg-forest-600 hover:bg-forest-700 text-white rounded-l-xl text-xs font-bold shadow-md shadow-forest-600/25 transition-all cursor-pointer active:scale-95",title:"Browser Print Preview (A5 - Exactly 1 Sheet)",children:[t.jsx(z,{className:"w-4 h-4"}),t.jsx("span",{children:"அச்சிடு (Print A5)"})]}),t.jsx("button",{type:"button",onClick:()=>p(!d),className:"px-2 py-2 bg-forest-700 hover:bg-forest-800 text-white rounded-r-xl border-l border-forest-500/50 shadow-md shadow-forest-600/25 transition-all cursor-pointer",title:"Print & Download Options",children:t.jsx(F,{className:`w-3.5 h-3.5 transition-transform duration-200 ${d?"rotate-180":""}`})}),d&&t.jsxs("div",{className:"absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95",onClick:i=>i.stopPropagation(),children:[t.jsxs("button",{type:"button",onClick:j,className:"w-full text-left px-3.5 py-2.5 text-xs font-bold text-slate-800 hover:bg-slate-50 flex items-center gap-2.5 cursor-pointer transition-colors",children:[t.jsx(A,{className:"w-4 h-4 text-slate-600"}),t.jsxs("div",{children:[t.jsx("div",{className:"font-bold",children:"Browser Print Preview"}),t.jsx("div",{className:"text-[10px] text-slate-500 font-normal",children:"A5 portrait (strictly 1 single sheet)"})]})]}),t.jsxs("button",{type:"button",onClick:v,disabled:g,className:"w-full text-left px-3.5 py-2.5 text-xs font-bold text-slate-800 hover:bg-slate-50 flex items-center gap-2.5 cursor-pointer transition-colors disabled:opacity-50",children:[g?t.jsx(M,{className:"w-4 h-4 text-forest-600 animate-spin"}):t.jsx($,{className:"w-4 h-4 text-forest-600"}),t.jsxs("div",{children:[t.jsx("div",{className:"font-bold text-forest-700",children:"Download Bill Image"}),t.jsx("div",{className:"text-[10px] text-slate-500 font-normal",children:g?"Generating PNG...":"High-resolution A5 PNG (1-click)"})]})]})]})]}),t.jsx("button",{type:"button",onClick:S,className:"p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer",title:"Close",children:t.jsx(W,{className:"w-5 h-5"})})]})]}),t.jsx("div",{className:"buyer-modal-body p-4 sm:p-6 overflow-x-auto flex justify-center bg-slate-100/60",children:t.jsx(I,{ref:l,bill:r,settings:x})})]})]}),t.jsx("style",{children:`
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
      `})]});return R.createPortal(B,document.body)};export{T as B};
