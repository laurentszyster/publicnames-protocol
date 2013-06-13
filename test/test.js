test('netunicode', function () { 
	equal(netunicode("Public", []).join(''), "6:Public,");
	equal(netunicode("Names", []).join(''), "5:Names,");
});
test('netunicodes', function () { 
	equal(netunicodes(["Public", "Names"]), "6:Public,5:Names,");
	equal(
		netunicodes(["5:Names,6:Public,", "The"]),
		"17:5:Names,6:Public,,3:The,"
		);
});
test('netunidecodes', function () { 
	deepEqual(
		netunidecodes("6:Public,5:Names,"), 
		["Public", "Names"]
		);
	deepEqual(
		netunidecodes("6:Public,5:Names,", [], false), 
		["Public", "Names"]
		);
	deepEqual(
		netunidecodes("6:Public,5:Names,", [], true), 
		["Public", "Names"]
		);
	deepEqual(
		netunidecodes("6:Public,5:Names,xxx", [], false), 
		["Public", "Names"]
		);
	deepEqual(
		netunidecodes("6:Public,5:Names,xxx", [], true), 
		["Public", "Names"]
		);
	deepEqual(
		netunidecodes("17:5:Names,6:Public,,3:The,"),
		["5:Names,6:Public,", "The"]
		);
});
test('pnsEncode', function () { 
	equal(
		pnsEncode(["Public", "Names"], {}), 
		"5:Names,6:Public,"
		);
	equal(
		pnsEncode([["Public", "Names"], "The"], {}), 
		"17:5:Names,6:Public,,3:The,"
		);
});
test('pnsValidate', function () { 
	equal(
		pnsValidate(netunidecodes("5:Names,6:Public,"), {'':0}, 2), 
		"5:Names,6:Public,"
		);
	var field =  {'':0};
	pnsValidate(netunidecodes("5:Names,6:Public,"), field, 2); 	
	deepEqual(field, { "": 2, "Names": true, "Public": true });
	equal(
		pnsValidate(netunidecodes("5:Names,6:Public,3:The,"), {'':1,'The': true}, 3), 
		"5:Names,6:Public,"
		);
	strictEqual(
		pnsValidate(netunidecodes("5:Names,6:Public,3:The,"), {'':0}, 2), 
		undefined
		);
	strictEqual(
		pnsValidate(netunidecodes("17:5:Names,6:Public,,3:The,"), {'':0}, 3), 
		undefined
		);
	equal(
		pnsValidate(netunidecodes("17:5:Names,6:Public,,3:The,"), {'':0}, 4), 
		"17:5:Names,6:Public,,3:The,"
		);
});
test('pnsValidateAndOutline', function () { 
	var outline = [] ;
	pnsValidateAndOutline(netunidecodes("17:5:Names,6:Public,,3:The,"), outline, {'':0}, 4) ; 
	deepEqual(outline, [["Names","Public"],"The"]);
});
test('pnsArticulate SAT No chunks', function () {
	function pasn(text) {
		return pnsArticulate(text, Articulator.ascii.tokenizers, 0, PublicNames.HORIZON);
	}
	deepEqual(
		pasn("articulated text"),
		["articulated", "text"]
		);
	deepEqual(
		pasn("articulated text, and then some"),
		["11:articulated,4:text,", "3:and,4:some,4:then,"]
		);
});
test('pnsArticulate SAT Chunk at 132', function () {
	function pasc132(texts) {
		return pnsArticulate(texts, Articulator.ascii.tokenizers, 0, PublicNames.HORIZON, [], 132);
	}
	deepEqual(
		pasc132("It was November. Although it was not yet late, the sky was dark when I turned into Laundress Passage. Father had finished for the day, switched off the shop lights and closed the shutters; but so I would not come home to darkness he had left on the light over the stairs to the flat. Through the glass in the door it cast a foolscap rectangle of paleness onto the wet pavement, and it was while I was standing in that rectangle, about to turn my key in the door, that I first saw the letter. Another white rectangle, it was on the fifth step from the bottom, where I couldn't miss it."),
		[["2:It,8:November,3:was,","It was November"],["80:26:4:dark,3:sky,3:the,4:when,,16:4:into,6:turned,,22:9:Laundress,7:Passage,,1:I,,45:30:2:it,4:late,3:not,3:was,3:yet,,8:Although,,","Although it was not yet late, the sky was dark when I turned into Laundress Passage"],["48:35:3:day,8:finished,3:for,3:had,3:the,,6:Father,,59:3:and,6:closed,6:lights,3:off,4:shop,8:shutters,8:switched,,","Father had finished for the day, switched off the shop lights and closed the shutters"],["11:3:but,2:so,,104:4:come,8:darkness,4:flat,3:had,2:he,4:home,4:left,5:light,3:not,2:on,4:over,6:stairs,3:the,2:to,5:would,,1:I,","but so I would not come home to darkness he had left on the light over the stairs to the flat"],["105:1:a,4:cast,4:door,8:foolscap,5:glass,2:in,2:it,2:of,4:onto,8:paleness,8:pavement,9:rectangle,3:the,3:wet,,7:Through,","Through the glass in the door it cast a foolscap rectangle of paleness onto the wet pavement"],["35:2:in,9:rectangle,8:standing,4:that,,25:3:and,2:it,3:was,5:while,,1:I,","and it was while I was standing in that rectangle"],["5:about,4:door,2:in,3:key,2:my,3:the,2:to,4:turn,","about to turn my key in the door"],["29:5:first,6:letter,3:saw,3:the,,1:I,4:that,","that I first saw the letter"],["34:20:9:rectangle,5:white,,7:Another,,40:24:13:6:couldn,1:t,,4:miss,,1:I,5:where,,53:6:bottom,5:fifth,4:from,2:it,2:on,4:step,3:the,3:was,,","Another white rectangle, it was on the fifth step from the bottom, where I couldn't miss it"]]
	);
});
