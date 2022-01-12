let middle_controller = (() => {

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

var middle_canvas=document.getElementById("middle");
var ctx=middle_canvas.getContext("2d");
enhanceContext(ctx);
var ctrans = new cxform(0,0,0,0,255,255,255,255);

var scalingGrids = {};
var boundRects = {};
function shape224(ctx,ctrans,frame,ratio,time){
	var pathData="M -821 2176 Q -903 2155 -1095 2036 -1023 1929 -1014 1743 -1030 1484 -998 671 L -763 669 -821 2176";
	var grd=ctx.createLinearGradient(-1049.0,2167.5,-751.0,632.5);
	grd.addColorStop(0.0,tocolor(ctrans.apply([216,235,252,1])));
	grd.addColorStop(1.0,tocolor(ctrans.apply([77,184,255,1])));
	ctx.fillStyle = grd;
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M -632 667 L -257 664 411 658 Q 392 1655 381 1880 L 363 2097 208 2136 39 2158 Q 42 2070 31 1870 24 1790 16 1607 L -21 1602 -37 1870 -63 2073 -70 2152 -95 2220 -242 2235 -315 2237 -555 2225 -621 2217 -696 2201 -632 667 M -242 2235 L -182 1868 Q -165 1688 -163 1382 -146 1055 -257 664 -146 1055 -163 1382 -165 1688 -182 1868 L -242 2235 M 208 2136 Q 109 1939 132 1756 136 1430 154 1241 171 1051 138 674 171 1051 154 1241 136 1430 132 1756 109 1939 208 2136";
	var grd=ctx.createLinearGradient(-82.0,2216.5,-390.0,627.5);
	grd.addColorStop(0.0,tocolor(ctrans.apply([216,235,252,1])));
	grd.addColorStop(1.0,tocolor(ctrans.apply([77,184,255,1])));
	ctx.fillStyle = grd;
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 39 2158 L -70 2152 -63 2073 -37 1870 -21 1602 16 1607 Q 24 1790 31 1870 42 2070 39 2158";
	var grd=ctx.createLinearGradient(-82.0,2216.5,-390.0,627.5);
	grd.addColorStop(0.0,tocolor(ctrans.apply([16,106,197,1])));
	grd.addColorStop(1.0,tocolor(ctrans.apply([77,184,255,1])));
	ctx.fillStyle = grd;
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M -763 669 L -632 667 -696 2201 -821 2176 -763 669";
	var grd=ctx.createLinearGradient(-735.25,1690.75,-712.75,973.25);
	grd.addColorStop(0.0,tocolor(ctrans.apply([219,249,100,1])));
	grd.addColorStop(1.0,tocolor(ctrans.apply([252,234,80,1])));
	ctx.fillStyle = grd;
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M -763 669 L -632 667 -257 664 411 658 Q 392 1655 381 1880 L 363 2097 208 2136 39 2158 -70 2152 -95 2220 -242 2235 -315 2237 -555 2225 -621 2217 -696 2201 -821 2176 Q -903 2155 -1095 2036 -1023 1929 -1014 1743 -1030 1484 -998 671 L -763 669 -821 2176 M -70 2152 L -63 2073 -37 1870 -21 1602 16 1607 Q 24 1790 31 1870 42 2070 39 2158 M -696 2201 L -632 667";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([229,100,14,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M 138 674 Q 171 1051 154 1241 136 1430 132 1756 109 1939 208 2136 M -257 664 Q -146 1055 -163 1382 -165 1688 -182 1868 L -242 2235";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([229,100,14,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M -1074 782 L -1065 600 Q -1000 -391 -682 -949 -377 -690 83 -514 L 26 -874 101 -883 Q 259 -751 318 -372 377 6 439 918 L 310 967 -189 1017 Q -531 1045 -1074 782 M 441 1014 L 446 1186 Q 444 1429 422 1424 -762 1564 -1024 1395 L -1131 1330 Q -1084 1206 -1079 946 -723 1069 -434 1120 -146 1171 441 1014";
	var grd=ctx.createLinearGradient(-310.0,1526.75,-360.0,-956.75);
	grd.addColorStop(0.0,tocolor(ctrans.apply([204,255,85,1])));
	grd.addColorStop(1.0,tocolor(ctrans.apply([33,189,15,1])));
	ctx.fillStyle = grd;
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M -1079 946 L -1074 782 Q -531 1045 -189 1017 L 310 967 439 918 440 951 441 1014 Q -146 1171 -434 1120 -723 1069 -1079 946";
	var grd=ctx.createLinearGradient(428.0,1110.0,-1088.0,878.0);
	grd.addColorStop(0.0,tocolor(ctrans.apply([255,251,213,1])));
	grd.addColorStop(1.0,tocolor(ctrans.apply([253,253,2,1])));
	ctx.fillStyle = grd;
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 422 1424 Q -762 1564 -1024 1395 L -1131 1330 Q -1084 1206 -1079 946";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([229,100,14,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M -1074 782 L -1065 600 Q -1000 -391 -682 -949 -377 -690 83 -514 L 26 -874 101 -883 Q 259 -751 318 -372 377 6 439 918 L 440 951 441 1014 Q -146 1171 -434 1120 -723 1069 -1079 946 L -1074 782 Q -531 1045 -189 1017 L 310 967 439 918";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([229,100,14,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="miter";
	ctx.miterLimit=3.0;
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M 439 918 L 451 914 M 441 1014 L 446 1186 Q 444 1429 422 1424";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([229,100,14,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="miter";
	ctx.miterLimit=3.0;
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M 9 -921 Q 175 -895 239 -784 L 321 -515 Q 170 -632 82 -510 60 -676 56 -741 L 9 -921";
	var grd=ctx.createLinearGradient(140.25,-889.25,353.75,-458.75);
	grd.addColorStop(0.0,tocolor(ctrans.apply([244,220,2,1])));
	grd.addColorStop(1.0,tocolor(ctrans.apply([253,253,2,1])));
	ctx.fillStyle = grd;
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 9 -921 L 56 -741 Q 60 -676 82 -510 170 -632 321 -515 L 239 -784 Q 175 -895 9 -921 Z";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([229,100,14,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="butt";
	ctx.lineJoin="miter";
	ctx.miterLimit=3.0;
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M -299 -717 Q -97 -642 85 -514 L 71 -500 4 -491 Q -120 -453 -191 -354 -692 -634 -684 -949 -503 -793 -299 -717";
	var grd=ctx.createLinearGradient(-210.0,-926.75,-284.0,-249.25);
	grd.addColorStop(0.0,tocolor(ctrans.apply([244,220,2,1])));
	grd.addColorStop(1.0,tocolor(ctrans.apply([253,253,2,1])));
	ctx.fillStyle = grd;
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M -299 -717 Q -97 -642 85 -514 L 71 -500 4 -491 Q -120 -453 -191 -354 -692 -634 -684 -949 -503 -793 -299 -717 Z";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([229,100,14,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="butt";
	ctx.lineJoin="miter";
	ctx.miterLimit=3.0;
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M 447 -616 Q 602 -620 976 -417 1348 -215 1707 -99 1821 -64 2002 42 2020 56 2014 94 2008 131 1951 104 1895 76 1805 59 1849 214 2015 352 2022 397 1955 379 1887 360 1735 179 1584 -3 1160 -160 734 -317 411 -490 L 447 -616";
	ctx.fillStyle=tocolor(ctrans.apply([255,235,208,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 447 -616 Q 602 -620 976 -417 1348 -215 1707 -99 1821 -64 2002 42 2020 56 2014 94 2008 131 1951 104 1895 76 1805 59 1849 214 2015 352 2022 397 1955 379 1887 360 1735 179 1584 -3 1160 -160 734 -317 411 -490 L 447 -616 Z";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([229,100,14,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M 962 822 Q 994 976 1151 1115 1154 1161 1087 1141 1019 1121 883 956 745 790 559 688 372 585 -342 220 L -144 -94 Q -41 141 317 366 674 589 876 663 990 701 1165 808 1182 823 1173 861 1164 897 1108 869 1052 840 962 822";
	ctx.fillStyle=tocolor(ctrans.apply([255,235,208,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 962 822 Q 994 976 1151 1115 1154 1161 1087 1141 1019 1121 883 956 745 790 559 688 372 585 -342 220 L -144 -94 Q -41 141 317 366 674 589 876 663 990 701 1165 808 1182 823 1173 861 1164 897 1108 869 1052 840 962 822 Z";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([229,100,14,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M 779 -96 Q 538 -187 296 -280 L 102 -902 Q 503 -703 906 -503 L 779 -96";
	var grd=ctx.createLinearGradient(365.5,-600.5,2990.5,1966.5);
	grd.addColorStop(0.0,tocolor(ctrans.apply([106,210,2,1])));
	grd.addColorStop(1.0,tocolor(ctrans.apply([253,253,2,1])));
	ctx.fillStyle = grd;
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 779 -96 Q 538 -187 296 -280 L 102 -902 Q 503 -703 906 -503 L 779 -96 Z";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([229,100,14,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="butt";
	ctx.lineJoin="miter";
	ctx.miterLimit=3.0;
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M -698 6 Q -847 -123 -873 -221 -910 -359 -703 -541 -625 -618 -534 -615 -364 -349 -1 -157 -55 -23 -296 216 L -321 240 -354 271 -392 240 Q -464 184 -561 114 L -698 6";
	ctx.fillStyle=tocolor(ctrans.apply([47,194,20,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M -698 6 L -561 114 Q -464 184 -392 240 L -354 271 -321 240 -296 216 Q -55 -23 -1 -157 -364 -349 -534 -615";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([229,100,14,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="butt";
	ctx.lineJoin="miter";
	ctx.miterLimit=3.0;
	drawPath(ctx,pathData,true,scaleMode);

}

function shape225(ctx,ctrans,frame,ratio,time){
	var pathData="M 1498 -204 Q 1480 47 1446 248 1397 527 1461 933 L 1483 1030 Q 1493 1124 1462 1217 1363 1504 880 1736 600 1870 246 1888 -90 1904 -424 1815 -758 1723 -1012 1547 -1278 1362 -1399 1120 L -1454 1150 Q -1522 1180 -1585 1174 -1791 1157 -1884 808 -1969 496 -1818 349 -1755 287 -1671 280 L -1583 290 Q -1598 -14 -1496 -355 -1291 -1037 -687 -1254 -357 -1374 15 -1395 402 -1419 725 -1327 1076 -1231 1277 -1015 1500 -775 1508 -416 L 1498 -204 M -1395 488 Q -1434 376 -1515 324 -1548 301 -1583 290 -1548 301 -1515 324 -1434 376 -1395 488";
	ctx.fillStyle=tocolor(ctrans.apply([255,235,208,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 1498 -204 Q 1480 47 1446 248 1397 527 1461 933 L 1483 1030 Q 1493 1124 1462 1217 1363 1504 880 1736 600 1870 246 1888 -90 1904 -424 1815 -758 1723 -1012 1547 -1278 1362 -1399 1120 L -1454 1150 Q -1522 1180 -1585 1174 -1791 1157 -1884 808 -1969 496 -1818 349 -1755 287 -1671 280 L -1583 290";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([229,100,14,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="butt";
	ctx.lineJoin="miter";
	ctx.miterLimit=3.0;
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M -1583 290 Q -1598 -14 -1496 -355 -1291 -1037 -687 -1254 -357 -1374 15 -1395 402 -1419 725 -1327 1076 -1231 1277 -1015 1500 -775 1508 -416 L 1498 -204 M -1583 290 Q -1548 301 -1515 324 -1434 376 -1395 488";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([229,100,14,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="miter";
	ctx.miterLimit=3.0;
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M 1274 -1192 Q 1397 -1123 1509 -976 1733 -677 1682 -273 L 1651 -108 Q 1582 91 1408 256 1446 -34 1408 -358 1335 -1001 962 -1155 994 -1308 958 -1475 880 -1809 491 -1890 729 -1908 1024 -1790 1320 -1673 1274 -1192";
	ctx.fillStyle=tocolor(ctrans.apply([202,101,2,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 1274 -1192 Q 1397 -1123 1509 -976 1733 -677 1682 -273 L 1651 -108 Q 1582 91 1408 256 1446 -34 1408 -358 1335 -1001 962 -1155 994 -1308 958 -1475 880 -1809 491 -1890 729 -1908 1024 -1790 1320 -1673 1274 -1192 Z";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([229,100,14,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="butt";
	ctx.lineJoin="miter";
	ctx.miterLimit=3.0;
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M 1069 -1281 L 1031 -1320 Q 983 -1366 919 -1404 718 -1524 458 -1513 -375 -1476 -1487 -135";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([229,100,14,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="butt";
	ctx.lineJoin="miter";
	ctx.miterLimit=3.0;
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M 955 -983 Q 1109 -1188 1285 -1174 L 1256 -1080 Q 1213 -963 1143 -855 918 -506 504 -357 767 -570 802 -685 845 -838 955 -983";
	var grd=ctx.createLinearGradient(1257.75,-1202.25,584.25,-283.75);
	grd.addColorStop(0.01568627450980392,tocolor(ctrans.apply([152,91,1,1])));
	grd.addColorStop(0.7607843137254902,tocolor(ctrans.apply([227,144,44,1])));
	ctx.fillStyle = grd;
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 955 -983 Q 1109 -1188 1285 -1174 L 1256 -1080 Q 1213 -963 1143 -855 918 -506 504 -357 767 -570 802 -685 845 -838 955 -983 Z";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([229,100,14,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="butt";
	ctx.lineJoin="miter";
	ctx.miterLimit=3.0;
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M 1172 -1103 L 1150 -1091 Q 629 -1110 28 -1033 -574 -956 -1006 -527 -1440 -100 -1594 468 -1894 -79 -1805 -678 -1717 -1277 -862 -1651 -495 -1825 276 -1829 1046 -1834 1169 -1311 1252 -1339 1357 -1304 1565 -1236 1672 -921 1801 -530 1783 -290 1763 -30 1564 250 1603 -17 1576 -330 1520 -932 1203 -1158 L 1180 -1173 Q 1172 -1138 1172 -1103";
	var grd=ctx.createLinearGradient(1036.5,-1072.5,-1026.5,64.5);
	grd.addColorStop(0.0,tocolor(ctrans.apply([253,169,45,1])));
	grd.addColorStop(0.49019607843137253,tocolor(ctrans.apply([227,144,44,1])));
	grd.addColorStop(1.0,tocolor(ctrans.apply([186,56,1,1])));
	ctx.fillStyle = grd;
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 1150 -1091 L 1172 -1103 1172 -1098 Q 1172 -1062 1121 -959 1070 -856 849 -675 628 -495 -1085 148 -833 -202 -281 -417 263 -630 1150 -1091";
	var grd=ctx.createLinearGradient(1036.5,-1072.5,-1026.5,64.5);
	grd.addColorStop(0.0,tocolor(ctrans.apply([253,169,45,1])));
	grd.addColorStop(0.49019607843137253,tocolor(ctrans.apply([165,92,22,1])));
	grd.addColorStop(1.0,tocolor(ctrans.apply([186,56,1,1])));
	ctx.fillStyle = grd;
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 1150 -1091 Q 263 -630 -281 -417 -833 -202 -1085 148 -1487 883 -1783 863 -1667 810 -1594 468 -1440 -100 -1006 -527 -574 -956 28 -1033 629 -1110 1150 -1091";
	var grd=ctx.createLinearGradient(1036.5,-1072.5,-1026.5,64.5);
	grd.addColorStop(0.0,tocolor(ctrans.apply([250,162,31,1])));
	grd.addColorStop(0.49019607843137253,tocolor(ctrans.apply([227,144,44,1])));
	grd.addColorStop(1.0,tocolor(ctrans.apply([196,58,0,1])));
	ctx.fillStyle = grd;
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 1172 -1103 L 1150 -1091 Q 263 -630 -281 -417 -833 -202 -1085 148 628 -495 849 -675 1070 -856 1121 -959 1172 -1062 1172 -1098 L 1172 -1103 Q 1172 -1138 1180 -1173 L 1203 -1158 Q 1520 -932 1576 -330 1603 -17 1564 250 1763 -30 1783 -290 1801 -530 1672 -921 1565 -1236 1357 -1304 1252 -1339 1169 -1311 1046 -1834 276 -1829 -495 -1825 -862 -1651 -1717 -1277 -1805 -678 -1894 -79 -1594 468 -1667 810 -1783 863 -1487 883 -1085 148";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([229,100,14,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="miter";
	ctx.miterLimit=3.0;
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M -1594 468 Q -1440 -100 -1006 -527 -574 -956 28 -1033";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([229,100,14,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="miter";
	ctx.miterLimit=3.0;
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M 1183 -1191 L 1358 -1060 Q 1421 -1010 1490 -886 1557 -764 1590 -532 1623 -301 1708 -182 1794 -64 1914 29 1524 -133 1367 -520 1209 -906 1183 -1191";
	var grd=ctx.createLinearGradient(1343.25,-1228.5,1876.75,170.5);
	grd.addColorStop(0.06666666666666667,tocolor(ctrans.apply([210,126,2,1])));
	grd.addColorStop(1.0,tocolor(ctrans.apply([228,139,52,1])));
	ctx.fillStyle = grd;
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 1183 -1191 Q 1209 -906 1367 -520 1524 -133 1914 29 1794 -64 1708 -182 1623 -301 1590 -532 1557 -764 1490 -886 1421 -1010 1358 -1060 L 1183 -1191 Z";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([229,100,14,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="butt";
	ctx.lineJoin="miter";
	ctx.miterLimit=3.0;
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M -148 -1646 L -293 -1591 Q -473 -1510 -649 -1384 -1209 -979 -1509 -268";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([229,100,14,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="butt";
	ctx.lineJoin="miter";
	ctx.miterLimit=3.0;
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M -757 -1571 L -835 -1533 Q -934 -1479 -1032 -1393 -1347 -1115 -1549 -620";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([229,100,14,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="butt";
	ctx.lineJoin="miter";
	ctx.miterLimit=3.0;
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M 748 828 L 745 925 Q 763 1003 863 980";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([229,100,14,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="butt";
	ctx.lineJoin="miter";
	ctx.miterLimit=3.0;
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M 863 980 L 887 974 M 863 980 Q 785 1043 782 1105";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([229,100,14,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="miter";
	ctx.miterLimit=3.0;
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M -489 -112 L -634 -91 -546 -130 Q -435 -175 -331 -195 7 -259 177 -62 69 -66 -125 -101 L -489 -112";
	ctx.fillStyle=tocolor(ctrans.apply([186,94,1,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M -489 -112 L -634 -91 -546 -130 Q -435 -175 -331 -195 7 -259 177 -62 69 -66 -125 -101 L -489 -112 Z";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([229,100,14,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="butt";
	ctx.lineJoin="miter";
	ctx.miterLimit=3.0;
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M 963 -134 L 962 -135 Q 950 -173 969 -211 1010 -289 1177 -303 L 1328 -346 Q 1100 -187 963 -134";
	ctx.fillStyle=tocolor(ctrans.apply([186,94,1,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 963 -134 L 962 -135 Q 950 -173 969 -211 1010 -289 1177 -303 L 1328 -346";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([229,100,14,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="butt";
	ctx.lineJoin="miter";
	ctx.miterLimit=3.0;
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M 1328 -346 Q 1100 -187 963 -134 Z";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([229,100,14,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M 995 1018 Q 1071 857 1238 797 1337 761 1433 772 1541 1094 1448 1252 1334 1439 1141 1579 1024 1465 981 1345 920 1179 995 1018";
	drawPath(ctx,pathData,false);
	ctx.fillStyle=tocolor(ctrans.apply([255,255,255,0.0]));
	ctx.fill("evenodd");
	ctx.save();
	ctx.clip();
	ctx.transform(0.02520751953125,-0.0092010498046875,0.0092010498046875,0.02520751953125,1383,1198);
	var grd=ctx.createRadialGradient(0.0,0,0,0,0,16384);
	grd.addColorStop(0.0,tocolor(ctrans.apply([254,103,254,0.5019608])));
	grd.addColorStop(1.0,tocolor(ctrans.apply([255,255,255,0.0])));
	ctx.fillStyle = grd;
	ctx.fillRect(-16384,-16384,32768,32768);
	ctx.restore();
	var pathData="M -1181 915 Q -1013 760 -756 799 -500 840 -304 1051 -110 1262 -91 1521 -86 1607 -88 1891 -421 1840 -738 1713 -1055 1586 -1328 1196 -1304 1027 -1181 915";
	drawPath(ctx,pathData,false);
	ctx.fillStyle=tocolor(ctrans.apply([255,255,255,0.0]));
	ctx.fill("evenodd");
	ctx.save();
	ctx.clip();
	ctx.transform(0.0293731689453125,0.03192138671875,-0.0255889892578125,0.0235443115234375,-712,1424);
	var grd=ctx.createRadialGradient(0.0,0,0,0,0,16384);
	grd.addColorStop(0.0,tocolor(ctrans.apply([254,103,254,0.5019608])));
	grd.addColorStop(1.0,tocolor(ctrans.apply([255,255,255,0.0])));
	ctx.fillStyle = grd;
	ctx.fillRect(-16384,-16384,32768,32768);
	ctx.restore();
}

function sprite226(ctx,ctrans,frame,ratio,time){
	var clips = [];
	var frame_cnt = 1;
	frame = frame % frame_cnt;
	switch(frame){
		case 0:
			place("shape225",middle_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			place("sprite58",middle_canvas,ctx,[1.0,0.0,0.0,1.0,703.0,1366.0],ctrans,1,(0+time)%8,0,time);
			place("sprite62",middle_canvas,ctx,[1.0,0.0,0.0,1.0,411.0,476.0],ctrans,1,(0+time)%18,0,time);
			break;
	}
}

function sprite227(ctx,ctrans,frame,ratio,time){
	var clips = [];
	var frame_cnt = 10;
	frame = frame % frame_cnt;
	switch(frame){
		case 0:
			place("shape218",middle_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			place("sprite223",middle_canvas,ctx,[1.0,0.0,0.0,1.0,-115.0,2678.0],ctrans,1,(0+time)%24,0,time);
			place("shape224",middle_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			place("sprite226",middle_canvas,ctx,[1.0,0.0,0.0,1.0,-257.0,-2766.0],ctrans,1,(0+time)%1,0,time);
			break;
		case 1:
			place("shape218",middle_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			place("sprite223",middle_canvas,ctx,[1.0,0.0,0.0,1.0,-115.0,2678.0],ctrans,1,(1+time)%24,0,time);
			place("shape224",middle_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			place("sprite226",middle_canvas,ctx,[0.999664306640625,-0.0091705322265625,0.0091705322265625,0.999664306640625,-274.0,-2765.0],ctrans,1,(0+time)%1,0,time);
			break;
		case 2:
			place("shape218",middle_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			place("sprite223",middle_canvas,ctx,[1.0,0.0,0.0,1.0,-115.0,2678.0],ctrans,1,(2+time)%24,0,time);
			place("shape224",middle_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			place("sprite226",middle_canvas,ctx,[0.9992523193359375,-0.0183258056640625,0.0183258056640625,0.9992523193359375,-291.0,-2763.0],ctrans,1,(0+time)%1,0,time);
			break;
		case 3:
			place("shape218",middle_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			place("sprite223",middle_canvas,ctx,[1.0,0.0,0.0,1.0,-115.0,2678.0],ctrans,1,(3+time)%24,0,time);
			place("shape224",middle_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			place("sprite226",middle_canvas,ctx,[0.9986419677734375,-0.0307464599609375,0.0307464599609375,0.9986419677734375,-314.0,-2764.0],ctrans,1,(0+time)%1,0,time);
			break;
		case 4:
			place("shape218",middle_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			place("sprite223",middle_canvas,ctx,[1.0,0.0,0.0,1.0,-115.0,2678.0],ctrans,1,(4+time)%24,0,time);
			place("shape224",middle_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			place("sprite226",middle_canvas,ctx,[0.9980621337890625,-0.0419158935546875,0.0419158935546875,0.9980621337890625,-333.0,-2761.0],ctrans,1,(0+time)%1,0,time);
			break;
		case 5:
			place("shape218",middle_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			place("sprite223",middle_canvas,ctx,[1.0,0.0,0.0,1.0,-115.0,2678.0],ctrans,1,(5+time)%24,0,time);
			place("shape224",middle_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			place("sprite226",middle_canvas,ctx,[0.998565673828125,-0.031280517578125,0.031280517578125,0.998565673828125,-313.0,-2763.0],ctrans,1,(0+time)%1,0,time);
			break;
		case 6:
			place("shape218",middle_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			place("sprite223",middle_canvas,ctx,[1.0,0.0,0.0,1.0,-115.0,2678.0],ctrans,1,(6+time)%24,0,time);
			place("shape224",middle_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			place("sprite226",middle_canvas,ctx,[0.9990234375,-0.02264404296875,0.02264404296875,0.9990234375,-297.0,-2763.0],ctrans,1,(0+time)%1,0,time);
			break;
		case 7:
			place("shape218",middle_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			place("sprite223",middle_canvas,ctx,[1.0,0.0,0.0,1.0,-115.0,2678.0],ctrans,1,(7+time)%24,0,time);
			place("shape224",middle_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			place("sprite226",middle_canvas,ctx,[0.9994354248046875,-0.0140228271484375,0.0140228271484375,0.9994354248046875,-281.0,-2764.0],ctrans,1,(0+time)%1,0,time);
			break;
		case 8:
			place("shape218",middle_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			place("sprite223",middle_canvas,ctx,[1.0,0.0,0.0,1.0,-115.0,2678.0],ctrans,1,(8+time)%24,0,time);
			place("shape224",middle_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			place("sprite226",middle_canvas,ctx,[0.999755859375,-0.0053863525390625,0.0053863525390625,0.999755859375,-265.0,-2764.0],ctrans,1,(0+time)%1,0,time);
			break;
		case 9:
			place("shape218",middle_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			place("sprite223",middle_canvas,ctx,[1.0,0.0,0.0,1.0,-115.0,2678.0],ctrans,1,(9+time)%24,0,time);
			place("shape224",middle_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			place("sprite226",middle_canvas,ctx,[1.0,0.0,0.0,1.0,-257.0,-2766.0],ctrans,1,(0+time)%1,0,time);
			break;
	}
}

function shape211(ctx,ctrans,frame,ratio,time){
	var pathData="M 5388 -4223 Q 5782 -4224 5782 -3807 L 5782 4298 Q 5782 4714 5388 4714 L -5385 4714 Q -5778 4714 -5778 4298 L -5778 -3807 Q -5778 -4224 -5385 -4223 L 5388 -4223";
	ctx.fillStyle=tocolor(ctrans.apply([255,204,102,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 2516 1969 Q 2031 2177 1412 2721 793 3264 436 3842 -11 4563 140 5320 291 6077 -637 6179 -1380 6262 -2775 5925 -3772 5684 -4996 5259 -5608 5045 -6021 4880 L -1460 2946 Q 15 2319 1123 2060 2230 1800 2780 1800 L 3051 1800 Q 2844 1827 2516 1969";
	ctx.fillStyle=tocolor(ctrans.apply([0,0,0,0.18039216]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M -1235 -3038 L -1238 -2961 -1240 -2936 Q -1248 -2873 -1264 -2813 L -1264 -2812 Q -1414 -2768 -1574 -2754 -1446 -2745 -1336 -2647 L -1331 -2650 Q -1386 -2551 -1471 -2465 -1708 -2228 -2044 -2228 -2371 -2228 -2603 -2451 L -2401 -2468 -2064 -2497 -2320 -2528 -2698 -2559 Q -2749 -2627 -2783 -2701 L -2591 -2710 -2498 -2716 -2809 -2766 Q -2853 -2891 -2854 -3035 L -2616 -3035 -2854 -3050 Q -2850 -3378 -2617 -3611 -2380 -3849 -2044 -3848 -1708 -3849 -1471 -3611 -1235 -3374 -1235 -3038 M -2441 -2710 L -2384 -2729 -2498 -2716 -2447 -2710 -2441 -2710";
	var grd=ctx.createLinearGradient(-1955.0,-1590.25,-1955.0,-3209.75);
	grd.addColorStop(0.0,tocolor(ctrans.apply([255,255,153,0.0])));
	grd.addColorStop(1.0,tocolor(ctrans.apply([255,102,0,1])));
	ctx.fillStyle = grd;
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
}

function shape212(ctx,ctrans,frame,ratio,time){
	var pathData="M -1702 1010 Q -1706 951 -1658 890 -1641 867 -1634 829 -1630 808 -1617 790 -1575 732 -1547 674 L -1523 644 Q -1467 600 -1511 536 -1530 508 -1563 494 -1633 465 -1631 388 -1630 338 -1640 288 -1650 238 -1650 188 -1650 158 -1630 138 -1590 98 -1542 66 L -1456 16 -1420 8 Q -1476 -75 -1501 -172 -1555 -385 -1375 -525 L -1165 -693 Q -1130 -722 -1080 -723 -885 -729 -701 -688 -630 -672 -574 -633 -530 -602 -505 -549 -467 -467 -485 -373 -508 -258 -434 -179 -400 -142 -373 -96 -336 -32 -380 28 -410 68 -432 112 -440 128 -430 138 -410 158 -379 160 L -181 175 Q -109 180 -57 224 L -25 253 Q 71 125 154 -24 170 -52 202 -67 320 -120 441 -76 522 -47 540 28 624 -36 727 -123 750 -142 780 -150 917 -188 1059 -184 1110 -182 1150 -142 1180 -112 1201 -72 1287 90 1182 235 1150 278 1101 310 1060 337 1020 348 1078 372 1125 422 1150 448 1160 488 1170 528 1190 562 1200 578 1221 585 1288 608 1351 654 1370 668 1399 662 1467 648 1526 620 L 1576 618 Q 1600 628 1623 643 1729 711 1754 567 1771 470 1828 394 1840 378 1860 369 2125 247 2302 466 2320 488 2328 512 L 2346 587 Q 2350 618 2345 645 2340 668 2318 686 2280 718 2260 758 2250 778 2268 803 2377 955 2474 1120 2490 1148 2523 1157 L 2599 1163 2681 1152 Q 2853 1127 2984 1244 3029 1285 3096 1294 3120 1298 3141 1327 3184 1388 3149 1453 3106 1530 3056 1600 3050 1608 3066 1620 3090 1638 3121 1644 3223 1664 3199 1768 3187 1821 3241 1817 3350 1808 3460 1814 3540 1818 3610 1850 3670 1878 3697 1938 3710 1968 3697 2007 L 3685 2042 Q 3806 2138 3939 2213 L 3981 2236 3859 2265 Q 3686 2310 3514 2295 L 3507 2294 3507 2291 Q 3372 1901 3007 1769 2737 1672 2756 1911 2608 1888 2433 2020 2481 1973 2478 1886 2467 1591 2244 1503 2256 1401 2191 1294 1974 937 1618 1146 1355 1302 1438 1557 1306 1571 1218 1528 985 1413 771 1562 809 1529 851 1468 1054 1181 892 989 1034 814 922 589 800 343 530 376 139 423 385 728 191 592 -27 623 -65 535 -135 463 -334 257 -606 250 -607 207 -625 157 -751 -192 -1038 11 -1399 268 -1024 540 -1382 553 -1374 833 -1600 835 -1702 1010";
	ctx.fillStyle=tocolor(ctrans.apply([255,255,255,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 3507 2294 Q 3414 2285 3322 2259 3005 2170 2682 2255 2520 2298 2362 2353 2001 2479 1639 2392 L 1361 2324 Q 1210 2288 1058 2278 639 2249 220 2287 90 2298 -40 2294 -354 2286 -659 2354 -777 2380 -900 2368 L -1440 2339 -1580 2338 -1700 2343 Q -1750 2348 -1793 2366 -1924 2420 -2060 2468 -1934 2414 -2035 2341 -2080 2308 -2096 2260 -2100 2248 -2085 2225 -2006 2099 -1860 2108 L -1902 2070 Q -1940 2038 -1957 1998 -1990 1918 -1996 1828 -2004 1715 -1900 1649 -1842 1612 -1780 1584 L -1815 1480 Q -1840 1398 -1815 1316 -1800 1268 -1752 1242 -1710 1218 -1664 1199 -1596 1171 -1639 1127 -1697 1070 -1702 1010 -1600 835 -1374 833 -1382 553 -1024 540 -1399 268 -1038 11 -751 -192 -625 157 -607 207 -606 250 -334 257 -135 463 -65 535 -27 623 191 592 385 728 139 423 530 376 800 343 922 589 1034 814 892 989 1054 1181 851 1468 809 1529 771 1562 985 1413 1218 1528 1306 1571 1438 1557 1355 1302 1618 1146 1974 937 2191 1294 2256 1401 2244 1503 2467 1591 2478 1886 2481 1973 2433 2020 2608 1888 2756 1911 2737 1672 3007 1769 3372 1901 3507 2291 L 3507 2294";
	ctx.fillStyle=tocolor(ctrans.apply([255,255,153,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
}

function shape213(ctx,ctrans,frame,ratio,time){
	var pathData="M 2872 -2165 Q 3217 -1994 3591 -2079 3965 -2163 4342 -2180 4724 -2197 5062 -2021 5356 -1868 5688 -1944 6048 -2027 6407 -1812 L 7033 -1448 Q 7349 -1269 7680 -1120 7983 -984 8301 -883 L 14273 1120 8820 549 -8819 549 -13507 673 Q -8757 -848 -8695 -864 -8395 -940 -8113 -1067 -7752 -1229 -7390 -1377 -7019 -1529 -6637 -1384 L -5932 -1118 Q -5805 -1070 -5675 -1051 -5356 -1166 -5056 -1314 -4732 -1473 -4419 -1660 -4087 -1857 -3717 -1927 -3332 -1999 -2970 -1869 -2618 -1742 -2259 -1731 -1868 -1719 -1487 -1810 -1126 -1897 -754 -1797 -399 -1701 -33 -1796 345 -1894 704 -2074 1051 -2249 1419 -2382 1781 -2514 2156 -2424 2525 -2336 2872 -2165";
	var grd=ctx.createLinearGradient(443.0,344.0,443.0,-3200.0);
	grd.addColorStop(0.0,tocolor(ctrans.apply([255,255,153,1])));
	grd.addColorStop(1.0,tocolor(ctrans.apply([255,102,0,1])));
	ctx.fillStyle = grd;
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
}

function sprite214(ctx,ctrans,frame,ratio,time){
	var clips = [];
	var frame_cnt = 1;
	frame = frame % frame_cnt;
	switch(frame){
		case 0:
			place("shape213",middle_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
	}
}

function shape215(ctx,ctrans,frame,ratio,time){
	var pathData="M 346 -3984 Q 567 -4064 791 -4127 1031 -4194 1278 -4202 1525 -4209 1762 -4146 1960 -4093 2150 -4011 2333 -3932 2437 -3772 2513 -3654 2526 -3656 2613 -3671 2697 -3696 L 3023 -3784 Q 3317 -3856 3565 -3707 L 3924 -3490 Q 4184 -3332 4406 -3128 4563 -2984 4441 -2816 L 4614 -2807 Q 4949 -2827 5160 -2577 5254 -2467 5314 -2339 5370 -2220 5398 -2090 5428 -1945 5443 -1799 5456 -1666 5403 -1564 L 5397 -1567 5401 -1559 Q 5487 -1375 5536 -1181 5559 -1088 5517 -1000 5457 -871 5356 -769 5254 -668 5124 -623 4826 -520 4553 -612 L 4554 -617 4548 -614 Q 4409 -551 4262 -527 3932 -472 3726 -734 3629 -856 3571 -999 3544 -1067 3523 -1138 L 3627 -1170 3516 -1162 Q 3372 -1158 3235 -1189 3053 -1229 2882 -1316 L 2893 -1343 2875 -1319 Q 2775 -1197 2643 -1123 2544 -1067 2438 -1054 L 2441 -1046 Q 2482 -929 2494 -810 2522 -520 2312 -299 2235 -217 2137 -196 L 2025 -191 2025 -177 Q 2027 -75 2002 29 1974 145 1905 227 1815 334 1676 385 1378 495 1109 337 L 1083 319 1103 290 Q 1055 295 1083 319 L 1081 322 Q 1045 406 999 483 958 551 893 561 501 621 146 436 -272 218 -314 -206 L -388 -165 Q -478 -116 -580 -116 -681 -116 -784 -142 -923 -178 -950 -299 L -1044 -204 Q -1204 -159 -1366 -125 -1665 -61 -1905 -213 -1965 -79 -2064 27 -2135 101 -2223 140 L -2195 198 Q -2124 347 -2231 467 -2292 537 -2363 592 -2523 716 -2729 743 -2815 754 -2888 722 -3094 634 -3245 460 -3321 373 -3337 290 -3337 319 -3344 346 -3352 377 -3369 404 -3472 572 -3686 574 -3998 578 -4161 369 L -4112 326 -4164 366 Q -4475 587 -4844 428 -5168 288 -5166 -58 -5195 -29 -5230 -15 -5440 69 -5660 5 -5910 -67 -5949 -290 -6039 -203 -6156 -151 -6410 -38 -6671 -128 -6762 -159 -6832 -222 -6892 -276 -6936 -349 -7011 -475 -7026 -610 -7040 -746 -6982 -865 -6836 -1159 -6530 -1306 L -6450 -1319 -6453 -1333 Q -6479 -1488 -6383 -1595 -6356 -1626 -6323 -1633 -6192 -1659 -6066 -1626 -6272 -1961 -6175 -2349 -6138 -2496 -6069 -2627 -5953 -2849 -5748 -2993 -5630 -3077 -5504 -3145 -5213 -3303 -4963 -3106 -4977 -3149 -4966 -3184 -4934 -3280 -4864 -3356 -4745 -3483 -4615 -3600 -4349 -3837 -4003 -3941 -3579 -4069 -3134 -4040 -2927 -4027 -2786 -3889 -2742 -3845 -2690 -3824 -2670 -3816 -2652 -3840 -2361 -4224 -1883 -4341 -1654 -4397 -1420 -4412 -1175 -4426 -934 -4380 -725 -4339 -518 -4283 -313 -4228 -194 -4071 -145 -4005 -78 -3961 -14 -3918 57 -3923 204 -3933 346 -3984";
	ctx.fillStyle=tocolor(ctrans.apply([255,0,51,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 3597 -1666 L 3679 -1662 3670 -1622 3642 -1513 Q 3628 -1465 3599 -1422 3536 -1330 3489 -1217 3454 -1132 3406 -1057 3304 -895 3130 -792 3092 -769 3050 -750 L 2907 -685 Q 2765 -622 2612 -615 L 2004 -571 1886 -563 Q 1743 -557 1606 -521 1427 -292 1195 -110 1147 -72 1110 -24 1046 60 970 125 L 872 150 Q 827 160 786 180 691 229 552 266 379 313 205 383 L -34 481 Q -102 509 -175 519 L -226 535 Q -269 559 -348 565 L -378 567 -496 573 -552 583 Q -725 598 -796 749 L -829 819 Q -893 961 -989 1102 L -1162 1364 Q -1190 1408 -1230 1437 -1351 1526 -1445 1632 L -1488 1676 Q -1608 1789 -1686 1915 -1713 1959 -1774 2030 -1848 2115 -1896 2231 -1924 2297 -1958 2405 L -2120 2903 Q -2296 3424 -2446 3915 -2493 4067 -2563 4205 -2629 4335 -2645 4470 -2681 4788 -2633 5107 -2626 5152 -2622 5196 L -2602 5369 -2572 5659 -2568 5747 Q -2563 6172 -2494 6587 L -2496 6588 -2494 6591 Q -2480 6606 -2467 6647 L -2486 6638 Q -2537 6616 -2597 6613 L -2614 6612 -2641 6613 -2618 6604 Q -2659 6511 -2679 6410 -2805 5753 -2903 5108 -2935 5128 -2953 5197 -3105 5772 -3077 6385 L -3222 6037 Q -3269 5919 -3295 5951 L -3348 6497 Q -3461 6513 -3571 6557 -3598 6568 -3625 6571 -3619 6348 -3597 6124 L -3562 5864 Q -3507 5542 -3467 5223 -3454 5123 -3434 5025 -3312 4440 -3338 3831 -3382 3933 -3413 4039 L -3436 4119 Q -3508 4387 -3553 4671 L -3719 5746 Q -3760 6015 -3860 6269 -3918 6414 -3992 6556 L -4005 6557 -4134 6568 Q -3876 6196 -3805 5776 L -3704 5197 -3511 4151 Q -3497 4079 -3492 4005 -3454 3448 -3274 2934 -3250 2865 -3156 2797 L -3084 2747 -2983 2680 Q -2946 2656 -2912 2629 -2673 2444 -2460 2242 L -2416 2199 -2028 1804 Q -1937 1711 -1892 1588 L -1907 1507 Q -1930 1408 -1961 1311 -2126 785 -2378 318 -2409 261 -2447 209 -2599 2 -2710 -230 L -2878 -310 Q -3041 -382 -3161 -441 L -3196 -456 Q -3374 -526 -3569 -582 -3720 -626 -3856 -704 L -3982 -771 Q -4064 -812 -4158 -923 -4249 -1028 -4280 -1128 -4320 -1259 -4346 -1395 -4354 -1436 -4375 -1455 -4401 -1476 -4390 -1539 -4383 -1582 -4396 -1621 -4422 -1702 -4399 -1796 -4379 -1882 -4393 -1971 -4406 -2057 -4400 -2147 -4397 -2191 -4399 -2234 -4402 -2311 -4395 -2386 L -4231 -2410 -4230 -2410 Q -4308 -1561 -4030 -1250 -3721 -903 -3515 -792 -3316 -685 -3143 -622 L -3132 -618 -3134 -615 Q -3019 -532 -2875 -491 -2831 -479 -2792 -455 -2724 -413 -2716 -441 L -2735 -491 -2750 -553 -2765 -606 Q -2803 -727 -2798 -871 L -2774 -1567 -2774 -1682 -2773 -1836 -2458 -1800 Q -2488 -1033 -2493 -697 -2497 -486 -2415 -288 -2380 -203 -2361 -114 -2314 111 -2164 249 -2104 305 -2054 372 -1848 644 -1587 864 L -1554 891 -1566 898 Q -1486 1033 -1416 1173 L -1398 1185 Q -1322 1048 -1215 932 -1139 850 -1120 699 -1117 683 -1103 668 -1030 593 -1006 497 L -998 463 Q -963 298 -911 141 -858 -18 -857 -203 L -853 -262 Q -842 -348 -838 -435 -816 -869 -720 -1299 L -538 -1280 -456 -1262 -460 -1247 Q -576 -912 -591 -551 L -595 -406 Q -596 -42 -620 315 L -620 317 -604 316 Q -638 403 -678 488 -609 441 -525 425 L -491 416 Q -355 377 -204 367 -82 360 29 320 73 305 116 303 213 301 290 262 423 194 550 142 787 43 989 -85 1028 -110 1082 -166 L 1119 -212 1147 -246 1172 -275 Q 1367 -520 1504 -814 L 1547 -895 Q 1629 -1030 1678 -1192 1799 -1601 2027 -1977 L 2126 -1944 Q 2217 -1909 2294 -1848 L 2090 -1393 Q 1993 -1174 1885 -968 L 1854 -909 1837 -928 1769 -873 Q 2012 -763 2265 -739 2355 -731 2434 -763 2698 -870 2957 -993 2975 -1001 2989 -1016 3079 -1107 3187 -1169 3261 -1212 3308 -1250 L 3340 -1274 Q 3471 -1369 3562 -1587 L 3597 -1666 M -2252 4282 Q -2267 4813 -2300 5340 -2336 5925 -2131 6454 -2090 6560 -1998 6642 L -1913 6718 Q -2075 6672 -2233 6611 L -2279 6594 Q -2337 6438 -2361 6270 -2384 6107 -2424 5947 L -2446 5835 Q -2516 5358 -2413 4875 -2349 4574 -2252 4282 M -2118 2179 Q -2221 2229 -2283 2328 -2333 2407 -2399 2476 -2579 2666 -2679 2899 L -2717 2994 Q -2824 3271 -2883 3568 -2907 3692 -2924 3817 L -2855 3699 Q -2786 3593 -2754 3513 -2742 3483 -2723 3458 -2460 3121 -2260 2789 -2206 2699 -2159 2606 -1991 2272 -1838 1928 L -1967 2067 Q -2033 2138 -2118 2179";
	ctx.fillStyle=tocolor(ctrans.apply([125,107,64,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M -2494 6587 Q -2563 6172 -2568 5747 L -2572 5659 -2602 5369 -2622 5196 Q -2626 5152 -2633 5107 -2681 4788 -2645 4470 -2629 4335 -2563 4205 -2493 4067 -2446 3915 -2296 3424 -2120 2903 L -1958 2405 Q -1924 2297 -1896 2231 -1848 2115 -1774 2030 -1713 1959 -1686 1915 -1608 1789 -1488 1676 L -1445 1632 Q -1351 1526 -1230 1437 -1190 1408 -1162 1364 L -989 1102 Q -893 961 -829 819 L -796 749 Q -725 598 -552 583 L -496 573 -378 567 -348 565 Q -269 559 -226 535 L -175 519 Q -102 509 -34 481 L 205 383 Q 379 313 552 266 691 229 786 180 827 160 872 150 L 970 125 Q 873 207 755 260 624 319 489 367 421 392 357 423 29 586 -322 687 -406 712 -484 746 L -632 816 -628 824 Q -609 857 -620 897 -654 1016 -717 1137 -966 1620 -1358 1980 -1457 2071 -1542 2173 -1727 2395 -1919 2610 -1978 2677 -2014 2751 -2087 2901 -2099 3076 -2104 3150 -2121 3222 -2238 3733 -2252 4267 L -2252 4282 Q -2349 4574 -2413 4875 -2516 5358 -2446 5835 L -2424 5947 Q -2384 6107 -2361 6270 -2337 6438 -2279 6594 L -2354 6570 Q -2457 6539 -2494 6587 M -2118 2179 Q -2033 2138 -1967 2067 L -1838 1928 Q -1991 2272 -2159 2606 -2206 2699 -2260 2789 -2460 3121 -2723 3458 -2742 3483 -2754 3513 -2786 3593 -2855 3699 L -2924 3817 Q -2907 3692 -2883 3568 -2824 3271 -2717 2994 L -2679 2899 Q -2579 2666 -2399 2476 -2333 2407 -2283 2328 -2221 2229 -2118 2179";
	ctx.fillStyle=tocolor(ctrans.apply([169,145,86,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 3597 -1666 L 3562 -1587 Q 3471 -1369 3340 -1274 L 3308 -1250 Q 3261 -1212 3187 -1169 3079 -1107 2989 -1016 2975 -1001 2957 -993 2698 -870 2434 -763 2355 -731 2265 -739 2012 -763 1769 -873 L 1837 -928 1854 -909 Q 2028 -869 2206 -869 2342 -868 2470 -921 2525 -943 2583 -957 2713 -987 2834 -1039 2917 -1074 2993 -1128 3297 -1344 3373 -1677 L 3597 -1666 M 2027 -1977 Q 1799 -1601 1678 -1192 1629 -1030 1547 -895 L 1504 -814 Q 1367 -520 1172 -275 L 1147 -246 1119 -212 1082 -166 Q 1028 -110 989 -85 787 43 550 142 423 194 290 262 213 301 116 303 73 305 29 320 -82 360 -204 367 -355 377 -491 416 L -525 425 Q -609 441 -678 488 -638 403 -604 316 -294 301 1 208 231 135 459 45 537 15 607 -33 1078 -356 1371 -855 1466 -1016 1541 -1189 1601 -1327 1922 -2003 L 2027 -1977 M -720 -1299 Q -816 -869 -838 -435 -842 -348 -853 -262 L -857 -203 Q -858 -18 -911 141 -963 298 -998 463 L -1006 497 Q -1030 593 -1103 668 -1117 683 -1120 699 -1139 850 -1215 932 -1322 1048 -1398 1185 L -1416 1173 Q -1486 1033 -1566 898 L -1554 891 Q -1521 918 -1489 947 -1323 751 -1187 524 -1048 289 -998 27 -987 -29 -981 -86 -973 -159 -972 -232 -972 -398 -948 -554 -943 -580 -943 -609 -943 -653 -935 -698 -919 -774 -911 -843 L -890 -1044 Q -885 -1088 -871 -1132 L -809 -1298 -720 -1299 M -2773 -1836 L -2774 -1682 -2774 -1567 -2798 -871 Q -2803 -727 -2765 -606 L -2750 -553 -2735 -491 -2716 -441 Q -2724 -413 -2792 -455 -2831 -479 -2875 -491 -3019 -532 -3134 -615 L -3132 -618 Q -3020 -578 -2902 -551 L -2919 -698 -2936 -1016 Q -2950 -1415 -2865 -1797 L -2856 -1843 -2773 -1836 M -4395 -2386 Q -4402 -2311 -4399 -2234 -4397 -2191 -4400 -2147 -4406 -2057 -4393 -1971 -4379 -1882 -4399 -1796 -4422 -1702 -4396 -1621 -4383 -1582 -4390 -1539 -4401 -1476 -4375 -1455 -4354 -1436 -4346 -1395 -4320 -1259 -4280 -1128 -4249 -1028 -4158 -923 -4064 -812 -3982 -771 L -3856 -704 Q -3720 -626 -3569 -582 -3374 -526 -3196 -456 L -3161 -441 Q -3041 -382 -2878 -310 L -2710 -230 Q -2599 2 -2447 209 -2409 261 -2378 318 -2126 785 -1961 1311 -1930 1408 -1907 1507 L -1892 1588 Q -1937 1711 -2028 1804 L -2416 2199 -2460 2242 Q -2673 2444 -2912 2629 -2946 2656 -2983 2680 L -3084 2747 -3156 2797 Q -3250 2865 -3274 2934 -3454 3448 -3492 4005 -3497 4079 -3511 4151 L -3704 5197 -3805 5776 Q -3876 6196 -4134 6568 L -4374 6583 Q -4250 6490 -4181 6383 -4052 6186 -3995 5923 -3883 5405 -3824 4877 -3808 4729 -3778 4585 -3725 4327 -3703 4064 L -3693 4003 -3677 3950 Q -3671 3933 -3671 3918 -3667 3769 -3629 3628 -3490 3112 -3357 2586 -3352 2569 -3338 2554 -3242 2459 -3114 2368 L -3070 2328 Q -2956 2202 -2792 2134 -2757 2119 -2725 2094 -2413 1855 -2117 1586 -2135 1116 -2396 718 -2438 654 -2469 582 -2570 348 -2688 110 L -2764 -55 -2758 -64 -2771 -71 Q -2978 -195 -3194 -287 -3720 -511 -4197 -803 -4237 -827 -4265 -872 -4565 -1341 -4505 -1917 -4481 -2147 -4509 -2356 L -4395 -2386 M -3992 6556 Q -3918 6414 -3860 6269 -3760 6015 -3719 5746 L -3553 4671 Q -3508 4387 -3436 4119 L -3413 4039 Q -3382 3933 -3338 3831 -3312 4440 -3434 5025 -3454 5123 -3467 5223 -3507 5542 -3562 5864 L -3597 6124 Q -3619 6348 -3625 6571 L -3656 6572 Q -3735 6568 -3744 6617 -3744 6588 -3737 6561 -3729 6530 -3744 6501 -3773 6501 -3798 6511 -3889 6546 -3992 6556 M -3348 6497 L -3295 5951 Q -3269 5919 -3222 6037 L -3077 6385 Q -3105 5772 -2953 5197 -2935 5128 -2903 5108 -2805 5753 -2679 6410 -2659 6511 -2618 6604 L -2641 6613 -2753 6602 Q -2950 6545 -3162 6494 L -3222 6487 -3348 6497";
	ctx.fillStyle=tocolor(ctrans.apply([87,74,45,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M -1701 -6310 L -1697 -6316 -1678 -6303 -1701 -6310 M 2330 -5426 L 2332 -5423 2330 -5424 2330 -5426 M 2718 -4935 L 2721 -4934 2740 -4948 2757 -4924 2721 -4934 2717 -4932 2718 -4935 M 3362 -2088 Q 3378 -2123 3368 -2090 L 3362 -2088 M -2150 -4372 L -2149 -4371 -2150 -4371 -2150 -4372 M -3281 -3189 L -3305 -3232 -3241 -3208 -3281 -3189";
	ctx.fillStyle=tocolor(ctrans.apply([51,102,51,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 1250 -1745 L 1209 -1749 Q 1147 -1756 1117 -1800 1195 -1797 1250 -1745";
	ctx.fillStyle=tocolor(ctrans.apply([255,51,102,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 5894 -913 L 5723 -922 Q 5482 -958 5279 -1106 5248 -1128 5226 -1161 L 5212 -1120 Q 5178 -1045 5091 -1016 5014 -990 4942 -986 L 4848 -1044 Q 4534 -1261 4584 -1625 4458 -1448 4223 -1356 3885 -1224 3589 -1432 3283 -1646 3333 -2004 3337 -2032 3348 -2057 L 3362 -2088 3368 -2090 Q 3378 -2123 3362 -2088 3255 -2061 3156 -2001 2893 -1839 2577 -1848 2123 -1861 1783 -2145 1700 -2216 1695 -2177 1695 -2119 1672 -2071 1635 -1988 1579 -1913 1459 -1749 1274 -1745 L 1250 -1745 1275 -1718 Q 1315 -1669 1344 -1617 1390 -1538 1397 -1449 1406 -1320 1335 -1230 1293 -1176 1243 -1128 L 1149 -1124 844 -1156 784 -1161 Q 757 -1071 831 -936 875 -856 847 -763 814 -653 730 -574 616 -465 465 -417 385 -391 303 -377 67 -389 -163 -452 -694 -598 -883 -1076 -904 -1132 -902 -1189 -899 -1283 -958 -1284 L -1006 -1242 Q -1117 -1154 -1287 -1108 -1543 -1038 -1798 -1116 L -1897 -1152 Q -2073 -1225 -2193 -1367 -2227 -1407 -2231 -1453 -2237 -1544 -2288 -1567 L -2476 -1456 Q -2710 -1309 -2989 -1390 -3049 -1407 -3100 -1437 -3241 -1515 -3262 -1654 L -3322 -1625 -3440 -1561 Q -3711 -1392 -4022 -1481 -4067 -1494 -4100 -1523 -4171 -1585 -4174 -1538 -4189 -1494 -4196 -1450 -4228 -1257 -4386 -1160 -4478 -1103 -4579 -1074 -4675 -1045 -4781 -1036 -4982 -1019 -5049 -1120 -5005 -1045 -4979 -954 -4950 -856 -4933 -755 -4893 -519 -5060 -351 -5465 58 -6025 -155 -6097 -183 -6163 -219 L -6201 -274 Q -6333 -479 -6318 -722 L -6307 -831 Q -6503 -880 -6666 -1018 -6918 -1233 -6801 -1533 -6697 -1800 -6532 -2033 L -6470 -2113 Q -6626 -2261 -6681 -2478 -6728 -2656 -6692 -2839 -6651 -3048 -6539 -3230 -6408 -3439 -6212 -3594 -6059 -3715 -5867 -3771 L -5806 -3786 -5769 -3844 Q -5612 -4051 -5341 -4118 -5395 -4332 -5348 -4555 -5291 -4820 -5066 -4977 -4857 -5123 -4634 -5237 -4439 -5337 -4232 -5315 L -4216 -5313 -4230 -5319 Q -4191 -5399 -4138 -5468 -3975 -5674 -3720 -5753 -3459 -5834 -3178 -5788 -3017 -5761 -2866 -5703 -2930 -5783 -2947 -5865 -2959 -5926 -2961 -5984 L -2867 -6099 Q -2790 -6182 -2688 -6246 -2387 -6435 -2020 -6381 -1860 -6358 -1701 -6310 L -1678 -6303 -1697 -6316 Q -1468 -6647 -1042 -6766 -678 -6868 -371 -6679 -294 -6631 -282 -6559 -230 -6569 -216 -6640 -205 -6690 -159 -6733 -61 -6823 85 -6804 L 265 -6784 Q 484 -6766 692 -6677 1208 -6454 1241 -5921 1248 -5814 1208 -5718 1272 -5734 1314 -5796 1330 -5819 1358 -5837 1636 -6003 1906 -5831 2155 -5673 2330 -5426 L 2330 -5424 Q 2179 -5459 2028 -5466 1908 -5471 1792 -5417 1492 -5276 1248 -5142 1239 -5137 1202 -5156 1037 -5242 844 -5237 570 -5229 347 -5081 190 -4977 59 -4842 -8 -4773 -50 -4691 L 25 -4739 Q 205 -4847 420 -4854 647 -4861 874 -4816 1030 -4785 1161 -4721 1429 -4873 1737 -4951 2015 -5021 2300 -5005 2512 -4993 2718 -4935 L 2717 -4932 2721 -4934 2757 -4924 2740 -4948 Q 2926 -5082 3163 -5125 3383 -5166 3600 -5120 3793 -5079 3977 -4995 4337 -4832 4385 -4468 4392 -4411 4389 -4356 4472 -4305 4546 -4231 4743 -4035 4823 -3772 4848 -3686 4812 -3622 4961 -3829 5249 -3735 5473 -3661 5618 -3489 5709 -3381 5759 -3247 5841 -3025 5663 -2877 L 5793 -2777 Q 5900 -2693 5896 -2555 5892 -2452 5840 -2361 5804 -2296 5755 -2244 6090 -2039 6202 -1626 6251 -1443 6171 -1271 6073 -1059 5894 -913 M 2272 -3188 Q 2242 -3193 2231 -3207 2096 -3369 1905 -3477 1741 -3570 1562 -3624 1344 -3690 1121 -3664 L 1269 -3581 Q 1483 -3454 1658 -3273 1795 -3131 1858 -2962 L 2119 -2947 Q 2395 -2901 2638 -2759 2705 -2720 2758 -2671 3032 -2700 3319 -2575 3474 -2507 3612 -2414 3562 -2526 3500 -2630 3398 -2801 3250 -2935 3094 -3077 2896 -3159 2744 -3222 2589 -3191 2443 -3162 2272 -3188 M 1250 -1745 Q 1195 -1797 1117 -1800 1147 -1756 1209 -1749 L 1250 -1745 M 5226 -1161 Q 5237 -1212 5197 -1220 5209 -1187 5226 -1161 M -2149 -4371 Q -1947 -4350 -1749 -4278 -1468 -4176 -1216 -4025 -1250 -4124 -1300 -4216 -1422 -4441 -1631 -4591 -1847 -4745 -2116 -4804 -2379 -4861 -2644 -4820 L -2800 -4785 Q -2628 -4720 -2468 -4630 -2288 -4528 -2150 -4372 L -2150 -4371 -2149 -4371 M -3305 -3232 Q -3490 -3309 -3660 -3423 -3759 -3490 -3749 -3599 -3840 -3578 -3924 -3529 L -4176 -3370 Q -4283 -3298 -4400 -3267 -4071 -3134 -3789 -2921 L -3754 -2894 Q -3685 -2956 -3607 -3007 -3451 -3109 -3281 -3189 L -3241 -3208 -3305 -3232";
	ctx.fillStyle=tocolor(ctrans.apply([255,153,0,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M -2961 -5984 Q -2974 -6299 -2705 -6522 -2391 -6783 -1975 -6823 -1782 -6842 -1594 -6798 L -1589 -6797 -1584 -6817 Q -1436 -7082 -1181 -7257 -950 -7415 -666 -7468 -402 -7517 -130 -7504 460 -7476 869 -7077 L 964 -6974 1305 -7012 Q 1543 -7024 1749 -6906 1924 -6806 2053 -6641 2116 -6559 2125 -6464 2153 -6527 2281 -6550 2502 -6589 2714 -6534 3004 -6458 3242 -6283 3460 -6124 3592 -5895 L 3594 -5886 3597 -5887 3600 -5881 3620 -5890 Q 3871 -5921 4103 -5832 4326 -5747 4483 -5569 4646 -5384 4694 -5152 L 4707 -5065 Q 4924 -4939 5071 -4740 5132 -4658 5150 -4555 5162 -4486 5145 -4419 5160 -4443 5197 -4451 5345 -4484 5497 -4487 5799 -4491 6030 -4325 6212 -4194 6297 -3987 6409 -3715 6379 -3434 6367 -3324 6333 -3223 L 6331 -3219 6341 -3215 Q 6500 -3062 6616 -2882 6713 -2728 6761 -2551 6842 -2256 6626 -2058 6539 -1979 6443 -1916 6555 -1794 6607 -1622 6679 -1390 6523 -1226 6379 -1074 6197 -990 6049 -922 5894 -913 6073 -1059 6171 -1271 6251 -1443 6202 -1626 6090 -2039 5755 -2244 5804 -2296 5840 -2361 5892 -2452 5896 -2555 5900 -2693 5793 -2777 L 5663 -2877 Q 5841 -3025 5759 -3247 5709 -3381 5618 -3489 5473 -3661 5249 -3735 4961 -3829 4812 -3622 4848 -3686 4823 -3772 4743 -4035 4546 -4231 4472 -4305 4389 -4356 4392 -4411 4385 -4468 4337 -4832 3977 -4995 3793 -5079 3600 -5120 3383 -5166 3163 -5125 2926 -5082 2740 -4948 L 2721 -4934 2718 -4935 Q 2512 -4993 2300 -5005 2015 -5021 1737 -4951 1429 -4873 1161 -4721 1030 -4785 874 -4816 647 -4861 420 -4854 205 -4847 25 -4739 L -50 -4691 Q -8 -4773 59 -4842 190 -4977 347 -5081 570 -5229 844 -5237 1037 -5242 1202 -5156 1239 -5137 1248 -5142 1492 -5276 1792 -5417 1908 -5471 2028 -5466 2179 -5459 2330 -5424 L 2332 -5423 2330 -5426 Q 2155 -5673 1906 -5831 1636 -6003 1358 -5837 1330 -5819 1314 -5796 1272 -5734 1208 -5718 1248 -5814 1241 -5921 1208 -6454 692 -6677 484 -6766 265 -6784 L 85 -6804 Q -61 -6823 -159 -6733 -205 -6690 -216 -6640 -230 -6569 -282 -6559 -294 -6631 -371 -6679 -678 -6868 -1042 -6766 -1468 -6647 -1697 -6316 L -1701 -6310 Q -1860 -6358 -2020 -6381 -2387 -6435 -2688 -6246 -2790 -6182 -2867 -6099 L -2961 -5984 M 2125 -6464 Q 2108 -6431 2122 -6385 L 2125 -6464 M 2272 -3188 Q 2443 -3162 2589 -3191 2744 -3222 2896 -3159 3094 -3077 3250 -2935 3398 -2801 3500 -2630 3562 -2526 3612 -2414 3474 -2507 3319 -2575 3032 -2700 2758 -2671 2705 -2720 2638 -2759 2395 -2901 2119 -2947 L 1858 -2962 Q 1795 -3131 1658 -3273 1483 -3454 1269 -3581 L 1121 -3664 Q 1344 -3690 1562 -3624 1741 -3570 1905 -3477 2096 -3369 2231 -3207 2242 -3193 2272 -3188 M -2150 -4372 Q -2288 -4528 -2468 -4630 -2628 -4720 -2800 -4785 L -2644 -4820 Q -2379 -4861 -2116 -4804 -1847 -4745 -1631 -4591 -1422 -4441 -1300 -4216 -1250 -4124 -1216 -4025 -1468 -4176 -1749 -4278 -1947 -4350 -2149 -4371 L -2150 -4372";
	ctx.fillStyle=tocolor(ctrans.apply([255,255,153,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 4942 -986 Q 4853 -983 4772 -1013 4715 -1034 4669 -1064 L 4625 -1009 Q 4451 -810 4186 -791 3885 -769 3616 -870 3262 -1001 3041 -1288 2997 -1345 2961 -1407 2901 -1364 2835 -1332 2578 -1204 2287 -1247 1967 -1295 1695 -1452 L 1627 -1370 Q 1513 -1248 1368 -1171 1310 -1139 1243 -1128 1293 -1176 1335 -1230 1406 -1320 1397 -1449 1390 -1538 1344 -1617 1315 -1669 1275 -1718 L 1250 -1745 1274 -1745 Q 1459 -1749 1579 -1913 1635 -1988 1672 -2071 1695 -2119 1695 -2177 1700 -2216 1783 -2145 2123 -1861 2577 -1848 2893 -1839 3156 -2001 3255 -2061 3362 -2088 L 3348 -2057 Q 3337 -2032 3333 -2004 3283 -1646 3589 -1432 3885 -1224 4223 -1356 4458 -1448 4584 -1625 4534 -1261 4848 -1044 L 4942 -986 M 303 -377 L 26 -362 Q -235 -377 -472 -480 -736 -595 -902 -810 -950 -873 -992 -939 -1064 -842 -1207 -787 -1406 -711 -1608 -738 -1847 -769 -2070 -880 L -2131 -920 -2131 -921 -2133 -920 Q -2333 -856 -2524 -945 -2707 -1029 -2864 -1153 -2966 -1050 -3152 -1004 -3337 -958 -3518 -1011 -3615 -1039 -3705 -1082 -3719 -998 -3745 -916 -3793 -755 -3908 -616 -4160 -312 -4539 -378 -4568 -361 -4584 -268 -4614 -87 -4738 48 -4812 131 -4938 149 L -5268 183 Q -5851 213 -6163 -219 -6097 -183 -6025 -155 -5465 58 -5060 -351 -4893 -519 -4933 -755 -4950 -856 -4979 -954 -5005 -1045 -5049 -1120 -4982 -1019 -4781 -1036 -4675 -1045 -4579 -1074 -4478 -1103 -4386 -1160 -4228 -1257 -4196 -1450 -4189 -1494 -4174 -1538 -4171 -1585 -4100 -1523 -4067 -1494 -4022 -1481 -3711 -1392 -3440 -1561 L -3322 -1625 -3262 -1654 Q -3241 -1515 -3100 -1437 -3049 -1407 -2989 -1390 -2710 -1309 -2476 -1456 L -2288 -1567 Q -2237 -1544 -2231 -1453 -2227 -1407 -2193 -1367 -2073 -1225 -1897 -1152 L -1798 -1116 Q -1543 -1038 -1287 -1108 -1117 -1154 -1006 -1242 L -958 -1284 Q -899 -1283 -902 -1189 -904 -1132 -883 -1076 -694 -598 -163 -452 67 -389 303 -377 M -3281 -3189 Q -3451 -3109 -3607 -3007 -3685 -2956 -3754 -2894 L -3789 -2921 Q -4071 -3134 -4400 -3267 -4283 -3298 -4176 -3370 L -3924 -3529 Q -3840 -3578 -3749 -3599 -3759 -3490 -3660 -3423 -3490 -3309 -3305 -3232 L -3281 -3189";
	ctx.fillStyle=tocolor(ctrans.apply([255,51,0,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
}

function shape216(ctx,ctrans,frame,ratio,time){
	var pathData="M 670 -1171 L 587 -671 Q 564 -573 574 -516 616 -284 710 -190 860 -40 1070 290 L 911 241 Q 739 199 670 230 601 261 679 569 711 694 751 815 L 770 870 730 815 634 704 Q 476 536 370 530 264 524 76 806 L 70 815 Q -19 953 -90 1090 -87 938 -97 707 -107 475 -70 363 -33 251 -228 319 L -590 450 Q -387 138 -275 59 -164 -20 -253 -211 L -390 -510 Q -170 -370 40 -300 171 -256 374 -489 428 -551 482 -683 L 561 -1110 670 -1171";
	ctx.fillStyle=tocolor(ctrans.apply([255,51,0,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 275 -198 L 15 -207 Q -43 -217 -107 -240 L -188 -270 -188 -275 M 503 -222 L 382 -325 M 571 508 Q 549 323 422 116 312 -62 241 -96 M 460 -391 Q 295 -310 156 89 64 351 -16 751 M -450 310 Q -381 250 -285 192 -91 76 156 89";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([255,204,102,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

}

function shape56(ctx,ctrans,frame,ratio,time){
	var pathData="M -232 131 Q -271 64 -264 -59 L -263 -59 Q 147 -84 281 -151 294 -2 265 55 -4 44 -232 131";
	ctx.fillStyle=tocolor(ctrans.apply([255,255,255,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 265 55 L 208 122 Q 117 212 -81 210 -187 208 -232 131 -4 44 265 55";
	ctx.fillStyle=tocolor(ctrans.apply([204,51,102,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 281 -151 L 283 -152 Q 334 -179 343 -211 M 265 55 L 208 122 Q 117 212 -81 210 -187 208 -232 131 -271 64 -264 -59 L -343 -57 M 265 55 Q 294 -2 281 -151 147 -84 -263 -59 L -264 -59";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([229,100,14,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

}

function sprite217(ctx,ctrans,frame,ratio,time){
	var clips = [];
	var frame_cnt = 90;
	frame = frame % frame_cnt;
	switch(frame){
		case 0:
			place("shape216",middle_canvas,ctx,[0.5454254150390625,0.0,0.0,0.5454254150390625,-211.0,262.0],ctrans,1,0,0,time);
			break;
		case 1:
			place("shape216",middle_canvas,ctx,[0.5454254150390625,0.0,0.0,0.5454254150390625,-369.0,484.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,254)),1,0,0,time);
			break;
		case 2:
			place("shape216",middle_canvas,ctx,[0.5454254150390625,0.0,0.0,0.5454254150390625,-536.0,701.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,253)),1,0,0,time);
			break;
		case 3:
			place("shape216",middle_canvas,ctx,[0.5454254150390625,0.0,0.0,0.5454254150390625,-711.0,912.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,251)),1,0,0,time);
			break;
		case 4:
			place("shape216",middle_canvas,ctx,[0.5454254150390625,0.0,0.0,0.5454254150390625,-892.0,1116.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,250)),1,0,0,time);
			break;
		case 5:
			place("shape216",middle_canvas,ctx,[0.5454254150390625,0.0,0.0,0.5454254150390625,-1079.0,1314.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,248)),1,0,0,time);
			break;
		case 6:
			place("shape216",middle_canvas,ctx,[0.5454254150390625,0.0,0.0,0.5454254150390625,-1271.0,1506.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,246)),1,0,0,time);
			break;
		case 7:
			place("shape216",middle_canvas,ctx,[0.5454254150390625,0.0,0.0,0.5454254150390625,-1468.0,1693.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,245)),1,0,0,time);
			break;
		case 8:
			place("shape216",middle_canvas,ctx,[0.5454254150390625,0.0,0.0,0.5454254150390625,-1670.0,1875.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,243)),1,0,0,time);
			break;
		case 9:
			place("shape216",middle_canvas,ctx,[0.5454254150390625,0.0,0.0,0.5454254150390625,-1877.0,2050.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,242)),1,0,0,time);
			break;
		case 10:
			place("shape216",middle_canvas,ctx,[0.5454254150390625,0.0,0.0,0.5454254150390625,-2089.0,2220.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,240)),1,0,0,time);
			break;
		case 11:
			place("shape216",middle_canvas,ctx,[0.5454254150390625,0.0,0.0,0.5454254150390625,-2306.0,2383.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,239)),1,0,0,time);
			break;
		case 12:
			place("shape216",middle_canvas,ctx,[0.5454254150390625,0.0,0.0,0.5454254150390625,-2527.0,2540.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,237)),1,0,0,time);
			break;
		case 13:
			place("shape216",middle_canvas,ctx,[0.5454254150390625,0.0,0.0,0.5454254150390625,-2753.0,2689.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,235)),1,0,0,time);
			break;
		case 14:
			place("shape216",middle_canvas,ctx,[0.5454254150390625,0.0,0.0,0.5454254150390625,-2983.0,2830.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,234)),1,0,0,time);
			break;
		case 15:
			place("shape216",middle_canvas,ctx,[0.5454254150390625,0.0,0.0,0.5454254150390625,-3218.0,2962.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,232)),1,0,0,time);
			break;
		case 16:
			place("shape216",middle_canvas,ctx,[0.5454254150390625,0.0,0.0,0.5454254150390625,-3460.0,3085.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,231)),1,0,0,time);
			break;
		case 17:
			place("shape216",middle_canvas,ctx,[0.5454254150390625,0.0,0.0,0.5454254150390625,-3708.0,3196.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,229)),1,0,0,time);
			break;
		case 18:
			place("shape216",middle_canvas,ctx,[0.5454254150390625,0.0,0.0,0.5454254150390625,-3959.0,3292.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,227)),1,0,0,time);
			break;
		case 19:
			place("shape216",middle_canvas,ctx,[0.5454254150390625,0.0,0.0,0.5454254150390625,-4215.0,3371.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,226)),1,0,0,time);
			break;
		case 20:
			place("shape216",middle_canvas,ctx,[0.5454254150390625,0.0,0.0,0.5454254150390625,-4477.0,3429.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,224)),1,0,0,time);
			break;
		case 21:
			place("shape216",middle_canvas,ctx,[0.5454254150390625,0.0,0.0,0.5454254150390625,-4746.0,3459.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,223)),1,0,0,time);
			break;
		case 22:
			place("shape216",middle_canvas,ctx,[0.5454254150390625,0.0,0.0,0.5454254150390625,-5014.0,3457.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,221)),1,0,0,time);
			break;
		case 23:
			place("shape216",middle_canvas,ctx,[0.5454254150390625,0.0,0.0,0.5454254150390625,-5278.0,3423.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,220)),1,0,0,time);
			break;
		case 24:
			place("shape216",middle_canvas,ctx,[0.5454254150390625,0.0,0.0,0.5454254150390625,-5533.0,3342.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,218)),1,0,0,time);
			break;
		case 25:
			place("shape216",middle_canvas,ctx,[0.5454254150390625,0.0,0.0,0.5454254150390625,-5758.0,3195.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,216)),1,0,0,time);
			break;
		case 26:
			place("shape216",middle_canvas,ctx,[0.5454254150390625,0.0,0.0,0.5454254150390625,-5912.0,2975.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,215)),1,0,0,time);
			break;
		case 27:
			place("shape216",middle_canvas,ctx,[0.5454254150390625,0.0,0.0,0.5454254150390625,-5970.0,2708.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,213)),1,0,0,time);
			break;
		case 28:
			place("shape216",middle_canvas,ctx,[0.5454254150390625,0.0,0.0,0.5454254150390625,-5943.0,2440.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,212)),1,0,0,time);
			break;
		case 29:
			place("shape216",middle_canvas,ctx,[0.5454254150390625,0.0,0.0,0.5454254150390625,-5827.0,2196.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,210)),1,0,0,time);
			break;
		case 30:
			place("shape216",middle_canvas,ctx,[0.5454254150390625,0.0,0.0,0.5454254150390625,-5631.0,2006.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,208)),1,0,0,time);
			break;
		case 31:
			place("shape216",middle_canvas,ctx,[0.5454254150390625,0.0,0.0,0.5454254150390625,-5391.0,1878.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,207)),1,0,0,time);
			break;
		case 32:
			place("shape216",middle_canvas,ctx,[0.5454254150390625,0.0,0.0,0.5454254150390625,-5125.0,1807.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,205)),1,0,0,time);
			break;
		case 33:
			place("shape216",middle_canvas,ctx,[0.5454254150390625,0.0,0.0,0.5454254150390625,-4853.0,1782.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,204)),1,0,0,time);
			break;
		case 34:
			place("shape216",middle_canvas,ctx,[0.5454254150390625,0.0,0.0,0.5454254150390625,-4584.0,1787.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,202)),1,0,0,time);
			break;
		case 35:
			place("shape216",middle_canvas,ctx,[0.5454254150390625,0.0,0.0,0.5454254150390625,-4319.0,1807.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,201)),1,0,0,time);
			break;
		case 36:
			place("shape216",middle_canvas,ctx,[0.5454254150390625,0.0,0.0,0.5454254150390625,-4056.0,1856.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,199)),1,0,0,time);
			break;
		case 37:
			place("shape216",middle_canvas,ctx,[0.5454254150390625,0.0,0.0,0.5454254150390625,-3809.0,1959.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,197)),1,0,0,time);
			break;
		case 38:
			place("shape216",middle_canvas,ctx,[0.5454254150390625,0.0,0.0,0.5454254150390625,-3621.0,2151.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,196)),1,0,0,time);
			break;
		case 39:
			place("shape216",middle_canvas,ctx,[0.5454254150390625,0.0,0.0,0.5454254150390625,-3530.0,2410.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,194)),1,0,0,time);
			break;
		case 40:
			place("shape216",middle_canvas,ctx,[0.5454254150390625,0.0,0.0,0.5454254150390625,-3499.0,2687.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,193)),1,0,0,time);
			break;
		case 41:
			place("shape216",middle_canvas,ctx,[0.5454254150390625,0.0,0.0,0.5454254150390625,-3492.0,2967.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,191)),1,0,0,time);
			break;
		case 42:
			place("shape216",middle_canvas,ctx,[0.5454254150390625,0.0,0.0,0.5454254150390625,-3493.0,3241.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,189)),1,0,0,time);
			break;
		case 43:
			place("shape216",middle_canvas,ctx,[0.5454254150390625,0.0,0.0,0.5454254150390625,-3550.0,3514.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,188)),1,0,0,time);
			break;
		case 44:
			place("shape216",middle_canvas,ctx,[0.5454254150390625,0.0,0.0,0.5454254150390625,-3647.0,3775.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,186)),1,0,0,time);
			break;
		case 45:
			place("shape216",middle_canvas,ctx,[0.5454254150390625,0.0,0.0,0.5454254150390625,-3764.0,4023.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,185)),1,0,0,time);
			break;
		case 46:
			place("shape216",middle_canvas,ctx,[0.5454254150390625,0.0,0.0,0.5454254150390625,-3893.0,4265.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,183)),1,0,0,time);
			break;
		case 47:
			place("shape216",middle_canvas,ctx,[0.5454254150390625,0.0,0.0,0.5454254150390625,-4033.0,4502.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,182)),1,0,0,time);
			break;
		case 48:
			place("shape216",middle_canvas,ctx,[0.5454254150390625,0.0,0.0,0.5454254150390625,-4180.0,4732.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,180)),1,0,0,time);
			break;
		case 49:
			place("shape216",middle_canvas,ctx,[0.5454254150390625,0.0,0.0,0.5454254150390625,-4333.0,4958.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,178)),1,0,0,time);
			break;
		case 50:
			place("shape216",middle_canvas,ctx,[0.5454254150390625,0.0,0.0,0.5454254150390625,-4491.0,5178.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,177)),1,0,0,time);
			break;
		case 51:
			place("shape216",middle_canvas,ctx,[0.5454254150390625,0.0,0.0,0.5454254150390625,-4654.0,5393.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,175)),1,0,0,time);
			break;
		case 52:
			place("shape216",middle_canvas,ctx,[0.5454254150390625,0.0,0.0,0.5454254150390625,-4823.0,5604.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,174)),1,0,0,time);
			break;
		case 53:
			place("shape216",middle_canvas,ctx,[0.5454254150390625,0.0,0.0,0.5454254150390625,-5000.0,5808.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,172)),1,0,0,time);
			break;
		case 54:
			place("shape216",middle_canvas,ctx,[0.5454254150390625,0.0,0.0,0.5454254150390625,-5181.0,5999.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,170)),1,0,0,time);
			break;
		case 55:
			place("shape216",middle_canvas,ctx,[0.5454254150390625,0.0,0.0,0.5454254150390625,-5383.0,6167.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,169)),1,0,0,time);
			break;
		case 56:
			place("shape216",middle_canvas,ctx,[0.5454254150390625,0.0,0.0,0.5454254150390625,-5646.0,6258.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,167)),1,0,0,time);
			break;
		case 57:
			place("shape216",middle_canvas,ctx,[0.5454254150390625,0.0,0.0,0.5454254150390625,-5928.0,6303.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,166)),1,0,0,time);
			break;
		case 58:
			place("shape216",middle_canvas,ctx,[0.5454254150390625,0.0,0.0,0.5454254150390625,-6208.0,6326.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,164)),1,0,0,time);
			break;
		case 59:
			place("shape216",middle_canvas,ctx,[0.5454254150390625,0.0,0.0,0.5454254150390625,-6483.0,6336.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,163)),1,0,0,time);
			break;
		case 60:
			place("shape216",middle_canvas,ctx,[0.5454254150390625,0.0,0.0,0.5454254150390625,-6758.0,6337.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,161)),1,0,0,time);
			break;
		case 61:
			place("shape216",middle_canvas,ctx,[0.5454254150390625,0.0,0.0,0.5454254150390625,-7037.0,6334.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,159)),1,0,0,time);
			break;
		case 62:
			place("shape216",middle_canvas,ctx,[0.5454254150390625,0.0,0.0,0.5454254150390625,-7315.0,6329.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,158)),1,0,0,time);
			break;
		case 63:
			place("shape216",middle_canvas,ctx,[0.5454254150390625,0.0,0.0,0.5454254150390625,-7588.0,6324.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,156)),1,0,0,time);
			break;
		case 64:
			place("shape216",middle_canvas,ctx,[0.5454254150390625,0.0,0.0,0.5454254150390625,-7854.0,6326.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,155)),1,0,0,time);
			break;
		case 65:
			place("shape216",middle_canvas,ctx,[0.5454254150390625,0.0,0.0,0.5454254150390625,-8121.0,6336.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,153)),1,0,0,time);
			break;
		case 66:
			place("shape216",middle_canvas,ctx,[0.5454254150390625,0.0,0.0,0.5454254150390625,-8388.0,6358.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,151)),1,0,0,time);
			break;
		case 67:
			place("shape216",middle_canvas,ctx,[0.5454254150390625,0.0,0.0,0.5454254150390625,-8650.0,6384.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,150)),1,0,0,time);
			break;
		case 68:
			place("shape216",middle_canvas,ctx,[0.5454254150390625,0.0,0.0,0.5454254150390625,-8912.0,6413.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,148)),1,0,0,time);
			break;
		case 69:
			place("shape216",middle_canvas,ctx,[0.5454254150390625,0.0,0.0,0.5454254150390625,-9175.0,6446.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,147)),1,0,0,time);
			break;
		case 70:
			place("shape216",middle_canvas,ctx,[0.5454254150390625,0.0,0.0,0.5454254150390625,-9439.0,6488.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,145)),1,0,0,time);
			break;
		case 71:
			place("shape216",middle_canvas,ctx,[0.5454254150390625,0.0,0.0,0.5454254150390625,-9702.0,6545.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,144)),1,0,0,time);
			break;
		case 72:
			place("shape216",middle_canvas,ctx,[0.5454254150390625,0.0,0.0,0.5454254150390625,-9958.0,6623.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,142)),1,0,0,time);
			break;
		case 73:
			place("shape216",middle_canvas,ctx,[0.5454254150390625,0.0,0.0,0.5454254150390625,-10207.0,6727.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,140)),1,0,0,time);
			break;
		case 74:
			place("shape216",middle_canvas,ctx,[0.5454254150390625,0.0,0.0,0.5454254150390625,-10442.0,6863.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,139)),1,0,0,time);
			break;
		case 75:
			place("shape216",middle_canvas,ctx,[0.5454254150390625,0.0,0.0,0.5454254150390625,-10658.0,7032.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,137)),1,0,0,time);
			break;
		case 76:
			place("shape216",middle_canvas,ctx,[0.5454254150390625,0.0,0.0,0.5454254150390625,-10853.0,7224.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,136)),1,0,0,time);
			break;
		case 77:
			place("shape216",middle_canvas,ctx,[0.5454254150390625,0.0,0.0,0.5454254150390625,-11029.0,7434.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,134)),1,0,0,time);
			break;
		case 78:
			place("shape216",middle_canvas,ctx,[0.5454254150390625,0.0,0.0,0.5454254150390625,-11191.0,7658.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,132)),1,0,0,time);
			break;
		case 79:
			place("shape216",middle_canvas,ctx,[0.5454254150390625,0.0,0.0,0.5454254150390625,-11342.0,7893.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,131)),1,0,0,time);
			break;
		case 80:
			place("shape216",middle_canvas,ctx,[0.5454254150390625,0.0,0.0,0.5454254150390625,-11483.0,8132.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,129)),1,0,0,time);
			break;
		case 81:
			place("shape216",middle_canvas,ctx,[0.5454254150390625,0.0,0.0,0.5454254150390625,-11617.0,8373.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,128)),1,0,0,time);
			break;
		case 82:
			place("shape216",middle_canvas,ctx,[0.5454254150390625,0.0,0.0,0.5454254150390625,-11745.0,8614.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,126)),1,0,0,time);
			break;
		case 83:
			place("shape216",middle_canvas,ctx,[0.5454254150390625,0.0,0.0,0.5454254150390625,-11811.0,8871.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,125)),1,0,0,time);
			break;
		case 84:
			place("shape216",middle_canvas,ctx,[0.5454254150390625,0.0,0.0,0.5454254150390625,-11811.0,9143.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,123)),1,0,0,time);
			break;
		case 85:
			place("shape216",middle_canvas,ctx,[0.5454254150390625,0.0,0.0,0.5454254150390625,-11811.0,9415.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,121)),1,0,0,time);
			break;
		case 86:
			place("shape216",middle_canvas,ctx,[0.5454254150390625,0.0,0.0,0.5454254150390625,-11811.0,9687.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,120)),1,0,0,time);
			break;
		case 87:
			place("shape216",middle_canvas,ctx,[0.5454254150390625,0.0,0.0,0.5454254150390625,-11811.0,9958.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,118)),1,0,0,time);
			break;
		case 88:
			place("shape216",middle_canvas,ctx,[0.5454254150390625,0.0,0.0,0.5454254150390625,-11811.0,10230.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,117)),1,0,0,time);
			break;
		case 89:
			place("shape216",middle_canvas,ctx,[0.5454254150390625,0.0,0.0,0.5454254150390625,-11811.0,10502.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,115)),1,0,0,time);
			break;
	}
}

function shape57(ctx,ctrans,frame,ratio,time){
	var pathData="M -244 138 Q -285 67 -277 -62 L -276 -62 Q 154 -88 295 -159 309 -2 278 58 -4 46 -244 138";
	ctx.fillStyle=tocolor(ctrans.apply([255,255,255,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 278 58 L 218 128 Q 123 223 -85 220 -196 218 -244 138 -4 46 278 58";
	ctx.fillStyle=tocolor(ctrans.apply([204,51,102,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 295 -159 L 297 -160 Q 351 -188 360 -222 M 278 58 L 218 128 Q 123 223 -85 220 -196 218 -244 138 -285 67 -277 -62 L -360 -60 M 278 58 Q 309 -2 295 -159 154 -88 -276 -62 L -277 -62";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([229,100,14,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

}

function shape218(ctx,ctrans,frame,ratio,time){
	var pathData="M -745 -457 Q -713 -997 -477 -1230 L 50 -1222 131 -308 -745 -457";
	ctx.fillStyle=tocolor(ctrans.apply([255,235,208,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M -745 -457 L 131 -308 50 -1222 -477 -1230";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([229,100,14,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M -477 -1230 Q -713 -997 -745 -457 Z";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([229,100,14,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

}

function sprite58(ctx,ctrans,frame,ratio,time){
	var clips = [];
	var frame_cnt = 8;
	frame = frame % frame_cnt;
	switch(frame){
		case 0:
			place("shape56",middle_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
		case 1:
			place("shape56",middle_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
		case 2:
			place("shape56",middle_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
		case 3:
			place("shape56",middle_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
		case 4:
			place("shape56",middle_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
		case 5:
			place("shape57",middle_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
		case 6:
			place("shape57",middle_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
		case 7:
			place("shape57",middle_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
	}
}

function shape219(ctx,ctrans,frame,ratio,time){
	var pathData="M -298 584 Q -289 137 -376 -327 -464 -792 -302 -1026 L -106 -924 Q -56 -471 -88 -91 -124 445 -56 600 220 793 381 852 L 391 872 394 881 Q 480 1108 2 980 -353 945 -340 755 -307 677 -298 584";
	ctx.fillStyle=tocolor(ctrans.apply([255,235,208,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M -298 584 Q -289 137 -376 -327 -464 -792 -302 -1026 L -106 -924 Q -56 -471 -88 -91 -124 445 -56 600 220 793 381 852 L 391 872 394 881 Q 480 1108 2 980";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([229,100,14,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M 2 980 Q -353 945 -340 755 -307 677 -298 584 Z";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([229,100,14,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

}

function shape59(ctx,ctrans,frame,ratio,time){
	var pathData="M -819 -350 Q -668 -443 -493 -404 -318 -365 -222 -216 -128 -67 -167 106 -207 279 -358 373 -509 467 -684 428 -859 389 -955 239 -1049 90 -1009 -83 -970 -256 -819 -350";
	ctx.fillStyle=tocolor(ctrans.apply([255,255,255,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M -819 -350 Q -668 -443 -493 -404 -318 -365 -222 -216 -128 -67 -167 106 -207 279 -358 373 -509 467 -684 428 -859 389 -955 239 -1049 90 -1009 -83 -970 -256 -819 -350 Z";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([229,100,14,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M -439 -388 Q -300 -344 -234 -214 -167 -86 -213 54 -257 191 -388 257 -520 323 -658 279 -799 233 -865 105 -932 -25 -887 -163 -842 -301 -710 -367 -579 -434 -439 -388";
	var grd=ctx.createLinearGradient(-388.0,258.75,-710.0,-364.75);
	grd.addColorStop(0.0,tocolor(ctrans.apply([131,186,1,1])));
	grd.addColorStop(1.0,tocolor(ctrans.apply([27,150,12,1])));
	ctx.fillStyle = grd;
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 439 -217 Q 485 -351 599 -408 713 -466 830 -414 946 -361 996 -231 1046 -100 1000 34 955 168 841 225 727 283 611 230 494 178 444 48 394 -83 439 -217";
	ctx.fillStyle=tocolor(ctrans.apply([255,255,255,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 439 -217 Q 485 -351 599 -408 713 -466 830 -414 946 -361 996 -231 1046 -100 1000 34 955 168 841 225 727 283 611 230 494 178 444 48 394 -83 439 -217 Z";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([229,100,14,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M 947 -305 Q 1009 -211 995 -93 979 26 897 96 814 166 711 150 609 133 547 38 485 -58 500 -175 515 -293 598 -363 681 -433 783 -417 885 -400 947 -305";
	var grd=ctx.createLinearGradient(711.25,149.5,782.75,-417.5);
	grd.addColorStop(0.0,tocolor(ctrans.apply([131,186,1,1])));
	grd.addColorStop(1.0,tocolor(ctrans.apply([27,150,12,1])));
	ctx.fillStyle = grd;
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
}

function sprite220(ctx,ctrans,frame,ratio,time){
	var clips = [];
	var frame_cnt = 1;
	frame = frame % frame_cnt;
	switch(frame){
		case 0:
			place("shape219",middle_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
	}
}

function shape60(ctx,ctrans,frame,ratio,time){
	var pathData="M -819 -350 Q -668 -443 -493 -404 -318 -365 -222 -216 -128 -67 -167 106 -207 279 -358 373 -509 467 -684 428 -859 389 -955 239 -1049 90 -1009 -83 -970 -256 -819 -350";
	ctx.fillStyle=tocolor(ctrans.apply([255,255,255,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M -819 -350 Q -668 -443 -493 -404 -318 -365 -222 -216 -128 -67 -167 106 -207 279 -358 373 -509 467 -684 428 -859 389 -955 239 -1049 90 -1009 -83 -970 -256 -819 -350 Z";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([229,100,14,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M -439 -388 Q -300 -344 -234 -214 -167 -86 -213 54 -257 191 -388 257 -520 323 -658 279 -799 233 -865 105 -932 -25 -887 -163 -842 -301 -710 -367 -579 -434 -439 -388";
	var grd=ctx.createLinearGradient(-388.0,258.75,-710.0,-364.75);
	grd.addColorStop(0.0,tocolor(ctrans.apply([131,186,1,1])));
	grd.addColorStop(1.0,tocolor(ctrans.apply([27,150,12,1])));
	ctx.fillStyle = grd;
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 439 -217 Q 485 -351 599 -408 713 -466 830 -414 946 -361 996 -231 1046 -100 1000 34 955 168 841 225 727 283 611 230 494 178 444 48 394 -83 439 -217";
	ctx.fillStyle=tocolor(ctrans.apply([255,255,255,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 439 -217 Q 485 -351 599 -408 713 -466 830 -414 946 -361 996 -231 1046 -100 1000 34 955 168 841 225 727 283 611 230 494 178 444 48 394 -83 439 -217 Z";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([229,100,14,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M 947 -305 Q 1009 -211 995 -93 979 26 897 96 814 166 711 150 609 133 547 38 485 -58 500 -175 515 -293 598 -363 681 -433 783 -417 885 -400 947 -305";
	var grd=ctx.createLinearGradient(711.25,149.5,782.75,-417.5);
	grd.addColorStop(0.0,tocolor(ctrans.apply([131,186,1,1])));
	grd.addColorStop(1.0,tocolor(ctrans.apply([27,150,12,1])));
	ctx.fillStyle = grd;
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M -7 24 Q -633 -252 -1223 183 -1145 -435 -465 -480 -34 -502 -7 24";
	ctx.fillStyle=tocolor(ctrans.apply([255,235,208,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 1015 -235 Q 628 -369 359 78 312 -486 689 -590 929 -650 1015 -235";
	ctx.fillStyle=tocolor(ctrans.apply([255,235,208,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
}

function shape221(ctx,ctrans,frame,ratio,time){
	var pathData="M 262 -1159 Q 239 -652 138 -233 5 361 43 570 94 845 156 967 219 1088 212 1163 135 1358 -105 1234 -287 1113 -260 741 -238 610 -212 507 -123 10 -140 -510 -157 -1031 62 -1282 L 262 -1159";
	ctx.fillStyle=tocolor(ctrans.apply([255,235,208,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 262 -1159 Q 239 -652 138 -233 5 361 43 570 94 845 156 967 219 1088 212 1163 135 1358 -105 1234 -287 1113 -260 741 -238 610 -212 507 -123 10 -140 -510 -157 -1031 62 -1282 L 262 -1159 Z";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([229,100,14,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

}

function shape61(ctx,ctrans,frame,ratio,time){
	var pathData="M 488 117 Q 760 -96 1006 39 M -976 330 Q -608 32 -130 209";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([229,100,14,1]));
	ctx.lineWidth=1.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

}

function sprite222(ctx,ctrans,frame,ratio,time){
	var clips = [];
	var frame_cnt = 1;
	frame = frame % frame_cnt;
	switch(frame){
		case 0:
			place("shape221",middle_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
	}
}

function sprite62(ctx,ctrans,frame,ratio,time){
	var clips = [];
	var frame_cnt = 18;
	frame = frame % frame_cnt;
	switch(frame){
		case 0:
			place("shape59",middle_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
		case 1:
			place("shape59",middle_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
		case 2:
			place("shape59",middle_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
		case 3:
			place("shape59",middle_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
		case 4:
			place("shape59",middle_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
		case 5:
			place("shape59",middle_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
		case 6:
			place("shape59",middle_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
		case 7:
			place("shape59",middle_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
		case 8:
			place("shape59",middle_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
		case 9:
			place("shape59",middle_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
		case 10:
			place("shape59",middle_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
		case 11:
			place("shape60",middle_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
		case 12:
			place("shape60",middle_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
		case 13:
			place("shape61",middle_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
		case 14:
			place("shape61",middle_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
		case 15:
			place("shape61",middle_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
		case 16:
			place("shape61",middle_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
		case 17:
			place("shape61",middle_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
	}
}

function sprite223(ctx,ctrans,frame,ratio,time){
	var clips = [];
	var frame_cnt = 24;
	frame = frame % frame_cnt;
	switch(frame){
		case 0:
			place("sprite220",middle_canvas,ctx,[1.0,0.0,0.0,1.0,463.0,-379.0],ctrans,1,(0+time)%1,0,time);
			place("sprite222",middle_canvas,ctx,[0.9946136474609375,0.091278076171875,-0.091278076171875,0.9946136474609375,-596.0,151.0],ctrans,1,(0+time)%1,0,time);
			break;
		case 1:
			place("sprite220",middle_canvas,ctx,[0.9988555908203125,0.03582763671875,-0.03582763671875,0.9988555908203125,423.0,-367.0],ctrans,1,(0+time)%1,0,time);
			place("sprite222",middle_canvas,ctx,[0.9971771240234375,0.0525054931640625,-0.0525054931640625,0.9971771240234375,-560.0,148.0],ctrans,1,(0+time)%1,0,time);
			break;
		case 2:
			place("sprite220",middle_canvas,ctx,[0.996185302734375,0.0748443603515625,-0.0748443603515625,0.996185302734375,382.0,-356.0],ctrans,1,(0+time)%1,0,time);
			place("sprite222",middle_canvas,ctx,[0.99853515625,0.013580322265625,-0.013580322265625,0.99853515625,-524.0,145.0],ctrans,1,(0+time)%1,0,time);
			break;
		case 3:
			place("sprite220",middle_canvas,ctx,[0.99200439453125,0.1137237548828125,-0.1137237548828125,0.99200439453125,339.0,-345.0],ctrans,1,(0+time)%1,0,time);
			place("sprite222",middle_canvas,ctx,[0.998291015625,-0.0221099853515625,0.0221099853515625,0.998291015625,-492.0,139.0],ctrans,1,(0+time)%1,0,time);
			break;
		case 4:
			place("sprite220",middle_canvas,ctx,[0.986297607421875,0.1523895263671875,-0.1523895263671875,0.986297607421875,297.0,-337.0],ctrans,1,(0+time)%1,0,time);
			place("sprite222",middle_canvas,ctx,[0.996490478515625,-0.061004638671875,0.061004638671875,0.996490478515625,-456.0,132.0],ctrans,1,(0+time)%1,0,time);
			break;
		case 5:
			place("sprite220",middle_canvas,ctx,[0.9790802001953125,0.1907958984375,-0.1907958984375,0.9790802001953125,253.0,-329.0],ctrans,1,(0+time)%1,0,time);
			place("sprite222",middle_canvas,ctx,[0.993499755859375,-0.0965728759765625,0.0965728759765625,0.993499755859375,-422.0,123.0],ctrans,1,(0+time)%1,0,time);
			break;
		case 6:
			place("sprite220",middle_canvas,ctx,[0.97039794921875,0.2288818359375,-0.2288818359375,0.97039794921875,212.0,-323.0],ctrans,1,(0+time)%1,0,time);
			place("sprite222",middle_canvas,ctx,[0.9887847900390625,-0.13525390625,0.13525390625,0.9887847900390625,-385.0,113.0],ctrans,1,(0+time)%1,0,time);
			break;
		case 7:
			place("sprite220",middle_canvas,ctx,[0.960205078125,0.2666015625,-0.2666015625,0.960205078125,169.0,-317.0],ctrans,1,(0+time)%1,0,time);
			place("sprite222",middle_canvas,ctx,[0.9825897216796875,-0.1737060546875,0.1737060546875,0.9825897216796875,-348.0,101.0],ctrans,1,(0+time)%1,0,time);
			break;
		case 8:
			place("sprite220",middle_canvas,ctx,[0.9495697021484375,0.3007659912109375,-0.3007659912109375,0.9495697021484375,130.0,-314.0],ctrans,1,(0+time)%1,0,time);
			place("sprite222",middle_canvas,ctx,[0.9748687744140625,-0.2118988037109375,0.2118988037109375,0.9748687744140625,-312.0,88.0],ctrans,1,(0+time)%1,0,time);
			break;
		case 9:
			place("sprite220",middle_canvas,ctx,[0.9365997314453125,0.33758544921875,-0.33758544921875,0.9365997314453125,86.0,-312.0],ctrans,1,(0+time)%1,0,time);
			place("sprite222",middle_canvas,ctx,[0.966522216796875,-0.2466278076171875,0.2466278076171875,0.966522216796875,-279.0,73.0],ctrans,1,(0+time)%1,0,time);
			break;
		case 10:
			place("sprite220",middle_canvas,ctx,[0.9222259521484375,0.3738555908203125,-0.3738555908203125,0.9222259521484375,44.0,-309.0],ctrans,1,(0+time)%1,0,time);
			place("sprite222",middle_canvas,ctx,[0.95599365234375,-0.28411865234375,0.28411865234375,0.95599365234375,-243.0,56.0],ctrans,1,(0+time)%1,0,time);
			break;
		case 11:
			place("sprite220",middle_canvas,ctx,[0.9070892333984375,0.4110870361328125,-0.4110870361328125,0.9070892333984375,-3.0,-306.0],ctrans,1,(0+time)%1,0,time);
			place("sprite222",middle_canvas,ctx,[0.9446868896484375,-0.32232666015625,0.32232666015625,0.9446868896484375,-203.0,38.0],ctrans,1,(0+time)%1,0,time);
			break;
		case 12:
			place("sprite220",middle_canvas,ctx,[0.920623779296875,0.37762451171875,-0.37762451171875,0.920623779296875,37.0,-308.0],ctrans,1,(0+time)%1,0,time);
			place("sprite222",middle_canvas,ctx,[0.9547882080078125,-0.2880401611328125,0.2880401611328125,0.9547882080078125,-236.0,54.0],ctrans,1,(0+time)%1,0,time);
			break;
		case 13:
			place("sprite220",middle_canvas,ctx,[0.9337310791015625,0.34521484375,-0.34521484375,0.9337310791015625,75.0,-309.0],ctrans,1,(0+time)%1,0,time);
			place("sprite222",middle_canvas,ctx,[0.964447021484375,-0.2545013427734375,0.2545013427734375,0.964447021484375,-268.0,69.0],ctrans,1,(0+time)%1,0,time);
			break;
		case 14:
			place("sprite220",middle_canvas,ctx,[0.9456787109375,0.3123321533203125,-0.3123321533203125,0.9456787109375,113.0,-310.0],ctrans,1,(0+time)%1,0,time);
			place("sprite222",middle_canvas,ctx,[0.972930908203125,-0.2206573486328125,0.2206573486328125,0.972930908203125,-302.0,83.0],ctrans,1,(0+time)%1,0,time);
			break;
		case 15:
			place("sprite220",middle_canvas,ctx,[0.9564666748046875,0.279083251953125,-0.279083251953125,0.9564666748046875,153.0,-315.0],ctrans,1,(0+time)%1,0,time);
			place("sprite222",middle_canvas,ctx,[0.9801788330078125,-0.1865081787109375,0.1865081787109375,0.9801788330078125,-334.0,95.0],ctrans,1,(0+time)%1,0,time);
			break;
		case 16:
			place("sprite220",middle_canvas,ctx,[0.9669189453125,0.242279052734375,-0.242279052734375,0.9669189453125,194.0,-318.0],ctrans,1,(0+time)%1,0,time);
			place("sprite222",middle_canvas,ctx,[0.9862823486328125,-0.1521453857421875,0.1521453857421875,0.9862823486328125,-367.0,107.0],ctrans,1,(0+time)%1,0,time);
			break;
		case 17:
			place("sprite220",middle_canvas,ctx,[0.9752655029296875,0.2082977294921875,-0.2082977294921875,0.9752655029296875,233.0,-323.0],ctrans,1,(0+time)%1,0,time);
			place("sprite222",middle_canvas,ctx,[0.9911346435546875,-0.117584228515625,0.117584228515625,0.9911346435546875,-399.0,117.0],ctrans,1,(0+time)%1,0,time);
			break;
		case 18:
			place("sprite220",middle_canvas,ctx,[0.982421875,0.174041748046875,-0.174041748046875,0.982421875,270.0,-329.0],ctrans,1,(0+time)%1,0,time);
			place("sprite222",middle_canvas,ctx,[0.99481201171875,-0.0829010009765625,0.0829010009765625,0.99481201171875,-432.0,126.0],ctrans,1,(0+time)%1,0,time);
			break;
		case 19:
			place("sprite220",middle_canvas,ctx,[0.988372802734375,0.1395263671875,-0.1395263671875,0.988372802734375,308.0,-337.0],ctrans,1,(0+time)%1,0,time);
			place("sprite222",middle_canvas,ctx,[0.9972686767578125,-0.048065185546875,0.048065185546875,0.9972686767578125,-465.0,134.0],ctrans,1,(0+time)%1,0,time);
			break;
		case 20:
			place("sprite220",middle_canvas,ctx,[0.99310302734375,0.104827880859375,-0.104827880859375,0.99310302734375,347.0,-344.0],ctrans,1,(0+time)%1,0,time);
			place("sprite222",middle_canvas,ctx,[0.998504638671875,-0.013214111328125,0.013214111328125,0.998504638671875,-498.0,139.0],ctrans,1,(0+time)%1,0,time);
			break;
		case 21:
			place("sprite220",middle_canvas,ctx,[0.996612548828125,0.0699920654296875,-0.0699920654296875,0.996612548828125,385.0,-355.0],ctrans,1,(0+time)%1,0,time);
			place("sprite222",middle_canvas,ctx,[0.9984588623046875,0.0184326171875,-0.0184326171875,0.9984588623046875,-526.0,146.0],ctrans,1,(0+time)%1,0,time);
			break;
		case 22:
			place("sprite220",middle_canvas,ctx,[0.998931884765625,0.0350189208984375,-0.0350189208984375,0.998931884765625,424.0,-365.0],ctrans,1,(0+time)%1,0,time);
			place("sprite222",middle_canvas,ctx,[0.997161865234375,0.05328369140625,-0.05328369140625,0.997161865234375,-558.0,147.0],ctrans,1,(0+time)%1,0,time);
			break;
		case 23:
			place("sprite220",middle_canvas,ctx,[1.0,0.0,0.0,1.0,463.0,-379.0],ctrans,1,(0+time)%1,0,time);
			place("sprite222",middle_canvas,ctx,[0.9946136474609375,0.091278076171875,-0.091278076171875,0.9946136474609375,-596.0,151.0],ctrans,1,(0+time)%1,0,time);
			break;
	}
}

function sprite228(ctx,ctrans,frame,ratio,time){
	ctx.save();
	ctx.transform(1,0,0,1,457.2,335.75);
	var clips = [];
	var frame_cnt = 1;
	frame = frame % frame_cnt;
	switch(frame){
		case 0:
			place("shape211",middle_canvas,ctx,[0.05,0.0,0.0,0.05,0.0,0.0],ctrans,1,0,0,time);
			place("shape212",middle_canvas,ctx,[0.05,0.0,0.0,0.05,108.8,-38.7],ctrans,1,0,0,time);
			place("shape212",middle_canvas,ctx,[0.05,0.0,0.0,0.05,-146.05,-89.3],ctrans,1,0,0,time);
			var oldctx = ctx;
			var fcanvas = createCanvas(middle_canvas.width,middle_canvas.height);			var fctx = fcanvas.getContext("2d");
			enhanceContext(fctx);
			fctx.applyTransforms(ctx._matrix);
			ctx = fctx;
			place("sprite214",middle_canvas,ctx,[0.02963714599609375,0.0,0.0,0.02950897216796875,-7.55,84.9],ctrans,1,(0+time)%1,0,time);
			ctx = oldctx;
			var ms=ctx._matrix;
			ctx.setTransform(1,0,0,1,0,0);
			ctx.drawImage(fcanvas,0,0);
			ctx.applyTransforms(ms);
			place("shape215",middle_canvas,ctx,[0.009535980224609376,0.0,0.0,0.013037872314453126,-64.45,39.05],ctrans,1,0,0,time);
			place("shape215",middle_canvas,ctx,[0.01907196044921875,0.0,0.0,0.026074981689453124,-204.7,40.8],ctrans.merge(new cxform(31,0,6,0,225,225,225,256)),1,0,0,time);
			place("sprite217",middle_canvas,ctx,[-0.02063140869140625,0.0,0.0,0.023149871826171876,-178.7,9.8],ctrans,1,(0+time)%90,0,time);
			place("shape216",middle_canvas,ctx,[0.006618499755859375,0.006618499755859375,-0.006618499755859375,0.006618499755859375,178.2,105.55],ctrans.merge(new cxform(96,0,0,0,15,15,15,256)),1,0,0,time);
			place("shape216",middle_canvas,ctx,[0.006618499755859375,0.006618499755859375,-0.006618499755859375,0.006618499755859375,177.95,104.75],ctrans,1,0,0,time);
			place("shape216",middle_canvas,ctx,[0.006618499755859375,0.006618499755859375,-0.006618499755859375,0.006618499755859375,-221.9,158.75],ctrans.merge(new cxform(144,96,0,0,15,15,15,256)),1,0,0,time);
			place("shape216",middle_canvas,ctx,[0.006618499755859375,0.006618499755859375,-0.006618499755859375,0.006618499755859375,-229.9,192.6],ctrans.merge(new cxform(0,0,0,0,256,256,256,197)),1,0,0,time);
			place("shape216",middle_canvas,ctx,[-0.005165863037109375,0.00587615966796875,0.005165863037109375,0.00587615966796875,-118.5,118.9],ctrans.merge(new cxform(144,96,0,0,15,15,15,256)),1,0,0,time);
			place("shape216",middle_canvas,ctx,[-0.005165863037109375,0.00587615966796875,0.005165863037109375,0.00587615966796875,-241.5,213.65],ctrans.merge(new cxform(0,0,0,0,256,256,256,197)),1,0,0,time);
			place("shape215",middle_canvas,ctx,[0.00476837158203125,0.0,0.0,0.006519317626953125,30.05,64.75],ctrans.merge(new cxform(17,15,9,0,205,205,205,256)),1,0,0,time);
			place("shape215",middle_canvas,ctx,[-0.009535980224609376,0.0,0.0,0.013037872314453126,170.25,51.4],ctrans,1,0,0,time);
			place("shape216",middle_canvas,ctx,[0.006618499755859375,0.006618499755859375,-0.006618499755859375,0.006618499755859375,-66.45,117.95],ctrans.merge(new cxform(144,96,0,0,15,15,15,256)),1,0,0,time);
			place("shape216",middle_canvas,ctx,[-0.005165863037109375,0.00587615966796875,0.005165863037109375,0.00587615966796875,-78.5,138.9],ctrans.merge(new cxform(144,96,0,0,15,15,15,256)),1,0,0,time);
			place("shape216",middle_canvas,ctx,[0.006618499755859375,0.006618499755859375,-0.006618499755859375,0.006618499755859375,-101.85,118.75],ctrans.merge(new cxform(0,0,0,0,256,256,256,197)),1,0,0,time);
			place("shape216",middle_canvas,ctx,[0.006618499755859375,0.006618499755859375,-0.006618499755859375,0.006618499755859375,64.1,138.75],ctrans.merge(new cxform(0,0,0,0,256,256,256,197)),1,0,0,time);
			place("shape216",middle_canvas,ctx,[0.006618499755859375,0.006618499755859375,-0.006618499755859375,0.006618499755859375,-21.85,198.75],ctrans.merge(new cxform(0,0,0,0,256,256,256,197)),1,0,0,time);
			place("shape216",middle_canvas,ctx,[0.006618499755859375,0.006618499755859375,-0.006618499755859375,0.006618499755859375,-146.0,178.75],ctrans.merge(new cxform(0,0,0,0,256,256,256,197)),1,0,0,time);
			place("sprite227",middle_canvas,ctx,[0.05,0.0,0.0,0.05,-162.8,161.75],ctrans,1,(0+time)%10,0,time);
			place("shape216",middle_canvas,ctx,[0.006618499755859375,0.006618499755859375,-0.006618499755859375,0.006618499755859375,33.8,164.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,197)),1,0,0,time);
			place("shape216",middle_canvas,ctx,[0.0052947998046875,0.0052947998046875,-0.0052947998046875,0.0052947998046875,-16.55,120.85],ctrans.merge(new cxform(0,0,0,0,256,256,256,197)),1,0,0,time);
			place("shape216",middle_canvas,ctx,[0.006618499755859375,0.006618499755859375,-0.006618499755859375,0.006618499755859375,198.15,158.65],ctrans.merge(new cxform(0,0,0,0,256,256,256,197)),1,0,0,time);
			place("shape216",middle_canvas,ctx,[-0.005165863037109375,0.00587615966796875,0.005165863037109375,0.00587615966796875,172.9,137.9],ctrans.merge(new cxform(144,96,0,0,15,15,15,256)),1,0,0,time);
			place("shape215",middle_canvas,ctx,[-0.033990478515625,0.0,0.0,0.04483108520507813,201.3,0.8],ctrans,1,0,0,time);
			place("sprite217",middle_canvas,ctx,[0.05,0.0,0.0,0.05,149.45,-87.7],ctrans,1,(0+time)%90,0,time);
			place("sprite217",middle_canvas,ctx,[-0.03206787109375,0.0,0.0,0.0359832763671875,162.8,-31.3],ctrans,1,(0+time)%90,0,time);
			break;
	}
	ctx.restore();
}

var frame = -1;
var time = 0;
var frames = [];
frames.push(0);

var backgroundColor = "#ffffff";
var originalWidth = 1009;
var originalHeight= 802;
function nextFrame(ctx,ctrans){
	var oldframe = frame;
	frame = (frame+1)%frames.length;
	if(frame==oldframe){time++;}else{time=0;};
	drawFrame();
}

function drawFrame(){
	ctx.fillStyle = backgroundColor;
	ctx.fillRect(0,0,middle_canvas.width,middle_canvas.height);
	ctx.save();
	ctx.transform(middle_canvas.width/originalWidth,0,0,middle_canvas.height/originalHeight,0,0);
	sprite228(ctx,ctrans,frames[frame],0,time);
	ctx.restore();
}

let frame_ctrl = null;
nextFrame(ctx, ctrans);

return {
    start: function(){
        frame_ctrl = window.setInterval(function(){nextFrame(ctx,ctrans);},33);
		middle_canvas.classList.add("show");
    },
    stop: function(){
        clearInterval(frame_ctrl);
		middle_canvas.classList.remove("show");
    },
	show: function(){
		middle_canvas.classList.add("show");
	}
}

})();