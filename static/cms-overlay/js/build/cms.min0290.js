var Blog={config:{},loadMoreButton:"",loadedContentPage:1,lastPageLoaded:false,init:function(a){Blog.config=$.extend({},{loadMore:false,loadMorePath:"",loadMoreArticleTarget:"",loadMoreArticleType:"blog",loadMoreArticleLimit:""},a);Blog.initEvents();},initEvents:function(){$("#blog a.lightbox").on("click",function(){var a=$(this).attr("href");Lightbox.loadImage([{src:a}]);return false;});Core.bindTrackEvent("a.featured-news-link");if(Blog.config.loadMore){Blog.loadMoreButton=$("#load-more");Blog.loadMoreButton.on("click",function(){if(!Blog.lastPageLoaded){$(this).addClass("loading");Blog.loadMoreArticles(Blog.config.loadMorePath,Blog.config.loadMoreArticleTarget,Blog.config.loadMoreArticleType,Blog.loadedContentPage+1);}});}},loadMoreArticles:function(d,a,b,c){$.ajax({url:d,type:"GET",dataType:"html",cache:true,global:false,data:{page:c,articleType:b},success:function(f){if($.trim(f)!==""){Blog.loadedContentPage++;$(a).append(f);if(Blog.config.loadMoreArticleLimit){var e=$(f).data("article-count");if(!e||e<Blog.config.loadMoreArticleLimit){Blog.lastPageLoaded=true;Blog.loadMoreButton.fadeOut();}}}else{Blog.lastPageLoaded=true;Blog.loadMoreButton.fadeOut();}},error:function(){Blog.loadMoreButton.addClass("disabled");},complete:function(){Blog.loadMoreButton.removeClass("loading");}});}};var Comments={key:null,sig:null,count:0,wrapper:null,replyForm:null,replyInput:null,replyId:null,collection:null,throttleTimer:null,defaultCommentSort:"best",commentSortCookie:"discussion.sort",initialize:function(b,d){var e=$("#comments"),c=$(document);Comments.key=b;Comments.sig=d;Comments.wrapper=e;if(e.length&&b&&d){var a=Cookie.read(Comments.commentSortCookie);Comments.loadBase(1,null,a);}c.delegate("#comments a.body-read","click",Comments.moreLess);c.delegate("#comments .ui-pagination a","click",Comments.loadPage);c.delegate("#comments .ui-pagination .page-next","click",Comments.loadPage);c.delegate("#comments .ui-pagination .page-prev","click",Comments.loadPage);c.delegate("#comments #comments-sorting-tabs .menu-best a","click",function(f){f.preventDefault();if(!$(this).hasClass("tab-active")){Comments.switchSortOrder("best");}});c.delegate("#comments #comments-sorting-tabs .menu-latest a","click",function(f){f.preventDefault();if(!$(this).hasClass("tab-active")){Comments.switchSortOrder("latest");}});if(Core.isIE(6)){c.delegate("#comments .comments-list li",{mouseover:function(){$(this).addClass("tile-hover");},mouseout:function(){$(this).removeClass("tile-hover");}});}},switchSortOrder:function(a){Cookie.create(Comments.commentSortCookie,a,{expires:8760,path:"/"});Comments.loadBase(1,null,a);},add:function(c,g,h){c=$(c);c.addClass("disabled").attr("disabled","disabled");var e=c.parentsUntil("form").parent(),d=e.find("textarea"),b=e.find(".comments-error-form");b.find("li").hide();if(Comments.validate(e)){var a=new Date();a=a.getTime();var f={detail:$.trim(d.val()),sig:Comments.sig,xstoken:Cookie.read("xstoken"),base:false,nocache:a};if(g&&Comments.collection){f.replyCommentId=Comments.replyId;}$.ajax({url:Core.baseUrl+"/discussion/"+Comments.key+"/comment.json",type:"POST",data:f,dataType:"json",success:function(i){d.val("");c.removeClass("disabled").removeAttr("disabled");Comments.cancelReply();if(i.commentId){if(!g){Comments.loadBase(1,h,"latest");}else{Comments.loadBase(1,h);}}else{Comments.showErrors(b,i.errors||["throttled"]);c.removeClass("disabled").removeAttr("disabled");}},error:function(i){Comments.showErrors(b,["unknown"]);c.removeClass("disabled").removeAttr("disabled");}});}else{Comments.showErrors(b,["required"]);c.removeClass("disabled").removeAttr("disabled");}return false;},decrement:function(){var b=$("#comments-total"),a=parseInt(b.text());b.text(a-1);},increment:function(){var b=$("#comments-total"),a=parseInt(b.text());b.text(a+1);},reply:function(a,d,b){if(Comments.throttleTimer!==null){return;}var c=$("#post-"+a);if(a===Comments.replyId){c.next().toggle();return;}Comments.cancelReply();Comments.collection=d;Comments.replyId=a;$("#comments li.nested-reply").remove();$("<li/>").addClass("nested-reply").append(Comments.replyForm).insertAfter(c);Comments.replyInput.focus().val("@"+b+": ");},cancelReply:function(){Comments.replyId=null;Comments.collection=null;Comments.replyForm.detach();Comments.replyInput.val("");return false;},toggleDelete:function(a){$("#post-"+a).find(".comment-foot").toggle().toggleClass("visible");},remove:function(b){var a=new Date();a=a.getTime();$.ajax({url:Core.baseUrl+"/discussion/comment/"+b+"/delete.json",type:"POST",data:{sig:Comments.sig,xstoken:Cookie.read("xstoken"),nocache:a},dataType:"json",success:function(c){if(c.success){Marketing.trackActivity("Comments","Delete Comment");$("#post-"+b).fadeOut("normal",function(){$(this).remove();Comments.decrement();});}}});},loadBase:function(c,d,b){var a=new Date();a=a.getTime();c=c||1;b=b||Core.getHash()||Cookie.read("discussion.sort")||Comments.defaultCommentSort;$.ajax({url:Core.baseUrl+"/discussion/"+Comments.key+"/load.json",type:"GET",data:{page:c,base:true,sig:Comments.sig,xstoken:Cookie.read("xstoken"),nocache:a,view:b},dataType:"html",success:function(e){var f=$(e),g=Comments.wrapper;f.insertBefore(g);g.remove();Comments.wrapper=f;Comments.replyForm=$("#comments-reply-form").detach().show();Comments.replyInput=Comments.replyForm.find("textarea");ReportPost.initialize(f,"comments");if(Core.isCallback(d)){d();}},error:function(e){Comments.wrapper.addClass("comments-error").find(".subheader-2").toggleClass("hide");}});},loadPage:function(h){h.preventDefault();h.stopPropagation();var b=new Date();b=b.getTime();var c=Core.getHash()||Cookie.read("discussion.sort")||Comments.defaultCommentSort;var d=$(h.currentTarget),g=parseInt(d.text())||parseInt(d.data("pagenum"))||1,f=$("#comments-"+g),a=Comments.wrapper.find(".comments-pages");$.ajax({url:Core.baseUrl+"/discussion/"+Comments.key+"/load.json",type:"GET",data:{page:g,sig:Comments.sig,xstoken:Cookie.read("xstoken"),base:false,nocache:b,view:c},dataType:"html",success:function(e){if(e){Marketing.trackActivity("Comments","Load Page#"+g);$("#comments-list-wrapper").html(e);ReportPost.initialize($("#comments"),"comments");}}});},purge:function(b,c){if(!confirm(c)){return false;}$(b).addClass("disabled").attr("disabled","disabled");var a=new Date();a=a.getTime();$.ajax({url:Core.baseUrl+"/discussion/"+Comments.key+"/purge.json",type:"POST",data:{sig:Comments.sig,xstoken:Cookie.read("xstoken"),nocache:a},dataType:"json",success:function(){Comments.loadBase();}});},poll:function(){var a=new Date();a=a.getTime();$.ajax({url:Core.baseUrl+"/discussion/"+Comments.key+"/poll.json",type:"GET",data:{sig:Comments.sig,xstoken:Cookie.read("xstoken"),nocache:a},dataType:"json",success:function(b){if(b.count&&b.count>Comments.count){var d=b.count-Comments.count,c=$("#comments-pull");c.find(".pull-single, .pull-multiple").hide();c.find(".pull-"+(d===1?"single":"multiple")).show().find("span").text(d);c.slideDown();}}});},lock:function(b){$(b).addClass("disabled").attr("disabled","disabled");var a=new Date();a=a.getTime();$.ajax({url:Core.baseUrl+"/discussion/"+Comments.key+"/toggleLock.json",type:"POST",data:{sig:Comments.sig,xstoken:Cookie.read("xstoken"),nocache:a},dataType:"json",success:function(){Comments.loadBase();}});},moreLess:function(c){c.stop();var a=$(this),b=a.parent();b.hide();b.siblings().show();return false;},showErrors:function(c,d){for(var b=0,a=d.length;b<a;b++){c.find(".error-"+d[b]).show();}},throttle:function(b){var a=Math.ceil(b/1000),d=$("#comments .comments-throttler"),c=$("#comments .comments-action");if(d.length&&a<=60){d.find(".throttle-time").text(60-a);d.show();c.hide();$(".reply-button").attr("data-tooltip",Msg.cms.throttleError).addClass("disabled");clearTimeout(Comments.throttleTimer);Comments.throttleTimer=setTimeout(function(){Comments.countdown(d,c);},1000);}},countdown:function(d,a){var b=parseInt(d.eq(0).find(".throttle-time").text())||60,c=b-1;clearTimeout(Comments.throttleTimer);if(c<=0){Comments.throttleTimer=null;d.hide();a.show();$(".reply-button").removeAttr("data-tooltip").removeClass("disabled");}else{d.find(".throttle-time").text(c);Comments.throttleTimer=setTimeout(function(){Comments.countdown(d,a);},1000);}},updateHistory:function(a){History.push({key:Comments.key,sig:Comments.sig,page:a},"?page="+a+"#comments");},updatePagination:function(a){Comments.wrapper.find(".ui-pagination").each(function(){$(this).find("li").removeClass("current").eq(a-1).addClass("current");});},unbury:function(a){$("#post-"+a).removeClass("comment-buried");},validate:function(a){return($.trim(a.find("textarea").val())!=="");},toggleSpam:function(a){$.ajax({url:Core.baseUrl+"/discussion/comment/"+a+"/toggleSpam",type:"POST",data:{sig:Comments.sig,xstoken:Cookie.read("xstoken")},dataType:"json",success:function(b){var c=location.pathname+"#post-"+a;location.href.replace(c);location.reload(true);},error:function(b){if(b.responseText){var c=jQuery.parseJSON(b.responseText);}Overlay.open(c.errorMessage||b.statusText);}});return true;},setHam:function(a){$.ajax({url:Core.baseUrl+"/discussion/comment/"+a+"/ham",type:"POST",data:{sig:Comments.sig,xstoken:Cookie.read("xstoken")},dataType:"json",success:function(b){var c=location.pathname+"#post-"+a;location.href.replace(c);location.reload(true);},error:function(b){if(b.responseText){var c=jQuery.parseJSON(b.responseText);}Overlay.open(c.errorMessage||b.statusText);}});return true;}};var Satchel={isSupported:false,get:function _get(a){if(Satchel.isSupported&&a){var b=localStorage.getItem(a);try{return JSON.parse(b);}catch(c){return b;}}return null;},getAll:function _getAll(e){var b=[];if(!Satchel.isSupported){return b;}for(var c=0,a=localStorage.length,d=null;c<a;c++){d=localStorage.key(c);if(e&&d.indexOf(e)!==0){continue;}b.push({key:d,value:Satchel.get(d)});}return b;},getKeys:function _getKeys(d){var e=[];if(!Satchel.isSupported){return e;}for(var b=0,a=localStorage.length,c=null;b<a;b++){c=localStorage.key(b);if(d&&c.indexOf(d)!==0){continue;}e.push(c);}return e;},hasKey:function _hasKey(a){if(Satchel.isSupported&&a){return(localStorage.getItem(a)&&true)||false;}return false;},set:function _set(a,b){if(Satchel.isSupported&&a){try{localStorage.setItem(a,JSON.stringify(b||""));}catch(c){return false;}return true;}return false;},remove:function _remove(a){if(Satchel.isSupported&&a){localStorage.removeItem(a);return true;}return false;},clear:function _clear(){if(Satchel.isSupported){localStorage.clear();return true;}return false;},size:function _size(a){if(Satchel.isSupported&&a){return Satchel.getAll(a).length;}return localStorage.length||0;}};(function(){if(window.localStorage){Satchel.isSupported=true;}})();"use strict";var Slideshow={object:null,timer:null,index:0,data:[],slides:[],playing:false,lastSlide:null,initialize:function(a,d){Slideshow.object=$(a);Slideshow.data=d;Slideshow.slides=Slideshow.object.find(".slide");Slideshow.object.find(".mask").hover(function(){Slideshow.pause();},function(){Slideshow.play();});Slideshow.object.find(".paging a").mouseleave(function(){Slideshow.object.find(".preview").empty().hide();});if(Slideshow.data.length>0&&Slideshow.data[0].id){var c=Slideshow.data[0].id;var b=Cookie.read("slideViewed");if(!b){b=[];}else{b=decodeURIComponent(b).split(",");}if($.inArray(c.toString(),b)<0){b.push(c);}if(b.length>100){b.shift();}Cookie.create("slideViewed",b.join(","),{escape:true,expires:744});}if(Slideshow.slides.length<=1){Slideshow.object.find(".controls, .paging").hide();}Slideshow.link(0);Slideshow.play();},fade:function(b){Slideshow.slides.stop(true,true).fadeOut("normal");Slideshow.slides.eq(b).fadeIn(1500);Slideshow.link(b);var a=Slideshow.object.find(".caption");a.stop(true,true).fadeOut("fast",function(){if(Slideshow.data[b]){a.html("").append('<h3><a href="'+Slideshow.data[b].url+'" class="link" data-analytics="carousel" data-analytics-panel="slot:'+Slideshow.index+" - id:"+Slideshow.data[b].id+" || "+Slideshow.data[b].title+'">'+Slideshow.data[b].title+"</a></h3>").append(Slideshow.data[b].desc).fadeIn(1500);}});Slideshow.lastSlide=b;},jump:function(a,b){if((Slideshow.lastSlide===a)||(Slideshow.slides.length<=1)){return;}Slideshow.pause();Slideshow.fade(a);Slideshow.index=a;},next:function(){var a=(Slideshow.data[Slideshow.index+1])?Slideshow.index+1:0;Slideshow.jump(a);},prev:function(){var a=(Slideshow.index-1>=0)?Slideshow.index-1:Slideshow.data.length-1;Slideshow.jump(a);},link:function(a){if(Slideshow.data[a]){Slideshow.object.find(".mask").unbind("click.slideshow").bind("click.slideshow",function(){window.dataLayer.push({"analytics.eventPanel":"slot:"+Slideshow.index+" - id:"+Slideshow.data[a].id+" || "+Slideshow.data[a].title,event:"carouselClick"});Core.goTo(Slideshow.data[a].url);}).end().find(".link").attr("href",Slideshow.data[a].url).end();}},play:function(){if(Slideshow.slides.length<=1){return;}if(!Slideshow.playing){Slideshow.playing=true;Slideshow.timer=window.setTimeout(Slideshow.rotate,(Slideshow.data[Slideshow.index].duration*1000)||5000);}},pause:function(){if(Slideshow.slides.length<=1){return;}window.clearTimeout(Slideshow.timer);Slideshow.playing=false;},preview:function(a){if(Slideshow.data[a]){var b=Slideshow.object.find(".preview"),c=(a*15)+15;if(Slideshow.data[a].image){$("<img/>",{src:Slideshow.data[a].image,width:100,height:47,alt:""}).appendTo(b);}b.append("<span>"+Slideshow.data[a].title+"</span>").css("top",c);b.show();}},rotate:function(){var a=Slideshow.index+1;if(a>(Slideshow.slides.length-1)){a=0;}if(Slideshow.lastSlide===a){return;}Slideshow.pause();Slideshow.fade(a);Slideshow.index=a;Slideshow.play();Slideshow.object.find(".paging a").removeClass("current").end().find(".paging a:eq("+a+")").addClass("current");},toggle:function(){if(Slideshow.playing){Slideshow.pause();}else{Slideshow.play();}}};var cmsAdmin={$admin:"#cms-page-admin",$button:".button",$menu:".menu",toggleStateCookie:"cms.admin.ui.open",initialize:function(){this.$admin=$(this.$admin);this.$button=$(this.$button,this.$admin);this.$menu=$(this.$menu,this.$admin);this.$button.on("click",this.toggleMenu);this.$menu.on("click","h1",this.toggleMenu);},toggleMenu:function(){if(cmsAdmin.$menu.is(":visible")){cmsAdmin.$menu.hide();cmsAdmin.$button.show();cmsAdmin.saveMenuToggleState(false);}else{cmsAdmin.$menu.show();cmsAdmin.$button.hide();cmsAdmin.saveMenuToggleState(true);}},saveMenuToggleState:function(a){Cookie.create(cmsAdmin.toggleStateCookie,a,{expires:8760,path:"/"});},isMenuOpen:function(){return Cookie.read(cmsAdmin.toggleStateCookie);}};var PatchNotes={init:function(){PatchNotes.createTOC();},createTOC:function(){var a=$(".table-of-contents"),b=$(".patch-contents h3");if(!a.length){return;}if(!b.length){return a.hide();}b.each(function(){var c=$(this),e=c.clone().children().remove().end().text().trim(),d=c.attr("id")||c.parent().parent().attr("name");a.append($("<a/>",{href:"#"+d,"class":"toc-link",text:e}));});}};var Poll={init:function(){var a=parseInt($("#cms-poll").data("max-checked"));if(a!=0){$("#cms-poll input:checkbox").on("click",function(c){var b=$("#cms-poll input:checked").length;if(b>a){c.preventDefault();}});}},toggle:function(a,c,d){var b=$(a);if(b.hasClass("selected")&&c==="poll-options"){Poll.vote(d);}$("#poll-container ."+c).show().siblings("div").hide();b.addClass("selected").siblings().removeClass("selected");},vote:function(b){var a=[];$("#poll-container input:checked").each(function(){a.push(this.value);});if(a.length===0){return;}$.ajax({type:"POST",url:Core.baseUrl+"/forum/topic/poll/"+b+"/vote",data:"selection="+a.join("&selection=")+"&xstoken="+Cookie.read("xstoken"),success:function(){location.reload();}});}};var SearchPane={searchUrl:"/search/json",defaultDisplayType:"article",dataType:"jsonp",defaultResultListElementClass:"search-pane-result-list",load:function(e,d,c){var b=SearchPane.defaultDisplayType,a=$(e),f=c;if(!f){f=SearchPane.defaultRenderFunction;}if(d.type){b=d.type;}$.ajax({type:"GET",url:jsonSearchHandlerUrl+"/"+Core.language+SearchPane.searchUrl,dataType:SearchPane.dataType,async:true,cache:true,data:{q:d.query,f:d.type,a:d.author,r:d.results,k:d.keyword,community:d.community,sort:d.sortBy,dir:d.sortOrder},success:function(g){a.html(f(g,b));},error:function(g){a.text(Msg.ui.unexpectedError);}});},defaultRenderFunction:function(c,d){var g=c.results[d],b=$("<ul/>");b.attr("class",SearchPane.defaultResultListElementClass);if(!g){b=$("<div/>");b.text(Msg.search.noResults);}else{for(var e=0;e<g.length;e++){var a=$("<li/>");var f=$("<a/>");f.attr("href",g[e].url);f.text(g[e].title);a.append(f);b.append(a);}}return b;}};var Search={ta:null,map:{articlekeyword:"article",blog:"article",product:"product","static":"static",friend:"friend"},initialize:function(b,c){var a=[];if(Core.project==="wow"){a=["friend","url","wowcharacter","wowguild","wowarenateam","wowitem","article","static","other"];Search.map.character="wowcharacter";Search.map.arenateam="wowarenateam";Search.map.guild="wowguild";Search.map.wowitem="wowitem";Search.map.item="wowitem";Search.map.friend="wowcharacter";}else{a=["friend","url","product","article","static","other","kb"];}Search.ta=TypeAhead.factory(c||"#search-field",{groupResults:true,resultTypes:a,ghostQuery:(Core.region==="us"||Core.region==="eu"||Core.region==="sea"),source:function(d,e){$.ajax({url:b,data:{term:d,locale:Core.formatLocale(2,"_"),community:Core.project},cache:true,dataType:b.charAt(0)==="/"?"json":"jsonp",success:function(h){var k=[];if(h.results){for(var j=0,g;g=h.results[j];j++){var m="",f=$("<div/>").html(g.title||g.term);if(f){m=f.text();}var l={type:Search.map[g.type]||"url",title:m,desc:"",url:"",icon:""};switch(g.type){case"character":l.desc=g.realmName;l.url=Core.baseUrl+"/character/"+g.realmName.replace(/[^a-z0-9]/ig,"-").toLowerCase()+"/"+g.term+"/";break;case"arenateam":l.desc=g.realmName;l.url=Core.baseUrl+"/arena/"+g.realmName.replace(/[^a-z0-9]/ig,"-").toLowerCase()+"/"+g.teamSize+"/"+g.term+"/";break;case"guild":l.desc=g.realmName;l.url=Core.baseUrl+"/guild/"+g.realmName.replace(/[^a-z0-9]/ig,"-").toLowerCase()+"/"+g.term+"/";break;case"wowitem":case"item":l.className="color-q"+g.rarity;l.desc=Core.msg(Msg.cms.ilvl,g.level);l.url=Core.baseUrl+"/item/"+g.objectId;if(g.context){l.url+="/"+g.context;}break;case"url":case"static":case"product":l.desc=g.desc;l.icon=g.icon;l.url=g.url;break;case"friend":l.url=Core.projectUrl+g.url;l.icon=Core.projectUrl+g.icon;break;default:l.url="";if(g.url){l.url=$("<div/>").html(g.url).text();}if(l.title!==g.term){l.desc=g.term||"";}break;}k.push(l);}}e(k);}});}});}};var Sidebar={totalModules:0,totalLoaded:0,modules:[],forceLoad:true,sidebar:function(a){Sidebar.totalModules=a.length;if(a.length){for(var b=0;b<=(a.length-1);++b){Sidebar.loadModule(a[b],b);}}window.setTimeout(function(){if(Sidebar.forceLoad){Sidebar.showSidebar();}},5000);},showSidebar:function(){Sidebar.forceLoad=false;var a=$("#dynamic-sidebar-target");var c=$("#sidebar .sidebar-bot");for(var b=0;b<Sidebar.totalModules;b++){if(Sidebar.modules[b]){Sidebar.modules[b].appendTo(a);}}$("#sidebar-loading").fadeOut("normal",function(){c.find(".sidebar-module").fadeIn();$(this).remove();});Sidebar.modules=[];Sidebar.totalModules=0;Sidebar.totalLoaded=0;},loadModule:function(c,b){var a=$("#dynamic-sidebar-target");$.ajax({url:Core.baseUrl+"/sidebar/"+c.type+(c.query||""),type:"GET",dataType:"html",cache:true,global:false,success:function(e){Sidebar.totalLoaded++;if($.trim(e)!==""){var d=$(e);if(Sidebar.forceLoad){d.hide();Sidebar.modules[b]=d;}else{d.appendTo(a);}}},error:function(){Sidebar.totalLoaded++;},complete:function(){if(Sidebar.totalLoaded>=Sidebar.totalModules){window.setTimeout(Sidebar.showSidebar,100);}}});}};