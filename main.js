'use strict';var _regenerator=require('babel-runtime/regenerator');var _regenerator2=_interopRequireDefault(_regenerator);var _asyncToGenerator2=require('babel-runtime/helpers/asyncToGenerator');var _asyncToGenerator3=_interopRequireDefault(_asyncToGenerator2);function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{default:obj};}var Hugo=require('alfred-hugo');var CSON=require('cson-parser');var path=require('path');var fs=require('fs');var Project=require('./project');var Icons=require('./icons');var checkEnvironmentChanges=function checkEnvironmentChanges(){var clearCache=false;if(process.env.terminalApp&&Hugo.config.get('terminalApp')!==process.env.terminalApp){clearCache=true;Hugo.config.set('terminalApp',process.env.terminalApp);}if(Hugo.workflowMeta.version&&Hugo.config.get('wfVersion')!==Hugo.workflowMeta.version){clearCache=true;Hugo.config.set('wfVersion',Hugo.workflowMeta.version);}if(clearCache===true){Hugo.clearCacheSync();}};var checkIcons=function(){var _ref=(0,_asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(projects){var themePath,lastTheme,themeFile;return _regenerator2.default.wrap(function _callee$(_context){while(1){switch(_context.prev=_context.next){case 0:themePath=Hugo.alfredMeta.themeFile;lastTheme=Hugo.cache.get('lastTheme');_context.prev=2;fs.statSync(path.join(__dirname,'icons'));_context.next=11;break;case 6:_context.prev=6;_context.t0=_context['catch'](2);Hugo.cache.set('lastTheme',Hugo.alfredMeta.theme);Icons.rebuild(projects);return _context.abrupt('return');case 11:if(!(!lastTheme||lastTheme!==Hugo.alfredMeta.theme)){_context.next=15;break;}Hugo.cache.set('lastTheme',Hugo.alfredMeta.theme);Icons.rebuild(projects);return _context.abrupt('return');case 15:if(themePath){themeFile=Hugo.cacheFile(themePath,'theme');themeFile.on('change',function(){Icons.rebuild(projects);});themeFile.get();}case 16:case'end':return _context.stop();}}},_callee,undefined,[[2,6]]);}));return function checkIcons(_x){return _ref.apply(this,arguments);};}();Hugo.action('projects',function(){var homedir=process.env.HOME||'';var projectsFile=Hugo.cacheFile(path.resolve(homedir,'.atom','projects.cson'),'projects');checkEnvironmentChanges();projectsFile.on('change',function(cache,file){var projects=CSON.parse(file)||[];projects=Project.parseAll(projects);Icons.rebuild(projects,{onlyMissing:true});projects.sort(function(a,b){var nameA=a.title.toLowerCase();var nameB=b.title.toLowerCase();if(nameA<nameB){return-1;}if(nameA>nameB){return 1;}return 0;});cache.store(projects);});var projects=projectsFile.get();if(projects&&Array.isArray(projects)){if(!Icons.checkDependencies()&&Icons.usedIcons(projects).length>0){console.error(`Missing dependencies to render project icons. Please run: cd ${__dirname} && npm install`);Hugo.addItem({title:'Missing dependencies',subtitle:'Missing dependencies to render project icons. Please press enter to install.',arg:__dirname,variables:{task:'wfDependencies'},valid:true,mods:{alt:{valid:true,subtitle:'View documentation on this issue.',arg:'https://github.com/Cloudstek/alfred-hugo/blob/master/README.md'}}});}Hugo.addItems(projects);checkIcons(projects);}if(Hugo.itemCount===0){Hugo.addItem({title:'No projects found.'});}Hugo.feedback();});
//# sourceMappingURL=main.js.map
