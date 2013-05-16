/**
 * ttf.js - JavaScript TrueType Font library.
 * Copyright (c) 2013 ynakajima (http://github.com/ynakajima)
 *
 * Released under the MIT license.
 *
 * TTFDataView.getLongDateTime() method is:
 *   copyright (C) 2000,2001,2002,2003,2004,2005,2006,2007,2008
 *   George Williams. Released under BSD license.
 *
 */        
// Generated by CoffeeScript 1.4.0
(function() {
  var CompositeGlyphData, GlyfTable, HeadTable, HheaTable, HmtxTable, LocaTable, MaxpTable, SimpleGlyphData, TTFDataView, TrueType, jDataView, ttfjs;

  jDataView = typeof require !== 'undefined' ? require('jdataview') : this.jDataView;

  TTFDataView = (function() {

    function TTFDataView(buffer) {
      this.buffer = buffer;
      this.view = new jDataView(this.buffer);
    }

    TTFDataView.prototype.seek = function(offset) {
      if (typeof offset === 'number') {
        this.view.seek(offset);
      }
      return this;
    };

    TTFDataView.prototype.tell = function() {
      return this.view.tell();
    };

    TTFDataView.prototype.getString = function(length, offset) {
      return this.view.getString(length, offset);
    };

    TTFDataView.prototype.getByte = function(offset) {
      return this.view.getUint8(offset);
    };

    TTFDataView.prototype.getChar = function(offset) {
      return this.view.getInt8(offset);
    };

    TTFDataView.prototype.getUshort = function(offset) {
      return this.view.getUint16(offset);
    };

    TTFDataView.prototype.getShort = function(offset) {
      return this.view.getInt16(offset);
    };

    TTFDataView.prototype.getUlong = function(offset) {
      return this.view.getUint32(offset);
    };

    TTFDataView.prototype.getLong = function(offset) {
      return this.view.getInt32(offset);
    };

    /**
     * Return 32-bit signed fixed-point number (16.16).
     * @param {number} `offset` offset.
    */


    TTFDataView.prototype.getFixed = function(offset) {
      var fraction, mantissa;
      if (typeof offset === 'number') {
        this.seek(offset);
      }
      mantissa = this.view.getInt16();
      fraction = this.view.getUint16() / Math.pow(2, 16);
      return Math.ceil((mantissa + fraction) * 1000) / 1000;
    };

    TTFDataView.prototype.getF2dot14 = function(offset) {
      var fraction, mantissa, value;
      if (typeof offset === 'number') {
        this.seek(offset);
      }
      value = this.view.getUint16();
      mantissa = [0, 1, -2, -1][value >>> 14];
      fraction = (value & 0x3fff) / Math.pow(2, 14);
      return Math.round((mantissa + fraction) * 1000000) / 1000000;
    };

    /**
     * Return the long internal format of a date
     * in seconds since 12:00 midnight, January 1, 1904.
     * It is represented as a signed 64-bit integer.<br />
     *
     * This method has been ported form the FontForge. <br />
     * https://github.com/fontforge/fontforge/blob/v20120731-b/fonttools/showttf.c#L483-L516
     * @param {number} offset offset.
     * @return {Date} date.
    */


    TTFDataView.prototype.getLongDateTime = function(offset) {
      var date, date1970, i, unixtime, year, _i, _j;
      if (typeof offset === 'number') {
        this.seek(offset);
      }
      date = [0, 0, 0, 0];
      date1970 = [0, 0, 0, 0];
      year = [];
      date[3] = this.getUshort();
      date[2] = this.getUshort();
      date[1] = this.getUshort();
      date[0] = this.getUshort();
      year[0] = (60 * 60 * 24 * 365) & 0xffff;
      year[1] = (60 * 60 * 24 * 365) >> 16;
      for (i = _i = 1904; _i <= 1969; i = ++_i) {
        date1970[0] += year[0];
        date1970[1] += year[1];
        if ((i & 3) === 0 && (i % 100 !== 0 || i % 400 === 0)) {
          date1970[0] += 24 * 60 * 60;
        }
        date1970[1] += date1970[0] >> 16;
        date1970[0] &= 0xffff;
        date1970[2] += date1970[1] >> 16;
        date1970[1] &= 0xffff;
        date1970[3] += date1970[2] >> 16;
        date1970[2] &= 0xffff;
      }
      for (i = _j = 0; _j <= 3; i = ++_j) {
        date[i] -= date1970[i];
        date[i + 1] += date[i] >> 16;
        date[i] &= 0xffff;
      }
      date[3] -= date1970[3];
      unixtime = ((date[1] << 16) | date[0]) * 1000;
      return new Date(unixtime);
    };

    TTFDataView.prototype.getUFWord = function(offset) {
      return this.getUshort(offset);
    };

    TTFDataView.prototype.getFWord = function(offset) {
      return this.getShort(offset);
    };

    TTFDataView.prototype.getUshortFlags = function(offset) {
      var flags, i, num, _i, _results;
      flags = this.getUshort(offset);
      _results = [];
      for (i = _i = 0; _i <= 15; i = ++_i) {
        _results.push(num = (flags & Math.pow(2, i)) === 0 ? 0 : 1);
      }
      return _results;
    };

    return TTFDataView;

  })();









  TrueType = (function() {

    function TrueType() {
      this.sfntHeader = {
        sfntVersion: 0,
        numTables: 0,
        searchRange: 0,
        entrySelector: 0,
        rangeShift: 0
      };
      this.offsetTable = [];
      this.head = new HeadTable();
      this.maxp = new MaxpTable();
      this.loca = new LocaTable();
      this.glyf = new GlyfTable();
      this.hhea = new HheaTable();
      this.hmtx = new HmtxTable();
    }

    TrueType.prototype.isMacTTF = function() {
      return this.sfntHeader.sfntVersion === 'true';
    };

    TrueType.prototype.isWinTTF = function() {
      return this.sfntHeader.sfntVersion === 1.0;
    };

    TrueType.prototype.isTTCF = function() {
      return this.sfntHeader.sfntVersion === 'ttcf';
    };

    TrueType.prototype.isTTF = function() {
      return this.isMacTTF() || this.isWinTTF() || this.isTTCF();
    };

    TrueType.prototype.isOTTO = function() {
      return this.sfntHeader.sfntVersion === 'OTTO';
    };

    TrueType.prototype.isCFF = function() {
      return this.isOTTO();
    };

    TrueType.prototype.getNumGlyphs = function() {
      return this.maxp.numGlyphs;
    };

    TrueType.prototype.isLocaLong = function() {
      return this.head.isLocaLong();
    };

    TrueType.prototype.getGlyphById = function(id) {
      return this.glyf.getGlyphById(id);
    };

    TrueType.createFromBuffer = function(buffer) {
      var checkSum, i, length, offset, sfntVersionNumber, sfntVersionString, tableOffsets, tag, ttf, view;
      ttf = new TrueType();
      view = new TTFDataView(buffer);
      sfntVersionString = view.getString(4, 0);
      sfntVersionNumber = view.getFixed(0);
      ttf.sfntHeader.sfntVersion = sfntVersionNumber === 1.0 ? sfntVersionNumber : sfntVersionString;
      if (ttf.isTTF() && !ttf.isTTCF() || ttf.isOTTO()) {
        ttf.sfntHeader.numTables = view.getUshort(4);
        ttf.sfntHeader.searchRange = view.getUshort();
        ttf.sfntHeader.entrySelector = view.getUshort();
        ttf.sfntHeader.rangeShift = view.getUshort();
        if (ttf.sfntHeader.numTables > 0) {
          tableOffsets = {};
          ttf.offsetTable = (function() {
            var _i, _ref, _results;
            _results = [];
            for (i = _i = 0, _ref = ttf.sfntHeader.numTables - 1; 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
              tag = view.getString(4);
              checkSum = view.getUlong().toString(16);
              offset = view.getUlong();
              length = view.getUlong();
              tableOffsets[tag] = offset;
              _results.push({
                tag: tag,
                checkSum: checkSum,
                offset: offset,
                length: length
              });
            }
            return _results;
          })();
          if (typeof tableOffsets.head !== 'undefined') {
            ttf.head = HeadTable.createFromTTFDataView(view, tableOffsets.head, ttf);
          }
          if (typeof tableOffsets.maxp !== 'undefined') {
            ttf.maxp = MaxpTable.createFromTTFDataView(view, tableOffsets.maxp, ttf);
          }
          if (typeof tableOffsets.loca !== 'undefined') {
            ttf.loca = LocaTable.createFromTTFDataView(view, tableOffsets.loca, ttf);
          }
          if (typeof tableOffsets.glyf !== 'undefined') {
            ttf.glyf = GlyfTable.createFromTTFDataView(view, tableOffsets.glyf, ttf);
          }
          if (typeof tableOffsets.hhea !== 'undefined') {
            ttf.hhea = HheaTable.createFromTTFDataView(view, tableOffsets.hhea, ttf);
          }
          if (typeof tableOffsets.hmtx !== 'undefined') {
            ttf.hmtx = HmtxTable.createFromTTFDataView(view, tableOffsets.hmtx, ttf);
          }
        }
      }
      return ttf;
    };

    return TrueType;

  })();


  CompositeGlyphData = (function() {

    function CompositeGlyphData(GID, glyfTable) {
      if (GID == null) {
        GID = null;
      }
      if (glyfTable == null) {
        glyfTable = null;
      }
      this.GID = GID;
      this.type = 'composite';
      this.numberOfContours = 0;
      this.xMin = 0;
      this.yMin = 0;
      this.xMax = 0;
      this.yMax = 0;
      this.glyfTable = glyfTable;
      this.components = [];
    }

    CompositeGlyphData.prototype.toSVGPathString = function(options) {
      var component, glyph, m, matrix, newMatrix, pathString, relative, t, _m, _matrix, _ref, _ref1;
      matrix = (_ref = options != null ? options.matrix : void 0) != null ? _ref : void 0;
      relative = (_ref1 = options != null ? options.relative : void 0) != null ? _ref1 : false;
      pathString = (function() {
        var _i, _len, _ref2, _results;
        _ref2 = this.components;
        _results = [];
        for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
          component = _ref2[_i];
          t = component.transform;
          glyph = this.glyfTable.getGlyphById(component.glyphIndex);
          _matrix = {
            a: 1,
            c: 0,
            e: component.offsetX,
            b: 0,
            d: 1,
            f: component.offsetY
          };
          if (typeof t.scale !== 'undefined') {
            _matrix.a = _matrix.d = t.scale;
          }
          if (typeof t.xScale !== 'undefined') {
            _matrix.a = t.xScale;
          }
          if (typeof t.xScale !== 'undefined') {
            _matrix.d = t.yScale;
          }
          if (typeof t.scale01 !== 'undefined') {
            _matrix.b = t.scale01;
          }
          if (typeof t.scale10 !== 'undefined') {
            _matrix.c = t.scale10;
          }
          if (typeof matrix !== 'undefined') {
            m = matrix;
            _m = _matrix;
            newMatrix = {
              a: m.a * _m.a + m.c * _m.b,
              c: m.a * _m.c + m.c * _m.d,
              e: m.a * _m.e + m.c * _m.f + m.e,
              b: m.b * _m.a + m.d * _m.b,
              d: m.b * _m.c + m.d * _m.d,
              f: m.b * _m.e + m.d * _m.f + m.f
            };
            _matrix = newMatrix;
          }
          _results.push(glyph.toSVGPathString({
            matrix: _matrix,
            relative: relative
          }));
        }
        return _results;
      }).call(this);
      return pathString.join(' ');
    };

    CompositeGlyphData.createFromTTFDataView = function(view, offset, glyphID, glyfTable) {
      var ARGS_ARE_XY_VALUES, ARG_1_AND_2_ARE_WORDS, MORE_COMPONENTS, OVERLAP_COMPOUND, RESERVED, ROUND_XY_TO_GRID, SCALED_COMPONENT_OFFSET, UNSCALED_COMPONENT_OFFSET, USE_MY_METRICS, WE_HAVE_AN_X_AND_Y_SCALE, WE_HAVE_A_SCALE, WE_HAVE_A_TWO_BY_TWO, WE_HAVE_INSTRUCTIONS, component, do_, flags, g, transform;
      ARG_1_AND_2_ARE_WORDS = Math.pow(2, 0);
      ARGS_ARE_XY_VALUES = Math.pow(2, 1);
      ROUND_XY_TO_GRID = Math.pow(2, 2);
      WE_HAVE_A_SCALE = Math.pow(2, 3);
      RESERVED = Math.pow(2, 4);
      MORE_COMPONENTS = Math.pow(2, 5);
      WE_HAVE_AN_X_AND_Y_SCALE = Math.pow(2, 6);
      WE_HAVE_A_TWO_BY_TWO = Math.pow(2, 7);
      WE_HAVE_INSTRUCTIONS = Math.pow(2, 8);
      USE_MY_METRICS = Math.pow(2, 9);
      OVERLAP_COMPOUND = Math.pow(2, 10);
      SCALED_COMPONENT_OFFSET = Math.pow(2, 11);
      UNSCALED_COMPONENT_OFFSET = Math.pow(2, 12);
      view.seek(offset);
      g = new CompositeGlyphData(glyphID, glyfTable);
      g.numberOfContours = view.getShort();
      g.xMin = view.getShort();
      g.yMin = view.getShort();
      g.xMax = view.getShort();
      g.yMax = view.getShort();
      do_ = MORE_COMPONENTS;
      g.components = (function() {
        var _results;
        _results = [];
        while (do_ === MORE_COMPONENTS) {
          component = {
            offsetX: 0,
            offsetY: 0
          };
          component.flags = view.getUshort();
          component.glyphIndex = view.getUshort();
          flags = component.flags;
          if (flags & ARG_1_AND_2_ARE_WORDS) {
            if (flags & ARGS_ARE_XY_VALUES) {
              component.offsetX = view.getShort();
              component.offsetY = view.getShort();
            } else {
              component.points = [view.getShort(), view.getShort()];
            }
          } else {
            if (flags & ARGS_ARE_XY_VALUES) {
              component.offsetX = view.getChar();
              component.offsetY = view.getChar();
            } else {
              component.points = [view.getChar(), view.getChar()];
            }
          }
          component.transform = transform = {};
          if (flags & WE_HAVE_A_SCALE) {
            transform.scale = view.getF2dot14();
          } else if (flags & WE_HAVE_AN_X_AND_Y_SCALE) {
            transform.xScale = view.getF2dot14();
            transform.yScale = view.getF2dot14();
          } else if (flags & WE_HAVE_A_TWO_BY_TWO) {
            transform.xScale = view.getF2dot14();
            transform.scale01 = view.getF2dot14();
            transform.scale10 = view.getF2dot14();
            transform.yScale = view.getF2dot14();
          }
          do_ = flags & MORE_COMPONENTS;
          _results.push(component);
        }
        return _results;
      })();
      return g;
    };

    return CompositeGlyphData;

  })();


  SimpleGlyphData = (function() {

    function SimpleGlyphData(GID, glyfTable) {
      if (GID == null) {
        GID = null;
      }
      if (glyfTable == null) {
        glyfTable = null;
      }
      this.GID = GID;
      this.type = 'simple';
      this.numberOfContours = 0;
      this.xMin = 0;
      this.yMin = 0;
      this.xMax = 0;
      this.yMax = 0;
      this.endPtsOfContours = [];
      this.instructionLength = 0;
      this.instructions = [];
      this.flags = [];
      this.xCoordinates = [];
      this.yCoordinates = [];
      this.glyfTable = glyfTable;
      this._outline = [];
      this.setOutline = function(outline) {
        this._outline = outline != null ? outline : [];
        return this;
      };
      this.getOutline = function() {
        return this._outline;
      };
    }

    SimpleGlyphData.prototype.toSVGPathString = function(options) {
      var after_contour, c, contour, coordinate, currentPoint, distance, end, i, j, k, matrix, midPoint, next, outline, pathString, prev, relative, segment, start, startIndex, _contour, _i, _j, _k, _len, _len1, _len2, _ref, _ref1;
      matrix = (_ref = options != null ? options.matrix : void 0) != null ? _ref : void 0;
      relative = (_ref1 = options != null ? options.relative : void 0) != null ? _ref1 : false;
      outline = this.getTramsformedOutline(matrix);
      pathString = [];
      for (i = _i = 0, _len = outline.length; _i < _len; i = ++_i) {
        contour = outline[i];
        _contour = [];
        startIndex = 0;
        start = contour[0];
        if (!start.on) {
          if (contour.length > 1) {
            startIndex = 1;
            next = contour[1];
            if (!next.on) {
              _contour.push({
                x: start.x + (next.x - start.x) / 2,
                y: start.y + (next.y - start.y) / 2,
                on: true
              });
            }
          }
        }
        after_contour = [];
        for (j = _j = 0, _len1 = contour.length; _j < _len1; j = ++_j) {
          coordinate = contour[j];
          coordinate = {
            x: coordinate.x,
            y: coordinate.y,
            on: coordinate.on
          };
          if (j < startIndex) {
            after_contour.push(coordinate);
          } else {
            _contour.push(coordinate);
          }
        }
        _contour = _contour.concat(after_contour);
        start = _contour[0];
        end = _contour[_contour.length - 1];
        for (k = _k = 0, _len2 = _contour.length; _k < _len2; k = ++_k) {
          c = _contour[k];
          if (k === 0) {
            pathString.push('M ' + [c.x, c.y].join(','));
            currentPoint = c;
          } else {
            prev = _contour[k - 1];
            distance = {
              x: c.x - prev.x,
              y: c.y - prev.y,
              relX: c.x - currentPoint.x,
              relY: c.y - currentPoint.y
            };
            if (prev.on && c.on) {
              if (distance.y === 0) {
                segment = relative ? 'h ' + distance.relX : 'H ' + c.x;
                pathString.push(segment);
              } else if (distance.x === 0) {
                segment = relative ? 'v ' + distance.relY : 'V ' + c.y;
                pathString.push(segment);
              } else {
                segment = relative ? 'l ' + [distance.relX, distance.relY].join(',') : 'L ' + [c.x, c.y].join(',');
                pathString.push(segment);
              }
              currentPoint = c;
            } else if (prev.on && !c.on) {
              segment = relative ? 'q ' + [distance.relX, distance.relY].join(',') : 'Q ' + [c.x, c.y].join(',');
              pathString.push(segment);
            } else if (!prev.on && !c.on) {
              midPoint = {
                x: prev.x + (distance.x / 2),
                y: prev.y + (distance.y / 2),
                on: true
              };
              segment = relative ? [midPoint.x - currentPoint.x, midPoint.y - currentPoint.y].join(',') + ' t' : [midPoint.x, midPoint.y].join(',') + ' T';
              pathString.push(segment);
              currentPoint = midPoint;
            } else {
              segment = relative ? [distance.relX, distance.relY].join(',') : [c.x, c.y].join(',');
              pathString.push(segment);
              currentPoint = c;
            }
          }
        }
        if (end.on) {
          pathString.push('Z');
        } else if (relative) {
          pathString.push([start.x - currentPoint.x, start.y - currentPoint.y].join(',') + ' Z');
        } else {
          pathString.push([start.x, start.y].join(',') + ' Z');
        }
      }
      return pathString.join(' ');
    };

    SimpleGlyphData.prototype.getTramsformedOutline = function(matrix) {
      var contour, coordinate, _i, _len, _ref, _results;
      if (typeof matrix === 'undefined') {
        matrix = {
          a: 1,
          c: 0,
          e: 0,
          b: 0,
          d: 1,
          f: 0
        };
      }
      _ref = this.getOutline();
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        contour = _ref[_i];
        _results.push((function() {
          var _j, _len1, _results1;
          _results1 = [];
          for (_j = 0, _len1 = contour.length; _j < _len1; _j++) {
            coordinate = contour[_j];
            _results1.push({
              x: matrix.a * coordinate.x + matrix.c * coordinate.y + matrix.e,
              y: matrix.b * coordinate.x + matrix.d * coordinate.y + matrix.f,
              on: coordinate.on
            });
          }
          return _results1;
        })());
      }
      return _results;
    };

    SimpleGlyphData.createFromTTFDataView = function(view, offset, glyphID, glyfTable) {
      var ON_CURVE, POSITIVE_X_SHORT, POSITIVE_Y_SHORT, REPEAT, X_IS_SAME, X_SHORT, Y_IS_SAME, Y_SHORT, contour, endPtOfcountour, flag, flags, g, i, j, numRepeat, numberOfCoordinates, outline, relX, relY, startPtOfContour, x, y, _i;
      ON_CURVE = Math.pow(2, 0);
      X_SHORT = Math.pow(2, 1);
      Y_SHORT = Math.pow(2, 2);
      REPEAT = Math.pow(2, 3);
      X_IS_SAME = Math.pow(2, 4);
      POSITIVE_X_SHORT = Math.pow(2, 4);
      Y_IS_SAME = Math.pow(2, 5);
      POSITIVE_Y_SHORT = Math.pow(2, 5);
      view.seek(offset);
      g = new SimpleGlyphData(glyphID, glyfTable);
      g.numberOfContours = view.getShort();
      if (g.numberOfContours === 0) {
        return g;
      }
      g.xMin = view.getShort();
      g.yMin = view.getShort();
      g.xMax = view.getShort();
      g.yMax = view.getShort();
      g.endPtsOfContours = (function() {
        var _i, _ref, _results;
        _results = [];
        for (i = _i = 1, _ref = g.numberOfContours; 1 <= _ref ? _i <= _ref : _i >= _ref; i = 1 <= _ref ? ++_i : --_i) {
          _results.push(view.getUshort());
        }
        return _results;
      })();
      numberOfCoordinates = g.endPtsOfContours[g.endPtsOfContours.length - 1] + 1;
      g.instructionLength = view.getUshort();
      if (g.instructionLength > 0) {
        g.instructions = (function() {
          var _i, _ref, _results;
          _results = [];
          for (i = _i = 1, _ref = g.instructionLength; 1 <= _ref ? _i <= _ref : _i >= _ref; i = 1 <= _ref ? ++_i : --_i) {
            _results.push(view.getByte());
          }
          return _results;
        })();
      }
      flags = [];
      i = 0;
      while (i < numberOfCoordinates) {
        flag = view.getByte();
        flags.push(flag);
        i++;
        if (flag & REPEAT) {
          numRepeat = view.getByte();
          for (j = _i = 1; 1 <= numRepeat ? _i <= numRepeat : _i >= numRepeat; j = 1 <= numRepeat ? ++_i : --_i) {
            if (i < numberOfCoordinates) {
              flags.push(flag);
              i++;
            }
          }
        }
      }
      g.flags = flags;
      g.xCoordinates = (function() {
        var _j, _len, _results;
        _results = [];
        for (_j = 0, _len = flags.length; _j < _len; _j++) {
          flag = flags[_j];
          x = 0;
          if (flag & X_SHORT) {
            _results.push(x = (flag & POSITIVE_X_SHORT ? 1 : -1) * view.getByte());
          } else {
            _results.push(x = flag & X_IS_SAME ? 0 : view.getShort());
          }
        }
        return _results;
      })();
      g.yCoordinates = (function() {
        var _j, _len, _results;
        _results = [];
        for (_j = 0, _len = flags.length; _j < _len; _j++) {
          flag = flags[_j];
          y = 0;
          if (flag & Y_SHORT) {
            _results.push(y = (flag & POSITIVE_Y_SHORT ? 1 : -1) * view.getByte());
          } else {
            _results.push(y = flag & Y_IS_SAME ? 0 : view.getShort());
          }
        }
        return _results;
      })();
      startPtOfContour = x = y = 0;
      outline = (function() {
        var _j, _len, _ref, _results;
        _ref = g.endPtsOfContours;
        _results = [];
        for (_j = 0, _len = _ref.length; _j < _len; _j++) {
          endPtOfcountour = _ref[_j];
          contour = (function() {
            var _k, _results1;
            _results1 = [];
            for (i = _k = startPtOfContour; startPtOfContour <= endPtOfcountour ? _k <= endPtOfcountour : _k >= endPtOfcountour; i = startPtOfContour <= endPtOfcountour ? ++_k : --_k) {
              x += relX = g.xCoordinates[i];
              y += relY = g.yCoordinates[i];
              _results1.push({
                x: x,
                y: y,
                on: flags[i] & ON_CURVE === ON_CURVE
              });
            }
            return _results1;
          })();
          startPtOfContour = endPtOfcountour + 1;
          _results.push(contour);
        }
        return _results;
      })();
      g.setOutline(outline);
      return g;
    };

    return SimpleGlyphData;

  })();




  GlyfTable = (function() {

    function GlyfTable() {
      this.glyphs = [];
    }

    GlyfTable.prototype.getGlyphById = function(id) {
      if (typeof this.glyphs[id] !== 'undefined') {
        return this.glyphs[id];
      } else {
        return false;
      }
    };

    GlyfTable.createFromTTFDataView = function(view, offset, ttf) {
      var glyfTable, glyphLocation, i, loca, location;
      loca = ttf.loca;
      view.seek(offset);
      glyfTable = new GlyfTable();
      glyfTable.glyphs = (function() {
        var _i, _ref, _results;
        _results = [];
        for (i = _i = 0, _ref = loca.offsets.length - 2; 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
          location = loca.offsets[i];
          glyphLocation = location + offset;
          if ((loca.offsets[i + 1] != null) && location === loca.offsets[i + 1]) {
            _results.push(new SimpleGlyphData(i, glyfTable));
          } else if (view.getShort(glyphLocation) >= 0) {
            _results.push(SimpleGlyphData.createFromTTFDataView(view, glyphLocation, i, glyfTable));
          } else {
            _results.push(CompositeGlyphData.createFromTTFDataView(view, glyphLocation, i, glyfTable));
          }
        }
        return _results;
      })();
      return glyfTable;
    };

    return GlyfTable;

  })();


  HeadTable = (function() {

    function HeadTable() {
      this.version = 0;
      this.fontRevision = 0;
      this.checkSumAdjustment = '0x00000000';
      this.magicNumber = '0x5f0f3cf5';
      this.flags = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
      this.unitsPerEm = 0;
      this.created = new Date();
      this.modified = new Date();
      this.xMin = 0;
      this.yMin = 0;
      this.xMax = 0;
      this.yMax = 0;
      this.macStyle = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
      this.lowestRecPPEM = 0;
      this.fontDirectionHint = 2;
      this.indexToLocFormat = 0;
      this.glyphDataFormat = 0;
    }

    HeadTable.prototype.isLocaLong = function() {
      return this.indexToLocFormat === 1;
    };

    HeadTable.createFromTTFDataView = function(view, offset) {
      var head;
      view.seek(offset);
      head = new HeadTable();
      head.version = view.getFixed();
      head.fontRevision = view.getFixed();
      head.checkSumAdjustment = '0x' + view.getUlong(offset + 8).toString(16);
      head.magicNumber = '0x' + view.getUlong().toString(16);
      head.flags = view.getUshortFlags();
      head.unitsPerEm = view.getUshort();
      head.created = view.getLongDateTime();
      head.modified = view.getLongDateTime();
      head.xMin = view.getShort();
      head.yMin = view.getShort();
      head.xMax = view.getShort();
      head.yMax = view.getShort();
      head.macStyle = view.getUshortFlags();
      head.lowestRecPPEM = view.getUshort();
      head.fontDirectionHint = view.getShort();
      head.indexToLocFormat = view.getShort();
      head.glyphDataFormat = view.getShort();
      return head;
    };

    return HeadTable;

  })();


  HheaTable = (function() {

    function HheaTable() {
      this.version = 0;
      this.ascender = 0;
      this.descender = 0;
      this.lineGap = 0;
      this.advanceWidthMax = 0;
      this.minLeftSideBearing = 0;
      this.minRightSideBearing = 0;
      this.xMaxExtent = 0;
      this.caretSlopeRise = 0;
      this.caretOffset = 0;
      this.reserved_0 = 0;
      this.reserved_1 = 0;
      this.reserved_2 = 0;
      this.reserved_3 = 0;
      this.metricDataFormat = 0;
      this.numberOfHMetrics = 0;
    }

    HheaTable.createFromTTFDataView = function(view, offset, ttf) {
      var hhea;
      view.seek(offset);
      hhea = new HheaTable();
      hhea.version = view.getFixed();
      hhea.ascender = view.getFWord();
      hhea.descender = view.getFWord();
      hhea.lineGap = view.getFWord();
      hhea.advanceWidthMax = view.getUFWord();
      hhea.minLeftSideBearing = view.getFWord();
      hhea.minRightSideBearing = view.getFWord();
      hhea.xMaxExtent = view.getFWord();
      hhea.caretSlopeRise = view.getShort();
      hhea.caretSlopeRun = view.getShort();
      hhea.caretOffset = view.getShort();
      hhea.reserved_0 = view.getShort();
      hhea.reserved_1 = view.getShort();
      hhea.reserved_2 = view.getShort();
      hhea.reserved_3 = view.getShort();
      hhea.metricDataFormat = view.getShort();
      hhea.numberOfHMetrics = view.getUshort();
      return hhea;
    };

    return HheaTable;

  })();


  HmtxTable = (function() {

    function HmtxTable() {
      this.hMetrics = [];
      this.leftSideBearing = [];
    }

    HmtxTable.createFromTTFDataView = function(view, offset, ttf) {
      var hmtx, i, lsbNum, numGlyphs, numberOfHMetrics;
      numberOfHMetrics = ttf.hhea.numberOfHMetrics;
      numGlyphs = ttf.maxp.numGlyphs;
      lsbNum = numGlyphs - numberOfHMetrics;
      view.seek(offset);
      hmtx = new HmtxTable();
      hmtx.hMetrics = (function() {
        var _i, _results;
        _results = [];
        for (i = _i = 1; 1 <= numberOfHMetrics ? _i <= numberOfHMetrics : _i >= numberOfHMetrics; i = 1 <= numberOfHMetrics ? ++_i : --_i) {
          _results.push({
            advanceWidth: view.getUshort(),
            lsb: view.getShort()
          });
        }
        return _results;
      })();
      if (lsbNum > 0) {
        hmtx.leftSideBearing = (function() {
          var _i, _results;
          _results = [];
          for (i = _i = 1; 1 <= lsbNum ? _i <= lsbNum : _i >= lsbNum; i = 1 <= lsbNum ? ++_i : --_i) {
            _results.push(view.getShort());
          }
          return _results;
        })();
      }
      return hmtx;
    };

    return HmtxTable;

  })();


  LocaTable = (function() {

    function LocaTable() {
      this.offsets = [];
    }

    LocaTable.createFromTTFDataView = function(view, offset, ttf) {
      var i, loca, long, numGlyphs;
      numGlyphs = ttf.getNumGlyphs();
      long = ttf.isLocaLong();
      view.seek(offset);
      loca = new LocaTable();
      loca.offsets = (function() {
        var _i, _results;
        _results = [];
        for (i = _i = 0; 0 <= numGlyphs ? _i <= numGlyphs : _i >= numGlyphs; i = 0 <= numGlyphs ? ++_i : --_i) {
          if (long) {
            _results.push(view.getUlong());
          } else {
            _results.push(view.getUshort() * 2);
          }
        }
        return _results;
      })();
      return loca;
    };

    return LocaTable;

  })();


  MaxpTable = (function() {

    function MaxpTable() {
      this.version = 0;
      this.numGlyphs = 0;
      this.maxPoints = 0;
      this.maxContours = 0;
      this.maxCompositPoints = 0;
      this.maxCompositContours = 0;
      this.maxZones = 0;
      this.maxTwilightPoints = 0;
      this.maxStorage = 0;
      this.maxFunctionDefs = 0;
      this.maxInstructionDefs = 0;
      this.maxStackElements = 0;
      this.maxSizeOfInstructions = 0;
      this.maxComponentElements = 0;
      this.maxComponentDepth = 0;
    }

    MaxpTable.createFromTTFDataView = function(view, offset) {
      var maxp;
      view.seek(offset);
      maxp = new MaxpTable();
      maxp.version = view.getFixed();
      maxp.numGlyphs = view.getUshort();
      maxp.maxPoints = view.getUshort();
      maxp.maxContours = view.getUshort();
      maxp.maxCompositPoints = view.getUshort();
      maxp.maxCompositContours = view.getUshort();
      maxp.maxZones = view.getUshort();
      maxp.maxTwilightPoints = view.getUshort();
      maxp.maxStorage = view.getUshort();
      maxp.maxFunctionDefs = view.getUshort();
      maxp.maxInstructionDefs = view.getUshort();
      maxp.maxStackElements = view.getUshort();
      maxp.maxSizeOfInstructions = view.getUshort();
      maxp.maxComponentElements = view.getUshort();
      maxp.maxComponentDepth = view.getUshort();
      return maxp;
    };

    return MaxpTable;

  })();


  /*
  exports
  */


  ttfjs = {
    TrueType: TrueType,
    TTFDataView: TTFDataView,
    table: {
      HeadTable: HeadTable,
      LocaTable: LocaTable,
      MaxpTable: MaxpTable,
      GlyfTable: GlyfTable,
      HheaTable: HheaTable,
      HmtxTable: HmtxTable
    },
    glyph: {
      SimpleGlyphData: SimpleGlyphData,
      CompositeGlyphData: CompositeGlyphData
    }
  };

  if (typeof module !== 'undefined') {
    module.exports = ttfjs;
  } else {
    this.ttfjs = ttfjs;
  }

}).call(this);
