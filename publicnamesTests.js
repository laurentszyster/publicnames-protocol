PublicNames.test  = (function () {

var test = new Test() ;
test.expect(
	function (test) { return netunicode("Public", []).join('') ; }, "6:Public," 
	) ;
test.expect(
	function (test) { return netunicode("Names", []).join('') ; }, "5:Names,"
	) ;
test.expect(
	function (test) { return netunicodes(["Public", "Names"]) ; }, "6:Public,5:Names,"
	) ;
test.expect(
	function (test) { return netunicodes(["5:Names,6:Public,", "The"]) ; },
	"17:5:Names,6:Public,,3:The,"
	) ;
test.expect(
	function (test) { return netunidecodes("6:Public,5:Names,") ; }, 
	["Public", "Names"]
	) ;
test.expect(
	function (test) { return netunidecodes("6:Public,5:Names,", [], false) ; }, 
	["Public", "Names"]
	) ;
test.expect(
	function (test) { return netunidecodes("6:Public,5:Names,", [], true) ; }, 
	["Public", "Names"]
	) ;
test.expect(
	function (test) { return netunidecodes("6:Public,5:Names,xxx", [], false) ; }, 
	["Public", "Names"]
	) ;
test.expect(
	function (test) { return netunidecodes("6:Public,5:Names,xxx", [], true) ; }, 
	["Public", "Names"]
	) ;
test.expect(
	function (test) { return netunidecodes("17:5:Names,6:Public,,3:The,") ; },
	["5:Names,6:Public,", "The"]
	) ;
test.expect(
	function (test) { return pnsEncode(["Public", "Names"], {}) ; }, 
	"5:Names,6:Public,"
	) ;
test.expect(
	function (test) { return pnsEncode([["Public", "Names"], "The"], {}) ; }, 
	"17:5:Names,6:Public,,3:The,"
	) ;
test.expect(
	function (test) { 
		return pnsValidate(netunidecodes("5:Names,6:Public,"), {'':0}, 2) ; 
	}, 
	"5:Names,6:Public,"
	) ;
test.expect(
	function (test) {
		var field =  {'':0} ;
		pnsValidate(netunidecodes("5:Names,6:Public,"), field, 2) ; 	
		return field ;
	}, 
	{ "": 2, "Names": true, "Public": true }
	) ;
test.expect(
	function (test) {
		return pnsValidate(netunidecodes("5:Names,6:Public,3:The,"), {'':1,'The': true}, 3) ; 	
	}, 
	"5:Names,6:Public,"
	) ;
test.expect(
	function (test) {
		return pnsValidate(netunidecodes("5:Names,6:Public,3:The,"), {'':0}, 2) ; 	
	}, 
	null
	) ;
test.expect(
	function (test) {
		return pnsValidate(netunidecodes("17:5:Names,6:Public,,3:The,"), {'':0}, 3) ; 	
	}, 
	null
	) ;
test.expect(
	function (test) {
		return pnsValidate(netunidecodes("17:5:Names,6:Public,,3:The,"), {'':0}, 4) ; 	
	}, 
	"17:5:Names,6:Public,,3:The,"
	) ;
test.expect(
	function (test) {
		var outline = [] ;
		pnsValidateAndOutline(netunidecodes("17:5:Names,6:Public,,3:The,"), outline, {'':0}, 4) ; 
		return outline ;
	}, 
	[["Names","Public"],"The"]
	) ;
return test;

})() ;

$.ready(function () {
	$$("#articulate").on("blur", function articulate (event) {
		$("articulated").innerText = PublicNames.articulate(this.value, "SAT", 24);
	});
	$$("#articulateTexts").on("blur", function articulateTexts (event) {
		$("articulated").innerText = PublicNames.articulateTexts(this.value, "SAT", 32, 256).join("\n");
	});
});