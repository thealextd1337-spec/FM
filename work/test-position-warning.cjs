const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const source=fs.readFileSync('dist/world-match-ui-v64.js','utf8');
const pitch=source.slice(source.indexOf('function v64UiPrematchPitch('),source.indexOf('function v64OrientationHTML('));
const warning=source.slice(source.indexOf('function v64PositionWarningHTML('),source.indexOf('function v64UiPrematchSelection('));
const context=vm.createContext({
 v64Roles:{att:'Angriff',def:'Abwehr',gk:'Torwart'},
 v61PositionNames:{att:'Angriff',def:'Abwehr',gk:'Torwart'},
 v64SelectedSlot:0,
 v64Side:()=>[{pid:'p1',name:'Gabriel Thomas',n:11,nation:'FR',line:'att',fresh:90}],
 v64EnsureCells:()=>({p1:26}),
 v64Orientation:()=>0,
 v64InstructionLabel:()=> 'Standard',
 v51EffectiveForm:()=>50,
 formText:()=> 'normal',
 freshText:()=> 'frisch',
 v51PitchFaceHTML:()=> '',
 v51PitchBarHTML:()=> '',
 v61FlagSVG:()=> '',
 v61ClubColors:()=> ['#326a50','#a4d4b2'],
 escapeHTML:value=>String(value)
});
vm.runInContext(pitch+warning,context);
const career={world:{clubs:[{id:'home'}]}};
const fixture={homeId:'home',awayId:'away',plan:{home:{starters:['p1']}}};
const state={roles:{p1:'def'},fresh:{p1:90}};
const field=context.v64UiPrematchPitch(career,fixture,state,0);
assert.match(field,/class="v64-origin-position" aria-hidden="true">Stamm: Angriff<\/span>/,'wrong position is legible on the shirt');
assert.match(field,/Gabriel Thomas, Abwehr, Fremdposition: Stammposition Angriff/,'screen reader retains the warning');
assert.match(context.v64PositionWarningHTML({line:'att'},'def'),/Fremdposition: Stammposition Angriff, Einsatzposition Abwehr/);
state.roles.p1='att';
assert.doesNotMatch(context.v64UiPrematchPitch(career,fixture,state,0),/v64-origin-position/,'natural position has no warning');
assert.equal(context.v64PositionWarningHTML({line:'att'},'att'),'');
console.log('PASS: visible and accessible out-of-position warning');
