let cold_controller = (() => {
    
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

var cold_canvas=document.getElementById("cold");
var ctx=cold_canvas.getContext("2d");
enhanceContext(ctx);
var ctrans = new cxform(0,0,0,0,255,255,255,255);

var scalingGrids = {};
var boundRects = {};
function shape229(ctx,ctrans,frame,ratio,time){
	var pathData="M 5359 -4252 Q 5753 -4253 5753 -3836 L 5753 4269 Q 5753 4685 5359 4685 L -5414 4685 Q -5807 4685 -5807 4269 L -5807 -3836 Q -5807 -4253 -5414 -4252 L 5359 -4252";
	ctx.fillStyle=tocolor(ctrans.apply([0,0,70,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
}

function shape230(ctx,ctrans,frame,ratio,time){
	var pathData="M 2553 2832 L 2613 2879 Q 2676 2931 2682 2963 2693 3013 2632 3002 L 2553 2832";
	ctx.fillStyle=tocolor(ctrans.apply([72,138,97,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 1190 4508 L 991 4456 942 4380 Q 712 4306 663 4241 L 832 4304 1037 4293 Q 1264 4301 1389 4405 L 1810 4997 Q 1810 5011 1698 4883 L 1641 4844 Q 1668 5025 1641 4959 1551 4844 1491 4689 1452 4593 1409 4568 L 1370 4560 1269 4560 1351 4831 Q 1340 4896 1291 4678 L 1190 4508";
	ctx.fillStyle=tocolor(ctrans.apply([72,138,97,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 821 3632 L 947 3637 Q 1075 3645 1100 3670 L 1231 3774 1130 3749 1122 3801 972 3711 Q 961 3711 950 3719 933 3735 952 3774 L 892 3749 761 3607 723 3555 821 3632";
	ctx.fillStyle=tocolor(ctrans.apply([72,138,97,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 592 5309 L 761 5721 Q 780 5822 731 5836 693 5669 633 5593 595 5543 589 5421 L 592 5309";
	ctx.fillStyle=tocolor(ctrans.apply([72,138,97,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 1941 2531 Q 1952 2454 1944 2255 1925 1378 1993 1460 2061 1542 2097 2424 L 2113 2681 2091 3012 2105 3531 2034 4336 2064 5677 Q 2143 6587 2130 6671 L 2179 7679 Q 2173 7753 2121 7802 2018 7898 1780 7767 1903 6685 1878 6428 L 1851 5688 1799 5035 Q 1788 4943 1780 4839 1764 4631 1783 4577 L 1837 4260 Q 1865 3632 1859 3487 L 1941 2531";
	ctx.fillStyle=tocolor(ctrans.apply([32,63,55,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 2048 3440 Q 2031 3528 1996 4000 1958 4497 1968 4588 1982 4719 1974 5120 L 2050 6447 Q 2075 7267 2078 7286 2111 7425 2105 7608 2100 7849 2001 7881 1908 7909 1876 7840 L 1862 7767 Q 1955 6835 1949 6625 L 1821 4784 1876 4459 1906 3430 1944 2949 Q 1966 2924 1985 2657 2004 2419 2001 2337 L 2020 1955 Q 2037 2018 2045 2315 2053 2594 2045 2678 2029 2870 2037 3096 L 2048 3440";
	ctx.fillStyle=tocolor(ctrans.apply([142,69,48,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 3043 2376 L 3117 2581 Q 3051 2641 2950 2513 L 2871 2404 2988 2663 Q 2901 2649 2865 2576 L 2786 2466 2792 2617 2701 2546 2644 2398 2581 2458 2436 2313 Q 2431 2327 2423 2327 L 2477 2499 Q 2592 2532 2639 2587 2751 2712 2912 2991 L 3294 3349 Q 3373 3395 3294 3428 3223 3458 3152 3357 L 3018 3212 Q 3122 3398 3078 3401 3051 3403 2994 3299 L 2942 3198 2786 3073 Q 2860 3335 2813 3299 L 2699 3059 2630 3013 Q 2685 3228 2666 3245 2644 3261 2603 3127 2609 3354 2576 3275 L 2573 3280 Q 2538 3346 2450 2955 L 2417 2854 2387 2830 2387 2835 Q 2415 3024 2390 3021 L 2382 3018 Q 2374 3103 2363 3059 L 2292 2909 2308 2808 2305 2805 2243 3026 Q 2199 2958 2204 2857 L 2193 2808 Q 2174 2928 2210 3051 L 2352 3231 2860 3589 Q 2688 3529 2524 3458 2576 3534 2595 3581 2650 3693 2991 3758 L 3343 4026 Q 3477 4132 3513 4217 L 3297 4113 3095 3925 3100 4040 2882 3878 Q 2961 3982 2944 4051 2931 4119 2854 3996 2824 3944 2753 3928 2775 4029 2767 4105 L 2843 4138 2879 4269 Q 2882 4326 2961 4296 L 3130 4351 Q 3114 4335 3335 4493 L 3458 4599 Q 3728 4829 3570 4815 L 3603 4878 Q 3865 5244 3780 5250 3726 5252 3668 5159 L 3622 5067 Q 3668 5217 3584 5241 3532 5255 3461 5151 L 3403 5042 3267 4859 Q 3376 5195 3289 5181 3248 5173 3223 5064 3196 4927 3174 4897 3160 4957 3089 4949 L 3215 5113 Q 3474 5479 3390 5484 3335 5487 3278 5397 L 3231 5304 Q 3280 5452 3193 5476 3141 5493 3070 5386 L 3013 5277 2876 5094 Q 2985 5430 2898 5416 2854 5411 2827 5266 2797 5118 2748 5102 L 2538 4979 2548 5017 Q 2573 5023 2589 5045 2647 5132 2652 5277 2660 5427 2598 5411 L 2682 5662 Q 2863 6225 2805 6227 2772 6230 2731 6088 L 2699 5946 Q 2734 6173 2680 6205 2647 6225 2598 6063 L 2464 5618 Q 2543 6126 2488 6102 2461 6091 2436 5872 2412 5648 2379 5621 L 2240 5430 Q 2305 5883 2267 5771 2136 5236 2101 5239 2098 5239 2101 5490 2101 5670 2008 5386 L 1939 5168 Q 1926 5250 1893 5230 L 1789 5269 1726 5572 Q 1653 5930 1636 5711 L 1617 5719 1582 5583 1530 5867 Q 1497 5992 1502 5684 1522 5646 1470 5687 1445 5706 1420 5837 1396 5960 1374 5962 1347 5968 1366 5779 L 1388 5591 1308 5905 Q 1248 6304 1207 6241 1183 6203 1191 6052 L 1202 5910 Q 1156 6244 1115 6216 1082 6195 1194 5687 1158 5624 1136 5460 L 1131 5463 Q 1095 5479 1049 5659 1005 5834 975 5837 940 5839 940 5673 923 5656 885 5594 L 858 5621 Q 831 5927 779 5880 746 5850 757 5730 L 776 5618 Q 708 5883 653 5864 615 5848 749 5495 L 642 5564 Q 571 5706 484 5793 306 5973 333 5886 L 394 5760 544 5544 448 5528 325 5741 Q 170 5902 194 5777 L 252 5616 426 5441 623 5157 Q 710 5077 855 5047 L 918 4987 981 4848 Q 1030 4815 1095 4791 1292 4583 1270 4635 1292 4589 1303 4531 1355 4523 1363 4441 1369 4389 1385 4373 1393 4365 1399 4367 L 1511 4285 1486 4214 1333 4171 Q 1317 4214 1191 4422 1068 4621 1057 4504 1041 4335 1035 4335 1003 4337 926 4493 L 820 4709 Q 787 4758 806 4624 L 833 4479 Q 729 4580 634 4624 585 4646 566 4796 546 4944 503 4955 451 4968 470 4815 481 4717 503 4635 L 503 4632 380 4829 Q 301 5061 213 5047 159 5039 156 4957 L 164 4878 Q 107 5072 19 5077 -35 5080 63 4884 L 282 4509 Q 202 4526 249 4444 273 4403 312 4356 369 4313 418 4318 448 4321 451 4291 459 4206 571 4116 686 4023 656 4072 L 710 3971 828 3870 850 3857 877 3715 Q 792 3758 760 3761 743 3761 727 3837 708 3933 680 3974 L 607 4072 618 3786 Q 593 3797 568 3818 519 3859 514 3906 506 3982 372 4143 L 448 3873 333 3974 Q 303 4089 227 4094 181 4097 224 4010 L 276 3919 536 3600 Q 792 3406 1254 3242 L 1251 3201 1287 3114 Q 1339 3021 1418 2991 L 1423 2961 1399 2917 Q 1355 2920 1311 2961 L 1232 3136 1150 2950 1054 3032 Q 1079 3125 1027 3166 994 3190 973 3116 L 956 3037 888 3250 Q 858 3346 869 3024 L 798 3179 Q 800 3256 716 3297 L 762 3048 637 3207 Q 579 3258 574 3209 L 582 3152 456 3313 Q 350 3343 426 3204 465 3136 525 3062 L 650 2958 Q 593 2964 568 2920 541 2876 615 2846 721 2802 820 2854 858 2805 1063 2718 L 1259 2639 Q 1298 2639 1330 2595 1360 2557 1380 2562 1380 2513 1486 2327 1347 2327 1319 2357 L 1205 2477 1273 2303 1240 2267 1147 2385 Q 1095 2483 1000 2507 L 1090 2275 981 2319 Q 910 2436 836 2461 790 2475 841 2374 L 904 2267 809 2365 Q 757 2404 738 2374 L 732 2333 921 2092 1210 1983 Q 1339 1937 1715 1573 L 1732 1500 1541 1527 1481 1341 1380 1538 Q 1349 1614 1262 1620 L 1319 1388 1205 1508 Q 1158 1560 1106 1582 L 1065 1592 1180 1415 Q 1126 1437 1008 1461 926 1480 937 1440 948 1393 994 1407 1049 1423 1145 1322 L 1210 1240 Q 1287 1155 1355 1139 1461 1115 1661 874 1838 500 1822 366 1811 284 1849 134 L 1890 0 2027 623 Q 2417 1235 2486 1254 2568 1278 2770 1494 2704 1500 2655 1472 L 2475 1399 2579 1592 Q 2325 1685 2322 1554 2322 1450 2155 1363 2182 1445 2182 1595 2573 2128 2690 2166 2833 2215 3043 2376";
	ctx.fillStyle=tocolor(ctrans.apply([32,63,55,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 1070 2777 L 898 2913 819 3034 778 2965 633 3121 Q 600 3121 584 3107 548 3077 633 3001 764 2881 1070 2777";
	ctx.fillStyle=tocolor(ctrans.apply([72,138,97,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 193 4626 L 190 4571 207 4596 Q 201 4656 193 4626";
	ctx.fillStyle=tocolor(ctrans.apply([76,40,21,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 515 1616 L 515 1591 532 1602 Q 521 1627 515 1616";
	ctx.fillStyle=tocolor(ctrans.apply([76,40,21,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 540 1135 Q 535 1113 543 1100 L 551 1130 540 1135";
	ctx.fillStyle=tocolor(ctrans.apply([76,40,21,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 800 4727 L 810 4741 791 4746 Q 791 4724 800 4727";
	ctx.fillStyle=tocolor(ctrans.apply([76,40,21,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 798 4747 Q 798 4742 812 4742 812 4766 798 4747";
	ctx.fillStyle=tocolor(ctrans.apply([76,40,21,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 1015 5003 L 1032 5022 1010 5014 1015 5003";
	ctx.fillStyle=tocolor(ctrans.apply([76,40,21,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 2898 2594 L 2767 2441 2740 2545 2671 2389 2568 2441 2434 2286 2142 2133 2155 2045 Q 2366 2269 2341 2045 L 2671 2286 Q 2931 2381 2977 2474 L 3016 2537 Q 3021 2556 2966 2526 L 2833 2458 2898 2594 M 2808 3061 L 2753 3190 Q 2712 3127 2704 3075 2699 3042 2650 3080 L 2603 3127 Q 2554 3127 2603 2985 2636 2886 2603 2903 2570 2916 2535 2985 2505 3042 2497 3009 2491 2977 2513 2906 2532 2848 2510 2815 L 2483 2791 Q 2385 2947 2404 2856 L 2434 2753 Q 2423 2649 2366 2624 2327 2608 2316 2570 L 2314 2534 2483 2575 Q 2661 2627 2704 2676 2863 2854 2863 3037 2811 3127 2808 3061 M 3119 3225 Q 3297 3315 3128 3302 L 3029 3225 Q 3007 3203 3007 3192 3007 3168 3119 3225 M 3046 4014 L 2895 3922 Q 2885 3922 2874 3930 2857 3946 2876 3987 L 2816 3963 2685 3821 2647 3769 2745 3845 2871 3851 Q 2999 3859 3024 3883 L 3155 3987 3054 3963 3046 4014 M 3414 4902 Q 3376 4804 3332 4779 L 3294 4774 3196 4774 3275 5044 Q 3264 5110 3215 4888 L 3114 4722 2915 4670 2865 4593 Q 2636 4520 2587 4454 L 2756 4517 2961 4506 Q 3188 4514 3313 4618 L 3734 5211 Q 3734 5224 3625 5096 L 3565 5058 Q 3595 5238 3565 5172 3474 5058 3414 4902 M 2846 5110 L 2865 5252 Q 2805 5082 2696 4992 2715 4916 2625 4850 L 2248 4465 2557 4662 Q 2882 4875 2956 4954 3076 5082 3264 5301 3275 5353 3166 5252 3283 5418 3215 5443 3155 5328 3016 5186 2928 5099 2879 5096 L 2846 5110 M 812 2974 L 691 3007 Q 607 2944 702 2952 L 812 2974 M 1543 2029 Q 1470 2062 1459 2116 1453 2144 1462 2165 L 1568 2182 1489 2302 1355 2337 1279 2378 1303 2286 1238 2302 Q 1169 2373 1104 2389 1063 2400 1107 2335 1126 2305 1156 2269 L 1076 2269 945 2373 Q 913 2395 907 2370 L 910 2343 1038 2253 Q 981 2253 1076 2193 1123 2163 1183 2133 1238 2114 1462 1961 L 1743 1753 Q 1836 1685 1732 1840 1628 1991 1543 2029 M 2082 1712 L 2147 1761 2286 1982 Q 2349 2073 2131 1914 L 2021 1862 Q 2142 2029 2035 1993 1970 1974 1937 1879 L 1907 1717 Q 2128 1840 2062 1737 2021 1674 2082 1712 M 1997 1005 Q 1953 923 1929 996 1888 1117 1808 1204 1757 1289 1702 1324 1669 1346 1683 1286 L 1702 1220 1516 1289 1410 1376 1355 1357 Q 1317 1341 1238 1461 1186 1537 1172 1499 L 1169 1444 1355 1256 1595 1117 1702 980 1860 568 Q 1912 404 1926 431 1937 447 1942 551 1956 636 2021 844 L 2314 1272 2114 1059 Q 2194 1223 2035 1100 2019 1046 1997 1005 M 1503 2733 L 1330 2922 1249 2870 Q 1131 3042 1117 2974 1109 2930 1213 2829 L 1317 2733 1503 2733 M 358 4812 Q 186 5140 252 4828 186 4894 159 4894 L 145 4880 320 4623 345 4503 Q 405 4419 506 4416 L 544 4279 Q 552 4236 626 4197 705 4156 719 4124 735 4080 801 4039 833 4017 863 4004 L 1489 3403 Q 1650 3266 1344 3627 L 1451 3610 Q 1609 3627 1276 3763 1289 3902 1224 3883 1180 3872 1117 3922 L 1063 3971 997 4331 891 4536 877 4468 599 4623 533 4760 Q 492 4864 506 4623 L 358 4812 M 2054 2540 Q 2153 2652 2002 2581 L 2030 2646 Q 2101 2693 2095 2723 L 2024 2687 2068 2755 Q 2150 2818 2054 2851 2161 2979 2082 3001 L 1959 2862 2016 3001 Q 2030 3140 1909 2906 1806 2824 1776 2916 1748 2990 1721 2927 1787 2744 1694 2840 1636 2903 1625 2889 L 1628 2862 1680 2755 Q 1601 2829 1628 2755 1645 2709 1691 2684 1716 2671 1735 2668 L 1653 2657 Q 1628 2701 1628 2602 L 1721 2561 1800 2602 1836 2485 Q 1817 2572 2054 2540 M 336 5697 L 380 5620 Q 454 5508 519 5465 L 588 5334 Q 667 5202 719 5192 L 858 5181 Q 937 5170 954 5107 984 5000 1076 4948 1145 4916 1276 4760 L 1325 4678 Q 1371 4621 1355 4727 1317 4968 1238 5020 1186 5050 1161 5039 L 1145 5020 1090 5260 Q 1025 5312 1038 5208 L 956 5448 Q 863 5432 891 5328 907 5263 842 5375 L 771 5500 650 5533 705 5380 Q 609 5497 533 5552 L 416 5618 Q 366 5650 336 5697 M 2366 3446 L 2267 3370 Q 2245 3348 2245 3337 2245 3313 2357 3370 2538 3460 2366 3446 M 2256 3550 L 2177 3381 2308 3509 Q 2316 3561 2256 3550 M 2169 3635 L 2166 3599 2336 3643 Q 2513 3695 2557 3741 2715 3924 2715 4105 2666 4195 2661 4129 L 2606 4258 Q 2568 4195 2557 4143 2551 4110 2502 4148 L 2456 4195 Q 2407 4195 2456 4053 2491 3954 2456 3971 2423 3984 2387 4053 2357 4107 2352 4075 2344 4044 2366 3973 2385 3916 2363 3883 L 2338 3859 Q 2237 4014 2256 3922 L 2286 3821 Q 2278 3717 2218 3692 2180 3676 2169 3635 M 2513 5634 L 2516 5522 2685 5934 Q 2707 6036 2655 6049 2617 5883 2557 5803 2519 5757 2513 5634 M 2226 5159 L 2207 5020 2377 5252 2456 5470 Q 2469 5519 2278 5328 2254 5304 2226 5159 M 1464 5629 Q 1423 5779 1393 5667 1369 5623 1306 5754 1276 5820 1249 5893 1229 6087 1199 5921 L 1229 5612 Q 1265 5467 1311 5301 1407 4968 1470 4864 1533 4760 1759 4703 1874 4673 1975 4664 L 1959 4735 1989 4787 1879 4812 1918 4877 Q 1909 5030 1789 4888 L 1767 5134 Q 1737 5224 1707 4929 1696 4872 1672 5060 L 1650 5263 1658 5664 1568 5585 Q 1519 5883 1500 5664 L 1464 5629 M 1238 3403 L 1437 3386 984 3678 732 3678 Q 653 3678 721 3629 L 839 3539 Q 863 3509 1052 3452 L 1238 3403 M 1923 3332 Q 1888 3465 1961 3411 L 1866 3567 Q 1877 3717 1978 3558 L 2002 3665 Q 2027 3771 1950 3821 1983 4006 1948 3979 1994 4208 1869 3965 L 1885 4091 Q 1896 4244 1874 4260 1855 4277 1847 4173 1844 4096 1803 4099 L 1765 4118 1740 4296 Q 1718 4449 1680 4383 L 1691 4085 Q 1688 4140 1623 4268 1552 4405 1574 4307 L 1645 4050 1549 4165 Q 1508 4208 1503 4178 L 1505 4137 1546 4031 Q 1511 4053 1533 4001 L 1639 3823 Q 1634 3807 1579 3815 1546 3821 1612 3763 L 1686 3703 1718 3635 Q 1781 3629 1691 3627 1634 3624 1650 3597 L 1680 3569 1855 3416 Q 1773 3471 1746 3449 L 1732 3414 1811 3334 Q 1797 3397 1923 3332";
	ctx.fillStyle=tocolor(ctrans.apply([255,255,255,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
}

function shape231(ctx,ctrans,frame,ratio,time){
	var pathData="M -6105 4284 L -6037 4324 Q -5931 4387 -5839 4455 -5996 4371 -6105 4284 M -5191 4718 Q -4295 4743 409 4749 L 5253 4749 Q 4973 4834 4633 4914 2747 5356 79 5356 -2589 5356 -4475 4914 -4876 4820 -5191 4718";
	ctx.fillStyle=tocolor(ctrans.apply([255,255,255,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M -6082 3396 L -6037 3394 Q -5869 3503 -5624 3634 -5134 3893 -4725 3993 -4302 4097 -4119 4160 L -3372 4191 Q -3164 4195 -3184 4224 -3197 4243 -3194 4250 -3184 4265 -3110 4278 -2663 4352 631 4353 L 4612 4318 Q 4647 4317 4793 4268 5021 4182 5150 4155 5364 4109 5759 3971 5799 3956 6255 3648 L 6404 3551 Q 6519 3694 6519 3849 6519 4360 5253 4749 L 409 4749 Q -4295 4743 -5191 4718 -5580 4592 -5839 4455 -5931 4387 -6037 4324 L -6105 4284 -6107 4283 -6137 4256 -6361 3849 Q -6361 3609 -6082 3396";
	ctx.fillStyle=tocolor(ctrans.apply([179,231,255,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 6404 3551 L 6255 3648 Q 5799 3956 5759 3971 5364 4109 5150 4155 5021 4182 4793 4268 4647 4317 4612 4318 L 631 4353 Q -2663 4352 -3110 4278 -3184 4265 -3194 4250 -3197 4243 -3184 4224 -3164 4195 -3372 4191 L -4119 4160 Q -4302 4097 -4725 3993 -5134 3893 -5624 3634 -5869 3503 -6037 3394 L -6082 3396 Q -5636 3055 -4475 2783 -2589 2341 79 2342 2747 2341 4633 2783 6052 3115 6404 3551";
	ctx.fillStyle=tocolor(ctrans.apply([243,243,243,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 6404 3551 Q 6052 3115 4633 2783 2747 2341 79 2342 -2589 2341 -4475 2783 -5636 3055 -6082 3396";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([255,255,255,1]));
	ctx.lineWidth=2.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M 1441 4242 Q 1073 4366 551 4366 30 4366 -340 4242 -708 4119 -708 3943 -708 3768 -340 3645 30 3521 551 3521 1073 3521 1441 3645 1810 3768 1810 3943 1810 4119 1441 4242";
	ctx.fillStyle=tocolor(ctrans.apply([0,0,0,0.2]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
}

function shape232(ctx,ctrans,frame,ratio,time){
	var pathData="M 145 2459 L 531 2779 918 3101";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([255,153,0,1]));
	ctx.lineWidth=4.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M 531 2779 L 614 2097";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([255,153,0,1]));
	ctx.lineWidth=4.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M 3588 2913 Q 3605 2980 3640 3040 3657 3069 3873 3319 4089 3568 4148 4075 4207 4581 4061 4864 3916 5147 3907 5371 3899 5596 3621 5741 3343 5885 3235 5992 3127 6099 2904 6218 2681 6336 2524 6512 2365 6687 1673 6569 980 6451 827 6447 L 801 6420 Q 149 5756 150 4815 149 3877 801 3213 1451 2548 2372 2548 3053 2548 3588 2913";
	ctx.fillStyle=tocolor(ctrans.apply([255,255,255,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 3588 2913 L 3588 2912 3632 2944 3923 3191 3943 3213 Q 4594 3877 4594 4815 4594 5756 3943 6420 3293 7083 2372 7083 1470 7083 827 6447 980 6451 1673 6569 2365 6687 2524 6512 2681 6336 2904 6218 3127 6099 3235 5992 3343 5885 3621 5741 3899 5596 3907 5371 3916 5147 4061 4864 4207 4581 4148 4075 4089 3568 3873 3319 3657 3069 3640 3040 3605 2980 3588 2913";
	ctx.fillStyle=tocolor(ctrans.apply([179,231,255,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 1667 2281 Q 1490 1954 1490 1552 1490 909 1943 454 2398 0 3042 0 3686 0 4139 454 4407 722 4518 1057 4525 1165 4475 1263 4393 1417 4364 1597 3733 2346 3513 2517 3293 2687 2924 2647 2555 2605 2513 2582 2485 2566 2319 2514 2154 2461 1966 2416 1779 2370 1667 2281";
	ctx.fillStyle=tocolor(ctrans.apply([255,255,255,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 4518 1057 Q 4594 1324 4594 1552 4594 2196 4139 2650 3686 3105 3042 3105 2398 3105 1943 2650 1772 2478 1667 2281 1779 2370 1966 2416 2154 2461 2319 2514 2485 2566 2513 2582 2555 2605 2924 2647 3293 2687 3513 2517 3733 2346 4364 1597 4393 1417 4475 1263 4525 1165 4518 1057";
	ctx.fillStyle=tocolor(ctrans.apply([179,231,255,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 1560 1379 L 2481 1466";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([255,153,0,1]));
	ctx.lineWidth=5.5;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M 1889 3031 Q 1530 2902 1530 2690 1530 2604 1578 2523 1650 2399 1802 2399 L 1953 2445 Q 1887 2490 1867 2588 1855 2647 1858 2729 L 1866 2831 Q 1866 2948 1871 3026 L 1889 3031 M 2182 2516 Q 2431 2588 2583 2617 L 2740 2635 Q 2662 2697 2662 2850 2662 2919 2833 3178 L 2837 3184 2387 3144 2423 3148 Q 2321 2703 2221 2527 L 2182 2516 M 2990 2625 L 3005 2624 3422 2563 3483 2556 Q 3454 2602 3454 2666 3454 2686 3494 2815 3545 2977 3608 3116 L 3642 3190 Q 4004 3172 4152 3118 3975 2730 3853 2568 L 3847 2566 Q 4038 2607 4188 2743 4256 2804 4256 2926 L 4262 3010 Q 4257 3063 4195 3098 4027 3191 3376 3196 3313 3056 3231 2919 3098 2699 2990 2625";
	ctx.fillStyle=tocolor(ctrans.apply([102,153,255,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 1953 2445 L 2086 2487 2094 2490 2182 2516 2221 2527 Q 2321 2703 2423 3148 L 2387 3144 1930 3046 1904 3037 1889 3031 1871 3026 Q 1866 2948 1866 2831 L 1858 2729 Q 1855 2647 1867 2588 1887 2490 1953 2445 M 2740 2635 L 2990 2625 Q 3098 2699 3231 2919 3313 3056 3376 3196 L 3318 3196 Q 3059 3196 2837 3184 L 2833 3178 Q 2662 2919 2662 2850 2662 2697 2740 2635 M 3483 2556 Q 3681 2536 3821 2560 L 3827 2562 3847 2566 3853 2568 Q 3975 2730 4152 3118 4004 3172 3642 3190 L 3608 3116 Q 3545 2977 3494 2815 3454 2686 3454 2666 3454 2602 3483 2556";
	ctx.fillStyle=tocolor(ctrans.apply([51,102,255,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 5270 3665 Q 5303 3849 5326 3887 5379 3972 5540 3972";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([102,153,255,1]));
	ctx.lineWidth=3.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M 5270 3809 L 5648 3773";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([102,153,255,1]));
	ctx.lineWidth=3.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M 5105 3972 Q 5273 4120 5431 4222";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([102,153,255,1]));
	ctx.lineWidth=3.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M 4997 3916 Q 4997 3980 5032 4152 5065 4319 5087 4371";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([102,153,255,1]));
	ctx.lineWidth=3.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M 5196 3628 L 5522 3628";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([102,153,255,1]));
	ctx.lineWidth=3.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M 4410 2824 Q 4685 2905 4993 3244 L 5039 3296 Q 4980 3345 4980 3435 L 5018 3782 Q 5048 3956 5095 4041 L 5052 4042 Q 4813 4042 4658 3812 L 4633 3774 Q 4688 3747 4711 3682 4728 3633 4728 3521 4728 3492 4531 3072 L 4410 2824 M 4265 3410 Q 4115 3345 4092 3331 4008 3278 3982 3210 3968 3170 3968 3085 3968 2988 4017 2912 4044 2867 4085 2841 L 4224 3305 4265 3410";
	ctx.fillStyle=tocolor(ctrans.apply([102,153,255,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 4085 2841 Q 4148 2798 4240 2798 4324 2798 4410 2824 L 4531 3072 Q 4728 3492 4728 3521 4728 3633 4711 3682 4688 3747 4633 3774 L 4617 3747 4573 3655 4570 3648 4535 3560 Q 4505 3512 4335 3440 L 4328 3437 4295 3423 4265 3410 4224 3305 4085 2841 M 5039 3296 Q 5154 3432 5245 3574 5342 3725 5342 3772 5342 3859 5285 3936 5219 4028 5095 4041 5048 3956 5018 3782 L 4980 3435 Q 4980 3345 5039 3296";
	ctx.fillStyle=tocolor(ctrans.apply([51,102,255,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 3503 4047 Q 4551 3613 5598 3180";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([255,153,0,1]));
	ctx.lineWidth=4.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M 4884 3432 L 4884 2763";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([255,153,0,1]));
	ctx.lineWidth=4.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M 1854 3849 Q 1799 3905 1720 3905 1641 3905 1585 3849 1530 3795 1530 3715 1530 3636 1585 3580 1641 3525 1720 3525 1799 3525 1854 3580 1910 3636 1910 3715 1910 3795 1854 3849";
	ctx.fillStyle=tocolor(ctrans.apply([102,51,255,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 1585 4447 Q 1641 4392 1720 4392 1799 4392 1854 4447 1910 4503 1910 4582 1910 4661 1854 4716 1799 4772 1720 4772 1641 4772 1585 4716 1530 4661 1530 4582 1530 4503 1585 4447";
	ctx.fillStyle=tocolor(ctrans.apply([51,102,204,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 3570 1442 Q 3503 1511 3406 1511 3309 1511 3240 1442 3173 1374 3173 1278 3173 1181 3240 1112 3309 1044 3406 1044 3503 1044 3570 1112 3639 1181 3639 1278 3639 1374 3570 1442";
	ctx.fillStyle=tocolor(ctrans.apply([0,0,0,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 3404 1222 Q 3382 1246 3349 1246 3316 1246 3292 1222 3269 1200 3269 1167 3269 1134 3292 1110 3316 1087 3349 1087 3382 1087 3404 1110 3428 1134 3428 1167 3428 1200 3404 1222";
	ctx.fillStyle=tocolor(ctrans.apply([255,255,255,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 2389 1182 Q 2323 1249 2228 1249 2133 1249 2066 1182 2000 1116 2000 1021 2000 926 2066 859 2133 793 2228 793 2323 793 2389 859 2457 926 2457 1021 2457 1116 2389 1182";
	ctx.fillStyle=tocolor(ctrans.apply([0,0,0,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 2236 975 Q 2214 999 2181 999 2148 999 2124 975 2101 953 2101 920 2101 887 2124 863 2148 840 2181 840 2214 840 2236 863 2260 887 2260 920 2260 953 2236 975";
	ctx.fillStyle=tocolor(ctrans.apply([255,255,255,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 5700 2951 L 5700 3003 Q 5647 3095 5599 3145 5584 3161 5516 3184 L 5414 3220 Q 5316 3286 5252 3311 5134 3357 5134 3226 5134 3174 5213 3126 5281 3086 5329 3086 5379 3086 5480 3034 5535 3007 5634 2951 L 5700 2951";
	ctx.fillStyle=tocolor(ctrans.apply([255,255,255,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 5700 2951 L 5700 3003 Q 5647 3095 5599 3145 5584 3161 5516 3184 L 5414 3220 Q 5316 3286 5252 3311 5134 3357 5134 3226 5134 3174 5213 3126 5281 3086 5329 3086 5379 3086 5480 3034 5535 3007 5634 2951 L 5700 2951 Z";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([253,253,253,1]));
	ctx.lineWidth=3.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

	var pathData="M 686 2307 Q 621 2307 610 2229 L 610 2152 608 2143 Q 603 2103 610 2069 621 2000 686 2000 790 2000 764 2153 L 764 2238 Q 751 2307 686 2307";
	ctx.fillStyle=tocolor(ctrans.apply([255,255,255,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 388 2553 Q 388 2631 301 2631 L 281 2629 Q 232 2622 186 2583 140 2544 123 2501 104 2454 48 2432 0 2413 0 2382 0 2307 103 2307 231 2307 388 2553";
	ctx.fillStyle=tocolor(ctrans.apply([255,255,255,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 2219 1888 Q 2233 1987 2347 2062 2425 2113 2527 2087 2638 2058 2741 1947";
	var scaleMode = "NORMAL";
	ctx.strokeStyle=tocolor(ctrans.apply([255,0,0,1]));
	ctx.lineWidth=2.0;
	ctx.lineCap="round";
	ctx.lineJoin="round";
	drawPath(ctx,pathData,true,scaleMode);

}

function sprite233(ctx,ctrans,frame,ratio,time){
	var clips = [];
	var frame_cnt = 1;
	frame = frame % frame_cnt;
	switch(frame){
		case 0:
			place("shape232",cold_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
	}
}

function shape234(ctx,ctrans,frame,ratio,time){
	var pathData="M 495 -325 Q 410 -240 290 -240 170 -240 85 -325 0 -410 0 -530 0 -650 85 -735 170 -820 290 -820 410 -820 495 -735 580 -650 580 -530 580 -410 495 -325";
	drawPath(ctx,pathData,false);
	ctx.fillStyle=tocolor(ctrans.apply([204,204,204,0.0]));
	ctx.fill("evenodd");
	ctx.save();
	ctx.clip();
	ctx.transform(0.017822265625,0,0,0.017822265625,290,-530);
	var grd=ctx.createRadialGradient(0.0,0,0,0,0,16384);
	grd.addColorStop(0.3215686274509804,tocolor(ctrans.apply([255,255,255,1])));
	grd.addColorStop(1.0,tocolor(ctrans.apply([204,204,204,0.0])));
	ctx.fillStyle = grd;
	ctx.fillRect(-16384,-16384,32768,32768);
	ctx.restore();
}

function sprite235(ctx,ctrans,frame,ratio,time){
	var clips = [];
	var frame_cnt = 1;
	frame = frame % frame_cnt;
	switch(frame){
		case 0:
			place("shape234",cold_canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
	}
}

function sprite236(ctx,ctrans,frame,ratio,time){
	var clips = [];
	var frame_cnt = 3;
	frame = frame % frame_cnt;
	switch(frame){
		case 0:
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,360.0,-5090.0],ctrans,1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,12711.0,3317.0],ctrans,1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,5008.0,57.0],ctrans,1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,2838.0,-1994.0],ctrans,1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-4409.0,2473.0],ctrans,1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,647.0,6793.0],ctrans,1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,7774.0,4543.0],ctrans,1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,2103.0,3053.0],ctrans,1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-10746.0,-2623.0],ctrans,1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-5494.0,-1258.0],ctrans,1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-4760.0,-4199.0],ctrans,1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-8120.0,-5939.0],ctrans,1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-11761.0,2243.0],ctrans,1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-9661.0,6793.0],ctrans,1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-4989.0,5733.0],ctrans,1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-8400.0,1663.0],ctrans,1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,647.0,-8019.0],ctrans,1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,10224.0,422.0],ctrans,1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,12114.0,-4199.0],ctrans,1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,9944.0,-4779.0],ctrans,1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,4853.0,-5090.0],ctrans,1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,14433.0,-7400.0],ctrans,1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,26784.0,1007.0],ctrans,1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,19081.0,-2253.0],ctrans,1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,16911.0,-4304.0],ctrans,1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,9664.0,163.0],ctrans,1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,14720.0,4483.0],ctrans,1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,21847.0,2233.0],ctrans,1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,16176.0,743.0],ctrans,1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,3327.0,-4933.0],ctrans,1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,8579.0,-3568.0],ctrans,1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,9313.0,-6509.0],ctrans,1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,5953.0,-8249.0],ctrans,1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,2312.0,-67.0],ctrans,1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,4412.0,4483.0],ctrans,1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,9084.0,3423.0],ctrans,1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,5673.0,-647.0],ctrans,1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,14720.0,-10329.0],ctrans,1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,24297.0,-1888.0],ctrans,1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,26187.0,-6509.0],ctrans,1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,24017.0,-7089.0],ctrans,1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,18926.0,-7400.0],ctrans,1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,23196.0,8043.0],ctrans,1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,21026.0,7463.0],ctrans,1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,19661.0,8674.0],ctrans,1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,20395.0,5733.0],ctrans,1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,12848.0,9103.0],ctrans,1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,10678.0,8523.0],ctrans,1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,9313.0,9734.0],ctrans,1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,10047.0,6793.0],ctrans,1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-595.0,9103.0],ctrans,1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-2765.0,8523.0],ctrans,1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-4130.0,9734.0],ctrans,1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-3396.0,6793.0],ctrans,1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-10241.0,8043.0],ctrans,1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-12411.0,7463.0],ctrans,1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-13776.0,8674.0],ctrans,1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-13042.0,5733.0],ctrans,1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-11326.0,-6301.0],ctrans,1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-13496.0,-6881.0],ctrans,1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-14861.0,-5670.0],ctrans,1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-14127.0,-8611.0],ctrans,1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-1959.0,-8031.0],ctrans,1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-4129.0,-8611.0],ctrans,1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-5494.0,-7400.0],ctrans,1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-4760.0,-10341.0],ctrans,1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,3441.0,-6821.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,15792.0,1586.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,8089.0,-1674.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,5919.0,-3725.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-1328.0,742.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,3728.0,5062.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,10855.0,2812.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,5184.0,1322.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-7665.0,-4354.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-2413.0,-2989.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-1679.0,-5930.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-5039.0,-7670.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-8680.0,512.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-6580.0,5062.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-1908.0,4002.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-5319.0,-68.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,3728.0,-9750.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,13305.0,-1309.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,15195.0,-5930.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,13025.0,-6510.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,7934.0,-6821.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,10233.0,-4964.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,22584.0,3443.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,14881.0,183.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,12711.0,-1868.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,5464.0,2599.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,10520.0,6919.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,17647.0,4669.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,11976.0,3179.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-873.0,-2497.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,4379.0,-1132.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,5113.0,-4073.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,1753.0,-5813.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-1888.0,2369.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,212.0,6919.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,4884.0,5859.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,1473.0,1789.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,10520.0,-7893.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,20097.0,548.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,21987.0,-4073.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,19817.0,-4653.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,14726.0,-4964.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,17051.0,-5018.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,14881.0,-7069.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,22267.0,-4653.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,24157.0,-9274.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,21987.0,-9854.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,16896.0,-10165.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,19195.0,-8308.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,21673.0,-5212.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,23688.0,-8308.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-10256.0,-5018.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-12426.0,-7069.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-5040.0,-4653.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-3150.0,-9274.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-5320.0,-9854.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-10411.0,-10165.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-8112.0,-8308.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-5634.0,-5212.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-3619.0,-8308.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-10256.0,7515.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-12426.0,5464.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-5040.0,7880.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-3150.0,3259.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-5320.0,2679.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-10411.0,2368.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-8112.0,4225.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-5634.0,7321.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-3619.0,4225.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,18663.0,7890.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,10960.0,4630.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,8790.0,2579.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,13726.0,9116.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,8055.0,7626.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,16176.0,4995.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,13104.0,1340.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,25455.0,9747.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,17752.0,6487.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,15582.0,4436.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,8335.0,8903.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,20518.0,10973.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,14847.0,9483.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,7250.0,5172.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,7984.0,2231.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,22968.0,6852.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,24858.0,2231.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,22688.0,1651.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,17597.0,1340.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,19922.0,1286.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,25138.0,1651.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,24544.0,1092.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,2733.0,868.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-4970.0,-2392.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-7140.0,-4443.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-2204.0,2094.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-7875.0,604.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,246.0,-2027.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-2826.0,-5682.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,9525.0,2725.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,1822.0,-535.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-348.0,-2586.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-7595.0,1881.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,4588.0,3951.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-1083.0,2461.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-8680.0,-1850.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-7946.0,-4791.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,7038.0,-170.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,8928.0,-4791.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,6758.0,-5371.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,1667.0,-5682.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,3992.0,-5736.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,9208.0,-5371.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,8614.0,-5930.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,530.0,6772.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-7173.0,3512.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-9343.0,1461.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-4407.0,7998.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-10078.0,6508.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-1957.0,3877.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-5029.0,222.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,7322.0,8629.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-381.0,5369.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-2551.0,3318.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-9798.0,7785.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,2385.0,9855.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-3286.0,8365.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-10883.0,4054.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-10149.0,1113.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,4835.0,5734.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,6725.0,1113.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,4555.0,533.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-536.0,222.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,1789.0,168.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,7005.0,533.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,6411.0,-26.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-891.0,-6337.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,11460.0,2070.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,3757.0,-1190.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,1587.0,-3241.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-5660.0,1226.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-604.0,5546.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,6523.0,3296.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,852.0,1806.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-11997.0,-3870.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-6745.0,-2505.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-6011.0,-5446.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-9371.0,-7186.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-13012.0,996.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-10912.0,5546.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-6240.0,4486.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-9651.0,416.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-604.0,-9266.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,8973.0,-825.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,10863.0,-5446.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,8693.0,-6026.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,3602.0,-6337.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,5901.0,-4480.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,18252.0,3927.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,10549.0,667.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,8379.0,-1384.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,1132.0,3083.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,6188.0,7403.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,13315.0,5153.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,7644.0,3663.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-5205.0,-2013.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,47.0,-648.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,781.0,-3589.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-2579.0,-5329.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-6220.0,2853.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-4120.0,7403.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,552.0,6343.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-2859.0,2273.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,6188.0,-7409.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,15765.0,1032.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,17655.0,-3589.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,15485.0,-4169.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,10394.0,-4480.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,12719.0,-4534.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,10549.0,-6585.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,17935.0,-4169.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,19825.0,-8790.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,17655.0,-9370.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,12564.0,-9681.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,14863.0,-7824.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,17341.0,-4728.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,19356.0,-7824.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-14588.0,-4534.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-16758.0,-6585.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-9372.0,-4169.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-7482.0,-8790.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-9652.0,-9370.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-14743.0,-9681.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-12444.0,-7824.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-9966.0,-4728.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-7951.0,-7824.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-14588.0,7999.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-16758.0,5948.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-9372.0,8364.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-7482.0,3743.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-9652.0,3163.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-14743.0,2852.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-12444.0,4709.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-9966.0,7805.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-7951.0,4709.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,14331.0,8374.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,6628.0,5114.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,4458.0,3063.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,9394.0,9600.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,3723.0,8110.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,11844.0,5479.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,8772.0,1824.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,21123.0,10231.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,13420.0,6971.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,11250.0,4920.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,4003.0,9387.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,16186.0,11457.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,10515.0,9967.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,2918.0,5656.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,3652.0,2715.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,18636.0,7336.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,20526.0,2715.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,18356.0,2135.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,13265.0,1824.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,15590.0,1770.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,20806.0,2135.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,20212.0,1576.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-1599.0,1352.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-9302.0,-1908.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-11472.0,-3959.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-6536.0,2578.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-12207.0,1088.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-4086.0,-1543.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-7158.0,-5198.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,5193.0,3209.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-2510.0,-51.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-4680.0,-2102.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-11927.0,2365.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,256.0,4435.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-5415.0,2945.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-13012.0,-1366.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-12278.0,-4307.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,2706.0,314.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,4596.0,-4307.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,2426.0,-4887.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-2665.0,-5198.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,360.0,-5090.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,4876.0,-4887.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,4282.0,-5446.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-3802.0,7256.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-11505.0,3996.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-13675.0,1945.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-8739.0,8482.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-14410.0,6992.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-6289.0,4361.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-9361.0,706.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,2990.0,9113.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-4713.0,5853.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-6883.0,3802.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-14130.0,8269.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-1947.0,10339.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-7618.0,8849.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-15215.0,4538.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-14481.0,1597.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,503.0,6218.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,2393.0,1597.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,223.0,1017.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-4868.0,706.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-2543.0,652.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,2673.0,1017.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,2079.0,458.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,1550.0,-5860.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,13901.0,2547.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,6198.0,-713.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,4028.0,-2764.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-3219.0,1703.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,1837.0,6023.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,8964.0,3773.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,3293.0,2283.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-9556.0,-3393.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-4304.0,-2028.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-3570.0,-4969.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-6930.0,-6709.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-10571.0,1473.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-8471.0,6023.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-3799.0,4963.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-7210.0,893.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,1837.0,-8789.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,11414.0,-348.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,13304.0,-4969.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,11134.0,-5549.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,6043.0,-5860.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,8342.0,-4003.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,20693.0,4404.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,12990.0,1144.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,10820.0,-907.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,3573.0,3560.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,8629.0,7880.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,15756.0,5630.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,10085.0,4140.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-2764.0,-1536.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,2488.0,-171.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,3222.0,-3112.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-138.0,-4852.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-3779.0,3330.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-1679.0,7880.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,2993.0,6820.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-418.0,2750.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,8629.0,-6932.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,18206.0,1509.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,20096.0,-3112.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,17926.0,-3692.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,12835.0,-4003.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,15160.0,-4057.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,12990.0,-6108.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,20376.0,-3692.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,22266.0,-8313.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,20096.0,-8893.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,15005.0,-9204.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,17304.0,-7347.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,19782.0,-4251.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,21797.0,-7347.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-12147.0,-4057.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-14317.0,-6108.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-6931.0,-3692.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-5041.0,-8313.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-7211.0,-8893.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-12302.0,-9204.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-10003.0,-7347.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-7525.0,-4251.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-5510.0,-7347.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-12147.0,8476.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-14317.0,6425.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-6931.0,8841.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-5041.0,4220.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-7211.0,3640.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-12302.0,3329.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-10003.0,5186.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-7525.0,8282.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-5510.0,5186.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,16043.0,-908.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,28394.0,7499.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,20691.0,4239.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,18521.0,2188.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,17786.0,7235.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,16330.0,-3837.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,25907.0,4604.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,27797.0,-17.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,25627.0,-597.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,20536.0,-908.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,22835.0,949.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,27483.0,6096.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,25313.0,4045.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,16981.0,4781.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,17715.0,1840.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,14355.0,100.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,14075.0,7702.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,23122.0,-1980.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,27328.0,949.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,29653.0,895.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,27483.0,-1156.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,29498.0,-4252.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,7283.0,5845.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,19634.0,14252.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,11931.0,10992.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,9761.0,8941.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,9026.0,13988.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,7570.0,2916.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,17147.0,11357.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,19037.0,6736.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,16867.0,6156.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,11776.0,5845.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,14075.0,7702.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,18723.0,12849.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,16553.0,10798.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,8221.0,11534.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,8955.0,8593.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,5595.0,6853.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,5315.0,14455.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,14362.0,4773.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,18568.0,7702.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,20893.0,7648.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,18723.0,5597.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,20738.0,2501.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-12060.0,-2764.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,291.0,5643.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-7412.0,2383.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-9582.0,332.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-10317.0,5379.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-11773.0,-5693.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-2196.0,2748.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-306.0,-1873.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-2476.0,-2453.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-7567.0,-2764.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-5268.0,-907.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-620.0,4240.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-2790.0,2189.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-11122.0,2925.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-10388.0,-16.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-13748.0,-1756.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-14028.0,5846.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-4981.0,-3836.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-775.0,-907.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,1550.0,-961.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-620.0,-3012.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,1395.0,-6108.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			break;
		case 1:
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,2310.0,-1550.0],ctrans,1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,14661.0,6857.0],ctrans,1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,6958.0,3597.0],ctrans,1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,4788.0,1546.0],ctrans,1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-2459.0,6013.0],ctrans,1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,2597.0,10333.0],ctrans,1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,9724.0,8083.0],ctrans,1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,4053.0,6593.0],ctrans,1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-8796.0,917.0],ctrans,1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-3544.0,2282.0],ctrans,1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-2810.0,-659.0],ctrans,1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-6170.0,-2399.0],ctrans,1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-9811.0,5783.0],ctrans,1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-7711.0,10333.0],ctrans,1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-3039.0,9273.0],ctrans,1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-6450.0,5203.0],ctrans,1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,2597.0,-4479.0],ctrans,1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,12174.0,3962.0],ctrans,1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,14064.0,-659.0],ctrans,1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,11894.0,-1239.0],ctrans,1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,6803.0,-1550.0],ctrans,1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,16383.0,-3860.0],ctrans,1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,28734.0,4547.0],ctrans,1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,21031.0,1287.0],ctrans,1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,18861.0,-764.0],ctrans,1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,11614.0,3703.0],ctrans,1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,16670.0,8023.0],ctrans,1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,23797.0,5773.0],ctrans,1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,18126.0,4283.0],ctrans,1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,5277.0,-1393.0],ctrans,1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,10529.0,-28.0],ctrans,1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,11263.0,-2969.0],ctrans,1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,7903.0,-4709.0],ctrans,1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,4262.0,3473.0],ctrans,1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,6362.0,8023.0],ctrans,1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,11034.0,6963.0],ctrans,1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,7623.0,2893.0],ctrans,1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,16670.0,-6789.0],ctrans,1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,26247.0,1652.0],ctrans,1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,28137.0,-2969.0],ctrans,1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,25967.0,-3549.0],ctrans,1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,20876.0,-3860.0],ctrans,1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,25146.0,11583.0],ctrans,1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,22976.0,11003.0],ctrans,1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,21611.0,12214.0],ctrans,1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,22345.0,9273.0],ctrans,1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,14798.0,12643.0],ctrans,1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,12628.0,12063.0],ctrans,1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,11263.0,13274.0],ctrans,1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,11997.0,10333.0],ctrans,1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,1355.0,12643.0],ctrans,1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-815.0,12063.0],ctrans,1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-2180.0,13274.0],ctrans,1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-1446.0,10333.0],ctrans,1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-8291.0,11583.0],ctrans,1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-10461.0,11003.0],ctrans,1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-11826.0,12214.0],ctrans,1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-11092.0,9273.0],ctrans,1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-9376.0,-2761.0],ctrans,1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-11546.0,-3341.0],ctrans,1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-12911.0,-2130.0],ctrans,1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-12177.0,-5071.0],ctrans,1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-9.0,-4491.0],ctrans,1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-2179.0,-5071.0],ctrans,1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-3544.0,-3860.0],ctrans,1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-2810.0,-6801.0],ctrans,1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,3166.0,-5417.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,15517.0,2990.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,7814.0,-270.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,5644.0,-2321.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-1603.0,2146.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,3453.0,6466.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,10580.0,4216.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,4909.0,2726.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-7940.0,-2950.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-2688.0,-1585.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-1954.0,-4526.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-5314.0,-6266.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-8955.0,1916.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-6855.0,6466.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-2183.0,5406.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-5594.0,1336.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,3453.0,-8346.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,13030.0,95.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,14920.0,-4526.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,12750.0,-5106.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,7659.0,-5417.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,9958.0,-3560.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,22309.0,4847.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,14606.0,1587.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,12436.0,-464.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,5189.0,4003.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,10245.0,8323.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,17372.0,6073.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,11701.0,4583.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-1148.0,-1093.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,4104.0,272.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,4838.0,-2669.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,1478.0,-4409.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-2163.0,3773.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-63.0,8323.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,4609.0,7263.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,1198.0,3193.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,10245.0,-6489.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,19822.0,1952.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,21712.0,-2669.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,19542.0,-3249.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,14451.0,-3560.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,16776.0,-3614.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,14606.0,-5665.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,21992.0,-3249.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,23882.0,-7870.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,21712.0,-8450.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,16621.0,-8761.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,18920.0,-6904.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,21398.0,-3808.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,23413.0,-6904.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-10531.0,-3614.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-12701.0,-5665.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-5315.0,-3249.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-3425.0,-7870.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-5595.0,-8450.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-10686.0,-8761.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-8387.0,-6904.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-5909.0,-3808.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-3894.0,-6904.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-10531.0,8919.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-12701.0,6868.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-5315.0,9284.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-3425.0,4663.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-5595.0,4083.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-10686.0,3772.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-8387.0,5629.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-5909.0,8725.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-3894.0,5629.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,18388.0,9294.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,10685.0,6034.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,8515.0,3983.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,13451.0,10520.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,7780.0,9030.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,15901.0,6399.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,12829.0,2744.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,25180.0,11151.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,17477.0,7891.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,15307.0,5840.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,8060.0,10307.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,20243.0,12377.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,14572.0,10887.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,6975.0,6576.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,7709.0,3635.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,22693.0,8256.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,24583.0,3635.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,22413.0,3055.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,17322.0,2744.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,19647.0,2690.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,24863.0,3055.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,24269.0,2496.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,2458.0,2272.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-5245.0,-988.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-7415.0,-3039.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-2479.0,3498.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-8150.0,2008.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-29.0,-623.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-3101.0,-4278.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,9250.0,4129.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,1547.0,869.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-623.0,-1182.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-7870.0,3285.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,4313.0,5355.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-1358.0,3865.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-8955.0,-446.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-8221.0,-3387.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,6763.0,1234.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,8653.0,-3387.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,6483.0,-3967.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,1392.0,-4278.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,3717.0,-4332.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,8933.0,-3967.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,8339.0,-4526.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,255.0,8176.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-7448.0,4916.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-9618.0,2865.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-4682.0,9402.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-10353.0,7912.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-2232.0,5281.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-5304.0,1626.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,7047.0,10033.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-656.0,6773.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-2826.0,4722.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-10073.0,9189.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,2110.0,11259.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-3561.0,9769.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-11158.0,5458.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-10424.0,2517.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,4560.0,7138.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,6450.0,2517.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,4280.0,1937.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-811.0,1626.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,1514.0,1572.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,6730.0,1937.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,6136.0,1378.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-1166.0,-4933.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,11185.0,3474.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,3482.0,214.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,1312.0,-1837.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-5935.0,2630.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-879.0,6950.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,6248.0,4700.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,577.0,3210.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-12272.0,-2466.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-7020.0,-1101.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-6286.0,-4042.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-9646.0,-5782.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-13287.0,2400.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-11187.0,6950.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-6515.0,5890.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-9926.0,1820.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-879.0,-7862.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,8698.0,579.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,10588.0,-4042.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,8418.0,-4622.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,3327.0,-4933.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,5626.0,-3076.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,17977.0,5331.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,10274.0,2071.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,8104.0,20.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,857.0,4487.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,5913.0,8807.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,13040.0,6557.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,7369.0,5067.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-5480.0,-609.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-228.0,756.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,506.0,-2185.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-2854.0,-3925.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-6495.0,4257.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-4395.0,8807.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,277.0,7747.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-3134.0,3677.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,5913.0,-6005.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,15490.0,2436.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,17380.0,-2185.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,15210.0,-2765.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,10119.0,-3076.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,12444.0,-3130.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,10274.0,-5181.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,17660.0,-2765.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,19550.0,-7386.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,17380.0,-7966.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,12289.0,-8277.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,14588.0,-6420.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,17066.0,-3324.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,19081.0,-6420.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-14863.0,-3130.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-17033.0,-5181.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-9647.0,-2765.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-7757.0,-7386.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-9927.0,-7966.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-15018.0,-8277.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-12719.0,-6420.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-10241.0,-3324.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-8226.0,-6420.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-14863.0,9403.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-17033.0,7352.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-9647.0,9768.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-7757.0,5147.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-9927.0,4567.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-15018.0,4256.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-12719.0,6113.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-10241.0,9209.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-8226.0,6113.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,14056.0,9778.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,6353.0,6518.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,4183.0,4467.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,9119.0,11004.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,3448.0,9514.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,11569.0,6883.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,8497.0,3228.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,20848.0,11635.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,13145.0,8375.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,10975.0,6324.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,3728.0,10791.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,15911.0,12861.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,10240.0,11371.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,2643.0,7060.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,3377.0,4119.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,18361.0,8740.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,20251.0,4119.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,18081.0,3539.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,12990.0,3228.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,15315.0,3174.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,20531.0,3539.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,19937.0,2980.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-1874.0,2756.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-9577.0,-504.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-11747.0,-2555.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-6811.0,3982.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-12482.0,2492.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-4361.0,-139.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-7433.0,-3794.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,4918.0,4613.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-2785.0,1353.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-4955.0,-698.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-12202.0,3769.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-19.0,5839.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-5690.0,4349.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-13287.0,38.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-12553.0,-2903.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,2431.0,1718.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,4321.0,-2903.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,2151.0,-3483.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-2940.0,-3794.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,85.0,-3686.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,4601.0,-3483.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,4007.0,-4042.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-4077.0,8660.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-11780.0,5400.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-13950.0,3349.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-9014.0,9886.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-14685.0,8396.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-6564.0,5765.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-9636.0,2110.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,2715.0,10517.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-4988.0,7257.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-7158.0,5206.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-14405.0,9673.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-2222.0,11743.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-7893.0,10253.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-15490.0,5942.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-14756.0,3001.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,228.0,7622.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,2118.0,3001.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-52.0,2421.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-5143.0,2110.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-2818.0,2056.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,2398.0,2421.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,1804.0,1862.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,4099.0,-497.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,16450.0,7910.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,8747.0,4650.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,6577.0,2599.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-670.0,7066.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,4386.0,11386.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,11513.0,9136.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,5842.0,7646.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-7007.0,1970.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-1755.0,3335.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-1021.0,394.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-4381.0,-1346.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-8022.0,6836.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-5922.0,11386.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-1250.0,10326.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-4661.0,6256.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,4386.0,-3426.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,13963.0,5015.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,15853.0,394.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,13683.0,-186.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,8592.0,-497.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,10891.0,1360.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,23242.0,9767.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,15539.0,6507.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,13369.0,4456.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,6122.0,8923.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,11178.0,13243.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,18305.0,10993.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,12634.0,9503.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-215.0,3827.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,5037.0,5192.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,5771.0,2251.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,2411.0,511.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-1230.0,8693.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,870.0,13243.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,5542.0,12183.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,2131.0,8113.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,11178.0,-1569.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,20755.0,6872.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,22645.0,2251.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,20475.0,1671.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,15384.0,1360.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,17709.0,1306.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,15539.0,-745.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,22925.0,1671.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,24815.0,-2950.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,22645.0,-3530.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,17554.0,-3841.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,19853.0,-1984.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,22331.0,1112.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,24346.0,-1984.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-9598.0,1306.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-11768.0,-745.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-4382.0,1671.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-2492.0,-2950.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-4662.0,-3530.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-9753.0,-3841.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-7454.0,-1984.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-4976.0,1112.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-2961.0,-1984.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-9598.0,13839.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-11768.0,11788.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-4382.0,14204.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-2492.0,9583.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-4662.0,9003.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-9753.0,8692.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-7454.0,10549.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-4976.0,13645.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-2961.0,10549.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,18592.0,4455.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,30943.0,12862.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,23240.0,9602.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,21070.0,7551.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,20335.0,12598.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,18879.0,1526.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,28456.0,9967.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,30346.0,5346.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,28176.0,4766.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,23085.0,4455.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,25384.0,6312.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,30032.0,11459.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,27862.0,9408.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,19530.0,10144.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,20264.0,7203.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,16904.0,5463.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,16624.0,13065.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,25671.0,3383.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,29877.0,6312.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,32202.0,6258.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,30032.0,4207.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,32047.0,1111.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,9832.0,11208.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,22183.0,19615.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,14480.0,16355.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,12310.0,14304.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,11575.0,19351.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,10119.0,8279.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,19696.0,16720.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,21586.0,12099.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,19416.0,11519.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,14325.0,11208.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,16624.0,13065.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,21272.0,18212.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,19102.0,16161.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,10770.0,16897.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,11504.0,13956.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,8144.0,12216.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,7864.0,19818.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,16911.0,10136.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,21117.0,13065.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,23442.0,13011.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,21272.0,10960.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,23287.0,7864.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-9511.0,2599.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,2840.0,11006.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-4863.0,7746.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-7033.0,5695.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-7768.0,10742.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-9224.0,-330.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,353.0,8111.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,2243.0,3490.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,73.0,2910.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-5018.0,2599.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-2719.0,4456.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,1929.0,9603.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-241.0,7552.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-8573.0,8288.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-7839.0,5347.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-11199.0,3607.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-11479.0,11209.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-2432.0,1527.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,1774.0,4456.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,4099.0,4402.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,1929.0,2351.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,3944.0,-745.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			break;
		case 2:
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-1914.0,-2897.0],ctrans,1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,10437.0,5510.0],ctrans,1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,2734.0,2250.0],ctrans,1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,564.0,199.0],ctrans,1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-6683.0,4666.0],ctrans,1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-1627.0,8986.0],ctrans,1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,5500.0,6736.0],ctrans,1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-171.0,5246.0],ctrans,1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-13020.0,-430.0],ctrans,1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-7768.0,935.0],ctrans,1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-7034.0,-2006.0],ctrans,1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-10394.0,-3746.0],ctrans,1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-14035.0,4436.0],ctrans,1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-11935.0,8986.0],ctrans,1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-7263.0,7926.0],ctrans,1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-10674.0,3856.0],ctrans,1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-1627.0,-5826.0],ctrans,1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,7950.0,2615.0],ctrans,1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,9840.0,-2006.0],ctrans,1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,7670.0,-2586.0],ctrans,1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,2579.0,-2897.0],ctrans,1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,12159.0,-5207.0],ctrans,1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,24510.0,3200.0],ctrans,1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,16807.0,-60.0],ctrans,1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,14637.0,-2111.0],ctrans,1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,7390.0,2356.0],ctrans,1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,12446.0,6676.0],ctrans,1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,19573.0,4426.0],ctrans,1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,13902.0,2936.0],ctrans,1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,1053.0,-2740.0],ctrans,1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,6305.0,-1375.0],ctrans,1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,7039.0,-4316.0],ctrans,1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,3679.0,-6056.0],ctrans,1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,38.0,2126.0],ctrans,1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,2138.0,6676.0],ctrans,1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,6810.0,5616.0],ctrans,1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,3399.0,1546.0],ctrans,1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,12446.0,-8136.0],ctrans,1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,22023.0,305.0],ctrans,1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,23913.0,-4316.0],ctrans,1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,21743.0,-4896.0],ctrans,1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,16652.0,-5207.0],ctrans,1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,20922.0,10236.0],ctrans,1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,18752.0,9656.0],ctrans,1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,17387.0,10867.0],ctrans,1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,18121.0,7926.0],ctrans,1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,10574.0,11296.0],ctrans,1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,8404.0,10716.0],ctrans,1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,7039.0,11927.0],ctrans,1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,7773.0,8986.0],ctrans,1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-2869.0,11296.0],ctrans,1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-5039.0,10716.0],ctrans,1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-6404.0,11927.0],ctrans,1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-5670.0,8986.0],ctrans,1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-12515.0,10236.0],ctrans,1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-14685.0,9656.0],ctrans,1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-16050.0,10867.0],ctrans,1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-15316.0,7926.0],ctrans,1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-13600.0,-4108.0],ctrans,1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-15770.0,-4688.0],ctrans,1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-17135.0,-3477.0],ctrans,1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-16401.0,-6418.0],ctrans,1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-4233.0,-5838.0],ctrans,1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-6403.0,-6418.0],ctrans,1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-7768.0,-5207.0],ctrans,1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-7034.0,-8148.0],ctrans,1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,5278.0,-7193.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,17629.0,1214.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,9926.0,-2046.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,7756.0,-4097.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,509.0,370.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,5565.0,4690.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,12692.0,2440.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,7021.0,950.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-5828.0,-4726.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-576.0,-3361.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,158.0,-6302.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-3202.0,-8042.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-6843.0,140.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-4743.0,4690.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-71.0,3630.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-3482.0,-440.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,5565.0,-10122.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,15142.0,-1681.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,17032.0,-6302.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,14862.0,-6882.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,9771.0,-7193.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,12070.0,-5336.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,24421.0,3071.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,16718.0,-189.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,14548.0,-2240.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,7301.0,2227.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,12357.0,6547.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,19484.0,4297.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,13813.0,2807.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,964.0,-2869.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,6216.0,-1504.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,6950.0,-4445.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,3590.0,-6185.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-51.0,1997.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,2049.0,6547.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,6721.0,5487.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,3310.0,1417.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,12357.0,-8265.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,21934.0,176.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,23824.0,-4445.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,21654.0,-5025.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,16563.0,-5336.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,18888.0,-5390.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,16718.0,-7441.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,24104.0,-5025.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,25994.0,-9646.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,23824.0,-10226.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,18733.0,-10537.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,21032.0,-8680.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,23510.0,-5584.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,25525.0,-8680.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-8419.0,-5390.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-10589.0,-7441.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-3203.0,-5025.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-1313.0,-9646.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-3483.0,-10226.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-8574.0,-10537.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-6275.0,-8680.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-3797.0,-5584.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-1782.0,-8680.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-8419.0,7143.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-10589.0,5092.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-3203.0,7508.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-1313.0,2887.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-3483.0,2307.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-8574.0,1996.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-6275.0,3853.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-3797.0,6949.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-1782.0,3853.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,20500.0,7518.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,12797.0,4258.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,10627.0,2207.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,15563.0,8744.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,9892.0,7254.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,18013.0,4623.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,14941.0,968.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,27292.0,9375.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,19589.0,6115.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,17419.0,4064.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,10172.0,8531.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,22355.0,10601.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,16684.0,9111.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,9087.0,4800.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,9821.0,1859.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,24805.0,6480.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,26695.0,1859.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,24525.0,1279.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,19434.0,968.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,21759.0,914.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,26975.0,1279.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,26381.0,720.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,4570.0,496.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-3133.0,-2764.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-5303.0,-4815.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-367.0,1722.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-6038.0,232.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,2083.0,-2399.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-989.0,-6054.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,11362.0,2353.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,3659.0,-907.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,1489.0,-2958.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-5758.0,1509.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,6425.0,3579.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,754.0,2089.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-6843.0,-2222.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-6109.0,-5163.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,8875.0,-542.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,10765.0,-5163.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,8595.0,-5743.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,3590.0,-5895.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,5829.0,-6108.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,11045.0,-5743.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,10451.0,-6302.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,2367.0,6400.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-5336.0,3140.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-7506.0,1089.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-2570.0,7626.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-8241.0,6136.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-120.0,3505.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-3192.0,-150.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,9159.0,8257.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,1456.0,4997.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-714.0,2946.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-7961.0,7413.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,4222.0,9483.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-1449.0,7993.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-9046.0,3682.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-8312.0,741.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,6672.0,5362.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,8562.0,741.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,6392.0,161.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,1301.0,-150.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,3626.0,-204.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,8842.0,161.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,8248.0,-398.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,946.0,-6709.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,13297.0,1698.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,5594.0,-1562.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,3424.0,-3613.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-3823.0,854.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,1233.0,5174.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,8360.0,2924.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,2689.0,1434.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-10160.0,-4242.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-4908.0,-2877.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-4174.0,-5818.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-7534.0,-7558.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-11175.0,624.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-9075.0,5174.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-4403.0,4114.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-7814.0,44.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,1233.0,-9638.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,10810.0,-1197.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,12700.0,-5818.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,10530.0,-6398.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,5439.0,-6709.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,7738.0,-4852.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,20089.0,3555.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,12386.0,295.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,10216.0,-1756.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,2969.0,2711.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,8025.0,7031.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,15152.0,4781.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,9481.0,3291.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-3368.0,-2385.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,1884.0,-1020.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,2618.0,-3961.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-742.0,-5701.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-4383.0,2481.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-2283.0,7031.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,2389.0,5971.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-1022.0,1901.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,8025.0,-7781.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,17602.0,660.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,19492.0,-3961.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,17322.0,-4541.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,12231.0,-4852.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,14556.0,-4906.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,12386.0,-6957.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,19772.0,-4541.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,21662.0,-9162.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,19492.0,-9742.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,14401.0,-10053.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,16700.0,-8196.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,19178.0,-5100.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,21193.0,-8196.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-12751.0,-4906.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-14921.0,-6957.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-7535.0,-4541.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-5645.0,-9162.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-7815.0,-9742.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-12906.0,-10053.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-10607.0,-8196.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-8129.0,-5100.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-6114.0,-8196.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-12751.0,7627.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-14921.0,5576.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-7535.0,7992.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-5645.0,3371.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-7815.0,2791.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-12906.0,2480.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-10607.0,4337.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-8129.0,7433.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-6114.0,4337.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,16168.0,8002.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,8465.0,4742.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,6295.0,2691.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,11231.0,9228.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,5560.0,7738.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,13681.0,5107.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,10609.0,1452.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,22960.0,9859.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,15257.0,6599.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,13087.0,4548.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,5840.0,9015.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,18023.0,11085.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,12352.0,9595.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,4755.0,5284.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,5489.0,2343.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,20473.0,6964.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,22363.0,2343.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,20193.0,1763.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,15102.0,1452.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,17427.0,1398.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,22643.0,1763.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,22049.0,1204.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,238.0,980.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-7465.0,-2280.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-9635.0,-4331.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-4699.0,2206.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-10370.0,716.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-2249.0,-1915.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-5321.0,-5570.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,7030.0,2837.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-673.0,-423.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-2843.0,-2474.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-10090.0,1993.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,2093.0,4063.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-3578.0,2573.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-11175.0,-1738.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-10441.0,-4679.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,4543.0,-58.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,6433.0,-4679.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,4263.0,-5259.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-828.0,-5570.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,2197.0,-5462.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,6713.0,-5259.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,6119.0,-5818.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-1965.0,6884.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-9668.0,3624.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-11838.0,1573.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-6902.0,8110.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-12573.0,6620.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-4452.0,3989.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-7524.0,334.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,4827.0,8741.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-2876.0,5481.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-5046.0,3430.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-12293.0,7897.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-110.0,9967.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-5781.0,8477.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-13378.0,4166.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-12644.0,1225.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,2340.0,5846.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,4230.0,1225.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,2060.0,645.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-3031.0,334.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-706.0,280.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,4510.0,645.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,3916.0,86.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,46)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,1780.0,-3921.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,14131.0,4486.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,6428.0,1226.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,4258.0,-825.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-2989.0,3642.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,2067.0,7962.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,9194.0,5712.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,3523.0,4222.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-9326.0,-1454.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-4074.0,-89.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-3340.0,-3030.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-6700.0,-4770.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-10341.0,3412.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-8241.0,7962.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-3569.0,6902.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-6980.0,2832.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,2067.0,-6850.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,11644.0,1591.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,13534.0,-3030.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,11364.0,-3610.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,6273.0,-3921.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,8572.0,-2064.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,20923.0,6343.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,13220.0,3083.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,11050.0,1032.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,3803.0,5499.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,8859.0,9819.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,15986.0,7569.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,10315.0,6079.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-2534.0,403.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,2718.0,1768.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,3452.0,-1173.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,92.0,-2913.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-3549.0,5269.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-1449.0,9819.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,3223.0,8759.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-188.0,4689.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,8859.0,-4993.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,18436.0,3448.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,20326.0,-1173.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,18156.0,-1753.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,13065.0,-2064.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,15390.0,-2118.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,13220.0,-4169.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,20606.0,-1753.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,22496.0,-6374.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,20326.0,-6954.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,15235.0,-7265.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,17534.0,-5408.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,20012.0,-2312.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,22027.0,-5408.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-11917.0,-2118.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-14087.0,-4169.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-6701.0,-1753.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-4811.0,-6374.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-6981.0,-6954.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-12072.0,-7265.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-9773.0,-5408.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-7295.0,-2312.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-5280.0,-5408.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-11917.0,10415.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-14087.0,8364.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-6701.0,10780.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-4811.0,6159.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-6981.0,5579.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-12072.0,5268.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-9773.0,7125.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-7295.0,10221.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-5280.0,7125.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,16273.0,1031.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,28624.0,9438.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,20921.0,6178.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,18751.0,4127.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,18016.0,9174.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,16560.0,-1898.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,26137.0,6543.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,28027.0,1922.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,25857.0,1342.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,20766.0,1031.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,23065.0,2888.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,27713.0,8035.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,25543.0,5984.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,17211.0,6720.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,17945.0,3779.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,14585.0,2039.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,14305.0,9641.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,23352.0,-41.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,27558.0,2888.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,29883.0,2834.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,27713.0,783.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,29728.0,-2313.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,7513.0,7784.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,19864.0,16191.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,12161.0,12931.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,9991.0,10880.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,9256.0,15927.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,7800.0,4855.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,17377.0,13296.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,19267.0,8675.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,17097.0,8095.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,12006.0,7784.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,14305.0,9641.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,18953.0,14788.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,16783.0,12737.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,8451.0,13473.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,9185.0,10532.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,5825.0,8792.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,5545.0,16394.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,14592.0,6712.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,18798.0,9641.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,21123.0,9587.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,18953.0,7536.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,20968.0,4440.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-11830.0,-825.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,521.0,7582.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-7182.0,4322.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-9352.0,2271.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-10087.0,7318.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-11543.0,-3754.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-1966.0,4687.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-76.0,66.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-2246.0,-514.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-7337.0,-825.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-5038.0,1032.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-390.0,6179.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-2560.0,4128.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-10892.0,4864.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-10158.0,1923.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-13518.0,183.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-13798.0,7785.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-4751.0,-1897.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-545.0,1032.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,1780.0,978.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,-390.0,-1073.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			place("sprite235",cold_canvas,ctx,[1.0,0.0,0.0,1.0,1625.0,-4169.0],ctrans.merge(new cxform(0,0,0,0,256,256,256,110)),1,(0+time)%1,0,time);
			break;
	}
}

