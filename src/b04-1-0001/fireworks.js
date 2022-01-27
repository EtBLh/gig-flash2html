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
    var width = canvas.width;
    var height = canvas.height;
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

var canvas=document.getElementById("fireworks");
var ctx=canvas.getContext("2d");
enhanceContext(ctx);
var ctrans = new cxform(0,0,0,0,255,255,255,255);

var scalingGrids = {};
var boundRects = {};
function shape106(ctx,ctrans,frame,ratio,time){
	var pathData="M 180 -2900 L 180 3360 -160 3360 -160 -2900 180 -2900";
	ctx.fillStyle=tocolor(ctrans.apply([255,255,255,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
}

function shape110(ctx,ctrans,frame,ratio,time){
	var pathData="M 1555 -3729 L 1501 -3713 1356 -3621 1151 -3525 988 -3368 807 -3234 678 -3048 524 -2882 430 -2678 306 -2491 243 -2274 147 -2072 112 -1850 38 -1637 27 -1416 -4 -1207 -17 -1428 34 -1650 50 -1879 130 -2094 176 -2319 285 -2520 364 -2733 506 -2912 622 -3107 796 -3257 952 -3425 1150 -3533 1337 -3664 1501 -3713 1546 -3742 1627 -3762 1762 -3822 1868 -3834 1978 -3876 2195 -3882 1868 -3834 1767 -3796 1627 -3762 1555 -3729 M 1277 -2372 L 1436 -2475 1622 -2516 1798 -2588 1962 -2594 1980 -2601 2012 -2601 2171 -2636 2281 -2621 2354 -2635 2534 -2601 2281 -2621 2169 -2601 2012 -2601 1986 -2595 1962 -2594 1803 -2535 1618 -2504 1453 -2410 1275 -2349 1129 -2230 962 -2140 836 -1999 686 -1886 582 -1729 450 -1598 368 -1432 261 -1299 260 -1295 247 -1275 188 -1112 112 -958 156 -1134 247 -1275 251 -1286 261 -1299 329 -1472 453 -1617 545 -1785 687 -1912 802 -2063 962 -2166 1101 -2297 1277 -2372 M 547 -894 L 611 -913 677 -913 814 -952 969 -953 994 -959 1029 -958 1203 -1002 1401 -997 1594 -1038 1791 -1025 1986 -1059 2182 -1037 2377 -1061 2569 -1029 2764 -1041 2953 -997 3150 -994 3310 -941 3331 -941 3528 -888 3336 -932 3310 -941 3133 -939 2940 -983 2743 -971 2551 -1007 2356 -988 2161 -1016 1967 -990 1773 -1011 1578 -978 1383 -993 1190 -952 1029 -958 1011 -953 969 -953 806 -913 677 -913 624 -897 547 -894 424 -858 244 -828 427 -889 547 -894 M 1297 -1464 L 1222 -1423 1136 -1430 1066 -1387 983 -1391 914 -1342 856 -1339 846 -1329 815 -1323 769 -1286 Q 742 -1267 711 -1251 L 761 -1312 815 -1323 831 -1337 856 -1339 909 -1387 995 -1394 1064 -1446 1150 -1445 1223 -1490 1309 -1483 1386 -1523 1471 -1509 1550 -1544 1633 -1525 1714 -1554 1796 -1530 1877 -1555 Q 1906 -1545 1936 -1538 L 1949 -1543 2041 -1525 1956 -1534 1936 -1538 1869 -1511 1786 -1530 1707 -1496 1622 -1512 1543 -1476 1458 -1490 1381 -1452 1297 -1464 M 2475 -263 L 2582 -224 2649 -147 2542 -186 2460 -265 2351 -297 2263 -371 2150 -395 2058 -462 1946 -478 1851 -538 1736 -547 1654 -591 1648 -591 1626 -601 1522 -603 1454 -635 1429 -633 1389 -648 1312 -643 1214 -660 1321 -673 1389 -648 1421 -650 1454 -635 1544 -639 1626 -601 1635 -601 1654 -591 1763 -589 1863 -534 1978 -524 2076 -460 2189 -441 2280 -371 2391 -341 2475 -263 M 2801 -24 L 2828 -11 2898 84 2821 5 2801 -24 2726 -60 2656 -139 2757 -89 2801 -24 M 1506 -42 L 1339 -166 1144 -240 970 -353 770 -415 614 -504 596 -508 564 -524 388 -568 206 -636 406 -600 564 -524 591 -517 614 -504 801 -457 983 -353 1184 -290 1361 -172 1557 -94 1722 35 1911 129 2064 272 2243 384 2381 543 2544 674 2661 850 2802 1001 2866 1141 2901 1180 2978 1368 2866 1141 2761 1025 2650 848 2490 713 2358 550 2185 432 2039 284 1856 182 1697 46 1506 -42 M 1634 913 L 1733 999 1778 1096 1786 1103 1797 1126 1880 1207 1909 1285 1937 1312 1992 1439 1925 1326 1909 1285 1843 1221 1797 1126 1788 1117 1778 1096 1687 1017 1626 902 1525 820 1462 707 1358 627 1291 515 1186 437 1125 339 1231 413 1300 524 1404 602 1471 716 1573 797 1634 913 M 728 -62 L 656 -110 573 -193 680 -129 728 -62 763 -40 787 -4 868 48 926 132 942 143 957 165 1052 229 1115 325 1011 252 957 165 943 157 926 132 835 70 787 -4 757 -22 728 -62 M -63 -11 L -54 42 -55 95 -16 306 -23 550 -62 298 -55 95 -63 54 -63 -11 -99 -207 -118 -449 -64 -205 -63 -11 M 405 16 L 378 -22 348 -82 226 -244 94 -454 259 -258 348 -82 383 -34 405 16 532 193 630 424 488 206 405 16 M 4 1075 L 38 1331 19 1587 47 1843 22 2100 45 2357 14 2613 32 2867 2 3079 4 3110 -2 3160 8 3378 -19 3539 -14 3625 -53 3882 -34 3628 -19 3539 -29 3367 -2 3160 -4 3122 2 3079 -15 2855 14 2599 -9 2342 17 2085 -10 1829 12 1571 -18 1316 -1 1060 -36 807 -23 564 18 818 4 1075 M 635 435 L 775 657 863 907 990 1139 1062 1391 1177 1630 1235 1888 1333 2132 1375 2391 1458 2641 1485 2903 1552 3155 1558 3340 1576 3407 1587 3672 1558 3340 1508 3154 1481 2891 1399 2642 1360 2381 1266 2136 1215 1879 1108 1637 1045 1383 927 1148 850 896 720 669 631 426 635 435 M 1409 1277 L 1446 1335 1470 1391 1482 1403 1484 1412 1533 1456 1551 1529 1607 1586 1620 1660 1674 1720 1684 1794 1733 1855 1740 1931 1788 1995 1791 2071 1835 2135 1835 2204 1845 2217 1846 2229 1877 2278 Q 1875 2317 1884 2354 L 1848 2294 1846 2229 1835 2213 1835 2204 1799 2155 1794 2080 1746 2018 1739 1942 1689 1881 1680 1807 1629 1747 1619 1671 1565 1611 1552 1537 1497 1478 1484 1412 1474 1402 1470 1391 1426 1346 1409 1277 M 1886 2359 L 1912 2428 Q 1893 2392 1884 2355 L 1886 2359 M -1730 -3340 L -1564 -3238 -1388 -3154 -1254 -3007 -1101 -2886 -997 -2717 -864 -2574 -781 -2395 -663 -2236 -595 -2049 -489 -1883 -436 -1696 -527 -1839 -590 -2022 -704 -2178 -779 -2354 -907 -2500 -1000 -2669 -1143 -2798 -1259 -2954 -1421 -3058 -1563 -3188 -1745 -3255 -1917 -3342 -2306 -3355 -2115 -3389 -1924 -3359 -1730 -3340 M -458 -3856 L -416 -3740 -407 -3604 -353 -3475 -352 -3336 -304 -3205 -309 -3064 -266 -2931 -275 -2789 -236 -2655 -249 -2515 -212 -2381 -226 -2252 -258 -2361 -248 -2502 -289 -2634 -282 -2773 -325 -2905 -319 -3046 -365 -3178 -362 -3319 -409 -3452 -407 -3592 -457 -3724 -458 -3856 M -2092 -2583 L -2179 -2580 -2255 -2625 -2340 -2615 -2419 -2652 -2504 -2644 Q -2541 -2644 -2578 -2655 L -2511 -2664 -2430 -2666 -2346 -2679 -2268 -2645 -2181 -2654 Q -2143 -2632 -2102 -2620 L -2016 -2607 -1947 -2553 -1860 -2543 -1794 -2483 -1709 -2467 -1649 -2403 -1563 -2380 -1507 -2313 -1488 -2309 -1484 -2305 -1421 -2284 Q -1395 -2249 -1361 -2222 L -1356 -2218 -1354 -2217 Q -1317 -2199 -1283 -2175 -1323 -2193 -1356 -2218 L -1433 -2246 -1484 -2305 -1506 -2312 -1507 -2313 -1572 -2328 -1632 -2390 -1719 -2405 -1782 -2464 -1867 -2474 -1935 -2528 -2021 -2532 -2092 -2583 M -219 -2211 L -227 -2240 -226 -2252 -218 -2226 -219 -2211 -193 -2105 -206 -2000 -194 -1955 -198 -1914 -178 -1827 -190 -1741 -175 -1681 -168 -1548 -198 -1687 -190 -1741 -209 -1817 -198 -1914 -210 -1965 -206 -2000 -231 -2089 -219 -2211 M -2118 -873 L -1928 -924 -1732 -916 -1540 -950 -1344 -927 -1147 -948 -958 -912 -1136 -894 -1328 -920 -1519 -888 -1712 -900 -1899 -855 -2093 -853 -2279 -791 -2472 -772 -2650 -693 -2838 -653 Q -2923 -604 -3007 -554 L -3189 -488 -3340 -365 -3506 -265 -3366 -393 -3197 -486 -3043 -607 -2860 -666 -2688 -761 -2497 -793 -2313 -863 -2118 -873 M -2343 -1986 L -2164 -1929 -1974 -1909 -1802 -1828 -1616 -1785 -1452 -1686 -1272 -1626 -1118 -1514 -944 -1439 -805 -1319 -957 -1385 -1106 -1498 -1284 -1560 -1442 -1660 -1623 -1706 -1789 -1792 -1976 -1821 -2152 -1891 -2340 -1900 -2523 -1949 -2711 -1937 -2897 -1963 -3082 -1925 -3266 -1919 -3094 -1965 -2906 -1970 -2720 -2009 -2532 -1980 -2343 -1986 M -423 -1670 L -340 -1522 -310 -1380 -373 -1492 -423 -1670 -436 -1696 -425 -1678 -423 -1670 M -631 -1227 L -532 -1128 -645 -1187 -775 -1302 -631 -1227 M -805 -1319 L -784 -1310 -775 -1302 -800 -1314 -805 -1319 M -299 -1330 L -310 -1380 -281 -1328 -215 -1147 -299 -1330 M -619 -883 L -755 -877 -937 -912 -760 -920 -619 -883 -562 -886 -367 -862 -569 -870 -619 -883 M -480 -1101 L -330 -983 -495 -1091 -532 -1128 -480 -1101 M -295 -532 L -418 -335 -463 -284 -528 -151 -645 6 -661 39 -671 53 -742 234 -862 422 -930 633 -1039 828 -1096 1045 -1196 1245 -1243 1466 -1335 1671 -1374 1893 -1458 2101 -1488 2324 -1563 2528 -1564 2542 -1567 2553 -1588 2757 -1654 2967 -1625 2755 -1567 2553 -1565 2534 -1563 2528 -1546 2321 -1474 2109 -1445 1888 -1361 1680 -1319 1458 -1223 1254 -1169 1034 -1062 838 -994 622 -874 430 -793 220 -671 53 -661 27 -645 6 -565 -165 -463 -284 -429 -351 -295 -532 M -811 -705 L -707 -679 -805 -673 -883 -686 -923 -676 -949 -680 -1020 -656 -1122 -667 -1146 -659 -1153 -659 -1238 -625 -1353 -629 -1455 -580 -1568 -576 -1666 -520 -1781 -509 -1877 -446 -1990 -426 -2079 -356 -2190 -329 -2115 -399 -2004 -426 -1912 -494 -1798 -511 -1701 -570 -1585 -577 -1481 -628 -1366 -626 -1259 -670 -1153 -659 -1132 -668 -1122 -667 -1037 -694 -949 -680 -914 -692 -883 -686 -811 -705 M -761 -492 L -539 -553 -763 -481 -799 -475 -965 -399 -1184 -344 -1382 -234 -1596 -163 -1784 -36 -1993 54 -2169 197 -2366 306 -2528 466 -2714 594 -2858 769 -3029 917 -3153 1108 -3282 1251 -3301 1290 -3333 1334 -3403 1483 -3528 1678 -3432 1473 -3333 1334 -3306 1277 -3282 1251 -3199 1087 -3043 920 -2916 733 -2739 588 -2589 418 -2394 295 -2224 142 -2018 41 -1831 -93 -1615 -173 -1418 -288 -1197 -346 -989 -443 -799 -475 -761 -492 M -1441 434 L -1421 384 -1376 348 -1348 303 Q -1325 263 -1294 227 L -1340 320 -1376 348 -1401 385 -1441 434 -1459 481 -1478 498 -1497 557 -1558 621 -1567 647 -1572 652 -1592 730 -1659 808 -1680 909 -1744 987 -1761 1087 -1824 1169 -1838 1270 -1899 1353 -1911 1454 -1963 1528 -1964 1552 -1973 1568 -1981 1643 -2035 1724 -2009 1641 -1973 1568 -1970 1539 -1963 1528 -1959 1448 -1903 1363 -1893 1261 -1834 1179 -1819 1078 -1754 997 -1733 896 -1665 819 -1639 720 -1572 652 -1567 629 -1558 621 -1536 549 -1478 498 -1467 459 -1441 434 M -367 288 L -365 400 -402 488 -403 506 -411 523 -407 631 -451 742 -443 861 -485 974 -476 1093 -515 1205 -503 1323 -541 1434 -527 1553 -562 1668 -546 1784 -572 1874 -569 1886 -576 1913 -559 2015 -578 2086 -571 2121 -592 2245 -590 2128 -578 2086 -597 2002 -576 1913 -578 1897 -572 1874 -592 1768 -561 1653 -580 1535 -546 1419 -560 1300 -523 1187 -534 1069 -492 957 -498 839 -451 729 -453 612 -411 523 -412 510 -402 488 -399 388 -367 288 M -2198 -322 L -2276 -252 -2355 -225 -2378 -198 -2463 -128 -2384 -215 -2355 -225 -2304 -284 -2198 -322 M -921 1627 L -929 1638 -927 1706 -967 1775 -962 1851 -1000 1921 -994 1997 -1030 2067 -1022 2142 -1056 2212 -1046 2288 -1078 2359 -1066 2433 -1090 2490 -1088 2498 -1095 2516 -1082 2580 -1104 2650 Q -1104 2687 -1114 2725 L -1104 2652 -1104 2650 -1104 2646 Q -1104 2609 -1114 2571 L -1095 2516 -1097 2505 -1090 2490 -1106 2422 -1078 2350 -1092 2275 -1060 2202 -1071 2127 -1036 2056 -1043 1981 -1006 1911 -1009 1835 -967 1767 -967 1692 -929 1638 -929 1629 -920 1615 -909 1554 Q -901 1521 -886 1490 L -887 1560 -920 1615 -921 1627";
	ctx.fillStyle=tocolor(ctrans.apply([217,0,0,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
}

function shape111(ctx,ctrans,frame,ratio,time){
	var pathData="M 5595 -5620 Q 7926 -3289 7926 0 7926 3290 5595 5595 4676 6524 3601 7084 3546 7113 3484 7136 1912 7926 0 7926 -1027 7926 -1955 7693 L -2033 7680 Q -4046 7170 -5620 5595 -7926 3290 -7926 0 -7926 -3289 -5620 -5620 -3289 -7926 0 -7926 2801 -7926 4883 -6255 L 4986 -6164 Q 5301 -5914 5595 -5620";
	drawPath(ctx,pathData,false);
	ctx.fillStyle=tocolor(ctrans.apply([245,244,255,1]));
	ctx.fill("evenodd");
	ctx.save();
	ctx.clip();
	ctx.transform(0.4885101318359375,0,0,0.4885101318359375,0,0);
	var grd=ctx.createRadialGradient(0.0,0,0,0,0,16384);
	grd.addColorStop(0.2627450980392157,tocolor(ctrans.apply([48,4,255,0.0])));
	grd.addColorStop(0.8705882352941177,tocolor(ctrans.apply([48,4,255,1])));
	grd.addColorStop(1.0,tocolor(ctrans.apply([245,244,255,1])));
	ctx.fillStyle = grd;
	ctx.fillRect(-16384,-16384,32768,32768);
	ctx.restore();
}

function sprite112(ctx,ctrans,frame,ratio,time){
	ctx.save();
	ctx.transform(1,0,0,1,688.2,680.2);
	var clips = [];
	var frame_cnt = 78;
	frame = frame % frame_cnt;
	switch(frame){
		case 0:
			break;
		case 1:
			place("shape106",canvas,ctx,[4.042205810546875,0.0,0.0,0.21954498291015626,-41.45,-43.5],ctrans.merge(new cxform(0,0,0,0,256,256,256,154)),1,0,0,time);
			break;
		case 2:
			break;
		case 3:
			clips.push({ctx:ctx,canvas:canvas});
			var ccanvas = createCanvas(canvas.width,canvas.height);
			var cctx = ccanvas.getContext("2d");
			enhanceContext(cctx);
			cctx.applyTransforms(ctx._matrix);
			canvas = ccanvas;
			ctx = cctx;
			place("shape110",canvas,ctx,[0.05,0.0,0.0,0.05,5.85,37.85],ctrans,1,0,0,time);
			clips[clips.length-1].clipCanvas = canvas;
			canvas = createCanvas(canvas.width,canvas.height);
			var nctx = canvas.getContext("2d");
			enhanceContext(nctx);
			nctx.applyTransforms(ctx._matrix);
			ctx = nctx;
			place("shape111",canvas,ctx,[0.00268707275390625,0.0,0.0,0.00268707275390625,-0.15,-0.15],ctrans,1,0,0,time);
			var o = clips.pop();
			ctx.globalCompositeOperation = "destination-in";
			ctx.setTransform(1,0,0,1,0,0);
			ctx.drawImage(o.clipCanvas,0,0);
			var ms=o.ctx._matrix;
			o.ctx.setTransform(1,0,0,1,0,0);
			o.ctx.globalCompositeOperation = "source-over";
			o.ctx.drawImage(canvas,0,0);
			o.ctx.applyTransforms(ms);
			ctx = o.ctx;
			canvas = o.canvas;
			break;
		case 4:
			clips.push({ctx:ctx,canvas:canvas});
			var ccanvas = createCanvas(canvas.width,canvas.height);
			var cctx = ccanvas.getContext("2d");
			enhanceContext(cctx);
			cctx.applyTransforms(ctx._matrix);
			canvas = ccanvas;
			ctx = cctx;
			place("shape110",canvas,ctx,[0.05,0.0,0.0,0.05,5.85,39.25],ctrans,1,0,0,time);
			clips[clips.length-1].clipCanvas = canvas;
			canvas = createCanvas(canvas.width,canvas.height);
			var nctx = canvas.getContext("2d");
			enhanceContext(nctx);
			nctx.applyTransforms(ctx._matrix);
			ctx = nctx;
			place("shape111",canvas,ctx,[0.004940032958984375,0.0,0.0,0.004940032958984375,-0.1,1.2],ctrans,1,0,0,time);
			var o = clips.pop();
			ctx.globalCompositeOperation = "destination-in";
			ctx.setTransform(1,0,0,1,0,0);
			ctx.drawImage(o.clipCanvas,0,0);
			var ms=o.ctx._matrix;
			o.ctx.setTransform(1,0,0,1,0,0);
			o.ctx.globalCompositeOperation = "source-over";
			o.ctx.drawImage(canvas,0,0);
			o.ctx.applyTransforms(ms);
			ctx = o.ctx;
			canvas = o.canvas;
			break;
		case 5:
			clips.push({ctx:ctx,canvas:canvas});
			var ccanvas = createCanvas(canvas.width,canvas.height);
			var cctx = ccanvas.getContext("2d");
			enhanceContext(cctx);
			cctx.applyTransforms(ctx._matrix);
			canvas = ccanvas;
			ctx = cctx;
			place("shape110",canvas,ctx,[0.05,0.0,0.0,0.05,5.85,40.6],ctrans,1,0,0,time);
			clips[clips.length-1].clipCanvas = canvas;
			canvas = createCanvas(canvas.width,canvas.height);
			var nctx = canvas.getContext("2d");
			enhanceContext(nctx);
			nctx.applyTransforms(ctx._matrix);
			ctx = nctx;
			place("shape111",canvas,ctx,[0.007193756103515625,0.0,0.0,0.007193756103515625,-0.05,2.5],ctrans,1,0,0,time);
			var o = clips.pop();
			ctx.globalCompositeOperation = "destination-in";
			ctx.setTransform(1,0,0,1,0,0);
			ctx.drawImage(o.clipCanvas,0,0);
			var ms=o.ctx._matrix;
			o.ctx.setTransform(1,0,0,1,0,0);
			o.ctx.globalCompositeOperation = "source-over";
			o.ctx.drawImage(canvas,0,0);
			o.ctx.applyTransforms(ms);
			ctx = o.ctx;
			canvas = o.canvas;
			break;
		case 6:
			clips.push({ctx:ctx,canvas:canvas});
			var ccanvas = createCanvas(canvas.width,canvas.height);
			var cctx = ccanvas.getContext("2d");
			enhanceContext(cctx);
			cctx.applyTransforms(ctx._matrix);
			canvas = ccanvas;
			ctx = cctx;
			place("shape110",canvas,ctx,[0.05,0.0,0.0,0.05,5.85,42.0],ctrans,1,0,0,time);
			clips[clips.length-1].clipCanvas = canvas;
			canvas = createCanvas(canvas.width,canvas.height);
			var nctx = canvas.getContext("2d");
			enhanceContext(nctx);
			nctx.applyTransforms(ctx._matrix);
			ctx = nctx;
			place("shape111",canvas,ctx,[0.009445953369140624,0.0,0.0,0.009445953369140624,0.0,3.85],ctrans,1,0,0,time);
			var o = clips.pop();
			ctx.globalCompositeOperation = "destination-in";
			ctx.setTransform(1,0,0,1,0,0);
			ctx.drawImage(o.clipCanvas,0,0);
			var ms=o.ctx._matrix;
			o.ctx.setTransform(1,0,0,1,0,0);
			o.ctx.globalCompositeOperation = "source-over";
			o.ctx.drawImage(canvas,0,0);
			o.ctx.applyTransforms(ms);
			ctx = o.ctx;
			canvas = o.canvas;
			break;
		case 7:
			clips.push({ctx:ctx,canvas:canvas});
			var ccanvas = createCanvas(canvas.width,canvas.height);
			var cctx = ccanvas.getContext("2d");
			enhanceContext(cctx);
			cctx.applyTransforms(ctx._matrix);
			canvas = ccanvas;
			ctx = cctx;
			place("shape110",canvas,ctx,[0.05,0.0,0.0,0.05,5.85,43.35],ctrans,1,0,0,time);
			clips[clips.length-1].clipCanvas = canvas;
			canvas = createCanvas(canvas.width,canvas.height);
			var nctx = canvas.getContext("2d");
			enhanceContext(nctx);
			nctx.applyTransforms(ctx._matrix);
			ctx = nctx;
			place("shape111",canvas,ctx,[0.01169891357421875,0.0,0.0,0.01169891357421875,0.05,5.2],ctrans,1,0,0,time);
			var o = clips.pop();
			ctx.globalCompositeOperation = "destination-in";
			ctx.setTransform(1,0,0,1,0,0);
			ctx.drawImage(o.clipCanvas,0,0);
			var ms=o.ctx._matrix;
			o.ctx.setTransform(1,0,0,1,0,0);
			o.ctx.globalCompositeOperation = "source-over";
			o.ctx.drawImage(canvas,0,0);
			o.ctx.applyTransforms(ms);
			ctx = o.ctx;
			canvas = o.canvas;
			break;
		case 8:
			clips.push({ctx:ctx,canvas:canvas});
			var ccanvas = createCanvas(canvas.width,canvas.height);
			var cctx = ccanvas.getContext("2d");
			enhanceContext(cctx);
			cctx.applyTransforms(ctx._matrix);
			canvas = ccanvas;
			ctx = cctx;
			place("shape110",canvas,ctx,[0.05,0.0,0.0,0.05,5.85,44.75],ctrans,1,0,0,time);
			clips[clips.length-1].clipCanvas = canvas;
			canvas = createCanvas(canvas.width,canvas.height);
			var nctx = canvas.getContext("2d");
			enhanceContext(nctx);
			nctx.applyTransforms(ctx._matrix);
			ctx = nctx;
			place("shape111",canvas,ctx,[0.013951873779296875,0.0,0.0,0.013951873779296875,0.1,6.5],ctrans,1,0,0,time);
			var o = clips.pop();
			ctx.globalCompositeOperation = "destination-in";
			ctx.setTransform(1,0,0,1,0,0);
			ctx.drawImage(o.clipCanvas,0,0);
			var ms=o.ctx._matrix;
			o.ctx.setTransform(1,0,0,1,0,0);
			o.ctx.globalCompositeOperation = "source-over";
			o.ctx.drawImage(canvas,0,0);
			o.ctx.applyTransforms(ms);
			ctx = o.ctx;
			canvas = o.canvas;
			break;
		case 9:
			clips.push({ctx:ctx,canvas:canvas});
			var ccanvas = createCanvas(canvas.width,canvas.height);
			var cctx = ccanvas.getContext("2d");
			enhanceContext(cctx);
			cctx.applyTransforms(ctx._matrix);
			canvas = ccanvas;
			ctx = cctx;
			place("shape110",canvas,ctx,[0.05,0.0,0.0,0.05,5.85,46.15],ctrans,1,0,0,time);
			clips[clips.length-1].clipCanvas = canvas;
			canvas = createCanvas(canvas.width,canvas.height);
			var nctx = canvas.getContext("2d");
			enhanceContext(nctx);
			nctx.applyTransforms(ctx._matrix);
			ctx = nctx;
			place("shape111",canvas,ctx,[0.016205596923828124,0.0,0.0,0.016205596923828124,0.15,7.85],ctrans,1,0,0,time);
			var o = clips.pop();
			ctx.globalCompositeOperation = "destination-in";
			ctx.setTransform(1,0,0,1,0,0);
			ctx.drawImage(o.clipCanvas,0,0);
			var ms=o.ctx._matrix;
			o.ctx.setTransform(1,0,0,1,0,0);
			o.ctx.globalCompositeOperation = "source-over";
			o.ctx.drawImage(canvas,0,0);
			o.ctx.applyTransforms(ms);
			ctx = o.ctx;
			canvas = o.canvas;
			break;
		case 10:
			clips.push({ctx:ctx,canvas:canvas});
			var ccanvas = createCanvas(canvas.width,canvas.height);
			var cctx = ccanvas.getContext("2d");
			enhanceContext(cctx);
			cctx.applyTransforms(ctx._matrix);
			canvas = ccanvas;
			ctx = cctx;
			place("shape110",canvas,ctx,[0.05,0.0,0.0,0.05,5.85,47.5],ctrans,1,0,0,time);
			clips[clips.length-1].clipCanvas = canvas;
			canvas = createCanvas(canvas.width,canvas.height);
			var nctx = canvas.getContext("2d");
			enhanceContext(nctx);
			nctx.applyTransforms(ctx._matrix);
			ctx = nctx;
			place("shape111",canvas,ctx,[0.018457794189453126,0.0,0.0,0.018457794189453126,0.2,9.2],ctrans,1,0,0,time);
			var o = clips.pop();
			ctx.globalCompositeOperation = "destination-in";
			ctx.setTransform(1,0,0,1,0,0);
			ctx.drawImage(o.clipCanvas,0,0);
			var ms=o.ctx._matrix;
			o.ctx.setTransform(1,0,0,1,0,0);
			o.ctx.globalCompositeOperation = "source-over";
			o.ctx.drawImage(canvas,0,0);
			o.ctx.applyTransforms(ms);
			ctx = o.ctx;
			canvas = o.canvas;
			break;
		case 11:
			clips.push({ctx:ctx,canvas:canvas});
			var ccanvas = createCanvas(canvas.width,canvas.height);
			var cctx = ccanvas.getContext("2d");
			enhanceContext(cctx);
			cctx.applyTransforms(ctx._matrix);
			canvas = ccanvas;
			ctx = cctx;
			place("shape110",canvas,ctx,[0.05,0.0,0.0,0.05,5.85,48.9],ctrans,1,0,0,time);
			clips[clips.length-1].clipCanvas = canvas;
			canvas = createCanvas(canvas.width,canvas.height);
			var nctx = canvas.getContext("2d");
			enhanceContext(nctx);
			nctx.applyTransforms(ctx._matrix);
			ctx = nctx;
			place("shape111",canvas,ctx,[0.02071075439453125,0.0,0.0,0.02071075439453125,0.25,10.5],ctrans,1,0,0,time);
			var o = clips.pop();
			ctx.globalCompositeOperation = "destination-in";
			ctx.setTransform(1,0,0,1,0,0);
			ctx.drawImage(o.clipCanvas,0,0);
			var ms=o.ctx._matrix;
			o.ctx.setTransform(1,0,0,1,0,0);
			o.ctx.globalCompositeOperation = "source-over";
			o.ctx.drawImage(canvas,0,0);
			o.ctx.applyTransforms(ms);
			ctx = o.ctx;
			canvas = o.canvas;
			break;
		case 12:
			clips.push({ctx:ctx,canvas:canvas});
			var ccanvas = createCanvas(canvas.width,canvas.height);
			var cctx = ccanvas.getContext("2d");
			enhanceContext(cctx);
			cctx.applyTransforms(ctx._matrix);
			canvas = ccanvas;
			ctx = cctx;
			place("shape110",canvas,ctx,[0.05,0.0,0.0,0.05,5.85,50.3],ctrans,1,0,0,time);
			clips[clips.length-1].clipCanvas = canvas;
			canvas = createCanvas(canvas.width,canvas.height);
			var nctx = canvas.getContext("2d");
			enhanceContext(nctx);
			nctx.applyTransforms(ctx._matrix);
			ctx = nctx;
			place("shape111",canvas,ctx,[0.0229644775390625,0.0,0.0,0.0229644775390625,0.3,11.85],ctrans,1,0,0,time);
			var o = clips.pop();
			ctx.globalCompositeOperation = "destination-in";
			ctx.setTransform(1,0,0,1,0,0);
			ctx.drawImage(o.clipCanvas,0,0);
			var ms=o.ctx._matrix;
			o.ctx.setTransform(1,0,0,1,0,0);
			o.ctx.globalCompositeOperation = "source-over";
			o.ctx.drawImage(canvas,0,0);
			o.ctx.applyTransforms(ms);
			ctx = o.ctx;
			canvas = o.canvas;
			break;
		case 13:
			clips.push({ctx:ctx,canvas:canvas});
			var ccanvas = createCanvas(canvas.width,canvas.height);
			var cctx = ccanvas.getContext("2d");
			enhanceContext(cctx);
			cctx.applyTransforms(ctx._matrix);
			canvas = ccanvas;
			ctx = cctx;
			place("shape110",canvas,ctx,[0.05,0.0,0.0,0.05,5.85,51.65],ctrans,1,0,0,time);
			clips[clips.length-1].clipCanvas = canvas;
			canvas = createCanvas(canvas.width,canvas.height);
			var nctx = canvas.getContext("2d");
			enhanceContext(nctx);
			nctx.applyTransforms(ctx._matrix);
			ctx = nctx;
			place("shape111",canvas,ctx,[0.025217437744140626,0.0,0.0,0.025217437744140626,0.35,13.2],ctrans,1,0,0,time);
			var o = clips.pop();
			ctx.globalCompositeOperation = "destination-in";
			ctx.setTransform(1,0,0,1,0,0);
			ctx.drawImage(o.clipCanvas,0,0);
			var ms=o.ctx._matrix;
			o.ctx.setTransform(1,0,0,1,0,0);
			o.ctx.globalCompositeOperation = "source-over";
			o.ctx.drawImage(canvas,0,0);
			o.ctx.applyTransforms(ms);
			ctx = o.ctx;
			canvas = o.canvas;
			break;
		case 14:
			clips.push({ctx:ctx,canvas:canvas});
			var ccanvas = createCanvas(canvas.width,canvas.height);
			var cctx = ccanvas.getContext("2d");
			enhanceContext(cctx);
			cctx.applyTransforms(ctx._matrix);
			canvas = ccanvas;
			ctx = cctx;
			place("shape110",canvas,ctx,[0.05,0.0,0.0,0.05,5.85,53.05],ctrans,1,0,0,time);
			clips[clips.length-1].clipCanvas = canvas;
			canvas = createCanvas(canvas.width,canvas.height);
			var nctx = canvas.getContext("2d");
			enhanceContext(nctx);
			nctx.applyTransforms(ctx._matrix);
			ctx = nctx;
			place("shape111",canvas,ctx,[0.027469635009765625,0.0,0.0,0.027469635009765625,0.35,14.5],ctrans,1,0,0,time);
			var o = clips.pop();
			ctx.globalCompositeOperation = "destination-in";
			ctx.setTransform(1,0,0,1,0,0);
			ctx.drawImage(o.clipCanvas,0,0);
			var ms=o.ctx._matrix;
			o.ctx.setTransform(1,0,0,1,0,0);
			o.ctx.globalCompositeOperation = "source-over";
			o.ctx.drawImage(canvas,0,0);
			o.ctx.applyTransforms(ms);
			ctx = o.ctx;
			canvas = o.canvas;
			break;
		case 15:
			clips.push({ctx:ctx,canvas:canvas});
			var ccanvas = createCanvas(canvas.width,canvas.height);
			var cctx = ccanvas.getContext("2d");
			enhanceContext(cctx);
			cctx.applyTransforms(ctx._matrix);
			canvas = ccanvas;
			ctx = cctx;
			place("shape110",canvas,ctx,[0.05,0.0,0.0,0.05,5.85,54.4],ctrans,1,0,0,time);
			clips[clips.length-1].clipCanvas = canvas;
			canvas = createCanvas(canvas.width,canvas.height);
			var nctx = canvas.getContext("2d");
			enhanceContext(nctx);
			nctx.applyTransforms(ctx._matrix);
			ctx = nctx;
			place("shape111",canvas,ctx,[0.02972259521484375,0.0,0.0,0.02972259521484375,0.4,15.85],ctrans,1,0,0,time);
			var o = clips.pop();
			ctx.globalCompositeOperation = "destination-in";
			ctx.setTransform(1,0,0,1,0,0);
			ctx.drawImage(o.clipCanvas,0,0);
			var ms=o.ctx._matrix;
			o.ctx.setTransform(1,0,0,1,0,0);
			o.ctx.globalCompositeOperation = "source-over";
			o.ctx.drawImage(canvas,0,0);
			o.ctx.applyTransforms(ms);
			ctx = o.ctx;
			canvas = o.canvas;
			break;
		case 16:
			clips.push({ctx:ctx,canvas:canvas});
			var ccanvas = createCanvas(canvas.width,canvas.height);
			var cctx = ccanvas.getContext("2d");
			enhanceContext(cctx);
			cctx.applyTransforms(ctx._matrix);
			canvas = ccanvas;
			ctx = cctx;
			place("shape110",canvas,ctx,[0.05,0.0,0.0,0.05,5.85,55.8],ctrans,1,0,0,time);
			clips[clips.length-1].clipCanvas = canvas;
			canvas = createCanvas(canvas.width,canvas.height);
			var nctx = canvas.getContext("2d");
			enhanceContext(nctx);
			nctx.applyTransforms(ctx._matrix);
			ctx = nctx;
			place("shape111",canvas,ctx,[0.031976318359375,0.0,0.0,0.031976318359375,0.45,17.2],ctrans,1,0,0,time);
			var o = clips.pop();
			ctx.globalCompositeOperation = "destination-in";
			ctx.setTransform(1,0,0,1,0,0);
			ctx.drawImage(o.clipCanvas,0,0);
			var ms=o.ctx._matrix;
			o.ctx.setTransform(1,0,0,1,0,0);
			o.ctx.globalCompositeOperation = "source-over";
			o.ctx.drawImage(canvas,0,0);
			o.ctx.applyTransforms(ms);
			ctx = o.ctx;
			canvas = o.canvas;
			break;
		case 17:
			clips.push({ctx:ctx,canvas:canvas});
			var ccanvas = createCanvas(canvas.width,canvas.height);
			var cctx = ccanvas.getContext("2d");
			enhanceContext(cctx);
			cctx.applyTransforms(ctx._matrix);
			canvas = ccanvas;
			ctx = cctx;
			place("shape110",canvas,ctx,[0.05,0.0,0.0,0.05,5.85,57.2],ctrans,1,0,0,time);
			clips[clips.length-1].clipCanvas = canvas;
			canvas = createCanvas(canvas.width,canvas.height);
			var nctx = canvas.getContext("2d");
			enhanceContext(nctx);
			nctx.applyTransforms(ctx._matrix);
			ctx = nctx;
			place("shape111",canvas,ctx,[0.034229278564453125,0.0,0.0,0.034229278564453125,0.5,18.5],ctrans,1,0,0,time);
			var o = clips.pop();
			ctx.globalCompositeOperation = "destination-in";
			ctx.setTransform(1,0,0,1,0,0);
			ctx.drawImage(o.clipCanvas,0,0);
			var ms=o.ctx._matrix;
			o.ctx.setTransform(1,0,0,1,0,0);
			o.ctx.globalCompositeOperation = "source-over";
			o.ctx.drawImage(canvas,0,0);
			o.ctx.applyTransforms(ms);
			ctx = o.ctx;
			canvas = o.canvas;
			break;
		case 18:
			clips.push({ctx:ctx,canvas:canvas});
			var ccanvas = createCanvas(canvas.width,canvas.height);
			var cctx = ccanvas.getContext("2d");
			enhanceContext(cctx);
			cctx.applyTransforms(ctx._matrix);
			canvas = ccanvas;
			ctx = cctx;
			place("shape110",canvas,ctx,[0.05,0.0,0.0,0.05,5.85,58.55],ctrans,1,0,0,time);
			clips[clips.length-1].clipCanvas = canvas;
			canvas = createCanvas(canvas.width,canvas.height);
			var nctx = canvas.getContext("2d");
			enhanceContext(nctx);
			nctx.applyTransforms(ctx._matrix);
			ctx = nctx;
			place("shape111",canvas,ctx,[0.036481475830078124,0.0,0.0,0.036481475830078124,0.55,19.85],ctrans,1,0,0,time);
			var o = clips.pop();
			ctx.globalCompositeOperation = "destination-in";
			ctx.setTransform(1,0,0,1,0,0);
			ctx.drawImage(o.clipCanvas,0,0);
			var ms=o.ctx._matrix;
			o.ctx.setTransform(1,0,0,1,0,0);
			o.ctx.globalCompositeOperation = "source-over";
			o.ctx.drawImage(canvas,0,0);
			o.ctx.applyTransforms(ms);
			ctx = o.ctx;
			canvas = o.canvas;
			break;
		case 19:
			clips.push({ctx:ctx,canvas:canvas});
			var ccanvas = createCanvas(canvas.width,canvas.height);
			var cctx = ccanvas.getContext("2d");
			enhanceContext(cctx);
			cctx.applyTransforms(ctx._matrix);
			canvas = ccanvas;
			ctx = cctx;
			place("shape110",canvas,ctx,[0.05,0.0,0.0,0.05,5.85,59.95],ctrans,1,0,0,time);
			clips[clips.length-1].clipCanvas = canvas;
			canvas = createCanvas(canvas.width,canvas.height);
			var nctx = canvas.getContext("2d");
			enhanceContext(nctx);
			nctx.applyTransforms(ctx._matrix);
			ctx = nctx;
			place("shape111",canvas,ctx,[0.03873519897460938,0.0,0.0,0.03873519897460938,0.6,21.2],ctrans,1,0,0,time);
			var o = clips.pop();
			ctx.globalCompositeOperation = "destination-in";
			ctx.setTransform(1,0,0,1,0,0);
			ctx.drawImage(o.clipCanvas,0,0);
			var ms=o.ctx._matrix;
			o.ctx.setTransform(1,0,0,1,0,0);
			o.ctx.globalCompositeOperation = "source-over";
			o.ctx.drawImage(canvas,0,0);
			o.ctx.applyTransforms(ms);
			ctx = o.ctx;
			canvas = o.canvas;
			break;
		case 20:
			clips.push({ctx:ctx,canvas:canvas});
			var ccanvas = createCanvas(canvas.width,canvas.height);
			var cctx = ccanvas.getContext("2d");
			enhanceContext(cctx);
			cctx.applyTransforms(ctx._matrix);
			canvas = ccanvas;
			ctx = cctx;
			place("shape110",canvas,ctx,[0.05,0.0,0.0,0.05,5.85,61.35],ctrans,1,0,0,time);
			clips[clips.length-1].clipCanvas = canvas;
			canvas = createCanvas(canvas.width,canvas.height);
			var nctx = canvas.getContext("2d");
			enhanceContext(nctx);
			nctx.applyTransforms(ctx._matrix);
			ctx = nctx;
			place("shape111",canvas,ctx,[0.0409881591796875,0.0,0.0,0.0409881591796875,0.65,22.5],ctrans,1,0,0,time);
			var o = clips.pop();
			ctx.globalCompositeOperation = "destination-in";
			ctx.setTransform(1,0,0,1,0,0);
			ctx.drawImage(o.clipCanvas,0,0);
			var ms=o.ctx._matrix;
			o.ctx.setTransform(1,0,0,1,0,0);
			o.ctx.globalCompositeOperation = "source-over";
			o.ctx.drawImage(canvas,0,0);
			o.ctx.applyTransforms(ms);
			ctx = o.ctx;
			canvas = o.canvas;
			break;
		case 21:
			clips.push({ctx:ctx,canvas:canvas});
			var ccanvas = createCanvas(canvas.width,canvas.height);
			var cctx = ccanvas.getContext("2d");
			enhanceContext(cctx);
			cctx.applyTransforms(ctx._matrix);
			canvas = ccanvas;
			ctx = cctx;
			place("shape110",canvas,ctx,[0.05,0.0,0.0,0.05,5.85,62.7],ctrans,1,0,0,time);
			clips[clips.length-1].clipCanvas = canvas;
			canvas = createCanvas(canvas.width,canvas.height);
			var nctx = canvas.getContext("2d");
			enhanceContext(nctx);
			nctx.applyTransforms(ctx._matrix);
			ctx = nctx;
			place("shape111",canvas,ctx,[0.043241119384765624,0.0,0.0,0.043241119384765624,0.7,23.85],ctrans,1,0,0,time);
			var o = clips.pop();
			ctx.globalCompositeOperation = "destination-in";
			ctx.setTransform(1,0,0,1,0,0);
			ctx.drawImage(o.clipCanvas,0,0);
			var ms=o.ctx._matrix;
			o.ctx.setTransform(1,0,0,1,0,0);
			o.ctx.globalCompositeOperation = "source-over";
			o.ctx.drawImage(canvas,0,0);
			o.ctx.applyTransforms(ms);
			ctx = o.ctx;
			canvas = o.canvas;
			break;
		case 22:
			clips.push({ctx:ctx,canvas:canvas});
			var ccanvas = createCanvas(canvas.width,canvas.height);
			var cctx = ccanvas.getContext("2d");
			enhanceContext(cctx);
			cctx.applyTransforms(ctx._matrix);
			canvas = ccanvas;
			ctx = cctx;
			place("shape110",canvas,ctx,[0.05,0.0,0.0,0.05,5.85,64.1],ctrans,1,0,0,time);
			clips[clips.length-1].clipCanvas = canvas;
			canvas = createCanvas(canvas.width,canvas.height);
			var nctx = canvas.getContext("2d");
			enhanceContext(nctx);
			nctx.applyTransforms(ctx._matrix);
			ctx = nctx;
			place("shape111",canvas,ctx,[0.04549331665039062,0.0,0.0,0.04549331665039062,0.75,25.2],ctrans,1,0,0,time);
			var o = clips.pop();
			ctx.globalCompositeOperation = "destination-in";
			ctx.setTransform(1,0,0,1,0,0);
			ctx.drawImage(o.clipCanvas,0,0);
			var ms=o.ctx._matrix;
			o.ctx.setTransform(1,0,0,1,0,0);
			o.ctx.globalCompositeOperation = "source-over";
			o.ctx.drawImage(canvas,0,0);
			o.ctx.applyTransforms(ms);
			ctx = o.ctx;
			canvas = o.canvas;
			break;
		case 23:
			clips.push({ctx:ctx,canvas:canvas});
			var ccanvas = createCanvas(canvas.width,canvas.height);
			var cctx = ccanvas.getContext("2d");
			enhanceContext(cctx);
			cctx.applyTransforms(ctx._matrix);
			canvas = ccanvas;
			ctx = cctx;
			place("shape110",canvas,ctx,[0.05,0.0,0.0,0.05,5.85,65.45],ctrans,1,0,0,time);
			clips[clips.length-1].clipCanvas = canvas;
			canvas = createCanvas(canvas.width,canvas.height);
			var nctx = canvas.getContext("2d");
			enhanceContext(nctx);
			nctx.applyTransforms(ctx._matrix);
			ctx = nctx;
			place("shape111",canvas,ctx,[0.047747039794921876,0.0,0.0,0.047747039794921876,0.8,26.5],ctrans,1,0,0,time);
			var o = clips.pop();
			ctx.globalCompositeOperation = "destination-in";
			ctx.setTransform(1,0,0,1,0,0);
			ctx.drawImage(o.clipCanvas,0,0);
			var ms=o.ctx._matrix;
			o.ctx.setTransform(1,0,0,1,0,0);
			o.ctx.globalCompositeOperation = "source-over";
			o.ctx.drawImage(canvas,0,0);
			o.ctx.applyTransforms(ms);
			ctx = o.ctx;
			canvas = o.canvas;
			break;
		case 24:
			clips.push({ctx:ctx,canvas:canvas});
			var ccanvas = createCanvas(canvas.width,canvas.height);
			var cctx = ccanvas.getContext("2d");
			enhanceContext(cctx);
			cctx.applyTransforms(ctx._matrix);
			canvas = ccanvas;
			ctx = cctx;
			place("shape110",canvas,ctx,[0.05,0.0,0.0,0.05,5.85,66.85],ctrans,1,0,0,time);
			clips[clips.length-1].clipCanvas = canvas;
			canvas = createCanvas(canvas.width,canvas.height);
			var nctx = canvas.getContext("2d");
			enhanceContext(nctx);
			nctx.applyTransforms(ctx._matrix);
			ctx = nctx;
			place("shape111",canvas,ctx,[0.05,0.0,0.0,0.05,0.85,27.85],ctrans,1,0,0,time);
			var o = clips.pop();
			ctx.globalCompositeOperation = "destination-in";
			ctx.setTransform(1,0,0,1,0,0);
			ctx.drawImage(o.clipCanvas,0,0);
			var ms=o.ctx._matrix;
			o.ctx.setTransform(1,0,0,1,0,0);
			o.ctx.globalCompositeOperation = "source-over";
			o.ctx.drawImage(canvas,0,0);
			o.ctx.applyTransforms(ms);
			ctx = o.ctx;
			canvas = o.canvas;
			break;
		case 25:
			break;
		case 26:
			break;
		case 27:
			place("shape106",canvas,ctx,[4.042205810546875,0.0,0.0,0.21954498291015626,-41.45,-43.5],ctrans.merge(new cxform(0,0,0,0,256,256,256,154)),1,0,0,time);
			break;
		case 28:
			break;
		case 29:
			clips.push({ctx:ctx,canvas:canvas});
			var ccanvas = createCanvas(canvas.width,canvas.height);
			var cctx = ccanvas.getContext("2d");
			enhanceContext(cctx);
			cctx.applyTransforms(ctx._matrix);
			canvas = ccanvas;
			ctx = cctx;
			place("shape110",canvas,ctx,[0.05,0.0,0.0,0.05,-62.15,37.85],ctrans,1,0,0,time);
			clips[clips.length-1].clipCanvas = canvas;
			canvas = createCanvas(canvas.width,canvas.height);
			var nctx = canvas.getContext("2d");
			enhanceContext(nctx);
			nctx.applyTransforms(ctx._matrix);
			ctx = nctx;
			place("shape111",canvas,ctx,[0.00268707275390625,0.0,0.0,0.00268707275390625,-68.15,-0.15],ctrans.merge(new cxform(0,112,14,0,143,143,143,256)),1,0,0,time);
			var o = clips.pop();
			ctx.globalCompositeOperation = "destination-in";
			ctx.setTransform(1,0,0,1,0,0);
			ctx.drawImage(o.clipCanvas,0,0);
			var ms=o.ctx._matrix;
			o.ctx.setTransform(1,0,0,1,0,0);
			o.ctx.globalCompositeOperation = "source-over";
			o.ctx.drawImage(canvas,0,0);
			o.ctx.applyTransforms(ms);
			ctx = o.ctx;
			canvas = o.canvas;
			break;
		case 30:
			clips.push({ctx:ctx,canvas:canvas});
			var ccanvas = createCanvas(canvas.width,canvas.height);
			var cctx = ccanvas.getContext("2d");
			enhanceContext(cctx);
			cctx.applyTransforms(ctx._matrix);
			canvas = ccanvas;
			ctx = cctx;
			place("shape110",canvas,ctx,[0.05,0.0,0.0,0.05,-62.15,39.3],ctrans,1,0,0,time);
			clips[clips.length-1].clipCanvas = canvas;
			canvas = createCanvas(canvas.width,canvas.height);
			var nctx = canvas.getContext("2d");
			enhanceContext(nctx);
			nctx.applyTransforms(ctx._matrix);
			ctx = nctx;
			place("shape111",canvas,ctx,[0.004940032958984375,0.0,0.0,0.004940032958984375,-68.1,1.25],ctrans.merge(new cxform(0,112,13,0,124,148,144,256)),1,0,0,time);
			var o = clips.pop();
			ctx.globalCompositeOperation = "destination-in";
			ctx.setTransform(1,0,0,1,0,0);
			ctx.drawImage(o.clipCanvas,0,0);
			var ms=o.ctx._matrix;
			o.ctx.setTransform(1,0,0,1,0,0);
			o.ctx.globalCompositeOperation = "source-over";
			o.ctx.drawImage(canvas,0,0);
			o.ctx.applyTransforms(ms);
			ctx = o.ctx;
			canvas = o.canvas;
			break;
		case 31:
			clips.push({ctx:ctx,canvas:canvas});
			var ccanvas = createCanvas(canvas.width,canvas.height);
			var cctx = ccanvas.getContext("2d");
			enhanceContext(cctx);
			cctx.applyTransforms(ctx._matrix);
			canvas = ccanvas;
			ctx = cctx;
			place("shape110",canvas,ctx,[0.05,0.0,0.0,0.05,-62.15,40.7],ctrans,1,0,0,time);
			clips[clips.length-1].clipCanvas = canvas;
			canvas = createCanvas(canvas.width,canvas.height);
			var nctx = canvas.getContext("2d");
			enhanceContext(nctx);
			nctx.applyTransforms(ctx._matrix);
			ctx = nctx;
			place("shape111",canvas,ctx,[0.007193756103515625,0.0,0.0,0.007193756103515625,-68.05,2.6],ctrans.merge(new cxform(0,111,13,0,105,154,144,256)),1,0,0,time);
			var o = clips.pop();
			ctx.globalCompositeOperation = "destination-in";
			ctx.setTransform(1,0,0,1,0,0);
			ctx.drawImage(o.clipCanvas,0,0);
			var ms=o.ctx._matrix;
			o.ctx.setTransform(1,0,0,1,0,0);
			o.ctx.globalCompositeOperation = "source-over";
			o.ctx.drawImage(canvas,0,0);
			o.ctx.applyTransforms(ms);
			ctx = o.ctx;
			canvas = o.canvas;
			break;
		case 32:
			clips.push({ctx:ctx,canvas:canvas});
			var ccanvas = createCanvas(canvas.width,canvas.height);
			var cctx = ccanvas.getContext("2d");
			enhanceContext(cctx);
			cctx.applyTransforms(ctx._matrix);
			canvas = ccanvas;
			ctx = cctx;
			place("shape110",canvas,ctx,[0.05,0.0,0.0,0.05,-62.15,42.15],ctrans,1,0,0,time);
			clips[clips.length-1].clipCanvas = canvas;
			canvas = createCanvas(canvas.width,canvas.height);
			var nctx = canvas.getContext("2d");
			enhanceContext(nctx);
			nctx.applyTransforms(ctx._matrix);
			ctx = nctx;
			place("shape111",canvas,ctx,[0.009445953369140624,0.0,0.0,0.009445953369140624,-68.0,4.0],ctrans.merge(new cxform(0,111,12,0,86,159,145,256)),1,0,0,time);
			var o = clips.pop();
			ctx.globalCompositeOperation = "destination-in";
			ctx.setTransform(1,0,0,1,0,0);
			ctx.drawImage(o.clipCanvas,0,0);
			var ms=o.ctx._matrix;
			o.ctx.setTransform(1,0,0,1,0,0);
			o.ctx.globalCompositeOperation = "source-over";
			o.ctx.drawImage(canvas,0,0);
			o.ctx.applyTransforms(ms);
			ctx = o.ctx;
			canvas = o.canvas;
			break;
		case 33:
			clips.push({ctx:ctx,canvas:canvas});
			var ccanvas = createCanvas(canvas.width,canvas.height);
			var cctx = ccanvas.getContext("2d");
			enhanceContext(cctx);
			cctx.applyTransforms(ctx._matrix);
			canvas = ccanvas;
			ctx = cctx;
			place("shape110",canvas,ctx,[0.05,0.0,0.0,0.05,-62.15,43.55],ctrans,1,0,0,time);
			clips[clips.length-1].clipCanvas = canvas;
			canvas = createCanvas(canvas.width,canvas.height);
			var nctx = canvas.getContext("2d");
			enhanceContext(nctx);
			nctx.applyTransforms(ctx._matrix);
			ctx = nctx;
			place("shape111",canvas,ctx,[0.01169891357421875,0.0,0.0,0.01169891357421875,-67.95,5.35],ctrans.merge(new cxform(0,110,11,0,67,165,145,256)),1,0,0,time);
			var o = clips.pop();
			ctx.globalCompositeOperation = "destination-in";
			ctx.setTransform(1,0,0,1,0,0);
			ctx.drawImage(o.clipCanvas,0,0);
			var ms=o.ctx._matrix;
			o.ctx.setTransform(1,0,0,1,0,0);
			o.ctx.globalCompositeOperation = "source-over";
			o.ctx.drawImage(canvas,0,0);
			o.ctx.applyTransforms(ms);
			ctx = o.ctx;
			canvas = o.canvas;
			break;
		case 34:
			clips.push({ctx:ctx,canvas:canvas});
			var ccanvas = createCanvas(canvas.width,canvas.height);
			var cctx = ccanvas.getContext("2d");
			enhanceContext(cctx);
			cctx.applyTransforms(ctx._matrix);
			canvas = ccanvas;
			ctx = cctx;
			place("shape110",canvas,ctx,[0.05,0.0,0.0,0.05,-62.15,45.0],ctrans,1,0,0,time);
			clips[clips.length-1].clipCanvas = canvas;
			canvas = createCanvas(canvas.width,canvas.height);
			var nctx = canvas.getContext("2d");
			enhanceContext(nctx);
			nctx.applyTransforms(ctx._matrix);
			ctx = nctx;
			place("shape111",canvas,ctx,[0.013951873779296875,0.0,0.0,0.013951873779296875,-67.9,6.75],ctrans.merge(new cxform(0,110,11,0,48,170,146,256)),1,0,0,time);
			var o = clips.pop();
			ctx.globalCompositeOperation = "destination-in";
			ctx.setTransform(1,0,0,1,0,0);
			ctx.drawImage(o.clipCanvas,0,0);
			var ms=o.ctx._matrix;
			o.ctx.setTransform(1,0,0,1,0,0);
			o.ctx.globalCompositeOperation = "source-over";
			o.ctx.drawImage(canvas,0,0);
			o.ctx.applyTransforms(ms);
			ctx = o.ctx;
			canvas = o.canvas;
			break;
		case 35:
			clips.push({ctx:ctx,canvas:canvas});
			var ccanvas = createCanvas(canvas.width,canvas.height);
			var cctx = ccanvas.getContext("2d");
			enhanceContext(cctx);
			cctx.applyTransforms(ctx._matrix);
			canvas = ccanvas;
			ctx = cctx;
			place("shape110",canvas,ctx,[0.05,0.0,0.0,0.05,-62.15,46.4],ctrans,1,0,0,time);
			clips[clips.length-1].clipCanvas = canvas;
			canvas = createCanvas(canvas.width,canvas.height);
			var nctx = canvas.getContext("2d");
			enhanceContext(nctx);
			nctx.applyTransforms(ctx._matrix);
			ctx = nctx;
			place("shape111",canvas,ctx,[0.016205596923828124,0.0,0.0,0.016205596923828124,-67.85,8.15],ctrans.merge(new cxform(0,109,10,0,29,175,146,256)),1,0,0,time);
			var o = clips.pop();
			ctx.globalCompositeOperation = "destination-in";
			ctx.setTransform(1,0,0,1,0,0);
			ctx.drawImage(o.clipCanvas,0,0);
			var ms=o.ctx._matrix;
			o.ctx.setTransform(1,0,0,1,0,0);
			o.ctx.globalCompositeOperation = "source-over";
			o.ctx.drawImage(canvas,0,0);
			o.ctx.applyTransforms(ms);
			ctx = o.ctx;
			canvas = o.canvas;
			break;
		case 36:
			clips.push({ctx:ctx,canvas:canvas});
			var ccanvas = createCanvas(canvas.width,canvas.height);
			var cctx = ccanvas.getContext("2d");
			enhanceContext(cctx);
			cctx.applyTransforms(ctx._matrix);
			canvas = ccanvas;
			ctx = cctx;
			place("shape110",canvas,ctx,[0.05,0.0,0.0,0.05,-62.15,47.85],ctrans,1,0,0,time);
			clips[clips.length-1].clipCanvas = canvas;
			canvas = createCanvas(canvas.width,canvas.height);
			var nctx = canvas.getContext("2d");
			enhanceContext(nctx);
			nctx.applyTransforms(ctx._matrix);
			ctx = nctx;
			place("shape111",canvas,ctx,[0.018457794189453126,0.0,0.0,0.018457794189453126,-67.8,9.5],ctrans.merge(new cxform(0,109,9,0,10,181,147,256)),1,0,0,time);
			var o = clips.pop();
			ctx.globalCompositeOperation = "destination-in";
			ctx.setTransform(1,0,0,1,0,0);
			ctx.drawImage(o.clipCanvas,0,0);
			var ms=o.ctx._matrix;
			o.ctx.setTransform(1,0,0,1,0,0);
			o.ctx.globalCompositeOperation = "source-over";
			o.ctx.drawImage(canvas,0,0);
			o.ctx.applyTransforms(ms);
			ctx = o.ctx;
			canvas = o.canvas;
			break;
		case 37:
			clips.push({ctx:ctx,canvas:canvas});
			var ccanvas = createCanvas(canvas.width,canvas.height);
			var cctx = ccanvas.getContext("2d");
			enhanceContext(cctx);
			cctx.applyTransforms(ctx._matrix);
			canvas = ccanvas;
			ctx = cctx;
			place("shape110",canvas,ctx,[0.05,0.0,0.0,0.05,-62.15,49.3],ctrans,1,0,0,time);
			clips[clips.length-1].clipCanvas = canvas;
			canvas = createCanvas(canvas.width,canvas.height);
			var nctx = canvas.getContext("2d");
			enhanceContext(nctx);
			nctx.applyTransforms(ctx._matrix);
			ctx = nctx;
			place("shape111",canvas,ctx,[0.02071075439453125,0.0,0.0,0.02071075439453125,-67.75,10.9],ctrans.merge(new cxform(0,108,9,0,-9,186,147,256)),1,0,0,time);
			var o = clips.pop();
			ctx.globalCompositeOperation = "destination-in";
			ctx.setTransform(1,0,0,1,0,0);
			ctx.drawImage(o.clipCanvas,0,0);
			var ms=o.ctx._matrix;
			o.ctx.setTransform(1,0,0,1,0,0);
			o.ctx.globalCompositeOperation = "source-over";
			o.ctx.drawImage(canvas,0,0);
			o.ctx.applyTransforms(ms);
			ctx = o.ctx;
			canvas = o.canvas;
			break;
		case 38:
			clips.push({ctx:ctx,canvas:canvas});
			var ccanvas = createCanvas(canvas.width,canvas.height);
			var cctx = ccanvas.getContext("2d");
			enhanceContext(cctx);
			cctx.applyTransforms(ctx._matrix);
			canvas = ccanvas;
			ctx = cctx;
			place("shape110",canvas,ctx,[0.05,0.0,0.0,0.05,-62.15,50.7],ctrans,1,0,0,time);
			clips[clips.length-1].clipCanvas = canvas;
			canvas = createCanvas(canvas.width,canvas.height);
			var nctx = canvas.getContext("2d");
			enhanceContext(nctx);
			nctx.applyTransforms(ctx._matrix);
			ctx = nctx;
			place("shape111",canvas,ctx,[0.0229644775390625,0.0,0.0,0.0229644775390625,-67.7,12.3],ctrans.merge(new cxform(0,108,8,0,-28,191,148,256)),1,0,0,time);
			var o = clips.pop();
			ctx.globalCompositeOperation = "destination-in";
			ctx.setTransform(1,0,0,1,0,0);
			ctx.drawImage(o.clipCanvas,0,0);
			var ms=o.ctx._matrix;
			o.ctx.setTransform(1,0,0,1,0,0);
			o.ctx.globalCompositeOperation = "source-over";
			o.ctx.drawImage(canvas,0,0);
			o.ctx.applyTransforms(ms);
			ctx = o.ctx;
			canvas = o.canvas;
			break;
		case 39:
			clips.push({ctx:ctx,canvas:canvas});
			var ccanvas = createCanvas(canvas.width,canvas.height);
			var cctx = ccanvas.getContext("2d");
			enhanceContext(cctx);
			cctx.applyTransforms(ctx._matrix);
			canvas = ccanvas;
			ctx = cctx;
			place("shape110",canvas,ctx,[0.05,0.0,0.0,0.05,-62.15,52.15],ctrans,1,0,0,time);
			clips[clips.length-1].clipCanvas = canvas;
			canvas = createCanvas(canvas.width,canvas.height);
			var nctx = canvas.getContext("2d");
			enhanceContext(nctx);
			nctx.applyTransforms(ctx._matrix);
			ctx = nctx;
			place("shape111",canvas,ctx,[0.025217437744140626,0.0,0.0,0.025217437744140626,-67.65,13.65],ctrans.merge(new cxform(0,107,7,0,-47,197,148,256)),1,0,0,time);
			var o = clips.pop();
			ctx.globalCompositeOperation = "destination-in";
			ctx.setTransform(1,0,0,1,0,0);
			ctx.drawImage(o.clipCanvas,0,0);
			var ms=o.ctx._matrix;
			o.ctx.setTransform(1,0,0,1,0,0);
			o.ctx.globalCompositeOperation = "source-over";
			o.ctx.drawImage(canvas,0,0);
			o.ctx.applyTransforms(ms);
			ctx = o.ctx;
			canvas = o.canvas;
			break;
		case 40:
			clips.push({ctx:ctx,canvas:canvas});
			var ccanvas = createCanvas(canvas.width,canvas.height);
			var cctx = ccanvas.getContext("2d");
			enhanceContext(cctx);
			cctx.applyTransforms(ctx._matrix);
			canvas = ccanvas;
			ctx = cctx;
			place("shape110",canvas,ctx,[0.05,0.0,0.0,0.05,-62.15,53.55],ctrans,1,0,0,time);
			clips[clips.length-1].clipCanvas = canvas;
			canvas = createCanvas(canvas.width,canvas.height);
			var nctx = canvas.getContext("2d");
			enhanceContext(nctx);
			nctx.applyTransforms(ctx._matrix);
			ctx = nctx;
			place("shape111",canvas,ctx,[0.027469635009765625,0.0,0.0,0.027469635009765625,-67.65,15.05],ctrans.merge(new cxform(0,107,7,0,-66,202,149,256)),1,0,0,time);
			var o = clips.pop();
			ctx.globalCompositeOperation = "destination-in";
			ctx.setTransform(1,0,0,1,0,0);
			ctx.drawImage(o.clipCanvas,0,0);
			var ms=o.ctx._matrix;
			o.ctx.setTransform(1,0,0,1,0,0);
			o.ctx.globalCompositeOperation = "source-over";
			o.ctx.drawImage(canvas,0,0);
			o.ctx.applyTransforms(ms);
			ctx = o.ctx;
			canvas = o.canvas;
			break;
		case 41:
			clips.push({ctx:ctx,canvas:canvas});
			var ccanvas = createCanvas(canvas.width,canvas.height);
			var cctx = ccanvas.getContext("2d");
			enhanceContext(cctx);
			cctx.applyTransforms(ctx._matrix);
			canvas = ccanvas;
			ctx = cctx;
			place("shape110",canvas,ctx,[0.05,0.0,0.0,0.05,-62.15,55.0],ctrans,1,0,0,time);
			clips[clips.length-1].clipCanvas = canvas;
			canvas = createCanvas(canvas.width,canvas.height);
			var nctx = canvas.getContext("2d");
			enhanceContext(nctx);
			nctx.applyTransforms(ctx._matrix);
			ctx = nctx;
			place("shape111",canvas,ctx,[0.02972259521484375,0.0,0.0,0.02972259521484375,-67.65,16.4],ctrans.merge(new cxform(0,106,6,0,-85,208,149,256)),1,0,0,time);
			var o = clips.pop();
			ctx.globalCompositeOperation = "destination-in";
			ctx.setTransform(1,0,0,1,0,0);
			ctx.drawImage(o.clipCanvas,0,0);
			var ms=o.ctx._matrix;
			o.ctx.setTransform(1,0,0,1,0,0);
			o.ctx.globalCompositeOperation = "source-over";
			o.ctx.drawImage(canvas,0,0);
			o.ctx.applyTransforms(ms);
			ctx = o.ctx;
			canvas = o.canvas;
			break;
		case 42:
			clips.push({ctx:ctx,canvas:canvas});
			var ccanvas = createCanvas(canvas.width,canvas.height);
			var cctx = ccanvas.getContext("2d");
			enhanceContext(cctx);
			cctx.applyTransforms(ctx._matrix);
			canvas = ccanvas;
			ctx = cctx;
			place("shape110",canvas,ctx,[0.05,0.0,0.0,0.05,-62.15,56.4],ctrans,1,0,0,time);
			clips[clips.length-1].clipCanvas = canvas;
			canvas = createCanvas(canvas.width,canvas.height);
			var nctx = canvas.getContext("2d");
			enhanceContext(nctx);
			nctx.applyTransforms(ctx._matrix);
			ctx = nctx;
			place("shape111",canvas,ctx,[0.031976318359375,0.0,0.0,0.031976318359375,-67.55,17.8],ctrans.merge(new cxform(0,106,5,0,-104,213,150,256)),1,0,0,time);
			var o = clips.pop();
			ctx.globalCompositeOperation = "destination-in";
			ctx.setTransform(1,0,0,1,0,0);
			ctx.drawImage(o.clipCanvas,0,0);
			var ms=o.ctx._matrix;
			o.ctx.setTransform(1,0,0,1,0,0);
			o.ctx.globalCompositeOperation = "source-over";
			o.ctx.drawImage(canvas,0,0);
			o.ctx.applyTransforms(ms);
			ctx = o.ctx;
			canvas = o.canvas;
			break;
		case 43:
			clips.push({ctx:ctx,canvas:canvas});
			var ccanvas = createCanvas(canvas.width,canvas.height);
			var cctx = ccanvas.getContext("2d");
			enhanceContext(cctx);
			cctx.applyTransforms(ctx._matrix);
			canvas = ccanvas;
			ctx = cctx;
			place("shape110",canvas,ctx,[0.05,0.0,0.0,0.05,-62.15,57.85],ctrans,1,0,0,time);
			clips[clips.length-1].clipCanvas = canvas;
			canvas = createCanvas(canvas.width,canvas.height);
			var nctx = canvas.getContext("2d");
			enhanceContext(nctx);
			nctx.applyTransforms(ctx._matrix);
			ctx = nctx;
			place("shape111",canvas,ctx,[0.034229278564453125,0.0,0.0,0.034229278564453125,-67.55,19.2],ctrans.merge(new cxform(0,105,5,0,-123,218,150,256)),1,0,0,time);
			var o = clips.pop();
			ctx.globalCompositeOperation = "destination-in";
			ctx.setTransform(1,0,0,1,0,0);
			ctx.drawImage(o.clipCanvas,0,0);
			var ms=o.ctx._matrix;
			o.ctx.setTransform(1,0,0,1,0,0);
			o.ctx.globalCompositeOperation = "source-over";
			o.ctx.drawImage(canvas,0,0);
			o.ctx.applyTransforms(ms);
			ctx = o.ctx;
			canvas = o.canvas;
			break;
		case 44:
			clips.push({ctx:ctx,canvas:canvas});
			var ccanvas = createCanvas(canvas.width,canvas.height);
			var cctx = ccanvas.getContext("2d");
			enhanceContext(cctx);
			cctx.applyTransforms(ctx._matrix);
			canvas = ccanvas;
			ctx = cctx;
			place("shape110",canvas,ctx,[0.05,0.0,0.0,0.05,-62.15,59.3],ctrans,1,0,0,time);
			clips[clips.length-1].clipCanvas = canvas;
			canvas = createCanvas(canvas.width,canvas.height);
			var nctx = canvas.getContext("2d");
			enhanceContext(nctx);
			nctx.applyTransforms(ctx._matrix);
			ctx = nctx;
			place("shape111",canvas,ctx,[0.036481475830078124,0.0,0.0,0.036481475830078124,-67.45,20.55],ctrans.merge(new cxform(0,105,4,0,-142,224,151,256)),1,0,0,time);
			var o = clips.pop();
			ctx.globalCompositeOperation = "destination-in";
			ctx.setTransform(1,0,0,1,0,0);
			ctx.drawImage(o.clipCanvas,0,0);
			var ms=o.ctx._matrix;
			o.ctx.setTransform(1,0,0,1,0,0);
			o.ctx.globalCompositeOperation = "source-over";
			o.ctx.drawImage(canvas,0,0);
			o.ctx.applyTransforms(ms);
			ctx = o.ctx;
			canvas = o.canvas;
			break;
		case 45:
			clips.push({ctx:ctx,canvas:canvas});
			var ccanvas = createCanvas(canvas.width,canvas.height);
			var cctx = ccanvas.getContext("2d");
			enhanceContext(cctx);
			cctx.applyTransforms(ctx._matrix);
			canvas = ccanvas;
			ctx = cctx;
			place("shape110",canvas,ctx,[0.05,0.0,0.0,0.05,-62.15,60.7],ctrans,1,0,0,time);
			clips[clips.length-1].clipCanvas = canvas;
			canvas = createCanvas(canvas.width,canvas.height);
			var nctx = canvas.getContext("2d");
			enhanceContext(nctx);
			nctx.applyTransforms(ctx._matrix);
			ctx = nctx;
			place("shape111",canvas,ctx,[0.03873519897460938,0.0,0.0,0.03873519897460938,-67.4,21.95],ctrans.merge(new cxform(0,104,3,0,-161,229,151,256)),1,0,0,time);
			var o = clips.pop();
			ctx.globalCompositeOperation = "destination-in";
			ctx.setTransform(1,0,0,1,0,0);
			ctx.drawImage(o.clipCanvas,0,0);
			var ms=o.ctx._matrix;
			o.ctx.setTransform(1,0,0,1,0,0);
			o.ctx.globalCompositeOperation = "source-over";
			o.ctx.drawImage(canvas,0,0);
			o.ctx.applyTransforms(ms);
			ctx = o.ctx;
			canvas = o.canvas;
			break;
		case 46:
			clips.push({ctx:ctx,canvas:canvas});
			var ccanvas = createCanvas(canvas.width,canvas.height);
			var cctx = ccanvas.getContext("2d");
			enhanceContext(cctx);
			cctx.applyTransforms(ctx._matrix);
			canvas = ccanvas;
			ctx = cctx;
			place("shape110",canvas,ctx,[0.05,0.0,0.0,0.05,-62.15,62.15],ctrans,1,0,0,time);
			clips[clips.length-1].clipCanvas = canvas;
			canvas = createCanvas(canvas.width,canvas.height);
			var nctx = canvas.getContext("2d");
			enhanceContext(nctx);
			nctx.applyTransforms(ctx._matrix);
			ctx = nctx;
			place("shape111",canvas,ctx,[0.0409881591796875,0.0,0.0,0.0409881591796875,-67.35,23.35],ctrans.merge(new cxform(0,104,3,0,-180,234,152,256)),1,0,0,time);
			var o = clips.pop();
			ctx.globalCompositeOperation = "destination-in";
			ctx.setTransform(1,0,0,1,0,0);
			ctx.drawImage(o.clipCanvas,0,0);
			var ms=o.ctx._matrix;
			o.ctx.setTransform(1,0,0,1,0,0);
			o.ctx.globalCompositeOperation = "source-over";
			o.ctx.drawImage(canvas,0,0);
			o.ctx.applyTransforms(ms);
			ctx = o.ctx;
			canvas = o.canvas;
			break;
		case 47:
			clips.push({ctx:ctx,canvas:canvas});
			var ccanvas = createCanvas(canvas.width,canvas.height);
			var cctx = ccanvas.getContext("2d");
			enhanceContext(cctx);
			cctx.applyTransforms(ctx._matrix);
			canvas = ccanvas;
			ctx = cctx;
			place("shape110",canvas,ctx,[0.05,0.0,0.0,0.05,-62.15,63.55],ctrans,1,0,0,time);
			clips[clips.length-1].clipCanvas = canvas;
			canvas = createCanvas(canvas.width,canvas.height);
			var nctx = canvas.getContext("2d");
			enhanceContext(nctx);
			nctx.applyTransforms(ctx._matrix);
			ctx = nctx;
			place("shape111",canvas,ctx,[0.043241119384765624,0.0,0.0,0.043241119384765624,-67.3,24.7],ctrans.merge(new cxform(0,103,2,0,-199,240,152,256)),1,0,0,time);
			var o = clips.pop();
			ctx.globalCompositeOperation = "destination-in";
			ctx.setTransform(1,0,0,1,0,0);
			ctx.drawImage(o.clipCanvas,0,0);
			var ms=o.ctx._matrix;
			o.ctx.setTransform(1,0,0,1,0,0);
			o.ctx.globalCompositeOperation = "source-over";
			o.ctx.drawImage(canvas,0,0);
			o.ctx.applyTransforms(ms);
			ctx = o.ctx;
			canvas = o.canvas;
			break;
		case 48:
			clips.push({ctx:ctx,canvas:canvas});
			var ccanvas = createCanvas(canvas.width,canvas.height);
			var cctx = ccanvas.getContext("2d");
			enhanceContext(cctx);
			cctx.applyTransforms(ctx._matrix);
			canvas = ccanvas;
			ctx = cctx;
			place("shape110",canvas,ctx,[0.05,0.0,0.0,0.05,-62.15,65.0],ctrans,1,0,0,time);
			clips[clips.length-1].clipCanvas = canvas;
			canvas = createCanvas(canvas.width,canvas.height);
			var nctx = canvas.getContext("2d");
			enhanceContext(nctx);
			nctx.applyTransforms(ctx._matrix);
			ctx = nctx;
			place("shape111",canvas,ctx,[0.04549331665039062,0.0,0.0,0.04549331665039062,-67.25,26.1],ctrans.merge(new cxform(0,103,1,0,-218,245,153,256)),1,0,0,time);
			var o = clips.pop();
			ctx.globalCompositeOperation = "destination-in";
			ctx.setTransform(1,0,0,1,0,0);
			ctx.drawImage(o.clipCanvas,0,0);
			var ms=o.ctx._matrix;
			o.ctx.setTransform(1,0,0,1,0,0);
			o.ctx.globalCompositeOperation = "source-over";
			o.ctx.drawImage(canvas,0,0);
			o.ctx.applyTransforms(ms);
			ctx = o.ctx;
			canvas = o.canvas;
			break;
		case 49:
			clips.push({ctx:ctx,canvas:canvas});
			var ccanvas = createCanvas(canvas.width,canvas.height);
			var cctx = ccanvas.getContext("2d");
			enhanceContext(cctx);
			cctx.applyTransforms(ctx._matrix);
			canvas = ccanvas;
			ctx = cctx;
			place("shape110",canvas,ctx,[0.05,0.0,0.0,0.05,-62.15,66.4],ctrans,1,0,0,time);
			clips[clips.length-1].clipCanvas = canvas;
			canvas = createCanvas(canvas.width,canvas.height);
			var nctx = canvas.getContext("2d");
			enhanceContext(nctx);
			nctx.applyTransforms(ctx._matrix);
			ctx = nctx;
			place("shape111",canvas,ctx,[0.047747039794921876,0.0,0.0,0.047747039794921876,-67.2,27.45],ctrans.merge(new cxform(0,102,1,0,-237,251,153,256)),1,0,0,time);
			var o = clips.pop();
			ctx.globalCompositeOperation = "destination-in";
			ctx.setTransform(1,0,0,1,0,0);
			ctx.drawImage(o.clipCanvas,0,0);
			var ms=o.ctx._matrix;
			o.ctx.setTransform(1,0,0,1,0,0);
			o.ctx.globalCompositeOperation = "source-over";
			o.ctx.drawImage(canvas,0,0);
			o.ctx.applyTransforms(ms);
			ctx = o.ctx;
			canvas = o.canvas;
			break;
		case 50:
			clips.push({ctx:ctx,canvas:canvas});
			var ccanvas = createCanvas(canvas.width,canvas.height);
			var cctx = ccanvas.getContext("2d");
			enhanceContext(cctx);
			cctx.applyTransforms(ctx._matrix);
			canvas = ccanvas;
			ctx = cctx;
			place("shape110",canvas,ctx,[0.05,0.0,0.0,0.05,-62.15,67.85],ctrans,1,0,0,time);
			clips[clips.length-1].clipCanvas = canvas;
			canvas = createCanvas(canvas.width,canvas.height);
			var nctx = canvas.getContext("2d");
			enhanceContext(nctx);
			nctx.applyTransforms(ctx._matrix);
			ctx = nctx;
			place("shape111",canvas,ctx,[0.05,0.0,0.0,0.05,-67.15,28.85],ctrans.merge(new cxform(0,102,0,0,-256,256,154,256)),1,0,0,time);
			var o = clips.pop();
			ctx.globalCompositeOperation = "destination-in";
			ctx.setTransform(1,0,0,1,0,0);
			ctx.drawImage(o.clipCanvas,0,0);
			var ms=o.ctx._matrix;
			o.ctx.setTransform(1,0,0,1,0,0);
			o.ctx.globalCompositeOperation = "source-over";
			o.ctx.drawImage(canvas,0,0);
			o.ctx.applyTransforms(ms);
			ctx = o.ctx;
			canvas = o.canvas;
			break;
		case 51:
			break;
		case 52:
			break;
		case 53:
			place("shape106",canvas,ctx,[4.042205810546875,0.0,0.0,0.21954498291015626,-41.45,-43.5],ctrans.merge(new cxform(0,0,0,0,256,256,256,154)),1,0,0,time);
			break;
		case 54:
			break;
		case 55:
			clips.push({ctx:ctx,canvas:canvas});
			var ccanvas = createCanvas(canvas.width,canvas.height);
			var cctx = ccanvas.getContext("2d");
			enhanceContext(cctx);
			cctx.applyTransforms(ctx._matrix);
			canvas = ccanvas;
			ctx = cctx;
			place("shape110",canvas,ctx,[0.05,0.0,0.0,0.05,193.85,37.85],ctrans,1,0,0,time);
			clips[clips.length-1].clipCanvas = canvas;
			canvas = createCanvas(canvas.width,canvas.height);
			var nctx = canvas.getContext("2d");
			enhanceContext(nctx);
			nctx.applyTransforms(ctx._matrix);
			ctx = nctx;
			place("shape111",canvas,ctx,[0.00268707275390625,0.0,0.0,0.00268707275390625,187.85,-0.15],ctrans.merge(new cxform(0,91,0,0,256,256,36,256)),1,0,0,time);
			var o = clips.pop();
			ctx.globalCompositeOperation = "destination-in";
			ctx.setTransform(1,0,0,1,0,0);
			ctx.drawImage(o.clipCanvas,0,0);
			var ms=o.ctx._matrix;
			o.ctx.setTransform(1,0,0,1,0,0);
			o.ctx.globalCompositeOperation = "source-over";
			o.ctx.drawImage(canvas,0,0);
			o.ctx.applyTransforms(ms);
			ctx = o.ctx;
			canvas = o.canvas;
			break;
		case 56:
			clips.push({ctx:ctx,canvas:canvas});
			var ccanvas = createCanvas(canvas.width,canvas.height);
			var cctx = ccanvas.getContext("2d");
			enhanceContext(cctx);
			cctx.applyTransforms(ctx._matrix);
			canvas = ccanvas;
			ctx = cctx;
			place("shape110",canvas,ctx,[0.05,0.0,0.0,0.05,193.9,39.3],ctrans,1,0,0,time);
			clips[clips.length-1].clipCanvas = canvas;
			canvas = createCanvas(canvas.width,canvas.height);
			var nctx = canvas.getContext("2d");
			enhanceContext(nctx);
			nctx.applyTransforms(ctx._matrix);
			ctx = nctx;
			place("shape111",canvas,ctx,[0.004940032958984375,0.0,0.0,0.004940032958984375,187.95,1.25],ctrans.merge(new cxform(4,91,0,0,252,252,42,256)),1,0,0,time);
			var o = clips.pop();
			ctx.globalCompositeOperation = "destination-in";
			ctx.setTransform(1,0,0,1,0,0);
			ctx.drawImage(o.clipCanvas,0,0);
			var ms=o.ctx._matrix;
			o.ctx.setTransform(1,0,0,1,0,0);
			o.ctx.globalCompositeOperation = "source-over";
			o.ctx.drawImage(canvas,0,0);
			o.ctx.applyTransforms(ms);
			ctx = o.ctx;
			canvas = o.canvas;
			break;
		case 57:
			clips.push({ctx:ctx,canvas:canvas});
			var ccanvas = createCanvas(canvas.width,canvas.height);
			var cctx = ccanvas.getContext("2d");
			enhanceContext(cctx);
			cctx.applyTransforms(ctx._matrix);
			canvas = ccanvas;
			ctx = cctx;
			place("shape110",canvas,ctx,[0.05,0.0,0.0,0.05,193.95,40.7],ctrans,1,0,0,time);
			clips[clips.length-1].clipCanvas = canvas;
			canvas = createCanvas(canvas.width,canvas.height);
			var nctx = canvas.getContext("2d");
			enhanceContext(nctx);
			nctx.applyTransforms(ctx._matrix);
			ctx = nctx;
			place("shape111",canvas,ctx,[0.007193756103515625,0.0,0.0,0.007193756103515625,188.05,2.6],ctrans.merge(new cxform(8,90,0,0,248,248,49,256)),1,0,0,time);
			var o = clips.pop();
			ctx.globalCompositeOperation = "destination-in";
			ctx.setTransform(1,0,0,1,0,0);
			ctx.drawImage(o.clipCanvas,0,0);
			var ms=o.ctx._matrix;
			o.ctx.setTransform(1,0,0,1,0,0);
			o.ctx.globalCompositeOperation = "source-over";
			o.ctx.drawImage(canvas,0,0);
			o.ctx.applyTransforms(ms);
			ctx = o.ctx;
			canvas = o.canvas;
			break;
		case 58:
			clips.push({ctx:ctx,canvas:canvas});
			var ccanvas = createCanvas(canvas.width,canvas.height);
			var cctx = ccanvas.getContext("2d");
			enhanceContext(cctx);
			cctx.applyTransforms(ctx._matrix);
			canvas = ccanvas;
			ctx = cctx;
			place("shape110",canvas,ctx,[0.05,0.0,0.0,0.05,194.0,42.15],ctrans,1,0,0,time);
			clips[clips.length-1].clipCanvas = canvas;
			canvas = createCanvas(canvas.width,canvas.height);
			var nctx = canvas.getContext("2d");
			enhanceContext(nctx);
			nctx.applyTransforms(ctx._matrix);
			ctx = nctx;
			place("shape111",canvas,ctx,[0.009445953369140624,0.0,0.0,0.009445953369140624,188.15,4.0],ctrans.merge(new cxform(11,90,0,0,244,244,55,256)),1,0,0,time);
			var o = clips.pop();
			ctx.globalCompositeOperation = "destination-in";
			ctx.setTransform(1,0,0,1,0,0);
			ctx.drawImage(o.clipCanvas,0,0);
			var ms=o.ctx._matrix;
			o.ctx.setTransform(1,0,0,1,0,0);
			o.ctx.globalCompositeOperation = "source-over";
			o.ctx.drawImage(canvas,0,0);
			o.ctx.applyTransforms(ms);
			ctx = o.ctx;
			canvas = o.canvas;
			break;
		case 59:
			clips.push({ctx:ctx,canvas:canvas});
			var ccanvas = createCanvas(canvas.width,canvas.height);
			var cctx = ccanvas.getContext("2d");
			enhanceContext(cctx);
			cctx.applyTransforms(ctx._matrix);
			canvas = ccanvas;
			ctx = cctx;
			place("shape110",canvas,ctx,[0.05,0.0,0.0,0.05,194.05,43.55],ctrans,1,0,0,time);
			clips[clips.length-1].clipCanvas = canvas;
			canvas = createCanvas(canvas.width,canvas.height);
			var nctx = canvas.getContext("2d");
			enhanceContext(nctx);
			nctx.applyTransforms(ctx._matrix);
			ctx = nctx;
			place("shape111",canvas,ctx,[0.01169891357421875,0.0,0.0,0.01169891357421875,188.2,5.35],ctrans.merge(new cxform(15,90,0,0,240,240,62,256)),1,0,0,time);
			var o = clips.pop();
			ctx.globalCompositeOperation = "destination-in";
			ctx.setTransform(1,0,0,1,0,0);
			ctx.drawImage(o.clipCanvas,0,0);
			var ms=o.ctx._matrix;
			o.ctx.setTransform(1,0,0,1,0,0);
			o.ctx.globalCompositeOperation = "source-over";
			o.ctx.drawImage(canvas,0,0);
			o.ctx.applyTransforms(ms);
			ctx = o.ctx;
			canvas = o.canvas;
			break;
		case 60:
			clips.push({ctx:ctx,canvas:canvas});
			var ccanvas = createCanvas(canvas.width,canvas.height);
			var cctx = ccanvas.getContext("2d");
			enhanceContext(cctx);
			cctx.applyTransforms(ctx._matrix);
			canvas = ccanvas;
			ctx = cctx;
			place("shape110",canvas,ctx,[0.05,0.0,0.0,0.05,194.1,45.0],ctrans,1,0,0,time);
			clips[clips.length-1].clipCanvas = canvas;
			canvas = createCanvas(canvas.width,canvas.height);
			var nctx = canvas.getContext("2d");
			enhanceContext(nctx);
			nctx.applyTransforms(ctx._matrix);
			ctx = nctx;
			place("shape111",canvas,ctx,[0.013951873779296875,0.0,0.0,0.013951873779296875,188.3,6.75],ctrans.merge(new cxform(19,89,0,0,236,236,68,256)),1,0,0,time);
			var o = clips.pop();
			ctx.globalCompositeOperation = "destination-in";
			ctx.setTransform(1,0,0,1,0,0);
			ctx.drawImage(o.clipCanvas,0,0);
			var ms=o.ctx._matrix;
			o.ctx.setTransform(1,0,0,1,0,0);
			o.ctx.globalCompositeOperation = "source-over";
			o.ctx.drawImage(canvas,0,0);
			o.ctx.applyTransforms(ms);
			ctx = o.ctx;
			canvas = o.canvas;
			break;
		case 61:
			clips.push({ctx:ctx,canvas:canvas});
			var ccanvas = createCanvas(canvas.width,canvas.height);
			var cctx = ccanvas.getContext("2d");
			enhanceContext(cctx);
			cctx.applyTransforms(ctx._matrix);
			canvas = ccanvas;
			ctx = cctx;
			place("shape110",canvas,ctx,[0.05,0.0,0.0,0.05,194.1,46.4],ctrans,1,0,0,time);
			clips[clips.length-1].clipCanvas = canvas;
			canvas = createCanvas(canvas.width,canvas.height);
			var nctx = canvas.getContext("2d");
			enhanceContext(nctx);
			nctx.applyTransforms(ctx._matrix);
			ctx = nctx;
			place("shape111",canvas,ctx,[0.016205596923828124,0.0,0.0,0.016205596923828124,188.4,8.15],ctrans.merge(new cxform(23,89,0,0,232,232,75,256)),1,0,0,time);
			var o = clips.pop();
			ctx.globalCompositeOperation = "destination-in";
			ctx.setTransform(1,0,0,1,0,0);
			ctx.drawImage(o.clipCanvas,0,0);
			var ms=o.ctx._matrix;
			o.ctx.setTransform(1,0,0,1,0,0);
			o.ctx.globalCompositeOperation = "source-over";
			o.ctx.drawImage(canvas,0,0);
			o.ctx.applyTransforms(ms);
			ctx = o.ctx;
			canvas = o.canvas;
			break;
		case 62:
			clips.push({ctx:ctx,canvas:canvas});
			var ccanvas = createCanvas(canvas.width,canvas.height);
			var cctx = ccanvas.getContext("2d");
			enhanceContext(cctx);
			cctx.applyTransforms(ctx._matrix);
			canvas = ccanvas;
			ctx = cctx;
			place("shape110",canvas,ctx,[0.05,0.0,0.0,0.05,194.15,47.85],ctrans,1,0,0,time);
			clips[clips.length-1].clipCanvas = canvas;
			canvas = createCanvas(canvas.width,canvas.height);
			var nctx = canvas.getContext("2d");
			enhanceContext(nctx);
			nctx.applyTransforms(ctx._matrix);
			ctx = nctx;
			place("shape111",canvas,ctx,[0.018457794189453126,0.0,0.0,0.018457794189453126,188.5,9.5],ctrans.merge(new cxform(27,89,0,0,228,228,81,256)),1,0,0,time);
			var o = clips.pop();
			ctx.globalCompositeOperation = "destination-in";
			ctx.setTransform(1,0,0,1,0,0);
			ctx.drawImage(o.clipCanvas,0,0);
			var ms=o.ctx._matrix;
			o.ctx.setTransform(1,0,0,1,0,0);
			o.ctx.globalCompositeOperation = "source-over";
			o.ctx.drawImage(canvas,0,0);
			o.ctx.applyTransforms(ms);
			ctx = o.ctx;
			canvas = o.canvas;
			break;
		case 63:
			clips.push({ctx:ctx,canvas:canvas});
			var ccanvas = createCanvas(canvas.width,canvas.height);
			var cctx = ccanvas.getContext("2d");
			enhanceContext(cctx);
			cctx.applyTransforms(ctx._matrix);
			canvas = ccanvas;
			ctx = cctx;
			place("shape110",canvas,ctx,[0.05,0.0,0.0,0.05,194.2,49.3],ctrans,1,0,0,time);
			clips[clips.length-1].clipCanvas = canvas;
			canvas = createCanvas(canvas.width,canvas.height);
			var nctx = canvas.getContext("2d");
			enhanceContext(nctx);
			nctx.applyTransforms(ctx._matrix);
			ctx = nctx;
			place("shape111",canvas,ctx,[0.02071075439453125,0.0,0.0,0.02071075439453125,188.6,10.9],ctrans.merge(new cxform(30,88,0,0,224,224,88,256)),1,0,0,time);
			var o = clips.pop();
			ctx.globalCompositeOperation = "destination-in";
			ctx.setTransform(1,0,0,1,0,0);
			ctx.drawImage(o.clipCanvas,0,0);
			var ms=o.ctx._matrix;
			o.ctx.setTransform(1,0,0,1,0,0);
			o.ctx.globalCompositeOperation = "source-over";
			o.ctx.drawImage(canvas,0,0);
			o.ctx.applyTransforms(ms);
			ctx = o.ctx;
			canvas = o.canvas;
			break;
		case 64:
			clips.push({ctx:ctx,canvas:canvas});
			var ccanvas = createCanvas(canvas.width,canvas.height);
			var cctx = ccanvas.getContext("2d");
			enhanceContext(cctx);
			cctx.applyTransforms(ctx._matrix);
			canvas = ccanvas;
			ctx = cctx;
			place("shape110",canvas,ctx,[0.05,0.0,0.0,0.05,194.25,50.7],ctrans,1,0,0,time);
			clips[clips.length-1].clipCanvas = canvas;
			canvas = createCanvas(canvas.width,canvas.height);
			var nctx = canvas.getContext("2d");
			enhanceContext(nctx);
			nctx.applyTransforms(ctx._matrix);
			ctx = nctx;
			place("shape111",canvas,ctx,[0.0229644775390625,0.0,0.0,0.0229644775390625,188.7,12.3],ctrans.merge(new cxform(34,88,0,0,220,220,94,256)),1,0,0,time);
			var o = clips.pop();
			ctx.globalCompositeOperation = "destination-in";
			ctx.setTransform(1,0,0,1,0,0);
			ctx.drawImage(o.clipCanvas,0,0);
			var ms=o.ctx._matrix;
			o.ctx.setTransform(1,0,0,1,0,0);
			o.ctx.globalCompositeOperation = "source-over";
			o.ctx.drawImage(canvas,0,0);
			o.ctx.applyTransforms(ms);
			ctx = o.ctx;
			canvas = o.canvas;
			break;
		case 65:
			clips.push({ctx:ctx,canvas:canvas});
			var ccanvas = createCanvas(canvas.width,canvas.height);
			var cctx = ccanvas.getContext("2d");
			enhanceContext(cctx);
			cctx.applyTransforms(ctx._matrix);
			canvas = ccanvas;
			ctx = cctx;
			place("shape110",canvas,ctx,[0.05,0.0,0.0,0.05,194.3,52.15],ctrans,1,0,0,time);
			clips[clips.length-1].clipCanvas = canvas;
			canvas = createCanvas(canvas.width,canvas.height);
			var nctx = canvas.getContext("2d");
			enhanceContext(nctx);
			nctx.applyTransforms(ctx._matrix);
			ctx = nctx;
			place("shape111",canvas,ctx,[0.025217437744140626,0.0,0.0,0.025217437744140626,188.75,13.65],ctrans.merge(new cxform(38,88,0,0,216,216,101,256)),1,0,0,time);
			var o = clips.pop();
			ctx.globalCompositeOperation = "destination-in";
			ctx.setTransform(1,0,0,1,0,0);
			ctx.drawImage(o.clipCanvas,0,0);
			var ms=o.ctx._matrix;
			o.ctx.setTransform(1,0,0,1,0,0);
			o.ctx.globalCompositeOperation = "source-over";
			o.ctx.drawImage(canvas,0,0);
			o.ctx.applyTransforms(ms);
			ctx = o.ctx;
			canvas = o.canvas;
			break;
		case 66:
			clips.push({ctx:ctx,canvas:canvas});
			var ccanvas = createCanvas(canvas.width,canvas.height);
			var cctx = ccanvas.getContext("2d");
			enhanceContext(cctx);
			cctx.applyTransforms(ctx._matrix);
			canvas = ccanvas;
			ctx = cctx;
			place("shape110",canvas,ctx,[0.05,0.0,0.0,0.05,194.35,53.55],ctrans,1,0,0,time);
			clips[clips.length-1].clipCanvas = canvas;
			canvas = createCanvas(canvas.width,canvas.height);
			var nctx = canvas.getContext("2d");
			enhanceContext(nctx);
			nctx.applyTransforms(ctx._matrix);
			ctx = nctx;
			place("shape111",canvas,ctx,[0.027469635009765625,0.0,0.0,0.027469635009765625,188.85,15.05],ctrans.merge(new cxform(42,87,1,0,212,212,107,256)),1,0,0,time);
			var o = clips.pop();
			ctx.globalCompositeOperation = "destination-in";
			ctx.setTransform(1,0,0,1,0,0);
			ctx.drawImage(o.clipCanvas,0,0);
			var ms=o.ctx._matrix;
			o.ctx.setTransform(1,0,0,1,0,0);
			o.ctx.globalCompositeOperation = "source-over";
			o.ctx.drawImage(canvas,0,0);
			o.ctx.applyTransforms(ms);
			ctx = o.ctx;
			canvas = o.canvas;
			break;
		case 67:
			clips.push({ctx:ctx,canvas:canvas});
			var ccanvas = createCanvas(canvas.width,canvas.height);
			var cctx = ccanvas.getContext("2d");
			enhanceContext(cctx);
			cctx.applyTransforms(ctx._matrix);
			canvas = ccanvas;
			ctx = cctx;
			place("shape110",canvas,ctx,[0.05,0.0,0.0,0.05,194.4,55.0],ctrans,1,0,0,time);
			clips[clips.length-1].clipCanvas = canvas;
			canvas = createCanvas(canvas.width,canvas.height);
			var nctx = canvas.getContext("2d");
			enhanceContext(nctx);
			nctx.applyTransforms(ctx._matrix);
			ctx = nctx;
			place("shape111",canvas,ctx,[0.02972259521484375,0.0,0.0,0.02972259521484375,188.9,16.4],ctrans.merge(new cxform(46,87,1,0,208,208,114,256)),1,0,0,time);
			var o = clips.pop();
			ctx.globalCompositeOperation = "destination-in";
			ctx.setTransform(1,0,0,1,0,0);
			ctx.drawImage(o.clipCanvas,0,0);
			var ms=o.ctx._matrix;
			o.ctx.setTransform(1,0,0,1,0,0);
			o.ctx.globalCompositeOperation = "source-over";
			o.ctx.drawImage(canvas,0,0);
			o.ctx.applyTransforms(ms);
			ctx = o.ctx;
			canvas = o.canvas;
			break;
		case 68:
			clips.push({ctx:ctx,canvas:canvas});
			var ccanvas = createCanvas(canvas.width,canvas.height);
			var cctx = ccanvas.getContext("2d");
			enhanceContext(cctx);
			cctx.applyTransforms(ctx._matrix);
			canvas = ccanvas;
			ctx = cctx;
			place("shape110",canvas,ctx,[0.05,0.0,0.0,0.05,194.45,56.4],ctrans,1,0,0,time);
			clips[clips.length-1].clipCanvas = canvas;
			canvas = createCanvas(canvas.width,canvas.height);
			var nctx = canvas.getContext("2d");
			enhanceContext(nctx);
			nctx.applyTransforms(ctx._matrix);
			ctx = nctx;
			place("shape111",canvas,ctx,[0.031976318359375,0.0,0.0,0.031976318359375,189.05,17.8],ctrans.merge(new cxform(50,87,1,0,204,204,120,256)),1,0,0,time);
			var o = clips.pop();
			ctx.globalCompositeOperation = "destination-in";
			ctx.setTransform(1,0,0,1,0,0);
			ctx.drawImage(o.clipCanvas,0,0);
			var ms=o.ctx._matrix;
			o.ctx.setTransform(1,0,0,1,0,0);
			o.ctx.globalCompositeOperation = "source-over";
			o.ctx.drawImage(canvas,0,0);
			o.ctx.applyTransforms(ms);
			ctx = o.ctx;
			canvas = o.canvas;
			break;
		case 69:
			clips.push({ctx:ctx,canvas:canvas});
			var ccanvas = createCanvas(canvas.width,canvas.height);
			var cctx = ccanvas.getContext("2d");
			enhanceContext(cctx);
			cctx.applyTransforms(ctx._matrix);
			canvas = ccanvas;
			ctx = cctx;
			place("shape110",canvas,ctx,[0.05,0.0,0.0,0.05,194.5,57.85],ctrans,1,0,0,time);
			clips[clips.length-1].clipCanvas = canvas;
			canvas = createCanvas(canvas.width,canvas.height);
			var nctx = canvas.getContext("2d");
			enhanceContext(nctx);
			nctx.applyTransforms(ctx._matrix);
			ctx = nctx;
			place("shape111",canvas,ctx,[0.034229278564453125,0.0,0.0,0.034229278564453125,189.15,19.2],ctrans.merge(new cxform(53,86,1,0,200,200,127,256)),1,0,0,time);
			var o = clips.pop();
			ctx.globalCompositeOperation = "destination-in";
			ctx.setTransform(1,0,0,1,0,0);
			ctx.drawImage(o.clipCanvas,0,0);
			var ms=o.ctx._matrix;
			o.ctx.setTransform(1,0,0,1,0,0);
			o.ctx.globalCompositeOperation = "source-over";
			o.ctx.drawImage(canvas,0,0);
			o.ctx.applyTransforms(ms);
			ctx = o.ctx;
			canvas = o.canvas;
			break;
		case 70:
			clips.push({ctx:ctx,canvas:canvas});
			var ccanvas = createCanvas(canvas.width,canvas.height);
			var cctx = ccanvas.getContext("2d");
			enhanceContext(cctx);
			cctx.applyTransforms(ctx._matrix);
			canvas = ccanvas;
			ctx = cctx;
			place("shape110",canvas,ctx,[0.05,0.0,0.0,0.05,194.55,59.3],ctrans,1,0,0,time);
			clips[clips.length-1].clipCanvas = canvas;
			canvas = createCanvas(canvas.width,canvas.height);
			var nctx = canvas.getContext("2d");
			enhanceContext(nctx);
			nctx.applyTransforms(ctx._matrix);
			ctx = nctx;
			place("shape111",canvas,ctx,[0.036481475830078124,0.0,0.0,0.036481475830078124,189.25,20.55],ctrans.merge(new cxform(57,86,1,0,196,196,133,256)),1,0,0,time);
			var o = clips.pop();
			ctx.globalCompositeOperation = "destination-in";
			ctx.setTransform(1,0,0,1,0,0);
			ctx.drawImage(o.clipCanvas,0,0);
			var ms=o.ctx._matrix;
			o.ctx.setTransform(1,0,0,1,0,0);
			o.ctx.globalCompositeOperation = "source-over";
			o.ctx.drawImage(canvas,0,0);
			o.ctx.applyTransforms(ms);
			ctx = o.ctx;
			canvas = o.canvas;
			break;
		case 71:
			clips.push({ctx:ctx,canvas:canvas});
			var ccanvas = createCanvas(canvas.width,canvas.height);
			var cctx = ccanvas.getContext("2d");
			enhanceContext(cctx);
			cctx.applyTransforms(ctx._matrix);
			canvas = ccanvas;
			ctx = cctx;
			place("shape110",canvas,ctx,[0.05,0.0,0.0,0.05,194.55,60.7],ctrans,1,0,0,time);
			clips[clips.length-1].clipCanvas = canvas;
			canvas = createCanvas(canvas.width,canvas.height);
			var nctx = canvas.getContext("2d");
			enhanceContext(nctx);
			nctx.applyTransforms(ctx._matrix);
			ctx = nctx;
			place("shape111",canvas,ctx,[0.03873519897460938,0.0,0.0,0.03873519897460938,189.35,21.95],ctrans.merge(new cxform(61,86,1,0,192,192,140,256)),1,0,0,time);
			var o = clips.pop();
			ctx.globalCompositeOperation = "destination-in";
			ctx.setTransform(1,0,0,1,0,0);
			ctx.drawImage(o.clipCanvas,0,0);
			var ms=o.ctx._matrix;
			o.ctx.setTransform(1,0,0,1,0,0);
			o.ctx.globalCompositeOperation = "source-over";
			o.ctx.drawImage(canvas,0,0);
			o.ctx.applyTransforms(ms);
			ctx = o.ctx;
			canvas = o.canvas;
			break;
		case 72:
			clips.push({ctx:ctx,canvas:canvas});
			var ccanvas = createCanvas(canvas.width,canvas.height);
			var cctx = ccanvas.getContext("2d");
			enhanceContext(cctx);
			cctx.applyTransforms(ctx._matrix);
			canvas = ccanvas;
			ctx = cctx;
			place("shape110",canvas,ctx,[0.05,0.0,0.0,0.05,194.6,62.15],ctrans,1,0,0,time);
			clips[clips.length-1].clipCanvas = canvas;
			canvas = createCanvas(canvas.width,canvas.height);
			var nctx = canvas.getContext("2d");
			enhanceContext(nctx);
			nctx.applyTransforms(ctx._matrix);
			ctx = nctx;
			place("shape111",canvas,ctx,[0.0409881591796875,0.0,0.0,0.0409881591796875,189.45,23.35],ctrans.merge(new cxform(65,85,1,0,188,188,146,256)),1,0,0,time);
			var o = clips.pop();
			ctx.globalCompositeOperation = "destination-in";
			ctx.setTransform(1,0,0,1,0,0);
			ctx.drawImage(o.clipCanvas,0,0);
			var ms=o.ctx._matrix;
			o.ctx.setTransform(1,0,0,1,0,0);
			o.ctx.globalCompositeOperation = "source-over";
			o.ctx.drawImage(canvas,0,0);
			o.ctx.applyTransforms(ms);
			ctx = o.ctx;
			canvas = o.canvas;
			break;
		case 73:
			clips.push({ctx:ctx,canvas:canvas});
			var ccanvas = createCanvas(canvas.width,canvas.height);
			var cctx = ccanvas.getContext("2d");
			enhanceContext(cctx);
			cctx.applyTransforms(ctx._matrix);
			canvas = ccanvas;
			ctx = cctx;
			place("shape110",canvas,ctx,[0.05,0.0,0.0,0.05,194.65,63.55],ctrans,1,0,0,time);
			clips[clips.length-1].clipCanvas = canvas;
			canvas = createCanvas(canvas.width,canvas.height);
			var nctx = canvas.getContext("2d");
			enhanceContext(nctx);
			nctx.applyTransforms(ctx._matrix);
			ctx = nctx;
			place("shape111",canvas,ctx,[0.043241119384765624,0.0,0.0,0.043241119384765624,189.5,24.7],ctrans.merge(new cxform(69,85,1,0,184,184,153,256)),1,0,0,time);
			var o = clips.pop();
			ctx.globalCompositeOperation = "destination-in";
			ctx.setTransform(1,0,0,1,0,0);
			ctx.drawImage(o.clipCanvas,0,0);
			var ms=o.ctx._matrix;
			o.ctx.setTransform(1,0,0,1,0,0);
			o.ctx.globalCompositeOperation = "source-over";
			o.ctx.drawImage(canvas,0,0);
			o.ctx.applyTransforms(ms);
			ctx = o.ctx;
			canvas = o.canvas;
			break;
		case 74:
			clips.push({ctx:ctx,canvas:canvas});
			var ccanvas = createCanvas(canvas.width,canvas.height);
			var cctx = ccanvas.getContext("2d");
			enhanceContext(cctx);
			cctx.applyTransforms(ctx._matrix);
			canvas = ccanvas;
			ctx = cctx;
			place("shape110",canvas,ctx,[0.05,0.0,0.0,0.05,194.7,65.0],ctrans,1,0,0,time);
			clips[clips.length-1].clipCanvas = canvas;
			canvas = createCanvas(canvas.width,canvas.height);
			var nctx = canvas.getContext("2d");
			enhanceContext(nctx);
			nctx.applyTransforms(ctx._matrix);
			ctx = nctx;
			place("shape111",canvas,ctx,[0.04549331665039062,0.0,0.0,0.04549331665039062,189.6,26.1],ctrans.merge(new cxform(72,85,1,0,180,180,159,256)),1,0,0,time);
			var o = clips.pop();
			ctx.globalCompositeOperation = "destination-in";
			ctx.setTransform(1,0,0,1,0,0);
			ctx.drawImage(o.clipCanvas,0,0);
			var ms=o.ctx._matrix;
			o.ctx.setTransform(1,0,0,1,0,0);
			o.ctx.globalCompositeOperation = "source-over";
			o.ctx.drawImage(canvas,0,0);
			o.ctx.applyTransforms(ms);
			ctx = o.ctx;
			canvas = o.canvas;
			break;
		case 75:
			clips.push({ctx:ctx,canvas:canvas});
			var ccanvas = createCanvas(canvas.width,canvas.height);
			var cctx = ccanvas.getContext("2d");
			enhanceContext(cctx);
			cctx.applyTransforms(ctx._matrix);
			canvas = ccanvas;
			ctx = cctx;
			place("shape110",canvas,ctx,[0.05,0.0,0.0,0.05,194.75,66.4],ctrans,1,0,0,time);
			clips[clips.length-1].clipCanvas = canvas;
			canvas = createCanvas(canvas.width,canvas.height);
			var nctx = canvas.getContext("2d");
			enhanceContext(nctx);
			nctx.applyTransforms(ctx._matrix);
			ctx = nctx;
			place("shape111",canvas,ctx,[0.047747039794921876,0.0,0.0,0.047747039794921876,189.7,27.45],ctrans.merge(new cxform(76,84,1,0,176,176,166,256)),1,0,0,time);
			var o = clips.pop();
			ctx.globalCompositeOperation = "destination-in";
			ctx.setTransform(1,0,0,1,0,0);
			ctx.drawImage(o.clipCanvas,0,0);
			var ms=o.ctx._matrix;
			o.ctx.setTransform(1,0,0,1,0,0);
			o.ctx.globalCompositeOperation = "source-over";
			o.ctx.drawImage(canvas,0,0);
			o.ctx.applyTransforms(ms);
			ctx = o.ctx;
			canvas = o.canvas;
			break;
		case 76:
			clips.push({ctx:ctx,canvas:canvas});
			var ccanvas = createCanvas(canvas.width,canvas.height);
			var cctx = ccanvas.getContext("2d");
			enhanceContext(cctx);
			cctx.applyTransforms(ctx._matrix);
			canvas = ccanvas;
			ctx = cctx;
			place("shape110",canvas,ctx,[0.05,0.0,0.0,0.05,194.8,67.85],ctrans,1,0,0,time);
			clips[clips.length-1].clipCanvas = canvas;
			canvas = createCanvas(canvas.width,canvas.height);
			var nctx = canvas.getContext("2d");
			enhanceContext(nctx);
			nctx.applyTransforms(ctx._matrix);
			ctx = nctx;
			place("shape111",canvas,ctx,[0.05,0.0,0.0,0.05,189.8,28.85],ctrans.merge(new cxform(80,84,1,0,172,172,172,256)),1,0,0,time);
			var o = clips.pop();
			ctx.globalCompositeOperation = "destination-in";
			ctx.setTransform(1,0,0,1,0,0);
			ctx.drawImage(o.clipCanvas,0,0);
			var ms=o.ctx._matrix;
			o.ctx.setTransform(1,0,0,1,0,0);
			o.ctx.globalCompositeOperation = "source-over";
			o.ctx.drawImage(canvas,0,0);
			o.ctx.applyTransforms(ms);
			ctx = o.ctx;
			canvas = o.canvas;
			break;
		case 77:
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
frames.push(44);
frames.push(45);
frames.push(46);
frames.push(47);
frames.push(48);
frames.push(49);
frames.push(50);
frames.push(51);
frames.push(52);
frames.push(53);
frames.push(54);
frames.push(55);
frames.push(56);
frames.push(57);
frames.push(58);
frames.push(59);
frames.push(60);
frames.push(61);
frames.push(62);
frames.push(63);
frames.push(64);
frames.push(65);
frames.push(66);
frames.push(67);
frames.push(68);
frames.push(69);
frames.push(70);
frames.push(71);
frames.push(72);
frames.push(73);
frames.push(74);
frames.push(75);
frames.push(76);
frames.push(77);

// var backgroundColor = "#ffffff";
var originalWidth = 1374;
var originalHeight= 1374;
function nextFrame(ctx,ctrans){
	var oldframe = frame;
	frame = (frame+1)%frames.length;
	if(frame==oldframe){time++;}else{time=0;};
	drawFrame();
}

function drawFrame(){
	ctx.clearRect(0,0,canvas.width,canvas.height);
	ctx.save();
	ctx.transform(canvas.width/originalWidth,0,0,canvas.height/originalHeight,0,0);
	sprite112(ctx,ctrans,frames[frame],0,time);
	ctx.restore();
}

window.setInterval(function(){nextFrame(ctx,ctrans);},33);
nextFrame(ctx,ctrans);