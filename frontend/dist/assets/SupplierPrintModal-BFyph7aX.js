import{j as t,b as W}from"./index-DhLRxpjr.js";import{z as D,a as p,h as C,m as R,n as M,o as $,I as L,X as E}from"./vendor-icons-C7i4cu_3.js";import{r as T,d as q}from"./billImageDownload-iBWH9sCq.js";const F=D.forwardRef(({bill:e,settings:B={}},r)=>{var P,k;if(!e)return null;const m=n=>{if(!n)return"";const o=new Date(n);return`${o.getDate().toString().padStart(2,"0")}-${(o.getMonth()+1).toString().padStart(2,"0")}-${o.getFullYear()}`},x=n=>{const o=Number(n)||0,b=Math.abs(o).toFixed(2).split(".");return{rupees:Number(b[0]).toLocaleString("en-IN"),paise:b[1]==="00"?"00":b[1],isNegative:o<0}},y=((P=e.supplierId)==null?void 0:P.name)||e.supplierName||"விவசாயி / விற்பனையாளர்",c=((k=e.supplierId)==null?void 0:k.phone)||"",d=m(e.transactionDate||e.createdAt);let s=Array.isArray(e.items)&&e.items.length>0?e.items:[];s.length===0&&(e.bigBoxes>0&&e.smallBoxes>0?s=[{rate:e.ratePerBigBox||0,description:"தக்காளி பெரிய பெட்டி",quantity:e.bigBoxes,amount:e.bigBoxes*(e.ratePerBigBox||0)},{rate:Math.round((e.ratePerBigBox||0)*.5),description:"தக்காளி சிறிய பெட்டி",quantity:e.smallBoxes,amount:e.smallBoxes*Math.round((e.ratePerBigBox||0)*.5)}]:s=[{rate:e.ratePerBigBox||0,description:e.smallBoxes>0?"தக்காளி சிறிய பெட்டி":"தக்காளி பெரிய பெட்டி",quantity:e.quantity||e.bigEquivalent||e.bigBoxes||e.smallBoxes||0,amount:e.grossTotal||e.totalAmount||(e.bigEquivalent||e.bigBoxes||0)*(e.ratePerBigBox||0)||0}]);const f=Number(e.grossTotal)||Number(e.totalAmount)||s.reduce((n,o)=>n+(Number(o.amount)||0),0),l=e.deductions||{},h=Number(l.commission)||0,g=Number(l.gate)||0,S=Number(l.coolie)||0,w=Number(l.rent)||0,u=e.previousBalance!==void 0&&e.previousBalance!==null?Number(e.previousBalance):e.oldBalance!==void 0?Number(e.oldBalance):Number(l.debit)||0,I=e.totalPayable!==void 0&&e.totalPayable!==null?Number(e.totalPayable):e.netPayable!==void 0?Number(e.netPayable):Math.max(0,f-(h+g+S+w)+u),j=Number(e.amountPaid)||0,i=e.remainingBalance!==void 0&&e.remainingBalance!==null?Number(e.remainingBalance):e.newBalance!==void 0?Number(e.newBalance):Math.round((I-j)*100)/100,a=x(f),N=x(I),v=38,z=8;return t.jsxs("div",{ref:r,id:"supplier-printable-bill",className:"supplier-bill-canvas",style:{position:"relative",width:"138mm",height:"195.4mm",maxWidth:"138mm",maxHeight:"195.4mm",margin:"0 auto",padding:0,boxSizing:"border-box",overflow:"hidden",backgroundColor:"#ffffff",fontFamily:'"Noto Sans Tamil", "Mukta Malar", sans-serif',userSelect:"none",WebkitPrintColorAdjust:"exact",printColorAdjust:"exact"},children:[t.jsx("img",{src:"/supplier-bill-template.jpg",alt:"DEVA & CO Supplier Bill Pad",style:{position:"absolute",top:0,left:0,width:"100%",height:"100%",objectFit:"fill",pointerEvents:"none",userSelect:"none",display:"block",zIndex:1}}),t.jsx("div",{style:{position:"absolute",zIndex:10,top:"17.8%",left:"12.5%",width:"51.0%",height:"3.8%",display:"flex",alignItems:"center",paddingLeft:"6px",boxSizing:"border-box",overflow:"hidden"},children:t.jsxs("span",{style:{fontFamily:'"Noto Sans Tamil", "Mukta Malar", sans-serif',fontSize:"15px",fontWeight:700,color:"#0f172a",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",letterSpacing:"-0.2px"},children:[y," ",c?`(${c})`:""]})}),t.jsx("div",{style:{position:"absolute",zIndex:10,top:"17.8%",left:"73.5%",width:"22.5%",height:"3.8%",display:"flex",alignItems:"center",justifyContent:"center",boxSizing:"border-box"},children:t.jsx("span",{style:{fontFamily:"Inter, system-ui, sans-serif",fontSize:"14.5px",fontWeight:700,color:"#0f172a",letterSpacing:"-0.3px"},children:d})}),t.jsx("div",{style:{position:"absolute",zIndex:10,top:"31.2%",left:"3.32%",width:"93.64%",height:"34.5%",boxSizing:"border-box",overflow:"hidden"},children:s.map((n,o)=>{const b=x(n.amount),A=o*(v+z);return t.jsxs("div",{style:{position:"absolute",top:`${A}px`,left:0,width:"100%",height:`${v}px`,display:"flex",alignItems:"center",boxSizing:"border-box"},children:[t.jsx("div",{style:{width:"14.33%",height:"100%",display:"flex",alignItems:"center",justifyContent:"center",boxSizing:"border-box"},children:t.jsx("span",{style:{fontFamily:"Inter, system-ui, sans-serif",fontSize:"15px",fontWeight:700,color:"#0f172a",letterSpacing:"-0.2px"},children:n.rate>0?`₹${n.rate}`:"—"})}),t.jsx("div",{style:{width:"48.74%",height:"100%",display:"flex",alignItems:"center",justifyContent:"flex-start",paddingLeft:"14px",paddingRight:"10px",boxSizing:"border-box",overflow:"hidden"},children:t.jsx("span",{style:{fontFamily:'"Noto Sans Tamil", "Mukta Malar", sans-serif',fontSize:"14.5px",fontWeight:700,color:"#0f172a",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",lineHeight:"1.3"},children:n.description})}),t.jsx("div",{style:{width:"13.44%",height:"100%",display:"flex",alignItems:"center",justifyContent:"center",boxSizing:"border-box"},children:t.jsx("span",{style:{fontFamily:"Inter, system-ui, sans-serif",fontSize:"15.5px",fontWeight:700,color:"#0f172a"},children:n.quantity})}),t.jsxs("div",{style:{width:"23.49%",height:"100%",display:"flex",alignItems:"center",boxSizing:"border-box"},children:[t.jsx("div",{style:{width:"68%",textAlign:"right",paddingRight:"12px",boxSizing:"border-box"},children:t.jsx("span",{style:{fontFamily:"Inter, system-ui, sans-serif",fontSize:"15.5px",fontWeight:700,color:"#0f172a",letterSpacing:"-0.3px"},children:b.rupees})}),t.jsx("div",{style:{width:"32%",textAlign:"center",boxSizing:"border-box"},children:t.jsx("span",{style:{fontFamily:"Inter, system-ui, sans-serif",fontSize:"13px",fontWeight:700,color:"#334155"},children:b.paise})})]})]},o)})}),t.jsxs("div",{style:{position:"absolute",zIndex:10,top:"65.82%",left:"72.75%",width:"24.20%",height:"4.69%",display:"flex",alignItems:"center",boxSizing:"border-box"},children:[t.jsx("div",{style:{width:"68%",textAlign:"right",paddingRight:"12px",boxSizing:"border-box"},children:t.jsx("span",{style:{fontFamily:"Inter, system-ui, sans-serif",fontSize:"16.5px",fontWeight:700,color:"#0f172a",letterSpacing:"-0.3px"},children:a.rupees})}),t.jsx("div",{style:{width:"32%",textAlign:"center",boxSizing:"border-box"},children:t.jsx("span",{style:{fontFamily:"Inter, system-ui, sans-serif",fontSize:"13px",fontWeight:700,color:"#334155"},children:a.paise})})]}),t.jsx("div",{style:{position:"absolute",zIndex:10,top:"70.61%",left:"21.0%",width:"25.0%",height:"3.61%",display:"flex",alignItems:"center",justifyContent:"flex-end",paddingRight:"14px",boxSizing:"border-box"},children:t.jsx("span",{style:{fontFamily:"Inter, system-ui, sans-serif",fontSize:"15px",fontWeight:700,color:"#0f172a"},children:h>0?h.toLocaleString("en-IN"):"—"})}),t.jsx("div",{style:{position:"absolute",zIndex:10,top:"70.61%",left:"65.5%",width:"30.5%",height:"3.61%",display:"flex",alignItems:"center",justifyContent:"flex-end",paddingRight:"18px",boxSizing:"border-box"},children:t.jsx("span",{style:{fontFamily:"Inter, system-ui, sans-serif",fontSize:"15px",fontWeight:700,color:"#0f172a"},children:g>0?g.toLocaleString("en-IN"):"—"})}),t.jsx("div",{style:{position:"absolute",zIndex:10,top:"74.32%",left:"16.5%",width:"29.5%",height:"3.81%",display:"flex",alignItems:"center",justifyContent:"flex-end",paddingRight:"14px",boxSizing:"border-box"},children:t.jsx("span",{style:{fontFamily:"Inter, system-ui, sans-serif",fontSize:"15px",fontWeight:700,color:"#0f172a"},children:S>0?S.toLocaleString("en-IN"):"—"})}),t.jsx("div",{style:{position:"absolute",zIndex:10,top:"74.32%",left:"65.5%",width:"30.5%",height:"3.81%",display:"flex",alignItems:"center",justifyContent:"flex-end",paddingRight:"18px",boxSizing:"border-box"},children:t.jsx("span",{style:{fontFamily:"Inter, system-ui, sans-serif",fontSize:"15px",fontWeight:700,color:"#0f172a"},children:w>0?w.toLocaleString("en-IN"):"—"})}),t.jsx("div",{style:{position:"absolute",zIndex:10,top:"78.22%",left:"72.75%",width:"24.20%",height:"3.91%",display:"flex",alignItems:"center",justifyContent:"flex-end",paddingRight:"18px",boxSizing:"border-box"},children:t.jsx("span",{style:{fontFamily:"Inter, system-ui, sans-serif",fontSize:"16.5px",fontWeight:700,color:"#0f172a"},children:u?u.toLocaleString("en-IN"):"—"})}),t.jsxs("div",{style:{position:"absolute",zIndex:10,top:"82.23%",left:"72.75%",width:"24.20%",height:"4.79%",display:"flex",alignItems:"center",boxSizing:"border-box"},children:[t.jsx("div",{style:{width:"68%",textAlign:"right",paddingRight:"12px",boxSizing:"border-box"},children:t.jsx("span",{style:{fontFamily:"Inter, system-ui, sans-serif",fontSize:"18px",fontWeight:800,color:"#0f172a",letterSpacing:"-0.3px"},children:N.rupees})}),t.jsx("div",{style:{width:"32%",textAlign:"center",boxSizing:"border-box"},children:t.jsx("span",{style:{fontFamily:"Inter, system-ui, sans-serif",fontSize:"14px",fontWeight:800,color:"#0f172a"},children:N.paise})})]}),t.jsx("div",{style:{position:"absolute",zIndex:10,top:"87.11%",left:"26.28%",width:"22.54%",height:"5.47%",display:"flex",alignItems:"center",justifyContent:"flex-end",paddingRight:"12px",boxSizing:"border-box"},children:t.jsx("span",{style:{fontFamily:"Inter, system-ui, sans-serif",fontSize:"16px",fontWeight:700,color:"#15803d"},children:j>0?`₹${j.toLocaleString("en-IN")}`:"₹0"})}),t.jsx("div",{style:{position:"absolute",zIndex:10,top:"87.11%",left:"72.06%",width:"24.90%",height:"5.47%",display:"flex",alignItems:"center",justifyContent:"flex-end",paddingRight:"16px",boxSizing:"border-box"},children:t.jsxs("span",{style:{fontFamily:"Inter, system-ui, sans-serif",fontSize:"17px",fontWeight:800,color:"#dc2626"},children:["₹",i.toLocaleString("en-IN")]})})]})});F.displayName="SupplierBillPad";const H=({isOpen:e,onClose:B,bill:r})=>{const{settings:m,fetchSettings:x}=W(),y=p.useRef(),c=p.useRef(),[d,s]=p.useState(!1),[f,l]=p.useState(!1),[h,g]=p.useState("");if(p.useEffect(()=>{e&&(!m||Object.keys(m).length===0)&&typeof x=="function"&&x()},[e,m]),p.useEffect(()=>{const i=a=>{c.current&&!c.current.contains(a.target)&&s(!1)};return d&&document.addEventListener("mousedown",i),()=>{document.removeEventListener("mousedown",i)}},[d]),!e||!r)return null;const w=(i=>{if(!i)return"";const a=new Date(i);return`${a.getDate().toString().padStart(2,"0")}-${(a.getMonth()+1).toString().padStart(2,"0")}-${a.getFullYear()}`})(r.transactionDate||r.createdAt),u=()=>{s(!1),window.print()},I=async()=>{var v;if(s(!1),!y.current)return;l(!0);const i=(((v=r.supplierId)==null?void 0:v.name)||r.supplierName||"Supplier").trim().replace(/[\/\s]+/g,"_").replace(/[^a-zA-Z0-9_\-\u0B80-\u0BFF]/g,""),a=w.replace(/[\/\s]/g,"-"),N=`Deva_Supplier_Bill_${i}_${a}.png`;await q(y.current,{filename:N,targetWidthPx:723,targetHeightPx:1024,shareTitle:`Supplier Bill - ${i}`,onStatusChange:z=>{g(z),z&&setTimeout(()=>g(""),4e3)}}),l(!1)},j=t.jsxs("div",{className:"supplier-modal-portal fixed inset-0 z-50 overflow-y-auto",children:[t.jsxs("div",{className:"supplier-modal-wrap flex min-h-screen items-center justify-center p-2 sm:p-4",children:[t.jsx("div",{className:"fixed inset-0 bg-slate-900/60 backdrop-blur-xs no-print",onClick:B}),t.jsxs("div",{className:"supplier-modal-card relative bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden my-4",children:[t.jsxs("div",{className:"no-print flex items-center justify-between px-5 py-3.5 bg-slate-50 border-b border-slate-200",children:[t.jsxs("div",{className:"flex items-center gap-2",children:[t.jsx(C,{className:"w-5 h-5 text-forest-700"}),t.jsx("span",{className:"font-bold text-slate-800 text-sm font-tamil",children:"விவசாயி பில் அச்சிடு (Supplier Bill A5 Print)"})]}),t.jsxs("div",{className:"flex items-center gap-2",children:[h&&t.jsx("span",{className:"text-[11px] font-bold text-forest-700 bg-forest-50 border border-forest-200/80 px-2.5 py-1 rounded-lg",children:h}),t.jsxs("div",{className:"relative inline-flex items-stretch shadow-xs rounded-xl",ref:c,children:[t.jsxs("button",{type:"button",onClick:u,className:"flex items-center gap-1.5 px-3 sm:px-4 py-2 bg-forest-600 hover:bg-forest-700 text-white rounded-l-xl text-xs font-bold shadow-md shadow-forest-600/25 transition-all cursor-pointer active:scale-95",title:"Browser Print Preview (A5 - Exactly 1 Sheet)",children:[t.jsx(C,{className:"w-4 h-4"}),t.jsx("span",{children:"அச்சிடு (Print A5)"})]}),t.jsx("button",{type:"button",onClick:()=>s(!d),className:"px-2 py-2 bg-forest-700 hover:bg-forest-800 text-white rounded-r-xl border-l border-forest-500/50 shadow-md shadow-forest-600/25 transition-all cursor-pointer",title:"Print & Download Options",children:t.jsx(R,{className:`w-3.5 h-3.5 transition-transform duration-200 ${d?"rotate-180":""}`})}),d&&t.jsxs("div",{className:"absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95",onClick:i=>i.stopPropagation(),children:[t.jsxs("button",{type:"button",onClick:u,className:"w-full text-left px-3.5 py-2.5 text-xs font-bold text-slate-800 hover:bg-slate-50 flex items-center gap-2.5 cursor-pointer transition-colors",children:[t.jsx(M,{className:"w-4 h-4 text-slate-600"}),t.jsxs("div",{children:[t.jsx("div",{className:"font-bold",children:"Browser Print Preview"}),t.jsx("div",{className:"text-[10px] text-slate-500 font-normal",children:"A5 portrait (strictly 1 single sheet)"})]})]}),t.jsxs("button",{type:"button",onClick:I,disabled:f,className:"w-full text-left px-3.5 py-2.5 text-xs font-bold text-slate-800 hover:bg-slate-50 flex items-center gap-2.5 cursor-pointer transition-colors disabled:opacity-50",children:[f?t.jsx($,{className:"w-4 h-4 text-forest-600 animate-spin"}):t.jsx(L,{className:"w-4 h-4 text-forest-600"}),t.jsxs("div",{children:[t.jsx("div",{className:"font-bold text-forest-700",children:"Download Bill Image"}),t.jsx("div",{className:"text-[10px] text-slate-500 font-normal",children:f?"Generating PNG...":"High-resolution A5 PNG (1-click)"})]})]})]})]}),t.jsx("button",{type:"button",onClick:B,className:"p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer",title:"Close",children:t.jsx(E,{className:"w-5 h-5"})})]})]}),t.jsx("div",{className:"supplier-modal-body p-4 sm:p-6 overflow-x-auto flex justify-center bg-slate-100/60",children:t.jsx(F,{ref:y,bill:r,settings:m})})]})]}),t.jsx("style",{children:`
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
          .supplier-modal-portal {
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
          .supplier-modal-wrap {
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
          .supplier-modal-card {
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
          .supplier-modal-body {
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
          #supplier-printable-bill {
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
      `})]});return T.createPortal(j,document.body)};export{H as S};
