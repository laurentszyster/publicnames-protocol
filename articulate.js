/* articulate.js

Articulate Public Names from Text using regular expression stacks.

	pns.language.ascii.articulate("Chapter 1 - An Unexpected Journey");
	pns.language.en.names("Constitution of the United States of America - Article IV");
	pns.language.fr.texts(
		"Avant donc que d'écrire, apprenez à penser \
		Ce que l'on conçoit bien s'énonce clairement, \
		Et les mots pour le dire arrivent aisément. \
		Hâtez-vous lentement, et sans perdre courage, \
		Vingt fois sur le métier remettez votre ouvrage, \
		Polissez-le sans cesse, et le repolissez, \
		Ajoutez quelquefois, et souvent effacez."
		);

Different languages require different articulators. This module provides
a generic algorithm for stacks of regular expressions. Some languages, like
a ISO date format or mathematic notations, may demand their own algorithm.

	.articulate("Public Names") -> new PublicNames("6:Names,5:Public,")
	.names("Public Names") -> ["Public", "Names"]
	.texts("Public Names") -> {"6:Names,5:Public,": "Public Names"}
		
Depends on netunicodes, pnsValidate, pnsValidate and PublicNames.

*/

function pnsArticulator (words) {
    return new RegExp('(?:^|\\s+)((?:' + words.join (')|(?:') + '))(?:$|\\s+)');
}

function pnsArticulate (text, articulators, depth, horizon, chunks, chunk) {
    var i, L, texts, articulated, subject;
    var bottom = articulators.length;
    while (true) {
        texts = text.split(articulators[depth]); 
		depth++;
        if (texts.length > 1) {
            articulated = [];
            for (i=0, L=texts.length; i<L; i++) {
                if (texts[i].length > 0) {
					articulated.push(texts[i]);
				}
			}
            L=articulated.length;
            if (L > 1) {
				break; 
			} else if (L === 1) {
                text = articulated[0];
			}
        } else if (texts.length === 1 && texts[0].length > 0) {
            text = texts[0];
        } 
		if (depth == bottom) {
            return [text];
		}
    }
    if (depth < bottom) {
        if (chunk > 0) {
            var n, sat, field = {'': 0};
            for (i=0; i<L; i++) {
                text = articulated[i];
                if (text.length > chunk) {
                    pnsArticulate(text, articulators, depth, horizon, chunks, chunk);
                } else {
                    n = pnsArticulate(text, articulators, depth, horizon), 
                    sat = pnsValidate (n, {'': 0}, horizon);
                    if (sat != undefined) {
						chunks.push([sat, text]);
					}
                } 
            } 
			return chunks;
        } else {
            var n, sat, names = [], field = {'': 0}; 
            for (i=0; i<L; i++) {
				n = pnsArticulate (articulated[i], articulators, depth, horizon);
                sat = pnsValidate (n, field, horizon);
                if (sat != undefined) {
					names.push (sat);
				}
            }
            return names;
        }
    } else {
        return articulated;
	}
}

function Articulator (tokenizers, chunk) {
	this.tokenizers = tokenizers;
	this.chunk = chunk ? 132: chunk;
}
Articulator.prototype.articulate = function (text) { 
	var names = pnsArticulate(text, this.tokenizers, 0, PublicNames.HORIZON);
	if (names.length > 1) {
		names.sort();
		return netunicodes(names);
	} else {
		return names[0];
	}
}
Articulator.prototype.articulateNames = function (text) {
	return pnsArticulate(text, this.tokenizers, 0, PublicNames.HORIZON);
}
Articulator.prototype.articulateTexts = function (texts) {
	return pnsArticulate(texts, this.tokenizers, 0, PublicNames.HORIZON, [], this.chunk);
}
Articulator.ascii = new Articulator([
	/\s*[?!.](?:\s+|$)/, // point, split sentences
	/\s*[:;](?:\s+|$)/, // split head from sequence
	/\s*,(?:\s+|$)/, // split the sentence articulations
	/(?:(?:^|\s+)[({\[]+\s*)|(?:\s*[})\]]+(?:$|\s+))/, // parentheses
	/\s+[-]+\s+/, // disgression
	/["]/, // citation
	/((?:(?:[A-Z]+[\S]*)(?:$|\s*))+)/, // private names
	/\s+/, // white spaces
	/['\\\/*+\-#]/ // common hyphens
	]);
