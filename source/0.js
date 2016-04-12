/*
 * mp3worker
 * (based on minimp3, which is based on FFmpeg)
 *
 * https://github.com/musictheory/mp3worker/
 *
 * Copyright (c) 2001, 2002 Fabrice Bellard (FFmpeg)
 *           (c) 2007 Martin J. Fiedler (minimp3)
 *           (c) 2016 musictheory.net, LLC
 *
 * This file is based on a stripped-down version of the MPEG Audio
 * decoder from the FFmpeg libavcodec library.
 *
 * mp3worker is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 2.1 of the License, or (at your option) any later version.
 *
 * mp3worker are distributed in the hope that they will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public
 * License along with FFmpeg; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA
 */
(function(root) {

var Module;
if (!Module) Module = (typeof Module !== "undefined" ? Module : null) || {};
var moduleOverrides = {};
for (var key in Module) {
 if (Module.hasOwnProperty(key)) {
  moduleOverrides[key] = Module[key];
 }
}
var ENVIRONMENT_IS_WEB = typeof window === "object";
var ENVIRONMENT_IS_WORKER = typeof importScripts === "function";
var ENVIRONMENT_IS_NODE = typeof process === "object" && typeof require === "function" && !ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_WORKER;
var ENVIRONMENT_IS_SHELL = !ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_NODE && !ENVIRONMENT_IS_WORKER;
if (ENVIRONMENT_IS_NODE) {
 if (!Module["print"]) Module["print"] = function print(x) {
  process["stdout"].write(x + "\n");
 };
 if (!Module["printErr"]) Module["printErr"] = function printErr(x) {
  process["stderr"].write(x + "\n");
 };
 var nodeFS = require("fs");
 var nodePath = require("path");
 Module["read"] = function read(filename, binary) {
  filename = nodePath["normalize"](filename);
  var ret = nodeFS["readFileSync"](filename);
  if (!ret && filename != nodePath["resolve"](filename)) {
   filename = path.join(__dirname, "..", "src", filename);
   ret = nodeFS["readFileSync"](filename);
  }
  if (ret && !binary) ret = ret.toString();
  return ret;
 };
 Module["readBinary"] = function readBinary(filename) {
  var ret = Module["read"](filename, true);
  if (!ret.buffer) {
   ret = new Uint8Array(ret);
  }
  assert(ret.buffer);
  return ret;
 };
 Module["load"] = function load(f) {
  globalEval(read(f));
 };
 if (!Module["thisProgram"]) {
  if (process["argv"].length > 1) {
   Module["thisProgram"] = process["argv"][1].replace(/\\/g, "/");
  } else {
   Module["thisProgram"] = "unknown-program";
  }
 }
 Module["arguments"] = process["argv"].slice(2);
 if (typeof module !== "undefined") {
  module["exports"] = Module;
 }
 process["on"]("uncaughtException", (function(ex) {
  if (!(ex instanceof ExitStatus)) {
   throw ex;
  }
 }));
 Module["inspect"] = (function() {
  return "[Emscripten Module object]";
 });
} else if (ENVIRONMENT_IS_SHELL) {
 if (!Module["print"]) Module["print"] = print;
 if (typeof printErr != "undefined") Module["printErr"] = printErr;
 if (typeof read != "undefined") {
  Module["read"] = read;
 } else {
  Module["read"] = function read() {
   throw "no read() available (jsc?)";
  };
 }
 Module["readBinary"] = function readBinary(f) {
  if (typeof readbuffer === "function") {
   return new Uint8Array(readbuffer(f));
  }
  var data = read(f, "binary");
  assert(typeof data === "object");
  return data;
 };
 if (typeof scriptArgs != "undefined") {
  Module["arguments"] = scriptArgs;
 } else if (typeof arguments != "undefined") {
  Module["arguments"] = arguments;
 }
} else if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
 Module["read"] = function read(url) {
  var xhr = new XMLHttpRequest;
  xhr.open("GET", url, false);
  xhr.send(null);
  return xhr.responseText;
 };
 if (typeof arguments != "undefined") {
  Module["arguments"] = arguments;
 }
 if (typeof console !== "undefined") {
  if (!Module["print"]) Module["print"] = function print(x) {
   console.log(x);
  };
  if (!Module["printErr"]) Module["printErr"] = function printErr(x) {
   console.log(x);
  };
 } else {
  var TRY_USE_DUMP = false;
  if (!Module["print"]) Module["print"] = TRY_USE_DUMP && typeof dump !== "undefined" ? (function(x) {
   dump(x);
  }) : (function(x) {});
 }
 if (ENVIRONMENT_IS_WORKER) {
  Module["load"] = importScripts;
 }
 if (typeof Module["setWindowTitle"] === "undefined") {
  Module["setWindowTitle"] = (function(title) {
   document.title = title;
  });
 }
} else {
 throw "Unknown runtime environment. Where are we?";
}
function globalEval(x) {
 eval.call(null, x);
}
if (!Module["load"] && Module["read"]) {
 Module["load"] = function load(f) {
  globalEval(Module["read"](f));
 };
}
if (!Module["print"]) {
 Module["print"] = (function() {});
}
if (!Module["printErr"]) {
 Module["printErr"] = Module["print"];
}
if (!Module["arguments"]) {
 Module["arguments"] = [];
}
if (!Module["thisProgram"]) {
 Module["thisProgram"] = "./this.program";
}
Module.print = Module["print"];
Module.printErr = Module["printErr"];
Module["preRun"] = [];
Module["postRun"] = [];
for (var key in moduleOverrides) {
 if (moduleOverrides.hasOwnProperty(key)) {
  Module[key] = moduleOverrides[key];
 }
}
var Runtime = {
 setTempRet0: (function(value) {
  tempRet0 = value;
 }),
 getTempRet0: (function() {
  return tempRet0;
 }),
 stackSave: (function() {
  return STACKTOP;
 }),
 stackRestore: (function(stackTop) {
  STACKTOP = stackTop;
 }),
 getNativeTypeSize: (function(type) {
  switch (type) {
  case "i1":
  case "i8":
   return 1;
  case "i16":
   return 2;
  case "i32":
   return 4;
  case "i64":
   return 8;
  case "float":
   return 4;
  case "double":
   return 8;
  default:
   {
    if (type[type.length - 1] === "*") {
     return Runtime.QUANTUM_SIZE;
    } else if (type[0] === "i") {
     var bits = parseInt(type.substr(1));
     assert(bits % 8 === 0);
     return bits / 8;
    } else {
     return 0;
    }
   }
  }
 }),
 getNativeFieldSize: (function(type) {
  return Math.max(Runtime.getNativeTypeSize(type), Runtime.QUANTUM_SIZE);
 }),
 STACK_ALIGN: 16,
 prepVararg: (function(ptr, type) {
  if (type === "double" || type === "i64") {
   if (ptr & 7) {
    assert((ptr & 7) === 4);
    ptr += 4;
   }
  } else {
   assert((ptr & 3) === 0);
  }
  return ptr;
 }),
 getAlignSize: (function(type, size, vararg) {
  if (!vararg && (type == "i64" || type == "double")) return 8;
  if (!type) return Math.min(size, 8);
  return Math.min(size || (type ? Runtime.getNativeFieldSize(type) : 0), Runtime.QUANTUM_SIZE);
 }),
 dynCall: (function(sig, ptr, args) {
  if (args && args.length) {
   if (!args.splice) args = Array.prototype.slice.call(args);
   args.splice(0, 0, ptr);
   return Module["dynCall_" + sig].apply(null, args);
  } else {
   return Module["dynCall_" + sig].call(null, ptr);
  }
 }),
 functionPointers: [],
 addFunction: (function(func) {
  for (var i = 0; i < Runtime.functionPointers.length; i++) {
   if (!Runtime.functionPointers[i]) {
    Runtime.functionPointers[i] = func;
    return 2 * (1 + i);
   }
  }
  throw "Finished up all reserved function pointers. Use a higher value for RESERVED_FUNCTION_POINTERS.";
 }),
 removeFunction: (function(index) {
  Runtime.functionPointers[(index - 2) / 2] = null;
 }),
 warnOnce: (function(text) {
  if (!Runtime.warnOnce.shown) Runtime.warnOnce.shown = {};
  if (!Runtime.warnOnce.shown[text]) {
   Runtime.warnOnce.shown[text] = 1;
   Module.printErr(text);
  }
 }),
 funcWrappers: {},
 getFuncWrapper: (function(func, sig) {
  assert(sig);
  if (!Runtime.funcWrappers[sig]) {
   Runtime.funcWrappers[sig] = {};
  }
  var sigCache = Runtime.funcWrappers[sig];
  if (!sigCache[func]) {
   sigCache[func] = function dynCall_wrapper() {
    return Runtime.dynCall(sig, func, arguments);
   };
  }
  return sigCache[func];
 }),
 getCompilerSetting: (function(name) {
  throw "You must build with -s RETAIN_COMPILER_SETTINGS=1 for Runtime.getCompilerSetting or emscripten_get_compiler_setting to work";
 }),
 stackAlloc: (function(size) {
  var ret = STACKTOP;
  STACKTOP = STACKTOP + size | 0;
  STACKTOP = STACKTOP + 15 & -16;
  return ret;
 }),
 staticAlloc: (function(size) {
  var ret = STATICTOP;
  STATICTOP = STATICTOP + size | 0;
  STATICTOP = STATICTOP + 15 & -16;
  return ret;
 }),
 dynamicAlloc: (function(size) {
  var ret = DYNAMICTOP;
  DYNAMICTOP = DYNAMICTOP + size | 0;
  DYNAMICTOP = DYNAMICTOP + 15 & -16;
  if (DYNAMICTOP >= TOTAL_MEMORY) {
   var success = enlargeMemory();
   if (!success) {
    DYNAMICTOP = ret;
    return 0;
   }
  }
  return ret;
 }),
 alignMemory: (function(size, quantum) {
  var ret = size = Math.ceil(size / (quantum ? quantum : 16)) * (quantum ? quantum : 16);
  return ret;
 }),
 makeBigInt: (function(low, high, unsigned) {
  var ret = unsigned ? +(low >>> 0) + +(high >>> 0) * +4294967296 : +(low >>> 0) + +(high | 0) * +4294967296;
  return ret;
 }),
 GLOBAL_BASE: 8,
 QUANTUM_SIZE: 4,
 __dummy__: 0
};
Module["Runtime"] = Runtime;
var __THREW__ = 0;
var ABORT = false;
var EXITSTATUS = 0;
var undef = 0;
var tempValue, tempInt, tempBigInt, tempInt2, tempBigInt2, tempPair, tempBigIntI, tempBigIntR, tempBigIntS, tempBigIntP, tempBigIntD, tempDouble, tempFloat;
var tempI64, tempI64b;
var tempRet0, tempRet1, tempRet2, tempRet3, tempRet4, tempRet5, tempRet6, tempRet7, tempRet8, tempRet9;
function assert(condition, text) {
 if (!condition) {
  abort("Assertion failed: " + text);
 }
}
var globalScope = this;
function getCFunc(ident) {
 var func = Module["_" + ident];
 if (!func) {
  try {
   func = eval("_" + ident);
  } catch (e) {}
 }
 assert(func, "Cannot call unknown function " + ident + " (perhaps LLVM optimizations or closure removed it?)");
 return func;
}
var cwrap, ccall;
((function() {
 var JSfuncs = {
  "stackSave": (function() {
   Runtime.stackSave();
  }),
  "stackRestore": (function() {
   Runtime.stackRestore();
  }),
  "arrayToC": (function(arr) {
   var ret = Runtime.stackAlloc(arr.length);
   writeArrayToMemory(arr, ret);
   return ret;
  }),
  "stringToC": (function(str) {
   var ret = 0;
   if (str !== null && str !== undefined && str !== 0) {
    ret = Runtime.stackAlloc((str.length << 2) + 1);
    writeStringToMemory(str, ret);
   }
   return ret;
  })
 };
 var toC = {
  "string": JSfuncs["stringToC"],
  "array": JSfuncs["arrayToC"]
 };
 ccall = function ccallFunc(ident, returnType, argTypes, args, opts) {
  var func = getCFunc(ident);
  var cArgs = [];
  var stack = 0;
  if (args) {
   for (var i = 0; i < args.length; i++) {
    var converter = toC[argTypes[i]];
    if (converter) {
     if (stack === 0) stack = Runtime.stackSave();
     cArgs[i] = converter(args[i]);
    } else {
     cArgs[i] = args[i];
    }
   }
  }
  var ret = func.apply(null, cArgs);
  if (returnType === "string") ret = Pointer_stringify(ret);
  if (stack !== 0) {
   if (opts && opts.async) {
    EmterpreterAsync.asyncFinalizers.push((function() {
     Runtime.stackRestore(stack);
    }));
    return;
   }
   Runtime.stackRestore(stack);
  }
  return ret;
 };
 var sourceRegex = /^function\s*\(([^)]*)\)\s*{\s*([^*]*?)[\s;]*(?:return\s*(.*?)[;\s]*)?}$/;
 function parseJSFunc(jsfunc) {
  var parsed = jsfunc.toString().match(sourceRegex).slice(1);
  return {
   arguments: parsed[0],
   body: parsed[1],
   returnValue: parsed[2]
  };
 }
 var JSsource = {};
 for (var fun in JSfuncs) {
  if (JSfuncs.hasOwnProperty(fun)) {
   JSsource[fun] = parseJSFunc(JSfuncs[fun]);
  }
 }
 cwrap = function cwrap(ident, returnType, argTypes) {
  argTypes = argTypes || [];
  var cfunc = getCFunc(ident);
  var numericArgs = argTypes.every((function(type) {
   return type === "number";
  }));
  var numericRet = returnType !== "string";
  if (numericRet && numericArgs) {
   return cfunc;
  }
  var argNames = argTypes.map((function(x, i) {
   return "$" + i;
  }));
  var funcstr = "(function(" + argNames.join(",") + ") {";
  var nargs = argTypes.length;
  if (!numericArgs) {
   funcstr += "var stack = " + JSsource["stackSave"].body + ";";
   for (var i = 0; i < nargs; i++) {
    var arg = argNames[i], type = argTypes[i];
    if (type === "number") continue;
    var convertCode = JSsource[type + "ToC"];
    funcstr += "var " + convertCode.arguments + " = " + arg + ";";
    funcstr += convertCode.body + ";";
    funcstr += arg + "=" + convertCode.returnValue + ";";
   }
  }
  var cfuncname = parseJSFunc((function() {
   return cfunc;
  })).returnValue;
  funcstr += "var ret = " + cfuncname + "(" + argNames.join(",") + ");";
  if (!numericRet) {
   var strgfy = parseJSFunc((function() {
    return Pointer_stringify;
   })).returnValue;
   funcstr += "ret = " + strgfy + "(ret);";
  }
  if (!numericArgs) {
   funcstr += JSsource["stackRestore"].body.replace("()", "(stack)") + ";";
  }
  funcstr += "return ret})";
  return eval(funcstr);
 };
}))();
Module["ccall"] = ccall;
Module["cwrap"] = cwrap;
function setValue(ptr, value, type, noSafe) {
 type = type || "i8";
 if (type.charAt(type.length - 1) === "*") type = "i32";
 switch (type) {
 case "i1":
  HEAP8[ptr >> 0] = value;
  break;
 case "i8":
  HEAP8[ptr >> 0] = value;
  break;
 case "i16":
  HEAP16[ptr >> 1] = value;
  break;
 case "i32":
  HEAP32[ptr >> 2] = value;
  break;
 case "i64":
  tempI64 = [ value >>> 0, (tempDouble = value, +Math_abs(tempDouble) >= +1 ? tempDouble > +0 ? (Math_min(+Math_floor(tempDouble / +4294967296), +4294967295) | 0) >>> 0 : ~~+Math_ceil((tempDouble - +(~~tempDouble >>> 0)) / +4294967296) >>> 0 : 0) ], HEAP32[ptr >> 2] = tempI64[0], HEAP32[ptr + 4 >> 2] = tempI64[1];
  break;
 case "float":
  HEAPF32[ptr >> 2] = value;
  break;
 case "double":
  HEAPF64[ptr >> 3] = value;
  break;
 default:
  abort("invalid type for setValue: " + type);
 }
}
Module["setValue"] = setValue;
function getValue(ptr, type, noSafe) {
 type = type || "i8";
 if (type.charAt(type.length - 1) === "*") type = "i32";
 switch (type) {
 case "i1":
  return HEAP8[ptr >> 0];
 case "i8":
  return HEAP8[ptr >> 0];
 case "i16":
  return HEAP16[ptr >> 1];
 case "i32":
  return HEAP32[ptr >> 2];
 case "i64":
  return HEAP32[ptr >> 2];
 case "float":
  return HEAPF32[ptr >> 2];
 case "double":
  return HEAPF64[ptr >> 3];
 default:
  abort("invalid type for setValue: " + type);
 }
 return null;
}
Module["getValue"] = getValue;
var ALLOC_NORMAL = 0;
var ALLOC_STACK = 1;
var ALLOC_STATIC = 2;
var ALLOC_DYNAMIC = 3;
var ALLOC_NONE = 4;
Module["ALLOC_NORMAL"] = ALLOC_NORMAL;
Module["ALLOC_STACK"] = ALLOC_STACK;
Module["ALLOC_STATIC"] = ALLOC_STATIC;
Module["ALLOC_DYNAMIC"] = ALLOC_DYNAMIC;
Module["ALLOC_NONE"] = ALLOC_NONE;
function allocate(slab, types, allocator, ptr) {
 var zeroinit, size;
 if (typeof slab === "number") {
  zeroinit = true;
  size = slab;
 } else {
  zeroinit = false;
  size = slab.length;
 }
 var singleType = typeof types === "string" ? types : null;
 var ret;
 if (allocator == ALLOC_NONE) {
  ret = ptr;
 } else {
  ret = [ _malloc, Runtime.stackAlloc, Runtime.staticAlloc, Runtime.dynamicAlloc ][allocator === undefined ? ALLOC_STATIC : allocator](Math.max(size, singleType ? 1 : types.length));
 }
 if (zeroinit) {
  var ptr = ret, stop;
  assert((ret & 3) == 0);
  stop = ret + (size & ~3);
  for (; ptr < stop; ptr += 4) {
   HEAP32[ptr >> 2] = 0;
  }
  stop = ret + size;
  while (ptr < stop) {
   HEAP8[ptr++ >> 0] = 0;
  }
  return ret;
 }
 if (singleType === "i8") {
  if (slab.subarray || slab.slice) {
   HEAPU8.set(slab, ret);
  } else {
   HEAPU8.set(new Uint8Array(slab), ret);
  }
  return ret;
 }
 var i = 0, type, typeSize, previousType;
 while (i < size) {
  var curr = slab[i];
  if (typeof curr === "function") {
   curr = Runtime.getFunctionIndex(curr);
  }
  type = singleType || types[i];
  if (type === 0) {
   i++;
   continue;
  }
  if (type == "i64") type = "i32";
  setValue(ret + i, curr, type);
  if (previousType !== type) {
   typeSize = Runtime.getNativeTypeSize(type);
   previousType = type;
  }
  i += typeSize;
 }
 return ret;
}
Module["allocate"] = allocate;
function getMemory(size) {
 if (!staticSealed) return Runtime.staticAlloc(size);
 if (typeof _sbrk !== "undefined" && !_sbrk.called || !runtimeInitialized) return Runtime.dynamicAlloc(size);
 return _malloc(size);
}
Module["getMemory"] = getMemory;
function Pointer_stringify(ptr, length) {
 if (length === 0 || !ptr) return "";
 var hasUtf = 0;
 var t;
 var i = 0;
 while (1) {
  t = HEAPU8[ptr + i >> 0];
  hasUtf |= t;
  if (t == 0 && !length) break;
  i++;
  if (length && i == length) break;
 }
 if (!length) length = i;
 var ret = "";
 if (hasUtf < 128) {
  var MAX_CHUNK = 1024;
  var curr;
  while (length > 0) {
   curr = String.fromCharCode.apply(String, HEAPU8.subarray(ptr, ptr + Math.min(length, MAX_CHUNK)));
   ret = ret ? ret + curr : curr;
   ptr += MAX_CHUNK;
   length -= MAX_CHUNK;
  }
  return ret;
 }
 return Module["UTF8ToString"](ptr);
}
Module["Pointer_stringify"] = Pointer_stringify;
function AsciiToString(ptr) {
 var str = "";
 while (1) {
  var ch = HEAP8[ptr++ >> 0];
  if (!ch) return str;
  str += String.fromCharCode(ch);
 }
}
Module["AsciiToString"] = AsciiToString;
function stringToAscii(str, outPtr) {
 return writeAsciiToMemory(str, outPtr, false);
}
Module["stringToAscii"] = stringToAscii;
function UTF8ArrayToString(u8Array, idx) {
 var u0, u1, u2, u3, u4, u5;
 var str = "";
 while (1) {
  u0 = u8Array[idx++];
  if (!u0) return str;
  if (!(u0 & 128)) {
   str += String.fromCharCode(u0);
   continue;
  }
  u1 = u8Array[idx++] & 63;
  if ((u0 & 224) == 192) {
   str += String.fromCharCode((u0 & 31) << 6 | u1);
   continue;
  }
  u2 = u8Array[idx++] & 63;
  if ((u0 & 240) == 224) {
   u0 = (u0 & 15) << 12 | u1 << 6 | u2;
  } else {
   u3 = u8Array[idx++] & 63;
   if ((u0 & 248) == 240) {
    u0 = (u0 & 7) << 18 | u1 << 12 | u2 << 6 | u3;
   } else {
    u4 = u8Array[idx++] & 63;
    if ((u0 & 252) == 248) {
     u0 = (u0 & 3) << 24 | u1 << 18 | u2 << 12 | u3 << 6 | u4;
    } else {
     u5 = u8Array[idx++] & 63;
     u0 = (u0 & 1) << 30 | u1 << 24 | u2 << 18 | u3 << 12 | u4 << 6 | u5;
    }
   }
  }
  if (u0 < 65536) {
   str += String.fromCharCode(u0);
  } else {
   var ch = u0 - 65536;
   str += String.fromCharCode(55296 | ch >> 10, 56320 | ch & 1023);
  }
 }
}
Module["UTF8ArrayToString"] = UTF8ArrayToString;
function UTF8ToString(ptr) {
 return UTF8ArrayToString(HEAPU8, ptr);
}
Module["UTF8ToString"] = UTF8ToString;
function stringToUTF8Array(str, outU8Array, outIdx, maxBytesToWrite) {
 if (!(maxBytesToWrite > 0)) return 0;
 var startIdx = outIdx;
 var endIdx = outIdx + maxBytesToWrite - 1;
 for (var i = 0; i < str.length; ++i) {
  var u = str.charCodeAt(i);
  if (u >= 55296 && u <= 57343) u = 65536 + ((u & 1023) << 10) | str.charCodeAt(++i) & 1023;
  if (u <= 127) {
   if (outIdx >= endIdx) break;
   outU8Array[outIdx++] = u;
  } else if (u <= 2047) {
   if (outIdx + 1 >= endIdx) break;
   outU8Array[outIdx++] = 192 | u >> 6;
   outU8Array[outIdx++] = 128 | u & 63;
  } else if (u <= 65535) {
   if (outIdx + 2 >= endIdx) break;
   outU8Array[outIdx++] = 224 | u >> 12;
   outU8Array[outIdx++] = 128 | u >> 6 & 63;
   outU8Array[outIdx++] = 128 | u & 63;
  } else if (u <= 2097151) {
   if (outIdx + 3 >= endIdx) break;
   outU8Array[outIdx++] = 240 | u >> 18;
   outU8Array[outIdx++] = 128 | u >> 12 & 63;
   outU8Array[outIdx++] = 128 | u >> 6 & 63;
   outU8Array[outIdx++] = 128 | u & 63;
  } else if (u <= 67108863) {
   if (outIdx + 4 >= endIdx) break;
   outU8Array[outIdx++] = 248 | u >> 24;
   outU8Array[outIdx++] = 128 | u >> 18 & 63;
   outU8Array[outIdx++] = 128 | u >> 12 & 63;
   outU8Array[outIdx++] = 128 | u >> 6 & 63;
   outU8Array[outIdx++] = 128 | u & 63;
  } else {
   if (outIdx + 5 >= endIdx) break;
   outU8Array[outIdx++] = 252 | u >> 30;
   outU8Array[outIdx++] = 128 | u >> 24 & 63;
   outU8Array[outIdx++] = 128 | u >> 18 & 63;
   outU8Array[outIdx++] = 128 | u >> 12 & 63;
   outU8Array[outIdx++] = 128 | u >> 6 & 63;
   outU8Array[outIdx++] = 128 | u & 63;
  }
 }
 outU8Array[outIdx] = 0;
 return outIdx - startIdx;
}
Module["stringToUTF8Array"] = stringToUTF8Array;
function stringToUTF8(str, outPtr, maxBytesToWrite) {
 return stringToUTF8Array(str, HEAPU8, outPtr, maxBytesToWrite);
}
Module["stringToUTF8"] = stringToUTF8;
function lengthBytesUTF8(str) {
 var len = 0;
 for (var i = 0; i < str.length; ++i) {
  var u = str.charCodeAt(i);
  if (u >= 55296 && u <= 57343) u = 65536 + ((u & 1023) << 10) | str.charCodeAt(++i) & 1023;
  if (u <= 127) {
   ++len;
  } else if (u <= 2047) {
   len += 2;
  } else if (u <= 65535) {
   len += 3;
  } else if (u <= 2097151) {
   len += 4;
  } else if (u <= 67108863) {
   len += 5;
  } else {
   len += 6;
  }
 }
 return len;
}
Module["lengthBytesUTF8"] = lengthBytesUTF8;
function UTF16ToString(ptr) {
 var i = 0;
 var str = "";
 while (1) {
  var codeUnit = HEAP16[ptr + i * 2 >> 1];
  if (codeUnit == 0) return str;
  ++i;
  str += String.fromCharCode(codeUnit);
 }
}
Module["UTF16ToString"] = UTF16ToString;
function stringToUTF16(str, outPtr, maxBytesToWrite) {
 if (maxBytesToWrite === undefined) {
  maxBytesToWrite = 2147483647;
 }
 if (maxBytesToWrite < 2) return 0;
 maxBytesToWrite -= 2;
 var startPtr = outPtr;
 var numCharsToWrite = maxBytesToWrite < str.length * 2 ? maxBytesToWrite / 2 : str.length;
 for (var i = 0; i < numCharsToWrite; ++i) {
  var codeUnit = str.charCodeAt(i);
  HEAP16[outPtr >> 1] = codeUnit;
  outPtr += 2;
 }
 HEAP16[outPtr >> 1] = 0;
 return outPtr - startPtr;
}
Module["stringToUTF16"] = stringToUTF16;
function lengthBytesUTF16(str) {
 return str.length * 2;
}
Module["lengthBytesUTF16"] = lengthBytesUTF16;
function UTF32ToString(ptr) {
 var i = 0;
 var str = "";
 while (1) {
  var utf32 = HEAP32[ptr + i * 4 >> 2];
  if (utf32 == 0) return str;
  ++i;
  if (utf32 >= 65536) {
   var ch = utf32 - 65536;
   str += String.fromCharCode(55296 | ch >> 10, 56320 | ch & 1023);
  } else {
   str += String.fromCharCode(utf32);
  }
 }
}
Module["UTF32ToString"] = UTF32ToString;
function stringToUTF32(str, outPtr, maxBytesToWrite) {
 if (maxBytesToWrite === undefined) {
  maxBytesToWrite = 2147483647;
 }
 if (maxBytesToWrite < 4) return 0;
 var startPtr = outPtr;
 var endPtr = startPtr + maxBytesToWrite - 4;
 for (var i = 0; i < str.length; ++i) {
  var codeUnit = str.charCodeAt(i);
  if (codeUnit >= 55296 && codeUnit <= 57343) {
   var trailSurrogate = str.charCodeAt(++i);
   codeUnit = 65536 + ((codeUnit & 1023) << 10) | trailSurrogate & 1023;
  }
  HEAP32[outPtr >> 2] = codeUnit;
  outPtr += 4;
  if (outPtr + 4 > endPtr) break;
 }
 HEAP32[outPtr >> 2] = 0;
 return outPtr - startPtr;
}
Module["stringToUTF32"] = stringToUTF32;
function lengthBytesUTF32(str) {
 var len = 0;
 for (var i = 0; i < str.length; ++i) {
  var codeUnit = str.charCodeAt(i);
  if (codeUnit >= 55296 && codeUnit <= 57343) ++i;
  len += 4;
 }
 return len;
}
Module["lengthBytesUTF32"] = lengthBytesUTF32;
function demangle(func) {
 var hasLibcxxabi = !!Module["___cxa_demangle"];
 if (hasLibcxxabi) {
  try {
   var buf = _malloc(func.length);
   writeStringToMemory(func.substr(1), buf);
   var status = _malloc(4);
   var ret = Module["___cxa_demangle"](buf, 0, 0, status);
   if (getValue(status, "i32") === 0 && ret) {
    return Pointer_stringify(ret);
   }
  } catch (e) {} finally {
   if (buf) _free(buf);
   if (status) _free(status);
   if (ret) _free(ret);
  }
 }
 var i = 3;
 var basicTypes = {
  "v": "void",
  "b": "bool",
  "c": "char",
  "s": "short",
  "i": "int",
  "l": "long",
  "f": "float",
  "d": "double",
  "w": "wchar_t",
  "a": "signed char",
  "h": "unsigned char",
  "t": "unsigned short",
  "j": "unsigned int",
  "m": "unsigned long",
  "x": "long long",
  "y": "unsigned long long",
  "z": "..."
 };
 var subs = [];
 var first = true;
 function dump(x) {
  if (x) Module.print(x);
  Module.print(func);
  var pre = "";
  for (var a = 0; a < i; a++) pre += " ";
  Module.print(pre + "^");
 }
 function parseNested() {
  i++;
  if (func[i] === "K") i++;
  var parts = [];
  while (func[i] !== "E") {
   if (func[i] === "S") {
    i++;
    var next = func.indexOf("_", i);
    var num = func.substring(i, next) || 0;
    parts.push(subs[num] || "?");
    i = next + 1;
    continue;
   }
   if (func[i] === "C") {
    parts.push(parts[parts.length - 1]);
    i += 2;
    continue;
   }
   var size = parseInt(func.substr(i));
   var pre = size.toString().length;
   if (!size || !pre) {
    i--;
    break;
   }
   var curr = func.substr(i + pre, size);
   parts.push(curr);
   subs.push(curr);
   i += pre + size;
  }
  i++;
  return parts;
 }
 function parse(rawList, limit, allowVoid) {
  limit = limit || Infinity;
  var ret = "", list = [];
  function flushList() {
   return "(" + list.join(", ") + ")";
  }
  var name;
  if (func[i] === "N") {
   name = parseNested().join("::");
   limit--;
   if (limit === 0) return rawList ? [ name ] : name;
  } else {
   if (func[i] === "K" || first && func[i] === "L") i++;
   var size = parseInt(func.substr(i));
   if (size) {
    var pre = size.toString().length;
    name = func.substr(i + pre, size);
    i += pre + size;
   }
  }
  first = false;
  if (func[i] === "I") {
   i++;
   var iList = parse(true);
   var iRet = parse(true, 1, true);
   ret += iRet[0] + " " + name + "<" + iList.join(", ") + ">";
  } else {
   ret = name;
  }
  paramLoop : while (i < func.length && limit-- > 0) {
   var c = func[i++];
   if (c in basicTypes) {
    list.push(basicTypes[c]);
   } else {
    switch (c) {
    case "P":
     list.push(parse(true, 1, true)[0] + "*");
     break;
    case "R":
     list.push(parse(true, 1, true)[0] + "&");
     break;
    case "L":
     {
      i++;
      var end = func.indexOf("E", i);
      var size = end - i;
      list.push(func.substr(i, size));
      i += size + 2;
      break;
     }
    case "A":
     {
      var size = parseInt(func.substr(i));
      i += size.toString().length;
      if (func[i] !== "_") throw "?";
      i++;
      list.push(parse(true, 1, true)[0] + " [" + size + "]");
      break;
     }
    case "E":
     break paramLoop;
    default:
     ret += "?" + c;
     break paramLoop;
    }
   }
  }
  if (!allowVoid && list.length === 1 && list[0] === "void") list = [];
  if (rawList) {
   if (ret) {
    list.push(ret + "?");
   }
   return list;
  } else {
   return ret + flushList();
  }
 }
 var parsed = func;
 try {
  if (func == "Object._main" || func == "_main") {
   return "main()";
  }
  if (typeof func === "number") func = Pointer_stringify(func);
  if (func[0] !== "_") return func;
  if (func[1] !== "_") return func;
  if (func[2] !== "Z") return func;
  switch (func[3]) {
  case "n":
   return "operator new()";
  case "d":
   return "operator delete()";
  }
  parsed = parse();
 } catch (e) {
  parsed += "?";
 }
 if (parsed.indexOf("?") >= 0 && !hasLibcxxabi) {
  Runtime.warnOnce("warning: a problem occurred in builtin C++ name demangling; build with  -s DEMANGLE_SUPPORT=1  to link in libcxxabi demangling");
 }
 return parsed;
}
function demangleAll(text) {
 return text.replace(/__Z[\w\d_]+/g, (function(x) {
  var y = demangle(x);
  return x === y ? x : x + " [" + y + "]";
 }));
}
function jsStackTrace() {
 var err = new Error;
 if (!err.stack) {
  try {
   throw new Error(0);
  } catch (e) {
   err = e;
  }
  if (!err.stack) {
   return "(no stack trace available)";
  }
 }
 return err.stack.toString();
}
function stackTrace() {
 return demangleAll(jsStackTrace());
}
Module["stackTrace"] = stackTrace;
var PAGE_SIZE = 4096;
function alignMemoryPage(x) {
 if (x % 4096 > 0) {
  x += 4096 - x % 4096;
 }
 return x;
}
var HEAP;
var HEAP8, HEAPU8, HEAP16, HEAPU16, HEAP32, HEAPU32, HEAPF32, HEAPF64;
var STATIC_BASE = 0, STATICTOP = 0, staticSealed = false;
var STACK_BASE = 0, STACKTOP = 0, STACK_MAX = 0;
var DYNAMIC_BASE = 0, DYNAMICTOP = 0;
function enlargeMemory() {
 var OLD_TOTAL_MEMORY = TOTAL_MEMORY;
 var LIMIT = Math.pow(2, 31);
 if (DYNAMICTOP >= LIMIT) return false;
 while (TOTAL_MEMORY <= DYNAMICTOP) {
  if (TOTAL_MEMORY < LIMIT / 2) {
   TOTAL_MEMORY = alignMemoryPage(2 * TOTAL_MEMORY);
  } else {
   var last = TOTAL_MEMORY;
   TOTAL_MEMORY = alignMemoryPage((3 * TOTAL_MEMORY + LIMIT) / 4);
   if (TOTAL_MEMORY <= last) return false;
  }
 }
 TOTAL_MEMORY = Math.max(TOTAL_MEMORY, 16 * 1024 * 1024);
 if (TOTAL_MEMORY >= LIMIT) return false;
 try {
  if (ArrayBuffer.transfer) {
   buffer = ArrayBuffer.transfer(buffer, TOTAL_MEMORY);
  } else {
   var oldHEAP8 = HEAP8;
   buffer = new ArrayBuffer(TOTAL_MEMORY);
  }
 } catch (e) {
  return false;
 }
 var success = _emscripten_replace_memory(buffer);
 if (!success) return false;
 Module["buffer"] = buffer;
 Module["HEAP8"] = HEAP8 = new Int8Array(buffer);
 Module["HEAP16"] = HEAP16 = new Int16Array(buffer);
 Module["HEAP32"] = HEAP32 = new Int32Array(buffer);
 Module["HEAPU8"] = HEAPU8 = new Uint8Array(buffer);
 Module["HEAPU16"] = HEAPU16 = new Uint16Array(buffer);
 Module["HEAPU32"] = HEAPU32 = new Uint32Array(buffer);
 Module["HEAPF32"] = HEAPF32 = new Float32Array(buffer);
 Module["HEAPF64"] = HEAPF64 = new Float64Array(buffer);
 if (!ArrayBuffer.transfer) {
  HEAP8.set(oldHEAP8);
 }
 return true;
}
var byteLength;
try {
 byteLength = Function.prototype.call.bind(Object.getOwnPropertyDescriptor(ArrayBuffer.prototype, "byteLength").get);
 byteLength(new ArrayBuffer(4));
} catch (e) {
 byteLength = (function(buffer) {
  return buffer.byteLength;
 });
}
var TOTAL_STACK = Module["TOTAL_STACK"] || 5242880;
var TOTAL_MEMORY = Module["TOTAL_MEMORY"] || 16777216;
var totalMemory = 64 * 1024;
while (totalMemory < TOTAL_MEMORY || totalMemory < 2 * TOTAL_STACK) {
 if (totalMemory < 16 * 1024 * 1024) {
  totalMemory *= 2;
 } else {
  totalMemory += 16 * 1024 * 1024;
 }
}
totalMemory = Math.max(totalMemory, 16 * 1024 * 1024);
if (totalMemory !== TOTAL_MEMORY) {
 TOTAL_MEMORY = totalMemory;
}
assert(typeof Int32Array !== "undefined" && typeof Float64Array !== "undefined" && !!(new Int32Array(1))["subarray"] && !!(new Int32Array(1))["set"], "JS engine does not provide full typed array support");
var buffer;
buffer = new ArrayBuffer(TOTAL_MEMORY);
HEAP8 = new Int8Array(buffer);
HEAP16 = new Int16Array(buffer);
HEAP32 = new Int32Array(buffer);
HEAPU8 = new Uint8Array(buffer);
HEAPU16 = new Uint16Array(buffer);
HEAPU32 = new Uint32Array(buffer);
HEAPF32 = new Float32Array(buffer);
HEAPF64 = new Float64Array(buffer);
HEAP32[0] = 255;
assert(HEAPU8[0] === 255 && HEAPU8[3] === 0, "Typed arrays 2 must be run on a little-endian system");
Module["HEAP"] = HEAP;
Module["buffer"] = buffer;
Module["HEAP8"] = HEAP8;
Module["HEAP16"] = HEAP16;
Module["HEAP32"] = HEAP32;
Module["HEAPU8"] = HEAPU8;
Module["HEAPU16"] = HEAPU16;
Module["HEAPU32"] = HEAPU32;
Module["HEAPF32"] = HEAPF32;
Module["HEAPF64"] = HEAPF64;
function callRuntimeCallbacks(callbacks) {
 while (callbacks.length > 0) {
  var callback = callbacks.shift();
  if (typeof callback == "function") {
   callback();
   continue;
  }
  var func = callback.func;
  if (typeof func === "number") {
   if (callback.arg === undefined) {
    Runtime.dynCall("v", func);
   } else {
    Runtime.dynCall("vi", func, [ callback.arg ]);
   }
  } else {
   func(callback.arg === undefined ? null : callback.arg);
  }
 }
}
var __ATPRERUN__ = [];
var __ATINIT__ = [];
var __ATMAIN__ = [];
var __ATEXIT__ = [];
var __ATPOSTRUN__ = [];
var runtimeInitialized = false;
var runtimeExited = false;
function preRun() {
 if (Module["preRun"]) {
  if (typeof Module["preRun"] == "function") Module["preRun"] = [ Module["preRun"] ];
  while (Module["preRun"].length) {
   addOnPreRun(Module["preRun"].shift());
  }
 }
 callRuntimeCallbacks(__ATPRERUN__);
}
function ensureInitRuntime() {
 if (runtimeInitialized) return;
 runtimeInitialized = true;
 callRuntimeCallbacks(__ATINIT__);
}
function preMain() {
 callRuntimeCallbacks(__ATMAIN__);
}
function exitRuntime() {
 callRuntimeCallbacks(__ATEXIT__);
 runtimeExited = true;
}
function postRun() {
 if (Module["postRun"]) {
  if (typeof Module["postRun"] == "function") Module["postRun"] = [ Module["postRun"] ];
  while (Module["postRun"].length) {
   addOnPostRun(Module["postRun"].shift());
  }
 }
 callRuntimeCallbacks(__ATPOSTRUN__);
}
function addOnPreRun(cb) {
 __ATPRERUN__.unshift(cb);
}
Module["addOnPreRun"] = addOnPreRun;
function addOnInit(cb) {
 __ATINIT__.unshift(cb);
}
Module["addOnInit"] = addOnInit;
function addOnPreMain(cb) {
 __ATMAIN__.unshift(cb);
}
Module["addOnPreMain"] = addOnPreMain;
function addOnExit(cb) {
 __ATEXIT__.unshift(cb);
}
Module["addOnExit"] = addOnExit;
function addOnPostRun(cb) {
 __ATPOSTRUN__.unshift(cb);
}
Module["addOnPostRun"] = addOnPostRun;
function intArrayFromString(stringy, dontAddNull, length) {
 var len = length > 0 ? length : lengthBytesUTF8(stringy) + 1;
 var u8array = new Array(len);
 var numBytesWritten = stringToUTF8Array(stringy, u8array, 0, u8array.length);
 if (dontAddNull) u8array.length = numBytesWritten;
 return u8array;
}
Module["intArrayFromString"] = intArrayFromString;
function intArrayToString(array) {
 var ret = [];
 for (var i = 0; i < array.length; i++) {
  var chr = array[i];
  if (chr > 255) {
   chr &= 255;
  }
  ret.push(String.fromCharCode(chr));
 }
 return ret.join("");
}
Module["intArrayToString"] = intArrayToString;
function writeStringToMemory(string, buffer, dontAddNull) {
 var array = intArrayFromString(string, dontAddNull);
 var i = 0;
 while (i < array.length) {
  var chr = array[i];
  HEAP8[buffer + i >> 0] = chr;
  i = i + 1;
 }
}
Module["writeStringToMemory"] = writeStringToMemory;
function writeArrayToMemory(array, buffer) {
 for (var i = 0; i < array.length; i++) {
  HEAP8[buffer++ >> 0] = array[i];
 }
}
Module["writeArrayToMemory"] = writeArrayToMemory;
function writeAsciiToMemory(str, buffer, dontAddNull) {
 for (var i = 0; i < str.length; ++i) {
  HEAP8[buffer++ >> 0] = str.charCodeAt(i);
 }
 if (!dontAddNull) HEAP8[buffer >> 0] = 0;
}
Module["writeAsciiToMemory"] = writeAsciiToMemory;
function unSign(value, bits, ignore) {
 if (value >= 0) {
  return value;
 }
 return bits <= 32 ? 2 * Math.abs(1 << bits - 1) + value : Math.pow(2, bits) + value;
}
function reSign(value, bits, ignore) {
 if (value <= 0) {
  return value;
 }
 var half = bits <= 32 ? Math.abs(1 << bits - 1) : Math.pow(2, bits - 1);
 if (value >= half && (bits <= 32 || value > half)) {
  value = -2 * half + value;
 }
 return value;
}
if (!Math["imul"] || Math["imul"](4294967295, 5) !== -5) Math["imul"] = function imul(a, b) {
 var ah = a >>> 16;
 var al = a & 65535;
 var bh = b >>> 16;
 var bl = b & 65535;
 return al * bl + (ah * bl + al * bh << 16) | 0;
};
Math.imul = Math["imul"];
if (!Math["clz32"]) Math["clz32"] = (function(x) {
 x = x >>> 0;
 for (var i = 0; i < 32; i++) {
  if (x & 1 << 31 - i) return i;
 }
 return 32;
});
Math.clz32 = Math["clz32"];
var Math_abs = Math.abs;
var Math_cos = Math.cos;
var Math_sin = Math.sin;
var Math_tan = Math.tan;
var Math_acos = Math.acos;
var Math_asin = Math.asin;
var Math_atan = Math.atan;
var Math_atan2 = Math.atan2;
var Math_exp = Math.exp;
var Math_log = Math.log;
var Math_sqrt = Math.sqrt;
var Math_ceil = Math.ceil;
var Math_floor = Math.floor;
var Math_pow = Math.pow;
var Math_imul = Math.imul;
var Math_fround = Math.fround;
var Math_min = Math.min;
var Math_clz32 = Math.clz32;
var runDependencies = 0;
var runDependencyWatcher = null;
var dependenciesFulfilled = null;
function getUniqueRunDependency(id) {
 return id;
}
function addRunDependency(id) {
 runDependencies++;
 if (Module["monitorRunDependencies"]) {
  Module["monitorRunDependencies"](runDependencies);
 }
}
Module["addRunDependency"] = addRunDependency;
function removeRunDependency(id) {
 runDependencies--;
 if (Module["monitorRunDependencies"]) {
  Module["monitorRunDependencies"](runDependencies);
 }
 if (runDependencies == 0) {
  if (runDependencyWatcher !== null) {
   clearInterval(runDependencyWatcher);
   runDependencyWatcher = null;
  }
  if (dependenciesFulfilled) {
   var callback = dependenciesFulfilled;
   dependenciesFulfilled = null;
   callback();
  }
 }
}
Module["removeRunDependency"] = removeRunDependency;
Module["preloadedImages"] = {};
Module["preloadedAudios"] = {};
var memoryInitializer = null;
var ASM_CONSTS = [];
STATIC_BASE = 8;
STATICTOP = STATIC_BASE + 59840;
__ATINIT__.push();
allocate([ 93, 61, 127, 102, 158, 160, 230, 63, 0, 0, 0, 0, 0, 136, 57, 61, 68, 23, 117, 250, 82, 176, 230, 63, 0, 0, 0, 0, 0, 0, 216, 60, 254, 217, 11, 117, 18, 192, 230, 63, 0, 0, 0, 0, 0, 120, 40, 189, 191, 118, 212, 221, 220, 207, 230, 63, 0, 0, 0, 0, 0, 192, 30, 61, 41, 26, 101, 60, 178, 223, 230, 63, 0, 0, 0, 0, 0, 0, 216, 188, 227, 58, 89, 152, 146, 239, 230, 63, 0, 0, 0, 0, 0, 0, 188, 188, 134, 147, 81, 249, 125, 255, 230, 63, 0, 0, 0, 0, 0, 216, 47, 189, 163, 45, 244, 102, 116, 15, 231, 63, 0, 0, 0, 0, 0, 136, 44, 189, 195, 95, 236, 232, 117, 31, 231, 63, 0, 0, 0, 0, 0, 192, 19, 61, 5, 207, 234, 134, 130, 47, 231, 63, 0, 0, 0, 0, 0, 48, 56, 189, 82, 129, 165, 72, 154, 63, 231, 63, 0, 0, 0, 0, 0, 192, 0, 189, 252, 204, 215, 53, 189, 79, 231, 63, 0, 0, 0, 0, 0, 136, 47, 61, 241, 103, 66, 86, 235, 95, 231, 63, 0, 0, 0, 0, 0, 224, 3, 61, 72, 109, 171, 177, 36, 112, 231, 63, 0, 0, 0, 0, 0, 208, 39, 189, 56, 93, 222, 79, 105, 128, 231, 63, 0, 0, 0, 0, 0, 0, 221, 188, 0, 29, 172, 56, 185, 144, 231, 63, 0, 0, 0, 0, 0, 0, 227, 60, 120, 1, 235, 115, 20, 161, 231, 63, 0, 0, 0, 0, 0, 0, 237, 188, 96, 208, 118, 9, 123, 177, 231, 63, 0, 0, 0, 0, 0, 64, 32, 61, 51, 193, 48, 1, 237, 193, 231, 63, 0, 0, 0, 0, 0, 0, 160, 60, 54, 134, 255, 98, 106, 210, 231, 63, 0, 0, 0, 0, 0, 144, 38, 189, 59, 78, 207, 54, 243, 226, 231, 63, 0, 0, 0, 0, 0, 224, 2, 189, 232, 195, 145, 132, 135, 243, 231, 63, 0, 0, 0, 0, 0, 88, 36, 189, 78, 27, 62, 84, 39, 4, 232, 63, 0, 0, 0, 0, 0, 0, 51, 61, 26, 7, 209, 173, 210, 20, 232, 63, 0, 0, 0, 0, 0, 0, 15, 61, 126, 205, 76, 153, 137, 37, 232, 63, 0, 0, 0, 0, 0, 192, 33, 189, 208, 66, 185, 30, 76, 54, 232, 63, 0, 0, 0, 0, 0, 208, 41, 61, 181, 202, 35, 70, 26, 71, 232, 63, 0, 0, 0, 0, 0, 16, 71, 61, 188, 91, 159, 23, 244, 87, 232, 63, 0, 0, 0, 0, 0, 96, 34, 61, 175, 145, 68, 155, 217, 104, 232, 63, 0, 0, 0, 0, 0, 196, 50, 189, 149, 163, 49, 217, 202, 121, 232, 63, 0, 0, 0, 0, 0, 0, 35, 189, 184, 101, 138, 217, 199, 138, 232, 63, 0, 0, 0, 0, 0, 128, 42, 189, 0, 88, 120, 164, 208, 155, 232, 63, 0, 0, 0, 0, 0, 0, 237, 188, 35, 162, 42, 66, 229, 172, 232, 63, 0, 0, 0, 0, 0, 40, 51, 61, 250, 25, 214, 186, 5, 190, 232, 63, 0, 0, 0, 0, 0, 180, 66, 61, 131, 67, 181, 22, 50, 207, 232, 63, 0, 0, 0, 0, 0, 208, 46, 189, 76, 102, 8, 94, 106, 224, 232, 63, 0, 0, 0, 0, 0, 80, 32, 189, 7, 120, 21, 153, 174, 241, 232, 63, 0, 0, 0, 0, 0, 40, 40, 61, 14, 44, 40, 208, 254, 2, 233, 63, 0, 0, 0, 0, 0, 176, 28, 189, 150, 255, 145, 11, 91, 20, 233, 63, 0, 0, 0, 0, 0, 224, 5, 189, 249, 47, 170, 83, 195, 37, 233, 63, 0, 0, 0, 0, 0, 64, 245, 60, 74, 198, 205, 176, 55, 55, 233, 63, 0, 0, 0, 0, 0, 32, 23, 61, 174, 152, 95, 43, 184, 72, 233, 63, 0, 0, 0, 0, 0, 0, 9, 189, 203, 82, 200, 203, 68, 90, 233, 63, 0, 0, 0, 0, 0, 104, 37, 61, 33, 111, 118, 154, 221, 107, 233, 63, 0, 0, 0, 0, 0, 208, 54, 189, 42, 78, 222, 159, 130, 125, 233, 63, 0, 0, 0, 0, 0, 0, 1, 189, 163, 35, 122, 228, 51, 143, 233, 63, 0, 0, 0, 0, 0, 0, 45, 61, 4, 6, 202, 112, 241, 160, 233, 63, 0, 0, 0, 0, 0, 164, 56, 189, 137, 255, 83, 77, 187, 178, 233, 63, 0, 0, 0, 0, 0, 92, 53, 61, 91, 241, 163, 130, 145, 196, 233, 63, 0, 0, 0, 0, 0, 184, 38, 61, 197, 184, 75, 25, 116, 214, 233, 63, 0, 0, 0, 0, 0, 0, 236, 188, 142, 35, 227, 25, 99, 232, 233, 63, 0, 0, 0, 0, 0, 208, 23, 61, 2, 243, 7, 141, 94, 250, 233, 63, 0, 0, 0, 0, 0, 64, 22, 61, 77, 229, 93, 123, 102, 12, 234, 63, 0, 0, 0, 0, 0, 0, 245, 188, 246, 184, 142, 237, 122, 30, 234, 63, 0, 0, 0, 0, 0, 224, 9, 61, 39, 46, 74, 236, 155, 48, 234, 63, 0, 0, 0, 0, 0, 216, 42, 61, 93, 10, 70, 128, 201, 66, 234, 63, 0, 0, 0, 0, 0, 240, 26, 189, 155, 37, 62, 178, 3, 85, 234, 63, 0, 0, 0, 0, 0, 96, 11, 61, 19, 98, 244, 138, 74, 103, 234, 63, 0, 0, 0, 0, 0, 136, 56, 61, 167, 179, 48, 19, 158, 121, 234, 63, 0, 0, 0, 0, 0, 32, 17, 61, 141, 46, 193, 83, 254, 139, 234, 63, 0, 0, 0, 0, 0, 192, 6, 61, 210, 252, 121, 85, 107, 158, 234, 63, 0, 0, 0, 0, 0, 184, 41, 189, 184, 111, 53, 33, 229, 176, 234, 63, 0, 0, 0, 0, 0, 112, 43, 61, 129, 243, 211, 191, 107, 195, 234, 63, 0, 0, 0, 0, 0, 0, 217, 60, 128, 39, 60, 58, 255, 213, 234, 63, 0, 0, 0, 0, 0, 0, 228, 60, 163, 210, 90, 153, 159, 232, 234, 63, 0, 0, 0, 0, 0, 144, 44, 189, 103, 243, 34, 230, 76, 251, 234, 63, 0, 0, 0, 0, 0, 80, 22, 61, 144, 183, 141, 41, 7, 14, 235, 63, 0, 0, 0, 0, 0, 212, 47, 61, 169, 137, 154, 108, 206, 32, 235, 63, 0, 0, 0, 0, 0, 112, 18, 61, 75, 26, 79, 184, 162, 51, 235, 63, 0, 0, 0, 0, 0, 71, 77, 61, 231, 71, 183, 21, 132, 70, 235, 63, 0, 0, 0, 0, 0, 56, 56, 189, 58, 89, 229, 141, 114, 89, 235, 63, 0, 0, 0, 0, 0, 0, 152, 60, 106, 197, 241, 41, 110, 108, 235, 63, 0, 0, 0, 0, 0, 208, 10, 61, 80, 94, 251, 242, 118, 127, 235, 63, 0, 0, 0, 0, 0, 128, 222, 60, 178, 73, 39, 242, 140, 146, 235, 63, 0, 0, 0, 0, 0, 192, 4, 189, 3, 6, 161, 48, 176, 165, 235, 63, 0, 0, 0, 0, 0, 112, 13, 189, 102, 111, 154, 183, 224, 184, 235, 63, 0, 0, 0, 0, 0, 144, 13, 61, 255, 193, 75, 144, 30, 204, 235, 63, 0, 0, 0, 0, 0, 160, 2, 61, 111, 161, 243, 195, 105, 223, 235, 63, 0, 0, 0, 0, 0, 120, 31, 189, 184, 29, 215, 91, 194, 242, 235, 63, 0, 0, 0, 0, 0, 160, 16, 189, 233, 178, 65, 97, 40, 6, 236, 63, 0, 0, 0, 0, 0, 64, 17, 189, 224, 82, 133, 221, 155, 25, 236, 63, 0, 0, 0, 0, 0, 224, 11, 61, 238, 100, 250, 217, 28, 45, 236, 63, 0, 0, 0, 0, 0, 64, 9, 189, 47, 208, 255, 95, 171, 64, 236, 63, 0, 0, 0, 0, 0, 208, 14, 189, 21, 253, 250, 120, 71, 84, 236, 63, 0, 0, 0, 0, 0, 102, 57, 61, 203, 208, 87, 46, 241, 103, 236, 63, 0, 0, 0, 0, 0, 16, 26, 189, 182, 193, 136, 137, 168, 123, 236, 63, 0, 0, 0, 0, 128, 69, 88, 189, 51, 231, 6, 148, 109, 143, 236, 63, 0, 0, 0, 0, 0, 72, 26, 189, 223, 196, 81, 87, 64, 163, 236, 63, 0, 0, 0, 0, 0, 0, 203, 60, 148, 144, 239, 220, 32, 183, 236, 63, 0, 0, 0, 0, 0, 64, 1, 61, 137, 22, 109, 46, 15, 203, 236, 63, 0, 0, 0, 0, 0, 32, 240, 60, 18, 196, 93, 85, 11, 223, 236, 63, 0, 0, 0, 0, 0, 96, 243, 60, 59, 171, 91, 91, 21, 243, 236, 63, 0, 0, 0, 0, 0, 144, 6, 189, 188, 137, 7, 74, 45, 7, 237, 63, 0, 0, 0, 0, 0, 160, 9, 61, 250, 200, 8, 43, 83, 27, 237, 63, 0, 0, 0, 0, 0, 224, 21, 189, 133, 138, 13, 8, 135, 47, 237, 63, 0, 0, 0, 0, 0, 40, 29, 61, 3, 162, 202, 234, 200, 67, 237, 63, 0, 0, 0, 0, 0, 160, 1, 61, 145, 164, 251, 220, 24, 88, 237, 63, 0, 0, 0, 0, 0, 0, 223, 60, 161, 230, 98, 232, 118, 108, 237, 63, 0, 0, 0, 0, 0, 160, 3, 189, 78, 131, 201, 22, 227, 128, 237, 63, 0, 0, 0, 0, 0, 216, 12, 189, 144, 96, 255, 113, 93, 149, 237, 63, 0, 0, 0, 0, 0, 192, 244, 60, 174, 50, 219, 3, 230, 169, 237, 63, 0, 0, 0, 0, 0, 144, 255, 60, 37, 131, 58, 214, 124, 190, 237, 63, 0, 0, 0, 0, 0, 128, 233, 60, 69, 180, 1, 243, 33, 211, 237, 63, 0, 0, 0, 0, 0, 32, 245, 188, 191, 5, 28, 100, 213, 231, 237, 63, 0, 0, 0, 0, 0, 112, 29, 189, 236, 154, 123, 51, 151, 252, 237, 63, 0, 0, 0, 0, 0, 20, 22, 189, 94, 125, 25, 107, 103, 17, 238, 63, 0, 0, 0, 0, 0, 72, 11, 61, 231, 163, 245, 20, 70, 38, 238, 63, 0, 0, 0, 0, 0, 206, 64, 61, 92, 238, 22, 59, 51, 59, 238, 63, 0, 0, 0, 0, 0, 104, 12, 61, 180, 63, 139, 231, 46, 80, 238, 63, 0, 0, 0, 0, 0, 48, 9, 189, 104, 109, 103, 36, 57, 101, 238, 63, 0, 0, 0, 0, 0, 0, 229, 188, 68, 76, 199, 251, 81, 122, 238, 63, 0, 0, 0, 0, 0, 248, 7, 189, 38, 183, 205, 119, 121, 143, 238, 63, 0, 0, 0, 0, 0, 112, 243, 188, 232, 144, 164, 162, 175, 164, 238, 63, 0, 0, 0, 0, 0, 208, 229, 60, 228, 202, 124, 134, 244, 185, 238, 63, 0, 0, 0, 0, 0, 26, 22, 61, 13, 104, 142, 45, 72, 207, 238, 63, 0, 0, 0, 0, 0, 80, 245, 60, 20, 133, 24, 162, 170, 228, 238, 63, 0, 0, 0, 0, 0, 64, 198, 60, 19, 90, 97, 238, 27, 250, 238, 63, 0, 0, 0, 0, 0, 128, 238, 188, 6, 65, 182, 28, 156, 15, 239, 63, 0, 0, 0, 0, 0, 136, 250, 188, 99, 185, 107, 55, 43, 37, 239, 63, 0, 0, 0, 0, 0, 144, 44, 189, 117, 114, 221, 72, 201, 58, 239, 63, 0, 0, 0, 0, 0, 0, 170, 60, 36, 69, 110, 91, 118, 80, 239, 63, 0, 0, 0, 0, 0, 240, 244, 188, 253, 68, 136, 121, 50, 102, 239, 63, 0, 0, 0, 0, 0, 128, 202, 60, 56, 190, 156, 173, 253, 123, 239, 63, 0, 0, 0, 0, 0, 188, 250, 60, 130, 60, 36, 2, 216, 145, 239, 63, 0, 0, 0, 0, 0, 96, 212, 188, 142, 144, 158, 129, 193, 167, 239, 63, 0, 0, 0, 0, 0, 12, 11, 189, 17, 213, 146, 54, 186, 189, 239, 63, 0, 0, 0, 0, 0, 224, 192, 188, 148, 113, 143, 43, 194, 211, 239, 63, 0, 0, 0, 0, 128, 222, 16, 189, 238, 35, 42, 107, 217, 233, 239, 63, 0, 0, 0, 0, 0, 67, 238, 60, 0, 0, 0, 0, 0, 0, 240, 63, 0, 0, 0, 0, 0, 0, 0, 0, 190, 188, 90, 250, 26, 11, 240, 63, 0, 0, 0, 0, 0, 64, 179, 188, 3, 51, 251, 169, 61, 22, 240, 63, 0, 0, 0, 0, 0, 23, 18, 189, 130, 2, 59, 20, 104, 33, 240, 63, 0, 0, 0, 0, 0, 64, 186, 60, 108, 128, 119, 62, 154, 44, 240, 63, 0, 0, 0, 0, 0, 152, 239, 60, 202, 187, 17, 46, 212, 55, 240, 63, 0, 0, 0, 0, 0, 64, 199, 188, 137, 127, 110, 232, 21, 67, 240, 63, 0, 0, 0, 0, 0, 48, 216, 60, 103, 84, 246, 114, 95, 78, 240, 63, 0, 0, 0, 0, 0, 63, 26, 189, 90, 133, 21, 211, 176, 89, 240, 63, 0, 0, 0, 0, 0, 132, 2, 189, 149, 31, 60, 14, 10, 101, 240, 63, 0, 0, 0, 0, 0, 96, 241, 60, 26, 247, 221, 41, 107, 112, 240, 63, 0, 0, 0, 0, 0, 36, 21, 61, 45, 168, 114, 43, 212, 123, 240, 63, 0, 0, 0, 0, 0, 160, 233, 188, 208, 155, 117, 24, 69, 135, 240, 63, 0, 0, 0, 0, 0, 64, 230, 60, 200, 7, 102, 246, 189, 146, 240, 63, 0, 0, 0, 0, 0, 120, 0, 189, 131, 243, 198, 202, 62, 158, 240, 63, 0, 0, 0, 0, 0, 0, 152, 188, 48, 57, 31, 155, 199, 169, 240, 63, 0, 0, 0, 0, 0, 160, 255, 60, 252, 136, 249, 108, 88, 181, 240, 63, 0, 0, 0, 0, 0, 200, 250, 188, 138, 108, 228, 69, 241, 192, 240, 63, 0, 0, 0, 0, 0, 192, 217, 60, 22, 72, 114, 43, 146, 204, 240, 63, 0, 0, 0, 0, 0, 32, 5, 61, 216, 93, 57, 35, 59, 216, 240, 63, 0, 0, 0, 0, 0, 208, 250, 188, 243, 209, 211, 50, 236, 227, 240, 63, 0, 0, 0, 0, 0, 172, 27, 61, 166, 169, 223, 95, 165, 239, 240, 63, 0, 0, 0, 0, 0, 232, 4, 189, 240, 210, 254, 175, 102, 251, 240, 63, 0, 0, 0, 0, 0, 48, 13, 189, 75, 35, 215, 40, 48, 7, 241, 63, 0, 0, 0, 0, 0, 80, 241, 60, 91, 91, 18, 208, 1, 19, 241, 63, 0, 0, 0, 0, 0, 0, 236, 60, 249, 42, 94, 171, 219, 30, 241, 63, 0, 0, 0, 0, 0, 188, 22, 61, 213, 49, 108, 192, 189, 42, 241, 63, 0, 0, 0, 0, 0, 64, 232, 60, 125, 4, 242, 20, 168, 54, 241, 63, 0, 0, 0, 0, 0, 208, 14, 189, 233, 45, 169, 174, 154, 66, 241, 63, 0, 0, 0, 0, 0, 224, 232, 60, 56, 49, 79, 147, 149, 78, 241, 63, 0, 0, 0, 0, 0, 64, 235, 60, 113, 142, 165, 200, 152, 90, 241, 63, 0, 0, 0, 0, 0, 48, 5, 61, 223, 195, 113, 84, 164, 102, 241, 63, 0, 0, 0, 0, 0, 56, 3, 61, 17, 82, 125, 60, 184, 114, 241, 63, 0, 0, 0, 0, 0, 212, 40, 61, 159, 187, 149, 134, 212, 126, 241, 63, 0, 0, 0, 0, 0, 208, 5, 189, 147, 141, 140, 56, 249, 138, 241, 63, 0, 0, 0, 0, 0, 136, 28, 189, 102, 93, 55, 88, 38, 151, 241, 63, 0, 0, 0, 0, 0, 240, 17, 61, 167, 203, 111, 235, 91, 163, 241, 63, 0, 0, 0, 0, 0, 72, 16, 61, 227, 135, 19, 248, 153, 175, 241, 63, 0, 0, 0, 0, 0, 57, 71, 189, 84, 93, 4, 132, 224, 187, 241, 63, 0, 0, 0, 0, 0, 228, 36, 61, 67, 28, 40, 149, 47, 200, 241, 63, 0, 0, 0, 0, 0, 32, 10, 189, 178, 185, 104, 49, 135, 212, 241, 63, 0, 0, 0, 0, 0, 128, 227, 60, 49, 64, 180, 94, 231, 224, 241, 63, 0, 0, 0, 0, 0, 192, 234, 60, 56, 217, 252, 34, 80, 237, 241, 63, 0, 0, 0, 0, 0, 144, 1, 61, 247, 205, 56, 132, 193, 249, 241, 63, 0, 0, 0, 0, 0, 120, 27, 189, 143, 141, 98, 136, 59, 6, 242, 63, 0, 0, 0, 0, 0, 148, 45, 61, 30, 168, 120, 53, 190, 18, 242, 63, 0, 0, 0, 0, 0, 0, 216, 60, 65, 221, 125, 145, 73, 31, 242, 63, 0, 0, 0, 0, 0, 52, 43, 61, 35, 19, 121, 162, 221, 43, 242, 63, 0, 0, 0, 0, 0, 248, 25, 61, 231, 97, 117, 110, 122, 56, 242, 63, 0, 0, 0, 0, 0, 200, 25, 189, 39, 20, 130, 251, 31, 69, 242, 63, 0, 0, 0, 0, 0, 48, 2, 61, 2, 166, 178, 79, 206, 81, 242, 63, 0, 0, 0, 0, 0, 72, 19, 189, 176, 206, 30, 113, 133, 94, 242, 63, 0, 0, 0, 0, 0, 112, 18, 61, 22, 125, 226, 101, 69, 107, 242, 63, 0, 0, 0, 0, 0, 208, 17, 61, 15, 224, 29, 52, 14, 120, 242, 63, 0, 0, 0, 0, 0, 238, 49, 61, 62, 99, 245, 225, 223, 132, 242, 63, 0, 0, 0, 0, 0, 192, 20, 189, 48, 187, 145, 117, 186, 145, 242, 63, 0, 0, 0, 0, 0, 216, 19, 189, 9, 223, 31, 245, 157, 158, 242, 63, 0, 0, 0, 0, 0, 176, 8, 61, 155, 14, 209, 102, 138, 171, 242, 63, 0, 0, 0, 0, 0, 124, 34, 189, 58, 218, 218, 208, 127, 184, 242, 63, 0, 0, 0, 0, 0, 52, 42, 61, 249, 26, 119, 57, 126, 197, 242, 63, 0, 0, 0, 0, 0, 128, 16, 189, 217, 2, 228, 166, 133, 210, 242, 63, 0, 0, 0, 0, 0, 208, 14, 189, 121, 21, 100, 31, 150, 223, 242, 63, 0, 0, 0, 0, 0, 32, 244, 188, 207, 46, 62, 169, 175, 236, 242, 63, 0, 0, 0, 0, 0, 152, 36, 189, 34, 136, 189, 74, 210, 249, 242, 63, 0, 0, 0, 0, 0, 48, 22, 189, 37, 182, 49, 10, 254, 6, 243, 63, 0, 0, 0, 0, 0, 54, 50, 189, 11, 165, 238, 237, 50, 20, 243, 63, 0, 0, 0, 0, 128, 223, 112, 189, 184, 215, 76, 252, 112, 33, 243, 63, 0, 0, 0, 0, 0, 72, 34, 189, 162, 233, 168, 59, 184, 46, 243, 63, 0, 0, 0, 0, 0, 152, 37, 189, 102, 23, 100, 178, 8, 60, 243, 63, 0, 0, 0, 0, 0, 208, 30, 61, 39, 250, 227, 102, 98, 73, 243, 63, 0, 0, 0, 0, 0, 0, 220, 188, 15, 159, 146, 95, 197, 86, 243, 63, 0, 0, 0, 0, 0, 216, 48, 189, 185, 136, 222, 162, 49, 100, 243, 63, 0, 0, 0, 0, 0, 200, 34, 61, 57, 170, 58, 55, 167, 113, 243, 63, 0, 0, 0, 0, 0, 96, 32, 61, 254, 116, 30, 35, 38, 127, 243, 63, 0, 0, 0, 0, 0, 96, 22, 189, 56, 216, 5, 109, 174, 140, 243, 63, 0, 0, 0, 0, 0, 224, 10, 189, 195, 62, 113, 27, 64, 154, 243, 63, 0, 0, 0, 0, 0, 114, 68, 189, 32, 160, 229, 52, 219, 167, 243, 63, 0, 0, 0, 0, 0, 32, 8, 61, 149, 110, 236, 191, 127, 181, 243, 63, 0, 0, 0, 0, 0, 128, 62, 61, 242, 168, 19, 195, 45, 195, 243, 63, 0, 0, 0, 0, 0, 128, 239, 60, 34, 225, 237, 68, 229, 208, 243, 63, 0, 0, 0, 0, 0, 160, 23, 189, 187, 52, 18, 76, 166, 222, 243, 63, 0, 0, 0, 0, 0, 48, 38, 61, 204, 78, 28, 223, 112, 236, 243, 63, 0, 0, 0, 0, 0, 166, 72, 189, 140, 126, 172, 4, 69, 250, 243, 63, 0, 0, 0, 0, 0, 220, 60, 189, 187, 160, 103, 195, 34, 8, 244, 63, 0, 0, 0, 0, 0, 184, 37, 61, 149, 46, 247, 33, 10, 22, 244, 63, 0, 0, 0, 0, 0, 192, 30, 61, 70, 70, 9, 39, 251, 35, 244, 63, 0, 0, 0, 0, 0, 96, 19, 189, 32, 169, 80, 217, 245, 49, 244, 63, 0, 0, 0, 0, 0, 152, 35, 61, 235, 185, 132, 63, 250, 63, 244, 63, 0, 0, 0, 0, 0, 0, 250, 60, 25, 137, 97, 96, 8, 78, 244, 63, 0, 0, 0, 0, 0, 192, 246, 188, 1, 210, 167, 66, 32, 92, 244, 63, 0, 0, 0, 0, 0, 192, 11, 189, 22, 0, 29, 237, 65, 106, 244, 63, 0, 0, 0, 0, 0, 128, 18, 189, 38, 51, 139, 102, 109, 120, 244, 63, 0, 0, 0, 0, 0, 224, 48, 61, 0, 60, 193, 181, 162, 134, 244, 63, 0, 0, 0, 0, 0, 64, 45, 189, 4, 175, 146, 225, 225, 148, 244, 63, 0, 0, 0, 0, 0, 32, 12, 61, 114, 211, 215, 240, 42, 163, 244, 63, 0, 0, 0, 0, 0, 80, 30, 189, 1, 184, 109, 234, 125, 177, 244, 63, 0, 0, 0, 0, 0, 128, 7, 61, 225, 41, 54, 213, 218, 191, 244, 63, 0, 0, 0, 0, 0, 128, 19, 189, 50, 193, 23, 184, 65, 206, 244, 63, 0, 0, 0, 0, 0, 128, 0, 61, 219, 221, 253, 153, 178, 220, 244, 63, 0, 0, 0, 0, 0, 112, 44, 61, 150, 171, 216, 129, 45, 235, 244, 63, 0, 0, 0, 0, 0, 224, 28, 189, 2, 45, 157, 118, 178, 249, 244, 63, 0, 0, 0, 0, 0, 32, 25, 61, 193, 49, 69, 127, 65, 8, 245, 63, 0, 0, 0, 0, 0, 192, 8, 189, 42, 102, 207, 162, 218, 22, 245, 63, 0, 0, 0, 0, 0, 0, 250, 188, 234, 81, 63, 232, 125, 37, 245, 63, 0, 0, 0, 0, 0, 8, 74, 61, 218, 78, 157, 86, 43, 52, 245, 63, 0, 0, 0, 0, 0, 216, 38, 189, 26, 172, 246, 244, 226, 66, 245, 63, 0, 0, 0, 0, 0, 68, 50, 189, 219, 148, 93, 202, 164, 81, 245, 63, 0, 0, 0, 0, 0, 60, 72, 61, 107, 17, 233, 221, 112, 96, 245, 63, 0, 0, 0, 0, 0, 176, 36, 61, 222, 41, 181, 54, 71, 111, 245, 63, 0, 0, 0, 0, 0, 90, 65, 61, 14, 196, 226, 219, 39, 126, 245, 63, 0, 0, 0, 0, 0, 224, 41, 189, 111, 199, 151, 212, 18, 141, 245, 63, 0, 0, 0, 0, 0, 8, 35, 189, 76, 11, 255, 39, 8, 156, 245, 63, 0, 0, 0, 0, 0, 236, 77, 61, 39, 84, 72, 221, 7, 171, 245, 63, 0, 0, 0, 0, 0, 0, 196, 188, 244, 122, 168, 251, 17, 186, 245, 63, 0, 0, 0, 0, 0, 8, 48, 61, 11, 70, 89, 138, 38, 201, 245, 63, 0, 0, 0, 0, 0, 200, 38, 189, 63, 142, 153, 144, 69, 216, 245, 63, 0, 0, 0, 0, 0, 154, 70, 61, 225, 32, 173, 21, 111, 231, 245, 63, 0, 0, 0, 0, 0, 64, 27, 189, 202, 235, 220, 32, 163, 246, 245, 63, 0, 0, 0, 0, 0, 112, 23, 61, 184, 220, 118, 185, 225, 5, 246, 63, 0, 0, 0, 0, 0, 248, 38, 61, 21, 247, 205, 230, 42, 21, 246, 63, 0, 0, 0, 0, 0, 0, 1, 61, 49, 85, 58, 176, 126, 36, 246, 63, 0, 0, 0, 0, 0, 208, 21, 189, 181, 41, 25, 29, 221, 51, 246, 63, 0, 0, 0, 0, 0, 208, 18, 189, 19, 195, 204, 52, 70, 67, 246, 63, 0, 0, 0, 0, 0, 128, 234, 188, 250, 142, 188, 254, 185, 82, 246, 63, 0, 0, 0, 0, 0, 96, 40, 189, 151, 51, 85, 130, 56, 98, 246, 63, 0, 0, 0, 0, 0, 254, 113, 61, 142, 50, 8, 199, 193, 113, 246, 63, 0, 0, 0, 0, 0, 32, 55, 189, 126, 169, 76, 212, 85, 129, 246, 63, 0, 0, 0, 0, 0, 128, 230, 60, 113, 148, 158, 177, 244, 144, 246, 63, 0, 0, 0, 0, 0, 120, 41, 189, 0, 0, 0, 0, 0, 0, 0, 0, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 254, 255, 255, 255, 254, 255, 255, 255, 254, 255, 255, 255, 254, 255, 255, 255, 253, 255, 255, 255, 253, 255, 255, 255, 252, 255, 255, 255, 252, 255, 255, 255, 251, 255, 255, 255, 251, 255, 255, 255, 250, 255, 255, 255, 249, 255, 255, 255, 249, 255, 255, 255, 248, 255, 255, 255, 247, 255, 255, 255, 246, 255, 255, 255, 245, 255, 255, 255, 243, 255, 255, 255, 242, 255, 255, 255, 240, 255, 255, 255, 239, 255, 255, 255, 237, 255, 255, 255, 235, 255, 255, 255, 232, 255, 255, 255, 230, 255, 255, 255, 227, 255, 255, 255, 225, 255, 255, 255, 221, 255, 255, 255, 218, 255, 255, 255, 215, 255, 255, 255, 211, 255, 255, 255, 207, 255, 255, 255, 203, 255, 255, 255, 198, 255, 255, 255, 193, 255, 255, 255, 188, 255, 255, 255, 183, 255, 255, 255, 177, 255, 255, 255, 171, 255, 255, 255, 165, 255, 255, 255, 159, 255, 255, 255, 152, 255, 255, 255, 145, 255, 255, 255, 139, 255, 255, 255, 131, 255, 255, 255, 124, 255, 255, 255, 117, 255, 255, 255, 109, 255, 255, 255, 102, 255, 255, 255, 95, 255, 255, 255, 87, 255, 255, 255, 80, 255, 255, 255, 73, 255, 255, 255, 66, 255, 255, 255, 60, 255, 255, 255, 54, 255, 255, 255, 48, 255, 255, 255, 213, 0, 0, 0, 218, 0, 0, 0, 222, 0, 0, 0, 225, 0, 0, 0, 227, 0, 0, 0, 228, 0, 0, 0, 228, 0, 0, 0, 227, 0, 0, 0, 224, 0, 0, 0, 221, 0, 0, 0, 215, 0, 0, 0, 208, 0, 0, 0, 200, 0, 0, 0, 189, 0, 0, 0, 177, 0, 0, 0, 163, 0, 0, 0, 146, 0, 0, 0, 127, 0, 0, 0, 106, 0, 0, 0, 83, 0, 0, 0, 57, 0, 0, 0, 29, 0, 0, 0, 254, 255, 255, 255, 220, 255, 255, 255, 184, 255, 255, 255, 145, 255, 255, 255, 103, 255, 255, 255, 59, 255, 255, 255, 12, 255, 255, 255, 218, 254, 255, 255, 165, 254, 255, 255, 111, 254, 255, 255, 53, 254, 255, 255, 249, 253, 255, 255, 187, 253, 255, 255, 123, 253, 255, 255, 57, 253, 255, 255, 245, 252, 255, 255, 176, 252, 255, 255, 105, 252, 255, 255, 33, 252, 255, 255, 216, 251, 255, 255, 143, 251, 255, 255, 70, 251, 255, 255, 253, 250, 255, 255, 180, 250, 255, 255, 108, 250, 255, 255, 38, 250, 255, 255, 225, 249, 255, 255, 158, 249, 255, 255, 94, 249, 255, 255, 33, 249, 255, 255, 231, 248, 255, 255, 178, 248, 255, 255, 129, 248, 255, 255, 86, 248, 255, 255, 47, 248, 255, 255, 16, 248, 255, 255, 247, 247, 255, 255, 229, 247, 255, 255, 219, 247, 255, 255, 217, 247, 255, 255, 224, 247, 255, 255, 241, 247, 255, 255, 245, 7, 0, 0, 208, 7, 0, 0, 160, 7, 0, 0, 101, 7, 0, 0, 30, 7, 0, 0, 203, 6, 0, 0, 108, 6, 0, 0, 255, 5, 0, 0, 134, 5, 0, 0, 0, 5, 0, 0, 107, 4, 0, 0, 202, 3, 0, 0, 26, 3, 0, 0, 93, 2, 0, 0, 146, 1, 0, 0, 185, 0, 0, 0, 211, 255, 255, 255, 224, 254, 255, 255, 223, 253, 255, 255, 210, 252, 255, 255, 185, 251, 255, 255, 148, 250, 255, 255, 100, 249, 255, 255, 42, 248, 255, 255, 230, 246, 255, 255, 153, 245, 255, 255, 68, 244, 255, 255, 233, 242, 255, 255, 135, 241, 255, 255, 33, 240, 255, 255, 183, 238, 255, 255, 76, 237, 255, 255, 223, 235, 255, 255, 115, 234, 255, 255, 9, 233, 255, 255, 163, 231, 255, 255, 67, 230, 255, 255, 233, 228, 255, 255, 153, 227, 255, 255, 83, 226, 255, 255, 26, 225, 255, 255, 239, 223, 255, 255, 213, 222, 255, 255, 205, 221, 255, 255, 218, 220, 255, 255, 253, 219, 255, 255, 56, 219, 255, 255, 143, 218, 255, 255, 1, 218, 255, 255, 146, 217, 255, 255, 68, 217, 255, 255, 25, 217, 255, 255, 18, 217, 255, 255, 49, 217, 255, 255, 121, 217, 255, 255, 234, 217, 255, 255, 136, 218, 255, 255, 83, 219, 255, 255, 77, 220, 255, 255, 120, 221, 255, 255, 212, 222, 255, 255, 100, 224, 255, 255, 40, 226, 255, 255, 34, 228, 255, 255, 174, 25, 0, 0, 71, 23, 0, 0, 168, 20, 0, 0, 209, 17, 0, 0, 192, 14, 0, 0, 119, 11, 0, 0, 245, 7, 0, 0, 58, 4, 0, 0, 70, 0, 0, 0, 26, 252, 255, 255, 182, 247, 255, 255, 28, 243, 255, 255, 75, 238, 255, 255, 70, 233, 255, 255, 14, 228, 255, 255, 164, 222, 255, 255, 9, 217, 255, 255, 65, 211, 255, 255, 76, 205, 255, 255, 44, 199, 255, 255, 229, 192, 255, 255, 121, 186, 255, 255, 234, 179, 255, 255, 59, 173, 255, 255, 111, 166, 255, 255, 138, 159, 255, 255, 142, 152, 255, 255, 127, 145, 255, 255, 96, 138, 255, 255, 53, 131, 255, 255, 1, 124, 255, 255, 200, 116, 255, 255, 143, 109, 255, 255, 88, 102, 255, 255, 40, 95, 255, 255, 2, 88, 255, 255, 235, 80, 255, 255, 231, 73, 255, 255, 250, 66, 255, 255, 39, 60, 255, 255, 115, 53, 255, 255, 226, 46, 255, 255, 118, 40, 255, 255, 54, 34, 255, 255, 35, 28, 255, 255, 66, 22, 255, 255, 151, 16, 255, 255, 36, 11, 255, 255, 237, 5, 255, 255, 246, 0, 255, 255, 66, 252, 254, 255, 211, 247, 254, 255, 172, 243, 254, 255, 209, 239, 254, 255, 66, 236, 254, 255, 4, 233, 254, 255, 23, 230, 254, 255, 125, 227, 254, 255, 57, 225, 254, 255, 76, 223, 254, 255, 183, 221, 254, 255, 122, 220, 254, 255, 152, 219, 254, 255, 16, 219, 254, 255, 30, 37, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 14, 227, 0, 0, 130, 210, 0, 0, 3, 0, 0, 0, 18, 227, 0, 0, 138, 210, 0, 0, 3, 0, 0, 0, 27, 227, 0, 0, 156, 210, 0, 0, 4, 0, 0, 0, 36, 227, 0, 0, 174, 210, 0, 0, 4, 0, 0, 0, 52, 227, 0, 0, 206, 210, 0, 0, 6, 0, 0, 0, 68, 227, 0, 0, 238, 210, 0, 0, 6, 0, 0, 0, 104, 227, 0, 0, 54, 211, 0, 0, 6, 0, 0, 0, 140, 227, 0, 0, 126, 211, 0, 0, 8, 0, 0, 0, 176, 227, 0, 0, 198, 211, 0, 0, 8, 0, 0, 0, 240, 227, 0, 0, 70, 212, 0, 0, 8, 0, 0, 0, 48, 228, 0, 0, 198, 212, 0, 0, 16, 0, 0, 0, 112, 228, 0, 0, 70, 213, 0, 0, 16, 0, 0, 0, 112, 229, 0, 0, 70, 215, 0, 0, 16, 0, 0, 0, 112, 230, 0, 0, 70, 217, 0, 0, 16, 0, 0, 0, 112, 231, 0, 0, 70, 219 ], "i8", ALLOC_NONE, Runtime.GLOBAL_BASE);
allocate([ 154, 153, 25, 191, 195, 245, 8, 191, 195, 245, 168, 190, 164, 112, 61, 190, 92, 143, 194, 189, 158, 239, 39, 189, 30, 167, 104, 188, 179, 123, 114, 187 ], "i8", ALLOC_NONE, Runtime.GLOBAL_BASE + 40816);
allocate([ 3, 0, 0, 0, 3, 0, 0, 0, 2, 0, 0, 0, 2, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 143, 149, 62, 64, 6, 247, 65, 66, 107, 190, 157, 70, 190, 43, 33, 78, 154, 121, 130, 90, 222, 161, 148, 111, 98, 236, 183, 75, 29, 117, 163, 123, 0, 0, 0, 0, 63, 64, 0, 0, 66, 66, 0, 0, 158, 70, 0, 0, 33, 78, 0, 0, 130, 90, 0, 0, 149, 111, 0, 0, 112, 151, 0, 0, 71, 247, 0, 0, 81, 222, 2 ], "i8", ALLOC_NONE, Runtime.GLOBAL_BASE + 51808);
allocate([ 1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 2, 0, 1, 0, 3, 0, 1, 0, 1, 0, 3, 0, 2, 0, 0, 0, 3, 0, 2, 0, 1, 0, 1, 0, 1, 0, 1, 0, 3, 0, 2, 0, 0, 0, 1, 0, 2, 0, 6, 0, 5, 0, 3, 0, 1, 0, 4, 0, 4, 0, 7, 0, 5, 0, 7, 0, 1, 0, 6, 0, 1, 0, 1, 0, 0, 0, 7, 0, 3, 0, 5, 0, 1, 0, 6, 0, 2, 0, 3, 0, 2, 0, 5, 0, 4, 0, 4, 0, 1, 0, 3, 0, 3, 0, 2, 0, 0, 0, 1, 0, 2, 0, 10, 0, 19, 0, 16, 0, 10, 0, 3, 0, 3, 0, 7, 0, 10, 0, 5, 0, 3, 0, 11, 0, 4, 0, 13, 0, 17, 0, 8, 0, 4, 0, 12, 0, 11, 0, 18, 0, 15, 0, 11, 0, 2, 0, 7, 0, 6, 0, 9, 0, 14, 0, 3, 0, 1, 0, 6, 0, 4, 0, 5, 0, 3, 0, 2, 0, 0, 0, 3, 0, 4, 0, 6, 0, 18, 0, 12, 0, 5, 0, 5, 0, 1, 0, 2, 0, 16, 0, 9, 0, 3, 0, 7, 0, 3, 0, 5, 0, 14, 0, 7, 0, 3, 0, 19, 0, 17, 0, 15, 0, 13, 0, 10, 0, 4, 0, 13, 0, 5, 0, 8, 0, 11, 0, 5, 0, 1, 0, 12, 0, 4, 0, 4, 0, 1, 0, 1, 0, 0, 0, 7, 0, 5, 0, 9, 0, 14, 0, 15, 0, 7, 0, 6, 0, 4, 0, 5, 0, 5, 0, 6, 0, 7, 0, 7, 0, 6, 0, 8, 0, 8, 0, 8, 0, 5, 0, 15, 0, 6, 0, 9, 0, 10, 0, 5, 0, 1, 0, 11, 0, 7, 0, 9, 0, 6, 0, 4, 0, 1, 0, 14, 0, 4, 0, 6, 0, 2, 0, 6, 0, 0, 0, 1, 0, 2, 0, 10, 0, 23, 0, 35, 0, 30, 0, 12, 0, 17, 0, 3, 0, 3, 0, 8, 0, 12, 0, 18, 0, 21, 0, 12, 0, 7, 0, 11, 0, 9, 0, 15, 0, 21, 0, 32, 0, 40, 0, 19, 0, 6, 0, 14, 0, 13, 0, 22, 0, 34, 0, 46, 0, 23, 0, 18, 0, 7, 0, 20, 0, 19, 0, 33, 0, 47, 0, 27, 0, 22, 0, 9, 0, 3, 0, 31, 0, 22, 0, 41, 0, 26, 0, 21, 0, 20, 0, 5, 0, 3, 0, 14, 0, 13, 0, 10, 0, 11, 0, 16, 0, 6, 0, 5, 0, 1, 0, 9, 0, 8, 0, 7, 0, 8, 0, 4, 0, 4, 0, 2, 0, 0, 0, 3, 0, 4, 0, 10, 0, 24, 0, 34, 0, 33, 0, 21, 0, 15, 0, 5, 0, 3, 0, 4, 0, 10, 0, 32, 0, 17, 0, 11, 0, 10, 0, 11, 0, 7, 0, 13, 0, 18, 0, 30, 0, 31, 0, 20, 0, 5, 0, 25, 0, 11, 0, 19, 0, 59, 0, 27, 0, 18, 0, 12, 0, 5, 0, 35, 0, 33, 0, 31, 0, 58, 0, 30, 0, 16, 0, 7, 0, 5, 0, 28, 0, 26, 0, 32, 0, 19, 0, 17, 0, 15, 0, 8, 0, 14, 0, 14, 0, 12, 0, 9, 0, 13, 0, 14, 0, 9, 0, 4, 0, 1, 0, 11, 0, 4, 0, 6, 0, 6, 0, 6, 0, 3, 0, 2, 0, 0, 0, 9, 0, 6, 0, 16, 0, 33, 0, 41, 0, 39, 0, 38, 0, 26, 0, 7, 0, 5, 0, 6, 0, 9, 0, 23, 0, 16, 0, 26, 0, 11, 0, 17, 0, 7, 0, 11, 0, 14, 0, 21, 0, 30, 0, 10, 0, 7, 0, 17, 0, 10, 0, 15, 0, 12, 0, 18, 0, 28, 0, 14, 0, 5, 0, 32, 0, 13, 0, 22, 0, 19, 0, 18, 0, 16, 0, 9, 0, 5, 0, 40, 0, 17, 0, 31, 0, 29, 0, 17, 0, 13, 0, 4, 0, 2, 0, 27, 0, 12, 0, 11, 0, 15, 0, 10, 0, 7, 0, 4, 0, 1, 0, 27, 0, 12, 0, 8, 0, 12, 0, 6, 0, 3, 0, 1, 0, 0, 0, 1, 0, 5, 0, 14, 0, 21, 0, 34, 0, 51, 0, 46, 0, 71, 0, 42, 0, 52, 0, 68, 0, 52, 0, 67, 0, 44, 0, 43, 0, 19, 0, 3, 0, 4, 0, 12, 0, 19, 0, 31, 0, 26, 0, 44, 0, 33, 0, 31, 0, 24, 0, 32, 0, 24, 0, 31, 0, 35, 0, 22, 0, 14, 0, 15, 0, 13, 0, 23, 0, 36, 0, 59, 0, 49, 0, 77, 0, 65, 0, 29, 0, 40, 0, 30, 0, 40, 0, 27, 0, 33, 0, 42, 0, 16, 0, 22, 0, 20, 0, 37, 0, 61, 0, 56, 0, 79, 0, 73, 0, 64, 0, 43, 0, 76, 0, 56, 0, 37, 0, 26, 0, 31, 0, 25, 0, 14, 0, 35, 0, 16, 0, 60, 0, 57, 0, 97, 0, 75, 0, 114, 0, 91, 0, 54, 0, 73, 0, 55, 0, 41, 0, 48, 0, 53, 0, 23, 0, 24, 0, 58, 0, 27, 0, 50, 0, 96, 0, 76, 0, 70, 0, 93, 0, 84, 0, 77, 0, 58, 0, 79, 0, 29, 0, 74, 0, 49, 0, 41, 0, 17, 0, 47, 0, 45, 0, 78, 0, 74, 0, 115, 0, 94, 0, 90, 0, 79, 0, 69, 0, 83, 0, 71, 0, 50, 0, 59, 0, 38, 0, 36, 0, 15, 0, 72, 0, 34, 0, 56, 0, 95, 0, 92, 0, 85, 0, 91, 0, 90, 0, 86, 0, 73, 0, 77, 0, 65, 0, 51, 0, 44, 0, 43, 0, 42, 0, 43, 0, 20, 0, 30, 0, 44, 0, 55, 0, 78, 0, 72, 0, 87, 0, 78, 0, 61, 0, 46, 0, 54, 0, 37, 0, 30, 0, 20, 0, 16, 0, 53, 0, 25, 0, 41, 0, 37, 0, 44, 0, 59, 0, 54, 0, 81, 0, 66, 0, 76, 0, 57, 0, 54, 0, 37, 0, 18, 0, 39, 0, 11, 0, 35, 0, 33, 0, 31, 0, 57, 0, 42, 0, 82, 0, 72, 0, 80, 0, 47, 0, 58, 0, 55, 0, 21, 0, 22, 0, 26, 0, 38, 0, 22, 0, 53, 0, 25, 0, 23, 0, 38, 0, 70, 0, 60, 0, 51, 0, 36, 0, 55, 0, 26, 0, 34, 0, 23, 0, 27, 0, 14, 0, 9, 0, 7, 0, 34, 0, 32, 0, 28, 0, 39, 0, 49, 0, 75, 0, 30, 0, 52, 0, 48, 0, 40, 0, 52, 0, 28, 0, 18, 0, 17, 0, 9, 0, 5, 0, 45, 0, 21, 0, 34, 0, 64, 0, 56, 0, 50, 0, 49, 0, 45, 0, 31, 0, 19, 0, 12, 0, 15, 0, 10, 0, 7, 0, 6, 0, 3, 0, 48, 0, 23, 0, 20, 0, 39, 0, 36, 0, 35, 0, 53, 0, 21, 0, 16, 0, 23, 0, 13, 0, 10, 0, 6, 0, 1, 0, 4, 0, 2, 0, 16, 0, 15, 0, 17, 0, 27, 0, 25, 0, 20, 0, 29, 0, 11, 0, 17, 0, 12, 0, 16, 0, 8, 0, 1, 0, 1, 0, 0, 0, 1, 0, 7, 0, 12, 0, 18, 0, 53, 0, 47, 0, 76, 0, 124, 0, 108, 0, 89, 0, 123, 0, 108, 0, 119, 0, 107, 0, 81, 0, 122, 0, 63, 0, 13, 0, 5, 0, 16, 0, 27, 0, 46, 0, 36, 0, 61, 0, 51, 0, 42, 0, 70, 0, 52, 0, 83, 0, 65, 0, 41, 0, 59, 0, 36, 0, 19, 0, 17, 0, 15, 0, 24, 0, 41, 0, 34, 0, 59, 0, 48, 0, 40, 0, 64, 0, 50, 0, 78, 0, 62, 0, 80, 0, 56, 0, 33, 0, 29, 0, 28, 0, 25, 0, 43, 0, 39, 0, 63, 0, 55, 0, 93, 0, 76, 0, 59, 0, 93, 0, 72, 0, 54, 0, 75, 0, 50, 0, 29, 0, 52, 0, 22, 0, 42, 0, 40, 0, 67, 0, 57, 0, 95, 0, 79, 0, 72, 0, 57, 0, 89, 0, 69, 0, 49, 0, 66, 0, 46, 0, 27, 0, 77, 0, 37, 0, 35, 0, 66, 0, 58, 0, 52, 0, 91, 0, 74, 0, 62, 0, 48, 0, 79, 0, 63, 0, 90, 0, 62, 0, 40, 0, 38, 0, 125, 0, 32, 0, 60, 0, 56, 0, 50, 0, 92, 0, 78, 0, 65, 0, 55, 0, 87, 0, 71, 0, 51, 0, 73, 0, 51, 0, 70, 0, 30, 0, 109, 0, 53, 0, 49, 0, 94, 0, 88, 0, 75, 0, 66, 0, 122, 0, 91, 0, 73, 0, 56, 0, 42, 0, 64, 0, 44, 0, 21, 0, 25, 0, 90, 0, 43, 0, 41, 0, 77, 0, 73, 0, 63, 0, 56, 0, 92, 0, 77, 0, 66, 0, 47, 0, 67, 0, 48, 0, 53, 0, 36, 0, 20, 0, 71, 0, 34, 0, 67, 0, 60, 0, 58, 0, 49, 0, 88, 0, 76, 0, 67, 0, 106, 0, 71, 0, 54, 0, 38, 0, 39, 0, 23, 0, 15, 0, 109, 0, 53, 0, 51, 0, 47, 0, 90, 0, 82, 0, 58, 0, 57, 0, 48, 0, 72, 0, 57, 0, 41, 0, 23, 0, 27, 0, 62, 0, 9, 0, 86, 0, 42, 0, 40, 0, 37, 0, 70, 0, 64, 0, 52, 0, 43, 0, 70, 0, 55, 0, 42, 0, 25, 0, 29, 0, 18, 0, 11, 0, 11, 0, 118, 0, 68, 0, 30, 0, 55, 0, 50, 0, 46, 0, 74, 0, 65, 0, 49, 0, 39, 0, 24, 0, 16, 0, 22, 0, 13, 0, 14, 0, 7, 0, 91, 0, 44, 0, 39, 0, 38, 0, 34, 0, 63, 0, 52, 0, 45, 0, 31, 0, 52, 0, 28, 0, 19, 0, 14, 0, 8, 0, 9, 0, 3, 0, 123, 0, 60, 0, 58, 0, 53, 0, 47, 0, 43, 0, 32, 0, 22, 0, 37, 0, 24, 0, 17, 0, 12, 0, 15, 0, 10, 0, 2, 0, 1, 0, 71, 0, 37, 0, 34, 0, 30, 0, 28, 0, 20, 0, 17, 0, 26, 0, 21, 0, 16, 0, 10, 0, 6, 0, 8, 0, 6, 0, 2, 0, 0, 0, 1, 0, 5, 0, 14, 0, 44, 0, 74, 0, 63, 0, 110, 0, 93, 0, 172, 0, 149, 0, 138, 0, 242, 0, 225, 0, 195, 0, 120, 1, 17, 0, 3, 0, 4, 0, 12, 0, 20, 0, 35, 0, 62, 0, 53, 0, 47, 0, 83, 0, 75, 0, 68, 0, 119, 0, 201, 0, 107, 0, 207, 0, 9, 0, 15, 0, 13, 0, 23, 0, 38, 0, 67, 0, 58, 0, 103, 0, 90, 0, 161, 0, 72, 0, 127, 0, 117, 0, 110, 0, 209, 0, 206, 0, 16, 0, 45, 0, 21, 0, 39, 0, 69, 0, 64, 0, 114, 0, 99, 0, 87, 0, 158, 0, 140, 0, 252, 0, 212, 0, 199, 0, 131, 1, 109, 1, 26, 0, 75, 0, 36, 0, 68, 0, 65, 0, 115, 0, 101, 0, 179, 0, 164, 0, 155, 0, 8, 1, 246, 0, 226, 0, 139, 1, 126, 1, 106, 1, 9, 0, 66, 0, 30, 0, 59, 0, 56, 0, 102, 0, 185, 0, 173, 0, 9, 1, 142, 0, 253, 0, 232, 0, 144, 1, 132, 1, 122, 1, 189, 1, 16, 0, 111, 0, 54, 0, 52, 0, 100, 0, 184, 0, 178, 0, 160, 0, 133, 0, 1, 1, 244, 0, 228, 0, 217, 0, 129, 1, 110, 1, 203, 2, 10, 0, 98, 0, 48, 0, 91, 0, 88, 0, 165, 0, 157, 0, 148, 0, 5, 1, 248, 0, 151, 1, 141, 1, 116, 1, 124, 1, 121, 3, 116, 3, 8, 0, 85, 0, 84, 0, 81, 0, 159, 0, 156, 0, 143, 0, 4, 1, 249, 0, 171, 1, 145, 1, 136, 1, 127, 1, 215, 2, 201, 2, 196, 2, 7, 0, 154, 0, 76, 0, 73, 0, 141, 0, 131, 0, 0, 1, 245, 0, 170, 1, 150, 1, 138, 1, 128, 1, 223, 2, 103, 1, 198, 2, 96, 1, 11, 0, 139, 0, 129, 0, 67, 0, 125, 0, 247, 0, 233, 0, 229, 0, 219, 0, 137, 1, 231, 2, 225, 2, 208, 2, 117, 3, 114, 3, 183, 1, 4, 0, 243, 0, 120, 0, 118, 0, 115, 0, 227, 0, 223, 0, 140, 1, 234, 2, 230, 2, 224, 2, 209, 2, 200, 2, 194, 2, 223, 0, 180, 1, 6, 0, 202, 0, 224, 0, 222, 0, 218, 0, 216, 0, 133, 1, 130, 1, 125, 1, 108, 1, 120, 3, 187, 1, 195, 2, 184, 1, 181, 1, 192, 6, 4, 0, 235, 2, 211, 0, 210, 0, 208, 0, 114, 1, 123, 1, 222, 2, 211, 2, 202, 2, 199, 6, 115, 3, 109, 3, 108, 3, 131, 13, 97, 3, 2, 0, 121, 1, 113, 1, 102, 0, 187, 0, 214, 2, 210, 2, 102, 1, 199, 2, 197, 2, 98, 3, 198, 6, 103, 3, 130, 13, 102, 3, 178, 1, 0, 0, 12, 0, 10, 0, 7, 0, 11, 0, 10, 0, 17, 0, 11, 0, 9, 0, 13, 0, 12, 0, 10, 0, 7, 0, 5, 0, 3, 0, 1, 0, 3, 0, 15, 0, 13, 0, 46, 0, 80, 0, 146, 0, 6, 1, 248, 0, 178, 1, 170, 1, 157, 2, 141, 2, 137, 2, 109, 2, 5, 2, 8, 4, 88, 0, 14, 0, 12, 0, 21, 0, 38, 0, 71, 0, 130, 0, 122, 0, 216, 0, 209, 0, 198, 0, 71, 1, 89, 1, 63, 1, 41, 1, 23, 1, 42, 0, 47, 0, 22, 0, 41, 0, 74, 0, 68, 0, 128, 0, 120, 0, 221, 0, 207, 0, 194, 0, 182, 0, 84, 1, 59, 1, 39, 1, 29, 2, 18, 0, 81, 0, 39, 0, 75, 0, 70, 0, 134, 0, 125, 0, 116, 0, 220, 0, 204, 0, 190, 0, 178, 0, 69, 1, 55, 1, 37, 1, 15, 1, 16, 0, 147, 0, 72, 0, 69, 0, 135, 0, 127, 0, 118, 0, 112, 0, 210, 0, 200, 0, 188, 0, 96, 1, 67, 1, 50, 1, 29, 1, 28, 2, 14, 0, 7, 1, 66, 0, 129, 0, 126, 0, 119, 0, 114, 0, 214, 0, 202, 0, 192, 0, 180, 0, 85, 1, 61, 1, 45, 1, 25, 1, 6, 1, 12, 0, 249, 0, 123, 0, 121, 0, 117, 0, 113, 0, 215, 0, 206, 0, 195, 0, 185, 0, 91, 1, 74, 1, 52, 1, 35, 1, 16, 1, 8, 2, 10, 0, 179, 1, 115, 0, 111, 0, 109, 0, 211, 0, 203, 0, 196, 0, 187, 0, 97, 1, 76, 1, 57, 1, 42, 1, 27, 1, 19, 2, 125, 1, 17, 0, 171, 1, 212, 0, 208, 0, 205, 0, 201, 0, 193, 0, 186, 0, 177, 0, 169, 0, 64, 1, 47, 1, 30, 1, 12, 1, 2, 2, 121, 1, 16, 0, 79, 1, 199, 0, 197, 0, 191, 0, 189, 0, 181, 0, 174, 0, 77, 1, 65, 1, 49, 1, 33, 1, 19, 1, 9, 2, 123, 1, 115, 1, 11, 0, 156, 2, 184, 0, 183, 0, 179, 0, 175, 0, 88, 1, 75, 1, 58, 1, 48, 1, 34, 1, 21, 1, 18, 2, 127, 1, 117, 1, 110, 1, 10, 0, 140, 2, 90, 1, 171, 0, 168, 0, 164, 0, 62, 1, 53, 1, 43, 1, 31, 1, 20, 1, 7, 1, 1, 2, 119, 1, 112, 1, 106, 1, 6, 0, 136, 2, 66, 1, 60, 1, 56, 1, 51, 1, 46, 1, 36, 1, 28, 1, 13, 1, 5, 1, 0, 2, 120, 1, 114, 1, 108, 1, 103, 1, 4, 0, 108, 2, 44, 1, 40, 1, 38, 1, 32, 1, 26, 1, 17, 1, 10, 1, 3, 2, 124, 1, 118, 1, 113, 1, 109, 1, 105, 1, 101, 1, 2, 0, 9, 4, 24, 1, 22, 1, 18, 1, 11, 1, 8, 1, 3, 1, 126, 1, 122, 1, 116, 1, 111, 1, 107, 1, 104, 1, 102, 1, 100, 1, 0, 0, 43, 0, 20, 0, 19, 0, 17, 0, 15, 0, 13, 0, 11, 0, 9, 0, 7, 0, 6, 0, 4, 0, 7, 0, 5, 0, 3, 0, 1, 0, 3, 0, 68, 172, 128, 187, 0, 125, 0, 0, 32, 0, 40, 0, 48, 0, 56, 0, 64, 0, 80, 0, 96, 0, 112, 0, 128, 0, 160, 0, 192, 0, 224, 0, 0, 1, 64, 1, 0, 0, 8, 0, 16, 0, 24, 0, 32, 0, 40, 0, 48, 0, 56, 0, 64, 0, 80, 0, 96, 0, 112, 0, 128, 0, 144, 0, 160 ], "i8", ALLOC_NONE, Runtime.GLOBAL_BASE + 53882);
allocate([ 1, 4, 4, 5, 4, 6, 5, 6, 4, 5, 5, 6, 5, 6, 6, 6, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 1, 5, 4, 5, 6, 5, 4, 4, 7, 3, 6, 0, 7, 2, 3, 1, 15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0, 4, 4, 4, 4, 4, 4, 6, 6, 8, 8, 10, 12, 16, 20, 24, 28, 34, 42, 50, 54, 76, 158, 4, 4, 4, 4, 4, 4, 6, 6, 6, 8, 10, 12, 16, 18, 22, 28, 34, 40, 46, 54, 54, 192, 4, 4, 4, 4, 4, 4, 6, 6, 8, 10, 12, 16, 20, 24, 30, 38, 46, 56, 68, 84, 102, 26, 6, 6, 6, 6, 6, 6, 8, 10, 12, 14, 16, 20, 24, 28, 32, 38, 46, 52, 60, 68, 58, 54, 6, 6, 6, 6, 6, 6, 8, 10, 12, 14, 16, 18, 22, 26, 32, 38, 46, 52, 64, 70, 76, 36, 6, 6, 6, 6, 6, 6, 8, 10, 12, 14, 16, 20, 24, 28, 32, 38, 46, 52, 60, 68, 58, 54, 6, 6, 6, 6, 6, 6, 8, 10, 12, 14, 16, 20, 24, 28, 32, 38, 46, 52, 60, 68, 58, 54, 6, 6, 6, 6, 6, 6, 8, 10, 12, 14, 16, 20, 24, 28, 32, 38, 46, 52, 60, 68, 58, 54, 12, 12, 12, 12, 12, 12, 16, 20, 24, 28, 32, 40, 48, 56, 64, 76, 90, 2, 2, 2, 2, 2, 1, 3, 2, 3, 1, 3, 6, 3, 3, 5, 5, 5, 6, 2, 2, 6, 3, 2, 5, 5, 5, 6, 1, 3, 6, 7, 3, 3, 6, 7, 6, 6, 7, 8, 7, 6, 7, 8, 3, 3, 5, 7, 3, 2, 4, 5, 4, 4, 5, 6, 6, 5, 6, 7, 1, 3, 6, 8, 8, 9, 3, 4, 6, 7, 7, 8, 6, 5, 7, 8, 8, 9, 7, 7, 8, 9, 9, 9, 7, 7, 8, 9, 9, 10, 8, 8, 9, 10, 10, 10, 2, 3, 6, 8, 8, 9, 3, 2, 4, 8, 8, 8, 6, 4, 6, 8, 8, 9, 8, 8, 8, 9, 9, 10, 8, 7, 8, 9, 10, 10, 9, 8, 9, 9, 11, 11, 3, 3, 5, 6, 8, 9, 3, 3, 4, 5, 6, 8, 4, 4, 5, 6, 7, 8, 6, 5, 6, 7, 7, 8, 7, 6, 7, 7, 8, 9, 8, 7, 8, 8, 9, 9, 1, 3, 6, 8, 9, 9, 9, 10, 3, 4, 6, 7, 8, 9, 8, 8, 6, 6, 7, 8, 9, 10, 9, 9, 7, 7, 8, 9, 10, 10, 9, 10, 8, 8, 9, 10, 10, 10, 10, 10, 9, 9, 10, 10, 11, 11, 10, 11, 8, 8, 9, 10, 10, 10, 11, 11, 9, 8, 9, 10, 10, 11, 11, 11, 2, 3, 5, 7, 8, 9, 8, 9, 3, 3, 4, 6, 8, 8, 7, 8, 5, 5, 6, 7, 8, 9, 8, 8, 7, 6, 7, 9, 8, 10, 8, 9, 8, 8, 8, 9, 9, 10, 9, 10, 8, 8, 9, 10, 10, 11, 10, 11, 8, 7, 7, 8, 9, 10, 10, 10, 8, 7, 8, 9, 10, 10, 10, 10, 4, 3, 5, 7, 8, 9, 9, 9, 3, 3, 4, 5, 7, 7, 8, 8, 5, 4, 5, 6, 7, 8, 7, 8, 6, 5, 6, 6, 7, 8, 8, 8, 7, 6, 7, 7, 8, 8, 8, 9, 8, 7, 8, 8, 8, 9, 8, 9, 8, 7, 7, 8, 8, 9, 9, 10, 9, 8, 8, 9, 9, 9, 9, 10, 1, 4, 6, 7, 8, 9, 9, 10, 9, 10, 11, 11, 12, 12, 13, 13, 3, 4, 6, 7, 8, 8, 9, 9, 9, 9, 10, 10, 11, 12, 12, 12, 6, 6, 7, 8, 9, 9, 10, 10, 9, 10, 10, 11, 11, 12, 13, 13, 7, 7, 8, 9, 9, 10, 10, 10, 10, 11, 11, 11, 11, 12, 13, 13, 8, 7, 9, 9, 10, 10, 11, 11, 10, 11, 11, 12, 12, 13, 13, 14, 9, 8, 9, 10, 10, 10, 11, 11, 11, 11, 12, 11, 13, 13, 14, 14, 9, 9, 10, 10, 11, 11, 11, 11, 11, 12, 12, 12, 13, 13, 14, 14, 10, 9, 10, 11, 11, 11, 12, 12, 12, 12, 13, 13, 13, 14, 16, 16, 9, 8, 9, 10, 10, 11, 11, 12, 12, 12, 12, 13, 13, 14, 15, 15, 10, 9, 10, 10, 11, 11, 11, 13, 12, 13, 13, 14, 14, 14, 16, 15, 10, 10, 10, 11, 11, 12, 12, 13, 12, 13, 14, 13, 14, 15, 16, 17, 11, 10, 10, 11, 12, 12, 12, 12, 13, 13, 13, 14, 15, 15, 15, 16, 11, 11, 11, 12, 12, 13, 12, 13, 14, 14, 15, 15, 15, 16, 16, 16, 12, 11, 12, 13, 13, 13, 14, 14, 14, 14, 14, 15, 16, 15, 16, 16, 13, 12, 12, 13, 13, 13, 15, 14, 14, 17, 15, 15, 15, 17, 16, 16, 12, 12, 13, 14, 14, 14, 15, 14, 15, 15, 16, 16, 19, 18, 19, 16, 3, 4, 5, 7, 7, 8, 9, 9, 9, 10, 10, 11, 11, 11, 12, 13, 4, 3, 5, 6, 7, 7, 8, 8, 8, 9, 9, 10, 10, 10, 11, 11, 5, 5, 5, 6, 7, 7, 8, 8, 8, 9, 9, 10, 10, 11, 11, 11, 6, 6, 6, 7, 7, 8, 8, 9, 9, 9, 10, 10, 10, 11, 11, 11, 7, 6, 7, 7, 8, 8, 9, 9, 9, 9, 10, 10, 10, 11, 11, 11, 8, 7, 7, 8, 8, 8, 9, 9, 9, 9, 10, 10, 11, 11, 11, 12, 9, 7, 8, 8, 8, 9, 9, 9, 9, 10, 10, 10, 11, 11, 12, 12, 9, 8, 8, 9, 9, 9, 9, 10, 10, 10, 10, 10, 11, 11, 11, 12, 9, 8, 8, 9, 9, 9, 9, 10, 10, 10, 10, 11, 11, 12, 12, 12, 9, 8, 9, 9, 9, 9, 10, 10, 10, 11, 11, 11, 11, 12, 12, 12, 10, 9, 9, 9, 10, 10, 10, 10, 10, 11, 11, 11, 11, 12, 13, 12, 10, 9, 9, 9, 10, 10, 10, 10, 11, 11, 11, 11, 12, 12, 12, 13, 11, 10, 9, 10, 10, 10, 11, 11, 11, 11, 11, 11, 12, 12, 13, 13, 11, 10, 10, 10, 10, 11, 11, 11, 11, 12, 12, 12, 12, 12, 13, 13, 12, 11, 11, 11, 11, 11, 11, 11, 12, 12, 12, 12, 13, 13, 12, 13, 12, 11, 11, 11, 11, 11, 11, 12, 12, 12, 12, 12, 13, 13, 13, 13, 1, 4, 6, 8, 9, 9, 10, 10, 11, 11, 11, 12, 12, 12, 13, 9, 3, 4, 6, 7, 8, 9, 9, 9, 10, 10, 10, 11, 12, 11, 12, 8, 6, 6, 7, 8, 9, 9, 10, 10, 11, 10, 11, 11, 11, 12, 12, 9, 8, 7, 8, 9, 9, 10, 10, 10, 11, 11, 12, 12, 12, 13, 13, 10, 9, 8, 9, 9, 10, 10, 11, 11, 11, 12, 12, 12, 13, 13, 13, 9, 9, 8, 9, 9, 10, 11, 11, 12, 11, 12, 12, 13, 13, 13, 14, 10, 10, 9, 9, 10, 11, 11, 11, 11, 12, 12, 12, 12, 13, 13, 14, 10, 10, 9, 10, 10, 11, 11, 11, 12, 12, 13, 13, 13, 13, 15, 15, 10, 10, 10, 10, 11, 11, 11, 12, 12, 13, 13, 13, 13, 14, 14, 14, 10, 11, 10, 10, 11, 11, 12, 12, 13, 13, 13, 13, 14, 13, 14, 13, 11, 11, 11, 10, 11, 12, 12, 12, 12, 13, 14, 14, 14, 15, 15, 14, 10, 12, 11, 11, 11, 12, 12, 13, 14, 14, 14, 14, 14, 14, 13, 14, 11, 12, 12, 12, 12, 12, 13, 13, 13, 13, 15, 14, 14, 14, 14, 16, 11, 14, 12, 12, 12, 13, 13, 14, 14, 14, 16, 15, 15, 15, 17, 15, 11, 13, 13, 11, 12, 14, 14, 13, 14, 14, 15, 16, 15, 17, 15, 14, 11, 9, 8, 8, 9, 9, 10, 10, 10, 11, 11, 11, 11, 11, 11, 11, 8, 4, 4, 6, 7, 8, 9, 9, 10, 10, 11, 11, 11, 11, 11, 12, 9, 4, 4, 5, 6, 7, 8, 8, 9, 9, 9, 10, 10, 10, 10, 10, 8, 6, 5, 6, 7, 7, 8, 8, 9, 9, 9, 9, 10, 10, 10, 11, 7, 7, 6, 7, 7, 8, 8, 8, 9, 9, 9, 9, 10, 10, 10, 10, 7, 8, 7, 7, 8, 8, 8, 8, 9, 9, 9, 10, 10, 10, 10, 11, 7, 9, 7, 8, 8, 8, 8, 9, 9, 9, 9, 10, 10, 10, 10, 10, 7, 9, 8, 8, 8, 8, 9, 9, 9, 9, 10, 10, 10, 10, 10, 11, 7, 10, 8, 8, 8, 9, 9, 9, 9, 10, 10, 10, 10, 10, 11, 11, 8, 10, 9, 9, 9, 9, 9, 9, 9, 9, 10, 10, 10, 10, 11, 11, 8, 10, 9, 9, 9, 9, 9, 9, 10, 10, 10, 10, 10, 11, 11, 11, 8, 11, 9, 9, 9, 9, 10, 10, 10, 10, 10, 10, 11, 11, 11, 11, 8, 11, 10, 9, 9, 9, 10, 10, 10, 10, 10, 10, 11, 11, 11, 11, 8, 11, 10, 10, 10, 10, 10, 10, 10, 10, 10, 11, 11, 11, 11, 11, 8, 11, 10, 10, 10, 10, 10, 10, 10, 11, 11, 11, 11, 11, 11, 11, 8, 12, 10, 10, 10, 10, 10, 10, 11, 11, 11, 11, 11, 11, 11, 11, 8, 8, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 8, 8, 8, 8, 4, 0, 0, 0, 0, 3, 1, 1, 1, 2, 2, 2, 3, 3, 3, 4, 4, 0, 1, 2, 3, 0, 1, 2, 3, 1, 2, 3, 1, 2, 3, 2, 3, 6, 5, 5, 5, 9, 9, 9, 9, 6, 9, 9, 9, 6, 5, 7, 3, 9, 9, 12, 6, 6, 9, 12, 6, 11, 10, 0, 0, 18, 18, 0, 0, 15, 18, 0, 0, 7, 7, 7, 0, 12, 12, 12, 0, 6, 15, 12, 0, 6, 6, 6, 3, 12, 9, 9, 6, 6, 12, 9, 6, 8, 8, 5, 0, 15, 12, 9, 0, 6, 18, 9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 3, 3, 3, 2, 0, 4, 4, 4, 4, 6, 8, 10, 12, 14, 18, 22, 30, 56, 4, 4, 4, 4, 6, 6, 10, 12, 14, 16, 20, 26, 66, 4, 4, 4, 4, 6, 8, 12, 16, 20, 26, 34, 42, 12, 4, 4, 4, 6, 6, 8, 10, 14, 18, 26, 32, 42, 18, 4, 4, 4, 6, 8, 10, 12, 14, 18, 24, 32, 44, 12, 4, 4, 4, 6, 8, 10, 12, 14, 18, 24, 30, 40, 18, 4, 4, 4, 6, 8, 10, 12, 14, 18, 24, 30, 40, 18, 4, 4, 4, 6, 8, 10, 12, 14, 18, 24, 30, 40, 18, 8, 8, 8, 12, 16, 20, 24, 28, 36, 2, 2, 2, 26, 0, 0, 1, 0, 2, 0, 3, 0, 0, 0, 4, 0, 5, 0, 6, 0, 7, 0, 8, 0, 9, 0, 10, 0, 11, 0, 12, 0, 0, 0, 13, 0, 14, 1, 14, 2, 14, 3, 14, 4, 14, 6, 14, 8, 14, 10, 14, 13, 15, 4, 15, 5, 15, 6, 15, 7, 15, 8, 15, 9, 15, 11, 15, 13 ], "i8", ALLOC_NONE, Runtime.GLOBAL_BASE + 57856);
var tempDoublePtr = Runtime.alignMemory(allocate(12, "i8", ALLOC_STATIC), 8);
assert(tempDoublePtr % 8 == 0);
function copyTempFloat(ptr) {
 HEAP8[tempDoublePtr] = HEAP8[ptr];
 HEAP8[tempDoublePtr + 1] = HEAP8[ptr + 1];
 HEAP8[tempDoublePtr + 2] = HEAP8[ptr + 2];
 HEAP8[tempDoublePtr + 3] = HEAP8[ptr + 3];
}
function copyTempDouble(ptr) {
 HEAP8[tempDoublePtr] = HEAP8[ptr];
 HEAP8[tempDoublePtr + 1] = HEAP8[ptr + 1];
 HEAP8[tempDoublePtr + 2] = HEAP8[ptr + 2];
 HEAP8[tempDoublePtr + 3] = HEAP8[ptr + 3];
 HEAP8[tempDoublePtr + 4] = HEAP8[ptr + 4];
 HEAP8[tempDoublePtr + 5] = HEAP8[ptr + 5];
 HEAP8[tempDoublePtr + 6] = HEAP8[ptr + 6];
 HEAP8[tempDoublePtr + 7] = HEAP8[ptr + 7];
}
Module["_bitshift64Ashr"] = _bitshift64Ashr;
var _BDtoIHigh = true;
Module["_i64Subtract"] = _i64Subtract;
function ___setErrNo(value) {
 if (Module["___errno_location"]) HEAP32[Module["___errno_location"]() >> 2] = value;
 return value;
}
var ERRNO_CODES = {
 EPERM: 1,
 ENOENT: 2,
 ESRCH: 3,
 EINTR: 4,
 EIO: 5,
 ENXIO: 6,
 E2BIG: 7,
 ENOEXEC: 8,
 EBADF: 9,
 ECHILD: 10,
 EAGAIN: 11,
 EWOULDBLOCK: 11,
 ENOMEM: 12,
 EACCES: 13,
 EFAULT: 14,
 ENOTBLK: 15,
 EBUSY: 16,
 EEXIST: 17,
 EXDEV: 18,
 ENODEV: 19,
 ENOTDIR: 20,
 EISDIR: 21,
 EINVAL: 22,
 ENFILE: 23,
 EMFILE: 24,
 ENOTTY: 25,
 ETXTBSY: 26,
 EFBIG: 27,
 ENOSPC: 28,
 ESPIPE: 29,
 EROFS: 30,
 EMLINK: 31,
 EPIPE: 32,
 EDOM: 33,
 ERANGE: 34,
 ENOMSG: 42,
 EIDRM: 43,
 ECHRNG: 44,
 EL2NSYNC: 45,
 EL3HLT: 46,
 EL3RST: 47,
 ELNRNG: 48,
 EUNATCH: 49,
 ENOCSI: 50,
 EL2HLT: 51,
 EDEADLK: 35,
 ENOLCK: 37,
 EBADE: 52,
 EBADR: 53,
 EXFULL: 54,
 ENOANO: 55,
 EBADRQC: 56,
 EBADSLT: 57,
 EDEADLOCK: 35,
 EBFONT: 59,
 ENOSTR: 60,
 ENODATA: 61,
 ETIME: 62,
 ENOSR: 63,
 ENONET: 64,
 ENOPKG: 65,
 EREMOTE: 66,
 ENOLINK: 67,
 EADV: 68,
 ESRMNT: 69,
 ECOMM: 70,
 EPROTO: 71,
 EMULTIHOP: 72,
 EDOTDOT: 73,
 EBADMSG: 74,
 ENOTUNIQ: 76,
 EBADFD: 77,
 EREMCHG: 78,
 ELIBACC: 79,
 ELIBBAD: 80,
 ELIBSCN: 81,
 ELIBMAX: 82,
 ELIBEXEC: 83,
 ENOSYS: 38,
 ENOTEMPTY: 39,
 ENAMETOOLONG: 36,
 ELOOP: 40,
 EOPNOTSUPP: 95,
 EPFNOSUPPORT: 96,
 ECONNRESET: 104,
 ENOBUFS: 105,
 EAFNOSUPPORT: 97,
 EPROTOTYPE: 91,
 ENOTSOCK: 88,
 ENOPROTOOPT: 92,
 ESHUTDOWN: 108,
 ECONNREFUSED: 111,
 EADDRINUSE: 98,
 ECONNABORTED: 103,
 ENETUNREACH: 101,
 ENETDOWN: 100,
 ETIMEDOUT: 110,
 EHOSTDOWN: 112,
 EHOSTUNREACH: 113,
 EINPROGRESS: 115,
 EALREADY: 114,
 EDESTADDRREQ: 89,
 EMSGSIZE: 90,
 EPROTONOSUPPORT: 93,
 ESOCKTNOSUPPORT: 94,
 EADDRNOTAVAIL: 99,
 ENETRESET: 102,
 EISCONN: 106,
 ENOTCONN: 107,
 ETOOMANYREFS: 109,
 EUSERS: 87,
 EDQUOT: 122,
 ESTALE: 116,
 ENOTSUP: 95,
 ENOMEDIUM: 123,
 EILSEQ: 84,
 EOVERFLOW: 75,
 ECANCELED: 125,
 ENOTRECOVERABLE: 131,
 EOWNERDEAD: 130,
 ESTRPIPE: 86
};
function _sysconf(name) {
 switch (name) {
 case 30:
  return PAGE_SIZE;
 case 85:
  return totalMemory / PAGE_SIZE;
 case 132:
 case 133:
 case 12:
 case 137:
 case 138:
 case 15:
 case 235:
 case 16:
 case 17:
 case 18:
 case 19:
 case 20:
 case 149:
 case 13:
 case 10:
 case 236:
 case 153:
 case 9:
 case 21:
 case 22:
 case 159:
 case 154:
 case 14:
 case 77:
 case 78:
 case 139:
 case 80:
 case 81:
 case 82:
 case 68:
 case 67:
 case 164:
 case 11:
 case 29:
 case 47:
 case 48:
 case 95:
 case 52:
 case 51:
 case 46:
  return 200809;
 case 79:
  return 0;
 case 27:
 case 246:
 case 127:
 case 128:
 case 23:
 case 24:
 case 160:
 case 161:
 case 181:
 case 182:
 case 242:
 case 183:
 case 184:
 case 243:
 case 244:
 case 245:
 case 165:
 case 178:
 case 179:
 case 49:
 case 50:
 case 168:
 case 169:
 case 175:
 case 170:
 case 171:
 case 172:
 case 97:
 case 76:
 case 32:
 case 173:
 case 35:
  return -1;
 case 176:
 case 177:
 case 7:
 case 155:
 case 8:
 case 157:
 case 125:
 case 126:
 case 92:
 case 93:
 case 129:
 case 130:
 case 131:
 case 94:
 case 91:
  return 1;
 case 74:
 case 60:
 case 69:
 case 70:
 case 4:
  return 1024;
 case 31:
 case 42:
 case 72:
  return 32;
 case 87:
 case 26:
 case 33:
  return 2147483647;
 case 34:
 case 1:
  return 47839;
 case 38:
 case 36:
  return 99;
 case 43:
 case 37:
  return 2048;
 case 0:
  return 2097152;
 case 3:
  return 65536;
 case 28:
  return 32768;
 case 44:
  return 32767;
 case 75:
  return 16384;
 case 39:
  return 1e3;
 case 89:
  return 700;
 case 71:
  return 256;
 case 40:
  return 255;
 case 2:
  return 100;
 case 180:
  return 64;
 case 25:
  return 20;
 case 5:
  return 16;
 case 6:
  return 6;
 case 73:
  return 4;
 case 84:
  {
   if (typeof navigator === "object") return navigator["hardwareConcurrency"] || 1;
   return 1;
  }
 }
 ___setErrNo(ERRNO_CODES.EINVAL);
 return -1;
}
Module["_memset"] = _memset;
var _BDtoILow = true;
Module["_bitshift64Lshr"] = _bitshift64Lshr;
Module["_bitshift64Shl"] = _bitshift64Shl;
function _abort() {
 Module["abort"]();
}
function _emscripten_memcpy_big(dest, src, num) {
 HEAPU8.set(HEAPU8.subarray(src, src + num), dest);
 return dest;
}
Module["_memcpy"] = _memcpy;
var _llvm_pow_f64 = Math_pow;
var _cos = Math_cos;
Module["_i64Add"] = _i64Add;
function _sbrk(bytes) {
 var self = _sbrk;
 if (!self.called) {
  DYNAMICTOP = alignMemoryPage(DYNAMICTOP);
  self.called = true;
  assert(Runtime.dynamicAlloc);
  self.alloc = Runtime.dynamicAlloc;
  Runtime.dynamicAlloc = (function() {
   abort("cannot dynamically allocate, sbrk now has control");
  });
 }
 var ret = DYNAMICTOP;
 if (bytes != 0) {
  var success = self.alloc(bytes);
  if (!success) return -1 >>> 0;
 }
 return ret;
}
Module["_memmove"] = _memmove;
var _BItoD = true;
var _sqrt = Math_sqrt;
function _time(ptr) {
 var ret = Date.now() / 1e3 | 0;
 if (ptr) {
  HEAP32[ptr >> 2] = ret;
 }
 return ret;
}
function _pthread_self() {
 return 0;
}
var _sin = Math_sin;
STACK_BASE = STACKTOP = Runtime.alignMemory(STATICTOP);
staticSealed = true;
STACK_MAX = STACK_BASE + TOTAL_STACK;
DYNAMIC_BASE = DYNAMICTOP = Runtime.alignMemory(STACK_MAX);
assert(DYNAMIC_BASE < TOTAL_MEMORY, "TOTAL_MEMORY not big enough for stack");
var cttz_i8 = allocate([ 8, 0, 1, 0, 2, 0, 1, 0, 3, 0, 1, 0, 2, 0, 1, 0, 4, 0, 1, 0, 2, 0, 1, 0, 3, 0, 1, 0, 2, 0, 1, 0, 5, 0, 1, 0, 2, 0, 1, 0, 3, 0, 1, 0, 2, 0, 1, 0, 4, 0, 1, 0, 2, 0, 1, 0, 3, 0, 1, 0, 2, 0, 1, 0, 6, 0, 1, 0, 2, 0, 1, 0, 3, 0, 1, 0, 2, 0, 1, 0, 4, 0, 1, 0, 2, 0, 1, 0, 3, 0, 1, 0, 2, 0, 1, 0, 5, 0, 1, 0, 2, 0, 1, 0, 3, 0, 1, 0, 2, 0, 1, 0, 4, 0, 1, 0, 2, 0, 1, 0, 3, 0, 1, 0, 2, 0, 1, 0, 7, 0, 1, 0, 2, 0, 1, 0, 3, 0, 1, 0, 2, 0, 1, 0, 4, 0, 1, 0, 2, 0, 1, 0, 3, 0, 1, 0, 2, 0, 1, 0, 5, 0, 1, 0, 2, 0, 1, 0, 3, 0, 1, 0, 2, 0, 1, 0, 4, 0, 1, 0, 2, 0, 1, 0, 3, 0, 1, 0, 2, 0, 1, 0, 6, 0, 1, 0, 2, 0, 1, 0, 3, 0, 1, 0, 2, 0, 1, 0, 4, 0, 1, 0, 2, 0, 1, 0, 3, 0, 1, 0, 2, 0, 1, 0, 5, 0, 1, 0, 2, 0, 1, 0, 3, 0, 1, 0, 2, 0, 1, 0, 4, 0, 1, 0, 2, 0, 1, 0, 3, 0, 1, 0, 2, 0, 1, 0 ], "i8", ALLOC_DYNAMIC);
Module.asmGlobalArg = {
 "Math": Math,
 "Int8Array": Int8Array,
 "Int16Array": Int16Array,
 "Int32Array": Int32Array,
 "Uint8Array": Uint8Array,
 "Uint16Array": Uint16Array,
 "Uint32Array": Uint32Array,
 "Float32Array": Float32Array,
 "Float64Array": Float64Array,
 "NaN": NaN,
 "Infinity": Infinity,
 "byteLength": byteLength
};
Module.asmLibraryArg = {
 "abort": abort,
 "assert": assert,
 "_sin": _sin,
 "_llvm_pow_f64": _llvm_pow_f64,
 "_cos": _cos,
 "_pthread_self": _pthread_self,
 "_abort": _abort,
 "___setErrNo": ___setErrNo,
 "_sbrk": _sbrk,
 "_time": _time,
 "_emscripten_memcpy_big": _emscripten_memcpy_big,
 "_sqrt": _sqrt,
 "_sysconf": _sysconf,
 "STACKTOP": STACKTOP,
 "STACK_MAX": STACK_MAX,
 "tempDoublePtr": tempDoublePtr,
 "ABORT": ABORT,
 "cttz_i8": cttz_i8
};
// EMSCRIPTEN_START_ASM

var asm = (function(global,env,buffer) {

 "use asm";
 var a = global.Int8Array;
 var b = global.Int16Array;
 var c = global.Int32Array;
 var d = global.Uint8Array;
 var e = global.Uint16Array;
 var f = global.Uint32Array;
 var g = global.Float32Array;
 var h = global.Float64Array;
 var i = new a(buffer);
 var j = new b(buffer);
 var k = new c(buffer);
 var l = new d(buffer);
 var m = new e(buffer);
 var n = new f(buffer);
 var o = new g(buffer);
 var p = new h(buffer);
 var q = global.byteLength;
 var r = env.STACKTOP | 0;
 var s = env.STACK_MAX | 0;
 var t = env.tempDoublePtr | 0;
 var u = env.ABORT | 0;
 var v = env.cttz_i8 | 0;
 var w = 0;
 var x = 0;
 var y = 0;
 var z = 0;
 var A = global.NaN, B = global.Infinity;
 var C = 0, D = 0, E = 0, F = 0, G = 0.0, H = 0, I = 0, J = 0, K = 0.0;
 var L = 0;
 var M = 0;
 var N = 0;
 var O = 0;
 var P = 0;
 var Q = 0;
 var R = 0;
 var S = 0;
 var T = 0;
 var U = 0;
 var V = global.Math.floor;
 var W = global.Math.abs;
 var X = global.Math.sqrt;
 var Y = global.Math.pow;
 var Z = global.Math.cos;
 var _ = global.Math.sin;
 var $ = global.Math.tan;
 var aa = global.Math.acos;
 var ba = global.Math.asin;
 var ca = global.Math.atan;
 var da = global.Math.atan2;
 var ea = global.Math.exp;
 var fa = global.Math.log;
 var ga = global.Math.ceil;
 var ha = global.Math.imul;
 var ia = global.Math.min;
 var ja = global.Math.clz32;
 var ka = env.abort;
 var la = env.assert;
 var ma = env._sin;
 var na = env._llvm_pow_f64;
 var oa = env._cos;
 var pa = env._pthread_self;
 var qa = env._abort;
 var ra = env.___setErrNo;
 var sa = env._sbrk;
 var ta = env._time;
 var ua = env._emscripten_memcpy_big;
 var va = env._sqrt;
 var wa = env._sysconf;
 var xa = 0.0;
 function ya(newBuffer) {
  if (q(newBuffer) & 16777215 || q(newBuffer) <= 16777215 || q(newBuffer) > 2147483648) return false;
  i = new a(newBuffer);
  j = new b(newBuffer);
  k = new c(newBuffer);
  l = new d(newBuffer);
  m = new e(newBuffer);
  n = new f(newBuffer);
  o = new g(newBuffer);
  p = new h(newBuffer);
  buffer = newBuffer;
  return true;
 }
 
// EMSCRIPTEN_START_FUNCS

function La(a, b, c, d) {
 a = a | 0;
 b = b | 0;
 c = c | 0;
 d = d | 0;
 var e = 0, f = 0, g = 0, h = 0, n = 0, o = 0, p = 0, q = 0, s = 0, t = 0, u = 0, v = 0, w = 0, x = 0, y = 0, z = 0, A = 0, B = 0, C = 0, D = 0, E = 0, F = 0, G = 0, H = 0, I = 0, J = 0, K = 0, M = 0, N = 0, O = 0, P = 0, Q = 0, R = 0, S = 0, T = 0, U = 0, V = 0, W = 0, X = 0, Y = 0, Z = 0, _ = 0, $ = 0, aa = 0, ba = 0, ca = 0, da = 0, ea = 0, fa = 0, ga = 0, ia = 0, ja = 0, ka = 0, la = 0, ma = 0, na = 0, oa = 0, pa = 0, qa = 0, ra = 0, sa = 0, ta = 0, ua = 0, va = 0, wa = 0, xa = 0, ya = 0, za = 0, Aa = 0, Ba = 0, Ca = 0, Da = 0, Ea = 0, Fa = 0, Ga = 0, Ha = 0, Ia = 0, Ja = 0, Ka = 0, La = 0, Ma = 0, Na = 0, Oa = 0, Pa = 0;
 la = r;
 r = r + 2368 | 0;
 ka = la + 64 | 0;
 ca = la + 16 | 0;
 da = la;
 ja = a + 1096 | 0;
 ia = d + -4 | 0;
 t = ia << 3;
 fa = (t | ia | 0) < 0;
 h = fa ? 0 : c + 4 | 0;
 k[ja >> 2] = h;
 ga = a + 1108 | 0;
 k[ga >> 2] = fa ? 0 : t;
 t = a + 1100 | 0;
 k[t >> 2] = h + (fa ? 0 : ia);
 fa = a + 1104 | 0;
 c = (k[a + 1084 >> 2] | 0) == 0 ? 0 : 16;
 k[fa >> 2] = c;
 ba = a + 1136 | 0;
 n = k[ba >> 2] | 0;
 d = c >>> 3;
 e = l[h + d >> 0] | 0;
 do if (!n) {
  e = (e << 8 | l[h + (d | 1) >> 0]) >>> 7;
  k[fa >> 2] = c | 9;
  f = a + 8 | 0;
  g = k[f >> 2] | 0;
  if ((g | 0) == 2) {
   d = c | 12;
   k[fa >> 2] = d;
   c = 0;
  } else {
   d = c | 14;
   k[fa >> 2] = d;
   if ((g | 0) > 0) c = 0; else {
    aa = f;
    $ = 2;
    break;
   }
  }
  do {
   i[42136 + (c * 4840 | 0) >> 0] = 0;
   ea = d >> 3;
   ea = ((l[h + ea >> 0] << 8 | l[h + (ea + 1) >> 0]) << 16 | l[h + (ea + 2) >> 0] << 8 | l[h + (ea + 3) >> 0]) << (d & 7) >>> 28;
   d = d + 4 | 0;
   k[fa >> 2] = d;
   i[42136 + (c * 4840 | 0) + 2420 >> 0] = ea;
   c = c + 1 | 0;
  } while ((c | 0) < (g | 0));
  aa = f;
  $ = 2;
 } else {
  aa = a + 8 | 0;
  g = k[aa >> 2] | 0;
  d = g + (c | 8) | 0;
  k[fa >> 2] = d;
  $ = 1;
 } while (0);
 Z = a + 1132 | 0;
 _ = a + 1088 | 0;
 c = n;
 s = 0;
 a : while (1) {
  if ((g | 0) > 0) {
   n = c;
   q = 0;
   while (1) {
    c = d >> 3;
    c = ((l[h + c >> 0] << 8 | l[h + (c + 1) >> 0]) << 16 | l[h + (c + 2) >> 0] << 8 | l[h + (c + 3) >> 0]) << (d & 7) >>> 20;
    f = d + 12 | 0;
    k[fa >> 2] = f;
    k[42136 + (q * 4840 | 0) + (s * 2420 | 0) + 4 >> 2] = c;
    c = f >> 3;
    f = ((l[h + c >> 0] << 8 | l[h + (c + 1) >> 0]) << 16 | l[h + (c + 2) >> 0] << 8 | l[h + (c + 3) >> 0]) << (f & 7) >>> 23;
    c = d + 21 | 0;
    k[fa >> 2] = c;
    p = 42136 + (q * 4840 | 0) + (s * 2420 | 0) + 8 | 0;
    k[p >> 2] = f;
    f = c >> 3;
    c = ((l[h + f >> 0] << 8 | l[h + (f + 1) >> 0]) << 16 | l[h + (f + 2) >> 0] << 8 | l[h + (f + 3) >> 0]) << (c & 7) >>> 24;
    f = d + 29 | 0;
    k[fa >> 2] = f;
    g = 42136 + (q * 4840 | 0) + (s * 2420 | 0) + 12 | 0;
    k[g >> 2] = c;
    if ((k[Z >> 2] & 3 | 0) == 2) k[g >> 2] = c + -2;
    ea = (n | 0) == 0;
    c = f >> 3;
    c = ((l[h + c >> 0] << 8 | l[h + (c + 1) >> 0]) << 16 | l[h + (c + 2) >> 0] << 8 | l[h + (c + 3) >> 0]) << (f & 7) >>> (ea ? 28 : 23);
    k[fa >> 2] = (ea ? 33 : 38) + d;
    k[42136 + (q * 4840 | 0) + (s * 2420 | 0) + 16 >> 2] = c;
    c = k[fa >> 2] | 0;
    ea = c >> 3;
    h = k[ja >> 2] | 0;
    ea = (l[h + ea >> 0] << 8 | l[h + (ea + 1) >> 0]) << 16 | l[h + (ea + 2) >> 0] << 8 | l[h + (ea + 3) >> 0];
    d = c + 1 | 0;
    k[fa >> 2] = d;
    if (!(ea & -2147483648 >>> (c & 7))) {
     o = 42136 + (q * 4840 | 0) + (s * 2420 | 0) + 20 | 0;
     i[o >> 0] = 0;
     i[42136 + (q * 4840 | 0) + (s * 2420 | 0) + 21 >> 0] = 0;
     c = d;
     f = 0;
     while (1) {
      d = c >> 3;
      d = ((l[h + d >> 0] << 8 | l[h + (d + 1) >> 0]) << 16 | l[h + (d + 2) >> 0] << 8 | l[h + (d + 3) >> 0]) << (c & 7);
      if ((f | 0) == 3) break;
      k[fa >> 2] = c + 5;
      k[42136 + (q * 4840 | 0) + (s * 2420 | 0) + 24 + (f << 2) >> 2] = d >>> 27;
      c = k[fa >> 2] | 0;
      f = f + 1 | 0;
     }
     n = d >>> 28;
     g = c + 4 | 0;
     k[fa >> 2] = g;
     d = g >> 3;
     g = ((l[h + d >> 0] << 8 | l[h + (d + 1) >> 0]) << 16 | l[h + (d + 2) >> 0] << 8 | l[h + (d + 3) >> 0]) << (g & 7) >>> 29;
     k[fa >> 2] = c + 7;
     c = (m[53476 + ((k[_ >> 2] | 0) * 46 | 0) + (n + 1 << 1) >> 1] | 0) >>> 1;
     d = 42136 + (q * 4840 | 0) + (s * 2420 | 0) + 52 | 0;
     k[d >> 2] = c;
     g = n + 2 + g | 0;
     g = (m[53476 + ((k[_ >> 2] | 0) * 46 | 0) + (((g | 0) > 22 ? 22 : g) << 1) >> 1] | 0) >>> 1;
     n = 42136 + (q * 4840 | 0) + (s * 2420 | 0) + 56 | 0;
     k[n >> 2] = g;
     f = i[o >> 0] | 0;
    } else {
     ea = d >> 3;
     ea = ((l[h + ea >> 0] << 8 | l[h + (ea + 1) >> 0]) << 16 | l[h + (ea + 2) >> 0] << 8 | l[h + (ea + 3) >> 0]) << (d & 7) >>> 30;
     d = c + 3 | 0;
     k[fa >> 2] = d;
     f = 42136 + (q * 4840 | 0) + (s * 2420 | 0) + 20 | 0;
     i[f >> 0] = ea;
     if (!ea) {
      D = 256;
      break a;
     }
     Y = d >> 3;
     Y = ((l[h + Y >> 0] << 8 | l[h + (Y + 1) >> 0]) << 16 | l[h + (Y + 2) >> 0] << 8 | l[h + (Y + 3) >> 0]) << (d & 7) >>> 31;
     ea = c + 4 | 0;
     k[fa >> 2] = ea;
     i[42136 + (q * 4840 | 0) + (s * 2420 | 0) + 21 >> 0] = Y;
     Y = ea >> 3;
     ea = ((l[h + Y >> 0] << 8 | l[h + (Y + 1) >> 0]) << 16 | l[h + (Y + 2) >> 0] << 8 | l[h + (Y + 3) >> 0]) << (ea & 7) >>> 27;
     k[fa >> 2] = c + 9;
     k[42136 + (q * 4840 | 0) + (s * 2420 | 0) + 24 >> 2] = ea;
     ea = k[fa >> 2] | 0;
     Y = ea >> 3;
     Y = ((l[h + Y >> 0] << 8 | l[h + (Y + 1) >> 0]) << 16 | l[h + (Y + 2) >> 0] << 8 | l[h + (Y + 3) >> 0]) << (ea & 7) >>> 27;
     k[fa >> 2] = ea + 5;
     k[42136 + (q * 4840 | 0) + (s * 2420 | 0) + 28 >> 2] = Y;
     Y = k[fa >> 2] | 0;
     ea = Y >> 3;
     ea = ((l[h + ea >> 0] << 8 | l[h + (ea + 1) >> 0]) << 16 | l[h + (ea + 2) >> 0] << 8 | l[h + (ea + 3) >> 0]) << (Y & 7) >>> 29;
     k[fa >> 2] = Y + 3;
     k[42136 + (q * 4840 | 0) + (s * 2420 | 0) + 36 >> 2] = ea;
     ea = k[fa >> 2] | 0;
     Y = ea >> 3;
     h = k[ja >> 2] | 0;
     Y = ((l[h + Y >> 0] << 8 | l[h + (Y + 1) >> 0]) << 16 | l[h + (Y + 2) >> 0] << 8 | l[h + (Y + 3) >> 0]) << (ea & 7) >>> 29;
     k[fa >> 2] = ea + 3;
     k[42136 + (q * 4840 | 0) + (s * 2420 | 0) + 40 >> 2] = Y;
     Y = k[fa >> 2] | 0;
     ea = Y >> 3;
     ea = ((l[h + ea >> 0] << 8 | l[h + (ea + 1) >> 0]) << 16 | l[h + (ea + 2) >> 0] << 8 | l[h + (ea + 3) >> 0]) << (Y & 7) >>> 29;
     k[fa >> 2] = Y + 3;
     k[42136 + (q * 4840 | 0) + (s * 2420 | 0) + 44 >> 2] = ea;
     f = i[f >> 0] | 0;
     do if (f << 24 >> 24 == 2) {
      d = 42136 + (q * 4840 | 0) + (s * 2420 | 0) + 52 | 0;
      k[d >> 2] = 18;
      c = 18;
     } else {
      c = k[_ >> 2] | 0;
      if ((c | 0) < 3) {
       d = 42136 + (q * 4840 | 0) + (s * 2420 | 0) + 52 | 0;
       k[d >> 2] = 18;
       c = 18;
       break;
      }
      d = 42136 + (q * 4840 | 0) + (s * 2420 | 0) + 52 | 0;
      if ((c | 0) == 8) {
       k[d >> 2] = 54;
       c = 54;
       break;
      } else {
       k[d >> 2] = 27;
       c = 27;
       break;
      }
     } while (0);
     n = 42136 + (q * 4840 | 0) + (s * 2420 | 0) + 56 | 0;
     k[n >> 2] = 288;
     g = 288;
    }
    Y = k[p >> 2] | 0;
    X = (Y | 0) < (c | 0) ? Y : c;
    k[d >> 2] = X;
    ea = (Y | 0) < (g | 0) ? Y : g;
    k[n >> 2] = ea - X;
    k[42136 + (q * 4840 | 0) + (s * 2420 | 0) + 60 >> 2] = ((Y | 0) < 288 ? Y : 288) - ea;
    do if (f << 24 >> 24 == 2) {
     if (!(i[42136 + (q * 4840 | 0) + (s * 2420 | 0) + 21 >> 0] | 0)) {
      k[42136 + (q * 4840 | 0) + (s * 2420 | 0) + 72 >> 2] = 0;
      k[42136 + (q * 4840 | 0) + (s * 2420 | 0) + 68 >> 2] = 0;
      break;
     }
     d = k[_ >> 2] | 0;
     do if ((d | 0) < 3) k[42136 + (q * 4840 | 0) + (s * 2420 | 0) + 72 >> 2] = 8; else {
      c = 42136 + (q * 4840 | 0) + (s * 2420 | 0) + 72 | 0;
      if ((d | 0) == 8) {
       k[c >> 2] = 4;
       break;
      } else {
       k[c >> 2] = 6;
       break;
      }
     } while (0);
     k[42136 + (q * 4840 | 0) + (s * 2420 | 0) + 68 >> 2] = (d | 0) != 8 | 2;
    } else {
     k[42136 + (q * 4840 | 0) + (s * 2420 | 0) + 68 >> 2] = 13;
     k[42136 + (q * 4840 | 0) + (s * 2420 | 0) + 72 >> 2] = 22;
    } while (0);
    c = 42136 + (q * 4840 | 0) + (s * 2420 | 0) + 64 | 0;
    k[c >> 2] = 0;
    f = k[ba >> 2] | 0;
    d = k[fa >> 2] | 0;
    if (!f) {
     ea = d >> 3;
     ea = ((l[h + ea >> 0] << 8 | l[h + (ea + 1) >> 0]) << 16 | l[h + (ea + 2) >> 0] << 8 | l[h + (ea + 3) >> 0]) << (d & 7) >>> 31;
     d = d + 1 | 0;
     k[fa >> 2] = d;
     k[c >> 2] = ea;
    }
    ea = d >> 3;
    ea = ((l[h + ea >> 0] << 8 | l[h + (ea + 1) >> 0]) << 16 | l[h + (ea + 2) >> 0] << 8 | l[h + (ea + 3) >> 0]) << (d & 7) >>> 31;
    g = d + 1 | 0;
    k[fa >> 2] = g;
    i[42136 + (q * 4840 | 0) + (s * 2420 | 0) + 48 >> 0] = ea;
    ea = g >> 3;
    g = ((l[h + ea >> 0] << 8 | l[h + (ea + 1) >> 0]) << 16 | l[h + (ea + 2) >> 0] << 8 | l[h + (ea + 3) >> 0]) << (g & 7) >>> 31;
    d = d + 2 | 0;
    k[fa >> 2] = d;
    i[42136 + (q * 4840 | 0) + (s * 2420 | 0) + 49 >> 0] = g;
    q = q + 1 | 0;
    g = k[aa >> 2] | 0;
    if ((q | 0) >= (g | 0)) {
     c = f;
     break;
    } else n = f;
   }
  }
  s = s + 1 | 0;
  if ((s | 0) >= ($ | 0)) {
   D = 39;
   break;
  }
 }
 b : do if ((D | 0) == 39) {
  c = (k[ja >> 2] | 0) + (d >> 3) | 0;
  f = a + 1076 | 0;
  d = k[f >> 2] | 0;
  if ((e | 0) > (d | 0)) {
   k[f >> 2] = e;
   d = e;
  }
  g = a + 28 + d | 0;
  d = g + 24 | 0;
  do {
   i[g >> 0] = i[c >> 0] | 0;
   g = g + 1 | 0;
   c = c + 1 | 0;
  } while ((g | 0) < (d | 0));
  Y = a + 1112 | 0;
  k[Y >> 2] = k[ja >> 2];
  k[Y + 4 >> 2] = k[ja + 4 >> 2];
  k[Y + 8 >> 2] = k[ja + 8 >> 2];
  k[Y + 12 >> 2] = k[ja + 12 >> 2];
  E = k[f >> 2] | 0;
  k[ja >> 2] = E - e + (a + 28);
  k[ga >> 2] = e << 3;
  k[t >> 2] = a + 28 + E;
  k[fa >> 2] = 0;
  E = ka + 4 | 0;
  F = ka + 8 | 0;
  G = ca + 40 | 0;
  H = ca + 28 | 0;
  I = ca + 16 | 0;
  J = ca + 4 | 0;
  K = ca + 36 | 0;
  M = ca + 32 | 0;
  N = ca + 12 | 0;
  O = ca + 8 | 0;
  P = ca + 20 | 0;
  Q = ca + 44 | 0;
  R = ca + 24 | 0;
  S = ka + 64 | 0;
  T = ka + 68 | 0;
  U = da + 12 | 0;
  V = da + 8 | 0;
  W = da + 4 | 0;
  d = k[aa >> 2] | 0;
  X = 0;
  do {
   if ((d | 0) > 0) {
    c = k[fa >> 2] | 0;
    z = 0;
    do {
     e = 42136 + (z * 4840 | 0) + (X * 2420 | 0) + 76 | 0;
     do if (!(k[ba >> 2] | 0)) {
      n = k[42136 + (z * 4840 | 0) + (X * 2420 | 0) + 16 >> 2] | 0;
      d = i[59504 + n >> 0] | 0;
      s = d & 255;
      n = i[59520 + n >> 0] | 0;
      t = n & 255;
      if ((i[42136 + (z * 4840 | 0) + (X * 2420 | 0) + 20 >> 0] | 0) != 2) {
       n = 42136 + (z * 4840 | 0) + (X * 2420 | 0) | 0;
       p = 0;
       q = 0;
       while (1) {
        o = (q | 0) == 0 ? 6 : 5;
        do if (!(l[n >> 0] & 8 >>> q)) {
         d = (q | 0) < 2 ? s : t;
         if (!d) {
          Za(42136 + (z * 4840 | 0) + (X * 2420 | 0) + 76 + p | 0, 0, o | 0) | 0;
          break;
         }
         e = 32 - d | 0;
         g = 0;
         h = p;
         while (1) {
          C = k[fa >> 2] | 0;
          ea = C >> 3;
          B = k[ja >> 2] | 0;
          ea = ((l[B + ea >> 0] << 8 | l[B + (ea + 1) >> 0]) << 16 | l[B + (ea + 2) >> 0] << 8 | l[B + (ea + 3) >> 0]) << (C & 7) >>> e;
          k[fa >> 2] = C + d;
          i[42136 + (z * 4840 | 0) + (X * 2420 | 0) + 76 + h >> 0] = ea;
          g = g + 1 | 0;
          if ((g | 0) >= (o | 0)) break; else h = h + 1 | 0;
         }
        } else {
         d = 0;
         e = p;
         while (1) {
          i[42136 + (z * 4840 | 0) + (X * 2420 | 0) + 76 + e >> 0] = i[42136 + (z * 4840 | 0) + 76 + e >> 0] | 0;
          d = d + 1 | 0;
          if ((d | 0) >= (o | 0)) break; else e = e + 1 | 0;
         }
        } while (0);
        q = q + 1 | 0;
        if ((q | 0) == 4) break; else p = o + p | 0;
       }
       i[42136 + (z * 4840 | 0) + (X * 2420 | 0) + 97 >> 0] = 0;
       break;
      }
      o = (i[42136 + (z * 4840 | 0) + (X * 2420 | 0) + 21 >> 0] | 0) != 0 ? 17 : 18;
      c : do if (!(d << 24 >> 24)) Za(e | 0, 0, o | 0) | 0; else {
       d = 32 - s | 0;
       e = c;
       h = 0;
       while (1) {
        ea = e >> 3;
        g = k[ja >> 2] | 0;
        ea = ((l[g + ea >> 0] << 8 | l[g + (ea + 1) >> 0]) << 16 | l[g + (ea + 2) >> 0] << 8 | l[g + (ea + 3) >> 0]) << (e & 7) >>> d;
        k[fa >> 2] = e + s;
        g = h + 1 | 0;
        i[42136 + (z * 4840 | 0) + (X * 2420 | 0) + 76 + h >> 0] = ea;
        if ((g | 0) >= (o | 0)) break c;
        e = k[fa >> 2] | 0;
        h = g;
       }
      } while (0);
      if (!(n << 24 >> 24)) {
       g = 42136 + (z * 4840 | 0) + (X * 2420 | 0) + 76 + o | 0;
       d = g + 21 | 0;
       do {
        i[g >> 0] = 0;
        g = g + 1 | 0;
       } while ((g | 0) < (d | 0));
       break;
      }
      d = 32 - t | 0;
      e = 0;
      g = o;
      while (1) {
       C = k[fa >> 2] | 0;
       ea = C >> 3;
       B = k[ja >> 2] | 0;
       ea = ((l[B + ea >> 0] << 8 | l[B + (ea + 1) >> 0]) << 16 | l[B + (ea + 2) >> 0] << 8 | l[B + (ea + 3) >> 0]) << (C & 7) >>> d;
       k[fa >> 2] = C + t;
       i[42136 + (z * 4840 | 0) + (X * 2420 | 0) + 76 + g >> 0] = ea;
       e = e + 1 | 0;
       if ((e | 0) == 18) break; else g = g + 1 | 0;
      }
      ea = o + 18 + (42136 + (z * 4840 | 0) + (X * 2420 | 0) + 76) | 0;
      i[ea >> 0] = 0;
      i[ea + 1 >> 0] = 0;
      i[ea + 2 >> 0] = 0;
     } else {
      if ((i[42136 + (z * 4840 | 0) + (X * 2420 | 0) + 20 >> 0] | 0) == 2) s = (i[42136 + (z * 4840 | 0) + (X * 2420 | 0) + 21 >> 0] | 0) != 0 ? 2 : 1; else s = 0;
      d = k[42136 + (z * 4840 | 0) + (X * 2420 | 0) + 16 >> 2] | 0;
      do if ((z | 0) == 1 & (k[Z >> 2] & 1 | 0) != 0) {
       d = d >> 1;
       if ((d | 0) < 180) {
        k[U >> 2] = 0;
        k[V >> 2] = (d | 0) % 6 | 0;
        k[W >> 2] = ((d | 0) / 6 | 0 | 0) % 6 | 0;
        d = (d | 0) / 36 | 0;
        k[da >> 2] = d;
        q = 3;
        break;
       }
       if ((d | 0) < 244) {
        d = d + -180 | 0;
        k[U >> 2] = 0;
        k[V >> 2] = (d | 0) % 4 | 0;
        k[W >> 2] = ((d | 0) / 4 | 0 | 0) % 4 | 0;
        d = (d | 0) / 16 | 0;
        k[da >> 2] = d;
        q = 4;
        break;
       } else {
        d = d + -244 | 0;
        k[U >> 2] = 0;
        k[V >> 2] = 0;
        k[W >> 2] = (d | 0) % 3 | 0;
        d = (d | 0) / 3 | 0;
        k[da >> 2] = d;
        q = 5;
        break;
       }
      } else {
       if ((d | 0) < 400) {
        k[U >> 2] = (d | 0) % 4 | 0;
        k[V >> 2] = ((d | 0) / 4 | 0 | 0) % 4 | 0;
        k[W >> 2] = ((d | 0) / 16 | 0 | 0) % 5 | 0;
        d = (d | 0) / 80 | 0;
        k[da >> 2] = d;
        q = 0;
        break;
       }
       if ((d | 0) < 500) {
        d = d + -400 | 0;
        k[U >> 2] = 0;
        k[V >> 2] = (d | 0) % 4 | 0;
        k[W >> 2] = ((d | 0) / 4 | 0 | 0) % 5 | 0;
        d = (d | 0) / 20 | 0;
        k[da >> 2] = d;
        q = 1;
        break;
       } else {
        d = d + -500 | 0;
        k[U >> 2] = 0;
        k[V >> 2] = 0;
        k[W >> 2] = (d | 0) % 3 | 0;
        d = (d | 0) / 3 | 0;
        k[da >> 2] = d;
        k[42136 + (z * 4840 | 0) + (X * 2420 | 0) + 64 >> 2] = 1;
        q = 2;
        break;
       }
      } while (0);
      p = d;
      d = 0;
      e = 0;
      while (1) {
       g = i[59536 + (q * 12 | 0) + (s << 2) + e >> 0] | 0;
       o = g & 255;
       if (!p) {
        Za(42136 + (z * 4840 | 0) + (X * 2420 | 0) + 76 + d | 0, 0, o | 0) | 0;
        d = o + d | 0;
       } else if (g << 24 >> 24) {
        g = 32 - p | 0;
        h = 0;
        n = d;
        while (1) {
         C = k[fa >> 2] | 0;
         ea = C >> 3;
         B = k[ja >> 2] | 0;
         ea = ((l[B + ea >> 0] << 8 | l[B + (ea + 1) >> 0]) << 16 | l[B + (ea + 2) >> 0] << 8 | l[B + (ea + 3) >> 0]) << (C & 7) >>> g;
         k[fa >> 2] = C + p;
         i[42136 + (z * 4840 | 0) + (X * 2420 | 0) + 76 + n >> 0] = ea;
         h = h + 1 | 0;
         if ((h | 0) == (o | 0)) break; else n = n + 1 | 0;
        }
        d = o + d | 0;
       }
       e = e + 1 | 0;
       if ((e | 0) == 4) break;
       p = k[da + (e << 2) >> 2] | 0;
      }
      Za(42136 + (z * 4840 | 0) + (X * 2420 | 0) + 76 + d | 0, 0, 40 - d | 0) | 0;
     } while (0);
     x = k[_ >> 2] | 0;
     s = k[42136 + (z * 4840 | 0) + (X * 2420 | 0) + 12 >> 2] | 0;
     w = (l[42136 + (z * 4840 | 0) + (X * 2420 | 0) + 48 >> 0] | 0) + 1 | 0;
     o = k[42136 + (z * 4840 | 0) + (X * 2420 | 0) + 64 >> 2] | 0;
     t = k[42136 + (z * 4840 | 0) + (X * 2420 | 0) + 72 >> 2] | 0;
     if ((t | 0) > 0) {
      p = s + 190 | 0;
      d = 56712;
      q = 0;
      do {
       e = i[57928 + (x * 22 | 0) + q >> 0] | 0;
       if (e << 24 >> 24) {
        e = e & 255;
        g = p - ((l[42136 + (z * 4840 | 0) + (X * 2420 | 0) + 76 + q >> 0] | 0) + (l[59608 + (o * 22 | 0) + q >> 0] | 0) << w) & 65535;
        h = d;
        n = e;
        while (1) {
         j[h >> 1] = g;
         if ((n | 0) > 1) {
          h = h + 2 | 0;
          n = n + -1 | 0;
         } else break;
        }
        d = d + (e << 1) | 0;
       }
       q = q + 1 | 0;
      } while ((q | 0) != (t | 0));
     } else d = 56712;
     e = k[42136 + (z * 4840 | 0) + (X * 2420 | 0) + 68 >> 2] | 0;
     if ((e | 0) < 13) {
      v = s + 190 | 0;
      s = v - (k[42136 + (z * 4840 | 0) + (X * 2420 | 0) + 36 >> 2] << 3) | 0;
      u = v - (k[42136 + (z * 4840 | 0) + (X * 2420 | 0) + 40 >> 2] << 3) | 0;
      v = v - (k[42136 + (z * 4840 | 0) + (X * 2420 | 0) + 44 >> 2] << 3) | 0;
      while (1) {
       ea = i[59652 + (x * 13 | 0) + e >> 0] | 0;
       g = ea & 255;
       ea = ea << 24 >> 24 == 0;
       p = ea ? ~g : -2;
       q = t + 1 | 0;
       if (!ea) {
        h = s - (l[42136 + (z * 4840 | 0) + (X * 2420 | 0) + 76 + t >> 0] << w) & 65535;
        n = d;
        o = g;
        while (1) {
         j[n >> 1] = h;
         if ((o | 0) > 1) {
          n = n + 2 | 0;
          o = o + -1 | 0;
         } else break;
        }
        p = g + 2 + p | 0;
        h = u - (l[42136 + (z * 4840 | 0) + (X * 2420 | 0) + 76 + q >> 0] << w) & 65535;
        n = d + (p << 1) | 0;
        o = g;
        while (1) {
         j[n >> 1] = h;
         if ((o | 0) > 1) {
          n = n + 2 | 0;
          o = o + -1 | 0;
         } else break;
        }
        h = v - (l[t + 2 + (42136 + (z * 4840 | 0) + (X * 2420 | 0) + 76) >> 0] << w) & 65535;
        n = d + (p << 1 << 1) | 0;
        while (1) {
         j[n >> 1] = h;
         if ((g | 0) > 1) {
          n = n + 2 | 0;
          g = g + -1 | 0;
         } else break;
        }
        d = d + (p * 3 << 1) | 0;
       }
       e = e + 1 | 0;
       if ((e | 0) == 13) break; else t = t + 3 | 0;
      }
     }
     c = (k[42136 + (z * 4840 | 0) + (X * 2420 | 0) + 4 >> 2] | 0) + c | 0;
     g = k[ga >> 2] | 0;
     g = (g | 0) > (c | 0) ? c : g;
     d = 0;
     y = 0;
     do {
      n = k[42136 + (z * 4840 | 0) + (X * 2420 | 0) + 52 + (y << 2) >> 2] | 0;
      d : do if (n) {
       h = k[42136 + (z * 4840 | 0) + (X * 2420 | 0) + 24 + (y << 2) >> 2] | 0;
       e = l[59769 + (h << 1) >> 0] | 0;
       x = l[59769 + (h << 1) + 1 >> 0] | 0;
       if (16401 >>> h & 1) {
        Za(42136 + (z * 4840 | 0) + (X * 2420 | 0) + 116 + (d << 2) | 0, 0, n << 3 | 0) | 0;
        d = (n << 1) + d | 0;
        break;
       }
       if ((n | 0) > 0) {
        w = 5328 + (e << 4) + 4 | 0;
        u = h >>> 0 < 16;
        v = 32 - x | 0;
        while (1) {
         e = k[fa >> 2] | 0;
         if ((e | 0) >= (g | 0)) {
          do if (k[Y >> 2] | 0) {
           if ((e | 0) < (k[ga >> 2] | 0)) break;
           k[ja >> 2] = k[Y >> 2];
           k[ja + 4 >> 2] = k[Y + 4 >> 2];
           k[ja + 8 >> 2] = k[Y + 8 >> 2];
           k[ja + 12 >> 2] = k[Y + 12 >> 2];
           k[Y >> 2] = 0;
           g = (k[fa >> 2] | 0) + (e - g) | 0;
           k[fa >> 2] = g;
           c = g + (c - e) | 0;
           e = g;
           g = c;
          } while (0);
          if ((e | 0) >= (g | 0)) break d;
         }
         q = k[w >> 2] | 0;
         ea = e >> 3;
         t = k[ja >> 2] | 0;
         ea = ((l[t + ea >> 0] << 8 | l[t + (ea + 1) >> 0]) << 16 | l[t + (ea + 2) >> 0] << 8 | l[t + (ea + 3) >> 0]) << (e & 7) >>> 25;
         h = j[q + (ea << 2) >> 1] | 0;
         ea = j[q + (ea << 2) + 2 >> 1] | 0;
         o = ea << 16 >> 16;
         if (ea << 16 >> 16 < 0) {
          e = e + 7 | 0;
          ea = e >> 3;
          ea = (((l[t + ea >> 0] << 8 | l[t + (ea + 1) >> 0]) << 16 | l[t + (ea + 2) >> 0] << 8 | l[t + (ea + 3) >> 0]) << (e & 7) >>> (o + 32 | 0)) + h | 0;
          h = j[q + (ea << 2) >> 1] | 0;
          ea = j[q + (ea << 2) + 2 >> 1] | 0;
          p = ea << 16 >> 16;
          if (ea << 16 >> 16 < 0) {
           e = e - o | 0;
           o = e >> 3;
           o = (((l[t + o >> 0] << 8 | l[t + (o + 1) >> 0]) << 16 | l[t + (o + 2) >> 0] << 8 | l[t + (o + 3) >> 0]) << (e & 7) >>> (p + 32 | 0)) + h | 0;
           h = j[q + (o << 2) >> 1] | 0;
           o = j[q + (o << 2) + 2 >> 1] | 0;
          } else o = p;
         }
         o = o + e | 0;
         k[fa >> 2] = o;
         do if (!h) {
          k[42136 + (z * 4840 | 0) + (X * 2420 | 0) + 116 + (d + 1 << 2) >> 2] = 0;
          k[42136 + (z * 4840 | 0) + (X * 2420 | 0) + 116 + (d << 2) >> 2] = 0;
         } else {
          q = j[56712 + (d << 1) >> 1] | 0;
          p = h >> 5;
          s = h & 15;
          if (!(h & 16)) {
           h = p + s | 0;
           do if ((h | 0) < 15) e = k[5624 + (q << 6) + (h << 2) >> 2] | 0; else {
            if (u) e = 0; else {
             e = o >> 3;
             e = ((l[t + e >> 0] << 8 | l[t + (e + 1) >> 0]) << 16 | l[t + (e + 2) >> 0] << 8 | l[t + (e + 3) >> 0]) << (o & 7) >>> v;
             o = o + x | 0;
             k[fa >> 2] = o;
            }
            h = e + h << 2 | q & 3;
            e = (i[(k[1404] | 0) + h >> 0] | 0) - (q >> 2) | 0;
            if ((e | 0) > 31) {
             e = 0;
             break;
            }
            e = ((k[(k[1405] | 0) + (h << 2) >> 2] | 0) + (1 << e + -1) | 0) >>> e;
           } while (0);
           C = l[t + (o >> 3) >> 0] | 0;
           k[fa >> 2] = o + 1;
           ea = (s | 0) != 0 & 1;
           k[42136 + (z * 4840 | 0) + (X * 2420 | 0) + 116 + (ea + d << 2) >> 2] = (C & 128 >>> (o & 7) | 0) == 0 ? e : 0 - e | 0;
           k[42136 + (z * 4840 | 0) + (X * 2420 | 0) + 116 + ((ea ^ 1) + d << 2) >> 2] = 0;
           break;
          }
          do if ((p | 0) < 15) e = k[5624 + (q << 6) + (p << 2) >> 2] | 0; else {
           if (u) e = 0; else {
            e = o >> 3;
            e = ((l[t + e >> 0] << 8 | l[t + (e + 1) >> 0]) << 16 | l[t + (e + 2) >> 0] << 8 | l[t + (e + 3) >> 0]) << (o & 7) >>> v;
            o = o + x | 0;
            k[fa >> 2] = o;
           }
           e = e + p << 2 | q & 3;
           h = (i[(k[1404] | 0) + e >> 0] | 0) - (q >> 2) | 0;
           if ((h | 0) > 31) {
            e = 0;
            break;
           }
           e = ((k[(k[1405] | 0) + (e << 2) >> 2] | 0) + (1 << h + -1) | 0) >>> h;
          } while (0);
          ea = l[t + (o >> 3) >> 0] | 0;
          k[fa >> 2] = o + 1;
          k[42136 + (z * 4840 | 0) + (X * 2420 | 0) + 116 + (d << 2) >> 2] = (ea & 128 >>> (o & 7) | 0) == 0 ? e : 0 - e | 0;
          do if ((s | 0) == 15) {
           if (u) e = 0; else {
            ea = k[fa >> 2] | 0;
            e = ea >> 3;
            e = ((l[t + e >> 0] << 8 | l[t + (e + 1) >> 0]) << 16 | l[t + (e + 2) >> 0] << 8 | l[t + (e + 3) >> 0]) << (ea & 7) >>> v;
            k[fa >> 2] = ea + x;
           }
           h = (e << 2) + 60 | q & 3;
           e = (i[(k[1404] | 0) + h >> 0] | 0) - (q >> 2) | 0;
           if ((e | 0) > 31) {
            e = 0;
            break;
           }
           e = ((k[(k[1405] | 0) + (h << 2) >> 2] | 0) + (1 << e + -1) | 0) >>> e;
          } else e = k[5624 + (q << 6) + (s << 2) >> 2] | 0; while (0);
          ea = k[fa >> 2] | 0;
          C = l[t + (ea >> 3) >> 0] | 0;
          k[fa >> 2] = ea + 1;
          k[42136 + (z * 4840 | 0) + (X * 2420 | 0) + 116 + (d + 1 << 2) >> 2] = (C & 128 >>> (ea & 7) | 0) == 0 ? e : 0 - e | 0;
         } while (0);
         d = d + 2 | 0;
         if ((n | 0) > 1) n = n + -1 | 0; else break;
        }
       }
      } while (0);
      y = y + 1 | 0;
     } while ((y | 0) != 3);
     e = l[42136 + (z * 4840 | 0) + (X * 2420 | 0) + 49 >> 0] | 0;
     e : do if ((d | 0) < 573) {
      q = 5584 + (e << 4) + 4 | 0;
      p = 5584 + (e << 4) | 0;
      h = g;
      e = 0;
      while (1) {
       g = k[fa >> 2] | 0;
       if ((g | 0) < (h | 0)) {
        e = g;
        g = h;
       } else {
        if ((e | 0) != 0 & (c | 0) < (g | 0)) {
         g = h;
         break;
        }
        if (!(k[Y >> 2] | 0)) {
         e = g;
         g = h;
        } else if ((g | 0) < (k[ga >> 2] | 0)) {
         e = g;
         g = h;
        } else {
         k[ja >> 2] = k[Y >> 2];
         k[ja + 4 >> 2] = k[Y + 4 >> 2];
         k[ja + 8 >> 2] = k[Y + 8 >> 2];
         k[ja + 12 >> 2] = k[Y + 12 >> 2];
         k[Y >> 2] = 0;
         e = (k[fa >> 2] | 0) + (g - h) | 0;
         k[fa >> 2] = e;
         c = e + (c - g) | 0;
         g = c;
        }
        if ((e | 0) >= (g | 0)) break e;
       }
       C = k[q >> 2] | 0;
       ea = e >> 3;
       o = k[ja >> 2] | 0;
       ea = ((l[o + ea >> 0] << 8 | l[o + (ea + 1) >> 0]) << 16 | l[o + (ea + 2) >> 0] << 8 | l[o + (ea + 3) >> 0]) << (e & 7) >>> (32 - (k[p >> 2] | 0) | 0);
       h = j[C + (ea << 2) >> 1] | 0;
       k[fa >> 2] = (j[C + (ea << 2) + 2 >> 1] | 0) + e;
       k[42136 + (z * 4840 | 0) + (X * 2420 | 0) + 116 + (d + 3 << 2) >> 2] = 0;
       k[42136 + (z * 4840 | 0) + (X * 2420 | 0) + 116 + (d + 2 << 2) >> 2] = 0;
       k[42136 + (z * 4840 | 0) + (X * 2420 | 0) + 116 + (d + 1 << 2) >> 2] = 0;
       k[42136 + (z * 4840 | 0) + (X * 2420 | 0) + 116 + (d << 2) >> 2] = 0;
       if (h << 16 >> 16) {
        n = h << 16 >> 16;
        while (1) {
         h = k[51816 + (n << 2) >> 2] | 0;
         ea = h + d | 0;
         h = 8 >>> h;
         C = k[38392 + (j[56712 + (ea << 1) >> 1] << 2) >> 2] | 0;
         B = k[fa >> 2] | 0;
         A = l[o + (B >> 3) >> 0] | 0;
         k[fa >> 2] = B + 1;
         k[42136 + (z * 4840 | 0) + (X * 2420 | 0) + 116 + (ea << 2) >> 2] = (A & 128 >>> (B & 7) | 0) == 0 ? C : 0 - C | 0;
         if ((h | 0) == (n | 0)) break; else n = h ^ n;
        }
       }
       d = d + 4 | 0;
       if ((d | 0) < 573) h = g; else break e;
      }
      k[fa >> 2] = e;
      d = d + -4 | 0;
     } while (0);
     Za(42136 + (z * 4840 | 0) + (X * 2420 | 0) + 116 + (d << 2) | 0, 0, 576 - d << 2 | 0) | 0;
     if ((c | 0) < (k[fa >> 2] | 0)) {
      ea = -1;
      e = Y;
      d = Y;
      break b;
     }
     k[fa >> 2] = c;
     if (k[Y >> 2] | 0) if ((c | 0) >= (k[ga >> 2] | 0)) {
      k[ja >> 2] = k[Y >> 2];
      k[ja + 4 >> 2] = k[Y + 4 >> 2];
      k[ja + 8 >> 2] = k[Y + 8 >> 2];
      k[ja + 12 >> 2] = k[Y + 12 >> 2];
      k[Y >> 2] = 0;
      c = (k[fa >> 2] | 0) + (c - g) | 0;
      k[fa >> 2] = c;
     }
     z = z + 1 | 0;
     d = k[aa >> 2] | 0;
    } while ((z | 0) < (d | 0));
    if ((d | 0) == 2) {
     d = k[Z >> 2] | 0;
     f : do if (!(d & 1)) {
      if (d & 2) {
       d = 0;
       do {
        A = 42136 + (X * 2420 | 0) + 116 + (d << 2) | 0;
        B = k[A >> 2] | 0;
        ea = 46976 + (X * 2420 | 0) + 116 + (d << 2) | 0;
        C = k[ea >> 2] | 0;
        k[A >> 2] = C + B;
        k[ea >> 2] = B - C;
        d = d + 1 | 0;
       } while ((d | 0) != 576);
      }
     } else {
      if (!(k[ba >> 2] | 0)) {
       B = 40440;
       C = 7;
      } else {
       B = 40568 + ((k[46976 + (X * 2420 | 0) + 16 >> 2] & 1) << 7) | 0;
       C = 16;
      }
      c = 42136 + (X * 2420 | 0) + 2420 | 0;
      e = 46976 + (X * 2420 | 0) + 2420 | 0;
      k[ka >> 2] = 0;
      k[E >> 2] = 0;
      k[F >> 2] = 0;
      y = 46976 + (X * 2420 | 0) + 68 | 0;
      A = 46976 + (X * 2420 | 0) + 72 | 0;
      d = k[y >> 2] | 0;
      if ((d | 0) <= 12) {
       z = 12;
       x = ((13 - d | 0) * 3 | 0) + -3 + (k[A >> 2] | 0) | 0;
       d = c;
       while (1) {
        x = (z | 0) == 11 ? x : x + -3 | 0;
        s = i[59652 + ((k[_ >> 2] | 0) * 13 | 0) + z >> 0] | 0;
        p = s & 255;
        q = 0 - p | 0;
        s = s << 24 >> 24 == 0;
        t = 2;
        u = d;
        w = e;
        while (1) {
         v = u;
         u = u + (q << 2) | 0;
         c = ka + (t << 2) | 0;
         g : do if (!(k[c >> 2] | 0)) {
          h : do if (!s) {
           g = 0;
           while (1) {
            if (k[w + (g - p << 2) >> 2] | 0) break;
            g = g + 1 | 0;
            if ((g | 0) >= (p | 0)) break h;
           }
           k[c >> 2] = 1;
           D = 179;
           break g;
          } while (0);
          c = l[t + x + (46976 + (X * 2420 | 0) + 76) >> 0] | 0;
          if (c >>> 0 < C >>> 0) {
           if (!s) {
            o = k[B + 64 + (c << 2) >> 2] | 0;
            c = k[B + (c << 2) >> 2] | 0;
            g = ((c | 0) < 0) << 31 >> 31;
            h = ((o | 0) < 0) << 31 >> 31;
            n = 0;
            do {
             ea = n - p | 0;
             oa = v + (ea << 2) | 0;
             na = k[oa >> 2] | 0;
             ma = ((na | 0) < 0) << 31 >> 31;
             pa = hb(na | 0, ma | 0, c | 0, g | 0) | 0;
             pa = _a(pa | 0, L | 0, 15) | 0;
             k[oa >> 2] = pa;
             ma = hb(na | 0, ma | 0, o | 0, h | 0) | 0;
             ma = _a(ma | 0, L | 0, 15) | 0;
             k[w + (ea << 2) >> 2] = ma;
             n = n + 1 | 0;
            } while ((n | 0) != (p | 0));
           }
          } else D = 179;
         } else D = 179; while (0);
         if ((D | 0) == 179) {
          D = 0;
          if (!(s | (k[Z >> 2] & 2 | 0) == 0)) {
           c = 0;
           do {
            pa = c - p | 0;
            ma = v + (pa << 2) | 0;
            na = k[ma >> 2] | 0;
            pa = w + (pa << 2) | 0;
            oa = k[pa >> 2] | 0;
            ea = oa + na | 0;
            ea = hb(ea | 0, ((ea | 0) < 0) << 31 >> 31 | 0, 23170, 0) | 0;
            ea = _a(ea | 0, L | 0, 15) | 0;
            k[ma >> 2] = ea;
            oa = na - oa | 0;
            oa = hb(oa | 0, ((oa | 0) < 0) << 31 >> 31 | 0, 23170, 0) | 0;
            oa = _a(oa | 0, L | 0, 15) | 0;
            k[pa >> 2] = oa;
            c = c + 1 | 0;
           } while ((c | 0) != (p | 0));
          }
         }
         w = w + (q << 2) | 0;
         if ((t | 0) <= 0) break; else t = t + -1 | 0;
        }
        pa = ha(p, -3) | 0;
        e = e + (pa << 2) | 0;
        d = d + (pa << 2) | 0;
        if ((z | 0) <= (k[y >> 2] | 0)) {
         c = d;
         break;
        } else z = z + -1 | 0;
       }
      }
      d = k[A >> 2] | 0;
      if ((d | 0) > 0) {
       q = k[ka >> 2] | k[E >> 2] | k[F >> 2];
       do {
        v = (q | 0) == 0;
        i : while (1) {
         w = d;
         d = d + -1 | 0;
         o = i[57928 + ((k[_ >> 2] | 0) * 22 | 0) + d >> 0] | 0;
         u = o & 255;
         pa = 0 - u | 0;
         n = c;
         c = c + (pa << 2) | 0;
         h = e;
         e = e + (pa << 2) | 0;
         if (!v) {
          s = u;
          p = w;
          break;
         }
         p = o << 24 >> 24 == 0;
         if (!p) {
          g = 0;
          do {
           if (k[h + (g - u << 2) >> 2] | 0) {
            s = u;
            p = w;
            q = 1;
            break i;
           }
           g = g + 1 | 0;
          } while ((g | 0) < (u | 0));
         }
         g = l[((d | 0) == 21 ? 20 : d) + (46976 + (X * 2420 | 0) + 76) >> 0] | 0;
         if (g >>> 0 >= C >>> 0) {
          s = u;
          p = w;
          break;
         }
         if (!p) {
          t = k[B + 64 + (g << 2) >> 2] | 0;
          g = k[B + (g << 2) >> 2] | 0;
          o = ((g | 0) < 0) << 31 >> 31;
          p = ((t | 0) < 0) << 31 >> 31;
          s = 0;
          do {
           pa = s - u | 0;
           ma = n + (pa << 2) | 0;
           na = k[ma >> 2] | 0;
           oa = ((na | 0) < 0) << 31 >> 31;
           ea = hb(na | 0, oa | 0, g | 0, o | 0) | 0;
           ea = _a(ea | 0, L | 0, 15) | 0;
           k[ma >> 2] = ea;
           oa = hb(na | 0, oa | 0, t | 0, p | 0) | 0;
           oa = _a(oa | 0, L | 0, 15) | 0;
           k[h + (pa << 2) >> 2] = oa;
           s = s + 1 | 0;
          } while ((s | 0) != (u | 0));
         }
         if ((w | 0) <= 1) break f;
        }
        if (!(o << 24 >> 24 == 0 | (k[Z >> 2] & 2 | 0) == 0)) {
         g = 0;
         do {
          pa = g - s | 0;
          ma = n + (pa << 2) | 0;
          na = k[ma >> 2] | 0;
          pa = h + (pa << 2) | 0;
          oa = k[pa >> 2] | 0;
          ea = oa + na | 0;
          ea = hb(ea | 0, ((ea | 0) < 0) << 31 >> 31 | 0, 23170, 0) | 0;
          ea = _a(ea | 0, L | 0, 15) | 0;
          k[ma >> 2] = ea;
          oa = na - oa | 0;
          oa = hb(oa | 0, ((oa | 0) < 0) << 31 >> 31 | 0, 23170, 0) | 0;
          oa = _a(oa | 0, L | 0, 15) | 0;
          k[pa >> 2] = oa;
          g = g + 1 | 0;
         } while ((g | 0) < (s | 0));
        }
       } while ((p | 0) > 1);
      }
     } while (0);
     d = k[aa >> 2] | 0;
    }
    if ((d | 0) > 0) {
     B = X * 18 | 0;
     C = 0;
     do {
      z = 42136 + (C * 4840 | 0) + (X * 2420 | 0) + 20 | 0;
      do if ((i[z >> 0] | 0) == 2) {
       p = 42136 + (C * 4840 | 0) + (X * 2420 | 0) + 21 | 0;
       d = i[p >> 0] | 0;
       do if (!(d << 24 >> 24)) e = 42136 + (C * 4840 | 0) + (X * 2420 | 0) + 116 | 0; else if ((k[_ >> 2] | 0) == 8) {
        e = 42136 + (C * 4840 | 0) + (X * 2420 | 0) + 308 | 0;
        break;
       } else {
        e = 42136 + (C * 4840 | 0) + (X * 2420 | 0) + 260 | 0;
        break;
       } while (0);
       c = k[42136 + (C * 4840 | 0) + (X * 2420 | 0) + 68 >> 2] | 0;
       if ((c | 0) < 13) {
        while (1) {
         pa = i[59652 + ((k[_ >> 2] | 0) * 13 | 0) + c >> 0] | 0;
         o = pa & 255;
         n = o << 1;
         if (!(pa << 24 >> 24)) d = e; else {
          d = ka;
          g = o;
          h = e;
          while (1) {
           k[d >> 2] = k[h >> 2];
           k[d + 4 >> 2] = k[h + (o << 2) >> 2];
           k[d + 8 >> 2] = k[h + (n << 2) >> 2];
           if ((g | 0) > 1) {
            d = d + 12 | 0;
            g = g + -1 | 0;
            h = h + 4 | 0;
           } else break;
          }
          d = e + (o << 2) | 0;
         }
         ab(e | 0, ka | 0, o * 12 | 0) | 0;
         c = c + 1 | 0;
         if ((c | 0) == 13) break; else e = d + (n << 2) | 0;
        }
        if ((i[z >> 0] | 0) != 2) {
         d = 31;
         D = 219;
         break;
        }
        d = i[p >> 0] | 0;
       }
       if (d << 24 >> 24) {
        d = 1;
        D = 219;
       }
      } else {
       d = 31;
       D = 219;
      } while (0);
      if ((D | 0) == 219) {
       D = 0;
       c = 42136 + (C * 4840 | 0) + (X * 2420 | 0) + 188 | 0;
       while (1) {
        A = c + -4 | 0;
        pa = k[A >> 2] | 0;
        oa = k[c >> 2] | 0;
        ea = oa + pa | 0;
        ma = k[10214] | 0;
        ma = hb(ea | 0, ((ea | 0) < 0) << 31 >> 31 | 0, ma | 0, ((ma | 0) < 0) << 31 >> 31 | 0) | 0;
        ma = Xa(ma | 0, L | 0, 32) | 0;
        ea = L;
        na = k[10216] | 0;
        oa = hb(na | 0, ((na | 0) < 0) << 31 >> 31 | 0, oa | 0, ((oa | 0) < 0) << 31 >> 31 | 0) | 0;
        oa = Xa(oa | 0, L | 0, 32) | 0;
        oa = Ya(ma | 0, ea | 0, oa | 0, L | 0) | 0;
        oa = $a(oa | 0, L | 0, 2) | 0;
        k[A >> 2] = oa;
        A = k[10217] | 0;
        pa = hb(A | 0, ((A | 0) < 0) << 31 >> 31 | 0, pa | 0, ((pa | 0) < 0) << 31 >> 31 | 0) | 0;
        pa = Xa(pa | 0, L | 0, 32) | 0;
        ea = bb(pa | 0, L | 0, ma | 0, ea | 0) | 0;
        ea = $a(ea | 0, L | 0, 2) | 0;
        k[c >> 2] = ea;
        ea = c + -8 | 0;
        ma = k[ea >> 2] | 0;
        pa = c + 4 | 0;
        A = k[pa >> 2] | 0;
        oa = A + ma | 0;
        na = k[10218] | 0;
        na = hb(oa | 0, ((oa | 0) < 0) << 31 >> 31 | 0, na | 0, ((na | 0) < 0) << 31 >> 31 | 0) | 0;
        na = Xa(na | 0, L | 0, 32) | 0;
        oa = L;
        y = k[10220] | 0;
        A = hb(y | 0, ((y | 0) < 0) << 31 >> 31 | 0, A | 0, ((A | 0) < 0) << 31 >> 31 | 0) | 0;
        A = Xa(A | 0, L | 0, 32) | 0;
        A = Ya(na | 0, oa | 0, A | 0, L | 0) | 0;
        A = $a(A | 0, L | 0, 2) | 0;
        k[ea >> 2] = A;
        ea = k[10221] | 0;
        ma = hb(ea | 0, ((ea | 0) < 0) << 31 >> 31 | 0, ma | 0, ((ma | 0) < 0) << 31 >> 31 | 0) | 0;
        ma = Xa(ma | 0, L | 0, 32) | 0;
        oa = bb(ma | 0, L | 0, na | 0, oa | 0) | 0;
        oa = $a(oa | 0, L | 0, 2) | 0;
        k[pa >> 2] = oa;
        pa = c + -12 | 0;
        oa = k[pa >> 2] | 0;
        na = c + 8 | 0;
        ma = k[na >> 2] | 0;
        ea = ma + oa | 0;
        A = k[10222] | 0;
        A = hb(ea | 0, ((ea | 0) < 0) << 31 >> 31 | 0, A | 0, ((A | 0) < 0) << 31 >> 31 | 0) | 0;
        A = Xa(A | 0, L | 0, 32) | 0;
        ea = L;
        y = k[10224] | 0;
        ma = hb(y | 0, ((y | 0) < 0) << 31 >> 31 | 0, ma | 0, ((ma | 0) < 0) << 31 >> 31 | 0) | 0;
        ma = Xa(ma | 0, L | 0, 32) | 0;
        ma = Ya(A | 0, ea | 0, ma | 0, L | 0) | 0;
        ma = $a(ma | 0, L | 0, 2) | 0;
        k[pa >> 2] = ma;
        pa = k[10225] | 0;
        oa = hb(pa | 0, ((pa | 0) < 0) << 31 >> 31 | 0, oa | 0, ((oa | 0) < 0) << 31 >> 31 | 0) | 0;
        oa = Xa(oa | 0, L | 0, 32) | 0;
        ea = bb(oa | 0, L | 0, A | 0, ea | 0) | 0;
        ea = $a(ea | 0, L | 0, 2) | 0;
        k[na >> 2] = ea;
        na = c + -16 | 0;
        ea = k[na >> 2] | 0;
        A = c + 12 | 0;
        oa = k[A >> 2] | 0;
        pa = oa + ea | 0;
        ma = k[10226] | 0;
        ma = hb(pa | 0, ((pa | 0) < 0) << 31 >> 31 | 0, ma | 0, ((ma | 0) < 0) << 31 >> 31 | 0) | 0;
        ma = Xa(ma | 0, L | 0, 32) | 0;
        pa = L;
        y = k[10228] | 0;
        oa = hb(y | 0, ((y | 0) < 0) << 31 >> 31 | 0, oa | 0, ((oa | 0) < 0) << 31 >> 31 | 0) | 0;
        oa = Xa(oa | 0, L | 0, 32) | 0;
        oa = Ya(ma | 0, pa | 0, oa | 0, L | 0) | 0;
        oa = $a(oa | 0, L | 0, 2) | 0;
        k[na >> 2] = oa;
        na = k[10229] | 0;
        ea = hb(na | 0, ((na | 0) < 0) << 31 >> 31 | 0, ea | 0, ((ea | 0) < 0) << 31 >> 31 | 0) | 0;
        ea = Xa(ea | 0, L | 0, 32) | 0;
        pa = bb(ea | 0, L | 0, ma | 0, pa | 0) | 0;
        pa = $a(pa | 0, L | 0, 2) | 0;
        k[A >> 2] = pa;
        A = c + -20 | 0;
        pa = k[A >> 2] | 0;
        ma = c + 16 | 0;
        ea = k[ma >> 2] | 0;
        na = ea + pa | 0;
        oa = k[10230] | 0;
        oa = hb(na | 0, ((na | 0) < 0) << 31 >> 31 | 0, oa | 0, ((oa | 0) < 0) << 31 >> 31 | 0) | 0;
        oa = Xa(oa | 0, L | 0, 32) | 0;
        na = L;
        y = k[10232] | 0;
        ea = hb(y | 0, ((y | 0) < 0) << 31 >> 31 | 0, ea | 0, ((ea | 0) < 0) << 31 >> 31 | 0) | 0;
        ea = Xa(ea | 0, L | 0, 32) | 0;
        ea = Ya(oa | 0, na | 0, ea | 0, L | 0) | 0;
        ea = $a(ea | 0, L | 0, 2) | 0;
        k[A >> 2] = ea;
        A = k[10233] | 0;
        pa = hb(A | 0, ((A | 0) < 0) << 31 >> 31 | 0, pa | 0, ((pa | 0) < 0) << 31 >> 31 | 0) | 0;
        pa = Xa(pa | 0, L | 0, 32) | 0;
        na = bb(pa | 0, L | 0, oa | 0, na | 0) | 0;
        na = $a(na | 0, L | 0, 2) | 0;
        k[ma >> 2] = na;
        ma = c + -24 | 0;
        na = k[ma >> 2] | 0;
        oa = c + 20 | 0;
        pa = k[oa >> 2] | 0;
        A = pa + na | 0;
        ea = k[10234] | 0;
        ea = hb(A | 0, ((A | 0) < 0) << 31 >> 31 | 0, ea | 0, ((ea | 0) < 0) << 31 >> 31 | 0) | 0;
        ea = Xa(ea | 0, L | 0, 32) | 0;
        A = L;
        y = k[10236] | 0;
        pa = hb(y | 0, ((y | 0) < 0) << 31 >> 31 | 0, pa | 0, ((pa | 0) < 0) << 31 >> 31 | 0) | 0;
        pa = Xa(pa | 0, L | 0, 32) | 0;
        pa = Ya(ea | 0, A | 0, pa | 0, L | 0) | 0;
        pa = $a(pa | 0, L | 0, 2) | 0;
        k[ma >> 2] = pa;
        ma = k[10237] | 0;
        na = hb(ma | 0, ((ma | 0) < 0) << 31 >> 31 | 0, na | 0, ((na | 0) < 0) << 31 >> 31 | 0) | 0;
        na = Xa(na | 0, L | 0, 32) | 0;
        A = bb(na | 0, L | 0, ea | 0, A | 0) | 0;
        A = $a(A | 0, L | 0, 2) | 0;
        k[oa >> 2] = A;
        oa = c + -28 | 0;
        A = k[oa >> 2] | 0;
        ea = c + 24 | 0;
        na = k[ea >> 2] | 0;
        ma = na + A | 0;
        pa = k[10238] | 0;
        pa = hb(ma | 0, ((ma | 0) < 0) << 31 >> 31 | 0, pa | 0, ((pa | 0) < 0) << 31 >> 31 | 0) | 0;
        pa = Xa(pa | 0, L | 0, 32) | 0;
        ma = L;
        y = k[10240] | 0;
        na = hb(y | 0, ((y | 0) < 0) << 31 >> 31 | 0, na | 0, ((na | 0) < 0) << 31 >> 31 | 0) | 0;
        na = Xa(na | 0, L | 0, 32) | 0;
        na = Ya(pa | 0, ma | 0, na | 0, L | 0) | 0;
        na = $a(na | 0, L | 0, 2) | 0;
        k[oa >> 2] = na;
        oa = k[10241] | 0;
        A = hb(oa | 0, ((oa | 0) < 0) << 31 >> 31 | 0, A | 0, ((A | 0) < 0) << 31 >> 31 | 0) | 0;
        A = Xa(A | 0, L | 0, 32) | 0;
        ma = bb(A | 0, L | 0, pa | 0, ma | 0) | 0;
        ma = $a(ma | 0, L | 0, 2) | 0;
        k[ea >> 2] = ma;
        ea = c + -32 | 0;
        ma = k[ea >> 2] | 0;
        pa = c + 28 | 0;
        A = k[pa >> 2] | 0;
        oa = A + ma | 0;
        na = k[10242] | 0;
        na = hb(oa | 0, ((oa | 0) < 0) << 31 >> 31 | 0, na | 0, ((na | 0) < 0) << 31 >> 31 | 0) | 0;
        na = Xa(na | 0, L | 0, 32) | 0;
        oa = L;
        y = k[10244] | 0;
        A = hb(y | 0, ((y | 0) < 0) << 31 >> 31 | 0, A | 0, ((A | 0) < 0) << 31 >> 31 | 0) | 0;
        A = Xa(A | 0, L | 0, 32) | 0;
        A = Ya(na | 0, oa | 0, A | 0, L | 0) | 0;
        A = $a(A | 0, L | 0, 2) | 0;
        k[ea >> 2] = A;
        ea = k[10245] | 0;
        ma = hb(ea | 0, ((ea | 0) < 0) << 31 >> 31 | 0, ma | 0, ((ma | 0) < 0) << 31 >> 31 | 0) | 0;
        ma = Xa(ma | 0, L | 0, 32) | 0;
        oa = bb(ma | 0, L | 0, na | 0, oa | 0) | 0;
        oa = $a(oa | 0, L | 0, 2) | 0;
        k[pa >> 2] = oa;
        if ((d | 0) > 1) {
         d = d + -1 | 0;
         c = c + 72 | 0;
        } else break;
       }
      }
      d = a + 14460 + (C * 2304 | 0) | 0;
      y = 42136 + (C * 4840 | 0) + (X * 2420 | 0) | 0;
      s = 42136 + (C * 4840 | 0) + (X * 2420 | 0) + 116 | 0;
      e = 42136 + (C * 4840 | 0) + (X * 2420 | 0) + 260 | 0;
      g = 42136 + (C * 4840 | 0) + (X * 2420 | 0) + 2420 | 0;
      while (1) {
       if (g >>> 0 < e >>> 0) {
        c = g;
        break;
       }
       c = g + -24 | 0;
       if (!(k[g + -20 >> 2] | k[c >> 2] | k[g + -16 >> 2] | k[g + -12 >> 2] | k[g + -8 >> 2] | k[g + -4 >> 2])) g = c; else break;
      }
      e = c - s | 0;
      A = (e >> 2 | 0) / 18 | 0;
      c = A + 1 | 0;
      if ((i[z >> 0] | 0) == 2) {
       e = 42136 + (C * 4840 | 0) + (X * 2420 | 0) + 21 | 0;
       if (!(i[e >> 0] | 0)) {
        u = 0;
        t = 0;
        e = s;
        D = 230;
       } else {
        x = 2;
        D = 228;
       }
      } else if ((e | 0) > -72) {
       e = 42136 + (C * 4840 | 0) + (X * 2420 | 0) + 21 | 0;
       x = c;
       D = 228;
      }
      if ((D | 0) == 228) {
       v = (i[e >> 0] | 0) != 0;
       w = x * 72 | 0;
       u = 0;
       while (1) {
        if (v & (u | 0) < 2) t = 40984; else t = 40984 + ((l[z >> 0] | 0) * 144 | 0) | 0;
        g = s + 64 | 0;
        wa = k[g >> 2] | 0;
        ta = s + 68 | 0;
        ua = (k[ta >> 2] | 0) + wa | 0;
        ra = s + 60 | 0;
        sa = k[ra >> 2] | 0;
        k[g >> 2] = sa + wa;
        g = s + 56 | 0;
        wa = k[g >> 2] | 0;
        sa = wa + sa | 0;
        h = s + 52 | 0;
        qa = k[h >> 2] | 0;
        k[g >> 2] = qa + wa;
        g = s + 48 | 0;
        wa = k[g >> 2] | 0;
        qa = wa + qa | 0;
        o = s + 44 | 0;
        n = k[o >> 2] | 0;
        k[g >> 2] = n + wa;
        g = s + 40 | 0;
        wa = k[g >> 2] | 0;
        n = wa + n | 0;
        q = s + 36 | 0;
        p = k[q >> 2] | 0;
        k[g >> 2] = p + wa;
        g = s + 32 | 0;
        wa = k[g >> 2] | 0;
        p = wa + p | 0;
        ea = s + 28 | 0;
        D = k[ea >> 2] | 0;
        k[g >> 2] = D + wa;
        g = s + 24 | 0;
        wa = k[g >> 2] | 0;
        D = wa + D | 0;
        na = s + 20 | 0;
        ma = k[na >> 2] | 0;
        k[g >> 2] = ma + wa;
        g = s + 16 | 0;
        wa = k[g >> 2] | 0;
        ma = wa + ma | 0;
        e = s + 12 | 0;
        pa = k[e >> 2] | 0;
        k[g >> 2] = pa + wa;
        g = s + 8 | 0;
        wa = k[g >> 2] | 0;
        pa = wa + pa | 0;
        va = s + 4 | 0;
        oa = k[va >> 2] | 0;
        k[g >> 2] = oa + wa;
        g = k[s >> 2] | 0;
        oa = g + oa | 0;
        k[va >> 2] = oa;
        k[ta >> 2] = ua + sa;
        k[ra >> 2] = qa + sa;
        k[h >> 2] = n + qa;
        k[o >> 2] = p + n;
        k[q >> 2] = D + p;
        k[ea >> 2] = ma + D;
        k[na >> 2] = pa + ma;
        k[e >> 2] = oa + pa;
        e = 0;
        while (1) {
         wa = e + 8 | 0;
         oa = k[s + (wa << 2) >> 2] | 0;
         ua = e + 16 | 0;
         pa = k[s + (ua << 2) >> 2] | 0;
         ra = e + 4 | 0;
         ta = k[s + (ra << 2) >> 2] | 0;
         qa = pa + oa - ta | 0;
         sa = e + 12 | 0;
         ma = k[s + (sa << 2) >> 2] | 0;
         na = (ma >> 1) + g | 0;
         ma = g - ma | 0;
         va = e + 6 | 0;
         k[ka + (va << 2) >> 2] = ma - (qa >> 1);
         k[ka + (ua << 2) >> 2] = ma + qa;
         ua = ta + oa << 1;
         hb(ua | 0, ((ua | 0) < 0) << 31 >> 31 | 0, 2017974537, 0) | 0;
         ua = L;
         oa = oa - pa | 0;
         hb(oa | 0, ((oa | 0) < 0) << 31 >> 31 | 0, -745813244, -1) | 0;
         oa = L;
         pa = ta + pa << 1;
         hb(pa | 0, ((pa | 0) < 0) << 31 >> 31 | 0, -1645067915, -1) | 0;
         pa = L;
         ta = e + 10 | 0;
         k[ka + (ta << 2) >> 2] = na - ua - pa;
         qa = e + 2 | 0;
         k[ka + (qa << 2) >> 2] = oa + na + ua;
         ua = e + 14 | 0;
         k[ka + (ua << 2) >> 2] = na - oa + pa;
         ta = k[s + (ta << 2) >> 2] | 0;
         ua = k[s + (ua << 2) >> 2] | 0;
         qa = k[s + (qa << 2) >> 2] | 0;
         pa = ua + ta - qa << 1;
         hb(pa | 0, ((pa | 0) < 0) << 31 >> 31 | 0, -1859775393, -1) | 0;
         k[ka + (ra << 2) >> 2] = L;
         ra = qa + ta << 1;
         hb(ra | 0, ((ra | 0) < 0) << 31 >> 31 | 0, 2114858546, 0) | 0;
         ra = L;
         ta = ta - ua | 0;
         hb(ta | 0, ((ta | 0) < 0) << 31 >> 31 | 0, -1468965330, -1) | 0;
         ta = L;
         va = k[s + (va << 2) >> 2] << 1;
         hb(va | 0, ((va | 0) < 0) << 31 >> 31 | 0, 1859775393, 0) | 0;
         va = L;
         ua = qa + ua << 1;
         hb(ua | 0, ((ua | 0) < 0) << 31 >> 31 | 0, -1380375881, -1) | 0;
         ua = L;
         k[ka + (e << 2) >> 2] = ra + ta + va;
         k[ka + (sa << 2) >> 2] = ua + ra - va;
         k[ka + (wa << 2) >> 2] = ta - ua - va;
         e = e + 1 | 0;
         if ((e | 0) == 2) break;
         g = k[s + (e << 2) >> 2] | 0;
        }
        e = 0 - (u & 1) & 144;
        g = e + 27 | 0;
        h = e + 26 | 0;
        n = e | 35;
        o = e + 18 | 0;
        p = 0;
        q = 0;
        while (1) {
         wa = k[ka + (p << 2) >> 2] | 0;
         va = k[ka + ((p | 2) << 2) >> 2] | 0;
         qa = va + wa | 0;
         wa = va - wa | 0;
         va = k[ka + ((p | 1) << 2) >> 2] | 0;
         sa = k[ka + ((p | 3) << 2) >> 2] | 0;
         ta = sa + va << 1;
         pa = k[51880 + (q << 2) >> 2] | 0;
         hb(ta | 0, ((ta | 0) < 0) << 31 >> 31 | 0, pa | 0, ((pa | 0) < 0) << 31 >> 31 | 0) | 0;
         pa = L;
         va = sa - va | 0;
         sa = 8 - q | 0;
         ta = k[51916 + (sa << 2) >> 2] | 0;
         va = hb(ta | 0, ((ta | 0) < 0) << 31 >> 31 | 0, va | 0, ((va | 0) < 0) << 31 >> 31 | 0) | 0;
         va = _a(va | 0, L | 0, 15) | 0;
         ta = pa + qa | 0;
         pa = qa - pa | 0;
         qa = ((pa | 0) < 0) << 31 >> 31;
         ua = q + 9 | 0;
         ra = k[t + (ua + e << 2) >> 2] | 0;
         hb(pa | 0, qa | 0, ra | 0, ((ra | 0) < 0) << 31 >> 31 | 0) | 0;
         ra = d + (ua << 2) | 0;
         oa = bb(L | 0, 0, k[ra >> 2] | 0, 0) | 0;
         k[a + 5244 + (C * 4608 | 0) + (B << 7) + ((ua << 5) + u << 2) >> 2] = oa;
         ua = k[t + (sa + e << 2) >> 2] | 0;
         hb(pa | 0, qa | 0, ua | 0, ((ua | 0) < 0) << 31 >> 31 | 0) | 0;
         ua = d + (sa << 2) | 0;
         qa = bb(L | 0, 0, k[ua >> 2] | 0, 0) | 0;
         k[a + 5244 + (C * 4608 | 0) + (B << 7) + ((sa << 5) + u << 2) >> 2] = qa;
         sa = ((ta | 0) < 0) << 31 >> 31;
         qa = k[t + (g + q << 2) >> 2] | 0;
         hb(ta | 0, sa | 0, qa | 0, ((qa | 0) < 0) << 31 >> 31 | 0) | 0;
         k[ra >> 2] = L;
         ra = k[t + (h - q << 2) >> 2] | 0;
         hb(ra | 0, ((ra | 0) < 0) << 31 >> 31 | 0, ta | 0, sa | 0) | 0;
         k[ua >> 2] = L;
         ua = va + wa | 0;
         va = wa - va | 0;
         wa = ((va | 0) < 0) << 31 >> 31;
         sa = 17 - q | 0;
         ta = k[t + (sa + e << 2) >> 2] | 0;
         hb(ta | 0, ((ta | 0) < 0) << 31 >> 31 | 0, va | 0, wa | 0) | 0;
         ta = d + (sa << 2) | 0;
         ra = bb(L | 0, 0, k[ta >> 2] | 0, 0) | 0;
         k[a + 5244 + (C * 4608 | 0) + (B << 7) + ((sa << 5) + u << 2) >> 2] = ra;
         sa = k[t + (q + e << 2) >> 2] | 0;
         hb(sa | 0, ((sa | 0) < 0) << 31 >> 31 | 0, va | 0, wa | 0) | 0;
         wa = d + (q << 2) | 0;
         va = bb(L | 0, 0, k[wa >> 2] | 0, 0) | 0;
         k[a + 5244 + (C * 4608 | 0) + (B << 7) + ((q << 5) + u << 2) >> 2] = va;
         va = ((ua | 0) < 0) << 31 >> 31;
         sa = k[t + (n - q << 2) >> 2] | 0;
         hb(sa | 0, ((sa | 0) < 0) << 31 >> 31 | 0, ua | 0, va | 0) | 0;
         k[ta >> 2] = L;
         ta = k[t + (o + q << 2) >> 2] | 0;
         hb(ta | 0, ((ta | 0) < 0) << 31 >> 31 | 0, ua | 0, va | 0) | 0;
         k[wa >> 2] = L;
         q = q + 1 | 0;
         if ((q | 0) == 4) break; else p = p + 4 | 0;
        }
        ua = k[S >> 2] | 0;
        sa = k[T >> 2] << 1;
        hb(sa | 0, ((sa | 0) < 0) << 31 >> 31 | 0, 1518500250, 0) | 0;
        sa = L;
        ta = sa + ua | 0;
        sa = ua - sa | 0;
        ua = ((sa | 0) < 0) << 31 >> 31;
        va = k[t + ((e | 13) << 2) >> 2] | 0;
        hb(sa | 0, ua | 0, va | 0, ((va | 0) < 0) << 31 >> 31 | 0) | 0;
        va = d + 52 | 0;
        wa = bb(L | 0, 0, k[va >> 2] | 0, 0) | 0;
        k[a + 5244 + (C * 4608 | 0) + (B << 7) + (u + 416 << 2) >> 2] = wa;
        wa = k[t + ((e | 4) << 2) >> 2] | 0;
        hb(sa | 0, ua | 0, wa | 0, ((wa | 0) < 0) << 31 >> 31 | 0) | 0;
        wa = d + 16 | 0;
        ua = bb(L | 0, 0, k[wa >> 2] | 0, 0) | 0;
        k[a + 5244 + (C * 4608 | 0) + (B << 7) + (u + 128 << 2) >> 2] = ua;
        ua = ((ta | 0) < 0) << 31 >> 31;
        sa = k[t + (e + 31 << 2) >> 2] | 0;
        hb(ta | 0, ua | 0, sa | 0, ((sa | 0) < 0) << 31 >> 31 | 0) | 0;
        k[va >> 2] = L;
        va = k[t + (e + 22 << 2) >> 2] | 0;
        hb(ta | 0, ua | 0, va | 0, ((va | 0) < 0) << 31 >> 31 | 0) | 0;
        k[wa >> 2] = L;
        u = u + 1 | 0;
        if ((u | 0) == (x | 0)) break; else {
         d = d + 72 | 0;
         s = s + 72 | 0;
        }
       }
       d = x * 18 | 0;
       u = d;
       d = a + 14460 + (C * 2304 | 0) + (d << 2) | 0;
       t = x;
       e = y + (w + 116) | 0;
       D = 230;
      }
      if ((D | 0) == 230) {
       D = 0;
       if ((t | 0) < (c | 0)) {
        p = a + 5244 + (C * 4608 | 0) + (B << 7) + (t + 192 << 2) | 0;
        q = a + 5244 + (C * 4608 | 0) + (B << 7) + (t + 384 << 2) | 0;
        s = t;
        while (1) {
         k[a + 5244 + (C * 4608 | 0) + (B << 7) + (s << 2) >> 2] = k[d >> 2];
         k[a + 5244 + (C * 4608 | 0) + (B << 7) + (s + 32 << 2) >> 2] = k[d + 4 >> 2];
         k[a + 5244 + (C * 4608 | 0) + (B << 7) + (s + 64 << 2) >> 2] = k[d + 8 >> 2];
         k[a + 5244 + (C * 4608 | 0) + (B << 7) + (s + 96 << 2) >> 2] = k[d + 12 >> 2];
         k[a + 5244 + (C * 4608 | 0) + (B << 7) + (s + 128 << 2) >> 2] = k[d + 16 >> 2];
         k[a + 5244 + (C * 4608 | 0) + (B << 7) + (s + 160 << 2) >> 2] = k[d + 20 >> 2];
         o = 0 - (s & 1) & 144;
         wa = k[e >> 2] | 0;
         g = k[e + 12 >> 2] | 0;
         h = g + wa | 0;
         sa = k[e + 24 >> 2] | 0;
         ua = k[e + 36 >> 2] | 0;
         n = ua + sa | 0;
         va = k[e + 48 >> 2] | 0;
         ua = va + ua | 0;
         va = n + va + (k[e + 60 >> 2] | 0) | 0;
         g = sa + g << 1;
         hb(g | 0, ((g | 0) < 0) << 31 >> 31 | 0, 1859775393, 0) | 0;
         g = L;
         n = n + h << 2;
         hb(n | 0, ((n | 0) < 0) << 31 >> 31 | 0, 1859775393, 0) | 0;
         n = L;
         sa = wa - ua | 0;
         ta = h - va << 1;
         hb(ta | 0, ((ta | 0) < 0) << 31 >> 31 | 0, 1518500250, 0) | 0;
         ta = L;
         ra = ta + sa | 0;
         k[G >> 2] = ra;
         k[H >> 2] = ra;
         ta = sa - ta | 0;
         k[I >> 2] = ta;
         k[J >> 2] = ta;
         wa = (ua >> 1) + wa | 0;
         ua = g + wa | 0;
         h = va + (h << 1) | 0;
         va = n + h | 0;
         hb(va | 0, ((va | 0) < 0) << 31 >> 31 | 0, 1111619334, 0) | 0;
         va = L;
         ta = va + ua | 0;
         k[K >> 2] = ta;
         k[M >> 2] = ta;
         va = ua - va | 0;
         k[N >> 2] = va;
         k[O >> 2] = va;
         g = wa - g | 0;
         n = h - n << 1;
         hb(n | 0, ((n | 0) < 0) << 31 >> 31 | 0, 2074309917, 0) | 0;
         n = L;
         h = g - n | 0;
         k[P >> 2] = h;
         k[ca >> 2] = h;
         g = n + g | 0;
         k[Q >> 2] = g;
         k[R >> 2] = g;
         g = 0;
         n = p;
         while (1) {
          va = k[41272 + (g + o << 2) >> 2] | 0;
          hb(va | 0, ((va | 0) < 0) << 31 >> 31 | 0, h | 0, ((h | 0) < 0) << 31 >> 31 | 0) | 0;
          va = g + 6 | 0;
          wa = bb(L | 0, 0, k[d + (va << 2) >> 2] | 0, 0) | 0;
          k[n >> 2] = wa;
          wa = k[ca + (va << 2) >> 2] | 0;
          va = k[41272 + (va + o << 2) >> 2] | 0;
          hb(va | 0, ((va | 0) < 0) << 31 >> 31 | 0, wa | 0, ((wa | 0) < 0) << 31 >> 31 | 0) | 0;
          k[d + (g + 12 << 2) >> 2] = L;
          g = g + 1 | 0;
          if ((g | 0) == 6) break;
          h = k[ca + (g << 2) >> 2] | 0;
          n = n + 128 | 0;
         }
         wa = k[e + 4 >> 2] | 0;
         g = k[e + 16 >> 2] | 0;
         h = g + wa | 0;
         sa = k[e + 28 >> 2] | 0;
         ua = k[e + 40 >> 2] | 0;
         n = ua + sa | 0;
         va = k[e + 52 >> 2] | 0;
         ua = va + ua | 0;
         va = n + va + (k[e + 64 >> 2] | 0) | 0;
         g = sa + g << 1;
         hb(g | 0, ((g | 0) < 0) << 31 >> 31 | 0, 1859775393, 0) | 0;
         g = L;
         n = n + h << 2;
         hb(n | 0, ((n | 0) < 0) << 31 >> 31 | 0, 1859775393, 0) | 0;
         n = L;
         sa = wa - ua | 0;
         ta = h - va << 1;
         hb(ta | 0, ((ta | 0) < 0) << 31 >> 31 | 0, 1518500250, 0) | 0;
         ta = L;
         ra = ta + sa | 0;
         k[G >> 2] = ra;
         k[H >> 2] = ra;
         ta = sa - ta | 0;
         k[I >> 2] = ta;
         k[J >> 2] = ta;
         wa = (ua >> 1) + wa | 0;
         ua = g + wa | 0;
         h = va + (h << 1) | 0;
         va = n + h | 0;
         hb(va | 0, ((va | 0) < 0) << 31 >> 31 | 0, 1111619334, 0) | 0;
         va = L;
         ta = va + ua | 0;
         k[K >> 2] = ta;
         k[M >> 2] = ta;
         va = ua - va | 0;
         k[N >> 2] = va;
         k[O >> 2] = va;
         g = wa - g | 0;
         n = h - n << 1;
         hb(n | 0, ((n | 0) < 0) << 31 >> 31 | 0, 2074309917, 0) | 0;
         n = L;
         h = g - n | 0;
         k[P >> 2] = h;
         k[ca >> 2] = h;
         g = n + g | 0;
         k[Q >> 2] = g;
         k[R >> 2] = g;
         g = 0;
         n = q;
         while (1) {
          va = k[41272 + (g + o << 2) >> 2] | 0;
          hb(va | 0, ((va | 0) < 0) << 31 >> 31 | 0, h | 0, ((h | 0) < 0) << 31 >> 31 | 0) | 0;
          va = bb(L | 0, 0, k[d + (g + 12 << 2) >> 2] | 0, 0) | 0;
          k[n >> 2] = va;
          va = g + 6 | 0;
          wa = k[ca + (va << 2) >> 2] | 0;
          va = k[41272 + (va + o << 2) >> 2] | 0;
          hb(va | 0, ((va | 0) < 0) << 31 >> 31 | 0, wa | 0, ((wa | 0) < 0) << 31 >> 31 | 0) | 0;
          k[d + (g << 2) >> 2] = L;
          g = g + 1 | 0;
          if ((g | 0) == 6) break;
          h = k[ca + (g << 2) >> 2] | 0;
          n = n + 128 | 0;
         }
         va = k[e + 8 >> 2] | 0;
         g = k[e + 20 >> 2] | 0;
         h = g + va | 0;
         ra = k[e + 32 >> 2] | 0;
         ta = k[e + 44 >> 2] | 0;
         wa = ta + ra | 0;
         ua = k[e + 56 >> 2] | 0;
         ta = ua + ta | 0;
         ua = wa + ua + (k[e + 68 >> 2] | 0) | 0;
         g = ra + g << 1;
         hb(g | 0, ((g | 0) < 0) << 31 >> 31 | 0, 1859775393, 0) | 0;
         g = L;
         wa = wa + h << 2;
         hb(wa | 0, ((wa | 0) < 0) << 31 >> 31 | 0, 1859775393, 0) | 0;
         wa = L;
         ra = va - ta | 0;
         sa = h - ua << 1;
         hb(sa | 0, ((sa | 0) < 0) << 31 >> 31 | 0, 1518500250, 0) | 0;
         sa = L;
         qa = sa + ra | 0;
         k[G >> 2] = qa;
         k[H >> 2] = qa;
         sa = ra - sa | 0;
         k[I >> 2] = sa;
         k[J >> 2] = sa;
         va = (ta >> 1) + va | 0;
         ta = g + va | 0;
         h = ua + (h << 1) | 0;
         ua = wa + h | 0;
         hb(ua | 0, ((ua | 0) < 0) << 31 >> 31 | 0, 1111619334, 0) | 0;
         ua = L;
         sa = ua + ta | 0;
         k[K >> 2] = sa;
         k[M >> 2] = sa;
         ua = ta - ua | 0;
         k[N >> 2] = ua;
         k[O >> 2] = ua;
         g = va - g | 0;
         wa = h - wa << 1;
         hb(wa | 0, ((wa | 0) < 0) << 31 >> 31 | 0, 2074309917, 0) | 0;
         wa = L;
         h = g - wa | 0;
         k[P >> 2] = h;
         k[ca >> 2] = h;
         g = wa + g | 0;
         k[Q >> 2] = g;
         k[R >> 2] = g;
         g = 0;
         while (1) {
          wa = k[41272 + (g + o << 2) >> 2] | 0;
          hb(wa | 0, ((wa | 0) < 0) << 31 >> 31 | 0, h | 0, ((h | 0) < 0) << 31 >> 31 | 0) | 0;
          wa = d + (g << 2) | 0;
          va = bb(L | 0, 0, k[wa >> 2] | 0, 0) | 0;
          k[wa >> 2] = va;
          wa = g + 6 | 0;
          va = k[ca + (wa << 2) >> 2] | 0;
          ua = k[41272 + (wa + o << 2) >> 2] | 0;
          hb(ua | 0, ((ua | 0) < 0) << 31 >> 31 | 0, va | 0, ((va | 0) < 0) << 31 >> 31 | 0) | 0;
          k[d + (wa << 2) >> 2] = L;
          k[d + (g + 12 << 2) >> 2] = 0;
          g = g + 1 | 0;
          if ((g | 0) == 6) break;
          h = k[ca + (g << 2) >> 2] | 0;
         }
         s = s + 1 | 0;
         if ((s | 0) == (c | 0)) break; else {
          d = d + 72 | 0;
          p = p + 4 | 0;
          q = q + 4 | 0;
          e = e + 72 | 0;
         }
        }
        d = a + 14460 + (C * 2304 | 0) + ((A * 18 | 0) + 18 + (ha(t, -18) | 0) + u << 2) | 0;
       }
      }
      if ((c | 0) < 32) while (1) {
       k[a + 5244 + (C * 4608 | 0) + (B << 7) + (c << 2) >> 2] = k[d >> 2];
       k[d >> 2] = 0;
       wa = d + 4 | 0;
       k[a + 5244 + (C * 4608 | 0) + (B << 7) + (c + 32 << 2) >> 2] = k[wa >> 2];
       k[wa >> 2] = 0;
       wa = d + 8 | 0;
       k[a + 5244 + (C * 4608 | 0) + (B << 7) + (c + 64 << 2) >> 2] = k[wa >> 2];
       k[wa >> 2] = 0;
       wa = d + 12 | 0;
       k[a + 5244 + (C * 4608 | 0) + (B << 7) + (c + 96 << 2) >> 2] = k[wa >> 2];
       k[wa >> 2] = 0;
       wa = d + 16 | 0;
       k[a + 5244 + (C * 4608 | 0) + (B << 7) + (c + 128 << 2) >> 2] = k[wa >> 2];
       k[wa >> 2] = 0;
       wa = d + 20 | 0;
       k[a + 5244 + (C * 4608 | 0) + (B << 7) + (c + 160 << 2) >> 2] = k[wa >> 2];
       k[wa >> 2] = 0;
       wa = d + 24 | 0;
       k[a + 5244 + (C * 4608 | 0) + (B << 7) + (c + 192 << 2) >> 2] = k[wa >> 2];
       k[wa >> 2] = 0;
       wa = d + 28 | 0;
       k[a + 5244 + (C * 4608 | 0) + (B << 7) + (c + 224 << 2) >> 2] = k[wa >> 2];
       k[wa >> 2] = 0;
       wa = d + 32 | 0;
       k[a + 5244 + (C * 4608 | 0) + (B << 7) + (c + 256 << 2) >> 2] = k[wa >> 2];
       k[wa >> 2] = 0;
       wa = d + 36 | 0;
       k[a + 5244 + (C * 4608 | 0) + (B << 7) + (c + 288 << 2) >> 2] = k[wa >> 2];
       k[wa >> 2] = 0;
       wa = d + 40 | 0;
       k[a + 5244 + (C * 4608 | 0) + (B << 7) + (c + 320 << 2) >> 2] = k[wa >> 2];
       k[wa >> 2] = 0;
       wa = d + 44 | 0;
       k[a + 5244 + (C * 4608 | 0) + (B << 7) + (c + 352 << 2) >> 2] = k[wa >> 2];
       k[wa >> 2] = 0;
       wa = d + 48 | 0;
       k[a + 5244 + (C * 4608 | 0) + (B << 7) + (c + 384 << 2) >> 2] = k[wa >> 2];
       k[wa >> 2] = 0;
       wa = d + 52 | 0;
       k[a + 5244 + (C * 4608 | 0) + (B << 7) + (c + 416 << 2) >> 2] = k[wa >> 2];
       k[wa >> 2] = 0;
       wa = d + 56 | 0;
       k[a + 5244 + (C * 4608 | 0) + (B << 7) + (c + 448 << 2) >> 2] = k[wa >> 2];
       k[wa >> 2] = 0;
       wa = d + 60 | 0;
       k[a + 5244 + (C * 4608 | 0) + (B << 7) + (c + 480 << 2) >> 2] = k[wa >> 2];
       k[wa >> 2] = 0;
       wa = d + 64 | 0;
       k[a + 5244 + (C * 4608 | 0) + (B << 7) + (c + 512 << 2) >> 2] = k[wa >> 2];
       k[wa >> 2] = 0;
       wa = d + 68 | 0;
       k[a + 5244 + (C * 4608 | 0) + (B << 7) + (c + 544 << 2) >> 2] = k[wa >> 2];
       k[wa >> 2] = 0;
       c = c + 1 | 0;
       if ((c | 0) == 32) break; else d = d + 72 | 0;
      }
      C = C + 1 | 0;
      d = k[aa >> 2] | 0;
     } while ((C | 0) < (d | 0));
    }
   }
   X = X + 1 | 0;
  } while ((X | 0) < ($ | 0));
  ea = $ * 18 | 0;
  e = Y;
  d = Y;
 } else if ((D | 0) == 256) {
  d = a + 1112 | 0;
  ea = -1;
  e = d;
  f = a + 1076 | 0;
 } while (0);
 k[f >> 2] = 0;
 if (!(k[d >> 2] | 0)) e = 0; else {
  c = k[fa >> 2] | 0;
  d = 0 - c & 7;
  if (d) {
   c = d + c | 0;
   k[fa >> 2] = c;
  }
  d = (k[ga >> 2] | 0) - c >> 3;
  if (d >>> 0 < 513) {
   cb(a + 28 | 0, (k[ja >> 2] | 0) + (c >> 3) | 0, d | 0) | 0;
   k[f >> 2] = d;
  } else d = 0;
  k[ja >> 2] = k[e >> 2];
  k[ja + 4 >> 2] = k[e + 4 >> 2];
  k[ja + 8 >> 2] = k[e + 8 >> 2];
  k[ja + 12 >> 2] = k[e + 12 >> 2];
  e = d;
 }
 d = k[fa >> 2] | 0;
 c = 0 - d & 7;
 if (c) {
  d = c + d | 0;
  k[fa >> 2] = d;
 }
 x = (k[ga >> 2] | 0) - d >> 3;
 x = (ea | 0) < 0 | x >>> 0 > 512 ? ((ia | 0) > 512 ? 512 : ia) : x;
 ab(a + 28 + e | 0, (k[ja >> 2] | 0) + (ia - x) | 0, x | 0) | 0;
 k[f >> 2] = x + (k[f >> 2] | 0);
 x = a + 8 | 0;
 d = k[x >> 2] | 0;
 if ((d | 0) <= 0) {
  wa = d;
  va = ea << 6;
  wa = ha(va, wa) | 0;
  r = la;
  return wa | 0;
 }
 y = (ea | 0) > 0;
 z = a + 19068 | 0;
 A = ka + 64 | 0;
 B = ka + 32 | 0;
 C = ka + 96 | 0;
 D = ka + 16 | 0;
 E = ka + 80 | 0;
 F = ka + 48 | 0;
 G = ka + 112 | 0;
 H = ka + 8 | 0;
 I = ka + 72 | 0;
 J = ka + 40 | 0;
 K = ka + 104 | 0;
 M = ka + 24 | 0;
 N = ka + 88 | 0;
 O = ka + 56 | 0;
 P = ka + 120 | 0;
 Q = ka + 4 | 0;
 R = ka + 68 | 0;
 S = ka + 36 | 0;
 T = ka + 100 | 0;
 U = ka + 20 | 0;
 V = ka + 84 | 0;
 W = ka + 52 | 0;
 X = ka + 116 | 0;
 Y = ka + 12 | 0;
 Z = ka + 76 | 0;
 _ = ka + 44 | 0;
 $ = ka + 108 | 0;
 aa = ka + 28 | 0;
 ba = ka + 92 | 0;
 ca = ka + 60 | 0;
 da = ka + 124 | 0;
 w = 0;
 do {
  if (y) {
   v = a + 5236 + (w << 2) | 0;
   s = d;
   t = 0;
   u = b + (w << 1) | 0;
   while (1) {
    d = a + 5244 + (w * 4608 | 0) + (t << 7) | 0;
    xa = k[d >> 2] | 0;
    Pa = a + 5244 + (w * 4608 | 0) + (t << 7) + 124 | 0;
    Ja = k[Pa >> 2] | 0;
    za = Ja + xa | 0;
    Ja = xa - Ja << 1;
    hb(Ja | 0, ((Ja | 0) < 0) << 31 >> 31 | 0, 1075036753, 0) | 0;
    Ja = L;
    xa = a + 5244 + (w * 4608 | 0) + (t << 7) + 60 | 0;
    Ia = k[xa >> 2] | 0;
    fa = a + 5244 + (w * 4608 | 0) + (t << 7) + 64 | 0;
    Fa = k[fa >> 2] | 0;
    La = Fa + Ia | 0;
    Fa = Ia - Fa << 5;
    hb(Fa | 0, ((Fa | 0) < 0) << 31 >> 31 | 0, 1367679739, 0) | 0;
    Fa = L;
    Ia = La + za | 0;
    La = za - La << 1;
    hb(La | 0, ((La | 0) < 0) << 31 >> 31 | 0, 1078937202, 0) | 0;
    La = L;
    za = Fa + Ja | 0;
    Ja = Fa - Ja << 1;
    hb(Ja | 0, ((Ja | 0) < 0) << 31 >> 31 | 0, -1078937202, -1) | 0;
    Ja = L;
    Fa = a + 5244 + (w * 4608 | 0) + (t << 7) + 28 | 0;
    Ca = k[Fa >> 2] | 0;
    e = a + 5244 + (w * 4608 | 0) + (t << 7) + 96 | 0;
    ya = k[e >> 2] | 0;
    f = ya + Ca | 0;
    ya = Ca - ya << 1;
    hb(ya | 0, ((ya | 0) < 0) << 31 >> 31 | 0, 1449139879, 0) | 0;
    ya = L;
    Ca = a + 5244 + (w * 4608 | 0) + (t << 7) + 32 | 0;
    ta = k[Ca >> 2] | 0;
    pa = a + 5244 + (w * 4608 | 0) + (t << 7) + 92 | 0;
    Ha = k[pa >> 2] | 0;
    ma = Ha + ta | 0;
    Ha = ta - Ha << 1;
    hb(Ha | 0, ((Ha | 0) < 0) << 31 >> 31 | 0, 1598879467, 0) | 0;
    Ha = L;
    ta = ma + f | 0;
    ma = f - ma << 4;
    hb(ma | 0, ((ma | 0) < 0) << 31 >> 31 | 0, 1369329156, 0) | 0;
    ma = L;
    f = Ha + ya | 0;
    ya = Ha - ya << 4;
    hb(ya | 0, ((ya | 0) < 0) << 31 >> 31 | 0, -1369329156, -1) | 0;
    ya = L;
    k[d >> 2] = ta + Ia;
    ta = Ia - ta << 1;
    hb(ta | 0, ((ta | 0) < 0) << 31 >> 31 | 0, 1094777670, 0) | 0;
    k[Fa >> 2] = L;
    k[Ca >> 2] = ma + La;
    La = ma - La << 1;
    hb(La | 0, ((La | 0) < 0) << 31 >> 31 | 0, -1094777670, -1) | 0;
    k[xa >> 2] = L;
    k[fa >> 2] = f + za;
    f = za - f << 1;
    hb(f | 0, ((f | 0) < 0) << 31 >> 31 | 0, 1094777670, 0) | 0;
    k[pa >> 2] = L;
    k[e >> 2] = ya + Ja;
    Ja = ya - Ja << 1;
    hb(Ja | 0, ((Ja | 0) < 0) << 31 >> 31 | 0, -1094777670, -1) | 0;
    k[Pa >> 2] = L;
    Ja = a + 5244 + (w * 4608 | 0) + (t << 7) + 12 | 0;
    ya = k[Ja >> 2] | 0;
    f = a + 5244 + (w * 4608 | 0) + (t << 7) + 112 | 0;
    za = k[f >> 2] | 0;
    La = za + ya | 0;
    za = ya - za << 1;
    hb(za | 0, ((za | 0) < 0) << 31 >> 31 | 0, 1140405281, 0) | 0;
    za = L;
    ya = a + 5244 + (w * 4608 | 0) + (t << 7) + 48 | 0;
    ma = k[ya >> 2] | 0;
    ta = a + 5244 + (w * 4608 | 0) + (t << 7) + 76 | 0;
    Ia = k[ta >> 2] | 0;
    Ha = Ia + ma | 0;
    Ia = ma - Ia << 2;
    hb(Ia | 0, ((Ia | 0) < 0) << 31 >> 31 | 0, 1593609622, 0) | 0;
    Ia = L;
    ma = Ha + La | 0;
    Ha = La - Ha << 1;
    hb(Ha | 0, ((Ha | 0) < 0) << 31 >> 31 | 0, 1389039203, 0) | 0;
    Ha = L;
    La = Ia + za | 0;
    za = Ia - za << 1;
    hb(za | 0, ((za | 0) < 0) << 31 >> 31 | 0, -1389039203, -1) | 0;
    za = L;
    Ia = a + 5244 + (w * 4608 | 0) + (t << 7) + 16 | 0;
    Ma = k[Ia >> 2] | 0;
    p = a + 5244 + (w * 4608 | 0) + (t << 7) + 108 | 0;
    qa = k[p >> 2] | 0;
    Ka = qa + Ma | 0;
    qa = Ma - qa << 1;
    hb(qa | 0, ((qa | 0) < 0) << 31 >> 31 | 0, 1187781572, 0) | 0;
    qa = L;
    Ma = a + 5244 + (w * 4608 | 0) + (t << 7) + 44 | 0;
    Ga = k[Ma >> 2] | 0;
    ga = a + 5244 + (w * 4608 | 0) + (t << 7) + 80 | 0;
    va = k[ga >> 2] | 0;
    h = va + Ga | 0;
    va = Ga - va << 2;
    hb(va | 0, ((va | 0) < 0) << 31 >> 31 | 0, 1255676567, 0) | 0;
    va = L;
    Ga = h + Ka | 0;
    h = Ka - h << 1;
    hb(h | 0, ((h | 0) < 0) << 31 >> 31 | 0, 1692549166, 0) | 0;
    h = L;
    Ka = va + qa | 0;
    qa = va - qa << 1;
    hb(qa | 0, ((qa | 0) < 0) << 31 >> 31 | 0, -1692549166, -1) | 0;
    qa = L;
    va = Ga + ma | 0;
    Ga = ma - Ga << 3;
    hb(Ga | 0, ((Ga | 0) < 0) << 31 >> 31 | 0, 1375954754, 0) | 0;
    Ga = L;
    ma = h + Ha | 0;
    Ha = h - Ha << 3;
    hb(Ha | 0, ((Ha | 0) < 0) << 31 >> 31 | 0, -1375954754, -1) | 0;
    Ha = L;
    h = Ka + La | 0;
    Ka = La - Ka << 3;
    hb(Ka | 0, ((Ka | 0) < 0) << 31 >> 31 | 0, 1375954754, 0) | 0;
    Ka = L;
    La = qa + za | 0;
    za = qa - za << 3;
    hb(za | 0, ((za | 0) < 0) << 31 >> 31 | 0, -1375954754, -1) | 0;
    za = L;
    qa = k[d >> 2] | 0;
    k[d >> 2] = va + qa;
    va = qa - va << 1;
    hb(va | 0, ((va | 0) < 0) << 31 >> 31 | 0, 1162209775, 0) | 0;
    k[Ja >> 2] = L;
    va = k[Fa >> 2] | 0;
    k[Ia >> 2] = Ga + va;
    va = Ga - va << 1;
    hb(va | 0, ((va | 0) < 0) << 31 >> 31 | 0, -1162209775, -1) | 0;
    k[Fa >> 2] = L;
    va = k[Ca >> 2] | 0;
    k[Ca >> 2] = ma + va;
    ma = va - ma << 1;
    hb(ma | 0, ((ma | 0) < 0) << 31 >> 31 | 0, 1162209775, 0) | 0;
    k[Ma >> 2] = L;
    ma = k[xa >> 2] | 0;
    k[ya >> 2] = Ha + ma;
    ma = Ha - ma << 1;
    hb(ma | 0, ((ma | 0) < 0) << 31 >> 31 | 0, -1162209775, -1) | 0;
    k[xa >> 2] = L;
    ma = k[fa >> 2] | 0;
    k[fa >> 2] = h + ma;
    h = ma - h << 1;
    hb(h | 0, ((h | 0) < 0) << 31 >> 31 | 0, 1162209775, 0) | 0;
    k[ta >> 2] = L;
    h = k[pa >> 2] | 0;
    k[ga >> 2] = Ka + h;
    h = Ka - h << 1;
    hb(h | 0, ((h | 0) < 0) << 31 >> 31 | 0, -1162209775, -1) | 0;
    k[pa >> 2] = L;
    h = k[e >> 2] | 0;
    k[e >> 2] = La + h;
    La = h - La << 1;
    hb(La | 0, ((La | 0) < 0) << 31 >> 31 | 0, 1162209775, 0) | 0;
    k[p >> 2] = L;
    La = k[Pa >> 2] | 0;
    k[f >> 2] = za + La;
    La = za - La << 1;
    hb(La | 0, ((La | 0) < 0) << 31 >> 31 | 0, -1162209775, -1) | 0;
    k[Pa >> 2] = L;
    La = a + 5244 + (w * 4608 | 0) + (t << 7) + 4 | 0;
    za = k[La >> 2] | 0;
    h = a + 5244 + (w * 4608 | 0) + (t << 7) + 120 | 0;
    Ka = k[h >> 2] | 0;
    ma = Ka + za | 0;
    Ka = za - Ka << 1;
    hb(Ka | 0, ((Ka | 0) < 0) << 31 >> 31 | 0, 1085490621, 0) | 0;
    Ka = L;
    za = a + 5244 + (w * 4608 | 0) + (t << 7) + 56 | 0;
    Ha = k[za >> 2] | 0;
    va = a + 5244 + (w * 4608 | 0) + (t << 7) + 68 | 0;
    Ga = k[va >> 2] | 0;
    qa = Ga + Ha | 0;
    Ga = Ha - Ga << 3;
    hb(Ga | 0, ((Ga | 0) < 0) << 31 >> 31 | 0, 1829445839, 0) | 0;
    Ga = L;
    Ha = qa + ma | 0;
    qa = ma - qa << 1;
    hb(qa | 0, ((qa | 0) < 0) << 31 >> 31 | 0, 1122057232, 0) | 0;
    qa = L;
    ma = Ga + Ka | 0;
    Ka = Ga - Ka << 1;
    hb(Ka | 0, ((Ka | 0) < 0) << 31 >> 31 | 0, -1122057232, -1) | 0;
    Ka = L;
    Ga = a + 5244 + (w * 4608 | 0) + (t << 7) + 24 | 0;
    Ba = k[Ga >> 2] | 0;
    n = a + 5244 + (w * 4608 | 0) + (t << 7) + 100 | 0;
    Na = k[n >> 2] | 0;
    o = Na + Ba | 0;
    Na = Ba - Na << 1;
    hb(Na | 0, ((Na | 0) < 0) << 31 >> 31 | 0, 1336817425, 0) | 0;
    Na = L;
    Ba = a + 5244 + (w * 4608 | 0) + (t << 7) + 36 | 0;
    ra = k[Ba >> 2] | 0;
    na = a + 5244 + (w * 4608 | 0) + (t << 7) + 88 | 0;
    wa = k[na >> 2] | 0;
    ua = wa + ra | 0;
    wa = ra - wa << 1;
    hb(wa | 0, ((wa | 0) < 0) << 31 >> 31 | 0, 1802489638, 0) | 0;
    wa = L;
    ra = ua + o | 0;
    ua = o - ua << 2;
    hb(ua | 0, ((ua | 0) < 0) << 31 >> 31 | 0, 1849463489, 0) | 0;
    ua = L;
    o = wa + Na | 0;
    Na = wa - Na << 2;
    hb(Na | 0, ((Na | 0) < 0) << 31 >> 31 | 0, -1849463489, -1) | 0;
    Na = L;
    k[La >> 2] = ra + Ha;
    ra = Ha - ra << 1;
    hb(ra | 0, ((ra | 0) < 0) << 31 >> 31 | 0, 1291378312, 0) | 0;
    k[Ga >> 2] = L;
    k[Ba >> 2] = ua + qa;
    qa = ua - qa << 1;
    hb(qa | 0, ((qa | 0) < 0) << 31 >> 31 | 0, -1291378312, -1) | 0;
    k[za >> 2] = L;
    k[va >> 2] = o + ma;
    o = ma - o << 1;
    hb(o | 0, ((o | 0) < 0) << 31 >> 31 | 0, 1291378312, 0) | 0;
    k[na >> 2] = L;
    k[n >> 2] = Na + Ka;
    Ka = Na - Ka << 1;
    hb(Ka | 0, ((Ka | 0) < 0) << 31 >> 31 | 0, -1291378312, -1) | 0;
    k[h >> 2] = L;
    Ka = a + 5244 + (w * 4608 | 0) + (t << 7) + 8 | 0;
    Na = k[Ka >> 2] | 0;
    o = a + 5244 + (w * 4608 | 0) + (t << 7) + 116 | 0;
    ma = k[o >> 2] | 0;
    qa = ma + Na | 0;
    ma = Na - ma << 1;
    hb(ma | 0, ((ma | 0) < 0) << 31 >> 31 | 0, 1106914669, 0) | 0;
    ma = L;
    Na = a + 5244 + (w * 4608 | 0) + (t << 7) + 52 | 0;
    ua = k[Na >> 2] | 0;
    ra = a + 5244 + (w * 4608 | 0) + (t << 7) + 72 | 0;
    Ha = k[ra >> 2] | 0;
    wa = Ha + ua | 0;
    Ha = ua - Ha << 3;
    hb(Ha | 0, ((Ha | 0) < 0) << 31 >> 31 | 0, 1104762768, 0) | 0;
    Ha = L;
    ua = wa + qa | 0;
    wa = qa - wa << 1;
    hb(wa | 0, ((wa | 0) < 0) << 31 >> 31 | 0, 1217503044, 0) | 0;
    wa = L;
    qa = Ha + ma | 0;
    ma = Ha - ma << 1;
    hb(ma | 0, ((ma | 0) < 0) << 31 >> 31 | 0, -1217503044, -1) | 0;
    ma = L;
    Ha = a + 5244 + (w * 4608 | 0) + (t << 7) + 20 | 0;
    Da = k[Ha >> 2] | 0;
    g = a + 5244 + (w * 4608 | 0) + (t << 7) + 104 | 0;
    sa = k[g >> 2] | 0;
    Ea = sa + Da | 0;
    sa = Da - sa << 1;
    hb(sa | 0, ((sa | 0) < 0) << 31 >> 31 | 0, 1251843312, 0) | 0;
    sa = L;
    Da = a + 5244 + (w * 4608 | 0) + (t << 7) + 40 | 0;
    Oa = k[Da >> 2] | 0;
    ja = a + 5244 + (w * 4608 | 0) + (t << 7) + 84 | 0;
    ia = k[ja >> 2] | 0;
    c = ia + Oa | 0;
    ia = Oa - ia << 1;
    hb(ia | 0, ((ia | 0) < 0) << 31 >> 31 | 0, 2088574387, 0) | 0;
    ia = L;
    Oa = c + Ea | 0;
    c = Ea - c << 2;
    hb(c | 0, ((c | 0) < 0) << 31 >> 31 | 0, 1138893993, 0) | 0;
    c = L;
    Ea = ia + sa | 0;
    sa = ia - sa << 2;
    hb(sa | 0, ((sa | 0) < 0) << 31 >> 31 | 0, -1138893993, -1) | 0;
    sa = L;
    ia = Oa + ua | 0;
    Oa = ua - Oa << 1;
    hb(Oa | 0, ((Oa | 0) < 0) << 31 >> 31 | 0, 1932684223, 0) | 0;
    Oa = L;
    ua = c + wa | 0;
    wa = c - wa << 1;
    hb(wa | 0, ((wa | 0) < 0) << 31 >> 31 | 0, -1932684223, -1) | 0;
    wa = L;
    c = Ea + qa | 0;
    Ea = qa - Ea << 1;
    hb(Ea | 0, ((Ea | 0) < 0) << 31 >> 31 | 0, 1932684223, 0) | 0;
    Ea = L;
    qa = sa + ma | 0;
    ma = sa - ma << 1;
    hb(ma | 0, ((ma | 0) < 0) << 31 >> 31 | 0, -1932684223, -1) | 0;
    ma = L;
    sa = k[La >> 2] | 0;
    Aa = ia + sa | 0;
    ia = sa - ia << 2;
    hb(ia | 0, ((ia | 0) < 0) << 31 >> 31 | 0, 1402911301, 0) | 0;
    ia = L;
    sa = k[Ga >> 2] | 0;
    oa = Oa + sa | 0;
    sa = Oa - sa << 2;
    hb(sa | 0, ((sa | 0) < 0) << 31 >> 31 | 0, -1402911301, -1) | 0;
    sa = L;
    Oa = k[Ba >> 2] | 0;
    k[Ba >> 2] = ua + Oa;
    ua = Oa - ua << 2;
    hb(ua | 0, ((ua | 0) < 0) << 31 >> 31 | 0, 1402911301, 0) | 0;
    k[Da >> 2] = L;
    ua = k[za >> 2] | 0;
    k[Na >> 2] = wa + ua;
    ua = wa - ua << 2;
    hb(ua | 0, ((ua | 0) < 0) << 31 >> 31 | 0, -1402911301, -1) | 0;
    k[za >> 2] = L;
    ua = k[va >> 2] | 0;
    k[va >> 2] = c + ua;
    c = ua - c << 2;
    hb(c | 0, ((c | 0) < 0) << 31 >> 31 | 0, 1402911301, 0) | 0;
    k[ra >> 2] = L;
    c = k[na >> 2] | 0;
    k[ja >> 2] = Ea + c;
    c = Ea - c << 2;
    hb(c | 0, ((c | 0) < 0) << 31 >> 31 | 0, -1402911301, -1) | 0;
    k[na >> 2] = L;
    c = k[n >> 2] | 0;
    k[n >> 2] = qa + c;
    qa = c - qa << 2;
    hb(qa | 0, ((qa | 0) < 0) << 31 >> 31 | 0, 1402911301, 0) | 0;
    k[g >> 2] = L;
    qa = k[h >> 2] | 0;
    k[o >> 2] = ma + qa;
    qa = ma - qa << 2;
    hb(qa | 0, ((qa | 0) < 0) << 31 >> 31 | 0, -1402911301, -1) | 0;
    k[h >> 2] = L;
    qa = k[d >> 2] | 0;
    k[d >> 2] = qa + Aa;
    Aa = qa - Aa << 1;
    hb(Aa | 0, ((Aa | 0) < 0) << 31 >> 31 | 0, 1518500250, 0) | 0;
    k[La >> 2] = L;
    Aa = k[Ja >> 2] | 0;
    qa = ia - Aa << 1;
    hb(qa | 0, ((qa | 0) < 0) << 31 >> 31 | 0, -1518500250, -1) | 0;
    qa = L;
    k[Ja >> 2] = qa;
    k[Ka >> 2] = Aa + ia + qa;
    qa = k[Ia >> 2] | 0;
    ia = qa - oa << 1;
    hb(ia | 0, ((ia | 0) < 0) << 31 >> 31 | 0, 1518500250, 0) | 0;
    ia = L;
    Aa = k[Fa >> 2] | 0;
    ma = sa - Aa << 1;
    hb(ma | 0, ((ma | 0) < 0) << 31 >> 31 | 0, -1518500250, -1) | 0;
    ma = L;
    k[Fa >> 2] = ma;
    Aa = sa + Aa + ma | 0;
    k[Ia >> 2] = qa + oa + Aa;
    k[Ga >> 2] = Aa + ia;
    k[Ha >> 2] = ma + ia;
    ia = k[Ca >> 2] | 0;
    ma = k[Ba >> 2] | 0;
    k[Ca >> 2] = ma + ia;
    ma = ia - ma << 1;
    hb(ma | 0, ((ma | 0) < 0) << 31 >> 31 | 0, 1518500250, 0) | 0;
    k[Ba >> 2] = L;
    ma = k[Da >> 2] | 0;
    ia = k[Ma >> 2] | 0;
    Aa = ma - ia << 1;
    hb(Aa | 0, ((Aa | 0) < 0) << 31 >> 31 | 0, -1518500250, -1) | 0;
    Aa = L;
    k[Ma >> 2] = Aa;
    k[Da >> 2] = ia + ma + Aa;
    Aa = k[ya >> 2] | 0;
    ma = k[Na >> 2] | 0;
    ia = Aa - ma << 1;
    hb(ia | 0, ((ia | 0) < 0) << 31 >> 31 | 0, 1518500250, 0) | 0;
    ia = L;
    oa = k[za >> 2] | 0;
    qa = k[xa >> 2] | 0;
    sa = oa - qa << 1;
    hb(sa | 0, ((sa | 0) < 0) << 31 >> 31 | 0, -1518500250, -1) | 0;
    sa = L;
    k[xa >> 2] = sa;
    oa = qa + oa + sa | 0;
    Aa = ma + Aa + oa | 0;
    k[ya >> 2] = Aa;
    k[za >> 2] = oa + ia;
    k[Na >> 2] = sa + ia;
    ia = k[fa >> 2] | 0;
    sa = k[va >> 2] | 0;
    k[fa >> 2] = sa + ia;
    sa = ia - sa << 1;
    hb(sa | 0, ((sa | 0) < 0) << 31 >> 31 | 0, 1518500250, 0) | 0;
    k[va >> 2] = L;
    sa = k[ra >> 2] | 0;
    ia = k[ta >> 2] | 0;
    oa = sa - ia << 1;
    hb(oa | 0, ((oa | 0) < 0) << 31 >> 31 | 0, -1518500250, -1) | 0;
    oa = L;
    k[ta >> 2] = oa;
    k[ra >> 2] = ia + sa + oa;
    oa = k[ga >> 2] | 0;
    sa = k[ja >> 2] | 0;
    ia = oa - sa << 1;
    hb(ia | 0, ((ia | 0) < 0) << 31 >> 31 | 0, 1518500250, 0) | 0;
    ia = L;
    ma = k[na >> 2] | 0;
    qa = k[pa >> 2] | 0;
    c = ma - qa << 1;
    hb(c | 0, ((c | 0) < 0) << 31 >> 31 | 0, -1518500250, -1) | 0;
    c = L;
    k[pa >> 2] = c;
    ma = qa + ma + c | 0;
    k[ga >> 2] = sa + oa + ma;
    k[na >> 2] = ma + ia;
    k[ja >> 2] = c + ia;
    ia = k[e >> 2] | 0;
    c = k[n >> 2] | 0;
    ma = ia - c << 1;
    hb(ma | 0, ((ma | 0) < 0) << 31 >> 31 | 0, 1518500250, 0) | 0;
    ma = L;
    oa = k[g >> 2] | 0;
    sa = k[p >> 2] | 0;
    qa = oa - sa << 1;
    hb(qa | 0, ((qa | 0) < 0) << 31 >> 31 | 0, -1518500250, -1) | 0;
    qa = L;
    oa = sa + oa + qa | 0;
    sa = k[f >> 2] | 0;
    Ea = k[o >> 2] | 0;
    ua = sa - Ea << 1;
    hb(ua | 0, ((ua | 0) < 0) << 31 >> 31 | 0, 1518500250, 0) | 0;
    ua = L;
    wa = k[h >> 2] | 0;
    Oa = k[Pa >> 2] | 0;
    q = wa - Oa << 1;
    hb(q | 0, ((q | 0) < 0) << 31 >> 31 | 0, -1518500250, -1) | 0;
    q = L;
    k[Pa >> 2] = q;
    wa = Oa + wa + q | 0;
    sa = Ea + sa + wa | 0;
    wa = wa + ua | 0;
    ua = q + ua | 0;
    Ea = (k[Ca >> 2] | 0) + Aa | 0;
    k[Ca >> 2] = Ea;
    Ca = k[Da >> 2] | 0;
    Aa = Ca + Aa | 0;
    k[ya >> 2] = Aa;
    ya = k[za >> 2] | 0;
    Ca = ya + Ca | 0;
    k[Da >> 2] = Ca;
    Da = k[Ba >> 2] | 0;
    ya = Da + ya | 0;
    k[za >> 2] = ya;
    za = k[Na >> 2] | 0;
    Da = za + Da | 0;
    k[Ba >> 2] = Da;
    Ba = k[Ma >> 2] | 0;
    za = Ba + za | 0;
    k[Na >> 2] = za;
    xa = k[xa >> 2] | 0;
    Ba = xa + Ba | 0;
    k[Ma >> 2] = Ba;
    d = k[d >> 2] | 0;
    k[ka >> 2] = d;
    k[A >> 2] = k[La >> 2];
    k[B >> 2] = k[Ka >> 2];
    k[C >> 2] = k[Ja >> 2];
    k[D >> 2] = k[Ia >> 2];
    k[E >> 2] = k[Ha >> 2];
    k[F >> 2] = k[Ga >> 2];
    k[G >> 2] = k[Fa >> 2];
    k[H >> 2] = Ea;
    k[I >> 2] = Da;
    k[J >> 2] = Ca;
    k[K >> 2] = Ba;
    k[M >> 2] = Aa;
    k[N >> 2] = za;
    k[O >> 2] = ya;
    k[P >> 2] = xa;
    ia = c + ia + sa | 0;
    k[e >> 2] = ia;
    sa = sa + oa | 0;
    k[f >> 2] = sa;
    oa = wa + oa | 0;
    k[g >> 2] = oa;
    wa = ma + wa | 0;
    k[h >> 2] = wa;
    ma = ma + ua | 0;
    k[n >> 2] = ma;
    ua = qa + ua | 0;
    k[o >> 2] = ua;
    qa = qa + q | 0;
    k[p >> 2] = qa;
    k[Q >> 2] = (k[fa >> 2] | 0) + ia;
    va = k[va >> 2] | 0;
    k[R >> 2] = va + ma;
    ra = k[ra >> 2] | 0;
    k[S >> 2] = ra + oa;
    ta = k[ta >> 2] | 0;
    k[T >> 2] = ta + qa;
    ga = k[ga >> 2] | 0;
    k[U >> 2] = ga + sa;
    ja = k[ja >> 2] | 0;
    k[V >> 2] = ja + ua;
    na = k[na >> 2] | 0;
    k[W >> 2] = na + wa;
    pa = k[pa >> 2] | 0;
    k[X >> 2] = q + pa;
    k[Y >> 2] = ga + ia;
    k[Z >> 2] = ja + ma;
    k[_ >> 2] = na + oa;
    k[$ >> 2] = pa + qa;
    k[aa >> 2] = ra + sa;
    k[ba >> 2] = ta + ua;
    k[ca >> 2] = va + wa;
    k[da >> 2] = q;
    q = k[v >> 2] | 0;
    j[a + 1140 + (w << 11) + (q << 1) >> 1] = (d | 0) > 32767 ? 32767 : (d | 0) < -32768 ? -32768 : d & 65535;
    d = 1;
    do {
     Pa = k[ka + (d << 2) >> 2] | 0;
     j[a + 1140 + (w << 11) + (d + q << 1) >> 1] = (Pa | 0) > 32767 ? 32767 : (Pa | 0) < -32768 ? -32768 : Pa & 65535;
     d = d + 1 | 0;
    } while ((d | 0) != 32);
    g = a + 1140 + (w << 11) + (q + 512 << 1) | 0;
    c = a + 1140 + (w << 11) + (q << 1) | 0;
    d = g + 64 | 0;
    do {
     j[g >> 1] = j[c >> 1] | 0;
     g = g + 2 | 0;
     c = c + 2 | 0;
    } while ((g | 0) < (d | 0));
    c = q + 16 | 0;
    d = (ha(j[a + 1140 + (w << 11) + (c << 1) >> 1] | 0, j[26226] | 0) | 0) + (k[z >> 2] | 0) | 0;
    d = d + (ha(j[a + 1140 + (w << 11) + (q + 80 << 1) >> 1] | 0, j[26290] | 0) | 0) | 0;
    d = d + (ha(j[a + 1140 + (w << 11) + (q + 144 << 1) >> 1] | 0, j[26354] | 0) | 0) | 0;
    d = d + (ha(j[a + 1140 + (w << 11) + (q + 208 << 1) >> 1] | 0, j[26418] | 0) | 0) | 0;
    d = d + (ha(j[a + 1140 + (w << 11) + (q + 272 << 1) >> 1] | 0, j[26482] | 0) | 0) | 0;
    d = d + (ha(j[a + 1140 + (w << 11) + (q + 336 << 1) >> 1] | 0, j[26546] | 0) | 0) | 0;
    d = d + (ha(j[a + 1140 + (w << 11) + (q + 400 << 1) >> 1] | 0, j[26610] | 0) | 0) | 0;
    d = d + (ha(j[a + 1140 + (w << 11) + (q + 464 << 1) >> 1] | 0, j[26674] | 0) | 0) | 0;
    e = q + 48 | 0;
    d = d - (ha(j[a + 1140 + (w << 11) + (e << 1) >> 1] | 0, j[26258] | 0) | 0) | 0;
    d = d - (ha(j[a + 1140 + (w << 11) + (q + 112 << 1) >> 1] | 0, j[26322] | 0) | 0) | 0;
    d = d - (ha(j[a + 1140 + (w << 11) + (q + 176 << 1) >> 1] | 0, j[26386] | 0) | 0) | 0;
    d = d - (ha(j[a + 1140 + (w << 11) + (q + 240 << 1) >> 1] | 0, j[26450] | 0) | 0) | 0;
    d = d - (ha(j[a + 1140 + (w << 11) + (q + 304 << 1) >> 1] | 0, j[26514] | 0) | 0) | 0;
    d = d - (ha(j[a + 1140 + (w << 11) + (q + 368 << 1) >> 1] | 0, j[26578] | 0) | 0) | 0;
    d = d - (ha(j[a + 1140 + (w << 11) + (q + 432 << 1) >> 1] | 0, j[26642] | 0) | 0) | 0;
    d = d - (ha(j[a + 1140 + (w << 11) + (q + 496 << 1) >> 1] | 0, j[26706] | 0) | 0) | 0;
    f = d >> 14;
    j[u >> 1] = (f | 0) < -32768 ? -32768 : (f | 0) > 32767 ? 32767 : f & 65535;
    f = 0 - s | 0;
    d = d & 16383;
    g = 1;
    h = u;
    n = u + (s * 31 << 1) | 0;
    o = 52454;
    p = 52514;
    while (1) {
     h = h + (s << 1) | 0;
     Na = g + c | 0;
     Pa = j[a + 1140 + (w << 11) + (Na << 1) >> 1] | 0;
     d = (ha(j[o >> 1] | 0, Pa) | 0) + d | 0;
     Pa = ha(j[p >> 1] | 0, 0 - Pa | 0) | 0;
     Oa = j[a + 1140 + (w << 11) + (Na + 64 << 1) >> 1] | 0;
     d = d + (ha(j[o + 128 >> 1] | 0, Oa) | 0) | 0;
     Oa = Pa - (ha(j[p + 128 >> 1] | 0, Oa) | 0) | 0;
     Pa = j[a + 1140 + (w << 11) + (Na + 128 << 1) >> 1] | 0;
     d = d + (ha(j[o + 256 >> 1] | 0, Pa) | 0) | 0;
     Pa = Oa - (ha(j[p + 256 >> 1] | 0, Pa) | 0) | 0;
     Oa = j[a + 1140 + (w << 11) + (Na + 192 << 1) >> 1] | 0;
     d = d + (ha(j[o + 384 >> 1] | 0, Oa) | 0) | 0;
     Oa = Pa - (ha(j[p + 384 >> 1] | 0, Oa) | 0) | 0;
     Pa = j[a + 1140 + (w << 11) + (Na + 256 << 1) >> 1] | 0;
     d = d + (ha(j[o + 512 >> 1] | 0, Pa) | 0) | 0;
     Pa = Oa - (ha(j[p + 512 >> 1] | 0, Pa) | 0) | 0;
     Oa = j[a + 1140 + (w << 11) + (Na + 320 << 1) >> 1] | 0;
     d = d + (ha(j[o + 640 >> 1] | 0, Oa) | 0) | 0;
     Oa = Pa - (ha(j[p + 640 >> 1] | 0, Oa) | 0) | 0;
     Pa = j[a + 1140 + (w << 11) + (Na + 384 << 1) >> 1] | 0;
     d = d + (ha(j[o + 768 >> 1] | 0, Pa) | 0) | 0;
     Pa = Oa - (ha(j[p + 768 >> 1] | 0, Pa) | 0) | 0;
     Na = j[a + 1140 + (w << 11) + (Na + 448 << 1) >> 1] | 0;
     d = d + (ha(j[o + 896 >> 1] | 0, Na) | 0) | 0;
     Na = Pa - (ha(j[p + 896 >> 1] | 0, Na) | 0) | 0;
     Pa = e - g | 0;
     Oa = j[a + 1140 + (w << 11) + (Pa << 1) >> 1] | 0;
     d = d - (ha(j[o + 64 >> 1] | 0, Oa) | 0) | 0;
     Oa = Na - (ha(j[p + 64 >> 1] | 0, Oa) | 0) | 0;
     Na = j[a + 1140 + (w << 11) + (Pa + 64 << 1) >> 1] | 0;
     d = d - (ha(j[o + 192 >> 1] | 0, Na) | 0) | 0;
     Na = Oa - (ha(j[p + 192 >> 1] | 0, Na) | 0) | 0;
     Oa = j[a + 1140 + (w << 11) + (Pa + 128 << 1) >> 1] | 0;
     d = d - (ha(j[o + 320 >> 1] | 0, Oa) | 0) | 0;
     Oa = Na - (ha(j[p + 320 >> 1] | 0, Oa) | 0) | 0;
     Na = j[a + 1140 + (w << 11) + (Pa + 192 << 1) >> 1] | 0;
     d = d - (ha(j[o + 448 >> 1] | 0, Na) | 0) | 0;
     Na = Oa - (ha(j[p + 448 >> 1] | 0, Na) | 0) | 0;
     Oa = j[a + 1140 + (w << 11) + (Pa + 256 << 1) >> 1] | 0;
     d = d - (ha(j[o + 576 >> 1] | 0, Oa) | 0) | 0;
     Oa = Na - (ha(j[p + 576 >> 1] | 0, Oa) | 0) | 0;
     Na = j[a + 1140 + (w << 11) + (Pa + 320 << 1) >> 1] | 0;
     d = d - (ha(j[o + 704 >> 1] | 0, Na) | 0) | 0;
     Na = Oa - (ha(j[p + 704 >> 1] | 0, Na) | 0) | 0;
     Oa = j[a + 1140 + (w << 11) + (Pa + 384 << 1) >> 1] | 0;
     d = d - (ha(j[o + 832 >> 1] | 0, Oa) | 0) | 0;
     Oa = Na - (ha(j[p + 832 >> 1] | 0, Oa) | 0) | 0;
     Pa = j[a + 1140 + (w << 11) + (Pa + 448 << 1) >> 1] | 0;
     d = d - (ha(j[o + 960 >> 1] | 0, Pa) | 0) | 0;
     Pa = Oa - (ha(j[p + 960 >> 1] | 0, Pa) | 0) | 0;
     Oa = d >> 14;
     j[h >> 1] = (Oa | 0) < -32768 ? -32768 : (Oa | 0) > 32767 ? 32767 : Oa & 65535;
     Oa = Pa + (d & 16383) >> 14;
     j[n >> 1] = (Oa | 0) < -32768 ? -32768 : (Oa | 0) > 32767 ? 32767 : Oa & 65535;
     g = g + 1 | 0;
     d = Pa + d & 16383;
     if ((g | 0) == 16) break; else {
      n = n + (f << 1) | 0;
      o = o + 2 | 0;
      p = p + -2 | 0;
     }
    }
    Pa = d - (ha(j[a + 1140 + (w << 11) + (q + 32 << 1) >> 1] | 0, j[26274] | 0) | 0) | 0;
    Pa = Pa - (ha(j[a + 1140 + (w << 11) + (q + 96 << 1) >> 1] | 0, j[26338] | 0) | 0) | 0;
    Pa = Pa - (ha(j[a + 1140 + (w << 11) + (q + 160 << 1) >> 1] | 0, j[26402] | 0) | 0) | 0;
    Pa = Pa - (ha(j[a + 1140 + (w << 11) + (q + 224 << 1) >> 1] | 0, j[26466] | 0) | 0) | 0;
    Pa = Pa - (ha(j[a + 1140 + (w << 11) + (q + 288 << 1) >> 1] | 0, j[26530] | 0) | 0) | 0;
    Pa = Pa - (ha(j[a + 1140 + (w << 11) + (q + 352 << 1) >> 1] | 0, j[26594] | 0) | 0) | 0;
    Pa = Pa - (ha(j[a + 1140 + (w << 11) + (q + 416 << 1) >> 1] | 0, j[26658] | 0) | 0) | 0;
    d = q + 480 | 0;
    Pa = Pa - (ha(j[a + 1140 + (w << 11) + (d << 1) >> 1] | 0, j[26722] | 0) | 0) | 0;
    Oa = Pa >> 14;
    j[u + (s << 4 << 1) >> 1] = (Oa | 0) < -32768 ? -32768 : (Oa | 0) > 32767 ? 32767 : Oa & 65535;
    k[z >> 2] = Pa & 16383;
    k[v >> 2] = d & 511;
    d = k[x >> 2] | 0;
    t = t + 1 | 0;
    if ((t | 0) == (ea | 0)) break; else {
     s = d;
     u = u + (d << 5 << 1) | 0;
    }
   }
  }
  w = w + 1 | 0;
 } while ((w | 0) < (d | 0));
 Pa = ea << 6;
 Pa = ha(Pa, d) | 0;
 r = la;
 return Pa | 0;
}

function Qa(a) {
 a = a | 0;
 var b = 0, c = 0, d = 0, e = 0, f = 0, g = 0, h = 0, i = 0, j = 0, l = 0, m = 0, n = 0, o = 0, p = 0, q = 0, r = 0, s = 0, t = 0, u = 0, v = 0, w = 0, x = 0, y = 0, z = 0, A = 0, B = 0, C = 0, D = 0;
 do if (a >>> 0 < 245) {
  o = a >>> 0 < 11 ? 16 : a + 11 & -8;
  a = o >>> 3;
  h = k[12989] | 0;
  b = h >>> a;
  if (b & 3) {
   b = (b & 1 ^ 1) + a | 0;
   d = b << 1;
   c = 51996 + (d << 2) | 0;
   d = 51996 + (d + 2 << 2) | 0;
   e = k[d >> 2] | 0;
   f = e + 8 | 0;
   g = k[f >> 2] | 0;
   do if ((c | 0) == (g | 0)) k[12989] = h & ~(1 << b); else {
    if (g >>> 0 < (k[12993] | 0) >>> 0) qa();
    a = g + 12 | 0;
    if ((k[a >> 2] | 0) == (e | 0)) {
     k[a >> 2] = c;
     k[d >> 2] = g;
     break;
    } else qa();
   } while (0);
   D = b << 3;
   k[e + 4 >> 2] = D | 3;
   D = e + (D | 4) | 0;
   k[D >> 2] = k[D >> 2] | 1;
   D = f;
   return D | 0;
  }
  g = k[12991] | 0;
  if (o >>> 0 > g >>> 0) {
   if (b) {
    d = 2 << a;
    d = b << a & (d | 0 - d);
    d = (d & 0 - d) + -1 | 0;
    i = d >>> 12 & 16;
    d = d >>> i;
    e = d >>> 5 & 8;
    d = d >>> e;
    f = d >>> 2 & 4;
    d = d >>> f;
    c = d >>> 1 & 2;
    d = d >>> c;
    b = d >>> 1 & 1;
    b = (e | i | f | c | b) + (d >>> b) | 0;
    d = b << 1;
    c = 51996 + (d << 2) | 0;
    d = 51996 + (d + 2 << 2) | 0;
    f = k[d >> 2] | 0;
    i = f + 8 | 0;
    e = k[i >> 2] | 0;
    do if ((c | 0) == (e | 0)) {
     k[12989] = h & ~(1 << b);
     j = g;
    } else {
     if (e >>> 0 < (k[12993] | 0) >>> 0) qa();
     a = e + 12 | 0;
     if ((k[a >> 2] | 0) == (f | 0)) {
      k[a >> 2] = c;
      k[d >> 2] = e;
      j = k[12991] | 0;
      break;
     } else qa();
    } while (0);
    D = b << 3;
    g = D - o | 0;
    k[f + 4 >> 2] = o | 3;
    h = f + o | 0;
    k[f + (o | 4) >> 2] = g | 1;
    k[f + D >> 2] = g;
    if (j) {
     e = k[12994] | 0;
     c = j >>> 3;
     a = c << 1;
     d = 51996 + (a << 2) | 0;
     b = k[12989] | 0;
     c = 1 << c;
     if (!(b & c)) {
      k[12989] = b | c;
      l = 51996 + (a + 2 << 2) | 0;
      m = d;
     } else {
      b = 51996 + (a + 2 << 2) | 0;
      a = k[b >> 2] | 0;
      if (a >>> 0 < (k[12993] | 0) >>> 0) qa(); else {
       l = b;
       m = a;
      }
     }
     k[l >> 2] = e;
     k[m + 12 >> 2] = e;
     k[e + 8 >> 2] = m;
     k[e + 12 >> 2] = d;
    }
    k[12991] = g;
    k[12994] = h;
    D = i;
    return D | 0;
   }
   a = k[12990] | 0;
   if (a) {
    c = (a & 0 - a) + -1 | 0;
    C = c >>> 12 & 16;
    c = c >>> C;
    B = c >>> 5 & 8;
    c = c >>> B;
    D = c >>> 2 & 4;
    c = c >>> D;
    b = c >>> 1 & 2;
    c = c >>> b;
    d = c >>> 1 & 1;
    d = k[52260 + ((B | C | D | b | d) + (c >>> d) << 2) >> 2] | 0;
    c = (k[d + 4 >> 2] & -8) - o | 0;
    b = d;
    while (1) {
     a = k[b + 16 >> 2] | 0;
     if (!a) {
      a = k[b + 20 >> 2] | 0;
      if (!a) {
       i = c;
       break;
      }
     }
     b = (k[a + 4 >> 2] & -8) - o | 0;
     D = b >>> 0 < c >>> 0;
     c = D ? b : c;
     b = a;
     d = D ? a : d;
    }
    f = k[12993] | 0;
    if (d >>> 0 < f >>> 0) qa();
    h = d + o | 0;
    if (d >>> 0 >= h >>> 0) qa();
    g = k[d + 24 >> 2] | 0;
    c = k[d + 12 >> 2] | 0;
    do if ((c | 0) == (d | 0)) {
     b = d + 20 | 0;
     a = k[b >> 2] | 0;
     if (!a) {
      b = d + 16 | 0;
      a = k[b >> 2] | 0;
      if (!a) {
       n = 0;
       break;
      }
     }
     while (1) {
      c = a + 20 | 0;
      e = k[c >> 2] | 0;
      if (e) {
       a = e;
       b = c;
       continue;
      }
      c = a + 16 | 0;
      e = k[c >> 2] | 0;
      if (!e) break; else {
       a = e;
       b = c;
      }
     }
     if (b >>> 0 < f >>> 0) qa(); else {
      k[b >> 2] = 0;
      n = a;
      break;
     }
    } else {
     e = k[d + 8 >> 2] | 0;
     if (e >>> 0 < f >>> 0) qa();
     a = e + 12 | 0;
     if ((k[a >> 2] | 0) != (d | 0)) qa();
     b = c + 8 | 0;
     if ((k[b >> 2] | 0) == (d | 0)) {
      k[a >> 2] = c;
      k[b >> 2] = e;
      n = c;
      break;
     } else qa();
    } while (0);
    do if (g) {
     a = k[d + 28 >> 2] | 0;
     b = 52260 + (a << 2) | 0;
     if ((d | 0) == (k[b >> 2] | 0)) {
      k[b >> 2] = n;
      if (!n) {
       k[12990] = k[12990] & ~(1 << a);
       break;
      }
     } else {
      if (g >>> 0 < (k[12993] | 0) >>> 0) qa();
      a = g + 16 | 0;
      if ((k[a >> 2] | 0) == (d | 0)) k[a >> 2] = n; else k[g + 20 >> 2] = n;
      if (!n) break;
     }
     b = k[12993] | 0;
     if (n >>> 0 < b >>> 0) qa();
     k[n + 24 >> 2] = g;
     a = k[d + 16 >> 2] | 0;
     do if (a) if (a >>> 0 < b >>> 0) qa(); else {
      k[n + 16 >> 2] = a;
      k[a + 24 >> 2] = n;
      break;
     } while (0);
     a = k[d + 20 >> 2] | 0;
     if (a) if (a >>> 0 < (k[12993] | 0) >>> 0) qa(); else {
      k[n + 20 >> 2] = a;
      k[a + 24 >> 2] = n;
      break;
     }
    } while (0);
    if (i >>> 0 < 16) {
     D = i + o | 0;
     k[d + 4 >> 2] = D | 3;
     D = d + (D + 4) | 0;
     k[D >> 2] = k[D >> 2] | 1;
    } else {
     k[d + 4 >> 2] = o | 3;
     k[d + (o | 4) >> 2] = i | 1;
     k[d + (i + o) >> 2] = i;
     a = k[12991] | 0;
     if (a) {
      f = k[12994] | 0;
      c = a >>> 3;
      a = c << 1;
      e = 51996 + (a << 2) | 0;
      b = k[12989] | 0;
      c = 1 << c;
      if (!(b & c)) {
       k[12989] = b | c;
       p = 51996 + (a + 2 << 2) | 0;
       q = e;
      } else {
       a = 51996 + (a + 2 << 2) | 0;
       b = k[a >> 2] | 0;
       if (b >>> 0 < (k[12993] | 0) >>> 0) qa(); else {
        p = a;
        q = b;
       }
      }
      k[p >> 2] = f;
      k[q + 12 >> 2] = f;
      k[f + 8 >> 2] = q;
      k[f + 12 >> 2] = e;
     }
     k[12991] = i;
     k[12994] = h;
    }
    D = d + 8 | 0;
    return D | 0;
   }
  }
 } else if (a >>> 0 > 4294967231) o = -1; else {
  a = a + 11 | 0;
  o = a & -8;
  i = k[12990] | 0;
  if (i) {
   b = 0 - o | 0;
   a = a >>> 8;
   if (!a) h = 0; else if (o >>> 0 > 16777215) h = 31; else {
    q = (a + 1048320 | 0) >>> 16 & 8;
    v = a << q;
    p = (v + 520192 | 0) >>> 16 & 4;
    v = v << p;
    h = (v + 245760 | 0) >>> 16 & 2;
    h = 14 - (p | q | h) + (v << h >>> 15) | 0;
    h = o >>> (h + 7 | 0) & 1 | h << 1;
   }
   a = k[52260 + (h << 2) >> 2] | 0;
   a : do if (!a) {
    c = 0;
    a = 0;
    v = 86;
   } else {
    e = b;
    c = 0;
    f = o << ((h | 0) == 31 ? 0 : 25 - (h >>> 1) | 0);
    g = a;
    a = 0;
    while (1) {
     d = k[g + 4 >> 2] & -8;
     b = d - o | 0;
     if (b >>> 0 < e >>> 0) if ((d | 0) == (o | 0)) {
      d = g;
      a = g;
      v = 90;
      break a;
     } else a = g; else b = e;
     v = k[g + 20 >> 2] | 0;
     g = k[g + 16 + (f >>> 31 << 2) >> 2] | 0;
     c = (v | 0) == 0 | (v | 0) == (g | 0) ? c : v;
     if (!g) {
      v = 86;
      break;
     } else {
      e = b;
      f = f << 1;
     }
    }
   } while (0);
   if ((v | 0) == 86) {
    if ((c | 0) == 0 & (a | 0) == 0) {
     a = 2 << h;
     a = i & (a | 0 - a);
     if (!a) break;
     a = (a & 0 - a) + -1 | 0;
     n = a >>> 12 & 16;
     a = a >>> n;
     m = a >>> 5 & 8;
     a = a >>> m;
     p = a >>> 2 & 4;
     a = a >>> p;
     q = a >>> 1 & 2;
     a = a >>> q;
     c = a >>> 1 & 1;
     c = k[52260 + ((m | n | p | q | c) + (a >>> c) << 2) >> 2] | 0;
     a = 0;
    }
    if (!c) {
     h = b;
     i = a;
    } else {
     d = c;
     v = 90;
    }
   }
   if ((v | 0) == 90) while (1) {
    v = 0;
    q = (k[d + 4 >> 2] & -8) - o | 0;
    c = q >>> 0 < b >>> 0;
    b = c ? q : b;
    a = c ? d : a;
    c = k[d + 16 >> 2] | 0;
    if (c) {
     d = c;
     v = 90;
     continue;
    }
    d = k[d + 20 >> 2] | 0;
    if (!d) {
     h = b;
     i = a;
     break;
    } else v = 90;
   }
   if (i) if (h >>> 0 < ((k[12991] | 0) - o | 0) >>> 0) {
    e = k[12993] | 0;
    if (i >>> 0 < e >>> 0) qa();
    g = i + o | 0;
    if (i >>> 0 >= g >>> 0) qa();
    f = k[i + 24 >> 2] | 0;
    c = k[i + 12 >> 2] | 0;
    do if ((c | 0) == (i | 0)) {
     b = i + 20 | 0;
     a = k[b >> 2] | 0;
     if (!a) {
      b = i + 16 | 0;
      a = k[b >> 2] | 0;
      if (!a) {
       r = 0;
       break;
      }
     }
     while (1) {
      c = a + 20 | 0;
      d = k[c >> 2] | 0;
      if (d) {
       a = d;
       b = c;
       continue;
      }
      c = a + 16 | 0;
      d = k[c >> 2] | 0;
      if (!d) break; else {
       a = d;
       b = c;
      }
     }
     if (b >>> 0 < e >>> 0) qa(); else {
      k[b >> 2] = 0;
      r = a;
      break;
     }
    } else {
     d = k[i + 8 >> 2] | 0;
     if (d >>> 0 < e >>> 0) qa();
     a = d + 12 | 0;
     if ((k[a >> 2] | 0) != (i | 0)) qa();
     b = c + 8 | 0;
     if ((k[b >> 2] | 0) == (i | 0)) {
      k[a >> 2] = c;
      k[b >> 2] = d;
      r = c;
      break;
     } else qa();
    } while (0);
    do if (f) {
     a = k[i + 28 >> 2] | 0;
     b = 52260 + (a << 2) | 0;
     if ((i | 0) == (k[b >> 2] | 0)) {
      k[b >> 2] = r;
      if (!r) {
       k[12990] = k[12990] & ~(1 << a);
       break;
      }
     } else {
      if (f >>> 0 < (k[12993] | 0) >>> 0) qa();
      a = f + 16 | 0;
      if ((k[a >> 2] | 0) == (i | 0)) k[a >> 2] = r; else k[f + 20 >> 2] = r;
      if (!r) break;
     }
     b = k[12993] | 0;
     if (r >>> 0 < b >>> 0) qa();
     k[r + 24 >> 2] = f;
     a = k[i + 16 >> 2] | 0;
     do if (a) if (a >>> 0 < b >>> 0) qa(); else {
      k[r + 16 >> 2] = a;
      k[a + 24 >> 2] = r;
      break;
     } while (0);
     a = k[i + 20 >> 2] | 0;
     if (a) if (a >>> 0 < (k[12993] | 0) >>> 0) qa(); else {
      k[r + 20 >> 2] = a;
      k[a + 24 >> 2] = r;
      break;
     }
    } while (0);
    b : do if (h >>> 0 < 16) {
     D = h + o | 0;
     k[i + 4 >> 2] = D | 3;
     D = i + (D + 4) | 0;
     k[D >> 2] = k[D >> 2] | 1;
    } else {
     k[i + 4 >> 2] = o | 3;
     k[i + (o | 4) >> 2] = h | 1;
     k[i + (h + o) >> 2] = h;
     a = h >>> 3;
     if (h >>> 0 < 256) {
      b = a << 1;
      d = 51996 + (b << 2) | 0;
      c = k[12989] | 0;
      a = 1 << a;
      if (!(c & a)) {
       k[12989] = c | a;
       s = 51996 + (b + 2 << 2) | 0;
       t = d;
      } else {
       a = 51996 + (b + 2 << 2) | 0;
       b = k[a >> 2] | 0;
       if (b >>> 0 < (k[12993] | 0) >>> 0) qa(); else {
        s = a;
        t = b;
       }
      }
      k[s >> 2] = g;
      k[t + 12 >> 2] = g;
      k[i + (o + 8) >> 2] = t;
      k[i + (o + 12) >> 2] = d;
      break;
     }
     a = h >>> 8;
     if (!a) d = 0; else if (h >>> 0 > 16777215) d = 31; else {
      C = (a + 1048320 | 0) >>> 16 & 8;
      D = a << C;
      B = (D + 520192 | 0) >>> 16 & 4;
      D = D << B;
      d = (D + 245760 | 0) >>> 16 & 2;
      d = 14 - (B | C | d) + (D << d >>> 15) | 0;
      d = h >>> (d + 7 | 0) & 1 | d << 1;
     }
     a = 52260 + (d << 2) | 0;
     k[i + (o + 28) >> 2] = d;
     k[i + (o + 20) >> 2] = 0;
     k[i + (o + 16) >> 2] = 0;
     b = k[12990] | 0;
     c = 1 << d;
     if (!(b & c)) {
      k[12990] = b | c;
      k[a >> 2] = g;
      k[i + (o + 24) >> 2] = a;
      k[i + (o + 12) >> 2] = g;
      k[i + (o + 8) >> 2] = g;
      break;
     }
     a = k[a >> 2] | 0;
     c : do if ((k[a + 4 >> 2] & -8 | 0) == (h | 0)) u = a; else {
      d = h << ((d | 0) == 31 ? 0 : 25 - (d >>> 1) | 0);
      while (1) {
       b = a + 16 + (d >>> 31 << 2) | 0;
       c = k[b >> 2] | 0;
       if (!c) break;
       if ((k[c + 4 >> 2] & -8 | 0) == (h | 0)) {
        u = c;
        break c;
       } else {
        d = d << 1;
        a = c;
       }
      }
      if (b >>> 0 < (k[12993] | 0) >>> 0) qa(); else {
       k[b >> 2] = g;
       k[i + (o + 24) >> 2] = a;
       k[i + (o + 12) >> 2] = g;
       k[i + (o + 8) >> 2] = g;
       break b;
      }
     } while (0);
     a = u + 8 | 0;
     b = k[a >> 2] | 0;
     D = k[12993] | 0;
     if (b >>> 0 >= D >>> 0 & u >>> 0 >= D >>> 0) {
      k[b + 12 >> 2] = g;
      k[a >> 2] = g;
      k[i + (o + 8) >> 2] = b;
      k[i + (o + 12) >> 2] = u;
      k[i + (o + 24) >> 2] = 0;
      break;
     } else qa();
    } while (0);
    D = i + 8 | 0;
    return D | 0;
   }
  }
 } while (0);
 c = k[12991] | 0;
 if (c >>> 0 >= o >>> 0) {
  a = c - o | 0;
  b = k[12994] | 0;
  if (a >>> 0 > 15) {
   k[12994] = b + o;
   k[12991] = a;
   k[b + (o + 4) >> 2] = a | 1;
   k[b + c >> 2] = a;
   k[b + 4 >> 2] = o | 3;
  } else {
   k[12991] = 0;
   k[12994] = 0;
   k[b + 4 >> 2] = c | 3;
   D = b + (c + 4) | 0;
   k[D >> 2] = k[D >> 2] | 1;
  }
  D = b + 8 | 0;
  return D | 0;
 }
 a = k[12992] | 0;
 if (a >>> 0 > o >>> 0) {
  C = a - o | 0;
  k[12992] = C;
  D = k[12995] | 0;
  k[12995] = D + o;
  k[D + (o + 4) >> 2] = C | 1;
  k[D + 4 >> 2] = o | 3;
  D = D + 8 | 0;
  return D | 0;
 }
 do if (!(k[13107] | 0)) {
  a = wa(30) | 0;
  if (!(a + -1 & a)) {
   k[13109] = a;
   k[13108] = a;
   k[13110] = -1;
   k[13111] = -1;
   k[13112] = 0;
   k[13100] = 0;
   u = (ta(0) | 0) & -16 ^ 1431655768;
   k[13107] = u;
   break;
  } else qa();
 } while (0);
 g = o + 48 | 0;
 f = k[13109] | 0;
 h = o + 47 | 0;
 e = f + h | 0;
 f = 0 - f | 0;
 i = e & f;
 if (i >>> 0 <= o >>> 0) {
  D = 0;
  return D | 0;
 }
 a = k[13099] | 0;
 if (a) {
  t = k[13097] | 0;
  u = t + i | 0;
  if (u >>> 0 <= t >>> 0 | u >>> 0 > a >>> 0) {
   D = 0;
   return D | 0;
  }
 }
 d : do if (!(k[13100] & 4)) {
  b = k[12995] | 0;
  e : do if (!b) v = 174; else {
   d = 52404;
   while (1) {
    c = k[d >> 2] | 0;
    if (c >>> 0 <= b >>> 0) {
     a = d + 4 | 0;
     if ((c + (k[a >> 2] | 0) | 0) >>> 0 > b >>> 0) break;
    }
    d = k[d + 8 >> 2] | 0;
    if (!d) {
     v = 174;
     break e;
    }
   }
   b = e - (k[12992] | 0) & f;
   if (b >>> 0 < 2147483647) {
    c = sa(b | 0) | 0;
    u = (c | 0) == ((k[d >> 2] | 0) + (k[a >> 2] | 0) | 0);
    a = u ? b : 0;
    if (u) {
     if ((c | 0) != (-1 | 0)) {
      r = c;
      q = a;
      v = 194;
      break d;
     }
    } else {
     e = c;
     v = 184;
    }
   } else a = 0;
  } while (0);
  do if ((v | 0) == 174) {
   e = sa(0) | 0;
   if ((e | 0) == (-1 | 0)) a = 0; else {
    a = e;
    b = k[13108] | 0;
    c = b + -1 | 0;
    if (!(c & a)) b = i; else b = i - a + (c + a & 0 - b) | 0;
    a = k[13097] | 0;
    c = a + b | 0;
    if (b >>> 0 > o >>> 0 & b >>> 0 < 2147483647) {
     d = k[13099] | 0;
     if (d) if (c >>> 0 <= a >>> 0 | c >>> 0 > d >>> 0) {
      a = 0;
      break;
     }
     c = sa(b | 0) | 0;
     v = (c | 0) == (e | 0);
     a = v ? b : 0;
     if (v) {
      r = e;
      q = a;
      v = 194;
      break d;
     } else {
      e = c;
      v = 184;
     }
    } else a = 0;
   }
  } while (0);
  f : do if ((v | 0) == 184) {
   d = 0 - b | 0;
   do if (g >>> 0 > b >>> 0 & (b >>> 0 < 2147483647 & (e | 0) != (-1 | 0))) {
    c = k[13109] | 0;
    c = h - b + c & 0 - c;
    if (c >>> 0 < 2147483647) if ((sa(c | 0) | 0) == (-1 | 0)) {
     sa(d | 0) | 0;
     break f;
    } else {
     b = c + b | 0;
     break;
    }
   } while (0);
   if ((e | 0) != (-1 | 0)) {
    r = e;
    q = b;
    v = 194;
    break d;
   }
  } while (0);
  k[13100] = k[13100] | 4;
  v = 191;
 } else {
  a = 0;
  v = 191;
 } while (0);
 if ((v | 0) == 191) if (i >>> 0 < 2147483647) {
  c = sa(i | 0) | 0;
  b = sa(0) | 0;
  if (c >>> 0 < b >>> 0 & ((c | 0) != (-1 | 0) & (b | 0) != (-1 | 0))) {
   b = b - c | 0;
   d = b >>> 0 > (o + 40 | 0) >>> 0;
   if (d) {
    r = c;
    q = d ? b : a;
    v = 194;
   }
  }
 }
 if ((v | 0) == 194) {
  a = (k[13097] | 0) + q | 0;
  k[13097] = a;
  if (a >>> 0 > (k[13098] | 0) >>> 0) k[13098] = a;
  g = k[12995] | 0;
  g : do if (!g) {
   D = k[12993] | 0;
   if ((D | 0) == 0 | r >>> 0 < D >>> 0) k[12993] = r;
   k[13101] = r;
   k[13102] = q;
   k[13104] = 0;
   k[12998] = k[13107];
   k[12997] = -1;
   a = 0;
   do {
    D = a << 1;
    C = 51996 + (D << 2) | 0;
    k[51996 + (D + 3 << 2) >> 2] = C;
    k[51996 + (D + 2 << 2) >> 2] = C;
    a = a + 1 | 0;
   } while ((a | 0) != 32);
   D = r + 8 | 0;
   D = (D & 7 | 0) == 0 ? 0 : 0 - D & 7;
   C = q + -40 - D | 0;
   k[12995] = r + D;
   k[12992] = C;
   k[r + (D + 4) >> 2] = C | 1;
   k[r + (q + -36) >> 2] = 40;
   k[12996] = k[13111];
  } else {
   b = 52404;
   do {
    a = k[b >> 2] | 0;
    d = b + 4 | 0;
    c = k[d >> 2] | 0;
    if ((r | 0) == (a + c | 0)) {
     v = 204;
     break;
    }
    b = k[b + 8 >> 2] | 0;
   } while ((b | 0) != 0);
   if ((v | 0) == 204) if (!(k[b + 12 >> 2] & 8)) if (g >>> 0 < r >>> 0 & g >>> 0 >= a >>> 0) {
    k[d >> 2] = c + q;
    D = (k[12992] | 0) + q | 0;
    C = g + 8 | 0;
    C = (C & 7 | 0) == 0 ? 0 : 0 - C & 7;
    B = D - C | 0;
    k[12995] = g + C;
    k[12992] = B;
    k[g + (C + 4) >> 2] = B | 1;
    k[g + (D + 4) >> 2] = 40;
    k[12996] = k[13111];
    break;
   }
   a = k[12993] | 0;
   if (r >>> 0 < a >>> 0) {
    k[12993] = r;
    h = r;
   } else h = a;
   a = r + q | 0;
   c = 52404;
   while (1) {
    if ((k[c >> 2] | 0) == (a | 0)) {
     b = c;
     a = c;
     v = 212;
     break;
    }
    c = k[c + 8 >> 2] | 0;
    if (!c) {
     c = 52404;
     break;
    }
   }
   if ((v | 0) == 212) if (!(k[a + 12 >> 2] & 8)) {
    k[b >> 2] = r;
    n = a + 4 | 0;
    k[n >> 2] = (k[n >> 2] | 0) + q;
    n = r + 8 | 0;
    n = (n & 7 | 0) == 0 ? 0 : 0 - n & 7;
    j = r + (q + 8) | 0;
    j = (j & 7 | 0) == 0 ? 0 : 0 - j & 7;
    a = r + (j + q) | 0;
    m = n + o | 0;
    p = r + m | 0;
    l = a - (r + n) - o | 0;
    k[r + (n + 4) >> 2] = o | 3;
    h : do if ((a | 0) == (g | 0)) {
     D = (k[12992] | 0) + l | 0;
     k[12992] = D;
     k[12995] = p;
     k[r + (m + 4) >> 2] = D | 1;
    } else {
     if ((a | 0) == (k[12994] | 0)) {
      D = (k[12991] | 0) + l | 0;
      k[12991] = D;
      k[12994] = p;
      k[r + (m + 4) >> 2] = D | 1;
      k[r + (D + m) >> 2] = D;
      break;
     }
     g = q + 4 | 0;
     b = k[r + (g + j) >> 2] | 0;
     if ((b & 3 | 0) == 1) {
      i = b & -8;
      e = b >>> 3;
      i : do if (b >>> 0 < 256) {
       c = k[r + ((j | 8) + q) >> 2] | 0;
       d = k[r + (q + 12 + j) >> 2] | 0;
       b = 51996 + (e << 1 << 2) | 0;
       do if ((c | 0) != (b | 0)) {
        if (c >>> 0 < h >>> 0) qa();
        if ((k[c + 12 >> 2] | 0) == (a | 0)) break;
        qa();
       } while (0);
       if ((d | 0) == (c | 0)) {
        k[12989] = k[12989] & ~(1 << e);
        break;
       }
       do if ((d | 0) == (b | 0)) w = d + 8 | 0; else {
        if (d >>> 0 < h >>> 0) qa();
        b = d + 8 | 0;
        if ((k[b >> 2] | 0) == (a | 0)) {
         w = b;
         break;
        }
        qa();
       } while (0);
       k[c + 12 >> 2] = d;
       k[w >> 2] = c;
      } else {
       f = k[r + ((j | 24) + q) >> 2] | 0;
       d = k[r + (q + 12 + j) >> 2] | 0;
       do if ((d | 0) == (a | 0)) {
        d = j | 16;
        c = r + (g + d) | 0;
        b = k[c >> 2] | 0;
        if (!b) {
         c = r + (d + q) | 0;
         b = k[c >> 2] | 0;
         if (!b) {
          A = 0;
          break;
         }
        }
        while (1) {
         d = b + 20 | 0;
         e = k[d >> 2] | 0;
         if (e) {
          b = e;
          c = d;
          continue;
         }
         d = b + 16 | 0;
         e = k[d >> 2] | 0;
         if (!e) break; else {
          b = e;
          c = d;
         }
        }
        if (c >>> 0 < h >>> 0) qa(); else {
         k[c >> 2] = 0;
         A = b;
         break;
        }
       } else {
        e = k[r + ((j | 8) + q) >> 2] | 0;
        if (e >>> 0 < h >>> 0) qa();
        b = e + 12 | 0;
        if ((k[b >> 2] | 0) != (a | 0)) qa();
        c = d + 8 | 0;
        if ((k[c >> 2] | 0) == (a | 0)) {
         k[b >> 2] = d;
         k[c >> 2] = e;
         A = d;
         break;
        } else qa();
       } while (0);
       if (!f) break;
       b = k[r + (q + 28 + j) >> 2] | 0;
       c = 52260 + (b << 2) | 0;
       do if ((a | 0) == (k[c >> 2] | 0)) {
        k[c >> 2] = A;
        if (A) break;
        k[12990] = k[12990] & ~(1 << b);
        break i;
       } else {
        if (f >>> 0 < (k[12993] | 0) >>> 0) qa();
        b = f + 16 | 0;
        if ((k[b >> 2] | 0) == (a | 0)) k[b >> 2] = A; else k[f + 20 >> 2] = A;
        if (!A) break i;
       } while (0);
       c = k[12993] | 0;
       if (A >>> 0 < c >>> 0) qa();
       k[A + 24 >> 2] = f;
       a = j | 16;
       b = k[r + (a + q) >> 2] | 0;
       do if (b) if (b >>> 0 < c >>> 0) qa(); else {
        k[A + 16 >> 2] = b;
        k[b + 24 >> 2] = A;
        break;
       } while (0);
       a = k[r + (g + a) >> 2] | 0;
       if (!a) break;
       if (a >>> 0 < (k[12993] | 0) >>> 0) qa(); else {
        k[A + 20 >> 2] = a;
        k[a + 24 >> 2] = A;
        break;
       }
      } while (0);
      a = r + ((i | j) + q) | 0;
      e = i + l | 0;
     } else e = l;
     a = a + 4 | 0;
     k[a >> 2] = k[a >> 2] & -2;
     k[r + (m + 4) >> 2] = e | 1;
     k[r + (e + m) >> 2] = e;
     a = e >>> 3;
     if (e >>> 0 < 256) {
      b = a << 1;
      d = 51996 + (b << 2) | 0;
      c = k[12989] | 0;
      a = 1 << a;
      do if (!(c & a)) {
       k[12989] = c | a;
       B = 51996 + (b + 2 << 2) | 0;
       C = d;
      } else {
       a = 51996 + (b + 2 << 2) | 0;
       b = k[a >> 2] | 0;
       if (b >>> 0 >= (k[12993] | 0) >>> 0) {
        B = a;
        C = b;
        break;
       }
       qa();
      } while (0);
      k[B >> 2] = p;
      k[C + 12 >> 2] = p;
      k[r + (m + 8) >> 2] = C;
      k[r + (m + 12) >> 2] = d;
      break;
     }
     a = e >>> 8;
     do if (!a) d = 0; else {
      if (e >>> 0 > 16777215) {
       d = 31;
       break;
      }
      B = (a + 1048320 | 0) >>> 16 & 8;
      C = a << B;
      A = (C + 520192 | 0) >>> 16 & 4;
      C = C << A;
      d = (C + 245760 | 0) >>> 16 & 2;
      d = 14 - (A | B | d) + (C << d >>> 15) | 0;
      d = e >>> (d + 7 | 0) & 1 | d << 1;
     } while (0);
     a = 52260 + (d << 2) | 0;
     k[r + (m + 28) >> 2] = d;
     k[r + (m + 20) >> 2] = 0;
     k[r + (m + 16) >> 2] = 0;
     b = k[12990] | 0;
     c = 1 << d;
     if (!(b & c)) {
      k[12990] = b | c;
      k[a >> 2] = p;
      k[r + (m + 24) >> 2] = a;
      k[r + (m + 12) >> 2] = p;
      k[r + (m + 8) >> 2] = p;
      break;
     }
     a = k[a >> 2] | 0;
     j : do if ((k[a + 4 >> 2] & -8 | 0) == (e | 0)) D = a; else {
      d = e << ((d | 0) == 31 ? 0 : 25 - (d >>> 1) | 0);
      while (1) {
       b = a + 16 + (d >>> 31 << 2) | 0;
       c = k[b >> 2] | 0;
       if (!c) break;
       if ((k[c + 4 >> 2] & -8 | 0) == (e | 0)) {
        D = c;
        break j;
       } else {
        d = d << 1;
        a = c;
       }
      }
      if (b >>> 0 < (k[12993] | 0) >>> 0) qa(); else {
       k[b >> 2] = p;
       k[r + (m + 24) >> 2] = a;
       k[r + (m + 12) >> 2] = p;
       k[r + (m + 8) >> 2] = p;
       break h;
      }
     } while (0);
     a = D + 8 | 0;
     b = k[a >> 2] | 0;
     C = k[12993] | 0;
     if (b >>> 0 >= C >>> 0 & D >>> 0 >= C >>> 0) {
      k[b + 12 >> 2] = p;
      k[a >> 2] = p;
      k[r + (m + 8) >> 2] = b;
      k[r + (m + 12) >> 2] = D;
      k[r + (m + 24) >> 2] = 0;
      break;
     } else qa();
    } while (0);
    D = r + (n | 8) | 0;
    return D | 0;
   } else c = 52404;
   while (1) {
    b = k[c >> 2] | 0;
    if (b >>> 0 <= g >>> 0) {
     a = k[c + 4 >> 2] | 0;
     d = b + a | 0;
     if (d >>> 0 > g >>> 0) break;
    }
    c = k[c + 8 >> 2] | 0;
   }
   e = b + (a + -39) | 0;
   b = b + (a + -47 + ((e & 7 | 0) == 0 ? 0 : 0 - e & 7)) | 0;
   e = g + 16 | 0;
   b = b >>> 0 < e >>> 0 ? g : b;
   a = b + 8 | 0;
   c = r + 8 | 0;
   c = (c & 7 | 0) == 0 ? 0 : 0 - c & 7;
   D = q + -40 - c | 0;
   k[12995] = r + c;
   k[12992] = D;
   k[r + (c + 4) >> 2] = D | 1;
   k[r + (q + -36) >> 2] = 40;
   k[12996] = k[13111];
   c = b + 4 | 0;
   k[c >> 2] = 27;
   k[a >> 2] = k[13101];
   k[a + 4 >> 2] = k[13102];
   k[a + 8 >> 2] = k[13103];
   k[a + 12 >> 2] = k[13104];
   k[13101] = r;
   k[13102] = q;
   k[13104] = 0;
   k[13103] = a;
   a = b + 28 | 0;
   k[a >> 2] = 7;
   if ((b + 32 | 0) >>> 0 < d >>> 0) do {
    D = a;
    a = a + 4 | 0;
    k[a >> 2] = 7;
   } while ((D + 8 | 0) >>> 0 < d >>> 0);
   if ((b | 0) != (g | 0)) {
    f = b - g | 0;
    k[c >> 2] = k[c >> 2] & -2;
    k[g + 4 >> 2] = f | 1;
    k[b >> 2] = f;
    a = f >>> 3;
    if (f >>> 0 < 256) {
     b = a << 1;
     d = 51996 + (b << 2) | 0;
     c = k[12989] | 0;
     a = 1 << a;
     if (!(c & a)) {
      k[12989] = c | a;
      x = 51996 + (b + 2 << 2) | 0;
      y = d;
     } else {
      a = 51996 + (b + 2 << 2) | 0;
      b = k[a >> 2] | 0;
      if (b >>> 0 < (k[12993] | 0) >>> 0) qa(); else {
       x = a;
       y = b;
      }
     }
     k[x >> 2] = g;
     k[y + 12 >> 2] = g;
     k[g + 8 >> 2] = y;
     k[g + 12 >> 2] = d;
     break;
    }
    a = f >>> 8;
    if (!a) d = 0; else if (f >>> 0 > 16777215) d = 31; else {
     C = (a + 1048320 | 0) >>> 16 & 8;
     D = a << C;
     B = (D + 520192 | 0) >>> 16 & 4;
     D = D << B;
     d = (D + 245760 | 0) >>> 16 & 2;
     d = 14 - (B | C | d) + (D << d >>> 15) | 0;
     d = f >>> (d + 7 | 0) & 1 | d << 1;
    }
    c = 52260 + (d << 2) | 0;
    k[g + 28 >> 2] = d;
    k[g + 20 >> 2] = 0;
    k[e >> 2] = 0;
    a = k[12990] | 0;
    b = 1 << d;
    if (!(a & b)) {
     k[12990] = a | b;
     k[c >> 2] = g;
     k[g + 24 >> 2] = c;
     k[g + 12 >> 2] = g;
     k[g + 8 >> 2] = g;
     break;
    }
    a = k[c >> 2] | 0;
    k : do if ((k[a + 4 >> 2] & -8 | 0) == (f | 0)) z = a; else {
     d = f << ((d | 0) == 31 ? 0 : 25 - (d >>> 1) | 0);
     while (1) {
      b = a + 16 + (d >>> 31 << 2) | 0;
      c = k[b >> 2] | 0;
      if (!c) break;
      if ((k[c + 4 >> 2] & -8 | 0) == (f | 0)) {
       z = c;
       break k;
      } else {
       d = d << 1;
       a = c;
      }
     }
     if (b >>> 0 < (k[12993] | 0) >>> 0) qa(); else {
      k[b >> 2] = g;
      k[g + 24 >> 2] = a;
      k[g + 12 >> 2] = g;
      k[g + 8 >> 2] = g;
      break g;
     }
    } while (0);
    a = z + 8 | 0;
    b = k[a >> 2] | 0;
    D = k[12993] | 0;
    if (b >>> 0 >= D >>> 0 & z >>> 0 >= D >>> 0) {
     k[b + 12 >> 2] = g;
     k[a >> 2] = g;
     k[g + 8 >> 2] = b;
     k[g + 12 >> 2] = z;
     k[g + 24 >> 2] = 0;
     break;
    } else qa();
   }
  } while (0);
  a = k[12992] | 0;
  if (a >>> 0 > o >>> 0) {
   C = a - o | 0;
   k[12992] = C;
   D = k[12995] | 0;
   k[12995] = D + o;
   k[D + (o + 4) >> 2] = C | 1;
   k[D + 4 >> 2] = o | 3;
   D = D + 8 | 0;
   return D | 0;
  }
 }
 D = Ma() | 0;
 k[D >> 2] = 12;
 D = 0;
 return D | 0;
}

function Ia(a, b) {
 a = a | 0;
 b = b | 0;
 var c = 0, d = 0, e = 0.0, f = 0, g = 0, h = 0, m = 0, n = 0, p = 0, q = 0, s = 0, t = 0, u = 0.0, v = 0.0, w = 0, x = 0, y = 0.0, z = 0, A = 0, B = 0, C = 0;
 B = r;
 r = r + 1552 | 0;
 w = B + 1032 | 0;
 x = B + 8 | 0;
 z = B;
 A = Sa(19072, 1) | 0;
 if (!A) {
  r = B;
  return A | 0;
 }
 if (!(k[1026] | 0)) {
  d = 0;
  while (1) {
   c = (k[4108 + (d << 2) >> 2] | 0) + 2 >> 2;
   j[52452 + (d << 1) >> 1] = c;
   if (!d) {
    d = 1;
    continue;
   }
   j[52452 + (512 - d << 1) >> 1] = (d & 63 | 0) == 0 ? c : 0 - c | 0;
   d = d + 1 | 0;
   if ((d | 0) == 257) break;
  }
  m = 1;
  do {
   Za(w | 0, 0, 512) | 0;
   Za(x | 0, 0, 1024) | 0;
   c = k[5136 + (m * 12 | 0) >> 2] | 0;
   q = (c | 0) > 1 ? c : 1;
   d = k[5136 + (m * 12 | 0) + 4 >> 2] | 0;
   f = k[5136 + (m * 12 | 0) + 8 >> 2] | 0;
   n = 0;
   s = 0;
   while (1) {
    g = s << 5;
    h = (s | 0) != 0;
    p = n;
    t = 0;
    while (1) {
     C = t | g | (h & (t | 0) != 0 & 1) << 4;
     i[w + C >> 0] = i[d + p >> 0] | 0;
     j[x + (C << 1) >> 1] = j[f + (p << 1) >> 1] | 0;
     t = t + 1 | 0;
     if ((t | 0) >= (c | 0)) break; else p = p + 1 | 0;
    }
    s = s + 1 | 0;
    if ((s | 0) >= (c | 0)) break; else n = n + q | 0;
   }
   C = 5328 + (m << 4) | 0;
   k[C >> 2] = 7;
   if ((Ka(C, 7, 512, w, x, 2, 2, 0, 0) | 0) < 0) Ra(k[5328 + (m << 4) + 4 >> 2] | 0);
   m = m + 1 | 0;
  } while ((m | 0) != 16);
  k[1396] = 7;
  if ((Ka(5584, 7, 16, 57864, 57896, 1, 1, 0, 0) | 0) < 0) Ra(k[1397] | 0);
  k[1400] = 4;
  if ((Ka(5600, 4, 16, 57880, 57912, 1, 1, 0, 0) | 0) < 0) {
   Ra(k[1401] | 0);
   d = 0;
   f = 0;
   c = 0;
  } else {
   d = 0;
   f = 0;
   c = 0;
  }
  while (1) {
   j[53476 + (f << 1) >> 1] = d;
   c = (l[57928 + f >> 0] | 0) + c | 0;
   f = f + 1 | 0;
   if ((f | 0) == 22) break; else d = c & 65535;
  }
  j[26760] = 576;
  d = 0;
  f = 0;
  c = 0;
  while (1) {
   j[53522 + (f << 1) >> 1] = d;
   c = (l[57950 + f >> 0] | 0) + c | 0;
   f = f + 1 | 0;
   if ((f | 0) == 22) break; else d = c & 65535;
  }
  j[26783] = 576;
  d = 0;
  f = 0;
  c = 0;
  while (1) {
   j[53568 + (f << 1) >> 1] = d;
   c = (l[57972 + f >> 0] | 0) + c | 0;
   f = f + 1 | 0;
   if ((f | 0) == 22) break; else d = c & 65535;
  }
  j[26806] = 576;
  d = 0;
  f = 0;
  c = 0;
  while (1) {
   j[53614 + (f << 1) >> 1] = d;
   c = (l[57994 + f >> 0] | 0) + c | 0;
   f = f + 1 | 0;
   if ((f | 0) == 22) break; else d = c & 65535;
  }
  j[26829] = 576;
  d = 0;
  f = 0;
  c = 0;
  while (1) {
   j[53660 + (f << 1) >> 1] = d;
   c = (l[58016 + f >> 0] | 0) + c | 0;
   f = f + 1 | 0;
   if ((f | 0) == 22) break; else d = c & 65535;
  }
  j[26852] = 576;
  d = 0;
  f = 0;
  c = 0;
  while (1) {
   j[53706 + (f << 1) >> 1] = d;
   c = (l[58038 + f >> 0] | 0) + c | 0;
   f = f + 1 | 0;
   if ((f | 0) == 22) break; else d = c & 65535;
  }
  j[26875] = 576;
  d = 0;
  f = 0;
  c = 0;
  while (1) {
   j[53752 + (f << 1) >> 1] = d;
   c = (l[58060 + f >> 0] | 0) + c | 0;
   f = f + 1 | 0;
   if ((f | 0) == 22) break; else d = c & 65535;
  }
  j[26898] = 576;
  d = 0;
  f = 0;
  c = 0;
  while (1) {
   j[53798 + (f << 1) >> 1] = d;
   c = (l[58082 + f >> 0] | 0) + c | 0;
   f = f + 1 | 0;
   if ((f | 0) == 22) break; else d = c & 65535;
  }
  j[26921] = 576;
  d = 0;
  f = 0;
  c = 0;
  while (1) {
   j[53844 + (f << 1) >> 1] = d;
   c = (l[58104 + f >> 0] | 0) + c | 0;
   f = f + 1 | 0;
   if ((f | 0) == 22) break; else d = c & 65535;
  }
  j[26944] = 576;
  C = Qa(32828) | 0;
  k[1404] = C;
  if (C) {
   C = Qa(131312) | 0;
   k[1405] = C;
   if (C) {
    c = 1;
    do {
     y = +Y(+(+((c | 0) / 4 | 0 | 0)), 1.3333333333333333);
     x = ~~(+Oa(y * +Na(+(c & 3 | 0) * .25), z) * 2147483648.0 + .5) >>> 0;
     C = k[z >> 2] | 0;
     k[z >> 2] = C + -111;
     k[(k[1405] | 0) + (c << 2) >> 2] = x;
     i[(k[1404] | 0) + c >> 0] = 111 - C;
     c = c + 1 | 0;
    } while ((c | 0) != 32828);
    f = 0;
    do {
     c = f >> 4;
     C = f & 15;
     y = +Y(+(+(C | 0)), 1.3333333333333333);
     d = ~~(y * +Na(+(c + -400 | 0) * .25 + 15.0 + 5.0)) >>> 0;
     k[5624 + (c << 6) + (C << 2) >> 2] = d;
     if ((C | 0) == 1) k[38392 + (c << 2) >> 2] = d;
     f = f + 1 | 0;
    } while ((f | 0) != 8192);
    k[10110] = 0;
    k[10132] = 0;
    k[10111] = 6925;
    k[10131] = 6925;
    k[10112] = 11994;
    k[10130] = 11994;
    k[10113] = 16384;
    k[10129] = 16384;
    k[10114] = 20774;
    k[10128] = 20774;
    k[10115] = 25843;
    k[10127] = 25843;
    k[10116] = 32768;
    k[10126] = 32768;
    c = 40468;
    d = c + 36 | 0;
    do {
     k[c >> 2] = 0;
     c = c + 4 | 0;
    } while ((c | 0) < (d | 0));
    c = 40532;
    d = c + 36 | 0;
    do {
     k[c >> 2] = 0;
     c = c + 4 | 0;
    } while ((c | 0) < (d | 0));
    c = 0;
    do {
     C = c;
     c = c + 1 | 0;
     w = c >> 1;
     z = C & 1;
     x = z ^ 1;
     t = ~~(+Na(+(0 - w | 0) * .25) * 32768.0 + .5);
     k[40568 + (x << 6) + (C << 2) >> 2] = t;
     k[40568 + (z << 6) + (C << 2) >> 2] = 32768;
     w = ~~(+Na(+(ha(w, -2) | 0) * .25) * 32768.0 + .5);
     k[40696 + (x << 6) + (C << 2) >> 2] = w;
     k[40696 + (z << 6) + (C << 2) >> 2] = 32768;
    } while ((c | 0) != 16);
    c = 0;
    do {
     v = +o[40824 + (c << 2) >> 2];
     y = 1.0 / +X(+(v * v + 1.0));
     C = ~~(y * .25 * 4294967296.0 + .5);
     k[40856 + (c << 4) >> 2] = C;
     z = ~~(v * y * .25 * 4294967296.0 + .5);
     k[40856 + (c << 4) + 4 >> 2] = z;
     k[40856 + (c << 4) + 8 >> 2] = z + C;
     k[40856 + (c << 4) + 12 >> 2] = z - C;
     c = c + 1 | 0;
    } while ((c | 0) != 8);
    q = 0;
    do {
     g = (q | 0) / 3 | 0;
     c = (q | 0) > 29;
     d = (q | 0) > 23;
     e = (+(q + -18 | 0) + .5) * 3.141592653589793 / 12.0;
     f = (q | 0) > 17;
     m = (q | 0) < 6;
     n = (q | 0) < 12;
     u = (+(q + -6 | 0) + .5) * 3.141592653589793 / 12.0;
     p = (q | 0) < 18;
     v = +_(+((+(q | 0) + .5) * 3.141592653589793 / 36.0));
     y = .5 / +Z(+(+((q << 1) + 19 | 0) * 3.141592653589793 / 72.0));
     h = ~~(v * y * .03125 * 4294967296.0 + .5);
     k[40984 + (q << 2) >> 2] = h;
     if (((q | 0) % 3 | 0 | 0) == 1) {
      do if (c) e = 0.0; else if (d) {
       e = +_(+e);
       break;
      } else {
       e = f ? 1.0 : v;
       break;
      } while (0);
      k[41128 + (q << 2) >> 2] = ~~(y * e * .03125 * 4294967296.0 + .5);
      k[41272 + (g << 2) >> 2] = h;
      do if (m) e = 0.0; else if (n) {
       e = +_(+u);
       break;
      } else {
       e = p ? 1.0 : v;
       break;
      } while (0);
      k[41416 + (q << 2) >> 2] = ~~(y * e * .03125 * 4294967296.0 + .5);
     } else {
      do if (c) e = 0.0; else if (d) {
       e = +_(+e);
       break;
      } else {
       e = f ? 1.0 : v;
       break;
      } while (0);
      k[41128 + (q << 2) >> 2] = ~~(y * e * .03125 * 4294967296.0 + .5);
      do if (m) e = 0.0; else if (n) {
       e = +_(+u);
       break;
      } else {
       e = p ? 1.0 : v;
       break;
      } while (0);
      k[41416 + (q << 2) >> 2] = ~~(y * e * .03125 * 4294967296.0 + .5);
     }
     q = q + 1 | 0;
    } while ((q | 0) != 36);
    c = 0;
    do {
     k[41560 + (c << 2) >> 2] = k[40984 + (c << 2) >> 2];
     C = c | 1;
     k[41560 + (C << 2) >> 2] = 0 - (k[40984 + (C << 2) >> 2] | 0);
     c = c + 2 | 0;
    } while ((c | 0) < 36);
    c = 0;
    do {
     k[41704 + (c << 2) >> 2] = k[41128 + (c << 2) >> 2];
     C = c | 1;
     k[41704 + (C << 2) >> 2] = 0 - (k[41128 + (C << 2) >> 2] | 0);
     c = c + 2 | 0;
    } while ((c | 0) < 36);
    c = 0;
    do {
     k[41848 + (c << 2) >> 2] = k[41272 + (c << 2) >> 2];
     C = c | 1;
     k[41848 + (C << 2) >> 2] = 0 - (k[41272 + (C << 2) >> 2] | 0);
     c = c + 2 | 0;
    } while ((c | 0) < 36);
    c = 0;
    do {
     k[41992 + (c << 2) >> 2] = k[41416 + (c << 2) >> 2];
     C = c | 1;
     k[41992 + (C << 2) >> 2] = 0 - (k[41416 + (C << 2) >> 2] | 0);
     c = c + 2 | 0;
    } while ((c | 0) < 36);
    k[1026] = 1;
   }
  }
 }
 k[A + 20 >> 2] = a;
 k[A + 24 >> 2] = b;
 C = Qa(4608) | 0;
 k[A >> 2] = C;
 r = B;
 return A | 0;
}

function Ra(a) {
 a = a | 0;
 var b = 0, c = 0, d = 0, e = 0, f = 0, g = 0, h = 0, i = 0, j = 0, l = 0, m = 0, n = 0, o = 0, p = 0, q = 0, r = 0, s = 0, t = 0, u = 0;
 if (!a) return;
 b = a + -8 | 0;
 h = k[12993] | 0;
 if (b >>> 0 < h >>> 0) qa();
 c = k[a + -4 >> 2] | 0;
 d = c & 3;
 if ((d | 0) == 1) qa();
 o = c & -8;
 q = a + (o + -8) | 0;
 do if (!(c & 1)) {
  b = k[b >> 2] | 0;
  if (!d) return;
  i = -8 - b | 0;
  l = a + i | 0;
  m = b + o | 0;
  if (l >>> 0 < h >>> 0) qa();
  if ((l | 0) == (k[12994] | 0)) {
   b = a + (o + -4) | 0;
   c = k[b >> 2] | 0;
   if ((c & 3 | 0) != 3) {
    u = l;
    f = m;
    break;
   }
   k[12991] = m;
   k[b >> 2] = c & -2;
   k[a + (i + 4) >> 2] = m | 1;
   k[q >> 2] = m;
   return;
  }
  e = b >>> 3;
  if (b >>> 0 < 256) {
   d = k[a + (i + 8) >> 2] | 0;
   c = k[a + (i + 12) >> 2] | 0;
   b = 51996 + (e << 1 << 2) | 0;
   if ((d | 0) != (b | 0)) {
    if (d >>> 0 < h >>> 0) qa();
    if ((k[d + 12 >> 2] | 0) != (l | 0)) qa();
   }
   if ((c | 0) == (d | 0)) {
    k[12989] = k[12989] & ~(1 << e);
    u = l;
    f = m;
    break;
   }
   if ((c | 0) == (b | 0)) g = c + 8 | 0; else {
    if (c >>> 0 < h >>> 0) qa();
    b = c + 8 | 0;
    if ((k[b >> 2] | 0) == (l | 0)) g = b; else qa();
   }
   k[d + 12 >> 2] = c;
   k[g >> 2] = d;
   u = l;
   f = m;
   break;
  }
  g = k[a + (i + 24) >> 2] | 0;
  d = k[a + (i + 12) >> 2] | 0;
  do if ((d | 0) == (l | 0)) {
   c = a + (i + 20) | 0;
   b = k[c >> 2] | 0;
   if (!b) {
    c = a + (i + 16) | 0;
    b = k[c >> 2] | 0;
    if (!b) {
     j = 0;
     break;
    }
   }
   while (1) {
    d = b + 20 | 0;
    e = k[d >> 2] | 0;
    if (e) {
     b = e;
     c = d;
     continue;
    }
    d = b + 16 | 0;
    e = k[d >> 2] | 0;
    if (!e) break; else {
     b = e;
     c = d;
    }
   }
   if (c >>> 0 < h >>> 0) qa(); else {
    k[c >> 2] = 0;
    j = b;
    break;
   }
  } else {
   e = k[a + (i + 8) >> 2] | 0;
   if (e >>> 0 < h >>> 0) qa();
   b = e + 12 | 0;
   if ((k[b >> 2] | 0) != (l | 0)) qa();
   c = d + 8 | 0;
   if ((k[c >> 2] | 0) == (l | 0)) {
    k[b >> 2] = d;
    k[c >> 2] = e;
    j = d;
    break;
   } else qa();
  } while (0);
  if (!g) {
   u = l;
   f = m;
  } else {
   b = k[a + (i + 28) >> 2] | 0;
   c = 52260 + (b << 2) | 0;
   if ((l | 0) == (k[c >> 2] | 0)) {
    k[c >> 2] = j;
    if (!j) {
     k[12990] = k[12990] & ~(1 << b);
     u = l;
     f = m;
     break;
    }
   } else {
    if (g >>> 0 < (k[12993] | 0) >>> 0) qa();
    b = g + 16 | 0;
    if ((k[b >> 2] | 0) == (l | 0)) k[b >> 2] = j; else k[g + 20 >> 2] = j;
    if (!j) {
     u = l;
     f = m;
     break;
    }
   }
   c = k[12993] | 0;
   if (j >>> 0 < c >>> 0) qa();
   k[j + 24 >> 2] = g;
   b = k[a + (i + 16) >> 2] | 0;
   do if (b) if (b >>> 0 < c >>> 0) qa(); else {
    k[j + 16 >> 2] = b;
    k[b + 24 >> 2] = j;
    break;
   } while (0);
   b = k[a + (i + 20) >> 2] | 0;
   if (!b) {
    u = l;
    f = m;
   } else if (b >>> 0 < (k[12993] | 0) >>> 0) qa(); else {
    k[j + 20 >> 2] = b;
    k[b + 24 >> 2] = j;
    u = l;
    f = m;
    break;
   }
  }
 } else {
  u = b;
  f = o;
 } while (0);
 if (u >>> 0 >= q >>> 0) qa();
 b = a + (o + -4) | 0;
 c = k[b >> 2] | 0;
 if (!(c & 1)) qa();
 if (!(c & 2)) {
  if ((q | 0) == (k[12995] | 0)) {
   t = (k[12992] | 0) + f | 0;
   k[12992] = t;
   k[12995] = u;
   k[u + 4 >> 2] = t | 1;
   if ((u | 0) != (k[12994] | 0)) return;
   k[12994] = 0;
   k[12991] = 0;
   return;
  }
  if ((q | 0) == (k[12994] | 0)) {
   t = (k[12991] | 0) + f | 0;
   k[12991] = t;
   k[12994] = u;
   k[u + 4 >> 2] = t | 1;
   k[u + t >> 2] = t;
   return;
  }
  f = (c & -8) + f | 0;
  e = c >>> 3;
  do if (c >>> 0 < 256) {
   d = k[a + o >> 2] | 0;
   c = k[a + (o | 4) >> 2] | 0;
   b = 51996 + (e << 1 << 2) | 0;
   if ((d | 0) != (b | 0)) {
    if (d >>> 0 < (k[12993] | 0) >>> 0) qa();
    if ((k[d + 12 >> 2] | 0) != (q | 0)) qa();
   }
   if ((c | 0) == (d | 0)) {
    k[12989] = k[12989] & ~(1 << e);
    break;
   }
   if ((c | 0) == (b | 0)) n = c + 8 | 0; else {
    if (c >>> 0 < (k[12993] | 0) >>> 0) qa();
    b = c + 8 | 0;
    if ((k[b >> 2] | 0) == (q | 0)) n = b; else qa();
   }
   k[d + 12 >> 2] = c;
   k[n >> 2] = d;
  } else {
   g = k[a + (o + 16) >> 2] | 0;
   b = k[a + (o | 4) >> 2] | 0;
   do if ((b | 0) == (q | 0)) {
    c = a + (o + 12) | 0;
    b = k[c >> 2] | 0;
    if (!b) {
     c = a + (o + 8) | 0;
     b = k[c >> 2] | 0;
     if (!b) {
      p = 0;
      break;
     }
    }
    while (1) {
     d = b + 20 | 0;
     e = k[d >> 2] | 0;
     if (e) {
      b = e;
      c = d;
      continue;
     }
     d = b + 16 | 0;
     e = k[d >> 2] | 0;
     if (!e) break; else {
      b = e;
      c = d;
     }
    }
    if (c >>> 0 < (k[12993] | 0) >>> 0) qa(); else {
     k[c >> 2] = 0;
     p = b;
     break;
    }
   } else {
    c = k[a + o >> 2] | 0;
    if (c >>> 0 < (k[12993] | 0) >>> 0) qa();
    d = c + 12 | 0;
    if ((k[d >> 2] | 0) != (q | 0)) qa();
    e = b + 8 | 0;
    if ((k[e >> 2] | 0) == (q | 0)) {
     k[d >> 2] = b;
     k[e >> 2] = c;
     p = b;
     break;
    } else qa();
   } while (0);
   if (g) {
    b = k[a + (o + 20) >> 2] | 0;
    c = 52260 + (b << 2) | 0;
    if ((q | 0) == (k[c >> 2] | 0)) {
     k[c >> 2] = p;
     if (!p) {
      k[12990] = k[12990] & ~(1 << b);
      break;
     }
    } else {
     if (g >>> 0 < (k[12993] | 0) >>> 0) qa();
     b = g + 16 | 0;
     if ((k[b >> 2] | 0) == (q | 0)) k[b >> 2] = p; else k[g + 20 >> 2] = p;
     if (!p) break;
    }
    c = k[12993] | 0;
    if (p >>> 0 < c >>> 0) qa();
    k[p + 24 >> 2] = g;
    b = k[a + (o + 8) >> 2] | 0;
    do if (b) if (b >>> 0 < c >>> 0) qa(); else {
     k[p + 16 >> 2] = b;
     k[b + 24 >> 2] = p;
     break;
    } while (0);
    b = k[a + (o + 12) >> 2] | 0;
    if (b) if (b >>> 0 < (k[12993] | 0) >>> 0) qa(); else {
     k[p + 20 >> 2] = b;
     k[b + 24 >> 2] = p;
     break;
    }
   }
  } while (0);
  k[u + 4 >> 2] = f | 1;
  k[u + f >> 2] = f;
  if ((u | 0) == (k[12994] | 0)) {
   k[12991] = f;
   return;
  }
 } else {
  k[b >> 2] = c & -2;
  k[u + 4 >> 2] = f | 1;
  k[u + f >> 2] = f;
 }
 b = f >>> 3;
 if (f >>> 0 < 256) {
  c = b << 1;
  e = 51996 + (c << 2) | 0;
  d = k[12989] | 0;
  b = 1 << b;
  if (!(d & b)) {
   k[12989] = d | b;
   r = 51996 + (c + 2 << 2) | 0;
   s = e;
  } else {
   b = 51996 + (c + 2 << 2) | 0;
   c = k[b >> 2] | 0;
   if (c >>> 0 < (k[12993] | 0) >>> 0) qa(); else {
    r = b;
    s = c;
   }
  }
  k[r >> 2] = u;
  k[s + 12 >> 2] = u;
  k[u + 8 >> 2] = s;
  k[u + 12 >> 2] = e;
  return;
 }
 b = f >>> 8;
 if (!b) e = 0; else if (f >>> 0 > 16777215) e = 31; else {
  r = (b + 1048320 | 0) >>> 16 & 8;
  s = b << r;
  q = (s + 520192 | 0) >>> 16 & 4;
  s = s << q;
  e = (s + 245760 | 0) >>> 16 & 2;
  e = 14 - (q | r | e) + (s << e >>> 15) | 0;
  e = f >>> (e + 7 | 0) & 1 | e << 1;
 }
 b = 52260 + (e << 2) | 0;
 k[u + 28 >> 2] = e;
 k[u + 20 >> 2] = 0;
 k[u + 16 >> 2] = 0;
 c = k[12990] | 0;
 d = 1 << e;
 a : do if (!(c & d)) {
  k[12990] = c | d;
  k[b >> 2] = u;
  k[u + 24 >> 2] = b;
  k[u + 12 >> 2] = u;
  k[u + 8 >> 2] = u;
 } else {
  b = k[b >> 2] | 0;
  b : do if ((k[b + 4 >> 2] & -8 | 0) == (f | 0)) t = b; else {
   e = f << ((e | 0) == 31 ? 0 : 25 - (e >>> 1) | 0);
   while (1) {
    c = b + 16 + (e >>> 31 << 2) | 0;
    d = k[c >> 2] | 0;
    if (!d) break;
    if ((k[d + 4 >> 2] & -8 | 0) == (f | 0)) {
     t = d;
     break b;
    } else {
     e = e << 1;
     b = d;
    }
   }
   if (c >>> 0 < (k[12993] | 0) >>> 0) qa(); else {
    k[c >> 2] = u;
    k[u + 24 >> 2] = b;
    k[u + 12 >> 2] = u;
    k[u + 8 >> 2] = u;
    break a;
   }
  } while (0);
  b = t + 8 | 0;
  c = k[b >> 2] | 0;
  s = k[12993] | 0;
  if (c >>> 0 >= s >>> 0 & t >>> 0 >= s >>> 0) {
   k[c + 12 >> 2] = u;
   k[b >> 2] = u;
   k[u + 8 >> 2] = c;
   k[u + 12 >> 2] = t;
   k[u + 24 >> 2] = 0;
   break;
  } else qa();
 } while (0);
 u = (k[12997] | 0) + -1 | 0;
 k[12997] = u;
 if (!u) b = 52412; else return;
 while (1) {
  b = k[b >> 2] | 0;
  if (!b) break; else b = b + 8 | 0;
 }
 k[12997] = -1;
 return;
}

function Va(a, b) {
 a = a | 0;
 b = b | 0;
 var c = 0, d = 0, e = 0, f = 0, g = 0, h = 0, i = 0, j = 0, l = 0, m = 0, n = 0, o = 0, p = 0, q = 0, r = 0, s = 0, t = 0;
 q = a + b | 0;
 c = k[a + 4 >> 2] | 0;
 do if (!(c & 1)) {
  j = k[a >> 2] | 0;
  if (!(c & 3)) return;
  n = a + (0 - j) | 0;
  m = j + b | 0;
  i = k[12993] | 0;
  if (n >>> 0 < i >>> 0) qa();
  if ((n | 0) == (k[12994] | 0)) {
   d = a + (b + 4) | 0;
   c = k[d >> 2] | 0;
   if ((c & 3 | 0) != 3) {
    t = n;
    g = m;
    break;
   }
   k[12991] = m;
   k[d >> 2] = c & -2;
   k[a + (4 - j) >> 2] = m | 1;
   k[q >> 2] = m;
   return;
  }
  f = j >>> 3;
  if (j >>> 0 < 256) {
   e = k[a + (8 - j) >> 2] | 0;
   d = k[a + (12 - j) >> 2] | 0;
   c = 51996 + (f << 1 << 2) | 0;
   if ((e | 0) != (c | 0)) {
    if (e >>> 0 < i >>> 0) qa();
    if ((k[e + 12 >> 2] | 0) != (n | 0)) qa();
   }
   if ((d | 0) == (e | 0)) {
    k[12989] = k[12989] & ~(1 << f);
    t = n;
    g = m;
    break;
   }
   if ((d | 0) == (c | 0)) h = d + 8 | 0; else {
    if (d >>> 0 < i >>> 0) qa();
    c = d + 8 | 0;
    if ((k[c >> 2] | 0) == (n | 0)) h = c; else qa();
   }
   k[e + 12 >> 2] = d;
   k[h >> 2] = e;
   t = n;
   g = m;
   break;
  }
  h = k[a + (24 - j) >> 2] | 0;
  e = k[a + (12 - j) >> 2] | 0;
  do if ((e | 0) == (n | 0)) {
   e = 16 - j | 0;
   d = a + (e + 4) | 0;
   c = k[d >> 2] | 0;
   if (!c) {
    d = a + e | 0;
    c = k[d >> 2] | 0;
    if (!c) {
     l = 0;
     break;
    }
   }
   while (1) {
    e = c + 20 | 0;
    f = k[e >> 2] | 0;
    if (f) {
     c = f;
     d = e;
     continue;
    }
    e = c + 16 | 0;
    f = k[e >> 2] | 0;
    if (!f) break; else {
     c = f;
     d = e;
    }
   }
   if (d >>> 0 < i >>> 0) qa(); else {
    k[d >> 2] = 0;
    l = c;
    break;
   }
  } else {
   f = k[a + (8 - j) >> 2] | 0;
   if (f >>> 0 < i >>> 0) qa();
   c = f + 12 | 0;
   if ((k[c >> 2] | 0) != (n | 0)) qa();
   d = e + 8 | 0;
   if ((k[d >> 2] | 0) == (n | 0)) {
    k[c >> 2] = e;
    k[d >> 2] = f;
    l = e;
    break;
   } else qa();
  } while (0);
  if (!h) {
   t = n;
   g = m;
  } else {
   c = k[a + (28 - j) >> 2] | 0;
   d = 52260 + (c << 2) | 0;
   if ((n | 0) == (k[d >> 2] | 0)) {
    k[d >> 2] = l;
    if (!l) {
     k[12990] = k[12990] & ~(1 << c);
     t = n;
     g = m;
     break;
    }
   } else {
    if (h >>> 0 < (k[12993] | 0) >>> 0) qa();
    c = h + 16 | 0;
    if ((k[c >> 2] | 0) == (n | 0)) k[c >> 2] = l; else k[h + 20 >> 2] = l;
    if (!l) {
     t = n;
     g = m;
     break;
    }
   }
   e = k[12993] | 0;
   if (l >>> 0 < e >>> 0) qa();
   k[l + 24 >> 2] = h;
   c = 16 - j | 0;
   d = k[a + c >> 2] | 0;
   do if (d) if (d >>> 0 < e >>> 0) qa(); else {
    k[l + 16 >> 2] = d;
    k[d + 24 >> 2] = l;
    break;
   } while (0);
   c = k[a + (c + 4) >> 2] | 0;
   if (!c) {
    t = n;
    g = m;
   } else if (c >>> 0 < (k[12993] | 0) >>> 0) qa(); else {
    k[l + 20 >> 2] = c;
    k[c + 24 >> 2] = l;
    t = n;
    g = m;
    break;
   }
  }
 } else {
  t = a;
  g = b;
 } while (0);
 i = k[12993] | 0;
 if (q >>> 0 < i >>> 0) qa();
 c = a + (b + 4) | 0;
 d = k[c >> 2] | 0;
 if (!(d & 2)) {
  if ((q | 0) == (k[12995] | 0)) {
   s = (k[12992] | 0) + g | 0;
   k[12992] = s;
   k[12995] = t;
   k[t + 4 >> 2] = s | 1;
   if ((t | 0) != (k[12994] | 0)) return;
   k[12994] = 0;
   k[12991] = 0;
   return;
  }
  if ((q | 0) == (k[12994] | 0)) {
   s = (k[12991] | 0) + g | 0;
   k[12991] = s;
   k[12994] = t;
   k[t + 4 >> 2] = s | 1;
   k[t + s >> 2] = s;
   return;
  }
  g = (d & -8) + g | 0;
  f = d >>> 3;
  do if (d >>> 0 < 256) {
   e = k[a + (b + 8) >> 2] | 0;
   d = k[a + (b + 12) >> 2] | 0;
   c = 51996 + (f << 1 << 2) | 0;
   if ((e | 0) != (c | 0)) {
    if (e >>> 0 < i >>> 0) qa();
    if ((k[e + 12 >> 2] | 0) != (q | 0)) qa();
   }
   if ((d | 0) == (e | 0)) {
    k[12989] = k[12989] & ~(1 << f);
    break;
   }
   if ((d | 0) == (c | 0)) o = d + 8 | 0; else {
    if (d >>> 0 < i >>> 0) qa();
    c = d + 8 | 0;
    if ((k[c >> 2] | 0) == (q | 0)) o = c; else qa();
   }
   k[e + 12 >> 2] = d;
   k[o >> 2] = e;
  } else {
   h = k[a + (b + 24) >> 2] | 0;
   e = k[a + (b + 12) >> 2] | 0;
   do if ((e | 0) == (q | 0)) {
    d = a + (b + 20) | 0;
    c = k[d >> 2] | 0;
    if (!c) {
     d = a + (b + 16) | 0;
     c = k[d >> 2] | 0;
     if (!c) {
      p = 0;
      break;
     }
    }
    while (1) {
     e = c + 20 | 0;
     f = k[e >> 2] | 0;
     if (f) {
      c = f;
      d = e;
      continue;
     }
     e = c + 16 | 0;
     f = k[e >> 2] | 0;
     if (!f) break; else {
      c = f;
      d = e;
     }
    }
    if (d >>> 0 < i >>> 0) qa(); else {
     k[d >> 2] = 0;
     p = c;
     break;
    }
   } else {
    f = k[a + (b + 8) >> 2] | 0;
    if (f >>> 0 < i >>> 0) qa();
    c = f + 12 | 0;
    if ((k[c >> 2] | 0) != (q | 0)) qa();
    d = e + 8 | 0;
    if ((k[d >> 2] | 0) == (q | 0)) {
     k[c >> 2] = e;
     k[d >> 2] = f;
     p = e;
     break;
    } else qa();
   } while (0);
   if (h) {
    c = k[a + (b + 28) >> 2] | 0;
    d = 52260 + (c << 2) | 0;
    if ((q | 0) == (k[d >> 2] | 0)) {
     k[d >> 2] = p;
     if (!p) {
      k[12990] = k[12990] & ~(1 << c);
      break;
     }
    } else {
     if (h >>> 0 < (k[12993] | 0) >>> 0) qa();
     c = h + 16 | 0;
     if ((k[c >> 2] | 0) == (q | 0)) k[c >> 2] = p; else k[h + 20 >> 2] = p;
     if (!p) break;
    }
    d = k[12993] | 0;
    if (p >>> 0 < d >>> 0) qa();
    k[p + 24 >> 2] = h;
    c = k[a + (b + 16) >> 2] | 0;
    do if (c) if (c >>> 0 < d >>> 0) qa(); else {
     k[p + 16 >> 2] = c;
     k[c + 24 >> 2] = p;
     break;
    } while (0);
    c = k[a + (b + 20) >> 2] | 0;
    if (c) if (c >>> 0 < (k[12993] | 0) >>> 0) qa(); else {
     k[p + 20 >> 2] = c;
     k[c + 24 >> 2] = p;
     break;
    }
   }
  } while (0);
  k[t + 4 >> 2] = g | 1;
  k[t + g >> 2] = g;
  if ((t | 0) == (k[12994] | 0)) {
   k[12991] = g;
   return;
  }
 } else {
  k[c >> 2] = d & -2;
  k[t + 4 >> 2] = g | 1;
  k[t + g >> 2] = g;
 }
 c = g >>> 3;
 if (g >>> 0 < 256) {
  d = c << 1;
  f = 51996 + (d << 2) | 0;
  e = k[12989] | 0;
  c = 1 << c;
  if (!(e & c)) {
   k[12989] = e | c;
   r = 51996 + (d + 2 << 2) | 0;
   s = f;
  } else {
   c = 51996 + (d + 2 << 2) | 0;
   d = k[c >> 2] | 0;
   if (d >>> 0 < (k[12993] | 0) >>> 0) qa(); else {
    r = c;
    s = d;
   }
  }
  k[r >> 2] = t;
  k[s + 12 >> 2] = t;
  k[t + 8 >> 2] = s;
  k[t + 12 >> 2] = f;
  return;
 }
 c = g >>> 8;
 if (!c) f = 0; else if (g >>> 0 > 16777215) f = 31; else {
  r = (c + 1048320 | 0) >>> 16 & 8;
  s = c << r;
  q = (s + 520192 | 0) >>> 16 & 4;
  s = s << q;
  f = (s + 245760 | 0) >>> 16 & 2;
  f = 14 - (q | r | f) + (s << f >>> 15) | 0;
  f = g >>> (f + 7 | 0) & 1 | f << 1;
 }
 c = 52260 + (f << 2) | 0;
 k[t + 28 >> 2] = f;
 k[t + 20 >> 2] = 0;
 k[t + 16 >> 2] = 0;
 d = k[12990] | 0;
 e = 1 << f;
 if (!(d & e)) {
  k[12990] = d | e;
  k[c >> 2] = t;
  k[t + 24 >> 2] = c;
  k[t + 12 >> 2] = t;
  k[t + 8 >> 2] = t;
  return;
 }
 c = k[c >> 2] | 0;
 a : do if ((k[c + 4 >> 2] & -8 | 0) != (g | 0)) {
  f = g << ((f | 0) == 31 ? 0 : 25 - (f >>> 1) | 0);
  while (1) {
   d = c + 16 + (f >>> 31 << 2) | 0;
   e = k[d >> 2] | 0;
   if (!e) break;
   if ((k[e + 4 >> 2] & -8 | 0) == (g | 0)) {
    c = e;
    break a;
   } else {
    f = f << 1;
    c = e;
   }
  }
  if (d >>> 0 < (k[12993] | 0) >>> 0) qa();
  k[d >> 2] = t;
  k[t + 24 >> 2] = c;
  k[t + 12 >> 2] = t;
  k[t + 8 >> 2] = t;
  return;
 } while (0);
 d = c + 8 | 0;
 e = k[d >> 2] | 0;
 s = k[12993] | 0;
 if (!(e >>> 0 >= s >>> 0 & c >>> 0 >= s >>> 0)) qa();
 k[e + 12 >> 2] = t;
 k[d >> 2] = t;
 k[t + 8 >> 2] = e;
 k[t + 12 >> 2] = c;
 k[t + 24 >> 2] = 0;
 return;
}

function Ua(a, b) {
 a = a | 0;
 b = b | 0;
 var c = 0, d = 0, e = 0, f = 0, g = 0, h = 0, i = 0, j = 0, l = 0, m = 0, n = 0, o = 0, p = 0;
 o = a + 4 | 0;
 p = k[o >> 2] | 0;
 i = p & -8;
 l = a + i | 0;
 h = k[12993] | 0;
 c = p & 3;
 if (!((c | 0) != 1 & a >>> 0 >= h >>> 0 & a >>> 0 < l >>> 0)) qa();
 d = a + (i | 4) | 0;
 e = k[d >> 2] | 0;
 if (!(e & 1)) qa();
 if (!c) {
  if (b >>> 0 < 256) {
   a = 0;
   return a | 0;
  }
  if (i >>> 0 >= (b + 4 | 0) >>> 0) if ((i - b | 0) >>> 0 <= k[13109] << 1 >>> 0) return a | 0;
  a = 0;
  return a | 0;
 }
 if (i >>> 0 >= b >>> 0) {
  c = i - b | 0;
  if (c >>> 0 <= 15) return a | 0;
  k[o >> 2] = p & 1 | b | 2;
  k[a + (b + 4) >> 2] = c | 3;
  k[d >> 2] = k[d >> 2] | 1;
  Va(a + b | 0, c);
  return a | 0;
 }
 if ((l | 0) == (k[12995] | 0)) {
  c = (k[12992] | 0) + i | 0;
  if (c >>> 0 <= b >>> 0) {
   a = 0;
   return a | 0;
  }
  n = c - b | 0;
  k[o >> 2] = p & 1 | b | 2;
  k[a + (b + 4) >> 2] = n | 1;
  k[12995] = a + b;
  k[12992] = n;
  return a | 0;
 }
 if ((l | 0) == (k[12994] | 0)) {
  d = (k[12991] | 0) + i | 0;
  if (d >>> 0 < b >>> 0) {
   a = 0;
   return a | 0;
  }
  c = d - b | 0;
  if (c >>> 0 > 15) {
   k[o >> 2] = p & 1 | b | 2;
   k[a + (b + 4) >> 2] = c | 1;
   k[a + d >> 2] = c;
   d = a + (d + 4) | 0;
   k[d >> 2] = k[d >> 2] & -2;
   d = a + b | 0;
  } else {
   k[o >> 2] = p & 1 | d | 2;
   d = a + (d + 4) | 0;
   k[d >> 2] = k[d >> 2] | 1;
   d = 0;
   c = 0;
  }
  k[12991] = c;
  k[12994] = d;
  return a | 0;
 }
 if (e & 2) {
  a = 0;
  return a | 0;
 }
 m = (e & -8) + i | 0;
 if (m >>> 0 < b >>> 0) {
  a = 0;
  return a | 0;
 }
 n = m - b | 0;
 f = e >>> 3;
 do if (e >>> 0 < 256) {
  e = k[a + (i + 8) >> 2] | 0;
  d = k[a + (i + 12) >> 2] | 0;
  c = 51996 + (f << 1 << 2) | 0;
  if ((e | 0) != (c | 0)) {
   if (e >>> 0 < h >>> 0) qa();
   if ((k[e + 12 >> 2] | 0) != (l | 0)) qa();
  }
  if ((d | 0) == (e | 0)) {
   k[12989] = k[12989] & ~(1 << f);
   break;
  }
  if ((d | 0) == (c | 0)) g = d + 8 | 0; else {
   if (d >>> 0 < h >>> 0) qa();
   c = d + 8 | 0;
   if ((k[c >> 2] | 0) == (l | 0)) g = c; else qa();
  }
  k[e + 12 >> 2] = d;
  k[g >> 2] = e;
 } else {
  g = k[a + (i + 24) >> 2] | 0;
  f = k[a + (i + 12) >> 2] | 0;
  do if ((f | 0) == (l | 0)) {
   d = a + (i + 20) | 0;
   c = k[d >> 2] | 0;
   if (!c) {
    d = a + (i + 16) | 0;
    c = k[d >> 2] | 0;
    if (!c) {
     j = 0;
     break;
    }
   }
   while (1) {
    e = c + 20 | 0;
    f = k[e >> 2] | 0;
    if (f) {
     c = f;
     d = e;
     continue;
    }
    e = c + 16 | 0;
    f = k[e >> 2] | 0;
    if (!f) break; else {
     c = f;
     d = e;
    }
   }
   if (d >>> 0 < h >>> 0) qa(); else {
    k[d >> 2] = 0;
    j = c;
    break;
   }
  } else {
   e = k[a + (i + 8) >> 2] | 0;
   if (e >>> 0 < h >>> 0) qa();
   c = e + 12 | 0;
   if ((k[c >> 2] | 0) != (l | 0)) qa();
   d = f + 8 | 0;
   if ((k[d >> 2] | 0) == (l | 0)) {
    k[c >> 2] = f;
    k[d >> 2] = e;
    j = f;
    break;
   } else qa();
  } while (0);
  if (g) {
   c = k[a + (i + 28) >> 2] | 0;
   d = 52260 + (c << 2) | 0;
   if ((l | 0) == (k[d >> 2] | 0)) {
    k[d >> 2] = j;
    if (!j) {
     k[12990] = k[12990] & ~(1 << c);
     break;
    }
   } else {
    if (g >>> 0 < (k[12993] | 0) >>> 0) qa();
    c = g + 16 | 0;
    if ((k[c >> 2] | 0) == (l | 0)) k[c >> 2] = j; else k[g + 20 >> 2] = j;
    if (!j) break;
   }
   d = k[12993] | 0;
   if (j >>> 0 < d >>> 0) qa();
   k[j + 24 >> 2] = g;
   c = k[a + (i + 16) >> 2] | 0;
   do if (c) if (c >>> 0 < d >>> 0) qa(); else {
    k[j + 16 >> 2] = c;
    k[c + 24 >> 2] = j;
    break;
   } while (0);
   c = k[a + (i + 20) >> 2] | 0;
   if (c) if (c >>> 0 < (k[12993] | 0) >>> 0) qa(); else {
    k[j + 20 >> 2] = c;
    k[c + 24 >> 2] = j;
    break;
   }
  }
 } while (0);
 if (n >>> 0 < 16) {
  k[o >> 2] = m | p & 1 | 2;
  b = a + (m | 4) | 0;
  k[b >> 2] = k[b >> 2] | 1;
  return a | 0;
 } else {
  k[o >> 2] = p & 1 | b | 2;
  k[a + (b + 4) >> 2] = n | 3;
  p = a + (m | 4) | 0;
  k[p >> 2] = k[p >> 2] | 1;
  Va(a + b | 0, n);
  return a | 0;
 }
 return 0;
}

function Ka(a, b, c, d, e, f, g, h, n) {
 a = a | 0;
 b = b | 0;
 c = c | 0;
 d = d | 0;
 e = e | 0;
 f = f | 0;
 g = g | 0;
 h = h | 0;
 n = n | 0;
 var o = 0, p = 0, q = 0, r = 0, s = 0, t = 0, u = 0, v = 0, w = 0, x = 0, y = 0, z = 0, A = 0, B = 0, C = 0, D = 0;
 D = 1 << b;
 p = a + 8 | 0;
 o = k[p >> 2] | 0;
 C = o + D | 0;
 k[p >> 2] = C;
 p = a + 12 | 0;
 q = k[p >> 2] | 0;
 do if ((C | 0) > (q | 0)) {
  q = (1 << k[a >> 2]) + q | 0;
  k[p >> 2] = q;
  p = a + 4 | 0;
  q = Ta(k[p >> 2] | 0, q << 2) | 0;
  k[p >> 2] = q;
  if ((o | 0) < 0 | (q | 0) == 0) {
   a = -1;
   return a | 0;
  }
 } else if ((o | 0) < 0) {
  a = -1;
  return a | 0;
 } else {
  q = a + 4 | 0;
  p = q;
  q = k[q >> 2] | 0;
  break;
 } while (0);
 C = q + (o << 2) | 0;
 B = (b | 0) == 31;
 if (!B) {
  r = 0;
  do {
   A = r + o | 0;
   j[q + (A << 2) + 2 >> 1] = 0;
   j[q + (A << 2) >> 1] = -1;
   r = r + 1 | 0;
  } while ((r | 0) < (D | 0));
 }
 a : do if ((c | 0) > 0) {
  A = D + -1 | 0;
  if ((g | 0) == 1) {
   y = 0;
   b : while (1) {
    r = i[d + y >> 0] | 0;
    t = e + (ha(y, f) | 0) | 0;
    t = l[t >> 0] | 0;
    do if (r << 24 >> 24) {
     r = (r & 255) - n | 0;
     if ((r | 0) > 0 & (t >>> r | 0) == (h | 0)) {
      if ((r | 0) > (b | 0)) {
       w = r - b | 0;
       z = q + ((t >>> w & A) + o << 2) + 2 | 0;
       x = 0 - (j[z >> 1] | 0) | 0;
       j[z >> 1] = 0 - ((w | 0) > (x | 0) ? w : x);
       break;
      }
      s = b - r | 0;
      x = 1 << s;
      if ((s | 0) != 31) {
       v = r & 65535;
       w = y & 65535;
       t = t << s & A;
       u = 0;
       while (1) {
        r = t + o | 0;
        s = q + (r << 2) + 2 | 0;
        if (j[s >> 1] | 0) {
         o = -1;
         break b;
        }
        j[s >> 1] = v;
        j[q + (r << 2) >> 1] = w;
        u = u + 1 | 0;
        if ((u | 0) >= (x | 0)) break; else t = t + 1 | 0;
       }
      }
     }
    } while (0);
    y = y + 1 | 0;
    if ((y | 0) >= (c | 0)) break a;
   }
   return o | 0;
  }
  y = (g | 0) == 2;
  z = 0;
  c : while (1) {
   s = i[d + z >> 0] | 0;
   r = e + (ha(z, f) | 0) | 0;
   if (y) t = m[r >> 1] | 0; else t = k[r >> 2] | 0;
   do if (s << 24 >> 24) {
    r = (s & 255) - n | 0;
    if ((r | 0) > 0 & (t >>> r | 0) == (h | 0)) {
     if ((r | 0) > (b | 0)) {
      v = r - b | 0;
      x = q + ((t >>> v & A) + o << 2) + 2 | 0;
      w = 0 - (j[x >> 1] | 0) | 0;
      j[x >> 1] = 0 - ((v | 0) > (w | 0) ? v : w);
      break;
     }
     s = b - r | 0;
     x = 1 << s;
     if ((s | 0) != 31) {
      v = r & 65535;
      w = z & 65535;
      t = t << s & A;
      u = 0;
      while (1) {
       r = t + o | 0;
       s = q + (r << 2) + 2 | 0;
       if (j[s >> 1] | 0) {
        o = -1;
        break c;
       }
       j[s >> 1] = v;
       j[q + (r << 2) >> 1] = w;
       u = u + 1 | 0;
       if ((u | 0) >= (x | 0)) break; else t = t + 1 | 0;
      }
     }
    }
   } while (0);
   z = z + 1 | 0;
   if ((z | 0) >= (c | 0)) break a;
  }
  return o | 0;
 } while (0);
 if (B) {
  a = o;
  return a | 0;
 }
 w = 0 - b & 65535;
 v = h << b;
 t = n + b | 0;
 u = 0;
 q = C;
 while (1) {
  s = q + (u << 2) + 2 | 0;
  r = j[s >> 1] | 0;
  if (r << 16 >> 16 < 0) {
   q = 0 - (r << 16 >> 16) | 0;
   if ((q | 0) > (b | 0)) {
    j[s >> 1] = w;
    q = b;
   }
   q = Ka(a, q, c, d, e, f, g, u | v, t) | 0;
   if ((q | 0) < 0) {
    o = -1;
    p = 39;
    break;
   }
   n = k[p >> 2] | 0;
   j[n + (u + o << 2) >> 1] = q;
   q = n + (o << 2) | 0;
  }
  u = u + 1 | 0;
  if ((u | 0) >= (D | 0)) {
   p = 39;
   break;
  }
 }
 if ((p | 0) == 39) return o | 0;
 return 0;
}

function kb(a, b, c, d, e) {
 a = a | 0;
 b = b | 0;
 c = c | 0;
 d = d | 0;
 e = e | 0;
 var f = 0, g = 0, h = 0, i = 0, j = 0, l = 0, m = 0, n = 0, o = 0, p = 0;
 l = a;
 i = b;
 j = i;
 g = c;
 n = d;
 h = n;
 if (!j) {
  f = (e | 0) != 0;
  if (!h) {
   if (f) {
    k[e >> 2] = (l >>> 0) % (g >>> 0);
    k[e + 4 >> 2] = 0;
   }
   n = 0;
   e = (l >>> 0) / (g >>> 0) >>> 0;
   return (L = n, e) | 0;
  } else {
   if (!f) {
    n = 0;
    e = 0;
    return (L = n, e) | 0;
   }
   k[e >> 2] = a | 0;
   k[e + 4 >> 2] = b & 0;
   n = 0;
   e = 0;
   return (L = n, e) | 0;
  }
 }
 f = (h | 0) == 0;
 do if (!g) {
  if (f) {
   if (e) {
    k[e >> 2] = (j >>> 0) % (g >>> 0);
    k[e + 4 >> 2] = 0;
   }
   n = 0;
   e = (j >>> 0) / (g >>> 0) >>> 0;
   return (L = n, e) | 0;
  }
  if (!l) {
   if (e) {
    k[e >> 2] = 0;
    k[e + 4 >> 2] = (j >>> 0) % (h >>> 0);
   }
   n = 0;
   e = (j >>> 0) / (h >>> 0) >>> 0;
   return (L = n, e) | 0;
  }
  f = h - 1 | 0;
  if (!(f & h)) {
   if (e) {
    k[e >> 2] = a | 0;
    k[e + 4 >> 2] = f & j | b & 0;
   }
   n = 0;
   e = j >>> ((db(h | 0) | 0) >>> 0);
   return (L = n, e) | 0;
  }
  f = (ja(h | 0) | 0) - (ja(j | 0) | 0) | 0;
  if (f >>> 0 <= 30) {
   b = f + 1 | 0;
   h = 31 - f | 0;
   g = b;
   a = j << h | l >>> (b >>> 0);
   b = j >>> (b >>> 0);
   f = 0;
   h = l << h;
   break;
  }
  if (!e) {
   n = 0;
   e = 0;
   return (L = n, e) | 0;
  }
  k[e >> 2] = a | 0;
  k[e + 4 >> 2] = i | b & 0;
  n = 0;
  e = 0;
  return (L = n, e) | 0;
 } else {
  if (!f) {
   f = (ja(h | 0) | 0) - (ja(j | 0) | 0) | 0;
   if (f >>> 0 <= 31) {
    m = f + 1 | 0;
    h = 31 - f | 0;
    b = f - 31 >> 31;
    g = m;
    a = l >>> (m >>> 0) & b | j << h;
    b = j >>> (m >>> 0) & b;
    f = 0;
    h = l << h;
    break;
   }
   if (!e) {
    n = 0;
    e = 0;
    return (L = n, e) | 0;
   }
   k[e >> 2] = a | 0;
   k[e + 4 >> 2] = i | b & 0;
   n = 0;
   e = 0;
   return (L = n, e) | 0;
  }
  f = g - 1 | 0;
  if (f & g) {
   h = (ja(g | 0) | 0) + 33 - (ja(j | 0) | 0) | 0;
   p = 64 - h | 0;
   m = 32 - h | 0;
   i = m >> 31;
   o = h - 32 | 0;
   b = o >> 31;
   g = h;
   a = m - 1 >> 31 & j >>> (o >>> 0) | (j << m | l >>> (h >>> 0)) & b;
   b = b & j >>> (h >>> 0);
   f = l << p & i;
   h = (j << p | l >>> (o >>> 0)) & i | l << m & h - 33 >> 31;
   break;
  }
  if (e) {
   k[e >> 2] = f & l;
   k[e + 4 >> 2] = 0;
  }
  if ((g | 0) == 1) {
   o = i | b & 0;
   p = a | 0 | 0;
   return (L = o, p) | 0;
  } else {
   p = db(g | 0) | 0;
   o = j >>> (p >>> 0) | 0;
   p = j << 32 - p | l >>> (p >>> 0) | 0;
   return (L = o, p) | 0;
  }
 } while (0);
 if (!g) {
  j = h;
  i = 0;
  h = 0;
 } else {
  m = c | 0 | 0;
  l = n | d & 0;
  j = bb(m | 0, l | 0, -1, -1) | 0;
  c = L;
  i = h;
  h = 0;
  do {
   d = i;
   i = f >>> 31 | i << 1;
   f = h | f << 1;
   d = a << 1 | d >>> 31 | 0;
   n = a >>> 31 | b << 1 | 0;
   Ya(j, c, d, n) | 0;
   p = L;
   o = p >> 31 | ((p | 0) < 0 ? -1 : 0) << 1;
   h = o & 1;
   a = Ya(d, n, o & m, (((p | 0) < 0 ? -1 : 0) >> 31 | ((p | 0) < 0 ? -1 : 0) << 1) & l) | 0;
   b = L;
   g = g - 1 | 0;
  } while ((g | 0) != 0);
  j = i;
  i = 0;
 }
 g = 0;
 if (e) {
  k[e >> 2] = a;
  k[e + 4 >> 2] = b;
 }
 o = (f | 0) >>> 31 | (j | g) << 1 | (g << 1 | f >>> 31) & 0 | i;
 p = (f << 1 | 0 >>> 31) & -2 | h;
 return (L = o, p) | 0;
}

function Ja(a) {
 a = a | 0;
 var b = 0, c = 0, d = 0, e = 0, f = 0, g = 0, h = 0, j = 0, n = 0, o = 0, p = 0, q = 0, r = 0, s = 0, t = 0, u = 0;
 q = k[a >> 2] | 0;
 r = a + 4 | 0;
 s = a + 20 | 0;
 c = k[s >> 2] | 0;
 t = a + 24 | 0;
 b = k[t >> 2] | 0;
 a : do if ((b | 0) < 4) d = 1; else {
  d = c;
  g = b;
  f = i[c >> 0] | 0;
  o = 0;
  while (1) {
   e = d;
   d = d + 1 | 0;
   p = f;
   f = i[d >> 0] | 0;
   h = f & 255;
   j = h << 16;
   n = l[e + 2 >> 0] | 0;
   u = n << 8;
   if (!((u & 3072 | 0) == 3072 | ((u & 61440 | 0) == 61440 | ((j | (p & 255) << 24) >>> 0 < 4292870144 | (j & 393216 | 0) != 131072)))) {
    p = e;
    d = j;
    break;
   }
   if ((g | 0) < 5) {
    d = 1;
    break a;
   } else {
    g = g + -1 | 0;
    o = o + 1 | 0;
   }
  }
  j = l[p + 3 >> 0] | 0;
  if (!(d & 1048576)) {
   f = 1;
   d = 1;
  } else {
   f = h >>> 3 & 1 ^ 1;
   d = 0;
  }
  k[a + 1136 >> 2] = f;
  u = n >>> 2 & 3;
  d = d + f | 0;
  e = (m[56646 + (u << 1) >> 1] | 0) >>> d;
  k[a + 1088 >> 2] = (d * 3 | 0) + u;
  k[a + 1084 >> 2] = h & 1 ^ 1;
  k[a + 12 >> 2] = e;
  d = n >>> 4;
  u = j >>> 6;
  k[a + 1128 >> 2] = u;
  k[a + 1132 >> 2] = j >>> 4 & 3;
  k[a + 8 >> 2] = (u | 0) == 3 ? 1 : 2;
  if (!d) {
   k[a + 16 >> 2] = -1;
   d = 1;
   break;
  }
  d = m[56652 + (f * 30 | 0) + (d << 1) >> 1] | 0;
  k[a + 1092 >> 2] = d * 1e3;
  d = ((d * 144e3 | 0) / (e << f | 0) | 0) + (n >>> 1 & 1) | 0;
  e = a + 16 | 0;
  k[e >> 2] = d;
  if ((d | 0) < 1 | (d | 0) > (g | 0)) d = 1; else {
   c = (d | 0) < (g | 0) ? d : g;
   b = La(a, q, p, c) | 0;
   if ((b | 0) > -1) k[r >> 2] = b;
   k[e >> 2] = (k[e >> 2] | 0) + o;
   d = (c | 0) < 0;
   c = k[s >> 2] | 0;
   b = k[t >> 2] | 0;
  }
 } while (0);
 u = k[a + 16 >> 2] | 0;
 k[s >> 2] = c + u;
 u = b - u | 0;
 k[t >> 2] = u;
 if (!(d | (u | 0) < 0)) return;
 k[r >> 2] = 0;
 return;
}

function Na(a) {
 a = +a;
 var b = 0, c = 0, d = 0, e = 0.0, f = 0.0;
 p[t >> 3] = a;
 b = k[t + 4 >> 2] | 0;
 c = b & 2147483647;
 do if (c >>> 0 > 1083174911) {
  b = (b | 0) > -1 | (b | 0) == -1 & (k[t >> 2] | 0) >>> 0 > 4294967295;
  if (b & c >>> 0 > 1083179007) {
   a = a * 8988465674311579538646525.0e283;
   break;
  }
  if (c >>> 0 > 2146435071) {
   a = -1.0 / a;
   break;
  } else if (!(a <= -1075.0) | b) {
   d = 9;
   break;
  } else {
   a = 0.0;
   break;
  }
 } else if (c >>> 0 < 1016070144) a = a + 1.0; else d = 9; while (0);
 if ((d | 0) == 9) {
  f = a + 26388279066624.0;
  p[t >> 3] = f;
  d = (k[t >> 2] | 0) + 128 | 0;
  c = d << 1 & 510;
  e = +p[8 + (c << 3) >> 3];
  a = a - (f + -26388279066624.0) - +p[8 + ((c | 1) << 3) >> 3];
  a = +Pa(e + e * a * (a * (a * (a * (a * 1.3333559164630223e-03 + .009618129842126066) + .0555041086648214) + .2402265069591) + .6931471805599453), (d & -256 | 0) / 256 | 0);
 }
 return +a;
}

function Pa(a, b) {
 a = +a;
 b = b | 0;
 var c = 0;
 if ((b | 0) > 1023) {
  a = a * 8988465674311579538646525.0e283;
  c = b + -1023 | 0;
  if ((c | 0) > 1023) {
   c = b + -2046 | 0;
   c = (c | 0) > 1023 ? 1023 : c;
   a = a * 8988465674311579538646525.0e283;
  }
 } else if ((b | 0) < -1022) {
  a = a * 2.2250738585072014e-308;
  c = b + 1022 | 0;
  if ((c | 0) < -1022) {
   c = b + 2044 | 0;
   c = (c | 0) < -1022 ? -1022 : c;
   a = a * 2.2250738585072014e-308;
  }
 } else c = b;
 c = $a(c + 1023 | 0, 0, 52) | 0;
 b = L;
 k[t >> 2] = c;
 k[t + 4 >> 2] = b;
 return +(a * +p[t >> 3]);
}

function gb(a, b, c, d) {
 a = a | 0;
 b = b | 0;
 c = c | 0;
 d = d | 0;
 var e = 0, f = 0, g = 0, h = 0, i = 0, j = 0;
 e = r;
 r = r + 16 | 0;
 h = e | 0;
 g = b >> 31 | ((b | 0) < 0 ? -1 : 0) << 1;
 f = ((b | 0) < 0 ? -1 : 0) >> 31 | ((b | 0) < 0 ? -1 : 0) << 1;
 j = d >> 31 | ((d | 0) < 0 ? -1 : 0) << 1;
 i = ((d | 0) < 0 ? -1 : 0) >> 31 | ((d | 0) < 0 ? -1 : 0) << 1;
 a = Ya(g ^ a, f ^ b, g, f) | 0;
 b = L;
 kb(a, b, Ya(j ^ c, i ^ d, j, i) | 0, L, h) | 0;
 d = Ya(k[h >> 2] ^ g, k[h + 4 >> 2] ^ f, g, f) | 0;
 c = L;
 r = e;
 return (L = c, d) | 0;
}

function ab(a, b, c) {
 a = a | 0;
 b = b | 0;
 c = c | 0;
 var d = 0;
 if ((c | 0) >= 4096) return ua(a | 0, b | 0, c | 0) | 0;
 d = a | 0;
 if ((a & 3) == (b & 3)) {
  while (a & 3) {
   if (!c) return d | 0;
   i[a >> 0] = i[b >> 0] | 0;
   a = a + 1 | 0;
   b = b + 1 | 0;
   c = c - 1 | 0;
  }
  while ((c | 0) >= 4) {
   k[a >> 2] = k[b >> 2];
   a = a + 4 | 0;
   b = b + 4 | 0;
   c = c - 4 | 0;
  }
 }
 while ((c | 0) > 0) {
  i[a >> 0] = i[b >> 0] | 0;
  a = a + 1 | 0;
  b = b + 1 | 0;
  c = c - 1 | 0;
 }
 return d | 0;
}

function Ta(a, b) {
 a = a | 0;
 b = b | 0;
 var c = 0, d = 0;
 if (!a) {
  a = Qa(b) | 0;
  return a | 0;
 }
 if (b >>> 0 > 4294967231) {
  a = Ma() | 0;
  k[a >> 2] = 12;
  a = 0;
  return a | 0;
 }
 c = Ua(a + -8 | 0, b >>> 0 < 11 ? 16 : b + 11 & -8) | 0;
 if (c) {
  a = c + 8 | 0;
  return a | 0;
 }
 c = Qa(b) | 0;
 if (!c) {
  a = 0;
  return a | 0;
 }
 d = k[a + -4 >> 2] | 0;
 d = (d & -8) - ((d & 3 | 0) == 0 ? 8 : 4) | 0;
 ab(c | 0, a | 0, (d >>> 0 < b >>> 0 ? d : b) | 0) | 0;
 Ra(a);
 a = c;
 return a | 0;
}

function Oa(a, b) {
 a = +a;
 b = b | 0;
 var c = 0, d = 0, e = 0;
 p[t >> 3] = a;
 c = k[t >> 2] | 0;
 d = k[t + 4 >> 2] | 0;
 e = _a(c | 0, d | 0, 52) | 0;
 e = e & 2047;
 switch (e | 0) {
 case 0:
  {
   if (a != 0.0) {
    a = +Oa(a * 18446744073709551616.0, b);
    c = (k[b >> 2] | 0) + -64 | 0;
   } else c = 0;
   k[b >> 2] = c;
   break;
  }
 case 2047:
  break;
 default:
  {
   k[b >> 2] = e + -1022;
   k[t >> 2] = c;
   k[t + 4 >> 2] = d & -2146435073 | 1071644672;
   a = +p[t >> 3];
  }
 }
 return +a;
}

function fb(a, b, c, d) {
 a = a | 0;
 b = b | 0;
 c = c | 0;
 d = d | 0;
 var e = 0, f = 0, g = 0, h = 0, i = 0, j = 0;
 j = b >> 31 | ((b | 0) < 0 ? -1 : 0) << 1;
 i = ((b | 0) < 0 ? -1 : 0) >> 31 | ((b | 0) < 0 ? -1 : 0) << 1;
 f = d >> 31 | ((d | 0) < 0 ? -1 : 0) << 1;
 e = ((d | 0) < 0 ? -1 : 0) >> 31 | ((d | 0) < 0 ? -1 : 0) << 1;
 h = Ya(j ^ a, i ^ b, j, i) | 0;
 g = L;
 a = f ^ j;
 b = e ^ i;
 return Ya((kb(h, g, Ya(f ^ c, e ^ d, f, e) | 0, L, 0) | 0) ^ a, L ^ b, a, b) | 0;
}

function Za(a, b, c) {
 a = a | 0;
 b = b | 0;
 c = c | 0;
 var d = 0, e = 0, f = 0, g = 0;
 d = a + c | 0;
 if ((c | 0) >= 20) {
  b = b & 255;
  f = a & 3;
  g = b | b << 8 | b << 16 | b << 24;
  e = d & ~3;
  if (f) {
   f = a + 4 - f | 0;
   while ((a | 0) < (f | 0)) {
    i[a >> 0] = b;
    a = a + 1 | 0;
   }
  }
  while ((a | 0) < (e | 0)) {
   k[a >> 2] = g;
   a = a + 4 | 0;
  }
 }
 while ((a | 0) < (d | 0)) {
  i[a >> 0] = b;
  a = a + 1 | 0;
 }
 return a - c | 0;
}

function eb(a, b) {
 a = a | 0;
 b = b | 0;
 var c = 0, d = 0, e = 0, f = 0;
 f = a & 65535;
 e = b & 65535;
 c = ha(e, f) | 0;
 d = a >>> 16;
 a = (c >>> 16) + (ha(e, d) | 0) | 0;
 e = b >>> 16;
 b = ha(e, f) | 0;
 return (L = (a >>> 16) + (ha(e, d) | 0) + (((a & 65535) + b | 0) >>> 16) | 0, a + b << 16 | c & 65535 | 0) | 0;
}

function cb(a, b, c) {
 a = a | 0;
 b = b | 0;
 c = c | 0;
 var d = 0;
 if ((b | 0) < (a | 0) & (a | 0) < (b + c | 0)) {
  d = a;
  b = b + c | 0;
  a = a + c | 0;
  while ((c | 0) > 0) {
   a = a - 1 | 0;
   b = b - 1 | 0;
   c = c - 1 | 0;
   i[a >> 0] = i[b >> 0] | 0;
  }
  a = d;
 } else ab(a, b, c) | 0;
 return a | 0;
}

function Sa(a, b) {
 a = a | 0;
 b = b | 0;
 var c = 0;
 if (!a) c = 0; else {
  c = ha(b, a) | 0;
  if ((b | a) >>> 0 > 65535) c = ((c >>> 0) / (a >>> 0) | 0 | 0) == (b | 0) ? c : -1;
 }
 b = Qa(c) | 0;
 if (!b) return b | 0;
 if (!(k[b + -4 >> 2] & 3)) return b | 0;
 Za(b | 0, 0, c | 0) | 0;
 return b | 0;
}

function db(a) {
 a = a | 0;
 var b = 0;
 b = i[v + (a & 255) >> 0] | 0;
 if ((b | 0) < 8) return b | 0;
 b = i[v + (a >> 8 & 255) >> 0] | 0;
 if ((b | 0) < 8) return b + 8 | 0;
 b = i[v + (a >> 16 & 255) >> 0] | 0;
 if ((b | 0) < 8) return b + 16 | 0;
 return (i[v + (a >>> 24) >> 0] | 0) + 24 | 0;
}

function Fa(a) {
 a = a | 0;
 i[t >> 0] = i[a >> 0];
 i[t + 1 >> 0] = i[a + 1 >> 0];
 i[t + 2 >> 0] = i[a + 2 >> 0];
 i[t + 3 >> 0] = i[a + 3 >> 0];
 i[t + 4 >> 0] = i[a + 4 >> 0];
 i[t + 5 >> 0] = i[a + 5 >> 0];
 i[t + 6 >> 0] = i[a + 6 >> 0];
 i[t + 7 >> 0] = i[a + 7 >> 0];
}

function Wa() {}
function Xa(a, b, c) {
 a = a | 0;
 b = b | 0;
 c = c | 0;
 if ((c | 0) < 32) {
  L = b >> c;
  return a >>> c | (b & (1 << c) - 1) << 32 - c;
 }
 L = (b | 0) < 0 ? -1 : 0;
 return b >> c - 32 | 0;
}

function jb(a, b, c, d) {
 a = a | 0;
 b = b | 0;
 c = c | 0;
 d = d | 0;
 var e = 0, f = 0;
 f = r;
 r = r + 16 | 0;
 e = f | 0;
 kb(a, b, c, d, e) | 0;
 r = f;
 return (L = k[e + 4 >> 2] | 0, k[e >> 2] | 0) | 0;
}

function hb(a, b, c, d) {
 a = a | 0;
 b = b | 0;
 c = c | 0;
 d = d | 0;
 var e = 0, f = 0;
 e = a;
 f = c;
 c = eb(e, f) | 0;
 a = L;
 return (L = (ha(b, f) | 0) + (ha(d, e) | 0) + a | a & 0, c | 0 | 0) | 0;
}

function $a(a, b, c) {
 a = a | 0;
 b = b | 0;
 c = c | 0;
 if ((c | 0) < 32) {
  L = b << c | (a & (1 << c) - 1 << 32 - c) >>> 32 - c;
  return a << c;
 }
 L = a << c - 32;
 return 0;
}

function _a(a, b, c) {
 a = a | 0;
 b = b | 0;
 c = c | 0;
 if ((c | 0) < 32) {
  L = b >>> c;
  return a >>> c | (b & (1 << c) - 1) << 32 - c;
 }
 L = 0;
 return b >>> c - 32 | 0;
}

function bb(a, b, c, d) {
 a = a | 0;
 b = b | 0;
 c = c | 0;
 d = d | 0;
 c = a + c >>> 0;
 return (L = b + d + (c >>> 0 < a >>> 0 | 0) >>> 0, c | 0) | 0;
}

function Ya(a, b, c, d) {
 a = a | 0;
 b = b | 0;
 c = c | 0;
 d = d | 0;
 d = b - d - (c >>> 0 > a >>> 0 | 0) >>> 0;
 return (L = d, a - c >>> 0 | 0) | 0;
}

function Ea(a) {
 a = a | 0;
 i[t >> 0] = i[a >> 0];
 i[t + 1 >> 0] = i[a + 1 >> 0];
 i[t + 2 >> 0] = i[a + 2 >> 0];
 i[t + 3 >> 0] = i[a + 3 >> 0];
}

function Ma() {
 var a = 0;
 if (!0) a = 51952; else {
  a = (pa() | 0) + 60 | 0;
  a = k[a >> 2] | 0;
 }
 return a | 0;
}

function ib(a, b, c, d) {
 a = a | 0;
 b = b | 0;
 c = c | 0;
 d = d | 0;
 return kb(a, b, c, d, 0) | 0;
}
function za(a) {
 a = a | 0;
 var b = 0;
 b = r;
 r = r + a | 0;
 r = r + 15 & -16;
 return b | 0;
}

function Da(a, b) {
 a = a | 0;
 b = b | 0;
 if (!w) {
  w = a;
  x = b;
 }
}

function Ca(a, b) {
 a = a | 0;
 b = b | 0;
 r = a;
 s = b;
}

function Ga(a) {
 a = a | 0;
 L = a;
}

function Ba(a) {
 a = a | 0;
 r = a;
}

function Ha() {
 return L | 0;
}

function Aa() {
 return r | 0;
}

// EMSCRIPTEN_END_FUNCS

 return {
  _i64Subtract: Ya,
  _free: Ra,
  _mp3_decode: Ja,
  _i64Add: bb,
  _mp3_create: Ia,
  _bitshift64Ashr: Xa,
  _memset: Za,
  _malloc: Qa,
  _memcpy: ab,
  _memmove: cb,
  _bitshift64Lshr: _a,
  _bitshift64Shl: $a,
  runPostSets: Wa,
  _emscripten_replace_memory: ya,
  stackAlloc: za,
  stackSave: Aa,
  stackRestore: Ba,
  establishStackSpace: Ca,
  setThrew: Da,
  setTempRet0: Ga,
  getTempRet0: Ha
 };
})


// EMSCRIPTEN_END_ASM
(Module.asmGlobalArg, Module.asmLibraryArg, buffer);
var _i64Subtract = Module["_i64Subtract"] = asm["_i64Subtract"];
var _free = Module["_free"] = asm["_free"];
var runPostSets = Module["runPostSets"] = asm["runPostSets"];
var _mp3_decode = Module["_mp3_decode"] = asm["_mp3_decode"];
var _i64Add = Module["_i64Add"] = asm["_i64Add"];
var _mp3_create = Module["_mp3_create"] = asm["_mp3_create"];
var _bitshift64Ashr = Module["_bitshift64Ashr"] = asm["_bitshift64Ashr"];
var _memset = Module["_memset"] = asm["_memset"];
var _malloc = Module["_malloc"] = asm["_malloc"];
var _memcpy = Module["_memcpy"] = asm["_memcpy"];
var _emscripten_replace_memory = Module["_emscripten_replace_memory"] = asm["_emscripten_replace_memory"];
var _memmove = Module["_memmove"] = asm["_memmove"];
var _bitshift64Lshr = Module["_bitshift64Lshr"] = asm["_bitshift64Lshr"];
var _bitshift64Shl = Module["_bitshift64Shl"] = asm["_bitshift64Shl"];
Runtime.stackAlloc = asm["stackAlloc"];
Runtime.stackSave = asm["stackSave"];
Runtime.stackRestore = asm["stackRestore"];
Runtime.establishStackSpace = asm["establishStackSpace"];
Runtime.setTempRet0 = asm["setTempRet0"];
Runtime.getTempRet0 = asm["getTempRet0"];
function ExitStatus(status) {
 this.name = "ExitStatus";
 this.message = "Program terminated with exit(" + status + ")";
 this.status = status;
}
ExitStatus.prototype = new Error;
ExitStatus.prototype.constructor = ExitStatus;
var initialStackTop;
var preloadStartTime = null;
var calledMain = false;
dependenciesFulfilled = function runCaller() {
 if (!Module["calledRun"]) run();
 if (!Module["calledRun"]) dependenciesFulfilled = runCaller;
};
Module["callMain"] = Module.callMain = function callMain(args) {
 assert(runDependencies == 0, "cannot call main when async dependencies remain! (listen on __ATMAIN__)");
 assert(__ATPRERUN__.length == 0, "cannot call main when preRun functions remain to be called");
 args = args || [];
 ensureInitRuntime();
 var argc = args.length + 1;
 function pad() {
  for (var i = 0; i < 4 - 1; i++) {
   argv.push(0);
  }
 }
 var argv = [ allocate(intArrayFromString(Module["thisProgram"]), "i8", ALLOC_NORMAL) ];
 pad();
 for (var i = 0; i < argc - 1; i = i + 1) {
  argv.push(allocate(intArrayFromString(args[i]), "i8", ALLOC_NORMAL));
  pad();
 }
 argv.push(0);
 argv = allocate(argv, "i32", ALLOC_NORMAL);
 try {
  var ret = Module["_main"](argc, argv, 0);
  exit(ret, true);
 } catch (e) {
  if (e instanceof ExitStatus) {
   return;
  } else if (e == "SimulateInfiniteLoop") {
   Module["noExitRuntime"] = true;
   return;
  } else {
   if (e && typeof e === "object" && e.stack) Module.printErr("exception thrown: " + [ e, e.stack ]);
   throw e;
  }
 } finally {
  calledMain = true;
 }
};
function run(args) {
 args = args || Module["arguments"];
 if (preloadStartTime === null) preloadStartTime = Date.now();
 if (runDependencies > 0) {
  return;
 }
 preRun();
 if (runDependencies > 0) return;
 if (Module["calledRun"]) return;
 function doRun() {
  if (Module["calledRun"]) return;
  Module["calledRun"] = true;
  if (ABORT) return;
  ensureInitRuntime();
  preMain();
  if (Module["onRuntimeInitialized"]) Module["onRuntimeInitialized"]();
  if (Module["_main"] && shouldRunNow) Module["callMain"](args);
  postRun();
 }
 if (Module["setStatus"]) {
  Module["setStatus"]("Running...");
  setTimeout((function() {
   setTimeout((function() {
    Module["setStatus"]("");
   }), 1);
   doRun();
  }), 1);
 } else {
  doRun();
 }
}
Module["run"] = Module.run = run;
function exit(status, implicit) {
 if (implicit && Module["noExitRuntime"]) {
  return;
 }
 if (Module["noExitRuntime"]) {} else {
  ABORT = true;
  EXITSTATUS = status;
  STACKTOP = initialStackTop;
  exitRuntime();
  if (Module["onExit"]) Module["onExit"](status);
 }
 if (ENVIRONMENT_IS_NODE) {
  process["stdout"]["once"]("drain", (function() {
   process["exit"](status);
  }));
  console.log(" ");
  setTimeout((function() {
   process["exit"](status);
  }), 500);
 } else if (ENVIRONMENT_IS_SHELL && typeof quit === "function") {
  quit(status);
 }
 throw new ExitStatus(status);
}
Module["exit"] = Module.exit = exit;
var abortDecorators = [];
function abort(what) {
 if (what !== undefined) {
  Module.print(what);
  Module.printErr(what);
  what = JSON.stringify(what);
 } else {
  what = "";
 }
 ABORT = true;
 EXITSTATUS = 1;
 var extra = "\nIf this abort() is unexpected, build with -s ASSERTIONS=1 which can give more information.";
 var output = "abort(" + what + ") at " + stackTrace() + extra;
 if (abortDecorators) {
  abortDecorators.forEach((function(decorator) {
   output = decorator(output, what);
  }));
 }
 throw output;
}
Module["abort"] = Module.abort = abort;
if (Module["preInit"]) {
 if (typeof Module["preInit"] == "function") Module["preInit"] = [ Module["preInit"] ];
 while (Module["preInit"].length > 0) {
  Module["preInit"].pop()();
 }
}
var shouldRunNow = true;
if (Module["noInitialRun"]) {
 shouldRunNow = false;
}
Module["noExitRuntime"] = true;
run();
// var fs = require("fs");
// function toArrayBuffer(buffer) {
//  var ab = new ArrayBuffer(buffer.length);
//  var view = new Uint8Array(ab);
//  for (var i = 0; i < buffer.length; ++i) {
//   view[i] = buffer[i];
//  }
//  return view;
// }
// var fileArray = toArrayBuffer(fs.readFileSync("test.mp3"));
// var inputLength = fileArray.length;
// var inputInHeap = Module._malloc(inputLength);
// (new Uint8Array(Module.HEAPU8.buffer, inputInHeap, inputLength)).set(fileArray);
// var result = Module._malloc(16);
// var mp3_create = Module.cwrap("mp3_create", "number", [ "number", "number" ]);
// var mp3_decode = Module.cwrap("mp3_decode", null, [ "number" ]);
// var contextInHeap = mp3_create(inputInHeap, inputLength);
// var context = new Uint32Array(Module.HEAPU8.buffer, contextInHeap, 4);
// mp3_decode(contextInHeap);
// var channelCount = context[2];
// var sampleRate = context[3];
// var frameCount = 0;
// while (context[1]) {
//  frameCount++;
//  mp3_decode(contextInHeap);
// }
// console.log(channelCount, sampleRate, frameCount);





root.onmessage = function(e) {
    var mp3_create = Module.cwrap("mp3_create", "number", [ "number", "number" ]);
    var mp3_decode = Module.cwrap("mp3_decode", null, [ "number" ]);

    var inputArrayBuffer = e.data;
    var inputArray = new Uint8Array(inputArrayBuffer);

    var inputLength = inputArray.length;
    var inputInHeap = Module._malloc(inputLength);

    (new Uint8Array(Module.HEAPU8.buffer, inputInHeap, inputLength)).set(inputArray);

    var contextInHeap = mp3_create(inputInHeap, inputLength);
    var context = new Uint32Array(Module.HEAPU8.buffer, contextInHeap, 4);

    var outputInHeap = new Int16Array(Module.HEAPU8.buffer, context[0], 1152*2);




    mp3_decode(contextInHeap);

    while (context[1]) {
        var leftArrayBuffer  = new ArrayBuffer(context[1]*4);
        var rightArrayBuffer = new ArrayBuffer(context[1]*4);

        var leftArray  = new Float32Array(leftArrayBuffer);
        var rightArray = new Float32Array(rightArrayBuffer);

        for (var i = 0; i < context[1]; i++) {
            leftArray[i]  = outputInHeap[(i * 2) + 0] / 32768;
            rightArray[i] = outputInHeap[(i * 2) + 1] / 32768;
        }

        root.postMessage({
            sampleCount: context[1],
            left:  leftArray,
            right: rightArray
        });

        mp3_decode(contextInHeap);
    }

    root.postMessage({ });


    // Module.ccall(
    //     "mp3_decode",
    //     null,
    //     [ "number", "number", "number", "number", "number" ],
    //     [
    //         returnInHeap,
    //         inputInHeap,  inputLength,
    //         outputInHeap, outputLength
    //     ]
    // );

    // var returnArray = new Uint32Array(Module.HEAPU8.buffer, returnInHeap, 3);
    // var output = new Uint8Array(Module.HEAPU8.buffer, outputInHeap, returnArray[0]);

    // root.postMessage({
    //     data:         output,
    //     sampleRate:   returnArray[1],
    //     channelCount: returnArray[2]
    // });

    root.close();
}


}(this));




