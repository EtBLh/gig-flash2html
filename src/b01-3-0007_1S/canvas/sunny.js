let sunny_controller = (() => {
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
     var width = hot_canvas.width;
     var height = hot_canvas.height;
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

var sunny_canvas=document.getElementById("sunny");
var ctx=sunny_canvas.getContext("2d");
enhanceContext(ctx);
var ctrans = new cxform(0,0,0,0,255,255,255,255);

var scalingGrids = {};
var boundRects = {};
function shape128(ctx,ctrans,frame,ratio,time){
	var pathData="M 402 350 L 405 350 Q 424 348 437 359 L 434 361 402 350";
	ctx.fillStyle=tocolor(ctrans.apply([253,236,208,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M -921 -838 Q -850 -827 -775 -768 -693 -704 -604 -583 -338 -218 -188 -73 -161 60 -284 43 L -396 -34 Q -897 -384 -983 -489 -1101 -618 -1117 -676 -1134 -735 -1087 -797 -1008 -854 -921 -838";
	ctx.fillStyle=tocolor(ctrans.apply([253,236,208,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M -921 -838 Q -850 -827 -775 -768 -693 -704 -604 -583 -338 -218 -188 -73 M -284 43 L -396 -34 Q -897 -384 -983 -489";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([204,102,0,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="butt";
	ctx.lineJoin="miter";
	ctx.miterLimit=3.0;
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M -203 -87 Q 72 177 281 287 L 336 314 382 334 387 336 419 346 497 358 679 379 Q 788 390 844 422 L 975 496 1069 550 Q 1136 618 1118 680 1100 743 948 627 796 512 710 486 622 462 602 499 582 536 664 622 744 708 714 799 684 891 626 785 568 680 483 604 L 337 468 Q 274 407 132 319 L -300 27 Q -278 -42 -203 -87";
	ctx.fillStyle=tocolor(ctrans.apply([253,236,208,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M -203 -87 Q 72 177 281 287 L 336 314 382 334 387 336 419 346 497 358 679 379 Q 788 390 844 422 L 975 496 1069 550 Q 1136 618 1118 680 1100 743 948 627 796 512 710 486 622 462 602 499 582 536 664 622 744 708 714 799 684 891 626 785 568 680 483 604 L 337 468 Q 274 407 132 319 L -300 27";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([204,102,0,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="butt";
	ctx.lineJoin="miter";
	ctx.miterLimit=3.0;
	drawPath(ctx,pathData,true,scaleMode);

}

function shape129(ctx,ctrans,frame,ratio,time){
	var pathData="M 358 -986 Q 671 -884 922 -716 1292 -470 1296 -38 1299 176 1227 342 1666 352 1491 744 1382 988 1188 975 1129 971 1067 943 L 1017 915 Q 879 1131 592 1310 13 1669 -739 1483 -1493 1297 -1591 576 -1622 350 -1610 99 L -1593 -87 Q -1368 -1211 -689 -1158 -11 -1106 358 -986";
	ctx.fillStyle=tocolor(ctrans.apply([253,236,208,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 358 -986 Q -11 -1106 -689 -1158 -1368 -1211 -1593 -87 L -1610 99 Q -1622 350 -1591 576 -1493 1297 -739 1483 13 1669 592 1310 879 1131 1017 915 L 1067 943 Q 1129 971 1188 975 1382 988 1491 744 1666 352 1227 342 1299 176 1296 -38 1292 -470 922 -716 671 -884 358 -986 Z";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([204,102,0,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="butt";
	ctx.lineJoin="miter";
	ctx.miterLimit=3.0;
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M -1128 -984 Q -1101 -899 -1069 -867 -1297 -781 -1635 -258 L -1832 -329 -1817 -601 -1707 -658 -1634 -779 -1670 -908 Q -1640 -1025 -1405 -1232 -1287 -1337 -1177 -1417 -1186 -1153 -1128 -984";
	ctx.fillStyle=tocolor(ctrans.apply([219,14,89,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M -1128 -984 Q -1186 -1153 -1177 -1417 -1287 -1337 -1405 -1232 -1640 -1025 -1670 -908 L -1634 -779 -1707 -658 -1817 -601 -1832 -329 -1635 -258 Q -1297 -781 -1069 -867 -1101 -899 -1128 -984 Z";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([204,102,0,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="butt";
	ctx.lineJoin="miter";
	ctx.miterLimit=3.0;
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M 1816 -1044 Q 1805 -1034 1807 -1048 L 1816 -1044";
	var grd=ctx.createLinearGradient(-28.0,-1604.25,342.0,1210.25);
	grd.addColorStop(0.0,tocolor(ctrans.apply([254,129,204,1])));
	grd.addColorStop(1.0,tocolor(ctrans.apply([227,2,160,1])));
	ctx.fillStyle = grd;
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 1209 -939 Q 1354 -769 1465 -440 1858 -631 1863 -1020 2044 -920 2085 -734 2107 -628 2083 -541 L 2170 -389 Q 2124 -393 2092 -368 2026 -315 2096 -165 2165 -11 2134 78 2117 124 2089 137 1906 438 1704 387 1501 335 1517 331 L 1375 361 Q 1340 389 1288 471 1173 650 1124 735 1074 819 731 1137 1085 457 949 103 813 -252 652 -309 L 72 -527 Q -353 -691 -511 -772 -656 -847 -1152 -792 -1409 -600 -1506 -242 -1603 116 -1624 455 -1630 360 -1744 189 -1790 -380 -1598 -541 -1406 -702 -1408 -806 -1408 -1077 -1220 -1201 -1032 -1326 -632 -1500 -233 -1675 361 -1470 920 -1278 1209 -939";
	var grd=ctx.createLinearGradient(-28.0,-1604.25,342.0,1210.25);
	grd.addColorStop(0.0,tocolor(ctrans.apply([254,129,204,1])));
	grd.addColorStop(1.0,tocolor(ctrans.apply([186,1,1,1])));
	ctx.fillStyle = grd;
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 1209 -939 Q 920 -1278 361 -1470 -233 -1675 -632 -1500 -1032 -1326 -1220 -1201 -1408 -1077 -1408 -806 -1406 -702 -1598 -541 -1790 -380 -1744 189 -1630 360 -1624 455 -1603 116 -1506 -242 -1409 -600 -1152 -792 -656 -847 -511 -772 -353 -691 72 -527 L 652 -309 Q 813 -252 949 103 1085 457 731 1137 1074 819 1124 735 1173 650 1288 471 1340 389 1375 361 L 1517 331 Q 1501 335 1704 387 1906 438 2089 137 2117 124 2134 78 2165 -11 2096 -165 2026 -315 2092 -368 2124 -393 2170 -389 L 2083 -541 Q 2107 -628 2085 -734 2044 -920 1863 -1020 1858 -631 1465 -440 1354 -769 1209 -939 Z";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([229,100,14,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M 124 -646 L 530 -546 Q 992 -457 1277 -508 M 885 -264 Q 1235 -301 1347 -449 M -164 -1048 Q -464 -1102 -625 -968 M -24 -880 Q -145 -909 -291 -850";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([204,102,0,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="butt";
	ctx.lineJoin="miter";
	ctx.miterLimit=3.0;
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M -652 551 Q -642 691 -760 654 L -703 775";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([204,102,0,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="butt";
	ctx.lineJoin="miter";
	ctx.miterLimit=3.0;
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M -964 835 Q -990 1015 -1140 1125 -1190 1161 -1244 1182 -1376 1158 -1492 907 -1608 654 -1603 379 -1487 326 -1350 343 -1164 367 -1050 511 -938 655 -964 835";
	drawPath(ctx,pathData,false);
	ctx.fillStyle=tocolor(ctrans.apply([255,255,255,0.0]));
	ctx.fill("evenodd");
	ctx.save();
	ctx.clip();
	ctx.transform(-0.0040130615234375,0.02716064453125,-0.0283660888671875,-0.0035858154296875,-1415,777);
	var grd=ctx.createRadialGradient(0.0,0,0,0,0,16384);
	grd.addColorStop(0.0,tocolor(ctrans.apply([252,121,253,0.5019608])));
	grd.addColorStop(1.0,tocolor(ctrans.apply([255,255,255,0.0])));
	ctx.fillStyle = grd;
	ctx.fillRect(-16384,-16384,32768,32768);
	ctx.restore();
	var pathData="M 504 834 Q 694 834 828 961 872 1003 902 1051 776 1189 582 1310 361 1447 116 1505 45 1401 45 1270 45 1089 179 961 314 834 504 834";
	drawPath(ctx,pathData,false);
	ctx.fillStyle=tocolor(ctrans.apply([255,255,255,0.0]));
	ctx.fill("evenodd");
	ctx.save();
	ctx.clip();
	ctx.transform(0.0286865234375,0,0,0.027435302734375,504,1270);
	var grd=ctx.createRadialGradient(0.0,0,0,0,0,16384);
	grd.addColorStop(0.0,tocolor(ctrans.apply([254,103,254,0.5019608])));
	grd.addColorStop(1.0,tocolor(ctrans.apply([255,255,255,0.0])));
	ctx.fillStyle = grd;
	ctx.fillRect(-16384,-16384,32768,32768);
	ctx.restore();
	var pathData="M -757 239 Q -808 363 -939 417 -1070 470 -1204 422 -1337 373 -1394 250 -1451 127 -1399 2 -1346 -122 -1215 -175 -1084 -229 -952 -181 -818 -131 -761 -8 -704 115 -757 239";
	ctx.fillStyle=tocolor(ctrans.apply([255,255,255,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M -757 239 Q -808 363 -939 417 -1070 470 -1204 422 -1337 373 -1394 250 -1451 127 -1399 2 -1346 -122 -1215 -175 -1084 -229 -952 -181 -818 -131 -761 -8 -704 115 -757 239 Z";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([204,102,0,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M -995 -180 Q -886 -140 -839 -38 -792 63 -835 166 -878 268 -986 312 -1094 356 -1203 316 -1313 275 -1360 174 -1407 73 -1364 -29 -1321 -132 -1213 -176 -1105 -220 -995 -180";
	var grd=ctx.createLinearGradient(-1213.5,-177.25,-986.5,311.25);
	grd.addColorStop(0.0,tocolor(ctrans.apply([103,194,254,1])));
	grd.addColorStop(1.0,tocolor(ctrans.apply([9,132,255,1])));
	ctx.fillStyle = grd;
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 556 589 Q 496 728 353 784 211 839 70 778 -69 717 -125 575 -180 433 -119 292 -58 153 84 98 227 42 367 103 507 165 562 307 618 449 556 589";
	ctx.fillStyle=tocolor(ctrans.apply([255,255,255,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 556 589 Q 496 728 353 784 211 839 70 778 -69 717 -125 575 -180 433 -119 292 -58 153 84 98 227 42 367 103 507 165 562 307 618 449 556 589 Z";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([204,102,0,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M 320 101 Q 435 152 481 269 527 386 477 501 426 616 309 662 192 708 77 658 -39 607 -84 490 -130 372 -80 258 -29 142 88 97 205 51 320 101";
	var grd=ctx.createLinearGradient(88.5,96.25,309.5,661.75);
	grd.addColorStop(0.0,tocolor(ctrans.apply([103,194,254,1])));
	grd.addColorStop(1.0,tocolor(ctrans.apply([9,132,255,1])));
	ctx.fillStyle = grd;
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M -452 1209 L -483 1228 Q -682 1377 -844 1207 -875 1178 -895 1127 -682 1086 -452 1209";
	ctx.fillStyle=tocolor(ctrans.apply([255,153,153,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M -942 878 L -884 897 Q -737 957 -609 966 L -415 973 Q -373 972 -318 950 -365 1144 -452 1209 -682 1086 -895 1127 -932 1038 -942 878";
	ctx.fillStyle=tocolor(ctrans.apply([255,255,255,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M -318 950 Q -365 1144 -452 1209 L -483 1228 Q -682 1377 -844 1207 -875 1178 -895 1127 -932 1038 -942 878 M -452 1209 Q -682 1086 -895 1127";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([204,102,0,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M -318 950 L -250 916";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([204,102,0,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="miter";
	ctx.miterLimit=3.0;
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M -993 861 L -942 878";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([204,102,0,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="butt";
	ctx.lineJoin="miter";
	ctx.miterLimit=3.0;
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M -942 878 L -884 897 Q -737 957 -609 966 L -415 973 Q -373 972 -318 950";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([204,102,0,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="miter";
	ctx.miterLimit=3.0;
	drawPath(ctx,pathData,true,scaleMode);

}

function sprite130(ctx,ctrans,frame,ratio,time){
	var clips = [];
	var frame_cnt = 1;
	frame = frame % frame_cnt;
	switch(frame){
		case 0:
			place("shape129",sunny_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
	}
}

function shape131(ctx,ctrans,frame,ratio,time){
	var pathData="M -4224 -3782 L -4384 -4122 -4354 -4115 -4384 -4152 Q -4042 -4079 -3561 -3020 L -3544 -2982 Q -3485 -2795 -3409 -2741 -3488 -2995 -3430 -3203 L -3364 -3108 -3355 -3094 -3364 -3108 Q -3407 -3368 -3280 -3627 L -3220 -3495 -3212 -3499 Q -3160 -3858 -2947 -3950 L -2978 -3785 Q -2708 -4099 -2492 -4114 -2613 -3997 -2644 -3880 -2448 -4028 -2308 -3969 -2543 -3785 -2701 -3512 -2800 -3518 -2888 -3432 L -2877 -3521 -2888 -3432 Q -2800 -3518 -2701 -3512 -2637 -3509 -2568 -3466 -2663 -3493 -2690 -3452 -2577 -3447 -2518 -3370 -2596 -3391 -2661 -3370 -2501 -3345 -2398 -3267 -2311 -3201 -2266 -3096 -2247 -3053 -2235 -3003 L -2232 -2988 Q -2181 -2951 -2149 -2911 -2045 -2781 -2149 -2622 -2177 -2580 -2219 -2535 L -2263 -2497 -2272 -2491 -2274 -2509 -2279 -2551 -2269 -2561 -2263 -2562 -2285 -2655 -2230 -2625 -2229 -2625 -2228 -2628 Q -2176 -2732 -2287 -2856 -2451 -2961 -2535 -2763 L -2524 -2719 Q -2519 -2675 -2536 -2633 L -2517 -2627 -2531 -2571 -2548 -2457 -2549 -2439 -2549 -2379 -2704 -2356 -2794 -2350 Q -2872 -2352 -2974 -2379 L -2973 -2375 Q -2967 -2330 -2996 -2301 L -3007 -2290 Q -3083 -2401 -3307 -2388 L -3315 -2387 -3325 -2382 Q -3577 -2349 -3762 -2192 -3755 -2114 -3798 -2072 -3828 -2043 -4018 -2076 L -4044 -2086 -4075 -2105 Q -4118 -2135 -4152 -2191 L -4157 -2200 -4167 -2217 Q -4204 -2286 -4153 -2339 L -4137 -2353 Q -4133 -2349 -4120 -2346 L -4122 -2355 -4137 -2353 Q -4178 -2401 -4201 -2457 -4241 -2555 -4225 -2680 L -4224 -2688 Q -4375 -2867 -4549 -3033 L -4628 -3108 Q -4695 -3148 -4744 -3193 L -4734 -3202 Q -4709 -3222 -4678 -3231 L -4616 -3240 -4531 -3227 -4479 -3210 -4451 -3192 -4479 -3210 -4531 -3227 -4616 -3240 -4678 -3231 Q -4709 -3222 -4734 -3202 -4957 -3395 -5212 -3570 -5348 -3717 -5233 -3761 L -4994 -3605 Q -5046 -3672 -5070 -3723 -4874 -3691 -4678 -3564 L -4591 -3504 -4631 -3513 -4591 -3504 -4678 -3564 Q -4874 -3691 -5070 -3723 L -5134 -3732 -5087 -3775 Q -5098 -3832 -5062 -3864 -5012 -3889 -4952 -3852 -4775 -3908 -4564 -3762 -4694 -3928 -4948 -4093 -4573 -4205 -4224 -3782 L -4204 -3739 -4224 -3782 M -3455 -2583 Q -3523 -2641 -3585 -2736 -3627 -2801 -3666 -2883 L -3673 -2901 Q -4058 -4022 -4354 -4115 -4058 -4022 -3673 -2901 L -3666 -2883 Q -3627 -2801 -3585 -2736 -3523 -2641 -3455 -2583 -3291 -2568 -3348 -2719 -3291 -2568 -3455 -2583 -3669 -2568 -3870 -2652 -3914 -2667 -3953 -2685 -3914 -2667 -3870 -2652 -3669 -2568 -3455 -2583 M -3409 -2741 L -3386 -2727 -3348 -2719 -3386 -2727 -3409 -2741 M -4631 -3513 L -4678 -3564 -4631 -3513 Q -4742 -3535 -4831 -3498 -4742 -3535 -4631 -3513 M -4831 -3498 L -4994 -3605 -4831 -3498 Q -4905 -3469 -4963 -3401 -4727 -3355 -4536 -3245 L -4479 -3210 -4536 -3245 Q -4727 -3355 -4963 -3401 -4905 -3469 -4831 -3498 M -3953 -2685 Q -4142 -2772 -4204 -2952 -4468 -3013 -4628 -3108 -4468 -3013 -4204 -2952 -4142 -2772 -3953 -2685 M -4531 -3227 L -4536 -3245 -4531 -3227 M -4616 -3240 Q -4689 -3292 -4678 -3231 -4689 -3292 -4616 -3240 M -4219 -2719 L -4224 -2688 -4219 -2719 M -4519 -3447 L -4591 -3504 -4519 -3447 M -4144 -2479 L -4122 -2355 -4144 -2479 M -4099 -2224 L -4120 -2346 -4099 -2224 M -3259 -2749 Q -3320 -2733 -3386 -2727 -3320 -2733 -3259 -2749 M -3874 -2472 L -3865 -2457 Q -3771 -2294 -3762 -2192 -3771 -2294 -3865 -2457 L -3874 -2472 M -3028 -3297 Q -3171 -3228 -3219 -2847 L -3222 -2832 -3234 -2745 Q -3239 -2674 -3227 -2615 -3208 -2518 -3142 -2457 -3086 -2405 -2996 -2378 L -2973 -2375 -2996 -2378 Q -3086 -2405 -3142 -2457 -3208 -2518 -3227 -2615 -3239 -2674 -3234 -2745 L -3222 -2832 -3219 -2847 Q -3171 -3228 -3028 -3297 L -3025 -3305 -3028 -3297 M -3022 -3320 L -3025 -3305 -3022 -3320 Q -2990 -3458 -2877 -3521 -2990 -3458 -3022 -3320 M -2657 -3859 L -2644 -3880 -2657 -3859 M -5087 -3775 Q -5023 -3829 -4952 -3852 -5023 -3829 -5087 -3775 M -2272 -2991 Q -2261 -3018 -2262 -3051 -2263 -3074 -2269 -3093 -2276 -3113 -2289 -3129 -2315 -3162 -2348 -3160 -2382 -3159 -2404 -3124 -2427 -3091 -2425 -3044 -2423 -2997 -2397 -2964 -2372 -2933 -2338 -2934 L -2319 -2938 -2310 -2943 Q -2298 -2946 -2290 -2958 L -2283 -2969 Q -2276 -2979 -2272 -2991 M -2371 -2435 L -2423 -2414 -2424 -2446 -2424 -2457 -2416 -2540 Q -2390 -2526 -2366 -2522 L -2374 -2481 -2374 -2457 -2371 -2435 M -2719 -3342 Q -2691 -3361 -2661 -3370 -2691 -3361 -2719 -3342 M -2891 -3409 L -2888 -3430 -2888 -3432 -2888 -3430 -2891 -3409 M -3212 -3477 L -3220 -3495 -3212 -3477 M -2617 -2842 Q -2599 -2879 -2599 -2926 -2599 -2994 -2638 -3042 -2677 -3088 -2731 -3088 -2785 -3088 -2824 -3042 -2863 -2994 -2863 -2926 -2863 -2859 -2824 -2812 -2785 -2764 -2731 -2764 -2700 -2764 -2674 -2779 L -2660 -2789 Q -2648 -2793 -2638 -2803 -2625 -2817 -2622 -2835 L -2617 -2842 M -2561 -2817 Q -2544 -2790 -2535 -2763 -2544 -2790 -2561 -2817 M -2606 -2539 Q -2556 -2584 -2536 -2633 -2556 -2584 -2606 -2539 M -2263 -2562 L -2263 -2560 -2263 -2562";
	ctx.fillStyle=tocolor(ctrans.apply([242,26,77,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M -4017 -1852 Q -3950 -1679 -4011 -1569 -4078 -1539 -4084 -1631 L -4085 -1649 -4087 -1684 Q -4100 -1875 -4231 -1925 -4217 -1990 -4127 -1962 -4154 -2136 -4264 -2309 L -4267 -2316 -4234 -2382 -4153 -2339 Q -4204 -2286 -4167 -2217 L -4157 -2200 -4152 -2191 Q -4118 -2135 -4075 -2105 L -4028 -1975 Q -3741 -1847 -3884 -1592 -3961 -1556 -3943 -1680 L -3938 -1707 -3937 -1729 Q -3934 -1825 -4017 -1852 L -4016 -1872 -4017 -1852 M -3469 -2031 L -3466 -2029 -3320 -1875 Q -3129 -1761 -3148 -1570 -3173 -1518 -3210 -1566 -3232 -1673 -3285 -1700 -3256 -1613 -3295 -1534 -3345 -1503 -3377 -1588 -3319 -1751 -3583 -1836 -3555 -1920 -3437 -1891 L -3575 -2023 -3469 -2031 M -3401 -1857 L -3437 -1891 -3401 -1857 M -3326 -1782 L -3295 -1726 -3285 -1700 -3295 -1726 -3326 -1782";
	ctx.fillStyle=tocolor(ctrans.apply([207,151,0,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M -3798 -2072 Q -3755 -2114 -3762 -2192 -3577 -2349 -3325 -2382 L -3307 -2388 Q -3083 -2401 -3007 -2290 -3104 -2197 -3200 -2136 -3335 -2052 -3469 -2031 L -3575 -2023 -3581 -2023 Q -3690 -2028 -3798 -2072";
	ctx.fillStyle=tocolor(ctrans.apply([255,127,23,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M -2319 -2938 L -2338 -2934 Q -2372 -2933 -2397 -2964 -2423 -2997 -2425 -3044 -2427 -3091 -2404 -3124 -2382 -3159 -2348 -3160 -2315 -3162 -2289 -3129 -2276 -3113 -2269 -3093 -2263 -3074 -2262 -3051 -2261 -3018 -2272 -2991 L -2278 -2994 Q -2278 -3015 -2290 -3031 -2302 -3046 -2320 -3046 -2338 -3046 -2350 -3031 -2362 -3015 -2362 -2994 -2362 -2973 -2350 -2958 -2338 -2941 -2320 -2941 L -2319 -2938 M -2674 -2779 Q -2700 -2764 -2731 -2764 -2785 -2764 -2824 -2812 -2863 -2859 -2863 -2926 -2863 -2994 -2824 -3042 -2785 -3088 -2731 -3088 -2677 -3088 -2638 -3042 -2599 -2994 -2599 -2926 -2599 -2879 -2617 -2842 L -2621 -2844 Q -2621 -2868 -2638 -2884 -2654 -2901 -2678 -2901 -2702 -2901 -2719 -2884 -2735 -2868 -2735 -2844 -2735 -2820 -2719 -2803 -2702 -2787 -2678 -2787 L -2674 -2779";
	ctx.fillStyle=tocolor(ctrans.apply([255,255,255,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M -2320 -2941 Q -2338 -2941 -2350 -2958 -2362 -2973 -2362 -2994 -2362 -3015 -2350 -3031 -2338 -3046 -2320 -3046 -2302 -3046 -2290 -3031 -2278 -3015 -2278 -2994 -2278 -2980 -2283 -2969 -2295 -2951 -2310 -2943 L -2320 -2941 M -2678 -2787 Q -2702 -2787 -2719 -2803 -2735 -2820 -2735 -2844 -2735 -2868 -2719 -2884 -2702 -2901 -2678 -2901 -2654 -2901 -2638 -2884 -2621 -2868 -2621 -2844 L -2622 -2835 -2638 -2812 -2660 -2789 -2678 -2787";
	ctx.fillStyle=tocolor(ctrans.apply([0,0,0,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M -2486 -2716 L -2524 -2719 -2486 -2716 -2498 -2684 -2517 -2627 -2536 -2633 Q -2519 -2675 -2524 -2719 L -2535 -2763 Q -2451 -2961 -2287 -2856 -2176 -2732 -2228 -2628 L -2230 -2625 -2285 -2655 -2290 -2658 -2314 -2669 -2320 -2671 -2336 -2678 -2373 -2691 Q -2430 -2709 -2486 -2716 M -2413 -2558 L -2395 -2629 -2390 -2628 -2267 -2565 -2269 -2561 -2279 -2551 Q -2317 -2515 -2366 -2522 -2390 -2526 -2416 -2540 L -2413 -2558";
	ctx.fillStyle=tocolor(ctrans.apply([255,186,0,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M -2272 -2491 L -2265 -2436 -2263 -2416 -2266 -2407 Q -2302 -2302 -2358 -2388 L -2362 -2394 -2362 -2406 -2370 -2431 -2371 -2435 -2374 -2457 -2374 -2481 -2366 -2522 Q -2317 -2515 -2279 -2551 L -2274 -2509 Q -2316 -2455 -2374 -2481 -2316 -2455 -2274 -2509 L -2272 -2491 M -2423 -2414 L -2417 -2353 -2417 -2352 Q -2453 -2117 -2546 -2344 L -2547 -2349 -2549 -2379 -2549 -2439 Q -2532 -2452 -2512 -2457 -2485 -2464 -2455 -2457 L -2424 -2446 -2455 -2457 Q -2485 -2464 -2512 -2457 -2532 -2452 -2549 -2439 L -2548 -2457 -2531 -2571 -2517 -2627 -2498 -2684 -2486 -2716 Q -2430 -2709 -2373 -2691 L -2336 -2678 -2320 -2671 -2317 -2667 -2314 -2669 -2290 -2658 -2285 -2655 -2263 -2562 -2265 -2565 -2285 -2605 Q -2300 -2628 -2318 -2637 L -2323 -2639 -2388 -2634 -2390 -2628 -2394 -2631 -2395 -2629 -2413 -2558 Q -2472 -2603 -2531 -2571 -2472 -2603 -2413 -2558 L -2416 -2540 -2424 -2457 -2424 -2446 -2423 -2414 Q -2481 -2394 -2549 -2379 -2481 -2394 -2423 -2414 M -2498 -2684 Q -2448 -2691 -2382 -2644 L -2388 -2634 -2382 -2644 Q -2448 -2691 -2498 -2684 M -2336 -2678 L -2323 -2639 -2336 -2678 M -2370 -2431 Q -2309 -2407 -2265 -2436 -2309 -2407 -2370 -2431 M -2547 -2349 Q -2491 -2394 -2417 -2353 -2491 -2394 -2547 -2349";
	ctx.fillStyle=tocolor(ctrans.apply([153,102,51,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M -2390 -2628 L -2388 -2634 -2323 -2639 -2318 -2637 Q -2300 -2628 -2285 -2605 L -2265 -2565 -2267 -2565 -2390 -2628";
	ctx.fillStyle=tocolor(ctrans.apply([153,51,51,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M -4384 -4122 L -4391 -4137 M -4354 -4115 L -4384 -4122 -4224 -3782 -4204 -3739 M -4354 -4115 Q -4058 -4022 -3673 -2901 L -3666 -2883 Q -3627 -2801 -3585 -2736 -3523 -2641 -3455 -2583 M -3348 -2719 L -3386 -2727 -3409 -2741 Q -3485 -2795 -3544 -2982 L -3561 -3020 Q -4042 -4079 -4384 -4152 M -4631 -3513 L -4591 -3504 -4678 -3564 Q -4874 -3691 -5070 -3723 L -5134 -3732 -5087 -3775 Q -5023 -3829 -4952 -3852 -4775 -3908 -4564 -3762 -4694 -3928 -4948 -4093 -4573 -4205 -4224 -3782 M -4831 -3498 Q -4742 -3535 -4631 -3513 M -4451 -3192 L -4479 -3210 -4531 -3227 -4616 -3240 -4678 -3231 Q -4709 -3222 -4734 -3202 L -4744 -3193 Q -4695 -3148 -4628 -3108 -4468 -3013 -4204 -2952 -4142 -2772 -3953 -2685 M -4831 -3498 Q -4905 -3469 -4963 -3401 -4727 -3355 -4536 -3245 L -4479 -3210 M -4591 -3504 L -4519 -3447 M -3028 -3297 L -3025 -3305 M -3022 -3320 Q -2990 -3458 -2877 -3521 M -2701 -3512 Q -2543 -3785 -2308 -3969";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([51,0,0,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M -3455 -2583 Q -3291 -2568 -3348 -2719 M -3364 -3108 L -3430 -3203 Q -3488 -2995 -3409 -2741 M -3364 -3108 L -3355 -3094 M -3220 -3495 L -3280 -3627 Q -3407 -3368 -3364 -3108 M -4678 -3564 L -4631 -3513 M -5070 -3723 Q -5046 -3672 -4994 -3605 L -4831 -3498 M -3953 -2685 Q -3914 -2667 -3870 -2652 -3669 -2568 -3455 -2583 M -4536 -3245 L -4531 -3227 M -4628 -3108 L -4549 -3033 Q -4375 -2867 -4224 -2688 L -4219 -2719 M -4678 -3231 Q -4689 -3292 -4616 -3240 M -4224 -2688 L -4225 -2680 Q -4241 -2555 -4201 -2457 -4178 -2401 -4137 -2353 L -4153 -2339 Q -4204 -2286 -4167 -2217 L -4157 -2200 -4152 -2191 Q -4118 -2135 -4075 -2105 L -4044 -2086 -4018 -2076 Q -3828 -2043 -3798 -2072 -3755 -2114 -3762 -2192 -3771 -2294 -3865 -2457 L -3874 -2472 M -4122 -2355 L -4144 -2479 M -4153 -2339 L -4234 -2382 -4267 -2316 -4264 -2309 Q -4154 -2136 -4127 -1962 -4217 -1990 -4231 -1925 -4100 -1875 -4087 -1684 L -4085 -1649 -4084 -1631 Q -4078 -1539 -4011 -1569 -3950 -1679 -4017 -1852 L -4016 -1872 M -4122 -2355 L -4120 -2346 -4099 -2224 M -4120 -2346 Q -4133 -2349 -4137 -2353 M -3386 -2727 Q -3320 -2733 -3259 -2749 M -3307 -2388 L -3315 -2387 -3325 -2382 Q -3577 -2349 -3762 -2192 M -3307 -2388 Q -3083 -2401 -3007 -2290 L -2996 -2301 Q -2967 -2330 -2973 -2375 L -2996 -2378 Q -3086 -2405 -3142 -2457 -3208 -2518 -3227 -2615 -3239 -2674 -3234 -2745 L -3222 -2832 -3219 -2847 Q -3171 -3228 -3028 -3297 M -3025 -3305 L -3022 -3320 M -2877 -3521 L -2888 -3432 Q -2800 -3518 -2701 -3512 -2637 -3509 -2568 -3466 -2663 -3493 -2690 -3452 -2577 -3447 -2518 -3370 -2596 -3391 -2661 -3370 -2501 -3345 -2398 -3267 -2311 -3201 -2266 -3096 -2247 -3053 -2235 -3003 L -2232 -2988 Q -2181 -2951 -2149 -2911 -2045 -2781 -2149 -2622 -2177 -2580 -2219 -2535 L -2263 -2497 -2272 -2491 -2265 -2436 -2263 -2416 -2266 -2407 Q -2302 -2302 -2358 -2388 L -2362 -2394 -2362 -2406 -2370 -2431 -2371 -2435 -2423 -2414 -2417 -2353 -2417 -2352 Q -2453 -2117 -2546 -2344 L -2547 -2349 -2549 -2379 -2704 -2356 -2794 -2350 Q -2872 -2352 -2974 -2379 L -2973 -2375 M -2308 -3969 Q -2448 -4028 -2644 -3880 L -2657 -3859 M -3285 -1700 Q -3232 -1673 -3210 -1566 -3173 -1518 -3148 -1570 -3129 -1761 -3320 -1875 L -3466 -2029 -3469 -2031 -3575 -2023 -3437 -1891 -3401 -1857 M -3575 -2023 L -3581 -2023 Q -3690 -2028 -3798 -2072 M -5087 -3775 Q -5098 -3832 -5062 -3864 -5012 -3889 -4952 -3852 M -4734 -3202 Q -4957 -3395 -5212 -3570 -5348 -3717 -5233 -3761 L -4994 -3605 M -3437 -1891 Q -3555 -1920 -3583 -1836 -3319 -1751 -3377 -1588 -3345 -1503 -3295 -1534 -3256 -1613 -3285 -1700 L -3295 -1726 -3326 -1782 M -4075 -2105 L -4028 -1975 Q -3741 -1847 -3884 -1592 -3961 -1556 -3943 -1680 L -3938 -1707 -3937 -1729 Q -3934 -1825 -4017 -1852 M -4231 -1925 L -4234 -1902 M -2272 -2991 Q -2261 -3018 -2262 -3051 -2263 -3074 -2269 -3093 -2276 -3113 -2289 -3129 -2315 -3162 -2348 -3160 -2382 -3159 -2404 -3124 -2427 -3091 -2425 -3044 -2423 -2997 -2397 -2964 -2372 -2933 -2338 -2934 L -2319 -2938 -2310 -2943 -2320 -2941 Q -2338 -2941 -2350 -2958 -2362 -2973 -2362 -2994 -2362 -3015 -2350 -3031 -2338 -3046 -2320 -3046 -2302 -3046 -2290 -3031 -2278 -3015 -2278 -2994 -2278 -2980 -2283 -2969 L -2290 -2958 Q -2298 -2946 -2310 -2943 -2295 -2951 -2283 -2969 -2276 -2979 -2272 -2991 M -3212 -3499 Q -3160 -3858 -2947 -3950 L -2978 -3785 Q -2708 -4099 -2492 -4114 -2613 -3997 -2644 -3880 M -3220 -3495 L -3212 -3477 M -2888 -3432 L -2888 -3430 -2891 -3409 M -2661 -3370 Q -2691 -3361 -2719 -3342 M -2674 -2779 Q -2700 -2764 -2731 -2764 -2785 -2764 -2824 -2812 -2863 -2859 -2863 -2926 -2863 -2994 -2824 -3042 -2785 -3088 -2731 -3088 -2677 -3088 -2638 -3042 -2599 -2994 -2599 -2926 -2599 -2879 -2617 -2842 L -2622 -2835 Q -2625 -2817 -2638 -2803 -2648 -2793 -2660 -2789 L -2674 -2779 M -2678 -2787 Q -2702 -2787 -2719 -2803 -2735 -2820 -2735 -2844 -2735 -2868 -2719 -2884 -2702 -2901 -2678 -2901 -2654 -2901 -2638 -2884 -2621 -2868 -2621 -2844 L -2622 -2835 -2638 -2812 -2660 -2789 -2678 -2787 M -2535 -2763 Q -2544 -2790 -2561 -2817 M -2524 -2719 L -2486 -2716 Q -2430 -2709 -2373 -2691 L -2336 -2678 -2320 -2671 -2314 -2669 -2290 -2658 -2285 -2655 -2230 -2625 -2229 -2625 -2228 -2628 Q -2176 -2732 -2287 -2856 -2451 -2961 -2535 -2763 L -2524 -2719 Q -2519 -2675 -2536 -2633 -2556 -2584 -2606 -2539 M -2517 -2627 L -2498 -2684 -2486 -2716 M -2517 -2627 L -2531 -2571 Q -2472 -2603 -2413 -2558 L -2395 -2629 -2394 -2631 -2390 -2628 -2388 -2634 -2382 -2644 Q -2448 -2691 -2498 -2684 M -3007 -2290 Q -3104 -2197 -3200 -2136 -3271 -1956 -3466 -2029 M -2549 -2439 L -2549 -2379 Q -2481 -2394 -2423 -2414 L -2424 -2446 -2455 -2457 Q -2485 -2464 -2512 -2457 -2532 -2452 -2549 -2439 L -2548 -2457 -2531 -2571 M -2320 -2671 L -2317 -2667 -2314 -2669 M -2265 -2565 L -2285 -2605 Q -2300 -2628 -2318 -2637 L -2323 -2639 -2388 -2634 M -2366 -2522 Q -2390 -2526 -2416 -2540 L -2424 -2457 -2424 -2446 M -2366 -2522 L -2374 -2481 Q -2316 -2455 -2274 -2509 L -2279 -2551 Q -2317 -2515 -2366 -2522 M -2416 -2540 L -2413 -2558 M -2263 -2562 L -2265 -2565 M -2267 -2565 L -2263 -2562 -2285 -2655 M -2263 -2562 L -2263 -2560 -2263 -2562 -2269 -2561 -2279 -2551 M -2267 -2565 L -2390 -2628 M -2272 -2491 L -2274 -2509 M -2323 -2639 L -2336 -2678 M -2374 -2481 L -2374 -2457 -2371 -2435 M -2265 -2436 Q -2309 -2407 -2370 -2431 M -2417 -2353 Q -2491 -2394 -2547 -2349 M -3200 -2136 Q -3335 -2052 -3469 -2031";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([51,0,0,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

}

function shape132(ctx,ctrans,frame,ratio,time){
	var pathData="M -4330 -3494 L -4409 -3602 -4330 -3494 -4369 -3571 -4378 -3589 -4409 -3602 Q -4618 -3902 -4726 -4235 L -4748 -4307 -4759 -4315 Q -4912 -4105 -4804 -3715 L -4841 -3722 -5030 -4069 Q -5107 -3857 -5020 -3586 L -5054 -3608 Q -5168 -3565 -5033 -3418 L -4907 -3329 Q -4856 -3235 -4787 -3133 -4927 -3218 -5096 -3416 -5182 -3094 -4619 -2711 -4901 -2851 -4750 -2612 -4655 -2534 -4565 -2479 -4510 -2446 -4456 -2420 L -4448 -2416 -4457 -2417 Q -4642 -2447 -4346 -2272 L -4325 -2266 Q -4174 -2213 -4063 -2212 L -4024 -2213 -3985 -2219 -3968 -2215 -3943 -2209 Q -3769 -2167 -3625 -2185 -3430 -2210 -3290 -2344 -3430 -2210 -3625 -2185 -3769 -2167 -3943 -2209 L -3968 -2215 -3958 -2201 -3943 -2203 -3943 -2209 -3943 -2203 -3941 -2194 -3958 -2201 -3974 -2186 Q -4024 -2134 -3988 -2065 L -3977 -2048 -3973 -2039 Q -3938 -1984 -3896 -1952 L -3865 -1934 -3839 -1924 Q -3647 -1891 -3619 -1919 -3575 -1963 -3583 -2039 -3587 -2101 -3625 -2185 -3587 -2101 -3583 -2039 -3397 -2197 -3145 -2230 L -3136 -2234 -3127 -2236 Q -2903 -2249 -2828 -2138 L -2816 -2149 Q -2788 -2177 -2794 -2222 L -2794 -2227 Q -2692 -2200 -2614 -2198 L -2525 -2204 -2369 -2227 -2369 -2287 -2369 -2305 Q -2365 -2360 -2351 -2419 L -2338 -2474 -2356 -2480 Q -2339 -2522 -2345 -2567 -2347 -2588 -2356 -2611 L -2354 -2612 Q -2317 -2701 -2261 -2728 -2195 -2761 -2107 -2704 -1996 -2579 -2048 -2476 L -2050 -2473 -2105 -2503 -2083 -2410 -2083 -2408 -2084 -2410 -2090 -2408 -2099 -2399 -2095 -2357 -2092 -2339 -2084 -2345 Q -2060 -2363 -2039 -2383 -1997 -2428 -1969 -2470 -1865 -2629 -1969 -2759 -2000 -2800 -2053 -2836 L -2056 -2851 Q -2066 -2900 -2086 -2944 L -2101 -2974 Q -1843 -3439 -1931 -3911 -2069 -3850 -2225 -3508 -2168 -3677 -2218 -3811 -2357 -3700 -2498 -3389 -2434 -3560 -2503 -3655 -2606 -3541 -2702 -3365 -2744 -3343 -2774 -3307 -2779 -3341 -2797 -3368 -3082 -3064 -3226 -2588 L -3221 -2582 -3215 -2575 -3278 -2573 -3305 -2620 Q -3955 -3013 -4330 -3494 M -3290 -2344 Q -3259 -2416 -3259 -2479 -3257 -2530 -3278 -2573 -3257 -2530 -3259 -2479 -3259 -2416 -3290 -2344 M -4123 -2344 Q -4282 -2341 -4448 -2416 -4282 -2341 -4123 -2344 M -3665 -2254 L -3658 -2255 Q -3422 -2318 -3533 -2479 -3626 -2615 -3968 -2822 L -3973 -2831 Q -4100 -2971 -4208 -3106 -4394 -3344 -4514 -3572 -4694 -3914 -4726 -4235 -4694 -3914 -4514 -3572 -4394 -3344 -4208 -3106 -4100 -2971 -3973 -2831 L -3968 -2822 Q -3626 -2615 -3533 -2479 -3422 -2318 -3658 -2255 L -3665 -2254 M -4753 -3559 L -4804 -3715 -4753 -3559 -4841 -3722 -4753 -3559 -4738 -3521 -4753 -3559 M -4753 -3101 L -4787 -3133 -4753 -3101 M -4907 -3329 Q -4979 -3464 -5020 -3586 -4979 -3464 -4907 -3329 M -3919 -2072 L -3941 -2194 -3919 -2072 M -2243 -2261 L -2191 -2282 -2194 -2305 -2194 -2329 -2186 -2369 -2236 -2387 -2245 -2305 -2245 -2294 -2243 -2261 M -2279 -3383 L -2225 -3508 -2279 -3383 M -2140 -2786 L -2159 -2782 Q -2186 -2782 -2209 -2803 L -2218 -2812 Q -2243 -2845 -2245 -2891 -2246 -2939 -2224 -2972 -2201 -3007 -2168 -3008 -2135 -3010 -2110 -2977 L -2104 -2969 -2090 -2941 Q -2083 -2923 -2083 -2899 -2081 -2866 -2092 -2839 L -2104 -2816 -2110 -2806 Q -2119 -2794 -2131 -2791 -2134 -2788 -2140 -2786 M -2512 -3359 Q -2615 -3370 -2708 -3280 L -2708 -3278 -2711 -3257 -2708 -3278 -2708 -3280 Q -2615 -3370 -2512 -3359 -2452 -3353 -2389 -3314 -2483 -3341 -2510 -3299 -2396 -3295 -2339 -3218 -2416 -3239 -2482 -3218 -2320 -3193 -2218 -3115 -2144 -3058 -2101 -2974 -2144 -3058 -2218 -3115 -2320 -3193 -2482 -3218 -2416 -3239 -2339 -3218 -2396 -3295 -2510 -3299 -2483 -3341 -2389 -3314 -2452 -3353 -2512 -3359 L -2498 -3389 -2512 -3359 M -2702 -3365 L -2698 -3368 -2702 -3365 M -2539 -3190 Q -2512 -3209 -2482 -3218 -2512 -3209 -2539 -3190 M -2698 -3368 L -2708 -3280 -2698 -3368 M -2495 -2627 Q -2521 -2612 -2551 -2612 -2605 -2612 -2644 -2660 -2683 -2707 -2683 -2774 -2683 -2842 -2644 -2890 -2605 -2936 -2551 -2936 -2497 -2936 -2458 -2890 -2419 -2842 -2419 -2774 -2419 -2728 -2438 -2690 L -2443 -2683 Q -2444 -2665 -2458 -2651 L -2480 -2636 -2495 -2627 -2480 -2636 -2458 -2651 Q -2444 -2665 -2443 -2683 L -2438 -2690 -2441 -2692 -2443 -2683 -2458 -2660 -2480 -2636 -2498 -2635 -2495 -2627 M -2848 -3145 L -2845 -3152 -2848 -3145 Q -2992 -3076 -3040 -2695 L -3043 -2680 -3055 -2593 Q -3064 -2459 -3014 -2371 -2993 -2333 -2962 -2305 -2906 -2252 -2816 -2225 -2906 -2252 -2962 -2305 -2993 -2333 -3014 -2371 -3064 -2459 -3055 -2593 L -3043 -2680 -3040 -2695 Q -2992 -3076 -2848 -3145 M -2794 -2222 L -2816 -2225 -2794 -2222 M -2845 -3152 L -2842 -3167 -2845 -3152 M -2842 -3167 Q -2822 -3251 -2774 -3307 -2822 -3251 -2842 -3167 M -3079 -2597 Q -3145 -2579 -3215 -2575 -3145 -2579 -3079 -2597 M -2381 -2665 Q -2365 -2638 -2356 -2611 -2365 -2638 -2381 -2665 M -2426 -2387 Q -2375 -2432 -2356 -2480 -2375 -2432 -2426 -2387";
	ctx.fillStyle=tocolor(ctrans.apply([242,26,77,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M -4024 -2213 L -4063 -2212 -4087 -2164 -4085 -2156 Q -3974 -1984 -3947 -1810 -4036 -1838 -4051 -1772 -3920 -1723 -3907 -1532 L -3905 -1496 -3905 -1478 Q -3898 -1387 -3832 -1417 -3770 -1526 -3838 -1700 -3754 -1673 -3757 -1577 L -3758 -1555 -3763 -1528 Q -3781 -1403 -3704 -1439 -3560 -1694 -3848 -1823 L -3896 -1952 Q -3938 -1984 -3973 -2039 L -3977 -2048 -3988 -2065 Q -4024 -2134 -3974 -2186 L -4024 -2213 M -3836 -1720 L -3838 -1700 -3836 -1720 M -3395 -1871 L -3257 -1739 Q -3376 -1768 -3403 -1684 -3139 -1600 -3197 -1436 -3166 -1351 -3116 -1382 -3076 -1460 -3106 -1547 -3052 -1520 -3031 -1414 -2993 -1366 -2968 -1418 -2948 -1609 -3140 -1723 L -3286 -1877 -3289 -1879 -3395 -1871 M -3221 -1705 L -3257 -1739 -3221 -1705 M -3146 -1630 L -3116 -1574 -3106 -1547 -3116 -1574 -3146 -1630";
	ctx.fillStyle=tocolor(ctrans.apply([207,151,0,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M -3583 -2039 Q -3575 -1963 -3619 -1919 -3509 -1876 -3401 -1871 L -3395 -1871 -3289 -1879 Q -3155 -1900 -3020 -1984 -2924 -2045 -2828 -2138 -2903 -2249 -3127 -2236 L -3145 -2230 Q -3397 -2197 -3583 -2039";
	ctx.fillStyle=tocolor(ctrans.apply([255,127,23,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M -2092 -2839 Q -2081 -2866 -2083 -2899 -2083 -2923 -2090 -2941 L -2104 -2969 -2110 -2977 Q -2135 -3010 -2168 -3008 -2201 -3007 -2224 -2972 -2246 -2939 -2245 -2891 -2243 -2845 -2218 -2812 L -2209 -2803 Q -2186 -2782 -2159 -2782 L -2140 -2786 -2140 -2789 Q -2158 -2789 -2170 -2806 -2182 -2821 -2182 -2840 L -2182 -2842 Q -2182 -2863 -2170 -2879 -2161 -2891 -2149 -2893 L -2140 -2894 Q -2122 -2894 -2110 -2879 -2098 -2863 -2098 -2842 L -2092 -2839 M -2438 -2690 Q -2419 -2728 -2419 -2774 -2419 -2842 -2458 -2890 -2497 -2936 -2551 -2936 -2605 -2936 -2644 -2890 -2683 -2842 -2683 -2774 -2683 -2707 -2644 -2660 -2605 -2612 -2551 -2612 -2521 -2612 -2495 -2627 L -2498 -2635 Q -2522 -2635 -2539 -2651 -2555 -2668 -2555 -2692 -2555 -2716 -2539 -2732 -2522 -2749 -2498 -2749 -2474 -2749 -2458 -2732 -2441 -2716 -2441 -2692 L -2438 -2690";
	ctx.fillStyle=tocolor(ctrans.apply([255,255,255,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M -2098 -2842 Q -2098 -2863 -2110 -2879 -2122 -2894 -2140 -2894 L -2149 -2893 Q -2161 -2891 -2170 -2879 -2182 -2863 -2182 -2842 L -2182 -2840 Q -2182 -2821 -2170 -2806 -2158 -2789 -2140 -2789 L -2131 -2791 Q -2116 -2800 -2104 -2816 -2098 -2828 -2098 -2842 M -2441 -2692 Q -2441 -2716 -2458 -2732 -2474 -2749 -2498 -2749 -2522 -2749 -2539 -2732 -2555 -2716 -2555 -2692 -2555 -2668 -2539 -2651 -2522 -2635 -2498 -2635 L -2480 -2636 -2458 -2660 -2443 -2683 -2441 -2692";
	ctx.fillStyle=tocolor(ctrans.apply([0,0,0,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M -2048 -2476 Q -1996 -2579 -2107 -2704 -2195 -2761 -2261 -2728 -2317 -2701 -2354 -2612 L -2356 -2611 Q -2347 -2588 -2345 -2567 L -2306 -2564 -2345 -2567 Q -2339 -2522 -2356 -2480 L -2338 -2474 -2318 -2531 -2306 -2564 Q -2249 -2557 -2194 -2539 L -2156 -2525 -2140 -2519 -2134 -2516 -2110 -2506 -2105 -2503 -2050 -2473 -2048 -2476 M -2236 -2387 L -2186 -2369 Q -2137 -2363 -2099 -2399 L -2090 -2408 -2087 -2413 -2210 -2476 -2215 -2477 -2233 -2405 -2236 -2387";
	ctx.fillStyle=tocolor(ctrans.apply([255,186,0,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M -2369 -2227 L -2368 -2197 -2366 -2192 Q -2273 -1964 -2237 -2200 L -2237 -2201 -2243 -2261 -2369 -2227 -2243 -2261 -2245 -2294 -2245 -2305 -2236 -2387 -2233 -2405 -2215 -2477 -2215 -2479 -2210 -2476 -2209 -2482 -2144 -2486 -2138 -2485 Q -2120 -2476 -2105 -2453 L -2086 -2413 -2084 -2410 -2083 -2410 -2105 -2503 -2110 -2506 -2134 -2516 -2138 -2515 -2140 -2519 -2156 -2525 -2194 -2539 Q -2249 -2557 -2306 -2564 L -2318 -2531 -2338 -2474 -2351 -2419 Q -2365 -2360 -2369 -2305 L -2369 -2287 -2369 -2227 M -2191 -2282 L -2191 -2279 -2183 -2254 -2182 -2242 -2179 -2236 Q -2122 -2150 -2086 -2255 L -2083 -2264 -2086 -2284 -2092 -2339 -2095 -2357 -2099 -2399 Q -2137 -2363 -2186 -2369 L -2194 -2329 -2194 -2305 -2191 -2282 M -2369 -2287 Q -2351 -2300 -2333 -2305 -2305 -2312 -2275 -2305 L -2245 -2294 -2275 -2305 Q -2305 -2312 -2333 -2305 -2351 -2300 -2369 -2287 M -2351 -2419 Q -2293 -2450 -2233 -2405 -2293 -2450 -2351 -2419 M -2086 -2284 Q -2129 -2255 -2191 -2279 -2129 -2255 -2086 -2284 M -2194 -2329 Q -2135 -2302 -2095 -2357 -2135 -2302 -2194 -2329 M -2237 -2201 Q -2311 -2242 -2368 -2197 -2311 -2242 -2237 -2201 M -2144 -2486 L -2156 -2525 -2144 -2486 M -2318 -2531 Q -2269 -2539 -2203 -2492 L -2209 -2482 -2203 -2492 Q -2269 -2539 -2318 -2531";
	ctx.fillStyle=tocolor(ctrans.apply([153,102,51,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M -2086 -2413 L -2105 -2453 Q -2120 -2476 -2138 -2485 L -2144 -2486 -2209 -2482 -2210 -2476 -2087 -2413 -2086 -2413";
	ctx.fillStyle=tocolor(ctrans.apply([153,51,51,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M -4409 -3602 L -4330 -3494 Q -3955 -3013 -3305 -2620 L -3278 -2573 Q -3257 -2530 -3259 -2479 -3259 -2416 -3290 -2344 M -3968 -2215 L -3985 -2219 -4024 -2213 -4063 -2212 Q -4174 -2213 -4325 -2266 L -4336 -2267 -4346 -2272 Q -4642 -2447 -4457 -2417 L -4448 -2416 Q -4282 -2341 -4123 -2344 M -4330 -3494 L -4369 -3571 -4378 -3589 -4409 -3602 Q -4618 -3902 -4726 -4235 L -4748 -4307 -4753 -4324 -4759 -4315 Q -4912 -4105 -4804 -3715 L -4841 -3722 -5030 -4069 Q -5107 -3857 -5020 -3586 L -5054 -3608 Q -5168 -3565 -5033 -3418 L -4907 -3329 Q -4856 -3235 -4787 -3133 -4927 -3218 -5096 -3416 -5182 -3094 -4619 -2711 -4901 -2851 -4750 -2612 -4655 -2534 -4565 -2479 -4510 -2446 -4456 -2420 L -4448 -2416 M -4726 -4235 Q -4694 -3914 -4514 -3572 -4394 -3344 -4208 -3106 -4100 -2971 -3973 -2831 L -3968 -2822 Q -3626 -2615 -3533 -2479 -3422 -2318 -3658 -2255 L -3665 -2254 M -4841 -3722 L -4753 -3559 -4738 -3521 M -5020 -3586 Q -4979 -3464 -4907 -3329 M -4787 -3133 L -4753 -3101 M -4804 -3715 L -4753 -3559 M -3943 -2203 L -3943 -2209 M -3941 -2194 L -3943 -2203 M -3958 -2201 L -3968 -2215 M -3974 -2186 L -3958 -2201 -3941 -2194 -3919 -2072 M -4024 -2213 L -3974 -2186 Q -4024 -2134 -3988 -2065 L -3977 -2048 -3973 -2039 Q -3938 -1984 -3896 -1952 L -3848 -1823 Q -3560 -1694 -3704 -1439 -3781 -1403 -3763 -1528 L -3758 -1555 -3757 -1577 Q -3754 -1673 -3838 -1700 L -3836 -1720 M -4063 -2212 L -4087 -2164 -4085 -2156 Q -3974 -1984 -3947 -1810 -4036 -1838 -4051 -1772 L -4054 -1750 M -3619 -1919 Q -3647 -1891 -3839 -1924 L -3865 -1934 -3896 -1952 M -3583 -2039 Q -3575 -1963 -3619 -1919 -3509 -1876 -3401 -1871 L -3395 -1871 -3257 -1739 Q -3376 -1768 -3403 -1684 -3139 -1600 -3197 -1436 -3166 -1351 -3116 -1382 -3076 -1460 -3106 -1547 -3052 -1520 -3031 -1414 -2993 -1366 -2968 -1418 -2948 -1609 -3140 -1723 L -3286 -1877 Q -3091 -1804 -3020 -1984 -2924 -2045 -2828 -2138 -2903 -2249 -3127 -2236 L -3136 -2234 -3145 -2230 Q -3397 -2197 -3583 -2039 -3587 -2101 -3625 -2185 M -2794 -2227 Q -2692 -2200 -2614 -2198 L -2525 -2204 -2369 -2227 M -2243 -2261 L -2191 -2282 M -2092 -2339 L -2084 -2345 Q -2060 -2363 -2039 -2383 -1997 -2428 -1969 -2470 -1865 -2629 -1969 -2759 -2000 -2800 -2053 -2836 L -2056 -2851 Q -2066 -2900 -2086 -2944 L -2101 -2974 Q -1843 -3439 -1931 -3911 -2069 -3850 -2225 -3508 -2168 -3677 -2218 -3811 -2357 -3700 -2498 -3389 -2434 -3560 -2503 -3655 -2606 -3541 -2702 -3365 M -2774 -3307 Q -2779 -3341 -2797 -3368 -3082 -3064 -3226 -2588 L -3221 -2582 -3215 -2575 -3278 -2573 M -4051 -1772 Q -3920 -1723 -3907 -1532 L -3905 -1496 -3905 -1478 Q -3898 -1387 -3832 -1417 -3770 -1526 -3838 -1700 M -2225 -3508 L -2279 -3383 M -2101 -2974 Q -2144 -3058 -2218 -3115 -2320 -3193 -2482 -3218 -2416 -3239 -2339 -3218 -2396 -3295 -2510 -3299 -2483 -3341 -2389 -3314 -2452 -3353 -2512 -3359 L -2498 -3389 M -2711 -3257 L -2708 -3278 -2708 -3280 Q -2615 -3370 -2512 -3359 M -2708 -3280 L -2698 -3368 M -2482 -3218 Q -2512 -3209 -2539 -3190 M -2848 -3145 Q -2992 -3076 -3040 -2695 L -3043 -2680 -3055 -2593 Q -3064 -2459 -3014 -2371 -2993 -2333 -2962 -2305 -2906 -2252 -2816 -2225 M -2842 -3167 L -2845 -3152 M -3215 -2575 Q -3145 -2579 -3079 -2597 M -3289 -1879 L -3286 -1877 M -3395 -1871 L -3289 -1879 Q -3155 -1900 -3020 -1984 M -3106 -1547 L -3116 -1574 -3146 -1630 M -3257 -1739 L -3221 -1705";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([51,0,0,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M -3290 -2344 Q -3430 -2210 -3625 -2185 -3769 -2167 -3943 -2209 L -3968 -2215 M -2828 -2138 L -2816 -2149 Q -2788 -2177 -2794 -2222 L -2794 -2227 M -2369 -2227 L -2368 -2197 -2366 -2192 Q -2273 -1964 -2237 -2200 L -2237 -2201 -2243 -2261 -2245 -2294 -2245 -2305 -2236 -2387 -2186 -2369 -2194 -2329 -2194 -2305 -2191 -2282 -2191 -2279 -2183 -2254 -2182 -2242 -2179 -2236 Q -2122 -2150 -2086 -2255 L -2083 -2264 -2086 -2284 -2092 -2339 -2095 -2357 Q -2135 -2302 -2194 -2329 M -2702 -3365 Q -2744 -3343 -2774 -3307 -2822 -3251 -2842 -3167 M -2140 -2786 L -2159 -2782 Q -2186 -2782 -2209 -2803 L -2218 -2812 Q -2243 -2845 -2245 -2891 -2246 -2939 -2224 -2972 -2201 -3007 -2168 -3008 -2135 -3010 -2110 -2977 L -2104 -2969 -2090 -2941 Q -2083 -2923 -2083 -2899 -2081 -2866 -2092 -2839 L -2104 -2816 Q -2116 -2800 -2131 -2791 L -2140 -2789 Q -2158 -2789 -2170 -2806 -2182 -2821 -2182 -2840 L -2182 -2842 Q -2182 -2863 -2170 -2879 -2161 -2891 -2149 -2893 L -2140 -2894 Q -2122 -2894 -2110 -2879 -2098 -2863 -2098 -2842 -2098 -2828 -2104 -2816 L -2110 -2806 Q -2119 -2794 -2131 -2791 -2134 -2788 -2140 -2786 M -2698 -3368 L -2702 -3365 M -2438 -2690 Q -2419 -2728 -2419 -2774 -2419 -2842 -2458 -2890 -2497 -2936 -2551 -2936 -2605 -2936 -2644 -2890 -2683 -2842 -2683 -2774 -2683 -2707 -2644 -2660 -2605 -2612 -2551 -2612 -2521 -2612 -2495 -2627 L -2480 -2636 -2458 -2651 Q -2444 -2665 -2443 -2683 L -2438 -2690 M -2441 -2692 Q -2441 -2716 -2458 -2732 -2474 -2749 -2498 -2749 -2522 -2749 -2539 -2732 -2555 -2716 -2555 -2692 -2555 -2668 -2539 -2651 -2522 -2635 -2498 -2635 L -2480 -2636 -2458 -2660 -2443 -2683 -2441 -2692 M -2845 -3152 L -2848 -3145 M -2816 -2225 L -2794 -2222 M -2345 -2567 Q -2347 -2588 -2356 -2611 L -2354 -2612 Q -2317 -2701 -2261 -2728 -2195 -2761 -2107 -2704 -1996 -2579 -2048 -2476 L -2050 -2473 -2105 -2503 -2110 -2506 -2134 -2516 -2140 -2519 -2156 -2525 -2194 -2539 Q -2249 -2557 -2306 -2564 L -2345 -2567 Q -2339 -2522 -2356 -2480 -2375 -2432 -2426 -2387 M -2356 -2611 Q -2365 -2638 -2381 -2665 M -2306 -2564 L -2318 -2531 -2338 -2474 -2351 -2419 Q -2365 -2360 -2369 -2305 L -2369 -2287 -2369 -2227 -2243 -2261 M -2245 -2294 L -2275 -2305 Q -2305 -2312 -2333 -2305 -2351 -2300 -2369 -2287 M -2140 -2519 L -2138 -2515 -2134 -2516 M -2210 -2476 L -2209 -2482 -2144 -2486 -2138 -2485 Q -2120 -2476 -2105 -2453 L -2086 -2413 -2084 -2410 -2083 -2410 -2083 -2408 -2084 -2410 -2087 -2413 -2210 -2476 -2215 -2479 -2215 -2477 -2233 -2405 Q -2293 -2450 -2351 -2419 M -2236 -2387 L -2233 -2405 M -2083 -2410 L -2084 -2410 -2090 -2408 -2099 -2399 Q -2137 -2363 -2186 -2369 M -2099 -2399 L -2095 -2357 M -2191 -2279 Q -2129 -2255 -2086 -2284 M -2105 -2503 L -2083 -2410 M -2209 -2482 L -2203 -2492 Q -2269 -2539 -2318 -2531 M -2156 -2525 L -2144 -2486 M -2368 -2197 Q -2311 -2242 -2237 -2201";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([51,0,0,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

}

function shape133(ctx,ctrans,frame,ratio,time){
	var pathData="M -4428 -3274 Q -4545 -3526 -4339 -3337 L -4299 -3298 Q -4420 -3691 -4152 -3334 -4264 -3639 -4029 -3360 -4264 -3639 -4152 -3334 -4420 -3691 -4299 -3298 L -4339 -3337 Q -4545 -3526 -4428 -3274 L -4423 -3267 -4339 -3187 Q -4165 -3021 -4015 -2842 L -4015 -2835 Q -4032 -2709 -3993 -2611 L -3972 -2568 -3994 -2520 Q -4014 -2478 -4041 -2439 -4191 -2214 -4500 -2101 L -4495 -2092 Q -4474 -2010 -4338 -2016 -4495 -1924 -4746 -1900 -4735 -1800 -4483 -1786 -4639 -1686 -4924 -1696 -4828 -1542 -4492 -1551 -4663 -1419 -4984 -1410 -4824 -1230 -4435 -1320 L -4761 -1180 -4764 -1176 Q -4837 -1095 -4506 -1087 -3585 -1248 -3274 -1950 L -3235 -2047 -3234 -2050 -3207 -2130 -3196 -2166 -3187 -2202 -3196 -2166 -3207 -2130 -3111 -2029 Q -2919 -1915 -2938 -1725 L -2941 -1719 -2925 -1713 -2941 -1843 Q -2839 -1593 -2664 -1558 L -2746 -1807 -2758 -1821 -2767 -1833 -2758 -1821 -2746 -1807 Q -2416 -1414 -2187 -1476 L -2403 -1672 Q -1894 -1432 -1762 -1563 L -1833 -1605 Q -2356 -2040 -2541 -2506 L -2584 -2505 -2721 -2523 Q -2454 -1992 -1833 -1605 -2454 -1992 -2721 -2523 L -2584 -2505 -2541 -2506 -2496 -2511 -2340 -2533 -2340 -2593 -2340 -2611 Q -2335 -2667 -2322 -2725 L -2308 -2781 -2326 -2787 Q -2310 -2829 -2316 -2874 -2317 -2895 -2326 -2917 -2241 -3115 -2077 -3010 -1966 -2886 -2019 -2782 L -2020 -2779 Q -2047 -2796 -2076 -2809 L -2053 -2716 -2053 -2715 -2055 -2716 -2061 -2715 -2070 -2706 -2065 -2664 -2062 -2646 -2055 -2652 -2010 -2689 Q -1968 -2734 -1939 -2776 -1836 -2935 -1939 -3066 -1971 -3106 -2023 -3142 L -2026 -3157 Q -2037 -3207 -2056 -3250 -2101 -3355 -2188 -3421 -2290 -3499 -2452 -3525 -2386 -3546 -2310 -3525 -2367 -3601 -2481 -3606 -2454 -3648 -2359 -3621 -2533 -3729 -2679 -3586 L -2668 -3675 Q -2781 -3613 -2812 -3474 L -2815 -3459 -2818 -3451 Q -2962 -3382 -3010 -3001 L -3013 -2986 -3025 -2899 -3049 -2904 Q -3336 -2826 -3738 -3001 -3892 -3169 -4029 -3360 -4200 -3601 -4339 -3877 L -4348 -3895 Q -4512 -3978 -4501 -3754 L -4399 -3643 -4501 -3754 -4692 -3963 Q -4782 -4053 -4854 -4018 -4930 -3946 -4785 -3759 L -5025 -3915 Q -5139 -3871 -5004 -3724 -4692 -3511 -4429 -3271 L -4428 -3274 M -4417 -3520 L -4785 -3759 -4417 -3520 M -2787 -2532 Q -2877 -2559 -2932 -2611 -2974 -2650 -2998 -2703 -3033 -2785 -3025 -2899 -3033 -2785 -2998 -2703 -2974 -2650 -2932 -2611 -2877 -2559 -2787 -2532 L -2764 -2529 Q -2758 -2484 -2787 -2455 L -2799 -2445 -2787 -2455 Q -2758 -2484 -2764 -2529 L -2787 -2532 M -3097 -2542 Q -2874 -2556 -2799 -2445 -2895 -2352 -2991 -2290 -3088 -2230 -3187 -2202 -3145 -2358 -3129 -2535 L -3115 -2536 Q -3111 -2539 -3106 -2541 L -3097 -2542 M -4353 -1342 L -4435 -1320 -4353 -1342 M -4009 -2874 L -4015 -2842 -4009 -2874 M -4165 -2047 L -4276 -2023 -4338 -2016 -4276 -2023 -4165 -2047 M -4483 -1786 L -4428 -1800 -4483 -1786 M -4465 -1552 L -4492 -1551 -4465 -1552 M -3934 -2677 Q -3949 -2622 -3972 -2568 -3949 -2622 -3934 -2677 M -2110 -3093 L -2130 -3088 Q -2163 -3088 -2188 -3118 -2214 -3151 -2215 -3198 -2217 -3246 -2194 -3279 -2172 -3313 -2139 -3315 -2106 -3316 -2080 -3283 -2067 -3268 -2061 -3247 -2053 -3229 -2053 -3205 -2052 -3172 -2062 -3145 L -2074 -3123 -2080 -3112 Q -2089 -3100 -2101 -3097 -2104 -3094 -2110 -3093 M -2352 -2971 Q -2335 -2944 -2326 -2917 -2335 -2944 -2352 -2971 M -2161 -2589 L -2164 -2611 -2164 -2635 -2157 -2676 Q -2181 -2680 -2206 -2694 L -2215 -2611 -2215 -2601 -2214 -2568 -2161 -2589 M -2682 -3564 L -2679 -3585 -2679 -3586 -2679 -3585 -2682 -3564 M -2509 -3496 Q -2482 -3516 -2452 -3525 -2482 -3516 -2509 -3496 M -2466 -2934 Q -2491 -2919 -2521 -2919 -2575 -2919 -2614 -2967 -2653 -3013 -2653 -3081 -2653 -3148 -2614 -3196 -2575 -3243 -2521 -3243 -2467 -3243 -2428 -3196 -2389 -3148 -2389 -3081 -2389 -3034 -2409 -2997 L -2413 -2989 Q -2415 -2971 -2428 -2958 L -2451 -2943 -2466 -2934 M -2397 -2694 Q -2346 -2739 -2326 -2787 -2346 -2739 -2397 -2694 M -2959 -1888 L -2941 -1843 -2959 -1888 M -3196 -2166 Q -3049 -2140 -2991 -2290 -3049 -2140 -3196 -2166 M -3018 -1780 Q -3037 -1833 -3072 -1852 L -3018 -1780 M -2721 -2523 L -2764 -2533 -2721 -2523 M -2415 -1683 L -2403 -1672 -2415 -1683 M -2764 -2533 L -2764 -2529 -2764 -2533";
	ctx.fillStyle=tocolor(ctrans.apply([242,26,77,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M -3207 -2130 L -3234 -2050 -3228 -2046 -3235 -2047 -3274 -1950 Q -3121 -1870 -3168 -1743 -3136 -1657 -3087 -1689 -3046 -1767 -3076 -1854 L -3072 -1852 Q -3037 -1833 -3018 -1780 -3007 -1755 -3001 -1720 L -2941 -1719 -2938 -1725 Q -2919 -1915 -3111 -2029 L -3207 -2130 M -3994 -2520 L -4024 -2536 -4057 -2470 -4056 -2463 -4041 -2439 Q -4014 -2478 -3994 -2520 M -3192 -2011 L -3228 -2046 -3192 -2011 M -3117 -1936 Q -3097 -1908 -3087 -1881 L -3081 -1866 -3076 -1854 -3081 -1866 -3087 -1881 Q -3097 -1908 -3117 -1936";
	ctx.fillStyle=tocolor(ctrans.apply([207,151,0,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M -2068 -3148 L -2062 -3145 Q -2052 -3172 -2053 -3205 -2053 -3229 -2061 -3247 -2067 -3268 -2080 -3283 -2106 -3316 -2139 -3315 -2172 -3313 -2194 -3279 -2217 -3246 -2215 -3198 -2214 -3151 -2188 -3118 -2163 -3088 -2130 -3088 L -2110 -3093 -2110 -3096 Q -2128 -3096 -2140 -3112 -2152 -3127 -2152 -3148 -2152 -3169 -2140 -3186 -2128 -3201 -2110 -3201 -2092 -3201 -2080 -3186 -2068 -3169 -2068 -3148 M -2409 -2997 Q -2389 -3034 -2389 -3081 -2389 -3148 -2428 -3196 -2467 -3243 -2521 -3243 -2575 -3243 -2614 -3196 -2653 -3148 -2653 -3081 -2653 -3013 -2614 -2967 -2575 -2919 -2521 -2919 -2491 -2919 -2466 -2934 L -2469 -2941 Q -2493 -2941 -2509 -2958 -2526 -2974 -2526 -2998 -2526 -3022 -2509 -3039 -2493 -3055 -2469 -3055 -2445 -3055 -2428 -3039 -2412 -3022 -2412 -2998 L -2409 -2997";
	ctx.fillStyle=tocolor(ctrans.apply([255,255,255,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M -2068 -3148 Q -2068 -3169 -2080 -3186 -2092 -3201 -2110 -3201 -2128 -3201 -2140 -3186 -2152 -3169 -2152 -3148 -2152 -3127 -2140 -3112 -2128 -3096 -2110 -3096 L -2101 -3097 Q -2086 -3106 -2074 -3123 -2068 -3135 -2068 -3148 M -2412 -2998 Q -2412 -3022 -2428 -3039 -2445 -3055 -2469 -3055 -2493 -3055 -2509 -3039 -2526 -3022 -2526 -2998 -2526 -2974 -2509 -2958 -2493 -2941 -2469 -2941 L -2451 -2943 -2428 -2967 -2413 -2989 -2412 -2998";
	ctx.fillStyle=tocolor(ctrans.apply([0,0,0,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M -2070 -2706 L -2061 -2715 -2058 -2719 -2181 -2782 -2185 -2784 -2203 -2712 -2206 -2694 Q -2181 -2680 -2157 -2676 -2107 -2670 -2070 -2706 M -2076 -2809 Q -2047 -2796 -2020 -2779 L -2019 -2782 Q -1966 -2886 -2077 -3010 -2241 -3115 -2326 -2917 -2317 -2895 -2316 -2874 L -2277 -2871 -2316 -2874 Q -2310 -2829 -2326 -2787 L -2308 -2781 -2289 -2838 -2277 -2871 -2164 -2845 -2127 -2832 -2110 -2826 -2104 -2823 -2080 -2812 -2076 -2809";
	ctx.fillStyle=tocolor(ctrans.apply([255,186,0,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M -2062 -2646 L -2065 -2664 -2070 -2706 Q -2107 -2670 -2157 -2676 L -2164 -2635 -2164 -2611 -2161 -2589 -2161 -2586 -2056 -2590 -2161 -2586 -2154 -2560 -2152 -2548 -2149 -2542 Q -2092 -2457 -2056 -2562 L -2053 -2571 -2056 -2590 -2062 -2646 M -2053 -2716 L -2076 -2809 -2080 -2812 -2104 -2823 -2109 -2821 -2110 -2826 -2127 -2832 -2115 -2793 -2127 -2832 -2164 -2845 -2277 -2871 -2289 -2838 -2308 -2781 -2322 -2725 Q -2263 -2757 -2203 -2712 -2263 -2757 -2322 -2725 -2335 -2667 -2340 -2611 L -2340 -2593 Q -2322 -2607 -2304 -2611 -2275 -2619 -2245 -2611 L -2215 -2601 -2245 -2611 Q -2275 -2619 -2304 -2611 -2322 -2607 -2340 -2593 L -2340 -2533 -2214 -2568 -2215 -2601 -2215 -2611 -2206 -2694 -2203 -2712 -2185 -2784 -2185 -2785 -2181 -2782 -2179 -2788 Q -2142 -2805 -2115 -2793 L -2109 -2791 Q -2091 -2782 -2076 -2760 L -2056 -2719 -2055 -2716 -2053 -2716 M -2179 -2788 L -2173 -2799 Q -2239 -2845 -2289 -2838 -2239 -2845 -2173 -2799 L -2179 -2788 M -2065 -2664 Q -2106 -2608 -2164 -2635 -2106 -2608 -2065 -2664 M -2214 -2568 L -2340 -2533 -2338 -2503 -2337 -2499 Q -2244 -2271 -2208 -2506 L -2208 -2508 -2214 -2568 M -2338 -2503 Q -2281 -2548 -2208 -2508 -2281 -2548 -2338 -2503";
	ctx.fillStyle=tocolor(ctrans.apply([153,102,51,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M -2056 -2719 L -2076 -2760 Q -2091 -2782 -2109 -2791 L -2115 -2793 Q -2142 -2805 -2179 -2788 L -2181 -2782 -2058 -2719 -2056 -2719";
	ctx.fillStyle=tocolor(ctrans.apply([153,51,51,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M -2799 -2445 Q -2874 -2556 -3097 -2542 L -3115 -2536 -3129 -2535 Q -3145 -2358 -3187 -2202 -3088 -2230 -2991 -2290 -2895 -2352 -2799 -2445";
	ctx.fillStyle=tocolor(ctrans.apply([255,127,23,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M -4029 -3360 Q -4264 -3639 -4152 -3334 -4420 -3691 -4299 -3298 L -4339 -3337 Q -4545 -3526 -4428 -3274 L -4423 -3267 -4429 -3271 Q -4692 -3511 -5004 -3724 -5139 -3871 -5025 -3915 L -4785 -3759 -4417 -3520 M -4399 -3643 L -4501 -3754 Q -4512 -3978 -4348 -3895 L -4339 -3877 Q -4200 -3601 -4029 -3360 -3892 -3169 -3738 -3001 -3336 -2826 -3049 -2904 M -3025 -2899 Q -3033 -2785 -2998 -2703 -2974 -2650 -2932 -2611 -2877 -2559 -2787 -2532 M -2799 -2445 Q -2874 -2556 -3097 -2542 L -3106 -2541 Q -3111 -2539 -3115 -2536 L -3129 -2535 Q -3145 -2358 -3187 -2202 L -3196 -2166 -3207 -2130 -3234 -2050 -3235 -2047 -3274 -1950 Q -3585 -1248 -4506 -1087 -4837 -1095 -4764 -1176 L -4761 -1180 -4435 -1320 -4353 -1342 M -3972 -2568 L -3993 -2611 Q -4032 -2709 -4015 -2835 L -4015 -2842 -4009 -2874 M -4015 -2842 Q -4165 -3021 -4339 -3187 L -4423 -3267 M -4501 -3754 L -4692 -3963 Q -4782 -4053 -4854 -4018 -4930 -3946 -4785 -3759 M -4338 -2016 L -4276 -2023 -4165 -2047 M -4041 -2439 L -4056 -2463 -4057 -2470 -4024 -2536 -3994 -2520 Q -4014 -2478 -4041 -2439 -4191 -2214 -4500 -2101 M -4495 -2092 Q -4474 -2010 -4338 -2016 -4495 -1924 -4746 -1900 -4735 -1800 -4483 -1786 -4639 -1686 -4924 -1696 -4828 -1542 -4492 -1551 -4663 -1419 -4984 -1410 -4824 -1230 -4435 -1320 M -3994 -2520 L -3972 -2568 Q -3949 -2622 -3934 -2677 M -4492 -1551 L -4465 -1552 M -4428 -1800 L -4483 -1786 M -2452 -3525 Q -2290 -3499 -2188 -3421 -2101 -3355 -2056 -3250 -2037 -3207 -2026 -3157 L -2023 -3142 Q -1971 -3106 -1939 -3066 -1836 -2935 -1939 -2776 -1968 -2734 -2010 -2689 L -2055 -2652 -2062 -2646 M -3025 -2899 L -3013 -2986 -3010 -3001 Q -2962 -3382 -2818 -3451 L -2815 -3459 -2812 -3474 Q -2781 -3613 -2668 -3675 L -2679 -3586 -2679 -3585 -2682 -3564 M -2679 -3586 Q -2533 -3729 -2359 -3621 -2454 -3648 -2481 -3606 -2367 -3601 -2310 -3525 -2386 -3546 -2452 -3525 -2482 -3516 -2509 -3496 M -2941 -1843 L -2959 -1888 M -3072 -1852 L -3076 -1854 -3081 -1866 -3087 -1881 Q -3097 -1908 -3117 -1936 M -3228 -2046 L -3192 -2011 M -3234 -2050 L -3228 -2046 -3235 -2047 M -3187 -2202 Q -3088 -2230 -2991 -2290 -3049 -2140 -3196 -2166 M -3207 -2130 L -3111 -2029 Q -2919 -1915 -2938 -1725 L -2941 -1719 -3001 -1720 Q -3007 -1755 -3018 -1780 -3037 -1833 -3072 -1852 L -3018 -1780 M -1833 -1605 Q -2454 -1992 -2721 -2523 L -2584 -2505 -2541 -2506 Q -2356 -2040 -1833 -1605 L -1762 -1563 Q -1894 -1432 -2403 -1672 L -2415 -1683 M -2764 -2533 L -2721 -2523 M -2340 -2533 L -2496 -2511 -2541 -2506 M -2746 -1807 L -2664 -1558 Q -2839 -1593 -2941 -1843 L -2925 -1713 -2941 -1719 M -2746 -1807 L -2758 -1821 -2767 -1833 M -3076 -1854 Q -3046 -1767 -3087 -1689 -3136 -1657 -3168 -1743 -3121 -1870 -3274 -1950 M -2991 -2290 Q -2895 -2352 -2799 -2445 M -2403 -1672 L -2187 -1476 Q -2416 -1414 -2746 -1807 M -2161 -2589 L -2214 -2568";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([51,0,0,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M -2787 -2532 L -2764 -2529 Q -2758 -2484 -2787 -2455 L -2799 -2445 M -2068 -3148 Q -2068 -3169 -2080 -3186 -2092 -3201 -2110 -3201 -2128 -3201 -2140 -3186 -2152 -3169 -2152 -3148 -2152 -3127 -2140 -3112 -2128 -3096 -2110 -3096 L -2101 -3097 Q -2089 -3100 -2080 -3112 L -2074 -3123 Q -2086 -3106 -2101 -3097 -2104 -3094 -2110 -3093 L -2130 -3088 Q -2163 -3088 -2188 -3118 -2214 -3151 -2215 -3198 -2217 -3246 -2194 -3279 -2172 -3313 -2139 -3315 -2106 -3316 -2080 -3283 -2067 -3268 -2061 -3247 -2053 -3229 -2053 -3205 -2052 -3172 -2062 -3145 L -2074 -3123 Q -2068 -3135 -2068 -3148 M -2062 -2646 L -2065 -2664 -2070 -2706 -2061 -2715 -2055 -2716 -2053 -2715 -2053 -2716 -2076 -2809 Q -2047 -2796 -2020 -2779 L -2019 -2782 Q -1966 -2886 -2077 -3010 -2241 -3115 -2326 -2917 -2335 -2944 -2352 -2971 M -2127 -2832 L -2110 -2826 -2109 -2821 -2104 -2823 -2080 -2812 -2076 -2809 M -2110 -2826 L -2104 -2823 M -2056 -2719 L -2076 -2760 Q -2091 -2782 -2109 -2791 L -2115 -2793 -2127 -2832 -2164 -2845 -2277 -2871 -2316 -2874 Q -2317 -2895 -2326 -2917 M -2289 -2838 Q -2239 -2845 -2173 -2799 L -2179 -2788 -2181 -2782 -2185 -2785 -2185 -2784 -2203 -2712 Q -2263 -2757 -2322 -2725 L -2308 -2781 -2289 -2838 -2277 -2871 M -2115 -2793 Q -2142 -2805 -2179 -2788 M -2056 -2719 L -2055 -2716 -2058 -2719 -2181 -2782 M -2055 -2716 L -2053 -2716 -2055 -2716 M -2062 -2646 L -2056 -2590 -2161 -2586 -2161 -2589 -2164 -2611 -2164 -2635 Q -2106 -2608 -2065 -2664 M -2157 -2676 Q -2107 -2670 -2070 -2706 M -2164 -2635 L -2157 -2676 Q -2181 -2680 -2206 -2694 L -2203 -2712 M -2466 -2934 Q -2491 -2919 -2521 -2919 -2575 -2919 -2614 -2967 -2653 -3013 -2653 -3081 -2653 -3148 -2614 -3196 -2575 -3243 -2521 -3243 -2467 -3243 -2428 -3196 -2389 -3148 -2389 -3081 -2389 -3034 -2409 -2997 L -2413 -2989 -2428 -2967 -2451 -2943 -2469 -2941 Q -2493 -2941 -2509 -2958 -2526 -2974 -2526 -2998 -2526 -3022 -2509 -3039 -2493 -3055 -2469 -3055 -2445 -3055 -2428 -3039 -2412 -3022 -2412 -2998 L -2413 -2989 Q -2415 -2971 -2428 -2958 L -2451 -2943 -2466 -2934 M -2326 -2787 Q -2310 -2829 -2316 -2874 M -2215 -2601 L -2245 -2611 Q -2275 -2619 -2304 -2611 -2322 -2607 -2340 -2593 L -2340 -2611 Q -2335 -2667 -2322 -2725 M -2214 -2568 L -2215 -2601 -2215 -2611 -2206 -2694 M -2326 -2787 Q -2346 -2739 -2397 -2694 M -2764 -2529 L -2764 -2533 M -2340 -2533 L -2214 -2568 -2208 -2508 Q -2281 -2548 -2338 -2503 L -2340 -2533 -2340 -2593 M -2208 -2508 L -2208 -2506 Q -2244 -2271 -2337 -2499 L -2338 -2503 M -2056 -2590 L -2053 -2571 -2056 -2562 Q -2092 -2457 -2149 -2542 L -2152 -2548 -2154 -2560 -2161 -2586";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([51,0,0,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

}

function shape134(ctx,ctrans,frame,ratio,time){
	var pathData="M -4650 -3473 Q -4767 -3725 -4561 -3536 L -4521 -3497 Q -4642 -3890 -4374 -3533 -4486 -3837 -4251 -3558 -4486 -3837 -4374 -3533 -4642 -3890 -4521 -3497 L -4561 -3536 Q -4767 -3725 -4650 -3473 L -4645 -3465 -4561 -3386 Q -4396 -3228 -4252 -3059 L -4372 -3027 Q -4398 -2954 -4254 -2918 -4690 -2885 -4903 -2519 -4819 -2456 -4638 -2528 -4843 -2349 -4960 -2153 -4914 -2016 -4648 -2232 -4794 -1980 -4831 -1662 -4651 -1664 -4572 -1863 -4614 -1644 -4603 -1371 -4572 -1212 -4497 -1203 L -4495 -1203 Q -4362 -1682 -4101 -2043 L -4014 -2157 -3990 -2184 -3925 -2258 -3772 -2409 Q -3562 -2598 -3301 -2741 -3093 -2750 -3021 -2643 L -3009 -2654 Q -2980 -2682 -2986 -2727 L -3009 -2730 -2986 -2727 Q -2980 -2682 -3009 -2654 L -3021 -2643 Q -3114 -2553 -3208 -2492 -3003 -2339 -2850 -2172 -2821 -2256 -2946 -2411 L -2934 -2420 Q -2733 -2181 -2592 -2058 L -2521 -2000 Q -2511 -2028 -2509 -2058 -2497 -2177 -2592 -2330 -2478 -2163 -2370 -2058 -2253 -1944 -2145 -1901 -2154 -1979 -2185 -2058 -2250 -2222 -2406 -2400 -2202 -2180 -2050 -2058 -1936 -1967 -1852 -1932 L -1894 -2058 Q -1936 -2175 -1984 -2280 L -1987 -2288 Q -2113 -2564 -2281 -2753 -2316 -2658 -2371 -2741 L -2374 -2747 -2376 -2759 -2383 -2784 -2383 -2787 -2386 -2810 -2386 -2834 -2383 -2856 -2379 -2874 -2419 -2888 -2428 -2892 -2437 -2810 -2437 -2799 -2436 -2766 -2383 -2787 -2436 -2766 -2433 -2726 -2430 -2706 -2430 -2705 Q -2466 -2469 -2559 -2697 L -2560 -2702 -2562 -2732 -2562 -2792 -2562 -2810 -2562 -2813 -2544 -2924 -2532 -2973 -2530 -2979 -2548 -2985 Q -2532 -3027 -2538 -3072 -2539 -3093 -2548 -3116 -2463 -3314 -2299 -3209 -2188 -3084 -2241 -2981 L -2242 -2978 -2298 -3008 -2275 -2915 -2275 -2913 -2277 -2915 -2283 -2913 -2292 -2904 -2287 -2862 -2284 -2844 -2277 -2850 -2232 -2888 Q -2190 -2933 -2161 -2975 -2058 -3134 -2161 -3264 -2193 -3305 -2245 -3341 L -2248 -3356 Q -2259 -3405 -2278 -3449 -2323 -3554 -2410 -3620 -2512 -3698 -2674 -3723 -2608 -3744 -2532 -3723 -2589 -3800 -2703 -3804 -2676 -3846 -2581 -3819 -2755 -3927 -2901 -3785 L -2890 -3873 Q -3003 -3812 -3034 -3672 L -3037 -3657 -3040 -3650 Q -3184 -3581 -3232 -3200 L -3235 -3185 Q -3235 -3177 -3238 -3170 L -3268 -3168 -3273 -3168 -3330 -3089 Q -3597 -3042 -3960 -3200 -4114 -3368 -4251 -3558 -4422 -3800 -4561 -4076 L -4570 -4094 Q -4734 -4176 -4723 -3953 L -4621 -3842 -4723 -3953 -4914 -4161 Q -5004 -4251 -5076 -4217 -5152 -4145 -5007 -3957 L -5247 -4113 Q -5361 -4070 -5226 -3923 -4914 -3710 -4651 -3470 L -4650 -3473 M -4639 -3719 L -5007 -3957 -4639 -3719 M -4231 -3072 L -4233 -3062 -4252 -3059 -4233 -3062 -4231 -3072 M -3271 -3102 L -3330 -3089 -3271 -3102 M -4581 -2553 L -4633 -2529 -4638 -2528 -4633 -2529 -4581 -2553 M -4648 -2232 Q -4608 -2301 -4560 -2364 -4608 -2301 -4648 -2232 M -4459 -2202 Q -4534 -2052 -4572 -1863 -4534 -2052 -4459 -2202 M -2332 -3291 L -2352 -3287 Q -2385 -3287 -2410 -3317 -2436 -3350 -2437 -3396 -2439 -3444 -2416 -3477 -2394 -3512 -2361 -3513 -2328 -3515 -2302 -3482 -2289 -3467 -2283 -3446 -2275 -3428 -2275 -3404 -2274 -3371 -2284 -3344 L -2296 -3321 -2302 -3311 Q -2311 -3299 -2323 -3296 -2326 -3293 -2332 -3291 M -2904 -3762 L -2901 -3783 -2901 -3785 -2901 -3783 -2904 -3762 M -2731 -3695 Q -2704 -3714 -2674 -3723 -2704 -3714 -2731 -3695 M -2688 -3132 Q -2713 -3117 -2743 -3117 -2797 -3117 -2836 -3165 -2875 -3212 -2875 -3279 -2875 -3347 -2836 -3395 -2797 -3441 -2743 -3441 -2689 -3441 -2650 -3395 -2611 -3347 -2611 -3279 -2611 -3233 -2631 -3195 L -2635 -3188 Q -2637 -3170 -2650 -3156 -2661 -3146 -2673 -3141 L -2688 -3132 M -2574 -3170 Q -2557 -3143 -2548 -3116 -2557 -3143 -2574 -3170 M -2619 -2892 Q -2569 -2936 -2550 -2984 L -2548 -2985 -2550 -2984 Q -2569 -2936 -2619 -2892 M -3009 -2730 Q -3099 -2757 -3154 -2810 -3246 -2895 -3249 -3048 L -3247 -3098 -3238 -3170 -3247 -3098 -3249 -3048 Q -3246 -2895 -3154 -2810 -3099 -2757 -3009 -2730 M -3255 -2766 Q -3277 -2754 -3301 -2741 -3277 -2754 -3255 -2766 M -2986 -2732 Q -2884 -2705 -2806 -2703 L -2718 -2709 Q -2634 -2717 -2562 -2732 -2634 -2717 -2718 -2709 L -2806 -2703 Q -2884 -2705 -2986 -2732 L -2986 -2727 -2986 -2732 M -1987 -2288 Q -2199 -2553 -2433 -2726 -2199 -2553 -1987 -2288 M -2601 -2343 L -2592 -2330 -2601 -2343";
	ctx.fillStyle=tocolor(ctrans.apply([242,26,77,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M -3772 -2409 Q -3682 -2379 -3594 -2376 L -3588 -2376 -3481 -2384 Q -3348 -2405 -3213 -2489 L -3208 -2492 Q -3114 -2553 -3021 -2643 -3093 -2750 -3301 -2741 -3562 -2598 -3772 -2409";
	ctx.fillStyle=tocolor(ctrans.apply([255,127,23,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M -4101 -2043 L -4099 -2037 -4098 -2001 -4098 -1983 Q -4090 -1892 -4024 -1922 -3970 -2016 -4014 -2157 L -4101 -2043 M -3990 -2184 Q -3948 -2151 -3949 -2082 L -3951 -2060 -3955 -2033 Q -3973 -1908 -3897 -1944 -3789 -2138 -3925 -2258 L -3990 -2184 M -3588 -2376 L -3450 -2244 Q -3568 -2273 -3595 -2189 -3331 -2105 -3390 -1941 -3358 -1856 -3309 -1887 -3268 -1965 -3298 -2052 -3244 -2025 -3223 -1919 -3186 -1871 -3160 -1923 -3141 -2114 -3333 -2228 L -3478 -2382 -3481 -2384 -3588 -2376 M -3298 -2052 L -3309 -2079 Q -3319 -2106 -3339 -2135 -3319 -2106 -3309 -2079 L -3298 -2052 M -3414 -2210 L -3450 -2244 -3414 -2210";
	ctx.fillStyle=tocolor(ctrans.apply([207,151,0,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M -2332 -3294 Q -2350 -3294 -2362 -3311 -2374 -3326 -2374 -3347 -2374 -3368 -2362 -3384 -2350 -3399 -2332 -3399 -2314 -3399 -2302 -3384 -2290 -3368 -2290 -3347 L -2284 -3344 Q -2274 -3371 -2275 -3404 -2275 -3428 -2283 -3446 -2289 -3467 -2302 -3482 -2328 -3515 -2361 -3513 -2394 -3512 -2416 -3477 -2439 -3444 -2437 -3396 -2436 -3350 -2410 -3317 -2385 -3287 -2352 -3287 L -2332 -3291 -2332 -3294 M -2691 -3140 Q -2715 -3140 -2731 -3156 -2748 -3173 -2748 -3197 -2748 -3221 -2731 -3237 -2715 -3254 -2691 -3254 -2667 -3254 -2650 -3237 -2634 -3221 -2634 -3197 L -2631 -3195 Q -2611 -3233 -2611 -3279 -2611 -3347 -2650 -3395 -2689 -3441 -2743 -3441 -2797 -3441 -2836 -3395 -2875 -3347 -2875 -3279 -2875 -3212 -2836 -3165 -2797 -3117 -2743 -3117 -2713 -3117 -2688 -3132 L -2691 -3140";
	ctx.fillStyle=tocolor(ctrans.apply([255,255,255,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M -2290 -3347 Q -2290 -3368 -2302 -3384 -2314 -3399 -2332 -3399 -2350 -3399 -2362 -3384 -2374 -3368 -2374 -3347 -2374 -3326 -2362 -3311 -2350 -3294 -2332 -3294 L -2323 -3296 Q -2308 -3305 -2296 -3321 -2290 -3333 -2290 -3347 M -2634 -3197 Q -2634 -3221 -2650 -3237 -2667 -3254 -2691 -3254 -2715 -3254 -2731 -3237 -2748 -3221 -2748 -3197 -2748 -3173 -2731 -3156 -2715 -3140 -2691 -3140 L -2673 -3141 -2650 -3165 -2635 -3188 -2634 -3197";
	ctx.fillStyle=tocolor(ctrans.apply([0,0,0,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M -2326 -3021 L -2302 -3011 -2298 -3008 -2242 -2978 -2241 -2981 Q -2188 -3084 -2299 -3209 -2463 -3314 -2548 -3116 -2539 -3093 -2538 -3072 L -2499 -3069 -2538 -3072 Q -2532 -3027 -2548 -2985 L -2530 -2979 -2511 -3036 -2499 -3069 Q -2442 -3062 -2386 -3044 L -2349 -3030 -2332 -3024 -2326 -3021 M -2379 -2874 Q -2329 -2868 -2292 -2904 L -2283 -2913 -2280 -2918 -2403 -2981 -2407 -2982 -2425 -2910 -2428 -2895 -2428 -2892 -2419 -2888 -2379 -2874";
	ctx.fillStyle=tocolor(ctrans.apply([255,186,0,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M -2281 -2753 L -2278 -2760 -2275 -2769 -2278 -2789 -2284 -2844 -2287 -2862 -2292 -2904 Q -2329 -2868 -2379 -2874 L -2383 -2856 -2386 -2834 Q -2367 -2825 -2350 -2825 -2314 -2826 -2287 -2862 -2314 -2826 -2350 -2825 -2367 -2825 -2386 -2834 L -2386 -2810 -2383 -2787 -2383 -2784 -2376 -2759 -2374 -2747 -2371 -2741 Q -2316 -2658 -2281 -2753 M -2298 -3008 L -2302 -3011 -2326 -3021 -2331 -3020 -2332 -3024 -2349 -3030 -2386 -3044 Q -2442 -3062 -2499 -3069 L -2511 -3036 -2530 -2979 -2532 -2973 -2544 -2924 -2562 -2813 -2562 -2810 -2562 -2792 -2544 -2802 -2526 -2810 Q -2497 -2817 -2467 -2810 L -2437 -2799 -2467 -2810 Q -2497 -2817 -2526 -2810 L -2544 -2802 -2562 -2792 -2562 -2732 -2560 -2702 -2559 -2697 Q -2466 -2469 -2430 -2705 L -2430 -2706 -2433 -2726 -2436 -2766 -2437 -2799 -2437 -2810 -2428 -2892 -2428 -2895 -2425 -2910 Q -2452 -2931 -2478 -2936 -2511 -2942 -2544 -2924 -2511 -2942 -2478 -2936 -2452 -2931 -2425 -2910 L -2407 -2982 -2407 -2984 -2403 -2981 -2401 -2987 -2337 -2991 -2331 -2990 Q -2313 -2981 -2298 -2958 L -2278 -2918 -2277 -2915 -2275 -2915 -2298 -3008 M -2349 -3030 L -2337 -2991 -2349 -3030 M -2278 -2789 Q -2290 -2781 -2304 -2777 -2338 -2766 -2383 -2784 -2338 -2766 -2304 -2777 -2290 -2781 -2278 -2789 M -2401 -2987 L -2395 -2997 Q -2461 -3044 -2511 -3036 -2461 -3044 -2395 -2997 L -2401 -2987 M -2562 -2732 L -2473 -2754 -2436 -2766 -2473 -2754 -2562 -2732 M -2430 -2706 Q -2503 -2747 -2560 -2702 -2503 -2747 -2430 -2706";
	ctx.fillStyle=tocolor(ctrans.apply([153,102,51,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M -2278 -2918 L -2298 -2958 Q -2313 -2981 -2331 -2990 L -2337 -2991 -2401 -2987 -2403 -2981 -2280 -2918 -2278 -2918";
	ctx.fillStyle=tocolor(ctrans.apply([153,51,51,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M -4251 -3558 Q -4486 -3837 -4374 -3533 -4642 -3890 -4521 -3497 L -4561 -3536 Q -4767 -3725 -4650 -3473 L -4645 -3465 -4561 -3386 Q -4396 -3228 -4252 -3059 L -4372 -3027 Q -4398 -2954 -4254 -2918 -4690 -2885 -4903 -2519 -4819 -2456 -4638 -2528 -4843 -2349 -4960 -2153 -4914 -2016 -4648 -2232 -4794 -1980 -4831 -1662 -4651 -1664 -4572 -1863 -4614 -1644 -4603 -1371 -4572 -1212 -4497 -1203 L -4495 -1203 Q -4362 -1682 -4101 -2043 L -4099 -2037 -4098 -2001 -4098 -1983 Q -4090 -1892 -4024 -1922 -3970 -2016 -4014 -2157 L -3990 -2184 Q -3948 -2151 -3949 -2082 L -3951 -2060 -3955 -2033 Q -3973 -1908 -3897 -1944 -3789 -2138 -3925 -2258 L -3772 -2409 Q -3682 -2379 -3594 -2376 L -3588 -2376 -3450 -2244 Q -3568 -2273 -3595 -2189 -3331 -2105 -3390 -1941 -3358 -1856 -3309 -1887 -3268 -1965 -3298 -2052 -3244 -2025 -3223 -1919 -3186 -1871 -3160 -1923 -3141 -2114 -3333 -2228 L -3478 -2382 Q -3283 -2309 -3213 -2489 L -3208 -2492 Q -3003 -2339 -2850 -2172 -2821 -2256 -2946 -2411 M -4651 -3470 Q -4914 -3710 -5226 -3923 -5361 -4070 -5247 -4113 L -5007 -3957 -4639 -3719 M -4621 -3842 L -4723 -3953 Q -4734 -4176 -4570 -4094 L -4561 -4076 Q -4422 -3800 -4251 -3558 -4114 -3368 -3960 -3200 -3597 -3042 -3330 -3089 L -3271 -3102 M -4252 -3059 L -4233 -3062 -4231 -3072 M -2934 -2420 Q -2733 -2181 -2592 -2058 L -2521 -2000 Q -2511 -2028 -2509 -2058 -2497 -2177 -2592 -2330 -2478 -2163 -2370 -2058 -2253 -1944 -2145 -1901 -2154 -1979 -2185 -2058 -2250 -2222 -2406 -2400 -2202 -2180 -2050 -2058 -1936 -1967 -1852 -1932 L -1894 -2058 Q -1936 -2175 -1984 -2280 L -1987 -2288 Q -2113 -2564 -2281 -2753 M -2284 -2844 L -2277 -2850 -2232 -2888 Q -2190 -2933 -2161 -2975 -2058 -3134 -2161 -3264 -2193 -3305 -2245 -3341 L -2248 -3356 Q -2259 -3405 -2278 -3449 -2323 -3554 -2410 -3620 -2512 -3698 -2674 -3723 -2608 -3744 -2532 -3723 -2589 -3800 -2703 -3804 -2676 -3846 -2581 -3819 -2755 -3927 -2901 -3785 L -2890 -3873 Q -3003 -3812 -3034 -3672 L -3037 -3657 -3040 -3650 Q -3184 -3581 -3232 -3200 L -3235 -3185 Q -3235 -3177 -3238 -3170 L -3268 -3168 -3273 -3168 -3330 -3089 M -4651 -3470 L -4645 -3465 M -4723 -3953 L -4914 -4161 Q -5004 -4251 -5076 -4217 -5152 -4145 -5007 -3957 M -4560 -2364 Q -4608 -2301 -4648 -2232 M -4638 -2528 L -4633 -2529 -4581 -2553 M -3925 -2258 L -3990 -2184 M -4101 -2043 L -4014 -2157 M -4572 -1863 Q -4534 -2052 -4459 -2202 M -2674 -3723 Q -2704 -3714 -2731 -3695 M -2901 -3785 L -2901 -3783 -2904 -3762 M -2383 -2787 L -2436 -2766 M -3238 -3170 L -3247 -3098 -3249 -3048 Q -3246 -2895 -3154 -2810 -3099 -2757 -3009 -2730 M -3021 -2643 Q -3093 -2750 -3301 -2741 -3277 -2754 -3255 -2766 M -3478 -2382 L -3481 -2384 Q -3348 -2405 -3213 -2489 M -3021 -2643 Q -3114 -2553 -3208 -2492 M -3450 -2244 L -3414 -2210 M -3339 -2135 Q -3319 -2106 -3309 -2079 L -3298 -2052 M -2562 -2732 Q -2634 -2717 -2718 -2709 L -2806 -2703 Q -2884 -2705 -2986 -2732 M -2433 -2726 Q -2199 -2553 -1987 -2288 M -2592 -2330 L -2601 -2343 M -3772 -2409 Q -3562 -2598 -3301 -2741 M -3481 -2384 L -3588 -2376";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([51,0,0,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M -2281 -2753 L -2278 -2760 -2275 -2769 -2278 -2789 -2284 -2844 -2287 -2862 Q -2314 -2826 -2350 -2825 -2367 -2825 -2386 -2834 L -2383 -2856 -2379 -2874 Q -2329 -2868 -2292 -2904 L -2287 -2862 M -2290 -3347 Q -2290 -3368 -2302 -3384 -2314 -3399 -2332 -3399 -2350 -3399 -2362 -3384 -2374 -3368 -2374 -3347 -2374 -3326 -2362 -3311 -2350 -3294 -2332 -3294 L -2323 -3296 Q -2311 -3299 -2302 -3311 L -2296 -3321 -2284 -3344 Q -2274 -3371 -2275 -3404 -2275 -3428 -2283 -3446 -2289 -3467 -2302 -3482 -2328 -3515 -2361 -3513 -2394 -3512 -2416 -3477 -2439 -3444 -2437 -3396 -2436 -3350 -2410 -3317 -2385 -3287 -2352 -3287 L -2332 -3291 Q -2326 -3293 -2323 -3296 -2308 -3305 -2296 -3321 -2290 -3333 -2290 -3347 M -2298 -3008 L -2302 -3011 -2326 -3021 -2332 -3024 -2349 -3030 -2386 -3044 Q -2442 -3062 -2499 -3069 L -2538 -3072 Q -2539 -3093 -2548 -3116 -2463 -3314 -2299 -3209 -2188 -3084 -2241 -2981 L -2242 -2978 -2298 -3008 -2275 -2915 -2277 -2915 -2280 -2918 -2403 -2981 -2401 -2987 -2337 -2991 -2349 -3030 M -2277 -2915 L -2278 -2918 -2298 -2958 Q -2313 -2981 -2331 -2990 L -2337 -2991 M -2326 -3021 L -2331 -3020 -2332 -3024 M -2275 -2915 L -2277 -2915 -2275 -2913 -2275 -2915 M -2383 -2784 Q -2338 -2766 -2304 -2777 -2290 -2781 -2278 -2789 M -2292 -2904 L -2283 -2913 -2277 -2915 M -2691 -3140 Q -2715 -3140 -2731 -3156 -2748 -3173 -2748 -3197 -2748 -3221 -2731 -3237 -2715 -3254 -2691 -3254 -2667 -3254 -2650 -3237 -2634 -3221 -2634 -3197 L -2635 -3188 -2650 -3165 -2673 -3141 -2691 -3140 M -2688 -3132 Q -2713 -3117 -2743 -3117 -2797 -3117 -2836 -3165 -2875 -3212 -2875 -3279 -2875 -3347 -2836 -3395 -2797 -3441 -2743 -3441 -2689 -3441 -2650 -3395 -2611 -3347 -2611 -3279 -2611 -3233 -2631 -3195 L -2635 -3188 Q -2637 -3170 -2650 -3156 -2661 -3146 -2673 -3141 L -2688 -3132 M -2548 -3116 Q -2557 -3143 -2574 -3170 M -2548 -2985 Q -2532 -3027 -2538 -3072 M -2548 -2985 L -2550 -2984 Q -2569 -2936 -2619 -2892 M -2544 -2924 L -2532 -2973 -2530 -2979 -2511 -3036 Q -2461 -3044 -2395 -2997 L -2401 -2987 M -2407 -2982 L -2407 -2984 -2403 -2981 M -2511 -3036 L -2499 -3069 M -2428 -2892 L -2419 -2888 -2379 -2874 M -2425 -2910 L -2428 -2895 -2428 -2892 -2437 -2810 -2437 -2799 -2467 -2810 Q -2497 -2817 -2526 -2810 L -2544 -2802 -2562 -2792 -2562 -2810 -2562 -2813 -2544 -2924 Q -2511 -2942 -2478 -2936 -2452 -2931 -2425 -2910 L -2407 -2982 M -2386 -2834 L -2386 -2810 -2383 -2787 -2383 -2784 -2376 -2759 -2374 -2747 -2371 -2741 Q -2316 -2658 -2281 -2753 M -2436 -2766 L -2437 -2799 M -2436 -2766 L -2473 -2754 -2562 -2732 -2562 -2792 M -3009 -2730 L -2986 -2727 Q -2980 -2682 -3009 -2654 L -3021 -2643 M -2986 -2732 L -2986 -2727 M -2562 -2732 L -2560 -2702 -2559 -2697 Q -2466 -2469 -2430 -2705 L -2430 -2706 -2433 -2726 -2436 -2766 M -2560 -2702 Q -2503 -2747 -2430 -2706";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([51,0,0,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

}

function shape135(ctx,ctrans,frame,ratio,time){
	var pathData="M -4354 -4114 L -4384 -4122 -4225 -3781 Q -4573 -4204 -4948 -4093 -4693 -3927 -4564 -3762 -4775 -3909 -4952 -3852 -5012 -3889 -5063 -3864 -5098 -3832 -5087 -3775 L -5134 -3732 -5071 -3723 Q -5047 -3672 -4994 -3604 L -5234 -3760 Q -5348 -3717 -5213 -3570 -4957 -3394 -4735 -3202 L -4745 -3193 Q -4696 -3148 -4628 -3108 L -4549 -3033 Q -4375 -2866 -4225 -2688 L -4225 -2680 Q -4241 -2554 -4202 -2457 -4178 -2400 -4138 -2353 L -4154 -2338 Q -4204 -2286 -4168 -2217 L -4157 -2200 -4153 -2191 Q -4118 -2136 -4076 -2104 L -4045 -2086 -4019 -2076 Q -3827 -2043 -3799 -2071 -3755 -2115 -3763 -2191 -3577 -2349 -3325 -2382 L -3316 -2386 -3307 -2388 Q -3083 -2401 -3008 -2290 L -2996 -2301 Q -2968 -2329 -2974 -2374 L -2996 -2377 Q -3086 -2404 -3142 -2457 -3208 -2518 -3227 -2614 -3239 -2674 -3235 -2745 L -3223 -2832 -3220 -2847 Q -3172 -3228 -3028 -3297 -3172 -3228 -3220 -2847 L -3223 -2832 -3235 -2745 Q -3239 -2674 -3227 -2614 -3208 -2518 -3142 -2457 -3086 -2404 -2996 -2377 L -2974 -2374 -2974 -2379 Q -2872 -2352 -2794 -2350 L -2705 -2356 Q -2621 -2364 -2549 -2379 L -2549 -2439 -2549 -2457 Q -2545 -2512 -2531 -2571 L -2518 -2626 -2536 -2632 Q -2519 -2674 -2525 -2719 -2527 -2740 -2536 -2763 -2450 -2961 -2287 -2856 -2176 -2731 -2228 -2628 L -2230 -2625 -2285 -2655 -2263 -2562 -2263 -2560 -2264 -2562 -2270 -2560 -2279 -2551 -2275 -2509 -2272 -2491 -2264 -2497 -2219 -2535 Q -2177 -2580 -2149 -2622 -2045 -2781 -2149 -2911 -2180 -2952 -2233 -2988 L -2236 -3003 Q -2246 -3052 -2266 -3096 -2311 -3201 -2398 -3267 -2500 -3345 -2662 -3370 -2596 -3391 -2519 -3370 -2576 -3447 -2690 -3451 -2663 -3493 -2569 -3466 -2636 -3508 -2701 -3511 -2543 -3784 -2309 -3969 -2449 -4027 -2644 -3880 -2612 -3997 -2492 -4114 -2708 -4098 -2978 -3784 L -2948 -3949 Q -3160 -3858 -3212 -3499 L -3221 -3495 -3280 -3627 Q -3407 -3367 -3365 -3108 L -3430 -3202 Q -3488 -2995 -3410 -2740 -3485 -2794 -3544 -2982 L -3562 -3019 Q -4042 -4078 -4384 -4152 L -4354 -4114 Q -4058 -4021 -3673 -2901 L -3667 -2883 Q -3626 -2802 -3586 -2736 -3523 -2641 -3455 -2583 -3523 -2641 -3586 -2736 -3626 -2802 -3667 -2883 L -3673 -2901 Q -4058 -4021 -4354 -4114 M -3953 -2685 Q -3914 -2667 -3871 -2652 -3668 -2568 -3455 -2583 -3668 -2568 -3871 -2652 -3914 -2667 -3953 -2685 -4142 -2772 -4204 -2952 -4468 -3013 -4628 -3108 -4468 -3013 -4204 -2952 -4142 -2772 -3953 -2685 M -4678 -3231 L -4616 -3240 -4678 -3231 Q -4688 -3292 -4616 -3240 -4688 -3292 -4678 -3231 -4709 -3222 -4735 -3202 -4709 -3222 -4678 -3231 M -4204 -3739 L -4225 -3781 -4204 -3739 M -4832 -3498 Q -4742 -3535 -4631 -3513 -4742 -3535 -4832 -3498 L -4994 -3604 -4832 -3498 Q -4904 -3469 -4964 -3400 -4727 -3355 -4537 -3244 L -4532 -3226 -4616 -3240 -4532 -3226 -4480 -3210 -4451 -3192 -4480 -3210 -4532 -3226 -4537 -3244 Q -4727 -3355 -4964 -3400 -4904 -3469 -4832 -3498 M -4631 -3513 L -4678 -3564 -4631 -3513 -4591 -3504 -4519 -3447 -4591 -3504 -4631 -3513 M -4678 -3564 Q -4874 -3691 -5071 -3723 -4874 -3691 -4678 -3564 L -4591 -3504 -4678 -3564 M -5087 -3775 Q -5023 -3829 -4952 -3852 -5023 -3829 -5087 -3775 M -4480 -3210 Q -4507 -3229 -4537 -3244 -4507 -3229 -4480 -3210 M -3874 -2472 L -3865 -2457 Q -3772 -2293 -3763 -2191 -3772 -2293 -3865 -2457 L -3874 -2472 M -4225 -2688 L -4219 -2719 -4225 -2688 M -4123 -2355 L -4121 -2346 -4138 -2353 -4123 -2355 -4144 -2479 -4123 -2355 M -4099 -2224 L -4121 -2346 -4099 -2224 M -2320 -2938 L -2339 -2934 Q -2372 -2934 -2398 -2964 -2423 -2997 -2425 -3043 -2426 -3091 -2404 -3124 -2381 -3159 -2348 -3160 -2315 -3162 -2290 -3129 -2276 -3114 -2270 -3093 -2263 -3075 -2263 -3051 -2261 -3018 -2272 -2991 L -2284 -2968 -2290 -2958 Q -2299 -2946 -2311 -2943 -2314 -2940 -2320 -2938 M -2561 -2817 Q -2545 -2790 -2536 -2763 -2545 -2790 -2561 -2817 M -2657 -3859 L -2644 -3880 -2657 -3859 M -2878 -3520 L -2888 -3432 Q -2800 -3519 -2701 -3511 -2800 -3519 -2888 -3432 L -2878 -3520 Q -2990 -3459 -3022 -3319 -2990 -3459 -2878 -3520 M -3025 -3304 L -3022 -3319 -3025 -3304 -3028 -3297 -3025 -3304 M -2891 -3409 L -2888 -3430 -2888 -3432 -2888 -3430 -2891 -3409 M -2719 -3342 Q -2692 -3361 -2662 -3370 -2692 -3361 -2719 -3342 M -2675 -2779 Q -2701 -2764 -2731 -2764 -2785 -2764 -2824 -2812 -2863 -2859 -2863 -2926 -2863 -2994 -2824 -3042 -2785 -3088 -2731 -3088 -2677 -3088 -2638 -3042 -2599 -2994 -2599 -2926 -2599 -2880 -2618 -2842 L -2623 -2835 Q -2624 -2817 -2638 -2803 L -2660 -2788 -2675 -2779 M -3259 -2749 Q -3320 -2733 -3386 -2727 -3320 -2733 -3259 -2749 M -3365 -3108 L -3355 -3094 -3365 -3108 M -3212 -3477 L -3221 -3495 -3212 -3477 M -3410 -2740 L -3386 -2727 -3349 -2719 -3386 -2727 -3410 -2740 M -3349 -2719 Q -3290 -2568 -3455 -2583 -3290 -2568 -3349 -2719 M -2606 -2539 Q -2555 -2584 -2536 -2632 -2555 -2584 -2606 -2539 M -2423 -2413 L -2371 -2434 -2374 -2457 -2374 -2481 -2366 -2521 -2416 -2539 -2425 -2457 -2425 -2446 -2423 -2413";
	ctx.fillStyle=tocolor(ctrans.apply([242,26,77,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M -4154 -2338 L -4234 -2382 -4267 -2316 -4265 -2308 Q -4154 -2136 -4127 -1962 -4216 -1990 -4231 -1924 -4100 -1875 -4087 -1684 L -4085 -1648 -4085 -1630 Q -4078 -1539 -4012 -1569 -3950 -1678 -4018 -1852 -3934 -1825 -3937 -1729 L -3938 -1707 -3943 -1680 Q -3961 -1555 -3884 -1591 -3740 -1846 -4028 -1975 L -4076 -2104 Q -4118 -2136 -4153 -2191 L -4157 -2200 -4168 -2217 Q -4204 -2286 -4154 -2338 M -4016 -1872 L -4018 -1852 -4016 -1872 M -3469 -2031 L -3575 -2023 -3437 -1891 Q -3556 -1920 -3583 -1836 -3319 -1752 -3377 -1588 -3346 -1503 -3296 -1534 -3256 -1612 -3286 -1699 -3232 -1672 -3211 -1566 -3173 -1518 -3148 -1570 -3128 -1761 -3320 -1875 L -3466 -2029 -3469 -2031 M -3401 -1857 L -3437 -1891 -3401 -1857 M -3286 -1699 L -3296 -1726 -3326 -1782 -3296 -1726 -3286 -1699";
	ctx.fillStyle=tocolor(ctrans.apply([207,151,0,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M -3325 -2382 Q -3577 -2349 -3763 -2191 -3755 -2115 -3799 -2071 -3689 -2028 -3581 -2023 L -3575 -2023 -3469 -2031 Q -3335 -2052 -3200 -2136 -3104 -2197 -3008 -2290 -3083 -2401 -3307 -2388 L -3325 -2382";
	ctx.fillStyle=tocolor(ctrans.apply([255,127,23,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M -2272 -2991 Q -2261 -3018 -2263 -3051 -2263 -3075 -2270 -3093 -2276 -3114 -2290 -3129 -2315 -3162 -2348 -3160 -2381 -3159 -2404 -3124 -2426 -3091 -2425 -3043 -2423 -2997 -2398 -2964 -2372 -2934 -2339 -2934 L -2320 -2938 -2320 -2941 Q -2338 -2941 -2350 -2958 -2362 -2973 -2362 -2994 -2362 -3015 -2350 -3031 -2338 -3046 -2320 -3046 -2302 -3046 -2290 -3031 -2278 -3015 -2278 -2994 L -2272 -2991 M -2678 -2787 Q -2702 -2787 -2719 -2803 -2735 -2820 -2735 -2844 -2735 -2868 -2719 -2884 -2702 -2901 -2678 -2901 -2654 -2901 -2638 -2884 -2621 -2868 -2621 -2844 L -2618 -2842 Q -2599 -2880 -2599 -2926 -2599 -2994 -2638 -3042 -2677 -3088 -2731 -3088 -2785 -3088 -2824 -3042 -2863 -2994 -2863 -2926 -2863 -2859 -2824 -2812 -2785 -2764 -2731 -2764 -2701 -2764 -2675 -2779 L -2678 -2787";
	ctx.fillStyle=tocolor(ctrans.apply([255,255,255,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M -2278 -2994 Q -2278 -3015 -2290 -3031 -2302 -3046 -2320 -3046 -2338 -3046 -2350 -3031 -2362 -3015 -2362 -2994 -2362 -2973 -2350 -2958 -2338 -2941 -2320 -2941 L -2311 -2943 Q -2296 -2952 -2284 -2968 -2278 -2980 -2278 -2994 M -2621 -2844 Q -2621 -2868 -2638 -2884 -2654 -2901 -2678 -2901 -2702 -2901 -2719 -2884 -2735 -2868 -2735 -2844 -2735 -2820 -2719 -2803 -2702 -2787 -2678 -2787 L -2660 -2788 -2638 -2812 -2623 -2835 -2621 -2844";
	ctx.fillStyle=tocolor(ctrans.apply([0,0,0,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M -2279 -2551 L -2270 -2560 -2267 -2565 -2390 -2628 -2395 -2629 -2413 -2557 -2416 -2539 -2366 -2521 Q -2317 -2515 -2279 -2551 M -2285 -2655 L -2230 -2625 -2228 -2628 Q -2176 -2731 -2287 -2856 -2450 -2961 -2536 -2763 -2527 -2740 -2525 -2719 -2519 -2674 -2536 -2632 L -2518 -2626 -2498 -2683 -2486 -2716 -2525 -2719 -2486 -2716 Q -2429 -2709 -2374 -2691 L -2336 -2677 -2320 -2671 -2314 -2668 -2290 -2658 -2285 -2655";
	ctx.fillStyle=tocolor(ctrans.apply([255,186,0,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M -2272 -2491 L -2275 -2509 -2279 -2551 Q -2317 -2515 -2366 -2521 L -2374 -2481 -2374 -2457 -2371 -2434 -2371 -2431 -2363 -2406 -2362 -2394 -2359 -2388 Q -2302 -2302 -2266 -2407 L -2263 -2416 -2266 -2436 -2272 -2491 M -2263 -2562 L -2285 -2655 -2290 -2658 -2314 -2668 -2318 -2667 -2320 -2671 -2336 -2677 -2374 -2691 Q -2429 -2709 -2486 -2716 L -2498 -2683 -2518 -2626 -2531 -2571 Q -2545 -2512 -2549 -2457 L -2549 -2439 -2549 -2379 -2548 -2349 -2546 -2344 Q -2453 -2116 -2417 -2352 L -2417 -2353 -2423 -2413 -2425 -2446 -2425 -2457 -2416 -2539 -2413 -2557 -2395 -2629 -2395 -2631 -2390 -2628 -2389 -2634 -2324 -2638 -2336 -2677 -2324 -2638 -2318 -2637 Q -2300 -2628 -2285 -2605 L -2266 -2565 -2264 -2562 -2263 -2562 M -2498 -2683 Q -2449 -2691 -2383 -2644 L -2389 -2634 -2383 -2644 Q -2449 -2691 -2498 -2683 M -2549 -2439 Q -2531 -2452 -2513 -2457 -2485 -2464 -2455 -2457 L -2425 -2446 -2455 -2457 Q -2485 -2464 -2513 -2457 -2531 -2452 -2549 -2439 M -2531 -2571 Q -2473 -2602 -2413 -2557 -2473 -2602 -2531 -2571 M -2549 -2379 L -2423 -2413 -2549 -2379 M -2548 -2349 Q -2491 -2394 -2417 -2353 -2491 -2394 -2548 -2349 M -2374 -2481 Q -2315 -2454 -2275 -2509 -2315 -2454 -2374 -2481 M -2371 -2431 Q -2309 -2407 -2266 -2436 -2309 -2407 -2371 -2431";
	ctx.fillStyle=tocolor(ctrans.apply([153,102,51,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M -2324 -2638 L -2389 -2634 -2390 -2628 -2267 -2565 -2266 -2565 -2285 -2605 Q -2300 -2628 -2318 -2637 L -2324 -2638";
	ctx.fillStyle=tocolor(ctrans.apply([153,51,51,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M -4384 -4122 L -4391 -4137 M -4354 -4114 L -4384 -4122 -4225 -3781 Q -4573 -4204 -4948 -4093 -4693 -3927 -4564 -3762 -4775 -3909 -4952 -3852 -5023 -3829 -5087 -3775 L -5134 -3732 -5071 -3723 Q -4874 -3691 -4678 -3564 L -4591 -3504 -4519 -3447 M -4735 -3202 L -4745 -3193 Q -4696 -3148 -4628 -3108 -4468 -3013 -4204 -2952 -4142 -2772 -3953 -2685 M -4354 -4114 Q -4058 -4021 -3673 -2901 L -3667 -2883 Q -3626 -2802 -3586 -2736 -3523 -2641 -3455 -2583 M -4225 -3781 L -4204 -3739 M -4616 -3240 L -4678 -3231 Q -4709 -3222 -4735 -3202 M -4616 -3240 L -4532 -3226 -4480 -3210 -4451 -3192 M -4631 -3513 Q -4742 -3535 -4832 -3498 -4904 -3469 -4964 -3400 -4727 -3355 -4537 -3244 -4507 -3229 -4480 -3210 M -4631 -3513 L -4591 -3504 M -2309 -3969 Q -2543 -3784 -2701 -3511 M -2878 -3520 Q -2990 -3459 -3022 -3319 M -3025 -3304 L -3028 -3297 M -3410 -2740 Q -3485 -2794 -3544 -2982 L -3562 -3019 Q -4042 -4078 -4384 -4152 M -3349 -2719 L -3386 -2727 -3410 -2740";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([51,0,0,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M -4952 -3852 Q -5012 -3889 -5063 -3864 -5098 -3832 -5087 -3775 M -5071 -3723 Q -5047 -3672 -4994 -3604 L -5234 -3760 Q -5348 -3717 -5213 -3570 -4957 -3394 -4735 -3202 M -4628 -3108 L -4549 -3033 Q -4375 -2866 -4225 -2688 L -4225 -2680 Q -4241 -2554 -4202 -2457 -4178 -2400 -4138 -2353 L -4154 -2338 -4234 -2382 -4267 -2316 -4265 -2308 Q -4154 -2136 -4127 -1962 -4216 -1990 -4231 -1924 L -4234 -1902 M -3455 -2583 Q -3668 -2568 -3871 -2652 -3914 -2667 -3953 -2685 M -4678 -3231 Q -4688 -3292 -4616 -3240 M -4832 -3498 L -4994 -3604 M -4678 -3564 L -4631 -3513 M -4537 -3244 L -4532 -3226 M -4219 -2719 L -4225 -2688 M -3763 -2191 Q -3772 -2293 -3865 -2457 L -3874 -2472 M -4123 -2355 L -4121 -2346 -4138 -2353 M -4123 -2355 L -4144 -2479 M -4154 -2338 Q -4204 -2286 -4168 -2217 L -4157 -2200 -4153 -2191 Q -4118 -2136 -4076 -2104 L -4028 -1975 Q -3740 -1846 -3884 -1591 -3961 -1555 -3943 -1680 L -3938 -1707 -3937 -1729 Q -3934 -1825 -4018 -1852 L -4016 -1872 M -4121 -2346 L -4099 -2224 M -3799 -2071 Q -3827 -2043 -4019 -2076 L -4045 -2086 -4076 -2104 M -4231 -1924 Q -4100 -1875 -4087 -1684 L -4085 -1648 -4085 -1630 Q -4078 -1539 -4012 -1569 -3950 -1678 -4018 -1852 M -3799 -2071 Q -3755 -2115 -3763 -2191 -3577 -2349 -3325 -2382 L -3316 -2386 -3307 -2388 Q -3083 -2401 -3008 -2290 -3104 -2197 -3200 -2136 -3335 -2052 -3469 -2031 L -3575 -2023 -3581 -2023 Q -3689 -2028 -3799 -2071 M -2272 -2991 Q -2261 -3018 -2263 -3051 -2263 -3075 -2270 -3093 -2276 -3114 -2290 -3129 -2315 -3162 -2348 -3160 -2381 -3159 -2404 -3124 -2426 -3091 -2425 -3043 -2423 -2997 -2398 -2964 -2372 -2934 -2339 -2934 L -2320 -2938 Q -2314 -2940 -2311 -2943 -2299 -2946 -2290 -2958 L -2284 -2968 -2272 -2991 M -2278 -2994 Q -2278 -3015 -2290 -3031 -2302 -3046 -2320 -3046 -2338 -3046 -2350 -3031 -2362 -3015 -2362 -2994 -2362 -2973 -2350 -2958 -2338 -2941 -2320 -2941 L -2311 -2943 Q -2296 -2952 -2284 -2968 -2278 -2980 -2278 -2994 M -2662 -3370 Q -2500 -3345 -2398 -3267 -2311 -3201 -2266 -3096 -2246 -3052 -2236 -3003 L -2233 -2988 Q -2180 -2952 -2149 -2911 -2045 -2781 -2149 -2622 -2177 -2580 -2219 -2535 L -2264 -2497 -2272 -2491 -2275 -2509 -2279 -2551 -2270 -2560 -2264 -2562 -2263 -2560 -2263 -2562 -2285 -2655 -2230 -2625 -2228 -2628 Q -2176 -2731 -2287 -2856 -2450 -2961 -2536 -2763 -2545 -2790 -2561 -2817 M -2644 -3880 L -2657 -3859 M -3212 -3499 Q -3160 -3858 -2948 -3949 L -2978 -3784 Q -2708 -4098 -2492 -4114 -2612 -3997 -2644 -3880 -2449 -4027 -2309 -3969 M -2701 -3511 Q -2800 -3519 -2888 -3432 L -2878 -3520 M -3022 -3319 L -3025 -3304 M -3028 -3297 Q -3172 -3228 -3220 -2847 L -3223 -2832 -3235 -2745 Q -3239 -2674 -3227 -2614 -3208 -2518 -3142 -2457 -3086 -2404 -2996 -2377 L -2974 -2374 Q -2968 -2329 -2996 -2301 L -3008 -2290 M -2888 -3432 L -2888 -3430 -2891 -3409 M -2701 -3511 Q -2636 -3508 -2569 -3466 -2663 -3493 -2690 -3451 -2576 -3447 -2519 -3370 -2596 -3391 -2662 -3370 -2692 -3361 -2719 -3342 M -2621 -2844 Q -2621 -2868 -2638 -2884 -2654 -2901 -2678 -2901 -2702 -2901 -2719 -2884 -2735 -2868 -2735 -2844 -2735 -2820 -2719 -2803 -2702 -2787 -2678 -2787 L -2660 -2788 -2675 -2779 Q -2701 -2764 -2731 -2764 -2785 -2764 -2824 -2812 -2863 -2859 -2863 -2926 -2863 -2994 -2824 -3042 -2785 -3088 -2731 -3088 -2677 -3088 -2638 -3042 -2599 -2994 -2599 -2926 -2599 -2880 -2618 -2842 L -2623 -2835 -2638 -2812 -2660 -2788 -2638 -2803 Q -2624 -2817 -2623 -2835 L -2621 -2844 M -3221 -3495 L -3280 -3627 Q -3407 -3367 -3365 -3108 L -3430 -3202 Q -3488 -2995 -3410 -2740 M -3221 -3495 L -3212 -3477 M -3355 -3094 L -3365 -3108 M -3386 -2727 Q -3320 -2733 -3259 -2749 M -3455 -2583 Q -3290 -2568 -3349 -2719 M -2486 -2716 L -2498 -2683 -2518 -2626 -2531 -2571 Q -2545 -2512 -2549 -2457 L -2549 -2439 -2549 -2379 Q -2621 -2364 -2705 -2356 L -2794 -2350 Q -2872 -2352 -2974 -2379 L -2974 -2374 M -2536 -2632 Q -2519 -2674 -2525 -2719 L -2486 -2716 Q -2429 -2709 -2374 -2691 L -2336 -2677 -2324 -2638 -2389 -2634 -2383 -2644 Q -2449 -2691 -2498 -2683 M -2525 -2719 Q -2527 -2740 -2536 -2763 M -2536 -2632 Q -2555 -2584 -2606 -2539 M -2549 -2379 L -2548 -2349 -2546 -2344 Q -2453 -2116 -2417 -2352 L -2417 -2353 -2423 -2413 -2371 -2434 -2371 -2431 -2363 -2406 -2362 -2394 -2359 -2388 Q -2302 -2302 -2266 -2407 L -2263 -2416 -2266 -2436 -2272 -2491 M -2425 -2446 L -2455 -2457 Q -2485 -2464 -2513 -2457 -2531 -2452 -2549 -2439 M -3437 -1891 L -3401 -1857 M -3466 -2029 L -3469 -2031 M -3575 -2023 L -3437 -1891 Q -3556 -1920 -3583 -1836 -3319 -1752 -3377 -1588 -3346 -1503 -3296 -1534 -3256 -1612 -3286 -1699 -3232 -1672 -3211 -1566 -3173 -1518 -3148 -1570 -3128 -1761 -3320 -1875 L -3466 -2029 Q -3271 -1956 -3200 -2136 M -3326 -1782 L -3296 -1726 -3286 -1699 M -2314 -2668 L -2320 -2671 -2336 -2677 M -2314 -2668 L -2290 -2658 -2285 -2655 M -2266 -2565 L -2285 -2605 Q -2300 -2628 -2318 -2637 L -2324 -2638 M -2267 -2565 L -2264 -2562 -2263 -2562 -2264 -2562 -2266 -2565 M -2267 -2565 L -2390 -2628 -2389 -2634 M -2395 -2629 L -2395 -2631 -2390 -2628 M -2395 -2629 L -2413 -2557 Q -2473 -2602 -2531 -2571 M -2416 -2539 L -2413 -2557 M -2366 -2521 L -2416 -2539 -2425 -2457 -2425 -2446 -2423 -2413 -2549 -2379 M -2320 -2671 L -2318 -2667 -2314 -2668 M -2279 -2551 Q -2317 -2515 -2366 -2521 L -2374 -2481 -2374 -2457 -2371 -2434 M -2266 -2436 Q -2309 -2407 -2371 -2431 M -2275 -2509 Q -2315 -2454 -2374 -2481 M -2417 -2353 Q -2491 -2394 -2548 -2349";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([51,0,0,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

}

function shape136(ctx,ctrans,frame,ratio,time){
	var pathData="M -3665 -2254 L -3658 -2255 Q -3422 -2318 -3533 -2479 -3626 -2615 -3968 -2822 L -3973 -2831 Q -4100 -2971 -4208 -3106 -4394 -3344 -4514 -3572 -4694 -3914 -4726 -4235 -4694 -3914 -4514 -3572 -4394 -3344 -4208 -3106 -4100 -2971 -3973 -2831 L -3968 -2822 Q -3626 -2615 -3533 -2479 -3422 -2318 -3658 -2255 L -3665 -2254 M -2774 -3307 Q -2779 -3341 -2797 -3368 -3082 -3064 -3226 -2588 L -3221 -2582 -3215 -2575 -3278 -2573 -3305 -2620 Q -3955 -3013 -4330 -3494 L -4369 -3571 -4378 -3589 -4409 -3602 Q -4618 -3902 -4726 -4235 L -4748 -4307 -4759 -4315 Q -4912 -4105 -4804 -3715 L -4841 -3722 -5030 -4069 Q -5107 -3857 -5020 -3586 L -5054 -3608 Q -5168 -3565 -5033 -3418 L -4907 -3329 Q -4856 -3235 -4787 -3133 -4927 -3218 -5096 -3416 -5182 -3094 -4619 -2711 -4901 -2851 -4750 -2612 -4655 -2534 -4565 -2479 -4510 -2446 -4456 -2420 L -4448 -2416 -4457 -2417 Q -4642 -2447 -4346 -2272 L -4325 -2266 Q -4174 -2213 -4063 -2212 L -4024 -2213 -3985 -2219 -3968 -2215 -3958 -2201 -3943 -2203 -3943 -2209 -3943 -2203 -3941 -2194 -3958 -2201 -3974 -2186 Q -4024 -2134 -3988 -2065 L -3977 -2048 -3973 -2039 Q -3938 -1984 -3896 -1952 L -3865 -1934 -3839 -1924 Q -3647 -1891 -3619 -1919 -3575 -1963 -3583 -2039 -3587 -2101 -3625 -2185 -3587 -2101 -3583 -2039 -3397 -2197 -3145 -2230 L -3136 -2234 -3127 -2236 Q -2903 -2249 -2828 -2138 L -2816 -2149 Q -2788 -2177 -2794 -2222 L -2794 -2227 Q -2692 -2200 -2614 -2198 L -2525 -2204 -2369 -2227 -2369 -2287 -2369 -2305 Q -2365 -2360 -2351 -2419 L -2338 -2474 -2356 -2480 Q -2339 -2522 -2345 -2567 -2347 -2588 -2356 -2611 L -2354 -2612 Q -2317 -2701 -2261 -2728 -2195 -2761 -2107 -2704 -1996 -2579 -2048 -2476 L -2050 -2473 -2105 -2503 -2083 -2410 -2083 -2408 -2084 -2410 -2090 -2408 -2099 -2399 -2095 -2357 -2092 -2339 -2084 -2345 Q -2060 -2363 -2039 -2383 -1997 -2428 -1969 -2470 -1865 -2629 -1969 -2759 -2000 -2800 -2053 -2836 L -2056 -2851 Q -2066 -2900 -2086 -2944 L -2101 -2974 Q -1843 -3439 -1931 -3911 -2069 -3850 -2225 -3508 -2168 -3677 -2218 -3811 -2357 -3700 -2498 -3389 -2434 -3560 -2503 -3655 -2606 -3541 -2702 -3365 -2744 -3343 -2774 -3307 -2822 -3251 -2842 -3167 -2822 -3251 -2774 -3307 M -4330 -3494 L -4409 -3602 -4330 -3494 M -4753 -3559 L -4804 -3715 -4753 -3559 -4841 -3722 -4753 -3559 -4738 -3521 -4753 -3559 M -4907 -3329 Q -4979 -3464 -5020 -3586 -4979 -3464 -4907 -3329 M -4753 -3101 L -4787 -3133 -4753 -3101 M -4123 -2344 Q -4282 -2341 -4448 -2416 -4282 -2341 -4123 -2344 M -3943 -2209 L -3968 -2215 -3943 -2209 Q -3769 -2167 -3625 -2185 -3430 -2210 -3290 -2344 -3430 -2210 -3625 -2185 -3769 -2167 -3943 -2209 M -2243 -2261 L -2191 -2282 -2194 -2305 -2194 -2329 -2186 -2369 -2236 -2387 -2245 -2305 -2245 -2294 -2243 -2261 M -2845 -3152 L -2842 -3167 -2845 -3152 -2848 -3145 -2845 -3152 M -2816 -2225 Q -2906 -2252 -2962 -2305 -2993 -2333 -3014 -2371 -3064 -2459 -3055 -2593 L -3043 -2680 -3040 -2695 Q -2992 -3076 -2848 -3145 -2992 -3076 -3040 -2695 L -3043 -2680 -3055 -2593 Q -3064 -2459 -3014 -2371 -2993 -2333 -2962 -2305 -2906 -2252 -2816 -2225 L -2794 -2222 -2816 -2225 M -2279 -3383 L -2225 -3508 -2279 -3383 M -3919 -2072 L -3941 -2194 -3919 -2072 M -2140 -2786 L -2159 -2782 Q -2186 -2782 -2209 -2803 L -2218 -2812 Q -2243 -2845 -2245 -2891 -2246 -2939 -2224 -2972 -2201 -3007 -2168 -3008 -2135 -3010 -2110 -2977 L -2104 -2969 -2090 -2941 Q -2083 -2923 -2083 -2899 -2081 -2866 -2092 -2839 L -2104 -2816 -2110 -2806 Q -2119 -2794 -2131 -2791 -2134 -2788 -2140 -2786 M -2698 -3368 L -2708 -3280 Q -2615 -3370 -2512 -3359 -2452 -3353 -2389 -3314 -2483 -3341 -2510 -3299 -2396 -3295 -2339 -3218 -2416 -3239 -2482 -3218 -2320 -3193 -2218 -3115 -2144 -3058 -2101 -2974 -2144 -3058 -2218 -3115 -2320 -3193 -2482 -3218 -2416 -3239 -2339 -3218 -2396 -3295 -2510 -3299 -2483 -3341 -2389 -3314 -2452 -3353 -2512 -3359 L -2498 -3389 -2512 -3359 Q -2615 -3370 -2708 -3280 L -2698 -3368 -2702 -3365 -2698 -3368 M -2708 -3280 L -2708 -3278 -2711 -3257 -2708 -3278 -2708 -3280 M -2495 -2627 Q -2521 -2612 -2551 -2612 -2605 -2612 -2644 -2660 -2683 -2707 -2683 -2774 -2683 -2842 -2644 -2890 -2605 -2936 -2551 -2936 -2497 -2936 -2458 -2890 -2419 -2842 -2419 -2774 -2419 -2728 -2438 -2690 L -2443 -2683 Q -2444 -2665 -2458 -2651 L -2480 -2636 -2495 -2627 -2480 -2636 -2458 -2651 Q -2444 -2665 -2443 -2683 L -2438 -2690 -2441 -2692 -2443 -2683 -2458 -2660 -2480 -2636 -2498 -2635 -2495 -2627 M -2539 -3190 Q -2512 -3209 -2482 -3218 -2512 -3209 -2539 -3190 M -3079 -2597 Q -3145 -2579 -3215 -2575 -3145 -2579 -3079 -2597 M -3290 -2344 Q -3259 -2416 -3259 -2479 -3257 -2530 -3278 -2573 -3257 -2530 -3259 -2479 -3259 -2416 -3290 -2344 M -2381 -2665 Q -2365 -2638 -2356 -2611 -2365 -2638 -2381 -2665 M -2426 -2387 Q -2375 -2432 -2356 -2480 -2375 -2432 -2426 -2387";
	ctx.fillStyle=tocolor(ctrans.apply([242,26,77,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M -4063 -2212 L -4087 -2164 -4085 -2156 Q -3974 -1984 -3947 -1810 -4036 -1838 -4051 -1772 -3920 -1723 -3907 -1532 L -3905 -1496 -3905 -1478 Q -3898 -1387 -3832 -1417 -3770 -1526 -3838 -1700 -3754 -1673 -3757 -1577 L -3758 -1555 -3763 -1528 Q -3781 -1403 -3704 -1439 -3560 -1694 -3848 -1823 L -3896 -1952 Q -3938 -1984 -3973 -2039 L -3977 -2048 -3988 -2065 Q -4024 -2134 -3974 -2186 L -4024 -2213 -4063 -2212 M -3836 -1720 L -3838 -1700 -3836 -1720 M -3395 -1871 L -3257 -1739 Q -3376 -1768 -3403 -1684 -3139 -1600 -3197 -1436 -3166 -1351 -3116 -1382 -3076 -1460 -3106 -1547 -3052 -1520 -3031 -1414 -2993 -1366 -2968 -1418 -2948 -1609 -3140 -1723 L -3286 -1877 -3289 -1879 -3395 -1871 M -3221 -1705 L -3257 -1739 -3221 -1705 M -3146 -1630 L -3116 -1574 -3106 -1547 -3116 -1574 -3146 -1630";
	ctx.fillStyle=tocolor(ctrans.apply([207,151,0,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M -3583 -2039 Q -3575 -1963 -3619 -1919 -3509 -1876 -3401 -1871 L -3395 -1871 -3289 -1879 Q -3155 -1900 -3020 -1984 -2924 -2045 -2828 -2138 -2903 -2249 -3127 -2236 L -3145 -2230 Q -3397 -2197 -3583 -2039";
	ctx.fillStyle=tocolor(ctrans.apply([255,127,23,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M -2140 -2789 Q -2158 -2789 -2170 -2806 -2182 -2821 -2182 -2840 L -2182 -2842 Q -2182 -2863 -2170 -2879 -2161 -2891 -2149 -2893 L -2140 -2894 Q -2122 -2894 -2110 -2879 -2098 -2863 -2098 -2842 L -2092 -2839 Q -2081 -2866 -2083 -2899 -2083 -2923 -2090 -2941 L -2104 -2969 -2110 -2977 Q -2135 -3010 -2168 -3008 -2201 -3007 -2224 -2972 -2246 -2939 -2245 -2891 -2243 -2845 -2218 -2812 L -2209 -2803 Q -2186 -2782 -2159 -2782 L -2140 -2786 -2140 -2789 M -2438 -2690 Q -2419 -2728 -2419 -2774 -2419 -2842 -2458 -2890 -2497 -2936 -2551 -2936 -2605 -2936 -2644 -2890 -2683 -2842 -2683 -2774 -2683 -2707 -2644 -2660 -2605 -2612 -2551 -2612 -2521 -2612 -2495 -2627 L -2498 -2635 Q -2522 -2635 -2539 -2651 -2555 -2668 -2555 -2692 -2555 -2716 -2539 -2732 -2522 -2749 -2498 -2749 -2474 -2749 -2458 -2732 -2441 -2716 -2441 -2692 L -2438 -2690";
	ctx.fillStyle=tocolor(ctrans.apply([255,255,255,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M -2098 -2842 Q -2098 -2863 -2110 -2879 -2122 -2894 -2140 -2894 L -2149 -2893 Q -2161 -2891 -2170 -2879 -2182 -2863 -2182 -2842 L -2182 -2840 Q -2182 -2821 -2170 -2806 -2158 -2789 -2140 -2789 L -2131 -2791 Q -2116 -2800 -2104 -2816 -2098 -2828 -2098 -2842 M -2441 -2692 Q -2441 -2716 -2458 -2732 -2474 -2749 -2498 -2749 -2522 -2749 -2539 -2732 -2555 -2716 -2555 -2692 -2555 -2668 -2539 -2651 -2522 -2635 -2498 -2635 L -2480 -2636 -2458 -2660 -2443 -2683 -2441 -2692";
	ctx.fillStyle=tocolor(ctrans.apply([0,0,0,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M -2338 -2474 L -2318 -2531 -2306 -2564 -2345 -2567 -2306 -2564 Q -2249 -2557 -2194 -2539 L -2156 -2525 -2140 -2519 -2134 -2516 -2110 -2506 -2105 -2503 -2050 -2473 -2048 -2476 Q -1996 -2579 -2107 -2704 -2195 -2761 -2261 -2728 -2317 -2701 -2354 -2612 L -2356 -2611 Q -2347 -2588 -2345 -2567 -2339 -2522 -2356 -2480 L -2338 -2474 M -2236 -2387 L -2186 -2369 Q -2137 -2363 -2099 -2399 L -2090 -2408 -2087 -2413 -2210 -2476 -2215 -2477 -2233 -2405 -2236 -2387";
	ctx.fillStyle=tocolor(ctrans.apply([255,186,0,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M -2369 -2227 L -2368 -2197 -2366 -2192 Q -2273 -1964 -2237 -2200 L -2237 -2201 -2243 -2261 -2369 -2227 -2243 -2261 -2245 -2294 -2245 -2305 -2236 -2387 -2233 -2405 -2215 -2477 -2215 -2479 -2210 -2476 -2209 -2482 -2144 -2486 -2156 -2525 -2144 -2486 -2138 -2485 Q -2120 -2476 -2105 -2453 L -2086 -2413 -2084 -2410 -2083 -2410 -2105 -2503 -2110 -2506 -2134 -2516 -2138 -2515 -2140 -2519 -2156 -2525 -2194 -2539 Q -2249 -2557 -2306 -2564 L -2318 -2531 -2338 -2474 -2351 -2419 Q -2365 -2360 -2369 -2305 L -2369 -2287 -2369 -2227 M -2191 -2282 L -2191 -2279 -2183 -2254 -2182 -2242 -2179 -2236 Q -2122 -2150 -2086 -2255 L -2083 -2264 -2086 -2284 -2092 -2339 -2095 -2357 -2099 -2399 Q -2137 -2363 -2186 -2369 L -2194 -2329 -2194 -2305 -2191 -2282 M -2318 -2531 Q -2269 -2539 -2203 -2492 L -2209 -2482 -2203 -2492 Q -2269 -2539 -2318 -2531 M -2369 -2287 Q -2351 -2300 -2333 -2305 -2305 -2312 -2275 -2305 L -2245 -2294 -2275 -2305 Q -2305 -2312 -2333 -2305 -2351 -2300 -2369 -2287 M -2237 -2201 Q -2311 -2242 -2368 -2197 -2311 -2242 -2237 -2201 M -2233 -2405 Q -2293 -2450 -2351 -2419 -2293 -2450 -2233 -2405 M -2086 -2284 Q -2129 -2255 -2191 -2279 -2129 -2255 -2086 -2284 M -2194 -2329 Q -2135 -2302 -2095 -2357 -2135 -2302 -2194 -2329";
	ctx.fillStyle=tocolor(ctrans.apply([153,102,51,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M -2144 -2486 L -2209 -2482 -2210 -2476 -2087 -2413 -2086 -2413 -2105 -2453 Q -2120 -2476 -2138 -2485 L -2144 -2486";
	ctx.fillStyle=tocolor(ctrans.apply([153,51,51,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M -4726 -4235 Q -4694 -3914 -4514 -3572 -4394 -3344 -4208 -3106 -4100 -2971 -3973 -2831 L -3968 -2822 Q -3626 -2615 -3533 -2479 -3422 -2318 -3658 -2255 L -3665 -2254 M -2774 -3307 Q -2779 -3341 -2797 -3368 -3082 -3064 -3226 -2588 L -3221 -2582 -3215 -2575 -3278 -2573 -3305 -2620 Q -3955 -3013 -4330 -3494 L -4369 -3571 -4378 -3589 -4409 -3602 Q -4618 -3902 -4726 -4235 L -4748 -4307 -4753 -4324 -4759 -4315 Q -4912 -4105 -4804 -3715 L -4841 -3722 -5030 -4069 Q -5107 -3857 -5020 -3586 L -5054 -3608 Q -5168 -3565 -5033 -3418 L -4907 -3329 Q -4856 -3235 -4787 -3133 -4927 -3218 -5096 -3416 -5182 -3094 -4619 -2711 -4901 -2851 -4750 -2612 -4655 -2534 -4565 -2479 -4510 -2446 -4456 -2420 L -4448 -2416 -4457 -2417 Q -4642 -2447 -4346 -2272 L -4336 -2267 -4325 -2266 Q -4174 -2213 -4063 -2212 L -4087 -2164 -4085 -2156 Q -3974 -1984 -3947 -1810 -4036 -1838 -4051 -1772 L -4054 -1750 M -4409 -3602 L -4330 -3494 M -4787 -3133 L -4753 -3101 M -5020 -3586 Q -4979 -3464 -4907 -3329 M -4841 -3722 L -4753 -3559 -4738 -3521 M -4804 -3715 L -4753 -3559 M -4448 -2416 Q -4282 -2341 -4123 -2344 M -3958 -2201 L -3968 -2215 -3985 -2219 -4024 -2213 -4063 -2212 M -3943 -2209 L -3943 -2203 -3941 -2194 -3958 -2201 -3974 -2186 -4024 -2213 M -3619 -1919 Q -3647 -1891 -3839 -1924 L -3865 -1934 -3896 -1952 Q -3938 -1984 -3973 -2039 L -3977 -2048 -3988 -2065 Q -4024 -2134 -3974 -2186 M -3896 -1952 L -3848 -1823 Q -3560 -1694 -3704 -1439 -3781 -1403 -3763 -1528 L -3758 -1555 -3757 -1577 Q -3754 -1673 -3838 -1700 L -3836 -1720 M -3583 -2039 Q -3575 -1963 -3619 -1919 -3509 -1876 -3401 -1871 L -3395 -1871 -3257 -1739 Q -3376 -1768 -3403 -1684 -3139 -1600 -3197 -1436 -3166 -1351 -3116 -1382 -3076 -1460 -3106 -1547 -3052 -1520 -3031 -1414 -2993 -1366 -2968 -1418 -2948 -1609 -3140 -1723 L -3286 -1877 Q -3091 -1804 -3020 -1984 -2924 -2045 -2828 -2138 -2903 -2249 -3127 -2236 L -3136 -2234 -3145 -2230 Q -3397 -2197 -3583 -2039 -3587 -2101 -3625 -2185 M -2794 -2227 Q -2692 -2200 -2614 -2198 L -2525 -2204 -2369 -2227 M -2243 -2261 L -2191 -2282 M -2092 -2339 L -2084 -2345 Q -2060 -2363 -2039 -2383 -1997 -2428 -1969 -2470 -1865 -2629 -1969 -2759 -2000 -2800 -2053 -2836 L -2056 -2851 Q -2066 -2900 -2086 -2944 L -2101 -2974 Q -1843 -3439 -1931 -3911 -2069 -3850 -2225 -3508 -2168 -3677 -2218 -3811 -2357 -3700 -2498 -3389 -2434 -3560 -2503 -3655 -2606 -3541 -2702 -3365 M -2842 -3167 L -2845 -3152 M -2848 -3145 Q -2992 -3076 -3040 -2695 L -3043 -2680 -3055 -2593 Q -3064 -2459 -3014 -2371 -2993 -2333 -2962 -2305 -2906 -2252 -2816 -2225 M -4051 -1772 Q -3920 -1723 -3907 -1532 L -3905 -1496 -3905 -1478 Q -3898 -1387 -3832 -1417 -3770 -1526 -3838 -1700 M -3941 -2194 L -3919 -2072 M -2225 -3508 L -2279 -3383 M -2101 -2974 Q -2144 -3058 -2218 -3115 -2320 -3193 -2482 -3218 -2416 -3239 -2339 -3218 -2396 -3295 -2510 -3299 -2483 -3341 -2389 -3314 -2452 -3353 -2512 -3359 L -2498 -3389 M -2512 -3359 Q -2615 -3370 -2708 -3280 L -2698 -3368 M -2711 -3257 L -2708 -3278 -2708 -3280 M -2482 -3218 Q -2512 -3209 -2539 -3190 M -3278 -2573 Q -3257 -2530 -3259 -2479 -3259 -2416 -3290 -2344 M -3215 -2575 Q -3145 -2579 -3079 -2597 M -3289 -1879 L -3286 -1877 M -3395 -1871 L -3289 -1879 Q -3155 -1900 -3020 -1984 M -3106 -1547 L -3116 -1574 -3146 -1630 M -3257 -1739 L -3221 -1705";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([51,0,0,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M -3968 -2215 L -3943 -2209 Q -3769 -2167 -3625 -2185 -3430 -2210 -3290 -2344 M -2828 -2138 L -2816 -2149 Q -2788 -2177 -2794 -2222 L -2794 -2227 M -2369 -2227 L -2368 -2197 -2366 -2192 Q -2273 -1964 -2237 -2200 L -2237 -2201 -2243 -2261 -2245 -2294 -2245 -2305 -2236 -2387 -2186 -2369 -2194 -2329 -2194 -2305 -2191 -2282 -2191 -2279 -2183 -2254 -2182 -2242 -2179 -2236 Q -2122 -2150 -2086 -2255 L -2083 -2264 -2086 -2284 -2092 -2339 -2095 -2357 Q -2135 -2302 -2194 -2329 M -2702 -3365 Q -2744 -3343 -2774 -3307 -2822 -3251 -2842 -3167 M -2845 -3152 L -2848 -3145 M -2816 -2225 L -2794 -2222 M -2098 -2842 Q -2098 -2863 -2110 -2879 -2122 -2894 -2140 -2894 L -2149 -2893 Q -2161 -2891 -2170 -2879 -2182 -2863 -2182 -2842 L -2182 -2840 Q -2182 -2821 -2170 -2806 -2158 -2789 -2140 -2789 L -2131 -2791 Q -2119 -2794 -2110 -2806 L -2104 -2816 -2092 -2839 Q -2081 -2866 -2083 -2899 -2083 -2923 -2090 -2941 L -2104 -2969 -2110 -2977 Q -2135 -3010 -2168 -3008 -2201 -3007 -2224 -2972 -2246 -2939 -2245 -2891 -2243 -2845 -2218 -2812 L -2209 -2803 Q -2186 -2782 -2159 -2782 L -2140 -2786 Q -2134 -2788 -2131 -2791 -2116 -2800 -2104 -2816 -2098 -2828 -2098 -2842 M -2698 -3368 L -2702 -3365 M -2438 -2690 Q -2419 -2728 -2419 -2774 -2419 -2842 -2458 -2890 -2497 -2936 -2551 -2936 -2605 -2936 -2644 -2890 -2683 -2842 -2683 -2774 -2683 -2707 -2644 -2660 -2605 -2612 -2551 -2612 -2521 -2612 -2495 -2627 L -2480 -2636 -2458 -2651 Q -2444 -2665 -2443 -2683 L -2438 -2690 M -2441 -2692 Q -2441 -2716 -2458 -2732 -2474 -2749 -2498 -2749 -2522 -2749 -2539 -2732 -2555 -2716 -2555 -2692 -2555 -2668 -2539 -2651 -2522 -2635 -2498 -2635 L -2480 -2636 -2458 -2660 -2443 -2683 -2441 -2692 M -2306 -2564 L -2318 -2531 -2338 -2474 -2351 -2419 Q -2365 -2360 -2369 -2305 L -2369 -2287 -2369 -2227 -2243 -2261 M -2356 -2480 Q -2339 -2522 -2345 -2567 L -2306 -2564 Q -2249 -2557 -2194 -2539 L -2156 -2525 -2144 -2486 -2209 -2482 -2203 -2492 Q -2269 -2539 -2318 -2531 M -2356 -2611 Q -2365 -2638 -2381 -2665 M -2345 -2567 Q -2347 -2588 -2356 -2611 L -2354 -2612 Q -2317 -2701 -2261 -2728 -2195 -2761 -2107 -2704 -1996 -2579 -2048 -2476 L -2050 -2473 -2105 -2503 -2110 -2506 -2134 -2516 -2140 -2519 -2156 -2525 M -2356 -2480 Q -2375 -2432 -2426 -2387 M -2245 -2294 L -2275 -2305 Q -2305 -2312 -2333 -2305 -2351 -2300 -2369 -2287 M -2140 -2519 L -2138 -2515 -2134 -2516 M -2210 -2476 L -2209 -2482 M -2215 -2477 L -2215 -2479 -2210 -2476 -2087 -2413 -2084 -2410 -2090 -2408 -2099 -2399 Q -2137 -2363 -2186 -2369 M -2236 -2387 L -2233 -2405 -2215 -2477 M -2144 -2486 L -2138 -2485 Q -2120 -2476 -2105 -2453 L -2086 -2413 -2084 -2410 -2083 -2410 -2105 -2503 M -2083 -2410 L -2083 -2408 -2084 -2410 -2083 -2410 M -2099 -2399 L -2095 -2357 M -2191 -2279 Q -2129 -2255 -2086 -2284 M -2351 -2419 Q -2293 -2450 -2233 -2405 M -2368 -2197 Q -2311 -2242 -2237 -2201";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([51,0,0,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

}

function shape137(ctx,ctrans,frame,ratio,time){
	var pathData="M -4428 -3274 Q -4545 -3526 -4339 -3337 L -4299 -3298 Q -4420 -3691 -4152 -3334 -4264 -3639 -4029 -3360 -4264 -3639 -4152 -3334 -4420 -3691 -4299 -3298 L -4339 -3337 Q -4545 -3526 -4428 -3274 L -4423 -3267 -4339 -3187 Q -4165 -3021 -4015 -2842 L -4015 -2835 Q -4032 -2709 -3993 -2611 L -3972 -2568 -3994 -2520 Q -4014 -2478 -4041 -2439 -4191 -2214 -4500 -2101 L -4495 -2092 Q -4474 -2010 -4338 -2016 L -4276 -2023 -4165 -2047 -4276 -2023 -4338 -2016 Q -4495 -1924 -4746 -1900 -4735 -1800 -4483 -1786 L -4428 -1800 -4483 -1786 Q -4639 -1686 -4924 -1696 -4828 -1542 -4492 -1551 L -4465 -1552 -4492 -1551 Q -4663 -1419 -4984 -1410 -4824 -1230 -4435 -1320 L -4761 -1180 -4764 -1176 Q -4837 -1095 -4506 -1087 -3585 -1248 -3274 -1950 L -3235 -2047 -3234 -2050 -3207 -2130 -3196 -2166 -3187 -2202 -3196 -2166 -3207 -2130 -3111 -2029 Q -2919 -1915 -2938 -1725 L -2941 -1719 -2925 -1713 -2941 -1843 Q -2839 -1593 -2664 -1558 L -2746 -1807 -2758 -1821 -2767 -1833 -2758 -1821 -2746 -1807 Q -2416 -1414 -2187 -1476 L -2403 -1672 Q -1894 -1432 -1762 -1563 L -1833 -1605 Q -2356 -2040 -2541 -2506 L -2496 -2511 -2340 -2533 -2340 -2593 -2340 -2611 Q -2335 -2667 -2322 -2725 L -2308 -2781 -2326 -2787 Q -2310 -2829 -2316 -2874 -2317 -2895 -2326 -2917 -2241 -3115 -2077 -3010 -1966 -2886 -2019 -2782 L -2020 -2779 Q -2047 -2796 -2076 -2809 L -2053 -2716 -2053 -2715 -2055 -2716 -2061 -2715 -2070 -2706 -2065 -2664 -2062 -2646 -2055 -2652 -2010 -2689 Q -1968 -2734 -1939 -2776 -1836 -2935 -1939 -3066 -1971 -3106 -2023 -3142 L -2026 -3157 Q -2037 -3207 -2056 -3250 -2101 -3355 -2188 -3421 -2290 -3499 -2452 -3525 -2482 -3516 -2509 -3496 -2482 -3516 -2452 -3525 -2386 -3546 -2310 -3525 -2367 -3601 -2481 -3606 -2454 -3648 -2359 -3621 -2533 -3729 -2679 -3586 L -2668 -3675 Q -2781 -3613 -2812 -3474 L -2815 -3459 -2818 -3451 Q -2962 -3382 -3010 -3001 L -3013 -2986 -3025 -2899 -3049 -2904 Q -3336 -2826 -3738 -3001 -3892 -3169 -4029 -3360 -4200 -3601 -4339 -3877 L -4348 -3895 Q -4512 -3978 -4501 -3754 L -4399 -3643 -4501 -3754 -4692 -3963 Q -4782 -4053 -4854 -4018 -4930 -3946 -4785 -3759 L -5025 -3915 Q -5139 -3871 -5004 -3724 -4692 -3511 -4429 -3271 L -4428 -3274 M -4417 -3520 L -4785 -3759 -4417 -3520 M -2787 -2532 Q -2877 -2559 -2932 -2611 -2974 -2650 -2998 -2703 -3033 -2785 -3025 -2899 -3033 -2785 -2998 -2703 -2974 -2650 -2932 -2611 -2877 -2559 -2787 -2532 L -2764 -2529 Q -2758 -2484 -2787 -2455 L -2799 -2445 -2787 -2455 Q -2758 -2484 -2764 -2529 L -2787 -2532 M -3097 -2542 Q -2874 -2556 -2799 -2445 -2895 -2352 -2991 -2290 -3088 -2230 -3187 -2202 -3145 -2358 -3129 -2535 L -3115 -2536 Q -3111 -2539 -3106 -2541 L -3097 -2542 M -4009 -2874 L -4015 -2842 -4009 -2874 M -4353 -1342 L -4435 -1320 -4353 -1342 M -3934 -2677 Q -3949 -2622 -3972 -2568 -3949 -2622 -3934 -2677 M -2110 -3093 L -2130 -3088 Q -2163 -3088 -2188 -3118 -2214 -3151 -2215 -3198 -2217 -3246 -2194 -3279 -2172 -3313 -2139 -3315 -2106 -3316 -2080 -3283 -2067 -3268 -2061 -3247 -2053 -3229 -2053 -3205 -2052 -3172 -2062 -3145 L -2074 -3123 -2080 -3112 Q -2089 -3100 -2101 -3097 -2104 -3094 -2110 -3093 M -2352 -2971 Q -2335 -2944 -2326 -2917 -2335 -2944 -2352 -2971 M -2161 -2589 L -2164 -2611 -2164 -2635 -2157 -2676 Q -2181 -2680 -2206 -2694 L -2215 -2611 -2215 -2601 -2214 -2568 -2161 -2589 M -2682 -3564 L -2679 -3585 -2679 -3586 -2679 -3585 -2682 -3564 M -2466 -2934 Q -2491 -2919 -2521 -2919 -2575 -2919 -2614 -2967 -2653 -3013 -2653 -3081 -2653 -3148 -2614 -3196 -2575 -3243 -2521 -3243 -2467 -3243 -2428 -3196 -2389 -3148 -2389 -3081 -2389 -3034 -2409 -2997 L -2413 -2989 Q -2415 -2971 -2428 -2958 L -2451 -2943 -2466 -2934 M -2764 -2533 L -2721 -2523 -2584 -2505 -2541 -2506 -2584 -2505 -2721 -2523 -2764 -2533 -2764 -2529 -2764 -2533 M -2397 -2694 Q -2346 -2739 -2326 -2787 -2346 -2739 -2397 -2694 M -2959 -1888 L -2941 -1843 -2959 -1888 M -3018 -1780 Q -3037 -1833 -3072 -1852 L -3018 -1780 M -3196 -2166 Q -3049 -2140 -2991 -2290 -3049 -2140 -3196 -2166 M -2415 -1683 L -2403 -1672 -2415 -1683 M -2721 -2523 Q -2454 -1992 -1833 -1605 -2454 -1992 -2721 -2523";
	ctx.fillStyle=tocolor(ctrans.apply([242,26,77,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M -3207 -2130 L -3234 -2050 -3228 -2046 -3235 -2047 -3274 -1950 Q -3121 -1870 -3168 -1743 -3136 -1657 -3087 -1689 -3046 -1767 -3076 -1854 L -3072 -1852 Q -3037 -1833 -3018 -1780 -3007 -1755 -3001 -1720 L -2941 -1719 -2938 -1725 Q -2919 -1915 -3111 -2029 L -3207 -2130 M -4041 -2439 Q -4014 -2478 -3994 -2520 L -4024 -2536 -4057 -2470 -4056 -2463 -4041 -2439 M -3117 -1936 Q -3097 -1908 -3087 -1881 L -3081 -1866 -3076 -1854 -3081 -1866 -3087 -1881 Q -3097 -1908 -3117 -1936 M -3192 -2011 L -3228 -2046 -3192 -2011";
	ctx.fillStyle=tocolor(ctrans.apply([207,151,0,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M -2062 -3145 Q -2052 -3172 -2053 -3205 -2053 -3229 -2061 -3247 -2067 -3268 -2080 -3283 -2106 -3316 -2139 -3315 -2172 -3313 -2194 -3279 -2217 -3246 -2215 -3198 -2214 -3151 -2188 -3118 -2163 -3088 -2130 -3088 L -2110 -3093 -2110 -3096 Q -2128 -3096 -2140 -3112 -2152 -3127 -2152 -3148 -2152 -3169 -2140 -3186 -2128 -3201 -2110 -3201 -2092 -3201 -2080 -3186 -2068 -3169 -2068 -3148 L -2062 -3145 M -2469 -2941 Q -2493 -2941 -2509 -2958 -2526 -2974 -2526 -2998 -2526 -3022 -2509 -3039 -2493 -3055 -2469 -3055 -2445 -3055 -2428 -3039 -2412 -3022 -2412 -2998 L -2409 -2997 Q -2389 -3034 -2389 -3081 -2389 -3148 -2428 -3196 -2467 -3243 -2521 -3243 -2575 -3243 -2614 -3196 -2653 -3148 -2653 -3081 -2653 -3013 -2614 -2967 -2575 -2919 -2521 -2919 -2491 -2919 -2466 -2934 L -2469 -2941";
	ctx.fillStyle=tocolor(ctrans.apply([255,255,255,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M -2068 -3148 Q -2068 -3169 -2080 -3186 -2092 -3201 -2110 -3201 -2128 -3201 -2140 -3186 -2152 -3169 -2152 -3148 -2152 -3127 -2140 -3112 -2128 -3096 -2110 -3096 L -2101 -3097 Q -2086 -3106 -2074 -3123 -2068 -3135 -2068 -3148 M -2412 -2998 Q -2412 -3022 -2428 -3039 -2445 -3055 -2469 -3055 -2493 -3055 -2509 -3039 -2526 -3022 -2526 -2998 -2526 -2974 -2509 -2958 -2493 -2941 -2469 -2941 L -2451 -2943 -2428 -2967 -2413 -2989 -2412 -2998";
	ctx.fillStyle=tocolor(ctrans.apply([0,0,0,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M -2070 -2706 L -2061 -2715 -2058 -2719 -2181 -2782 -2185 -2784 -2203 -2712 -2206 -2694 Q -2181 -2680 -2157 -2676 -2107 -2670 -2070 -2706 M -2076 -2809 Q -2047 -2796 -2020 -2779 L -2019 -2782 Q -1966 -2886 -2077 -3010 -2241 -3115 -2326 -2917 -2317 -2895 -2316 -2874 L -2277 -2871 -2316 -2874 Q -2310 -2829 -2326 -2787 L -2308 -2781 -2289 -2838 -2277 -2871 -2164 -2845 -2127 -2832 -2110 -2826 -2104 -2823 -2080 -2812 -2076 -2809";
	ctx.fillStyle=tocolor(ctrans.apply([255,186,0,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M -2062 -2646 L -2065 -2664 -2070 -2706 Q -2107 -2670 -2157 -2676 L -2164 -2635 -2164 -2611 -2161 -2589 -2161 -2586 -2056 -2590 -2161 -2586 -2154 -2560 -2152 -2548 -2149 -2542 Q -2092 -2457 -2056 -2562 L -2053 -2571 -2056 -2590 -2062 -2646 M -2053 -2716 L -2076 -2809 -2080 -2812 -2104 -2823 -2109 -2821 -2110 -2826 -2127 -2832 -2164 -2845 -2277 -2871 -2289 -2838 -2308 -2781 -2322 -2725 Q -2263 -2757 -2203 -2712 -2263 -2757 -2322 -2725 -2335 -2667 -2340 -2611 L -2340 -2593 Q -2322 -2607 -2304 -2611 -2275 -2619 -2245 -2611 L -2215 -2601 -2245 -2611 Q -2275 -2619 -2304 -2611 -2322 -2607 -2340 -2593 L -2340 -2533 -2338 -2503 -2337 -2499 Q -2244 -2271 -2208 -2506 L -2208 -2508 Q -2281 -2548 -2338 -2503 -2281 -2548 -2208 -2508 L -2214 -2568 -2340 -2533 -2214 -2568 -2215 -2601 -2215 -2611 -2206 -2694 -2203 -2712 -2185 -2784 -2185 -2785 -2181 -2782 -2179 -2788 Q -2142 -2805 -2115 -2793 L -2109 -2791 Q -2091 -2782 -2076 -2760 L -2056 -2719 -2055 -2716 -2053 -2716 M -2127 -2832 L -2115 -2793 -2127 -2832 M -2179 -2788 L -2173 -2799 Q -2239 -2845 -2289 -2838 -2239 -2845 -2173 -2799 L -2179 -2788 M -2065 -2664 Q -2106 -2608 -2164 -2635 -2106 -2608 -2065 -2664";
	ctx.fillStyle=tocolor(ctrans.apply([153,102,51,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M -2056 -2719 L -2076 -2760 Q -2091 -2782 -2109 -2791 L -2115 -2793 Q -2142 -2805 -2179 -2788 L -2181 -2782 -2058 -2719 -2056 -2719";
	ctx.fillStyle=tocolor(ctrans.apply([153,51,51,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M -2799 -2445 Q -2874 -2556 -3097 -2542 L -3115 -2536 -3129 -2535 Q -3145 -2358 -3187 -2202 -3088 -2230 -2991 -2290 -2895 -2352 -2799 -2445";
	ctx.fillStyle=tocolor(ctrans.apply([255,127,23,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M -4029 -3360 Q -4264 -3639 -4152 -3334 -4420 -3691 -4299 -3298 L -4339 -3337 Q -4545 -3526 -4428 -3274 L -4423 -3267 -4429 -3271 Q -4692 -3511 -5004 -3724 -5139 -3871 -5025 -3915 L -4785 -3759 -4417 -3520 M -4399 -3643 L -4501 -3754 Q -4512 -3978 -4348 -3895 L -4339 -3877 Q -4200 -3601 -4029 -3360 -3892 -3169 -3738 -3001 -3336 -2826 -3049 -2904 M -3025 -2899 Q -3033 -2785 -2998 -2703 -2974 -2650 -2932 -2611 -2877 -2559 -2787 -2532 M -2799 -2445 Q -2874 -2556 -3097 -2542 L -3106 -2541 Q -3111 -2539 -3115 -2536 L -3129 -2535 Q -3145 -2358 -3187 -2202 L -3196 -2166 -3207 -2130 -3234 -2050 -3235 -2047 -3274 -1950 Q -3585 -1248 -4506 -1087 -4837 -1095 -4764 -1176 L -4761 -1180 -4435 -1320 -4353 -1342 M -4015 -2842 L -4009 -2874 M -3972 -2568 L -3993 -2611 Q -4032 -2709 -4015 -2835 L -4015 -2842 Q -4165 -3021 -4339 -3187 L -4423 -3267 M -4501 -3754 L -4692 -3963 Q -4782 -4053 -4854 -4018 -4930 -3946 -4785 -3759 M -4500 -2101 Q -4191 -2214 -4041 -2439 -4014 -2478 -3994 -2520 L -3972 -2568 Q -3949 -2622 -3934 -2677 M -4338 -2016 L -4276 -2023 -4165 -2047 M -4041 -2439 L -4056 -2463 -4057 -2470 -4024 -2536 -3994 -2520 M -4338 -2016 Q -4474 -2010 -4495 -2092 M -4428 -1800 L -4483 -1786 Q -4735 -1800 -4746 -1900 -4495 -1924 -4338 -2016 M -4492 -1551 L -4465 -1552 M -4492 -1551 Q -4828 -1542 -4924 -1696 -4639 -1686 -4483 -1786 M -4435 -1320 Q -4824 -1230 -4984 -1410 -4663 -1419 -4492 -1551 M -2452 -3525 Q -2290 -3499 -2188 -3421 -2101 -3355 -2056 -3250 -2037 -3207 -2026 -3157 L -2023 -3142 Q -1971 -3106 -1939 -3066 -1836 -2935 -1939 -2776 -1968 -2734 -2010 -2689 L -2055 -2652 -2062 -2646 M -3025 -2899 L -3013 -2986 -3010 -3001 Q -2962 -3382 -2818 -3451 L -2815 -3459 -2812 -3474 Q -2781 -3613 -2668 -3675 L -2679 -3586 -2679 -3585 -2682 -3564 M -2452 -3525 Q -2482 -3516 -2509 -3496 M -2679 -3586 Q -2533 -3729 -2359 -3621 -2454 -3648 -2481 -3606 -2367 -3601 -2310 -3525 -2386 -3546 -2452 -3525 M -2340 -2533 L -2496 -2511 -2541 -2506 -2584 -2505 -2721 -2523 -2764 -2533 M -3076 -1854 L -3081 -1866 -3087 -1881 Q -3097 -1908 -3117 -1936 M -3072 -1852 L -3076 -1854 Q -3046 -1767 -3087 -1689 -3136 -1657 -3168 -1743 -3121 -1870 -3274 -1950 M -2941 -1843 L -2959 -1888 M -3234 -2050 L -3228 -2046 -3235 -2047 M -3228 -2046 L -3192 -2011 M -3207 -2130 L -3111 -2029 Q -2919 -1915 -2938 -1725 L -2941 -1719 -3001 -1720 Q -3007 -1755 -3018 -1780 -3037 -1833 -3072 -1852 L -3018 -1780 M -2991 -2290 Q -3049 -2140 -3196 -2166 M -3187 -2202 Q -3088 -2230 -2991 -2290 -2895 -2352 -2799 -2445 M -2214 -2568 L -2161 -2589 M -2746 -1807 L -2758 -1821 -2767 -1833 M -2403 -1672 L -2415 -1683 M -2746 -1807 L -2664 -1558 Q -2839 -1593 -2941 -1843 L -2925 -1713 -2941 -1719 M -1833 -1605 L -1762 -1563 Q -1894 -1432 -2403 -1672 L -2187 -1476 Q -2416 -1414 -2746 -1807 M -2541 -2506 Q -2356 -2040 -1833 -1605 -2454 -1992 -2721 -2523";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([51,0,0,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M -2787 -2532 L -2764 -2529 Q -2758 -2484 -2787 -2455 L -2799 -2445 M -2110 -3093 L -2130 -3088 Q -2163 -3088 -2188 -3118 -2214 -3151 -2215 -3198 -2217 -3246 -2194 -3279 -2172 -3313 -2139 -3315 -2106 -3316 -2080 -3283 -2067 -3268 -2061 -3247 -2053 -3229 -2053 -3205 -2052 -3172 -2062 -3145 L -2074 -3123 Q -2086 -3106 -2101 -3097 L -2110 -3096 Q -2128 -3096 -2140 -3112 -2152 -3127 -2152 -3148 -2152 -3169 -2140 -3186 -2128 -3201 -2110 -3201 -2092 -3201 -2080 -3186 -2068 -3169 -2068 -3148 -2068 -3135 -2074 -3123 L -2080 -3112 Q -2089 -3100 -2101 -3097 -2104 -3094 -2110 -3093 M -2062 -2646 L -2065 -2664 -2070 -2706 -2061 -2715 -2055 -2716 -2053 -2715 -2053 -2716 -2076 -2809 Q -2047 -2796 -2020 -2779 L -2019 -2782 Q -1966 -2886 -2077 -3010 -2241 -3115 -2326 -2917 -2335 -2944 -2352 -2971 M -2110 -2826 L -2104 -2823 -2109 -2821 -2110 -2826 -2127 -2832 -2164 -2845 -2277 -2871 -2316 -2874 Q -2317 -2895 -2326 -2917 M -2104 -2823 L -2080 -2812 -2076 -2809 M -2056 -2719 L -2076 -2760 Q -2091 -2782 -2109 -2791 L -2115 -2793 -2127 -2832 M -2185 -2784 L -2185 -2785 -2181 -2782 -2179 -2788 Q -2142 -2805 -2115 -2793 M -2289 -2838 Q -2239 -2845 -2173 -2799 L -2179 -2788 M -2058 -2719 L -2055 -2716 -2053 -2716 -2055 -2716 -2056 -2719 M -2058 -2719 L -2181 -2782 M -2062 -2646 L -2056 -2590 -2161 -2586 -2161 -2589 -2164 -2611 -2164 -2635 Q -2106 -2608 -2065 -2664 M -2164 -2635 L -2157 -2676 Q -2107 -2670 -2070 -2706 M -2185 -2784 L -2203 -2712 Q -2263 -2757 -2322 -2725 L -2308 -2781 -2289 -2838 -2277 -2871 M -2412 -2998 Q -2412 -3022 -2428 -3039 -2445 -3055 -2469 -3055 -2493 -3055 -2509 -3039 -2526 -3022 -2526 -2998 -2526 -2974 -2509 -2958 -2493 -2941 -2469 -2941 L -2451 -2943 -2428 -2958 Q -2415 -2971 -2413 -2989 L -2409 -2997 Q -2389 -3034 -2389 -3081 -2389 -3148 -2428 -3196 -2467 -3243 -2521 -3243 -2575 -3243 -2614 -3196 -2653 -3148 -2653 -3081 -2653 -3013 -2614 -2967 -2575 -2919 -2521 -2919 -2491 -2919 -2466 -2934 L -2451 -2943 -2428 -2967 -2413 -2989 -2412 -2998 M -2326 -2787 Q -2310 -2829 -2316 -2874 M -2214 -2568 L -2215 -2601 -2215 -2611 -2206 -2694 Q -2181 -2680 -2157 -2676 M -2340 -2593 L -2340 -2611 Q -2335 -2667 -2322 -2725 M -2215 -2601 L -2245 -2611 Q -2275 -2619 -2304 -2611 -2322 -2607 -2340 -2593 L -2340 -2533 -2214 -2568 -2208 -2508 -2208 -2506 Q -2244 -2271 -2337 -2499 L -2338 -2503 Q -2281 -2548 -2208 -2508 M -2764 -2533 L -2764 -2529 M -2326 -2787 Q -2346 -2739 -2397 -2694 M -2203 -2712 L -2206 -2694 M -2338 -2503 L -2340 -2533 M -2056 -2590 L -2053 -2571 -2056 -2562 Q -2092 -2457 -2149 -2542 L -2152 -2548 -2154 -2560 -2161 -2586";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([51,0,0,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

}

function shape138(ctx,ctrans,frame,ratio,time){
	var pathData="M -4650 -3473 Q -4767 -3725 -4561 -3536 L -4521 -3497 Q -4642 -3890 -4374 -3533 -4486 -3837 -4251 -3558 -4486 -3837 -4374 -3533 -4642 -3890 -4521 -3497 L -4561 -3536 Q -4767 -3725 -4650 -3473 L -4645 -3465 -4561 -3386 Q -4396 -3228 -4252 -3059 L -4372 -3027 Q -4398 -2954 -4254 -2918 -4690 -2885 -4903 -2519 -4819 -2456 -4638 -2528 -4843 -2349 -4960 -2153 -4914 -2016 -4648 -2232 -4794 -1980 -4831 -1662 -4651 -1664 -4572 -1863 -4614 -1644 -4603 -1371 -4572 -1212 -4497 -1203 L -4495 -1203 Q -4362 -1682 -4101 -2043 L -4014 -2157 -3990 -2184 -3925 -2258 -3772 -2409 Q -3562 -2598 -3301 -2741 -3093 -2750 -3021 -2643 -3114 -2553 -3208 -2492 -3003 -2339 -2850 -2172 -2821 -2256 -2946 -2411 L -2934 -2420 Q -2733 -2181 -2592 -2058 L -2521 -2000 Q -2511 -2028 -2509 -2058 -2497 -2177 -2592 -2330 -2478 -2163 -2370 -2058 -2253 -1944 -2145 -1901 -2154 -1979 -2185 -2058 -2250 -2222 -2406 -2400 -2202 -2180 -2050 -2058 -1936 -1967 -1852 -1932 L -1894 -2058 Q -1936 -2175 -1984 -2280 L -1987 -2288 Q -2113 -2564 -2281 -2753 -2316 -2658 -2371 -2741 L -2374 -2747 -2376 -2759 -2383 -2784 -2383 -2787 -2436 -2766 -2383 -2787 -2386 -2810 -2386 -2834 -2383 -2856 -2379 -2874 -2419 -2888 -2428 -2892 -2437 -2810 -2437 -2799 -2436 -2766 -2433 -2726 -2430 -2706 -2430 -2705 Q -2466 -2469 -2559 -2697 L -2560 -2702 -2562 -2732 -2562 -2792 -2562 -2810 -2562 -2813 -2544 -2924 -2532 -2973 -2530 -2979 -2548 -2985 Q -2532 -3027 -2538 -3072 -2539 -3093 -2548 -3116 -2463 -3314 -2299 -3209 -2188 -3084 -2241 -2981 L -2242 -2978 -2298 -3008 -2275 -2915 -2275 -2913 -2277 -2915 -2283 -2913 -2292 -2904 -2287 -2862 -2284 -2844 -2277 -2850 -2232 -2888 Q -2190 -2933 -2161 -2975 -2058 -3134 -2161 -3264 -2193 -3305 -2245 -3341 L -2248 -3356 Q -2259 -3405 -2278 -3449 -2323 -3554 -2410 -3620 -2512 -3698 -2674 -3723 -2608 -3744 -2532 -3723 -2589 -3800 -2703 -3804 -2676 -3846 -2581 -3819 -2755 -3927 -2901 -3785 L -2890 -3873 Q -3003 -3812 -3034 -3672 L -3037 -3657 -3040 -3650 Q -3184 -3581 -3232 -3200 L -3235 -3185 Q -3235 -3177 -3238 -3170 L -3268 -3168 -3273 -3168 -3330 -3089 Q -3597 -3042 -3960 -3200 -4114 -3368 -4251 -3558 -4422 -3800 -4561 -4076 L -4570 -4094 Q -4734 -4176 -4723 -3953 L -4621 -3842 -4723 -3953 -4914 -4161 Q -5004 -4251 -5076 -4217 -5152 -4145 -5007 -3957 L -5247 -4113 Q -5361 -4070 -5226 -3923 -4914 -3710 -4651 -3470 L -4650 -3473 M -4639 -3719 L -5007 -3957 -4639 -3719 M -3271 -3102 L -3330 -3089 -3271 -3102 M -4231 -3072 L -4233 -3062 -4252 -3059 -4233 -3062 -4231 -3072 M -4648 -2232 Q -4608 -2301 -4560 -2364 -4608 -2301 -4648 -2232 M -4581 -2553 L -4633 -2529 -4638 -2528 -4633 -2529 -4581 -2553 M -4459 -2202 Q -4534 -2052 -4572 -1863 -4534 -2052 -4459 -2202 M -2332 -3291 L -2352 -3287 Q -2385 -3287 -2410 -3317 -2436 -3350 -2437 -3396 -2439 -3444 -2416 -3477 -2394 -3512 -2361 -3513 -2328 -3515 -2302 -3482 -2289 -3467 -2283 -3446 -2275 -3428 -2275 -3404 -2274 -3371 -2284 -3344 L -2296 -3321 -2302 -3311 Q -2311 -3299 -2323 -3296 -2326 -3293 -2332 -3291 M -2731 -3695 Q -2704 -3714 -2674 -3723 -2704 -3714 -2731 -3695 M -2904 -3762 L -2901 -3783 -2901 -3785 -2901 -3783 -2904 -3762 M -2673 -3141 L -2688 -3132 Q -2713 -3117 -2743 -3117 -2797 -3117 -2836 -3165 -2875 -3212 -2875 -3279 -2875 -3347 -2836 -3395 -2797 -3441 -2743 -3441 -2689 -3441 -2650 -3395 -2611 -3347 -2611 -3279 -2611 -3233 -2631 -3195 L -2635 -3188 Q -2637 -3170 -2650 -3156 -2661 -3146 -2673 -3141 M -2574 -3170 Q -2557 -3143 -2548 -3116 -2557 -3143 -2574 -3170 M -2619 -2892 Q -2569 -2936 -2550 -2984 L -2548 -2985 -2550 -2984 Q -2569 -2936 -2619 -2892 M -2986 -2732 Q -2884 -2705 -2806 -2703 L -2718 -2709 Q -2634 -2717 -2562 -2732 -2634 -2717 -2718 -2709 L -2806 -2703 Q -2884 -2705 -2986 -2732 L -2986 -2727 -3009 -2730 -2986 -2727 -2986 -2732 M -3238 -3170 L -3247 -3098 -3249 -3048 Q -3246 -2895 -3154 -2810 -3099 -2757 -3009 -2730 -3099 -2757 -3154 -2810 -3246 -2895 -3249 -3048 L -3247 -3098 -3238 -3170 M -1987 -2288 Q -2199 -2553 -2433 -2726 -2199 -2553 -1987 -2288 M -3255 -2766 Q -3277 -2754 -3301 -2741 -3277 -2754 -3255 -2766 M -3021 -2643 L -3009 -2654 Q -2980 -2682 -2986 -2727 -2980 -2682 -3009 -2654 L -3021 -2643 M -2601 -2343 L -2592 -2330 -2601 -2343";
	ctx.fillStyle=tocolor(ctrans.apply([242,26,77,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M -3772 -2409 Q -3682 -2379 -3594 -2376 L -3588 -2376 -3481 -2384 Q -3348 -2405 -3213 -2489 L -3208 -2492 Q -3114 -2553 -3021 -2643 -3093 -2750 -3301 -2741 -3562 -2598 -3772 -2409";
	ctx.fillStyle=tocolor(ctrans.apply([255,127,23,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M -4101 -2043 L -4099 -2037 -4098 -2001 -4098 -1983 Q -4090 -1892 -4024 -1922 -3970 -2016 -4014 -2157 L -4101 -2043 M -3990 -2184 Q -3948 -2151 -3949 -2082 L -3951 -2060 -3955 -2033 Q -3973 -1908 -3897 -1944 -3789 -2138 -3925 -2258 L -3990 -2184 M -3588 -2376 L -3450 -2244 Q -3568 -2273 -3595 -2189 -3331 -2105 -3390 -1941 -3358 -1856 -3309 -1887 -3268 -1965 -3298 -2052 -3244 -2025 -3223 -1919 -3186 -1871 -3160 -1923 -3141 -2114 -3333 -2228 L -3478 -2382 -3481 -2384 -3588 -2376 M -3414 -2210 L -3450 -2244 -3414 -2210 M -3298 -2052 L -3309 -2079 Q -3319 -2106 -3339 -2135 -3319 -2106 -3309 -2079 L -3298 -2052";
	ctx.fillStyle=tocolor(ctrans.apply([207,151,0,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M -2332 -3294 Q -2350 -3294 -2362 -3311 -2374 -3326 -2374 -3347 -2374 -3368 -2362 -3384 -2350 -3399 -2332 -3399 -2314 -3399 -2302 -3384 -2290 -3368 -2290 -3347 L -2284 -3344 Q -2274 -3371 -2275 -3404 -2275 -3428 -2283 -3446 -2289 -3467 -2302 -3482 -2328 -3515 -2361 -3513 -2394 -3512 -2416 -3477 -2439 -3444 -2437 -3396 -2436 -3350 -2410 -3317 -2385 -3287 -2352 -3287 L -2332 -3291 -2332 -3294 M -2688 -3132 L -2691 -3140 Q -2715 -3140 -2731 -3156 -2748 -3173 -2748 -3197 -2748 -3221 -2731 -3237 -2715 -3254 -2691 -3254 -2667 -3254 -2650 -3237 -2634 -3221 -2634 -3197 L -2631 -3195 Q -2611 -3233 -2611 -3279 -2611 -3347 -2650 -3395 -2689 -3441 -2743 -3441 -2797 -3441 -2836 -3395 -2875 -3347 -2875 -3279 -2875 -3212 -2836 -3165 -2797 -3117 -2743 -3117 -2713 -3117 -2688 -3132";
	ctx.fillStyle=tocolor(ctrans.apply([255,255,255,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M -2290 -3347 Q -2290 -3368 -2302 -3384 -2314 -3399 -2332 -3399 -2350 -3399 -2362 -3384 -2374 -3368 -2374 -3347 -2374 -3326 -2362 -3311 -2350 -3294 -2332 -3294 L -2323 -3296 Q -2308 -3305 -2296 -3321 -2290 -3333 -2290 -3347 M -2691 -3140 L -2673 -3141 -2650 -3165 -2635 -3188 -2634 -3197 Q -2634 -3221 -2650 -3237 -2667 -3254 -2691 -3254 -2715 -3254 -2731 -3237 -2748 -3221 -2748 -3197 -2748 -3173 -2731 -3156 -2715 -3140 -2691 -3140";
	ctx.fillStyle=tocolor(ctrans.apply([0,0,0,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M -2326 -3021 L -2302 -3011 -2298 -3008 -2242 -2978 -2241 -2981 Q -2188 -3084 -2299 -3209 -2463 -3314 -2548 -3116 -2539 -3093 -2538 -3072 L -2499 -3069 -2538 -3072 Q -2532 -3027 -2548 -2985 L -2530 -2979 -2511 -3036 -2499 -3069 Q -2442 -3062 -2386 -3044 L -2349 -3030 -2332 -3024 -2326 -3021 M -2283 -2913 L -2280 -2918 -2403 -2981 -2407 -2982 -2425 -2910 -2428 -2895 -2428 -2892 -2419 -2888 -2379 -2874 Q -2329 -2868 -2292 -2904 L -2283 -2913";
	ctx.fillStyle=tocolor(ctrans.apply([255,186,0,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M -2281 -2753 L -2278 -2760 -2275 -2769 -2278 -2789 -2284 -2844 -2287 -2862 -2292 -2904 Q -2329 -2868 -2379 -2874 L -2383 -2856 -2386 -2834 Q -2367 -2825 -2350 -2825 -2314 -2826 -2287 -2862 -2314 -2826 -2350 -2825 -2367 -2825 -2386 -2834 L -2386 -2810 -2383 -2787 -2383 -2784 -2376 -2759 -2374 -2747 -2371 -2741 Q -2316 -2658 -2281 -2753 M -2298 -3008 L -2302 -3011 -2326 -3021 -2331 -3020 -2332 -3024 -2349 -3030 -2386 -3044 Q -2442 -3062 -2499 -3069 L -2511 -3036 -2530 -2979 -2532 -2973 -2544 -2924 Q -2511 -2942 -2478 -2936 -2452 -2931 -2425 -2910 -2452 -2931 -2478 -2936 -2511 -2942 -2544 -2924 L -2562 -2813 -2562 -2810 -2562 -2792 -2562 -2732 -2473 -2754 -2436 -2766 -2473 -2754 -2562 -2732 -2560 -2702 -2559 -2697 Q -2466 -2469 -2430 -2705 L -2430 -2706 -2433 -2726 -2436 -2766 -2437 -2799 -2437 -2810 -2428 -2892 -2428 -2895 -2425 -2910 -2407 -2982 -2407 -2984 -2403 -2981 -2401 -2987 -2337 -2991 -2331 -2990 Q -2313 -2981 -2298 -2958 L -2278 -2918 -2277 -2915 -2275 -2915 -2298 -3008 M -2349 -3030 L -2337 -2991 -2349 -3030 M -2278 -2789 Q -2290 -2781 -2304 -2777 -2338 -2766 -2383 -2784 -2338 -2766 -2304 -2777 -2290 -2781 -2278 -2789 M -2401 -2987 L -2395 -2997 Q -2461 -3044 -2511 -3036 -2461 -3044 -2395 -2997 L -2401 -2987 M -2562 -2792 L -2544 -2802 -2526 -2810 Q -2497 -2817 -2467 -2810 L -2437 -2799 -2467 -2810 Q -2497 -2817 -2526 -2810 L -2544 -2802 -2562 -2792 M -2430 -2706 Q -2503 -2747 -2560 -2702 -2503 -2747 -2430 -2706";
	ctx.fillStyle=tocolor(ctrans.apply([153,102,51,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M -2278 -2918 L -2298 -2958 Q -2313 -2981 -2331 -2990 L -2337 -2991 -2401 -2987 -2403 -2981 -2280 -2918 -2278 -2918";
	ctx.fillStyle=tocolor(ctrans.apply([153,51,51,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M -4251 -3558 Q -4486 -3837 -4374 -3533 -4642 -3890 -4521 -3497 L -4561 -3536 Q -4767 -3725 -4650 -3473 L -4645 -3465 -4561 -3386 Q -4396 -3228 -4252 -3059 L -4372 -3027 Q -4398 -2954 -4254 -2918 -4690 -2885 -4903 -2519 -4819 -2456 -4638 -2528 -4843 -2349 -4960 -2153 -4914 -2016 -4648 -2232 -4794 -1980 -4831 -1662 -4651 -1664 -4572 -1863 -4614 -1644 -4603 -1371 -4572 -1212 -4497 -1203 L -4495 -1203 Q -4362 -1682 -4101 -2043 L -4099 -2037 -4098 -2001 -4098 -1983 Q -4090 -1892 -4024 -1922 -3970 -2016 -4014 -2157 L -3990 -2184 Q -3948 -2151 -3949 -2082 L -3951 -2060 -3955 -2033 Q -3973 -1908 -3897 -1944 -3789 -2138 -3925 -2258 L -3772 -2409 Q -3682 -2379 -3594 -2376 L -3588 -2376 -3450 -2244 Q -3568 -2273 -3595 -2189 -3331 -2105 -3390 -1941 -3358 -1856 -3309 -1887 -3268 -1965 -3298 -2052 -3244 -2025 -3223 -1919 -3186 -1871 -3160 -1923 -3141 -2114 -3333 -2228 L -3478 -2382 Q -3283 -2309 -3213 -2489 L -3208 -2492 Q -3003 -2339 -2850 -2172 -2821 -2256 -2946 -2411 M -4651 -3470 Q -4914 -3710 -5226 -3923 -5361 -4070 -5247 -4113 L -5007 -3957 -4639 -3719 M -4621 -3842 L -4723 -3953 Q -4734 -4176 -4570 -4094 L -4561 -4076 Q -4422 -3800 -4251 -3558 -4114 -3368 -3960 -3200 -3597 -3042 -3330 -3089 L -3271 -3102 M -4651 -3470 L -4645 -3465 M -2934 -2420 Q -2733 -2181 -2592 -2058 L -2521 -2000 Q -2511 -2028 -2509 -2058 -2497 -2177 -2592 -2330 -2478 -2163 -2370 -2058 -2253 -1944 -2145 -1901 -2154 -1979 -2185 -2058 -2250 -2222 -2406 -2400 -2202 -2180 -2050 -2058 -1936 -1967 -1852 -1932 L -1894 -2058 Q -1936 -2175 -1984 -2280 L -1987 -2288 Q -2113 -2564 -2281 -2753 M -2284 -2844 L -2277 -2850 -2232 -2888 Q -2190 -2933 -2161 -2975 -2058 -3134 -2161 -3264 -2193 -3305 -2245 -3341 L -2248 -3356 Q -2259 -3405 -2278 -3449 -2323 -3554 -2410 -3620 -2512 -3698 -2674 -3723 -2608 -3744 -2532 -3723 -2589 -3800 -2703 -3804 -2676 -3846 -2581 -3819 -2755 -3927 -2901 -3785 L -2890 -3873 Q -3003 -3812 -3034 -3672 L -3037 -3657 -3040 -3650 Q -3184 -3581 -3232 -3200 L -3235 -3185 Q -3235 -3177 -3238 -3170 L -3268 -3168 -3273 -3168 -3330 -3089 M -4252 -3059 L -4233 -3062 -4231 -3072 M -4723 -3953 L -4914 -4161 Q -5004 -4251 -5076 -4217 -5152 -4145 -5007 -3957 M -4638 -2528 L -4633 -2529 -4581 -2553 M -4560 -2364 Q -4608 -2301 -4648 -2232 M -4101 -2043 L -4014 -2157 M -3925 -2258 L -3990 -2184 M -4572 -1863 Q -4534 -2052 -4459 -2202 M -2901 -3785 L -2901 -3783 -2904 -3762 M -2674 -3723 Q -2704 -3714 -2731 -3695 M -2562 -2732 Q -2634 -2717 -2718 -2709 L -2806 -2703 Q -2884 -2705 -2986 -2732 M -3009 -2730 Q -3099 -2757 -3154 -2810 -3246 -2895 -3249 -3048 L -3247 -3098 -3238 -3170 M -2383 -2787 L -2436 -2766 M -2433 -2726 Q -2199 -2553 -1987 -2288 M -3301 -2741 Q -3277 -2754 -3255 -2766 M -3478 -2382 L -3481 -2384 Q -3348 -2405 -3213 -2489 M -3021 -2643 Q -3093 -2750 -3301 -2741 -3562 -2598 -3772 -2409 M -3021 -2643 Q -3114 -2553 -3208 -2492 M -3339 -2135 Q -3319 -2106 -3309 -2079 L -3298 -2052 M -3450 -2244 L -3414 -2210 M -2592 -2330 L -2601 -2343 M -3481 -2384 L -3588 -2376";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([51,0,0,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M -2281 -2753 L -2278 -2760 -2275 -2769 -2278 -2789 -2284 -2844 -2287 -2862 Q -2314 -2826 -2350 -2825 -2367 -2825 -2386 -2834 L -2383 -2856 -2379 -2874 Q -2329 -2868 -2292 -2904 L -2287 -2862 M -2290 -3347 Q -2290 -3368 -2302 -3384 -2314 -3399 -2332 -3399 -2350 -3399 -2362 -3384 -2374 -3368 -2374 -3347 -2374 -3326 -2362 -3311 -2350 -3294 -2332 -3294 L -2323 -3296 Q -2311 -3299 -2302 -3311 L -2296 -3321 -2284 -3344 Q -2274 -3371 -2275 -3404 -2275 -3428 -2283 -3446 -2289 -3467 -2302 -3482 -2328 -3515 -2361 -3513 -2394 -3512 -2416 -3477 -2439 -3444 -2437 -3396 -2436 -3350 -2410 -3317 -2385 -3287 -2352 -3287 L -2332 -3291 Q -2326 -3293 -2323 -3296 -2308 -3305 -2296 -3321 -2290 -3333 -2290 -3347 M -2298 -3008 L -2302 -3011 -2326 -3021 -2332 -3024 -2349 -3030 -2386 -3044 Q -2442 -3062 -2499 -3069 L -2538 -3072 Q -2539 -3093 -2548 -3116 -2463 -3314 -2299 -3209 -2188 -3084 -2241 -2981 L -2242 -2978 -2298 -3008 -2275 -2915 -2277 -2915 -2280 -2918 -2403 -2981 -2401 -2987 -2337 -2991 -2349 -3030 M -2277 -2915 L -2278 -2918 -2298 -2958 Q -2313 -2981 -2331 -2990 L -2337 -2991 M -2326 -3021 L -2331 -3020 -2332 -3024 M -2277 -2915 L -2275 -2915 -2275 -2913 -2277 -2915 -2283 -2913 -2292 -2904 M -2383 -2784 Q -2338 -2766 -2304 -2777 -2290 -2781 -2278 -2789 M -2691 -3140 L -2673 -3141 -2688 -3132 Q -2713 -3117 -2743 -3117 -2797 -3117 -2836 -3165 -2875 -3212 -2875 -3279 -2875 -3347 -2836 -3395 -2797 -3441 -2743 -3441 -2689 -3441 -2650 -3395 -2611 -3347 -2611 -3279 -2611 -3233 -2631 -3195 L -2635 -3188 -2650 -3165 -2673 -3141 Q -2661 -3146 -2650 -3156 -2637 -3170 -2635 -3188 L -2634 -3197 Q -2634 -3221 -2650 -3237 -2667 -3254 -2691 -3254 -2715 -3254 -2731 -3237 -2748 -3221 -2748 -3197 -2748 -3173 -2731 -3156 -2715 -3140 -2691 -3140 M -2548 -3116 Q -2557 -3143 -2574 -3170 M -2544 -2924 L -2532 -2973 -2530 -2979 -2511 -3036 Q -2461 -3044 -2395 -2997 L -2401 -2987 M -2548 -2985 Q -2532 -3027 -2538 -3072 M -2548 -2985 L -2550 -2984 Q -2569 -2936 -2619 -2892 M -2511 -3036 L -2499 -3069 M -2407 -2982 L -2407 -2984 -2403 -2981 M -2407 -2982 L -2425 -2910 Q -2452 -2931 -2478 -2936 -2511 -2942 -2544 -2924 L -2562 -2813 -2562 -2810 -2562 -2792 -2562 -2732 -2560 -2702 -2559 -2697 Q -2466 -2469 -2430 -2705 L -2430 -2706 -2433 -2726 -2436 -2766 -2437 -2799 -2467 -2810 Q -2497 -2817 -2526 -2810 L -2544 -2802 -2562 -2792 M -2986 -2732 L -2986 -2727 -3009 -2730 M -2428 -2892 L -2419 -2888 -2379 -2874 M -2425 -2910 L -2428 -2895 -2428 -2892 -2437 -2810 -2437 -2799 M -2383 -2787 L -2383 -2784 -2376 -2759 -2374 -2747 -2371 -2741 Q -2316 -2658 -2281 -2753 M -2436 -2766 L -2473 -2754 -2562 -2732 M -2386 -2834 L -2386 -2810 -2383 -2787 M -2986 -2727 Q -2980 -2682 -3009 -2654 L -3021 -2643 M -2560 -2702 Q -2503 -2747 -2430 -2706";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([51,0,0,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

}

function sprite139(ctx,ctrans,frame,ratio,time){
	var clips = [];
	var frame_cnt = 36;
	frame = frame % frame_cnt;
	switch(frame){
		case 0:
			place("shape122",sunny_canvas,ctx,[1.0,0.0,0.0,1.0,-1242.0,-99.0],ctrans,1,0,0,time);
			place("sprite124",sunny_canvas,ctx,[1.0,0.0,0.0,1.0,-393.0,1895.0],ctrans,1,(0+time)%1,0,time);
			place("sprite126",sunny_canvas,ctx,[1.0,0.0,0.0,1.0,261.0,2130.0],ctrans,1,(0+time)%1,0,time);
			place("shape127",sunny_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			place("shape128",sunny_canvas,ctx,[1.0,0.0,0.0,1.0,1568.0,252.0],ctrans,1,0,0,time);
			place("sprite130",sunny_canvas,ctx,[1.0,0.0,0.0,1.0,602.0,-2100.0],ctrans,1,(0+time)%1,0,time);
			place("shape131",sunny_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
		case 1:
			place("shape122",sunny_canvas,ctx,[0.996368408203125,0.0791473388671875,-0.0791473388671875,0.996368408203125,-1266.0,-173.0],ctrans,1,0,0,time);
			place("sprite124",sunny_canvas,ctx,[1.0,0.0,0.0,1.0,-393.0,1895.0],ctrans,1,(0+time)%1,0,time);
			place("sprite126",sunny_canvas,ctx,[1.0,0.0,0.0,1.0,261.0,2130.0],ctrans,1,(0+time)%1,0,time);
			place("shape127",sunny_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			place("shape128",sunny_canvas,ctx,[0.9971160888671875,-0.065521240234375,0.065521240234375,0.9971160888671875,1608.0,191.0],ctrans,1,0,0,time);
			place("sprite130",sunny_canvas,ctx,[0.999969482421875,8.087158203125E-4,-8.087158203125E-4,0.999969482421875,604.0,-2100.0],ctrans,1,(0+time)%1,0,time);
			place("shape131",sunny_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
		case 2:
			place("shape122",sunny_canvas,ctx,[0.9859619140625,0.160980224609375,-0.160980224609375,0.9859619140625,-1286.0,-250.0],ctrans,1,0,0,time);
			place("sprite124",sunny_canvas,ctx,[1.0,0.0,0.0,1.0,-393.0,1895.0],ctrans,1,(0+time)%1,0,time);
			place("sprite126",sunny_canvas,ctx,[1.0,0.0,0.0,1.0,261.0,2130.0],ctrans,1,(0+time)%1,0,time);
			place("shape127",sunny_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			place("shape128",sunny_canvas,ctx,[0.9899444580078125,-0.13067626953125,0.13067626953125,0.9899444580078125,1643.0,127.0],ctrans,1,0,0,time);
			place("sprite130",sunny_canvas,ctx,[0.9999542236328125,0.0048980712890625,-0.0048980712890625,0.9999542236328125,609.0,-2097.0],ctrans,1,(0+time)%1,0,time);
			place("shape131",sunny_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
		case 3:
			place("shape122",sunny_canvas,ctx,[0.9696502685546875,0.238525390625,-0.238525390625,0.9696502685546875,-1297.0,-325.0],ctrans,1,0,0,time);
			place("sprite124",sunny_canvas,ctx,[1.0,0.0,0.0,1.0,-393.0,1895.0],ctrans,1,(0+time)%1,0,time);
			place("sprite126",sunny_canvas,ctx,[1.0,0.0,0.0,1.0,261.0,2130.0],ctrans,1,(0+time)%1,0,time);
			place("shape127",sunny_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			place("shape128",sunny_canvas,ctx,[0.9785308837890625,-0.1952056884765625,0.1952056884765625,0.9785308837890625,1673.0,62.0],ctrans,1,0,0,time);
			place("sprite130",sunny_canvas,ctx,[0.9998931884765625,0.0089874267578125,-0.0089874267578125,0.9998931884765625,615.0,-2096.0],ctrans,1,(0+time)%1,0,time);
			place("shape131",sunny_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
		case 4:
			place("shape122",sunny_canvas,ctx,[0.94622802734375,0.3176422119140625,-0.3176422119140625,0.94622802734375,-1305.0,-407.0],ctrans,1,0,0,time);
			place("sprite124",sunny_canvas,ctx,[1.0,0.0,0.0,1.0,-393.0,1895.0],ctrans,1,(0+time)%1,0,time);
			place("sprite126",sunny_canvas,ctx,[1.0,0.0,0.0,1.0,261.0,2130.0],ctrans,1,(0+time)%1,0,time);
			place("shape127",sunny_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			place("shape128",sunny_canvas,ctx,[0.962921142578125,-0.2588348388671875,0.2588348388671875,0.962921142578125,1700.0,-6.0],ctrans,1,0,0,time);
			place("sprite130",sunny_canvas,ctx,[0.9998626708984375,0.009796142578125,-0.009796142578125,0.9998626708984375,617.0,-2095.0],ctrans,1,(0+time)%1,0,time);
			place("shape131",sunny_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
		case 5:
			place("shape122",sunny_canvas,ctx,[0.9163818359375,0.394561767578125,-0.394561767578125,0.9163818359375,-1304.0,-485.0],ctrans,1,0,0,time);
			place("sprite124",sunny_canvas,ctx,[1.0,0.0,0.0,1.0,-393.0,1895.0],ctrans,1,(0+time)%1,0,time);
			place("sprite126",sunny_canvas,ctx,[1.0,0.0,0.0,1.0,261.0,2130.0],ctrans,1,(0+time)%1,0,time);
			place("shape127",sunny_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			place("shape128",sunny_canvas,ctx,[0.94317626953125,-0.3212890625,0.3212890625,0.94317626953125,1724.0,-74.0],ctrans,1,0,0,time);
			place("sprite130",sunny_canvas,ctx,[0.999786376953125,0.0138702392578125,-0.0138702392578125,0.999786376953125,623.0,-2093.0],ctrans,1,(0+time)%1,0,time);
			place("shape132",sunny_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
		case 6:
			place("shape122",sunny_canvas,ctx,[0.8818206787109375,0.465850830078125,-0.465850830078125,0.8818206787109375,-1297.0,-562.0],ctrans,1,0,0,time);
			place("sprite124",sunny_canvas,ctx,[1.0,0.0,0.0,1.0,-393.0,1895.0],ctrans,1,(0+time)%1,0,time);
			place("sprite126",sunny_canvas,ctx,[1.0,0.0,0.0,1.0,261.0,2130.0],ctrans,1,(0+time)%1,0,time);
			place("shape127",sunny_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			place("shape128",sunny_canvas,ctx,[0.919403076171875,-0.3822784423828125,0.3822784423828125,0.919403076171875,1742.0,-145.0],ctrans,1,0,0,time);
			place("sprite130",sunny_canvas,ctx,[0.9997100830078125,0.0179595947265625,-0.0179595947265625,0.9997100830078125,629.0,-2089.0],ctrans,1,(0+time)%1,0,time);
			place("shape132",sunny_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
		case 7:
			place("shape122",sunny_canvas,ctx,[0.8400115966796875,0.5369720458984375,-0.5369720458984375,0.8400115966796875,-1285.0,-642.0],ctrans,1,0,0,time);
			place("sprite124",sunny_canvas,ctx,[1.0,0.0,0.0,1.0,-393.0,1895.0],ctrans,1,(0+time)%1,0,time);
			place("sprite126",sunny_canvas,ctx,[1.0,0.0,0.0,1.0,261.0,2130.0],ctrans,1,(0+time)%1,0,time);
			place("shape127",sunny_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			place("shape128",sunny_canvas,ctx,[0.8917083740234375,-0.4415740966796875,0.4415740966796875,0.8917083740234375,1754.0,-216.0],ctrans,1,0,0,time);
			place("sprite130",sunny_canvas,ctx,[0.999603271484375,0.0220489501953125,-0.0220489501953125,0.999603271484375,635.0,-2088.0],ctrans,1,(0+time)%1,0,time);
			place("shape132",sunny_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
		case 8:
			place("shape122",sunny_canvas,ctx,[0.79248046875,0.604400634765625,-0.604400634765625,0.79248046875,-1265.0,-719.0],ctrans,1,0,0,time);
			place("sprite124",sunny_canvas,ctx,[1.0,0.0,0.0,1.0,-393.0,1895.0],ctrans,1,(0+time)%1,0,time);
			place("sprite126",sunny_canvas,ctx,[1.0,0.0,0.0,1.0,261.0,2130.0],ctrans,1,(0+time)%1,0,time);
			place("shape127",sunny_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			place("shape128",sunny_canvas,ctx,[0.8585662841796875,-0.5017242431640625,0.5017242431640625,0.8585662841796875,1762.0,-294.0],ctrans,1,0,0,time);
			place("sprite130",sunny_canvas,ctx,[0.99957275390625,0.022857666015625,-0.022857666015625,0.99957275390625,636.0,-2087.0],ctrans,1,(0+time)%1,0,time);
			place("shape132",sunny_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
		case 9:
			place("shape122",sunny_canvas,ctx,[0.7417755126953125,0.6652374267578125,-0.6652374267578125,0.7417755126953125,-1240.0,-792.0],ctrans,1,0,0,time);
			place("sprite124",sunny_canvas,ctx,[1.0,0.0,0.0,1.0,-393.0,1895.0],ctrans,1,(0+time)%1,0,time);
			place("sprite126",sunny_canvas,ctx,[1.0,0.0,0.0,1.0,261.0,2130.0],ctrans,1,(0+time)%1,0,time);
			place("shape127",sunny_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			place("shape128",sunny_canvas,ctx,[0.823211669921875,-0.5567474365234375,0.5567474365234375,0.823211669921875,1766.0,-366.0],ctrans,1,0,0,time);
			place("sprite130",sunny_canvas,ctx,[0.9994354248046875,0.026947021484375,-0.026947021484375,0.9994354248046875,643.0,-2085.0],ctrans,1,(0+time)%1,0,time);
			place("shape132",sunny_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
		case 10:
			place("shape122",sunny_canvas,ctx,[0.685272216796875,0.7252349853515625,-0.7252349853515625,0.685272216796875,-1209.0,-867.0],ctrans,1,0,0,time);
			place("sprite124",sunny_canvas,ctx,[1.0,0.0,0.0,1.0,-393.0,1895.0],ctrans,1,(0+time)%1,0,time);
			place("sprite126",sunny_canvas,ctx,[1.0,0.0,0.0,1.0,261.0,2130.0],ctrans,1,(0+time)%1,0,time);
			place("shape127",sunny_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			place("shape128",sunny_canvas,ctx,[0.78570556640625,-0.610137939453125,0.610137939453125,0.78570556640625,1766.0,-438.0],ctrans,1,0,0,time);
			place("sprite130",sunny_canvas,ctx,[0.999298095703125,0.0310211181640625,-0.0310211181640625,0.999298095703125,648.0,-2083.0],ctrans,1,(0+time)%1,0,time);
			place("shape133",sunny_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
		case 11:
			place("shape122",sunny_canvas,ctx,[0.67462158203125,0.73260498046875,-0.73260498046875,0.67462158203125,-1203.0,-877.0],ctrans,1,0,0,time);
			place("sprite124",sunny_canvas,ctx,[1.0,0.0,0.0,1.0,-393.0,1895.0],ctrans,1,(0+time)%1,0,time);
			place("sprite126",sunny_canvas,ctx,[1.0,0.0,0.0,1.0,261.0,2130.0],ctrans,1,(0+time)%1,0,time);
			place("shape127",sunny_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			place("shape128",sunny_canvas,ctx,[0.762664794921875,-0.636322021484375,0.636322021484375,0.762664794921875,1763.0,-476.0],ctrans,1,0,0,time);
			place("sprite130",sunny_canvas,ctx,[0.9991455078125,0.0351104736328125,-0.0351104736328125,0.9991455078125,654.0,-2080.0],ctrans,1,(0+time)%1,0,time);
			place("shape133",sunny_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
		case 12:
			place("shape122",sunny_canvas,ctx,[0.667510986328125,0.7387542724609375,-0.7387542724609375,0.667510986328125,-1198.0,-886.0],ctrans,1,0,0,time);
			place("sprite124",sunny_canvas,ctx,[1.0,0.0,0.0,1.0,-393.0,1895.0],ctrans,1,(0+time)%1,0,time);
			place("sprite126",sunny_canvas,ctx,[1.0,0.0,0.0,1.0,261.0,2130.0],ctrans,1,(0+time)%1,0,time);
			place("shape127",sunny_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			place("shape128",sunny_canvas,ctx,[0.7400665283203125,-0.6625823974609375,0.6625823974609375,0.7400665283203125,1758.0,-514.0],ctrans,1,0,0,time);
			place("sprite130",sunny_canvas,ctx,[0.9990997314453125,0.035919189453125,-0.035919189453125,0.9990997314453125,654.0,-2079.0],ctrans,1,(0+time)%1,0,time);
			place("shape133",sunny_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
		case 13:
			place("shape122",sunny_canvas,ctx,[0.6578826904296875,0.7469940185546875,-0.7469940185546875,0.6578826904296875,-1192.0,-896.0],ctrans,1,0,0,time);
			place("sprite124",sunny_canvas,ctx,[1.0,0.0,0.0,1.0,-393.0,1895.0],ctrans,1,(0+time)%1,0,time);
			place("sprite126",sunny_canvas,ctx,[1.0,0.0,0.0,1.0,261.0,2130.0],ctrans,1,(0+time)%1,0,time);
			place("shape127",sunny_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			place("shape128",sunny_canvas,ctx,[0.718841552734375,-0.6856842041015625,0.6856842041015625,0.718841552734375,1754.0,-549.0],ctrans,1,0,0,time);
			place("sprite130",sunny_canvas,ctx,[0.9989166259765625,0.0399932861328125,-0.0399932861328125,0.9989166259765625,661.0,-2078.0],ctrans,1,(0+time)%1,0,time);
			place("shape133",sunny_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
		case 14:
			place("shape122",sunny_canvas,ctx,[0.648162841796875,0.755126953125,-0.755126953125,0.648162841796875,-1186.0,-908.0],ctrans,1,0,0,time);
			place("sprite124",sunny_canvas,ctx,[1.0,0.0,0.0,1.0,-393.0,1895.0],ctrans,1,(0+time)%1,0,time);
			place("sprite126",sunny_canvas,ctx,[1.0,0.0,0.0,1.0,261.0,2130.0],ctrans,1,(0+time)%1,0,time);
			place("shape127",sunny_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			place("shape128",sunny_canvas,ctx,[0.6945343017578125,-0.71038818359375,0.71038818359375,0.6945343017578125,1748.0,-586.0],ctrans,1,0,0,time);
			place("sprite130",sunny_canvas,ctx,[0.99871826171875,0.0440826416015625,-0.0440826416015625,0.99871826171875,667.0,-2075.0],ctrans,1,(0+time)%1,0,time);
			place("shape133",sunny_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
		case 15:
			place("shape122",sunny_canvas,ctx,[0.640869140625,0.7610321044921875,-0.7610321044921875,0.640869140625,-1183.0,-915.0],ctrans,1,0,0,time);
			place("sprite124",sunny_canvas,ctx,[1.0,0.0,0.0,1.0,-393.0,1895.0],ctrans,1,(0+time)%1,0,time);
			place("sprite126",sunny_canvas,ctx,[1.0,0.0,0.0,1.0,261.0,2130.0],ctrans,1,(0+time)%1,0,time);
			place("shape127",sunny_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			place("shape128",sunny_canvas,ctx,[0.6693878173828125,-0.734222412109375,0.734222412109375,0.6693878173828125,1741.0,-625.0],ctrans,1,0,0,time);
			place("sprite130",sunny_canvas,ctx,[0.9986419677734375,0.0487060546875,-0.0487060546875,0.9986419677734375,673.0,-2073.0],ctrans,1,(0+time)%1,0,time);
			place("shape134",sunny_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
		case 16:
			place("shape122",sunny_canvas,ctx,[0.6309661865234375,0.768951416015625,-0.768951416015625,0.6309661865234375,-1175.0,-925.0],ctrans,1,0,0,time);
			place("sprite124",sunny_canvas,ctx,[1.0,0.0,0.0,1.0,-393.0,1895.0],ctrans,1,(0+time)%1,0,time);
			place("sprite126",sunny_canvas,ctx,[1.0,0.0,0.0,1.0,261.0,2130.0],ctrans,1,(0+time)%1,0,time);
			place("shape127",sunny_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			place("shape128",sunny_canvas,ctx,[0.6434478759765625,-0.7572021484375,0.7572021484375,0.6434478759765625,1731.0,-660.0],ctrans,1,0,0,time);
			place("sprite130",sunny_canvas,ctx,[0.9987030029296875,0.044281005859375,-0.044281005859375,0.9987030029296875,667.0,-2076.0],ctrans,1,(0+time)%1,0,time);
			place("shape134",sunny_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
		case 17:
			place("shape122",sunny_canvas,ctx,[0.62353515625,0.7746734619140625,-0.7746734619140625,0.62353515625,-1171.0,-933.0],ctrans,1,0,0,time);
			place("sprite124",sunny_canvas,ctx,[1.0,0.0,0.0,1.0,-393.0,1895.0],ctrans,1,(0+time)%1,0,time);
			place("sprite126",sunny_canvas,ctx,[1.0,0.0,0.0,1.0,261.0,2130.0],ctrans,1,(0+time)%1,0,time);
			place("shape127",sunny_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			place("shape128",sunny_canvas,ctx,[0.61669921875,-0.779266357421875,0.779266357421875,0.61669921875,1721.0,-698.0],ctrans,1,0,0,time);
			place("sprite130",sunny_canvas,ctx,[0.9987335205078125,0.043670654296875,-0.043670654296875,0.9987335205078125,666.0,-2076.0],ctrans,1,(0+time)%1,0,time);
			place("shape134",sunny_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
		case 18:
			place("shape122",sunny_canvas,ctx,[0.61346435546875,0.7823333740234375,-0.7823333740234375,0.61346435546875,-1165.0,-944.0],ctrans,1,0,0,time);
			place("sprite124",sunny_canvas,ctx,[1.0,0.0,0.0,1.0,-393.0,1895.0],ctrans,1,(0+time)%1,0,time);
			place("sprite126",sunny_canvas,ctx,[1.0,0.0,0.0,1.0,261.0,2130.0],ctrans,1,(0+time)%1,0,time);
			place("shape127",sunny_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			place("shape128",sunny_canvas,ctx,[0.5892181396484375,-0.8003692626953125,0.8003692626953125,0.5892181396484375,1711.0,-735.0],ctrans,1,0,0,time);
			place("sprite130",sunny_canvas,ctx,[0.9989166259765625,0.039794921875,-0.039794921875,0.9989166259765625,660.0,-2079.0],ctrans,1,(0+time)%1,0,time);
			place("shape134",sunny_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
		case 19:
			place("shape122",sunny_canvas,ctx,[0.60333251953125,0.7899017333984375,-0.7899017333984375,0.60333251953125,-1158.0,-954.0],ctrans,1,0,0,time);
			place("sprite124",sunny_canvas,ctx,[1.0,0.0,0.0,1.0,-393.0,1895.0],ctrans,1,(0+time)%1,0,time);
			place("sprite126",sunny_canvas,ctx,[1.0,0.0,0.0,1.0,261.0,2130.0],ctrans,1,(0+time)%1,0,time);
			place("shape127",sunny_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			place("shape128",sunny_canvas,ctx,[0.5610198974609375,-0.8205413818359375,0.8205413818359375,0.5610198974609375,1697.0,-771.0],ctrans,1,0,0,time);
			place("sprite130",sunny_canvas,ctx,[0.9990997314453125,0.035888671875,-0.035888671875,0.9990997314453125,654.0,-2081.0],ctrans,1,(0+time)%1,0,time);
			place("shape134",sunny_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
		case 20:
			place("shape122",sunny_canvas,ctx,[0.595703125,0.7953643798828125,-0.7953643798828125,0.595703125,-1153.0,-962.0],ctrans,1,0,0,time);
			place("sprite124",sunny_canvas,ctx,[1.0,0.0,0.0,1.0,-393.0,1895.0],ctrans,1,(0+time)%1,0,time);
			place("sprite126",sunny_canvas,ctx,[1.0,0.0,0.0,1.0,261.0,2130.0],ctrans,1,(0+time)%1,0,time);
			place("shape127",sunny_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			place("shape128",sunny_canvas,ctx,[0.5321502685546875,-0.839691162109375,0.839691162109375,0.5321502685546875,1683.0,-805.0],ctrans,1,0,0,time);
			place("sprite130",sunny_canvas,ctx,[0.9991302490234375,0.0352783203125,-0.0352783203125,0.9991302490234375,653.0,-2081.0],ctrans,1,(0+time)%1,0,time);
			place("shape135",sunny_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
		case 21:
			place("shape122",sunny_canvas,ctx,[0.5869598388671875,0.8034820556640625,-0.8034820556640625,0.5869598388671875,-1148.0,-973.0],ctrans,1,0,0,time);
			place("sprite124",sunny_canvas,ctx,[1.0,0.0,0.0,1.0,-393.0,1895.0],ctrans,1,(0+time)%1,0,time);
			place("sprite126",sunny_canvas,ctx,[1.0,0.0,0.0,1.0,261.0,2130.0],ctrans,1,(0+time)%1,0,time);
			place("shape127",sunny_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			place("shape128",sunny_canvas,ctx,[0.50567626953125,-0.857696533203125,0.857696533203125,0.50567626953125,1672.0,-838.0],ctrans,1,0,0,time);
			place("sprite130",sunny_canvas,ctx,[0.999267578125,0.03143310546875,-0.03143310546875,0.999267578125,648.0,-2084.0],ctrans,1,(0+time)%1,0,time);
			place("shape135",sunny_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
		case 22:
			place("shape122",sunny_canvas,ctx,[0.637298583984375,0.76251220703125,-0.76251220703125,0.637298583984375,-1179.0,-918.0],ctrans,1,0,0,time);
			place("sprite124",sunny_canvas,ctx,[1.0,0.0,0.0,1.0,-393.0,1895.0],ctrans,1,(0+time)%1,0,time);
			place("sprite126",sunny_canvas,ctx,[1.0,0.0,0.0,1.0,261.0,2130.0],ctrans,1,(0+time)%1,0,time);
			place("shape127",sunny_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			place("shape128",sunny_canvas,ctx,[0.567779541015625,-0.8164215087890625,0.8164215087890625,0.567779541015625,1702.0,-761.0],ctrans,1,0,0,time);
			place("sprite130",sunny_canvas,ctx,[0.999298095703125,0.03082275390625,-0.03082275390625,0.999298095703125,647.0,-2084.0],ctrans,1,(0+time)%1,0,time);
			place("shape135",sunny_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
		case 23:
			place("shape122",sunny_canvas,ctx,[0.6888580322265625,0.7167510986328125,-0.7167510986328125,0.6888580322265625,-1210.0,-857.0],ctrans,1,0,0,time);
			place("sprite124",sunny_canvas,ctx,[1.0,0.0,0.0,1.0,-393.0,1895.0],ctrans,1,(0+time)%1,0,time);
			place("sprite126",sunny_canvas,ctx,[1.0,0.0,0.0,1.0,261.0,2130.0],ctrans,1,(0+time)%1,0,time);
			place("shape127",sunny_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			place("shape128",sunny_canvas,ctx,[0.627044677734375,-0.7721405029296875,0.7721405029296875,0.627044677734375,1727.0,-682.0],ctrans,1,0,0,time);
			place("sprite130",sunny_canvas,ctx,[0.9994354248046875,0.0269317626953125,-0.0269317626953125,0.9994354248046875,641.0,-2085.0],ctrans,1,(0+time)%1,0,time);
			place("shape135",sunny_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
		case 24:
			place("shape122",sunny_canvas,ctx,[0.734954833984375,0.6699371337890625,-0.6699371337890625,0.734954833984375,-1236.0,-799.0],ctrans,1,0,0,time);
			place("sprite124",sunny_canvas,ctx,[1.0,0.0,0.0,1.0,-393.0,1895.0],ctrans,1,(0+time)%1,0,time);
			place("sprite126",sunny_canvas,ctx,[1.0,0.0,0.0,1.0,261.0,2130.0],ctrans,1,(0+time)%1,0,time);
			place("shape127",sunny_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			place("shape128",sunny_canvas,ctx,[0.6829071044921875,-0.723602294921875,0.723602294921875,0.6829071044921875,1745.0,-603.0],ctrans,1,0,0,time);
			place("sprite130",sunny_canvas,ctx,[0.9994659423828125,0.0263214111328125,-0.0263214111328125,0.9994659423828125,641.0,-2085.0],ctrans,1,(0+time)%1,0,time);
			place("shape135",sunny_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
		case 25:
			place("shape122",sunny_canvas,ctx,[0.779937744140625,0.6176300048828125,-0.6176300048828125,0.779937744140625,-1259.0,-737.0],ctrans,1,0,0,time);
			place("sprite124",sunny_canvas,ctx,[1.0,0.0,0.0,1.0,-393.0,1895.0],ctrans,1,(0+time)%1,0,time);
			place("sprite126",sunny_canvas,ctx,[1.0,0.0,0.0,1.0,261.0,2130.0],ctrans,1,(0+time)%1,0,time);
			place("shape127",sunny_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			place("shape128",sunny_canvas,ctx,[0.7350311279296875,-0.6710357666015625,0.6710357666015625,0.7350311279296875,1759.0,-523.0],ctrans,1,0,0,time);
			place("sprite130",sunny_canvas,ctx,[0.9995880126953125,0.022430419921875,-0.022430419921875,0.9995880126953125,634.0,-2088.0],ctrans,1,(0+time)%1,0,time);
			place("shape136",sunny_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
		case 26:
			place("shape122",sunny_canvas,ctx,[0.8193511962890625,0.565032958984375,-0.565032958984375,0.8193511962890625,-1276.0,-675.0],ctrans,1,0,0,time);
			place("sprite124",sunny_canvas,ctx,[1.0,0.0,0.0,1.0,-393.0,1895.0],ctrans,1,(0+time)%1,0,time);
			place("sprite126",sunny_canvas,ctx,[1.0,0.0,0.0,1.0,261.0,2130.0],ctrans,1,(0+time)%1,0,time);
			place("shape127",sunny_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			place("shape128",sunny_canvas,ctx,[0.7831573486328125,-0.61474609375,0.61474609375,0.7831573486328125,1766.0,-440.0],ctrans,1,0,0,time);
			place("sprite130",sunny_canvas,ctx,[0.999603271484375,0.021820068359375,-0.021820068359375,0.999603271484375,634.0,-2088.0],ctrans,1,(0+time)%1,0,time);
			place("shape136",sunny_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
		case 27:
			place("shape122",sunny_canvas,ctx,[0.855255126953125,0.5099029541015625,-0.5099029541015625,0.855255126953125,-1289.0,-612.0],ctrans,1,0,0,time);
			place("sprite124",sunny_canvas,ctx,[1.0,0.0,0.0,1.0,-393.0,1895.0],ctrans,1,(0+time)%1,0,time);
			place("sprite126",sunny_canvas,ctx,[1.0,0.0,0.0,1.0,261.0,2130.0],ctrans,1,(0+time)%1,0,time);
			place("shape127",sunny_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			place("shape128",sunny_canvas,ctx,[0.8270263671875,-0.5550537109375,0.5550537109375,0.8270263671875,1767.0,-359.0],ctrans,1,0,0,time);
			place("sprite130",sunny_canvas,ctx,[0.99969482421875,0.017974853515625,-0.017974853515625,0.99969482421875,628.0,-2091.0],ctrans,1,(0+time)%1,0,time);
			place("shape136",sunny_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
		case 28:
			place("shape122",sunny_canvas,ctx,[0.8889617919921875,0.4496612548828125,-0.4496612548828125,0.8889617919921875,-1299.0,-545.0],ctrans,1,0,0,time);
			place("sprite124",sunny_canvas,ctx,[1.0,0.0,0.0,1.0,-393.0,1895.0],ctrans,1,(0+time)%1,0,time);
			place("sprite126",sunny_canvas,ctx,[1.0,0.0,0.0,1.0,261.0,2130.0],ctrans,1,(0+time)%1,0,time);
			place("shape127",sunny_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			place("shape128",sunny_canvas,ctx,[0.8663482666015625,-0.4922637939453125,0.4922637939453125,0.8663482666015625,1762.0,-277.0],ctrans,1,0,0,time);
			place("sprite130",sunny_canvas,ctx,[0.999786376953125,0.014068603515625,-0.014068603515625,0.999786376953125,622.0,-2093.0],ctrans,1,(0+time)%1,0,time);
			place("shape136",sunny_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
		case 29:
			place("shape122",sunny_canvas,ctx,[0.9171295166015625,0.3902130126953125,-0.3902130126953125,0.9171295166015625,-1303.0,-483.0],ctrans,1,0,0,time);
			place("sprite124",sunny_canvas,ctx,[1.0,0.0,0.0,1.0,-393.0,1895.0],ctrans,1,(0+time)%1,0,time);
			place("sprite126",sunny_canvas,ctx,[1.0,0.0,0.0,1.0,261.0,2130.0],ctrans,1,(0+time)%1,0,time);
			place("shape127",sunny_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			place("shape128",sunny_canvas,ctx,[0.900909423828125,-0.426727294921875,0.426727294921875,0.900909423828125,1753.0,-195.0],ctrans,1,0,0,time);
			place("sprite130",sunny_canvas,ctx,[0.99981689453125,0.013458251953125,-0.013458251953125,0.99981689453125,622.0,-2094.0],ctrans,1,(0+time)%1,0,time);
			place("shape136",sunny_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
		case 30:
			place("shape122",sunny_canvas,ctx,[0.94244384765625,0.325927734375,-0.325927734375,0.94244384765625,-1303.0,-416.0],ctrans,1,0,0,time);
			place("sprite124",sunny_canvas,ctx,[1.0,0.0,0.0,1.0,-393.0,1895.0],ctrans,1,(0+time)%1,0,time);
			place("sprite126",sunny_canvas,ctx,[1.0,0.0,0.0,1.0,261.0,2130.0],ctrans,1,(0+time)%1,0,time);
			place("shape127",sunny_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			place("shape128",sunny_canvas,ctx,[0.9305877685546875,-0.3587799072265625,0.3587799072265625,0.9305877685546875,1736.0,-115.0],ctrans,1,0,0,time);
			place("sprite130",sunny_canvas,ctx,[0.9998779296875,0.00958251953125,-0.00958251953125,0.9998779296875,616.0,-2095.0],ctrans,1,(0+time)%1,0,time);
			place("shape137",sunny_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
		case 31:
			place("shape122",sunny_canvas,ctx,[0.9623870849609375,0.2632293701171875,-0.2632293701171875,0.9623870849609375,-1300.0,-352.0],ctrans,1,0,0,time);
			place("sprite124",sunny_canvas,ctx,[1.0,0.0,0.0,1.0,-393.0,1895.0],ctrans,1,(0+time)%1,0,time);
			place("sprite126",sunny_canvas,ctx,[1.0,0.0,0.0,1.0,261.0,2130.0],ctrans,1,(0+time)%1,0,time);
			place("shape127",sunny_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			place("shape128",sunny_canvas,ctx,[0.9551239013671875,-0.288848876953125,0.288848876953125,0.9551239013671875,1712.0,-38.0],ctrans,1,0,0,time);
			place("sprite130",sunny_canvas,ctx,[0.9998931884765625,0.0089874267578125,-0.0089874267578125,0.9998931884765625,615.0,-2096.0],ctrans,1,(0+time)%1,0,time);
			place("shape137",sunny_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
		case 32:
			place("shape122",sunny_canvas,ctx,[0.978179931640625,0.1993255615234375,-0.1993255615234375,0.978179931640625,-1292.0,-288.0],ctrans,1,0,0,time);
			place("sprite124",sunny_canvas,ctx,[1.0,0.0,0.0,1.0,-393.0,1895.0],ctrans,1,(0+time)%1,0,time);
			place("sprite126",sunny_canvas,ctx,[1.0,0.0,0.0,1.0,261.0,2130.0],ctrans,1,(0+time)%1,0,time);
			place("shape127",sunny_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			place("shape128",sunny_canvas,ctx,[0.9744110107421875,-0.21728515625,0.21728515625,0.9744110107421875,1684.0,39.0],ctrans,1,0,0,time);
			place("sprite130",sunny_canvas,ctx,[0.9999237060546875,0.005096435546875,-0.005096435546875,0.9999237060546875,609.0,-2097.0],ctrans,1,(0+time)%1,0,time);
			place("shape137",sunny_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
		case 33:
			place("shape122",sunny_canvas,ctx,[0.990203857421875,0.131256103515625,-0.131256103515625,0.990203857421875,-1278.0,-222.0],ctrans,1,0,0,time);
			place("sprite124",sunny_canvas,ctx,[1.0,0.0,0.0,1.0,-393.0,1895.0],ctrans,1,(0+time)%1,0,time);
			place("sprite126",sunny_canvas,ctx,[1.0,0.0,0.0,1.0,261.0,2130.0],ctrans,1,(0+time)%1,0,time);
			place("shape127",sunny_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			place("shape128",sunny_canvas,ctx,[0.9883880615234375,-0.14447021484375,0.14447021484375,0.9883880615234375,1649.0,115.0],ctrans,1,0,0,time);
			place("sprite130",sunny_canvas,ctx,[0.99993896484375,0.004486083984375,-0.004486083984375,0.99993896484375,607.0,-2098.0],ctrans,1,(0+time)%1,0,time);
			place("shape137",sunny_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
		case 34:
			place("shape122",sunny_canvas,ctx,[0.99725341796875,0.0657958984375,-0.0657958984375,0.99725341796875,-1262.0,-160.0],ctrans,1,0,0,time);
			place("sprite124",sunny_canvas,ctx,[1.0,0.0,0.0,1.0,-393.0,1895.0],ctrans,1,(0+time)%1,0,time);
			place("sprite126",sunny_canvas,ctx,[1.0,0.0,0.0,1.0,261.0,2130.0],ctrans,1,(0+time)%1,0,time);
			place("shape127",sunny_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			place("shape128",sunny_canvas,ctx,[0.9969482421875,-0.0708160400390625,0.0708160400390625,0.9969482421875,1610.0,187.0],ctrans,1,0,0,time);
			place("sprite130",sunny_canvas,ctx,[0.999969482421875,6.103515625E-4,-6.103515625E-4,0.999969482421875,602.0,-2100.0],ctrans,1,(0+time)%1,0,time);
			place("shape137",sunny_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
		case 35:
			place("shape122",sunny_canvas,ctx,[1.0,0.0,0.0,1.0,-1242.0,-99.0],ctrans,1,0,0,time);
			place("sprite124",sunny_canvas,ctx,[1.0,0.0,0.0,1.0,-393.0,1895.0],ctrans,1,(0+time)%1,0,time);
			place("sprite126",sunny_canvas,ctx,[1.0,0.0,0.0,1.0,261.0,2130.0],ctrans,1,(0+time)%1,0,time);
			place("shape127",sunny_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			place("shape128",sunny_canvas,ctx,[1.0,0.0,0.0,1.0,1568.0,252.0],ctrans,1,0,0,time);
			place("sprite130",sunny_canvas,ctx,[1.0,0.0,0.0,1.0,602.0,-2100.0],ctrans,1,(0+time)%1,0,time);
			place("shape138",sunny_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
	}
}

function shape109(ctx,ctrans,frame,ratio,time){
	var pathData="M -5719 429 L -5778 331 -5719 400 -5719 355 -5778 331 -5794 -4341 5414 -4341 5430 3200 -5778 3200 -5778 1006 -5719 1006 -5719 429";
	var grd=ctx.createLinearGradient(-296.0,4000.0,-296.0,-4000.0);
	grd.addColorStop(0.34509803921568627,tocolor(ctrans.apply([51,153,255,1])));
	grd.addColorStop(1.0,tocolor(ctrans.apply([170,255,255,1])));
	ctx.fillStyle = grd;
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
}

function shape110(ctx,ctrans,frame,ratio,time){
	var pathData="M 20432 1616 Q 20547 1497 20708 1462 21133 1367 21150 1831 21225 2062 21244 2304 21396 4272 21340 6249 21325 6772 21268 7295 21138 8477 21257 9659 21316 10247 21089 10780 21008 10970 20838 11082 20219 11491 19458 11476 L 19269 11463 17322 11166 Q 16969 11116 16614 11147 15347 11256 14132 10882 13497 10687 12839 10591 11705 10421 10560 10443 L 9788 10414 Q 9378 10382 8984 10437 L 8868 10442 Q 8103 10400 7346 10269 6890 10192 6441 10090 5864 9958 5275 9915 L 4707 9861 4041 9784 Q 1519 9411 -912 8619 -1079 8564 -1249 8523 -2391 8264 -3167 7405 -3501 7036 -3602 6554 -3654 6309 -3656 6056 -3665 4476 -3745 2895 -3836 1096 -3519 -668 -3390 -1385 -2785 -1851 -2656 -1950 -2500 -1989 -1818 -2156 -1167 -1853 -805 -1687 -534 -1395 371 -421 489 924 878 656 1328 884 1523 982 1653 1156 1766 1307 1815 1286 1934 923 2207 661 2318 556 2462 521 3155 360 3598 941 3681 748 3802 574 4200 4 4885 15 5167 19 5400 178 6173 701 6219 1639 6314 1544 6446 1541 6919 1532 6986 2022 7341 1986 7600 2232 7729 1967 8009 1892 8124 1862 8232 1911 8836 2184 8714 2865 8954 3018 9041 3288 9094 3452 9180 3518 L 9221 3518 Q 9535 3553 9719 3813 9672 3544 9721 3274 9853 2556 10597 2464 10849 2429 11079 2534 11965 2939 12007 3927 12259 3854 12517 3904 12632 3929 12726 3990 12878 4089 12956 4048 13217 3420 13874 3354 13968 3348 14039 3404 14439 3730 14526 4267 14606 4075 14697 3886 14858 3549 15173 3355 15560 3118 15795 3499 L 15799 3255 Q 15799 3149 15813 3048 15893 2491 16456 2375 16602 2347 16747 2395 17441 2624 17556 3376 17708 3269 17892 3253 18690 3203 18950 3986 L 19073 3811 Q 19392 3376 19889 3467 L 19867 3302 Q 19732 2337 20432 1616";
	var grd=ctx.createLinearGradient(9079.0,2125.25,8603.0,4866.75);
	grd.addColorStop(0.0,tocolor(ctrans.apply([255,255,255,1])));
	grd.addColorStop(1.0,tocolor(ctrans.apply([255,255,255,0.0])));
	ctx.fillStyle = grd;
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
}

function shape111(ctx,ctrans,frame,ratio,time){
	var pathData="M -7155 1649 L -7131 1624 Q -7138 1620 -7142 1624 L -7203 1661 -7200 1668 -7155 1649 M -7984 1842 L -7988 1843 Q -8012 1859 -8022 1884 L -8015 1889 -7986 1844 -7984 1842";
	ctx.fillStyle=tocolor(ctrans.apply([153,204,102,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M -7816 1421 Q -7846 1420 -7876 1430 L -7853 1455 -7816 1421 M -7965 1831 L -7972 1826 -7984 1842 -7965 1831";
	ctx.fillStyle=tocolor(ctrans.apply([216,255,176,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M -4522 2506 L -4524 2506 -4522 2507 -4522 2506";
	ctx.fillStyle=tocolor(ctrans.apply([102,153,51,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M -5801 1987 Q -5796 2008 -5794 2030 L -5789 2030 -5792 2010 Q -5795 1996 -5801 1987";
	ctx.fillStyle=tocolor(ctrans.apply([153,204,0,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M -7468 2147 L -7458 2145 -7300 2126 -7328 2126 -7462 2124 -7468 2147 M -6555 2733 L -6506 2675 Q -6435 2599 -6338 2537 -6443 2584 -6525 2654 L -6585 2709 -6555 2733";
	ctx.fillStyle=tocolor(ctrans.apply([255,255,255,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M -7468 2147 L -7462 2124 -7471 2125 -7468 2147 M -6555 2733 L -6585 2709 -6586 2711 -6555 2733";
	ctx.fillStyle=tocolor(ctrans.apply([246,246,246,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M -7300 2126 Q -7011 2135 -6729 2173 -6489 2209 -6255 2270 -6215 2312 -6124 2375 -5935 2507 -5704 2589 -5128 2794 -4779 2855 L -4579 2878 -4489 2880 -3880 2940 Q -2959 3010 -2698 2998 -2511 3062 -2326 3133 L -2189 2748 -2196 2742 Q -2203 2734 -2219 2732 -2250 2726 -2285 2712 -2302 2702 -2312 2708 L -2324 2706 Q -2364 2689 -2390 2722 -2400 2738 -2419 2750 L -2436 2763 Q -2472 2774 -2501 2796 L -2512 2805 -2514 2808 -2518 2800 -2562 2759 -2579 2759 -2599 2764 Q -2629 2782 -2647 2807 -2638 2781 -2650 2766 -2657 2756 -2669 2750 -2677 2745 -2684 2745 L -2702 2750 -2713 2757 Q -2718 2720 -2750 2674 -2753 2667 -2762 2666 -2804 2657 -2823 2699 -2833 2725 -2855 2712 -2857 2711 -2865 2721 L -2884 2750 Q -2879 2715 -2910 2695 L -2933 2693 Q -2945 2698 -2955 2708 -2974 2726 -2996 2740 -2996 2690 -3040 2654 -3045 2648 -3055 2650 -3062 2650 -3070 2656 L -3082 2663 Q -3101 2647 -3096 2620 -3092 2588 -3126 2585 -3160 2581 -3190 2604 -3197 2612 -3209 2618 L -3212 2606 Q -3211 2552 -3262 2530 L -3279 2524 Q -3340 2511 -3365 2455 -3367 2449 -3376 2450 -3409 2448 -3429 2473 -3479 2526 -3517 2581 L -3527 2543 -3535 2532 Q -3587 2546 -3621 2589 L -3633 2600 -3656 2614 Q -3674 2630 -3679 2656 -3692 2646 -3681 2624 -3679 2617 -3683 2609 L -3694 2584 Q -3715 2587 -3739 2606 L -3747 2621 Q -3759 2597 -3760 2560 -3758 2551 -3764 2542 L -3770 2539 Q -3805 2539 -3818 2576 L -3830 2590 -3849 2605 -3858 2614 Q -3845 2569 -3861 2527 -3881 2473 -3934 2481 -3988 2489 -4017 2530 L -4034 2563 Q -4030 2544 -4045 2528 -4071 2499 -4105 2480 L -4128 2467 -4143 2461 Q -4168 2457 -4177 2474 L -4188 2497 -4193 2512 Q -4189 2487 -4212 2471 L -4221 2463 Q -4240 2442 -4268 2452 L -4278 2454 Q -4318 2457 -4329 2494 L -4333 2473 Q -4346 2448 -4366 2432 -4369 2428 -4374 2427 L -4395 2425 -4405 2430 -4413 2435 -4419 2443 Q -4428 2466 -4430 2490 -4435 2459 -4453 2444 L -4461 2438 Q -4492 2429 -4517 2451 L -4523 2456 -4522 2442 Q -4516 2410 -4548 2408 L -4580 2413 -4605 2421 -4596 2397 Q -4591 2386 -4595 2374 -4598 2362 -4612 2356 -4633 2345 -4655 2345 -4709 2345 -4739 2381 -4724 2339 -4770 2327 L -4797 2328 -4799 2329 Q -4793 2314 -4801 2293 L -4812 2271 Q -4824 2258 -4844 2252 L -4851 2249 -4856 2243 Q -4847 2184 -4904 2148 -4928 2131 -4953 2131 L -4980 2137 -4991 2092 Q -4992 2075 -5001 2057 -5052 1975 -5151 1950 L -5181 1951 -5232 1955 -5285 1945 -5287 1945 -5338 1951 Q -5402 1970 -5421 2025 L -5420 2041 Q -5407 2078 -5445 2080 -5494 2084 -5513 2119 -5516 2077 -5579 2076 -5588 2077 -5598 2085 -5615 2099 -5620 2124 -5657 2086 -5683 2126 -5684 2105 -5709 2089 L -5716 2087 Q -5734 2092 -5742 2106 -5760 2100 -5746 2079 -5721 2049 -5741 2019 -5771 2011 -5783 2039 L -5789 2045 Q -5786 2042 -5789 2030 L -5794 2030 Q -5796 2008 -5801 1987 -5817 1964 -5852 1968 L -5861 1969 -5898 1979 -5948 1989 -5957 1965 -5955 1951 Q -5951 1906 -6002 1890 L -6038 1888 -6067 1900 -6089 1912 Q -6065 1833 -6131 1776 -6139 1770 -6148 1770 -6185 1773 -6212 1805 L -6237 1834 Q -6266 1866 -6276 1907 -6301 1866 -6354 1884 L -6368 1892 Q -6396 1918 -6405 1960 -6410 1939 -6438 1950 -6467 1960 -6479 1988 L -6485 1993 Q -6496 1955 -6532 1919 -6540 1912 -6554 1907 -6578 1898 -6582 1924 -6593 1983 -6635 2020 -6654 2002 -6663 1970 -6665 1956 -6680 1948 L -6704 1943 Q -6743 1939 -6776 1957 L -6789 1956 Q -6812 1940 -6821 1909 -6835 1853 -6890 1849 -6926 1848 -6949 1861 L -6953 1857 Q -6995 1835 -7041 1847 L -7138 1879 -7154 1891 Q -7170 1903 -7190 1879 -7208 1854 -7235 1852 -7242 1850 -7248 1857 -7268 1875 -7268 1894 L -7290 1897 -7317 1913 Q -7332 1929 -7357 1932 -7367 1909 -7380 1893 L -7401 1876 Q -7416 1865 -7435 1861 -7471 1852 -7517 1874 -7536 1883 -7554 1899 L -7595 1937 Q -7613 1892 -7673 1887 -7690 1885 -7710 1899 L -7735 1925 Q -7729 1943 -7747 1945 L -7735 1925 Q -7737 1918 -7744 1910 L -7760 1892 Q -7775 1883 -7793 1880 L -7843 1886 -7891 1903 -7916 1846 Q -7922 1835 -7933 1829 L -7965 1831 -7984 1842 -7986 1844 -8015 1889 -8022 1884 Q -8028 1863 -8041 1851 -8072 1821 -8138 1831 -8159 1835 -8176 1848 -8239 1897 -8225 1979 -8221 2000 -8220 2019 L -8216 2027 -8230 2026 Q -8270 2032 -8285 2074 -8300 2112 -8259 2129 -8287 2135 -8306 2166 L -8304 2174 Q -8298 2191 -8297 2208 -7894 2128 -7471 2125 L -7462 2124 -7328 2126 -7300 2126 M -2894 2776 L -2884 2750 -2894 2776 M -4828 2350 L -4799 2329 -4828 2350 M -4329 2494 L -4331 2507 -4330 2496 -4329 2494 M -4522 2507 L -4524 2506 -4522 2506 -4523 2502 -4522 2507 M -5513 2119 L -5514 2134 -5516 2124 -5513 2119 M -5683 2126 Q -5682 2138 -5689 2152 L -5691 2143 -5684 2127 -5683 2126 M -7268 1894 Q -7251 1894 -7244 1907 -7227 1938 -7240 1939 -7268 1916 -7268 1894 M -8216 2027 L -8214 2030 Q -8183 2049 -8201 2052 -8212 2044 -8216 2027 M -2436 2763 L -2431 2764 -2438 2768 -2436 2763";
	ctx.fillStyle=tocolor(ctrans.apply([51,102,0,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M -7185 1681 L -7155 1649 -7200 1668 -7185 1681";
	ctx.fillStyle=tocolor(ctrans.apply([102,204,0,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M -8966 2399 L -9078 2442 -9128 2584 -9038 2616 -8825 2516 Q -8611 2426 -8386 2355 -8165 2282 -7935 2234 -7703 2184 -7468 2147 L -7471 2125 Q -7894 2128 -8297 2208 -8639 2275 -8966 2399";
	var grd=ctx.createLinearGradient(-8914.25,14082.75,-9935.75,16791.25);
	grd.addColorStop(0.0,tocolor(ctrans.apply([255,255,255,1])));
	grd.addColorStop(1.0,tocolor(ctrans.apply([246,246,246,1])));
	ctx.fillStyle = grd;
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M -2570 2751 L -2626 2698 -2730 2593 -3044 2279 -3086 2238 Q -3272 2055 -3506 1907 -3582 1860 -3666 1842 L -3704 1836 Q -3773 1878 -3826 1941 L -3848 1950 -3851 1959 -3861 1974 -3878 1984 -3881 1986 Q -3919 2015 -3930 2066 -3843 2135 -3789 2222 -3824 2252 -3868 2266 L -4071 2424 Q -4052 2484 -4017 2530 -3988 2489 -3934 2481 -3881 2473 -3861 2527 -3845 2569 -3858 2614 L -3849 2605 -3830 2590 -3818 2576 Q -3805 2539 -3770 2539 L -3764 2542 Q -3758 2551 -3760 2560 -3759 2597 -3747 2621 L -3739 2606 Q -3715 2587 -3694 2584 L -3683 2609 Q -3679 2617 -3681 2624 -3692 2646 -3679 2656 -3674 2630 -3656 2614 L -3633 2600 -3621 2589 Q -3587 2546 -3535 2532 L -3531 2531 Q -3526 2536 -3527 2543 L -3517 2581 Q -3479 2526 -3429 2473 -3409 2448 -3376 2450 -3367 2449 -3365 2455 -3340 2511 -3279 2524 L -3262 2530 Q -3211 2552 -3212 2606 L -3209 2618 Q -3197 2612 -3190 2604 -3160 2581 -3126 2585 -3092 2588 -3096 2620 -3101 2647 -3082 2663 L -3070 2656 Q -3062 2650 -3055 2650 -3045 2648 -3040 2654 -2996 2690 -2996 2740 -2974 2726 -2955 2708 -2945 2698 -2933 2693 L -2910 2695 Q -2879 2715 -2884 2750 L -2865 2721 Q -2857 2711 -2855 2712 -2833 2725 -2823 2699 -2804 2657 -2762 2666 -2753 2667 -2750 2674 -2718 2720 -2713 2757 L -2702 2750 -2684 2745 Q -2677 2745 -2669 2750 -2657 2756 -2650 2766 -2638 2781 -2647 2807 -2629 2782 -2599 2764 L -2579 2759 -2570 2751 M -4705 2156 L -4715 2161 -4729 2132 Q -4755 2077 -4788 2021 -4832 1947 -4866 1932 L -4879 1923 -4899 1908 -5021 1792 -5176 1636 -5297 1514 -5349 1462 Q -5476 1339 -5610 1239 -5652 1207 -5696 1181 -5717 1166 -5738 1157 L -5760 1150 -5849 1284 Q -5906 1372 -5957 1464 -5859 1609 -5739 1747 L -5875 1905 -5852 1968 Q -5817 1964 -5801 1987 -5795 1996 -5792 2010 L -5789 2030 Q -5786 2042 -5789 2045 L -5783 2039 Q -5771 2011 -5741 2019 -5721 2049 -5746 2079 -5760 2100 -5742 2106 -5734 2092 -5716 2087 L -5709 2089 Q -5684 2105 -5683 2126 -5657 2086 -5620 2124 -5615 2099 -5598 2085 -5588 2077 -5579 2076 -5516 2077 -5513 2119 -5494 2084 -5445 2080 -5407 2078 -5420 2041 L -5421 2025 Q -5402 1970 -5338 1951 L -5287 1945 -5285 1945 -5232 1955 -5181 1951 -5151 1950 Q -5052 1975 -5001 2057 -4992 2075 -4991 2092 L -4980 2137 -4953 2131 Q -4928 2131 -4904 2148 -4847 2184 -4856 2243 L -4851 2249 -4844 2252 Q -4824 2258 -4812 2271 L -4805 2267 -4800 2262 Q -4748 2213 -4705 2156 M -7203 1661 Q -7225 1619 -7277 1602 L -7284 1600 Q -7481 1507 -7683 1448 -7729 1429 -7777 1425 L -7779 1424 -7816 1421 -7853 1455 Q -7913 1514 -7961 1582 -7896 1611 -7855 1653 L -7900 1687 Q -7995 1761 -8041 1851 -8028 1863 -8022 1884 -8012 1859 -7988 1843 L -7984 1842 -7972 1826 -7965 1831 -7933 1829 Q -7922 1835 -7916 1846 L -7891 1903 -7843 1886 -7793 1880 Q -7775 1883 -7760 1892 L -7744 1910 Q -7737 1918 -7735 1925 L -7710 1899 Q -7690 1885 -7673 1887 -7613 1892 -7595 1937 L -7554 1899 Q -7536 1883 -7517 1874 -7471 1852 -7435 1861 -7416 1865 -7401 1876 L -7363 1846 -7325 1815 -7319 1807 -7314 1792 -7302 1786 Q -7238 1734 -7185 1681 L -7200 1668 -7203 1661";
	ctx.fillStyle=tocolor(ctrans.apply([94,187,0,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M -3704 1836 L -3765 1831 -3854 1839 Q -3991 1858 -4121 1897 -4181 1915 -4240 1939 -4363 1988 -4483 2042 -4595 2093 -4705 2156 -4748 2213 -4800 2262 L -4805 2267 -4812 2271 -4801 2293 Q -4793 2314 -4799 2329 L -4797 2328 -4770 2327 Q -4724 2339 -4739 2381 -4709 2345 -4655 2345 -4633 2345 -4612 2356 -4598 2362 -4595 2374 -4591 2386 -4596 2397 L -4605 2421 -4580 2413 -4548 2408 Q -4516 2410 -4522 2442 L -4523 2456 -4517 2451 Q -4492 2429 -4461 2438 L -4453 2444 Q -4435 2459 -4430 2490 -4428 2466 -4419 2443 L -4413 2435 -4405 2430 -4395 2425 -4374 2427 Q -4369 2428 -4366 2432 -4346 2448 -4333 2473 L -4329 2494 Q -4318 2457 -4278 2454 L -4268 2452 Q -4240 2442 -4221 2463 L -4212 2471 Q -4189 2487 -4193 2512 L -4188 2497 -4177 2474 Q -4168 2457 -4143 2461 L -4128 2467 -4105 2480 Q -4071 2499 -4045 2528 -4030 2544 -4034 2563 L -4017 2530 Q -4052 2484 -4071 2424 L -3868 2266 Q -3824 2252 -3789 2222 -3843 2135 -3930 2066 -3919 2015 -3881 1986 L -3878 1984 -3861 1974 -3851 1959 -3848 1950 -3826 1941 Q -3773 1878 -3704 1836 M -5760 1150 L -5873 1156 -6038 1217 -6733 1481 -7155 1649 -7185 1681 Q -7238 1734 -7302 1786 L -7314 1792 -7319 1807 -7325 1815 -7363 1846 -7401 1876 -7380 1893 Q -7367 1909 -7357 1932 -7332 1929 -7317 1913 L -7290 1897 -7268 1894 Q -7268 1875 -7248 1857 -7242 1850 -7235 1852 -7208 1854 -7190 1879 -7170 1903 -7154 1891 L -7138 1879 -7041 1847 Q -6995 1835 -6953 1857 L -6949 1861 Q -6926 1848 -6890 1849 -6835 1853 -6821 1909 -6812 1940 -6789 1956 L -6776 1957 Q -6743 1939 -6704 1943 L -6680 1948 Q -6665 1956 -6663 1970 -6654 2002 -6635 2020 -6593 1983 -6582 1924 -6578 1898 -6554 1907 -6540 1912 -6532 1919 -6496 1955 -6485 1993 L -6479 1988 Q -6467 1960 -6438 1950 -6410 1939 -6405 1960 -6396 1918 -6368 1892 L -6354 1884 Q -6301 1866 -6276 1907 -6266 1866 -6237 1834 L -6212 1805 Q -6185 1773 -6148 1770 -6139 1770 -6131 1776 -6065 1833 -6089 1912 L -6067 1900 -6038 1888 -6002 1890 Q -5951 1906 -5955 1951 L -5957 1965 -5948 1989 -5898 1979 -5861 1969 -5852 1968 -5875 1905 -5739 1747 Q -5859 1609 -5957 1464 -5906 1372 -5849 1284 L -5760 1150 M -7876 1430 Q -7980 1471 -8080 1520 -8206 1593 -8311 1693 L -8479 1854 Q -8741 2114 -8966 2399 -8639 2275 -8297 2208 -8298 2191 -8304 2174 L -8306 2166 Q -8287 2135 -8259 2129 -8300 2112 -8285 2074 -8270 2032 -8230 2026 L -8216 2027 -8220 2019 Q -8221 2000 -8225 1979 -8239 1897 -8176 1848 -8159 1835 -8138 1831 -8072 1821 -8041 1851 -7995 1761 -7900 1687 L -7855 1653 Q -7896 1611 -7961 1582 -7913 1514 -7853 1455 L -7876 1430 M -4329 2494 L -4330 2496 -4331 2507 -4329 2494";
	ctx.fillStyle=tocolor(ctrans.apply([153,255,0,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M -2570 2751 L -2626 2698 -2730 2593 -3044 2279 -3086 2238 Q -3272 2055 -3506 1907 -3582 1860 -3666 1842 L -3704 1836 -3765 1831 -3854 1839 Q -3991 1858 -4121 1897 -4181 1915 -4240 1939 -4363 1988 -4483 2042 -4595 2093 -4705 2156 L -4715 2161 -4729 2132 Q -4755 2077 -4788 2021 -4832 1947 -4866 1932 L -4879 1923 -4899 1908 -5021 1792 -5176 1636 -5297 1514 -5349 1462 Q -5476 1339 -5610 1239 -5652 1207 -5696 1181 -5717 1166 -5738 1157 L -5760 1150 -5873 1156 -6038 1217 -6733 1481 -7155 1649 -7200 1668 -7203 1661 Q -7225 1619 -7277 1602 L -7284 1600 Q -7481 1507 -7683 1448 -7729 1429 -7777 1425 L -7779 1424 -7816 1421 Q -7846 1420 -7876 1430 -7980 1471 -8080 1520 -8206 1593 -8311 1693 L -8479 1854 Q -8741 2114 -8966 2399";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([102,204,0,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M -2189 2748 L -2196 2742 Q -2203 2734 -2219 2732 -2250 2726 -2285 2712 -2302 2702 -2312 2708 L -2324 2706 Q -2364 2689 -2390 2722 -2400 2738 -2419 2750 L -2436 2763 Q -2472 2774 -2501 2796 L -2512 2805 -2518 2800 Q -2532 2762 -2562 2759 L -2570 2751 M -2579 2759 L -2599 2764 Q -2629 2782 -2647 2807 -2638 2781 -2650 2766 -2657 2756 -2669 2750 -2677 2745 -2684 2745 L -2702 2750 -2713 2757 Q -2718 2720 -2750 2674 -2753 2667 -2762 2666 -2804 2657 -2823 2699 -2833 2725 -2855 2712 -2857 2711 -2865 2721 L -2884 2750 Q -2879 2715 -2910 2695 L -2933 2693 Q -2945 2698 -2955 2708 -2974 2726 -2996 2740 -2996 2690 -3040 2654 -3045 2648 -3055 2650 -3062 2650 -3070 2656 L -3082 2663 Q -3101 2647 -3096 2620 -3092 2588 -3126 2585 -3160 2581 -3190 2604 -3197 2612 -3209 2618 L -3212 2606 Q -3211 2552 -3262 2530 L -3279 2524 Q -3340 2511 -3365 2455 -3367 2449 -3376 2450 -3409 2448 -3429 2473 -3479 2526 -3517 2581 L -3527 2543 Q -3526 2536 -3531 2531 L -3535 2532 Q -3587 2546 -3621 2589 L -3633 2600 -3656 2614 Q -3674 2630 -3679 2656 -3692 2646 -3681 2624 -3679 2617 -3683 2609 L -3694 2584 Q -3715 2587 -3739 2606 L -3747 2621 Q -3759 2597 -3760 2560 -3758 2551 -3764 2542 L -3770 2539 Q -3805 2539 -3818 2576 L -3830 2590 -3849 2605 -3858 2614 Q -3845 2569 -3861 2527 -3881 2473 -3934 2481 -3988 2489 -4017 2530 L -4034 2563 Q -4030 2544 -4045 2528 -4071 2499 -4105 2480 L -4128 2467 -4143 2461 Q -4168 2457 -4177 2474 L -4188 2497 -4193 2512 Q -4189 2487 -4212 2471 L -4221 2463 Q -4240 2442 -4268 2452 L -4278 2454 Q -4318 2457 -4329 2494 L -4333 2473 Q -4346 2448 -4366 2432 -4369 2428 -4374 2427 L -4395 2425 -4405 2430 -4413 2435 -4419 2443 Q -4428 2466 -4430 2490 -4435 2459 -4453 2444 L -4461 2438 Q -4492 2429 -4517 2451 L -4523 2456 -4522 2442 Q -4516 2410 -4548 2408 L -4580 2413 -4605 2421 -4596 2397 Q -4591 2386 -4595 2374 -4598 2362 -4612 2356 -4633 2345 -4655 2345 -4709 2345 -4739 2381 -4724 2339 -4770 2327 L -4797 2328 -4799 2329 Q -4793 2314 -4801 2293 L -4812 2271 Q -4824 2258 -4844 2252 L -4851 2249 -4856 2243 Q -4847 2184 -4904 2148 -4928 2131 -4953 2131 L -4980 2137 -4991 2092 Q -4992 2075 -5001 2057 -5052 1975 -5151 1950 L -5181 1951 -5232 1955 -5285 1945 -5287 1945 -5338 1951 Q -5402 1970 -5421 2025 L -5420 2041 Q -5407 2078 -5445 2080 -5494 2084 -5513 2119 L -5516 2124 -5514 2134 -5513 2119 Q -5516 2077 -5579 2076 -5588 2077 -5598 2085 -5615 2099 -5620 2124 -5657 2086 -5683 2126 L -5684 2127 -5691 2143 -5689 2152 Q -5682 2138 -5683 2126 -5684 2105 -5709 2089 L -5716 2087 Q -5734 2092 -5742 2106 -5760 2100 -5746 2079 -5721 2049 -5741 2019 -5771 2011 -5783 2039 L -5789 2045 Q -5786 2042 -5789 2030 L -5792 2010 Q -5795 1996 -5801 1987 -5817 1964 -5852 1968 L -5861 1969 -5898 1979 -5948 1989 -5957 1965 -5955 1951 Q -5951 1906 -6002 1890 L -6038 1888 -6067 1900 -6089 1912 Q -6065 1833 -6131 1776 -6139 1770 -6148 1770 -6185 1773 -6212 1805 L -6237 1834 Q -6266 1866 -6276 1907 -6301 1866 -6354 1884 L -6368 1892 Q -6396 1918 -6405 1960 -6410 1939 -6438 1950 -6467 1960 -6479 1988 L -6485 1993 Q -6496 1955 -6532 1919 -6540 1912 -6554 1907 -6578 1898 -6582 1924 -6593 1983 -6635 2020 -6654 2002 -6663 1970 -6665 1956 -6680 1948 L -6704 1943 Q -6743 1939 -6776 1957 L -6789 1956 Q -6812 1940 -6821 1909 -6835 1853 -6890 1849 -6926 1848 -6949 1861 L -6953 1857 Q -6995 1835 -7041 1847 L -7138 1879 -7154 1891 Q -7170 1903 -7190 1879 -7208 1854 -7235 1852 -7242 1850 -7248 1857 -7268 1875 -7268 1894 L -7290 1897 -7317 1913 Q -7332 1929 -7357 1932 -7367 1909 -7380 1893 L -7401 1876 Q -7416 1865 -7435 1861 -7471 1852 -7517 1874 -7536 1883 -7554 1899 L -7595 1937 Q -7613 1892 -7673 1887 -7690 1885 -7710 1899 L -7735 1925 -7747 1945 Q -7729 1943 -7735 1925 -7737 1918 -7744 1910 L -7760 1892 Q -7775 1883 -7793 1880 L -7843 1886 -7891 1903 -7916 1846 Q -7922 1835 -7933 1829 L -7965 1831 -7984 1842 -7988 1843 Q -8012 1859 -8022 1884 -8028 1863 -8041 1851 -8072 1821 -8138 1831 -8159 1835 -8176 1848 -8239 1897 -8225 1979 -8221 2000 -8220 2019 L -8216 2027 -8230 2026 Q -8270 2032 -8285 2074 -8300 2112 -8259 2129 -8287 2135 -8306 2166 L -8304 2174 Q -8298 2191 -8297 2208 M -2884 2750 L -2894 2776 M -4799 2329 L -4828 2350 M -4329 2494 L -4330 2496 -4331 2507 -4329 2494 M -7268 1894 Q -7268 1916 -7240 1939 -7227 1938 -7244 1907 -7251 1894 -7268 1894 M -7471 2125 L -7462 2124 M -8216 2027 Q -8212 2044 -8201 2052 -8183 2049 -8214 2030 L -8216 2027 M -2518 2800 L -2514 2808 -2512 2805 M -2436 2763 L -2438 2768 -2431 2764 -2436 2763 M -2579 2759 L -2562 2759";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([102,204,0,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

}

function shape112(ctx,ctrans,frame,ratio,time){
	var pathData="M 15689 2506 L 0 2506 0 415 Q 2618 -264 5296 401 8299 1150 11393 1122 13705 1101 15689 0 L 15689 2506";
	var grd=ctx.createLinearGradient(7539.0,2643.0,7579.0,309.0);
	grd.addColorStop(0.0,tocolor(ctrans.apply([214,255,157,1])));
	grd.addColorStop(1.0,tocolor(ctrans.apply([153,255,0,1])));
	ctx.fillStyle = grd;
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
}

function shape113(ctx,ctrans,frame,ratio,time){
	var pathData="M 157 26 Q 157 39 143 53 L 140 56 156 68 161 73 185 56 Q 225 56 222 114 213 185 181 185 158 185 150 166 L 137 173 138 180 Q 138 220 115 220 63 220 40 199 27 186 27 175 27 163 46 146 L 52 142 47 129 31 133 Q 8 133 2 115 L 0 95 9 67 Q 19 42 30 42 61 42 73 61 L 81 56 Q 75 48 75 37 75 0 100 0 157 0 157 26 M 70 87 Q 63 97 63 110 63 127 75 140 88 153 106 153 118 153 129 146 L 132 143 136 140 Q 149 127 149 110 149 92 136 79 123 67 106 67 88 67 75 79 L 72 83 70 87";
	ctx.fillStyle=tocolor(ctrans.apply([255,255,255,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 70 87 L 72 83 75 79 Q 88 67 106 67 123 67 136 79 149 92 149 110 149 127 136 140 L 132 143 129 146 Q 118 153 106 153 88 153 75 140 63 127 63 110 63 97 70 87";
	ctx.fillStyle=tocolor(ctrans.apply([255,204,0,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
}

function shape114(ctx,ctrans,frame,ratio,time){
	var pathData="M 3 -502 Q 195 -502 332 -365 468 -229 468 -37 468 154 332 291 195 427 3 427 -189 427 -325 291 -462 154 -461 -37 -462 -229 -325 -365 -189 -502 3 -502";
	drawPath(ctx,pathData,false);
	ctx.fillStyle=tocolor(ctrans.apply([255,255,255,0.0]));
	ctx.fill("evenodd");
	ctx.save();
	ctx.clip();
	ctx.transform(0.0284576416015625,0,0,0.0284576416015625,3,-38);
	var grd=ctx.createRadialGradient(0.0,0,0,0,0,16384);
	grd.addColorStop(0.0,tocolor(ctrans.apply([255,255,255,1])));
	grd.addColorStop(0.47843137254901963,tocolor(ctrans.apply([255,255,255,1])));
	grd.addColorStop(1.0,tocolor(ctrans.apply([255,255,255,0.0])));
	ctx.fillStyle = grd;
	ctx.fillRect(-16384,-16384,32768,32768);
	ctx.restore();
	var pathData="M -1581 -38 L 1562 -38 1562 -14 -1581 -14 -1581 -38";
	drawPath(ctx,pathData,false);
	ctx.fillStyle=tocolor(ctrans.apply([255,255,255,0.0]));
	ctx.fill("evenodd");
	ctx.save();
	ctx.clip();
	ctx.transform(0.09600830078125,0,0,0.02880859375,-10,-26);
	var grd=ctx.createRadialGradient(0.0,0,0,0,0,16384);
	grd.addColorStop(0.0,tocolor(ctrans.apply([255,255,255,1])));
	grd.addColorStop(1.0,tocolor(ctrans.apply([255,255,255,0.0])));
	ctx.fillStyle = grd;
	ctx.fillRect(-16384,-16384,32768,32768);
	ctx.restore();
	var pathData="M -26 1546 L -25 -1597 7 -1597 6 1546 -26 1546";
	drawPath(ctx,pathData,false);
	ctx.fillStyle=tocolor(ctrans.apply([255,255,255,0.0]));
	ctx.fill("evenodd");
	ctx.save();
	ctx.clip();
	ctx.transform(1.52587890625E-5,-0.09600830078125,0.0384063720703125,1.52587890625E-5,-9,-25);
	var grd=ctx.createRadialGradient(0.0,0,0,0,0,16384);
	grd.addColorStop(0.0,tocolor(ctrans.apply([255,255,255,1])));
	grd.addColorStop(1.0,tocolor(ctrans.apply([255,255,255,0.0])));
	ctx.fillStyle = grd;
	ctx.fillRect(-16384,-16384,32768,32768);
	ctx.restore();
	var pathData="M -1109 -1149 L 1114 1074 1091 1097 -1132 -1126 -1109 -1149";
	drawPath(ctx,pathData,false);
	ctx.fillStyle=tocolor(ctrans.apply([255,255,255,0.0]));
	ctx.fill("evenodd");
	ctx.save();
	ctx.clip();
	ctx.transform(0.0678863525390625,0.0678863525390625,-0.02716064453125,0.02716064453125,-10,-26);
	var grd=ctx.createRadialGradient(0.0,0,0,0,0,16384);
	grd.addColorStop(0.0,tocolor(ctrans.apply([255,255,255,1])));
	grd.addColorStop(1.0,tocolor(ctrans.apply([255,255,255,0.0])));
	ctx.fillStyle = grd;
	ctx.fillRect(-16384,-16384,32768,32768);
	ctx.restore();
	var pathData="M 1114 -1126 L -1109 1097 -1132 1074 1091 -1149 1114 -1126";
	drawPath(ctx,pathData,false);
	ctx.fillStyle=tocolor(ctrans.apply([255,255,255,0.0]));
	ctx.fill("evenodd");
	ctx.save();
	ctx.clip();
	ctx.transform(-0.0678863525390625,0.0678863525390625,-0.02716064453125,-0.02716064453125,-9,-27);
	var grd=ctx.createRadialGradient(0.0,0,0,0,0,16384);
	grd.addColorStop(0.0,tocolor(ctrans.apply([255,255,255,1])));
	grd.addColorStop(1.0,tocolor(ctrans.apply([255,255,255,0.0])));
	ctx.fillStyle = grd;
	ctx.fillRect(-16384,-16384,32768,32768);
	ctx.restore();
	var pathData="M -1523 -448 L 1513 365 1505 397 -1531 -416 -1523 -448";
	drawPath(ctx,pathData,false);
	ctx.fillStyle=tocolor(ctrans.apply([255,255,255,0.0]));
	ctx.fill("evenodd");
	ctx.save();
	ctx.clip();
	ctx.transform(0.092742919921875,0.02484130859375,-0.0103607177734375,0.03863525390625,-9,-26);
	var grd=ctx.createRadialGradient(0.0,0,0,0,0,16384);
	grd.addColorStop(0.0,tocolor(ctrans.apply([255,255,255,1])));
	grd.addColorStop(1.0,tocolor(ctrans.apply([255,255,255,0.0])));
	ctx.fillStyle = grd;
	ctx.fillRect(-16384,-16384,32768,32768);
	ctx.restore();
	var pathData="M 1513 -416 L -1523 398 -1531 365 1505 -448 1513 -416";
	drawPath(ctx,pathData,false);
	ctx.fillStyle=tocolor(ctrans.apply([255,255,255,0.0]));
	ctx.fill("evenodd");
	ctx.save();
	ctx.clip();
	ctx.transform(-0.092742919921875,0.02484130859375,-0.0103607177734375,-0.038665771484375,-9,-26);
	var grd=ctx.createRadialGradient(0.0,0,0,0,0,16384);
	grd.addColorStop(0.0,tocolor(ctrans.apply([255,255,255,1])));
	grd.addColorStop(1.0,tocolor(ctrans.apply([255,255,255,0.0])));
	ctx.fillStyle = grd;
	ctx.fillRect(-16384,-16384,32768,32768);
	ctx.restore();
	var pathData="M -400 -1548 L 413 1488 381 1496 -432 -1540 -400 -1548";
	drawPath(ctx,pathData,false);
	ctx.fillStyle=tocolor(ctrans.apply([255,255,255,0.0]));
	ctx.fill("evenodd");
	ctx.save();
	ctx.clip();
	ctx.transform(0.0248565673828125,0.092742919921875,-0.038665771484375,0.0103607177734375,-10,-26);
	var grd=ctx.createRadialGradient(0.0,0,0,0,0,16384);
	grd.addColorStop(0.0,tocolor(ctrans.apply([255,255,255,1])));
	grd.addColorStop(1.0,tocolor(ctrans.apply([255,255,255,0.0])));
	ctx.fillStyle = grd;
	ctx.fillRect(-16384,-16384,32768,32768);
	ctx.restore();
	var pathData="M 435 -1530 L -421 1488 -453 1479 403 -1539 435 -1530";
	drawPath(ctx,pathData,false);
	ctx.fillStyle=tocolor(ctrans.apply([255,255,255,0.0]));
	ctx.fill("evenodd");
	ctx.save();
	ctx.clip();
	ctx.transform(-0.026123046875,0.0921783447265625,-0.0384368896484375,-0.010894775390625,-9,-26);
	var grd=ctx.createRadialGradient(0.0,0,0,0,0,16384);
	grd.addColorStop(0.0,tocolor(ctrans.apply([255,255,255,1])));
	grd.addColorStop(1.0,tocolor(ctrans.apply([255,255,255,0.0])));
	ctx.fillStyle = grd;
	ctx.fillRect(-16384,-16384,32768,32768);
	ctx.restore();
	var pathData="M 410 -435 Q 245 -600 12 -600 -222 -600 -386 -435 -551 -270 -551 -37 -551 197 -386 362 -222 526 12 526 245 526 410 362 575 197 575 -37 575 -270 410 -435 M 414 -438 Q 580 -272 580 -37 580 199 414 365 247 531 12 531 -224 531 -390 365 -556 199 -556 -37 -556 -272 -390 -438 -224 -605 12 -605 247 -605 414 -438 M 368 -392 Q 515 -245 515 -36 515 172 368 320 220 467 12 467 -197 467 -344 320 -492 172 -491 -36 -492 -245 -344 -392 -197 -539 12 -539 220 -539 368 -392 M 364 -388 Q 218 -534 12 -534 -195 -534 -341 -388 -487 -243 -486 -36 -487 170 -341 316 -195 462 12 462 218 462 364 316 510 170 510 -36 510 -243 364 -388";
	ctx.fillStyle=tocolor(ctrans.apply([254,171,171,0.19607843]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 406 -431 Q 243 -595 12 -595 -219 -595 -383 -431 -546 -268 -546 -37 -546 194 -383 358 -219 521 12 521 243 521 406 358 570 194 570 -37 570 -268 406 -431 M 410 -435 Q 575 -270 575 -37 575 197 410 362 245 526 12 526 -222 526 -386 362 -551 197 -551 -37 -551 -270 -386 -435 -222 -600 12 -600 245 -600 410 -435 M 371 -396 Q 520 -247 520 -36 520 174 371 323 222 472 12 472 -199 472 -348 323 -497 174 -496 -36 -497 -247 -348 -396 -199 -545 12 -544 222 -545 371 -396 M 368 -392 Q 220 -539 12 -539 -197 -539 -344 -392 -492 -245 -491 -36 -492 172 -344 320 -197 467 12 467 220 467 368 320 515 172 515 -36 515 -245 368 -392";
	ctx.fillStyle=tocolor(ctrans.apply([254,171,171,0.39607844]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 403 -428 Q 241 -590 12 -590 -217 -590 -379 -428 -541 -266 -541 -37 -541 192 -379 354 -217 516 12 516 241 516 403 354 565 192 565 -37 565 -266 403 -428 M 406 -431 Q 570 -268 570 -37 570 194 406 358 243 521 12 521 -219 521 -383 358 -546 194 -546 -37 -546 -268 -383 -431 -219 -595 12 -595 243 -595 406 -431 M 375 -399 Q 525 -249 525 -36 525 176 375 327 224 477 12 477 -201 477 -351 327 -502 176 -501 -36 -502 -249 -351 -399 -201 -550 12 -549 224 -550 375 -399 M 371 -396 Q 222 -545 12 -544 -199 -545 -348 -396 -497 -247 -496 -36 -497 174 -348 323 -199 472 12 472 222 472 371 323 520 174 520 -36 520 -247 371 -396";
	ctx.fillStyle=tocolor(ctrans.apply([254,171,171,0.59607846]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 399 -424 Q 239 -585 12 -585 -215 -585 -376 -424 -536 -264 -536 -37 -536 190 -376 351 -215 511 12 511 239 511 399 351 560 190 560 -37 560 -264 399 -424 M 403 -428 Q 565 -266 565 -37 565 192 403 354 241 516 12 516 -217 516 -379 354 -541 192 -541 -37 -541 -266 -379 -428 -217 -590 12 -590 241 -590 403 -428 M 378 -403 Q 530 -251 530 -36 530 178 378 330 226 482 12 482 -203 482 -355 330 -507 178 -506 -36 -507 -251 -355 -403 -203 -555 12 -554 226 -555 378 -403 M 375 -399 Q 224 -550 12 -549 -201 -550 -351 -399 -502 -249 -501 -36 -502 176 -351 327 -201 477 12 477 224 477 375 327 525 176 525 -36 525 -249 375 -399";
	ctx.fillStyle=tocolor(ctrans.apply([254,171,171,0.79607844]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 399 -424 Q 560 -264 560 -37 560 190 399 351 239 511 12 511 -215 511 -376 351 -536 190 -536 -37 -536 -264 -376 -424 -215 -585 12 -585 239 -585 399 -424 M 378 -403 Q 226 -555 12 -554 -203 -555 -355 -403 -507 -251 -506 -36 -507 178 -355 330 -203 482 12 482 226 482 378 330 530 178 530 -36 530 -251 378 -403";
	ctx.fillStyle=tocolor(ctrans.apply([254,171,171,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M -505 -416 Q -637 -284 -825 -284 -1013 -284 -1145 -416 -1277 -549 -1277 -736 -1277 -924 -1145 -1057 -1013 -1189 -825 -1189 -637 -1189 -505 -1057 -372 -924 -372 -736 -372 -549 -505 -416";
	drawPath(ctx,pathData,false);
	ctx.fillStyle=tocolor(ctrans.apply([255,255,255,0.0]));
	ctx.fill("evenodd");
	ctx.save();
	ctx.clip();
	ctx.transform(0.028289794921875,0,0,0.028289794921875,-825,-744);
	var grd=ctx.createRadialGradient(0.0,0,0,0,0,16384);
	grd.addColorStop(0.35294117647058826,tocolor(ctrans.apply([255,255,255,0.0])));
	grd.addColorStop(0.8588235294117647,tocolor(ctrans.apply([255,255,255,0.68235296])));
	grd.addColorStop(1.0,tocolor(ctrans.apply([255,255,255,0.0])));
	ctx.fillStyle = grd;
	ctx.fillRect(-16384,-16384,32768,32768);
	ctx.restore();
	var pathData="M 2671 1615 Q 2565 1720 2415 1720 2265 1720 2159 1615 2053 1509 2053 1358 2053 1208 2159 1102 2265 996 2415 996 2565 996 2671 1102 2777 1208 2777 1358 2777 1509 2671 1615";
	drawPath(ctx,pathData,false);
	ctx.fillStyle=tocolor(ctrans.apply([255,255,255,0.0]));
	ctx.fill("evenodd");
	ctx.save();
	ctx.clip();
	ctx.transform(0.0226287841796875,0,0,0.0226287841796875,2415,1352);
	var grd=ctx.createRadialGradient(0.0,0,0,0,0,16384);
	grd.addColorStop(0.35294117647058826,tocolor(ctrans.apply([255,255,255,0.0])));
	grd.addColorStop(0.8588235294117647,tocolor(ctrans.apply([255,255,255,0.68235296])));
	grd.addColorStop(1.0,tocolor(ctrans.apply([255,255,255,0.0])));
	ctx.fillStyle = grd;
	ctx.fillRect(-16384,-16384,32768,32768);
	ctx.restore();
	var pathData="M 3726 1459 Q 3884 1617 3885 1843 3884 2068 3726 2227 3567 2386 3342 2386 3116 2386 2958 2227 2799 2068 2799 1843 2799 1617 2958 1459 3116 1300 3342 1300 3567 1300 3726 1459";
	drawPath(ctx,pathData,false);
	ctx.fillStyle=tocolor(ctrans.apply([255,255,255,0.0]));
	ctx.fill("evenodd");
	ctx.save();
	ctx.clip();
	ctx.transform(0.033935546875,0,0,0.033935546875,3342,1833);
	var grd=ctx.createRadialGradient(0.0,0,0,0,0,16384);
	grd.addColorStop(0.35294117647058826,tocolor(ctrans.apply([255,255,255,0.0])));
	grd.addColorStop(0.8588235294117647,tocolor(ctrans.apply([136,233,255,0.68235296])));
	grd.addColorStop(1.0,tocolor(ctrans.apply([255,255,255,0.0])));
	ctx.fillStyle = grd;
	ctx.fillRect(-16384,-16384,32768,32768);
	ctx.restore();
	var pathData="M 4541 2817 Q 4225 3132 3777 3132 3329 3132 3013 2817 2697 2500 2697 2052 2697 1603 3013 1288 3329 971 3777 971 4225 971 4541 1288 4857 1603 4858 2052 4857 2500 4541 2817";
	drawPath(ctx,pathData,false);
	ctx.fillStyle=tocolor(ctrans.apply([255,255,255,0.0]));
	ctx.fill("evenodd");
	ctx.save();
	ctx.clip();
	ctx.transform(0.0675201416015625,0,0,0.0675201416015625,3778,2033);
	var grd=ctx.createRadialGradient(0.0,0,0,0,0,16384);
	grd.addColorStop(0.8549019607843137,tocolor(ctrans.apply([255,255,255,0.0])));
	grd.addColorStop(0.9137254901960784,tocolor(ctrans.apply([187,196,255,0.68235296])));
	grd.addColorStop(1.0,tocolor(ctrans.apply([255,255,255,0.0])));
	ctx.fillStyle = grd;
	ctx.fillRect(-16384,-16384,32768,32768);
	ctx.restore();
	var pathData="M 2932 1474 Q 2932 1538 2887 1583 2842 1628 2778 1629 2714 1628 2669 1583 2623 1538 2624 1474 2623 1410 2669 1365 2714 1320 2778 1320 2842 1320 2887 1365 2932 1410 2932 1474";
	drawPath(ctx,pathData,false);
	ctx.fillStyle=tocolor(ctrans.apply([255,255,255,0.0]));
	ctx.fill("evenodd");
	ctx.save();
	ctx.clip();
	ctx.transform(0.0096435546875,0,0,0.0096435546875,2778,1471);
	var grd=ctx.createRadialGradient(0.0,0,0,0,0,16384);
	grd.addColorStop(0.23921568627450981,tocolor(ctrans.apply([0,102,255,1])));
	grd.addColorStop(0.49019607843137253,tocolor(ctrans.apply([136,233,255,0.68235296])));
	grd.addColorStop(0.6666666666666666,tocolor(ctrans.apply([120,217,255,1])));
	grd.addColorStop(1.0,tocolor(ctrans.apply([255,255,255,0.0])));
	ctx.fillStyle = grd;
	ctx.fillRect(-16384,-16384,32768,32768);
	ctx.restore();
	var pathData="M 652 454 Q 579 527 475 527 372 527 299 454 226 381 226 277 226 174 299 101 372 28 475 28 579 28 652 101 725 174 725 277 725 381 652 454";
	drawPath(ctx,pathData,false);
	ctx.fillStyle=tocolor(ctrans.apply([255,255,255,0.0]));
	ctx.fill("evenodd");
	ctx.save();
	ctx.clip();
	ctx.transform(0.015594482421875,0,0,0.015594482421875,475,273);
	var grd=ctx.createRadialGradient(0.0,0,0,0,0,16384);
	grd.addColorStop(0.8549019607843137,tocolor(ctrans.apply([255,255,255,0.0])));
	grd.addColorStop(0.9137254901960784,tocolor(ctrans.apply([187,196,255,0.68235296])));
	grd.addColorStop(1.0,tocolor(ctrans.apply([255,255,255,0.0])));
	ctx.fillStyle = grd;
	ctx.fillRect(-16384,-16384,32768,32768);
	ctx.restore();
	var pathData="M 686 305 Q 728 305 758 335 787 365 788 407 787 449 758 479 728 509 686 509 643 509 614 479 584 449 584 407 584 365 614 335 643 305 686 305";
	drawPath(ctx,pathData,false);
	ctx.fillStyle=tocolor(ctrans.apply([255,255,255,0.0]));
	ctx.fill("evenodd");
	ctx.save();
	ctx.clip();
	ctx.transform(0.006378173828125,0,0,0.006378173828125,685,405);
	var grd=ctx.createRadialGradient(0.0,0,0,0,0,16384);
	grd.addColorStop(0.35294117647058826,tocolor(ctrans.apply([255,255,255,0.0])));
	grd.addColorStop(0.8588235294117647,tocolor(ctrans.apply([102,255,124,0.68235296])));
	grd.addColorStop(1.0,tocolor(ctrans.apply([255,255,255,0.0])));
	ctx.fillStyle = grd;
	ctx.fillRect(-16384,-16384,32768,32768);
	ctx.restore();
}

function shape115(ctx,ctrans,frame,ratio,time){
	var pathData="M 875 502 L 954 1106 376 995 -316 134 -294 -362 93 -258 875 502 M 1045 1223 L 1498 1345 2411 2233 2505 2940 1828 2810 1019 1803 1045 1223 M -1415 -1690 L -1085 -1601 -420 -954 -352 -439 -844 -533 -1434 -1267 -1415 -1690 M -2504 -2553 L -2487 -2939 -2186 -2858 -1578 -2267 -1516 -1797 -1966 -1883 -2504 -2553";
	ctx.fillStyle=tocolor(ctrans.apply([255,255,255,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
}

function sprite116(ctx,ctrans,frame,ratio,time){
	var clips = [];
	var frame_cnt = 195;
	frame = frame % frame_cnt;
	switch(frame){
		case 0:
			place("shape114",sunny_canvas,ctx,[0.658721923828125,-0.22454833984375,0.22454833984375,0.658721923828125,49.0,80.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,177)),1,0,0,time);
			place("shape115",sunny_canvas,ctx,[0.777740478515625,-0.62603759765625,0.62603759765625,0.777740478515625,4218.0,1193.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,51)),1,0,0,time);
			break;
		case 1:
			place("shape114",sunny_canvas,ctx,[0.6713714599609375,-0.2092742919921875,0.2092742919921875,0.6713714599609375,48.0,79.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,179)),1,0,0,time);
			place("shape115",sunny_canvas,ctx,[0.7897796630859375,-0.6080780029296875,0.6080780029296875,0.7897796630859375,4194.0,1274.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,51)),1,0,0,time);
			break;
		case 2:
			place("shape114",sunny_canvas,ctx,[0.68359375,-0.196319580078125,0.196319580078125,0.68359375,49.0,80.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,181)),1,0,0,time);
			place("shape115",sunny_canvas,ctx,[0.8028564453125,-0.5906524658203125,0.5906524658203125,0.8028564453125,4175.0,1357.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,52)),1,0,0,time);
			break;
		case 3:
			place("shape114",sunny_canvas,ctx,[0.6961822509765625,-0.1806793212890625,0.1806793212890625,0.6961822509765625,48.0,80.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,183)),1,0,0,time);
			place("shape115",sunny_canvas,ctx,[0.8155670166015625,-0.5729827880859375,0.5729827880859375,0.8155670166015625,4154.0,1438.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,52)),1,0,0,time);
			break;
		case 4:
			place("shape114",sunny_canvas,ctx,[0.7078094482421875,-0.1668243408203125,0.1668243408203125,0.7078094482421875,49.0,80.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,185)),1,0,0,time);
			place("shape115",sunny_canvas,ctx,[0.827850341796875,-0.555023193359375,0.555023193359375,0.827850341796875,4132.0,1519.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,52)),1,0,0,time);
			break;
		case 5:
			place("shape114",sunny_canvas,ctx,[0.7197113037109375,-0.1501922607421875,0.1501922607421875,0.7197113037109375,48.0,79.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,187)),1,0,0,time);
			place("shape115",sunny_canvas,ctx,[0.8397674560546875,-0.53680419921875,0.53680419921875,0.8397674560546875,4107.0,1600.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,53)),1,0,0,time);
			break;
		case 6:
			place("shape114",sunny_canvas,ctx,[0.7312164306640625,-0.1330413818359375,0.1330413818359375,0.7312164306640625,48.0,80.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,189)),1,0,0,time);
			place("shape115",sunny_canvas,ctx,[0.851287841796875,-0.518341064453125,0.518341064453125,0.851287841796875,4082.0,1680.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,53)),1,0,0,time);
			break;
		case 7:
			place("shape114",sunny_canvas,ctx,[0.7419586181640625,-0.1178436279296875,0.1178436279296875,0.7419586181640625,47.0,80.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,192)),1,0,0,time);
			place("shape115",sunny_canvas,ctx,[0.8623809814453125,-0.4996185302734375,0.4996185302734375,0.8623809814453125,4054.0,1761.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,53)),1,0,0,time);
			break;
		case 8:
			place("shape114",sunny_canvas,ctx,[0.752655029296875,-0.0997772216796875,0.0997772216796875,0.752655029296875,48.0,80.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,194)),1,0,0,time);
			place("shape115",sunny_canvas,ctx,[0.8730926513671875,-0.480682373046875,0.480682373046875,0.8730926513671875,4024.0,1840.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,54)),1,0,0,time);
			break;
		case 9:
			place("shape114",sunny_canvas,ctx,[0.762664794921875,-0.0837249755859375,0.0837249755859375,0.762664794921875,49.0,81.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,196)),1,0,0,time);
			place("shape115",sunny_canvas,ctx,[0.8833770751953125,-0.4615020751953125,0.4615020751953125,0.8833770751953125,3993.0,1918.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,54)),1,0,0,time);
			break;
		case 10:
			place("shape114",sunny_canvas,ctx,[0.772552490234375,-0.0647430419921875,0.0647430419921875,0.772552490234375,48.0,79.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,198)),1,0,0,time);
			place("shape115",sunny_canvas,ctx,[0.8932342529296875,-0.442108154296875,0.442108154296875,0.8932342529296875,3960.0,1996.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,54)),1,0,0,time);
			break;
		case 11:
			place("shape114",sunny_canvas,ctx,[0.7818145751953125,-0.0478668212890625,0.0478668212890625,0.7818145751953125,48.0,80.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,200)),1,0,0,time);
			place("shape115",sunny_canvas,ctx,[0.902679443359375,-0.422515869140625,0.422515869140625,0.902679443359375,3925.0,2073.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,55)),1,0,0,time);
			break;
		case 12:
			place("shape114",sunny_canvas,ctx,[0.790802001953125,-0.0280303955078125,0.0280303955078125,0.790802001953125,48.0,80.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,202)),1,0,0,time);
			place("shape115",sunny_canvas,ctx,[0.9116973876953125,-0.4026947021484375,0.4026947021484375,0.9116973876953125,3889.0,2149.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,55)),1,0,0,time);
			break;
		case 13:
			place("shape114",sunny_canvas,ctx,[0.7992706298828125,-0.0077667236328125,0.0077667236328125,0.7992706298828125,48.0,79.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,204)),1,0,0,time);
			place("shape115",sunny_canvas,ctx,[0.9202423095703125,-0.382720947265625,0.382720947265625,0.9202423095703125,3850.0,2223.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,55)),1,0,0,time);
			break;
		case 14:
			place("shape114",sunny_canvas,ctx,[0.8072357177734375,0.00762939453125,-0.00762939453125,0.8072357177734375,49.0,80.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,206)),1,0,0,time);
			place("shape115",sunny_canvas,ctx,[0.92840576171875,-0.362548828125,0.362548828125,0.92840576171875,3811.0,2298.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,56)),1,0,0,time);
			break;
		case 15:
			place("shape114",sunny_canvas,ctx,[0.8146514892578125,0.0286712646484375,-0.0286712646484375,0.8146514892578125,50.0,79.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,208)),1,0,0,time);
			place("shape115",sunny_canvas,ctx,[0.936126708984375,-0.3422088623046875,0.3422088623046875,0.936126708984375,3769.0,2373.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,56)),1,0,0,time);
			break;
		case 16:
			place("shape114",sunny_canvas,ctx,[0.821685791015625,0.04736328125,-0.04736328125,0.821685791015625,48.0,80.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,210)),1,0,0,time);
			place("shape115",sunny_canvas,ctx,[0.943359375,-0.32171630859375,0.32171630859375,0.943359375,3727.0,2445.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,56)),1,0,0,time);
			break;
		case 17:
			place("shape114",sunny_canvas,ctx,[0.828033447265625,0.0691375732421875,-0.0691375732421875,0.828033447265625,49.0,79.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,212)),1,0,0,time);
			place("shape115",sunny_canvas,ctx,[0.94915771484375,-0.30413818359375,0.30413818359375,0.94915771484375,3689.0,2506.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,57)),1,0,0,time);
			break;
		case 18:
			place("shape114",sunny_canvas,ctx,[0.834136962890625,0.0885772705078125,-0.0885772705078125,0.834136962890625,49.0,79.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,214)),1,0,0,time);
			place("shape115",sunny_canvas,ctx,[0.955596923828125,-0.2834014892578125,0.2834014892578125,0.955596923828125,3644.0,2578.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,57)),1,0,0,time);
			break;
		case 19:
			place("shape114",sunny_canvas,ctx,[0.8394012451171875,0.11102294921875,-0.11102294921875,0.8394012451171875,49.0,79.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,217)),1,0,0,time);
			place("shape115",sunny_canvas,ctx,[0.9615631103515625,-0.2624969482421875,0.2624969482421875,0.9615631103515625,3597.0,2647.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,58)),1,0,0,time);
			break;
		case 20:
			place("shape114",sunny_canvas,ctx,[0.8440399169921875,0.133819580078125,-0.133819580078125,0.8440399169921875,48.0,79.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,219)),1,0,0,time);
			place("shape115",sunny_canvas,ctx,[0.96710205078125,-0.2414703369140625,0.2414703369140625,0.96710205078125,3547.0,2716.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,58)),1,0,0,time);
			break;
		case 21:
			place("shape114",sunny_canvas,ctx,[0.8485870361328125,0.1541595458984375,-0.1541595458984375,0.8485870361328125,48.0,80.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,221)),1,0,0,time);
			place("shape115",sunny_canvas,ctx,[0.972137451171875,-0.2203369140625,0.2203369140625,0.972137451171875,3498.0,2784.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,58)),1,0,0,time);
			break;
		case 22:
			place("shape114",sunny_canvas,ctx,[0.85205078125,0.1775360107421875,-0.1775360107421875,0.85205078125,49.0,79.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,223)),1,0,0,time);
			place("shape115",sunny_canvas,ctx,[0.9767303466796875,-0.1990966796875,0.1990966796875,0.9767303466796875,3446.0,2851.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,59)),1,0,0,time);
			break;
		case 23:
			place("shape114",sunny_canvas,ctx,[0.85552978515625,0.1984405517578125,-0.1984405517578125,0.85552978515625,50.0,80.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,225)),1,0,0,time);
			place("shape115",sunny_canvas,ctx,[0.9808502197265625,-0.1777801513671875,0.1777801513671875,0.9808502197265625,3394.0,2916.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,59)),1,0,0,time);
			break;
		case 24:
			place("shape114",sunny_canvas,ctx,[0.8577728271484375,0.2223663330078125,-0.2223663330078125,0.8577728271484375,48.0,79.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,227)),1,0,0,time);
			place("shape115",sunny_canvas,ctx,[0.9845428466796875,-0.156341552734375,0.156341552734375,0.9845428466796875,3339.0,2982.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,59)),1,0,0,time);
			break;
		case 25:
			place("shape114",sunny_canvas,ctx,[0.8601531982421875,0.2437286376953125,-0.2437286376953125,0.8601531982421875,49.0,81.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,229)),1,0,0,time);
			place("shape115",sunny_canvas,ctx,[0.98773193359375,-0.13482666015625,0.13482666015625,0.98773193359375,3282.0,3044.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,60)),1,0,0,time);
			break;
		case 26:
			place("shape114",sunny_canvas,ctx,[0.861114501953125,0.2681427001953125,-0.2681427001953125,0.861114501953125,48.0,79.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,231)),1,0,0,time);
			place("shape115",sunny_canvas,ctx,[0.9904632568359375,-0.113311767578125,0.113311767578125,0.9904632568359375,3225.0,3106.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,60)),1,0,0,time);
			break;
		case 27:
			place("shape114",sunny_canvas,ctx,[0.8613739013671875,0.29278564453125,-0.29278564453125,0.8613739013671875,49.0,79.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,233)),1,0,0,time);
			place("shape115",sunny_canvas,ctx,[0.992706298828125,-0.091705322265625,0.091705322265625,0.992706298828125,3167.0,3167.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,60)),1,0,0,time);
			break;
		case 28:
			place("shape114",sunny_canvas,ctx,[0.8620147705078125,0.3147735595703125,-0.3147735595703125,0.8620147705078125,48.0,79.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,235)),1,0,0,time);
			place("shape115",sunny_canvas,ctx,[0.9945220947265625,-0.0700531005859375,0.0700531005859375,0.9945220947265625,3107.0,3226.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,61)),1,0,0,time);
			break;
		case 29:
			place("shape114",sunny_canvas,ctx,[0.8609466552734375,0.3397674560546875,-0.3397674560546875,0.8609466552734375,49.0,80.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,237)),1,0,0,time);
			place("shape115",sunny_canvas,ctx,[0.995849609375,-0.04840087890625,0.04840087890625,0.995849609375,3047.0,3284.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,61)),1,0,0,time);
			break;
		case 30:
			place("shape114",sunny_canvas,ctx,[0.8603515625,0.36212158203125,-0.36212158203125,0.8603515625,49.0,80.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,239)),1,0,0,time);
			place("shape115",sunny_canvas,ctx,[0.9966583251953125,-0.0266876220703125,0.0266876220703125,0.9966583251953125,2984.0,3340.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,61)),1,0,0,time);
			break;
		case 31:
			place("shape114",sunny_canvas,ctx,[0.85791015625,0.38739013671875,-0.38739013671875,0.85791015625,49.0,79.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,241)),1,0,0,time);
			place("shape115",sunny_canvas,ctx,[0.997039794921875,-0.004974365234375,0.004974365234375,0.997039794921875,2920.0,3396.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,62)),1,0,0,time);
			break;
		case 32:
			place("shape114",sunny_canvas,ctx,[0.85614013671875,0.410003662109375,-0.410003662109375,0.85614013671875,49.0,79.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,244)),1,0,0,time);
			place("shape115",sunny_canvas,ctx,[0.99688720703125,0.013458251953125,-0.013458251953125,0.99688720703125,2865.0,3441.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,62)),1,0,0,time);
			break;
		case 33:
			place("shape114",sunny_canvas,ctx,[0.8523101806640625,0.435546875,-0.435546875,0.8523101806640625,49.0,79.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,246)),1,0,0,time);
			place("shape115",sunny_canvas,ctx,[0.9962310791015625,0.0351715087890625,-0.0351715087890625,0.9962310791015625,2799.0,3493.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,62)),1,0,0,time);
			break;
		case 34:
			place("shape114",sunny_canvas,ctx,[0.8477325439453125,0.46112060546875,-0.46112060546875,0.8477325439453125,49.0,79.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,248)),1,0,0,time);
			place("shape115",sunny_canvas,ctx,[0.9951324462890625,0.0568389892578125,-0.0568389892578125,0.9951324462890625,2731.0,3544.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,63)),1,0,0,time);
			break;
		case 35:
			place("shape114",sunny_canvas,ctx,[0.8440093994140625,0.4840087890625,-0.4840087890625,0.8440093994140625,49.0,79.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,250)),1,0,0,time);
			place("shape115",sunny_canvas,ctx,[0.9935455322265625,0.0785064697265625,-0.0785064697265625,0.9935455322265625,2664.0,3593.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,63)),1,0,0,time);
			break;
		case 36:
			place("shape114",sunny_canvas,ctx,[0.8379974365234375,0.50970458984375,-0.50970458984375,0.8379974365234375,48.0,79.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,252)),1,0,0,time);
			place("shape115",sunny_canvas,ctx,[0.9915008544921875,0.1001129150390625,-0.1001129150390625,0.9915008544921875,2594.0,3641.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,63)),1,0,0,time);
			break;
		case 37:
			place("shape114",sunny_canvas,ctx,[0.832977294921875,0.53271484375,-0.53271484375,0.832977294921875,48.0,79.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,254)),1,0,0,time);
			place("shape115",sunny_canvas,ctx,[0.9889678955078125,0.121673583984375,-0.121673583984375,0.9889678955078125,2523.0,3688.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,64)),1,0,0,time);
			break;
		case 38:
			place("shape114",sunny_canvas,ctx,[0.8267974853515625,0.55926513671875,-0.55926513671875,0.8267974853515625,49.0,80.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,256)),1,0,0,time);
			place("shape115",sunny_canvas,ctx,[0.9863739013671875,0.1436309814453125,-0.1436309814453125,0.9863739013671875,2452.0,3736.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,64)),1,0,0,time);
			break;
		case 39:
			place("shape114",sunny_canvas,ctx,[0.8180999755859375,0.56915283203125,-0.56915283203125,0.8180999755859375,49.0,81.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,240)),1,0,0,time);
			place("shape115",sunny_canvas,ctx,[0.9831085205078125,0.16058349609375,-0.16058349609375,0.9831085205078125,2394.0,3767.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,60)),1,0,0,time);
			break;
		case 40:
			place("shape114",sunny_canvas,ctx,[0.810546875,0.5797576904296875,-0.5797576904296875,0.810546875,48.0,80.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,224)),1,0,0,time);
			place("shape115",sunny_canvas,ctx,[0.979949951171875,0.177886962890625,-0.177886962890625,0.979949951171875,2336.0,3802.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,56)),1,0,0,time);
			break;
		case 41:
			place("shape114",sunny_canvas,ctx,[0.8028411865234375,0.5902557373046875,-0.5902557373046875,0.8028411865234375,48.0,80.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,208)),1,0,0,time);
			place("shape115",sunny_canvas,ctx,[0.976470947265625,0.195159912109375,-0.195159912109375,0.976470947265625,2276.0,3835.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,52)),1,0,0,time);
			break;
		case 42:
			place("shape114",sunny_canvas,ctx,[0.795013427734375,0.6006927490234375,-0.6006927490234375,0.795013427734375,48.0,81.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,192)),1,0,0,time);
			place("shape115",sunny_canvas,ctx,[0.972686767578125,0.21234130859375,-0.21234130859375,0.972686767578125,2214.0,3866.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,48)),1,0,0,time);
			break;
		case 43:
			place("shape114",sunny_canvas,ctx,[0.787078857421875,0.610992431640625,-0.610992431640625,0.787078857421875,48.0,80.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,176)),1,0,0,time);
			place("shape115",sunny_canvas,ctx,[0.9678802490234375,0.2326202392578125,-0.2326202392578125,0.9678802490234375,2142.0,3902.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,44)),1,0,0,time);
			break;
		case 44:
			place("shape114",sunny_canvas,ctx,[0.7810211181640625,0.6186370849609375,-0.6186370849609375,0.7810211181640625,49.0,81.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,160)),1,0,0,time);
			place("shape115",sunny_canvas,ctx,[0.96343994140625,0.249664306640625,-0.249664306640625,0.96343994140625,2080.0,3932.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,40)),1,0,0,time);
			break;
		case 45:
			place("shape114",sunny_canvas,ctx,[0.7728271484375,0.628753662109375,-0.628753662109375,0.7728271484375,48.0,81.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,144)),1,0,0,time);
			place("shape115",sunny_canvas,ctx,[0.958709716796875,0.2666015625,-0.2666015625,0.958709716796875,2018.0,3961.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,36)),1,0,0,time);
			break;
		case 46:
			place("shape114",sunny_canvas,ctx,[0.764495849609375,0.638763427734375,-0.638763427734375,0.764495849609375,48.0,80.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,128)),1,0,0,time);
			place("shape115",sunny_canvas,ctx,[0.95367431640625,0.283477783203125,-0.283477783203125,0.95367431640625,1955.0,3988.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,32)),1,0,0,time);
			break;
		case 47:
			place("shape114",sunny_canvas,ctx,[0.756072998046875,0.6486663818359375,-0.6486663818359375,0.756072998046875,49.0,80.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,112)),1,0,0,time);
			place("shape115",sunny_canvas,ctx,[0.9483489990234375,0.30023193359375,-0.30023193359375,0.9483489990234375,1892.0,4015.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,28)),1,0,0,time);
			break;
		case 48:
			place("shape114",sunny_canvas,ctx,[0.747467041015625,0.6584625244140625,-0.6584625244140625,0.747467041015625,49.0,80.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,96)),1,0,0,time);
			place("shape115",sunny_canvas,ctx,[0.9427032470703125,0.316925048828125,-0.316925048828125,0.9427032470703125,1827.0,4039.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,24)),1,0,0,time);
			break;
		case 49:
			place("shape114",sunny_canvas,ctx,[0.73876953125,0.66815185546875,-0.66815185546875,0.73876953125,47.0,80.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,80)),1,0,0,time);
			place("shape115",sunny_canvas,ctx,[0.9356842041015625,0.3365478515625,-0.3365478515625,0.9356842041015625,1751.0,4067.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,20)),1,0,0,time);
			break;
		case 50:
			place("shape114",sunny_canvas,ctx,[0.729949951171875,0.677734375,-0.677734375,0.729949951171875,48.0,80.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,64)),1,0,0,time);
			place("shape115",sunny_canvas,ctx,[0.929443359375,0.3529815673828125,-0.3529815673828125,0.929443359375,1687.0,4090.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,16)),1,0,0,time);
			break;
		case 51:
			place("shape114",sunny_canvas,ctx,[0.7209930419921875,0.687164306640625,-0.687164306640625,0.7209930419921875,48.0,81.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,48)),1,0,0,time);
			place("shape115",sunny_canvas,ctx,[0.9228668212890625,0.3693389892578125,-0.3693389892578125,0.9228668212890625,1622.0,4111.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,12)),1,0,0,time);
			break;
		case 52:
			place("shape114",sunny_canvas,ctx,[0.7119140625,0.696502685546875,-0.696502685546875,0.7119140625,49.0,81.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,32)),1,0,0,time);
			place("shape115",sunny_canvas,ctx,[0.9160614013671875,0.385528564453125,-0.385528564453125,0.9160614013671875,1558.0,4131.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,8)),1,0,0,time);
			break;
		case 53:
			place("shape114",sunny_canvas,ctx,[0.7027435302734375,0.705718994140625,-0.705718994140625,0.7027435302734375,48.0,79.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,16)),1,0,0,time);
			place("shape115",sunny_canvas,ctx,[0.908935546875,0.401580810546875,-0.401580810546875,0.908935546875,1491.0,4149.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,4)),1,0,0,time);
			break;
		case 54:
			place("shape114",sunny_canvas,ctx,[0.6948699951171875,0.7156982421875,-0.7156982421875,0.6948699951171875,49.0,80.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,0)),1,0,0,time);
			place("shape115",sunny_canvas,ctx,[0.901458740234375,0.4207763671875,-0.4207763671875,0.901458740234375,1415.0,4177.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,0)),1,0,0,time);
			break;
		case 55:
			place("shape114",sunny_canvas,ctx,[0.6903076171875,0.6990509033203125,-0.6990509033203125,0.6903076171875,49.0,79.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,7)),1,0,0,time);
			break;
		case 56:
			place("shape114",sunny_canvas,ctx,[0.6869964599609375,0.68341064453125,-0.68341064453125,0.6869964599609375,49.0,80.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,14)),1,0,0,time);
			break;
		case 57:
			place("shape114",sunny_canvas,ctx,[0.685638427734375,0.665679931640625,-0.665679931640625,0.685638427734375,49.0,81.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,21)),1,0,0,time);
			break;
		case 58:
			place("shape114",sunny_canvas,ctx,[0.6818084716796875,0.6502532958984375,-0.6502532958984375,0.6818084716796875,49.0,80.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,28)),1,0,0,time);
			break;
		case 59:
			place("shape114",sunny_canvas,ctx,[0.67779541015625,0.634979248046875,-0.634979248046875,0.67779541015625,50.0,78.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,35)),1,0,0,time);
			break;
		case 60:
			place("shape114",sunny_canvas,ctx,[0.6735382080078125,0.619842529296875,-0.619842529296875,0.6735382080078125,49.0,79.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,42)),1,0,0,time);
			break;
		case 61:
			place("shape114",sunny_canvas,ctx,[0.6690673828125,0.604827880859375,-0.604827880859375,0.6690673828125,50.0,79.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,48)),1,0,0,time);
			break;
		case 62:
			place("shape114",sunny_canvas,ctx,[0.664398193359375,0.5899200439453125,-0.5899200439453125,0.664398193359375,50.0,80.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,55)),1,0,0,time);
			break;
		case 63:
			place("shape114",sunny_canvas,ctx,[0.659515380859375,0.575164794921875,-0.575164794921875,0.659515380859375,49.0,79.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,62)),1,0,0,time);
			break;
		case 64:
			place("shape114",sunny_canvas,ctx,[0.6544189453125,0.5605621337890625,-0.5605621337890625,0.6544189453125,49.0,80.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,69)),1,0,0,time);
			break;
		case 65:
			place("shape114",sunny_canvas,ctx,[0.6508941650390625,0.5438995361328125,-0.5438995361328125,0.6508941650390625,49.0,80.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,76)),1,0,0,time);
			break;
		case 66:
			place("shape114",sunny_canvas,ctx,[0.64532470703125,0.5295867919921875,-0.5295867919921875,0.64532470703125,50.0,79.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,83)),1,0,0,time);
			break;
		case 67:
			place("shape114",sunny_canvas,ctx,[0.63958740234375,0.5154266357421875,-0.5154266357421875,0.63958740234375,49.0,79.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,90)),1,0,0,time);
			break;
		case 68:
			place("shape114",sunny_canvas,ctx,[0.63360595703125,0.501373291015625,-0.501373291015625,0.63360595703125,49.0,80.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,97)),1,0,0,time);
			break;
		case 69:
			place("shape114",sunny_canvas,ctx,[0.6274566650390625,0.48748779296875,-0.48748779296875,0.6274566650390625,49.0,80.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,104)),1,0,0,time);
			break;
		case 70:
			place("shape114",sunny_canvas,ctx,[0.6211090087890625,0.4737548828125,-0.4737548828125,0.6211090087890625,49.0,79.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,111)),1,0,0,time);
			break;
		case 71:
			place("shape114",sunny_canvas,ctx,[0.6145477294921875,0.4601593017578125,-0.4601593017578125,0.6145477294921875,49.0,80.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,118)),1,0,0,time);
			break;
		case 72:
			place("shape114",sunny_canvas,ctx,[0.609283447265625,0.444732666015625,-0.444732666015625,0.609283447265625,49.0,80.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,125)),1,0,0,time);
			break;
		case 73:
			place("shape114",sunny_canvas,ctx,[0.6023101806640625,0.4314727783203125,-0.4314727783203125,0.6023101806640625,50.0,79.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,131)),1,0,0,time);
			break;
		case 74:
			place("shape114",sunny_canvas,ctx,[0.59515380859375,0.4183807373046875,-0.4183807373046875,0.59515380859375,49.0,80.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,138)),1,0,0,time);
			break;
		case 75:
			place("shape114",sunny_canvas,ctx,[0.587799072265625,0.40545654296875,-0.40545654296875,0.587799072265625,49.0,80.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,145)),1,0,0,time);
			break;
		case 76:
			place("shape114",sunny_canvas,ctx,[0.5802764892578125,0.3926849365234375,-0.3926849365234375,0.5802764892578125,48.0,80.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,152)),1,0,0,time);
			break;
		case 77:
			place("shape114",sunny_canvas,ctx,[0.57257080078125,0.3800811767578125,-0.3800811767578125,0.57257080078125,50.0,80.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,159)),1,0,0,time);
			break;
		case 78:
			place("shape114",sunny_canvas,ctx,[0.564697265625,0.3676605224609375,-0.3676605224609375,0.564697265625,49.0,80.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,166)),1,0,0,time);
			break;
		case 79:
			place("shape114",sunny_canvas,ctx,[0.556640625,0.3553924560546875,-0.3553924560546875,0.556640625,50.0,80.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,173)),1,0,0,time);
			break;
		case 80:
			place("shape114",sunny_canvas,ctx,[0.549530029296875,0.3415069580078125,-0.3415069580078125,0.549530029296875,49.0,78.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,180)),1,0,0,time);
			break;
		case 81:
			place("shape114",sunny_canvas,ctx,[0.5410919189453125,0.329620361328125,-0.329620361328125,0.5410919189453125,50.0,80.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,187)),1,0,0,time);
			break;
		case 82:
			place("shape114",sunny_canvas,ctx,[0.5324554443359375,0.3179168701171875,-0.3179168701171875,0.5324554443359375,49.0,80.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,194)),1,0,0,time);
			break;
		case 83:
			place("shape114",sunny_canvas,ctx,[0.523681640625,0.306396484375,-0.306396484375,0.523681640625,50.0,80.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,201)),1,0,0,time);
			break;
		case 84:
			place("shape114",sunny_canvas,ctx,[0.5147705078125,0.2950592041015625,-0.2950592041015625,0.5147705078125,48.0,81.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,208)),1,0,0,time);
			break;
		case 85:
			place("shape114",sunny_canvas,ctx,[0.5056610107421875,0.283905029296875,-0.283905029296875,0.5056610107421875,49.0,81.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,214)),1,0,0,time);
			break;
		case 86:
			place("shape114",sunny_canvas,ctx,[0.496429443359375,0.272918701171875,-0.272918701171875,0.496429443359375,49.0,79.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,221)),1,0,0,time);
			break;
		case 87:
			place("shape114",sunny_canvas,ctx,[0.487884521484375,0.260528564453125,-0.260528564453125,0.487884521484375,50.0,79.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,228)),1,0,0,time);
			break;
		case 88:
			place("shape114",sunny_canvas,ctx,[0.478302001953125,0.249969482421875,-0.249969482421875,0.478302001953125,49.0,80.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,235)),1,0,0,time);
			break;
		case 89:
			place("shape114",sunny_canvas,ctx,[0.468536376953125,0.2395782470703125,-0.2395782470703125,0.468536376953125,49.0,80.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,242)),1,0,0,time);
			break;
		case 90:
			place("shape114",sunny_canvas,ctx,[0.4586639404296875,0.229400634765625,-0.229400634765625,0.4586639404296875,50.0,80.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,249)),1,0,0,time);
			break;
		case 91:
			place("shape114",sunny_canvas,ctx,[0.4490203857421875,0.2200927734375,-0.2200927734375,0.4490203857421875,49.0,80.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,256)),1,0,0,time);
			break;
		case 92:
			place("shape114",sunny_canvas,ctx,[0.45428466796875,0.2075042724609375,-0.2075042724609375,0.45428466796875,49.0,80.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,247)),1,0,0,time);
			break;
		case 93:
			place("shape114",sunny_canvas,ctx,[0.45965576171875,0.195404052734375,-0.195404052734375,0.45965576171875,49.0,79.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,238)),1,0,0,time);
			break;
		case 94:
			place("shape114",sunny_canvas,ctx,[0.465301513671875,0.181671142578125,-0.181671142578125,0.465301513671875,50.0,80.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,230)),1,0,0,time);
			break;
		case 95:
			place("shape114",sunny_canvas,ctx,[0.469970703125,0.1693115234375,-0.1693115234375,0.469970703125,50.0,79.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,221)),1,0,0,time);
			break;
		case 96:
			place("shape114",sunny_canvas,ctx,[0.47430419921875,0.156829833984375,-0.156829833984375,0.47430419921875,49.0,79.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,212)),1,0,0,time);
			break;
		case 97:
			place("shape114",sunny_canvas,ctx,[0.4783477783203125,0.1442413330078125,-0.1442413330078125,0.4783477783203125,49.0,79.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,203)),1,0,0,time);
			break;
		case 98:
			place("shape114",sunny_canvas,ctx,[0.4820098876953125,0.1315460205078125,-0.1315460205078125,0.4820098876953125,49.0,80.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,194)),1,0,0,time);
			break;
		case 99:
			place("shape114",sunny_canvas,ctx,[0.4857330322265625,0.1171875,-0.1171875,0.4857330322265625,49.0,78.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,185)),1,0,0,time);
			break;
		case 100:
			place("shape114",sunny_canvas,ctx,[0.4887237548828125,0.10430908203125,-0.10430908203125,0.4887237548828125,50.0,80.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,177)),1,0,0,time);
			break;
		case 101:
			place("shape114",sunny_canvas,ctx,[0.4913482666015625,0.0913848876953125,-0.0913848876953125,0.4913482666015625,48.0,80.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,168)),1,0,0,time);
			break;
		case 102:
			place("shape114",sunny_canvas,ctx,[0.493621826171875,0.078369140625,-0.078369140625,0.493621826171875,49.0,80.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,159)),1,0,0,time);
			break;
		case 103:
			place("shape114",sunny_canvas,ctx,[0.4955596923828125,0.0652923583984375,-0.0652923583984375,0.4955596923828125,50.0,79.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,150)),1,0,0,time);
			break;
		case 104:
			place("shape114",sunny_canvas,ctx,[0.4973297119140625,0.0505828857421875,-0.0505828857421875,0.4973297119140625,49.0,79.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,141)),1,0,0,time);
			break;
		case 105:
			place("shape114",sunny_canvas,ctx,[0.49853515625,0.03741455078125,-0.03741455078125,0.49853515625,49.0,79.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,132)),1,0,0,time);
			break;
		case 106:
			place("shape114",sunny_canvas,ctx,[0.4993896484375,0.0242462158203125,-0.0242462158203125,0.4993896484375,49.0,79.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,124)),1,0,0,time);
			break;
		case 107:
			place("shape114",sunny_canvas,ctx,[0.4998931884765625,0.0110626220703125,-0.0110626220703125,0.4998931884765625,49.0,79.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,115)),1,0,0,time);
			break;
		case 108:
			place("shape114",sunny_canvas,ctx,[0.50006103515625,-5.035400390625E-4,5.035400390625E-4,0.50006103515625,49.0,79.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,106)),1,0,0,time);
			break;
		case 109:
			place("shape114",sunny_canvas,ctx,[0.4997711181640625,-0.0153350830078125,0.0153350830078125,0.4997711181640625,48.0,79.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,97)),1,0,0,time);
			break;
		case 110:
			place("shape114",sunny_canvas,ctx,[0.4991607666015625,-0.028533935546875,0.028533935546875,0.4991607666015625,49.0,80.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,88)),1,0,0,time);
			break;
		case 111:
			place("shape114",sunny_canvas,ctx,[0.4981842041015625,-0.04168701171875,0.04168701171875,0.4981842041015625,49.0,80.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,79)),1,0,0,time);
			break;
		case 112:
			place("shape114",sunny_canvas,ctx,[0.4968719482421875,-0.0548248291015625,0.0548248291015625,0.4968719482421875,49.0,80.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,71)),1,0,0,time);
			break;
		case 113:
			place("shape114",sunny_canvas,ctx,[0.4951934814453125,-0.0679168701171875,0.0679168701171875,0.4951934814453125,50.0,79.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,62)),1,0,0,time);
			break;
		case 114:
			place("shape114",sunny_canvas,ctx,[0.492919921875,-0.0825958251953125,0.0825958251953125,0.492919921875,50.0,79.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,53)),1,0,0,time);
			break;
		case 115:
			place("shape114",sunny_canvas,ctx,[0.4905242919921875,-0.0955963134765625,0.0955963134765625,0.4905242919921875,49.0,79.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,44)),1,0,0,time);
			break;
		case 116:
			place("shape114",sunny_canvas,ctx,[0.48779296875,-0.1085205078125,0.1085205078125,0.48779296875,49.0,78.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,35)),1,0,0,time);
			break;
		case 117:
			place("shape114",sunny_canvas,ctx,[0.484710693359375,-0.1213531494140625,0.1213531494140625,0.484710693359375,49.0,79.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,26)),1,0,0,time);
			break;
		case 118:
			place("shape114",sunny_canvas,ctx,[0.4813079833984375,-0.1341094970703125,0.1341094970703125,0.4813079833984375,49.0,79.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,18)),1,0,0,time);
			break;
		case 119:
			place("shape114",sunny_canvas,ctx,[0.4770660400390625,-0.148345947265625,0.148345947265625,0.4770660400390625,50.0,78.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,9)),1,0,0,time);
			break;
		case 120:
			place("shape114",sunny_canvas,ctx,[1.125946044921875,-0.383819580078125,0.383819580078125,1.125946044921875,49.0,80.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,0)),1,0,0,time);
			break;
		case 121:
			break;
		case 122:
			break;
		case 123:
			break;
		case 124:
			break;
		case 125:
			break;
		case 126:
			break;
		case 127:
			break;
		case 128:
			break;
		case 129:
			break;
		case 130:
			break;
		case 131:
			break;
		case 132:
			break;
		case 133:
			break;
		case 134:
			break;
		case 135:
			break;
		case 136:
			break;
		case 137:
			break;
		case 138:
			break;
		case 139:
			break;
		case 140:
			break;
		case 141:
			break;
		case 142:
			break;
		case 143:
			break;
		case 144:
			break;
		case 145:
			break;
		case 146:
			break;
		case 147:
			break;
		case 148:
			break;
		case 149:
			break;
		case 150:
			break;
		case 151:
			break;
		case 152:
			break;
		case 153:
			break;
		case 154:
			break;
		case 155:
			break;
		case 156:
			break;
		case 157:
			break;
		case 158:
			break;
		case 159:
			break;
		case 160:
			break;
		case 161:
			break;
		case 162:
			break;
		case 163:
			break;
		case 164:
			break;
		case 165:
			break;
		case 166:
			break;
		case 167:
			break;
		case 168:
			break;
		case 169:
			break;
		case 170:
			break;
		case 171:
			break;
		case 172:
			break;
		case 173:
			break;
		case 174:
			break;
		case 175:
			break;
		case 176:
			break;
		case 177:
			break;
		case 178:
			break;
		case 179:
			break;
		case 180:
			break;
		case 181:
			break;
		case 182:
			break;
		case 183:
			break;
		case 184:
			break;
		case 185:
			break;
		case 186:
			break;
		case 187:
			break;
		case 188:
			break;
		case 189:
			break;
		case 190:
			break;
		case 191:
			break;
		case 192:
			break;
		case 193:
			break;
		case 194:
			break;
	}
}

function shape117(ctx,ctrans,frame,ratio,time){
	var pathData="M -4366 -3210 Q -4230 -3192 -4101 -3140 L -4095 -3239 Q -4091 -3270 -4072 -3293 -4051 -3320 -4019 -3324 L -3901 -3329 Q -3695 -3325 -3526 -3213 L -3456 -3168 Q -3310 -3076 -3143 -3015 -3101 -3000 -3073 -2969 -3001 -2888 -3081 -2840 -2986 -2787 -2901 -2700 -2881 -2680 -2875 -2656 L -2871 -2620 Q -2871 -2565 -2902 -2521 -2930 -2479 -3000 -2457 -3021 -2450 -3032 -2434 L -3049 -2404 -3041 -2400 Q -2957 -2118 -2751 -1910 -2701 -1860 -2657 -1803 -2590 -1719 -2564 -1619 -2531 -1492 -2625 -1448 L -2661 -1440 Q -2566 -1327 -2536 -1181 -2517 -1086 -2600 -1081 L -2627 -1067 -2716 -994 Q -2794 -933 -2750 -855 -2741 -840 -2746 -821 -2766 -748 -2861 -745 -2995 -740 -3072 -633 -3081 -620 -3080 -600 -3073 -427 -2901 -380 -2868 -378 -2911 -331 -2931 -310 -2936 -279 -2963 -108 -2841 0 L -2651 171 Q -2641 180 -2641 200 -2639 413 -2427 496 -2391 510 -2357 535 -2273 599 -2244 695 -2231 740 -2196 775 -1988 986 -1735 1142 -1641 1200 -1559 1278 -1425 1407 -1254 1457 L -1161 1464 -1101 1460 Q -1236 1369 -1357 1236 -1445 1141 -1501 1060 -1481 1060 -1465 1068 -1401 1100 -1343 1143 L -1299 1177 -1261 1200 Q -1223 1167 -1255 1116 L -1281 1060 Q -1304 995 -1343 946 -1371 910 -1382 860 L -1401 780 Q -1334 808 -1271 840 -1251 850 -1232 873 L -1182 922 Q -1076 1002 -972 934 -951 920 -923 913 -911 910 -909 899 -903 868 -866 889 -831 910 -802 941 -711 1039 -603 977 L -557 945 Q -541 930 -501 933 -391 940 -282 932 L -221 920 Q -320 867 -349 757 -274 696 -196 729 L -43 785 Q 140 844 320 895 428 926 416 820 390 588 537 416 559 390 595 398 649 410 702 433 789 470 866 520 929 560 984 615 1043 672 1016 759 969 913 1056 1049 1089 1100 1141 1137 1229 1200 1332 1238 1419 1270 1503 1313 1597 1361 1637 1452 1649 1480 1677 1503 1750 1561 1697 1639 1709 1680 1737 1702 1821 1767 1917 1788 1929 1790 1939 1800 L 1917 1818 Q 1870 1850 1862 1881 1844 1950 1874 2003 L 1899 2060 Q 1750 2117 1597 2024 1494 1961 1382 1978 1369 1980 1366 2001 1343 2179 1519 2187 1591 2190 1657 2224 1689 2240 1719 2260 1818 2326 1867 2252 1960 2316 2079 2319 L 2123 2308 Q 2157 2290 2185 2312 L 2234 2348 2321 2417 Q 2683 2739 3160 2828 3278 2850 3398 2853 3695 2860 3976 2928 L 4160 2969 4277 2986 Q 4590 3019 4896 3088 L 5000 3113 Q 5087 3135 5178 3131 L 5218 3130 Q 5228 3130 5238 3140 5214 3162 5157 3176 5033 3207 4899 3226 L 4838 3230 4797 3228 Q 4718 3220 4639 3227 L 4558 3231 Q 4307 3237 4058 3231 4018 3230 3978 3232 3861 3238 3746 3229 L 3588 3207 3591 3189 Q 3257 3094 2960 2977 2639 2851 2319 2692 2082 2574 1836 2688 1854 2536 1670 2482 1454 2419 1328 2486 1316 2301 1055 2306 1259 2085 1138 1879 1344 1807 1306 1635 1240 1336 966 1351 938 1158 664 1065 441 990 273 1106 -178 1096 -95 1419 L -187 1431 Q -486 1469 -742 1299 -485 1679 -108 1649 -307 1730 -198 1931 -612 2118 -300 2389 -601 2325 -555 2606 -685 2540 -800 2452 -1113 2212 -1413 2017 -1597 1898 -1750 1741 -1713 1883 -1652 2028 L -1857 1846 Q -2106 1624 -2294 1356 L -2137 1397 -2308 1193 Q -2550 907 -2749 618 -2957 316 -3136 10 -3252 -188 -3343 -408 -3248 -299 -3144 -200 -3255 -409 -3324 -630 -3367 -769 -3394 -913 -3202 -854 -3092 -1147 -2826 -1283 -2999 -1595 -3156 -1878 -3398 -1755 -3268 -2016 -3466 -2151 -3378 -2245 -3422 -2423 -3470 -2617 -3661 -2631 -3583 -2798 -3733 -2905 -3951 -3059 -4185 -3009 -4213 -3053 -4247 -3094 -4303 -3161 -4366 -3210 M -938 2633 L -940 2637 -938 2633";
	ctx.fillStyle=tocolor(ctrans.apply([255,255,255,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 3588 3207 L 3515 3191 3418 3180 3039 3164 Q 2988 3160 2937 3144 2814 3107 2707 3036 2668 3010 2621 2993 2494 2947 2360 2932 2317 2928 2304 2952 2299 2960 2280 2964 2181 2983 2077 3012 L 1901 3066 Q 1859 3080 1820 3102 L 1759 3139 Q 1708 3172 1639 3161 1434 3129 1237 3172 L 1159 3178 838 3189 817 3183 Q 795 3169 769 3164 770 3182 777 3201 792 3243 759 3240 L 739 3239 Q 715 3236 679 3200 L 661 3222 Q 649 3240 638 3241 579 3245 537 3277 479 3323 400 3328 329 3333 283 3295 239 3260 202 3218 162 3173 99 3183 29 3193 -20 3158 -31 3150 -42 3149 -142 3136 -218 3077 -451 2899 -645 2683 -722 2598 -815 2532 L -908 2472 Q -1247 2271 -1564 2028 -1389 2171 -1256 2356 -1126 2536 -938 2633 L -940 2637 Q -1113 2560 -1284 2465 L -1334 2431 -1386 2385 -1436 2335 Q -1461 2310 -1489 2291 L -1759 2116 -1843 2064 Q -1963 1987 -2066 1885 L -2113 1834 Q -2238 1687 -2381 1540 L -2415 1496 Q -2431 1470 -2452 1453 -2561 1362 -2643 1241 -2671 1200 -2710 1172 -2838 1081 -2939 959 L -3117 738 -3105 728 Q -2968 903 -2780 1038 -2721 1080 -2673 1131 -2572 1237 -2441 1258 L -2421 1260 -2437 1238 -2467 1184 Q -2596 983 -2718 778 -2804 635 -2908 505 -3134 223 -3297 -102 L -3388 -276 Q -3490 -467 -3617 -643 -3651 -690 -3673 -743 -3703 -814 -3742 -838 L -3772 -866 -3791 -892 Q -3822 -932 -3882 -928 -3956 -923 -3993 -1004 -4001 -1020 -3992 -1027 -3928 -1073 -3958 -1141 -3971 -1170 -3987 -1196 -4168 -1482 -4281 -1800 -4291 -1780 -4290 -1761 -4284 -1689 -4321 -1640 -4370 -1703 -4400 -1780 -4433 -1867 -4519 -1889 -4591 -1907 -4614 -1982 -4653 -2110 -4741 -2220 -4761 -2220 -4768 -2230 -4812 -2286 -4863 -2338 -4967 -2446 -5059 -2562 -5081 -2590 -5084 -2622 -5091 -2698 -5124 -2758 -5141 -2790 -5165 -2817 -5255 -2917 -5234 -3059 -5231 -3080 -5233 -3099 -5244 -3204 -5141 -3195 -5091 -3190 -5050 -3165 -4947 -3100 -4840 -3063 -4803 -3050 -4790 -3083 -4753 -3181 -4643 -3209 L -4561 -3221 -4366 -3210 Q -4303 -3161 -4247 -3094 -4213 -3053 -4185 -3009 -3951 -3059 -3733 -2905 -3583 -2798 -3661 -2631 -3470 -2617 -3422 -2423 -3378 -2245 -3466 -2151 -3268 -2016 -3398 -1755 -3156 -1878 -2999 -1595 -2826 -1283 -3092 -1147 -3202 -854 -3394 -913 -3367 -769 -3324 -630 -3255 -409 -3144 -200 -3248 -299 -3343 -408 -3252 -188 -3136 10 -2957 316 -2749 618 -2550 907 -2308 1193 L -2137 1397 -2294 1356 Q -2106 1624 -1857 1846 L -1652 2028 Q -1713 1883 -1750 1741 -1597 1898 -1413 2017 -1113 2212 -800 2452 -685 2540 -555 2606 -601 2325 -300 2389 -612 2118 -198 1931 -307 1730 -108 1649 -485 1679 -742 1299 -486 1469 -187 1431 L -95 1419 Q -178 1096 273 1106 441 990 664 1065 938 1158 966 1351 1240 1336 1306 1635 1344 1807 1138 1879 1259 2085 1055 2306 1316 2301 1328 2486 1454 2419 1670 2482 1854 2536 1836 2688 2082 2574 2319 2692 2639 2851 2960 2977 3257 3094 3591 3189 L 3588 3207";
	ctx.fillStyle=tocolor(ctrans.apply([208,247,253,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
}

function shape118(ctx,ctrans,frame,ratio,time){
	var pathData="M -2630 -945 L -2648 -984 -2617 -951 Q -2524 -854 -2414 -772 L -2117 -548 Q -1856 -349 -1552 -235 L -1583 -261 Q -1628 -325 -1686 -381 L -1777 -469 Q -1902 -591 -2016 -732 L -2002 -754 Q -1949 -722 -1892 -695 -1687 -600 -1470 -536 L -1397 -589 Q -1352 -615 -1293 -608 -1272 -605 -1252 -595 -1323 -754 -1166 -845 L -1095 -882 Q -976 -937 -855 -887 -806 -866 -753 -878 L -696 -879 Q -632 -865 -578 -827 -489 -765 -512 -655 -392 -688 -259 -651 -202 -635 -153 -593 -132 -575 -109 -570 L -51 -569 Q 73 -587 167 -509 208 -475 225 -414 257 -304 168 -275 L 201 -245 250 -197 288 -155 Q 333 -269 402 -365 438 -415 495 -434 558 -455 627 -447 822 -425 909 -255 999 -79 916 89 908 105 910 125 920 201 849 228 L 734 267 752 280 Q 805 322 800 384 L 787 413 797 417 Q 976 497 1165 554 L 1371 616 1372 625 1008 640 856 631 856 621 853 630 610 603 Q 699 653 807 671 L 827 675 968 705 Q 1334 799 1708 817 1868 825 2028 817 2337 801 2643 754 L 2648 789 Q 2448 812 2270 909 2137 982 1988 984 L 1930 978 1769 942 Q 1576 904 1368 948 L 1289 944 839 929 724 890 Q 476 799 319 617 520 513 395 346 L 410 338 Q 503 287 478 193 375 -206 72 62 -25 -113 -182 -8 -96 -320 -431 -334 -463 -560 -734 -537 -1113 -505 -966 -235 -1214 -161 -1076 40 -1263 -18 -1410 -155 L -1266 58 Q -1576 20 -1845 -142 -2170 -337 -2392 -610 -2519 -765 -2617 -951 L -2630 -945 M 734 267 Q 661 221 628 285 L 705 275 734 267";
	ctx.fillStyle=tocolor(ctrans.apply([255,255,255,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 839 929 L 688 926 512 907 28 806 -72 791 Q -257 778 -434 711 L -566 653 Q -914 481 -1253 286 -1571 103 -1866 -103 -2035 -221 -2197 -349 -2334 -458 -2450 -597 -2482 -635 -2504 -679 L -2630 -945 -2617 -951 Q -2519 -765 -2392 -610 -2170 -337 -1845 -142 -1576 20 -1266 58 L -1410 -155 Q -1263 -18 -1076 40 -1214 -161 -966 -235 -1113 -505 -734 -537 -463 -560 -431 -334 -96 -320 -182 -8 -25 -113 72 62 375 -206 478 193 503 287 410 338 L 395 346 Q 520 513 319 617 476 799 724 890 L 839 929";
	ctx.fillStyle=tocolor(ctrans.apply([208,247,253,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
}

function shape119(ctx,ctrans,frame,ratio,time){
	var pathData="M 1497 -1094 Q 1666 -864 1760 -586 1853 -308 1854 0 1853 308 1760 586 1666 864 1497 1094 1326 1326 1094 1497 864 1666 586 1760 308 1853 0 1854 -308 1853 -586 1760 -864 1666 -1094 1497 -1326 1326 -1496 1094 -1666 864 -1760 586 -1853 308 -1853 0 -1853 -308 -1760 -586 -1666 -864 -1496 -1094 -1326 -1326 -1094 -1496 -864 -1666 -586 -1760 -308 -1853 0 -1853 308 -1853 586 -1760 864 -1666 1094 -1496 1326 -1326 1497 -1094";
	drawPath(ctx,pathData,false);
	ctx.fillStyle=tocolor(ctrans.apply([255,255,255,0.0]));
	ctx.fill("evenodd");
	ctx.save();
	ctx.clip();
	ctx.transform(0.0892333984375,0,0,0.0892333984375,0,0);
	var grd=ctx.createRadialGradient(0.0,0,0,0,0,16384);
	grd.addColorStop(0.5764705882352941,tocolor(ctrans.apply([255,255,255,1])));
	grd.addColorStop(0.6196078431372549,tocolor(ctrans.apply([255,255,255,0.5921569])));
	grd.addColorStop(1.0,tocolor(ctrans.apply([255,255,255,0.0])));
	ctx.fillStyle = grd;
	ctx.fillRect(-16384,-16384,32768,32768);
	ctx.restore();
	var pathData="M 793 -264 Q 834 -139 835 0 834 138 793 264 750 389 674 493 597 597 493 674 389 750 264 793 138 834 0 835 -139 834 -264 793 -390 750 -494 674 -598 597 -675 493 -751 389 -793 264 -835 138 -836 0 -835 -139 -793 -264 -751 -390 -675 -494 -598 -598 -494 -675 -390 -751 -264 -793 -139 -835 0 -836 138 -835 264 -793 389 -751 493 -675 597 -598 674 -494 750 -390 793 -264";
	drawPath(ctx,pathData,false);
	ctx.fillStyle=tocolor(ctrans.apply([254,226,33,1]));
	ctx.fill("evenodd");
	ctx.save();
	ctx.clip();
	ctx.transform(0.0518798828125,0,0,0.0518798828125,60,-120);
	var grd=ctx.createRadialGradient(0.0,0,0,0,0,16384);
	grd.addColorStop(0.0,tocolor(ctrans.apply([254,237,122,1])));
	grd.addColorStop(1.0,tocolor(ctrans.apply([254,226,33,1])));
	ctx.fillStyle = grd;
	ctx.fillRect(-16384,-16384,32768,32768);
	ctx.restore();
}

function shape120(ctx,ctrans,frame,ratio,time){
	var pathData="M -2644 138 Q -2648 79 -2600 18 -2583 -5 -2576 -43 L -2559 -82 Q -2517 -140 -2489 -198 L -2465 -228 Q -2409 -272 -2453 -336 -2472 -364 -2505 -378 -2575 -407 -2573 -484 -2572 -534 -2582 -584 -2592 -634 -2592 -684 -2592 -714 -2572 -734 -2532 -774 -2484 -806 L -2398 -856 -2362 -864 Q -2418 -947 -2443 -1044 -2497 -1257 -2317 -1397 L -2107 -1565 Q -2072 -1594 -2022 -1595 -1827 -1601 -1643 -1560 -1572 -1544 -1516 -1505 -1472 -1474 -1447 -1421 -1409 -1339 -1427 -1245 -1450 -1130 -1376 -1051 -1342 -1014 -1315 -968 -1278 -904 -1322 -844 -1352 -804 -1374 -760 -1382 -744 -1372 -734 -1352 -714 -1321 -712 L -1123 -697 Q -1051 -692 -999 -648 L -967 -619 Q -871 -747 -788 -896 -772 -924 -740 -939 -622 -992 -501 -948 -420 -919 -402 -844 -318 -908 -215 -995 -192 -1014 -162 -1022 -25 -1060 117 -1056 168 -1054 208 -1014 238 -984 259 -944 345 -782 240 -637 208 -594 159 -562 118 -535 78 -524 136 -500 183 -450 208 -424 218 -384 228 -344 248 -310 258 -294 279 -287 346 -264 409 -218 428 -204 457 -210 525 -224 584 -252 L 634 -254 681 -229 Q 787 -161 812 -305 829 -402 886 -478 L 918 -503 Q 1183 -625 1360 -406 1378 -384 1386 -360 L 1404 -285 Q 1408 -254 1403 -227 1398 -204 1376 -186 1338 -154 1318 -114 1308 -94 1326 -69 1435 83 1532 248 1548 276 1581 285 L 1657 291 1739 280 Q 1911 255 2042 372 2087 413 2154 422 2178 426 2199 455 2242 516 2207 581 2164 658 2114 728 2108 736 2124 748 2148 766 2179 772 2281 792 2257 896 2245 949 2299 945 2408 936 2518 942 2598 946 2668 978 2728 1006 2755 1066 2768 1096 2755 1135 L 2743 1170 Q 2864 1266 2997 1341 L 3039 1364 2917 1393 Q 2744 1438 2572 1423 L 2565 1422 2565 1419 Q 2430 1029 2065 897 1795 800 1814 1039 1666 1016 1491 1148 1539 1101 1536 1014 1525 719 1302 631 1314 529 1249 422 1032 65 676 274 413 430 496 685 364 699 276 656 43 541 -171 690 -133 657 -91 596 112 309 -50 117 92 -58 -20 -283 -142 -529 -412 -496 -803 -449 -557 -144 -751 -280 -969 -249 -1007 -337 -1077 -409 -1276 -615 -1548 -622 -1549 -665 -1567 -715 -1693 -1064 -1980 -861 -2341 -604 -1966 -332 -2324 -319 -2316 -39 -2542 -37 -2644 138";
	ctx.fillStyle=tocolor(ctrans.apply([255,255,255,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 2565 1422 Q 2472 1413 2380 1387 2063 1298 1740 1383 1578 1426 1420 1481 1059 1607 697 1520 L 419 1452 Q 268 1416 116 1406 -303 1377 -722 1415 -852 1426 -982 1422 -1296 1414 -1601 1482 -1719 1508 -1842 1496 L -2382 1467 -2522 1466 -2642 1471 Q -2692 1476 -2735 1494 -2866 1548 -3002 1596 -2876 1542 -2977 1469 -3022 1436 -3038 1388 -3042 1376 -3027 1353 -2948 1227 -2802 1236 L -2844 1198 Q -2882 1166 -2899 1126 -2932 1046 -2938 956 -2946 843 -2842 777 -2784 740 -2722 712 L -2757 608 Q -2782 526 -2757 444 -2742 396 -2694 370 -2652 346 -2606 327 -2538 299 -2581 255 -2639 198 -2644 138 -2542 -37 -2316 -39 -2324 -319 -1966 -332 -2341 -604 -1980 -861 -1693 -1064 -1567 -715 -1549 -665 -1548 -622 -1276 -615 -1077 -409 -1007 -337 -969 -249 -751 -280 -557 -144 -803 -449 -412 -496 -142 -529 -20 -283 92 -58 -50 117 112 309 -91 596 -133 657 -171 690 43 541 276 656 364 699 496 685 413 430 676 274 1032 65 1249 422 1314 529 1302 631 1525 719 1536 1014 1539 1101 1491 1148 1666 1016 1814 1039 1795 800 2065 897 2430 1029 2565 1419 L 2565 1422";
	ctx.fillStyle=tocolor(ctrans.apply([208,247,253,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
}

function shape121(ctx,ctrans,frame,ratio,time){
	var pathData="M 962 1486 L 961 1486 960 1486 Q 955 1467 962 1452 956 1430 958 1407 962 1372 958 1338 L 957 1323 955 1302 955 1301 953 1277 Q 951 1231 931 1211 L 896 1176 885 1164 885 1161 881 1154 879 1151 880 1151 882 1147 868 1134 860 1128 848 1125 831 1169 Q 910 1216 916 1250 L 921 1279 926 1300 936 1366 Q 939 1416 934 1507 L 932 1546 Q 929 1611 934 1704 L 936 1738 941 1743 942 1763 936 1757 938 1911 939 1937 940 2071 944 2074 945 2095 940 2089 938 2215 937 2272 942 2276 943 2299 937 2292 936 2425 945 2431 946 2449 937 2447 910 2436 Q 858 2409 803 2392 L 800 2391 Q 790 2389 798 2386 L 799 2385 783 2385 842 2433 Q 882 2468 937 2475 L 939 2596 945 2601 946 2621 940 2614 943 2713 Q 945 2800 954 2976 958 2964 965 2964 L 969 2962 968 2917 Q 966 2883 969 2863 L 965 2848 968 2546 967 2537 966 2530 966 2526 963 2419 Q 962 2345 967 2318 L 966 2310 Q 961 2220 964 2155 963 2094 965 2062 L 969 2014 967 1960 964 1869 Q 964 1823 967 1800 L 961 1740 959 1701 961 1674 959 1672 961 1603 962 1602 963 1598 962 1598 961 1594 957 1537 Q 953 1510 962 1486 M 1116 1316 L 1137 1347 1172 1448 Q 1176 1462 1188 1474 1220 1509 1276 1521 L 1294 1525 Q 1362 1543 1432 1541 L 1437 1540 Q 1371 1519 1309 1490 L 1281 1471 1281 1470 Q 1280 1486 1286 1501 L 1286 1503 1284 1509 Q 1272 1489 1275 1465 L 1241 1422 1234 1449 1224 1486 1223 1486 Q 1214 1448 1239 1419 L 1233 1409 Q 1217 1380 1192 1358 1183 1386 1181 1416 1175 1400 1178 1381 L 1178 1380 1178 1379 Q 1178 1364 1184 1352 1155 1329 1116 1316 M 1114 1313 L 1113 1314 1114 1313 M 1187 1359 L 1189 1356 1188 1354 1187 1359 M 821 1375 L 820 1374 810 1365 790 1358 Q 791 1370 782 1383 L 781 1384 787 1401 789 1413 793 1429 Q 797 1455 785 1474 L 784 1472 Q 788 1436 777 1402 L 772 1391 761 1397 741 1409 730 1413 Q 736 1456 726 1503 L 717 1508 717 1507 720 1496 719 1493 722 1426 721 1425 718 1419 Q 691 1429 667 1443 L 667 1448 666 1448 Q 662 1463 661 1477 L 648 1504 647 1503 655 1452 655 1451 657 1448 658 1448 657 1448 Q 602 1479 557 1519 L 555 1519 551 1525 695 1530 726 1531 Q 812 1515 825 1446 L 828 1427 824 1424 824 1423 823 1422 814 1379 814 1378 813 1370 815 1371 820 1374 821 1375 M 836 1666 L 835 1666 834 1666 836 1666 M 534 1923 L 540 1924 Q 610 1918 675 1894 L 694 1887 Q 748 1871 777 1833 L 790 1805 Q 798 1754 814 1702 L 833 1669 Q 795 1686 768 1710 776 1723 777 1738 L 778 1739 777 1740 Q 782 1758 777 1775 773 1745 761 1718 739 1742 724 1773 L 720 1783 Q 748 1809 743 1849 L 742 1849 728 1812 719 1787 689 1832 Q 694 1856 683 1877 L 682 1872 682 1870 684 1838 683 1839 657 1860 Q 599 1896 534 1923 M 793 1980 L 780 1974 758 1972 Q 763 1983 759 1997 L 759 1998 771 2012 775 2024 786 2039 Q 798 2062 793 2083 L 792 2081 Q 784 2045 761 2017 L 753 2008 744 2016 730 2033 720 2039 Q 741 2079 747 2125 L 741 2134 741 2133 739 2121 737 2118 717 2054 716 2053 709 2048 669 2084 672 2088 671 2089 677 2118 672 2146 671 2146 Q 670 2120 662 2095 L 662 2094 663 2091 662 2091 Q 620 2135 592 2184 L 590 2186 587 2192 Q 652 2162 728 2159 L 758 2153 Q 834 2115 823 2046 L 819 2028 814 2025 813 2024 Q 804 2002 789 1986 L 788 1985 784 1978 786 1978 792 1980 793 1980 M 827 2193 L 826 2192 825 2192 827 2193 M 526 2449 L 531 2451 Q 601 2445 666 2421 L 684 2414 Q 739 2396 769 2359 L 781 2332 Q 789 2280 806 2229 L 824 2195 Q 786 2212 759 2237 L 768 2264 768 2265 768 2266 Q 773 2283 769 2301 764 2272 752 2244 729 2268 716 2299 L 711 2308 Q 740 2335 734 2375 L 733 2376 719 2338 709 2313 680 2359 Q 686 2382 675 2403 L 673 2398 672 2397 675 2363 674 2364 649 2387 Q 589 2422 526 2449 M 797 2509 L 784 2502 763 2501 Q 767 2512 764 2526 L 763 2527 775 2541 780 2552 790 2568 Q 802 2591 797 2612 L 797 2610 Q 787 2574 766 2546 L 756 2537 748 2545 734 2562 725 2568 Q 745 2608 751 2654 L 746 2663 745 2661 744 2650 742 2647 721 2583 720 2582 714 2577 674 2613 676 2617 675 2618 681 2647 677 2675 676 2675 666 2624 665 2623 667 2620 666 2620 Q 624 2664 596 2713 L 595 2714 592 2721 Q 656 2690 732 2688 L 762 2681 Q 839 2644 827 2574 L 824 2557 817 2554 816 2553 Q 808 2531 792 2514 L 788 2506 791 2507 796 2509 797 2509 M 1108 2327 L 1107 2346 Q 1101 2416 1181 2446 L 1212 2449 Q 1287 2445 1355 2468 L 1351 2463 1350 2461 Q 1317 2414 1270 2375 L 1271 2378 1271 2379 1266 2431 1258 2403 1262 2374 1261 2373 1262 2369 Q 1242 2352 1219 2337 L 1213 2342 1212 2343 1198 2409 1196 2412 1197 2424 1196 2425 1189 2417 Q 1191 2371 1207 2329 L 1197 2324 1181 2308 1172 2301 1164 2311 Q 1146 2341 1140 2378 L 1140 2380 Q 1133 2359 1142 2335 L 1151 2319 1154 2307 1165 2292 1164 2291 Q 1160 2277 1163 2266 1151 2265 1142 2270 L 1130 2277 1131 2277 1136 2275 1138 2275 1135 2282 1134 2283 Q 1121 2300 1114 2323 L 1113 2324 1108 2327 M 995 2236 Q 1045 2223 1078 2187 L 1132 2135 1116 2135 1116 2136 1117 2136 Q 1125 2138 1115 2142 L 1113 2143 1112 2143 Q 1059 2164 1009 2197 L 997 2204 996 2208 995 2236 M 1119 1950 Q 1140 2000 1154 2051 1157 2064 1169 2077 1202 2111 1257 2123 L 1277 2127 Q 1344 2145 1415 2145 L 1420 2142 Q 1353 2122 1291 2093 L 1263 2073 1262 2072 Q 1262 2088 1268 2104 L 1268 2106 1267 2111 Q 1254 2091 1258 2067 L 1223 2025 Q 1218 2037 1216 2051 L 1206 2090 1206 2089 Q 1196 2050 1220 2021 L 1215 2011 Q 1199 1982 1173 1960 1165 1989 1162 2019 1157 2002 1159 1984 L 1159 1983 1159 1982 1165 1954 Q 1137 1932 1098 1919 L 1119 1950 M 1095 1916 L 1094 1917 1096 1916 1095 1916 M 1077 1737 L 1082 1755 Q 1102 1822 1189 1830 L 1220 1826 Q 1291 1802 1363 1807 L 1358 1802 1356 1802 Q 1307 1766 1250 1741 L 1249 1741 1251 1744 1252 1745 Q 1255 1770 1265 1794 L 1264 1795 1248 1770 1240 1741 1239 1736 1186 1718 1183 1724 1183 1725 Q 1184 1758 1192 1792 L 1192 1795 1196 1806 1196 1807 1187 1802 Q 1172 1757 1173 1713 L 1162 1710 1142 1701 1129 1696 1125 1707 Q 1118 1741 1125 1777 L 1125 1779 Q 1111 1762 1112 1736 L 1115 1718 1115 1706 1120 1689 1119 1688 Q 1109 1677 1109 1665 1097 1666 1089 1673 L 1080 1684 1081 1683 1085 1680 1087 1679 1087 1687 1087 1688 Q 1080 1709 1081 1731 L 1081 1732 1081 1733 1077 1737 M 994 1552 Q 1059 1568 1122 1541 L 1195 1510 1180 1506 1180 1507 Q 1187 1511 1176 1512 L 1174 1512 1173 1512 1055 1525 997 1528 994 1552 M 764 1715 L 766 1718 765 1713 764 1715 M 1170 1958 L 1169 1956 1168 1961 1170 1958 M 935 1912 L 887 1913 Q 827 1906 768 1911 L 765 1911 Q 754 1911 761 1907 L 762 1907 762 1906 747 1912 822 1935 937 1938 935 1912 M 757 2244 L 756 2239 755 2241 757 2244 M 937 2475 L 943 2476 937 2475";
	ctx.fillStyle=tocolor(ctrans.apply([51,153,0,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 1437 1540 L 1440 1541 1438 1540 1339 1449 1287 1399 Q 1255 1368 1215 1342 L 1180 1320 Q 1150 1304 1114 1313 L 1116 1316 1114 1313 1113 1314 1112 1315 1116 1316 Q 1155 1329 1184 1352 1178 1364 1178 1379 L 1178 1380 1178 1381 Q 1175 1400 1181 1416 1183 1386 1192 1358 1217 1380 1233 1409 L 1239 1419 Q 1214 1448 1223 1486 L 1224 1486 1234 1449 1241 1422 1275 1465 Q 1272 1489 1284 1509 L 1286 1503 1286 1501 Q 1280 1486 1281 1470 L 1281 1471 1309 1490 Q 1371 1519 1437 1540 L 1438 1540 1437 1540 M 1113 1314 L 1112 1315 1113 1314 M 1187 1359 L 1188 1354 1189 1356 1187 1359 M 790 1358 L 789 1357 787 1358 Q 763 1360 739 1372 615 1434 533 1528 L 543 1527 550 1526 551 1525 555 1519 557 1519 Q 602 1479 657 1448 L 658 1448 657 1448 655 1451 655 1452 647 1503 648 1504 661 1477 Q 662 1463 666 1448 L 667 1448 667 1443 Q 691 1429 718 1419 L 721 1425 722 1426 719 1493 720 1496 717 1507 717 1508 726 1503 Q 736 1456 730 1413 L 741 1409 761 1397 772 1391 777 1402 Q 788 1436 784 1472 L 785 1474 Q 797 1455 793 1429 L 789 1413 787 1401 781 1384 782 1383 Q 791 1370 790 1358 L 789 1358 787 1358 789 1358 790 1358 M 836 1667 L 836 1666 836 1667 836 1666 834 1666 835 1666 Q 798 1660 769 1679 L 737 1704 Q 699 1734 671 1768 L 624 1823 534 1923 532 1924 534 1923 Q 599 1896 657 1860 L 683 1839 684 1838 682 1870 682 1872 683 1877 Q 694 1856 689 1832 L 719 1787 728 1812 742 1849 743 1849 Q 748 1809 720 1783 L 724 1773 Q 739 1742 761 1718 773 1745 777 1775 782 1758 777 1740 L 778 1739 777 1738 Q 776 1723 768 1710 795 1686 833 1669 L 834 1666 833 1669 836 1667 M 758 1972 L 757 1971 756 1973 Q 732 1981 715 1998 618 2089 572 2200 L 580 2196 587 2193 587 2192 590 2186 592 2184 Q 620 2135 662 2091 L 663 2091 662 2094 662 2095 Q 670 2120 671 2146 L 672 2146 677 2118 671 2089 672 2088 669 2084 709 2048 716 2053 717 2054 737 2118 739 2121 741 2133 741 2134 747 2125 Q 741 2079 720 2039 L 730 2033 744 2016 753 2008 761 2017 Q 784 2045 792 2081 L 793 2083 Q 798 2062 786 2039 L 775 2024 771 2012 759 1998 759 1997 Q 763 1983 758 1972 L 756 1973 758 1972 M 826 2192 Q 788 2185 760 2206 L 727 2231 Q 690 2259 661 2294 L 616 2349 525 2449 523 2450 526 2449 Q 589 2422 649 2387 L 674 2364 675 2363 672 2397 673 2398 675 2403 Q 686 2382 680 2359 L 709 2313 719 2338 733 2376 734 2375 Q 740 2335 711 2308 L 716 2299 Q 729 2268 752 2244 764 2272 769 2301 773 2283 768 2266 L 768 2265 768 2264 759 2237 Q 786 2212 824 2195 L 827 2194 827 2193 825 2192 826 2192 M 936 2425 L 887 2384 804 2385 799 2384 799 2385 804 2385 799 2385 798 2386 Q 790 2389 800 2391 L 803 2392 Q 858 2409 910 2436 L 937 2447 946 2449 945 2431 936 2425 M 763 2501 L 762 2500 760 2502 Q 737 2510 719 2527 622 2618 575 2729 L 584 2725 591 2722 592 2721 595 2714 596 2713 Q 624 2664 666 2620 L 667 2620 665 2623 666 2624 676 2675 677 2675 681 2647 675 2618 676 2617 674 2613 714 2577 720 2582 721 2583 742 2647 744 2650 745 2661 746 2663 751 2654 Q 745 2608 725 2568 L 734 2562 748 2545 756 2537 766 2546 Q 787 2574 797 2610 L 797 2612 Q 802 2591 790 2568 L 780 2552 775 2541 763 2527 764 2526 Q 767 2512 763 2501 L 762 2501 760 2502 762 2501 763 2501 M 1355 2468 L 1355 2469 1363 2471 1372 2475 Q 1315 2368 1208 2287 1190 2272 1165 2266 L 1164 2265 1163 2266 1164 2266 1165 2266 1164 2266 1163 2266 Q 1160 2277 1164 2291 L 1165 2292 1154 2307 1151 2319 1142 2335 Q 1133 2359 1140 2380 L 1140 2378 Q 1146 2341 1164 2311 L 1172 2301 1181 2308 1197 2324 1207 2329 Q 1191 2371 1189 2417 L 1196 2425 1197 2424 1196 2412 1198 2409 1212 2343 1213 2342 1219 2337 Q 1242 2352 1262 2369 L 1261 2373 1262 2374 1258 2403 1266 2431 1271 2379 1271 2378 1270 2375 Q 1317 2414 1350 2461 L 1351 2463 1355 2468 1363 2471 1355 2468 M 1116 2135 L 1115 2135 1111 2136 1028 2143 997 2173 997 2200 997 2204 1009 2197 Q 1059 2164 1112 2143 L 1113 2143 1115 2142 Q 1125 2138 1117 2136 L 1116 2136 1116 2135 1111 2136 1116 2135 M 1420 2142 L 1422 2143 1420 2142 1320 2051 1269 2002 Q 1237 1970 1197 1945 L 1161 1923 Q 1132 1906 1095 1916 L 1096 1916 1094 1917 1093 1917 1094 1917 1093 1917 1093 1918 1098 1919 1096 1916 1098 1919 Q 1137 1932 1165 1954 L 1159 1982 1159 1983 1159 1984 Q 1157 2002 1162 2019 1165 1989 1173 1960 1199 1982 1215 2011 L 1220 2021 Q 1196 2050 1206 2089 L 1206 2090 1216 2051 Q 1218 2037 1223 2025 L 1258 2067 Q 1254 2091 1267 2111 L 1268 2106 1268 2104 Q 1262 2088 1262 2072 L 1263 2073 1291 2093 Q 1353 2122 1420 2142 M 1363 1807 L 1363 1808 1371 1808 1381 1809 Q 1290 1723 1160 1673 L 1112 1664 1109 1663 1109 1665 Q 1109 1677 1119 1688 L 1120 1689 1115 1706 1115 1718 1112 1736 Q 1111 1762 1125 1779 L 1125 1777 Q 1118 1741 1125 1707 L 1129 1696 1142 1701 1162 1710 1173 1713 Q 1172 1757 1187 1802 L 1196 1807 1196 1806 1192 1795 1192 1792 Q 1184 1758 1183 1725 L 1183 1724 1186 1718 1239 1736 1240 1741 1248 1770 1264 1795 1265 1794 Q 1255 1770 1252 1745 L 1251 1744 1249 1741 1250 1741 Q 1307 1766 1356 1802 L 1358 1802 1363 1807 1371 1808 1363 1807 M 1180 1506 L 1180 1505 1175 1505 1096 1482 998 1524 998 1526 997 1527 997 1528 998 1526 997 1528 1055 1525 1173 1512 1174 1512 1176 1512 Q 1187 1511 1180 1507 L 1180 1506 1175 1505 1180 1506 M 764 1715 L 765 1713 766 1718 764 1715 M 1112 1664 L 1109 1664 1109 1665 1109 1664 1112 1664 M 1170 1958 L 1168 1961 1169 1956 1170 1958 M 762 1906 L 762 1907 761 1907 Q 754 1911 765 1911 L 768 1911 Q 827 1906 887 1913 L 935 1912 935 1903 842 1873 766 1904 762 1905 762 1906 766 1904 762 1906 M 824 2195 L 825 2192 824 2195 M 525 2449 L 526 2449 525 2449 M 757 2244 L 755 2241 756 2239 757 2244 M 551 1525 L 543 1527 551 1525 M 587 2192 L 580 2196 587 2192 M 592 2721 L 584 2725 592 2721";
	ctx.fillStyle=tocolor(ctrans.apply([102,204,0,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 992 1456 Q 1012 1414 1058 1387 L 1117 1353 1137 1347 1116 1316 1112 1315 992 1420 979 1299 978 1299 975 1276 Q 964 1215 910 1164 L 886 1150 882 1147 886 1150 883 1148 882 1147 880 1151 879 1151 881 1154 885 1161 885 1164 896 1176 931 1211 Q 951 1231 953 1277 L 955 1301 955 1302 957 1323 958 1338 Q 962 1372 958 1407 956 1430 962 1452 955 1467 960 1486 L 961 1486 962 1486 992 1456 M 970 1439 L 979 1432 992 1420 979 1432 970 1439 M 825 1379 L 825 1378 824 1377 821 1375 825 1379 M 828 1427 L 845 1436 Q 838 1430 828 1426 L 824 1424 828 1427 828 1426 828 1427 M 837 1667 L 836 1667 837 1667 M 799 1982 L 798 1981 797 1980 793 1980 799 1982 M 819 2028 L 838 2032 819 2026 814 2025 819 2028 819 2026 819 2028 M 828 2194 L 827 2193 827 2194 828 2194 M 804 2511 L 802 2510 801 2510 797 2509 804 2511 M 824 2557 L 842 2561 824 2555 824 2557 824 2555 817 2554 824 2557 M 954 2976 Q 950 2991 953 3024 L 957 3035 954 2976 M 1007 3023 L 1008 3018 1005 3011 1007 3023 M 998 2720 L 997 2603 995 2566 993 2558 998 2710 998 2720 M 1089 2333 L 1108 2327 1108 2325 1089 2333 M 1130 2277 L 1125 2278 1124 2279 1123 2280 1130 2277 M 992 2335 L 995 2236 996 2208 997 2200 997 2173 999 2024 999 2022 995 2026 995 2028 995 2026 993 2028 995 2028 993 2171 995 2174 997 2173 995 2174 993 2171 993 2177 994 2177 992 2238 993 2249 992 2253 992 2335 M 1093 1917 L 1093 1918 1093 1917 M 995 2004 L 994 1929 995 2005 995 2004 M 1062 1747 L 1077 1737 1081 1733 1076 1735 1062 1747 M 1080 1684 Q 1078 1684 1077 1686 L 1076 1687 1075 1688 1080 1684 M 998 1526 L 998 1524 997 1527 998 1526 M 1076 1735 L 1077 1737 1076 1735 M 1113 2324 L 1108 2325 1108 2327 1113 2324 M 994 2176 L 993 2177 994 2176 994 2177 994 2176 995 2174 994 2176 M 993 2249 L 994 2243 995 2239 994 2236 995 2236 994 2236 992 2238 994 2236 995 2239 994 2243 993 2249";
	ctx.fillStyle=tocolor(ctrans.apply([0,102,0,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 992 1456 L 962 1486 Q 953 1510 957 1537 L 961 1594 962 1598 963 1598 962 1602 961 1603 959 1672 961 1674 959 1701 961 1740 967 1800 Q 964 1823 964 1869 L 967 1960 969 2014 965 2062 Q 963 2094 964 2155 961 2220 966 2310 L 967 2318 Q 962 2345 963 2419 L 966 2526 966 2530 967 2537 968 2546 965 2848 969 2863 Q 966 2883 968 2917 L 969 2962 965 2964 Q 958 2964 954 2976 L 957 3035 961 3039 969 3044 Q 987 3043 998 3032 L 1007 3023 1005 3011 1003 3009 1004 2991 1003 2943 1002 2917 1000 2875 996 2851 999 2812 998 2733 998 2720 998 2710 993 2558 989 2541 991 2484 991 2413 991 2405 991 2403 Q 1021 2368 1064 2344 L 1088 2333 1089 2333 1108 2325 1113 2324 1114 2323 Q 1121 2300 1134 2283 L 1135 2282 1138 2275 1136 2275 1131 2277 1130 2277 1123 2280 1103 2292 991 2382 987 2386 992 2335 992 2253 993 2249 992 2238 994 2177 993 2177 993 2171 995 2028 993 2028 995 2026 999 2022 Q 1015 2004 1039 1990 L 1099 1956 1119 1950 1098 1919 1093 1918 995 2004 995 2005 994 1929 994 1927 993 1902 991 1899 991 1875 988 1849 993 1838 Q 1008 1798 1041 1765 L 1061 1748 1062 1747 1076 1735 1081 1733 1081 1732 1081 1731 Q 1080 1709 1087 1688 L 1087 1687 1087 1679 1085 1680 1081 1683 1080 1684 1075 1688 1061 1705 991 1809 987 1816 989 1718 987 1700 989 1701 994 1552 997 1528 997 1527 998 1524 992 1456 M 934 1507 L 842 1394 825 1379 821 1375 820 1374 815 1371 813 1370 814 1378 814 1379 823 1422 824 1423 824 1424 828 1426 Q 838 1430 845 1436 L 846 1437 867 1452 Q 915 1492 932 1546 L 934 1507 M 936 1738 L 837 1667 836 1667 833 1669 814 1702 835 1706 898 1733 936 1757 942 1763 941 1743 936 1738 M 940 2071 L 821 1992 799 1982 793 1980 792 1980 786 1978 784 1978 788 1985 789 1986 Q 804 2002 813 2024 L 814 2025 819 2026 838 2032 839 2032 864 2040 Q 908 2058 940 2089 L 945 2095 944 2074 940 2071 M 937 2272 L 828 2194 827 2194 824 2195 806 2229 826 2232 889 2260 Q 917 2272 937 2292 L 943 2299 942 2276 937 2272 M 939 2596 L 825 2521 804 2511 797 2509 796 2509 791 2507 788 2506 792 2514 Q 808 2531 816 2553 L 817 2554 824 2555 842 2561 843 2561 868 2569 Q 909 2586 940 2614 L 946 2621 945 2601 939 2596 M 980 1826 L 987 1816 980 1826 M 984 1865 L 988 1849 984 1865 M 981 2017 L 995 2005 981 2017 M 982 2044 L 989 2033 993 2028 989 2033 982 2044 M 976 2426 L 982 2415 991 2405 982 2415 976 2426";
	ctx.fillStyle=tocolor(ctrans.apply([21,86,5,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 1137 1347 L 1117 1353 1058 1387 Q 1012 1414 992 1456 L 962 1486 M 882 1147 L 886 1150 910 1164 Q 964 1215 975 1276 L 978 1299 M 979 1299 L 992 1420 979 1432 970 1439 M 1116 1316 L 1137 1347 1172 1448 Q 1176 1462 1188 1474 1220 1509 1276 1521 L 1294 1525 Q 1362 1543 1432 1541 L 1437 1540 1438 1540 1339 1449 1287 1399 Q 1255 1368 1215 1342 L 1180 1320 Q 1150 1304 1114 1313 L 1113 1314 1112 1315 992 1420 M 1114 1313 L 1116 1316 M 882 1147 L 868 1134 860 1128 848 1125 831 1169 Q 910 1216 916 1250 L 921 1279 926 1300 936 1366 Q 939 1416 934 1507 L 842 1394 825 1379 821 1375 820 1374 810 1365 790 1358 789 1358 787 1358 Q 763 1360 739 1372 615 1434 533 1528 L 543 1527 551 1525 695 1530 726 1531 Q 812 1515 825 1446 L 828 1427 828 1426 Q 838 1430 845 1436 L 846 1437 867 1452 Q 915 1492 932 1546 929 1611 934 1704 M 936 1738 L 837 1667 836 1667 836 1666 835 1666 Q 798 1660 769 1679 L 737 1704 Q 699 1734 671 1768 L 624 1823 534 1923 540 1924 Q 610 1918 675 1894 L 694 1887 Q 748 1871 777 1833 L 790 1805 Q 798 1754 814 1702 L 835 1706 898 1733 936 1757 M 936 2425 L 887 2384 804 2385 799 2385 783 2385 842 2433 Q 882 2468 937 2475 L 943 2476 M 939 2596 L 825 2521 804 2511 797 2509 784 2502 763 2501 762 2501 760 2502 Q 737 2510 719 2527 622 2618 575 2729 L 584 2725 592 2721 Q 656 2690 732 2688 L 762 2681 Q 839 2644 827 2574 L 824 2557 824 2555 842 2561 843 2561 868 2569 Q 909 2586 940 2614 L 946 2621 M 1005 3011 L 1004 2991 1003 2943 998 2720 998 2710 993 2558 991 2403 Q 1021 2368 1064 2344 L 1088 2333 1089 2333 1108 2325 1113 2324 M 1108 2327 L 1107 2346 Q 1101 2416 1181 2446 L 1212 2449 Q 1287 2445 1355 2468 L 1363 2471 1372 2475 Q 1315 2368 1208 2287 1190 2272 1165 2266 L 1164 2266 1163 2266 Q 1151 2265 1142 2270 L 1130 2277 1123 2280 1103 2292 991 2382 992 2335 992 2253 993 2249 992 2238 994 2177 994 2176 995 2174 993 2171 995 2028 995 2026 999 2022 Q 1015 2004 1039 1990 L 1099 1956 1119 1950 Q 1140 2000 1154 2051 1157 2064 1169 2077 1202 2111 1257 2123 L 1277 2127 Q 1344 2145 1415 2145 L 1420 2142 1320 2051 1269 2002 Q 1237 1970 1197 1945 L 1161 1923 Q 1132 1906 1095 1916 L 1094 1917 1093 1917 1093 1918 995 2004 995 2005 994 1929 993 1838 Q 1008 1798 1041 1765 L 1061 1748 1062 1747 1076 1735 1081 1733 M 995 2236 Q 1045 2223 1078 2187 L 1132 2135 1116 2135 1111 2136 1028 2143 997 2173 995 2174 M 1077 1737 L 1082 1755 Q 1102 1822 1189 1830 L 1220 1826 Q 1291 1802 1363 1807 L 1371 1808 1381 1809 Q 1290 1723 1160 1673 L 1112 1664 1109 1664 1109 1665 Q 1097 1666 1089 1673 L 1080 1684 1075 1688 1061 1705 991 1809 989 1701 994 1552 Q 1059 1568 1122 1541 L 1195 1510 1180 1506 1175 1505 1096 1482 998 1524 992 1456 M 824 1424 L 828 1426 M 998 1526 L 998 1524 M 997 1528 L 994 1552 M 934 1507 L 932 1546 M 997 1528 L 998 1526 M 834 1666 L 835 1666 M 833 1669 L 834 1666 M 987 1816 L 980 1826 M 993 1838 L 988 1849 984 1865 M 991 1809 L 987 1816 M 833 1669 L 814 1702 M 1077 1737 L 1076 1735 M 1095 1916 L 1096 1916 1098 1919 1119 1950 M 937 1938 L 822 1935 747 1912 762 1906 766 1904 842 1873 935 1903 M 995 2026 L 993 2028 989 2033 982 2044 M 995 2005 L 981 2017 M 993 2177 L 994 2176 M 993 2171 L 993 2177 M 987 2386 L 991 2382 M 995 2236 L 994 2236 992 2238 M 994 2236 L 995 2239 994 2243 993 2249 M 945 2431 L 936 2425 M 991 2403 L 991 2405 982 2415 976 2426 M 939 2596 L 945 2601 M 817 2554 L 824 2555 M 1108 2327 L 1108 2325 M 1005 3011 L 1007 3023";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([38,77,0,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M 934 1704 L 936 1738 M 936 1757 L 938 1911 939 1937 940 2071 821 1992 799 1982 793 1980 780 1974 758 1972 756 1973 Q 732 1981 715 1998 618 2089 572 2200 L 580 2196 587 2192 Q 652 2162 728 2159 L 758 2153 Q 834 2115 823 2046 L 819 2028 819 2026 838 2032 839 2032 864 2040 Q 908 2058 940 2089 L 938 2215 937 2272 828 2194 827 2193 826 2192 Q 788 2185 760 2206 L 727 2231 Q 690 2259 661 2294 L 616 2349 525 2449 526 2449 531 2451 Q 601 2445 666 2421 L 684 2414 Q 739 2396 769 2359 L 781 2332 Q 789 2280 806 2229 L 826 2232 889 2260 Q 917 2272 937 2292 L 936 2425 M 937 2475 L 939 2596 M 940 2614 L 943 2713 Q 945 2800 954 2976 L 957 3035 961 3039 M 814 2025 L 819 2026 M 940 2071 L 944 2074 M 945 2095 L 940 2089 M 943 2299 L 937 2292 M 937 2272 L 942 2276 M 825 2192 L 826 2192 M 825 2192 L 824 2195 806 2229";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([38,77,0,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M 355 906 L 351 909 353 912 355 906 M 745 1131 L 743 1133 745 1133 745 1131 M 833 1137 L 826 1138 833 1138 833 1137";
	ctx.fillStyle=tocolor(ctrans.apply([255,255,255,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 368 150 L 368 148 Q 313 92 245 63 217 50 188 52 L 180 57 Q 172 79 183 95 L 194 114 Q 219 161 254 206 L 282 240 307 266 377 343 400 365 377 343 307 266 266 241 Q 201 195 128 179 97 172 69 179 64 180 63 186 60 208 74 223 L 88 238 166 317 201 345 315 428 Q 336 442 360 452 L 378 415 Q 386 389 400 365 L 410 353 Q 431 322 462 299 L 484 284 Q 467 236 424 201 L 368 150 424 201 Q 467 236 484 284 501 273 520 264 525 249 536 240 542 235 550 233 L 560 232 566 231 603 211 627 209 646 194 Q 646 145 620 100 L 588 32 Q 557 -41 505 -91 484 -113 456 -120 452 -122 448 -116 433 -100 437 -80 L 440 -59 Q 446 -5 461 48 L 475 86 476 91 472 82 Q 430 17 368 -24 343 -41 314 -45 L 307 -39 Q 295 -20 302 -2 L 309 18 Q 326 69 350 120 L 368 150 M 351 468 L 347 463 Q 308 417 244 401 L 168 378 Q 93 350 17 351 -15 350 -42 364 L -45 373 Q -43 395 -26 404 L -7 416 Q 31 444 75 467 L -30 461 -56 461 Q -82 460 -102 473 -88 515 -48 540 4 570 61 590 L -62 603 -88 608 Q -115 611 -132 626 -110 667 -66 684 7 710 86 718 10 735 -66 762 L -92 769 Q -119 778 -133 796 -102 832 -54 840 L 197 832 237 826 243 825 Q 224 830 206 838 84 885 -29 954 L -52 969 Q -74 982 -85 1002 -45 1030 4 1027 L 127 1006 31 1084 11 1101 Q -10 1118 -15 1140 28 1160 76 1149 137 1135 195 1109 L 113 1201 97 1221 Q 80 1242 78 1264 124 1277 171 1257 244 1228 309 1178 265 1243 227 1311 L 214 1334 Q 202 1357 205 1380 254 1383 294 1357 401 1288 476 1181 L 499 1150 503 1146 486 1180 Q 431 1293 399 1417 L 393 1440 Q 385 1465 394 1486 443 1478 476 1444 539 1379 581 1299 L 576 1317 Q 557 1394 568 1466 572 1495 589 1517 L 597 1519 Q 621 1512 628 1494 L 638 1474 Q 667 1424 685 1371 L 698 1335 699 1328 738 1191 745 1133 738 1191 699 1328 697 1339 Q 693 1417 716 1484 725 1513 746 1532 L 755 1533 Q 777 1521 782 1502 L 788 1481 Q 807 1429 816 1373 L 822 1329 826 1293 833 1338 Q 845 1415 881 1477 897 1504 921 1517 L 930 1516 Q 949 1502 950 1483 L 952 1461 Q 961 1406 958 1350 L 955 1306 940 1167 929 1120 925 1120 Q 909 1120 894 1132 L 886 1135 871 1130 833 1137 833 1138 826 1138 784 1130 774 1127 753 1128 745 1131 745 1133 743 1133 693 1129 678 1120 647 1125 Q 594 1101 541 1083 L 532 1096 537 1082 504 1072 467 1020 457 1009 455 1006 421 987 411 971 408 966 392 947 353 912 351 909 355 906 359 891 343 880 Q 334 873 336 858 L 340 835 315 814 319 803 299 808 320 797 323 775 Q 326 754 311 740 L 316 730 328 700 329 692 327 658 340 626 338 621 335 608 333 563 330 521 328 512 351 468 M 943 1123 Q 938 1182 967 1235 L 1002 1304 Q 1031 1376 1083 1426 1105 1447 1132 1456 L 1141 1452 Q 1157 1435 1152 1416 L 1148 1394 Q 1143 1340 1126 1286 L 1115 1251 1112 1245 1062 1115 Q 1052 1089 1035 1068 L 1025 1074 943 1123 M 1116 1252 Q 1159 1317 1220 1358 1245 1375 1273 1378 1279 1379 1281 1374 1293 1355 1285 1336 L 1277 1317 Q 1263 1264 1236 1215 L 1218 1183 1214 1177 1221 1185 Q 1275 1241 1343 1272 1372 1285 1401 1282 L 1408 1277 Q 1416 1255 1406 1239 L 1394 1221 Q 1369 1173 1334 1129 L 1305 1096 1282 1068 1322 1094 Q 1387 1139 1461 1155 1491 1163 1519 1155 L 1524 1149 Q 1528 1126 1515 1112 L 1500 1096 Q 1466 1055 1422 1019 L 1387 990 1272 907 1235 886 1181 964 1173 974 1165 983 1109 1020 1099 1028 1035 1068 Q 1052 1089 1062 1115 L 1112 1245 1116 1252 M 1241 874 Q 1281 918 1345 934 L 1420 958 Q 1495 986 1571 985 1604 985 1629 971 L 1634 963 Q 1632 941 1614 932 L 1595 919 Q 1557 890 1512 867 L 1619 875 1644 875 Q 1671 875 1692 863 1677 819 1636 796 1585 764 1527 744 L 1651 732 1677 728 Q 1704 724 1721 709 1699 668 1654 651 1582 624 1500 616 L 1656 573 1681 564 Q 1707 556 1721 538 1691 502 1643 495 L 1392 502 1352 509 1351 509 1383 498 Q 1504 450 1617 381 1629 373 1640 368 1664 352 1672 332 1633 305 1586 308 1521 312 1458 329 1509 293 1556 251 L 1576 233 Q 1597 216 1603 194 1560 174 1511 185 1451 199 1393 225 L 1475 133 1491 113 Q 1509 92 1510 70 1464 57 1419 77 1344 107 1278 157 1324 92 1361 23 L 1373 1 Q 1386 -23 1383 -44 1335 -49 1294 -21 1188 46 1113 154 L 1088 185 1087 186 1103 156 Q 1158 42 1190 -81 L 1196 -105 Q 1203 -130 1194 -150 1146 -144 1112 -108 1050 -44 1008 37 L 1012 17 Q 1032 -60 1021 -130 1016 -160 999 -181 L 990 -183 Q 968 -177 960 -159 L 950 -138 Q 922 -89 902 -36 L 892 -1 892 -4 Q 897 -82 873 -150 863 -179 842 -197 L 834 -197 Q 813 -187 807 -168 L 800 -147 Q 782 -94 773 -38 L 767 6 764 44 755 -4 Q 744 -82 707 -143 692 -168 667 -182 L 658 -181 Q 640 -167 639 -148 L 637 -126 Q 629 -72 630 -16 L 634 29 649 168 654 190 656 190 675 184 684 175 Q 695 165 710 167 L 721 168 735 159 766 169 773 161 Q 782 117 770 70 L 764 44 770 70 Q 782 117 773 161 L 816 150 831 170 847 162 870 161 876 161 947 181 Q 952 159 963 137 L 979 101 Q 991 67 1008 37 991 67 979 101 L 963 137 Q 952 159 947 181 L 961 187 Q 989 198 1012 214 L 1059 230 Q 1070 206 1087 186 L 1062 230 1075 235 Q 1081 261 1106 274 1119 283 1112 300 L 1126 305 Q 1165 322 1196 350 L 1205 358 1209 380 1213 397 1233 408 1229 434 1226 445 1261 456 1264 494 Q 1273 501 1275 511 L 1281 529 1287 528 1281 530 Q 1294 576 1297 620 L 1299 642 1296 704 1291 735 1282 776 1268 818 1241 874 M 263 138 L 283 135 440 263 444 268 442 283 Q 438 289 437 298 L 435 304 428 309 422 311 413 310 258 153 257 148 263 138 M 182 242 L 192 243 Q 288 290 358 366 L 359 369 356 376 353 379 345 385 339 384 311 381 306 383 Q 226 341 168 270 161 262 166 250 L 172 246 182 242 M 61 410 L 63 407 71 397 71 389 72 386 76 379 86 375 90 375 Q 136 395 178 404 L 301 465 305 469 306 476 304 480 Q 295 499 275 510 L 269 511 265 511 Q 149 480 58 416 L 61 410 M 75 467 L 89 475 130 493 264 547 333 563 264 547 130 493 89 475 75 467 M 44 497 L 70 500 Q 155 526 223 576 L 226 579 225 583 224 587 222 591 220 594 217 597 216 600 Q 88 584 0 518 L 2 514 5 511 8 509 9 506 19 501 25 500 44 497 M 61 590 Q 120 610 185 619 L 224 626 338 621 224 626 185 619 Q 120 610 61 590 M 328 700 Q 278 726 221 722 L 181 722 86 718 181 722 221 722 Q 278 726 328 700 M 250 769 L 250 773 250 777 249 781 249 785 Q 156 809 62 797 L 60 793 57 787 57 784 61 777 64 770 67 767 Q 144 749 218 749 L 246 766 250 769 M 204 662 Q 225 661 235 677 L 235 685 233 692 Q 128 713 31 668 L 32 660 37 650 182 642 201 659 204 662 M 64 956 L 69 940 189 875 Q 197 869 208 867 L 213 867 219 868 220 868 237 876 244 882 Q 253 951 157 972 L 67 967 64 956 M 243 825 L 299 808 243 825 M 127 1006 Q 189 990 249 962 L 287 946 Q 324 933 351 909 324 933 287 946 L 249 962 Q 189 990 127 1006 M 195 1109 L 295 1017 Q 341 977 392 947 341 977 295 1017 L 195 1109 M 211 1010 Q 220 1014 219 1024 L 219 1028 Q 183 1061 136 1085 L 128 1086 Q 115 1082 111 1069 144 1015 210 1010 L 211 1010 M 332 1016 L 343 1014 352 1014 368 1032 369 1036 Q 327 1127 236 1181 L 223 1185 208 1172 206 1167 Q 243 1082 319 1028 L 332 1016 M 309 1178 L 369 1099 Q 411 1049 457 1009 411 1049 369 1099 L 309 1178 M 326 1250 Q 357 1180 399 1119 L 407 1110 Q 433 1094 460 1098 L 470 1108 471 1112 Q 438 1214 342 1265 L 329 1265 326 1254 326 1250 M 516 -21 Q 622 61 573 177 L 570 179 Q 516 155 504 84 L 491 -8 Q 490 -14 495 -17 499 -23 507 -22 L 515 -20 516 -21 M 391 29 Q 451 65 443 131 L 442 135 429 140 414 139 Q 376 93 366 38 L 367 35 Q 373 30 380 28 L 391 29 M 686 -79 L 694 -77 Q 749 -15 745 79 745 107 724 129 L 702 128 Q 660 35 670 -70 L 672 -73 Q 678 -80 686 -79 M 476 91 L 527 221 536 240 527 221 476 91 M 835 -91 L 843 -91 Q 891 -2 843 90 L 840 93 Q 827 98 818 87 799 8 817 -74 L 820 -86 Q 826 -92 835 -91 M 1000 -68 L 1000 -64 995 -55 989 -50 Q 983 1 960 48 L 954 56 937 58 932 56 Q 903 -27 978 -84 L 984 -85 991 -84 1000 -68 M 892 -1 Q 890 35 891 72 894 119 876 161 894 119 891 72 890 35 892 -1 M 1055 129 Q 1040 132 1028 121 1029 27 1105 -41 L 1110 -44 1125 -43 1126 -44 1134 -32 1136 -29 Q 1111 49 1064 120 L 1055 129 M 885 458 L 885 461 885 458 M 967 504 L 966 506 970 507 967 504 M 1359 145 Q 1375 148 1382 162 L 1383 166 Q 1340 245 1257 299 L 1237 301 1226 294 1221 284 Q 1259 215 1322 161 L 1344 145 1351 144 1359 145 M 1459 235 Q 1469 240 1469 250 L 1469 254 Q 1436 288 1389 312 L 1381 313 Q 1368 308 1364 295 1396 241 1458 235 L 1459 235 M 1223 66 L 1234 64 1241 62 1243 59 1249 54 1259 52 1266 52 1275 64 1276 68 Q 1247 143 1175 192 L 1165 199 1148 200 1144 198 1130 178 Q 1157 113 1217 72 L 1223 66 M 1126 305 Q 1146 270 1177 244 L 1207 217 1278 157 1207 217 1177 244 Q 1146 270 1126 305 M 1532 523 Q 1544 531 1542 543 L 1541 547 1537 553 1529 561 1351 567 1347 557 1347 553 1349 550 1353 540 Q 1428 500 1501 527 L 1531 524 1532 523 M 1539 651 Q 1538 666 1543 679 L 1544 686 Q 1446 717 1369 654 L 1371 650 1378 641 Q 1454 631 1529 642 1533 643 1535 646 L 1539 651 M 1289 457 Q 1336 365 1449 365 L 1459 377 1461 380 Q 1416 444 1330 472 L 1319 474 Q 1299 472 1289 457 M 1229 434 Q 1259 404 1303 388 L 1340 373 Q 1399 344 1458 329 1399 344 1340 373 L 1303 388 Q 1259 404 1229 434 M 1297 620 L 1368 613 1409 613 1500 616 1409 613 1368 613 1297 620 M 1296 704 L 1364 709 1403 716 Q 1469 725 1527 744 1469 725 1403 716 L 1364 709 1296 704 M 1209 380 L 1293 317 1393 225 1293 317 1209 380 M 1351 509 Q 1316 514 1287 528 1316 514 1351 509 M 1282 776 L 1324 789 1458 844 1500 862 Q 1506 863 1512 867 1506 863 1500 862 L 1458 844 1324 789 1282 776 M 1299 856 L 1301 845 1308 836 Q 1364 832 1414 852 L 1420 857 1423 863 1424 865 1428 867 1448 871 Q 1487 884 1499 919 L 1499 922 1497 925 1490 930 1482 935 1448 921 1424 920 1305 871 1301 861 1299 856 M 1230 946 Q 1234 936 1245 936 L 1255 937 Q 1316 949 1334 1003 L 1334 1006 1335 1008 1355 1016 1360 1023 Q 1368 1031 1365 1044 L 1362 1050 Q 1268 1038 1228 949 L 1230 946 M 1373 756 L 1378 751 Q 1448 739 1511 768 L 1517 775 1520 779 1521 782 1520 790 Q 1535 799 1534 815 L 1534 819 1526 826 1517 830 Q 1433 819 1369 775 1366 766 1373 756 M 1225 1060 L 1226 1064 Q 1260 1093 1283 1132 L 1286 1149 1287 1162 1283 1168 1274 1177 1268 1179 1264 1179 Q 1191 1130 1176 1044 1184 1031 1200 1031 L 1208 1030 Q 1223 1043 1225 1060 M 1181 964 L 1211 991 1282 1068 1211 991 1181 964 M 1175 1238 L 1160 1240 Q 1110 1177 1091 1096 L 1093 1087 1104 1078 1117 1080 1118 1079 Q 1188 1142 1184 1231 L 1183 1234 1175 1238 M 503 1146 L 532 1096 503 1146 M 693 1195 Q 702 1305 623 1374 L 617 1375 Q 591 1265 678 1185 L 683 1184 690 1191 693 1195 M 646 1125 L 647 1125 646 1125 Q 644 1162 626 1198 L 609 1234 581 1299 609 1234 626 1198 Q 644 1162 646 1125 M 584 1168 L 588 1174 Q 580 1268 509 1337 504 1342 495 1341 474 1246 538 1154 L 543 1148 564 1146 584 1168 M 1109 1020 Q 1127 1036 1141 1059 L 1214 1177 1141 1059 Q 1127 1036 1109 1020 M 1013 1154 L 1026 1154 Q 1084 1216 1062 1293 L 1061 1296 1052 1298 1043 1298 Q 992 1243 993 1166 999 1156 1013 1154 M 826 1293 L 835 1188 Q 838 1163 833 1138 838 1163 835 1188 L 826 1293 M 902 1190 Q 940 1277 902 1370 L 899 1373 Q 883 1377 873 1365 849 1291 862 1211 L 864 1203 880 1195 887 1189 902 1190 M 790 1200 Q 810 1292 757 1375 L 752 1380 738 1377 731 1371 726 1362 724 1357 Q 723 1262 775 1194 776 1192 780 1192 L 784 1194 790 1200";
	ctx.fillStyle=tocolor(ctrans.apply([255,204,0,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 61 410 L 58 416 Q 149 480 265 511 L 269 511 275 510 Q 295 499 304 480 L 306 476 305 469 301 465 178 404 Q 136 395 90 375 L 86 375 76 379 72 386 71 389 71 397 63 407 61 410 M 182 242 L 172 246 166 250 Q 161 262 168 270 226 341 306 383 L 311 381 339 384 345 385 353 379 356 376 359 369 358 366 Q 288 290 192 243 L 182 242 M 263 138 L 257 148 258 153 413 310 422 311 428 309 435 304 437 298 Q 438 289 442 283 L 444 268 440 263 283 135 263 138 M 44 497 L 25 500 19 501 9 506 8 509 5 511 2 514 0 518 Q 88 584 216 600 L 217 597 220 594 222 591 224 587 225 583 226 579 223 576 Q 155 526 70 500 L 44 497 M 64 956 L 67 967 157 972 Q 253 951 244 882 L 237 876 220 868 219 868 213 867 208 867 Q 197 869 189 875 L 69 940 64 956 M 204 662 L 201 659 182 642 37 650 32 660 31 668 Q 128 713 233 692 L 235 685 235 677 Q 225 661 204 662 M 250 769 L 246 766 218 749 Q 144 749 67 767 L 64 770 61 777 57 784 57 787 60 793 62 797 Q 156 809 249 785 L 249 781 250 777 250 773 250 769 M 332 1016 L 319 1028 Q 243 1082 206 1167 L 208 1172 223 1185 236 1181 Q 327 1127 369 1036 L 368 1032 352 1014 343 1014 332 1016 M 211 1010 L 210 1010 Q 144 1015 111 1069 115 1082 128 1086 L 136 1085 Q 183 1061 219 1028 L 219 1024 Q 220 1014 211 1010 M 686 -79 Q 678 -80 672 -73 L 670 -70 Q 660 35 702 128 L 724 129 Q 745 107 745 79 749 -15 694 -77 L 686 -79 M 391 29 L 380 28 Q 373 30 367 35 L 366 38 Q 376 93 414 139 L 429 140 442 135 443 131 Q 451 65 391 29 M 516 -21 L 515 -20 507 -22 Q 499 -23 495 -17 490 -14 491 -8 L 504 84 Q 516 155 570 179 L 573 177 Q 622 61 516 -21 M 326 1250 L 326 1254 329 1265 342 1265 Q 438 1214 471 1112 L 470 1108 460 1098 Q 433 1094 407 1110 L 399 1119 Q 357 1180 326 1250 M 1000 -68 L 991 -84 984 -85 978 -84 Q 903 -27 932 56 L 937 58 954 56 960 48 Q 983 1 989 -50 L 995 -55 1000 -64 1000 -68 M 835 -91 Q 826 -92 820 -86 L 817 -74 Q 799 8 818 87 827 98 840 93 L 843 90 Q 891 -2 843 -91 L 835 -91 M 1055 129 L 1064 120 Q 1111 49 1136 -29 L 1134 -32 1126 -44 1125 -43 1110 -44 1105 -41 Q 1029 27 1028 121 1040 132 1055 129 M 1223 66 L 1217 72 Q 1157 113 1130 178 L 1144 198 1148 200 1165 199 1175 192 Q 1247 143 1276 68 L 1275 64 1266 52 1259 52 1249 54 1243 59 1241 62 1234 64 1223 66 M 1459 235 L 1458 235 Q 1396 241 1364 295 1368 308 1381 313 L 1389 312 Q 1436 288 1469 254 L 1469 250 Q 1469 240 1459 235 M 1359 145 L 1351 144 1344 145 1322 161 Q 1259 215 1221 284 L 1226 294 1237 301 1257 299 Q 1340 245 1383 166 L 1382 162 Q 1375 148 1359 145 M 1289 457 Q 1299 472 1319 474 L 1330 472 Q 1416 444 1461 380 L 1459 377 1449 365 Q 1336 365 1289 457 M 1539 651 L 1535 646 Q 1533 643 1529 642 1454 631 1378 641 L 1371 650 1369 654 Q 1446 717 1544 686 L 1543 679 Q 1538 666 1539 651 M 1532 523 L 1531 524 1501 527 Q 1428 500 1353 540 L 1349 550 1347 553 1347 557 1351 567 1529 561 1537 553 1541 547 1542 543 Q 1544 531 1532 523 M 1225 1060 Q 1223 1043 1208 1030 L 1200 1031 Q 1184 1031 1176 1044 1191 1130 1264 1179 L 1268 1179 1274 1177 1283 1168 1287 1162 1286 1149 1283 1132 Q 1260 1093 1226 1064 L 1225 1060 M 1373 756 Q 1366 766 1369 775 1433 819 1517 830 L 1526 826 1534 819 1534 815 Q 1535 799 1520 790 L 1521 782 1520 779 1517 775 1511 768 Q 1448 739 1378 751 L 1373 756 M 1230 946 L 1228 949 Q 1268 1038 1362 1050 L 1365 1044 Q 1368 1031 1360 1023 L 1355 1016 1335 1008 1334 1006 1334 1003 Q 1316 949 1255 937 L 1245 936 Q 1234 936 1230 946 M 1299 856 L 1301 861 1305 871 1424 920 1448 921 1482 935 1490 930 1497 925 1499 922 1499 919 Q 1487 884 1448 871 L 1428 867 1424 865 1423 863 1420 857 1414 852 Q 1364 832 1308 836 L 1301 845 1299 856 M 1175 1238 L 1183 1234 1184 1231 Q 1188 1142 1118 1079 L 1117 1080 1104 1078 1093 1087 1091 1096 Q 1110 1177 1160 1240 L 1175 1238 M 693 1195 L 690 1191 683 1184 678 1185 Q 591 1265 617 1375 L 623 1374 Q 702 1305 693 1195 M 584 1168 L 564 1146 543 1148 538 1154 Q 474 1246 495 1341 504 1342 509 1337 580 1268 588 1174 L 584 1168 M 1013 1154 Q 999 1156 993 1166 992 1243 1043 1298 L 1052 1298 1061 1296 1062 1293 Q 1084 1216 1026 1154 L 1013 1154 M 902 1190 L 887 1189 880 1195 864 1203 862 1211 Q 849 1291 873 1365 883 1377 899 1373 L 902 1370 Q 940 1277 902 1190 M 790 1200 L 784 1194 780 1192 Q 776 1192 775 1194 723 1262 724 1357 L 726 1362 731 1371 738 1377 752 1380 757 1375 Q 810 1292 790 1200";
	ctx.fillStyle=tocolor(ctrans.apply([255,255,0,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 1234 626 L 1234 623 1234 625 1234 626";
	ctx.fillStyle=tocolor(ctrans.apply([153,102,0,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 1176 420 L 1175 422 1174 425 1183 432 1176 420 M 1247 701 L 1245 706 1245 709 1247 701";
	ctx.fillStyle=tocolor(ctrans.apply([204,153,0,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 793 362 L 788 363 773 358 757 369 Q 746 374 738 382 L 730 377 705 376 Q 683 375 682 390 690 398 683 398 L 645 406 640 412 633 421 Q 628 428 630 436 L 616 447 Q 604 450 592 456 584 480 564 494 541 513 530 541 L 532 550 531 553 523 562 519 572 512 584 521 601 523 609 517 614 507 622 Q 505 630 506 638 L 509 647 509 651 506 654 497 666 Q 490 678 500 687 L 500 695 495 704 493 722 503 735 505 737 505 744 Q 508 751 504 756 L 500 762 508 774 515 785 513 793 511 795 513 800 530 827 531 834 532 839 543 852 546 856 548 873 546 876 572 897 576 907 578 911 579 916 603 924 613 927 616 930 616 932 617 937 Q 638 959 669 955 L 671 960 673 964 722 984 732 980 737 978 774 985 784 984 Q 797 984 805 975 L 816 977 822 978 826 976 843 967 849 962 869 963 872 963 886 949 Q 892 945 900 944 L 919 928 941 928 963 923 970 920 985 909 Q 999 907 1011 890 1029 864 1058 846 L 1063 833 1081 809 1081 802 1079 779 1077 772 1083 763 1083 759 1081 754 Q 1073 743 1072 730 1094 707 1100 678 1109 635 1090 596 L 1092 589 Q 1095 575 1090 564 L 1076 554 1070 542 Q 1063 521 1066 500 L 1046 485 1047 483 Q 1036 466 1035 446 L 1004 440 990 435 987 431 985 426 Q 948 400 904 389 L 906 377 908 370 905 367 895 361 858 365 848 357 843 357 834 362 818 368 811 360 Q 803 350 793 362 M 970 507 Q 988 515 985 536 L 984 541 Q 1000 546 1001 561 L 1001 563 Q 1027 575 1015 599 L 1015 602 Q 1032 614 1020 633 L 1015 641 Q 1036 660 1020 686 L 1019 687 1023 691 1019 706 Q 1028 718 1026 733 L 1025 733 1025 748 Q 1032 768 1003 774 L 1002 774 999 775 995 776 Q 1013 795 995 813 L 982 819 982 821 982 826 981 828 Q 976 841 962 840 L 953 840 Q 948 853 933 851 L 924 850 917 855 909 859 Q 905 874 889 875 L 878 877 876 881 859 890 849 892 Q 839 911 820 902 L 813 899 798 909 789 909 783 914 773 918 772 918 764 917 752 921 742 920 724 916 Q 715 916 714 908 L 712 905 Q 695 910 684 895 L 682 887 Q 664 889 655 874 L 655 866 Q 639 861 634 846 L 631 842 Q 602 845 604 819 L 606 813 Q 570 809 582 779 L 583 777 584 770 Q 577 762 575 751 L 577 741 564 733 Q 563 720 573 711 L 574 710 584 703 580 695 572 691 570 689 Q 568 679 576 672 L 591 659 590 658 Q 566 647 585 624 588 617 594 615 559 596 592 572 L 609 562 Q 587 555 594 533 600 512 626 511 L 645 510 642 504 Q 630 472 665 471 669 450 692 456 L 701 459 703 456 706 450 708 449 Q 730 437 743 455 L 748 454 750 453 754 443 Q 766 434 775 437 777 427 785 417 L 797 416 807 428 Q 819 422 835 432 L 843 442 845 441 Q 853 436 863 436 L 870 435 Q 887 441 885 458 L 885 461 Q 919 448 926 477 L 927 479 Q 970 468 967 504 L 970 507";
	ctx.fillStyle=tocolor(ctrans.apply([255,153,0,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 1234 623 L 1235 611 1235 607 1235 605 1236 600 1227 556 1211 535 1209 527 1209 523 Q 1194 471 1156 433 1155 414 1164 395 1127 354 1068 331 L 1067 328 1049 308 1046 303 Q 1019 259 963 241 L 963 239 Q 958 223 943 219 L 846 210 803 206 Q 699 196 602 248 L 571 273 Q 545 288 522 311 511 314 503 323 L 486 336 Q 437 370 438 423 418 440 407 466 373 554 386 645 377 661 374 676 351 766 395 845 398 882 424 910 440 952 486 971 L 491 973 Q 514 1033 581 1044 636 1079 711 1085 729 1105 757 1094 L 845 1101 Q 882 1090 914 1072 L 923 1066 925 1064 959 1062 963 1058 966 1054 Q 975 1046 988 1046 1016 1013 1053 990 1064 983 1076 979 1152 894 1204 796 L 1210 783 1227 744 Q 1230 724 1225 706 L 1235 684 1238 680 1234 626 1234 625 1234 623 M 793 362 Q 803 350 811 360 L 818 368 834 362 843 357 848 357 858 365 895 361 905 367 908 370 906 377 904 389 Q 948 400 985 426 L 987 431 990 435 1004 440 1035 446 Q 1036 466 1047 483 L 1046 485 1066 500 Q 1063 521 1070 542 L 1076 554 1090 564 Q 1095 575 1092 589 L 1090 596 Q 1109 635 1100 678 1094 707 1072 730 1073 743 1081 754 L 1083 759 1083 763 1077 772 1079 779 1081 802 1081 809 1063 833 1058 846 Q 1029 864 1011 890 999 907 985 909 L 970 920 963 923 941 928 919 928 900 944 Q 892 945 886 949 L 872 963 869 963 849 962 843 967 826 976 822 978 816 977 805 975 Q 797 984 784 984 L 774 985 737 978 732 980 722 984 673 964 671 960 669 955 Q 638 959 617 937 L 616 932 616 930 613 927 603 924 579 916 578 911 576 907 572 897 546 876 548 873 546 856 543 852 532 839 531 834 530 827 513 800 511 795 513 793 515 785 508 774 500 762 504 756 Q 508 751 505 744 L 505 737 503 735 493 722 495 704 500 695 500 687 Q 490 678 497 666 L 506 654 509 651 509 647 506 638 Q 505 630 507 622 L 517 614 523 609 521 601 512 584 519 572 523 562 531 553 532 550 530 541 Q 541 513 564 494 584 480 592 456 604 450 616 447 L 630 436 Q 628 428 633 421 L 640 412 645 406 683 398 Q 690 398 682 390 683 375 705 376 L 730 377 738 382 Q 746 374 757 369 L 773 358 788 363 793 362 M 911 314 L 893 308 885 305 911 314 M 800 509 L 798 505 Q 795 497 788 496 L 782 497 774 501 Q 766 511 767 522 L 767 534 757 534 Q 752 523 739 517 L 735 516 733 516 730 516 Q 729 516 727 518 L 724 519 722 521 719 525 717 529 716 531 705 533 Q 701 533 698 536 L 696 540 695 541 694 543 677 548 Q 670 549 668 556 L 668 561 668 566 669 569 666 571 Q 660 574 660 580 L 659 584 662 593 664 596 662 597 657 600 654 601 652 602 646 613 645 617 649 626 652 632 647 634 643 639 643 641 644 651 645 660 634 671 629 682 632 693 633 697 630 709 631 714 638 720 641 724 638 729 Q 635 747 648 754 L 647 756 644 764 643 768 646 781 651 788 658 795 672 796 677 792 700 812 696 833 Q 699 841 708 841 L 714 839 728 828 765 840 763 858 793 857 795 851 797 846 802 847 804 847 812 842 825 839 845 843 855 841 Q 862 835 868 831 L 886 821 898 797 927 792 927 790 927 787 927 785 928 782 925 778 915 769 938 742 968 701 957 679 952 667 955 666 968 656 969 650 969 645 965 642 958 636 952 636 941 637 938 638 Q 936 628 940 616 L 934 610 930 597 933 588 934 580 933 577 Q 920 564 901 562 L 901 560 Q 894 547 881 543 L 880 541 Q 876 528 862 529 L 863 527 854 517 850 517 846 516 836 518 Q 822 519 807 526 L 805 524 799 516 800 509 M 622 1011 Q 614 1007 606 1005 L 606 1004 622 1011";
	ctx.fillStyle=tocolor(ctrans.apply([204,102,0,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 484 284 L 462 299 Q 431 322 410 353 L 400 365 Q 386 389 378 415 L 360 452 351 468 328 512 330 521 333 563 335 608 338 621 340 626 327 658 329 692 328 700 316 730 311 740 Q 326 754 323 775 L 320 797 319 803 315 814 340 835 336 858 Q 334 873 343 880 L 359 891 355 906 353 912 392 947 408 966 411 971 421 987 455 1006 457 1009 467 1020 504 1072 537 1082 541 1083 Q 594 1101 647 1125 L 678 1120 693 1129 743 1133 745 1131 753 1128 774 1127 784 1130 826 1138 833 1137 871 1130 886 1135 894 1132 Q 909 1120 925 1120 L 929 1120 942 1123 943 1123 1025 1074 1035 1068 1099 1028 1109 1020 1165 983 1173 974 1181 964 1235 886 1241 874 1268 818 1282 776 1291 735 1296 704 1299 642 1297 620 Q 1294 576 1281 530 L 1281 529 1275 511 Q 1273 501 1264 494 L 1261 456 1226 445 1229 434 1233 408 1213 397 1209 380 1205 358 1196 350 Q 1165 322 1126 305 L 1112 300 Q 1119 283 1106 274 1081 261 1075 235 L 1062 230 1059 230 1012 214 Q 989 198 961 187 L 947 181 876 161 870 161 847 162 831 170 816 150 773 161 766 169 735 159 721 168 710 167 Q 695 165 684 175 L 675 184 656 190 654 190 646 194 627 209 603 211 566 231 560 232 550 233 Q 542 235 536 240 525 249 520 264 501 273 484 284 M 1234 626 L 1238 680 1235 684 1225 706 Q 1230 724 1227 744 L 1210 783 1204 796 Q 1152 894 1076 979 1064 983 1053 990 1016 1013 988 1046 975 1046 966 1054 L 963 1058 959 1062 925 1064 923 1066 914 1072 Q 882 1090 845 1101 L 757 1094 Q 729 1105 711 1085 636 1079 581 1044 514 1033 491 973 L 486 971 Q 440 952 424 910 398 882 395 845 351 766 374 676 377 661 386 645 373 554 407 466 418 440 438 423 437 370 486 336 L 503 323 Q 511 314 522 311 545 288 571 273 L 602 248 Q 699 196 803 206 L 846 210 943 219 Q 958 223 963 239 L 963 241 Q 1019 259 1046 303 L 1049 308 1067 328 1068 331 Q 1127 354 1164 395 1155 414 1156 433 1194 471 1209 523 L 1209 527 1211 535 1227 556 1236 600 1235 605 1235 607 1235 611 1234 623 1234 626 M 885 458 Q 887 441 870 435 L 863 436 Q 853 436 845 441 L 843 442 835 432 Q 819 422 807 428 L 797 416 785 417 Q 777 427 775 437 766 434 754 443 L 750 453 748 454 743 455 Q 730 437 708 449 L 706 450 703 456 701 459 692 456 Q 669 450 665 471 630 472 642 504 L 645 510 626 511 Q 600 512 594 533 587 555 609 562 L 592 572 Q 559 596 594 615 588 617 585 624 566 647 590 658 L 591 659 576 672 Q 568 679 570 689 L 572 691 580 695 584 703 574 710 573 711 Q 563 720 564 733 L 577 741 575 751 Q 577 762 584 770 L 583 777 582 779 Q 570 809 606 813 L 604 819 Q 602 845 631 842 L 634 846 Q 639 861 655 866 L 655 874 Q 664 889 682 887 L 684 895 Q 695 910 712 905 L 714 908 Q 715 916 724 916 L 742 920 752 921 764 917 772 918 773 918 783 914 789 909 798 909 813 899 820 902 Q 839 911 849 892 L 859 890 876 881 878 877 889 875 Q 905 874 909 859 L 917 855 924 850 933 851 Q 948 853 953 840 L 962 840 Q 976 841 981 828 L 982 826 982 821 982 819 995 813 Q 1013 795 995 776 L 999 775 1002 774 1003 774 Q 1032 768 1025 748 L 1025 733 1026 733 Q 1028 718 1019 706 L 1023 691 1019 687 1020 686 Q 1036 660 1015 641 L 1020 633 Q 1032 614 1015 602 L 1015 599 Q 1027 575 1001 563 L 1001 561 Q 1000 546 984 541 L 985 536 Q 988 515 970 507 L 966 506 967 504 Q 970 468 927 479 L 926 477 Q 919 448 885 461 L 885 458 M 800 509 L 799 516 805 524 807 526 Q 822 519 836 518 L 846 516 850 517 854 517 863 527 862 529 Q 876 528 880 541 L 881 543 Q 894 547 901 560 L 901 562 Q 920 564 933 577 L 934 580 933 588 930 597 934 610 940 616 Q 936 628 938 638 L 941 637 952 636 958 636 965 642 969 645 969 650 968 656 955 666 952 667 957 679 968 701 938 742 915 769 925 778 928 782 927 785 927 787 927 790 927 792 898 797 886 821 868 831 Q 862 835 855 841 L 845 843 825 839 812 842 804 847 802 847 797 846 795 851 793 857 763 858 765 840 728 828 714 839 708 841 Q 699 841 696 833 L 700 812 677 792 672 796 658 795 651 788 646 781 643 768 644 764 647 756 648 754 Q 635 747 638 729 L 641 724 638 720 631 714 630 709 633 697 632 693 629 682 634 671 645 660 644 651 643 641 643 639 647 634 652 632 649 626 645 617 646 613 652 602 654 601 657 600 662 597 664 596 662 593 659 584 660 580 Q 660 574 666 571 L 669 569 668 566 668 561 668 556 Q 670 549 677 548 L 694 543 695 541 696 540 698 536 Q 701 533 705 533 L 716 531 717 529 719 525 722 521 724 519 727 518 Q 729 516 730 516 L 733 516 735 516 739 517 Q 752 523 757 534 L 767 534 767 522 Q 766 511 774 501 L 782 497 788 496 Q 795 497 798 505 L 800 509 M 1176 420 L 1183 432 1174 425 1175 422 1176 420 M 1247 701 L 1245 709 1245 706 1247 701";
	ctx.fillStyle=tocolor(ctrans.apply([102,0,0,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 307 266 L 282 240 254 206 Q 219 161 194 114 L 183 95 Q 172 79 180 57 L 188 52 Q 217 50 245 63 313 92 368 148 L 368 150 424 201 Q 467 236 484 284 L 462 299 Q 431 322 410 353 L 400 365 377 343 307 266 266 241 Q 201 195 128 179 97 172 69 179 64 180 63 186 60 208 74 223 L 88 238 166 317 201 345 315 428 Q 336 442 360 452 L 351 468 347 463 Q 308 417 244 401 L 168 378 Q 93 350 17 351 -15 350 -42 364 L -45 373 Q -43 395 -26 404 L -7 416 Q 31 444 75 467 L -30 461 -56 461 Q -82 460 -102 473 -88 515 -48 540 4 570 61 590 L -62 603 -88 608 Q -115 611 -132 626 -110 667 -66 684 7 710 86 718 10 735 -66 762 L -92 769 Q -119 778 -133 796 -102 832 -54 840 L 197 832 237 826 243 825 Q 224 830 206 838 84 885 -29 954 L -52 969 Q -74 982 -85 1002 -45 1030 4 1027 L 127 1006 31 1084 11 1101 Q -10 1118 -15 1140 28 1160 76 1149 137 1135 195 1109 L 113 1201 97 1221 Q 80 1242 78 1264 124 1277 171 1257 244 1228 309 1178 265 1243 227 1311 L 214 1334 Q 202 1357 205 1380 254 1383 294 1357 401 1288 476 1181 L 499 1150 503 1146 486 1180 Q 431 1293 399 1417 L 393 1440 Q 385 1465 394 1486 443 1478 476 1444 539 1379 581 1299 L 576 1317 Q 557 1394 568 1466 572 1495 589 1517 L 597 1519 Q 621 1512 628 1494 L 638 1474 Q 667 1424 685 1371 L 698 1335 697 1339 Q 693 1417 716 1484 725 1513 746 1532 L 755 1533 Q 777 1521 782 1502 L 788 1481 Q 807 1429 816 1373 L 822 1329 826 1293 833 1338 Q 845 1415 881 1477 897 1504 921 1517 L 930 1516 Q 949 1502 950 1483 L 952 1461 Q 961 1406 958 1350 L 955 1306 940 1167 929 1120 942 1123 943 1123 Q 938 1182 967 1235 L 1002 1304 Q 1031 1376 1083 1426 1105 1447 1132 1456 L 1141 1452 Q 1157 1435 1152 1416 L 1148 1394 Q 1143 1340 1126 1286 L 1115 1251 1116 1252 Q 1159 1317 1220 1358 1245 1375 1273 1378 1279 1379 1281 1374 1293 1355 1285 1336 L 1277 1317 Q 1263 1264 1236 1215 L 1218 1183 1221 1185 Q 1275 1241 1343 1272 1372 1285 1401 1282 L 1408 1277 Q 1416 1255 1406 1239 L 1394 1221 Q 1369 1173 1334 1129 L 1305 1096 1282 1068 1322 1094 Q 1387 1139 1461 1155 1491 1163 1519 1155 L 1524 1149 Q 1528 1126 1515 1112 L 1500 1096 Q 1466 1055 1422 1019 L 1387 990 1272 907 1235 886 1241 874 Q 1281 918 1345 934 L 1420 958 Q 1495 986 1571 985 1604 985 1629 971 L 1634 963 Q 1632 941 1614 932 L 1595 919 Q 1557 890 1512 867 L 1619 875 1644 875 Q 1671 875 1692 863 1677 819 1636 796 1585 764 1527 744 L 1651 732 1677 728 Q 1704 724 1721 709 1699 668 1654 651 1582 624 1500 616 L 1656 573 1681 564 Q 1707 556 1721 538 1691 502 1643 495 L 1392 502 1352 509 1351 509 1383 498 Q 1504 450 1617 381 1629 373 1640 368 1664 352 1672 332 1633 305 1586 308 1521 312 1458 329 1509 293 1556 251 L 1576 233 Q 1597 216 1603 194 1560 174 1511 185 1451 199 1393 225 L 1475 133 1491 113 Q 1509 92 1510 70 1464 57 1419 77 1344 107 1278 157 1324 92 1361 23 L 1373 1 Q 1386 -23 1383 -44 1335 -49 1294 -21 1188 46 1113 154 L 1088 185 1087 186 1103 156 Q 1158 42 1190 -81 L 1196 -105 Q 1203 -130 1194 -150 1146 -144 1112 -108 1050 -44 1008 37 L 1012 17 Q 1032 -60 1021 -130 1016 -160 999 -181 L 990 -183 Q 968 -177 960 -159 L 950 -138 Q 922 -89 902 -36 L 892 -1 892 -4 Q 897 -82 873 -150 863 -179 842 -197 L 834 -197 Q 813 -187 807 -168 L 800 -147 Q 782 -94 773 -38 L 767 6 764 44 755 -4 Q 744 -82 707 -143 692 -168 667 -182 L 658 -181 Q 640 -167 639 -148 L 637 -126 Q 629 -72 630 -16 L 634 29 649 168 654 190 646 194 Q 646 145 620 100 L 588 32 Q 557 -41 505 -91 484 -113 456 -120 452 -122 448 -116 433 -100 437 -80 L 440 -59 Q 446 -5 461 48 L 475 86 472 82 Q 430 17 368 -24 343 -41 314 -45 L 307 -39 Q 295 -20 302 -2 L 309 18 Q 326 69 350 120 L 368 150 M 333 563 L 264 547 130 493 89 475 75 467 M 351 468 L 328 512 330 521 333 563 335 608 338 621 224 626 185 619 Q 120 610 61 590 M 320 797 L 323 775 Q 326 754 311 740 L 316 730 328 700 329 692 327 658 340 626 338 621 M 86 718 L 181 722 221 722 Q 278 726 328 700 M 319 803 L 320 797 299 808 243 825 M 319 803 L 315 814 340 835 336 858 Q 334 873 343 880 L 359 891 355 906 351 909 Q 324 933 287 946 L 249 962 Q 189 990 127 1006 M 299 808 L 319 803 M 353 912 L 355 906 M 353 912 L 392 947 Q 341 977 295 1017 L 195 1109 M 457 1009 Q 411 1049 369 1099 L 309 1178 M 773 161 L 766 169 735 159 721 168 710 167 Q 695 165 684 175 L 675 184 656 190 654 190 M 646 194 L 627 209 603 211 566 231 560 232 550 233 Q 542 235 536 240 L 527 221 476 91 475 86 M 536 240 Q 525 249 520 264 501 273 484 284 M 1008 37 Q 991 67 979 101 L 963 137 Q 952 159 947 181 L 876 161 Q 894 119 891 72 890 35 892 -1 M 1087 186 Q 1070 206 1059 230 L 1012 214 Q 989 198 961 187 L 947 181 M 1062 230 L 1087 186 M 1062 230 L 1075 235 Q 1081 261 1106 274 1119 283 1112 300 L 1126 305 Q 1165 322 1196 350 L 1205 358 1209 380 1213 397 1233 408 1229 434 1226 445 1261 456 1264 494 Q 1273 501 1275 511 L 1281 529 1281 530 Q 1294 576 1297 620 L 1299 642 1296 704 1291 735 1282 776 1268 818 1241 874 M 1059 230 L 1062 230 M 764 44 L 770 70 Q 782 117 773 161 L 816 150 831 170 847 162 870 161 876 161 M 400 365 Q 386 389 378 415 L 360 452 M 1278 157 L 1207 217 1177 244 Q 1146 270 1126 305 M 1458 329 Q 1399 344 1340 373 L 1303 388 Q 1259 404 1229 434 M 1393 225 L 1293 317 1209 380 M 1527 744 Q 1469 725 1403 716 L 1364 709 1296 704 M 1500 616 L 1409 613 1368 613 1297 620 M 1281 530 L 1287 528 Q 1316 514 1351 509 M 1287 528 L 1281 529 M 1512 867 Q 1506 863 1500 862 L 1458 844 1324 789 1282 776 M 1235 886 L 1181 964 1173 974 1165 983 1109 1020 1099 1028 1035 1068 1025 1074 943 1123 M 1282 1068 L 1211 991 1181 964 M 1218 1183 L 1214 1177 1141 1059 Q 1127 1036 1109 1020 M 537 1082 L 504 1072 467 1020 457 1009 455 1006 421 987 411 971 408 966 392 947 M 745 1131 L 743 1133 693 1129 678 1120 647 1125 Q 594 1101 541 1083 L 537 1082 532 1096 503 1146 M 826 1138 L 784 1130 774 1127 753 1128 745 1131 745 1133 738 1191 699 1328 698 1335 M 646 1125 L 647 1125 646 1125 Q 644 1162 626 1198 L 609 1234 581 1299 M 532 1096 L 541 1083 M 1112 1245 L 1062 1115 Q 1052 1089 1035 1068 M 929 1120 L 925 1120 Q 909 1120 894 1132 L 886 1135 871 1130 833 1137 826 1138 M 833 1138 Q 838 1163 835 1188 L 826 1293 M 833 1138 L 833 1137 M 1112 1245 L 1115 1251";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([153,51,0,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

}

function shape122(ctx,ctrans,frame,ratio,time){
	var pathData="M -493 289 L -488 288 -437 278 -377 262 Q -26 160 464 -234 805 -508 1236 -606 1291 -478 1233 -411 1193 -367 1040 -262 934 -176 370 69 -81 265 -287 341 -390 377 -417 395 L -579 519 Q -704 613 -787 605 -827 600 -886 554 -916 530 -829 489 L -698 434 Q -576 377 -751 395 -865 406 -1036 447 -1207 487 -1242 459 -1278 431 -1251 355 L -1183 347 Q -984 353 -887 328 -791 303 -723 307 L -594 302 -526 293 -493 289 -526 293 -528 290 -496 288 -493 289";
	ctx.fillStyle=tocolor(ctrans.apply([253,236,208,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M -526 293 L -594 302 -723 307 Q -791 303 -887 328 -984 353 -1183 347 L -1251 355 Q -1278 431 -1242 459 -1207 487 -1036 447 -865 406 -751 395 -576 377 -698 434 L -829 489 Q -916 530 -886 554 -827 600 -787 605 -704 613 -579 519 L -417 395 Q -390 377 -287 341 -81 265 370 69 934 -176 1040 -262 1193 -367 1233 -411 1291 -478 1236 -606 805 -508 464 -234 -26 160 -377 262 L -437 278 -488 288 -493 289 -526 293";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([204,102,0,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="miter";
	ctx.miterLimit=3.0;
	drawPath(ctx,pathData,true,scaleMode);

}

function shape123(ctx,ctrans,frame,ratio,time){
	var pathData="M 466 -1034 Q 535 -1007 558 -983 580 -960 561 -870 541 -781 478 -643 414 -505 398 -455 48 217 -2 440 -30 563 -31 719 -33 844 -46 866 -74 911 -232 967 -403 1029 -488 999 -603 959 -631 939 -675 906 -614 875 -495 844 -416 800 -272 717 -196 503 -126 302 -75 -171 -23 -645 -19 -720 -15 -797 86 -903 186 -1009 292 -1035 397 -1062 466 -1034";
	ctx.fillStyle=tocolor(ctrans.apply([253,236,208,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 466 -1034 Q 535 -1007 558 -983 580 -960 561 -870 541 -781 478 -643 414 -505 398 -455 48 217 -2 440 -30 563 -31 719 -33 844 -46 866 -74 911 -232 967 -403 1029 -488 999 -603 959 -631 939 -675 906 -614 875 -495 844 -416 800 -272 717 -196 503 -126 302 -75 -171 -23 -645 -19 -720 -15 -797 86 -903 186 -1009 292 -1035 397 -1062 466 -1034 Z";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([204,102,0,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="butt";
	ctx.lineJoin="miter";
	ctx.miterLimit=3.0;
	drawPath(ctx,pathData,true,scaleMode);

}

function sprite124(ctx,ctrans,frame,ratio,time){
	var clips = [];
	var frame_cnt = 1;
	frame = frame % frame_cnt;
	switch(frame){
		case 0:
			place("shape123",sunny_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
	}
}

function shape125(ctx,ctrans,frame,ratio,time){
	var pathData="M 135 1380 Q -167 1565 -42 1200 60 752 49 653 38 554 -77 37 -193 -481 -224 -977 L -247 -1348 -202 -1378 Q -148 -1411 -97 -1427 67 -1479 130 -1335 192 -1197 217 -906 241 -615 247 -330 252 -46 232 371 212 788 213 963 242 1261 135 1380";
	ctx.fillStyle=tocolor(ctrans.apply([253,236,208,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 135 1380 Q -167 1565 -42 1200 60 752 49 653 38 554 -77 37 -193 -481 -224 -977 L -247 -1348 -202 -1378 Q -148 -1411 -97 -1427 67 -1479 130 -1335 192 -1197 217 -906 241 -615 247 -330 252 -46 232 371 212 788 213 963";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([204,102,0,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="butt";
	ctx.lineJoin="miter";
	ctx.miterLimit=3.0;
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M 213 963 Q 242 1261 135 1380 Z";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([204,102,0,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

}

function sprite126(ctx,ctrans,frame,ratio,time){
	var clips = [];
	var frame_cnt = 1;
	frame = frame % frame_cnt;
	switch(frame){
		case 0:
			place("shape125",sunny_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
	}
}

function shape127(ctx,ctrans,frame,ratio,time){
	var pathData="M -125 -747 Q -61 -775 56 -763 145 -753 160 -792 175 -873 216 -955 L 465 -961 Q 467 -863 416 -717 419 -679 483 -669 554 -601 660 -278 782 94 748 860 L -200 811 Q -244 579 -261 272 -297 -343 -168 -718 L -125 -747 M 462 -685 L 470 -680 Q 396 -714 462 -685";
	ctx.fillStyle=tocolor(ctrans.apply([253,236,208,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M -125 -747 Q -61 -775 56 -763 145 -753 160 -792 175 -873 216 -955 L 465 -961 Q 467 -863 416 -717 419 -679 483 -669 554 -601 660 -278 782 94 748 860 L -200 811 Q -244 579 -261 272 -297 -343 -168 -718 L -125 -747 Z";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([204,102,0,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M 363 -668 Q 116 -297 170 -74 615 -2 673 -203 1011 923 925 1709 712 1799 466 1829 220 1858 76 1838 L -156 1799 Q -244 1781 -979 1561 -674 1372 -514 463 L -387 -224 Q -290 -623 -215 -731 L -115 -712 Q -200 -524 -221 -432 -242 -340 -243 -261 -160 -97 -53 -234 41 -532 187 -711 L 363 -668";
	var grd=ctx.createLinearGradient(258.5,433.5,275.5,1648.5);
	grd.addColorStop(0.0,tocolor(ctrans.apply([128,217,255,1])));
	grd.addColorStop(1.0,tocolor(ctrans.apply([254,95,206,1])));
	ctx.fillStyle = grd;
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 363 -668 Q 116 -297 170 -74 615 -2 673 -203 1011 923 925 1709 712 1799 466 1829 220 1858 76 1838 L -156 1799 Q -244 1781 -979 1561 -674 1372 -514 463 L -387 -224 Q -290 -623 -215 -731 L -115 -712 Q -200 -524 -221 -432 -242 -340 -243 -261 -160 -97 -53 -234 41 -532 187 -711 L 363 -668 Z";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([204,102,0,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M -181 -165 Q -161 -159 -156 -121 -149 -82 -163 -32 -176 17 -201 47 -225 79 -245 73 -265 68 -270 28 -275 -10 -262 -59 -248 -109 -225 -140 -201 -170 -181 -165";
	ctx.fillStyle=tocolor(ctrans.apply([255,1,3,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M -181 -165 Q -161 -159 -156 -121 -149 -82 -163 -32 -176 17 -201 47 -225 79 -245 73 -265 68 -270 28 -275 -10 -262 -59 -248 -109 -225 -140 -201 -170 -181 -165 Z";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([204,102,0,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M -38 -18 Q -41 20 -66 31 -91 41 -122 18 -150 -4 -168 -47 -186 -90 -183 -128 -177 -165 -152 -175 -127 -186 -99 -164 -68 -140 -50 -97 -32 -54 -38 -18";
	ctx.fillStyle=tocolor(ctrans.apply([255,1,3,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M -38 -18 Q -41 20 -66 31 -91 41 -122 18 -150 -4 -168 -47 -186 -90 -183 -128 -177 -165 -152 -175 -127 -186 -99 -164 -68 -140 -50 -97 -32 -54 -38 -18 Z";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([204,102,0,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M -184 -94 Q -200 -94 -213 -107 -224 -120 -224 -139 -224 -158 -213 -171 -200 -184 -184 -184 -168 -184 -157 -171 -144 -158 -144 -139 -144 -120 -157 -107 -168 -94 -184 -94";
	ctx.fillStyle=tocolor(ctrans.apply([255,255,255,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M -184 -94 Q -200 -94 -213 -107 -224 -120 -224 -139 -224 -158 -213 -171 -200 -184 -184 -184 -168 -184 -157 -171 -144 -158 -144 -139 -144 -120 -157 -107 -168 -94 -184 -94 Z";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([204,102,0,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M -263 -109 L -319 -107 Q -349 -113 -368 -134 -386 -153 -381 -174 -376 -197 -351 -206 L -295 -208 Q -264 -201 -245 -182 -228 -163 -232 -141 -237 -118 -263 -109";
	ctx.fillStyle=tocolor(ctrans.apply([255,1,3,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M -263 -109 L -319 -107 Q -349 -113 -368 -134 -386 -153 -381 -174 -376 -197 -351 -206 L -295 -208 Q -264 -201 -245 -182 -228 -163 -232 -141 -237 -118 -263 -109 Z";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([204,102,0,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M -183 -404 Q -160 -364 -160 -307 -160 -249 -183 -209 -204 -169 -234 -169 -264 -169 -287 -209 -308 -249 -308 -307 -308 -364 -287 -404 -264 -444 -234 -444 -204 -444 -183 -404";
	ctx.fillStyle=tocolor(ctrans.apply([255,1,3,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M -183 -404 Q -160 -364 -160 -307 -160 -249 -183 -209 -204 -169 -234 -169 -264 -169 -287 -209 -308 -249 -308 -307 -308 -364 -287 -404 -264 -444 -234 -444 -204 -444 -183 -404 Z";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([204,102,0,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M -37 -242 Q -58 -200 -91 -181 -124 -162 -151 -175 -179 -189 -182 -227 -187 -264 -166 -306 -146 -347 -112 -367 -80 -386 -52 -372 -25 -359 -21 -321 -17 -283 -37 -242";
	ctx.fillStyle=tocolor(ctrans.apply([255,1,3,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M -37 -242 Q -58 -200 -91 -181 -124 -162 -151 -175 -179 -189 -182 -227 -187 -264 -166 -306 -146 -347 -112 -367 -80 -386 -52 -372 -25 -359 -21 -321 -17 -283 -37 -242 Z";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([204,102,0,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M -1106 2780 Q -1148 2719 -974 2652 -802 2585 -772 2560 -579 2847 -415 2575 -372 2828 -649 2862 -927 2932 -1106 2780";
	ctx.fillStyle=tocolor(ctrans.apply([255,102,153,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M -1106 2780 Q -927 2932 -649 2862 -372 2828 -415 2575 -579 2847 -772 2560 -802 2585 -974 2652 -1148 2719 -1106 2780 Z";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([204,102,0,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M -807 2569 Q -797 2555 -779 2549 L -730 2553 Q -705 2566 -695 2590 -685 2614 -696 2636 -706 2660 -731 2667 L -769 2668 -774 2685 Q -782 2705 -802 2711 L -844 2707 Q -864 2697 -872 2677 L -876 2665 -892 2672 Q -912 2678 -931 2672 -948 2666 -954 2651 -960 2636 -952 2620 -942 2605 -922 2599 L -894 2597 -907 2578 Q -915 2559 -908 2539 -899 2521 -879 2515 L -841 2519 Q -820 2530 -812 2549 L -807 2569 -814 2579 -819 2601 -814 2579 -807 2569 M -819 2612 L -819 2601 -832 2612 -842 2613 -849 2617 -842 2613 -832 2612 -819 2612 -802 2616 Q -780 2627 -772 2646 -768 2656 -769 2668 -768 2656 -772 2646 -780 2627 -802 2616 L -819 2612 M -863 2614 L -885 2599 -894 2597 -885 2599 -863 2614 -860 2621 -859 2622 -849 2617 -863 2614 M -876 2665 L -864 2651 Q -854 2636 -859 2622 -854 2636 -864 2651 L -876 2665";
	ctx.fillStyle=tocolor(ctrans.apply([255,0,0,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M -807 2569 Q -797 2555 -779 2549 L -730 2553 Q -705 2566 -695 2590 -685 2614 -696 2636 -706 2660 -731 2667 L -769 2668 -774 2685 Q -782 2705 -802 2711 L -844 2707 Q -864 2697 -872 2677 L -876 2665 -892 2672 Q -912 2678 -931 2672 -948 2666 -954 2651 -960 2636 -952 2620 -942 2605 -922 2599 L -894 2597 -907 2578 Q -915 2559 -908 2539 -899 2521 -879 2515 L -841 2519 Q -820 2530 -812 2549 L -807 2569 -814 2579 -819 2601 -819 2612 -802 2616 Q -780 2627 -772 2646 -768 2656 -769 2668 M -894 2597 L -885 2599 -863 2614 -849 2617 -842 2613 -832 2612 -819 2601 M -859 2622 Q -854 2636 -864 2651 L -876 2665 M -863 2614 L -860 2621 -859 2622 -849 2617 M -832 2612 L -819 2612";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([204,102,0,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M 543 3224 Q 579 3396 441 3538 302 3679 228 3584 155 3488 208 3370 259 3251 257 3208 309 3372 543 3224";
	ctx.fillStyle=tocolor(ctrans.apply([255,102,153,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 257 3208 L 252 3189 252 3186 249 3178 M 543 3224 Q 309 3372 257 3208 259 3251 208 3370 155 3488 228 3584 302 3679 441 3538 579 3396 543 3224";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([204,102,0,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M 345 3266 Q 346 3255 350 3244 L 357 3234 350 3244 Q 346 3255 345 3266 L 332 3277 322 3278 315 3282 322 3278 332 3277 345 3277 345 3266 M 395 3333 L 392 3311 Q 384 3292 362 3281 L 345 3277 362 3281 Q 384 3292 392 3311 L 395 3333 390 3350 Q 382 3370 362 3376 L 320 3372 Q 300 3362 292 3342 L 288 3330 272 3337 Q 252 3343 233 3337 216 3331 210 3316 204 3301 212 3285 222 3270 242 3264 L 270 3262 257 3243 Q 249 3224 256 3204 265 3186 285 3180 L 323 3184 Q 344 3195 352 3214 L 357 3234 Q 367 3220 385 3214 L 434 3218 Q 459 3231 469 3255 479 3279 468 3301 458 3325 433 3332 L 395 3333 M 301 3279 Q 293 3269 279 3264 L 270 3262 279 3264 Q 293 3269 301 3279 L 304 3286 305 3287 315 3282 301 3279 M 288 3330 L 300 3316 Q 310 3301 305 3287 310 3301 300 3316 L 288 3330";
	ctx.fillStyle=tocolor(ctrans.apply([255,0,0,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 357 3234 L 350 3244 Q 346 3255 345 3266 L 345 3277 362 3281 Q 384 3292 392 3311 L 395 3333 433 3332 Q 458 3325 468 3301 479 3279 469 3255 459 3231 434 3218 L 385 3214 Q 367 3220 357 3234 L 352 3214 Q 344 3195 323 3184 L 285 3180 Q 265 3186 256 3204 249 3224 257 3243 L 270 3262 279 3264 Q 293 3269 301 3279 L 315 3282 322 3278 332 3277 345 3266 M 395 3333 L 390 3350 Q 382 3370 362 3376 L 320 3372 Q 300 3362 292 3342 L 288 3330 272 3337 Q 252 3343 233 3337 216 3331 210 3316 204 3301 212 3285 222 3270 242 3264 L 270 3262 M 305 3287 Q 310 3301 300 3316 L 288 3330 M 301 3279 L 304 3286 305 3287 315 3282 M 332 3277 L 345 3277";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([204,102,0,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

}

function sprite140(ctx,ctrans,frame,ratio,time){
	ctx.save();
	ctx.transform(1,0,0,1,585.8,322.2);
	var clips = [];
	var frame_cnt = 1;
	frame = frame % frame_cnt;
	switch(frame){
		case 0:
			place("shape109",sunny_canvas,ctx,[0.05,0.0,0.0,0.05,0.0,0.0],ctrans,1,0,0,time);
			place("shape110",sunny_canvas,ctx,[-0.0342620849609375,-0.0079376220703125,-0.00311126708984375,0.0233551025390625,284.2,85.75],ctrans,1,0,0,time);
			place("shape111",sunny_canvas,ctx,[0.05,0.0,0.0,0.05,0.0,0.0],ctrans,1,0,0,time);
			place("shape112",sunny_canvas,ctx,[0.0631622314453125,-0.002462005615234375,0.00248260498046875,0.06367950439453125,-585.8,106.25],ctrans.merge(new cxform(102,204,0,0,0,0,0,256)),1,0,0,time);
			place("shape113",sunny_canvas,ctx,[0.05499954223632812,0.0,0.0,0.05499954223632812,-154.55,153.95],ctrans,1,0,0,time);
			place("shape113",sunny_canvas,ctx,[0.05,0.0,0.0,0.05,-105.55,154.5],ctrans,1,0,0,time);
			place("shape113",sunny_canvas,ctx,[0.05,0.0,0.0,0.05,-294.45,120.6],ctrans,1,0,0,time);
			place("shape113",sunny_canvas,ctx,[0.05499954223632812,0.0,0.0,0.05499954223632812,173.9,153.95],ctrans,1,0,0,time);
			place("shape113",sunny_canvas,ctx,[0.05,0.0,0.0,0.05,265.9,134.5],ctrans,1,0,0,time);
			place("shape113",sunny_canvas,ctx,[0.05,0.0,0.0,0.05,254.45,174.5],ctrans,1,0,0,time);
			place("shape113",sunny_canvas,ctx,[0.05,0.0,0.0,0.05,134.45,194.5],ctrans,1,0,0,time);
			place("shape113",sunny_canvas,ctx,[0.05,0.0,0.0,0.05,-31.3,154.5],ctrans,1,0,0,time);
			place("shape113",sunny_canvas,ctx,[0.05,0.0,0.0,0.05,-125.55,143.7],ctrans,1,0,0,time);
			place("shape113",sunny_canvas,ctx,[0.05,0.0,0.0,0.05,-245.55,174.5],ctrans,1,0,0,time);
			place("shape113",sunny_canvas,ctx,[0.05,0.0,0.0,0.05,-243.25,121.4],ctrans,1,0,0,time);
			place("shape113",sunny_canvas,ctx,[0.05,0.0,0.0,0.05,-160.0,194.5],ctrans,1,0,0,time);
			place("shape113",sunny_canvas,ctx,[0.05499954223632812,0.0,0.0,0.05499954223632812,-186.1,153.95],ctrans,1,0,0,time);
			place("shape113",sunny_canvas,ctx,[0.05499954223632812,0.0,0.0,0.05499954223632812,-6.1,193.95],ctrans,1,0,0,time);
			place("shape113",sunny_canvas,ctx,[0.05,0.0,0.0,0.05,134.45,154.5],ctrans,1,0,0,time);
			place("shape113",sunny_canvas,ctx,[0.05,0.0,0.0,0.05,214.45,154.5],ctrans,1,0,0,time);
			place("shape113",sunny_canvas,ctx,[0.05,0.0,0.0,0.05,234.45,134.5],ctrans,1,0,0,time);
			place("sprite116",sunny_canvas,ctx,[0.031925201416015625,0.0,0.0,0.031925201416015625,-134.35,-148.9],ctrans,1,(0+time)%195,0,time);
			place("shape117",sunny_canvas,ctx,[-0.015128326416015626,0.0,0.0,0.0141326904296875,226.35,-172.85],ctrans,1,0,0,time);
			place("shape118",sunny_canvas,ctx,[0.01905975341796875,0.0,0.0,0.01905975341796875,42.3,-113.35],ctrans,1,0,0,time);
			place("shape119",sunny_canvas,ctx,[0.08356781005859375,0.0,0.0,0.08356781005859375,-167.35,-167.35],ctrans,1,0,0,time);
			place("shape120",sunny_canvas,ctx,[0.0424285888671875,0.0,0.0,0.051441192626953125,-250.45,-137.3],ctrans,1,0,0,time);
			place("shape113",sunny_canvas,ctx,[0.05499954223632812,0.0,0.0,0.05499954223632812,-186.1,133.95],ctrans,1,0,0,time);
			place("shape113",sunny_canvas,ctx,[0.05499954223632812,0.0,0.0,0.05499954223632812,-217.65,133.95],ctrans,1,0,0,time);
			place("shape113",sunny_canvas,ctx,[0.05499954223632812,0.0,0.0,0.05499954223632812,218.5,143.15],ctrans,1,0,0,time);
			place("shape113",sunny_canvas,ctx,[0.05499954223632812,0.0,0.0,0.05499954223632812,186.95,143.15],ctrans,1,0,0,time);
			place("shape113",sunny_canvas,ctx,[0.05,0.0,0.0,0.05,-65.55,149.9],ctrans,1,0,0,time);
			place("shape121",sunny_canvas,ctx,[0.034999847412109375,0.0,0.0,0.034999847412109375,182.15,169.7],ctrans,1,0,0,time);
			place("shape121",sunny_canvas,ctx,[0.05,0.0,0.0,0.05,216.2,101.25],ctrans,1,0,0,time);
			place("sprite139",sunny_canvas,ctx,[0.05183486938476563,0.0,0.0,0.05183486938476563,41.85,160.0],ctrans,1,(0+time)%36,0,time);
			place("shape121",sunny_canvas,ctx,[0.05,0.0,0.0,0.05,-306.5,87.9],ctrans,1,0,0,time);
			place("shape121",sunny_canvas,ctx,[0.05,0.0,0.0,0.05,-232.65,144.45],ctrans,1,0,0,time);
			place("shape121",sunny_canvas,ctx,[0.05,0.0,0.0,0.05,-147.9,195.45],ctrans,1,0,0,time);
			break;
	}
	ctx.restore();
}

var frame = -1;
var time = 0;
var frames = [];
frames.push(0);

var backgroundColor = "#ffffff";
var originalWidth = 1005;
var originalHeight= 705;
function nextFrame(ctx,ctrans){
	var oldframe = frame;
	frame = (frame+1)%frames.length;
	if(frame==oldframe){time++;}else{time=0;};
	drawFrame();
}

function drawFrame(){
	ctx.fillStyle = backgroundColor;
	ctx.fillRect(0,0,sunny_canvas.width,sunny_canvas.height);
	ctx.save();
	ctx.transform(sunny_canvas.width/originalWidth,0,0,sunny_canvas.height/originalHeight,0,0);
	sprite140(ctx,ctrans,frames[frame],0,time);
	ctx.restore();
}

let frame_ctrl = null;
nextFrame(ctx,ctrans);

return {
    start: function(){
        frame_ctrl = window.setInterval(function(){nextFrame(ctx,ctrans);},33);
		sunny_canvas.classList.add("show");
    },
    stop: function(){
        clearInterval(frame_ctrl);
		sunny_canvas.classList.remove("show");
    },
	show: function(){
		sunny_canvas.classList.add("show");
	}
}

})();