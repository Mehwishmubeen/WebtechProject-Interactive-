$(document).ready(function() {
  $("input[name='payment']").change(function() {
    $("#cardInfo").toggle($("#payCard").is(":checked"));
  });

  $("#checkoutForm").on("submit", function(e) {
    e.preventDefault();
    let valid = true;

    $(".form-control").removeClass("is-invalid is-valid");

    function invalidate(field) {
      field.addClass("is-invalid");
      if (valid) field[0].scrollIntoView({ behavior: "smooth", block: "center" });
      valid = false;
    }

    // Full Name
    let fullName = $("#fullName");
    if (fullName.val().trim().length < 3) invalidate(fullName); else fullName.addClass("is-valid");

    // Email
    let email = $("#email");
    let emailPattern = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
    if (!emailPattern.test(email.val().trim())) invalidate(email); else email.addClass("is-valid");

    // Phone
    let phone = $("#phone");
    if (!/^\d{10,}$/.test(phone.val().trim())) invalidate(phone); else phone.addClass("is-valid");

    // Address
    let address = $("#address");
    if (!address.val().trim()) invalidate(address); else address.addClass("is-valid");

    // City
    let city = $("#city");
    if (!city.val().trim()) invalidate(city); else city.addClass("is-valid");

    // Postal
    let postal = $("#postal");
    if (!/^\d{4,6}$/.test(postal.val().trim())) invalidate(postal); else postal.addClass("is-valid");

    // Country
    let country = $("#country");
    if (country.val() === "") invalidate(country); else country.addClass("is-valid");

    // Payment
    let payment = $("input[name='payment']:checked").val();
    if (!payment) {
      alert("Select payment method.");
      valid = false;
    }

    // Card fields
    if (payment === "card") {
      $("#cardInfo input").each(function() {
        if (!$(this).val().trim()) invalidate($(this));
        else $(this).addClass("is-valid");
      });
    }

    // Terms
    if (!$("#termsCheck").is(":checked")) {
      $("#termsError").show();
      valid = false;
      $("#termsCheck")[0].scrollIntoView({ behavior: "smooth", block: "center" });
    } else {
      $("#termsError").hide();
    }

    if (valid) {
      alert("Order placed successfully!");
      this.reset();
      $(".is-valid").removeClass("is-valid");
      $("#cardInfo").hide();
    }
  });
});
