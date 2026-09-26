const fs=require("fs"),vm=require("vm");
const ctx={};vm.createContext(ctx);vm.runInContext(fs.readFileSync(require("path").join(__dirname,"../src/engine.js"),"utf8")+";globalThis.__T={checkAnswer,previewTex};",ctx);
const {checkAnswer,previewTex}=ctx.__T;
const cases=[
 // [question, input, expected status]
 [{type:"num",ans:"3/2",form:["rat"]},"6/4","ko"],[{type:"num",ans:"3/2",form:["rat"]},"1,5","ok"],[{type:"num",ans:"3/2",form:["rat"]},"3/2","ok"],[{type:"num",ans:"3/2",form:["irr"]},"1.5","ko"],
 [{type:"num",ans:"-3/4",form:["irr"]},"-3/4","ok"],[{type:"num",ans:"-3/4",form:["irr"]},"3/-4","ko"],[{type:"num",ans:"7",form:["rat"]},"x = 7","ok"],
 [{type:"expr",ans:"x^2+2x+1",form:["expanded"]},"(x+1)^2","ko"],[{type:"expr",ans:"x^2+2x+1",form:["expanded"]},"x²+2x+1","ok"],[{type:"expr",ans:"x^2+2x+1",form:["expanded"]},"2x+1+x^2","ok"],[{type:"expr",ans:"x^2+2x+1",form:["expanded"]},"x^2+x+x+1","ko"],
 [{type:"expr",ans:"(x-3)(x+3)",form:["factored"]},"(x+3)(x-3)","ok"],[{type:"expr",ans:"(x-3)(x+3)",form:["factored"]},"x^2-9","ko"],[{type:"expr",ans:"(x-3)(x+3)",form:["factored"]},"-(3-x)(x+3)","ok"],
 [{type:"expr",ans:"3x*(2x-3)",form:["factored"]},"x(6x-9)","ok"],[{type:"expr",ans:"2*(x-1)",form:["factored"]},"2(x-1)","ok"],
 [{type:"expr",ans:"3x^2",lhs:1},"f'(x)=3x²","ok"],[{type:"expr",ans:"3x^2"},"3*x^2","ok"],[{type:"expr",ans:"e^x*(x+1)",dom:[0.3,3]},"xe^x+e^x","ok"],[{type:"expr",ans:"e^x*(x+1)"},"(x+1)e^x","ok"],
 [{type:"expr",ans:"1/(2*sqrt(x))",dom:[0.3,3]},"1/(2√x)","ok"],[{type:"expr",ans:"2x/(x^2+1)"},"2x/(x^2+1)","ok"],[{type:"expr",ans:"cos(2x)*2"},"2cos(2x)","ok"],
 [{type:"set",ans:["2","-3"],form:["rat"]},"x=2 ou x=-3","ok"],[{type:"set",ans:["2","-3"]},"{-3 ; 2}","ok"],[{type:"set",ans:["2","-3"]},"2","ko"],[{type:"set",ans:[]},"∅","ok"],[{type:"set",ans:[]},"aucune solution","ok"],[{type:"set",ans:["2","-3"]},"-3, 2","ok"],
 [{type:"interval",ans:"]-2;5]"},"] -2 ; 5 ]","ok"],[{type:"interval",ans:"]-2;5]"},"]−2;5]","ok"],[{type:"interval",ans:"]-2;5]"},"[-2;5]","ko"],[{type:"interval",ans:"]-inf;3[ U ]3;+inf["},"R\\{3}","ok"],[{type:"interval",ans:"]-inf;3[ U ]3;+inf["},"ℝ-{3}","ok"],[{type:"interval",ans:"[2;+inf["},"[2;+∞[","ok"],[{type:"interval",ans:"[2;+inf["},"[2;+∞]","bad"],
 [{type:"num",ans:"3+4i",allow:["i"],form:["algebraic"]},"4i+3","ok"],[{type:"num",ans:"(1+2i)/(3-i)",allow:["i"],form:["algebraic"]},"(1+2i)/(3-i)","ko"],[{type:"num",ans:"1/2-i/2",allow:["i"],form:["algebraic"]},"0.5-0.5i","ok"],[{type:"num",ans:"30+40i",allow:["i"],form:["algebraic"]},"30+40j","ok"],
 [{type:"num",ans:"2e^(i*pi/3)",allow:["i","pi","e","sqrt"],form:["expform"]},"2e^(iπ/3)","ok"],[{type:"num",ans:"2e^(i*pi/3)",allow:["i","pi","e","sqrt","trig"],form:["expform"]},"1+i√3","ko"],[{type:"num",ans:"sqrt(2)*e^(-3i*pi/4)",allow:["i","pi","e","sqrt"],form:["expform"]},"√2e^(-3iπ/4)","ok"],
 [{type:"num",ans:"5pi/6",form:["pi"]},"5π/6","ok"],[{type:"num",ans:"5pi/6",form:["pi"]},"150π/180","ko"],[{type:"num",ans:"5pi/6",form:["pi"]},"(5/6)pi","ok"],
 [{type:"num",ans:"6*10^(-3)",form:["sci"],allow:[]},"6×10^-3","ok"],[{type:"num",ans:"6*10^(-3)",form:["sci"],allow:[]},"0.006","ko"],[{type:"num",ans:"6*10^(-3)",form:["sci"],allow:[]},"60*10^-4","ko"],
 [{type:"eqn",ans:"2x-3y+5",vars:["x","y"]},"-4x+6y-10=0","ok"],[{type:"eqn",ans:"2x-3y+5",vars:["x","y"]},"y=2/3x+5/3","ok"],[{type:"eqn",ans:"2x-3y+5",vars:["x","y"]},"2x-3y=5","ko"],
 [{type:"lim",ans:"+inf"},"+∞","ok"],[{type:"lim",ans:"+inf"},"inf","ok"],[{type:"lim",ans:"+inf"},"-inf","ko"],[{type:"lim",ans:"2/3"},"2/3","ok"],[{type:"lim",ans:"0"},"+inf","ko"],
 [{type:"expr",ans:"x^3/3",prim:1},"x^3/3 + C","ok"],[{type:"expr",ans:"x^3/3",prim:1},"x³/3+5","ok"],[{type:"expr",ans:"x^3/3",prim:1,deriv:"2x"},"2x","ko"],
 [{type:"num",ans:"sqrt(3)/2",form:["sqrt"]},"√3/2","ok"],[{type:"num",ans:"sqrt(3)/2",form:["sqrt"]},"cos(pi/6)","ko"],[{type:"num",ans:"sqrt(3)/2",form:["sqrt"]},"0.866","ko"],[{type:"num",ans:"6sqrt(2)",form:["sqrt"]},"sqrt(72)","ko"],[{type:"num",ans:"6sqrt(2)",form:["sqrt"]},"6√2","ok"],
 [{type:"num",ans:"3*ln(2)",allow:["ln"],form:["lnarg:2"]},"3ln2","ok"],[{type:"num",ans:"3*ln(2)",allow:["ln"],form:["lnarg:2"]},"ln(8)","ko"],
 [{type:"tuple",ans:["1","-2"],vars:[]},"(1;-2)","ok"],[{type:"tuple",ans:["1","-2"],vars:[]},"x=1 ; y=-2","ok"],[{type:"tuple",ans:["1","-2"],vars:[]},"(-2;1)","ko"],
 [{type:"expr",ans:"(x-2)/x",defined:[-2]},"(x²-4)/(x²+2x)","ko"],[{type:"expr",ans:"(x-2)/x",defined:[-2]},"(x-2)/x","ok"],[{type:"expr",ans:"(x-2)/x",defined:[-2]},"1-2/x","ok"],
 [{type:"expr",ans:"4*x^6",form:["mono"],dom:[0.4,1.9]},"(2x^3)^2","ko"],[{type:"expr",ans:"4*x^6",form:["mono"],dom:[0.4,1.9]},"4x^6","ok"],
 [{type:"expr",ans:"e^(x+3)",form:["singleExp"],dom:[-1,1]},"e^(x+3)","ok"],[{type:"expr",ans:"e^(x+3)",form:["singleExp"],dom:[-1,1]},"e^(2x)/e^(x-3)","ko"],
];
let bad=0; for(const [Q,inp,exp] of cases){ const r=checkAnswer(Q,inp); if(r.s!==exp){bad++; console.log("✗",JSON.stringify(Q.ans),"|",inp,"→",r.s,r.m||"","(attendu",exp+")");} }
console.log(cases.length+" cas, "+bad+" échecs");
console.log(previewTex({type:"expr"},"1/2x"), "|", previewTex({type:"expr"},"xe^x"), "|", previewTex({type:"expr"},"e^2x+1"),"|",previewTex({type:"expr"},"sin x cos x"),"|",previewTex({type:"set"},"x=2 ou x=-3"),"|",previewTex({type:"interval"},"]-inf;2] U [3;+inf["));
