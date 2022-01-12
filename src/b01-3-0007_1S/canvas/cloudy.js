let cloudy_controller = (() =>{

 Filters = {};

 var createCanvas = function (width, height) {
     var c = document.createElement("canvas");
     c.width = width;
     c.height = height;
     c.style.display = "none";
     //temporary add to document to get this work (getImageData, etc.)
     document.body.appendChild(c);
     document.body.removeChild(c);
     return c;
 };
 
 Filters._premultiply = function (data) {
     var len = data.length;
     for (var i = 0; i < len; i += 4) {
         var f = data[i + 3] * 0.003921569;
         data[i] = Math.round(data[i] * f);
         data[i + 1] = Math.round(data[i + 1] * f);
         data[i + 2] = Math.round(data[i + 2] * f);
     }
 };
 
 Filters._unpremultiply = function (data) {
     var len = data.length;
     for (var i = 0; i < len; i += 4) {
         var a = data[i + 3];
         if (a == 0 || a == 255) {
             continue;
         }
         var f = 255 / a;
         var r = (data[i] * f);
         var g = (data[i + 1] * f);
         var b = (data[i + 2] * f);
         if (r > 255) {
             r = 255;
         }
         if (g > 255) {
             g = 255;
         }
         if (b > 255) {
             b = 255;
         }
 
         data[i] = r;
         data[i + 1] = g;
         data[i + 2] = b;
     }
 };
 
 
 Filters._boxBlurHorizontal = function (pixels, mask, w, h, radius, maskType) {
     var index = 0;
     var newColors = [];
 
     for (var y = 0; y < h; y++) {
         var hits = 0;
         var r = 0;
         var g = 0;
         var b = 0;
         var a = 0;
         for (var x = -radius * 4; x < w * 4; x += 4) {
             var oldPixel = x - radius * 4 - 4;
             if (oldPixel >= 0) {
                 if ((maskType == 0) || (maskType == 1 && mask[index + oldPixel + 3] > 0) || (maskType == 2 && mask[index + oldPixel + 3] < 255)) {
                     a -= pixels[index + oldPixel + 3];
                     r -= pixels[index + oldPixel];
                     g -= pixels[index + oldPixel + 1];
                     b -= pixels[index + oldPixel + 2];
                     hits--;
                 }
             }
 
             var newPixel = x + radius * 4;
             if (newPixel < w * 4) {
                 if ((maskType == 0) || (maskType == 1 && mask[index + newPixel + 3] > 0) || (maskType == 2 && mask[index + newPixel + 3] < 255)) {
                     a += pixels[index + newPixel + 3];
                     r += pixels[index + newPixel];
                     g += pixels[index + newPixel + 1];
                     b += pixels[index + newPixel + 2];
                     hits++;
                 }
             }
 
             if (x >= 0) {
                 if ((maskType == 0) || (maskType == 1 && mask[index + x + 3] > 0) || (maskType == 2 && mask[index + x + 3] < 255)) {
                     if (hits == 0) {
                         newColors[x] = 0;
                         newColors[x + 1] = 0;
                         newColors[x + 2] = 0;
                         newColors[x + 3] = 0;
                     } else {
                         newColors[x] = Math.round(r / hits);
                         newColors[x + 1] = Math.round(g / hits);
                         newColors[x + 2] = Math.round(b / hits);
                         newColors[x + 3] = Math.round(a / hits);
 
                     }
                 } else {
                     newColors[x] = 0;
                     newColors[x + 1] = 0;
                     newColors[x + 2] = 0;
                     newColors[x + 3] = 0;
                 }
             }
         }
         for (var p = 0; p < w * 4; p += 4) {
             pixels[index + p] = newColors[p];
             pixels[index + p + 1] = newColors[p + 1];
             pixels[index + p + 2] = newColors[p + 2];
             pixels[index + p + 3] = newColors[p + 3];
         }
 
         index += w * 4;
     }
 };
 
 Filters._boxBlurVertical = function (pixels, mask, w, h, radius, maskType) {
     var newColors = [];
     var oldPixelOffset = -(radius + 1) * w * 4;
     var newPixelOffset = (radius) * w * 4;
 
     for (var x = 0; x < w * 4; x += 4) {
         var hits = 0;
         var r = 0;
         var g = 0;
         var b = 0;
         var a = 0;
         var index = -radius * w * 4 + x;
         for (var y = -radius; y < h; y++) {
             var oldPixel = y - radius - 1;
             if (oldPixel >= 0) {
                 if ((maskType == 0) || (maskType == 1 && mask[index + oldPixelOffset + 3] > 0) || (maskType == 2 && mask[index + oldPixelOffset + 3] < 255)) {
                     a -= pixels[index + oldPixelOffset + 3];
                     r -= pixels[index + oldPixelOffset];
                     g -= pixels[index + oldPixelOffset + 1];
                     b -= pixels[index + oldPixelOffset + 2];
                     hits--;
                 }
 
             }
 
             var newPixel = y + radius;
             if (newPixel < h) {
                 if ((maskType == 0) || (maskType == 1 && mask[index + newPixelOffset + 3] > 0) || (maskType == 2 && mask[index + newPixelOffset + 3] < 255)) {
                     a += pixels[index + newPixelOffset + 3];
                     r += pixels[index + newPixelOffset];
                     g += pixels[index + newPixelOffset + 1];
                     b += pixels[index + newPixelOffset + 2];
                     hits++;
                 }
             }
 
             if (y >= 0) {
                 if ((maskType == 0) || (maskType == 1 && mask[y * w * 4 + x + 3] > 0) || (maskType == 2 && mask[y * w * 4 + x + 3] < 255)) {
                     if (hits == 0) {
                         newColors[4 * y] = 0;
                         newColors[4 * y + 1] = 0;
                         newColors[4 * y + 2] = 0;
                         newColors[4 * y + 3] = 0;
                     } else {
                         newColors[4 * y] = Math.round(r / hits);
                         newColors[4 * y + 1] = Math.round(g / hits);
                         newColors[4 * y + 2] = Math.round(b / hits);
                         newColors[4 * y + 3] = Math.round(a / hits);
                     }
                 } else {
                     newColors[4 * y] = 0;
                     newColors[4 * y + 1] = 0;
                     newColors[4 * y + 2] = 0;
                     newColors[4 * y + 3] = 0;
                 }
             }
 
             index += w * 4;
         }
 
         for (var y = 0; y < h; y++) {
             pixels[y * w * 4 + x] = newColors[4 * y];
             pixels[y * w * 4 + x + 1] = newColors[4 * y + 1];
             pixels[y * w * 4 + x + 2] = newColors[4 * y + 2];
             pixels[y * w * 4 + x + 3] = newColors[4 * y + 3];
         }
     }
 };
 
 
 Filters.blur = function (canvas, ctx, hRadius, vRadius, iterations, mask, maskType) {
     var imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
     var data = imgData.data;
     Filters._premultiply(data);
     for (var i = 0; i < iterations; i++) {
         Filters._boxBlurHorizontal(data, mask, canvas.width, canvas.height, Math.floor(hRadius / 2), maskType);
         Filters._boxBlurVertical(data, mask, canvas.width, canvas.height, Math.floor(vRadius / 2), maskType);
     }
 
     Filters._unpremultiply(data);
 
     var width = canvas.width;
     var height = canvas.height;
     var retCanvas = createCanvas(width, height);
     var retImg = retCanvas.getContext("2d");
     retImg.putImageData(imgData, 0, 0);
     return retCanvas;
 }
 
 Filters._moveRGB = function (width, height, rgb, deltaX, deltaY, fill) {
     var img = createCanvas(width, height);
 
     var ig = img.getContext("2d");
 
     Filters._setRGB(ig, 0, 0, width, height, rgb);
     var retImg = createCanvas(width, height);
     retImg.width = width;
     retImg.heigth = height;
     var g = retImg.getContext("2d");
     g.fillStyle = fill;
     g.globalCompositeOperation = "copy";
     g.fillRect(0, 0, width, height);
     g.drawImage(img, deltaX, deltaY);
     return g.getImageData(0, 0, width, height).data;
 };
 
 
 Filters.FULL = 1;
 Filters.INNER = 2;
 Filters.OUTER = 3;
 
 Filters._setRGB = function (ctx, x, y, width, height, data) {
     var id = ctx.createImageData(width, height);
     for (var i = 0; i < data.length; i++) {
         id.data[i] = data[i];
     }
     ctx.putImageData(id, x, y);
 };
 
 Filters.gradientGlow = function (srcCanvas, src, blurX, blurY, angle, distance, colors, ratios, type, iterations, strength, knockout) {
     var width = rainy_canvas.width;
     var height = rainy_canvas.height;
     var retCanvas = createCanvas(width, height);
     var retImg = retCanvas.getContext("2d");
 
     var gradCanvas = createCanvas(256, 1);
 
     var gradient = gradCanvas.getContext("2d");
     var grd = ctx.createLinearGradient(0, 0, 255, 0);
     for (var s = 0; s < colors.length; s++) {
         var v = "rgba(" + colors[s][0] + "," + colors[s][1] + "," + colors[s][2] + "," + colors[s][3] + ")";
         grd.addColorStop(ratios[s], v);
     }
     gradient.fillStyle = grd;
     gradient.fillRect(0, 0, 256, 1);
     var gradientPixels = gradient.getImageData(0, 0, gradCanvas.width, gradCanvas.height).data;
 
     var angleRad = angle / 180 * Math.PI;
     var moveX = (distance * Math.cos(angleRad));
     var moveY = (distance * Math.sin(angleRad));
     var srcPixels = src.getImageData(0, 0, width, height).data;
     var shadow = [];
     for (var i = 0; i < srcPixels.length; i += 4) {
         var alpha = srcPixels[i + 3];
         shadow[i] = 0;
         shadow[i + 1] = 0;
         shadow[i + 2] = 0;
         shadow[i + 3] = Math.round(alpha * strength);
     }
     var colorAlpha = "rgba(0,0,0,0)";
     shadow = Filters._moveRGB(width, height, shadow, moveX, moveY, colorAlpha);
 
     Filters._setRGB(retImg, 0, 0, width, height, shadow);
 
     var maskType = 0;
     if (type == Filters.INNER) {
         maskType = 1;
     }
     if (type == Filters.OUTER) {
         maskType = 2;
     }
 
 
     retCanvas = Filters.blur(retCanvas, retCanvas.getContext("2d"), blurX, blurY, iterations, srcPixels, maskType);
     retImg = retCanvas.getContext("2d");
     shadow = retImg.getImageData(0, 0, width, height).data;
 
     if (maskType != 0) {
         for (var i = 0; i < srcPixels.length; i += 4) {
             if ((maskType == 1 && srcPixels[i + 3] == 0) || (maskType == 2 && srcPixels[i + 3] == 255)) {
                 shadow[i] = 0;
                 shadow[i + 1] = 0;
                 shadow[i + 2] = 0;
                 shadow[i + 3] = 0;
             }
         }
     }
 
 
 
 
 
     for (var i = 0; i < shadow.length; i += 4) {
         var a = shadow[i + 3];
         shadow[i] = gradientPixels[a * 4];
         shadow[i + 1] = gradientPixels[a * 4 + 1];
         shadow[i + 2] = gradientPixels[a * 4 + 2];
         shadow[i + 3] = gradientPixels[a * 4 + 3];
     }
 
     Filters._setRGB(retImg, 0, 0, width, height, shadow);
 
     if (!knockout) {
         retImg.globalCompositeOperation = "destination-over";
         retImg.drawImage(srcCanvas, 0, 0);
     }
 
     return retCanvas;
 };
 
 
 
 
 Filters.dropShadow = function (canvas, src, blurX, blurY, angle, distance, color, inner, iterations, strength, knockout) {
     var width = canvas.width;
     var height = canvas.height;
     var srcPixels = src.getImageData(0, 0, width, height).data;
     var shadow = [];
     for (var i = 0; i < srcPixels.length; i += 4) {
         var alpha = srcPixels[i + 3];
         if (inner) {
             alpha = 255 - alpha;
         }
         shadow[i] = color[0];
         shadow[i + 1] = color[1];
         shadow[i + 2] = color[2];
         var sa = color[3] * alpha * strength;
         if (sa > 255)
             sa = 255;
         shadow[i + 3] = Math.round(sa);
     }
     var colorFirst = "#000000";
     var colorAlpha = "rgba(0,0,0,0)";
     var angleRad = angle / 180 * Math.PI;
     var moveX = (distance * Math.cos(angleRad));
     var moveY = (distance * Math.sin(angleRad));
     shadow = Filters._moveRGB(width, height, shadow, moveX, moveY, inner ? colorFirst : colorAlpha);
 
 
     var retCanvas = createCanvas(canvas.width, canvas.height);
     Filters._setRGB(retCanvas.getContext("2d"), 0, 0, width, height, shadow);
     if (blurX > 0 || blurY > 0) {
         retCanvas = Filters.blur(retCanvas, retCanvas.getContext("2d"), blurX, blurY, iterations, null, 0);
     }
     shadow = retCanvas.getContext("2d").getImageData(0, 0, width, height).data;
 
     var srcPixels = src.getImageData(0, 0, width, height).data;
     for (var i = 0; i < shadow.length; i += 4) {
         var mask = srcPixels[i + 3];
         if (!inner) {
             mask = 255 - mask;
         }
         shadow[i + 3] = mask * shadow[i + 3] / 255;
     }
     Filters._setRGB(retCanvas.getContext("2d"), 0, 0, width, height, shadow);
 
     if (!knockout) {
         var g = retCanvas.getContext("2d");
         g.globalCompositeOperation = "destination-over";
         g.drawImage(canvas, 0, 0);
     }
 
     return retCanvas;
 };
 
 Filters._cut = function (a, min, max) {
     if (a > max)
         a = max;
     if (a < min)
         a = min;
     return a;
 }
 
 Filters.gradientBevel = function (canvas, src, colors, ratios, blurX, blurY, strength, type, angle, distance, knockout, iterations) {
     var width = canvas.width;
     var height = canvas.height;
     var retImg = createCanvas(width, height);
     var srcPixels = src.getImageData(0, 0, width, height).data;
 
     var gradient = createCanvas(512, 1);
     var gg = gradient.getContext("2d");
 
     var grd = ctx.createLinearGradient(0, 0, 511, 0);
     for (var s = 0; s < colors.length; s++) {
         var v = "rgba(" + colors[s][0] + "," + colors[s][1] + "," + colors[s][2] + "," + colors[s][3] + ")";
         grd.addColorStop(ratios[s], v);
     }
     gg.fillStyle = grd;
     gg.globalCompositeOperation = "copy";
     gg.fillRect(0, 0, gradient.width, gradient.height);
     var gradientPixels = gg.getImageData(0, 0, gradient.width, gradient.height).data;
 
 
     if (type != Filters.OUTER) {
         var hilightIm = Filters.dropShadow(canvas, src, 0, 0, angle, distance, [255, 0, 0, 1], true, iterations, strength, true);
         var shadowIm = Filters.dropShadow(canvas, src, 0, 0, angle + 180, distance, [0, 0, 255, 1], true, iterations, strength, true);
         var h2 = createCanvas(width, height);
         var s2 = createCanvas(width, height);
         var hc = h2.getContext("2d");
         var sc = s2.getContext("2d");
         hc.drawImage(hilightIm, 0, 0);
         hc.globalCompositeOperation = "destination-out";
         hc.drawImage(shadowIm, 0, 0);
 
         sc.drawImage(shadowIm, 0, 0);
         sc.globalCompositeOperation = "destination-out";
         sc.drawImage(hilightIm, 0, 0);
         var shadowInner = s2;
         var hilightInner = h2;
     }
     if (type != Filters.INNER) {
         var hilightIm = Filters.dropShadow(canvas, src, 0, 0, angle + 180, distance, [255, 0, 0, 1], false, iterations, strength, true);
         var shadowIm = Filters.dropShadow(canvas, src, 0, 0, angle, distance, [0, 0, 255, 1], false, iterations, strength, true);
         var h2 = createCanvas(width, height);
         var s2 = createCanvas(width, height);
         var hc = h2.getContext("2d");
         var sc = s2.getContext("2d");
         hc.drawImage(hilightIm, 0, 0);
         hc.globalCompositeOperation = "destination-out";
         hc.drawImage(shadowIm, 0, 0);
 
         sc.drawImage(shadowIm, 0, 0);
         sc.globalCompositeOperation = "destination-out";
         sc.drawImage(hilightIm, 0, 0);
         var shadowOuter = s2;
         var hilightOuter = h2;
     }
 
     var hilightIm;
     var shadowIm;
     switch (type)
     {
         case Filters.OUTER:
             hilightIm = hilightOuter;
             shadowIm = shadowOuter;
             break;
         case Filters.INNER:
             hilightIm = hilightInner;
             shadowIm = shadowInner;
             break;
         case Filters.FULL:
             hilightIm = hilightInner;
             shadowIm = shadowInner;
             var hc = hilightIm.getContext("2d");
             hc.globalCompositeOperation = "source-over";
             hc.drawImage(hilightOuter, 0, 0);
             var sc = shadowIm.getContext("2d");
             sc.globalCompositeOperation = "source-over";
             sc.drawImage(shadowOuter, 0, 0);
             break;
     }
 
     var maskType = 0;
     if (type == Filters.INNER) {
         maskType = 1;
     }
     if (type == Filters.OUTER) {
         maskType = 2;
     }
 
     var retc = retImg.getContext("2d");
     retc.fillStyle = "#000000";
     retc.fillRect(0, 0, width, height);
     retc.drawImage(shadowIm, 0, 0);
     retc.drawImage(hilightIm, 0, 0);
 
     retImg = Filters.blur(retImg, retImg.getContext("2d"), blurX, blurY, iterations, srcPixels, maskType);
     var ret = retImg.getContext("2d").getImageData(0, 0, width, height).data;
 
     for (var i = 0; i < srcPixels.length; i += 4) {
         var ah = ret[i] * strength;
         var as = ret[i + 2] * strength;
         var ra = Filters._cut(ah - as, -255, 255);
         ret[i] = gradientPixels[4 * (255 + ra)];
         ret[i + 1] = gradientPixels[4 * (255 + ra) + 1];
         ret[i + 2] = gradientPixels[4 * (255 + ra) + 2];
         ret[i + 3] = gradientPixels[4 * (255 + ra) + 3];
     }
     Filters._setRGB(retImg.getContext("2d"), 0, 0, width, height, ret);
 
 
     if (!knockout) {
         var g = retImg.getContext("2d");
         g.globalCompositeOperation = "destination-over";
         g.drawImage(canvas, 0, 0);
     }
     return retImg;
 }
 Filters.bevel = function (canvas, src, blurX, blurY, strength, type, highlightColor, shadowColor, angle, distance, knockout, iterations) {
     return Filters.gradientBevel(canvas, src, [
         shadowColor,
         [shadowColor[0], shadowColor[1], shadowColor[2], 0],
         [highlightColor[0], highlightColor[1], highlightColor[2], 0],
         highlightColor
     ], [0, 127 / 255, 128 / 255, 1], blurX, blurY, strength, type, angle, distance, knockout, iterations);
 }
 
 
 
 
 //http://www.html5rocks.com/en/tutorials/canvas/imagefilters/
 Filters.convolution = function (canvas, ctx, weights, opaque) {
     var pixels = ctx.getImageData(0, 0, canvas.width, canvas.height);
     var side = Math.round(Math.sqrt(weights.length));
     var halfSide = Math.floor(side / 2);
     var src = pixels.data;
     var sw = pixels.width;
     var sh = pixels.height;
     // pad output by the convolution matrix
     var w = sw;
     var h = sh;
     var outCanvas = createCanvas(w, h);
     var outCtx = outCanvas.getContext("2d");
     var output = outCtx.getImageData(0, 0, w, h);
     var dst = output.data;
     // go through the destination image pixels
     var alphaFac = opaque ? 1 : 0;
     for (var y = 0; y < h; y++) {
         for (var x = 0; x < w; x++) {
             var sy = y;
             var sx = x;
             var dstOff = (y * w + x) * 4;
             // calculate the weighed sum of the source image pixels that
             // fall under the convolution matrix
             var r = 0, g = 0, b = 0, a = 0;
             for (var cy = 0; cy < side; cy++) {
                 for (var cx = 0; cx < side; cx++) {
                     var scy = sy + cy - halfSide;
                     var scx = sx + cx - halfSide;
                     if (scy >= 0 && scy < sh && scx >= 0 && scx < sw) {
                         var srcOff = (scy * sw + scx) * 4;
                         var wt = weights[cy * side + cx];
                         r += src[srcOff] * wt;
                         g += src[srcOff + 1] * wt;
                         b += src[srcOff + 2] * wt;
                         a += src[srcOff + 3] * wt;
                     }
                 }
             }
             dst[dstOff] = r;
             dst[dstOff + 1] = g;
             dst[dstOff + 2] = b;
             dst[dstOff + 3] = a + alphaFac * (255 - a);
         }
     }
     outCtx.putImageData(output, 0, 0);
     return outCanvas;
 };
 
 Filters.colorMatrix = function (canvas, ctx, m) {
     var pixels = ctx.getImageData(0, 0, canvas.width, canvas.height);
 
     var data = pixels.data;
     for (var i = 0; i < data.length; i += 4)
     {
         var r = i;
         var g = i + 1;
         var b = i + 2;
         var a = i + 3;
 
         var oR = data[r];
         var oG = data[g];
         var oB = data[b];
         var oA = data[a];
 
         data[r] = (m[0] * oR) + (m[1] * oG) + (m[2] * oB) + (m[3] * oA) + m[4];
         data[g] = (m[5] * oR) + (m[6] * oG) + (m[7] * oB) + (m[8] * oA) + m[9];
         data[b] = (m[10] * oR) + (m[11] * oG) + (m[12] * oB) + (m[13] * oA) + m[14];
         data[a] = (m[15] * oR) + (m[16] * oG) + (m[17] * oB) + (m[18] * oA) + m[19];
     }
     var outCanvas = createCanvas(canvas.width, canvas.height);
     var outCtx = outCanvas.getContext("2d");
     outCtx.putImageData(pixels, 0, 0);
     return outCanvas;
 };
 
 
 Filters.glow = function (canvas, src, blurX, blurY, strength, color, inner, knockout, iterations) {
     return Filters.dropShadow(canvas, src, blurX, blurY, 45, 0, color, inner, iterations, strength, knockout);
 };
 
 
 var BlendModes = {};
 
 BlendModes._cut = function (v) {
     if (v < 0)
         v = 0;
     if (v > 255)
         v = 255;
     return v;
 };
 
 BlendModes.normal = function (src, dst, result, pos) {
     var am = (255 - src[pos + 3]) / 255;
     result[pos] = this._cut(src[pos] * src[pos + 3] / 255 + dst[pos] * dst[pos + 3] / 255 * am);
     result[pos + 1] = this._cut(src[pos + 1] * src[pos + 3] / 255 + dst[pos + 1] * dst[pos + 3] / 255 * am);
     result[pos + 2] = this._cut(src[pos + 2] * src[pos + 3] / 255 + dst[pos + 2] * dst[pos + 3] / 255 * am);
     result[pos + 3] = this._cut(src[pos + 3] + dst[pos + 3] * am);
 };
 
 BlendModes.layer = function (src, dst, result, pos) {
     BlendModes.normal(src, dst, result, pos);
 };
 
 BlendModes.multiply = function (src, dst, result, pos) {
     result[pos + 0] = (src[pos + 0] * dst[pos + 0]) >> 8;
     result[pos + 1] = (src[pos + 1] * dst[pos + 1]) >> 8;
     result[pos + 2] = (src[pos + 2] * dst[pos + 2]) >> 8;
     result[pos + 3] = Math.min(255, src[pos + 3] + dst[pos + 3] - (src[pos + 3] * dst[pos + 3]) / 255);
 };
 
 BlendModes.screen = function (src, dst, result, pos) {
     result[pos + 0] = 255 - ((255 - src[pos + 0]) * (255 - dst[pos + 0]) >> 8);
     result[pos + 1] = 255 - ((255 - src[pos + 1]) * (255 - dst[pos + 1]) >> 8);
     result[pos + 2] = 255 - ((255 - src[pos + 2]) * (255 - dst[pos + 2]) >> 8);
     result[pos + 3] = Math.min(255, src[pos + 3] + dst[pos + 3] - (src[pos + 3] * dst[pos + 3]) / 255);
 };
 
 BlendModes.lighten = function (src, dst, result, pos) {
     result[pos + 0] = Math.max(src[pos + 0], dst[pos + 0]);
     result[pos + 1] = Math.max(src[pos + 1], dst[pos + 1]);
     result[pos + 2] = Math.max(src[pos + 2], dst[pos + 2]);
     result[pos + 3] = Math.min(255, src[pos + 3] + dst[pos + 3] - (src[pos + 3] * dst[pos + 3]) / 255);
 };
 
 BlendModes.darken = function (src, dst, result, pos) {
     result[pos + 0] = Math.min(src[pos + 0], dst[pos + 0]);
     result[pos + 1] = Math.min(src[pos + 1], dst[pos + 1]);
     result[pos + 2] = Math.min(src[pos + 2], dst[pos + 2]);
     result[pos + 3] = Math.min(255, src[pos + 3] + dst[pos + 3] - (src[pos + 3] * dst[pos + 3]) / 255);
 };
 
 BlendModes.difference = function (src, dst, result, pos) {
     result[pos + 0] = Math.abs(dst[pos + 0] - src[pos + 0]);
     result[pos + 1] = Math.abs(dst[pos + 1] - src[pos + 1]);
     result[pos + 2] = Math.abs(dst[pos + 2] - src[pos + 2]);
     result[pos + 3] = Math.min(255, src[pos + 3] + dst[pos + 3] - (src[pos + 3] * dst[pos + 3]) / 255);
 };
 
 BlendModes.add = function (src, dst, result, pos) {
     result[pos + 0] = Math.min(255, src[pos + 0] + dst[pos + 0]);
     result[pos + 1] = Math.min(255, src[pos + 1] + dst[pos + 1]);
     result[pos + 2] = Math.min(255, src[pos + 2] + dst[pos + 2]);
     result[pos + 3] = Math.min(255, src[pos + 3] + dst[pos + 3]);
 };
 
 BlendModes.subtract = function (src, dst, result, pos) {
     result[pos + 0] = Math.max(0, src[pos + 0] + dst[pos + 0] - 256);
     result[pos + 1] = Math.max(0, src[pos + 1] + dst[pos + 1] - 256);
     result[pos + 2] = Math.max(0, src[pos + 2] + dst[pos + 2] - 256);
     result[pos + 3] = Math.min(255, src[pos + 3] + dst[pos + 3] - (src[pos + 3] * dst[pos + 3]) / 255);
 };
 
 BlendModes.invert = function (src, dst, result, pos) {
     result[pos + 0] = 255 - dst[pos + 0];
     result[pos + 1] = 255 - dst[pos + 1];
     result[pos + 2] = 255 - dst[pos + 2];
     result[pos + 3] = src[pos + 3];
 };
 
 BlendModes.alpha = function (src, dst, result, pos) {
     result[pos + 0] = src[pos + 0];
     result[pos + 1] = src[pos + 1];
     result[pos + 2] = src[pos + 2];
     result[pos + 3] = dst[pos + 3]; //?
 };
 
 BlendModes.erase = function (src, dst, result, pos) {
     result[pos + 0] = src[pos + 0];
     result[pos + 1] = src[pos + 1];
     result[pos + 2] = src[pos + 2];
     result[pos + 3] = 255 - dst[pos + 3]; //?
 };
 
 BlendModes.overlay = function (src, dst, result, pos) {
     result[pos + 0] = dst[pos + 0] < 128 ? dst[pos + 0] * src[pos + 0] >> 7
             : 255 - ((255 - dst[pos + 0]) * (255 - src[pos + 0]) >> 7);
     result[pos + 1] = dst[pos + 1] < 128 ? dst[pos + 1] * src[pos + 1] >> 7
             : 255 - ((255 - dst[pos + 1]) * (255 - src[pos + 1]) >> 7);
     result[pos + 2] = dst[pos + 2] < 128 ? dst[pos + 2] * src[pos + 2] >> 7
             : 255 - ((255 - dst[pos + 2]) * (255 - src[pos + 2]) >> 7);
     result[pos + 3] = Math.min(255, src[pos + 3] + dst[pos + 3] - (src[pos + 3] * dst[pos + 3]) / 255);
 };
 
 BlendModes.hardlight = function (src, dst, result, pos) {
     result[pos + 0] = src[pos + 0] < 128 ? dst[pos + 0] * src[pos + 0] >> 7
             : 255 - ((255 - src[pos + 0]) * (255 - dst[pos + 0]) >> 7);
     result[pos + 1] = src[pos + 1] < 128 ? dst[pos + 1] * src[pos + 1] >> 7
             : 255 - ((255 - src[pos + 1]) * (255 - dst[pos + 1]) >> 7);
     result[pos + 2] = src[pos + 2] < 128 ? dst[pos + 2] * src[pos + 2] >> 7
             : 255 - ((255 - src[pos + 2]) * (255 - dst[pos + 2]) >> 7);
     result[pos + 3] = Math.min(255, src[pos + 3] + dst[pos + 3] - (src[pos + 3] * dst[pos + 3]) / 255);
 };
 
 BlendModes._list = [
     BlendModes.normal,
     BlendModes.normal,
     BlendModes.layer,
     BlendModes.multiply,
     BlendModes.screen,
     BlendModes.lighten,
     BlendModes.darken,
     BlendModes.difference,
     BlendModes.add,
     BlendModes.subtract,
     BlendModes.invert,
     BlendModes.alpha,
     BlendModes.erase,
     BlendModes.overlay,
     BlendModes.hardlight
 ];
 
 BlendModes.blendData = function (srcPixel, dstPixel, retData, modeIndex) {
     var result = [];
     var retPixel = [];
     var alpha = 1.0;
     for (var i = 0; i < retData.length; i += 4) {
         this._list[modeIndex](srcPixel, dstPixel, result, i);
 
         retPixel[i + 0] = this._cut(dstPixel[i + 0] + (result[i + 0] - dstPixel[i + 0]) * alpha);
         retPixel[i + 1] = this._cut(dstPixel[i + 1] + (result[i + 1] - dstPixel[i + 1]) * alpha);
         retPixel[i + 2] = this._cut(dstPixel[i + 2] + (result[i + 2] - dstPixel[i + 2]) * alpha);
         retPixel[i + 3] = this._cut(dstPixel[i + 3] + (result[i + 3] - dstPixel[i + 3]) * alpha);
 
         var af = srcPixel[i + 3] / 255;
         retData[i + 0] = this._cut((1 - af) * dstPixel[i + 0] + af * retPixel[i + 0]);
         retData[i + 1] = this._cut((1 - af) * dstPixel[i + 1] + af * retPixel[i + 1]);
         retData[i + 2] = this._cut((1 - af) * dstPixel[i + 2] + af * retPixel[i + 2]);
         retData[i + 3] = this._cut((1 - af) * dstPixel[i + 3] + af * retPixel[i + 3]);
     }
 };
 
 BlendModes.blendCanvas = function (src, dst, result, modeIndex) {
     var width = src.width;
     var height = src.height;
     var rctx = result.getContext("2d");
     var sctx = src.getContext("2d");
     var dctx = dst.getContext("2d");
     var ridata = rctx.getImageData(0, 0, width, height);
     var sidata = sctx.getImageData(0, 0, width, height);
     var didata = dctx.getImageData(0, 0, width, height);
 
     this.blendData(sidata.data, didata.data, ridata.data, modeIndex);
     rctx.putImageData(ridata, 0, 0);
 };
 
 
 function concatMatrix(m1, m2) {
     var result = [1, 0, 0, 1, 0, 0];
     var scaleX = 0;
     var rotateSkew0 = 1;
     var rotateSkew1 = 2;
     var scaleY = 3;
     var translateX = 4;
     var translateY = 5;
 
     result[scaleX] = m2[scaleX] * m1[scaleX] + m2[rotateSkew1] * m1[rotateSkew0];
     result[rotateSkew0] = m2[rotateSkew0] * m1[scaleX] + m2[scaleY] * m1[rotateSkew0];
     result[rotateSkew1] = m2[scaleX] * m1[rotateSkew1] + m2[rotateSkew1] * m1[scaleY];
     result[scaleY] = m2[rotateSkew0] * m1[rotateSkew1] + m2[scaleY] * m1[scaleY];
     result[translateX] = m2[scaleX] * m1[translateX] + m2[rotateSkew1] * m1[translateY] + m2[translateX];
     result[translateY] = m2[rotateSkew0] * m1[translateX] + m2[scaleY] * m1[translateY] + m2[translateY];
 
     return result;
 }
 
 var enhanceContext = function (context) {
     var m = [1, 0, 0, 1, 0, 0];
     context._matrix = m;
 
     //the stack of saved matrices
     context._savedMatrices = [m]; //[[m]];
 
     var super_ = context.__proto__;
     context.__proto__ = ({
         save: function () {
             this._savedMatrices.push(this._matrix); //.slice()
             super_.save.call(this);
         },
         //if the stack of matrices we're managing doesn't have a saved matrix,
         //we won't even call the context's original `restore` method.
         restore: function () {
             if (this._savedMatrices.length == 0)
                 return;
             super_.restore.call(this);
             this._matrix = this._savedMatrices.pop();
         },
         scale: function (x, y) {
             super_.scale.call(this, x, y);
         },
         rotate: function (theta) {
             super_.rotate.call(this, theta);
         },
         translate: function (x, y) {
             super_.translate.call(this, x, y);
         },
         transform: function (a, b, c, d, e, f) {
             this._matrix = concatMatrix([a, b, c, d, e, f], this._matrix);
             super_.transform.call(this, a, b, c, d, e, f);
         },
         setTransform: function (a, b, c, d, e, f) {
             this._matrix = [a, b, c, d, e, f];
             super_.setTransform.call(this, a, b, c, d, e, f);
         },
         resetTransform: function () {
             super_.resetTransform.call(this);
         },
         applyTransforms: function (m) {
             this.setTransform(m[0], m[1], m[2], m[3], m[4], m[5])
         },
         applyTransformToPoint: function (p) {
             var ret = {};
             ret.x = this._matrix[0] * p.x + this._matrix[2] * p.y + this._matrix[4];
             ret.y = this._matrix[1] * p.x + this._matrix[3] * p.y + this._matrix[5];
             return ret;
         },
         __proto__: super_
     });
 
     return context;
 };
 var cxform = function (r_add, g_add, b_add, a_add, r_mult, g_mult, b_mult, a_mult) {
     this.r_add = r_add;
     this.g_add = g_add;
     this.b_add = b_add;
     this.a_add = a_add;
     this.r_mult = r_mult;
     this.g_mult = g_mult;
     this.b_mult = b_mult;
     this.a_mult = a_mult;
     this._cut = function (v, min, max) {
         if (v < min)
             v = min;
         if (v > max)
             v = max;
         return v;
     };
     this.apply = function (c) {
         var d = c;
         d[0] = this._cut(Math.round(d[0] * this.r_mult / 255 + this.r_add), 0, 255);
         d[1] = this._cut(Math.round(d[1] * this.g_mult / 255 + this.g_add), 0, 255);
         d[2] = this._cut(Math.round(d[2] * this.b_mult / 255 + this.b_add), 0, 255);
         d[3] = this._cut(d[3] * this.a_mult / 255 + this.a_add / 255, 0, 1);
         return d;
     };
     this.applyToImage = function (fimg) {
         if (this.isEmpty()) {
             return fimg
         }
         ;
         var icanvas = createCanvas(fimg.width, fimg.height);
         var ictx = icanvas.getContext("2d");
         ictx.drawImage(fimg, 0, 0);
         var imdata = ictx.getImageData(0, 0, icanvas.width, icanvas.height);
         var idata = imdata.data;
         for (var i = 0; i < idata.length; i += 4) {
             var c = this.apply([idata[i], idata[i + 1], idata[i + 2], idata[i + 3] / 255]);
             idata[i] = c[0];
             idata[i + 1] = c[1];
             idata[i + 2] = c[2];
             idata[i + 3] = Math.round(c[3] * 255);
         }
         ictx.putImageData(imdata, 0, 0);
         return icanvas;
     };
     this.merge = function (cx) {
         return new cxform(this.r_add + cx.r_add, this.g_add + cx.g_add, this.b_add + cx.b_add, this.a_add + cx.a_add, this.r_mult * cx.r_mult / 255, this.g_mult * cx.g_mult / 255, this.b_mult * cx.b_mult / 255, this.a_mult * cx.a_mult / 255);
     };
     this.isEmpty = function () {
         return this.r_add == 0 && this.g_add == 0 && this.b_add == 0 && this.a_add == 0 && this.r_mult == 255 && this.g_mult == 255 && this.b_mult == 255 && this.a_mult == 255;
     };
 };
 
 var placeRaw = function (obj, canvas, ctx, matrix, ctrans, blendMode, frame, ratio, time) {
     ctx.save();
     ctx.transform(matrix[0], matrix[1], matrix[2], matrix[3], matrix[4], matrix[5]);
     if (blendMode > 1) {
         var oldctx = ctx;
         var ncanvas = createCanvas(canvas.width, canvas.height);
         ctx = ncanvas.getContext("2d");
         enhanceContext(ctx);
         ctx.applyTransforms(oldctx._matrix);
     }
     if (blendMode > 1) {
         eval(obj + "(ctx,new cxform(0,0,0,0,255,255,255,255),frame,ratio,time);");
     } else {
         eval(obj + "(ctx,ctrans,frame,ratio,time);");
     }
     if (blendMode > 1) {
         BlendModes.blendCanvas(ctrans.applyToImage(ncanvas), canvas, canvas, blendMode);
         ctx = oldctx;
     }
     ctx.restore();
 }
 
 var transformPoint = function (matrix, p) {
             var ret = {};
             ret.x = matrix[0] * p.x + matrix[2] * p.y + matrix[4];
             ret.y = matrix[1] * p.x + matrix[3] * p.y + matrix[5];
             return ret;
         }
 
 var transformRect = function(matrix, rect) {
       var minX = Number.MAX_VALUE;
       var minY = Number.MAX_VALUE;
       var maxX = Number.MIN_VALUE;
       var maxY = Number.MIN_VALUE;
       var point = transformPoint(matrix, {x:rect.xMin,y:rect.yMin});
       if (point.x < minX) {
           minX = point.x;
       }
       if (point.x > maxX) {
           maxX = point.x;
       }
       if (point.y < minY) {
           minY = point.y;
       }
       if (point.y > maxY) {
           maxY = point.y;
       }
       point = transformPoint(matrix, {x:rect.xMax, y:rect.yMin});
       if (point.x < minX) {
           minX = point.x;
       }
       if (point.x > maxX) {
           maxX = point.x;
       }
       if (point.y < minY) {
           minY = point.y;
       }
       if (point.y > maxY) {
           maxY = point.y;
       }
       point = transformPoint(matrix, {x:rect.xMin, y:rect.yMax});
       if (point.x < minX) {
           minX = point.x;
       }
       if (point.x > maxX) {
           maxX = point.x;
       }
       if (point.y < minY) {
           minY = point.y;
       }
       if (point.y > maxY) {
           maxY = point.y;
       }
       point = transformPoint(matrix, {x:rect.xMax, y:rect.yMax});
       if (point.x < minX) {
           minX = point.x;
       }
       if (point.x > maxX) {
           maxX = point.x;
       }
       if (point.y < minY) {
           minY = point.y;
       }
       if (point.y > maxY) {
           maxY = point.y;
       }
       return {xMin:minX, xMax:maxX, yMin:minY, yMax:maxY};
   }
 
 var getTranslateMatrix = function(translateX,translateY){
     return [1,0,0,1,translateX,translateY];
 }
 
 var getRectWidth = function (rect) {
     return rect.xMax - rect.xMin;
 }
 
 var getRectHeight = function (rect) {
     return rect.yMax - rect.yMin;
 }
 
 var rint = function(v){
     return Math.round(v);
 }
 
 var scaleMatrix = function(m, factorX, factorY){
     var scaleX = 0;
     var rotateSkew0 = 1;
     var rotateSkew1 = 2;
     var scaleY = 3;
     var translateX = 4;
     var translateY = 5;
     
     var m2 = Object.assign({}, m);
     
     m2[scaleX] *= factorX;
     m2[scaleY] *= factorY;
     m2[rotateSkew0] *= factorX;
     m2[rotateSkew1] *= factorY;
     return m2;
 }
 
 var translateMatrix = function(m, x, y) {
     var m2 = Object.assign({}, m);
     var scaleX = 0;
     var rotateSkew0 = 1;
     var rotateSkew1 = 2;
     var scaleY = 3;
     var translateX = 4;
     var translateY = 5;
     
     m2[translateX] = m2[scaleX] * x + m2[rotateSkew1] * y + m2[translateX];
     m2[translateY] = m2[rotateSkew0] * x + m2[scaleY] * y + m2[translateY];
     
     return m2;        
 }
 
 var place = function (obj, canvas, ctx, matrix, ctrans, blendMode, frame, ratio, time) {
     if ((typeof scalingGrids[obj]) !== "undefined")
     {
         var swfScaleMatrix = [1/20,0,0,1/20,0,0];
         var boundRect = boundRects[obj];
         var scalingRect = scalingGrids[obj];
         var exRect = boundRect;
         var newRect = exRect;
         var transform = matrix;
         
         var transform2;
         newRect = transformRect(transform, exRect);
         transform = Object.assign({}, transform);
 
         transform = getTranslateMatrix(newRect.xMin, newRect.yMin);
         
         transform = concatMatrix(swfScaleMatrix, transform);
 
         var scaleWidth = getRectWidth(newRect)*20 - scalingRect.xMin - (boundRect.xMax - scalingRect.xMax);
         var originalWidth = getRectWidth(boundRect) - scalingRect.xMin - (boundRect.xMax - scalingRect.xMax);
         var scaleX = scaleWidth / originalWidth;
         
         var scaleHeight = getRectHeight(newRect)*20 - scalingRect.yMin - (boundRect.yMax - scalingRect.yMax);
         var originalHeight = getRectHeight(boundRect) - scalingRect.yMin - (boundRect.yMax - scalingRect.yMax);
         var scaleY = scaleHeight / originalHeight;
 
         
         //top left
         ctx.save();
         drawPath(ctx,""
                 + "M "+ newRect.xMin +" "+ newRect.yMin +" "
                 + "L " + (newRect.xMin + rint(scalingRect.xMin / 20)) + " "+ newRect.yMin +" "
                 + "L " + (newRect.xMin + rint(scalingRect.xMin / 20)) + " " + (newRect.yMin + rint(scalingRect.yMin / 20)) + " "
                 + "L "+ newRect.xMin +" " + (newRect.yMin + rint(scalingRect.yMin / 20)) + " Z"
                 );
         ctx.clip();
         placeRaw(obj, canvas, ctx, transform, ctrans, blendMode, frame, ratio, time);
         
         ctx.restore();
         
         //bottom left
         transform2 = Object.assign({}, transform);
         transform2[5] /*translateY*/ += getRectHeight(newRect) - getRectHeight(boundRect)/20;
                 
         ctx.save();
         
         drawPath(ctx, "M "+ newRect.xMin +" " + (newRect.yMax-rint((boundRect.yMax - scalingRect.yMax) / 20)) + " "
                 + "L " + (newRect.xMin+rint(scalingRect.xMin / 20)) + " " + (newRect.yMax-rint((boundRect.yMax - scalingRect.yMax) / 20)) + " "
                 + "L " + (newRect.xMin+rint(scalingRect.xMin / 20)) + " " + newRect.yMax + " "
                 + "L "+ newRect.xMin +" " + newRect.yMax + " Z"
                 )
         ctx.clip();
         
         placeRaw(obj, canvas, ctx, transform2, ctrans, blendMode, frame, ratio, time);        
         ctx.restore();
         
         //top right
         transform2 = Object.assign({}, transform);
         transform2[4] /*translateX*/ += getRectWidth(newRect) - getRectWidth(boundRect) / 20;
         ctx.save();
         drawPath(ctx, "M " + (newRect.xMax - rint((exRect.xMax - scalingRect.xMax) / 20)) + " "+newRect.yMin+" "
                 + "L " + newRect.xMax + " "+newRect.yMin+" "
                 + "L " + newRect.xMax + " " + (newRect.yMin+rint(scalingRect.yMin / 20)) + " "
                 + "L " + (newRect.xMax - rint((exRect.xMax - scalingRect.xMax) / 20))  + " " + (newRect.yMin+rint(scalingRect.yMin / 20)) + " Z");
         
         ctx.clip();
         
         placeRaw(obj, canvas, ctx, transform2, ctrans, blendMode, frame, ratio, time);        
         ctx.restore();
         
         //bottom right
         transform2 = Object.assign({}, transform);
         transform2[4] /*translateX*/ += getRectWidth(newRect) - getRectWidth(boundRect) / 20;
         transform2[5] /*translateY*/ += getRectHeight(newRect) - getRectHeight(boundRect)/20;
         ctx.save();
         drawPath(ctx, "M " + (newRect.xMax - rint((exRect.xMax - scalingRect.xMax) / 20)) + " " + (newRect.yMax - rint((boundRect.yMax - scalingRect.yMax) / 20)) + " "
                 + "L " + newRect.xMax + " " + (newRect.yMax - rint((boundRect.yMax - scalingRect.yMax) / 20)) + " "
                 + "L " + newRect.xMax + " " + newRect.yMax + " "
                 + "L " + (newRect.xMax - rint((exRect.xMax - scalingRect.xMax) / 20)) + " " + newRect.yMax + " Z");
         
         ctx.clip();
         
         placeRaw(obj, canvas, ctx, transform2, ctrans, blendMode, frame, ratio, time);        
         ctx.restore();
         
         
         //top
         transform2 = Object.assign({}, transform);
         ctx.save();
         transform2 = translateMatrix(transform2, scalingRect.xMin, 0);
         transform2 = scaleMatrix(transform2, scaleX, 1);
         transform2 = translateMatrix(transform2, -scalingRect.xMin, 0);
 
         drawPath(ctx, "M " + (newRect.xMin + rint(scalingRect.xMin / 20)) + " " + newRect.yMin + " "
                 + "L " + (newRect.xMax - rint((boundRect.xMax-scalingRect.xMax) / 20)) + " " + newRect.yMin + " "
                 + "L " + (newRect.xMax - rint((boundRect.xMax-scalingRect.xMax) / 20)) + " " + (newRect.yMin + rint(scalingRect.yMin / 20)) + " "
                 + "L " + (newRect.xMin + rint(scalingRect.xMin / 20)) + " " + (newRect.yMin + rint(scalingRect.yMin / 20)) + " Z");
         
         ctx.clip();        
         placeRaw(obj, canvas, ctx, transform2, ctrans, blendMode, frame, ratio, time);        
         ctx.restore();
         
         //left
         transform2 = Object.assign({}, transform);
         ctx.save();
         transform2 = translateMatrix(transform2, 0, scalingRect.yMin);
         transform2 = scaleMatrix(transform2, 1, scaleY);
         transform2 = translateMatrix(transform2, 0, -scalingRect.yMin);
 
         drawPath(ctx, "M " + newRect.xMin + " " + (newRect.yMin + rint(scalingRect.yMin / 20)) + " "
                 + "L " + (newRect.xMin + rint(scalingRect.xMin / 20)) + " " + (newRect.yMin + rint(scalingRect.yMin / 20)) + " "
                 + "L " + (newRect.xMin + rint(scalingRect.xMin / 20)) + " " + (newRect.yMax - rint((boundRect.yMax-scalingRect.yMax) / 20)) + " "
                 + "L " + newRect.xMin + " " + (newRect.yMax - rint((boundRect.yMax-scalingRect.yMax) / 20)) + " Z");
         
         ctx.clip();        
         placeRaw(obj, canvas, ctx, transform2, ctrans, blendMode, frame, ratio, time);        
         ctx.restore();
         
         //bottom
         transform2 = Object.assign({}, transform);
         ctx.save();
         transform2 = translateMatrix(transform2, scalingRect.xMin, 0);
         transform2 = scaleMatrix(transform2, scaleX, 1);
         transform2 = translateMatrix(transform2, -scalingRect.xMin, 0);
         
         transform2 = translateMatrix(transform2, 0, getRectHeight(newRect)*20 - getRectHeight(boundRect));
 
         drawPath(ctx, "M " + (newRect.xMin + rint(scalingRect.xMin / 20)) + " " + (newRect.yMax - rint((boundRect.yMax-scalingRect.yMax) / 20)) + " "
                 + "L " + (newRect.xMax - rint((boundRect.xMax-scalingRect.xMax) / 20)) + " " + (newRect.yMax - rint((boundRect.yMax-scalingRect.yMax) / 20)) + " "
                 + "L " + (newRect.xMax - rint((boundRect.xMax-scalingRect.xMax) / 20)) + " " + newRect.yMax + " "
                 + "L " + (newRect.xMin + rint(scalingRect.xMin / 20)) + " " + newRect.yMax + " Z");
         
         ctx.clip();        
         placeRaw(obj, canvas, ctx, transform2, ctrans, blendMode, frame, ratio, time);        
         ctx.restore();
         
         //right
         transform2 = Object.assign({}, transform);
         ctx.save();
         transform2 = translateMatrix(transform2, 0, scalingRect.yMin)
         transform2 = scaleMatrix(transform2, 1, scaleY);
         transform2 = translateMatrix(transform2, 0, -scalingRect.yMin); 
         
         transform2 = translateMatrix(transform2, getRectWidth(newRect)*20 - getRectWidth(boundRect), 0);       
 
         drawPath(ctx, "M " + (newRect.xMax - rint((boundRect.xMax - scalingRect.xMax) / 20)) + " " + (newRect.yMin + rint(scalingRect.yMin / 20)) + " "
                 + "L " + newRect.xMax + " " + (newRect.yMin + rint(scalingRect.yMin / 20)) + " "
                 + "L " + newRect.xMax + " " + (newRect.yMax - rint((boundRect.yMax-scalingRect.yMax) / 20)) + " "
                 + "L " + (newRect.xMax - rint((boundRect.xMax - scalingRect.xMax) / 20)) + " " + (newRect.yMax - rint((boundRect.yMax-scalingRect.yMax) / 20)) + " Z");
         
         ctx.clip();        
         placeRaw(obj, canvas, ctx, transform2, ctrans, blendMode, frame, ratio, time);        
         ctx.restore();
         
         //center
         transform2 = Object.assign({}, transform);
         ctx.save();
         transform2 = translateMatrix(transform2, scalingRect.xMin, scalingRect.yMin)
         transform2 = scaleMatrix(transform2, scaleX, scaleY);
         transform2 = translateMatrix(transform2, -scalingRect.xMin, -scalingRect.yMin);             
 
         drawPath(ctx, "M " + (newRect.xMin + rint(scalingRect.xMin / 20)) + " " + (newRect.yMin + rint(scalingRect.yMin / 20)) + " "
                 + "L " + (newRect.xMax - rint((boundRect.xMax-scalingRect.xMax) / 20)) + " " + (newRect.yMin + rint(scalingRect.yMin / 20)) + " "
                 + "L " + (newRect.xMax - rint((boundRect.xMax-scalingRect.xMax) / 20)) + " " + (newRect.yMax - rint((boundRect.yMax-scalingRect.yMax) / 20)) + " "
                 + "L " + (newRect.xMin + rint(scalingRect.xMin / 20)) + " " + (newRect.yMax - rint((boundRect.yMax-scalingRect.yMax) / 20)) + " Z");
         
         ctx.clip();        
         placeRaw(obj, canvas, ctx, transform2, ctrans, blendMode, frame, ratio, time);        
         ctx.restore();        
         return;
     }
     placeRaw(obj, canvas, ctx, matrix, ctrans, blendMode, frame, ratio, time);
 }
 
 var tocolor = function (c) {
     var r = "rgba(" + c[0] + "," + c[1] + "," + c[2] + "," + c[3] + ")";
     return r;
 };
 
 function drawMorphPath(ctx, p, ratio, doStroke, scaleMode) {
     var parts = p.split(" ");
     var len = parts.length;
     if (doStroke) {
         for (var i = 0; i < len; i++) {
             switch (parts[i]) {
                 case '':
                     break;
                 case 'L':
                 case 'M':
                 case 'Q':
                     break;
                 default:
                     var k = ctx.applyTransformToPoint({x: parts[i], y: parts[i + 2]});
                     parts[i] = k.x;
                     parts[i + 2] = k.y;
                     k = ctx.applyTransformToPoint({x: parts[i + 1], y: parts[i + 3]});
                     parts[i + 1] = k.x;
                     parts[i + 3] = k.y;
                     i += 3;
             }
         }
 
         switch (scaleMode) {
             case "NONE":
                 break;
             case "NORMAL":
                 ctx.lineWidth *= 20 * Math.max(ctx._matrix[0], ctx._matrix[3]);
                 break;
             case "VERTICAL":
                 ctx.lineWidth *= 20 * ctx._matrix[3];
                 break;
             case "HORIZONTAL":
                 ctx.lineWidth *= 20 * ctx._matrix[0];
                 break;
         }
 
         ctx.save();
         ctx.setTransform(1, 0, 0, 1, 0, 0);
     }
     ctx.beginPath();
     var drawCommand = "";
     for (var i = 0; i < len; i++) {
         switch (parts[i]) {
             case 'L':
             case 'M':
             case 'Q':
                 drawCommand = parts[i];
                 break;
             default:
                 switch (drawCommand) {
                     case 'L':
                         ctx.lineTo(useRatio(parts[i], parts[i + 1], ratio), useRatio(parts[i + 2], parts[i + 3], ratio));
                         i += 3;
                         break;
                     case 'M':
                         ctx.moveTo(useRatio(parts[i], parts[i + 1], ratio), useRatio(parts[i + 2], parts[i + 3], ratio));
                         i += 3;
                         break;
                     case 'Q':
                         ctx.quadraticCurveTo(useRatio(parts[i], parts[i + 1], ratio), useRatio(parts[i + 2], parts[i + 3], ratio),
                                 useRatio(parts[i + 4], parts[i + 5], ratio), useRatio(parts[i + 6], parts[i + 7], ratio));
                         i += 7;
                         break;
                 }
                 break;
         }
     }
     if (doStroke) {
         ctx.stroke();
         ctx.restore();
     }
 }
 
 function useRatio(v1, v2, ratio) {
     return v1 * 1 + (v2 - v1) * ratio / 65535;
 }
 
 function drawPath(ctx, p, doStroke, scaleMode) {
 //console.log("drawing "+p)
     var parts = p.split(" ");
     var len = parts.length;
     if (doStroke) {
         for (var i = 0; i < len; i++) {
             switch (parts[i]) {
                 case 'L':
                 case 'M':
                 case 'Q':
                 case 'Z':
                     break;
                 default:
                     var k = ctx.applyTransformToPoint({x: parts[i], y: parts[i + 1]});
                     parts[i] = k.x;
                     parts[i + 1] = k.y;
                     i++;
             }
         }
 
         switch (scaleMode) {
             case "NONE":
                 break;
             case "NORMAL":
                 ctx.lineWidth *= 20 * Math.max(ctx._matrix[0], ctx._matrix[3]);
                 break;
             case "VERTICAL":
                 ctx.lineWidth *= 20 * ctx._matrix[3];
                 break;
             case "HORIZONTAL":
                 ctx.lineWidth *= 20 * ctx._matrix[0];
                 break;
         }
 
         ctx.save();
         ctx.setTransform(1, 0, 0, 1, 0, 0);
     }
     ctx.beginPath();
     var drawCommand = "";
     for (var i = 0; i < len; i++) {
         switch (parts[i]) {
             case 'L':
             case 'M':
             case 'Q':
                 drawCommand = parts[i];
                 break;
             case 'Z':
                 ctx.closePath();
                 break;
             default:
                 switch (drawCommand) {
                     case 'L':
                         ctx.lineTo(parts[i], parts[i + 1]);
                         i++;
                         break;
                     case 'M':
                         ctx.moveTo(parts[i], parts[i + 1]);
                         i++;
                         break;
                     case 'Q':
                         ctx.quadraticCurveTo(parts[i], parts[i + 1], parts[i + 2], parts[i + 3]);
                         i += 3;
                         break;
                 }
                 break;
         }
     }
     if (doStroke) {
         ctx.stroke();
         ctx.restore();
     }
 }

var cloudy_canvas=document.getElementById("cloudy");
var ctx=cloudy_canvas.getContext("2d");
enhanceContext(ctx);
var ctrans = new cxform(0,0,0,0,255,255,255,255);

var scalingGrids = {};
var boundRects = {};
function shape160(ctx,ctrans,frame,ratio,time){
	var pathData="M -922 -195 Q -636 -233 -439 -39";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([210,101,3,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M 306 181 Q 571 159 866 358";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([210,101,3,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

}

function sprite161(ctx,ctrans,frame,ratio,time){
	var clips = [];
	var frame_cnt = 17;
	frame = frame % frame_cnt;
	switch(frame){
		case 0:
			place("shape158",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
		case 1:
			place("shape158",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
		case 2:
			place("shape158",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
		case 3:
			place("shape158",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
		case 4:
			place("shape158",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
		case 5:
			place("shape158",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
		case 6:
			place("shape158",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
		case 7:
			place("shape158",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
		case 8:
			place("shape158",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
		case 9:
			place("shape158",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
		case 10:
			place("shape158",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
		case 11:
			place("shape158",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
		case 12:
			place("shape158",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			place("shape159",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
		case 13:
			place("shape158",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			place("shape159",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
		case 14:
			place("shape160",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
		case 15:
			place("shape160",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
		case 16:
			place("shape160",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
	}
}

function sprite162(ctx,ctrans,frame,ratio,time){
	var clips = [];
	var frame_cnt = 1;
	frame = frame % frame_cnt;
	switch(frame){
		case 0:
			place("shape154",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			place("sprite157",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,-790.0,1096.0],ctrans,1,(0+time)%24,0,time);
			place("sprite161",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,-634.0,197.0],ctrans,1,(0+time)%17,0,time);
			break;
	}
}

function sprite163(ctx,ctrans,frame,ratio,time){
	var clips = [];
	var frame_cnt = 20;
	frame = frame % frame_cnt;
	switch(frame){
		case 0:
			place("shape151",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			clips.push({ctx:ctx,canvas:cloudy_canvas});
			var ccanvas = createCanvas(cloudy_canvas.width,cloudy_canvas.height);
			var cctx = ccanvas.getContext("2d");
			enhanceContext(cctx);
			cctx.applyTransforms(ctx._matrix);
			cloudy_canvas = ccanvas;
			ctx = cctx;
			place("shape152",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			clips[clips.length-1].clipCanvas = cloudy_canvas;
			cloudy_canvas = createCanvas(cloudy_canvas.width,cloudy_canvas.height);
			var nctx = cloudy_canvas.getContext("2d");
			enhanceContext(nctx);
			nctx.applyTransforms(ctx._matrix);
			ctx = nctx;
			place("shape153",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			place("sprite162",cloudy_canvas,ctx,[0.4979248046875,-0.0438995361328125,0.043914794921875,0.4979248046875,1510.0,1300.0],ctrans,1,(0+time)%1,0,time);
			var o = clips.pop();
			ctx.globalCompositeOperation = "destination-in";
			ctx.setTransform(1,0,0,1,0,0);
			ctx.drawImage(o.clipCanvas,0,0);
			var ms=o.ctx._matrix;
			o.ctx.setTransform(1,0,0,1,0,0);
			o.ctx.globalCompositeOperation = "source-over";
			o.ctx.drawImage(cloudy_canvas,0,0);
			o.ctx.applyTransforms(ms);
			ctx = o.ctx;
			cloudy_canvas = o.canvas;
			break;
		case 1:
			place("shape151",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			clips.push({ctx:ctx,canvas:cloudy_canvas});
			var ccanvas = createCanvas(cloudy_canvas.width,cloudy_canvas.height);
			var cctx = ccanvas.getContext("2d");
			enhanceContext(cctx);
			cctx.applyTransforms(ctx._matrix);
			cloudy_canvas = ccanvas;
			ctx = cctx;
			place("shape152",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			clips[clips.length-1].clipCanvas = cloudy_canvas;
			cloudy_canvas = createCanvas(cloudy_canvas.width,cloudy_canvas.height);
			var nctx = cloudy_canvas.getContext("2d");
			enhanceContext(nctx);
			nctx.applyTransforms(ctx._matrix);
			ctx = nctx;
			place("shape153",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			place("sprite162",cloudy_canvas,ctx,[0.4979248046875,-0.0438995361328125,0.043914794921875,0.4979248046875,1510.0,1300.0],ctrans,1,(0+time)%1,0,time);
			var o = clips.pop();
			ctx.globalCompositeOperation = "destination-in";
			ctx.setTransform(1,0,0,1,0,0);
			ctx.drawImage(o.clipCanvas,0,0);
			var ms=o.ctx._matrix;
			o.ctx.setTransform(1,0,0,1,0,0);
			o.ctx.globalCompositeOperation = "source-over";
			o.ctx.drawImage(cloudy_canvas,0,0);
			o.ctx.applyTransforms(ms);
			ctx = o.ctx;
			cloudy_canvas = o.canvas;
			break;
		case 2:
			place("shape151",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			clips.push({ctx:ctx,canvas:cloudy_canvas});
			var ccanvas = createCanvas(cloudy_canvas.width,cloudy_canvas.height);
			var cctx = ccanvas.getContext("2d");
			enhanceContext(cctx);
			cctx.applyTransforms(ctx._matrix);
			cloudy_canvas = ccanvas;
			ctx = cctx;
			place("shape152",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			clips[clips.length-1].clipCanvas = cloudy_canvas;
			cloudy_canvas = createCanvas(cloudy_canvas.width,cloudy_canvas.height);
			var nctx = cloudy_canvas.getContext("2d");
			enhanceContext(nctx);
			nctx.applyTransforms(ctx._matrix);
			ctx = nctx;
			place("shape153",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			place("sprite162",cloudy_canvas,ctx,[0.4979248046875,-0.0438995361328125,0.043914794921875,0.4979248046875,1510.0,1300.0],ctrans,1,(0+time)%1,0,time);
			var o = clips.pop();
			ctx.globalCompositeOperation = "destination-in";
			ctx.setTransform(1,0,0,1,0,0);
			ctx.drawImage(o.clipCanvas,0,0);
			var ms=o.ctx._matrix;
			o.ctx.setTransform(1,0,0,1,0,0);
			o.ctx.globalCompositeOperation = "source-over";
			o.ctx.drawImage(cloudy_canvas,0,0);
			o.ctx.applyTransforms(ms);
			ctx = o.ctx;
			cloudy_canvas = o.canvas;
			break;
		case 3:
			place("shape151",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			clips.push({ctx:ctx,canvas:cloudy_canvas});
			var ccanvas = createCanvas(cloudy_canvas.width,cloudy_canvas.height);
			var cctx = ccanvas.getContext("2d");
			enhanceContext(cctx);
			cctx.applyTransforms(ctx._matrix);
			cloudy_canvas = ccanvas;
			ctx = cctx;
			place("shape152",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			clips[clips.length-1].clipCanvas = cloudy_canvas;
			cloudy_canvas = createCanvas(cloudy_canvas.width,cloudy_canvas.height);
			var nctx = cloudy_canvas.getContext("2d");
			enhanceContext(nctx);
			nctx.applyTransforms(ctx._matrix);
			ctx = nctx;
			place("shape153",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			place("sprite162",cloudy_canvas,ctx,[0.4979248046875,-0.0438995361328125,0.043914794921875,0.4979248046875,1510.0,1300.0],ctrans,1,(0+time)%1,0,time);
			var o = clips.pop();
			ctx.globalCompositeOperation = "destination-in";
			ctx.setTransform(1,0,0,1,0,0);
			ctx.drawImage(o.clipCanvas,0,0);
			var ms=o.ctx._matrix;
			o.ctx.setTransform(1,0,0,1,0,0);
			o.ctx.globalCompositeOperation = "source-over";
			o.ctx.drawImage(cloudy_canvas,0,0);
			o.ctx.applyTransforms(ms);
			ctx = o.ctx;
			cloudy_canvas = o.canvas;
			break;
		case 4:
			place("shape151",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			clips.push({ctx:ctx,canvas:cloudy_canvas});
			var ccanvas = createCanvas(cloudy_canvas.width,cloudy_canvas.height);
			var cctx = ccanvas.getContext("2d");
			enhanceContext(cctx);
			cctx.applyTransforms(ctx._matrix);
			cloudy_canvas = ccanvas;
			ctx = cctx;
			place("shape152",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			clips[clips.length-1].clipCanvas = cloudy_canvas;
			cloudy_canvas = createCanvas(cloudy_canvas.width,cloudy_canvas.height);
			var nctx = cloudy_canvas.getContext("2d");
			enhanceContext(nctx);
			nctx.applyTransforms(ctx._matrix);
			ctx = nctx;
			place("shape153",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			place("sprite162",cloudy_canvas,ctx,[0.4979248046875,-0.0438995361328125,0.043914794921875,0.4979248046875,1510.0,1300.0],ctrans,1,(0+time)%1,0,time);
			var o = clips.pop();
			ctx.globalCompositeOperation = "destination-in";
			ctx.setTransform(1,0,0,1,0,0);
			ctx.drawImage(o.clipCanvas,0,0);
			var ms=o.ctx._matrix;
			o.ctx.setTransform(1,0,0,1,0,0);
			o.ctx.globalCompositeOperation = "source-over";
			o.ctx.drawImage(cloudy_canvas,0,0);
			o.ctx.applyTransforms(ms);
			ctx = o.ctx;
			cloudy_canvas = o.canvas;
			break;
		case 5:
			place("shape151",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			clips.push({ctx:ctx,canvas:cloudy_canvas});
			var ccanvas = createCanvas(cloudy_canvas.width,cloudy_canvas.height);
			var cctx = ccanvas.getContext("2d");
			enhanceContext(cctx);
			cctx.applyTransforms(ctx._matrix);
			cloudy_canvas = ccanvas;
			ctx = cctx;
			place("shape152",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			clips[clips.length-1].clipCanvas = cloudy_canvas;
			cloudy_canvas = createCanvas(cloudy_canvas.width,cloudy_canvas.height);
			var nctx = cloudy_canvas.getContext("2d");
			enhanceContext(nctx);
			nctx.applyTransforms(ctx._matrix);
			ctx = nctx;
			place("shape153",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			place("sprite162",cloudy_canvas,ctx,[0.4979248046875,-0.0438995361328125,0.043914794921875,0.4979248046875,1510.0,1300.0],ctrans,1,(0+time)%1,0,time);
			var o = clips.pop();
			ctx.globalCompositeOperation = "destination-in";
			ctx.setTransform(1,0,0,1,0,0);
			ctx.drawImage(o.clipCanvas,0,0);
			var ms=o.ctx._matrix;
			o.ctx.setTransform(1,0,0,1,0,0);
			o.ctx.globalCompositeOperation = "source-over";
			o.ctx.drawImage(cloudy_canvas,0,0);
			o.ctx.applyTransforms(ms);
			ctx = o.ctx;
			cloudy_canvas = o.canvas;
			break;
		case 6:
			place("shape151",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			clips.push({ctx:ctx,canvas:cloudy_canvas});
			var ccanvas = createCanvas(cloudy_canvas.width,cloudy_canvas.height);
			var cctx = ccanvas.getContext("2d");
			enhanceContext(cctx);
			cctx.applyTransforms(ctx._matrix);
			cloudy_canvas = ccanvas;
			ctx = cctx;
			place("shape152",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			clips[clips.length-1].clipCanvas = cloudy_canvas;
			cloudy_canvas = createCanvas(cloudy_canvas.width,cloudy_canvas.height);
			var nctx = cloudy_canvas.getContext("2d");
			enhanceContext(nctx);
			nctx.applyTransforms(ctx._matrix);
			ctx = nctx;
			place("shape153",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			place("sprite162",cloudy_canvas,ctx,[0.4979248046875,-0.0438995361328125,0.043914794921875,0.4979248046875,1510.0,1300.0],ctrans,1,(0+time)%1,0,time);
			var o = clips.pop();
			ctx.globalCompositeOperation = "destination-in";
			ctx.setTransform(1,0,0,1,0,0);
			ctx.drawImage(o.clipCanvas,0,0);
			var ms=o.ctx._matrix;
			o.ctx.setTransform(1,0,0,1,0,0);
			o.ctx.globalCompositeOperation = "source-over";
			o.ctx.drawImage(cloudy_canvas,0,0);
			o.ctx.applyTransforms(ms);
			ctx = o.ctx;
			cloudy_canvas = o.canvas;
			break;
		case 7:
			place("shape151",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			clips.push({ctx:ctx,canvas:cloudy_canvas});
			var ccanvas = createCanvas(cloudy_canvas.width,cloudy_canvas.height);
			var cctx = ccanvas.getContext("2d");
			enhanceContext(cctx);
			cctx.applyTransforms(ctx._matrix);
			cloudy_canvas = ccanvas;
			ctx = cctx;
			place("shape152",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			clips[clips.length-1].clipCanvas = cloudy_canvas;
			cloudy_canvas = createCanvas(cloudy_canvas.width,cloudy_canvas.height);
			var nctx = cloudy_canvas.getContext("2d");
			enhanceContext(nctx);
			nctx.applyTransforms(ctx._matrix);
			ctx = nctx;
			place("shape153",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			place("sprite162",cloudy_canvas,ctx,[0.4979248046875,-0.0438995361328125,0.043914794921875,0.4979248046875,1510.0,1300.0],ctrans,1,(0+time)%1,0,time);
			var o = clips.pop();
			ctx.globalCompositeOperation = "destination-in";
			ctx.setTransform(1,0,0,1,0,0);
			ctx.drawImage(o.clipCanvas,0,0);
			var ms=o.ctx._matrix;
			o.ctx.setTransform(1,0,0,1,0,0);
			o.ctx.globalCompositeOperation = "source-over";
			o.ctx.drawImage(cloudy_canvas,0,0);
			o.ctx.applyTransforms(ms);
			ctx = o.ctx;
			cloudy_canvas = o.canvas;
			break;
		case 8:
			place("shape151",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			clips.push({ctx:ctx,canvas:cloudy_canvas});
			var ccanvas = createCanvas(cloudy_canvas.width,cloudy_canvas.height);
			var cctx = ccanvas.getContext("2d");
			enhanceContext(cctx);
			cctx.applyTransforms(ctx._matrix);
			cloudy_canvas = ccanvas;
			ctx = cctx;
			place("shape152",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			clips[clips.length-1].clipCanvas = cloudy_canvas;
			cloudy_canvas = createCanvas(cloudy_canvas.width,cloudy_canvas.height);
			var nctx = cloudy_canvas.getContext("2d");
			enhanceContext(nctx);
			nctx.applyTransforms(ctx._matrix);
			ctx = nctx;
			place("shape153",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			place("sprite162",cloudy_canvas,ctx,[0.4979248046875,-0.0438995361328125,0.043914794921875,0.4979248046875,1510.0,1300.0],ctrans,1,(0+time)%1,0,time);
			var o = clips.pop();
			ctx.globalCompositeOperation = "destination-in";
			ctx.setTransform(1,0,0,1,0,0);
			ctx.drawImage(o.clipCanvas,0,0);
			var ms=o.ctx._matrix;
			o.ctx.setTransform(1,0,0,1,0,0);
			o.ctx.globalCompositeOperation = "source-over";
			o.ctx.drawImage(cloudy_canvas,0,0);
			o.ctx.applyTransforms(ms);
			ctx = o.ctx;
			cloudy_canvas = o.canvas;
			break;
		case 9:
			place("shape151",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			clips.push({ctx:ctx,canvas:cloudy_canvas});
			var ccanvas = createCanvas(cloudy_canvas.width,cloudy_canvas.height);
			var cctx = ccanvas.getContext("2d");
			enhanceContext(cctx);
			cctx.applyTransforms(ctx._matrix);
			cloudy_canvas = ccanvas;
			ctx = cctx;
			place("shape152",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			clips[clips.length-1].clipCanvas = cloudy_canvas;
			cloudy_canvas = createCanvas(cloudy_canvas.width,cloudy_canvas.height);
			var nctx = cloudy_canvas.getContext("2d");
			enhanceContext(nctx);
			nctx.applyTransforms(ctx._matrix);
			ctx = nctx;
			place("shape153",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			place("sprite162",cloudy_canvas,ctx,[0.4979248046875,-0.0438995361328125,0.043914794921875,0.4979248046875,1510.0,1300.0],ctrans,1,(0+time)%1,0,time);
			var o = clips.pop();
			ctx.globalCompositeOperation = "destination-in";
			ctx.setTransform(1,0,0,1,0,0);
			ctx.drawImage(o.clipCanvas,0,0);
			var ms=o.ctx._matrix;
			o.ctx.setTransform(1,0,0,1,0,0);
			o.ctx.globalCompositeOperation = "source-over";
			o.ctx.drawImage(cloudy_canvas,0,0);
			o.ctx.applyTransforms(ms);
			ctx = o.ctx;
			cloudy_canvas = o.canvas;
			break;
		case 10:
			place("shape151",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			clips.push({ctx:ctx,canvas:cloudy_canvas});
			var ccanvas = createCanvas(cloudy_canvas.width,cloudy_canvas.height);
			var cctx = ccanvas.getContext("2d");
			enhanceContext(cctx);
			cctx.applyTransforms(ctx._matrix);
			cloudy_canvas = ccanvas;
			ctx = cctx;
			place("shape152",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			clips[clips.length-1].clipCanvas = cloudy_canvas;
			cloudy_canvas = createCanvas(cloudy_canvas.width,cloudy_canvas.height);
			var nctx = cloudy_canvas.getContext("2d");
			enhanceContext(nctx);
			nctx.applyTransforms(ctx._matrix);
			ctx = nctx;
			place("shape153",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			place("sprite162",cloudy_canvas,ctx,[0.4979248046875,-0.0438995361328125,0.043914794921875,0.4979248046875,1510.0,1300.0],ctrans,1,(0+time)%1,0,time);
			var o = clips.pop();
			ctx.globalCompositeOperation = "destination-in";
			ctx.setTransform(1,0,0,1,0,0);
			ctx.drawImage(o.clipCanvas,0,0);
			var ms=o.ctx._matrix;
			o.ctx.setTransform(1,0,0,1,0,0);
			o.ctx.globalCompositeOperation = "source-over";
			o.ctx.drawImage(cloudy_canvas,0,0);
			o.ctx.applyTransforms(ms);
			ctx = o.ctx;
			cloudy_canvas = o.canvas;
			break;
		case 11:
			place("shape151",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			clips.push({ctx:ctx,canvas:cloudy_canvas});
			var ccanvas = createCanvas(cloudy_canvas.width,cloudy_canvas.height);
			var cctx = ccanvas.getContext("2d");
			enhanceContext(cctx);
			cctx.applyTransforms(ctx._matrix);
			cloudy_canvas = ccanvas;
			ctx = cctx;
			place("shape152",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			clips[clips.length-1].clipCanvas = cloudy_canvas;
			cloudy_canvas = createCanvas(cloudy_canvas.width,cloudy_canvas.height);
			var nctx = cloudy_canvas.getContext("2d");
			enhanceContext(nctx);
			nctx.applyTransforms(ctx._matrix);
			ctx = nctx;
			place("shape153",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			place("sprite162",cloudy_canvas,ctx,[0.4979248046875,-0.0438995361328125,0.043914794921875,0.4979248046875,1510.0,1300.0],ctrans,1,(0+time)%1,0,time);
			var o = clips.pop();
			ctx.globalCompositeOperation = "destination-in";
			ctx.setTransform(1,0,0,1,0,0);
			ctx.drawImage(o.clipCanvas,0,0);
			var ms=o.ctx._matrix;
			o.ctx.setTransform(1,0,0,1,0,0);
			o.ctx.globalCompositeOperation = "source-over";
			o.ctx.drawImage(cloudy_canvas,0,0);
			o.ctx.applyTransforms(ms);
			ctx = o.ctx;
			cloudy_canvas = o.canvas;
			break;
		case 12:
			place("shape151",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			clips.push({ctx:ctx,canvas:cloudy_canvas});
			var ccanvas = createCanvas(cloudy_canvas.width,cloudy_canvas.height);
			var cctx = ccanvas.getContext("2d");
			enhanceContext(cctx);
			cctx.applyTransforms(ctx._matrix);
			cloudy_canvas = ccanvas;
			ctx = cctx;
			place("shape152",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			clips[clips.length-1].clipCanvas = cloudy_canvas;
			cloudy_canvas = createCanvas(cloudy_canvas.width,cloudy_canvas.height);
			var nctx = cloudy_canvas.getContext("2d");
			enhanceContext(nctx);
			nctx.applyTransforms(ctx._matrix);
			ctx = nctx;
			place("shape153",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			place("sprite162",cloudy_canvas,ctx,[0.4979248046875,-0.0438995361328125,0.043914794921875,0.4979248046875,1510.0,1300.0],ctrans,1,(0+time)%1,0,time);
			var o = clips.pop();
			ctx.globalCompositeOperation = "destination-in";
			ctx.setTransform(1,0,0,1,0,0);
			ctx.drawImage(o.clipCanvas,0,0);
			var ms=o.ctx._matrix;
			o.ctx.setTransform(1,0,0,1,0,0);
			o.ctx.globalCompositeOperation = "source-over";
			o.ctx.drawImage(cloudy_canvas,0,0);
			o.ctx.applyTransforms(ms);
			ctx = o.ctx;
			cloudy_canvas = o.canvas;
			break;
		case 13:
			place("shape151",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			clips.push({ctx:ctx,canvas:cloudy_canvas});
			var ccanvas = createCanvas(cloudy_canvas.width,cloudy_canvas.height);
			var cctx = ccanvas.getContext("2d");
			enhanceContext(cctx);
			cctx.applyTransforms(ctx._matrix);
			cloudy_canvas = ccanvas;
			ctx = cctx;
			place("shape152",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			clips[clips.length-1].clipCanvas = cloudy_canvas;
			cloudy_canvas = createCanvas(cloudy_canvas.width,cloudy_canvas.height);
			var nctx = cloudy_canvas.getContext("2d");
			enhanceContext(nctx);
			nctx.applyTransforms(ctx._matrix);
			ctx = nctx;
			place("shape153",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			place("sprite162",cloudy_canvas,ctx,[0.4979248046875,-0.0438995361328125,0.043914794921875,0.4979248046875,1510.0,1300.0],ctrans,1,(0+time)%1,0,time);
			var o = clips.pop();
			ctx.globalCompositeOperation = "destination-in";
			ctx.setTransform(1,0,0,1,0,0);
			ctx.drawImage(o.clipCanvas,0,0);
			var ms=o.ctx._matrix;
			o.ctx.setTransform(1,0,0,1,0,0);
			o.ctx.globalCompositeOperation = "source-over";
			o.ctx.drawImage(cloudy_canvas,0,0);
			o.ctx.applyTransforms(ms);
			ctx = o.ctx;
			cloudy_canvas = o.canvas;
			break;
		case 14:
			place("shape151",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			clips.push({ctx:ctx,canvas:cloudy_canvas});
			var ccanvas = createCanvas(cloudy_canvas.width,cloudy_canvas.height);
			var cctx = ccanvas.getContext("2d");
			enhanceContext(cctx);
			cctx.applyTransforms(ctx._matrix);
			cloudy_canvas = ccanvas;
			ctx = cctx;
			place("shape152",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			clips[clips.length-1].clipCanvas = cloudy_canvas;
			cloudy_canvas = createCanvas(cloudy_canvas.width,cloudy_canvas.height);
			var nctx = cloudy_canvas.getContext("2d");
			enhanceContext(nctx);
			nctx.applyTransforms(ctx._matrix);
			ctx = nctx;
			place("shape153",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			place("sprite162",cloudy_canvas,ctx,[0.4979248046875,-0.0438995361328125,0.043914794921875,0.4979248046875,1510.0,1300.0],ctrans,1,(0+time)%1,0,time);
			var o = clips.pop();
			ctx.globalCompositeOperation = "destination-in";
			ctx.setTransform(1,0,0,1,0,0);
			ctx.drawImage(o.clipCanvas,0,0);
			var ms=o.ctx._matrix;
			o.ctx.setTransform(1,0,0,1,0,0);
			o.ctx.globalCompositeOperation = "source-over";
			o.ctx.drawImage(cloudy_canvas,0,0);
			o.ctx.applyTransforms(ms);
			ctx = o.ctx;
			cloudy_canvas = o.canvas;
			break;
		case 15:
			place("shape151",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			clips.push({ctx:ctx,canvas:cloudy_canvas});
			var ccanvas = createCanvas(cloudy_canvas.width,cloudy_canvas.height);
			var cctx = ccanvas.getContext("2d");
			enhanceContext(cctx);
			cctx.applyTransforms(ctx._matrix);
			cloudy_canvas = ccanvas;
			ctx = cctx;
			place("shape152",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			clips[clips.length-1].clipCanvas = cloudy_canvas;
			cloudy_canvas = createCanvas(cloudy_canvas.width,cloudy_canvas.height);
			var nctx = cloudy_canvas.getContext("2d");
			enhanceContext(nctx);
			nctx.applyTransforms(ctx._matrix);
			ctx = nctx;
			place("shape153",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			place("sprite162",cloudy_canvas,ctx,[0.4979248046875,-0.0438995361328125,0.043914794921875,0.4979248046875,1510.0,1300.0],ctrans,1,(0+time)%1,0,time);
			var o = clips.pop();
			ctx.globalCompositeOperation = "destination-in";
			ctx.setTransform(1,0,0,1,0,0);
			ctx.drawImage(o.clipCanvas,0,0);
			var ms=o.ctx._matrix;
			o.ctx.setTransform(1,0,0,1,0,0);
			o.ctx.globalCompositeOperation = "source-over";
			o.ctx.drawImage(cloudy_canvas,0,0);
			o.ctx.applyTransforms(ms);
			ctx = o.ctx;
			cloudy_canvas = o.canvas;
			break;
		case 16:
			place("shape151",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			clips.push({ctx:ctx,canvas:cloudy_canvas});
			var ccanvas = createCanvas(cloudy_canvas.width,cloudy_canvas.height);
			var cctx = ccanvas.getContext("2d");
			enhanceContext(cctx);
			cctx.applyTransforms(ctx._matrix);
			cloudy_canvas = ccanvas;
			ctx = cctx;
			place("shape152",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			clips[clips.length-1].clipCanvas = cloudy_canvas;
			cloudy_canvas = createCanvas(cloudy_canvas.width,cloudy_canvas.height);
			var nctx = cloudy_canvas.getContext("2d");
			enhanceContext(nctx);
			nctx.applyTransforms(ctx._matrix);
			ctx = nctx;
			place("shape153",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			place("sprite162",cloudy_canvas,ctx,[0.4979248046875,-0.0438995361328125,0.043914794921875,0.4979248046875,1510.0,1300.0],ctrans,1,(0+time)%1,0,time);
			var o = clips.pop();
			ctx.globalCompositeOperation = "destination-in";
			ctx.setTransform(1,0,0,1,0,0);
			ctx.drawImage(o.clipCanvas,0,0);
			var ms=o.ctx._matrix;
			o.ctx.setTransform(1,0,0,1,0,0);
			o.ctx.globalCompositeOperation = "source-over";
			o.ctx.drawImage(cloudy_canvas,0,0);
			o.ctx.applyTransforms(ms);
			ctx = o.ctx;
			cloudy_canvas = o.canvas;
			break;
		case 17:
			place("shape151",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			clips.push({ctx:ctx,canvas:cloudy_canvas});
			var ccanvas = createCanvas(cloudy_canvas.width,cloudy_canvas.height);
			var cctx = ccanvas.getContext("2d");
			enhanceContext(cctx);
			cctx.applyTransforms(ctx._matrix);
			cloudy_canvas = ccanvas;
			ctx = cctx;
			place("shape152",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			clips[clips.length-1].clipCanvas = cloudy_canvas;
			cloudy_canvas = createCanvas(cloudy_canvas.width,cloudy_canvas.height);
			var nctx = cloudy_canvas.getContext("2d");
			enhanceContext(nctx);
			nctx.applyTransforms(ctx._matrix);
			ctx = nctx;
			place("shape153",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			place("sprite162",cloudy_canvas,ctx,[0.4979248046875,-0.0438995361328125,0.043914794921875,0.4979248046875,1510.0,1300.0],ctrans,1,(0+time)%1,0,time);
			var o = clips.pop();
			ctx.globalCompositeOperation = "destination-in";
			ctx.setTransform(1,0,0,1,0,0);
			ctx.drawImage(o.clipCanvas,0,0);
			var ms=o.ctx._matrix;
			o.ctx.setTransform(1,0,0,1,0,0);
			o.ctx.globalCompositeOperation = "source-over";
			o.ctx.drawImage(cloudy_canvas,0,0);
			o.ctx.applyTransforms(ms);
			ctx = o.ctx;
			cloudy_canvas = o.canvas;
			break;
		case 18:
			place("shape151",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			clips.push({ctx:ctx,canvas:cloudy_canvas});
			var ccanvas = createCanvas(cloudy_canvas.width,cloudy_canvas.height);
			var cctx = ccanvas.getContext("2d");
			enhanceContext(cctx);
			cctx.applyTransforms(ctx._matrix);
			cloudy_canvas = ccanvas;
			ctx = cctx;
			place("shape152",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			clips[clips.length-1].clipCanvas = cloudy_canvas;
			cloudy_canvas = createCanvas(cloudy_canvas.width,cloudy_canvas.height);
			var nctx = cloudy_canvas.getContext("2d");
			enhanceContext(nctx);
			nctx.applyTransforms(ctx._matrix);
			ctx = nctx;
			place("shape153",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			place("sprite162",cloudy_canvas,ctx,[0.4979248046875,-0.0438995361328125,0.043914794921875,0.4979248046875,1510.0,1300.0],ctrans,1,(0+time)%1,0,time);
			var o = clips.pop();
			ctx.globalCompositeOperation = "destination-in";
			ctx.setTransform(1,0,0,1,0,0);
			ctx.drawImage(o.clipCanvas,0,0);
			var ms=o.ctx._matrix;
			o.ctx.setTransform(1,0,0,1,0,0);
			o.ctx.globalCompositeOperation = "source-over";
			o.ctx.drawImage(cloudy_canvas,0,0);
			o.ctx.applyTransforms(ms);
			ctx = o.ctx;
			cloudy_canvas = o.canvas;
			break;
		case 19:
			place("shape151",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			clips.push({ctx:ctx,canvas:cloudy_canvas});
			var ccanvas = createCanvas(cloudy_canvas.width,cloudy_canvas.height);
			var cctx = ccanvas.getContext("2d");
			enhanceContext(cctx);
			cctx.applyTransforms(ctx._matrix);
			cloudy_canvas = ccanvas;
			ctx = cctx;
			place("shape152",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			clips[clips.length-1].clipCanvas = cloudy_canvas;
			cloudy_canvas = createCanvas(cloudy_canvas.width,cloudy_canvas.height);
			var nctx = cloudy_canvas.getContext("2d");
			enhanceContext(nctx);
			nctx.applyTransforms(ctx._matrix);
			ctx = nctx;
			place("shape153",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			place("sprite162",cloudy_canvas,ctx,[0.4979248046875,-0.0438995361328125,0.043914794921875,0.4979248046875,1510.0,1300.0],ctrans,1,(0+time)%1,0,time);
			var o = clips.pop();
			ctx.globalCompositeOperation = "destination-in";
			ctx.setTransform(1,0,0,1,0,0);
			ctx.drawImage(o.clipCanvas,0,0);
			var ms=o.ctx._matrix;
			o.ctx.setTransform(1,0,0,1,0,0);
			o.ctx.globalCompositeOperation = "source-over";
			o.ctx.drawImage(cloudy_canvas,0,0);
			o.ctx.applyTransforms(ms);
			ctx = o.ctx;
			cloudy_canvas = o.canvas;
			break;
	}
}

function shape141(ctx,ctrans,frame,ratio,time){
	var pathData="M 6529 -5208 Q 6983 -5208 6983 -4721 L 6983 4764 Q 6983 5251 6529 5251 L -5885 5251 Q -6338 5251 -6338 4764 L -6338 -4721 Q -6338 -5208 -5885 -5208 L 6529 -5208";
	ctx.fillStyle=tocolor(ctrans.apply([102,102,102,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M -2800 -3753 Q -2800 -3886 -2840 -3999 -2756 -3959 -2685 -3888 -2517 -3720 -2517 -3486 -2517 -3252 -2685 -3089 -2849 -2921 -3082 -2921 -3316 -2921 -3484 -3089 L -3521 -3130 Q -3443 -3102 -3356 -3102 -3125 -3102 -2963 -3293 -2800 -3483 -2800 -3753";
	var grd=ctx.createLinearGradient(-3124.0,-3818.75,-3240.0,-2783.25);
	grd.addColorStop(0.0,tocolor(ctrans.apply([255,255,0,1])));
	grd.addColorStop(1.0,tocolor(ctrans.apply([255,255,0,0.0])));
	ctx.fillStyle = grd;
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M -2223 -3473 Q -2208 -3547 -2151 -3603 -2073 -3682 -1963 -3681 -1853 -3682 -1773 -3603 -1713 -3542 -1699 -3461 L -1656 -3465 Q -1547 -3465 -1469 -3387 -1393 -3311 -1392 -3205 L -1322 -3214 Q -1227 -3214 -1161 -3148 -1128 -3116 -1111 -3075 L -1091 -3076 Q -1027 -3077 -981 -3032 -937 -2986 -937 -2923 -937 -2859 -981 -2813 -1027 -2768 -1091 -2768 -1147 -2768 -1189 -2803 -1247 -2761 -1322 -2759 -1375 -2761 -1418 -2781 -1476 -2741 -1549 -2741 -1647 -2741 -1716 -2811 L -1719 -2813 Q -1772 -2771 -1842 -2771 -1925 -2771 -1982 -2830 -2003 -2849 -2016 -2872 L -2093 -2860 Q -2142 -2860 -2183 -2877 -2197 -2835 -2232 -2801 -2292 -2740 -2377 -2740 -2462 -2740 -2523 -2801 -2576 -2854 -2582 -2925 L -2589 -2925 -2628 -2929 -2648 -2903 Q -2694 -2858 -2759 -2858 -2823 -2858 -2869 -2903 -2915 -2949 -2915 -3014 -2915 -3079 -2869 -3123 -2840 -3152 -2804 -3163 -2797 -3238 -2742 -3292 -2679 -3356 -2589 -3356 L -2570 -3355 Q -2552 -3392 -2521 -3423 -2445 -3499 -2339 -3499 -2276 -3500 -2223 -3473";
	var grd=ctx.createLinearGradient(-1926.0,-3677.5,-1926.0,-2868.5);
	grd.addColorStop(0.0,tocolor(ctrans.apply([162,162,162,1])));
	grd.addColorStop(1.0,tocolor(ctrans.apply([111,111,111,0.6313726])));
	ctx.fillStyle = grd;
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
}

function shape142(ctx,ctrans,frame,ratio,time){
	var pathData="M 2289 -78 L 2674 -51 Q 2687 -48 2716 -31 2737 -18 2825 -9 3279 34 3279 362 3279 573 3068 678 2862 781 2427 807 L 2407 783 Q 2285 655 1985 664 1906 666 1617 586 1323 504 1220 504 1022 504 926 529 886 540 801 585 649 664 171 664 L -29 651 -232 628 Q -257 621 -1260 611 -2263 601 -2284 596 -2488 535 -2655 472 -2764 385 -2882 302 -3115 138 -3214 138 L -3243 138 Q -3146 -64 -2784 -64 -2488 -64 -2188 33 -2113 58 -1993 105 L -1872 147 Q -1849 170 -1849 124 L -1850 117 -1776 138 Q -1726 141 -1701 122 L -1483 -46 Q -1054 -14 -695 -82 L -933 -119 -988 -156 Q -1140 -135 -1263 -211 L -2344 -266 -2379 -278 Q -2369 -375 -2280 -463 -2154 -587 -2067 -605 -2010 -616 -1929 -579 -1835 -535 -1780 -533 -1678 -530 -1538 -618 -1507 -638 -1453 -638 L -1357 -634 Q -1231 -635 -1153 -751 L -1119 -813 Q -1103 -842 -1076 -856 -1011 -889 -750 -889 -524 -889 -453 -863 L -411 -846 -342 -838 Q -120 -838 -22 -878 42 -903 75 -964 110 -1031 145 -1051 214 -1090 386 -1090 939 -1090 1258 -779 1406 -634 1459 -481 1323 -413 1122 -475 1119 -476 1119 -485 L 936 -485 Q 797 -547 626 -512 L 624 -504 821 -387 826 -376 Q 1004 -390 1105 -307 1110 -302 1119 -302 L 1192 -192 1174 -27 997 97 881 101 991 101 997 97 1321 119 1797 101 Q 1839 52 1925 46 L 2017 -64 2289 -78 M -623 119 L -627 138 -713 138 -731 449 -658 394 -603 284 -586 280 Q -250 200 -35 376 L 20 266 35 261 111 211 533 192 528 178 Q 494 133 441 101 110 41 -145 138 L -292 83 -622 101 -623 119";
	ctx.fillStyle=tocolor(ctrans.apply([204,204,204,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 2427 807 L 2142 815 2114 815 2109 815 Q 1546 815 1475 788 L 1454 769 1362 761 Q 1181 843 948 925 482 1090 203 1090 -205 1090 -451 997 -506 976 -590 932 -647 903 -672 903 -711 903 -787 926 L -950 979 Q -1206 1054 -1474 1054 -1562 1054 -2107 958 -2667 861 -2811 815 -3103 723 -3211 563 -3278 463 -3278 313 L -3278 299 Q -3276 209 -3245 141 L -3243 138 -3214 138 Q -3115 138 -2882 302 -2764 385 -2655 472 -2488 535 -2284 596 -2263 601 -1260 611 -257 621 -232 628 L -29 651 171 664 Q 649 664 801 585 886 540 926 529 1022 504 1220 504 1323 504 1617 586 1906 666 1985 664 2285 655 2407 783 L 2427 807 M -1850 117 Q -1858 92 -1933 62 L -2115 -4 Q -2381 -108 -2381 -250 L -2379 -278 -2344 -266 -1263 -211 Q -1140 -135 -988 -156 L -933 -119 -695 -82 Q -1054 -14 -1483 -46 L -1701 122 Q -1726 141 -1776 138 L -1850 117 M 1459 -481 L 1467 -456 Q 1467 -389 1431 -316 1492 -296 1635 -196 1772 -100 1806 -92 L 2289 -78 2017 -64 1925 46 Q 1839 52 1797 101 L 1321 119 997 97 991 101 881 101 997 97 1174 -27 1192 -192 1119 -302 Q 1110 -302 1105 -307 1004 -390 826 -376 L 821 -387 624 -504 626 -512 Q 797 -547 936 -485 L 1119 -485 Q 1119 -476 1122 -475 1323 -413 1459 -481 M -623 119 L -622 101 -292 83 -145 138 Q 110 41 441 101 494 133 528 178 L 533 192 111 211 35 261 20 266 -35 376 Q -250 200 -586 280 L -603 284 -658 394 -731 449 -713 138 -627 138 -623 119";
	ctx.fillStyle=tocolor(ctrans.apply([153,153,153,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
}

function shape143(ctx,ctrans,frame,ratio,time){
	var pathData="M 1932 815 Q 2076 906 2290 823 L 2293 809 2487 809 Q 2635 727 2816 774 L 2818 785 Q 2725 848 2609 942 2604 944 2604 956 2415 937 2308 1049 2302 1055 2293 1055 L 2215 1202 2235 1423 2423 1589 Q 2235 1586 2079 1619 1851 1576 1573 1594 1528 1529 1437 1521 L 1339 1374 1051 1355 1563 1337 Q 1599 1325 1745 1197 1897 1063 1962 1036 1923 938 1923 849 L 1932 815 M 904 2540 L 925 2509 Q 1055 2337 1374 2349 1457 2351 1764 2244 2075 2134 2186 2134 2396 2134 2498 2167 2540 2182 2630 2242 2791 2349 3299 2349 L 3512 2332 3727 2300 Q 3753 2291 4819 2278 5884 2264 5906 2257 6122 2176 6300 2092 6416 1975 6541 1864 6788 1643 6894 1643 L 6924 1645 6926 1648 Q 6959 1739 6962 1860 L 6962 1879 Q 6961 2079 6890 2213 6775 2427 6466 2551 6313 2612 5718 2743 5139 2870 5045 2871 4761 2871 4490 2770 L 4317 2700 Q 4236 2668 4195 2668 4168 2668 4108 2707 4018 2766 3960 2794 3698 2919 3265 2920 2968 2919 2475 2699 2227 2588 2035 2478 1952 2478 1938 2489 L 1915 2515 Q 1839 2551 1242 2551 L 1236 2551 1208 2551 904 2540 M 5445 1617 L 5367 1643 Q 5313 1648 5287 1623 L 5055 1398 Q 4600 1441 4219 1349 L 4472 1300 4530 1251 Q 4691 1278 4822 1177 L 5970 1104 6007 1088 6009 1125 Q 6008 1315 5726 1453 L 5533 1543 Q 5454 1582 5445 1617 M 4141 1594 L 4143 1619 4147 1643 4238 1643 4258 2061 4180 1987 4122 1840 4103 1835 Q 3747 1727 3518 1963 L 3460 1815 3443 1809 3363 1742 Q 3112 1710 2915 1717 2915 1705 2920 1698 2956 1637 3012 1594 3363 1514 3635 1643 L 3791 1570 4141 1594";
	ctx.fillStyle=tocolor(ctrans.apply([204,204,204,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 2423 1589 L 2546 1594 2429 1594 2423 1589";
	ctx.fillStyle=tocolor(ctrans.apply([153,153,153,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 1932 815 Q 1988 610 2146 417 2484 -1 3071 0 3253 -1 3327 52 3364 79 3402 169 3436 250 3505 284 3609 337 3844 337 3892 337 3917 326 L 3962 304 Q 4037 269 4277 269 4554 269 4623 314 4651 332 4669 371 L 4705 454 Q 4788 609 4922 611 L 5024 604 Q 5080 604 5114 632 5262 749 5371 746 5429 743 5529 684 5614 634 5676 649 5768 673 5902 840 5995 957 6007 1088 L 5970 1104 4822 1177 Q 4691 1278 4530 1251 L 4472 1300 4219 1349 Q 4600 1441 5055 1398 L 5287 1623 Q 5313 1648 5367 1643 L 5445 1617 5444 1625 Q 5444 1687 5469 1656 5498 1648 5597 1599 5724 1537 5804 1504 6122 1373 6436 1374 6821 1373 6924 1645 L 6894 1643 Q 6788 1643 6541 1864 6416 1975 6300 2092 6122 2176 5906 2257 5884 2264 4819 2278 3753 2291 3727 2300 L 3512 2332 3299 2349 Q 2791 2349 2630 2242 2540 2182 2498 2167 2396 2134 2186 2134 2075 2134 1764 2244 1457 2351 1374 2349 1055 2337 925 2509 L 904 2540 Q 442 2505 224 2367 0 2226 0 1944 0 1505 482 1447 575 1435 597 1418 628 1394 642 1391 711 1371 1051 1355 L 1339 1374 1437 1521 Q 1528 1529 1573 1594 1851 1576 2079 1619 2235 1586 2423 1589 L 2235 1423 2215 1202 2293 1055 Q 2302 1055 2308 1049 2415 937 2604 956 2604 944 2609 942 2725 848 2818 785 L 2816 774 Q 2635 727 2487 809 L 2293 809 2290 823 Q 2076 906 1932 815 M 2423 1589 L 2429 1594 2546 1594 2423 1589 M 4141 1594 L 3791 1570 3635 1643 Q 3363 1514 3012 1594 2956 1637 2920 1698 2915 1705 2915 1717 3112 1710 3363 1742 L 3443 1809 3460 1815 3518 1963 Q 3747 1727 4103 1835 L 4122 1840 4180 1987 4258 2061 4238 1643 4147 1643 4143 1619 4141 1594";
	ctx.fillStyle=tocolor(ctrans.apply([255,255,255,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
}

function sprite144(ctx,ctrans,frame,ratio,time){
	var clips = [];
	var frame_cnt = 1;
	frame = frame % frame_cnt;
	switch(frame){
		case 0:
			place("shape143",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
	}
}

function sprite145(ctx,ctrans,frame,ratio,time){
	var clips = [];
	var frame_cnt = 115;
	frame = frame % frame_cnt;
	switch(frame){
		case 0:
			place("shape142",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,-3035.0,219.0],ctrans,1,0,0,time);
			place("sprite144",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,-8847.0,1007.0],ctrans,1,(0+time)%1,0,time);
			break;
		case 1:
			place("shape142",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,-2762.0,253.0],ctrans,1,0,0,time);
			place("sprite144",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,-8701.0,1007.0],ctrans,1,(0+time)%1,0,time);
			break;
		case 2:
			place("shape142",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,-2489.0,286.0],ctrans,1,0,0,time);
			place("sprite144",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,-8556.0,1008.0],ctrans,1,(0+time)%1,0,time);
			break;
		case 3:
			place("shape142",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,-2216.0,320.0],ctrans,1,0,0,time);
			place("sprite144",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,-8410.0,1008.0],ctrans,1,(0+time)%1,0,time);
			break;
		case 4:
			place("shape142",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,-1943.0,354.0],ctrans,1,0,0,time);
			place("sprite144",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,-8264.0,1008.0],ctrans,1,(0+time)%1,0,time);
			break;
		case 5:
			place("shape142",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,-1669.0,387.0],ctrans,1,0,0,time);
			place("sprite144",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,-8119.0,1008.0],ctrans,1,(0+time)%1,0,time);
			break;
		case 6:
			place("shape142",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,-1396.0,421.0],ctrans,1,0,0,time);
			place("sprite144",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,-7973.0,1009.0],ctrans,1,(0+time)%1,0,time);
			break;
		case 7:
			place("shape142",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,-1123.0,455.0],ctrans,1,0,0,time);
			place("sprite144",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,-7827.0,1009.0],ctrans,1,(0+time)%1,0,time);
			break;
		case 8:
			place("shape142",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,-850.0,488.0],ctrans,1,0,0,time);
			place("sprite144",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,-7681.0,1009.0],ctrans,1,(0+time)%1,0,time);
			break;
		case 9:
			place("shape142",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,-577.0,522.0],ctrans,1,0,0,time);
			place("sprite144",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,-7536.0,1009.0],ctrans,1,(0+time)%1,0,time);
			break;
		case 10:
			place("shape142",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,-304.0,556.0],ctrans,1,0,0,time);
			place("sprite144",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,-7390.0,1010.0],ctrans,1,(0+time)%1,0,time);
			break;
		case 11:
			place("shape142",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,-31.0,589.0],ctrans,1,0,0,time);
			place("sprite144",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,-7244.0,1010.0],ctrans,1,(0+time)%1,0,time);
			break;
		case 12:
			place("shape142",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,243.0,623.0],ctrans,1,0,0,time);
			place("sprite144",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,-7099.0,1010.0],ctrans,1,(0+time)%1,0,time);
			break;
		case 13:
			place("shape142",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,516.0,657.0],ctrans,1,0,0,time);
			place("sprite144",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,-6953.0,1010.0],ctrans,1,(0+time)%1,0,time);
			break;
		case 14:
			place("shape142",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,789.0,690.0],ctrans,1,0,0,time);
			place("sprite144",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,-6807.0,1011.0],ctrans,1,(0+time)%1,0,time);
			break;
		case 15:
			place("shape142",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,1062.0,724.0],ctrans,1,0,0,time);
			place("sprite144",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,-6662.0,1011.0],ctrans,1,(0+time)%1,0,time);
			break;
		case 16:
			place("shape142",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,1335.0,758.0],ctrans,1,0,0,time);
			place("sprite144",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,-6516.0,1011.0],ctrans,1,(0+time)%1,0,time);
			break;
		case 17:
			place("shape142",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,1608.0,791.0],ctrans,1,0,0,time);
			place("sprite144",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,-6370.0,1012.0],ctrans,1,(0+time)%1,0,time);
			break;
		case 18:
			place("shape142",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,1881.0,825.0],ctrans,1,0,0,time);
			place("sprite144",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,-6224.0,1012.0],ctrans,1,(0+time)%1,0,time);
			break;
		case 19:
			place("shape142",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,2155.0,859.0],ctrans,1,0,0,time);
			place("sprite144",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,-6079.0,1012.0],ctrans,1,(0+time)%1,0,time);
			break;
		case 20:
			place("shape142",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,2428.0,892.0],ctrans,1,0,0,time);
			place("sprite144",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,-5933.0,1012.0],ctrans,1,(0+time)%1,0,time);
			break;
		case 21:
			place("shape142",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,2701.0,926.0],ctrans,1,0,0,time);
			place("sprite144",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,-5788.0,1013.0],ctrans,1,(0+time)%1,0,time);
			break;
		case 22:
			place("shape142",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,2974.0,960.0],ctrans,1,0,0,time);
			place("sprite144",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,-5642.0,1013.0],ctrans,1,(0+time)%1,0,time);
			break;
		case 23:
			place("shape142",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,3247.0,993.0],ctrans,1,0,0,time);
			place("sprite144",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,-5496.0,1013.0],ctrans,1,(0+time)%1,0,time);
			break;
		case 24:
			place("shape142",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,3520.0,1027.0],ctrans,1,0,0,time);
			place("sprite144",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,-5350.0,1013.0],ctrans,1,(0+time)%1,0,time);
			break;
		case 25:
			place("shape142",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,3793.0,1061.0],ctrans,1,0,0,time);
			place("sprite144",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,-5205.0,1014.0],ctrans,1,(0+time)%1,0,time);
			break;
		case 26:
			place("shape142",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,4067.0,1094.0],ctrans,1,0,0,time);
			place("sprite144",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,-5059.0,1014.0],ctrans,1,(0+time)%1,0,time);
			break;
		case 27:
			place("shape142",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,4340.0,1128.0],ctrans,1,0,0,time);
			place("sprite144",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,-4913.0,1014.0],ctrans,1,(0+time)%1,0,time);
			break;
		case 28:
			place("shape142",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,4613.0,1162.0],ctrans,1,0,0,time);
			place("sprite144",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,-4767.0,1014.0],ctrans,1,(0+time)%1,0,time);
			break;
		case 29:
			place("shape142",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,4886.0,1195.0],ctrans,1,0,0,time);
			place("sprite144",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,-4622.0,1015.0],ctrans,1,(0+time)%1,0,time);
			break;
		case 30:
			place("shape142",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,5159.0,1229.0],ctrans,1,0,0,time);
			place("sprite144",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,-4476.0,1015.0],ctrans,1,(0+time)%1,0,time);
			break;
		case 31:
			place("shape142",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,5432.0,1263.0],ctrans,1,0,0,time);
			place("sprite144",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,-4331.0,1015.0],ctrans,1,(0+time)%1,0,time);
			break;
		case 32:
			place("shape142",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,5705.0,1296.0],ctrans,1,0,0,time);
			place("sprite144",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,-4185.0,1016.0],ctrans,1,(0+time)%1,0,time);
			break;
		case 33:
			place("shape142",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,5979.0,1330.0],ctrans,1,0,0,time);
			place("sprite144",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,-4039.0,1016.0],ctrans,1,(0+time)%1,0,time);
			break;
		case 34:
			place("shape142",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,6252.0,1364.0],ctrans,1,0,0,time);
			place("sprite144",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,-3893.0,1016.0],ctrans,1,(0+time)%1,0,time);
			break;
		case 35:
			place("shape142",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,6525.0,1397.0],ctrans,1,0,0,time);
			place("sprite144",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,-3748.0,1016.0],ctrans,1,(0+time)%1,0,time);
			break;
		case 36:
			place("shape142",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,6798.0,1431.0],ctrans,1,0,0,time);
			place("sprite144",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,-3602.0,1017.0],ctrans,1,(0+time)%1,0,time);
			break;
		case 37:
			place("shape142",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,7071.0,1465.0],ctrans,1,0,0,time);
			place("sprite144",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,-3456.0,1017.0],ctrans,1,(0+time)%1,0,time);
			break;
		case 38:
			place("shape142",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,7344.0,1498.0],ctrans,1,0,0,time);
			place("sprite144",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,-3311.0,1017.0],ctrans,1,(0+time)%1,0,time);
			break;
		case 39:
			place("shape142",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,7617.0,1532.0],ctrans,1,0,0,time);
			place("sprite144",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,-3165.0,1017.0],ctrans,1,(0+time)%1,0,time);
			break;
		case 40:
			place("shape142",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,7891.0,1566.0],ctrans,1,0,0,time);
			place("sprite144",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,-3019.0,1018.0],ctrans,1,(0+time)%1,0,time);
			break;
		case 41:
			place("shape142",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,8164.0,1599.0],ctrans,1,0,0,time);
			place("sprite144",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,-2874.0,1018.0],ctrans,1,(0+time)%1,0,time);
			break;
		case 42:
			place("shape142",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,8437.0,1633.0],ctrans,1,0,0,time);
			place("sprite144",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,-2728.0,1018.0],ctrans,1,(0+time)%1,0,time);
			break;
		case 43:
			place("shape142",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,8710.0,1667.0],ctrans,1,0,0,time);
			place("sprite144",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,-2582.0,1018.0],ctrans,1,(0+time)%1,0,time);
			break;
		case 44:
			place("shape142",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,8983.0,1700.0],ctrans,1,0,0,time);
			place("sprite144",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,-2436.0,1019.0],ctrans,1,(0+time)%1,0,time);
			break;
		case 45:
			place("shape142",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,9256.0,1734.0],ctrans,1,0,0,time);
			place("sprite144",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,-2291.0,1019.0],ctrans,1,(0+time)%1,0,time);
			break;
		case 46:
			place("shape142",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,9529.0,1768.0],ctrans,1,0,0,time);
			place("sprite144",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,-2145.0,1019.0],ctrans,1,(0+time)%1,0,time);
			break;
		case 47:
			place("shape142",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,9802.0,1801.0],ctrans,1,0,0,time);
			place("sprite144",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,-2000.0,1019.0],ctrans,1,(0+time)%1,0,time);
			break;
		case 48:
			place("shape142",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,10076.0,1835.0],ctrans,1,0,0,time);
			place("sprite144",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,-1854.0,1020.0],ctrans,1,(0+time)%1,0,time);
			break;
		case 49:
			place("shape142",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,10349.0,1869.0],ctrans,1,0,0,time);
			place("sprite144",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,-1708.0,1020.0],ctrans,1,(0+time)%1,0,time);
			break;
		case 50:
			place("shape142",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,10622.0,1902.0],ctrans,1,0,0,time);
			place("sprite144",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,-1562.0,1020.0],ctrans,1,(0+time)%1,0,time);
			break;
		case 51:
			place("shape142",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,10895.0,1936.0],ctrans,1,0,0,time);
			place("sprite144",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,-1417.0,1021.0],ctrans,1,(0+time)%1,0,time);
			break;
		case 52:
			place("shape142",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,10895.0,1936.0],ctrans,1,0,0,time);
			place("sprite144",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,-1271.0,1021.0],ctrans,1,(0+time)%1,0,time);
			break;
		case 53:
			place("shape142",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,10895.0,1936.0],ctrans,1,0,0,time);
			place("sprite144",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,-1125.0,1021.0],ctrans,1,(0+time)%1,0,time);
			break;
		case 54:
			place("shape142",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,10895.0,1936.0],ctrans,1,0,0,time);
			place("sprite144",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,-980.0,1021.0],ctrans,1,(0+time)%1,0,time);
			break;
		case 55:
			place("shape142",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,10895.0,1936.0],ctrans,1,0,0,time);
			place("sprite144",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,-834.0,1022.0],ctrans,1,(0+time)%1,0,time);
			break;
		case 56:
			place("shape142",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,10895.0,1936.0],ctrans,1,0,0,time);
			place("sprite144",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,-688.0,1022.0],ctrans,1,(0+time)%1,0,time);
			break;
		case 57:
			place("shape142",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,10895.0,1936.0],ctrans,1,0,0,time);
			place("sprite144",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,-542.0,1022.0],ctrans,1,(0+time)%1,0,time);
			break;
		case 58:
			place("shape142",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,10895.0,1936.0],ctrans,1,0,0,time);
			place("sprite144",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,-397.0,1022.0],ctrans,1,(0+time)%1,0,time);
			break;
		case 59:
			place("shape142",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,10895.0,1936.0],ctrans,1,0,0,time);
			place("sprite144",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,-251.0,1023.0],ctrans,1,(0+time)%1,0,time);
			break;
		case 60:
			place("shape142",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,10895.0,1936.0],ctrans,1,0,0,time);
			place("sprite144",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,-105.0,1023.0],ctrans,1,(0+time)%1,0,time);
			break;
		case 61:
			place("shape142",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,10895.0,1936.0],ctrans,1,0,0,time);
			place("sprite144",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,40.0,1023.0],ctrans,1,(0+time)%1,0,time);
			break;
		case 62:
			place("shape142",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,10895.0,1936.0],ctrans,1,0,0,time);
			place("sprite144",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,186.0,1023.0],ctrans,1,(0+time)%1,0,time);
			break;
		case 63:
			place("shape142",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,10895.0,1936.0],ctrans,1,0,0,time);
			place("sprite144",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,332.0,1024.0],ctrans,1,(0+time)%1,0,time);
			break;
		case 64:
			place("shape142",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,10895.0,1936.0],ctrans,1,0,0,time);
			place("sprite144",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,477.0,1024.0],ctrans,1,(0+time)%1,0,time);
			break;
		case 65:
			place("shape142",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,10895.0,1936.0],ctrans,1,0,0,time);
			place("sprite144",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,623.0,1024.0],ctrans,1,(0+time)%1,0,time);
			break;
		case 66:
			place("shape142",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,10895.0,1936.0],ctrans,1,0,0,time);
			place("sprite144",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,769.0,1024.0],ctrans,1,(0+time)%1,0,time);
			break;
		case 67:
			place("shape142",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,10895.0,1936.0],ctrans,1,0,0,time);
			place("sprite144",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,914.0,1025.0],ctrans,1,(0+time)%1,0,time);
			break;
		case 68:
			place("shape142",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,10895.0,1936.0],ctrans,1,0,0,time);
			place("sprite144",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,1060.0,1025.0],ctrans,1,(0+time)%1,0,time);
			break;
		case 69:
			place("shape142",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,10895.0,1936.0],ctrans,1,0,0,time);
			place("sprite144",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,1206.0,1025.0],ctrans,1,(0+time)%1,0,time);
			break;
		case 70:
			place("shape142",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,10895.0,1936.0],ctrans,1,0,0,time);
			place("sprite144",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,1351.0,1025.0],ctrans,1,(0+time)%1,0,time);
			break;
		case 71:
			place("shape142",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,10895.0,1936.0],ctrans,1,0,0,time);
			place("sprite144",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,1497.0,1026.0],ctrans,1,(0+time)%1,0,time);
			break;
		case 72:
			place("shape142",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,10895.0,1936.0],ctrans,1,0,0,time);
			place("sprite144",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,1643.0,1026.0],ctrans,1,(0+time)%1,0,time);
			break;
		case 73:
			place("shape142",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,10895.0,1936.0],ctrans,1,0,0,time);
			place("sprite144",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,1789.0,1026.0],ctrans,1,(0+time)%1,0,time);
			break;
		case 74:
			place("shape142",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,10895.0,1936.0],ctrans,1,0,0,time);
			place("sprite144",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,1934.0,1027.0],ctrans,1,(0+time)%1,0,time);
			break;
		case 75:
			place("shape142",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,10895.0,1936.0],ctrans,1,0,0,time);
			place("sprite144",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,2080.0,1027.0],ctrans,1,(0+time)%1,0,time);
			break;
		case 76:
			place("shape142",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,10895.0,1936.0],ctrans,1,0,0,time);
			place("sprite144",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,2226.0,1027.0],ctrans,1,(0+time)%1,0,time);
			break;
		case 77:
			place("shape142",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,10895.0,1936.0],ctrans,1,0,0,time);
			place("sprite144",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,2371.0,1027.0],ctrans,1,(0+time)%1,0,time);
			break;
		case 78:
			place("shape142",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,10895.0,1936.0],ctrans,1,0,0,time);
			place("sprite144",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,2517.0,1028.0],ctrans,1,(0+time)%1,0,time);
			break;
		case 79:
			place("shape142",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,10895.0,1936.0],ctrans,1,0,0,time);
			place("sprite144",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,2663.0,1028.0],ctrans,1,(0+time)%1,0,time);
			break;
		case 80:
			place("shape142",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,10895.0,1936.0],ctrans,1,0,0,time);
			place("sprite144",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,2808.0,1028.0],ctrans,1,(0+time)%1,0,time);
			break;
		case 81:
			place("shape142",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,10895.0,1936.0],ctrans,1,0,0,time);
			place("sprite144",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,2954.0,1028.0],ctrans,1,(0+time)%1,0,time);
			break;
		case 82:
			place("shape142",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,10895.0,1936.0],ctrans,1,0,0,time);
			place("sprite144",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,3100.0,1029.0],ctrans,1,(0+time)%1,0,time);
			break;
		case 83:
			place("shape142",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,10895.0,1936.0],ctrans,1,0,0,time);
			place("sprite144",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,3246.0,1029.0],ctrans,1,(0+time)%1,0,time);
			break;
		case 84:
			place("shape142",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,10895.0,1936.0],ctrans,1,0,0,time);
			place("sprite144",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,3391.0,1029.0],ctrans,1,(0+time)%1,0,time);
			break;
		case 85:
			place("shape142",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,10895.0,1936.0],ctrans,1,0,0,time);
			place("sprite144",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,3537.0,1029.0],ctrans,1,(0+time)%1,0,time);
			break;
		case 86:
			place("shape142",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,10895.0,1936.0],ctrans,1,0,0,time);
			place("sprite144",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,3682.0,1030.0],ctrans,1,(0+time)%1,0,time);
			break;
		case 87:
			place("shape142",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,10895.0,1936.0],ctrans,1,0,0,time);
			place("sprite144",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,3828.0,1030.0],ctrans,1,(0+time)%1,0,time);
			break;
		case 88:
			place("shape142",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,10895.0,1936.0],ctrans,1,0,0,time);
			place("sprite144",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,3974.0,1030.0],ctrans,1,(0+time)%1,0,time);
			break;
		case 89:
			place("shape142",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,10895.0,1936.0],ctrans,1,0,0,time);
			place("sprite144",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,4120.0,1030.0],ctrans,1,(0+time)%1,0,time);
			break;
		case 90:
			place("shape142",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,10895.0,1936.0],ctrans,1,0,0,time);
			place("sprite144",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,4265.0,1031.0],ctrans,1,(0+time)%1,0,time);
			break;
		case 91:
			place("shape142",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,10895.0,1936.0],ctrans,1,0,0,time);
			place("sprite144",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,4411.0,1031.0],ctrans,1,(0+time)%1,0,time);
			break;
		case 92:
			place("shape142",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,10895.0,1936.0],ctrans,1,0,0,time);
			place("sprite144",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,4557.0,1031.0],ctrans,1,(0+time)%1,0,time);
			break;
		case 93:
			place("shape142",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,10895.0,1936.0],ctrans,1,0,0,time);
			place("sprite144",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,4703.0,1032.0],ctrans,1,(0+time)%1,0,time);
			break;
		case 94:
			place("shape142",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,10895.0,1936.0],ctrans,1,0,0,time);
			place("sprite144",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,4848.0,1032.0],ctrans,1,(0+time)%1,0,time);
			break;
		case 95:
			place("shape142",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,10895.0,1936.0],ctrans,1,0,0,time);
			place("sprite144",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,4994.0,1032.0],ctrans,1,(0+time)%1,0,time);
			break;
		case 96:
			place("shape142",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,10895.0,1936.0],ctrans,1,0,0,time);
			place("sprite144",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,5139.0,1032.0],ctrans,1,(0+time)%1,0,time);
			break;
		case 97:
			place("shape142",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,10895.0,1936.0],ctrans,1,0,0,time);
			place("sprite144",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,5285.0,1033.0],ctrans,1,(0+time)%1,0,time);
			break;
		case 98:
			place("shape142",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,10895.0,1936.0],ctrans,1,0,0,time);
			place("sprite144",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,5431.0,1033.0],ctrans,1,(0+time)%1,0,time);
			break;
		case 99:
			place("shape142",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,10895.0,1936.0],ctrans,1,0,0,time);
			place("sprite144",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,5577.0,1033.0],ctrans,1,(0+time)%1,0,time);
			break;
		case 100:
			place("shape142",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,10895.0,1936.0],ctrans,1,0,0,time);
			place("sprite144",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,5722.0,1033.0],ctrans,1,(0+time)%1,0,time);
			break;
		case 101:
			place("shape142",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,10895.0,1936.0],ctrans,1,0,0,time);
			place("sprite144",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,5868.0,1034.0],ctrans,1,(0+time)%1,0,time);
			break;
		case 102:
			place("shape142",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,10895.0,1936.0],ctrans,1,0,0,time);
			place("sprite144",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,6014.0,1034.0],ctrans,1,(0+time)%1,0,time);
			break;
		case 103:
			place("shape142",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,10895.0,1936.0],ctrans,1,0,0,time);
			place("sprite144",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,6159.0,1034.0],ctrans,1,(0+time)%1,0,time);
			break;
		case 104:
			place("shape142",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,10895.0,1936.0],ctrans,1,0,0,time);
			place("sprite144",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,6305.0,1034.0],ctrans,1,(0+time)%1,0,time);
			break;
		case 105:
			place("shape142",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,10895.0,1936.0],ctrans,1,0,0,time);
			place("sprite144",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,6451.0,1035.0],ctrans,1,(0+time)%1,0,time);
			break;
		case 106:
			place("shape142",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,10895.0,1936.0],ctrans,1,0,0,time);
			place("sprite144",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,6596.0,1035.0],ctrans,1,(0+time)%1,0,time);
			break;
		case 107:
			place("shape142",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,10895.0,1936.0],ctrans,1,0,0,time);
			place("sprite144",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,6742.0,1035.0],ctrans,1,(0+time)%1,0,time);
			break;
		case 108:
			place("shape142",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,10895.0,1936.0],ctrans,1,0,0,time);
			place("sprite144",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,6888.0,1035.0],ctrans,1,(0+time)%1,0,time);
			break;
		case 109:
			place("shape142",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,10895.0,1936.0],ctrans,1,0,0,time);
			place("sprite144",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,7034.0,1036.0],ctrans,1,(0+time)%1,0,time);
			break;
		case 110:
			place("shape142",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,10895.0,1936.0],ctrans,1,0,0,time);
			place("sprite144",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,7179.0,1036.0],ctrans,1,(0+time)%1,0,time);
			break;
		case 111:
			place("shape142",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,10895.0,1936.0],ctrans,1,0,0,time);
			place("sprite144",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,7325.0,1036.0],ctrans,1,(0+time)%1,0,time);
			break;
		case 112:
			place("shape142",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,10895.0,1936.0],ctrans,1,0,0,time);
			place("sprite144",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,7471.0,1036.0],ctrans,1,(0+time)%1,0,time);
			break;
		case 113:
			place("shape142",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,10895.0,1936.0],ctrans,1,0,0,time);
			place("sprite144",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,7616.0,1037.0],ctrans,1,(0+time)%1,0,time);
			break;
		case 114:
			place("shape142",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,10895.0,1936.0],ctrans,1,0,0,time);
			place("sprite144",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,7762.0,1037.0],ctrans,1,(0+time)%1,0,time);
			break;
	}
}

