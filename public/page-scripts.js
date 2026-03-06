const LANGUAGES=[
{code:'es',name:'Spanish',flag:'🇪🇸'},{code:'fr',name:'French',flag:'🇫🇷'},{code:'de',name:'German',flag:'🇩🇪'},{code:'it',name:'Italian',flag:'🇮🇹'},{code:'pt',name:'Portuguese',flag:'🇵🇹'},{code:'ar',name:'Arabic',flag:'🇸🇦'},{code:'zh',name:'Chinese',flag:'🇨🇳'},{code:'ja',name:'Japanese',flag:'🇯🇵'},{code:'ko',name:'Korean',flag:'🇰🇷'},{code:'hi',name:'Hindi',flag:'🇮🇳'},{code:'ru',name:'Russian',flag:'🇷🇺'},{code:'tr',name:'Turkish',flag:'🇹🇷'},{code:'pl',name:'Polish',flag:'🇵🇱'},{code:'nl',name:'Dutch',flag:'🇳🇱'},{code:'sv',name:'Swedish',flag:'🇸🇪'},{code:'he',name:'Hebrew',flag:'🇮🇱'},{code:'ro',name:'Romanian',flag:'🇷🇴'},{code:'uk',name:'Ukrainian',flag:'🇺🇦'},{code:'th',name:'Thai',flag:'🇹🇭'},{code:'vi',name:'Vietnamese',flag:'🇻🇳'},{code:'id',name:'Indonesian',flag:'🇮🇩'},{code:'ms',name:'Malay',flag:'🇲🇾'},{code:'fil',name:'Filipino',flag:'🇵🇭'},{code:'cs',name:'Czech',flag:'🇨🇿'},{code:'el',name:'Greek',flag:'🇬🇷'},{code:'bg',name:'Bulgarian',flag:'🇧🇬'},{code:'da',name:'Danish',flag:'🇩🇰'},{code:'fi',name:'Finnish',flag:'🇫🇮'},{code:'no',name:'Norwegian',flag:'🇳🇴'},{code:'hu',name:'Hungarian',flag:'🇭🇺'},{code:'am',name:'Amharic',flag:'🇪🇹'},{code:'ur',name:'Urdu',flag:'🇵🇰'}
];
const CONTEXTS=[
{id:'kids',label:'Kids App (3-8)',icon:'🧒',desc:'Simple, playful, age-appropriate words'},
{id:'game',label:'Game / Entertainment',icon:'🎮',desc:'Fun, energetic, engaging'},
{id:'business',label:'Business / SaaS',icon:'💼',desc:'Professional, clear, formal'},
{id:'ecommerce',label:'E-Commerce',icon:'🛒',desc:'Persuasive, friendly, action-oriented'},
{id:'medical',label:'Medical / Health',icon:'🏥',desc:'Precise, careful, empathetic'},
{id:'education',label:'Education',icon:'📚',desc:'Clear, instructive, encouraging'},
{id:'social',label:'Social Media',icon:'💬',desc:'Casual, trendy, conversational'},
{id:'custom',label:'Custom',icon:'✏️',desc:'Write your own context'}
];
const SAMPLE_JSON='{\n  "play": "▶ PLAY!",\n  "pickGame": "Pick a Game!",\n  "tapCatch": "Tap & Catch",\n  "animals": "Animals",\n  "letters": "Letters",\n  "shapes": "Shapes",\n  "memory": "Memory Match",\n  "puzzles": "Puzzles",\n  "numbers": "Numbers",\n  "sorting": "Sorting",\n  "level": "Level {n}",\n  "score": "Score",\n  "tryAgain": "Try again!",\n  "amazing": "🎉 Amazing!",\n  "howMany": "How many {emoji}?",\n  "findLetter": "Find the letter {letter}!",\n  "whichMore": "Which group has MORE?",\n  "sortThem": "Sort the items!",\n  "wellDone": "Well done!",\n  "learnPlay": "⭐ Learn & Play! ⭐"\n}';

let currentStep=1,currentMode='strings',inputFormat='json',parsedData=null,parsedCount=0,selectedLangs=[],selectedContext='kids',translationResults={},htmlSource='',extractedStrings=null;
const STEPS=['Input','Languages','Context','Translate'];

