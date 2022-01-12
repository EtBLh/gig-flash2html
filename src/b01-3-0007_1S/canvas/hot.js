let hot_controller = (() => {

/**
 *  JPEXS Free Flash Decompiler Filters
 */

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
     var width = cloudy_canvas.width;
     var height = cloudy_canvas.height;
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

var hot_canvas=document.getElementById("hot");
var ctx=hot_canvas.getContext("2d");
enhanceContext(ctx);
var ctrans = new cxform(0,0,0,0,255,255,255,255);

var scalingGrids = {};
var boundRects = {};
function shape192(ctx,ctrans,frame,ratio,time){
	var pathData="M 2242 70 Q 2024 243 2087 347 2151 451 1850 496 1129 446 446 706 -237 965 127 2638 L 3129 3700 Q 3659 3884 4037 4312 4146 4435 4257 4506 L 4887 4506 Q 4983 4450 5079 4364 L 5076 4336 Q 5109 4426 5147 4506 L 7323 4506 Q 7413 4390 7481 4258 7812 3617 7619 3057 7427 2497 6536 2559 L 6547 2530 Q 6619 2277 6387 2247 L 6381 2232 Q 6474 2024 6384 1811 6226 1441 5833 1764 5792 1658 5721 1586 5420 1270 5178 1750 5061 1507 4765 1609 4130 1828 4180 2595 3945 2282 3584 2402 3680 2101 3580 1952 3477 1828 3321 1817 L 3268 1810 Q 3528 1792 3740 1607 3788 1566 3813 1512 3900 1328 3818 1158 3780 1084 3710 1047 3640 1013 3564 1001 3720 871 3791 679 3804 641 3809 601 3840 347 3668 205 L 3611 172 3489 180 3456 199 Q 3374 251 3309 334 3261 394 3225 460 3257 265 3159 184 2801 -114 2242 70";
	var grd=ctx.createLinearGradient(3784.75,1647.25,3191.25,3588.75);
	grd.addColorStop(0.0,tocolor(ctrans.apply([255,255,255,1])));
	grd.addColorStop(1.0,tocolor(ctrans.apply([255,255,255,0.0])));
	ctx.fillStyle = grd;
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
}

function sprite193(ctx,ctrans,frame,ratio,time){
	var clips = [];
	var frame_cnt = 74;
	frame = frame % frame_cnt;
	switch(frame){
		case 0:
			place("shape192",hot_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			place("shape192",hot_canvas,ctx,[-1.0999908447265625,0.0,0.0,1.0999908447265625,16688.0,387.0],ctrans,1,0,0,time);
			break;
		case 1:
			place("shape192",hot_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			place("shape192",hot_canvas,ctx,[-1.0999908447265625,0.0,0.0,1.0999908447265625,16688.0,426.0],ctrans,1,0,0,time);
			break;
		case 2:
			place("shape192",hot_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			place("shape192",hot_canvas,ctx,[-1.0999908447265625,0.0,0.0,1.0999908447265625,16688.0,464.0],ctrans,1,0,0,time);
			break;
		case 3:
			place("shape192",hot_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			place("shape192",hot_canvas,ctx,[-1.0999908447265625,0.0,0.0,1.0999908447265625,16688.0,503.0],ctrans,1,0,0,time);
			break;
		case 4:
			place("shape192",hot_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			place("shape192",hot_canvas,ctx,[-1.0999908447265625,0.0,0.0,1.0999908447265625,16688.0,541.0],ctrans,1,0,0,time);
			break;
		case 5:
			place("shape192",hot_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			place("shape192",hot_canvas,ctx,[-1.0999908447265625,0.0,0.0,1.0999908447265625,16688.0,579.0],ctrans,1,0,0,time);
			break;
		case 6:
			place("shape192",hot_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			place("shape192",hot_canvas,ctx,[-1.0999908447265625,0.0,0.0,1.0999908447265625,16688.0,617.0],ctrans,1,0,0,time);
			break;
		case 7:
			place("shape192",hot_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			place("shape192",hot_canvas,ctx,[-1.0999908447265625,0.0,0.0,1.0999908447265625,16688.0,655.0],ctrans,1,0,0,time);
			break;
		case 8:
			place("shape192",hot_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			place("shape192",hot_canvas,ctx,[-1.0999908447265625,0.0,0.0,1.0999908447265625,16688.0,693.0],ctrans,1,0,0,time);
			break;
		case 9:
			place("shape192",hot_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			place("shape192",hot_canvas,ctx,[-1.0999908447265625,0.0,0.0,1.0999908447265625,16688.0,732.0],ctrans,1,0,0,time);
			break;
		case 10:
			place("shape192",hot_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			place("shape192",hot_canvas,ctx,[-1.0999908447265625,0.0,0.0,1.0999908447265625,16688.0,770.0],ctrans,1,0,0,time);
			break;
		case 11:
			place("shape192",hot_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			place("shape192",hot_canvas,ctx,[-1.0999908447265625,0.0,0.0,1.0999908447265625,16688.0,808.0],ctrans,1,0,0,time);
			break;
		case 12:
			place("shape192",hot_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			place("shape192",hot_canvas,ctx,[-1.0999908447265625,0.0,0.0,1.0999908447265625,16688.0,846.0],ctrans,1,0,0,time);
			break;
		case 13:
			place("shape192",hot_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			place("shape192",hot_canvas,ctx,[-1.0999908447265625,0.0,0.0,1.0999908447265625,16688.0,884.0],ctrans,1,0,0,time);
			break;
		case 14:
			place("shape192",hot_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			place("shape192",hot_canvas,ctx,[-1.0999908447265625,0.0,0.0,1.0999908447265625,16688.0,922.0],ctrans,1,0,0,time);
			break;
		case 15:
			place("shape192",hot_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			place("shape192",hot_canvas,ctx,[-1.0999908447265625,0.0,0.0,1.0999908447265625,16688.0,961.0],ctrans,1,0,0,time);
			break;
		case 16:
			place("shape192",hot_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			place("shape192",hot_canvas,ctx,[-1.0999908447265625,0.0,0.0,1.0999908447265625,16688.0,999.0],ctrans,1,0,0,time);
			break;
		case 17:
			place("shape192",hot_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			place("shape192",hot_canvas,ctx,[-1.0999908447265625,0.0,0.0,1.0999908447265625,16688.0,1037.0],ctrans,1,0,0,time);
			break;
		case 18:
			place("shape192",hot_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			place("shape192",hot_canvas,ctx,[-1.0999908447265625,0.0,0.0,1.0999908447265625,16688.0,1075.0],ctrans,1,0,0,time);
			break;
		case 19:
			place("shape192",hot_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			place("shape192",hot_canvas,ctx,[-1.0999908447265625,0.0,0.0,1.0999908447265625,16688.0,1113.0],ctrans,1,0,0,time);
			break;
		case 20:
			place("shape192",hot_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			place("shape192",hot_canvas,ctx,[-1.0999908447265625,0.0,0.0,1.0999908447265625,16688.0,1151.0],ctrans,1,0,0,time);
			break;
		case 21:
			place("shape192",hot_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			place("shape192",hot_canvas,ctx,[-1.0999908447265625,0.0,0.0,1.0999908447265625,16688.0,1190.0],ctrans,1,0,0,time);
			break;
		case 22:
			place("shape192",hot_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			place("shape192",hot_canvas,ctx,[-1.0999908447265625,0.0,0.0,1.0999908447265625,16688.0,1228.0],ctrans,1,0,0,time);
			break;
		case 23:
			place("shape192",hot_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			place("shape192",hot_canvas,ctx,[-1.0999908447265625,0.0,0.0,1.0999908447265625,16688.0,1265.0],ctrans,1,0,0,time);
			break;
		case 24:
			place("shape192",hot_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,35.0],ctrans,1,0,0,time);
			place("shape192",hot_canvas,ctx,[-1.0999908447265625,0.0,0.0,1.0999908447265625,16688.0,1247.0],ctrans,1,0,0,time);
			break;
		case 25:
			place("shape192",hot_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,70.0],ctrans,1,0,0,time);
			place("shape192",hot_canvas,ctx,[-1.0999908447265625,0.0,0.0,1.0999908447265625,16688.0,1230.0],ctrans,1,0,0,time);
			break;
		case 26:
			place("shape192",hot_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,105.0],ctrans,1,0,0,time);
			place("shape192",hot_canvas,ctx,[-1.0999908447265625,0.0,0.0,1.0999908447265625,16688.0,1212.0],ctrans,1,0,0,time);
			break;
		case 27:
			place("shape192",hot_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,140.0],ctrans,1,0,0,time);
			place("shape192",hot_canvas,ctx,[-1.0999908447265625,0.0,0.0,1.0999908447265625,16688.0,1195.0],ctrans,1,0,0,time);
			break;
		case 28:
			place("shape192",hot_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,176.0],ctrans,1,0,0,time);
			place("shape192",hot_canvas,ctx,[-1.0999908447265625,0.0,0.0,1.0999908447265625,16688.0,1177.0],ctrans,1,0,0,time);
			break;
		case 29:
			place("shape192",hot_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,211.0],ctrans,1,0,0,time);
			place("shape192",hot_canvas,ctx,[-1.0999908447265625,0.0,0.0,1.0999908447265625,16688.0,1160.0],ctrans,1,0,0,time);
			break;
		case 30:
			place("shape192",hot_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,246.0],ctrans,1,0,0,time);
			place("shape192",hot_canvas,ctx,[-1.0999908447265625,0.0,0.0,1.0999908447265625,16688.0,1142.0],ctrans,1,0,0,time);
			break;
		case 31:
			place("shape192",hot_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,281.0],ctrans,1,0,0,time);
			place("shape192",hot_canvas,ctx,[-1.0999908447265625,0.0,0.0,1.0999908447265625,16688.0,1125.0],ctrans,1,0,0,time);
			break;
		case 32:
			place("shape192",hot_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,316.0],ctrans,1,0,0,time);
			place("shape192",hot_canvas,ctx,[-1.0999908447265625,0.0,0.0,1.0999908447265625,16688.0,1107.0],ctrans,1,0,0,time);
			break;
		case 33:
			place("shape192",hot_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,351.0],ctrans,1,0,0,time);
			place("shape192",hot_canvas,ctx,[-1.0999908447265625,0.0,0.0,1.0999908447265625,16688.0,1089.0],ctrans,1,0,0,time);
			break;
		case 34:
			place("shape192",hot_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,386.0],ctrans,1,0,0,time);
			place("shape192",hot_canvas,ctx,[-1.0999908447265625,0.0,0.0,1.0999908447265625,16688.0,1072.0],ctrans,1,0,0,time);
			break;
		case 35:
			place("shape192",hot_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,421.0],ctrans,1,0,0,time);
			place("shape192",hot_canvas,ctx,[-1.0999908447265625,0.0,0.0,1.0999908447265625,16688.0,1054.0],ctrans,1,0,0,time);
			break;
		case 36:
			place("shape192",hot_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,457.0],ctrans,1,0,0,time);
			place("shape192",hot_canvas,ctx,[-1.0999908447265625,0.0,0.0,1.0999908447265625,16688.0,1037.0],ctrans,1,0,0,time);
			break;
		case 37:
			place("shape192",hot_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,492.0],ctrans,1,0,0,time);
			place("shape192",hot_canvas,ctx,[-1.0999908447265625,0.0,0.0,1.0999908447265625,16688.0,1019.0],ctrans,1,0,0,time);
			break;
		case 38:
			place("shape192",hot_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,527.0],ctrans,1,0,0,time);
			place("shape192",hot_canvas,ctx,[-1.0999908447265625,0.0,0.0,1.0999908447265625,16688.0,1002.0],ctrans,1,0,0,time);
			break;
		case 39:
			place("shape192",hot_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,562.0],ctrans,1,0,0,time);
			place("shape192",hot_canvas,ctx,[-1.0999908447265625,0.0,0.0,1.0999908447265625,16688.0,984.0],ctrans,1,0,0,time);
			break;
		case 40:
			place("shape192",hot_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,597.0],ctrans,1,0,0,time);
			place("shape192",hot_canvas,ctx,[-1.0999908447265625,0.0,0.0,1.0999908447265625,16688.0,966.0],ctrans,1,0,0,time);
			break;
		case 41:
			place("shape192",hot_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,632.0],ctrans,1,0,0,time);
			place("shape192",hot_canvas,ctx,[-1.0999908447265625,0.0,0.0,1.0999908447265625,16688.0,949.0],ctrans,1,0,0,time);
			break;
		case 42:
			place("shape192",hot_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,667.0],ctrans,1,0,0,time);
			place("shape192",hot_canvas,ctx,[-1.0999908447265625,0.0,0.0,1.0999908447265625,16688.0,931.0],ctrans,1,0,0,time);
			break;
		case 43:
			place("shape192",hot_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,702.0],ctrans,1,0,0,time);
			place("shape192",hot_canvas,ctx,[-1.0999908447265625,0.0,0.0,1.0999908447265625,16688.0,914.0],ctrans,1,0,0,time);
			break;
		case 44:
			place("shape192",hot_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,738.0],ctrans,1,0,0,time);
			place("shape192",hot_canvas,ctx,[-1.0999908447265625,0.0,0.0,1.0999908447265625,16688.0,896.0],ctrans,1,0,0,time);
			break;
		case 45:
			place("shape192",hot_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,773.0],ctrans,1,0,0,time);
			place("shape192",hot_canvas,ctx,[-1.0999908447265625,0.0,0.0,1.0999908447265625,16688.0,879.0],ctrans,1,0,0,time);
			break;
		case 46:
			place("shape192",hot_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,808.0],ctrans,1,0,0,time);
			place("shape192",hot_canvas,ctx,[-1.0999908447265625,0.0,0.0,1.0999908447265625,16688.0,861.0],ctrans,1,0,0,time);
			break;
		case 47:
			place("shape192",hot_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,843.0],ctrans,1,0,0,time);
			place("shape192",hot_canvas,ctx,[-1.0999908447265625,0.0,0.0,1.0999908447265625,16688.0,844.0],ctrans,1,0,0,time);
			break;
		case 48:
			place("shape192",hot_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,878.0],ctrans,1,0,0,time);
			place("shape192",hot_canvas,ctx,[-1.0999908447265625,0.0,0.0,1.0999908447265625,16688.0,826.0],ctrans,1,0,0,time);
			break;
		case 49:
			place("shape192",hot_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,843.0],ctrans,1,0,0,time);
			place("shape192",hot_canvas,ctx,[-1.0999908447265625,0.0,0.0,1.0999908447265625,16688.0,808.0],ctrans,1,0,0,time);
			break;
		case 50:
			place("shape192",hot_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,808.0],ctrans,1,0,0,time);
			place("shape192",hot_canvas,ctx,[-1.0999908447265625,0.0,0.0,1.0999908447265625,16688.0,791.0],ctrans,1,0,0,time);
			break;
		case 51:
			place("shape192",hot_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,773.0],ctrans,1,0,0,time);
			place("shape192",hot_canvas,ctx,[-1.0999908447265625,0.0,0.0,1.0999908447265625,16688.0,773.0],ctrans,1,0,0,time);
			break;
		case 52:
			place("shape192",hot_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,738.0],ctrans,1,0,0,time);
			place("shape192",hot_canvas,ctx,[-1.0999908447265625,0.0,0.0,1.0999908447265625,16688.0,756.0],ctrans,1,0,0,time);
			break;
		case 53:
			place("shape192",hot_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,702.0],ctrans,1,0,0,time);
			place("shape192",hot_canvas,ctx,[-1.0999908447265625,0.0,0.0,1.0999908447265625,16688.0,738.0],ctrans,1,0,0,time);
			break;
		case 54:
			place("shape192",hot_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,667.0],ctrans,1,0,0,time);
			place("shape192",hot_canvas,ctx,[-1.0999908447265625,0.0,0.0,1.0999908447265625,16688.0,721.0],ctrans,1,0,0,time);
			break;
		case 55:
			place("shape192",hot_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,632.0],ctrans,1,0,0,time);
			place("shape192",hot_canvas,ctx,[-1.0999908447265625,0.0,0.0,1.0999908447265625,16688.0,703.0],ctrans,1,0,0,time);
			break;
		case 56:
			place("shape192",hot_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,597.0],ctrans,1,0,0,time);
			place("shape192",hot_canvas,ctx,[-1.0999908447265625,0.0,0.0,1.0999908447265625,16688.0,686.0],ctrans,1,0,0,time);
			break;
		case 57:
			place("shape192",hot_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,562.0],ctrans,1,0,0,time);
			place("shape192",hot_canvas,ctx,[-1.0999908447265625,0.0,0.0,1.0999908447265625,16688.0,668.0],ctrans,1,0,0,time);
			break;
		case 58:
			place("shape192",hot_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,527.0],ctrans,1,0,0,time);
			place("shape192",hot_canvas,ctx,[-1.0999908447265625,0.0,0.0,1.0999908447265625,16688.0,650.0],ctrans,1,0,0,time);
			break;
		case 59:
			place("shape192",hot_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,492.0],ctrans,1,0,0,time);
			place("shape192",hot_canvas,ctx,[-1.0999908447265625,0.0,0.0,1.0999908447265625,16688.0,633.0],ctrans,1,0,0,time);
			break;
		case 60:
			place("shape192",hot_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,457.0],ctrans,1,0,0,time);
			place("shape192",hot_canvas,ctx,[-1.0999908447265625,0.0,0.0,1.0999908447265625,16688.0,615.0],ctrans,1,0,0,time);
			break;
		case 61:
			place("shape192",hot_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,421.0],ctrans,1,0,0,time);
			place("shape192",hot_canvas,ctx,[-1.0999908447265625,0.0,0.0,1.0999908447265625,16688.0,598.0],ctrans,1,0,0,time);
			break;
		case 62:
			place("shape192",hot_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,386.0],ctrans,1,0,0,time);
			place("shape192",hot_canvas,ctx,[-1.0999908447265625,0.0,0.0,1.0999908447265625,16688.0,580.0],ctrans,1,0,0,time);
			break;
		case 63:
			place("shape192",hot_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,351.0],ctrans,1,0,0,time);
			place("shape192",hot_canvas,ctx,[-1.0999908447265625,0.0,0.0,1.0999908447265625,16688.0,563.0],ctrans,1,0,0,time);
			break;
		case 64:
			place("shape192",hot_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,316.0],ctrans,1,0,0,time);
			place("shape192",hot_canvas,ctx,[-1.0999908447265625,0.0,0.0,1.0999908447265625,16688.0,545.0],ctrans,1,0,0,time);
			break;
		case 65:
			place("shape192",hot_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,281.0],ctrans,1,0,0,time);
			place("shape192",hot_canvas,ctx,[-1.0999908447265625,0.0,0.0,1.0999908447265625,16688.0,527.0],ctrans,1,0,0,time);
			break;
		case 66:
			place("shape192",hot_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,246.0],ctrans,1,0,0,time);
			place("shape192",hot_canvas,ctx,[-1.0999908447265625,0.0,0.0,1.0999908447265625,16688.0,510.0],ctrans,1,0,0,time);
			break;
		case 67:
			place("shape192",hot_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,211.0],ctrans,1,0,0,time);
			place("shape192",hot_canvas,ctx,[-1.0999908447265625,0.0,0.0,1.0999908447265625,16688.0,492.0],ctrans,1,0,0,time);
			break;
		case 68:
			place("shape192",hot_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,176.0],ctrans,1,0,0,time);
			place("shape192",hot_canvas,ctx,[-1.0999908447265625,0.0,0.0,1.0999908447265625,16688.0,475.0],ctrans,1,0,0,time);
			break;
		case 69:
			place("shape192",hot_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,140.0],ctrans,1,0,0,time);
			place("shape192",hot_canvas,ctx,[-1.0999908447265625,0.0,0.0,1.0999908447265625,16688.0,457.0],ctrans,1,0,0,time);
			break;
		case 70:
			place("shape192",hot_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,105.0],ctrans,1,0,0,time);
			place("shape192",hot_canvas,ctx,[-1.0999908447265625,0.0,0.0,1.0999908447265625,16688.0,440.0],ctrans,1,0,0,time);
			break;
		case 71:
			place("shape192",hot_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,70.0],ctrans,1,0,0,time);
			place("shape192",hot_canvas,ctx,[-1.0999908447265625,0.0,0.0,1.0999908447265625,16688.0,422.0],ctrans,1,0,0,time);
			break;
		case 72:
			place("shape192",hot_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,35.0],ctrans,1,0,0,time);
			place("shape192",hot_canvas,ctx,[-1.0999908447265625,0.0,0.0,1.0999908447265625,16688.0,405.0],ctrans,1,0,0,time);
			break;
		case 73:
			place("shape192",hot_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			place("shape192",hot_canvas,ctx,[-1.0999908447265625,0.0,0.0,1.0999908447265625,16688.0,387.0],ctrans,1,0,0,time);
			break;
	}
}

