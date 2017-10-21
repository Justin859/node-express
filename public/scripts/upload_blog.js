$(document).ready(function(){

    $("#img_src").change(function(e){
        if($(e.target).val() !== "") {
        $("#img_src2").prop('disabled', false);
        } else {
        $("#img_src2").prop('disabled', true);
        }
    });
    $("#img_src2").change(function(e){
        if($(e.target).val() !== "") {
        $("#img_src3").prop('disabled', false);
        } else {
        $("#img_src3").prop('disabled', true);
        }
    });
    $("#img_src3").change(function(e){
        if($(e.target).val() !== "") {
        $("#img_src4").prop('disabled', false);
        } else {
        $("#img_src4").prop('disabled', true);
        }
    });

})