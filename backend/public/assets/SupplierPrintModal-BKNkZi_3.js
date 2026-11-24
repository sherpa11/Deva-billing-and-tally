import{j as t,b as R}from"./index-3F4T2F8I.js";import{z as M,a as l,h as F,m as L,n as $,o as E,I as T,X as q}from"./vendor-icons-C7i4cu_3.js";import{r as O,d as _}from"./billImageDownload-DA22CFgL.js";const A=M.forwardRef(({bill:e,supplier:x,settings:a={}},c)=>{const[f,p]=l.useState(!1);if(l.useEffect(()=>{const i=new Image;i.src="/supplier-bill-template.jpg",i.complete?p(!0):(i.onload=()=>p(!0),i.onerror=()=>p(!0))},[]),!e)return null;const w=i=>{if(!i)return"";const s=new Date(i);return`${s.getDate().toString().padStart(2,"0")}-${(s.getMonth()+1).toString().padStart(2,"0")}-${s.getFullYear()}`},m=i=>{const s=Number(i)||0,b=Math.abs(s).toFixed(2).split(".");return{rupees:Number(b[0]).toLocaleString("en-IN"),paise:b[1]==="00"?"00":b[1],isNegative:s<0}},o=e.supplierId&&typeof e.supplierId=="object"?e.supplierId:x&&typeof x=="object"?x:e.supplier&&typeof e.supplier=="object"?e.supplier:null,h=e.supplierName||(o==null?void 0:o.name)||"",g=e.supplierPhone||(o==null?void 0:o.phone)||"",B=w(e.transactionDate||e.createdAt);let d=Array.isArray(e.items)&&e.items.length>0?e.items:[];d.length===0&&(e.bigBoxes>0&&e.smallBoxes>0?d=[{rate:e.ratePerBigBox||0,description:"தக்காளி பெரிய பெட்டி",quantity:e.bigBoxes,amount:e.bigBoxes*(e.ratePerBigBox||0)},{rate:Math.round((e.ratePerBigBox||0)*.5),description:"தக்காளி சிறிய பெட்டி",quantity:e.smallBoxes,amount:e.smallBoxes*Math.round((e.ratePerBigBox||0)*.5)}]:d=[{rate:e.ratePerBigBox||0,description:e.smallBoxes>0?"தக்காளி சிறிய பெட்டி":"தக்காளி பெரிய பெட்டி",quantity:e.quantity||e.bigEquivalent||e.bigBoxes||e.smallBoxes||0,amount:e.grossTotal||e.totalAmount||(e.bigEquivalent||e.bigBoxes||0)*(e.ratePerBigBox||0)||0}]);const j=Number(e.grossTotal)||Number(e.totalAmount)||d.reduce((i,s)=>i+(Number(s.amount)||0),0),u=e.deductions||{},v=Number(u.commission)||0,y=Number(u.gate)||0,S=Number(u.coolie)||0,I=Number(u.rent)||0,n=e.previousBalance!==void 0&&e.previousBalance!==null?Number(e.previousBalance):e.oldBalance!==void 0?Number(e.oldBalance):Number(u.debit)||0,r=e.totalPayable!==void 0&&e.totalPayable!==null?Number(e.totalPayable):e.netPayable!==void 0?Number(e.netPayable):Math.max(0,j-(v+y+S+I)+n),N=Number(e.amountPaid)||0,P=e.remainingBalance!==void 0&&e.remainingBalance!==null?Number(e.remainingBalance):e.newBalance!==void 0?Number(e.newBalance):Math.round((r-N)*100)/100,z=m(j),C=m(r),k=38,W=8;return t.jsxs("div",{ref:c,id:"supplier-printable-bill",className:"supplier-bill-canvas",style:{position:"relative",width:"138mm",height:"195.4mm",maxWidth:"138mm",maxHeight:"195.4mm",margin:"0 auto",padding:0,boxSizing:"border-box",overflow:"hidden",backgroundColor:"#ffffff",fontFamily:'"Noto Sans Tamil", "Mukta Malar", sans-serif',userSelect:"none",WebkitPrintColorAdjust:"exact",printColorAdjust:"exact"},children:[!f&&t.jsxs("div",{className:"no-print",style:{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",backgroundColor:"#ffffff",zIndex:20},children:[t.jsx("div",{style:{width:"28px",height:"28px",border:"3px solid #166534",borderTopColor:"transparent",borderRadius:"50%",animation:"spin 0.8s linear infinite"}}),t.jsx("span",{style:{marginTop:"8px",fontSize:"11px",fontWeight:700,color:"#166534",fontFamily:"sans-serif"},children:"Loading Bill Pad..."})]}),t.jsx("img",{src:"/supplier-bill-template.jpg",alt:"DEVA & CO Supplier Bill Pad",loading:"eager",fetchpriority:"high",decoding:"sync",onLoad:()=>p(!0),style:{position:"absolute",top:0,left:0,width:"100%",height:"100%",objectFit:"fill",pointerEvents:"none",userSelect:"none",display:"block",zIndex:1}}),t.jsx("div",{style:{position:"absolute",zIndex:10,top:"18.7%",left:"12.5%",width:"51.0%",height:"3.6%",display:"flex",alignItems:"center",paddingLeft:"6px",boxSizing:"border-box",overflow:"hidden"},children:t.jsxs("span",{style:{fontFamily:'"Noto Sans Tamil", "Mukta Malar", sans-serif',fontSize:"15px",fontWeight:700,color:"#0f172a",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",letterSpacing:"-0.2px"},children:[h," ",g?`(${g})`:""]})}),t.jsx("div",{style:{position:"absolute",zIndex:10,top:"18.7%",left:"73.5%",width:"22.5%",height:"3.6%",display:"flex",alignItems:"center",justifyContent:"center",boxSizing:"border-box"},children:t.jsx("span",{style:{fontFamily:"Inter, system-ui, sans-serif",fontSize:"14.5px",fontWeight:700,color:"#0f172a",letterSpacing:"-0.3px"},children:B})}),t.jsx("div",{style:{position:"absolute",zIndex:10,top:"31.2%",left:"3.32%",width:"93.64%",height:"34.5%",boxSizing:"border-box",overflow:"hidden"},children:d.map((i,s)=>{const b=m(i.amount),D=s*(k+W);return t.jsxs("div",{style:{position:"absolute",top:`${D}px`,left:0,width:"100%",height:`${k}px`,display:"flex",alignItems:"center",boxSizing:"border-box"},children:[t.jsx("div",{style:{width:"14.33%",height:"100%",display:"flex",alignItems:"center",justifyContent:"center",boxSizing:"border-box"},children:t.jsx("span",{style:{fontFamily:"Inter, system-ui, sans-serif",fontSize:"15px",fontWeight:700,color:"#0f172a",letterSpacing:"-0.2px"},children:i.rate>0?`₹${i.rate}`:"—"})}),t.jsx("div",{style:{width:"48.74%",height:"100%",display:"flex",alignItems:"center",justifyContent:"flex-start",paddingLeft:"14px",paddingRight:"10px",boxSizing:"border-box",overflow:"hidden"},children:t.jsx("span",{style:{fontFamily:'"Noto Sans Tamil", "Mukta Malar", sans-serif',fontSize:"14.5px",fontWeight:700,color:"#0f172a",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",lineHeight:"1.3"},children:i.description})}),t.jsx("div",{style:{width:"13.44%",height:"100%",display:"flex",alignItems:"center",justifyContent:"center",boxSizing:"border-box"},children:t.jsx("span",{style:{fontFamily:"Inter, system-ui, sans-serif",fontSize:"15.5px",fontWeight:700,color:"#0f172a"},children:i.quantity})}),t.jsxs("div",{style:{width:"23.49%",height:"100%",display:"flex",alignItems:"center",boxSizing:"border-box"},children:[t.jsx("div",{style:{width:"68%",textAlign:"right",paddingRight:"12px",boxSizing:"border-box"},children:t.jsx("span",{style:{fontFamily:"Inter, system-ui, sans-serif",fontSize:"15.5px",fontWeight:700,color:"#0f172a",letterSpacing:"-0.3px"},children:b.rupees})}),t.jsx("div",{style:{width:"32%",textAlign:"center",boxSizing:"border-box"},children:t.jsx("span",{style:{fontFamily:"Inter, system-ui, sans-serif",fontSize:"13px",fontWeight:700,color:"#334155"},children:b.paise})})]})]},s)})}),t.jsxs("div",{style:{position:"absolute",zIndex:10,top:"65.82%",left:"72.75%",width:"24.20%",height:"4.69%",display:"flex",alignItems:"center",boxSizing:"border-box"},children:[t.jsx("div",{style:{width:"68%",textAlign:"right",paddingRight:"12px",boxSizing:"border-box"},children:t.jsx("span",{style:{fontFamily:"Inter, system-ui, sans-serif",fontSize:"16.5px",fontWeight:700,color:"#0f172a",letterSpacing:"-0.3px"},children:z.rupees})}),t.jsx("div",{style:{width:"32%",textAlign:"center",boxSizing:"border-box"},children:t.jsx("span",{style:{fontFamily:"Inter, system-ui, sans-serif",fontSize:"13px",fontWeight:700,color:"#334155"},children:z.paise})})]}),t.jsx("div",{style:{position:"absolute",zIndex:10,top:"70.61%",left:"21.0%",width:"25.0%",height:"3.61%",display:"flex",alignItems:"center",justifyContent:"flex-end",paddingRight:"14px",boxSizing:"border-box"},children:t.jsx("span",{style:{fontFamily:"Inter, system-ui, sans-serif",fontSize:"15px",fontWeight:700,color:"#0f172a"},children:v>0?v.toLocaleString("en-IN"):"—"})}),t.jsx("div",{style:{position:"absolute",zIndex:10,top:"70.61%",left:"65.5%",width:"30.5%",height:"3.61%",display:"flex",alignItems:"center",justifyContent:"flex-end",paddingRight:"18px",boxSizing:"border-box"},children:t.jsx("span",{style:{fontFamily:"Inter, system-ui, sans-serif",fontSize:"15px",fontWeight:700,color:"#0f172a"},children:y>0?y.toLocaleString("en-IN"):"—"})}),t.jsx("div",{style:{position:"absolute",zIndex:10,top:"74.32%",left:"16.5%",width:"29.5%",height:"3.81%",display:"flex",alignItems:"center",justifyContent:"flex-end",paddingRight:"14px",boxSizing:"border-box"},children:t.jsx("span",{style:{fontFamily:"Inter, system-ui, sans-serif",fontSize:"15px",fontWeight:700,color:"#0f172a"},children:S>0?S.toLocaleString("en-IN"):"—"})}),t.jsx("div",{style:{position:"absolute",zIndex:10,top:"74.32%",left:"65.5%",width:"30.5%",height:"3.81%",display:"flex",alignItems:"center",justifyContent:"flex-end",paddingRight:"18px",boxSizing:"border-box"},children:t.jsx("span",{style:{fontFamily:"Inter, system-ui, sans-serif",fontSize:"15px",fontWeight:700,color:"#0f172a"},children:I>0?I.toLocaleString("en-IN"):"—"})}),t.jsx("div",{style:{position:"absolute",zIndex:10,top:"78.22%",left:"72.75%",width:"24.20%",height:"3.91%",display:"flex",alignItems:"center",justifyContent:"flex-end",paddingRight:"18px",boxSizing:"border-box"},children:t.jsx("span",{style:{fontFamily:"Inter, system-ui, sans-serif",fontSize:"16.5px",fontWeight:700,color:"#0f172a"},children:n?n.toLocaleString("en-IN"):"—"})}),t.jsxs("div",{style:{position:"absolute",zIndex:10,top:"82.23%",left:"72.75%",width:"24.20%",height:"4.79%",display:"flex",alignItems:"center",boxSizing:"border-box"},children:[t.jsx("div",{style:{width:"68%",textAlign:"right",paddingRight:"12px",boxSizing:"border-box"},children:t.jsx("span",{style:{fontFamily:"Inter, system-ui, sans-serif",fontSize:"18px",fontWeight:800,color:"#0f172a",letterSpacing:"-0.3px"},children:C.rupees})}),t.jsx("div",{style:{width:"32%",textAlign:"center",boxSizing:"border-box"},children:t.jsx("span",{style:{fontFamily:"Inter, system-ui, sans-serif",fontSize:"14px",fontWeight:800,color:"#0f172a"},children:C.paise})})]}),t.jsx("div",{style:{position:"absolute",zIndex:10,top:"87.11%",left:"26.28%",width:"22.54%",height:"5.47%",display:"flex",alignItems:"center",justifyContent:"flex-end",paddingRight:"12px",boxSizing:"border-box"},children:t.jsx("span",{style:{fontFamily:"Inter, system-ui, sans-serif",fontSize:"16px",fontWeight:700,color:"#15803d"},children:N>0?`₹${N.toLocaleString("en-IN")}`:"₹0"})}),t.jsx("div",{style:{position:"absolute",zIndex:10,top:"87.11%",left:"72.06%",width:"24.90%",height:"5.47%",display:"flex",alignItems:"center",justifyContent:"flex-end",paddingRight:"16px",boxSizing:"border-box"},children:t.jsxs("span",{style:{fontFamily:"Inter, system-ui, sans-serif",fontSize:"17px",fontWeight:800,color:"#dc2626"},children:["₹",P.toLocaleString("en-IN")]})})]})});A.displayName="SupplierBillPad";const V=({isOpen:e,onClose:x,bill:a,supplier:c})=>{const{settings:f,fetchSettings:p}=R(),w=l.useRef(),m=l.useRef(),[o,h]=l.useState(!1),[g,B]=l.useState(!1),[d,j]=l.useState("");if(l.useEffect(()=>{e&&(!f||Object.keys(f).length===0)&&typeof p=="function"&&p()},[e,f]),l.useEffect(()=>{const n=r=>{m.current&&!m.current.contains(r.target)&&h(!1)};return o&&document.addEventListener("mousedown",n),()=>{document.removeEventListener("mousedown",n)}},[o]),!e||!a)return null;const v=(n=>{if(!n)return"";const r=new Date(n);return`${r.getDate().toString().padStart(2,"0")}-${(r.getMonth()+1).toString().padStart(2,"0")}-${r.getFullYear()}`})(a.transactionDate||a.createdAt),y=()=>{h(!1),window.print()},S=async()=>{var P;if(h(!1),!w.current)return;B(!0);const n=(a.supplierName||((P=a.supplierId)==null?void 0:P.name)||(c==null?void 0:c.name)||"Supplier").trim().replace(/[\/\s]+/g,"_").replace(/[^a-zA-Z0-9_\-\u0B80-\u0BFF]/g,""),r=v.replace(/[\/\s]/g,"-"),N=`Deva_Supplier_Bill_${n}_${r}.png`;await _(w.current,{filename:N,targetWidthPx:723,targetHeightPx:1024,shareTitle:`Supplier Bill - ${n}`,onStatusChange:z=>{j(z),z&&setTimeout(()=>j(""),4e3)}}),B(!1)},I=t.jsxs("div",{className:"supplier-modal-portal fixed inset-0 z-50 overflow-y-auto",children:[t.jsxs("div",{className:"supplier-modal-wrap flex min-h-screen items-center justify-center p-2 sm:p-4",children:[t.jsx("div",{className:"fixed inset-0 bg-slate-900/60 backdrop-blur-xs no-print",onClick:x}),t.jsxs("div",{className:"supplier-modal-card relative bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden my-4",children:[t.jsxs("div",{className:"no-print flex items-center justify-between px-5 py-3.5 bg-slate-50 border-b border-slate-200",children:[t.jsxs("div",{className:"flex items-center gap-2",children:[t.jsx(F,{className:"w-5 h-5 text-forest-700"}),t.jsx("span",{className:"font-bold text-slate-800 text-sm font-tamil",children:"விவசாயி பில் அச்சிடு (Supplier Bill A5 Print)"})]}),t.jsxs("div",{className:"flex items-center gap-2",children:[d&&t.jsx("span",{className:"text-[11px] font-bold text-forest-700 bg-forest-50 border border-forest-200/80 px-2.5 py-1 rounded-lg",children:d}),t.jsxs("div",{className:"relative inline-flex items-stretch shadow-xs rounded-xl",ref:m,children:[t.jsxs("button",{type:"button",onClick:y,className:"flex items-center gap-1.5 px-3 sm:px-4 py-2 bg-forest-600 hover:bg-forest-700 text-white rounded-l-xl text-xs font-bold shadow-md shadow-forest-600/25 transition-all cursor-pointer active:scale-95",title:"Browser Print Preview (A5 - Exactly 1 Sheet)",children:[t.jsx(F,{className:"w-4 h-4"}),t.jsx("span",{children:"அச்சிடு (Print A5)"})]}),t.jsx("button",{type:"button",onClick:()=>h(!o),className:"px-2 py-2 bg-forest-700 hover:bg-forest-800 text-white rounded-r-xl border-l border-forest-500/50 shadow-md shadow-forest-600/25 transition-all cursor-pointer",title:"Print & Download Options",children:t.jsx(L,{className:`w-3.5 h-3.5 transition-transform duration-200 ${o?"rotate-180":""}`})}),o&&t.jsxs("div",{className:"absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95",onClick:n=>n.stopPropagation(),children:[t.jsxs("button",{type:"button",onClick:y,className:"w-full text-left px-3.5 py-2.5 text-xs font-bold text-slate-800 hover:bg-slate-50 flex items-center gap-2.5 cursor-pointer transition-colors",children:[t.jsx($,{className:"w-4 h-4 text-slate-600"}),t.jsxs("div",{children:[t.jsx("div",{className:"font-bold",children:"Browser Print Preview"}),t.jsx("div",{className:"text-[10px] text-slate-500 font-normal",children:"A5 portrait (strictly 1 single sheet)"})]})]}),t.jsxs("button",{type:"button",onClick:S,disabled:g,className:"w-full text-left px-3.5 py-2.5 text-xs font-bold text-slate-800 hover:bg-slate-50 flex items-center gap-2.5 cursor-pointer transition-colors disabled:opacity-50",children:[g?t.jsx(E,{className:"w-4 h-4 text-forest-600 animate-spin"}):t.jsx(T,{className:"w-4 h-4 text-forest-600"}),t.jsxs("div",{children:[t.jsx("div",{className:"font-bold text-forest-700",children:"Download Bill Image"}),t.jsx("div",{className:"text-[10px] text-slate-500 font-normal",children:g?"Generating PNG...":"High-resolution A5 PNG (1-click)"})]})]})]})]}),t.jsx("button",{type:"button",onClick:x,className:"p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer",title:"Close",children:t.jsx(q,{className:"w-5 h-5"})})]})]}),t.jsx("div",{className:"supplier-modal-body p-4 sm:p-6 overflow-x-auto flex justify-center bg-slate-100/60",children:t.jsx(A,{ref:w,bill:a,supplier:c||(a==null?void 0:a.supplierId),settings:f})})]})]}),t.jsx("style",{children:`
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
      `})]});return O.createPortal(I,document.body)};export{V as S};
