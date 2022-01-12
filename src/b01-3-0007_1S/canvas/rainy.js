let rainy_controller = (() => {

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

var rainy_canvas=document.getElementById("rainy");
var ctx=rainy_canvas.getContext("2d");
enhanceContext(ctx);
var ctrans = new cxform(0,0,0,0,255,255,255,255);

var scalingGrids = {};
var boundRects = {};
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
			place("shape158",rainy_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
		case 1:
			place("shape158",rainy_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
		case 2:
			place("shape158",rainy_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
		case 3:
			place("shape158",rainy_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
		case 4:
			place("shape158",rainy_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
		case 5:
			place("shape158",rainy_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
		case 6:
			place("shape158",rainy_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
		case 7:
			place("shape158",rainy_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
		case 8:
			place("shape158",rainy_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
		case 9:
			place("shape158",rainy_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
		case 10:
			place("shape158",rainy_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
		case 11:
			place("shape158",rainy_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
		case 12:
			place("shape158",rainy_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			place("shape159",rainy_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
		case 13:
			place("shape158",rainy_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			place("shape159",rainy_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
		case 14:
			place("shape160",rainy_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
		case 15:
			place("shape160",rainy_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
		case 16:
			place("shape160",rainy_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
	}
}

function shape165(ctx,ctrans,frame,ratio,time){
	var pathData="M 5188 -4022 Q 5569 -4022 5569 -3617 L 5569 4262 Q 5569 4666 5188 4667 L -5220 4667 Q -5600 4666 -5600 4262 L -5600 -3617 Q -5600 -4022 -5220 -4022 L 5188 -4022";
	ctx.fillStyle=tocolor(ctrans.apply([0,102,153,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 5188 -4022 L -5220 -4022 Q -5600 -4022 -5600 -3617 L -5600 4262 Q -5600 4666 -5220 4667 L 5188 4667 Q 5569 4666 5569 4262 L 5569 -3617 Q 5569 -4022 5188 -4022 Z";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([51,204,255,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

}

function shape166(ctx,ctrans,frame,ratio,time){
	var pathData="M 175 -193 Q 207 -195 212 -245 214 -266 237 -282 313 -335 390 -284 441 -250 494 -301 509 -316 530 -319 660 -340 706 -208 722 -161 746 -157 782 -151 813 -178 824 -188 841 -194 L 865 -200 941 -214 Q 984 -220 993 -192 1001 -168 1022 -151 1050 -128 1058 -95 1060 -90 1077 -84 L 1099 -80 1138 -80 1179 -77 Q 1224 -69 1231 -130 1234 -161 1276 -149 L 1294 -127 1315 -90 1360 -124 1394 -149 1438 -114 Q 1463 -109 1468 -114 L 1497 -144 1530 -145 Q 1542 -139 1547 -127 1599 -125 1617 -186 1712 -210 1693 -307 1686 -338 1727 -324 L 1769 -315 Q 1822 -312 1843 -358 1847 -365 1866 -365 L 1925 -365 Q 1935 -365 1950 -350 1994 -374 2014 -409 L 2033 -434 Q 2043 -444 2062 -440 2150 -425 2215 -360 2230 -345 2259 -347 2316 -351 2318 -286 2387 -320 2474 -299 L 2496 -296 Q 2516 -296 2527 -312 2545 -335 2555 -365 L 2574 -424 2667 -426 Q 2693 -433 2708 -465 2732 -512 2766 -547 2781 -562 2809 -557 2924 -536 3028 -505 3059 -496 3071 -451 3076 -434 3105 -434 3125 -434 3145 -444 3166 -346 3198 -252 3204 -237 3221 -224 3244 -208 3267 -202 L 3297 -193 3328 -177 Q 3342 -168 3361 -170 3386 -172 3400 -208 3430 -179 3450 -144 L 3468 -115 Q 3479 -99 3500 -96 3571 -86 3561 -168 3558 -188 3558 -208 3608 -112 3685 -179 L 3702 -206 Q 3737 -299 3831 -244 3843 -237 3853 -237 L 3892 -238 Q 3991 -241 4002 -270 L 4049 -385 Q 4116 -338 4171 -401 4232 -470 4297 -418 4315 -404 4344 -403 4409 -400 4466 -373 4495 -359 4500 -308 4502 -286 4524 -272 4617 -214 4718 -285 4748 -306 4780 -314 L 4799 -309 Q 4873 -261 4950 -220 4974 -207 4988 -185 5020 -136 5017 -70 5016 -34 5047 -5 L 5077 14 Q 5092 19 5104 3 5139 -38 5188 -24 5282 4 5384 16 5407 19 5416 51 5426 88 5426 127 L 5426 186 5480 141 5496 126 5596 195 Q 5623 216 5635 248 5655 303 5628 346 5608 378 5583 382 5614 441 5682 480 5701 491 5709 506 L 5726 558 5726 559 -5667 559 -5673 538 Q -5654 487 -5683 473 -5706 461 -5703 446 -5683 348 -5726 245 -5638 273 -5614 203 -5608 186 -5616 170 -5632 141 -5630 87 -5628 58 -5614 46 -5591 27 -5560 -22 -5614 -87 -5573 -115 -5520 -151 -5452 -157 -5431 -158 -5420 -174 L -5402 -202 Q -5325 -317 -5195 -307 -5175 -306 -5174 -312 L -5156 -371 -5058 -390 Q -5007 -402 -4981 -426 -4930 -473 -4880 -483 L -4861 -424 -4782 -424 Q -4762 -394 -4745 -383 L -4723 -365 Q -4715 -459 -4624 -406 -4547 -362 -4463 -393 -4401 -361 -4427 -297 -4351 -294 -4365 -226 -4369 -207 -4379 -198 -4388 -188 -4408 -188 L -4409 -188 -4428 -188 -4409 -181 Q -4331 -156 -4251 -149 -4219 -146 -4221 -188 -4221 -207 -4206 -218 L -4173 -223 Q -4119 -212 -4113 -149 -4088 -182 -4034 -187 L -3998 -181 Q -3967 -168 -3936 -168 L -3911 -173 -3877 -168 Q -3833 -146 -3779 -149 -3760 -180 -3777 -234 L -3760 -249 -3737 -259 -3662 -273 Q -3619 -279 -3606 -255 -3601 -247 -3582 -247 -3543 -246 -3523 -227 -3515 -337 -3423 -352 -3405 -355 -3386 -343 -3375 -335 -3366 -335 L -3331 -330 Q -3316 -325 -3302 -311 -3287 -296 -3267 -287 -3212 -263 -3217 -187 -3218 -178 -3208 -168 -3155 -184 -3132 -240 -3129 -247 -3111 -251 -3058 -264 -3020 -290 L -2992 -296 -2972 -296 -2932 -293 Q -2896 -288 -2872 -324 L -2861 -347 -2842 -398 -2820 -429 Q -2785 -467 -2747 -434 L -2727 -414 Q -2707 -394 -2706 -365 -2705 -308 -2637 -316 -2557 -326 -2484 -298 -2461 -290 -2467 -245 -2471 -217 -2462 -188 -2438 -113 -2388 -192 -2368 -224 -2343 -223 L -2186 -218 -2145 -222 Q -2103 -231 -2099 -189 -2097 -168 -2082 -155 -2061 -138 -2025 -133 -1998 -129 -1966 -142 -1902 -167 -1887 -131 -1864 -77 -1852 -15 -1769 -25 -1742 -7 -1733 -1 -1720 -16 -1681 -58 -1637 -52 -1625 -50 -1615 -31 -1587 -114 -1513 -78 -1497 -70 -1478 -72 -1313 -86 -1261 9 -1236 -60 -1179 -76 -1163 -80 -1142 -76 L -1088 -60 Q -1064 -50 -1045 -31 -995 -30 -965 -49 -895 -91 -824 -62 L -789 -90 Q -759 -70 -750 -50 L -695 -132 -668 -166 -650 -187 -533 -129 -474 -188 -468 -151 -455 -129 Q -412 -239 -320 -183 L -276 -152 Q -230 -118 -140 -129 -125 -173 -62 -177 L -42 -178 -22 -178 18 -180 175 -193";
	ctx.fillStyle=tocolor(ctrans.apply([47,98,92,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
}

function sprite167(ctx,ctrans,frame,ratio,time){
	var clips = [];
	var frame_cnt = 1;
	frame = frame % frame_cnt;
	switch(frame){
		case 0:
			place("shape166",rainy_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
	}
}

function shape168(ctx,ctrans,frame,ratio,time){
	var pathData="M 5568 4772 L -5600 4772 -5600 2324 5568 2324 5568 4772";
	var grd=ctx.createLinearGradient(-17.0,4324.25,-17.0,2771.75);
	grd.addColorStop(0.03137254901960784,tocolor(ctrans.apply([51,204,255,1])));
	grd.addColorStop(1.0,tocolor(ctrans.apply([0,102,153,1])));
	ctx.fillStyle = grd;
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
}

function shape169(ctx,ctrans,frame,ratio,time){
	var pathData="M 228 -229 Q 323 -134 323 0 323 134 228 228 134 323 0 323 -134 323 -229 228 -323 134 -323 0 -323 -134 -229 -229 -134 -323 0 -323 134 -323 228 -229";
	drawPath(ctx,pathData,false);
	ctx.fillStyle=tocolor(ctrans.apply([255,255,255,1]));
	ctx.fill("evenodd");
	ctx.save();
	ctx.clip();
	ctx.transform(0.0201416015625,0,0,0.0201416015625,0,0);
	var grd=ctx.createRadialGradient(0.0,0,0,0,0,16384);
	grd.addColorStop(0.8705882352941177,tocolor(ctrans.apply([98,98,234,0.0])));
	grd.addColorStop(1.0,tocolor(ctrans.apply([255,255,255,1])));
	ctx.fillStyle = grd;
	ctx.fillRect(-16384,-16384,32768,32768);
	ctx.restore();
}

function sprite170(ctx,ctrans,frame,ratio,time){
	var clips = [];
	var frame_cnt = 15;
	frame = frame % frame_cnt;
	switch(frame){
		case 0:
			place("shape169",rainy_canvas,ctx,[1.0,0.0,0.0,1.0,27.0,47.0],ctrans,1,0,0,time);
			break;
		case 1:
			place("shape169",rainy_canvas,ctx,[1.224456787109375,0.0,0.0,1.224456787109375,27.0,47.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,230)),1,0,0,time);
			break;
		case 2:
			place("shape169",rainy_canvas,ctx,[1.44891357421875,0.0,0.0,1.44891357421875,27.0,47.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,205)),1,0,0,time);
			break;
		case 3:
			place("shape169",rainy_canvas,ctx,[1.673370361328125,0.0,0.0,1.673370361328125,27.0,47.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,179)),1,0,0,time);
			place("shape169",rainy_canvas,ctx,[1.0,0.0,0.0,1.0,27.0,47.0],ctrans,1,0,0,time);
			break;
		case 4:
			place("shape169",rainy_canvas,ctx,[1.8978424072265625,0.0,0.0,1.8978424072265625,27.0,47.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,154)),1,0,0,time);
			place("shape169",rainy_canvas,ctx,[1.224456787109375,0.0,0.0,1.224456787109375,27.0,47.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,230)),1,0,0,time);
			break;
		case 5:
			place("shape169",rainy_canvas,ctx,[2.1222991943359375,0.0,0.0,2.1222991943359375,27.0,47.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,128)),1,0,0,time);
			place("shape169",rainy_canvas,ctx,[1.44891357421875,0.0,0.0,1.44891357421875,27.0,47.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,205)),1,0,0,time);
			break;
		case 6:
			place("shape169",rainy_canvas,ctx,[2.3467559814453125,0.0,0.0,2.3467559814453125,27.0,47.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,102)),1,0,0,time);
			place("shape169",rainy_canvas,ctx,[1.673370361328125,0.0,0.0,1.673370361328125,27.0,47.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,179)),1,0,0,time);
			place("shape169",rainy_canvas,ctx,[1.0,0.0,0.0,1.0,27.0,47.0],ctrans,1,0,0,time);
			break;
		case 7:
			place("shape169",rainy_canvas,ctx,[2.5712127685546875,0.0,0.0,2.5712127685546875,27.0,47.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,77)),1,0,0,time);
			place("shape169",rainy_canvas,ctx,[1.8978424072265625,0.0,0.0,1.8978424072265625,27.0,47.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,154)),1,0,0,time);
			place("shape169",rainy_canvas,ctx,[1.224456787109375,0.0,0.0,1.224456787109375,27.0,47.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,230)),1,0,0,time);
			break;
		case 8:
			place("shape169",rainy_canvas,ctx,[2.7956695556640625,0.0,0.0,2.7956695556640625,27.0,47.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,51)),1,0,0,time);
			place("shape169",rainy_canvas,ctx,[2.1222991943359375,0.0,0.0,2.1222991943359375,27.0,47.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,128)),1,0,0,time);
			place("shape169",rainy_canvas,ctx,[1.44891357421875,0.0,0.0,1.44891357421875,27.0,47.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,205)),1,0,0,time);
			break;
		case 9:
			place("shape169",rainy_canvas,ctx,[2.3467559814453125,0.0,0.0,2.3467559814453125,27.0,47.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,102)),1,0,0,time);
			place("shape169",rainy_canvas,ctx,[1.673370361328125,0.0,0.0,1.673370361328125,27.0,47.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,179)),1,0,0,time);
			break;
		case 10:
			place("shape169",rainy_canvas,ctx,[2.5712127685546875,0.0,0.0,2.5712127685546875,27.0,47.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,77)),1,0,0,time);
			place("shape169",rainy_canvas,ctx,[1.8978424072265625,0.0,0.0,1.8978424072265625,27.0,47.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,154)),1,0,0,time);
			break;
		case 11:
			place("shape169",rainy_canvas,ctx,[2.7956695556640625,0.0,0.0,2.7956695556640625,27.0,47.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,51)),1,0,0,time);
			place("shape169",rainy_canvas,ctx,[2.1222991943359375,0.0,0.0,2.1222991943359375,27.0,47.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,128)),1,0,0,time);
			break;
		case 12:
			place("shape169",rainy_canvas,ctx,[2.3467559814453125,0.0,0.0,2.3467559814453125,27.0,47.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,102)),1,0,0,time);
			break;
		case 13:
			place("shape169",rainy_canvas,ctx,[2.5712127685546875,0.0,0.0,2.5712127685546875,27.0,47.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,77)),1,0,0,time);
			break;
		case 14:
			place("shape169",rainy_canvas,ctx,[2.7956695556640625,0.0,0.0,2.7956695556640625,27.0,47.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,51)),1,0,0,time);
			break;
	}
}

function shape171(ctx,ctrans,frame,ratio,time){
	var pathData="M -343 -411 Q -628 -519 -1116 -880 -1511 -1172 -1680 -1312 -1763 -1383 -1791 -1398 L -1951 -1465 -1980 -1476 Q -2124 -1537 -2158 -1613 -2174 -1650 -2164 -1725 -2158 -1762 -2079 -1708 -1993 -1641 -1990 -1666 L -1990 -1675 Q -1995 -1705 -2040 -1783 -2086 -1862 -2247 -1803 -2408 -1745 -2415 -1894 -2423 -2043 -2174 -2140 L -2058 -2098 Q -1898 -2041 -1860 -1903 L -1809 -1717 -1770 -1597 -1737 -1516 Q -1717 -1476 -1645 -1427 L -1453 -1285 Q -1331 -1190 -920 -1057 -508 -924 -431 -817 -354 -711 -303 -659 L -318 -668 Q -309 -662 -335 -665 -366 -669 -381 -648 -397 -627 -375 -623 L -365 -619 -357 -547 Q -370 -500 -370 -460 -370 -420 -344 -415 L -343 -411";
	ctx.fillStyle=tocolor(ctrans.apply([253,236,208,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M -303 -659 Q -354 -711 -431 -817 -508 -924 -920 -1057 -1331 -1190 -1453 -1285 L -1645 -1427 Q -1717 -1476 -1737 -1516 L -1770 -1597 -1809 -1717 -1860 -1903 Q -1898 -2041 -2058 -2098 L -2174 -2140 Q -2423 -2043 -2415 -1894 -2408 -1745 -2247 -1803 -2086 -1862 -2040 -1783 -1995 -1705 -1990 -1675 L -1990 -1666 Q -1993 -1641 -2079 -1708 -2158 -1762 -2164 -1725 -2174 -1650 -2158 -1613 -2124 -1537 -1980 -1476 L -1951 -1465 -1791 -1398 Q -1763 -1383 -1680 -1312 -1511 -1172 -1116 -880 -628 -519 -343 -411";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([204,102,0,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="butt";
	ctx.lineJoin="miter";
	ctx.miterLimit=3.0;
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M -343 -411 L -344 -415 M -343 -411 L -338 -409";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([204,102,0,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="miter";
	ctx.miterLimit=3.0;
	drawPath(ctx,pathData,true,scaleMode);

}

function shape172(ctx,ctrans,frame,ratio,time){
	var pathData="M -467 201 L -342 220 Q -264 231 -275 309 L -856 4286 Q -864 4304 -873 4372 -883 4440 -931 4604 L -970 4699 Q -1043 4879 -1183 4972 -1324 5065 -1432 5086 L -1784 5072 Q -2027 5036 -2171 4814 -2315 4592 -2331 4457 -2347 4322 -2340 4216 -2333 4109 -2306 4025 -2279 3941 -2204 3932 -2130 3923 -2058 3959 -1987 3994 -2034 4176 -2080 4357 -1976 4561 -1872 4765 -1642 4790 -1413 4814 -1313 4653 -1214 4492 -1134 4195 L -1123 4093 -556 268 Q -545 190 -467 201";
	ctx.fillStyle=tocolor(ctrans.apply([102,153,0,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M -467 201 Q -545 190 -556 268 L -1123 4093 -1134 4195 Q -1214 4492 -1313 4653 -1413 4814 -1642 4790 -1872 4765 -1976 4561 -2080 4357 -2034 4176 -1987 3994 -2058 3959 -2130 3923 -2204 3932 -2279 3941 -2306 4025 -2333 4109 -2340 4216 -2347 4322 -2331 4457 -2315 4592 -2171 4814 -2027 5036 -1784 5072 L -1432 5086 Q -1324 5065 -1183 4972 -1043 4879 -970 4699 L -931 4604 Q -883 4440 -873 4372 -864 4304 -856 4286 L -275 309 Q -264 231 -342 220 L -467 201 Z";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([255,255,255,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M 605 -5049 Q 634 -5011 626 -4963 L 549 -4526 Q 540 -4479 499 -4449 459 -4418 412 -4423 L 388 -4426 Q 340 -4431 311 -4469 283 -4506 292 -4553 L 369 -4991 Q 377 -5038 417 -5069 458 -5099 506 -5093 L 529 -5091 Q 577 -5086 605 -5049";
	ctx.fillStyle=tocolor(ctrans.apply([102,153,0,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 605 -5049 Q 577 -5086 529 -5091 L 506 -5093 Q 458 -5099 417 -5069 377 -5038 369 -4991 L 292 -4553 Q 283 -4506 311 -4469 340 -4431 388 -4426 L 412 -4423 Q 459 -4418 499 -4449 540 -4479 549 -4526 L 626 -4963 Q 634 -5011 605 -5049 Z";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([255,255,255,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M -5585 -1422 L -5588 -1406";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([255,255,255,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M -5585 -1422 L -5586 -1426 Q -5339 -2798 -3872 -3702 -2235 -4711 -37 -4547 2160 -4383 3630 -3144 4368 -2521 4701 -1807 5037 -1104 4981 -313 L 4979 -293 4970 -195 4957 -98 Q 4952 -94 4946 -20 4938 54 4846 105 4754 155 4544 188 4334 221 4285 237 L 3634 366 Q 3281 436 2874 478 2460 421 2342 381 2295 366 2252 340 L 2161 285 Q 2121 264 2086 231 L 2038 185 Q 1923 116 1529 40 1134 -37 825 -2 517 34 29 243 L -360 278 Q -476 219 -926 126 -1366 40 -1596 -147 L -1760 -291 Q -1858 -372 -1988 -425 -2315 -606 -2499 -590 L -2925 -553 Q -3168 -532 -3329 -424 -3490 -317 -3901 -387 -5491 -1027 -5585 -1422 Z";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([255,255,255,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M 4946 -20 Q 4938 54 4846 105 4754 155 4544 188 4334 221 4285 237 L 3634 366 Q 3281 436 2874 478 2460 421 2342 381 2295 366 2252 340 L 2161 285 Q 2121 264 2086 231 L 2038 185 Q 1923 116 1529 40 1134 -37 825 -2 517 34 29 243 L -360 278 Q -476 219 -926 126 -1366 40 -1596 -147 L -1760 -291 Q -1858 -372 -1988 -425 -2315 -606 -2499 -590 L -2925 -553 Q -3168 -532 -3329 -424 -3490 -317 -3901 -387 -5491 -1027 -5585 -1422 L -5586 -1426 Q -5339 -2798 -3872 -3702 -2235 -4711 -37 -4547 2160 -4383 3630 -3144 4368 -2521 4701 -1807 5037 -1104 4981 -313 L 4979 -293 4970 -195 4957 -98 Q 4952 -94 4946 -20";
	ctx.fillStyle=tocolor(ctrans.apply([102,204,102,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 433 -4499 Q 185 -4453 -198 -4343 -964 -4122 -1632 -3797 -2569 -3342 -3179 -2742 -3941 -1993 -4147 -1059";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([255,255,255,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M -4227 -519 L -4147 -1059";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([255,255,255,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M 433 -4499 Q 632 -4414 929 -4231 1523 -3866 2014 -3379 2701 -2697 3084 -1866 3562 -829 3533 381";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([255,255,255,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M -627 201 Q -632 -49 -625 -434 -609 -1204 -536 -1878 -301 -4044 433 -4499";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([255,255,255,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M 4311 -890 Q 4351 -924 4375 -910 4398 -896 4391 -844 4383 -791 4349 -731 4315 -671 4274 -637 4234 -604 4211 -618 L 4209 -619 Q 4191 -622 4166 -641 4124 -675 4090 -735 4055 -795 4047 -847 4039 -900 4063 -914 4086 -928 4128 -895 4170 -862 4205 -801 L 4222 -769 4237 -797 Q 4270 -858 4311 -890";
	ctx.fillStyle=tocolor(ctrans.apply([255,255,255,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 4573 -492 Q 4607 -452 4593 -428 4579 -405 4527 -412 4474 -420 4414 -454 4354 -488 4320 -529 4287 -569 4301 -592 L 4302 -594 Q 4305 -612 4324 -637 4358 -679 4418 -713 4478 -748 4530 -756 4583 -764 4597 -740 4611 -717 4578 -675 4545 -633 4484 -598 L 4452 -581 4480 -566 Q 4541 -533 4573 -492";
	ctx.fillStyle=tocolor(ctrans.apply([255,255,255,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 3887 -674 Q 3853 -714 3867 -738 3881 -761 3933 -754 3986 -746 4046 -712 4106 -678 4140 -637 4173 -597 4159 -574 L 4158 -572 Q 4155 -554 4136 -529 4102 -487 4042 -453 3982 -418 3930 -410 3877 -402 3863 -426 3849 -449 3882 -491 3915 -533 3976 -568 L 4008 -585 3980 -600 Q 3919 -633 3887 -674";
	ctx.fillStyle=tocolor(ctrans.apply([255,255,255,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 4140 -277 Q 4100 -243 4076 -257 4053 -271 4060 -323 4068 -376 4102 -436 4136 -496 4177 -530 4217 -563 4240 -549 L 4242 -548 Q 4260 -545 4285 -526 4327 -492 4361 -432 4396 -372 4404 -320 4412 -267 4388 -253 4365 -239 4323 -272 4281 -305 4246 -366 L 4229 -398 4214 -370 Q 4181 -309 4140 -277";
	ctx.fillStyle=tocolor(ctrans.apply([255,255,255,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 1612 -1060 Q 1652 -1094 1676 -1080 1699 -1066 1692 -1014 1684 -961 1650 -901 1616 -841 1575 -807 1535 -774 1512 -788 L 1510 -789 Q 1492 -792 1467 -811 1425 -845 1391 -905 1356 -965 1348 -1017 1340 -1070 1364 -1084 1387 -1098 1429 -1065 1471 -1032 1506 -971 L 1523 -939 1538 -967 Q 1571 -1028 1612 -1060";
	ctx.fillStyle=tocolor(ctrans.apply([255,255,255,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 1874 -662 Q 1908 -622 1894 -598 1880 -575 1828 -582 1775 -590 1715 -624 1655 -658 1621 -699 1588 -739 1602 -762 L 1603 -764 Q 1606 -782 1625 -807 1659 -849 1719 -883 1779 -918 1831 -926 1884 -934 1898 -910 1912 -887 1879 -845 1846 -803 1785 -768 L 1753 -751 1781 -736 Q 1842 -703 1874 -662";
	ctx.fillStyle=tocolor(ctrans.apply([255,255,255,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 1188 -844 Q 1154 -884 1168 -908 1182 -931 1234 -924 1287 -916 1347 -882 1407 -848 1441 -807 1474 -767 1460 -744 L 1459 -742 Q 1456 -724 1437 -699 1403 -657 1343 -623 1283 -588 1231 -580 1178 -572 1164 -596 1150 -619 1183 -661 1216 -703 1277 -738 L 1309 -755 1281 -770 Q 1220 -803 1188 -844";
	ctx.fillStyle=tocolor(ctrans.apply([255,255,255,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 1441 -447 Q 1401 -413 1377 -427 1354 -441 1361 -493 1369 -546 1403 -606 1437 -666 1478 -700 1518 -733 1541 -719 L 1543 -718 Q 1561 -715 1586 -696 1628 -662 1662 -602 1697 -542 1705 -490 1713 -437 1689 -423 1666 -409 1624 -442 1582 -475 1547 -536 L 1530 -568 1515 -540 Q 1482 -479 1441 -447";
	ctx.fillStyle=tocolor(ctrans.apply([255,255,255,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M -2034 -1559 Q -1994 -1593 -1970 -1579 -1947 -1565 -1954 -1513 -1962 -1460 -1996 -1400 -2030 -1340 -2071 -1306 -2111 -1273 -2134 -1287 L -2136 -1288 Q -2154 -1291 -2179 -1310 -2221 -1344 -2255 -1404 -2290 -1464 -2298 -1516 -2306 -1569 -2282 -1583 -2259 -1597 -2217 -1564 -2175 -1531 -2140 -1470 L -2123 -1438 -2108 -1466 Q -2075 -1527 -2034 -1559";
	ctx.fillStyle=tocolor(ctrans.apply([255,255,255,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M -1772 -1161 Q -1738 -1121 -1752 -1097 -1766 -1074 -1818 -1081 -1871 -1089 -1931 -1123 -1991 -1157 -2025 -1198 -2058 -1238 -2044 -1261 L -2043 -1263 Q -2040 -1281 -2021 -1306 -1987 -1348 -1927 -1382 -1867 -1417 -1815 -1425 -1762 -1433 -1748 -1409 -1734 -1386 -1767 -1344 -1800 -1302 -1861 -1267 L -1893 -1250 -1865 -1235 Q -1804 -1202 -1772 -1161";
	ctx.fillStyle=tocolor(ctrans.apply([255,255,255,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M -2458 -1343 Q -2492 -1383 -2478 -1407 -2464 -1430 -2412 -1423 -2359 -1415 -2299 -1381 -2239 -1347 -2205 -1306 -2172 -1266 -2186 -1243 L -2187 -1241 Q -2190 -1223 -2209 -1198 -2243 -1156 -2303 -1122 -2363 -1087 -2415 -1079 -2468 -1071 -2482 -1095 -2496 -1118 -2463 -1160 -2430 -1202 -2369 -1237 L -2337 -1254 -2365 -1269 Q -2426 -1302 -2458 -1343";
	ctx.fillStyle=tocolor(ctrans.apply([255,255,255,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M -2205 -946 Q -2245 -912 -2269 -926 -2292 -940 -2285 -992 -2277 -1045 -2243 -1105 -2209 -1165 -2168 -1199 -2128 -1232 -2105 -1218 L -2103 -1217 Q -2085 -1214 -2060 -1195 -2018 -1161 -1984 -1101 -1949 -1041 -1941 -989 -1933 -936 -1957 -922 -1980 -908 -2022 -941 -2064 -974 -2099 -1035 L -2116 -1067 -2131 -1039 Q -2164 -978 -2205 -946";
	ctx.fillStyle=tocolor(ctrans.apply([255,255,255,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M -4603 -2314 Q -4563 -2348 -4539 -2334 -4516 -2320 -4523 -2268 -4531 -2215 -4565 -2155 -4599 -2095 -4640 -2061 -4680 -2028 -4703 -2042 L -4705 -2043 Q -4723 -2046 -4748 -2065 -4790 -2099 -4824 -2159 -4859 -2219 -4867 -2271 -4875 -2324 -4851 -2338 -4828 -2352 -4786 -2319 -4744 -2286 -4709 -2225 L -4692 -2193 -4677 -2221 Q -4644 -2282 -4603 -2314";
	ctx.fillStyle=tocolor(ctrans.apply([255,255,255,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M -4341 -1916 Q -4307 -1876 -4321 -1852 -4335 -1829 -4387 -1836 -4440 -1844 -4500 -1878 -4560 -1912 -4594 -1953 -4627 -1993 -4613 -2016 L -4612 -2018 Q -4609 -2036 -4590 -2061 -4556 -2103 -4496 -2137 -4436 -2172 -4384 -2180 -4331 -2188 -4317 -2164 -4303 -2141 -4336 -2099 -4369 -2057 -4430 -2022 L -4462 -2005 -4434 -1990 Q -4373 -1957 -4341 -1916";
	ctx.fillStyle=tocolor(ctrans.apply([255,255,255,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M -5027 -2098 Q -5061 -2138 -5047 -2162 -5033 -2185 -4981 -2178 -4928 -2170 -4868 -2136 -4808 -2102 -4774 -2061 -4741 -2021 -4755 -1998 L -4756 -1996 Q -4759 -1978 -4778 -1953 -4812 -1911 -4872 -1877 -4932 -1842 -4984 -1834 -5037 -1826 -5051 -1850 -5065 -1873 -5032 -1915 -4999 -1957 -4938 -1992 L -4906 -2009 Q -4920 -2015 -4934 -2024 -4995 -2057 -5027 -2098";
	ctx.fillStyle=tocolor(ctrans.apply([255,255,255,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M -4774 -1701 Q -4814 -1667 -4838 -1681 -4861 -1695 -4854 -1747 -4846 -1800 -4812 -1860 -4778 -1920 -4737 -1954 -4697 -1987 -4674 -1973 L -4672 -1972 -4629 -1950 Q -4587 -1916 -4553 -1856 -4518 -1796 -4510 -1744 -4502 -1691 -4526 -1677 -4549 -1663 -4591 -1696 -4633 -1729 -4668 -1790 L -4685 -1822 -4700 -1794 Q -4733 -1733 -4774 -1701";
	ctx.fillStyle=tocolor(ctrans.apply([255,255,255,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 1294 -92 Q 1388 -116 1419 -113 1548 -104 1718 -53 1997 29 2150 176 2298 318 2928 365 L 4352 211 Q 4445 218 4496 166 4523 138 4564 48 4602 -38 4643 -71 4706 -122 4819 -114 5025 -99 5046 82 5056 174 5024 277 5022 307 5051 385 5079 463 5077 500 5064 674 4968 699 L 4631 689 Q 4592 721 4530 747 4408 796 4275 757 4207 977 3993 961 3911 955 3847 902 L 3774 826 Q 3667 838 3584 877 3529 901 3396 892 3241 1033 3142 1026 3118 1024 3045 983 2962 936 2923 891 L 2811 941 Q 2737 971 2701 969 2670 966 2601 928 2533 892 2497 859 2411 997 2259 986 2070 972 1997 894 L 1927 811 Q 1875 752 1806 704 1763 675 1588 589 1485 538 1403 434 1393 497 1322 549 1242 606 1150 599 1129 597 938 464 L 814 477 598 483 Q -114 734 -123 733 -142 732 -331 624 -354 622 -418 664 -483 706 -552 701 -578 699 -648 658 -727 611 -768 563 -931 648 -990 644 -1115 634 -1178 551 -1210 509 -1233 493 -1272 467 -1343 464 -1455 460 -1533 365 -1596 289 -1600 219 -1694 262 -1778 256 -1947 243 -2016 121 L -2054 38 Q -2071 0 -2091 -2 -2122 -4 -2179 20 -2235 43 -2267 41 -2283 40 -2474 -68 -2484 -39 -2543 -4 -2617 40 -2698 34 -2769 29 -2829 -39 -2911 -132 -2947 -154 -3142 -24 -3735 32 -3835 25 -3905 -37 -3966 -107 -3993 -125 -4016 -140 -4178 -159 -4339 -178 -4390 -211 -4433 -237 -4480 -296 L -4555 -393 Q -4622 -469 -4801 -472 L -4931 -483 Q -5000 -500 -5042 -551 -5177 -714 -5320 -811 -5376 -850 -5520 -924 -5610 -970 -5647 -1034 -5683 -1099 -5689 -1354 -5696 -1609 -5388 -1504 -4818 -1117 -4718 -999 -4651 -921 -4455 -869 -4247 -814 -4151 -725 -4031 -619 -3652 -541 L -2830 -708 Q -2800 -706 -2721 -675 -2642 -644 -2610 -642 L -2500 -659 -2392 -676 Q -2186 -661 -1563 -347 L -1145 -134 Q -955 -37 -927 -34 L -805 -50 -684 -66 Q -602 -60 -425 6 L -236 73 Q -173 78 -37 49 L 257 -13 Q 717 -104 1168 -70 1200 -68 1294 -92";
	ctx.fillStyle=tocolor(ctrans.apply([255,255,255,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
}

function sprite173(ctx,ctrans,frame,ratio,time){
	var clips = [];
	var frame_cnt = 1;
	frame = frame % frame_cnt;
	switch(frame){
		case 0:
			place("shape172",rainy_canvas,ctx,[1.0,0.0,0.0,1.0,1123.0,3717.0],ctrans,1,0,0,time);
			break;
	}
}

function shape174(ctx,ctrans,frame,ratio,time){
	var pathData="M -1951 -1465 L -1980 -1476 Q -2124 -1537 -2158 -1613 -2174 -1650 -2164 -1725 -2158 -1762 -2079 -1708 -1993 -1641 -1990 -1666 L -1990 -1675 -1978 -1669 -1937 -1603 -1934 -1493 -1944 -1476 -1950 -1468 -1951 -1465";
	ctx.fillStyle=tocolor(ctrans.apply([253,236,208,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M -1951 -1465 L -1980 -1476 Q -2124 -1537 -2158 -1613 -2174 -1650 -2164 -1725 -2158 -1762 -2079 -1708 -1993 -1641 -1990 -1666 L -1990 -1675";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([204,102,0,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="butt";
	ctx.lineJoin="miter";
	ctx.miterLimit=3.0;
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M 1512 1185 L 1581 1289 Q 902 1582 779 1626 683 1661 670 1661 655 1662 596 1632 547 1607 509 1441 L 481 1278 807 1210 801 1461 Q 927 1443 1469 1210 L 1512 1185";
	ctx.fillStyle=tocolor(ctrans.apply([254,230,196,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 1512 1185 Q 1541 1162 1552 1134 1567 1094 1600 1084 1655 1068 1691 1090 1725 1114 1755 1189 1784 1262 1798 1473 1761 1607 1689 1427 1615 1245 1605 1278 L 1581 1289 1512 1185";
	ctx.fillStyle=tocolor(ctrans.apply([255,0,0,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 1512 1185 L 1581 1289";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([204,102,0,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M 1581 1289 L 1605 1278 Q 1615 1245 1689 1427 1761 1607 1798 1473 1784 1262 1755 1189 1725 1114 1691 1090 1655 1068 1600 1084 1567 1094 1552 1134 1541 1162 1512 1185 L 1469 1210 Q 927 1443 801 1461 L 807 1210 481 1278 509 1441 Q 547 1607 596 1632 655 1662 670 1661 683 1661 779 1626 902 1582 1581 1289";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([204,102,0,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="miter";
	ctx.miterLimit=3.0;
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M -1760 1592 Q -1629 1551 -882 1027 -703 953 -640 991 -609 1010 -614 1044 L -1658 1710 -1760 1592";
	ctx.fillStyle=tocolor(ctrans.apply([254,230,196,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M -1760 1592 L -1658 1710 -1812 1808 Q -2007 1648 -2074 1478 L -2078 1470 Q -2085 1380 -2039 1427 -1957 1500 -1774 1585 L -1760 1592";
	ctx.fillStyle=tocolor(ctrans.apply([255,0,0,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M -1658 1710 L -614 1044 Q -609 1010 -640 991 -703 953 -882 1027 -1629 1551 -1760 1592 L -1658 1710 -1812 1808 Q -2007 1648 -2074 1478 L -2078 1470 Q -2085 1380 -2039 1427 -1957 1500 -1774 1585 L -1760 1592";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([204,102,0,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M -471 588 L 156 913 -670 1296 -933 1039 -471 588";
	ctx.fillStyle=tocolor(ctrans.apply([204,0,51,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M -471 588 L -933 1039 -670 1296 156 913 -471 588 Z";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([204,102,0,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="butt";
	ctx.lineJoin="miter";
	ctx.miterLimit=3.0;
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M 506 750 Q 703 710 887 680 921 804 889 943 L 853 1073 Q 858 1102 989 1307 L 350 1558 Q 293 1468 165 1168 L 48 885 Q 112 832 506 750";
	ctx.fillStyle=tocolor(ctrans.apply([204,0,51,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 506 750 Q 112 832 48 885 L 165 1168 Q 293 1468 350 1558 L 989 1307 Q 858 1102 853 1073 L 889 943 Q 921 804 887 680 703 710 506 750 Z";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([204,102,0,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M 1315 -365 L 1532 -315 Q 1761 -258 1822 -234 1887 -206 1958 -200 L 2038 -205 Q 2067 -219 2245 -160 2437 -95 2456 -29 2444 12 2359 -45 2306 -81 2227 -98 L 2159 -108 2272 -69 Q 2391 -18 2427 46 2485 149 2336 46 L 2096 -79 Q 2161 -37 2225 4 2364 108 2410 211 2485 377 2302 194 2142 34 2038 -11 L 2062 138 Q 2038 251 1982 120 L 1945 -15 Q 1934 -58 1862 -85 L 1286 -257 1315 -365";
	ctx.fillStyle=tocolor(ctrans.apply([254,230,196,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 1315 -365 L 1532 -315 Q 1761 -258 1822 -234 1887 -206 1958 -200 L 2038 -205 Q 2067 -219 2245 -160 2437 -95 2456 -29 2444 12 2359 -45 2306 -81 2227 -98 L 2159 -108 2272 -69 Q 2391 -18 2427 46 2485 149 2336 46 L 2096 -79 Q 2161 -37 2225 4 2364 108 2410 211 2485 377 2302 194 2142 34 2038 -11 L 2062 138 Q 2038 251 1982 120 L 1945 -15 Q 1934 -58 1862 -85 L 1286 -257 1315 -365 Z";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([204,102,0,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="butt";
	ctx.lineJoin="miter";
	ctx.miterLimit=3.0;
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M -762 -768 L -717 -895 Q -649 -917 -348 -778 -198 -708 -61 -633 L -230 -366 Q -327 -363 -590 -484 -847 -603 -826 -624 -811 -639 -762 -768";
	var grd=ctx.createLinearGradient(-786.0,-742.5,-106.0,-505.5);
	grd.addColorStop(0.0,tocolor(ctrans.apply([253,253,62,1])));
	grd.addColorStop(1.0,tocolor(ctrans.apply([255,159,17,1])));
	ctx.fillStyle = grd;
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M -762 -768 Q -811 -639 -826 -624 -847 -603 -590 -484 -327 -363 -230 -366 L -61 -633 Q -198 -708 -348 -778 -649 -917 -717 -895 L -762 -768 Z";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([204,102,0,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M -403 234 L -402 231 Q -262 -76 -243 -160 -221 -255 -221 -471 L -226 -667 253 -541 Q 760 -545 1134 -481 1320 -449 1406 -417 1406 -291 1286 -92 1130 -141 975 -107 L 853 -63 Q 883 36 910 299 L 923 457 Q 215 496 -169 366 -290 326 -364 273 L -405 237 -403 234 M 930 628 Q 931 730 921 811 899 993 607 987 L 353 962 122 935 Q -59 928 -279 846 -478 773 -522 719 -556 677 -557 649 L -544 565 Q -541 540 -471 385 L -396 433 Q -280 497 -134 545 332 698 930 628";
	var grd=ctx.createLinearGradient(980.5,-146.0,-442.5,460.0);
	grd.addColorStop(0.0,tocolor(ctrans.apply([253,253,62,1])));
	grd.addColorStop(1.0,tocolor(ctrans.apply([255,159,17,1])));
	ctx.fillStyle = grd;
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M -405 237 L -364 273 Q -290 326 -169 366 215 496 923 457 L 930 628 Q 332 698 -134 545 -280 497 -396 433 L -471 385 -405 237";
	ctx.fillStyle=tocolor(ctrans.apply([247,123,0,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 923 457 L 910 299 Q 883 36 853 -63 L 975 -107 Q 1130 -141 1286 -92 1406 -291 1406 -417 1320 -449 1134 -481 760 -545 253 -541 L -226 -667 -221 -471 Q -221 -255 -243 -160 -262 -76 -402 231 L -403 234";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([204,102,0,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="butt";
	ctx.lineJoin="miter";
	ctx.miterLimit=3.0;
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M 923 457 L 930 628 Q 931 730 921 811 899 993 607 987 L 353 962 122 935 Q -59 928 -279 846 -478 773 -522 719 -556 677 -557 649 L -544 565 Q -541 540 -471 385 L -405 237";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([204,102,0,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="miter";
	ctx.miterLimit=3.0;
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M 75 -322 L 25 -439 Q 118 -535 443 -548 606 -554 750 -541 805 -351 747 -273 726 -247 685 -225 L 618 -194 Q 524 -139 419 -114 269 -76 203 -137 138 -194 75 -322";
	var grd=ctx.createLinearGradient(228.25,-118.0,579.75,-652.0);
	grd.addColorStop(0.0,tocolor(ctrans.apply([253,253,62,1])));
	grd.addColorStop(1.0,tocolor(ctrans.apply([255,255,255,1])));
	ctx.fillStyle = grd;
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 75 -322 Q 138 -194 203 -137 269 -76 419 -114 524 -139 618 -194 L 685 -225 Q 726 -247 747 -273 805 -351 750 -541 606 -554 443 -548 118 -535 25 -439 L 75 -322 Z";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([204,102,0,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="butt";
	ctx.lineJoin="miter";
	ctx.miterLimit=3.0;
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M -228 -582 L -159 -538 Q -63 -493 69 -501 L 64 -467 Q 55 -424 34 -385 -33 -258 -248 -205 L -228 -582";
	var grd=ctx.createLinearGradient(-125.0,-388.5,-23.0,-803.5);
	grd.addColorStop(0.0,tocolor(ctrans.apply([253,253,62,1])));
	grd.addColorStop(1.0,tocolor(ctrans.apply([255,255,255,1])));
	ctx.fillStyle = grd;
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M -228 -582 L -159 -538 Q -63 -493 69 -501 L 64 -467 Q 55 -424 34 -385 -33 -258 -248 -205 L -228 -582 Z";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([204,102,0,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

}

function shape175(ctx,ctrans,frame,ratio,time){
	var pathData="M -821 568 Q -811 708 -929 671 L -872 792";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([204,102,0,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="butt";
	ctx.lineJoin="miter";
	ctx.miterLimit=3.0;
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M 1102 -393 Q 1109 -359 1183 -195 1259 -5 1281 168 1350 724 890 1218 434 1710 -302 1680 -531 1670 -761 1610 L -946 1550 Q -1748 1101 -1846 652 -1889 459 -1818 223 -1769 59 -1624 -237 -1424 -640 -995 -967 -780 -1131 -606 -1214 222 -1632 1102 -393";
	ctx.fillStyle=tocolor(ctrans.apply([254,230,196,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 1102 -393 Q 222 -1632 -606 -1214 -780 -1131 -995 -967 -1424 -640 -1624 -237 -1769 59 -1818 223 -1889 459 -1846 652 -1748 1101 -946 1550 L -761 1610 Q -531 1670 -302 1680 434 1710 890 1218 1350 724 1281 168 1259 -5 1183 -195 1109 -359 1102 -393 Z";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([204,102,0,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M -1522 1140 Q -1729 1039 -1837 648 -1946 255 -1647 -118 -1661 -159 -1478 -84 -1228 17 -1121 257 -1018 499 -1120 741 -1224 982 -1473 1080 -1555 1111 -1522 1140";
	drawPath(ctx,pathData,false);
	ctx.fillStyle=tocolor(ctrans.apply([255,255,255,0.0]));
	ctx.fill("evenodd");
	ctx.save();
	ctx.clip();
	ctx.transform(-0.015533447265625,0.036346435546875,-0.03814697265625,-0.0153961181640625,-1728,495);
	var grd=ctx.createRadialGradient(0.0,0,0,0,0,16384);
	grd.addColorStop(0.0,tocolor(ctrans.apply([255,119,187,0.5019608])));
	grd.addColorStop(1.0,tocolor(ctrans.apply([255,255,255,0.0])));
	ctx.fillStyle = grd;
	ctx.fillRect(-16384,-16384,32768,32768);
	ctx.restore();
	var pathData="M -134 1258 Q -154 989 16 787 186 587 447 573 585 564 706 612 987 1139 717 1376 405 1653 -10 1602 -119 1454 -134 1258";
	drawPath(ctx,pathData,false);
	ctx.fillStyle=tocolor(ctrans.apply([255,255,255,0.0]));
	ctx.fill("evenodd");
	ctx.save();
	ctx.clip();
	ctx.transform(0.0394134521484375,-0.0021514892578125,0.003082275390625,0.04095458984375,496,1222);
	var grd=ctx.createRadialGradient(0.0,0,0,0,0,16384);
	grd.addColorStop(0.0,tocolor(ctrans.apply([255,119,201,0.5019608])));
	grd.addColorStop(1.0,tocolor(ctrans.apply([255,255,255,0.0])));
	ctx.fillStyle = grd;
	ctx.fillRect(-16384,-16384,32768,32768);
	ctx.restore();
	var pathData="M 954 774 L 959 770 Q 1224 596 1335 684 1448 773 1324 1054 1221 1286 982 1242 908 1228 828 1189 L 787 1165 954 774";
	ctx.fillStyle=tocolor(ctrans.apply([254,230,196,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 787 1165 L 828 1189 Q 908 1228 982 1242 1221 1286 1324 1054 1448 773 1335 684 1224 596 959 770 L 954 774 M 787 1165 L 764 1152";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([204,102,0,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M -1206 -589 Q -1353 -663 -1405 -756 L -1428 -837 Q -1420 -1154 -1143 -1252 -973 -1312 -742 -1282 L -692 -1273 Q -683 -1124 -944 -841 -1073 -700 -1206 -589";
	var grd=ctx.createLinearGradient(-863.5,-1284.75,-1400.5,-695.25);
	grd.addColorStop(0.0,tocolor(ctrans.apply([255,176,60,1])));
	grd.addColorStop(1.0,tocolor(ctrans.apply([187,94,0,1])));
	ctx.fillStyle = grd;
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M -1206 -589 Q -1073 -700 -944 -841 -683 -1124 -692 -1273 L -742 -1282 Q -973 -1312 -1143 -1252 -1420 -1154 -1428 -837 L -1405 -756 Q -1353 -663 -1206 -589 Z";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([204,102,0,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M 607 367 L 586 481 Q 339 -77 -31 -375 -148 -468 -262 -525 L -352 -562 Q -358 -445 -327 -172 -616 -441 -737 -789 -776 -899 -793 -1003 L -802 -1085 Q -799 -1204 -710 -1286 -615 -1374 -443 -1390 -26 -1430 625 -1052 1249 -689 1426 -87 1491 135 1484 352 1476 534 1427 638 1353 796 1142 819 1063 828 1014 807 964 789 985 754 1044 663 1030 553 978 695 777 741 813 578 798 413 L 777 279 Q 706 255 607 367 640 158 633 57 640 158 607 367";
	var grd=ctx.createLinearGradient(-366.25,-1092.25,1008.25,118.25);
	grd.addColorStop(0.0,tocolor(ctrans.apply([255,176,60,1])));
	grd.addColorStop(1.0,tocolor(ctrans.apply([187,94,0,1])));
	ctx.fillStyle = grd;
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 607 367 Q 706 255 777 279 L 798 413 Q 813 578 777 741 978 695 1030 553 1044 663 985 754 964 789 1014 807 1063 828 1142 819 1353 796 1427 638 1476 534 1484 352 1491 135 1426 -87 1249 -689 625 -1052 -26 -1430 -443 -1390 -615 -1374 -710 -1286 -799 -1204 -802 -1085 L -793 -1003 Q -776 -899 -737 -789 -616 -441 -327 -172 -358 -445 -352 -562 L -262 -525 Q -148 -468 -31 -375 339 -77 586 481 L 607 367";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([204,102,0,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="miter";
	ctx.miterLimit=3.0;
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M 607 367 Q 640 158 633 57";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([204,102,0,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="miter";
	ctx.miterLimit=3.0;
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M 656 -1255 Q 775 -1164 890 -1059 972 -990 1007 -991 1090 -994 1180 -1188 1265 -1376 1420 -1329 1498 -1308 1558 -1247 1665 -1080 1554 -818 1498 -687 1422 -589 1440 -172 1396 -74 670 -929 -122 -1197 -370 -1281 -593 -1295 L -769 -1293 Q -704 -1412 -443 -1498 -312 -1540 -195 -1560 -184 -1600 -181 -1643 -177 -1720 -203 -1918 -229 -2121 -80 -2117 41 -2113 130 -2024 209 -1944 209 -1521 427 -1430 656 -1255";
	var grd=ctx.createLinearGradient(-483.25,-1786.5,1667.25,-541.5);
	grd.addColorStop(0.0,tocolor(ctrans.apply([255,60,60,1])));
	grd.addColorStop(1.0,tocolor(ctrans.apply([186,1,75,1])));
	ctx.fillStyle = grd;
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 656 -1255 Q 427 -1430 209 -1521 209 -1944 130 -2024 41 -2113 -80 -2117 -229 -2121 -203 -1918 -177 -1720 -181 -1643 -184 -1600 -195 -1560 -312 -1540 -443 -1498 -704 -1412 -769 -1293 L -593 -1295 Q -370 -1281 -122 -1197 670 -929 1396 -74 1440 -172 1422 -589 1498 -687 1554 -818 1665 -1080 1558 -1247 1498 -1308 1420 -1329 1265 -1376 1180 -1188 1090 -994 1007 -991 972 -990 890 -1059 775 -1164 656 -1255 Z";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([204,102,0,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="butt";
	ctx.lineJoin="miter";
	ctx.miterLimit=3.0;
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M -874 292 Q -946 422 -1070 370 L -1021 409 Q -970 465 -959 558";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([204,102,0,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M 38 1120 L 54 1116 68 1120 Q 75 1126 75 1133 L 68 1144 Q 62 1150 54 1150 L 38 1144 Q 32 1140 32 1133 32 1126 38 1120 M 26 951 Q 36 951 42 957 49 963 49 972 L 42 986 26 992 9 986 Q 3 980 3 972 3 963 9 957 16 951 26 951 M -1454 312 Q -1454 322 -1461 329 -1468 337 -1478 337 -1490 337 -1497 329 L -1503 312 -1497 293 -1478 288 Q -1468 288 -1461 293 -1454 302 -1454 312 M -1563 386 Q -1556 391 -1556 399 -1556 406 -1563 410 -1569 416 -1578 416 L -1594 410 -1599 399 -1594 386 Q -1586 381 -1578 381 -1569 381 -1563 386 M -1589 252 L -1605 257 -1622 252 -1628 237 -1622 223 Q -1615 217 -1605 217 -1595 217 -1589 223 -1582 229 -1582 237 -1582 246 -1589 252 M 153 1071 L 134 1064 Q 129 1057 129 1046 129 1036 134 1028 141 1022 153 1022 163 1022 170 1028 177 1036 177 1046 177 1057 170 1064 163 1071 153 1071";
	ctx.fillStyle=tocolor(ctrans.apply([204,102,0,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
}

function shape176(ctx,ctrans,frame,ratio,time){
	var pathData="M 389 -177 Q 399 -25 387 36 350 226 118 255 -150 288 -318 105 -479 -68 -423 -303 -369 -262 -305 -232 -13 -90 389 -177";
	ctx.fillStyle=tocolor(ctrans.apply([255,102,51,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 389 -177 Q 399 -25 387 36 350 226 118 255 -150 288 -318 105 -479 -68 -423 -303";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([204,0,0,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="miter";
	ctx.miterLimit=3.0;
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M -423 -303 L -479 -350 -534 -411 M 389 -177 L 458 -195";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([204,102,0,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="miter";
	ctx.miterLimit=3.0;
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M -423 -303 Q -369 -262 -305 -232 -13 -90 389 -177";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([204,102,0,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="miter";
	ctx.miterLimit=3.0;
	drawPath(ctx,pathData,true,scaleMode);

}

function shape177(ctx,ctrans,frame,ratio,time){
	var pathData="M 328 -163 Q 336 -32 327 20 294 184 95 208 -135 237 -280 80 -418 -69 -370 -270 L -269 -210 Q -17 -87 328 -163";
	ctx.fillStyle=tocolor(ctrans.apply([255,102,51,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 328 -163 L 387 -178 M -370 -270 L -418 -311 -465 -363";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([204,102,0,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="miter";
	ctx.miterLimit=3.0;
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M 328 -163 Q 336 -32 327 20 294 184 95 208 -135 237 -280 80 -418 -69 -370 -270";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([204,0,0,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="miter";
	ctx.miterLimit=3.0;
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M -370 -270 L -269 -210 Q -17 -87 328 -163";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([204,102,0,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="miter";
	ctx.miterLimit=3.0;
	drawPath(ctx,pathData,true,scaleMode);

}

function sprite178(ctx,ctrans,frame,ratio,time){
	var clips = [];
	var frame_cnt = 7;
	frame = frame % frame_cnt;
	switch(frame){
		case 0:
			place("shape176",rainy_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
		case 1:
			place("shape176",rainy_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
		case 2:
			place("shape176",rainy_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
		case 3:
			place("shape176",rainy_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
		case 4:
			place("shape177",rainy_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
		case 5:
			place("shape177",rainy_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
		case 6:
			place("shape177",rainy_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
	}
}

function sprite179(ctx,ctrans,frame,ratio,time){
	var clips = [];
	var frame_cnt = 1;
	frame = frame % frame_cnt;
	switch(frame){
		case 0:
			place("shape175",rainy_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			place("sprite178",rainy_canvas,ctx,[1.0,0.0,0.0,1.0,-790.0,1096.0],ctrans,1,(0+time)%7,0,time);
			place("sprite161",rainy_canvas,ctx,[1.0,0.0,0.0,1.0,-587.0,320.0],ctrans,1,(0+time)%17,0,time);
			break;
	}
}

function shape180(ctx,ctrans,frame,ratio,time){
	var pathData="M -2300 -3172 L -2297 -3175 -2284 -3071 -2269 -2936 Q -2269 -2830 -2261 -2797 L -2232 -2633 -2192 -2486 Q -2169 -2414 -2148 -2377 -2151 -2351 -2127 -2288 -2104 -2226 -2102 -2164 -2100 -2103 -1999 -2047 -1899 -1991 -1899 -1982 L -1879 -1912 -1826 -1741 Q -1792 -1630 -1776 -1594 L -1747 -1520 Q -1732 -1482 -1600 -1397 L -1701 -1394 Q -1711 -1415 -1819 -1469 -1927 -1523 -2051 -1675 -2175 -1827 -2285 -1801 -2331 -1852 -2330 -1989 -2330 -2003 -2304 -2058 -2279 -2112 -2278 -2126 -2278 -2172 -2293 -2211 -2313 -2252 -2325 -2326 -2338 -2401 -2369 -2525 L -2406 -2694 -2440 -2871 -2451 -2963 -2477 -3071 -2507 -3190 Q -2482 -3153 -2423 -3153 L -2394 -3156 -2361 -3153 -2341 -3154 Q -2303 -3089 -2300 -3172 M 1848 -2669 Q 1859 -2573 1957 -2518 1766 -2496 1687 -2417 L 1531 -2264 Q 1346 -2107 1088 -2121 935 -2130 542 -2129 137 -2127 -110 -2140 -510 -2160 -776 -2064 -878 -2028 -991 -1964 -1084 -1907 -1200 -1871 -1111 -1978 -1105 -2040 -1098 -2037 -1084 -2058 L -1082 -2065 Q -1090 -2102 -1058 -2118 L -1050 -2150 -1028 -2164 Q -1035 -2191 -1013 -2199 L -1012 -2204 -1012 -2221 -958 -2303 -951 -2315 -950 -2315 Q -839 -2501 -835 -2559 L -815 -2584 Q -762 -2658 -660 -2718 -598 -2756 -598 -2833 L -624 -2889 -638 -2923 Q -659 -2929 -673 -2950 L -665 -3097 Q -638 -3130 -627 -3182 -571 -3245 -481 -3251 -301 -3338 -72 -3321 L -34 -3359 4 -3383 58 -3421 181 -3451 213 -3505 289 -3544 513 -3559 606 -3601 Q 797 -3566 976 -3489 1326 -3338 1577 -3091 1828 -2845 1848 -2669";
	ctx.fillStyle=tocolor(ctrans.apply([51,51,51,0.24313726]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
}

function sprite181(ctx,ctrans,frame,ratio,time){
	var clips = [];
	var frame_cnt = 25;
	frame = frame % frame_cnt;
	switch(frame){
		case 0:
			place("shape171",rainy_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			place("sprite173",rainy_canvas,ctx,[-0.66650390625,0.0586700439453125,0.0615081787109375,0.6987457275390625,-2249.0,-6266.0],ctrans,1,(0+time)%1,0,time);
			place("shape174",rainy_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			place("sprite179",rainy_canvas,ctx,[0.9799957275390625,0.0,0.0,0.9799957275390625,587.0,-2104.0],ctrans,1,(0+time)%1,0,time);
			place("shape180",rainy_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
		case 1:
			place("shape171",rainy_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			place("sprite173",rainy_canvas,ctx,[-0.66650390625,0.0586700439453125,0.0615081787109375,0.6987457275390625,-2249.0,-6266.0],ctrans,1,(0+time)%1,0,time);
			place("shape174",rainy_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			place("sprite179",rainy_canvas,ctx,[0.9832916259765625,0.005218505859375,-0.005218505859375,0.9832916259765625,597.0,-2100.0],ctrans,1,(0+time)%1,0,time);
			place("shape180",rainy_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
		case 2:
			place("shape171",rainy_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			place("sprite173",rainy_canvas,ctx,[-0.66650390625,0.0586700439453125,0.0615081787109375,0.6987457275390625,-2249.0,-6266.0],ctrans,1,(0+time)%1,0,time);
			place("shape174",rainy_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			place("sprite179",rainy_canvas,ctx,[0.9864501953125,0.0136871337890625,-0.0136871337890625,0.9864501953125,612.0,-2096.0],ctrans,1,(0+time)%1,0,time);
			place("shape180",rainy_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
		case 3:
			place("shape171",rainy_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			place("sprite173",rainy_canvas,ctx,[-0.66650390625,0.0586700439453125,0.0615081787109375,0.6987457275390625,-2249.0,-6266.0],ctrans,1,(0+time)%1,0,time);
			place("shape174",rainy_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			place("sprite179",rainy_canvas,ctx,[0.989593505859375,0.022216796875,-0.022216796875,0.989593505859375,628.0,-2091.0],ctrans,1,(0+time)%1,0,time);
			place("shape180",rainy_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
		case 4:
			place("shape171",rainy_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			place("sprite173",rainy_canvas,ctx,[-0.66650390625,0.0586700439453125,0.0615081787109375,0.6987457275390625,-2249.0,-6266.0],ctrans,1,(0+time)%1,0,time);
			place("shape174",rainy_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			place("sprite179",rainy_canvas,ctx,[0.9926300048828125,0.0308074951171875,-0.0308074951171875,0.9926300048828125,643.0,-2083.0],ctrans,1,(0+time)%1,0,time);
			place("shape180",rainy_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
		case 5:
			place("shape171",rainy_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			place("sprite173",rainy_canvas,ctx,[-0.66650390625,0.0586700439453125,0.0615081787109375,0.6987457275390625,-2249.0,-6266.0],ctrans,1,(0+time)%1,0,time);
			place("shape174",rainy_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			place("sprite179",rainy_canvas,ctx,[0.99560546875,0.039459228515625,-0.039459228515625,0.99560546875,657.0,-2079.0],ctrans,1,(0+time)%1,0,time);
			place("shape180",rainy_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
		case 6:
			place("shape171",rainy_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			place("sprite173",rainy_canvas,ctx,[-0.66650390625,0.0586700439453125,0.0615081787109375,0.6987457275390625,-2249.0,-6266.0],ctrans,1,(0+time)%1,0,time);
			place("shape174",rainy_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			place("sprite179",rainy_canvas,ctx,[0.9986419677734375,0.0487060546875,-0.0487060546875,0.9986419677734375,673.0,-2073.0],ctrans,1,(0+time)%1,0,time);
			place("shape180",rainy_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
		case 7:
			place("shape171",rainy_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			place("sprite173",rainy_canvas,ctx,[-0.66650390625,0.0586700439453125,0.0615081787109375,0.6987457275390625,-2249.0,-6266.0],ctrans,1,(0+time)%1,0,time);
			place("shape174",rainy_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			place("sprite179",rainy_canvas,ctx,[0.9987030029296875,0.044219970703125,-0.044219970703125,0.9987030029296875,667.0,-2076.0],ctrans,1,(0+time)%1,0,time);
			place("shape180",rainy_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
		case 8:
			place("shape171",rainy_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			place("sprite173",rainy_canvas,ctx,[-0.66650390625,0.0586700439453125,0.0615081787109375,0.6987457275390625,-2249.0,-6266.0],ctrans,1,(0+time)%1,0,time);
			place("shape174",rainy_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			place("sprite179",rainy_canvas,ctx,[0.998779296875,0.03985595703125,-0.03985595703125,0.998779296875,660.0,-2078.0],ctrans,1,(0+time)%1,0,time);
			place("shape180",rainy_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
		case 9:
			place("shape171",rainy_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			place("sprite173",rainy_canvas,ctx,[-0.66650390625,0.0586700439453125,0.0615081787109375,0.6987457275390625,-2249.0,-6266.0],ctrans,1,(0+time)%1,0,time);
			place("shape174",rainy_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			place("sprite179",rainy_canvas,ctx,[0.9989471435546875,0.03594970703125,-0.03594970703125,0.9989471435546875,655.0,-2080.0],ctrans,1,(0+time)%1,0,time);
			place("shape180",rainy_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
		case 10:
			place("shape171",rainy_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			place("sprite173",rainy_canvas,ctx,[-0.66650390625,0.0586700439453125,0.0615081787109375,0.6987457275390625,-2249.0,-6266.0],ctrans,1,(0+time)%1,0,time);
			place("shape174",rainy_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			place("sprite179",rainy_canvas,ctx,[0.998992919921875,0.0352935791015625,-0.0352935791015625,0.998992919921875,653.0,-2080.0],ctrans,1,(0+time)%1,0,time);
			place("shape180",rainy_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
		case 11:
			place("shape171",rainy_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			place("sprite173",rainy_canvas,ctx,[-0.66650390625,0.0586700439453125,0.0615081787109375,0.6987457275390625,-2249.0,-6266.0],ctrans,1,(0+time)%1,0,time);
			place("shape174",rainy_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			place("sprite179",rainy_canvas,ctx,[0.9991607666015625,0.0313720703125,-0.0313720703125,0.9991607666015625,648.0,-2083.0],ctrans,1,(0+time)%1,0,time);
			place("shape180",rainy_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
		case 12:
			place("shape171",rainy_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			place("sprite173",rainy_canvas,ctx,[-0.66650390625,0.0586700439453125,0.0615081787109375,0.6987457275390625,-2249.0,-6266.0],ctrans,1,(0+time)%1,0,time);
			place("shape174",rainy_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			place("sprite179",rainy_canvas,ctx,[0.9991912841796875,0.030731201171875,-0.030731201171875,0.9991912841796875,647.0,-2083.0],ctrans,1,(0+time)%1,0,time);
			place("shape180",rainy_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
		case 13:
			place("shape171",rainy_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			place("sprite173",rainy_canvas,ctx,[-0.66650390625,0.0586700439453125,0.0615081787109375,0.6987457275390625,-2249.0,-6266.0],ctrans,1,(0+time)%1,0,time);
			place("shape174",rainy_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			place("sprite179",rainy_canvas,ctx,[0.9993438720703125,0.02679443359375,-0.02679443359375,0.9993438720703125,641.0,-2085.0],ctrans,1,(0+time)%1,0,time);
			place("shape180",rainy_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
		case 14:
			place("shape171",rainy_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			place("sprite173",rainy_canvas,ctx,[-0.66650390625,0.0586700439453125,0.0615081787109375,0.6987457275390625,-2249.0,-6266.0],ctrans,1,(0+time)%1,0,time);
			place("shape174",rainy_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			place("sprite179",rainy_canvas,ctx,[0.9994659423828125,0.02288818359375,-0.02288818359375,0.9994659423828125,636.0,-2087.0],ctrans,1,(0+time)%1,0,time);
			place("shape180",rainy_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
		case 15:
			place("shape171",rainy_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			place("sprite173",rainy_canvas,ctx,[-0.66650390625,0.0586700439453125,0.0615081787109375,0.6987457275390625,-2249.0,-6266.0],ctrans,1,(0+time)%1,0,time);
			place("shape174",rainy_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			place("sprite179",rainy_canvas,ctx,[0.9994964599609375,0.022216796875,-0.022216796875,0.9994964599609375,634.0,-2088.0],ctrans,1,(0+time)%1,0,time);
			place("shape180",rainy_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
		case 16:
			place("shape171",rainy_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			place("sprite173",rainy_canvas,ctx,[-0.66650390625,0.0586700439453125,0.0615081787109375,0.6987457275390625,-2249.0,-6266.0],ctrans,1,(0+time)%1,0,time);
			place("shape174",rainy_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			place("sprite179",rainy_canvas,ctx,[0.9996185302734375,0.0182952880859375,-0.0182952880859375,0.9996185302734375,629.0,-2090.0],ctrans,1,(0+time)%1,0,time);
			place("shape180",rainy_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
		case 17:
			place("shape171",rainy_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			place("sprite173",rainy_canvas,ctx,[-0.66650390625,0.0586700439453125,0.0615081787109375,0.6987457275390625,-2249.0,-6266.0],ctrans,1,(0+time)%1,0,time);
			place("shape174",rainy_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			place("sprite179",rainy_canvas,ctx,[0.9996490478515625,0.01763916015625,-0.01763916015625,0.9996490478515625,628.0,-2091.0],ctrans,1,(0+time)%1,0,time);
			place("shape180",rainy_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
		case 18:
			place("shape171",rainy_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			place("sprite173",rainy_canvas,ctx,[-0.66650390625,0.0586700439453125,0.0615081787109375,0.6987457275390625,-2249.0,-6266.0],ctrans,1,(0+time)%1,0,time);
			place("shape174",rainy_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			place("sprite179",rainy_canvas,ctx,[0.999725341796875,0.0137176513671875,-0.0137176513671875,0.999725341796875,623.0,-2092.0],ctrans,1,(0+time)%1,0,time);
			place("shape180",rainy_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
		case 19:
			place("shape171",rainy_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			place("sprite173",rainy_canvas,ctx,[-0.66650390625,0.0586700439453125,0.0615081787109375,0.6987457275390625,-2249.0,-6266.0],ctrans,1,(0+time)%1,0,time);
			place("shape174",rainy_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			place("sprite179",rainy_canvas,ctx,[0.9998016357421875,0.0098114013671875,-0.0098114013671875,0.9998016357421875,617.0,-2095.0],ctrans,1,(0+time)%1,0,time);
			place("shape180",rainy_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
		case 20:
			place("shape171",rainy_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			place("sprite173",rainy_canvas,ctx,[-0.66650390625,0.0586700439453125,0.0615081787109375,0.6987457275390625,-2249.0,-6266.0],ctrans,1,(0+time)%1,0,time);
			place("shape174",rainy_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			place("sprite179",rainy_canvas,ctx,[0.999847412109375,0.0091705322265625,-0.0091705322265625,0.999847412109375,615.0,-2095.0],ctrans,1,(0+time)%1,0,time);
			place("shape180",rainy_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
		case 21:
			place("shape171",rainy_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			place("sprite173",rainy_canvas,ctx,[-0.66650390625,0.0586700439453125,0.0615081787109375,0.6987457275390625,-2249.0,-6266.0],ctrans,1,(0+time)%1,0,time);
			place("shape174",rainy_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			place("sprite179",rainy_canvas,ctx,[0.9998931884765625,0.005218505859375,-0.005218505859375,0.9998931884765625,610.0,-2097.0],ctrans,1,(0+time)%1,0,time);
			place("shape180",rainy_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
		case 22:
			place("shape171",rainy_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			place("sprite173",rainy_canvas,ctx,[-0.66650390625,0.0586700439453125,0.0615081787109375,0.6987457275390625,-2249.0,-6266.0],ctrans,1,(0+time)%1,0,time);
			place("shape174",rainy_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			place("sprite179",rainy_canvas,ctx,[0.9999237060546875,0.00457763671875,-0.00457763671875,0.9999237060546875,609.0,-2097.0],ctrans,1,(0+time)%1,0,time);
			place("shape180",rainy_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
		case 23:
			place("shape171",rainy_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			place("sprite173",rainy_canvas,ctx,[-0.66650390625,0.0586700439453125,0.0615081787109375,0.6987457275390625,-2249.0,-6266.0],ctrans,1,(0+time)%1,0,time);
			place("shape174",rainy_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			place("sprite179",rainy_canvas,ctx,[0.9999542236328125,6.7138671875E-4,-6.7138671875E-4,0.9999542236328125,604.0,-2100.0],ctrans,1,(0+time)%1,0,time);
			place("shape180",rainy_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
		case 24:
			place("shape171",rainy_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			place("sprite173",rainy_canvas,ctx,[-0.66650390625,0.0586700439453125,0.0615081787109375,0.6987457275390625,-2249.0,-6266.0],ctrans,1,(0+time)%1,0,time);
			place("shape174",rainy_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			place("sprite179",rainy_canvas,ctx,[1.0,0.0,0.0,1.0,602.0,-2100.0],ctrans,1,(0+time)%1,0,time);
			place("shape180",rainy_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
	}
}

function shape182(ctx,ctrans,frame,ratio,time){
	var pathData="M 20 -1060 L 420 140";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([255,255,255,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M 980 -2160 L 1419 -980";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([255,255,255,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M -1679 -1900 L -1240 -720";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([255,255,255,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M -2759 -600 L -2320 580";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([255,255,255,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M -1359 860 L -920 2040";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([255,255,255,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M 1220 260 L 1659 1440";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([255,255,255,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M 2800 -980 L 3239 200";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([255,255,255,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M 3380 -2700 L 3819 -1520";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([255,255,255,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M 3920 -40 L 4359 1140";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([255,255,255,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M 3120 1020 L 3559 2200";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([255,255,255,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M -3198 -2860 L -2759 -1680";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([255,255,255,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M -4798 -1780 L -4359 -600";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([255,255,255,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M -3637 1020 L -3198 2200";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([255,255,255,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M -4537 760 L -4098 1940";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([255,255,255,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M -7722 1140 L -7283 2320";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([255,255,255,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M 5302 -920 L 5741 260";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([255,255,255,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M 6002 -2600 L 6441 -1420";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([255,255,255,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M 5741 1440 L 6180 2620";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([255,255,255,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M 262 1700 L 701 2880";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([255,255,255,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M -5977 1440 L -5538 2620";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([255,255,255,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M -7722 -1783 L -7283 -603";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([255,255,255,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M -5977 -2700 L -5538 -1520";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([255,255,255,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M 1460 4422 L 1860 5622";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([255,255,255,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M 2420 3322 L 2859 4502";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([255,255,255,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M -239 3582 L 200 4762";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([255,255,255,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M -1319 4882 L -880 6062";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([255,255,255,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M 81 6342 L 520 7522";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([255,255,255,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M 2660 5742 L 3099 6922";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([255,255,255,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M 4240 4502 L 4679 5682";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([255,255,255,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M 4820 2782 L 5259 3962";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([255,255,255,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M 5360 5442 L 5799 6622";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([255,255,255,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M 4560 6502 L 4999 7682";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([255,255,255,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M -1758 2622 L -1319 3802";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([255,255,255,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M -3358 3702 L -2919 4882";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([255,255,255,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M -2197 6502 L -1758 7682";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([255,255,255,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M -2636 8362 L -2197 9542";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([255,255,255,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M -4537 4562 L -4098 5742";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([255,255,255,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M 6742 4562 L 7181 5742";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([255,255,255,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M 7442 2882 L 7881 4062";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([255,255,255,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M 7181 6922 L 7620 8102";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([255,255,255,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M 1702 7182 L 2141 8362";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([255,255,255,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M -4537 6922 L -4098 8102";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([255,255,255,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M -5722 3699 L -5283 4879";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([255,255,255,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M -7283 4562 L -6844 5742";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([255,255,255,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

}

function shape183(ctx,ctrans,frame,ratio,time){
	var pathData="M -820 143 L -381 1323";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([255,255,255,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M 699 -697 L 1138 483";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([255,255,255,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M -381 -1437 L 58 -257";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([255,255,255,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M -1581 -1717 L -1142 -537";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([255,255,255,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M -2721 -577 L -2282 603";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([255,255,255,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M -1761 483 L -1322 1663";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([255,255,255,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M -3160 923 L -2721 2103";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([255,255,255,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M -3800 -1577 L -3361 -397";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([255,255,255,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M -5340 -1037 L -4901 143";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([255,255,255,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M -6720 -1717 L -6281 -537";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([255,255,255,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M -7160 23 L -6721 1203";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([255,255,255,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M -5779 603 L -5340 1783";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([255,255,255,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M -4159 1423 L -3720 2603";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([255,255,255,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M -4699 2203 L -4260 3383";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([255,255,255,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M -5859 2483 L -5420 3663";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([255,255,255,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M -2919 2483 L -2480 3663";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([255,255,255,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M -1079 2483 L -640 3663";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([255,255,255,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M 880 2103 L 1319 3283";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([255,255,255,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M 880 943 L 1319 2123";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([255,255,255,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M 3140 -577 L 3579 603";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([255,255,255,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M 2040 -2077 L 2479 -897";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([255,255,255,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M 4200 -2077 L 4639 -897";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([255,255,255,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M 5740 -1037 L 6179 143";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([255,255,255,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M 4820 703 L 5259 1883";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([255,255,255,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M 2840 1543 L 3279 2723";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([255,255,255,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M 6312 1805 L 6751 2985";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([255,255,255,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M -820 5944 L -381 7124";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([255,255,255,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M 699 5104 L 1138 6284";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([255,255,255,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M -381 4364 L 58 5544";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([255,255,255,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M -1581 4084 L -1142 5264";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([255,255,255,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M -2721 5224 L -2282 6404";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([255,255,255,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M -1761 6284 L -1322 7464";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([255,255,255,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M -3160 6724 L -2721 7904";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([255,255,255,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M -3800 4224 L -3361 5404";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([255,255,255,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M -5340 4764 L -4901 5944";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([255,255,255,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M -6720 4084 L -6281 5264";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([255,255,255,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M -7160 5824 L -6721 7004";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([255,255,255,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M -5779 6404 L -5340 7584";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([255,255,255,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M -4159 7224 L -3720 8404";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([255,255,255,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M -4699 8004 L -4260 9184";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([255,255,255,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M -5859 8284 L -5420 9464";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([255,255,255,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M -2919 8284 L -2480 9464";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([255,255,255,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M -1079 8284 L -640 9464";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([255,255,255,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M 880 7904 L 1319 9084";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([255,255,255,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M 880 6744 L 1319 7924";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([255,255,255,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M 3140 5224 L 3579 6404";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([255,255,255,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M 2040 3724 L 2479 4904";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([255,255,255,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M 4200 3724 L 4639 4904";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([255,255,255,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M 5740 4764 L 6179 5944";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([255,255,255,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M 4820 6504 L 5259 7684";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([255,255,255,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M 2840 7344 L 3279 8524";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([255,255,255,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M 6312 7606 L 6751 8786";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([255,255,255,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M -8340 1093 L -7901 2273";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([255,255,255,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M -9940 625 L -9501 1805";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([255,255,255,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M -8779 -1157 L -8340 23";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([255,255,255,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M -8779 4084 L -8340 5264";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([255,255,255,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

}

function shape184(ctx,ctrans,frame,ratio,time){
	var pathData="M 816 -28 L 1216 1172";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([255,255,255,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M 1776 -1128 L 2215 52";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([255,255,255,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M -883 -868 L -444 312";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([255,255,255,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M -1963 1164 L -1524 2344";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([255,255,255,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M -84 2634 L 355 3814";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([255,255,255,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M 2016 1292 L 2455 2472";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([255,255,255,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M 3596 52 L 4035 1232";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([255,255,255,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M 4176 -1668 L 4615 -488";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([255,255,255,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M 4716 992 L 5155 2172";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([255,255,255,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M 3916 2052 L 4355 3232";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([255,255,255,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M -2402 -1828 L -1963 -648";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([255,255,255,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M -4002 -748 L -3563 432";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([255,255,255,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M -2841 2052 L -2402 3232";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([255,255,255,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M -3741 1792 L -3302 2972";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([255,255,255,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M -6926 2172 L -6487 3352";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([255,255,255,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M 6098 112 L 6537 1292";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([255,255,255,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M 6798 -1568 L 7237 -388";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([255,255,255,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M 6537 2472 L 6976 3652";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([255,255,255,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M 1058 2732 L 1497 3912";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([255,255,255,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M -5181 2472 L -4742 3652";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([255,255,255,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M -6926 -751 L -6487 429";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([255,255,255,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M -5181 -1668 L -4742 -488";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([255,255,255,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M 2256 5454 L 2656 6654";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([255,255,255,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M 3216 4354 L 3655 5534";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([255,255,255,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M 557 4614 L 996 5794";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([255,255,255,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M -523 5914 L -84 7094";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([255,255,255,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M 877 7374 L 1316 8554";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([255,255,255,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M 3456 6774 L 3895 7954";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([255,255,255,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M 5036 5534 L 5475 6714";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([255,255,255,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M 5616 3814 L 6055 4994";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([255,255,255,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M 6156 6474 L 6595 7654";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([255,255,255,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M 5356 7534 L 5795 8714";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([255,255,255,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M -962 3654 L -523 4834";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([255,255,255,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M -2562 4734 L -2123 5914";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([255,255,255,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M -1401 7534 L -962 8714";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([255,255,255,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M -1840 9394 L -1401 10574";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([255,255,255,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M -3741 5594 L -3302 6774";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([255,255,255,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M 7538 5594 L 7977 6774";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([255,255,255,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M 8238 3914 L 8677 5094";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([255,255,255,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M 7977 7954 L 8416 9134";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([255,255,255,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M 2498 8214 L 2937 9394";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([255,255,255,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M -3741 7954 L -3302 9134";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([255,255,255,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M -4926 4731 L -4487 5911";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([255,255,255,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M -6487 5594 L -6048 6774";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([255,255,255,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

}

function sprite185(ctx,ctrans,frame,ratio,time){
	var clips = [];
	var frame_cnt = 3;
	frame = frame % frame_cnt;
	switch(frame){
		case 0:
			place("shape182",rainy_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
		case 1:
			place("shape183",rainy_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
		case 2:
			place("shape184",rainy_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
	}
}

function shape186(ctx,ctrans,frame,ratio,time){
	var pathData="M 370 733 L 324 736 Q 238 736 172 688 L 336 204 370 733";
	ctx.fillStyle=tocolor(ctrans.apply([255,0,0,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 370 733 L 324 736 Q 238 736 172 688";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([0,0,0,1]));
	ctx.lineWidth=0.5;
	ctx.lineCap="butt";
	ctx.lineJoin="miter";
	ctx.miterLimit=3.0;
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M 327 695 Q 307 715 278 715 249 715 229 695 209 675 209 646 209 617 229 597 249 577 278 577 307 577 327 597 347 617 347 646 347 675 327 695";
	ctx.fillStyle=tocolor(ctrans.apply([0,0,0,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 327 695 Q 307 715 278 715 249 715 229 695 209 675 209 646 209 617 229 597 249 577 278 577 307 577 327 597 347 617 347 646 347 675 327 695 Z";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([255,0,0,1]));
	ctx.lineWidth=0.5;
	ctx.lineCap="butt";
	ctx.lineJoin="miter";
	ctx.miterLimit=3.0;
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M 608 643 L 625 581";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([0,0,0,1]));
	ctx.lineWidth=0.5;
	ctx.lineCap="butt";
	ctx.lineJoin="miter";
	ctx.miterLimit=3.0;
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M 625 581 L 514 495";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([0,0,0,1]));
	ctx.lineWidth=0.5;
	ctx.lineCap="butt";
	ctx.lineJoin="miter";
	ctx.miterLimit=3.0;
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M 0 506 L 17 444";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([0,0,0,1]));
	ctx.lineWidth=0.5;
	ctx.lineCap="butt";
	ctx.lineJoin="miter";
	ctx.miterLimit=3.0;
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M 17 444 L 154 426";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([0,0,0,1]));
	ctx.lineWidth=0.5;
	ctx.lineCap="butt";
	ctx.lineJoin="miter";
	ctx.miterLimit=3.0;
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M 8 641 L 25 579";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([0,0,0,1]));
	ctx.lineWidth=0.5;
	ctx.lineCap="butt";
	ctx.lineJoin="miter";
	ctx.miterLimit=3.0;
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M 25 579 L 162 561";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([0,0,0,1]));
	ctx.lineWidth=0.5;
	ctx.lineCap="butt";
	ctx.lineJoin="miter";
	ctx.miterLimit=3.0;
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M 553 755 L 570 693";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([0,0,0,1]));
	ctx.lineWidth=0.5;
	ctx.lineCap="butt";
	ctx.lineJoin="miter";
	ctx.miterLimit=3.0;
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M 570 693 L 459 607";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([0,0,0,1]));
	ctx.lineWidth=0.5;
	ctx.lineCap="butt";
	ctx.lineJoin="miter";
	ctx.miterLimit=3.0;
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M 637 330 L 637 382";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([0,0,0,1]));
	ctx.lineWidth=0.5;
	ctx.lineCap="butt";
	ctx.lineJoin="miter";
	ctx.miterLimit=3.0;
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M 637 382 L 509 426";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([0,0,0,1]));
	ctx.lineWidth=0.5;
	ctx.lineCap="butt";
	ctx.lineJoin="miter";
	ctx.miterLimit=3.0;
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M 14 309 L 14 361";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([0,0,0,1]));
	ctx.lineWidth=0.5;
	ctx.lineCap="butt";
	ctx.lineJoin="miter";
	ctx.miterLimit=3.0;
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M 14 361 L 142 405";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([0,0,0,1]));
	ctx.lineWidth=0.5;
	ctx.lineCap="butt";
	ctx.lineJoin="miter";
	ctx.miterLimit=3.0;
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M 58 204 L 58 256";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([0,0,0,1]));
	ctx.lineWidth=0.5;
	ctx.lineCap="butt";
	ctx.lineJoin="miter";
	ctx.miterLimit=3.0;
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M 58 256 L 186 300";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([0,0,0,1]));
	ctx.lineWidth=0.5;
	ctx.lineCap="butt";
	ctx.lineJoin="miter";
	ctx.miterLimit=3.0;
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M 613 230 L 613 282";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([0,0,0,1]));
	ctx.lineWidth=0.5;
	ctx.lineCap="butt";
	ctx.lineJoin="miter";
	ctx.miterLimit=3.0;
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M 613 282 L 485 326";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([0,0,0,1]));
	ctx.lineWidth=0.5;
	ctx.lineCap="butt";
	ctx.lineJoin="miter";
	ctx.miterLimit=3.0;
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M 374 61 Q 424 74 451 120 477 166 463 216 450 266 405 292 359 318 308 305 258 292 232 246 205 200 219 150 233 100 279 74 324 48 374 61";
	ctx.fillStyle=tocolor(ctrans.apply([0,0,0,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 265 85 L 230 24";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([0,0,0,1]));
	ctx.lineWidth=0.5;
	ctx.lineCap="butt";
	ctx.lineJoin="miter";
	ctx.miterLimit=3.0;
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M 440 106 L 491 77";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([0,0,0,1]));
	ctx.lineWidth=0.5;
	ctx.lineCap="butt";
	ctx.lineJoin="miter";
	ctx.miterLimit=3.0;
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M 245 9 Q 249 16 246 22 L 238 33 224 35 214 27 212 14 Q 215 7 221 3 L 234 1 245 9";
	ctx.fillStyle=tocolor(ctrans.apply([0,0,0,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 500 92 L 486 94 476 86 474 73 483 62 496 60 507 68 Q 511 75 508 81 L 500 92";
	ctx.fillStyle=tocolor(ctrans.apply([0,0,0,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 306 119 L 292 121 282 113 280 100 Q 283 93 289 89 L 302 87 Q 310 88 313 95 317 102 314 108 L 306 119";
	ctx.fillStyle=tocolor(ctrans.apply([255,255,255,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 418 140 L 404 142 394 134 392 121 401 110 414 108 Q 422 109 425 116 429 123 426 129 L 418 140";
	ctx.fillStyle=tocolor(ctrans.apply([255,255,255,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 233 191 L 241 218 251 241 Q 245 244 238 231 223 204 226 187 L 233 191";
	ctx.fillStyle=tocolor(ctrans.apply([255,255,255,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 233 174 L 232 178 228 179 225 177 227 171 233 174";
	ctx.fillStyle=tocolor(ctrans.apply([194,193,196,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 304 92 L 303 97 300 98 297 96 298 91 304 92";
	ctx.fillStyle=tocolor(ctrans.apply([0,0,0,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 409 112 L 408 117 403 118 400 116 402 111 409 112";
	ctx.fillStyle=tocolor(ctrans.apply([0,0,0,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 340 214 Q 362 214 377 229 393 245 393 267 393 289 377 304 362 320 340 320 318 320 302 304 287 289 287 267 287 245 302 229 318 214 340 214";
	ctx.fillStyle=tocolor(ctrans.apply([0,0,0,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 494 69 L 491 73 Q 488 72 488 67 L 492 67 494 69";
	ctx.fillStyle=tocolor(ctrans.apply([255,255,255,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 225 12 L 222 8 228 10 225 12";
	ctx.fillStyle=tocolor(ctrans.apply([255,255,255,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 590 470 Q 590 580 512 658 451 719 370 733 L 336 204 Q 438 208 512 282 590 360 590 470";
	ctx.fillStyle=tocolor(ctrans.apply([255,0,0,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 590 470 Q 590 580 512 658 451 719 370 733 L 336 204 Q 438 208 512 282 590 360 590 470 Z";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([0,0,0,1]));
	ctx.lineWidth=0.5;
	ctx.lineCap="butt";
	ctx.lineJoin="miter";
	ctx.miterLimit=3.0;
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M 537 453 Q 559 453 574 468 590 484 590 506 590 528 574 543 559 559 537 559 515 559 499 543 484 528 484 506 484 484 499 468 515 453 537 453";
	ctx.fillStyle=tocolor(ctrans.apply([0,0,0,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 562 482 L 559 505 Q 554 526 543 526 534 526 534 518 545 497 545 482 538 439 538 417 535 406 547 406 L 562 482";
	ctx.fillStyle=tocolor(ctrans.apply([255,255,255,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 533 591 Q 533 602 499 638 464 675 447 675 435 675 435 667 L 485 627 499 602 Q 510 583 524 583 533 583 533 591";
	ctx.fillStyle=tocolor(ctrans.apply([255,255,255,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 546 379 L 545 386 540 388 Q 528 388 529 380 529 371 538 371 546 371 546 379";
	ctx.fillStyle=tocolor(ctrans.apply([255,255,255,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 336 204 L 172 688 136 658 Q 58 580 58 470 58 360 136 282 214 204 324 204 L 336 204";
	ctx.fillStyle=tocolor(ctrans.apply([255,0,0,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 336 204 L 172 688 136 658 Q 58 580 58 470 58 360 136 282 214 204 324 204 L 336 204 Z";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([0,0,0,1]));
	ctx.lineWidth=0.5;
	ctx.lineCap="butt";
	ctx.lineJoin="miter";
	ctx.miterLimit=3.0;
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M 114 376 Q 136 376 151 391 167 407 167 429 167 451 151 466 136 482 114 482 92 482 76 466 61 451 61 429 61 407 76 391 92 376 114 376";
	ctx.fillStyle=tocolor(ctrans.apply([0,0,0,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 161 321 L 112 394 Q 95 427 95 466 L 100 506 99 513 91 514 Q 74 514 78 469 99 313 152 313 161 313 161 321";
	ctx.fillStyle=tocolor(ctrans.apply([255,255,255,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 131 571 L 130 580 123 582 Q 105 582 103 555 103 547 113 547 L 131 571";
	ctx.fillStyle=tocolor(ctrans.apply([255,255,255,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 375 421 Q 350 446 314 446 278 446 253 421 228 396 228 360 228 324 253 299 278 274 314 274 350 274 375 299 400 324 400 360 400 396 375 421";
	ctx.fillStyle=tocolor(ctrans.apply([0,0,0,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
}

function shape187(ctx,ctrans,frame,ratio,time){
	var pathData="M 120 650 Q 146 412 336 202 424 469 417 717 L 282 732 Q 212 731 120 650";
	ctx.fillStyle=tocolor(ctrans.apply([255,0,0,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 417 717 L 282 732 Q 212 731 120 650";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([0,0,0,1]));
	ctx.lineWidth=0.5;
	ctx.lineCap="butt";
	ctx.lineJoin="miter";
	ctx.miterLimit=3.0;
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M 327 694 Q 307 714 278 715 249 715 229 696 209 676 209 647 209 618 229 598 249 577 278 577 307 576 327 596 347 615 347 644 347 673 327 694";
	ctx.fillStyle=tocolor(ctrans.apply([0,0,0,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 327 694 Q 307 714 278 715 249 715 229 696 209 676 209 647 209 618 229 598 249 577 278 577 307 576 327 596 347 615 347 644 347 673 327 694 Z";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([255,0,0,1]));
	ctx.lineWidth=0.5;
	ctx.lineCap="butt";
	ctx.lineJoin="miter";
	ctx.miterLimit=3.0;
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M 608 643 L 625 581";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([0,0,0,1]));
	ctx.lineWidth=0.5;
	ctx.lineCap="butt";
	ctx.lineJoin="miter";
	ctx.miterLimit=3.0;
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M 625 581 L 514 495";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([0,0,0,1]));
	ctx.lineWidth=0.5;
	ctx.lineCap="butt";
	ctx.lineJoin="miter";
	ctx.miterLimit=3.0;
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M 0 506 L 17 444";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([0,0,0,1]));
	ctx.lineWidth=0.5;
	ctx.lineCap="butt";
	ctx.lineJoin="miter";
	ctx.miterLimit=3.0;
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M 17 444 L 154 426";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([0,0,0,1]));
	ctx.lineWidth=0.5;
	ctx.lineCap="butt";
	ctx.lineJoin="miter";
	ctx.miterLimit=3.0;
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M 8 641 L 25 579";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([0,0,0,1]));
	ctx.lineWidth=0.5;
	ctx.lineCap="butt";
	ctx.lineJoin="miter";
	ctx.miterLimit=3.0;
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M 25 579 L 162 561";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([0,0,0,1]));
	ctx.lineWidth=0.5;
	ctx.lineCap="butt";
	ctx.lineJoin="miter";
	ctx.miterLimit=3.0;
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M 553 755 L 570 693";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([0,0,0,1]));
	ctx.lineWidth=0.5;
	ctx.lineCap="butt";
	ctx.lineJoin="miter";
	ctx.miterLimit=3.0;
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M 570 693 L 459 607";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([0,0,0,1]));
	ctx.lineWidth=0.5;
	ctx.lineCap="butt";
	ctx.lineJoin="miter";
	ctx.miterLimit=3.0;
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M 637 330 L 637 382";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([0,0,0,1]));
	ctx.lineWidth=0.5;
	ctx.lineCap="butt";
	ctx.lineJoin="miter";
	ctx.miterLimit=3.0;
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M 637 382 L 509 426";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([0,0,0,1]));
	ctx.lineWidth=0.5;
	ctx.lineCap="butt";
	ctx.lineJoin="miter";
	ctx.miterLimit=3.0;
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M 14 309 L 14 361";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([0,0,0,1]));
	ctx.lineWidth=0.5;
	ctx.lineCap="butt";
	ctx.lineJoin="miter";
	ctx.miterLimit=3.0;
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M 14 361 L 142 405";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([0,0,0,1]));
	ctx.lineWidth=0.5;
	ctx.lineCap="butt";
	ctx.lineJoin="miter";
	ctx.miterLimit=3.0;
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M 58 204 L 58 256";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([0,0,0,1]));
	ctx.lineWidth=0.5;
	ctx.lineCap="butt";
	ctx.lineJoin="miter";
	ctx.miterLimit=3.0;
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M 58 256 L 186 300";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([0,0,0,1]));
	ctx.lineWidth=0.5;
	ctx.lineCap="butt";
	ctx.lineJoin="miter";
	ctx.miterLimit=3.0;
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M 613 230 L 613 282";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([0,0,0,1]));
	ctx.lineWidth=0.5;
	ctx.lineCap="butt";
	ctx.lineJoin="miter";
	ctx.miterLimit=3.0;
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M 613 282 L 485 326";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([0,0,0,1]));
	ctx.lineWidth=0.5;
	ctx.lineCap="butt";
	ctx.lineJoin="miter";
	ctx.miterLimit=3.0;
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M 374 69 Q 424 82 451 128 477 174 463 224 450 274 405 300 359 326 308 313 258 300 232 254 205 208 219 158 233 108 279 82 324 56 374 69";
	ctx.fillStyle=tocolor(ctrans.apply([0,0,0,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 265 93 L 230 32";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([0,0,0,1]));
	ctx.lineWidth=0.5;
	ctx.lineCap="butt";
	ctx.lineJoin="miter";
	ctx.miterLimit=3.0;
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M 440 114 L 491 85";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([0,0,0,1]));
	ctx.lineWidth=0.5;
	ctx.lineCap="butt";
	ctx.lineJoin="miter";
	ctx.miterLimit=3.0;
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M 245 17 Q 249 24 246 30 L 238 41 224 43 214 35 212 22 Q 215 15 221 11 L 234 9 245 17";
	ctx.fillStyle=tocolor(ctrans.apply([0,0,0,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 500 100 L 486 102 476 94 474 81 483 70 496 68 507 76 Q 511 83 508 89 L 500 100";
	ctx.fillStyle=tocolor(ctrans.apply([0,0,0,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 306 127 L 292 129 282 121 280 108 Q 283 101 289 97 L 302 95 Q 310 96 313 103 317 110 314 116 L 306 127";
	ctx.fillStyle=tocolor(ctrans.apply([255,255,255,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 418 148 L 404 150 394 142 392 129 401 118 414 116 Q 422 117 425 124 429 131 426 137 L 418 148";
	ctx.fillStyle=tocolor(ctrans.apply([255,255,255,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 233 199 L 241 226 251 249 Q 245 252 238 239 223 212 226 195 L 233 199";
	ctx.fillStyle=tocolor(ctrans.apply([255,255,255,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 233 182 L 232 186 228 187 225 185 227 179 233 182";
	ctx.fillStyle=tocolor(ctrans.apply([194,193,196,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 304 100 L 303 105 300 106 297 104 298 99 304 100";
	ctx.fillStyle=tocolor(ctrans.apply([0,0,0,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 409 120 L 408 125 403 126 400 124 402 119 409 120";
	ctx.fillStyle=tocolor(ctrans.apply([0,0,0,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 340 214 Q 362 214 377 229 393 245 393 267 393 289 377 304 362 320 340 320 318 320 302 304 287 289 287 267 287 245 302 229 318 214 340 214";
	ctx.fillStyle=tocolor(ctrans.apply([0,0,0,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 494 69 L 491 73 Q 488 72 488 67 L 492 67 494 69";
	ctx.fillStyle=tocolor(ctrans.apply([255,255,255,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 225 12 L 222 8 228 10 225 12";
	ctx.fillStyle=tocolor(ctrans.apply([255,255,255,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 605 456 Q 611 566 537 648 479 711 399 730 L 337 203 Q 439 202 517 272 599 346 605 456";
	ctx.fillStyle=tocolor(ctrans.apply([255,0,0,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 605 456 Q 611 566 537 648 479 711 399 730 L 337 203 Q 439 202 517 272 599 346 605 456 Z";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([0,0,0,1]));
	ctx.lineWidth=0.5;
	ctx.lineCap="butt";
	ctx.lineJoin="miter";
	ctx.miterLimit=3.0;
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M 549 442 Q 571 441 586 455 603 471 604 493 605 515 590 530 576 547 554 548 532 550 515 534 499 520 498 498 497 476 511 459 527 444 549 442";
	ctx.fillStyle=tocolor(ctrans.apply([0,0,0,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 578 469 L 576 493 Q 572 514 561 514 552 515 551 507 L 561 470 Q 551 428 550 406 547 395 559 394 L 578 469";
	ctx.fillStyle=tocolor(ctrans.apply([255,255,255,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 554 580 Q 555 591 523 629 490 668 473 669 461 669 460 661 L 508 619 521 593 Q 531 573 545 572 554 572 554 580";
	ctx.fillStyle=tocolor(ctrans.apply([255,255,255,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 556 367 L 555 374 551 377 Q 539 377 539 369 539 360 548 360 556 359 556 367";
	ctx.fillStyle=tocolor(ctrans.apply([255,255,255,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 375 421 Q 350 446 314 446 278 446 253 421 228 396 228 360 228 324 253 299 278 274 314 274 350 274 375 299 400 324 400 360 400 396 375 421";
	ctx.fillStyle=tocolor(ctrans.apply([0,0,0,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 337 203 L 117 664 84 630 Q 17 544 30 435 43 325 129 257 215 188 325 201 L 337 203";
	ctx.fillStyle=tocolor(ctrans.apply([255,0,0,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 337 203 L 117 664 84 630 Q 17 544 30 435 43 325 129 257 215 188 325 201 L 337 203 Z";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([0,0,0,1]));
	ctx.lineWidth=0.5;
	ctx.lineCap="butt";
	ctx.lineJoin="miter";
	ctx.miterLimit=3.0;
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M 96 349 Q 118 351 131 368 145 385 142 407 140 429 122 442 105 456 83 454 61 451 47 433 34 416 36 394 39 372 56 359 74 346 96 349";
	ctx.fillStyle=tocolor(ctrans.apply([0,0,0,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 139 321 L 90 394 Q 73 427 73 466 L 78 506 77 513 69 514 Q 52 514 56 469 77 313 130 313 L 139 321";
	ctx.fillStyle=tocolor(ctrans.apply([255,255,255,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 99 571 L 98 580 91 582 Q 73 582 71 555 71 547 81 547 L 99 571";
	ctx.fillStyle=tocolor(ctrans.apply([255,255,255,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
}

function shape188(ctx,ctrans,frame,ratio,time){
	var pathData="M 417 717 L 282 732 Q 212 731 120 650 146 412 336 202 424 469 417 717";
	ctx.fillStyle=tocolor(ctrans.apply([255,0,0,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 417 717 L 282 732 Q 212 731 120 650";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([0,0,0,1]));
	ctx.lineWidth=0.5;
	ctx.lineCap="butt";
	ctx.lineJoin="miter";
	ctx.miterLimit=3.0;
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M 327 694 Q 307 714 278 715 249 715 229 696 209 676 209 647 209 618 229 598 249 577 278 577 307 576 327 596 347 615 347 644 347 673 327 694";
	ctx.fillStyle=tocolor(ctrans.apply([0,0,0,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 327 694 Q 307 714 278 715 249 715 229 696 209 676 209 647 209 618 229 598 249 577 278 577 307 576 327 596 347 615 347 644 347 673 327 694 Z";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([255,0,0,1]));
	ctx.lineWidth=0.5;
	ctx.lineCap="butt";
	ctx.lineJoin="miter";
	ctx.miterLimit=3.0;
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M 608 643 L 625 581";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([0,0,0,1]));
	ctx.lineWidth=0.5;
	ctx.lineCap="butt";
	ctx.lineJoin="miter";
	ctx.miterLimit=3.0;
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M 625 581 L 514 495";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([0,0,0,1]));
	ctx.lineWidth=0.5;
	ctx.lineCap="butt";
	ctx.lineJoin="miter";
	ctx.miterLimit=3.0;
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M 0 506 L 17 444";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([0,0,0,1]));
	ctx.lineWidth=0.5;
	ctx.lineCap="butt";
	ctx.lineJoin="miter";
	ctx.miterLimit=3.0;
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M 17 444 L 154 426";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([0,0,0,1]));
	ctx.lineWidth=0.5;
	ctx.lineCap="butt";
	ctx.lineJoin="miter";
	ctx.miterLimit=3.0;
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M 8 641 L 25 579";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([0,0,0,1]));
	ctx.lineWidth=0.5;
	ctx.lineCap="butt";
	ctx.lineJoin="miter";
	ctx.miterLimit=3.0;
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M 25 579 L 162 561";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([0,0,0,1]));
	ctx.lineWidth=0.5;
	ctx.lineCap="butt";
	ctx.lineJoin="miter";
	ctx.miterLimit=3.0;
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M 553 755 L 570 693";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([0,0,0,1]));
	ctx.lineWidth=0.5;
	ctx.lineCap="butt";
	ctx.lineJoin="miter";
	ctx.miterLimit=3.0;
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M 570 693 L 459 607";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([0,0,0,1]));
	ctx.lineWidth=0.5;
	ctx.lineCap="butt";
	ctx.lineJoin="miter";
	ctx.miterLimit=3.0;
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M 637 330 L 637 382";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([0,0,0,1]));
	ctx.lineWidth=0.5;
	ctx.lineCap="butt";
	ctx.lineJoin="miter";
	ctx.miterLimit=3.0;
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M 637 382 L 509 426";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([0,0,0,1]));
	ctx.lineWidth=0.5;
	ctx.lineCap="butt";
	ctx.lineJoin="miter";
	ctx.miterLimit=3.0;
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M 14 309 L 14 361";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([0,0,0,1]));
	ctx.lineWidth=0.5;
	ctx.lineCap="butt";
	ctx.lineJoin="miter";
	ctx.miterLimit=3.0;
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M 14 361 L 142 405";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([0,0,0,1]));
	ctx.lineWidth=0.5;
	ctx.lineCap="butt";
	ctx.lineJoin="miter";
	ctx.miterLimit=3.0;
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M 58 204 L 58 256";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([0,0,0,1]));
	ctx.lineWidth=0.5;
	ctx.lineCap="butt";
	ctx.lineJoin="miter";
	ctx.miterLimit=3.0;
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M 58 256 L 186 300";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([0,0,0,1]));
	ctx.lineWidth=0.5;
	ctx.lineCap="butt";
	ctx.lineJoin="miter";
	ctx.miterLimit=3.0;
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M 613 230 L 613 282";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([0,0,0,1]));
	ctx.lineWidth=0.5;
	ctx.lineCap="butt";
	ctx.lineJoin="miter";
	ctx.miterLimit=3.0;
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M 613 282 L 485 326";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([0,0,0,1]));
	ctx.lineWidth=0.5;
	ctx.lineCap="butt";
	ctx.lineJoin="miter";
	ctx.miterLimit=3.0;
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M 374 69 Q 424 82 451 128 477 174 463 224 450 274 405 300 359 326 308 313 258 300 232 254 205 208 219 158 233 108 279 82 324 56 374 69";
	ctx.fillStyle=tocolor(ctrans.apply([0,0,0,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 306 127 L 292 129 282 121 280 108 Q 283 101 289 97 L 302 95 Q 310 96 313 103 317 110 314 116 L 306 127";
	ctx.fillStyle=tocolor(ctrans.apply([255,255,255,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 418 148 L 404 150 394 142 392 129 401 118 414 116 Q 422 117 425 124 429 131 426 137 L 418 148";
	ctx.fillStyle=tocolor(ctrans.apply([255,255,255,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 233 199 L 241 226 251 249 Q 245 252 238 239 223 212 226 195 L 233 199";
	ctx.fillStyle=tocolor(ctrans.apply([255,255,255,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 233 182 L 232 186 228 187 225 185 227 179 233 182";
	ctx.fillStyle=tocolor(ctrans.apply([194,193,196,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 304 100 L 303 105 300 106 297 104 298 99 304 100";
	ctx.fillStyle=tocolor(ctrans.apply([0,0,0,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 409 120 L 408 125 403 126 400 124 402 119 409 120";
	ctx.fillStyle=tocolor(ctrans.apply([0,0,0,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 262 98 L 212 48";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([0,0,0,1]));
	ctx.lineWidth=0.5;
	ctx.lineCap="butt";
	ctx.lineJoin="miter";
	ctx.miterLimit=3.0;
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M 224 30 L 228 42 224 54 210 60 199 55 Q 193 49 193 43 193 35 199 29 204 24 211 25 218 24 224 30";
	ctx.fillStyle=tocolor(ctrans.apply([0,0,0,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 439 113 L 493 90";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([0,0,0,1]));
	ctx.lineWidth=0.5;
	ctx.lineCap="butt";
	ctx.lineJoin="miter";
	ctx.miterLimit=3.0;
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M 503 107 L 489 107 480 97 479 84 489 75 502 74 512 84 512 97 503 107";
	ctx.fillStyle=tocolor(ctrans.apply([0,0,0,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 340 214 Q 362 214 377 229 393 245 393 267 393 289 377 304 362 320 340 320 318 320 302 304 287 289 287 267 287 245 302 229 318 214 340 214";
	ctx.fillStyle=tocolor(ctrans.apply([0,0,0,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 494 69 L 491 73 Q 488 72 488 67 L 492 67 494 69";
	ctx.fillStyle=tocolor(ctrans.apply([255,255,255,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 225 12 L 222 8 228 10 225 12";
	ctx.fillStyle=tocolor(ctrans.apply([255,255,255,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 605 456 Q 611 566 537 648 479 711 399 730 L 337 203 Q 439 202 517 272 599 346 605 456";
	ctx.fillStyle=tocolor(ctrans.apply([255,0,0,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 605 456 Q 611 566 537 648 479 711 399 730 L 337 203 Q 439 202 517 272 599 346 605 456 Z";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([0,0,0,1]));
	ctx.lineWidth=0.5;
	ctx.lineCap="butt";
	ctx.lineJoin="miter";
	ctx.miterLimit=3.0;
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M 549 442 Q 571 441 586 455 603 471 604 493 605 515 590 530 576 547 554 548 532 550 515 534 499 520 498 498 497 476 511 459 527 444 549 442";
	ctx.fillStyle=tocolor(ctrans.apply([0,0,0,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 578 469 L 576 493 Q 572 514 561 514 552 515 551 507 L 561 470 Q 551 428 550 406 547 395 559 394 L 578 469";
	ctx.fillStyle=tocolor(ctrans.apply([255,255,255,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 554 580 Q 555 591 523 629 490 668 473 669 461 669 460 661 L 508 619 521 593 Q 531 573 545 572 554 572 554 580";
	ctx.fillStyle=tocolor(ctrans.apply([255,255,255,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 556 367 L 555 374 551 377 Q 539 377 539 369 539 360 548 360 556 359 556 367";
	ctx.fillStyle=tocolor(ctrans.apply([255,255,255,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 375 421 Q 350 446 314 446 278 446 253 421 228 396 228 360 228 324 253 299 278 274 314 274 350 274 375 299 400 324 400 360 400 396 375 421";
	ctx.fillStyle=tocolor(ctrans.apply([0,0,0,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 337 203 L 117 664 84 630 Q 17 544 30 435 43 325 129 257 215 188 325 201 L 337 203";
	ctx.fillStyle=tocolor(ctrans.apply([255,0,0,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 337 203 L 117 664 84 630 Q 17 544 30 435 43 325 129 257 215 188 325 201 L 337 203 Z";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([0,0,0,1]));
	ctx.lineWidth=0.5;
	ctx.lineCap="butt";
	ctx.lineJoin="miter";
	ctx.miterLimit=3.0;
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M 96 349 Q 118 351 131 368 145 385 142 407 140 429 122 442 105 456 83 454 61 451 47 433 34 416 36 394 39 372 56 359 74 346 96 349";
	ctx.fillStyle=tocolor(ctrans.apply([0,0,0,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 139 321 L 90 394 Q 73 427 73 466 L 78 506 77 513 69 514 Q 52 514 56 469 77 313 130 313 L 139 321";
	ctx.fillStyle=tocolor(ctrans.apply([255,255,255,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 99 571 L 98 580 91 582 Q 73 582 71 555 71 547 81 547 L 99 571";
	ctx.fillStyle=tocolor(ctrans.apply([255,255,255,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
}

function sprite189(ctx,ctrans,frame,ratio,time){
	var clips = [];
	var frame_cnt = 3;
	frame = frame % frame_cnt;
	switch(frame){
		case 0:
			place("shape186",rainy_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
		case 1:
			place("shape187",rainy_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
		case 2:
			place("shape188",rainy_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
	}
}

function sprite190(ctx,ctrans,frame,ratio,time){
	ctx.save();
	ctx.transform(1,0,0,1,406.55,285.2);
	var clips = [];
	var frame_cnt = 25;
	frame = frame % frame_cnt;
	switch(frame){
		case 0:
			place("shape165",rainy_canvas,ctx,[0.05,0.0,0.0,0.05,0.0,0.0],ctrans,1,0,0,time);
			place("shape166",rainy_canvas,ctx,[0.05,0.0,0.0,0.05,5.9,84.75],ctrans,1,0,0,time);
			var oldctx = ctx;
			var fcanvas = createCanvas(rainy_canvas.width,rainy_canvas.height);			var fctx = fcanvas.getContext("2d");
			enhanceContext(fctx);
			fctx.applyTransforms(ctx._matrix);
			ctx = fctx;
			place("sprite167",rainy_canvas,ctx,[0.05,0.0,0.0,0.05,5.9,90.95],ctrans.merge(new cxform(0,54,0,0,202,202,202,256)),1,(0+time)%1,0,time);
			ctx = oldctx;
			var ms=ctx._matrix;
			ctx.setTransform(1,0,0,1,0,0);
			ctx.drawImage(fcanvas,0,0);
			ctx.applyTransforms(ms);
			place("shape168",rainy_canvas,ctx,[0.05,0.0,0.0,0.05,0.0,0.0],ctrans,1,0,0,time);
			place("sprite170",rainy_canvas,ctx,[0.11227569580078126,0.0,0.0,0.0283233642578125,181.15,163.9],ctrans,1,(0+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06045379638671875,0.0,0.0,0.02113189697265625,-37.5,133.15],ctrans,1,(0+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.05580902099609375,0.0,0.0,0.014238739013671875,-32.85,156.75],ctrans,1,(0+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.04432830810546875,0.0,0.0,0.021036529541015626,-119.25,130.35],ctrans,1,(0+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.018972015380859374,68.05,182.6],ctrans,1,(0+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.016101837158203125,-189.5,183.25],ctrans,1,(0+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.09613037109375,0.0,0.0,0.03256301879882813,240.05,187.25],ctrans,1,(0+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.11227569580078126,0.0,0.0,0.02699737548828125,-165.3,162.45],ctrans,1,(0+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.11227569580078126,0.0,0.0,0.02699737548828125,-237.85,164.4],ctrans,1,(0+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.07821044921875,0.0,0.0,0.01880645751953125,-112.65,161.65],ctrans,1,(0+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.07821044921875,0.0,0.0,0.01880645751953125,215.1,140.4],ctrans,1,(0+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06451263427734374,0.0,0.0,0.015512847900390625,-100.35,188.05],ctrans,1,(0+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.0157958984375,42.25,172.95],ctrans,1,(0+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.0157958984375,99.85,203.65],ctrans,1,(0+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.0157958984375,130.65,178.7],ctrans,1,(0+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.0157958984375,43.75,141.5],ctrans,1,(0+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.0157958984375,257.55,160.8],ctrans,1,(0+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.0157958984375,187.9,204.75],ctrans,1,(0+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.0157958984375,22.2,168.6],ctrans,1,(0+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.07821044921875,0.0,0.0,0.01880645751953125,-242.65,190.45],ctrans,1,(0+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.07821044921875,0.0,0.0,0.01880645751953125,-44.3,189.7],ctrans,1,(0+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.0157958984375,106.9,155.05],ctrans,1,(0+time)%15,0,time);
			place("sprite181",rainy_canvas,ctx,[0.06090850830078125,0.0,0.0,0.06090850830078125,109.9,171.8],ctrans,1,(0+time)%25,0,time);
			place("sprite185",rainy_canvas,ctx,[0.03857421875,0.0,0.0,0.03857421875,-22.75,-154.85],ctrans,1,(0+time)%3,0,time);
			place("shape186",rainy_canvas,ctx,[0.020066070556640624,0.03475494384765625,-0.03475494384765625,0.020066070556640624,-300.0,148.15],ctrans,1,0,0,time);
			break;
		case 1:
			place("shape165",rainy_canvas,ctx,[0.05,0.0,0.0,0.05,0.0,0.0],ctrans,1,0,0,time);
			place("shape166",rainy_canvas,ctx,[0.05,0.0,0.0,0.05,5.9,84.75],ctrans,1,0,0,time);
			var oldctx = ctx;
			var fcanvas = createCanvas(rainy_canvas.width,rainy_canvas.height);			var fctx = fcanvas.getContext("2d");
			enhanceContext(fctx);
			fctx.applyTransforms(ctx._matrix);
			ctx = fctx;
			place("sprite167",rainy_canvas,ctx,[0.05,0.0,0.0,0.05,5.9,90.95],ctrans.merge(new cxform(0,54,0,0,202,202,202,256)),1,(0+time)%1,0,time);
			ctx = oldctx;
			var ms=ctx._matrix;
			ctx.setTransform(1,0,0,1,0,0);
			ctx.drawImage(fcanvas,0,0);
			ctx.applyTransforms(ms);
			place("shape168",rainy_canvas,ctx,[0.05,0.0,0.0,0.05,0.0,0.0],ctrans,1,0,0,time);
			place("sprite170",rainy_canvas,ctx,[0.11227569580078126,0.0,0.0,0.0283233642578125,181.15,163.9],ctrans,1,(1+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06045379638671875,0.0,0.0,0.02113189697265625,-37.5,133.15],ctrans,1,(1+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.05580902099609375,0.0,0.0,0.014238739013671875,-32.85,156.75],ctrans,1,(1+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.04432830810546875,0.0,0.0,0.021036529541015626,-119.25,130.35],ctrans,1,(1+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.018972015380859374,68.05,182.6],ctrans,1,(1+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.016101837158203125,-189.5,183.25],ctrans,1,(1+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.09613037109375,0.0,0.0,0.03256301879882813,240.05,187.25],ctrans,1,(1+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.11227569580078126,0.0,0.0,0.02699737548828125,-165.3,162.45],ctrans,1,(1+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.11227569580078126,0.0,0.0,0.02699737548828125,-237.85,164.4],ctrans,1,(1+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.07821044921875,0.0,0.0,0.01880645751953125,-112.65,161.65],ctrans,1,(1+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.07821044921875,0.0,0.0,0.01880645751953125,215.1,140.4],ctrans,1,(1+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06451263427734374,0.0,0.0,0.015512847900390625,-100.35,188.05],ctrans,1,(1+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.0157958984375,42.25,172.95],ctrans,1,(1+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.0157958984375,99.85,203.65],ctrans,1,(1+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.0157958984375,130.65,178.7],ctrans,1,(1+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.0157958984375,43.75,141.5],ctrans,1,(1+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.0157958984375,257.55,160.8],ctrans,1,(1+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.0157958984375,187.9,204.75],ctrans,1,(1+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.0157958984375,22.2,168.6],ctrans,1,(1+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.07821044921875,0.0,0.0,0.01880645751953125,-242.65,190.45],ctrans,1,(1+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.07821044921875,0.0,0.0,0.01880645751953125,-44.3,189.7],ctrans,1,(1+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.0157958984375,106.9,155.05],ctrans,1,(1+time)%15,0,time);
			place("sprite181",rainy_canvas,ctx,[0.06090850830078125,0.0,0.0,0.06090850830078125,109.9,171.8],ctrans,1,(1+time)%25,0,time);
			place("sprite185",rainy_canvas,ctx,[0.03857421875,0.0,0.0,0.03857421875,-22.75,-154.85],ctrans,1,(1+time)%3,0,time);
			place("shape187",rainy_canvas,ctx,[0.018712615966796874,0.03234939575195313,-0.03234939575195313,0.018712615966796874,-261.35,154.85],ctrans,1,0,0,time);
			break;
		case 2:
			place("shape165",rainy_canvas,ctx,[0.05,0.0,0.0,0.05,0.0,0.0],ctrans,1,0,0,time);
			place("shape166",rainy_canvas,ctx,[0.05,0.0,0.0,0.05,5.9,84.75],ctrans,1,0,0,time);
			var oldctx = ctx;
			var fcanvas = createCanvas(rainy_canvas.width,rainy_canvas.height);			var fctx = fcanvas.getContext("2d");
			enhanceContext(fctx);
			fctx.applyTransforms(ctx._matrix);
			ctx = fctx;
			place("sprite167",rainy_canvas,ctx,[0.05,0.0,0.0,0.05,5.9,90.95],ctrans.merge(new cxform(0,54,0,0,202,202,202,256)),1,(0+time)%1,0,time);
			ctx = oldctx;
			var ms=ctx._matrix;
			ctx.setTransform(1,0,0,1,0,0);
			ctx.drawImage(fcanvas,0,0);
			ctx.applyTransforms(ms);
			place("shape168",rainy_canvas,ctx,[0.05,0.0,0.0,0.05,0.0,0.0],ctrans,1,0,0,time);
			place("sprite170",rainy_canvas,ctx,[0.11227569580078126,0.0,0.0,0.0283233642578125,181.15,163.9],ctrans,1,(2+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06045379638671875,0.0,0.0,0.02113189697265625,-37.5,133.15],ctrans,1,(2+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.05580902099609375,0.0,0.0,0.014238739013671875,-32.85,156.75],ctrans,1,(2+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.04432830810546875,0.0,0.0,0.021036529541015626,-119.25,130.35],ctrans,1,(2+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.018972015380859374,68.05,182.6],ctrans,1,(2+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.016101837158203125,-189.5,183.25],ctrans,1,(2+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.09613037109375,0.0,0.0,0.03256301879882813,240.05,187.25],ctrans,1,(2+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.11227569580078126,0.0,0.0,0.02699737548828125,-165.3,162.45],ctrans,1,(2+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.11227569580078126,0.0,0.0,0.02699737548828125,-237.85,164.4],ctrans,1,(2+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.07821044921875,0.0,0.0,0.01880645751953125,-112.65,161.65],ctrans,1,(2+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.07821044921875,0.0,0.0,0.01880645751953125,215.1,140.4],ctrans,1,(2+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06451263427734374,0.0,0.0,0.015512847900390625,-100.35,188.05],ctrans,1,(2+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.0157958984375,42.25,172.95],ctrans,1,(2+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.0157958984375,99.85,203.65],ctrans,1,(2+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.0157958984375,130.65,178.7],ctrans,1,(2+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.0157958984375,43.75,141.5],ctrans,1,(2+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.0157958984375,257.55,160.8],ctrans,1,(2+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.0157958984375,187.9,204.75],ctrans,1,(2+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.0157958984375,22.2,168.6],ctrans,1,(2+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.07821044921875,0.0,0.0,0.01880645751953125,-242.65,190.45],ctrans,1,(2+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.07821044921875,0.0,0.0,0.01880645751953125,-44.3,189.7],ctrans,1,(2+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.0157958984375,106.9,155.05],ctrans,1,(2+time)%15,0,time);
			place("sprite181",rainy_canvas,ctx,[0.06090850830078125,0.0,0.0,0.06090850830078125,109.9,171.8],ctrans,1,(2+time)%25,0,time);
			place("sprite185",rainy_canvas,ctx,[0.03857421875,0.0,0.0,0.03857421875,-22.75,-154.85],ctrans,1,(2+time)%3,0,time);
			place("shape188",rainy_canvas,ctx,[0.017359161376953126,0.03000946044921875,-0.030008697509765626,0.0173583984375,-222.7,161.6],ctrans,1,0,0,time);
			break;
		case 3:
			place("shape165",rainy_canvas,ctx,[0.05,0.0,0.0,0.05,0.0,0.0],ctrans,1,0,0,time);
			place("shape166",rainy_canvas,ctx,[0.05,0.0,0.0,0.05,5.9,84.75],ctrans,1,0,0,time);
			var oldctx = ctx;
			var fcanvas = createCanvas(rainy_canvas.width,rainy_canvas.height);			var fctx = fcanvas.getContext("2d");
			enhanceContext(fctx);
			fctx.applyTransforms(ctx._matrix);
			ctx = fctx;
			place("sprite167",rainy_canvas,ctx,[0.05,0.0,0.0,0.05,5.9,90.95],ctrans.merge(new cxform(0,54,0,0,202,202,202,256)),1,(0+time)%1,0,time);
			ctx = oldctx;
			var ms=ctx._matrix;
			ctx.setTransform(1,0,0,1,0,0);
			ctx.drawImage(fcanvas,0,0);
			ctx.applyTransforms(ms);
			place("shape168",rainy_canvas,ctx,[0.05,0.0,0.0,0.05,0.0,0.0],ctrans,1,0,0,time);
			place("sprite170",rainy_canvas,ctx,[0.11227569580078126,0.0,0.0,0.0283233642578125,181.15,163.9],ctrans,1,(3+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06045379638671875,0.0,0.0,0.02113189697265625,-37.5,133.15],ctrans,1,(3+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.05580902099609375,0.0,0.0,0.014238739013671875,-32.85,156.75],ctrans,1,(3+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.04432830810546875,0.0,0.0,0.021036529541015626,-119.25,130.35],ctrans,1,(3+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.018972015380859374,68.05,182.6],ctrans,1,(3+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.016101837158203125,-189.5,183.25],ctrans,1,(3+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.09613037109375,0.0,0.0,0.03256301879882813,240.05,187.25],ctrans,1,(3+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.11227569580078126,0.0,0.0,0.02699737548828125,-165.3,162.45],ctrans,1,(3+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.11227569580078126,0.0,0.0,0.02699737548828125,-237.85,164.4],ctrans,1,(3+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.07821044921875,0.0,0.0,0.01880645751953125,-112.65,161.65],ctrans,1,(3+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.07821044921875,0.0,0.0,0.01880645751953125,215.1,140.4],ctrans,1,(3+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06451263427734374,0.0,0.0,0.015512847900390625,-100.35,188.05],ctrans,1,(3+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.0157958984375,42.25,172.95],ctrans,1,(3+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.0157958984375,99.85,203.65],ctrans,1,(3+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.0157958984375,130.65,178.7],ctrans,1,(3+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.0157958984375,43.75,141.5],ctrans,1,(3+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.0157958984375,257.55,160.8],ctrans,1,(3+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.0157958984375,187.9,204.75],ctrans,1,(3+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.0157958984375,22.2,168.6],ctrans,1,(3+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.07821044921875,0.0,0.0,0.01880645751953125,-242.65,190.45],ctrans,1,(3+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.07821044921875,0.0,0.0,0.01880645751953125,-44.3,189.7],ctrans,1,(3+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.0157958984375,106.9,155.05],ctrans,1,(3+time)%15,0,time);
			place("sprite181",rainy_canvas,ctx,[0.06090850830078125,0.0,0.0,0.06090850830078125,109.9,171.8],ctrans,1,(3+time)%25,0,time);
			place("sprite185",rainy_canvas,ctx,[0.03857421875,0.0,0.0,0.03857421875,-22.75,-154.85],ctrans,1,(0+time)%3,0,time);
			place("shape186",rainy_canvas,ctx,[0.016005706787109376,0.027722930908203124,-0.027722930908203124,0.016005706787109376,-184.1,168.35],ctrans,1,0,0,time);
			break;
		case 4:
			place("shape165",rainy_canvas,ctx,[0.05,0.0,0.0,0.05,0.0,0.0],ctrans,1,0,0,time);
			place("shape166",rainy_canvas,ctx,[0.05,0.0,0.0,0.05,5.9,84.75],ctrans,1,0,0,time);
			var oldctx = ctx;
			var fcanvas = createCanvas(rainy_canvas.width,rainy_canvas.height);			var fctx = fcanvas.getContext("2d");
			enhanceContext(fctx);
			fctx.applyTransforms(ctx._matrix);
			ctx = fctx;
			place("sprite167",rainy_canvas,ctx,[0.05,0.0,0.0,0.05,5.9,90.95],ctrans.merge(new cxform(0,54,0,0,202,202,202,256)),1,(0+time)%1,0,time);
			ctx = oldctx;
			var ms=ctx._matrix;
			ctx.setTransform(1,0,0,1,0,0);
			ctx.drawImage(fcanvas,0,0);
			ctx.applyTransforms(ms);
			place("shape168",rainy_canvas,ctx,[0.05,0.0,0.0,0.05,0.0,0.0],ctrans,1,0,0,time);
			place("sprite170",rainy_canvas,ctx,[0.11227569580078126,0.0,0.0,0.0283233642578125,181.15,163.9],ctrans,1,(4+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06045379638671875,0.0,0.0,0.02113189697265625,-37.5,133.15],ctrans,1,(4+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.05580902099609375,0.0,0.0,0.014238739013671875,-32.85,156.75],ctrans,1,(4+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.04432830810546875,0.0,0.0,0.021036529541015626,-119.25,130.35],ctrans,1,(4+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.018972015380859374,68.05,182.6],ctrans,1,(4+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.016101837158203125,-189.5,183.25],ctrans,1,(4+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.09613037109375,0.0,0.0,0.03256301879882813,240.05,187.25],ctrans,1,(4+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.11227569580078126,0.0,0.0,0.02699737548828125,-165.3,162.45],ctrans,1,(4+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.11227569580078126,0.0,0.0,0.02699737548828125,-237.85,164.4],ctrans,1,(4+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.07821044921875,0.0,0.0,0.01880645751953125,-112.65,161.65],ctrans,1,(4+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.07821044921875,0.0,0.0,0.01880645751953125,215.1,140.4],ctrans,1,(4+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06451263427734374,0.0,0.0,0.015512847900390625,-100.35,188.05],ctrans,1,(4+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.0157958984375,42.25,172.95],ctrans,1,(4+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.0157958984375,99.85,203.65],ctrans,1,(4+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.0157958984375,130.65,178.7],ctrans,1,(4+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.0157958984375,43.75,141.5],ctrans,1,(4+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.0157958984375,257.55,160.8],ctrans,1,(4+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.0157958984375,187.9,204.75],ctrans,1,(4+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.0157958984375,22.2,168.6],ctrans,1,(4+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.07821044921875,0.0,0.0,0.01880645751953125,-242.65,190.45],ctrans,1,(4+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.07821044921875,0.0,0.0,0.01880645751953125,-44.3,189.7],ctrans,1,(4+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.0157958984375,106.9,155.05],ctrans,1,(4+time)%15,0,time);
			place("sprite181",rainy_canvas,ctx,[0.06090850830078125,0.0,0.0,0.06090850830078125,109.9,171.8],ctrans,1,(4+time)%25,0,time);
			place("sprite185",rainy_canvas,ctx,[0.03857421875,0.0,0.0,0.03857421875,-22.75,-154.85],ctrans,1,(1+time)%3,0,time);
			place("shape187",rainy_canvas,ctx,[0.015531158447265625,0.030023956298828126,-0.030023956298828126,0.015531158447265625,-160.2,142.8],ctrans,1,0,0,time);
			break;
		case 5:
			place("shape165",rainy_canvas,ctx,[0.05,0.0,0.0,0.05,0.0,0.0],ctrans,1,0,0,time);
			place("shape166",rainy_canvas,ctx,[0.05,0.0,0.0,0.05,5.9,84.75],ctrans,1,0,0,time);
			var oldctx = ctx;
			var fcanvas = createCanvas(rainy_canvas.width,rainy_canvas.height);			var fctx = fcanvas.getContext("2d");
			enhanceContext(fctx);
			fctx.applyTransforms(ctx._matrix);
			ctx = fctx;
			place("sprite167",rainy_canvas,ctx,[0.05,0.0,0.0,0.05,5.9,90.95],ctrans.merge(new cxform(0,54,0,0,202,202,202,256)),1,(0+time)%1,0,time);
			ctx = oldctx;
			var ms=ctx._matrix;
			ctx.setTransform(1,0,0,1,0,0);
			ctx.drawImage(fcanvas,0,0);
			ctx.applyTransforms(ms);
			place("shape168",rainy_canvas,ctx,[0.05,0.0,0.0,0.05,0.0,0.0],ctrans,1,0,0,time);
			place("sprite170",rainy_canvas,ctx,[0.11227569580078126,0.0,0.0,0.0283233642578125,181.15,163.9],ctrans,1,(5+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06045379638671875,0.0,0.0,0.02113189697265625,-37.5,133.15],ctrans,1,(5+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.05580902099609375,0.0,0.0,0.014238739013671875,-32.85,156.75],ctrans,1,(5+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.04432830810546875,0.0,0.0,0.021036529541015626,-119.25,130.35],ctrans,1,(5+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.018972015380859374,68.05,182.6],ctrans,1,(5+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.016101837158203125,-189.5,183.25],ctrans,1,(5+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.09613037109375,0.0,0.0,0.03256301879882813,240.05,187.25],ctrans,1,(5+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.11227569580078126,0.0,0.0,0.02699737548828125,-165.3,162.45],ctrans,1,(5+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.11227569580078126,0.0,0.0,0.02699737548828125,-237.85,164.4],ctrans,1,(5+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.07821044921875,0.0,0.0,0.01880645751953125,-112.65,161.65],ctrans,1,(5+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.07821044921875,0.0,0.0,0.01880645751953125,215.1,140.4],ctrans,1,(5+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06451263427734374,0.0,0.0,0.015512847900390625,-100.35,188.05],ctrans,1,(5+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.0157958984375,42.25,172.95],ctrans,1,(5+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.0157958984375,99.85,203.65],ctrans,1,(5+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.0157958984375,130.65,178.7],ctrans,1,(5+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.0157958984375,43.75,141.5],ctrans,1,(5+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.0157958984375,257.55,160.8],ctrans,1,(5+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.0157958984375,187.9,204.75],ctrans,1,(5+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.0157958984375,22.2,168.6],ctrans,1,(5+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.07821044921875,0.0,0.0,0.01880645751953125,-242.65,190.45],ctrans,1,(5+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.07821044921875,0.0,0.0,0.01880645751953125,-44.3,189.7],ctrans,1,(5+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.0157958984375,106.9,155.05],ctrans,1,(5+time)%15,0,time);
			place("sprite181",rainy_canvas,ctx,[0.06090850830078125,0.0,0.0,0.06090850830078125,109.9,171.8],ctrans,1,(5+time)%25,0,time);
			place("sprite185",rainy_canvas,ctx,[0.03857421875,0.0,0.0,0.03857421875,-22.75,-154.85],ctrans,1,(2+time)%3,0,time);
			place("shape188",rainy_canvas,ctx,[0.0149749755859375,0.032342529296875,-0.032342529296875,0.0149749755859375,-136.2,117.3],ctrans,1,0,0,time);
			break;
		case 6:
			place("shape165",rainy_canvas,ctx,[0.05,0.0,0.0,0.05,0.0,0.0],ctrans,1,0,0,time);
			place("shape166",rainy_canvas,ctx,[0.05,0.0,0.0,0.05,5.9,84.75],ctrans,1,0,0,time);
			var oldctx = ctx;
			var fcanvas = createCanvas(rainy_canvas.width,rainy_canvas.height);			var fctx = fcanvas.getContext("2d");
			enhanceContext(fctx);
			fctx.applyTransforms(ctx._matrix);
			ctx = fctx;
			place("sprite167",rainy_canvas,ctx,[0.05,0.0,0.0,0.05,5.9,90.95],ctrans.merge(new cxform(0,54,0,0,202,202,202,256)),1,(0+time)%1,0,time);
			ctx = oldctx;
			var ms=ctx._matrix;
			ctx.setTransform(1,0,0,1,0,0);
			ctx.drawImage(fcanvas,0,0);
			ctx.applyTransforms(ms);
			place("shape168",rainy_canvas,ctx,[0.05,0.0,0.0,0.05,0.0,0.0],ctrans,1,0,0,time);
			place("sprite170",rainy_canvas,ctx,[0.11227569580078126,0.0,0.0,0.0283233642578125,181.15,163.9],ctrans,1,(6+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06045379638671875,0.0,0.0,0.02113189697265625,-37.5,133.15],ctrans,1,(6+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.05580902099609375,0.0,0.0,0.014238739013671875,-32.85,156.75],ctrans,1,(6+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.04432830810546875,0.0,0.0,0.021036529541015626,-119.25,130.35],ctrans,1,(6+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.018972015380859374,68.05,182.6],ctrans,1,(6+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.016101837158203125,-189.5,183.25],ctrans,1,(6+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.09613037109375,0.0,0.0,0.03256301879882813,240.05,187.25],ctrans,1,(6+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.11227569580078126,0.0,0.0,0.02699737548828125,-165.3,162.45],ctrans,1,(6+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.11227569580078126,0.0,0.0,0.02699737548828125,-237.85,164.4],ctrans,1,(6+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.07821044921875,0.0,0.0,0.01880645751953125,-112.65,161.65],ctrans,1,(6+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.07821044921875,0.0,0.0,0.01880645751953125,215.1,140.4],ctrans,1,(6+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06451263427734374,0.0,0.0,0.015512847900390625,-100.35,188.05],ctrans,1,(6+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.0157958984375,42.25,172.95],ctrans,1,(6+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.0157958984375,99.85,203.65],ctrans,1,(6+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.0157958984375,130.65,178.7],ctrans,1,(6+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.0157958984375,43.75,141.5],ctrans,1,(6+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.0157958984375,257.55,160.8],ctrans,1,(6+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.0157958984375,187.9,204.75],ctrans,1,(6+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.0157958984375,22.2,168.6],ctrans,1,(6+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.07821044921875,0.0,0.0,0.01880645751953125,-242.65,190.45],ctrans,1,(6+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.07821044921875,0.0,0.0,0.01880645751953125,-44.3,189.7],ctrans,1,(6+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.0157958984375,106.9,155.05],ctrans,1,(6+time)%15,0,time);
			place("sprite181",rainy_canvas,ctx,[0.06090850830078125,0.0,0.0,0.06090850830078125,109.9,171.8],ctrans,1,(6+time)%25,0,time);
			place("sprite185",rainy_canvas,ctx,[0.03857421875,0.0,0.0,0.03857421875,-22.75,-154.85],ctrans,1,(0+time)%3,0,time);
			place("shape186",rainy_canvas,ctx,[0.01424560546875,0.03466644287109375,-0.03466644287109375,0.01424560546875,-112.15,91.8],ctrans,1,0,0,time);
			break;
		case 7:
			place("shape165",rainy_canvas,ctx,[0.05,0.0,0.0,0.05,0.0,0.0],ctrans,1,0,0,time);
			place("shape166",rainy_canvas,ctx,[0.05,0.0,0.0,0.05,5.9,84.75],ctrans,1,0,0,time);
			var oldctx = ctx;
			var fcanvas = createCanvas(rainy_canvas.width,rainy_canvas.height);			var fctx = fcanvas.getContext("2d");
			enhanceContext(fctx);
			fctx.applyTransforms(ctx._matrix);
			ctx = fctx;
			place("sprite167",rainy_canvas,ctx,[0.05,0.0,0.0,0.05,5.9,90.95],ctrans.merge(new cxform(0,54,0,0,202,202,202,256)),1,(0+time)%1,0,time);
			ctx = oldctx;
			var ms=ctx._matrix;
			ctx.setTransform(1,0,0,1,0,0);
			ctx.drawImage(fcanvas,0,0);
			ctx.applyTransforms(ms);
			place("shape168",rainy_canvas,ctx,[0.05,0.0,0.0,0.05,0.0,0.0],ctrans,1,0,0,time);
			place("sprite170",rainy_canvas,ctx,[0.11227569580078126,0.0,0.0,0.0283233642578125,181.15,163.9],ctrans,1,(7+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06045379638671875,0.0,0.0,0.02113189697265625,-37.5,133.15],ctrans,1,(7+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.05580902099609375,0.0,0.0,0.014238739013671875,-32.85,156.75],ctrans,1,(7+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.04432830810546875,0.0,0.0,0.021036529541015626,-119.25,130.35],ctrans,1,(7+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.018972015380859374,68.05,182.6],ctrans,1,(7+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.016101837158203125,-189.5,183.25],ctrans,1,(7+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.09613037109375,0.0,0.0,0.03256301879882813,240.05,187.25],ctrans,1,(7+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.11227569580078126,0.0,0.0,0.02699737548828125,-165.3,162.45],ctrans,1,(7+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.11227569580078126,0.0,0.0,0.02699737548828125,-237.85,164.4],ctrans,1,(7+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.07821044921875,0.0,0.0,0.01880645751953125,-112.65,161.65],ctrans,1,(7+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.07821044921875,0.0,0.0,0.01880645751953125,215.1,140.4],ctrans,1,(7+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06451263427734374,0.0,0.0,0.015512847900390625,-100.35,188.05],ctrans,1,(7+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.0157958984375,42.25,172.95],ctrans,1,(7+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.0157958984375,99.85,203.65],ctrans,1,(7+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.0157958984375,130.65,178.7],ctrans,1,(7+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.0157958984375,43.75,141.5],ctrans,1,(7+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.0157958984375,257.55,160.8],ctrans,1,(7+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.0157958984375,187.9,204.75],ctrans,1,(7+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.0157958984375,22.2,168.6],ctrans,1,(7+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.07821044921875,0.0,0.0,0.01880645751953125,-242.65,190.45],ctrans,1,(7+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.07821044921875,0.0,0.0,0.01880645751953125,-44.3,189.7],ctrans,1,(7+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.0157958984375,106.9,155.05],ctrans,1,(7+time)%15,0,time);
			place("sprite181",rainy_canvas,ctx,[0.06090850830078125,0.0,0.0,0.06090850830078125,109.9,171.8],ctrans,1,(7+time)%25,0,time);
			place("sprite185",rainy_canvas,ctx,[0.03857421875,0.0,0.0,0.03857421875,-22.75,-154.85],ctrans,1,(1+time)%3,0,time);
			place("shape187",rainy_canvas,ctx,[0.01334075927734375,0.03698577880859375,-0.03698577880859375,0.01334075927734375,-88.15,66.4],ctrans,1,0,0,time);
			break;
		case 8:
			place("shape165",rainy_canvas,ctx,[0.05,0.0,0.0,0.05,0.0,0.0],ctrans,1,0,0,time);
			place("shape166",rainy_canvas,ctx,[0.05,0.0,0.0,0.05,5.9,84.75],ctrans,1,0,0,time);
			var oldctx = ctx;
			var fcanvas = createCanvas(rainy_canvas.width,rainy_canvas.height);			var fctx = fcanvas.getContext("2d");
			enhanceContext(fctx);
			fctx.applyTransforms(ctx._matrix);
			ctx = fctx;
			place("sprite167",rainy_canvas,ctx,[0.05,0.0,0.0,0.05,5.9,90.95],ctrans.merge(new cxform(0,54,0,0,202,202,202,256)),1,(0+time)%1,0,time);
			ctx = oldctx;
			var ms=ctx._matrix;
			ctx.setTransform(1,0,0,1,0,0);
			ctx.drawImage(fcanvas,0,0);
			ctx.applyTransforms(ms);
			place("shape168",rainy_canvas,ctx,[0.05,0.0,0.0,0.05,0.0,0.0],ctrans,1,0,0,time);
			place("sprite170",rainy_canvas,ctx,[0.11227569580078126,0.0,0.0,0.0283233642578125,181.15,163.9],ctrans,1,(8+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06045379638671875,0.0,0.0,0.02113189697265625,-37.5,133.15],ctrans,1,(8+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.05580902099609375,0.0,0.0,0.014238739013671875,-32.85,156.75],ctrans,1,(8+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.04432830810546875,0.0,0.0,0.021036529541015626,-119.25,130.35],ctrans,1,(8+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.018972015380859374,68.05,182.6],ctrans,1,(8+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.016101837158203125,-189.5,183.25],ctrans,1,(8+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.09613037109375,0.0,0.0,0.03256301879882813,240.05,187.25],ctrans,1,(8+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.11227569580078126,0.0,0.0,0.02699737548828125,-165.3,162.45],ctrans,1,(8+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.11227569580078126,0.0,0.0,0.02699737548828125,-237.85,164.4],ctrans,1,(8+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.07821044921875,0.0,0.0,0.01880645751953125,-112.65,161.65],ctrans,1,(8+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.07821044921875,0.0,0.0,0.01880645751953125,215.1,140.4],ctrans,1,(8+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06451263427734374,0.0,0.0,0.015512847900390625,-100.35,188.05],ctrans,1,(8+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.0157958984375,42.25,172.95],ctrans,1,(8+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.0157958984375,99.85,203.65],ctrans,1,(8+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.0157958984375,130.65,178.7],ctrans,1,(8+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.0157958984375,43.75,141.5],ctrans,1,(8+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.0157958984375,257.55,160.8],ctrans,1,(8+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.0157958984375,187.9,204.75],ctrans,1,(8+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.0157958984375,22.2,168.6],ctrans,1,(8+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.07821044921875,0.0,0.0,0.01880645751953125,-242.65,190.45],ctrans,1,(8+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.07821044921875,0.0,0.0,0.01880645751953125,-44.3,189.7],ctrans,1,(8+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.0157958984375,106.9,155.05],ctrans,1,(8+time)%15,0,time);
			place("sprite181",rainy_canvas,ctx,[0.06090850830078125,0.0,0.0,0.06090850830078125,109.9,171.8],ctrans,1,(8+time)%25,0,time);
			place("sprite185",rainy_canvas,ctx,[0.03857421875,0.0,0.0,0.03857421875,-22.75,-154.85],ctrans,1,(2+time)%3,0,time);
			place("shape188",rainy_canvas,ctx,[0.0122589111328125,0.03928985595703125,-0.03928985595703125,0.0122589111328125,-64.15,41.1],ctrans,1,0,0,time);
			break;
		case 9:
			place("shape165",rainy_canvas,ctx,[0.05,0.0,0.0,0.05,0.0,0.0],ctrans,1,0,0,time);
			place("shape166",rainy_canvas,ctx,[0.05,0.0,0.0,0.05,5.9,84.75],ctrans,1,0,0,time);
			var oldctx = ctx;
			var fcanvas = createCanvas(rainy_canvas.width,rainy_canvas.height);			var fctx = fcanvas.getContext("2d");
			enhanceContext(fctx);
			fctx.applyTransforms(ctx._matrix);
			ctx = fctx;
			place("sprite167",rainy_canvas,ctx,[0.05,0.0,0.0,0.05,5.9,90.95],ctrans.merge(new cxform(0,54,0,0,202,202,202,256)),1,(0+time)%1,0,time);
			ctx = oldctx;
			var ms=ctx._matrix;
			ctx.setTransform(1,0,0,1,0,0);
			ctx.drawImage(fcanvas,0,0);
			ctx.applyTransforms(ms);
			place("shape168",rainy_canvas,ctx,[0.05,0.0,0.0,0.05,0.0,0.0],ctrans,1,0,0,time);
			place("sprite170",rainy_canvas,ctx,[0.11227569580078126,0.0,0.0,0.0283233642578125,181.15,163.9],ctrans,1,(9+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06045379638671875,0.0,0.0,0.02113189697265625,-37.5,133.15],ctrans,1,(9+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.05580902099609375,0.0,0.0,0.014238739013671875,-32.85,156.75],ctrans,1,(9+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.04432830810546875,0.0,0.0,0.021036529541015626,-119.25,130.35],ctrans,1,(9+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.018972015380859374,68.05,182.6],ctrans,1,(9+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.016101837158203125,-189.5,183.25],ctrans,1,(9+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.09613037109375,0.0,0.0,0.03256301879882813,240.05,187.25],ctrans,1,(9+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.11227569580078126,0.0,0.0,0.02699737548828125,-165.3,162.45],ctrans,1,(9+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.11227569580078126,0.0,0.0,0.02699737548828125,-237.85,164.4],ctrans,1,(9+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.07821044921875,0.0,0.0,0.01880645751953125,-112.65,161.65],ctrans,1,(9+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.07821044921875,0.0,0.0,0.01880645751953125,215.1,140.4],ctrans,1,(9+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06451263427734374,0.0,0.0,0.015512847900390625,-100.35,188.05],ctrans,1,(9+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.0157958984375,42.25,172.95],ctrans,1,(9+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.0157958984375,99.85,203.65],ctrans,1,(9+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.0157958984375,130.65,178.7],ctrans,1,(9+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.0157958984375,43.75,141.5],ctrans,1,(9+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.0157958984375,257.55,160.8],ctrans,1,(9+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.0157958984375,187.9,204.75],ctrans,1,(9+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.0157958984375,22.2,168.6],ctrans,1,(9+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.07821044921875,0.0,0.0,0.01880645751953125,-242.65,190.45],ctrans,1,(9+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.07821044921875,0.0,0.0,0.01880645751953125,-44.3,189.7],ctrans,1,(9+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.0157958984375,106.9,155.05],ctrans,1,(9+time)%15,0,time);
			place("sprite181",rainy_canvas,ctx,[0.06090850830078125,0.0,0.0,0.06090850830078125,109.9,171.8],ctrans,1,(9+time)%25,0,time);
			place("sprite185",rainy_canvas,ctx,[0.03857421875,0.0,0.0,0.03857421875,-22.75,-154.85],ctrans,1,(0+time)%3,0,time);
			place("sprite189",rainy_canvas,ctx,[0.01113739013671875,0.041567230224609376,-0.041567230224609376,0.01113739013671875,-52.15,33.25],ctrans,1,(0+time)%3,9,time);
			break;
		case 10:
			place("shape165",rainy_canvas,ctx,[0.05,0.0,0.0,0.05,0.0,0.0],ctrans,1,0,0,time);
			place("shape166",rainy_canvas,ctx,[0.05,0.0,0.0,0.05,5.9,84.75],ctrans,1,0,0,time);
			var oldctx = ctx;
			var fcanvas = createCanvas(rainy_canvas.width,rainy_canvas.height);			var fctx = fcanvas.getContext("2d");
			enhanceContext(fctx);
			fctx.applyTransforms(ctx._matrix);
			ctx = fctx;
			place("sprite167",rainy_canvas,ctx,[0.05,0.0,0.0,0.05,5.9,90.95],ctrans.merge(new cxform(0,54,0,0,202,202,202,256)),1,(0+time)%1,0,time);
			ctx = oldctx;
			var ms=ctx._matrix;
			ctx.setTransform(1,0,0,1,0,0);
			ctx.drawImage(fcanvas,0,0);
			ctx.applyTransforms(ms);
			place("shape168",rainy_canvas,ctx,[0.05,0.0,0.0,0.05,0.0,0.0],ctrans,1,0,0,time);
			place("sprite170",rainy_canvas,ctx,[0.11227569580078126,0.0,0.0,0.0283233642578125,181.15,163.9],ctrans,1,(10+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06045379638671875,0.0,0.0,0.02113189697265625,-37.5,133.15],ctrans,1,(10+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.05580902099609375,0.0,0.0,0.014238739013671875,-32.85,156.75],ctrans,1,(10+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.04432830810546875,0.0,0.0,0.021036529541015626,-119.25,130.35],ctrans,1,(10+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.018972015380859374,68.05,182.6],ctrans,1,(10+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.016101837158203125,-189.5,183.25],ctrans,1,(10+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.09613037109375,0.0,0.0,0.03256301879882813,240.05,187.25],ctrans,1,(10+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.11227569580078126,0.0,0.0,0.02699737548828125,-165.3,162.45],ctrans,1,(10+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.11227569580078126,0.0,0.0,0.02699737548828125,-237.85,164.4],ctrans,1,(10+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.07821044921875,0.0,0.0,0.01880645751953125,-112.65,161.65],ctrans,1,(10+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.07821044921875,0.0,0.0,0.01880645751953125,215.1,140.4],ctrans,1,(10+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06451263427734374,0.0,0.0,0.015512847900390625,-100.35,188.05],ctrans,1,(10+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.0157958984375,42.25,172.95],ctrans,1,(10+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.0157958984375,99.85,203.65],ctrans,1,(10+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.0157958984375,130.65,178.7],ctrans,1,(10+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.0157958984375,43.75,141.5],ctrans,1,(10+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.0157958984375,257.55,160.8],ctrans,1,(10+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.0157958984375,187.9,204.75],ctrans,1,(10+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.0157958984375,22.2,168.6],ctrans,1,(10+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.07821044921875,0.0,0.0,0.01880645751953125,-242.65,190.45],ctrans,1,(10+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.07821044921875,0.0,0.0,0.01880645751953125,-44.3,189.7],ctrans,1,(10+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.0157958984375,106.9,155.05],ctrans,1,(10+time)%15,0,time);
			place("sprite181",rainy_canvas,ctx,[0.06090850830078125,0.0,0.0,0.06090850830078125,109.9,171.8],ctrans,1,(10+time)%25,0,time);
			place("sprite185",rainy_canvas,ctx,[0.03857421875,0.0,0.0,0.03857421875,-22.75,-154.85],ctrans,1,(1+time)%3,0,time);
			place("sprite189",rainy_canvas,ctx,[0.012406158447265624,0.041103363037109375,-0.041103363037109375,0.012406158447265624,-48.5,38.35],ctrans,1,(1+time)%3,9,time);
			break;
		case 11:
			place("shape165",rainy_canvas,ctx,[0.05,0.0,0.0,0.05,0.0,0.0],ctrans,1,0,0,time);
			place("shape166",rainy_canvas,ctx,[0.05,0.0,0.0,0.05,5.9,84.75],ctrans,1,0,0,time);
			var oldctx = ctx;
			var fcanvas = createCanvas(rainy_canvas.width,rainy_canvas.height);			var fctx = fcanvas.getContext("2d");
			enhanceContext(fctx);
			fctx.applyTransforms(ctx._matrix);
			ctx = fctx;
			place("sprite167",rainy_canvas,ctx,[0.05,0.0,0.0,0.05,5.9,90.95],ctrans.merge(new cxform(0,54,0,0,202,202,202,256)),1,(0+time)%1,0,time);
			ctx = oldctx;
			var ms=ctx._matrix;
			ctx.setTransform(1,0,0,1,0,0);
			ctx.drawImage(fcanvas,0,0);
			ctx.applyTransforms(ms);
			place("shape168",rainy_canvas,ctx,[0.05,0.0,0.0,0.05,0.0,0.0],ctrans,1,0,0,time);
			place("sprite170",rainy_canvas,ctx,[0.11227569580078126,0.0,0.0,0.0283233642578125,181.15,163.9],ctrans,1,(11+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06045379638671875,0.0,0.0,0.02113189697265625,-37.5,133.15],ctrans,1,(11+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.05580902099609375,0.0,0.0,0.014238739013671875,-32.85,156.75],ctrans,1,(11+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.04432830810546875,0.0,0.0,0.021036529541015626,-119.25,130.35],ctrans,1,(11+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.018972015380859374,68.05,182.6],ctrans,1,(11+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.016101837158203125,-189.5,183.25],ctrans,1,(11+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.09613037109375,0.0,0.0,0.03256301879882813,240.05,187.25],ctrans,1,(11+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.11227569580078126,0.0,0.0,0.02699737548828125,-165.3,162.45],ctrans,1,(11+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.11227569580078126,0.0,0.0,0.02699737548828125,-237.85,164.4],ctrans,1,(11+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.07821044921875,0.0,0.0,0.01880645751953125,-112.65,161.65],ctrans,1,(11+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.07821044921875,0.0,0.0,0.01880645751953125,215.1,140.4],ctrans,1,(11+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06451263427734374,0.0,0.0,0.015512847900390625,-100.35,188.05],ctrans,1,(11+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.0157958984375,42.25,172.95],ctrans,1,(11+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.0157958984375,99.85,203.65],ctrans,1,(11+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.0157958984375,130.65,178.7],ctrans,1,(11+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.0157958984375,43.75,141.5],ctrans,1,(11+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.0157958984375,257.55,160.8],ctrans,1,(11+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.0157958984375,187.9,204.75],ctrans,1,(11+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.0157958984375,22.2,168.6],ctrans,1,(11+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.07821044921875,0.0,0.0,0.01880645751953125,-242.65,190.45],ctrans,1,(11+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.07821044921875,0.0,0.0,0.01880645751953125,-44.3,189.7],ctrans,1,(11+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.0157958984375,106.9,155.05],ctrans,1,(11+time)%15,0,time);
			place("sprite181",rainy_canvas,ctx,[0.06090850830078125,0.0,0.0,0.06090850830078125,109.9,171.8],ctrans,1,(11+time)%25,0,time);
			place("sprite185",rainy_canvas,ctx,[0.03857421875,0.0,0.0,0.03857421875,-22.75,-154.85],ctrans,1,(2+time)%3,0,time);
			place("sprite189",rainy_canvas,ctx,[0.01366119384765625,0.040636444091796876,-0.040636444091796876,0.01366119384765625,-44.95,43.4],ctrans,1,(2+time)%3,9,time);
			break;
		case 12:
			place("shape165",rainy_canvas,ctx,[0.05,0.0,0.0,0.05,0.0,0.0],ctrans,1,0,0,time);
			place("shape166",rainy_canvas,ctx,[0.05,0.0,0.0,0.05,5.9,84.75],ctrans,1,0,0,time);
			var oldctx = ctx;
			var fcanvas = createCanvas(rainy_canvas.width,rainy_canvas.height);			var fctx = fcanvas.getContext("2d");
			enhanceContext(fctx);
			fctx.applyTransforms(ctx._matrix);
			ctx = fctx;
			place("sprite167",rainy_canvas,ctx,[0.05,0.0,0.0,0.05,5.9,90.95],ctrans.merge(new cxform(0,54,0,0,202,202,202,256)),1,(0+time)%1,0,time);
			ctx = oldctx;
			var ms=ctx._matrix;
			ctx.setTransform(1,0,0,1,0,0);
			ctx.drawImage(fcanvas,0,0);
			ctx.applyTransforms(ms);
			place("shape168",rainy_canvas,ctx,[0.05,0.0,0.0,0.05,0.0,0.0],ctrans,1,0,0,time);
			place("sprite170",rainy_canvas,ctx,[0.11227569580078126,0.0,0.0,0.0283233642578125,181.15,163.9],ctrans,1,(12+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06045379638671875,0.0,0.0,0.02113189697265625,-37.5,133.15],ctrans,1,(12+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.05580902099609375,0.0,0.0,0.014238739013671875,-32.85,156.75],ctrans,1,(12+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.04432830810546875,0.0,0.0,0.021036529541015626,-119.25,130.35],ctrans,1,(12+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.018972015380859374,68.05,182.6],ctrans,1,(12+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.016101837158203125,-189.5,183.25],ctrans,1,(12+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.09613037109375,0.0,0.0,0.03256301879882813,240.05,187.25],ctrans,1,(12+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.11227569580078126,0.0,0.0,0.02699737548828125,-165.3,162.45],ctrans,1,(12+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.11227569580078126,0.0,0.0,0.02699737548828125,-237.85,164.4],ctrans,1,(12+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.07821044921875,0.0,0.0,0.01880645751953125,-112.65,161.65],ctrans,1,(12+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.07821044921875,0.0,0.0,0.01880645751953125,215.1,140.4],ctrans,1,(12+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06451263427734374,0.0,0.0,0.015512847900390625,-100.35,188.05],ctrans,1,(12+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.0157958984375,42.25,172.95],ctrans,1,(12+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.0157958984375,99.85,203.65],ctrans,1,(12+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.0157958984375,130.65,178.7],ctrans,1,(12+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.0157958984375,43.75,141.5],ctrans,1,(12+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.0157958984375,257.55,160.8],ctrans,1,(12+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.0157958984375,187.9,204.75],ctrans,1,(12+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.0157958984375,22.2,168.6],ctrans,1,(12+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.07821044921875,0.0,0.0,0.01880645751953125,-242.65,190.45],ctrans,1,(12+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.07821044921875,0.0,0.0,0.01880645751953125,-44.3,189.7],ctrans,1,(12+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.0157958984375,106.9,155.05],ctrans,1,(12+time)%15,0,time);
			place("sprite181",rainy_canvas,ctx,[0.06090850830078125,0.0,0.0,0.06090850830078125,109.9,171.8],ctrans,1,(12+time)%25,0,time);
			place("sprite185",rainy_canvas,ctx,[0.03857421875,0.0,0.0,0.03857421875,-22.75,-154.85],ctrans,1,(0+time)%3,0,time);
			place("sprite189",rainy_canvas,ctx,[0.015029144287109376,0.04008407592773437,-0.04008407592773437,0.015029144287109376,-41.4,48.45],ctrans,1,(0+time)%3,9,time);
			break;
		case 13:
			place("shape165",rainy_canvas,ctx,[0.05,0.0,0.0,0.05,0.0,0.0],ctrans,1,0,0,time);
			place("shape166",rainy_canvas,ctx,[0.05,0.0,0.0,0.05,5.9,84.75],ctrans,1,0,0,time);
			var oldctx = ctx;
			var fcanvas = createCanvas(rainy_canvas.width,rainy_canvas.height);			var fctx = fcanvas.getContext("2d");
			enhanceContext(fctx);
			fctx.applyTransforms(ctx._matrix);
			ctx = fctx;
			place("sprite167",rainy_canvas,ctx,[0.05,0.0,0.0,0.05,5.9,90.95],ctrans.merge(new cxform(0,54,0,0,202,202,202,256)),1,(0+time)%1,0,time);
			ctx = oldctx;
			var ms=ctx._matrix;
			ctx.setTransform(1,0,0,1,0,0);
			ctx.drawImage(fcanvas,0,0);
			ctx.applyTransforms(ms);
			place("shape168",rainy_canvas,ctx,[0.05,0.0,0.0,0.05,0.0,0.0],ctrans,1,0,0,time);
			place("sprite170",rainy_canvas,ctx,[0.11227569580078126,0.0,0.0,0.0283233642578125,181.15,163.9],ctrans,1,(13+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06045379638671875,0.0,0.0,0.02113189697265625,-37.5,133.15],ctrans,1,(13+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.05580902099609375,0.0,0.0,0.014238739013671875,-32.85,156.75],ctrans,1,(13+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.04432830810546875,0.0,0.0,0.021036529541015626,-119.25,130.35],ctrans,1,(13+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.018972015380859374,68.05,182.6],ctrans,1,(13+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.016101837158203125,-189.5,183.25],ctrans,1,(13+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.09613037109375,0.0,0.0,0.03256301879882813,240.05,187.25],ctrans,1,(13+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.11227569580078126,0.0,0.0,0.02699737548828125,-165.3,162.45],ctrans,1,(13+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.11227569580078126,0.0,0.0,0.02699737548828125,-237.85,164.4],ctrans,1,(13+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.07821044921875,0.0,0.0,0.01880645751953125,-112.65,161.65],ctrans,1,(13+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.07821044921875,0.0,0.0,0.01880645751953125,215.1,140.4],ctrans,1,(13+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06451263427734374,0.0,0.0,0.015512847900390625,-100.35,188.05],ctrans,1,(13+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.0157958984375,42.25,172.95],ctrans,1,(13+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.0157958984375,99.85,203.65],ctrans,1,(13+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.0157958984375,130.65,178.7],ctrans,1,(13+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.0157958984375,43.75,141.5],ctrans,1,(13+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.0157958984375,257.55,160.8],ctrans,1,(13+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.0157958984375,187.9,204.75],ctrans,1,(13+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.0157958984375,22.2,168.6],ctrans,1,(13+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.07821044921875,0.0,0.0,0.01880645751953125,-242.65,190.45],ctrans,1,(13+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.07821044921875,0.0,0.0,0.01880645751953125,-44.3,189.7],ctrans,1,(13+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.0157958984375,106.9,155.05],ctrans,1,(13+time)%15,0,time);
			place("sprite181",rainy_canvas,ctx,[0.06090850830078125,0.0,0.0,0.06090850830078125,109.9,171.8],ctrans,1,(13+time)%25,0,time);
			place("sprite185",rainy_canvas,ctx,[0.03857421875,0.0,0.0,0.03857421875,-22.75,-154.85],ctrans,1,(1+time)%3,0,time);
			place("sprite189",rainy_canvas,ctx,[0.016246795654296875,0.03953857421875,-0.03953857421875,0.016246795654296875,-37.8,53.55],ctrans,1,(1+time)%3,9,time);
			break;
		case 14:
			place("shape165",rainy_canvas,ctx,[0.05,0.0,0.0,0.05,0.0,0.0],ctrans,1,0,0,time);
			place("shape166",rainy_canvas,ctx,[0.05,0.0,0.0,0.05,5.9,84.75],ctrans,1,0,0,time);
			var oldctx = ctx;
			var fcanvas = createCanvas(rainy_canvas.width,rainy_canvas.height);			var fctx = fcanvas.getContext("2d");
			enhanceContext(fctx);
			fctx.applyTransforms(ctx._matrix);
			ctx = fctx;
			place("sprite167",rainy_canvas,ctx,[0.05,0.0,0.0,0.05,5.9,90.95],ctrans.merge(new cxform(0,54,0,0,202,202,202,256)),1,(0+time)%1,0,time);
			ctx = oldctx;
			var ms=ctx._matrix;
			ctx.setTransform(1,0,0,1,0,0);
			ctx.drawImage(fcanvas,0,0);
			ctx.applyTransforms(ms);
			place("shape168",rainy_canvas,ctx,[0.05,0.0,0.0,0.05,0.0,0.0],ctrans,1,0,0,time);
			place("sprite170",rainy_canvas,ctx,[0.11227569580078126,0.0,0.0,0.0283233642578125,181.15,163.9],ctrans,1,(14+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06045379638671875,0.0,0.0,0.02113189697265625,-37.5,133.15],ctrans,1,(14+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.05580902099609375,0.0,0.0,0.014238739013671875,-32.85,156.75],ctrans,1,(14+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.04432830810546875,0.0,0.0,0.021036529541015626,-119.25,130.35],ctrans,1,(14+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.018972015380859374,68.05,182.6],ctrans,1,(14+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.016101837158203125,-189.5,183.25],ctrans,1,(14+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.09613037109375,0.0,0.0,0.03256301879882813,240.05,187.25],ctrans,1,(14+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.11227569580078126,0.0,0.0,0.02699737548828125,-165.3,162.45],ctrans,1,(14+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.11227569580078126,0.0,0.0,0.02699737548828125,-237.85,164.4],ctrans,1,(14+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.07821044921875,0.0,0.0,0.01880645751953125,-112.65,161.65],ctrans,1,(14+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.07821044921875,0.0,0.0,0.01880645751953125,215.1,140.4],ctrans,1,(14+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06451263427734374,0.0,0.0,0.015512847900390625,-100.35,188.05],ctrans,1,(14+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.0157958984375,42.25,172.95],ctrans,1,(14+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.0157958984375,99.85,203.65],ctrans,1,(14+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.0157958984375,130.65,178.7],ctrans,1,(14+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.0157958984375,43.75,141.5],ctrans,1,(14+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.0157958984375,257.55,160.8],ctrans,1,(14+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.0157958984375,187.9,204.75],ctrans,1,(14+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.0157958984375,22.2,168.6],ctrans,1,(14+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.07821044921875,0.0,0.0,0.01880645751953125,-242.65,190.45],ctrans,1,(14+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.07821044921875,0.0,0.0,0.01880645751953125,-44.3,189.7],ctrans,1,(14+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.0157958984375,106.9,155.05],ctrans,1,(14+time)%15,0,time);
			place("sprite181",rainy_canvas,ctx,[0.06090850830078125,0.0,0.0,0.06090850830078125,109.9,171.8],ctrans,1,(14+time)%25,0,time);
			place("sprite185",rainy_canvas,ctx,[0.03857421875,0.0,0.0,0.03857421875,-22.75,-154.85],ctrans,1,(2+time)%3,0,time);
			place("sprite189",rainy_canvas,ctx,[0.017572021484375,0.038898468017578125,-0.038898468017578125,0.017572021484375,-34.15,58.6],ctrans,1,(2+time)%3,9,time);
			break;
		case 15:
			place("shape165",rainy_canvas,ctx,[0.05,0.0,0.0,0.05,0.0,0.0],ctrans,1,0,0,time);
			place("shape166",rainy_canvas,ctx,[0.05,0.0,0.0,0.05,5.9,84.75],ctrans,1,0,0,time);
			var oldctx = ctx;
			var fcanvas = createCanvas(rainy_canvas.width,rainy_canvas.height);			var fctx = fcanvas.getContext("2d");
			enhanceContext(fctx);
			fctx.applyTransforms(ctx._matrix);
			ctx = fctx;
			place("sprite167",rainy_canvas,ctx,[0.05,0.0,0.0,0.05,5.9,90.95],ctrans.merge(new cxform(0,54,0,0,202,202,202,256)),1,(0+time)%1,0,time);
			ctx = oldctx;
			var ms=ctx._matrix;
			ctx.setTransform(1,0,0,1,0,0);
			ctx.drawImage(fcanvas,0,0);
			ctx.applyTransforms(ms);
			place("shape168",rainy_canvas,ctx,[0.05,0.0,0.0,0.05,0.0,0.0],ctrans,1,0,0,time);
			place("sprite170",rainy_canvas,ctx,[0.11227569580078126,0.0,0.0,0.0283233642578125,181.15,163.9],ctrans,1,(0+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06045379638671875,0.0,0.0,0.02113189697265625,-37.5,133.15],ctrans,1,(0+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.05580902099609375,0.0,0.0,0.014238739013671875,-32.85,156.75],ctrans,1,(0+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.04432830810546875,0.0,0.0,0.021036529541015626,-119.25,130.35],ctrans,1,(0+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.018972015380859374,68.05,182.6],ctrans,1,(0+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.016101837158203125,-189.5,183.25],ctrans,1,(0+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.09613037109375,0.0,0.0,0.03256301879882813,240.05,187.25],ctrans,1,(0+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.11227569580078126,0.0,0.0,0.02699737548828125,-165.3,162.45],ctrans,1,(0+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.11227569580078126,0.0,0.0,0.02699737548828125,-237.85,164.4],ctrans,1,(0+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.07821044921875,0.0,0.0,0.01880645751953125,-112.65,161.65],ctrans,1,(0+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.07821044921875,0.0,0.0,0.01880645751953125,215.1,140.4],ctrans,1,(0+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06451263427734374,0.0,0.0,0.015512847900390625,-100.35,188.05],ctrans,1,(0+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.0157958984375,42.25,172.95],ctrans,1,(0+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.0157958984375,99.85,203.65],ctrans,1,(0+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.0157958984375,130.65,178.7],ctrans,1,(0+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.0157958984375,43.75,141.5],ctrans,1,(0+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.0157958984375,257.55,160.8],ctrans,1,(0+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.0157958984375,187.9,204.75],ctrans,1,(0+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.0157958984375,22.2,168.6],ctrans,1,(0+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.07821044921875,0.0,0.0,0.01880645751953125,-242.65,190.45],ctrans,1,(0+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.07821044921875,0.0,0.0,0.01880645751953125,-44.3,189.7],ctrans,1,(0+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.0157958984375,106.9,155.05],ctrans,1,(0+time)%15,0,time);
			place("sprite181",rainy_canvas,ctx,[0.06090850830078125,0.0,0.0,0.06090850830078125,109.9,171.8],ctrans,1,(15+time)%25,0,time);
			place("sprite185",rainy_canvas,ctx,[0.03857421875,0.0,0.0,0.03857421875,-22.75,-154.85],ctrans,1,(0+time)%3,0,time);
			place("sprite189",rainy_canvas,ctx,[0.018746185302734374,0.03827667236328125,-0.03827667236328125,0.018746185302734374,-30.65,63.7],ctrans,1,(0+time)%3,9,time);
			break;
		case 16:
			place("shape165",rainy_canvas,ctx,[0.05,0.0,0.0,0.05,0.0,0.0],ctrans,1,0,0,time);
			place("shape166",rainy_canvas,ctx,[0.05,0.0,0.0,0.05,5.9,84.75],ctrans,1,0,0,time);
			var oldctx = ctx;
			var fcanvas = createCanvas(rainy_canvas.width,rainy_canvas.height);			var fctx = fcanvas.getContext("2d");
			enhanceContext(fctx);
			fctx.applyTransforms(ctx._matrix);
			ctx = fctx;
			place("sprite167",rainy_canvas,ctx,[0.05,0.0,0.0,0.05,5.9,90.95],ctrans.merge(new cxform(0,54,0,0,202,202,202,256)),1,(0+time)%1,0,time);
			ctx = oldctx;
			var ms=ctx._matrix;
			ctx.setTransform(1,0,0,1,0,0);
			ctx.drawImage(fcanvas,0,0);
			ctx.applyTransforms(ms);
			place("shape168",rainy_canvas,ctx,[0.05,0.0,0.0,0.05,0.0,0.0],ctrans,1,0,0,time);
			place("sprite170",rainy_canvas,ctx,[0.11227569580078126,0.0,0.0,0.0283233642578125,181.15,163.9],ctrans,1,(1+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06045379638671875,0.0,0.0,0.02113189697265625,-37.5,133.15],ctrans,1,(1+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.05580902099609375,0.0,0.0,0.014238739013671875,-32.85,156.75],ctrans,1,(1+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.04432830810546875,0.0,0.0,0.021036529541015626,-119.25,130.35],ctrans,1,(1+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.018972015380859374,68.05,182.6],ctrans,1,(1+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.016101837158203125,-189.5,183.25],ctrans,1,(1+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.09613037109375,0.0,0.0,0.03256301879882813,240.05,187.25],ctrans,1,(1+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.11227569580078126,0.0,0.0,0.02699737548828125,-165.3,162.45],ctrans,1,(1+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.11227569580078126,0.0,0.0,0.02699737548828125,-237.85,164.4],ctrans,1,(1+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.07821044921875,0.0,0.0,0.01880645751953125,-112.65,161.65],ctrans,1,(1+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.07821044921875,0.0,0.0,0.01880645751953125,215.1,140.4],ctrans,1,(1+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06451263427734374,0.0,0.0,0.015512847900390625,-100.35,188.05],ctrans,1,(1+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.0157958984375,42.25,172.95],ctrans,1,(1+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.0157958984375,99.85,203.65],ctrans,1,(1+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.0157958984375,130.65,178.7],ctrans,1,(1+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.0157958984375,43.75,141.5],ctrans,1,(1+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.0157958984375,257.55,160.8],ctrans,1,(1+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.0157958984375,187.9,204.75],ctrans,1,(1+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.0157958984375,22.2,168.6],ctrans,1,(1+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.07821044921875,0.0,0.0,0.01880645751953125,-242.65,190.45],ctrans,1,(1+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.07821044921875,0.0,0.0,0.01880645751953125,-44.3,189.7],ctrans,1,(1+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.0157958984375,106.9,155.05],ctrans,1,(1+time)%15,0,time);
			place("sprite181",rainy_canvas,ctx,[0.06090850830078125,0.0,0.0,0.06090850830078125,109.9,171.8],ctrans,1,(16+time)%25,0,time);
			place("sprite185",rainy_canvas,ctx,[0.03857421875,0.0,0.0,0.03857421875,-22.75,-154.85],ctrans,1,(1+time)%3,0,time);
			place("sprite189",rainy_canvas,ctx,[0.020024871826171874,0.03755340576171875,-0.03755340576171875,0.020024871826171874,-27.0,68.8],ctrans,1,(1+time)%3,9,time);
			break;
		case 17:
			place("shape165",rainy_canvas,ctx,[0.05,0.0,0.0,0.05,0.0,0.0],ctrans,1,0,0,time);
			place("shape166",rainy_canvas,ctx,[0.05,0.0,0.0,0.05,5.9,84.75],ctrans,1,0,0,time);
			var oldctx = ctx;
			var fcanvas = createCanvas(rainy_canvas.width,rainy_canvas.height);			var fctx = fcanvas.getContext("2d");
			enhanceContext(fctx);
			fctx.applyTransforms(ctx._matrix);
			ctx = fctx;
			place("sprite167",rainy_canvas,ctx,[0.05,0.0,0.0,0.05,5.9,90.95],ctrans.merge(new cxform(0,54,0,0,202,202,202,256)),1,(0+time)%1,0,time);
			ctx = oldctx;
			var ms=ctx._matrix;
			ctx.setTransform(1,0,0,1,0,0);
			ctx.drawImage(fcanvas,0,0);
			ctx.applyTransforms(ms);
			place("shape168",rainy_canvas,ctx,[0.05,0.0,0.0,0.05,0.0,0.0],ctrans,1,0,0,time);
			place("sprite170",rainy_canvas,ctx,[0.11227569580078126,0.0,0.0,0.0283233642578125,181.15,163.9],ctrans,1,(2+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06045379638671875,0.0,0.0,0.02113189697265625,-37.5,133.15],ctrans,1,(2+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.05580902099609375,0.0,0.0,0.014238739013671875,-32.85,156.75],ctrans,1,(2+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.04432830810546875,0.0,0.0,0.021036529541015626,-119.25,130.35],ctrans,1,(2+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.018972015380859374,68.05,182.6],ctrans,1,(2+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.016101837158203125,-189.5,183.25],ctrans,1,(2+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.09613037109375,0.0,0.0,0.03256301879882813,240.05,187.25],ctrans,1,(2+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.11227569580078126,0.0,0.0,0.02699737548828125,-165.3,162.45],ctrans,1,(2+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.11227569580078126,0.0,0.0,0.02699737548828125,-237.85,164.4],ctrans,1,(2+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.07821044921875,0.0,0.0,0.01880645751953125,-112.65,161.65],ctrans,1,(2+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.07821044921875,0.0,0.0,0.01880645751953125,215.1,140.4],ctrans,1,(2+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06451263427734374,0.0,0.0,0.015512847900390625,-100.35,188.05],ctrans,1,(2+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.0157958984375,42.25,172.95],ctrans,1,(2+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.0157958984375,99.85,203.65],ctrans,1,(2+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.0157958984375,130.65,178.7],ctrans,1,(2+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.0157958984375,43.75,141.5],ctrans,1,(2+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.0157958984375,257.55,160.8],ctrans,1,(2+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.0157958984375,187.9,204.75],ctrans,1,(2+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.0157958984375,22.2,168.6],ctrans,1,(2+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.07821044921875,0.0,0.0,0.01880645751953125,-242.65,190.45],ctrans,1,(2+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.07821044921875,0.0,0.0,0.01880645751953125,-44.3,189.7],ctrans,1,(2+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.0157958984375,106.9,155.05],ctrans,1,(2+time)%15,0,time);
			place("sprite181",rainy_canvas,ctx,[0.06090850830078125,0.0,0.0,0.06090850830078125,109.9,171.8],ctrans,1,(17+time)%25,0,time);
			place("sprite185",rainy_canvas,ctx,[0.03857421875,0.0,0.0,0.03857421875,-22.75,-154.85],ctrans,1,(2+time)%3,0,time);
			place("sprite189",rainy_canvas,ctx,[0.021154022216796874,0.03685760498046875,-0.03685760498046875,0.021154022216796874,-23.45,73.85],ctrans,1,(2+time)%3,9,time);
			break;
		case 18:
			place("shape165",rainy_canvas,ctx,[0.05,0.0,0.0,0.05,0.0,0.0],ctrans,1,0,0,time);
			place("shape166",rainy_canvas,ctx,[0.05,0.0,0.0,0.05,5.9,84.75],ctrans,1,0,0,time);
			var oldctx = ctx;
			var fcanvas = createCanvas(rainy_canvas.width,rainy_canvas.height);			var fctx = fcanvas.getContext("2d");
			enhanceContext(fctx);
			fctx.applyTransforms(ctx._matrix);
			ctx = fctx;
			place("sprite167",rainy_canvas,ctx,[0.05,0.0,0.0,0.05,5.9,90.95],ctrans.merge(new cxform(0,54,0,0,202,202,202,256)),1,(0+time)%1,0,time);
			ctx = oldctx;
			var ms=ctx._matrix;
			ctx.setTransform(1,0,0,1,0,0);
			ctx.drawImage(fcanvas,0,0);
			ctx.applyTransforms(ms);
			place("shape168",rainy_canvas,ctx,[0.05,0.0,0.0,0.05,0.0,0.0],ctrans,1,0,0,time);
			place("sprite170",rainy_canvas,ctx,[0.11227569580078126,0.0,0.0,0.0283233642578125,181.15,163.9],ctrans,1,(3+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06045379638671875,0.0,0.0,0.02113189697265625,-37.5,133.15],ctrans,1,(3+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.05580902099609375,0.0,0.0,0.014238739013671875,-32.85,156.75],ctrans,1,(3+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.04432830810546875,0.0,0.0,0.021036529541015626,-119.25,130.35],ctrans,1,(3+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.018972015380859374,68.05,182.6],ctrans,1,(3+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.016101837158203125,-189.5,183.25],ctrans,1,(3+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.09613037109375,0.0,0.0,0.03256301879882813,240.05,187.25],ctrans,1,(3+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.11227569580078126,0.0,0.0,0.02699737548828125,-165.3,162.45],ctrans,1,(3+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.11227569580078126,0.0,0.0,0.02699737548828125,-237.85,164.4],ctrans,1,(3+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.07821044921875,0.0,0.0,0.01880645751953125,-112.65,161.65],ctrans,1,(3+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.07821044921875,0.0,0.0,0.01880645751953125,215.1,140.4],ctrans,1,(3+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06451263427734374,0.0,0.0,0.015512847900390625,-100.35,188.05],ctrans,1,(3+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.0157958984375,42.25,172.95],ctrans,1,(3+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.0157958984375,99.85,203.65],ctrans,1,(3+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.0157958984375,130.65,178.7],ctrans,1,(3+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.0157958984375,43.75,141.5],ctrans,1,(3+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.0157958984375,257.55,160.8],ctrans,1,(3+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.0157958984375,187.9,204.75],ctrans,1,(3+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.0157958984375,22.2,168.6],ctrans,1,(3+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.07821044921875,0.0,0.0,0.01880645751953125,-242.65,190.45],ctrans,1,(3+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.07821044921875,0.0,0.0,0.01880645751953125,-44.3,189.7],ctrans,1,(3+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.0157958984375,106.9,155.05],ctrans,1,(3+time)%15,0,time);
			place("sprite181",rainy_canvas,ctx,[0.06090850830078125,0.0,0.0,0.06090850830078125,109.9,171.8],ctrans,1,(18+time)%25,0,time);
			place("sprite185",rainy_canvas,ctx,[0.03857421875,0.0,0.0,0.03857421875,-22.75,-154.85],ctrans,1,(0+time)%3,0,time);
			place("sprite189",rainy_canvas,ctx,[0.022379302978515626,0.036054229736328124,-0.036054229736328124,0.022379302978515626,-19.8,79.0],ctrans,1,(0+time)%3,9,time);
			break;
		case 19:
			place("shape165",rainy_canvas,ctx,[0.05,0.0,0.0,0.05,0.0,0.0],ctrans,1,0,0,time);
			place("shape166",rainy_canvas,ctx,[0.05,0.0,0.0,0.05,5.9,84.75],ctrans,1,0,0,time);
			var oldctx = ctx;
			var fcanvas = createCanvas(rainy_canvas.width,rainy_canvas.height);			var fctx = fcanvas.getContext("2d");
			enhanceContext(fctx);
			fctx.applyTransforms(ctx._matrix);
			ctx = fctx;
			place("sprite167",rainy_canvas,ctx,[0.05,0.0,0.0,0.05,5.9,90.95],ctrans.merge(new cxform(0,54,0,0,202,202,202,256)),1,(0+time)%1,0,time);
			ctx = oldctx;
			var ms=ctx._matrix;
			ctx.setTransform(1,0,0,1,0,0);
			ctx.drawImage(fcanvas,0,0);
			ctx.applyTransforms(ms);
			place("shape168",rainy_canvas,ctx,[0.05,0.0,0.0,0.05,0.0,0.0],ctrans,1,0,0,time);
			place("sprite170",rainy_canvas,ctx,[0.11227569580078126,0.0,0.0,0.0283233642578125,181.15,163.9],ctrans,1,(4+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06045379638671875,0.0,0.0,0.02113189697265625,-37.5,133.15],ctrans,1,(4+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.05580902099609375,0.0,0.0,0.014238739013671875,-32.85,156.75],ctrans,1,(4+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.04432830810546875,0.0,0.0,0.021036529541015626,-119.25,130.35],ctrans,1,(4+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.018972015380859374,68.05,182.6],ctrans,1,(4+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.016101837158203125,-189.5,183.25],ctrans,1,(4+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.09613037109375,0.0,0.0,0.03256301879882813,240.05,187.25],ctrans,1,(4+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.11227569580078126,0.0,0.0,0.02699737548828125,-165.3,162.45],ctrans,1,(4+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.11227569580078126,0.0,0.0,0.02699737548828125,-237.85,164.4],ctrans,1,(4+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.07821044921875,0.0,0.0,0.01880645751953125,-112.65,161.65],ctrans,1,(4+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.07821044921875,0.0,0.0,0.01880645751953125,215.1,140.4],ctrans,1,(4+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06451263427734374,0.0,0.0,0.015512847900390625,-100.35,188.05],ctrans,1,(4+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.0157958984375,42.25,172.95],ctrans,1,(4+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.0157958984375,99.85,203.65],ctrans,1,(4+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.0157958984375,130.65,178.7],ctrans,1,(4+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.0157958984375,43.75,141.5],ctrans,1,(4+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.0157958984375,257.55,160.8],ctrans,1,(4+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.0157958984375,187.9,204.75],ctrans,1,(4+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.0157958984375,22.2,168.6],ctrans,1,(4+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.07821044921875,0.0,0.0,0.01880645751953125,-242.65,190.45],ctrans,1,(4+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.07821044921875,0.0,0.0,0.01880645751953125,-44.3,189.7],ctrans,1,(4+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.0157958984375,106.9,155.05],ctrans,1,(4+time)%15,0,time);
			place("sprite181",rainy_canvas,ctx,[0.06090850830078125,0.0,0.0,0.06090850830078125,109.9,171.8],ctrans,1,(19+time)%25,0,time);
			place("sprite185",rainy_canvas,ctx,[0.03857421875,0.0,0.0,0.03857421875,-22.75,-154.85],ctrans,1,(1+time)%3,0,time);
			place("sprite189",rainy_canvas,ctx,[0.023458099365234374,0.035289764404296875,-0.035289764404296875,0.023458099365234374,-16.25,84.05],ctrans,1,(1+time)%3,9,time);
			break;
		case 20:
			place("shape165",rainy_canvas,ctx,[0.05,0.0,0.0,0.05,0.0,0.0],ctrans,1,0,0,time);
			place("shape166",rainy_canvas,ctx,[0.05,0.0,0.0,0.05,5.9,84.75],ctrans,1,0,0,time);
			var oldctx = ctx;
			var fcanvas = createCanvas(rainy_canvas.width,rainy_canvas.height);			var fctx = fcanvas.getContext("2d");
			enhanceContext(fctx);
			fctx.applyTransforms(ctx._matrix);
			ctx = fctx;
			place("sprite167",rainy_canvas,ctx,[0.05,0.0,0.0,0.05,5.9,90.95],ctrans.merge(new cxform(0,54,0,0,202,202,202,256)),1,(0+time)%1,0,time);
			ctx = oldctx;
			var ms=ctx._matrix;
			ctx.setTransform(1,0,0,1,0,0);
			ctx.drawImage(fcanvas,0,0);
			ctx.applyTransforms(ms);
			place("shape168",rainy_canvas,ctx,[0.05,0.0,0.0,0.05,0.0,0.0],ctrans,1,0,0,time);
			place("sprite170",rainy_canvas,ctx,[0.11227569580078126,0.0,0.0,0.0283233642578125,181.15,163.9],ctrans,1,(5+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06045379638671875,0.0,0.0,0.02113189697265625,-37.5,133.15],ctrans,1,(5+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.05580902099609375,0.0,0.0,0.014238739013671875,-32.85,156.75],ctrans,1,(5+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.04432830810546875,0.0,0.0,0.021036529541015626,-119.25,130.35],ctrans,1,(5+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.018972015380859374,68.05,182.6],ctrans,1,(5+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.016101837158203125,-189.5,183.25],ctrans,1,(5+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.09613037109375,0.0,0.0,0.03256301879882813,240.05,187.25],ctrans,1,(5+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.11227569580078126,0.0,0.0,0.02699737548828125,-165.3,162.45],ctrans,1,(5+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.11227569580078126,0.0,0.0,0.02699737548828125,-237.85,164.4],ctrans,1,(5+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.07821044921875,0.0,0.0,0.01880645751953125,-112.65,161.65],ctrans,1,(5+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.07821044921875,0.0,0.0,0.01880645751953125,215.1,140.4],ctrans,1,(5+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06451263427734374,0.0,0.0,0.015512847900390625,-100.35,188.05],ctrans,1,(5+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.0157958984375,42.25,172.95],ctrans,1,(5+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.0157958984375,99.85,203.65],ctrans,1,(5+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.0157958984375,130.65,178.7],ctrans,1,(5+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.0157958984375,43.75,141.5],ctrans,1,(5+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.0157958984375,257.55,160.8],ctrans,1,(5+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.0157958984375,187.9,204.75],ctrans,1,(5+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.0157958984375,22.2,168.6],ctrans,1,(5+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.07821044921875,0.0,0.0,0.01880645751953125,-242.65,190.45],ctrans,1,(5+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.07821044921875,0.0,0.0,0.01880645751953125,-44.3,189.7],ctrans,1,(5+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.0157958984375,106.9,155.05],ctrans,1,(5+time)%15,0,time);
			place("sprite181",rainy_canvas,ctx,[0.06090850830078125,0.0,0.0,0.06090850830078125,109.9,171.8],ctrans,1,(20+time)%25,0,time);
			place("sprite185",rainy_canvas,ctx,[0.03857421875,0.0,0.0,0.03857421875,-22.75,-154.85],ctrans,1,(2+time)%3,0,time);
			place("sprite189",rainy_canvas,ctx,[0.0246246337890625,0.03440933227539063,-0.03440933227539063,0.0246246337890625,-12.65,89.1],ctrans,1,(2+time)%3,9,time);
			break;
		case 21:
			place("shape165",rainy_canvas,ctx,[0.05,0.0,0.0,0.05,0.0,0.0],ctrans,1,0,0,time);
			place("shape166",rainy_canvas,ctx,[0.05,0.0,0.0,0.05,5.9,84.75],ctrans,1,0,0,time);
			var oldctx = ctx;
			var fcanvas = createCanvas(rainy_canvas.width,rainy_canvas.height);			var fctx = fcanvas.getContext("2d");
			enhanceContext(fctx);
			fctx.applyTransforms(ctx._matrix);
			ctx = fctx;
			place("sprite167",rainy_canvas,ctx,[0.05,0.0,0.0,0.05,5.9,90.95],ctrans.merge(new cxform(0,54,0,0,202,202,202,256)),1,(0+time)%1,0,time);
			ctx = oldctx;
			var ms=ctx._matrix;
			ctx.setTransform(1,0,0,1,0,0);
			ctx.drawImage(fcanvas,0,0);
			ctx.applyTransforms(ms);
			place("shape168",rainy_canvas,ctx,[0.05,0.0,0.0,0.05,0.0,0.0],ctrans,1,0,0,time);
			place("sprite170",rainy_canvas,ctx,[0.11227569580078126,0.0,0.0,0.0283233642578125,181.15,163.9],ctrans,1,(6+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06045379638671875,0.0,0.0,0.02113189697265625,-37.5,133.15],ctrans,1,(6+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.05580902099609375,0.0,0.0,0.014238739013671875,-32.85,156.75],ctrans,1,(6+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.04432830810546875,0.0,0.0,0.021036529541015626,-119.25,130.35],ctrans,1,(6+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.018972015380859374,68.05,182.6],ctrans,1,(6+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.016101837158203125,-189.5,183.25],ctrans,1,(6+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.09613037109375,0.0,0.0,0.03256301879882813,240.05,187.25],ctrans,1,(6+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.11227569580078126,0.0,0.0,0.02699737548828125,-165.3,162.45],ctrans,1,(6+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.11227569580078126,0.0,0.0,0.02699737548828125,-237.85,164.4],ctrans,1,(6+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.07821044921875,0.0,0.0,0.01880645751953125,-112.65,161.65],ctrans,1,(6+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.07821044921875,0.0,0.0,0.01880645751953125,215.1,140.4],ctrans,1,(6+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06451263427734374,0.0,0.0,0.015512847900390625,-100.35,188.05],ctrans,1,(6+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.0157958984375,42.25,172.95],ctrans,1,(6+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.0157958984375,99.85,203.65],ctrans,1,(6+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.0157958984375,130.65,178.7],ctrans,1,(6+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.0157958984375,43.75,141.5],ctrans,1,(6+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.0157958984375,257.55,160.8],ctrans,1,(6+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.0157958984375,187.9,204.75],ctrans,1,(6+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.0157958984375,22.2,168.6],ctrans,1,(6+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.07821044921875,0.0,0.0,0.01880645751953125,-242.65,190.45],ctrans,1,(6+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.07821044921875,0.0,0.0,0.01880645751953125,-44.3,189.7],ctrans,1,(6+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.0157958984375,106.9,155.05],ctrans,1,(6+time)%15,0,time);
			place("sprite181",rainy_canvas,ctx,[0.06090850830078125,0.0,0.0,0.06090850830078125,109.9,171.8],ctrans,1,(21+time)%25,0,time);
			place("sprite185",rainy_canvas,ctx,[0.03857421875,0.0,0.0,0.03857421875,-22.75,-154.85],ctrans,1,(0+time)%3,0,time);
			place("sprite189",rainy_canvas,ctx,[0.02564849853515625,0.03357772827148438,-0.03357772827148438,0.02564849853515625,-9.1,94.2],ctrans,1,(0+time)%3,9,time);
			break;
		case 22:
			place("shape165",rainy_canvas,ctx,[0.05,0.0,0.0,0.05,0.0,0.0],ctrans,1,0,0,time);
			place("shape166",rainy_canvas,ctx,[0.05,0.0,0.0,0.05,5.9,84.75],ctrans,1,0,0,time);
			var oldctx = ctx;
			var fcanvas = createCanvas(rainy_canvas.width,rainy_canvas.height);			var fctx = fcanvas.getContext("2d");
			enhanceContext(fctx);
			fctx.applyTransforms(ctx._matrix);
			ctx = fctx;
			place("sprite167",rainy_canvas,ctx,[0.05,0.0,0.0,0.05,5.9,90.95],ctrans.merge(new cxform(0,54,0,0,202,202,202,256)),1,(0+time)%1,0,time);
			ctx = oldctx;
			var ms=ctx._matrix;
			ctx.setTransform(1,0,0,1,0,0);
			ctx.drawImage(fcanvas,0,0);
			ctx.applyTransforms(ms);
			place("shape168",rainy_canvas,ctx,[0.05,0.0,0.0,0.05,0.0,0.0],ctrans,1,0,0,time);
			place("sprite170",rainy_canvas,ctx,[0.11227569580078126,0.0,0.0,0.0283233642578125,181.15,163.9],ctrans,1,(7+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06045379638671875,0.0,0.0,0.02113189697265625,-37.5,133.15],ctrans,1,(7+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.05580902099609375,0.0,0.0,0.014238739013671875,-32.85,156.75],ctrans,1,(7+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.04432830810546875,0.0,0.0,0.021036529541015626,-119.25,130.35],ctrans,1,(7+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.018972015380859374,68.05,182.6],ctrans,1,(7+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.016101837158203125,-189.5,183.25],ctrans,1,(7+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.09613037109375,0.0,0.0,0.03256301879882813,240.05,187.25],ctrans,1,(7+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.11227569580078126,0.0,0.0,0.02699737548828125,-165.3,162.45],ctrans,1,(7+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.11227569580078126,0.0,0.0,0.02699737548828125,-237.85,164.4],ctrans,1,(7+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.07821044921875,0.0,0.0,0.01880645751953125,-112.65,161.65],ctrans,1,(7+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.07821044921875,0.0,0.0,0.01880645751953125,215.1,140.4],ctrans,1,(7+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06451263427734374,0.0,0.0,0.015512847900390625,-100.35,188.05],ctrans,1,(7+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.0157958984375,42.25,172.95],ctrans,1,(7+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.0157958984375,99.85,203.65],ctrans,1,(7+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.0157958984375,130.65,178.7],ctrans,1,(7+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.0157958984375,43.75,141.5],ctrans,1,(7+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.0157958984375,257.55,160.8],ctrans,1,(7+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.0157958984375,187.9,204.75],ctrans,1,(7+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.0157958984375,22.2,168.6],ctrans,1,(7+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.07821044921875,0.0,0.0,0.01880645751953125,-242.65,190.45],ctrans,1,(7+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.07821044921875,0.0,0.0,0.01880645751953125,-44.3,189.7],ctrans,1,(7+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.0157958984375,106.9,155.05],ctrans,1,(7+time)%15,0,time);
			place("sprite181",rainy_canvas,ctx,[0.06090850830078125,0.0,0.0,0.06090850830078125,109.9,171.8],ctrans,1,(22+time)%25,0,time);
			place("sprite185",rainy_canvas,ctx,[0.03857421875,0.0,0.0,0.03857421875,-22.75,-154.85],ctrans,1,(1+time)%3,0,time);
			place("sprite189",rainy_canvas,ctx,[0.026750946044921876,0.032627105712890625,-0.032627105712890625,0.026750946044921876,-5.45,99.2],ctrans,1,(1+time)%3,9,time);
			break;
		case 23:
			place("shape165",rainy_canvas,ctx,[0.05,0.0,0.0,0.05,0.0,0.0],ctrans,1,0,0,time);
			place("shape166",rainy_canvas,ctx,[0.05,0.0,0.0,0.05,5.9,84.75],ctrans,1,0,0,time);
			var oldctx = ctx;
			var fcanvas = createCanvas(rainy_canvas.width,rainy_canvas.height);			var fctx = fcanvas.getContext("2d");
			enhanceContext(fctx);
			fctx.applyTransforms(ctx._matrix);
			ctx = fctx;
			place("sprite167",rainy_canvas,ctx,[0.05,0.0,0.0,0.05,5.9,90.95],ctrans.merge(new cxform(0,54,0,0,202,202,202,256)),1,(0+time)%1,0,time);
			ctx = oldctx;
			var ms=ctx._matrix;
			ctx.setTransform(1,0,0,1,0,0);
			ctx.drawImage(fcanvas,0,0);
			ctx.applyTransforms(ms);
			place("shape168",rainy_canvas,ctx,[0.05,0.0,0.0,0.05,0.0,0.0],ctrans,1,0,0,time);
			place("sprite170",rainy_canvas,ctx,[0.11227569580078126,0.0,0.0,0.0283233642578125,181.15,163.9],ctrans,1,(8+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06045379638671875,0.0,0.0,0.02113189697265625,-37.5,133.15],ctrans,1,(8+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.05580902099609375,0.0,0.0,0.014238739013671875,-32.85,156.75],ctrans,1,(8+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.04432830810546875,0.0,0.0,0.021036529541015626,-119.25,130.35],ctrans,1,(8+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.018972015380859374,68.05,182.6],ctrans,1,(8+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.016101837158203125,-189.5,183.25],ctrans,1,(8+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.09613037109375,0.0,0.0,0.03256301879882813,240.05,187.25],ctrans,1,(8+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.11227569580078126,0.0,0.0,0.02699737548828125,-165.3,162.45],ctrans,1,(8+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.11227569580078126,0.0,0.0,0.02699737548828125,-237.85,164.4],ctrans,1,(8+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.07821044921875,0.0,0.0,0.01880645751953125,-112.65,161.65],ctrans,1,(8+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.07821044921875,0.0,0.0,0.01880645751953125,215.1,140.4],ctrans,1,(8+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06451263427734374,0.0,0.0,0.015512847900390625,-100.35,188.05],ctrans,1,(8+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.0157958984375,42.25,172.95],ctrans,1,(8+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.0157958984375,99.85,203.65],ctrans,1,(8+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.0157958984375,130.65,178.7],ctrans,1,(8+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.0157958984375,43.75,141.5],ctrans,1,(8+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.0157958984375,257.55,160.8],ctrans,1,(8+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.0157958984375,187.9,204.75],ctrans,1,(8+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.0157958984375,22.2,168.6],ctrans,1,(8+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.07821044921875,0.0,0.0,0.01880645751953125,-242.65,190.45],ctrans,1,(8+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.07821044921875,0.0,0.0,0.01880645751953125,-44.3,189.7],ctrans,1,(8+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.0157958984375,106.9,155.05],ctrans,1,(8+time)%15,0,time);
			place("sprite181",rainy_canvas,ctx,[0.06090850830078125,0.0,0.0,0.06090850830078125,109.9,171.8],ctrans,1,(23+time)%25,0,time);
			place("sprite185",rainy_canvas,ctx,[0.03857421875,0.0,0.0,0.03857421875,-22.75,-154.85],ctrans,1,(2+time)%3,0,time);
			place("sprite189",rainy_canvas,ctx,[0.027716064453125,0.031732177734375,-0.031732177734375,0.027716064453125,-1.95,104.35],ctrans,1,(2+time)%3,9,time);
			break;
		case 24:
			place("shape165",rainy_canvas,ctx,[0.05,0.0,0.0,0.05,0.0,0.0],ctrans,1,0,0,time);
			place("shape166",rainy_canvas,ctx,[0.05,0.0,0.0,0.05,5.9,84.75],ctrans,1,0,0,time);
			var oldctx = ctx;
			var fcanvas = createCanvas(rainy_canvas.width,rainy_canvas.height);			var fctx = fcanvas.getContext("2d");
			enhanceContext(fctx);
			fctx.applyTransforms(ctx._matrix);
			ctx = fctx;
			place("sprite167",rainy_canvas,ctx,[0.05,0.0,0.0,0.05,5.9,90.95],ctrans.merge(new cxform(0,54,0,0,202,202,202,256)),1,(0+time)%1,0,time);
			ctx = oldctx;
			var ms=ctx._matrix;
			ctx.setTransform(1,0,0,1,0,0);
			ctx.drawImage(fcanvas,0,0);
			ctx.applyTransforms(ms);
			place("shape168",rainy_canvas,ctx,[0.05,0.0,0.0,0.05,0.0,0.0],ctrans,1,0,0,time);
			place("sprite170",rainy_canvas,ctx,[0.11227569580078126,0.0,0.0,0.0283233642578125,181.15,163.9],ctrans,1,(9+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06045379638671875,0.0,0.0,0.02113189697265625,-37.5,133.15],ctrans,1,(9+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.05580902099609375,0.0,0.0,0.014238739013671875,-32.85,156.75],ctrans,1,(9+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.04432830810546875,0.0,0.0,0.021036529541015626,-119.25,130.35],ctrans,1,(9+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.018972015380859374,68.05,182.6],ctrans,1,(9+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.016101837158203125,-189.5,183.25],ctrans,1,(9+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.09613037109375,0.0,0.0,0.03256301879882813,240.05,187.25],ctrans,1,(9+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.11227569580078126,0.0,0.0,0.02699737548828125,-165.3,162.45],ctrans,1,(9+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.11227569580078126,0.0,0.0,0.02699737548828125,-237.85,164.4],ctrans,1,(9+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.07821044921875,0.0,0.0,0.01880645751953125,-112.65,161.65],ctrans,1,(9+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.07821044921875,0.0,0.0,0.01880645751953125,215.1,140.4],ctrans,1,(9+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06451263427734374,0.0,0.0,0.015512847900390625,-100.35,188.05],ctrans,1,(9+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.0157958984375,42.25,172.95],ctrans,1,(9+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.0157958984375,99.85,203.65],ctrans,1,(9+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.0157958984375,130.65,178.7],ctrans,1,(9+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.0157958984375,43.75,141.5],ctrans,1,(9+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.0157958984375,257.55,160.8],ctrans,1,(9+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.0157958984375,187.9,204.75],ctrans,1,(9+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.0157958984375,22.2,168.6],ctrans,1,(9+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.07821044921875,0.0,0.0,0.01880645751953125,-242.65,190.45],ctrans,1,(9+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.07821044921875,0.0,0.0,0.01880645751953125,-44.3,189.7],ctrans,1,(9+time)%15,0,time);
			place("sprite170",rainy_canvas,ctx,[0.06765899658203126,0.0,0.0,0.0157958984375,106.9,155.05],ctrans,1,(9+time)%15,0,time);
			place("sprite181",rainy_canvas,ctx,[0.06090850830078125,0.0,0.0,0.06090850830078125,109.9,171.8],ctrans,1,(24+time)%25,0,time);
			place("sprite185",rainy_canvas,ctx,[0.03857421875,0.0,0.0,0.03857421875,-22.75,-154.85],ctrans,1,(0+time)%3,0,time);
			place("sprite189",rainy_canvas,ctx,[0.0287872314453125,0.03077545166015625,-0.03077545166015625,0.0287872314453125,1.65,109.35],ctrans,1,(0+time)%3,9,time);
			break;
	}
	ctx.restore();
}

var frame = -1;
var time = 0;
var frames = [];
frames.push(0);
frames.push(1);
frames.push(2);
frames.push(3);
frames.push(4);
frames.push(5);
frames.push(6);
frames.push(7);
frames.push(8);
frames.push(9);
frames.push(10);
frames.push(11);
frames.push(12);
frames.push(13);
frames.push(14);
frames.push(15);
frames.push(16);
frames.push(17);
frames.push(18);
frames.push(19);
frames.push(20);
frames.push(21);
frames.push(22);
frames.push(23);
frames.push(24);

var backgroundColor = "#ffffff";
var originalWidth = 736;
var originalHeight= 567;
function nextFrame(ctx,ctrans){
	var oldframe = frame;
	frame = (frame+1)%frames.length;
	if(frame==oldframe){time++;}else{time=0;};
	drawFrame();
}

function drawFrame(){
	ctx.fillStyle = backgroundColor;
	ctx.fillRect(0,0,rainy_canvas.width,rainy_canvas.height);
	ctx.save();
	ctx.transform(rainy_canvas.width/originalWidth,0,0,rainy_canvas.height/originalHeight,0,0);
	sprite190(ctx,ctrans,frames[frame],0,time);
	ctx.restore();
}

let frame_ctrl = null;
nextFrame(ctx, ctrans);

return {
    start: function(){
        frame_ctrl = window.setInterval(function(){nextFrame(ctx,ctrans);},33);
		rainy_canvas.classList.add("show");
    },
    stop: function(){
        clearInterval(frame_ctrl);
		rainy_canvas.classList.remove("show");
    },
	show: function(){
		rainy_canvas.classList.add("show");
	}
}

})();