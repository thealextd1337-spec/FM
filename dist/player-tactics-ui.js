(function (root, factory) {
  'use strict';
  if (typeof module === 'object' && module.exports) module.exports = factory(root);
  else root.D6PlayerTacticsUI = factory(root);
}(typeof globalThis === 'object' ? globalThis : this, function (root) {
  'use strict';

  var BANDS = ['violetgray', 'bluegray', 'yellow', 'orange', 'pink'];
  var pickerId = 0;
  var popovers = !root.document || !!(root.HTMLElement && root.HTMLElement.prototype.showPopover);
  var POSITIONS = ['gk', 'def', 'mid', 'att'];
  var SKILLS = ['tec', 'pas', 'fin', 'tak', 'pos', 'spd', 'sta', 'air', 'gk', 'calm', 'ant', 'dec', 'str'];
  var COLOR_NAMES = {violetgray: ['Violettgrau', 'Violet grey'], bluegray: ['Blaugrau', 'Blue grey'], yellow: ['Gelb', 'Yellow'], orange: ['Orange'], pink: ['Pink']};
  var ROLE_NAMES = {
    'line-keeper': 'Linientormann', 'sweeper-keeper': 'Mitspielender Tormann',
    'cover-defender': 'Ausputzer', 'stopper': 'Stopper', 'ball-playing-defender': 'Ballspielender Verteidiger',
    'playmaker': 'Spielmacher', 'ball-winner': 'Abräumer', 'box-to-box': 'Box-to-Box', 'winger': 'Flügelspieler',
    'poacher': 'Torjäger', 'striker': 'Stoßstürmer', 'target-player': 'Zielspieler', 'dribbler': 'Dribbler'
  };
  var POSITION_NAMES = {gk: 'Torwart', def: 'Abwehr', mid: 'Mittelfeld', att: 'Angriff'};
  function object(value) { return value && typeof value === 'object' && !Array.isArray(value) ? value : {}; }
  function text(value, fallback) { return typeof value === 'string' ? value : fallback || ''; }
  function escape(value) { return text(value).replace(/[&<>"']/g, function (character) { return {'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[character]; }); }
  function band(value) { return BANDS.indexOf(value) >= 0 ? value : 'unknown'; }
  function colorLabel(value, level) { return COLOR_NAMES[level] && COLOR_NAMES[level].indexOf(value) >= 0 ? value : ''; }
  function roleId(value) { return typeof value === 'string' && Object.prototype.hasOwnProperty.call(ROLE_NAMES, value) ? value : ''; }
  function label(labels, key, fallback) { return text(object(labels)[key], fallback); }
  function roleLabel(id, supplied) { return text(supplied, ROLE_NAMES[id] || ''); }
  function safeRole(entry) {
    var value = object(entry), id = roleId(value.id || value.roleId);
    if (!id) return null;
    return {id: id, label: roleLabel(id, value.label), band: band(value.band), colorLabel: colorLabel(value.colorLabel, value.band), position: POSITIONS.indexOf(value.position) >= 0 ? value.position : '', best: value.best === true};
  }
  function roleList(value) {
    var seen = {};
    return (Array.isArray(value) ? value : []).map(safeRole).filter(function (entry) {
      if (!entry) return false;
      var key = entry.position + ':' + entry.id;
      if (seen[key]) return false;
      seen[key] = true; return true;
    });
  }
  function selectedRole(ui) {
    var input = object(ui), assignment = object(input.assignment), id = roleId(assignment.roleId);
    if (!id) return null;
    var allowed = roleList(input.allowedRoles), recommended = roleList(input.recommendations);
    var selected = allowed.find(function (entry) { return entry.id === id; }) || recommended.find(function (entry) { return entry.id === id && entry.position === assignment.position; });
    return {id: id, label: roleLabel(id, assignment.label), band: selected ? selected.band : 'unknown', colorLabel: selected ? selected.colorLabel : ''};
  }
  function dot(entry, labels, qualitative) {
    var color = qualitative ? suitability(entry, labels) : entry.colorLabel || label(labels, 'empty', 'Noch nicht bewertet');
    return '<span class="d6-role-suitability fl-band-' + band(entry.band) + '" role="img" aria-label="' + escape(label(labels, 'suitability', 'Eignung') + ': ' + color) + '" title="' + escape(label(labels, 'suitability', 'Eignung') + ': ' + color) + '"><i aria-hidden="true"></i></span>';
  }
  function suitability(entry, labels) {
    var names={violetgray:'Sehr schwach',bluegray:'Schwach',yellow:'Normal',orange:'Gut',pink:'Sehr gut'};
    var name=names[entry.band] || label(labels, 'empty', 'Noch nicht bewertet');
    // Keep source text stable: the shared DOM translator owns language changes.
    return label(labels, entry.band, name);
  }
  function importantMark() {
    return '<svg class="d6-role-important-icon" viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="m3 8 3 3 7-7"/></svg>';
  }
  function skillMarkup(entry, labels) {
    var value = object(entry);
    if (SKILLS.indexOf(value.key) < 0) return '';
    var projected = {label: text(value.label), band: band(value.band), colorLabel: colorLabel(value.colorLabel, value.band)};
    var components = root && root.D6Flutlicht && root.D6Flutlicht.components;
    var markup = components && typeof components.skill === 'function' ? components.skill(projected) : '<span class="fl-skill fl-band-' + projected.band + '" aria-label="' + escape(projected.label + ': ' + projected.colorLabel) + '"><i aria-hidden="true"></i>' + escape(projected.label) + '</span>';
    if (value.important !== true) return markup;
    return '<span class="d6-role-skill is-important" title="' + escape(label(labels, 'skillHint', 'Wichtig für diese Rolle')) + '">' + markup + importantMark() + '<span class="d6-role-sr-only">' + escape(label(labels, 'skillHint', 'Wichtig für diese Rolle')) + '</span></span>';
  }
  function importantSkills(ui, labels) {
    var entries = Array.isArray(object(ui).skills) ? ui.skills.filter(function (entry) { return object(entry).important === true && SKILLS.indexOf(object(entry).key) >= 0; }) : [];
    if (!entries.length) return '';
    return '<div class="d6-role-abilities"><h4>' + escape(label(labels, 'importantSkills', 'Wichtige Fähigkeiten')) + '</h4><div class="d6-role-skills">' + entries.map(function (entry) { return skillMarkup(entry, labels); }).join('') + '</div></div>';
  }
  function renderProfileRoles(ui, labels) {
    var input = object(ui), recommendations = roleList(input.recommendations).filter(function (entry) { return entry.position; });
    var groups = POSITIONS.map(function (position) {
      var entries = recommendations.filter(function (entry) { return entry.position === position; });
      if (!entries.length) return '';
      var positionName = text(object(object(labels).positions)[position], POSITION_NAMES[position]);
      return '<section class="d6-profile-role-group"><h4>' + escape(positionName) + '</h4><ul>' + entries.map(function (entry) {
        return '<li class="d6-profile-role' + (entry.best ? ' is-best' : '') + '">' + dot(entry, labels) + '<span class="d6-profile-role-name">' + escape(entry.label) + '</span>' + (entry.best ? '<span class="d6-role-best">' + importantMark() + escape(label(labels, 'best', 'Beste Eignung')) + '</span>' : '') + '</li>';
      }).join('') + '</ul></section>';
    }).join('');
    return '<section class="d6-profile-roles"><h3>' + escape(label(labels, 'roles', 'Empfohlene Rollen')) + '</h3>' + (groups || '<p class="d6-role-empty">' + escape(label(labels, 'empty', 'Keine Rollenempfehlung vorhanden')) + '</p>') + importantSkills(input, labels) + '</section>';
  }
  function renderTacticRoleControl(ui, labels) {
    var input = object(ui), assignment = object(input.assignment), id = roleId(assignment.roleId), selected = selectedRole(input);
    var allowed = roleList(input.allowedRoles), pid = text(input.pid), name = text(input.name), roleText = label(labels, 'role', 'Rolle');
    var hasSelected = allowed.some(function (entry) { return entry.id === id; });
    var options = hasSelected ? '' : '<option value="" disabled selected>' + escape(label(labels, 'empty', 'Rolle auswählen')) + '</option>';
    options += allowed.map(function (entry) { return '<option value="' + escape(entry.id) + '"' + (entry.id === id ? ' selected' : '') + ' title="' + escape(suitability(entry, labels)) + '" aria-label="' + escape(entry.label + ': ' + suitability(entry, labels)) + '"' + '>' + escape(entry.label) + '</option>'; }).join('');
    var orientation = [-1, 0, 1].indexOf(assignment.orientation) >= 0 ? assignment.orientation : 0;
    var orientationMarkup = assignment.position === 'gk' ? '' : '<fieldset class="d6-role-orientation v64-orientation"><legend>' + escape(label(labels, 'orientation', 'Individuelle Ausrichtung')) + '</legend><div class="d6-role-segmented">' + [[-1, label(labels, 'defensive', 'Defensiv')], [0, label(labels, 'neutral', 'Neutral')], [1, label(labels, 'offensive', 'Offensiv')]].map(function (entry) {
      return '<button type="button" data-v64-orientation="' + entry[0] + '" data-d6-orientation-player="' + escape(pid) + '" aria-pressed="' + (orientation === entry[0]) + '"' + (orientation === entry[0] ? ' class="active"' : '') + '>' + escape(entry[1]) + '</button>';
    }).join('') + '</div></fieldset>';
    var accessible = roleText + (name ? ': ' + name : '');
    if (!popovers) return '<section class="d6-role-control" aria-label="' + escape(accessible) + '"><label class="d6-role-picker"><span>' + escape(roleText) + '</span><span class="d6-role-select-row"><select data-d6-role="' + escape(pid) + '" aria-label="' + escape(accessible) + '"' + (!allowed.length ? ' disabled' : '') + '>' + options + '</select>' + (selected ? dot(selected, labels, true) : '') + '</span></label>' + orientationMarkup + importantSkills(input, labels) + '</section>';
    var listId = 'd6-role-choices-' + (++pickerId);
    var choices = allowed.map(function (entry, index) {
      return '<button type="button" role="option" tabindex="-1" id="' + listId + '-' + index + '" data-d6-role-choice="' + escape(entry.id) + '" aria-selected="' + (entry.id === id) + '" aria-label="' + escape(entry.label + ': ' + suitability(entry, labels)) + '">' + dot(entry, labels, true) + '<span>' + escape(entry.label) + '<small>' + escape(suitability(entry, labels)) + '</small></span></button>';
    }).join('');
    return '<section class="d6-role-control" aria-label="' + escape(accessible) + '"><div class="d6-role-picker"><span>' + escape(roleText) + '</span><div class="d6-role-select-row"><select class="d6-role-native d6-role-sr-only" tabindex="-1" aria-hidden="true" data-d6-role="' + escape(pid) + '"' + (!allowed.length ? ' disabled' : '') + '>' + options + '</select><button type="button" class="d6-role-trigger" role="combobox" aria-haspopup="listbox" aria-expanded="false" aria-controls="' + listId + '" aria-label="' + escape(accessible + ': ' + (selected ? selected.label + ', ' + suitability(selected, labels) : label(labels, 'empty', 'Rolle auswählen'))) + '"' + (!allowed.length ? ' disabled' : '') + '><span>' + escape(selected ? selected.label : label(labels, 'empty', 'Rolle auswählen')) + '</span>' + (selected ? dot(selected, labels, true) : '') + '<i class="d6-role-chevron" aria-hidden="true">⌄</i></button><div id="' + listId + '" class="d6-role-choices" role="listbox" aria-label="' + escape(accessible) + '" popover="auto">' + choices + '</div></div></div>' + orientationMarkup + importantSkills(input, labels) + '</section>';
  }
  function renderRoleZone(zone, labels) {
    var input = object(zone);
    if (['x', 'y', 'width', 'height'].some(function (key) { return typeof input[key] !== 'number' || !Number.isFinite(input[key]); }) || input.x < 0 || input.x >= 1 || input.y < 0 || input.y >= 1 || input.width <= 0 || input.height <= 0) return '';
    var x = Math.round(input.x * 100), y = Math.round(input.y * 100), width = Math.round(Math.min(input.width, 1 - input.x) * 100), height = Math.round(Math.min(input.height, 1 - input.y) * 100);
    if (!width || !height) return '';
    var description = label(labels, 'zone', 'Ungefähre Wirkungszone') + '. ' + label(labels, 'zoneHint', 'Der Spieler bewegt sich passend zur Spielsituation auch außerhalb dieses Bereichs.');
    return '<svg class="d6-role-zone" viewBox="0 0 100 100" preserveAspectRatio="none" role="img" aria-label="' + escape(description) + '" focusable="false"><title>' + escape(description) + '</title><rect x="' + x + '" y="' + y + '" width="' + width + '" height="' + height + '" rx="3"/></svg>';
  }
  function renderPitchRole(ui, labels) {
    var selected = selectedRole(ui);
    if (!selected) return '';
    return '<span class="d6-pitch-role fl-band-' + selected.band + '" title="' + escape(label(labels, 'role', 'Rolle') + ': ' + selected.label + (selected.colorLabel ? '. ' + label(labels, 'suitability', 'Eignung') + ': ' + selected.colorLabel : '')) + '"><i aria-hidden="true"></i><span>' + escape(selected.label) + '</span></span>';
  }
  // Shared presentation enhancement; the existing select/change controllers own
  // every role assignment, persistence, and prematch/pause validation.
  if (root && root.document && popovers) {
    var doc = root.document;
    function parts(node) {var row=node.closest('.d6-role-select-row');return row && {row:row,select:row.querySelector('[data-d6-role]'),trigger:row.querySelector('.d6-role-trigger'),list:row.querySelector('.d6-role-choices')};}
    function isOpen(p) {return p.list.matches(':popover-open');}
    function active(p,index) {var choices=p.list.querySelectorAll('[role=option]');if(!choices.length)return;index=Math.max(0,Math.min(choices.length-1,index));choices.forEach(function(n,i){n.classList.toggle('is-active',i===index);});p.trigger.setAttribute('aria-activedescendant',choices[index].id);choices[index].scrollIntoView({block:'nearest'});}
    function close(p) {if(isOpen(p))p.list.hidePopover();p.trigger.setAttribute('aria-expanded','false');p.trigger.removeAttribute('aria-activedescendant');}
    function open(p) {
      var rect=p.trigger.getBoundingClientRect(),width=Math.min(Math.max(rect.width,240),root.innerWidth-16);
      p.list.style.width=width+'px';p.list.style.left=Math.max(8,Math.min(rect.left,root.innerWidth-width-8))+'px';
      p.list.style.maxHeight=Math.max(88,Math.min(260,root.innerHeight-24))+'px';
      p.list.showPopover();var height=p.list.getBoundingClientRect().height;
      p.list.style.top=Math.max(8,Math.min(rect.bottom+4,root.innerHeight-height-8))+'px';
      p.trigger.setAttribute('aria-expanded','true');p.trigger.focus();var choices=Array.from(p.list.querySelectorAll('[role=option]'));active(p,Math.max(0,choices.findIndex(function(n){return n.getAttribute('aria-selected')==='true';})));
    }
    function choose(p,node) {if(!node)return;var value=node.dataset.d6RoleChoice;close(p);p.select.value=value;p.trigger.focus();p.select.dispatchEvent(new root.Event('change',{bubbles:true}));}
    doc.addEventListener('click',function(event){var trigger=event.target.closest('.d6-role-trigger'),choice=event.target.closest('[data-d6-role-choice]');if(trigger){var p=parts(trigger);if(!p.select.disabled){if(isOpen(p))close(p);else open(p);}}else if(choice){choose(parts(choice),choice);}});
    doc.addEventListener('keydown',function(event){var trigger=event.target.closest('.d6-role-trigger');if(!trigger)return;var p=parts(trigger),choices=Array.from(p.list.querySelectorAll('[role=option]')),index=choices.findIndex(function(n){return n.id===trigger.getAttribute('aria-activedescendant');});
      if(['ArrowDown','ArrowUp','Home','End'].includes(event.key)){event.preventDefault();if(!isOpen(p))open(p);index=choices.findIndex(function(n){return n.id===trigger.getAttribute('aria-activedescendant');});active(p,event.key==='Home'?0:event.key==='End'?choices.length-1:index+(event.key==='ArrowUp'?-1:1));}
      else if(event.key==='Escape'&&isOpen(p)){event.preventDefault();event.stopPropagation();close(p);}
      else if((event.key==='Enter'||event.key===' ')&&isOpen(p)){event.preventDefault();choose(p,choices[index]);}
      else if(event.key==='Tab')close(p);
      else if(event.key.length===1&&!event.ctrlKey&&!event.metaKey&&!event.altKey){event.preventDefault();if(!isOpen(p))open(p);var from=Math.max(0,index+1),ordered=choices.slice(from).concat(choices.slice(0,from)),found=ordered.find(function(n){return n.querySelector('span:last-child').textContent.trim().toLocaleLowerCase().startsWith(event.key.toLocaleLowerCase());});if(found)active(p,choices.indexOf(found));}
    });
    doc.addEventListener('toggle',function(event){if(!event.target.matches?.('.d6-role-choices'))return;var p=parts(event.target);if(event.newState==='closed'){p.trigger.setAttribute('aria-expanded','false');p.trigger.removeAttribute('aria-activedescendant');}},true);
    // Legacy commit handlers restore focus to the native select after rerender.
    doc.addEventListener('focusin',function(event){if(event.target.matches?.('.d6-role-native'))parts(event.target).trigger.focus();});
    root.addEventListener('resize',function(){doc.querySelectorAll('.d6-role-choices:popover-open').forEach(function(n){close(parts(n));});});
  }
  return Object.freeze({renderProfileRoles: renderProfileRoles, renderTacticRoleControl: renderTacticRoleControl, renderRoleZone: renderRoleZone, renderPitchRole: renderPitchRole});
}));