function sprite237(ctx,ctrans,frame,ratio,time){
	ctx.save();
	ctx.transform(1,0,0,1,593.35,307.2);
	var clips = [];
	var frame_cnt = 44;
	frame = frame % frame_cnt;
	switch(frame){
		case 0:
			place("shape229",cold_canvas,ctx,[0.05,0.0,0.0,0.05,0.0,0.0],ctrans,1,0,0,time);
			place("shape230",cold_canvas,ctx,[0.019620513916015624,0.0,0.0,0.01732635498046875,-148.05,-0.35],ctrans,1,0,0,time);
			place("shape230",cold_canvas,ctx,[0.05,0.0,0.0,0.05,-310.1,-211.05],ctrans,1,0,0,time);
			place("shape230",cold_canvas,ctx,[0.05,0.0,0.0,0.05,142.75,-204.55],ctrans,1,0,0,time);
			place("shape231",cold_canvas,ctx,[0.05,0.0,0.0,0.05,0.0,0.0],ctrans,1,0,0,time);
			place("sprite233",cold_canvas,ctx,[0.05,0.0,0.0,0.05,-93.8,-145.75],ctrans,1,(0+time)%1,0,time);
			place("sprite236",cold_canvas,ctx,[0.0247711181640625,0.0,0.0,0.0247711181640625,-168.9,-25.85],ctrans,1,(0+time)%3,0,time);
			break;
		case 1:
			place("shape229",cold_canvas,ctx,[0.05,0.0,0.0,0.05,0.0,0.0],ctrans,1,0,0,time);
			place("shape230",cold_canvas,ctx,[0.019620513916015624,0.0,0.0,0.01732635498046875,-148.05,-0.35],ctrans,1,0,0,time);
			place("shape230",cold_canvas,ctx,[0.05,0.0,0.0,0.05,-310.1,-211.05],ctrans,1,0,0,time);
			place("shape230",cold_canvas,ctx,[0.05,0.0,0.0,0.05,142.75,-204.55],ctrans,1,0,0,time);
			place("shape231",cold_canvas,ctx,[0.05,0.0,0.0,0.05,0.0,0.0],ctrans,1,0,0,time);
			place("sprite233",cold_canvas,ctx,[0.049993133544921874,-4.69970703125E-4,4.69970703125E-4,0.049993133544921874,-97.1,-144.4],ctrans,1,(0+time)%1,0,time);
			place("sprite236",cold_canvas,ctx,[0.0247711181640625,0.0,0.0,0.0247711181640625,-168.9,-25.85],ctrans,1,(1+time)%3,0,time);
			break;
		case 2:
			place("shape229",cold_canvas,ctx,[0.05,0.0,0.0,0.05,0.0,0.0],ctrans,1,0,0,time);
			place("shape230",cold_canvas,ctx,[0.019620513916015624,0.0,0.0,0.01732635498046875,-148.05,-0.35],ctrans,1,0,0,time);
			place("shape230",cold_canvas,ctx,[0.05,0.0,0.0,0.05,-310.1,-211.05],ctrans,1,0,0,time);
			place("shape230",cold_canvas,ctx,[0.05,0.0,0.0,0.05,142.75,-204.55],ctrans,1,0,0,time);
			place("shape231",cold_canvas,ctx,[0.05,0.0,0.0,0.05,0.0,0.0],ctrans,1,0,0,time);
			place("sprite233",cold_canvas,ctx,[0.049977874755859374,-0.00110321044921875,0.00110321044921875,0.049977874755859374,-101.55,-142.5],ctrans,1,(0+time)%1,0,time);
			place("sprite236",cold_canvas,ctx,[0.0247711181640625,0.0,0.0,0.0247711181640625,-168.9,-25.85],ctrans,1,(2+time)%3,0,time);
			break;
		case 3:
			place("shape229",cold_canvas,ctx,[0.05,0.0,0.0,0.05,0.0,0.0],ctrans,1,0,0,time);
			place("shape230",cold_canvas,ctx,[0.019620513916015624,0.0,0.0,0.01732635498046875,-148.05,-0.35],ctrans,1,0,0,time);
			place("shape230",cold_canvas,ctx,[0.05,0.0,0.0,0.05,-310.1,-211.05],ctrans,1,0,0,time);
			place("shape230",cold_canvas,ctx,[0.05,0.0,0.0,0.05,142.75,-204.55],ctrans,1,0,0,time);
			place("shape231",cold_canvas,ctx,[0.05,0.0,0.0,0.05,0.0,0.0],ctrans,1,0,0,time);
			place("sprite233",cold_canvas,ctx,[0.0499603271484375,-0.00157318115234375,0.00157318115234375,0.0499603271484375,-104.85,-140.95],ctrans,1,(0+time)%1,0,time);
			place("sprite236",cold_canvas,ctx,[0.0247711181640625,0.0,0.0,0.0247711181640625,-168.9,-25.85],ctrans,1,(0+time)%3,0,time);
			break;
		case 4:
			place("shape229",cold_canvas,ctx,[0.05,0.0,0.0,0.05,0.0,0.0],ctrans,1,0,0,time);
			place("shape230",cold_canvas,ctx,[0.019620513916015624,0.0,0.0,0.01732635498046875,-148.05,-0.35],ctrans,1,0,0,time);
			place("shape230",cold_canvas,ctx,[0.05,0.0,0.0,0.05,-310.1,-211.05],ctrans,1,0,0,time);
			place("shape230",cold_canvas,ctx,[0.05,0.0,0.0,0.05,142.75,-204.55],ctrans,1,0,0,time);
			place("shape231",cold_canvas,ctx,[0.05,0.0,0.0,0.05,0.0,0.0],ctrans,1,0,0,time);
			place("sprite233",cold_canvas,ctx,[0.04993133544921875,-0.002205657958984375,0.002205657958984375,0.04993133544921875,-109.25,-138.95],ctrans,1,(0+time)%1,0,time);
			place("sprite236",cold_canvas,ctx,[0.0247711181640625,0.0,0.0,0.0247711181640625,-168.9,-25.85],ctrans,1,(1+time)%3,0,time);
			break;
		case 5:
			place("shape229",cold_canvas,ctx,[0.05,0.0,0.0,0.05,0.0,0.0],ctrans,1,0,0,time);
			place("shape230",cold_canvas,ctx,[0.019620513916015624,0.0,0.0,0.01732635498046875,-148.05,-0.35],ctrans,1,0,0,time);
			place("shape230",cold_canvas,ctx,[0.05,0.0,0.0,0.05,-310.1,-211.05],ctrans,1,0,0,time);
			place("shape230",cold_canvas,ctx,[0.05,0.0,0.0,0.05,142.75,-204.55],ctrans,1,0,0,time);
			place("shape231",cold_canvas,ctx,[0.05,0.0,0.0,0.05,0.0,0.0],ctrans,1,0,0,time);
			place("sprite233",cold_canvas,ctx,[0.04989471435546875,-0.002838134765625,0.002838134765625,0.04989471435546875,-113.6,-136.95],ctrans,1,(0+time)%1,0,time);
			place("sprite236",cold_canvas,ctx,[0.0247711181640625,0.0,0.0,0.0247711181640625,-168.9,-25.85],ctrans,1,(2+time)%3,0,time);
			break;
		case 6:
			place("shape229",cold_canvas,ctx,[0.05,0.0,0.0,0.05,0.0,0.0],ctrans,1,0,0,time);
			place("shape230",cold_canvas,ctx,[0.019620513916015624,0.0,0.0,0.01732635498046875,-148.05,-0.35],ctrans,1,0,0,time);
			place("shape230",cold_canvas,ctx,[0.05,0.0,0.0,0.05,-310.1,-211.05],ctrans,1,0,0,time);
			place("shape230",cold_canvas,ctx,[0.05,0.0,0.0,0.05,142.75,-204.55],ctrans,1,0,0,time);
			place("shape231",cold_canvas,ctx,[0.05,0.0,0.0,0.05,0.0,0.0],ctrans,1,0,0,time);
			place("sprite233",cold_canvas,ctx,[0.04986114501953125,-0.00330657958984375,0.00330657958984375,0.04986114501953125,-116.9,-135.35],ctrans,1,(0+time)%1,0,time);
			place("sprite236",cold_canvas,ctx,[0.0247711181640625,0.0,0.0,0.0247711181640625,-168.9,-25.85],ctrans,1,(0+time)%3,0,time);
			break;
		case 7:
			place("shape229",cold_canvas,ctx,[0.05,0.0,0.0,0.05,0.0,0.0],ctrans,1,0,0,time);
			place("shape230",cold_canvas,ctx,[0.019620513916015624,0.0,0.0,0.01732635498046875,-148.05,-0.35],ctrans,1,0,0,time);
			place("shape230",cold_canvas,ctx,[0.05,0.0,0.0,0.05,-310.1,-211.05],ctrans,1,0,0,time);
			place("shape230",cold_canvas,ctx,[0.05,0.0,0.0,0.05,142.75,-204.55],ctrans,1,0,0,time);
			place("shape231",cold_canvas,ctx,[0.05,0.0,0.0,0.05,0.0,0.0],ctrans,1,0,0,time);
			place("sprite233",cold_canvas,ctx,[0.049810791015625,-0.00393829345703125,0.00393829345703125,0.049810791015625,-121.2,-133.15],ctrans,1,(0+time)%1,0,time);
			place("sprite236",cold_canvas,ctx,[0.0247711181640625,0.0,0.0,0.0247711181640625,-168.9,-25.85],ctrans,1,(1+time)%3,0,time);
			break;
		case 8:
			place("shape229",cold_canvas,ctx,[0.05,0.0,0.0,0.05,0.0,0.0],ctrans,1,0,0,time);
			place("shape230",cold_canvas,ctx,[0.019620513916015624,0.0,0.0,0.01732635498046875,-148.05,-0.35],ctrans,1,0,0,time);
			place("shape230",cold_canvas,ctx,[0.05,0.0,0.0,0.05,-310.1,-211.05],ctrans,1,0,0,time);
			place("shape230",cold_canvas,ctx,[0.05,0.0,0.0,0.05,142.75,-204.55],ctrans,1,0,0,time);
			place("shape231",cold_canvas,ctx,[0.05,0.0,0.0,0.05,0.0,0.0],ctrans,1,0,0,time);
			place("sprite233",cold_canvas,ctx,[0.04976730346679688,-0.004405975341796875,0.004405975341796875,0.04976730346679688,-124.35,-131.55],ctrans,1,(0+time)%1,0,time);
			place("sprite236",cold_canvas,ctx,[0.0247711181640625,0.0,0.0,0.0247711181640625,-168.9,-25.85],ctrans,1,(2+time)%3,0,time);
			break;
		case 9:
			place("shape229",cold_canvas,ctx,[0.05,0.0,0.0,0.05,0.0,0.0],ctrans,1,0,0,time);
			place("shape230",cold_canvas,ctx,[0.019620513916015624,0.0,0.0,0.01732635498046875,-148.05,-0.35],ctrans,1,0,0,time);
			place("shape230",cold_canvas,ctx,[0.05,0.0,0.0,0.05,-310.1,-211.05],ctrans,1,0,0,time);
			place("shape230",cold_canvas,ctx,[0.05,0.0,0.0,0.05,142.75,-204.55],ctrans,1,0,0,time);
			place("shape231",cold_canvas,ctx,[0.05,0.0,0.0,0.05,0.0,0.0],ctrans,1,0,0,time);
			place("sprite233",cold_canvas,ctx,[0.049701690673828125,-0.005036163330078125,0.005036163330078125,0.049701690673828125,-128.65,-129.3],ctrans,1,(0+time)%1,0,time);
			place("sprite236",cold_canvas,ctx,[0.0247711181640625,0.0,0.0,0.0247711181640625,-168.9,-25.85],ctrans,1,(0+time)%3,0,time);
			break;
		case 10:
			place("shape229",cold_canvas,ctx,[0.05,0.0,0.0,0.05,0.0,0.0],ctrans,1,0,0,time);
			place("shape230",cold_canvas,ctx,[0.019620513916015624,0.0,0.0,0.01732635498046875,-148.05,-0.35],ctrans,1,0,0,time);
			place("shape230",cold_canvas,ctx,[0.05,0.0,0.0,0.05,-310.1,-211.05],ctrans,1,0,0,time);
			place("shape230",cold_canvas,ctx,[0.05,0.0,0.0,0.05,142.75,-204.55],ctrans,1,0,0,time);
			place("shape231",cold_canvas,ctx,[0.05,0.0,0.0,0.05,0.0,0.0],ctrans,1,0,0,time);
			place("sprite233",cold_canvas,ctx,[0.04962921142578125,-0.00566558837890625,0.00566558837890625,0.04962921142578125,-132.8,-127.0],ctrans,1,(0+time)%1,0,time);
			place("sprite236",cold_canvas,ctx,[0.0247711181640625,0.0,0.0,0.0247711181640625,-168.9,-25.85],ctrans,1,(1+time)%3,0,time);
			break;
		case 11:
			place("shape229",cold_canvas,ctx,[0.05,0.0,0.0,0.05,0.0,0.0],ctrans,1,0,0,time);
			place("shape230",cold_canvas,ctx,[0.019620513916015624,0.0,0.0,0.01732635498046875,-148.05,-0.35],ctrans,1,0,0,time);
			place("shape230",cold_canvas,ctx,[0.05,0.0,0.0,0.05,-310.1,-211.05],ctrans,1,0,0,time);
			place("shape230",cold_canvas,ctx,[0.05,0.0,0.0,0.05,142.75,-204.55],ctrans,1,0,0,time);
			place("shape231",cold_canvas,ctx,[0.05,0.0,0.0,0.05,0.0,0.0],ctrans,1,0,0,time);
			place("sprite233",cold_canvas,ctx,[0.04956893920898438,-0.006131744384765625,0.006131744384765625,0.04956893920898438,-135.95,-125.25],ctrans,1,(0+time)%1,0,time);
			place("sprite236",cold_canvas,ctx,[0.0247711181640625,0.0,0.0,0.0247711181640625,-168.9,-25.85],ctrans,1,(2+time)%3,0,time);
			break;
		case 12:
			place("shape229",cold_canvas,ctx,[0.05,0.0,0.0,0.05,0.0,0.0],ctrans,1,0,0,time);
			place("shape230",cold_canvas,ctx,[0.019620513916015624,0.0,0.0,0.01732635498046875,-148.05,-0.35],ctrans,1,0,0,time);
			place("shape230",cold_canvas,ctx,[0.05,0.0,0.0,0.05,-310.1,-211.05],ctrans,1,0,0,time);
			place("shape230",cold_canvas,ctx,[0.05,0.0,0.0,0.05,142.75,-204.55],ctrans,1,0,0,time);
			place("shape231",cold_canvas,ctx,[0.05,0.0,0.0,0.05,0.0,0.0],ctrans,1,0,0,time);
			place("sprite233",cold_canvas,ctx,[0.049481964111328124,-0.0067596435546875,0.0067596435546875,0.049481964111328124,-140.2,-122.8],ctrans,1,(0+time)%1,0,time);
			place("sprite236",cold_canvas,ctx,[0.0247711181640625,0.0,0.0,0.0247711181640625,-168.9,-25.85],ctrans,1,(0+time)%3,0,time);
			break;
		case 13:
			place("shape229",cold_canvas,ctx,[0.05,0.0,0.0,0.05,0.0,0.0],ctrans,1,0,0,time);
			place("shape230",cold_canvas,ctx,[0.019620513916015624,0.0,0.0,0.01732635498046875,-148.05,-0.35],ctrans,1,0,0,time);
			place("shape230",cold_canvas,ctx,[0.05,0.0,0.0,0.05,-310.1,-211.05],ctrans,1,0,0,time);
			place("shape230",cold_canvas,ctx,[0.05,0.0,0.0,0.05,142.75,-204.55],ctrans,1,0,0,time);
			place("shape231",cold_canvas,ctx,[0.05,0.0,0.0,0.05,0.0,0.0],ctrans,1,0,0,time);
			place("sprite233",cold_canvas,ctx,[0.0494110107421875,-0.007387542724609375,0.007387542724609375,0.0494110107421875,-144.5,-120.55],ctrans,1,(0+time)%1,0,time);
			place("sprite236",cold_canvas,ctx,[0.0247711181640625,0.0,0.0,0.0247711181640625,-168.9,-25.85],ctrans,1,(1+time)%3,0,time);
			break;
		case 14:
			place("shape229",cold_canvas,ctx,[0.05,0.0,0.0,0.05,0.0,0.0],ctrans,1,0,0,time);
			place("shape230",cold_canvas,ctx,[0.019620513916015624,0.0,0.0,0.01732635498046875,-148.05,-0.35],ctrans,1,0,0,time);
			place("shape230",cold_canvas,ctx,[0.05,0.0,0.0,0.05,-310.1,-211.05],ctrans,1,0,0,time);
			place("shape230",cold_canvas,ctx,[0.05,0.0,0.0,0.05,142.75,-204.55],ctrans,1,0,0,time);
			place("shape231",cold_canvas,ctx,[0.05,0.0,0.0,0.05,0.0,0.0],ctrans,1,0,0,time);
			place("sprite233",cold_canvas,ctx,[0.04945068359375,-0.00697021484375,0.00697021484375,0.04945068359375,-141.65,-122.0],ctrans,1,(0+time)%1,0,time);
			place("sprite236",cold_canvas,ctx,[0.0247711181640625,0.0,0.0,0.0247711181640625,-168.9,-25.85],ctrans,1,(2+time)%3,0,time);
			break;
		case 15:
			place("shape229",cold_canvas,ctx,[0.05,0.0,0.0,0.05,0.0,0.0],ctrans,1,0,0,time);
			place("shape230",cold_canvas,ctx,[0.019620513916015624,0.0,0.0,0.01732635498046875,-148.05,-0.35],ctrans,1,0,0,time);
			place("shape230",cold_canvas,ctx,[0.05,0.0,0.0,0.05,-310.1,-211.05],ctrans,1,0,0,time);
			place("shape230",cold_canvas,ctx,[0.05,0.0,0.0,0.05,142.75,-204.55],ctrans,1,0,0,time);
			place("shape231",cold_canvas,ctx,[0.05,0.0,0.0,0.05,0.0,0.0],ctrans,1,0,0,time);
			place("sprite233",cold_canvas,ctx,[0.049510955810546875,-0.006554412841796875,0.006554412841796875,0.049510955810546875,-138.95,-123.6],ctrans,1,(0+time)%1,0,time);
			place("sprite236",cold_canvas,ctx,[0.0247711181640625,0.0,0.0,0.0247711181640625,-168.9,-25.85],ctrans,1,(0+time)%3,0,time);
			break;
		case 16:
			place("shape229",cold_canvas,ctx,[0.05,0.0,0.0,0.05,0.0,0.0],ctrans,1,0,0,time);
			place("shape230",cold_canvas,ctx,[0.019620513916015624,0.0,0.0,0.01732635498046875,-148.05,-0.35],ctrans,1,0,0,time);
			place("shape230",cold_canvas,ctx,[0.05,0.0,0.0,0.05,-310.1,-211.05],ctrans,1,0,0,time);
			place("shape230",cold_canvas,ctx,[0.05,0.0,0.0,0.05,142.75,-204.55],ctrans,1,0,0,time);
			place("shape231",cold_canvas,ctx,[0.05,0.0,0.0,0.05,0.0,0.0],ctrans,1,0,0,time);
			place("sprite233",cold_canvas,ctx,[0.04956893920898438,-0.00613861083984375,0.00613861083984375,0.04956893920898438,-136.05,-125.2],ctrans,1,(0+time)%1,0,time);
			place("sprite236",cold_canvas,ctx,[0.0247711181640625,0.0,0.0,0.0247711181640625,-168.9,-25.85],ctrans,1,(1+time)%3,0,time);
			break;
		case 17:
			place("shape229",cold_canvas,ctx,[0.05,0.0,0.0,0.05,0.0,0.0],ctrans,1,0,0,time);
			place("shape230",cold_canvas,ctx,[0.019620513916015624,0.0,0.0,0.01732635498046875,-148.05,-0.35],ctrans,1,0,0,time);
			place("shape230",cold_canvas,ctx,[0.05,0.0,0.0,0.05,-310.1,-211.05],ctrans,1,0,0,time);
			place("shape230",cold_canvas,ctx,[0.05,0.0,0.0,0.05,142.75,-204.55],ctrans,1,0,0,time);
			place("shape231",cold_canvas,ctx,[0.05,0.0,0.0,0.05,0.0,0.0],ctrans,1,0,0,time);
			place("sprite233",cold_canvas,ctx,[0.049602508544921875,-0.0058837890625,0.0058837890625,0.049602508544921875,-134.35,-126.15],ctrans,1,(0+time)%1,0,time);
			place("sprite236",cold_canvas,ctx,[0.0247711181640625,0.0,0.0,0.0247711181640625,-168.9,-25.85],ctrans,1,(2+time)%3,0,time);
			break;
		case 18:
			place("shape229",cold_canvas,ctx,[0.05,0.0,0.0,0.05,0.0,0.0],ctrans,1,0,0,time);
			place("shape230",cold_canvas,ctx,[0.019620513916015624,0.0,0.0,0.01732635498046875,-148.05,-0.35],ctrans,1,0,0,time);
			place("shape230",cold_canvas,ctx,[0.05,0.0,0.0,0.05,-310.1,-211.05],ctrans,1,0,0,time);
			place("shape230",cold_canvas,ctx,[0.05,0.0,0.0,0.05,142.75,-204.55],ctrans,1,0,0,time);
			place("shape231",cold_canvas,ctx,[0.05,0.0,0.0,0.05,0.0,0.0],ctrans,1,0,0,time);
			place("sprite233",cold_canvas,ctx,[0.04965362548828125,-0.00546722412109375,0.00546722412109375,0.04965362548828125,-131.6,-127.75],ctrans,1,(0+time)%1,0,time);
			place("sprite236",cold_canvas,ctx,[0.0247711181640625,0.0,0.0,0.0247711181640625,-168.9,-25.85],ctrans,1,(0+time)%3,0,time);
			break;
		case 19:
			place("shape229",cold_canvas,ctx,[0.05,0.0,0.0,0.05,0.0,0.0],ctrans,1,0,0,time);
			place("shape230",cold_canvas,ctx,[0.019620513916015624,0.0,0.0,0.01732635498046875,-148.05,-0.35],ctrans,1,0,0,time);
			place("shape230",cold_canvas,ctx,[0.05,0.0,0.0,0.05,-310.1,-211.05],ctrans,1,0,0,time);
			place("shape230",cold_canvas,ctx,[0.05,0.0,0.0,0.05,142.75,-204.55],ctrans,1,0,0,time);
			place("shape231",cold_canvas,ctx,[0.05,0.0,0.0,0.05,0.0,0.0],ctrans,1,0,0,time);
			place("sprite233",cold_canvas,ctx,[0.049701690673828125,-0.005049896240234375,0.005049896240234375,0.049701690673828125,-128.75,-129.25],ctrans,1,(0+time)%1,0,time);
			place("sprite236",cold_canvas,ctx,[0.0247711181640625,0.0,0.0,0.0247711181640625,-168.9,-25.85],ctrans,1,(1+time)%3,0,time);
			break;
		case 20:
			place("shape229",cold_canvas,ctx,[0.05,0.0,0.0,0.05,0.0,0.0],ctrans,1,0,0,time);
			place("shape230",cold_canvas,ctx,[0.019620513916015624,0.0,0.0,0.01732635498046875,-148.05,-0.35],ctrans,1,0,0,time);
			place("shape230",cold_canvas,ctx,[0.05,0.0,0.0,0.05,-310.1,-211.05],ctrans,1,0,0,time);
			place("shape230",cold_canvas,ctx,[0.05,0.0,0.0,0.05,142.75,-204.55],ctrans,1,0,0,time);
			place("shape231",cold_canvas,ctx,[0.05,0.0,0.0,0.05,0.0,0.0],ctrans,1,0,0,time);
			place("sprite233",cold_canvas,ctx,[0.04972991943359375,-0.004795074462890625,0.004795074462890625,0.04972991943359375,-127.0,-130.2],ctrans,1,(0+time)%1,0,time);
			place("sprite236",cold_canvas,ctx,[0.0247711181640625,0.0,0.0,0.0247711181640625,-168.9,-25.85],ctrans,1,(2+time)%3,0,time);
			break;
		case 21:
			place("shape229",cold_canvas,ctx,[0.05,0.0,0.0,0.05,0.0,0.0],ctrans,1,0,0,time);
			place("shape230",cold_canvas,ctx,[0.019620513916015624,0.0,0.0,0.01732635498046875,-148.05,-0.35],ctrans,1,0,0,time);
			place("shape230",cold_canvas,ctx,[0.05,0.0,0.0,0.05,-310.1,-211.05],ctrans,1,0,0,time);
			place("shape230",cold_canvas,ctx,[0.05,0.0,0.0,0.05,142.75,-204.55],ctrans,1,0,0,time);
			place("shape231",cold_canvas,ctx,[0.05,0.0,0.0,0.05,0.0,0.0],ctrans,1,0,0,time);
			place("sprite233",cold_canvas,ctx,[0.049771881103515624,-0.004376983642578125,0.004376983642578125,0.049771881103515624,-124.25,-131.65],ctrans,1,(0+time)%1,0,time);
			place("sprite236",cold_canvas,ctx,[0.0247711181640625,0.0,0.0,0.0247711181640625,-168.9,-25.85],ctrans,1,(0+time)%3,0,time);
			break;
		case 22:
			place("shape229",cold_canvas,ctx,[0.05,0.0,0.0,0.05,0.0,0.0],ctrans,1,0,0,time);
			place("shape230",cold_canvas,ctx,[0.019620513916015624,0.0,0.0,0.01732635498046875,-148.05,-0.35],ctrans,1,0,0,time);
			place("shape230",cold_canvas,ctx,[0.05,0.0,0.0,0.05,-310.1,-211.05],ctrans,1,0,0,time);
			place("shape230",cold_canvas,ctx,[0.05,0.0,0.0,0.05,142.75,-204.55],ctrans,1,0,0,time);
			place("shape231",cold_canvas,ctx,[0.05,0.0,0.0,0.05,0.0,0.0],ctrans,1,0,0,time);
			place("sprite233",cold_canvas,ctx,[0.04981155395507812,-0.003958892822265625,0.003958892822265625,0.04981155395507812,-121.4,-133.15],ctrans,1,(0+time)%1,0,time);
			place("sprite236",cold_canvas,ctx,[0.0247711181640625,0.0,0.0,0.0247711181640625,-168.9,-25.85],ctrans,1,(1+time)%3,0,time);
			break;
		case 23:
			place("shape229",cold_canvas,ctx,[0.05,0.0,0.0,0.05,0.0,0.0],ctrans,1,0,0,time);
			place("shape230",cold_canvas,ctx,[0.019620513916015624,0.0,0.0,0.01732635498046875,-148.05,-0.35],ctrans,1,0,0,time);
			place("shape230",cold_canvas,ctx,[0.05,0.0,0.0,0.05,-310.1,-211.05],ctrans,1,0,0,time);
			place("shape230",cold_canvas,ctx,[0.05,0.0,0.0,0.05,142.75,-204.55],ctrans,1,0,0,time);
			place("shape231",cold_canvas,ctx,[0.05,0.0,0.0,0.05,0.0,0.0],ctrans,1,0,0,time);
			place("sprite233",cold_canvas,ctx,[0.049846649169921875,-0.0035400390625,0.0035400390625,0.049846649169921875,-118.45,-134.55],ctrans,1,(0+time)%1,0,time);
			place("sprite236",cold_canvas,ctx,[0.0247711181640625,0.0,0.0,0.0247711181640625,-168.9,-25.85],ctrans,1,(2+time)%3,0,time);
			break;
		case 24:
			place("shape229",cold_canvas,ctx,[0.05,0.0,0.0,0.05,0.0,0.0],ctrans,1,0,0,time);
			place("shape230",cold_canvas,ctx,[0.019620513916015624,0.0,0.0,0.01732635498046875,-148.05,-0.35],ctrans,1,0,0,time);
			place("shape230",cold_canvas,ctx,[0.05,0.0,0.0,0.05,-310.1,-211.05],ctrans,1,0,0,time);
			place("shape230",cold_canvas,ctx,[0.05,0.0,0.0,0.05,142.75,-204.55],ctrans,1,0,0,time);
			place("shape231",cold_canvas,ctx,[0.05,0.0,0.0,0.05,0.0,0.0],ctrans,1,0,0,time);
			place("sprite233",cold_canvas,ctx,[0.04986648559570313,-0.00328521728515625,0.00328521728515625,0.04986648559570313,-116.7,-135.45],ctrans,1,(0+time)%1,0,time);
			place("sprite236",cold_canvas,ctx,[0.0247711181640625,0.0,0.0,0.0247711181640625,-168.9,-25.85],ctrans,1,(0+time)%3,0,time);
			break;
		case 25:
			place("shape229",cold_canvas,ctx,[0.05,0.0,0.0,0.05,0.0,0.0],ctrans,1,0,0,time);
			place("shape230",cold_canvas,ctx,[0.019620513916015624,0.0,0.0,0.01732635498046875,-148.05,-0.35],ctrans,1,0,0,time);
			place("shape230",cold_canvas,ctx,[0.05,0.0,0.0,0.05,-310.1,-211.05],ctrans,1,0,0,time);
			place("shape230",cold_canvas,ctx,[0.05,0.0,0.0,0.05,142.75,-204.55],ctrans,1,0,0,time);
			place("shape231",cold_canvas,ctx,[0.05,0.0,0.0,0.05,0.0,0.0],ctrans,1,0,0,time);
			place("sprite233",cold_canvas,ctx,[0.04989700317382813,-0.0028656005859375,0.0028656005859375,0.04989700317382813,-113.85,-136.85],ctrans,1,(0+time)%1,0,time);
			place("sprite236",cold_canvas,ctx,[0.0247711181640625,0.0,0.0,0.0247711181640625,-168.9,-25.85],ctrans,1,(1+time)%3,0,time);
			break;
		case 26:
			place("shape229",cold_canvas,ctx,[0.05,0.0,0.0,0.05,0.0,0.0],ctrans,1,0,0,time);
			place("shape230",cold_canvas,ctx,[0.019620513916015624,0.0,0.0,0.01732635498046875,-148.05,-0.35],ctrans,1,0,0,time);
			place("shape230",cold_canvas,ctx,[0.05,0.0,0.0,0.05,-310.1,-211.05],ctrans,1,0,0,time);
			place("shape230",cold_canvas,ctx,[0.05,0.0,0.0,0.05,142.75,-204.55],ctrans,1,0,0,time);
			place("shape231",cold_canvas,ctx,[0.05,0.0,0.0,0.05,0.0,0.0],ctrans,1,0,0,time);
			place("sprite233",cold_canvas,ctx,[0.04992218017578125,-0.00244598388671875,0.00244598388671875,0.04992218017578125,-111.0,-138.2],ctrans,1,(0+time)%1,0,time);
			place("sprite236",cold_canvas,ctx,[0.0247711181640625,0.0,0.0,0.0247711181640625,-168.9,-25.85],ctrans,1,(2+time)%3,0,time);
			break;
		case 27:
			place("shape229",cold_canvas,ctx,[0.05,0.0,0.0,0.05,0.0,0.0],ctrans,1,0,0,time);
			place("shape230",cold_canvas,ctx,[0.019620513916015624,0.0,0.0,0.01732635498046875,-148.05,-0.35],ctrans,1,0,0,time);
			place("shape230",cold_canvas,ctx,[0.05,0.0,0.0,0.05,-310.1,-211.05],ctrans,1,0,0,time);
			place("shape230",cold_canvas,ctx,[0.05,0.0,0.0,0.05,142.75,-204.55],ctrans,1,0,0,time);
			place("shape231",cold_canvas,ctx,[0.05,0.0,0.0,0.05,0.0,0.0],ctrans,1,0,0,time);
			place("sprite233",cold_canvas,ctx,[0.04994354248046875,-0.00221710205078125,0.00221710205078125,0.04994354248046875,-109.35,-139.05],ctrans,1,(0+time)%1,0,time);
			place("sprite236",cold_canvas,ctx,[0.0247711181640625,0.0,0.0,0.0247711181640625,-168.9,-25.85],ctrans,1,(0+time)%3,0,time);
			break;
		case 28:
			place("shape229",cold_canvas,ctx,[0.05,0.0,0.0,0.05,0.0,0.0],ctrans,1,0,0,time);
			place("shape230",cold_canvas,ctx,[0.019620513916015624,0.0,0.0,0.01732635498046875,-148.05,-0.35],ctrans,1,0,0,time);
			place("shape230",cold_canvas,ctx,[0.05,0.0,0.0,0.05,-310.1,-211.05],ctrans,1,0,0,time);
			place("shape230",cold_canvas,ctx,[0.05,0.0,0.0,0.05,142.75,-204.55],ctrans,1,0,0,time);
			place("shape231",cold_canvas,ctx,[0.05,0.0,0.0,0.05,0.0,0.0],ctrans,1,0,0,time);
			place("sprite233",cold_canvas,ctx,[0.049947357177734374,-0.001992034912109375,0.001992034912109375,0.049947357177734374,-107.75,-139.75],ctrans,1,(0+time)%1,0,time);
			place("sprite236",cold_canvas,ctx,[0.0247711181640625,0.0,0.0,0.0247711181640625,-168.9,-25.85],ctrans,1,(1+time)%3,0,time);
			break;
		case 29:
			place("shape229",cold_canvas,ctx,[0.05,0.0,0.0,0.05,0.0,0.0],ctrans,1,0,0,time);
			place("shape230",cold_canvas,ctx,[0.019620513916015624,0.0,0.0,0.01732635498046875,-148.05,-0.35],ctrans,1,0,0,time);
			place("shape230",cold_canvas,ctx,[0.05,0.0,0.0,0.05,-310.1,-211.05],ctrans,1,0,0,time);
			place("shape230",cold_canvas,ctx,[0.05,0.0,0.0,0.05,142.75,-204.55],ctrans,1,0,0,time);
			place("shape231",cold_canvas,ctx,[0.05,0.0,0.0,0.05,0.0,0.0],ctrans,1,0,0,time);
			place("sprite233",cold_canvas,ctx,[0.04995574951171875,-0.00179443359375,0.00179443359375,0.04995574951171875,-106.35,-140.4],ctrans,1,(0+time)%1,0,time);
			place("sprite236",cold_canvas,ctx,[0.0247711181640625,0.0,0.0,0.0247711181640625,-168.9,-25.85],ctrans,1,(2+time)%3,0,time);
			break;
		case 30:
			place("shape229",cold_canvas,ctx,[0.05,0.0,0.0,0.05,0.0,0.0],ctrans,1,0,0,time);
			place("shape230",cold_canvas,ctx,[0.019620513916015624,0.0,0.0,0.01732635498046875,-148.05,-0.35],ctrans,1,0,0,time);
			place("shape230",cold_canvas,ctx,[0.05,0.0,0.0,0.05,-310.1,-211.05],ctrans,1,0,0,time);
			place("shape230",cold_canvas,ctx,[0.05,0.0,0.0,0.05,142.75,-204.55],ctrans,1,0,0,time);
			place("shape231",cold_canvas,ctx,[0.05,0.0,0.0,0.05,0.0,0.0],ctrans,1,0,0,time);
			place("sprite233",cold_canvas,ctx,[0.049957275390625,-0.001760101318359375,0.001760101318359375,0.049957275390625,-106.15,-140.5],ctrans,1,(0+time)%1,0,time);
			place("sprite236",cold_canvas,ctx,[0.0247711181640625,0.0,0.0,0.0247711181640625,-168.9,-25.85],ctrans,1,(0+time)%3,0,time);
			break;
		case 31:
			place("shape229",cold_canvas,ctx,[0.05,0.0,0.0,0.05,0.0,0.0],ctrans,1,0,0,time);
			place("shape230",cold_canvas,ctx,[0.019620513916015624,0.0,0.0,0.01732635498046875,-148.05,-0.35],ctrans,1,0,0,time);
			place("shape230",cold_canvas,ctx,[0.05,0.0,0.0,0.05,-310.1,-211.05],ctrans,1,0,0,time);
			place("shape230",cold_canvas,ctx,[0.05,0.0,0.0,0.05,142.75,-204.55],ctrans,1,0,0,time);
			place("shape231",cold_canvas,ctx,[0.05,0.0,0.0,0.05,0.0,0.0],ctrans,1,0,0,time);
			place("sprite233",cold_canvas,ctx,[0.04996490478515625,-0.001561737060546875,0.001561737060546875,0.04996490478515625,-104.8,-141.1],ctrans,1,(0+time)%1,0,time);
			place("sprite236",cold_canvas,ctx,[0.0247711181640625,0.0,0.0,0.0247711181640625,-168.9,-25.85],ctrans,1,(1+time)%3,0,time);
			break;
		case 32:
			place("shape229",cold_canvas,ctx,[0.05,0.0,0.0,0.05,0.0,0.0],ctrans,1,0,0,time);
			place("shape230",cold_canvas,ctx,[0.019620513916015624,0.0,0.0,0.01732635498046875,-148.05,-0.35],ctrans,1,0,0,time);
			place("shape230",cold_canvas,ctx,[0.05,0.0,0.0,0.05,-310.1,-211.05],ctrans,1,0,0,time);
			place("shape230",cold_canvas,ctx,[0.05,0.0,0.0,0.05,142.75,-204.55],ctrans,1,0,0,time);
			place("shape231",cold_canvas,ctx,[0.05,0.0,0.0,0.05,0.0,0.0],ctrans,1,0,0,time);
			place("sprite233",cold_canvas,ctx,[0.04997177124023437,-0.001361846923828125,0.001361846923828125,0.04997177124023437,-103.4,-141.7],ctrans,1,(0+time)%1,0,time);
			place("sprite236",cold_canvas,ctx,[0.0247711181640625,0.0,0.0,0.0247711181640625,-168.9,-25.85],ctrans,1,(2+time)%3,0,time);
			break;
		case 33:
			place("shape229",cold_canvas,ctx,[0.05,0.0,0.0,0.05,0.0,0.0],ctrans,1,0,0,time);
			place("shape230",cold_canvas,ctx,[0.019620513916015624,0.0,0.0,0.01732635498046875,-148.05,-0.35],ctrans,1,0,0,time);
			place("shape230",cold_canvas,ctx,[0.05,0.0,0.0,0.05,-310.1,-211.05],ctrans,1,0,0,time);
			place("shape230",cold_canvas,ctx,[0.05,0.0,0.0,0.05,142.75,-204.55],ctrans,1,0,0,time);
			place("shape231",cold_canvas,ctx,[0.05,0.0,0.0,0.05,0.0,0.0],ctrans,1,0,0,time);
			place("sprite233",cold_canvas,ctx,[0.04997329711914063,-0.0013275146484375,0.0013275146484375,0.04997329711914063,-103.2,-141.8],ctrans,1,(0+time)%1,0,time);
			place("sprite236",cold_canvas,ctx,[0.0247711181640625,0.0,0.0,0.0247711181640625,-168.9,-25.85],ctrans,1,(0+time)%3,0,time);
			break;
		case 34:
			place("shape229",cold_canvas,ctx,[0.05,0.0,0.0,0.05,0.0,0.0],ctrans,1,0,0,time);
			place("shape230",cold_canvas,ctx,[0.019620513916015624,0.0,0.0,0.01732635498046875,-148.05,-0.35],ctrans,1,0,0,time);
			place("shape230",cold_canvas,ctx,[0.05,0.0,0.0,0.05,-310.1,-211.05],ctrans,1,0,0,time);
			place("shape230",cold_canvas,ctx,[0.05,0.0,0.0,0.05,142.75,-204.55],ctrans,1,0,0,time);
			place("shape231",cold_canvas,ctx,[0.05,0.0,0.0,0.05,0.0,0.0],ctrans,1,0,0,time);
			place("sprite233",cold_canvas,ctx,[0.04997940063476562,-0.00113067626953125,0.00113067626953125,0.04997940063476562,-101.75,-142.45],ctrans,1,(0+time)%1,0,time);
			place("sprite236",cold_canvas,ctx,[0.0247711181640625,0.0,0.0,0.0247711181640625,-168.9,-25.85],ctrans,1,(1+time)%3,0,time);
			break;
		case 35:
			place("shape229",cold_canvas,ctx,[0.05,0.0,0.0,0.05,0.0,0.0],ctrans,1,0,0,time);
			place("shape230",cold_canvas,ctx,[0.019620513916015624,0.0,0.0,0.01732635498046875,-148.05,-0.35],ctrans,1,0,0,time);
			place("shape230",cold_canvas,ctx,[0.05,0.0,0.0,0.05,-310.1,-211.05],ctrans,1,0,0,time);
			place("shape230",cold_canvas,ctx,[0.05,0.0,0.0,0.05,142.75,-204.55],ctrans,1,0,0,time);
			place("shape231",cold_canvas,ctx,[0.05,0.0,0.0,0.05,0.0,0.0],ctrans,1,0,0,time);
			place("sprite233",cold_canvas,ctx,[0.04998092651367188,-0.001096343994140625,0.001096343994140625,0.04998092651367188,-101.5,-142.55],ctrans,1,(0+time)%1,0,time);
			place("sprite236",cold_canvas,ctx,[0.0247711181640625,0.0,0.0,0.0247711181640625,-168.9,-25.85],ctrans,1,(2+time)%3,0,time);
			break;
		case 36:
			place("shape229",cold_canvas,ctx,[0.05,0.0,0.0,0.05,0.0,0.0],ctrans,1,0,0,time);
			place("shape230",cold_canvas,ctx,[0.019620513916015624,0.0,0.0,0.01732635498046875,-148.05,-0.35],ctrans,1,0,0,time);
			place("shape230",cold_canvas,ctx,[0.05,0.0,0.0,0.05,-310.1,-211.05],ctrans,1,0,0,time);
			place("shape230",cold_canvas,ctx,[0.05,0.0,0.0,0.05,142.75,-204.55],ctrans,1,0,0,time);
			place("shape231",cold_canvas,ctx,[0.05,0.0,0.0,0.05,0.0,0.0],ctrans,1,0,0,time);
			place("sprite233",cold_canvas,ctx,[0.049985504150390624,-8.97979736328125E-4,8.97979736328125E-4,0.049985504150390624,-100.15,-143.15],ctrans,1,(0+time)%1,0,time);
			place("sprite236",cold_canvas,ctx,[0.0247711181640625,0.0,0.0,0.0247711181640625,-168.9,-25.85],ctrans,1,(0+time)%3,0,time);
			break;
		case 37:
			place("shape229",cold_canvas,ctx,[0.05,0.0,0.0,0.05,0.0,0.0],ctrans,1,0,0,time);
			place("shape230",cold_canvas,ctx,[0.019620513916015624,0.0,0.0,0.01732635498046875,-148.05,-0.35],ctrans,1,0,0,time);
			place("shape230",cold_canvas,ctx,[0.05,0.0,0.0,0.05,-310.1,-211.05],ctrans,1,0,0,time);
			place("shape230",cold_canvas,ctx,[0.05,0.0,0.0,0.05,142.75,-204.55],ctrans,1,0,0,time);
			place("shape231",cold_canvas,ctx,[0.05,0.0,0.0,0.05,0.0,0.0],ctrans,1,0,0,time);
			place("sprite233",cold_canvas,ctx,[0.049990081787109376,-6.988525390625E-4,6.988525390625E-4,0.049990081787109376,-98.75,-143.7],ctrans,1,(0+time)%1,0,time);
			place("sprite236",cold_canvas,ctx,[0.0247711181640625,0.0,0.0,0.0247711181640625,-168.9,-25.85],ctrans,1,(1+time)%3,0,time);
			break;
		case 38:
			place("shape229",cold_canvas,ctx,[0.05,0.0,0.0,0.05,0.0,0.0],ctrans,1,0,0,time);
			place("shape230",cold_canvas,ctx,[0.019620513916015624,0.0,0.0,0.01732635498046875,-148.05,-0.35],ctrans,1,0,0,time);
			place("shape230",cold_canvas,ctx,[0.05,0.0,0.0,0.05,-310.1,-211.05],ctrans,1,0,0,time);
			place("shape230",cold_canvas,ctx,[0.05,0.0,0.0,0.05,142.75,-204.55],ctrans,1,0,0,time);
			place("shape231",cold_canvas,ctx,[0.05,0.0,0.0,0.05,0.0,0.0],ctrans,1,0,0,time);
			place("sprite233",cold_canvas,ctx,[0.0499908447265625,-6.6375732421875E-4,6.6375732421875E-4,0.0499908447265625,-98.5,-143.85],ctrans,1,(0+time)%1,0,time);
			place("sprite236",cold_canvas,ctx,[0.0247711181640625,0.0,0.0,0.0247711181640625,-168.9,-25.85],ctrans,1,(2+time)%3,0,time);
			break;
		case 39:
			place("shape229",cold_canvas,ctx,[0.05,0.0,0.0,0.05,0.0,0.0],ctrans,1,0,0,time);
			place("shape230",cold_canvas,ctx,[0.019620513916015624,0.0,0.0,0.01732635498046875,-148.05,-0.35],ctrans,1,0,0,time);
			place("shape230",cold_canvas,ctx,[0.05,0.0,0.0,0.05,-310.1,-211.05],ctrans,1,0,0,time);
			place("shape230",cold_canvas,ctx,[0.05,0.0,0.0,0.05,142.75,-204.55],ctrans,1,0,0,time);
			place("shape231",cold_canvas,ctx,[0.05,0.0,0.0,0.05,0.0,0.0],ctrans,1,0,0,time);
			place("sprite233",cold_canvas,ctx,[0.04999465942382812,-4.66156005859375E-4,4.66156005859375E-4,0.04999465942382812,-97.1,-144.5],ctrans,1,(0+time)%1,0,time);
			place("sprite236",cold_canvas,ctx,[0.0247711181640625,0.0,0.0,0.0247711181640625,-168.9,-25.85],ctrans,1,(0+time)%3,0,time);
			break;
		case 40:
			place("shape229",cold_canvas,ctx,[0.05,0.0,0.0,0.05,0.0,0.0],ctrans,1,0,0,time);
			place("shape230",cold_canvas,ctx,[0.019620513916015624,0.0,0.0,0.01732635498046875,-148.05,-0.35],ctrans,1,0,0,time);
			place("shape230",cold_canvas,ctx,[0.05,0.0,0.0,0.05,-310.1,-211.05],ctrans,1,0,0,time);
			place("shape230",cold_canvas,ctx,[0.05,0.0,0.0,0.05,142.75,-204.55],ctrans,1,0,0,time);
			place("shape231",cold_canvas,ctx,[0.05,0.0,0.0,0.05,0.0,0.0],ctrans,1,0,0,time);
			place("sprite233",cold_canvas,ctx,[0.0499969482421875,-2.685546875E-4,2.685546875E-4,0.0499969482421875,-95.75,-145.0],ctrans,1,(0+time)%1,0,time);
			place("sprite236",cold_canvas,ctx,[0.0247711181640625,0.0,0.0,0.0247711181640625,-168.9,-25.85],ctrans,1,(1+time)%3,0,time);
			break;
		case 41:
			place("shape229",cold_canvas,ctx,[0.05,0.0,0.0,0.05,0.0,0.0],ctrans,1,0,0,time);
			place("shape230",cold_canvas,ctx,[0.019620513916015624,0.0,0.0,0.01732635498046875,-148.05,-0.35],ctrans,1,0,0,time);
			place("shape230",cold_canvas,ctx,[0.05,0.0,0.0,0.05,-310.1,-211.05],ctrans,1,0,0,time);
			place("shape230",cold_canvas,ctx,[0.05,0.0,0.0,0.05,142.75,-204.55],ctrans,1,0,0,time);
			place("shape231",cold_canvas,ctx,[0.05,0.0,0.0,0.05,0.0,0.0],ctrans,1,0,0,time);
			place("sprite233",cold_canvas,ctx,[0.049997711181640626,-2.3345947265625E-4,2.3345947265625E-4,0.049997711181640626,-95.5,-145.1],ctrans,1,(0+time)%1,0,time);
			place("sprite236",cold_canvas,ctx,[0.0247711181640625,0.0,0.0,0.0247711181640625,-168.9,-25.85],ctrans,1,(2+time)%3,0,time);
			break;
		case 42:
			place("shape229",cold_canvas,ctx,[0.05,0.0,0.0,0.05,0.0,0.0],ctrans,1,0,0,time);
			place("shape230",cold_canvas,ctx,[0.019620513916015624,0.0,0.0,0.01732635498046875,-148.05,-0.35],ctrans,1,0,0,time);
			place("shape230",cold_canvas,ctx,[0.05,0.0,0.0,0.05,-310.1,-211.05],ctrans,1,0,0,time);
			place("shape230",cold_canvas,ctx,[0.05,0.0,0.0,0.05,142.75,-204.55],ctrans,1,0,0,time);
			place("shape231",cold_canvas,ctx,[0.05,0.0,0.0,0.05,0.0,0.0],ctrans,1,0,0,time);
			place("sprite233",cold_canvas,ctx,[0.04999847412109375,-3.509521484375E-5,3.509521484375E-5,0.04999847412109375,-94.05,-145.65],ctrans,1,(0+time)%1,0,time);
			place("sprite236",cold_canvas,ctx,[0.0247711181640625,0.0,0.0,0.0247711181640625,-168.9,-25.85],ctrans,1,(0+time)%3,0,time);
			break;
		case 43:
			place("shape229",cold_canvas,ctx,[0.05,0.0,0.0,0.05,0.0,0.0],ctrans,1,0,0,time);
			place("shape230",cold_canvas,ctx,[0.019620513916015624,0.0,0.0,0.01732635498046875,-148.05,-0.35],ctrans,1,0,0,time);
			place("shape230",cold_canvas,ctx,[0.05,0.0,0.0,0.05,-310.1,-211.05],ctrans,1,0,0,time);
			place("shape230",cold_canvas,ctx,[0.05,0.0,0.0,0.05,142.75,-204.55],ctrans,1,0,0,time);
			place("shape231",cold_canvas,ctx,[0.05,0.0,0.0,0.05,0.0,0.0],ctrans,1,0,0,time);
			place("sprite233",cold_canvas,ctx,[0.05,0.0,0.0,0.05,-93.8,-145.75],ctrans,1,(0+time)%1,0,time);
			place("sprite236",cold_canvas,ctx,[0.0247711181640625,0.0,0.0,0.0247711181640625,-168.9,-25.85],ctrans,1,(1+time)%3,0,time);
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
frames.push(25);
frames.push(26);
frames.push(27);
frames.push(28);
frames.push(29);
frames.push(30);
frames.push(31);
frames.push(32);
frames.push(33);
frames.push(34);
frames.push(35);
frames.push(36);
frames.push(37);
frames.push(38);
frames.push(39);
frames.push(40);
frames.push(41);
frames.push(42);
frames.push(43);

var backgroundColor = "#ffffff";
var originalWidth = 1236;
var originalHeight= 766;
function nextFrame(ctx,ctrans){
	var oldframe = frame;
	frame = (frame+1)%frames.length;
	if(frame==oldframe){time++;}else{time=0;};
	drawFrame();
}

function drawFrame(){
	ctx.fillStyle = backgroundColor;
	ctx.fillRect(0,0,cold_canvas.width,cold_canvas.height);
	ctx.save();
	ctx.transform(cold_canvas.width/originalWidth,0,0,cold_canvas.height/originalHeight,0,0);
	sprite237(ctx,ctrans,frames[frame],0,time);
	ctx.restore();
}

let frame_ctrl = null;
nextFrame(ctx, ctrans);

return {
    start: function(){
        frame_ctrl = window.setInterval(function(){nextFrame(ctx,ctrans);},33);
		cold_canvas.classList.add("show");
    },
    stop: function(){
        clearInterval(frame_ctrl);
		cold_canvas.classList.remove("show");
    },
	show: function(){
		cold_canvas.classList.add("show");
	}
}

})();