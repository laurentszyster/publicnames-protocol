/* Copyright (C) 2007-2013 Laurent A.V. Szyster

This library is free software; you can redistribute it and/or modify
it under the terms of version 2 of the GNU General Public License as
published by the Free Software Foundation.

    http://www.gnu.org/copyleft/gpl.html

This library is distributed in the hope that it will be useful, but
WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.

You should have received a copy of the GNU General Public License
along with this library; if not, write to the Free Software
Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA 02111-1307 USA */

// Encode, validate and outline Public Names

/* The unicode equivalent of djb's netstring */
function netunicode (s, sb) {
    sb.push(s.length); 
    sb.push(":"); 
    sb.push(s); 
    sb.push(",");
	return sb;
}

/**
 * Encode an array of strings (or anything that be joined) into
 * netunicodes, return a string.
 */
function netunicodes (list) {
    var s, sb = [];
    for (var i=0; i < list.length; i++) {
        s=list[i]; 
        sb.push(s.length); 
        sb.push(":"); 
        sb.push(s); 
        sb.push(",");
    }
    return sb.join('');
}

/**
 * Push in a list the netunicoded strings found in the buffer, eventually
 * stripping empty strings (0:,) if strip is true, returns the extended
 * array or the one created if the list given was null and that at least
 * one netunicoded string was found at the buffer's start.
 */
function netunidecodes (buffer, list, strip) {
    var size = buffer.length;
    var prev = 0;
    var pos, L, next;
    while (prev < size) {
        pos = buffer.indexOf(":", prev);
        if (pos < 1) {
			prev = size; 
		} else {
            L = parseInt(buffer.substring(prev, pos));
            if (isNaN(L)) {
				prev = size; 
			} else {
                next = pos + L + 1;
                if (next >= size) {
					prev = size; 
				} else if (buffer.charAt(next) != ",") {
					prev = size; 
				} else {
					if (list===null) {
						list = [];
					}
					if (strip | next-pos>1) {
						list.push(buffer.substring(pos+1, next));
					}
					prev = next + 1;
                }
            }
        }
    }
    return list;
}

function pnsEncode (item, field) {
    if (typeof item == 'object') {
        var list = [], L=item.length, n;
        if (typeof L == 'undefined') { // Dictionnary ?
			for (var k in item) {
				n = pnsEncode([k, item[k]], field);
				if (n !== null) {
					list.push(n);
				}
			}
        } else { // List
			for (var i=0; i < L; i++) {
				n = pnsEncode(item[i], field);
				if (n !== null) {
					list.push(n);
				}
			}
        }
        L = list.length;
        if (L > 1) {
			list.sort(); 
			return netunicodes(list);
		} else if (L == 1) {
			return list[0];
		} else {
			return null;
		}
    } else {
		item = item.toString(); 
	}
    if (field[item] === null) {
		field[item] = true; 
		return item;
	} else {
		return null;
	}
}

/* validate Public Names in a given field and under a given horizon

returns the validated Public Names or null if beyond the given horizon.

the given field is used to filter out names and updated with new names found.

*/
function pnsValidate (names, field, horizon) {
    var n, s, buffer, valid=[];
    for (var L=names.length, i=0; i<L; i++) {
        buffer = names[i];
        if (buffer.length === 0 || field[buffer] === true) {
			continue;
		}
        n = netunidecodes (buffer, null, true);
        if (n === null) {
            valid.push(buffer); 
            field[buffer] = true; 
            field[''] += 1;
        } else {
            s = pnsValidate (n, field, horizon);
            if (s !== null) {
                valid.push(s); 
                field[s] = true; 
                field[''] += 1;
            }
        }
        if (field[''] > horizon) {
			return null;
		}
    }
    if (valid.length > 1) {
        valid.sort(); 
        return netunicodes(valid);
    }
    if (valid.length > 0) {
        return valid[0];
	}
    return null;
}

/* validate and outline Public Names in a given field and under a given horizon

returns the validated Public Names or null if beyond the given horizon.

the given outline is updated with the articulated names, the given field is used to 
filter out names and updated with new names found.

*/
function pnsValidateAndOutline (names, outline, field, horizon) {
    var n, s, buffer, valid = [];
    for (var L=names.length, i=0; i<L; i++) {
        buffer = names[i];
        if (buffer.length === 0 || field[buffer] === true) {
			continue;
		}
        n = netunidecodes (buffer, null, true);
        if (n === null) {
			outline.push(buffer);
            valid.push(buffer); 
            field[buffer] = true; 
            field[''] += 1;
        } else {
			var o = [];
            s = pnsValidateAndOutline (n, o, field, horizon);
            if (s !== null) {
				if (o.length > 1) {
					outline.push(o);
				} else {
					outline.push(o[0]);
				}
                valid.push(s); 
                field[s] = true; 
                field[''] += 1;
            }
        }
        if (field[''] > horizon) {
			return null;
		}
    }
    if (valid.length > 1) {
        valid.sort();
        return netunicodes(valid);
    }
    if (valid.length > 0) {
        return valid[0];
	}
    return null;
}

function PublicNames (string, horizon) {
	this.outline = [];
	this.field = {'':0};
	if (string) {
		this.encoded = pnsValidateAndOutline(
			netunidecodes(string), this.outline, this.field, horizon || PublicNames.HORIZON
			);
	}
}
PublicNames.HORIZON = 30;
PublicNames.index = function (encoded) {
	var names = netunidecodes(encoded);
	if (names && names.length > 1) {
		var name, index;
		for (var i=0, L=names.length; i<L; i++) {
			name = names[i];
			index = localStorage[name];
			if (typeof index == 'string') {
				localStorage[name] = pnsValidate(netunicodes([index, encoded]), {'': 0}, PublicNames.HORIZON);
				// nullify the index when it is over the user's semantic horizon. To the search process a name is 
				// no longer relevant when it has been associated with too many other names in the user's metabase. 
				// Either meaningfull articulations are relevant but well known and hence not searched for 
				// (programmers don't search for "database", they search for "SQL databases" or "SQLite database"), 
				// or the name articulated is meaningless alone even out of the user's context, like a number in a 
				// language (nobody searches for "The" but some will look successfully for "The Big" and all will 
				// find what topic "The Big Sleep" is related to).
			} else if (typeof index == 'undefined') {
				localStorage[name] = encoded;
				PublicNames.index(name);
			}
		}
	}
};