(function ($) {
  "use strict";

  var settings = window.eresCheckout || {};

  function isDeliveryChosen() {
    var $chosen = $('input[name="shipping_method[0]"]:checked');
    return $chosen.length > 0 && String($chosen.val()).indexOf(settings.pickupMethod) !== 0;
  }

  function syncDeliveryAddress() {
    $("[data-eres-delivery-address]").prop("hidden", !isDeliveryChosen());
  }

  function showCouponMessage($coupon, noticesHtml) {
    var $notices = $("<div>").html(noticesHtml);
    var text = $.trim($notices.text());
    $coupon
      .find(".eres-coupon__message")
      .text(text)
      .toggleClass("eres-coupon__message--error", $notices.find(".woocommerce-error, .is-error").length > 0)
      .prop("hidden", text === "");
  }

  function applyCoupon() {
    var $coupon = $("[data-eres-coupon]");
    var $input = $coupon.find("#eres-coupon-code");
    var $button = $coupon.find(".eres-coupon__apply");
    var code = $.trim($input.val());
    if (code === "") {
      $input.trigger("focus");
      return;
    }

    $button.prop("disabled", true);
    $.post(wc_checkout_params.wc_ajax_url.toString().replace("%%endpoint%%", "apply_coupon"), {
      security: wc_checkout_params.apply_coupon_nonce,
      coupon_code: code,
      billing_email: $("#billing_email").val()
    })
      .done(function (noticesHtml) {
        showCouponMessage($coupon, noticesHtml);
        $(document.body)
          .trigger("applied_coupon_in_checkout", [code])
          .trigger("update_checkout", { update_shipping_method: false });
      })
      .always(function () {
        $button.prop("disabled", false);
      });
  }

  var VALIDATED_FIELDS = "#billing_phone, #billing_numero_documento, #billing_address_1";
  var PHONE_SEPARATORS = /[\s\-()]/g;

  function fieldErrorMessage(fieldId, value) {
    var rules = settings.validation;
    if (!rules || value === "") {
      return "";
    }
    if (fieldId === "billing_phone") {
      return new RegExp(rules.phone.pattern).test(value.replace(PHONE_SEPARATORS, "")) ? "" : rules.phone.message;
    }
    if (fieldId === "billing_numero_documento") {
      var documentRule = rules.documents[$("#billing_tipo_documento").val()] || rules.defaultDocument;
      return new RegExp(documentRule.pattern).test(value) ? "" : documentRule.message;
    }
    return value.length >= rules.address.minLength ? "" : rules.address.message;
  }

  function clearFieldError() {
    $(this).closest(".form-row").find(".eres-field-error").remove();
  }

  function validateField() {
    var $input = $(this);
    var $row = $input.closest(".form-row");
    var message = fieldErrorMessage(this.id, $.trim($input.val()));

    $row.find(".eres-field-error").remove();
    if (message === "") {
      return;
    }
    $input.attr("aria-invalid", "true");
    $row.removeClass("woocommerce-validated").addClass("woocommerce-invalid");
    $("<p>", { "class": "eres-field-error", text: message }).appendTo($row);
  }

  function revalidateDocumentNumber() {
    $("#billing_numero_documento").trigger("change");
  }

  function clearAllFieldErrors() {
    $(".eres-field-error").remove();
  }

  function toggleCouponForm() {
    var $toggle = $(this);
    var $form = $("#" + $toggle.attr("aria-controls"));
    var isOpening = $form.prop("hidden");
    $form.prop("hidden", !isOpening);
    $toggle.attr("aria-expanded", String(isOpening));
    if (isOpening) {
      $form.find("input").trigger("focus");
    }
  }

  function applyCouponOnEnter(event) {
    if (event.key !== "Enter") {
      return;
    }
    event.preventDefault();
    applyCoupon();
  }

  $(document.body)
    .on("change", "input.shipping_method", syncDeliveryAddress)
    .on("updated_checkout", syncDeliveryAddress)
    .on("click", ".eres-coupon__toggle", toggleCouponForm)
    .on("click", ".eres-coupon__apply", applyCoupon)
    .on("keydown", "#eres-coupon-code", applyCouponOnEnter)
    .on("focusout change", VALIDATED_FIELDS, validateField)
    .on("input", VALIDATED_FIELDS, clearFieldError)
    .on("change", "#billing_tipo_documento", revalidateDocumentNumber)
    .on("checkout_error", clearAllFieldErrors);

  $(syncDeliveryAddress);
})(jQuery);
