$("#imgSize").slider();

var itm = "";

function imgSliderEnable(){
	itm = $(".item");
	$("#imgSize").slider("enable");
}

$("#imgSize").on("change", function(Evt) {
	var i;
	for (i = 0; i < itm.length; i++) {
	    itm[i].style.maxWidth=Evt.value.newValue+"px";
	}
});