// ═══ TOAST ═══
let _toastTimer=null;
function toast(msg,dur){
    clearTimeout(_toastTimer);
    const t=document.getElementById('toast');
    document.getElementById('toastMsg').textContent=msg;
    t.classList.add('show');
    _toastTimer=setTimeout(()=>t.classList.remove('show'),dur||2200);
    // play sound
    try{
        const ac=new(window.AudioContext||window.webkitAudioContext)();
        const o=ac.createOscillator(),g=ac.createGain();
        o.connect(g);g.connect(ac.destination);
        o.frequency.setValueAtTime(600,ac.currentTime);
        o.frequency.exponentialRampToValueAtTime(1200,ac.currentTime+0.08);
        g.gain.setValueAtTime(0.08,ac.currentTime);
        g.gain.exponentialRampToValueAtTime(0.001,ac.currentTime+0.15);
        o.start(ac.currentTime);o.stop(ac.currentTime+0.15);
    }catch(e){}
}

// ═══ INIT ═══
function init(){
    renderStepper();buildLangGrid();buildContextList();
    const s=localStorage.getItem('vex-translate-api-key');
    if(s){document.getElementById('apiKey').value=s;document.getElementById('apiSaved').style.display='inline'}
    document.getElementById('inputArea').addEventListener('input',updateLineCount);
    document.getElementById('htmlArea').addEventListener('input',updateHtmlSize);
    updateLineCount();
}

function saveApiKey(){
    const k=document.getElementById('apiKey').value.trim();
    if(k){localStorage.setItem('vex-translate-api-key',k);document.getElementById('apiSaved').style.display='inline'}
}

// ═══ MODE ═══
function pickMode(mode){
    currentMode=mode;
    document.getElementById('modeStrings').classList.toggle('active',mode==='strings');
    document.getElementById('modeHtml').classList.toggle('active',mode==='html');
    document.getElementById('stringsPanel').style.display=mode==='strings'?'':'none';
    document.getElementById('htmlPanel').style.display=mode==='html'?'':'none';
    document.getElementById('parseBtn').style.display=mode==='strings'?'':'none';
    document.getElementById('extractBtn').style.display=mode==='html'?'':'none';
    if(mode==='strings')updateLineCount();
    else updateHtmlSize();
}

// ═══ STEPPER ═══
function renderStepper(){
    const el=document.getElementById('stepper');el.innerHTML='';
    STEPS.forEach((label,i)=>{
        const n=i+1,done=currentStep>n,active=currentStep===n;
        const cls=done?'is-done':active?'is-active':'';
        const dotCls=done?'done':active?'active':'pending';
        el.innerHTML+='<div class="step-item '+cls+'"><div class="step-dot '+dotCls+'">'+(done?'✓':n)+'</div><span class="step-label">'+label+'</span>'+(i<3?'<div class="step-line '+(done?'done':'pending')+'"></div>':'')+'</div>';
    });
    document.getElementById('startOverBtn').style.display=currentStep>1?'':'none';
}

function goToStep(n){
    currentStep=n;renderStepper();
    document.querySelectorAll('.section').forEach((s,i)=>s.classList.toggle('active',i+1===n));
    if(n===2){
        document.getElementById('stringsDetected').textContent=parsedCount+' strings detected · Pick target languages';
        // show extraction preview in HTML mode
        if(currentMode==='html'&&extractedStrings){
            document.getElementById('extractBox').style.display='';
            let html='';
            const keys=Object.keys(extractedStrings);
            keys.slice(0,30).forEach((k,i)=>{
                html+='<div class="extract-item"><span class="extract-key">#'+(i+1)+'</span><span class="extract-val">'+escHtml(extractedStrings[k])+'</span></div>';
            });
            if(keys.length>30)html+='<div class="extract-item"><span class="extract-key">...</span><span class="extract-val">+'+(keys.length-30)+' more strings</span></div>';
            document.getElementById('extractList').innerHTML=html;
        }else{
            document.getElementById('extractBox').style.display='none';
        }
    }
    if(n===3)updateSummary();
}

function startOver(){
    translationResults={};extractedStrings=null;htmlSource='';currentStep=1;
    renderStepper();
    document.querySelectorAll('.section').forEach((s,i)=>s.classList.toggle('active',i===0));
}

