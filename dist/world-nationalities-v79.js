'use strict';

// Player nationalities are separate from the six countries that run leagues and cups.
// Format: FIFA code | German | English | flag code | group | given names | surnames.
const v79NationRows=`
ALB|Albanien|Albania|AL|uefa|Arben,Erion,Ilir,Altin,Besnik|Hoxha,Shehu,Leka,Dervishi,Kola
AND|Andorra|Andorra|AD|uefa|Marc,Jordi,Joan,Eric,Albert|Garcia,Martínez,Reig,Pujol,Fernández
ARM|Armenien|Armenia|AM|uefa|Aram,Tigran,Artur,Gor,Davit|Harutyunyan,Mkrtchyan,Grigoryan,Avetisyan,Sargsyan
AZE|Aserbaidschan|Azerbaijan|AZ|uefa|Rashad,Elvin,Mahir,Orkhan,Farid|Mammadov,Aliyev,Huseynov,Ismayilov,Hasanov
BLR|Belarus|Belarus|BY|uefa|Maksim,Artyom,Kirill,Ilya,Denis|Kovalenko,Petrov,Savitski,Volkov,Ivanov
BEL|Belgien|Belgium|BE|uefa|Lucas,Arthur,Thomas,Noah,Milan|Janssens,Peeters,Dubois,Lambert,De Smet
BIH|Bosnien und Herzegowina|Bosnia and Herzegovina|BA|uefa|Emir,Adnan,Amar,Haris,Mirza|Hadžić,Begić,Hodžić,Mehić,Kovačević
BUL|Bulgarien|Bulgaria|BG|uefa|Georgi,Ivan,Dimitar,Nikolay,Martin|Ivanov,Georgiev,Dimitrov,Petrov,Stoyanov
DEN|Dänemark|Denmark|DK|uefa|Mikkel,Frederik,Oliver,Mathias,Emil|Jensen,Nielsen,Andersen,Pedersen,Christensen
GER|Deutschland|Germany|DE|uefa|Noah,Jonas,Paul,Finn,Anton,Julian,Leon,Emil,Moritz,David,Max,Tim|Weber,Fischer,Wagner,Becker,Hoffmann,Koch,Schäfer,Wolf,Neumann,Braun,Krüger,Hartmann,Schulz,Zimmermann
ENG|England|England|GB-ENG|uefa|Oliver,Jack,George,Harry,Noah,Leo,Oscar,Ethan,Lucas,Alfie,William,James|Smith,Walker,Turner,Bennett,Carter,Hughes,Morris,Clarke,Cooper,Bailey,Foster,Ward,Mitchell,Robinson
EST|Estland|Estonia|EE|uefa|Karl,Markus,Rasmus,Martin,Kristjan|Tamm,Saar,Mägi,Sepp,Kask
FRO|Färöer|Faroe Islands|FO|uefa|Jákup,Símun,Rógvi,Heri,Jóan|Joensen,Hansen,Olsen,Petersen,Jacobsen
FIN|Finnland|Finland|FI|uefa|Eero,Onni,Leo,Oliver,Matias|Korhonen,Virtanen,Mäkinen,Nieminen,Hämäläinen
FRA|Frankreich|France|FR|uefa|Lucas,Hugo,Louis,Jules,Raphaël,Nathan,Théo,Enzo,Mathis,Antoine,Adrien,Gabriel|Martin,Bernard,Dubois,Thomas,Robert,Richard,Petit,Durand,Leroy,Moreau,Laurent,Simon,Michel,Lefebvre
GEO|Georgien|Georgia|GE|uefa|Giorgi,Levan,Nika,Luka,Irakli|Beridze,Kapanadze,Gelashvili,Mchedlishvili,Kvaratskhelia
GIB|Gibraltar|Gibraltar|GI|uefa|Liam,Daniel,James,Marco,Joseph|Garcia,Casciaro,Chipolina,Walker,Olivero
GRE|Griechenland|Greece|GR|uefa|Giorgos,Nikos,Dimitris,Kostas,Panagiotis|Papadopoulos,Nikolaou,Ioannou,Georgiou,Karagiannis
IRL|Irland|Republic of Ireland|IE|uefa|Sean,Conor,Cian,Jack,Adam|Murphy,Kelly,Walsh,Byrne,O'Brien
ISL|Island|Iceland|IS|uefa|Jón,Aron,Birkir,Albert,Kristján|Jónsson,Sigurðsson,Gunnarsson,Guðmundsson,Þórðarson
ISR|Israel|Israel|IL|uefa|Noam,Daniel,Omer,Itay,Lior|Cohen,Levi,Mizrahi,Peretz,Azulay
ITA|Italien|Italy|IT|uefa|Luca,Marco,Matteo,Davide,Andrea,Elia,Lorenzo,Federico,Simone,Riccardo,Alessandro,Tommaso|Rossi,Romano,Conti,Costa,Moretti,Gallo,Ferrari,Esposito,Bianchi,Ricci,Marino,Greco,De Luca,Fontana
KAZ|Kasachstan|Kazakhstan|KZ|uefa|Nursultan,Arman,Askar,Alibek,Timur|Nurgaliyev,Iskakov,Zaynutdinov,Akhmetov,Orazov
KOS|Kosovo|Kosovo|XK|uefa|Ardian,Valon,Florent,Leart,Albin|Berisha,Krasniqi,Gashi,Bytyqi,Rexhepi
CRO|Kroatien|Croatia|HR|uefa|Luka,Ivan,Marko,Ante,Josip|Horvat,Kovačić,Babić,Novak,Marić
LVA|Lettland|Latvia|LV|uefa|Jānis,Artūrs,Roberts,Edgars,Rihards|Bērziņš,Kalniņš,Ozoliņš,Liepiņš,Krūmiņš
LIE|Liechtenstein|Liechtenstein|LI|uefa|Lukas,Marco,Noah,Julian,Simon|Büchel,Frick,Hasler,Marxer,Frommelt
LTU|Litauen|Lithuania|LT|uefa|Mantas,Lukas,Dominykas,Paulius,Justinas|Kazlauskas,Petrauskas,Jankauskas,Stankevičius,Paulauskas
LUX|Luxemburg|Luxembourg|LU|uefa|Tom,Luca,Daniel,Maxime,Yann|Muller,Schmit,Klein,Thill,Weis
MLT|Malta|Malta|MT|uefa|Matthew,Luke,Joseph,Daniel,Andrew|Borg,Camilleri,Vella,Grech,Attard
MDA|Moldau|Moldova|MD|uefa|Ion,Andrei,Vlad,Victor,Sergiu|Rusu,Ceban,Popa,Munteanu,Rotaru
MNE|Montenegro|Montenegro|ME|uefa|Nikola,Marko,Stefan,Luka,Petar|Jovanović,Popović,Radović,Vuković,Đurović
NED|Niederlande|Netherlands|NL|uefa|Daan,Sem,Luuk,Noah,Mees|De Jong,Jansen,De Vries,Van Dijk,Bakker
NIR|Nordirland|Northern Ireland|GB-NIR|uefa|Conor,James,Jordan,Callum,Patrick|Wilson,McLaughlin,Hughes,McCann,McAuley
MKD|Nordmazedonien|North Macedonia|MK|uefa|Stefan,Aleksandar,Filip,Marko,Darko|Stojanovski,Trajkovski,Nikolovski,Alioski,Petrovski
NOR|Norwegen|Norway|NO|uefa|Emil,Oliver,Jakob,Magnus,Henrik|Hansen,Johansen,Olsen,Larsen,Andersen
AUT|Österreich|Austria|AT|uefa|Lukas,Jonas,Maximilian,David,Florian|Gruber,Huber,Schmidt,Wagner,Moser
POL|Polen|Poland|PL|uefa|Jakub,Jan,Antoni,Filip,Piotr|Kowalski,Nowak,Wiśniewski,Wójcik,Kamiński
POR|Portugal|Portugal|PT|uefa|João,Diogo,Tiago,Gonçalo,Rafael,Miguel,André,Pedro,Tomás,Nuno,Afonso,Bruno|Silva,Santos,Ferreira,Pereira,Oliveira,Costa,Rodrigues,Martins,Sousa,Fernandes,Gomes,Carvalho,Almeida,Correia
ROU|Rumänien|Romania|RO|uefa|Andrei,Alexandru,Mihai,Ștefan,Vlad|Popescu,Ionescu,Marin,Stoica,Dumitrescu
RUS|Russland|Russia|RU|uefa|Aleksandr,Dmitri,Artyom,Ivan,Sergei|Ivanov,Smirnov,Kuznetsov,Popov,Sokolov
SMR|San Marino|San Marino|SM|uefa|Luca,Matteo,Andrea,Alessandro,Marco|Gasparoni,Cecchetti,Palazzi,Tomassini,Marani
SCO|Schottland|Scotland|GB-SCT|uefa|Callum,Scott,Jack,Ryan,Ewan|Robertson,Campbell,Stewart,McGregor,MacDonald
SWE|Schweden|Sweden|SE|uefa|Elias,Oscar,William,Hugo,Alexander|Andersson,Johansson,Karlsson,Nilsson,Eriksson
SUI|Schweiz|Switzerland|CH|uefa|Luca,Noah,Leon,Matteo,Jan|Müller,Meier,Schmid,Keller,Weber
SRB|Serbien|Serbia|RS|uefa|Nikola,Luka,Stefan,Marko,Aleksandar|Jovanović,Petrović,Nikolić,Đorđević,Stojanović
SVK|Slowakei|Slovakia|SK|uefa|Jakub,Martin,Tomáš,Samuel,Adam|Novák,Kováč,Horváth,Tóth,Polák
SVN|Slowenien|Slovenia|SI|uefa|Luka,Jan,Žan,Mark,Miha|Novak,Horvat,Kovačič,Zupančič,Mlakar
ESP|Spanien|Spain|ES|uefa|Alejandro,Daniel,Pablo,Álvaro,Diego,Javier,Sergio,Hugo,Marcos,Adrián,Iker,Iván,Raúl,David,Álex,Manuel|García,Martínez,López,Sánchez,Rodríguez,Fernández,Pérez,Gómez,Díaz,Moreno,Ruiz,Navarro,Torres,Romero,Ramos,Domínguez,Vázquez,Ortega,Delgado,Castro,Jiménez,Molina,Suárez,Herrera,Medina,Marín,Reyes,Iglesias,Cortés,Flores
CZE|Tschechien|Czechia|CZ|uefa|Jakub,Jan,Tomáš,Matěj,Adam|Novák,Svoboda,Dvořák,Černý,Procházka
TUR|Türkei|Türkiye|TR|uefa|Mehmet,Emre,Arda,Kerem,Can|Yılmaz,Kaya,Demir,Çelik,Şahin
UKR|Ukraine|Ukraine|UA|uefa|Andriy,Maksym,Dmytro,Oleksandr,Mykola|Shevchenko,Bondarenko,Kovalenko,Melnyk,Boyko
HUN|Ungarn|Hungary|HU|uefa|Bence,Máté,Ádám,Dániel,Balázs|Nagy,Kovács,Tóth,Szabó,Varga
WAL|Wales|Wales|GB-WLS|uefa|Dylan,Rhys,Owain,Jack,Tomos|Jones,Williams,Davies,Evans,Thomas
CYP|Zypern|Cyprus|CY|uefa|Andreas,Christos,Marios,Nicolas,Panagiotis|Georgiou,Ioannou,Christodoulou,Nikolaou,Michael
USA|USA|United States|US|north|Liam,Noah,James,Oliver,Lucas|Johnson,Williams,Brown,Davis,Wilson
CAN|Kanada|Canada|CA|north|Liam,Noah,Oliver,William,Jacob|Smith,Tremblay,Brown,Martin,Roy
MEX|Mexiko|Mexico|MX|north|José,Miguel,Diego,Santiago,Carlos|Hernández,García,Martínez,López,González
ARG|Argentinien|Argentina|AR|south|Mateo,Benjamín,Thiago,Santiago,Juan,Facundo,Joaquín,Agustín,Lautaro,Nicolás|González,Rodríguez,Fernández,López,Martínez,Pérez,Gómez,Romero,Díaz,Álvarez,Suárez,Acosta
BOL|Bolivien|Bolivia|BO|south|Luis,Carlos,Diego,Miguel,Jorge|Mamani,Quispe,Flores,Rojas,Vargas
BRA|Brasilien|Brazil|BR|south|Gabriel,Lucas,Matheus,Pedro,Rafael,João,Vinícius,Guilherme,Bruno,Felipe,Thiago,André|Silva,Santos,Oliveira,Souza,Pereira,Costa,Almeida,Lima,Ferreira,Ribeiro,Carvalho,Gomes,Rocha,Barbosa,Araújo,Melo
CHI|Chile|Chile|CL|south|Benjamín,Matías,Diego,Tomás,Felipe|González,Muñoz,Rojas,Díaz,Pérez
ECU|Ecuador|Ecuador|EC|south|José,Diego,Luis,Kevin,Carlos|García,Rodríguez,Zambrano,Quintero,Valencia
GUY|Guyana|Guyana|GY|south|Joshua,Daniel,Michael,David,Andre|Persaud,Ali,Thomas,Johnson,Smith
COL|Kolumbien|Colombia|CO|south|Juan,Santiago,Andrés,David,Mateo,Camilo,Daniel,Sebastián,Kevin,Jhon|Rodríguez,Martínez,García,Gómez,Moreno,Álvarez,Jiménez,Castro,Ramírez,Hernández
PAR|Paraguay|Paraguay|PY|south|Miguel,José,Diego,Juan,Óscar|González,Benítez,Martínez,Romero,Cáceres
PER|Peru|Peru|PE|south|Luis,José,Diego,Carlos,Renato|Quispe,Flores,Huamán,Rojas,García
SUR|Suriname|Suriname|SR|south|Jairo,Ryan,Jerrel,Giovanni,Mitchell|Pinas,Abena,Comvalius,Dijksteel,Leerdam
URU|Uruguay|Uruguay|UY|south|Santiago,Matías,Facundo,Joaquín,Agustín|Rodríguez,González,Fernández,Pérez,Silva
VEN|Venezuela|Venezuela|VE|south|José,Juan,Carlos,Miguel,Andrés|González,Rodríguez,Pérez,Martínez,Chávez
JPN|Japan|Japan|JP|asia|Haruto,Yuto,Sota,Riku,Ren|Sato,Suzuki,Takahashi,Tanaka,Watanabe
KOR|Südkorea|Korea Republic|KR|asia|Min-jun,Ji-ho,Seo-jun,Do-yun,Jun-ho|Kim,Lee,Park,Choi,Jung
CHN|China|China PR|CN|asia|Wei,Jun,Hao,Ming,Yang|Wang,Li,Zhang,Liu,Chen
IRN|Iran|IR Iran|IR|asia|Amir,Ali,Reza,Mehdi,Saeid|Mohammadi,Hosseini,Ahmadi,Karimi,Rahimi
IND|Indien|India|IN|asia|Arjun,Rahul,Aryan,Rohan,Aditya|Singh,Kumar,Sharma,Patel,Das
KSA|Saudi-Arabien|Saudi Arabia|SA|asia|Mohammed,Abdullah,Ahmed,Khalid,Omar|Al-Dossari,Al-Ghamdi,Al-Harbi,Al-Qahtani,Al-Shehri
TJK|Tadschikistan|Tajikistan|TJ|asia|Firdavs,Parviz,Daler,Shahrom,Manuchehr|Rahmonov,Davlatov,Karimov,Saidov,Nazarov
KGZ|Kirgisistan|Kyrgyzstan|KG|asia|Azamat,Bekzat,Nursultan,Mirlan,Erbol|Abdykadyrov,Ismailov,Osmonov,Uulu,Sydykov
THA|Thailand|Thailand|TH|asia|Nattawut,Chanathip,Supachai,Teerasil,Ekanit|Bunmathan,Mueanta,Songkrasin,Jaided,Sarabut
AUS|Australien|Australia|AU|oceania|Jack,Oliver,Noah,William,Thomas|Smith,Jones,Williams,Brown,Taylor
NZL|Neuseeland|New Zealand|NZ|oceania|Liam,Oliver,Noah,Jack,Lucas|Wilson,Brown,Taylor,Smith,Thompson
PAN|Panama|Panama|PA|central|José,Luis,Carlos,Abdiel,Alberto|Rodríguez,González,Martínez,Pérez,Díaz
CRC|Costa Rica|Costa Rica|CR|central|José,Daniel,Carlos,Andrés,David|Rodríguez,Vargas,Jiménez,Solano,Chaves
HON|Honduras|Honduras|HN|central|José,Luis,Carlos,Jorge,Kevin|Hernández,López,Martínez,Rodríguez,Mejía
GUA|Guatemala|Guatemala|GT|central|José,Carlos,Luis,Juan,Diego|López,García,Ramírez,Morales,Castillo
SLV|El Salvador|El Salvador|SV|central|José,Carlos,Mario,David,Kevin|Hernández,Martínez,Rodríguez,Ramírez,Flores
MAR|Marokko|Morocco|MA|africa|Youssef,Achraf,Hakim,Amine,Walid|El Amrani,Bennani,Alaoui,Idrissi,Boufal
SEN|Senegal|Senegal|SN|africa|Moussa,Idrissa,Pape,Cheikh,Abdoulaye|Diop,Ndoye,Gueye,Sarr,Ba
EGY|Ägypten|Egypt|EG|africa|Mohamed,Ahmed,Omar,Mostafa,Mahmoud|Hassan,Ibrahim,Abdelrahman,Fathy,El Sayed
NGA|Nigeria|Nigeria|NG|africa|Chinedu,Tunde,Samuel,Emeka,Ibrahim|Okafor,Adebayo,Obi,Musa,Onyekuru
ALG|Algerien|Algeria|DZ|africa|Riyad,Youcef,Ismaël,Bilal,Amine|Bensebaini,Benali,Boudaoui,Mahrez,Belkhir
CIV|Elfenbeinküste|Côte d'Ivoire|CI|africa|Yaya,Jean,Serge,Wilfried,Ibrahim|Traoré,Kouassi,Koné,Diabaté,Zaha
COD|DR Kongo|Congo DR|CD|africa|Cédric,Chancel,Jonathan,Samuel,Théo|Bakambu,Mbemba,Kalulu,Mukiele,Masuaku
CMR|Kamerun|Cameroon|CM|africa|André,Eric,Jean,Vincent,Christian|Onana,Aboubakar,Nkoulou,Moukoko,Anguissa
MLI|Mali|Mali|ML|africa|Amadou,Adama,Moussa,Ibrahim,Oumar|Coulibaly,Traoré,Konaté,Diarra,Keïta
RSA|Südafrika|South Africa|ZA|africa|Sipho,Thabo,Themba,Bongani,Percy|Mokoena,Ngcobo,Mabena,Mthembu,Zwane
TUN|Tunesien|Tunisia|TN|africa|Youssef,Anis,Wahbi,Seifeddine,Mohamed|Msakni,Khazri,Skhiri,Laïdouni,Ben Youssef
BFA|Burkina Faso|Burkina Faso|BF|africa|Bertrand,Edmond,Issa,Abdoul,Adama|Traoré,Tapsoba,Ouédraogo,Sangaré,Kaboré
CPV|Kap Verde|Cabo Verde|CV|africa|Ryan,Jamiro,Patrick,Jovane,Kenny|Mendes,Semedo,Rodrigues,Varela,Tavares
GHA|Ghana|Ghana|GH|africa|Kofi,Kwame,Joseph,Thomas,Daniel|Mensah,Boateng,Asante,Owusu,Addo
GUI|Guinea|Guinea|GN|africa|Naby,Ibrahima,Mohamed,Amadou,Sory|Keïta,Camara,Konaté,Barry,Diallo
`.trim();
const v79Nationalities=v79NationRows.split('\n').map(row=>{
 const [code,de,en,flag,group,given,family]=row.split('|');
 return{code,de,en,flag,group,given:given.split(','),family:family.split(',')};
});
const v79NationByCode=Object.fromEntries(v79Nationalities.map(nation=>[nation.code,nation]));
const v79YouthPartners={
 ENG:[['SCO',65],['WAL',35]],
 ESP:[['FRA',55],['POR',43],['AND',1],['GIB',1]],
 ITA:[['FRA',49],['SUI',24],['AUT',14],['SVN',12],['SMR',1]],
 GER:[['FRA',20],['NED',17],['POL',16],['CZE',12],['AUT',11],['BEL',9],['DEN',8],['SUI',5],['LUX',2]],
 FRA:[['GER',25],['ESP',22],['BEL',18],['SUI',16],['ITA',15],['LUX',3],['AND',1]],
 POR:[['BRA',60],['ESP',40]]
};
// Frozen, deliberately coarse export-strength tiers. All unlisted countries get 1.
const v79RestWeight={BRA:16,FRA:16,ARG:16,ENG:8,ESP:8,GER:8,SRB:8,CRO:8,COL:8,POR:8,NGA:8,ITA:4,NED:4,BEL:4,URU:4,MEX:4,USA:4,SUI:4,AUT:4,POL:4,CZE:4,DEN:4,SWE:4,UKR:4,ROU:4,TUR:4,JPN:4,KOR:4,MAR:4,SEN:4,CIV:4,CMR:4,GHA:4,ALG:4,EGY:4,MLI:4,COD:4,CHI:2,PAR:2,PER:2,ECU:2,AUS:2,CAN:2,GRE:2,NOR:2,IRL:2,SVK:2,SVN:2,BIH:2,HUN:2,ALB:2,VEN:2,TUN:2,RSA:2,BFA:2,CPV:2,GUI:2};
// Editorial league profiles: expatriate shares and migration routes are broad guides,
// not nationality quotas. Free agents use a separate home share from club rosters.
const v79ProfessionalHomeShare={roster:{ENG:40,ESP:60,ITA:38,GER:45,FRA:50,POR:40},free:{ENG:25,ESP:38,ITA:25,GER:32,FRA:35,POR:25}};
const v79ProfessionalRoutes={
 ENG:{FRA:4,SCO:5,WAL:5,NIR:4,IRL:4,ESP:2,GER:2,POR:2},
 ESP:{FRA:4,POR:4,ARG:3,COL:3,URU:3,MAR:2},
 ITA:{FRA:4,ARG:3,ALB:4,ROU:3,SRB:2,CRO:2,BRA:2},
 GER:{FRA:4,AUT:4,SUI:3,NED:3,POL:3,CZE:3,TUR:3},
 FRA:{BRA:3,BEL:3,SUI:3,MAR:4,ALG:4,TUN:3,SEN:3,CIV:3,CMR:3},
 POR:{BRA:12,ESP:3,CPV:4,FRA:2,ARG:2,COL:2}
};
function v79WeightedPick(items,random){
 const total=items.reduce((sum,item)=>sum+item[1],0);
 let choice=random()*total;
 for(const [code,weight] of items){choice-=weight;if(choice<0)return code}
 return items.at(-1)[0];
}
function v79YouthNation(home,pid){
 const random=v61Random(`${pid}:nationality`),partners=v79YouthPartners[home];
 if(!partners)throw Error(`Unbekanntes Vereinsland: ${home}`);
 const group=random();
 if(group<.6)return home;
 if(group<.9)return v79WeightedPick(partners,random);
 const excluded=new Set([home,...partners.map(([code])=>code)]);
 return v79WeightedPick(v79Nationalities.filter(nation=>!excluded.has(nation.code)).map(nation=>[nation.code,v79RestWeight[nation.code]||1]),random);
}
function v79ProfessionalNation(home,pid,kind='roster'){
 const homeShare=v79ProfessionalHomeShare[kind]?.[home],routes=v79ProfessionalRoutes[home];
 if(homeShare===undefined||!routes)throw Error(`Unbekanntes Profil: ${home}/${kind}`);
 const random=v61Random(`${pid}:professional-nationality`);
 if(random()*100<homeShare)return home;
 return v79WeightedPick(v79Nationalities.filter(nation=>nation.code!==home).map(nation=>[nation.code,(v79RestWeight[nation.code]||1)*(routes[nation.code]||1)]),random);
}
function v79PlayerName(code,pid,used){
 const nation=v79NationByCode[code];
 if(!nation)throw Error(`Unbekannte Spielernationalität: ${code}`);
 const random=v61Random(`${pid}:name`);
 const count=nation.given.length*nation.family.length,start=Math.floor(random()*nation.given.length)*nation.family.length+Math.floor(random()*nation.family.length);
 for(let offset=0;offset<count;offset++){
  const index=(start+offset)%count,name=`${nation.given[Math.floor(index/nation.family.length)]} ${nation.family[index%nation.family.length]}`;
  if(!used?.has(name))return name;
 }
 throw Error(`Namensliste für ${code} erschöpft`);
}
function v79YouthName(code,pid){return v79PlayerName(code,pid)}
function v79NationName(code,language='de'){const nation=v79NationByCode[code];return nation?.[language==='en'?'en':'de']||'Unbekannt'}
function v79FlagSVG(code){
 const nation=v79NationByCode[code];
 if(!nation)return'<span class="flag-emoji" role="img" aria-label="Unbekannt" title="Unbekannt">⚑</span>';
 const label=nation.de,common=`viewBox="0 0 24 16" role="img" aria-label="${label}" class="flag-icon v61-country-flag"`;
 if(code==='ENG')return`<svg ${common}><title>${label}</title><path fill="#fff" d="M0 0h24v16H0z"/><path fill="#c8102e" d="M10 0h4v16h-4zM0 6h24v4H0z"/></svg>`;
 if(code==='SCO')return`<svg ${common}><title>${label}</title><path fill="#0065bd" d="M0 0h24v16H0z"/><path stroke="#fff" stroke-width="4" d="M0 0l24 16M24 0L0 16"/></svg>`;
 if(code==='WAL')return`<svg ${common}><title>${label}</title><path fill="#fff" d="M0 0h24v8H0z"/><path fill="#00843d" d="M0 8h24v8H0z"/><path fill="#c8102e" d="m5 10 2-5 3 1 2-4 2 4 4-1-2 4 3 3-4-1-2 2-2-2-4 1z"/></svg>`;
 if(code==='NIR')return`<svg ${common}><title>${label}</title><path fill="#fff" d="M0 0h24v16H0z"/><path fill="#c8102e" d="M10 0h4v16h-4zM0 6h24v4H0z"/><path fill="#fff" d="m12 4 1 2 2 1-2 1-1 2-1-2-2-1 2-1z"/><circle cx="12" cy="7" r="1" fill="#c8102e"/></svg>`;
 if(code==='KOS')return`<svg ${common}><title>${label}</title><path fill="#244aa5" d="M0 0h24v16H0z"/><path fill="#ffcc00" d="m8 6 5-2 4 2-1 5-6 1z"/><path fill="#fff" d="M5 3h1v1H5zm3-1h1v1H8zm3 0h1v1h-1zm3 0h1v1h-1zm3 1h1v1h-1zm3 1h1v1h-1z"/></svg>`;
 const emoji=[...nation.flag].map(char=>String.fromCodePoint(127397+char.charCodeAt())).join('');
 return`<span class="flag-emoji" role="img" aria-label="${label}" title="${label}">${emoji}</span>`;
}
