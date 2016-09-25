$("#img-size").slider();
var itm = "";

function imgSliderEnable(){
	itm = $(".item");
	$("#img-size").slider("enable");
}

$("#img-size").on("change", function(Evt) {
	var i;
	for (i = 0; i < itm.length; i++) {
	    itm[i].style.maxWidth=Evt.value.newValue+"px";
	}
});