function escHtml(s){return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}

// ═══ STRINGS MODE ═══
function pickFormat(fmt,btn){inputFormat=fmt;document.querySelectorAll('.format-btn').forEach(b=>b.classList.remove('active'));btn.classList.add('active')}
function updateLineCount(){const t=document.getElementById('inputArea').value;const n=t.split('\n').filter(l=>l.trim()).length;document.getElementById('lineCount').textContent=n+' lines';document.getElementById('parseBtn').disabled=!t.trim()}
function loadSample(){document.getElementById('inputArea').value=SAMPLE_JSON;inputFormat='json';document.querySelectorAll('.format-btn').forEach(b=>b.classList.toggle('active',b.dataset.fmt==='json'));updateLineCount();toast('Sample loaded!')}
function handleFile(e){const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=ev=>{document.getElementById('inputArea').value=ev.target.result;if(f.name.endsWith('.json'))pickFormat('json',document.querySelector('[data-fmt="json"]'));else if(f.name.endsWith('.csv'))pickFormat('csv',document.querySelector('[data-fmt="csv"]'));else pickFormat('text',document.querySelector('[data-fmt="text"]'));updateLineCount();toast('File loaded: '+f.name)};r.readAsText(f)}

function parseInput(text,format){
    try{
        if(format==='json'){const p=JSON.parse(text);const flat={};function flatten(obj,pfx){for(const[k,v]of Object.entries(obj)){const key=pfx?pfx+'.'+k:k;if(typeof v==='object'&&v!==null&&!Array.isArray(v))flatten(v,key);else flat[key]=String(v)}}flatten(p,'');return{ok:true,data:flat,count:Object.keys(flat).length}}
        else if(format==='csv'){const lines=text.split('\n').filter(l=>l.trim());const data={};lines.forEach(l=>{const i=l.indexOf('=');if(i>0)data[l.slice(0,i).trim()]=l.slice(i+1).trim()});return{ok:true,data,count:Object.keys(data).length}}
        else{const lines=text.split('\n').filter(l=>l.trim());const data={};lines.forEach((l,i)=>data['line_'+(i+1)]=l.trim());return{ok:true,data,count:Object.keys(data).length}}
    }catch(e){return{ok:false,error:e.message}}
}

function parseAndNext(){
    const t=document.getElementById('inputArea').value.trim();if(!t)return;
    const r=parseInput(t,inputFormat);
    if(r.ok){parsedData=r.data;parsedCount=r.count;document.getElementById('error1').style.display='none';toast(parsedCount+' strings parsed');goToStep(2)}
    else{document.getElementById('error1').textContent='Parse error: '+r.error;document.getElementById('error1').style.display=''}
}

// ═══ HTML MODE ═══
function updateHtmlSize(){
    const t=document.getElementById('htmlArea').value;
    document.getElementById('htmlSize').textContent=t.length.toLocaleString()+' chars';
    document.getElementById('extractBtn').disabled=!t.trim();
}

function handleHtmlFile(e){
    const f=e.target.files[0];if(!f)return;
    const r=new FileReader();
    r.onload=ev=>{document.getElementById('htmlArea').value=ev.target.result;updateHtmlSize();toast('HTML loaded: '+f.name)};
    r.readAsText(f);
}

