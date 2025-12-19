
// Handle checkout form submission and validation
$(document).ready(function(){

  $("#checkoutForm").on("submit", async function(e){
    e.preventDefault();
    let valid = true;

    // Helper to validate fields and show error styling
    function check(id, condition){
      const field = $(id);
      if(condition){
        field.removeClass("is-invalid").addClass("is-valid");
      } else {
        field.removeClass("is-valid").addClass("is-invalid");
        valid = false;
      }
    }

    // Validate name (at least 3 characters) and email format
    check("#name", $("#name").val().length >= 3);
    check("#email", /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test($("#email").val()));

    // If validation failed, scroll to first error
    if(!valid){
      $("html, body").animate({
        scrollTop: $(".is-invalid:first").offset().top - 120
      }, 600);
      return;
    }

    try {
      // Get cart items from localStorage
      const items = JSON.parse(localStorage.getItem("cartItems") || "[]");
      const payload = {
        customerName: $("#name").val(),
        email: $("#email").val(),
        items
      };
      // Send order to server
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
      // Order successful - clear cart and go to confirmation page
      localStorage.removeItem("cartItems");
      window.dispatchEvent(new Event("cart:updated"));
      window.location.href = `/order/confirmation/${data.orderId}`;
    } catch (err) {
      alert("Unexpected error: " + err.message);
    }
  });

});