function morphshape194(ctx,ctrans,frame,ratio,time){
	var pathData="M -458 -524 19 -25 Q -260 -314 -94 153 -190 -264 -19 46 -121 -214 56 -61 -66 -112 64 -109 -12 -11 72 -158 87 105 3 -57 185 220 -66 44 254 268 -66 114 335 315 -66 184 404 389 -3 121 L 458 443 59 59";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([Math.round(255+ratio*(0)/65535),Math.round(102+ratio*(0)/65535),Math.round(0+ratio*(1)/65535),((Math.round(255+ratio*(0)/65535))/255)]));
	ctx.lineWidth=2.0+ratio*(0)/65535;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawMorphPath(ctx,pathData,ratio,true,scaleMode);

}

function morphshape195(ctx,ctrans,frame,ratio,time){
	var pathData="M -524 -465 -25 15 Q -314 -265 153 -69 -264 -197 46 -12 -214 -130 -61 44 -112 -71 -109 47 -11 -12 -158 49 105 89 -57 -3 220 189 44 -55 268 255 114 -48 315 333 184 -41 389 402 121 9 L 443 456 59 59";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([Math.round(255+ratio*(0)/65535),Math.round(102+ratio*(0)/65535),Math.round(0+ratio*(1)/65535),((Math.round(255+ratio*(0)/65535))/255)]));
	ctx.lineWidth=2.0+ratio*(0)/65535;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawMorphPath(ctx,pathData,ratio,true,scaleMode);

}

function shape196(ctx,ctrans,frame,ratio,time){
	var pathData="M -465 15 Q -265 -69 -197 -12 -130 44 -71 47 -12 49 89 -3 189 -55 255 -48 333 -41 402 9 L 456 59";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([255,102,0,1]));
	ctx.lineWidth=2.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

}

