const PWD='admin123',SK='pk_data',AK='pk_auth'; 
 let P=[],isA=false,eId=null,exD=null,exH=[]; 
 let curView='board'; 
 let calYear,calMonth; 
 
 const FIELDS=[ 
 {k:'client',l:'客户名称',w:['客户','名称','项目','公司']}, 
 {k:'area',l:'区域',w:['区域','地区','城市','地点']}, 
 {k:'partyA',l:'甲方',w:['甲方','委托','发包']}, 
 {k:'requirement',l:'制作要求',w:['要求','制作','需求','内容']}, 
 {k:'days',l:'拍摄天数',w:['天数','天','工期']}, 
 {k:'crew',l:'人数',w:['人数','人员','团队']}, 
 {k:'equipment',l:'执行设备',w:['设备','器材','无人机','相机']}, 
 {k:'date',l:'拍摄日期',w:['日期','时间','拍摄日']}, 
 {k:'status',l:'状态',w:['状态','进度']}, 
 {k:'note',l:'备注',w:['备注','说明','补充']} 
 ]; 
 
 // ===== Auth ===== 
 function doLogin(){ 
     var v=document.getElementById('pwdI').value; 
     if(v===PWD){isA=true;sessionStorage.setItem(AK,'a');showApp();} 
     else{document.getElementById('pwdI').classList.add('err');document.getElementById('errT').style.display='block';setTimeout(function(){document.getElementById('pwdI').classList.remove('err');},400);} 
 } 
 function doGuest(){isA=false;sessionStorage.setItem(AK,'g');showApp();} 
 function doLogout(){sessionStorage.removeItem(AK);location.reload();} 
 function showApp(){ 
     document.getElementById('LS').classList.add('hidden'); 
     document.getElementById('APP').style.display='block'; 
     if(isA)document.body.classList.add('is-admin'); 
     var b=document.getElementById('BDG'); 
     b.textContent=isA?'管理员':'访客'; 
     b.className='bdg '+(isA?'bdg-a':'bdg-g'); 
     var now=new Date();calYear=now.getFullYear();calMonth=now.getMonth(); 
     load();render(); 
 } 
 (function(){var s=sessionStorage.getItem(AK);if(s==='a'){isA=true;showApp();}else if(s==='g'){isA=false;showApp();}})(); 
 document.addEventListener('DOMContentLoaded',function(){ 
     document.getElementById('pwdI').addEventListener('keydown',function(e){if(e.key==='Enter')doLogin();}); 
     setupUpload(); 
 }); 
 
 // ===== Data ===== 
 function load(){try{P=JSON.parse(localStorage.getItem(SK))||[];}catch(e){P=[];}} 
 function save(){localStorage.setItem(SK,JSON.stringify(P));} 
 function gid(){return Date.now().toString(36)+Math.random().toString(36).slice(2,6);} 
 function toast(m){var t=document.getElementById('TT');t.textContent=m;t.classList.add('show');setTimeout(function(){t.classList.remove('show');},2800);} 
 function esc(s){return s?String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'):'';} 
 
 // ===== Search ===== 
 function getFiltered(){ 
     var list=P.slice(); 
     var q=(document.getElementById('searchInput').value||'').trim().toLowerCase(); 
     if(q){list=list.filter(function(x){return(x.client||'').toLowerCase().indexOf(q)>-1||(x.area||'').toLowerCase().indexOf(q)>-1||(x.partyA||'').toLowerCase().indexOf(q)>-1||(x.equipment||'').toLowerCase().indexOf(q)>-1||(x.note||'').toLowerCase().indexOf(q)>-1;});} 
     return list; 
 } 
 function doSearch(){render();} 
 
 // ===== View Switch ===== 
 function switchView(v){ 
     curView=v; 
     document.querySelectorAll('.vtab').forEach(function(t){t.classList.toggle('active',t.dataset.view===v);}); 
     document.querySelectorAll('.view-panel').forEach(function(p){p.classList.remove('active');}); 
     var panelId=v==='board'?'viewBoard':v==='table'?'viewTable':'viewCalendar'; 
     document.getElementById(panelId).classList.add('active'); 
     render(); 
 } 
 
 // ===== Render ===== 
 function render(){ 
     var filtered=getFiltered(); 
     var pe=filtered.filter(function(x){return x.status==='pending';}); 
     var sh=filtered.filter(function(x){return x.status==='shooting';}); 
     var de=filtered.filter(function(x){return x.status==='delivered';}); 
     document.getElementById('cP').textContent=pe.length; 
     document.getElementById('cS').textContent=sh.length; 
     document.getElementById('cD').textContent=de.length; 
     rCol('colP',pe);rCol('colS',sh);rCol('colD',de); 
     uDash(); 
     renderTable(filtered); 
     renderCal(); 
 } 
 
 function rCol(id,items){ 
     var el=document.getElementById(id); 
     if(!items.length){el.innerHTML='<div class="empty">暂无项目</div>';return;} 
     var html=''; 
     for(var i=0;i<items.length;i++){ 
         var p=items[i]; 
         var sc=p.status==='pending'?'sp':p.status==='shooting'?'ss':'sd'; 
         var st=p.status==='pending'?'待拍摄':p.status==='shooting'?'拍摄中':'已交付'; 
         var m=''; 
         if(p.area)m+='<div class="crd-r"><span>📍</span>'+esc(p.area)+'</div>'; 
         if(p.partyA)m+='<div class="crd-r"><span>🏢</span>'+esc(p.partyA)+'</div>'; 
         if(p.date)m+='<div class="crd-r"><span>📅</span>'+esc(p.date)+'</div>'; 
         if(p.requirement)m+='<div class="crd-r"><span>📋</span>'+esc(p.requirement)+'</div>'; 
         var tg=''; 
         if(p.days)tg+='<span class="crd-tag">'+p.days+'天</span>'; 
         if(p.crew)tg+='<span class="crd-tag">'+p.crew+'人</span>'; 
         if(p.equipment)tg+='<span class="crd-tag">'+esc(p.equipment)+'</span>'; 
         var ns=p.status==='pending'?'shooting':p.status==='shooting'?'delivered':null; 
         var nt=p.status==='pending'?'开始拍摄':'标记交付'; 
         var a='<button class="cab" onclick="editP(\''+p.id+'\')">编辑</button>'; 
         if(ns)a+='<button class="cab cab-n" onclick="moveP(\''+p.id+'\',\''+ns+'\')">'+nt+'</button>'; 
         a+='<button class="cab cab-d" onclick="delP(\''+p.id+'\')">删除</button>'; 
         html+='<div class="crd" data-s="'+p.status+'" data-id="'+p.id+'" draggable="'+isA+'"><div class="crd-top"><div class="crd-n">'+esc(p.client)+'</div><div class="crd-s '+sc+'">'+st+'</div></div><div class="crd-m">'+m+'</div>'+(tg?'<div class="crd-tags">'+tg+'</div>':'')+'<div class="crd-a">'+a+'</div></div>'; 
     } 
     el.innerHTML=html; 
     if(isA)setupDrag(el); 
 } 
 
 // ===== Dashboard ===== 
 function uDash(){ 
     var pe=P.filter(function(x){return x.status==='pending';}); 
     var sh=P.filter(function(x){return x.status==='shooting';}); 
     var de=P.filter(function(x){return x.status==='delivered';}); 
     var p=pe.length,s=sh.length,d=de.length,t=p+s+d; 
     document.getElementById('rT').textContent=t; 
     document.getElementById('lP').textContent=p; 
     document.getElementById('lS').textContent=s; 
     document.getElementById('lD').textContent=d; 
     var C=91.1; 
     if(t===0){setR(0,0,0);}else{setR((p/t)*C,(s/t)*C,(d/t)*C);} 
     var now=new Date(),yr=now.getFullYear(),mo=now.getMonth(); 
     var md=0,ma=0,mw=0,mt=0; 
     for(var i=0;i<P.length;i++){ 
         var x=P[i]; 
         if(x.date){ 
             var dd=new Date(x.date); 
             if(dd.getFullYear()===yr&&dd.getMonth()===mo){ 
                 mt++; 
                 if(x.status==='delivered')md++; 
                 else if(x.status==='shooting')ma++; 
                 else mw++; 
             } 
         } 
     } 
     document.getElementById('mD').textContent=md; 
     document.getElementById('mA').textContent=ma; 
     document.getElementById('mW').textContent=mw; 
     document.getElementById('mT').textContent=mt; 
 } 
 
 function setR(pv,sv,dv){ 
     var C=91.1; 
     document.getElementById('rP').setAttribute('stroke-dasharray',pv+' '+C); 
     document.getElementById('rP').setAttribute('stroke-dashoffset','0'); 
     document.getElementById('rS').setAttribute('stroke-dasharray',sv+' '+C); 
     document.getElementById('rS').setAttribute('stroke-dashoffset',String(-pv)); 
     document.getElementById('rD').setAttribute('stroke-dasharray',dv+' '+C); 
     document.getElementById('rD').setAttribute('stroke-dashoffset',String(-(pv+sv))); 
 } 
 
 // ===== Table View ===== 
 function renderTable(items){ 
     var filter=document.getElementById('tblFilter').value; 
     var list=items; 
     if(filter!=='all')list=list.filter(function(x){return x.status===filter;}); 
     var tbody=document.getElementById('tblBody'); 
     if(!list.length){tbody.innerHTML='<tr><td colspan="8" style="text-align:center;color:#aeaeb2;padding:20px">暂无数据</td></tr>';return;} 
     var html=''; 
     for(var i=0;i<list.length;i++){ 
         var p=list[i]; 
         var sc=p.status==='pending'?'sp':p.status==='shooting'?'ss':'sd'; 
         var st=p.status==='pending'?'待拍摄':p.status==='shooting'?'拍摄中':'已交付'; 
         var acts=isA?'<td><div class="tbl-acts"><button class="tbl-btn" onclick="editP(\''+p.id+'\')">编辑</button><button class="tbl-btn tbl-btn-d" onclick="delP(\''+p.id+'\')">删除</button></div></td>':''; 
         html+='<tr><td><b>'+esc(p.client)+'</b></td><td>'+esc(p.area)+'</td><td>'+esc(p.partyA)+'</td><td>'+esc(p.date)+'</td><td>'+esc(p.equipment)+'</td><td>'+(p.days||'-')+'</td><td><span class="st-badge '+sc+'">'+st+'</span></td>'+acts+'</tr>'; 
     } 
     tbody.innerHTML=html; 
 } 
 
 // ===== Calendar View ===== 
 function renderCal(){ 
     document.getElementById('calTitle').textContent=calYear+'年'+(calMonth+1)+'月'; 
     var firstDay=new Date(calYear,calMonth,1).getDay(); 
     var daysInMonth=new Date(calYear,calMonth+1,0).getDate(); 
     var today=new Date(); 
     var todayStr=today.getFullYear()+'-'+String(today.getMonth()+1).padStart(2,'0')+'-'+String(today.getDate()).padStart(2,'0'); 
     var dateMap={}; 
     for(var i=0;i<P.length;i++){ 
         var x=P[i]; 
         if(x.date){ 
             if(!dateMap[x.date])dateMap[x.date]=[]; 
             dateMap[x.date].push(x); 
         } 
     } 
     var html=''; 
     var prevDays=new Date(calYear,calMonth,0).getDate(); 
     for(var i=firstDay-1;i>=0;i--){ 
         html+='<div class="cal-day other"><div class="cal-day-num">'+(prevDays-i)+'</div></div>'; 
     } 
     for(var d=1;d<=daysInMonth;d++){ 
         var dateStr=calYear+'-'+String(calMonth+1).padStart(2,'0')+'-'+String(d).padStart(2,'0'); 
         var isToday=dateStr===todayStr; 
         var cls='cal-day'+(isToday?' today':''); 
         var itemsHtml=''; 
         if(dateMap[dateStr]){ 
             var dayItems=dateMap[dateStr]; 
             for(var j=0;j<Math.min(dayItems.length,3);j++){ 
                 var ci=dayItems[j]; 
                 var cc=ci.status==='pending'?'ci-p':ci.status==='shooting'?'ci-s':'ci-d'; 
                 itemsHtml+='<div class="cal-item '+cc+'">'+esc(ci.client)+'</div>'; 
             } 
             if(dayItems.length>3)itemsHtml+='<div class="cal-item" style="color:#86868b">+'+(dayItems.length-3)+'项</div>'; 
         } 
         html+='<div class="'+cls+'"><div class="cal-day-num">'+d+'</div><div class="cal-day-items">'+itemsHtml+'</div></div>'; 
     } 
     var totalCells=firstDay+daysInMonth; 
     var remaining=totalCells%7===0?0:7-totalCells%7; 
     for(var i=1;i<=remaining;i++){ 
         html+='<div class="cal-day other"><div class="cal-day-num">'+i+'</div></div>'; 
     } 
     document.getElementById('calDays').innerHTML=html; 
 } 
 
 function calPrev(){calMonth--;if(calMonth<0){calMonth=11;calYear--;}renderCal();} 
 function calNext(){calMonth++;if(calMonth>11){calMonth=0;calYear++;}renderCal();} 
 
 // ===== CRUD ===== 
 function openAdd(){eId=null;document.getElementById('MT').textContent='新建项目';clearForm();document.getElementById('PM').classList.add('active');} 
 function editP(id){ 
     var p=null; 
     for(var i=0;i<P.length;i++){if(P[i].id===id){p=P[i];break;}} 
     if(!p)return; 
     eId=id; 
     document.getElementById('MT').textContent='编辑项目'; 
     document.getElementById('fC').value=p.client||''; 
     document.getElementById('fA').value=p.area||''; 
     document.getElementById('fP').value=p.partyA||''; 
     document.getElementById('fR').value=p.requirement||''; 
     document.getElementById('fD').value=p.days||''; 
     document.getElementById('fCr').value=p.crew||''; 
     document.getElementById('fE').value=p.equipment||''; 
     document.getElementById('fDt').value=p.date||''; 
     document.getElementById('fS').value=p.status||'pending'; 
     document.getElementById('fN').value=p.note||''; 
     document.getElementById('PM').classList.add('active'); 
 } 
 function closeM(){document.getElementById('PM').classList.remove('active');} 
 function clearForm(){var ids=['fC','fA','fP','fR','fD','fCr','fE','fDt','fN'];for(var i=0;i<ids.length;i++)document.getElementById(ids[i]).value='';document.getElementById('fS').value='pending';} 
 
 function saveP(){ 
     var c=document.getElementById('fC').value.trim(); 
     if(!c){toast('请输入客户名称');return;} 
     var obj={ 
         client:c, 
         area:document.getElementById('fA').value.trim(), 
         partyA:document.getElementById('fP').value.trim(), 
         requirement:document.getElementById('fR').value.trim(), 
         days:document.getElementById('fD').value, 
         crew:document.getElementById('fCr').value, 
         equipment:document.getElementById('fE').value.trim(), 
         date:document.getElementById('fDt').value, 
         status:document.getElementById('fS').value, 
         note:document.getElementById('fN').value.trim() 
     }; 
     if(eId){ 
         for(var i=0;i<P.length;i++){ 
             if(P[i].id===eId){P[i]=Object.assign(P[i],obj);break;} 
         } 
     }else{ 
         obj.id=gid(); 
         P.push(obj); 
     } 
     save();render();closeM();toast(eId?'项目已更新':'项目已创建'); 
 } 
 
 function moveP(id,status){ 
     for(var i=0;i<P.length;i++){if(P[i].id===id){P[i].status=status;break;}} 
     save();render();toast('状态已更新'); 
 } 
 
 function delP(id){ 
     if(!confirm('确定删除此项目？'))return; 
     P=P.filter(function(x){return x.id!==id;}); 
     save();render();toast('项目已删除'); 
 } 
 
 function doClear(){ 
     if(!confirm('确定清空所有数据？不可恢复！'))return; 
     P=[];save();render();toast('数据已清空'); 
 } 
 
 // ===== Export ===== 
 function doExport(){ 
     if(!P.length){toast('暂无数据');return;} 
     var rows=[]; 
     for(var i=0;i<P.length;i++){ 
         var x=P[i]; 
         rows.push({'客户':x.client,'区域':x.area,'甲方':x.partyA,'制作要求':x.requirement,'天数':x.days,'人数':x.crew,'设备':x.equipment,'日期':x.date,'状态':x.status==='pending'?'待拍摄':x.status==='shooting'?'拍摄中':'已交付','备注':x.note}); 
     } 
     var ws=XLSX.utils.json_to_sheet(rows); 
     var wb=XLSX.utils.book_new(); 
     XLSX.utils.book_append_sheet(wb,ws,'项目'); 
     XLSX.writeFile(wb,'摄影项目_'+new Date().toISOString().slice(0,10)+'.xlsx'); 
     toast('导出成功'); 
 } 
 
 // ===== Import ===== 
 function toggleUpl(){document.getElementById('UPL').classList.toggle('active');} 
 
 function setupUpload(){ 
     var area=document.getElementById('UPA'),fi=document.getElementById('FI'); 
     area.addEventListener('click',function(){fi.click();}); 
     area.addEventListener('dragover',function(e){e.preventDefault();area.classList.add('dragover');}); 
     area.addEventListener('dragleave',function(){area.classList.remove('dragover');}); 
     area.addEventListener('drop',function(e){e.preventDefault();area.classList.remove('dragover');if(e.dataTransfer.files[0])readXls(e.dataTransfer.files[0]);}); 
     fi.addEventListener('change',function(e){if(e.target.files[0])readXls(e.target.files[0]);}); 
 } 
 
 function readXls(file){ 
     var reader=new FileReader(); 
     reader.onload=function(e){ 
         try{ 
             var wb=XLSX.read(e.target.result,{type:'array'}); 
             var ws=wb.Sheets[wb.SheetNames[0]]; 
             var data=XLSX.utils.sheet_to_json(ws,{defval:''}); 
             if(!data.length){toast('表格为空');return;} 
             exH=Object.keys(data[0]);exD=data;showMap(); 
         }catch(err){toast('文件读取失败');} 
     }; 
     reader.readAsArrayBuffer(file); 
 } 
 
 function showMap(){ 
     var body=document.getElementById('MMB'); 
     var html=''; 
     for(var i=0;i<FIELDS.length;i++){ 
         var f=FIELDS[i]; 
         var auto=autoM(f); 
         var opts='<option value="">-- 不映射 --</option>'; 
         for(var j=0;j<exH.length;j++){ 
             var h=exH[j]; 
             opts+='<option value="'+esc(h)+'"'+(h===auto?' selected':'')+'>'+esc(h)+'</option>'; 
         } 
         html+='<div class="fg"><label class="fl">'+f.l+'</label><select class="fi" id="map_'+f.k+'">'+opts+'</select></div>'; 
     } 
     body.innerHTML=html; 
     document.getElementById('MM').classList.add('active'); 
 } 
 
 function autoM(field){ 
     for(var i=0;i<exH.length;i++){ 
         var hl=exH[i].toLowerCase(); 
         for(var j=0;j<field.w.length;j++){ 
             if(hl.indexOf(field.w[j])>-1)return exH[i]; 
         } 
     } 
     return ''; 
 } 
 
 function closeMM(){document.getElementById('MM').classList.remove('active');} 
 
 function confirmMM(){ 
     var mapping={}; 
     for(var i=0;i<FIELDS.length;i++){ 
         var f=FIELDS[i]; 
         var sel=document.getElementById('map_'+f.k); 
         if(sel&&sel.value)mapping[f.k]=sel.value; 
     } 
     if(!mapping.client){toast('请至少映射客户名称');return;} 
     var added=0,skipped=0; 
     for(var i=0;i<exD.length;i++){ 
         var row=exD[i]; 
         var obj={id:gid(),status:'pending'}; 
         for(var j=0;j<FIELDS.length;j++){ 
             var f=FIELDS[j]; 
             if(mapping[f.k])obj[f.k]=String(row[mapping[f.k]]||'').trim(); 
         } 
         if(!obj.client)continue; 
         if(obj.status){ 
             var sl=obj.status.toLowerCase(); 
             if(sl.indexOf('拍摄中')>-1||sl.indexOf('进行')>-1)obj.status='shooting'; 
             else if(sl.indexOf('交付')>-1||sl.indexOf('完成')>-1)obj.status='delivered'; 
             else obj.status='pending'; 
         } 
         var dup=false; 
         if(obj.date){ 
             for(var k=0;k<P.length;k++){ 
                 if(P[k].client===obj.client&&P[k].date===obj.date){dup=true;break;} 
             } 
         } 
         if(dup){skipped++;}else{P.push(obj);added++;} 
     } 
     save();render();closeMM(); 
     document.getElementById('UPL').classList.remove('active'); 
     toast('已导入 '+added+' 条数据，跳过 '+skipped+' 条重复'); 
 } 
 
 // ===== Drag & Drop ===== 
 function setupDrag(container){ 
     var cards=container.querySelectorAll('.crd'); 
     for(var i=0;i<cards.length;i++){ 
         (function(card){ 
             card.addEventListener('dragstart',function(e){ 
                 card.classList.add('dragging'); 
                 e.dataTransfer.setData('text/plain',card.dataset.id); 
             }); 
             card.addEventListener('dragend',function(){card.classList.remove('dragging');}); 
             var dragId=null,startX=0,startY=0; 
             card.addEventListener('touchstart',function(e){ 
                 if(!isA)return; 
                 var t=e.touches[0];startX=t.clientX;startY=t.clientY;dragId=card.dataset.id; 
             },{passive:true}); 
             card.addEventListener('touchmove',function(e){ 
                 if(!dragId)return; 
                 var t=e.touches[0]; 
                 if(Math.abs(t.clientY-startY)>10||Math.abs(t.clientX-startX)>10){ 
                     card.classList.add('dragging'); 
                     var cols=document.querySelectorAll('.ccards'); 
                     for(var c=0;c<cols.length;c++){ 
                         var r=cols[c].getBoundingClientRect(); 
                         if(t.clientX>=r.left&&t.clientX<=r.right&&t.clientY>=r.top&&t.clientY<=r.bottom){ 
                             cols[c].classList.add('dov'); 
                         }else{cols[c].classList.remove('dov');} 
                     } 
                 } 
             },{passive:true}); 
             card.addEventListener('touchend',function(e){ 
                 if(!dragId)return; 
                 card.classList.remove('dragging'); 
                 var t=e.changedTouches[0]; 
                 var cols=document.querySelectorAll('.ccards'); 
                 for(var c=0;c<cols.length;c++){ 
                     cols[c].classList.remove('dov'); 
                     var r=cols[c].getBoundingClientRect(); 
                     if(t.clientX>=r.left&&t.clientX<=r.right&&t.clientY>=r.top&&t.clientY<=r.bottom){ 
                         var newSt=cols[c].id==='colP'?'pending':cols[c].id==='colS'?'shooting':'delivered'; 
                         moveP(dragId,newSt); 
                     } 
                 } 
                 dragId=null; 
             }); 
         })(cards[i]); 
     } 
     var cols=document.querySelectorAll('.ccards'); 
     for(var c=0;c<cols.length;c++){ 
         (function(col){ 
             col.addEventListener('dragover',function(e){e.preventDefault();col.classList.add('dov');}); 
             col.addEventListener('dragleave',function(){col.classList.remove('dov');}); 
             col.addEventListener('drop',function(e){ 
                 e.preventDefault();col.classList.remove('dov'); 
                 var id=e.dataTransfer.getData('text/plain'); 
                 var newSt=col.id==='colP'?'pending':col.id==='colS'?'shooting':'delivered'; 
                 moveP(id,newSt); 
             }); 
         })(cols[c]); 
     } 
 } 
 
 // ===== Init Demo Data ===== 
if(!localStorage.getItem(SK)){ 
    P=[ 
        {id:'1',client:'万科地产',area:'深圳南山',partyA:'万科集团',requirement:'航拍全景+样板间',days:2,crew:3,equipment:'御4 Pro, A7M4',date:'2024-01-15',status:'pending',note:'需提前预约'}, 
        {id:'2',client:'华润置地',area:'深圳福田',partyA:'华润',requirement:'商业综合体外立面',days:1,crew:2,equipment:'A7R5, 16-35',date:'2024-01-18',status:'pending',note:''}, 
        {id:'3',client:'招商蛇口',area:'广州天河',partyA:'招商',requirement:'楼盘宣传片拍摄',days:3,crew:4,equipment:'RED Komodo, DJI RS3',date:'2024-01-10',status:'shooting',note:'拍摄中'}, 
        {id:'4',client:'保利发展',area:'珠海横琴',partyA:'保利',requirement:'海景房样板间',days:1,crew:2,equipment:'A7M4, 24-70',date:'2024-01-08',status:'delivered',note:'已交付'} 
    ]; 
    save(); 
}