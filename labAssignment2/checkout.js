
$(document).ready(function(){

  // Show/hide card info
  $("input[name='payment']").change(function(){
    if($("#payCard").is(":checked")){
      $("#cardInfo").slideDown();
    } else {
      $("#cardInfo").slideUp();
      $("#cardInfo input").val("").removeClass("is-valid is-invalid");
    }
  });

  $("#checkoutForm").on("submit", function(e){
    e.preventDefault();
    let valid = true;

    function check(id, condition){
      const field = $(id);
      if(condition){
        field.removeClass("is-invalid").addClass("is-valid");
      } else {
        field.removeClass("is-valid").addClass("is-invalid");
        valid = false;
      }
    }

    check("#name", $("#name").val().length >= 3);
    check("#email", /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test($("#email").val()));
    check("#phone", /^[0-9]{10,}$/.test($("#phone").val()));
    check("#address", $("#address").val() !== "");
    check("#city", $("#city").val() !== "");
    check("#postal", /^[0-9]{4,6}$/.test($("#postal").val()));
    check("#country", $("#country").val() !== "");

    if(!$("input[name='payment']:checked").length){
      alert("Select a payment method");
      valid = false;
    }

    if($("#payCard").is(":checked")){
      check("#cardName", $("#cardName").val() !== "");
      check("#cardNumber", /^[0-9]{16}$/.test($("#cardNumber").val().replace(/-/g,"")));
      check("#expiry", /^[0-9]{2}\/[0-9]{2}$/.test($("#expiry").val()));
      check("#cvv", /^[0-9]{3}$/.test($("#cvv").val()));
    }

    if(!$("#termsCheck").is(":checked")){
      $("#termsError").show();
      valid = false;
    } else $("#termsError").hide();

    if(!valid){
      $("html, body").animate({
        scrollTop: $(".is-invalid:first").offset().top - 120
      }, 600);
      return;
    }

    alert("✅ Order placed successfully!");
  });

});