function sprite197(ctx,ctrans,frame,ratio,time){
	var clips = [];
	var frame_cnt = 17;
	frame = frame % frame_cnt;
	switch(frame){
		case 0:
			place("morphshape194",hot_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
		case 1:
			place("morphshape194",hot_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,9362,time);
			break;
		case 2:
			place("morphshape194",hot_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,18725,time);
			break;
		case 3:
			place("morphshape194",hot_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,28087,time);
			break;
		case 4:
			place("morphshape194",hot_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,37449,time);
			break;
		case 5:
			place("morphshape194",hot_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,46811,time);
			break;
		case 6:
			place("morphshape194",hot_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,56174,time);
			break;
		case 7:
			place("morphshape195",hot_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
		case 8:
			place("morphshape195",hot_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,7282,time);
			break;
		case 9:
			place("morphshape195",hot_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,14564,time);
			break;
		case 10:
			place("morphshape195",hot_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,21845,time);
			break;
		case 11:
			place("morphshape195",hot_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,29127,time);
			break;
		case 12:
			place("morphshape195",hot_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,36409,time);
			break;
		case 13:
			place("morphshape195",hot_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,43691,time);
			break;
		case 14:
			place("morphshape195",hot_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,50972,time);
			break;
		case 15:
			place("morphshape195",hot_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,58254,time);
			break;
		case 16:
			place("shape196",hot_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
	}
}

function sprite198(ctx,ctrans,frame,ratio,time){
	var clips = [];
	var frame_cnt = 20;
	frame = frame % frame_cnt;
	switch(frame){
		case 0:
			place("sprite197",hot_canvas,ctx,[1.0,0.0,0.0,1.0,-1580.0,-256.0],ctrans,1,(0+time)%17,0,time);
			place("sprite197",hot_canvas,ctx,[0.8618316650390625,-0.504364013671875,0.504364013671875,0.8618316650390625,-1388.0,493.0],ctrans,1,(0+time)%17,0,time);
			place("sprite197",hot_canvas,ctx,[0.61224365234375,-0.7886505126953125,0.7886505126953125,0.61224365234375,-943.0,1181.0],ctrans,1,(0+time)%17,0,time);
			place("sprite197",hot_canvas,ctx,[0.763916015625,0.6428070068359375,-0.6428070068359375,0.763916015625,-1095.0,-1060.0],ctrans,1,(0+time)%17,0,time);
			place("sprite197",hot_canvas,ctx,[0.1050872802734375,0.994110107421875,-0.994110107421875,0.1050872802734375,-35.0,-1490.0],ctrans,1,(0+time)%17,0,time);
			place("sprite197",hot_canvas,ctx,[-0.99102783203125,-0.108184814453125,0.108184814453125,-0.99102783203125,1589.0,355.0],ctrans,1,(0+time)%17,0,time);
			place("sprite197",hot_canvas,ctx,[-0.9086456298828125,0.4066009521484375,-0.4066009521484375,-0.9086456298828125,1479.0,-408.0],ctrans,1,(0+time)%17,0,time);
			place("sprite197",hot_canvas,ctx,[-0.6920623779296875,0.71533203125,-0.71533203125,-0.6920623779296875,1351.0,-1299.0],ctrans,1,(0+time)%17,0,time);
			place("sprite197",hot_canvas,ctx,[-0.687530517578125,-0.719696044921875,0.719696044921875,-0.687530517578125,1021.0,1100.0],ctrans,1,(0+time)%17,0,time);
			place("sprite197",hot_canvas,ctx,[-0.1705322265625,-0.981292724609375,0.981292724609375,-0.1705322265625,103.0,1505.0],ctrans,1,(0+time)%17,0,time);
			break;
		case 1:
			place("sprite197",hot_canvas,ctx,[1.0,0.0,0.0,1.0,-1580.0,-256.0],ctrans,1,(1+time)%17,0,time);
			place("sprite197",hot_canvas,ctx,[0.8618316650390625,-0.504364013671875,0.504364013671875,0.8618316650390625,-1388.0,493.0],ctrans,1,(1+time)%17,0,time);
			place("sprite197",hot_canvas,ctx,[0.61224365234375,-0.7886505126953125,0.7886505126953125,0.61224365234375,-943.0,1181.0],ctrans,1,(1+time)%17,0,time);
			place("sprite197",hot_canvas,ctx,[0.763916015625,0.6428070068359375,-0.6428070068359375,0.763916015625,-1095.0,-1060.0],ctrans,1,(1+time)%17,0,time);
			place("sprite197",hot_canvas,ctx,[0.1050872802734375,0.994110107421875,-0.994110107421875,0.1050872802734375,-35.0,-1490.0],ctrans,1,(1+time)%17,0,time);
			place("sprite197",hot_canvas,ctx,[-0.99102783203125,-0.108184814453125,0.108184814453125,-0.99102783203125,1589.0,355.0],ctrans,1,(1+time)%17,0,time);
			place("sprite197",hot_canvas,ctx,[-0.9086456298828125,0.4066009521484375,-0.4066009521484375,-0.9086456298828125,1479.0,-408.0],ctrans,1,(1+time)%17,0,time);
			place("sprite197",hot_canvas,ctx,[-0.6920623779296875,0.71533203125,-0.71533203125,-0.6920623779296875,1351.0,-1299.0],ctrans,1,(1+time)%17,0,time);
			place("sprite197",hot_canvas,ctx,[-0.687530517578125,-0.719696044921875,0.719696044921875,-0.687530517578125,1021.0,1100.0],ctrans,1,(1+time)%17,0,time);
			place("sprite197",hot_canvas,ctx,[-0.1705322265625,-0.981292724609375,0.981292724609375,-0.1705322265625,103.0,1505.0],ctrans,1,(1+time)%17,0,time);
			break;
		case 2:
			place("sprite197",hot_canvas,ctx,[1.0,0.0,0.0,1.0,-1580.0,-256.0],ctrans,1,(2+time)%17,0,time);
			place("sprite197",hot_canvas,ctx,[0.8618316650390625,-0.504364013671875,0.504364013671875,0.8618316650390625,-1388.0,493.0],ctrans,1,(2+time)%17,0,time);
			place("sprite197",hot_canvas,ctx,[0.61224365234375,-0.7886505126953125,0.7886505126953125,0.61224365234375,-943.0,1181.0],ctrans,1,(2+time)%17,0,time);
			place("sprite197",hot_canvas,ctx,[0.763916015625,0.6428070068359375,-0.6428070068359375,0.763916015625,-1095.0,-1060.0],ctrans,1,(2+time)%17,0,time);
			place("sprite197",hot_canvas,ctx,[0.1050872802734375,0.994110107421875,-0.994110107421875,0.1050872802734375,-35.0,-1490.0],ctrans,1,(2+time)%17,0,time);
			place("sprite197",hot_canvas,ctx,[-0.99102783203125,-0.108184814453125,0.108184814453125,-0.99102783203125,1589.0,355.0],ctrans,1,(2+time)%17,0,time);
			place("sprite197",hot_canvas,ctx,[-0.9086456298828125,0.4066009521484375,-0.4066009521484375,-0.9086456298828125,1479.0,-408.0],ctrans,1,(2+time)%17,0,time);
			place("sprite197",hot_canvas,ctx,[-0.6920623779296875,0.71533203125,-0.71533203125,-0.6920623779296875,1351.0,-1299.0],ctrans,1,(2+time)%17,0,time);
			place("sprite197",hot_canvas,ctx,[-0.687530517578125,-0.719696044921875,0.719696044921875,-0.687530517578125,1021.0,1100.0],ctrans,1,(2+time)%17,0,time);
			place("sprite197",hot_canvas,ctx,[-0.1705322265625,-0.981292724609375,0.981292724609375,-0.1705322265625,103.0,1505.0],ctrans,1,(2+time)%17,0,time);
			break;
		case 3:
			place("sprite197",hot_canvas,ctx,[1.0,0.0,0.0,1.0,-1580.0,-256.0],ctrans,1,(3+time)%17,0,time);
			place("sprite197",hot_canvas,ctx,[0.8618316650390625,-0.504364013671875,0.504364013671875,0.8618316650390625,-1388.0,493.0],ctrans,1,(3+time)%17,0,time);
			place("sprite197",hot_canvas,ctx,[0.61224365234375,-0.7886505126953125,0.7886505126953125,0.61224365234375,-943.0,1181.0],ctrans,1,(3+time)%17,0,time);
			place("sprite197",hot_canvas,ctx,[0.763916015625,0.6428070068359375,-0.6428070068359375,0.763916015625,-1095.0,-1060.0],ctrans,1,(3+time)%17,0,time);
			place("sprite197",hot_canvas,ctx,[0.1050872802734375,0.994110107421875,-0.994110107421875,0.1050872802734375,-35.0,-1490.0],ctrans,1,(3+time)%17,0,time);
			place("sprite197",hot_canvas,ctx,[-0.99102783203125,-0.108184814453125,0.108184814453125,-0.99102783203125,1589.0,355.0],ctrans,1,(3+time)%17,0,time);
			place("sprite197",hot_canvas,ctx,[-0.9086456298828125,0.4066009521484375,-0.4066009521484375,-0.9086456298828125,1479.0,-408.0],ctrans,1,(3+time)%17,0,time);
			place("sprite197",hot_canvas,ctx,[-0.6920623779296875,0.71533203125,-0.71533203125,-0.6920623779296875,1351.0,-1299.0],ctrans,1,(3+time)%17,0,time);
			place("sprite197",hot_canvas,ctx,[-0.687530517578125,-0.719696044921875,0.719696044921875,-0.687530517578125,1021.0,1100.0],ctrans,1,(3+time)%17,0,time);
			place("sprite197",hot_canvas,ctx,[-0.1705322265625,-0.981292724609375,0.981292724609375,-0.1705322265625,103.0,1505.0],ctrans,1,(3+time)%17,0,time);
			break;
		case 4:
			place("sprite197",hot_canvas,ctx,[1.0,0.0,0.0,1.0,-1580.0,-256.0],ctrans,1,(4+time)%17,0,time);
			place("sprite197",hot_canvas,ctx,[0.8618316650390625,-0.504364013671875,0.504364013671875,0.8618316650390625,-1388.0,493.0],ctrans,1,(4+time)%17,0,time);
			place("sprite197",hot_canvas,ctx,[0.61224365234375,-0.7886505126953125,0.7886505126953125,0.61224365234375,-943.0,1181.0],ctrans,1,(4+time)%17,0,time);
			place("sprite197",hot_canvas,ctx,[0.763916015625,0.6428070068359375,-0.6428070068359375,0.763916015625,-1095.0,-1060.0],ctrans,1,(4+time)%17,0,time);
			place("sprite197",hot_canvas,ctx,[0.1050872802734375,0.994110107421875,-0.994110107421875,0.1050872802734375,-35.0,-1490.0],ctrans,1,(4+time)%17,0,time);
			place("sprite197",hot_canvas,ctx,[-0.99102783203125,-0.108184814453125,0.108184814453125,-0.99102783203125,1589.0,355.0],ctrans,1,(4+time)%17,0,time);
			place("sprite197",hot_canvas,ctx,[-0.9086456298828125,0.4066009521484375,-0.4066009521484375,-0.9086456298828125,1479.0,-408.0],ctrans,1,(4+time)%17,0,time);
			place("sprite197",hot_canvas,ctx,[-0.6920623779296875,0.71533203125,-0.71533203125,-0.6920623779296875,1351.0,-1299.0],ctrans,1,(4+time)%17,0,time);
			place("sprite197",hot_canvas,ctx,[-0.687530517578125,-0.719696044921875,0.719696044921875,-0.687530517578125,1021.0,1100.0],ctrans,1,(4+time)%17,0,time);
			place("sprite197",hot_canvas,ctx,[-0.1705322265625,-0.981292724609375,0.981292724609375,-0.1705322265625,103.0,1505.0],ctrans,1,(4+time)%17,0,time);
			break;
		case 5:
			place("sprite197",hot_canvas,ctx,[1.0,0.0,0.0,1.0,-1580.0,-256.0],ctrans,1,(5+time)%17,0,time);
			place("sprite197",hot_canvas,ctx,[0.8618316650390625,-0.504364013671875,0.504364013671875,0.8618316650390625,-1388.0,493.0],ctrans,1,(5+time)%17,0,time);
			place("sprite197",hot_canvas,ctx,[0.61224365234375,-0.7886505126953125,0.7886505126953125,0.61224365234375,-943.0,1181.0],ctrans,1,(5+time)%17,0,time);
			place("sprite197",hot_canvas,ctx,[0.763916015625,0.6428070068359375,-0.6428070068359375,0.763916015625,-1095.0,-1060.0],ctrans,1,(5+time)%17,0,time);
			place("sprite197",hot_canvas,ctx,[0.1050872802734375,0.994110107421875,-0.994110107421875,0.1050872802734375,-35.0,-1490.0],ctrans,1,(5+time)%17,0,time);
			place("sprite197",hot_canvas,ctx,[-0.99102783203125,-0.108184814453125,0.108184814453125,-0.99102783203125,1589.0,355.0],ctrans,1,(5+time)%17,0,time);
			place("sprite197",hot_canvas,ctx,[-0.9086456298828125,0.4066009521484375,-0.4066009521484375,-0.9086456298828125,1479.0,-408.0],ctrans,1,(5+time)%17,0,time);
			place("sprite197",hot_canvas,ctx,[-0.6920623779296875,0.71533203125,-0.71533203125,-0.6920623779296875,1351.0,-1299.0],ctrans,1,(5+time)%17,0,time);
			place("sprite197",hot_canvas,ctx,[-0.687530517578125,-0.719696044921875,0.719696044921875,-0.687530517578125,1021.0,1100.0],ctrans,1,(5+time)%17,0,time);
			place("sprite197",hot_canvas,ctx,[-0.1705322265625,-0.981292724609375,0.981292724609375,-0.1705322265625,103.0,1505.0],ctrans,1,(5+time)%17,0,time);
			break;
		case 6:
			place("sprite197",hot_canvas,ctx,[1.0,0.0,0.0,1.0,-1580.0,-256.0],ctrans,1,(6+time)%17,0,time);
			place("sprite197",hot_canvas,ctx,[0.8618316650390625,-0.504364013671875,0.504364013671875,0.8618316650390625,-1388.0,493.0],ctrans,1,(6+time)%17,0,time);
			place("sprite197",hot_canvas,ctx,[0.61224365234375,-0.7886505126953125,0.7886505126953125,0.61224365234375,-943.0,1181.0],ctrans,1,(6+time)%17,0,time);
			place("sprite197",hot_canvas,ctx,[0.763916015625,0.6428070068359375,-0.6428070068359375,0.763916015625,-1095.0,-1060.0],ctrans,1,(6+time)%17,0,time);
			place("sprite197",hot_canvas,ctx,[0.1050872802734375,0.994110107421875,-0.994110107421875,0.1050872802734375,-35.0,-1490.0],ctrans,1,(6+time)%17,0,time);
			place("sprite197",hot_canvas,ctx,[-0.99102783203125,-0.108184814453125,0.108184814453125,-0.99102783203125,1589.0,355.0],ctrans,1,(6+time)%17,0,time);
			place("sprite197",hot_canvas,ctx,[-0.9086456298828125,0.4066009521484375,-0.4066009521484375,-0.9086456298828125,1479.0,-408.0],ctrans,1,(6+time)%17,0,time);
			place("sprite197",hot_canvas,ctx,[-0.6920623779296875,0.71533203125,-0.71533203125,-0.6920623779296875,1351.0,-1299.0],ctrans,1,(6+time)%17,0,time);
			place("sprite197",hot_canvas,ctx,[-0.687530517578125,-0.719696044921875,0.719696044921875,-0.687530517578125,1021.0,1100.0],ctrans,1,(6+time)%17,0,time);
			place("sprite197",hot_canvas,ctx,[-0.1705322265625,-0.981292724609375,0.981292724609375,-0.1705322265625,103.0,1505.0],ctrans,1,(6+time)%17,0,time);
			break;
		case 7:
			place("sprite197",hot_canvas,ctx,[1.0,0.0,0.0,1.0,-1580.0,-256.0],ctrans,1,(7+time)%17,0,time);
			place("sprite197",hot_canvas,ctx,[0.8618316650390625,-0.504364013671875,0.504364013671875,0.8618316650390625,-1388.0,493.0],ctrans,1,(7+time)%17,0,time);
			place("sprite197",hot_canvas,ctx,[0.61224365234375,-0.7886505126953125,0.7886505126953125,0.61224365234375,-943.0,1181.0],ctrans,1,(7+time)%17,0,time);
			place("sprite197",hot_canvas,ctx,[0.763916015625,0.6428070068359375,-0.6428070068359375,0.763916015625,-1095.0,-1060.0],ctrans,1,(7+time)%17,0,time);
			place("sprite197",hot_canvas,ctx,[0.1050872802734375,0.994110107421875,-0.994110107421875,0.1050872802734375,-35.0,-1490.0],ctrans,1,(7+time)%17,0,time);
			place("sprite197",hot_canvas,ctx,[-0.99102783203125,-0.108184814453125,0.108184814453125,-0.99102783203125,1589.0,355.0],ctrans,1,(7+time)%17,0,time);
			place("sprite197",hot_canvas,ctx,[-0.9086456298828125,0.4066009521484375,-0.4066009521484375,-0.9086456298828125,1479.0,-408.0],ctrans,1,(7+time)%17,0,time);
			place("sprite197",hot_canvas,ctx,[-0.6920623779296875,0.71533203125,-0.71533203125,-0.6920623779296875,1351.0,-1299.0],ctrans,1,(7+time)%17,0,time);
			place("sprite197",hot_canvas,ctx,[-0.687530517578125,-0.719696044921875,0.719696044921875,-0.687530517578125,1021.0,1100.0],ctrans,1,(7+time)%17,0,time);
			place("sprite197",hot_canvas,ctx,[-0.1705322265625,-0.981292724609375,0.981292724609375,-0.1705322265625,103.0,1505.0],ctrans,1,(7+time)%17,0,time);
			break;
		case 8:
			place("sprite197",hot_canvas,ctx,[1.0,0.0,0.0,1.0,-1580.0,-256.0],ctrans,1,(8+time)%17,0,time);
			place("sprite197",hot_canvas,ctx,[0.8618316650390625,-0.504364013671875,0.504364013671875,0.8618316650390625,-1388.0,493.0],ctrans,1,(8+time)%17,0,time);
			place("sprite197",hot_canvas,ctx,[0.61224365234375,-0.7886505126953125,0.7886505126953125,0.61224365234375,-943.0,1181.0],ctrans,1,(8+time)%17,0,time);
			place("sprite197",hot_canvas,ctx,[0.763916015625,0.6428070068359375,-0.6428070068359375,0.763916015625,-1095.0,-1060.0],ctrans,1,(8+time)%17,0,time);
			place("sprite197",hot_canvas,ctx,[0.1050872802734375,0.994110107421875,-0.994110107421875,0.1050872802734375,-35.0,-1490.0],ctrans,1,(8+time)%17,0,time);
			place("sprite197",hot_canvas,ctx,[-0.99102783203125,-0.108184814453125,0.108184814453125,-0.99102783203125,1589.0,355.0],ctrans,1,(8+time)%17,0,time);
			place("sprite197",hot_canvas,ctx,[-0.9086456298828125,0.4066009521484375,-0.4066009521484375,-0.9086456298828125,1479.0,-408.0],ctrans,1,(8+time)%17,0,time);
			place("sprite197",hot_canvas,ctx,[-0.6920623779296875,0.71533203125,-0.71533203125,-0.6920623779296875,1351.0,-1299.0],ctrans,1,(8+time)%17,0,time);
			place("sprite197",hot_canvas,ctx,[-0.687530517578125,-0.719696044921875,0.719696044921875,-0.687530517578125,1021.0,1100.0],ctrans,1,(8+time)%17,0,time);
			place("sprite197",hot_canvas,ctx,[-0.1705322265625,-0.981292724609375,0.981292724609375,-0.1705322265625,103.0,1505.0],ctrans,1,(8+time)%17,0,time);
			break;
		case 9:
			place("sprite197",hot_canvas,ctx,[0.965057373046875,-0.25885009765625,0.25885009765625,0.965057373046875,-1593.0,164.0],ctrans,1,(9+time)%17,0,time);
			place("sprite197",hot_canvas,ctx,[0.7011566162109375,-0.7098236083984375,0.7098236083984375,0.7011566162109375,-1213.0,837.0],ctrans,1,(9+time)%17,0,time);
			place("sprite197",hot_canvas,ctx,[0.3867034912109375,-0.9195709228515625,0.9195709228515625,0.3867034912109375,-606.0,1386.0],ctrans,1,(9+time)%17,0,time);
			place("sprite197",hot_canvas,ctx,[0.90362548828125,0.422607421875,-0.422607421875,0.90362548828125,-1333.0,-738.0],ctrans,1,(9+time)%17,0,time);
			place("sprite197",hot_canvas,ctx,[0.358734130859375,0.932159423828125,-0.932159423828125,0.358734130859375,-422.0,-1427.0],ctrans,1,(9+time)%17,0,time);
			place("sprite197",hot_canvas,ctx,[-0.984405517578125,0.152130126953125,-0.152130126953125,-0.984405517578125,1623.0,-66.0],ctrans,1,(9+time)%17,0,time);
			place("sprite197",hot_canvas,ctx,[-0.771636962890625,0.627593994140625,-0.627593994140625,-0.771636962890625,1319.0,-775.0],ctrans,1,(9+time)%17,0,time);
			place("sprite197",hot_canvas,ctx,[-0.4827117919921875,0.869476318359375,-0.869476318359375,-0.4827117919921875,966.0,-1602.0],ctrans,1,(9+time)%17,0,time);
			place("sprite197",hot_canvas,ctx,[-0.8498077392578125,-0.5165863037109375,0.5165863037109375,-0.8498077392578125,1268.0,800.0],ctrans,1,(9+time)%17,0,time);
			place("sprite197",hot_canvas,ctx,[-0.4185791015625,-0.902862548828125,0.902862548828125,-0.4185791015625,487.0,1427.0],ctrans,1,(9+time)%17,0,time);
			break;
		case 10:
			place("sprite197",hot_canvas,ctx,[0.965057373046875,-0.25885009765625,0.25885009765625,0.965057373046875,-1593.0,164.0],ctrans,1,(10+time)%17,0,time);
			place("sprite197",hot_canvas,ctx,[0.7011566162109375,-0.7098236083984375,0.7098236083984375,0.7011566162109375,-1213.0,837.0],ctrans,1,(10+time)%17,0,time);
			place("sprite197",hot_canvas,ctx,[0.3867034912109375,-0.9195709228515625,0.9195709228515625,0.3867034912109375,-606.0,1386.0],ctrans,1,(10+time)%17,0,time);
			place("sprite197",hot_canvas,ctx,[0.90362548828125,0.422607421875,-0.422607421875,0.90362548828125,-1333.0,-738.0],ctrans,1,(10+time)%17,0,time);
			place("sprite197",hot_canvas,ctx,[0.358734130859375,0.932159423828125,-0.932159423828125,0.358734130859375,-422.0,-1427.0],ctrans,1,(10+time)%17,0,time);
			place("sprite197",hot_canvas,ctx,[-0.984405517578125,0.152130126953125,-0.152130126953125,-0.984405517578125,1623.0,-66.0],ctrans,1,(10+time)%17,0,time);
			place("sprite197",hot_canvas,ctx,[-0.771636962890625,0.627593994140625,-0.627593994140625,-0.771636962890625,1319.0,-775.0],ctrans,1,(10+time)%17,0,time);
			place("sprite197",hot_canvas,ctx,[-0.4827117919921875,0.869476318359375,-0.869476318359375,-0.4827117919921875,966.0,-1602.0],ctrans,1,(10+time)%17,0,time);
			place("sprite197",hot_canvas,ctx,[-0.8498077392578125,-0.5165863037109375,0.5165863037109375,-0.8498077392578125,1268.0,800.0],ctrans,1,(10+time)%17,0,time);
			place("sprite197",hot_canvas,ctx,[-0.4185791015625,-0.902862548828125,0.902862548828125,-0.4185791015625,487.0,1427.0],ctrans,1,(10+time)%17,0,time);
			break;
		case 11:
			place("sprite197",hot_canvas,ctx,[0.965057373046875,-0.25885009765625,0.25885009765625,0.965057373046875,-1593.0,164.0],ctrans,1,(11+time)%17,0,time);
			place("sprite197",hot_canvas,ctx,[0.7011566162109375,-0.7098236083984375,0.7098236083984375,0.7011566162109375,-1213.0,837.0],ctrans,1,(11+time)%17,0,time);
			place("sprite197",hot_canvas,ctx,[0.3867034912109375,-0.9195709228515625,0.9195709228515625,0.3867034912109375,-606.0,1386.0],ctrans,1,(11+time)%17,0,time);
			place("sprite197",hot_canvas,ctx,[0.90362548828125,0.422607421875,-0.422607421875,0.90362548828125,-1333.0,-738.0],ctrans,1,(11+time)%17,0,time);
			place("sprite197",hot_canvas,ctx,[0.358734130859375,0.932159423828125,-0.932159423828125,0.358734130859375,-422.0,-1427.0],ctrans,1,(11+time)%17,0,time);
			place("sprite197",hot_canvas,ctx,[-0.984405517578125,0.152130126953125,-0.152130126953125,-0.984405517578125,1623.0,-66.0],ctrans,1,(11+time)%17,0,time);
			place("sprite197",hot_canvas,ctx,[-0.771636962890625,0.627593994140625,-0.627593994140625,-0.771636962890625,1319.0,-775.0],ctrans,1,(11+time)%17,0,time);
			place("sprite197",hot_canvas,ctx,[-0.4827117919921875,0.869476318359375,-0.869476318359375,-0.4827117919921875,966.0,-1602.0],ctrans,1,(11+time)%17,0,time);
			place("sprite197",hot_canvas,ctx,[-0.8498077392578125,-0.5165863037109375,0.5165863037109375,-0.8498077392578125,1268.0,800.0],ctrans,1,(11+time)%17,0,time);
			place("sprite197",hot_canvas,ctx,[-0.4185791015625,-0.902862548828125,0.902862548828125,-0.4185791015625,487.0,1427.0],ctrans,1,(11+time)%17,0,time);
			break;
		case 12:
			place("sprite197",hot_canvas,ctx,[0.965057373046875,-0.25885009765625,0.25885009765625,0.965057373046875,-1593.0,164.0],ctrans,1,(12+time)%17,0,time);
			place("sprite197",hot_canvas,ctx,[0.7011566162109375,-0.7098236083984375,0.7098236083984375,0.7011566162109375,-1213.0,837.0],ctrans,1,(12+time)%17,0,time);
			place("sprite197",hot_canvas,ctx,[0.3867034912109375,-0.9195709228515625,0.9195709228515625,0.3867034912109375,-606.0,1386.0],ctrans,1,(12+time)%17,0,time);
			place("sprite197",hot_canvas,ctx,[0.90362548828125,0.422607421875,-0.422607421875,0.90362548828125,-1333.0,-738.0],ctrans,1,(12+time)%17,0,time);
			place("sprite197",hot_canvas,ctx,[0.358734130859375,0.932159423828125,-0.932159423828125,0.358734130859375,-422.0,-1427.0],ctrans,1,(12+time)%17,0,time);
			place("sprite197",hot_canvas,ctx,[-0.984405517578125,0.152130126953125,-0.152130126953125,-0.984405517578125,1623.0,-66.0],ctrans,1,(12+time)%17,0,time);
			place("sprite197",hot_canvas,ctx,[-0.771636962890625,0.627593994140625,-0.627593994140625,-0.771636962890625,1319.0,-775.0],ctrans,1,(12+time)%17,0,time);
			place("sprite197",hot_canvas,ctx,[-0.4827117919921875,0.869476318359375,-0.869476318359375,-0.4827117919921875,966.0,-1602.0],ctrans,1,(12+time)%17,0,time);
			place("sprite197",hot_canvas,ctx,[-0.8498077392578125,-0.5165863037109375,0.5165863037109375,-0.8498077392578125,1268.0,800.0],ctrans,1,(12+time)%17,0,time);
			place("sprite197",hot_canvas,ctx,[-0.4185791015625,-0.902862548828125,0.902862548828125,-0.4185791015625,487.0,1427.0],ctrans,1,(12+time)%17,0,time);
			break;
		case 13:
			place("sprite197",hot_canvas,ctx,[0.965057373046875,-0.25885009765625,0.25885009765625,0.965057373046875,-1593.0,164.0],ctrans,1,(13+time)%17,0,time);
			place("sprite197",hot_canvas,ctx,[0.7011566162109375,-0.7098236083984375,0.7098236083984375,0.7011566162109375,-1213.0,837.0],ctrans,1,(13+time)%17,0,time);
			place("sprite197",hot_canvas,ctx,[0.3867034912109375,-0.9195709228515625,0.9195709228515625,0.3867034912109375,-606.0,1386.0],ctrans,1,(13+time)%17,0,time);
			place("sprite197",hot_canvas,ctx,[0.90362548828125,0.422607421875,-0.422607421875,0.90362548828125,-1333.0,-738.0],ctrans,1,(13+time)%17,0,time);
			place("sprite197",hot_canvas,ctx,[0.358734130859375,0.932159423828125,-0.932159423828125,0.358734130859375,-422.0,-1427.0],ctrans,1,(13+time)%17,0,time);
			place("sprite197",hot_canvas,ctx,[-0.984405517578125,0.152130126953125,-0.152130126953125,-0.984405517578125,1623.0,-66.0],ctrans,1,(13+time)%17,0,time);
			place("sprite197",hot_canvas,ctx,[-0.771636962890625,0.627593994140625,-0.627593994140625,-0.771636962890625,1319.0,-775.0],ctrans,1,(13+time)%17,0,time);
			place("sprite197",hot_canvas,ctx,[-0.4827117919921875,0.869476318359375,-0.869476318359375,-0.4827117919921875,966.0,-1602.0],ctrans,1,(13+time)%17,0,time);
			place("sprite197",hot_canvas,ctx,[-0.8498077392578125,-0.5165863037109375,0.5165863037109375,-0.8498077392578125,1268.0,800.0],ctrans,1,(13+time)%17,0,time);
			place("sprite197",hot_canvas,ctx,[-0.4185791015625,-0.902862548828125,0.902862548828125,-0.4185791015625,487.0,1427.0],ctrans,1,(13+time)%17,0,time);
			break;
		case 14:
			place("sprite197",hot_canvas,ctx,[0.965057373046875,-0.25885009765625,0.25885009765625,0.965057373046875,-1593.0,164.0],ctrans,1,(14+time)%17,0,time);
			place("sprite197",hot_canvas,ctx,[0.7011566162109375,-0.7098236083984375,0.7098236083984375,0.7011566162109375,-1213.0,837.0],ctrans,1,(14+time)%17,0,time);
			place("sprite197",hot_canvas,ctx,[0.3867034912109375,-0.9195709228515625,0.9195709228515625,0.3867034912109375,-606.0,1386.0],ctrans,1,(14+time)%17,0,time);
			place("sprite197",hot_canvas,ctx,[0.90362548828125,0.422607421875,-0.422607421875,0.90362548828125,-1333.0,-738.0],ctrans,1,(14+time)%17,0,time);
			place("sprite197",hot_canvas,ctx,[0.358734130859375,0.932159423828125,-0.932159423828125,0.358734130859375,-422.0,-1427.0],ctrans,1,(14+time)%17,0,time);
			place("sprite197",hot_canvas,ctx,[-0.984405517578125,0.152130126953125,-0.152130126953125,-0.984405517578125,1623.0,-66.0],ctrans,1,(14+time)%17,0,time);
			place("sprite197",hot_canvas,ctx,[-0.771636962890625,0.627593994140625,-0.627593994140625,-0.771636962890625,1319.0,-775.0],ctrans,1,(14+time)%17,0,time);
			place("sprite197",hot_canvas,ctx,[-0.4827117919921875,0.869476318359375,-0.869476318359375,-0.4827117919921875,966.0,-1602.0],ctrans,1,(14+time)%17,0,time);
			place("sprite197",hot_canvas,ctx,[-0.8498077392578125,-0.5165863037109375,0.5165863037109375,-0.8498077392578125,1268.0,800.0],ctrans,1,(14+time)%17,0,time);
			place("sprite197",hot_canvas,ctx,[-0.4185791015625,-0.902862548828125,0.902862548828125,-0.4185791015625,487.0,1427.0],ctrans,1,(14+time)%17,0,time);
			break;
		case 15:
			place("sprite197",hot_canvas,ctx,[0.965057373046875,-0.25885009765625,0.25885009765625,0.965057373046875,-1593.0,164.0],ctrans,1,(15+time)%17,0,time);
			place("sprite197",hot_canvas,ctx,[0.7011566162109375,-0.7098236083984375,0.7098236083984375,0.7011566162109375,-1213.0,837.0],ctrans,1,(15+time)%17,0,time);
			place("sprite197",hot_canvas,ctx,[0.3867034912109375,-0.9195709228515625,0.9195709228515625,0.3867034912109375,-606.0,1386.0],ctrans,1,(15+time)%17,0,time);
			place("sprite197",hot_canvas,ctx,[0.90362548828125,0.422607421875,-0.422607421875,0.90362548828125,-1333.0,-738.0],ctrans,1,(15+time)%17,0,time);
			place("sprite197",hot_canvas,ctx,[0.358734130859375,0.932159423828125,-0.932159423828125,0.358734130859375,-422.0,-1427.0],ctrans,1,(15+time)%17,0,time);
			place("sprite197",hot_canvas,ctx,[-0.984405517578125,0.152130126953125,-0.152130126953125,-0.984405517578125,1623.0,-66.0],ctrans,1,(15+time)%17,0,time);
			place("sprite197",hot_canvas,ctx,[-0.771636962890625,0.627593994140625,-0.627593994140625,-0.771636962890625,1319.0,-775.0],ctrans,1,(15+time)%17,0,time);
			place("sprite197",hot_canvas,ctx,[-0.4827117919921875,0.869476318359375,-0.869476318359375,-0.4827117919921875,966.0,-1602.0],ctrans,1,(15+time)%17,0,time);
			place("sprite197",hot_canvas,ctx,[-0.8498077392578125,-0.5165863037109375,0.5165863037109375,-0.8498077392578125,1268.0,800.0],ctrans,1,(15+time)%17,0,time);
			place("sprite197",hot_canvas,ctx,[-0.4185791015625,-0.902862548828125,0.902862548828125,-0.4185791015625,487.0,1427.0],ctrans,1,(15+time)%17,0,time);
			break;
		case 16:
			place("sprite197",hot_canvas,ctx,[0.965057373046875,-0.25885009765625,0.25885009765625,0.965057373046875,-1593.0,164.0],ctrans,1,(16+time)%17,0,time);
			place("sprite197",hot_canvas,ctx,[0.7011566162109375,-0.7098236083984375,0.7098236083984375,0.7011566162109375,-1213.0,837.0],ctrans,1,(16+time)%17,0,time);
			place("sprite197",hot_canvas,ctx,[0.3867034912109375,-0.9195709228515625,0.9195709228515625,0.3867034912109375,-606.0,1386.0],ctrans,1,(16+time)%17,0,time);
			place("sprite197",hot_canvas,ctx,[0.90362548828125,0.422607421875,-0.422607421875,0.90362548828125,-1333.0,-738.0],ctrans,1,(16+time)%17,0,time);
			place("sprite197",hot_canvas,ctx,[0.358734130859375,0.932159423828125,-0.932159423828125,0.358734130859375,-422.0,-1427.0],ctrans,1,(16+time)%17,0,time);
			place("sprite197",hot_canvas,ctx,[-0.984405517578125,0.152130126953125,-0.152130126953125,-0.984405517578125,1623.0,-66.0],ctrans,1,(16+time)%17,0,time);
			place("sprite197",hot_canvas,ctx,[-0.771636962890625,0.627593994140625,-0.627593994140625,-0.771636962890625,1319.0,-775.0],ctrans,1,(16+time)%17,0,time);
			place("sprite197",hot_canvas,ctx,[-0.4827117919921875,0.869476318359375,-0.869476318359375,-0.4827117919921875,966.0,-1602.0],ctrans,1,(16+time)%17,0,time);
			place("sprite197",hot_canvas,ctx,[-0.8498077392578125,-0.5165863037109375,0.5165863037109375,-0.8498077392578125,1268.0,800.0],ctrans,1,(16+time)%17,0,time);
			place("sprite197",hot_canvas,ctx,[-0.4185791015625,-0.902862548828125,0.902862548828125,-0.4185791015625,487.0,1427.0],ctrans,1,(16+time)%17,0,time);
			break;
		case 17:
			place("sprite197",hot_canvas,ctx,[0.965057373046875,-0.25885009765625,0.25885009765625,0.965057373046875,-1593.0,164.0],ctrans,1,(0+time)%17,0,time);
			place("sprite197",hot_canvas,ctx,[0.7011566162109375,-0.7098236083984375,0.7098236083984375,0.7011566162109375,-1213.0,837.0],ctrans,1,(0+time)%17,0,time);
			place("sprite197",hot_canvas,ctx,[0.3867034912109375,-0.9195709228515625,0.9195709228515625,0.3867034912109375,-606.0,1386.0],ctrans,1,(0+time)%17,0,time);
			place("sprite197",hot_canvas,ctx,[0.90362548828125,0.422607421875,-0.422607421875,0.90362548828125,-1333.0,-738.0],ctrans,1,(0+time)%17,0,time);
			place("sprite197",hot_canvas,ctx,[0.358734130859375,0.932159423828125,-0.932159423828125,0.358734130859375,-422.0,-1427.0],ctrans,1,(0+time)%17,0,time);
			place("sprite197",hot_canvas,ctx,[-0.984405517578125,0.152130126953125,-0.152130126953125,-0.984405517578125,1623.0,-66.0],ctrans,1,(0+time)%17,0,time);
			place("sprite197",hot_canvas,ctx,[-0.771636962890625,0.627593994140625,-0.627593994140625,-0.771636962890625,1319.0,-775.0],ctrans,1,(0+time)%17,0,time);
			place("sprite197",hot_canvas,ctx,[-0.4827117919921875,0.869476318359375,-0.869476318359375,-0.4827117919921875,966.0,-1602.0],ctrans,1,(0+time)%17,0,time);
			place("sprite197",hot_canvas,ctx,[-0.8498077392578125,-0.5165863037109375,0.5165863037109375,-0.8498077392578125,1268.0,800.0],ctrans,1,(0+time)%17,0,time);
			place("sprite197",hot_canvas,ctx,[-0.4185791015625,-0.902862548828125,0.902862548828125,-0.4185791015625,487.0,1427.0],ctrans,1,(0+time)%17,0,time);
			break;
		case 18:
			place("sprite197",hot_canvas,ctx,[0.965057373046875,-0.25885009765625,0.25885009765625,0.965057373046875,-1593.0,164.0],ctrans,1,(1+time)%17,0,time);
			place("sprite197",hot_canvas,ctx,[0.7011566162109375,-0.7098236083984375,0.7098236083984375,0.7011566162109375,-1213.0,837.0],ctrans,1,(1+time)%17,0,time);
			place("sprite197",hot_canvas,ctx,[0.3867034912109375,-0.9195709228515625,0.9195709228515625,0.3867034912109375,-606.0,1386.0],ctrans,1,(1+time)%17,0,time);
			place("sprite197",hot_canvas,ctx,[0.90362548828125,0.422607421875,-0.422607421875,0.90362548828125,-1333.0,-738.0],ctrans,1,(1+time)%17,0,time);
			place("sprite197",hot_canvas,ctx,[0.358734130859375,0.932159423828125,-0.932159423828125,0.358734130859375,-422.0,-1427.0],ctrans,1,(1+time)%17,0,time);
			place("sprite197",hot_canvas,ctx,[-0.984405517578125,0.152130126953125,-0.152130126953125,-0.984405517578125,1623.0,-66.0],ctrans,1,(1+time)%17,0,time);
			place("sprite197",hot_canvas,ctx,[-0.771636962890625,0.627593994140625,-0.627593994140625,-0.771636962890625,1319.0,-775.0],ctrans,1,(1+time)%17,0,time);
			place("sprite197",hot_canvas,ctx,[-0.4827117919921875,0.869476318359375,-0.869476318359375,-0.4827117919921875,966.0,-1602.0],ctrans,1,(1+time)%17,0,time);
			place("sprite197",hot_canvas,ctx,[-0.8498077392578125,-0.5165863037109375,0.5165863037109375,-0.8498077392578125,1268.0,800.0],ctrans,1,(1+time)%17,0,time);
			place("sprite197",hot_canvas,ctx,[-0.4185791015625,-0.902862548828125,0.902862548828125,-0.4185791015625,487.0,1427.0],ctrans,1,(1+time)%17,0,time);
			break;
		case 19:
			place("sprite197",hot_canvas,ctx,[0.965057373046875,-0.25885009765625,0.25885009765625,0.965057373046875,-1593.0,164.0],ctrans,1,(2+time)%17,0,time);
			place("sprite197",hot_canvas,ctx,[0.7011566162109375,-0.7098236083984375,0.7098236083984375,0.7011566162109375,-1213.0,837.0],ctrans,1,(2+time)%17,0,time);
			place("sprite197",hot_canvas,ctx,[0.3867034912109375,-0.9195709228515625,0.9195709228515625,0.3867034912109375,-606.0,1386.0],ctrans,1,(2+time)%17,0,time);
			place("sprite197",hot_canvas,ctx,[0.90362548828125,0.422607421875,-0.422607421875,0.90362548828125,-1333.0,-738.0],ctrans,1,(2+time)%17,0,time);
			place("sprite197",hot_canvas,ctx,[0.358734130859375,0.932159423828125,-0.932159423828125,0.358734130859375,-422.0,-1427.0],ctrans,1,(2+time)%17,0,time);
			place("sprite197",hot_canvas,ctx,[-0.984405517578125,0.152130126953125,-0.152130126953125,-0.984405517578125,1623.0,-66.0],ctrans,1,(2+time)%17,0,time);
			place("sprite197",hot_canvas,ctx,[-0.771636962890625,0.627593994140625,-0.627593994140625,-0.771636962890625,1319.0,-775.0],ctrans,1,(2+time)%17,0,time);
			place("sprite197",hot_canvas,ctx,[-0.4827117919921875,0.869476318359375,-0.869476318359375,-0.4827117919921875,966.0,-1602.0],ctrans,1,(2+time)%17,0,time);
			place("sprite197",hot_canvas,ctx,[-0.8498077392578125,-0.5165863037109375,0.5165863037109375,-0.8498077392578125,1268.0,800.0],ctrans,1,(2+time)%17,0,time);
			place("sprite197",hot_canvas,ctx,[-0.4185791015625,-0.902862548828125,0.902862548828125,-0.4185791015625,487.0,1427.0],ctrans,1,(2+time)%17,0,time);
			break;
	}
}

function shape199(ctx,ctrans,frame,ratio,time){
	var pathData="M 1493 958 Q 1421 1008 1328 997 1143 976 1127 838 1114 721 1198 647 1058 537 498 392 L 518 322 Q 1279 488 1478 577 1558 613 1586 689 1611 759 1585 836 1558 913 1493 958";
	ctx.fillStyle=tocolor(ctrans.apply([255,255,16,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 1493 958 Q 1421 1008 1328 997 1143 976 1127 838 1114 721 1198 647 1058 537 498 392 L 518 322 Q 1279 488 1478 577 1558 613 1586 689 1611 759 1585 836 1558 913 1493 958 Z";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([255,102,0,1]));
	ctx.lineWidth=2.0;
	ctx.lineCap="butt";
	ctx.lineJoin="miter";
	ctx.miterLimit=3.0;
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M -615 413 Q -1392 450 -1607 416 -1694 402 -1741 336 -1783 274 -1778 193 -1772 112 -1721 52 -1665 -15 -1572 -29 -1388 -57 -1336 73 -1294 182 -1355 275 -1192 345 -614 340 L -615 413";
	ctx.fillStyle=tocolor(ctrans.apply([255,255,16,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M -615 413 Q -1392 450 -1607 416 -1694 402 -1741 336 -1783 274 -1778 193 -1772 112 -1721 52 -1665 -15 -1572 -29 -1388 -57 -1336 73 -1294 182 -1355 275 -1192 345 -614 340 L -615 413 Z";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([255,102,0,1]));
	ctx.lineWidth=2.0;
	ctx.lineCap="butt";
	ctx.lineJoin="miter";
	ctx.miterLimit=3.0;
	drawPath(ctx,pathData,true,scaleMode);

}

function shape200(ctx,ctrans,frame,ratio,time){
	var pathData="M 161 2238 L 159 2257 153 2310 Q 119 2584 70 2790 6 2941 -89 2952 -185 2962 -205 2863 -226 2763 -59 2256 L -7 2145 161 2238";
	ctx.fillStyle=tocolor(ctrans.apply([255,51,0,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M -7 2145 L 160 1780 Q 193 1944 161 2238 L -7 2145";
	ctx.fillStyle=tocolor(ctrans.apply([255,0,0,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M -613 1414 Q -740 1322 -857 1205 -955 1107 -1035 1002 -1400 523 -1400 -106 -1400 -874 -857 -1418 -313 -1961 455 -1961 1223 -1961 1766 -1418 2310 -874 2310 -106 2310 662 1766 1205 1568 1403 1341 1529 1326 1422 1297 1345 1238 1187 1107 1110 987 1040 840 980 693 919 250 900 -132 883 -330 1049 L -389 1107 Q -586 1333 -613 1414";
	drawPath(ctx,pathData,false);
	ctx.fillStyle=tocolor(ctrans.apply([255,0,0,1]));
	ctx.fill("evenodd");
	ctx.save();
	ctx.clip();
	ctx.transform(0.11993408203125,0,0,0.11993408203125,455,-216);
	var grd=ctx.createRadialGradient(0.0,0,0,0,0,16384);
	grd.addColorStop(0.0,tocolor(ctrans.apply([255,204,51,1])));
	grd.addColorStop(1.0,tocolor(ctrans.apply([255,0,0,1])));
	ctx.fillStyle = grd;
	ctx.fillRect(-16384,-16384,32768,32768);
	ctx.restore();
	var pathData="M -613 1414 Q -740 1322 -857 1205 -955 1107 -1035 1002 -1400 523 -1400 -106 -1400 -874 -857 -1418 -313 -1961 455 -1961 1223 -1961 1766 -1418 2310 -874 2310 -106 2310 662 1766 1205 1568 1403 1341 1529";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([255,51,0,1]));
	ctx.lineWidth=4.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M 1341 1529 Q 1326 1422 1297 1345 1238 1187 1107 1110 987 1040 840 980 693 919 250 900 -132 883 -330 1049 L -389 1107 Q -586 1333 -613 1414 Z";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([255,51,0,1]));
	ctx.lineWidth=3.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M -613 1414 L 160 1780";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([255,51,0,1]));
	ctx.lineWidth=3.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M -115 936 L 160 1780";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([255,51,0,1]));
	ctx.lineWidth=3.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M 442 910 L 160 1780";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([255,51,0,1]));
	ctx.lineWidth=3.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M 1074 1091 L 160 1780";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([255,51,0,1]));
	ctx.lineWidth=3.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M 1341 1529 L 160 1780";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([255,51,0,1]));
	ctx.lineWidth=3.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M 70 2790 Q 6 2941 -89 2952 -185 2962 -205 2863 -226 2763 -59 2256 L 160 1780 Q 194 1949 159 2257 124 2564 70 2790 Z";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([255,0,0,1]));
	ctx.lineWidth=3.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

}

function shape201(ctx,ctrans,frame,ratio,time){
	var pathData="M -596 -681 Q -366 -854 -63 -856 314 -857 582 -592 850 -327 852 50 853 304 734 508 675 607 588 695 323 964 -54 965 -431 967 -699 701 -967 436 -969 59 -971 -318 -706 -586 -653 -639 -596 -681";
	ctx.fillStyle=tocolor(ctrans.apply([255,255,16,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M -596 -681 Q -366 -854 -63 -856 314 -857 582 -592 850 -327 852 50 853 304 734 508 675 607 588 695 323 964 -54 965 -431 967 -699 701 -967 436 -969 59 -971 -318 -706 -586 -653 -639 -596 -681 Z";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([255,102,0,1]));
	ctx.lineWidth=2.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

}

function shape202(ctx,ctrans,frame,ratio,time){
	var pathData="M 229 -208 L 493 -152";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([255,102,0,1]));
	ctx.lineWidth=2.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M -294 -168 L -510 -113";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([255,102,0,1]));
	ctx.lineWidth=2.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M 217 12 Q 221 -19 295 -32 369 -45 470 -33 570 -20 638 12 706 44 702 75 698 106 625 119 551 132 451 119 350 107 282 75 213 43 217 12";
	ctx.fillStyle=tocolor(ctrans.apply([255,102,0,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 217 12 Q 221 -19 295 -32 369 -45 470 -33 570 -20 638 12 706 44 702 75 698 106 625 119 551 132 451 119 350 107 282 75 213 43 217 12 Z";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([255,102,0,1]));
	ctx.lineWidth=2.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M -702 89 Q -706 58 -655 29 -603 1 -526 -8 L -393 -1 Q -336 16 -332 47 -329 78 -380 106 -432 135 -509 144 L -642 136 Q -699 120 -702 89";
	ctx.fillStyle=tocolor(ctrans.apply([255,102,0,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M -702 89 Q -706 58 -655 29 -603 1 -526 -8 L -393 -1 Q -336 16 -332 47 -329 78 -380 106 -432 135 -509 144 L -642 136 Q -699 120 -702 89 Z";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([255,102,0,1]));
	ctx.lineWidth=2.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

}

function morphshape203(ctx,ctrans,frame,ratio,time){
	var pathData="M 0 35 248 248 Q 1 36 351 330 52 77 423 388 104 118 495 445 176 176 495 445 249 234 495 445 299 274 422 387 350 315 349 328 350 315 247 247 349 314 144 164 297 273 72 107 246 232 0 49 173 174 0 49 101 116 0 49 50 75 73 108 0 35 146 166 0 35 248 248";
	ctx.fillStyle=tocolor(ctrans.apply([Math.round(255+ratio*(0)/65535),Math.round(255+ratio*(0)/65535),Math.round(255+ratio*(0)/65535),((Math.round(255+ratio*(0)/65535))/255)]));
	drawMorphPath(ctx,pathData,ratio,false);

	ctx.fill("evenodd");
	var pathData="M 0 35 248 248 Q 0 35 146 166 50 75 73 108 101 116 0 49 173 174 0 49 246 232 0 49 297 273 72 107 349 314 144 164 350 315 247 247 350 315 349 328 299 274 422 387 249 234 495 445 176 176 495 445 104 118 495 445 52 77 423 388 1 36 351 330 0 35 248 248 0 35 146 166 50 75 73 108 101 116 0 49 173 174 0 49 246 232 0 49 297 273 72 107 349 314 144 164 350 315 247 247 350 315 349 328 299 274 422 387 249 234 495 445 176 176 495 445 104 118 495 445 52 77 423 388 1 36 351 330 0 35 248 248";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([Math.round(255+ratio*(0)/65535),Math.round(102+ratio*(0)/65535),Math.round(0+ratio*(1)/65535),((Math.round(255+ratio*(0)/65535))/255)]));
	ctx.lineWidth=1.5+ratio*(0)/65535;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawMorphPath(ctx,pathData,ratio,true,scaleMode);

}

function shape204(ctx,ctrans,frame,ratio,time){
	var pathData="M 274 387 Q 234 445 176 445 118 445 77 387 36 330 35 247 35 166 75 107 116 49 173 49 232 49 273 107 314 164 315 247 315 328 274 387";
	ctx.fillStyle=tocolor(ctrans.apply([255,255,255,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 274 387 Q 234 445 176 445 118 445 77 387 36 330 35 247 35 166 75 107 116 49 173 49 232 49 273 107 314 164 315 247 315 328 274 387 Z";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([255,102,0,1]));
	ctx.lineWidth=1.5;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

}

function sprite205(ctx,ctrans,frame,ratio,time){
	var clips = [];
	var frame_cnt = 10;
	frame = frame % frame_cnt;
	switch(frame){
		case 0:
			place("morphshape203",hot_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
		case 1:
			place("morphshape203",hot_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,7282,time);
			break;
		case 2:
			place("morphshape203",hot_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,14564,time);
			break;
		case 3:
			place("morphshape203",hot_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,21845,time);
			break;
		case 4:
			place("morphshape203",hot_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,29127,time);
			break;
		case 5:
			place("morphshape203",hot_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,36409,time);
			break;
		case 6:
			place("morphshape203",hot_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,43691,time);
			break;
		case 7:
			place("morphshape203",hot_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,50972,time);
			break;
		case 8:
			place("morphshape203",hot_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,58254,time);
			break;
		case 9:
			place("shape204",hot_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
	}
}

function shape206(ctx,ctrans,frame,ratio,time){
	var pathData="M 27 -642 Q 58 -458 217 -137 340 111 375 252 422 445 338 540 241 651 -42 641 -544 624 -323 41 -217 -240 27 -642";
	ctx.fillStyle=tocolor(ctrans.apply([53,214,253,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 27 -642 Q -217 -240 -323 41 -544 624 -42 641 241 651 338 540 422 445 375 252 340 111 217 -137 58 -458 27 -642 Z";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([1,136,169,1]));
	ctx.lineWidth=3.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M -134 -87 Q -110 -121 -107 -101 -123 -98 -144 48 -165 184 -165 284 -165 348 -95 363 -60 370 -25 364 L -25 504 Q -38 533 -97 556 -157 579 -260 466 -363 353 -276 176 -190 -2 -134 -87";
	ctx.fillStyle=tocolor(ctrans.apply([255,255,255,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
}

function sprite207(ctx,ctrans,frame,ratio,time){
	var clips = [];
	var frame_cnt = 1;
	frame = frame % frame_cnt;
	switch(frame){
		case 0:
			place("shape206",hot_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
	}
}

function shape208(ctx,ctrans,frame,ratio,time){
	var pathData="M -606 410 Q -1360 218 -1555 122 -1634 83 -1659 6 -1681 -65 -1652 -141 -1624 -217 -1557 -259 -1484 -306 -1392 -293 -1207 -265 -1195 -126 -1187 -10 -1272 61 -1138 176 -585 340 L -606 410";
	ctx.fillStyle=tocolor(ctrans.apply([255,255,16,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M -606 410 Q -1360 218 -1555 122 -1634 83 -1659 6 -1681 -65 -1652 -141 -1624 -217 -1557 -259 -1484 -306 -1392 -293 -1207 -265 -1195 -126 -1187 -10 -1272 61 -1138 176 -585 340 L -606 410 Z";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([255,102,0,1]));
	ctx.lineWidth=2.0;
	ctx.lineCap="butt";
	ctx.lineJoin="miter";
	ctx.miterLimit=3.0;
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M 1493 958 Q 1421 1008 1328 997 1143 976 1127 838 1114 721 1198 647 1058 537 498 392 L 518 322 Q 1279 488 1478 577 1558 613 1586 689 1611 759 1585 836 1558 913 1493 958";
	ctx.fillStyle=tocolor(ctrans.apply([255,255,16,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 1493 958 Q 1421 1008 1328 997 1143 976 1127 838 1114 721 1198 647 1058 537 498 392 L 518 322 Q 1279 488 1478 577 1558 613 1586 689 1611 759 1585 836 1558 913 1493 958 Z";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([255,102,0,1]));
	ctx.lineWidth=2.0;
	ctx.lineCap="butt";
	ctx.lineJoin="miter";
	ctx.miterLimit=3.0;
	drawPath(ctx,pathData,true,scaleMode);

}

function sprite209(ctx,ctrans,frame,ratio,time){
	var clips = [];
	var frame_cnt = 26;
	frame = frame % frame_cnt;
	switch(frame){
		case 0:
			place("sprite198",hot_canvas,ctx,[1.0,0.0,0.0,1.0,-118.0,50.0],ctrans,1,(0+time)%20,0,time);
			place("shape199",hot_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			place("shape200",hot_canvas,ctx,[0.072113037109375,-0.087799072265625,0.192535400390625,0.15814208984375,-1883.0,-209.0],ctrans,1,0,0,time);
			place("shape201",hot_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			place("shape202",hot_canvas,ctx,[1.0,0.0,0.0,0.544219970703125,-214.0,-109.0],ctrans,1,0,0,time);
			place("sprite205",hot_canvas,ctx,[1.0,0.0,0.0,1.0,-484.0,-11.0],ctrans,1,(0+time)%10,0,time);
			place("sprite207",hot_canvas,ctx,[0.1964111328125,0.0,0.0,0.1964111328125,660.0,115.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,35)),1,(0+time)%1,0,time);
			place("sprite207",hot_canvas,ctx,[0.1964111328125,0.0,0.0,0.1964111328125,-588.0,-490.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,35)),1,(0+time)%1,0,time);
			break;
		case 1:
			place("sprite198",hot_canvas,ctx,[1.0,0.0,0.0,1.0,-118.0,50.0],ctrans,1,(1+time)%20,0,time);
			place("shape199",hot_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			place("shape200",hot_canvas,ctx,[0.072113037109375,-0.087799072265625,0.192535400390625,0.15814208984375,-1883.0,-209.0],ctrans,1,0,0,time);
			place("shape201",hot_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			place("shape202",hot_canvas,ctx,[1.0,0.0,0.0,0.544219970703125,-214.0,-109.0],ctrans,1,0,0,time);
			place("sprite205",hot_canvas,ctx,[1.0,0.0,0.0,1.0,-484.0,-11.0],ctrans,1,(1+time)%10,0,time);
			place("sprite207",hot_canvas,ctx,[0.1964111328125,0.0,0.0,0.1964111328125,660.0,133.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,60)),1,(0+time)%1,0,time);
			place("sprite207",hot_canvas,ctx,[0.1964111328125,0.0,0.0,0.1964111328125,-588.0,-472.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,60)),1,(0+time)%1,0,time);
			break;
		case 2:
			place("sprite198",hot_canvas,ctx,[1.0,0.0,0.0,1.0,-118.0,50.0],ctrans,1,(2+time)%20,0,time);
			place("shape199",hot_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			place("shape200",hot_canvas,ctx,[0.072113037109375,-0.087799072265625,0.192535400390625,0.15814208984375,-1883.0,-209.0],ctrans,1,0,0,time);
			place("shape201",hot_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			place("shape202",hot_canvas,ctx,[1.0,0.0,0.0,0.544219970703125,-214.0,-109.0],ctrans,1,0,0,time);
			place("sprite205",hot_canvas,ctx,[1.0,0.0,0.0,1.0,-484.0,-11.0],ctrans,1,(2+time)%10,0,time);
			place("sprite207",hot_canvas,ctx,[0.1964111328125,0.0,0.0,0.1964111328125,660.0,151.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,84)),1,(0+time)%1,0,time);
			place("sprite207",hot_canvas,ctx,[0.1964111328125,0.0,0.0,0.1964111328125,-588.0,-454.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,84)),1,(0+time)%1,0,time);
			break;
		case 3:
			place("sprite198",hot_canvas,ctx,[1.0,0.0,0.0,1.0,-118.0,50.0],ctrans,1,(3+time)%20,0,time);
			place("shape199",hot_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			place("shape200",hot_canvas,ctx,[0.072113037109375,-0.087799072265625,0.192535400390625,0.15814208984375,-1883.0,-209.0],ctrans,1,0,0,time);
			place("shape201",hot_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			place("shape202",hot_canvas,ctx,[1.0,0.0,0.0,0.544219970703125,-214.0,-109.0],ctrans,1,0,0,time);
			place("sprite205",hot_canvas,ctx,[1.0,0.0,0.0,1.0,-484.0,-11.0],ctrans,1,(3+time)%10,0,time);
			place("sprite207",hot_canvas,ctx,[0.1964111328125,0.0,0.0,0.1964111328125,660.0,169.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,109)),1,(0+time)%1,0,time);
			place("sprite207",hot_canvas,ctx,[0.1964111328125,0.0,0.0,0.1964111328125,-588.0,-436.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,109)),1,(0+time)%1,0,time);
			break;
		case 4:
			place("sprite198",hot_canvas,ctx,[1.0,0.0,0.0,1.0,-118.0,50.0],ctrans,1,(4+time)%20,0,time);
			place("shape199",hot_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			place("shape200",hot_canvas,ctx,[0.072113037109375,-0.087799072265625,0.192535400390625,0.15814208984375,-1883.0,-209.0],ctrans,1,0,0,time);
			place("shape201",hot_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			place("shape202",hot_canvas,ctx,[1.0,0.0,0.0,0.544219970703125,-214.0,-109.0],ctrans,1,0,0,time);
			place("sprite205",hot_canvas,ctx,[1.0,0.0,0.0,1.0,-484.0,-11.0],ctrans,1,(4+time)%10,0,time);
			place("sprite207",hot_canvas,ctx,[0.1964111328125,0.0,0.0,0.1964111328125,660.0,187.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,133)),1,(0+time)%1,0,time);
			place("sprite207",hot_canvas,ctx,[0.1964111328125,0.0,0.0,0.1964111328125,-588.0,-418.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,133)),1,(0+time)%1,0,time);
			break;
		case 5:
			place("sprite198",hot_canvas,ctx,[1.0,0.0,0.0,1.0,-118.0,50.0],ctrans,1,(5+time)%20,0,time);
			place("shape199",hot_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			place("shape200",hot_canvas,ctx,[0.072113037109375,-0.087799072265625,0.192535400390625,0.15814208984375,-1883.0,-209.0],ctrans,1,0,0,time);
			place("shape201",hot_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			place("shape202",hot_canvas,ctx,[1.0,0.0,0.0,0.544219970703125,-214.0,-109.0],ctrans,1,0,0,time);
			place("sprite205",hot_canvas,ctx,[1.0,0.0,0.0,1.0,-484.0,-11.0],ctrans,1,(5+time)%10,0,time);
			place("sprite207",hot_canvas,ctx,[0.1964111328125,0.0,0.0,0.1964111328125,660.0,205.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,158)),1,(0+time)%1,0,time);
			place("sprite207",hot_canvas,ctx,[0.1964111328125,0.0,0.0,0.1964111328125,-588.0,-400.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,158)),1,(0+time)%1,0,time);
			break;
		case 6:
			place("sprite198",hot_canvas,ctx,[1.0,0.0,0.0,1.0,-118.0,50.0],ctrans,1,(6+time)%20,0,time);
			place("shape199",hot_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			place("shape200",hot_canvas,ctx,[0.072113037109375,-0.087799072265625,0.192535400390625,0.15814208984375,-1883.0,-209.0],ctrans,1,0,0,time);
			place("shape201",hot_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			place("shape202",hot_canvas,ctx,[1.0,0.0,0.0,0.544219970703125,-214.0,-109.0],ctrans,1,0,0,time);
			place("sprite205",hot_canvas,ctx,[1.0,0.0,0.0,1.0,-484.0,-11.0],ctrans,1,(6+time)%10,0,time);
			place("sprite207",hot_canvas,ctx,[0.1964111328125,0.0,0.0,0.1964111328125,660.0,223.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,182)),1,(0+time)%1,0,time);
			place("sprite207",hot_canvas,ctx,[0.1964111328125,0.0,0.0,0.1964111328125,-588.0,-382.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,182)),1,(0+time)%1,0,time);
			break;
		case 7:
			place("sprite198",hot_canvas,ctx,[1.0,0.0,0.0,1.0,-118.0,50.0],ctrans,1,(7+time)%20,0,time);
			place("shape199",hot_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			place("shape200",hot_canvas,ctx,[0.072113037109375,-0.087799072265625,0.192535400390625,0.15814208984375,-1883.0,-209.0],ctrans,1,0,0,time);
			place("shape201",hot_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			place("shape202",hot_canvas,ctx,[1.0,0.0,0.0,0.544219970703125,-214.0,-109.0],ctrans,1,0,0,time);
			place("sprite205",hot_canvas,ctx,[1.0,0.0,0.0,1.0,-484.0,-11.0],ctrans,1,(7+time)%10,0,time);
			place("sprite207",hot_canvas,ctx,[0.1964111328125,0.0,0.0,0.1964111328125,660.0,241.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,207)),1,(0+time)%1,0,time);
			place("sprite207",hot_canvas,ctx,[0.1964111328125,0.0,0.0,0.1964111328125,-588.0,-364.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,207)),1,(0+time)%1,0,time);
			break;
		case 8:
			place("sprite198",hot_canvas,ctx,[1.0,0.0,0.0,1.0,-118.0,50.0],ctrans,1,(8+time)%20,0,time);
			place("shape199",hot_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			place("shape200",hot_canvas,ctx,[0.072113037109375,-0.087799072265625,0.192535400390625,0.15814208984375,-1883.0,-209.0],ctrans,1,0,0,time);
			place("shape201",hot_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			place("shape202",hot_canvas,ctx,[1.0,0.0,0.0,0.544219970703125,-214.0,-109.0],ctrans,1,0,0,time);
			place("sprite205",hot_canvas,ctx,[1.0,0.0,0.0,1.0,-484.0,-11.0],ctrans,1,(8+time)%10,0,time);
			place("sprite207",hot_canvas,ctx,[0.1964111328125,0.0,0.0,0.1964111328125,660.0,259.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,231)),1,(0+time)%1,0,time);
			place("sprite207",hot_canvas,ctx,[0.1964111328125,0.0,0.0,0.1964111328125,-588.0,-346.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,231)),1,(0+time)%1,0,time);
			break;
		case 9:
			place("sprite198",hot_canvas,ctx,[1.0,0.0,0.0,1.0,-118.0,50.0],ctrans,1,(9+time)%20,0,time);
			place("shape199",hot_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			place("shape200",hot_canvas,ctx,[0.072113037109375,-0.087799072265625,0.192535400390625,0.15814208984375,-1883.0,-209.0],ctrans,1,0,0,time);
			place("shape201",hot_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			place("shape202",hot_canvas,ctx,[1.0,0.0,0.0,0.544219970703125,-214.0,-109.0],ctrans,1,0,0,time);
			place("sprite205",hot_canvas,ctx,[1.0,0.0,0.0,1.0,-484.0,-11.0],ctrans,1,(9+time)%10,0,time);
			place("sprite207",hot_canvas,ctx,[0.1964111328125,0.0,0.0,0.1964111328125,660.0,277.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,256)),1,(0+time)%1,0,time);
			place("sprite207",hot_canvas,ctx,[0.1964111328125,0.0,0.0,0.1964111328125,-588.0,-328.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,256)),1,(0+time)%1,0,time);
			break;
		case 10:
			place("sprite198",hot_canvas,ctx,[1.0,0.0,0.0,1.0,-118.0,50.0],ctrans,1,(10+time)%20,0,time);
			place("shape199",hot_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			place("shape200",hot_canvas,ctx,[0.072113037109375,-0.087799072265625,0.192535400390625,0.15814208984375,-1883.0,-209.0],ctrans,1,0,0,time);
			place("shape201",hot_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			place("shape202",hot_canvas,ctx,[1.0,0.0,0.0,0.544219970703125,-214.0,-109.0],ctrans,1,0,0,time);
			place("sprite205",hot_canvas,ctx,[1.0,0.0,0.0,1.0,-484.0,-11.0],ctrans,1,(0+time)%10,0,time);
			place("sprite207",hot_canvas,ctx,[0.1964111328125,0.0,0.0,0.1964111328125,660.0,281.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,233)),1,(0+time)%1,0,time);
			place("sprite207",hot_canvas,ctx,[0.1964111328125,0.0,0.0,0.1964111328125,-588.0,-324.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,233)),1,(0+time)%1,0,time);
			break;
		case 11:
			place("sprite198",hot_canvas,ctx,[1.0,0.0,0.0,1.0,-118.0,50.0],ctrans,1,(11+time)%20,0,time);
			place("shape199",hot_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			place("shape200",hot_canvas,ctx,[0.072113037109375,-0.087799072265625,0.192535400390625,0.15814208984375,-1883.0,-209.0],ctrans,1,0,0,time);
			place("shape201",hot_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			place("shape202",hot_canvas,ctx,[1.0,0.0,0.0,0.544219970703125,-214.0,-109.0],ctrans,1,0,0,time);
			place("sprite205",hot_canvas,ctx,[1.0,0.0,0.0,1.0,-484.0,-11.0],ctrans,1,(1+time)%10,0,time);
			place("sprite207",hot_canvas,ctx,[0.1964111328125,0.0,0.0,0.1964111328125,660.0,285.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,209)),1,(0+time)%1,0,time);
			place("sprite207",hot_canvas,ctx,[0.1964111328125,0.0,0.0,0.1964111328125,-588.0,-320.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,209)),1,(0+time)%1,0,time);
			break;
		case 12:
			place("sprite198",hot_canvas,ctx,[1.0,0.0,0.0,1.0,-118.0,50.0],ctrans,1,(12+time)%20,0,time);
			place("shape199",hot_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			place("shape200",hot_canvas,ctx,[0.072113037109375,-0.087799072265625,0.192535400390625,0.15814208984375,-1883.0,-209.0],ctrans,1,0,0,time);
			place("shape201",hot_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			place("shape202",hot_canvas,ctx,[1.0,0.0,0.0,0.544219970703125,-214.0,-109.0],ctrans,1,0,0,time);
			place("sprite205",hot_canvas,ctx,[1.0,0.0,0.0,1.0,-484.0,-11.0],ctrans,1,(2+time)%10,0,time);
			place("sprite207",hot_canvas,ctx,[0.1964111328125,0.0,0.0,0.1964111328125,660.0,290.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,186)),1,(0+time)%1,0,time);
			place("sprite207",hot_canvas,ctx,[0.1964111328125,0.0,0.0,0.1964111328125,-588.0,-315.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,186)),1,(0+time)%1,0,time);
			break;
		case 13:
			place("sprite198",hot_canvas,ctx,[1.0,0.0,0.0,1.0,-118.0,50.0],ctrans,1,(13+time)%20,0,time);
			place("shape199",hot_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			place("shape200",hot_canvas,ctx,[0.072113037109375,-0.087799072265625,0.192535400390625,0.15814208984375,-1883.0,-209.0],ctrans,1,0,0,time);
			place("shape201",hot_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			place("shape202",hot_canvas,ctx,[1.0,0.0,0.0,0.544219970703125,-214.0,-109.0],ctrans,1,0,0,time);
			place("sprite205",hot_canvas,ctx,[1.0,0.0,0.0,1.0,-484.0,-11.0],ctrans,1,(3+time)%10,0,time);
			place("sprite207",hot_canvas,ctx,[0.1964111328125,0.0,0.0,0.1964111328125,660.0,294.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,163)),1,(0+time)%1,0,time);
			place("sprite207",hot_canvas,ctx,[0.1964111328125,0.0,0.0,0.1964111328125,-588.0,-311.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,163)),1,(0+time)%1,0,time);
			break;
		case 14:
			place("sprite198",hot_canvas,ctx,[1.0,0.0,0.0,1.0,-118.0,50.0],ctrans,1,(14+time)%20,0,time);
			place("shape208",hot_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			place("shape200",hot_canvas,ctx,[0.113433837890625,-9.46044921875E-4,0.0020751953125,0.248748779296875,-1337.0,-585.0],ctrans,1,0,0,time);
			place("shape201",hot_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			place("shape202",hot_canvas,ctx,[1.0,0.0,0.0,0.544219970703125,-214.0,-109.0],ctrans,1,0,0,time);
			place("sprite205",hot_canvas,ctx,[1.0,0.0,0.0,1.0,-484.0,-11.0],ctrans,1,(4+time)%10,0,time);
			place("sprite207",hot_canvas,ctx,[0.1964111328125,0.0,0.0,0.1964111328125,642.0,351.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,140)),1,(0+time)%1,0,time);
			place("sprite207",hot_canvas,ctx,[0.1964111328125,0.0,0.0,0.1964111328125,247.0,-508.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,140)),1,(0+time)%1,0,time);
			break;
		case 15:
			place("sprite198",hot_canvas,ctx,[1.0,0.0,0.0,1.0,-118.0,50.0],ctrans,1,(15+time)%20,0,time);
			place("shape208",hot_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			place("shape200",hot_canvas,ctx,[0.113433837890625,-9.46044921875E-4,0.0020751953125,0.248748779296875,-1337.0,-585.0],ctrans,1,0,0,time);
			place("shape201",hot_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			place("shape202",hot_canvas,ctx,[1.0,0.0,0.0,0.544219970703125,-214.0,-109.0],ctrans,1,0,0,time);
			place("sprite205",hot_canvas,ctx,[1.0,0.0,0.0,1.0,-484.0,-11.0],ctrans,1,(5+time)%10,0,time);
			place("sprite207",hot_canvas,ctx,[0.1964111328125,0.0,0.0,0.1964111328125,642.0,355.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,116)),1,(0+time)%1,0,time);
			place("sprite207",hot_canvas,ctx,[0.1964111328125,0.0,0.0,0.1964111328125,247.0,-504.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,116)),1,(0+time)%1,0,time);
			break;
		case 16:
			place("sprite198",hot_canvas,ctx,[1.0,0.0,0.0,1.0,-118.0,50.0],ctrans,1,(16+time)%20,0,time);
			place("shape208",hot_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			place("shape200",hot_canvas,ctx,[0.113433837890625,-9.46044921875E-4,0.0020751953125,0.248748779296875,-1337.0,-585.0],ctrans,1,0,0,time);
			place("shape201",hot_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			place("shape202",hot_canvas,ctx,[1.0,0.0,0.0,0.544219970703125,-214.0,-109.0],ctrans,1,0,0,time);
			place("sprite205",hot_canvas,ctx,[1.0,0.0,0.0,1.0,-484.0,-11.0],ctrans,1,(6+time)%10,0,time);
			place("sprite207",hot_canvas,ctx,[0.1964111328125,0.0,0.0,0.1964111328125,642.0,360.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,93)),1,(0+time)%1,0,time);
			place("sprite207",hot_canvas,ctx,[0.1964111328125,0.0,0.0,0.1964111328125,247.0,-499.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,93)),1,(0+time)%1,0,time);
			break;
		case 17:
			place("sprite198",hot_canvas,ctx,[1.0,0.0,0.0,1.0,-118.0,50.0],ctrans,1,(17+time)%20,0,time);
			place("shape208",hot_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			place("shape200",hot_canvas,ctx,[0.113433837890625,-9.46044921875E-4,0.0020751953125,0.248748779296875,-1337.0,-585.0],ctrans,1,0,0,time);
			place("shape201",hot_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			place("shape202",hot_canvas,ctx,[1.0,0.0,0.0,0.544219970703125,-214.0,-109.0],ctrans,1,0,0,time);
			place("sprite205",hot_canvas,ctx,[1.0,0.0,0.0,1.0,-484.0,-11.0],ctrans,1,(7+time)%10,0,time);
			place("sprite207",hot_canvas,ctx,[0.1964111328125,0.0,0.0,0.1964111328125,642.0,364.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,70)),1,(0+time)%1,0,time);
			place("sprite207",hot_canvas,ctx,[0.1964111328125,0.0,0.0,0.1964111328125,247.0,-495.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,70)),1,(0+time)%1,0,time);
			break;
		case 18:
			place("sprite198",hot_canvas,ctx,[1.0,0.0,0.0,1.0,-118.0,50.0],ctrans,1,(18+time)%20,0,time);
			place("shape208",hot_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			place("shape200",hot_canvas,ctx,[0.113433837890625,-9.46044921875E-4,0.0020751953125,0.248748779296875,-1337.0,-585.0],ctrans,1,0,0,time);
			place("shape201",hot_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			place("shape202",hot_canvas,ctx,[1.0,0.0,0.0,0.544219970703125,-214.0,-109.0],ctrans,1,0,0,time);
			place("sprite205",hot_canvas,ctx,[1.0,0.0,0.0,1.0,-484.0,-11.0],ctrans,1,(8+time)%10,0,time);
			place("sprite207",hot_canvas,ctx,[0.1964111328125,0.0,0.0,0.1964111328125,642.0,368.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,47)),1,(0+time)%1,0,time);
			place("sprite207",hot_canvas,ctx,[0.1964111328125,0.0,0.0,0.1964111328125,247.0,-491.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,47)),1,(0+time)%1,0,time);
			break;
		case 19:
			place("sprite198",hot_canvas,ctx,[1.0,0.0,0.0,1.0,-118.0,50.0],ctrans,1,(19+time)%20,0,time);
			place("shape208",hot_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			place("shape200",hot_canvas,ctx,[0.113433837890625,-9.46044921875E-4,0.0020751953125,0.248748779296875,-1337.0,-585.0],ctrans,1,0,0,time);
			place("shape201",hot_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			place("shape202",hot_canvas,ctx,[1.0,0.0,0.0,0.544219970703125,-214.0,-109.0],ctrans,1,0,0,time);
			place("sprite205",hot_canvas,ctx,[1.0,0.0,0.0,1.0,-484.0,-11.0],ctrans,1,(9+time)%10,0,time);
			place("sprite207",hot_canvas,ctx,[0.1964111328125,0.0,0.0,0.1964111328125,642.0,372.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,23)),1,(0+time)%1,0,time);
			place("sprite207",hot_canvas,ctx,[0.1964111328125,0.0,0.0,0.1964111328125,247.0,-487.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,23)),1,(0+time)%1,0,time);
			break;
		case 20:
			place("sprite198",hot_canvas,ctx,[1.0,0.0,0.0,1.0,-118.0,50.0],ctrans,1,(0+time)%20,0,time);
			place("shape208",hot_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			place("shape200",hot_canvas,ctx,[0.113433837890625,-9.46044921875E-4,0.0020751953125,0.248748779296875,-1337.0,-585.0],ctrans,1,0,0,time);
			place("shape201",hot_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			place("shape202",hot_canvas,ctx,[1.0,0.0,0.0,0.544219970703125,-214.0,-109.0],ctrans,1,0,0,time);
			place("sprite205",hot_canvas,ctx,[1.0,0.0,0.0,1.0,-484.0,-11.0],ctrans,1,(0+time)%10,0,time);
			place("sprite207",hot_canvas,ctx,[0.1964111328125,0.0,0.0,0.1964111328125,642.0,376.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,0)),1,(0+time)%1,0,time);
			place("sprite207",hot_canvas,ctx,[0.1964111328125,0.0,0.0,0.1964111328125,247.0,-483.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,0)),1,(0+time)%1,0,time);
			break;
		case 21:
			place("sprite198",hot_canvas,ctx,[1.0,0.0,0.0,1.0,-118.0,50.0],ctrans,1,(1+time)%20,0,time);
			place("shape208",hot_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			place("shape200",hot_canvas,ctx,[0.113433837890625,-9.46044921875E-4,0.0020751953125,0.248748779296875,-1337.0,-585.0],ctrans,1,0,0,time);
			place("shape201",hot_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			place("shape202",hot_canvas,ctx,[1.0,0.0,0.0,0.544219970703125,-214.0,-109.0],ctrans,1,0,0,time);
			place("sprite205",hot_canvas,ctx,[1.0,0.0,0.0,1.0,-484.0,-11.0],ctrans,1,(1+time)%10,0,time);
			place("sprite207",hot_canvas,ctx,[0.1964111328125,0.0,0.0,0.1964111328125,642.0,168.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,35)),1,(0+time)%1,0,time);
			place("sprite207",hot_canvas,ctx,[0.1964111328125,0.0,0.0,0.1964111328125,247.0,-691.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,35)),1,(0+time)%1,0,time);
			break;
		case 22:
			place("sprite198",hot_canvas,ctx,[1.0,0.0,0.0,1.0,-118.0,50.0],ctrans,1,(2+time)%20,0,time);
			place("shape208",hot_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			place("shape200",hot_canvas,ctx,[0.113433837890625,-9.46044921875E-4,0.0020751953125,0.248748779296875,-1337.0,-585.0],ctrans,1,0,0,time);
			place("shape201",hot_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			place("shape202",hot_canvas,ctx,[1.0,0.0,0.0,0.544219970703125,-214.0,-109.0],ctrans,1,0,0,time);
			place("sprite205",hot_canvas,ctx,[1.0,0.0,0.0,1.0,-484.0,-11.0],ctrans,1,(2+time)%10,0,time);
			place("sprite207",hot_canvas,ctx,[0.1964111328125,0.0,0.0,0.1964111328125,642.0,186.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,60)),1,(0+time)%1,0,time);
			place("sprite207",hot_canvas,ctx,[0.1964111328125,0.0,0.0,0.1964111328125,247.0,-673.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,60)),1,(0+time)%1,0,time);
			break;
		case 23:
			place("sprite198",hot_canvas,ctx,[1.0,0.0,0.0,1.0,-118.0,50.0],ctrans,1,(3+time)%20,0,time);
			place("shape208",hot_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			place("shape200",hot_canvas,ctx,[0.113433837890625,-9.46044921875E-4,0.0020751953125,0.248748779296875,-1337.0,-585.0],ctrans,1,0,0,time);
			place("shape201",hot_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			place("shape202",hot_canvas,ctx,[1.0,0.0,0.0,0.544219970703125,-214.0,-109.0],ctrans,1,0,0,time);
			place("sprite205",hot_canvas,ctx,[1.0,0.0,0.0,1.0,-484.0,-11.0],ctrans,1,(3+time)%10,0,time);
			place("sprite207",hot_canvas,ctx,[0.1964111328125,0.0,0.0,0.1964111328125,642.0,204.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,84)),1,(0+time)%1,0,time);
			place("sprite207",hot_canvas,ctx,[0.1964111328125,0.0,0.0,0.1964111328125,247.0,-655.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,84)),1,(0+time)%1,0,time);
			break;
		case 24:
			place("sprite198",hot_canvas,ctx,[1.0,0.0,0.0,1.0,-118.0,50.0],ctrans,1,(4+time)%20,0,time);
			place("shape208",hot_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			place("shape200",hot_canvas,ctx,[0.113433837890625,-9.46044921875E-4,0.0020751953125,0.248748779296875,-1337.0,-585.0],ctrans,1,0,0,time);
			place("shape201",hot_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			place("shape202",hot_canvas,ctx,[1.0,0.0,0.0,0.544219970703125,-214.0,-109.0],ctrans,1,0,0,time);
			place("sprite205",hot_canvas,ctx,[1.0,0.0,0.0,1.0,-484.0,-11.0],ctrans,1,(4+time)%10,0,time);
			place("sprite207",hot_canvas,ctx,[0.1964111328125,0.0,0.0,0.1964111328125,642.0,222.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,109)),1,(0+time)%1,0,time);
			place("sprite207",hot_canvas,ctx,[0.1964111328125,0.0,0.0,0.1964111328125,247.0,-637.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,109)),1,(0+time)%1,0,time);
			break;
		case 25:
			place("sprite198",hot_canvas,ctx,[1.0,0.0,0.0,1.0,-118.0,50.0],ctrans,1,(5+time)%20,0,time);
			place("shape199",hot_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			place("shape200",hot_canvas,ctx,[0.072113037109375,-0.087799072265625,0.192535400390625,0.15814208984375,-1883.0,-209.0],ctrans,1,0,0,time);
			place("shape201",hot_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			place("shape202",hot_canvas,ctx,[1.0,0.0,0.0,0.544219970703125,-214.0,-109.0],ctrans,1,0,0,time);
			place("sprite205",hot_canvas,ctx,[1.0,0.0,0.0,1.0,-484.0,-11.0],ctrans,1,(5+time)%10,0,time);
			place("sprite207",hot_canvas,ctx,[0.1964111328125,0.0,0.0,0.1964111328125,660.0,115.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,35)),1,(0+time)%1,0,time);
			place("sprite207",hot_canvas,ctx,[0.1964111328125,0.0,0.0,0.1964111328125,-588.0,-490.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,35)),1,(0+time)%1,0,time);
			break;
	}
}

function shape191(ctx,ctrans,frame,ratio,time){
	var pathData="M 5388 -4291 Q 5782 -4292 5782 -3875 L 5782 4230 Q 5782 4646 5388 4646 L -5385 4646 Q -5778 4646 -5778 4230 L -5778 -3875 Q -5778 -4292 -5385 -4291 L 5388 -4291";
	ctx.fillStyle=tocolor(ctrans.apply([102,204,255,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
}

function sprite210(ctx,ctrans,frame,ratio,time){
	ctx.save();
	ctx.transform(1,0,0,1,420.85,238.45);
	var clips = [];
	var frame_cnt = 1;
	frame = frame % frame_cnt;
	switch(frame){
		case 0:
			place("shape191",hot_canvas,ctx,[0.05,0.0,0.0,0.05,0.0,0.0],ctrans,1,0,0,time);
			place("sprite193",hot_canvas,ctx,[0.05,0.0,0.0,0.05,-420.85,11.6],ctrans,1,(0+time)%74,0,time);
			place("sprite209",hot_canvas,ctx,[0.108721923828125,5.25665283203125E-4,-5.2337646484375E-4,0.108721923828125,11.75,-8.0],ctrans,1,(0+time)%26,0,time);
			break;
	}
	ctx.restore();
}

var frame = -1;
var time = 0;
var frames = [];
frames.push(0);

var backgroundColor = "#ffffff";
var originalWidth = 834;
var originalHeight= 561;
function nextFrame(ctx,ctrans){
	var oldframe = frame;
	frame = (frame+1)%frames.length;
	if(frame==oldframe){time++;}else{time=0;};
	drawFrame();
}

function drawFrame(){
	ctx.fillStyle = backgroundColor;
	ctx.fillRect(0,0,hot_canvas.width,hot_canvas.height);
	ctx.save();
	ctx.transform(hot_canvas.width/originalWidth,0,0,hot_canvas.height/originalHeight,0,0);
	sprite210(ctx,ctrans,frames[frame],0,time);
	ctx.restore();
}

let frame_ctrl = null;
nextFrame(ctx, ctrans);

return {
    start: function(){
        frame_ctrl = window.setInterval(function(){nextFrame(ctx,ctrans);},33);
		hot_canvas.classList.add("show");
    },
    stop: function(){
        clearInterval(frame_ctrl);
		hot_canvas.classList.remove("show");
    },
	show: function(){
		hot_canvas.classList.add("show");
	}
}

})();