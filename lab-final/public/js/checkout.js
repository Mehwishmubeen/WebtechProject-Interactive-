
$(document).ready(function(){


  $("input[name='payment']").change(function(){
    if($("#payCard").is(":checked")){
      $("#cardInfo").slideDown();
    } else {
      $("#cardInfo").slideUp();
      $("#cardInfo input").val("").removeClass("is-valid is-invalid");
    }
  });

  $("#checkoutForm").on("submit", async function(e){
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

    try {
      const items = JSON.parse(localStorage.getItem("cartItems") || "[]");
      const payload = {
        customerName: $("#name").val(),
        email: $("#email").val(),
        items
      };
      const resp = await fetch("/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await resp.json();
      if (!resp.ok || !data?.orderId) {
        alert(data?.error || "Failed to place order");
        return;
      }
      // Clear client cart and redirect to confirmation
      localStorage.removeItem("cartItems");
      window.dispatchEvent(new Event("cart:updated"));
      window.location.href = `/order/confirmation/${data.orderId}`;
    } catch (err) {
      alert("Unexpected error: " + err.message);
    }
  });

});