function shape146(ctx,ctrans,frame,ratio,time){
	var pathData="M 8274 877 Q 8182 847 8098 791 7862 637 7674 441 7554 317 7448 261 7448 443 7486 617 7414 519 7330 451 7252 387 7206 423 L 7196 435 Q 7044 617 6864 743 L 6856 699 Q 6818 447 6856 187 6606 511 6332 653 L 6330 651 Q 6350 565 6400 489 6490 343 6570 239 6786 103 7018 37 7468 -93 7896 231 8080 371 8288 491 8570 653 8870 859 L 8342 643 8138 551 Q 8044 505 7968 463 8132 643 8260 855 L 8274 877 M 2448 1313 Q 2592 1261 2734 1201 3150 1021 3542 865 4002 681 4440 867 4908 1065 5404 945 5798 847 6146 571 L 6252 481 6334 409 Q 6218 555 6088 669 5768 951 5350 1043 5174 1081 4984 1083 4826 1085 4680 1057 4482 1017 4348 955 L 4326 945 Q 4370 1039 4336 1137 L 4302 1109 4056 901 Q 3904 1025 3760 1089 3852 883 3730 891 L 3694 897 Q 3476 947 3262 1031 L 2830 1193 2452 1325 2448 1313";
	ctx.fillStyle=tocolor(ctrans.apply([103,111,158,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 7206 423 Q 7252 387 7330 451 7414 519 7486 617 7448 443 7448 261 7554 317 7674 441 7862 637 8098 791 8182 847 8274 877 L 8278 873 Q 8356 951 8440 1021 8566 1121 8670 1237 8718 1289 8730 1339 8562 1347 8408 1261 8230 1161 8052 1037 7912 941 7764 875 7664 829 7588 819 7616 875 7656 929 7742 1043 7740 1189 7616 1129 7496 987 7422 901 7374 805 7278 617 7206 423 M 8138 551 L 8342 643 8870 859 9124 1039 Q 9536 1339 9954 1619 L 9950 1625 9906 1605 Q 9684 1495 9458 1397 L 9128 1245 Q 8918 1145 8732 1007 L 8332 713 Q 8222 629 8138 551 M 6332 653 Q 6606 511 6856 187 6818 447 6856 699 L 6728 877 Q 6626 1025 6534 1137 6524 929 6572 705 6530 735 6482 781 6268 983 6026 1087 6048 981 6126 905 6238 795 6332 655 L 6332 653 M 6088 669 Q 5990 833 5874 985 5728 1169 5510 1253 5286 1339 5034 1319 4780 1299 4570 1177 4432 1095 4348 955 4482 1017 4680 1057 4826 1085 4984 1083 5174 1081 5350 1043 5768 951 6088 669 M 4302 1109 Q 4384 1283 4464 1413 4252 1329 4118 1165 4044 1077 3972 1155 3836 1301 3650 1391 3638 1277 3586 1237 3390 1373 3168 1379 3294 1305 3412 1193 L 3730 891 Q 3852 883 3760 1089 3904 1025 4056 901 L 4302 1109";
	ctx.fillStyle=tocolor(ctrans.apply([73,80,114,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 8260 855 Q 8132 643 7968 463 8044 505 8138 551 8222 629 8332 713 L 8732 1007 Q 8918 1145 9128 1245 L 9458 1397 Q 9684 1495 9906 1605 L 9950 1625 9994 1647 Q 10308 1861 11084 3127 10040 2743 9668 2899 9296 3053 8788 2897 8278 2739 7636 2807 6992 2875 6508 2809 6022 2743 5672 3005 5322 3265 4778 2637 4234 2005 3638 2445 3042 2883 2708 2799 2372 2713 1892 2749 1412 2785 858 2949 610 2695 1288 2235 1968 1771 2154 1405 2268 1383 2378 1349 L 2452 1325 2830 1193 3262 1031 Q 3476 947 3694 897 L 3730 891 3412 1193 Q 3294 1305 3168 1379 3390 1373 3586 1237 3638 1277 3650 1391 3836 1301 3972 1155 4044 1077 4118 1165 4252 1329 4464 1413 4384 1283 4302 1109 L 4336 1137 Q 4370 1039 4326 945 L 4348 955 Q 4432 1095 4570 1177 4780 1299 5034 1319 5286 1339 5510 1253 5728 1169 5874 985 5990 833 6088 669 6218 555 6334 409 6450 313 6570 239 6490 343 6400 489 6350 565 6330 651 L 6330 653 6332 655 Q 6238 795 6126 905 6048 981 6026 1087 6268 983 6482 781 6530 735 6572 705 6524 929 6534 1137 6626 1025 6728 877 L 6856 699 6864 743 Q 7044 617 7196 435 L 7206 423 Q 7278 617 7374 805 7422 901 7496 987 7616 1129 7740 1189 7742 1043 7656 929 7616 875 7588 819 7664 829 7764 875 7912 941 8052 1037 8230 1161 8408 1261 8562 1347 8730 1339 8718 1289 8670 1237 8566 1121 8440 1021 8356 951 8278 873 L 8260 855";
	ctx.fillStyle=tocolor(ctrans.apply([47,52,74,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 8274 877 L 8260 855 8278 873 8274 877 M 6330 651 L 6332 653 6332 655 6330 653 6330 651 M 9950 1625 L 9954 1619 9994 1647 9950 1625 M 2452 1325 L 2378 1349 Q 2268 1383 2154 1405 2302 1363 2448 1313 L 2452 1325";
	var grd=ctx.createLinearGradient(5686.0,1765.0,5686.0,425.0);
	grd.addColorStop(0.0,tocolor(ctrans.apply([75,75,114,1])));
	grd.addColorStop(1.0,tocolor(ctrans.apply([126,126,169,1])));
	ctx.fillStyle = grd;
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
}

function shape147(ctx,ctrans,frame,ratio,time){
	var pathData="M 374 1046 L 95 1009 -290 1059 -212 937 -151 309 154 297 217 595 36 453 -56 942 57 843 374 1046";
	ctx.fillStyle=tocolor(ctrans.apply([95,52,14,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 374 1046 L 57 843 -56 942 36 453 217 595 289 946 Q 370 1000 449 1057 L 374 1046";
	ctx.fillStyle=tocolor(ctrans.apply([133,73,20,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M -54 -317 L -49 -320 -51 -311 -54 -317";
	ctx.fillStyle=tocolor(ctrans.apply([67,96,6,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M -91 -996 L -57 -1060 354 -388 170 -488 470 26 250 -66 489 295 167 25 276 266 -24 43 -218 159 -72 -254 185 -121 -51 -311 -49 -320 -54 -317 -221 -235 -91 -628 89 -554 -72 -684 -205 -613 -91 -996";
	ctx.fillStyle=tocolor(ctrans.apply([32,142,37,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M -91 -996 L -205 -613 -72 -684 89 -554 -91 -628 -221 -235 -54 -317 -51 -311 185 -121 -72 -254 -218 159 -24 43 276 266 167 25 489 295 612 482 -27 353 -612 530 -280 -80 -463 -16 -226 -499 -379 -444 -91 -996";
	ctx.fillStyle=tocolor(ctrans.apply([38,83,9,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 278 -449 L -71 -707 -54 -1010 278 -449";
	var grd=ctx.createLinearGradient(2.25,-669.5,163.75,-742.5);
	grd.addColorStop(0.0,tocolor(ctrans.apply([255,255,255,0.0])));
	grd.addColorStop(1.0,tocolor(ctrans.apply([255,255,255,0.7019608])));
	ctx.fillStyle = grd;
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M -37 -216 L -41 -220 -37 -217 -37 -216";
	var grd=ctx.createLinearGradient(133.25,-1.0,244.75,-61.0);
	grd.addColorStop(0.0,tocolor(ctrans.apply([255,255,255,0.0])));
	grd.addColorStop(1.0,tocolor(ctrans.apply([255,255,255,0.7019608])));
	ctx.fillStyle = grd;
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 164 -449 L 367 -84 Q 164 -210 -38 -339 L -80 -610 164 -449";
	var grd=ctx.createLinearGradient(127.5,-228.25,314.5,-311.75);
	grd.addColorStop(0.0,tocolor(ctrans.apply([255,255,255,0.0])));
	grd.addColorStop(1.0,tocolor(ctrans.apply([255,255,255,0.7019608])));
	ctx.fillStyle = grd;
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 182 604 L 256 941 105 841 52 515 182 604";
	var grd=ctx.createLinearGradient(77.0,728.75,197.0,707.25);
	grd.addColorStop(0.0,tocolor(ctrans.apply([255,255,255,0.0])));
	grd.addColorStop(1.0,tocolor(ctrans.apply([255,255,255,0.7019608])));
	ctx.fillStyle = grd;
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M -37 -217 L -37 -216 -37 -217";
	ctx.fillStyle=tocolor(ctrans.apply([204,204,204,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M -37 -217 L 199 -74 371 177 156 -12 152 -17 208 212 2 24 -37 -216 -37 -217";
	var grd=ctx.createLinearGradient(40.75,42.25,205.25,-50.25);
	grd.addColorStop(0.0,tocolor(ctrans.apply([255,255,255,0.0])));
	grd.addColorStop(1.0,tocolor(ctrans.apply([255,255,255,0.7019608])));
	ctx.fillStyle = grd;
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
}

function shape148(ctx,ctrans,frame,ratio,time){
	var pathData="M 160 441 Q 93 387 26 336 L -42 698 41 624 277 775 70 748 -216 785 -157 694 -112 229 113 220 160 441";
	ctx.fillStyle=tocolor(ctrans.apply([95,52,14,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 277 775 L 41 624 -42 698 26 336 Q 93 387 160 441 L 213 701 332 783 277 775";
	ctx.fillStyle=tocolor(ctrans.apply([133,73,20,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 362 219 L 123 19 204 197 -18 32 -162 118 -54 -188 136 -90 -39 -231 -37 -237 -164 -174 -68 -465 65 -411 -54 -507 -152 -454 -68 -738 -43 -785 261 -287 125 -361 347 19 184 -49 362 219";
	ctx.fillStyle=tocolor(ctrans.apply([111,158,10,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M -68 -738 L -152 -454 -54 -507 65 -411 -68 -465 -164 -174 -37 -237 -39 -231 136 -90 -54 -188 -162 118 -18 32 204 197 123 19 362 219 453 357 -21 261 -454 392 -208 -59 -344 -12 -168 -370 -282 -329 -68 -738";
	ctx.fillStyle=tocolor(ctrans.apply([67,96,6,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 205 -333 L -53 -524 -41 -748 205 -333";
	var grd=ctx.createLinearGradient(1.25,-496.0,120.75,-550.0);
	grd.addColorStop(0.0,tocolor(ctrans.apply([255,255,255,0.0])));
	grd.addColorStop(1.0,tocolor(ctrans.apply([255,255,255,0.7019608])));
	ctx.fillStyle = grd;
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M -28 -161 L -28 -160 -31 -163 -28 -161";
	var grd=ctx.createLinearGradient(97.75,-0.75,180.25,-45.25);
	grd.addColorStop(0.0,tocolor(ctrans.apply([255,255,255,0.0])));
	grd.addColorStop(1.0,tocolor(ctrans.apply([255,255,255,0.7019608])));
	ctx.fillStyle = grd;
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M -60 -452 L 121 -333 271 -62 -29 -251 -60 -452";
	var grd=ctx.createLinearGradient(93.75,-169.0,232.25,-231.0);
	grd.addColorStop(0.0,tocolor(ctrans.apply([255,255,255,0.0])));
	grd.addColorStop(1.0,tocolor(ctrans.apply([255,255,255,0.7019608])));
	ctx.fillStyle = grd;
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 134 447 L 189 697 77 623 38 381 134 447";
	var grd=ctx.createLinearGradient(56.5,540.0,145.5,524.0);
	grd.addColorStop(0.0,tocolor(ctrans.apply([255,255,255,0.0])));
	grd.addColorStop(1.0,tocolor(ctrans.apply([255,255,255,0.7019608])));
	ctx.fillStyle = grd;
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M -28 -160 L -28 -161 -28 -160";
	ctx.fillStyle=tocolor(ctrans.apply([204,204,204,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M -28 -160 L -28 -161 147 -55 274 131 115 -9 112 -13 153 157 1 18 -28 -160";
	var grd=ctx.createLinearGradient(29.0,31.25,151.0,-37.25);
	grd.addColorStop(0.0,tocolor(ctrans.apply([255,255,255,0.0])));
	grd.addColorStop(1.0,tocolor(ctrans.apply([255,255,255,0.7019608])));
	ctx.fillStyle = grd;
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
}

function shape149(ctx,ctrans,frame,ratio,time){
	var pathData="M 10430 3105 Q 10391 3257 10211 3220 9892 3153 9570 3105 9434 3084 9360 3188 9142 3501 8721 3484 L 8013 3448 Q 7684 3425 7362 3369 7044 3314 6722 3287 6343 3252 6044 3471 5793 3655 5499 3724 5156 3804 4841 3622 4526 3441 4156 3507 3783 3574 3620 3245 3560 3123 3468 3084 3125 2939 2764 3100 2481 3229 2178 3305 1814 3395 1936 3093 2001 2930 2083 2776 3650 2406 5749 2447 8114 2493 9765 2921 10140 3018 10430 3105";
	ctx.fillStyle=tocolor(ctrans.apply([102,204,102,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 2083 2776 Q 2001 2930 1936 3093 1814 3395 2178 3305 2481 3229 2764 3100 3125 2939 3468 3084 3560 3123 3620 3245 3783 3574 4156 3507 4526 3441 4841 3622 5156 3804 5499 3724 5793 3655 6044 3471 6343 3252 6722 3287 7044 3314 7362 3369 7684 3425 8013 3448 L 8721 3484 Q 9142 3501 9360 3188 9434 3084 9570 3105 9892 3153 10211 3220 10391 3257 10430 3105 11419 3399 11426 3574 6067 4508 0 3574 9 3349 1697 2875 1886 2822 2083 2776";
	ctx.fillStyle=tocolor(ctrans.apply([51,153,51,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
}

function shape150(ctx,ctrans,frame,ratio,time){
	var pathData="M 3888 -918 Q 3888 -851 3853 -807 3817 -757 3763 -757 L 3070 -757 Q 3017 -757 2981 -801 2945 -846 2945 -918 L 2945 -1554 Q 2945 -1620 2981 -1665 3017 -1709 3070 -1709 L 3763 -1709 Q 3817 -1709 3853 -1665 3888 -1620 3888 -1554 L 3888 -918";
	ctx.fillStyle=tocolor(ctrans.apply([219,151,16,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 879 -2739 L 13738 -2739 13738 5259 879 5259 879 -2739";
	ctx.fillStyle=tocolor(ctrans.apply([204,153,0,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 13462 -3818 Q 13606 -3818 13702 -3734 13798 -3656 13798 -3536 L 14050 5278 Q 14044 5398 13948 5476 13852 5554 13708 5560 L 9166 5560 9622 1222 9640 1090 9646 1030 9640 1030 9646 994 Q 9640 478 9328 70 9016 -344 8494 -590 7972 -830 7324 -836 6676 -830 6154 -590 5632 -344 5320 70 5008 484 5002 994 L 5008 1030 4996 1030 5476 5560 376 5560 Q 232 5554 136 5476 40 5398 34 5278 L 838 -3536 Q 844 -3656 940 -3734 1036 -3812 1180 -3818 L 13462 -3818";
	ctx.fillStyle=tocolor(ctrans.apply([222,184,87,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 13798 -1542 Q 13798 -1476 13750 -1434 13702 -1392 13630 -1392 L 634 -1392 Q 562 -1392 514 -1434 466 -1476 466 -1542 L 466 -2784 Q 466 -2850 514 -2892 562 -2934 634 -2934 L 13630 -2934 Q 13702 -2934 13750 -2892 13798 -2850 13798 -2784 L 13798 -1542";
	ctx.fillStyle=tocolor(ctrans.apply([235,207,141,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 13798 -1646 Q 13798 -1580 13750 -1538 13702 -1496 13630 -1496 L 634 -1496 Q 562 -1496 514 -1538 466 -1580 466 -1646 L 466 -2888 Q 466 -2954 514 -2996 562 -3038 634 -3038 L 13630 -3038 Q 13702 -3038 13750 -2996 13798 -2954 13798 -2888 L 13798 -1646";
	ctx.fillStyle=tocolor(ctrans.apply([247,225,170,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 10924 -2498 L 12676 -2786 13768 -2978 Q 13798 -2942 13798 -2894 L 13798 -1646 Q 13798 -1586 13750 -1544 13702 -1502 13630 -1496 L 634 -1496 Q 562 -1502 514 -1544 466 -1586 466 -1646 L 466 -1712 610 -1760 Q 1192 -1628 2098 -1616 3004 -1604 4108 -1676 5218 -1754 6406 -1886 7600 -2018 8758 -2180 9916 -2342 10924 -2498";
	ctx.fillStyle=tocolor(ctrans.apply([242,219,160,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 13630 -3038 Q 13756 -3032 13792 -2924 L 13774 -2924 784 -2924 Q 712 -2924 664 -2882 616 -2840 616 -2774 L 616 -1532 Q 616 -1514 622 -1496 556 -1502 508 -1544 466 -1586 466 -1646 L 466 -2888 Q 466 -2954 514 -2996 562 -3038 634 -3038 L 13630 -3038";
	ctx.fillStyle=tocolor(ctrans.apply([247,239,227,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 13748 -1554 L 13346 -1554 13346 -2910 13748 -2910 13748 -1554";
	ctx.fillStyle=tocolor(ctrans.apply([235,207,141,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 13930 190 Q 13930 256 13882 298 13834 340 13756 340 L 508 340 Q 436 340 382 298 334 256 334 190 L 334 -1052 Q 334 -1118 382 -1160 436 -1202 508 -1202 L 13756 -1202 Q 13834 -1202 13882 -1160 13930 -1118 13930 -1052 L 13930 190";
	ctx.fillStyle=tocolor(ctrans.apply([235,207,141,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 13930 90 Q 13930 156 13882 198 13834 240 13756 240 L 508 240 Q 436 240 382 198 334 156 334 90 L 334 -1152 Q 334 -1218 382 -1260 436 -1302 508 -1302 L 13756 -1302 Q 13834 -1302 13882 -1260 13930 -1218 13930 -1152 L 13930 90";
	ctx.fillStyle=tocolor(ctrans.apply([247,225,170,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 11002 -762 L 12784 -1050 13900 -1242 Q 13930 -1206 13930 -1158 L 13930 90 Q 13930 150 13882 192 13834 234 13756 240 L 508 240 Q 436 234 382 192 334 150 334 90 L 334 24 478 -24 Q 1078 108 2002 120 2920 132 4048 60 5182 -18 6394 -150 7612 -282 8794 -444 9976 -606 11002 -762";
	ctx.fillStyle=tocolor(ctrans.apply([242,219,160,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 13756 -1302 Q 13888 -1296 13924 -1188 L 13912 -1188 658 -1188 Q 586 -1188 538 -1146 484 -1104 484 -1038 L 484 204 Q 484 222 490 240 424 234 382 192 334 150 334 90 L 334 -1152 Q 334 -1218 382 -1260 436 -1302 508 -1302 L 13756 -1302";
	ctx.fillStyle=tocolor(ctrans.apply([247,239,227,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 13882 178 L 13474 178 13474 -1178 13882 -1178 13882 178";
	ctx.fillStyle=tocolor(ctrans.apply([235,207,141,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 14066 1926 Q 14060 1992 14012 2034 13964 2076 13886 2076 L 368 2076 Q 296 2076 248 2034 194 1992 194 1926 L 194 684 Q 194 618 248 576 296 534 368 534 L 13886 534 Q 13964 534 14012 576 14060 618 14066 684 L 14066 1926";
	ctx.fillStyle=tocolor(ctrans.apply([235,207,141,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 14066 1822 Q 14060 1888 14012 1930 13964 1972 13886 1972 L 368 1972 Q 296 1972 248 1930 194 1888 194 1822 L 194 580 Q 194 514 248 472 296 430 368 430 L 13886 430 Q 13964 430 14012 472 14060 514 14066 580 L 14066 1822";
	ctx.fillStyle=tocolor(ctrans.apply([247,225,170,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 11078 978 L 12896 690 14030 498 Q 14060 534 14066 582 L 14066 1830 Q 14060 1890 14012 1932 13964 1974 13886 1980 L 368 1980 Q 296 1974 248 1932 194 1890 194 1830 L 194 1764 344 1716 Q 950 1848 1892 1860 2834 1872 3986 1800 5138 1722 6374 1590 7616 1458 8822 1296 L 11078 978";
	ctx.fillStyle=tocolor(ctrans.apply([242,219,160,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 13886 430 Q 14018 436 14060 544 L 14042 544 524 544 Q 452 544 398 586 350 628 350 694 L 350 1936 Q 350 1954 356 1972 284 1966 242 1924 194 1882 194 1822 L 194 580 Q 194 514 248 472 296 430 368 430 L 13886 430";
	ctx.fillStyle=tocolor(ctrans.apply([247,239,227,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 14018 1914 L 13598 1914 13598 558 14018 558 14018 1914";
	ctx.fillStyle=tocolor(ctrans.apply([235,207,141,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 14206 3666 Q 14206 3732 14152 3774 14104 3816 14026 3816 L 238 3816 Q 160 3816 112 3774 58 3732 58 3666 L 58 2424 Q 58 2358 112 2316 160 2274 238 2274 L 14026 2274 Q 14104 2274 14152 2316 14206 2358 14206 2424 L 14206 3666";
	ctx.fillStyle=tocolor(ctrans.apply([235,207,141,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 14152 2208 Q 14206 2250 14206 2316 L 14206 3558 Q 14206 3624 14152 3666 14104 3708 14026 3708 L 238 3708 Q 160 3708 112 3666 58 3624 58 3558 L 58 2316 Q 58 2250 112 2208 160 2166 238 2166 L 14026 2166 Q 14104 2166 14152 2208";
	ctx.fillStyle=tocolor(ctrans.apply([247,225,170,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 11158 2710 L 13012 2422 14176 2230 Q 14206 2266 14206 2314 L 14206 3562 Q 14206 3622 14152 3664 14104 3706 14026 3712 L 238 3712 Q 160 3706 112 3664 58 3622 58 3562 L 58 3496 208 3448 Q 832 3580 1792 3592 2752 3604 3928 3532 5098 3454 6364 3322 7630 3190 8860 3028 10090 2866 11158 2710";
	ctx.fillStyle=tocolor(ctrans.apply([242,219,160,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 14026 2166 Q 14158 2172 14200 2280 L 14182 2280 394 2280 Q 316 2280 268 2322 214 2364 214 2430 L 214 3672 Q 214 3690 220 3708 148 3702 106 3660 58 3618 58 3558 L 58 2316 Q 58 2250 112 2208 160 2166 238 2166 L 14026 2166";
	ctx.fillStyle=tocolor(ctrans.apply([247,239,227,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 14152 3646 L 13726 3646 13726 2290 14152 2290 14152 3646";
	ctx.fillStyle=tocolor(ctrans.apply([235,207,141,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 14348 5398 Q 14348 5464 14294 5506 14240 5548 14162 5548 L 104 5548 Q 26 5548 -28 5506 -82 5464 -82 5398 L -82 4156 Q -82 4090 -28 4048 26 4006 104 4006 L 14162 4006 Q 14240 4006 14294 4048 14348 4090 14348 4156 L 14348 5398";
	ctx.fillStyle=tocolor(ctrans.apply([235,207,141,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 14348 5290 Q 14348 5356 14294 5398 14240 5440 14162 5440 L 104 5440 Q 26 5440 -28 5398 -82 5356 -82 5290 L -82 4048 Q -82 3982 -28 3940 26 3898 104 3898 L 14162 3898 Q 14240 3898 14294 3940 14348 3982 14348 4048 L 14348 5290";
	ctx.fillStyle=tocolor(ctrans.apply([247,225,170,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 11240 4446 L 13136 4158 14318 3966 Q 14348 4002 14348 4050 L 14348 5298 Q 14348 5358 14294 5400 14240 5442 14162 5448 L 104 5448 Q 26 5442 -28 5400 -82 5358 -82 5298 L -82 5232 74 5184 Q 704 5316 1688 5328 2666 5340 3860 5268 5060 5190 6350 5058 7640 4926 8894 4764 L 11240 4446";
	ctx.fillStyle=tocolor(ctrans.apply([242,219,160,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 14162 3898 Q 14300 3904 14342 4012 L 14324 4012 260 4012 Q 182 4012 134 4054 80 4096 80 4162 L 80 5404 Q 80 5422 86 5440 14 5434 -34 5392 -82 5350 -82 5290 L -82 4048 Q -82 3982 -28 3940 26 3898 104 3898 L 14162 3898";
	ctx.fillStyle=tocolor(ctrans.apply([247,239,227,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 14296 5386 L 13858 5386 13858 4030 14296 4030 14296 5386";
	ctx.fillStyle=tocolor(ctrans.apply([235,207,141,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 13924 -2826 Q 13924 -2754 13876 -2706 13828 -2658 13756 -2658 L 334 -2658 Q 262 -2658 214 -2706 166 -2754 166 -2826 L 1366 -8250 Q 1366 -8322 1414 -8370 1462 -8418 1534 -8418 L 12556 -8418 Q 12628 -8418 12676 -8370 12724 -8322 12724 -8250 L 13924 -2826";
	ctx.fillStyle=tocolor(ctrans.apply([214,103,0,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 2824 -7050 L 1336 -7050 Q 1318 -7128 1318 -7212 1324 -7536 1540 -7752 1756 -7968 2080 -7974 2404 -7968 2620 -7752 2836 -7536 2842 -7212 2842 -7128 2824 -7050";
	ctx.fillStyle=tocolor(ctrans.apply([189,78,32,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 4588 -7050 L 3100 -7050 Q 3082 -7128 3082 -7212 3088 -7536 3304 -7752 3520 -7968 3844 -7974 4168 -7968 4384 -7752 4600 -7536 4606 -7212 4606 -7128 4588 -7050";
	ctx.fillStyle=tocolor(ctrans.apply([189,78,32,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 6352 -7050 L 4864 -7050 Q 4846 -7128 4846 -7212 4852 -7536 5068 -7752 5284 -7968 5608 -7974 5932 -7968 6148 -7752 6364 -7536 6370 -7212 6370 -7128 6352 -7050";
	ctx.fillStyle=tocolor(ctrans.apply([189,78,32,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 8116 -7050 L 6628 -7050 Q 6610 -7128 6610 -7212 6616 -7536 6832 -7752 7048 -7968 7372 -7974 7696 -7968 7912 -7752 8128 -7536 8134 -7212 8134 -7128 8116 -7050";
	ctx.fillStyle=tocolor(ctrans.apply([189,78,32,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 9880 -7050 L 8392 -7050 Q 8374 -7128 8374 -7212 8380 -7536 8596 -7752 8812 -7968 9136 -7974 9460 -7968 9676 -7752 9892 -7536 9898 -7212 9898 -7128 9880 -7050";
	ctx.fillStyle=tocolor(ctrans.apply([189,78,32,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 11644 -7050 L 10156 -7050 Q 10138 -7128 10138 -7212 10144 -7536 10360 -7752 10576 -7968 10900 -7974 11224 -7968 11440 -7752 11656 -7536 11662 -7212 11662 -7128 11644 -7050";
	ctx.fillStyle=tocolor(ctrans.apply([189,78,32,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 3332 -5910 L 1844 -5910 Q 1826 -5988 1826 -6072 1832 -6396 2048 -6612 2264 -6828 2588 -6834 2912 -6828 3128 -6612 3344 -6396 3350 -6072 3350 -5988 3332 -5910";
	ctx.fillStyle=tocolor(ctrans.apply([189,78,32,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 5096 -5910 L 3608 -5910 Q 3590 -5988 3590 -6072 3596 -6396 3812 -6612 4028 -6828 4352 -6834 4676 -6828 4892 -6612 5108 -6396 5114 -6072 5114 -5988 5096 -5910";
	ctx.fillStyle=tocolor(ctrans.apply([189,78,32,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 6860 -5910 L 5372 -5910 Q 5354 -5988 5354 -6072 5360 -6396 5576 -6612 5792 -6828 6116 -6834 6440 -6828 6656 -6612 6872 -6396 6878 -6072 6878 -5988 6860 -5910";
	ctx.fillStyle=tocolor(ctrans.apply([189,78,32,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 8624 -5910 L 7136 -5910 Q 7118 -5988 7118 -6072 7124 -6396 7340 -6612 7556 -6828 7880 -6834 8204 -6828 8420 -6612 8636 -6396 8642 -6072 8642 -5988 8624 -5910";
	ctx.fillStyle=tocolor(ctrans.apply([189,78,32,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 10388 -5910 L 8900 -5910 Q 8882 -5988 8882 -6072 8888 -6396 9104 -6612 9320 -6828 9644 -6834 9968 -6828 10184 -6612 10400 -6396 10406 -6072 10406 -5988 10388 -5910";
	ctx.fillStyle=tocolor(ctrans.apply([189,78,32,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 12152 -5910 L 10664 -5910 Q 10646 -5988 10646 -6072 10652 -6396 10868 -6612 11084 -6828 11408 -6834 11732 -6828 11948 -6612 12164 -6396 12170 -6072 12170 -5988 12152 -5910";
	ctx.fillStyle=tocolor(ctrans.apply([189,78,32,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 2756 -4778 L 1268 -4778 Q 1250 -4856 1250 -4940 1256 -5264 1472 -5480 1688 -5696 2012 -5702 2336 -5696 2552 -5480 2768 -5264 2774 -4940 2774 -4856 2756 -4778";
	ctx.fillStyle=tocolor(ctrans.apply([189,78,32,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 4520 -4778 L 3032 -4778 Q 3014 -4856 3014 -4940 3020 -5264 3236 -5480 3452 -5696 3776 -5702 4100 -5696 4316 -5480 4532 -5264 4538 -4940 4538 -4856 4520 -4778";
	ctx.fillStyle=tocolor(ctrans.apply([189,78,32,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 6284 -4778 L 4796 -4778 Q 4778 -4856 4778 -4940 4784 -5264 5000 -5480 5216 -5696 5540 -5702 5864 -5696 6080 -5480 6296 -5264 6302 -4940 6302 -4856 6284 -4778";
	ctx.fillStyle=tocolor(ctrans.apply([189,78,32,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 8048 -4778 L 6560 -4778 Q 6542 -4856 6542 -4940 6548 -5264 6764 -5480 6980 -5696 7304 -5702 7628 -5696 7844 -5480 8060 -5264 8066 -4940 8066 -4856 8048 -4778";
	ctx.fillStyle=tocolor(ctrans.apply([189,78,32,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 9812 -4778 L 8324 -4778 Q 8306 -4856 8306 -4940 8312 -5264 8528 -5480 8744 -5696 9068 -5702 9392 -5696 9608 -5480 9824 -5264 9830 -4940 9830 -4856 9812 -4778";
	ctx.fillStyle=tocolor(ctrans.apply([189,78,32,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 11576 -4778 L 10088 -4778 Q 10070 -4856 10070 -4940 10076 -5264 10292 -5480 10508 -5696 10832 -5702 11156 -5696 11372 -5480 11588 -5264 11594 -4940 11594 -4856 11576 -4778";
	ctx.fillStyle=tocolor(ctrans.apply([189,78,32,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 4348 -3642 L 2860 -3642 Q 2842 -3720 2842 -3804 2848 -4128 3064 -4344 3280 -4560 3604 -4566 3928 -4560 4144 -4344 4360 -4128 4366 -3804 4366 -3720 4348 -3642";
	ctx.fillStyle=tocolor(ctrans.apply([189,78,32,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 2404 -3642 L 916 -3642 Q 898 -3720 898 -3804 904 -4128 1120 -4344 1336 -4560 1660 -4566 1984 -4560 2200 -4344 2416 -4128 2422 -3804 2422 -3720 2404 -3642";
	ctx.fillStyle=tocolor(ctrans.apply([189,78,32,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 6112 -3642 L 4624 -3642 Q 4606 -3720 4606 -3804 4612 -4128 4828 -4344 5044 -4560 5368 -4566 5692 -4560 5908 -4344 6124 -4128 6130 -3804 6130 -3720 6112 -3642";
	ctx.fillStyle=tocolor(ctrans.apply([189,78,32,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 7876 -3642 L 6388 -3642 Q 6370 -3720 6370 -3804 6376 -4128 6592 -4344 6808 -4560 7132 -4566 7456 -4560 7672 -4344 7888 -4128 7894 -3804 7894 -3720 7876 -3642";
	ctx.fillStyle=tocolor(ctrans.apply([189,78,32,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 9640 -3642 L 8152 -3642 Q 8134 -3720 8134 -3804 8140 -4128 8356 -4344 8572 -4560 8896 -4566 9220 -4560 9436 -4344 9652 -4128 9658 -3804 9658 -3720 9640 -3642";
	ctx.fillStyle=tocolor(ctrans.apply([189,78,32,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 11404 -3642 L 9916 -3642 Q 9898 -3720 9898 -3804 9904 -4128 10120 -4344 10336 -4560 10660 -4566 10984 -4560 11200 -4344 11416 -4128 11422 -3804 11422 -3720 11404 -3642";
	ctx.fillStyle=tocolor(ctrans.apply([189,78,32,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 13168 -3642 L 11680 -3642 Q 11662 -3720 11662 -3804 11668 -4128 11884 -4344 12100 -4560 12424 -4566 12748 -4560 12964 -4344 13180 -4128 13186 -3804 13186 -3720 13168 -3642";
	ctx.fillStyle=tocolor(ctrans.apply([189,78,32,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 14018 -3174 L 14018 -2616 62 -2616 62 -3174 14018 -3174";
	ctx.fillStyle=tocolor(ctrans.apply([217,233,255,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 13942 -2396 L 142 -2396 142 -2678 13942 -2678 13942 -2396";
	ctx.fillStyle=tocolor(ctrans.apply([168,192,224,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 3764 -1044 L 3638 1074 Q 3638 1146 3590 1194 3536 1248 3464 1248 L 1550 1248 Q 1472 1248 1424 1194 1376 1146 1376 1074 L 1250 -1044 Q 1250 -1116 1304 -1170 1352 -1218 1424 -1218 L 3590 -1218 Q 3662 -1218 3710 -1170 3758 -1116 3764 -1044";
	ctx.fillStyle=tocolor(ctrans.apply([255,255,255,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 3740 -1062 Q 3788 -1014 3788 -942 L 3668 1140 Q 3668 1212 3620 1260 3572 1308 3500 1308 L 1634 1308 Q 1562 1308 1514 1260 1466 1212 1466 1140 L 1346 -942 Q 1346 -1014 1394 -1062 1442 -1110 1514 -1110 L 3620 -1110 Q 3692 -1110 3740 -1062";
	ctx.fillStyle=tocolor(ctrans.apply([235,235,235,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 3484 -762 L 3364 840 Q 3364 912 3316 960 3268 1008 3196 1008 L 1810 1008 Q 1738 1008 1690 960 1642 912 1642 840 L 1522 -762 Q 1522 -834 1570 -882 1618 -930 1690 -930 L 3316 -930 Q 3388 -930 3436 -882 3484 -834 3484 -762";
	ctx.fillStyle=tocolor(ctrans.apply([95,234,255,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 3404 -906 Q 3482 -858 3488 -762 L 3368 840 Q 3362 912 3314 960 3266 1008 3194 1008 L 1814 1008 Q 1742 1008 1694 960 2024 840 2318 564 2612 294 2846 -24 3080 -336 3224 -588 3368 -834 3404 -906";
	ctx.fillStyle=tocolor(ctrans.apply([74,195,255,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 3818 -224 L 3830 172 1304 586 1244 484 1202 130 1232 46 1448 10 1988 -62 2672 -152 3326 -230 3776 -254 3818 -224";
	ctx.fillStyle=tocolor(ctrans.apply([235,235,235,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 3824 -224 L 1202 136 1232 40 2798 -170 3572 -242 3782 -254 3824 -224";
	ctx.fillStyle=tocolor(ctrans.apply([255,255,255,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 2266 -1170 L 2614 -1170 2764 1182 2674 1212 2488 1254 2344 1260 Q 2320 1236 2302 990 2284 744 2278 390 L 2266 -324 2266 -924 2266 -1170";
	ctx.fillStyle=tocolor(ctrans.apply([235,235,235,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 2912 1008 L 2444 1008 2006 1008 1814 1002 Q 1802 1008 1730 972 1658 942 1646 858 L 3368 864 Q 3368 876 3344 930 3314 990 3194 1002 3128 1008 2912 1008";
	ctx.fillStyle=tocolor(ctrans.apply([255,255,255,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 12884 -708 L 12758 1410 Q 12758 1482 12710 1530 12656 1584 12584 1584 L 10670 1584 Q 10592 1584 10544 1530 10496 1482 10496 1410 L 10370 -708 Q 10370 -780 10424 -834 10472 -882 10544 -882 L 12710 -882 Q 12782 -882 12830 -834 12878 -780 12884 -708";
	ctx.fillStyle=tocolor(ctrans.apply([222,184,87,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 12640 -1044 L 12514 1074 Q 12514 1146 12466 1194 12412 1248 12340 1248 L 10426 1248 Q 10348 1248 10300 1194 10252 1146 10252 1074 L 10126 -1044 Q 10126 -1116 10180 -1170 10228 -1218 10300 -1218 L 12466 -1218 Q 12538 -1218 12586 -1170 12634 -1116 12640 -1044";
	ctx.fillStyle=tocolor(ctrans.apply([255,255,255,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 12616 -1062 Q 12664 -1014 12664 -942 L 12544 1140 Q 12544 1212 12496 1260 12448 1308 12376 1308 L 10510 1308 Q 10438 1308 10390 1260 10342 1212 10342 1140 L 10222 -942 Q 10222 -1014 10270 -1062 10318 -1110 10390 -1110 L 12496 -1110 Q 12568 -1110 12616 -1062";
	ctx.fillStyle=tocolor(ctrans.apply([235,235,235,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 12356 -762 L 12236 840 Q 12236 912 12188 960 12140 1008 12068 1008 L 10682 1008 Q 10610 1008 10562 960 10514 912 10514 840 L 10394 -762 Q 10394 -834 10442 -882 10490 -930 10562 -930 L 12188 -930 Q 12260 -930 12308 -882 12356 -834 12356 -762";
	ctx.fillStyle=tocolor(ctrans.apply([95,234,255,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 12280 -906 Q 12358 -858 12364 -762 L 12244 840 Q 12238 912 12190 960 12142 1008 12070 1008 L 10690 1008 Q 10618 1008 10570 960 10900 840 11194 564 11488 294 11722 -24 11956 -336 12100 -588 12244 -834 12280 -906";
	ctx.fillStyle=tocolor(ctrans.apply([74,195,255,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 12694 -224 L 12706 172 10180 586 10120 484 10078 130 10108 46 10324 10 10864 -62 11548 -152 12202 -230 12652 -254 12694 -224";
	ctx.fillStyle=tocolor(ctrans.apply([235,235,235,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 12700 -224 L 10078 136 10108 40 11674 -170 12448 -242 12658 -254 12700 -224";
	ctx.fillStyle=tocolor(ctrans.apply([255,255,255,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 11138 -1170 L 11486 -1170 11636 1182 Q 11630 1182 11546 1212 L 11360 1254 11216 1260 Q 11192 1236 11174 990 11156 744 11150 390 L 11138 -324 11138 -924 11138 -1170";
	ctx.fillStyle=tocolor(ctrans.apply([235,235,235,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 11780 1008 L 11312 1008 10874 1008 10682 1002 Q 10670 1008 10598 972 10526 942 10514 858 L 12236 864 Q 12236 876 12212 930 12182 990 12062 1002 11996 1008 11780 1008";
	ctx.fillStyle=tocolor(ctrans.apply([255,255,255,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
}

function shape151(ctx,ctrans,frame,ratio,time){
	var pathData="M 2793 2882 L 103 2882 103 192 2793 192 2793 2882";
	ctx.fillStyle=tocolor(ctrans.apply([0,0,0,0.27058825]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 2567 2661 L 0 2661 0 94 2567 94 2567 2661";
	ctx.fillStyle=tocolor(ctrans.apply([232,232,232,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 2567 100 L 0 100 77 0 2421 0 2567 100";
	ctx.fillStyle=tocolor(ctrans.apply([255,255,255,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 234 2266 L 234 2215 229 2215 229 315 2079 315 2079 2256 2084 2261 2079 2266 234 2266";
	ctx.fillStyle=tocolor(ctrans.apply([102,102,102,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 2079 315 L 2299 315 2299 2425 2291 2425 2291 2429 2084 2261 2079 2256 2079 315";
	ctx.fillStyle=tocolor(ctrans.apply([153,153,153,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 2291 2429 L 2291 2435 229 2435 229 2305 234 2305 234 2266 2079 2266 2084 2261 2291 2429";
	ctx.fillStyle=tocolor(ctrans.apply([188,188,188,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 2291 2429 L 2079 2256 2079 2266 234 2266 M 2079 2256 L 2079 335";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([51,51,51,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

}

function shape152(ctx,ctrans,frame,ratio,time){
	var pathData="M 1265 2280 Q 1056 2276 1041 2280 1025 2284 1008 2313 L 991 2347 172 2347 181 2343 172 2343 172 315 2568 315 2568 2343 2560 2343 2560 2347 Q 1889 2421 1681 2352 1474 2283 1265 2280";
	ctx.fillStyle=tocolor(ctrans.apply([0,0,0,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
}

function shape153(ctx,ctrans,frame,ratio,time){
	var pathData="M 637 2296 Q 655 2134 640 2034 L 633 2008 628 1985 628 1983 623 1969 606 1937 562 1868 Q 537 1827 533 1799 L 524 1731 518 1683 Q 524 1640 552 1630 579 1618 579 1704 580 1790 594 1828 608 1865 626 1862 645 1858 654 1806 662 1755 704 1740 745 1726 723 1776 701 1825 697 1876 L 689 1965 Q 683 2003 691 2077 L 701 2263 Q 947 2148 1007 2139 L 1111 2129 Q 1121 2131 1128 2136 1118 2148 1138 2193 1133 2215 1120 2232 L 1101 2259 1090 2272 Q 1042 2297 923 2308 L 631 2344 630 2343 635 2308 637 2298 637 2296 635 2308 637 2296 M 696 2265 L 701 2263 696 2265";
	ctx.fillStyle=tocolor(ctrans.apply([253,236,208,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 1090 2272 Q 1042 2297 923 2308 L 631 2344";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([204,102,0,1]));
	ctx.lineWidth=0.05;
	ctx.lineCap="butt";
	ctx.lineJoin="miter";
	ctx.miterLimit=3.0;
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M 637 2296 Q 655 2134 640 2034 L 633 2008 628 1985 628 1983 623 1969 606 1937 562 1868 Q 537 1827 533 1799 L 524 1731 518 1683 Q 524 1640 552 1630 579 1618 579 1704 580 1790 594 1828 608 1865 626 1862 645 1858 654 1806 662 1755 704 1740 745 1726 723 1776 701 1825 697 1876 L 689 1965 Q 683 2003 691 2077 L 701 2263 M 637 2296 L 635 2308";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([204,102,0,1]));
	ctx.lineWidth=0.05;
	ctx.lineCap="round";
	ctx.lineJoin="miter";
	ctx.miterLimit=3.0;
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M 701 2263 Q 947 2148 1007 2139 L 1111 2129 Q 1121 2131 1128 2136 M 635 2308 L 637 2298 M 701 2263 L 696 2265";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([204,102,0,1]));
	ctx.lineWidth=0.05;
	ctx.lineCap="round";
	ctx.lineJoin="miter";
	ctx.miterLimit=3.0;
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M 630 2343 L 635 2308";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([204,102,0,1]));
	ctx.lineWidth=0.05;
	ctx.lineCap="butt";
	ctx.lineJoin="miter";
	ctx.miterLimit=3.0;
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M 1638 2606 L 1164 2624 Q 1147 2509 1137 2280 L 1112 1860 1132 1845 Q 1163 1828 1222 1829 1266 1829 1273 1809 1276 1769 1294 1727 L 1416 1713 Q 1422 1762 1403 1836 1406 1855 1438 1857 1477 1888 1544 2043 1622 2224 1638 2606 M 1427 1850 L 1432 1851 Q 1392 1838 1427 1850";
	ctx.fillStyle=tocolor(ctrans.apply([253,236,208,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 1638 2606 L 1164 2624 Q 1147 2509 1137 2280 L 1112 1860 1132 1845 Q 1163 1828 1222 1829 1266 1829 1273 1809 1276 1769 1294 1727 L 1416 1713 Q 1422 1762 1403 1836 1406 1855 1438 1857";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([204,102,0,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M 1438 1857 Q 1477 1888 1544 2043 1622 2224 1638 2606 Z";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([204,102,0,1]));
	ctx.lineWidth=0.5;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M 1928 2273 Q 1962 2148 1980 2097 2004 2026 2006 1988 L 2020 1900 Q 2028 1850 2018 1797 2008 1742 2044 1766 2080 1789 2077 1841 2072 1894 2091 1901 2108 1908 2131 1875 2153 1841 2172 1758 2193 1676 2216 1693 2239 1708 2237 1751 L 2219 1797 2196 1860 Q 2186 1886 2152 1921 L 2094 1980 2070 2006 2063 2019 2062 2021 2052 2042 2039 2066 Q 2000 2160 1982 2321 L 1982 2332 1982 2321 1983 2322 1982 2332 1979 2369 1979 2370 1671 2260 Q 1591 2234 1551 2198 L 1557 2192 Q 1565 2179 1539 2151 1521 2133 1521 2111 1550 2072 1544 2059 L 1563 2056 Q 1590 2054 1662 2087 1716 2110 1928 2273 L 1932 2277 1928 2273";
	ctx.fillStyle=tocolor(ctrans.apply([253,236,208,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 1551 2198 Q 1591 2234 1671 2260 L 1979 2370";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([204,102,0,1]));
	ctx.lineWidth=0.05;
	ctx.lineCap="butt";
	ctx.lineJoin="miter";
	ctx.miterLimit=3.0;
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M 1982 2321 Q 2000 2160 2039 2066 L 2052 2042 2062 2021 2063 2019 2070 2006 2094 1980 2152 1921 Q 2186 1886 2196 1860 L 2219 1797 2237 1751 Q 2239 1708 2216 1693 2193 1676 2172 1758 2153 1841 2131 1875 2108 1908 2091 1901 2072 1894 2077 1841 2080 1789 2044 1766 2008 1742 2018 1797 2028 1850 2020 1900 L 2006 1988 Q 2004 2026 1980 2097 1962 2148 1928 2273 M 1982 2332 L 1982 2321";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([204,102,0,1]));
	ctx.lineWidth=0.05;
	ctx.lineCap="round";
	ctx.lineJoin="miter";
	ctx.miterLimit=3.0;
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M 1928 2273 L 1932 2277";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([204,102,0,1]));
	ctx.lineWidth=0.05;
	ctx.lineCap="round";
	ctx.lineJoin="miter";
	ctx.miterLimit=3.0;
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M 1979 2369 L 1982 2332 1983 2322 M 1544 2059 L 1563 2056 Q 1590 2054 1662 2087 1716 2110 1928 2273";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([204,102,0,1]));
	ctx.lineWidth=0.05;
	ctx.lineCap="butt";
	ctx.lineJoin="miter";
	ctx.miterLimit=3.0;
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M 772 2248 L 736 2171 Q 757 2130 954 2058 L 1149 1994 1193 2190 Q 1149 2235 976 2299 808 2360 808 2341 808 2328 772 2248";
	var grd=ctx.createLinearGradient(774.0,2269.5,1186.0,2072.5);
	grd.addColorStop(0.0,tocolor(ctrans.apply([253,253,62,1])));
	grd.addColorStop(1.0,tocolor(ctrans.apply([255,159,17,1])));
	ctx.fillStyle = grd;
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 772 2248 Q 808 2328 808 2341 808 2360 976 2299 1149 2235 1193 2190 L 1149 1994 954 2058 Q 757 2130 736 2171 L 772 2248 Z";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([204,102,0,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M 964 2427 L 982 2447 Q 1016 2479 1075 2507 1260 2596 1620 2622 L 1611 2709 Q 1305 2706 1081 2599 1010 2565 956 2526 L 922 2497 964 2427";
	ctx.fillStyle=tocolor(ctrans.apply([247,123,0,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 965 2425 L 966 2424 Q 1056 2278 1072 2238 1089 2190 1102 2082 L 1113 1983 1346 2077 Q 1600 2108 1785 2164 1876 2191 1917 2213 1909 2277 1837 2370 1760 2334 1680 2341 L 1617 2356 Q 1626 2408 1623 2542 L 1620 2622 Q 1260 2596 1075 2507 1016 2479 982 2447 L 964 2427 965 2425 M 1611 2709 L 1595 2800 Q 1573 2890 1427 2869 L 1299 2840 1185 2812 Q 1094 2795 988 2741 893 2691 875 2661 860 2639 861 2624 L 873 2582 Q 876 2570 922 2497 L 956 2526 Q 1010 2565 1081 2599 1305 2706 1611 2709";
	var grd=ctx.createLinearGradient(1685.5,2323.0,930.5,2537.0);
	grd.addColorStop(0.0,tocolor(ctrans.apply([253,253,62,1])));
	grd.addColorStop(1.0,tocolor(ctrans.apply([255,159,17,1])));
	ctx.fillStyle = grd;
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 1620 2622 L 1623 2542 Q 1626 2408 1617 2356 L 1680 2341 Q 1760 2334 1837 2370 1909 2277 1917 2213 1876 2191 1785 2164 1600 2108 1346 2077 L 1113 1983 1102 2082 Q 1089 2190 1072 2238 1056 2278 966 2424 L 965 2425";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([204,102,0,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="miter";
	ctx.miterLimit=3.0;
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M 1620 2622 L 1611 2709 1595 2800 Q 1573 2890 1427 2869 L 1299 2840 1185 2812 Q 1094 2795 988 2741 893 2691 875 2661 860 2639 861 2624 L 873 2582 Q 876 2570 922 2497 L 964 2427";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([204,102,0,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="miter";
	ctx.miterLimit=3.0;
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M 1289 2116 L 1257 2042 Q 1316 1981 1523 1974 1626 1970 1717 1978 1752 2100 1715 2148 L 1676 2179 1633 2199 Q 1573 2233 1507 2249 1411 2272 1369 2234 1328 2198 1289 2116";
	var grd=ctx.createLinearGradient(1385.75,2246.0,1610.25,1908.0);
	grd.addColorStop(0.0,tocolor(ctrans.apply([253,253,62,1])));
	grd.addColorStop(1.0,tocolor(ctrans.apply([255,255,255,1])));
	ctx.fillStyle = grd;
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 1289 2116 Q 1328 2198 1369 2234 1411 2272 1507 2249 1573 2233 1633 2199 L 1676 2179 1715 2148 Q 1752 2100 1717 1978 1626 1970 1523 1974 1316 1981 1257 2042 L 1289 2116 Z";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([204,102,0,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="butt";
	ctx.lineJoin="miter";
	ctx.miterLimit=3.0;
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M 1097 1994 L 1141 2022 Q 1201 2051 1285 2047 L 1282 2068 1263 2120 Q 1221 2201 1083 2233 L 1097 1994";
	var grd=ctx.createLinearGradient(1161.0,2117.75,1227.0,1854.25);
	grd.addColorStop(0.0,tocolor(ctrans.apply([253,253,62,1])));
	grd.addColorStop(1.0,tocolor(ctrans.apply([255,255,255,1])));
	ctx.fillStyle = grd;
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 1097 1994 L 1141 2022 Q 1201 2051 1285 2047 L 1282 2068 1263 2120 Q 1221 2201 1083 2233 L 1097 1994 Z";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([204,102,0,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

}

function shape154(ctx,ctrans,frame,ratio,time){
	var pathData="M 965 -390 Q 972 -356 1044 -195 1119 -8 1140 162 1208 708 757 1193 308 1677 -415 1647 -640 1637 -866 1578 L -1047 1520 Q -1835 1079 -1931 637 -1974 448 -1904 216 -1856 54 -1713 -236 -1517 -632 -1095 -953 -884 -1114 -713 -1196 100 -1607 965 -390";
	ctx.fillStyle=tocolor(ctrans.apply([254,230,196,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 965 -390 Q 100 -1607 -713 -1196 -884 -1114 -1095 -953 -1517 -632 -1713 -236 -1856 54 -1904 216 -1974 448 -1931 637 -1835 1079 -1047 1520 L -866 1578 Q -640 1637 -415 1647 308 1677 757 1193 1208 708 1140 162 1119 -8 1044 -195 972 -356 965 -390 Z";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([204,102,0,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M -1613 1117 Q -1817 1018 -1923 633 -2030 247 -1736 -120 -1750 -159 -1570 -86 -1324 13 -1220 250 -1118 487 -1218 725 -1320 961 -1565 1057 -1645 1088 -1613 1117";
	drawPath(ctx,pathData,false);
	ctx.fillStyle=tocolor(ctrans.apply([255,255,255,0.0]));
	ctx.fill("evenodd");
	ctx.save();
	ctx.clip();
	ctx.transform(-0.0152587890625,0.03570556640625,-0.0374755859375,-0.01513671875,-1815,483);
	var grd=ctx.createRadialGradient(0.0,0,0,0,0,16384);
	grd.addColorStop(0.0,tocolor(ctrans.apply([255,119,187,0.5019608])));
	grd.addColorStop(1.0,tocolor(ctrans.apply([255,255,255,0.0])));
	ctx.fillStyle = grd;
	ctx.fillRect(-16384,-16384,32768,32768);
	ctx.restore();
	var pathData="M -249 1233 Q -269 968 -102 770 65 573 321 559 457 551 576 598 852 1115 587 1349 280 1620 -127 1571 -235 1425 -249 1233";
	drawPath(ctx,pathData,false);
	ctx.fillStyle=tocolor(ctrans.apply([255,255,255,0.0]));
	ctx.fill("evenodd");
	ctx.save();
	ctx.clip();
	ctx.transform(0.038726806640625,-0.0021209716796875,0.003021240234375,0.0402374267578125,369,1197);
	var grd=ctx.createRadialGradient(0.0,0,0,0,0,16384);
	grd.addColorStop(0.0,tocolor(ctrans.apply([255,119,201,0.5019608])));
	grd.addColorStop(1.0,tocolor(ctrans.apply([255,255,255,0.0])));
	ctx.fillStyle = grd;
	ctx.fillRect(-16384,-16384,32768,32768);
	ctx.restore();
	var pathData="M 819 757 L 825 753 Q 1085 582 1194 668 1304 756 1183 1032 1082 1260 847 1217 774 1203 696 1165 L 655 1141 819 757";
	ctx.fillStyle=tocolor(ctrans.apply([254,230,196,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 655 1141 L 696 1165 Q 774 1203 847 1217 1082 1260 1183 1032 1304 756 1194 668 1085 582 825 753 L 819 757 M 655 1141 L 632 1128";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([204,102,0,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M -1304 -582 Q -1448 -654 -1499 -746 L -1521 -825 Q -1514 -1136 -1241 -1233 -1074 -1292 -848 -1262 L -799 -1254 Q -790 -1107 -1046 -829 -1173 -691 -1304 -582";
	var grd=ctx.createLinearGradient(-967.25,-1264.75,-1494.75,-685.25);
	grd.addColorStop(0.0,tocolor(ctrans.apply([255,176,60,1])));
	grd.addColorStop(1.0,tocolor(ctrans.apply([187,94,0,1])));
	ctx.fillStyle = grd;
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M -1304 -582 Q -1173 -691 -1046 -829 -790 -1107 -799 -1254 L -848 -1262 Q -1074 -1292 -1241 -1233 -1514 -1136 -1521 -825 L -1499 -746 Q -1448 -654 -1304 -582 Z";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([204,102,0,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M 478 357 L 458 469 Q 215 -79 -149 -372 -263 -463 -375 -519 L -464 -555 Q -470 -441 -439 -172 -723 -437 -842 -779 -880 -886 -897 -988 L -905 -1069 Q -903 -1186 -815 -1267 -722 -1353 -553 -1369 -143 -1409 497 -1036 1109 -680 1283 -89 1347 129 1340 343 1333 521 1284 623 1211 779 1004 801 927 810 878 790 829 772 850 738 908 648 894 540 843 680 645 725 680 565 666 402 L 645 271 Q 576 247 478 357 511 152 504 53 511 152 478 357";
	var grd=ctx.createLinearGradient(-477.25,-1076.5,873.25,112.5);
	grd.addColorStop(0.0,tocolor(ctrans.apply([255,176,60,1])));
	grd.addColorStop(1.0,tocolor(ctrans.apply([187,94,0,1])));
	ctx.fillStyle = grd;
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 478 357 Q 576 247 645 271 L 666 402 Q 680 565 645 725 843 680 894 540 908 648 850 738 829 772 878 790 927 810 1004 801 1211 779 1284 623 1333 521 1340 343 1347 129 1283 -89 1109 -680 497 -1036 -143 -1409 -553 -1369 -722 -1353 -815 -1267 -903 -1186 -905 -1069 L -897 -988 Q -880 -886 -842 -779 -723 -437 -439 -172 -470 -441 -464 -555 L -375 -519 Q -263 -463 -149 -372 215 -79 458 469 L 478 357";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([204,102,0,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="miter";
	ctx.miterLimit=3.0;
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M 478 357 Q 511 152 504 53";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([204,102,0,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="miter";
	ctx.miterLimit=3.0;
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M 526 -1236 Q 644 -1147 757 -1044 837 -976 871 -977 953 -980 1041 -1171 1125 -1355 1277 -1309 1354 -1288 1413 -1229 1518 -1065 1409 -807 1354 -679 1279 -582 1297 -172 1253 -76 540 -916 -238 -1179 -481 -1261 -700 -1276 L -873 -1274 Q -809 -1390 -553 -1475 -424 -1516 -310 -1536 -299 -1575 -296 -1618 -291 -1693 -317 -1888 -342 -2088 -197 -2083 -78 -2079 10 -1991 88 -1914 88 -1498 301 -1409 526 -1236";
	var grd=ctx.createLinearGradient(-592.5,-1758.5,1520.5,-535.5);
	grd.addColorStop(0.0,tocolor(ctrans.apply([255,60,60,1])));
	grd.addColorStop(1.0,tocolor(ctrans.apply([186,1,75,1])));
	ctx.fillStyle = grd;
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 526 -1236 Q 301 -1409 88 -1498 88 -1914 10 -1991 -78 -2079 -197 -2083 -342 -2088 -317 -1888 -291 -1693 -296 -1618 -299 -1575 -310 -1536 -424 -1516 -553 -1475 -809 -1390 -873 -1274 L -700 -1276 Q -481 -1261 -238 -1179 540 -916 1253 -76 1297 -172 1279 -582 1354 -679 1409 -807 1518 -1065 1413 -1229 1354 -1288 1277 -1309 1125 -1355 1041 -1171 953 -980 871 -977 837 -976 757 -1044 644 -1147 526 -1236 Z";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([204,102,0,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="butt";
	ctx.lineJoin="miter";
	ctx.miterLimit=3.0;
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M -976 283 Q -1047 411 -1169 360 L -1121 398 Q -1071 453 -1060 545";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([204,102,0,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M -81 1097 L -65 1093 -51 1097 Q -44 1103 -44 1110 -44 1117 -51 1121 -57 1127 -65 1127 L -81 1121 -86 1110 -81 1097 M -92 931 Q -82 931 -76 937 -69 943 -69 951 -69 960 -76 965 -82 971 -92 971 -102 971 -109 965 L -115 951 -109 937 Q -102 931 -92 931 M -1546 303 Q -1546 313 -1553 320 -1560 327 -1570 327 -1582 327 -1589 320 L -1594 303 -1589 285 Q -1582 279 -1570 279 -1560 279 -1553 285 -1546 293 -1546 303 M -1654 375 Q -1647 381 -1647 388 -1647 395 -1654 399 L -1668 405 Q -1676 405 -1684 399 L -1689 388 -1684 375 -1668 371 -1654 375 M -1679 244 Q -1685 250 -1695 250 L -1712 244 -1718 230 -1712 216 Q -1705 210 -1695 210 -1685 210 -1679 216 -1672 221 -1672 230 -1672 238 -1679 244 M 32 1049 Q 21 1049 14 1042 8 1035 8 1025 8 1015 14 1006 L 32 1001 Q 42 1001 49 1006 57 1015 57 1025 57 1035 49 1042 42 1049 32 1049";
	ctx.fillStyle=tocolor(ctrans.apply([204,102,0,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
}

function shape155(ctx,ctrans,frame,ratio,time){
	var pathData="M -231 -49 Q -199 -96 -138 -125 -16 -182 131 -88";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([204,102,0,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

}

function shape156(ctx,ctrans,frame,ratio,time){
	var pathData="M -192 -76 Q -167 -123 -119 -152 -24 -209 92 -115";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([204,102,0,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

}

function sprite157(ctx,ctrans,frame,ratio,time){
	var clips = [];
	var frame_cnt = 24;
	frame = frame % frame_cnt;
	switch(frame){
		case 0:
			place("shape155",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
		case 1:
			place("shape155",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
		case 2:
			place("shape155",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
		case 3:
			place("shape155",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
		case 4:
			place("shape155",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
		case 5:
			place("shape155",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
		case 6:
			place("shape155",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
		case 7:
			place("shape155",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
		case 8:
			place("shape155",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
		case 9:
			place("shape155",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
		case 10:
			place("shape155",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
		case 11:
			place("shape155",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
		case 12:
			place("shape155",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
		case 13:
			place("shape155",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
		case 14:
			place("shape155",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
		case 15:
			place("shape156",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
		case 16:
			place("shape156",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
		case 17:
			place("shape156",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
		case 18:
			place("shape156",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
		case 19:
			place("shape156",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
		case 20:
			place("shape156",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
		case 21:
			place("shape156",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
		case 22:
			place("shape156",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
		case 23:
			place("shape156",cloudy_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
	}
}

function shape158(ctx,ctrans,frame,ratio,time){
	var pathData="M 398 -40 Q 704 -33 841 -143";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([204,102,0,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M 847 324 Q 803 424 701 464 598 504 497 460 397 415 357 313 317 210 361 110 405 10 508 -30 610 -70 711 -26 811 17 851 120 891 222 847 324";
	ctx.fillStyle=tocolor(ctrans.apply([255,255,255,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 847 324 Q 803 424 701 464 598 504 497 460 397 415 357 313 317 210 361 110 405 10 508 -30 610 -70 711 -26 811 17 851 120 891 222 847 324 Z";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([204,102,0,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M 678 -27 Q 760 9 793 94 826 179 790 261 754 344 669 377 584 410 502 374 419 337 387 253 352 168 390 86 426 3 511 -30 594 -63 678 -27";
	var grd=ctx.createLinearGradient(510.5,-30.75,669.5,376.75);
	grd.addColorStop(0.00392156862745098,tocolor(ctrans.apply([129,241,116,1])));
	grd.addColorStop(1.0,tocolor(ctrans.apply([12,116,12,1])));
	ctx.fillStyle = grd;
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M -486 -631 Q -477 -513 -375 -353";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([204,102,0,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M -371 -137 Q -415 -37 -517 3 -620 43 -721 -1 -821 -46 -861 -148 -901 -251 -857 -351 -813 -451 -710 -491 -608 -531 -507 -487 -407 -444 -367 -341 -327 -239 -371 -137";
	ctx.fillStyle=tocolor(ctrans.apply([255,255,255,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M -371 -137 Q -415 -37 -517 3 -620 43 -721 -1 -821 -46 -861 -148 -901 -251 -857 -351 -813 -451 -710 -491 -608 -531 -507 -487 -407 -444 -367 -341 -327 -239 -371 -137 Z";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([204,102,0,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M -544 -488 Q -462 -452 -429 -367 -396 -282 -432 -200 -468 -117 -553 -83 -638 -50 -720 -86 -804 -124 -835 -207 -870 -292 -832 -374 -796 -458 -711 -491 -628 -524 -544 -488";
	var grd=ctx.createLinearGradient(-711.5,-491.75,-552.5,-84.25);
	grd.addColorStop(0.00392156862745098,tocolor(ctrans.apply([129,241,116,1])));
	grd.addColorStop(1.0,tocolor(ctrans.apply([12,116,12,1])));
	ctx.fillStyle = grd;
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
}

function shape159(ctx,ctrans,frame,ratio,time){
	var pathData="M 1006 406 Q 696 -40 238 76 191 -392 715 -225 1239 -58 1006 406 M -497 -762 Q -22 -627 -263 -15 -573 -461 -1031 -345 -973 -896 -497 -762";
	ctx.fillStyle=tocolor(ctrans.apply([253,236,208,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
}

function sprite164(ctx,ctrans,frame,ratio,time){
	ctx.save();
	ctx.transform(1,0,0,1,435.95,420.9);
	var clips = [];
	var frame_cnt = 1;
	frame = frame % frame_cnt;
	switch(frame){
		case 0:
			place("shape141",cloudy_canvas,ctx,[0.05,0.0,0.0,0.05,0.0,0.0],ctrans,1,0,0,time);
			place("sprite145",cloudy_canvas,ctx,[0.04749984741210937,0.0,0.0,0.04749984741210937,-15.7,-94.3],ctrans,1,(0+time)%115,0,time);
			place("shape146",cloudy_canvas,ctx,[0.05,0.0,0.0,0.05,-382.95,62.1],ctrans.merge(new cxform(16,41,52,0,141,141,141,256)),1,0,0,time);
			place("shape147",cloudy_canvas,ctx,[0.04993896484375,0.00200347900390625,-0.00200347900390625,0.04993896484375,-311.25,179.4],ctrans.merge(new cxform(16,41,52,0,141,141,141,256)),1,0,0,time);
			place("shape148",cloudy_canvas,ctx,[0.04994354248046875,0.00222625732421875,-0.0022247314453125,0.04994354248046875,-339.05,187.8],ctrans.merge(new cxform(16,41,52,0,141,141,141,256)),1,0,0,time);
			place("shape148",cloudy_canvas,ctx,[0.04994354248046875,0.00222625732421875,-0.0022247314453125,0.04994354248046875,-284.75,181.8],ctrans.merge(new cxform(16,41,52,0,141,141,141,256)),1,0,0,time);
			place("shape147",cloudy_canvas,ctx,[0.04993896484375,0.00200347900390625,-0.00200347900390625,0.04993896484375,-279.0,178.4],ctrans.merge(new cxform(16,41,52,0,141,141,141,256)),1,0,0,time);
			place("shape147",cloudy_canvas,ctx,[0.04993896484375,0.00200347900390625,-0.00200347900390625,0.04993896484375,-212.65,157.3],ctrans.merge(new cxform(16,41,52,0,141,141,141,256)),1,0,0,time);
			place("shape147",cloudy_canvas,ctx,[0.04993896484375,0.00200347900390625,-0.00200347900390625,0.04993896484375,-140.35,149.0],ctrans.merge(new cxform(16,41,52,0,141,141,141,256)),1,0,0,time);
			place("shape147",cloudy_canvas,ctx,[0.04993896484375,0.00200347900390625,-0.00200347900390625,0.04993896484375,-57.35,149.6],ctrans.merge(new cxform(16,41,52,0,141,141,141,256)),1,0,0,time);
			place("shape147",cloudy_canvas,ctx,[0.04993896484375,0.00200347900390625,-0.00200347900390625,0.04993896484375,16.15,153.7],ctrans.merge(new cxform(16,41,52,0,141,141,141,256)),1,0,0,time);
			place("shape147",cloudy_canvas,ctx,[0.04993896484375,0.00200347900390625,-0.00200347900390625,0.04993896484375,99.75,169.8],ctrans.merge(new cxform(16,41,52,0,141,141,141,256)),1,0,0,time);
			place("shape147",cloudy_canvas,ctx,[0.04993896484375,0.00200347900390625,-0.00200347900390625,0.04993896484375,126.65,175.8],ctrans.merge(new cxform(16,41,52,0,141,141,141,256)),1,0,0,time);
			place("shape148",cloudy_canvas,ctx,[0.04994354248046875,0.00222625732421875,-0.0022247314453125,0.04994354248046875,-189.75,160.3],ctrans.merge(new cxform(16,41,52,0,141,141,141,256)),1,0,0,time);
			place("shape148",cloudy_canvas,ctx,[0.04994354248046875,0.00222625732421875,-0.0022247314453125,0.04994354248046875,-112.15,160.9],ctrans.merge(new cxform(16,41,52,0,141,141,141,256)),1,0,0,time);
			place("shape148",cloudy_canvas,ctx,[0.04994354248046875,0.00222625732421875,-0.0022247314453125,0.04994354248046875,-30.95,157.9],ctrans.merge(new cxform(16,41,52,0,141,141,141,256)),1,0,0,time);
			place("shape148",cloudy_canvas,ctx,[0.04994354248046875,0.00222625732421875,-0.0022247314453125,0.04994354248046875,78.35,171.0],ctrans.merge(new cxform(16,41,52,0,141,141,141,256)),1,0,0,time);
			place("shape148",cloudy_canvas,ctx,[0.04994354248046875,0.00222625732421875,-0.0022247314453125,0.04994354248046875,151.15,190.1],ctrans.merge(new cxform(16,41,52,0,141,141,141,256)),1,0,0,time);
			place("shape148",cloudy_canvas,ctx,[0.04994354248046875,0.00222625732421875,-0.0022247314453125,0.04994354248046875,41.85,166.8],ctrans.merge(new cxform(16,41,52,0,141,141,141,256)),1,0,0,time);
			place("shape148",cloudy_canvas,ctx,[0.04994354248046875,0.00222625732421875,-0.0022247314453125,0.04994354248046875,-1.75,165.0],ctrans.merge(new cxform(16,41,52,0,141,141,141,256)),1,0,0,time);
			place("shape148",cloudy_canvas,ctx,[0.04994354248046875,0.00222625732421875,-0.0022247314453125,0.04994354248046875,-75.25,159.1],ctrans.merge(new cxform(16,41,52,0,141,141,141,256)),1,0,0,time);
			place("shape148",cloudy_canvas,ctx,[0.04994354248046875,0.00222625732421875,-0.0022247314453125,0.04994354248046875,-151.65,158.5],ctrans.merge(new cxform(16,41,52,0,141,141,141,256)),1,0,0,time);
			place("shape148",cloudy_canvas,ctx,[0.04994354248046875,0.00222625732421875,-0.0022247314453125,0.04994354248046875,-240.65,167.4],ctrans.merge(new cxform(16,41,52,0,141,141,141,256)),1,0,0,time);
			place("shape147",cloudy_canvas,ctx,[0.0349578857421875,0.00140228271484375,-0.00140228271484375,0.0349578857421875,-167.85,162.1],ctrans.merge(new cxform(16,41,52,0,141,141,141,256)),1,0,0,time);
			place("shape147",cloudy_canvas,ctx,[0.0349578857421875,0.00140228271484375,-0.00140228271484375,0.0349578857421875,-223.45,168.7],ctrans.merge(new cxform(16,41,52,0,141,141,141,256)),1,0,0,time);
			place("shape147",cloudy_canvas,ctx,[0.0349578857421875,0.00140228271484375,-0.00140228271484375,0.0349578857421875,-258.8,176.5],ctrans.merge(new cxform(16,41,52,0,141,141,141,256)),1,0,0,time);
			place("shape147",cloudy_canvas,ctx,[0.0349578857421875,0.00140228271484375,-0.00140228271484375,0.0349578857421875,-319.05,186.0],ctrans.merge(new cxform(16,41,52,0,141,141,141,256)),1,0,0,time);
			place("shape147",cloudy_canvas,ctx,[0.0349578857421875,0.00140228271484375,-0.00140228271484375,0.0349578857421875,-93.25,159.2],ctrans.merge(new cxform(16,41,52,0,141,141,141,256)),1,0,0,time);
			place("shape147",cloudy_canvas,ctx,[0.0349578857421875,0.00140228271484375,-0.00140228271484375,0.0349578857421875,-14.35,159.8],ctrans.merge(new cxform(16,41,52,0,141,141,141,256)),1,0,0,time);
			place("shape147",cloudy_canvas,ctx,[0.0349578857421875,0.00140228271484375,-0.00140228271484375,0.0349578857421875,62.05,167.5],ctrans.merge(new cxform(16,41,52,0,141,141,141,256)),1,0,0,time);
			place("shape147",cloudy_canvas,ctx,[0.0349578857421875,0.00140228271484375,-0.00140228271484375,0.0349578857421875,165.45,199.8],ctrans.merge(new cxform(16,41,52,0,141,141,141,256)),1,0,0,time);
			place("shape149",cloudy_canvas,ctx,[0.05,0.0,0.0,0.05,-382.95,62.1],ctrans.merge(new cxform(16,41,52,0,141,141,141,256)),1,0,0,time);
			place("shape150",cloudy_canvas,ctx,[0.05,0.0,0.0,0.05,0.0,0.0],ctrans,1,0,0,time);
			place("sprite163",cloudy_canvas,ctx,[0.063568115234375,0.0,0.0,0.0716766357421875,45.15,-114.3],ctrans,1,(0+time)%20,0,time);
			break;
	}
	ctx.restore();
}

var frame = -1;
var time = 0;
var frames = [];
frames.push(0);

var backgroundColor = "#ffffff";
var originalWidth = 1153;
var originalHeight= 698;
function nextFrame(ctx,ctrans){
	var oldframe = frame;
	frame = (frame+1)%frames.length;
	if(frame==oldframe){time++;}else{time=0;};
	drawFrame();
}

function drawFrame(){
	ctx.fillStyle = backgroundColor;
	ctx.fillRect(0,0,cloudy_canvas.width,cloudy_canvas.height);
	ctx.save();
	ctx.transform(cloudy_canvas.width/originalWidth,0,0,cloudy_canvas.height/originalHeight,0,0);
	sprite164(ctx,ctrans,frames[frame],0,time);
	ctx.restore();
}

let frame_ctrl = null;
nextFrame(ctx, ctrans);

return {
    start: function(){
        frame_ctrl = window.setInterval(function(){nextFrame(ctx,ctrans);},33);
		cloudy_canvas.classList.add("show");
    },
    stop: function(){
        clearInterval(frame_ctrl);
		cloudy_canvas.classList.remove("show");
    },
	show: function(){
		cloudy_canvas.classList.add("show");
	}
}

})();