function extractAndNext(){
  htmlSource=document.getElementById('htmlArea').value.trim();
  if(!htmlSource){toast('Paste or upload HTML');return}
  document.getElementById('extractBtn').disabled=true;
  document.getElementById('extractBtn').textContent='Scanning HTML locally...';
  setTimeout(function(){try{
    extractedStrings={};var idx=0,seen=new Set();
    function add(k,v){v=v.trim().replace(/\s+/g,' ');if(!v||v.length<2||v.length>300||seen.has(v))return;if(/^[#.\[{@<\/\\]/.test(v))return;if(/^(https?:|data:|javascript:|rgba?\(|var\(|calc\(|function |return |if\(|for\()/.test(v))return;if(/^[0-9a-f]{3,8}$/i.test(v)||/^[\d.]+(%|px|em|rem|vh|vw|ms|s|deg)?$/.test(v))return;if(/^[a-z][a-zA-Z0-9_-]+$/.test(v)&&v.indexOf(' ')===-1)return;if(/^[a-z]+-[a-z]+/.test(v)&&v.indexOf(' ')===-1)return;if(/^[\W\d\s]*$/.test(v))return;if(v.length<=3&&!/[A-Z]/.test(v[0]))return;seen.add(v);idx++;extractedStrings[k||'str_'+idx]=v}
    var doc=(new DOMParser()).parseFromString(htmlSource,'text/html');
    (function walk(n){if(!n)return;var nm=n.nodeName;if(nm==='SCRIPT'||nm==='STYLE'||nm==='NOSCRIPT'||nm==='SVG')return;if(n.nodeType===3){var t=n.textContent.trim();if(t)add('',t)}if(n.nodeType===1){['placeholder','title','aria-label','alt'].forEach(function(a){var v=n.getAttribute(a);if(v)add(a+'_'+(n.id||idx),v)});for(var c=0;c<n.childNodes.length;c++)walk(n.childNodes[c])}})(doc.body);
    var sRe=/<script[^>]*>([\s\S]*?)<\/script>/gi,sm;
    while((sm=sRe.exec(htmlSource))!==null){var code=sm[1],cm;
      var p1=/(?:toast|alert|confirm|prompt)\s*\(\s*['"`]([^'"`]{2,120})['"`]/g;while((cm=p1.exec(code))!==null)add('',cm[1]);
      var p2=/\.(?:textContent|innerText)\s*=\s*['"`]([^'"`]{2,120})['"`]/g;while((cm=p2.exec(code))!==null)add('',cm[1]);
      var p3=/(?:placeholder|title)\s*=\s*(?:\\?['"]|&quot;)([^'"&]{2,100})(?:\\?['"]|&quot;)/g;while((cm=p3.exec(code))!==null)add('',cm[1]);
      var p4=/innerHTML\s*[+=]+\s*['"`]([\s\S]*?)['"`]/g;while((cm=p4.exec(code))!==null){cm[1].replace(/<[^>]*>/g,'|||').split('|||').forEach(function(b){var cl=b.replace(/\\['"]/g,'').replace(/['"]\s*\+\s*['"]/g,'').trim();if(cl&&cl.length>1)add('',cl)})}
      var p5=/['"]([A-Z][^'"]{2,80})['"]/g;while((cm=p5.exec(code))!==null)if(cm[1].indexOf(' ')!==-1)add('',cm[1]);
    }
    parsedData=extractedStrings;parsedCount=Object.keys(extractedStrings).length;
    if(!parsedCount){document.getElementById('error1').textContent='No translatable strings found.';document.getElementById('error1').style.display='';toast('No strings');return}
    toast(parsedCount+' strings extracted!');document.getElementById('error1').style.display='none';goToStep(2);
  }catch(err){document.getElementById('error1').textContent='Error: '+err.message;document.getElementById('error1').style.display='';toast('Failed')}
  finally{document.getElementById('extractBtn').disabled=false;document.getElementById('extractBtn').innerHTML='🤖 Extract Strings from HTML →'}},50);
}


// ═══ LANGUAGES ═══
function buildLangGrid(){const g=document.getElementById('langGrid');g.innerHTML='';LANGUAGES.forEach(l=>{const b=document.createElement('button');b.className='lang-btn';b.id='lang-'+l.code;b.innerHTML='<span class="lang-flag">'+l.flag+'</span><span>'+l.name+'</span><span class="lang-check" style="display:none">✓</span>';b.onclick=()=>toggleLang(l.code);g.appendChild(b)})}
function toggleLang(c){const i=selectedLangs.indexOf(c);if(i>=0)selectedLangs.splice(i,1);else selectedLangs.push(c);updateLangUI()}
function selectAllLangs(){selectedLangs=LANGUAGES.map(l=>l.code);updateLangUI()}
function clearAllLangs(){selectedLangs=[];updateLangUI()}
function selectPreset(codes){selectedLangs=[...codes];updateLangUI()}
function updateLangUI(){LANGUAGES.forEach(l=>{const b=document.getElementById('lang-'+l.code);const s=selectedLangs.includes(l.code);b.classList.toggle('selected',s);b.querySelector('.lang-check').style.display=s?'':'none'});const n=selectedLangs.length;document.getElementById('langBtn').textContent=n+' language'+(n!==1?'s':'')+' selected · Continue →';document.getElementById('langBtn').disabled=n===0}
function filterLangs(q){q=q.toLowerCase();LANGUAGES.forEach(l=>{document.getElementById('lang-'+l.code).style.display=(l.name.toLowerCase().includes(q)||l.code.includes(q))?'':'none'})}

// ═══ CONTEXT ═══
function buildContextList(){const list=document.getElementById('contextList');list.innerHTML='';CONTEXTS.forEach(c=>{const card=document.createElement('button');card.className='context-card'+(c.id===selectedContext?' selected':'');card.id='ctx-'+c.id;card.innerHTML='<span class="context-icon">'+c.icon+'</span><div><div class="context-name">'+c.label+'</div><div class="context-desc">'+c.desc+'</div></div><span class="context-check" style="display:'+(c.id===selectedContext?'':'none')+'">✓</span>';card.onclick=()=>pickContext(c.id);list.appendChild(card)})}
function pickContext(id){selectedContext=id;CONTEXTS.forEach(c=>{const card=document.getElementById('ctx-'+c.id);card.classList.toggle('selected',c.id===id);card.querySelector('.context-check').style.display=c.id===id?'':'none'});document.getElementById('customContext').style.display=id==='custom'?'':'none';updateSummary()}
function updateSummary(){
    const total=parsedCount*selectedLangs.length;
    const cost=(selectedLangs.length*0.03).toFixed(2);
    const modeLabel=currentMode==='html'?'<br>Mode: <span class="val-gold">HTML File → i18n kit (safe, no code breakage)</span>':'';
    document.getElementById('summaryLine').innerHTML='<span class="val-accent">'+parsedCount+'</span> strings → <span class="val-accent">'+selectedLangs.length+'</span> languages = <span class="val-green">'+total+'</span> translations'+modeLabel+'<br>Estimated cost: <span class="val-green">~$'+cost+'</span>';
    // update button text for HTML mode
    document.getElementById('translateBtn').textContent=currentMode==='html'?'🚀 Translate & Build i18n Kit':'🚀 Translate Now';
}

// ═══ TRANSLATION ═══
async function startTranslation(){
    const apiKey=document.getElementById('apiKey').value.trim();
    if(!apiKey){alert('Please enter your Claude API key in Step 1');goToStep(1);return}
    translationResults={};goToStep(4);
    document.getElementById('resultTitle').textContent='Translating...';
    document.getElementById('progressWrap').style.display='';
    document.getElementById('resultsActions').style.display='none';
    document.getElementById('previewSection').style.display='none';
    renderResultsList();

    const contextLabel=selectedContext==='custom'?document.getElementById('customContext').value:CONTEXTS.find(c=>c.id===selectedContext)?.label||selectedContext;

    for(let i=0;i<selectedLangs.length;i++){
        const code=selectedLangs[i];
        const langName=LANGUAGES.find(l=>l.code===code)?.name||code;
        document.getElementById('progressInfo').textContent='Translating to '+langName+'... ('+(i+1)+'/'+selectedLangs.length+')';
        document.getElementById('progressFill').style.width=((i+1)/selectedLangs.length*100)+'%';
        toast('→ '+langName+'...');

        try{
            const resp=await fetch('https://api.anthropic.com/v1/messages',{
                method:'POST',
                headers:{'Content-Type':'application/json','x-api-key':apiKey,'anthropic-version':'2023-06-01','anthropic-dangerous-direct-browser-access':'true'},
                body:JSON.stringify({
                    model:'claude-sonnet-4-20250514',
                    max_tokens:4000,
                    messages:[{role:'user',content:'You are a professional app translator. Translate the following JSON key-value pairs from English to '+langName+'.\n\nCONTEXT: This is a '+contextLabel+' application. Match the tone and vocabulary appropriate for this context.\n\nRULES:\n- Return ONLY valid JSON, no markdown, no backticks, no explanation\n- Keep all JSON keys exactly the same (do not translate keys)\n- Keep all {variables}, HTML tags, and special characters intact\n- Keep emoji intact (do not translate emoji)\n- Use natural, fluent '+langName+'\n- Keep translations concise\n\nINPUT:\n'+JSON.stringify(parsedData,null,2)}]
                })
            });
            const data=await resp.json();
            if(data.error)throw new Error(data.error.message||'API error');
            const text=(data.content||[]).map(c=>c.type==='text'?c.text:'').join('');
            const clean=text.replace(/```json|```/g,'').trim();
            translationResults[code]={ok:true,data:JSON.parse(clean),langName};
        }catch(err){
            translationResults[code]={ok:false,error:err.message,langName};
        }
        renderResultsList();
    }

    // If HTML mode, now build translated HTML files
    if(currentMode==='html'){
        document.getElementById('progressInfo').textContent='Building i18n kit...';
        buildI18nKit();
    }

    document.getElementById('resultTitle').textContent='Done! 🎉';
    document.getElementById('progressWrap').style.display='none';
    document.getElementById('resultsActions').style.display='flex';
    if(currentMode==='html'){
        document.getElementById('resultsActions').innerHTML='<button class="btn-download-all" onclick="downloadI18nKit()" style="background:linear-gradient(135deg,var(--gold),var(--gold2))">Download i18n Kit</button><button class="btn-ghost" onclick="startOver()" style="padding:15px 20px;font-size:14px;font-weight:700">New</button>';
    }
    renderPreview();
    toast('All translations complete!');
}

// === BUILD i18n KIT ===
var i18nKitOutput='';
function buildI18nKit(){
    const lo={en:{}};
    for(const[k,v] of Object.entries(extractedStrings)) lo.en[k]=v;
    for(const code of selectedLangs){
        const r=translationResults[code];
        if(r&&r.ok) lo[code]=r.data;
    }
    const lc=['en',...selectedLangs.filter(c=>translationResults[c]&&translationResults[c].ok)];
    const po=selectedLangs.filter(c=>translationResults[c]&&translationResults[c].ok).map(code=>{
        const l=LANGUAGES.find(x=>x.code===code);
        return'  <option value="'+code+'">'+(l?l.flag+' '+l.name:code)+'</option>';
    }).join('\n');
    let kg='';
    const ent=Object.entries(extractedStrings);
    ent.slice(0,30).forEach(([k,v])=>{
        const s=v.replace(/'/g,"\\'").substring(0,50);
        kg+="//   '"+s+"' -> t('"+k+"')\n";
    });
    if(ent.length>30) kg+='//   ... +'+(ent.length-30)+' more\n';
    var S='<'+'script>',SE='<'+'/script>',CO='<'+'!-- ',CE=' -->';
    var o=CO+'VEX i18n Integration Kit'+CE+'\n';
    o+=CO+'Generated by VEX Translate Studio v2'+CE+'\n';
    o+=CO+'Languages: '+lc.join(', ')+' | Strings: '+ent.length+CE+'\n\n';
    o+=S+'\n';
    o+='const VEX_LANG = '+JSON.stringify(lo,null,2)+';\n\n';
    o+='let currentLang = navigator.language.slice(0,2);\n';
    o+='if (!VEX_LANG[currentLang]) currentLang = "en";\n\n';
    o+='function t(key) {\n';
    o+='  return (VEX_LANG[currentLang]&&VEX_LANG[currentLang][key])||VEX_LANG.en[key]||key;\n';
    o+='}\n\n';
    o+='function setLang(code) {\n';
    o+='  if(VEX_LANG[code]){\n';
    o+='    currentLang=code;\n';
    o+='    document.querySelectorAll("[data-i18n]").forEach(function(el){\n';
    o+='      el.textContent=t(el.getAttribute("data-i18n"));\n';
    o+='    });\n  }\n}\n';
    o+=SE+'\n\n';
    o+=CO+'\nSTEP 3: Language picker (uncomment)\n';
    o+='<select onchange="setLang(this.value)">\n';
    o+='  <option value="en">English</option>\n';
    o+=po+'\n</select>\n\n';
    o+='KEY MAP: Replace text with t() calls\n';
    o+='BEFORE: vexSay("id","Amazing!")\n';
    o+='AFTER:  vexSay("id",t("str_5"))\n\n';
    o+='Your keys:\n'+kg+CE+'\n';
    i18nKitOutput=o;
    toast('i18n kit ready!');
}

// ═══ RESULTS ═══
function renderResultsList(){
    const el=document.getElementById('resultsList');el.innerHTML='';
    const fileExt=currentMode==='html'?'.json':inputFormat==='json'?'.json':'.txt';
    for(const[code,res]of Object.entries(translationResults)){
        const lang=LANGUAGES.find(l=>l.code===code);
        el.innerHTML+='<div class="result-row '+(res.ok?'success':'fail')+'"><div class="result-left"><span class="result-flag">'+(lang?.flag||'')+'</span><div><div class="result-name">'+(lang?.name||code)+'</div><div class="result-status '+(res.ok?'ok':'err')+'">'+(res.ok?Object.keys(res.data).length+' strings'+(currentMode==='html'?' · i18n ready':''):'Error: '+res.error)+'</div></div></div>'+(res.ok?'<button class="btn-download" onclick="downloadFile(\''+code+'\')">↓ '+code+fileExt+'</button>':'')+'</div>';
    }
    selectedLangs.filter(c=>!translationResults[c]).forEach(code=>{
        const lang=LANGUAGES.find(l=>l.code===code);
        el.innerHTML+='<div class="result-row waiting"><div class="result-left"><span class="result-flag">'+(lang?.flag||'')+'</span><div><div class="result-name">'+(lang?.name||code)+'</div><div class="result-status wait">Waiting...</div></div></div></div>';
    });
}

function unflattenJSON(flat){const r={};for(const[key,val]of Object.entries(flat)){const parts=key.split('.');let c=r;for(let i=0;i<parts.length-1;i++){if(!c[parts[i]])c[parts[i]]={};c=c[parts[i]]}c[parts[parts.length-1]]=val}return r}

function downloadFile(code){
    const res=translationResults[code];if(!res||!res.ok)return;
    let out,filename,mime='text/plain;charset=utf-8';

    if(false){
        // use i18n kit instead
    }else if(inputFormat==='json'){
        out=JSON.stringify(unflattenJSON(res.data),null,2);
        filename=code+'.json';
    }else if(inputFormat==='csv'){
        out=Object.entries(res.data).map(([k,v])=>k+'='+v).join('\n');
        filename=code+'.txt';
    }else{
        out=Object.values(res.data).join('\n');
        filename=code+'.txt';
    }
    const blob=new Blob([out],{type:mime});
    const url=URL.createObjectURL(blob);
    const a=document.createElement('a');a.href=url;a.download=filename;a.click();
    URL.revokeObjectURL(url);
    toast('Downloaded '+filename);
}

function downloadAll(){
    if(currentMode==='html'){downloadI18nKit();return}
    Object.keys(translationResults).forEach(c=>{if(translationResults[c].ok)downloadFile(c)});
}
function downloadI18nKit(){
    if(!i18nKitOutput){toast('No kit');return}
    const blob=new Blob([i18nKitOutput],{type:'text/html;charset=utf-8'});
    const url=URL.createObjectURL(blob);
    const a=document.createElement('a');a.href=url;a.download='i18n-translations.html';a.click();
    URL.revokeObjectURL(url);
    toast('Downloaded i18n kit!');
}

function renderPreview(){
    const s=Object.entries(translationResults).filter(([_,r])=>r.ok);
    if(!s.length)return;
    document.getElementById('previewSection').style.display='';
    const t=document.getElementById('previewTable');
    const show=s.slice(0,3);
    const colT='120px 1fr '+show.map(()=>'1fr').join(' ');
    let h='<div class="preview-header" style="grid-template-columns:'+colT+'"><div>Key</div><div>English</div>'+show.map(([c])=>{const l=LANGUAGES.find(x=>x.code===c);return'<div>'+(l?.flag||'')+' '+c+'</div>'}).join('')+'</div>';
    Object.keys(parsedData).slice(0,10).forEach(key=>{
        h+='<div class="preview-row" style="grid-template-columns:'+colT+'"><div class="preview-key">'+key+'</div><div class="preview-en">'+escHtml(parsedData[key])+'</div>'+show.map(([c,r])=>'<div class="preview-translated">'+escHtml(r.data[key]||'—')+'</div>').join('')+'</div>';
    });
    t.innerHTML=h;
}

init();

