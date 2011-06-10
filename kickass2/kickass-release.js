/*
	Copyright (c) <2011> <Erik Rothoff Andersson>
	
	This software is provided 'as-is', without any express or implied
	warranty. In no event will the authors be held liable for any damages
	arising from the use of this software.
	
	Permission is granted to anyone to use this software for any purpose,
	including commercial applications, and to alter it and redistribute it
	freely, subject to the following restrictions:
	
	1. The origin of this software must not be misrepresented; you must not
	claim that you wrote the original software. If you use this software
	in a product, an acknowledgment in the product documentation would be
	appreciated but is not required.
	
	2. Altered source versions must be plainly marked as such, and must not be
	misrepresented as being the original software.
	
	3. This notice may not be removed or altered from any source
	distribution.
*/(function() {var Class=function(_1){
var _2=function(){
if(_1&&typeof _1.initialize=="function"){
return _1.initialize.apply(this,arguments);
}
};
for(var _3 in _1){
if(_1.hasOwnProperty(_3)){
_2.prototype[_3]=_1[_3];
}
}
return _2;
};

var Vector=new Class({initialize:function(x,y){
if(typeof x=="Object"){
this.x=x.x;
this.y=x.y;
}else{
this.x=x;
this.y=y;
}
},cp:function(){
return new Vector(this.x,this.y);
},mul:function(_1){
this.x*=_1;
this.y*=_1;
return this;
},mulNew:function(_2){
return new Vector(this.x*_2,this.y*_2);
},add:function(_3){
this.x+=_3.x;
this.y+=_3.y;
return this;
},addNew:function(_4){
return new Vector(this.x+_4.x,this.y+_4.y);
},sub:function(_5){
this.x-=_5.x;
this.y-=_5.y;
return this;
},subNew:function(_6){
return new Vector(this.x-_6.x,this.y-_6.y);
},rotate:function(_7){
var x=this.x,y=this.y;
this.x=x*Math.cos(_7)-Math.sin(_7)*y;
this.y=x*Math.sin(_7)+Math.cos(_7)*y;
return this;
},rotateNew:function(_8){
return this.cp().rotate(_8);
},setAngle:function(_9){
var l=this.len();
this.x=Math.cos(_9)*l;
this.y=Math.sin(_9)*l;
return this;
},setAngleNew:function(_a){
return this.cp().setAngle(_a);
},setLength:function(_b){
var l=this.len();
if(l){
this.mul(_b/l);
}else{
this.x=this.y=_b;
}
return this;
},setLengthNew:function(_c){
return this.cp().setLength(_c);
},normalize:function(){
var l=this.len();
if(l==0){
return this;
}
this.x/=l;
this.y/=l;
return this;
},normalizeNew:function(){
return this.cp().normalize();
},angle:function(){
return Math.atan2(this.y,this.x);
},collidesWith:function(_d){
return this.x>_d.x&&this.y>_d.y&&this.x<_d.x+_d.width&&this.y<_d.y+_d.height;
},len:function(){
var l=Math.sqrt(this.x*this.x+this.y*this.y);
if(l<0.005&&l>-0.005){
return 0;
}
return l;
},is:function(_e){
return typeof _e=="object"&&this.x==_e.x&&this.y==_e.y;
},dot:function(v2){
return this.x*v2.x+this.y*v2.y;
},inTriangle:function(a,b,c){
var v0=c.subNew(a);
var v1=b.subNew(a);
var v2=p.subNew(a);
var _f=v0.dot(v0);
var _10=v0.dot(v1);
var _11=v0.dot(v2);
var _12=v1.dot(v1);
var _13=v1.dot(v2);
var _14=1/(_f*_12-_10*_10);
var u=(_12*_11-_10*_13)*_14;
var v=(_f*_13-_10*_11)*_14;
return (u>0)&&(v>0)&&(u+v<1);
},toString:function(){
return "[Vector("+this.x+", "+this.y+") angle: "+this.angle()+", length: "+this.len()+"]";
}});

var Rect=new Class({initialize:function(x,y,w,h){
this.pos=new Vector(x,y);
this.size={width:w,height:h};
},hasPoint:function(_1){
return _1.x>this.pos.x-this.size.width/2&&_1.x<this.getRight()&&_1.y>this.pos.y-this.size.height/2&&_1.y<this.getBottom();
},getRight:function(){
return this.pos.x+this.size.width/2;
},getBottom:function(){
return this.pos.y+this.size.height/2;
}});

if(!Array.prototype.indexOf){
Array.prototype.indexOf=function(_1){
if(this===void 0||this===null){
throw new TypeError();
}
var t=Object(this);
var _2=t.length>>>0;
if(_2===0){
return -1;
}
var n=0;
if(arguments.length>0){
n=Number(arguments[1]);
if(n!==n){
n=0;
}else{
if(n!==0&&n!==(1/0)&&n!==-(1/0)){
n=(n>0||-1)*Math.floor(Math.abs(n));
}
}
}
if(n>=_2){
return -1;
}
var k=n>=0?n:Math.max(_2-Math.abs(n),0);
for(;k<_2;k++){
if(k in t&&t[k]===_1){
return k;
}
}
return -1;
};
}
function now(){
return (new Date()).getTime();
};
function bind(_3,_4){
return function(){
return _4.apply(_3,arguments);
};
};
function each(_5,_6,_7){
if(typeof _5.forEach=="function"){
return _5.forEach(_6,_7);
}
for(var _8 in _5){
if(_5.hasOwnProperty(_8)){
_6.call(_7||window,_5[_8],_8);
}
}
};
function addEvent(_9,_a,fn){
if(_9.addEventListener){
_9.addEventListener(_a,fn,false);
}else{
if(_9.attachEvent){
_9["e"+_a+fn]=fn;
_9[_a+fn]=function(){
_9["e"+_a+fn](window.event);
};
_9.attachEvent("on"+_a,_9[_a+fn]);
}
}
};
function removeEvent(_b,_c,fn){
if(_b.removeEventListener){
_b.removeEventListener(_c,fn,false);
}else{
if(_b.detachEvent){
_b.detachEvent("on"+_c,_b[_c+fn]);
_b[_c+fn]=null;
_b["e"+_c+fn]=null;
}
}
};
function elementIsContainedIn(_d,_e){
if(element.contains){
return _d.contains(_e);
}
return !!(_d.compareDocumentPosition(_e)&16);
};
function code(_f){
var _10={38:"up",40:"down",37:"left",39:"right",27:"esc"};
if(_10[_f]){
return _10[_f];
}
return String.fromCharCode(_f);
};
function random(_11,to){
return Math.floor(Math.random()*(to+1)+_11);
};
function getRect(_12){
if(typeof _12.getBoundingClientRect==="function"){
var _13=_12.getBoundingClientRect();
var sx=window.pageXOffset;
var sy=window.pageYOffset;
return {width:_13.width,height:_13.height,left:_13.left+sx,top:_13.top+sy};
}
var _13={width:_12.offsetWidth,height:_12.offsetHeight,left:0,top:0};
var el=_12;
while(el){
_13.left+=el.offsetLeft;
_13.top+=el.offsetTop;
el=el.offsetParent;
}
return _13;
};
function getStyle(_14,_15){
return _14.style[_15]||document.defaultView.getComputedStyle(_14,null).getPropertyValue(_15);
};

var KickAss=new Class({initialize:function(){
this.players=[];
this.elements=[];
this.bulletManager=new BulletManager();
this.bulletManager.game=this;
this.enemyManager=new EnemyManager();
this.enemyManager.game=this;
this.explosionManager=new ExplosionManager();
this.explosionManager.game=this;
this.menuManager=new MenuManager();
this.menuManager.game=this;
this.menuManager.create();
this.lastUpdate=now();
this.keyMap={};
this.keydownEvent=bind(this,this.keydown);
this.keyupEvent=bind(this,this.keyup);
addEvent(document,"keydown",this.keydownEvent);
addEvent(document,"keyup",this.keyupEvent);
addEvent(document,"keypress",this.keydownEvent);
this.scrollPos=new Vector(0,0);
this.windowSize={width:0,height:0};
this.updateWindowInfo();
},begin:function(){
this.addPlayer();
this.loopTimer=window.setInterval(bind(this,this.loop),1000/60);
},keydown:function(e){
var c=code(e.keyCode);
this.keyMap[c]=true;
switch(c){
case "left":
case "right":
case "up":
case "down":
case "esc":
case " ":
if(e.stopPropogation){
e.stopPropogation();
}
if(e.preventDefault){
e.preventDefault();
}
e.returnValue=false;
break;
}
switch(c){
case "esc":
this.destroy();
break;
}
},keyup:function(e){
var c=code(e.keyCode);
this.keyMap[c]=false;
switch(c){
case "left":
case "right":
case "up":
case "down":
case "esc":
case " ":
if(e.stopPropogation){
e.stopPropogation();
}
if(e.preventDefault){
e.preventDefault();
}
e.returnValue=false;
break;
}
},loop:function(){
var _1=now();
var _2=(_1-this.lastUpdate)/1000;
this.updateWindowInfo();
for(var i=0,_3;_3=this.players[i];i++){
_3.update(_2);
}
this.bulletManager.update(_2);
this.enemyManager.update(_2);
this.explosionManager.update(_2);
this.lastUpdate=_1;
},addPlayer:function(){
var _4=new Player();
_4.game=this;
this.players.push(_4);
this.explosionManager.addExplosion(_4.pos);
},registerElement:function(el){
this.elements.push(el);
},unregisterElement:function(el){
this.elements.splice(this.elements.indexOf(el),1);
},isKickAssElement:function(el){
for(var i=0,_5;_5=this.elements[i];i++){
if(el===_5||elementIsContainedIn(_5,el)){
return true;
}
}
return false;
},isKeyPressed:function(_6){
return !!this.keyMap[_6];
},updateWindowInfo:function(){
var _7=(!!window.ActiveXObject)&&document.compatMode=="BackCompat";
this.windowSize={width:document.documentElement.clientWidth,height:document.documentElement.clientHeight};
if(_7){
this.windowSize.width=document.body.clientWidth;
this.windowSize.height=document.body.clientHeight;
}
this.scrollPos.x=window.pageXOffset||document.documentElement.scrollLeft;
this.scrollPos.y=window.pageYOffset||document.documentElement.scrollTop;
},hideAll:function(){
for(var i=0,el;el=this.elements[i];i++){
el.style.visibility="hidden";
}
},showAll:function(){
for(var i=0,el;el=this.elements[i];i++){
el.style.visibility="visible";
}
},destroy:function(){
removeEvent(document,"keydown",this.keydownEvent);
removeEvent(document,"keypress",this.keydownEvent);
removeEvent(document,"keyup",this.keyupEvent);
for(var i=0,_8;_8=this.players[i];i++){
_8.destroy();
}
this.bulletManager.destroy();
this.explosionManager.destroy();
this.menuManager.destroy();
clearInterval(this.loopTimer);
}});

var MenuManager=new Class({initialize:function(){
this.numPoints=0;
},create:function(){
this.container=document.createElement("div");
this.container.className="KICKASSELEMENT";
with(this.container.style){
position="fixed";
bottom="20px";
right="20px";
font="16pt Arial";
color="black";
zIndex="1000000";
textAlign="right";
}
document.body.appendChild(this.container);
this.points=document.createElement("div");
this.points.className="KICKASSELEMENT";
this.points.style.fontSize="30pt";
this.points.innerHTML=this.numPoints;
this.container.appendChild(this.points);
this.escToQuit=document.createElement("div");
this.escToQuit.className="KICKASSELEMENT";
this.escToQuit.innerHTML="Press esc to quit";
this.container.appendChild(this.escToQuit);
this.fb=document.createElement("div");
this.fb.innerHTML="<iframe id=\"fb-box\" src=\"http://www.facebook.com/plugins/likebox.php?href=http%3A%2F%2Fwww.facebook.com%2Fpages%2FKick-Ass-Destroy-the-web%2F168200253236727&amp;width=292&amp;colorscheme=light&amp;show_faces=false&amp;stream=false&amp;header=false&amp;height=62\" scrolling=\"no\" frameborder=\"0\" style=\"border:none; overflow:hidden; width:350px; height:70px;\" allowTransparency=\"true\"></iframe>";
this.container.appendChild(this.fb);
this.game.registerElement(this.container);
this.game.registerElement(this.points);
this.game.registerElement(this.escToQuit);
this.game.registerElement(this.fb);
},addPoints:function(_1){
this.numPoints+=_1*10;
this.points.innerHTML=this.numPoints;
},destroy:function(){
this.game.unregisterElement(this.container);
this.game.unregisterElement(this.escToQuit);
this.game.unregisterElement(this.points);
this.game.unregisterElement(this.fb);
this.container.parentNode.removeChild(this.container);
}});

var PLAYERIDS=0;
var Player=new Class({initialize:function(){
this.id=PLAYERIDS++;
this.verts=[[-10,10],[15,0],[-10,-10],[-10,10]];
this.size={width:20,height:30};
this.flames={r:[],y:[]};
this.sheet=new Sheet(new Rect(100,100,50,50));
this.pos=new Vector(100,100);
this.vel=new Vector(0,0);
this.acc=new Vector(0,0);
this.dir=new Vector(1,0);
this.currentRotation=0;
this.isBroken=false;
this.lineOffsets=[];
this.deadTime=0;
this.friction=0.8;
this.terminalVelocity=2000;
this.lastPos=new Vector(0,0);
this.lastFrameUpdate=0;
this.generateFlames();
},update:function(_1){
if(this.isBroken){
if(!this.lineOffsets.length){
for(var i=0;i<(this.verts.length-1);i++){
this.lineOffsets[i]={pos:new Vector(0,0),dir:(new Vector(1,1)).setAngle(Math.PI*2*Math.random())};
}
}
for(var i=0;i<this.lineOffsets.length;i++){
this.lineOffsets[i].pos.add(this.lineOffsets[i].dir.cp().setLength(50).mul(_1));
}
this.sheet.clear();
this.sheet.setAngle(this.dir.angle());
this.sheet.setPosition(this.pos);
this.sheet.drawBrokenPlayer(this.verts,this.lineOffsets);
if(now()-this.deadTime>1000){
this.isBroken=false;
this.lineOffsets=[];
this.randomPos();
}
return;
}
if(this.game.isKeyPressed("left")||this.game.isKeyPressed("right")){
if(this.game.isKeyPressed("left")){
this.rotateLeft();
}
if(this.game.isKeyPressed("right")){
this.rotateRight();
}
}else{
this.stopRotate();
}
if(this.game.isKeyPressed("up")){
this.activateThrusters();
}else{
this.stopThrusters();
}
if(this.currentRotation){
this.dir.setAngle(this.dir.angle()+this.currentRotation*_1);
}
var _2=this.acc.mulNew(_1).sub(this.vel.mulNew(_1*this.friction));
this.vel.add(_2);
if(this.vel.len()>this.terminalVelocity){
this.vel.setLength(this.terminalVelocity);
}
this.pos.add(this.vel.mulNew(_1));
if(now()-this.lastFrameUpdate>1000/15){
this.generateFlames();
}
this.checkBounds();
if(!this.lastPos.is(this.pos)||this.currentRotation){
this.sheet.clear();
this.sheet.setAngle(this.dir.angle());
this.sheet.setPosition(this.pos);
if(!this.acc.is({x:0,y:0})){
this.sheet.drawFlames(this.flames);
}
this.sheet.drawPlayer(this.verts);
this.lastPos=this.pos.cp();
}
},randomPos:function(){
var w=this.game.windowSize.width;
var h=this.game.windowSize.height;
this.pos=new Vector(random(0,w),random(0,h));
},generateFlames:function(){
var _3=this.size.width,_4=this.size.width*0.1,_5=this.size.width*0.6,_6=_5*0.2,_7=_3/2,_8=_5/2,_9=this.size.height/4;
this.flames.r=[[-1*_9,-1*_7]];
this.flames.y=[[-1*_9,-1*_8]];
for(var x=0;x<_3;x+=_4){
this.flames.r.push([-random(2,7)-_9,x-_7]);
}
this.flames.r.push([-1*_9,_7]);
for(var x=0;x<_5;x+=_6){
this.flames.y.push([-random(2,7)-_9,x-_8]);
}
this.flames.y.push([-1*_9,_8]);
this.lastFrameUpdate=now();
},checkBounds:function(){
var w=this.game.windowSize.width;
var h=this.game.windowSize.height;
var _a=this.pos.x+this.sheet.rect.size.width/2;
var _b=this.pos.y+this.sheet.rect.size.height/2;
if(_a>w){
window.scrollTo(this.game.scrollPos.x+50,this.game.scrollPos.y);
this.pos.x=0;
}else{
if(this.pos.x<0){
window.scrollTo(this.game.scrollPos.x-50,this.game.scrollPos.y);
this.pos.x=w-this.sheet.rect.size.width/2;
}
}
if(_b>h){
window.scrollTo(this.game.scrollPos.x,this.game.scrollPos.y+h*0.75);
this.pos.y=0;
}else{
if(this.pos.y<0){
window.scrollTo(this.game.scrollPos.x,this.game.scrollPos.y-h*0.75);
this.pos.y=h-this.sheet.rect.size.height/2;
}
}
},inRect:function(_c){
var _d=false;
for(var i=0,_e;_e=this.verts[i];i++){
if(_c.hasPoint(new Vector(_e[0]+this.pos.x,_e[1]+this.pos.y))){
_d=true;
}
}
return _d;
},hit:function(by){
if(this.isBroken){
return;
}
this.isBroken=true;
this.deadTime=now();
},activateThrusters:function(){
this.acc=(new Vector(500,0)).setAngle(this.dir.angle());
},stopThrusters:function(){
this.acc=new Vector(0,0);
},rotateLeft:function(){
this.currentRotation=-Math.PI*2;
},rotateRight:function(){
this.currentRotation=Math.PI*2;
},stopRotate:function(){
this.currentRotation=0;
},destroy:function(){
this.sheet.destroy();
}});

var BulletManager=new Class({initialize:function(){
this.bullets={};
this.lastFired=0;
this.lastBlink=0;
this.blinkActive=false;
this.enemyIndex=[];
},update:function(_1){
if(this.game.isKeyPressed(" ")&&now()-this.lastFired>100){
for(var i=0,_2;_2=this.game.players[i];i++){
if(!_2.isBroken){
this.addBulletFromPlayer(_2);
}
}
this.lastFired=now();
}
if(this.game.isKeyPressed("B")){
this.blink();
}else{
this.endBlink();
}
for(var _3 in this.bullets){
if(this.bullets.hasOwnProperty(_3)){
var _4=now();
for(var i=0,_5;_5=this.bullets[_3][i];i++){
if(_4-_5.bornAt>2000){
_5.destroy();
this.bullets[_3].splice(i,1);
}
}
for(var i=0,_5;_5=this.bullets[_3][i];i++){
_5.update(_1);
this.game.hideAll();
var _6=_5.checkCollision();
if(_6){
if(this.game.enemyManager.enemies.length<=10){
this.game.explosionManager.addExplosion(_5.pos);
this.game.menuManager.addPoints(_6.getElementsByTagName("*").length+1);
if(!_6.isShot){
this.game.enemyManager.addEnemyFromElement(_6);
}else{
this.game.enemyManager.shotEnemy(_6);
}
_5.destroy();
this.bullets[_3].splice(i,1);
}else{
if(_6.isShot){
this.game.explosionManager.addExplosion(_5.pos);
this.game.enemyManager.shotEnemy(_6);
_5.destroy();
this.bullets[_3].splice(i,1);
}
}
}
this.game.showAll();
}
}
}
},blink:function(){
if(now()-this.lastBlink>250){
for(var i=0,el;el=this.enemyIndex[i];i++){
if(!this.blinkActive){
el.style.outline="1px solid red";
}else{
el.style.outline=el.KICKASSOLDBORDER;
}
}
this.blinkActive=!this.blinkActive;
this.lastBlink=now();
if(!this.blinkActive){
this.updateEnemyIndex();
}
}
},endBlink:function(){
if(this.enemyIndex.length){
for(var i=0,el;el=this.enemyIndex[i];i++){
el.style.outline=el.KICKASSOLDBORDER;
}
this.enemyIndex=[];
this.lastBlink=0;
this.blinkActive=false;
}
},updateEnemyIndex:function(){
var _7=document.getElementsByTagName("*");
this.enemyIndex=[];
for(var i=0,el;el=_7[i];i++){
if(this.hasOnlyTextualChildren(el)){
this.enemyIndex.push(el);
el.KICKASSOLDBORDER=el.style.outline||(document.defaultView.getComputedStyle(el,null).outline);
}
}
},addBulletFromPlayer:function(_8){
var _9=_8.id;
if(this.bullets[_9]&&this.bullets[_9].length>10){
this.bullets[_9][0].destroy();
this.bullets[_9].shift();
}
var _a=new Bullet();
_a.manager=this;
_a.pos=_8.pos.cp();
_a.dir=_8.dir.cp();
_a.game=this.game;
_a.vel.add(_a.vel.cp().setLength(_8.vel.len()));
if(!this.bullets[_9]){
this.bullets[_9]=[];
}
this.bullets[_9].push(_a);
},hasOnlyTextualChildren:function(_b){
if(_b==document.defaultView||_b==document.body){
return false;
}
if(_b.className&&_b.className.indexOf("KICKASSELEMENT")!=-1){
return false;
}
for(var i=0;i<_b.childNodes.length;i++){
if(_b.childNodes[i].childNodes[0]){
var _c=_b.childNodes;
for(var i=0,_d;_d=_c[i];i++){
if(_d.nodeType!=1||_d.style.visibility=="hidden"||_d.style.display=="none"){
continue;
}
if(_d.offsetHeight==0||_d.offsetWidth==0){
continue;
}
if(ELEMENTSTHATCOUNTASTEXTUAL.indexOf(_d.tagName)==-1&&ELEMENTSTHATARENOTTOBEINCLUDED.indexOf(_d.tagName)==-1){
return false;
}
}
}
}
return true;
},destroy:function(){
for(var _e in this.bullets){
if(this.bullets.hasOwnProperty(_e)){
for(var i=0,_f;_f=this.bullets[_e][i];i++){
_f.destroy();
}
}
}
this.bullets={};
}});

var ELEMENTSTHATCOUNTASTEXTUAL=["BR","SELECT","LEGEND"];
var ELEMENTSTHATARENOTTOBEINCLUDED=["BR","SCRIPT","STYLE","TITLE","META","HEAD","OPTION","OPTGROUP"];
var Bullet=new Class({initialize:function(){
this.pos=new Vector(100,100);
this.dir=new Vector(1,1);
this.vel=new Vector(500,500);
this.bornAt=now();
this.sheet=new Sheet(new Rect(this.pos.x,this.pos.y,5,5));
this.sheet.drawBullet();
},update:function(_1){
this.pos.add(this.vel.setAngle(this.dir.angle()).mulNew(_1));
this.checkBounds();
this.sheet.setPosition(this.pos);
},checkCollision:function(){
var _2=document.elementFromPoint(this.pos.x,this.pos.y);
if(_2&&_2.nodeType==3){
_2=_2.parentNode;
}
return _2&&_2!=document.documentElement&&this.manager.hasOnlyTextualChildren(_2)?_2:false;
},checkBounds:function(){
var w=this.game.windowSize.width;
var h=this.game.windowSize.height;
var _3=this.pos.x+this.sheet.rect.size.width/2;
var _4=this.pos.y+this.sheet.rect.size.height/2;
if(_3>w){
this.pos.x=0;
}else{
if(this.pos.x<0){
this.pos.x=w-this.sheet.rect.size.width/2;
}
}
if(_4>h){
this.pos.y=0;
}else{
if(this.pos.y<0){
this.pos.y=h-this.sheet.rect.size.height/2;
}
}
},destroy:function(){
this.sheet.destroy();
}});

var ENEMYEID=0;
var EnemyManager=new Class({initialize:function(){
this.enemies=[];
this.enemyMap={};
},update:function(_1){
for(var i=0,_2;_2=this.enemies[i];i++){
if(_2.isDead){
delete this.enemyMap[_2.element.ENEMYEID];
_2.destroy();
this.enemies.splice(i,1);
continue;
}
_2.update(_1);
if(_2.isActive){
for(var j=0,_3;_3=this.game.players[j];j++){
var _4=_2.getRect();
_4.pos.sub(this.game.scrollPos);
if(_3.inRect(_4)){
_3.hit(_2);
}
}
}
}
},addEnemyFromElement:function(_5){
_5.ENEMYEID=ENEMYEID++;
var _6=new Enemy(_5);
_6.game=this.game;
this.enemies.push(_6);
this.enemyMap[_5.ENEMYEID]=_6;
},shotEnemy:function(_7){
var _8=this.enemyMap[_7.ENEMYEID];
if(!_8){
return;
}
_8.wasShot();
}});

ENEMYFACELEMENT=new Image();
ENEMYFACELEMENT.src="http://i.imgur.com/ZtyvZ.png";
var Enemy=new Class({initialize:function(_1){
this.element=_1;
this.pos=new Vector(0,0);
this.vel=(new Vector(75,75)).mul(Math.sin(Math.PI*2*Math.random()));
this.lives=getStyle(_1,"opacity");
this.isDead=false;
this.isAI=random(0,7)==3;
var _2=getRect(_1);
_1.style.width=_2.width+"px";
_1.style.height=_2.height+"px";
document.body.appendChild(_1);
if(_2.width<10){
_2.width=50;
_1.style.width=_2.width+"px";
}
if(_2.height<10){
_2.height=50;
_1.style.height=_2.height+"px";
}
this.rect=new Rect(_2.left,_2.top,_2.width,_2.height);
this.pos=this.rect.pos.cp();
this.element.isShot=true;
_1.style.position="absolute";
_1.style.left=this.rect.pos.x+"px";
_1.style.top=this.rect.pos.y+"px";
_1.style.margin="0";
_1.style.outline="1px dotted black";
_1.style.zIndex="10000";
this.rect.size={width:_2.width,height:_2.height};
this.isActive=false;
this.blinkTheta=0;
if(this.isAI){
this.prepareFace();
}
},prepareFace:function(){
this.face=new Sheet(new Rect(this.rect.pos.x+this.rect.size.width/2,this.rect.pos.y+this.rect.size.height/2,this.rect.size.width,this.rect.size.height));
this.face.drawFace(ENEMYFACELEMENT);
},wasShot:function(){
this.lives-=0.2;
if(this.lives<=0.25){
this.isDead=true;
return;
}
this.element.style.opacity=this.lives;
},update:function(_3){
if(this.isDead){
return;
}
this.pos.add(this.vel.mulNew(_3));
if(this.isAI){
this.face.setPosition(this.pos.cp().add(new Vector(this.rect.size.width/2,this.rect.size.height/2)));
}
if(!this.isActive){
this.blinkTheta+=_3;
this.element.style.opacity=Math.cos(this.blinkTheta*10)*0.25+0.75;
if(this.blinkTheta>2&&this.element.style.opacity>0.98){
this.isActive=true;
this.element.style.opacity=1;
}
}
this.checkBounds();
this.element.style.left=this.pos.x+"px";
this.element.style.top=this.pos.y+"px";
},checkBounds:function(){
var _4=this.pos.cp();
var _5=this.game.windowSize;
var _6=this.game.scrollPos;
if(_4.x+this.rect.size.width/2<_6.x){
this.pos.x+=_5.width-this.rect.size.width/2;
}else{
if(_4.x+this.rect.size.width>_6.x+_5.width){
this.pos.x-=_5.width-this.rect.size.width;
}
}
if(_4.y+this.rect.size.height/2<_6.y){
this.pos.y+=_5.height-this.rect.size.height/2;
}else{
if(_4.y+this.rect.size.height>_6.y+_5.height){
this.pos.y-=_5.height-this.rect.size.height;
}
}
},getRect:function(){
var _7=this.pos.cp();
return new Rect(_7.x+this.rect.size.width/2,_7.y+this.rect.size.height/2,this.rect.size.width,this.rect.size.height);
},destroy:function(){
this.element.parentNode.removeChild(this.element);
if(this.face){
this.face.destroy();
}
}});

var ExplosionManager=new Class({initialize:function(){
this.explosions=[];
},update:function(_1){
var _2=now();
for(var i=0,_3;_3=this.explosions[i];i++){
if(_2-_3.bornAt>300){
_3.destroy();
this.explosions.splice(i,1);
continue;
}
_3.update(_1);
}
},addExplosion:function(_4){
var _5=new Explosion(_4);
_5.game=this.game;
_5.checkBounds();
this.explosions.push(_5);
},destroy:function(){
for(var i=0,_6;_6=this.explosions[i];i++){
_6.destroy();
}
this.explosions=[];
}});

var Explosion=new Class({initialize:function(_1){
this.bornAt=now();
this.pos=_1.cp();
this.particleVel=new Vector(200,0);
this.generateParticles();
this.sheet=new Sheet(new Rect(_1.x,_1.y,250,250));
},update:function(_2){
var _3=this.particleVel.mulNew(_2);
this.particleVel.mul(0.95*_2);
for(var i=0,_4;_4=this.particles[i];i++){
_4.pos.add(_4.vel.mulNew(_2).mul(random(0.5,1)).setAngle(_4.dir.angle()));
}
this.sheet.clear();
this.sheet.drawExplosion(this.particles);
},generateParticles:function(){
this.particles=[];
for(var i=0,j=(typeof Raphael!="undefined")?10:40;i<j;i++){
this.particles.push({dir:(new Vector(random(0,20)-10,random(0,20)-10)).normalize(),vel:this.particleVel.cp(),pos:new Vector(0,0)});
}
},checkBounds:function(){
var _5=this.sheet.rect.getRight();
var _6=this.sheet.rect.getBottom();
var w=this.game.windowSize.width;
var h=this.game.windowSize.height;
if(_5>w){
this.pos.x-=_5-w;
}
if(_6>h){
this.pos.y-=_6-h;
}
this.sheet.setPosition(this.pos);
},destroy:function(){
this.sheet.destroy();
}});

var Sheet=new Class({initialize:function(_1){
this.rect=_1;
if(typeof Raphael!="undefined"){
this.drawer=new SheetRaphael(_1);
}else{
this.drawer=new SheetCanvas(_1);
}
},clear:function(){
this.drawer.clear();
},setPosition:function(_2){
this.rect.pos=_2.cp();
this.drawer.rect=this.rect;
this.drawer.updateCanvas();
},setAngle:function(_3){
this.drawer.setAngle(_3);
},drawPlayer:function(_4){
this.drawer.setFillColor("white");
this.drawer.setStrokeColor("black");
this.drawer.setLineWidth(1.5);
this.drawer.tracePoly(_4);
this.drawer.fillPath();
this.drawer.tracePoly(_4);
this.drawer.strokePath();
},drawBrokenPlayer:function(_5,_6){
this.drawer.setStrokeColor("black");
this.drawer.setLineWidth(1.5);
for(var i=1,_7,_8=_5[0];_7=_5[i];i++,_8=_7){
var o=_6[i-1];
this.drawer.drawLine(_8[0]+o.pos.x,_8[1]+o.pos.y,_7[0]+o.pos.x,_7[1]+o.pos.y);
}
},drawFlames:function(_9){
this.drawer.setStrokeColor("red");
this.drawer.tracePoly(_9.r);
this.drawer.strokePath();
this.drawer.setStrokeColor("yellow");
this.drawer.tracePoly(_9.y);
this.drawer.strokePath();
},drawBullet:function(){
this.drawer.setFillColor("black");
this.drawer.drawCircle(2.5);
},drawExplosion:function(_a){
for(var i=0,_b;_b=_a[i];i++){
this.drawer.setFillColor(["yellow","red"][random(0,1)]);
this.drawer.drawRect(_b.pos.x,_b.pos.y,3,3);
}
},drawFace:function(_c){
this.drawer.drawImageFull(_c);
},destroy:function(){
this.drawer.destroy();
}});

var SheetRaphael=new Class({initialize:function(_1){
this.rect=_1;
this.fillColor="black";
this.strokeColor="black";
this.lineWidth=1;
this.polyString="";
this.raphael=Raphael(this.rect.pos.x-this.rect.size.width/2,this.rect.pos.y-this.rect.size.height/2,this.rect.size.width,this.rect.size.height);
this.raphael.canvas.style.zIndex="10000";
this.raphael.canvas.className="KICKASSELEMENT";
window.KICKASSGAME.registerElement(this.raphael.canvas);
},tracePoly:function(_2){
if(!_2[0]){
return;
}
this.polyString="M"+_2[0][0]+" "+_2[0][1];
for(var i=0;i<_2.length;i++){
this.polyString+="L"+_2[i][0]+" "+_2[i][1];
}
},setAngle:function(_3){
this.angle=_3;
},updateCanvas:function(){
this.raphael.canvas.width=this.rect.size.width;
this.raphael.canvas.height=this.rect.size.height;
this.raphael.canvas.style.left=window.KICKASSGAME.scrollPos.x+(this.rect.pos.x-this.rect.size.width/2)+"px";
this.raphael.canvas.style.top=window.KICKASSGAME.scrollPos.y+(this.rect.pos.y-this.rect.size.height/2)+"px";
},drawLine:function(_4,_5,_6,_7){
this.tracePoly([[_4,_5],[_6,_7]]);
this.strokePath();
},drawCircle:function(_8,_9){
_9=_9||{x:0,y:0};
this.currentElement=this.raphael.circle(_9.x,_9.y,_8);
this.currentElement.attr("fill",this.fillColor);
},setFillColor:function(_a){
this.fillColor=_a;
},setStrokeColor:function(_b){
this.strokeColor=_b;
},setLineWidth:function(_c){
this.lineWidth=_c;
},fillPath:function(){
this.currentElement=this.raphael.path(this.polyString);
this.currentElement.translate(this.rect.size.width/2,this.rect.size.height/2);
this.currentElement.attr("fill",this.fillColor);
this.currentElement.attr("stroke",this.fillColor);
this.currentElement.rotate(Raphael.deg(this.angle),this.rect.size.width/2,this.rect.size.height/2);
},strokePath:function(){
this.currentElement=this.raphael.path(this.polyString);
this.currentElement.attr("stroke",this.strokeColor);
this.currentElement.attr("stroke-width",this.lineWidth);
this.currentElement.translate(this.rect.size.width/2,this.rect.size.height/2);
this.currentElement.rotate(Raphael.deg(this.angle),this.rect.size.width/2,this.rect.size.height/2);
},clear:function(){
this.raphael.clear();
},destroy:function(){
window.KICKASSGAME.unregisterElement(this.raphael.canvas);
this.raphael.remove();
}});

var SheetCanvas=new Class({initialize:function(_1){
this.canvas=document.createElement("canvas");
this.canvas.className="KICKASSELEMENT";
with(this.canvas.style){
position="absolute";
zIndex="1000000";
}
window.KICKASSGAME.registerElement(this.canvas);
if(this.canvas.getContext){
this.ctx=this.canvas.getContext("2d");
}
this.rect=_1;
this.angle=0;
this.updateCanvas();
(document.body).appendChild(this.canvas);
},tracePoly:function(_2){
if(!_2[0]){
return;
}
this.ctx.save();
this.ctx.translate(this.rect.size.width/2,this.rect.size.height/2);
this.ctx.rotate(this.angle);
this.ctx.beginPath();
this.ctx.moveTo(_2[0][0],_2[0][1]);
for(var i=0;i<_2.length;i++){
this.ctx.lineTo(_2[i][0],_2[i][1]);
}
this.ctx.restore();
},setAngle:function(_3){
this.angle=_3;
},updateCanvas:function(){
if(this.canvas.width!=this.rect.size.width){
this.canvas.width=this.rect.size.width;
}
if(this.canvas.height!=this.rect.size.height){
this.canvas.height=this.rect.size.height;
}
this.canvas.style.left=window.KICKASSGAME.scrollPos.x+(this.rect.pos.x-this.rect.size.width/2)+"px";
this.canvas.style.top=window.KICKASSGAME.scrollPos.y+(this.rect.pos.y-this.rect.size.height/2)+"px";
},drawLine:function(_4,_5,_6,_7){
this.ctx.save();
this.ctx.translate(this.rect.size.width/2,this.rect.size.height/2);
this.ctx.beginPath();
this.ctx.moveTo(_4,_5);
this.ctx.lineTo(_6,_7);
this.ctx.closePath();
this.ctx.stroke();
this.ctx.restore();
},drawCircle:function(_8,_9){
_9=_9||{x:0,y:0};
this.ctx.save();
this.ctx.translate(this.rect.size.width/2,this.rect.size.height/2);
if(_9){
this.ctx.translate(_9.x,_9.y);
}
this.ctx.arc(0,0,_8,0,Math.PI*2,true);
this.ctx.restore();
this.ctx.fill();
},drawRect:function(x,y,w,h){
this.ctx.save();
this.ctx.translate(this.rect.size.width/2,this.rect.size.height/2);
this.ctx.translate(x,y);
this.ctx.fillRect(x,y,w,h);
this.ctx.restore();
this.ctx.fill();
},drawImageFull:function(_a){
this.ctx.drawImage(_a,0,0,this.rect.size.width,this.rect.size.height);
},setFillColor:function(_b){
this.ctx.fillStyle=_b;
},setStrokeColor:function(_c){
this.ctx.strokeStyle=_c;
},setLineWidth:function(_d){
this.ctx.lineWidth=_d;
},fillPath:function(){
this.ctx.fill();
},strokePath:function(){
this.ctx.stroke();
},clear:function(){
this.ctx.clearRect(0,0,this.rect.size.width,this.rect.size.height);
},destroy:function(){
window.KICKASSGAME.unregisterElement(this.canvas);
this.canvas.parentNode.removeChild(this.canvas);
}});

(function() {
var initKickAss = function() {
	// If an instance of KickAss is already present, we add a player
	if ( ! window.KICKASSGAME ) {
		window.KICKASSGAME = new KickAss();
		window.KICKASSGAME.begin();
	} else
		window.KICKASSGAME.addPlayer();
};

// No canvas support? Try Raphaël
if ( ! document.createElement('canvas').getContext ) {
	var script = document.createElement('script');
	script.setAttribute('type', 'text/javascript');
	script.onreadystatechange = function() {
		if ( script.readyState == 'loaded' || script.readyState == 'complete' )
			initKickAss();
	};
	script.onload = initKickAss;
	script.src = 'raphael-min.js';
	document.getElementsByTagName('head')[0].appendChild(script);
} else
	initKickAss();
})();})();