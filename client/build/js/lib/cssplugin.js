/*
* CSSPlugin
* Visit http://createjs.com/ for documentation, updates and examples.
*
* Copyright (c) 2010 gskinner.com, inc.
* 
* Permission is hereby granted, free of charge, to any person
* obtaining a copy of this software and associated documentation
* files (the "Software"), to deal in the Software without
* restriction, including without limitation the rights to use,
* copy, modify, merge, publish, distribute, sublicense, and/or sell
* copies of the Software, and to permit persons to whom the
* Software is furnished to do so, subject to the following
* conditions:
* 
* The above copyright notice and this permission notice shall be
* included in all copies or substantial portions of the Software.
* 
* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
* EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
* OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
* NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
* HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
* WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
* FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
* OTHER DEALINGS IN THE SOFTWARE.
*/

this.createjs=this.createjs||{},function(){var e=function(){throw"CSSPlugin cannot be instantiated."};e.cssSuffixMap={top:"px",left:"px",bottom:"px",right:"px",width:"px",height:"px",opacity:""},e.priority=-100,e.install=function(){var t=[],n=e.cssSuffixMap;for(var r in n)t.push(r);createjs.Tween.installPlugin(e,t)},e.init=function(t,n,r){var i,s,o,u=e.cssSuffixMap;if((i=u[n])==null||!(o=t._target.style))return r;var a=o[n];if(!a)return 0;var f=a.length-i.length;if((s=a.substr(f))!=i)throw"CSSPlugin Error: Suffixes do not match. ("+i+":"+s+")";return parseInt(a.substr(0,f))},e.tween=function(t,n,r,i,s,o,u,a){var f,l=e.cssSuffixMap;return l[n]==null||!(f=t._target.style)?r:(f[n]=r+l[n],r)},createjs.CSSPlugin=e}();